import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge, Btn, Input, TextArea, Avatar, Accordion, PageHero, AvatarIllustrations, ChildAvatar, ComAvatar, ROOM_ICONS, ACTIVITY_TEXTAREA_STYLE, ActionIllustration, HeroIllustration } from "../ui";
import { CHILD_AVATARS, DEFAULT_CHILDREN, DEFAULT_SCHEDULE, ROOM_COLORS, SOS_COLORS, VERBAL_STATUS_OPTIONS } from "../data";
import { ChildProfileForm } from "./onboarding";

export const DEV_LOG_CATEGORIES = [
  { key: "sleep",         label: "Sleep",         emoji: "😴", color: T.purple },
  { key: "food",          label: "Food & Eating", emoji: "🍽️", color: T.amber },
  { key: "communication", label: "Communication", emoji: "💬", color: T.teal },
  { key: "sensory",       label: "Sensory",       emoji: "🌈", color: T.green },
  { key: "behaviour",     label: "Behaviour",     emoji: "🎯", color: T.red },
  { key: "health",        label: "Health",        emoji: "❤️", color: T.red },
  { key: "therapy",       label: "Therapy",       emoji: "🗓️", color: T.purple },
  { key: "other",         label: "Other",         emoji: "📝", color: T.inkMuted },
];

export const devLogCategory = key => DEV_LOG_CATEGORIES.find(c => c.key === key) || DEV_LOG_CATEGORIES[DEV_LOG_CATEGORIES.length - 1];

// Who an observation came from — a carer's note carries less authority than an
// official diagnosis/report, so the UI must never blur that distinction.

export const DEV_LOG_SOURCES = [
  { key: "carer",    emoji: "👁️", label: "My observation",  labelId: "Catatan pengasuh" },
  { key: "official", emoji: "📋", label: "Official record",  labelId: "Info resmi (dokter/sekolah)" },
];

export const devLogSource = key => DEV_LOG_SOURCES.find(s => s.key === key) || DEV_LOG_SOURCES[0];

// "First weeks" observation prompts — drip-fed by day_offset so a brand-new carer
// gets 3-4 gentle questions on day one, with more unlocking as the days pass,
// instead of a 50-question intake form. Bilingual: English + Bahasa Indonesia.

