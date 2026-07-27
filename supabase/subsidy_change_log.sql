-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Audit trail for every change the automated checker
-- (supabase/functions/check-subsidies) applies to public.subsidies without
-- human review. Lets an admin see exactly what changed and revert it if the
-- automated extraction got something wrong.

create table if not exists public.subsidy_change_log (
  id uuid primary key default gen_random_uuid(),
  subsidy_id uuid references public.subsidies (id) on delete cascade,
  field text not null,
  old_value text,
  new_value text,
  changed_at timestamptz not null default now()
);

alter table public.subsidy_change_log enable row level security;

drop policy if exists "Admins can view the subsidy change log" on public.subsidy_change_log;
create policy "Admins can view the subsidy change log"
  on public.subsidy_change_log for select
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Writes come from the check-subsidies Edge Function using the service-role
-- key, which bypasses RLS — no insert policy needed for authenticated users.
