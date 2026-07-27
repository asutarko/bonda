import React, { useState, useEffect, useRef } from "react";

/*
  Bonda — new-user home screen, built to the Bonda design system
  --------------------------------------------------------------
  Tokens: warm ivory canvas (#F4F1EB), single teal accent (#3E6E6A) for links /
  active / primary only, Fraunces for large titles + section headings, Plus
  Jakarta Sans for everything else, hairlines instead of shadows, muted tag
  tones, sentence case throughout.

  - Zero external dependencies (React only). Inline SVG icons, so it drops into
    your app whether or not it uses Tailwind or an icon library.
  - The .bonda-stage wrapper is preview framing only. To use in your app, keep
    <div className="bonda-root"> ... </div> and drop .bonda-stage.
  - NEWS is real, recent, curated. In production, replace it with a live feed
    (see the note above the array) mapped into the same shape.
  - The logo mark is an inline SVG stand-in — swap in your real Bonda logo asset.
*/

const C = {
  canvas: "#F4F1EB",
  card: "#FFFFFF",
  ink: "#23201C",
  ink70: "rgba(35,32,28,.70)",
  ink55: "rgba(35,32,28,.55)",
  ink40: "rgba(35,32,28,.40)",
  accent: "#3E6E6A",
  accentPress: "#345F5B",
  line: "rgba(35,32,28,.12)",
  lineStrong: "rgba(35,32,28,.20)",
  focus: "rgba(62,110,106,.16)",
  // muted tag tones (bg / text)
  tealBg: "#E6EDEC", tealTx: "#2E5A56",
  blueBg: "#E4ECF3", blueTx: "#3A5A78",
  roseBg: "#F3E7EA", roseTx: "#7A4651",
  violetBg: "#EDE8F3", violetTx: "#574B78",
  indigoBg: "#E8EAF3", indigoTx: "#444B78",
  slateBg: "#E9EAEC", slateTx: "#474C52",
};

