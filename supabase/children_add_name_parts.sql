-- Run this once in the Supabase Dashboard → SQL Editor for this project.

-- Splits the child's name into first/middle/last so the add/edit child form
-- can capture each part separately. `name` stays as the full name (first +
-- middle + last joined by the app on save) and keeps working everywhere it's
-- already read — schedules, growth tracker, carer letters, etc.
alter table public.children add column if not exists first_name text not null default '';
alter table public.children add column if not exists middle_name text not null default '';
alter table public.children add column if not exists last_name text not null default '';
