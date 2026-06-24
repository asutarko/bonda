import { useState } from "react";
import { T } from "./theme";

export const ActionIllustration = ({ type, size = 44 }) => {
  const bg = { subsidies: "#FEF3C7", sos: "#FEE2E2", activities: "#DCFCE7", training: "#EDE9FE" };
  const illustrations = {
    foster: (
      <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: "block" }}>
        <rect width="80" height="80" rx="14" fill="#EDE9FE"/>

        <path d="M40 58 C40 58 18 44 18 30 C18 22 24 17 30 17 C34 17 37 19 40 23 C43 19 46 17 50 17 C56 17 62 22 62 30 C62 44 40 58 40 58Z" stroke="#5B3FEE" strokeWidth="2" fill="#5B3FEE" fillOpacity="0.15"/>

        <circle cx="34" cy="34" r="5" fill="#5B3FEE" opacity="0.7"/>
        <circle cx="46" cy="34" r="4" fill="#5B3FEE" opacity="0.5"/>
        <rect x="38" y="56" width="4" height="8" rx="2" fill="#5B3FEE" opacity="0.3"/>
      </svg>
    ),
    subsidies: (
      <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: "block" }}>
        <rect width="80" height="80" rx="14" fill="#FEF3C7"/>
        <circle cx="40" cy="38" r="20" fill="#D97706" opacity="0.2"/>
        <circle cx="40" cy="38" r="12" fill="#D97706" opacity="0.35"/>
        <text x="40" y="43" textAnchor="middle" fontSize="16" fontWeight="700" fill="#92400E" fontFamily="system-ui">$</text>
        <rect x="18" y="60" width="44" height="3" rx="1.5" fill="#D97706" opacity="0.25"/>
        <rect x="28" y="66" width="24" height="3" rx="1.5" fill="#D97706" opacity="0.15"/>
      </svg>
    ),
    sos: (
      <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: "block" }}>
        <rect width="80" height="80" rx="14" fill="#FEE2E2"/>
        <circle cx="40" cy="36" r="18" fill="#DC2626" opacity="0.15"/>
        <rect x="36" y="22" width="8" height="18" rx="4" fill="#DC2626"/>
        <rect x="36" y="44" width="8" height="8" rx="4" fill="#DC2626"/>
        <rect x="16" y="58" width="48" height="3" rx="1.5" fill="#DC2626" opacity="0.2"/>
      </svg>
    ),
    activities: (
      <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: "block" }}>
        <rect width="80" height="80" rx="14" fill="#DCFCE7"/>
        <rect x="18" y="46" width="8" height="18" rx="3" fill="#065F46"/>
        <rect x="30" y="36" width="8" height="28" rx="3" fill="#16A34A"/>
        <rect x="42" y="26" width="8" height="38" rx="3" fill="#065F46"/>
        <rect x="54" y="34" width="8" height="30" rx="3" fill="#D97706"/>
        <circle cx="22" cy="44" r="4" fill="#F2FAF6"/>
        <circle cx="34" cy="34" r="4" fill="#F2FAF6"/>
        <circle cx="46" cy="24" r="4" fill="#F2FAF6"/>
        <circle cx="58" cy="32" r="4" fill="#D97706"/>
        <path d="M22 44 Q34 26 46 24 Q52 23 58 32" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 3"/>
      </svg>
    ),
    training: (
      <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: "block" }}>
        <rect width="80" height="80" rx="14" fill="#EDE9FE"/>
        <rect x="20" y="20" width="40" height="30" rx="7" fill="#0A2218"/>
        <rect x="25" y="25" width="30" height="20" rx="5" fill="#065F46"/>
        <rect x="30" y="31" width="20" height="3" rx="1.5" fill="#1D9E75"/>
        <rect x="30" y="37" width="14" height="2.5" rx="1.25" fill="#1D9E75" opacity="0.5"/>
        <path d="M40 50 L34 60 L46 60 Z" fill="#0A2218"/>
        <circle cx="28" cy="64" r="7" fill="#1D9E75" opacity="0.7"/>
        <circle cx="40" cy="67" r="7" fill="#065F46"/>
        <circle cx="52" cy="64" r="7" fill="#D97706" opacity="0.6"/>
      </svg>
    ),
    emotions: (
      <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: "block" }}>
        <rect width="80" height="80" rx="14" fill="#CCFBF1"/>
        <circle cx="38" cy="40" r="20" fill="#0D9488" opacity="0.18"/>
        <circle cx="31" cy="36" r="3.5" fill="#0D9488"/>
        <circle cx="45" cy="36" r="3.5" fill="#0D9488"/>
        <path d="M28 48 Q38 57 48 48" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <circle cx="58" cy="22" r="7" fill="#D97706" opacity="0.75"/>
        <path d="M55 22h6M58 19v6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  };
  return illustrations[type] || null;
};

// Hero illustration for home screen when no child added yet

export const HeroIllustration = () => (
  <svg width="100%" viewBox="0 0 320 140" style={{ display: "block", marginBottom: 16 }}>
    <circle cx="80" cy="70" r="50" fill="#065F46" opacity="0.08"/>
    <circle cx="80" cy="70" r="32" fill="#065F46" opacity="0.1"/>
    <rect x="100" y="22" width="140" height="96" rx="12" fill="#0A2218"/>
    <rect x="106" y="28" width="128" height="84" rx="9" fill="#065F46"/>
    <circle cx="148" cy="65" r="18" fill="#0A2218"/>
    <circle cx="148" cy="59" r="8" fill="#F2FAF6"/>
    <ellipse cx="148" cy="78" rx="12" ry="7" fill="#F2FAF6"/>
    <rect x="178" y="54" width="44" height="5" rx="2.5" fill="#1D9E75" opacity="0.7"/>
    <rect x="178" y="63" width="32" height="4" rx="2" fill="#1D9E75" opacity="0.4"/>
    <rect x="178" y="71" width="38" height="4" rx="2" fill="#1D9E75" opacity="0.3"/>
    <rect x="114" y="96" width="112" height="10" rx="5" fill="#1D9E75"/>
    <circle cx="46" cy="40" r="6" fill="#D97706"/>
    <circle cx="30" cy="90" r="4" fill="#065F46" opacity="0.3"/>
    <circle cx="284" cy="50" r="5" fill="#D97706" opacity="0.4"/>
    <circle cx="298" cy="90" r="9" fill="#065F46" opacity="0.15"/>
  </svg>
);

