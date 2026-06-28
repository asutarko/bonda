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

// Best-effort fill of the bracketed placeholders in the admin-managed template
// (e.g. "[case worker name]") using keyword matching rather than an exact string
// match, so small wording edits to the template from the admin app don't break this.
const fillTemplate = (content, values) => {
  const rules = [
    [/\[date\]/gi, values.date],
    [/\[recipient name[^\]]*\]/gi, values.recipientName],
    [/\[child'?s preferred name\]/gi, values.childName],
    [/\[date of birth[^\]]*\]/gi, values.dob],
    [/\[placement start date\]/gi, values.placementStartDate],
    [/\[fostering agency[^\]]*\]/gi, values.fosteringAgency],
    [/\[case worker name\]/gi, values.caseWorkerName],
    [/\[case worker phone[^\]]*\]/gi, values.caseWorkerContact],
    [/\[short-term[^\]]*\]/gi, values.placementType],
    [/\[court order reference[^\]]*\]/gi, values.courtOrderRef],
    [/\[non-verbal[^\]]*\/ verbal\]/gi, values.verbalText],
    [/\[diagnosis[^\]]*\]/gi, values.diagnosis],
    [/\[him \/ her \/ them\]/gi, values.pronoun],
    [/\[your name\]/gi, values.yourName],
    [/\[your phone number\]/gi, values.yourPhone],
    [/\[your email\]/gi, values.yourEmail],
    [/\bfoster carer\b/g, values.roleLabel],
    [/^Foster Carer$/gm, titleCase(values.roleLabel)],
  ];
  return rules.reduce((text, [pattern, value]) => text.replace(pattern, value || ""), content);
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

export function CarerLetterScreen({ pop, childCtx, account }) {
  const { children = [], activeChild } = childCtx || {};
  const [selectedChildId, setSelectedChildId] = useState(activeChild?.id || "");
  const selectedChild = children.find(c => c.id === selectedChildId) || activeChild || null;

  const [template, setTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [clinics, setClinics] = useState([]);
  const [psychologists, setPsychologists] = useState([]);
  const [clinicId, setClinicId] = useState("");
  const [psychologistId, setPsychologistId] = useState("");

  const [recipientName, setRecipientName] = useState("");
  const [placementStartDate, setPlacementStartDate] = useState("");
  const [fosteringAgency, setFosteringAgency] = useState("");
  const [caseWorkerName, setCaseWorkerName] = useState("");
  const [caseWorkerContact, setCaseWorkerContact] = useState("");
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

  const clinicPsychologists = psychologists.filter(p => p.clinic_id === clinicId);
  const selectedClinic = clinics.find(c => c.id === clinicId);
  const selectedPsychologist = clinicPsychologists.find(p => p.id === psychologistId);

  // The admin app already assigns each child to a psychologist (children.psychologist_id),
  // so default the recipient to that assignment instead of making the caregiver pick it
  // again — they can still swap to a different clinic/psychologist below if this letter
  // is going somewhere else (e.g. a school).
  const assignedPsychologist = psychologists.find(p => p.id === selectedChild?.psychologistId) || null;
  const assignedClinic = assignedPsychologist ? clinics.find(c => c.id === assignedPsychologist.clinic_id) || null : null;

  useEffect(() => {
    if (!assignedPsychologist || !assignedClinic) return;
    setClinicId(assignedClinic.id);
    setPsychologistId(assignedPsychologist.id);
    setRecipientName(prev => prev || buildRecipientLabel(assignedClinic, assignedPsychologist));
  }, [selectedChild?.id, assignedPsychologist?.id, assignedClinic?.id]);

  const useClinicAsRecipient = () => {
    if (!selectedClinic) return;
    setRecipientName(buildRecipientLabel(selectedClinic, selectedPsychologist));
  };

  const generateLetter = () => {
    if (!template || !selectedChild) return;
    const values = {
      date: formatDate(new Date()),
      recipientName: recipientName.trim() || "Recipient name / organisation",
      childName: selectedChild.name,
      dob: selectedChild.dob ? formatDate(selectedChild.dob) : "to be confirmed",
      placementStartDate: placementStartDate ? formatDate(placementStartDate) : "to be confirmed",
      fosteringAgency: fosteringAgency.trim() || "to be confirmed",
      caseWorkerName: caseWorkerName.trim() || "to be confirmed",
      caseWorkerContact: caseWorkerContact.trim() || "to be confirmed",
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
    setLetterText(fillTemplate(template.content, values));
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
        <Select label="Clinic (optional)" placeholder="Select a clinic" value={clinicId} onChange={e => { setClinicId(e.target.value); setPsychologistId(""); }} options={clinics.map(c => ({ value: c.id, label: c.name }))} />
        {clinicId && (
          <Select label="Psychologist (optional)" placeholder="Select a psychologist" value={psychologistId} onChange={e => setPsychologistId(e.target.value)} options={clinicPsychologists.map(p => ({ value: p.id, label: p.name }))} />
        )}
        {clinicId && <Btn secondary onClick={useClinicAsRecipient} style={{ marginBottom: 14 }}>Use as recipient</Btn>}
        <Input label="Recipient name / organisation" placeholder="e.g. General Office, ABC Primary School" value={recipientName} onChange={e => setRecipientName(e.target.value)} />
      </Card>

      <SectionLabel style={{ marginBottom: 10 }}>Placement & Case Worker (if applicable)</SectionLabel>
      <Card style={{ marginBottom: 14 }}>
        <Input label="Placement start date" type="date" value={placementStartDate} onChange={e => setPlacementStartDate(e.target.value)} />
        <Input label="Fostering agency / VWO name" value={fosteringAgency} onChange={e => setFosteringAgency(e.target.value)} />
        <Input label="Case worker name" value={caseWorkerName} onChange={e => setCaseWorkerName(e.target.value)} />
        <Input label="Case worker phone / email" value={caseWorkerContact} onChange={e => setCaseWorkerContact(e.target.value)} />
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
