-- Run this once in the Supabase Dashboard → SQL Editor for this project.

-- Feedback caregivers send from the header's 3-dot menu ("Feedback").
-- Write-only from the app: a caregiver can submit and see their own rows,
-- but reading everyone's feedback is done from the Supabase dashboard.
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null default '',
  rating smallint check (rating between 1 and 5),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists feedback_user_id_idx on public.feedback (user_id);

alter table public.feedback enable row level security;

drop policy if exists "Users can view their own feedback" on public.feedback;
create policy "Users can view their own feedback"
  on public.feedback for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own feedback" on public.feedback;
create policy "Users can insert their own feedback"
  on public.feedback for insert
  to authenticated
  with check (auth.uid() = user_id);
