import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, SectionLabel, Card, Btn, Input, TextArea, Select } from "../ui";

const PLACEMENT_TYPE_OPTIONS = ["short-term", "long-term", "kinship", "emergency"];

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
  return "verbal status to be confirmed";
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

// The admin app's editor saves rich text as HTML, but the PDF export just
// draws plain lines of text — so strip tags here first, turning block
// elements into line breaks instead of running everything together.
const htmlToPlainText = (html) => {
  if (!html || !/<[a-z][\s\S]*>/i.test(html)) return html || "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("br").forEach(br => br.replaceWith("\n"));
  doc.querySelectorAll("li").forEach(el => el.append("\n"));
  doc.querySelectorAll("p, div, h1, h2, h3, h4, h5, h6, tr").forEach(el => el.append("\n\n"));
  return (doc.body.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
};

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
    if (key === "pronoun" || key.includes("him") || key.includes("her")) return values.pronoun;
    if (has("location") || has("country")) return values.location;
    if (has("carer") || has("your") || has("parent")) {
      if (has("phone")) return values.yourPhone;
      if (has("email")) return values.yourEmail;
      if (has("role")) return values.roleLabel;
      return values.yourName;
    }
    return match;
  });
  return withBrackets
    .replace(/\bfoster carer\b/g, values.roleLabel)
    .replace(/^Foster Carer$/gm, titleCase(values.roleLabel));
};

const buildRecipientLabel = (clinic, psychologist) => {
  if (!clinic) return "";
  const attn = psychologist ? `Attn: ${psychologist.name}, ` : "";
  return `${attn}${clinic.name}${clinic.address ? `, ${clinic.address}` : ""}`;
};

const exportLetterToPdf = (text, fileName) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 56;
  const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
  const pageHeight = doc.internal.pageSize.getHeight();
  const lineHeight = 16;
  doc.setFont("times", "normal");
  doc.setFontSize(11);

  let y = margin;
  text.split("\n").forEach((rawLine) => {
    const wrapped = rawLine.trim() === "" ? [""] : doc.splitTextToSize(rawLine, maxWidth);
    wrapped.forEach((line) => {
      if (y > pageHeight - margin) { doc.addPage(); y = margin; }
      if (line) doc.text(line, margin, y);
      y += lineHeight;
    });
  });

  doc.save(fileName);
};

