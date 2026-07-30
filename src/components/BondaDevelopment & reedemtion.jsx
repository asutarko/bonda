import React, { useState, useEffect, useMemo } from "react";

/* ==================================================================
   Bonda — Development (Vineland-inspired observation tracker)
   ------------------------------------------------------------------
   Built to the Bonda "Colours & type" reference: warm ivory canvas,
   white cards, hairlines over shadows, teal (#3E6E6A) only for links /
   active / primary, muted tag tones + icon chips for category colour,
   Fraunces for large titles, Plus Jakarta Sans for the rest, sentence
   case throughout.

   Rewards model (points -> redeem):
   - Observing earns points into a single balance (only a real
     observation earns; "No chance to see" earns 0).
   - A points hero at the top shows the total as a donut, with a
     Redeem button that opens the rewards catalogue.
   - Headline reward: 10,000 points -> 10% off Bonda. Redeeming spends
     points and generates a code.

   This is an informal tracker, NOT the real Vineland (a proprietary,
   professionally-administered, normed instrument). Questions here are
   original items inspired by its domain structure. Points reward
   OBSERVING CONSISTENTLY, not the child scoring higher.
   ================================================================== */

const T = {
  canvas: "#F4F1EB", card: "#FFFFFF", ink: "#23201C",
  accent: "#3E6E6A", accentPress: "#345F5B",
  ink70: "rgba(35,32,28,.70)", ink55: "rgba(35,32,28,.55)", ink40: "rgba(35,32,28,.40)", ink28: "rgba(35,32,28,.28)",
  line: "rgba(35,32,28,.12)", lineStrong: "rgba(35,32,28,.20)", focus: "rgba(62,110,106,.16)",
  tintBg: "#E6EDEC", tintTx: "#2E5A56",
  title: '"Fraunces", Georgia, serif',
  body: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

/* official muted tag tones — category colour lives here only */
const CATS = [
  {
    key: "communication", name: "Communication", icon: "chat",
    bg: "#EDE8F3", tx: "#574B78",
    blurb: "Understanding others and getting a message across.",
    sections: [
      { name: "Understanding", items: [
        { q: "Responds to their name", ex: "Turns, looks, or replies when you call them from across the room." },
        { q: "Follows a simple request", ex: "Gets their shoes when asked, without you pointing." },
        { q: "Understands “stop” or “wait”", ex: "Pauses — even briefly — when you say it." },
      ]},
      { name: "Expressing", items: [
        { q: "Lets you know what they want", ex: "With a word, sign, picture card, or by leading your hand." },
        { q: "Uses gestures to communicate", ex: "Points, waves, nods, or shakes their head." },
        { q: "Puts two ideas together", ex: "Two words, two signs, or a word plus a point — “more juice”." },
      ]},
      { name: "Everyday symbols", items: [
        { q: "Recognises a familiar symbol", ex: "Their name card, a favourite logo, or a picture on a menu." },
        { q: "Shows interest in books", ex: "Turns pages, points at pictures, or brings you a book." },
      ]},
    ],
  },
  {
    key: "dailyliving", name: "Daily living", icon: "home",
    bg: "#E4ECF3", tx: "#3A5A78",
    blurb: "Everyday self-care and getting things done.",
    sections: [
      { name: "Personal care", items: [
        { q: "Helps with dressing", ex: "Pushes arms through sleeves, pulls up trousers." },
        { q: "Feeds themselves", ex: "Uses a spoon, fork, or fingers for most of a meal." },
        { q: "Manages a hygiene step", ex: "Washes hands or brushes teeth, with help is fine." },
      ]},
      { name: "Around the home", items: [
        { q: "Helps with a small task", ex: "Puts toys in a box, carries their plate to the sink." },
        { q: "Follows a home routine", ex: "Comes to the table at mealtime, to the door for shoes." },
      ]},
      { name: "Out and about", items: [
        { q: "Copes with an outing", ex: "Manages a shop or clinic trip with your support." },
        { q: "Shows basic safety sense", ex: "Stops at the kerb, stays near you in a busy place." },
      ]},
    ],
  },
  {
    key: "socialization", name: "Socialization", icon: "users",
    bg: "#F3E7EA", tx: "#7A4651",
    blurb: "Connecting, playing, and handling feelings.",
    sections: [
      { name: "Relationships", items: [
        { q: "Recognises familiar people", ex: "Greets, reaches for, or smiles at a parent or sibling." },
        { q: "Shares a look during a moment", ex: "Glances at you during a game or when excited." },
        { q: "Shows you something", ex: "Looks at a toy, then at you, then back — sharing it." },
      ]},
      { name: "Play & leisure", items: [
        { q: "Plays near or with others", ex: "Rolls a ball back, takes a turn, joins a game." },
        { q: "Shows pretend play", ex: "Feeds a doll, makes a car “drive”, stirs a pretend pot." },
        { q: "Seeks out a favourite thing", ex: "Chooses a preferred toy, song, or video." },
      ]},
      { name: "Coping", items: [
        { q: "Recovers from a change", ex: "Settles after a routine shifts, with or without help." },
        { q: "Waits a short moment", ex: "Tolerates a brief wait for a turn or a snack." },
      ]},
    ],
  },
];

const ANSWERS = [
  { key: "not_yet",   label: "Not yet",   sub: "Never, so far", v: 0 },
  { key: "sometimes", label: "Sometimes", sub: "Now and then",  v: 1 },
  { key: "usually",   label: "Usually",   sub: "Most times",    v: 2 },
  { key: "no_chance", label: "No chance to see", sub: "Didn't come up", v: null },
];

/* only a real observation earns; "No chance to see" earns 0.
   Scaled so the 10,000-point reward is reachable through consistent
   observing (~2 months of a daily category) rather than instantly. */
const POINTS_PER_OBSERVATION = 20;

/* rewards catalogue — Bonda subscription discounts. 10% at 10,000 is the headline. */
const HEADLINE_TARGET = 10000;
const REWARDS = [
  { id: "off5",  title: "5% off Bonda",        cost: 5000,  detail: "Applied to your next subscription payment." },
  { id: "off10", title: "10% off Bonda",       cost: 10000, detail: "Applied to your next subscription payment.", popular: true },
  { id: "free1", title: "1 month of Bonda free", cost: 20000, detail: "Added to your subscription as a free month." },
];

const CHILD = { name: "Mariam", photo: null };
/* per-category points earned (cumulative) — these feed the overall total.
   everyone starts at zero; points are earned only by observing. */
const SEED = { communication: 0, dailyliving: 0, socialization: 0 };

/* ---------- inline icon set (stroke, currentColor) ---------- */
function Icon({ name, size = 22, color = "currentColor", w = 1.8 }) {
  const p = { fill: "none", stroke: color, strokeWidth: w, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    chat: <><rect x="4.5" y="4.5" width="15" height="13" rx="3" {...p} /><path d="M9 17.5v3l4-3" {...p} /></>,
    home: <><path d="M4 11 12 4l8 7" {...p} /><path d="M6 10.5V19h12v-8.5" {...p} /></>,
    users: <><circle cx="9" cy="8" r="3.3" {...p} /><path d="M3.2 20c0-3.2 2.6-5 5.8-5s5.8 1.8 5.8 5" {...p} /><path d="M16 5.4a3.3 3.3 0 0 1 0 6.1M17.6 15.4c1.8.7 3.2 2.2 3.2 4.6" {...p} /></>,
    gift: <><rect x="4" y="10" width="16" height="9" rx="1.6" {...p} /><path d="M4 13.5h16M12 10v9" {...p} /><path d="M12 10c-1.2-2.6-5-2.6-5-.4 0 1.5 2.6 1.4 5 .4zM12 10c1.2-2.6 5-2.6 5-.4 0 1.5-2.6 1.4-5 .4z" {...p} /></>,
    coin: <><circle cx="12" cy="12" r="8.5" {...p} /><circle cx="12" cy="12" r="4.5" {...p} /></>,
    chevron: <path d="m9 6 6 6-6 6" {...p} />,
    back: <path d="m15 6-6 6 6 6" {...p} />,
    check: <path d="M4 12l5 5L20 6" {...p} />,
    heart: <path d="M12 20s-7-4.6-9.2-9C1.3 8 3 4.6 6.3 4.6c2 0 3.2 1.2 3.7 2.2.5-1 1.7-2.2 3.7-2.2C21 4.6 22.7 8 21.2 11 19 15.4 12 20 12 20z" {...p} />,
    bell: <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" {...p} /><path d="M13.7 21a2 2 0 0 1-3.4 0" {...p} /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>{paths[name]}</svg>;
}

function IconChip({ name, bg, fg, size = 44, radius = 13 }) {
  return (
    <span style={{ width: size, height: size, borderRadius: radius, background: bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon name={name} size={Math.round(size * 0.5)} color={fg} w={1.9} />
    </span>
  );
}

/* donut showing total points, ring = progress toward the headline reward */
function Donut({ value, target, size = 116 }) {
  const stroke = 11;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / target));
  const dash = c * pct;
  const m = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={m} cy={m} r={r} fill="none" stroke={T.tintBg} strokeWidth={stroke} />
      <circle cx={m} cy={m} r={r} fill="none" stroke={T.accent} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`} transform={`rotate(-90 ${m} ${m})`} />
      <text x={m} y={m - 2} textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: T.title, fontWeight: 600, fontSize: 19, fill: T.ink }}>{value.toLocaleString()}</text>
      <text x={m} y={m + 16} textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: T.body, fontSize: 10.5, fill: T.ink55 }}>points</text>
    </svg>
  );
}

/* simple line face for the feedback rating (no emoji) */
function FaceIcon({ mood, size = 28, color = T.ink55 }) {
  const p = { fill: "none", stroke: color, strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  const my = 14 + mood * 1.5;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" {...p} />
      <circle cx="9" cy="10.5" r="0.95" fill={color} stroke="none" />
      <circle cx="15" cy="10.5" r="0.95" fill={color} stroke="none" />
      <path d={`M8.2 14.2 Q12 ${my} 15.8 14.2`} {...p} />
    </svg>
  );
}

export default function BondaDevelopment({ onExit }) {
  const [view, setView] = useState("home");     // home | quiz | feedback | redeem | progress
  const [quizCat, setQuizCat] = useState(null);
  const [earned, setEarned] = useState(SEED);    // per-category cumulative points
  const [claimed, setClaimed] = useState({});    // rewardId -> code
  const [observations, setObservations] = useState([]);   // dated {date,category,section,skill,score}

  useEffect(() => {
    const id = "bonda-fonts";
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";
    document.head.appendChild(l);
  }, []);

  const total = CATS.reduce((n, c) => n + (earned[c.key] || 0), 0);
  const addToCategory = (key, n) => setEarned((e) => ({ ...e, [key]: (e[key] || 0) + n }));
  const logObservations = (obs) => setObservations((o) => [...o, ...obs]);
  const redeem = (r) => {
    if (total < r.cost || claimed[r.id]) return;   // reach the threshold to redeem
    setClaimed((c) => ({ ...c, [r.id]: "BONDA-" + Math.random().toString(36).slice(2, 7).toUpperCase() }));
  };

  return (
    <div style={{ background: T.canvas, minHeight: "100vh", fontFamily: T.body, color: T.ink }}>
      <style>{CSS}</style>
      {view === "home" && (
        <Home earned={earned} total={total} onExit={onExit}
          onStartQuiz={(c) => { setQuizCat(c); setView("quiz"); }}
          onFeedback={() => setView("feedback")}
          onRedeem={() => setView("redeem")}
          onProgress={() => setView("progress")} />
      )}
      {view === "quiz" && (
        <Quiz cat={quizCat}
          onDone={(pts, obs) => { addToCategory(quizCat.key, pts); logObservations(obs); setView("home"); }}
          onClose={() => setView("home")} />
      )}
      {view === "redeem" && (
        <Redeem points={total} claimed={claimed} onRedeem={redeem} onClose={() => setView("home")} />
      )}
      {view === "progress" && (
        <Progress observations={observations} onClose={() => setView("home")} onLoadSample={() => setObservations(makeSampleHistory())} />
      )}
      {view === "feedback" && <Feedback onClose={() => setView("home")} />}
    </div>
  );
}

/* ==================================================================
   HOME
   ================================================================== */
function Home({ earned, total, onStartQuiz, onFeedback, onRedeem, onProgress, onExit }) {
  const [open, setOpen] = useState(null);
  const remaining = Math.max(0, HEADLINE_TARGET - total);

  return (
    <div>
      <div className="b-safe-top" style={{ padding: "14px 20px 6px", background: T.canvas }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {onExit && (
            <button onClick={onExit} className="b-icontap" aria-label="Back" style={{ marginRight: 2 }}>
              <Icon name="back" size={20} w={2} color={T.accent} />
            </button>
          )}
          <div style={{ width: 46, height: 46, borderRadius: 999, background: T.accent, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: T.title, fontWeight: 600, fontSize: 20 }}>{CHILD.name[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, color: T.ink55 }}>{todayLabel()}</div>
            <div style={{ fontFamily: T.title, fontWeight: 600, fontSize: 22, lineHeight: 1.1 }}>{CHILD.name}</div>
          </div>
          <span style={{ color: T.ink40 }}><Icon name="bell" size={22} w={1.8} /></span>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "10px 18px 40px" }}>

        {/* POINTS HERO — donut total + redeem */}
        <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 16, padding: 16, marginBottom: 18, display: "flex", alignItems: "center", gap: 16 }}>
          <Donut value={total} target={HEADLINE_TARGET} size={112} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.title, fontWeight: 600, fontSize: 17, lineHeight: 1.15 }}>Redeem your points</div>
            <div style={{ fontSize: 12.5, color: T.ink55, marginTop: 3, lineHeight: 1.45 }}>
              {remaining === 0
                ? "You've reached 10% off Bonda."
                : `${remaining.toLocaleString()} points to 10% off Bonda.`}
            </div>
            <button onClick={onRedeem} className="b-primary" style={{ marginTop: 12, padding: "11px 20px", fontSize: 14.5 }}>Redeem</button>
          </div>
        </div>

        <MilestoneChart earned={earned} onOpenProgress={onProgress} />

        <h1 style={{ fontFamily: T.title, fontWeight: 600, fontSize: 22, lineHeight: 1.1, letterSpacing: "-0.01em", margin: "6px 2px 4px" }}>
          Today's observations
        </h1>
        <p style={{ fontSize: 13.5, color: T.ink55, lineHeight: 1.5, margin: "0 2px 14px" }}>
          A few minutes of noticing. Every observation adds points.
        </p>

        {CATS.map((c) => {
          const total = c.sections.reduce((n, s) => n + s.items.length, 0);
          const isOpen = open === c.key;
          return (
            <div key={c.key} className="b-cat-wrap">
              <button className="b-cat-head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : c.key)}>
                <div style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}>
                  <IconChip name={c.icon} bg={c.bg} fg={c.tx} />
                  <div style={{ textAlign: "left", minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 600, color: T.ink }}>{c.name}</div>
                    <div style={{ fontSize: 12.5, color: T.ink55, marginTop: 2 }}>
                      {total} quick questions · about {estMin(total)} min
                    </div>
                  </div>
                </div>
                <span className={"b-chev" + (isOpen ? " open" : "")} style={{ color: T.ink40, flexShrink: 0 }}>
                  <Icon name="chevron" size={20} w={2} />
                </span>
              </button>
              {isOpen && (
                <div className="b-cat-body">
                  <div style={{ fontSize: 12.5, color: T.ink55, lineHeight: 1.55, marginBottom: 12 }}>
                    {c.blurb}
                    <br />
                    <span style={{ color: T.ink40 }}>Sections: {c.sections.map((s) => s.name).join(" · ")}</span>
                  </div>
                  <button onClick={() => onStartQuiz(c)} className="b-primary" style={{ width: "100%" }}>Start observing</button>
                </div>
              )}
            </div>
          );
        })}

        <button onClick={onFeedback} className="b-outline" style={{ marginTop: 8 }}>
          Share feedback on this tracker
        </button>

        <InfoAccordion />
      </div>
    </div>
  );
}

function MilestoneChart({ earned, onOpenProgress }) {
  const ticks = [0, 25, 50, 75, 100];
  const tickShift = (t) => (t === 0 ? "none" : t === 100 ? "translateX(-100%)" : "translateX(-50%)");
  return (
    <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 16, padding: "18px 18px 16px", marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 2 }}>
        <div style={{ fontFamily: T.title, fontWeight: 600, fontSize: 18 }}>Milestone progress</div>
        <button onClick={onOpenProgress} style={{ background: "none", border: "none", color: T.accent, fontFamily: T.body, fontWeight: 600, fontSize: 12.5, cursor: "pointer", flexShrink: 0, padding: 0 }}>Over time ›</button>
      </div>
      <div style={{ fontSize: 12.5, color: T.ink40, marginBottom: 16 }}>How each area is progressing toward the reward</div>
      {CATS.map((c) => {
        const pct = Math.min(100, ((earned[c.key] || 0) / HEADLINE_TARGET) * 100);
        return (
          <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 116, flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name={c.icon} size={17} w={1.9} color={c.tx} />
              <span style={{ fontSize: 13, color: T.ink }}>{c.name}</span>
            </div>
            <div style={{ flex: 1, position: "relative", height: 14 }}>
              {[25, 50, 75].map((g) => (
                <div key={g} style={{ position: "absolute", left: `${g}%`, top: -3, bottom: -3, width: 1, background: T.line }} />
              ))}
              <div style={{ position: "absolute", inset: 0, borderRadius: 999, background: c.bg, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: c.tx, borderRadius: 999, transition: "width .5s ease" }} />
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <div style={{ width: 116, flexShrink: 0 }} />
        <div style={{ flex: 1, position: "relative", height: 14, fontSize: 11, color: T.ink40 }}>
          {ticks.map((t) => (
            <span key={t} style={{ position: "absolute", left: `${t}%`, transform: tickShift(t) }}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ width: 116, flexShrink: 0 }} />
        <div style={{ flex: 1, textAlign: "center", fontSize: 11.5, color: T.ink40 }}>% complete</div>
      </div>
    </div>
  );
}

const INFO = [
  { key: "help", title: "What this helps with", items: [
    "Turns vague worry into small, noticeable steps you can see over time.",
    "Built around the Vineland's three adaptive areas — communication, daily living, socialization.",
    "A gentle daily habit, and something concrete to show a therapist or doctor.",
  ]},
  { key: "cant", title: "What it can't do", items: [
    "It isn't a diagnosis, and it isn't the real Vineland — that's a professional, normed assessment.",
    "It's based on your view at home, which is one setting and naturally subjective.",
    "Points reward consistent observing, not your child's score — never change what you see to earn them.",
  ]},
];

function InfoAccordion() {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ marginTop: 20 }}>
      {INFO.map((s) => {
        const isOpen = open === s.key;
        return (
          <div key={s.key} style={{ background: T.card, border: `1px solid ${isOpen ? T.lineStrong : T.line}`, borderRadius: 12, marginBottom: 8, overflow: "hidden" }}>
            <button onClick={() => setOpen(isOpen ? null : s.key)} aria-expanded={isOpen} style={{ width: "100%", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "transparent", border: "none", padding: "8px 13px", cursor: "pointer", fontFamily: T.body, textAlign: "left" }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: isOpen ? T.accent : T.ink }}>{s.title}</span>
              <span style={{ color: isOpen ? T.accent : T.ink40, fontSize: 14, lineHeight: 1, flexShrink: 0, width: 14, textAlign: "center" }}>{isOpen ? "–" : "+"}</span>
            </button>
            {isOpen && (
              <div className="b-cat-body" style={{ padding: "0 13px 12px" }}>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {s.items.map((t, i) => (
                    <li key={i} style={{ fontSize: 12.5, color: T.ink55, lineHeight: 1.6, marginBottom: 7, paddingLeft: 14, position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, top: 0, color: T.ink28 }}>·</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
      <p style={{ fontSize: 11, color: T.ink40, lineHeight: 1.5, marginTop: 6, padding: "0 2px" }}>
        If you have concerns about {CHILD.name}'s development, a qualified clinician can offer a proper assessment.
        Questions are original items inspired by the Vineland domain structure, not the Vineland test itself.
      </p>
    </div>
  );
}

/* ==================================================================
   REDEEM — points catalogue
   ================================================================== */
function Redeem({ points, claimed, onRedeem, onClose }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="b-safe-top" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: T.card, borderBottom: `1px solid ${T.line}`, position: "sticky", top: 0, zIndex: 5 }}>
        <button onClick={onClose} className="b-icontap" aria-label="Back"><Icon name="back" size={22} w={2} color={T.accent} /></button>
        <div style={{ fontWeight: 600, fontSize: 17 }}>Redeem points</div>
      </div>

      <div style={{ maxWidth: 560, width: "100%", margin: "0 auto", padding: "18px 18px 30px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <IconChip name="coin" bg={T.tintBg} fg={T.tintTx} size={40} />
          <div>
            <div style={{ fontFamily: T.title, fontWeight: 600, fontSize: 22, lineHeight: 1.1 }}>{points.toLocaleString()} points</div>
            <div style={{ fontSize: 12.5, color: T.ink55 }}>earned so far</div>
          </div>
        </div>
        <p style={{ fontSize: 12.5, color: T.ink40, lineHeight: 1.5, margin: "8px 2px 18px" }}>
          Points come from observing consistently. Reach a reward's total to unlock it — redeeming doesn't spend your points.
        </p>

        {REWARDS.map((r) => {
          const code = claimed[r.id];
          const afford = points >= r.cost;
          return (
            <div key={r.id} style={{ background: T.card, border: `1px solid ${code ? T.tintBg : T.line}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <IconChip name="gift" bg={T.tintBg} fg={T.tintTx} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: T.title, fontWeight: 600, fontSize: 16 }}>{r.title}</span>
                    {r.popular && (
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: T.tintTx, background: T.tintBg, padding: "3px 8px", borderRadius: 999 }}>Most popular</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: T.ink55, marginTop: 3, lineHeight: 1.45 }}>{r.detail}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.ink70 }}>{r.cost.toLocaleString()} points</span>
                {code ? (
                  <span style={{ fontSize: 12.5, color: T.tintTx, fontWeight: 600 }}>
                    Redeemed · <span style={{ fontFamily: T.mono, color: T.ink }}>{code}</span>
                  </span>
                ) : afford ? (
                  <button onClick={() => onRedeem(r)} className="b-primary" style={{ padding: "10px 18px", fontSize: 14 }}>Redeem</button>
                ) : (
                  <span style={{ fontSize: 12.5, color: T.ink40 }}>Need {(r.cost - points).toLocaleString()} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==================================================================
   QUIZ — section by section, one question per screen, 5-min cap
   ================================================================== */
function Quiz({ cat, onDone, onClose }) {
  const flat = useMemo(() => {
    const out = [];
    cat.sections.forEach((s) => s.items.forEach((it) => out.push({ ...it, section: s.name })));
    return out;
  }, [cat]);

  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const cur = flat[i];
  const isNewSection = i === 0 || flat[i - 1].section !== cur.section;
  const sectionNo = cat.sections.findIndex((s) => s.name === cur.section) + 1;

  const answer = (a) => {
    const next = { ...answers, [i]: a.key };
    setAnswers(next);
    setTimeout(() => {
      if (i + 1 < flat.length) setI(i + 1);
      else {
        const today = new Date().toISOString().slice(0, 10);
        const obs = [];
        flat.forEach((q, idx) => {
          const ans = ANSWERS.find((x) => x.key === next[idx]);
          if (ans && ans.v !== null) obs.push({ date: today, category: cat.key, section: q.section, skill: q.q, score: ans.v });
        });
        onDone(obs.length * POINTS_PER_OBSERVATION, obs);   // points + the observations
      }
    }, 180);
  };
  const back = () => (i === 0 ? onClose() : setI(i - 1));
  const pct = Math.round((i / flat.length) * 100);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="b-safe-top" style={{ padding: "14px 18px 10px", background: T.canvas }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <button onClick={back} className="b-icontap" aria-label="Back"><Icon name="back" size={22} w={2} color={T.accent} /></button>
          <div style={{ flex: 1, height: 7, borderRadius: 999, background: cat.bg, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: cat.tx, borderRadius: 999, transition: "width .3s ease" }} />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: T.ink40, minWidth: 40, textAlign: "right" }}>{i + 1}/{flat.length}</span>
        </div>
      </div>

      <div style={{ maxWidth: 560, width: "100%", margin: "0 auto", padding: "8px 22px 30px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, marginBottom: 18 }}>
          <IconChip name={cat.icon} bg={cat.bg} fg={cat.tx} size={26} radius={8} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: cat.tx, letterSpacing: "0.03em", textTransform: "uppercase" }}>
            {cat.name} · {cur.section}
          </span>
          <span style={{ fontSize: 11.5, color: T.ink40, marginLeft: "auto" }}>Section {sectionNo} of {cat.sections.length}</span>
        </div>

        {isNewSection && i !== 0 && (
          <div style={{ background: cat.bg, borderRadius: 12, padding: "9px 13px", marginBottom: 16, fontSize: 12.5, color: cat.tx, fontWeight: 500 }}>
            New section: {cur.section}
          </div>
        )}

        <div style={{ fontFamily: T.title, fontWeight: 600, fontSize: 25, lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: 10 }}>
          {cur.q}?
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 12, padding: "12px 14px", fontSize: 13.5, color: T.ink55, lineHeight: 1.5, marginBottom: 24 }}>
          <b style={{ color: T.ink70, fontWeight: 600 }}>For example:</b> {cur.ex}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto" }}>
          {ANSWERS.map((a) => {
            const on = answers[i] === a.key;
            const muted = a.v === null;
            return (
              <button key={a.key} onClick={() => answer(a)} className="b-ans" style={{
                border: `1.5px solid ${on ? cat.tx : T.lineStrong}`,
                background: on ? cat.bg : T.card,
              }}>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 15.5, fontWeight: 600, color: muted ? T.ink55 : on ? cat.tx : T.ink }}>{a.label}</div>
                  <div style={{ fontSize: 12, color: T.ink40, marginTop: 1 }}>{a.sub}</div>
                </div>
                <span style={{ width: 24, height: 24, borderRadius: 999, flexShrink: 0, border: `2px solid ${on ? cat.tx : T.lineStrong}`, background: on ? cat.tx : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {on && <Icon name="check" size={13} w={2.4} color="#fff" />}
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ textAlign: "center", fontSize: 11.5, color: T.ink40, marginTop: 16 }}>
          Only what you actually see earns points. “No chance to see” is always fine.
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   FEEDBACK FORM — iOS / Android friendly
   ================================================================== */
function Feedback({ onClose }) {
  const [sent, setSent] = useState(false);
  const [rating, setRating] = useState(0);
  const [topic, setTopic] = useState(null);
  const [msg, setMsg] = useState("");
  const [email, setEmail] = useState("");
  const TOPICS = ["The questions", "Points & rewards", "Redeeming", "Something else"];
  const FACES = [{ m: -2, l: "Bad" }, { m: -1, l: "Meh" }, { m: 0, l: "Okay" }, { m: 1, l: "Good" }, { m: 2, l: "Love it" }];
  const canSend = rating > 0 || msg.trim();

  if (sent) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30, textAlign: "center" }}>
        <span style={{ marginBottom: 14 }}><Icon name="heart" size={46} w={1.6} color={T.accent} /></span>
        <div style={{ fontFamily: T.title, fontWeight: 600, fontSize: 24, marginBottom: 8 }}>Thank you</div>
        <div style={{ fontSize: 14.5, color: T.ink55, lineHeight: 1.5, maxWidth: 300, marginBottom: 26 }}>
          Your note goes straight to the team building this. It genuinely shapes what comes next.
        </div>
        <button onClick={onClose} className="b-primary" style={{ paddingLeft: 30, paddingRight: 30 }}>Back to development</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="b-safe-top" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: T.card, borderBottom: `1px solid ${T.line}`, position: "sticky", top: 0, zIndex: 5 }}>
        <button onClick={onClose} className="b-icontap" aria-label="Close"><Icon name="back" size={22} w={2} color={T.accent} /></button>
        <div style={{ fontWeight: 600, fontSize: 17 }}>Share feedback</div>
      </div>

      <div style={{ maxWidth: 560, width: "100%", margin: "0 auto", padding: "20px 20px 30px", flex: 1 }}>
        <h1 style={{ fontFamily: T.title, fontWeight: 600, fontSize: 24, lineHeight: 1.1, margin: "2px 0 6px" }}>
          How's the development tracker working for you?
        </h1>
        <p style={{ fontSize: 13.5, color: T.ink55, lineHeight: 1.5, margin: "0 0 22px" }}>
          A minute of honesty helps more than you'd think.
        </p>

        <FieldLabel>Overall</FieldLabel>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 6, marginBottom: 22 }}>
          {FACES.map((f) => {
            const on = rating === f.m + 3;
            return (
              <button key={f.l} onClick={() => setRating(f.m + 3)} className="b-face" style={{ border: `1.5px solid ${on ? T.accent : T.lineStrong}`, background: on ? T.tintBg : T.card, transform: on ? "translateY(-2px)" : "none" }}>
                <FaceIcon mood={f.m} size={26} color={on ? T.accentPress : T.ink40} />
                <span style={{ fontSize: 10.5, color: on ? T.accentPress : T.ink40, fontWeight: on ? 600 : 400, marginTop: 4 }}>{f.l}</span>
              </button>
            );
          })}
        </div>

        <FieldLabel>What's this about?</FieldLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
          {TOPICS.map((t) => {
            const on = topic === t;
            return (
              <button key={t} onClick={() => setTopic(on ? null : t)} style={{ fontSize: 13.5, fontWeight: on ? 600 : 400, padding: "9px 15px", borderRadius: 999, cursor: "pointer", border: `1.5px solid ${on ? T.accent : T.lineStrong}`, background: on ? T.tintBg : T.card, color: on ? T.accentPress : T.ink70, fontFamily: T.body }}>{t}</button>
            );
          })}
        </div>

        <FieldLabel>Tell us more</FieldLabel>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} placeholder="What worked, what felt off, what you wish it did…" className="b-input" style={{ resize: "vertical", minHeight: 96, marginBottom: 18 }} />

        <FieldLabel>Email <span style={{ color: T.ink40, fontWeight: 400 }}>(optional — only if you'd like a reply)</span></FieldLabel>
        <input type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="b-input" style={{ marginBottom: 4 }} />
      </div>

      <div className="b-safe-bottom" style={{ position: "sticky", bottom: 0, background: T.canvas, borderTop: `1px solid ${T.line}`, padding: "12px 20px", maxWidth: 560, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        <button onClick={() => canSend && setSent(true)} disabled={!canSend} className="b-primary" style={{ width: "100%", background: canSend ? T.accent : "#CBD6D3", cursor: canSend ? "pointer" : "not-allowed" }}>
          Send feedback
        </button>
      </div>
    </div>
  );
}

/* ==================================================================
   PROGRESS OVER TIME — week / month / year
   ================================================================== */
const PERIODS = [
  { key: "week",  label: "Week",  days: 7,   buckets: 7 },
  { key: "month", label: "Month", days: 30,  buckets: 5 },
  { key: "year",  label: "Year",  days: 365, buckets: 12 },
];

function scoreWord(avg) {
  if (avg == null) return "no observations yet";
  if (avg < 0.67) return "mostly not yet";
  if (avg < 1.34) return "mostly sometimes";
  return "mostly usually";
}

function Progress({ observations, onClose, onLoadSample }) {
  const [period, setPeriod] = useState("month");
  const P = PERIODS.find((p) => p.key === period);
  const DAY = 86400000;
  const now = Date.now();
  const start = now - P.days * DAY;
  const prevStart = start - P.days * DAY;
  const at = (o) => new Date(o.date).getTime();

  const inWin = observations.filter((o) => at(o) >= start);
  const prevWin = observations.filter((o) => at(o) >= prevStart && at(o) < start);
  const daysObserved = new Set(inWin.map((o) => o.date)).size;

  const cats = CATS.map((c) => {
    const mine = inWin.filter((o) => o.category === c.key);
    const prevMine = prevWin.filter((o) => o.category === c.key);
    const mean = (arr) => (arr.length ? arr.reduce((s, o) => s + o.score, 0) / arr.length : null);
    const buckets = Array.from({ length: P.buckets }, (_, b) => {
      const bStart = start + (b * P.days / P.buckets) * DAY;
      const bEnd = start + ((b + 1) * P.days / P.buckets) * DAY;
      return mean(mine.filter((o) => at(o) >= bStart && at(o) < bEnd));
    });
    return { c, avg: mean(mine), prevAvg: mean(prevMine), buckets };
  });

  // skills newly reaching "usually" (score 2) within the window
  const bestBefore = {};
  observations.filter((o) => at(o) < start).forEach((o) => {
    bestBefore[o.skill] = Math.max(bestBefore[o.skill] ?? -1, o.score);
  });
  const gained = [...new Set(inWin.filter((o) => o.score === 2 && (bestBefore[o.skill] ?? -1) < 2).map((o) => o.skill))];

  const empty = observations.length === 0;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="b-safe-top" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: T.card, borderBottom: `1px solid ${T.line}`, position: "sticky", top: 0, zIndex: 5 }}>
        <button onClick={onClose} className="b-icontap" aria-label="Back"><Icon name="back" size={22} w={2} color={T.accent} /></button>
        <div style={{ fontWeight: 600, fontSize: 17 }}>Progress over time</div>
      </div>

      <div style={{ maxWidth: 560, width: "100%", margin: "0 auto", padding: "16px 18px 30px", flex: 1 }}>
        <div style={{ display: "flex", gap: 5, background: T.card, border: `1px solid ${T.line}`, borderRadius: 12, padding: 4, marginBottom: 18 }}>
          {PERIODS.map((p) => {
            const on = period === p.key;
            return (
              <button key={p.key} onClick={() => setPeriod(p.key)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: T.body, fontWeight: 600, fontSize: 13.5, background: on ? T.accent : "transparent", color: on ? "#fff" : T.ink55 }}>{p.label}</button>
            );
          })}
        </div>

        {empty ? (
          <div style={{ background: T.card, border: `1px dashed ${T.lineStrong}`, borderRadius: 16, padding: "28px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: T.title, fontWeight: 600, fontSize: 18, marginBottom: 6 }}>No history yet</div>
            <div style={{ fontSize: 13.5, color: T.ink55, lineHeight: 1.5, marginBottom: 16 }}>
              Each time you observe, the answers are dated and saved here. Come back weekly to watch the trends build.
            </div>
            <button onClick={onLoadSample} className="b-outline" style={{ width: "auto", padding: "10px 18px" }}>Load sample history (preview)</button>
          </div>
        ) : (
          <>
            <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: T.ink55, lineHeight: 1.6 }}>
                In the last {P.label.toLowerCase()}, you observed on <b style={{ color: T.ink }}>{daysObserved} day{daysObserved === 1 ? "" : "s"}</b>
                {gained.length > 0 ? <> and <b style={{ color: T.ink }}>{gained.length} skill{gained.length === 1 ? "" : "s"}</b> reached “usually”.</> : "."}
              </div>
            </div>

            {cats.map(({ c, avg, prevAvg, buckets }) => (
              <div key={c.key} style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 16, padding: 15, marginBottom: 11 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <IconChip name={c.icon} bg={c.bg} fg={c.tx} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: T.ink }}>{c.name}</div>
                    <div style={{ fontSize: 12.5, color: T.ink55, marginTop: 1 }}>{scoreWord(avg)}</div>
                  </div>
                  <Delta now={avg} prev={prevAvg} />
                </div>
                <TrendLine buckets={buckets} color={c.tx} track={c.bg} />
              </div>
            ))}

            {gained.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.ink70, marginBottom: 8 }}>Skills reaching “usually”</div>
                {gained.map((s) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, background: T.card, border: `1px solid ${T.line}`, borderRadius: 12, padding: "11px 13px", marginBottom: 8 }}>
                    <span style={{ color: T.accent, flexShrink: 0, display: "flex" }}><Icon name="check" size={16} w={2.2} /></span>
                    <span style={{ fontSize: 13.5, color: T.ink }}>{s}</span>
                  </div>
                ))}
              </div>
            )}

            <p style={{ fontSize: 11, color: T.ink40, lineHeight: 1.5, marginTop: 14 }}>
              Development moves slowly — a flat or quiet {period === "week" ? "week" : "period"} is normal, not a step back. Gaps mean fewer observations, not a drop. This is {CHILD.name}'s own path over time, not a score to beat.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Delta({ now, prev }) {
  if (now == null) return null;
  if (prev == null) return <span style={{ fontSize: 11.5, color: T.ink40, flexShrink: 0 }}>new</span>;
  const d = now - prev;
  const flat = Math.abs(d) < 0.12;
  const up = d > 0;
  const color = flat ? T.ink40 : up ? T.accent : T.ink55;
  return <span style={{ fontSize: 12, fontWeight: 600, color, flexShrink: 0 }}>{flat ? "→ steady" : up ? "↑ up" : "↓ down"}</span>;
}

