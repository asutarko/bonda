-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds the "Behaviour Training" rules and teaching methods shown on the
-- Behaviour Training screen, manageable from the app by admins (role =
-- 'admin' on public.profiles). Regular users can only view.

create table if not exists public.training_rules (
  id uuid primary key default gen_random_uuid(),
  env text not null default 'home',
  type text not null default 'good',
  label text not null,
  how text not null default '',
  sort_order int not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.training_methods (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  color_key text not null default 'purple',
  body text not null default '',
  tip text not null default '',
  sort_order int not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.training_rules enable row level security;
alter table public.training_methods enable row level security;

drop policy if exists "Training rules are viewable by authenticated users" on public.training_rules;
create policy "Training rules are viewable by authenticated users"
  on public.training_rules for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage training rules" on public.training_rules;
create policy "Admins can manage training rules"
  on public.training_rules for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Training methods are viewable by authenticated users" on public.training_methods;
create policy "Training methods are viewable by authenticated users"
  on public.training_methods for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage training methods" on public.training_methods;
create policy "Admins can manage training methods"
  on public.training_methods for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Seed with the rules and methods that previously lived in src/App.jsx
-- (TrainingScreen) so admins can edit them from the app instead of
-- redeploying code.
insert into public.training_rules (env, type, label, how, sort_order)
select * from (values
  ('home', 'good', 'Asking for help', 'Teach: hold up a picture card = ''I need help''. Reward within 3 seconds with praise + preferred item.', 0),
  ('home', 'good', 'Sitting at mealtimes', 'Use a visual ''sit'' card at their chair. Start with 2 minutes, increase gradually. Celebrate each step.', 1),
  ('home', 'good', 'Putting toys away', 'Picture labels on bins, a ''tidy up'' song as cue. Make it a timer game — no shame if they miss.', 2),
  ('home', 'good', 'Gentle touch', 'Model on a doll first. Use pictures: ''gentle hands''. Immediate praise when shown — not delayed.', 3),
  ('home', 'good', 'Following bedtime routine', 'Visual schedule with pictures. Same sequence every night. Small reward for each step completed.', 4),

  ('home', 'bad', 'Hitting or biting family', 'Stay calm. Say ''No hitting'' once. Block physically. Redirect hands to squeeze toy immediately. Never raise voice.', 0),
  ('home', 'bad', 'Throwing objects', 'Find the trigger (avoidance? Sensory need?). Create a ''throwing zone'' with soft balls. Remove dangerous objects proactively.', 1),
  ('home', 'bad', 'Refusing hygiene', 'One step at a time. Use preferred music, flavoured toothpaste, visual timer. Never force — it creates lasting aversion.', 2),
  ('home', 'bad', 'Running Away / Wandering Off', 'Red hand ''stop'' card. Practise ''stop'' as a daily game when calm. Check escape triggers: open doors, sounds, water nearby. Affects 1 in 2 autistic children — treat as a safety priority.', 3),

  ('school', 'good', 'Sitting in class', 'Sensory cushion + visual ''sit'' card on desk. Short chunks with movement breaks — don''t demand sustained sitting.', 0),
  ('school', 'good', 'Communicating needs', 'Teach: tap teacher''s arm or show a ''my turn'' card. Physical alternatives to hand-raising for motor-challenged children.', 1),
  ('school', 'good', 'Sharing / turn-taking', '''My turn / your turn'' visual card. Practise with preferred activities first so sharing feels safe, not threatening.', 2),
  ('school', 'good', 'Packing/unpacking bag', 'Visual checklist inside the bag. Practise daily at home — don''t rely on school alone to teach this.', 3),

  ('school', 'bad', 'Meltdowns in class', 'Pre-agreed calm corner with sensory items — not punishment, a tool. Identify and reduce triggers before they escalate.', 0),
  ('school', 'bad', 'Refusing tasks', '''First-Then'' boards: ''First work, then iPad.'' Micro-steps, choices within task — restore control without removing demand.', 1),
  ('school', 'bad', 'Loud vocalizations', 'Identify function: overwhelm? Excitement? Boredom? Fidget tool + quieter activity. Never shush harshly — it escalates anxiety.', 2),
  ('school', 'bad', 'Leaving the classroom', 'Pre-arrange a ''pass to quiet room'' system. Giving control reduces the urgency to escape.', 3)
) as seed(env, type, label, how, sort_order)
where not exists (select 1 from public.training_rules);

insert into public.training_methods (title, color_key, body, tip, sort_order)
select * from (values
  ('Positive Reinforcement (ABA)', 'amber', 'Immediately reward desired behaviour within 3 seconds. A 2024 BMC Psychology study showed significant social, communication, and daily living improvements using reinforcement-based ABA.', 'Timing is everything. A reward 10 seconds late teaches nothing. 3 seconds is the window.', 0),
  ('Visual Supports', 'teal', 'Picture cards, First-Then boards, visual schedules — they reduce anxiety by making expectations concrete and predictable. Research confirms significant on-task behaviour improvements.', 'Put visuals at the child''s eye level. Use real photos of your child and your home — not clip art.', 1),
  ('Social Stories', 'green', 'Short illustrated stories explaining social situations in first person. Developed by Carol Gray — one of the most evidence-based tools for teaching rules to autistic children.', '4–6 sentences, pictures, read daily — not just when problems arise. Prevention, not reaction.', 2),
  ('Task Analysis', 'purple', '''Wash hands'' = 7 separate steps. Break every skill into the smallest possible steps. Teach each explicitly before moving to the next.', 'Never assume a step is obvious. Write every micro-step down and teach each one.', 3),
  ('Consistency', 'red', 'Autistic children struggle to generalise rules across settings. Parents and teachers must use identical language, visuals, and rewards — or the child re-learns the same rule multiple times.', 'Share your visual systems with the school. Inconsistency is the #1 reason good training fails.', 4)
) as seed(title, color_key, body, tip, sort_order)
where not exists (select 1 from public.training_methods);
