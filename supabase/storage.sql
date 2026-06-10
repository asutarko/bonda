-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- It creates a public "public" storage bucket used to hold profile photos,
-- so the app stores only a short public URL in the database/JWT instead of
-- raw base64 image bytes (which previously bloated the auth token past the
-- 100KB HTTP header limit and caused "Could not save the profile" errors).
--
-- Folder layout inside the bucket:
--   assets/parents/<userId>-<timestamp>.jpg   (parent profile photos)
--   assets/children/<userId>-<timestamp>.jpg  (child profile photos)

insert into storage.buckets (id, name, public)
values ('public', 'public', true)
on conflict (id) do nothing;

-- Anyone can view files in this bucket (it's public — needed so <img> tags
-- can load the photos without authentication).
drop policy if exists "Public read access for the public bucket" on storage.objects;
create policy "Public read access for the public bucket"
  on storage.objects for select
  to public
  using (bucket_id = 'public');

-- Signed-in users can upload files into assets/parents/ and assets/children/.
drop policy if exists "Authenticated users can upload profile photos" on storage.objects;
create policy "Authenticated users can upload profile photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'public'
    and (storage.foldername(name))[1] = 'assets'
    and (storage.foldername(name))[2] in ('parents', 'children')
  );

-- Signed-in users can overwrite/replace their own previously uploaded photos.
drop policy if exists "Authenticated users can update profile photos" on storage.objects;
create policy "Authenticated users can update profile photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'public'
    and (storage.foldername(name))[1] = 'assets'
    and (storage.foldername(name))[2] in ('parents', 'children')
  );
