-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Backfills freq/source/tip for the "Sensory" activity category in case it
-- was created (e.g. via the app's "+ Add Category") before activities.sql's
-- seed insert ran, which only fires when public.activity_categories is empty.

update public.activity_categories
set
  freq = 'Daily — 2–3 sessions of 15–20 min',
  source = 'AJOT (2012); Pfeiffer et al. — 3×/week shows significant self-regulation gains in 6 weeks',
  tip = 'A 15-minute sensory bin before school is more effective than an hour on weekends.'
where label = 'Sensory'
  and freq = '' and source = '' and tip = '';
