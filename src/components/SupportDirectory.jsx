import React, { useState, useMemo, useRef } from "react";

/**
 * Bonda — Support Directory
 * Singapore government & specialist contacts for autism and caregiver support.
 *
 * Layout mirrors the Bonda "Subsidies & grants" screen:
 *   • white header zone over a soft grey body
 *   • search field + a separate Filters button (filters stay hidden until tapped)
 *   • a "Start here" quick-access carousel with dots
 *   • a results count
 *   • rich cards: category pill (coloured dot) + context label, title,
 *     description, a tinted "Good to know" inset, attribute chips, then
 *     tap-to-contact actions.
 *
 * Palette: calm editorial. Soft grey canvas, white cards, dark ink text, one
 * muted teal accent (links, active filters, dots). Category tags in muted
 * tones only — teal, blue, rose, violet, indigo, slate. No yellow.
 *
 * Mobile & app first: single column, ≥44px targets, native tel/mailto/wa.me
 * links, momentum scrolling, iOS safe-area padding, reduced-motion respected.
 *
 * Logos: real org logos are trademarked and can't be reproduced faithfully in
 * code, so each card uses a monogram tinted with its category tone.
 *
 * Contacts checked July 2026 — details can change; confirm before relying on them.
 */

/* ---------- muted category tones (no yellow) ---------- */
const TONES = {
  teal:   { bg: "#E4F0EC", fg: "#2E7B6A", dot: "#2E7B6A" },
  blue:   { bg: "#E6ECF3", fg: "#3C6088", dot: "#4A79A6" },
  rose:   { bg: "#F4E8EA", fg: "#9A5A66", dot: "#B06E7A" },
  violet: { bg: "#ECE8F3", fg: "#63578A", dot: "#7E6FAC" },
  indigo: { bg: "#E7E9F4", fg: "#464D84", dot: "#5D66A6" },
  slate:  { bg: "#EAECEE", fg: "#4E5964", dot: "#67737C" },
};

const CATEGORIES = [
  { id: "gov",       label: "Government & first stop", short: "Government",  tone: "teal" },
  { id: "diagnosis", label: "Diagnosis & assessment",  short: "Diagnosis",   tone: "blue" },
  { id: "autism",    label: "Autism organisations",    short: "Autism orgs", tone: "indigo" },
  { id: "therapy",   label: "Therapy & early years",   short: "Therapy",     tone: "violet" },
  { id: "caregiver", label: "Caregiver support",       short: "Caregiver",   tone: "rose" },
  { id: "crisis",    label: "Crisis & helplines",      short: "Crisis",      tone: "slate" },
];
const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

