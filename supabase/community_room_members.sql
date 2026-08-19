-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Admin-curated community_rooms (Foster Parents, Singapore Resources, Parent
-- Community — see community_admin.sql) used to be open to everyone with no
-- join step. They now require the same explicit Join as parent-created
-- groups (community_groups.sql), so they need their own membership table —
-- community_group_members can't be reused since its group_id references
-- community_groups, not community_rooms.

create table if not exists public.community_room_members (
  room_id   uuid not null references public.community_rooms (id) on delete cascade,
  user_id   uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

alter table public.community_room_members enable row level security;

drop policy if exists "Room membership viewable by authenticated users" on public.community_room_members;
create policy "Room membership viewable by authenticated users"
  on public.community_room_members for select
  to authenticated
  using (true);

drop policy if exists "Users can join rooms themselves" on public.community_room_members;
create policy "Users can join rooms themselves"
  on public.community_room_members for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can leave rooms themselves" on public.community_room_members;
create policy "Users can leave rooms themselves"
  on public.community_room_members for delete
  to authenticated
  using (user_id = auth.uid());

-- Backfill: grandfather in anyone who already posted in an admin room, so
-- existing active members aren't suddenly locked out by this join gate —
-- only users who've never posted (e.g. brand-new accounts) will need to
-- tap Join. Messages share the same "room_<id>" key for both admin rooms
-- and parent-created groups, so this only matches ids that are actually
-- community_rooms.
insert into public.community_room_members (room_id, user_id)
select distinct cr.id, m.author_id
from public.messages m
join public.community_rooms cr on m.room = 'room_' || cr.id::text
on conflict (room_id, user_id) do nothing;
