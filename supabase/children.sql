-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- It creates a "children" table that stores each parent's child profiles,
-- linked to the logged-in user via user_id, so data syncs across devices
-- and stays private to its owner.

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  emoji text not null default 'none',
  age text not null default '',
  caregiver_type text not null default 'biological',
  caregiver_label text not null default '',
  schedule_items jsonb not null default '[]'::jsonb,
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Adds the column to a table created before "Other Caregiver" required a label.
alter table public.children add column if not exists caregiver_label text not null default '';

create index if not exists children_user_id_idx on public.children (user_id);

alter table public.children enable row level security;

-- A user can only see, create, edit, or delete their own children's profiles.
drop policy if exists "Users can view their own children" on public.children;
create policy "Users can view their own children"
  on public.children for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own children" on public.children;
create policy "Users can insert their own children"
  on public.children for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own children" on public.children;
create policy "Users can update their own children"
  on public.children for update
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own children" on public.children;
create policy "Users can delete their own children"
  on public.children for delete
  to authenticated
  using (auth.uid() = user_id);
