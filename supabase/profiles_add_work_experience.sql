-- Run this once in the Supabase Dashboard → SQL Editor for this project.

-- Work history for accounts with account_type = 'professional' (doctor,
-- therapist or psychologist; see profiles_add_professional_fields.sql).
-- A professional can list any number of past/current jobs, stored as a JSON
-- array of objects, newest first as entered:
--   [{ "position": "Senior Speech Therapist",      -- job title (jabatan)
--      "workplace": "Rainbow Centre",
--      "startMonth": "3", "startYear": "2018",      -- period start (month 1–12)
--      "endMonth": "6", "endYear": "2022",          -- period end; "" when current
--      "current": false }, ...]
-- Self-declared and unverified.
alter table public.profiles add column if not exists work_experience jsonb not null default '[]'::jsonb;
