-- Run this once in the Supabase Dashboard → SQL Editor for this project.

-- Splits the parent/carer's name into first/middle/last so the sign-up and
-- edit-profile forms can capture each part separately. `name` stays as the
-- full name (first + middle + last joined by the app on save) and keeps
-- working everywhere it's already read — the home greeting, Community, etc.
alter table public.profiles add column if not exists first_name text not null default '';
alter table public.profiles add column if not exists middle_name text not null default '';
alter table public.profiles add column if not exists last_name text not null default '';

-- Re-point the signup trigger (defined in profiles.sql) to also copy the
-- new name parts from auth.users.raw_user_meta_data.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, first_name, middle_name, last_name, avatar, joined, gender, address, phone, relationship, occupation, nationality, marital_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.email),
    coalesce(new.raw_user_meta_data ->> 'firstName', ''),
    coalesce(new.raw_user_meta_data ->> 'middleName', ''),
    coalesce(new.raw_user_meta_data ->> 'lastName', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar', 'none'),
    coalesce(new.raw_user_meta_data ->> 'joined', to_char(new.created_at, 'Mon YYYY')),
    coalesce(new.raw_user_meta_data ->> 'gender', ''),
    coalesce(new.raw_user_meta_data ->> 'address', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'relationship', ''),
    coalesce(new.raw_user_meta_data ->> 'occupation', ''),
    coalesce(new.raw_user_meta_data ->> 'nationality', ''),
    coalesce(new.raw_user_meta_data ->> 'maritalStatus', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
