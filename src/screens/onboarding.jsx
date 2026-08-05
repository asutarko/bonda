import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { uploadPhoto } from "../hooks";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge, Btn, Input, TextArea, Select, MultiSelect, FieldError, Avatar, Accordion, FormSection, ToggleField, PageHero, ChildAvatar, ComAvatar, ROOM_ICONS, ACTIVITY_TEXTAREA_STYLE, ActionIllustration, HeroIllustration } from "../ui";
import { CHILD_AVATARS, DEFAULT_CHILDREN, DEFAULT_SCHEDULE, PLACEMENT_TYPE_OPTIONS, ROOM_COLORS, SOS_COLORS, VERBAL_STATUS_OPTIONS, DIAGNOSIS_OPTIONS, TRIGGER_OPTIONS, DIET_OPTIONS, ALLERGY_OPTIONS, THERAPY_TYPES } from "../data";

// Opens the date-of-birth picker 20 years back instead of at today's date —
// most children in care aren't newborns, so this saves scrolling through two
// decades of months every time.
const defaultChildDob = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 20);
  return d.toISOString().slice(0, 10);
};

// ---- multi-select <-> plain-text bridge -----------------------------------
// Diagnosis/triggers/diet/allergies are picked from a checklist in the UI but
// stored as the same comma-joined free text the DB columns already used
// before this UI existed (known_triggers, diet_program, diagnosis, allergies)
// — so carer letters and every other reader of those columns need no changes.

const splitJoined = text => text ? text.split(/,\s*/).map(s => s.trim()).filter(Boolean) : [];

const joinMultiField = (selected, other) =>
  selected.map(o => (o === "Other" && other.trim()) ? `Other: ${other.trim()}` : o).join(", ");

// Reverse, for editing an existing profile. Anything that isn't one of the
// known options — including free text typed before this checklist existed —
// is folded into "Other" rather than dropped, so no existing data is lost.
const parseMultiField = (text, options) => {
  const parts = splitJoined(text);
  if (!parts.length) return { selected: [], other: "" };
  const selected = [];
  let other = "";
  for (const part of parts) {
    const otherMatch = part.match(/^Other:\s*(.*)$/i);
    if (otherMatch) { if (!selected.includes("Other")) selected.push("Other"); other = other ? `${other}, ${otherMatch[1]}` : otherMatch[1]; continue; }
    if (options.includes(part)) { selected.push(part); continue; }
    if (!selected.includes("Other")) selected.push("Other");
    other = other ? `${other}, ${part}` : part;
  }
  return { selected, other };
};

// Therapy sessions are a small repeatable {type, note} list in the UI, joined
// into therapy_schedule as "Type — note; Type2 — note2".
const SESSION_SEP = " — ";
const joinSessions = sessions =>
  sessions.filter(s => s.type || s.note.trim()).map(s => `${s.type || "Other"}${s.note.trim() ? `${SESSION_SEP}${s.note.trim()}` : ""}`).join("; ");

// Legacy free text (written before sessions were structured) rarely matches
// "Type — note", so it lands as a single session with an empty type and the
// original text kept as the note — still visible and editable, not dropped.
const parseSessions = text => {
  if (!text) return [{ type: "", note: "" }];
  const chunks = text.split(/;\s*/).map(s => s.trim()).filter(Boolean);
  const sessions = chunks.map(chunk => {
    const i = chunk.indexOf(SESSION_SEP);
    const type = i === -1 ? "" : chunk.slice(0, i);
    if (THERAPY_TYPES.includes(type)) return { type, note: chunk.slice(i + SESSION_SEP.length) };
    return { type: "", note: chunk };
  });
  return sessions.length ? sessions : [{ type: "", note: "" }];
};

const toggleOption = (selected, setSelected, setOther, option) => {
  setSelected(sel => {
    const has = sel.includes(option);
    if (has && option === "Other" && setOther) setOther("");
    return has ? sel.filter(x => x !== option) : [...sel, option];
  });
};

// ---- shared photo block -----------------------------------------------------
// Identical UI in both AddChildScreen and ChildProfileForm; only sizing differs
// (AddChildScreen's is the larger, centred "first fill-in" version).

