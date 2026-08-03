import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search, ExternalLink, RotateCcw, Info, AlertTriangle,
  SlidersHorizontal, X,
} from "lucide-react";

// ── Bonda · Autism Support Finder (Singapore) ─────────────────────────────
// Single self-contained file. All scheme data lives in SCHEMES below.
// Verified against official government / agency pages on 25 Jul 2026.
//
// Carousel illustrations: clean built-in line art (see ILLUS). To use your own
// artwork instead, add `img: "https://…/your-image.png"` inside a scheme's
// `highlight` object and it will render that image in place of the line art.
//
// DEPLOY NOTE — for safe areas (notch / home indicator) to work in a real app
// or mobile browser, add to your index.html <head>:
//   <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

const VERIFIED_ON = "25 Jul 2026";

const SCHEMES = [
  {
    id: "eipic",
    name: "Early Intervention Programme for Infants & Children",
    short: "EIPIC @ Centre",
    category: "Early intervention",
    benefit:
      "Subsidised therapy and learning support at an early intervention centre for children who need medium to high support.",
    amount: "Citizens pay about $5–$430/month after subsidy. PRs get a smaller subsidy.",
    ageMin: 0, ageMax: 6, ageLabel: "Ages 0–6",
    residency: ["SC", "PR"],
    supportTypes: ["therapy"],
    targetGroups: ["ASD", "special_needs"],
    meansTested: true,
    meansNote: "Fee depends on your household income per person.",
    apply:
      "Ask a paediatrician (polyclinic, KKH, NUH or private) to assess your child, then refer via SG Enable.",
    url: "https://www.enablingguide.sg/im-looking-for-disability-support/therapy-intervention/early-intervention-programme-for-infants-children",
    source: "SG Enable / ECDA",
  },
  {
    id: "dsplus",
    name: "Development Support–Plus",
    short: "DS-Plus",
    category: "Early intervention",
    benefit:
      "Around twice-weekly intervention inside your child's preschool, for mild to moderate needs.",
    amount: "Citizens pay about $2–$290/month (means-tested).",
    ageMin: 2, ageMax: 6, ageLabel: "Ages 2–6",
    residency: ["SC", "PR"],
    supportTypes: ["therapy"],
    targetGroups: ["ASD", "special_needs"],
    meansTested: true,
    meansNote: "Fee depends on household income per person.",
    apply: "Your child's EI centre or preschool assesses and enrols them.",
    url: "https://www.ecda.gov.sg/parents/other-services/early-intervention-services/development-support-plus-(ds-plus)",
    source: "ECDA",
  },
  {
    id: "dsls",
    name: "Development Support–Learning Support",
    short: "DS-LS",
    category: "Early intervention",
    benefit:
      "Targeted speech, motor, social and literacy support in preschool (K1–K2) for children with lighter needs.",
    amount: "Citizens pay about $5–$290/month (means-tested).",
    ageMin: 4, ageMax: 6, ageLabel: "Ages 4–6 (K1–K2)",
    residency: ["SC", "PR"],
    supportTypes: ["therapy"],
    targetGroups: ["ASD", "special_needs"],
    meansTested: true,
    meansNote: "Fee depends on household income per person.",
    apply: "Ask your child's preschool — they assess eligibility, or contact their therapy team.",
    url: "https://www.ecda.gov.sg/parents/other-services/early-intervention-services/development-support-and-learning-support-programme-(ds-ls)",
    source: "ECDA",
  },
  {
    id: "eipicp",
    name: "EIPIC – Private (subsidy at approved private centres)",
    short: "EIPIC-P",
    category: "Early intervention",
    benefit:
      "Government subsidy you can use at an approved private early intervention centre.",
    amount: "Partial subsidy of centre fees (means-tested).",
    ageMin: 0, ageMax: 6, ageLabel: "Ages 0–6",
    residency: ["SC", "PR"],
    supportTypes: ["therapy"],
    targetGroups: ["ASD", "special_needs"],
    meansTested: true,
    meansNote: "Fee depends on household income per person.",
    statusNote:
      "New referrals are paused. They resume in Q4 2026 for enrolment from Jan 2027. Children already enrolled keep their subsidy.",
    apply: "Referral via SG Enable (when referrals reopen).",
    url: "https://www.enablingguide.sg/im-looking-for-disability-support/therapy-intervention/early-intervention-programme-for-infants-and-children-p",
    source: "SG Enable / ECDA",
  },
  {
    id: "sped",
    name: "Special Education (SPED) school places",
    short: "SPED schools",
    category: "Education",
    benefit:
      "Heavily subsidised places at special education schools, including autism-focused schools like Pathlight, St. Andrew's Autism School and Rainbow Centre.",
    amount:
      "Citizens pay about $14–$250/month depending on the school. PRs pay more; international students pay full fees.",
    ageMin: 7, ageMax: 18, ageLabel: "Ages 7–18",
    residency: ["SC", "PR", "Foreigner"],
    supportTypes: ["education"],
    targetGroups: ["ASD", "special_needs", "pwd"],
    meansTested: false,
    meansNote: "Flat fee by nationality — not income-tested.",
    apply:
      "Citizens & PRs apply via MOE's Common SPED School Application Form. International students approach the school directly.",
    url: "https://www.moe.gov.sg/special-educational-needs/sped-schools",
    source: "MOE",
  },
  {
    id: "spedfas",
    name: "MOE Financial Assistance Scheme (SPED)",
    short: "SPED FAS",
    category: "Education",
    benefit:
      "Extra help for lower-income families with fees, transport, meals and supplies at MOE-funded SPED schools.",
    amount: "Covers fees plus a 70% school bus subsidy and more.",
    ageMin: 7, ageMax: 18, ageLabel: "Ages 7–18",
    residency: ["SC"],
    supportTypes: ["financial", "education"],
    targetGroups: ["ASD", "special_needs", "pwd"],
    meansTested: true,
    meansNote: "Household income up to $4,000/month gross, or $1,000 per person (from 2026).",
    apply:
      "Apply through your child's SPED school (eFAS). ComCare families are included automatically.",
    url: "https://www.moe.gov.sg/financial-matters/financial-assistance",
    source: "MOE",
    highlight: { badge: "Updated 2026", hook: "More families now qualify for school-cost help", illus: "school" },
  },
  {
    id: "hcg",
    name: "Home Caregiving Grant",
    short: "HCG",
    category: "Caregiving & home",
    benefit:
      "Monthly cash to help families caring for a loved one with permanent moderate-to-severe disability at home.",
    amount: "$200–$600 a month, depending on income (enhanced from April 2026).",
    ageMin: 0, ageMax: 99, ageLabel: "All ages",
    residency: ["SC", "PR"],
    supportTypes: ["financial", "caregiving"],
    targetGroups: ["ASD", "pwd"],
    meansTested: true,
    meansNote:
      "Income up to $4,800/month per person, or property value ≤ $21,000 if no income. PRs must have a close citizen family member.",
    apply: "Apply via AIC (eFASS with Singpass). Your loved one needs a needs assessment.",
    url: "https://www.aic.sg/Financial-Assistance/Home-Caregiving-Grant",
    source: "Agency for Integrated Care (AIC)",
    highlight: { badge: "Enhanced Apr 2026", hook: "Now up to $600 a month for caregivers", illus: "care" },
  },
  {
    id: "ctg",
    name: "Caregivers Training Grant",
    short: "CTG",
    category: "Caregiving & home",
    benefit:
      "Subsidy for approved courses so you can learn to care for your child better.",
    amount: "Up to $400 for approved courses ($200 top-up each year).",
    ageMin: 0, ageMax: 99, ageLabel: "All ages",
    residency: ["SC", "PR"],
    supportTypes: ["caregiving"],
    targetGroups: ["ASD", "special_needs", "pwd"],
    meansTested: false,
    meansNote: "No income test.",
    apply: "Book approved courses via AIC's caregiver training calendar.",
    url: "https://www.enablingguide.sg/im-looking-for-disability-support/money-matters/child-adult-care",
    source: "AIC",
  },
  {
    id: "mdw",
    name: "Migrant Domestic Worker Levy Concession (disability)",
    short: "Helper Levy Concession",
    category: "Caregiving & home",
    benefit:
      "Pay a much lower monthly helper levy if your helper cares for a family member with disabilities.",
    amount: "$60/month instead of $300 — a saving of about $2,880 a year.",
    ageMin: 0, ageMax: 99, ageLabel: "All ages",
    residency: ["SC"],
    supportTypes: ["financial", "caregiving"],
    targetGroups: ["ASD", "pwd"],
    meansTested: false,
    meansNote: "The person cared for must be a citizen. Children under 16 are covered automatically.",
    apply:
      "Under 16: covered automatically. Otherwise apply via AIC/MOM with a doctor's certification that daily-activity help is needed.",
    url: "https://www.aic.sg/Financial-Assistance/Migrant-Domestic-Worker-Levy-Concession",
    source: "MOM / AIC",
  },
  {
    id: "atf",
    name: "Assistive Technology Fund",
    short: "ATF",
    category: "Assistive tech",
    benefit:
      "Subsidy to buy, replace or repair assistive devices — e.g. communication (AAC) devices, sensory or learning aids.",
    amount: "Up to 90% of the cost, with a $40,000 lifetime cap.",
    ageMin: 0, ageMax: 99, ageLabel: "All ages",
    residency: ["SC", "PR"],
    supportTypes: ["devices"],
    targetGroups: ["ASD", "pwd"],
    meansTested: true,
    meansNote: "Household income up to $4,800/month per person (from Jan 2026).",
    apply:
      "A therapist or social worker at a public hospital or social service agency applies for you via SG Enable.",
    url: "https://www.enablingguide.sg/im-looking-for-disability-support/assistive-technology/assistive-technology-fund",
    source: "SG Enable",
    highlight: { badge: "Updated Jan 2026", hook: "Up to 90% off AAC & assistive devices", illus: "device" },
  },
  {
    id: "ets",
    name: "Enabling Transport Subsidy",
    short: "ETS",
    category: "Transport",
    benefit:
      "Subsidy on dedicated bus transport to EIPIC, SPED schools and other approved disability services.",
    amount: "Up to 80% of transport fees.",
    ageMin: 0, ageMax: 99, ageLabel: "All ages",
    residency: ["SC", "PR"],
    supportTypes: ["transport"],
    targetGroups: ["ASD", "pwd"],
    meansTested: true,
    meansNote: "Income up to $4,800/month per person (coverage expanded from July 2026).",
    apply: "Arranged through your child's SPED school or service provider.",
    url: "https://www.enablingguide.sg/im-looking-for-disability-support/transport/enabling-transport-subsidy",
    source: "SG Enable",
    highlight: { badge: "Enhanced Jul 2026", hook: "More families covered — income up to $4,800", illus: "bus" },
  },
  {
    id: "taxi",
    name: "Taxi Subsidy Scheme",
    short: "Taxi Subsidy",
    category: "Transport",
    benefit:
      "Help with taxi or private-hire fares for those who can't take public transport to school, work or training.",
    amount: "Up to 80% of the fare.",
    ageMin: 0, ageMax: 99, ageLabel: "All ages",
    residency: ["SC", "PR"],
    supportTypes: ["transport"],
    targetGroups: ["ASD", "pwd"],
    meansTested: true,
    meansNote: "Income ≤ $4,800/month per person. Cannot combine with the Enabling Transport Subsidy.",
    apply: "Apply via SG Enable.",
    url: "https://www.enablingguide.sg/im-looking-for-disability-support/transport",
    source: "SG Enable",
  },
  {
    id: "pwdcard",
    name: "Persons with Disabilities Concession Card",
    short: "PWD Concession Card",
    category: "Transport",
    benefit: "Discounted public bus and train travel for people with disabilities.",
    amount: "Up to 55% off adult fares. Can be used alongside other transport subsidies.",
    ageMin: 0, ageMax: 99, ageLabel: "All ages",
    residency: ["SC", "PR"],
    supportTypes: ["transport"],
    targetGroups: ["ASD", "pwd"],
    meansTested: false,
    meansNote: "No income test.",
    apply: "Apply via SimplyGo, or through SG Enable if not from a SPED school / social service agency.",
    url: "https://www.enablingguide.sg/im-looking-for-disability-support/transport",
    source: "SimplyGo / SG Enable",
  },
  {
    id: "traingrant",
    name: "Training Grant (skills & independent living)",
    short: "Training Grant",
    category: "Training & work",
    benefit:
      "Subsidised skills and independent-living training for people with disabilities preparing for work.",
    amount: "Funded by SSG, WSG and MSF — defrays most training costs.",
    ageMin: 16, ageMax: 99, ageLabel: "Ages 16+",
    residency: ["SC", "PR"],
    supportTypes: ["work"],
    targetGroups: ["ASD", "pwd"],
    meansTested: false,
    meansNote: "Must not be in full-time education or a government / SPED school.",
    apply: "Enrol through SG Enable-appointed providers such as ARC Learning Academy.",
    url: "https://learningacademy.autism.org.sg/training-grants",
    source: "SG Enable / ARC(S)",
  },
];

