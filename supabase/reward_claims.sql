-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Run it AFTER dev_tracker.sql and BEFORE deploying the app version that
-- reads reward_claims.
--
-- Rewards redeemed from the points catalogue (BondaDevelopment.jsx /
-- GrowthTracker.jsx RedeemPointsScreen). Replaces children.growth_claims.
--
-- Each reward can be claimed ONCE PER ACCOUNT, whichever child's points
-- unlocked it — a caregiver with several children still gets "10% off Bonda"
-- only once. Enforced by the unique (user_id, reward_id) constraint, so it
-- holds even against a double tap or two open tabs.
--
-- Caregivers can't write this table directly; claims only go through
-- claim_reward(), which checks the child is theirs, that child's points
-- (from dev_answers) reach the reward's cost, and generates the code.

create table if not exists public.reward_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  child_id uuid references public.children (id) on delete set null,  -- whose points unlocked it
  reward_id text not null,                                            -- off5 | off10 | free1
  code text not null unique,
  points_at_claim integer,
  claimed_at timestamptz not null default now(),
  unique (user_id, reward_id)
);

-- ---------- row level security ----------

alter table public.reward_claims enable row level security;

drop policy if exists "Users can view their own claims" on public.reward_claims;
create policy "Users can view their own claims"
  on public.reward_claims for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Admins can manage all claims" on public.reward_claims;
create policy "Admins can manage all claims"
  on public.reward_claims for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ---------- claim ----------
-- Costs mirror REWARDS in BondaDevelopment.jsx / GrowthTracker.jsx; the app's
-- values are display-only, these are the ones that count.
-- Claiming a reward the account already has returns the existing claim (same
-- code) instead of making a second one.

create or replace function public.claim_reward(p_child_id uuid, p_reward_id text)
returns public.reward_claims
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_cost integer;
  v_points integer;
  v_claim public.reward_claims;
begin
  if v_uid is null then
    raise exception 'Not signed in';
  end if;

  v_cost := case p_reward_id
    when 'off5'  then 5000
    when 'off10' then 10000
    when 'free1' then 20000
  end;
  if v_cost is null then
    raise exception 'Unknown reward %', p_reward_id;
  end if;

  if not exists (select 1 from public.children where id = p_child_id and user_id = v_uid) then
    raise exception 'Unknown child %', p_child_id;
  end if;

  select * into v_claim from public.reward_claims where user_id = v_uid and reward_id = p_reward_id;
  if found then
    return v_claim;
  end if;

  select coalesce(sum(points), 0) into v_points from public.dev_answers where child_id = p_child_id;
  if v_points < v_cost then
    raise exception 'Not enough points: % of %', v_points, v_cost;
  end if;

  insert into public.reward_claims (user_id, child_id, reward_id, code, points_at_claim)
  values (v_uid, p_child_id, p_reward_id, 'BONDA-' || upper(substr(md5(gen_random_uuid()::text), 1, 8)), v_points)
  on conflict (user_id, reward_id) do nothing
  returning * into v_claim;

  -- lost a race with a concurrent claim: hand back the one that won
  if not found then
    select * into v_claim from public.reward_claims where user_id = v_uid and reward_id = p_reward_id;
  end if;
  return v_claim;
end;
$$;

revoke all on function public.claim_reward(uuid, text) from public, anon;
grant execute on function public.claim_reward(uuid, text) to authenticated;

-- ---------- copy existing claims ----------
-- children.growth_claims ({ rewardId: code }) → reward_claims. Where an
-- account claimed the same reward on several children, only one is kept.
-- Re-running is safe. The old column is left in place (no longer read).

insert into public.reward_claims (user_id, child_id, reward_id, code)
select distinct on (c.user_id, k.key) c.user_id, c.id, k.key, k.value
from public.children c
cross join lateral jsonb_each_text(case when jsonb_typeof(c.growth_claims) = 'object' then c.growth_claims else '{}'::jsonb end) k
where c.user_id is not null
order by c.user_id, k.key, c.id
on conflict do nothing;
