// Supabase Edge Function: send-push
//
// Sends a Web Push notification (no Firebase — plain VAPID Web Push, see
// ./README.md for keys + deploy) to every device a user has subscribed in
// public.push_subscriptions.
//
// Two callers, both sending { title, body, url, tag?, user_ids? }:
//  - The database (send_push() in supabase/push_notifications.sql — schedule
//    reminders, community messages, announcements), authenticated with the
//    shared x-push-secret header. It always passes user_ids.
//  - A signed-in user. A regular user can only notify themselves (the
//    "Send test" button); an admin (profiles.role = 'admin') may pass
//    user_ids to notify others.
// Deployed with --no-verify-jwt so the database can call it without a JWT;
// user calls are checked here instead.
// Subscriptions the push service reports as gone (404/410) are deleted.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-push-secret",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") ?? Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { title = "Bonda", body = "", url = "/", tag = null, user_ids } = await req.json().catch(() => ({}));
  const internalSecret = Deno.env.get("PUSH_INTERNAL_SECRET");
  const isInternal = !!internalSecret && req.headers.get("x-push-secret") === internalSecret;

  let targets: string[];
  if (isInternal) {
    if (!Array.isArray(user_ids) || !user_ids.length) return json({ sent: 0, removed: 0, devices: 0 });
    targets = user_ids;
  } else {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer /, "");
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) return json({ error: "Not signed in" }, 401);
    targets = [user.id];
    if (Array.isArray(user_ids) && user_ids.length) {
      const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (profile?.role !== "admin") return json({ error: "Only admins can notify other users" }, 403);
      targets = user_ids;
    }
  }

  const { data: subs, error } = await admin.from("push_subscriptions").select("id, endpoint, p256dh, auth").in("user_id", targets);
  if (error) return json({ error: error.message }, 500);

  const payload = JSON.stringify({ title, body, url, tag });
  let sent = 0;
  const gone: string[] = [];
  await Promise.all((subs ?? []).map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
      sent += 1;
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) gone.push(s.id);
      else console.error("Push failed:", status, (err as Error).message);
    }
  }));
  if (gone.length) await admin.from("push_subscriptions").delete().in("id", gone);

  return json({ sent, removed: gone.length, devices: subs?.length ?? 0 });
});
