-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds an optional image_url column so subsidy news items can carry a
-- photo, not just text.

alter table public.subsidy_news
  add column if not exists image_url text;
