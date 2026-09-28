-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Depends on carer_letter_recipients.sql having been run first.

-- Remembers which saved recipient (see carer_letter_recipients.sql) was last
-- picked for this child's carer letter, so reopening the setup form pre-fills
-- the same choice instead of asking again — the recipient's own details still
-- live in carer_letter_recipients, not duplicated here.
alter table public.children add column if not exists recipient_id uuid references public.carer_letter_recipients (id) on delete set null;
