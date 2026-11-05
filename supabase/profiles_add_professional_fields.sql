-- Run this once in the Supabase Dashboard → SQL Editor for this project.

-- Profile details for accounts with account_type = 'professional' (see
-- profiles_add_account_type.sql). Self-declared and unverified. Named
-- practice_* because profiles.sql drops any column called clinic_name.
alter table public.profiles add column if not exists profession text not null default '';
alter table public.profiles add column if not exists specialisation text not null default '';
alter table public.profiles add column if not exists practice_name text not null default '';
alter table public.profiles add column if not exists practice_address text not null default '';
