-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds the "Activity Guide" categories and activities shown on the Activity
-- Guide screen, manageable from the app by admins (role = 'admin' on
-- public.profiles). Regular users can only view.

create table if not exists public.activity_categories (
  id uuid primary key default gen_random_uuid(),
  emoji text not null default '🎨',
  label text not null,
  color_key text not null default 'purple',
  freq text not null default '',
  source text not null default '',
  tip text not null default '',
  sort_order int not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.activity_categories (id) on delete cascade,
  name text not null,
  description text not null default '',
  benefit text not null default '',
  sort_order int not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.activity_categories enable row level security;
alter table public.activity_items enable row level security;

drop policy if exists "Activity categories are viewable by authenticated users" on public.activity_categories;
create policy "Activity categories are viewable by authenticated users"
  on public.activity_categories for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage activity categories" on public.activity_categories;
create policy "Admins can manage activity categories"
  on public.activity_categories for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Activity items are viewable by authenticated users" on public.activity_items;
create policy "Activity items are viewable by authenticated users"
  on public.activity_items for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage activity items" on public.activity_items;
create policy "Admins can manage activity items"
  on public.activity_items for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Seed with the categories and activities that previously lived in
-- src/App.jsx (ACTIVITIES constant) so admins can edit them from the app
-- instead of redeploying code.
insert into public.activity_categories (id, emoji, label, color_key, freq, source, tip, sort_order)
select * from (values
  ('a1000000-0000-0000-0000-000000000001'::uuid, '🎨', 'Sensory', 'purple',
    'Daily — 2–3 sessions of 15–20 min',
    'AJOT (2012); Pfeiffer et al. — 3×/week shows significant self-regulation gains in 6 weeks',
    'A 15-minute sensory bin before school is more effective than an hour on weekends.', 0),
  ('a1000000-0000-0000-0000-000000000002'::uuid, '🏃', 'Movement', 'teal',
    'Daily — minimum 5 days/week, 20–30 min',
    'Lang et al. Journal of Autism (2010) — 3–5×/week reduces aggression, stereotypy, and off-task behaviour',
    'Morning movement before learning activities improves focus and regulation for the rest of the day.', 1),
  ('a1000000-0000-0000-0000-000000000003'::uuid, '🗣️', 'Communication', 'amber',
    'Daily — 5–10 minute bursts woven into natural routines',
    'Frost & Bondy PECS (2002); Ganz et al. (2012) — daily AAC across all environments produces fastest language gains',
    'Mealtime, bathtime, dressing — every routine is a communication opportunity. No special session needed.', 2),
  ('a1000000-0000-0000-0000-000000000004'::uuid, '🧩', 'Social Skills', 'green',
    '3–5 times/week, 15–30 min structured + daily natural opportunities',
    'Kasari et al. (2012) — 3–5×/week structured joint engagement improved social communication significantly over 6 months',
    'A turn-taking game at dinner 4 nights a week outperforms a weekly clinic session for skill retention.', 3)
) as seed(id, emoji, label, color_key, freq, source, tip, sort_order)
where not exists (select 1 from public.activity_categories);

insert into public.activity_items (category_id, name, description, benefit, sort_order)
select * from (values
  ('a1000000-0000-0000-0000-000000000001'::uuid, 'Sensory Bins', 'Rice, kinetic sand, or water beads. Let the child explore freely with no goal.', 'Tactile regulation · Fine motor', 0),
  ('a1000000-0000-0000-0000-000000000001'::uuid, 'Finger Painting', 'Safe paints or pudding on a tray. No pressure to make anything.', 'Sensory tolerance · Creativity', 1),
  ('a1000000-0000-0000-0000-000000000001'::uuid, 'Playdough or Slime', 'Squeezing, rolling, pulling — deeply calming through proprioceptive input.', 'Calming · Motor skills', 2),
  ('a1000000-0000-0000-0000-000000000001'::uuid, 'Water Exploration', 'Pouring between cups, splashing. Water is naturally regulating.', 'Sensory integration', 3),

  ('a1000000-0000-0000-0000-000000000002'::uuid, 'Mini Trampoline', 'Jumping provides deep joint pressure — one of the most effective OT tools.', 'Regulation · Energy release', 0),
  ('a1000000-0000-0000-0000-000000000002'::uuid, 'Kids'' Yoga', 'Cat-cow, child''s pose — simple poses done together. No experience needed.', 'Breathing · Focus · Flexibility', 1),
  ('a1000000-0000-0000-0000-000000000002'::uuid, 'Home Obstacle Course', 'Pillows, tunnels, balance beams. Predictable physical challenges build confidence.', 'Motor planning · Coordination', 2),
  ('a1000000-0000-0000-0000-000000000002'::uuid, 'Follow the Leader', 'Take turns copying movements. Teaches turn-taking through movement.', 'Social skills · Imitation', 3),

  ('a1000000-0000-0000-0000-000000000003'::uuid, 'Picture Exchange (PECS)', 'Printed pictures or apps — child points to what they want. Dramatically reduces frustration.', 'Communication · Fewer meltdowns', 0),
  ('a1000000-0000-0000-0000-000000000003'::uuid, 'Cause-and-Effect Toys', 'Press button → music plays. Teaches intentional, purposeful communication.', 'Language readiness · Agency', 1),
  ('a1000000-0000-0000-0000-000000000003'::uuid, 'Wordless Books', 'Child ''tells'' the story using only pictures. No verbal pressure, pure expression.', 'Joint attention · Imagination', 2),
  ('a1000000-0000-0000-0000-000000000003'::uuid, 'Singing Together', 'Music activates different pathways than speech. Many non-verbal children respond to song first.', 'Language processing · Expression', 3),

  ('a1000000-0000-0000-0000-000000000004'::uuid, 'Turn-Taking Games', 'Simple board games or rolling a ball back and forth — teaches waiting and reciprocity.', 'Social skills · Impulse control', 0),
  ('a1000000-0000-0000-0000-000000000004'::uuid, 'Sorting and Categorising', 'Sort by colour, shape, or size. Many autistic children love patterns — lean into it.', 'Cognitive skills · Attention', 1),
  ('a1000000-0000-0000-0000-000000000004'::uuid, 'Lego or Block Construction', 'Free building or guided models. Lego therapy (LeGoff, 2004) shows measurable social gains.', 'Problem-solving · Social skills', 2),
  ('a1000000-0000-0000-0000-000000000004'::uuid, 'Cooking Together', 'Stirring, pouring, washing produce — multi-sensory, functional, builds life skills.', 'Sensory · Daily living', 3)
) as seed(category_id, name, description, benefit, sort_order)
where not exists (select 1 from public.activity_items);
