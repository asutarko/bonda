-- Run in the Supabase Dashboard → SQL Editor. Generic template to delete a
-- single user account and everything tied to it (profile, children, carer
-- letters, chat messages, caregiver FAQ answers, child documents) plus their
-- uploaded photos in storage.
--
-- Replace every '<user-uuid>' below with the target auth.users.id before running.

-- Step 1: preview — run this first and check it's the right person/children.
select 'user' as kind, auth.users.id, auth.users.email, public.profiles.name
from auth.users
left join public.profiles on public.profiles.id = auth.users.id
where auth.users.id = '<user-uuid>'
union all
select 'child' as kind, public.children.id, public.children.name, null
from public.children
where public.children.user_id = '<user-uuid>';

-- Step 2: only after confirming the preview above looks correct, run this.
-- Deleting from auth.users cascades to (all "on delete cascade" on the
-- user id, directly or via children):
--   public.profiles              (profiles.sql)
--   public.children              (children.sql)
--   public.carer_letters         (carer_letters.sql — by user_id and by child_id)
--   public.messages               (messages.sql — community chat authored by them)
--   public.caregiver_faq_answers  (caregiver_faq_answers.sql — via child_id)
--   public.child_documents        (child_documents.sql — by user_id and by child_id)
--   public.community_announcements (community_admin.sql — only if this user posted
--                                    admin announcements)
-- so no manual cleanup of those tables is needed.
delete from auth.users
where id = '<user-uuid>';

-- Step 3 (optional): their uploaded photos in the "public" storage bucket
-- aren't linked by foreign key, so they survive the delete above. Supabase
-- blocks raw `delete from storage.objects` (storage.protect_delete trigger)
-- to avoid orphaning the underlying file bytes, so removal has to go through
-- the Storage API/Dashboard, not SQL. This query only lists the file paths —
-- it doesn't delete anything.
select name
from storage.objects
where bucket_id = 'public'
  and (
    name like 'assets/parents/<user-uuid>-%'
    or name like 'assets/children/<user-uuid>-%'
    or name like 'assets/community/<user-uuid>-%'
  );

-- Then delete those paths one of two ways:
--
-- A) Dashboard: Storage → public bucket → navigate to assets/parents,
--    assets/children, assets/community and delete any file listed above.
--
-- B) Storage API (run from a trusted environment with the service_role key,
--    never expose that key client-side) — paste the paths from the select
--    above into the `remove()` array:
--
--    const { createClient } = require("@supabase/supabase-js");
--    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
--    await supabase.storage.from("public").remove([
--      "assets/parents/<user-uuid>-<timestamp>.jpg",
--    ]);
