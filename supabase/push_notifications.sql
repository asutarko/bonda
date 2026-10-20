-- Run this once in the Supabase Dashboard → SQL Editor for this project,
-- after push_subscriptions.sql.
--
-- Push notifications sent from the database itself, through the send-push
-- Edge Function (supabase/functions/send-push):
--   1. Schedule reminders — every minute, pg_cron sends one for each
--      schedule item that starts now, in the device's own timezone.
--   2. Community messages — a trigger on public.messages notifies the other
--      DM participant, or every other member of the group/room.
--   3. Announcements — an admin inserts a row into public.announcements
--      (admin app or Table Editor) and it goes out to everyone, or to
--      target_user_ids only.
--
-- Each user can switch 1 and 2 off (profiles.push_schedule / push_messages,
-- the toggles under Profile → Notifications). Announcements always go out.
--
-- The Edge Function is called with a shared secret (x-push-secret) kept in
-- Vault as 'push_internal_secret' and as the function secret
-- PUSH_INTERNAL_SECRET — see the send-push README for creating it.

-- ── Preferences + device timezone ────────────────────────────────────────
alter table public.profiles add column if not exists push_schedule boolean not null default true;
alter table public.profiles add column if not exists push_messages boolean not null default true;
alter table public.push_subscriptions add column if not exists timezone text not null default 'Asia/Singapore';

-- ── send_push(): the one place that calls the Edge Function ──────────────
-- Fire-and-forget (pg_net is async), so a slow push never holds up the
-- insert or cron run that triggered it. Only users who actually have a
-- subscription are passed on. Not callable from the app (execute revoked).
create or replace function public.send_push(p_user_ids uuid[], p_title text, p_body text, p_url text default '/', p_tag text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_secret text;
  v_targets uuid[];
begin
  select array_agg(distinct s.user_id) into v_targets
  from public.push_subscriptions s
  where s.user_id = any(p_user_ids);
  if v_targets is null then return; end if;

  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'push_internal_secret';
  if v_secret is null then
    raise warning 'send_push: vault secret push_internal_secret is missing';
    return;
  end if;

  perform net.http_post(
    url := 'https://wbhhaajfvanskhwyezds.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', v_secret),
    body := jsonb_build_object('user_ids', to_jsonb(v_targets), 'title', p_title, 'body', p_body, 'url', p_url, 'tag', p_tag),
    timeout_milliseconds := 10000
  );
end;
$$;

revoke all on function public.send_push(uuid[], text, text, text, text) from public, anon, authenticated;

-- ── 1. Schedule reminders ────────────────────────────────────────────────
-- Mirrors the app: an empty schedule_items shows DEFAULT_SCHEDULE (src/data.js),
-- and an item applies today unless it has a non-empty, non-full `days` list
-- (0=Sun..6=Sat) that doesn't include today (appliesToday in ScheduleScreen).
create or replace function public.push_schedule_reminders()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_default jsonb := '[
    {"id":"s1","emoji":"🌅","label":"Wake Up","time":"07:00"},
    {"id":"s2","emoji":"🍳","label":"Breakfast","time":"07:30"},
    {"id":"s3","emoji":"🦷","label":"Brush Teeth","time":"08:00"},
    {"id":"s4","emoji":"🎨","label":"Activity Time","time":"09:00"},
    {"id":"s5","emoji":"🥗","label":"Lunch","time":"12:00"},
    {"id":"s6","emoji":"😴","label":"Rest Time","time":"13:00"}
  ]';
begin
  for r in
    select c.id as child_id, c.user_id, c.name as child_name,
           it->>'id' as item_id, it->>'label' as label, coalesce(it->>'emoji', '') as emoji
    from public.children c
    join public.profiles p on p.id = c.user_id and p.push_schedule
    join lateral (select distinct s.timezone from public.push_subscriptions s where s.user_id = c.user_id) tz on true
    cross join lateral jsonb_array_elements(
      case when jsonb_typeof(c.schedule_items) = 'array' and jsonb_array_length(c.schedule_items) > 0
           then c.schedule_items else v_default end
    ) it
    where c.active is not false
      and it->>'time' = to_char(now() at time zone tz.timezone, 'HH24:MI')
      and (
        jsonb_typeof(it->'days') is distinct from 'array'
        or jsonb_array_length(it->'days') in (0, 7)
        or (it->'days') @> to_jsonb(extract(dow from now() at time zone tz.timezone)::int)
      )
  loop
    perform public.send_push(
      array[r.user_id],
      trim(r.emoji || ' ' || r.label),
      'Time for ' || r.label || ' — ' || r.child_name,
      '/',
      'schedule_' || r.child_id || '_' || r.item_id
    );
  end loop;
end;
$$;

revoke all on function public.push_schedule_reminders() from public, anon, authenticated;

select cron.unschedule(jobid) from cron.job where jobname = 'push-schedule-reminders';
select cron.schedule('push-schedule-reminders', '* * * * *', 'select public.push_schedule_reminders()');

-- ── 2. Community messages ────────────────────────────────────────────────
-- Room keys: "dm_<uuid>_<uuid>" for DMs, "room_<id>" for both admin rooms
-- (community_room_members) and parent groups (community_group_members).
-- Any error is swallowed — a failed push must never block sending a message.
create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recipients uuid[];
  v_room_id uuid;
  v_title text;
begin
  if new.room like 'dm\_%' then
    select array_agg(u) into v_recipients
    from (select (regexp_matches(new.room, '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', 'g'))[1]::uuid as u) x
    where u <> new.author_id;
    v_title := new.author_name;
  elsif new.room like 'room\_%' then
    v_room_id := substring(new.room from 6)::uuid;
    select array_agg(distinct m.user_id) into v_recipients
    from (
      select user_id from public.community_room_members where room_id = v_room_id
      union
      select user_id from public.community_group_members where group_id = v_room_id
    ) m
    where m.user_id <> new.author_id;
    v_title := new.author_name || ' · ' || coalesce(
      (select label from public.community_rooms where id = v_room_id),
      (select name from public.community_groups where id = v_room_id),
      'Community'
    );
  else
    return new;
  end if;

  select array_agg(p.id) into v_recipients
  from public.profiles p
  where p.id = any(v_recipients) and p.push_messages;

  if v_recipients is not null then
    perform public.send_push(
      v_recipients,
      v_title,
      left(coalesce(nullif(trim(new.text), ''), '📎 Sent an attachment'), 140),
      '/',
      new.room
    );
  end if;
  return new;
exception when others then
  raise warning 'notify_new_message failed: %', sqlerrm;
  return new;
end;
$$;

drop trigger if exists messages_push_notify on public.messages;
create trigger messages_push_notify
  after insert on public.messages
  for each row execute function public.notify_new_message();

-- ── 3. Announcements ─────────────────────────────────────────────────────
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  url text not null default '/',
  target_user_ids uuid[],            -- null = everyone
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

drop policy if exists "Admins manage announcements" on public.announcements;
create policy "Admins manage announcements"
  on public.announcements for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create or replace function public.notify_announcement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.send_push(
    coalesce(new.target_user_ids, (select array_agg(distinct user_id) from public.push_subscriptions)),
    new.title,
    new.body,
    new.url,
    'announcement_' || new.id
  );
  return new;
exception when others then
  raise warning 'notify_announcement failed: %', sqlerrm;
  return new;
end;
$$;

drop trigger if exists announcements_push_notify on public.announcements;
create trigger announcements_push_notify
  after insert on public.announcements
  for each row execute function public.notify_announcement();