// Nav tab SVG marks — clean geometric, no emoji

export const NavMark = ({ id, active }) => {
  const col = active ? "#065F46" : "#7BA08A";
  const marks = {
    home: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 10.5L12 3l9 7.5V21H15v-5h-6v5H3V10.5z" stroke={col} strokeWidth="1.5" strokeLinejoin="round" fill={active ? "#065F46" : "none"} fillOpacity={active ? 0.15 : 0}/>
        <path d="M9 21v-5h6v5" stroke={col} strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    mychild: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={col} strokeWidth="1.5" fill={active ? "#065F46" : "none"} fillOpacity={active ? 0.15 : 0}/>
        <circle cx="12" cy="8" r="1.5" fill={col}/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={col} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="18" cy="7" r="3" fill={active ? "#D97706" : "#D97706"} fillOpacity={active ? 0.9 : 0.5}/>
        <path d="M17 7h2M18 6v2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    schedule: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="16" rx="3" stroke={col} strokeWidth="1.5" fill={active ? "#065F46" : "none"} fillOpacity={active ? 0.12 : 0}/>
        <path d="M8 3v4M16 3v4M3 10h18" stroke={col} strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="7" y="14" width="4" height="4" rx="1" fill={active ? "#065F46" : col} fillOpacity={active ? 0.7 : 0.3}/>
        <rect x="13" y="14" width="4" height="4" rx="1" fill={col} fillOpacity="0.2"/>
      </svg>
    ),
    community: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="9" r="3.5" stroke={col} strokeWidth="1.5" fill={active ? "#065F46" : "none"} fillOpacity={active ? 0.15 : 0}/>
        <circle cx="17" cy="8" r="2.5" stroke={col} strokeWidth="1.5" fill={active ? "#D97706" : "none"} fillOpacity={active ? 0.2 : 0}/>
        <path d="M2 19c0-3 3-5.5 7-5.5s7 2.5 7 5.5" stroke={col} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M17.5 13c2.5.5 4.5 2.3 4.5 5" stroke={col} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      </svg>
    ),
  };
  return marks[id] || null;
};
//  DESIGN SYSTEM
//  One set of tokens. Used everywhere. No exceptions.
//  Warm professional. Deep forest + living green + amber warmth.
//  "Trusted tapi hangat. Seperti ngobrol sama dokter anak yang baik hati."

export const Page = ({ children, style = {} }) => (
  <div style={{ padding: "20px 18px 32px", ...style }}>{children}</div>
);

// Universal section title

export const SectionLabel = ({ children, action, style = {} }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, ...style }}>
    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: T.inkMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{children}</p>
    {action}
  </div>
);

// Universal card

export const Card = ({ children, onClick, style = {}, accent }) => (
  <div
    onClick={onClick}
    style={{
      background: T.surface,
      borderRadius: T.r,
      boxShadow: T.shadow,
      border: `1px solid ${T.border}`,
      borderLeft: accent ? `3px solid ${accent}` : undefined,
      padding: "16px",
      cursor: onClick ? "pointer" : "default",
      transition: "transform 0.12s, box-shadow 0.12s",
      ...style,
    }}
    onMouseDown={e => onClick && (e.currentTarget.style.transform = "scale(0.987)")}
    onMouseUp={e => onClick && (e.currentTarget.style.transform = "scale(1)")}
    onTouchStart={e => onClick && (e.currentTarget.style.transform = "scale(0.987)")}
    onTouchEnd={e => onClick && (e.currentTarget.style.transform = "scale(1)")}
  >
    {children}
  </div>
);

// Universal pill badge

export const Badge = ({ children, color = T.purple, bg }) => (
  <span style={{ fontSize: 10, fontWeight: 700, color, background: bg || color + "18", padding: "3px 8px", borderRadius: 99, letterSpacing: "0.04em" }}>{children}</span>
);

// Primary button

export const Btn = ({ children, onClick, disabled, full, secondary, danger, style = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      width: full ? "100%" : undefined,
      padding: "13px 20px",
      borderRadius: T.r,
      border: "none",
      fontFamily: T.fontBody,
      fontWeight: 700,
      fontSize: 14,
      cursor: disabled ? "default" : "pointer",
      transition: "opacity 0.15s",
      opacity: disabled ? 0.45 : 1,
      background: danger ? T.red : secondary ? T.purpleL : T.purple,
      color: secondary ? T.purple : "white",
      ...style,
    }}
  >{children}</button>
);

// Text input

export const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: T.inkSoft }}>{label}</p>}
    <input
      {...props}
      style={{
        width: "100%",
        padding: "11px 14px",
        borderRadius: T.r,
        border: `1.5px solid ${T.border}`,
        fontSize: 14,
        fontFamily: T.fontBody,
        color: T.ink,
        background: T.canvas,
        outline: "none",
        boxSizing: "border-box",
        ...(props.style || {}),
      }}
    />
  </div>
);

// Multi-line text input — same chrome as Input, for free-text answers

export const TextArea = ({ label, hint, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: T.inkSoft }}>{label}</p>}
    {hint && <p style={{ margin: "0 0 8px", fontSize: 12, color: T.inkMuted, lineHeight: 1.5 }}>{hint}</p>}
    <textarea
      rows={2}
      {...props}
      style={{
        width: "100%",
        padding: "11px 14px",
        borderRadius: T.r,
        border: `1.5px solid ${T.border}`,
        fontSize: 14,
        fontFamily: T.fontBody,
        color: T.ink,
        background: T.canvas,
        outline: "none",
        resize: "vertical",
        lineHeight: 1.5,
        boxSizing: "border-box",
        ...(props.style || {}),
      }}
    />
  </div>
);

