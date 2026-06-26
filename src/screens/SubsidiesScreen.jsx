import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge, Btn, Input, TextArea, Avatar, Accordion, PageHero, AvatarIllustrations, ChildAvatar, ComAvatar, ROOM_ICONS, ACTIVITY_TEXTAREA_STYLE, ActionIllustration, HeroIllustration } from "../ui";
import { CHILD_AVATARS, DEFAULT_CHILDREN, DEFAULT_SCHEDULE, ROOM_COLORS, SOS_COLORS, VERBAL_STATUS_OPTIONS } from "../data";

export const subsidyFromRow = (row) => ({
  id: row.id,
  badge: row.badge,
  badgeColor: row.badge_color,
  label: row.label,
  org: row.org,
  amount: row.amount,
  saving: row.saving,
  color: row.color,
  steps: row.steps || [],
  eligibility: row.eligibility,
  contact: row.contact,
  website: row.website,
  tip: row.tip,
});
//  MOTIVATIONAL QUOTES

export function SubsidiesScreen({ pop, account }) {
  const [open, setOpen] = useState(null);
  const [detail, setDetail] = useState(null);
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [schemes, setSchemes] = useState([]);
  const [loadingSchemes, setLoadingSchemes] = useState(true);

  const loadNews = async () => {
    setLoadingNews(true);
    const { data } = await supabase.from("subsidy_news").select("*").order("sort_order").order("created_at", { ascending: false });
    setNews(data || []);
    setLoadingNews(false);
  };

  const loadSchemes = async () => {
    setLoadingSchemes(true);
    const { data } = await supabase.from("subsidies").select("*").order("sort_order").order("created_at");
    setSchemes(data || []);
    setLoadingSchemes(false);
  };

  useEffect(() => { loadNews(); loadSchemes(); }, []);

  if (detail) return (
    <Page>
      <button onClick={() => setDetail(null)} style={{ background: "none", border: "none", color: T.purple, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: T.fontBody, padding: "0 0 16px", display: "flex", alignItems: "center", gap: 6 }}>← All Schemes</button>
      <div style={{ padding: "18px 16px", background: detail.color + "15", borderRadius: T.rL, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: detail.color + "20", display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${detail.color}30` }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="10" stroke={detail.color} strokeWidth="1.8" fill={detail.color} fillOpacity="0.15"/>
              <circle cx="14" cy="14" r="4.5" fill={detail.color}/>
            </svg>
          </div><div><Badge color={detail.badgeColor} bg={detail.badgeColor + "18"}>{detail.badge}</Badge><p style={{ margin: "4px 0 0", fontWeight: 800, color: T.ink, fontSize: 16 }}>{detail.label}</p></div></div>
        <p style={{ margin: "0 0 4px", color: T.ink, fontWeight: 700, fontSize: 14 }}>💰 {detail.amount}</p>
        <p style={{ margin: 0, color: T.inkSoft, fontSize: 12, lineHeight: 1.5 }}>{detail.saving}</p>
      </div>
      <Card style={{ background: T.greenL, border: `1px solid ${T.green}25`, marginBottom: 16 }}><p style={{ margin: 0, color: T.green, fontSize: 13, fontWeight: 700, lineHeight: 1.7 }}>✅ Eligibility: {detail.eligibility}</p></Card>
      <SectionLabel style={{ marginBottom: 10 }}>How to Apply</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {detail.steps.map((step, i) => (
          <Card key={i} style={{ padding: "12px 14px" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: detail.color + "20", color: detail.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
              <p style={{ margin: 0, color: T.inkSoft, fontSize: 13, lineHeight: 1.65, flex: 1 }}>{step}</p>
            </div>
          </Card>
        ))}
      </div>
      <Card style={{ background: T.amberL, border: `1px solid ${T.amber}25`, marginBottom: 14 }}>
        <p style={{ margin: "0 0 4px", fontWeight: 800, color: T.amber, fontSize: 13 }}>💡 Parent Tip</p>
        <p style={{ margin: 0, color: T.inkSoft, fontSize: 13, lineHeight: 1.6 }}>{detail.tip}</p>
      </Card>
      <Card style={{ background: "#0A2218", border: "none" }}>
        <p style={{ margin: "0 0 4px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Contact</p>
        <p style={{ margin: "0 0 10px", color: "white", fontSize: 13, fontWeight: 700 }}>{detail.contact}</p>
        <a href={`https://${detail.website}`} target="_blank" rel="noreferrer" style={{ display: "block", background: "rgba(255,255,255,0.12)", color: "white", borderRadius: T.r, padding: "10px", textDecoration: "none", fontSize: 13, fontWeight: 700, textAlign: "center" }}>🌐 Visit Official Website →</a>
      </Card>
    </Page>
  );

  return (
    <Page>
      <h2 style={{ margin: "0 0 6px", color: T.ink, fontSize: 22, fontWeight: 800 }}>Subsidies & Aid</h2>
      <p style={{ margin: "0 0 20px", color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Singapore government schemes that can dramatically reduce the cost of autism therapy and support.</p>


      <Card style={{ marginBottom: 20, background: loadingNews ? T.canvas : T.greenL, border: `1px solid ${T.green}25` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: loadingNews ? T.amber : T.green }} />
            <p style={{ margin: 0, fontWeight: 800, color: T.ink, fontSize: 13 }}>Latest Updates</p>
          </div>
        </div>

        {loadingNews && <p style={{ margin: 0, color: T.inkSoft, fontSize: 13 }}>Loading latest updates...</p>}
        {!loadingNews && news.length === 0 && <p style={{ margin: 0, color: T.inkSoft, fontSize: 13 }}>No updates yet. Tap a scheme below for verified information.</p>}

        {!loadingNews && news.map((u, i) => (
          <div key={u.id} style={{ padding: "8px 0", borderTop: i === 0 ? "none" : `1px solid rgba(0,0,0,0.06)`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>{u.is_new && <Badge color={T.green} bg={T.green + "20"}>NEW</Badge>}<p style={{ margin: 0, fontWeight: 700, color: T.ink, fontSize: 13 }}>{u.scheme}</p></div>
              <p style={{ margin: "2px 0 0", color: T.inkSoft, fontSize: 12 }}>{u.headline}</p>
            </div>
          </div>
        ))}
      </Card>

      <Card style={{ background: T.ink, border: "none", marginBottom: 20 }}>
        <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Where to start</p>
        <p style={{ margin: "0 0 12px", color: "white", fontSize: 14, fontWeight: 700, lineHeight: 1.6 }}>If your child is under 7 — start with EIPIC. Fees can drop from $780 to as little as $5/month after subsidy.</p>
        <a href="https://supportgowhere.life.gov.sg" target="_blank" rel="noreferrer" style={{ display: "block", background: T.green, color: "white", borderRadius: T.r, padding: "10px", textDecoration: "none", fontSize: 13, fontWeight: 700, textAlign: "center" }}>🔍 Check SupportGoWhere.sg</a>
      </Card>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <SectionLabel style={{ margin: 0 }}>All Schemes</SectionLabel>
      </div>

      {loadingSchemes ? (
        <p style={{ margin: 0, color: T.inkSoft, fontSize: 13 }}>Loading schemes...</p>
      ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {schemes.map(s => (
          <Card key={s.id} onClick={() => setDetail(subsidyFromRow(s))}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${s.color}20` }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="8" stroke={s.color} strokeWidth="1.5" fill={s.color} fillOpacity="0.12"/>
                  <circle cx="11" cy="11" r="3.5" fill={s.color} opacity="0.8"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                  <p style={{ margin: 0, fontWeight: 800, color: T.ink, fontSize: 14 }}>{s.label}</p>
                  <Badge color={s.badge_color} bg={s.badge_color + "18"}>{s.badge}</Badge>
                </div>
                <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>{s.org} · {s.amount}</p>
              </div>
              <span style={{ color: T.inkMuted, fontSize: 20 }}>›</span>
            </div>
          </Card>
        ))}
      </div>
      )}
    </Page>
  );
}
