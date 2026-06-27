import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge, Btn, Input, TextArea, Avatar, Accordion, PageHero, AvatarIllustrations, ChildAvatar, ComAvatar, ROOM_ICONS, ACTIVITY_TEXTAREA_STYLE, ActionIllustration, HeroIllustration } from "../ui";
import { CHILD_AVATARS, DEFAULT_CHILDREN, DEFAULT_SCHEDULE, ROOM_COLORS, SOS_COLORS, VERBAL_STATUS_OPTIONS } from "../data";

export const QUOTES = [
  { q: "You are not failing. You are learning a language no one taught you.", a: "For every autism parent" },
  { q: "Every time your child feels safe, you built that.", a: "Occupational Therapy wisdom" },
  { q: "Progress in autism is measured in moments, not milestones.", a: "ASD Family Research" },
  { q: "You didn't choose an easy road. You chose your child.", a: "For caregivers on hard days" },
  { q: "Rest is not giving up. A rested parent is the most effective therapy.", a: "Caregiver wellbeing research" },
  { q: "You have gotten through every hard day so far. That's 100%.", a: "For the exhausted parent" },
  { q: "Your child may not say 'I love you' the way you expect. But they feel it every time you stay.", a: "Attachment research, ASD" },
  { q: "The days you feel you're getting nowhere are often the days the most is being planted.", a: "For parents in the hard season" },
  { q: "Small consistent moments of connection are more powerful than any therapy session.", a: "Developmental neuroscience" },
  { q: "Burnout is not weakness. It is what happens when someone cares deeply for a very long time.", a: "Caregiver mental health research" },
  { q: "Your child does not need you to have all the answers. They need you to keep showing up.", a: "For parents who feel lost" },
  { q: "Every autistic child is different. Bonda gives you frameworks, not prescriptions. You know your child best.", a: "Norena Darsana · Bonda" },
];
//  COMMUNITY / CHAT STORAGE

