  -- Run this once in the Supabase Dashboard → SQL Editor for this project.
  -- Adds an admin role to profiles, makes Community group rooms manageable
  -- from the app (instead of hardcoded), and adds pinned announcements.

  -- 1. Admin role -------------------------------------------------------

  alter table public.profiles
    add column if not exists role text not null default 'user';

  alter table public.profiles
    drop constraint if exists profiles_role_check;

  alter table public.profiles
    add constraint profiles_role_check check (role in ('user', 'admin'));

  -- To make an account an admin, run (replace with the real user id):
  --   update public.profiles set role = 'admin' where id = '<user-uuid>';


  -- 2. Community rooms (replaces hardcoded GROUP_ROOMS) ------------------

  create table if not exists public.community_rooms (
    id uuid primary key default gen_random_uuid(),
    label text not null,
    description text not null default '',
    icon_key text not null default 'community',
    color_key text not null default 'purple',
    sort_order int not null default 0,
    created_at timestamptz not null default now()
  );

  alter table public.community_rooms enable row level security;

  drop policy if exists "Rooms are viewable by authenticated users" on public.community_rooms;
  create policy "Rooms are viewable by authenticated users"
    on public.community_rooms for select
    to authenticated
    using (true);

  drop policy if exists "Admins can manage rooms" on public.community_rooms;
  create policy "Admins can manage rooms"
    on public.community_rooms for all
    to authenticated
    using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
    with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

  -- Seed with the rooms that used to be hardcoded in the app.
  insert into public.community_rooms (label, description, icon_key, color_key, sort_order)
  select * from (values
    ('Foster Parents', 'HealthHub access, CDA, navigating the system', 'foster', 'purple', 1),
    ('Singapore Resources', 'Subsidies, schools, therapists', 'sg', 'green', 2),
    ('Parent Community', 'Open chat for all parents', 'community', 'purple', 3)
  ) as seed(label, description, icon_key, color_key, sort_order)
  where not exists (select 1 from public.community_rooms);


  -- 3. Pinned announcements ----------------------------------------------

  create table if not exists public.community_announcements (
    id uuid primary key default gen_random_uuid(),
    text text not null,
    created_by uuid not null references auth.users (id) on delete cascade,
    created_at timestamptz not null default now()
  );

  alter table public.community_announcements enable row level security;

  drop policy if exists "Announcements are viewable by authenticated users" on public.community_announcements;
  create policy "Announcements are viewable by authenticated users"
    on public.community_announcements for select
    to authenticated
    using (true);

  drop policy if exists "Admins can post announcements" on public.community_announcements;
  create policy "Admins can post announcements"
    on public.community_announcements for insert
    to authenticated
    with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

  drop policy if exists "Admins can delete announcements" on public.community_announcements;
  create policy "Admins can delete announcements"
    on public.community_announcements for delete
    to authenticated
    using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));


  -- 4. Admins can moderate (delete) any message ---------------------------

  drop policy if exists "Admins can delete any message" on public.messages;
  create policy "Admins can delete any message"
    on public.messages for delete
    to authenticated
    using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
