import { useState, useEffect, useRef } from "react";
import { supabase } from "./lib/supabase";
import { T } from "./theme";
import { NavMark, ComAvatar } from "./ui";
import { useChildren, useBackHandler, backHandlerStack, accountFromUser, forceSignOut, consumeNewSignupFlag } from "./hooks";
import { FosterHubScreen } from "./screens/FosterHubScreen";
import { CarerLetterScreen } from "./screens/CarerLetterScreen";
import { DocumentsScreen } from "./screens/DocumentsScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { SubsidiesScreen } from "./screens/SubsidiesScreen";
import { MyChildScreen } from "./screens/MyChildScreen";
import { AddChildScreen, EditChildScreen } from "./screens/onboarding";
import { ScheduleScreen } from "./screens/ScheduleScreen";
import { AuthScreen, ResetPasswordScreen, PhoneCaptureScreen } from "./screens/AuthScreen";
import { CommunityScreen } from "./screens/CommunityScreen";
import SupportDirectory from "./components/SupportDirectory";
import { SOSScreen } from "./screens/SOSScreen";
import { DevelopmentGuideScreen } from "./screens/DevelopmentGuideScreen";
import { EmotionsBehavioursScreen } from "./screens/EmotionsBehavioursGuide";
import { EditProfileScreen } from "./screens/ProfileScreen";
import { LegalHub } from "./components/bonda-compliance";

export const NAV = [
  { id: "home",      label: "Home",      icon: "🏠" },
  { id: "mychild",   label: "My Child",  icon: "🧠" },
  { id: "schedule",  label: "Schedule",  icon: "📋" },
  { id: "community", label: "Community", icon: "💬" },
];

// Converts a "data:image/jpeg;base64,..." string (from canvas/FileReader) into a Blob for upload.

