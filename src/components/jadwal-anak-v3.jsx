import { useState, useEffect, useCallback } from "react";

// ─── Storage helpers ───
async function loadData(key, fallback) {
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : fallback;
  } catch { return fallback; }
}
async function saveData(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); } catch (e) { console.error(e); }
}

// ─── Constants ───
const ACTIVITY_TEMPLATES = [
  { emoji: "🌅", label: "Bangun Tidur", category: "rutinitas", color: "#FFD93D", duration: 15 },
  { emoji: "🪥", label: "Sikat Gigi", category: "rutinitas", color: "#6BCB77", duration: 5 },
  { emoji: "🚿", label: "Mandi", category: "rutinitas", color: "#4FC3F7", duration: 20 },
  { emoji: "🍳", label: "Sarapan", category: "makan", color: "#FF8A65", duration: 30 },
  { emoji: "🍱", label: "Makan Siang", category: "makan", color: "#FF8A65", duration: 30 },
  { emoji: "🍽️", label: "Makan Malam", category: "makan", color: "#FF8A65", duration: 30 },
  { emoji: "🧩", label: "Terapi Okupasi", category: "terapi", color: "#BA68C8", duration: 60 },
  { emoji: "🗣️", label: "Terapi Wicara", category: "terapi", color: "#BA68C8", duration: 45 },
  { emoji: "🎨", label: "Terapi Seni", category: "terapi", color: "#BA68C8", duration: 45 },
  { emoji: "🧸", label: "Bermain Bebas", category: "bermain", color: "#4DD0E1", duration: 30 },
  { emoji: "📚", label: "Belajar", category: "belajar", color: "#7986CB", duration: 30 },
  { emoji: "🎵", label: "Musik / Bernyanyi", category: "bermain", color: "#F06292", duration: 20 },
  { emoji: "🏃", label: "Olahraga / Gerak", category: "bermain", color: "#AED581", duration: 30 },
  { emoji: "😴", label: "Tidur Siang", category: "istirahat", color: "#90A4AE", duration: 60 },
  { emoji: "🌙", label: "Tidur Malam", category: "istirahat", color: "#78909C", duration: 0 },
  { emoji: "💊", label: "Minum Obat", category: "rutinitas", color: "#EF5350", duration: 5 },
  { emoji: "📺", label: "Screen Time", category: "bermain", color: "#5C6BC0", duration: 30 },
  { emoji: "🤗", label: "Waktu Tenang", category: "istirahat", color: "#B0BEC5", duration: 15 },
];
const CATEGORY_LABELS = { rutinitas: "🔁 Rutinitas", makan: "🍴 Makan", terapi: "💜 Terapi", bermain: "🎈 Bermain", belajar: "📖 Belajar", istirahat: "😌 Istirahat" };
const BREAK_TEMPLATES = [
  { emoji: "🤗", label: "Waktu Tenang", duration: 10, color: "#B0BEC5" },
  { emoji: "🌬️", label: "Latihan Napas", duration: 5, color: "#81D4FA" },
  { emoji: "🧘", label: "Peregangan", duration: 10, color: "#CE93D8" },
  { emoji: "🫧", label: "Sensory Break", duration: 15, color: "#80DEEA" },
];
const MIN_GAP_MINUTES = 10;
const DEFAULT_SCHEDULE = [
  { id: 1, emoji: "🌅", label: "Bangun Tidur", time: "06:00", duration: 15, color: "#FFD93D", status: "upcoming", notes: "", isBreak: false },
  { id: 2, emoji: "🪥", label: "Sikat Gigi", time: "06:15", duration: 5, color: "#6BCB77", status: "upcoming", notes: "", isBreak: false },
  { id: 3, emoji: "🚿", label: "Mandi", time: "06:20", duration: 20, color: "#4FC3F7", status: "upcoming", notes: "", isBreak: false },
  { id: 4, emoji: "🍳", label: "Sarapan", time: "06:45", duration: 30, color: "#FF8A65", status: "upcoming", notes: "Hindari makanan dengan pewarna buatan", isBreak: false },
  { id: 5, emoji: "🧩", label: "Terapi Okupasi", time: "08:00", duration: 60, color: "#BA68C8", status: "upcoming", notes: "", isBreak: false },
  { id: 6, emoji: "🧸", label: "Bermain Bebas", time: "09:30", duration: 30, color: "#4DD0E1", status: "upcoming", notes: "", isBreak: false },
  { id: 7, emoji: "🍱", label: "Makan Siang", time: "12:00", duration: 30, color: "#FF8A65", status: "upcoming", notes: "", isBreak: false },
  { id: 8, emoji: "😴", label: "Tidur Siang", time: "13:00", duration: 60, color: "#90A4AE", status: "upcoming", notes: "", isBreak: false },
  { id: 9, emoji: "🌙", label: "Tidur Malam", time: "20:00", duration: 0, color: "#78909C", status: "upcoming", notes: "", isBreak: false },
];
const MOOD_OPTIONS = [
  { emoji: "😊", label: "Senang" },
  { emoji: "😐", label: "Biasa" },
  { emoji: "😢", label: "Sedih" },
  { emoji: "😤", label: "Frustasi" },
  { emoji: "😰", label: "Cemas" },
  { emoji: "🤩", label: "Antusias" },
];
const LOG_TAGS = [
  { emoji: "💥", label: "Tantrum" },
  { emoji: "😭", label: "Menangis" },
  { emoji: "🙉", label: "Sensory Overload" },
  { emoji: "🤝", label: "Kooperatif" },
  { emoji: "🗣️", label: "Komunikasi Baik" },
  { emoji: "🍽️", label: "Makan Baik" },
  { emoji: "🚫", label: "Menolak Makan" },
  { emoji: "💤", label: "Tidur Nyenyak" },
  { emoji: "⚡", label: "Hiperaktif" },
  { emoji: "🧘", label: "Tenang" },
];

