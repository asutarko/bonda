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

export function ScheduleScreen({ childCtx, push }) {
  const { activeChild, updateChild, children } = childCtx;
  const [scheduleView, setScheduleView] = useState("today");
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ emoji: "⭐", label: "", time: "08:00" });
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
      const match = items.find(i => i.time === hhmm);
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

  const items = activeChild.scheduleItems || DEFAULT_SCHEDULE;
  const history = activeChild.history || [];
  const sorted = [...items].sort((a, b) => a.time.localeCompare(b.time));
  const todayStr = new Date().toISOString().slice(0, 10);
  // Checkmarks are pinned to today's date — a new day starts unchecked even if "Save Day" was skipped.
  const done = activeChild.todayDoneDate === todayStr ? activeChild.todayDone || {} : {};
  const completedCount = items.filter(i => done[i.id]).length;
  const progress = items.length ? Math.round((completedCount / items.length) * 100) : 0;

  const toggleDone = id => updateChild(activeChild.id, { todayDone: { ...done, [id]: !done[id] }, todayDoneDate: todayStr });

  const addItem = () => {
    if (!newItem.label.trim()) return;
    const id = Date.now().toString();
    updateChild(activeChild.id, { scheduleItems: [...items, { ...newItem, id }] });
    setNewItem({ emoji: "⭐", label: "", time: "08:00" }); setShowAdd(false);
  };

  const deleteItem = id => updateChild(activeChild.id, { scheduleItems: items.filter(i => i.id !== id) });

  const startEdit = item => { setEditing(item.id); setEditData({ ...item }); };
  const saveEdit = () => {
    updateChild(activeChild.id, { scheduleItems: items.map(i => i.id === editing ? { ...editData } : i) });
    setEditing(null);
  };

  const saveDay = () => {
    const entry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
      total: items.length, completedCount,
      completed: items.filter(i => done[i.id]).map(i => ({ emoji: i.emoji, label: i.label, time: i.time })),
      missed: items.filter(i => !done[i.id]).map(i => ({ emoji: i.emoji, label: i.label, time: i.time })),
    };
    updateChild(activeChild.id, { history: [entry, ...history].slice(0, 30), todayDone: {}, todayDoneDate: todayStr });
    alert("✅ Day saved!");
  };

  return (
    <Page>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: "12px 16px", background: T.purpleL, borderRadius: T.r, border: `1px solid ${T.purple}20` }}>
        <ChildAvatar value={activeChild.emoji} size={52} active={true} borderColor={T.purple} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 2px", fontWeight: 800, color: T.purple, fontSize: 16 }}>{activeChild.name}'s Schedule</p>
          {children.length > 1 && <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>Switch child on Home tab</p>}
        </div>

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


      <div style={{ display: "flex", background: T.border, borderRadius: T.r, padding: 3, gap: 3, marginBottom: 20 }}>
        {[["today","Today"],["history",`History${history.length ? ` (${history.length})` : ""}`]].map(([v, l]) => (
          <button key={v} onClick={() => setScheduleView(v)} style={{ flex: 1, padding: "10px", borderRadius: 9, background: scheduleView === v ? T.surface : "transparent", border: "none", fontWeight: 700, fontSize: 13, color: scheduleView === v ? T.ink : T.inkMuted, cursor: "pointer", fontFamily: T.fontBody, boxShadow: scheduleView === v ? T.shadow : "none" }}>{l}</button>
        ))}
      </div>

      {scheduleView === "today" && (
        <>

          <Card style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ margin: 0, fontWeight: 700, color: T.ink, fontSize: 14 }}>Today's Progress</p>
              <p style={{ margin: 0, fontWeight: 800, color: T.purple, fontSize: 14 }}>{progress}%</p>
            </div>
            <div style={{ height: 6, background: T.border, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: T.purple, borderRadius: 99, transition: "width 0.4s ease" }} />
            </div>
            <p style={{ margin: "8px 0 0", color: T.inkMuted, fontSize: 12 }}>{completedCount} of {items.length} activities done</p>
          </Card>


          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {sorted.map(item => editing === item.id ? (
              <Card key={item.id} style={{ background: T.purpleL }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ fontSize: 24, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: T.r, padding: "6px 10px", cursor: "pointer" }}>{editData.emoji}</button>
                  <input value={editData.label} onChange={e => setEditData({ ...editData, label: e.target.value })} style={{ flex: 1, minWidth: 0, boxSizing: "border-box", padding: "8px 12px", borderRadius: T.r, border: `1.5px solid ${T.purple}`, fontSize: 14, fontFamily: T.fontBody, color: T.ink, background: T.surface, outline: "none" }} />
                  <input type="time" value={editData.time} onChange={e => setEditData({ ...editData, time: e.target.value })} style={{ flexShrink: 0, boxSizing: "border-box", padding: "8px 10px", borderRadius: T.r, border: `1.5px solid ${T.purple}`, fontSize: 13, fontFamily: T.fontBody, color: T.ink, background: T.surface, outline: "none", width: 88 }} />
                </div>
                {showEmojiPicker && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: 10, background: T.surface, borderRadius: T.r, marginBottom: 10 }}>{EMOJI_OPTS.map(e => <button key={e} onClick={() => { setEditData({ ...editData, emoji: e }); setShowEmojiPicker(false); }} style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer", borderRadius: 8, padding: 3 }}>{e}</button>)}</div>}
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={saveEdit} style={{ flex: 1 }}>Save</Btn>
                  <Btn onClick={() => setEditing(null)} secondary style={{ flex: 1 }}>Cancel</Btn>
                </div>
              </Card>
            ) : (
              <Card key={item.id} onClick={() => toggleDone(item.id)} style={{ background: done[item.id] ? T.greenL : T.surface, border: `1px solid ${done[item.id] ? T.green + "40" : T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{item.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, color: T.ink, fontSize: 14, textDecoration: done[item.id] ? "line-through" : "none", opacity: done[item.id] ? 0.5 : 1 }}>{item.label}</p>
                    <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>{item.time}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => startEdit(item)} style={{ background: T.border, border: "none", borderRadius: 8, padding: "5px 9px", cursor: "pointer", fontSize: 13 }}>✏️</button>
                    <button onClick={() => deleteItem(item.id)} style={{ background: T.redL, border: "none", borderRadius: 8, padding: "5px 9px", cursor: "pointer", fontSize: 13 }}>🗑️</button>
                  </div>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: done[item.id] ? T.green : T.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
                    {done[item.id] && <span style={{ color: "white", fontSize: 12, fontWeight: 900 }}>✓</span>}
                  </div>
                </div>
              </Card>
            ))}
          </div>


          {showAdd && (
            <Card style={{ background: T.purpleL, marginBottom: 10 }}>
              <p style={{ margin: "0 0 10px", fontWeight: 800, color: T.purple, fontSize: 14 }}>New Activity</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ fontSize: 24, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: T.r, padding: "6px 10px", cursor: "pointer" }}>{newItem.emoji}</button>
                <input value={newItem.label} onChange={e => setNewItem({ ...newItem, label: e.target.value })} placeholder="Activity name" style={{ flex: 1, minWidth: 0, boxSizing: "border-box", padding: "8px 12px", borderRadius: T.r, border: `1.5px solid ${T.purple}`, fontSize: 14, fontFamily: T.fontBody, color: T.ink, outline: "none", background: T.surface }} />
                <input type="time" value={newItem.time} onChange={e => setNewItem({ ...newItem, time: e.target.value })} style={{ flexShrink: 0, boxSizing: "border-box", padding: "8px 8px", borderRadius: T.r, border: `1.5px solid ${T.purple}`, fontSize: 13, fontFamily: T.fontBody, color: T.ink, outline: "none", width: 88, background: T.surface }} />
              </div>
              {showEmojiPicker && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: 10, background: T.surface, borderRadius: T.r, marginBottom: 10 }}>{EMOJI_OPTS.map(e => <button key={e} onClick={() => { setNewItem({ ...newItem, emoji: e }); setShowEmojiPicker(false); }} style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer", borderRadius: 8, padding: 3 }}>{e}</button>)}</div>}
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={addItem} style={{ flex: 1 }}>Add ✓</Btn>
                <Btn onClick={() => setShowAdd(false)} secondary style={{ flex: 1 }}>Cancel</Btn>
              </div>
            </Card>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={() => setShowAdd(!showAdd)} secondary style={{ flex: 1 }}>{showAdd ? "✕ Cancel" : "+ Add Activity"}</Btn>
            <Btn onClick={saveDay} style={{ flex: 1, background: T.green }}>💾 Save Day</Btn>
          </div>
          <p style={{ color: T.inkMuted, fontSize: 11, textAlign: "center", marginTop: 10 }}>Tap "Save Day" at end of day to record to history</p>
        </>
      )}

      {scheduleView === "history" && (
        history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
              <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
                <circle cx="48" cy="48" r="42" fill={T.purpleL} opacity="0.7"/>
                <rect x="22" y="26" width="52" height="46" rx="7" fill={T.surface} stroke={T.purple} strokeWidth="1.4"/>
                <path d="M34 26 L34 32 M62 26 L62 32" stroke={T.purple} strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M22 40 L74 40" stroke={T.purple} strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
                <rect x="30" y="49" width="16" height="14" rx="3" fill={T.purpleL} stroke={T.purple} strokeWidth="1.2"/>
                <path d="M33 56 L36 59 L42 53" stroke={T.purple} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                <rect x="52" y="49" width="16" height="14" rx="3" fill={T.border}/>
                <path d="M56 56 L64 56 M56 60 L62 60" stroke={T.inkMuted} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>

                <circle cx="74" cy="26" r="8" fill={T.amber} opacity="0.9"/>
                <path d="M70.5 26 L77.5 26 M74 22.5 L74 29.5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <p style={{ fontWeight: 800, color: T.ink, fontSize: 16, margin: "0 0 8px" }}>No records yet</p>
            <p style={{ color: T.inkSoft, fontSize: 13, lineHeight: 1.7, maxWidth: 240, margin: "0 auto" }}>Complete today's schedule and tap <strong style={{ color: T.purple }}>"Save Day"</strong> to start tracking your child's history.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {history.map(entry => <HistoryCard key={entry.id} entry={entry} />)}
          </div>
        )
      )}
    </Page>
  );
}

export function HistoryCard({ entry }) {
  const [open, setOpen] = useState(false);
  const pct = Math.round((entry.completedCount / entry.total) * 100);
  const color = pct >= 80 ? T.green : pct >= 50 ? T.amber : T.red;
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "14px 16px", cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div><p style={{ margin: "0 0 2px", fontWeight: 800, color: T.ink, fontSize: 14 }}>{entry.date}</p><p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>{entry.completedCount}/{entry.total} completed</p></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Badge color={color} bg={color + "18"}>{pct}%</Badge>
            <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 18, transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block" }}>+</span>
          </div>
        </div>
        <div style={{ height: 4, background: T.border, borderRadius: 99 }}><div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99 }} /></div>
      </div>
      {open && (
        <div style={{ padding: "0 16px 14px" }}>
          {entry.completed.length > 0 && <><p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase", letterSpacing: "0.07em" }}>✅ Completed</p>{entry.completed.map((a, i) => <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderTop: `1px solid ${T.border}`, alignItems: "center" }}><span style={{ fontSize: 18 }}>{a.emoji}</span><span style={{ fontSize: 13, fontWeight: 600, color: T.ink, flex: 1 }}>{a.label}</span><span style={{ fontSize: 12, color: T.inkMuted }}>{a.time}</span></div>)}</>}
          {entry.missed.length > 0 && <><p style={{ margin: "10px 0 8px", fontSize: 11, fontWeight: 700, color: T.red, textTransform: "uppercase", letterSpacing: "0.07em" }}>⏭ Missed</p>{entry.missed.map((a, i) => <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderTop: `1px solid ${T.border}`, alignItems: "center", opacity: 0.6 }}><span style={{ fontSize: 18 }}>{a.emoji}</span><span style={{ fontSize: 13, fontWeight: 600, color: T.ink, flex: 1 }}>{a.label}</span><span style={{ fontSize: 12, color: T.inkMuted }}>{a.time}</span></div>)}</>}
        </div>
      )}
    </Card>
  );
}
