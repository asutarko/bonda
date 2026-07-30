import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge, Btn, Input, TextArea, Select, Avatar, Accordion, PageHero, AvatarIllustrations, ChildAvatar, ComAvatar, ROOM_ICONS, ACTIVITY_TEXTAREA_STYLE, ActionIllustration, HeroIllustration } from "../ui";
import { CHILD_AVATARS, DEFAULT_CHILDREN, DEFAULT_SCHEDULE, ROOM_COLORS, SOS_COLORS, VERBAL_STATUS_OPTIONS } from "../data";
import { ChildProfileForm } from "./onboarding";
import { GrowthTrackerSection } from "./GrowthTracker";
import { MedicalDisclaimerBanner } from "../components/bonda-compliance";

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

// Options like "Food allergy (specify)" or "Medication allergy (specify)" need
// a free-text follow-up so the caregiver can say *which* allergy — everything
// else in the Gentle Prompts list is a plain pick with no extra detail needed.
const requiresSpecify = option => /\(specify\)/i.test(option?.answer || "");
const selectedRequiresSpecify = (question, selectedIds) => (selectedIds || []).some(id => requiresSpecify(question.options.find(o => o.id === id)));

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
  const [editingPromptId, setEditingPromptId] = useState(null);
  const [editPromptAnswer, setEditPromptAnswer] = useState([]);
  const [category, setCategory] = useState("other");
  const [source, setSource] = useState("carer");
  const [note, setNote] = useState("");
  const [pendingAnswers, setPendingAnswers] = useState({}); // questionId -> [optionId, ...] — held until "Submit Answers" is pressed
  const [specifyText, setSpecifyText] = useState({}); // questionId -> free text for the selected "(specify)" option
  const [editSpecifyText, setEditSpecifyText] = useState("");
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

  const resetForm = () => { setShowForm(false); setEditingId(null); setEditingPromptId(null); setEditPromptAnswer([]); setEditSpecifyText(""); setCategory("other"); setSource("carer"); setNote(""); };

  const startAdd = () => { resetForm(); setShowForm(true); };
  const startEdit = entry => {
    setEditingId(entry.id);
    setCategory(entry.category);
    setSource(entry.source || "carer");
    setNote(entry.note);
    setEditingPromptId(entry.promptId || null);
    const question = entry.promptId ? faqQuestions.find(q => q.id === entry.promptId) : null;
    // Older entries were only saved with the joined answer text, not option ids
    // — fall back to matching options by label so the combobox still preselects.
    const answerIds = entry.optionIds || (question ? question.options.filter(o => (entry.note || "").split(", ").includes(o.answer)).map(o => o.id) : []);
    setEditPromptAnswer(answerIds);
    // Specify answers were saved as "Label: detail" — pull the detail back out
    // so re-editing doesn't lose what the caregiver typed.
    const specifyOption = question ? question.options.find(o => answerIds.includes(o.id) && requiresSpecify(o)) : null;
    const specifyPrefix = specifyOption ? `${specifyOption.answer}: ` : null;
    setEditSpecifyText(specifyPrefix && (entry.note || "").startsWith(specifyPrefix) ? (entry.note || "").slice(specifyPrefix.length) : "");
    setShowForm(true);
  };

  // If the entry being edited came from a Gentle Prompt, edit it the same way it
  // was created — via the question's combobox — instead of the generic form.
  const editingPromptQuestion = editingPromptId ? faqQuestions.find(q => q.id === editingPromptId) : null;

  const saveEntry = async () => {
    if (editingId && editingPromptQuestion) {
      if (!editPromptAnswer.length) return;
      const chosenOptions = editingPromptQuestion.options.filter(o => editPromptAnswer.includes(o.id));
      const finalNote = chosenOptions
        .map(o => (requiresSpecify(o) && editSpecifyText.trim()) ? `${o.answer}: ${editSpecifyText.trim()}` : o.answer)
        .join(", ");
      updateChild(activeChild.id, { devLog: devLog.map(e => e.id === editingId ? { ...e, note: finalNote, optionIds: editPromptAnswer } : e) });

      // caregiver_faq_answers has no update policy — replace this question's
      // rows outright so they stay in sync with the edited selection instead
      // of going stale next to the devLog note above.
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("caregiver_faq_answers").delete().eq("child_id", activeChild.id).eq("question_id", editingPromptQuestion.id);
      const answerRows = chosenOptions.map(o => ({
        child_id: activeChild.id,
        question_id: editingPromptQuestion.id,
        option_id: o.id,
        answered_by: user?.id || null,
        detail: (requiresSpecify(o) && editSpecifyText.trim()) || null,
      }));
      if (answerRows.length) await supabase.from("caregiver_faq_answers").insert(answerRows);

      resetForm();
      return;
    }
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

  const deleteEntry = async id => {
    const entry = devLog.find(e => e.id === id);
    updateChild(activeChild.id, { devLog: devLog.filter(e => e.id !== id) });
    // Drop the matching caregiver_faq_answers rows too, otherwise they'd
    // survive as orphaned answers to a question the devLog no longer shows.
    if (entry?.promptId) await supabase.from("caregiver_faq_answers").delete().eq("child_id", activeChild.id).eq("question_id", entry.promptId);
  };

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
      note: p.options.filter(o => pendingAnswers[p.id].includes(o.id))
        .map(o => (requiresSpecify(o) && specifyText[p.id]?.trim()) ? `${o.answer}: ${specifyText[p.id].trim()}` : o.answer)
        .join(", "),
      promptId: p.id,
      optionIds: pendingAnswers[p.id],
    }));
    updateChild(activeChild.id, { devLog: [...newEntries, ...devLog] });

    // Also written as proper rows in caregiver_faq_answers (one per chosen
    // option) so answers can be queried/reported on directly, instead of
    // only living inside the dev_log JSONB blob written above.
    const { data: { user } } = await supabase.auth.getUser();
    const answerRows = answeredPrompts.flatMap(p => pendingAnswers[p.id].map(optionId => {
      const option = p.options.find(o => o.id === optionId);
      return {
        child_id: activeChild.id,
        question_id: p.id,
        option_id: optionId,
        answered_by: user?.id || null,
        detail: (requiresSpecify(option) && specifyText[p.id]?.trim()) || null,
      };
    }));
    if (answerRows.length) await supabase.from("caregiver_faq_answers").insert(answerRows);

    setPendingAnswers({});
    setSpecifyText({});
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
                  {selectedRequiresSpecify(p, pendingAnswers[p.id]) && (
                    <TextArea
                      placeholder="Please specify..."
                      rows={2}
                      style={{ marginTop: 8 }}
                      value={specifyText[p.id] || ""}
                      onChange={e => setSpecifyText(prev => ({ ...prev, [p.id]: e.target.value }))}
                    />
                  )}
                </Card>
              ))}
              <Btn onClick={submitFaqAnswers} disabled={!hasPendingAnswers} full>Submit Answers</Btn>
            </div>
          )}
        </div>
      )}

      {!showForm && SHOW_ADD_OBSERVATION && <Btn onClick={startAdd} full style={{ marginBottom: 16 }}>+ Add Observation</Btn>}

      {showForm && !editingPromptQuestion && (
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
            const question = entry.promptId ? faqQuestions.find(q => q.id === entry.promptId) : null;

            if (editingId === entry.id && editingPromptQuestion) {
              return (
                <Card key={entry.id} style={{ padding: "14px 16px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: T.inkSoft }}>{editingPromptQuestion.question}</p>
                  <Select
                    placeholder={editingPromptQuestion.allowMultiple ? undefined : "Select an answer"}
                    multiple={editingPromptQuestion.allowMultiple || undefined}
                    value={editingPromptQuestion.allowMultiple ? editPromptAnswer : (editPromptAnswer[0] || "")}
                    onChange={e => {
                      const ids = editingPromptQuestion.allowMultiple ? Array.from(e.target.selectedOptions, o => o.value) : (e.target.value ? [e.target.value] : []);
                      setEditPromptAnswer(ids);
                    }}
                    options={editingPromptQuestion.options.map(opt => ({ value: opt.id, label: opt.answer }))}
                  />
                  {selectedRequiresSpecify(editingPromptQuestion, editPromptAnswer) && (
                    <TextArea
                      placeholder="Please specify..."
                      rows={2}
                      style={{ marginTop: 8 }}
                      value={editSpecifyText}
                      onChange={e => setEditSpecifyText(e.target.value)}
                    />
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <Btn onClick={saveEntry} disabled={!editPromptAnswer.length} style={{ flex: 1 }}>Save Changes</Btn>
                    <Btn onClick={resetForm} secondary style={{ flex: 1 }}>Cancel</Btn>
                  </div>
                </Card>
              );
            }

            return (
              <Card key={entry.id} style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
                  <Badge color={cat.color}>{cat.emoji} {cat.label}</Badge>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: src.key === "official" ? T.teal : T.inkMuted }}>{src.emoji} {src.label}</span>
                    <p style={{ margin: 0, color: T.inkMuted, fontSize: 11, fontWeight: 600 }}>{new Date(entry.date).toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
                {question && <p style={{ margin: "0 0 4px", color: T.inkMuted, fontSize: 12, fontWeight: 700, lineHeight: 1.5 }}>{question.question}</p>}
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

export function MyChildScreen({ childCtx, push }) {
  const [subTab, setSubTab] = useState("profile"); // profile | devlog | growth

  const { activeChild, children, updateChild } = childCtx || {};
  const isFosterChild = activeChild?.caregiverType === "foster";
  const isChildActive = !!activeChild?.active;

  // The Development tab needs an approved child profile (devLog write policies
  // assume it). Bounce back to Child Profile if it's somehow selected for a
  // still-pending child — e.g. switching from an approved child to a pending one.
  useEffect(() => {
    if (subTab === "devlog" && !isChildActive) setSubTab("profile");
  }, [activeChild?.id, isChildActive]);

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

  return (
    <Page>
      <MedicalDisclaimerBanner />

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: children?.length > 1 ? 6 : 20 }}>
        <ChildAvatar value={activeChild.emoji} size={36} active={true} borderColor={T.purple} />
        <p style={{ margin: 0, fontWeight: 800, color: T.ink, fontSize: 16 }}>{activeChild.name}</p>
        {ageFromDob(activeChild.dob) && (
          <span style={{ background: T.purpleL, color: T.purple, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99 }}>{ageFromDob(activeChild.dob)}</span>
        )}
        <span style={{ background: activeChild.active ? T.greenL : T.amberL, color: activeChild.active ? T.green : T.amber, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99 }}>{activeChild.active ? "Active" : "Pending approval"}</span>
      </div>

      {children?.length > 1 && (
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

      <div style={{ display: "flex", background: T.border, borderRadius: T.r, padding: 3, gap: 3, marginBottom: isChildActive ? 24 : 8 }}>
        {[["profile","Child Profile"],["devlog","Development"],["growth","Growth Tracker"]].map(([v, l]) => {
          const disabled = v === "devlog" && !isChildActive;
          return (
            <button key={v} onClick={() => !disabled && setSubTab(v)} disabled={disabled}
              style={{ flex: 1, padding: "10px", borderRadius: 9, background: subTab === v ? T.surface : "transparent", border: "none", fontWeight: 700, fontSize: 13, color: disabled ? T.inkMuted : (subTab === v ? T.ink : T.inkMuted), cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, fontFamily: T.fontBody, boxShadow: subTab === v ? T.shadow : "none", transition: "all 0.2s" }}>
              {l}
            </button>
          );
        })}
      </div>

      {!isChildActive && (
        <p style={{ margin: "0 0 20px", color: T.inkMuted, fontSize: 12, lineHeight: 1.5 }}>Development log unlocks once {activeChild.name}'s profile is approved.</p>
      )}

      {subTab === "profile" && (
        <ChildProfileForm childCtx={childCtx} showHeader={false} />
      )}

      {subTab === "devlog" && (
        <DevLogSection activeChild={activeChild} updateChild={updateChild} />
      )}

      {subTab === "growth" && (
        <GrowthTrackerSection activeChild={activeChild} updateChild={updateChild} />
      )}
    </Page>
  );
}
// Every sign/action has its own icon that relates to its meaning.
// Stroke-based, refined geometry, consistent 18×18 viewBox.
