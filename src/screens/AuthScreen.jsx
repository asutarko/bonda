import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { uploadPhoto, markNewSignup, consumeNewSignupFlag } from "../hooks";
import { ComAvatar, COM_AVATAR_ILLUSTRATIONS } from "../ui";
import { RELATIONSHIP_OPTIONS } from "../data";

const ACCENT = "#3E6E6A";
const INK = "#23201C";
const INK70 = "rgba(35,32,28,.70)";
const INK55 = "rgba(35,32,28,.55)";
const CANVAS = "#F4F1EB";
const ERROR = "#B4544F";
const SUCCESS_BG = "#E6EDEC";
const SUCCESS_TX = "#2E5A56";
const FONT_TITLE = "'Fraunces', Georgia, serif";

const AUTH_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
.bonda-auth { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; color: ${INK}; }
.bonda-auth .field-input, .bonda-auth .field-select {
  width: 100%; height: 50px; border-radius: 14px; border: 1.5px solid rgba(35,32,28,.14);
  background: #FFFFFF; padding: 0 14px; font-size: 15px; font-family: inherit; color: ${INK};
  outline: none; transition: border-color .18s ease, box-shadow .18s ease; box-sizing: border-box;
}
.bonda-auth .field-input:focus, .bonda-auth .field-select:focus {
  border-color: ${ACCENT}; box-shadow: 0 0 0 3px rgba(62,110,106,.16);
}
.bonda-auth .field-input::placeholder { color: rgba(35,32,28,.4); }
.bonda-auth .field-select {
  appearance: none; -webkit-appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2323201C' stroke-opacity='0.45' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 14px center; padding-right: 40px;
}
.bonda-auth .btn-primary {
  height: 52px; border-radius: 999px; border: none; background: ${ACCENT}; color: #fff;
  font-weight: 700; font-size: 15px; width: 100%; cursor: pointer; font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: background .2s ease, transform .12s ease;
}
.bonda-auth .btn-primary:hover { background: #345f5b; }
.bonda-auth .btn-primary:active { transform: scale(.985); }
.bonda-auth .btn-primary:disabled { opacity: .45; cursor: default; }
.bonda-auth .btn-ghost {
  height: 52px; border-radius: 999px; border: 1.5px solid rgba(35,32,28,.2); background: transparent;
  color: ${INK}; font-weight: 700; font-size: 15px; width: 100%; cursor: pointer; font-family: inherit;
  transition: border-color .2s ease, color .2s ease;
}
.bonda-auth .btn-ghost:hover { border-color: ${ACCENT}; color: ${ACCENT}; }
.bonda-auth .link-accent {
  background: none; border: 0; padding: 0; cursor: pointer; font-family: inherit;
  color: ${ACCENT}; font-weight: 700;
}
.bonda-auth .link-accent:hover { text-decoration: underline; }
.bonda-auth .back-btn {
  width: 42px; height: 42px; flex: 0 0 42px; border-radius: 999px; background: #fff;
  border: 1.5px solid rgba(35,32,28,.12); display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: ${INK}; transition: border-color .2s ease, color .2s ease;
}
.bonda-auth .back-btn:hover { border-color: ${ACCENT}; color: ${ACCENT}; }
.bonda-auth .eye-btn {
  position: absolute; right: 6px; top: 50%; transform: translateY(-50%); width: 36px; height: 36px;
  border: 0; background: transparent; cursor: pointer; display: flex; align-items: center;
  justify-content: center; color: rgba(35,32,28,.4); border-radius: 999px; transition: color .2s ease;
}
.bonda-auth .eye-btn:hover { color: ${ACCENT}; }
.bonda-auth .chip-btn { flex: 1 1 92px; border-radius: 999px; padding: 9px 10px; font-size: 12px;
  font-weight: 700; cursor: pointer; font-family: inherit; display: flex; align-items: center;
  justify-content: center; gap: 5px; }
.bonda-auth .rise { animation: bondaAuthRise .48s cubic-bezier(.2,.75,.25,1) both; }
@keyframes bondaAuthRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
`;

function FieldLabel({ children }) {
  return <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: INK70, margin: "0 0 7px 2px" }}>{children}</label>;
}

function TextField({ label, style, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <input className="field-input" style={style} {...props} />
    </div>
  );
}

function PasswordField({ label, value, onChange, placeholder, autoComplete, onKeyDown }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <div style={{ position: "relative" }}>
        <input className="field-input" style={{ paddingRight: 48 }} type={show ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} onKeyDown={onKeyDown} />
        <button type="button" className="eye-btn" onClick={() => setShow(v => !v)} aria-label={show ? "Hide password" : "Show password"}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
        </button>
      </div>
    </div>
  );
}

function NativeSelect({ label, value, onChange, options, placeholder }) {
  const norm = options.map(o => (o !== null && typeof o === "object") ? o : { value: o, label: o });
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <select className="field-select" value={value} onChange={onChange}>
        <option value="" disabled>{placeholder || "Select…"}</option>
        {norm.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button type="button" className="back-btn" onClick={onClick} aria-label="Back">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
    </button>
  );
}

function TopBar({ onBack }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
      <BackButton onClick={onBack} />
      <img src="/assets/images/3D - Logo - Green.png" alt="Bonda" style={{ height: 28, width: 28, borderRadius: "50%", objectFit: "cover", marginLeft: "auto" }} />
    </div>
  );
}

function ScreenHeading({ eyebrow, title, subtitle }) {
  return (
    <div style={{ margin: "22px 0 18px" }}>
      <p style={{ margin: "0 0 8px", fontSize: 12.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: ACCENT }}>{eyebrow}</p>
      <h2 style={{ margin: "0 0 8px", fontFamily: FONT_TITLE, fontWeight: 600, fontSize: 27, lineHeight: 1.15, letterSpacing: "-.01em", color: INK }}>{title}</h2>
      {subtitle && <p style={{ margin: 0, color: INK55, fontSize: 14.5, lineHeight: 1.5 }}>{subtitle}</p>}
    </div>
  );
}

function ErrorNote({ children }) {
  return <p style={{ color: ERROR, fontSize: 13, fontWeight: 700, margin: "-6px 0 12px" }}>{children}</p>;
}

function SuccessNote({ children }) {
  return <p style={{ background: SUCCESS_BG, color: SUCCESS_TX, fontSize: 13, fontWeight: 700, borderRadius: 12, padding: "10px 14px", margin: "0 0 14px" }}>{children}</p>;
}

export function AuthScreen() {
  const [view, setView] = useState("welcome");
  const [loginEmail, setLoginEmail] = useState(""); const [loginPass, setLoginPass] = useState(""); const [loginErr, setLoginErr] = useState("");
  const [regEmail, setRegEmail] = useState(""); const [regName, setRegName] = useState(""); const [regPass, setRegPass] = useState(""); const [regAvatar, setRegAvatar] = useState("none"); const [regErr, setRegErr] = useState(""); const [regMsg, setRegMsg] = useState(""); const [regPhoto, setRegPhoto] = useState(null); const [regShowCam, setRegShowCam] = useState(false); const [regCamReady, setRegCamReady] = useState(false); const [regCamOk, setRegCamOk] = useState(true); const regVideoRef = useRef(null); const regStreamRef = useRef(null);
  const [regGender, setRegGender] = useState(""); const [regAddress, setRegAddress] = useState(""); const [regPhone, setRegPhone] = useState(""); const [regRelationship, setRegRelationship] = useState("");
  const [regShowAvatarPicker, setRegShowAvatarPicker] = useState(false);
  const [forgotEmail, setForgotEmail] = useState(""); const [forgotErr, setForgotErr] = useState(""); const [forgotMsg, setForgotMsg] = useState("");

  const login = async () => {
    setLoginErr("");
    if (!loginEmail.trim()) return setLoginErr("Please enter your email.");
    if (!loginPass) return setLoginErr("Please enter your password.");
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail.trim(), password: loginPass });
    if (error) return setLoginErr(error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message);
    // On success, the top-level auth listener picks up the new session and switches to the main app.
  };

  const forgotPassword = async () => {
    setForgotErr(""); setForgotMsg("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) return setForgotErr("Please enter a valid email address.");
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), { redirectTo: window.location.origin });
    if (error) return setForgotErr(error.message);
    setForgotMsg("Check your email for a link to reset your password.");
  };

  // Camera for register profile photo
  useEffect(() => {
    const check = async () => { try { const d = await navigator.mediaDevices.enumerateDevices(); setRegCamOk(d.some(x => x.kind === "videoinput")); } catch { setRegCamOk(false); } };
    check();
    return () => { if (regStreamRef.current) regStreamRef.current.getTracks().forEach(t => t.stop()); };
  }, []);

  const openRegCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      regStreamRef.current = stream;
      setRegShowCam(true);
      setTimeout(() => { if (regVideoRef.current) { regVideoRef.current.srcObject = stream; regVideoRef.current.onloadedmetadata = () => { regVideoRef.current.play(); setRegCamReady(true); }; } }, 100);
    } catch { setRegCamOk(false); }
  };

  const stopRegCam = () => {
    if (regStreamRef.current) { regStreamRef.current.getTracks().forEach(t => t.stop()); regStreamRef.current = null; }
    setRegShowCam(false); setRegCamReady(false);
  };

  const takeRegPhoto = () => {
    if (!regVideoRef.current) return;
    const c = document.createElement("canvas");
    c.width = regVideoRef.current.videoWidth || 300; c.height = regVideoRef.current.videoHeight || 300;
    c.getContext("2d").drawImage(regVideoRef.current, 0, 0);
    setRegPhoto(c.toDataURL("image/jpeg", 0.75));
    stopRegCam();
  };

  const register = async () => {
    setRegErr(""); setRegMsg("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) return setRegErr("Please enter a valid email address.");
    if (!regName.trim() || regName.trim().length < 2) return setRegErr("Name must be at least 2 characters.");
    if (!regGender) return setRegErr("Please select your gender.");
    if (!regPhone.trim()) return setRegErr("Please enter your phone number.");
    if (!regAddress.trim()) return setRegErr("Please enter your home address.");
    if (!regRelationship) return setRegErr("Please select your relationship to the child.");
    if (regPass.length < 6) return setRegErr("Password must be at least 6 characters.");

    // Phone isn't checked by Supabase Auth (only email is) — look it up in
    // profiles ourselves via an RPC, since anon clients can't select from
    // profiles directly (see profiles.sql RLS policies).
    const { data: phoneTaken } = await supabase.rpc("phone_registered", { check_phone: regPhone.trim() });
    if (phoneTaken) return setRegErr("This phone number is already registered. Phone numbers must be unique.");

    const joined = new Date().toLocaleDateString("en-SG", { month: "short", year: "numeric" });
    // Flag this as a fresh signup before calling signUp() — the client fires
    // its SIGNED_IN auth-state event as part of processing that call, so the
    // flag must already be in place for App.jsx to see it in time.
    markNewSignup();
    // Sign up with a short avatar key first — never the raw photo, which would
    // get embedded into the JWT and blow past the 100KB header limit.
    const { data, error } = await supabase.auth.signUp({
      email: regEmail.trim(),
      password: regPass,
      options: { data: { name: regName.trim(), avatar: regAvatar, joined, gender: regGender, address: regAddress.trim(), phone: regPhone.trim(), relationship: regRelationship } },
    });
    if (error) {
      consumeNewSignupFlag();
      const dupe = /already registered|already exists|duplicate/i.test(error.message);
      return setRegErr(dupe ? "This email is already registered. Please use a unique email address." : error.message);
    }
    // Supabase can return a look-alike "success" with no identities when the
    // email already exists and confirmations are on, to avoid leaking which
    // emails are registered — treat that the same as a duplicate-email error.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      consumeNewSignupFlag();
      return setRegErr("This email is already registered. Please use a unique email address.");
    }
    if (!data.session) {
      // Email confirmation required before the account can sign in
      setRegMsg("Account created! Check your email to confirm before signing in.");
      setView("login");
      return;
    }
    // If a real photo was taken/uploaded, store the file in Storage (assets/parents/)
    // and replace the avatar with its public URL — keeping the JWT small.
    if (regPhoto) {
      const url = await uploadPhoto(regPhoto, "parents", data.user.id);
      if (url) {
        await supabase.auth.updateUser({ data: { avatar: url } });
        await supabase.from("profiles").update({ avatar: url }).eq("id", data.user.id);
      }
    }
    // On success, the top-level auth listener picks up the new session and switches to the main app.
  };

  const chipPrimary = { background: ACCENT, color: "#fff", border: "none" };
  const chipGhost = { background: "#fff", color: ACCENT, border: `1.5px solid ${ACCENT}` };
  const chipDanger = { background: "transparent", color: ERROR, border: `1.5px solid ${ERROR}`, flex: "0 0 auto" };

  let content;

  if (view === "welcome") {
    content = (
      <div key="welcome" className="rise" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 24 }}>
        <div style={{ position: "relative", width: 150, height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 6, borderRadius: "50%", background: `radial-gradient(circle at 50% 46%, rgba(62,110,106,.14), transparent 68%)` }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1px dashed rgba(35,32,28,.18)` }} />
          <img src="/assets/images/3D - Logo - Green.png" alt="Bonda" style={{ position: "relative", width: "62%", height: "62%", objectFit: "contain" }} />
        </div>
        <div>
          <h1 style={{ margin: "0 0 10px", fontFamily: FONT_TITLE, fontWeight: 600, fontSize: "clamp(28px,7vw,34px)", lineHeight: 1.08, letterSpacing: "-.012em", color: INK }}>Welcome to Bonda</h1>
          <p style={{ margin: "0 auto", maxWidth: "19rem", color: INK55, fontSize: 15.5, lineHeight: 1.5 }}>Track your child's journey and connect with other parents in Singapore.</p>
        </div>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          <button className="btn-primary" onClick={() => setView("login")}>Sign in <span aria-hidden="true">→</span></button>
          <button className="btn-ghost" onClick={() => { setRegErr(""); setRegMsg(""); setView("register"); }}>Create a free account</button>
        </div>
        <p style={{ margin: 0, textAlign: "center", fontSize: 12.5, lineHeight: 1.55, color: INK55 }}>By creating an account or signing in, you agree to our Terms &amp; Conditions and Privacy Policy.</p>
      </div>
    );
  } else if (view === "login") {
    content = (
      <div key="login" className="rise" style={{ display: "flex", flexDirection: "column" }}>
        <TopBar onBack={() => { setLoginErr(""); setView("welcome"); }} />
        <ScreenHeading eyebrow="Sign in" title="Welcome back" subtitle="Pick up right where you left off." />
        {regMsg && <SuccessNote>{regMsg}</SuccessNote>}
        <TextField label="Email" type="email" inputMode="email" autoComplete="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@example.com" />
        <PasswordField label="Password" autoComplete="current-password" value={loginPass} onChange={e => setLoginPass(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="Your password" />
        <div style={{ display: "flex", justifyContent: "flex-end", margin: "-6px 0 14px" }}>
          <button type="button" className="link-accent" style={{ fontSize: 13 }} onClick={() => { setLoginErr(""); setForgotMsg(""); setForgotEmail(loginEmail); setView("forgot"); }}>Forgot password?</button>
        </div>
        {loginErr && <ErrorNote>{loginErr}</ErrorNote>}
        <button className="btn-primary" onClick={login}>Sign in <span aria-hidden="true">→</span></button>
        <p style={{ textAlign: "center", margin: "20px 0 0", fontSize: 14, color: INK55 }}>New here?{" "}
          <button type="button" className="link-accent" onClick={() => { setLoginErr(""); setView("register"); }}>Create a free account</button>
        </p>
      </div>
    );
  } else if (view === "register") {
    const isPhotoSelected = !!regPhoto;
    content = (
      <div key="register" className="rise" style={{ display: "flex", flexDirection: "column" }}>
        <TopBar onBack={() => { setRegErr(""); setView("welcome"); }} />
        <ScreenHeading eyebrow="Create account" title="Create your account" subtitle="A free space to track, learn, and connect." />

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, padding: "16px", background: "#fff", border: "1.5px solid rgba(35,32,28,.12)", borderRadius: 16 }}>
          <ComAvatar value={regPhoto || regAvatar} size={56} active borderColor={ACCENT} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: INK70 }}>
              {regPhoto ? "Photo added ✓ — or choose an avatar below" : "Add a real photo:"}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <label className="chip-btn" style={chipPrimary}>
                + Upload
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                  const file = e.target.files[0]; if (!file) return;
                  if (file.size > 2 * 1024 * 1024) return;
                  const reader = new FileReader();
                  reader.onload = ev => setRegPhoto(ev.target.result);
                  reader.readAsDataURL(file);
                }} />
              </label>
              {regCamOk && (
                <button type="button" className="chip-btn" style={chipGhost} onClick={openRegCam}>+ Camera</button>
              )}
              <button type="button" className="chip-btn" style={regShowAvatarPicker ? chipPrimary : chipGhost} onClick={() => setRegShowAvatarPicker(v => !v)}>+ Avatar</button>
              {regPhoto && (
                <button type="button" className="chip-btn" style={chipDanger} onClick={() => setRegPhoto(null)}>✕</button>
              )}
            </div>
          </div>
        </div>

        {regShowCam && (
          <div style={{ marginBottom: 16, background: "#000", borderRadius: 16, overflow: "hidden" }}>
            <video ref={regVideoRef} style={{ width: "100%", display: "block", aspectRatio: "4/3", objectFit: "cover" }} muted playsInline />
            <div style={{ display: "flex", gap: 8, padding: "10px 12px", background: "#111" }}>
              <button className="btn-primary" disabled={!regCamReady} onClick={takeRegPhoto} style={{ flex: 1, height: 44 }}>📸 Take Photo</button>
              <button className="btn-ghost" onClick={stopRegCam} style={{ flex: 1, height: 44, borderColor: "rgba(255,255,255,.3)", color: "#fff" }}>Cancel</button>
            </div>
          </div>
        )}

        {regShowAvatarPicker && (
          <>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: INK55, textTransform: "uppercase", letterSpacing: ".08em" }}>Choose an illustrated avatar</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18, opacity: isPhotoSelected ? 0.4 : 1, transition: "opacity 0.2s" }}>
              {COM_AVATAR_ILLUSTRATIONS.map(av => {
                const isActive = !isPhotoSelected && regAvatar === av.key;
                return (
                  <div key={av.key} onClick={() => { if (!isPhotoSelected) setRegAvatar(av.key); }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: isPhotoSelected ? "default" : "pointer" }}>
                    <div style={{ border: `2.5px solid ${isActive ? ACCENT : "transparent"}`, borderRadius: "50%", padding: 1, transform: isActive ? "scale(1.08)" : "scale(1)", transition: "all 0.15s" }}>
                      {av.render(isActive)}
                    </div>
                    <p style={{ margin: 0, fontSize: 9, fontWeight: isActive ? 800 : 600, color: isActive ? ACCENT : INK55, letterSpacing: "0.03em" }}>{av.label}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <TextField label={<>Your name (shown to other parents) <span style={{ color: ERROR }}>*</span></>} value={regName} onChange={e => setRegName(e.target.value)} placeholder="e.g. Sarah, Mum of Aiden" />
        <NativeSelect label={<>Gender <span style={{ color: ERROR }}>*</span></>} value={regGender} onChange={e => setRegGender(e.target.value)} placeholder="Select gender" options={["Male", "Female"]} />
        <TextField label={<>Phone number <span style={{ color: ERROR }}>*</span></>} type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="e.g. 9123 4567" />
        <TextField label={<>Home address <span style={{ color: ERROR }}>*</span></>} value={regAddress} onChange={e => setRegAddress(e.target.value)} placeholder="e.g. Blk 123 Ang Mo Kio Ave 3, #04-56" />
        <NativeSelect label={<>Relationship to the child <span style={{ color: ERROR }}>*</span></>} value={regRelationship} onChange={e => setRegRelationship(e.target.value)} placeholder="Select relationship" options={RELATIONSHIP_OPTIONS} />
        <TextField label={<>Email <span style={{ color: ERROR }}>*</span></>} type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="you@example.com" />
        <PasswordField label={<>Password (min 6 characters) <span style={{ color: ERROR }}>*</span></>} value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="Create a password" />
        {regErr && <ErrorNote>{regErr}</ErrorNote>}
        <button className="btn-primary" onClick={register}>Create account <span aria-hidden="true">→</span></button>
        <p style={{ margin: "10px 0 0", fontSize: 11, color: INK55, textAlign: "center" }}><span style={{ color: ERROR }}>*</span> required</p>
        <p style={{ textAlign: "center", margin: "16px 0 0", fontSize: 14, color: INK55 }}>Already have an account?{" "}
          <button type="button" className="link-accent" onClick={() => { setRegErr(""); setView("login"); }}>Sign in</button>
        </p>
      </div>
    );
  } else if (view === "forgot") {
    content = (
      <div key="forgot" className="rise" style={{ display: "flex", flexDirection: "column" }}>
        <TopBar onBack={() => { setForgotErr(""); setForgotMsg(""); setView("login"); }} />
        <ScreenHeading eyebrow="Reset password" title="Forgot your password?" subtitle="Enter your email and we'll send you a link to reset it." />
        <TextField label="Email" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && forgotPassword()} placeholder="you@example.com" />
        {forgotErr && <ErrorNote>{forgotErr}</ErrorNote>}
        {forgotMsg && <SuccessNote>{forgotMsg}</SuccessNote>}
        <button className="btn-primary" onClick={forgotPassword}>Send reset link <span aria-hidden="true">→</span></button>
        <p style={{ textAlign: "center", margin: "20px 0 0", fontSize: 14, color: INK55 }}>
          <button type="button" className="link-accent" onClick={() => { setForgotErr(""); setForgotMsg(""); setView("login"); }}>← Back to sign in</button>
        </p>
      </div>
    );
  }

  return (
    <div className="bonda-auth" style={{ flex: 1, display: "flex", flexDirection: "column", background: CANVAS, padding: "28px 22px 26px", boxSizing: "border-box" }}>
      <style>{AUTH_CSS}</style>
      {content}
    </div>
  );
}

