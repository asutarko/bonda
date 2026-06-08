-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- It creates a public "profiles" table that mirrors each auth user's
-- display name, avatar and join date — safe to read from the client,
-- unlike the protected auth.users table.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  avatar text not null default 'none',
  joined text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Any signed-in parent can see the list of other parents (needed for
-- the Community tab's group chat and private messages).
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

-- A user may only create or edit their own profile row.
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up, copying the
-- name/avatar/joined values that were passed in user_metadata at signUp().
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar, joined)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.email),
    coalesce(new.raw_user_meta_data ->> 'avatar', 'none'),
    coalesce(new.raw_user_meta_data ->> 'joined', to_char(new.created_at, 'Mon YYYY'))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