export default function Bonda() {
  const [tab, setTab] = useState("home");
  const [stack, setStack] = useState([]); // secondary screens pushed on top
  const [account, setAccount] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [pendingPhone, setPendingPhone] = useState(false);
  // Whether the signed-in account still needs to tick the compliance
  // checkbox — backed by profiles.compliance_agreed_at so it's checked
  // per-account (not per-device) and existing users aren't re-prompted.
  const [complianceAgreed, setComplianceAgreed] = useState(true);
  const [complianceChecked, setComplianceChecked] = useState(false);

  // Loads the account and, if it just came from a fresh registration, flags
  // the mandatory phone-capture screen so it's shown before the app is usable.
  const applyAccount = (acc) => {
    setAccount(acc);
    if (acc && consumeNewSignupFlag()) setPendingPhone(true);
  };

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      applyAccount(accountFromUser(data.session?.user));
      setAuthLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
      applyAccount(accountFromUser(session?.user));
      setAuthLoading(false);
    });
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!account) { setComplianceChecked(false); return; }
    let cancelled = false;
    setComplianceChecked(false);
    supabase.from("profiles").select("compliance_agreed_at").eq("id", account.id).single()
      .then(({ data }) => {
        if (cancelled) return;
        setComplianceAgreed(!!data?.compliance_agreed_at);
        setComplianceChecked(true);
      });
    return () => { cancelled = true; };
  }, [account?.id]);

  const agreeToCompliance = async () => {
    const { error } = await supabase.from("profiles").update({ compliance_agreed_at: new Date().toISOString() }).eq("id", account.id);
    if (error) throw error;
    setComplianceAgreed(true);
  };

  const childCtx = useChildren(account?.id);

  // Intercept the hardware/browser back button: close any open modal/form,
  // else pop the screen stack, else go to the Home tab, else ask for a
  // second press before letting the app actually exit.
  const [showExitHint, setShowExitHint] = useState(false);
  const navStateRef = useRef({ tab, hasStack: stack.length > 0 });
  navStateRef.current = { tab, hasStack: stack.length > 0 };

  useEffect(() => {
    window.history.pushState({ bondaGuard: true }, "");
    let exitArmed = false;
    let exitTimer;
    const onPopState = () => {
      if (backHandlerStack.length) {
        backHandlerStack[backHandlerStack.length - 1]();
        window.history.pushState({ bondaGuard: true }, "");
        return;
      }
      const { tab: curTab, hasStack } = navStateRef.current;
      if (hasStack) {
        setStack(s => s.slice(0, -1));
        window.history.pushState({ bondaGuard: true }, "");
        return;
      }
      if (curTab !== "home") {
        setTab("home");
        window.history.pushState({ bondaGuard: true }, "");
        return;
      }
      if (exitArmed) return; // second press in a row — let the app exit
      exitArmed = true;
      setShowExitHint(true);
      window.history.pushState({ bondaGuard: true }, "");
      exitTimer = setTimeout(() => { exitArmed = false; setShowExitHint(false); }, 2000);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      clearTimeout(exitTimer);
    };
  }, []);

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: T.canvas, fontFamily: T.fontBody, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: T.inkSoft, fontSize: 14, fontWeight: 700 }}>Loading…</p>
      </div>
    );
  }

  if (passwordRecovery) {
    return (
      <div style={{ minHeight: "100vh", background: T.canvas, fontFamily: T.fontBody, display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", position: "relative" }}>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <ResetPasswordScreen onDone={() => setPasswordRecovery(false)} />
      </div>
    );
  }

  if (!account) {
    return (
      <div style={{ minHeight: "100vh", background: T.canvas, fontFamily: T.fontBody, display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", position: "relative" }}>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <AuthScreen />
      </div>
    );
  }

  if (pendingPhone) {
    return (
      <div style={{ minHeight: "100vh", background: T.canvas, fontFamily: T.fontBody, display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", position: "relative" }}>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <PhoneCaptureScreen account={account} onDone={() => setPendingPhone(false)} />
      </div>
    );
  }

  if (!complianceChecked) {
    return (
      <div style={{ minHeight: "100vh", background: T.canvas, fontFamily: T.fontBody, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: T.inkSoft, fontSize: 14, fontWeight: 700 }}>Loading…</p>
      </div>
    );
  }

  if (!complianceAgreed) {
    return (
      <div style={{ minHeight: "100vh", background: T.canvas, fontFamily: T.fontBody, display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", position: "relative" }}>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <LegalHub mandatory onAgree={agreeToCompliance} />
      </div>
    );
  }

  const push = (screen) => setStack(s => [...s, screen]);
  const pop = () => setStack(s => s.slice(0, -1));
  const current = stack[stack.length - 1];

  const TITLES = {
    home: "Bonda ◎",
    mychild: "My Child",
    schedule: "Schedule",
    community: "Community",
    subsidies: "Support Directory",
    subsidiesGrants: "Subsidies & Grants",
    sos: "Emergency Contacts",
    devGuide: "Development & Behaviour Guide",
    addChild: "Add a Child",
    editChild: "Edit Profile",
    editProfile: "Edit User Profile",
    emotionsGuide: "Emotions & Behaviour",
    carerLetter: "Foster Carer Letter",
    documents: "Documents",
    legalHub: "Legal & Privacy",
  };

  const pageTitle = current ? TITLES[current] || "" : TITLES[tab];

  const renderMain = () => {
    switch (tab) {
      case "home":      return <HomeScreen childCtx={childCtx} setTab={setTab} push={push} account={account} />;
      case "mychild":   return <MyChildScreen childCtx={childCtx} push={push} />;
      case "schedule":  return <ScheduleScreen childCtx={childCtx} push={push} />;
      case "community": return <CommunityScreen account={account} />;
      default:          return null;
    }
  };

  const renderStack = () => {
    if (!current) return null;
    switch (current) {
      case "subsidies":  return <SupportDirectory />;
      case "subsidiesGrants": return <SubsidiesScreen pop={pop} account={account} />;
      case "sos":        return <SOSScreen pop={pop} account={account} />;
      case "devGuide":   return <DevelopmentGuideScreen />;
      case "addChild":   return <AddChildScreen childCtx={childCtx} pop={pop} />;
      case "editChild":  return <EditChildScreen childCtx={childCtx} pop={pop} />;
      case "editProfile": return <EditProfileScreen account={account} pop={pop} push={push} />;
      case "fosterHub":   return <FosterHubScreen pop={pop} push={push} />;
      case "carerLetter": return <CarerLetterScreen pop={pop} push={push} childCtx={childCtx} account={account} />;
      case "documents":   return <DocumentsScreen pop={pop} push={push} childCtx={childCtx} account={account} />;
      case "emotionsGuide": return <EmotionsBehavioursScreen pop={pop} />;
      case "legalHub":    return <LegalHub onBack={pop} />;
      default:           return null;
    }
  };

  const profileMenu = (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <button onClick={() => setShowMenu(v => !v)} title="Menu" style={{ width: "clamp(26px, 7vw, 30px)", height: "clamp(26px, 7vw, 30px)", borderRadius: "50%", border: "none", background: "none", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="3.5" r="1.6" fill={T.purple}/>
          <circle cx="9" cy="9" r="1.6" fill={T.purple}/>
          <circle cx="9" cy="14.5" r="1.6" fill={T.purple}/>
        </svg>
      </button>
      {showMenu && (
        <>
          <style>{`
            .bonda-macct-item{transition:background .15s,color .15s;}
            .bonda-macct-item:hover{background:${T.purpleL};}
            .bonda-macct-item:hover span,.bonda-macct-item:hover svg *{color:${T.purple} !important;stroke:${T.purple} !important;}
            .bonda-macct-item.danger:hover{background:${T.redL};}
            .bonda-macct-item.danger:hover span,.bonda-macct-item.danger:hover svg *{color:${T.red} !important;stroke:${T.red} !important;}
          `}</style>
          <div onClick={() => setShowMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 150 }} />
          <div style={{ position: "absolute", top: 36, right: 0, background: T.surface, borderRadius: T.rL, boxShadow: "0 18px 44px rgba(35,32,28,.18)", border: `1px solid ${T.border}`, width: 238, padding: 8, zIndex: 151, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 8px 10px" }}>
              <ComAvatar value={account.avatar} size={38} active={true} borderColor={T.purpleL} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{account?.name || "Your account"}</div>
                <div style={{ fontSize: 11.5, color: T.inkMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{account?.email || ""}</div>
              </div>
            </div>
            <div style={{ height: 1, background: T.border, margin: "4px 4px" }} />
            {[
              { key: "profile", label: "Profile", onClick: () => { setShowMenu(false); push("editProfile"); }, icon: <><circle cx="12" cy="8" r="4" stroke={T.inkSoft} strokeWidth="1.8" fill="none"/><path d="M5 20c0-4 3.1-6.4 7-6.4s7 2.4 7 6.4" stroke={T.inkSoft} strokeWidth="1.8" strokeLinecap="round" fill="none"/></> },
              { key: "notifications", label: "Notifications", soon: true, icon: <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke={T.inkSoft} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M13.7 21a2 2 0 0 1-3.4 0" stroke={T.inkSoft} strokeWidth="1.8" strokeLinecap="round" fill="none"/></> },
              { key: "security", label: "Security", soon: true, icon: <><path d="M12 3l7 3v5c0 4.6-3 7.6-7 9-4-1.4-7-4.4-7-9V6Z" stroke={T.inkSoft} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="m9 12 2 2 4-4" stroke={T.inkSoft} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></> },
              { key: "payment", label: "Payment & plans", soon: true, icon: <><rect x="3" y="6" width="18" height="12" rx="2.6" stroke={T.inkSoft} strokeWidth="1.8" fill="none"/><path d="M3 10h18" stroke={T.inkSoft} strokeWidth="1.8" fill="none"/></> },
              { key: "help", label: "Help", soon: true, icon: <><circle cx="12" cy="12" r="9" stroke={T.inkSoft} strokeWidth="1.8" fill="none"/><path d="M9.6 9.5a2.4 2.4 0 1 1 3.4 2.2c-.9.4-1.5 1-1.5 2M12 17h.01" stroke={T.inkSoft} strokeWidth="1.8" strokeLinecap="round" fill="none"/></> },
            ].map(m => (
              <button key={m.key} className="bonda-macct-item" onClick={m.onClick || (() => setShowMenu(false))} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 10, borderRadius: 10, background: "none", border: "none", cursor: "pointer", fontFamily: T.fontBody, textAlign: "left" }}>
                <svg width="19" height="19" viewBox="0 0 24 24">{m.icon}</svg>
                <span style={{ fontSize: 14, fontWeight: 500, color: T.ink }}>{m.label}</span>
                {m.soon && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: T.inkMuted, letterSpacing: "0.03em" }}>Soon</span>}
              </button>
            ))}
            <div style={{ height: 1, background: T.border, margin: "4px 4px" }} />
            <button className="bonda-macct-item danger" onClick={() => { setShowMenu(false); forceSignOut(); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 10, borderRadius: 10, background: "none", border: "none", cursor: "pointer", fontFamily: T.fontBody, textAlign: "left" }}>
              <svg width="19" height="19" viewBox="0 0 18 18" fill="none">
                <path d="M7 3 H4 a1 1 0 0 0 -1 1 v10 a1 1 0 0 0 1 1 h3" stroke={T.red} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M11.5 12.5 L15 9 L11.5 5.5" stroke={T.red} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M15 9 H6.5" stroke={T.red} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.red }}>Logout</span>
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.canvas, fontFamily: T.fontBody, display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />


      {(current || tab !== "home") ? (
        <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "10px 18px", position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => current ? pop() : setTab("home")} title="Back" style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: T.purpleL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
              <path d="M11 3.5 L5 9 L11 14.5" stroke={T.purple} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </button>

          <p style={{ flex: 1, margin: 0, fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 600, color: T.ink, letterSpacing: "-0.01em" }}>
            {pageTitle}
          </p>

          {profileMenu}
        </div>
      ) : (
        <div style={{ background: T.canvas, padding: "14px 18px 0" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            {profileMenu}
          </div>
        </div>
      )}


      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
        {current ? renderStack() : renderMain()}
      </div>


      {!current && (
        <div style={{ background: T.surface, borderTop: `1px solid ${T.border}`, padding: "10px 0 16px", position: "sticky", bottom: 0, zIndex: 100 }}>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            {NAV.map(n => {
              const disabled = n.id === "schedule" && childCtx.activeChild && !childCtx.activeChild.active;
              return (
                <button key={n.id} onClick={() => { if (!disabled) setTab(n.id); }} disabled={disabled} title={disabled ? `${childCtx.activeChild.name}'s profile is pending admin approval` : undefined} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, fontFamily: T.fontBody, padding: "4px 14px", borderRadius: T.r, transition: "all 0.15s" }}>
                  <NavMark id={n.id} active={tab === n.id} />
                  <span style={{ fontSize: 10, fontWeight: tab === n.id ? 800 : 600, color: tab === n.id ? T.purple : T.inkMuted, letterSpacing: "0.02em" }}>{n.label}</span>
                  {tab === n.id && <div style={{ width: 20, height: 2.5, borderRadius: 99, background: T.purple, marginTop: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showExitHint && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: T.ink, color: "white", padding: "10px 20px", borderRadius: 99, fontSize: 13, fontWeight: 700, boxShadow: T.shadowM, zIndex: 200, whiteSpace: "nowrap" }}>
          Press again to exit
        </div>
      )}
    </div>
  );
}
