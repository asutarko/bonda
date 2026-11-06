import { useState } from "react";
import { T } from "../theme";
import { Btn } from "../ui";
import { useBackHandler } from "../hooks";
import { pushSupported, needsHomeScreenInstall, enablePush } from "../lib/push";

const SNOOZE_KEY = "bonda_push_prompt_until";
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;

const isSnoozed = () => {
  try { return Date.now() < Number(localStorage.getItem(SNOOZE_KEY) || 0); } catch { return false; }
};

// "install" on an iPhone/iPad browser tab, "enable" while the browser hasn't
// asked yet. Once permission is granted or denied the prompt can't help:
// the browser won't show its popup again.
const getMode = () => {
  if (isSnoozed()) return null;
  if (needsHomeScreenInstall()) return "install";
  if (pushSupported() && Notification.permission === "default") return "enable";
  return null;
};

// The browser's permission popup needs a tap first on iPhone, and it only gets
// one real chance everywhere else, so this explains the benefit before asking.
export default function NotificationPrompt({ userId }) {
  const [mode, setMode] = useState(getMode);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const snooze = () => {
    try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS)); } catch {}
    setMode(null);
  };

  useBackHandler(!!mode, snooze);

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
        <p id="notification-prompt-title" style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.ink }}>
          {mode === "install" ? "Add Bonda to your Home Screen" : "Turn on notifications"}
        </p>
        <p style={{ margin: "6px 0 16px", fontSize: 14, color: T.inkSoft, lineHeight: 1.5 }}>
          {mode === "install"
            ? "To get schedule reminders and messages on this device, open Bonda in Safari, tap Share, then Add to Home Screen. Then open Bonda from your Home Screen."
            : "Get schedule reminders and community messages, even when Bonda is closed."}
        </p>
        {err && <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: T.red }}>{err}</p>}
        <div style={{ display: "flex", gap: 8 }}>
          {mode === "enable" && <Btn onClick={turnOn} disabled={busy} style={{ flex: 1 }}>{busy ? "Turning on..." : "Turn on"}</Btn>}
          <Btn onClick={snooze} disabled={busy} secondary style={{ flex: 1 }}>{mode === "install" ? "Got it" : "Not now"}</Btn>
        </div>
      </div>
    </div>
  );
}
