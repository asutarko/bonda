-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds private parent-created groups (community_groups): hidden from
-- everyone but members, joinable only via invite code. Self-join RLS can't
-- check a client-supplied code against the row being inserted, so joining
-- a private group goes through the join_private_group() function instead.

alter table public.community_groups add column if not exists is_private boolean not null default false;
alter table public.community_groups add column if not exists invite_code text unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);

-- Non-members can no longer see private groups in "All groups" / Home.
drop policy if exists "Groups are viewable by authenticated users" on public.community_groups;
create policy "Groups viewable by authenticated users"
  on public.community_groups for select
  to authenticated
  using (
    is_private = false
    or created_by = auth.uid()
    or exists (
      select 1 from public.community_group_members m
      where m.group_id = id and m.user_id = auth.uid()
    )
  );

-- Self-join now only works for public groups.
drop policy if exists "Users can join groups themselves" on public.community_group_members;
create policy "Users can join public groups themselves"
  on public.community_group_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.community_groups g where g.id = group_id and g.is_private = false)
  );

-- The creator still joins their own group (private or not) right after
-- creating it — see createGroup() in CommunityScreen.jsx.
drop policy if exists "Creators can join their own group" on public.community_group_members;
create policy "Creators can join their own group"
  on public.community_group_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.community_groups g where g.id = group_id and g.created_by = auth.uid())
  );

-- Joining a private group by code — security definer so it can bypass the
-- membership RLS above once the code has been checked server-side.
create or replace function public.join_private_group(p_code text)
returns public.community_groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group public.community_groups;
begin
  select * into v_group from public.community_groups where invite_code = p_code and is_private = true;
  if v_group.id is null then
    raise exception 'Invalid invite code';
  end if;
  insert into public.community_group_members (group_id, user_id)
  values (v_group.id, auth.uid())
  on conflict do nothing;
  return v_group;
end;
$$;

grant execute on function public.join_private_group(text) to authenticated;
