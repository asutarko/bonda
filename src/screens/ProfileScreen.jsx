import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { uploadPhoto } from "../hooks";
import { T } from "../theme";
import { Page, SectionLabel, Input, Select, FieldError, Btn, ComAvatar } from "../ui";
import { RELATIONSHIP_OPTIONS, OCCUPATION_OPTIONS, MARITAL_STATUS_OPTIONS } from "../data";

export function EditProfileScreen({ account, pop, push }) {
  const isExistingPhoto = !!(account?.avatar && (account.avatar.startsWith("data:") || account.avatar.startsWith("http")));

  const [avatar, setAvatar] = useState(isExistingPhoto ? "none" : (account?.avatar || "none"));
  const [photo, setPhoto] = useState(isExistingPhoto ? account.avatar : null);
  const [phone, setPhone] = useState(account?.phone || "");
  const [address, setAddress] = useState(account?.address || "");
  const [relationship, setRelationship] = useState(account?.relationship || "");
  const initialOccupation = account?.occupation && !OCCUPATION_OPTIONS.includes(account.occupation) ? "Other" : (account?.occupation || "");
  const initialCustomOccupation = account?.occupation && !OCCUPATION_OPTIONS.includes(account.occupation) ? account.occupation : "";
  const [occupation, setOccupation] = useState(initialOccupation);
  const [customOccupation, setCustomOccupation] = useState(initialCustomOccupation);
  const [nationality, setNationality] = useState(account?.nationality || "");
  const [maritalStatus, setMaritalStatus] = useState(account?.maritalStatus || "");
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
    if (!phone.trim()) fe.phone = "Please enter your phone number.";
    if (!address.trim()) fe.address = "Please enter your home address.";
    if (!relationship) fe.relationship = "Please select your relationship to the child.";
    if (occupation === "Other" && !customOccupation.trim()) fe.customOccupation = "Please enter your occupation.";
    if (!nationality) fe.nationality = "Please select your nationality.";
    setErrors(fe);
    if (Object.keys(fe).length > 0) return;
    setErr(""); setSaving(true);

    const finalOccupation = occupation === "Other" ? customOccupation.trim() : occupation;

    let avatarValue = photo || avatar;
    if (avatarValue && avatarValue.startsWith("data:")) {
      const url = await uploadPhoto(avatarValue, "parents", account.id);
      if (url) avatarValue = url;
    }

    const { error } = await supabase.auth.updateUser({ data: { avatar: avatarValue, phone: phone.trim(), address: address.trim(), relationship, occupation: finalOccupation, nationality: nationality.trim(), maritalStatus } });
    if (error) { setSaving(false); return setErr(error.message); }
    await supabase.from("profiles").update({ avatar: avatarValue, phone: phone.trim(), address: address.trim(), relationship, occupation: finalOccupation, nationality: nationality.trim(), marital_status: maritalStatus }).eq("id", account.id);
    setSaving(false);
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
          {isPhotoSelected ? "Photo added ✓ — or choose an avatar below" : "Add a real photo (optional) — or pick an avatar below"}
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

      <SectionLabel style={{ marginBottom: 10 }}>Contact Details</SectionLabel>
      <Input label="Email address" type="email" value={account?.email || ""} disabled style={{ background: T.border, cursor: "not-allowed", color: T.inkSoft }} />
      <Input label="Phone number" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9123 4567" />
      <FieldError>{errors.phone}</FieldError>
      <Input label="Home address" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. Blk 123 Ang Mo Kio Ave 3, #04-56" />
      <FieldError>{errors.address}</FieldError>

      <Select label="Relationship to the child" value={relationship} onChange={e => setRelationship(e.target.value)} placeholder="Select relationship" options={RELATIONSHIP_OPTIONS} />
      <FieldError>{errors.relationship}</FieldError>

      <SectionLabel style={{ marginBottom: 10 }}>More About You</SectionLabel>

      <Select label="Occupation" value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="Select occupation" options={OCCUPATION_OPTIONS} />
      {occupation === "Other" && (
        <div style={{ marginTop: -6 }}>
          <Input value={customOccupation} onChange={e => setCustomOccupation(e.target.value)} placeholder="Enter your occupation" />
          <FieldError>{errors.customOccupation}</FieldError>
        </div>
      )}
      <Select label="Marital Status" value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)} placeholder="Select marital status" options={MARITAL_STATUS_OPTIONS} />
      <Select label="Nationality" placeholder="Select nationality" value={nationality} onChange={e => setNationality(e.target.value)} options={nationalityOptions} />
      <FieldError>{errors.nationality}</FieldError>

      {err && <p style={{ color: T.red, fontSize: 13, fontWeight: 700, margin: "-8px 0 12px" }}>{err}</p>}
      <Btn onClick={save} full disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Btn>
      <Btn onClick={pop} full secondary style={{ marginTop: 10 }}>Cancel</Btn>
    </Page>
  );
}
