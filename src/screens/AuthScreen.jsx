import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { uploadPhoto } from "../hooks";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge, Btn, Input, TextArea, Select, Avatar, Accordion, PageHero, AvatarIllustrations, ChildAvatar, ComAvatar, COM_AVATAR_ILLUSTRATIONS, ROOM_ICONS, ACTIVITY_TEXTAREA_STYLE, ActionIllustration, HeroIllustration } from "../ui";
import { CHILD_AVATARS, DEFAULT_CHILDREN, DEFAULT_SCHEDULE, ROOM_COLORS, SOS_COLORS, VERBAL_STATUS_OPTIONS, RELATIONSHIP_OPTIONS } from "../data";

export function AuthScreen() {
  const [view, setView] = useState("login");
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
    const joined = new Date().toLocaleDateString("en-SG", { month: "short", year: "numeric" });
    // Sign up with a short avatar key first — never the raw photo, which would
    // get embedded into the JWT and blow past the 100KB header limit.
    const { data, error } = await supabase.auth.signUp({
      email: regEmail.trim(),
      password: regPass,
      options: { data: { name: regName.trim(), avatar: regAvatar, joined, gender: regGender, address: regAddress.trim(), phone: regPhone.trim(), relationship: regRelationship } },
    });
    if (error) return setRegErr(error.message);
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

  if (view === "register") return (
    <Page>
      <h2 style={{ margin: "0 0 4px", color: T.ink, fontSize: 22, fontWeight: 800 }}>Create Account</h2>
      <p style={{ margin: "0 0 24px", color: T.inkSoft, fontSize: 14 }}>Join the Bonda parent community.</p>

      <SectionLabel style={{ marginBottom: 10 }}>Profile Picture</SectionLabel>


      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, padding: "14px 16px", background: T.purpleL, borderRadius: T.r }}>
        <ComAvatar value={regPhoto || regAvatar} size={60} active borderColor={T.purple} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: T.inkSoft }}>
            {regPhoto ? "Photo added ✓ — or choose an avatar below" : "Add a real photo:"}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <label style={{ flex: 1, background: T.purple, color: "white", borderRadius: T.r, padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
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
              <button onClick={openRegCam} style={{ flex: 1, background: T.surface, color: T.purple, border: `1.5px solid ${T.purple}`, borderRadius: T.r, padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                + Camera
              </button>
            )}
            <button onClick={() => setRegShowAvatarPicker(v => !v)} style={{ flex: 1, background: regShowAvatarPicker ? T.purple : T.surface, color: regShowAvatarPicker ? "white" : T.purple, border: `1.5px solid ${T.purple}`, borderRadius: T.r, padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              + Avatar
            </button>
            {regPhoto && (
              <button onClick={() => setRegPhoto(null)} style={{ background: T.redL, color: T.red, border: "none", borderRadius: T.r, padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody }}>✕</button>
            )}
          </div>
        </div>
      </div>


      {regShowCam && (
        <div style={{ marginBottom: 14, background: "#000", borderRadius: T.r, overflow: "hidden" }}>
          <video ref={regVideoRef} style={{ width: "100%", display: "block", aspectRatio: "4/3", objectFit: "cover" }} muted playsInline />
          <div style={{ display: "flex", gap: 8, padding: "10px 12px", background: "#111" }}>
            <Btn onClick={takeRegPhoto} disabled={!regCamReady} style={{ flex: 1, background: regCamReady ? T.green : T.border }}>📸 Take Photo</Btn>
            <Btn onClick={stopRegCam} secondary style={{ flex: 1 }}>Cancel</Btn>
          </div>
        </div>
      )}


      {regShowAvatarPicker && (
        <>
          <SectionLabel style={{ marginBottom: 10 }}>Choose an illustrated avatar</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24, opacity: regPhoto ? 0.4 : 1, transition: "opacity 0.2s" }}>
            {COM_AVATAR_ILLUSTRATIONS.map(av => {
              const isActive = !regPhoto && regAvatar === av.key;
              return (
                <div key={av.key} onClick={() => { if (!regPhoto) setRegAvatar(av.key); }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: regPhoto ? "default" : "pointer" }}>
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

      <Input label="Your name (shown to other parents)" value={regName} onChange={e => setRegName(e.target.value)} placeholder="e.g. Sarah, Mum of Aiden" />

      <Select label="Gender" value={regGender} onChange={e => setRegGender(e.target.value)} placeholder="Select gender" options={["Male", "Female"]} />

      <Input label="Phone number" type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="e.g. 9123 4567" />
      <Input label="Home address" value={regAddress} onChange={e => setRegAddress(e.target.value)} placeholder="e.g. Blk 123 Ang Mo Kio Ave 3, #04-56" />

      <Select label="Relationship to the child" value={regRelationship} onChange={e => setRegRelationship(e.target.value)} placeholder="Select relationship" options={RELATIONSHIP_OPTIONS} />

      <Input label="Email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="you@example.com" />
      <Input label="Password (min 6 characters)" type="password" value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="Create a password" />
      {regErr && <p style={{ color: T.red, fontSize: 13, fontWeight: 700, margin: "-8px 0 12px" }}>{regErr}</p>}
      <Btn onClick={register} full style={{ marginBottom: 10 }}>Create Account →</Btn>
      <Btn onClick={() => { setRegErr(""); setView("login"); }} full secondary>← Already have an account?</Btn>
    </Page>
  );

  if (view === "forgot") return (
    <Page>
      <h2 style={{ margin: "0 0 4px", color: T.ink, fontSize: 22, fontWeight: 800 }}>Reset Password</h2>
      <p style={{ margin: "0 0 24px", color: T.inkSoft, fontSize: 14 }}>Enter your email and we'll send you a link to reset your password.</p>
      <Input label="Email" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && forgotPassword()} placeholder="you@example.com" />
      {forgotErr && <p style={{ color: T.red, fontSize: 13, fontWeight: 700, margin: "-8px 0 12px" }}>{forgotErr}</p>}
      {forgotMsg && <p style={{ color: T.green, fontSize: 13, fontWeight: 700, margin: "-8px 0 12px" }}>{forgotMsg}</p>}
      <Btn onClick={forgotPassword} full style={{ marginBottom: 10 }}>Send Reset Link →</Btn>
      <Btn onClick={() => { setForgotErr(""); setForgotMsg(""); setView("login"); }} full secondary>← Back to sign in</Btn>
    </Page>
  );

  return (
    <Page>
      <div style={{ textAlign: "center", marginBottom: 28 }}>

        <div style={{ margin: "0 auto 20px", display: "flex", justifyContent: "center" }}>
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">

            <circle cx="60" cy="60" r="56" stroke={T.purple} strokeWidth="1" strokeDasharray="4 6" opacity="0.18"/>

            <circle cx="60" cy="60" r="44" fill={T.purpleL}/>


            <circle cx="38" cy="44" r="10" fill={T.surface} stroke={T.purple} strokeWidth="1.4"/>

            <circle cx="35" cy="43" r="1.2" fill={T.purple} opacity="0.4"/>
            <circle cx="41" cy="43" r="1.2" fill={T.purple} opacity="0.4"/>
            <path d="M35 47 Q38 49.5 41 47" fill="none" stroke={T.purple} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>

            <path d="M26 72 Q26 60 38 60 Q50 60 50 72" fill={T.surface} stroke={T.purple} strokeWidth="1.4" strokeLinejoin="round"/>


            <circle cx="82" cy="44" r="10" fill={T.surface} stroke={T.purple} strokeWidth="1.4"/>

            <circle cx="79" cy="43" r="1.2" fill={T.purple} opacity="0.4"/>
            <circle cx="85" cy="43" r="1.2" fill={T.purple} opacity="0.4"/>
            <path d="M79 47 Q82 49.5 85 47" fill="none" stroke={T.purple} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>

            <path d="M70 72 Q70 60 82 60 Q94 60 94 72" fill={T.surface} stroke={T.purple} strokeWidth="1.4" strokeLinejoin="round"/>


            <path d="M48 50 Q60 38 72 50" fill="none" stroke={T.purple} strokeWidth="1.6" strokeLinecap="round" strokeDasharray="3 4" opacity="0.45"/>


            <rect x="49" y="54" width="22" height="14" rx="4" fill={T.purple} opacity="0.85"/>
            <path d="M56 68 L54 72 L60 68" fill={T.purple} opacity="0.85"/>

            <circle cx="55" cy="61" r="1.5" fill="white"/>
            <circle cx="60" cy="61" r="1.5" fill="white"/>
            <circle cx="65" cy="61" r="1.5" fill="white"/>


            <circle cx="97" cy="35" r="5" fill={T.amber} opacity="0.25"/>
            <circle cx="23" cy="82" r="4" fill={T.amber} opacity="0.18"/>
            <circle cx="95" cy="82" r="3" fill={T.purple} opacity="0.12"/>
          </svg>
        </div>
        <h2 style={{ margin: "0 0 8px", color: T.ink, fontSize: 22, fontWeight: 800 }}>Welcome to Bonda</h2>
        <p style={{ margin: 0, color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Sign in to track your child's journey and connect with other parents in Singapore.</p>
      </div>
      {regMsg && <p style={{ color: T.green, fontSize: 13, fontWeight: 700, margin: "0 0 12px" }}>{regMsg}</p>}
      <Input label="Email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@example.com" />
      <Input label="Password" type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="Enter your password" />
      <button onClick={() => { setLoginErr(""); setForgotMsg(""); setForgotEmail(loginEmail); setView("forgot"); }} style={{ display: "block", width: "100%", textAlign: "right", background: "none", border: "none", color: T.purple, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody, padding: 0, margin: "-8px 0 12px" }}>Forgot password?</button>
      {loginErr && <p style={{ color: T.red, fontSize: 13, fontWeight: 700, margin: "-8px 0 12px" }}>{loginErr}</p>}
      <Btn onClick={login} full style={{ marginBottom: 10 }}>Sign In →</Btn>
      <Btn onClick={() => { setLoginErr(""); setView("register"); }} full secondary>New here? Create a free account</Btn>
      <div style={{ marginTop: 24, padding: "14px 16px", background: T.purpleL, borderRadius: T.r }}>
        <p style={{ margin: "0 0 8px", fontWeight: 800, color: T.purple, fontSize: 13 }}>Inside Bonda</p>
        <p style={{ margin: "0 0 5px", color: T.inkSoft, fontSize: 12, fontWeight: 600 }}>My Child — track your child's schedule, emotions, and progress</p>
        <p style={{ margin: "0 0 5px", color: T.inkSoft, fontSize: 12, fontWeight: 600 }}>Singapore Resources — subsidies, schools, therapists</p>
        <p style={{ margin: 0, color: T.inkSoft, fontSize: 12, fontWeight: 600 }}>Community — connect and message other parents</p>
      </div>
    </Page>
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
    <Page>
      <h2 style={{ margin: "0 0 4px", color: T.ink, fontSize: 22, fontWeight: 800 }}>Set a New Password</h2>
      <p style={{ margin: "0 0 24px", color: T.inkSoft, fontSize: 14 }}>Choose a new password for your account.</p>
      <Input label="New password (min 6 characters)" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Enter new password" />
      <Input label="Confirm password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === "Enter" && save()} placeholder="Re-enter new password" />
      {err && <p style={{ color: T.red, fontSize: 13, fontWeight: 700, margin: "-8px 0 12px" }}>{err}</p>}
      {msg && <p style={{ color: T.green, fontSize: 13, fontWeight: 700, margin: "-8px 0 12px" }}>{msg}</p>}
      <Btn onClick={save} full>Update Password →</Btn>
    </Page>
  );
}
