-- Run this once in the Supabase Dashboard → SQL Editor for this project.

-- Rounds out the manually-entered clinic details (see
-- children_add_doctor_clinic_address.sql) with a phone number and email,
-- for the carer letter's "Mental health professionals" section when the
-- child isn't assigned to a clinic in the admin-managed directory.
alter table public.children add column if not exists clinic_phone text not null default '';
alter table public.children add column if not exists clinic_email text not null default '';
