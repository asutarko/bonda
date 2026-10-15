-- Run this once in the Supabase Dashboard → SQL Editor for this project.

-- Therapist / counsellor details for the carer letter's "Mental health
-- professionals" section. Same storage convention as the clinic and case
-- worker columns: a child can have several therapists, held newline-joined
-- and index-aligned across these three columns (see CarerLetterScreen.jsx).
alter table public.children add column if not exists therapist_name text not null default '';
alter table public.children add column if not exists therapist_centre text not null default '';
alter table public.children add column if not exists therapist_phone text not null default '';
