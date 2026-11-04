-- Run this once in the Supabase Dashboard → SQL Editor for this project,
-- AFTER rewards.sql and reward_claims.sql. Safe to re-run.
--
-- Redemption period: a reward can only be redeemed while
--   starts_at is set, ends_at is set, and starts_at <= now() < ends_at.
-- An empty period (either date missing) or one that has ended blocks
-- redemption. Claims already made keep their code.
--
-- claim_reward now takes the cost and period from public.rewards (matched on
-- rewards.code = reward_claims.reward_id) instead of the hardcoded list in
-- reward_claims.sql. Re-running reward_claims.sql would put the old version
-- back, so re-run this file after it.

-- Caregivers see every active reward, so the app can show why one can't be
-- redeemed (same policy as in rewards.sql).
drop policy if exists "Active rewards are viewable by authenticated users" on public.rewards;
create policy "Active rewards are viewable by authenticated users"
  on public.rewards for select
  to authenticated
  using (
    is_active
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create or replace function public.claim_reward(p_child_id uuid, p_reward_id text)
returns public.reward_claims
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_reward public.rewards;
  v_points integer;
  v_claim public.reward_claims;
begin
  if v_uid is null then
    raise exception 'Not signed in';
  end if;

  select * into v_reward from public.rewards where code = p_reward_id and is_active;
  if not found then
    raise exception 'Unknown reward %', p_reward_id;
  end if;

  if p_child_id is not null
     and not exists (select 1 from public.children where id = p_child_id and user_id = v_uid) then
    raise exception 'Unknown child %', p_child_id;
  end if;

  select * into v_claim from public.reward_claims where user_id = v_uid and reward_id = p_reward_id;
  if found then
    return v_claim;
  end if;

  if v_reward.starts_at is null or v_reward.ends_at is null
     or now() < v_reward.starts_at or now() >= v_reward.ends_at then
    raise exception 'Reward % is outside its redemption period', p_reward_id;
  end if;

  -- Points are pooled across all of the caregiver's active children.
  select coalesce(sum(a.points), 0) into v_points
  from public.dev_answers a
  join public.children c on c.id = a.child_id
  where c.user_id = v_uid and c.active is not false;
  if v_points < v_reward.cost_points then
    raise exception 'Not enough points: % of %', v_points, v_reward.cost_points;
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
