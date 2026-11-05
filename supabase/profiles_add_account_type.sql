-- Run this once in the Supabase Dashboard → SQL Editor for this project.

-- Records who is signing up: 'caregiver' or 'professional' (doctor, therapist
-- or psychologist), picked on the last step of sign-up. Self-declared and
-- unverified, so don't use it to grant access. This is separate from
-- profiles.role, which marks admins. Accounts created before this step stay ''.
alter table public.profiles add column if not exists account_type text not null default '';
