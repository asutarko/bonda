-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Fixes the "nationalities" lookup table used by the Nationality field on
-- Edit User Profile: adds the missing id default, sets up RLS policies
-- (table currently has RLS enabled but zero policies, so nobody but the
-- table owner can read or write it), and seeds the initial rows.

alter table public.nationalities alter column id set default gen_random_uuid();
alter table public.nationalities alter column created_at set default now();
alter table public.nationalities alter column updated_at set default now();

drop policy if exists "Nationalities are viewable by authenticated users" on public.nationalities;
create policy "Nationalities are viewable by authenticated users"
  on public.nationalities for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage nationalities" on public.nationalities;
create policy "Admins can manage nationalities"
  on public.nationalities for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

insert into public.nationalities (name, sort_order)
select * from (values
  ('Indonesian Citizen', 0),
  ('Foreign Citizen', 1)
) as seed(name, sort_order)
where not exists (select 1 from public.nationalities);