/* ---------- 14 contacts, one entry each, grouped by category ---------- */
const ORGS = [
  // Government & first stop
  {
    id: "sgenable", name: "SG Enable", initials: "SE", category: "gov",
    context: "First stop",
    desc: "The focal agency for disability in Singapore. Your starting point for schemes, referrals and the Enabling Guide directory of services.",
    note: "Begin here if you're unsure where to go — they'll point you to the right service.",
    tags: ["Islandwide", "Free", "All ages"],
    phone: "1800 8585 885", tel: "18008585885",
    email: "contactus@sgenable.sg",
    web: "https://www.enablingguide.sg", webLabel: "enablingguide.sg",
  },
  // Diagnosis & assessment
  {
    id: "kkh", name: "KKH — Dept of Child Development", initials: "KK", category: "diagnosis",
    context: "Under 7",
    desc: "Public developmental and autism assessment for young children, led by developmental paediatricians.",
    note: "Referral is usually through a polyclinic, GP or paediatrician.",
    tags: ["Public", "Referral needed", "Subsidised"],
    phone: "6394 3062", tel: "+6563943062",
    web: "https://www.kkh.com.sg/our-specialties/child-development", webLabel: "kkh.com.sg",
  },
  {
    id: "nuh", name: "NUH — Child Development Unit", initials: "NU", category: "diagnosis",
    context: "Birth to 7",
    desc: "Public assessment and support for autism, developmental delay and behavioural needs in early childhood.",
    note: "Clinics at Jurong Medical Centre and Keat Hong.",
    tags: ["Public", "Referral needed", "Subsidised"],
    phone: "6665 0158", tel: "+6566650158",
    web: "https://www.nuh.com.sg/care-at-nuh/services/paediatrics/developmental-and-behavioural-paediatrics", webLabel: "nuh.com.sg",
  },
  {
    id: "imh-cgc", name: "IMH — Child Guidance Clinic", initials: "CGC", category: "diagnosis",
    context: "School age",
    desc: "Assessment and mental-health support for school-age children, including autism and ADHD.",
    note: "For children in Primary 1 and above.",
    tags: ["Public", "Ages 7+"],
    phone: "6389 2200", tel: "+6563892200",
    web: "https://www.imh.com.sg", webLabel: "imh.com.sg",
  },
  // Autism organisations
  {
    id: "arc", name: "Autism Resource Centre (Singapore)", initials: "ARC", category: "autism",
    context: "All ages",
    desc: "Charity dedicated to autism across the lifespan, with resources for families and professionals.",
    note: "Runs Pathlight School and the E2C employment centre.",
    tags: ["Charity", "School", "Employment"],
    phone: "6323 3258", tel: "+6563233258",
    email: "arc@autism.org.sg",
    web: "https://www.autism.org.sg", webLabel: "autism.org.sg",
  },
  {
    id: "aas", name: "Autism Association (Singapore)", initials: "AA", category: "autism",
    context: "All ages",
    desc: "Early intervention, a special-education school and adult day activities for people on the spectrum.",
    note: "Also has a caregiver-support section and helpline links.",
    tags: ["Charity", "School", "Adult day"],
    phone: "6774 6649", tel: "+6567746649",
    web: "https://www.autismlinks.org.sg", webLabel: "autismlinks.org.sg",
  },
  {
    id: "saac", name: "St. Andrew's Autism Centre", initials: "SA", category: "autism",
    context: "All ages",
    desc: "School, adult day-activity and residential programmes, plus caregiver training.",
    note: "Supports moderate to severe autism, including residential care.",
    tags: ["Charity", "Residential", "Adult day"],
    phone: "6517 3800", tel: "+6565173800",
    web: "https://www.saac.org.sg", webLabel: "saac.org.sg",
  },
  // Therapy & early years
  {
    id: "rainbow", name: "Rainbow Centre", initials: "RC", category: "therapy",
    context: "Early years",
    desc: "Early Intervention (EIPIC) and special education for young children with developmental needs, including autism.",
    note: "One of the largest EIPIC providers, with therapy and family services.",
    tags: ["EIPIC", "Special ed", "Therapy"],
    phone: "6472 7077", tel: "+6564727077",
    web: "https://www.rainbowcentre.org.sg", webLabel: "rainbowcentre.org.sg",
  },
  // Caregiver support
  {
    id: "caringsg", name: "CaringSG", initials: "CG", category: "caregiver",
    context: "For caregivers",
    desc: "By caregivers, for caregivers of children with special needs — peer support and service coordination.",
    note: "CAREbuddy peer support, CAREconnect groups and CAREwell coordination.",
    tags: ["Peer support", "Free", "Caregiver-led"],
    email: "contact@caring.sg",
    web: "https://www.caring.sg", webLabel: "caring.sg",
  },
  {
    id: "cal", name: "Caregivers Alliance (CAL)", initials: "CAL", category: "caregiver",
    context: "For caregivers",
    desc: "Caregiver training, support groups and counselling, with deep experience in mental-health caregiving.",
    note: "Helpline is staffed on weekdays.",
    tags: ["Training", "Counselling", "Support groups"],
    phone: "6388 8631", tel: "+6563888631",
    web: "https://www.cal.org.sg", webLabel: "cal.org.sg",
  },
  {
    id: "awwa-cfc", name: "AWWA Centre for Caregivers", initials: "AW", category: "caregiver",
    context: "For caregivers",
    desc: "Individual and family counselling, caregiver training, and information on respite options.",
    note: "Good place to ask about short-term respite for a break.",
    tags: ["Counselling", "Training", "Respite info"],
    phone: "6511 5280", tel: "+6565115280",
    web: "https://www.awwa.org.sg", webLabel: "awwa.org.sg",
  },
  // Crisis & helplines
  {
    id: "sos", name: "Samaritans of Singapore (SOS)", initials: "SOS", category: "crisis",
    context: "24-hour",
    desc: "Free, confidential emotional support for anyone in distress or crisis, at any hour.",
    note: "Call 1767, or message CareText on WhatsApp at 9151 1767.",
    tags: ["Free", "Confidential", "Crisis"],
    phone: "1767", tel: "1767",
    whatsapp: "9151 1767", wa: "https://wa.me/6591511767",
    web: "https://www.sos.org.sg", webLabel: "sos.org.sg",
  },
  {
    id: "imh-helpline", name: "IMH Mental Health Helpline", initials: "MH", category: "crisis",
    context: "24-hour",
    desc: "Round-the-clock helpline from the Institute of Mental Health for anyone facing a mental-health crisis.",
    note: "For urgent emotional or mental-health support, day or night.",
    tags: ["Free", "Crisis", "Mental health"],
    phone: "6389 2000", tel: "+6563892000",
    web: "https://www.imh.com.sg", webLabel: "imh.com.sg",
  },
  {
    id: "samh", name: "Singapore Association for Mental Health", initials: "SM", category: "crisis",
    context: "Weekdays",
    desc: "Counselling, rehabilitation and community mental-health support, with a toll-free general line.",
    note: "A gentler, non-crisis option for ongoing mental-health support.",
    tags: ["Counselling", "Community", "Toll-free"],
    phone: "1800 283 7019", tel: "18002837019",
    web: "https://www.samhealth.org.sg", webLabel: "samhealth.org.sg",
  },
];

