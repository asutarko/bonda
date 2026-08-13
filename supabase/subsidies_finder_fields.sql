-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds the fields the Subsidy Finder needs: filter metadata (age, residency,
-- support type, target group, means-testing) and monitoring metadata used by
-- the automated checker (supabase/functions/check-subsidies) to detect dead
-- links and content changes without any manual step.

alter table public.subsidies
  add column if not exists age_min int not null default 0,
  add column if not exists age_max int not null default 99,
  add column if not exists residency text[] not null default '{}'::text[],
  add column if not exists support_types text[] not null default '{}'::text[],
  add column if not exists target_groups text[] not null default '{}'::text[],
  add column if not exists means_tested boolean not null default false,
  add column if not exists means_note text not null default '',
  add column if not exists source_url text not null default '',
  add column if not exists source_name text not null default '',
  add column if not exists available_online boolean not null default true,
  add column if not exists content_hash text,
  add column if not exists last_checked_at timestamptz,
  add column if not exists last_changed_at timestamptz;

-- residency: any of 'SC' | 'PR' | 'Foreigner'
-- support_types: any of 'financial' | 'therapy' | 'education' | 'devices' | 'transport' | 'caregiving' | 'work'
-- target_groups: any of 'ASD' | 'ADHD' | 'special_needs' | 'pwd'

comment on column public.subsidies.available_online is
  'Set to false by the automated checker when source_url stops resolving. Rows with available_online = false are excluded from the app.';
comment on column public.subsidies.content_hash is
  'Hash of the last-seen text content at source_url, used by the automated checker to detect page changes.';
comment on column public.subsidies.last_changed_at is
  'Set by the automated checker whenever content_hash changes. Drives the "Latest Updates" carousel — no manual news post required.';
