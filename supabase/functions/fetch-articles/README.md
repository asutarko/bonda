# fetch-articles

Automated content source for the Home screen's "Latest Articles" carousel.
Run on a schedule, it keeps `public.articles` fresh without anyone adding
articles by hand:

- Pulls the latest items from a short list of free, vetted autism/research
  RSS feeds (currently ScienceDaily and Spectrum — see `FEEDS` in
  `index.ts`). ScienceDaily's feed is actually a broader mind/brain feed
  (Alzheimer's, ADHD, memory, etc. mixed in) despite its "autism" URL, so
  it's kept only if `filterKeyword` matches the title/description — check
  any new feed you add the same way before assuming its name means what it
  says.
- Upserts them into `public.articles`, deduped by `url`.
- Trims the table to the most recent 40 rows so it doesn't grow forever.

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

## 3. Run the schema migration (SQL Editor)

In the Supabase Dashboard → SQL Editor, run `supabase/articles.sql`
(idempotent, safe to re-run).

## 4. Deploy the function

```
supabase functions deploy fetch-articles
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically to
every Edge Function by Supabase — no manual secret needs to be set.

## 5. Test it once, manually

```
supabase functions invoke fetch-articles
```

Check `public.articles` afterwards — you should see up to 12 new rows (6 per
feed), with `published_at`/`fetched_at` populated.

## 6. Schedule it

Supabase Dashboard → Edge Functions → `fetch-articles` → **Cron** → add a
schedule, e.g. `0 4 * * *` (nightly at 4am). Once a day is plenty — these
feeds don't publish hourly, and the app reads whatever's already in the
table.

## Adding/removing sources later

Edit the `FEEDS` array in `index.ts` and redeploy. Only add feeds you've
verified are free, public RSS/Atom (fetch the URL and check it starts with
`<?xml` / `<rss` / `<feed>`) — some sites' "RSS" links actually require a
login or return HTML.

## If a feed goes stale or breaks

The function logs a warning per failed feed but keeps going — one broken
feed won't stop the others from updating. If `public.articles` stops
getting new rows, check the Edge Function's logs in the Supabase Dashboard
first.
