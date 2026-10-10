-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Run it BEFORE deploying the app version that reads these tables.
--
-- Development & Behaviour Guide (BondaDevelopment.jsx): moves the observation
-- quiz out of the app code so categories, questions and answer options can be
-- added / removed / re-valued from the admin app without a deploy.
--
--   dev_categories  — e.g. Communication, Daily living, Socialization
--   dev_questions   — per category, grouped by a free-text section
--   dev_options     — per question; each option has its own points value and
--                     a progress level (0 not yet / 1 sometimes / 2 usually,
--                     null = not an observation, e.g. "No chance to see")
--   dev_answers     — one row per answer a caregiver gives for a child
--
-- Removing a question/category: set active = false rather than deleting, so
-- past answers keep their link. (Deleting still works — answers keep a text
-- snapshot of the question/option — but the link is lost.)
--
-- Points are always taken from dev_options by a trigger at insert time, never
-- from the app, and are snapshotted on the answer: changing an option's value
-- later doesn't change points already earned.

-- ---------- catalogue ----------

create table if not exists public.dev_categories (
  id uuid primary key default gen_random_uuid(),
  key text unique,                                  -- stable slug, optional
  name text not null,
  blurb text not null default '',
  icon text not null default 'chat',                -- chat | home | users | heart | gift | bell | coin
  bg text not null default '#E6EDEC',               -- muted tag background
  tx text not null default '#2E5A56',               -- tag text / accent
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.dev_questions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.dev_categories (id) on delete cascade,
  section text not null default '',
  question text not null,
  example text not null default '',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.dev_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.dev_questions (id) on delete cascade,
  label text not null,
  sub text not null default '',
  points integer not null default 0,
  level smallint check (level between 0 and 2),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists dev_questions_category_idx on public.dev_questions (category_id, sort_order);
create index if not exists dev_options_question_idx on public.dev_options (question_id, sort_order);

-- ---------- answers ----------

create table if not exists public.dev_answers (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  answered_by uuid references auth.users (id) on delete set null default auth.uid(),
  category_id uuid references public.dev_categories (id) on delete set null,
  question_id uuid references public.dev_questions (id) on delete set null,
  option_id uuid references public.dev_options (id) on delete set null,
  -- snapshot at answer time, so history survives catalogue edits
  section text not null default '',
  question_text text not null default '',
  option_label text not null default '',
  level smallint check (level between 0 and 2),
  points integer not null default 0,
  observed_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists dev_answers_child_idx on public.dev_answers (child_id, observed_on);
create index if not exists dev_answers_question_idx on public.dev_answers (question_id);
create index if not exists dev_answers_option_idx on public.dev_answers (option_id);

-- Fill points / level / snapshot from the chosen option, ignoring whatever the
-- client sent, so points can't be inflated from the browser.
create or replace function public.dev_answers_fill_from_option()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.option_id is not null then
    select o.points, o.level, o.label, q.id, q.question, q.section, q.category_id
      into new.points, new.level, new.option_label, new.question_id, new.question_text, new.section, new.category_id
    from public.dev_options o
    join public.dev_questions q on q.id = o.question_id
    where o.id = new.option_id;
    if not found then
      raise exception 'Unknown option %', new.option_id;
    end if;
  elsif auth.uid() is not null
        and not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    -- only admins / the SQL editor (data migrations) may write option-less rows
    raise exception 'option_id is required';
  end if;
  return new;
end;
$$;

drop trigger if exists dev_answers_fill on public.dev_answers;
create trigger dev_answers_fill
  before insert on public.dev_answers
  for each row execute function public.dev_answers_fill_from_option();

-- Total points per child (respects RLS of the caller).
create or replace view public.dev_child_points
with (security_invoker = true) as
  select child_id, coalesce(sum(points), 0)::integer as points
  from public.dev_answers
  group by child_id;

-- ---------- row level security ----------

alter table public.dev_categories enable row level security;
alter table public.dev_questions enable row level security;
alter table public.dev_options enable row level security;
alter table public.dev_answers enable row level security;

do $$
declare t text;
begin
  foreach t in array array['dev_categories', 'dev_questions', 'dev_options'] loop
    execute format('drop policy if exists "Viewable by authenticated users" on public.%I', t);
    execute format('create policy "Viewable by authenticated users" on public.%I for select to authenticated using (true)', t);
    execute format('drop policy if exists "Admins can manage" on public.%I', t);
    execute format('create policy "Admins can manage" on public.%I for all to authenticated using (exists (select 1 from public.profiles where id = auth.uid() and role = ''admin'')) with check (exists (select 1 from public.profiles where id = auth.uid() and role = ''admin''))', t);
  end loop;
end $$;

-- Caregivers can read and add answers for their own children only. No
-- update/delete for caregivers, so earned points can't be rewritten.
drop policy if exists "Users can view answers for their own children" on public.dev_answers;
create policy "Users can view answers for their own children"
  on public.dev_answers for select
  to authenticated
  using (exists (select 1 from public.children c where c.id = child_id and c.user_id = auth.uid()));

drop policy if exists "Users can insert answers for their own children" on public.dev_answers;
create policy "Users can insert answers for their own children"
  on public.dev_answers for insert
  to authenticated
  with check (exists (select 1 from public.children c where c.id = child_id and c.user_id = auth.uid()));

drop policy if exists "Admins can manage all answers" on public.dev_answers;
create policy "Admins can manage all answers"
  on public.dev_answers for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ---------- seed: the questions that used to be hard-coded ----------
-- Only runs on an empty catalogue. Every option starts at 20 points (the old
-- flat rate) except "No chance to see" (0) — change values from the admin app.

do $$
declare
  seed jsonb := $json$[
    {"key":"communication","name":"Communication","icon":"chat","bg":"#EDE8F3","tx":"#574B78",
     "blurb":"Understanding others and getting a message across.",
     "questions":[
      ["Understanding","Responds to their name","Turns, looks, or replies when you call them from across the room."],
      ["Understanding","Follows a simple request","Gets their shoes when asked, without you pointing."],
      ["Understanding","Understands “stop” or “wait”","Pauses — even briefly — when you say it."],
      ["Expressing","Lets you know what they want","With a word, sign, picture card, or by leading your hand."],
      ["Expressing","Uses gestures to communicate","Points, waves, nods, or shakes their head."],
      ["Expressing","Puts two ideas together","Two words, two signs, or a word plus a point — “more juice”."],
      ["Everyday symbols","Recognises a familiar symbol","Their name card, a favourite logo, or a picture on a menu."],
      ["Everyday symbols","Shows interest in books","Turns pages, points at pictures, or brings you a book."]]},
    {"key":"dailyliving","name":"Daily living","icon":"home","bg":"#E4ECF3","tx":"#3A5A78",
     "blurb":"Everyday self-care and getting things done.",
     "questions":[
      ["Personal care","Helps with dressing","Pushes arms through sleeves, pulls up trousers."],
      ["Personal care","Feeds themselves","Uses a spoon, fork, or fingers for most of a meal."],
      ["Personal care","Manages a hygiene step","Washes hands or brushes teeth, with help is fine."],
      ["Around the home","Helps with a small task","Puts toys in a box, carries their plate to the sink."],
      ["Around the home","Follows a home routine","Comes to the table at mealtime, to the door for shoes."],
      ["Out and about","Copes with an outing","Manages a shop or clinic trip with your support."],
      ["Out and about","Shows basic safety sense","Stops at the kerb, stays near you in a busy place."]]},
    {"key":"socialization","name":"Socialization","icon":"users","bg":"#F3E7EA","tx":"#7A4651",
     "blurb":"Connecting, playing, and handling feelings.",
     "questions":[
      ["Relationships","Recognises familiar people","Greets, reaches for, or smiles at a parent or sibling."],
      ["Relationships","Shares a look during a moment","Glances at you during a game or when excited."],
      ["Relationships","Shows you something","Looks at a toy, then at you, then back — sharing it."],
      ["Play & leisure","Plays near or with others","Rolls a ball back, takes a turn, joins a game."],
      ["Play & leisure","Shows pretend play","Feeds a doll, makes a car “drive”, stirs a pretend pot."],
      ["Play & leisure","Seeks out a favourite thing","Chooses a preferred toy, song, or video."],
      ["Coping","Recovers from a change","Settles after a routine shifts, with or without help."],
      ["Coping","Waits a short moment","Tolerates a brief wait for a turn or a snack."]]}
  ]$json$;
  cat jsonb; q jsonb; v_cat uuid; v_q uuid; i int := 0; j int;
begin
  if exists (select 1 from public.dev_categories) then return; end if;
  for cat in select * from jsonb_array_elements(seed) loop
    insert into public.dev_categories (key, name, blurb, icon, bg, tx, sort_order)
    values (cat->>'key', cat->>'name', cat->>'blurb', cat->>'icon', cat->>'bg', cat->>'tx', i)
    returning id into v_cat;
    j := 0;
    for q in select * from jsonb_array_elements(cat->'questions') loop
      insert into public.dev_questions (category_id, section, question, example, sort_order)
      values (v_cat, q->>0, q->>1, q->>2, j)
      returning id into v_q;
      insert into public.dev_options (question_id, label, sub, points, level, sort_order) values
        (v_q, 'Not yet',          'Never, so far',  20, 0,    0),
        (v_q, 'Sometimes',        'Now and then',   20, 1,    1),
        (v_q, 'Usually',          'Most times',     20, 2,    2),
        (v_q, 'No chance to see', 'Didn''t come up', 0, null, 3);
      j := j + 1;
    end loop;
    i := i + 1;
  end loop;
end $$;

-- ---------- copy existing answers ----------
-- children.growth_observations ({date, category, section, skill, score}) →
-- dev_answers, matched to the seeded questions/options. Children that already
-- have answers are skipped, so re-running is safe. The old column is left in
-- place (no longer written by the guide).

insert into public.dev_answers (child_id, answered_by, category_id, question_id, option_id, section, question_text, option_label, level, points, observed_on)
select c.id, c.user_id, cat.id, q.id, o.id,
  coalesce(obs->>'section', ''),
  coalesce(obs->>'skill', ''),
  case (obs->>'score')::int when 0 then 'Not yet' when 1 then 'Sometimes' else 'Usually' end,
  (obs->>'score')::smallint,
  20,
  coalesce((obs->>'date')::date, current_date)
from public.children c
cross join lateral jsonb_array_elements(case when jsonb_typeof(c.growth_observations) = 'array' then c.growth_observations else '[]'::jsonb end) obs
left join public.dev_categories cat on cat.key = obs->>'category'
left join public.dev_questions q on q.category_id = cat.id and q.question = obs->>'skill'
left join public.dev_options o on o.question_id = q.id and o.level = (obs->>'score')::smallint
where not exists (select 1 from public.dev_answers a where a.child_id = c.id);
