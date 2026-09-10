-- Run this once in the Supabase Dashboard → SQL Editor for this project.

-- Separates the doctor's name and the clinic's address out from the single
-- free-text "clinic_name" field (see children.sql), so the carer letter's
-- "Mental health professionals" section can fill in each one on its own
-- line instead of the caregiver having to type all three into one box.
alter table public.children add column if not exists doctor_name text not null default '';
alter table public.children add column if not exists clinic_address text not null default '';
