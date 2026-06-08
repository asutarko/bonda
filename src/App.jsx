import { useState, useEffect, useRef } from "react";
import { supabase } from "./lib/supabase";
//  SVG ILLUSTRATION SYSTEM
//  Classic geometric · flat depth · warm restraint
//  No emojis in key UI. Clean shapes do the storytelling.

// Emotion face illustrations — consistent geometric face system
const EmotionIllustration = ({ id, size = 48 }) => {
  const s = size;
  const r = s / 2;
  const illustrations = {
    happy: (
      <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: "block" }}>
        <circle cx="50" cy="50" r="48" fill="#FEF3C7"/>
        <circle cx="50" cy="50" r="34" fill="#D97706" opacity="0.18"/>
        <circle cx="37" cy="43" r="5" fill="#0A2218"/>
        <circle cx="63" cy="43" r="5" fill="#0A2218"/>
        <path d="M34 60 Q50 74 66 60" fill="none" stroke="#0A2218" strokeWidth="3" strokeLinecap="round"/>
        <path d="M18 28 Q23 22 28 28" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M72 28 Q77 22 82 28" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    sad: (
      <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: "block" }}>
        <circle cx="50" cy="50" r="48" fill="#DBEAFE"/>
        <circle cx="50" cy="50" r="34" fill="#2563EB" opacity="0.12"/>
        <circle cx="37" cy="43" r="5" fill="#0A2218"/>
        <circle cx="63" cy="43" r="5" fill="#0A2218"/>
        <path d="M34 66 Q50 56 66 66" fill="none" stroke="#0A2218" strokeWidth="3" strokeLinecap="round"/>
        <ellipse cx="35" cy="57" rx="3.5" ry="6" fill="#2563EB" opacity="0.35"/>
        <ellipse cx="65" cy="57" rx="3.5" ry="6" fill="#2563EB" opacity="0.35"/>
      </svg>
    ),
    angry: (
      <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: "block" }}>
        <circle cx="50" cy="50" r="48" fill="#FEE2E2"/>
        <circle cx="50" cy="50" r="34" fill="#DC2626" opacity="0.12"/>
        <rect x="31" y="39" width="15" height="6" rx="3" fill="#0A2218"/>
        <rect x="54" y="39" width="15" height="6" rx="3" fill="#0A2218"/>
        <path d="M34 66 Q50 57 66 66" fill="none" stroke="#0A2218" strokeWidth="3" strokeLinecap="round"/>
        <path d="M30 32 L36 40" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M70 32 L64 40" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    confused: (
      <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: "block" }}>
        <circle cx="50" cy="50" r="48" fill="#EDE9FE"/>
        <circle cx="50" cy="50" r="34" fill="#7C3AED" opacity="0.1"/>
        <circle cx="37" cy="43" r="5" fill="#0A2218"/>
        <circle cx="63" cy="43" r="5" fill="#0A2218"/>
        <ellipse cx="50" cy="64" rx="9" ry="6" fill="#0A2218" opacity="0.65"/>
        <path d="M26 36 Q33 30 40 36" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        <path d="M60 36 Q67 30 74 36" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    excited: (
      <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: "block" }}>
        <circle cx="50" cy="50" r="48" fill="#EDE9FE"/>
        <circle cx="50" cy="50" r="34" fill="#065F46" opacity="0.1"/>
        <circle cx="37" cy="43" r="6" fill="#0A2218"/>
        <circle cx="63" cy="43" r="6" fill="#0A2218"/>
        <path d="M32 60 Q50 76 68 60" fill="none" stroke="#0A2218" strokeWidth="3" strokeLinecap="round"/>
        <path d="M16 20 Q21 13 26 20" fill="none" stroke="#065F46" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M74 20 Q79 13 84 20" fill="none" stroke="#065F46" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M22 11 Q27 4 32 11" fill="none" stroke="#065F46" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        <path d="M68 11 Q73 4 78 11" fill="none" stroke="#065F46" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
  };
  return illustrations[id] || null;
};

// Quick action illustrations — geometric scene icons
const ActionIllustration = ({ type, size = 44 }) => {
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
  };
  return illustrations[type] || null;
};

// Hero illustration for home screen when no child added yet
const HeroIllustration = () => (
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
const NavMark = ({ id, active }) => {
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
const T = {
  // Colours — Bonda palette
  ink:      "#0A2218",   // Deep Forest Night — primary text / nav active
  inkSoft:  "#2D5A3D",   // Forest Midtone — secondary text
  inkMuted: "#7BA08A",   // Muted Sage — captions, timestamps
  canvas:   "#F2FAF6",   // Morning Mist — app background
  surface:  "#FFFFFF",   // Pure white — cards
  border:   "#D4EAE0",   // Soft leaf border — dividers

  // Primary — Deep Forest Green
  purple:   "#065F46",   // Bonda Primary (replaces purple throughout)
  purpleL:  "#DCFCE7",   // Bonda Primary Light tint

  // Supporting colours
  green:    "#16A34A",
  greenL:   "#DCFCE7",
  amber:    "#D97706",   // Warmth accent — unchanged
  amberL:   "#FEF3C7",
  red:      "#DC2626",
  redL:     "#FEE2E2",
  teal:     "#0D9488",
  tealL:    "#CCFBF1",

  // Typography — Plus Jakarta Sans: warm, rounded, deeply Indonesian-feeling
  fontDisplay: "'Plus Jakarta Sans', sans-serif",
  fontBody:    "'Plus Jakarta Sans', sans-serif",

  // Spacing
  r:  "12px",
  rL: "20px",
  rXL:"28px",

  // Shadows — warmer, slightly greener tint
  shadow: "0 1px 3px rgba(6,95,70,0.07), 0 4px 12px rgba(6,95,70,0.05)",
  shadowM:"0 4px 16px rgba(6,95,70,0.10)",
};
//  SHARED PRIMITIVES

// Universal page wrapper — same padding, same top gap
const Page = ({ children, style = {} }) => (
  <div style={{ padding: "20px 18px 32px", ...style }}>{children}</div>
);

// Universal section title
const SectionLabel = ({ children, action, style = {} }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, ...style }}>
    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: T.inkMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{children}</p>
    {action}
  </div>
);

