export const T = {
  // Colours — Bonda palette (ivory canvas + single teal accent, matches AuthScreen)
  ink:      "#23201C",   // Warm ink — primary text / nav active
  inkSoft:  "rgba(35,32,28,.70)",   // Secondary text
  inkMuted: "rgba(35,32,28,.45)",   // Captions, timestamps
  canvas:   "#F4F1EB",   // Warm ivory — app background
  surface:  "#FFFFFF",   // Pure white — cards
  border:   "rgba(35,32,28,.12)",  // Hairline dividers

  // Primary — Teal accent (single accent for links / active / primary only)
  purple:   "#3E6E6A",   // Bonda Primary (kept as "purple" key so call sites don't need renaming)
  purpleL:  "#E6EDEC",   // Bonda Primary Light tint
  purplePress: "#345F5B", // Hover/press state for the primary accent

  // Supporting colours (muted tag tones, paired bg/text)
  green:    "#2E5A56",
  greenL:   "#E6EDEC",
  amber:    "#8A6A3C",
  amberL:   "#F1E7D8",
  red:      "#B4544F",
  redL:     "#F3E7EA",
  teal:     "#3A5A78",
  tealL:    "#E4ECF3",
  violet:   "#574B78",
  violetL:  "#EDE8F3",
  indigo:   "#444B78",
  indigoL:  "#E8EAF3",
  slate:    "#474C52",
  slateL:   "#E9EAEC",

  // Typography — Fraunces for headings/titles, Plus Jakarta Sans for everything else
  fontDisplay: "'Fraunces', Georgia, serif",
  fontBody:    "'Plus Jakarta Sans', sans-serif",

  // Spacing
  r:  "14px",
  rL: "18px",
  rXL:"24px",

  // Shadows — soft warm-ink tint, hairline-first design
  shadow: "0 1px 2px rgba(35,32,28,0.04), 0 2px 8px rgba(35,32,28,0.05)",
  shadowM:"0 8px 24px rgba(35,32,28,0.10)",
};
//  SHARED PRIMITIVES

// Universal page wrapper — same padding, same top gap