// Dropdown select — same chrome as Input

export const Select = ({ label, options, placeholder, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: T.inkSoft }}>{label}</p>}
    <select
      {...props}
      style={{
        width: "100%",
        padding: "11px 14px",
        borderRadius: T.r,
        border: `1.5px solid ${T.border}`,
        fontSize: 14,
        fontFamily: T.fontBody,
        color: T.ink,
        background: T.canvas,
        outline: "none",
        boxSizing: "border-box",
        cursor: "pointer",
        ...(props.style || {}),
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>
      ))}
    </select>
  </div>
);

// Inline validation message — sits directly under the field it refers to

export const FieldError = ({ children }) => {
  if (!children) return null;
  return <p style={{ margin: "-10px 0 14px", color: T.red, fontSize: 12, fontWeight: 700 }}>{children}</p>;
};

// Avatar display — photo, emoji, or initials

export const Avatar = ({ src, size = 36, bg = T.purpleL, border = "transparent" }) => {
  const isPhoto = src && src.startsWith("data:");
  const isEmoji = src && !src.startsWith("data:") && src.length <= 2;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `2px solid ${border}`, overflow: "hidden", color: T.inkMuted, fontWeight: 700, fontSize: size * 0.35 }}>
      {isPhoto ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
       : isEmoji ? <span style={{ fontSize: size * 0.52 }}>{src}</span>
       : <span>?</span>}
    </div>
  );
};

// Accordion item

