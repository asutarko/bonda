// Permanently deletes a user account together with their uploaded files.
// SQL can't do both: Supabase blocks deleting from storage.objects directly.
//
// Needs the service_role key in .env.local (gitignored, and without the VITE_
// prefix so Vite never ships it to the browser):
//   SUPABASE_SERVICE_ROLE_KEY=...
//
// Preview only, nothing is deleted:
//   node --env-file=.env --env-file=.env.local scripts/delete-user.mjs user@example.com
//
// Delete for real (also accepts the user's UUID instead of their email):
//   node --env-file=.env --env-file=.env.local scripts/delete-user.mjs user@example.com --confirm

import { createClient } from "@supabase/supabase-js";

const BUCKET = "public";
const FOLDERS = ["assets/parents", "assets/children", "assets/community"]; // see supabase/storage.sql
const PAGE_SIZE = 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const args = process.argv.slice(2);
const confirm = args.includes("--confirm");
const target = args.find(a => !a.startsWith("--"));
const { VITE_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: serviceKey } = process.env;

const fail = message => { console.error(message); process.exit(1); };

if (!target) fail("Usage: delete-user.mjs <email-or-uuid> [--confirm]");
if (!url) fail("VITE_SUPABASE_URL is missing. Pass --env-file=.env.");
if (!serviceKey) fail("SUPABASE_SERVICE_ROLE_KEY is missing. Add it to .env.local and pass --env-file=.env.local.");

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function findUser() {
  if (UUID.test(target)) {
    const { data, error } = await supabase.auth.admin.getUserById(target);
    if (error) fail(`Could not find user ${target}: ${error.message}`);
    return data.user;
  }
  const email = target.toLowerCase();
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PAGE_SIZE });
    if (error) fail(`Could not list users: ${error.message}`);
    const match = data.users.find(u => u.email?.toLowerCase() === email);
    if (match) return match;
    if (data.users.length < PAGE_SIZE) fail(`No user with email ${target}.`);
  }
}

async function listFiles(userId) {
  const paths = [];
  for (const folder of FOLDERS) {
    for (let offset = 0; ; offset += PAGE_SIZE) {
      const { data, error } = await supabase.storage.from(BUCKET).list(folder, { search: `${userId}-`, limit: PAGE_SIZE, offset });
      if (error) fail(`Could not list ${folder}: ${error.message}`);
      paths.push(...data.filter(f => f.name.startsWith(`${userId}-`)).map(f => `${folder}/${f.name}`));
      if (data.length < PAGE_SIZE) break;
    }
  }
  return paths;
}

const user = await findUser();
const files = await listFiles(user.id);
const { data: groups, error: groupsError } = await supabase.from("community_groups").select("name").eq("created_by", user.id);
if (groupsError) fail(`Could not check community groups: ${groupsError.message}`);

console.log(`User:  ${user.email} (${user.id})`);
console.log(`Files: ${files.length}`);
files.forEach(f => console.log(`  ${f}`));
console.log(`Community groups that will also be deleted: ${groups.length}`);
groups.forEach(g => console.log(`  ${g.name}`));

if (!confirm) {
  console.log("\nPreview only. Nothing was deleted. Add --confirm to delete.");
  process.exit(0);
}

// Files first: they're found by the user's id, so if this stops partway the
// script can simply be rerun. Deleting the account first would lose the email
// lookup and could leave files behind.
for (let i = 0; i < files.length; i += PAGE_SIZE) {
  const { error } = await supabase.storage.from(BUCKET).remove(files.slice(i, i + PAGE_SIZE));
  if (error) fail(`Could not delete files, account kept: ${error.message}`);
}

const { error } = await supabase.auth.admin.deleteUser(user.id);
if (error) fail(`Files deleted, but the account could not be: ${error.message}`);

console.log(`\nDeleted ${user.email} and ${files.length} file(s).`);
