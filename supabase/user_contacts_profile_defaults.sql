-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Support Hotlines shows each child's "Clinic & doctor" entries (children.clinic_*
-- / doctor_name) as default contacts. When the caregiver edits or deletes one, a
-- user_contacts row with the same source_key is saved and replaces the default:
--   • source_key — identifies the profile clinic this row overrides (null for
--     contacts the caregiver added themselves)
--   • hidden     — true when the caregiver deleted a default, so it stays gone

alter table public.user_contacts add column if not exists source_key text;
alter table public.user_contacts add column if not exists hidden boolean not null default false;

create unique index if not exists user_contacts_user_source_key_idx
  on public.user_contacts (user_id, source_key)
  where source_key is not null;
