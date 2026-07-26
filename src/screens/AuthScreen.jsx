import { useState } from "react";
import { supabase } from "../lib/supabase";
import { markNewSignup, consumeNewSignupFlag } from "../hooks";

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
.bonda-auth { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; color: ${INK}; overflow-x: hidden; }
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
.bonda-auth .rise { animation: bondaAuthRise .48s cubic-bezier(.2,.75,.25,1) both; }
@keyframes bondaAuthRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.bonda-auth .track { display: flex; width: 200%; pointer-events: none; }
.bonda-auth .track-pane { flex: 0 0 50%; width: 50%; min-width: 0; box-sizing: border-box; }
.bonda-auth .track.fwd { transform: translateX(0%); animation: bondaSlideFwd .38s cubic-bezier(.22,.61,.36,1) forwards; }
.bonda-auth .track.back { transform: translateX(-50%); animation: bondaSlideBack .38s cubic-bezier(.22,.61,.36,1) forwards; }
@keyframes bondaSlideFwd { to { transform: translateX(-50%); } }
@keyframes bondaSlideBack { to { transform: translateX(0%); } }
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

const LEGAL_SECTIONS = [
  {
    key: "privacy", title: "Privacy Policy", sub: "How we collect, use and protect your data",
    iconBg: "#E6EDEC", iconColor: "#2E5A56",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10.5" width="16" height="10" rx="2.5" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /><circle cx="12" cy="15.5" r="1.4" /></svg>,
    blocks: [
      { label: "What we collect", text: "Your child's profile, the check-ins, schedules and notes you save, and basic usage data that keeps the app running." },
      { label: "How we use it", text: "Only to run the features you use — tracking, reminders, resources and community. We never sell your data or use it for advertising." },
      { label: "Your control", text: "Access, correct, export or delete your data any time by emailing the Data Protection Officer below. We respond within 30 days." },
      { label: "Keeping it safe", text: "Data is encrypted in transit and stored securely. We keep it only while your account is active." },
    ],
  },
  {
    key: "medical", title: "Medical Disclaimer", sub: "Important information about app content",
    iconBg: "#F3E7EA", iconColor: "#7A4651",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l2 5 4-10 2 5h4" /></svg>,
    blocks: [
      { label: "Not a medical device", text: "Bonda is a wellness and education tool. Its content, check-ins and resources are for general support and do not diagnose, treat, or replace advice from a doctor, therapist or other qualified professional." },
      { label: "Always consult a professional", text: "Speak to a qualified professional for decisions about your child's health, and seek urgent help in an emergency." },
    ],
  },
  {
    key: "dpia", title: "Data Protection Impact Assessment", sub: "Our PDPA compliance documentation",
    iconBg: "#E9EAEC", iconColor: "#474C52",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="4" width="14" height="17" rx="2.5" /><path d="M9 4.5h6v2.5H9z" /><path d="M9 12l2 2 3.5-3.5" /></svg>,
    blocks: [
      { label: "What it covers", text: "Bonda has completed a DPIA in line with Singapore's PDPA 2012 and the PDPC Advisory Guidelines on Children's Personal Data (March 2024). It documents what data we handle, why, the risks to children's data, and the safeguards in place." },
      { label: "Safeguards", text: "Data minimisation, consent, encryption and clear deletion rights. A full summary is available from our Data Protection Officer on request." },
    ],
  },
];

