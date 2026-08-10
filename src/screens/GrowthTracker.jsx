import { useState, useMemo } from "react";
import { T } from "../theme";
import { SectionLabel, Card, Badge, Btn, Accordion } from "../ui";
import { useBackHandler } from "../hooks";

/* ==================================================================
   Growth Tracker — a Vineland-inspired observation tracker, shown as
   a tab inside MyChildScreen (always scoped to the active child).
   Observing earns points into a single balance ("no chance to see"
   earns nothing); points redeem for Bonda subscription discounts.
   This is an informal tracker, NOT the real Vineland (a proprietary,
   professionally-administered instrument) — questions are original
   items inspired by its domain structure. Points reward observing
   consistently, not the child scoring higher.
   ================================================================== */

const fontMono = "'Fraunces', Georgia, serif";

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
const HEADLINE_TARGET = 10000;

const REWARDS = [
  { id: "off5",  title: "5% off Bonda",          cost: 5000,  detail: "Applied to your next subscription payment." },
  { id: "off10", title: "10% off Bonda",         cost: 10000, detail: "Applied to your next subscription payment.", popular: true },
  { id: "free1", title: "1 month of Bonda free", cost: 20000, detail: "Added to your subscription as a free month." },
];

const PERIODS = [
  { key: "week",  label: "Week",  days: 7,   buckets: 7 },
  { key: "month", label: "Month", days: 30,  buckets: 5 },
  { key: "year",  label: "Year",  days: 365, buckets: 12 },
];

function estMin(n) { return Math.max(1, Math.round((n * 12) / 60)); }
function scoreWord(avg) {
  if (avg == null) return "no observations yet";
  if (avg < 0.67) return "mostly not yet";
  if (avg < 1.34) return "mostly sometimes";
  return "mostly usually";
}

