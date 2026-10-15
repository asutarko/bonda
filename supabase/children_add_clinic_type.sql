-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds the "Type of care" (Clinic / Therapist) picked for
-- each entry in the child profile's clinic list. Stored like the other clinic_*
-- columns: one value per clinic, newline-joined, index-aligned with clinic_name.

alter table public.children add column if not exists clinic_type text not null default '';
