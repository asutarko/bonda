# check-support-directory

Automated checker for the Support Directory. Run on a schedule, it keeps
`public.support_directory` live without anyone manually pruning dead links:

- A contact whose website goes down (404 / timeout / server error, after one
  retry) is immediately excluded from the app.
- A contact whose website comes back is automatically restored.

Phone numbers, emails and descriptions are not touched — there's no safe way
to auto-scrape and trust those from an arbitrary org homepage, so they stay
admin-edited.

## 1–5. Install CLI, log in, link, run migration, deploy

Same steps as `supabase/functions/check-subsidies/README.md`, except the
migration to run first is `supabase/support_directory.sql`, and the deploy
command is:

```
supabase functions deploy check-support-directory --no-verify-jwt
```

`--no-verify-jwt` is required — this function is only ever triggered by the
cron job below (no user JWT to verify), and the same setup on
`check-subsidies` / `fetch-articles` showed a `verify_jwt` default here
causes every scheduled call to fail with 401 silently.

## 6. Schedule it

Supabase Dashboard → Edge Functions → `check-support-directory` → **Cron** →
add a schedule, e.g. `0 5 * * *` (nightly at 5am, staggered from the 3am/4am
subsidy and article jobs). Once a day is plenty.
