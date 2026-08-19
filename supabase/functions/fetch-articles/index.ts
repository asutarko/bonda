// Supabase Edge Function: fetch-articles
//
// Runs on a schedule (see ./README.md for deploy + cron setup). Pulls the
// latest items from a small list of free, vetted autism/research RSS feeds
// and upserts them into public.articles, which the Home screen's "Latest
// Articles" carousel reads from directly. Nobody has to add articles by
// hand — this keeps the feed current on its own.
//
// Dedup is by url (unique constraint on public.articles). After each run,
// the table is trimmed to the most recent MAX_ARTICLES rows so it doesn't
// grow forever.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FETCH_TIMEOUT_MS = 15000;
const REQUEST_DELAY_MS = 300; // be polite to source servers
const ITEMS_PER_FEED = 6;
const MAX_ARTICLES = 40;

// Add/remove feeds here. `tag` and `tone` map to the badge shown in the app
// (tone must be one of the theme keys: purple, teal, violet, indigo, green,
// amber, red, slate — see src/theme.js).
//
// `filterKeyword`: despite its URL, ScienceDaily's "autism" feed is actually
// its broader mind/brain feed (Alzheimer's, ADHD, memory, etc. all mixed
// in) — verified by fetching it directly. Only items whose title+description
// mention autism are kept. Spectrum's whole site is autism research, so it
// doesn't need a filter.
const FEEDS = [
  { url: "https://www.sciencedaily.com/rss/mind_brain/autism.xml", source: "ScienceDaily", tag: "Research", tone: "violet", filterKeyword: /autis/i },
  { url: "https://www.thetransmitter.org/spectrum/feed/", source: "Spectrum", tag: "Research", tone: "indigo" },
];
const RAW_SCAN_LIMIT = 20; // how many of the feed's most-recent raw items to scan before giving up on filling ITEMS_PER_FEED

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "BondaArticlesFetcher/1.0 (+https://bonda.app; automated RSS aggregation)" },
    });
  } finally {
    clearTimeout(timer);
  }
}

function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? m[1] : "";
}

function cleanText(raw) {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function parseFeed(xml, feed) {
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  const items = [];

  // Scan more raw items than we need, since filterKeyword may reject some —
  // stop once we've collected ITEMS_PER_FEED matches or run out to scan.
  for (const block of itemBlocks.slice(0, RAW_SCAN_LIMIT)) {
    if (items.length >= ITEMS_PER_FEED) break;

    const title = cleanText(extractTag(block, "title"));
    const url = cleanText(extractTag(block, "link"));
    if (!title || !url) continue;

    const pubDateRaw = extractTag(block, "pubDate") || extractTag(block, "dc:date") || extractTag(block, "published");
    const parsedDate = pubDateRaw ? new Date(cleanText(pubDateRaw)) : new Date();
    const published_at = isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();

    const descRaw = extractTag(block, "description") || extractTag(block, "content:encoded") || extractTag(block, "summary");
    const blurb = cleanText(descRaw).slice(0, 220);

    if (feed.filterKeyword && !feed.filterKeyword.test(`${title} ${blurb}`)) continue;

    items.push({
      source: feed.source,
      tag: feed.tag,
      tone: feed.tone,
      title,
      blurb,
      url,
      published_at,
    });
  }

  return items;
}

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  );

  const summary = { feedsChecked: 0, feedsFailed: 0, itemsUpserted: 0, trimmedTo: MAX_ARTICLES };

  for (const feed of FEEDS) {
    summary.feedsChecked++;
    try {
      const res = await fetchWithTimeout(feed.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      const items = parseFeed(xml, feed);

      if (items.length) {
        const { error } = await supabase
          .from("articles")
          .upsert(items, { onConflict: "url", ignoreDuplicates: false });
        if (error) throw error;
        summary.itemsUpserted += items.length;
      }
    } catch (err) {
      summary.feedsFailed++;
      console.error(`fetch-articles: feed failed (${feed.source})`, err);
    }
    await sleep(REQUEST_DELAY_MS);
  }

  // Keep the table small: drop everything outside the most recent MAX_ARTICLES.
  const { data: keepRows } = await supabase
    .from("articles")
    .select("id")
    .order("published_at", { ascending: false })
    .limit(MAX_ARTICLES);

  if (keepRows?.length === MAX_ARTICLES) {
    const keepIds = keepRows.map((r) => r.id);
    await supabase.from("articles").delete().not("id", "in", `(${keepIds.join(",")})`);
  }

  return new Response(JSON.stringify(summary), { headers: { "Content-Type": "application/json" } });
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