function PhotoPicker({ photo, setPhoto, photoErr, setPhotoErr, cameraSupported, openCamera, large }) {
  const isPhotoSelected = !!photo;
  return (
    <div style={{
      display: "flex", alignItems: large ? "stretch" : "center", flexDirection: large ? "column" : "row",
      textAlign: large ? "center" : "left", gap: large ? 0 : 14,
      background: T.purpleL, border: `1px solid ${T.border}`, borderRadius: T.rL,
      padding: large ? "24px 18px" : "14px 16px", marginBottom: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: large ? 14 : 0 }}>
        <ChildAvatar value={photo} size={large ? 88 : 60} active={true} borderColor={T.purple} />
      </div>
      <div style={{ flex: large ? undefined : 1 }}>
        <p style={{ margin: large ? "0 0 12px" : "0 0 8px", fontSize: 12, fontWeight: 700, color: T.inkSoft }}>
          {isPhotoSelected ? "Photo added ✓" : "Add a real photo (optional)"}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: large ? "center" : "flex-start" }}>
          <label style={{ background: T.purple, color: "white", borderRadius: large ? 99 : T.r, padding: large ? "10px 18px" : "8px 10px", fontSize: large ? 13 : 12, fontWeight: 700, cursor: "pointer", textAlign: "center", fontFamily: T.fontBody, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, flex: large ? undefined : "1 1 92px" }}>
            <span style={{ fontSize: 15 }}>+</span> Upload
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
              const file = e.target.files[0];
              if (!file) return;
              if (file.size > 2 * 1024 * 1024) return setPhotoErr("Photo must be under 2 MB.");
              const reader = new FileReader();
              reader.onload = ev => { setPhoto(ev.target.result); setPhotoErr(""); };
              reader.readAsDataURL(file);
            }} />
          </label>

          {cameraSupported && (
            <button onClick={openCamera} style={{ background: T.surface, color: T.purple, borderRadius: large ? 99 : T.r, padding: large ? "10px 18px" : "8px 10px", fontSize: large ? 13 : 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${T.purple}`, fontFamily: T.fontBody, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, flex: large ? undefined : "1 1 92px" }}>
              <span style={{ fontSize: 15 }}>+</span> Camera
            </button>
          )}

          {isPhotoSelected && (
            <button onClick={() => setPhoto(null)} style={{ background: large ? "transparent" : T.redL, color: T.red, borderRadius: large ? 99 : T.r, padding: large ? "10px 18px" : "8px 10px", fontSize: large ? 14 : 12, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: T.fontBody }}>{large ? "Remove photo" : "✕"}</button>
          )}
        </div>
        {photoErr && <p style={{ margin: "8px 0 0", color: T.red, fontSize: 11, fontWeight: 700 }}>{photoErr}</p>}
      </div>
    </div>
  );
}

function CameraPanel({ show, videoRef, cameraReady, takePhoto, stopCamera }) {
  if (!show) return null;
  return (
    <div style={{ marginBottom: 16, background: "#000", borderRadius: T.r, overflow: "hidden" }}>
      <video ref={videoRef} style={{ width: "100%", display: "block", aspectRatio: "4/3", objectFit: "cover" }} muted playsInline />
      <div style={{ display: "flex", gap: 8, padding: "10px 12px", background: "#111" }}>
        <Btn onClick={takePhoto} disabled={!cameraReady} style={{ flex: 1, background: cameraReady ? T.green : T.border }}>📸 Take Photo</Btn>
        <Btn onClick={stopCamera} secondary style={{ flex: 1 }}>Cancel</Btn>
      </div>
    </div>
  );
}

// Shared camera plumbing used by both AddChildScreen and ChildProfileForm.
function useChildCamera(setPhoto) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { setCameraSupported(false); return; }
        const devices = await navigator.mediaDevices.enumerateDevices();
        setCameraSupported(devices.some(d => d.kind === "videoinput"));
      } catch { setCameraSupported(false); }
    };
    check();
  }, []);

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => { videoRef.current.play(); setCameraReady(true); };
        }
      }, 100);
    } catch {
      setCameraSupported(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setShowCamera(false); setCameraReady(false);
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 300;
    canvas.height = videoRef.current.videoHeight || 300;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    setPhoto(canvas.toDataURL("image/jpeg", 0.75));
    stopCamera();
  };

  useEffect(() => () => stopCamera(), []);

  return { videoRef, showCamera, cameraReady, cameraSupported, openCamera, stopCamera, takePhoto };
}

export function SpecialNeedsSection({
  verbalStatus, setVerbalStatus,
  diagnosisSelected, setDiagnosisSelected, diagnosisOther, setDiagnosisOther,
  hasTriggers, setHasTriggers, triggersSelected, setTriggersSelected, triggersOther, setTriggersOther,
  hasTherapy, setHasTherapy, therapySessions, setTherapySessions,
  hasDiet, setHasDiet, dietSelected, setDietSelected, dietOther, setDietOther,
  errors = {},
}) {
  const updateSession = (i, key, value) => setTherapySessions(s => s.map((row, idx) => idx === i ? { ...row, [key]: value } : row));
  const addSession = () => setTherapySessions(s => [...s, { type: "", note: "" }]);
  const removeSession = i => setTherapySessions(s => s.filter((_, idx) => idx !== i));

  return (
    <>
      <Select label={<>Verbal status <span style={{ color: T.red }}>*</span></>} value={verbalStatus} onChange={e => setVerbalStatus(e.target.value)} placeholder="Select verbal status" options={VERBAL_STATUS_OPTIONS.map(o => ({ value: o.key, label: o.label }))} />
      <FieldError>{errors.verbalStatus}</FieldError>

      <MultiSelect label="Diagnosis" hint="Select all that apply — leave blank if none yet." options={DIAGNOSIS_OPTIONS}
        selected={diagnosisSelected} onToggle={o => toggleOption(diagnosisSelected, setDiagnosisSelected, setDiagnosisOther, o)} />
      {diagnosisSelected.includes("Other") && (
        <Input placeholder="Other diagnosis" value={diagnosisOther} onChange={e => setDiagnosisOther(e.target.value)} />
      )}

      <ToggleField label="Known triggers?" on={hasTriggers === "Yes"} onChange={v => setHasTriggers(v ? "Yes" : "No")} />
      {hasTriggers === "Yes" && (
        <>
          <MultiSelect label={<>What are they? <span style={{ color: T.red }}>*</span></>} hint="Select all that apply." options={TRIGGER_OPTIONS}
            selected={triggersSelected} onToggle={o => toggleOption(triggersSelected, setTriggersSelected, setTriggersOther, o)} />
          {triggersSelected.includes("Other") && (
            <Input placeholder="Other trigger" value={triggersOther} onChange={e => setTriggersOther(e.target.value)} />
          )}
          <FieldError>{errors.knownTriggers}</FieldError>
        </>
      )}

      <ToggleField label="Therapy schedule?" on={hasTherapy === "Yes"} onChange={v => setHasTherapy(v ? "Yes" : "No")} />
      {hasTherapy === "Yes" && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: T.inkSoft }}>Sessions <span style={{ color: T.red }}>*</span></p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
            {therapySessions.map((s, i) => (
              <div key={i} style={{ border: `1.5px solid ${T.border}`, borderRadius: T.r, padding: "12px 12px 0", position: "relative" }}>
                <Select value={s.type} onChange={e => updateSession(i, "type", e.target.value)} placeholder="Select therapy type" options={THERAPY_TYPES} />
                <Input value={s.note} onChange={e => updateSession(i, "note", e.target.value)} placeholder="e.g. Thu 10am · Rainbow Centre" />
                {therapySessions.length > 1 && (
                  <button type="button" onClick={() => removeSession(i)} aria-label="Remove session" style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", color: T.inkMuted, fontSize: 18, cursor: "pointer", lineHeight: 1, fontFamily: T.fontBody }}>×</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addSession} style={{ background: T.purpleL, color: T.purple, fontWeight: 700, fontSize: 13, padding: "9px 14px", borderRadius: 99, border: "none", cursor: "pointer", fontFamily: T.fontBody }}>+ Add another session</button>
          <FieldError>{errors.therapySchedule}</FieldError>
        </div>
      )}

      <ToggleField label="Diet program?" on={hasDiet === "Yes"} onChange={v => setHasDiet(v ? "Yes" : "No")} />
      {hasDiet === "Yes" && (
        <>
          <MultiSelect label={<>Which diets? <span style={{ color: T.red }}>*</span></>} hint="Select all that apply." options={DIET_OPTIONS}
            selected={dietSelected} onToggle={o => toggleOption(dietSelected, setDietSelected, setDietOther, o)} />
          {dietSelected.includes("Other") && (
            <Input placeholder="Other diet" value={dietOther} onChange={e => setDietOther(e.target.value)} />
          )}
          <FieldError>{errors.dietProgram}</FieldError>
        </>
      )}
    </>
  );
}

export function MedicalInfoSection({
  hasAllergies, setHasAllergies, allergiesSelected, setAllergiesSelected, allergiesOther, setAllergiesOther,
  hasMedication, setHasMedication, medicationDetail, setMedicationDetail,
  errors = {},
}) {
  return (
    <>
      <ToggleField label="Any allergies?" on={hasAllergies === "Yes"} onChange={v => setHasAllergies(v ? "Yes" : "No")} />
      {hasAllergies === "Yes" && (
        <>
          <MultiSelect label={<>Which allergies? <span style={{ color: T.red }}>*</span></>} hint="Select all that apply." options={ALLERGY_OPTIONS}
            selected={allergiesSelected} onToggle={o => toggleOption(allergiesSelected, setAllergiesSelected, setAllergiesOther, o)} />
          {allergiesSelected.includes("Other") && (
            <Input placeholder="Other allergy" value={allergiesOther} onChange={e => setAllergiesOther(e.target.value)} />
          )}
          <FieldError>{errors.allergies}</FieldError>
        </>
      )}

      <ToggleField label="On regular medication?" on={hasMedication === "Yes"} onChange={v => setHasMedication(v ? "Yes" : "No")} />
      {hasMedication === "Yes" && (
        <>
          <TextArea label={<>Please specify <span style={{ color: T.red }}>*</span></>} hint="Medication name and dosage." value={medicationDetail} onChange={e => setMedicationDetail(e.target.value)} placeholder="e.g. Melatonin 3mg at night" />
          <FieldError>{errors.medication}</FieldError>
        </>
      )}
    </>
  );
}

export function CareClinicSection({ hasClinic, setHasClinic, location, setLocation, clinicName, setClinicName, countryOptions }) {
  return (
    <>
      <ToggleField label="Seeing a clinic or specialist?" on={hasClinic === "Yes"} onChange={v => {
        setHasClinic(v ? "Yes" : "No");
        if (!v) { setLocation(""); setClinicName(""); }
      }} />
      {hasClinic === "Yes" && (
        <>
          <Select label="Location (country)" placeholder="Select country" value={location} onChange={e => setLocation(e.target.value)} options={countryOptions} />
          <Input label="Clinic, psychologist or psychiatrist" placeholder="e.g. Dr Tan — Sunrise Family Clinic" value={clinicName} onChange={e => setClinicName(e.target.value)} />
        </>
      )}
    </>
  );
}

// Foster/placement-specific details, kept separate and collapsed by default —
// only relevant to a subset of caregivers, and filled in once here so
// CarerLetterScreen can auto-fill a carer letter from it instead of the
// caregiver retyping it on every letter.
export function PlacementDetailsSection({
  placementStartDate, setPlacementStartDate,
  fosteringAgency, setFosteringAgency,
  placementType, setPlacementType,
  courtOrderRef, setCourtOrderRef,
  caseWorkerName, setCaseWorkerName,
  caseWorkerPhone, setCaseWorkerPhone,
  caseWorkerEmail, setCaseWorkerEmail,
}) {
  return (
    <>
      <Input label="Placement start date" type="date" value={placementStartDate} onChange={e => setPlacementStartDate(e.target.value)} />
      <Input label="Fostering agency / VWO name" value={fosteringAgency} onChange={e => setFosteringAgency(e.target.value)} />
      <Select label="Placement status" placeholder="Select placement status (foster carers only)" value={placementType} onChange={e => setPlacementType(e.target.value)} options={PLACEMENT_TYPE_OPTIONS.map(o => ({ value: o, label: o }))} />
      <Input label="Court order reference" value={courtOrderRef} onChange={e => setCourtOrderRef(e.target.value)} />
      <Input label="Case worker name" value={caseWorkerName} onChange={e => setCaseWorkerName(e.target.value)} />
      <Input label="Case worker phone" value={caseWorkerPhone} onChange={e => setCaseWorkerPhone(e.target.value)} />
      <Input label="Case worker email" value={caseWorkerEmail} onChange={e => setCaseWorkerEmail(e.target.value)} />
    </>
  );
}

export function AddChildScreen({ childCtx, pop }) {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoErr, setPhotoErr] = useState("");
  const camera = useChildCamera(setPhoto);
  const [dob, setDob] = useState(defaultChildDob);
  const [gender, setGender] = useState("");
  const [caregiverType, setCaregiverType] = useState("biological");
  const [caregiverLabel, setCaregiverLabel] = useState("");
  const [customRelative, setCustomRelative] = useState("");
  const [verbalStatus, setVerbalStatus] = useState("");
  const [diagnosisSelected, setDiagnosisSelected] = useState([]);
  const [diagnosisOther, setDiagnosisOther] = useState("");
  const [hasTriggers, setHasTriggers] = useState("No");
  const [triggersSelected, setTriggersSelected] = useState([]);
  const [triggersOther, setTriggersOther] = useState("");
  const [hasTherapy, setHasTherapy] = useState("No");
  const [therapySessions, setTherapySessions] = useState([{ type: "", note: "" }]);
  const [hasDiet, setHasDiet] = useState("No");
  const [dietSelected, setDietSelected] = useState([]);
  const [dietOther, setDietOther] = useState("");
  const [hasAllergies, setHasAllergies] = useState("No");
  const [allergiesSelected, setAllergiesSelected] = useState([]);
  const [allergiesOther, setAllergiesOther] = useState("");
  const [hasMedication, setHasMedication] = useState("No");
  const [medicationDetail, setMedicationDetail] = useState("");
  const [hasClinic, setHasClinic] = useState("No");
  const [placementStartDate, setPlacementStartDate] = useState("");
  const [fosteringAgency, setFosteringAgency] = useState("");
  const [placementType, setPlacementType] = useState("");
  const [courtOrderRef, setCourtOrderRef] = useState("");
  const [caseWorkerName, setCaseWorkerName] = useState("");
  const [caseWorkerPhone, setCaseWorkerPhone] = useState("");
  const [caseWorkerEmail, setCaseWorkerEmail] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [location, setLocation] = useState("");
  const [countryOptions, setCountryOptions] = useState([]);
  const [err, setErr] = useState("");
  const [errors, setErrors] = useState({});
  const { addChild } = childCtx;

  useEffect(() => {
    supabase.from("countries").select("name").order("sort_order").then(({ data }) => {
      if (data) setCountryOptions(data.map(c => c.name));
    });
  }, []);

  const [saving, setSaving] = useState(false);

  const save = async () => {
    const knownTriggers = joinMultiField(triggersSelected, triggersOther);
    const dietProgram = joinMultiField(dietSelected, dietOther);
    const allergies = joinMultiField(allergiesSelected, allergiesOther);
    const therapySchedule = joinSessions(therapySessions);

    const fe = {};
    if (!name.trim()) fe.name = "Please enter your child's name.";
    if (!dob) fe.dob = "Please enter your child's date of birth.";
    if (!gender) fe.gender = "Please select your child's gender.";
    if (caregiverType === "other" && !caregiverLabel.trim()) fe.relationshipDetail = "Please tell us your relationship to this child.";
    if (caregiverType === "other" && caregiverLabel === "Others" && !customRelative.trim()) fe.customRelative = "Please tell us your relationship to this child.";
    if (!verbalStatus) fe.verbalStatus = "Please select your child's verbal status.";
    if (hasTriggers === "Yes" && !knownTriggers.trim()) fe.knownTriggers = "Please select at least one trigger.";
    if (hasTherapy === "Yes" && !therapySchedule.trim()) fe.therapySchedule = "Please add at least one session.";
    if (hasDiet === "Yes" && !dietProgram.trim()) fe.dietProgram = "Please select at least one diet.";
    if (hasAllergies === "Yes" && !allergies.trim()) fe.allergies = "Please select at least one allergy.";
    if (hasMedication === "Yes" && !medicationDetail.trim()) fe.medication = "Please describe the medication.";
    setErrors(fe);
    if (Object.keys(fe).length > 0) return;
    setErr(""); setSaving(true);
    const finalCaregiverLabel = caregiverType === "other" ? (caregiverLabel === "Others" ? customRelative.trim() : caregiverLabel.trim()) : "";
    const id = await addChild({
      name: name.trim(), emoji: photo || "none", dob, gender, caregiverType, caregiverLabel: finalCaregiverLabel,
      hasSpecialNeeds: true, verbalStatus,
      knownTriggers: hasTriggers === "Yes" ? knownTriggers : "",
      therapySchedule: hasTherapy === "Yes" ? therapySchedule : "",
      dietProgram: hasDiet === "Yes" ? dietProgram : "",
      allergies: hasAllergies === "Yes" ? allergies : "",
      medication: hasMedication === "Yes" ? medicationDetail.trim() : "",
      diagnosis: joinMultiField(diagnosisSelected, diagnosisOther),
      placementStartDate, fosteringAgency: fosteringAgency.trim(), placementType, courtOrderRef: courtOrderRef.trim(),
      caseWorkerName: caseWorkerName.trim(), caseWorkerPhone: caseWorkerPhone.trim(), caseWorkerEmail: caseWorkerEmail.trim(),
      clinicName: hasClinic === "Yes" ? clinicName.trim() : "", location: hasClinic === "Yes" ? location : "",
    });
    setSaving(false);
    if (!id) return setErr("Could not save the profile. Please try again.");
    // Loaded on demand — sweetalert2 is only needed for this one success
    // popup, so it's kept out of the main bundle until a save actually happens.
    const { default: Swal } = await import("sweetalert2");
    await Swal.fire({ icon: "success", title: "Profile saved successfully", confirmButtonColor: T.purple });
    pop();
  };

  return (
    <Page>
      <h1 style={{ margin: "6px 0 20px", fontFamily: T.fontDisplay, fontWeight: 600, fontSize: 26, lineHeight: 1.15, letterSpacing: "-0.01em", color: T.ink }}>Add a child profile</h1>
      <p style={{ margin: "-12px 0 20px", color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Each child gets their own schedule, emotion log, and history. You can switch between children anytime.</p>

      <PhotoPicker photo={photo} setPhoto={setPhoto} photoErr={photoErr} setPhotoErr={setPhotoErr}
        cameraSupported={camera.cameraSupported} openCamera={camera.openCamera} large />
      <CameraPanel show={camera.showCamera} videoRef={camera.videoRef} cameraReady={camera.cameraReady} takePhoto={camera.takePhoto} stopCamera={camera.stopCamera} />

      <FormSection title="General information">
        <Input label="Child's name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aiden" />
        <FieldError>{errors.name}</FieldError>
        <Input label="Date of birth" value={dob} onChange={e => setDob(e.target.value)} type="date" />
        <FieldError>{errors.dob}</FieldError>
        <Select label="Gender" value={gender} onChange={e => setGender(e.target.value)} placeholder="Select gender" options={["Male", "Female", "Prefer not to say"]} />
        <FieldError>{errors.gender}</FieldError>

        <Select label="Your relationship to this child" value={caregiverType} onChange={e => setCaregiverType(e.target.value)} options={CAREGIVER_TYPE_OPTIONS} />

        {caregiverType === "other" && (
          <div style={{ marginBottom: 14 }}>
            <Select label="What is your relationship to this child?" value={caregiverLabel} onChange={e => setCaregiverLabel(e.target.value)} placeholder="Select relationship" options={OTHER_CAREGIVER_OPTIONS} />
            <FieldError>{errors.relationshipDetail}</FieldError>
            {caregiverLabel === "Others" && (
              <div style={{ marginTop: 10 }}>
                <Input value={customRelative} onChange={e => setCustomRelative(e.target.value)} placeholder="e.g. Cousin" />
                <FieldError>{errors.customRelative}</FieldError>
              </div>
            )}
          </div>
        )}
      </FormSection>

      <FormSection title="About your child">
        <SpecialNeedsSection
          verbalStatus={verbalStatus} setVerbalStatus={setVerbalStatus}
          diagnosisSelected={diagnosisSelected} setDiagnosisSelected={setDiagnosisSelected} diagnosisOther={diagnosisOther} setDiagnosisOther={setDiagnosisOther}
          hasTriggers={hasTriggers} setHasTriggers={setHasTriggers} triggersSelected={triggersSelected} setTriggersSelected={setTriggersSelected} triggersOther={triggersOther} setTriggersOther={setTriggersOther}
          hasTherapy={hasTherapy} setHasTherapy={setHasTherapy} therapySessions={therapySessions} setTherapySessions={setTherapySessions}
          hasDiet={hasDiet} setHasDiet={setHasDiet} dietSelected={dietSelected} setDietSelected={setDietSelected} dietOther={dietOther} setDietOther={setDietOther}
          errors={errors}
        />
      </FormSection>

      <FormSection title="Medical information" defaultOpen={false}>
        <MedicalInfoSection
          hasAllergies={hasAllergies} setHasAllergies={setHasAllergies} allergiesSelected={allergiesSelected} setAllergiesSelected={setAllergiesSelected} allergiesOther={allergiesOther} setAllergiesOther={setAllergiesOther}
          hasMedication={hasMedication} setHasMedication={setHasMedication} medicationDetail={medicationDetail} setMedicationDetail={setMedicationDetail}
          errors={errors}
        />
      </FormSection>

      <FormSection title="Care & clinic" defaultOpen={false}>
        <CareClinicSection hasClinic={hasClinic} setHasClinic={setHasClinic} location={location} setLocation={setLocation} clinicName={clinicName} setClinicName={setClinicName} countryOptions={countryOptions} />
      </FormSection>

      <FormSection title="Foster & placement details" defaultOpen={false}>
        <PlacementDetailsSection placementStartDate={placementStartDate} setPlacementStartDate={setPlacementStartDate} fosteringAgency={fosteringAgency} setFosteringAgency={setFosteringAgency} placementType={placementType} setPlacementType={setPlacementType} courtOrderRef={courtOrderRef} setCourtOrderRef={setCourtOrderRef} caseWorkerName={caseWorkerName} setCaseWorkerName={setCaseWorkerName} caseWorkerPhone={caseWorkerPhone} setCaseWorkerPhone={setCaseWorkerPhone} caseWorkerEmail={caseWorkerEmail} setCaseWorkerEmail={setCaseWorkerEmail} />
      </FormSection>

      {err && <p style={{ color: T.red, fontSize: 13, fontWeight: 700, margin: "-8px 0 12px" }}>{err}</p>}
      <Btn onClick={save} full disabled={saving}>{saving ? "Saving..." : "Save Profile"}</Btn>
      <Btn onClick={pop} full secondary style={{ marginTop: 10 }}>Cancel</Btn>
    </Page>
  );
}

export const OTHER_CAREGIVER_OPTIONS = ["Aunt / Uncle", "Sibling", "Family Friend", "Nanny / Domestic Helper", "Neighbour", "Others"];

export const CAREGIVER_TYPE_LABELS = { biological: "Biological or Adoptive Parent", foster: "Foster Parent", grandparent: "Grandparent / Extended Family", other: "Other Caregiver" };

export const CAREGIVER_TYPE_OPTIONS = Object.entries(CAREGIVER_TYPE_LABELS).map(([value, label]) => ({ value, label }));

export function ChildProfileForm({ childCtx, onSaved, onCancel, onDeleted, showHeader = true }) {
  const { activeChild, updateChild, deleteChild, userId } = childCtx;

  const isExistingPhoto = !!(activeChild?.emoji && (activeChild.emoji.startsWith("data:") || activeChild.emoji.startsWith("http")));
  const initialCaregiverLabel = activeChild?.caregiverType === "other"
    ? (OTHER_CAREGIVER_OPTIONS.includes(activeChild.caregiverLabel) ? activeChild.caregiverLabel : (activeChild.caregiverLabel ? "Others" : ""))
    : "";
  const initialCustomRelative = activeChild?.caregiverType === "other" && activeChild.caregiverLabel && !OTHER_CAREGIVER_OPTIONS.includes(activeChild.caregiverLabel)
    ? activeChild.caregiverLabel
    : "";
  const initialDiagnosis = parseMultiField(activeChild?.diagnosis || "", DIAGNOSIS_OPTIONS);
  const initialTriggers = parseMultiField(activeChild?.knownTriggers || "", TRIGGER_OPTIONS);
  const initialDiet = parseMultiField(activeChild?.dietProgram || "", DIET_OPTIONS);
  const initialAllergies = parseMultiField(activeChild?.allergies || "", ALLERGY_OPTIONS);

  const [name, setName] = useState(activeChild?.name || "");
  const [photo, setPhoto] = useState(isExistingPhoto ? activeChild.emoji : null);
  const [photoErr, setPhotoErr] = useState("");
  const camera = useChildCamera(setPhoto);
  const [dob, setDob] = useState(activeChild?.dob || "");
  const [gender, setGender] = useState(activeChild?.gender || "");
  const [caregiverType, setCaregiverType] = useState(activeChild?.caregiverType || "biological");
  const [caregiverLabel, setCaregiverLabel] = useState(initialCaregiverLabel);
  const [customRelative, setCustomRelative] = useState(initialCustomRelative);
  const [verbalStatus, setVerbalStatus] = useState(activeChild?.verbalStatus || "");
  const [diagnosisSelected, setDiagnosisSelected] = useState(initialDiagnosis.selected);
  const [diagnosisOther, setDiagnosisOther] = useState(initialDiagnosis.other);
  const [hasTriggers, setHasTriggers] = useState(activeChild?.knownTriggers ? "Yes" : "No");
  const [triggersSelected, setTriggersSelected] = useState(initialTriggers.selected);
  const [triggersOther, setTriggersOther] = useState(initialTriggers.other);
  const [hasTherapy, setHasTherapy] = useState(activeChild?.therapySchedule ? "Yes" : "No");
  const [therapySessions, setTherapySessions] = useState(parseSessions(activeChild?.therapySchedule || ""));
  const [hasDiet, setHasDiet] = useState(activeChild?.dietProgram ? "Yes" : "No");
  const [dietSelected, setDietSelected] = useState(initialDiet.selected);
  const [dietOther, setDietOther] = useState(initialDiet.other);
  const [hasAllergies, setHasAllergies] = useState(activeChild?.allergies ? "Yes" : "No");
  const [allergiesSelected, setAllergiesSelected] = useState(initialAllergies.selected);
  const [allergiesOther, setAllergiesOther] = useState(initialAllergies.other);
  const [hasMedication, setHasMedication] = useState(activeChild?.medication ? "Yes" : "No");
  const [medicationDetail, setMedicationDetail] = useState(activeChild?.medication || "");
  const [hasClinic, setHasClinic] = useState((activeChild?.clinicName || activeChild?.location) ? "Yes" : "No");
  const [placementStartDate, setPlacementStartDate] = useState(activeChild?.placementStartDate || "");
  const [fosteringAgency, setFosteringAgency] = useState(activeChild?.fosteringAgency || "");
  const [placementType, setPlacementType] = useState(activeChild?.placementType || "");
  const [courtOrderRef, setCourtOrderRef] = useState(activeChild?.courtOrderRef || "");
  const [caseWorkerName, setCaseWorkerName] = useState(activeChild?.caseWorkerName || "");
  const [caseWorkerPhone, setCaseWorkerPhone] = useState(activeChild?.caseWorkerPhone || "");
  const [caseWorkerEmail, setCaseWorkerEmail] = useState(activeChild?.caseWorkerEmail || "");
  const [clinicName, setClinicName] = useState(activeChild?.clinicName || "");
  const [location, setLocation] = useState(activeChild?.location || "");
  const [countryOptions, setCountryOptions] = useState([]);
  const [err, setErr] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    supabase.from("countries").select("name").order("sort_order").then(({ data }) => {
      if (data) setCountryOptions(data.map(c => c.name));
    });
  }, []);

  if (!activeChild) return null;

  const save = async () => {
    const knownTriggers = joinMultiField(triggersSelected, triggersOther);
    const dietProgram = joinMultiField(dietSelected, dietOther);
    const allergies = joinMultiField(allergiesSelected, allergiesOther);
    const therapySchedule = joinSessions(therapySessions);

    const fe = {};
    if (!name.trim()) fe.name = "Please enter your child's name.";
    if (!dob) fe.dob = "Please enter your child's date of birth.";
    if (!gender) fe.gender = "Please select your child's gender.";
    if (caregiverType === "other" && !caregiverLabel.trim()) fe.relationshipDetail = "Please tell us your relationship to this child.";
    if (caregiverType === "other" && caregiverLabel === "Others" && !customRelative.trim()) fe.customRelative = "Please tell us your relationship to this child.";
    if (!verbalStatus) fe.verbalStatus = "Please select your child's verbal status.";
    if (hasTriggers === "Yes" && !knownTriggers.trim()) fe.knownTriggers = "Please select at least one trigger.";
    if (hasTherapy === "Yes" && !therapySchedule.trim()) fe.therapySchedule = "Please add at least one session.";
    if (hasDiet === "Yes" && !dietProgram.trim()) fe.dietProgram = "Please select at least one diet.";
    if (hasAllergies === "Yes" && !allergies.trim()) fe.allergies = "Please select at least one allergy.";
    if (hasMedication === "Yes" && !medicationDetail.trim()) fe.medication = "Please describe the medication.";
    setErrors(fe);
    if (Object.keys(fe).length > 0) return;
    setErr(""); setSaving(true);
    const finalCaregiverLabel = caregiverType === "other" ? (caregiverLabel === "Others" ? customRelative.trim() : caregiverLabel.trim()) : "";
    const patch = {
      name: name.trim(), dob, gender, caregiverType, caregiverLabel: finalCaregiverLabel,
      hasSpecialNeeds: true, verbalStatus,
      knownTriggers: hasTriggers === "Yes" ? knownTriggers : "",
      therapySchedule: hasTherapy === "Yes" ? therapySchedule : "",
      dietProgram: hasDiet === "Yes" ? dietProgram : "",
      allergies: hasAllergies === "Yes" ? allergies : "",
      medication: hasMedication === "Yes" ? medicationDetail.trim() : "",
      diagnosis: joinMultiField(diagnosisSelected, diagnosisOther),
      placementStartDate, fosteringAgency: fosteringAgency.trim(), placementType, courtOrderRef: courtOrderRef.trim(),
      caseWorkerName: caseWorkerName.trim(), caseWorkerPhone: caseWorkerPhone.trim(), caseWorkerEmail: caseWorkerEmail.trim(),
      clinicName: hasClinic === "Yes" ? clinicName.trim() : "", location: hasClinic === "Yes" ? location : "",
    };
    if (photo) {
      let emojiValue = photo;
      if (emojiValue.startsWith("data:")) {
        const url = await uploadPhoto(emojiValue, "children", userId);
        if (url) emojiValue = url;
      }
      patch.emoji = emojiValue;
    } else if (isExistingPhoto) {
      patch.emoji = "none";
    }
    updateChild(activeChild.id, patch);
    setSaving(false);
    // Loaded on demand — sweetalert2 is only needed for this one success
    // popup, so it's kept out of the main bundle until a save actually happens.
    const { default: Swal } = await import("sweetalert2");
    await Swal.fire({ icon: "success", title: "Profile saved successfully", confirmButtonColor: T.purple });
    onSaved && onSaved();
  };

  const handleDelete = async () => {
    setDeleting(true);
    const ok = await deleteChild(activeChild.id);
    setDeleting(false);
    if (ok) onDeleted && onDeleted();
  };

  return (
    <>
      {showHeader && (
        <>
          <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: T.ink }}>Edit Child Profile</h2>
          <p style={{ margin: "0 0 24px", color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Update {activeChild.name}'s details below.</p>
        </>
      )}

      <SectionLabel style={{ marginBottom: 10 }}>Profile Picture</SectionLabel>
      <PhotoPicker photo={photo} setPhoto={setPhoto} photoErr={photoErr} setPhotoErr={setPhotoErr}
        cameraSupported={camera.cameraSupported} openCamera={camera.openCamera} />
      <CameraPanel show={camera.showCamera} videoRef={camera.videoRef} cameraReady={camera.cameraReady} takePhoto={camera.takePhoto} stopCamera={camera.stopCamera} />

      <Input label={<>Child's name <span style={{ color: T.red }}>*</span></>} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aiden" />
      <FieldError>{errors.name}</FieldError>
      <Input label={<>Date of birth <span style={{ color: T.red }}>*</span></>} value={dob} onChange={e => setDob(e.target.value)} type="date" />
      <FieldError>{errors.dob}</FieldError>
      <Select label={<>Gender <span style={{ color: T.red }}>*</span></>} value={gender} onChange={e => setGender(e.target.value)} placeholder="Select gender" options={["Male", "Female", "Prefer not to say"]} />
      <FieldError>{errors.gender}</FieldError>

      <Select label="Your relationship to this child" value={caregiverType} onChange={e => setCaregiverType(e.target.value)} options={CAREGIVER_TYPE_OPTIONS} />

      {caregiverType === "other" && (
        <div style={{ marginBottom: 14 }}>
          <Select label={<>What is your relationship to this child? <span style={{ color: T.red }}>*</span></>} value={caregiverLabel} onChange={e => setCaregiverLabel(e.target.value)} placeholder="Select relationship" options={OTHER_CAREGIVER_OPTIONS} />
          <FieldError>{errors.relationshipDetail}</FieldError>
          {caregiverLabel === "Others" && (
            <div style={{ marginTop: 10 }}>
              <Input label={<>Please specify <span style={{ color: T.red }}>*</span></>} value={customRelative} onChange={e => setCustomRelative(e.target.value)} placeholder="e.g. Cousin" />
              <FieldError>{errors.customRelative}</FieldError>
            </div>
          )}
        </div>
      )}

      <FormSection title="About your child">
        <SpecialNeedsSection
          verbalStatus={verbalStatus} setVerbalStatus={setVerbalStatus}
          diagnosisSelected={diagnosisSelected} setDiagnosisSelected={setDiagnosisSelected} diagnosisOther={diagnosisOther} setDiagnosisOther={setDiagnosisOther}
          hasTriggers={hasTriggers} setHasTriggers={setHasTriggers} triggersSelected={triggersSelected} setTriggersSelected={setTriggersSelected} triggersOther={triggersOther} setTriggersOther={setTriggersOther}
          hasTherapy={hasTherapy} setHasTherapy={setHasTherapy} therapySessions={therapySessions} setTherapySessions={setTherapySessions}
          hasDiet={hasDiet} setHasDiet={setHasDiet} dietSelected={dietSelected} setDietSelected={setDietSelected} dietOther={dietOther} setDietOther={setDietOther}
          errors={errors}
        />
      </FormSection>

      <FormSection title="Medical information" defaultOpen={false}>
        <MedicalInfoSection
          hasAllergies={hasAllergies} setHasAllergies={setHasAllergies} allergiesSelected={allergiesSelected} setAllergiesSelected={setAllergiesSelected} allergiesOther={allergiesOther} setAllergiesOther={setAllergiesOther}
          hasMedication={hasMedication} setHasMedication={setHasMedication} medicationDetail={medicationDetail} setMedicationDetail={setMedicationDetail}
          errors={errors}
        />
      </FormSection>

      <FormSection title="Care & clinic" defaultOpen={false}>
        <CareClinicSection hasClinic={hasClinic} setHasClinic={setHasClinic} location={location} setLocation={setLocation} clinicName={clinicName} setClinicName={setClinicName} countryOptions={countryOptions} />
      </FormSection>

      <FormSection title="Foster & placement details" defaultOpen={false}>
        <PlacementDetailsSection placementStartDate={placementStartDate} setPlacementStartDate={setPlacementStartDate} fosteringAgency={fosteringAgency} setFosteringAgency={setFosteringAgency} placementType={placementType} setPlacementType={setPlacementType} courtOrderRef={courtOrderRef} setCourtOrderRef={setCourtOrderRef} caseWorkerName={caseWorkerName} setCaseWorkerName={setCaseWorkerName} caseWorkerPhone={caseWorkerPhone} setCaseWorkerPhone={setCaseWorkerPhone} caseWorkerEmail={caseWorkerEmail} setCaseWorkerEmail={setCaseWorkerEmail} />
      </FormSection>

      {err && <p style={{ color: T.red, fontSize: 13, fontWeight: 700, margin: "-8px 0 12px" }}>{err}</p>}
      <Btn onClick={save} full disabled={saving} style={{ marginBottom: 6 }}>{saving ? "Saving..." : "Save Changes"}</Btn>
      <p style={{ margin: "0 0 10px", fontSize: 11, color: T.inkMuted, textAlign: "center" }}><span style={{ color: T.red }}>*</span> required</p>
      {onCancel && <Btn onClick={onCancel} full secondary style={{ marginTop: 10 }}>Cancel</Btn>}

      <div style={{ height: 1, background: T.border, margin: "28px 0 20px" }} />

      <SectionLabel style={{ marginBottom: 10 }}>Danger Zone</SectionLabel>
      {activeChild.active ? (
        <Card style={{ background: T.purpleL }}>
          <p style={{ margin: 0, color: T.inkSoft, fontSize: 13, fontWeight: 600, lineHeight: 1.6 }}>{activeChild.name}'s profile is active and approved, so it can no longer be deleted from the app. Contact an admin if this profile needs to be removed.</p>
        </Card>
      ) : !confirmDelete ? (
        <Btn onClick={() => setConfirmDelete(true)} full danger>Delete {activeChild.name}'s Profile</Btn>
      ) : (
        <Card style={{ background: T.redL, border: `1px solid ${T.red}30` }}>
          <p style={{ margin: "0 0 12px", color: T.red, fontSize: 13, fontWeight: 700, lineHeight: 1.6 }}>This will permanently delete {activeChild.name}'s profile, schedule, and history. This cannot be undone.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={handleDelete} disabled={deleting} danger style={{ flex: 1 }}>{deleting ? "Deleting..." : "Yes, delete permanently"}</Btn>
            <Btn onClick={() => setConfirmDelete(false)} secondary style={{ flex: 1 }}>Cancel</Btn>
          </div>
        </Card>
      )}
    </>
  );
}

export function EditChildScreen({ childCtx, pop }) {
  if (!childCtx?.activeChild) return null;
  return (
    <Page>
      <ChildProfileForm childCtx={childCtx} onSaved={pop} onCancel={pop} onDeleted={pop} />
    </Page>
  );
}