const HL_ORDER = ["hcg", "ets", "atf", "spedfas"];
const HIGHLIGHTS = HL_ORDER.map((id) => SCHEMES.find((s) => s.id === id)).filter((s) => s && s.highlight);
const SLIDE_GAP = 12;

const RESIDENCY = [
  { key: "all", label: "Anyone" }, { key: "SC", label: "Citizen" },
  { key: "PR", label: "PR" }, { key: "Foreigner", label: "Foreigner" },
];
const STAGE = [
  { key: "any", label: "Any" }, { key: "child", label: "Child · 0–18" }, { key: "adult", label: "Adult · 18+" },
];
const SUPPORT = [
  { key: "all", label: "All support" }, { key: "financial", label: "Financial help" },
  { key: "therapy", label: "Therapy & medical" }, { key: "education", label: "School" },
  { key: "devices", label: "Devices" }, { key: "transport", label: "Transport" },
  { key: "caregiving", label: "Caregiving" }, { key: "work", label: "Work & training" },
];
const TARGET = [
  { key: "all", label: "All" }, { key: "ASD", label: "Autism (ASD)" },
  { key: "special_needs", label: "Special needs" }, { key: "pwd", label: "Disability (PWD)" },
];
const MEANS = [
  { key: "any", label: "Any" }, { key: "no", label: "No income test" }, { key: "yes", label: "Income-tested" },
];

