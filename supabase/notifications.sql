-- Run this once in the Supabase Dashboard → SQL Editor for this project,
-- then re-run push_notifications.sql (its send_push() writes to this table).
--
-- In-app notification inbox. Every notification send_push() sends (schedule
-- reminders, community messages, announcements) also lands here, one row per
-- recipient — even for users without a push subscription — so it can be read
-- later from Notifications in the header's 3-dot menu (src/screens/InboxScreen.jsx).
--
-- Rows are only kept for 3 days: a daily pg_cron job deletes anything older,
-- so the table never grows beyond a few days of traffic.

create table if not exists public.notifications (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null default '',
  url text not null default '/',
  tag text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx on public.notifications (user_id, created_at desc);
create index if not exists notifications_created_idx on public.notifications (created_at);

alter table public.notifications enable row level security;

-- Rows are only ever inserted by send_push() (security definer), so users get
-- no insert policy — just read, mark as read, and delete their own.
drop policy if exists "Users read their own notifications" on public.notifications;
create policy "Users read their own notifications"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users mark their own notifications read" on public.notifications;
create policy "Users mark their own notifications read"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users delete their own notifications" on public.notifications;
create policy "Users delete their own notifications"
  on public.notifications for delete
  to authenticated
  using (user_id = auth.uid());

-- Live unread badge in the app header.
do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null;
end $$;

-- ── Cleanup: delete notifications older than 3 days, daily at 03:00 UTC ──
select cron.unschedule(jobid) from cron.job where jobname = 'notifications-cleanup';
select cron.schedule('notifications-cleanup', '0 3 * * *', $$delete from public.notifications where created_at < now() - interval '3 days'$$);
