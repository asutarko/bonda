-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds an optional image_url column so community messages (group rooms and
-- DMs) can carry a photo attachment, not just text.

alter table public.messages
  add column if not exists image_url text;
