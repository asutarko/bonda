# check-subsidies

Automated checker for the Subsidies & Aid finder. Run on a schedule, it keeps
`public.subsidies` live without anyone manually editing data:

- A scheme whose official page goes down (404 / timeout / server error, after
  one retry) is immediately excluded from the app.
- A scheme whose official page changes is flagged (`last_changed_at`) and
  surfaces in the app's "Latest Updates" carousel automatically. If a clear,
  repeated dollar figure is found, `amount` is auto-updated and the change is
  logged to `subsidy_change_log` for review/rollback.

This is not deployed automatically — the Supabase CLI isn't set up on this
machine. Run these steps once, from your own machine with access to the
project's Supabase account.

## 1. Install the Supabase CLI (if you don't have it)

```
npm install -g supabase
```

## 2. Log in and link this repo to your Supabase project

```
supabase login
supabase link --project-ref <your-project-ref>
```

Your project ref is the id in your Supabase project's dashboard URL
(`https://supabase.com/dashboard/project/<project-ref>`).

## 3. Run the schema migrations (SQL Editor)

In the Supabase Dashboard → SQL Editor, run these three files in order (each
is idempotent, safe to re-run):

1. `supabase/subsidies_finder_fields.sql`
2. `supabase/subsidies_finder_seed.sql`
3. `supabase/subsidy_change_log.sql`

## 4. Deploy the function

```
supabase functions deploy check-subsidies
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically to
every Edge Function by Supabase — no manual secret needs to be set.

## 5. Test it once, manually

```
supabase functions invoke check-subsidies
```

Check a couple of rows in the `subsidies` table afterwards — `last_checked_at`
should be fresh, and `available_online` / `content_hash` should be populated.

## 6. Schedule it

Easiest: Supabase Dashboard → Edge Functions → `check-subsidies` → **Cron** →
add a schedule, e.g. `0 3 * * *` (nightly at 3am). Government pages don't
change hourly, so once a day is plenty — no need to run it more often.

## Reviewing auto-applied changes

Any time the checker updates a scheme's `amount` on its own, it writes a row
to `subsidy_change_log` (old value, new value, timestamp). Spot-check this
table periodically:

```sql
select sc.changed_at, s.label, sc.old_value, sc.new_value
from subsidy_change_log sc
join subsidies s on s.id = sc.subsidy_id
order by sc.changed_at desc
limit 50;
```

If an auto-update looks wrong, just edit the `amount` field on the row
directly (via your admin app) — the checker won't touch it again until the
source page's content changes once more.
