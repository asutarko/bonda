import React, { useState, useMemo } from "react";
import {
  Bed, Utensils, GraduationCap, Activity, Puzzle, Moon, Calendar,
  ChevronLeft, ChevronRight, ArrowLeft, Plus, X, Check, Minus,
  MoreHorizontal, Clock, CalendarOff, Lock, Waves, Sprout, Info,
  ExternalLink, Smile, BookOpen, Palette, Music, MessageCircle,
} from "lucide-react";

/* ---------- palette ---------- */
const C = {
  bg: "#F2F1ED",
  card: "#FFFFFF",
  ink: "#33302B",
  muted: "#948E84",
  line: "#E7E4DD",
  accent: "#5E63C4",
  accentBg: "#ECEDFA",
  sage: "#5F9E82",
  sageBg: "#E7F1EC",
  amber: "#C98A3A",
  amberBg: "#F6ECD8",
};

/* ---------- data ---------- */
const CHILD = "Ellie";
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const TODAY = startOfDay(new Date()); // real current date

const ESSENTIALS = [
  { id: "wake", name: "Wake", Icon: Bed, time: "7:00" },
  { id: "breakfast", name: "Breakfast", Icon: Utensils, time: "8:00" },
  { id: "school", name: "School", Icon: GraduationCap, time: "9:00–3:00", fromCalendar: true },
  { id: "exercise", name: "Exercise", Icon: Activity, time: "4:30" },
  { id: "activity", name: "One activity", Icon: Puzzle, time: "5:15" },
  { id: "dinner", name: "Dinner", Icon: Utensils, time: "6:00" },
  { id: "winddown", name: "Wind-down · sleep", Icon: Moon, time: "8:00" },
];

const ICON_CHOICES = [
  { key: "message", Icon: MessageCircle },
  { key: "book", Icon: BookOpen },
  { key: "swim", Icon: Waves },
  { key: "paint", Icon: Palette },
  { key: "music", Icon: Music },
];
const iconFor = (key) => (ICON_CHOICES.find((c) => c.key === key) || ICON_CHOICES[0]).Icon;

