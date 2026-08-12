import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge, Btn, Input, TextArea, Avatar, Accordion, PageHero, AvatarIllustrations, ChildAvatar, ComAvatar, ROOM_ICONS, ACTIVITY_TEXTAREA_STYLE, ActionIllustration, HeroIllustration } from "../ui";
import { CHILD_AVATARS, DEFAULT_CHILDREN, DEFAULT_SCHEDULE, ROOM_COLORS, SOS_COLORS, VERBAL_STATUS_OPTIONS } from "../data";
import { useBackHandler } from "../hooks";

export const EMOJI_OPTS = ["🌅","🍳","🥗","🍎","🦷","🛁","👗","🎨","📚","🎮","🏃","🧩","🎵","🌳","😴","🚌","🏠","💊","🧸","🐾","🎭","🖥️","🏊","🛌","⭐","🎯","🏋️","🛝"];
//  EMOTION DATA

export const ALARM_TONES = [
  {
    id: "lullaby", label: "Lullaby", desc: "Soft & gentle",
    play: (vol, ctx) => {
      // C-E-G-C melody — gentle lullaby
      const notes = [523,659,784,1047,784,659,523,659,523];
      const dur = 0.35;
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * dur;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol * 0.4, t + 0.05);
        gain.gain.linearRampToValueAtTime(vol * 0.25, t + dur * 0.8);
        gain.gain.linearRampToValueAtTime(0, t + dur);
        osc.start(t); osc.stop(t + dur);
      });
    }
  },
  {
    id: "morning", label: "Morning Bells", desc: "Clear & bright",
    play: (vol, ctx) => {
      // Bell-like tones — C major arpeggio
      const notes = [523,659,784,523,659,784,1047,784];
      const dur = 0.4;
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
        osc.type = "triangle"; osc2.type = "sine";
        osc.frequency.value = freq; osc2.frequency.value = freq * 2;
        const t = ctx.currentTime + i * dur;
        gain.gain.setValueAtTime(vol * 0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 1.2);
        osc.start(t); osc.stop(t + dur * 1.5);
        osc2.start(t); osc2.stop(t + dur * 1.5);
      });
    }
  },
  {
    id: "calm", label: "Calm Ocean", desc: "Flowing & peaceful",
    play: (vol, ctx) => {
      // Low warm tones — G pentatonic
      const notes = [392,440,494,587,659,587,494,440,392];
      const dur = 0.5;
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * dur;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol * 0.3, t + 0.15);
        gain.gain.linearRampToValueAtTime(vol * 0.2, t + dur * 0.7);
        gain.gain.linearRampToValueAtTime(0, t + dur * 1.1);
        osc.start(t); osc.stop(t + dur * 1.2);
      });
    }
  },
  {
    id: "harp", label: "Soft Harp", desc: "Delicate & warm",
    play: (vol, ctx) => {
      // Harp-like — F major scale ascending + descending
      const notes = [349,392,440,523,587,523,440,392,349];
      const dur = 0.3;
      notes.forEach((freq, i) => {
        [1, 2, 4].forEach((mult, j) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = "sine";
          osc.frequency.value = freq * mult;
          const t = ctx.currentTime + i * dur;
          const v = vol * [0.4, 0.15, 0.05][j];
          gain.gain.setValueAtTime(v, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 1.8);
          osc.start(t); osc.stop(t + dur * 2);
        });
      });
    }
  },
  {
    id: "chime", label: "Wind Chimes", desc: "Light & airy",
    play: (vol, ctx) => {
      // Random-feeling chime pattern — pentatonic
      const notes = [659,784,880,1047,1175,880,784,659,784,880];
      const times = [0,0.2,0.45,0.6,0.9,1.15,1.35,1.55,1.8,2.0];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "triangle";
        osc.frequency.value = freq;
        const t = ctx.currentTime + times[i];
        gain.gain.setValueAtTime(vol * 0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        osc.start(t); osc.stop(t + 0.9);
      });
    }
  },
];

// Local calendar-date key (Y-M-D), not UTC — a UTC-based key would land on
// the wrong day for any timezone ahead of UTC, breaking calendar matching.
const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

const rowMenuBtn = { width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: "none", background: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody, textAlign: "left" };

