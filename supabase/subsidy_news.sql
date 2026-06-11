-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds a "Subsidy News" feed for the Subsidies & Aid screen, manageable
-- from the app by admins (role = 'admin' on public.profiles).

create table if not exists public.subsidy_news (
  id uuid primary key default gen_random_uuid(),
  scheme text not null,
  headline text not null,
  is_new boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.subsidy_news enable row level security;

drop policy if exists "Subsidy news is viewable by authenticated users" on public.subsidy_news;
create policy "Subsidy news is viewable by authenticated users"
  on public.subsidy_news for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage subsidy news" on public.subsidy_news;
create policy "Admins can manage subsidy news"
  on public.subsidy_news for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
