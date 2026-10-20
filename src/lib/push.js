import { supabase } from "./supabase";

// Web Push (no Firebase): the browser's own push service, authenticated with
// our VAPID public key. Subscriptions are stored in public.push_subscriptions
// and sent to by the send-push Edge Function (supabase/functions/send-push).

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export const pushSupported = () =>
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window && !!VAPID_PUBLIC_KEY;

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
  if (permission !== "granted") throw new Error("Notifications are blocked. Allow them in your browser settings.");
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
  return sub;
};

export const disablePush = async () => {
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

export const sendTestPush = async () => {
  const { data, error } = await supabase.functions.invoke("send-push", {
    body: { title: "Bonda", body: "Notifications are working 🎉", url: "/" },
  });
  if (error) throw error;
  return data;
};
