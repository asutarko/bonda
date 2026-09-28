-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Personal contacts book (the "Contacts" screen, formerly Support Hotlines):
-- each user keeps their own school, doctor/clinic and therapist contacts.

create table if not exists public.user_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null check (category in ('school', 'doctor', 'therapist')),
  name text not null,
  organisation text not null default '',
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_contacts_user_id_idx on public.user_contacts (user_id);

alter table public.user_contacts enable row level security;

-- A user can only see and manage their own contacts.
drop policy if exists "Users can view their own contacts" on public.user_contacts;
create policy "Users can view their own contacts"
  on public.user_contacts for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own contacts" on public.user_contacts;
create policy "Users can insert their own contacts"
  on public.user_contacts for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own contacts" on public.user_contacts;
create policy "Users can update their own contacts"
  on public.user_contacts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own contacts" on public.user_contacts;
create policy "Users can delete their own contacts"
  on public.user_contacts for delete
  to authenticated
  using (auth.uid() = user_id);