export function CarerLetterScreen({ pop, push, childCtx, account }) {
  const { children = [], activeChild } = childCtx || {};
  const [selectedChildId, setSelectedChildId] = useState(activeChild?.id || "");
  const selectedChild = children.find(c => c.id === selectedChildId) || activeChild || null;

  const [template, setTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [clinics, setClinics] = useState([]);
  const [psychologists, setPsychologists] = useState([]);

  // Clinic name and location now come from the caregiver's own profile
  // (set once in Edit Profile) instead of being retyped on every letter.
  const [recipientName, setRecipientName] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [placementStartDate, setPlacementStartDate] = useState("");
  const [fosteringAgency, setFosteringAgency] = useState("");
  const [caseWorkerName, setCaseWorkerName] = useState("");
  const [caseWorkerPhone, setCaseWorkerPhone] = useState("");
  const [caseWorkerEmail, setCaseWorkerEmail] = useState("");
  const [placementType, setPlacementType] = useState("");
  const [courtOrderRef, setCourtOrderRef] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  const [letterText, setLetterText] = useState("");

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

  // The admin app already assigns each child to a psychologist (children.psychologist_id),
  // so default the recipient to that assignment instead of making the caregiver pick it
  // again — they can still overwrite the clinic name / recipient fields below if this
  // letter is going somewhere else (e.g. a school).
  const assignedPsychologist = psychologists.find(p => p.id === selectedChild?.psychologistId) || null;
  const assignedClinic = assignedPsychologist ? clinics.find(c => c.id === assignedPsychologist.clinic_id) || null : null;

  useEffect(() => {
    if (!assignedPsychologist || !assignedClinic) return;
    setRecipientName(prev => prev || buildRecipientLabel(assignedClinic, assignedPsychologist));
  }, [selectedChild?.id, assignedPsychologist?.id, assignedClinic?.id]);

  const useClinicAsRecipient = () => {
    if (!account?.clinicName?.trim()) return;
    setRecipientName(account.clinicName.trim());
  };

  const generateLetter = () => {
    if (!template || !selectedChild) return;
    const values = {
      date: formatDate(new Date()),
      recipientName: recipientName.trim() || "Recipient name / organisation",
      recipientAddress: recipientAddress.trim() || "to be confirmed",
      recipientPhone: recipientPhone.trim() || "to be confirmed",
      location: account?.location?.trim() || "to be confirmed",
      childName: selectedChild.name,
      dob: selectedChild.dob ? formatDate(selectedChild.dob) : "to be confirmed",
      placementStartDate: placementStartDate ? formatDate(placementStartDate) : "to be confirmed",
      fosteringAgency: fosteringAgency.trim() || "to be confirmed",
      caseWorkerName: caseWorkerName.trim() || "to be confirmed",
      caseWorkerPhone: caseWorkerPhone.trim() || "to be confirmed",
      caseWorkerEmail: caseWorkerEmail.trim() || "to be confirmed",
      placementType: placementType || "to be confirmed",
      courtOrderRef: courtOrderRef.trim() || "not applicable",
      verbalText: verbalTextFor(selectedChild.verbalStatus),
      diagnosis: diagnosis.trim() || "assessment pending",
      pronoun: pronounFor(selectedChild.gender),
      roleLabel: roleLabelFor(selectedChild.caregiverType, selectedChild.caregiverLabel),
      yourName: account?.name || "",
      yourPhone: account?.phone || "to be confirmed",
      yourEmail: account?.email || "",
    };
    setLetterText(fillTemplate(htmlToPlainText(template.content), values));
  };

  const downloadPdf = () => {
    if (!letterText.trim()) return;
    const fileName = `${(selectedChild?.name || "carer").replace(/\s+/g, "_")}_carer_letter.pdf`;
    exportLetterToPdf(letterText, fileName);
  };

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
      <p style={{ margin: "0 0 18px", color: T.inkSoft, fontSize: 13, lineHeight: 1.6 }}>Fill in the details below — we'll auto-fill what we already know about the child and your account, then build an editable letter you can export as a PDF.</p>

      {children.length > 1 && (
        <Select label="Child" value={selectedChildId || selectedChild.id} onChange={e => setSelectedChildId(e.target.value)} options={children.map(c => ({ value: c.id, label: c.name }))} />
      )}

      <SectionLabel style={{ marginBottom: 10 }}>Recipient</SectionLabel>
      <Card style={{ marginBottom: 14 }}>
        {assignedPsychologist && assignedClinic && (
          <p style={{ margin: "0 0 14px", color: T.purple, fontSize: 12, fontWeight: 700, lineHeight: 1.5 }}>✓ Auto-filled from {selectedChild.name}'s assigned psychologist — {assignedPsychologist.name} at {assignedClinic.name}. Change below if this letter is for someone else.</p>
        )}
        {account?.clinicName || account?.location ? (
          <p style={{ margin: "0 0 14px", color: T.inkSoft, fontSize: 12, lineHeight: 1.5 }}>
            Clinic: <strong>{account?.clinicName || "not set"}</strong> · Location: <strong>{account?.location || "not set"}</strong>
            {" — "}<span onClick={() => push?.("editProfile")} style={{ color: T.purple, fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}>edit in profile</span>
          </p>
        ) : (
          <p style={{ margin: "0 0 14px", color: T.amber, fontSize: 12, fontWeight: 700, lineHeight: 1.5 }}>
            Add your clinic name and location in <span onClick={() => push?.("editProfile")} style={{ textDecoration: "underline", cursor: "pointer" }}>Edit Profile</span> so they can be used here.
          </p>
        )}
        {account?.clinicName && <Btn secondary onClick={useClinicAsRecipient} style={{ marginBottom: 14 }}>Use clinic as recipient</Btn>}
        <Input label="Recipient name / organisation" placeholder="e.g. General Office, ABC Primary School" value={recipientName} onChange={e => setRecipientName(e.target.value)} />
        <Input label="Recipient address (optional)" placeholder="e.g. 123 Clinic Road, Singapore" value={recipientAddress} onChange={e => setRecipientAddress(e.target.value)} />
        <Input label="Recipient phone (optional)" placeholder="e.g. 6123 4567" value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} />
      </Card>

      <SectionLabel style={{ marginBottom: 10 }}>Placement & Case Worker (if applicable)</SectionLabel>
      <Card style={{ marginBottom: 14 }}>
        <Input label="Placement start date" type="date" value={placementStartDate} onChange={e => setPlacementStartDate(e.target.value)} />
        <Input label="Fostering agency / VWO name" value={fosteringAgency} onChange={e => setFosteringAgency(e.target.value)} />
        <Input label="Case worker name" value={caseWorkerName} onChange={e => setCaseWorkerName(e.target.value)} />
        <Input label="Case worker phone" value={caseWorkerPhone} onChange={e => setCaseWorkerPhone(e.target.value)} />
        <Input label="Case worker email" value={caseWorkerEmail} onChange={e => setCaseWorkerEmail(e.target.value)} />
        <Select label="Placement status" placeholder="Select placement status (foster carers only)" value={placementType} onChange={e => setPlacementType(e.target.value)} options={PLACEMENT_TYPE_OPTIONS.map(o => ({ value: o, label: o }))} />
        <Input label="Court order reference (if applicable)" value={courtOrderRef} onChange={e => setCourtOrderRef(e.target.value)} />
        <Input label="Diagnosis (if applicable)" placeholder="e.g. Autism Spectrum Disorder" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
      </Card>

      <Btn full onClick={generateLetter} style={{ marginBottom: 20 }}>Generate Letter</Btn>

      {letterText && (
        <>
          <SectionLabel style={{ marginBottom: 10 }}>Preview — edit freely before exporting</SectionLabel>
          <TextArea value={letterText} onChange={e => setLetterText(e.target.value)} rows={20} style={{ fontFamily: "inherit", whiteSpace: "pre-wrap" }} />
          <Btn full onClick={downloadPdf}>Export to PDF</Btn>
        </>
      )}
    </Page>
  );
}
