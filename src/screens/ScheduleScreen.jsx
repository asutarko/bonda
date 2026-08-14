import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge, Btn, Input, TextArea, Avatar, Accordion, PageHero, AvatarIllustrations, ChildAvatar, ComAvatar, ROOM_ICONS, ACTIVITY_TEXTAREA_STYLE, ActionIllustration, HeroIllustration } from "../ui";
import { CHILD_AVATARS, DEFAULT_CHILDREN, DEFAULT_SCHEDULE, ROOM_COLORS, SOS_COLORS, VERBAL_STATUS_OPTIONS } from "../data";
import { useBackHandler } from "../hooks";

export const EMOJI_OPTS = ["🌅","🍳","🥗","🍎","🦷","🛁","👗","🎨","📚","🎮","🏃","🧩","🎵","🌳","😴","🚌","🏠","💊","🧸","🐾","🎭","🖥️","🏊","🛌","⭐","🎯","🏋️","🛝"];
//  EMOTION DATA

// Quick-add presets for the "New Activity" modal — one tap fills emoji, label
// and duration, so a caregiver isn't retyping the same routine every day.
const ADD_ACTIVITY_TEMPLATES = [
  { emoji: "🌅", label: "Wake Up",              category: "routine",  duration: 15 },
  { emoji: "🪥", label: "Brush Teeth",          category: "routine",  duration: 5 },
  { emoji: "🛁", label: "Bath",                 category: "routine",  duration: 20 },
  { emoji: "💊", label: "Medication",           category: "routine",  duration: 5 },
  { emoji: "🍳", label: "Breakfast",            category: "meals",    duration: 30 },
  { emoji: "🥗", label: "Lunch",                category: "meals",    duration: 30 },
  { emoji: "🍽️", label: "Dinner",               category: "meals",    duration: 30 },
  { emoji: "🧩", label: "Occupational Therapy", category: "therapy",  duration: 60 },
  { emoji: "🗣️", label: "Speech Therapy",       category: "therapy",  duration: 45 },
  { emoji: "🎨", label: "Art Therapy",          category: "therapy",  duration: 45 },
  { emoji: "🧸", label: "Free Play",            category: "play",     duration: 30 },
  { emoji: "🎵", label: "Music Time",           category: "play",     duration: 20 },
  { emoji: "🏃", label: "Exercise",             category: "play",     duration: 30 },
  { emoji: "🖥️", label: "Screen Time",          category: "play",     duration: 30 },
  { emoji: "📚", label: "Study Time",           category: "learning", duration: 30 },
  { emoji: "😴", label: "Nap",                  category: "rest",     duration: 60 },
  { emoji: "🤗", label: "Quiet Time",           category: "rest",     duration: 15 },
  { emoji: "🌙", label: "Bedtime",              category: "rest",     duration: 0 },
];
const TEMPLATE_CATEGORIES = { routine: "🔁 Routine", meals: "🍴 Meals", therapy: "💜 Therapy", play: "🎈 Play", learning: "📖 Learning", rest: "😌 Rest" };

// Per-category accent used to color timeline blocks and category pills —
// falls back to the primary teal for items with no category (legacy items,
// or a custom activity where the caregiver skipped picking one).
const CATEGORY_COLORS = {
  routine:  { c: T.teal,   l: T.tealL },
  meals:    { c: T.amber,  l: T.amberL },
  therapy:  { c: T.violet, l: T.violetL },
  play:     { c: T.green,  l: T.greenL },
  learning: { c: T.indigo, l: T.indigoL },
  rest:     { c: T.slate,  l: T.slateL },
};
const categoryColor = category => CATEGORY_COLORS[category] || { c: T.purple, l: T.purpleL };

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

// 15-minute increments, 12-hour labels — matches Google Calendar's time picker.
const TIME_OPTIONS = (() => {
  const opts = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const h12 = h % 12 === 0 ? 12 : h % 12;
      opts.push({ value, label: `${h12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}` });
    }
  }
  return opts;
})();