// Shown when the user lands back in the app via a "reset password" email link
// (Supabase fires a PASSWORD_RECOVERY auth event for this).

export function ResetPasswordScreen({ onDone }) {
  const [pass, setPass] = useState(""); const [confirm, setConfirm] = useState(""); const [err, setErr] = useState(""); const [msg, setMsg] = useState("");

  const save = async () => {
    setErr(""); setMsg("");
    if (pass.length < 6) return setErr("Password must be at least 6 characters.");
    if (pass !== confirm) return setErr("Passwords don't match.");
    const { error } = await supabase.auth.updateUser({ password: pass });
    if (error) return setErr(error.message);
    setMsg("Password updated! Taking you to the app…");
    setTimeout(onDone, 1000);
  };

  return (
    <div className="bonda-auth" style={{ flex: 1, display: "flex", flexDirection: "column", background: CANVAS, padding: "28px 22px 26px", boxSizing: "border-box" }}>
      <style>{AUTH_CSS}</style>
      <div className="rise" style={{ display: "flex", flexDirection: "column" }}>
        <ScreenHeading eyebrow="Reset password" title="Set a new password" subtitle="Choose a new password for your account." />
        <PasswordField label="New password (min 6 characters)" value={pass} onChange={e => setPass(e.target.value)} placeholder="Enter new password" />
        <PasswordField label="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === "Enter" && save()} placeholder="Re-enter new password" />
        {err && <ErrorNote>{err}</ErrorNote>}
        {msg && <SuccessNote>{msg}</SuccessNote>}
        <button className="btn-primary" onClick={save}>Update password <span aria-hidden="true">→</span></button>
      </div>
    </div>
  );
}
