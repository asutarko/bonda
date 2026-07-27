-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds an optional file_name column so document attachments (Word/Excel)
-- can show their original file name in chat — image_url is reused to hold
-- the attachment's storage URL regardless of whether it's an image or a
-- document (the actual kind is inferred from the file extension at render
-- time).

alter table public.messages
  add column if not exists file_name text;
