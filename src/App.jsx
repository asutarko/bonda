import { useState, useEffect, useRef } from "react";
import { supabase } from "./lib/supabase";
import { T } from "./theme";
import { NavMark, ComAvatar } from "./ui";
import { useChildren, useBackHandler, backHandlerStack, accountFromUser, forceSignOut } from "./hooks";
import { FosterHubScreen } from "./screens/FosterHubScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { MyChildScreen } from "./screens/MyChildScreen";
import { AddChildScreen, EditChildScreen } from "./screens/onboarding";
import { ScheduleScreen } from "./screens/ScheduleScreen";
import { AuthScreen, ResetPasswordScreen } from "./screens/AuthScreen";
import { CommunityScreen } from "./screens/CommunityScreen";
import { SubsidiesScreen } from "./screens/SubsidiesScreen";
import { SOSScreen } from "./screens/SOSScreen";
import { ActivitiesScreen } from "./screens/ActivitiesScreen";
import { TrainingScreen } from "./screens/TrainingScreen";
import { EmotionsBehavioursScreen } from "./screens/EmotionsBehavioursGuide";
import { EditProfileScreen } from "./screens/ProfileScreen";

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

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setAccount(accountFromUser(data.session?.user));
      setAuthLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
      setAccount(accountFromUser(session?.user));
      setAuthLoading(false);
    });
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

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
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <ResetPasswordScreen onDone={() => setPasswordRecovery(false)} />
      </div>
    );
  }

  if (!account) {
    return (
      <div style={{ minHeight: "100vh", background: T.canvas, fontFamily: T.fontBody, display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", position: "relative" }}>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <AuthScreen />
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
    subsidies: "Subsidies & Aid",
    sos: "Emergency Contacts",
    activities: "Activity Guide",
    training: "Behaviour Training",
    addChild: "Add a Child",
    editChild: "Edit Profile",
    editProfile: "Edit User Profile",
    emotionsGuide: "Emotions & Behaviour",
  };

  const pageTitle = current ? TITLES[current] || "" : TITLES[tab];

  const renderMain = () => {
    switch (tab) {
      case "home":      return <HomeScreen childCtx={childCtx} setTab={setTab} push={push} account={account} />;
      case "mychild":   return <MyChildScreen childCtx={childCtx} />;
      case "schedule":  return <ScheduleScreen childCtx={childCtx} push={push} />;
      case "community": return <CommunityScreen account={account} />;
      default:          return null;
    }
  };

  const renderStack = () => {
    if (!current) return null;
    switch (current) {
      case "subsidies":  return <SubsidiesScreen pop={pop} account={account} />;
      case "sos":        return <SOSScreen pop={pop} account={account} />;
      case "activities": return <ActivitiesScreen pop={pop} account={account} />;
      case "training":   return <TrainingScreen pop={pop} account={account} />;
      case "addChild":   return <AddChildScreen childCtx={childCtx} pop={pop} />;
      case "editChild":  return <EditChildScreen childCtx={childCtx} pop={pop} />;
      case "editProfile": return <EditProfileScreen account={account} pop={pop} />;
      case "fosterHub":   return <FosterHubScreen pop={pop} />;
      case "emotionsGuide": return <EmotionsBehavioursScreen pop={pop} />;
      default:           return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.canvas, fontFamily: T.fontBody, display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />


      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "10px 18px 0", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10 }}>

          <img
            src="/assets/images/3D - Logo - Green.png"
            alt="Bonda"
            onClick={() => current ? pop() : setTab("home")}
            style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0, cursor: "pointer" }}
          />

          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: T.purple, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Bonda</p>
            <p style={{ margin: 0, fontSize: 9, color: T.inkMuted, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>by Norena Darsana</p>
          </div>

          {pageTitle !== "Bonda ◎" && pageTitle && (
            <div style={{ background: T.purpleL, borderRadius: 99, padding: "4px 12px", flexShrink: 0, border: `1px solid ${T.purple}20` }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: T.purple }}>
                {pageTitle.replace(/[◎💰🆘🎯⭐🧠📋💬]/g, "").trim()}
              </p>
            </div>
          )}

          <button onClick={() => push("editProfile")} title="Edit profile" style={{ width: 30, height: 30, borderRadius: "50%", border: "none", padding: 0, background: "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
            <ComAvatar value={account.avatar} size={30} active={true} borderColor={T.purpleL} />
          </button>

          <button onClick={forceSignOut} title="Sign out" style={{ width: 30, height: 30, borderRadius: "50%", background: T.purpleL, border: "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
              <path d="M7 3 H4 a1 1 0 0 0 -1 1 v10 a1 1 0 0 0 1 1 h3" stroke={T.purple} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M11.5 12.5 L15 9 L11.5 5.5" stroke={T.purple} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M15 9 H6.5" stroke={T.purple} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            </svg>
          </button>
        </div>

        <div style={{ height: 2.5, background: T.purple, width: 34, borderRadius: 99, marginBottom: 0, opacity: 0.35 }} />
      </div>


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
