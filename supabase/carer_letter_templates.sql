-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- This table already exists in production (created directly from the
-- dashboard) but was never captured in a checked-in migration file. Added
-- here (idempotently) so the schema is reproducible.
-- Holds the MSF foster caregiver letter template content (see FosterHubScreen),
-- editable from the separate admin app.

create table if not exists public.carer_letter_templates (
  id uuid primary key default gen_random_uuid(),
  content text not null default '',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.carer_letter_templates enable row level security;

drop policy if exists "Carer letter templates are viewable by authenticated users" on public.carer_letter_templates;
create policy "Carer letter templates are viewable by authenticated users"
  on public.carer_letter_templates for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage carer letter templates" on public.carer_letter_templates;
create policy "Admins can manage carer letter templates"
  on public.carer_letter_templates for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
