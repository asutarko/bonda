import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, Btn } from "../ui";
import { clearShownNotifications } from "../lib/push";
import { useBackHandler } from "../hooks";

// Every notification send_push() sends also lands in public.notifications
// (supabase/notifications.sql), which a daily cron trims to the last 3 days.
// Opening the inbox marks everything read; unread rows keep their dot until
// the screen is left so it's still clear what was new.

const timeAgo = (iso) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const isMessage = (n) => /^(dm|room)_/.test(n.tag || "");
const isSchedule = (n) => (n.tag || "").startsWith("schedule_");

export function InboxScreen({ account, pop, setTab, onRead }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("notifications")
        .select("id, title, body, url, tag, read_at, created_at")
        .eq("user_id", account.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (cancelled) return;
      setItems(data || []);
      clearShownNotifications();
      if ((data || []).some(n => !n.read_at)) {
        await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", account.id).is("read_at", null);
        onRead?.();
      }
    })();
    return () => { cancelled = true; };
  }, [account.id]);

  // Tapping a row opens its detail sheet (full title and body); the sheet's
  // button then jumps to where the notification came from, if anywhere.
  const [detail, setDetail] = useState(null);
  useBackHandler(!!detail, () => setDetail(null));

  const action = (n) => {
    if (isMessage(n)) return { label: "Open Community", run: () => { pop(); setTab("community"); } };
    if (isSchedule(n)) return { label: "Open Schedule", run: () => { pop(); setTab("schedule"); } };
    if (/^https?:\/\//.test(n.url || "")) return { label: "Open link", run: () => window.open(n.url, "_blank", "noopener") };
    return null;
  };

  const remove = async (id) => {
    if (detail?.id === id) setDetail(null);
    setItems(prev => prev.filter(n => n.id !== id));
    await supabase.from("notifications").delete().eq("id", id);
  };

  const clearAll = async () => {
    setItems([]);
    await supabase.from("notifications").delete().eq("user_id", account.id);
  };

  if (!items) {
    return <Page><p style={{ color: T.inkSoft, fontSize: 14, fontWeight: 700, textAlign: "center", marginTop: 40 }}>Loading…</p></Page>;
  }

  return (
    <Page>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{ margin: 0, fontSize: 12, color: T.inkMuted }}>Notifications are kept for 3 days.</p>
        {items.length > 0 && (
          <button onClick={clearAll} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 700, color: T.purple }}>Clear all</button>
        )}
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 12px", color: T.inkSoft }}>
          <svg width="40" height="40" viewBox="0 0 24 24" style={{ marginBottom: 10 }}>
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke={T.inkMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M13.7 21a2 2 0 0 1-3.4 0" stroke={T.inkMuted} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          </svg>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.ink }}>You're all caught up</p>
          <p style={{ margin: "4px 0 0", fontSize: 13 }}>New notifications will show up here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(n => (
            <div key={n.id} onClick={() => setDetail(n)} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: n.read_at ? T.surface : T.purpleL, border: `1px solid ${T.border}`, borderRadius: T.r, padding: "12px 12px 12px 14px", cursor: "pointer" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.read_at ? "transparent" : T.purple, marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</span>
                  <span style={{ fontSize: 11, color: T.inkMuted, flexShrink: 0 }}>{timeAgo(n.created_at)}</span>
                </div>
                {n.body && <p style={{ margin: "3px 0 0", fontSize: 13, color: T.inkSoft, lineHeight: 1.45, wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.body}</p>}
              </div>
              <button onClick={e => { e.stopPropagation(); remove(n.id); }} title="Delete" style={{ background: "none", border: "none", padding: 2, cursor: "pointer", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke={T.inkMuted} strokeWidth="1.6" strokeLinecap="round"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {detail && (() => {
        const act = action(detail);
        return (
          <div onClick={() => setDetail(null)} style={{ position: "fixed", inset: 0, background: "rgba(35,32,28,.35)", display: "flex", alignItems: "flex-end", zIndex: 230 }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, margin: "0 auto", maxHeight: "80vh", overflowY: "auto", background: T.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: "10px 20px 24px" }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: T.border, margin: "6px auto 14px" }} />
              <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.ink, lineHeight: 1.35, wordBreak: "break-word" }}>{detail.title}</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: T.inkMuted }}>
                {new Date(detail.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} · {timeAgo(detail.created_at)}
              </p>
              {detail.body && <p style={{ margin: "14px 0 0", fontSize: 14, color: T.inkSoft, lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{detail.body}</p>}
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <Btn onClick={() => remove(detail.id)} ghost style={{ flex: 1 }}>Delete</Btn>
                {act
                  ? <Btn onClick={() => { setDetail(null); act.run(); }} style={{ flex: 1 }}>{act.label}</Btn>
                  : <Btn onClick={() => setDetail(null)} style={{ flex: 1 }}>Close</Btn>}
              </div>
            </div>
          </div>
        );
      })()}
    </Page>
  );
}