// Universal card
const Card = ({ children, onClick, style = {}, accent }) => (
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
const Badge = ({ children, color = T.purple, bg }) => (
  <span style={{ fontSize: 10, fontWeight: 700, color, background: bg || color + "18", padding: "3px 8px", borderRadius: 99, letterSpacing: "0.04em" }}>{children}</span>
);

// Primary button
const Btn = ({ children, onClick, disabled, full, secondary, danger, style = {} }) => (
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
const Input = ({ label, ...props }) => (
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

// Avatar display — photo, emoji, or initials
const Avatar = ({ src, size = 36, bg = T.purpleL, border = "transparent" }) => {
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
const Accordion = ({ icon, title, children, accentColor = T.purple }) => {
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
const CHILD_AVATARS = ["🦁","🐨","🐼","🦊","🐸","🦋","🌸","🌟","🐬","🦄","🐧","🐯"];
const PageHero = ({ type }) => {
  const heroes = {
    subsidies: (
      <svg width="100%" viewBox="0 0 320 96" style={{ display: "block" }}>
        <rect width="320" height="96" rx="14" fill="#0A2218"/>
        <circle cx="48" cy="48" r="32" fill="#065F46" opacity="0.5"/>
        <circle cx="48" cy="48" r="20" fill="#065F46" opacity="0.7"/>
        <circle cx="48" cy="48" r="10" fill="#1D9E75"/>
        <text x="48" y="54" textAnchor="middle" fontSize="13" fontWeight="700" fill="white" fontFamily="system-ui">$</text>
        <rect x="92" y="28" width="120" height="8" rx="4" fill="#1D9E75" opacity="0.6"/>
        <rect x="92" y="42" width="88" height="6" rx="3" fill="#1D9E75" opacity="0.35"/>
        <rect x="92" y="54" width="104" height="6" rx="3" fill="#1D9E75" opacity="0.25"/>
        <rect x="92" y="66" width="64" height="6" rx="3" fill="#D97706" opacity="0.5"/>
        <circle cx="260" cy="30" r="14" fill="#D97706" opacity="0.2"/>
        <circle cx="260" cy="30" r="8" fill="#D97706" opacity="0.4"/>
        <text x="260" y="35" textAnchor="middle" fontSize="10" fontWeight="700" fill="#D97706" fontFamily="system-ui">SGD</text>
        <rect x="232" y="52" width="56" height="5" rx="2.5" fill="#065F46" opacity="0.4"/>
        <rect x="244" y="62" width="32" height="5" rx="2.5" fill="#065F46" opacity="0.25"/>
        <rect x="240" y="72" width="40" height="5" rx="2.5" fill="#065F46" opacity="0.15"/>
      </svg>
    ),
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
    activities: (
      <svg width="100%" viewBox="0 0 320 96" style={{ display: "block" }}>
        <rect width="320" height="96" rx="14" fill="#0A2218"/>
        <rect x="24" y="52" width="14" height="32" rx="4" fill="#065F46"/>
        <rect x="44" y="40" width="14" height="44" rx="4" fill="#1D9E75"/>
        <rect x="64" y="28" width="14" height="56" rx="4" fill="#065F46"/>
        <rect x="84" y="36" width="14" height="48" rx="4" fill="#1D9E75" opacity="0.8"/>
        <rect x="104" y="44" width="14" height="40" rx="4" fill="#D97706"/>
        <circle cx="31" cy="50" r="4" fill="white" opacity="0.8"/>
        <circle cx="51" cy="38" r="4" fill="white" opacity="0.8"/>
        <circle cx="71" cy="26" r="4" fill="white" opacity="0.8"/>
        <circle cx="91" cy="34" r="4" fill="white" opacity="0.8"/>
        <circle cx="111" cy="42" r="4" fill="#D97706"/>
        <path d="M31 50 Q51 32 71 26 Q91 20 111 42" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="5 3"/>
        <rect x="136" y="30" width="80" height="7" rx="3.5" fill="#1D9E75" opacity="0.5"/>
        <rect x="136" y="44" width="56" height="5" rx="2.5" fill="#1D9E75" opacity="0.3"/>
        <rect x="136" y="54" width="68" height="5" rx="2.5" fill="#1D9E75" opacity="0.2"/>
        <rect x="136" y="64" width="44" height="5" rx="2.5" fill="#D97706" opacity="0.4"/>
        <circle cx="268" cy="36" r="8" fill="#D97706" opacity="0.3"/>
        <circle cx="284" cy="52" r="12" fill="#065F46" opacity="0.25"/>
        <circle cx="258" cy="62" r="6" fill="#1D9E75" opacity="0.2"/>
      </svg>
    ),
    training: (
      <svg width="100%" viewBox="0 0 320 96" style={{ display: "block" }}>
        <rect width="320" height="96" rx="14" fill="#0A2218"/>
        <rect x="20" y="20" width="60" height="44" rx="8" fill="#065F46"/>
        <rect x="26" y="26" width="48" height="32" rx="6" fill="#1D9E75" opacity="0.6"/>
        <rect x="32" y="34" width="36" height="4" rx="2" fill="white" opacity="0.7"/>
        <rect x="32" y="42" width="26" height="3" rx="1.5" fill="white" opacity="0.4"/>
        <rect x="32" y="49" width="30" height="3" rx="1.5" fill="white" opacity="0.3"/>
        <path d="M50 64 L42 76 L58 76 Z" fill="#065F46"/>
        <circle cx="32" cy="84" r="9" fill="#1D9E75" opacity="0.6"/>
        <circle cx="50" cy="88" r="9" fill="#065F46"/>
        <circle cx="68" cy="84" r="9" fill="#D97706" opacity="0.55"/>
        <rect x="98" y="26" width="110" height="7" rx="3.5" fill="#1D9E75" opacity="0.5"/>
        <rect x="98" y="40" width="80" height="5" rx="2.5" fill="#1D9E75" opacity="0.3"/>
        <rect x="98" y="52" width="96" height="5" rx="2.5" fill="#1D9E75" opacity="0.2"/>
        <rect x="98" y="64" width="60" height="5" rx="2.5" fill="#D97706" opacity="0.4"/>
        <circle cx="268" cy="48" r="24" fill="#065F46" opacity="0.12"/>
        <circle cx="268" cy="48" r="14" fill="#065F46" opacity="0.18"/>
        <circle cx="268" cy="48" r="6" fill="#1D9E75" opacity="0.5"/>
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
const AvatarIllustrations = [
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
const ChildAvatar = ({ value, size = 36, active = false, borderColor = "transparent" }) => {
  const bg     = active ? T.purple : T.purpleL;
  const stroke = active ? "white" : T.purple;
  const isPhoto  = value && value.startsWith("data:");
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

const DEFAULT_CHILDREN = [];

// Maps a Supabase "children" row to the shape the rest of the app expects
const childFromRow = (row) => ({
  id: row.id,
  name: row.name,
  emoji: row.emoji,
  age: row.age,
  caregiverType: row.caregiver_type,
  scheduleItems: row.schedule_items?.length ? row.schedule_items : DEFAULT_SCHEDULE,
  history: row.history || [],
});

function useChildren(userId) {
  const [children, setChildren] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setChildren([]); setActiveId(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    supabase.from("children").select("*").eq("user_id", userId).order("created_at").then(({ data, error }) => {
      if (cancelled) return;
      const kids = (error || !data) ? [] : data.map(childFromRow);
      setChildren(kids);
      let saved = null;
      try { saved = localStorage.getItem(`cb_active_child_${userId}`); } catch {}
      setActiveId(kids.some(k => k.id === saved) ? saved : (kids[0]?.id || null));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [userId]);

  const switchChild = (id) => {
    setActiveId(id);
    try { localStorage.setItem(`cb_active_child_${userId}`, id); } catch {}
  };

  const addChild = async (child) => {
    // A real photo arrives as a "data:image/..." URL — upload it to Storage
    // (assets/children/) and store only its public URL, not the raw bytes.
    let emoji = child.emoji;
    if (emoji && emoji.startsWith("data:")) {
      const url = await uploadPhoto(emoji, "children", userId);
      if (url) emoji = url;
    }
    const { data, error } = await supabase.from("children").insert({
      user_id: userId,
      name: child.name,
      emoji,
      age: child.age,
      caregiver_type: child.caregiverType,
      schedule_items: DEFAULT_SCHEDULE,
      history: [],
    }).select().single();
    if (error || !data) { if (error) console.error("Failed to add child profile:", error.message); return null; }
    const newChild = childFromRow(data);
    setChildren(cs => [...cs, newChild]);
    switchChild(newChild.id);
    return newChild.id;
  };

  const updateChild = (id, patch) => {
    setChildren(cs => cs.map(c => c.id === id ? { ...c, ...patch } : c));
    const dbPatch = {};
    if ("name" in patch) dbPatch.name = patch.name;
    if ("emoji" in patch) dbPatch.emoji = patch.emoji;
    if ("age" in patch) dbPatch.age = patch.age;
    if ("caregiverType" in patch) dbPatch.caregiver_type = patch.caregiverType;
    if ("scheduleItems" in patch) dbPatch.schedule_items = patch.scheduleItems;
    if ("history" in patch) dbPatch.history = patch.history;
    supabase.from("children").update(dbPatch).eq("id", id).then(({ error }) => { if (error) console.error("Failed to save child profile:", error.message); });
  };

  const activeChild = children.find(c => c.id === activeId) || children[0] || null;

  return { children, activeChild, addChild, updateChild, switchChild, loading, userId };
}

const DEFAULT_SCHEDULE = [
  { id: "s1", emoji: "🌅", label: "Wake Up",      time: "07:00" },
  { id: "s2", emoji: "🍳", label: "Breakfast",    time: "07:30" },
  { id: "s3", emoji: "🦷", label: "Brush Teeth",  time: "08:00" },
  { id: "s4", emoji: "🎨", label: "Activity Time",time: "09:00" },
  { id: "s5", emoji: "🥗", label: "Lunch",        time: "12:00" },
  { id: "s6", emoji: "😴", label: "Rest Time",    time: "13:00" },
];

const EMOJI_OPTS = ["🌅","🍳","🥗","🍎","🦷","🛁","👗","🎨","📚","🎮","🏃","🧩","🎵","🌳","😴","🚌","🏠","💊","🧸","🐾","🎭","🖥️","🏊","🛌","⭐","🎯","🏋️","🛝"];
//  EMOTION DATA
const EMOTIONS = [
  {
    id: "happy", emoji: "😊", label: "Happy", color: "#D97706", bg: "#FEF3C7",
    signs: [
      { title: "Happy stimming", body: "Hand flapping, clapping, rocking with a smile. Research confirms these are expressions of joy in autistic children — not problems to suppress." },
      { title: "Jumping or spinning", body: "Full-body excitement release. A 2020 Journal of Autism study found stimming amplifies joy the way laughter does for neurotypical children." },
      { title: "Happy sounds", body: "Squealing, humming, repeating favourite sounds. These are positive vocal stims — the child's version of laughing out loud." },
      { title: "Approaching you", body: "Moving closer, leaning in, brief eye contact — the child is seeking shared positive experience with someone they feel safe with." },
      { title: "Relaxed body", body: "Loose limbs, open posture, visible smile. Physical relaxation is one of the most reliable cross-cultural happiness signals, including in ASD." },
    ],
    actions: [
      { title: "Join in — don't stop it", body: "Mirror their joy. If they're flapping, flap with them. Research shows shared positive stimming deepens parent-child attachment in ASD." },
      { title: "Name what made them happy", body: "Point to the object or activity and say its name calmly. You are building a vocabulary of joy that your child can eventually use to ask for more." },
      { title: "Repeat it soon", body: "If something lit them up, offer it again within the next day. Positive emotional experiences build the neural pathways that support emotional stability." },
    ],
  },
  {
    id: "sad", emoji: "😢", label: "Sad", color: "#2563EB", bg: "#DBEAFE",
    signs: [
      { title: "Looking away more", body: "Gaze avoidance increases during sadness. Autistic children process sadness differently — reduced eye contact with familiar people is a key signal." },
      { title: "Retreating or hiding", body: "Moving to a corner, under a table, or to their room. This is internalized sadness, not rejection of you." },
      { title: "Flat expression", body: "May look blank or 'empty'. Research consistently shows autistic children feel emotions just as intensely — their faces just show it differently." },
      { title: "Going quiet", body: "A sudden drop in their usual noise level — fewer sounds, less stimming. Silence below their baseline is a meaningful signal." },
      { title: "Refusing preferred foods", body: "Emotionally-driven food refusal is documented in non-verbal ASD. When a child stops wanting their favourite thing, something emotional is happening." },
    ],
    actions: [
      { title: "Sit near them silently", body: "Your calm physical presence is more soothing than words. For non-verbal children, nearness without demand is the most regulating thing you can offer." },
      { title: "Offer their comfort object", body: "Without asking. Without talking. Just place it near them. Familiar objects reduce cortisol in autistic children during emotional distress." },
      { title: "Play a familiar calm song", body: "Music activates different brain pathways than speech. A known, gentle song can shift emotional state without requiring anything from the child." },
      { title: "Give it time", body: "Autistic children often need longer recovery time from sadness. Resist the urge to 'fix' it quickly. Presence without pressure is the intervention." },
    ],
  },
  {
    id: "angry", emoji: "😤", label: "Angry", color: "#DC2626", bg: "#FEE2E2",
    signs: [
      { title: "Self-injury (SIB)", body: "Head banging, biting self, hitting self. This is communicative — the child is expressing peak frustration they cannot put into words. It is not a behaviour problem." },
      { title: "Hitting or throwing", body: "Aggression peaks during unmet needs, transitions, or sensory overload — not due to bad character. The body is doing what the voice cannot." },
      { title: "Fast or loud breathing", body: "A physiological sign the nervous system is activating. This is the warning window before a meltdown — the moment to intervene calmly." },
      { title: "Pushing things away", body: "Forcefully rejecting objects, food, or people. Research identifies this as a primary non-verbal 'NO' in minimally verbal autistic children. Honour it." },
      { title: "Stomping or pacing", body: "Rhythmic physical release of anger. The body is discharging emotion the only way it knows how without language." },
    ],
    actions: [
      { title: "Regulate yourself first", body: "Your nervous system directly co-regulates your child's. Take one slow breath before responding. A calm parent is the most powerful de-escalation tool available." },
      { title: "Remove all demands", body: "Stop all instructions, questions, and requests the moment you see anger rising. Demands during dysregulation always make it worse — every time." },
      { title: "Reduce the environment", body: "Lower lights, mute sounds, reduce visual clutter. Give physical space without leaving them alone. The environment may be the cause." },
      { title: "Balloon breathing — together", body: "Once the peak passes (not during): inhale 4 counts, hold 4, exhale 6. Do it visibly yourself. Non-verbal children co-regulate through mirroring." },
      { title: "Find the trigger afterward", body: "When calm is restored, ask: what happened 5 minutes before? Transitions? Noise? Hunger? Identifying the trigger prevents the next episode." },
    ],
  },
  {
    id: "confused", emoji: "😕", label: "Confused", color: "#7C3AED", bg: "#EDE9FE",
    signs: [
      { title: "Stimming suddenly increases", body: "Escalating repetitive behaviours signal the nervous system is trying to self-regulate against confusion. It is not bad behaviour — it is a distress response." },
      { title: "Freezing mid-action", body: "Stopping suddenly and staring blankly. The brain has 'paused' to process. Research confirms this is cognitive overload, not defiance." },
      { title: "Hyperfocusing on one object", body: "Fixating on something predictable when the world feels unpredictable. It is self-grounding — the child is narrowing their sensory field to something manageable." },
      { title: "Sudden clinginess", body: "NIH research links confusion in ASD directly to anxiety spikes. Unexplained clinginess often means the child simply doesn't know what comes next." },
      { title: "Sensory seeking escalates", body: "Jumping, spinning, crashing — the brain is trying to re-orient itself using predictable physical input when the situation makes no sense." },
    ],
    actions: [
      { title: "Show, don't tell", body: "Point, gesture, demonstrate. For non-verbal children, visual and physical information bypasses the confusion that verbal language in a distressed state creates." },
      { title: "Go to the visual schedule", body: "Open it together. Point to what comes next. Predictability is the antidote to confusion — it instantly lowers the anxiety that drives the behaviour." },
      { title: "Slow everything down", body: "Move slower, speak slower, reduce background noise. A confused autistic brain needs processing time — urgency and speed make confusion dramatically worse." },
      { title: "Return to a known routine", body: "A familiar song, a known activity, a regular sequence. Predictable structure restores the sense of safety that confusion takes away." },
    ],
  },
  {
    id: "excited", emoji: "🤩", label: "Excited", color: "#6D28D9", bg: "#EDE9FE",
    signs: [
      { title: "Non-stop movement", body: "Running, spinning, jumping — the nervous system is flooded with positive arousal and the body is trying to release it. It looks like happiness, but it needs management." },
      { title: "Very loud vocalizations", body: "High-pitched squealing, screaming, or phrase repetition. Excitement overflow — the child's internal volume has exceeded their capacity to regulate." },
      { title: "Grabbing and touching", body: "Over-excitement can look like aggression. The child isn't trying to harm — their sensory system is flooded and reaching for input without impulse control." },
      { title: "Followed by a crash", body: "Research confirms autistic children frequently meltdown immediately after peak excitement. The nervous system cannot sustain the arousal flood — collapse follows." },
      { title: "Demanding repetition", body: "Wanting the same experience over and over. The brain is chasing the excitement peak and trying to hold on to it by repeating the trigger." },
    ],
    actions: [
      { title: "Go lower — not higher", body: "Lower your voice, slow your movements. Don't match their energy. Your regulated nervous system is the anchor they need when their own is flooding." },
      { title: "Use a visual countdown", body: "Show 5 fingers, then 3, then 1 before ending the exciting activity. Abrupt endings trigger meltdowns — the countdown provides a bridge to transition." },
      { title: "Play a wind-down song", body: "Create a specific calming song used only after exciting events. Over time, the song becomes a nervous system signal: excitement is ending, safety is here." },
      { title: "Schedule recovery time", body: "After known exciting events — parties, outings, school presentations — schedule 30–60 minutes of quiet time. This prevents the post-excitement meltdown." },
    ],
  },
];
//  BEHAVIOUR DATA
const BEHAVIOURS = [
  {
    id: "saliva", icon: "💧", label: "Playing with Saliva",
    urgency: null,
    summary: "Oral sensory seeking — not a habit or defiance.",
    source: "Behavior Analysis in Practice; NIH PMC; Griffin OT (2024)",
    why: [
      { title: "Oral sensory seeking", body: "The mouth has the densest sensory receptors in the body. Saliva provides texture, temperature, and wetness — a free, always-available sensory input for a child whose oral system is under-stimulated." },
      { title: "Proprioceptive regulation", body: "The jaw is one of the body's most powerful muscles. Oral activity sends strong proprioceptive signals that help organise and calm the nervous system." },
      { title: "A form of stimming", body: "Like hand-flapping or rocking, saliva play is repetitive, rhythmic, and calming. It is not a hygiene failure — it is self-regulation." },
      { title: "Low oral awareness", body: "Some autistic children have reduced sensory awareness around the mouth. They may not realise they are drooling or doing it at all." },
    ],
    actions: ["Rule out medical causes first — enlarged tonsils or oral motor weakness can increase drooling.", "Track when it happens: bored? Stressed? Excited? Timing reveals function.", "Offer safe alternatives: silicone chew necklaces, chewy foods, sour snacks.", "Never punish or shame — calmly redirect to a chew toy without drawing attention."],
  },
  {
    id: "eyepoke", icon: "👁️", label: "Digging Fingers into Eyes",
    urgency: "⚠️ Can damage vision over time. Requires consistent redirection.",
    summary: "Visual stimming — seeking phosphene light sensations.",
    source: "Blue ABA; Wonderbaby.org; Autism Research Institute",
    why: [
      { title: "Seeking phosphenes", body: "Pressing the eyes creates bright flashes of light (phosphenes) generated by pressure on the retina. For a visually under-stimulated child, this is genuinely fascinating and calming." },
      { title: "Activates the calm reflex", body: "Eye pressure activates the oculocardiac reflex, which slows the heart rate. The child may have discovered this accidentally and uses it to self-soothe." },
      { title: "Response to overwhelm", body: "Often escalates during sensory overload or anxiety — pressing the eyes shuts out chaotic external visual input and replaces it with predictable internal sensation." },
      { title: "Boredom", body: "In low-stimulation environments, pressing the eyes creates a more interesting visual experience than the surroundings." },
    ],
    actions: ["Get an eye exam first — undiagnosed vision problems can trigger this.", "Offer rich visual alternatives: lava lamps, fibre optic lights, glitter jars.", "Gently redirect hands to a fidget toy when you see it starting.", "🚨 If frequent and forceful: see an ophthalmologist — repeated pressure can damage the retina."],
  },
  {
    id: "skinpick", icon: "🩹", label: "Skin Picking Until Bleeding",
    urgency: "🚨 Medical alert — open wounds risk infection. Clean and cover immediately.",
    summary: "Sensory seeking or emotional dysregulation — not deliberate self-harm.",
    source: "CHOP Autism Roadmap; NIH PMC; Journal of Autism & Developmental Disorders (2024)",
    why: [
      { title: "Sensory seeking (most common)", body: "Research from CHOP confirms skin picking in ASD is primarily driven by the sensory feedback it provides — pressure, slight pain, and texture create an input that regulates an under-stimulated nervous system." },
      { title: "Emotional dysregulation outlet", body: "A 2024 NIH study found self-rubbing and scratching are most strongly linked to emotion dysregulation. When a child cannot express frustration or anxiety verbally, the body becomes the outlet." },
      { title: "Automatic reinforcement", body: "The behaviour itself feels good — creating an internal sensory reward that is very hard to extinguish without providing a meaningful replacement." },
      { title: "Anxiety and transition stress", body: "Picking escalates sharply during high-anxiety periods, transitions, or demand situations. It becomes a coping ritual — repetitive, predictable, calming." },
    ],
    actions: ["🚨 If bleeding: clean with antiseptic, cover, see a doctor if deep.", "Use physical barriers: soft gloves, long sleeves, bandaged target areas.", "Log: What happened before (trigger)? Where on body? What followed? This reveals function.", "Offer competing sensory input: textured fidgets, kinetic sand, bumpy mats.", "Request a Functional Behaviour Assessment (FBA) from a BCBA — this is the clinical gold standard."],
  },
  {
    id: "hairpull", icon: "🌀", label: "Pulling Own Hair",
    urgency: "⚠️ Bald patches need professional support. Swallowed hair can cause intestinal blockage.",
    summary: "Trichotillomania — sensory-compulsive behaviour, not a choice.",
    source: "NIH PMC11363882 (Cureus, 2024); Autism Research Institute",
    why: [
      { title: "Tactile sensory seeking", body: "The texture of hair between fingers and the sensation of pulling and release provides intense proprioceptive input. For sensory-seeking children, this is genuinely pleasurable." },
      { title: "Tension-release cycle", body: "A 2024 NIH study confirms hair pulling produces a 'sense of relief' — the nervous system experiences a brief tension-and-release that is immediately and powerfully calming." },
      { title: "Compulsive pattern", body: "Studies confirm 24.7% of autistic children have co-morbid compulsive behaviours including trichotillomania. The pulling becomes ritualistic and shares features with OCD-spectrum behaviours." },
      { title: "Anxiety response", body: "Escalates during transitions, new environments, or academic demands. It is a coping mechanism — predictable, controllable, immediately soothing for an overwhelmed nervous system." },
    ],
    actions: ["See a paediatrician or psychiatrist first to assess for co-occurring anxiety or OCD.", "Keep hands busy: fidget tools, textured gloves, putty, yarn balls.", "Use physical barriers at high-risk times: hats, hair clips, hoods.", "Ask your OT about Habit Reversal Training (HRT) adapted for ASD.", "🚨 If child swallows hair: seek medical attention immediately."],
  },
  {
    id: "pica", icon: "🚨", label: "Eating Non-Food Items (Pica)",
    urgency: "🚨 DANGEROUS — can cause poisoning, choking, blockage. Requires immediate medical assessment.",
    summary: "Affects 23–46% of autistic children. Sensory, nutritional, or compulsive in origin.",
    source: "Autism Research Institute; NIH PMC; DSM-5; Autism Parenting Magazine (2025)",
    why: [
      { title: "Oral sensory seeking", body: "The most common driver. Non-food items often provide stronger sensory feedback than food — more intense texture, temperature, or chewing resistance." },
      { title: "Nutritional deficiency", body: "NIH research links pica to iron, zinc, and calcium deficiencies — the body craves non-food items to compensate for missing minerals. Blood tests can identify this." },
      { title: "Compulsive and automatic", body: "For many children, pica becomes a compulsive routine maintained by automatic reinforcement — the eating itself feels rewarding regardless of environment." },
      { title: "Anxiety and overwhelm", body: "The oral act of eating activates the parasympathetic nervous system and has a genuine calming effect, even when the item is non-food." },
    ],
    actions: ["🚨 IMMEDIATELY: Remove paint chips, coins, batteries, soil from all accessible areas.", "See a doctor urgently — request blood tests for iron, zinc, calcium, and lead.", "Never leave unsupervised in environments where pica occurs.", "Offer safe oral alternatives: food-grade chew toys, crunchy foods, chewable sensory jewellery.", "🏥 If dangerous item swallowed (battery, coin, sharp object): go to A&E immediately."],
  },
];
//  SUBSIDIES DATA
const SUBSIDIES = [
  { id: "eipic", badge: "START HERE", badgeColor: T.red, icon: "🏥", label: "EIPIC", sub: "Early Intervention Programme", org: "SG Enable / MSF", amount: "$5–$430/month after subsidy", saving: "Saves up to $780/month vs unsubsidised. 30–70% off depending on income.", color: "#7C3AED", steps: ["Get your child assessed by a paediatrician at KKH, NUH, or SGH.", "Ask the doctor to refer your child to SG Enable for EIPIC placement.", "SG Enable contacts you and matches your child to a nearby centre.", "Centre assesses needs and calculates your means-tested subsidy.", "Enrol — fees range from $5 to $430/month for Singapore Citizens."], eligibility: "Singapore Citizen or PR, aged 6 or below, assessed by paediatrician.", contact: "SG Enable: 1800-8585-885", website: "enablingguide.sg", tip: "Waitlists can be 6–18 months — register early. Your spot is held from the referral date." },
  { id: "hcg", badge: "MONTHLY CASH", badgeColor: T.green, icon: "💵", label: "Home Caregiving Grant", sub: "HCG — Agency for Integrated Care", org: "AIC", amount: "$250–$400/month cash", saving: "Up to $4,800/year to offset therapy, transport, and caregiving costs.", color: T.green, steps: ["Child must be assessed as having permanent moderate-to-severe disability.", "For children under 8, assessment must be done by a paediatrician.", "Apply via AIC's eFASS portal using Singpass (online).", "Or visit any AIC Link office and fill in a printed form."], eligibility: "SC or PR. Monthly per-capita income ≤$3,600 or property AV ≤$21,000.", contact: "AIC: 1800-650-6060", website: "aic.sg", tip: "Budget 2025 enhanced HCG from April 2026. Apply now to lock in eligibility." },
  { id: "ctg", badge: "TRAINING", badgeColor: T.teal, icon: "📚", label: "Caregivers Training Grant", sub: "CTG — SG Enable / AIC", org: "SG Enable", amount: "$200/year for approved courses", saving: "Covers ABA, sensory, PECS, and autism management courses for parents.", color: T.teal, steps: ["Browse approved CTG courses on SG Enable or AIC website.", "Choose a course relevant to your child's needs (ABA, sensory, PECS).", "Apply for CTG when registering for the course.", "Complete the course and claim your subsidy."], eligibility: "Caregiver of a person with disability. $200 tied to care recipient per year.", contact: "SG Enable: 1800-8585-885", website: "sgenable.sg", tip: "Use CTG to fund courses that teach you the same techniques therapists use — directly applicable at home." },
  { id: "atf", badge: "DEVICES", badgeColor: "#8B5CF6", icon: "🦾", label: "Assistive Technology Fund", sub: "ATF — SG Enable", org: "SG Enable", amount: "Up to 90% subsidy, cap $40,000", saving: "A $2,000 AAC communication device can cost as little as $200 after subsidy.", color: "#8B5CF6", steps: ["Get a recommendation from your child's therapist, doctor, or school.", "Download the ATF application form from SG Enable's website.", "Submit with professional recommendation and device quotation.", "Once approved, purchase device and claim the subsidy."], eligibility: "Person with diagnosed disability. From Jan 2026: monthly PCI ≤$4,800.", contact: "SG Enable: 1800-8585-885", website: "enablingguide.sg", tip: "This fund covers AAC communication devices — tools that help non-verbal children speak. Life-changing." },
  { id: "comcare", badge: "FINANCIAL AID", badgeColor: T.inkSoft, icon: "🏢", label: "ComCare", sub: "MSF — Ministry of Social & Family Development", org: "MSF", amount: "Varies — living needs, transport, fees", saving: "Can cover therapy transport, school fees, and household bills.", color: T.inkSoft, steps: ["Visit supportgowhere.life.gov.sg to check qualifying schemes.", "Or walk into any Social Service Office (SSO) near you.", "Bring NRIC, child's birth cert, income docs, and medical reports.", "A social worker assesses your household holistically."], eligibility: "Singapore Citizens and PRs. Assessed holistically — no hard income cutoff.", contact: "MSF: 1800-222-0000 (Mon–Fri 9am–6pm)", website: "msf.gov.sg", tip: "ComCare SSOs are within 2km of 95% of HDB homes. Walk in — no appointment needed to start a conversation." },
];
//  SOS DATA
const SOS_CONTACTS = [
  { icon: "🏛️", label: "Autism Resource Centre (ARC)", number: "6278 5755", type: "Autism Specialist", color: T.purple },
  { icon: "🤝", label: "Autism Association Singapore", number: "6745 7144", type: "Autism Specialist", color: T.teal },
  { icon: "🏥", label: "Institute of Mental Health (IMH)", number: "6389 2000", type: "Mental Health · 24hr", color: T.purple },
  { icon: "🆘", label: "Samaritans of Singapore (SOS)", number: "1800 221 4444", type: "Crisis · 24hr Free", color: T.red },
  { icon: "👶", label: "KK Women's & Children's Hospital", number: "6225 5554", type: "Medical", color: T.amber },
  { icon: "🇸🇬", label: "SG Enable", number: "1800 8585 885", type: "Government", color: T.green },
  { icon: "🏢", label: "MSF ComCare Hotline", number: "1800 222 0000", type: "Government", color: T.inkSoft },
];
//  ACTIVITIES DATA
const ACTIVITIES = [
  {
    id: "sensory", emoji: "🎨", label: "Sensory", color: T.purple,
    freq: "Daily — 2–3 sessions of 15–20 min",
    source: "AJOT (2012); Pfeiffer et al. — 3×/week shows significant self-regulation gains in 6 weeks",
    tip: "A 15-minute sensory bin before school is more effective than an hour on weekends.",
    items: [
      { name: "Sensory Bins", desc: "Rice, kinetic sand, or water beads. Let the child explore freely with no goal.", benefit: "Tactile regulation · Fine motor" },
      { name: "Finger Painting", desc: "Safe paints or pudding on a tray. No pressure to make anything.", benefit: "Sensory tolerance · Creativity" },
      { name: "Playdough or Slime", desc: "Squeezing, rolling, pulling — deeply calming through proprioceptive input.", benefit: "Calming · Motor skills" },
      { name: "Water Exploration", desc: "Pouring between cups, splashing. Water is naturally regulating.", benefit: "Sensory integration" },
    ],
  },
  {
    id: "movement", emoji: "🏃", label: "Movement", color: T.teal,
    freq: "Daily — minimum 5 days/week, 20–30 min",
    source: "Lang et al. Journal of Autism (2010) — 3–5×/week reduces aggression, stereotypy, and off-task behaviour",
    tip: "Morning movement before learning activities improves focus and regulation for the rest of the day.",
    items: [
      { name: "Mini Trampoline", desc: "Jumping provides deep joint pressure — one of the most effective OT tools.", benefit: "Regulation · Energy release" },
      { name: "Kids' Yoga", desc: "Cat-cow, child's pose — simple poses done together. No experience needed.", benefit: "Breathing · Focus · Flexibility" },
      { name: "Home Obstacle Course", desc: "Pillows, tunnels, balance beams. Predictable physical challenges build confidence.", benefit: "Motor planning · Coordination" },
      { name: "Follow the Leader", desc: "Take turns copying movements. Teaches turn-taking through movement.", benefit: "Social skills · Imitation" },
    ],
  },
  {
    id: "communication", emoji: "🗣️", label: "Communication", color: T.amber,
    freq: "Daily — 5–10 minute bursts woven into natural routines",
    source: "Frost & Bondy PECS (2002); Ganz et al. (2012) — daily AAC across all environments produces fastest language gains",
    tip: "Mealtime, bathtime, dressing — every routine is a communication opportunity. No special session needed.",
    items: [
      { name: "Picture Exchange (PECS)", desc: "Printed pictures or apps — child points to what they want. Dramatically reduces frustration.", benefit: "Communication · Fewer meltdowns" },
      { name: "Cause-and-Effect Toys", desc: "Press button → music plays. Teaches intentional, purposeful communication.", benefit: "Language readiness · Agency" },
      { name: "Wordless Books", desc: "Child 'tells' the story using only pictures. No verbal pressure, pure expression.", benefit: "Joint attention · Imagination" },
      { name: "Singing Together", desc: "Music activates different pathways than speech. Many non-verbal children respond to song first.", benefit: "Language processing · Expression" },
    ],
  },
  {
    id: "social", emoji: "🧩", label: "Social Skills", color: T.green,
    freq: "3–5 times/week, 15–30 min structured + daily natural opportunities",
    source: "Kasari et al. (2012) — 3–5×/week structured joint engagement improved social communication significantly over 6 months",
    tip: "A turn-taking game at dinner 4 nights a week outperforms a weekly clinic session for skill retention.",
    items: [
      { name: "Turn-Taking Games", desc: "Simple board games or rolling a ball back and forth — teaches waiting and reciprocity.", benefit: "Social skills · Impulse control" },
      { name: "Sorting and Categorising", desc: "Sort by colour, shape, or size. Many autistic children love patterns — lean into it.", benefit: "Cognitive skills · Attention" },
      { name: "Lego or Block Construction", desc: "Free building or guided models. Lego therapy (LeGoff, 2004) shows measurable social gains.", benefit: "Problem-solving · Social skills" },
      { name: "Cooking Together", desc: "Stirring, pouring, washing produce — multi-sensory, functional, builds life skills.", benefit: "Sensory · Daily living" },
    ],
  },
];
//  MOTIVATIONAL QUOTES
const QUOTES = [
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
const db = {
  async get(key) {
    try { const r = await window.storage.get(key, true); if (r?.value) { try { localStorage.setItem("cb_" + key, r.value); } catch {} return JSON.parse(r.value); } } catch {}
    try { const l = localStorage.getItem("cb_" + key); if (l) return JSON.parse(l); } catch {}
    return null;
  },
  async set(key, val) {
    const s = JSON.stringify(val);
    try { await window.storage.set(key, s, true); } catch {}
    try { localStorage.setItem("cb_" + key, s); } catch {}
  },
};

const GROUP_ROOMS = [
  {
    id: "foster", label: "Foster Parents", desc: "HealthHub access, CDA, navigating the system",
    color: "#5B3FEE", bg: "#EDE9FE",
    svgIcon: (color) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 20 C11 20 2.5 14 2.5 8 C2.5 5 4.5 3 7 3 C8.5 3 10 4 11 5.5 C12 4 13.5 3 15 3 C17.5 3 19.5 5 19.5 8 C19.5 14 11 20 11 20Z" stroke={color} strokeWidth="1.4" fill={color} fillOpacity="0.12"/>
      </svg>
    ),
  },
  {
    id: "sg", label: "Singapore Resources", desc: "Subsidies, schools, therapists",
    color: T.green, bg: T.greenL,
    svgIcon: (color) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">

        <path d="M11 2C7.686 2 5 4.686 5 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6Z"
          stroke={color} strokeWidth="1.4" fill={color} fillOpacity="0.15"/>
        <circle cx="11" cy="8" r="2.5" fill={color} opacity="0.8"/>
      </svg>
    ),
  },
  {
    id: "community", label: "Parent Community", desc: "Open chat for all parents",
    color: T.purple, bg: T.purpleL,
    svgIcon: (color) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">

        <path d="M3 4 Q3 2 5 2 L14 2 Q16 2 16 4 L16 9 Q16 11 14 11 L8 11 L5 14 L5 11 Q3 11 3 9 Z"
          stroke={color} strokeWidth="1.3" fill={color} fillOpacity="0.12"/>
        <path d="M8 13 Q8 11.5 9.5 11.5 L17 11.5 Q19 11.5 19 13.5 L19 17 Q19 18.5 17 18.5 L15 18.5 L15 20.5 L13 18.5 L9.5 18.5 Q8 18.5 8 17 Z"
          stroke={color} strokeWidth="1.3" fill={color} fillOpacity="0.2"/>
      </svg>
    ),
  },
];
const COM_AVATAR_ILLUSTRATIONS = [
  { key: "leaf",    label: "Leaf",    render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><path d="M22 34 Q10 22 18 10 Q26 10 30 18 Q34 26 22 34Z" fill={a?"#1D9E75":"#7BA08A"} opacity="0.9"/><path d="M22 34 L22 16" stroke={a?"white":"#F2FAF6"} strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/><path d="M22 24 Q18 20 16 16" stroke={a?"white":"#F2FAF6"} strokeWidth="1" strokeLinecap="round" opacity="0.4"/><path d="M22 28 Q26 24 28 20" stroke={a?"white":"#F2FAF6"} strokeWidth="1" strokeLinecap="round" opacity="0.4"/></svg> },{ key: "lotus", label: "Lotus", render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><path d="M22 28 Q15 22 16 14 Q22 16 22 28Z" fill={a?"white":"#F2FAF6"} opacity="0.8"/><path d="M22 28 Q29 22 28 14 Q22 16 22 28Z" fill={a?"white":"#F2FAF6"} opacity="0.8"/><path d="M22 28 Q22 14 22 12" stroke={a?"white":"#F2FAF6"} strokeWidth="1" strokeLinecap="round" opacity="0.3"/><path d="M22 28 Q12 18 10 12 Q17 12 22 28Z" fill={a?"#1D9E75":"#7BA08A"} opacity="0.6"/><path d="M22 28 Q32 18 34 12 Q27 12 22 28Z" fill={a?"#1D9E75":"#7BA08A"} opacity="0.6"/><ellipse cx="22" cy="30" rx="8" ry="3" fill={a?"#1D9E75":"#7BA08A"} opacity="0.4"/></svg> },{ key: "mountain",label: "Mountain",render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><path d="M6 32 L16 14 L22 22 L28 14 L38 32Z" fill={a?"#1D9E75":"#7BA08A"} opacity="0.85"/><path d="M16 14 L22 22 L19 22 L16 14Z" fill={a?"white":"#F2FAF6"} opacity="0.6"/><path d="M28 14 L22 22 L25 22 L28 14Z" fill={a?"white":"#F2FAF6"} opacity="0.6"/><path d="M6 32 L38 32" stroke={a?"white":"#F2FAF6"} strokeWidth="1" strokeLinecap="round" opacity="0.3"/></svg> },{ key: "sun", label: "Sun", render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><circle cx="22" cy="22" r="8" fill={a?"#D97706":"#7BA08A"} opacity="0.9"/>{[0,45,90,135,180,225,270,315].map((deg,i)=>{const rad=deg*Math.PI/180;const x1=22+12*Math.cos(rad);const y1=22+12*Math.sin(rad);const x2=22+16*Math.cos(rad);const y2=22+16*Math.sin(rad);return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={a?"#D97706":"#7BA08A"} strokeWidth="1.5" strokeLinecap="round"/>})}</svg> },{ key: "moon", label: "Moon", render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><path d="M26 10 Q16 14 16 22 Q16 30 26 34 Q16 36 10 28 Q6 16 14 10 Q20 6 26 10Z" fill={a?"white":"#F2FAF6"} opacity="0.9"/><circle cx="30" cy="14" r="2" fill={a?"#D97706":"#7BA08A"} opacity="0.5"/><circle cx="32" cy="22" r="1.2" fill={a?"#D97706":"#7BA08A"} opacity="0.35"/></svg> },
  { key: "compass", label: "Compass", render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><circle cx="22" cy="22" r="12" stroke={a?"white":"#F2FAF6"} strokeWidth="1.3" fill="none" opacity="0.5"/><polygon points="22,12 24,22 22,32 20,22" fill={a?"white":"#F2FAF6"} opacity="0.9"/><polygon points="32,22 22,20 12,22 22,24" fill={a?"#D97706":"#7BA08A"} opacity="0.8"/><circle cx="22" cy="22" r="2" fill={a?"white":"#F2FAF6"}/></svg> },{ key: "wave", label: "Wave", render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><path d="M8 18 Q13 12 18 18 Q23 24 28 18 Q33 12 38 18" fill="none" stroke={a?"white":"#F2FAF6"} strokeWidth="2" strokeLinecap="round"/><path d="M8 24 Q13 18 18 24 Q23 30 28 24 Q33 18 38 24" fill="none" stroke={a?"#1D9E75":"#7BA08A"} strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/><path d="M8 30 Q13 24 18 30 Q23 36 28 30 Q33 24 38 30" fill="none" stroke={a?"#D97706":"#7BA08A"} strokeWidth="1" strokeLinecap="round" opacity="0.4"/></svg> },{ key: "diamond", label: "Gem", render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><polygon points="22,10 32,18 22,36 12,18" fill={a?"white":"#F2FAF6"} opacity="0.85"/><polygon points="12,18 22,18 16,10" fill={a?"#1D9E75":"#7BA08A"} opacity="0.6"/><polygon points="32,18 22,18 28,10" fill={a?"#1D9E75":"#7BA08A"} opacity="0.6"/><polygon points="12,18 22,18 22,36" fill={a?"white":"#F2FAF6"} opacity="0.5"/></svg> },{ key: "seed", label: "Grow", render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><path d="M22 34 L22 20" stroke={a?"white":"#F2FAF6"} strokeWidth="1.5" strokeLinecap="round"/><path d="M22 24 Q14 18 14 10 Q22 10 22 24" fill={a?"#1D9E75":"#7BA08A"} opacity="0.8"/><path d="M22 28 Q30 22 30 14 Q22 14 22 28" fill={a?"white":"#F2FAF6"} opacity="0.7"/></svg> },{ key: "spiral", label: "Journey", render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><path d="M22 22 Q30 14 30 22 Q30 32 20 32 Q10 32 10 20 Q10 10 22 10 Q36 10 36 22" fill="none" stroke={a?"white":"#F2FAF6"} strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/><circle cx="22" cy="22" r="2" fill={a?"#D97706":"#7BA08A"}/></svg> },
  { key: "heart",   label: "Heart",   render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><path d="M22 32 C22 32 10 24 10 16 C10 11 14 8 18 8 C20 8 22 10 22 10 C22 10 24 8 26 8 C30 8 34 11 34 16 C34 24 22 32 22 32Z" fill={a?"white":"#F2FAF6"} opacity="0.9"/><path d="M16 14 Q18 11 22 13" stroke={a?"#1D9E75":"#7BA08A"} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none"/></svg> },
  { key: "bridge",  label: "Bridge",  render: (a) => <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill={a?"#065F46":"#D4EAE0"}/><path d="M8 28 Q22 14 36 28" fill="none" stroke={a?"white":"#F2FAF6"} strokeWidth="2" strokeLinecap="round"/><line x1="14" y1="21" x2="14" y2="28" stroke={a?"white":"#F2FAF6"} strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/><line x1="22" y1="17" x2="22" y2="28" stroke={a?"white":"#F2FAF6"} strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/><line x1="30" y1="21" x2="30" y2="28" stroke={a?"white":"#F2FAF6"} strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/><line x1="8" y1="28" x2="36" y2="28" stroke={a?"#D97706":"#7BA08A"} strokeWidth="1.8" strokeLinecap="round"/></svg> },
];
const ComAvatar = ({ value, size = 36, active = false, borderColor = "transparent" }) => {
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
function FosterHubScreen({ pop }) {
  const [openSection, setOpenSection] = useState(null);

  const sections = [
    {
      id: "healthhub",
      color: T.purple,
      title: "HealthHub Access — What To Do Now",
      urgent: true,
      urgentNote: "MSF has acknowledged this gap and is working to fix it. Until then, here are your practical options.",
      content: [
        { heading: "Call the hospital directly", body: "Each hospital has a patient service centre. Call early morning (8–8:30am) for shortest wait times. Ask to be added as the 'primary contact' for appointment notifications — some hospitals can do this with your MSF letter." },
        { heading: "Carry your MSF foster caregiver letter always", body: "This letter identifies you as the child's caregiver under the fostering scheme. Present it at every appointment. Ask each specialist to note you as the contact person in their system." },
        { heading: "Request a patient liaison officer", body: "At KKH, NUH, and SGH, ask to speak with a Medical Social Worker or Patient Relations Officer. They can flag your case and help ensure appointment notifications reach you directly." },
        { heading: "Set up a shared notes document", body: "Create a simple Google Doc or note with all upcoming appointments, test results you've received, and key medical history you've observed. Bring this to every appointment as a substitute for the digital record you cannot access." },
        { heading: "MSF is fixing this", body: "MSF told CNA in 2025 that they are working with MOH to give all foster parents HealthHub access by the second half of 2025. Follow up with your Foster Care Worker for updates." },
      ]
    },
    {
      id: "cda",
      color: T.amber,
      title: "Child Development Account (CDA)",
      urgent: false,
      content: [
        { heading: "What is the CDA?", body: "A special savings account for your foster child's education and healthcare expenses. The government deposits a First Step Grant and co-matches your savings up to a cap — money your child is entitled to." },
        { heading: "If the CDA has not been set up", body: "Contact your Foster Care Worker immediately. Push for this to be set up as soon as possible — every month of delay is lost government co-matching. The Foster Care Worker can escalate to MSF on your behalf." },
        { heading: "If the account was set up but details went to biological parents", body: "Ask your Foster Care Worker to retrieve the account details from the biological parents through the formal MSF channel. Do not contact the biological parents directly — let the Foster Care Worker facilitate." },
        { heading: "What you can use CDA funds for", body: "Approved uses include early intervention programmes (EIPIC), therapy sessions, special education school fees, assistive technology, and medical appointments. Keep all receipts." },
      ]
    },
    {
      id: "parentsgateway",
      color: T.teal,
      title: "Parents Gateway & School Access",
      urgent: false,
      content: [
        { heading: "Ask the school directly", body: "Email or visit the school's General Office. Bring your MSF foster caregiver letter. Ask to be added as the primary contact in the school system. Schools can override the system — they just need to know you are the active caregiver." },
        { heading: "Request to be added to Parents Gateway", body: "The school administrator can add you manually. This is not automatic — you must ask. Be specific: 'I am the foster caregiver and I need to be added to Parents Gateway and set as the primary contact for all school communications.'" },
        { heading: "If biological parents remain primary contact", body: "Ask the school to add you as a second contact so you receive all the same notifications. Some schools will do this without removing the biological parents — which may be appropriate if reunification is the goal." },
        { heading: "What you might be missing", body: "If you are not on Parents Gateway: consent forms for school activities, medical consent forms, fee payment notices, school event announcements, emergency notifications. All of these go only to the listed contacts." },
      ]
    },
    {
      id: "appointments",
      color: T.green,
      title: "Navigating Medical Appointments",
      urgent: false,
      content: [
        { heading: "What to bring to every appointment", body: "Your MSF foster caregiver letter, a written summary of behaviours and symptoms you have observed, any test results you have physical copies of, and a list of current medications." },
        { heading: "Script for introducing yourself to doctors", body: "Say to the doctor: I am the foster caregiver for this child under the MSF fostering scheme. I do not have HealthHub access but I provide daily care. Please add me as the contact for all future appointment notifications and test results. Here is my MSF caregiver letter." },
        { heading: "If both you and biological parents are present", body: "You have the right to be there as the active caregiver. If you feel uncomfortable, speak to a Medical Social Worker at the hospital before the appointment. You can request separate appointments where clinically appropriate." },
        { heading: "Documenting what you observe", body: "Keep a simple daily log of behaviours, sleep patterns, eating, meltdowns, and communication changes. This is your medical record substitute. Doctors — especially for non-verbal children — rely heavily on caregiver observation reports." },
      ]
    },
    {
      id: "subsidies",
      color: "#8B5CF6",
      title: "Subsidies & Financial Support for Foster Families",
      urgent: false,
      content: [
        { heading: "Fostering Allowance", body: "MSF provides SGD $1,100–$1,800/month depending on the child's age and needs. This is meant to cover childcare and out-of-pocket expenses. If your foster child has significant special needs, ask your Foster Care Worker about enhanced allowance options." },
        { heading: "EIPIC", body: "Foster children aged 6 and below with developmental needs are eligible for EIPIC (Early Intervention Programme). Fees after subsidy can be as low as $5/month. Ask your Foster Care Worker to facilitate the referral — you may need MSF's help since the child is in the fostering system." },
        { heading: "Assistive Technology Fund (ATF)", body: "Covers up to 90% of approved assistive devices — communication apps, AAC devices, sensory tools. Lifetime cap of $40,000. Requires a professional recommendation. Ask your Foster Care Worker to help you apply." },
        { heading: "MediFund Junior", body: "If your foster child has outstanding medical bills that subsidies do not fully cover, ask to speak to a Medical Social Worker at the hospital to apply for MediFund Junior as a safety net." },
        { heading: "ComCare", body: "If you are facing financial hardship as a foster caregiver, ComCare can provide additional support. Visit your nearest Social Service Office — no appointment needed." },
      ]
    },
    {
      id: "support",
      color: T.green,
      title: "Support Organisations for Foster Parents",
      urgent: false,
      content: [
        { heading: "Home for Good Singapore", body: "The main charity supporting foster families in Singapore. Programmes include Buddy for Good (trained befrienders) and Mentor for Good (experienced foster parents paired with newer ones). Contact: hfg.org.sg" },
        { heading: "MSF Foster Care Hotline", body: "1800-222-0000 (Mon–Fri 9am–6pm). For urgent foster care concerns, ask to speak with your assigned Foster Care Worker directly." },
        { heading: "Community Chapters", body: "Home for Good runs regular community gatherings for foster families. These are invaluable — other foster parents are the most practical source of advice for navigating the system." },
        { heading: "Bonda Community", body: "In the Community tab, look for the Singapore Resources room — share what has worked for you and ask other parents for advice. You are not the only one navigating this." },
      ]
    },
  ];

  return (
    <Page>

      <div style={{ background: T.ink, borderRadius: T.rL, padding: 22, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M13 23 C13 23 3 16.5 3 9.5 C3 6 5.5 3.5 8.5 3.5 C10.5 3.5 12 4.5 13 6.5 C14 4.5 15.5 3.5 17.5 3.5 C20.5 3.5 23 6 23 9.5 C23 16.5 13 23 13 23Z" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.15"/>
            </svg>
          </div>
          <div>
            <p style={{ margin: "0 0 2px", color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>For Foster Caregivers</p>
            <p style={{ margin: 0, color: "white", fontSize: 18, fontWeight: 800 }}>Foster Parent Hub</p>
          </div>
        </div>
        <p style={{ margin: "0 0 14px", color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.7 }}>You are doing one of the most demanding jobs in Singapore's child welfare system — often without the digital access that biological parents take for granted. This hub is built for you.</p>
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: T.r, padding: "10px 14px" }}>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 700, lineHeight: 1.6 }}>💛 MSF acknowledged in 2025 that HealthHub access for foster parents is a gap they are actively fixing. Until then — Bonda is here.</p>
        </div>
      </div>


      <div style={{ background: T.redL, borderRadius: T.r, padding: "12px 14px", marginBottom: 20, border: `1.5px solid ${T.red}25`, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: T.red, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 3 L5 5.5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/><circle cx="5" cy="7.5" r="0.8" fill="white"/></svg>
        </div>
        <p style={{ margin: 0, color: T.red, fontSize: 12, fontWeight: 700, lineHeight: 1.65 }}>If you have lost HealthHub access for your foster child — you are not alone. This was raised in Parliament in April 2025. Tap "HealthHub Access" below for what to do right now.</p>
      </div>


      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sections.map(sec => (
          <Card key={sec.id} style={{ padding: 0, overflow: "hidden" }}>
            <div onClick={() => setOpenSection(openSection === sec.id ? null : sec.id)}
              style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: openSection === sec.id ? sec.color + "10" : T.surface }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: sec.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${sec.color}22` }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="6.5" stroke={sec.color} strokeWidth="1.4" fill={sec.color} fillOpacity="0.12"/>
                  <circle cx="9" cy="9" r="2.5" fill={sec.color} opacity="0.7"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 800, color: openSection === sec.id ? sec.color : T.ink, fontSize: 14 }}>{sec.title}</p>
                {sec.urgent && <Badge color={T.red} bg={T.redL}>Action needed</Badge>}
              </div>
              <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 20, transform: openSection === sec.id ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block", flexShrink: 0 }}>+</span>
            </div>
            {openSection === sec.id && (
              <div style={{ padding: "0 16px 16px" }}>
                {sec.urgentNote && (
                  <div style={{ background: T.amberL, borderRadius: T.r, padding: "10px 12px", marginBottom: 14, border: `1px solid ${T.amber}25` }}>
                    <p style={{ margin: 0, color: T.amber, fontSize: 12, fontWeight: 700, lineHeight: 1.6 }}>💡 {sec.urgentNote}</p>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {sec.content.map((item, i) => (
                    <div key={i} style={{ padding: "12px 14px", background: T.canvas, borderRadius: T.r, borderLeft: `3px solid ${sec.color}` }}>
                      <p style={{ margin: "0 0 6px", fontWeight: 800, color: T.ink, fontSize: 13 }}>{item.heading}</p>
                      <p style={{ margin: 0, color: T.inkSoft, fontSize: 13, lineHeight: 1.7 }}>{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 20, padding: "14px 16px", background: T.purpleL, borderRadius: T.r, border: `1px solid ${T.purple}20` }}>
        <p style={{ margin: "0 0 6px", fontWeight: 800, color: T.purple, fontSize: 13 }}>You are not just a caregiver. You are an advocate.</p>
        <p style={{ margin: 0, color: T.inkSoft, fontSize: 12, lineHeight: 1.7 }}>Every system access you fight for, every appointment you track, every piece of information you document — you are doing it for a child who cannot do it themselves. That matters.</p>
      </div>
    </Page>
  );
}

function HomeScreen({ childCtx, setTab, push }) {
  const { children, activeChild, switchChild } = childCtx;
  const [qIdx, setQIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [seen, setSeen] = useState([]);
  const [fade, setFade] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setQIdx(prev => {
          const newSeen = [...seen, prev];
          const pool = QUOTES.map((_, i) => i).filter(i => !newSeen.includes(i));
          const next = pool.length ? pool[Math.floor(Math.random() * pool.length)] : Math.floor(Math.random() * QUOTES.length);
          setSeen(pool.length ? newSeen : [prev]);
          return next;
        });
        setFade(true);
      }, 300);
    }, 6000);
    return () => clearInterval(t);
  }, [paused, seen, qIdx]);

  const q = QUOTES[qIdx];

  const isFoster = activeChild?.caregiverType === "foster";

  const quickActions = [
    ...(isFoster ? [{ type: "foster", label: "Foster Parent Hub", desc: "HealthHub, CDA, school access guides", action: () => push("fosterHub"), isFoster: true }] : []),
    { type: "subsidies", label: "Subsidies & Grants", desc: "Singapore financial aid guide", action: () => push("subsidies") },
    { type: "sos", label: "Emergency Contacts", desc: "Singapore autism helplines", action: () => push("sos") },
    { type: "activities", label: "Activity Guide", desc: "Research-backed home therapy", action: () => push("activities") },
    { type: "training", label: "Behaviour Training", desc: "Teaching good behaviours", action: () => push("training") },
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
            <button onClick={() => setTab("schedule")} style={{ background: T.purple, color: "white", border: "none", borderRadius: T.r, padding: "8px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: T.fontBody }}>Schedule →</button>
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


      <div style={{ marginTop: 16, padding: "14px 16px", background: T.greenL, borderRadius: T.r, border: `1px solid ${T.green}25` }}>
        <p style={{ margin: 0, color: T.green, fontSize: 12, fontWeight: 700, lineHeight: 1.7 }}>1 in 150 children in Singapore is autistic. Government subsidies can reduce early intervention costs by 30–70%. Tap <strong>Subsidies</strong> above to find out what you qualify for.</p>
      </div>

      <p style={{ textAlign: "center", marginTop: 28, marginBottom: 0, color: T.inkMuted, fontSize: 10, fontWeight: 600, letterSpacing: "0.05em" }}>◎ Bonda · Made with 💛 by Norena Darsana</p>
    </Page>
  );
}
function AddChildScreen({ childCtx, pop }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("none");
  const [photo, setPhoto] = useState(null);
  const [age, setAge] = useState("");
  const [caregiverType, setCaregiverType] = useState("biological");
  const [err, setErr] = useState("");
  const [photoErr, setPhotoErr] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraErr, setCameraErr] = useState("");
  const [cameraSupported, setCameraSupported] = useState(true);
  const { addChild } = childCtx;

  // Silently check camera availability on mount — hide button if not supported
  useEffect(() => {
    const check = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraSupported(false); return;
        }
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(d => d.kind === "videoinput");
        setCameraSupported(hasCamera);
      } catch { setCameraSupported(false); }
    };
    check();
  }, []);

  const openCamera = async () => {
    setCameraErr("");
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
    } catch {
      // Don't show error — just hide the button
      setCameraSupported(false);
    }
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

  useEffect(() => () => stopCamera(), []);

  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) return setErr("Please enter your child's name.");
    setErr(""); setSaving(true);
    const id = await addChild({ name: name.trim(), emoji: photo || emoji, age: age.trim(), caregiverType });
    setSaving(false);
    if (!id) return setErr("Could not save the profile. Please try again.");
    pop();
  };

  const isPhotoSelected = photo && photo.startsWith("data:");

  return (
    <Page>
      <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: T.ink }}>Add a Child Profile</h2>
      <p style={{ margin: "0 0 24px", color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Each child gets their own schedule, emotion log, and history. You can switch between children anytime.</p>

      <SectionLabel style={{ marginBottom: 10 }}>Profile Picture</SectionLabel>


      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, padding: "14px 16px", background: T.purpleL, borderRadius: T.r }}>

        <ChildAvatar value={photo || emoji} size={60} active={true} borderColor={T.purple} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: T.inkSoft }}>
            {isPhotoSelected ? "Photo added ✓ — or choose an avatar below" : "Add a real photo (optional) — or pick an avatar below"}
          </p>
          <div style={{ display: "flex", gap: 8 }}>

            <label style={{ flex: 1, background: T.purple, color: "white", borderRadius: T.r, padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "center", fontFamily: T.fontBody, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <span style={{ fontSize: 15 }}>+</span> Upload
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 2 * 1024 * 1024) return setPhotoErr("Photo must be under 2 MB.");
                const reader = new FileReader();
                reader.onload = ev => { setPhoto(ev.target.result); setPhotoErr(""); };
                reader.readAsDataURL(file);
              }} />
            </label>

            {cameraSupported && (
              <button onClick={openCamera} style={{ flex: 1, background: T.surface, color: T.purple, borderRadius: T.r, padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${T.purple}`, fontFamily: T.fontBody, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                <span style={{ fontSize: 15 }}>+</span> Camera
              </button>
            )}

            {isPhotoSelected && (
              <button onClick={() => { setPhoto(null); }} style={{ background: T.redL, color: T.red, borderRadius: T.r, padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: T.fontBody }}>✕</button>
            )}
          </div>
          {photoErr && <p style={{ margin: "6px 0 0", color: T.red, fontSize: 11, fontWeight: 700 }}>{photoErr}</p>}

        </div>
      </div>


      {showCamera && (
        <div style={{ marginBottom: 16, background: "#000", borderRadius: T.r, overflow: "hidden" }}>
          <video ref={videoRef} style={{ width: "100%", display: "block", aspectRatio: "4/3", objectFit: "cover" }} muted playsInline />
          <div style={{ display: "flex", gap: 8, padding: "10px 12px", background: "#111" }}>
            <Btn onClick={takePhoto} disabled={!cameraReady} style={{ flex: 1, background: cameraReady ? T.green : T.border }}>
              📸 Take Photo
            </Btn>
            <Btn onClick={stopCamera} secondary style={{ flex: 1 }}>Cancel</Btn>
          </div>
        </div>
      )}


      <SectionLabel style={{ marginBottom: 10 }}>Or choose an illustrated avatar</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24, opacity: isPhotoSelected ? 0.4 : 1, transition: "opacity 0.2s" }}>
        {AvatarIllustrations.map(av => {
          const isActive = !isPhotoSelected && emoji === av.key;
          return (
            <div key={av.key} onClick={() => { if (!isPhotoSelected) { setEmoji(av.key); } }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: isPhotoSelected ? "default" : "pointer" }}>
              <div style={{ border: `2.5px solid ${isActive ? T.purple : "transparent"}`, borderRadius: "50%", padding: 1, transform: isActive ? "scale(1.08)" : "scale(1)", transition: "all 0.15s" }}>
                {av.render(isActive)}
              </div>
              <p style={{ margin: 0, fontSize: 9, fontWeight: isActive ? 800 : 600, color: isActive ? T.purple : T.inkMuted, letterSpacing: "0.03em" }}>{av.label}</p>
            </div>
          );
        })}
      </div>

      <Input label="Child's name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aiden" />
      <Input label="Age (optional)" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 5 years old" type="text" />


      <SectionLabel style={{ marginBottom: 10 }}>Your relationship to this child</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {[
          { key: "biological", label: "Biological or Adoptive Parent", icon: (a) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.5" stroke={a?"white":T.purple} strokeWidth="1.4" fill={a?"white":T.purple} fillOpacity={a?0.3:0.15}/><path d="M2.5 16 Q2.5 11.5 9 11.5 Q15.5 11.5 15.5 16" stroke={a?"white":T.purple} strokeWidth="1.4" strokeLinecap="round" fill="none"/></svg> },
          { key: "foster",     label: "Foster Parent",                icon: (a) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 16 C9 16 2 11.5 2 6.5 C2 4 3.5 2.5 5.5 2.5 C7 2.5 8 3.5 9 5 C10 3.5 11 2.5 12.5 2.5 C14.5 2.5 16 4 16 6.5 C16 11.5 9 16 9 16Z" stroke={a?"white":T.purple} strokeWidth="1.4" fill={a?"white":T.purple} fillOpacity={a?0.3:0.15}/></svg> },
          { key: "grandparent",label: "Grandparent / Extended Family", icon: (a) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="5.5" r="2.8" stroke={a?"white":T.purple} strokeWidth="1.3" fill="none"/><circle cx="13" cy="6" r="2.2" stroke={a?"white":T.purple} strokeWidth="1.2" fill="none" opacity="0.6"/><path d="M1.5 15 Q1.5 11 7 11 Q12.5 11 12.5 15" stroke={a?"white":T.purple} strokeWidth="1.3" strokeLinecap="round" fill="none"/><path d="M12.5 13.5 Q13 11.5 15.5 11.5 Q17 11.5 17 13.5" stroke={a?"white":T.purple} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/></svg> },
          { key: "other",      label: "Other Caregiver",              icon: (a) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.5" stroke={a?"white":T.purple} strokeWidth="1.4" fill="none"/><path d="M2.5 16 Q2.5 11.5 9 11.5 Q15.5 11.5 15.5 16" stroke={a?"white":T.purple} strokeWidth="1.4" strokeLinecap="round" fill="none"/><path d="M9 3 L9 3.1 M9 7 L9 9" stroke={a?"white":T.purple} strokeWidth="1.6" strokeLinecap="round" opacity="0.5"/></svg> },
        ].map(({ key, label, icon }) => {
          const isActive = caregiverType === key;
          return (
            <div key={key} onClick={() => setCaregiverType(key)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: T.r, background: isActive ? T.purple : T.surface, border: `1.5px solid ${isActive ? T.purple : T.border}`, cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: isActive ? "rgba(255,255,255,0.2)" : T.purpleL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {icon(isActive)}
              </div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: isActive ? "white" : T.ink }}>{label}</p>
              {isActive && (
                <div style={{ marginLeft: "auto", width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5 L4 7 L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {err && <p style={{ color: T.red, fontSize: 13, fontWeight: 700, margin: "-8px 0 12px" }}>{err}</p>}
      <Btn onClick={save} full disabled={saving}>{saving ? "Saving..." : "Save Profile"}</Btn>
      <Btn onClick={pop} full secondary style={{ marginTop: 10 }}>Cancel</Btn>
    </Page>
  );
}
function MyChildScreen({ childCtx }) {
  const [subTab, setSubTab] = useState("emotions"); // emotions | behaviours
  const [activeEmotion, setActiveEmotion] = useState(null);
  const [emotionTab, setEmotionTab] = useState("signs"); // signs | actions
  const [activeBehaviour, setActiveBehaviour] = useState(null);

  if (activeBehaviour) return <BehaviourDetail b={activeBehaviour} onBack={() => setActiveBehaviour(null)} />;
  if (activeEmotion) return <EmotionDetail e={activeEmotion} tab={emotionTab} setTab={setEmotionTab} onBack={() => setActiveEmotion(null)} />;

  const isFosterChild = childCtx?.activeChild?.caregiverType === "foster";

  return (
    <Page>

      {isFosterChild && (
        <div style={{ background: T.ink, borderRadius: T.r, padding: "12px 14px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 16 C9 16 2 11.5 2 6.5 C2 4 3.5 2.5 5.5 2.5 C7 2.5 8 3.5 9 5 C10 3.5 11 2.5 12.5 2.5 C14.5 2.5 16 4 16 6.5 C16 11.5 9 16 9 16Z" stroke="white" strokeWidth="1.4" fill="white" fillOpacity="0.2"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 2px", color: "white", fontWeight: 800, fontSize: 13 }}>Foster Child Profile</p>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: 11, lineHeight: 1.5 }}>No medical records? Use this guide to document observations and prepare for appointments.</p>
          </div>
        </div>
      )}

      <div style={{ display: "flex", background: T.border, borderRadius: T.r, padding: 3, gap: 3, marginBottom: 24 }}>
        {[["emotions","Emotions"],["behaviours","Behaviours"]].map(([v, l]) => (
          <button key={v} onClick={() => setSubTab(v)} style={{ flex: 1, padding: "10px", borderRadius: 9, background: subTab === v ? T.surface : "transparent", border: "none", fontWeight: 700, fontSize: 13, color: subTab === v ? T.ink : T.inkMuted, cursor: "pointer", fontFamily: T.fontBody, boxShadow: subTab === v ? T.shadow : "none", transition: "all 0.2s" }}>{l}</button>
        ))}
      </div>

      {subTab === "emotions" && (
        <>
          <p style={{ margin: "0 0 14px", color: T.inkSoft, fontSize: 13, lineHeight: 1.6 }}>Tap an emotion to see what it looks like in a non-verbal autistic child — and exactly what to do.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {EMOTIONS.map(e => (
              <Card key={e.id} onClick={() => { setActiveEmotion(e); setEmotionTab("signs"); }} style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0, overflow: "hidden" }}>
                    <EmotionIllustration id={e.id} size={48} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 3px", fontWeight: 800, color: e.color, fontSize: 15 }}>{e.label}</p>
                    <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>{e.signs.length} signs · {e.actions.length} actions</p>
                  </div>
                  <span style={{ color: T.inkMuted, fontSize: 20 }}>›</span>
                </div>
              </Card>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: "14px 16px", background: T.amberL, borderRadius: T.r, border: `1px solid ${T.amber}25` }}>
            <p style={{ margin: 0, color: T.amber, fontSize: 12, fontWeight: 700, lineHeight: 1.7 }}>🧭 Every autistic child is different. Bonda gives you <strong>frameworks, not prescriptions</strong>. Use what fits your child, leave what doesn't. You know them best.</p>
          </div>
        </>
      )}

      {subTab === "behaviours" && (
        <>
          <p style={{ margin: "0 0 14px", color: T.inkSoft, fontSize: 13, lineHeight: 1.6 }}>Research-backed explanations of specific behaviours parents find confusing or worrying — with practical steps.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {BEHAVIOURS.map(b => (
              <Card key={b.id} onClick={() => setActiveBehaviour(b)} style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: b.urgency ? T.redL : T.purpleL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1.5px solid ${b.urgency ? T.red + "25" : T.purple + "20"}` }}>
                    <span style={{ fontSize: 24, lineHeight: 1 }}>{b.icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <p style={{ margin: 0, fontWeight: 800, color: T.ink, fontSize: 14 }}>{b.label}</p>
                      {b.urgency && <Badge color={T.red} bg={T.redL}>URGENT</Badge>}
                    </div>
                    <p style={{ margin: 0, color: T.inkMuted, fontSize: 12, lineHeight: 1.4 }}>{b.summary}</p>
                  </div>
                  <span style={{ color: T.inkMuted, fontSize: 20 }}>›</span>
                </div>
              </Card>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: "14px 16px", background: T.amberL, borderRadius: T.r }}>
            <p style={{ margin: 0, color: T.amber, fontSize: 12, fontWeight: 700, lineHeight: 1.7 }}>💡 Every behaviour is communication. Before trying to stop it, ask: <em>what is my child trying to tell me?</em> Understanding function is the key to finding a real solution.</p>
          </div>
        </>
      )}
    </Page>
  );
}
// Every sign/action has its own icon that relates to its meaning.
// Stroke-based, refined geometry, consistent 18×18 viewBox.
const SEMANTIC_ICONS = {
  "Happy stimming":
    <><path d="M5 13 Q9 16 13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M4 8 Q4 5 7 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M14 8 Q14 5 11 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M6 9 L5 7 M12 9 L13 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/></>,
  "Jumping or spinning":
    <><circle cx="9" cy="4" r="2" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M7 6.5 L5 10 L8 9 L9 13 L10 9 L13 10 L11 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M6 15 L12 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/></>,
  "Happy sounds":
    <><path d="M5 6 Q5 9 5 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.35"/>
      <path d="M8 4 Q8 9 8 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
      <path d="M11 5.5 Q11 9 11 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M14 7 Q14 9 14 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.45"/>
      <path d="M4 9 Q9 6 14 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.2" fill="none"/></>,
  "Approaching you":
    <><circle cx="13" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M13 6.5 L13 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M11 8.5 L13 11 L15 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5"/>
      <path d="M4 14 L10 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M4 10 L4 14 L8 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  "Relaxed body":
    <><path d="M5 9 Q9 5 13 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M4 12 Q9 16 14 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.5"/>
      <circle cx="9" cy="9" r="1.5" fill="currentColor" opacity="0.7"/></>,
  "Join in — don't stop it":
    <><circle cx="5.5" cy="9" r="3" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <circle cx="12.5" cy="9" r="3" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M8.5 9 L9.5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M5.5 6 L5.5 4 M12.5 6 L12.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/></>,
  "Name what made them happy":
    <><rect x="3" y="4" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M6 7.5 L12 7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M6 10 L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
      <path d="M13 2 L15 4 L13 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6"/></>,
  "Repeat it soon":
    <><path d="M4 9 Q4 4 9 4 Q14 4 14 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M14 9 Q14 14 9 14 Q4 14 4 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M12 6.5 L14 9 L16 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="9" cy="9" r="1.5" fill="currentColor" opacity="0.7"/></>,
  "Looking away more":
    <><ellipse cx="9" cy="9" rx="6" ry="4" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <circle cx="9" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <circle cx="9" cy="9" r="0.8" fill="currentColor"/>
      <path d="M13.5 4.5 L15.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/></>,
  "Retreating or hiding":
    <><path d="M9 14 L9 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M6 5 L9 8 L12 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M3 14 L15 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/>
      <path d="M5 11 L4 14 M13 11 L14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/></>,
  "Flat expression":
    <><circle cx="9" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <circle cx="7" cy="7" r="0.8" fill="currentColor"/>
      <circle cx="11" cy="7" r="0.8" fill="currentColor"/>
      <path d="M6.5 10.5 L11.5 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></>,
  "Going quiet":
    <><path d="M7 5 L7 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.2"/>
      <path d="M10 7 L10 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.3"/>
      <path d="M13 8 L13 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.2"/>
      <path d="M3 9 L15 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.1"/>
      <path d="M4 6 L4 6.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6"/></>,
  "Refusing preferred foods":
    <><circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M5.5 9 L12.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M6 6 L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/></>,
  "Sit near them silently":
    <><circle cx="6" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M4 14 L4 10 Q6 8 8 10 L8 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M10 14 L10 10 Q12 8 14 10 L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M8 12 L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/></>,
  "Offer their comfort object":
    <><path d="M9 14 C9 14 3.5 10.5 3.5 6.5 C3.5 4.5 5 3 6.5 3 C7.5 3 8.5 3.5 9 4.5 C9.5 3.5 10.5 3 11.5 3 C13 3 14.5 4.5 14.5 6.5 C14.5 10.5 9 14 9 14Z" stroke="currentColor" strokeWidth="1.4" fill="none"/></>,
  "Play a familiar calm song":
    <><path d="M7.5 13 L7.5 6 L13.5 5 L13.5 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="6.5" cy="13" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <circle cx="12.5" cy="12" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/></>,
  "Give it time":
    <><circle cx="9" cy="9.5" r="6" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M9 6 L9 10 L12 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 2.5 L11 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/></>,
  "Self-injury (SIB)":
    <><path d="M5 5 L13 13 M13 5 L5 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.7"/>
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.3" fill="none"/></>,
  "Hitting or throwing":
    <><path d="M4 13 L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 4 L14 4 L14 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="14" cy="4" r="1.5" fill="currentColor" opacity="0.6"/>
      <path d="M4 13 L4 16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/></>,
  "Fast or loud breathing":
    <><path d="M3 9 Q5 5 7 9 Q9 13 11 9 Q13 5 15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M3 12 Q6 10 9 12 Q12 14 15 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3"/></>,
  "Pushing things away":
    <><path d="M12 9 L5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M7 6 L4 9 L7 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M14 5 L14 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M14 5 L16 5 M14 13 L16 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/></>,
  "Stomping or pacing":
    <><ellipse cx="7" cy="14" rx="3" ry="1.5" stroke="currentColor" strokeWidth="1.3" fill="none" opacity="0.4"/>
      <path d="M7 14 L7 8 L6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M7 8 L10 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M3 9 Q7 7 11 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3" strokeDasharray="2 2"/></>,
  "Regulate yourself first":
    <><circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M9 5.5 L9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M6 7 Q9 10 12 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.5"/>
      <circle cx="9" cy="9" r="1.2" fill="currentColor" opacity="0.6"/></>,
  "Remove all demands":
    <><path d="M4 9 L14 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 6 L15 9 L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M5 5 L5 7 M8 4 L8 7 M11 5 L11 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35"/></>,
  "Reduce the environment":
    <><path d="M3 10 L9 4 L15 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M5 10 L5 15 L13 15 L13 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M7 15 L7 12 L11 12 L11 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M2 9 L4 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/></>,
  "Balloon breathing — together":
    <><circle cx="9" cy="8" r="5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M9 13 L9 16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
      <path d="M7 15.5 L11 15.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/>
      <path d="M6.5 7.5 Q9 6 11.5 7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.5"/></>,
  "Find the trigger afterward":
    <><circle cx="7.5" cy="7.5" r="4.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M11 11 L15 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M5.5 7.5 L9.5 7.5 M7.5 5.5 L7.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/></>,
  "Stimming suddenly increases":
    <><path d="M3 13 Q5 9 7 11 Q9 13 11 7 Q13 1 15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M13 3 L15 5 L13 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  "Freezing mid-action":
    <><circle cx="9" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M9 6.5 L9 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M6 9 L9 12 L12 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.4"/>
      <path d="M6 13 L12 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.7"/>
      <path d="M4 15 L14 15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.25"/></>,
  "Hyperfocusing on one object":
    <><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.6"/>
      <circle cx="8" cy="8" r="1" fill="currentColor"/>
      <path d="M12 12 L15.5 15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></>,
  "Sudden clinginess":
    <><circle cx="6" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M9 7.5 Q6 8 5 11 L5 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M9 7.5 Q12 8 13 11 L13 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M7 11 Q9 10 11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></>,
  "Sensory seeking escalates":
    <><path d="M4 14 Q4 9 9 9 Q14 9 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M4 11 Q6.5 8 9 8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4"/>
      <path d="M6 8 Q9 4 12 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M8 6 Q9 3 10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></>,
  "Show, don't tell":
    <><rect x="3" y="4" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M8 12 L8 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/>
      <path d="M5 15 L11 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/>
      <path d="M14 7 L16 9 L14 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M13 9 L16 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></>,
  "Go to the visual schedule":
    <><rect x="3" y="3" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M6 3 L6 5 M12 3 L12 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M5 8.5 L13 8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
      <path d="M6 11 L9 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.7"/></>,
  "Slow everything down":
    <><circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M9 5 L9 9.5 L12.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 2.5 L12 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/>
      <path d="M7.5 1.5 L7.5 3.5 M10.5 1.5 L10.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/></>,
  "Return to a known routine":
    <><path d="M13 5 Q15 9 13 13 Q9 16 5 13 Q2 9 5 5 Q9 2 13 5Z" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M11 3.5 L13 5 L11.5 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.6"/></>,
  "Non-stop movement":
    <><path d="M3 9 Q5 5 7 9 Q9 13 11 9 Q13 5 15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M13 7 L15 9 L13 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  "Very loud vocalizations":
    <><path d="M4 6 Q4 9 4 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.3"/>
      <path d="M7 4 Q7 9 7 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.55"/>
      <path d="M10 2.5 Q10 9 10 15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M13 5 Q13 9 13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.45"/>
      <path d="M16 7 Q16 9 16 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.25"/></>,
  "Grabbing and touching":
    <><path d="M6 14 L6 8 Q6 6.5 7.5 6.5 Q9 6.5 9 8 L9 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M9 10 L9 7.5 Q9 6 10.5 6 Q12 6 12 7.5 L12 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M12 10 L12 8 Q12 6.5 13.5 6.5 Q15 6.5 15 8 L15 12 Q15 15 12 15 L9 15 Q6 15 6 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  "Followed by a crash":
    <><path d="M3 5 Q9 3 15 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M9 5 L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6 9 L9 12 L12 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M4 14 L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5"/></>,
  "Demanding repetition":
    <><path d="M4 9 Q4 5 9 5 Q14 5 14 9 Q14 13 9 13 Q4 13 4 9" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M6 7 L9 7 L12 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/>
      <path d="M6 9 L12 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M6 11 L9 11 L12 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/>
      <path d="M15.5 7 L17 9 L15.5 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  "Go lower — not higher":
    <><path d="M3 5 L15 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.3"/>
      <path d="M3 9 L15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <path d="M3 13 L15 13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M12 11 L15 13 L12 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  "Use a visual countdown":
    <><circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M9 5 L9 9 L13 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.5 3 L4 1.5 M12.5 3 L14 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/></>,
  "Play a wind-down song":
    <><path d="M7.5 13 L7.5 6 L13.5 5 L13.5 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="6.5" cy="13" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <circle cx="12.5" cy="12" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M3 9 Q5 7 7 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.35"/></>,
  "Schedule recovery time":
    <><rect x="3" y="4" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M7 4 L7 6 M11 4 L11 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M5 9 L13 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.25"/>
      <path d="M6 11.5 Q9 10 12 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M8 13 L10 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/></>,
};

// Fallback for any title not in the lookup — elegant concentric mark
const FallbackIcon = ({ color, active }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="6.5" stroke={active ? "white" : color} strokeWidth="1.4" fill="none" opacity={active ? 1 : 0.8}/>
    <circle cx="9" cy="9" r="3" fill={active ? "white" : color} opacity={active ? 1 : 0.6}/>
  </svg>
);

const SignActionIcon = ({ title, color, bg, active }) => {
  const paths = SEMANTIC_ICONS[title];
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: active ? color : (bg || color + "15"),
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, border: `1px solid ${active ? "transparent" : color + "22"}`,
      transition: "background 0.2s, border-color 0.2s",
      color: active ? "white" : color,
    }}>
      {paths
        ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none" color={active ? "white" : color}>{paths}</svg>
        : <FallbackIcon color={color} active={active} />
      }
    </div>
  );
};

function EmotionDetail({ e, tab, setTab, onBack }) {
  const [openIdx, setOpenIdx] = useState(null);
  const items = tab === "signs" ? e.signs : e.actions;
  return (
    <Page>
      <button onClick={onBack} style={{ background: "none", border: "none", color: T.purple, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody, padding: "0 0 16px", display: "flex", alignItems: "center", gap: 6 }}>← Back</button>


      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: "16px 18px", background: e.bg, borderRadius: T.rL }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", flexShrink: 0, overflow: "hidden", border: `2px solid ${e.color}30` }}>
          <EmotionIllustration id={e.id} size={56} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 3px", fontSize: 20, fontWeight: 800, color: e.color }}>{e.label}</p>
          <p style={{ margin: 0, color: T.inkSoft, fontSize: 11, fontStyle: "italic", lineHeight: 1.5 }}>{e.source}</p>
        </div>
      </div>


      <div style={{ display: "flex", background: T.border, borderRadius: T.r, padding: 3, gap: 3, marginBottom: 20 }}>
        {[
          { v: "signs",   label: "Signs to Look For", svgPath: <><circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.4" fill="none"/><circle cx="9" cy="9" r="2" fill="currentColor"/></> },
          { v: "actions", label: "What To Do",        svgPath: <><path d="M4 9 L7.5 12.5 L14 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/></> },
        ].map(({ v, label, svgPath }) => (
          <button key={v} onClick={() => { setTab(v); setOpenIdx(null); }}
            style={{ flex: 1, padding: "10px 8px", borderRadius: 9, background: tab === v ? T.surface : "transparent", border: "none", fontWeight: 700, fontSize: 13, color: tab === v ? e.color : T.inkMuted, cursor: "pointer", fontFamily: T.fontBody, boxShadow: tab === v ? T.shadow : "none", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" color={tab === v ? e.color : T.inkMuted}>{svgPath}</svg>
            {label}
          </button>
        ))}
      </div>


      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => {
          const isOpen = openIdx === i;
          return (
            <Card key={i} onClick={() => setOpenIdx(isOpen ? null : i)}
              style={{ background: isOpen ? e.bg : T.surface, border: `1px solid ${isOpen ? e.color + "30" : T.border}`, transition: "all 0.2s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <SignActionIcon title={item.title} color={e.color} bg={e.bg} active={isOpen} />
                <p style={{ flex: 1, margin: 0, fontWeight: 700, color: T.ink, fontSize: 14, lineHeight: 1.4 }}>{item.title}</p>
                <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 20, transform: isOpen ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block", flexShrink: 0 }}>+</span>
              </div>
              {isOpen && (
                <div style={{ margin: "12px 0 0 48px", padding: "10px 12px", background: T.surface, borderRadius: T.r }}>
                  <p style={{ margin: 0, color: T.inkSoft, fontSize: 13, lineHeight: 1.75 }}>{item.body}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </Page>
  );
}

function BehaviourDetail({ b, onBack }) {
  const [openWhy, setOpenWhy] = useState(null);
  const [showActions, setShowActions] = useState(false);
  return (
    <Page>
      <button onClick={onBack} style={{ background: "none", border: "none", color: T.purple, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody, padding: "0 0 16px", display: "flex", alignItems: "center", gap: 6 }}>← Back</button>
      {b.urgency && (
        <div style={{ background: T.redL, borderRadius: T.r, padding: "12px 14px", marginBottom: 16, border: `1px solid ${T.red}30` }}>
          <p style={{ margin: 0, color: T.red, fontWeight: 800, fontSize: 13, lineHeight: 1.6 }}>{b.urgency}</p>
        </div>
      )}
      <div style={{ padding: "18px 16px", background: T.purpleL, borderRadius: T.rL, marginBottom: 20 }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>{b.icon}</div>
        <p style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: T.ink }}>{b.label}</p>
        <p style={{ margin: "0 0 10px", color: T.inkSoft, fontSize: 13, lineHeight: 1.6 }}>{b.summary}</p>
        <p style={{ margin: 0, color: T.inkMuted, fontSize: 11, fontStyle: "italic" }}>Source: {b.source}</p>
      </div>

      <SectionLabel style={{ marginBottom: 10 }}>Why does this happen?</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {b.why.map((w, wi) => (
          <Card key={wi} onClick={() => setOpenWhy(openWhy === wi ? null : wi)}
            style={{ border: `1px solid ${openWhy === wi ? T.purple + "30" : T.border}`, background: openWhy === wi ? T.purpleL : T.surface }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <SignActionIcon title={w.title} color={T.purple} bg={T.purpleL} active={openWhy === wi} />
              <p style={{ flex: 1, margin: 0, fontWeight: 700, color: T.ink, fontSize: 14 }}>{w.title}</p>
              <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 20, transform: openWhy === wi ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block" }}>+</span>
            </div>
            {openWhy === wi && (
              <div style={{ margin: "12px 0 0 48px", padding: "10px 12px", background: T.surface, borderRadius: T.r }}>
                <p style={{ margin: 0, color: T.inkSoft, fontSize: 13, lineHeight: 1.75 }}>{w.body}</p>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card onClick={() => setShowActions(!showActions)} style={{ background: showActions ? T.greenL : T.surface }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, fontWeight: 800, color: showActions ? T.green : T.ink, fontSize: 14 }}>✅ What should I do?</p>
          <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 20, transform: showActions ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block" }}>+</span>
        </div>
        {showActions && (
          <div style={{ marginTop: 14 }}>
            {b.actions.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: i < b.actions.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: T.green, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <p style={{ margin: 0, color: T.inkSoft, fontSize: 13, lineHeight: 1.65, flex: 1 }}>{step}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </Page>
  );
}
const ALARM_TONES = [
  {
    id: "lullaby", label: "Lullaby", desc: "Soft & gentle",
    play: (vol, ctx) => {
      // C-E-G-C melody — gentle lullaby
      const notes = [523,659,784,1047,784,659,523,659,523];
      const dur = 0.35;
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * dur;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol * 0.4, t + 0.05);
        gain.gain.linearRampToValueAtTime(vol * 0.25, t + dur * 0.8);
        gain.gain.linearRampToValueAtTime(0, t + dur);
        osc.start(t); osc.stop(t + dur);
      });
    }
  },
  {
    id: "morning", label: "Morning Bells", desc: "Clear & bright",
    play: (vol, ctx) => {
      // Bell-like tones — C major arpeggio
      const notes = [523,659,784,523,659,784,1047,784];
      const dur = 0.4;
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
        osc.type = "triangle"; osc2.type = "sine";
        osc.frequency.value = freq; osc2.frequency.value = freq * 2;
        const t = ctx.currentTime + i * dur;
        gain.gain.setValueAtTime(vol * 0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 1.2);
        osc.start(t); osc.stop(t + dur * 1.5);
        osc2.start(t); osc2.stop(t + dur * 1.5);
      });
    }
  },
  {
    id: "calm", label: "Calm Ocean", desc: "Flowing & peaceful",
    play: (vol, ctx) => {
      // Low warm tones — G pentatonic
      const notes = [392,440,494,587,659,587,494,440,392];
      const dur = 0.5;
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * dur;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol * 0.3, t + 0.15);
        gain.gain.linearRampToValueAtTime(vol * 0.2, t + dur * 0.7);
        gain.gain.linearRampToValueAtTime(0, t + dur * 1.1);
        osc.start(t); osc.stop(t + dur * 1.2);
      });
    }
  },
  {
    id: "harp", label: "Soft Harp", desc: "Delicate & warm",
    play: (vol, ctx) => {
      // Harp-like — F major scale ascending + descending
      const notes = [349,392,440,523,587,523,440,392,349];
      const dur = 0.3;
      notes.forEach((freq, i) => {
        [1, 2, 4].forEach((mult, j) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = "sine";
          osc.frequency.value = freq * mult;
          const t = ctx.currentTime + i * dur;
          const v = vol * [0.4, 0.15, 0.05][j];
          gain.gain.setValueAtTime(v, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 1.8);
          osc.start(t); osc.stop(t + dur * 2);
        });
      });
    }
  },
  {
    id: "chime", label: "Wind Chimes", desc: "Light & airy",
    play: (vol, ctx) => {
      // Random-feeling chime pattern — pentatonic
      const notes = [659,784,880,1047,1175,880,784,659,784,880];
      const times = [0,0.2,0.45,0.6,0.9,1.15,1.35,1.55,1.8,2.0];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "triangle";
        osc.frequency.value = freq;
        const t = ctx.currentTime + times[i];
        gain.gain.setValueAtTime(vol * 0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        osc.start(t); osc.stop(t + 0.9);
      });
    }
  },
];

function ScheduleScreen({ childCtx, push }) {
  const { activeChild, updateChild, children } = childCtx;
  const [scheduleView, setScheduleView] = useState("today");
  const [done, setDone] = useState({});
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ emoji: "⭐", label: "", time: "08:00" });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editData, setEditData] = useState({});
  const [showAlarmSettings, setShowAlarmSettings] = useState(false);
  const [alarmOn, setAlarmOn] = useState(() => {
    try { return localStorage.getItem("bonda_alarm_on") !== "false"; } catch { return true; }
  });
  const [alarmVolume, setAlarmVolume] = useState(() => {
    try { return parseFloat(localStorage.getItem("bonda_alarm_vol") || "0.6"); } catch { return 0.6; }
  });
  const [alarmTone, setAlarmTone] = useState(() => {
    try { return localStorage.getItem("bonda_alarm_tone") || "lullaby"; } catch { return "lullaby"; }
  });
  const [previewPlaying, setPreviewPlaying] = useState(null);
  const audioCtxRef = useRef(null);

  const saveAlarm = (on, vol, tone) => {
    try {
      localStorage.setItem("bonda_alarm_on", String(on));
      localStorage.setItem("bonda_alarm_vol", String(vol));
      localStorage.setItem("bonda_alarm_tone", tone);
    } catch {}
  };

  const previewTone = (toneId) => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const tone = ALARM_TONES.find(t => t.id === toneId);
      if (tone) { tone.play(alarmVolume, ctx); setPreviewPlaying(toneId); setTimeout(() => setPreviewPlaying(null), 3500); }
    } catch (e) { console.log("Audio not available:", e); }
  };

  // Check alarms every minute
  useEffect(() => {
    if (!alarmOn) return;
    const check = () => {
      const items = activeChild?.scheduleItems || DEFAULT_SCHEDULE;
      const now = new Date();
      const hhmm = now.getHours().toString().padStart(2,"0") + ":" + now.getMinutes().toString().padStart(2,"0");
      const match = items.find(i => i.time === hhmm);
      if (match) {
        try {
          if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
          const ctx = audioCtxRef.current;
          if (ctx.state === "suspended") ctx.resume();
          const tone = ALARM_TONES.find(t => t.id === alarmTone) || ALARM_TONES[0];
          tone.play(alarmVolume, ctx);
          // Repeat 3 times
          setTimeout(() => tone.play(alarmVolume, ctx), 3600);
          setTimeout(() => tone.play(alarmVolume, ctx), 7200);
        } catch {}
      }
    };
    const iv = setInterval(check, 60000);
    return () => clearInterval(iv);
  }, [alarmOn, alarmTone, alarmVolume, activeChild]);

  if (!activeChild) return (
    <Page style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>

      <div style={{ marginBottom: 28 }}>
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none">

          <circle cx="70" cy="70" r="64" stroke={T.purple} strokeWidth="1" strokeDasharray="4 6" opacity="0.2"/>

          <circle cx="70" cy="70" r="48" fill={T.purpleL} opacity="0.6"/>

          <circle cx="70" cy="70" r="34" fill={T.purpleL}/>

          <circle cx="70" cy="54" r="12" fill={T.surface} stroke={T.purple} strokeWidth="1.5"/>

          <path d="M55 90 Q55 74 70 74 Q85 74 85 90" fill={T.surface} stroke={T.purple} strokeWidth="1.5" strokeLinejoin="round"/>

          <circle cx="65.5" cy="53" r="1.5" fill={T.purple} opacity="0.5"/>
          <circle cx="74.5" cy="53" r="1.5" fill={T.purple} opacity="0.5"/>
          <path d="M65 58 Q70 61.5 75 58" fill="none" stroke={T.purple} strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>

          <circle cx="98" cy="42" r="10" fill={T.purple}/>
          <path d="M94 42 L102 42 M98 38 L98 46" stroke="white" strokeWidth="2" strokeLinecap="round"/>

          <circle cx="30" cy="52" r="3" fill={T.purple} opacity="0.15"/>
          <circle cx="112" cy="90" r="4" fill={T.amber} opacity="0.25"/>
          <circle cx="28" cy="96" r="5" fill={T.purple} opacity="0.1"/>
          <circle cx="108" cy="50" r="2.5" fill={T.amber} opacity="0.2"/>
        </svg>
      </div>
      <p style={{ fontWeight: 800, color: T.ink, fontSize: 19, margin: "0 0 10px", textAlign: "center", letterSpacing: "-0.02em" }}>No child profile yet</p>
      <p style={{ color: T.inkSoft, fontSize: 14, textAlign: "center", lineHeight: 1.7, marginBottom: 28, maxWidth: 260 }}>Add your child's profile to build their personalised daily schedule and track their progress.</p>
      <Btn onClick={() => push("addChild")} style={{ paddingLeft: 28, paddingRight: 28 }}>+ Add a Child Profile</Btn>
    </Page>
  );

  const items = activeChild.scheduleItems || DEFAULT_SCHEDULE;
  const history = activeChild.history || [];
  const sorted = [...items].sort((a, b) => a.time.localeCompare(b.time));
  const completedCount = items.filter(i => done[i.id]).length;
  const progress = items.length ? Math.round((completedCount / items.length) * 100) : 0;

  const toggleDone = id => setDone(d => ({ ...d, [id]: !d[id] }));

  const addItem = () => {
    if (!newItem.label.trim()) return;
    const id = Date.now().toString();
    updateChild(activeChild.id, { scheduleItems: [...items, { ...newItem, id }] });
    setNewItem({ emoji: "⭐", label: "", time: "08:00" }); setShowAdd(false);
  };

  const deleteItem = id => updateChild(activeChild.id, { scheduleItems: items.filter(i => i.id !== id) });

  const startEdit = item => { setEditing(item.id); setEditData({ ...item }); };
  const saveEdit = () => {
    updateChild(activeChild.id, { scheduleItems: items.map(i => i.id === editing ? { ...editData } : i) });
    setEditing(null);
  };

  const saveDay = () => {
    const entry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
      total: items.length, completedCount,
      completed: items.filter(i => done[i.id]).map(i => ({ emoji: i.emoji, label: i.label, time: i.time })),
      missed: items.filter(i => !done[i.id]).map(i => ({ emoji: i.emoji, label: i.label, time: i.time })),
    };
    updateChild(activeChild.id, { history: [entry, ...history].slice(0, 30) });
    setDone({});
    alert("✅ Day saved!");
  };

  return (
    <Page>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: "12px 16px", background: T.purpleL, borderRadius: T.r, border: `1px solid ${T.purple}20` }}>
        <ChildAvatar value={activeChild.emoji} size={52} active={true} borderColor={T.purple} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 2px", fontWeight: 800, color: T.purple, fontSize: 16 }}>{activeChild.name}'s Schedule</p>
          {children.length > 1 && <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>Switch child on Home tab</p>}
        </div>

        <button onClick={() => setShowAlarmSettings(!showAlarmSettings)} style={{ width: 40, height: 40, borderRadius: T.r, background: alarmOn ? T.purple : T.border, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }} title="Alarm Settings">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">

            <circle cx="10" cy="10" r="3" stroke="white" strokeWidth="1.4" fill="none"/>
            {[0,45,90,135,180,225,270,315].map((deg,i) => {
              const r = deg * Math.PI / 180;
              const x1 = 10 + 4.5 * Math.cos(r), y1 = 10 + 4.5 * Math.sin(r);
              const x2 = 10 + 6.5 * Math.cos(r), y2 = 10 + 6.5 * Math.sin(r);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="1.8" strokeLinecap="round"/>;
            })}
          </svg>
        </button>
      </div>


      {showAlarmSettings && (
        <div style={{ background: T.surface, borderRadius: T.rL, padding: 20, marginBottom: 20, boxShadow: T.shadowM, border: `1.5px solid ${T.purple}20` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <p style={{ margin: 0, fontWeight: 800, color: T.ink, fontSize: 15 }}>Alarm Settings</p>
              <p style={{ margin: "2px 0 0", color: T.inkMuted, fontSize: 12 }}>Activity reminders for {activeChild.name}</p>
            </div>
            <button onClick={() => setShowAlarmSettings(false)} style={{ background: T.border, border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.inkMuted, fontSize: 14, fontFamily: T.fontBody }}>✕</button>
          </div>


          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: T.canvas, borderRadius: T.r, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: alarmOn ? T.purpleL : T.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9.5" r="6" stroke={alarmOn ? T.purple : T.inkMuted} strokeWidth="1.4" fill="none"/>
                  <path d="M9 6 L9 10 L12 11.5" stroke={alarmOn ? T.purple : T.inkMuted} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 3 L3 1.5 M13 3 L15 1.5" stroke={alarmOn ? T.purple : T.inkMuted} strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
                </svg>
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: T.ink, fontSize: 14 }}>Alarm</p>
                <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>{alarmOn ? "Rings at each activity time" : "Alarm is off"}</p>
              </div>
            </div>

            <div onClick={() => { const v = !alarmOn; setAlarmOn(v); saveAlarm(v, alarmVolume, alarmTone); }}
              style={{ width: 48, height: 28, borderRadius: 99, background: alarmOn ? T.purple : T.border, cursor: "pointer", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 3, left: alarmOn ? 22 : 3, width: 22, height: 22, borderRadius: "50%", background: "white", transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}/>
            </div>
          </div>

          {alarmOn && (<>

            <div style={{ padding: "12px 14px", background: T.canvas, borderRadius: T.r, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <p style={{ margin: 0, fontWeight: 700, color: T.ink, fontSize: 13 }}>Volume</p>
                <p style={{ margin: 0, color: T.purple, fontWeight: 800, fontSize: 13 }}>{Math.round(alarmVolume * 100)}%</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 6 L2 10 L5 10 L9 13 L9 3 L5 6 Z" stroke={T.inkMuted} strokeWidth="1.2" fill={T.inkMuted} fillOpacity="0.3" strokeLinejoin="round"/>
                </svg>
                <input type="range" min="0.1" max="1" step="0.05" value={alarmVolume}
                  onChange={e => { const v = parseFloat(e.target.value); setAlarmVolume(v); saveAlarm(alarmOn, v, alarmTone); }}
                  style={{ flex: 1, accentColor: T.purple, height: 4, cursor: "pointer" }}/>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 6 L2 10 L5 10 L9 13 L9 3 L5 6 Z" stroke={T.purple} strokeWidth="1.2" fill={T.purple} fillOpacity="0.3" strokeLinejoin="round"/>
                  <path d="M11 4.5 Q13.5 6 13.5 8 Q13.5 10 11 11.5" stroke={T.purple} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
                  <path d="M11.5 6.5 Q13 7.2 13 8 Q13 8.8 11.5 9.5" stroke={T.purple} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5"/>
                </svg>
              </div>
            </div>


            <div style={{ padding: "12px 14px", background: T.canvas, borderRadius: T.r }}>
              <p style={{ margin: "0 0 12px", fontWeight: 700, color: T.ink, fontSize: 13 }}>Alarm Tone</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ALARM_TONES.map(tone => (
                  <div key={tone.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: T.r, background: alarmTone === tone.id ? T.purpleL : T.surface, border: `1.5px solid ${alarmTone === tone.id ? T.purple : T.border}`, cursor: "pointer", transition: "all 0.15s" }}
                    onClick={() => { setAlarmTone(tone.id); saveAlarm(alarmOn, alarmVolume, tone.id); }}>

                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${alarmTone === tone.id ? T.purple : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {alarmTone === tone.id && <div style={{ width: 9, height: 9, borderRadius: "50%", background: T.purple }}/>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: T.ink, fontSize: 13 }}>{tone.label}</p>
                      <p style={{ margin: 0, color: T.inkMuted, fontSize: 11 }}>{tone.desc}</p>
                    </div>

                    <button onClick={e => { e.stopPropagation(); previewTone(tone.id); }}
                      style={{ width: 32, height: 32, borderRadius: 8, background: previewPlaying === tone.id ? T.purple : T.purpleL, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <polygon points="3,2 11,7 3,12" fill={previewPlaying === tone.id ? "white" : T.purple}/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <p style={{ margin: "10px 0 0", color: T.inkMuted, fontSize: 11, textAlign: "center", lineHeight: 1.5 }}>Tap ▶ to preview · Alarm plays at each activity time · Repeats 3×</p>
            </div>
          </>)}
        </div>
      )}


      <div style={{ display: "flex", background: T.border, borderRadius: T.r, padding: 3, gap: 3, marginBottom: 20 }}>
        {[["today","Today"],["history",`History${history.length ? ` (${history.length})` : ""}`]].map(([v, l]) => (
          <button key={v} onClick={() => setScheduleView(v)} style={{ flex: 1, padding: "10px", borderRadius: 9, background: scheduleView === v ? T.surface : "transparent", border: "none", fontWeight: 700, fontSize: 13, color: scheduleView === v ? T.ink : T.inkMuted, cursor: "pointer", fontFamily: T.fontBody, boxShadow: scheduleView === v ? T.shadow : "none" }}>{l}</button>
        ))}
      </div>

      {scheduleView === "today" && (
        <>

          <Card style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ margin: 0, fontWeight: 700, color: T.ink, fontSize: 14 }}>Today's Progress</p>
              <p style={{ margin: 0, fontWeight: 800, color: T.purple, fontSize: 14 }}>{progress}%</p>
            </div>
            <div style={{ height: 6, background: T.border, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: T.purple, borderRadius: 99, transition: "width 0.4s ease" }} />
            </div>
            <p style={{ margin: "8px 0 0", color: T.inkMuted, fontSize: 12 }}>{completedCount} of {items.length} activities done</p>
          </Card>


          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {sorted.map(item => editing === item.id ? (
              <Card key={item.id} style={{ background: T.purpleL }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ fontSize: 24, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: T.r, padding: "6px 10px", cursor: "pointer" }}>{editData.emoji}</button>
                  <input value={editData.label} onChange={e => setEditData({ ...editData, label: e.target.value })} style={{ flex: 1, padding: "8px 12px", borderRadius: T.r, border: `1.5px solid ${T.purple}`, fontSize: 14, fontFamily: T.fontBody, color: T.ink, background: T.surface, outline: "none" }} />
                  <input type="time" value={editData.time} onChange={e => setEditData({ ...editData, time: e.target.value })} style={{ padding: "8px 10px", borderRadius: T.r, border: `1.5px solid ${T.purple}`, fontSize: 13, fontFamily: T.fontBody, color: T.ink, background: T.surface, outline: "none", width: 88 }} />
                </div>
                {showEmojiPicker && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: 10, background: T.surface, borderRadius: T.r, marginBottom: 10 }}>{EMOJI_OPTS.map(e => <button key={e} onClick={() => { setEditData({ ...editData, emoji: e }); setShowEmojiPicker(false); }} style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer", borderRadius: 8, padding: 3 }}>{e}</button>)}</div>}
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={saveEdit} style={{ flex: 1 }}>Save</Btn>
                  <Btn onClick={() => setEditing(null)} secondary style={{ flex: 1 }}>Cancel</Btn>
                </div>
              </Card>
            ) : (
              <Card key={item.id} onClick={() => toggleDone(item.id)} style={{ background: done[item.id] ? T.greenL : T.surface, border: `1px solid ${done[item.id] ? T.green + "40" : T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{item.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, color: T.ink, fontSize: 14, textDecoration: done[item.id] ? "line-through" : "none", opacity: done[item.id] ? 0.5 : 1 }}>{item.label}</p>
                    <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>{item.time}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => startEdit(item)} style={{ background: T.border, border: "none", borderRadius: 8, padding: "5px 9px", cursor: "pointer", fontSize: 13 }}>✏️</button>
                    <button onClick={() => deleteItem(item.id)} style={{ background: T.redL, border: "none", borderRadius: 8, padding: "5px 9px", cursor: "pointer", fontSize: 13 }}>🗑️</button>
                  </div>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: done[item.id] ? T.green : T.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
                    {done[item.id] && <span style={{ color: "white", fontSize: 12, fontWeight: 900 }}>✓</span>}
                  </div>
                </div>
              </Card>
            ))}
          </div>


          {showAdd && (
            <Card style={{ background: T.purpleL, marginBottom: 10 }}>
              <p style={{ margin: "0 0 10px", fontWeight: 800, color: T.purple, fontSize: 14 }}>New Activity</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ fontSize: 24, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: T.r, padding: "6px 10px", cursor: "pointer" }}>{newItem.emoji}</button>
                <input value={newItem.label} onChange={e => setNewItem({ ...newItem, label: e.target.value })} placeholder="Activity name" style={{ flex: 1, padding: "8px 12px", borderRadius: T.r, border: `1.5px solid ${T.purple}`, fontSize: 14, fontFamily: T.fontBody, color: T.ink, outline: "none", background: T.surface }} />
                <input type="time" value={newItem.time} onChange={e => setNewItem({ ...newItem, time: e.target.value })} style={{ padding: "8px 8px", borderRadius: T.r, border: `1.5px solid ${T.purple}`, fontSize: 13, fontFamily: T.fontBody, color: T.ink, outline: "none", width: 88, background: T.surface }} />
              </div>
              {showEmojiPicker && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: 10, background: T.surface, borderRadius: T.r, marginBottom: 10 }}>{EMOJI_OPTS.map(e => <button key={e} onClick={() => { setNewItem({ ...newItem, emoji: e }); setShowEmojiPicker(false); }} style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer", borderRadius: 8, padding: 3 }}>{e}</button>)}</div>}
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={addItem} style={{ flex: 1 }}>Add ✓</Btn>
                <Btn onClick={() => setShowAdd(false)} secondary style={{ flex: 1 }}>Cancel</Btn>
              </div>
            </Card>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={() => setShowAdd(!showAdd)} secondary style={{ flex: 1 }}>{showAdd ? "✕ Cancel" : "+ Add Activity"}</Btn>
            <Btn onClick={saveDay} style={{ flex: 1, background: T.green }}>💾 Save Day</Btn>
          </div>
          <p style={{ color: T.inkMuted, fontSize: 11, textAlign: "center", marginTop: 10 }}>Tap "Save Day" at end of day to record to history</p>
        </>
      )}

      {scheduleView === "history" && (
        history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
              <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
                <circle cx="48" cy="48" r="42" fill={T.purpleL} opacity="0.7"/>
                <rect x="22" y="26" width="52" height="46" rx="7" fill={T.surface} stroke={T.purple} strokeWidth="1.4"/>
                <path d="M34 26 L34 32 M62 26 L62 32" stroke={T.purple} strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M22 40 L74 40" stroke={T.purple} strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
                <rect x="30" y="49" width="16" height="14" rx="3" fill={T.purpleL} stroke={T.purple} strokeWidth="1.2"/>
                <path d="M33 56 L36 59 L42 53" stroke={T.purple} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                <rect x="52" y="49" width="16" height="14" rx="3" fill={T.border}/>
                <path d="M56 56 L64 56 M56 60 L62 60" stroke={T.inkMuted} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>

                <circle cx="74" cy="26" r="8" fill={T.amber} opacity="0.9"/>
                <path d="M70.5 26 L77.5 26 M74 22.5 L74 29.5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <p style={{ fontWeight: 800, color: T.ink, fontSize: 16, margin: "0 0 8px" }}>No records yet</p>
            <p style={{ color: T.inkSoft, fontSize: 13, lineHeight: 1.7, maxWidth: 240, margin: "0 auto" }}>Complete today's schedule and tap <strong style={{ color: T.purple }}>"Save Day"</strong> to start tracking your child's history.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {history.map(entry => <HistoryCard key={entry.id} entry={entry} />)}
          </div>
        )
      )}
    </Page>
  );
}

function HistoryCard({ entry }) {
  const [open, setOpen] = useState(false);
  const pct = Math.round((entry.completedCount / entry.total) * 100);
  const color = pct >= 80 ? T.green : pct >= 50 ? T.amber : T.red;
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "14px 16px", cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div><p style={{ margin: "0 0 2px", fontWeight: 800, color: T.ink, fontSize: 14 }}>{entry.date}</p><p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>{entry.completedCount}/{entry.total} completed</p></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Badge color={color} bg={color + "18"}>{pct}%</Badge>
            <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 18, transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block" }}>+</span>
          </div>
        </div>
        <div style={{ height: 4, background: T.border, borderRadius: 99 }}><div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99 }} /></div>
      </div>
      {open && (
        <div style={{ padding: "0 16px 14px" }}>
          {entry.completed.length > 0 && <><p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase", letterSpacing: "0.07em" }}>✅ Completed</p>{entry.completed.map((a, i) => <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderTop: `1px solid ${T.border}`, alignItems: "center" }}><span style={{ fontSize: 18 }}>{a.emoji}</span><span style={{ fontSize: 13, fontWeight: 600, color: T.ink, flex: 1 }}>{a.label}</span><span style={{ fontSize: 12, color: T.inkMuted }}>{a.time}</span></div>)}</>}
          {entry.missed.length > 0 && <><p style={{ margin: "10px 0 8px", fontSize: 11, fontWeight: 700, color: T.red, textTransform: "uppercase", letterSpacing: "0.07em" }}>⏭ Missed</p>{entry.missed.map((a, i) => <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderTop: `1px solid ${T.border}`, alignItems: "center", opacity: 0.6 }}><span style={{ fontSize: 18 }}>{a.emoji}</span><span style={{ fontSize: 13, fontWeight: 600, color: T.ink, flex: 1 }}>{a.label}</span><span style={{ fontSize: 12, color: T.inkMuted }}>{a.time}</span></div>)}</>}
        </div>
      )}
    </Card>
  );
}
function AuthScreen() {
  const [view, setView] = useState("login");
  const [loginEmail, setLoginEmail] = useState(""); const [loginPass, setLoginPass] = useState(""); const [loginErr, setLoginErr] = useState("");
  const [regEmail, setRegEmail] = useState(""); const [regName, setRegName] = useState(""); const [regPass, setRegPass] = useState(""); const [regAvatar, setRegAvatar] = useState("none"); const [regErr, setRegErr] = useState(""); const [regMsg, setRegMsg] = useState(""); const [regPhoto, setRegPhoto] = useState(null); const [regShowCam, setRegShowCam] = useState(false); const [regCamReady, setRegCamReady] = useState(false); const [regCamOk, setRegCamOk] = useState(true); const regVideoRef = useRef(null); const regStreamRef = useRef(null);

  const login = async () => {
    setLoginErr("");
    if (!loginEmail.trim()) return setLoginErr("Please enter your email.");
    if (!loginPass) return setLoginErr("Please enter your password.");
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail.trim(), password: loginPass });
    if (error) return setLoginErr(error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message);
    // On success, the top-level auth listener picks up the new session and switches to the main app.
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
    if (regPass.length < 6) return setRegErr("Password must be at least 6 characters.");
    const joined = new Date().toLocaleDateString("en-SG", { month: "short", year: "numeric" });
    // Sign up with a short avatar key first — never the raw photo, which would
    // get embedded into the JWT and blow past the 100KB header limit.
    const { data, error } = await supabase.auth.signUp({
      email: regEmail.trim(),
      password: regPass,
      options: { data: { name: regName.trim(), avatar: regAvatar, joined } },
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


      <SectionLabel style={{ marginBottom: 10 }}>Or choose an illustrated avatar</SectionLabel>
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

      <Input label="Your name (shown to other parents)" value={regName} onChange={e => setRegName(e.target.value)} placeholder="e.g. Sarah, Mum of Aiden" />
      <Input label="Email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="you@example.com" />
      <Input label="Password (min 6 characters)" type="password" value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="Create a password" />
      {regErr && <p style={{ color: T.red, fontSize: 13, fontWeight: 700, margin: "-8px 0 12px" }}>{regErr}</p>}
      <Btn onClick={register} full style={{ marginBottom: 10 }}>Create Account →</Btn>
      <Btn onClick={() => { setRegErr(""); setView("login"); }} full secondary>← Already have an account?</Btn>
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
function CommunityScreen({ account }) {
  const [view, setView] = useState("home");
  const [dmPremium, setDmPremium] = useState(() => { try { return localStorage.getItem(`cb_premium_${account.name.toLowerCase()}`) === "true"; } catch { return false; } });
  const [showPaywall, setShowPaywall] = useState(false);

  const [activeRoom, setActiveRoom] = useState(null);
  const [groupMsgs, setGroupMsgs] = useState([]); const [groupInput, setGroupInput] = useState(""); const [groupLoading, setGroupLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]); const [dmPartner, setDmPartner] = useState(null);
  const [dmMsgs, setDmMsgs] = useState([]); const [dmInput, setDmInput] = useState(""); const [dmLoading, setDmLoading] = useState(false);

  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [groupMsgs, dmMsgs]);

  useEffect(() => {
    if (view !== "groupchat" && view !== "dm_chat") return;
    const iv = setInterval(async () => {
      if (view === "groupchat" && activeRoom) { const m = await db.get(`room_${activeRoom.id}`) || []; if (m.length !== groupMsgs.length) setGroupMsgs(m); }
      if (view === "dm_chat" && account && dmPartner) { const m = await db.get(dmKey(account.id, dmPartner.id)) || []; if (m.length !== dmMsgs.length) setDmMsgs(m); }
    }, 7000);
    return () => clearInterval(iv);
  }, [view, activeRoom, groupMsgs.length, dmMsgs.length, dmPartner]);

  const dmKey = (a, b) => { const s = [a, b].sort(); return `dm_${s[0]}_${s[1]}`; };

  const openGroup = async room => { setActiveRoom(room); setGroupLoading(true); setView("groupchat"); const m = await db.get(`room_${room.id}`) || []; setGroupMsgs(m); setGroupLoading(false); };
  const sendGroup = async () => { const text = groupInput.trim(); if (!text) return; const m = { id: Date.now(), author: account.name, avatar: account.avatar, text, time: new Date().toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" }), date: new Date().toLocaleDateString("en-SG", { day: "numeric", month: "short" }) }; const u = [...groupMsgs, m].slice(-120); setGroupMsgs(u); setGroupInput(""); await db.set(`room_${activeRoom.id}`, u); };
  const deleteGroup = async id => { const u = groupMsgs.filter(m => m.id !== id); setGroupMsgs(u); await db.set(`room_${activeRoom.id}`, u); };

  const openDMList = async () => {
    if (!dmPremium) { setShowPaywall(true); return; }
    setView("dm_list");
    const { data, error } = await supabase.from("profiles").select("id, name, avatar, joined");
    setAllUsers(error ? [] : data);
  };
  const openDMChat = async p => { setDmPartner(p); setDmLoading(true); setView("dm_chat"); const m = await db.get(dmKey(account.id, p.id)) || []; setDmMsgs(m); setDmLoading(false); };
  const sendDM = async () => { const text = dmInput.trim(); if (!text) return; const m = { id: Date.now(), author: account.name, avatar: account.avatar, text, time: new Date().toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" }), date: new Date().toLocaleDateString("en-SG", { day: "numeric", month: "short" }) }; const u = [...dmMsgs, m].slice(-200); setDmMsgs(u); setDmInput(""); await db.set(dmKey(account.id, dmPartner.id), u); };
  const deleteDM = async id => { const u = dmMsgs.filter(m => m.id !== id); setDmMsgs(u); await db.set(dmKey(account.id, dmPartner.id), u); };

  const purchase = () => { try { localStorage.setItem(`cb_premium_${account.name.toLowerCase()}`, "true"); } catch {} setDmPremium(true); setShowPaywall(false); setTimeout(openDMList, 300); };

  // Chat UI component
  const ChatUI = ({ msgs, input, setInput, onSend, onDelete, loading, color, bg, backFn, icon, label, sub, isGroup }) => (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)" }}>
      <div style={{ padding: "0 18px 12px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={backFn} style={{ background: "none", border: "none", color: T.purple, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: T.fontBody, padding: 0, flexShrink: 0 }}>←</button>
        <div style={{ background: bg, borderRadius: T.r, padding: "8px 14px", flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 800, color, fontSize: 14 }}>{icon} {label}</p>
          <p style={{ margin: 0, color: T.inkMuted, fontSize: 11 }}>{sub}</p>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && <p style={{ textAlign: "center", color: T.inkMuted, padding: 24, fontSize: 14 }}>Loading...</p>}
        {!loading && msgs.length === 0 && <div style={{ textAlign: "center", padding: "48px 20px" }}><div style={{ fontSize: 40, marginBottom: 12 }}>💬</div><p style={{ fontWeight: 700, color: T.ink, fontSize: 15 }}>No messages yet</p><p style={{ color: T.inkMuted, fontSize: 13 }}>{isGroup ? "Be the first to post!" : "Start a private conversation!"}</p></div>}
        {msgs.map(msg => {
          const isMe = msg.author === account.name;
          const isEmoji = msg.avatar && !msg.avatar.startsWith("data:") && msg.avatar.length <= 2;
          return (
            <div key={msg.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 8, alignItems: "flex-end" }}>
              {!isMe && <ComAvatar value={msg.avatar} size={32} active={false} />}
              <div style={{ maxWidth: "74%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", gap: 2 }}>
                {!isMe && <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: T.inkMuted, paddingLeft: 2 }}>{msg.author}</p>}
                <div style={{ background: isMe ? color : T.surface, color: isMe ? "white" : T.ink, borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "10px 14px", boxShadow: T.shadow }}>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, wordBreak: "break-word" }}>{msg.text}</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <p style={{ margin: 0, fontSize: 10, color: T.inkMuted }}>{msg.date} · {msg.time}</p>
                  {isMe && <button onClick={() => onDelete(msg.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, color: T.red, fontWeight: 700, fontFamily: T.fontBody, padding: 0 }}>Delete</button>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "10px 18px 6px", background: T.surface, borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, alignItems: "flex-end" }}>
        <ComAvatar value={account.avatar} size={28} active={true} borderColor={bg} />
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }} placeholder="Write a message… (Enter to send)" rows={1} style={{ flex: 1, padding: "9px 13px", borderRadius: T.r, border: `1.5px solid ${T.border}`, fontSize: 14, fontFamily: T.fontBody, color: T.ink, outline: "none", resize: "none", lineHeight: 1.5, background: T.canvas }} />
        <button onClick={onSend} disabled={!input.trim()} style={{ width: 38, height: 38, borderRadius: "50%", background: input.trim() ? color : T.border, border: "none", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, transition: "background 0.2s", color: "white" }}>›</button>
      </div>
      <p style={{ textAlign: "center", color: T.inkMuted, fontSize: 10, margin: "2px 0 4px" }}>{isGroup ? "Visible to all parents · Be kind 💛" : `Private — only you and ${dmPartner?.name}`}</p>
    </div>
  );

  const Paywall = () => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,26,46,0.7)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: T.surface, borderRadius: T.rXL, padding: 28, maxWidth: 380, width: "100%", boxShadow: T.shadowM }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.purpleL, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: `1.5px solid ${T.purple}25` }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="5" y="13" width="18" height="13" rx="4" stroke={T.purple} strokeWidth="1.6" fill={T.purple} fillOpacity="0.12"/>
            <path d="M9 13 L9 9 Q9 4 14 4 Q19 4 19 9 L19 13" stroke={T.purple} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
            <circle cx="14" cy="19.5" r="2.5" fill={T.purple} opacity="0.7"/>
          </svg>
        </div>
        <p style={{ margin: "0 0 8px", fontWeight: 900, color: T.ink, fontSize: 20, textAlign: "center" }}>Private Messaging</p>
        <p style={{ margin: "0 0 20px", color: T.inkSoft, fontSize: 13, textAlign: "center", lineHeight: 1.6 }}>Chat one-on-one privately with any parent in the Bonda community.</p>
        <div style={{ background: T.purpleL, borderRadius: T.r, padding: "16px", marginBottom: 20, textAlign: "center" }}>
          <p style={{ margin: "0 0 2px", color: T.inkMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>One-Time Purchase</p>
          <p style={{ margin: "0 0 2px", color: T.purple, fontSize: 34, fontWeight: 900 }}>SGD $10</p>
          <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>Lifetime access · Never expires</p>
        </div>
        {[
          { label: "Private one-on-one chat", svg: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3 Q2 1.5 3.5 1.5 L10 1.5 Q11.5 1.5 11.5 3 L11.5 7 Q11.5 8.5 10 8.5 L6 8.5 L4 10.5 L4 8.5 Q2 8.5 2 7 Z" stroke={T.purple} strokeWidth="1.2" fill={T.purple} fillOpacity="0.12"/><path d="M5.5 10 Q5.5 9 6.5 9 L13 9 Q14 9 14 10 L14 13 Q14 14 13 14 L11.5 14 L11.5 15.5 L10 14 L6.5 14 Q5.5 14 5.5 13 Z" stroke={T.purple} strokeWidth="1.1" fill={T.purple} fillOpacity="0.18"/></svg> },
          { label: "Only visible to you and the recipient", svg: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7.5" width="10" height="7" rx="2" stroke={T.purple} strokeWidth="1.2" fill={T.purple} fillOpacity="0.1"/><path d="M5 7.5 L5 5 Q5 2 8 2 Q11 2 11 5 L11 7.5" stroke={T.purple} strokeWidth="1.2" strokeLinecap="round" fill="none"/><circle cx="8" cy="11" r="1.3" fill={T.purple} opacity="0.7"/></svg> },
          { label: "Unlimited conversations", svg: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8 Q4 5.5 8 5.5 Q12 5.5 12 8 Q12 10.5 8 10.5" stroke={T.purple} strokeWidth="1.2" strokeLinecap="round" fill="none"/><path d="M8 10.5 Q4 10.5 4 8" stroke={T.purple} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.45"/><path d="M1.5 8 Q1.5 4.5 4 4" stroke={T.purple} strokeWidth="1" strokeLinecap="round" opacity="0.3"/><path d="M14.5 8 Q14.5 4.5 12 4" stroke={T.purple} strokeWidth="1" strokeLinecap="round" opacity="0.3"/></svg> },
          { label: "Tied to your account forever", svg: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="3" stroke={T.purple} strokeWidth="1.2" fill={T.purple} fillOpacity="0.12"/><path d="M2.5 14.5 Q2.5 11 8 11 Q13.5 11 13.5 14.5" stroke={T.purple} strokeWidth="1.2" strokeLinecap="round" fill="none"/><path d="M10 4.5 L11.5 6 L14 3.5" stroke={T.purple} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/></svg> },
        ].map(({ label, svg }, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: T.purpleL, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${T.purple}15`, flexShrink: 0 }}>{svg}</div>
            <p style={{ margin: 0, color: T.ink, fontSize: 13, fontWeight: 600 }}>{label}</p>
          </div>
        ))}
        <div style={{ background: T.amberL, borderRadius: T.r, padding: "10px 14px", margin: "16px 0" }}>
          <p style={{ margin: 0, color: T.amber, fontSize: 11, fontWeight: 700, lineHeight: 1.6 }}>💡 In the live app this connects to Stripe / PayPal / Apple Pay. Tap below to simulate in this prototype.</p>
        </div>
        <Btn onClick={purchase} full style={{ marginBottom: 10 }}>🔓 Unlock for SGD $10</Btn>
        <Btn onClick={() => setShowPaywall(false)} full secondary>Maybe later</Btn>
      </div>
    </div>
  );

  if (view === "groupchat" && activeRoom) return <div style={{ position: "relative" }}>{showPaywall && <Paywall />}<ChatUI msgs={groupMsgs} input={groupInput} setInput={setGroupInput} onSend={sendGroup} onDelete={deleteGroup} loading={groupLoading} color={activeRoom.color} bg={activeRoom.bg} backFn={() => setView("home")} icon={activeRoom.icon} label={activeRoom.label} sub={activeRoom.desc} isGroup /></div>;
  if (view === "dm_chat" && dmPartner) return <div style={{ position: "relative" }}>{showPaywall && <Paywall />}<ChatUI msgs={dmMsgs} input={dmInput} setInput={setDmInput} onSend={sendDM} onDelete={deleteDM} loading={dmLoading} color={T.purple} bg={T.purpleL} backFn={() => setView("dm_list")} icon={dmPartner.avatar} label={dmPartner.name} sub="Private message" isGroup={false} /></div>;

  if (view === "dm_list") {
    const others = allUsers.filter(u => u.id !== account.id);
    return (
      <Page>
        {showPaywall && <Paywall />}
        <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: T.purple, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: T.fontBody, padding: "0 0 16px", display: "flex", alignItems: "center", gap: 6 }}>← Back</button>
        <h2 style={{ margin: "0 0 6px", color: T.ink, fontSize: 20, fontWeight: 800 }}>Private Messages</h2>
        <p style={{ margin: "0 0 20px", color: T.inkSoft, fontSize: 14 }}>Choose a parent to message privately</p>
        {others.length === 0 ? <div style={{ textAlign: "center", padding: "48px 20px" }}><div style={{ fontSize: 44, marginBottom: 12 }}>👥</div><p style={{ fontWeight: 700, color: T.ink, fontSize: 15 }}>No other parents yet</p><p style={{ color: T.inkMuted, fontSize: 13, lineHeight: 1.6 }}>Once other parents join, they'll appear here.</p></div> :
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {others.map(p => (
              <Card key={p.id} onClick={() => openDMChat(p)} style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <ComAvatar value={p.avatar} size={44} active={false} borderColor={T.border} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 2px", fontWeight: 800, color: T.ink, fontSize: 14 }}>{p.name}</p>
                    <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>Member since {p.joined}</p>
                  </div>
                  <Badge color={T.purple}>Message</Badge>
                </div>
              </Card>
            ))}
          </div>
        }
      </Page>
    );
  }

  if (view === "home") return (
    <Page>
      {showPaywall && <Paywall />}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: T.ink, borderRadius: T.rL, marginBottom: 24 }}>
        <ComAvatar value={account.avatar} size={44} active={true} borderColor={T.purple} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 1px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Signed in as</p>
          <p style={{ margin: 0, color: "white", fontSize: 16, fontWeight: 800 }}>{account.name}</p>
        </div>
        <button onClick={forceSignOut} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "6px 12px", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody }}>Sign out</button>
      </div>

      <div style={{ background: T.amberL, borderRadius: T.r, padding: "12px 14px", marginBottom: 24, border: `1px solid ${T.amber}20` }}>
        <p style={{ margin: 0, color: T.amber, fontSize: 12, fontWeight: 700, lineHeight: 1.6 }}>💛 Be kind and supportive. Everyone here is doing their best.</p>
      </div>

      <SectionLabel style={{ marginBottom: 10 }}>Group Rooms</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {GROUP_ROOMS.map(r => (
          <Card key={r.id} onClick={() => openGroup(r)}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: r.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${r.color}20` }}>
                {r.svgIcon(r.color)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 3px", fontWeight: 800, color: r.color, fontSize: 14 }}>{r.label}</p>
                <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>{r.desc}</p>
              </div>
              <span style={{ color: T.inkMuted, fontSize: 20 }}>›</span>
            </div>
          </Card>
        ))}
      </div>

      <SectionLabel style={{ marginBottom: 10 }}>Private Messages</SectionLabel>
      {dmPremium ? (
        /* ── UNLOCKED STATE — elegant, professional ── */
        <Card onClick={openDMList} style={{ background: T.surface, border: `1.5px solid ${T.purple}25`, padding: 0, overflow: "hidden" }}>

          <div style={{ background: T.purpleL, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: T.purple, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">

                <circle cx="7.5" cy="7" r="3" stroke="white" strokeWidth="1.4" fill="white" fillOpacity="0.2"/>
                <path d="M2 17 Q2 13 7.5 13 Q13 13 13 17" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
                <circle cx="16" cy="8" r="2.5" stroke="white" strokeWidth="1.3" fill="white" fillOpacity="0.3"/>
                <path d="M13 18 Q13.5 15 16 15 Q18.5 15 19 17" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.7"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 2px", fontWeight: 800, color: T.purple, fontSize: 15 }}>Message a Parent</p>
              <p style={{ margin: 0, color: T.inkSoft, fontSize: 12 }}>Private · one-on-one · only the two of you can see it</p>
            </div>
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M1.5 1.5 L6.5 7 L1.5 12.5" stroke={T.purple} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div style={{ padding: "14px 16px", display: "flex", gap: 0 }}>
            {[
              {
                label: "100% private",
                icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="4" y="9" width="12" height="9" rx="2.5" stroke={T.purple} strokeWidth="1.4" fill={T.purple} fillOpacity="0.1"/>
                  <path d="M6.5 9 L6.5 6.5 Q6.5 3 10 3 Q13.5 3 13.5 6.5 L13.5 9" stroke={T.purple} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
                  <circle cx="10" cy="13.5" r="1.5" fill={T.purple} opacity="0.7"/>
                </svg>
              },
              {
                label: "Unlimited chats",
                icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6 10 Q6 7 10 7 Q14 7 14 10 Q14 13 10 13" stroke={T.purple} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
                  <path d="M10 13 Q6 13 6 10" stroke={T.purple} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5"/>
                  <path d="M3 10 Q3 6 5.5 6" stroke={T.purple} strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/>
                  <path d="M17 10 Q17 6 14.5 6" stroke={T.purple} strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/>
                </svg>
              },
              {
                label: "Your account",
                icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="7.5" r="3.5" stroke={T.purple} strokeWidth="1.4" fill={T.purple} fillOpacity="0.12"/>
                  <path d="M3.5 17.5 Q3.5 13 10 13 Q16.5 13 16.5 17.5" stroke={T.purple} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
                  <path d="M12.5 6 L14.5 8 L17 5" stroke={T.purple} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
                </svg>
              },
            ].map(({ label, icon }) => (
              <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: T.purpleL, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${T.purple}15` }}>
                  {icon}
                </div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: T.inkMuted, textAlign: "center", lineHeight: 1.4 }}>{label}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        /* ── LOCKED STATE — clear premium prompt ── */
        <Card onClick={openDMList} style={{ background: T.surface }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: T.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🔒</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                <p style={{ margin: 0, fontWeight: 800, color: T.ink, fontSize: 14 }}>Message a Parent</p>
                <Badge color={T.purple}>SGD $10</Badge>
              </div>
              <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>Unlock private 1-on-1 chat · one-time · lifetime access</p>
            </div>
            <span style={{ color: T.inkMuted, fontSize: 20 }}>›</span>
          </div>
        </Card>
      )}
    </Page>
  );

}
function SubsidiesScreen({ pop }) {
  const [open, setOpen] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingLive, setLoadingLive] = useState(false);
  const [liveUpdate, setLiveUpdate] = useState(null);
  const [liveErr, setLiveErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingLive(true);
    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 800, tools: [{ type: "web_search_20250305", name: "web_search" }], system: `Singapore autism subsidies. Search latest 2025-2026. Respond ONLY JSON: { "updates": [ { "scheme": "Name", "headline": "short headline", "isNew": true } ] }. Max 4.`, messages: [{ role: "user", content: "Latest 2025-2026 Singapore autism disability subsidy updates JSON only." }] })
    }).then(r => r.json()).then(d => {
      if (cancelled) return;
      const raw = (d.content || []).filter(b => b.type === "text").map(b => b.text).join("").replace(/```json|```/g, "").trim();
      const s = raw.indexOf("{"), e = raw.lastIndexOf("}");
      if (s !== -1 && e !== -1) setLiveUpdate(JSON.parse(raw.slice(s, e + 1)));
      else setLiveErr(true);
    }).catch(() => { if (!cancelled) setLiveErr(true); }).finally(() => { if (!cancelled) setLoadingLive(false); });
    return () => { cancelled = true; };
  }, []);

  if (detail) return (
    <Page>
      <button onClick={() => setDetail(null)} style={{ background: "none", border: "none", color: T.purple, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: T.fontBody, padding: "0 0 16px", display: "flex", alignItems: "center", gap: 6 }}>← All Schemes</button>
      <div style={{ padding: "18px 16px", background: detail.color + "15", borderRadius: T.rL, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: detail.color + "20", display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${detail.color}30` }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="10" stroke={detail.color} strokeWidth="1.8" fill={detail.color} fillOpacity="0.15"/>
              <circle cx="14" cy="14" r="4.5" fill={detail.color}/>
            </svg>
          </div><div><Badge color={detail.badgeColor} bg={detail.badgeColor + "18"}>{detail.badge}</Badge><p style={{ margin: "4px 0 0", fontWeight: 800, color: T.ink, fontSize: 16 }}>{detail.label}</p></div></div>
        <p style={{ margin: "0 0 4px", color: T.ink, fontWeight: 700, fontSize: 14 }}>💰 {detail.amount}</p>
        <p style={{ margin: 0, color: T.inkSoft, fontSize: 12, lineHeight: 1.5 }}>{detail.saving}</p>
      </div>
      <Card style={{ background: T.greenL, border: `1px solid ${T.green}25`, marginBottom: 16 }}><p style={{ margin: 0, color: T.green, fontSize: 13, fontWeight: 700, lineHeight: 1.7 }}>✅ Eligibility: {detail.eligibility}</p></Card>
      <SectionLabel style={{ marginBottom: 10 }}>How to Apply</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {detail.steps.map((step, i) => (
          <Card key={i} style={{ padding: "12px 14px" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: detail.color + "20", color: detail.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
              <p style={{ margin: 0, color: T.inkSoft, fontSize: 13, lineHeight: 1.65, flex: 1 }}>{step}</p>
            </div>
          </Card>
        ))}
      </div>
      <Card style={{ background: T.amberL, border: `1px solid ${T.amber}25`, marginBottom: 14 }}>
        <p style={{ margin: "0 0 4px", fontWeight: 800, color: T.amber, fontSize: 13 }}>💡 Parent Tip</p>
        <p style={{ margin: 0, color: T.inkSoft, fontSize: 13, lineHeight: 1.6 }}>{detail.tip}</p>
      </Card>
      <Card style={{ background: "#0A2218", border: "none" }}>
        <p style={{ margin: "0 0 4px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Contact</p>
        <p style={{ margin: "0 0 10px", color: "white", fontSize: 13, fontWeight: 700 }}>{detail.contact}</p>
        <a href={`https://${detail.website}`} target="_blank" rel="noreferrer" style={{ display: "block", background: "rgba(255,255,255,0.12)", color: "white", borderRadius: T.r, padding: "10px", textDecoration: "none", fontSize: 13, fontWeight: 700, textAlign: "center" }}>🌐 Visit Official Website →</a>
      </Card>
    </Page>
  );

  return (
    <Page>
      <PageHero type="subsidies" />
      <h2 style={{ margin: "0 0 6px", color: T.ink, fontSize: 22, fontWeight: 800 }}>Subsidies & Aid</h2>
      <p style={{ margin: "0 0 20px", color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Singapore government schemes that can dramatically reduce the cost of autism therapy and support.</p>


      <Card style={{ marginBottom: 20, background: loadingLive ? T.canvas : liveErr ? T.redL : T.greenL, border: `1px solid ${liveErr ? T.red : T.green}25` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: loadingLive || liveUpdate ? 10 : 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: loadingLive ? T.amber : liveErr ? T.red : T.green }} />
            <p style={{ margin: 0, fontWeight: 800, color: T.ink, fontSize: 13 }}>Live Updates</p>
          </div>
          {!loadingLive && <p style={{ margin: 0, color: T.inkMuted, fontSize: 11 }}>via Web Search</p>}
        </div>
        {loadingLive && <p style={{ margin: 0, color: T.inkSoft, fontSize: 13 }}>Searching for latest Singapore subsidy updates...</p>}
        {liveErr && !loadingLive && <p style={{ margin: 0, color: T.red, fontSize: 13, fontWeight: 700 }}>Could not fetch live updates. Tap a scheme below for verified information.</p>}
        {liveUpdate && !loadingLive && (liveUpdate.updates || []).map((u, i) => (
          <div key={i} style={{ padding: "8px 0", borderTop: i === 0 ? "none" : `1px solid rgba(0,0,0,0.06)` }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>{u.isNew && <Badge color={T.green} bg={T.green + "20"}>NEW</Badge>}<p style={{ margin: 0, fontWeight: 700, color: T.ink, fontSize: 13 }}>{u.scheme}</p></div>
            <p style={{ margin: "2px 0 0", color: T.inkSoft, fontSize: 12 }}>{u.headline}</p>
          </div>
        ))}
      </Card>

      <Card style={{ background: T.ink, border: "none", marginBottom: 20 }}>
        <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Where to start</p>
        <p style={{ margin: "0 0 12px", color: "white", fontSize: 14, fontWeight: 700, lineHeight: 1.6 }}>If your child is under 7 — start with EIPIC. Fees can drop from $780 to as little as $5/month after subsidy.</p>
        <a href="https://supportgowhere.life.gov.sg" target="_blank" rel="noreferrer" style={{ display: "block", background: T.green, color: "white", borderRadius: T.r, padding: "10px", textDecoration: "none", fontSize: 13, fontWeight: 700, textAlign: "center" }}>🔍 Check SupportGoWhere.sg</a>
      </Card>

      <SectionLabel style={{ marginBottom: 10 }}>All Schemes</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {SUBSIDIES.map(s => (
          <Card key={s.id} onClick={() => setDetail(s)}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${s.color}20` }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="8" stroke={s.color} strokeWidth="1.5" fill={s.color} fillOpacity="0.12"/>
                  <circle cx="11" cy="11" r="3.5" fill={s.color} opacity="0.8"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                  <p style={{ margin: 0, fontWeight: 800, color: T.ink, fontSize: 14 }}>{s.label}</p>
                  <Badge color={s.badgeColor} bg={s.badgeColor + "18"}>{s.badge}</Badge>
                </div>
                <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>{s.org} · {s.amount}</p>
              </div>
              <span style={{ color: T.inkMuted, fontSize: 20 }}>›</span>
            </div>
          </Card>
        ))}
      </div>
    </Page>
  );
}

function SOSScreen({ pop }) {
  return (
    <Page>
      <PageHero type="sos" />
      <h2 style={{ margin: "0 0 6px", color: T.ink, fontSize: 22, fontWeight: 800 }}>Emergency Contacts</h2>
      <p style={{ margin: "0 0 6px", color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Singapore government and specialist contacts for autism and caregiver support.</p>
      <div style={{ background: T.redL, borderRadius: T.r, padding: "12px 14px", marginBottom: 24, border: `1px solid ${T.red}20` }}>
        <p style={{ margin: 0, color: T.red, fontWeight: 800, fontSize: 13 }}>You don't have to do this alone. Every contact below is there for you. 💛</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {SOS_CONTACTS.map((c, i) => (
          <Card key={i} accent={c.color}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: c.color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${c.color}20` }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="16" height="16" rx="4" stroke={c.color} strokeWidth="1.4" fill={c.color} fillOpacity="0.1"/>
                <rect x="9" y="5" width="2" height="6" rx="1" fill={c.color}/>
                <rect x="9" y="13" width="2" height="2" rx="1" fill={c.color}/>
              </svg>
            </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 2px", fontWeight: 800, color: T.ink, fontSize: 13 }}>{c.label}</p>
                <Badge color={c.color} bg={c.color + "15"}>{c.type}</Badge>
              </div>
              <a href={`tel:${c.number.replace(/\s/g, "")}`} style={{ background: c.color, color: "white", borderRadius: T.r, padding: "8px 12px", textDecoration: "none", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>📞 Call</a>
            </div>
            <p style={{ margin: "10px 0 0", color: T.inkMuted, fontSize: 12, fontWeight: 600 }}>{c.number}</p>
          </Card>
        ))}
      </div>
    </Page>
  );
}

function ActivitiesScreen({ pop }) {
  const [open, setOpen] = useState(null);
  const [openItem, setOpenItem] = useState(null);
  const [showFreq, setShowFreq] = useState(null);

  return (
    <Page>
      <PageHero type="activities" />
      <h2 style={{ margin: "0 0 6px", color: T.ink, fontSize: 22, fontWeight: 800 }}>Activity Guide</h2>
      <p style={{ margin: "0 0 24px", color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Research-backed activities you can do at home. Each one targets a real developmental need.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ACTIVITIES.map((cat, ci) => (
          <Card key={ci} style={{ padding: 0, overflow: "hidden" }}>
            <div onClick={() => setOpen(open === ci ? null : ci)} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: open === ci ? cat.color + "10" : T.surface }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: cat.color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${cat.color}20` }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7" stroke={cat.color} strokeWidth="1.4" fill={cat.color} fillOpacity="0.12"/>
                <circle cx="10" cy="10" r="3" fill={cat.color} opacity="0.7"/>
              </svg>
            </div>
              <p style={{ flex: 1, margin: 0, fontWeight: 800, color: cat.color, fontSize: 15 }}>{cat.label}</p>
              <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 20, transform: open === ci ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block" }}>+</span>
            </div>
            {open === ci && (
              <div style={{ padding: "0 16px 16px" }}>
                <p style={{ margin: "0 0 12px", color: T.inkSoft, fontSize: 13, lineHeight: 1.7, fontStyle: "italic" }}>{cat.why}</p>
                <Card onClick={() => setShowFreq(showFreq === ci ? null : ci)} style={{ background: showFreq === ci ? T.ink : T.canvas, border: "none", marginBottom: 12, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ margin: 0, fontWeight: 800, color: showFreq === ci ? "white" : T.ink, fontSize: 13 }}>How often should my child do this?</p>
                    <span style={{ color: showFreq === ci ? "white" : T.inkMuted, fontWeight: 300, fontSize: 18, transform: showFreq === ci ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block" }}>+</span>
                  </div>
                  {showFreq === ci && (
                    <div style={{ marginTop: 10 }}>
                      <p style={{ margin: "0 0 4px", color: cat.color, fontWeight: 800, fontSize: 14 }}>{cat.freq}</p>
                      <p style={{ margin: "0 0 8px", color: "rgba(255,255,255,0.65)", fontSize: 12, lineHeight: 1.6 }}>{cat.source}</p>
                      <p style={{ margin: 0, color: T.amber, fontSize: 12, fontWeight: 700 }}>💡 {cat.tip}</p>
                    </div>
                  )}
                </Card>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cat.items.map((item, ii) => (
                    <Card key={ii} onClick={() => setOpenItem(openItem === `${ci}-${ii}` ? null : `${ci}-${ii}`)} style={{ background: openItem === `${ci}-${ii}` ? cat.color + "10" : T.canvas, border: "none", padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ margin: 0, fontWeight: 700, color: T.ink, fontSize: 13 }}>{item.name}</p>
                        <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 18, transform: openItem === `${ci}-${ii}` ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block" }}>+</span>
                      </div>
                      {openItem === `${ci}-${ii}` && (
                        <div style={{ marginTop: 10 }}>
                          <p style={{ margin: "0 0 8px", color: T.inkSoft, fontSize: 13, lineHeight: 1.65 }}>{item.desc}</p>
                          <Badge color={cat.color} bg={cat.color + "18"}>✓ {item.benefit}</Badge>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </Page>
  );
}
const RuleIcon = ({ type }) => {
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
const MethodIcon = ({ idx, color }) => {
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

function TrainingScreen({ pop }) {
  const [env, setEnv] = useState("home");
  const [view, setView] = useState("rules");
  const [openRule, setOpenRule] = useState(null);
  const [openMethod, setOpenMethod] = useState(null);

  const rules = {
    home: {
      good: [
        { label: "Asking for help", how: "Teach: hold up a picture card = 'I need help'. Reward within 3 seconds with praise + preferred item." },
        { label: "Sitting at mealtimes", how: "Use a visual 'sit' card at their chair. Start with 2 minutes, increase gradually. Celebrate each step." },
        { label: "Putting toys away", how: "Picture labels on bins, a 'tidy up' song as cue. Make it a timer game — no shame if they miss." },
        { label: "Gentle touch", how: "Model on a doll first. Use pictures: 'gentle hands'. Immediate praise when shown — not delayed." },
        { label: "Following bedtime routine", how: "Visual schedule with pictures. Same sequence every night. Small reward for each step completed." },
      ],
      bad: [
        { label: "Hitting or biting family", how: "Stay calm. Say 'No hitting' once. Block physically. Redirect hands to squeeze toy immediately. Never raise voice." },
        { label: "Throwing objects", how: "Find the trigger (avoidance? Sensory need?). Create a 'throwing zone' with soft balls. Remove dangerous objects proactively." },
        { label: "Refusing hygiene", how: "One step at a time. Use preferred music, flavoured toothpaste, visual timer. Never force — it creates lasting aversion." },
        { label: "Running Away / Wandering Off", how: "Red hand 'stop' card. Practise 'stop' as a daily game when calm. Check escape triggers: open doors, sounds, water nearby. Affects 1 in 2 autistic children — treat as a safety priority." },
      ],
    },
    school: {
      good: [
        { label: "Sitting in class", how: "Sensory cushion + visual 'sit' card on desk. Short chunks with movement breaks — don't demand sustained sitting." },
        { label: "Communicating needs", how: "Teach: tap teacher's arm or show a 'my turn' card. Physical alternatives to hand-raising for motor-challenged children." },
        { label: "Sharing / turn-taking", how: "'My turn / your turn' visual card. Practise with preferred activities first so sharing feels safe, not threatening." },
        { label: "Packing/unpacking bag", how: "Visual checklist inside the bag. Practise daily at home — don't rely on school alone to teach this." },
      ],
      bad: [
        { label: "Meltdowns in class", how: "Pre-agreed calm corner with sensory items — not punishment, a tool. Identify and reduce triggers before they escalate." },
        { label: "Refusing tasks", how: "'First-Then' boards: 'First work, then iPad.' Micro-steps, choices within task — restore control without removing demand." },
        { label: "Loud vocalizations", how: "Identify function: overwhelm? Excitement? Boredom? Fidget tool + quieter activity. Never shush harshly — it escalates anxiety." },
        { label: "Leaving the classroom", how: "Pre-arrange a 'pass to quiet room' system. Giving control reduces the urgency to escape." },
      ],
    },
  };

  const methods = [
    { title: "Positive Reinforcement (ABA)", color: T.amber, body: "Immediately reward desired behaviour within 3 seconds. A 2024 BMC Psychology study showed significant social, communication, and daily living improvements using reinforcement-based ABA.", tip: "Timing is everything. A reward 10 seconds late teaches nothing. 3 seconds is the window." },
    { title: "Visual Supports", color: T.teal, body: "Picture cards, First-Then boards, visual schedules — they reduce anxiety by making expectations concrete and predictable. Research confirms significant on-task behaviour improvements.", tip: "Put visuals at the child's eye level. Use real photos of your child and your home — not clip art." },
    { title: "Social Stories", color: T.green, body: "Short illustrated stories explaining social situations in first person. Developed by Carol Gray — one of the most evidence-based tools for teaching rules to autistic children.", tip: "4–6 sentences, pictures, read daily — not just when problems arise. Prevention, not reaction." },
    { title: "Task Analysis", color: "#8B5CF6", body: "'Wash hands' = 7 separate steps. Break every skill into the smallest possible steps. Teach each explicitly before moving to the next.", tip: "Never assume a step is obvious. Write every micro-step down and teach each one." },
    { title: "Consistency", color: T.red, body: "Autistic children struggle to generalise rules across settings. Parents and teachers must use identical language, visuals, and rewards — or the child re-learns the same rule multiple times.", tip: "Share your visual systems with the school. Inconsistency is the #1 reason good training fails." },
  ];

  return (
    <Page>
      <h2 style={{ margin: "0 0 12px", color: T.ink, fontSize: 22, fontWeight: 800 }}>Behaviour Training</h2>
      <PageHero type="training" />
      <p style={{ margin: "0 0 20px", color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Research-backed strategies to help your child learn what's expected — at home and at school.</p>


      <div style={{ display: "flex", background: T.border, borderRadius: T.r, padding: 3, gap: 3, marginBottom: 20 }}>
        {[["rules","Rules"],["methods","How to Teach"]].map(([v, l]) => (
          <button key={v} onClick={() => setView(v)} style={{ flex: 1, padding: "10px", borderRadius: 9, background: view === v ? T.surface : "transparent", border: "none", fontWeight: 700, fontSize: 13, color: view === v ? T.purple : T.inkMuted, cursor: "pointer", fontFamily: T.fontBody, boxShadow: view === v ? T.shadow : "none", transition: "all 0.2s" }}>{l}</button>
        ))}
      </div>

      {view === "rules" && (
        <>

          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {["home","school"].map(e => (
              <button key={e} onClick={() => { setEnv(e); setOpenRule(null); }} style={{ flex: 1, padding: "10px 14px", borderRadius: T.r, border: `1.5px solid ${env === e ? T.purple : T.border}`, background: env === e ? T.purpleL : T.surface, fontWeight: 700, fontSize: 13, color: env === e ? T.purple : T.inkMuted, cursor: "pointer", fontFamily: T.fontBody, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}>
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


          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: T.greenL, border: `1px solid ${T.green}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke={T.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase", letterSpacing: "0.08em" }}>Encourage</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {rules[env].good.map((r, i) => (
              <Card key={i} onClick={() => setOpenRule(openRule === `g${i}` ? null : `g${i}`)} style={{ background: openRule === `g${i}` ? T.greenL : T.surface, border: `1px solid ${openRule === `g${i}` ? T.green + "30" : T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <RuleIcon type="good" />
                  <p style={{ flex: 1, margin: 0, fontWeight: 700, color: T.ink, fontSize: 14 }}>{r.label}</p>
                  <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 18, transform: openRule === `g${i}` ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block" }}>+</span>
                </div>
                {openRule === `g${i}` && (
                  <div style={{ margin: "12px 0 0 48px", padding: "10px 12px", background: T.surface, borderRadius: T.r }}>
                    <p style={{ margin: 0, color: T.inkSoft, fontSize: 13, lineHeight: 1.7 }}>{r.how}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>


          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: T.redL, border: `1px solid ${T.red}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 5H7" stroke={T.red} strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: T.red, textTransform: "uppercase", letterSpacing: "0.08em" }}>Redirect</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rules[env].bad.map((r, i) => (
              <Card key={i} onClick={() => setOpenRule(openRule === `b${i}` ? null : `b${i}`)} style={{ background: openRule === `b${i}` ? T.redL : T.surface, border: `1px solid ${openRule === `b${i}` ? T.red + "30" : T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <RuleIcon type="bad" />
                  <p style={{ flex: 1, margin: 0, fontWeight: 700, color: T.ink, fontSize: 14 }}>{r.label}</p>
                  <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 18, transform: openRule === `b${i}` ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block" }}>+</span>
                </div>
                {openRule === `b${i}` && (
                  <div style={{ margin: "12px 0 0 48px", padding: "10px 12px", background: T.surface, borderRadius: T.r }}>
                    <p style={{ margin: 0, color: T.inkSoft, fontSize: 13, lineHeight: 1.7 }}>{r.how}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: "12px 14px", background: T.amberL, borderRadius: T.r, border: `1px solid ${T.amber}20`, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: T.amber, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 3V5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><circle cx="5" cy="7.5" r="0.8" fill="white"/></svg>
            </div>
            <p style={{ margin: 0, color: T.amber, fontWeight: 700, fontSize: 13, lineHeight: 1.7 }}>Never use punishment, shame, or time-outs. Always show what to do instead of just saying "no".</p>
          </div>
        </>
      )}

      {view === "methods" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {methods.map((m, i) => (
            <Card key={i} onClick={() => setOpenMethod(openMethod === i ? null : i)} style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, background: openMethod === i ? m.color + "08" : T.surface }}>
                <MethodIcon idx={i} color={m.color} />
                <p style={{ flex: 1, margin: 0, fontWeight: 700, color: T.ink, fontSize: 14 }}>{m.title}</p>
                <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 18, transform: openMethod === i ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block" }}>+</span>
              </div>
              {openMethod === i && (
                <div style={{ padding: "0 16px 16px" }}>
                  <p style={{ margin: "0 0 12px", color: T.inkSoft, fontSize: 13, lineHeight: 1.7 }}>{m.body}</p>
                  <div style={{ background: m.color + "12", borderRadius: T.r, padding: "10px 12px", border: `1px solid ${m.color}20`, display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <p style={{ margin: 0, color: m.color, fontWeight: 700, fontSize: 12, lineHeight: 1.6 }}>{m.tip}</p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </Page>
  );
}
//  ROOT APP — 4-tab nav + push stack for secondary screens
const NAV = [
  { id: "home",      label: "Home",      icon: "🏠" },
  { id: "mychild",   label: "My Child",  icon: "🧠" },
  { id: "schedule",  label: "Schedule",  icon: "📋" },
  { id: "community", label: "Community", icon: "💬" },
];

// Converts a "data:image/jpeg;base64,..." string (from canvas/FileReader) into a Blob for upload.
const dataUrlToBlob = (dataUrl) => {
  const [meta, b64] = dataUrl.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] || "image/jpeg";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
};

// Uploads a photo (data URL) to the "public" storage bucket under assets/<folder>/
// and returns its public URL — so only a short link is stored in the database/JWT,
// never the raw image bytes (which previously bloated the auth token past 100KB).
const uploadPhoto = async (dataUrl, folder, ownerId) => {
  if (!dataUrl || !dataUrl.startsWith("data:")) return null;
  const blob = dataUrlToBlob(dataUrl);
  const path = `assets/${folder}/${ownerId}-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from("public").upload(path, blob, { contentType: blob.type, upsert: true });
  if (error) { console.error(`Failed to upload ${folder} photo:`, error.message); return null; }
  const { data } = supabase.storage.from("public").getPublicUrl(path);
  return data.publicUrl;
};

const forceSignOut = async () => {
  let failed = false;
  try {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    failed = !!error;
  } catch {
    failed = true;
  }
  if (failed) {
    // Network to Supabase is unreachable — clear the session locally so the user isn't stuck signed in.
    try {
      Object.keys(localStorage).forEach(k => { if (k.startsWith("sb-") && k.endsWith("-auth-token")) localStorage.removeItem(k); });
    } catch {}
    window.location.reload();
  }
};

const accountFromUser = (u) => u ? {
  id: u.id,
  name: u.user_metadata?.name || u.email,
  avatar: u.user_metadata?.avatar || "none",
  email: u.email,
  joined: u.user_metadata?.joined || new Date(u.created_at).toLocaleDateString("en-SG", { month: "short", year: "numeric" }),
} : null;

export default function Bonda() {
  const [tab, setTab] = useState("home");
  const [stack, setStack] = useState([]); // secondary screens pushed on top
  const [account, setAccount] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setAccount(accountFromUser(data.session?.user));
      setAuthLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccount(accountFromUser(session?.user));
      setAuthLoading(false);
    });
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  const childCtx = useChildren(account?.id);

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: T.canvas, fontFamily: T.fontBody, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: T.inkSoft, fontSize: 14, fontWeight: 700 }}>Loading…</p>
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
  };

  const pageTitle = current ? TITLES[current] || "" : TITLES[tab];

  const renderMain = () => {
    switch (tab) {
      case "home":      return <HomeScreen childCtx={childCtx} setTab={setTab} push={push} />;
      case "mychild":   return <MyChildScreen childCtx={childCtx} />;
      case "schedule":  return <ScheduleScreen childCtx={childCtx} push={push} />;
      case "community": return <CommunityScreen account={account} />;
      default:          return null;
    }
  };

  const renderStack = () => {
    if (!current) return null;
    switch (current) {
      case "subsidies":  return <SubsidiesScreen pop={pop} />;
      case "sos":        return <SOSScreen pop={pop} />;
      case "activities": return <ActivitiesScreen pop={pop} />;
      case "training":   return <TrainingScreen pop={pop} />;
      case "addChild":   return <AddChildScreen childCtx={childCtx} pop={pop} />;
      case "fosterHub":   return <FosterHubScreen pop={pop} />;
      default:           return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.canvas, fontFamily: T.fontBody, display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />


      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "10px 18px 0", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10 }}>

          <div onClick={() => current ? pop() : setTab("home")} style={{ width: 34, height: 34, borderRadius: "50%", background: T.purple, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="6.5" stroke="white" strokeWidth="1.6"/>
              <circle cx="10" cy="10" r="2.5" fill="white"/>
              <circle cx="10" cy="2.5" r="1.2" fill="white" opacity="0.55"/>
              <circle cx="17.5" cy="10" r="1.2" fill="white" opacity="0.55"/>
              <circle cx="10" cy="17.5" r="1.2" fill="white" opacity="0.55"/>
              <circle cx="2.5" cy="10" r="1.2" fill="white" opacity="0.55"/>
            </svg>
          </div>

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
            {NAV.map(n => (
              <button key={n.id} onClick={() => setTab(n.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", fontFamily: T.fontBody, padding: "4px 14px", borderRadius: T.r, transition: "all 0.15s" }}>
                <NavMark id={n.id} active={tab === n.id} />
                <span style={{ fontSize: 10, fontWeight: tab === n.id ? 800 : 600, color: tab === n.id ? T.purple : T.inkMuted, letterSpacing: "0.02em" }}>{n.label}</span>
                {tab === n.id && <div style={{ width: 20, height: 2.5, borderRadius: 99, background: T.purple, marginTop: 0 }} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
