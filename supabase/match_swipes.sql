-- Run this once in the Supabase Dashboard → SQL Editor for this project,
-- after pro_matches.sql, profiles_session_fee_allow_zero.sql and
-- children_add_name_parts.sql.
--
-- Swipe matching between a child (swiped for by their parent) and a
-- professional (doctor / therapist / psychologist), in the style of Tinder or
-- Coffee Meets Bagel:
--
--   • The parent swipes through professionals on behalf of one child.
--   • The professional swipes through child profiles whose parent opted in
--     (children.open_to_match).
--   • When both sides like each other, a row in pro_matches becomes
--     'matched' (same table and same payment / commission flow as the
--     "Say hello" request in pro_matches.sql). pro_matches.child_id records
--     which child the match is for.
--
-- Privacy: professionals never read the children table. The deck function
-- below hands them only a first name, an age, gender, diagnosis, verbal
-- status, triggers and therapy needs, plus the parent's country, and only for
-- children whose parent turned on open_to_match. Photos, surnames, therapy
-- notes and medical details (allergies, medication) are never shared.
--
-- Users never write match_swipes directly: every swipe goes through
-- public.swipe(), which checks who is allowed to swipe for what.
--
-- Caregivers: a child whose profile was added by an "Other Caregiver"
-- (children.caregiver_type = 'other': nanny, aunt / uncle, neighbour, …) is
-- never shown to professionals, since only a parent may share it. The
-- caregiver can still swipe through professionals, but it's one-way: a right
-- swipe sends a "Say hello" request (pro_matches status 'requested', same as
-- request_pro_match), which the professional accepts or declines with
-- respond_pro_match.
--
-- Safe to re-run: every statement is idempotent.

-- ── Parent opt-in, per child ──────────────────────────────────────────────
alter table public.children add column if not exists open_to_match boolean not null default false;
update public.children set open_to_match = false where caregiver_type = 'other' and open_to_match;

-- ── Which child a match is for (null for plain "Say hello" matches) ───────
alter table public.pro_matches add column if not exists child_id uuid references public.children (id) on delete set null;

-- ── Swipes ────────────────────────────────────────────────────────────────
create table if not exists public.match_swipes (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  pro_id uuid not null references auth.users (id) on delete cascade,
  parent_id uuid not null references auth.users (id) on delete cascade,
  side text not null check (side in ('parent', 'pro')),   -- who swiped
  liked boolean not null,
  created_at timestamptz not null default now(),
  unique (child_id, pro_id, side),
  check (pro_id <> parent_id)
);

create index if not exists match_swipes_pro_idx on public.match_swipes (pro_id, side);
create index if not exists match_swipes_child_idx on public.match_swipes (child_id, side);

alter table public.match_swipes enable row level security;

-- Each user can read only their own swipes, never the other side's.
drop policy if exists "Users read their own swipes" on public.match_swipes;
create policy "Users read their own swipes"
  on public.match_swipes for select
  to authenticated
  using ((side = 'parent' and parent_id = auth.uid()) or (side = 'pro' and pro_id = auth.uid()));

-- ── Parent's deck: professionals to swipe on for one child ────────────────
create or replace function public.swipe_deck_for_parent(p_child_id uuid)
returns table (
  id uuid, name text, avatar text, gender text, country text,
  profession text, specialisation text, practice_name text, practice_address text,
  session_fee numeric, work_experience jsonb
)
language plpgsql security definer set search_path = public as $$
declare v_country text;
begin
  if not exists (select 1 from children c where c.id = p_child_id and c.user_id = auth.uid()) then
    raise exception 'Child not found';
  end if;
  select coalesce(pr.country, '') into v_country from profiles pr where pr.id = auth.uid();

  return query
  select p.id, p.name, p.avatar, p.gender, p.country,
         p.profession, p.specialisation, p.practice_name, p.practice_address,
         p.session_fee, p.work_experience
    from profiles p
   where p.account_type = 'professional'
     and p.session_fee is not null
     and p.id <> auth.uid()
     and not exists (select 1 from match_swipes s
                      where s.child_id = p_child_id and s.pro_id = p.id and s.side = 'parent')
     and not exists (select 1 from pro_matches m
                      where m.pro_id = p.id and m.parent_id = auth.uid() and m.status in ('requested', 'matched', 'paid'))
   order by (p.country = v_country) desc,
            -- Professionals who already liked this child come first, so a
            -- match can happen sooner. The card never says so.
            exists (select 1 from match_swipes s
                     where s.child_id = p_child_id and s.pro_id = p.id and s.side = 'pro' and s.liked) desc,
            random()
   limit 50;
