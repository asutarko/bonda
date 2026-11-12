-- Run this once in the Supabase Dashboard → SQL Editor, after pro_matches.sql.
--
-- The session fee is now required on a professional's profile and defaults
-- to 0 (free). pro_matches.sql only allowed fees above 0, so relax the check
-- to allow 0 and give the column a default of 0.

alter table public.profiles drop constraint if exists profiles_session_fee_check;
alter table public.profiles add constraint profiles_session_fee_check
  check (session_fee is null or session_fee >= 0);

alter table public.profiles alter column session_fee set default 0;
