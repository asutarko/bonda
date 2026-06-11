-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds the "For You, Parent" motivational quotes shown on the Home screen,
-- manageable from the app by admins (role = 'admin' on public.profiles).
-- Regular users can only view.

create table if not exists public.parent_quotes (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author text not null default '',
  sort_order int not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.parent_quotes enable row level security;

drop policy if exists "Parent quotes are viewable by authenticated users" on public.parent_quotes;
create policy "Parent quotes are viewable by authenticated users"
  on public.parent_quotes for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage parent quotes" on public.parent_quotes;
create policy "Admins can manage parent quotes"
  on public.parent_quotes for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Seed with the quotes that previously lived in src/App.jsx (QUOTES constant)
-- so admins can edit/remove them from the app instead of redeploying code.
insert into public.parent_quotes (quote, author, sort_order) values
  ('You are not failing. You are learning a language no one taught you.', 'For every autism parent', 0),
  ('Every time your child feels safe, you built that.', 'Occupational Therapy wisdom', 1),
  ('Progress in autism is measured in moments, not milestones.', 'ASD Family Research', 2),
  ('You didn''t choose an easy road. You chose your child.', 'For caregivers on hard days', 3),
  ('Rest is not giving up. A rested parent is the most effective therapy.', 'Caregiver wellbeing research', 4),
  ('You have gotten through every hard day so far. That''s 100%.', 'For the exhausted parent', 5),
  ('Your child may not say ''I love you'' the way you expect. But they feel it every time you stay.', 'Attachment research, ASD', 6),
  ('The days you feel you''re getting nowhere are often the days the most is being planted.', 'For parents in the hard season', 7),
  ('Small consistent moments of connection are more powerful than any therapy session.', 'Developmental neuroscience', 8),
  ('Burnout is not weakness. It is what happens when someone cares deeply for a very long time.', 'Caregiver mental health research', 9),
  ('Your child does not need you to have all the answers. They need you to keep showing up.', 'For parents who feel lost', 10),
  ('Every autistic child is different. Bonda gives you frameworks, not prescriptions. You know your child best.', 'Norena Darsana · Bonda', 11)
on conflict do nothing;
