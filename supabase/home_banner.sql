-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds the green "1 in 150 children..." subsidy awareness banner shown on
-- the Home screen, manageable from the app by admins (role = 'admin' on public.profiles).
-- Regular users can only view.

create table if not exists public.home_banner (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.home_banner enable row level security;

drop policy if exists "Home banner is viewable by authenticated users" on public.home_banner;
create policy "Home banner is viewable by authenticated users"
  on public.home_banner for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage home banner" on public.home_banner;
create policy "Admins can manage home banner"
  on public.home_banner for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Seed with the text that previously lived in src/screens/HomeScreen.jsx
insert into public.home_banner (message) values
  ('1 in 150 children in Singapore is autistic. Government subsidies can reduce early intervention costs by 30–70%. Tap Subsidies above to find out what you qualify for.')
on conflict do nothing;
