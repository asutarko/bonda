-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Enforces that phone numbers are unique across profiles and lets the
-- (unauthenticated) registration screen check that before calling
-- supabase.auth.signUp() — profiles can't be selected by anon clients
-- (see profiles.sql RLS policies), so a plain select won't work there.

-- Backstop against races between the pre-check below and the actual insert
-- done by handle_new_user() in profiles.sql. Empty phone is excluded since
-- existing rows default to ''.
create unique index if not exists profiles_phone_unique_idx
  on public.profiles (phone)
  where phone <> '';

create or replace function public.phone_registered(check_phone text)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where phone = check_phone and check_phone <> ''
  );
$$;

grant execute on function public.phone_registered(text) to anon, authenticated;
