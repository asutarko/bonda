-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds a debounce counter so check-support-directory only hides a contact
-- after 2 consecutive failed daily checks, not the first one. Several
-- directory entries are mental-health crisis lines on old server stacks
-- that can fail a single automated check (WAF rate-limiting, weak/legacy
-- TLS) while the site is genuinely fine for a real visitor — hiding a
-- crisis contact on one false positive is far worse than a day's delay in
-- catching a real outage.

alter table public.support_directory
  add column if not exists fail_streak int not null default 0;

comment on column public.support_directory.fail_streak is
  'Consecutive failed daily checks by check-support-directory. Row is only hidden (available_online=false) once this reaches 2.';