end $$;

-- ── Professional's deck: child profiles shared by parents ─────────────────
create or replace function public.swipe_deck_for_pro()
returns table (
  child_id uuid, first_name text, age_label text, gender text, diagnosis text,
  verbal_status text, known_triggers text, therapy_schedule text,
  emoji text, country text, caregiver_type text
)
language plpgsql security definer set search_path = public as $$
declare v_country text;
begin
  select coalesce(pr.country, '') into v_country
    from profiles pr where pr.id = auth.uid() and pr.account_type = 'professional';
  if not found then raise exception 'Only professionals can browse child profiles'; end if;

  return query
  select c.id,
         coalesce(nullif(trim(c.first_name), ''), split_part(trim(c.name), ' ', 1)),
         case when c.dob is not null then
                case when date_part('year', age(c.dob)) >= 1
                     then date_part('year', age(c.dob))::int || ' years'
                     else greatest(date_part('month', age(c.dob))::int, 0) || ' months' end
              else coalesce(c.age, '') end,
         c.gender, c.diagnosis, c.verbal_status, c.known_triggers,
         -- Therapy types only ("Speech & Language Therapy — Tue 4pm at X"
         -- → "Speech & Language Therapy"); the notes stay private.
         (select coalesce(string_agg(distinct nullif(trim(split_part(chunk, ' — ', 1)), ''), ', '), '')
            from unnest(string_to_array(c.therapy_schedule, ';')) as chunk
           where position(' — ' in chunk) > 0),
         case when c.emoji like 'http%' or c.emoji like 'data:%' then 'none' else c.emoji end,
         coalesce(par.country, ''),
         c.caregiver_type
    from children c
    join profiles par on par.id = c.user_id
   where c.open_to_match
     and c.active
     and c.caregiver_type <> 'other'
     and c.user_id <> auth.uid()
     and not exists (select 1 from match_swipes s
                      where s.child_id = c.id and s.pro_id = auth.uid() and s.side = 'pro')
     and not exists (select 1 from pro_matches m
                      where m.pro_id = auth.uid() and m.parent_id = c.user_id and m.status in ('matched', 'paid'))
   order by (par.country = v_country) desc,
            exists (select 1 from match_swipes s
                     where s.child_id = c.id and s.pro_id = auth.uid() and s.side = 'parent' and s.liked) desc,
            random()
   limit 50;
end $$;