function formatTimeLabel(value) {
  if (!value) return "";
  const [hStr, mStr] = value.split(":");
  const h = parseInt(hStr, 10);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${h < 12 ? "AM" : "PM"}`;
}

// Click-to-open dropdown of 15-min time slots, styled like Google Calendar's
// event time picker — replaces the native <input type="time"> scrubber.
function TimeSelect({ value, onChange, width = 118 }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const selectedRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (open && selectedRef.current) selectedRef.current.scrollIntoView({ block: "center" });
  }, [open]);

  return (
    <div ref={wrapRef} style={{ position: "relative", flexShrink: 0, width }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: T.r, border: `1.5px solid ${T.purple}`, fontSize: 13, fontFamily: T.fontBody, color: T.ink, background: T.surface, outline: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
        <span>{formatTimeLabel(value) || "Time"}</span>
        <span style={{ fontSize: 9, color: T.inkMuted }}>{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 60, width: Math.max(width, 116), maxHeight: 210, overflowY: "auto", background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.r, boxShadow: T.shadowM, padding: 4 }}>
          {TIME_OPTIONS.map(opt => (
            <button key={opt.value} ref={opt.value === value ? selectedRef : null} type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{ width: "100%", textAlign: "left", padding: "7px 10px", border: "none", borderRadius: 8, background: value === opt.value ? T.purpleL : "transparent", color: value === opt.value ? T.purple : T.ink, fontWeight: value === opt.value ? 800 : 600, fontSize: 13, cursor: "pointer", fontFamily: T.fontBody, display: "block" }}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LETTERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// An item recurs every day unless it has a non-empty, non-full `days` list
// (0=Sun..6=Sat) — added by parents for things like school that only happen
// on weekdays. Essentials never set `days`, so they always apply.
function appliesToday(item, dow) {
  return !item.days || item.days.length === 0 || item.days.length === 7 || item.days.includes(dow);
}

// "HH:MM" for right now, in the device's local time — comparable directly
// against item.time/endTime since both are zero-padded 24h strings.
function hhmmNow() {
  const d = new Date();
  return d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
}

// Adds a duration (minutes) to a "HH:MM" start time, wrapping past midnight.
function addMinutesToTime(time, minutes) {
  const [h, m] = time.split(":").map(Number);
  const total = (h * 60 + m + minutes + 1440) % 1440;
  return Math.floor(total / 60).toString().padStart(2, "0") + ":" + (total % 60).toString().padStart(2, "0");
}

// Compact label for a day pattern — recognizes the two common presets so
// "school every weekday" reads as "Weekdays" instead of "Mon, Tue, Wed, Thu, Fri".
function daysSummary(days) {
  if (!days || days.length === 0 || days.length === 7) return null;
  const sorted = [...days].sort();
  if (sorted.join(",") === "1,2,3,4,5") return "Weekdays";
  if (sorted.join(",") === "0,6") return "Weekends";
  return sorted.map(d => DAY_NAMES[d]).join(", ");
}

function timeRangeLabel(item) {
  return item.endTime ? `${formatTimeLabel(item.time)}–${formatTimeLabel(item.endTime)}` : formatTimeLabel(item.time);
}

const dayChipBtn = active => ({ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${active ? T.purple : T.border}`, background: active ? T.purple : T.surface, color: active ? "#fff" : T.ink, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody, flexShrink: 0 });
const dayPresetBtn = { border: "none", background: T.surface, color: T.purple, fontSize: 11, fontWeight: 700, padding: "5px 9px", borderRadius: 99, cursor: "pointer", fontFamily: T.fontBody };

// Day-of-week picker for a recurring activity — tap letters to toggle, or use
// a preset. `selected` is an array of 0-6 (Sun..Sat).
function DayChips({ selected, onSet }) {
  const toggle = d => onSet(selected.includes(d) ? selected.filter(x => x !== d) : [...selected, d].sort());
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <button type="button" onClick={() => onSet([1, 2, 3, 4, 5])} style={dayPresetBtn}>Weekdays</button>
        <button type="button" onClick={() => onSet([0, 6])} style={dayPresetBtn}>Weekends</button>
        <button type="button" onClick={() => onSet([0, 1, 2, 3, 4, 5, 6])} style={dayPresetBtn}>Every day</button>
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        {DAY_LETTERS.map((lbl, d) => (
          <button key={d} type="button" onClick={() => toggle(d)} style={dayChipBtn(selected.includes(d))}>{lbl}</button>
        ))}
      </div>
    </div>
  );
}

const modeTabBtn = active => ({ flex: 1, padding: 10, borderRadius: T.r, border: `1.5px solid ${active ? T.purple : T.border}`, background: active ? T.purpleL : T.surface, fontSize: 13, fontWeight: 700, color: active ? T.purple : T.inkMuted, cursor: "pointer", fontFamily: T.fontBody });
const catChipBtn = active => ({ padding: "6px 12px", borderRadius: 99, border: `1.5px solid ${active ? T.purple : T.border}`, background: active ? T.purpleL : T.surface, fontSize: 12, fontWeight: 700, color: active ? T.purple : T.inkMuted, cursor: "pointer", fontFamily: T.fontBody, whiteSpace: "nowrap" });

// Colored category pills for the add/edit form — same six buckets as the
// template picker, but selectable on their own for custom activities and
// re-editable after a template's been picked.
function CategoryPills({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {Object.entries(TEMPLATE_CATEGORIES).map(([k, label]) => {
        const { c, l } = categoryColor(k);
        const active = value === k;
        return (
          <button key={k} type="button" onClick={() => onChange(active ? null : k)} style={{ padding: "6px 12px", borderRadius: 99, border: `1.5px solid ${active ? c : T.border}`, background: active ? l : T.surface, fontSize: 12, fontWeight: 700, color: active ? c : T.inkMuted, cursor: "pointer", fontFamily: T.fontBody, whiteSpace: "nowrap" }}>{label}</button>
        );
      })}
    </div>
  );
}

