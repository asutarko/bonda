// Web Push handlers, pulled into the Workbox-generated service worker via
// `workbox.importScripts` in vite.config.js. The payload is the JSON sent by
// the send-push Edge Function: { title, body, url, tag }. Notifications with
// the same tag (e.g. one chat room) replace each other instead of stacking.

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data?.text() }; }
  const title = data.title || "Bonda";
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: data.url || "/" },
    ...(data.tag ? { tag: data.tag, renotify: true } : {}),
  }));
});

// Focus an open Bonda tab (navigating it to the notification's url) or open
// a new one.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil((async () => {
    const tabs = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const tab = tabs.find(c => c.url.startsWith(self.location.origin));
    if (tab) { await tab.focus(); if (tab.url !== url && "navigate" in tab) await tab.navigate(url); return; }
    await self.clients.openWindow(url);
  })());
});