/* ---------- quick-access carousel content ---------- */
const FEATURED = [
  { id: "f-start", eyebrow: "New here?", title: "Not sure where to begin", sub: "Start with SG Enable's Enabling Guide",
    icon: "compass", cta: "See SG Enable", action: { type: "filter", value: "gov" } },
  { id: "f-crisis", eyebrow: "Right now", title: "Need to talk to someone", sub: "SOS is free and confidential, 24 hours",
    icon: "lifebuoy", cta: "See ways to reach SOS", action: { type: "filter", value: "crisis" } },
  { id: "f-dx", eyebrow: "First steps", title: "Getting an assessment", sub: "See the public diagnosis pathways",
    icon: "clipboard", cta: "See diagnosis contacts", action: { type: "filter", value: "diagnosis" } },
];

/* ---------- icons ---------- */
const I = {
  search: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  filter: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h11M19 7h1M4 12h5M13 12h7M4 17h9M17 17h3"/><circle cx="17" cy="7" r="2"/><circle cx="11" cy="12" r="2"/><circle cx="15" cy="17" r="2"/></svg>,
  phone: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>,
  chat: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20l1.1-4.1A8.4 8.4 0 0 1 3 11.5a8.4 8.4 0 0 1 9-8.4 8.4 8.4 0 0 1 9 8.4Z"/></svg>,
  mail: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>,
  globe: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/></svg>,
  arrow: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>,
  right: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h13M12 6l6 6-6 6"/></svg>,
  check: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  compass: <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/></svg>,
  lifebuoy: <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.6"/><path d="m5.6 5.6 3.2 3.2M15.2 15.2l3.2 3.2M18.4 5.6l-3.2 3.2M8.8 15.2l-3.2 3.2"/></svg>,
  clipboard: <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM8.5 11h7M8.5 15h5"/></svg>,
};

/* ---------- action link ---------- */
function Action({ href, icon, label, primary, external }) {
  return (
    <a className={"bd-act" + (primary ? " is-primary" : "")} href={href}
       target={external ? "_blank" : undefined}
       rel={external ? "noopener noreferrer" : undefined}>
      <span className="bd-act__i">{icon}</span><span>{label}</span>
    </a>
  );
}

