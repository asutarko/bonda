-- Run this once in the Supabase Dashboard → SQL Editor for this project.

-- The child's Medical Fee Exemption Card number, if they have one — fills in
-- the carer letter's "[Medical_Fee_Exemption_Card_number]" placeholder
-- (CarerLetterScreen.jsx's fillTemplate). Optional, same convention as
-- court_order_ref/diagnosis etc. in children.sql.
alter table public.children add column if not exists medical_card_number text not null default '';
