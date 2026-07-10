-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Stores the caregiver's saved/edited carer letter per child (CarerLetterScreen),
-- so it survives a refresh/relogin instead of living only in component state.
-- One row per child; re-generating or re-editing the letter overwrites it.

create table if not exists public.carer_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (child_id)
);

create index if not exists carer_letters_user_id_idx on public.carer_letters (user_id);

alter table public.carer_letters enable row level security;

-- A user can only see, create, edit, or delete the saved letters for their own children.
drop policy if exists "Users can view their own carer letters" on public.carer_letters;
create policy "Users can view their own carer letters"
  on public.carer_letters for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own carer letters" on public.carer_letters;
create policy "Users can insert their own carer letters"
  on public.carer_letters for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own carer letters" on public.carer_letters;
create policy "Users can update their own carer letters"
  on public.carer_letters for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own carer letters" on public.carer_letters;
create policy "Users can delete their own carer letters"
  on public.carer_letters for delete
  to authenticated
  using (auth.uid() = user_id);
