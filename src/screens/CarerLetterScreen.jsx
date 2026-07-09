import { useState, useEffect, useMemo } from "react";
import { jsPDF } from "jspdf";
import { Editor } from "@tinymce/tinymce-react";
import "tinymce/tinymce";
import "tinymce/icons/default";
import "tinymce/themes/silver";
import "tinymce/models/dom";
import "tinymce/plugins/lists";
import "tinymce/plugins/link";
import "tinymce/skins/ui/oxide/skin.css";
import "tinymce/skins/content/default/content.css";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, SectionLabel, Card, Btn, Select } from "../ui";

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

const verbalTextFor = (verbalStatus) => {
  if (verbalStatus === "verbal") return "verbal";
  if (verbalStatus === "nonverbal") return "non-verbal";
  if (verbalStatus === "mixed") return "an emerging communicator (uses some words and AAC/picture cards)";
  return "[Verbal status]";
};

const pronounFor = (gender) => (gender === "Male" ? "him" : gender === "Female" ? "her" : "them");

// The template was written for foster carers specifically ("I am writing to
// introduce myself as the foster carer for...") but this letter is now offered
// to every caregiver type, so swap that role label to fit — the rest of the
// sentence (case worker, fostering agency, etc.) still reads fine left blank
// ("to be confirmed") for caregiver types where it doesn't apply, and the
// caregiver can hand-edit the preview for anything that still needs tweaking.
const roleLabelFor = (caregiverType, caregiverLabel) => {
  if (caregiverType === "foster") return "foster carer";
  if (caregiverType === "biological") return "parent";
  if (caregiverType === "grandparent") return "grandparent caregiver";
  return caregiverLabel || "carer";
};

const titleCase = (s) => s.replace(/\b\w/g, c => c.toUpperCase());

// Best-effort fill of the bracketed placeholders in the admin-managed template.
// The admin app's editor lets whoever manages the template rename placeholders
// freely (e.g. "[recipient name]" one week, "[Receiver_Name]" the next), so
// instead of matching an exact string, every "[...]" is normalized (lowercased,
// underscores → spaces) and matched against keywords for each field. Anything
// that doesn't match a known field is left untouched rather than blanked out,
// so an unrecognised placeholder stays visible for the caregiver to fill by hand.
const normalizeBracket = (s) => s.toLowerCase().replace(/_/g, " ").replace(/['']/g, "").replace(/\s+/g, " ").trim();

const fillTemplate = (content, values) => {
  const withBrackets = content.replace(/\[([^\]]+)\]/g, (match, inner) => {
    const key = normalizeBracket(inner);
    const has = (...words) => words.every(w => key.includes(w));

    if (has("date") && has("birth")) return values.dob;
    if (key === "date" || has("today") || has("letter", "date")) return values.date;
    if (has("receiver") || has("recipient")) {
      if (has("address")) return values.recipientAddress;
      if (has("phone")) return values.recipientPhone;
      return values.recipientName;
    }
    if (has("child") && has("name")) return values.childName;
    if (has("placement") && has("start")) return values.placementStartDate;
    if (has("placement") && (has("type") || has("status"))) return values.placementType;
    if (has("fostering") || has("agency") || has("vwo")) return values.fosteringAgency;
    if (has("case", "worker") || has("caseworker")) {
      if (has("phone")) return values.caseWorkerPhone;
      if (has("email")) return values.caseWorkerEmail;
      return values.caseWorkerName;
    }
    if (has("court") && has("order")) return values.courtOrderRef;
    if (has("verbal")) return values.verbalText;
    if (has("diagnosis")) return values.diagnosis;
    if (has("allerg")) return values.allergies;
    if (has("clinic")) return values.clinic;
    if (key === "pronoun" || key.includes("him") || key.includes("her")) return values.pronoun;
    if (has("location") || has("country")) return values.location;
    // Not something we hold data for (there's no "are you licensed" field on
    // the child/account) — left bracketed so the caregiver states it themselves.
    // Checked before the generic "carer" catch-all below, since the phrase
    // "licensed foster carer" would otherwise match on "carer" and get
    // wrongly filled with the caregiver's name.
    if (has("licensed")) return match;
    if (has("carer") || has("your") || has("parent")) {
      if (has("phone")) return values.yourPhone;
      if (has("email")) return values.yourEmail;
      if (has("role")) return values.roleLabel;
      return values.yourName;
    }
    return match;
  });
  // Case-insensitive + tag-agnostic so this still matches when the phrase
  // sits inside HTML markup (e.g. "<strong>Foster Carer</strong>"), not just
  // on its own plain-text line.
  return withBrackets.replace(/\bfoster carer\b/gi, (match) =>
    match === "Foster Carer" ? titleCase(values.roleLabel) : values.roleLabel
  );
};

