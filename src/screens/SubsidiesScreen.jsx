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

const SUPPORT_META = {
  financial:  { label: "Financial help",     color: T.slate,  bg: T.slateL },
  therapy:    { label: "Therapy & medical",  color: T.green,  bg: T.greenL },
  education:  { label: "Education",          color: T.teal,   bg: T.tealL },
  devices:    { label: "Assistive tech",     color: T.violet, bg: T.violetL },
  transport:  { label: "Transport",          color: T.indigo, bg: T.indigoL },
  caregiving: { label: "Caregiving & home",  color: T.red,    bg: T.redL },
  work:       { label: "Training & work",    color: T.slate,  bg: T.slateL },
};
function categoryMeta(s) {
  const meta = SUPPORT_META[(s.support_types || [])[0]];
  if (meta) return meta;
  const color = s.color || T.purple;
  return { label: s.badge || "Support", color, bg: color + "15" };
}

const SearchIcon = ({ size = 17, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
    <path d="m21 21-4.3-4.3" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SlidersIcon = ({ size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="15" cy="7" r="2.3" stroke={color} strokeWidth="1.8" />
    <circle cx="9" cy="17" r="2.3" stroke={color} strokeWidth="1.8" />
  </svg>
);

const ExternalLinkIcon = ({ size = 13, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M14 5h5v5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 5 10 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M12 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = ({ size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 6l12 12M18 6 6 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ResetIcon = ({ size = 14, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 12a9 9 0 1 0 3-6.7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M3 4v5h5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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

  const trackRef = useRef(null);
  const pausedRef = useRef(false);
  const [slide, setSlide] = useState(0);

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
      .slice(0, 4);
  }, [schemes]);

  const carouselStep = () => {
    const el = trackRef.current;
    if (!el || !el.firstElementChild) return el ? el.clientWidth : 1;
    return el.firstElementChild.offsetWidth + 10;
  };

  useEffect(() => {
    if (latestUpdates.length < 2) return;
    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el || pausedRef.current) return;
      const next = (Math.round(el.scrollLeft / carouselStep()) + 1) % latestUpdates.length;
      el.scrollTo({ left: next * carouselStep(), behavior: "smooth" });
    }, 4500);
    return () => clearInterval(id);
  }, [latestUpdates.length]);

  const onCarouselScroll = () => {
    const el = trackRef.current;
    if (el) setSlide(Math.round(el.scrollLeft / carouselStep()));
  };

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
  const anyActive = filterCount > 0 || !!query;

  // While the carousel is showing, hide the schemes it already features from
  // the list below instead of repeating them.
  const visibleSchemes = useMemo(() => {
    if (anyActive || latestUpdates.length === 0) return filteredSchemes;
    const featured = new Set(latestUpdates.map(u => u.id));
    return filteredSchemes.filter(s => !featured.has(s.id));
  }, [filteredSchemes, latestUpdates, anyActive]);

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
      <p style={{ margin: "0 0 20px", color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Find the support your family may qualify for.</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, height: 46, padding: "0 14px", background: T.surface, border: `1.5px solid ${query ? T.purple : T.border}`, borderRadius: T.r, boxSizing: "border-box" }}>
          <SearchIcon size={17} color={T.inkMuted} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search support…"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: T.fontBody, fontSize: 14, color: T.ink, minWidth: 0 }}
          />
        </label>
        <button onClick={() => setShowFilters(true)} title="Filters" style={{ position: "relative", width: 46, height: 46, flexShrink: 0, borderRadius: T.r, background: T.surface, border: `1.5px solid ${filterCount > 0 ? T.purple : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <SlidersIcon size={18} color={filterCount > 0 ? T.purple : T.ink} />
          {filterCount > 0 && (
            <span style={{ position: "absolute", top: 6, right: 7, minWidth: 16, height: 16, padding: "0 3px", borderRadius: 99, background: T.purple, color: "white", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 2px ${T.surface}` }}>{filterCount}</span>
          )}
        </button>
      </div>

      {showFilters && (
        <>
          <div onClick={() => setShowFilters(false)} style={{ position: "fixed", inset: 0, background: "rgba(35,32,28,0.32)", zIndex: 145 }} />
          <div role="dialog" aria-label="Filters" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 146, background: T.canvas, borderRadius: "22px 22px 0 0", borderTop: `1px solid ${T.border}`, boxShadow: "0 -12px 40px rgba(35,32,28,0.14)", padding: "10px 20px calc(env(safe-area-inset-bottom, 0px) + 20px)", maxWidth: 480, margin: "0 auto", maxHeight: "82vh", overflowY: "auto" }}>
            <div style={{ width: 38, height: 4, borderRadius: 99, background: T.border, margin: "2px auto 16px" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <p style={{ margin: 0, fontFamily: T.fontDisplay, fontWeight: 600, fontSize: 19, color: T.ink }}>Filters</p>
              <button onClick={() => setShowFilters(false)} aria-label="Close" style={{ background: "none", border: "none", color: T.inkMuted, cursor: "pointer", padding: 6, margin: "-6px -6px 0 0", display: "flex" }}><CloseIcon size={18} color={T.inkMuted} /></button>
            </div>
            <FilterRow label="Who is this for?" options={RESIDENCY} value={res} onChange={setRes} />
            <FilterRow label="Child or adult?" options={STAGE} value={stage} onChange={setStage} />
            <FilterRow label="Type of support" options={SUPPORT} value={support} onChange={setSupport} />
            <FilterRow label="Target group" options={TARGET} value={target} onChange={setTarget} />
            <FilterRow label="Income / means-testing" options={MEANS} value={means} onChange={setMeans} />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={resetFilters} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 999, padding: "0 18px", height: 48, color: T.inkSoft, fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: T.fontBody }}>
                <ResetIcon size={14} color={T.inkSoft} /> Reset
              </button>
              <Btn onClick={() => setShowFilters(false)} full style={{ borderRadius: 999, height: 48 }}>Show {visibleSchemes.length} {visibleSchemes.length === 1 ? "result" : "results"}</Btn>
            </div>
          </div>
        </>
      )}

      {loadingSchemes ? (
        <p style={{ margin: 0, color: T.inkSoft, fontSize: 13 }}>Loading schemes...</p>
      ) : (
      <>
      {!anyActive && latestUpdates.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.inkMuted }}>Recently updated</p>
          <div
            ref={trackRef}
            onScroll={onCarouselScroll}
            onTouchStart={() => { pausedRef.current = true; }}
            onTouchEnd={() => { setTimeout(() => { pausedRef.current = false; }, 3500); }}
            onMouseEnter={() => { pausedRef.current = true; }}
            onMouseLeave={() => { pausedRef.current = false; }}
            style={{ display: "flex", gap: 10, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 4 }}
          >
            {latestUpdates.map(u => (
              <Card key={u.id} onClick={() => setDetail(subsidyFromRow(u))} style={{ flexShrink: 0, width: "82%", scrollSnapAlign: "start", padding: "14px", cursor: "pointer" }}>
                <p style={{ margin: "0 0 4px", fontWeight: 800, color: T.ink, fontSize: 14.5, lineHeight: 1.35 }}>{u.label}</p>
                <p style={{ margin: 0, color: T.inkMuted, fontSize: 11.5 }}>{u.org}</p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, color: T.purple, fontSize: 12.5, fontWeight: 700 }}>
                  See details <ExternalLinkIcon size={12} color={T.purple} />
                </span>
              </Card>
            ))}
          </div>
          {latestUpdates.length > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 10 }}>
              {latestUpdates.map((_, i) => (
                <span key={i} style={{ height: 5, width: i === slide ? 18 : 5, borderRadius: 99, background: i === slide ? T.purple : T.border, transition: "width .2s ease" }} />
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ margin: 0, color: T.inkMuted, fontSize: 12, fontWeight: 600 }}>{visibleSchemes.length} {visibleSchemes.length === 1 ? "scheme" : "schemes"} found</p>
        {anyActive && (
          <button onClick={resetFilters} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none", color: T.purple, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: T.fontBody, padding: 0 }}>
            <ResetIcon size={13} color={T.purple} /> Reset
          </button>
        )}
      </div>

      {target === "ASD" && (
        <div style={{ marginBottom: 12, background: T.purpleL, border: `1px solid ${T.purple}30`, borderRadius: T.r, padding: "10px 14px" }}>
          <p style={{ margin: 0, color: T.ink, fontSize: 12.5, lineHeight: 1.55 }}>A child or adult with autism qualifies for every scheme here — autism is recognised as a disability across these programmes.</p>
        </div>
      )}

      {res === "Foreigner" && (
        <div style={{ marginBottom: 12, background: T.canvas, border: `1px solid ${T.border}`, borderRadius: T.r, padding: "10px 14px" }}>
          <p style={{ margin: 0, color: T.inkSoft, fontSize: 12.5, lineHeight: 1.55 }}>Most government subsidies are for citizens and PRs. Foreigners can still access special education school places (at full international fees) and private therapy. Speak to your child's school or a social worker about options.</p>
        </div>
      )}

      {visibleSchemes.length === 0 ? (
        <Card style={{ background: T.greenL, border: `1px solid ${T.green}25` }}><p style={{ margin: 0, color: T.inkSoft, fontSize: 13 }}>No schemes match those filters.</p></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visibleSchemes.map(s => {
            const cat = categoryMeta(s);
            return (
              <Card key={s.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: cat.bg, color: cat.color, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", padding: "5px 10px", borderRadius: 99 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: cat.color }} />
                    {cat.label}
                  </span>
                </div>

                <a href={`https://${s.website}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", gap: 5, textDecoration: "none" }}>
                  <p style={{ margin: "0 0 4px", fontWeight: 800, color: T.ink, fontSize: 15 }}>{s.label}</p>
                  <ExternalLinkIcon size={12} color={T.inkMuted} />
                </a>
                {s.saving && <p style={{ margin: 0, color: T.inkSoft, fontSize: 13, lineHeight: 1.55 }}>{s.saving}</p>}

                <div style={{ marginTop: 10, background: T.canvas, borderRadius: T.r, padding: "9px 12px", border: `1px solid ${T.border}` }}>
                  <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: T.inkMuted }}>What you get</p>
                  <p style={{ margin: "2px 0 0", fontWeight: 700, color: T.ink, fontSize: 13.5 }}>{s.amount}</p>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.inkSoft, background: T.canvas, borderRadius: 8, padding: "5px 9px" }}>{ageLabel(s.age_min, s.age_max)}</span>
                  {(s.residency || []).map(r => (
                    <span key={r} style={{ fontSize: 11, fontWeight: 700, color: T.inkSoft, background: T.canvas, borderRadius: 8, padding: "5px 9px" }}>{RES_LABEL[r] || r}</span>
                  ))}
                  <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 8, padding: "5px 9px", color: s.means_tested ? T.amber : T.green, background: s.means_tested ? T.amberL : T.greenL }}>
                    {s.means_tested ? "Income-tested" : "No income test"}
                  </span>
                </div>

                {s.means_note && (
                  <p style={{ margin: "8px 0 0", color: T.inkMuted, fontSize: 12, lineHeight: 1.55 }}>ℹ️ {s.means_note}</p>
                )}
              </Card>
            );
          })}
        </div>
        )}
      </>
      )}

      <p style={{ margin: "20px 0 0", color: T.inkMuted, fontSize: 11, lineHeight: 1.6 }}>
        Bonda checks these against official government and agency sources. Amounts and rules can change — always confirm on the official page before applying. Not affiliated with the Singapore Government.
      </p>
    </Page>
  );
}
