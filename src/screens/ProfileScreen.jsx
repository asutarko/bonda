import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { uploadPhoto } from "../hooks";
import { T } from "../theme";
import { Page, SectionLabel, Input, TextArea, Select, FieldError, Btn, ComAvatar } from "../ui";
import { RELATIONSHIP_OPTIONS, OCCUPATION_OPTIONS, MARITAL_STATUS_OPTIONS, PROFESSION_OPTIONS, PHONE_COUNTRIES, splitPhone } from "../data";

// Best-effort split of a legacy single-field name (entered before first/
// middle/last were separate fields) so this form has something to show —
// first word is the first name, last word the surname, anything between
// is the middle name.
const splitName = full => {
  const parts = (full || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", middleName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], middleName: "", lastName: "" };
  return { firstName: parts[0], middleName: parts.slice(1, -1).join(" "), lastName: parts[parts.length - 1] };
};

// One job in a professional's work history. Years are kept as strings so a
// half-typed value doesn't get coerced while editing.
// Months are stored as "1".."12" so the period reads e.g. "Mar 2018 – Present".
const emptyExperience = () => ({ position: "", workplace: "", startMonth: "", startYear: "", endMonth: "", endYear: "", current: false });
const isBlankExperience = x => !x.position.trim() && !x.workplace.trim() && !x.startMonth && !x.startYear.trim() && !x.endMonth && !x.endYear.trim() && !x.current;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_OPTIONS = MONTHS.map((m, i) => ({ value: String(i + 1), label: m }));
const formatPeriod = x => {
  const part = (m, y) => [MONTHS[+m - 1], y].filter(Boolean).join(" ");
  const start = part(x.startMonth, x.startYear);
  const end = x.current ? "Present" : part(x.endMonth, x.endYear);
  return start || end ? `${start || "?"} – ${end || "?"}` : "";
};

export function EditProfileScreen({ account, pop, push }) {
  const isProfessional = account?.accountType === "professional";
  const isExistingPhoto = !!(account?.avatar && (account.avatar.startsWith("data:") || account.avatar.startsWith("http")));
  const initialNameParts = splitName(account?.name || "");

  const [firstName, setFirstName] = useState(account?.firstName || initialNameParts.firstName);
  const [middleName, setMiddleName] = useState(account?.middleName || initialNameParts.middleName);
  const [lastName, setLastName] = useState(account?.lastName || initialNameParts.lastName);
  const [avatar, setAvatar] = useState(isExistingPhoto ? "none" : (account?.avatar || "none"));
  const [photo, setPhoto] = useState(isExistingPhoto ? account.avatar : null);
  const initialPhone = splitPhone(account?.phone);
  const [dial, setDial] = useState(initialPhone.dial);
  const [phone, setPhone] = useState(initialPhone.number);
  const [address, setAddress] = useState(account?.address || "");
  const [country, setCountry] = useState(account?.country || "Singapore");
  const [countryOptions, setCountryOptions] = useState([]);
  const [postalCode, setPostalCode] = useState(account?.postalCode || "");
  const [relationship, setRelationship] = useState(account?.relationship || "");
  const initialOccupation = account?.occupation && !OCCUPATION_OPTIONS.includes(account.occupation) ? "Other" : (account?.occupation || "");
  const initialCustomOccupation = account?.occupation && !OCCUPATION_OPTIONS.includes(account.occupation) ? account.occupation : "";
  const [occupation, setOccupation] = useState(initialOccupation);
  const [customOccupation, setCustomOccupation] = useState(initialCustomOccupation);
  const [nationality, setNationality] = useState(account?.nationality || "");
  const [maritalStatus, setMaritalStatus] = useState(account?.maritalStatus || "");
  const [gender, setGender] = useState(account?.gender || "");
  const [profession, setProfession] = useState(account?.profession || "");
  const [specialisation, setSpecialisation] = useState(account?.specialisation || "");
  const [practiceName, setPracticeName] = useState(account?.practiceName || "");
  const [practiceAddress, setPracticeAddress] = useState(account?.practiceAddress || "");
  const [workExperience, setWorkExperience] = useState(() =>
    (account?.workExperience || []).map(x => ({
      ...emptyExperience(), ...x,
      startMonth: String(x.startMonth || ""), startYear: String(x.startYear || ""),
      endMonth: String(x.endMonth || ""), endYear: String(x.endYear || ""), current: !!x.current,
    }))
  );
  const updateExperience = (i, patch) => setWorkExperience(list => list.map((x, j) => j === i ? { ...x, ...patch } : x));
  const removeExperience = i => setWorkExperience(list => list.filter((_, j) => j !== i));
  const addExperience = () => setWorkExperience(list => [...list, emptyExperience()]);
  const [nationalityOptions, setNationalityOptions] = useState([]);
  const [err, setErr] = useState("");
  const [errors, setErrors] = useState({});
  const [photoErr, setPhotoErr] = useState("");
  const [saving, setSaving] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { setCameraSupported(false); return; }
        const devices = await navigator.mediaDevices.enumerateDevices();
        setCameraSupported(devices.some(d => d.kind === "videoinput"));
      } catch { setCameraSupported(false); }
    };
    check();
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); };
  }, []);

  useEffect(() => {
    supabase.from("nationalities").select("name").order("sort_order").then(({ data }) => {
      if (data) setNationalityOptions(data.map(n => n.name));
    });
    supabase.from("countries").select("name").order("sort_order").then(({ data }) => {
      if (data) setCountryOptions(data.map(c => c.name));
    });
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
    } catch { setCameraSupported(false); }
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

  const isPhotoSelected = !!photo;

  const save = async () => {
    const fe = {};
    if (!firstName.trim()) fe.firstName = "Please enter your first name.";
    if (!lastName.trim()) fe.lastName = "Please enter your surname.";
    if (!phone.trim()) fe.phone = "Please enter your phone number.";
    else if (!/^\d+$/.test(phone.replace(/\s+/g, ""))) fe.phone = "Phone number must contain numbers only. Please use numbers.";
    if (!country) fe.country = "Please select your country.";
    if (!nationality) fe.nationality = "Please select your nationality.";
    const thisYear = new Date().getFullYear();
    const isYear = y => /^\d{4}$/.test(y) && +y >= 1950 && +y <= thisYear;
    if (isProfessional) {
      if (!profession) fe.profession = "Please select your profession.";
      if (!gender) fe.gender = "Please select your gender.";
      const expErrors = {};
      workExperience.forEach((x, i) => {
        if (isBlankExperience(x)) return;
        const start = x.startYear.trim(), end = x.endYear.trim();
        const now = thisYear * 12 + new Date().getMonth() + 1;
        const startKey = +start * 12 + +x.startMonth, endKey = +end * 12 + +x.endMonth;
        if (!x.position.trim()) expErrors[i] = "Please enter your job title.";
        else if (!x.workplace.trim()) expErrors[i] = "Please enter the clinic, hospital or organisation.";
        else if (!x.startMonth || !isYear(start)) expErrors[i] = `Please enter the start month and year (1950–${thisYear}).`;
        else if (startKey > now) expErrors[i] = "Start date can't be in the future.";
        else if (!x.current && (!x.endMonth || !isYear(end))) expErrors[i] = `Please enter the end month and year, or tick "I currently work here".`;
        else if (!x.current && endKey > now) expErrors[i] = "End date can't be in the future.";
        else if (!x.current && endKey < startKey) expErrors[i] = "End date can't be before the start date.";
      });
      if (Object.keys(expErrors).length) fe.experience = expErrors;
    } else {
      if (!address.trim()) fe.address = "Please enter your home address.";
      if (!postalCode.trim()) fe.postalCode = "Please enter your postal code.";
      if (!relationship) fe.relationship = "Please select your relationship to the child.";
      if (occupation === "Other" && !customOccupation.trim()) fe.customOccupation = "Please enter your occupation.";
    }
    setErrors(fe);
    if (Object.keys(fe).length > 0) return;
    setErr(""); setSaving(true);

    const finalOccupation = occupation === "Other" ? customOccupation.trim() : occupation;
    const fullName = [firstName, middleName, lastName].map(s => s.trim()).filter(Boolean).join(" ");
    const fullPhone = `${dial}${phone.replace(/\s+/g, "")}`;

    let avatarValue = photo || avatar;
    if (avatarValue && avatarValue.startsWith("data:")) {
      const url = await uploadPhoto(avatarValue, "parents", account.id);
      if (url) avatarValue = url;
    }

    const shared = { name: fullName, avatar: avatarValue, phone: fullPhone, country, nationality: nationality.trim() };
    const finalExperience = workExperience.filter(x => !isBlankExperience(x)).map(x => ({
      position: x.position.trim(), workplace: x.workplace.trim(),
      startMonth: x.startMonth, startYear: x.startYear.trim(),
      endMonth: x.current ? "" : x.endMonth, endYear: x.current ? "" : x.endYear.trim(), current: !!x.current,
    }));
    const practice = { profession, specialisation: specialisation.trim(), gender };
    const home = { address: address.trim(), relationship, occupation: finalOccupation };

    const { error } = await supabase.auth.updateUser({ data: {
      ...shared, firstName: firstName.trim(), middleName: middleName.trim(), lastName: lastName.trim(),
      ...(isProfessional
        ? { ...practice, practiceName: practiceName.trim(), practiceAddress: practiceAddress.trim(), workExperience: finalExperience }
        : { ...home, postalCode: postalCode.trim(), maritalStatus }),
    } });
    if (error) { setSaving(false); return setErr(error.message); }
    const { error: profileErr } = await supabase.from("profiles").update({
      ...shared, first_name: firstName.trim(), middle_name: middleName.trim(), last_name: lastName.trim(),
      ...(isProfessional
        ? { ...practice, practice_name: practiceName.trim(), practice_address: practiceAddress.trim(), work_experience: finalExperience }
        : { ...home, postal_code: postalCode.trim(), marital_status: maritalStatus }),
    }).eq("id", account.id);
    setSaving(false);
    if (profileErr) return setErr(profileErr.message);
    // Loaded on demand — sweetalert2 is only needed for this one success
    // popup, so it's kept out of the main bundle until a save actually happens.
    const { default: Swal } = await import("sweetalert2");
    await Swal.fire({ icon: "success", title: "Profile saved successfully", confirmButtonColor: T.purple });
    pop();
  };

  return (
    <Page>
      <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: T.ink }}>Edit User Profile</h2>
      <p style={{ margin: "0 0 24px", color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Update your photo and contact details below.</p>

      <SectionLabel style={{ marginBottom: 10 }}>Profile Picture</SectionLabel>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 16, padding: "24px 18px", background: T.purpleL, border: `1px solid ${T.border}`, borderRadius: T.rL }}>
        <ComAvatar value={photo || avatar} size={88} active borderColor={T.purple} />

        <div style={{ display: "flex", gap: 8, marginTop: 14, position: "relative" }}>
          <button
            onClick={() => cameraSupported ? setPhotoMenuOpen(v => !v) : fileInputRef.current?.click()}
            style={{ background: T.purple, color: "white", borderRadius: 99, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", textAlign: "center", fontFamily: T.fontBody, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
          >
            <span style={{ fontSize: 15 }}>+</span> Upload photo
          </button>

          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) return setPhotoErr("Photo must be under 2 MB.");
            const reader = new FileReader();
            reader.onload = ev => { setPhoto(ev.target.result); setPhotoErr(""); };
            reader.readAsDataURL(file);
          }} />

          {isPhotoSelected && (
            <button onClick={() => setPhoto(null)} style={{ background: "transparent", color: T.red, borderRadius: 99, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: T.fontBody }}>Remove photo</button>
          )}

          {photoMenuOpen && (
            <>
              <div onClick={() => setPhotoMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 9 }} />
              <div style={{ position: "absolute", top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", zIndex: 10, background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.r, boxShadow: "0 8px 24px rgba(35,32,28,0.14)", overflow: "hidden", minWidth: 180 }}>
                <button onClick={() => { setPhotoMenuOpen(false); openCamera(); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", background: "none", border: "none", padding: "10px 14px", fontSize: 13, fontWeight: 600, color: T.ink, cursor: "pointer", fontFamily: T.fontBody, textAlign: "left" }}>
                  📷 Take Photo
                </button>
                <button onClick={() => { setPhotoMenuOpen(false); fileInputRef.current?.click(); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", background: "none", border: "none", borderTop: `1px solid ${T.border}`, padding: "10px 14px", fontSize: 13, fontWeight: 600, color: T.ink, cursor: "pointer", fontFamily: T.fontBody, textAlign: "left" }}>
                  🖼️ Choose from Gallery
                </button>
              </div>
            </>
          )}
        </div>

        <p style={{ margin: "12px 0 0", fontSize: 12, fontWeight: 700, color: T.inkSoft }}>
          {isPhotoSelected ? "Photo added ✓" : "Add a real photo (optional)"}
        </p>
        {photoErr && <p style={{ margin: "6px 0 0", color: T.red, fontSize: 11, fontWeight: 700 }}>{photoErr}</p>}
      </div>

      {showCamera && (
        <div style={{ marginBottom: 16, background: "#000", borderRadius: T.r, overflow: "hidden" }}>
          <video ref={videoRef} style={{ width: "100%", display: "block", aspectRatio: "4/3", objectFit: "cover" }} muted playsInline />
          <div style={{ display: "flex", gap: 8, padding: "10px 12px", background: "#111" }}>
            <Btn onClick={takePhoto} disabled={!cameraReady} style={{ flex: 1, background: cameraReady ? T.green : T.border }}>📸 Take Photo</Btn>
            <Btn onClick={stopCamera} secondary style={{ flex: 1 }}>Cancel</Btn>
          </div>
        </div>
      )}

      <SectionLabel style={{ marginBottom: 10 }}>Your Name</SectionLabel>
      <Input label="First name" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="e.g. Sarah" />
      <FieldError>{errors.firstName}</FieldError>
      <Input label="Middle name" value={middleName} onChange={e => setMiddleName(e.target.value)} placeholder="Optional" />
      <Input label="Surname" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="e.g. Tan" />
      <FieldError>{errors.lastName}</FieldError>
      {isProfessional && (
        <>
          <Select label="Gender" placeholder="Select gender" value={gender} onChange={e => setGender(e.target.value)} options={["Male", "Female", "Prefer not to say"]} />
          <FieldError>{errors.gender}</FieldError>
        </>
      )}

      <SectionLabel style={{ marginBottom: 10 }}>Contact Details</SectionLabel>
      <Input label="Email address" type="email" value={account?.email || ""} disabled style={{ background: T.border, cursor: "not-allowed", color: T.inkSoft }} />
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: "0 0 118px" }}>
          <Select label="Country" value={dial} onChange={e => setDial(e.target.value)} options={PHONE_COUNTRIES.map(c => ({ value: c.dial, label: `${c.iso} ${c.dial}` }))} />
        </div>
        <div style={{ flex: 1 }}>
          <Input label="Phone number" type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9123 4567" />
        </div>
      </div>
      <FieldError>{errors.phone}</FieldError>
      {isProfessional ? (
        <>
          <Select label="Country" placeholder="Select country" value={country} onChange={e => setCountry(e.target.value)} options={countryOptions} />
          <FieldError>{errors.country}</FieldError>

          <SectionLabel style={{ marginBottom: 10 }}>Professional Details</SectionLabel>
          <Select label="Profession" placeholder="Select profession" value={profession} onChange={e => setProfession(e.target.value)} options={PROFESSION_OPTIONS} />
          <FieldError>{errors.profession}</FieldError>
          <Input label="Specialisation" value={specialisation} onChange={e => setSpecialisation(e.target.value)} placeholder="e.g. Speech therapy" />
          <Input label="Clinic or practice name (optional)" value={practiceName} onChange={e => setPracticeName(e.target.value)} placeholder="e.g. Bright Minds Clinic" />
          <TextArea label="Clinic or practice address (optional)" rows={3} value={practiceAddress} onChange={e => setPracticeAddress(e.target.value)} placeholder="e.g. 10 Sinaran Drive, #08-12" />

          <SectionLabel style={{ marginBottom: 10 }}>Work Experience (optional)</SectionLabel>
          {workExperience.length === 0 && (
            <p style={{ margin: "0 0 12px", color: T.inkSoft, fontSize: 13, lineHeight: 1.6 }}>Add the clinics, hospitals or organisations you've worked at. You can add more than one.</p>
          )}
          {workExperience.map((x, i) => (
            <div key={i} style={{ marginBottom: 12, padding: "14px 14px 2px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.r }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: T.ink }}>Experience {i + 1}</p>
                  {formatPeriod(x) && <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 600, color: T.inkSoft }}>{formatPeriod(x)}</p>}
                </div>
                <button onClick={() => removeExperience(i)} style={{ background: "none", border: "none", color: T.red, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody, padding: 0 }}>Remove</button>
              </div>
              <Input label="Job title" value={x.position} onChange={e => updateExperience(i, { position: e.target.value })} placeholder="e.g. Senior Clinical Psychologist" />
              <Input label="Clinic, hospital or organisation" value={x.workplace} onChange={e => updateExperience(i, { workplace: e.target.value })} placeholder="e.g. KK Women's and Children's Hospital" />
              <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: T.inkSoft }}>Period</p>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <Select label="Start month" placeholder="Month" value={x.startMonth} onChange={e => updateExperience(i, { startMonth: e.target.value })} options={MONTH_OPTIONS} />
                </div>
                <div style={{ flex: 1 }}>
                  <Input label="Start year" inputMode="numeric" maxLength={4} value={x.startYear} onChange={e => updateExperience(i, { startYear: e.target.value.replace(/\D/g, "") })} placeholder="e.g. 2018" />
                </div>
              </div>
              {!x.current && (
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <Select label="End month" placeholder="Month" value={x.endMonth} onChange={e => updateExperience(i, { endMonth: e.target.value })} options={MONTH_OPTIONS} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Input label="End year" inputMode="numeric" maxLength={4} value={x.endYear} onChange={e => updateExperience(i, { endYear: e.target.value.replace(/\D/g, "") })} placeholder="e.g. 2022" />
                  </div>
                </div>
              )}
              <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "-4px 0 14px", fontSize: 13, fontWeight: 600, color: T.inkSoft, cursor: "pointer" }}>
                <input type="checkbox" checked={x.current} onChange={e => updateExperience(i, { current: e.target.checked })} style={{ width: 16, height: 16, accentColor: T.purple }} />
                I currently work here
              </label>
              <FieldError>{errors.experience?.[i]}</FieldError>
            </div>
          ))}
          <Btn onClick={addExperience} full ghost style={{ marginBottom: 18 }}>+ Add work experience</Btn>
        </>
      ) : (
        <>
          <TextArea label="Home address" rows={3} value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. Blk 123 Ang Mo Kio Ave 3, #04-56" />
          <FieldError>{errors.address}</FieldError>
          <Select label="Country" placeholder="Select country" value={country} onChange={e => setCountry(e.target.value)} options={countryOptions} />
          <FieldError>{errors.country}</FieldError>
          <Input label="Postal code" inputMode="numeric" autoComplete="postal-code" value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="e.g. 560123" />
          <FieldError>{errors.postalCode}</FieldError>

          <Select label="Relationship to the child" value={relationship} onChange={e => setRelationship(e.target.value)} placeholder="Select relationship" options={RELATIONSHIP_OPTIONS} />
          <FieldError>{errors.relationship}</FieldError>
        </>
      )}

      <SectionLabel style={{ marginBottom: 10 }}>More About You</SectionLabel>

      {!isProfessional && (
        <>
          <Select label="Occupation" value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="Select occupation" options={OCCUPATION_OPTIONS} />
          {occupation === "Other" && (
            <div style={{ marginTop: -6 }}>
              <Input value={customOccupation} onChange={e => setCustomOccupation(e.target.value)} placeholder="Enter your occupation" />
              <FieldError>{errors.customOccupation}</FieldError>
            </div>
          )}
          <Select label="Marital Status" value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)} placeholder="Select marital status" options={MARITAL_STATUS_OPTIONS} />
        </>
      )}
      <Select label="Nationality" placeholder="Select nationality" value={nationality} onChange={e => setNationality(e.target.value)} options={nationalityOptions} />
      <FieldError>{errors.nationality}</FieldError>

      {err && <p style={{ color: T.red, fontSize: 13, fontWeight: 700, margin: "-8px 0 12px" }}>{err}</p>}
      <Btn onClick={save} full disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Btn>
      <Btn onClick={pop} full secondary style={{ marginTop: 10 }}>Cancel</Btn>
    </Page>
  );
}