function AccordionItem({ section, open, onToggle }) {
  return (
    <div style={{ background: "#fff", border: "1.5px solid rgba(35,32,28,.12)", borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
      <button type="button" onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: 15, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
        <span style={{ width: 44, height: 44, flex: "0 0 44px", borderRadius: 12, background: section.iconBg, color: section.iconColor, display: "flex", alignItems: "center", justifyContent: "center" }}>{section.icon}</span>
        <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
          <span style={{ fontWeight: 600, fontSize: 16, color: INK, lineHeight: 1.2 }}>{section.title}</span>
          <span style={{ fontSize: 13, color: INK55, lineHeight: 1.35 }}>{section.sub}</span>
        </span>
        <span style={{ position: "relative", width: 20, height: 20, flex: "0 0 20px", color: open ? ACCENT : "rgba(35,32,28,.4)" }}>
          <span style={{ position: "absolute", left: 2, right: 2, top: 9, height: 2, background: "currentColor", borderRadius: 2 }} />
          <span style={{ position: "absolute", top: 2, bottom: 2, left: 9, width: 2, background: "currentColor", borderRadius: 2, transform: open ? "scaleY(0)" : "scaleY(1)", transition: "transform .25s ease" }} />
        </span>
      </button>
      {open && (
        <div style={{ padding: "2px 17px 18px", borderTop: "1px solid rgba(35,32,28,.12)" }}>
          {section.blocks.map((b, i) => (
            <div key={i} style={{ marginTop: 15 }}>
              <p style={{ margin: "0 0 5px", fontSize: 11.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: ACCENT }}>{b.label}</p>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.58, color: INK70 }}>{b.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PolicyScreen({ onBack }) {
  const [open, setOpen] = useState(new Set());
  const toggle = (key) => setOpen(s => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });
  return (
    <div className="bonda-auth" style={{ height: "100vh", display: "flex", flexDirection: "column", background: CANVAS, boxSizing: "border-box" }}>
      <style>{AUTH_CSS}</style>
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 22px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <BackButton onClick={onBack} />
          <img src="/assets/images/3D - Logo - Green.png" alt="" style={{ height: 24, width: 24, borderRadius: "50%", objectFit: "cover" }} />
          <span style={{ fontFamily: FONT_TITLE, fontWeight: 600, fontSize: 18, color: INK }}>Bonda</span>
        </div>
        <h2 style={{ margin: "0 0 10px", fontFamily: FONT_TITLE, fontWeight: 600, fontSize: 28, lineHeight: 1.1, letterSpacing: "-.012em", color: INK }}>Before you start</h2>
        <p style={{ margin: "0 0 22px", color: INK55, fontSize: 14.5, lineHeight: 1.5 }}>Please review the items below before using Bonda. Tap any section to read more.</p>

        {LEGAL_SECTIONS.map(sec => (
          <AccordionItem key={sec.key} section={sec} open={open.has(sec.key)} onToggle={() => toggle(sec.key)} />
        ))}

        <div style={{ background: "#fff", border: "1.5px solid rgba(35,32,28,.12)", borderRadius: 16, padding: 18, margin: "20px 0 4px" }}>
          <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 16, color: INK }}>Data protection officer</p>
          <p style={{ margin: "0 0 4px", fontSize: 15, color: INK }}>Norena Darsana</p>
          <a href="mailto:norena@bondaapp.sg" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 15, fontWeight: 700, color: ACCENT, textDecoration: "none" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M4 7l8 6 8-6" /></svg>
            norena@bondaapp.sg
          </a>
          <p style={{ margin: "12px 0 0", fontSize: 13, lineHeight: 1.55, color: INK55 }}>For data access, correction, or deletion requests — or any privacy concerns — email the DPO directly. We respond within 30 days.</p>
        </div>

        <p style={{ margin: "18px 6px 24px", textAlign: "center", fontSize: 12.5, lineHeight: 1.55, color: "rgba(35,32,28,.4)" }}>Bonda complies with Singapore's PDPA 2012 and the PDPC Advisory Guidelines on Children's Personal Data (March 2024).</p>
      </div>
      <div style={{ padding: "14px 22px 22px", borderTop: "1px solid rgba(35,32,28,.12)", background: CANVAS, flexShrink: 0 }}>
        <button className="btn-primary" onClick={onBack}>Got it — back to welcome</button>
      </div>
    </div>
  );
}

export function AuthScreen() {
  const [view, setView] = useState("welcome");
  const [transition, setTransition] = useState(null); // { from, to, dir: "fwd" | "back" }
  const [loginEmail, setLoginEmail] = useState(""); const [loginPass, setLoginPass] = useState(""); const [loginErr, setLoginErr] = useState("");
  const [regEmail, setRegEmail] = useState(""); const [regName, setRegName] = useState(""); const [regPass, setRegPass] = useState(""); const [regErr, setRegErr] = useState(""); const [regMsg, setRegMsg] = useState("");
  const [forgotEmail, setForgotEmail] = useState(""); const [forgotErr, setForgotErr] = useState(""); const [forgotMsg, setForgotMsg] = useState("");
  const [showLegal, setShowLegal] = useState(false);

  const navigate = (to, dir) => {
    if (to === view || transition) return;
    setTransition({ from: view, to, dir });
  };
  const finishTransition = () => {
    setView(t => transition ? transition.to : t);
    setTransition(null);
  };

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

  if (showLegal) return <PolicyScreen onBack={() => setShowLegal(false)} />;

  const register = async () => {
    setRegErr(""); setRegMsg("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) return setRegErr("Please enter a valid email address.");
    if (!regName.trim() || regName.trim().length < 2) return setRegErr("Name must be at least 2 characters.");
    if (regPass.length < 6) return setRegErr("Password must be at least 6 characters.");

    const joined = new Date().toLocaleDateString("en-SG", { month: "short", year: "numeric" });
    // Flag this as a fresh signup before calling signUp() — the client fires
    // its SIGNED_IN auth-state event as part of processing that call, so the
    // flag must already be in place for App.jsx to see it in time.
    markNewSignup();
    const { data, error } = await supabase.auth.signUp({
      email: regEmail.trim(),
      password: regPass,
      options: { data: { name: regName.trim(), avatar: "none", joined } },
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
      navigate("login", "back");
      return;
    }
    // On success, the top-level auth listener picks up the new session and switches to the main app.
  };

  const renderView = (v) => {
    if (v === "welcome") return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 24 }}>
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
          <button className="btn-primary" onClick={() => navigate("login", "fwd")}>Sign in <span aria-hidden="true">→</span></button>
          <button className="btn-ghost" onClick={() => { setRegErr(""); setRegMsg(""); navigate("register", "fwd"); }}>Create a free account</button>
        </div>
        <p style={{ margin: 0, textAlign: "center", fontSize: 12.5, lineHeight: 1.55, color: INK55 }}>
          By creating an account or signing in, you agree to our<br />
          <button type="button" className="link-accent" style={{ fontSize: "inherit", whiteSpace: "nowrap", textDecoration: "underline" }} onClick={() => setShowLegal(true)}>Terms &amp; Conditions</button> and{" "}
          <button type="button" className="link-accent" style={{ fontSize: "inherit", whiteSpace: "nowrap", textDecoration: "underline" }} onClick={() => setShowLegal(true)}>Privacy Policy</button>.
        </p>
      </div>
    );

    if (v === "login") return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <TopBar onBack={() => { setLoginErr(""); navigate("welcome", "back"); }} />
        <ScreenHeading eyebrow="Sign in" title="Welcome back" subtitle="Pick up right where you left off." />
        {regMsg && <SuccessNote>{regMsg}</SuccessNote>}
        <TextField label="Email" type="email" inputMode="email" autoComplete="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@example.com" />
        <PasswordField label="Password" autoComplete="current-password" value={loginPass} onChange={e => setLoginPass(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="Your password" />
        <div style={{ display: "flex", justifyContent: "flex-end", margin: "-6px 0 14px" }}>
          <button type="button" className="link-accent" style={{ fontSize: 13 }} onClick={() => { setLoginErr(""); setForgotMsg(""); setForgotEmail(loginEmail); navigate("forgot", "fwd"); }}>Forgot password?</button>
        </div>
        {loginErr && <ErrorNote>{loginErr}</ErrorNote>}
        <button className="btn-primary" onClick={login}>Sign in <span aria-hidden="true">→</span></button>
        <p style={{ textAlign: "center", margin: "20px 0 0", fontSize: 14, color: INK55 }}>New here?{" "}
          <button type="button" className="link-accent" onClick={() => { setLoginErr(""); navigate("register", "fwd"); }}>Create a free account</button>
        </p>
      </div>
    );

    if (v === "register") return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <TopBar onBack={() => { setRegErr(""); navigate("welcome", "back"); }} />
        <ScreenHeading eyebrow="Create account" title="Create your account" subtitle="A free space to track, learn, and connect." />
        <TextField label="Name" value={regName} onChange={e => setRegName(e.target.value)} placeholder="e.g. Sarah, Mum of Aiden" />
        <TextField label="Email" type="email" inputMode="email" autoComplete="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="you@example.com" />
        <PasswordField label="Password" autoComplete="new-password" value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="Create a password" />
        {regErr && <ErrorNote>{regErr}</ErrorNote>}
        <button className="btn-primary" onClick={register}>Create account <span aria-hidden="true">→</span></button>
        <p style={{ textAlign: "center", margin: "20px 0 0", fontSize: 14, color: INK55 }}>Already have an account?{" "}
          <button type="button" className="link-accent" onClick={() => { setRegErr(""); navigate("login", "back"); }}>Sign in</button>
        </p>
      </div>
    );

    if (v === "forgot") return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <TopBar onBack={() => { setForgotErr(""); setForgotMsg(""); navigate("login", "back"); }} />
        <ScreenHeading eyebrow="Reset password" title="Forgot your password?" subtitle="Enter your email and we'll send you a link to reset it." />
        <TextField label="Email" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && forgotPassword()} placeholder="you@example.com" />
        {forgotErr && <ErrorNote>{forgotErr}</ErrorNote>}
        {forgotMsg && <SuccessNote>{forgotMsg}</SuccessNote>}
        <button className="btn-primary" onClick={forgotPassword}>Send reset link <span aria-hidden="true">→</span></button>
        <p style={{ textAlign: "center", margin: "20px 0 0", fontSize: 14, color: INK55 }}>
          <button type="button" className="link-accent" onClick={() => { setForgotErr(""); setForgotMsg(""); navigate("login", "back"); }}>← Back to sign in</button>
        </p>
      </div>
    );

    return null;
  };

  return (
    <div className="bonda-auth" style={{ flex: 1, display: "flex", flexDirection: "column", background: CANVAS, padding: "28px 22px 26px", boxSizing: "border-box", position: "relative" }}>
      <style>{AUTH_CSS}</style>
      {transition ? (
        <div className={`track ${transition.dir}`} onAnimationEnd={finishTransition}>
          {transition.dir === "fwd" ? (
            <>
              <div className="track-pane">{renderView(transition.from)}</div>
              <div className="track-pane">{renderView(transition.to)}</div>
            </>
          ) : (
            <>
              <div className="track-pane">{renderView(transition.to)}</div>
              <div className="track-pane">{renderView(transition.from)}</div>
            </>
          )}
        </div>
      ) : (
        <div className="rise" key={view} style={{ display: "flex", flexDirection: "column", flex: 1 }}>{renderView(view)}</div>
      )}
    </div>
  );
}

// Dial codes for the countries Bonda's parents/caregivers most commonly come
// from — not the full ISO list, just enough to cover the userbase.
const PHONE_COUNTRIES = [
  { iso: "SG", dial: "+65", name: "Singapore" },
  { iso: "MY", dial: "+60", name: "Malaysia" },
  { iso: "ID", dial: "+62", name: "Indonesia" },
  { iso: "PH", dial: "+63", name: "Philippines" },
  { iso: "IN", dial: "+91", name: "India" },
  { iso: "CN", dial: "+86", name: "China" },
  { iso: "MM", dial: "+95", name: "Myanmar" },
  { iso: "BD", dial: "+880", name: "Bangladesh" },
  { iso: "VN", dial: "+84", name: "Vietnam" },
  { iso: "TH", dial: "+66", name: "Thailand" },
  { iso: "LK", dial: "+94", name: "Sri Lanka" },
  { iso: "NP", dial: "+977", name: "Nepal" },
  { iso: "PK", dial: "+92", name: "Pakistan" },
  { iso: "HK", dial: "+852", name: "Hong Kong" },
  { iso: "TW", dial: "+886", name: "Taiwan" },
  { iso: "KR", dial: "+82", name: "South Korea" },
  { iso: "JP", dial: "+81", name: "Japan" },
  { iso: "AU", dial: "+61", name: "Australia" },
  { iso: "GB", dial: "+44", name: "United Kingdom" },
  { iso: "US", dial: "+1", name: "United States" },
];

// Shown once, right after a fresh signup, before the account can enter the
// app — collects the phone number that register() doesn't ask for up front.
export function PhoneCaptureScreen({ account, onDone }) {
  const [dial, setDial] = useState("+65");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const canSubmit = phone.trim().length > 0;

  const save = async () => {
    setErr("");
    const trimmed = phone.trim();
    if (!trimmed) return setErr("Please enter your phone number.");
    setSaving(true);
    const fullPhone = `${dial}${trimmed.replace(/\s+/g, "")}`;
    const { error } = await supabase.auth.updateUser({ data: { phone: fullPhone } });
    if (error) { setSaving(false); return setErr(error.message); }
    const { error: profileErr } = await supabase.from("profiles").update({ phone: fullPhone }).eq("id", account.id);
    setSaving(false);
    if (profileErr) {
      const dupe = /duplicate key|unique constraint/i.test(profileErr.message);
      return setErr(dupe ? "This phone number is already registered on another account." : profileErr.message);
    }
    onDone();
  };

  return (
    <div className="bonda-auth" style={{ flex: 1, display: "flex", flexDirection: "column", background: CANVAS, padding: "28px 22px 26px", boxSizing: "border-box" }}>
      <style>{AUTH_CSS}</style>
      <div className="rise" style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 4 }}>
          <img src="/assets/images/3D - Logo - Green.png" alt="Bonda" style={{ height: 28, width: 28, borderRadius: "50%", objectFit: "cover" }} />
        </div>
        <ScreenHeading eyebrow="One last step" title="What's your phone number?" subtitle="We'll save this to your profile so we can reach you if needed." />
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: "0 0 118px" }}>
            <FieldLabel>Country</FieldLabel>
            <select className="field-select" value={dial} onChange={e => setDial(e.target.value)} style={{ fontWeight: 600, color: INK70 }}>
              {PHONE_COUNTRIES.map(c => <option key={c.iso} value={c.dial}>{c.iso} {c.dial}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Phone number</FieldLabel>
            <input className="field-input" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} onKeyDown={e => e.key === "Enter" && canSubmit && save()} placeholder="8123 4567" />
          </div>
        </div>
        {err && <ErrorNote>{err}</ErrorNote>}
        <button className="btn-primary" onClick={save} disabled={!canSubmit || saving}>Continue <span aria-hidden="true">→</span></button>
      </div>
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
