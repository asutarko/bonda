-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds a free-text "detail" column to caregiver_faq_answers so answers to
-- "(specify)" options (e.g. "Food allergy (specify)") carry the caregiver's
-- typed detail (e.g. "peanuts"), not just the option_id, so it can be
-- queried/reported on directly instead of only living inside the dev_log
-- note text.

alter table public.caregiver_faq_answers add column if not exists detail text;
