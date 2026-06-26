import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge, Btn, Input, TextArea, Avatar, Accordion, PageHero, AvatarIllustrations, ChildAvatar, ComAvatar, ROOM_ICONS, ACTIVITY_TEXTAREA_STYLE, ActionIllustration, HeroIllustration } from "../ui";
import { CHILD_AVATARS, DEFAULT_CHILDREN, DEFAULT_SCHEDULE, ROOM_COLORS, SOS_COLORS, VERBAL_STATUS_OPTIONS } from "../data";

export const RuleIcon = ({ type }) => {
  const isGood = type === "good";
  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: isGood ? T.greenL : T.redL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${isGood ? T.green : T.red}20` }}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        {isGood ? (
          <>
            <circle cx="9" cy="9" r="7" stroke={T.green} strokeWidth="1.4" fill={T.green} fillOpacity="0.12"/>
            <path d="M5.5 9 L7.5 11 L12.5 6.5" stroke={T.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </>
        ) : (
          <>
            <circle cx="9" cy="9" r="7" stroke={T.red} strokeWidth="1.4" fill={T.red} fillOpacity="0.1"/>
            <path d="M6.5 9 L11.5 9" stroke={T.red} strokeWidth="1.8" strokeLinecap="round"/>
          </>
        )}
      </svg>
    </div>
  );
};

export const MethodIcon = ({ idx, color }) => {
  const shapes = [
    <polygon points="9,3 11,7 15,7 12,10 13.5,14.5 9,12 4.5,14.5 6,10 3,7 7,7" fill={color} opacity="0.8"/>,
    <><rect x="3" y="5" width="12" height="9" rx="2.5" stroke={color} strokeWidth="1.4" fill={color} fillOpacity="0.12"/><rect x="5" y="8" width="8" height="1.5" rx="0.75" fill={color}/><rect x="5" y="10.5" width="5" height="1.5" rx="0.75" fill={color} opacity="0.6"/></>,
    <><path d="M3 13 Q6 5 9 7 Q12 9 15 3" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="7" r="2" fill={color} opacity="0.7"/></>,
    <><rect x="4" y="10" width="2.5" height="5" rx="1" fill={color}/><rect x="7.75" y="7" width="2.5" height="8" rx="1" fill={color} opacity="0.8"/><rect x="11.5" y="4" width="2.5" height="11" rx="1" fill={color} opacity="0.6"/></>,
    <><circle cx="9" cy="9" r="6.5" stroke={color} strokeWidth="1.4" fill="none"/><path d="M9 5.5 L9 9.5" stroke={color} strokeWidth="1.6" strokeLinecap="round"/><circle cx="9" cy="12" r="1" fill={color}/></>,
  ];
  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${color}20` }}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">{shapes[idx] || shapes[0]}</svg>
    </div>
  );
};

