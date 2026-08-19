-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds topic tags to community_rooms (admin-curated) and community_groups
-- (parent-created), shown as chips on the in-app "Group info" screen.

alter table public.community_rooms add column if not exists topics text[] not null default '{}';
alter table public.community_groups add column if not exists topics text[] not null default '{}';

-- Seed the existing "Foster Parents" room with sample topics (only if it
-- doesn't have any yet, so this is safe to re-run).
update public.community_rooms
set topics = array['HealthHub', 'CDA', 'Fostering allowance', 'MSF referrals', 'Getting started', 'House rules']
where label = 'Foster Parents' and topics = '{}';
