-- Run this once in the Supabase Dashboard → SQL Editor for this project,
-- AFTER dev_tracker.sql. Safe to re-run.
--
-- Point rules for the Development tracker (BondaDevelopment.jsx):
--
--   * Claim limit — each question earns points once per period. A question's
--     frequency is 'daily' (default), 'weekly' or 'unlimited'. Answering again
--     in the same period is still saved (history/charts keep it) but earns 0.
--       - observation questions: limit is per child
--       - checkin questions (about the parent): limit is per account, so a
--         parent with several children can't claim the same check-in twice
--   * The date is the server's (Asia/Singapore), never the app's, and the
--     answering user is always auth.uid() — so neither can be used to re-claim.
--   * No deductions — option points can't be negative.
--   * Rule version — every answer is stamped with the current dev_point_rules
--     version. When the rules change, insert a new version row.
--   * Question kind — 'observation' (about the child, the default) or
--     'checkin' (about the parent's own time/effort). Give check-in options no
--     level (null) so they never show in the child's progress charts.
--
-- Questions and options themselves are managed in the database / admin app;
-- this file adds none.

-- ---------- catalogue additions ----------

alter table public.dev_questions
  add column if not exists kind text not null default 'observation'
  check (kind in ('observation', 'checkin'));

alter table public.dev_questions
  add column if not exists frequency text not null default 'daily'
  check (frequency in ('daily', 'weekly', 'unlimited'));

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'dev_options_points_nonneg') then
    alter table public.dev_options add constraint dev_options_points_nonneg check (points >= 0);
  end if;
end $$;

-- ---------- rule versions ----------

create table if not exists public.dev_point_rules (
  version integer primary key,
  summary text not null default '',
  created_at timestamptz not null default now()
);

insert into public.dev_point_rules (version, summary) values
  (1, 'Points per option from dev_options. Each question earns once per period (daily/weekly, per child for observations, per account for check-ins); repeats are saved with 0 points. No negative points. Server date, Asia/Singapore.')
on conflict (version) do nothing;

alter table public.dev_point_rules enable row level security;
drop policy if exists "Viewable by authenticated users" on public.dev_point_rules;
create policy "Viewable by authenticated users" on public.dev_point_rules for select to authenticated using (true);
drop policy if exists "Admins can manage" on public.dev_point_rules;
create policy "Admins can manage" on public.dev_point_rules for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ---------- answer additions ----------

alter table public.dev_answers add column if not exists rule_version integer references public.dev_point_rules (version);
-- '<owner>|<period>' for answers that earned points, e.g. 'c:<child>|2026-10-12'
-- or 'u:<user>|2026-W42'; null for repeats and for rows from before these rules.
alter table public.dev_answers add column if not exists claim_key text;

-- backstop against double counting, even under concurrent inserts
create unique index if not exists dev_answers_claim_uidx
  on public.dev_answers (question_id, claim_key) where claim_key is not null;

-- "today" for claim limits
create or replace function public.dev_today()
returns date
language sql
stable
as $$ select (now() at time zone 'Asia/Singapore')::date $$;

-- Replaces the trigger function from dev_tracker.sql (the trigger itself is
-- unchanged). Points/level/snapshot still come from the chosen option, never
-- from the app.
create or replace function public.dev_answers_fill_from_option()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_privileged boolean := auth.uid() is null   -- SQL editor / data migrations
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
  v_freq text;
  v_kind text;
  v_owner text;
  v_period text;
begin
  if not v_privileged then
    new.answered_by := auth.uid();
    new.observed_on := public.dev_today();
  end if;
  select max(version) into new.rule_version from public.dev_point_rules;
  new.claim_key := null;

  if new.option_id is null then
    -- only admins / the SQL editor may write option-less rows
    if not v_privileged then
      raise exception 'option_id is required';
    end if;
    return new;
  end if;

  select o.points, o.level, o.label, q.id, q.question, q.section, q.category_id, q.frequency, q.kind
    into new.points, new.level, new.option_label, new.question_id, new.question_text, new.section, new.category_id, v_freq, v_kind
  from public.dev_options o
  join public.dev_questions q on q.id = o.question_id
  where o.id = new.option_id;
  if not found then
    raise exception 'Unknown option %', new.option_id;
  end if;

  if v_freq <> 'unlimited' then
    v_owner := case when v_kind = 'checkin' then 'u:' || coalesce(new.answered_by::text, '-') else 'c:' || new.child_id::text end;
    v_period := case when v_freq = 'weekly' then to_char(new.observed_on, 'IYYY-"W"IW') else new.observed_on::text end;
    new.claim_key := v_owner || '|' || v_period;
    -- serialise claims on the same question/owner/period, then check
    perform pg_advisory_xact_lock(hashtext(new.question_id::text || '|' || new.claim_key));
    if exists (select 1 from public.dev_answers a where a.question_id = new.question_id and a.claim_key = new.claim_key) then
      new.points := 0;          -- already claimed this period: keep the answer, no points
      new.claim_key := null;
    end if;
  end if;
  return new;
end;
$$;
