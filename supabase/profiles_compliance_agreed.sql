-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds a per-account flag recording when a user ticked the compliance
-- checkbox (Privacy Policy + Medical Disclaimer) shown after registration.
-- NULL means "hasn't agreed yet" — the app blocks entry until it's set.

alter table public.profiles add column if not exists compliance_agreed_at timestamptz;

-- One-time backfill: accounts that already existed before this gate shipped
-- never had a chance to tick the checkbox, so treat them as already agreed.
-- Run this UPDATE together with the ALTER above, right when you deploy this
-- feature — do NOT re-run it later, since by then genuine new signups will
-- also have compliance_agreed_at = null and this would wrongly wave them
-- through. (An earlier version of this file used a hardcoded UTC date
-- cutoff instead of "run once" — that broke for anyone in a timezone ahead
-- of UTC, e.g. a Singapore signup before 8am SGT has a created_at that's
-- still "yesterday" in UTC, so it silently bypassed the gate.)
update public.profiles
set compliance_agreed_at = created_at
where compliance_agreed_at is null;