export const Accordion = ({ icon, title, children, accentColor = T.purple }) => {
  const [open, setOpen] = useState(false);
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: accentColor + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
        <p style={{ flex: 1, margin: 0, fontWeight: 700, color: T.ink, fontSize: 14, lineHeight: 1.4 }}>{title}</p>
        <span style={{ color: T.inkMuted, fontSize: 18, fontWeight: 300, transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block" }}>+</span>
      </div>
      {open && <div style={{ padding: "0 16px 16px 64px", color: T.inkSoft, fontSize: 13, lineHeight: 1.7 }}>{children}</div>}
    </Card>
  );
};
//  CHILD PROFILE SYSTEM

export const PageHero = ({ type }) => {
  const heroes = {
    sos: (
      <svg width="100%" viewBox="0 0 320 96" style={{ display: "block" }}>
        <rect width="320" height="96" rx="14" fill="#1A0808"/>
        <circle cx="48" cy="48" r="28" fill="#DC2626" opacity="0.2"/>
        <circle cx="48" cy="48" r="18" fill="#DC2626" opacity="0.3"/>
        <rect x="44" y="28" width="8" height="22" rx="4" fill="#DC2626"/>
        <rect x="44" y="54" width="8" height="8" rx="4" fill="#DC2626"/>
        <rect x="90" y="26" width="140" height="7" rx="3.5" fill="#DC2626" opacity="0.4"/>
        <rect x="90" y="38" width="100" height="5" rx="2.5" fill="#ffffff" opacity="0.12"/>
        <rect x="90" y="48" width="120" height="5" rx="2.5" fill="#ffffff" opacity="0.09"/>
        <rect x="90" y="58" width="80" height="5" rx="2.5" fill="#ffffff" opacity="0.07"/>
        <rect x="90" y="68" width="100" height="5" rx="2.5" fill="#ffffff" opacity="0.06"/>
        <circle cx="268" cy="52" r="20" fill="#DC2626" opacity="0.12"/>
        <path d="M258 52 Q268 42 278 52 Q268 62 258 52" fill="#DC2626" opacity="0.3"/>
      </svg>
    ),
    addchild: (
      <svg width="100%" viewBox="0 0 320 80" style={{ display: "block" }}>
        <rect width="320" height="80" rx="12" fill="#DCFCE7"/>
        <circle cx="40" cy="40" r="22" fill="#065F46" opacity="0.15"/>
        <circle cx="40" cy="40" r="14" fill="#065F46" opacity="0.25"/>
        <circle cx="40" cy="40" r="6" fill="#065F46"/>
        <rect x="80" y="22" width="180" height="7" rx="3.5" fill="#065F46" opacity="0.3"/>
        <rect x="80" y="35" width="130" height="5" rx="2.5" fill="#065F46" opacity="0.18"/>
        <rect x="80" y="46" width="150" height="5" rx="2.5" fill="#065F46" opacity="0.13"/>
        <rect x="80" y="57" width="100" height="5" rx="2.5" fill="#D97706" opacity="0.35"/>
        <circle cx="274" cy="30" r="10" fill="#D97706" opacity="0.2"/>
        <circle cx="288" cy="52" r="14" fill="#065F46" opacity="0.1"/>
        <circle cx="264" cy="58" r="7" fill="#1D9E75" opacity="0.2"/>
      </svg>
    ),
  };
  return (
    <div style={{ marginBottom: 20, borderRadius: T.r, overflow: "hidden" }}>
      {heroes[type] || null}
    </div>
  );
};

export const AvatarIllustrations = [
  { key: "lion", label: "Lion", render: (a) => (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/>

      {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg,i)=>{
        const r1=13,r2=17,rad=deg*Math.PI/180;
        return <line key={i} x1={22+r1*Math.cos(rad)} y1={22+r1*Math.sin(rad)} x2={22+r2*Math.cos(rad)} y2={22+r2*Math.sin(rad)} stroke={a?"#D97706":"#7BA08A"} strokeWidth="2.5" strokeLinecap="round"/>;
      })}

      <circle cx="22" cy="22" r="11" fill={a?"#1D9E75":"#7BA08A"}/>

      <circle cx="18.5" cy="20" r="2" fill={a?"white":"#F2FAF6"}/>
      <circle cx="25.5" cy="20" r="2" fill={a?"white":"#F2FAF6"}/>
      <circle cx="19" cy="20" r="0.9" fill={a?"#0A2218":"#2D5A3D"}/>
      <circle cx="26" cy="20" r="0.9" fill={a?"#0A2218":"#2D5A3D"}/>

      <ellipse cx="22" cy="24" rx="2.5" ry="1.8" fill={a?"#D97706":"#D4EAE0"} opacity="0.8"/>
      <path d="M18.5 26 Q22 29 25.5 26" fill="none" stroke={a?"white":"#F2FAF6"} strokeWidth="1.2" strokeLinecap="round"/>

      <circle cx="12" cy="13" r="3.5" fill={a?"#1D9E75":"#7BA08A"}/>
      <circle cx="32" cy="13" r="3.5" fill={a?"#1D9E75":"#7BA08A"}/>
    </svg>
  )},
  { key: "bear", label: "Bear", render: (a) => (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/>

      <circle cx="12" cy="13" r="5" fill={a?"#1D9E75":"#7BA08A"}/>
      <circle cx="32" cy="13" r="5" fill={a?"#1D9E75":"#7BA08A"}/>
      <circle cx="12" cy="13" r="2.5" fill={a?"#0A2218":"#2D5A3D"} opacity="0.35"/>
      <circle cx="32" cy="13" r="2.5" fill={a?"#0A2218":"#2D5A3D"} opacity="0.35"/>

      <circle cx="22" cy="23" r="13" fill={a?"#1D9E75":"#7BA08A"}/>

      <ellipse cx="22" cy="28" rx="6" ry="4" fill={a?"white":"#F2FAF6"} opacity="0.7"/>

      <circle cx="17.5" cy="21" r="2.2" fill={a?"white":"#F2FAF6"}/>
      <circle cx="26.5" cy="21" r="2.2" fill={a?"white":"#F2FAF6"}/>
      <circle cx="18" cy="21" r="1" fill={a?"#0A2218":"#2D5A3D"}/>
      <circle cx="27" cy="21" r="1" fill={a?"#0A2218":"#2D5A3D"}/>

      <ellipse cx="22" cy="26.5" rx="2" ry="1.4" fill={a?"#0A2218":"#2D5A3D"} opacity="0.6"/>
    </svg>
  )},
  { key: "panda", label: "Panda", render: (a) => (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/>

      <circle cx="13" cy="13" r="5" fill={a?"#0A2218":"#2D5A3D"}/>
      <circle cx="31" cy="13" r="5" fill={a?"#0A2218":"#2D5A3D"}/>

      <circle cx="22" cy="23" r="13" fill={a?"white":"#F2FAF6"}/>

      <ellipse cx="16.5" cy="20" rx="4.5" ry="3.5" fill={a?"#0A2218":"#2D5A3D"} opacity="0.85"/>
      <ellipse cx="27.5" cy="20" rx="4.5" ry="3.5" fill={a?"#0A2218":"#2D5A3D"} opacity="0.85"/>

      <circle cx="16.5" cy="20" r="2" fill={a?"white":"#F2FAF6"}/>
      <circle cx="27.5" cy="20" r="2" fill={a?"white":"#F2FAF6"}/>
      <circle cx="16.8" cy="20" r="1" fill={a?"#0A2218":"#2D5A3D"}/>
      <circle cx="27.8" cy="20" r="1" fill={a?"#0A2218":"#2D5A3D"}/>

      <ellipse cx="22" cy="27" rx="2.5" ry="1.8" fill={a?"#0A2218":"#2D5A3D"} opacity="0.5"/>
      <path d="M18.5 29.5 Q22 32 25.5 29.5" fill="none" stroke={a?"#0A2218":"#2D5A3D"} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )},
  { key: "fox", label: "Fox", render: (a) => (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/>

      <polygon points="12,20 8,8 18,16" fill={a?"#D97706":"#7BA08A"}/>
      <polygon points="32,20 36,8 26,16" fill={a?"#D97706":"#7BA08A"}/>
      <polygon points="12,20 10,11 17,17" fill={a?"white":"#F2FAF6"} opacity="0.6"/>
      <polygon points="32,20 34,11 27,17" fill={a?"white":"#F2FAF6"} opacity="0.6"/>

      <circle cx="22" cy="24" r="12" fill={a?"#D97706":"#7BA08A"}/>

      <ellipse cx="22" cy="29" rx="7" ry="5" fill={a?"white":"#F2FAF6"} opacity="0.75"/>

      <circle cx="17.5" cy="22" r="2.2" fill={a?"white":"#F2FAF6"}/>
      <circle cx="26.5" cy="22" r="2.2" fill={a?"white":"#F2FAF6"}/>
      <circle cx="18" cy="22" r="1" fill={a?"#0A2218":"#2D5A3D"}/>
      <circle cx="27" cy="22" r="1" fill={a?"#0A2218":"#2D5A3D"}/>

      <ellipse cx="22" cy="27.5" rx="2" ry="1.4" fill={a?"#0A2218":"#2D5A3D"} opacity="0.6"/>
    </svg>
  )},
  { key: "frog", label: "Frog", render: (a) => (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/>

      <circle cx="22" cy="26" r="12" fill={a?"#1D9E75":"#7BA08A"}/>

      <circle cx="15" cy="15" r="6.5" fill={a?"#1D9E75":"#7BA08A"}/>
      <circle cx="29" cy="15" r="6.5" fill={a?"#1D9E75":"#7BA08A"}/>
      <circle cx="15" cy="15" r="3.5" fill={a?"white":"#F2FAF6"}/>
      <circle cx="29" cy="15" r="3.5" fill={a?"white":"#F2FAF6"}/>
      <circle cx="15.5" cy="15" r="1.8" fill={a?"#0A2218":"#2D5A3D"}/>
      <circle cx="29.5" cy="15" r="1.8" fill={a?"#0A2218":"#2D5A3D"}/>

      <path d="M14 28 Q22 35 30 28" fill="none" stroke={a?"white":"#F2FAF6"} strokeWidth="2" strokeLinecap="round"/>

      <ellipse cx="22" cy="30" rx="7" ry="5" fill={a?"white":"#F2FAF6"} opacity="0.3"/>
    </svg>
  )},
  { key: "butterfly", label: "Butterfly", render: (a) => (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/>

      <ellipse cx="13" cy="17" rx="8" ry="6" fill={a?"#1D9E75":"#7BA08A"} opacity="0.9" transform="rotate(-15 13 17)"/>
      <ellipse cx="31" cy="17" rx="8" ry="6" fill={a?"#1D9E75":"#7BA08A"} opacity="0.9" transform="rotate(15 31 17)"/>

      <ellipse cx="14" cy="28" rx="6" ry="5" fill={a?"#D97706":"#7BA08A"} opacity="0.8" transform="rotate(20 14 28)"/>
      <ellipse cx="30" cy="28" rx="6" ry="5" fill={a?"#D97706":"#7BA08A"} opacity="0.8" transform="rotate(-20 30 28)"/>

      <circle cx="14" cy="17" r="2" fill={a?"white":"#F2FAF6"} opacity="0.6"/>
      <circle cx="30" cy="17" r="2" fill={a?"white":"#F2FAF6"} opacity="0.6"/>

      <ellipse cx="22" cy="22" rx="1.5" ry="8" fill={a?"#0A2218":"#2D5A3D"} opacity="0.7"/>

      <path d="M21 15 Q17 9 15 8" fill="none" stroke={a?"white":"#F2FAF6"} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M23 15 Q27 9 29 8" fill="none" stroke={a?"white":"#F2FAF6"} strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="15" cy="8" r="1.5" fill={a?"white":"#F2FAF6"}/>
      <circle cx="29" cy="8" r="1.5" fill={a?"white":"#F2FAF6"}/>
    </svg>
  )},
  { key: "flower", label: "Flower", render: (a) => (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/>

      {[0,60,120,180,240,300].map((deg,i)=>{
        const rad=deg*Math.PI/180;
        const cx=22+9*Math.cos(rad), cy=22+9*Math.sin(rad);
        return <ellipse key={i} cx={cx} cy={cy} rx="5.5" ry="3.5" fill={a?"#1D9E75":"#7BA08A"} opacity="0.85" transform={`rotate(${deg} ${cx} ${cy})`}/>;
      })}

      <circle cx="22" cy="22" r="6" fill={a?"#D97706":"#D4EAE0"}/>
      <circle cx="22" cy="22" r="3" fill={a?"white":"#F2FAF6"} opacity="0.7"/>
    </svg>
  )},
  { key: "star", label: "Star", render: (a) => (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/>
      <polygon points="22,8 25.5,18.5 37,18.5 27.5,25 31,36 22,29 13,36 16.5,25 7,18.5 18.5,18.5" fill={a?"#D97706":"#7BA08A"}/>

      <circle cx="18" cy="16" r="1.5" fill={a?"white":"#F2FAF6"} opacity="0.7"/>
    </svg>
  )},
  { key: "dolphin", label: "Dolphin", render: (a) => (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/>

      <path d="M8 28 Q12 14 24 16 Q34 18 36 28 Q30 22 22 22 Q12 22 8 28Z" fill={a?"#1D9E75":"#7BA08A"}/>

      <path d="M22 16 Q24 10 26 14 Q24 16 22 16Z" fill={a?"#065F46":"#2D5A3D"}/>

      <path d="M36 28 Q40 24 38 30 Q36 32 34 30 Q38 28 36 28Z" fill={a?"#1D9E75":"#7BA08A"}/>

      <path d="M10 28 Q16 32 28 30 Q34 28 36 28 Q30 34 22 34 Q12 34 10 28Z" fill={a?"white":"#F2FAF6"} opacity="0.45"/>

      <circle cx="16" cy="21" r="2" fill={a?"white":"#F2FAF6"}/>
      <circle cx="16.5" cy="21" r="1" fill={a?"#0A2218":"#2D5A3D"}/>

      <path d="M12 24 Q15 27 18 25" fill="none" stroke={a?"white":"#F2FAF6"} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )},
  { key: "unicorn", label: "Unicorn", render: (a) => (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/>

      <ellipse cx="22" cy="26" rx="10" ry="11" fill={a?"white":"#F2FAF6"}/>

      <path d="M14 18 Q10 14 12 8 Q16 10 14 18Z" fill={a?"#1D9E75":"#7BA08A"}/>
      <path d="M16 16 Q13 11 15 7 Q19 9 16 16Z" fill={a?"#D97706":"#D4EAE0"} opacity="0.8"/>

      <polygon points="22,8 20,18 24,18" fill={a?"#D97706":"#7BA08A"}/>
      <line x1="22" y1="9" x2="20.5" y2="13" stroke={a?"white":"#F2FAF6"} strokeWidth="0.8" opacity="0.6"/>
      <line x1="22" y1="13" x2="23.5" y2="16" stroke={a?"white":"#F2FAF6"} strokeWidth="0.8" opacity="0.6"/>

      <circle cx="17" cy="23" r="2.5" fill={a?"#1D9E75":"#7BA08A"}/>
      <circle cx="17.3" cy="23" r="1.2" fill={a?"#0A2218":"#2D5A3D"}/>
      <circle cx="17" cy="22.3" r="0.6" fill="white" opacity="0.7"/>

      <ellipse cx="19" cy="30" rx="2" ry="1.3" fill={a?"#1D9E75":"#7BA08A"} opacity="0.3"/>

      <polygon points="27,16 30,10 32,16" fill={a?"white":"#F2FAF6"}/>
      <polygon points="28,16 30,12 31,16" fill={a?"#1D9E75":"#7BA08A"} opacity="0.5"/>
    </svg>
  )},
  { key: "penguin", label: "Penguin", render: (a) => (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/>

      <ellipse cx="22" cy="26" rx="11" ry="13" fill={a?"#0A2218":"#2D5A3D"}/>

      <ellipse cx="22" cy="27" rx="7" ry="10" fill={a?"white":"#F2FAF6"} opacity="0.85"/>

      <circle cx="22" cy="15" r="8" fill={a?"#0A2218":"#2D5A3D"}/>

      <ellipse cx="22" cy="16" rx="5" ry="4.5" fill={a?"white":"#F2FAF6"} opacity="0.85"/>

      <circle cx="19.5" cy="14.5" r="1.8" fill={a?"#0A2218":"#2D5A3D"}/>
      <circle cx="24.5" cy="14.5" r="1.8" fill={a?"#0A2218":"#2D5A3D"}/>
      <circle cx="19.8" cy="14.2" r="0.7" fill="white" opacity="0.8"/>
      <circle cx="24.8" cy="14.2" r="0.7" fill="white" opacity="0.8"/>

      <ellipse cx="22" cy="18" rx="2.5" ry="1.5" fill={a?"#D97706":"#7BA08A"}/>

      <ellipse cx="11" cy="26" rx="3" ry="7" fill={a?"#0A2218":"#2D5A3D"} transform="rotate(-15 11 26)"/>
      <ellipse cx="33" cy="26" rx="3" ry="7" fill={a?"#0A2218":"#2D5A3D"} transform="rotate(15 33 26)"/>
    </svg>
  )},
  { key: "tiger", label: "Tiger", render: (a) => (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/>

      <circle cx="12" cy="13" r="5" fill={a?"#D97706":"#7BA08A"}/>
      <circle cx="32" cy="13" r="5" fill={a?"#D97706":"#7BA08A"}/>
      <circle cx="12" cy="13" r="2.5" fill={a?"white":"#F2FAF6"} opacity="0.5"/>
      <circle cx="32" cy="13" r="2.5" fill={a?"white":"#F2FAF6"} opacity="0.5"/>

      <circle cx="22" cy="23" r="13" fill={a?"#D97706":"#7BA08A"}/>

      <path d="M14 14 Q16 18 13 20" fill="none" stroke={a?"#0A2218":"#2D5A3D"} strokeWidth="1.8" strokeLinecap="round" opacity="0.55"/>
      <path d="M30 14 Q28 18 31 20" fill="none" stroke={a?"#0A2218":"#2D5A3D"} strokeWidth="1.8" strokeLinecap="round" opacity="0.55"/>
      <path d="M20 12 Q21 16 20 18" fill="none" stroke={a?"#0A2218":"#2D5A3D"} strokeWidth="1.5" strokeLinecap="round" opacity="0.45"/>
      <path d="M24 12 Q23 16 24 18" fill="none" stroke={a?"#0A2218":"#2D5A3D"} strokeWidth="1.5" strokeLinecap="round" opacity="0.45"/>

      <ellipse cx="22" cy="28" rx="7" ry="5" fill={a?"white":"#F2FAF6"} opacity="0.7"/>

      <circle cx="17.5" cy="21" r="2.2" fill={a?"white":"#F2FAF6"}/>
      <circle cx="26.5" cy="21" r="2.2" fill={a?"white":"#F2FAF6"}/>
      <ellipse cx="18" cy="21" rx="0.8" ry="1.4" fill={a?"#0A2218":"#2D5A3D"}/>
      <ellipse cx="27" cy="21" rx="0.8" ry="1.4" fill={a?"#0A2218":"#2D5A3D"}/>

      <ellipse cx="22" cy="26.5" rx="2" ry="1.4" fill={a?"#0A2218":"#2D5A3D"} opacity="0.6"/>
    </svg>
  )},
];
// Handles: "panda" (SVG key), "🦁" (legacy emoji), "data:..." (photo)