export function HomeScreen({ childCtx, setTab, push, account }) {
  const { children, activeChild, switchChild } = childCtx;
  const [quotes, setQuotes] = useState(QUOTES);
  const [qIdx, setQIdx] = useState(0);
  const [seen, setSeen] = useState([]);
  const [fade, setFade] = useState(true);
  const [paused, setPaused] = useState(false);

  const loadQuotes = async () => {
    const { data } = await supabase.from("parent_quotes").select("*").order("sort_order").order("created_at");
    if (data?.length) {
      setQuotes(data.map(r => ({ id: r.id, q: r.quote, a: r.author })));
      setQIdx(Math.floor(Math.random() * data.length));
      setSeen([]);
    }
  };

  useEffect(() => { loadQuotes(); }, []);

  useEffect(() => {
    if (paused || quotes.length < 2) return;
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setQIdx(prev => {
          const newSeen = [...seen, prev];
          const pool = quotes.map((_, i) => i).filter(i => !newSeen.includes(i));
          const next = pool.length ? pool[Math.floor(Math.random() * pool.length)] : Math.floor(Math.random() * quotes.length);
          setSeen(pool.length ? newSeen : [prev]);
          return next;
        });
        setFade(true);
      }, 300);
    }, 6000);
    return () => clearInterval(t);
  }, [paused, seen, qIdx, quotes]);

  const q = quotes[qIdx] || quotes[0];

  const isFoster = activeChild?.caregiverType === "foster";

  const quickActions = [
    ...(isFoster ? [{ type: "foster", label: "Foster Parent Hub", desc: "HealthHub, CDA, school access guides", action: () => push("fosterHub"), isFoster: true }] : []),
    { type: "subsidies", label: "Subsidies & Grants", desc: "Singapore financial aid guide", action: () => push("subsidies") },
    { type: "sos", label: "Emergency Contacts", desc: "Singapore autism helplines", action: () => push("sos") },
    { type: "activities", label: "Activity Guide", desc: "Research-backed home therapy", action: () => push("activities") },
    { type: "training", label: "Behaviour Training", desc: "Teaching good behaviours", action: () => push("training") },
    { type: "emotions", label: "Emotion & Behaviour", desc: "Understand feelings & behaviours", action: () => push("emotionsGuide") },
  ];

  return (
    <Page>

      <div style={{ marginBottom: 24 }}>
        {children.length === 0 ? (
          <Card style={{ background: T.purpleL, border: `1.5px dashed ${T.purple}40`, padding: "20px 18px" }}>
            <HeroIllustration />
            <p style={{ margin: "0 0 4px", fontWeight: 800, color: T.purple, fontSize: 16 }}>Welcome to Bonda ◎</p>
            <p style={{ margin: "0 0 16px", color: T.inkSoft, fontSize: 13, lineHeight: 1.65 }}>Add your child's profile to get started with personalised schedules and emotion tracking.</p>
            <Btn onClick={() => push("addChild")} full>+ Add a Child Profile</Btn>
          </Card>
        ) : (
          <div>
            <SectionLabel action={<button onClick={() => push("addChild")} style={{ background: "none", border: "none", color: T.purple, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody }}>+ Add child</button>}>My Children</SectionLabel>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
              {children.map(c => (
                <div key={c.id} onClick={() => switchChild(c.id)} style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <div style={{ transition: "all 0.2s" }}>
                    <ChildAvatar value={c.emoji} size={52} active={activeChild?.id === c.id} borderColor={activeChild?.id === c.id ? T.purple : "transparent"} />
                  </div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: activeChild?.id === c.id ? 800 : 600, color: activeChild?.id === c.id ? T.purple : T.inkMuted, whiteSpace: "nowrap" }}>{c.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


      {activeChild && (
        <Card style={{ marginBottom: 24, background: "#0A2218", border: "none", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, opacity: 0.06 }}>
            <svg viewBox="0 0 80 80" width="80" height="80" style={{ position: "absolute", right: -10, top: -10 }}>
              <circle cx="60" cy="40" r="50" fill="#1D9E75"/>
            </svg>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
            <ChildAvatar value={activeChild.emoji} size={52} active={true} borderColor="rgba(255,255,255,0.15)" />
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 2px", color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Active child</p>
              <p style={{ margin: 0, color: "white", fontSize: 18, fontWeight: 800 }}>{activeChild.name}</p>
            </div>
            <button onClick={() => setTab("mychild")} title="Edit profile" style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M11.5 2.5 L15.5 6.5 L6 16 L2 16.5 L2.5 12.5 Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
              </svg>
            </button>
            <button onClick={() => { if (activeChild.active) setTab("schedule"); }} disabled={!activeChild.active} title={!activeChild.active ? `${activeChild.name}'s profile is pending admin approval` : undefined} style={{ background: activeChild.active ? T.purple : "rgba(255,255,255,0.12)", color: activeChild.active ? "white" : "rgba(255,255,255,0.4)", border: "none", borderRadius: T.r, padding: "8px 14px", fontWeight: 700, fontSize: 12, cursor: activeChild.active ? "pointer" : "not-allowed", fontFamily: T.fontBody }}>Schedule →</button>
          </div>
        </Card>
      )}


      <SectionLabel style={{ marginBottom: 10 }}>Quick Access</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
        {quickActions.map((a, i) => (
          <Card key={i} onClick={a.action} style={{ padding: "14px 14px" }}>
            <div style={{ marginBottom: 10 }}>
              <ActionIllustration type={a.type} size={44} />
            </div>
            <p style={{ margin: "0 0 3px", fontWeight: 800, color: T.ink, fontSize: 13 }}>{a.label}</p>
            <p style={{ margin: 0, color: T.inkMuted, fontSize: 11, lineHeight: 1.4 }}>{a.desc}</p>
          </Card>
        ))}
      </div>


      <SectionLabel style={{ marginBottom: 10 }}>💛 For You, Parent</SectionLabel>
      {q && (
        <div
          style={{ background: T.ink, borderRadius: T.rL, padding: 22, cursor: "pointer" }}
          onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)}
        >
          <div style={{ opacity: fade ? 1 : 0, transition: "opacity 0.3s", minHeight: 80 }}>
            <p style={{ color: "white", fontSize: 15, fontWeight: 600, lineHeight: 1.75, margin: "0 0 10px", fontStyle: "italic" }}>"{q.q}"</p>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, margin: 0 }}>— {q.a}</p>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "14px 0 12px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Auto-advances · Tap to pause</p>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: paused ? T.amber : T.green }} />
          </div>
        </div>
      )}

      <div style={{ marginTop: 16, padding: "14px 16px", background: T.greenL, borderRadius: T.r, border: `1px solid ${T.green}25` }}>
        <p style={{ margin: 0, color: T.green, fontSize: 12, fontWeight: 700, lineHeight: 1.7 }}>1 in 150 children in Singapore is autistic. Government subsidies can reduce early intervention costs by 30–70%. Tap <strong>Subsidies</strong> above to find out what you qualify for.</p>
      </div>

      <p style={{ textAlign: "center", marginTop: 28, marginBottom: 0, color: T.inkMuted, fontSize: 10, fontWeight: 600, letterSpacing: "0.05em" }}>◎ Bonda · Made with 💛 by Norena Darsana</p>
    </Page>
  );
}
