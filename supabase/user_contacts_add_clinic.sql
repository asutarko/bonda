-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Splits the combined "Doctor / Clinic" contact category into separate
-- "doctor" and "clinic" categories. Existing rows stay as 'doctor'.

alter table public.user_contacts drop constraint if exists user_contacts_category_check;
alter table public.user_contacts
  add constraint user_contacts_category_check
  check (category in ('school', 'doctor', 'clinic', 'therapist'));
