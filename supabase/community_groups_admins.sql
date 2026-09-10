-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds per-group admins to parent-created PRIVATE groups (community_groups):
-- the owner (created_by) can appoint other members as admins, and
-- owners/admins can then remove other members from the group. Public
-- groups don't get this feature — see the is_private check in both the
-- policy below and CommunityScreen.jsx's isGroupOwner/isGroupAdmin.

alter table public.community_groups add column if not exists admins uuid[] not null default '{}';

-- Promoting/demoting an admin is just updating this column, which the
-- existing "Creators can update or delete their own groups" policy already
-- covers (owner-only) — no new policy needed for that. The UI only offers
-- this for private groups, but the admins column itself is harmless to
-- carry on public group rows too (just unused).

-- Admins of a private group can also update the group row — but only to
-- rename it or change its description (CommunityScreen.jsx's "Edit group"
-- form only sends those two fields when editingAsAdmin is true). The trigger
-- below enforces that server-side too, in case a stale client ever sends
-- more: any editor who isn't the owner may only change name/description,
-- everything else on the row must stay exactly as it was.
drop policy if exists "Admins can edit their private group" on public.community_groups;
create policy "Admins can edit their private group"
  on public.community_groups for update
  to authenticated
  using (is_private and auth.uid() = any(admins))
  with check (is_private and auth.uid() = any(admins));

-- Re-declare the owner's own update policy with an explicit (permissive)
-- with check. Without one, Postgres reuses the using clause as the check —
-- which would require created_by to still equal auth.uid() on the updated
-- row, blocking the "transfer ownership" case below where the owner
-- deliberately changes created_by to someone else. The using clause still
-- gate-keeps who may update the row at all (only the *current* owner); the
-- trigger below further restricts what a transfer is allowed to look like.
drop policy if exists "Creators can update or delete their own groups" on public.community_groups;
create policy "Creators can update or delete their own groups"
  on public.community_groups for update
  to authenticated
  using (created_by = auth.uid())
  with check (true);

create or replace function public.enforce_group_admin_edit_scope()
returns trigger
language plpgsql
as $$
begin
  -- The owner can change anything about their own group...
  if auth.uid() = old.created_by then
    -- ...including transferring ownership, but only to someone who is
    -- already a member of the group (see transferOwnership in
    -- CommunityScreen.jsx, which also drops the new owner from `admins`).
    if new.created_by is distinct from old.created_by then
      if not exists (
        select 1 from public.community_group_members
        where group_id = old.id and user_id = new.created_by
      ) then
        raise exception 'Ownership can only be transferred to an existing member';
      end if;
    end if;
    return new;
  end if;
  -- Anyone else updating the row must be a current admin of a (still)
  -- private group, and may only touch name/description.
  if not (old.is_private and auth.uid() = any(old.admins)) then
    raise exception 'Only the group owner or an admin can edit this group';
  end if;
  if new.icon_key is distinct from old.icon_key
     or new.color_key is distinct from old.color_key
     or new.is_private is distinct from old.is_private
     or new.created_by is distinct from old.created_by
     or new.admins is distinct from old.admins
     or new.invite_code is distinct from old.invite_code
     or new.topics is distinct from old.topics then
    raise exception 'Admins can only change the group name and description';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_group_admin_edit_scope on public.community_groups;
create trigger enforce_group_admin_edit_scope
  before update on public.community_groups
  for each row execute function public.enforce_group_admin_edit_scope();

-- Owners can remove any member; admins can remove any member who isn't the
-- owner and isn't themselves an admin. Restricted to private groups. This
-- is in addition to the existing "Users can leave groups themselves"
-- self-delete policy.
drop policy if exists "Owners and admins can remove members" on public.community_group_members;
create policy "Owners and admins can remove members"
  on public.community_group_members for delete
  to authenticated
  using (
    exists (
      select 1 from public.community_groups g
      where g.id = group_id
        and g.is_private
        and (
          g.created_by = auth.uid()
          or (auth.uid() = any(g.admins) and user_id <> g.created_by and not (user_id = any(g.admins)))
        )
    )
  );