-- ── Record a swipe; returns whether it made a match ──────────────────────
-- Parent swiping on a professional for their child: swipe(child, pro, liked).
-- Professional swiping on a child:                  swipe(child, null, liked).
create or replace function public.swipe(p_child_id uuid, p_pro_id uuid, p_liked boolean)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_parent uuid;
  v_pro uuid;
  v_side text;
  v_child_name text;
  v_pro_name text;
  v_fee numeric(10,2);
  v_caregiver boolean;
  v_match public.pro_matches;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;

  select c.user_id, coalesce(nullif(trim(c.first_name), ''), split_part(trim(c.name), ' ', 1)),
         c.caregiver_type = 'other'
    into v_parent, v_child_name, v_caregiver
    from children c where c.id = p_child_id and c.active;
  if v_parent is null then raise exception 'Child not found'; end if;

  if v_parent = auth.uid() then
    v_side := 'parent';
    v_pro := p_pro_id;
    if v_pro is null or not exists (
      select 1 from profiles where id = v_pro and account_type = 'professional' and session_fee is not null
    ) then raise exception 'This professional is not available'; end if;
  else
    v_side := 'pro';
    v_pro := auth.uid();
    if not exists (select 1 from profiles where id = v_pro and account_type = 'professional') then
      raise exception 'Only professionals can swipe on child profiles';
    end if;
    if v_caregiver or not exists (select 1 from children where id = p_child_id and open_to_match) then
      raise exception 'This child profile is not open to matching';
    end if;
  end if;

  insert into match_swipes (child_id, pro_id, parent_id, side, liked)
  values (p_child_id, v_pro, v_parent, v_side, p_liked)
  on conflict (child_id, pro_id, side) do update set liked = excluded.liked, created_at = now();

  -- Caregiver liking a professional → one-way "Say hello" request.
  if v_side = 'parent' and v_caregiver then
    if not p_liked then return jsonb_build_object('matched', false); end if;
    begin
      v_match := request_pro_match(v_pro, 'Hello! I''m a caregiver looking for support for ' || v_child_name || '.');
      update pro_matches set child_id = p_child_id where id = v_match.id;
    exception when others then
      -- Already requested / matched with this professional: nothing new to send.
      return jsonb_build_object('matched', false, 'requested', false);
    end;
    return jsonb_build_object('matched', false, 'requested', true, 'match_id', v_match.id);
  end if;

  if not p_liked or not exists (
    select 1 from match_swipes
     where child_id = p_child_id and pro_id = v_pro and liked
       and side = case when v_side = 'parent' then 'pro' else 'parent' end
  ) then
    return jsonb_build_object('matched', false);
  end if;

  -- Both said yes → match. A pending / declined / cancelled / refunded pair
  -- row is reused, so commission is still charged at most once per pair.
  select session_fee, coalesce(nullif(trim(name), ''), 'Your match') into v_fee, v_pro_name
    from profiles where id = v_pro;

  insert into pro_matches (pro_id, parent_id, child_id, status, session_fee, matched_at)
  values (v_pro, v_parent, p_child_id, 'matched', v_fee, now())
  on conflict (pro_id, parent_id) do update
    set status = 'matched', child_id = excluded.child_id, session_fee = excluded.session_fee,
        matched_at = now(), updated_at = now()
    where pro_matches.status in ('requested', 'declined', 'cancelled', 'refunded')
  returning * into v_match;

  if v_match.id is null then
    select * into v_match from pro_matches where pro_id = v_pro and parent_id = v_parent;
  else
    perform send_push(array[v_parent], 'It''s a match!',
      v_pro_name || ' would like to help ' || v_child_name || '.', '/', 'pro-match-' || v_match.id);
    perform send_push(array[v_pro], 'It''s a match!',
      v_child_name || '''s family said yes to you too.', '/', 'pro-match-' || v_match.id);
  end if;

  return jsonb_build_object('matched', true, 'match_id', v_match.id, 'status', v_match.status);
end $$;

-- ── Matches list for either side ──────────────────────────────────────────
-- Includes pending "Say hello" requests ('requested') so the professional can
-- accept / decline them and the sender can see they're waiting.
create or replace function public.my_swipe_matches()
returns table (
  match_id uuid, status text, matched_at timestamptz, session_fee numeric,
  child_id uuid, child_name text, child_emoji text,
  other_id uuid, other_name text, other_avatar text, other_profession text
)
language sql security definer set search_path = public stable as $$
  select m.id, m.status, m.matched_at, m.session_fee,
         m.child_id,
         coalesce(nullif(trim(c.first_name), ''), split_part(trim(c.name), ' ', 1)),
         case when c.emoji like 'http%' or c.emoji like 'data:%' then 'none' else c.emoji end,
         o.id, o.name,
         o.avatar,
         case when o.account_type = 'professional' then coalesce(nullif(o.specialisation, ''), o.profession) else '' end
    from pro_matches m
    left join children c on c.id = m.child_id
    join profiles o on o.id = case when m.parent_id = auth.uid() then m.pro_id else m.parent_id end
   where auth.uid() in (m.pro_id, m.parent_id)
     and m.status in ('requested', 'matched', 'paid')
   order by (m.status = 'requested') desc, coalesce(m.matched_at, m.requested_at) desc;
$$;

revoke all on function public.swipe_deck_for_parent(uuid) from public, anon;
revoke all on function public.swipe_deck_for_pro() from public, anon;
revoke all on function public.swipe(uuid, uuid, boolean) from public, anon;
revoke all on function public.my_swipe_matches() from public, anon;
grant execute on function public.swipe_deck_for_parent(uuid) to authenticated;
grant execute on function public.swipe_deck_for_pro() to authenticated;
grant execute on function public.swipe(uuid, uuid, boolean) to authenticated;
grant execute on function public.my_swipe_matches() to authenticated;
