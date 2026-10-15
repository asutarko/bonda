-- Run this once in the Supabase Dashboard → SQL Editor for this project.

-- Postal code kept separate from the free-text address so the edit-profile
-- form and carer letters ("[Your postal code]" / "[Recipient postal code]")
-- can capture and fill it on its own — for both the caregiver (sender) and
-- the caregiver's saved letter recipients.
alter table public.profiles add column if not exists postal_code text not null default '';
alter table public.carer_letter_recipients add column if not exists postal_code text not null default '';