function DoneDot({ state }) {
  if (state === "done") return <div style={{ width: 24, height: 24, borderRadius: "50%", background: T.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span></div>;
  if (state === "skip") return <div style={{ width: 24, height: 24, borderRadius: "50%", border: `1.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ color: T.inkMuted, fontSize: 14, fontWeight: 900, lineHeight: 1 }}>–</span></div>;
  return <div style={{ width: 24, height: 24, borderRadius: "50%", border: `1.5px solid ${T.border}`, flexShrink: 0 }} />;
}

// A single schedule item row — essentials (from the default schedule) get a
// "…" menu with edit/skip; items the parent added get inline edit/delete.
function ScheduleRow({ item, essential, done, skipped, onToggle, menuOpen, onMenuToggle, onEdit, onSkip, onDelete }) {
  const state = skipped ? "skip" : done ? "done" : "todo";
  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 2px", opacity: skipped ? 0.55 : 1 }}>
        <button onClick={() => !skipped && onToggle()} disabled={skipped} style={{ border: "none", background: "none", padding: 0, cursor: skipped ? "default" : "pointer", display: "flex" }} aria-label={done ? "Mark not done" : "Mark done"}>
          <DoneDot state={state} />
        </button>
        <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{item.emoji}</span>
        <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: done ? T.inkMuted : T.ink, textDecoration: done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
        {skipped ? <Badge color={T.inkMuted}>skipped</Badge> : <Badge color={T.purple}>{item.endTime ? `${item.time}–${item.endTime}` : item.time}</Badge>}
        {essential ? (
          <button onClick={onMenuToggle} style={{ border: "none", background: "none", cursor: "pointer", padding: "2px 4px", fontSize: 18, fontWeight: 900, color: T.inkMuted, lineHeight: 1 }} aria-label="Options">⋯</button>
        ) : (
          <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
            <button onClick={onEdit} style={{ background: T.border, border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 12 }}>✏️</button>
            <button onClick={onDelete} style={{ background: T.redL, border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 12 }}>🗑️</button>
          </div>
        )}
      </div>

      {menuOpen && (
        <div style={{ margin: "2px 0 6px 34px", border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", background: T.surface, boxShadow: T.shadowM }}>
          <button onClick={onEdit} style={{ ...rowMenuBtn, color: T.ink }}>✏️ Edit</button>
          <div style={{ height: 1, background: T.border }} />
          <button onClick={onSkip} style={{ ...rowMenuBtn, color: T.ink }}>{skipped ? "↩ Un-skip today" : "⏭ Skip for today"}</button>
          <div style={{ height: 1, background: T.border }} />
          <div style={{ ...rowMenuBtn, cursor: "default", color: T.inkMuted, fontSize: 12 }}>🔒 Essential · can't remove</div>
        </div>
      )}
    </div>
  );
}

export function ScheduleScreen({ childCtx, push }) {
  const { activeChild, updateChild, children } = childCtx;
  const [scheduleView, setScheduleView] = useState("today"); // "today" | "month"
  const [monthCur, setMonthCur] = useState(() => { const t = new Date(); return { y: t.getFullYear(), m: t.getMonth() }; });
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [kidView, setKidView] = useState(false);
  const [skippedToday, setSkippedToday] = useState([]);
  const [menuFor, setMenuFor] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ emoji: "⭐", label: "", time: "08:00", endTime: "", isRange: false });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editData, setEditData] = useState({});
  const [showAlarmSettings, setShowAlarmSettings] = useState(false);
  const [alarmOn, setAlarmOn] = useState(() => {
    try { return localStorage.getItem("bonda_alarm_on") !== "false"; } catch { return true; }
  });
  const [alarmVolume, setAlarmVolume] = useState(() => {
    try { return parseFloat(localStorage.getItem("bonda_alarm_vol") || "0.6"); } catch { return 0.6; }
  });
  const [alarmTone, setAlarmTone] = useState(() => {
    try { return localStorage.getItem("bonda_alarm_tone") || "lullaby"; } catch { return "lullaby"; }
  });
  const [previewPlaying, setPreviewPlaying] = useState(null);
  const audioCtxRef = useRef(null);

  useBackHandler(showEmojiPicker, () => setShowEmojiPicker(false));
  useBackHandler(showAlarmSettings, () => setShowAlarmSettings(false));
  useBackHandler(showAdd, () => { setShowAdd(false); setShowEmojiPicker(false); });
  useBackHandler(!!editing, () => { setEditing(null); setShowEmojiPicker(false); });
  useBackHandler(kidView, () => setKidView(false));
  useBackHandler(!!selectedEntry, () => setSelectedEntry(null));

  const saveAlarm = (on, vol, tone) => {
    try {
      localStorage.setItem("bonda_alarm_on", String(on));
      localStorage.setItem("bonda_alarm_vol", String(vol));
      localStorage.setItem("bonda_alarm_tone", tone);
    } catch {}
  };

  const previewTone = (toneId) => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const tone = ALARM_TONES.find(t => t.id === toneId);
      if (tone) { tone.play(alarmVolume, ctx); setPreviewPlaying(toneId); setTimeout(() => setPreviewPlaying(null), 3500); }
    } catch (e) { console.log("Audio not available:", e); }
  };

  // Check alarms every minute
  useEffect(() => {
    if (!alarmOn) return;
    const check = () => {
      const items = activeChild?.scheduleItems || DEFAULT_SCHEDULE;
      const now = new Date();
      const hhmm = now.getHours().toString().padStart(2,"0") + ":" + now.getMinutes().toString().padStart(2,"0");
      const match = items.find(i => i.time === hhmm || i.endTime === hhmm);
      if (match) {
        try {
          if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
          const ctx = audioCtxRef.current;
          if (ctx.state === "suspended") ctx.resume();
          const tone = ALARM_TONES.find(t => t.id === alarmTone) || ALARM_TONES[0];
          tone.play(alarmVolume, ctx);
          // Repeat 3 times
          setTimeout(() => tone.play(alarmVolume, ctx), 3600);
          setTimeout(() => tone.play(alarmVolume, ctx), 7200);
        } catch {}
      }
    };
    const iv = setInterval(check, 60000);
    return () => clearInterval(iv);
  }, [alarmOn, alarmTone, alarmVolume, activeChild]);

  if (!activeChild) return (
    <Page style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>

      <div style={{ marginBottom: 28 }}>
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none">

          <circle cx="70" cy="70" r="64" stroke={T.purple} strokeWidth="1" strokeDasharray="4 6" opacity="0.2"/>

          <circle cx="70" cy="70" r="48" fill={T.purpleL} opacity="0.6"/>

          <circle cx="70" cy="70" r="34" fill={T.purpleL}/>

          <circle cx="70" cy="54" r="12" fill={T.surface} stroke={T.purple} strokeWidth="1.5"/>

          <path d="M55 90 Q55 74 70 74 Q85 74 85 90" fill={T.surface} stroke={T.purple} strokeWidth="1.5" strokeLinejoin="round"/>

          <circle cx="65.5" cy="53" r="1.5" fill={T.purple} opacity="0.5"/>
          <circle cx="74.5" cy="53" r="1.5" fill={T.purple} opacity="0.5"/>
          <path d="M65 58 Q70 61.5 75 58" fill="none" stroke={T.purple} strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>

          <circle cx="98" cy="42" r="10" fill={T.purple}/>
          <path d="M94 42 L102 42 M98 38 L98 46" stroke="white" strokeWidth="2" strokeLinecap="round"/>

          <circle cx="30" cy="52" r="3" fill={T.purple} opacity="0.15"/>
          <circle cx="112" cy="90" r="4" fill={T.amber} opacity="0.25"/>
          <circle cx="28" cy="96" r="5" fill={T.purple} opacity="0.1"/>
          <circle cx="108" cy="50" r="2.5" fill={T.amber} opacity="0.2"/>
        </svg>
      </div>
      <p style={{ fontWeight: 800, color: T.ink, fontSize: 19, margin: "0 0 10px", textAlign: "center", letterSpacing: "-0.02em" }}>No child profile yet</p>
      <p style={{ color: T.inkSoft, fontSize: 14, textAlign: "center", lineHeight: 1.7, marginBottom: 28, maxWidth: 260 }}>Add your child's profile to build their personalised daily schedule and track their progress.</p>
      <Btn onClick={() => push("addChild")} style={{ paddingLeft: 28, paddingRight: 28 }}>+ Add a Child Profile</Btn>
    </Page>
  );

  if (!activeChild.active) return (
    <Page style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ marginBottom: 20, fontSize: 48 }}>⏳</div>
      <p style={{ fontWeight: 800, color: T.ink, fontSize: 19, margin: "0 0 10px", textAlign: "center", letterSpacing: "-0.02em" }}>Schedule not available yet</p>
      <p style={{ color: T.inkSoft, fontSize: 14, textAlign: "center", lineHeight: 1.7, maxWidth: 260 }}>{activeChild.name}'s profile is pending admin approval. The schedule unlocks once it's approved.</p>
    </Page>
  );

  const items = activeChild.scheduleItems || DEFAULT_SCHEDULE;
  const history = activeChild.history || [];
  const today = startOfDay(new Date());
  const todayStr = dateKey(today);
  // Checkmarks are pinned to today's date — a new day starts unchecked even if "Save Day" was skipped.
  const done = activeChild.todayDoneDate === todayStr ? activeChild.todayDone || {} : {};

  // "Essentials" are the default schedule's items (locked, can't be deleted — only
  // edited or skipped for the day); anything the parent added on top is removable.
  const isEssential = item => DEFAULT_SCHEDULE.some(d => d.id === item.id);
  const sorted = [...items].sort((a, b) => a.time.localeCompare(b.time));
  const essentials = sorted.filter(isEssential);
  const added = sorted.filter(i => !isEssential(i));

  const activeItems = items.filter(i => !skippedToday.includes(i.id));
  const completedCount = activeItems.filter(i => done[i.id]).length;
  const progress = activeItems.length ? Math.round((completedCount / activeItems.length) * 100) : 0;

  const toggleDone = id => updateChild(activeChild.id, { todayDone: { ...done, [id]: !done[id] }, todayDoneDate: todayStr });

  // Skip is a today-only, local override (not persisted) — it clears each reload,
  // matching the "for today" scope of the action.
  const skipToggle = id => {
    setSkippedToday(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
    if (done[id]) toggleDone(id);
    setMenuFor(null);
  };

  const addItem = () => {
    if (!newItem.label.trim()) return;
    const id = Date.now().toString();
    const item = { emoji: newItem.emoji, label: newItem.label, time: newItem.time, id };
    if (newItem.isRange && newItem.endTime) item.endTime = newItem.endTime;
    updateChild(activeChild.id, { scheduleItems: [...items, item] });
    setNewItem({ emoji: "⭐", label: "", time: "08:00", endTime: "", isRange: false }); setShowAdd(false);
  };

  const deleteItem = id => updateChild(activeChild.id, { scheduleItems: items.filter(i => i.id !== id) });

  const startEdit = item => { setEditing(item.id); setEditData({ ...item, isRange: !!item.endTime }); setMenuFor(null); };
  const saveEdit = () => {
    const { isRange, ...rest } = editData;
    const item = { ...rest };
    if (!(isRange && item.endTime)) delete item.endTime;
    updateChild(activeChild.id, { scheduleItems: items.map(i => i.id === editing ? item : i) });
    setEditing(null);
  };

  const saveDay = () => {
    const entry = {
      id: Date.now().toString(),
      isoDate: todayStr,
      date: new Date().toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
      total: activeItems.length, completedCount,
      completed: activeItems.filter(i => done[i.id]).map(i => ({ emoji: i.emoji, label: i.label, time: i.time, endTime: i.endTime })),
      missed: activeItems.filter(i => !done[i.id]).map(i => ({ emoji: i.emoji, label: i.label, time: i.time, endTime: i.endTime })),
    };
    updateChild(activeChild.id, { history: [entry, ...history].slice(0, 30), todayDone: {}, todayDoneDate: todayStr });
    setSkippedToday([]);
    alert("✅ Day saved!");
  };

  // Kid view — the single next thing to do, in order, across essentials + added.
  const kidList = [...essentials, ...added].filter(i => !skippedToday.includes(i.id)).sort((a, b) => a.time.localeCompare(b.time));
  const nextKidItem = kidList.find(i => !done[i.id]);
  const nextKidIdx = nextKidItem ? kidList.findIndex(i => i.id === nextKidItem.id) : -1;
  const thenItem = nextKidIdx >= 0 ? kidList[nextKidIdx + 1] : null;

  // Month calendar
  const { y: monthY, m: monthM } = monthCur;
  const onThisMonth = monthY === today.getFullYear() && monthM === today.getMonth();
  const prevMonth = () => setMonthCur(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }));
  const nextMonth = () => setMonthCur(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }));
  const monthFirst = new Date(monthY, monthM, 1);
  const monthLead = (monthFirst.getDay() + 6) % 7; // Monday-start
  const monthDays = new Date(monthY, monthM + 1, 0).getDate();
  const monthCells = [];
  for (let i = 0; i < monthLead; i++) monthCells.push(null);
  for (let d = 1; d <= monthDays; d++) monthCells.push(new Date(monthY, monthM, d));

  const dayStatus = (d, entry, isToday) => {
    if (isToday) return activeItems.length === 0 ? "none" : completedCount === 0 ? "none" : completedCount >= activeItems.length ? "full" : "partial";
    if (!entry) return "none";
    if (entry.total === 0 || entry.completedCount === 0) return "rest";
    return entry.completedCount >= entry.total ? "full" : "partial";
  };

  const renderItem = (item, essential) => {
    if (editing === item.id) {
      return (
        <Card key={item.id} style={{ background: T.purpleL }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ fontSize: 24, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: T.r, padding: "6px 10px", cursor: "pointer" }}>{editData.emoji}</button>
            <input value={editData.label} onChange={e => setEditData({ ...editData, label: e.target.value })} style={{ flex: 1, minWidth: 0, boxSizing: "border-box", padding: "8px 12px", borderRadius: T.r, border: `1.5px solid ${T.purple}`, fontSize: 14, fontFamily: T.fontBody, color: T.ink, background: T.surface, outline: "none" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <input type="time" value={editData.time} onChange={e => setEditData({ ...editData, time: e.target.value })} style={{ flexShrink: 0, boxSizing: "border-box", padding: "8px 10px", borderRadius: T.r, border: `1.5px solid ${T.purple}`, fontSize: 13, fontFamily: T.fontBody, color: T.ink, background: T.surface, outline: "none", width: 118 }} />
            {editData.isRange && <>
              <span style={{ color: T.inkMuted, fontSize: 13, fontWeight: 700 }}>–</span>
              <input type="time" value={editData.endTime || ""} onChange={e => setEditData({ ...editData, endTime: e.target.value })} style={{ flexShrink: 0, boxSizing: "border-box", padding: "8px 10px", borderRadius: T.r, border: `1.5px solid ${T.purple}`, fontSize: 13, fontFamily: T.fontBody, color: T.ink, background: T.surface, outline: "none", width: 118 }} />
            </>}
          </div>
          <button onClick={() => setEditData({ ...editData, isRange: !editData.isRange })} style={{ border: "none", background: "none", padding: "0 0 10px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: T.purple, fontFamily: T.fontBody, display: "block" }}>
            {editData.isRange ? "✕ Remove end time" : "+ Add end time (interval)"}
          </button>
          {showEmojiPicker && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: 10, background: T.surface, borderRadius: T.r, marginBottom: 10 }}>{EMOJI_OPTS.map(e => <button key={e} onClick={() => { setEditData({ ...editData, emoji: e }); setShowEmojiPicker(false); }} style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer", borderRadius: 8, padding: 3 }}>{e}</button>)}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={saveEdit} style={{ flex: 1 }}>Save</Btn>
            <Btn onClick={() => setEditing(null)} secondary style={{ flex: 1 }}>Cancel</Btn>
          </div>
        </Card>
      );
    }
    return (
      <ScheduleRow key={item.id} item={item} essential={essential} done={!!done[item.id]} skipped={skippedToday.includes(item.id)}
        onToggle={() => toggleDone(item.id)}
        menuOpen={menuFor === item.id}
        onMenuToggle={() => setMenuFor(menuFor === item.id ? null : item.id)}
        onEdit={() => startEdit(item)}
        onSkip={() => skipToggle(item.id)}
        onDelete={() => deleteItem(item.id)}
      />
    );
  };

  return (
    <Page>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: "12px 16px", background: T.purpleL, borderRadius: T.r, border: `1px solid ${T.purple}20` }}>
        <ChildAvatar value={activeChild.emoji} size={52} active={true} borderColor={T.purple} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 2px", fontWeight: 800, color: T.purple, fontSize: 16 }}>{activeChild.name}'s Schedule</p>
          {children.length > 1 && <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>Switch child on Home tab</p>}
        </div>

        <button onClick={() => setScheduleView(v => v === "month" ? "today" : "month")} style={{ width: 40, height: 40, borderRadius: T.r, background: scheduleView === "month" ? T.purple : T.border, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18, transition: "background 0.2s" }} title="Calendar view">
          📅
        </button>

        <button onClick={() => setShowAlarmSettings(!showAlarmSettings)} style={{ width: 40, height: 40, borderRadius: T.r, background: alarmOn ? T.purple : T.border, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }} title="Alarm Settings">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">

            <circle cx="10" cy="10" r="3" stroke="white" strokeWidth="1.4" fill="none"/>
            {[0,45,90,135,180,225,270,315].map((deg,i) => {
              const r = deg * Math.PI / 180;
              const x1 = 10 + 4.5 * Math.cos(r), y1 = 10 + 4.5 * Math.sin(r);
              const x2 = 10 + 6.5 * Math.cos(r), y2 = 10 + 6.5 * Math.sin(r);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="1.8" strokeLinecap="round"/>;
            })}
          </svg>
        </button>
      </div>


      {showAlarmSettings && (
        <div style={{ background: T.surface, borderRadius: T.rL, padding: 20, marginBottom: 20, boxShadow: T.shadowM, border: `1.5px solid ${T.purple}20` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <p style={{ margin: 0, fontWeight: 800, color: T.ink, fontSize: 15 }}>Alarm Settings</p>
              <p style={{ margin: "2px 0 0", color: T.inkMuted, fontSize: 12 }}>Activity reminders for {activeChild.name}</p>
            </div>
            <button onClick={() => setShowAlarmSettings(false)} style={{ background: T.border, border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.inkMuted, fontSize: 14, fontFamily: T.fontBody }}>✕</button>
          </div>


          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: T.canvas, borderRadius: T.r, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: alarmOn ? T.purpleL : T.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9.5" r="6" stroke={alarmOn ? T.purple : T.inkMuted} strokeWidth="1.4" fill="none"/>
                  <path d="M9 6 L9 10 L12 11.5" stroke={alarmOn ? T.purple : T.inkMuted} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 3 L3 1.5 M13 3 L15 1.5" stroke={alarmOn ? T.purple : T.inkMuted} strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
                </svg>
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: T.ink, fontSize: 14 }}>Alarm</p>
                <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>{alarmOn ? "Rings at each activity time" : "Alarm is off"}</p>
              </div>
            </div>

            <div onClick={() => { const v = !alarmOn; setAlarmOn(v); saveAlarm(v, alarmVolume, alarmTone); }}
              style={{ width: 48, height: 28, borderRadius: 99, background: alarmOn ? T.purple : T.border, cursor: "pointer", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 3, left: alarmOn ? 22 : 3, width: 22, height: 22, borderRadius: "50%", background: "white", transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}/>
            </div>
          </div>

          {alarmOn && (<>

            <div style={{ padding: "12px 14px", background: T.canvas, borderRadius: T.r, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <p style={{ margin: 0, fontWeight: 700, color: T.ink, fontSize: 13 }}>Volume</p>
                <p style={{ margin: 0, color: T.purple, fontWeight: 800, fontSize: 13 }}>{Math.round(alarmVolume * 100)}%</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 6 L2 10 L5 10 L9 13 L9 3 L5 6 Z" stroke={T.inkMuted} strokeWidth="1.2" fill={T.inkMuted} fillOpacity="0.3" strokeLinejoin="round"/>
                </svg>
                <input type="range" min="0.1" max="1" step="0.05" value={alarmVolume}
                  onChange={e => { const v = parseFloat(e.target.value); setAlarmVolume(v); saveAlarm(alarmOn, v, alarmTone); }}
                  style={{ flex: 1, accentColor: T.purple, height: 4, cursor: "pointer" }}/>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 6 L2 10 L5 10 L9 13 L9 3 L5 6 Z" stroke={T.purple} strokeWidth="1.2" fill={T.purple} fillOpacity="0.3" strokeLinejoin="round"/>
                  <path d="M11 4.5 Q13.5 6 13.5 8 Q13.5 10 11 11.5" stroke={T.purple} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
                  <path d="M11.5 6.5 Q13 7.2 13 8 Q13 8.8 11.5 9.5" stroke={T.purple} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5"/>
                </svg>
              </div>
            </div>


            <div style={{ padding: "12px 14px", background: T.canvas, borderRadius: T.r }}>
              <p style={{ margin: "0 0 12px", fontWeight: 700, color: T.ink, fontSize: 13 }}>Alarm Tone</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ALARM_TONES.map(tone => (
                  <div key={tone.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: T.r, background: alarmTone === tone.id ? T.purpleL : T.surface, border: `1.5px solid ${alarmTone === tone.id ? T.purple : T.border}`, cursor: "pointer", transition: "all 0.15s" }}
                    onClick={() => { setAlarmTone(tone.id); saveAlarm(alarmOn, alarmVolume, tone.id); }}>

                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${alarmTone === tone.id ? T.purple : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {alarmTone === tone.id && <div style={{ width: 9, height: 9, borderRadius: "50%", background: T.purple }}/>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: T.ink, fontSize: 13 }}>{tone.label}</p>
                      <p style={{ margin: 0, color: T.inkMuted, fontSize: 11 }}>{tone.desc}</p>
                    </div>

                    <button onClick={e => { e.stopPropagation(); previewTone(tone.id); }}
                      style={{ width: 32, height: 32, borderRadius: 8, background: previewPlaying === tone.id ? T.purple : T.purpleL, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <polygon points="3,2 11,7 3,12" fill={previewPlaying === tone.id ? "white" : T.purple}/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <p style={{ margin: "10px 0 0", color: T.inkMuted, fontSize: 11, textAlign: "center", lineHeight: 1.5 }}>Tap ▶ to preview · Alarm plays at each activity time · Repeats 3×</p>
            </div>
          </>)}
        </div>
      )}


      {scheduleView === "today" && (
        <>
          <button onClick={() => setKidView(true)} style={{ width: "100%", marginBottom: 16, background: T.greenL, color: T.green, border: "none", borderRadius: T.r, padding: "11px 12px", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", fontFamily: T.fontBody }}>
            😊 Open kid view
          </button>

          <Card style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ margin: 0, fontWeight: 700, color: T.ink, fontSize: 14 }}>Today's Progress</p>
              <p style={{ margin: 0, fontWeight: 800, color: T.purple, fontSize: 14 }}>{progress}%</p>
            </div>
            <div style={{ height: 6, background: T.border, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: T.purple, borderRadius: 99, transition: "width 0.4s ease" }} />
            </div>
            <p style={{ margin: "8px 0 0", color: T.inkMuted, fontSize: 12 }}>{completedCount} of {activeItems.length} activities done</p>
          </Card>

          <SectionLabel action={<span style={{ display: "flex", alignItems: "center", gap: 3, fontFamily: T.fontBody, fontSize: 11, fontWeight: 700, color: T.inkMuted, textTransform: "none", letterSpacing: 0 }}>🔒 fixed</span>}>Essentials</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 18 }}>
            {essentials.map(item => renderItem(item, true))}
            {essentials.length === 0 && <p style={{ color: T.inkMuted, fontSize: 12, margin: 0 }}>No essentials set up.</p>}
          </div>

          <SectionLabel>Added by you</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 12 }}>
            {added.map(item => renderItem(item, false))}
          </div>

          {showAdd ? (
            <Card style={{ background: T.purpleL, marginBottom: 10 }}>
              <p style={{ margin: "0 0 10px", fontWeight: 800, color: T.purple, fontSize: 14 }}>New Activity</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ fontSize: 24, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: T.r, padding: "6px 10px", cursor: "pointer" }}>{newItem.emoji}</button>
                <input value={newItem.label} onChange={e => setNewItem({ ...newItem, label: e.target.value })} placeholder="Activity name" style={{ flex: 1, minWidth: 0, boxSizing: "border-box", padding: "8px 12px", borderRadius: T.r, border: `1.5px solid ${T.purple}`, fontSize: 14, fontFamily: T.fontBody, color: T.ink, outline: "none", background: T.surface }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <input type="time" value={newItem.time} onChange={e => setNewItem({ ...newItem, time: e.target.value })} style={{ flexShrink: 0, boxSizing: "border-box", padding: "8px 8px", borderRadius: T.r, border: `1.5px solid ${T.purple}`, fontSize: 13, fontFamily: T.fontBody, color: T.ink, outline: "none", width: 118, background: T.surface }} />
                {newItem.isRange && <>
                  <span style={{ color: T.inkMuted, fontSize: 13, fontWeight: 700 }}>–</span>
                  <input type="time" value={newItem.endTime} onChange={e => setNewItem({ ...newItem, endTime: e.target.value })} style={{ flexShrink: 0, boxSizing: "border-box", padding: "8px 8px", borderRadius: T.r, border: `1.5px solid ${T.purple}`, fontSize: 13, fontFamily: T.fontBody, color: T.ink, outline: "none", width: 118, background: T.surface }} />
                </>}
              </div>
              <button onClick={() => setNewItem({ ...newItem, isRange: !newItem.isRange })} style={{ border: "none", background: "none", padding: "0 0 10px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: T.purple, fontFamily: T.fontBody, display: "block" }}>
                {newItem.isRange ? "✕ Remove end time" : "+ Add end time (interval, e.g. school 08:00–12:00)"}
              </button>
              {showEmojiPicker && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: 10, background: T.surface, borderRadius: T.r, marginBottom: 10 }}>{EMOJI_OPTS.map(e => <button key={e} onClick={() => { setNewItem({ ...newItem, emoji: e }); setShowEmojiPicker(false); }} style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer", borderRadius: 8, padding: 3 }}>{e}</button>)}</div>}
              <p style={{ margin: "0 0 10px", color: T.inkMuted, fontSize: 11, lineHeight: 1.5 }}>You can edit or remove this anytime — it's yours, not an essential.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={addItem} style={{ flex: 1 }}>Add ✓</Btn>
                <Btn onClick={() => setShowAdd(false)} secondary style={{ flex: 1 }}>Cancel</Btn>
              </div>
            </Card>
          ) : (
            <button onClick={() => setShowAdd(true)} style={{ width: "100%", margin: "2px 0 16px", border: `1.5px dashed ${T.border}`, background: "none", color: T.ink, borderRadius: T.r, padding: "11px", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: T.fontBody }}>+ Add activity</button>
          )}

          <div style={{ margin: "4px 0 16px", background: T.purpleL, borderRadius: T.r, padding: "12px 14px", display: "flex", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🌱</span>
            <p style={{ margin: 0, fontSize: 12, color: T.purple, fontWeight: 600, lineHeight: 1.5 }}>Every day you keep the rhythm, {activeChild.name}'s day feels a little safer and transitions get easier.</p>
          </div>

          <Btn onClick={saveDay} full style={{ background: T.green }}>💾 Save Day</Btn>
          <p style={{ color: T.inkMuted, fontSize: 11, textAlign: "center", marginTop: 10 }}>Tap "Save Day" at end of day to record to the calendar</p>
        </>
      )}

      {scheduleView === "month" && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <button onClick={prevMonth} style={{ border: "none", background: T.border, cursor: "pointer", width: 34, height: 34, borderRadius: 10, fontSize: 15, fontWeight: 800, color: T.inkMuted }}>‹</button>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontWeight: 800, color: T.ink, fontSize: 15 }}>{MONTHS_FULL[monthM]} {monthY}</p>
              <p style={{ margin: "2px 0 0", color: T.inkMuted, fontSize: 11 }}>{history.length} day{history.length === 1 ? "" : "s"} recorded</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {!onThisMonth && <button onClick={() => setMonthCur({ y: today.getFullYear(), m: today.getMonth() })} style={{ border: "none", background: T.purpleL, color: T.purple, fontSize: 11, fontWeight: 800, padding: "6px 10px", borderRadius: 99, cursor: "pointer", fontFamily: T.fontBody }}>Today</button>}
              <button onClick={nextMonth} disabled={onThisMonth} style={{ border: "none", background: T.border, cursor: onThisMonth ? "default" : "pointer", width: 34, height: 34, borderRadius: 10, fontSize: 15, fontWeight: 800, color: onThisMonth ? T.border : T.inkMuted, opacity: onThisMonth ? 0.5 : 1 }}>›</button>
            </div>
          </div>

          <Card style={{ padding: "14px 8px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 }}>
              {WEEKDAYS.map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 800, color: T.inkMuted }}>{d}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
              {monthCells.map((d, i) => {
                if (!d) return <div key={i} />;
                const dKey = dateKey(d);
                const isToday = dKey === todayStr;
                const future = d > today;
                const entry = history.find(h => h.isoDate === dKey);
                const status = dayStatus(d, entry, isToday);
                const dotColor = status === "full" ? T.green : status === "partial" ? T.amber : "transparent";
                const hollow = status === "rest";
                const clickable = isToday || (!future && entry);
                return (
                  <button key={i} disabled={!clickable}
                    onClick={() => { if (isToday) setScheduleView("today"); else if (entry) setSelectedEntry(entry); }}
                    style={{ aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, border: isToday ? `1.5px solid ${T.purple}` : "none", background: isToday ? T.purpleL : "transparent", borderRadius: 9, cursor: clickable ? "pointer" : "default", fontFamily: "inherit" }}>
                    <span style={{ fontSize: 12, fontWeight: isToday ? 800 : 600, color: future ? T.inkMuted : isToday ? T.purple : T.ink, opacity: future ? 0.4 : 1 }}>{d.getDate()}</span>
                    <span style={{ width: 5, height: 5, borderRadius: 99, background: dotColor, border: hollow ? `1.3px solid ${T.border}` : "none" }} />
                  </button>
                );
              })}
            </div>
          </Card>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", padding: "14px 0 4px", fontSize: 11, color: T.inkMuted, fontWeight: 700 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: T.green, display: "inline-block" }} /> all done</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: T.amber, display: "inline-block" }} /> some done</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 99, border: `1.3px solid ${T.border}`, display: "inline-block" }} /> no record</span>
          </div>
        </>
      )}

      {/* kid view */}
      {kidView && (
        <Overlay onClose={() => setKidView(false)}>
          <div style={{ width: 300, maxWidth: "100%", background: T.surface, borderRadius: T.rXL, overflow: "hidden" }}>
            <div style={{ padding: "14px 14px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: T.inkMuted, fontSize: 13 }}>Now it's time for</span>
              <button onClick={() => setKidView(false)} style={{ border: "none", background: "none", cursor: "pointer", padding: 4, fontSize: 16, color: T.inkMuted }} aria-label="Close">✕</button>
            </div>
            {nextKidItem ? (
              <>
                <div style={{ margin: "4px 14px 14px", background: T.greenL, borderRadius: T.rL, padding: "24px 14px", textAlign: "center" }}>
                  <div style={{ width: 88, height: 88, margin: "0 auto 10px", borderRadius: 20, background: T.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46 }}>{nextKidItem.emoji}</div>
                  <div style={{ fontSize: 21, fontWeight: 800, color: T.green }}>{nextKidItem.label}</div>
                </div>
                <div style={{ padding: "0 14px 6px" }}><span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", color: T.inkMuted }}>FIRST, THEN</span></div>
                <div style={{ display: "flex", gap: 8, padding: "6px 14px 14px", alignItems: "center" }}>
                  <div style={{ flex: 1, background: T.canvas, borderRadius: T.r, padding: "12px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 26 }}>{nextKidItem.emoji}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, color: T.inkMuted }}>First</div>
                  </div>
                  <span style={{ color: T.inkMuted, fontSize: 16 }}>→</span>
                  <div style={{ flex: 1, background: T.canvas, borderRadius: T.r, padding: "12px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 26 }}>{thenItem ? thenItem.emoji : "🎉"}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, color: T.inkMuted }}>{thenItem ? "Then" : "Free!"}</div>
                  </div>
                </div>
                <div style={{ padding: "0 14px 16px" }}>
                  <Btn onClick={() => toggleDone(nextKidItem.id)} full style={{ background: T.green }}>✓ All done!</Btn>
                </div>
              </>
            ) : (
              <div style={{ padding: "36px 20px 44px", textAlign: "center" }}>
                <div style={{ fontSize: 44 }}>🌱</div>
                <div style={{ fontSize: 18, fontWeight: 800, marginTop: 10, color: T.ink }}>All done for today!</div>
                <div style={{ fontSize: 13, color: T.inkMuted, fontWeight: 600, marginTop: 4 }}>Great rhythm today.</div>
              </div>
            )}
          </div>
        </Overlay>
      )}

      {/* saved-day detail, opened from the month calendar */}
      {selectedEntry && (
        <Overlay onClose={() => setSelectedEntry(null)} bottom>
          <div style={{ width: "100%", maxWidth: 480, background: T.surface, borderRadius: "20px 20px 0 0", padding: "10px 18px calc(env(safe-area-inset-bottom, 0px) + 20px)", boxSizing: "border-box", maxHeight: "78vh", overflowY: "auto" }}>
            <div style={{ width: 36, height: 4, background: T.border, borderRadius: 2, margin: "0 auto 14px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <p style={{ margin: "0 0 2px", fontWeight: 800, color: T.ink, fontSize: 15 }}>{selectedEntry.date}</p>
                <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>{selectedEntry.completedCount}/{selectedEntry.total} completed</p>
              </div>
              <Badge color={selectedEntry.total ? (selectedEntry.completedCount / selectedEntry.total >= 0.8 ? T.green : selectedEntry.completedCount / selectedEntry.total >= 0.5 ? T.amber : T.red) : T.inkMuted}>
                {selectedEntry.total ? Math.round((selectedEntry.completedCount / selectedEntry.total) * 100) : 0}%
              </Badge>
            </div>
            {selectedEntry.completed.length > 0 && <>
              <p style={{ margin: "10px 0 6px", fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase", letterSpacing: "0.07em" }}>✅ Completed</p>
              {selectedEntry.completed.map((a, i) => <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderTop: `1px solid ${T.border}`, alignItems: "center" }}><span style={{ fontSize: 18 }}>{a.emoji}</span><span style={{ fontSize: 13, fontWeight: 600, color: T.ink, flex: 1 }}>{a.label}</span><span style={{ fontSize: 12, color: T.inkMuted }}>{a.endTime ? `${a.time}–${a.endTime}` : a.time}</span></div>)}
            </>}
            {selectedEntry.missed.length > 0 && <>
              <p style={{ margin: "10px 0 6px", fontSize: 11, fontWeight: 700, color: T.red, textTransform: "uppercase", letterSpacing: "0.07em" }}>⏭ Missed</p>
              {selectedEntry.missed.map((a, i) => <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderTop: `1px solid ${T.border}`, alignItems: "center", opacity: 0.6 }}><span style={{ fontSize: 18 }}>{a.emoji}</span><span style={{ fontSize: 13, fontWeight: 600, color: T.ink, flex: 1 }}>{a.label}</span><span style={{ fontSize: 12, color: T.inkMuted }}>{a.endTime ? `${a.time}–${a.endTime}` : a.time}</span></div>)}
            </>}
          </div>
        </Overlay>
      )}
    </Page>
  );
}

// Backdrop + centered/bottom-sheet wrapper, matching the modal pattern used elsewhere in the app.
function Overlay({ children, onClose, bottom }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(35,32,28,.35)", zIndex: 200, display: "flex", alignItems: bottom ? "flex-end" : "center", justifyContent: "center", padding: bottom ? 0 : 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", display: "flex", justifyContent: "center" }}>{children}</div>
    </div>
  );
}
