-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds an "Emergency Contacts" list for the SOS screen, manageable from the
-- app by admins (role = 'admin' on public.profiles). Regular users can only
-- view and call.

create table if not exists public.sos_contacts (
  id uuid primary key default gen_random_uuid(),
  icon text not null default '📞',
  label text not null,
  number text not null,
  type text not null default '',
  color_key text not null default 'purple',
  sort_order int not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.sos_contacts enable row level security;

drop policy if exists "SOS contacts are viewable by authenticated users" on public.sos_contacts;
create policy "SOS contacts are viewable by authenticated users"
  on public.sos_contacts for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage SOS contacts" on public.sos_contacts;
create policy "Admins can manage SOS contacts"
  on public.sos_contacts for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Seed with the contacts that used to be hardcoded in the app.
insert into public.sos_contacts (icon, label, number, type, color_key, sort_order)
select * from (values
  ('🏛️', 'Autism Resource Centre (ARC)', '6278 5755', 'Autism Specialist', 'purple', 1),
  ('🤝', 'Autism Association Singapore', '6745 7144', 'Autism Specialist', 'teal', 2),
  ('🏥', 'Institute of Mental Health (IMH)', '6389 2000', 'Mental Health · 24hr', 'purple', 3),
  ('🆘', 'Samaritans of Singapore (SOS)', '1800 221 4444', 'Crisis · 24hr Free', 'red', 4),
  ('👶', 'KK Women''s & Children''s Hospital', '6225 5554', 'Medical', 'amber', 5),
  ('🇸🇬', 'SG Enable', '1800 8585 885', 'Government', 'green', 6),
  ('🏢', 'MSF ComCare Hotline', '1800 222 0000', 'Government', 'gray', 7)
) as seed(icon, label, number, type, color_key, sort_order)
where not exists (select 1 from public.sos_contacts);