const FONT = "'Nunito', 'Segoe UI', system-ui, sans-serif";

function timeToMin(t) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function minToTime(m) { return `${Math.floor(m / 60 % 24).toString().padStart(2, "0")}:${(m % 60).toString().padStart(2, "0")}`; }
function analyzeGaps(sorted) {
  const gaps = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const end = timeToMin(sorted[i].time) + sorted[i].duration;
    const start = timeToMin(sorted[i + 1].time);
    const gap = start - end;
    gaps.push({ afterId: sorted[i].id, beforeId: sorted[i + 1].id, gap, endTime: minToTime(end), overlap: gap < 0, tooTight: gap >= 0 && gap < MIN_GAP_MINUTES, ok: gap >= MIN_GAP_MINUTES });
  }
  return gaps;
}
function getDensityInfo(gaps) {
  if (gaps.length === 0) return { label: "Santai", color: "#6BCB77", emoji: "😊", desc: "Jadwal longgar, anak punya banyak waktu istirahat." };
  const p = gaps.filter(g => !g.ok).length / gaps.length;
  if (p === 0) return { label: "Santai", color: "#6BCB77", emoji: "😊", desc: "Jadwal longgar, anak punya banyak waktu istirahat." };
  if (p <= 0.35) return { label: "Seimbang", color: "#F5A623", emoji: "😐", desc: "Sebagian besar ada jeda cukup. Perhatikan yang rapat." };
  return { label: "Terlalu Padat!", color: "#EF5350", emoji: "😰", desc: "Banyak aktivitas tanpa jeda. Anak butuh waktu transisi!" };
}
function todayKey() { return new Date().toISOString().slice(0, 10); }

