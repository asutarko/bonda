import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge, Btn, Input, TextArea, Avatar, Accordion, PageHero, AvatarIllustrations, ChildAvatar, ComAvatar, ROOM_ICONS, ACTIVITY_TEXTAREA_STYLE, HeroIllustration } from "../ui";
import { CHILD_AVATARS, DEFAULT_CHILDREN, DEFAULT_SCHEDULE, ROOM_COLORS, SOS_COLORS, VERBAL_STATUS_OPTIONS } from "../data";

export const QUOTES = [
  { q: "You are not failing. You are learning a language no one taught you.", a: "For every autism parent" },
  { q: "Every time your child feels safe, you built that.", a: "Occupational Therapy wisdom" },
  { q: "Progress in autism is measured in moments, not milestones.", a: "ASD Family Research" },
  { q: "You didn't choose an easy road. You chose your child.", a: "For caregivers on hard days" },
  { q: "Rest is not giving up. A rested parent is the most effective therapy.", a: "Caregiver wellbeing research" },
  { q: "You have gotten through every hard day so far. That's 100%.", a: "For the exhausted parent" },
  { q: "Your child may not say 'I love you' the way you expect. But they feel it every time you stay.", a: "Attachment research, ASD" },
  { q: "The days you feel you're getting nowhere are often the days the most is being planted.", a: "For parents in the hard season" },
  { q: "Small consistent moments of connection are more powerful than any therapy session.", a: "Developmental neuroscience" },
  { q: "Burnout is not weakness. It is what happens when someone cares deeply for a very long time.", a: "Caregiver mental health research" },
  { q: "Your child does not need you to have all the answers. They need you to keep showing up.", a: "For parents who feel lost" },
  { q: "Every autistic child is different. Bonda gives you frameworks, not prescriptions. You know your child best.", a: "Norena Darsana · Bonda" },
];
//  COMMUNITY / CHAT STORAGE

// Real, recent items (paraphrased). Replace with a live feed once one exists —
// fetch a vetted autism/caregiving source and map each result into this shape.
const NEWS = [
  { tag: "Singapore", tone: "purple", source: "The Straits Times", date: "20 Jul 2026", title: "Shorter waits for early-intervention places", blurb: "Families now wait about 5.5 months on average for a subsidised EIPIC spot — noticeably down from earlier years.", url: "https://www.straitstimes.com" },
  { tag: "Policy", tone: "teal", source: "MSF Singapore", date: "2026", title: "More affordable, tailored early intervention", blurb: "Subsidised support now spans 21 EIPIC centres, plus learning support offered in about 550 preschools island-wide.", url: "https://www.msf.gov.sg" },
  { tag: "Research", tone: "violet", source: "ScienceDaily", date: "Jun 2026", title: "Autism may have distinct biological subtypes", blurb: "A large brain-imaging study points to several subtypes, each with its own pattern — a step toward more personalised support.", url: "https://www.sciencedaily.com/news/mind_brain/autism/" },
  { tag: "Research", tone: "indigo", source: "ScienceDaily", date: "Mar 2026", title: "New clue to how some forms of autism arise", blurb: "Scientists traced a molecular signalling pathway in the brain that may shape certain forms of autism.", url: "https://www.sciencedaily.com/news/mind_brain/autism/" },
];

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "documents", label: "Documents" },
  { key: "support", label: "Support" },
  { key: "guides", label: "Guides" },
];

