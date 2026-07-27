-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Fixes the "countries" lookup table used by the Location field on
-- Edit User Profile (mirrors nationalities.sql): adds the missing id
-- default, sets up RLS policies, and seeds it with the existing
-- COUNTRY_OPTIONS list from src/data.js.

alter table public.countries alter column id set default gen_random_uuid();
alter table public.countries alter column created_at set default now();
alter table public.countries alter column updated_at set default now();

drop policy if exists "Countries are viewable by authenticated users" on public.countries;
create policy "Countries are viewable by authenticated users"
  on public.countries for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage countries" on public.countries;
create policy "Admins can manage countries"
  on public.countries for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

insert into public.countries (name, sort_order)
select t.name, t.ord - 1
from unnest(array[
  'Singapore', 'Indonesia', 'Malaysia', 'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia',
  'Australia', 'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Brazil', 'Brunei', 'Bulgaria', 'Cambodia', 'Cameroon', 'Canada',
  'Chile', 'China', 'Colombia', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark',
  'Ecuador', 'Egypt', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Georgia',
  'Germany', 'Ghana', 'Greece', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Iran',
  'Iraq', 'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
  'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Libya', 'Lithuania', 'Luxembourg',
  'Macau', 'Madagascar', 'Maldives', 'Mali', 'Malta', 'Mexico', 'Moldova', 'Mongolia',
  'Montenegro', 'Morocco', 'Myanmar', 'Nepal', 'Netherlands', 'New Zealand', 'Nigeria', 'North Korea',
  'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
  'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saudi Arabia',
  'Serbia', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sudan',
  'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste',
  'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
  'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe', 'Other'
]) with ordinality as t(name, ord)
where not exists (select 1 from public.countries c where c.name = t.name);
