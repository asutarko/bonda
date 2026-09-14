-- Run this once in the Supabase Dashboard → SQL Editor for this project.

-- A caregiver's own address book of carer-letter recipients — a school, a
-- court, a fostering agency, anywhere a letter needs to go. A single child
-- can need letters sent to several different recipients (and the same
-- recipient can be reused across children/letters), so this is its own
-- table rather than a few columns on "children" (see children_add_clinic_phone_email.sql
-- for that earlier, single-recipient-per-child approach this replaces).
-- Private to the caregiver who created it — there's no shared/admin-managed
-- directory here, unlike clinics.sql.
create table if not exists public.carer_letter_recipients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  address text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists carer_letter_recipients_user_id_idx on public.carer_letter_recipients (user_id);

alter table public.carer_letter_recipients enable row level security;

drop policy if exists "Users can view their own recipients" on public.carer_letter_recipients;
create policy "Users can view their own recipients"
  on public.carer_letter_recipients for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own recipients" on public.carer_letter_recipients;
create policy "Users can insert their own recipients"
  on public.carer_letter_recipients for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own recipients" on public.carer_letter_recipients;
create policy "Users can update their own recipients"
  on public.carer_letter_recipients for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own recipients" on public.carer_letter_recipients;
create policy "Users can delete their own recipients"
  on public.carer_letter_recipients for delete
  to authenticated
  using (auth.uid() = user_id);
