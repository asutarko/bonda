import { useState, useEffect, useMemo, useRef, lazy, Suspense } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, SectionLabel, Card, Btn, Badge } from "../ui";
import { VERBAL_STATUS_OPTIONS, PLACEMENT_TYPE_OPTIONS } from "../data";

// TinyMCE (core + skin CSS + plugins) is only needed once the caregiver
// actually opens this screen, so it's split into its own chunk instead of
// shipping in the main bundle for every user — see src/screens/TinyMCEEditor.jsx.
const TinyMCEEditor = lazy(() => import("./TinyMCEEditor"));

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

// This screen's look is ported from the carer-letter.html mockup, which pairs
// a serif display face (titles, the letter body itself) with a sans body face
// (labels, UI chrome) instead of the Literata-everywhere look used by the rest
// of the app — kept local to this screen (same pattern as AddChildProfile.jsx /
// CommunityApp.jsx) rather than changed globally in theme.js.
const FONT_TITLE = "'Fraunces', Georgia, serif";
const FONT_BODY = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";

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
    if (has("doctor") || has("physician") || has("psychiatrist")) return values.doctorName;
    if (has("clinic") && has("address")) return values.clinicAddress;
    if (has("clinic") && has("phone")) return values.clinicPhone;
    if (has("clinic") && has("email")) return values.clinicEmail;
    if (has("clinic")) return values.clinic;
    if (key === "pronoun" || key.includes("him") || key.includes("her")) return values.pronoun;
    if (has("location") || has("country")) return values.location;
    // Collected once via the "Set up your first letter" step (CarerLetterScreen's
    // carer-details form) — left bracketed only if the caregiver skipped it.
    // Checked before the generic "carer" catch-all below, since the phrase
    // "licensed foster carer" would otherwise match on "carer" and get
    // wrongly filled with the caregiver's name.
    if (has("licensed")) return values.licensedCarer || match;
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

// Anything still bracketed after fillTemplate is, by definition, unfilled — wrap
// it so it reads as a highlighted placeholder in the editor and exported PDF
// instead of plain text that's easy to miss (styled via the "bonda-bk" class
// added to TinyMCE's content_style below).
const highlightBrackets = (html) => html.replace(/\[([^\]]+)\]/g, '<span class="bonda-bk">[$1]</span>');

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
  "Clinic address": "The postal address of that clinic.",
  "Clinic phone": "A contact phone number for that clinic.",
  "Clinic email": "A contact email address for that clinic.",
  "Doctor name": "The name of the doctor/psychiatrist treating this child.",
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