export const ChildAvatar = ({ value, size = 36, active = false, borderColor = "transparent" }) => {
  const bg     = active ? T.purple : T.purpleL;
  const stroke = active ? "white" : T.purple;
  const isPhoto  = value && (value.startsWith("data:") || value.startsWith("http"));
  const isNone   = !value || value === "none";
  const isKey    = value && !isPhoto && !isNone && value.length > 1 && !["🦁","🐨","🐼","🦊","🐸","🦋","🌸","🌟","🐬","🦄","🐧","🐯"].includes(value);
  const av       = isKey ? AvatarIllustrations.find(a => a.key === value) : null;

  if (isPhoto) return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `2px solid ${borderColor}` }}>
      <img src={value} alt="child" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );

  // Neutral person silhouette — shown before any avatar is chosen
  if (isNone) return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `2px solid ${borderColor}` }}>
      <svg width={Math.round(size * 0.58)} height={Math.round(size * 0.58)} viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="10" r="5.5" stroke={stroke} strokeWidth="1.5" fill={stroke} fillOpacity="0.18"/>
        <path d="M4 26 Q4 18 14 18 Q24 18 24 26" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" fill={stroke} fillOpacity="0.12"/>
      </svg>
    </div>
  );

  if (av) return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, overflow: "hidden", border: `2px solid ${borderColor}`, display: "flex", alignItems: "center", justifyContent: "center", background: bg }}>
      <div style={{ width: 44, height: 44, transform: `scale(${size / 44})`, transformOrigin: "center", flexShrink: 0 }}>
        {av.render(active)}
      </div>
    </div>
  );

  // Legacy emoji fallback
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.48, flexShrink: 0, border: `2px solid ${borderColor}` }}>
      <span>{value}</span>
    </div>
  );
};

