-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Web Push subscriptions (one row per browser/device a user turned
-- notifications on for). Read by the send-push Edge Function, which uses the
-- service role and so bypasses RLS; users can only see and manage their own.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Users manage their own push subscriptions" on public.push_subscriptions;
create policy "Users manage their own push subscriptions"
  on public.push_subscriptions for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
