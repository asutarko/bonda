import { useEffect, useState } from "react";
import { T } from "../theme";
import { SectionLabel, Btn } from "../ui";
import { pushSupported, pushUnsupportedReason, getPushSubscription, enablePush, disablePush, sendTestPush, getPushPrefs, setPushPref } from "../lib/push";

const PREF_ROWS = [
  { key: "schedule", label: "Schedule reminders", hint: "When each activity in your child's schedule starts" },
  { key: "messages", label: "Community messages", hint: "New messages in your groups and private chats" },
];

// Turn Web Push on/off for this device, plus a test button to check the
// whole path (browser → push_subscriptions → send-push Edge Function → back).
export default function PushNotificationsCard({ userId }) {
  const supported = pushSupported();
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [isErr, setIsErr] = useState(false);

  const [prefs, setPrefs] = useState({ schedule: true, messages: true });

  useEffect(() => {
    if (!supported) return;
    getPushSubscription().then(sub => {
      setEnabled(!!sub);
      // Re-save the row so it picks up this device's current timezone (and
      // survives a browser that silently rotated its subscription).
      if (sub && userId && Notification.permission === "granted") enablePush(userId).catch(() => {});
    }).catch(() => {});
  }, [supported, userId]);

  useEffect(() => {
    if (supported && userId) getPushPrefs(userId).then(setPrefs).catch(() => {});
  }, [supported, userId]);

  const togglePref = async (key) => {
    const value = !prefs[key];
    setPrefs(p => ({ ...p, [key]: value }));
    try { await setPushPref(userId, key, value); }
    catch (e) { setPrefs(p => ({ ...p, [key]: !value })); setIsErr(true); setMsg(e.message || "Couldn't save that setting."); }
  };

  const run = async (fn, okMsg) => {
    setBusy(true); setMsg("");
    try { await fn(); setIsErr(false); setMsg(okMsg); }
    catch (e) { setIsErr(true); setMsg(e.message || "Something went wrong."); }
    setBusy(false);
  };

  return (
    <div style={{ marginTop: 24 }}>
      <SectionLabel style={{ marginBottom: 10 }}>Notifications</SectionLabel>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.rL, padding: "16px 16px 14px" }}>
        {!supported ? (
          <p style={{ margin: 0, fontSize: 13, color: T.inkSoft, lineHeight: 1.5 }}>
            {{
              "missing-key": "Notifications aren't set up for this version of Bonda yet.",
              "insecure": "Notifications need Bonda to be opened over a secure (https://) address.",
            }[pushUnsupportedReason()] || "This browser doesn't support notifications. Open Bonda in Chrome (Android) — not inside WhatsApp or Instagram. On iPhone/iPad, add Bonda to your Home Screen first (iOS 16.4 or later)."}
          </p>
        ) : (
          <>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: T.inkSoft, lineHeight: 1.5 }}>
              {enabled ? "Notifications are on for this device." : "Get notified on this device, even when Bonda is closed."}
            </p>
            {enabled && PREF_ROWS.map(row => (
              <label key={row.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: `1px solid ${T.border}`, cursor: "pointer" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.ink }}>{row.label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: T.inkMuted, lineHeight: 1.4 }}>{row.hint}</p>
                </div>
                <input type="checkbox" checked={prefs[row.key]} onChange={() => togglePref(row.key)} style={{ width: 20, height: 20, accentColor: T.purple, cursor: "pointer" }} />
              </label>
            ))}
            {enabled ? (
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <Btn onClick={() => run(async () => { const r = await sendTestPush(); if (!r?.sent) throw new Error("No notification was delivered — try turning notifications off and on again."); }, "Test sent — it should pop up in a few seconds. Not seeing it? Check that notifications are on in your device's settings (and Do Not Disturb is off).")} disabled={busy} style={{ flex: 1 }}>Send test</Btn>
                <Btn onClick={() => run(async () => { await disablePush(); setEnabled(false); }, "Notifications turned off.")} disabled={busy} secondary style={{ flex: 1 }}>Turn off</Btn>
              </div>
            ) : (
              <Btn full onClick={() => run(async () => { await enablePush(userId); setEnabled(true); }, "Notifications turned on.")} disabled={busy}>{busy ? "Turning on..." : "Turn on notifications"}</Btn>
            )}
          </>
        )}
        {msg && <p style={{ margin: "10px 0 0", fontSize: 12, fontWeight: 700, color: isErr ? T.red : T.green }}>{msg}</p>}
      </div>
    </div>
  );
}
