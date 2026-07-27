import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge, Btn, Input, TextArea, Avatar, Accordion, PageHero, AvatarIllustrations, ChildAvatar, ComAvatar, ROOM_ICONS, ACTIVITY_TEXTAREA_STYLE, ActionIllustration, HeroIllustration } from "../ui";
import { CHILD_AVATARS, DEFAULT_CHILDREN, DEFAULT_SCHEDULE, ROOM_COLORS, SOS_COLORS, VERBAL_STATUS_OPTIONS } from "../data";
import { RESIDENCY, STAGE, SUPPORT, TARGET, MEANS } from "../data/subsidyFilters";

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 13px",
        borderRadius: 99,
        fontSize: 12.5,
        fontWeight: 700,
        fontFamily: T.fontBody,
        cursor: "pointer",
        border: `1.5px solid ${active ? T.purple : T.border}`,
        background: active ? T.purple : T.surface,
        color: active ? "white" : T.inkSoft,
      }}
    >
      {children}
    </button>
  );
}

function FilterRow({ label, options, value, onChange }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: T.inkMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map(o => (
          <Chip key={o.key} active={value === o.key} onClick={() => onChange(o.key)}>{o.label}</Chip>
        ))}
      </div>
    </div>
  );
}

function ageLabel(min, max) {
  if (min <= 0 && max >= 99) return "All ages";
  if (max >= 99) return `Ages ${min}+`;
  return `Ages ${min}–${max}`;
}

const RES_LABEL = { SC: "Citizen", PR: "PR", Foreigner: "Foreigner" };

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
  ageMin: row.age_min,
  ageMax: row.age_max,
  residency: row.residency || [],
  meansTested: row.means_tested,
  meansNote: row.means_note,
});
//  MOTIVATIONAL QUOTES