// ─── Onboarding ───
function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const steps = [
    { emoji: "👋", title: "Selamat Datang!", desc: "Aplikasi ini membantu Anda mengatur jadwal harian anak dengan kebutuhan khusus (autis/ADHD). Jadwal konsisten membantu anak merasa aman.", tip: "Mudah digunakan — bahkan untuk pengasuh baru." },
    { emoji: "⏰", title: "Jeda Itu Penting!", desc: "Anak autis/ADHD butuh waktu transisi. Aplikasi otomatis mendeteksi jadwal terlalu padat dan menyarankan jeda.", tip: "⚠️ kuning = terlalu rapat. 🔴 merah = bertabrakan." },
    { emoji: "👶", title: "Mode Anak", desc: "Ketuk tombol 👶 untuk beralih ke tampilan besar & sederhana yang bisa dilihat anak. Hanya emoji besar dan waktu — tanpa tombol rumit.", tip: "Tunjukkan ke anak: 'Ini yang kita lakukan selanjutnya!'" },
    { emoji: "📝", title: "Catatan Harian", desc: "Catat mood, kejadian, dan perkembangan anak setiap hari lewat tombol 📝. Berguna untuk laporan ke orang tua atau terapis.", tip: "Jadwal otomatis tersimpan & bisa dipakai lagi besok." },
  ];
  const s = steps[step];
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #E8F0FE 0%, #F8F9FC 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", fontFamily: FONT }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "36px 28px 28px", maxWidth: 380, width: "100%", boxShadow: "0 8px 32px rgba(91,141,239,0.10)", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{s.emoji}</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#2D3748", margin: "0 0 12px" }}>{s.title}</h1>
        <p style={{ fontSize: 15, color: "#4A5568", lineHeight: 1.6, margin: "0 0 16px" }}>{s.desc}</p>
        <div style={{ background: "#FFF9E6", border: "1px solid #FFD93D", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#7B6B2E", lineHeight: 1.5, marginBottom: 24 }}>💡 {s.tip}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
          {steps.map((_, i) => <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i === step ? "#5B8DEF" : "#D1D9E6", transition: "all 0.3s" }} />)}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {step > 0 && <button onClick={() => setStep(step - 1)} style={{ flex: 1, padding: 14, borderRadius: 14, border: "2px solid #D1D9E6", background: "#fff", fontSize: 15, fontWeight: 700, color: "#718096", cursor: "pointer" }}>← Kembali</button>}
          <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()} style={{ flex: 1, padding: 14, borderRadius: 14, border: "none", background: "#5B8DEF", fontSize: 15, fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 4px 12px rgba(91,141,239,0.3)" }}>
            {step < steps.length - 1 ? "Lanjut →" : "Mulai! 🎉"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Kid Mode View ───
function KidModeView({ schedule, onExit }) {
  const sorted = [...schedule].filter(a => a.status !== "skipped").sort((a, b) => a.time.localeCompare(b.time));
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  let currentIdx = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].status === "done") { currentIdx = i + 1; continue; }
    const t = timeToMin(sorted[i].time);
    if (nowMin >= t) { currentIdx = i; break; }
    if (nowMin < t) { currentIdx = i; break; }
  }
  currentIdx = Math.min(currentIdx, sorted.length - 1);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #E8F4FD 0%, #FFF8E1 100%)", fontFamily: FONT, padding: "16px 12px", position: "relative" }}>
      <button onClick={onExit} style={{ position: "fixed", top: 16, right: 16, zIndex: 100, width: 44, height: 44, borderRadius: "50%", border: "none", background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.12)", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#5B8DEF" }}>📅 Jadwal Hari Ini</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 400, margin: "0 auto" }}>
        {sorted.map((act, idx) => {
          const isDone = act.status === "done";
          const isCurrent = idx === currentIdx && !isDone;
          return (
            <div key={act.id} style={{
              background: isCurrent ? `${act.color}18` : isDone ? "#F0F0F0" : "#fff",
              borderRadius: 24,
              padding: isCurrent ? "24px 20px" : "16px 18px",
              border: isCurrent ? `4px solid ${act.color}` : isDone ? "3px solid #D1D9E6" : "3px solid #E8ECF2",
              opacity: isDone ? 0.5 : 1,
              boxShadow: isCurrent ? `0 6px 24px ${act.color}30` : "0 2px 6px rgba(0,0,0,0.04)",
              display: "flex", alignItems: "center", gap: 16,
              transition: "all 0.3s",
            }}>
              <div style={{ fontSize: isCurrent ? 64 : 44, flexShrink: 0, lineHeight: 1 }}>
                {isDone ? "✅" : act.emoji}
              </div>
              <div style={{ flex: 1 }}>
                {isCurrent && <div style={{ fontSize: 11, fontWeight: 800, color: act.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Sekarang ▶</div>}
                <div style={{ fontSize: isCurrent ? 22 : 17, fontWeight: 800, color: isDone ? "#A0AEC0" : "#2D3748", textDecoration: isDone ? "line-through" : "none" }}>{act.label}</div>
                <div style={{ fontSize: isCurrent ? 18 : 14, fontWeight: 700, color: "#718096", marginTop: 2 }}>🕐 {act.time}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#A0AEC0", fontWeight: 600 }}>
        👆 Tampilan untuk anak — tanpa tombol
      </div>
    </div>
  );
}

// ─── Daily Log Modal ───
function DailyLogModal({ log, onSave, onClose }) {
  const [mood, setMood] = useState(log.mood || "");
  const [tags, setTags] = useState(log.tags || []);
  const [text, setText] = useState(log.text || "");

  const toggleTag = (label) => setTags(t => t.includes(label) ? t.filter(x => x !== label) : [...t, label]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center", fontFamily: FONT }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto", padding: "20px 20px 32px" }}>
        <div style={{ width: 40, height: 4, background: "#D1D9E6", borderRadius: 2, margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#2D3748", margin: "0 0 4px", textAlign: "center" }}>📝 Catatan Harian</h2>
        <p style={{ fontSize: 13, color: "#A0AEC0", textAlign: "center", margin: "0 0 20px" }}>{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}</p>

        {/* Mood */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 14, fontWeight: 800, color: "#2D3748", display: "block", marginBottom: 8 }}>Mood anak hari ini?</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {MOOD_OPTIONS.map(m => (
              <button key={m.label} onClick={() => setMood(m.label)} style={{
                padding: "10px 14px", borderRadius: 14, border: "2.5px solid",
                borderColor: mood === m.label ? "#5B8DEF" : "#E8ECF2",
                background: mood === m.label ? "#EBF2FF" : "#FAFBFD",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                fontSize: 14, fontWeight: 700, color: mood === m.label ? "#5B8DEF" : "#4A5568",
              }}>
                <span style={{ fontSize: 22 }}>{m.emoji}</span> {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 14, fontWeight: 800, color: "#2D3748", display: "block", marginBottom: 8 }}>Kejadian hari ini (pilih yang sesuai)</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {LOG_TAGS.map(t => {
              const active = tags.includes(t.label);
              return (
                <button key={t.label} onClick={() => toggleTag(t.label)} style={{
                  padding: "8px 12px", borderRadius: 12, border: "2px solid",
                  borderColor: active ? "#5B8DEF" : "#E8ECF2",
                  background: active ? "#EBF2FF" : "#FAFBFD",
                  cursor: "pointer", fontSize: 12, fontWeight: 700,
                  color: active ? "#5B8DEF" : "#718096",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{ fontSize: 16 }}>{t.emoji}</span> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Free text */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: 14, fontWeight: 800, color: "#2D3748", display: "block", marginBottom: 8 }}>Catatan tambahan</label>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="cth: Hari ini lebih tenang setelah terapi seni. Makan siang habis semua."
            style={{ width: "100%", minHeight: 80, padding: "12px 14px", borderRadius: 14, border: "2px solid #E2E8F0", fontSize: 14, fontFamily: FONT, resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 }} />
        </div>

        <button onClick={() => onSave({ mood, tags, text })} style={{
          width: "100%", padding: 16, borderRadius: 16, border: "none",
          background: "#5B8DEF", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer",
          boxShadow: "0 4px 12px rgba(91,141,239,0.3)",
        }}>Simpan Catatan ✅</button>
      </div>
    </div>
  );
}

// ─── Log History ───
function LogHistoryModal({ logs, onClose }) {
  const entries = Object.entries(logs).sort((a, b) => b[0].localeCompare(a[0]));
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center", fontFamily: FONT }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 420, maxHeight: "85vh", overflowY: "auto", padding: "20px 20px 32px" }}>
        <div style={{ width: 40, height: 4, background: "#D1D9E6", borderRadius: 2, margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#2D3748", margin: "0 0 20px", textAlign: "center" }}>📅 Riwayat Catatan</h2>
        {entries.length === 0 && <p style={{ textAlign: "center", color: "#A0AEC0", fontSize: 14 }}>Belum ada catatan tersimpan.</p>}
        {entries.map(([date, log]) => {
          const d = new Date(date + "T00:00:00");
          const moodObj = MOOD_OPTIONS.find(m => m.label === log.mood);
          return (
            <div key={date} style={{ background: "#F8F9FC", borderRadius: 16, padding: "14px 16px", marginBottom: 10, border: "1px solid #E8ECF2" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#5B8DEF", marginBottom: 6 }}>
                {d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
              {moodObj && <div style={{ fontSize: 14, marginBottom: 6 }}>{moodObj.emoji} Mood: <strong>{log.mood}</strong></div>}
              {log.tags && log.tags.length > 0 && (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                  {log.tags.map(t => { const obj = LOG_TAGS.find(x => x.label === t); return <span key={t} style={{ fontSize: 11, background: "#EBF2FF", color: "#5B8DEF", padding: "3px 8px", borderRadius: 8, fontWeight: 700 }}>{obj ? obj.emoji : ""} {t}</span>; })}
                </div>
              )}
              {log.text && <div style={{ fontSize: 13, color: "#4A5568", lineHeight: 1.5 }}>{log.text}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Gap Warning ───
function GapWarning({ gapInfo, onInsertBreak }) {
  const [open, setOpen] = useState(false);
  if (gapInfo.ok) return null;
  const isOv = gapInfo.overlap;
  return (
    <div style={{ margin: "0 0 4px", borderRadius: 14, border: `2px dashed ${isOv ? "#FEB2B2" : "#FEEBC8"}`, background: isOv ? "#FFF5F5" : "#FFFBEB" }}>
      <div onClick={() => !isOv && setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: isOv ? "default" : "pointer" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: isOv ? "#FED7D7" : "#FEFCBF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{isOv ? "🔴" : "⚠️"}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: isOv ? "#C53030" : "#975A16" }}>
            {isOv ? `Bertabrakan! (${Math.abs(gapInfo.gap)} mnt)` : gapInfo.gap === 0 ? "Tanpa jeda" : `Jeda hanya ${gapInfo.gap} menit`}
          </div>
          <div style={{ fontSize: 11, color: isOv ? "#C53030" : "#975A16", opacity: 0.8 }}>{isOv ? "Geser waktu salah satu" : "Ketuk untuk sisipkan jeda ↓"}</div>
        </div>
        {!isOv && <span style={{ fontSize: 12, color: "#D69E2E" }}>{open ? "▲" : "▼"}</span>}
      </div>
      {open && !isOv && (
        <div style={{ padding: "0 12px 12px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {BREAK_TEMPLATES.map((b, i) => (
            <button key={i} onClick={() => { onInsertBreak(gapInfo.endTime, b); setOpen(false); }} style={{ padding: "8px 12px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#4A5568" }}>
              <span style={{ fontSize: 18 }}>{b.emoji}</span> {b.label} ({b.duration}m)
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Add Activity Modal ───
function AddActivityModal({ onAdd, onClose }) {
  const [mode, setMode] = useState("template");
  const [selectedCat, setSelectedCat] = useState(null);
  const [customEmoji, setCustomEmoji] = useState("⭐");
  const [customLabel, setCustomLabel] = useState("");
  const [customColor, setCustomColor] = useState("#5B8DEF");
  const [time, setTime] = useState("08:00");
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState(null);
  const filtered = selectedCat ? ACTIVITY_TEMPLATES.filter(t => t.category === selectedCat) : ACTIVITY_TEMPLATES;

  const handleSubmit = () => {
    if (mode === "template" && selected !== null) {
      const t = ACTIVITY_TEMPLATES[selected];
      onAdd({ emoji: t.emoji, label: t.label, time, duration: t.duration, color: t.color, notes, isBreak: false });
    } else if (mode === "custom" && customLabel.trim()) {
      onAdd({ emoji: customEmoji, label: customLabel.trim(), time, duration, color: customColor, notes, isBreak: false });
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center", fontFamily: FONT }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 420, maxHeight: "88vh", overflowY: "auto", padding: "20px 20px 32px" }}>
        <div style={{ width: 40, height: 4, background: "#D1D9E6", borderRadius: 2, margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#2D3748", margin: "0 0 16px", textAlign: "center" }}>➕ Tambah Aktivitas</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[["template", "📋 Template"], ["custom", "✏️ Buat Sendiri"]].map(([m, l]) => (
            <button key={m} onClick={() => { setMode(m); setSelected(null); }} style={{ flex: 1, padding: 10, borderRadius: 12, border: "2px solid", borderColor: mode === m ? "#5B8DEF" : "#E2E8F0", background: mode === m ? "#EBF2FF" : "#fff", fontSize: 14, fontWeight: 700, color: mode === m ? "#5B8DEF" : "#718096", cursor: "pointer" }}>{l}</button>
          ))}
        </div>
        {mode === "template" ? (
          <>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              <button onClick={() => setSelectedCat(null)} style={{ padding: "6px 12px", borderRadius: 20, border: "1.5px solid", borderColor: !selectedCat ? "#5B8DEF" : "#E2E8F0", background: !selectedCat ? "#EBF2FF" : "#fff", fontSize: 12, fontWeight: 700, color: !selectedCat ? "#5B8DEF" : "#718096", cursor: "pointer" }}>Semua</button>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <button key={k} onClick={() => setSelectedCat(k)} style={{ padding: "6px 12px", borderRadius: 20, border: "1.5px solid", borderColor: selectedCat === k ? "#5B8DEF" : "#E2E8F0", background: selectedCat === k ? "#EBF2FF" : "#fff", fontSize: 12, fontWeight: 700, color: selectedCat === k ? "#5B8DEF" : "#718096", cursor: "pointer", whiteSpace: "nowrap" }}>{v}</button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {filtered.map(t => { const gi = ACTIVITY_TEMPLATES.indexOf(t); return (
                <button key={gi} onClick={() => setSelected(gi)} style={{ padding: "14px 10px", borderRadius: 14, border: "2.5px solid", borderColor: selected === gi ? "#5B8DEF" : "#E8ECF2", background: selected === gi ? "#EBF2FF" : "#FAFBFD", cursor: "pointer", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 4 }}>{t.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2D3748" }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: "#A0AEC0", marginTop: 2 }}>{t.duration} mnt</div>
                </button>
              ); })}
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#4A5568", display: "block", marginBottom: 6 }}>Emoji & Nama</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={customEmoji} onChange={e => setCustomEmoji(e.target.value)} style={{ width: 52, textAlign: "center", fontSize: 28, padding: 8, borderRadius: 12, border: "2px solid #E2E8F0" }} />
                <input value={customLabel} onChange={e => setCustomLabel(e.target.value)} placeholder="cth: Jalan Sore" style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "2px solid #E2E8F0", fontSize: 15, fontWeight: 600 }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#4A5568", display: "block", marginBottom: 6 }}>Durasi (menit)</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[5, 15, 30, 45, 60].map(d => <button key={d} onClick={() => setDuration(d)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "2px solid", borderColor: duration === d ? "#5B8DEF" : "#E2E8F0", background: duration === d ? "#EBF2FF" : "#fff", fontSize: 14, fontWeight: 700, color: duration === d ? "#5B8DEF" : "#718096", cursor: "pointer" }}>{d}</button>)}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#4A5568", display: "block", marginBottom: 6 }}>Warna</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["#FFD93D","#FF8A65","#BA68C8","#4DD0E1","#5B8DEF","#AED581","#F06292","#90A4AE"].map(c => <button key={c} onClick={() => setCustomColor(c)} style={{ width: 36, height: 36, borderRadius: "50%", border: customColor === c ? "3px solid #2D3748" : "3px solid transparent", background: c, cursor: "pointer" }} />)}
              </div>
            </div>
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#4A5568", display: "block", marginBottom: 6 }}>⏰ Jam</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "2px solid #E2E8F0", fontSize: 16, fontWeight: 600, boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#4A5568", display: "block", marginBottom: 6 }}>📝 Catatan (opsional)</label>
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="cth: Hindari suara keras" style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "2px solid #E2E8F0", fontSize: 14, boxSizing: "border-box" }} />
        </div>
        <button onClick={handleSubmit} disabled={mode === "template" ? selected === null : !customLabel.trim()} style={{ width: "100%", padding: 16, borderRadius: 16, border: "none", background: (mode === "template" ? selected !== null : customLabel.trim()) ? "#5B8DEF" : "#CBD5E0", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(91,141,239,0.3)" }}>
          Tambahkan ke Jadwal ✅
        </button>
      </div>
    </div>
  );
}

// ─── Timer ───
function TimerOverlay({ activity, onClose }) {
  const [seconds, setSeconds] = useState(300);
  const [running, setRunning] = useState(false);
  useEffect(() => { if (!running || seconds <= 0) return; const t = setInterval(() => setSeconds(s => s - 1), 1000); return () => clearInterval(t); }, [running, seconds]);
  const min = Math.floor(seconds / 60), sec = seconds % 60;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "32px 28px", width: "90%", maxWidth: 340, textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>{activity.emoji}</div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#2D3748", margin: "0 0 4px" }}>Bersiap untuk:</h3>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#5B8DEF", margin: "0 0 20px" }}>{activity.label}</p>
        <div style={{ fontSize: 48, fontWeight: 800, color: seconds <= 60 ? "#EF5350" : "#2D3748", fontVariantNumeric: "tabular-nums", marginBottom: 20 }}>{min}:{sec.toString().padStart(2, "0")}</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {[60, 180, 300].map(s => <button key={s} onClick={() => { setSeconds(s); setRunning(false); }} style={{ flex: 1, padding: 8, borderRadius: 10, border: "2px solid #E2E8F0", background: seconds === s && !running ? "#EBF2FF" : "#fff", fontSize: 13, fontWeight: 700, color: "#5B8DEF", cursor: "pointer" }}>{s / 60} mnt</button>)}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setRunning(!running)} style={{ flex: 1, padding: 14, borderRadius: 14, border: "none", background: running ? "#FF8A65" : "#5B8DEF", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>{running ? "⏸ Jeda" : "▶ Mulai"}</button>
          <button onClick={onClose} style={{ padding: "14px 20px", borderRadius: 14, border: "2px solid #E2E8F0", background: "#fff", fontSize: 15, fontWeight: 700, color: "#718096", cursor: "pointer" }}>✕</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ───
export default function JadwalAnak() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [showAdd, setShowAdd] = useState(false);
  const [timerActivity, setTimerActivity] = useState(null);
  const [editId, setEditId] = useState(null);
  const [nextId, setNextId] = useState(100);
  const [kidMode, setKidMode] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showLogHistory, setShowLogHistory] = useState(false);
  const [dailyLogs, setDailyLogs] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      const savedSchedule = await loadData("schedule-template", null);
      const savedLogs = await loadData("daily-logs", {});
      const savedOnboarded = await loadData("onboarded", false);
      if (savedSchedule) {
        setSchedule(savedSchedule.map(a => ({ ...a, status: "upcoming" })));
        setNextId(Math.max(...savedSchedule.map(a => a.id)) + 1);
      }
      if (savedLogs) setDailyLogs(savedLogs);
      if (savedOnboarded) setShowOnboarding(false);
      setLoaded(true);
    })();
  }, []);

  // Auto-save schedule whenever it changes
  useEffect(() => {
    if (!loaded) return;
    const template = schedule.map(({ status, ...rest }) => rest);
    saveData("schedule-template", template);
  }, [schedule, loaded]);

  const sortedSchedule = [...schedule].sort((a, b) => a.time.localeCompare(b.time));
  const gaps = analyzeGaps(sortedSchedule);
  const density = getDensityInfo(gaps);
  const gapProblems = gaps.filter(g => !g.ok).length;

  const markDone = id => setSchedule(s => s.map(a => a.id === id ? { ...a, status: "done" } : a));
  const markSkip = id => setSchedule(s => s.map(a => a.id === id ? { ...a, status: "skipped" } : a));
  const removeActivity = id => { setSchedule(s => s.filter(a => a.id !== id)); setEditId(null); };
  const addActivity = act => { setSchedule(s => [...s, { id: nextId, ...act, status: "upcoming" }]); setNextId(n => n + 1); setShowAdd(false); };
  const insertBreak = (afterTime, b) => { setSchedule(s => [...s, { id: nextId, emoji: b.emoji, label: b.label, time: afterTime, duration: b.duration, color: b.color, status: "upcoming", notes: "", isBreak: true }]); setNextId(n => n + 1); };
  const autoFixAll = () => {
    const sorted = [...schedule].sort((a, b) => a.time.localeCompare(b.time));
    const newItems = []; let idc = nextId;
    for (let i = 0; i < sorted.length - 1; i++) {
      const end = timeToMin(sorted[i].time) + sorted[i].duration;
      const start = timeToMin(sorted[i + 1].time);
      const gap = start - end;
      if (gap >= 0 && gap < MIN_GAP_MINUTES) newItems.push({ id: idc++, emoji: "🤗", label: "Waktu Tenang", time: minToTime(end), duration: Math.max(MIN_GAP_MINUTES - gap, 5), color: "#B0BEC5", status: "upcoming", notes: "Otomatis", isBreak: true });
    }
    if (newItems.length) { setSchedule(s => [...s, ...newItems]); setNextId(idc); }
  };
  const resetDay = () => setSchedule(s => s.map(a => ({ ...a, status: "upcoming" })));

  const handleSaveLog = async (logData) => {
    const key = todayKey();
    const updated = { ...dailyLogs, [key]: logData };
    setDailyLogs(updated);
    await saveData("daily-logs", updated);
    setShowLog(false);
  };

  const handleOnboardComplete = async () => {
    setShowOnboarding(false);
    await saveData("onboarded", true);
  };

  const doneCount = schedule.filter(a => a.status === "done").length;
  const progress = schedule.length > 0 ? Math.round((doneCount / schedule.length) * 100) : 0;
  const todayLog = dailyLogs[todayKey()] || {};

  if (!loaded) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, background: "#F3F6FB" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#718096" }}>Memuat jadwal...</div>
      </div>
    </div>
  );

  if (showOnboarding) return <OnboardingScreen onComplete={handleOnboardComplete} />;
  if (kidMode) return <KidModeView schedule={schedule} onExit={() => setKidMode(false)} />;

  const todayStr = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{ minHeight: "100vh", background: "#F3F6FB", fontFamily: FONT, paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #5B8DEF 0%, #7B68EE 100%)", padding: "20px 20px 24px", borderRadius: "0 0 28px 28px", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85, fontWeight: 600 }}>{todayStr}</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: "4px 0 0" }}>📋 Jadwal Hari Ini</h1>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={resetDay} title="Reset status" style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 12, padding: "8px 12px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🔄</button>
            <button onClick={() => setKidMode(true)} title="Mode Anak" style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 12, padding: "8px 12px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>👶</button>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, height: 10, marginBottom: 6 }}>
          <div style={{ background: "#FFD93D", borderRadius: 10, height: 10, width: `${progress}%`, transition: "width 0.5s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, opacity: 0.9, fontWeight: 600 }}>{doneCount}/{schedule.length} selesai ({progress}%)</span>
          <span style={{ fontSize: 11, opacity: 0.7 }}>💾 Otomatis tersimpan</span>
        </div>
      </div>

      {/* Density Banner */}
      <div style={{ margin: "12px 16px 0", borderRadius: 16, border: `2px solid ${density.color}25`, background: `${density.color}10`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 28 }}>{density.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: density.color }}>Kepadatan: {density.label}</div>
          <div style={{ fontSize: 12, color: "#718096", marginTop: 1 }}>{density.desc}</div>
        </div>
        {gapProblems > 0 && <div style={{ background: density.color, color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 800 }}>{gapProblems}</div>}
      </div>

      {gapProblems > 0 && (
        <div style={{ padding: "10px 16px 0" }}>
          <button onClick={autoFixAll} style={{ width: "100%", padding: 12, borderRadius: 14, border: "2px dashed #5B8DEF", background: "#EBF2FF", fontSize: 14, fontWeight: 700, color: "#5B8DEF", cursor: "pointer" }}>
            🪄 Otomatis Sisipkan Jeda ({gapProblems} tempat)
          </button>
        </div>
      )}

      {/* Today's mood summary */}
      {todayLog.mood && (
        <div onClick={() => setShowLog(true)} style={{ margin: "10px 16px 0", borderRadius: 14, background: "#fff", border: "1px solid #E8ECF2", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <span style={{ fontSize: 24 }}>{MOOD_OPTIONS.find(m => m.label === todayLog.mood)?.emoji}</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#2D3748" }}>Mood: {todayLog.mood}</span>
            {todayLog.tags?.length > 0 && <span style={{ fontSize: 12, color: "#A0AEC0", marginLeft: 6 }}>· {todayLog.tags.length} catatan</span>}
          </div>
          <span style={{ fontSize: 12, color: "#5B8DEF", fontWeight: 700 }}>Edit →</span>
        </div>
      )}

      {/* Schedule cards */}
      <div style={{ padding: "12px 16px 0" }}>
        {sortedSchedule.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#A0AEC0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 15, fontWeight: 600 }}>Belum ada jadwal. Ketuk + untuk menambah.</p>
          </div>
        )}
        {sortedSchedule.map((act, idx) => {
          const isDone = act.status === "done";
          const isSkipped = act.status === "skipped";
          const isEditing = editId === act.id;
          const gapAfter = gaps[idx];
          return (
            <div key={act.id}>
              <div style={{ background: act.isBreak ? "#F0F7FF" : "#fff", borderRadius: 18, marginBottom: 4, borderLeft: `5px solid ${isDone ? "#6BCB77" : isSkipped ? "#CBD5E0" : act.color}`, opacity: isDone || isSkipped ? 0.55 : 1, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div onClick={() => setEditId(isEditing ? null : act.id)} style={{ display: "flex", alignItems: "center", padding: "14px 16px", cursor: "pointer", gap: 14 }}>
                  <div style={{ fontSize: 36, width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", background: `${act.color}20`, borderRadius: 14, flexShrink: 0 }}>
                    {isDone ? "✅" : isSkipped ? "⏭️" : act.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "#2D3748", textDecoration: isDone ? "line-through" : "none" }}>{act.label}</span>
                      {act.isBreak && <span style={{ fontSize: 10, fontWeight: 700, color: "#5B8DEF", background: "#EBF2FF", padding: "2px 8px", borderRadius: 6 }}>JEDA</span>}
                    </div>
                    <div style={{ fontSize: 13, color: "#718096", fontWeight: 600, marginTop: 2 }}>🕐 {act.time} {act.duration > 0 ? `· ${act.duration} mnt` : ""}</div>
                    {act.notes && <div style={{ fontSize: 12, color: "#A0AEC0", marginTop: 4, background: "#F7F8FA", padding: "4px 8px", borderRadius: 6, display: "inline-block" }}>📝 {act.notes}</div>}
                  </div>
                  <div style={{ fontSize: 14, color: "#CBD5E0", flexShrink: 0 }}>{isEditing ? "▲" : "▼"}</div>
                </div>
                {isEditing && (
                  <div style={{ padding: "0 16px 14px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {!isDone && !isSkipped && (<>
                      <button onClick={() => markDone(act.id)} style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: "#6BCB77", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✅ Selesai</button>
                      <button onClick={() => markSkip(act.id)} style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: "#F5A623", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>⏭️ Lewati</button>
                      <button onClick={() => setTimerActivity(act)} style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: "#5B8DEF", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>⏱️ Timer</button>
                    </>)}
                    <button onClick={() => removeActivity(act.id)} style={{ padding: "10px 16px", borderRadius: 12, border: "2px solid #FEB2B2", background: "#FFF5F5", color: "#E53E3E", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🗑️ Hapus</button>
                  </div>
                )}
              </div>
              {gapAfter && <GapWarning gapInfo={gapAfter} onInsertBreak={insertBreak} />}
            </div>
          );
        })}
      </div>

      {/* Bottom buttons */}
      <button onClick={() => setShowAdd(true)} style={{ position: "fixed", bottom: 24, right: 24, width: 60, height: 60, borderRadius: "50%", border: "none", background: "linear-gradient(135deg, #5B8DEF, #7B68EE)", color: "#fff", fontSize: 30, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(91,141,239,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 900 }}>+</button>
      <button onClick={() => setShowLog(true)} title="Catatan Harian" style={{ position: "fixed", bottom: 24, left: 80, width: 48, height: 48, borderRadius: "50%", border: "none", background: "#fff", color: "#5B8DEF", fontSize: 20, cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 900 }}>📝</button>
      <button onClick={() => setShowLogHistory(true)} title="Riwayat" style={{ position: "fixed", bottom: 24, left: 136, width: 48, height: 48, borderRadius: "50%", border: "none", background: "#fff", color: "#5B8DEF", fontSize: 20, cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 900 }}>📅</button>
      <button onClick={() => setShowOnboarding(true)} title="Bantuan" style={{ position: "fixed", bottom: 24, left: 24, width: 44, height: 44, borderRadius: "50%", border: "none", background: "#fff", color: "#5B8DEF", fontSize: 18, cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 900 }}>❓</button>

      {showAdd && <AddActivityModal onAdd={addActivity} onClose={() => setShowAdd(false)} />}
      {timerActivity && <TimerOverlay activity={timerActivity} onClose={() => setTimerActivity(null)} />}
      {showLog && <DailyLogModal log={todayLog} onSave={handleSaveLog} onClose={() => setShowLog(false)} />}
      {showLogHistory && <LogHistoryModal logs={dailyLogs} onClose={() => setShowLogHistory(false)} />}
    </div>
  );
}