export const OBSERVATION_PROMPTS = [
  { id: "sensory_noise",     dayOffset: 0, category: "sensory",       en: "Does loud noise seem to bother them? How do they react?", id_: "Apakah suara keras mengganggu mereka? Bagaimana reaksinya?" },
  { id: "comm_wants",        dayOffset: 0, category: "communication", en: "How do they let you know they want something — words, gestures, or sounds?", id_: "Bagaimana mereka menunjukkan keinginan — kata-kata, gerakan tubuh, atau suara?" },
  { id: "comfort_object",    dayOffset: 0, category: "other",         en: "Do they have a comfort object (toy, blanket, etc.)? Did it come with them?", id_: "Apakah mereka punya benda penenang (mainan, selimut, dll.)? Apakah dibawa saat datang?" },
  { id: "food_today",        dayOffset: 0, category: "food",          en: "What did they eat today? Any foods they refused or seemed to love?", id_: "Apa yang mereka makan hari ini? Ada makanan yang ditolak atau sangat disukai?" },
  { id: "sleep_first_night", dayOffset: 1, category: "sleep",         en: "How did they sleep last night — settled quickly, woke up often, or needed company?", id_: "Bagaimana tidur mereka semalam — cepat tenang, sering bangun, atau perlu didampingi?" },
  { id: "behaviour_trigger", dayOffset: 1, category: "behaviour",     en: "Did anything seem to upset or overwhelm them today? What happened right before?", id_: "Ada hal yang membuat mereka kesal atau kewalahan hari ini? Apa yang terjadi sebelumnya?" },
  { id: "comm_instructions", dayOffset: 1, category: "communication", en: "Do they seem to understand simple instructions, like \"time to eat\"?", id_: "Apakah mereka mengerti instruksi sederhana, seperti \"waktunya makan\"?" },
  { id: "sensory_textures",  dayOffset: 1, category: "sensory",       en: "Do they avoid or seek out certain textures — clothing, food, or touch?", id_: "Apakah mereka menghindari atau justru menyukai tekstur tertentu — pakaian, makanan, atau sentuhan?" },
  { id: "health_marks",      dayOffset: 2, category: "health",        en: "Any scars, marks, or health concerns you've noticed so far?", id_: "Ada bekas luka, tanda, atau masalah kesehatan yang Anda perhatikan sejauh ini?" },
  { id: "behaviour_calm",    dayOffset: 2, category: "behaviour",     en: "What seems to help them calm down when upset?", id_: "Apa yang biasanya membantu mereka tenang saat kesal?" },
  { id: "routine_hardest",   dayOffset: 2, category: "other",         en: "Which part of the day seems hardest for them — mornings, mealtimes, or bedtime?", id_: "Bagian hari apa yang paling berat untuk mereka — pagi, waktu makan, atau malam?" },
  { id: "comm_first_words",  dayOffset: 3, category: "communication", en: "Have they said, signed, or pointed to anything you recognised as a \"word\"?", id_: "Apakah mereka sudah mengucapkan, memberi tanda, atau menunjuk sesuatu yang Anda kenali sebagai \"kata\"?" },
  { id: "sensory_new_place", dayOffset: 3, category: "sensory",       en: "How do they react to a new place or a change in routine?", id_: "Bagaimana reaksi mereka di tempat baru atau saat rutinitas berubah?" },
  { id: "food_independence", dayOffset: 5, category: "food",          en: "Are they eating independently, or do they need help and encouragement?", id_: "Apakah mereka makan sendiri, atau perlu bantuan dan dorongan?" },
  { id: "week_one_easier",   dayOffset: 7, category: "behaviour",     en: "Looking back at this first week — what's one thing that's gotten a little easier?", id_: "Melihat kembali minggu pertama ini — apa satu hal yang sudah sedikit lebih mudah?" },
  { id: "health_patterns",   dayOffset: 7, category: "health",        en: "Have you noticed any patterns in sleep, mood, or behaviour tied to a certain time of day?", id_: "Apakah Anda melihat pola pada tidur, mood, atau perilaku yang berkaitan dengan waktu tertentu?" },
];

// Extra "Gentle Prompts" shown only when the parent has filled in the optional
// Additional Needs profile (see SpecialNeedsSection). Some entries pull the parent's
// own words (known trigger / therapy / diet) straight into the question instead of
// asking generically — `requires` skips a prompt until that field is filled in, and
// `en`/`id_` may be a function of activeChild so the text can quote it back.
// `verbalOnly`/`nonverbalOnly` pick the matching half of a pair based on verbalStatus.