export function SubsidiesScreen({ pop, account }) {
  const [open, setOpen] = useState(null);
  const [detail, setDetail] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [loadingSchemes, setLoadingSchemes] = useState(true);

  const [query, setQuery] = useState("");
  const [res, setRes] = useState("all");
  const [stage, setStage] = useState("any");
  const [support, setSupport] = useState("all");
  const [target, setTarget] = useState("all");
  const [means, setMeans] = useState("any");
  const [showFilters, setShowFilters] = useState(false);

  const loadSchemes = async () => {
    setLoadingSchemes(true);
    const { data } = await supabase
      .from("subsidies")
      .select("*")
      .eq("available_online", true)
      .order("sort_order")
      .order("created_at");
    setSchemes(data || []);
    setLoadingSchemes(false);
  };

  useEffect(() => { loadSchemes(); }, []);

  // Live "Latest Updates" — driven entirely by the automated checker
  // (supabase/functions/check-subsidies), not by anyone writing a news post.
  const latestUpdates = useMemo(() => {
    return [...schemes]
      .filter(s => s.last_changed_at || s.last_checked_at)
      .sort((a, b) => new Date(b.last_changed_at || b.last_checked_at) - new Date(a.last_changed_at || a.last_checked_at))
      .slice(0, 10);
  }, [schemes]);

  const filteredSchemes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return schemes.filter(s => {
      const resOk = res === "all" || (s.residency || []).includes(res);
      const stageOk =
        stage === "any" ||
        (stage === "child" && s.age_min <= 17) ||
        (stage === "adult" && s.age_max >= 18);
      const supportOk = support === "all" || (s.support_types || []).includes(support);
      const targetOk = target === "all" || (s.target_groups || []).includes(target);
      const meansOk =
        means === "any" ||
        (means === "no" && !s.means_tested) ||
        (means === "yes" && s.means_tested);
      const qOk = !q || (s.label + " " + s.org + " " + s.amount + " " + s.saving).toLowerCase().includes(q);
      return resOk && stageOk && supportOk && targetOk && meansOk && qOk;
    });
  }, [schemes, query, res, stage, support, target, means]);

  const filterCount =
    (res !== "all" ? 1 : 0) +
    (stage !== "any" ? 1 : 0) +
    (support !== "all" ? 1 : 0) +
    (target !== "all" ? 1 : 0) +
    (means !== "any" ? 1 : 0);

  const resetFilters = () => {
    setQuery(""); setRes("all"); setStage("any");
    setSupport("all"); setTarget("all"); setMeans("any");
  };

  if (detail) return (
    <Page>
      <button onClick={() => setDetail(null)} style={{ background: "none", border: "none", color: T.purple, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: T.fontBody, padding: "0 0 16px", display: "flex", alignItems: "center", gap: 6 }}>← All Schemes</button>
      <div style={{ padding: "18px 16px", background: detail.color + "15", borderRadius: T.rL, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: detail.color + "20", display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${detail.color}30` }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="10" stroke={detail.color} strokeWidth="1.8" fill={detail.color} fillOpacity="0.15"/>
              <circle cx="14" cy="14" r="4.5" fill={detail.color}/>
            </svg>
          </div><div><Badge color={detail.badgeColor} bg={detail.badgeColor + "18"}>{detail.badge}</Badge>
            <a href={`https://${detail.website}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <p style={{ margin: "4px 0 0", fontWeight: 800, color: T.ink, fontSize: 16 }}>{detail.label} 🌐</p>
            </a>
          </div></div>
        <p style={{ margin: "0 0 4px", color: T.ink, fontWeight: 700, fontSize: 14 }}>💰 {detail.amount}</p>
        <p style={{ margin: 0, color: T.inkSoft, fontSize: 12, lineHeight: 1.5 }}>{detail.saving}</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.inkSoft, background: T.canvas, borderRadius: 8, padding: "5px 9px" }}>{ageLabel(detail.ageMin, detail.ageMax)}</span>
        {detail.residency.map(r => (
          <span key={r} style={{ fontSize: 11, fontWeight: 700, color: T.inkSoft, background: T.canvas, borderRadius: 8, padding: "5px 9px" }}>{RES_LABEL[r] || r}</span>
        ))}
        <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 8, padding: "5px 9px", color: detail.meansTested ? T.amber : T.green, background: detail.meansTested ? T.amberL : T.greenL }}>
          {detail.meansTested ? "Income-tested" : "No income test"}
        </span>
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
      {detail.meansNote && (
        <Card style={{ background: T.canvas, marginBottom: 14 }}>
          <p style={{ margin: 0, color: T.inkSoft, fontSize: 12, lineHeight: 1.6 }}>ℹ️ {detail.meansNote}</p>
        </Card>
      )}
      <Card style={{ background: T.amberL, border: `1px solid ${T.amber}25`, marginBottom: 14 }}>
        <p style={{ margin: "0 0 4px", fontWeight: 800, color: T.amber, fontSize: 13 }}>💡 Parent Tip</p>
        <p style={{ margin: 0, color: T.inkSoft, fontSize: 13, lineHeight: 1.6 }}>{detail.tip}</p>
      </Card>
      <Card style={{ background: "#0A2218", border: "none" }}>
        <p style={{ margin: "0 0 4px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Contact</p>
        <p style={{ margin: 0, color: "white", fontSize: 13, fontWeight: 700 }}>{detail.contact}</p>
      </Card>
    </Page>
  );

  return (
    <Page>
      <h2 style={{ margin: "0 0 6px", color: T.ink, fontSize: 22, fontWeight: 800 }}>Subsidies & Aid</h2>
      <p style={{ margin: "0 0 20px", color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Singapore government schemes that can dramatically reduce the cost of autism therapy and support.</p>

      {latestUpdates.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.green }} />
            <p style={{ margin: 0, fontWeight: 800, color: T.ink, fontSize: 13 }}>Latest Updates</p>
          </div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollSnapType: "x mandatory", margin: "0 -18px", padding: "0 18px 4px" }}>
            {latestUpdates.map(u => (
              <Card key={u.id} onClick={() => setDetail(subsidyFromRow(u))} style={{ background: T.greenL, border: `1px solid ${T.green}25`, flexShrink: 0, width: 220, scrollSnapAlign: "start", padding: "14px", cursor: "pointer" }}>
                <p style={{ margin: "0 0 2px", fontWeight: 700, color: T.ink, fontSize: 13 }}>{u.label}</p>
                <p style={{ margin: 0, color: T.inkSoft, fontSize: 12, lineHeight: 1.5 }}>{u.org} · {u.amount}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card style={{ background: T.ink, border: "none", marginBottom: 20 }}>
        <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Where to start</p>
        <p style={{ margin: "0 0 12px", color: "white", fontSize: 14, fontWeight: 700, lineHeight: 1.6 }}>If your child is under 7 — start with EIPIC. Fees can drop from $780 to as little as $5/month after subsidy.</p>
        <a href="https://supportgowhere.life.gov.sg" target="_blank" rel="noreferrer" style={{ display: "block", background: T.green, color: "white", borderRadius: T.r, padding: "10px", textDecoration: "none", fontSize: 13, fontWeight: 700, textAlign: "center" }}>🔍 Check SupportGoWhere.sg</a>
      </Card>

      <SectionLabel style={{ marginBottom: 10 }}>All Schemes</SectionLabel>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search support…"
          style={{ flex: 1, padding: "11px 14px", borderRadius: T.r, border: `1.5px solid ${T.border}`, fontSize: 14, fontFamily: T.fontBody, color: T.ink, background: T.canvas, outline: "none", boxSizing: "border-box" }}
        />
        <button
          onClick={() => setShowFilters(v => !v)}
          style={{
            position: "relative", display: "flex", alignItems: "center", gap: 6, padding: "0 16px",
            borderRadius: T.r, border: `1.5px solid ${showFilters ? T.purple : T.border}`,
            background: showFilters ? T.purple : T.surface, color: showFilters ? "white" : T.purple,
            fontWeight: 700, fontSize: 13, fontFamily: T.fontBody, cursor: "pointer",
          }}
        >
          Filters
          {filterCount > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 18, height: 18, padding: "0 4px", borderRadius: 99, background: T.amber, color: "#3a2a00", fontSize: 11, fontWeight: 800 }}>{filterCount}</span>
          )}
        </button>
      </div>

      {showFilters && (
        <Card style={{ marginBottom: 14 }}>
          <FilterRow label="Who is this for?" options={RESIDENCY} value={res} onChange={setRes} />
          <FilterRow label="Child or adult?" options={STAGE} value={stage} onChange={setStage} />
          <FilterRow label="Type of support" options={SUPPORT} value={support} onChange={setSupport} />
          <FilterRow label="Target group" options={TARGET} value={target} onChange={setTarget} />
          <FilterRow label="Income / means-testing" options={MEANS} value={means} onChange={setMeans} />
          <button onClick={resetFilters} style={{ background: "none", border: "none", color: T.purple, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: T.fontBody, padding: 0 }}>Reset filters</button>
        </Card>
      )}

      {loadingSchemes ? (
        <p style={{ margin: 0, color: T.inkSoft, fontSize: 13 }}>Loading schemes...</p>
      ) : (
      <>
        <p style={{ margin: "0 0 10px", color: T.inkMuted, fontSize: 12, fontWeight: 600 }}>{filteredSchemes.length} {filteredSchemes.length === 1 ? "result" : "results"}</p>
        {filteredSchemes.length === 0 ? (
          <Card style={{ background: T.greenL, border: `1px solid ${T.green}25` }}><p style={{ margin: 0, color: T.inkSoft, fontSize: 13 }}>No schemes match those filters.</p></Card>
        ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredSchemes.map(s => (
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
                  <p style={{ margin: "3px 0 0", color: T.inkMuted, fontSize: 11 }}>{ageLabel(s.age_min, s.age_max)} · {(s.residency || []).map(r => RES_LABEL[r] || r).join(", ")}</p>
                </div>
                <span style={{ color: T.inkMuted, fontSize: 20 }}>›</span>
              </div>
            </Card>
          ))}
        </div>
        )}
      </>
      )}
    </Page>
  );
}
