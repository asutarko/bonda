-- Run this once in the Supabase Dashboard → SQL Editor.
-- Creates the shared messages table for group rooms and private DMs.

create table if not exists public.messages (
  id        bigserial primary key,
  room      text        not null,
  author_id uuid        not null references auth.users (id) on delete cascade,
  author_name   text    not null,
  author_avatar text    not null default 'none',
  text      text        not null,
  created_at timestamptz not null default now()
);

-- Index for fast room-ordered queries
create index if not exists messages_room_created_idx
  on public.messages (room, created_at);

alter table public.messages enable row level security;

-- Group rooms (room starts with "room_") are visible to all signed-in users
drop policy if exists "Group messages readable by authenticated users" on public.messages;
create policy "Group messages readable by authenticated users"
  on public.messages for select
  to authenticated
  using (room like 'room_%');

-- DM rooms contain both participants' UUIDs in the key (dm_uuid1_uuid2, sorted)
drop policy if exists "DM messages readable only by participants" on public.messages;
create policy "DM messages readable only by participants"
  on public.messages for select
  to authenticated
  using (room like 'dm_%' and room like '%' || auth.uid()::text || '%');

-- Any authenticated user can send a message as themselves
drop policy if exists "Users can insert their own messages" on public.messages;
create policy "Users can insert their own messages"
  on public.messages for insert
  to authenticated
  with check (author_id = auth.uid());

-- Users can delete only their own messages
drop policy if exists "Users can delete their own messages" on public.messages;
create policy "Users can delete their own messages"
  on public.messages for delete
  to authenticated
  using (author_id = auth.uid());

-- Enable real-time replication for the messages table
alter publication supabase_realtime add table messages;
