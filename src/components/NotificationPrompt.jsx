import { useEffect, useState } from "react";
import { T } from "../theme";
import { Btn } from "../ui";
import { useBackHandler } from "../hooks";
import { pushSupported, needsHomeScreenInstall, enablePush, getPushSubscription, syncPushSubscription, isOptedOut } from "../lib/push";

const COPY = {
  install: {
    title: "Add Bonda to your Home Screen",
    body: "To get schedule reminders and messages on this device, open Bonda in Safari, tap Share, then Add to Home Screen. Then open Bonda from your Home Screen.",
    dismiss: "Got it",
  },
  blocked: {
    title: "Notifications are blocked",
    body: "To get schedule reminders and community messages, allow notifications for Bonda in your browser or device settings.",
    dismiss: "Got it",
  },
  enable: {
    title: "Turn on notifications",
    body: "Get schedule reminders and community messages, even when Bonda is closed.",
    dismiss: "Not now",
  },
};

// Null means notifications are on, or nothing here could turn them on.
// "blocked" can only point to settings: the browser won't ask a second time.
const getMode = async (userId) => {
  if (needsHomeScreenInstall()) return "install";
  if (!pushSupported()) return null;
  if (Notification.permission === "denied") return "blocked";
  if (Notification.permission === "default") return "enable";
  // Permission is granted, so "on" depends on this device's subscription.
  if (!isOptedOut()) await syncPushSubscription(userId).catch(() => {});
  return (await getPushSubscription()) ? null : "enable";
};

// sessionStorage lasts until the app or tab is closed, so a reload or a
// return to Home doesn't count as opening the app again.
const SHOWN_KEY = "bonda_push_prompt_shown";
const wasShown = () => { try { return sessionStorage.getItem(SHOWN_KEY) === "1"; } catch { return false; } };
const markShown = () => { try { sessionStorage.setItem(SHOWN_KEY, "1"); } catch {} };

// Shown once each time the app opens while notifications are off on this
// device, so it's mounted once in App.jsx, not per screen. The browser's own
// permission popup needs a tap first on iPhone, so this asks before it does.
export default function NotificationPrompt({ userId }) {
  const [mode, setMode] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (wasShown()) return;
    let cancelled = false;
    getMode(userId).then(m => {
      if (cancelled || !m) return;
      markShown();
      setMode(m);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [userId]);

  const dismiss = () => setMode(null);

  useBackHandler(!!mode, dismiss);

  if (!mode) return null;

  const turnOn = async () => {
    setBusy(true); setErr("");
    try { await enablePush(userId); setMode(null); }
    catch (e) { setErr(e.message || "Something went wrong."); }
    setBusy(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(35,32,28,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18, boxSizing: "border-box" }}>
      <div role="dialog" aria-modal="true" aria-labelledby="notification-prompt-title" style={{ width: "100%", maxWidth: 400, background: T.surface, borderRadius: T.rL, padding: 20, boxSizing: "border-box", boxShadow: "0 18px 44px rgba(35,32,28,.18)" }}>
        <p id="notification-prompt-title" style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.ink }}>{COPY[mode].title}</p>
        <p style={{ margin: "6px 0 16px", fontSize: 14, color: T.inkSoft, lineHeight: 1.5 }}>{COPY[mode].body}</p>
        {err && <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: T.red }}>{err}</p>}
        <div style={{ display: "flex", gap: 8 }}>
          {mode === "enable" && <Btn onClick={turnOn} disabled={busy} style={{ flex: 1 }}>{busy ? "Turning on..." : "Turn on"}</Btn>}
          <Btn onClick={dismiss} disabled={busy} secondary style={{ flex: 1 }}>{COPY[mode].dismiss}</Btn>
        </div>
      </div>
    </div>
  );
}
