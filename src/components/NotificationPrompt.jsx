import { useState } from "react";
import { T } from "../theme";
import { Btn } from "../ui";
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

  if (!mode) return null;

  const snooze = () => {
    try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS)); } catch {}
    setMode(null);
  };

  const turnOn = async () => {
    setBusy(true); setErr("");
    try { await enablePush(userId); setMode(null); }
    catch (e) { setErr(e.message || "Something went wrong."); }
    setBusy(false);
  };

  return (
    <div style={{ margin: "12px 18px 0", background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.rL, padding: 16, flexShrink: 0 }}>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.ink }}>
        {mode === "install" ? "Add Bonda to your Home Screen" : "Turn on notifications"}
      </p>
      <p style={{ margin: "4px 0 12px", fontSize: 13, color: T.inkSoft, lineHeight: 1.5 }}>
        {mode === "install"
          ? "To get schedule reminders and messages on this device, open Bonda in Safari, tap Share, then Add to Home Screen. Then open Bonda from your Home Screen."
          : "Get schedule reminders and community messages, even when Bonda is closed."}
      </p>
      {err && <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: T.red }}>{err}</p>}
      <div style={{ display: "flex", gap: 8 }}>
        {mode === "enable" && <Btn onClick={turnOn} disabled={busy} style={{ flex: 1 }}>{busy ? "Turning on..." : "Turn on"}</Btn>}
        <Btn onClick={snooze} disabled={busy} secondary style={{ flex: 1 }}>{mode === "install" ? "Got it" : "Not now"}</Btn>
      </div>
    </div>
  );
}
