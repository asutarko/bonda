import { useState, useEffect } from "react";
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
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&display=swap');
.bonda-auth { font-family: 'Fraunces', Georgia, serif; color: ${INK}; overflow-x: hidden; }
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

// Minimal renderer for the small subset of markdown used in the legal
// .md files in public/ (headers, --- dividers, > callouts, - lists,
// **bold**/*italic*/[text](url) inline, plain paragraphs) — avoids
// pulling in a markdown dependency for a couple of static documents.
function parseInline(text, keyPrefix) {
  return text.split(/(\[[^\]]+\]\([^)]+\))/g).flatMap((segment, i) => {
    const link = segment.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, url] = link;
      // "#" placeholder links (e.g. "see our Terms & Conditions") aren't a
      // real destination in this doc yet — show the label as plain text
      // instead of a dead link.
      return url === "#" ? [label] : [<a key={`${keyPrefix}-a-${i}`} href={url} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT, fontWeight: 700 }}>{label}</a>];
    }
    return segment.split(/(\*\*[^*]+\*\*)/g).map((part, j) => (
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={`${keyPrefix}-b-${i}-${j}`}>{part.slice(2, -2)}</strong>
        : part
    ));
  });
}

function MarkdownBody({ text }) {
  const lines = text.split("\n");
  const blocks = [];
  let listBuffer = [];
  const flushList = () => {
    if (!listBuffer.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} style={{ margin: "0 0 14px", paddingLeft: 20 }}>
        {listBuffer.map((item, idx) => (
          <li key={idx} style={{ fontSize: 14, lineHeight: 1.6, color: INK70, marginBottom: 6 }}>{parseInline(item, `li-${blocks.length}-${idx}`)}</li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushList(); continue; }
    if (line === "---") { flushList(); blocks.push(<hr key={`hr-${blocks.length}`} style={{ border: "none", borderTop: "1px solid rgba(35,32,28,.12)", margin: "20px 0" }} />); continue; }
    if (line.startsWith("## ")) { flushList(); blocks.push(<h3 key={`h3-${blocks.length}`} style={{ fontFamily: FONT_TITLE, fontWeight: 600, fontSize: 19, color: INK, margin: "22px 0 10px" }}>{line.slice(3)}</h3>); continue; }
    if (line.startsWith("# ")) { flushList(); blocks.push(<h2 key={`h2-${blocks.length}`} style={{ fontFamily: FONT_TITLE, fontWeight: 600, fontSize: 24, color: INK, margin: "0 0 12px" }}>{line.slice(2)}</h2>); continue; }
    if (line.startsWith("> ")) { flushList(); blocks.push(<div key={`bq-${blocks.length}`} style={{ background: "#F3E7EA", borderLeft: `3px solid ${ERROR}`, borderRadius: 10, padding: "12px 14px", margin: "14px 0", fontSize: 13.5, lineHeight: 1.6, color: INK }}>{parseInline(line.slice(2), `bq-${blocks.length}`)}</div>); continue; }
    if (line.startsWith("- ")) { listBuffer.push(line.slice(2)); continue; }
    flushList();
    if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
      blocks.push(<p key={`i-${blocks.length}`} style={{ fontStyle: "italic", fontSize: 12.5, lineHeight: 1.6, color: INK55, margin: "0 0 12px" }}>{parseInline(line.slice(1, -1), `i-${blocks.length}`)}</p>);
      continue;
    }
    blocks.push(<p key={`p-${blocks.length}`} style={{ fontSize: 14, lineHeight: 1.65, color: INK70, margin: "0 0 12px" }}>{parseInline(line, `p-${blocks.length}`)}</p>);
  }
  flushList();
  return <>{blocks}</>;
}

function LegalDocScreen({ url, errorLabel, onBack }) {
  const [md, setMd] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    setMd(null); setErr("");
    fetch(url)
      .then(res => { if (!res.ok) throw new Error("fetch failed"); return res.text(); })
      .then(text => { if (!cancelled) setMd(text); })
      .catch(() => { if (!cancelled) setErr(`Couldn't load the ${errorLabel}. Please check your connection and try again.`); });
    return () => { cancelled = true; };
  }, [url]);

  return (
    <div className="bonda-auth" style={{ height: "100vh", display: "flex", flexDirection: "column", background: CANVAS, boxSizing: "border-box" }}>
      <style>{AUTH_CSS}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "28px 22px 18px", flexShrink: 0, background: CANVAS }}>
        <BackButton onClick={onBack} />
        <img src="/assets/images/3D - Logo - Green.png" alt="" style={{ height: 24, width: 24, borderRadius: "50%", objectFit: "cover" }} />
        <span style={{ fontFamily: FONT_TITLE, fontWeight: 600, fontSize: 18, color: INK }}>Bonda</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 22px" }}>
        {err ? <ErrorNote>{err}</ErrorNote> : !md ? <p style={{ color: INK55, fontSize: 14 }}>Loading…</p> : <MarkdownBody text={md} />}
      </div>
      <div style={{ padding: "14px 22px 22px", borderTop: "1px solid rgba(35,32,28,.12)", background: CANVAS, flexShrink: 0 }}>
        <button className="btn-primary" onClick={onBack}>Got it — back to welcome</button>
      </div>
    </div>
  );
}