/* ---------- contact card ---------- */
function Card({ org, flash }) {
  const cat = CAT[org.category];
  const t = TONES[cat.tone];
  return (
    <article id={"bd-card-" + org.id} data-cat={org.category} className={"bd-card" + (flash ? " is-flash" : "")}>
      <div className="bd-card__row">
        <span className="bd-pill" style={{ background: t.bg, color: t.fg }}>
          <span className="bd-pill__dot" style={{ background: t.dot }} />
          {cat.label}
        </span>
        {org.context && <span className="bd-context">{org.context}</span>}
      </div>

      <h3 className="bd-card__name">{org.name}</h3>

      <p className="bd-card__desc">{org.desc}</p>

      {org.note && (
        <div className="bd-inset">
          <span className="bd-inset__label">Good to know</span>
          <p className="bd-inset__val">{org.note}</p>
        </div>
      )}

      {org.tags && (
        <div className="bd-tags">
          {org.tags.map((tag) => <span key={tag} className="bd-tag">{tag}</span>)}
        </div>
      )}

      <div className="bd-actions">
        {org.tel && <Action href={`tel:${org.tel}`} icon={I.phone} label={org.phone} primary />}
        {org.wa && <Action href={org.wa} icon={I.chat} label="WhatsApp" external />}
        {org.email && <Action href={`mailto:${org.email}`} icon={I.mail} label="Email" />}
        {org.web && <Action href={org.web} icon={I.globe} label={org.webLabel || "Website"} external />}
      </div>
    </article>
  );
}

/* ---------- quick-access card ---------- */
function Featured({ item, onGo }) {
  return (
    <button className="bd-feat" onClick={() => onGo(item.action)}>
      <div className="bd-feat__body">
        <span className="bd-feat__eyebrow">{item.eyebrow}</span>
        <h3 className="bd-feat__title">{item.title}</h3>
        <p className="bd-feat__sub">{item.sub}</p>
        <span className="bd-feat__cta">{item.cta} {I.right}</span>
      </div>
      <span className="bd-feat__icon">{I[item.icon]}</span>
    </button>
  );
}