export const ROOM_ICONS = {
  foster: (color) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 20 C11 20 2.5 14 2.5 8 C2.5 5 4.5 3 7 3 C8.5 3 10 4 11 5.5 C12 4 13.5 3 15 3 C17.5 3 19.5 5 19.5 8 C19.5 14 11 20 11 20Z" stroke={color} strokeWidth="1.4" fill={color} fillOpacity="0.12"/>
    </svg>
  ),
  sg: (color) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2C7.686 2 5 4.686 5 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6Z"
        stroke={color} strokeWidth="1.4" fill={color} fillOpacity="0.15"/>
      <circle cx="11" cy="8" r="2.5" fill={color} opacity="0.8"/>
    </svg>
  ),
  community: (color) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 4 Q3 2 5 2 L14 2 Q16 2 16 4 L16 9 Q16 11 14 11 L8 11 L5 14 L5 11 Q3 11 3 9 Z"
        stroke={color} strokeWidth="1.3" fill={color} fillOpacity="0.12"/>
      <path d="M8 13 Q8 11.5 9.5 11.5 L17 11.5 Q19 11.5 19 13.5 L19 17 Q19 18.5 17 18.5 L15 18.5 L15 20.5 L13 18.5 L9.5 18.5 Q8 18.5 8 17 Z"
        stroke={color} strokeWidth="1.3" fill={color} fillOpacity="0.2"/>
    </svg>
  ),
  general: (color) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="8" cy="7" r="3" stroke={color} strokeWidth="1.4" fill={color} fillOpacity="0.15"/>
      <circle cx="15" cy="8.5" r="2.3" stroke={color} strokeWidth="1.3" fill="none" opacity="0.6"/>
      <path d="M2.5 19 Q2.5 13 8 13 Q13.5 13 13.5 19" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M13.5 17 Q14 14.5 17 14.5 Q19.5 14.5 19.5 17.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
    </svg>
  ),
  tips: (color) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2 C7 2 4 5 4 9 C4 11.5 5.2 13 6.5 14.5 L6.5 16 L15.5 16 L15.5 14.5 C16.8 13 18 11.5 18 9 C18 5 15 2 11 2Z" stroke={color} strokeWidth="1.4" fill={color} fillOpacity="0.12"/>
      <path d="M8.5 19 L13.5 19 M9 21 L13 21" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  events: (color) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="4" width="16" height="15" rx="2.5" stroke={color} strokeWidth="1.4" fill={color} fillOpacity="0.1"/>
      <path d="M3 8 L19 8" stroke={color} strokeWidth="1.4"/>
      <path d="M7 2 L7 5 M15 2 L15 5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
};

