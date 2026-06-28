-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- These two tables already exist in production (created directly from the
-- dashboard) and are relied on by caregiver_faq_seed.sql, caregiver_faq_seed_2.sql
-- and caregiver_faq_answers.sql, but were never captured in a checked-in
-- migration file. Added here (idempotently) so the schema is reproducible.
-- Holds the caregiver check-in questions/options shown in My Child →
-- Development ("Gentle Prompts for You"), editable from the separate admin app.

create table if not exists public.caregiver_faq_questions (
  id uuid primary key default gen_random_uuid(),
  caregiver_type text not null,
  question text not null,
  allow_multiple boolean not null default false,
  sort_order int not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default current_timestamp
);

create table if not exists public.caregiver_faq_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.caregiver_faq_questions (id) on delete cascade,
  answer text not null,
  sort_order int not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default current_timestamp
);

create index if not exists caregiver_faq_questions_caregiver_type_idx on public.caregiver_faq_questions (caregiver_type, sort_order);
create index if not exists caregiver_faq_options_question_id_idx on public.caregiver_faq_options (question_id);

alter table public.caregiver_faq_questions enable row level security;
alter table public.caregiver_faq_options enable row level security;

drop policy if exists "Caregiver faq questions are viewable by authenticated users" on public.caregiver_faq_questions;
create policy "Caregiver faq questions are viewable by authenticated users"
  on public.caregiver_faq_questions for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage caregiver faq questions" on public.caregiver_faq_questions;
create policy "Admins can manage caregiver faq questions"
  on public.caregiver_faq_questions for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Caregiver faq options are viewable by authenticated users" on public.caregiver_faq_options;
create policy "Caregiver faq options are viewable by authenticated users"
  on public.caregiver_faq_options for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage caregiver faq options" on public.caregiver_faq_options;
create policy "Admins can manage caregiver faq options"
  on public.caregiver_faq_options for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