export function TrainingScreen({ pop, account }) {
  const [env, setEnv] = useState("home");
  const [view, setView] = useState("rules");
  const [openRule, setOpenRule] = useState(null);
  const [openMethod, setOpenMethod] = useState(null);
  const [rules, setRules] = useState([]);
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTraining = async () => {
    setLoading(true);
    const [{ data: r }, { data: m }] = await Promise.all([
      supabase.from("training_rules").select("*").order("sort_order").order("created_at"),
      supabase.from("training_methods").select("*").order("sort_order").order("created_at"),
    ]);
    setRules(r || []);
    setMethods(m || []);
    setLoading(false);
  };

  useEffect(() => { loadTraining(); }, []);

  const ruleList = (e, type) => rules.filter(r => r.env === e && r.type === type);

  const renderRuleGroup = (type, color, colorL, label, icon) => (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: colorL, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {ruleList(env, type).map((r) => {
          const key = `${type}${r.id}`;
          const isOpen = openRule === key;
          return (
            <Card key={r.id} onClick={() => setOpenRule(isOpen ? null : key)} style={{ background: isOpen ? colorL : T.surface, border: `1px solid ${isOpen ? color + "30" : T.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <RuleIcon type={type === "good" ? "good" : "bad"} />
                <p style={{ flex: 1, margin: 0, fontWeight: 700, color: T.ink, fontSize: 14 }}>{r.label}</p>
                <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 18, transform: isOpen ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block" }}>+</span>
              </div>
              {isOpen && (
                <div style={{ margin: "12px 0 0 48px", padding: "10px 12px", background: T.surface, borderRadius: T.r }}>
                  <p style={{ margin: 0, color: T.inkSoft, fontSize: 13, lineHeight: 1.7 }}>{r.how}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );

  return (
    <Page>
      <h2 style={{ margin: "0 0 12px", color: T.ink, fontSize: 22, fontWeight: 800 }}>Behaviour Training</h2>
      <p style={{ margin: "0 0 20px", color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Research-backed strategies to help your child learn what's expected — at home and at school.</p>


      <div style={{ display: "flex", background: T.border, borderRadius: T.r, padding: 3, gap: 3, marginBottom: 20 }}>
        {[["rules","Rules"],["methods","How to Teach"]].map(([v, l]) => (
          <button key={v} onClick={() => setView(v)} style={{ flex: 1, padding: "10px", borderRadius: 9, background: view === v ? T.surface : "transparent", border: "none", fontWeight: 700, fontSize: 13, color: view === v ? T.purple : T.inkMuted, cursor: "pointer", fontFamily: T.fontBody, boxShadow: view === v ? T.shadow : "none", transition: "all 0.2s" }}>{l}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ margin: 0, color: T.inkSoft, fontSize: 13 }}>Loading...</p>
      ) : view === "rules" ? (
        <>

          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {["home","school"].map(e => (
              <button key={e} onClick={() => { setEnv(e); setOpenRule(null); setEditingRule(null); }} style={{ flex: 1, padding: "10px 14px", borderRadius: T.r, border: `1.5px solid ${env === e ? T.purple : T.border}`, background: env === e ? T.purpleL : T.surface, fontWeight: 700, fontSize: 13, color: env === e ? T.purple : T.inkMuted, cursor: "pointer", fontFamily: T.fontBody, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  {e === "home"
                    ? <><path d="M1 6L7 1.5L13 6V13H9.5V9H4.5V13H1V6Z" stroke={env === e ? T.purple : T.inkMuted} strokeWidth="1.3" strokeLinejoin="round" fill={env === e ? T.purple : "none"} fillOpacity={env === e ? 0.15 : 0}/></>
                    : <><rect x="1" y="5" width="12" height="8" rx="1.5" stroke={env === e ? T.purple : T.inkMuted} strokeWidth="1.3" fill={env === e ? T.purple : "none"} fillOpacity={env === e ? 0.15 : 0}/><path d="M4 5V3.5C4 2.4 5.8 1.5 7 1.5C8.2 1.5 10 2.4 10 3.5V5" stroke={env === e ? T.purple : T.inkMuted} strokeWidth="1.3" strokeLinecap="round"/></>
                  }
                </svg>
                {e === "home" ? "Home" : "School"}
              </button>
            ))}
          </div>

          {renderRuleGroup("good", T.green, T.greenL, "Encourage", <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke={T.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>)}
          {renderRuleGroup("bad", T.red, T.redL, "Redirect", <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 5H7" stroke={T.red} strokeWidth="1.8" strokeLinecap="round"/></svg>)}

          <div style={{ marginTop: 16, padding: "12px 14px", background: T.amberL, borderRadius: T.r, border: `1px solid ${T.amber}20`, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: T.amber, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 3V5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><circle cx="5" cy="7.5" r="0.8" fill="white"/></svg>
            </div>
            <p style={{ margin: 0, color: T.amber, fontWeight: 700, fontSize: 13, lineHeight: 1.7 }}>Never use punishment, shame, or time-outs. Always show what to do instead of just saying "no".</p>
          </div>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {methods.map((m, i) => {
            const color = ROOM_COLORS[m.color_key]?.color || T.purple;
            const isOpen = openMethod === m.id;
            return (
            <Card key={m.id} style={{ padding: 0, overflow: "hidden" }}>
              <div onClick={() => setOpenMethod(isOpen ? null : m.id)} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: isOpen ? color + "08" : T.surface }}>
                <MethodIcon idx={i} color={color} />
                <p style={{ flex: 1, margin: 0, fontWeight: 700, color: T.ink, fontSize: 14 }}>{m.title}</p>
                <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 18, transform: isOpen ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block" }}>+</span>
              </div>
              {isOpen && (
                <div style={{ padding: "0 16px 16px" }}>
                  <p style={{ margin: "0 0 12px", color: T.inkSoft, fontSize: 13, lineHeight: 1.7 }}>{m.body}</p>
                  <div style={{ background: color + "12", borderRadius: T.r, padding: "10px 12px", border: `1px solid ${color}20`, display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <p style={{ margin: 0, color, fontWeight: 700, fontSize: 12, lineHeight: 1.6 }}>{m.tip}</p>
                  </div>
                </div>
              )}
            </Card>
            );
          })}
        </div>
      )}
    </Page>
  );
}
//  ROOT APP — 4-tab nav + push stack for secondary screens
