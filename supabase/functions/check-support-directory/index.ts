// Supabase Edge Function: check-support-directory
//
// Runs on a schedule (see ./README.md for deploy + cron setup). For every
// row in public.support_directory with a web URL, fetches it. A row is only
// hidden (available_online = false) after 2 consecutive daily checks fail
// (fail_streak) — several entries here are mental-health crisis lines on
// old server stacks that can fail one automated check (WAF rate-limiting,
// legacy TLS the fetch client won't negotiate) while the site is fine for a
// real visitor, so a single blip must not hide a crisis contact. If a
// previously offline org comes back, it's flipped back to true immediately.
//
// Unlike check-subsidies, this does not diff page content or try to
// auto-extract anything — a directory listing's phone/email/description has
// no single "headline number" that's safe to scrape and trust, so those
// stay admin-edited. This checker only answers "is the link still good?".

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FETCH_TIMEOUT_MS = 15000;
const REQUEST_DELAY_MS = 300; // be polite to org servers

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "BondaDirectoryChecker/1.0 (+https://bonda.app; automated availability check)" },
    });
  } finally {
    clearTimeout(timer);
  }
}

// Only treats a URL as truly dead on a network-level failure (DNS, timeout,
// TLS) or a definitive "page is gone" status (404/410) or server error
// (5xx). A 401/403/429 means the server is up and just blocking automated
// requests (bot protection, rate limiting) — a real visitor would very
// likely still see the page fine, so those are treated as reachable rather
// than hiding the contact (several of these are mental-health crisis lines,
// so a false "offline" verdict here is far worse than a missed real outage).
async function isReachable(url) {
  try {
    const res = await fetchWithTimeout(url);
    if (res.status === 404 || res.status === 410 || res.status >= 500) return false;
    return true;
  } catch {
    return false;
  }
}

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  );

  const { data: rows, error } = await supabase
    .from("support_directory")
    .select("id, web, available_online, fail_streak")
    .neq("web", "");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const FAIL_STREAK_TO_HIDE = 2;
  const summary = { checked: 0, wentOffline: 0, cameOnline: 0 };

  for (const row of rows || []) {
    summary.checked++;
    const now = new Date().toISOString();

    let ok = await isReachable(row.web);
    if (!ok) {
      await sleep(1000);
      ok = await isReachable(row.web); // one retry to avoid flapping on transient blips
    }

    const failStreak = ok ? 0 : (row.fail_streak || 0) + 1;
    const availableOnline = ok || failStreak < FAIL_STREAK_TO_HIDE;

    if (availableOnline !== row.available_online) {
      if (availableOnline) summary.cameOnline++; else summary.wentOffline++;
    }

    await supabase.from("support_directory")
      .update({ available_online: availableOnline, fail_streak: failStreak, last_checked_at: now })
      .eq("id", row.id);
    await sleep(REQUEST_DELAY_MS);
  }

  return new Response(JSON.stringify(summary), { headers: { "Content-Type": "application/json" } });
});