// Muted, professional palette — no bright green or yellow.
const CAT_STYLES = {
  "Early intervention": { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500" },
  Education: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  "Caregiving & home": { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  "Assistive tech": { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  Transport: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  "Training & work": { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" },
};
const RES_LABEL = { SC: "Citizen", PR: "PR", Foreigner: "Foreigner" };

// Clean line illustrations (swap for your own art via highlight.img)
const ILLUS = {
  care: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M32 22c3.4-5 12-3.3 12 2.7 0 5.2-7 9.6-12 13-5-3.4-12-7.8-12-13 0-6 8.6-7.7 12-2.7z" fill="currentColor" fillOpacity="0.1" />
      <path d="M13 44c1.8-1.8 4.6-1.8 6.4 0l3.6 3H33c5 0 9 0 12-2.6" />
    </svg>
  ),
  bus: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="13" y="16" width="38" height="27" rx="5" fill="currentColor" fillOpacity="0.08" />
      <path d="M13 33h38" /><path d="M20 22h9M35 22h9" />
      <circle cx="23" cy="47" r="3" /><circle cx="41" cy="47" r="3" />
    </svg>
  ),
  device: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="17" y="11" width="30" height="42" rx="5" fill="currentColor" fillOpacity="0.08" />
      <rect x="23" y="19" width="7.5" height="7.5" rx="2" /><rect x="33.5" y="19" width="7.5" height="7.5" rx="2" fill="currentColor" fillOpacity="0.18" />
      <rect x="23" y="30" width="7.5" height="7.5" rx="2" fill="currentColor" fillOpacity="0.18" /><rect x="33.5" y="30" width="7.5" height="7.5" rx="2" />
      <path d="M28 47h8" />
    </svg>
  ),
  school: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M32 21c-4.5-3.4-11-3.4-15-2.4v29c4-1 10.5-1 15 2.4 4.5-3.4 11-3.4 15-2.4v-29c-4-1-10.5-1-15 2.4z" fill="currentColor" fillOpacity="0.08" />
      <path d="M32 21v29" />
    </svg>
  ),
};

