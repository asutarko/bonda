-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds a "Clinics" directory with each clinic's psychologists, manageable
-- from the app by admins (role = 'admin' on public.profiles). Regular users
-- can only view.

create table if not exists public.clinics (
  id uuid not null default gen_random_uuid (),
  name text not null,
  address text not null default ''::text,
  phone text not null default ''::text,
  created_by uuid null,
  created_at timestamp with time zone not null default now(),
  constraint clinics_pkey primary key (id),
  constraint clinics_created_by_fkey foreign KEY (created_by) references auth.users (id) on delete set null
) TABLESPACE pg_default;

create table if not exists public.clinic_psychologists (
  id uuid not null default gen_random_uuid (),
  clinic_id uuid not null,
  name text not null,
  sort_order integer not null default 0,
  created_by uuid null,
  created_at timestamp with time zone not null default now(),
  constraint clinic_psychologists_pkey primary key (id),
  constraint clinic_psychologists_clinic_id_fkey foreign KEY (clinic_id) references clinics (id) on delete CASCADE,
  constraint clinic_psychologists_created_by_fkey foreign KEY (created_by) references auth.users (id) on delete set null
) TABLESPACE pg_default;

alter table public.clinics enable row level security;
alter table public.clinic_psychologists enable row level security;

drop policy if exists "Clinics are viewable by authenticated users" on public.clinics;
create policy "Clinics are viewable by authenticated users"
  on public.clinics for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage clinics" on public.clinics;
create policy "Admins can manage clinics"
  on public.clinics for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Clinic psychologists are viewable by authenticated users" on public.clinic_psychologists;
create policy "Clinic psychologists are viewable by authenticated users"
  on public.clinic_psychologists for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage clinic psychologists" on public.clinic_psychologists;
create policy "Admins can manage clinic psychologists"
  on public.clinic_psychologists for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