const OTP_TTL_MS = 2 * 60 * 1000; // 2 minutes to enter the code before it expires

export function AuthScreen() {
  const [view, setView] = useState("welcome");
  const [transition, setTransition] = useState(null); // { from, to, dir: "fwd" | "back" }
  const [loginEmail, setLoginEmail] = useState(""); const [loginPass, setLoginPass] = useState(""); const [loginErr, setLoginErr] = useState("");
  const [regEmail, setRegEmail] = useState(""); const [regName, setRegName] = useState(""); const [regPass, setRegPass] = useState(""); const [regErr, setRegErr] = useState(""); const [regMsg, setRegMsg] = useState("");
  const [forgotEmail, setForgotEmail] = useState(""); const [forgotErr, setForgotErr] = useState(""); const [forgotMsg, setForgotMsg] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [agreeLegal, setAgreeLegal] = useState(false);

  const [otpCode, setOtpCode] = useState(""); const [otpErr, setOtpErr] = useState(""); const [otpMsg, setOtpMsg] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpResending, setOtpResending] = useState(false);

  // Ticks the "code expires in mm:ss" countdown whenever an OTP is pending.
  useEffect(() => {
    if (!otpExpiresAt) return;
    const tick = () => setOtpSecondsLeft(Math.max(0, Math.round((otpExpiresAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [otpExpiresAt]);

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

  if (showTerms) return <LegalDocScreen url="/Bonda-Terms-and-Conditions.md" errorLabel="Terms & Conditions" onBack={() => setShowTerms(false)} />;
  if (showPrivacy) return <LegalDocScreen url="/Bonda-Privacy-Policy.md" errorLabel="Privacy Policy" onBack={() => setShowPrivacy(false)} />;

  const register = async () => {
    setRegErr(""); setRegMsg("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) return setRegErr("Please enter a valid email address.");
    if (!regName.trim() || regName.trim().length < 2) return setRegErr("Name must be at least 2 characters.");
    if (regPass.length < 6) return setRegErr("Password must be at least 6 characters.");
    if (!agreeLegal) return setRegErr("Please agree to the Terms & Conditions and Privacy Policy to continue.");

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
      // Email confirmation required before the account can sign in — collect
      // the OTP code we just emailed instead of dropping the user on login.
      setOtpCode(""); setOtpErr(""); setOtpMsg("");
      setOtpExpiresAt(Date.now() + OTP_TTL_MS);
      navigate("otp", "fwd");
      return;
    }
    // On success, the top-level auth listener picks up the new session and switches to the main app.
  };

  const verifyOtp = async () => {
    setOtpErr("");
    const code = otpCode.trim();
    if (!/^\d{6}$/.test(code)) return setOtpErr("Enter the 6-digit code sent to your email.");
    setOtpVerifying(true);
    const { error } = await supabase.auth.verifyOtp({ email: regEmail.trim(), token: code, type: "signup" });
    setOtpVerifying(false);
    if (error) return setOtpErr(/expired/i.test(error.message) ? "This code has expired. Request a new one." : error.message);
    // On success, the top-level auth listener picks up the new session and switches to the main app.
  };

  const resendOtp = async () => {
    setOtpErr(""); setOtpMsg(""); setOtpResending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email: regEmail.trim() });
    setOtpResending(false);
    if (error) return setOtpErr(error.message);
    setOtpCode("");
    setOtpExpiresAt(Date.now() + OTP_TTL_MS);
    setOtpMsg("We've sent a new code to your email.");
  };

  const renderView = (v) => {
    if (v === "welcome") return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 24 }}>
        <img src="/assets/images/logo_new.png" alt="Bonda" style={{ width: 280, maxWidth: "80%", height: "auto" }} />
        <div>
          <h1 style={{ margin: "0 0 10px", fontFamily: FONT_TITLE, fontWeight: 600, fontSize: "clamp(28px,7vw,34px)", lineHeight: 1.08, letterSpacing: "-.012em", color: INK }}>Welcome to Bonda</h1>
          <p style={{ margin: "0 auto", maxWidth: "19rem", color: INK55, fontSize: 15.5, lineHeight: 1.5 }}>Track your child's journey and connect with other parents in Singapore.</p>
        </div>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          <button className="btn-primary" onClick={() => navigate("login", "fwd")}>Sign in <span aria-hidden="true">→</span></button>
          <button className="btn-ghost" onClick={() => { setRegErr(""); setRegMsg(""); setAgreeLegal(false); navigate("register", "fwd"); }}>Create a free account</button>
        </div>
        <p style={{ margin: 0, textAlign: "center", fontSize: 12.5, lineHeight: 1.55, color: INK55 }}>
          By creating an account or signing in, you agree to our<br />
          <button type="button" className="link-accent" style={{ fontSize: "inherit", whiteSpace: "nowrap", textDecoration: "underline" }} onClick={() => setShowTerms(true)}>Terms &amp; Conditions</button> and{" "}
          <button type="button" className="link-accent" style={{ fontSize: "inherit", whiteSpace: "nowrap", textDecoration: "underline" }} onClick={() => setShowPrivacy(true)}>Privacy Policy</button>.
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
          <button type="button" className="link-accent" onClick={() => { setLoginErr(""); setAgreeLegal(false); navigate("register", "fwd"); }}>Create a free account</button>
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
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, margin: "4px 0 16px", fontSize: 13, lineHeight: 1.5, color: INK55, cursor: "pointer" }}>
          <input type="checkbox" checked={agreeLegal} onChange={e => setAgreeLegal(e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: ACCENT }} />
          <span>
            By checking this box, I acknowledge that I have read, understood, and agree to the{" "}
            <button type="button" className="link-accent" style={{ fontSize: "inherit", textDecoration: "underline" }} onClick={() => setShowTerms(true)}>Terms &amp; Conditions</button> and{" "}
            <button type="button" className="link-accent" style={{ fontSize: "inherit", textDecoration: "underline" }} onClick={() => setShowPrivacy(true)}>Privacy Policy</button>.
          </span>
        </label>
        {regErr && <ErrorNote>{regErr}</ErrorNote>}
        <button className="btn-primary" onClick={register} disabled={!agreeLegal}>Create account <span aria-hidden="true">→</span></button>
        <p style={{ textAlign: "center", margin: "20px 0 0", fontSize: 14, color: INK55 }}>Already have an account?{" "}
          <button type="button" className="link-accent" onClick={() => { setRegErr(""); navigate("login", "back"); }}>Sign in</button>
        </p>
      </div>
    );

    if (v === "otp") {
      const canResend = otpSecondsLeft <= 0;
      const mm = String(Math.floor(otpSecondsLeft / 60)).padStart(2, "0");
      const ss = String(otpSecondsLeft % 60).padStart(2, "0");
      return (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <TopBar onBack={() => { setOtpErr(""); setOtpMsg(""); setOtpExpiresAt(null); navigate("register", "back"); }} />
          <ScreenHeading eyebrow="Verify your email" title="Enter your code" subtitle={`We've sent a 6-digit code to ${regEmail.trim()}.`} />
          <TextField label="Verification code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otpCode}
            onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={e => e.key === "Enter" && otpCode.trim().length === 6 && verifyOtp()}
            placeholder="123456" style={{ letterSpacing: "0.5em", fontWeight: 700, textAlign: "center", fontSize: 20 }} />
          {otpErr && <ErrorNote>{otpErr}</ErrorNote>}
          {otpMsg && <SuccessNote>{otpMsg}</SuccessNote>}
          <button className="btn-primary" onClick={verifyOtp} disabled={otpVerifying || otpCode.trim().length !== 6}>
            {otpVerifying ? "Verifying…" : "Verify code"} <span aria-hidden="true">→</span>
          </button>
          <div style={{ textAlign: "center", margin: "20px 0 0" }}>
            {canResend ? (
              <button type="button" className="link-accent" onClick={resendOtp} disabled={otpResending}>{otpResending ? "Sending…" : "Resend code"}</button>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: INK55 }}>Didn't get it? You can request a new code in <strong style={{ color: INK }}>{mm}:{ss}</strong></p>
            )}
          </div>
        </div>
      );
    }

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
// app — collects the phone number that register() doesn't ask for up front,
// then confirms it by emailing a one-time code to the account's (already
// verified) email address before letting the user through.
export function PhoneCaptureScreen({ account, onDone }) {
  const [step, setStep] = useState("phone"); // "phone" | "verify"
  const [dial, setDial] = useState("+65");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const [otpCode, setOtpCode] = useState(""); const [otpErr, setOtpErr] = useState(""); const [otpMsg, setOtpMsg] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpResending, setOtpResending] = useState(false);

  useEffect(() => {
    if (!otpExpiresAt) return;
    const tick = () => setOtpSecondsLeft(Math.max(0, Math.round((otpExpiresAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [otpExpiresAt]);

  const canSubmit = phone.trim().length > 0;

  const sendOtp = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email: account.email, options: { shouldCreateUser: false } });
    if (error) return setErr(error.message);
    setOtpCode(""); setOtpErr(""); setOtpMsg("");
    setOtpExpiresAt(Date.now() + OTP_TTL_MS);
    setStep("verify");
  };

  const save = async () => {
    setErr("");
    const trimmed = phone.trim();
    if (!trimmed) return setErr("Please enter your phone number.");
    if (!/^\d+$/.test(trimmed.replace(/\s+/g, ""))) return setErr("Phone number must contain numbers only. Please use numbers.");
    setSaving(true);
    const fullPhone = `${dial}${trimmed.replace(/\s+/g, "")}`;
    const { error } = await supabase.auth.updateUser({ data: { phone: fullPhone } });
    if (error) { setSaving(false); return setErr(error.message); }
    const { error: profileErr } = await supabase.from("profiles").update({ phone: fullPhone }).eq("id", account.id);
    if (profileErr) {
      setSaving(false);
      const dupe = /duplicate key|unique constraint/i.test(profileErr.message);
      return setErr(dupe ? "This phone number is already registered on another account." : profileErr.message);
    }
    await sendOtp();
    setSaving(false);
  };

  const verifyOtp = async () => {
    setOtpErr("");
    const code = otpCode.trim();
    if (!/^\d{6}$/.test(code)) return setOtpErr("Enter the 6-digit code sent to your email.");
    setOtpVerifying(true);
    const { error } = await supabase.auth.verifyOtp({ email: account.email, token: code, type: "email" });
    setOtpVerifying(false);
    if (error) return setOtpErr(/expired/i.test(error.message) ? "This code has expired. Request a new one." : error.message);
    onDone();
  };

  const resendOtp = async () => {
    setOtpErr(""); setOtpMsg(""); setOtpResending(true);
    const { error } = await supabase.auth.signInWithOtp({ email: account.email, options: { shouldCreateUser: false } });
    setOtpResending(false);
    if (error) return setOtpErr(error.message);
    setOtpCode("");
    setOtpExpiresAt(Date.now() + OTP_TTL_MS);
    setOtpMsg("We've sent a new code to your email.");
  };

  if (step === "verify") {
    const canResend = otpSecondsLeft <= 0;
    const mm = String(Math.floor(otpSecondsLeft / 60)).padStart(2, "0");
    const ss = String(otpSecondsLeft % 60).padStart(2, "0");
    return (
      <div className="bonda-auth" style={{ flex: 1, display: "flex", flexDirection: "column", background: CANVAS, padding: "28px 22px 26px", boxSizing: "border-box" }}>
        <style>{AUTH_CSS}</style>
        <div className="rise" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 4 }}>
            <img src="/assets/images/3D - Logo - Green.png" alt="Bonda" style={{ height: 28, width: 28, borderRadius: "50%", objectFit: "cover" }} />
          </div>
          <ScreenHeading eyebrow="One last step" title="Confirm your phone number" subtitle={`We've sent a 6-digit code to ${account.email} to confirm this is really you.`} />
          <TextField label="Verification code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otpCode}
            onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={e => e.key === "Enter" && otpCode.trim().length === 6 && verifyOtp()}
            placeholder="123456" style={{ letterSpacing: "0.5em", fontWeight: 700, textAlign: "center", fontSize: 20 }} />
          {otpErr && <ErrorNote>{otpErr}</ErrorNote>}
          {otpMsg && <SuccessNote>{otpMsg}</SuccessNote>}
          <button className="btn-primary" onClick={verifyOtp} disabled={otpVerifying || otpCode.trim().length !== 6}>
            {otpVerifying ? "Verifying…" : "Verify code"} <span aria-hidden="true">→</span>
          </button>
          <div style={{ textAlign: "center", margin: "20px 0 0" }}>
            {canResend ? (
              <button type="button" className="link-accent" onClick={resendOtp} disabled={otpResending}>{otpResending ? "Sending…" : "Resend code"}</button>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: INK55 }}>Didn't get it? You can request a new code in <strong style={{ color: INK }}>{mm}:{ss}</strong></p>
            )}
          </div>
          <p style={{ textAlign: "center", margin: "16px 0 0", fontSize: 13, color: INK55 }}>
            <button type="button" className="link-accent" style={{ fontSize: "inherit" }} onClick={() => { setOtpErr(""); setOtpMsg(""); setOtpExpiresAt(null); setStep("phone"); }}>← Edit phone number</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bonda-auth" style={{ flex: 1, display: "flex", flexDirection: "column", background: CANVAS, padding: "28px 22px 26px", boxSizing: "border-box" }}>
      <style>{AUTH_CSS}</style>
      <div className="rise" style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 4 }}>
          <img src="/assets/images/3D - Logo - Green.png" alt="Bonda" style={{ height: 28, width: 28, borderRadius: "50%", objectFit: "cover" }} />
        </div>
        <ScreenHeading eyebrow="One last step" title="What's your phone number?" subtitle="We'll save this to your profile and send a code to your email to confirm it." />
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: "0 0 118px" }}>
            <FieldLabel>Country</FieldLabel>
            <select className="field-select" value={dial} onChange={e => setDial(e.target.value)} style={{ fontWeight: 600, color: INK70 }}>
              {PHONE_COUNTRIES.map(c => <option key={c.iso} value={c.dial}>{c.iso} {c.dial}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Phone number</FieldLabel>
            <input className="field-input" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={e => {
              const raw = e.target.value;
              if (raw !== "" && !/^[\d\s]*$/.test(raw)) { setErr("Phone number must contain numbers only. Please use numbers."); return; }
              setErr("");
              setPhone(raw);
            }} onKeyDown={e => e.key === "Enter" && canSubmit && save()} placeholder="8123 4567" />
          </div>
        </div>
        {err && <ErrorNote>{err}</ErrorNote>}
        <button className="btn-primary" onClick={save} disabled={!canSubmit || saving}>{saving ? "Sending code…" : "Continue"} <span aria-hidden="true">→</span></button>
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