/* ---------- main ---------- */
export default function SupportDirectory() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("all");
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [flashCat, setFlashCat] = useState(null);
  const railRef = useRef(null);
  const flashTimer = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ORGS.filter((o) => {
      if (active !== "all" && o.category !== active) return false;
      if (!q) return true;
      return (
        o.name.toLowerCase().includes(q) ||
        o.desc.toLowerCase().includes(q) ||
        (o.note || "").toLowerCase().includes(q) ||
        (o.tags || []).join(" ").toLowerCase().includes(q) ||
        CAT[o.category].label.toLowerCase().includes(q)
      );
    });
  }, [query, active]);

  const onRail = () => {
    const el = railRef.current;
    if (!el || !el.children.length) return;
    const step = el.children[0].offsetWidth + 12;
    setSlide(Math.round(el.scrollLeft / step));
  };

  const pick = (id) => { setActive(id); setOpen(false); };

  // One behaviour for every quick-access card: filter to the category,
  // scroll the results into view, and flash their borders briefly.
  const onGo = (action) => {
    setActive(action.value);
    setQuery("");
    setOpen(false);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const first = document.querySelector('[data-cat="' + action.value + '"]');
      if (first) first.scrollIntoView({ behavior: "smooth", block: "start" });
      setFlashCat(action.value);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlashCat(null), 1800);
    }));
  };

  return (
    <div className="bd-root">
      <style>{CSS}</style>

      {/* header (white zone) */}
      <header className="bd-head">
        <div className="bd-wrap">
          <h1 className="bd-title">Support directory</h1>
          <p className="bd-sub">Singapore contacts for autism and caregiver support.</p>
        </div>
        <div className="bd-head__tools bd-wrap">
          <div className="bd-search">
            <span className="bd-search__i">{I.search}</span>
            <input className="bd-search__in" type="text" inputMode="search"
              placeholder="Search support…" value={query}
              onChange={(e) => setQuery(e.target.value)} aria-label="Search the directory" />
            {query && <button className="bd-search__x" onClick={() => setQuery("")} aria-label="Clear search">×</button>}
          </div>
          <button className={"bd-filterbtn" + (open ? " is-open" : "")}
            onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="bd-filters">
            <span className="bd-filterbtn__i">{I.filter}</span>
            Filters
            {active !== "all" && <span className="bd-filterbtn__badge" aria-hidden="true" />}
          </button>
        </div>

        {open && (
          <div className="bd-filters bd-wrap" id="bd-filters" role="group" aria-label="Filter by category">
            <div className="bd-filters__grid">
              <button className={"bd-opt" + (active === "all" ? " is-on" : "")} onClick={() => pick("all")}>
                {active === "all" && <span className="bd-opt__c">{I.check}</span>}All contacts
              </button>
              {CATEGORIES.map((c) => (
                <button key={c.id} className={"bd-opt" + (active === c.id ? " is-on" : "")} onClick={() => pick(c.id)}>
                  <span className="bd-opt__dot" style={{ background: TONES[c.tone].dot }} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* body (grey zone) */}
      <main className="bd-body">
        <div className="bd-wrap">
          {/* quick access */}
          <section className="bd-feat-wrap" aria-label="Start here">
            <p className="bd-eyebrow">Start here</p>
            <div className="bd-rail" ref={railRef} onScroll={onRail}>
              {FEATURED.map((f) => <Featured key={f.id} item={f} onGo={onGo} />)}
            </div>
            <div className="bd-dots">
              {FEATURED.map((_, i) => (
                <span key={i} className={"bd-dot" + (i === slide ? " is-on" : "")} />
              ))}
            </div>
          </section>

          {/* count + active filter */}
          <div className="bd-countrow">
            <span className="bd-count">
              {results.length} {results.length === 1 ? "contact" : "contacts"}
            </span>
            {active !== "all" && (
              <button className="bd-activechip" onClick={() => setActive("all")}>
                {CAT[active].short}<span className="bd-activechip__x">×</span>
              </button>
            )}
          </div>

          {/* list */}
          {results.length === 0 ? (
            <div className="bd-empty">
              <p className="bd-empty__t">No matches</p>
              <p className="bd-empty__b">Try another word, or clear the filters to see everything.</p>
              <button className="bd-empty__reset" onClick={() => { setQuery(""); setActive("all"); }}>
                Clear filters
              </button>
            </div>
          ) : (
            results.map((o) => <Card key={o.id} org={o} flash={flashCat === o.category} />)
          )}

          {/* footer */}
          <div className="bd-foot">
            <p className="bd-foot__em">
              In an emergency, call <a href="tel:995">995</a> for an ambulance or <a href="tel:999">999</a> for the police.
            </p>
            <p className="bd-foot__note">
              Contacts checked July 2026. Details can change — please confirm directly before you rely on them.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------- styles ---------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

.bd-root{
  --ink:#1E2320; --ink-2:#6B7069; --ink-3:#9A9E99;
  --canvas:#F3F2EF; --surface:#FFFFFF; --line:#EBE9E3; --fill:#F5F4F1;
  --teal:#2E7B6A; --teal-ink:#266657;
  font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  background:var(--canvas); color:var(--ink); min-height:100%;
  -webkit-font-smoothing:antialiased; -webkit-tap-highlight-color:transparent; line-height:1.5;
}
.bd-root *{box-sizing:border-box;}
.bd-wrap{max-width:560px; margin:0 auto; padding-left:18px; padding-right:18px;}

/* header */
.bd-head{
  position:sticky; top:0; z-index:30; background:var(--surface);
  border-bottom:1px solid var(--line); padding-top:env(safe-area-inset-top);
}
.bd-head > .bd-wrap:first-child{padding-top:18px; padding-bottom:2px;}
.bd-title{margin:0; font-size:21px; font-weight:700; letter-spacing:-0.015em;}
.bd-sub{margin:5px 0 0; font-size:13.5px; color:var(--ink-2);}
.bd-head__tools{display:flex; gap:10px; padding-top:14px; padding-bottom:14px;}

.bd-search{
  flex:1; display:flex; align-items:center; gap:9px; height:46px;
  background:var(--fill); border:1px solid var(--line); border-radius:12px; padding:0 12px;
  transition:border-color .15s, box-shadow .15s;
}
.bd-search:focus-within{border-color:var(--teal); box-shadow:0 0 0 3px rgba(46,123,106,.12);}
.bd-search__i{color:var(--ink-3); display:flex; flex:none;}
.bd-search__in{flex:1; min-width:0; border:0; outline:0; background:transparent; font:inherit; font-size:15px; color:var(--ink);}
.bd-search__in::placeholder{color:var(--ink-3);}
.bd-search__x{border:0; background:transparent; color:var(--ink-3); font-size:22px; line-height:1; cursor:pointer; min-width:28px; min-height:28px;}

.bd-filterbtn{
  position:relative; flex:none; display:inline-flex; align-items:center; gap:7px; height:46px; padding:0 15px;
  background:var(--surface); border:1px solid var(--line); border-radius:12px;
  font:inherit; font-size:14px; font-weight:600; color:var(--teal-ink); cursor:pointer;
  transition:background .15s, border-color .15s;
}
.bd-filterbtn.is-open{background:var(--fill); border-color:#DCDAD3;}
.bd-filterbtn__i{display:flex; color:var(--teal);}
.bd-filterbtn__badge{position:absolute; top:9px; right:11px; width:7px; height:7px; border-radius:50%; background:var(--teal); border:1.5px solid var(--surface);}

/* filter panel */
.bd-filters{padding-bottom:14px; animation:bd-drop .18s ease;}
@keyframes bd-drop{from{opacity:0; transform:translateY(-6px);} to{opacity:1; transform:none;}}
.bd-filters__grid{display:grid; grid-template-columns:1fr 1fr; gap:8px;}
.bd-opt{
  display:flex; align-items:center; gap:8px; min-height:44px; padding:0 13px; text-align:left;
  background:var(--surface); border:1px solid var(--line); border-radius:11px;
  font:inherit; font-size:13px; font-weight:500; color:var(--ink-2); cursor:pointer;
  transition:border-color .15s, color .15s, background .15s;
}
.bd-opt.is-on{border-color:var(--teal); color:var(--teal-ink); font-weight:600; background:rgba(46,123,106,.05);}
.bd-opt__dot{width:8px; height:8px; border-radius:50%; flex:none;}
.bd-opt__c{display:flex; color:var(--teal); flex:none;}

/* body */
.bd-body{padding-top:18px; padding-bottom:calc(30px + env(safe-area-inset-bottom));}

/* quick access */
.bd-eyebrow{margin:0 0 10px; font-size:11.5px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:var(--ink-3);}
.bd-feat-wrap{margin-bottom:22px;}
.bd-rail{
  display:flex; gap:12px; overflow-x:auto; scroll-snap-type:x mandatory;
  -webkit-overflow-scrolling:touch; scrollbar-width:none; margin:0 -18px; padding:0 18px 2px;
}
.bd-rail::-webkit-scrollbar{display:none;}
.bd-feat{
  scroll-snap-align:start; flex:0 0 84%; display:flex; align-items:center; gap:12px; text-align:left;
  background:var(--surface); border:1px solid var(--line); border-radius:16px; padding:16px;
  text-decoration:none; color:inherit; font:inherit; cursor:pointer;
}
.bd-feat__body{flex:1; min-width:0;}
.bd-feat__eyebrow{font-size:11px; font-weight:600; letter-spacing:0.05em; text-transform:uppercase; color:var(--teal);}
.bd-feat__title{margin:6px 0 0; font-size:16.5px; font-weight:700; letter-spacing:-0.01em; line-height:1.25;}
.bd-feat__sub{margin:4px 0 0; font-size:12.5px; color:var(--ink-2); line-height:1.4;}
.bd-feat__cta{display:inline-flex; align-items:center; gap:3px; margin-top:11px; font-size:13px; font-weight:600; color:var(--teal-ink);}
.bd-feat__cta svg{margin-bottom:1px;}
.bd-feat__icon{flex:none; color:var(--teal); opacity:.9;}

.bd-dots{display:flex; justify-content:center; gap:6px; margin-top:12px;}
.bd-dot{width:6px; height:6px; border-radius:999px; background:#D4D2CB; transition:width .2s, background .2s;}
.bd-dot.is-on{width:18px; background:var(--teal);}

/* count row */
.bd-countrow{display:flex; align-items:center; justify-content:space-between; gap:10px; margin:2px 0 14px;}
.bd-count{font-size:15px; font-weight:500; color:var(--ink-2);}
.bd-activechip{
  display:inline-flex; align-items:center; gap:5px; height:32px; padding:0 6px 0 12px;
  background:rgba(46,123,106,.08); border:1px solid rgba(46,123,106,.28); border-radius:999px;
  font:inherit; font-size:12.5px; font-weight:600; color:var(--teal-ink); cursor:pointer;
}
.bd-activechip__x{display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; border-radius:50%; background:rgba(46,123,106,.16); font-size:14px; line-height:1;}

/* card */
.bd-card{background:var(--surface); border:1px solid var(--line); border-radius:16px; padding:16px; margin-bottom:12px; scroll-margin-top:150px;}
.bd-card.is-flash{animation:bd-flash 1.8s ease;}
@keyframes bd-flash{
  0%{box-shadow:0 0 0 0 rgba(46,123,106,0); border-color:var(--line);}
  12%{box-shadow:0 0 0 3px rgba(46,123,106,.22); border-color:var(--teal);}
  100%{box-shadow:0 0 0 0 rgba(46,123,106,0); border-color:var(--line);}
}
.bd-card__row{display:flex; align-items:center; justify-content:space-between; gap:10px;}
.bd-pill{display:inline-flex; align-items:center; gap:6px; padding:5px 11px 5px 9px; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:0.045em; text-transform:uppercase;}
.bd-pill__dot{width:7px; height:7px; border-radius:50%; flex:none;}
.bd-context{font-size:12px; font-weight:500; color:var(--ink-3); white-space:nowrap;}

.bd-card__name{margin:13px 0 0; font-size:16px; font-weight:600; letter-spacing:-0.01em; line-height:1.28;}

.bd-card__desc{margin:12px 0 0; font-size:14px; color:var(--ink-2); line-height:1.55;}

.bd-inset{margin-top:13px; background:var(--fill); border-radius:12px; padding:12px 13px;}
.bd-inset__label{font-size:10.5px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:var(--ink-3);}
.bd-inset__val{margin:5px 0 0; font-size:13.5px; font-weight:500; color:var(--ink); line-height:1.45;}

.bd-tags{display:flex; flex-wrap:wrap; gap:7px; margin-top:13px;}
.bd-tag{font-size:12px; font-weight:500; color:var(--ink-2); background:var(--fill); border:1px solid var(--line); border-radius:8px; padding:5px 10px;}

.bd-actions{display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; padding-top:14px; border-top:1px solid var(--line);}
.bd-act{display:inline-flex; align-items:center; gap:7px; min-height:44px; padding:0 14px; border-radius:11px; border:1px solid var(--line); background:var(--surface); color:var(--ink); font-size:13.5px; font-weight:500; text-decoration:none; transition:background .15s, border-color .15s;}
.bd-act:active{background:var(--fill);}
.bd-act__i{color:var(--ink-3); display:flex;}
.bd-act.is-primary{border-color:rgba(46,123,106,.45); color:var(--teal-ink); font-weight:600;}
.bd-act.is-primary .bd-act__i{color:var(--teal);}
.bd-act.is-primary:active{background:rgba(46,123,106,.07);}

/* empty */
.bd-empty{text-align:center; padding:48px 20px; background:var(--surface); border:1px solid var(--line); border-radius:16px;}
.bd-empty__t{margin:0; font-size:16px; font-weight:600;}
.bd-empty__b{margin:6px 0 16px; font-size:13.5px; color:var(--ink-2);}
.bd-empty__reset{font:inherit; font-size:13.5px; font-weight:600; color:#FBFAF7; background:var(--teal); border:0; border-radius:10px; padding:11px 18px; min-height:44px; cursor:pointer;}

/* footer */
.bd-foot{margin-top:20px; padding-top:18px; border-top:1px solid var(--line);}
.bd-foot__em{margin:0 0 8px; font-size:13px;}
.bd-foot__em a{color:var(--teal-ink); font-weight:600; text-decoration:none;}
.bd-foot__note{margin:0; font-size:12px; color:var(--ink-3); line-height:1.5;}

@media (max-width:360px){ .bd-filters__grid{grid-template-columns:1fr;} }
@media (prefers-reduced-motion:reduce){ .bd-root *{transition:none !important; animation:none !important;} }
`;