// Bottom-sheet for creating an "Added by you" activity — tap a template
// (emoji + label + duration filled in one go) or build a custom one, then set
// the time, an optional repeat pattern and notes.
function AddActivityModal({ newItem, setNewItem, showEmojiPicker, setShowEmojiPicker, onAdd, onClose }) {
  const [mode, setMode] = useState("template");
  const [selectedCat, setSelectedCat] = useState(null);
  const filtered = selectedCat ? ADD_ACTIVITY_TEMPLATES.filter(t => t.category === selectedCat) : ADD_ACTIVITY_TEMPLATES;
  const pickTemplate = t => setNewItem(n => ({ ...n, emoji: t.emoji, label: t.label, category: t.category, endTime: t.duration > 0 ? addMinutesToTime(n.time, t.duration) : "" }));
  const isPicked = t => newItem.emoji === t.emoji && newItem.label === t.label;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(35,32,28,0.45)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 420, maxHeight: "88vh", overflowY: "auto", boxSizing: "border-box", padding: "20px 20px 28px", boxShadow: T.shadowM, fontFamily: T.fontBody }}>
        <div style={{ width: 40, height: 4, background: T.border, borderRadius: 2, margin: "0 auto 16px" }} />
        <p style={{ margin: "0 0 16px", fontWeight: 800, color: T.ink, fontSize: 17, textAlign: "center" }}>New Activity</p>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button type="button" onClick={() => setMode("template")} style={modeTabBtn(mode === "template")}>📋 Template</button>
          <button type="button" onClick={() => setMode("custom")} style={modeTabBtn(mode === "custom")}>✏️ Custom</button>
        </div>

        {mode === "template" ? (
          <>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              <button type="button" onClick={() => setSelectedCat(null)} style={catChipBtn(!selectedCat)}>All</button>
              {Object.entries(TEMPLATE_CATEGORIES).map(([k, v]) => (
                <button key={k} type="button" onClick={() => setSelectedCat(k)} style={catChipBtn(selectedCat === k)}>{v}</button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {filtered.map(t => (
                <button key={t.label} type="button" onClick={() => pickTemplate(t)} style={{ padding: "14px 10px", borderRadius: T.r, border: `2px solid ${isPicked(t) ? T.purple : T.border}`, background: isPicked(t) ? T.purpleL : T.canvas, cursor: "pointer", textAlign: "center", fontFamily: T.fontBody }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{t.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: T.inkMuted, marginTop: 2 }}>{t.duration > 0 ? `${t.duration} min` : "no end time"}</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ fontSize: 24, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: T.r, padding: "6px 10px", cursor: "pointer" }}>{newItem.emoji}</button>
              <input value={newItem.label} onChange={e => setNewItem({ ...newItem, label: e.target.value })} placeholder="Activity name" style={{ flex: 1, minWidth: 0, boxSizing: "border-box", padding: "8px 12px", borderRadius: T.r, border: `1.5px solid ${T.purple}`, fontSize: 14, fontFamily: T.fontBody, color: T.ink, outline: "none", background: T.surface }} />
            </div>
            {showEmojiPicker && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: 10, background: T.canvas, borderRadius: T.r, marginBottom: 10 }}>{EMOJI_OPTS.map(e => <button key={e} type="button" onClick={() => { setNewItem({ ...newItem, emoji: e }); setShowEmojiPicker(false); }} style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer", borderRadius: 8, padding: 3 }}>{e}</button>)}</div>}
          </>
        )}

        <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: T.inkMuted }}>Starts</p>
        <div style={{ marginBottom: 12 }}>
          <TimeSelect value={newItem.time} onChange={v => setNewItem({ ...newItem, time: v })} width={140} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: T.inkMuted }}>Ends</p>
          <button type="button" onClick={() => setNewItem(n => ({ ...n, endTime: n.endTime ? "" : addMinutesToTime(n.time, 30) }))} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, color: T.purple, fontFamily: T.fontBody }}>
            {newItem.endTime ? "No end time" : "+ Set end time"}
          </button>
        </div>
        {newItem.endTime && (
          <div style={{ marginBottom: 14 }}>
            <TimeSelect value={newItem.endTime} onChange={v => setNewItem({ ...newItem, endTime: v })} width={140} />
          </div>
        )}

        <p style={{ margin: "14px 0 8px", fontSize: 12, fontWeight: 700, color: T.inkMuted }}>Category</p>
        <div style={{ marginBottom: 14 }}>
          <CategoryPills value={newItem.category} onChange={cat => setNewItem({ ...newItem, category: cat })} />
        </div>

        <button type="button" onClick={() => setNewItem(n => ({ ...n, isRecurring: !n.isRecurring, days: !n.isRecurring && n.days.length === 0 ? [1, 2, 3, 4, 5] : n.days }))} style={{ border: "none", background: "none", padding: "0 0 10px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: T.purple, fontFamily: T.fontBody, display: "block" }}>
          {newItem.isRecurring ? "✕ Remove day pattern" : "+ Repeat on specific days (e.g. school on weekdays)"}
        </button>
        {newItem.isRecurring && <DayChips selected={newItem.days} onSet={d => setNewItem({ ...newItem, days: d })} />}

        <p style={{ margin: "10px 0 8px", fontSize: 12, fontWeight: 700, color: T.inkMuted }}>Notes (optional)</p>
        <input value={newItem.notes} onChange={e => setNewItem({ ...newItem, notes: e.target.value })} placeholder="e.g. Avoid loud noises" style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: T.r, border: `1.5px solid ${T.border}`, fontSize: 13, fontFamily: T.fontBody, color: T.ink, outline: "none", background: T.surface, marginBottom: 16 }} />

        <p style={{ margin: "0 0 12px", color: T.inkMuted, fontSize: 11, lineHeight: 1.5 }}>You can edit or remove this anytime — it's yours, not an essential.</p>

        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onAdd} disabled={!newItem.label.trim()} style={{ flex: 1 }}>Add ✓</Btn>
          <Btn onClick={onClose} secondary style={{ flex: 1 }}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