const buildRecipientLabel = (clinic, psychologist) => {
  if (!clinic) return "";
  const attn = psychologist ? `Attn: ${psychologist.name}, ` : "";
  return `${attn}${clinic.name}${clinic.address ? `, ${clinic.address}` : ""}`;
};

// Plain-language explanation for each of our own "[Field name]" fill-ins, shown
// next to the checklist item so a caregiver who's never seen this letter before
// knows what they're actually looking for, not just the field's technical name.
const PLACEHOLDER_HELP = {
  "Recipient name / organisation": "Who this letter is addressed to — e.g. the school, clinic, or agency name.",
  "Recipient address": "The postal address of that recipient (optional — leave the bracket in place if not needed).",
  "Recipient phone": "A contact phone number for that recipient (optional).",
  "Location": "The city/country you and the child are based in.",
  "Date of birth": "The child's date of birth.",
  "Placement start date": "The date the child came into your care.",
  "Fostering agency / VWO name": "The fostering agency or organisation responsible for this placement.",
  "Case worker name": "The name of the child's assigned case worker / social worker.",
  "Case worker phone": "A contact phone number for the case worker.",
  "Case worker email": "A contact email for the case worker.",
  "Placement status": "The type of placement — e.g. long-term, short-term, kinship, etc.",
  "Court order reference, if applicable": "The court order or legal reference number, if one applies to this placement.",
  "Verbal status": "Whether the child is verbal, non-verbal, or an emerging communicator.",
  "Diagnosis, if applicable": "Any medical or developmental diagnosis relevant to this letter.",
  "Known allergies / triggers": "Allergies or known triggers the reader should be aware of.",
  "Clinic name": "The clinic or practice handling this child's care.",
  "Your name": "Your full name, as the person signing this letter.",
  "Your phone": "Your contact phone number.",
  "Your email": "Your contact email address.",
  "Licensed foster carer": "Whether you are an officially licensed/registered foster carer (e.g. state \"Yes\" or \"No\") — this isn't something we store automatically, so type it in directly.",
};

// For anything else left in brackets — placeholders the admin template author
// typed in directly (e.g. "Medical_Fee_Exemption_Card_number") that our filler
// doesn't recognise — turn the raw text into something readable instead of
// showing the caregiver a snake_case/camelCase token verbatim.
const humanizePlaceholder = (raw) => raw
  .replace(/_/g, " ")
  .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  .replace(/\s+/g, " ")
  .trim()
  .replace(/\b\w/g, c => c.toUpperCase());

// Keyed by normalizeBracket() (same normalization fillTemplate uses) rather than
// exact text, so admin-typed variants like "Licensed_Foster_Carer" or
// "licensed foster carer" still match the "Licensed foster carer" entry above.
const PLACEHOLDER_HELP_BY_KEY = Object.fromEntries(
  Object.entries(PLACEHOLDER_HELP).map(([label, desc]) => [normalizeBracket(label), { label, desc }])
);

const describePlaceholder = (raw) => {
  const found = PLACEHOLDER_HELP_BY_KEY[normalizeBracket(raw)];
  if (found) return found;
  return { label: humanizePlaceholder(raw), desc: "From the letter template — read the surrounding sentence to see what belongs here." };
};

// The preview is now edited as rich HTML in TinyMCE, so the PDF is rendered
// straight from that HTML (via jsPDF's html2canvas-backed html() plugin)
// instead of drawing plain text lines — this keeps bold/list/etc. formatting
// the caregiver applied in the editor.
const exportLetterToPdf = (html, fileName) => {
  const margin = 56;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const wrapped = `<div style="font-family:'Times New Roman',Times,serif;font-size:12pt;line-height:1.5;color:#000;">${html}</div>`;

  doc.html(wrapped, {
    x: margin,
    y: margin,
    width: pageWidth - margin * 2,
    windowWidth: 700,
    autoPaging: "text",
    html2canvas: { scale: 0.75 },
    callback: (pdf) => pdf.save(fileName),
  });
};