/* ---------- inline icon set (stroke, currentColor) ---------- */
function Icon({ name, size = 22, color = "currentColor", w = 1.8 }) {
  const p = { fill: "none", stroke: color, strokeWidth: w, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    bell: <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" {...p} /><path d="M13.7 21a2 2 0 0 1-3.4 0" {...p} /></>,
    search: <><circle cx="11" cy="11" r="7" {...p} /><path d="m21 21-4.3-4.3" {...p} /></>,
    sliders: <><path d="M4 7h9M17 7h3M4 17h3M11 17h9" {...p} /><circle cx="15" cy="7" r="2.3" {...p} /><circle cx="9" cy="17" r="2.3" {...p} /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2.6" {...p} /><path d="m4 7.5 8 5.5 8-5.5" {...p} /></>,
    dollar: <><circle cx="12" cy="12" r="9" {...p} /><path d="M12 6.5v11M15 9.4c0-1.4-1.4-2.1-3-2.1s-3 .8-3 2.1 1.4 1.9 3 2.3 3 .9 3 2.3-1.4 2.1-3 2.1-3-.7-3-2.1" {...p} /></>,
    phone: <><path d="M5 4h3l1.8 4.6L7.2 10a11 11 0 0 0 5.2 5.2l1.4-2.6L18.4 14V17a2 2 0 0 1-2.1 2A15.5 15.5 0 0 1 3 5.7 2 2 0 0 1 5 4Z" {...p} /></>,
    growth: <><path d="M3 17 9 11l4 4 8-8" {...p} /><path d="M16.5 7H21v4.5" {...p} /></>,
    smile: <><circle cx="12" cy="12" r="9" {...p} /><path d="M8.4 14.4s1.3 2 3.6 2 3.6-2 3.6-2" {...p} /><path d="M9 9.6h.01M15 9.6h.01" {...p} /></>,
    grid: <><rect x="4" y="4" width="7" height="7" rx="1.8" {...p} /><rect x="13" y="4" width="7" height="7" rx="1.8" {...p} /><rect x="4" y="13" width="7" height="7" rx="1.8" {...p} /><rect x="13" y="13" width="7" height="7" rx="1.8" {...p} /></>,
    chevron: <path d="m9 6 6 6-6 6" {...p} />,
    more: <g fill={color} stroke="none"><circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" /></g>,
    arrow: <><path d="M5 12h13" {...p} /><path d="M13 6l6 6-6 6" {...p} /></>,
    home: <><path d="M4 11 12 4l8 7" {...p} /><path d="M6 10.5V19h12v-8.5" {...p} /></>,
    child: <><circle cx="11" cy="8" r="3.7" {...p} /><path d="M4.5 20c0-3.6 2.9-5.6 6.5-5.6s6.5 2 6.5 5.6" {...p} /></>,
    calendar: <><rect x="4" y="5" width="16" height="16" rx="2.6" {...p} /><path d="M4 9.5h16M8.5 3v4M15.5 3v4" {...p} /></>,
    users: <><circle cx="9" cy="8" r="3.3" {...p} /><path d="M3.2 20c0-3.2 2.6-5 5.8-5s5.8 1.8 5.8 5" {...p} /><path d="M16 5.4a3.3 3.3 0 0 1 0 6.1M17.6 15.4c1.8.7 3.2 2.2 3.2 4.6" {...p} /></>,
    user: <><circle cx="12" cy="8" r="4" {...p} /><path d="M5 20c0-4 3.1-6.4 7-6.4s7 2.4 7 6.4" {...p} /></>,
    shield: <><path d="M12 3l7 3v5c0 4.6-3 7.6-7 9-4-1.4-7-4.4-7-9V6Z" {...p} /><path d="m9 12 2 2 4-4" {...p} /></>,
    card: <><rect x="3" y="6" width="18" height="12" rx="2.6" {...p} /><path d="M3 10h18" {...p} /></>,
    help: <><circle cx="12" cy="12" r="9" {...p} /><path d="M9.6 9.5a2.4 2.4 0 1 1 3.4 2.2c-.9.4-1.5 1-1.5 2M12 17h.01" {...p} /></>,
    logout: <><path d="M15 4h2.5A1.5 1.5 0 0 1 19 5.5v13a1.5 1.5 0 0 1-1.5 1.5H15" {...p} /><path d="m10 16-4-4 4-4M6 12h10" {...p} /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>{paths[name]}</svg>;
}

/* Parent + child logo mark (teal, on soft-teal tile) — swap for real asset */
function LogoMark({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <rect x="0" y="0" width="44" height="44" rx="12" fill={C.tealBg} />
      <circle cx="17" cy="15" r="5" fill={C.accent} />
      <path d="M8 33c0-6 4-9 9-9s9 3 9 9Z" fill={C.accent} />
      <circle cx="30" cy="20.5" r="4" fill={C.blueTx} />
      <path d="M23.5 33c0-4.4 2.9-6.6 6.5-6.6S36.5 28.6 36.5 33Z" fill={C.blueTx} />
    </svg>
  );
}

/* Hero illustration — based on the official Bonda welcome card (profile/ID card
   + avatar + soft circles + one warm accent dot), restyled to the ivory + teal
   design system (the official amber is softened to a muted clay — no yellow). */
function HeroArt() {
  const deep = "#2E5A56";   // darker teal
  const light = "#8FB3AE";  // soft teal for field lines
  const face = "#EFF6F4";   // near-ivory avatar
  const clay = "#C98B76";   // muted warm accent (the official amber, softened)
  return (
    <svg viewBox="0 0 200 150" width="100%" height="100%" role="img" aria-label="Add your child's profile">
      <rect x="4" y="8" width="192" height="134" rx="22" fill={C.tealBg} />
      <circle cx="46" cy="52" r="30" fill="#DCE7E5" />
      <circle cx="162" cy="40" r="8" fill="#CFE0DD" />
      <circle cx="150" cy="118" r="5" fill="#CFE0DD" />
      <circle cx="44" cy="40" r="6" fill={clay} />
      <g className="bonda-float">
        <rect x="50" y="42" width="100" height="70" rx="15" fill={C.accent} />
        <rect x="50" y="42" width="100" height="70" rx="15" fill="none" stroke={deep} strokeWidth="3.5" />
        <circle cx="80" cy="72" r="15" fill={deep} />
        <circle cx="80" cy="68" r="6" fill={face} />
        <path d="M70 86c0-6 4.5-9.5 10-9.5s10 3.5 10 9.5Z" fill={face} />
        <rect x="104" y="64" width="32" height="6" rx="3" fill={light} />
        <rect x="104" y="76" width="24" height="6" rx="3" fill={deep} />
        <rect x="64" y="98" width="72" height="6" rx="3" fill={deep} />
      </g>
    </svg>
  );
}

/* ---------- content ---------- */

const TOOLS = [
  { icon: "mail", label: "Carer letter", bg: C.indigoBg, fg: C.indigoTx },
  { icon: "dollar", label: "Subsidies", bg: C.tealBg, fg: C.tealTx },
  { icon: "phone", label: "Emergency", bg: C.roseBg, fg: C.roseTx },
  { icon: "growth", label: "Development", bg: C.violetBg, fg: C.violetTx },
  { icon: "smile", label: "Emotions", bg: C.blueBg, fg: C.blueTx },
  { icon: "grid", label: "All tools", bg: C.slateBg, fg: C.slateTx },
];

const QUOTES = [
  { t: "Burnout is not weakness. It is what happens when someone cares deeply for a very long time.", s: "Caregiver mental-health research" },
  { t: "Your child does not need you to have all the answers. They need you to keep showing up.", s: "For parents who feel lost" },
  { t: "Small, steady steps still move you and your child forward.", s: "A gentle reminder" },
];

/*
  Real, recent items (paraphrased). In production, replace this array with a
  live feed — fetch a vetted autism news source, filter for relevance, and map
  each result into { tag, tone, source, date, title, blurb, url }.
*/
const NEWS = [
  {
    tag: "Singapore", tone: "teal", source: "The Straits Times", date: "20 Jul 2026",
    title: "Shorter waits for early-intervention places",
    blurb: "Families now wait about 5.5 months on average for a subsidised EIPIC spot — noticeably down from earlier years.",
    url: "https://www.straitstimes.com",
  },
  {
    tag: "Policy", tone: "blue", source: "MSF Singapore", date: "2026",
    title: "More affordable, tailored early intervention",
    blurb: "Subsidised support now spans 21 EIPIC centres, plus learning support offered in about 550 preschools island-wide.",
    url: "https://www.msf.gov.sg",
  },
  {
    tag: "Research", tone: "violet", source: "ScienceDaily", date: "Jun 2026",
    title: "Autism may have distinct biological subtypes",
    blurb: "A large brain-imaging study points to several subtypes, each with its own pattern — a step toward more personalised support.",
    url: "https://www.sciencedaily.com/news/mind_brain/autism/",
  },
  {
    tag: "Research", tone: "indigo", source: "ScienceDaily", date: "Mar 2026",
    title: "New clue to how some forms of autism arise",
    blurb: "Scientists traced a molecular signalling pathway in the brain that may shape certain forms of autism.",
    url: "https://www.sciencedaily.com/news/mind_brain/autism/",
  },
];

const MENU = [
  { icon: "user", label: "Profile" },
  { icon: "bell", label: "Notifications", dot: true },
  { icon: "shield", label: "Security" },
  { icon: "card", label: "Payment & plans" },
  { icon: "help", label: "Help" },
];

const SCOPES = ["All", "Tools", "Guides", "Services", "News"];
const TOPICS = ["Diagnosis", "Early intervention", "School", "Subsidies & finance", "Behaviour & emotions", "Communication (AAC)", "Caregiver wellbeing"];
const LOCS = ["Singapore", "Malaysia", "Indonesia"];

export default function BondaHome() {
  const [tab, setTab] = useState("home");
  const [qi, setQi] = useState(0);
  const [paused, setPaused] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scope, setScope] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [topics, setTopics] = useState([]);
  const [loc, setLoc] = useState([]);
  const timer = useRef(null);
  const track = useRef(null);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => setQi((i) => (i + 1) % QUOTES.length), 6500);
    return () => clearInterval(timer.current);
  }, [paused]);

  useEffect(() => {
    if (!menuOpen && !filterOpen) return;
    const onKey = (e) => { if (e.key === "Escape") { setMenuOpen(false); setFilterOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, filterOpen]);

  const open = (url) => window.open(url, "_blank", "noopener");
  const tone = (t) => ({ bg: C[t + "Bg"], tx: C[t + "Tx"] });
  const step = () => {
    const el = track.current;
    const card = el && el.querySelector(".b-card");
    return card ? card.offsetWidth + 12 : 1;
  };
  const onTrackScroll = () => {
    const el = track.current;
    if (!el) return;
    setActive(Math.max(0, Math.min(NEWS.length - 1, Math.round(el.scrollLeft / step()))));
  };
  const goTo = (i) => track.current && track.current.scrollTo({ left: i * step(), behavior: "smooth" });
  const toggle = (setter, arr, v) => setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="bonda-stage">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .bonda-stage{--title:'Fraunces',Georgia,serif;--body:'Plus Jakarta Sans',system-ui,sans-serif;
          background:${C.canvas};display:flex;justify-content:center;min-height:100vh;min-height:100dvh;}
        .bonda-root{width:100%;max-width:480px;background:${C.canvas};overflow:hidden;
          font-family:var(--body);color:${C.ink};position:relative;
          height:100vh;height:100dvh;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;
          box-shadow:0 0 60px rgba(35,32,28,.06);}
        .bonda-root *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        .bonda-scroll{height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;
          padding:calc(env(safe-area-inset-top) + 12px) 18px calc(env(safe-area-inset-bottom) + 104px);scrollbar-width:none;}
        .bonda-scroll::-webkit-scrollbar{display:none;}

        /* header */
        .b-top{display:flex;align-items:center;justify-content:flex-end;min-height:22px;}
        .b-menu{background:none;border:0;padding:8px 6px;margin:-4px -6px -4px 0;cursor:pointer;color:${C.ink};
          display:grid;place-items:center;border-radius:10px;transition:color .2s,transform .14s;}
        .b-menu:hover{color:${C.accent};}
        .b-menu:active{transform:scale(.92);}
        .b-greet{font-family:var(--title);font-weight:600;font-size:33px;line-height:1.04;letter-spacing:-.015em;margin:10px 0 6px;}
        .b-sub{margin:0;color:${C.ink55};font-size:14px;line-height:1.5;max-width:30rem;}

        .b-searchrow{display:flex;gap:10px;margin-top:16px;}
        .b-search{flex:1;display:flex;align-items:center;gap:10px;height:52px;padding:0 15px;background:${C.card};
          border:1px solid ${C.line};border-radius:14px;transition:border-color .18s,box-shadow .18s;}
        .b-search.on{border-color:${C.accent};box-shadow:0 0 0 3px ${C.focus};}
        .b-search input{flex:1;border:0;outline:none;background:transparent;font-family:inherit;font-size:15px;color:${C.ink};}
        .b-search input::placeholder{color:${C.ink40};}
        .b-filter{position:relative;width:52px;height:52px;border-radius:14px;background:${C.card};border:1px solid ${C.line};
          display:grid;place-items:center;cursor:pointer;color:${C.ink};transition:border-color .2s,color .2s;}
        .b-filter:hover{border-color:${C.accent};color:${C.accent};}
        .b-filter:active{transform:scale(.96);}
        .b-fdot{position:absolute;top:8px;right:9px;width:8px;height:8px;border-radius:50%;background:${C.accent};box-shadow:0 0 0 2px ${C.card};}

        /* hero */
        .b-hero{margin-top:24px;display:flex;gap:12px;align-items:center;background:${C.card};
          border:1px solid ${C.line};border-radius:18px;padding:18px;overflow:hidden;}
        .b-hero-txt{flex:1;min-width:0;}
        .b-hero-art{width:120px;flex:none;height:100px;}
        .b-eyebrow{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${C.accent};margin:0 0 7px;}
        .b-hero-h{font-family:var(--title);font-weight:600;font-size:19px;line-height:1.15;letter-spacing:-.01em;margin:0;color:${C.ink};}
        .b-hero-p{font-size:12.5px;color:${C.ink55};line-height:1.45;margin:6px 0 13px;}
        .b-cta{display:inline-flex;align-items:center;gap:7px;height:44px;padding:0 18px;border:0;border-radius:999px;
          background:${C.accent};color:#fff;font-family:inherit;font-weight:600;font-size:13.5px;cursor:pointer;
          transition:background .2s,transform .14s;}
        .b-cta:hover{background:${C.accentPress};}
        .b-cta:active{transform:scale(.98);}
        .b-cta:focus-visible{outline:none;box-shadow:0 0 0 3px ${C.focus};}

        /* section head */
        .b-sec{display:flex;align-items:center;justify-content:space-between;margin:28px 2px 13px;}
        .b-h2{font-family:var(--title);font-weight:600;font-size:19px;letter-spacing:-.01em;margin:0;color:${C.ink};}
        .b-link{background:none;border:0;padding:0;cursor:pointer;font-family:var(--body);color:${C.accent};
          font-weight:600;font-size:13px;display:flex;align-items:center;gap:2px;}
        .b-link:hover{text-decoration:underline;}

        /* quick access grid */
        .b-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
        .b-tile{background:${C.card};border:1px solid ${C.line};border-radius:16px;padding:14px 8px 12px;
          display:flex;flex-direction:column;align-items:center;gap:9px;cursor:pointer;transition:border-color .16s;}
        .b-tile:hover{border-color:${C.lineStrong};}
        .b-tile:active{transform:scale(.97);}
        .b-chip{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;}
        .b-tlabel{font-size:11.5px;font-weight:600;color:${C.ink};text-align:center;line-height:1.15;}

        /* small quote strip */
        .b-quote{margin-top:24px;display:flex;align-items:center;gap:12px;background:${C.card};
          border:1px solid ${C.line};border-radius:16px;padding:13px 16px;cursor:pointer;}
        .b-qmark{font-family:var(--title);font-style:italic;font-size:34px;line-height:.6;color:${C.accent};flex:none;}
        .b-qbody{flex:1;min-width:0;}
        .b-qt{font-family:var(--title);font-style:italic;font-weight:500;font-size:13.5px;line-height:1.4;color:${C.ink70};
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;animation:bfade .5s ease;}
        .b-qs{font-size:10.5px;color:${C.ink40};margin-top:4px;}
        .b-qlive{width:7px;height:7px;border-radius:50%;flex:none;animation:bpulse 1.9s ease-in-out infinite;}

        /* news carousel */
        .b-news{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-left:18px;
          margin:0 -18px;padding:3px 18px 5px;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
        .b-news::-webkit-scrollbar{display:none;}
        .b-card{flex:0 0 82%;scroll-snap-align:start;display:flex;flex-direction:column;
          background:${C.card};border:1px solid ${C.line};border-radius:16px;padding:15px;cursor:pointer;transition:border-color .16s;}
        .b-card:hover{border-color:${C.lineStrong};}
        .b-card:active{transform:scale(.995);}
        .b-ctop{display:flex;align-items:center;gap:9px;margin-bottom:8px;}
        .b-tag{font-size:10px;font-weight:700;letter-spacing:.03em;padding:4px 9px;border-radius:999px;}
        .b-meta{font-size:10.5px;color:${C.ink40};font-weight:600;}
        .b-ch{font-weight:600;font-size:14.5px;line-height:1.3;letter-spacing:-.01em;color:${C.ink};}
        .b-cp{font-size:12px;color:${C.ink70};line-height:1.5;margin-top:5px;}
        .b-cread{display:inline-flex;align-items:center;gap:5px;color:${C.accent};font-size:11.5px;font-weight:600;margin-top:auto;padding-top:12px;}
        .b-dots{display:flex;justify-content:center;gap:6px;margin-top:14px;}
        .b-dot{width:7px;height:7px;border-radius:999px;background:rgba(35,32,28,.18);border:0;padding:0;cursor:pointer;transition:width .25s,background .25s;}
        .b-dot.on{width:20px;background:${C.accent};}

        /* bottom nav */
        .b-nav{position:absolute;left:0;right:0;bottom:0;background:rgba(247,244,235,.94);
          backdrop-filter:blur(10px);border-top:1px solid ${C.line};display:flex;justify-content:space-around;
          align-items:flex-start;padding-top:13px;padding-bottom:calc(env(safe-area-inset-bottom) + 14px);}
        .b-navbtn{flex:1;background:none;border:0;font-family:var(--body);display:flex;flex-direction:column;
          align-items:center;gap:4px;cursor:pointer;color:${C.ink40};font-size:10.5px;font-weight:600;position:relative;}
        .b-navbtn.on{color:${C.accent};}
        .b-navbtn.on::before{content:"";position:absolute;top:-13px;width:22px;height:3px;border-radius:3px;background:${C.accent};}

        /* account menu */
        .b-scrim{position:absolute;inset:0;background:rgba(35,32,28,.30);z-index:40;animation:bfadein .18s ease;}
        .b-mpanel{position:absolute;z-index:41;top:calc(env(safe-area-inset-top) + 46px);right:14px;width:238px;
          background:${C.card};border:1px solid ${C.line};border-radius:16px;padding:8px;
          box-shadow:0 18px 44px rgba(35,32,28,.18);transform-origin:top right;animation:bpop .18s ease;}
        .b-acct{display:flex;align-items:center;gap:11px;padding:8px 8px 10px;}
        .b-acct-av{width:38px;height:38px;flex:none;line-height:0;}
        .b-acct-name{font-weight:700;font-size:14px;color:${C.ink};}
        .b-acct-sub{font-size:11.5px;color:${C.ink40};margin-top:2px;}
        .b-mdiv{height:1px;background:${C.line};margin:4px 4px;}
        .b-mitem{display:flex;align-items:center;gap:12px;width:100%;background:none;border:0;padding:10px;
          border-radius:10px;cursor:pointer;font-family:var(--body);font-size:14px;font-weight:500;color:${C.ink};
          transition:background .15s,color .15s;text-align:left;}
        .b-mi{color:${C.ink70};display:grid;place-items:center;transition:color .15s;}
        .b-mitem:hover{background:${C.tealBg};color:${C.accent};}
        .b-mitem:hover .b-mi{color:${C.accent};}
        .b-mdot{margin-left:auto;width:7px;height:7px;border-radius:50%;background:${C.accent};}
        .b-mitem.danger{color:${C.roseTx};}
        .b-mitem.danger .b-mi{color:${C.roseTx};}
        .b-mitem.danger:hover{background:${C.roseBg};color:${C.roseTx};}

        /* filter sheet */
        .b-sheet-scrim{position:absolute;inset:0;background:rgba(35,32,28,.32);z-index:45;animation:bfadein .2s ease;}
        .b-sheet{position:absolute;left:0;right:0;bottom:0;z-index:46;background:${C.canvas};
          border-radius:22px 22px 0 0;border-top:1px solid ${C.line};box-shadow:0 -12px 40px rgba(35,32,28,.14);
          padding:10px 20px calc(env(safe-area-inset-bottom) + 18px);max-height:82%;overflow-y:auto;scrollbar-width:none;
          animation:bslideup .26s cubic-bezier(.2,.8,.2,1);}
        .b-sheet::-webkit-scrollbar{display:none;}
        .b-handle{width:38px;height:4px;border-radius:999px;background:${C.lineStrong};margin:2px auto 14px;}
        .b-sheet-head{display:flex;align-items:center;justify-content:space-between;}
        .b-sheet-title{font-family:var(--title);font-weight:600;font-size:20px;color:${C.ink};margin:0;}
        .b-reset{background:none;border:0;font-family:var(--body);color:${C.accent};font-weight:600;font-size:13px;cursor:pointer;}
        .b-reset:hover{text-decoration:underline;}
        .b-flabel{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${C.ink55};margin:18px 0 10px;}
        .b-fchips{display:flex;flex-wrap:wrap;gap:8px;}
        .b-fchip{background:${C.card};border:1px solid ${C.line};border-radius:999px;padding:9px 14px;
          font-family:var(--body);font-size:13px;font-weight:500;color:${C.ink};cursor:pointer;transition:all .15s;}
        .b-fchip:hover{border-color:${C.lineStrong};}
        .b-fchip.on{background:${C.accent};border-color:${C.accent};color:#fff;}
        .b-apply{width:100%;height:52px;margin-top:22px;border:0;border-radius:999px;background:${C.accent};color:#fff;
          font-family:var(--body);font-weight:600;font-size:15px;cursor:pointer;transition:background .2s,transform .14s;}
        .b-apply:hover{background:${C.accentPress};}
        .b-apply:active{transform:scale(.99);}

        @keyframes bpulse{0%,100%{opacity:.5;}50%{opacity:1;}}
        @keyframes bfade{from{opacity:0;transform:translateY(3px);}to{opacity:1;transform:none;}}
        .bonda-float{animation:bfloat 5.5s ease-in-out infinite;transform-origin:center;}
        @keyframes bfloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}
        @keyframes bfadein{from{opacity:0;}to{opacity:1;}}
        @keyframes bpop{from{opacity:0;transform:scale(.96) translateY(-6px);}to{opacity:1;transform:none;}}
        @keyframes bslideup{from{transform:translateY(100%);}to{transform:translateY(0);}}
        @media (prefers-reduced-motion:reduce){.bonda-float,.b-qlive,.b-scrim,.b-mpanel,.b-sheet,.b-sheet-scrim{animation:none;}}
      `}</style>

      <div className="bonda-root">
        <div className="bonda-scroll">
          {/* HEADER */}
          <div className="b-top">
            <button className="b-menu" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
              <Icon name="more" size={22} color="currentColor" />
            </button>
          </div>

          <h1 className="b-greet">Welcome to Bonda</h1>
          <p className="b-sub">Set up your child’s profile to unlock schedules, check-ins and emotion tracking.</p>

          <div className="b-searchrow">
            <label className={"b-search" + (query ? " on" : "")}>
              <Icon name="search" size={18} color={C.ink40} w={2} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tools, guides and support" />
            </label>
            <button className="b-filter" aria-label="Filters" onClick={() => setFilterOpen(true)}>
              <Icon name="sliders" size={19} color="currentColor" w={2} />
              {(scope !== "All" || topics.length + loc.length > 0) && <span className="b-fdot" />}
            </button>
          </div>

          {/* HERO ONBOARDING */}
          <div className="b-hero">
            <div className="b-hero-txt">
              <p className="b-eyebrow">Get started</p>
              <h2 className="b-hero-h">Add your child’s profile</h2>
              <p className="b-hero-p">Personalised schedules, check-ins and emotion tracking begin here.</p>
              <button className="b-cta">＋ Add a child profile</button>
            </div>
            <div className="b-hero-art"><HeroArt /></div>
          </div>

          {/* QUICK ACCESS */}
          <div className="b-sec">
            <h2 className="b-h2">Quick access</h2>
            <button className="b-link">See all <Icon name="chevron" size={14} color={C.accent} w={2.2} /></button>
          </div>
          <div className="b-grid">
            {TOOLS.map((t) => (
              <button key={t.label} className="b-tile">
                <span className="b-chip" style={{ background: t.bg }}><Icon name={t.icon} size={22} color={t.fg} w={2} /></span>
                <span className="b-tlabel">{t.label}</span>
              </button>
            ))}
          </div>

          {/* QUOTE STRIP */}
          <div className="b-quote" onClick={() => setPaused((p) => !p)}>
            <span className="b-qmark">“</span>
            <div className="b-qbody">
              <div className="b-qt" key={qi}>{QUOTES[qi].t}</div>
              <div className="b-qs">— {QUOTES[qi].s} · {paused ? "Paused" : "Tap to pause"}</div>
            </div>
            <span className="b-qlive" style={{ background: paused ? C.ink40 : C.accent }} />
          </div>

          {/* LATEST NEWS */}
          <div className="b-sec">
            <h2 className="b-h2">Latest for families</h2>
            <button className="b-link">See all <Icon name="chevron" size={14} color={C.accent} w={2.2} /></button>
          </div>
          <div className="b-news" ref={track} onScroll={onTrackScroll}>
            {NEWS.map((n) => {
              const c = tone(n.tone);
              return (
                <div key={n.title} className="b-card" onClick={() => open(n.url)}>
                  <div className="b-ctop">
                    <span className="b-tag" style={{ background: c.bg, color: c.tx }}>{n.tag}</span>
                    <span className="b-meta">{n.source} · {n.date}</span>
                  </div>
                  <div className="b-ch">{n.title}</div>
                  <div className="b-cp">{n.blurb}</div>
                  <span className="b-cread">Read more <Icon name="arrow" size={14} color={C.accent} w={2.2} /></span>
                </div>
              );
            })}
          </div>
          <div className="b-dots">
            {NEWS.map((_, i) => (
              <button key={i} className={"b-dot" + (active === i ? " on" : "")} aria-label={"Go to item " + (i + 1)} onClick={() => goTo(i)} />
            ))}
          </div>
        </div>

        {/* BOTTOM NAV */}
        <div className="b-nav">
          {[
            { id: "home", label: "Home", icon: "home" },
            { id: "child", label: "My child", icon: "child" },
            { id: "schedule", label: "Schedule", icon: "calendar" },
            { id: "community", label: "Community", icon: "users" },
          ].map((n) => (
            <button key={n.id} className={"b-navbtn" + (tab === n.id ? " on" : "")} onClick={() => setTab(n.id)}>
              <Icon name={n.icon} size={22} color={tab === n.id ? C.accent : C.ink40} w={1.9} />
              {n.label}
            </button>
          ))}
        </div>

        {menuOpen && (
          <>
            <div className="b-scrim" onClick={() => setMenuOpen(false)} />
            <div className="b-mpanel" role="menu">
              <div className="b-acct">
                <span className="b-acct-av"><LogoMark size={38} /></span>
                <div>
                  <div className="b-acct-name">Your account</div>
                  <div className="b-acct-sub">Free plan</div>
                </div>
              </div>
              <div className="b-mdiv" />
              {MENU.map((m) => (
                <button key={m.label} className="b-mitem" role="menuitem" onClick={() => setMenuOpen(false)}>
                  <span className="b-mi"><Icon name={m.icon} size={19} color="currentColor" /></span>
                  {m.label}
                  {m.dot && <span className="b-mdot" />}
                </button>
              ))}
              <div className="b-mdiv" />
              <button className="b-mitem danger" role="menuitem" onClick={() => setMenuOpen(false)}>
                <span className="b-mi"><Icon name="logout" size={19} color="currentColor" /></span>
                Log out
              </button>
            </div>
          </>
        )}

        {filterOpen && (
          <>
            <div className="b-sheet-scrim" onClick={() => setFilterOpen(false)} />
            <div className="b-sheet" role="dialog" aria-label="Filters">
              <div className="b-handle" />
              <div className="b-sheet-head">
                <h2 className="b-sheet-title">Filters</h2>
                <button className="b-reset" onClick={() => { setScope("All"); setTopics([]); setLoc([]); }}>Reset</button>
              </div>
              <div className="b-flabel">Type</div>
              <div className="b-fchips">
                {SCOPES.map((s) => (
                  <button key={s} className={"b-fchip" + (scope === s ? " on" : "")} onClick={() => setScope(s)}>{s}</button>
                ))}
              </div>
              <div className="b-flabel">Topic</div>
              <div className="b-fchips">
                {TOPICS.map((t) => (
                  <button key={t} className={"b-fchip" + (topics.includes(t) ? " on" : "")} onClick={() => toggle(setTopics, topics, t)}>{t}</button>
                ))}
              </div>
              <div className="b-flabel">Location</div>
              <div className="b-fchips">
                {LOCS.map((l) => (
                  <button key={l} className={"b-fchip" + (loc.includes(l) ? " on" : "")} onClick={() => toggle(setLoc, loc, l)}>{l}</button>
                ))}
              </div>
              <button className="b-apply" onClick={() => setFilterOpen(false)}>Apply filters</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
