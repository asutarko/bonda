import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabase";
import { uploadPhoto } from "../hooks";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge, Btn, Input, TextArea, Select, FieldError, Avatar, Accordion, PageHero, AvatarIllustrations, ChildAvatar, ComAvatar, ROOM_ICONS, ACTIVITY_TEXTAREA_STYLE, ActionIllustration, HeroIllustration } from "../ui";
import { CHILD_AVATARS, DEFAULT_CHILDREN, DEFAULT_SCHEDULE, ROOM_COLORS, SOS_COLORS, VERBAL_STATUS_OPTIONS } from "../data";

export function SpecialNeedsSection({
  verbalStatus, setVerbalStatus,
  hasTriggers, setHasTriggers, knownTriggers, setKnownTriggers,
  hasTherapy, setHasTherapy, therapySchedule, setTherapySchedule,
  hasDiet, setHasDiet, dietProgram, setDietProgram,
  errors = {},
}) {
  return (
    <>
      <Select label="Verbal status" value={verbalStatus} onChange={e => setVerbalStatus(e.target.value)} placeholder="Select verbal status" options={VERBAL_STATUS_OPTIONS.map(o => ({ value: o.key, label: o.label }))} />
      <FieldError>{errors.verbalStatus}</FieldError>

      <Select label="Known triggers?" value={hasTriggers} onChange={e => { setHasTriggers(e.target.value); if (e.target.value === "No") setKnownTriggers(""); }} options={["Yes", "No"]} />
      {hasTriggers === "Yes" && (
        <>
          <TextArea label="Describe the known triggers" hint="Describe in your own words — e.g. loud noises, crowded places, sudden changes in routine." value={knownTriggers} onChange={e => setKnownTriggers(e.target.value)} placeholder="e.g. Loud noises, being rushed, scratchy clothing tags" />
          <FieldError>{errors.knownTriggers}</FieldError>
        </>
      )}

      <Select label="Therapy schedule?" value={hasTherapy} onChange={e => { setHasTherapy(e.target.value); if (e.target.value === "No") setTherapySchedule(""); }} options={["Yes", "No"]} />
      {hasTherapy === "Yes" && (
        <>
          <TextArea label="Describe the therapy schedule" hint="e.g. which therapies, and which days/times." value={therapySchedule} onChange={e => setTherapySchedule(e.target.value)} placeholder="e.g. Speech therapy Tue 4pm, ABA Mon/Wed/Fri 3-5pm" />
          <FieldError>{errors.therapySchedule}</FieldError>
        </>
      )}

      <Select label="Diet program?" value={hasDiet} onChange={e => { setHasDiet(e.target.value); if (e.target.value === "No") setDietProgram(""); }} options={["Yes", "No"]} />
      {hasDiet === "Yes" && (
        <>
          <TextArea label="Describe the diet program" hint="e.g. any special diet, allergy, or feeding program." value={dietProgram} onChange={e => setDietProgram(e.target.value)} placeholder="e.g. Gluten-free, casein-free (GFCF)" />
          <FieldError>{errors.dietProgram}</FieldError>
        </>
      )}
    </>
  );
}