const key = (d) => d.toISOString().slice(0, 10);
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const fmtShort = (d) => `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
const parseMin = (t) => {
  const m = String(t).split(/[–-]/)[0].match(/(\d+):(\d+)/);
  if (!m) return 9999;
  let h = +m[1];
  if (h < 7) h += 12;
  return h * 60 + +m[2];
};

/* seed the days before today so the calendar shows a real rhythm, whenever it's run */
function seed(today) {
  const recs = {};
  for (let i = 1; i <= 45; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const k = key(d);
    const wknd = d.getDay() === 0 || d.getDay() === 6;
    if (wknd) { recs[k] = { completed: [], skipped: [], added: [], times: {} }; continue; } // rest day
    const completed = ESSENTIALS.map((e) => e.id);
    const skipped = [];
    if (i % 6 === 3) { completed.pop(); skipped.push("activity"); } // occasional miss
    recs[k] = { completed, skipped, added: [], times: {} };
  }
  // today starts as a clean to-do list
  recs[key(today)] = { completed: [], skipped: [], added: [], times: {} };
  return recs;
}

/* ---------- small UI atoms ---------- */
function Frame({ children }) {
  return (
    <div style={{ width: 360, maxWidth: "100%", background: C.card, borderRadius: 24, border: `1px solid ${C.line}`, overflow: "hidden", fontFamily: "'Nunito', system-ui, sans-serif", color: C.ink }}>
      {children}
    </div>
  );
}
function Chip({ children, bg, fg, border }) {
  return <span style={{ fontSize: 12, fontWeight: 600, color: fg, background: bg, border: border ? `1px solid ${border}` : "none", padding: "3px 9px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>{children}</span>;
}

/* ---------- main ---------- */
export default function RoutineApp() {
  const [recs, setRecs] = useState(() => seed(TODAY));
  const [view, setView] = useState({ type: "today" });
  const [monthCur, setMonthCur] = useState({ y: TODAY.getFullYear(), m: TODAY.getMonth() });
  const [menuFor, setMenuFor] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null); // {id, value}
  const [kid, setKid] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 1600); };

  const todayKey = key(TODAY);
  const rec = (k) => recs[k] || { completed: [], skipped: [], added: [], times: {} };

  const patch = (k, fn) => setRecs((r) => { const cur = { ...(r[k] || { completed: [], skipped: [], added: [], times: {} }) }; fn(cur); return { ...r, [k]: cur }; });

  const toggleDone = (k, id) => patch(k, (c) => {
    c.completed = c.completed.includes(id) ? c.completed.filter((x) => x !== id) : [...c.completed, id];
    c.skipped = c.skipped.filter((x) => x !== id);
  });
  const skipToday = (k, id) => { patch(k, (c) => { c.skipped = c.skipped.includes(id) ? c.skipped.filter((x) => x !== id) : [...c.skipped, id]; c.completed = c.completed.filter((x) => x !== id); }); setMenuFor(null); };
  const removeAdded = (k, id) => patch(k, (c) => { c.added = c.added.filter((a) => a.id !== id); });
  const saveTime = (k, id, val) => { patch(k, (c) => { c.times = { ...c.times, [id]: val }; }); setEditing(null); showToast("Time updated"); };

  /* build the ordered day list for a given date */
  const buildDay = (k) => {
    const r = rec(k);
    const items = ESSENTIALS.map((e) => ({ ...e, essential: true, time: r.times[e.id] || e.time }))
      .concat(r.added.map((a) => ({ ...a, Icon: iconFor(a.iconKey), essential: false, time: r.times[a.id] || a.time })));
    return items.map((it) => ({ ...it, done: r.completed.includes(it.id), skipped: r.skipped.includes(it.id) }))
      .sort((a, b) => parseMin(a.time) - parseMin(b.time));
  };

  /* status for a calendar cell */
  const dayStatus = (d) => {
    const r = recs[key(d)];
    if (!r) return "none";
    const active = ESSENTIALS.filter((e) => !r.skipped.includes(e.id));
    const done = active.filter((e) => r.completed.includes(e.id)).length;
    if (done === 0) return "rest";
    if (done >= active.length) return "full";
    return "partial";
  };

  const nextKidItem = useMemo(() => buildDay(todayKey).find((i) => !i.done && !i.skipped), [recs]);

  /* ---------- row ---------- */
  const Row = ({ it, k, interactive }) => {
    const { Icon } = it;
    const dot = it.skipped ? C.muted : it.done ? C.sage : C.line;
    return (
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 8px", background: it.fromCalendar ? C.bg : "transparent", borderRadius: 12, opacity: it.skipped ? 0.6 : 1 }}>
          <button onClick={() => interactive && !it.fromCalendar && toggleDone(k, it.id)}
            style={{ border: "none", background: "none", padding: 0, cursor: interactive && !it.fromCalendar ? "pointer" : "default", display: "flex" }} aria-label={it.done ? "Mark not done" : "Mark done"}>
            {it.skipped ? <Minus size={21} color={C.muted} />
              : it.done ? <span style={{ width: 21, height: 21, borderRadius: 999, background: C.sage, display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={14} color="#fff" strokeWidth={3} /></span>
              : <span style={{ width: 21, height: 21, borderRadius: 999, border: `2px solid ${dot}` }} />}
          </button>
          <Icon size={19} color={it.done || it.skipped ? C.muted : C.ink} />
          <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: it.done ? C.muted : C.ink, textDecoration: it.done ? "line-through" : "none" }}>
            {it.name}{!it.essential && <span style={{ fontWeight: 500, color: C.muted, fontSize: 12 }}> · added</span>}
          </span>

          {it.fromCalendar
            ? <Chip bg="transparent" fg={C.accent} border={C.line}>{it.time}<ExternalLink size={12} /></Chip>
            : it.skipped
              ? <Chip bg="transparent" fg={C.muted} border={C.line}>skipped</Chip>
              : <Chip bg="transparent" fg={C.accent} border={C.line}><Clock size={12} />{it.time}</Chip>}

          {interactive && (it.essential
            ? !it.fromCalendar && <button onClick={() => setMenuFor(menuFor === it.id ? null : it.id)} style={{ border: "none", background: "none", cursor: "pointer", padding: 2, display: "flex" }} aria-label="Options"><MoreHorizontal size={18} color={C.muted} /></button>
            : <button onClick={() => removeAdded(k, it.id)} style={{ border: "none", background: "none", cursor: "pointer", padding: 2, display: "flex" }} aria-label="Remove"><X size={17} color={C.muted} /></button>)}
        </div>

        {menuFor === it.id && (
          <div style={{ margin: "2px 8px 6px 40px", border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden", background: C.card }}>
            <button onClick={() => { setEditing({ id: it.id, value: it.time }); setMenuFor(null); }} style={menuBtn}><Clock size={17} color={C.muted} /> Change time</button>
            <div style={{ height: 1, background: C.line }} />
            <button onClick={() => skipToday(k, it.id)} style={menuBtn}><CalendarOff size={17} color={C.muted} /> {it.skipped ? "Un-skip today" : "Skip for today"}</button>
            <div style={{ height: 1, background: C.line }} />
            <div style={{ ...menuBtn, cursor: "default", color: C.muted, fontSize: 13 }}><Lock size={16} color={C.muted} /> Essential · can’t remove</div>
          </div>
        )}
      </div>
    );
  };

  /* ---------- TODAY / DAY list view ---------- */
  const DayView = ({ date, live }) => {
    const k = key(date);
    const items = buildDay(k);
    const essentials = items.filter((i) => i.essential);
    const added = items.filter((i) => !i.essential);
    const activeCount = essentials.filter((i) => !i.skipped).length;
    const doneCount = essentials.filter((i) => i.done).length;

    return (
      <Frame>
        <div style={{ padding: "16px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.line}` }}>
          {live ? <span style={{ width: 34 }} /> : <button onClick={() => setView({ type: "month" })} style={iconBtn} aria-label="Back to month"><ArrowLeft size={20} color={C.muted} /></button>}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>{live ? "Today" : fmtShort(date)}</div>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{live ? `${fmtShort(date)} · ${CHILD}` : `${doneCount} of ${activeCount} essentials`}</div>
          </div>
          <button onClick={() => setView({ type: "month" })} style={iconBtn} aria-label="Open calendar"><Calendar size={20} color={live ? C.accent : C.muted} /></button>
        </div>

        {live && (
          <button onClick={() => setKid(true)} style={{ margin: "12px 18px 4px", width: "calc(100% - 36px)", background: C.sageBg, color: "#2f5f49", border: "none", borderRadius: 14, padding: "10px 12px", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", fontFamily: "inherit" }}>
            <Smile size={17} /> Open kid view
          </button>
        )}

        <div style={{ padding: "10px 12px 2px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={label}>ESSENTIALS</span>
          <span style={{ ...label, display: "flex", alignItems: "center", gap: 3 }}><Lock size={12} /> fixed</span>
        </div>
        <div style={{ padding: "0 12px" }}>
          {essentials.map((it) => <Row key={it.id} it={it} k={k} interactive={live} />)}
        </div>

        {(added.length > 0 || live) && (
          <>
            <div style={{ height: 1, background: C.line, margin: "8px 20px" }} />
            <div style={{ padding: "2px 20px 4px" }}><span style={label}>ADDED BY YOU</span></div>
            <div style={{ padding: "0 12px" }}>
              {added.map((it) => <Row key={it.id} it={it} k={k} interactive={live} />)}
              {live && <button onClick={() => setAdding(true)} style={{ width: "100%", margin: "6px 0 4px", border: `1.5px dashed ${C.line}`, background: "none", color: C.ink, borderRadius: 12, padding: "10px", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "inherit" }}><Plus size={16} /> Add activity</button>}
            </div>
          </>
        )}

        {live && (
          <div style={{ margin: "8px 12px 14px", background: C.accentBg, borderRadius: 14, padding: "12px 14px", display: "flex", gap: 10 }}>
            <Sprout size={19} color={C.accent} style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, color: "#3b3f8f", fontWeight: 600 }}>Every day you keep the rhythm, {CHILD}’s day feels a little safer and transitions get easier.</div>
              <a href="#" onClick={(e) => { e.preventDefault(); showToast("Opens ‘Why routines help’"); }} style={{ fontSize: 12, color: C.accent, fontWeight: 700, textDecoration: "none" }}>Why routines help →</a>
            </div>
          </div>
        )}
        <div style={foot}>{live ? "Day view · today" : "Day view · history"}</div>
      </Frame>
    );
  };

  /* ---------- MONTH view ---------- */
  const MonthView = () => {
    const { y, m } = monthCur;
    const first = new Date(y, m, 1);
    const lead = (first.getDay() + 6) % 7; // Monday-start
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));
    const prevMonth = () => setMonthCur(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }));
    const nextMonth = () => setMonthCur(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }));
    const onThisMonth = y === TODAY.getFullYear() && m === TODAY.getMonth();

    return (
      <Frame>
        <div style={{ padding: "16px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.line}` }}>
          <button onClick={prevMonth} style={iconBtn} aria-label="Previous month"><ChevronLeft size={20} color={C.muted} /></button>
          <span style={{ fontSize: 17, fontWeight: 800 }}>{MONTHS_FULL[m]} {y}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {!onThisMonth && <button onClick={() => setMonthCur({ y: TODAY.getFullYear(), m: TODAY.getMonth() })} style={{ border: "none", background: C.accentBg, color: C.accent, fontSize: 12, fontWeight: 800, padding: "5px 10px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit" }} aria-label="Back to this month">Today</button>}
            <button onClick={nextMonth} disabled={onThisMonth} style={iconBtn} aria-label="Next month"><ChevronRight size={20} color={onThisMonth ? C.line : C.muted} /></button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "10px 12px 2px", gap: 2 }}>
          {["M","T","W","T","F","S","S"].map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: C.muted }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "2px 12px 8px", gap: 2 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const isToday = key(d) === todayKey;
            const future = d > TODAY;
            const st = dayStatus(d);
            const dotColor = st === "full" ? C.sage : st === "partial" ? C.amber : "transparent";
            const hollow = st === "rest" || (st === "none" && !future);
            return (
              <button key={i} disabled={future}
                onClick={() => setView(isToday ? { type: "today" } : { type: "day", date: d })}
                style={{ aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, border: isToday ? `2px solid ${C.accent}` : "none", background: isToday ? C.accentBg : "none", borderRadius: 10, cursor: future ? "default" : "pointer", fontFamily: "inherit" }}>
                <span style={{ fontSize: 13, fontWeight: isToday ? 800 : 600, color: future ? C.muted : isToday ? C.accent : C.ink }}>{d.getDate()}</span>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: dotColor, border: hollow ? `1.5px solid ${C.line}` : "none" }} />
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", padding: "2px 0 14px", fontSize: 12, color: C.muted, fontWeight: 600 }}>
          <span style={legend}><span style={{ ...ldot, background: C.sage }} /> all done</span>
          <span style={legend}><span style={{ ...ldot, background: C.amber }} /> some done</span>
          <span style={legend}><span style={{ ...ldot, border: `1.5px solid ${C.line}` }} /> rest day</span>
        </div>
        <div style={foot}>Month view · tap a day</div>
      </Frame>
    );
  };

  /* ---------- add-activity sheet ---------- */
  const [addName, setAddName] = useState("");
  const [addIcon, setAddIcon] = useState("message");
  const [addTime, setAddTime] = useState("4:00");
  const submitAdd = () => {
    const name = addName.trim() || "New activity";
    patch(todayKey, (c) => { c.added = [...c.added, { id: "u" + Date.now(), name, iconKey: addIcon, time: addTime }]; });
    setAdding(false); setAddName(""); setAddIcon("message"); setAddTime("4:00"); showToast("Activity added");
  };

  return (
    <div style={{ background: C.bg, minHeight: 560, padding: "28px 16px", display: "flex", justifyContent: "center", position: "relative", fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800&display=swap');`}</style>

      {view.type === "today" && <DayView date={TODAY} live />}
      {view.type === "month" && <MonthView />}
      {view.type === "day" && <DayView date={view.date} live={false} />}

      {/* kid view modal */}
      {kid && (
        <Overlay onClose={() => setKid(false)}>
          <div style={{ width: 340, maxWidth: "100%", background: C.card, borderRadius: 24, overflow: "hidden", fontFamily: "inherit" }}>
            <div style={{ padding: "16px 16px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: C.muted, fontSize: 14 }}>Now it’s time for</span>
              <button onClick={() => setKid(false)} style={iconBtn} aria-label="Close"><X size={20} color={C.muted} /></button>
            </div>
            {nextKidItem ? (() => {
              const list = buildDay(todayKey).filter((i) => !i.skipped);
              const idx = list.findIndex((i) => i.id === nextKidItem.id);
              const then = list[idx + 1];
              const { Icon } = nextKidItem;
              const ThenIcon = then ? then.Icon : Smile;
              return (
                <>
                  <div style={{ margin: "4px 16px 16px", background: C.sageBg, borderRadius: 20, padding: "26px 16px", textAlign: "center" }}>
                    <div style={{ width: 104, height: 104, margin: "0 auto 12px", borderRadius: 22, background: C.card, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={58} color="#2f5f49" /></div>
                    <div style={{ fontSize: 25, fontWeight: 800, color: "#255140" }}>{nextKidItem.name}</div>
                  </div>
                  <div style={{ padding: "0 16px 6px" }}><span style={label}>FIRST, THEN</span></div>
                  <div style={{ display: "flex", gap: 8, padding: "6px 16px 14px", alignItems: "center" }}>
                    <div style={miniCard}><Icon size={30} color={C.muted} /><div style={{ fontSize: 12, fontWeight: 700, marginTop: 6 }}>First</div></div>
                    <ChevronRight size={20} color={C.muted} />
                    <div style={miniCard}><ThenIcon size={30} color={C.muted} /><div style={{ fontSize: 12, fontWeight: 700, marginTop: 6 }}>{then ? "Then" : "Free!"}</div></div>
                  </div>
                  <div style={{ padding: "0 16px 18px" }}>
                    <button onClick={() => { toggleDone(todayKey, nextKidItem.id); }} style={{ width: "100%", padding: 13, fontSize: 16, fontWeight: 800, background: C.sage, color: "#fff", border: "none", borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit" }}><Check size={18} strokeWidth={3} /> All done!</button>
                  </div>
                </>
              );
            })() : (
              <div style={{ padding: "40px 24px 48px", textAlign: "center" }}>
                <Smile size={54} color={C.sage} />
                <div style={{ fontSize: 20, fontWeight: 800, marginTop: 12 }}>All done for today!</div>
                <div style={{ fontSize: 14, color: C.muted, fontWeight: 600, marginTop: 4 }}>Great rhythm today.</div>
              </div>
            )}
          </div>
        </Overlay>
      )}

      {/* add-activity sheet */}
      {adding && (
        <Overlay onClose={() => setAdding(false)} bottom>
          <div style={{ width: 360, maxWidth: "100%", background: C.card, borderRadius: "22px 22px 0 0", padding: 18, fontFamily: "inherit" }}>
            <div style={{ width: 36, height: 4, background: C.line, borderRadius: 2, margin: "0 auto 14px" }} />
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 14 }}>Add activity</div>
            <div style={fieldLabel}>Name</div>
            <input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Speech therapy" style={input} />
            <div style={fieldLabel}>Icon</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {ICON_CHOICES.map(({ key: kk, Icon }) => (
                <button key={kk} onClick={() => setAddIcon(kk)} style={{ width: 42, height: 42, borderRadius: 11, border: addIcon === kk ? `2px solid ${C.accent}` : `1px solid ${C.line}`, background: addIcon === kk ? C.accentBg : C.card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} aria-label={kk}>
                  <Icon size={20} color={addIcon === kk ? C.accent : C.muted} />
                </button>
              ))}
            </div>
            <div style={fieldLabel}>Time</div>
            <input value={addTime} onChange={(e) => setAddTime(e.target.value)} style={{ ...input, width: 120 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "12px 0", fontSize: 12, color: C.muted, fontWeight: 600 }}>
              <Info size={14} /> You can edit or remove this anytime — it’s yours, not an essential.
            </div>
            <button onClick={submitAdd} style={{ width: "100%", padding: 13, fontSize: 15, fontWeight: 800, background: C.accent, color: "#fff", border: "none", borderRadius: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "inherit" }}><Plus size={16} /> Add to today</button>
          </div>
        </Overlay>
      )}

      {/* time edit modal */}
      {editing && (
        <Overlay onClose={() => setEditing(null)}>
          <div style={{ width: 300, maxWidth: "100%", background: C.card, borderRadius: 20, padding: 20, fontFamily: "inherit" }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Change time</div>
            <input value={editing.value} onChange={(e) => setEditing({ ...editing, value: e.target.value })} style={input} autoFocus />
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button onClick={() => setEditing(null)} style={{ flex: 1, padding: 11, borderRadius: 12, border: `1px solid ${C.line}`, background: C.card, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: C.ink }}>Cancel</button>
              <button onClick={() => saveTime(view.type === "day" ? key(view.date) : todayKey, editing.id, editing.value)} style={{ flex: 1, padding: 11, borderRadius: 12, border: "none", background: C.accent, color: "#fff", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Save</button>
            </div>
          </div>
        </Overlay>
      )}

      {toast && <div style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", background: C.ink, color: "#fff", padding: "9px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700 }}>{toast}</div>}
    </div>
  );
}

/* ---------- overlay ---------- */
function Overlay({ children, onClose, bottom }) {
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(40,36,32,0.34)", display: "flex", alignItems: bottom ? "flex-end" : "center", justifyContent: "center", padding: bottom ? 0 : 16, zIndex: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", display: "flex", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

/* ---------- style tokens ---------- */
const label = { fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", color: C.muted };
const foot = { textAlign: "center", padding: "9px 0 12px", borderTop: `1px solid ${C.line}`, fontSize: 11, fontWeight: 700, color: C.muted };
const iconBtn = { border: "none", background: "none", cursor: "pointer", padding: 4, display: "flex", borderRadius: 8 };
const menuBtn = { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", border: "none", background: "none", fontSize: 14, fontWeight: 600, color: C.ink, cursor: "pointer", fontFamily: "inherit", textAlign: "left" };
const legend = { display: "inline-flex", alignItems: "center", gap: 4 };
const ldot = { width: 10, height: 10, borderRadius: 999, display: "inline-block" };
const miniCard = { flex: 1, background: C.bg, borderRadius: 12, padding: "12px 8px", textAlign: "center" };
const fieldLabel = { fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 5 };
const input = { width: "100%", boxSizing: "border-box", border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px", fontSize: 15, fontFamily: "inherit", color: C.ink, outline: "none", marginBottom: 14, background: C.card };