export function CarerLetterScreen({ pop, push, childCtx, account }) {
  const { children = [], activeChild } = childCtx || {};
  const [selectedChildId, setSelectedChildId] = useState(activeChild?.id || "");
  const selectedChild = children.find(c => c.id === selectedChildId) || activeChild || null;

  const [template, setTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [clinics, setClinics] = useState([]);
  const [psychologists, setPsychologists] = useState([]);

  const [letterText, setLetterText] = useState("");
  const [savingLetter, setSavingLetter] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoadingTemplate(true);
      const [{ data: tpl }, { data: cl }, { data: psy }] = await Promise.all([
        supabase.from("carer_letter_templates").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("clinics").select("*").order("name"),
        supabase.from("clinic_psychologists").select("*").order("sort_order"),
      ]);
      setTemplate(tpl || null);
      setClinics(cl || []);
      setPsychologists(psy || []);
      setLoadingTemplate(false);
    };
    load();
  }, []);

  // Load any previously saved letter for the selected child, so re-opening this
  // screen (or switching child and back) doesn't lose earlier edits.
  useEffect(() => {
    setLetterText("");
    setSavedAt(null);
    if (!selectedChild) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("carer_letters").select("content, updated_at").eq("child_id", selectedChild.id).maybeSingle();
      if (!cancelled && data) {
        setLetterText(data.content);
        setSavedAt(data.updated_at);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedChild?.id]);

  const saveLetter = async (content) => {
    if (!selectedChild || !account?.id) return;
    setSavingLetter(true);
    const { error } = await supabase.from("carer_letters").upsert(
      { child_id: selectedChild.id, user_id: account.id, content, updated_at: new Date().toISOString() },
      { onConflict: "child_id" }
    );
    setSavingLetter(false);
    if (!error) setSavedAt(new Date().toISOString());
  };

  // The admin app already assigns each child to a psychologist (children.psychologist_id),
  // so the recipient is whoever that assignment points to — the caregiver can still
  // hand-edit the recipient/placement/case-worker text directly in the letter preview
  // below if this letter is going somewhere else (e.g. a school).
  const assignedPsychologist = psychologists.find(p => p.id === selectedChild?.psychologistId) || null;
  const assignedClinic = assignedPsychologist ? clinics.find(c => c.id === assignedPsychologist.clinic_id) || null : null;

  const generateLetter = () => {
    if (!template || !selectedChild) return;
    // Anything we don't actually have data for is left as a "[Bracketed]"
    // placeholder rather than a vague "to be confirmed" — same convention as
    // the template's own unfilled placeholders, so it's obvious in the TinyMCE
    // preview exactly which bits the caregiver still needs to fill in by hand.
    const values = {
      date: formatDate(new Date()),
      recipientName: buildRecipientLabel(assignedClinic, assignedPsychologist) || account?.clinicName?.trim() || "[Recipient name / organisation]",
      recipientAddress: assignedClinic?.address?.trim() || "[Recipient address]",
      recipientPhone: assignedClinic?.phone?.trim() || "[Recipient phone]",
      location: account?.location?.trim() || "[Location]",
      childName: selectedChild.name,
      dob: selectedChild.dob ? formatDate(selectedChild.dob) : "[Date of birth]",
      placementStartDate: selectedChild.placementStartDate ? formatDate(selectedChild.placementStartDate) : "[Placement start date]",
      fosteringAgency: selectedChild.fosteringAgency?.trim() || "[Fostering agency / VWO name]",
      caseWorkerName: selectedChild.caseWorkerName?.trim() || "[Case worker name]",
      caseWorkerPhone: selectedChild.caseWorkerPhone?.trim() || "[Case worker phone]",
      caseWorkerEmail: selectedChild.caseWorkerEmail?.trim() || "[Case worker email]",
      placementType: selectedChild.placementType || "[Placement status]",
      courtOrderRef: selectedChild.courtOrderRef?.trim() || "[Court order reference, if applicable]",
      verbalText: verbalTextFor(selectedChild.verbalStatus),
      diagnosis: selectedChild.diagnosis?.trim() || "[Diagnosis, if applicable]",
      allergies: selectedChild.knownTriggers?.trim() || "[Known allergies / triggers]",
      clinic: assignedClinic?.name || "[Clinic name]",
      pronoun: pronounFor(selectedChild.gender),
      roleLabel: roleLabelFor(selectedChild.caregiverType, selectedChild.caregiverLabel),
      yourName: account?.name || "[Your name]",
      yourPhone: account?.phone || "[Your phone]",
      yourEmail: account?.email || "[Your email]",
    };
    const filled = fillTemplate(template.content, values);
    setLetterText(filled);
    saveLetter(filled);
  };

  // Debounced auto-save while the caregiver edits in TinyMCE, so their changes
  // persist without needing an explicit "Save" click.
  useEffect(() => {
    if (!letterText || !selectedChild) return;
    const timer = setTimeout(() => saveLetter(letterText), 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letterText]);

  const downloadPdf = () => {
    if (!letterText.trim()) return;
    const fileName = `${(selectedChild?.name || "carer").replace(/\s+/g, "_")}_carer_letter.pdf`;
    exportLetterToPdf(letterText, fileName);
  };

  // Live checklist of everything still bracketed in the letter — both our own
  // "[Field name]" fill-ins and any unrecognised placeholder left over from
  // the template — so the caregiver has a concrete list of what to look for
  // instead of having to scan the whole letter themselves. Recomputes as they
  // edit, so items disappear once they've been replaced.
  const missingPlaceholders = useMemo(() => {
    if (!letterText) return [];
    const found = new Set();
    letterText.replace(/\[([^\]]+)\]/g, (match, inner) => { found.add(inner.trim()); return match; });
    return [...found];
  }, [letterText]);

  if (loadingTemplate) {
    return <Page><p style={{ color: T.inkSoft, fontSize: 13 }}>Loading letter template...</p></Page>;
  }

  if (!template) {
    return <Page><p style={{ color: T.inkMuted, fontSize: 13, lineHeight: 1.6 }}>No letter template has been set up yet. Ask an admin to add one from the admin dashboard.</p></Page>;
  }

  if (!selectedChild) {
    return <Page><p style={{ color: T.inkMuted, fontSize: 13, lineHeight: 1.6 }}>Add a child profile on the Home tab first to generate a carer letter.</p></Page>;
  }

  return (
    <Page>
      <p style={{ margin: "0 0 18px", color: T.inkSoft, fontSize: 13, lineHeight: 1.6 }}>We'll auto-fill the letter with what we already know about the child and your account — generate it, then edit anything (including the recipient and placement details) freely before exporting as a PDF.</p>

      {children.length > 1 && (
        <Select label="Child" value={selectedChildId || selectedChild.id} onChange={e => setSelectedChildId(e.target.value)} options={children.map(c => ({ value: c.id, label: c.name }))} />
      )}

      <Btn full onClick={generateLetter} style={{ marginBottom: 20 }}>Generate Letter</Btn>

      {letterText && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <SectionLabel style={{ marginBottom: 0 }}>Preview — edit freely before exporting</SectionLabel>
            <span style={{ fontSize: 11, color: T.inkMuted }}>
              {savingLetter ? "Saving..." : savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : ""}
            </span>
          </div>

          <Card style={{ marginBottom: 14 }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: T.inkSoft }}>How to edit this letter</p>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: T.inkSoft, lineHeight: 1.6 }}>
              Anything shown in <strong style={{ color: T.amber }}>[brackets]</strong> below means we didn't have that information on file — click into the letter and type over it with the real detail. You can also freely rewrite, bold, or reformat any other part before exporting.
            </p>
            {missingPlaceholders.length > 0 ? (
              <>
                <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: T.amber }}>Still needs filling in ({missingPlaceholders.length}):</p>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: T.inkSoft, lineHeight: 1.7 }}>
                  {missingPlaceholders.map(p => {
                    const { label, desc } = describePlaceholder(p);
                    return <li key={p}><strong style={{ color: T.ink }}>{label}</strong> — {desc}</li>;
                  })}
                </ul>
              </>
            ) : (
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: T.green }}>✓ No blanks left — give the letter one more read-through, then export.</p>
            )}
          </Card>

          <div style={{ marginBottom: 14, borderRadius: T.r, overflow: "hidden", border: `1.5px solid ${T.border}` }}>
            <Editor
              licenseKey="gpl"
              value={letterText}
              onEditorChange={setLetterText}
              init={{
                height: 520,
                menubar: false,
                statusbar: false,
                plugins: "lists link",
                toolbar: "undo redo | bold italic underline | bullist numlist | link | removeformat",
                content_style: `body { font-family: 'Times New Roman', Times, serif; font-size: 13px; line-height: 1.6; color: ${T.ink}; }`,
              }}
            />
          </div>
          <Btn full onClick={downloadPdf}>Export to PDF</Btn>
        </>
      )}
    </Page>
  );
}