const STYLES = `
.bonda-root{
  --accent:#0f766e; --ink:#1c1917; --bg:#f6f5f3;
  font-family:'Plus Jakarta Sans',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  -webkit-tap-highlight-color:transparent; -webkit-text-size-adjust:100%; text-size-adjust:100%;
  background:#e7e5e4; min-height:100vh; min-height:100dvh; display:flex; justify-content:center;
}
.bonda-app{
  position:relative; width:100%; max-width:440px; background:var(--bg);
  display:flex; flex-direction:column; height:100vh; height:100dvh; overflow:hidden;
}
@media (min-width:480px){
  .bonda-root{padding:24px 0;}
  .bonda-app{height:calc(100dvh - 48px); max-height:920px; border-radius:30px;
    box-shadow:0 24px 70px rgba(0,0,0,.18); border:1px solid rgba(0,0,0,.06);}
}
.bonda-scroll{flex:1; overflow-y:auto; -webkit-overflow-scrolling:touch; overscroll-behavior:contain; scroll-behavior:smooth;}
.bonda-tap{transition:transform .08s ease, background-color .15s ease, border-color .15s ease, box-shadow .2s ease;}
.bonda-tap:active{transform:scale(.98);}
.bonda-carousel{scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; scrollbar-width:none;}
.bonda-carousel::-webkit-scrollbar{display:none;}
.bonda-slide{scroll-snap-align:start; flex:0 0 86%;}
.bonda-flash{box-shadow:0 0 0 2px var(--accent), 0 8px 24px rgba(15,118,110,.22);}
.bonda-backdrop{position:absolute; inset:0; background:rgba(0,0,0,.42); opacity:0;
  animation:bondaFade .2s ease forwards; z-index:40;}
@keyframes bondaFade{to{opacity:1;}}
.bonda-sheet{position:absolute; left:0; right:0; bottom:0; z-index:50; background:#fff;
  border-radius:26px 26px 0 0; max-height:90%; display:flex; flex-direction:column;
  transform:translateY(100%); animation:bondaSlide .30s cubic-bezier(.32,.72,0,1) forwards;
  box-shadow:0 -10px 44px rgba(0,0,0,.18);}
@keyframes bondaSlide{to{transform:translateY(0);}}
.bonda-sheet-body{overflow-y:auto; -webkit-overflow-scrolling:touch; overscroll-behavior:contain;}
.bonda-handle{width:40px; height:5px; border-radius:999px; background:#d6d3d1; margin:10px auto 2px;}
.bonda-bot{padding-bottom:env(safe-area-inset-bottom,0px);}
`;

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={"bonda-tap px-4 rounded-full text-sm font-semibold border flex items-center " +
        (active ? "bg-teal-700 text-white border-teal-700" : "bg-white text-stone-600 border-stone-200")}
      style={{ minHeight: 42 }}>
      {children}
    </button>
  );
}

