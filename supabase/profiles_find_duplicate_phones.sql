-- Read-only. Run in the Supabase Dashboard → SQL Editor to see which
-- profiles collide before creating the unique index in
-- profiles_unique_phone.sql. Does not modify any data.

select public.profiles.id, public.profiles.name, auth.users.email, public.profiles.phone, public.profiles.created_at
from public.profiles
join auth.users on auth.users.id = public.profiles.id
where phone <> '' and phone in (
  select phone from public.profiles
  where phone <> ''
  group by phone
  having count(*) > 1
)
order by phone, created_at;