// Color choices for Community group rooms.

export const COM_AVATAR_ILLUSTRATIONS = [
  { key: "leaf",    label: "Leaf",    render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><path d="M22 34 Q10 22 18 10 Q26 10 30 18 Q34 26 22 34Z" fill={a?"#1D9E75":"#7BA08A"} opacity="0.9"/><path d="M22 34 L22 16" stroke={a?"white":"#F2FAF6"} strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/><path d="M22 24 Q18 20 16 16" stroke={a?"white":"#F2FAF6"} strokeWidth="1" strokeLinecap="round" opacity="0.4"/><path d="M22 28 Q26 24 28 20" stroke={a?"white":"#F2FAF6"} strokeWidth="1" strokeLinecap="round" opacity="0.4"/></svg> },{ key: "lotus", label: "Lotus", render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><path d="M22 28 Q15 22 16 14 Q22 16 22 28Z" fill={a?"white":"#F2FAF6"} opacity="0.8"/><path d="M22 28 Q29 22 28 14 Q22 16 22 28Z" fill={a?"white":"#F2FAF6"} opacity="0.8"/><path d="M22 28 Q22 14 22 12" stroke={a?"white":"#F2FAF6"} strokeWidth="1" strokeLinecap="round" opacity="0.3"/><path d="M22 28 Q12 18 10 12 Q17 12 22 28Z" fill={a?"#1D9E75":"#7BA08A"} opacity="0.6"/><path d="M22 28 Q32 18 34 12 Q27 12 22 28Z" fill={a?"#1D9E75":"#7BA08A"} opacity="0.6"/><ellipse cx="22" cy="30" rx="8" ry="3" fill={a?"#1D9E75":"#7BA08A"} opacity="0.4"/></svg> },{ key: "mountain",label: "Mountain",render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><path d="M6 32 L16 14 L22 22 L28 14 L38 32Z" fill={a?"#1D9E75":"#7BA08A"} opacity="0.85"/><path d="M16 14 L22 22 L19 22 L16 14Z" fill={a?"white":"#F2FAF6"} opacity="0.6"/><path d="M28 14 L22 22 L25 22 L28 14Z" fill={a?"white":"#F2FAF6"} opacity="0.6"/><path d="M6 32 L38 32" stroke={a?"white":"#F2FAF6"} strokeWidth="1" strokeLinecap="round" opacity="0.3"/></svg> },{ key: "sun", label: "Sun", render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><circle cx="22" cy="22" r="8" fill={a?"#D97706":"#7BA08A"} opacity="0.9"/>{[0,45,90,135,180,225,270,315].map((deg,i)=>{const rad=deg*Math.PI/180;const x1=22+12*Math.cos(rad);const y1=22+12*Math.sin(rad);const x2=22+16*Math.cos(rad);const y2=22+16*Math.sin(rad);return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={a?"#D97706":"#7BA08A"} strokeWidth="1.5" strokeLinecap="round"/>})}</svg> },{ key: "moon", label: "Moon", render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><path d="M26 10 Q16 14 16 22 Q16 30 26 34 Q16 36 10 28 Q6 16 14 10 Q20 6 26 10Z" fill={a?"white":"#F2FAF6"} opacity="0.9"/><circle cx="30" cy="14" r="2" fill={a?"#D97706":"#7BA08A"} opacity="0.5"/><circle cx="32" cy="22" r="1.2" fill={a?"#D97706":"#7BA08A"} opacity="0.35"/></svg> },
  { key: "compass", label: "Compass", render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><circle cx="22" cy="22" r="12" stroke={a?"white":"#F2FAF6"} strokeWidth="1.3" fill="none" opacity="0.5"/><polygon points="22,12 24,22 22,32 20,22" fill={a?"white":"#F2FAF6"} opacity="0.9"/><polygon points="32,22 22,20 12,22 22,24" fill={a?"#D97706":"#7BA08A"} opacity="0.8"/><circle cx="22" cy="22" r="2" fill={a?"white":"#F2FAF6"}/></svg> },{ key: "wave", label: "Wave", render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><path d="M8 18 Q13 12 18 18 Q23 24 28 18 Q33 12 38 18" fill="none" stroke={a?"white":"#F2FAF6"} strokeWidth="2" strokeLinecap="round"/><path d="M8 24 Q13 18 18 24 Q23 30 28 24 Q33 18 38 24" fill="none" stroke={a?"#1D9E75":"#7BA08A"} strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/><path d="M8 30 Q13 24 18 30 Q23 36 28 30 Q33 24 38 30" fill="none" stroke={a?"#D97706":"#7BA08A"} strokeWidth="1" strokeLinecap="round" opacity="0.4"/></svg> },{ key: "diamond", label: "Gem", render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><polygon points="22,10 32,18 22,36 12,18" fill={a?"white":"#F2FAF6"} opacity="0.85"/><polygon points="12,18 22,18 16,10" fill={a?"#1D9E75":"#7BA08A"} opacity="0.6"/><polygon points="32,18 22,18 28,10" fill={a?"#1D9E75":"#7BA08A"} opacity="0.6"/><polygon points="12,18 22,18 22,36" fill={a?"white":"#F2FAF6"} opacity="0.5"/></svg> },{ key: "seed", label: "Grow", render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><path d="M22 34 L22 20" stroke={a?"white":"#F2FAF6"} strokeWidth="1.5" strokeLinecap="round"/><path d="M22 24 Q14 18 14 10 Q22 10 22 24" fill={a?"#1D9E75":"#7BA08A"} opacity="0.8"/><path d="M22 28 Q30 22 30 14 Q22 14 22 28" fill={a?"white":"#F2FAF6"} opacity="0.7"/></svg> },{ key: "spiral", label: "Journey", render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><path d="M22 22 Q30 14 30 22 Q30 32 20 32 Q10 32 10 20 Q10 10 22 10 Q36 10 36 22" fill="none" stroke={a?"white":"#F2FAF6"} strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/><circle cx="22" cy="22" r="2" fill={a?"#D97706":"#7BA08A"}/></svg> },
  { key: "heart",   label: "Heart",   render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><path d="M22 32 C22 32 10 24 10 16 C10 11 14 8 18 8 C20 8 22 10 22 10 C22 10 24 8 26 8 C30 8 34 11 34 16 C34 24 22 32 22 32Z" fill={a?"white":"#F2FAF6"} opacity="0.9"/><path d="M16 14 Q18 11 22 13" stroke={a?"#1D9E75":"#7BA08A"} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none"/></svg> },
  { key: "bridge",  label: "Bridge",  render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><path d="M8 28 Q22 14 36 28" fill="none" stroke={a?"white":"#F2FAF6"} strokeWidth="2" strokeLinecap="round"/><line x1="14" y1="21" x2="14" y2="28" stroke={a?"white":"#F2FAF6"} strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/><line x1="22" y1="17" x2="22" y2="28" stroke={a?"white":"#F2FAF6"} strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/><line x1="30" y1="21" x2="30" y2="28" stroke={a?"white":"#F2FAF6"} strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/><line x1="8" y1="28" x2="36" y2="28" stroke={a?"#D97706":"#7BA08A"} strokeWidth="1.8" strokeLinecap="round"/></svg> },
];

export const ComAvatar = ({ value, size = 36, active = false, borderColor = "transparent" }) => {
  const bg     = active ? T.purple : T.purpleL;
  const stroke = active ? "white" : T.purple;
  const isPhoto = value && value.startsWith("data:");
  const isNone  = !value || value === "none";
  const av      = !isPhoto && !isNone ? COM_AVATAR_ILLUSTRATIONS.find(a => a.key === value) : null;

  if (isPhoto) return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `2px solid ${borderColor}` }}>
      <img src={value} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );

  // Neutral person silhouette — same as ChildAvatar for consistency
  if (isNone) return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `2px solid ${borderColor}` }}>
      <svg width={Math.round(size * 0.58)} height={Math.round(size * 0.58)} viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="10" r="5.5" stroke={stroke} strokeWidth="1.5" fill={stroke} fillOpacity="0.18"/>
        <path d="M4 26 Q4 18 14 18 Q24 18 24 26" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" fill={stroke} fillOpacity="0.12"/>
      </svg>
    </div>
  );

  if (av) return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, overflow: "hidden", border: `2px solid ${borderColor}`, display: "flex", alignItems: "center", justifyContent: "center", background: bg }}>
      <div style={{ width: 44, height: 44, transform: `scale(${size / 44})`, transformOrigin: "center", flexShrink: 0 }}>
        {av.render(active)}
      </div>
    </div>
  );

  // Fallback
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `2px solid ${borderColor}`, color: stroke, fontWeight: 700, fontSize: size * 0.38 }}>
      <span>?</span>
    </div>
  );
};
//  SCREENS

export const ACTIVITY_TEXTAREA_STYLE = { width: "100%", padding: "11px 14px", borderRadius: T.r, border: `1.5px solid ${T.border}`, fontSize: 13, fontFamily: T.fontBody, color: T.ink, outline: "none", resize: "vertical", lineHeight: 1.5, boxSizing: "border-box", marginBottom: 14, background: T.canvas };
