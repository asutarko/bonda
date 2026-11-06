import { supabase } from "./supabase";

// Web Push (no Firebase): the browser's own push service, authenticated with
// our VAPID public key. Subscriptions are stored in public.push_subscriptions
// and sent to by the send-push Edge Function (supabase/functions/send-push).

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Why push can't work here, or null if it can. Checked in this order because
// each one hides the next: an insecure origin (http:// on a LAN IP) has no
// service worker at all, and in-app browsers (WhatsApp, Instagram…) lack
// PushManager even on a secure origin.
export const pushUnsupportedReason = () => {
  if (!VAPID_PUBLIC_KEY) return "missing-key";
  if (!window.isSecureContext || !("serviceWorker" in navigator)) return "insecure";
  if (!("PushManager" in window) || !("Notification" in window)) return "browser";
  return null;
};

export const pushSupported = () => pushUnsupportedReason() === null;

// iPhone and iPad only offer Web Push once Bonda is added to the Home Screen.
// iPadOS reports itself as a Mac, hence the touch check.
export const needsHomeScreenInstall = () => {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const installed = navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
  return ios && !installed;
};

// Set when the user turns push off on this device. Permission stays "granted"
// after that, so without this flag syncPushSubscription would turn it back on.
const OPTED_OUT_KEY = "bonda_push_off";
const isOptedOut = () => { try { return localStorage.getItem(OPTED_OUT_KEY) === "1"; } catch { return false; } };
const setOptedOut = (off) => {
  try { if (off) localStorage.setItem(OPTED_OUT_KEY, "1"); else localStorage.removeItem(OPTED_OUT_KEY); } catch {}
};

const urlBase64ToUint8Array = (base64) => {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
};

// The PWA plugin only registers the service worker in a production build,
// so in `vite dev` this never resolves — time out instead of hanging.
const getRegistration = () => Promise.race([
  navigator.serviceWorker.ready,
  new Promise((_, reject) => setTimeout(() => reject(new Error("Service worker not ready — push only works in the installed/production app.")), 5000)),
]);

export const getPushSubscription = async () => {
  if (!pushSupported()) return null;
  const reg = await getRegistration();
  return reg.pushManager.getSubscription();
};

export const enablePush = async (userId) => {
  const permission = await Notification.requestPermission();
  if (permission === "denied") throw new Error("Notifications are blocked. Allow them in your browser settings.");
  if (permission !== "granted") throw new Error("Tap Allow to turn on notifications.");
  const reg = await getRegistration();
  const sub = (await reg.pushManager.getSubscription())
    || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) });
  const { endpoint, keys } = sub.toJSON();
  const { error } = await supabase.from("push_subscriptions").upsert(
    // timezone: schedule reminders fire at each item's time on this device's clock.
    { user_id: userId, endpoint, p256dh: keys.p256dh, auth: keys.auth, user_agent: navigator.userAgent, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Singapore" },
    { onConflict: "endpoint" }
  );
  if (error) throw error;
  setOptedOut(false);
  return sub;
};

// Runs on app open: subscribes without asking when permission is already
// granted, and keeps this device's timezone current on the saved row.
export const syncPushSubscription = async (userId) => {
  if (!pushSupported() || Notification.permission !== "granted" || isOptedOut()) return;
  await enablePush(userId);
};

export const disablePush = async () => {
  setOptedOut(true);
  const sub = await getPushSubscription();
  if (!sub) return;
  await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
  await sub.unsubscribe();
};

// Which kinds of push this user wants (profiles.push_schedule / push_messages,
// see supabase/push_notifications.sql). Announcements always go out.
export const getPushPrefs = async (userId) => {
  const { data } = await supabase.from("profiles").select("push_schedule, push_messages").eq("id", userId).maybeSingle();
  return { schedule: data?.push_schedule ?? true, messages: data?.push_messages ?? true };
};

export const setPushPref = async (userId, key, value) => {
  const column = key === "schedule" ? "push_schedule" : "push_messages";
  const { error } = await supabase.from("profiles").update({ [column]: value }).eq("id", userId);
  if (error) throw error;
};

// Closes the system notifications still sitting in the tray, once the user
// has read them in the inbox, so they don't keep popping up afterwards.
export const clearShownNotifications = async () => {
  if (!pushSupported()) return;
  try {
    const reg = await getRegistration();
    (await reg.getNotifications()).forEach(n => n.close());
  } catch {}
};

export const sendTestPush = async () => {
  const { data, error } = await supabase.functions.invoke("send-push", {
    body: { title: "Bonda", body: "Notifications are working 🎉", url: "/", tag: "test" },
  });
  if (error) throw error;
  return data;
};
