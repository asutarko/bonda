-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds the parts of Community that used to only exist as a design
-- prototype (src/components/CommunityApp.jsx): parent-created groups,
-- moments (photo posts), and following other parents. community_rooms
-- (community_admin.sql) stays admin-only and untouched — these are
-- separate, parent-facing tables.

-- 1. Parent-created groups (in addition to admin-curated community_rooms) --

create table if not exists public.community_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  icon_key text not null default 'community',
  color_key text not null default 'purple',
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.community_groups enable row level security;

drop policy if exists "Groups are viewable by authenticated users" on public.community_groups;
create policy "Groups are viewable by authenticated users"
  on public.community_groups for select
  to authenticated
  using (true);

drop policy if exists "Users can create groups" on public.community_groups;
create policy "Users can create groups"
  on public.community_groups for insert
  to authenticated
  with check (created_by = auth.uid());

drop policy if exists "Creators can update or delete their own groups" on public.community_groups;
create policy "Creators can update or delete their own groups"
  on public.community_groups for update
  to authenticated
  using (created_by = auth.uid());
drop policy if exists "Creators can delete their own groups" on public.community_groups;
create policy "Creators can delete their own groups"
  on public.community_groups for delete
  to authenticated
  using (created_by = auth.uid());

-- Membership for parent-created groups (admin rooms have no membership —
-- they're open to everyone; "members" there is just who has posted).
create table if not exists public.community_group_members (
  group_id uuid not null references public.community_groups (id) on delete cascade,
  user_id  uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

alter table public.community_group_members enable row level security;

drop policy if exists "Group membership viewable by authenticated users" on public.community_group_members;
create policy "Group membership viewable by authenticated users"
  on public.community_group_members for select
  to authenticated
  using (true);

drop policy if exists "Users can join groups themselves" on public.community_group_members;
create policy "Users can join groups themselves"
  on public.community_group_members for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can leave groups themselves" on public.community_group_members;
create policy "Users can leave groups themselves"
  on public.community_group_members for delete
  to authenticated
  using (user_id = auth.uid());


-- 2. Moments — persistent photo posts, shown to followers ------------------

create table if not exists public.moments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null,
  author_avatar text not null default 'none',
  image_url text not null,
  caption text not null default '',
  location text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists moments_author_created_idx
  on public.moments (author_id, created_at desc);

alter table public.moments enable row level security;

drop policy if exists "Moments are viewable by authenticated users" on public.moments;
create policy "Moments are viewable by authenticated users"
  on public.moments for select
  to authenticated
  using (true);

drop policy if exists "Users can post their own moments" on public.moments;
create policy "Users can post their own moments"
  on public.moments for insert
  to authenticated
  with check (author_id = auth.uid());

drop policy if exists "Users can delete their own moments" on public.moments;
create policy "Users can delete their own moments"
  on public.moments for delete
  to authenticated
  using (author_id = auth.uid());


-- 3. Moments privacy settings, on the profile — added before the follows
-- table below since its insert policy checks allow_followers.

alter table public.profiles add column if not exists allow_followers boolean not null default true;
alter table public.profiles add column if not exists show_location_on_moments boolean not null default true;


-- 4. Follows — directed "contacts" relationship (I follow you) -------------

create table if not exists public.follows (
  follower_id uuid not null references auth.users (id) on delete cascade,
  followee_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  constraint follows_no_self check (follower_id <> followee_id)
);

alter table public.follows enable row level security;

-- Both sides of a follow can see it — the follower needs their contacts
-- list, and the followee needs to know who follows them (for "allow new
-- followers" enforcement below).
drop policy if exists "Follows viewable by either side" on public.follows;
create policy "Follows viewable by either side"
  on public.follows for select
  to authenticated
  using (follower_id = auth.uid() or followee_id = auth.uid());

drop policy if exists "Users can follow others themselves" on public.follows;
create policy "Users can follow others themselves"
  on public.follows for insert
  to authenticated
  with check (
    follower_id = auth.uid()
    and exists (select 1 from public.profiles where id = followee_id and allow_followers)
  );

drop policy if exists "Users can unfollow themselves" on public.follows;
create policy "Users can unfollow themselves"
  on public.follows for delete
  to authenticated
  using (follower_id = auth.uid());