export function AddChildScreen({ childCtx, pop }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("none");
  const [photo, setPhoto] = useState(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [caregiverType, setCaregiverType] = useState("biological");
  const [caregiverLabel, setCaregiverLabel] = useState("");
  const [customRelative, setCustomRelative] = useState("");
  const [verbalStatus, setVerbalStatus] = useState("");
  const [hasTriggers, setHasTriggers] = useState("No");
  const [knownTriggers, setKnownTriggers] = useState("");
  const [hasTherapy, setHasTherapy] = useState("No");
  const [therapySchedule, setTherapySchedule] = useState("");
  const [hasDiet, setHasDiet] = useState("No");
  const [dietProgram, setDietProgram] = useState("");
  const [err, setErr] = useState("");
  const [errors, setErrors] = useState({});
  const [photoErr, setPhotoErr] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraErr, setCameraErr] = useState("");
  const [cameraSupported, setCameraSupported] = useState(true);
  const { addChild } = childCtx;

  // Silently check camera availability on mount — hide button if not supported
  useEffect(() => {
    const check = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraSupported(false); return;
        }
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(d => d.kind === "videoinput");
        setCameraSupported(hasCamera);
      } catch { setCameraSupported(false); }
    };
    check();
  }, []);

  const openCamera = async () => {
    setCameraErr("");
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
      // Don't show error — just hide the button
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

  const [saving, setSaving] = useState(false);

  const save = async () => {
    const fe = {};
    if (!name.trim()) fe.name = "Please enter your child's name.";
    if (!dob) fe.dob = "Please enter your child's date of birth.";
    if (!gender) fe.gender = "Please select your child's gender.";
    if (caregiverType === "other" && !caregiverLabel.trim()) fe.relationshipDetail = "Please tell us your relationship to this child.";
    if (caregiverType === "other" && caregiverLabel === "Others" && !customRelative.trim()) fe.customRelative = "Please tell us your relationship to this child.";
    if (!verbalStatus) fe.verbalStatus = "Please select your child's verbal status.";
    if (hasTriggers === "Yes" && !knownTriggers.trim()) fe.knownTriggers = "Please describe the known triggers.";
    if (hasTherapy === "Yes" && !therapySchedule.trim()) fe.therapySchedule = "Please describe the therapy schedule.";
    if (hasDiet === "Yes" && !dietProgram.trim()) fe.dietProgram = "Please describe the diet program.";
    setErrors(fe);
    if (Object.keys(fe).length > 0) return;
    setErr(""); setSaving(true);
    const finalCaregiverLabel = caregiverType === "other" ? (caregiverLabel === "Others" ? customRelative.trim() : caregiverLabel.trim()) : "";
    const id = await addChild({ name: name.trim(), emoji: photo || emoji, dob, gender, caregiverType, caregiverLabel: finalCaregiverLabel, hasSpecialNeeds: true, verbalStatus, knownTriggers: hasTriggers === "Yes" ? knownTriggers.trim() : "", therapySchedule: hasTherapy === "Yes" ? therapySchedule.trim() : "", dietProgram: hasDiet === "Yes" ? dietProgram.trim() : "" });
    setSaving(false);
    if (!id) return setErr("Could not save the profile. Please try again.");
    await Swal.fire({ icon: "success", title: "Data berhasil disimpan", confirmButtonColor: T.purple });
    pop();
  };

  const isPhotoSelected = photo && photo.startsWith("data:");

  return (
    <Page>
      <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: T.ink }}>Add a Child Profile</h2>
      <p style={{ margin: "0 0 24px", color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Each child gets their own schedule, emotion log, and history. You can switch between children anytime.</p>

      <SectionLabel style={{ marginBottom: 10 }}>Profile Picture</SectionLabel>


      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, padding: "14px 16px", background: T.purpleL, borderRadius: T.r }}>

        <ChildAvatar value={photo || emoji} size={60} active={true} borderColor={T.purple} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: T.inkSoft }}>
            {isPhotoSelected ? "Photo added ✓ — or choose an avatar below" : "Add a real photo (optional) — or pick an avatar below"}
          </p>
          <div style={{ display: "flex", gap: 8 }}>

            <label onClick={() => setShowAvatarPicker(false)} style={{ flex: 1, background: T.purple, color: "white", borderRadius: T.r, padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "center", fontFamily: T.fontBody, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
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
              <button onClick={() => { setShowAvatarPicker(false); openCamera(); }} style={{ flex: 1, background: T.surface, color: T.purple, borderRadius: T.r, padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${T.purple}`, fontFamily: T.fontBody, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                <span style={{ fontSize: 15 }}>+</span> Camera
              </button>
            )}

            <button onClick={() => setShowAvatarPicker(v => !v)} style={{ flex: 1, background: showAvatarPicker ? T.purple : T.surface, color: showAvatarPicker ? "white" : T.purple, borderRadius: T.r, padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${T.purple}`, fontFamily: T.fontBody, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <span style={{ fontSize: 15 }}>+</span> Avatar
            </button>

            {isPhotoSelected && (
              <button onClick={() => { setPhoto(null); }} style={{ background: T.redL, color: T.red, borderRadius: T.r, padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: T.fontBody }}>✕</button>
            )}
          </div>
          {photoErr && <p style={{ margin: "6px 0 0", color: T.red, fontSize: 11, fontWeight: 700 }}>{photoErr}</p>}

        </div>
      </div>


      {showCamera && (
        <div style={{ marginBottom: 16, background: "#000", borderRadius: T.r, overflow: "hidden" }}>
          <video ref={videoRef} style={{ width: "100%", display: "block", aspectRatio: "4/3", objectFit: "cover" }} muted playsInline />
          <div style={{ display: "flex", gap: 8, padding: "10px 12px", background: "#111" }}>
            <Btn onClick={takePhoto} disabled={!cameraReady} style={{ flex: 1, background: cameraReady ? T.green : T.border }}>
              📸 Take Photo
            </Btn>
            <Btn onClick={stopCamera} secondary style={{ flex: 1 }}>Cancel</Btn>
          </div>
        </div>
      )}

      {showAvatarPicker && (
        <>
          <SectionLabel style={{ marginBottom: 10 }}>Or choose an illustrated avatar</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24, opacity: isPhotoSelected ? 0.4 : 1, transition: "opacity 0.2s" }}>
            {AvatarIllustrations.map(av => {
              const isActive = !isPhotoSelected && emoji === av.key;
              return (
                <div key={av.key} onClick={() => { if (!isPhotoSelected) { setEmoji(av.key); } }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: isPhotoSelected ? "default" : "pointer" }}>
                  <div style={{ border: `2.5px solid ${isActive ? T.purple : "transparent"}`, borderRadius: "50%", padding: 1, transform: isActive ? "scale(1.08)" : "scale(1)", transition: "all 0.15s" }}>
                    {av.render(isActive)}
                  </div>
                  <p style={{ margin: 0, fontSize: 9, fontWeight: isActive ? 800 : 600, color: isActive ? T.purple : T.inkMuted, letterSpacing: "0.03em" }}>{av.label}</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      <Input label="Child's name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aiden" />
      <FieldError>{errors.name}</FieldError>
      <Input label="Date of birth" value={dob} onChange={e => setDob(e.target.value)} type="date" />
      <FieldError>{errors.dob}</FieldError>
      <Select label="Gender" value={gender} onChange={e => setGender(e.target.value)} placeholder="Select gender" options={["Male", "Female"]} />
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

      <SpecialNeedsSection verbalStatus={verbalStatus} setVerbalStatus={setVerbalStatus} hasTriggers={hasTriggers} setHasTriggers={setHasTriggers} knownTriggers={knownTriggers} setKnownTriggers={setKnownTriggers} hasTherapy={hasTherapy} setHasTherapy={setHasTherapy} therapySchedule={therapySchedule} setTherapySchedule={setTherapySchedule} hasDiet={hasDiet} setHasDiet={setHasDiet} dietProgram={dietProgram} setDietProgram={setDietProgram} errors={errors} />

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

  const [name, setName] = useState(activeChild?.name || "");
  const [emoji, setEmoji] = useState(isExistingPhoto ? "none" : (activeChild?.emoji || "none"));
  const [photo, setPhoto] = useState(isExistingPhoto ? activeChild.emoji : null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [dob, setDob] = useState(activeChild?.dob || "");
  const [gender, setGender] = useState(activeChild?.gender || "");
  const [caregiverType, setCaregiverType] = useState(activeChild?.caregiverType || "biological");
  const [caregiverLabel, setCaregiverLabel] = useState(initialCaregiverLabel);
  const [customRelative, setCustomRelative] = useState(initialCustomRelative);
  const [verbalStatus, setVerbalStatus] = useState(activeChild?.verbalStatus || "");
  const [hasTriggers, setHasTriggers] = useState(activeChild?.knownTriggers ? "Yes" : "No");
  const [knownTriggers, setKnownTriggers] = useState(activeChild?.knownTriggers || "");
  const [hasTherapy, setHasTherapy] = useState(activeChild?.therapySchedule ? "Yes" : "No");
  const [therapySchedule, setTherapySchedule] = useState(activeChild?.therapySchedule || "");
  const [hasDiet, setHasDiet] = useState(activeChild?.dietProgram ? "Yes" : "No");
  const [dietProgram, setDietProgram] = useState(activeChild?.dietProgram || "");
  const [err, setErr] = useState("");
  const [errors, setErrors] = useState({});
  const [photoErr, setPhotoErr] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Silently check camera availability on mount — hide button if not supported
  useEffect(() => {
    const check = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraSupported(false); return;
        }
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(d => d.kind === "videoinput");
        setCameraSupported(hasCamera);
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
      // Don't show error — just hide the button
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

  if (!activeChild) return null;

  const save = async () => {
    const fe = {};
    if (!name.trim()) fe.name = "Please enter your child's name.";
    if (!dob) fe.dob = "Please enter your child's date of birth.";
    if (!gender) fe.gender = "Please select your child's gender.";
    if (caregiverType === "other" && !caregiverLabel.trim()) fe.relationshipDetail = "Please tell us your relationship to this child.";
    if (caregiverType === "other" && caregiverLabel === "Others" && !customRelative.trim()) fe.customRelative = "Please tell us your relationship to this child.";
    if (!verbalStatus) fe.verbalStatus = "Please select your child's verbal status.";
    if (hasTriggers === "Yes" && !knownTriggers.trim()) fe.knownTriggers = "Please describe the known triggers.";
    if (hasTherapy === "Yes" && !therapySchedule.trim()) fe.therapySchedule = "Please describe the therapy schedule.";
    if (hasDiet === "Yes" && !dietProgram.trim()) fe.dietProgram = "Please describe the diet program.";
    setErrors(fe);
    if (Object.keys(fe).length > 0) return;
    setErr(""); setSaving(true);
    const finalCaregiverLabel = caregiverType === "other" ? (caregiverLabel === "Others" ? customRelative.trim() : caregiverLabel.trim()) : "";
    let emojiValue = photo || emoji;
    if (emojiValue && emojiValue.startsWith("data:")) {
      const url = await uploadPhoto(emojiValue, "children", userId);
      if (url) emojiValue = url;
    }
    updateChild(activeChild.id, { name: name.trim(), emoji: emojiValue, dob, gender, caregiverType, caregiverLabel: finalCaregiverLabel, hasSpecialNeeds: true, verbalStatus, knownTriggers: hasTriggers === "Yes" ? knownTriggers.trim() : "", therapySchedule: hasTherapy === "Yes" ? therapySchedule.trim() : "", dietProgram: hasDiet === "Yes" ? dietProgram.trim() : "" });
    setSaving(false);
    await Swal.fire({ icon: "success", title: "Data berhasil disimpan", confirmButtonColor: T.purple });
    onSaved && onSaved();
  };

  const handleDelete = async () => {
    setDeleting(true);
    const ok = await deleteChild(activeChild.id);
    setDeleting(false);
    if (ok) onDeleted && onDeleted();
  };

  const isPhotoSelected = !!photo;

  return (
    <>
      {showHeader && (
        <>
          <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: T.ink }}>Edit Child Profile</h2>
          <p style={{ margin: "0 0 24px", color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Update {activeChild.name}'s details below.</p>
        </>
      )}

      <SectionLabel style={{ marginBottom: 10 }}>Profile Picture</SectionLabel>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, padding: "14px 16px", background: T.purpleL, borderRadius: T.r }}>

        <ChildAvatar value={photo || emoji} size={60} active={true} borderColor={T.purple} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: T.inkSoft }}>
            {isPhotoSelected ? "Photo added ✓ — or choose an avatar below" : "Add a real photo (optional) — or pick an avatar below"}
          </p>
          <div style={{ display: "flex", gap: 8 }}>

            <label onClick={() => setShowAvatarPicker(false)} style={{ flex: 1, background: T.purple, color: "white", borderRadius: T.r, padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "center", fontFamily: T.fontBody, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
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
              <button onClick={() => { setShowAvatarPicker(false); openCamera(); }} style={{ flex: 1, background: T.surface, color: T.purple, borderRadius: T.r, padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${T.purple}`, fontFamily: T.fontBody, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                <span style={{ fontSize: 15 }}>+</span> Camera
              </button>
            )}

            <button onClick={() => setShowAvatarPicker(v => !v)} style={{ flex: 1, background: showAvatarPicker ? T.purple : T.surface, color: showAvatarPicker ? "white" : T.purple, borderRadius: T.r, padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${T.purple}`, fontFamily: T.fontBody, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <span style={{ fontSize: 15 }}>+</span> Avatar
            </button>

            {isPhotoSelected && (
              <button onClick={() => { setPhoto(null); }} style={{ background: T.redL, color: T.red, borderRadius: T.r, padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: T.fontBody }}>✕</button>
            )}
          </div>
          {photoErr && <p style={{ margin: "6px 0 0", color: T.red, fontSize: 11, fontWeight: 700 }}>{photoErr}</p>}

        </div>
      </div>

      {showCamera && (
        <div style={{ marginBottom: 16, background: "#000", borderRadius: T.r, overflow: "hidden" }}>
          <video ref={videoRef} style={{ width: "100%", display: "block", aspectRatio: "4/3", objectFit: "cover" }} muted playsInline />
          <div style={{ display: "flex", gap: 8, padding: "10px 12px", background: "#111" }}>
            <Btn onClick={takePhoto} disabled={!cameraReady} style={{ flex: 1, background: cameraReady ? T.green : T.border }}>
              📸 Take Photo
            </Btn>
            <Btn onClick={stopCamera} secondary style={{ flex: 1 }}>Cancel</Btn>
          </div>
        </div>
      )}

      {showAvatarPicker && (
        <>
          <SectionLabel style={{ marginBottom: 10 }}>Or choose an illustrated avatar</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24, opacity: isPhotoSelected ? 0.4 : 1, transition: "opacity 0.2s" }}>
            {AvatarIllustrations.map(av => {
              const isActive = !isPhotoSelected && emoji === av.key;
              return (
                <div key={av.key} onClick={() => { if (!isPhotoSelected) { setEmoji(av.key); } }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: isPhotoSelected ? "default" : "pointer" }}>
                  <div style={{ border: `2.5px solid ${isActive ? T.purple : "transparent"}`, borderRadius: "50%", padding: 1, transform: isActive ? "scale(1.08)" : "scale(1)", transition: "all 0.15s" }}>
                    {av.render(isActive)}
                  </div>
                  <p style={{ margin: 0, fontSize: 9, fontWeight: isActive ? 800 : 600, color: isActive ? T.purple : T.inkMuted, letterSpacing: "0.03em" }}>{av.label}</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      <Input label="Child's name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aiden" />
      <FieldError>{errors.name}</FieldError>
      <Input label="Date of birth" value={dob} onChange={e => setDob(e.target.value)} type="date" />
      <FieldError>{errors.dob}</FieldError>
      <Select label="Gender" value={gender} onChange={e => setGender(e.target.value)} placeholder="Select gender" options={["Male", "Female"]} />
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

      <SpecialNeedsSection verbalStatus={verbalStatus} setVerbalStatus={setVerbalStatus} hasTriggers={hasTriggers} setHasTriggers={setHasTriggers} knownTriggers={knownTriggers} setKnownTriggers={setKnownTriggers} hasTherapy={hasTherapy} setHasTherapy={setHasTherapy} therapySchedule={therapySchedule} setTherapySchedule={setTherapySchedule} hasDiet={hasDiet} setHasDiet={setHasDiet} dietProgram={dietProgram} setDietProgram={setDietProgram} errors={errors} />

      {err && <p style={{ color: T.red, fontSize: 13, fontWeight: 700, margin: "-8px 0 12px" }}>{err}</p>}
      <Btn onClick={save} full disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Btn>
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
