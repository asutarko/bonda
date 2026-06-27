-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Stores each caregiver's FAQ answers (My Child → Development → "Gentle
-- Prompts for You") as proper rows — one per (child, question, chosen
-- option) — instead of only living inside children.dev_log's JSONB blob.
-- The app still also writes a human-readable copy into dev_log so the
-- existing observation timeline keeps working unchanged; this table exists
-- so answers can be queried/reported on directly (e.g. from the admin app).

create table if not exists public.caregiver_faq_answers (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  question_id uuid not null references public.caregiver_faq_questions (id) on delete cascade,
  option_id uuid not null references public.caregiver_faq_options (id) on delete cascade,
  answered_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (child_id, question_id, option_id)
);

create index if not exists caregiver_faq_answers_child_id_idx on public.caregiver_faq_answers (child_id);
create index if not exists caregiver_faq_answers_question_id_idx on public.caregiver_faq_answers (question_id);

alter table public.caregiver_faq_answers enable row level security;

-- A caregiver can only see/insert answers for children they own.
drop policy if exists "Users can view answers for their own children" on public.caregiver_faq_answers;
create policy "Users can view answers for their own children"
  on public.caregiver_faq_answers for select
  to authenticated
  using (exists (select 1 from public.children c where c.id = child_id and c.user_id = auth.uid()));

drop policy if exists "Users can insert answers for their own children" on public.caregiver_faq_answers;
create policy "Users can insert answers for their own children"
  on public.caregiver_faq_answers for insert
  to authenticated
  with check (exists (select 1 from public.children c where c.id = child_id and c.user_id = auth.uid()));

drop policy if exists "Users can delete answers for their own children" on public.caregiver_faq_answers;
create policy "Users can delete answers for their own children"
  on public.caregiver_faq_answers for delete
  to authenticated
  using (exists (select 1 from public.children c where c.id = child_id and c.user_id = auth.uid()));

-- Admins (profiles.role = 'admin', managed from the separate admin app) can
-- view every answer for reporting, same pattern as the admin policies on children.
drop policy if exists "Admins can view all caregiver faq answers" on public.caregiver_faq_answers;
create policy "Admins can view all caregiver faq answers"
  on public.caregiver_faq_answers for select
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
