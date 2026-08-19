-- Run this once in the Supabase Dashboard → SQL Editor for this project,
-- AFTER subsidies_finder_seed.sql.
--
-- Adds 'ADHD' to target_groups alongside 'ASD' for every scheme that
-- already targets autism. These schemes are gated on a diagnosed
-- developmental disability / assessed functional impairment, not on the
-- specific diagnosis label, so the same schemes that list ASD also apply
-- to children and adults diagnosed with ADHD (subject to the same
-- assessment and means-testing already noted on each scheme).
-- Safe to re-run: only appends 'ADHD' where it isn't already present.

update public.subsidies
set target_groups = array_append(target_groups, 'ADHD')
where 'ASD' = any(target_groups)
  and not ('ADHD' = any(target_groups));
