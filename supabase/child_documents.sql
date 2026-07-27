-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Stores manually-added document records per child (Documents screen) — metadata
-- only (title + category), no file upload/storage involved.

create table if not exists public.child_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  title text not null,
  category text not null default 'Other',
  created_at timestamptz not null default now()
);

create index if not exists child_documents_user_id_idx on public.child_documents (user_id);

alter table public.child_documents enable row level security;

-- A user can only see, create, or delete the document records for their own children.
drop policy if exists "Users can view their own child documents" on public.child_documents;
create policy "Users can view their own child documents"
  on public.child_documents for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own child documents" on public.child_documents;
create policy "Users can insert their own child documents"
  on public.child_documents for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own child documents" on public.child_documents;
create policy "Users can delete their own child documents"
  on public.child_documents for delete
  to authenticated
  using (auth.uid() = user_id);
