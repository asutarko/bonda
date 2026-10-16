-- Run this once in the Supabase Dashboard → SQL Editor for this project,
-- AFTER community_admin.sql (uses profiles.role). Safe to re-run.
--
-- Master data for the rewards caregivers can redeem with their points
-- ("Redeem your points"). Replaces the hardcoded REWARDS list in
-- GrowthTracker.jsx. Managed by admins; everyone signed in can read the
-- active ones.
--
-- reward_type says what the reward *is*; config holds the details that type
-- needs, so a new kind of reward doesn't need new columns:
--
--   reward_type              config example
--   -----------------------  ---------------------------------------------------
--   subscription_discount    {"percent": 10}
--   subscription_free        {"months": 1}
--   community_access         {"months": 1, "group_id": "<community_groups.id>"}
--                            (group_id null = the general private community)
--   mobile_topup             {"amount": 10, "currency": "SGD"}
--   voucher                  {"amount": 20, "currency": "SGD", "merchant": "NTUC FairPrice"}
--   other                    anything — describe it in title/description
--
-- fulfillment: 'auto'   = the app applies it on redeem (discounts, community access)
--              'manual' = an admin fulfils it afterwards (top-ups, vouchers)

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                  -- stable slug, e.g. 'off10', 'topup10'
  title text not null,
  description text not null default '',
  reward_type text not null default 'other'
    check (reward_type in ('subscription_discount', 'subscription_free', 'community_access', 'mobile_topup', 'voucher', 'other')),
  config jsonb not null default '{}'::jsonb,
  cost_points integer not null check (cost_points > 0),
  fulfillment text not null default 'manual' check (fulfillment in ('auto', 'manual')),
  requires_phone boolean not null default false,  -- ask for a phone number on redeem (top-ups)
  stock integer check (stock is null or stock >= 0), -- null = unlimited
  per_user_limit integer check (per_user_limit is null or per_user_limit > 0), -- null = unlimited
  image_url text not null default '',
  is_popular boolean not null default false,  -- "Most popular" badge
  is_active boolean not null default true,
  starts_at timestamptz,                      -- null = available right away
  ends_at timestamptz,                        -- null = no end date
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create index if not exists rewards_active_sort_idx on public.rewards (is_active, sort_order);

-- keep updated_at current on every edit
create or replace function public.rewards_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists rewards_touch_updated_at on public.rewards;
create trigger rewards_touch_updated_at
  before update on public.rewards
  for each row execute function public.rewards_touch_updated_at();

alter table public.rewards enable row level security;

drop policy if exists "Active rewards are viewable by authenticated users" on public.rewards;
create policy "Active rewards are viewable by authenticated users"
  on public.rewards for select
  to authenticated
  using (
    (is_active
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at > now()))
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Admins can manage rewards" on public.rewards;
create policy "Admins can manage rewards"
  on public.rewards for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Seed: the three rewards that were hardcoded in GrowthTracker.jsx (same
-- codes, so already-redeemed claims still match), plus examples of the new
-- kinds. Existing rows are left alone on re-run.
insert into public.rewards (code, title, description, reward_type, config, cost_points, fulfillment, requires_phone, is_popular, sort_order) values
  ('off5',      '5% off Bonda',                      'Applied to your next subscription payment.',            'subscription_discount', '{"percent": 5}',                       5000,  'auto',   false, false, 10),
  ('off10',     '10% off Bonda',                     'Applied to your next subscription payment.',            'subscription_discount', '{"percent": 10}',                      10000, 'auto',   false, true,  20),
  ('free1',     '1 month of Bonda free',             'Added to your subscription as a free month.',           'subscription_free',     '{"months": 1}',                        20000, 'auto',   false, false, 30),
  ('community1','1 month of private community access','Join the private parent community for one month.',     'community_access',      '{"months": 1, "group_id": null}',      8000,  'auto',   false, false, 40),
  ('topup10',   'S$10 mobile top-up',                'Prepaid credit sent to your phone number within 3 working days.', 'mobile_topup', '{"amount": 10, "currency": "SGD"}',     12000, 'manual', true,  false, 50)
on conflict (code) do nothing;