function TrendLine({ buckets, color, track }) {
  const w = 300, h = 42, padY = 6;
  const n = buckets.length;
  const xOf = (i) => (n === 1 ? w / 2 : (i * w) / (n - 1));
  const yOf = (v) => padY + (1 - v / 2) * (h - 2 * padY);
  const pts = buckets.map((v, i) => (v == null ? null : { x: xOf(i), y: yOf(v) })).filter(Boolean);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ display: "block", marginTop: 10 }}>
      <line x1="0" y1={yOf(1)} x2={w} y2={yOf(1)} stroke={track} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      {pts.length > 1 && <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3.2" fill={color} vectorEffect="non-scaling-stroke" />)}
    </svg>
  );
}

/* preview-only: fabricate ~10 months of dated observations that trend upward */
function makeSampleHistory() {
  const out = [];
  const DAY = 86400000;
  const now = Date.now();
  const span = 300;
  CATS.forEach((c, ci) => {
    c.sections.forEach((s) => s.items.forEach((it, si) => {
      const offset = ((ci + si) % 5) * 0.05;
      for (let d = span; d >= 0; d -= 12 + ((ci + si) % 4)) {
        const prog = 1 - d / span;                                   // 0 -> 1 over time
        const noise = Math.sin((d + ci * 7 + si * 3) * 1.3) * 0.5;
        const score = Math.round(Math.min(2, Math.max(0, (prog + offset) * 2 - 0.4 + noise)));
        out.push({ date: new Date(now - d * DAY).toISOString().slice(0, 10), category: c.key, section: s.name, skill: it.q, score });
      }
    }));
  });
  return out;
}

