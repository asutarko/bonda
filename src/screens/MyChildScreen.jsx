import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge, Btn, Input, TextArea, Select, Avatar, Accordion, PageHero, AvatarIllustrations, ChildAvatar, ComAvatar, ROOM_ICONS, ACTIVITY_TEXTAREA_STYLE, ActionIllustration, HeroIllustration } from "../ui";
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

// "+ Add Observation" (the free-text manual entry) is temporarily hidden while
// the Supabase-backed FAQ prompts below are the primary way to log observations.
// Flip this back to true to restore the manual entry button.
const SHOW_ADD_OBSERVATION = false;

export function DevLogSection({ activeChild, updateChild }) {
  const devLog = activeChild.devLog || [];
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [category, setCategory] = useState("other");
  const [source, setSource] = useState("carer");
  const [note, setNote] = useState("");
  const [pendingAnswers, setPendingAnswers] = useState({}); // questionId -> [optionId, ...] — held until "Submit Answers" is pressed
  const [faqQuestions, setFaqQuestions] = useState([]);
  const [loadingFaq, setLoadingFaq] = useState(true);

  // Caregiver check-in questions now live in Supabase (caregiver_faq_questions /
  // caregiver_faq_options) so they can be edited from the dashboard without a
  // redeploy, instead of the old hardcoded OBSERVATION_PROMPTS/AUTISM_PROMPTS lists.
  useEffect(() => {
    let active = true;
    const loadFaq = async () => {
      setLoadingFaq(true);
      const { data } = await supabase
        .from("caregiver_faq_questions")
        .select("*, caregiver_faq_options(*)")
        .eq("caregiver_type", activeChild.caregiverType || "biological")
        .order("sort_order");
      if (!active) return;
      setFaqQuestions((data || []).map(q => ({
        id: q.id,
        question: q.question,
        allowMultiple: q.allow_multiple,
        options: (q.caregiver_faq_options || []).slice().sort((a, b) => a.sort_order - b.sort_order),
      })));
      setLoadingFaq(false);
    };
    loadFaq();
    return () => { active = false; };
  }, [activeChild.caregiverType]);

  const answeredPromptIds = devLog.filter(e => e.promptId).map(e => e.promptId);
  const activePrompts = faqQuestions.filter(q => !answeredPromptIds.includes(q.id));

  const resetForm = () => { setShowForm(false); setEditingId(null); setCategory("other"); setSource("carer"); setNote(""); };

  const startAdd = () => { resetForm(); setShowForm(true); };
  const startEdit = entry => { setEditingId(entry.id); setCategory(entry.category); setSource(entry.source || "carer"); setNote(entry.note); setShowForm(true); };

  const saveEntry = () => {
    const finalNote = note.trim();
    if (!finalNote) return;
    if (editingId) {
      updateChild(activeChild.id, { devLog: devLog.map(e => e.id === editingId ? { ...e, category, source, note: finalNote } : e) });
    } else {
      const entry = { id: Date.now().toString(), date: new Date().toISOString(), category, source, note: finalNote };
      updateChild(activeChild.id, { devLog: [entry, ...devLog] });
    }
    resetForm();
  };

  const deleteEntry = id => updateChild(activeChild.id, { devLog: devLog.filter(e => e.id !== id) });

  // Picking an answer just holds it in pendingAnswers — nothing is written to
  // Supabase until "Submit Answers" below saves everything picked so far in
  // one go, instead of one devLog write per question.
  const selectFaqOption = (question, e) => {
    const ids = question.allowMultiple ? Array.from(e.target.selectedOptions, o => o.value) : (e.target.value ? [e.target.value] : []);
    setPendingAnswers(prev => ({ ...prev, [question.id]: ids }));
  };

  const hasPendingAnswers = Object.values(pendingAnswers).some(ids => ids && ids.length > 0);

  const submitFaqAnswers = async () => {
    const answeredPrompts = activePrompts.filter(p => (pendingAnswers[p.id] || []).length > 0);
    if (!answeredPrompts.length) return;

    const now = Date.now();
    const newEntries = answeredPrompts.map((p, i) => ({
      id: (now + i).toString(),
      date: new Date().toISOString(),
      category: "other",
      source: "carer",
      note: p.options.filter(o => pendingAnswers[p.id].includes(o.id)).map(o => o.answer).join(", "),
      promptId: p.id,
    }));
    updateChild(activeChild.id, { devLog: [...newEntries, ...devLog] });

    // Also written as proper rows in caregiver_faq_answers (one per chosen
    // option) so answers can be queried/reported on directly, instead of
    // only living inside the dev_log JSONB blob written above.
    const { data: { user } } = await supabase.auth.getUser();
    const answerRows = answeredPrompts.flatMap(p => pendingAnswers[p.id].map(optionId => ({
      child_id: activeChild.id,
      question_id: p.id,
      option_id: optionId,
      answered_by: user?.id || null,
    })));
    if (answerRows.length) await supabase.from("caregiver_faq_answers").insert(answerRows);

    setPendingAnswers({});
  };

  return (
    <>
      <p style={{ margin: "0 0 14px", color: T.inkSoft, fontSize: 13, lineHeight: 1.6 }}>Log dated observations about {activeChild.name}'s sleep, eating, communication, sensory and behaviour patterns. Over time this becomes a record you can bring to doctors, schools, or therapists.</p>

      {!showForm && (loadingFaq || activePrompts.length > 0) && (
        <div style={{ marginBottom: 16 }}>
          <SectionLabel style={{ marginBottom: 10 }}>Gentle Prompts for You</SectionLabel>
          {loadingFaq ? (
            <p style={{ margin: 0, color: T.inkSoft, fontSize: 13 }}>Loading questions...</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activePrompts.map(p => (
                <Card key={p.id} style={{ padding: "12px 14px", borderLeft: `3px solid ${T.purple}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 18, lineHeight: 1 }}>❓</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, color: T.ink, fontSize: 13, fontWeight: 700, lineHeight: 1.5 }}>{p.question}</p>
                    </div>
                  </div>
                  <Select
                    placeholder={p.allowMultiple ? undefined : "Select an answer"}
                    multiple={p.allowMultiple || undefined}
                    value={p.allowMultiple ? (pendingAnswers[p.id] || []) : (pendingAnswers[p.id]?.[0] || "")}
                    onChange={e => selectFaqOption(p, e)}
                    options={p.options.map(opt => ({ value: opt.id, label: opt.answer }))}
                  />
                </Card>
              ))}
              <Btn onClick={submitFaqAnswers} disabled={!hasPendingAnswers} full>Submit Answers</Btn>
            </div>
          )}
        </div>
      )}

      {!showForm && SHOW_ADD_OBSERVATION && <Btn onClick={startAdd} full style={{ marginBottom: 16 }}>+ Add Observation</Btn>}

      {showForm && (
        <Card style={{ marginBottom: 16 }}>
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
          <span style={{ background: activeChild.active ? T.greenL : T.amberL, color: activeChild.active ? T.green : T.amber, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99 }}>{activeChild.active ? "Active" : "Pending approval"}</span>
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