function Icon({ name, size = 20, color = "currentColor", w = 1.8 }) {
  const p = { fill: "none", stroke: color, strokeWidth: w, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    chat: <><rect x="4.5" y="4.5" width="15" height="13" rx="3" {...p} /><path d="M9 17.5v3l4-3" {...p} /></>,
    home: <><path d="M4 11 12 4l8 7" {...p} /><path d="M6 10.5V19h12v-8.5" {...p} /></>,
    users: <><circle cx="9" cy="8" r="3.3" {...p} /><path d="M3.2 20c0-3.2 2.6-5 5.8-5s5.8 1.8 5.8 5" {...p} /><path d="M16 5.4a3.3 3.3 0 0 1 0 6.1M17.6 15.4c1.8.7 3.2 2.2 3.2 4.6" {...p} /></>,
    gift: <><rect x="4" y="10" width="16" height="9" rx="1.6" {...p} /><path d="M4 13.5h16M12 10v9" {...p} /><path d="M12 10c-1.2-2.6-5-2.6-5-.4 0 1.5 2.6 1.4 5 .4zM12 10c1.2-2.6 5-2.6 5-.4 0 1.5-2.6 1.4-5 .4z" {...p} /></>,
    coin: <><circle cx="12" cy="12" r="8.5" {...p} /><circle cx="12" cy="12" r="4.5" {...p} /></>,
    check: <path d="M4 12l5 5L20 6" {...p} />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>{paths[name]}</svg>;
}

function CatIcon({ cat, size = 40 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 10, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon name={cat.icon} size={Math.round(size * 0.5)} color={cat.tx} />
    </div>
  );
}

function Donut({ value, target, size = 104 }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / target));
  const dash = c * pct;
  const m = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={m} cy={m} r={r} fill="none" stroke={T.purpleL} strokeWidth={stroke} />
      <circle cx={m} cy={m} r={r} fill="none" stroke={T.purple} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`} transform={`rotate(-90 ${m} ${m})`} />
      <text x={m} y={m - 2} textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 17, fill: T.ink }}>{value.toLocaleString()}</text>
      <text x={m} y={m + 15} textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: T.fontBody, fontSize: 10, fill: T.inkSoft }}>points</text>
    </svg>
  );
}

const backBtnStyle = { background: "none", border: "none", color: T.purple, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody, padding: "0 0 16px", display: "flex", alignItems: "center", gap: 6 };

export function GrowthTrackerSection({ activeChild, updateChild }) {
  const [view, setView] = useState("home"); // home | quiz | redeem | progress
  const [quizCat, setQuizCat] = useState(null);

  useBackHandler(view !== "home", () => setView("home"));

  const observations = activeChild.growthObservations || [];
  const claimed = activeChild.growthClaims || {};
  const earned = useMemo(() => {
    const e = {};
    CATS.forEach(c => { e[c.key] = observations.filter(o => o.category === c.key).length * POINTS_PER_OBSERVATION; });
    return e;
  }, [observations]);
  const total = CATS.reduce((n, c) => n + (earned[c.key] || 0), 0);

  const logObservations = (obs) => updateChild(activeChild.id, { growthObservations: [...obs, ...observations] });
  const redeem = (r) => {
    if (total < r.cost || claimed[r.id]) return;
    const code = "BONDA-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    updateChild(activeChild.id, { growthClaims: { ...claimed, [r.id]: code } });
  };

  if (view === "quiz") {
    return <Quiz cat={quizCat} onDone={(obs) => { logObservations(obs); setView("home"); }} onClose={() => setView("home")} />;
  }
  if (view === "redeem") {
    return <Redeem points={total} claimed={claimed} onRedeem={redeem} onClose={() => setView("home")} />;
  }
  if (view === "progress") {
    return <Progress observations={observations} childName={activeChild.name} onClose={() => setView("home")} />;
  }

  return (
    <Home
      childName={activeChild.name}
      earned={earned}
      total={total}
      onStartQuiz={(c) => { setQuizCat(c); setView("quiz"); }}
      onRedeem={() => setView("redeem")}
      onProgress={() => setView("progress")}
    />
  );
}

/* ==================================================================
   HOME
   ================================================================== */
function Home({ childName, earned, total, onStartQuiz, onRedeem, onProgress }) {
  const [open, setOpen] = useState(null);
  const remaining = Math.max(0, HEADLINE_TARGET - total);

  return (
    <>
      <p style={{ margin: "0 0 20px", color: T.inkSoft, fontSize: 13, lineHeight: 1.6 }}>A few minutes of noticing {childName}'s everyday skills — every observation earns points toward a reward.</p>

      <Card style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <Donut value={total} target={HEADLINE_TARGET} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 16, color: T.ink }}>Redeem your points</p>
          <p style={{ margin: "4px 0 12px", fontSize: 12.5, color: T.inkSoft, lineHeight: 1.5 }}>
            {remaining === 0 ? "You've reached 10% off Bonda." : `${remaining.toLocaleString()} points to 10% off Bonda.`}
          </p>
          <Btn onClick={onRedeem}>Redeem</Btn>
        </div>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4, gap: 10 }}>
          <p style={{ margin: 0, fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 16, color: T.ink }}>Milestone progress</p>
          <button onClick={onProgress} style={{ background: "none", border: "none", color: T.purple, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: T.fontBody, padding: 0, flexShrink: 0 }}>Over time ›</button>
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: T.inkMuted }}>How each area is progressing toward the reward</p>
        {CATS.map(c => {
          const pct = Math.min(100, ((earned[c.key] || 0) / HEADLINE_TARGET) * 100);
          return (
            <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 106, flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name={c.icon} size={15} color={c.tx} />
                <span style={{ fontSize: 12.5, color: T.ink }}>{c.name}</span>
              </div>
              <div style={{ flex: 1, height: 12, borderRadius: 99, background: c.bg, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: c.tx, borderRadius: 99, transition: "width .5s ease" }} />
              </div>
            </div>
          );
        })}
      </Card>

      <SectionLabel>Today's observations</SectionLabel>
      <p style={{ margin: "-6px 0 14px", color: T.inkSoft, fontSize: 13, lineHeight: 1.6 }}>Answer a few quick questions about what you've seen {childName} do.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 8 }}>
        {CATS.map(c => {
          const totalQ = c.sections.reduce((n, s) => n + s.items.length, 0);
          const isOpen = open === c.key;
          return (
            <Card key={c.key} style={{ padding: 0, overflow: "hidden" }}>
              <div onClick={() => setOpen(isOpen ? null : c.key)} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: isOpen ? c.bg : T.surface }}>
                <CatIcon cat={c} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: T.ink, fontSize: 14 }}>{c.name}</p>
                  <p style={{ margin: "2px 0 0", color: T.inkMuted, fontSize: 11.5 }}>{totalQ} quick questions · about {estMin(totalQ)} min</p>
                </div>
                <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 20, transform: isOpen ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block" }}>+</span>
              </div>
              {isOpen && (
                <div style={{ padding: "0 16px 16px" }}>
                  <p style={{ margin: "0 0 12px", color: T.inkSoft, fontSize: 12.5, lineHeight: 1.6 }}>{c.blurb}</p>
                  <Btn onClick={() => onStartQuiz(c)} full>Start observing</Btn>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div style={{ marginTop: 20 }}>
        <Accordion icon="💡" title="What this helps with">
          <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
            <li>Turns vague worry into small, noticeable steps you can see over time.</li>
            <li>Built around the Vineland's three adaptive areas — communication, daily living, socialization.</li>
            <li>A gentle daily habit, and something concrete to show a therapist or doctor.</li>
          </ul>
        </Accordion>
        <Accordion icon="⚠️" title="What it can't do">
          <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
            <li>It isn't a diagnosis, and it isn't the real Vineland — that's a professional, normed assessment.</li>
            <li>It's based on your view at home, which is one setting and naturally subjective.</li>
            <li>Points reward consistent observing, not your child's score — never change what you see to earn them.</li>
          </ul>
        </Accordion>
        <p style={{ fontSize: 11, color: T.inkMuted, lineHeight: 1.5, marginTop: 6 }}>
          If you have concerns about {childName}'s development, a qualified clinician can offer a proper assessment. Questions are original items inspired by the Vineland domain structure, not the Vineland test itself.
        </p>
      </div>
    </>
  );
}

/* ==================================================================
   REDEEM — points catalogue
   ================================================================== */
function Redeem({ points, claimed, onRedeem, onClose }) {
  return (
    <>
      <button onClick={onClose} style={backBtnStyle}>← Back</button>
      <h3 style={{ margin: "0 0 16px", color: T.ink, fontSize: 18, fontWeight: 800 }}>Redeem points</h3>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: T.purpleL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="coin" size={20} color={T.purple} />
        </div>
        <div>
          <p style={{ margin: 0, fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 20, color: T.ink }}>{points.toLocaleString()} points</p>
          <p style={{ margin: 0, fontSize: 12, color: T.inkSoft }}>earned so far</p>
        </div>
      </div>
      <p style={{ fontSize: 12, color: T.inkMuted, lineHeight: 1.5, margin: "8px 0 20px" }}>
        Points come from observing consistently. Reach a reward's total to unlock it — redeeming doesn't spend your points.
      </p>

      {REWARDS.map(r => {
        const code = claimed[r.id];
        const afford = points >= r.cost;
        return (
          <Card key={r.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: T.purpleL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="gift" size={20} color={T.purple} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 15, color: T.ink }}>{r.title}</span>
                  {r.popular && <Badge>Most popular</Badge>}
                </div>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: T.inkSoft, lineHeight: 1.5 }}>{r.detail}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 14 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: T.inkSoft }}>{r.cost.toLocaleString()} points</span>
              {code ? (
                <span style={{ fontSize: 12, color: T.green, fontWeight: 700 }}>Redeemed · <span style={{ fontFamily: fontMono, color: T.ink }}>{code}</span></span>
              ) : afford ? (
                <Btn onClick={() => onRedeem(r)}>Redeem</Btn>
              ) : (
                <span style={{ fontSize: 12, color: T.inkMuted }}>Need {(r.cost - points).toLocaleString()} more</span>
              )}
            </div>
          </Card>
        );
      })}
    </>
  );
}

/* ==================================================================
   QUIZ — section by section, one question per screen
   ================================================================== */
function Quiz({ cat, onDone, onClose }) {
  const flat = useMemo(() => {
    const out = [];
    cat.sections.forEach(s => s.items.forEach(it => out.push({ ...it, section: s.name })));
    return out;
  }, [cat]);

  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const cur = flat[i];
  const sectionNo = cat.sections.findIndex(s => s.name === cur.section) + 1;

  const answer = (a) => {
    const next = { ...answers, [i]: a.key };
    setAnswers(next);
    setTimeout(() => {
      if (i + 1 < flat.length) { setI(i + 1); return; }
      const today = new Date().toISOString().slice(0, 10);
      const obs = [];
      flat.forEach((q, idx) => {
        const ans = ANSWERS.find(x => x.key === next[idx]);
        if (ans && ans.v !== null) obs.push({ date: today, category: cat.key, section: q.section, skill: q.q, score: ans.v });
      });
      onDone(obs);
    }, 180);
  };
  const back = () => (i === 0 ? onClose() : setI(i - 1));
  const pct = Math.round((i / flat.length) * 100);

  return (
    <>
      <button onClick={back} style={backBtnStyle}>← Back</button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ flex: 1, height: 7, borderRadius: 99, background: cat.bg, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: cat.tx, borderRadius: 99, transition: "width .3s ease" }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.inkMuted, flexShrink: 0 }}>{i + 1}/{flat.length}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 11.5, fontWeight: 800, color: cat.tx, letterSpacing: "0.04em", textTransform: "uppercase" }}>{cat.name} · {cur.section}</span>
        <span style={{ fontSize: 11, color: T.inkMuted, marginLeft: "auto", flexShrink: 0 }}>Section {sectionNo} of {cat.sections.length}</span>
      </div>

      <h3 style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 20, lineHeight: 1.25, color: T.ink, margin: "0 0 10px" }}>{cur.q}?</h3>
      <Card style={{ marginBottom: 22 }}>
        <p style={{ margin: 0, fontSize: 13, color: T.inkSoft, lineHeight: 1.6 }}><b style={{ color: T.ink }}>For example:</b> {cur.ex}</p>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ANSWERS.map(a => {
          const on = answers[i] === a.key;
          return (
            <button key={a.key} onClick={() => answer(a)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, textAlign: "left", borderRadius: T.r, padding: "15px 16px", cursor: "pointer", fontFamily: T.fontBody, border: `1.5px solid ${on ? cat.tx : T.border}`, background: on ? cat.bg : T.surface }}>
              <span>
                <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: on ? cat.tx : T.ink }}>{a.label}</span>
                <span style={{ display: "block", fontSize: 11.5, color: T.inkMuted, marginTop: 1 }}>{a.sub}</span>
              </span>
              <span style={{ width: 22, height: 22, borderRadius: 99, flexShrink: 0, border: `2px solid ${on ? cat.tx : T.border}`, background: on ? cat.tx : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {on && <Icon name="check" size={12} color="#fff" />}
              </span>
            </button>
          );
        })}
      </div>
      <p style={{ textAlign: "center", fontSize: 11.5, color: T.inkMuted, marginTop: 16 }}>Only what you actually see earns points. “No chance to see” is always fine.</p>
    </>
  );
}

/* ==================================================================
   PROGRESS OVER TIME — week / month / year
   ================================================================== */
function Progress({ observations, childName, onClose }) {
  const [period, setPeriod] = useState("month");
  const P = PERIODS.find(p => p.key === period);
  const DAY = 86400000;
  const now = Date.now();
  const start = now - P.days * DAY;
  const prevStart = start - P.days * DAY;
  const at = (o) => new Date(o.date).getTime();

  const inWin = observations.filter(o => at(o) >= start);
  const prevWin = observations.filter(o => at(o) >= prevStart && at(o) < start);
  const daysObserved = new Set(inWin.map(o => o.date)).size;

  const cats = CATS.map(c => {
    const mine = inWin.filter(o => o.category === c.key);
    const prevMine = prevWin.filter(o => o.category === c.key);
    const mean = (arr) => (arr.length ? arr.reduce((s, o) => s + o.score, 0) / arr.length : null);
    const buckets = Array.from({ length: P.buckets }, (_, b) => {
      const bStart = start + (b * P.days / P.buckets) * DAY;
      const bEnd = start + ((b + 1) * P.days / P.buckets) * DAY;
      return mean(mine.filter(o => at(o) >= bStart && at(o) < bEnd));
    });
    return { c, avg: mean(mine), prevAvg: mean(prevMine), buckets };
  });

  const bestBefore = {};
  observations.filter(o => at(o) < start).forEach(o => { bestBefore[o.skill] = Math.max(bestBefore[o.skill] ?? -1, o.score); });
  const gained = [...new Set(inWin.filter(o => o.score === 2 && (bestBefore[o.skill] ?? -1) < 2).map(o => o.skill))];

  const empty = observations.length === 0;

  return (
    <>
      <button onClick={onClose} style={backBtnStyle}>← Back</button>
      <h3 style={{ margin: "0 0 16px", color: T.ink, fontSize: 18, fontWeight: 800 }}>Progress over time</h3>

      <div style={{ display: "flex", gap: 5, background: T.border, borderRadius: T.r, padding: 3, marginBottom: 18 }}>
        {PERIODS.map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: T.fontBody, fontWeight: 700, fontSize: 13, background: period === p.key ? T.surface : "transparent", color: period === p.key ? T.ink : T.inkMuted, boxShadow: period === p.key ? T.shadow : "none", transition: "all 0.2s" }}>{p.label}</button>
        ))}
      </div>

      {empty ? (
        <Card style={{ padding: "28px 20px", textAlign: "center", border: `1px dashed ${T.border}` }}>
          <p style={{ margin: "0 0 6px", fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 17, color: T.ink }}>No history yet</p>
          <p style={{ margin: 0, fontSize: 13, color: T.inkSoft, lineHeight: 1.6 }}>Each time you observe, the answers are dated and saved here. Come back weekly to watch the trends build.</p>
        </Card>
      ) : (
        <>
          <Card style={{ marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: T.inkSoft, lineHeight: 1.6 }}>
              In the last {P.label.toLowerCase()}, you observed on <b style={{ color: T.ink }}>{daysObserved} day{daysObserved === 1 ? "" : "s"}</b>
              {gained.length > 0 ? <> and <b style={{ color: T.ink }}>{gained.length} skill{gained.length === 1 ? "" : "s"}</b> reached “usually”.</> : "."}
            </p>
          </Card>

          {cats.map(({ c, avg, prevAvg, buckets }) => (
            <Card key={c.key} style={{ marginBottom: 11 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <CatIcon cat={c} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: T.ink, fontSize: 14 }}>{c.name}</p>
                  <p style={{ margin: "1px 0 0", color: T.inkSoft, fontSize: 12 }}>{scoreWord(avg)}</p>
                </div>
                <Delta now={avg} prev={prevAvg} />
              </div>
              <TrendLine buckets={buckets} color={c.tx} track={c.bg} />
            </Card>
          ))}

          {gained.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: T.inkSoft, margin: "0 0 8px" }}>Skills reaching “usually”</p>
              {gained.map(s => (
                <Card key={s} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", marginBottom: 8 }}>
                  <span style={{ color: T.purple, flexShrink: 0, display: "flex" }}><Icon name="check" size={15} color={T.purple} /></span>
                  <span style={{ fontSize: 13, color: T.ink }}>{s}</span>
                </Card>
              ))}
            </div>
          )}

          <p style={{ fontSize: 11, color: T.inkMuted, lineHeight: 1.5, marginTop: 14 }}>
            Development moves slowly — a flat or quiet {period === "week" ? "week" : "period"} is normal, not a step back. Gaps mean fewer observations, not a drop. This is {childName}'s own path over time, not a score to beat.
          </p>
        </>
      )}
    </>
  );
}

function Delta({ now, prev }) {
  if (now == null) return null;
  if (prev == null) return <span style={{ fontSize: 11, color: T.inkMuted, flexShrink: 0 }}>new</span>;
  const d = now - prev;
  const flat = Math.abs(d) < 0.12;
  const up = d > 0;
  const color = flat ? T.inkMuted : up ? T.purple : T.inkSoft;
  return <span style={{ fontSize: 12, fontWeight: 700, color, flexShrink: 0 }}>{flat ? "→ steady" : up ? "↑ up" : "↓ down"}</span>;
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