// The preview is edited as rich HTML in TinyMCE, so the PDF is rendered
// straight from that HTML — but as a rasterized image per page (via
// html2canvas), not through jsPDF's own doc.html() vector-text renderer.
// jsPDF's html() has a long-standing upstream bug (parallax/jsPDF#3901):
// with autoPaging "text", any inline tag (<strong>/<b>/<em>/...) makes the
// text that follows drift further down the page, and the drift compounds
// with every inline tag used earlier in the document — very visible here
// since the letter's tables bold every row label. There's no working
// upstream fix, so we sidestep the vector-text path entirely.
const exportLetterToPdf = async (html, fileName) => {
  const margin = 56; // pt
  const scale = 2; // render resolution multiplier for crispness
  const renderWidthPx = 1000;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;

  // Rendered off-screen for html2canvas, but kept at real (0,0) coordinates
  // inside a zero-size overflow:hidden wrapper rather than pushed out via
  // `left: -99999px`. html2canvas has to allocate a canvas large enough to
  // span from the element's position to the document's visible edge — with
  // an offset that extreme, that canvas can exceed the browser's max canvas
  // size, silently clipping/shifting the captured image so the letter ends
  // up jammed against the right margin in the exported PDF.
  const hider = document.createElement("div");
  hider.style.position = "fixed";
  hider.style.top = "0";
  hider.style.left = "0";
  hider.style.width = "0";
  hider.style.height = "0";
  hider.style.overflow = "hidden";

  const container = document.createElement("div");
  container.style.width = `${renderWidthPx}px`;
  container.style.background = "#fff";
  // The "bonda-bk" highlight on unfilled placeholders (see highlightBrackets)
  // is meant for the in-app editor — a printed letter shouldn't have an orange
  // highlight box, just the plain bracketed text, same as the mockup's own
  // `@media print { .bk { background: none } }` rule.
  container.innerHTML = `<style>.bonda-bk{background:none!important;padding:0!important;color:${T.amber}!important;}</style><div style="font-family:${FONT_TITLE};font-size:12pt;line-height:1.5;color:#000;">${html}</div>`;
  hider.appendChild(container);
  document.body.appendChild(hider);

  try {
    if (document.fonts?.ready) await document.fonts.ready;
    const canvas = await html2canvas(container, { scale, backgroundColor: "#ffffff", windowWidth: renderWidthPx });

    // Never slice a page mid-row/mid-paragraph: collect every block-level
    // element's top offset (in the container's own px, before the html2canvas
    // scale multiplier) as a candidate page-break point, and always break on
    // the latest candidate that still fits within one page's height.
    const containerRect = container.getBoundingClientRect();
    const breakPoints = Array.from(container.querySelectorAll("tr, p, h1, h2, h3, h4, li"))
      .map(el => el.getBoundingClientRect().top - containerRect.top)
      .filter(top => top > 0);
    const containerHeightPx = containerRect.height;

    const canvasPxPerPt = canvas.width / contentWidth;
    const maxSlicePagePx = contentHeight * canvasPxPerPt;

    let cursor = 0; // container-local px (unscaled)
    let pageIndex = 0;
    while (cursor < containerHeightPx - 0.5) {
      const maxCursor = cursor + maxSlicePagePx / scale;
      const candidates = breakPoints.filter(top => top > cursor + 1 && top <= maxCursor);
      const breakAt = candidates.length ? candidates[candidates.length - 1] : Math.min(maxCursor, containerHeightPx);

      const sliceTopPx = Math.round(cursor * scale);
      const sliceHeightPx = Math.round(breakAt * scale) - sliceTopPx;
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeightPx;
      sliceCanvas.getContext("2d").drawImage(canvas, 0, sliceTopPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

      if (pageIndex > 0) doc.addPage();
      doc.addImage(sliceCanvas.toDataURL("image/png"), "PNG", margin, margin, contentWidth, sliceHeightPx / canvasPxPerPt);

      cursor = breakAt;
      pageIndex += 1;
    }

    doc.save(fileName);
  } finally {
    document.body.removeChild(hider);
  }
};

export function CarerLetterScreen({ pop, push, childCtx, account }) {
  const { children = [], activeChild, updateChild } = childCtx || {};
  const [selectedChildId, setSelectedChildId] = useState(activeChild?.id || "");
  const selectedChild = children.find(c => c.id === selectedChildId) || activeChild || null;

  const [template, setTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [clinics, setClinics] = useState([]);
  const [psychologists, setPsychologists] = useState([]);

  const [letterText, setLetterText] = useState("");
  const [howtoOpen, setHowtoOpen] = useState(false);
  const saveTimer = useRef(null);

  // "Set up your first letter" — the mandatory first step of this screen
  // (ported from the carer-letter.html mockup's s-profile screen: "Your
  // details", "Child's details", "Case worker"), shown before a letter can
  // be generated. The carer fields below ("licensed carer?", fostering
  // agency) aren't collected anywhere else in the app; the child/case-worker
  // fields further down do already live on the "children" table (see
  // updateChild() below) but are surfaced here too since the letter needs
  // them filled in. It's shown fresh every time this screen is opened
  // (pre-filled with whatever was saved last, so returning is a single
  // click) rather than being skipped after the first save, matching the
  // mockup's own form sitting directly ahead of "Generate letter"/preview.
  const [showCarerSetup, setShowCarerSetup] = useState(true);
  const [carerName, setCarerName] = useState(account?.name || "");
  const [carerPhone, setCarerPhone] = useState(account?.phone || "");
  const [licensedCarer, setLicensedCarer] = useState(account?.licensedCarer || "");
  const [carerAgency, setCarerAgency] = useState(account?.carerAgency || "");
  const [carerErrors, setCarerErrors] = useState({});
  const [savingCarer, setSavingCarer] = useState(false);

  // Same step also covers the letter-relevant subset of the selected child's
  // details and their case worker — both already live on the "children" table
  // (edited in full on the child profile screens), but are surfaced here too
  // so a caregiver can fill in anything the letter needs without leaving this
  // flow. Saved back via updateChild(), not new storage.
  const [childDob, setChildDob] = useState(selectedChild?.dob || "");
  const [placementStartDate, setPlacementStartDate] = useState(selectedChild?.placementStartDate || "");
  const [placementType, setPlacementType] = useState(selectedChild?.placementType || "");
  const [courtOrderRef, setCourtOrderRef] = useState(selectedChild?.courtOrderRef || "");
  const [verbalStatus, setVerbalStatus] = useState(selectedChild?.verbalStatus || "");
  const [diagnosis, setDiagnosis] = useState(selectedChild?.diagnosis || "");
  const [knownTriggers, setKnownTriggers] = useState(selectedChild?.knownTriggers || "");
  const [clinicName, setClinicName] = useState(selectedChild?.clinicName || "");
  const [doctorName, setDoctorName] = useState(selectedChild?.doctorName || "");
  const [clinicAddress, setClinicAddress] = useState(selectedChild?.clinicAddress || "");
  const [clinicPhone, setClinicPhone] = useState(selectedChild?.clinicPhone || "");
  const [clinicEmail, setClinicEmail] = useState(selectedChild?.clinicEmail || "");
  const [caseWorkerName, setCaseWorkerName] = useState(selectedChild?.caseWorkerName || "");
  const [caseWorkerPhone, setCaseWorkerPhone] = useState(selectedChild?.caseWorkerPhone || "");
  const [caseWorkerEmail, setCaseWorkerEmail] = useState(selectedChild?.caseWorkerEmail || "");

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  // The child-scoped fields above are only seeded from `selectedChild` once,
  // on mount — so when the caregiver switches child via the picker on the
  // setup form (added below), re-sync them to whichever child is now
  // selected instead of leaving the previous child's values showing.
  useEffect(() => {
    setChildDob(selectedChild?.dob || "");
    setPlacementStartDate(selectedChild?.placementStartDate || "");
    setPlacementType(selectedChild?.placementType || "");
    setCourtOrderRef(selectedChild?.courtOrderRef || "");
    setVerbalStatus(selectedChild?.verbalStatus || "");
    setDiagnosis(selectedChild?.diagnosis || "");
    setKnownTriggers(selectedChild?.knownTriggers || "");
    setClinicName(selectedChild?.clinicName || "");
    setDoctorName(selectedChild?.doctorName || "");
    setClinicAddress(selectedChild?.clinicAddress || "");
    setClinicPhone(selectedChild?.clinicPhone || "");
    setClinicEmail(selectedChild?.clinicEmail || "");
    setCaseWorkerName(selectedChild?.caseWorkerName || "");
    setCaseWorkerPhone(selectedChild?.caseWorkerPhone || "");
    setCaseWorkerEmail(selectedChild?.caseWorkerEmail || "");
    setCarerErrors({});
  }, [selectedChild?.id]);

  const saveCarerDetails = async () => {
    const fe = {};
    if (!carerName.trim()) fe.name = "Please enter your name.";
    if (!carerPhone.trim()) fe.phone = "Please enter a phone number.";
    if (!childDob) fe.childDob = "Please enter the child's date of birth.";
    setCarerErrors(fe);
    if (Object.keys(fe).length > 0) return;
    setSavingCarer(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        name: carerName.trim(),
        phone: carerPhone.trim(),
        licensedCarer,
        carerAgency: carerAgency.trim(),
        carerLetterSetupDone: true,
      },
    });
    // Keeps the shared "profiles" table's phone column (used elsewhere, e.g.
    // Community) in sync — best-effort, same as ProfileScreen.jsx's save.
    if (!error && account?.id) await supabase.from("profiles").update({ phone: carerPhone.trim() }).eq("id", account.id);
    const childPatch = {
      dob: childDob,
      placementStartDate,
      placementType,
      courtOrderRef: courtOrderRef.trim(),
      verbalStatus,
      diagnosis: diagnosis.trim(),
      knownTriggers: knownTriggers.trim(),
      clinicName: clinicName.trim(),
      doctorName: doctorName.trim(),
      clinicAddress: clinicAddress.trim(),
      clinicPhone: clinicPhone.trim(),
      clinicEmail: clinicEmail.trim(),
      caseWorkerName: caseWorkerName.trim(),
      caseWorkerPhone: caseWorkerPhone.trim(),
      caseWorkerEmail: caseWorkerEmail.trim(),
    };
    if (!error && selectedChild && updateChild) updateChild(selectedChild.id, childPatch);
    setSavingCarer(false);
    if (!error) {
      setShowCarerSetup(false);
      // One combined action — same as the mockup's "Save & preview letter" —
      // straight to the generated letter instead of a second "Generate
      // Letter" screen, built from what was just typed above rather than the
      // (not-yet-refreshed) selectedChild/account props.
      buildAndSetLetter(
        { ...selectedChild, ...childPatch },
        { name: carerName.trim(), phone: carerPhone.trim(), email: account?.email, licensedCarer, carerAgency: carerAgency.trim() }
      );
    }
  };

  // Load the mockup's font pairing once, same guarded-injection pattern as
  // AddChildProfile.jsx / CommunityApp.jsx use for their own local fonts.
  useEffect(() => {
    const id = "carer-letter-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

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

  useEffect(() => {
    setLetterText("");
    if (!selectedChild) return;
    let cancelled = false;
    // Reload whatever was last saved for this child (see persistLetter below) so
    // the letter survives a refresh/relogin instead of resetting to blank —
    // "carer_letters" already existed in the schema for exactly this but was
    // never wired up.
    supabase.from("carer_letters").select("content").eq("child_id", selectedChild.id).maybeSingle()
      .then(({ data }) => { if (!cancelled && data?.content) setLetterText(data.content); });
    return () => { cancelled = true; };
  }, [selectedChild?.id]);

  // The admin app already assigns each child to a psychologist (children.psychologist_id),
  // so the recipient is whoever that assignment points to — the caregiver can still
  // hand-edit the recipient/placement/case-worker text directly in the letter preview
  // below if this letter is going somewhere else (e.g. a school).
  const assignedPsychologist = psychologists.find(p => p.id === selectedChild?.psychologistId) || null;
  const assignedClinic = assignedPsychologist ? clinics.find(c => c.id === assignedPsychologist.clinic_id) || null : null;

  // Upsert into "carer_letters" (unique on child_id) so the generated/edited
  // letter survives a refresh and backs the auto-saved "Carer letter" row on
  // the Documents screen.
  const persistLetter = async (content) => {
    if (!selectedChild || !account?.id) return;
    await supabase.from("carer_letters").upsert(
      { user_id: account.id, child_id: selectedChild.id, content, updated_at: new Date().toISOString() },
      { onConflict: "child_id" }
    );
  };

  const handleEditorChange = (html) => {
    setLetterText(html);
    if (!selectedChild) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persistLetter(html), 800);
  };

  // Takes plain child/carer data objects (not the childCtx/account props
  // directly) so it can be called right after saveCarerDetails() below with
  // the values the caregiver just typed — those haven't round-tripped through
  // Supabase and back into `selectedChild`/`account` yet, so reading the props
  // at that point would still show the old (pre-save) data.
  const buildAndSetLetter = (childData, carerData) => {
    if (!template || !childData) return;
    // Anything we don't actually have data for is left as a "[Bracketed]"
    // placeholder rather than a vague "to be confirmed" — same convention as
    // the template's own unfilled placeholders, so it's obvious in the TinyMCE
    // preview exactly which bits the caregiver still needs to fill in by hand.
    const values = {
      date: formatDate(new Date()),
      recipientName: buildRecipientLabel(assignedClinic, assignedPsychologist) || childData.clinicName?.trim() || "[Recipient name / organisation]",
      recipientAddress: assignedClinic?.address?.trim() || "[Recipient address]",
      recipientPhone: assignedClinic?.phone?.trim() || "[Recipient phone]",
      location: childData.location?.trim() || "[Location]",
      childName: childData.name,
      dob: childData.dob ? formatDate(childData.dob) : "[Date of birth]",
      placementStartDate: childData.placementStartDate ? formatDate(childData.placementStartDate) : "[Placement start date]",
      fosteringAgency: childData.fosteringAgency?.trim() || carerData.carerAgency?.trim() || "[Fostering agency / VWO name]",
      caseWorkerName: childData.caseWorkerName?.trim() || "[Case worker name]",
      caseWorkerPhone: childData.caseWorkerPhone?.trim() || "[Case worker phone]",
      caseWorkerEmail: childData.caseWorkerEmail?.trim() || "[Case worker email]",
      placementType: childData.placementType || "[Placement status]",
      courtOrderRef: childData.courtOrderRef?.trim() || "[Court order reference, if applicable]",
      verbalText: verbalTextFor(childData.verbalStatus),
      diagnosis: childData.diagnosis?.trim() || "[Diagnosis, if applicable]",
      allergies: childData.knownTriggers?.trim() || "[Known allergies / triggers]",
      clinic: assignedClinic?.name || childData.clinicName?.trim() || "[Clinic name]",
      clinicAddress: assignedClinic?.address?.trim() || childData.clinicAddress?.trim() || "[Clinic address]",
      clinicPhone: assignedClinic?.phone?.trim() || childData.clinicPhone?.trim() || "[Clinic phone]",
      clinicEmail: childData.clinicEmail?.trim() || "[Clinic email]",
      doctorName: assignedPsychologist?.name || childData.doctorName?.trim() || "[Doctor name]",
      pronoun: pronounFor(childData.gender),
      roleLabel: roleLabelFor(childData.caregiverType, childData.caregiverLabel),
      yourName: carerData.name || "[Your name]",
      yourPhone: carerData.phone || "[Your phone]",
      yourEmail: carerData.email || "[Your email]",
      licensedCarer: carerData.licensedCarer || "",
    };
    const filled = highlightBrackets(fillTemplate(template.content, values));
    setLetterText(filled);
    clearTimeout(saveTimer.current);
    persistLetter(filled);
  };

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

  if (showCarerSetup) {
    // Rebuilt with the mockup's own markup/classes (not the app's generic
    // Card/Input/Select) so this step actually looks like carer-letter.html:
    // white 18px-radius groups on the ivory canvas, 14px inputs with the
    // teal focus ring, and the orange "bracket" tone (T.amber, same colour
    // this screen already uses for unfilled-placeholder highlights) on
    // required marks and errors instead of the app's default red.
    return (
      <Page>
        <style>{`
          .cl-mock, .cl-mock * { font-family: ${FONT_BODY} !important; }
          .cl-mock .cl-serif { font-family: ${FONT_TITLE} !important; }
          .cl-setup .grp{background:${T.surface};border:1px solid ${T.border};border-radius:${T.rL};padding:20px 18px 6px;margin-bottom:16px;}
          .cl-setup .glabel{font-family:${FONT_TITLE};font-weight:600;font-size:18px;margin:0 0 4px;color:${T.ink};}
          .cl-setup .gsub{font-size:13px;color:${T.inkSoft};margin:0 0 18px;}
          .cl-setup .fld{margin-bottom:16px;}
          .cl-setup .fld > label{display:block;font-size:13px;font-weight:700;color:${T.inkSoft};letter-spacing:.02em;margin:0 0 8px;}
          .cl-setup .req{color:${T.amber};}
          .cl-setup input, .cl-setup select{
            width:100%;font-size:15px;color:${T.ink};background:${T.surface};
            border:1px solid ${T.border};border-radius:${T.r};padding:15px 16px;appearance:none;
            box-sizing:border-box;transition:border-color .15s,box-shadow .15s;
          }
          .cl-setup input:focus, .cl-setup select:focus{outline:none;border-color:${T.purple};box-shadow:0 0 0 4px ${T.purpleL};}
          .cl-setup input:disabled{background:${T.canvas};color:${T.inkMuted};cursor:not-allowed;}
          .cl-setup .selwrap{position:relative;}
          .cl-setup .selwrap select{padding-right:40px;}
          .cl-setup .selwrap::after{content:"▾";position:absolute;right:16px;top:50%;transform:translateY(-50%);color:${T.purple};pointer-events:none;font-size:13px;}
          .cl-setup .hint{font-size:12.5px;color:${T.inkMuted};margin:7px 2px 0;}
          .cl-setup .err{font-size:12.5px;color:${T.amber};font-weight:700;margin:7px 2px 0;}
          .cl-setup .cta{width:100%;border:0;border-radius:16px;padding:17px 20px;font-size:16px;font-weight:700;cursor:pointer;background:${T.purple};color:#fff;letter-spacing:.01em;transition:background .15s;}
          .cl-setup .cta:hover{background:${T.purplePress};}
          .cl-setup .cta:disabled{background:${T.border};cursor:not-allowed;}
        `}</style>
        <div className="cl-mock cl-setup">
          <h2 className="cl-serif" style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 600, color: T.ink }}>Set up your first letter</h2>
          <p style={{ margin: "0 0 20px", color: T.inkSoft, fontSize: 13.5, lineHeight: 1.65 }}>
            Before you can make a carer letter, add the child and your own details. We'll reuse these so the letter fills itself in — you won't have to retype anything.
          </p>

          <div className="grp">
            <p className="glabel cl-serif">Your details</p>
            <p className="gsub">These appear as the carer on every letter you create.</p>

            <div className="fld">
              <label>Your name <span className="req">*</span></label>
              <input value={carerName} onChange={e => setCarerName(e.target.value)} placeholder="e.g. Jane Tan" />
              {carerErrors.name && <p className="err">{carerErrors.name}</p>}
            </div>

            <div className="fld">
              <label>Your phone <span className="req">*</span></label>
              <input type="tel" value={carerPhone} onChange={e => setCarerPhone(e.target.value)} placeholder="e.g. 9123 4567" />
              {carerErrors.phone && <p className="err">{carerErrors.phone}</p>}
            </div>

            <div className="fld">
              <label>Are you a licensed / registered foster carer?</label>
              <div className="selwrap">
                <select value={licensedCarer} onChange={e => setLicensedCarer(e.target.value)}>
                  <option value="">Prefer to fill in later</option>
                  <option value="Licensed foster carer">Yes — licensed / registered</option>
                  <option value="Foster carer (not licensed)">No</option>
                </select>
              </div>
            </div>

            <div className="fld">
              <label>Fostering agency / VWO name</label>
              <input value={carerAgency} onChange={e => setCarerAgency(e.target.value)} placeholder="e.g. MSF, Boys' Town" />
              <p className="hint">Leave blank if you're not sure — you can type it into the letter later.</p>
            </div>
          </div>

          <div className="grp">
            <p className="glabel cl-serif">Child's details</p>
            <p className="gsub">Used to fill in the medical and placement sections of the letter.</p>

            {children.length > 1 ? (
              <div className="fld">
                <label>Child</label>
                <div className="selwrap">
                  <select value={selectedChildId || selectedChild.id} onChange={e => setSelectedChildId(e.target.value)}>
                    {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="fld">
                <label>Child</label>
                <input value={selectedChild.name} disabled />
              </div>
            )}

            <div className="fld">
              <label>Date of birth <span className="req">*</span></label>
              <input type="date" value={childDob} onChange={e => setChildDob(e.target.value)} />
              {carerErrors.childDob && <p className="err">{carerErrors.childDob}</p>}
            </div>

            <div className="fld">
              <label>In my care since</label>
              <input type="date" value={placementStartDate} onChange={e => setPlacementStartDate(e.target.value)} />
              <p className="hint">The date the child came into your care.</p>
            </div>

            <div className="fld">
              <label>Placement status</label>
              <div className="selwrap">
                <select value={placementType} onChange={e => setPlacementType(e.target.value)}>
                  <option value="">Select placement status (foster carers only)</option>
                  {PLACEMENT_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="fld">
              <label>Court order reference</label>
              <input value={courtOrderRef} onChange={e => setCourtOrderRef(e.target.value)} placeholder="If applicable" />
            </div>

            <div className="fld">
              <label>How they communicate</label>
              <div className="selwrap">
                <select value={verbalStatus} onChange={e => setVerbalStatus(e.target.value)}>
                  <option value="">Select verbal status</option>
                  {VERBAL_STATUS_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className="fld">
              <label>Diagnosis <span style={{ fontWeight: 400, color: T.inkMuted }}>— if applicable</span></label>
              <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="e.g. Autism, ADHD" />
            </div>

            <div className="fld">
              <label>Known allergies / triggers</label>
              <input value={knownTriggers} onChange={e => setKnownTriggers(e.target.value)} placeholder="e.g. Peanuts, loud noises" />
            </div>
          </div>

          <div className="grp">
            <p className="glabel cl-serif">Clinic & doctor <span style={{ fontWeight: 400, color: T.inkMuted, fontSize: 13 }}>— optional</span></p>
            <p className="gsub">Fills in the "Mental health professionals" section of the letter.</p>

            <div className="fld"><label>Clinic name</label><input value={clinicName} onChange={e => setClinicName(e.target.value)} placeholder="e.g. Sunrise Family Clinic" /></div>
            <div className="fld"><label>Doctor name</label><input value={doctorName} onChange={e => setDoctorName(e.target.value)} placeholder="e.g. Dr Tan" /></div>
            <div className="fld"><label>Clinic address</label><input value={clinicAddress} onChange={e => setClinicAddress(e.target.value)} placeholder="e.g. 1 Sunrise Ave, #01-01" /></div>
            <div className="fld"><label>Clinic phone</label><input type="tel" value={clinicPhone} onChange={e => setClinicPhone(e.target.value)} placeholder="e.g. 6123 4567" /></div>
            <div className="fld"><label>Clinic email</label><input type="email" value={clinicEmail} onChange={e => setClinicEmail(e.target.value)} placeholder="e.g. contact@clinic.com" /></div>
          </div>

          <div className="grp">
            <p className="glabel cl-serif">Case worker <span style={{ fontWeight: 400, color: T.inkMuted, fontSize: 13 }}>— optional</span></p>
            <p className="gsub">The child's assigned case worker / social worker. Services often call to verify.</p>

            <div className="fld"><label>Name</label><input value={caseWorkerName} onChange={e => setCaseWorkerName(e.target.value)} /></div>
            <div className="fld"><label>Phone</label><input type="tel" value={caseWorkerPhone} onChange={e => setCaseWorkerPhone(e.target.value)} /></div>
            <div className="fld"><label>Email</label><input type="email" value={caseWorkerEmail} onChange={e => setCaseWorkerEmail(e.target.value)} /></div>
          </div>

          <button className="cta" onClick={saveCarerDetails} disabled={savingCarer}>{savingCarer ? "Saving..." : "Save & preview letter"}</button>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      {/* Ports the carer-letter.html mockup's type pairing onto this screen only
          (Fraunces for titles, Plus Jakarta Sans for everything else) instead of
          the Literata-everywhere look the rest of the app uses — see FONT_TITLE
          / FONT_BODY above. Also carries the light reskin of TinyMCE's default
          oxide-skin chrome (grey/blue) so the toolbar reads as part of the Bonda
          system instead of a generic widget. Both scoped to this screen. */}
      <style>{`
        .cl-mock, .cl-mock * { font-family: ${FONT_BODY} !important; }
        .cl-mock .cl-serif { font-family: ${FONT_TITLE} !important; }
        .tox.tox-tinymce { border: none !important; border-radius: 0 !important; }
        .tox .tox-toolbar__primary, .tox .tox-toolbar-overlord { background: ${T.canvas} !important; }
        .tox .tox-toolbar__group { border: none !important; }
        .tox .tox-tbtn { border-radius: 8px !important; margin: 2px !important; }
        .tox .tox-tbtn:hover { background: ${T.purpleL} !important; color: ${T.purple} !important; }
        .tox .tox-tbtn--enabled, .tox .tox-tbtn--enabled:hover { background: ${T.purpleL} !important; color: ${T.purple} !important; }
        .tox .tox-edit-area__iframe { background: ${T.surface} !important; }
      `}</style>

      <div className="cl-mock">
      <p style={{ margin: "0 0 6px", color: T.inkSoft, fontSize: 13, lineHeight: 1.6 }}>We've auto-filled the letter below with what we already know about the child and your account — edit anything (including the recipient and placement details) freely before exporting as a PDF.</p>
      <button
        onClick={() => setShowCarerSetup(true)}
        style={{ background: "none", border: "none", padding: 0, margin: "0 0 18px", fontFamily: FONT_BODY, fontSize: 12.5, fontWeight: 700, color: T.purple, cursor: "pointer" }}
      >
        Edit your details
      </button>

      {letterText && (
        <>
          <SectionLabel>Preview — edit freely before exporting</SectionLabel>

          <Card style={{ marginBottom: 14, padding: 0, overflow: "hidden" }}>
            <div
              onClick={() => setHowtoOpen(o => !o)}
              style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 10, background: T.purpleL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={T.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </div>
              <p className="cl-serif" style={{ flex: 1, margin: 0, fontWeight: 600, fontSize: 15, color: T.ink }}>How to edit this letter</p>
              <span style={{ color: T.inkMuted, fontSize: 11, transform: howtoOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
            </div>
            {howtoOpen && (
              <div style={{ padding: "0 16px 16px" }}>
                <p style={{ margin: "0 0 10px", fontSize: 12, color: T.inkSoft, lineHeight: 1.6 }}>
                  Anything shown in <strong style={{ color: T.amber, background: T.amberL, borderRadius: 5, padding: "0 4px" }}>[brackets]</strong> below means we didn't have that information on file — click into the letter and type over it with the real detail. You can also freely rewrite, bold, or reformat any other part before exporting.
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
              </div>
            )}
          </Card>

          <div style={{ marginBottom: 14, borderRadius: T.r, overflow: "hidden", border: `1.5px solid ${T.border}` }}>
            <Suspense fallback={<p style={{ margin: 0, padding: 16, color: T.inkSoft, fontSize: 13 }}>Loading editor...</p>}>
              <TinyMCEEditor
                licenseKey="gpl"
                value={letterText}
                onEditorChange={handleEditorChange}
                init={{
                  height: 520,
                  menubar: false,
                  statusbar: false,
                  plugins: "lists link table",
                  toolbar: "undo redo | bold italic underline | bullist numlist | link table | removeformat",
                  // Mirrors the carer-letter.html mockup's ".doc" typography: the
                  // letter body itself reads as serif (Fraunces) like a formal
                  // typed letter, while section headers and bolded row labels
                  // (the admin template bolds every row label — see
                  // exportLetterToPdf's comment above) switch to the sans body
                  // face in small uppercase caps, same contrast as the mockup's
                  // "h3" / "td.k" treatment.
                  content_style: `
                    body { font-family: ${FONT_TITLE}; font-size: 14px; line-height: 1.6; color: ${T.ink}; }
                    h1,h2,h3,h4 { font-family: ${FONT_TITLE}; font-weight: 600; letter-spacing: -0.01em; margin: 20px 0 10px; color: ${T.ink}; }
                    h1 { font-size: 21px; } h2 { font-size: 18px; }
                    h3, h4 { font-family: ${FONT_BODY}; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
                    h3 { font-size: 13px; margin: 24px 0 10px; } h4 { font-size: 12px; }
                    p { margin: 0 0 12px; }
                    table { border-collapse: collapse; width: 100%; margin: 0 0 14px; }
                    td, th { border: 1px solid ${T.border}; padding: 9px 11px; vertical-align: top; font-size: 13.5px; text-align: left; }
                    td strong, th strong { font-family: ${FONT_BODY}; }
                    ul, ol { margin: 0 0 14px; padding-left: 20px; }
                    li { margin: 0 0 6px; }
                    .bonda-bk { color: ${T.amber}; background: ${T.amberL}; border-radius: 5px; padding: 0 4px; font-weight: 600; }
                  `,
                }}
              />
            </Suspense>
          </div>
          <Btn full onClick={downloadPdf}>Export to PDF</Btn>
        </>
      )}
      </div>
    </Page>
  );
}