export const AUTISM_PROMPTS = [
  { id: "an_trigger_check",  dayOffset: 0, category: "behaviour",     requires: "knownTriggers",
    en: c => `You mentioned "${c.knownTriggers}" as a known trigger. Did it come up today? How did they respond?`,
    id_: c => `Anda menyebutkan "${c.knownTriggers}" sebagai pemicu yang diketahui. Apakah itu muncul hari ini? Bagaimana respons mereka?` },
  { id: "an_diet_check",     dayOffset: 0, category: "food",          requires: "dietProgram",
    en: c => `How did today go with the "${c.dietProgram}" diet/program? Any reactions, cravings, or refusals?`,
    id_: c => `Bagaimana hari ini dengan program diet/makan "${c.dietProgram}"? Ada reaksi, keinginan, atau penolakan?` },
  { id: "an_therapy_check",  dayOffset: 1, category: "therapy",       requires: "therapySchedule",
    en: c => `How did the latest therapy session go (${c.therapySchedule})? Any progress or difficulty you noticed at home?`,
    id_: c => `Bagaimana sesi terapi terakhir (${c.therapySchedule})? Ada progres atau kesulitan yang terlihat di rumah?` },
  { id: "an_comm_v",         dayOffset: 0, category: "communication", verbalOnly: true,
    en: "Did they use any new words or phrases today? Were they easy to understand?", id_: "Apakah mereka mengucapkan kata atau frasa baru hari ini? Mudah dipahami?" },
  { id: "an_comm_nv",        dayOffset: 0, category: "communication", nonverbalOnly: true,
    en: "Did they use gestures, sounds, an AAC device, or pictures to communicate today? What seemed to work best?", id_: "Apakah mereka menggunakan gerakan tubuh, suara, alat AAC, atau gambar untuk berkomunikasi hari ini? Apa yang paling berhasil?" },
  { id: "an_wants_v",        dayOffset: 2, category: "communication", verbalOnly: true,
    en: "Did they ask any questions today, or start a conversation on their own?", id_: "Apakah mereka mengajukan pertanyaan hari ini, atau memulai percakapan sendiri?" },
  { id: "an_wants_nv",       dayOffset: 2, category: "communication", nonverbalOnly: true,
    en: "Did they point to, hand over, or lead you to something they wanted? How did you know what they needed?", id_: "Apakah mereka menunjuk, memberikan sesuatu, atau menuntun Anda ke hal yang mereka inginkan? Bagaimana Anda tahu apa yang mereka butuhkan?" },
  { id: "an_sensory_calm",   dayOffset: 1, category: "sensory",
    en: "What sensory input seemed to help them feel calm today — deep pressure, movement, a quiet space, or something else?", id_: "Input sensorik apa yang membantu mereka merasa tenang hari ini — tekanan dalam (deep pressure), gerakan, tempat tenang, atau hal lain?" },
  { id: "an_meltdown",       dayOffset: 3, category: "behaviour",
    en: "If they got overwhelmed today, did it look more like a meltdown (loud, big movements) or a shutdown (going quiet, withdrawing)? What helped after?", id_: "Jika mereka merasa kewalahan hari ini, apakah lebih seperti meltdown (ribut, gerakan besar) atau shutdown (jadi diam, menarik diri)? Apa yang membantu setelahnya?" },
  { id: "an_transitions",    dayOffset: 2, category: "sensory",
    en: "How did transitions go today — moving from one activity to the next, or an unexpected change in plan?", id_: "Bagaimana transisi hari ini — berpindah dari satu aktivitas ke aktivitas lain, atau perubahan rencana yang tiba-tiba?" },
  { id: "an_stimming",       dayOffset: 1, category: "sensory",
    en: "Did you notice any repetitive movements or sounds (stimming) today? Did it seem to help them self-soothe or focus?", id_: "Apakah Anda melihat gerakan atau suara berulang (stimming) hari ini? Apakah itu membantu mereka menenangkan diri atau fokus?" },
  { id: "an_sleep_routine",  dayOffset: 5, category: "sleep",
    en: "Did their bedtime / wind-down routine go as expected tonight? What seemed to help or disrupt it?", id_: "Apakah rutinitas sebelum tidur malam ini berjalan seperti biasa? Apa yang membantu atau mengganggunya?" },
  { id: "an_therapy_skill",  dayOffset: 7, category: "therapy",
    en: "Looking at this week, is there a skill from therapy that you noticed them practising at home on their own?", id_: "Melihat minggu ini, apakah ada keterampilan dari terapi yang Anda lihat mereka praktikkan sendiri di rumah?" },
  { id: "an_food_sensory",   dayOffset: 3, category: "food",
    en: "Are there specific food textures, colours, or smells they consistently avoid or seek out?", id_: "Apakah ada tekstur, warna, atau aroma makanan tertentu yang selalu mereka hindari atau justru sukai?" },
];

export const daysSince = iso => iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)) : 0;