/* ---------- shared bits ---------- */
function FieldLabel({ children }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: T.ink70, marginBottom: 9 }}>{children}</div>;
}

const CSS = `
  * { -webkit-tap-highlight-color: transparent; }
  .b-safe-top { padding-top: max(14px, env(safe-area-inset-top)); }
  .b-safe-bottom { padding-bottom: max(12px, env(safe-area-inset-bottom)); }
  .b-input {
    width: 100%; box-sizing: border-box; font-family: ${T.body}; font-size: 15.5px; color: ${T.ink};
    background: ${T.card}; border: 1px solid ${T.lineStrong}; border-radius: 12px; padding: 14px 15px;
    outline: none; -webkit-appearance: none; transition: border-color .15s, box-shadow .15s;
  }
  .b-input:focus { border-color: ${T.accent}; box-shadow: 0 0 0 4px ${T.focus}; }
  .b-input::placeholder { color: ${T.ink40}; }
  .b-primary {
    background: ${T.accent}; color: #fff; font-family: ${T.body}; font-weight: 600; font-size: 16px;
    padding: 16px 24px; border-radius: 14px; border: none; cursor: pointer;
  }
  .b-primary:active { transform: translateY(1px); }
  .b-outline {
    width: 100%; box-sizing: border-box; background: transparent; color: ${T.accent};
    font-family: ${T.body}; font-weight: 600; font-size: 14.5px; padding: 14px; border-radius: 14px;
    border: 1px solid ${T.lineStrong}; cursor: pointer;
  }
  .b-cat-wrap {
    background: ${T.card}; border: 1px solid ${T.line}; border-radius: 16px; margin-bottom: 11px; overflow: hidden;
    transition: border-color .12s;
  }
  .b-cat-wrap:hover { border-color: ${T.lineStrong}; }
  .b-cat-head {
    width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between;
    gap: 12px; background: transparent; border: none; padding: 14px 15px; cursor: pointer; font-family: ${T.body};
  }
  .b-chev { display: flex; transition: transform .2s ease; }
  .b-chev.open { transform: rotate(90deg); }
  .b-cat-body { padding: 2px 15px 15px; animation: bExpand .2s ease; }
  @keyframes bExpand { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
  .b-ans {
    width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between;
    gap: 12px; border-radius: 15px; padding: 15px 16px; cursor: pointer; font-family: ${T.body};
    transition: transform .1s ease, border-color .12s, background .12s;
  }
  .b-ans:active { transform: scale(.99); }
  .b-face {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 12px 4px; border-radius: 14px; cursor: pointer; font-family: ${T.body};
    transition: transform .12s ease, background .12s, border-color .12s;
  }
  .b-icontap {
    width: 38px; height: 38px; border-radius: 999px; border: none; background: ${T.tintBg};
    cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  }
`;

/* ---------- helpers ---------- */
function todayLabel() {
  return new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
}
function estMin(n) { return Math.max(1, Math.round((n * 12) / 60)); }
