-- Run this once in the Supabase Dashboard → SQL Editor for this project.

-- Optional email for a saved carer-letter recipient — only asked for when the
-- caregiver says the recipient has one; fills "[Recipient email]" in letters.
alter table public.carer_letter_recipients add column if not exists email text not null default '';
