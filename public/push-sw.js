// Web Push handlers, pulled into the Workbox-generated service worker via
// `workbox.importScripts` in vite.config.js. The payload is the JSON sent by
// the send-push Edge Function: { title, body, url, tag }. Notifications with
// the same tag (e.g. one chat room) replace each other instead of stacking.

// Safari/iOS revokes the subscription if a push doesn't show a notification,
// so there it always pops up; elsewhere it's skipped while Bonda is open on
// screen, since the header bell's badge already updates live.
const ALWAYS_SHOW = /iPhone|iPad|iPod|^((?!Chrome|Android).)*Safari/i.test(self.navigator.userAgent);

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data?.text() }; }
  const title = data.title || "Bonda";
  event.waitUntil((async () => {
    if (!ALWAYS_SHOW) {
      const tabs = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      if (tabs.some(c => c.visibilityState === "visible")) return;
    }
    await self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url || "/" },
      ...(data.tag ? { tag: data.tag, renotify: true } : {}),
    });
  })());
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
