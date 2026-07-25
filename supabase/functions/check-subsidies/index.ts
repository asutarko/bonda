// Supabase Edge Function: check-subsidies
//
// Runs on a schedule (see ../../../supabase/functions/check-subsidies/README.md
// for deploy + cron setup). For every row in public.subsidies with a
// source_url, it:
//   1. Fetches the official page. If it's unreachable (404/5xx/timeout,
//      confirmed by one retry), sets available_online = false — the row
//      disappears from the app immediately (SubsidiesScreen only loads
//      available_online = true). If a previously-offline page comes back,
//      it's flipped back to true.
//   2. Hashes the page's visible text. If the hash changed since last time:
//      - Best-effort: looks for a single, clearly-repeated dollar amount on
//        the page. If found and different from the stored `amount`, updates
//        `amount` and writes an audit row to subsidy_change_log (old value,
//        new value) so a wrong auto-extraction can be spotted and reverted.
//      - Always updates content_hash + last_changed_at, so the scheme shows
//        up in the app's "Latest Updates" carousel even when no confident
//        amount could be extracted — the change is still surfaced.
//
// This is intentionally regex/heuristic based, not true page comprehension:
// it reliably catches "page is dead" and "something on this page changed",
// and it *often* catches a cleanly-stated new dollar figure — but it is not
// guaranteed to always find the right number on every government page's
// layout. subsidy_change_log exists so a bad auto-update can be reviewed and
// undone quickly.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FETCH_TIMEOUT_MS = 15000;
const REQUEST_DELAY_MS = 300; // be polite to government servers
const MONEY_RE = /\$\s?[\d][\d,]*(?:\.\d+)?(?:\s*(?:-|–|to)\s*\$?\s?[\d][\d,]*(?:\.\d+)?)?(?:\s?\/\s?(?:month|mo|year|yr))?/gi;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "BondaSubsidyChecker/1.0 (+https://bonda.app; automated availability check)" },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function isReachable(url) {
  try {
    const res = await fetchWithTimeout(url);
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function extractText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Best-effort: the most frequently repeated dollar figure on the page,
// treated as the "headline" amount. Returns null if nothing repeats (too
// low-confidence to auto-apply).
function guessHeadlineAmount(text) {
  const matches = text.match(MONEY_RE);
  if (!matches || matches.length === 0) return null;
  const counts = new Map();
  for (const m of matches) {
    const key = m.replace(/\s+/g, " ").trim();
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  let best = null;
  let bestCount = 1; // require at least 2 occurrences to count as "headline"
  for (const [key, count] of counts) {
    if (count > bestCount) { best = key; bestCount = count; }
  }
  return best;
}

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  );

  const { data: rows, error } = await supabase
    .from("subsidies")
    .select("id, label, amount, source_url, available_online, content_hash")
    .neq("source_url", "");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const summary = { checked: 0, wentOffline: 0, cameOnline: 0, changed: 0, amountUpdated: 0 };

  for (const row of rows || []) {
    summary.checked++;
    const now = new Date().toISOString();

    let res = await isReachable(row.source_url);
    if (!res) {
      await sleep(1000);
      res = await isReachable(row.source_url); // one retry to avoid flapping on transient blips
    }

    if (!res) {
      if (row.available_online) summary.wentOffline++;
      await supabase.from("subsidies").update({ available_online: false, last_checked_at: now }).eq("id", row.id);
      await sleep(REQUEST_DELAY_MS);
      continue;
    }

    if (!row.available_online) summary.cameOnline++;

    const html = await res.text();
    const text = extractText(html);
    const hash = await sha256(text);

    const update = { available_online: true, last_checked_at: now };

    if (hash !== row.content_hash) {
      summary.changed++;
      update.content_hash = hash;
      update.last_changed_at = now;

      const guessedAmount = guessHeadlineAmount(text);
      if (guessedAmount && row.amount && guessedAmount !== row.amount.trim()) {
        update.amount = guessedAmount;
        summary.amountUpdated++;
        await supabase.from("subsidy_change_log").insert({
          subsidy_id: row.id,
          field: "amount",
          old_value: row.amount,
          new_value: guessedAmount,
        });
      }
    }

    await supabase.from("subsidies").update(update).eq("id", row.id);
    await sleep(REQUEST_DELAY_MS);
  }

  return new Response(JSON.stringify(summary), { headers: { "Content-Type": "application/json" } });
});