function FilterRow({ label, options, value, onChange }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o.key} active={value === o.key} onClick={() => onChange(o.key)}>{o.label}</Chip>
        ))}
      </div>
    </div>
  );
}

function Card({ s }) {
  const cat = CAT_STYLES[s.category];
  return (
    <div id={"scheme-" + s.id}
      className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-4 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-flex items-center gap-1.5 ${cat.bg} ${cat.text} text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
          {s.category}
        </span>
        <span className="ml-auto text-[11px] font-semibold text-stone-400">{s.short}</span>
      </div>

      <h3 className="text-[15px] font-extrabold text-stone-800 leading-snug">{s.name}</h3>
      <p className="text-[13.5px] text-stone-600 leading-relaxed mt-1.5">{s.benefit}</p>

      <div className="mt-3 bg-stone-50 rounded-xl px-3 py-2.5 border border-stone-100">
        <p className="text-[11px] font-bold uppercase tracking-wide text-stone-400">What you get</p>
        <p className="text-[13.5px] font-semibold text-stone-800 leading-snug mt-0.5">{s.amount}</p>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 rounded-md px-2 py-1">{s.ageLabel}</span>
        {s.residency.map((r) => (
          <span key={r} className="text-[11px] font-semibold text-stone-600 bg-stone-100 rounded-md px-2 py-1">
            {RES_LABEL[r]}
          </span>
        ))}
        <span className={"text-[11px] font-semibold rounded-md px-2 py-1 " + (s.meansTested ? "text-stone-600 bg-stone-100" : "text-teal-700 bg-teal-50")}>
          {s.meansTested ? "Income-tested" : "No income test"}
        </span>
      </div>

      {s.meansNote && (
        <p className="text-[12px] text-stone-500 leading-relaxed mt-2 flex gap-1.5">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-stone-400" />
          <span>{s.meansNote}</span>
        </p>
      )}

      {s.statusNote && (
        <p className="text-[12px] text-stone-600 bg-stone-100 rounded-lg px-2.5 py-2 leading-relaxed mt-2 flex gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-stone-500" />
          <span>{s.statusNote}</span>
        </p>
      )}

      <div className="mt-3 pt-3 border-t border-stone-100">
        <p className="text-[12px] text-stone-600 leading-relaxed">
          <span className="font-bold text-stone-700">How to apply · </span>{s.apply}
        </p>
        <a href={s.url} target="_blank" rel="noopener noreferrer"
          className="bonda-tap mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-bold text-teal-700"
          style={{ minHeight: 40 }}>
          Official page — {s.source}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

function HighlightsCarousel() {
  const trackRef = useRef(null);
  const pausedRef = useRef(false);
  const [slide, setSlide] = useState(0);

  const step = () => {
    const el = trackRef.current;
    if (!el || !el.firstElementChild) return el ? el.clientWidth : 1;
    return el.firstElementChild.offsetWidth + SLIDE_GAP;
  };

  useEffect(() => {
    if (HIGHLIGHTS.length < 2) return;
    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el || pausedRef.current) return;
      const next = (Math.round(el.scrollLeft / step()) + 1) % HIGHLIGHTS.length;
      el.scrollTo({ left: next * step(), behavior: "smooth" });
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const onScroll = () => {
    const el = trackRef.current;
    if (el) setSlide(Math.round(el.scrollLeft / step()));
  };

  return (
    <div className="mb-5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2 px-0.5">Recently updated</p>

      <div ref={trackRef} onScroll={onScroll}
        onTouchStart={() => { pausedRef.current = true; }}
        onTouchEnd={() => { setTimeout(() => { pausedRef.current = false; }, 3500); }}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
        className="bonda-carousel flex overflow-x-auto" style={{ gap: SLIDE_GAP }}>
        {HIGHLIGHTS.map((s) => (
          <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="bonda-slide bonda-tap block">
            <div className="relative rounded-2xl bg-white border border-stone-200 shadow-sm p-4 flex items-center gap-3"
              style={{ minHeight: 130 }}>
              <div className="flex-1 min-w-0">
                <p className="text-stone-900 font-extrabold text-[15.5px] leading-snug">{s.highlight.hook}</p>
                <p className="text-stone-400 text-[11.5px] font-semibold mt-1 truncate">{s.name}</p>
                <span className="inline-flex items-center gap-1 text-teal-700 text-[12.5px] font-bold mt-2.5">
                  See details <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="shrink-0 text-teal-600" style={{ width: 60, height: 60 }}>
                {s.highlight.img
                  ? <img src={s.highlight.img} alt="" style={{ width: 60, height: 60, objectFit: "contain" }} />
                  : ILLUS[s.highlight.illus]}
              </div>
            </div>
          </a>
        ))}
      </div>

      {HIGHLIGHTS.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2.5">
          {HIGHLIGHTS.map((_, i) => (
            <span key={i} className={"h-1.5 rounded-full transition-all " + (i === slide ? "w-5 bg-teal-600" : "w-1.5 bg-stone-300")} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BondaSubsidyFinder() {
  const [res, setRes] = useState("all");
  const [stage, setStage] = useState("any");
  const [support, setSupport] = useState("all");
  const [target, setTarget] = useState("all");
  const [means, setMeans] = useState("any");
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!document.getElementById("pjs-font")) {
      const link = document.createElement("link");
      link.id = "pjs-font"; link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
      document.head.appendChild(link);
    }
    if (!document.getElementById("bonda-styles")) {
      const st = document.createElement("style");
      st.id = "bonda-styles"; st.textContent = STYLES;
      document.head.appendChild(st);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = showFilters ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showFilters]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return SCHEMES.filter((s) => {
      const resOk = res === "all" || s.residency.includes(res);
      const stageOk = stage === "any" || (stage === "child" && s.ageMin <= 17) || (stage === "adult" && s.ageMax >= 18);
      const supportOk = support === "all" || s.supportTypes.includes(support);
      const targetOk = target === "all" || s.targetGroups.includes(target);
      const meansOk = means === "any" || (means === "no" && !s.meansTested) || (means === "yes" && s.meansTested);
      const qOk = !query || (s.name + " " + s.short + " " + s.benefit + " " + s.category).toLowerCase().includes(query);
      return resOk && stageOk && supportOk && targetOk && meansOk && qOk;
    });
  }, [res, stage, support, target, means, q]);

  const activeCount =
    (res !== "all" ? 1 : 0) + (stage !== "any" ? 1 : 0) + (support !== "all" ? 1 : 0) +
    (target !== "all" ? 1 : 0) + (means !== "any" ? 1 : 0);
  const anyActive = activeCount > 0 || q;

  const reset = () => { setRes("all"); setStage("any"); setSupport("all"); setTarget("all"); setMeans("any"); setQ(""); };

  return (
    <div className="bonda-root">
      <div className="bonda-app">

        {/* Header — title only */}
        <header className="bg-white px-5 pb-3 border-b border-stone-200"
          style={{ paddingTop: "max(env(safe-area-inset-top,0px), 18px)" }}>
          <h1 className="text-[17px] font-extrabold text-stone-900 tracking-tight leading-snug">
            Subsidies &amp; grants
          </h1>
          <p className="text-[12px] text-stone-500 mt-0.5">Find the support your family may qualify for.</p>
        </header>

        {/* Search + Filters */}
        <div className="px-4 py-3 bg-white border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search support…" enterKeyHint="search" autoCapitalize="off" autoCorrect="off"
                className="w-full pl-9 pr-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-teal-400 focus:bg-white"
                style={{ fontSize: 16, height: 46 }} />
            </div>
            <button onClick={() => setShowFilters(true)}
              className={"bonda-tap inline-flex items-center gap-1.5 px-4 rounded-xl text-sm font-bold border " +
                (activeCount > 0 ? "bg-teal-700 text-white border-teal-700" : "bg-white text-teal-700 border-stone-200")}
              style={{ height: 46 }}>
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-white text-teal-700 text-[11px] font-extrabold"
                  style={{ minWidth: 18, height: 18, padding: "0 4px" }}>{activeCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="bonda-scroll px-4 pt-4">
          {!anyActive && HIGHLIGHTS.length > 0 && <HighlightsCarousel />}

          <div className="flex items-center justify-between mb-3">
            <p className="text-[12.5px] font-semibold text-stone-500">
              {results.length} {results.length === 1 ? "scheme" : "schemes"} found
            </p>
            {anyActive && (
              <button onClick={reset}
                className="bonda-tap inline-flex items-center gap-1 text-[12.5px] font-semibold text-teal-700"
                style={{ minHeight: 32 }}>
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>

          {target === "ASD" && (
            <div className="mb-3 bg-teal-50 border border-teal-200 rounded-xl px-3.5 py-2.5">
              <p className="text-[12.5px] text-teal-900 leading-relaxed">
                A child or adult with autism qualifies for every scheme here — autism is recognised as a disability
                across these programmes.
              </p>
            </div>
          )}

          {res === "Foreigner" && (
            <div className="mb-3 bg-stone-100 border border-stone-200 rounded-xl px-3.5 py-3">
              <p className="text-[12.5px] text-stone-600 leading-relaxed">
                Most government subsidies are for citizens and PRs. Foreigners can still access special education
                school places (at full international fees) and private therapy. Speak to your child's school or a
                social worker about options.
              </p>
            </div>
          )}

          {results.length === 0 ? (
            <div className="text-center py-12 px-6">
              <p className="text-[14px] font-bold text-stone-600">No schemes match those filters.</p>
              <p className="text-[13px] text-stone-500 mt-1.5 leading-relaxed">Try widening a filter or tapping Reset.</p>
            </div>
          ) : (
            results.map((s) => <Card key={s.id} s={s} />)
          )}

          {/* Footer */}
          <div className="mt-5 mb-4 bonda-bot">
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Bonda checks these against official government and agency sources. Amounts and rules can change —
              always confirm on the official page before applying. Not affiliated with the Singapore Government.
            </p>
            <p className="text-[10px] text-stone-400 mt-2">Verified {VERIFIED_ON}</p>
          </div>
        </div>

        {/* Filter bottom sheet */}
        {showFilters && (
          <>
            <div className="bonda-backdrop" onClick={() => setShowFilters(false)} />
            <div className="bonda-sheet" role="dialog" aria-label="Filters">
              <div className="bonda-handle" />
              <div className="flex items-center px-5 pt-1 pb-3 border-b border-stone-100">
                <h2 className="text-[16px] font-extrabold text-stone-800">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="bonda-tap ml-auto -mr-2 p-2 text-stone-400" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="bonda-sheet-body px-5 py-4">
                <FilterRow label="Who is this for?" options={RESIDENCY} value={res} onChange={setRes} />
                <FilterRow label="Child or adult?" options={STAGE} value={stage} onChange={setStage} />
                <FilterRow label="Type of support" options={SUPPORT} value={support} onChange={setSupport} />
                <FilterRow label="Target group" options={TARGET} value={target} onChange={setTarget} />
                <FilterRow label="Income / means-testing" options={MEANS} value={means} onChange={setMeans} />
              </div>
              <div className="flex items-center gap-2 px-5 pt-3 pb-4 border-t border-stone-100 bonda-bot">
                <button onClick={reset}
                  className="bonda-tap inline-flex items-center justify-center gap-1.5 px-5 rounded-xl text-sm font-bold text-stone-600 bg-white border border-stone-200"
                  style={{ height: 50 }}>
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
                <button onClick={() => setShowFilters(false)}
                  className="bonda-tap flex-1 rounded-xl text-sm font-bold text-white bg-teal-700" style={{ height: 50 }}>
                  Show {results.length} {results.length === 1 ? "result" : "results"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