const SearchIcon = ({ size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
    <path d="m21 21-4.3-4.3" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SlidersIcon = ({ size = 19, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="15" cy="7" r="2.3" stroke={color} strokeWidth="1.8" />
    <circle cx="9" cy="17" r="2.3" stroke={color} strokeWidth="1.8" />
  </svg>
);

const ArrowIcon = ({ size = 14, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 12h13" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <path d="M13 6l6 6-6 6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Quick-access chip tone + icon per action type — muted tag palette from theme.js
const QUICK_TONES = {
  letter:    { bg: T.indigoL, fg: T.indigo },
  subsidies: { bg: T.greenL,  fg: T.green },
  grants:    { bg: T.amberL,  fg: T.amber },
  sos:       { bg: T.redL,    fg: T.red },
  devGuide:  { bg: T.violetL, fg: T.violet },
  emotions:  { bg: T.tealL,   fg: T.teal },
  foster:    { bg: T.slateL,  fg: T.slate },
};

const QuickIcon = ({ type, size = 22, color }) => {
  const p = { fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    letter: <><rect x="3" y="5" width="18" height="14" rx="2.6" {...p} /><path d="m4 7.5 8 5.5 8-5.5" {...p} /></>,
    subsidies: <><circle cx="12" cy="12" r="9" {...p} /><path d="M12 6.5v11M15 9.4c0-1.4-1.4-2.1-3-2.1s-3 .8-3 2.1 1.4 1.9 3 2.3 3 .9 3 2.3-1.4 2.1-3 2.1-3-.7-3-2.1" {...p} /></>,
    grants: <><circle cx="12" cy="9" r="5" {...p} /><path d="M9 13.4 7 21l5-2.6L17 21l-2-7.6" {...p} /></>,
    sos: <><path d="M5 4h3l1.8 4.6L7.2 10a11 11 0 0 0 5.2 5.2l1.4-2.6L18.4 14V17a2 2 0 0 1-2.1 2A15.5 15.5 0 0 1 3 5.7 2 2 0 0 1 5 4Z" {...p} /></>,
    devGuide: <><path d="M3 17 9 11l4 4 8-8" {...p} /><path d="M16.5 7H21v4.5" {...p} /></>,
    emotions: <><circle cx="12" cy="12" r="9" {...p} /><path d="M8.4 14.4s1.3 2 3.6 2 3.6-2 3.6-2" {...p} /><path d="M9 9.6h.01M15 9.6h.01" {...p} /></>,
    foster: <><path d="M12 3l7 3v5c0 4.6-3 7.6-7 9-4-1.4-7-4.4-7-9V6Z" {...p} /><path d="m9 12 2 2 4-4" {...p} /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>{paths[type]}</svg>;
};

export function HomeScreen({ childCtx, setTab, push, account }) {
  const { children, activeChild, switchChild } = childCtx;
  const [quotes, setQuotes] = useState(QUOTES);
  const [qIdx, setQIdx] = useState(0);
  const [seen, setSeen] = useState([]);
  const [fade, setFade] = useState(true);
  const [paused, setPaused] = useState(false);
  const [banner, setBanner] = useState("");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const [newsActive, setNewsActive] = useState(0);
  const newsTrack = useRef(null);

  const loadQuotes = async () => {
    const { data } = await supabase.from("parent_quotes").select("*").order("sort_order").order("created_at");
    if (data?.length) {
      setQuotes(data.map(r => ({ id: r.id, q: r.quote, a: r.author })));
      setQIdx(Math.floor(Math.random() * data.length));
      setSeen([]);
    }
  };

  const loadBanner = async () => {
    const { data } = await supabase.from("home_banner").select("message").eq("active", true).order("created_at").limit(1).maybeSingle();
    if (data?.message) setBanner(data.message);
  };

  useEffect(() => { loadQuotes(); loadBanner(); }, []);

  useEffect(() => {
    if (paused || quotes.length < 2) return;
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setQIdx(prev => {
          const newSeen = [...seen, prev];
          const pool = quotes.map((_, i) => i).filter(i => !newSeen.includes(i));
          const next = pool.length ? pool[Math.floor(Math.random() * pool.length)] : Math.floor(Math.random() * quotes.length);
          setSeen(pool.length ? newSeen : [prev]);
          return next;
        });
        setFade(true);
      }, 300);
    }, 6000);
    return () => clearInterval(t);
  }, [paused, seen, qIdx, quotes]);

  useEffect(() => {
    if (!filterOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setFilterOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filterOpen]);

  const q = quotes[qIdx] || quotes[0];

  const isFoster = activeChild?.caregiverType === "foster";

  const quickActions = [
    ...(isFoster ? [{ type: "foster", category: "documents", label: "Foster Parent Hub", desc: "HealthHub, CDA, school access guides", action: () => push("fosterHub"), isFoster: true }] : []),
    { type: "letter", category: "documents", label: "Generate Carer Letter", desc: "Introduction letter for clinics & schools", action: () => push("carerLetter") },
    { type: "grants", category: "support", label: "Subsidies & Grants", desc: "Government schemes that cut therapy & care costs", action: () => push("subsidiesGrants") },
    { type: "subsidies", category: "support", label: "Support Directory", desc: "Singapore autism & caregiver contacts", action: () => push("subsidies") },
    { type: "sos", category: "support", label: "Emergency Contacts", desc: "Singapore autism helplines", action: () => push("sos") },
    { type: "devGuide", category: "guides", label: "Development & Behaviour Guide", desc: "Home activities & behaviour training", action: () => push("devGuide") },
    { type: "emotions", category: "guides", label: "Emotion & Behaviour", desc: "Understand feelings & behaviours", action: () => push("emotionsGuide") },
  ];

  const searchQ = query.trim().toLowerCase();
  const filteredActions = quickActions.filter(a => {
    if (category !== "all" && a.category !== category) return false;
    if (searchQ && !(a.label + " " + a.desc).toLowerCase().includes(searchQ)) return false;
    return true;
  });
  const filterActive = category !== "all";

  const newsTone = (tone) => ({ bg: T[tone + "L"] || T.purpleL, fg: T[tone] || T.purple });
  const newsStep = () => {
    const el = newsTrack.current;
    const card = el && el.querySelector("[data-news-card]");
    return card ? card.offsetWidth + 12 : 1;
  };
  const onNewsScroll = () => {
    const el = newsTrack.current;
    if (!el) return;
    setNewsActive(Math.max(0, Math.min(NEWS.length - 1, Math.round(el.scrollLeft / newsStep()))));
  };
  const goToNews = (i) => newsTrack.current && newsTrack.current.scrollTo({ left: i * newsStep(), behavior: "smooth" });

  const firstName = account?.name?.split(" ")[0];

  return (
    <Page>

      <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 600, fontSize: 32, lineHeight: 1.06, letterSpacing: "-0.015em", margin: "4px 0 6px", color: T.ink }}>
        {children.length === 0 ? "Welcome to Bonda" : `Hi${firstName ? `, ${firstName}` : ""} 👋`}
      </h1>
      <p style={{ margin: "0 0 18px", color: T.inkSoft, fontSize: 14, lineHeight: 1.5, maxWidth: "30rem" }}>
        {children.length === 0
          ? "Set up your child's profile to unlock schedules, check-ins and emotion tracking."
          : activeChild ? `Here's what's ready for ${activeChild.name} today.` : "Manage schedules, tools and support for your family."}
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, height: 46, padding: "0 14px", background: T.surface, border: `1.5px solid ${query ? T.purple : T.border}`, borderRadius: T.r, boxSizing: "border-box" }}>
          <SearchIcon size={17} color={T.inkMuted} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tools & guides"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: T.fontBody, fontSize: 14, color: T.ink, minWidth: 0 }}
          />
        </label>
        <button onClick={() => setFilterOpen(true)} title="Filters" style={{ position: "relative", width: 46, height: 46, flexShrink: 0, borderRadius: T.r, background: T.surface, border: `1.5px solid ${filterActive ? T.purple : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <SlidersIcon size={18} color={filterActive ? T.purple : T.ink} />
          {filterActive && <span style={{ position: "absolute", top: 7, right: 8, width: 7, height: 7, borderRadius: "50%", background: T.purple, boxShadow: `0 0 0 2px ${T.surface}` }} />}
        </button>
      </div>

      <div style={{ marginBottom: 24 }}>
        {children.length === 0 ? (
          <Card style={{ display: "flex", alignItems: "center", gap: 14, padding: 18 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.purple }}>Get started</p>
              <p style={{ margin: 0, fontFamily: T.fontDisplay, fontWeight: 600, fontSize: 18, color: T.ink, lineHeight: 1.22 }}>Add your child's profile</p>
              <p style={{ margin: "6px 0 14px", fontSize: 12.5, color: T.inkSoft, lineHeight: 1.45 }}>Personalised schedules, check-ins and emotion tracking begin here.</p>
              <Btn onClick={() => push("addChild")} style={{ borderRadius: 999, padding: "11px 18px", fontSize: 13.5 }}>+ Add a child profile</Btn>
            </div>
            <div style={{ width: 108, flexShrink: 0 }}>
              <HeroIllustration />
            </div>
          </Card>
        ) : (
          <div>
            <SectionLabel action={<button onClick={() => push("addChild")} style={{ background: "none", border: "none", color: T.purple, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody }}>+ Add child</button>}>My Children</SectionLabel>
            <Card style={{ padding: "16px 14px" }}>
              <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 2 }}>
                {children.map(c => {
                  const active = activeChild?.id === c.id;
                  return (
                    <div key={c.id} onClick={() => switchChild(c.id)} style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}>
                      <ChildAvatar value={c.emoji} size={52} active={active} borderColor={active ? T.purple : "transparent"} />
                      <p style={{ margin: 0, fontSize: 11, fontWeight: active ? 800 : 600, color: active ? T.purple : T.inkSoft, whiteSpace: "nowrap" }}>{c.name}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </div>


      {activeChild && (
        <Card style={{ marginBottom: 24, background: T.ink, border: "none", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, opacity: 0.06 }}>
            <svg viewBox="0 0 80 80" width="80" height="80" style={{ position: "absolute", right: -10, top: -10 }}>
              <circle cx="60" cy="40" r="50" fill={T.purple}/>
            </svg>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
            <ChildAvatar value={activeChild.emoji} size={52} active={true} borderColor="rgba(255,255,255,0.15)" />
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 2px", color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Active child</p>
              <p style={{ margin: 0, color: "white", fontSize: 18, fontWeight: 800 }}>{activeChild.name}</p>
            </div>
            <button onClick={() => setTab("mychild")} title="Edit profile" style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M11.5 2.5 L15.5 6.5 L6 16 L2 16.5 L2.5 12.5 Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
              </svg>
            </button>
            <button onClick={() => { if (activeChild.active) setTab("schedule"); }} disabled={!activeChild.active} title={!activeChild.active ? `${activeChild.name}'s profile is pending admin approval` : undefined} style={{ background: activeChild.active ? T.purple : "rgba(255,255,255,0.12)", color: activeChild.active ? "white" : "rgba(255,255,255,0.4)", border: "none", borderRadius: T.r, padding: "8px 14px", fontWeight: 700, fontSize: 12, cursor: activeChild.active ? "pointer" : "not-allowed", fontFamily: T.fontBody }}>Schedule →</button>
          </div>
        </Card>
      )}


      <SectionLabel style={{ marginBottom: 10 }}>Quick Access</SectionLabel>

      {filteredActions.length === 0 ? (
        <Card style={{ marginBottom: 28, textAlign: "center", padding: "24px 16px" }}>
          <p style={{ margin: "0 0 10px", color: T.inkMuted, fontSize: 13 }}>No tools match your search.</p>
          <button onClick={() => { setQuery(""); setCategory("all"); }} style={{ background: "none", border: "none", color: T.purple, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: T.fontBody }}>Clear filters</button>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 28 }}>
          {filteredActions.map((a, i) => {
            const tone = QUICK_TONES[a.type] || QUICK_TONES.letter;
            return (
              <button
                key={i}
                onClick={a.action}
                title={a.desc}
                style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.rL, padding: "14px 8px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 9, cursor: "pointer", fontFamily: T.fontBody }}
              >
                <span style={{ width: 44, height: 44, borderRadius: 12, background: tone.bg, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <QuickIcon type={a.type} size={22} color={tone.fg} />
                </span>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: T.ink, textAlign: "center", lineHeight: 1.15 }}>{a.label}</span>
              </button>
            );
          })}
        </div>
      )}


      <SectionLabel style={{ marginBottom: 10 }}>For You, Parent</SectionLabel>
      {q && (
        <div
          onClick={() => setPaused(p => !p)}
          onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)}
          style={{ display: "flex", alignItems: "center", gap: 12, background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.rL, padding: "13px 16px", cursor: "pointer" }}
        >
          <span style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: 34, lineHeight: 0.6, color: T.purple, flexShrink: 0 }}>"</span>
          <div style={{ flex: 1, minWidth: 0, opacity: fade ? 1 : 0, transition: "opacity 0.3s" }}>
            <div style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontWeight: 500, fontSize: 13.5, lineHeight: 1.4, color: T.inkSoft, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{q.q}</div>
            <div style={{ fontSize: 10.5, color: T.inkMuted, marginTop: 4 }}>— {q.a} · {paused ? "Paused" : "Tap to pause"}</div>
          </div>
          <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: paused ? T.inkMuted : T.purple }} />
        </div>
      )}

      {banner && (
        <div style={{ marginTop: 16, padding: "14px 16px", background: T.greenL, borderRadius: T.r, border: `1px solid ${T.green}25` }}>
          <p style={{ margin: 0, color: T.green, fontSize: 12, fontWeight: 700, lineHeight: 1.7 }}>{banner}</p>
        </div>
      )}


      <SectionLabel style={{ marginTop: 28, marginBottom: 10 }}>Latest Articles</SectionLabel>
      <div
        ref={newsTrack}
        onScroll={onNewsScroll}
        style={{ display: "flex", gap: 12, overflowX: "auto", margin: "0 -18px", padding: "2px 18px 4px", scrollSnapType: "x mandatory" }}
      >
        {NEWS.map((n) => {
          const c = newsTone(n.tone);
          return (
            <div
              key={n.title}
              data-news-card
              onClick={() => window.open(n.url, "_blank", "noopener")}
              style={{ flex: "0 0 82%", scrollSnapAlign: "start", display: "flex", flexDirection: "column", background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.rL, padding: 15, cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.03em", padding: "4px 9px", borderRadius: 99, background: c.bg, color: c.fg }}>{n.tag}</span>
                <span style={{ fontSize: 10.5, color: T.inkMuted, fontWeight: 600 }}>{n.source} · {n.date}</span>
              </div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14.5, lineHeight: 1.3, letterSpacing: "-0.01em", color: T.ink }}>{n.title}</p>
              <p style={{ margin: "5px 0 0", fontSize: 12, color: T.inkSoft, lineHeight: 1.5 }}>{n.blurb}</p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: T.purple, fontSize: 11.5, fontWeight: 700, marginTop: "auto", paddingTop: 12 }}>
                Read more <ArrowIcon size={13} color={T.purple} />
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
        {NEWS.map((_, i) => (
          <button
            key={i}
            onClick={() => goToNews(i)}
            aria-label={`Go to item ${i + 1}`}
            style={{ width: newsActive === i ? 20 : 7, height: 7, borderRadius: 99, background: newsActive === i ? T.purple : `${T.ink}2E`, border: "none", padding: 0, cursor: "pointer", transition: "width 0.25s, background 0.25s" }}
          />
        ))}
      </div>

      <p style={{ textAlign: "center", marginTop: 28, marginBottom: 0, color: T.inkMuted, fontSize: 10, fontWeight: 600, letterSpacing: "0.05em" }}>◎ Bonda · Made with 💛 by Norena Darsana</p>
      <button onClick={() => push("legalHub")} style={{ display: "block", width: "100%", background: "none", border: "none", color: T.inkMuted, fontWeight: 600, fontSize: 10, letterSpacing: "0.05em", cursor: "pointer", fontFamily: T.fontBody, marginTop: 4, textAlign: "center", textDecoration: "underline" }}>
        Privacy Policy · Legal · DPO Contact
      </button>

      {filterOpen && (
        <>
          <div onClick={() => setFilterOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(35,32,28,0.32)", zIndex: 145 }} />
          <div role="dialog" aria-label="Filters" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 146, background: T.canvas, borderRadius: "22px 22px 0 0", borderTop: `1px solid ${T.border}`, boxShadow: "0 -12px 40px rgba(35,32,28,0.14)", padding: "10px 20px calc(env(safe-area-inset-bottom, 0px) + 20px)", maxWidth: 480, margin: "0 auto" }}>
            <div style={{ width: 38, height: 4, borderRadius: 99, background: T.border, margin: "2px auto 16px" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ margin: 0, fontFamily: T.fontDisplay, fontWeight: 600, fontSize: 19, color: T.ink }}>Filters</p>
              <button onClick={() => setCategory("all")} style={{ background: "none", border: "none", color: T.purple, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: T.fontBody }}>Reset</button>
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.inkSoft, margin: "18px 0 10px" }}>Type</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CATEGORIES.map(c => {
                const on = category === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    style={{ background: on ? T.purple : T.surface, border: `1px solid ${on ? T.purple : T.border}`, borderRadius: 99, padding: "9px 14px", fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: on ? "white" : T.ink, cursor: "pointer" }}
                  >{c.label}</button>
                );
              })}
            </div>
            <Btn onClick={() => setFilterOpen(false)} full style={{ marginTop: 22, borderRadius: 999 }}>Apply filters</Btn>
          </div>
        </>
      )}
    </Page>
  );
}
