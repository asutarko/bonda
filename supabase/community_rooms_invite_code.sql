-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Gives community_rooms a short invite_code (mirrors community_groups, see
-- community_groups_private.sql) so admin-curated room invite links can use
-- an 8-char code instead of the full UUID — see openGroupInvite() in
-- CommunityScreen.jsx.

alter table public.community_rooms
  add column if not exists invite_code text unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);

-- Backfill any rows that predate the default (shouldn't be any, but safe).
update public.community_rooms
  set invite_code = substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)
  where invite_code is null;

alter table public.community_rooms
  alter column invite_code set not null;
