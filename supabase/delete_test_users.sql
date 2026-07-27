-- Run in the Supabase Dashboard → SQL Editor. Deletes only the seeded test
-- accounts (name "Test Parent", email @mailinator.com) that were colliding
-- on the placeholder phone number 91234567 — NOT the real "Sarah" account
-- that also happens to use that number.
--
-- Step 1: preview — run this first and check the row count/names look right.
select public.profiles.id, public.profiles.name, auth.users.email
from public.profiles
join auth.users on auth.users.id = public.profiles.id
where public.profiles.name = 'Test Parent'
  and auth.users.email like '%@mailinator.com';

-- Step 2: only after confirming the preview above looks correct, run this.
-- Deleting from auth.users cascades to public.profiles (profiles.sql) and
-- public.children/carer_letters/messages (all "on delete cascade" on
-- auth.users.id), so no manual cleanup of those tables is needed.
delete from auth.users
where id in (
  select public.profiles.id
  from public.profiles
  join auth.users on auth.users.id = public.profiles.id
  where public.profiles.name = 'Test Parent'
    and auth.users.email like '%@mailinator.com'
);