// Age from date of birth, shown as months for babies and years for everyone else
// — a "1 yr" label hides whether a toddler just turned 1 or is nearly 2.

export const ageFromDob = dob => {
  if (!dob) return "";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "";
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) return "";
  if (months < 24) return `${months} mo`;
  const years = Math.floor(months / 12);
  return `${years} yr`;
};

// A running, dated journal of observations — sleep, eating, communication, sensory,
// behaviour and health notes — that doubles as a substitute medical history for
// caregivers without HealthHub/Parents Gateway access.

export function DevLogSection({ activeChild, updateChild }) {
  const devLog = activeChild.devLog || [];
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [category, setCategory] = useState("other");
  const [source, setSource] = useState("carer");
  const [note, setNote] = useState("");
  const [answeringPrompt, setAnsweringPrompt] = useState(null);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(`cb_dismissed_prompts_${activeChild.id}`) || "[]"); } catch {}
    setDismissed(saved);
  }, [activeChild.id]);

  const dismissPrompt = promptId => {
    const next = [...dismissed, promptId];
    setDismissed(next);
    try { localStorage.setItem(`cb_dismissed_prompts_${activeChild.id}`, JSON.stringify(next)); } catch {}
  };

  const answeredPromptIds = devLog.filter(e => e.promptId).map(e => e.promptId);
  const today = daysSince(activeChild.createdAt);
  const autismPrompts = activeChild.hasSpecialNeeds
    ? AUTISM_PROMPTS.filter(p => {
        if (p.requires && !String(activeChild[p.requires] || "").trim()) return false;
        if (p.verbalOnly && activeChild.verbalStatus === "nonverbal") return false;
        if (p.nonverbalOnly && activeChild.verbalStatus !== "nonverbal") return false;
        return true;
      })
    : [];
  // Autism prompts go first so they claim slots ahead of the generic foster-care
  // ones — otherwise a brand-new profile's 4 day-0 prompts fill up before the
  // tailored ones (which quote the parent's own trigger/therapy/diet text) ever
  // get a turn, and the personalisation effectively never surfaces.
  const activePrompts = [...autismPrompts, ...OBSERVATION_PROMPTS]
    .filter(p => p.dayOffset <= today && !answeredPromptIds.includes(p.id) && !dismissed.includes(p.id))
    .map(p => ({ ...p, en: typeof p.en === "function" ? p.en(activeChild) : p.en, id_: typeof p.id_ === "function" ? p.id_(activeChild) : p.id_ }))
    .slice(0, 4);

  const resetForm = () => { setShowForm(false); setEditingId(null); setCategory("other"); setSource("carer"); setNote(""); setAnsweringPrompt(null); };

  const startAdd = () => { resetForm(); setShowForm(true); };
  const startEdit = entry => { setEditingId(entry.id); setCategory(entry.category); setSource(entry.source || "carer"); setNote(entry.note); setAnsweringPrompt(null); setShowForm(true); };
  const answerPrompt = prompt => { setEditingId(null); setCategory(prompt.category); setSource("carer"); setNote(""); setAnsweringPrompt(prompt); setShowForm(true); };

  const saveEntry = () => {
    if (!note.trim()) return;
    if (editingId) {
      updateChild(activeChild.id, { devLog: devLog.map(e => e.id === editingId ? { ...e, category, source, note: note.trim() } : e) });
    } else {
      const entry = { id: Date.now().toString(), date: new Date().toISOString(), category, source, note: note.trim(), ...(answeringPrompt ? { promptId: answeringPrompt.id } : {}) };
      updateChild(activeChild.id, { devLog: [entry, ...devLog] });
    }
    resetForm();
  };

  const deleteEntry = id => updateChild(activeChild.id, { devLog: devLog.filter(e => e.id !== id) });

  return (
    <>
      <p style={{ margin: "0 0 14px", color: T.inkSoft, fontSize: 13, lineHeight: 1.6 }}>Log dated observations about {activeChild.name}'s sleep, eating, communication, sensory and behaviour patterns. Over time this becomes a record you can bring to doctors, schools, or therapists.</p>

      {activePrompts.length > 0 && !showForm && (
        <div style={{ marginBottom: 16 }}>
          <SectionLabel style={{ marginBottom: 10 }}>Gentle Prompts for You</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activePrompts.map(p => {
              const cat = devLogCategory(p.category);
              return (
                <Card key={p.id} style={{ padding: "12px 14px", borderLeft: `3px solid ${cat.color}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 18, lineHeight: 1 }}>{cat.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, color: T.ink, fontSize: 13, fontWeight: 700, lineHeight: 1.5 }}>{p.en}</p>
                      {/* Indonesian translation (p.id_) temporarily disabled — bilingual prompts off for now */}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn onClick={() => answerPrompt(p)} style={{ flex: 1, padding: "8px 12px", fontSize: 12 }}>Answer</Btn>
                    <Btn onClick={() => dismissPrompt(p.id)} secondary style={{ flex: 1, padding: "8px 12px", fontSize: 12 }}>Skip</Btn>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {!showForm && <Btn onClick={startAdd} full style={{ marginBottom: 16 }}>+ Add Observation</Btn>}

      {showForm && (
        <Card style={{ marginBottom: 16 }}>
          {answeringPrompt && (
            <div style={{ marginBottom: 12, padding: "10px 12px", background: T.purpleL, borderRadius: T.r }}>
              <p style={{ margin: 0, color: T.ink, fontSize: 12, fontWeight: 700, lineHeight: 1.5 }}>{answeringPrompt.en}</p>
            </div>
          )}

          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: T.inkSoft }}>Category</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {DEV_LOG_CATEGORIES.map(c => {
              const isActive = category === c.key;
              return (
                <button key={c.key} onClick={() => setCategory(c.key)}
                  style={{ padding: "8px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody, background: isActive ? c.color : T.surface, color: isActive ? "white" : T.ink, border: `1.5px solid ${isActive ? c.color : T.border}` }}>
                  {c.emoji} {c.label}
                </button>
              );
            })}
          </div>

          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: T.inkSoft }}>Who is this from?</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {DEV_LOG_SOURCES.map(s => {
              const isActive = source === s.key;
              return (
                <button key={s.key} onClick={() => setSource(s.key)}
                  style={{ flex: 1, padding: "8px 10px", borderRadius: T.r, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody, lineHeight: 1.4, textAlign: "center", background: isActive ? T.purple : T.surface, color: isActive ? "white" : T.ink, border: `1.5px solid ${isActive ? T.purple : T.border}` }}>
                  {s.emoji} {s.label}
                </button>
              );
            })}
          </div>

          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Woke up 3 times last night, seemed unsettled. Refused breakfast but ate snacks fine." rows={4}
            style={{ width: "100%", padding: "11px 14px", borderRadius: T.r, border: `1.5px solid ${T.border}`, fontSize: 14, fontFamily: T.fontBody, color: T.ink, background: T.canvas, outline: "none", resize: "vertical", lineHeight: 1.5, boxSizing: "border-box", marginBottom: 14 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={saveEntry} disabled={!note.trim()} style={{ flex: 1 }}>{editingId ? "Save Changes" : "Add Entry"}</Btn>
            <Btn onClick={resetForm} secondary style={{ flex: 1 }}>Cancel</Btn>
          </div>
        </Card>
      )}

      {devLog.length === 0 ? (
        <div style={{ padding: "32px 20px", textAlign: "center" }}>
          <p style={{ margin: "0 0 6px", fontSize: 32 }}>📔</p>
          <p style={{ margin: 0, color: T.inkMuted, fontSize: 13, lineHeight: 1.6 }}>No observations yet. Add your first entry to start building {activeChild.name}'s development record.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {devLog.map(entry => {
            const cat = devLogCategory(entry.category);
            const src = devLogSource(entry.source);
            return (
              <Card key={entry.id} style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
                  <Badge color={cat.color}>{cat.emoji} {cat.label}</Badge>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: src.key === "official" ? T.teal : T.inkMuted }}>{src.emoji} {src.label}</span>
                    <p style={{ margin: 0, color: T.inkMuted, fontSize: 11, fontWeight: 600 }}>{new Date(entry.date).toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
                <p style={{ margin: "0 0 10px", color: T.ink, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{entry.note}</p>
                <div style={{ display: "flex", gap: 14 }}>
                  <button onClick={() => startEdit(entry)} style={{ background: "none", border: "none", color: T.purple, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: T.fontBody, padding: 0 }}>Edit</button>
                  <button onClick={() => deleteEntry(entry.id)} style={{ background: "none", border: "none", color: T.red, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: T.fontBody, padding: 0 }}>Delete</button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

export function MyChildScreen({ childCtx }) {
  const [subTab, setSubTab] = useState("profile"); // profile | devlog

  const { activeChild, children, updateChild } = childCtx || {};
  const isFosterChild = activeChild?.caregiverType === "foster";

  return (
    <Page>

      {activeChild && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: children?.length > 1 ? 6 : 20 }}>
          <ChildAvatar value={activeChild.emoji} size={36} active={true} borderColor={T.purple} />
          <p style={{ margin: 0, fontWeight: 800, color: T.ink, fontSize: 16 }}>{activeChild.name}</p>
          {ageFromDob(activeChild.dob) && (
            <span style={{ background: T.purpleL, color: T.purple, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99 }}>{ageFromDob(activeChild.dob)}</span>
          )}
        </div>
      )}

      {activeChild && children?.length > 1 && (
        <p style={{ margin: "0 0 20px", color: T.inkMuted, fontSize: 12, lineHeight: 1.5 }}>Want to view another child's data? Tap them on the Home tab to switch.</p>
      )}

      {isFosterChild && (
        <div style={{ background: T.ink, borderRadius: T.r, padding: "12px 14px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 16 C9 16 2 11.5 2 6.5 C2 4 3.5 2.5 5.5 2.5 C7 2.5 8 3.5 9 5 C10 3.5 11 2.5 12.5 2.5 C14.5 2.5 16 4 16 6.5 C16 11.5 9 16 9 16Z" stroke="white" strokeWidth="1.4" fill="white" fillOpacity="0.2"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 2px", color: "white", fontWeight: 800, fontSize: 13 }}>Foster Child Profile</p>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: 11, lineHeight: 1.5 }}>No medical records? Use this guide to document observations and prepare for appointments.</p>
          </div>
        </div>
      )}

      <div style={{ display: "flex", background: T.border, borderRadius: T.r, padding: 3, gap: 3, marginBottom: 24 }}>
        {[["profile","Child Profile"],["devlog","Development"]].map(([v, l]) => (
          <button key={v} onClick={() => setSubTab(v)} style={{ flex: 1, padding: "10px", borderRadius: 9, background: subTab === v ? T.surface : "transparent", border: "none", fontWeight: 700, fontSize: 13, color: subTab === v ? T.ink : T.inkMuted, cursor: "pointer", fontFamily: T.fontBody, boxShadow: subTab === v ? T.shadow : "none", transition: "all 0.2s" }}>{l}</button>
        ))}
      </div>

      {subTab === "profile" && activeChild && (
        <ChildProfileForm childCtx={childCtx} showHeader={false} />
      )}

      {subTab === "devlog" && (
        activeChild
          ? <DevLogSection activeChild={activeChild} updateChild={updateChild} />
          : <p style={{ margin: 0, color: T.inkMuted, fontSize: 13, textAlign: "center", padding: "32px 0" }}>Add a child profile on the Home tab to start a development log.</p>
      )}
    </Page>
  );
}
// Every sign/action has its own icon that relates to its meaning.
// Stroke-based, refined geometry, consistent 18×18 viewBox.
