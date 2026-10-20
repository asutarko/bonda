-- Run this once in the Supabase Dashboard → SQL Editor for this project.

-- Country kept separate from the free-text address (like postal_code) so
-- carer letters can print it in the usual "..., Singapore 560123" order and
-- fill "[Your country]" / "[Recipient country]" placeholders on their own.
alter table public.profiles add column if not exists country text not null default '';
alter table public.carer_letter_recipients add column if not exists country text not null default '';