function DoneDot({ state }) {
  if (state === "done") return <div style={{ width: 24, height: 24, borderRadius: "50%", background: T.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span></div>;
  if (state === "skip") return <div style={{ width: 24, height: 24, borderRadius: "50%", border: `1.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ color: T.inkMuted, fontSize: 14, fontWeight: 900, lineHeight: 1 }}>–</span></div>;
  return <div style={{ width: 24, height: 24, borderRadius: "50%", border: `1.5px solid ${T.border}`, flexShrink: 0 }} />;
}

// Caregiver-facing status: a colored dot + plain-language word, not a percentage —
// meant to be scannable at a glance rather than requiring any interpretation.
const STATUS_META = {
  completed:   { label: "Completed",   color: T.green },
  in_progress: { label: "In Progress", color: T.teal },
  upcoming:    { label: "Upcoming",    color: T.amber },
  missed:      { label: "Missed",      color: T.red },
  skipped:     { label: "Skipped",     color: T.inkMuted },
};

function StatusPill({ status }) {
  const meta = STATUS_META[status];
  if (!meta) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: meta.color, flexShrink: 0 }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>{meta.label}</span>
    </div>
  );
}

// A single timeline row — a left time-column label plus a colored block
// (tinted by category) on the right. Essentials (from the default schedule)
// get a locked "…" menu with edit/skip; items the parent added get inline
// edit/delete. Merging essentials + added into one time-sorted timeline
// (instead of two separate list sections) is purely visual — the "done"
// semantics per type are unchanged: essentials tick over on the clock,
// added items need a tap.
function TimelineRow({ item, essential, status, skipped, notToday, onToggle, menuOpen, onMenuToggle, onEdit, onSkip, onDelete }) {
  const done = status === "completed";
  const inactive = status === "skipped" || notToday;
  const clickable = !essential && !inactive;
  const pattern = daysSummary(item.days);
  const { c, l } = categoryColor(item.category);
  return (
    <div style={{ position: "relative", display: "flex", gap: 10 }}>
      <div style={{ width: 44, flexShrink: 0, textAlign: "right", paddingTop: 12, fontSize: 11, fontWeight: 700, color: T.inkMuted, opacity: inactive ? 0.55 : 1 }}>
        {formatTimeLabel(item.time).replace(" ", " ")}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          onClick={() => clickable && onToggle()}
          role={clickable ? "button" : undefined}
          aria-label={clickable ? (done ? "Mark not done" : "Mark done") : undefined}
          style={{ padding: "10px 12px", borderRadius: T.r, background: done ? T.canvas : l, borderLeft: `3px solid ${done ? T.border : c}`, opacity: inactive ? 0.55 : 1, cursor: clickable ? "pointer" : "default", marginBottom: 8 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>{item.emoji}</span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: done ? T.inkMuted : T.ink, textDecoration: done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
            {essential && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 800, color: T.amber, background: T.amberL, padding: "3px 7px", borderRadius: 99, flexShrink: 0, whiteSpace: "nowrap" }}>🔒 Essential</span>}
            {essential ? (
              <button onClick={e => { e.stopPropagation(); onMenuToggle(); }} style={{ border: "none", background: "none", cursor: "pointer", padding: "2px 4px", fontSize: 18, fontWeight: 900, color: T.inkMuted, lineHeight: 1 }} aria-label="Options">⋯</button>
            ) : (
              <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                <button onClick={e => { e.stopPropagation(); onEdit(); }} style={{ background: T.surface, border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 12 }}>✏️</button>
                <button onClick={e => { e.stopPropagation(); onDelete(); }} style={{ background: T.redL, border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 12 }}>🗑️</button>
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 3 }}>
            {notToday ? <Badge color={T.inkMuted}>{pattern} · not today</Badge>
              : <Badge color={c}>{pattern ? `${pattern} · ` : ""}{timeRangeLabel(item)}</Badge>}
            {!notToday && <StatusPill status={status} />}
          </div>
          {item.notes && <p style={{ margin: "5px 0 0 30px", fontSize: 11, color: T.inkMuted, lineHeight: 1.4 }}>📝 {item.notes}</p>}
        </div>

        {menuOpen && (
          <div style={{ margin: "-4px 0 8px 0", border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", background: T.surface, boxShadow: T.shadowM }}>
            <button onClick={onEdit} style={{ ...rowMenuBtn, color: T.ink }}>✏️ Edit</button>
            <div style={{ height: 1, background: T.border }} />
            <button onClick={onSkip} style={{ ...rowMenuBtn, color: T.ink }}>{skipped ? "↩ Un-skip today" : "⏭ Skip for today"}</button>
            <div style={{ height: 1, background: T.border }} />
            <div style={{ ...rowMenuBtn, cursor: "default", color: T.inkMuted, fontSize: 12 }}>🔒 Essential · can't remove</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Horizontal Mon–Sun strip for quick day navigation from the live "today"
// view — tapping today keeps the live timeline, a past day with a saved
// history entry opens its read-only replay, and any other day (future, or
// past with nothing saved) opens a lightweight recurring-schedule preview.
function WeekStrip({ today, history, onSelect }) {
  const monOffset = (today.getDay() + 6) % 7;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - monOffset);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; });
  const todayKey = dateKey(today);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 4, marginBottom: 18 }}>
      {days.map((d, i) => {
        const dKey = dateKey(d);
        const isToday = dKey === todayKey;
        const entry = history.find(h => h.isoDate === dKey);
        return (
          <button key={i} onClick={() => onSelect(d, entry)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 2px", border: "none", borderRadius: T.r, background: isToday ? T.purple : "transparent", cursor: "pointer", fontFamily: T.fontBody }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: isToday ? "#fff" : T.inkMuted, textTransform: "uppercase" }}>{WEEKDAYS[i]}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: isToday ? "#fff" : T.ink }}>{d.getDate()}</span>
            <span style={{ width: 4, height: 4, borderRadius: 99, background: isToday ? "#fff" : entry ? (entry.completedCount >= entry.total ? T.green : T.amber) : "transparent" }} />
          </button>
        );
      })}
    </div>
  );
}

// Read-only preview of a non-today weekday's recurring schedule — opened
// from the week strip for a future day, or a past day with nothing saved.
// Not a checklist: just what would be scheduled, no done/status state.
function DayPreviewView({ date, items, onBack }) {
  const dow = date.getDay();
  const dayItems = items.filter(i => appliesToday(i, dow)).sort((a, b) => a.time.localeCompare(b.time));
  const label = date.toLocaleDateString("en-SG", { weekday: "long", day: "numeric", month: "short" });
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <button onClick={onBack} style={{ border: "none", background: T.border, cursor: "pointer", width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} aria-label="Back to today">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M11 3.5 L5 9 L11 14.5" stroke={T.inkMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
        </button>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontWeight: 800, color: T.ink, fontSize: 15 }}>{label}</p>
          <p style={{ margin: "2px 0 0", color: T.inkMuted, fontSize: 11 }}>{dayItems.length} scheduled</p>
        </div>
        <span style={{ width: 34, flexShrink: 0 }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {dayItems.length ? dayItems.map(item => {
          const { c, l } = categoryColor(item.category);
          return (
            <div key={item.id} style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 44, flexShrink: 0, textAlign: "right", paddingTop: 12, fontSize: 11, fontWeight: 700, color: T.inkMuted }}>{formatTimeLabel(item.time)}</div>
              <div style={{ flex: 1, minWidth: 0, padding: "10px 12px", borderRadius: T.r, background: l, borderLeft: `3px solid ${c}`, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>{item.emoji}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                <Badge color={c}>{timeRangeLabel(item)}</Badge>
              </div>
            </div>
          );
        }) : <p style={{ color: T.inkMuted, fontSize: 12, margin: 0 }}>Nothing scheduled this day.</p>}
      </div>

      <p style={{ textAlign: "center", color: T.inkMuted, fontSize: 11, fontWeight: 700, marginTop: 8 }}>Preview · not yet happened</p>
    </>
  );
}

// Read-only row for a past day's snapshot — no toggle/edit/menu, just what
// happened (done vs missed), matching the live row's look.
function HistoryRow({ item }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 2px", opacity: item.done ? 1 : 0.6 }}>
      <DoneDot state={item.done ? "done" : "todo"} />
      <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{item.emoji}</span>
      <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: item.done ? T.ink : T.inkMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
      <Badge color={item.done ? T.purple : T.inkMuted}>{timeRangeLabel(item)}</Badge>
    </div>
  );
}

// Full-page read-only replay of a past day, opened by tapping a date on the
// month calendar — mirrors the live "today" list's Essentials/Added-by-you
// layout instead of a summary sheet. Entries saved before the `essential`
// flag existed fall back to one flat list.
function DayHistoryView({ entry, onBack }) {
  const dayItems = [
    ...entry.completed.map(i => ({ ...i, done: true })),
    ...entry.missed.map(i => ({ ...i, done: false })),
  ].sort((a, b) => a.time.localeCompare(b.time));
  const hasEssentialFlag = dayItems.some(i => "essential" in i);
  const essentials = hasEssentialFlag ? dayItems.filter(i => i.essential) : dayItems;
  const added = hasEssentialFlag ? dayItems.filter(i => !i.essential) : [];

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <button onClick={onBack} style={{ border: "none", background: T.border, cursor: "pointer", width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} aria-label="Back to month">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M11 3.5 L5 9 L11 14.5" stroke={T.inkMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
        </button>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontWeight: 800, color: T.ink, fontSize: 15 }}>{entry.date}</p>
          <p style={{ margin: "2px 0 0", color: T.inkMuted, fontSize: 11 }}>{entry.completedCount} of {entry.total} activities</p>
        </div>
        <span style={{ width: 34, flexShrink: 0 }} />
      </div>

      <SectionLabel>Essentials</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 18 }}>
        {essentials.length ? essentials.map((it, i) => <HistoryRow key={i} item={it} />) : <p style={{ color: T.inkMuted, fontSize: 12, margin: 0 }}>No activities recorded.</p>}
      </div>

      {hasEssentialFlag && added.length > 0 && (
        <>
          <SectionLabel>Added by you</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 12 }}>
            {added.map((it, i) => <HistoryRow key={i} item={it} />)}
          </div>
        </>
      )}

      <p style={{ textAlign: "center", color: T.inkMuted, fontSize: 11, fontWeight: 700, marginTop: 8 }}>Day view · history</p>
    </>
  );
}

export function ScheduleScreen({ childCtx, push }) {
  const { activeChild, updateChild, children } = childCtx;
  const [scheduleView, setScheduleView] = useState("today"); // "today" | "month" | "day"
  const [monthCur, setMonthCur] = useState(() => { const t = new Date(); return { y: t.getFullYear(), m: t.getMonth() }; });
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [previewDate, setPreviewDate] = useState(null);
  const [dayReturnTo, setDayReturnTo] = useState("month"); // where "day" view's back button goes: "month" or "today"
  const [kidView, setKidView] = useState(false);
  const [skippedToday, setSkippedToday] = useState([]);
  const [menuFor, setMenuFor] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ emoji: "⭐", label: "", time: "08:00", endTime: "08:30", category: null, notes: "", days: [], isRecurring: false });
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
  const [nowHHMM, setNowHHMM] = useState(() => hhmmNow());

  // Essentials aren't a manual checklist — they're reminders tied to the clock,
  // so their "done" state ticks over on its own once their time has passed.
  useEffect(() => {
    const iv = setInterval(() => setNowHHMM(hhmmNow()), 30000);
    return () => clearInterval(iv);
  }, []);

  useBackHandler(showEmojiPicker, () => setShowEmojiPicker(false));
  useBackHandler(showAlarmSettings, () => setShowAlarmSettings(false));
  useBackHandler(showAdd, () => { setShowAdd(false); setShowEmojiPicker(false); });
  useBackHandler(!!editing, () => { setEditing(null); setShowEmojiPicker(false); });
  useBackHandler(kidView, () => setKidView(false));
  useBackHandler(scheduleView === "day", () => setScheduleView(dayReturnTo));
  useBackHandler(scheduleView === "preview", () => { setScheduleView("today"); setPreviewDate(null); });

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
      const items = activeChild?.scheduleItems?.length ? activeChild.scheduleItems : DEFAULT_SCHEDULE;
      const now = new Date();
      const hhmm = now.getHours().toString().padStart(2,"0") + ":" + now.getMinutes().toString().padStart(2,"0");
      const match = items.find(i => (i.time === hhmm || i.endTime === hhmm) && appliesToday(i, now.getDay()));
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

  const items = activeChild.scheduleItems?.length ? activeChild.scheduleItems : DEFAULT_SCHEDULE;
  const history = activeChild.history || [];
  const today = startOfDay(new Date());
  const todayStr = dateKey(today);
  const todayDow = today.getDay(); // 0=Sun..6=Sat, for recurring "Added by you" activities
  // Checkmarks are pinned to today's date — a new day starts unchecked even if "Save Day" was skipped.
  const done = activeChild.todayDoneDate === todayStr ? activeChild.todayDone || {} : {};

  // "Essentials" are the default schedule's items (locked, can't be deleted — only
  // edited or skipped for the day); anything the parent added on top is removable.
  const isEssential = item => DEFAULT_SCHEDULE.some(d => d.id === item.id);
  const sorted = [...items].sort((a, b) => a.time.localeCompare(b.time));
  const essentials = sorted.filter(isEssential);
  const added = sorted.filter(i => !isEssential(i));

  // Caregiver-facing status for a row — five plain states instead of a raw
  // percentage. Essentials are reminders tied to the clock: they auto-complete
  // once their time passes and never sit as "Missed" (that's the point of
  // wiring them to the alarm instead of a checklist). Added items still need a
  // manual tap, so an unaddressed one flips to "Missed" once its time is gone.
  const activityStatus = item => {
    if (skippedToday.includes(item.id)) return "skipped";
    const start = item.time, end = item.endTime || item.time;
    if (isEssential(item)) {
      if (nowHHMM < start) return "upcoming";
      if (item.endTime && nowHHMM < end) return "in_progress";
      return "completed";
    }
    if (done[item.id]) return "completed";
    if (nowHHMM < start) return "upcoming";
    if (item.endTime && nowHHMM < end) return "in_progress";
    return "missed";
  };
  const isCompleted = item => activityStatus(item) === "completed";

  const activeItems = items.filter(i => !skippedToday.includes(i.id) && appliesToday(i, todayDow));
  const completedCount = activeItems.filter(isCompleted).length;
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
    if (newItem.endTime) item.endTime = newItem.endTime;
    if (newItem.category) item.category = newItem.category;
    if (newItem.notes.trim()) item.notes = newItem.notes.trim();
    if (newItem.isRecurring && newItem.days.length) item.days = newItem.days;
    updateChild(activeChild.id, { scheduleItems: [...items, item] });
    setNewItem({ emoji: "⭐", label: "", time: "08:00", endTime: "08:30", category: null, notes: "", days: [], isRecurring: false }); setShowAdd(false);
  };

  const deleteItem = id => updateChild(activeChild.id, { scheduleItems: items.filter(i => i.id !== id) });

  const startEdit = item => {
    setEditing(item.id);
    setEditData({ ...item, isRecurring: !!(item.days && item.days.length), days: item.days || [], notes: item.notes || "" });
    setMenuFor(null);
  };
  const saveEdit = () => {
    const { isRecurring, ...rest } = editData;
    const item = { ...rest };
    if (!item.endTime) delete item.endTime;
    if (!item.category) delete item.category;
    if (item.notes && item.notes.trim()) item.notes = item.notes.trim(); else delete item.notes;
    if (!(isRecurring && item.days && item.days.length)) delete item.days;
    updateChild(activeChild.id, { scheduleItems: items.map(i => i.id === editing ? item : i) });
    setEditing(null);
  };

  const saveDay = () => {
    const entry = {
      id: Date.now().toString(),
      isoDate: todayStr,
      date: new Date().toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
      total: activeItems.length, completedCount,
      completed: activeItems.filter(isCompleted).map(i => ({ emoji: i.emoji, label: i.label, time: i.time, endTime: i.endTime, essential: isEssential(i) })),
      missed: activeItems.filter(i => !isCompleted(i)).map(i => ({ emoji: i.emoji, label: i.label, time: i.time, endTime: i.endTime, essential: isEssential(i) })),
    };
    updateChild(activeChild.id, { history: [entry, ...history].slice(0, 30), todayDone: {}, todayDoneDate: todayStr });
    setSkippedToday([]);
    alert("✅ Day saved!");
  };

  // Kid view — the single next thing to do, in order, across essentials + added.
  const kidList = [...essentials, ...added].filter(i => !skippedToday.includes(i.id) && appliesToday(i, todayDow)).sort((a, b) => a.time.localeCompare(b.time));
  const nextKidItem = kidList.find(i => !isCompleted(i));
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
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: T.inkMuted }}>Starts</p>
          <div style={{ marginBottom: 8 }}>
            <TimeSelect value={editData.time} onChange={v => setEditData({ ...editData, time: v })} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: T.inkMuted }}>Ends</p>
            <button type="button" onClick={() => setEditData(d => ({ ...d, endTime: d.endTime ? "" : addMinutesToTime(d.time, 30) }))} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, color: T.purple, fontFamily: T.fontBody }}>
              {editData.endTime ? "No end time" : "+ Set end time"}
            </button>
          </div>
          {editData.endTime && (
            <div style={{ marginBottom: 12 }}>
              <TimeSelect value={editData.endTime} onChange={v => setEditData({ ...editData, endTime: v })} />
            </div>
          )}
          <p style={{ margin: "12px 0 8px", fontSize: 12, fontWeight: 700, color: T.inkMuted }}>Category</p>
          <div style={{ marginBottom: 12 }}>
            <CategoryPills value={editData.category} onChange={cat => setEditData({ ...editData, category: cat })} />
          </div>
          <button onClick={() => setEditData(d => ({ ...d, isRecurring: !d.isRecurring, days: !d.isRecurring && d.days.length === 0 ? [1, 2, 3, 4, 5] : d.days }))} style={{ border: "none", background: "none", padding: "0 0 10px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: T.purple, fontFamily: T.fontBody, display: "block" }}>
            {editData.isRecurring ? "✕ Remove day pattern" : "+ Repeat on specific days (e.g. school on weekdays)"}
          </button>
          {editData.isRecurring && <DayChips selected={editData.days} onSet={d => setEditData({ ...editData, days: d })} />}
          {showEmojiPicker && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: 10, background: T.surface, borderRadius: T.r, marginBottom: 10 }}>{EMOJI_OPTS.map(e => <button key={e} onClick={() => { setEditData({ ...editData, emoji: e }); setShowEmojiPicker(false); }} style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer", borderRadius: 8, padding: 3 }}>{e}</button>)}</div>}
          <p style={{ margin: "10px 0 8px", fontSize: 12, fontWeight: 700, color: T.inkMuted }}>Notes (optional)</p>
          <input value={editData.notes || ""} onChange={e => setEditData({ ...editData, notes: e.target.value })} placeholder="e.g. Avoid loud noises" style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: T.r, border: `1.5px solid ${T.border}`, fontSize: 13, fontFamily: T.fontBody, color: T.ink, outline: "none", background: T.surface, marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={saveEdit} style={{ flex: 1 }}>Save</Btn>
            <Btn onClick={() => setEditing(null)} secondary style={{ flex: 1 }}>Cancel</Btn>
          </div>
        </Card>
      );
    }
    return (
      <TimelineRow key={item.id} item={item} essential={essential} status={activityStatus(item)} skipped={skippedToday.includes(item.id)} notToday={!appliesToday(item, todayDow)}
        onToggle={essential ? undefined : () => toggleDone(item.id)}
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
          <WeekStrip today={today} history={history} onSelect={(d, entry) => {
            const dKey = dateKey(d);
            if (dKey === todayStr) return;
            if (d < today && entry) { setSelectedEntry(entry); setDayReturnTo("today"); setScheduleView("day"); }
            else { setPreviewDate(d); setScheduleView("preview"); }
          }} />

          {nextKidItem && (
            <Card style={{ marginBottom: 16, border: `1.5px solid ${T.purple}`, background: T.purpleL }}>
              <p style={{ margin: "0 0 10px", fontWeight: 800, color: T.purple, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Next</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 30, lineHeight: 1, flexShrink: 0 }}>{nextKidItem.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 800, color: T.ink, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nextKidItem.label}</p>
                  <p style={{ margin: "2px 0 0", color: T.inkMuted, fontSize: 12, fontWeight: 700 }}>{timeRangeLabel(nextKidItem)}</p>
                </div>
              </div>
              {alarmOn && <p style={{ margin: "10px 0 0", color: T.purple, fontSize: 11, fontWeight: 700 }}>🔔 Alarm will ring at this time</p>}
            </Card>
          )}

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

          <SectionLabel action={<span style={{ display: "flex", alignItems: "center", gap: 3, fontFamily: T.fontBody, fontSize: 11, fontWeight: 700, color: T.inkMuted, textTransform: "none", letterSpacing: 0 }}>🔒 essential · ✏️ yours</span>}>Timeline</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", marginBottom: 12 }}>
            {sorted.map(item => renderItem(item, isEssential(item)))}
            {sorted.length === 0 && <p style={{ color: T.inkMuted, fontSize: 12, margin: 0 }}>No activities set up.</p>}
          </div>

          <button onClick={() => setShowAdd(true)} style={{ width: "100%", margin: "2px 0 16px", border: `1.5px dashed ${T.border}`, background: "none", color: T.ink, borderRadius: T.r, padding: "11px", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: T.fontBody }}>+ Add activity</button>

          {showAdd && (
            <AddActivityModal
              newItem={newItem}
              setNewItem={setNewItem}
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
              onAdd={addItem}
              onClose={() => { setShowAdd(false); setShowEmojiPicker(false); }}
            />
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

          <Card style={{ padding: "16px 10px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", paddingBottom: 10, marginBottom: 6, borderBottom: `1px solid ${T.border}` }}>
              {WEEKDAYS.map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 800, color: T.inkMuted, letterSpacing: "0.04em" }}>{d}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
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
                    onClick={() => { if (isToday) setScheduleView("today"); else if (entry) { setSelectedEntry(entry); setDayReturnTo("month"); setScheduleView("day"); } }}
                    style={{ aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, border: "none", background: isToday ? T.purple : "transparent", borderRadius: "50%", cursor: clickable ? "pointer" : "default", fontFamily: "inherit", transition: "background 0.15s" }}>
                    <span style={{ fontSize: 12, fontWeight: isToday ? 800 : 600, color: isToday ? "#fff" : future ? T.inkMuted : T.ink, opacity: future ? 0.4 : 1 }}>{d.getDate()}</span>
                    <span style={{ width: 5, height: 5, borderRadius: 99, background: isToday ? "rgba(255,255,255,0.7)" : dotColor, border: hollow ? `1.3px solid ${T.border}` : "none" }} />
                  </button>
                );
              })}
            </div>
          </Card>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", padding: "14px 0 4px", fontSize: 11, color: T.inkMuted, fontWeight: 700 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: T.green, display: "inline-block" }} /> all done</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: T.amber, display: "inline-block" }} /> some done</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 99, border: `1.3px solid ${T.border}`, display: "inline-block" }} /> rest day</span>
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

      {scheduleView === "day" && selectedEntry && (
        <DayHistoryView entry={selectedEntry} onBack={() => { setScheduleView(dayReturnTo); setSelectedEntry(null); }} />
      )}

      {scheduleView === "preview" && previewDate && (
        <DayPreviewView date={previewDate} items={items} onBack={() => { setScheduleView("today"); setPreviewDate(null); }} />
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
