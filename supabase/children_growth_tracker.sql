-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Backs the Development Tracker (DevelopmentGuideScreen): a Vineland-inspired
-- observation quiz across communication / daily living / socialization, which
-- earns points redeemable for Bonda subscription discounts.
--
-- Kept separate from children.dev_log, which is an unrelated free-text
-- caregiver journal (sleep/food/behaviour notes) used by MyChildScreen.

-- Dated observation entries logged from the quiz: {date, category, section, skill, score}.
-- score is 0/1/2 ("not yet"/"sometimes"/"usually"); "no chance to see" answers
-- are never stored here, since only a real observation should earn points.
alter table public.children add column if not exists growth_observations jsonb not null default '[]'::jsonb;

-- Rewards claimed from the points catalogue: { [rewardId]: "BONDA-XXXXX" }.
alter table public.children add column if not exists growth_claims jsonb not null default '{}'::jsonb;
