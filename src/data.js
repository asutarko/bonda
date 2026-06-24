import { T } from "./theme";

export const CHILD_AVATARS = ["🦁","🐨","🐼","🦊","🐸","🦋","🌸","🌟","🐬","🦄","🐧","🐯"];

export const DEFAULT_CHILDREN = [];

// Maps a Supabase "children" row to the shape the rest of the app expects

export const DEFAULT_SCHEDULE = [
  { id: "s1", emoji: "🌅", label: "Wake Up",      time: "07:00" },
  { id: "s2", emoji: "🍳", label: "Breakfast",    time: "07:30" },
  { id: "s3", emoji: "🦷", label: "Brush Teeth",  time: "08:00" },
  { id: "s4", emoji: "🎨", label: "Activity Time",time: "09:00" },
  { id: "s5", emoji: "🥗", label: "Lunch",        time: "12:00" },
  { id: "s6", emoji: "😴", label: "Rest Time",    time: "13:00" },
];

export const db = {
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

// Icon choices for Community group rooms — admins pick one of these
// when creating a room (rooms themselves are stored in the database).

export const ROOM_COLORS = {
  purple: { color: T.purple, bg: T.purpleL },
  green:  { color: T.green,  bg: T.greenL },
  amber:  { color: T.amber,  bg: T.amberL },
  teal:   { color: T.teal,   bg: T.tealL },
  red:    { color: T.red,    bg: T.redL },
};

export const SOS_COLORS = {
  ...ROOM_COLORS,
  gray: { color: T.inkSoft, bg: T.canvas },
};

export const VERBAL_STATUS_OPTIONS = [
  { key: "verbal",    label: "Verbal" },
  { key: "nonverbal", label: "Nonverbal" },
  { key: "mixed",     label: "Mixed / Emerging" },
];

// The parent account's relationship to the child(ren) they care for.
export const RELATIONSHIP_OPTIONS = ["Father", "Mother", "Older Sibling", "Younger Sibling", "Grandfather", "Grandmother", "Aunt"];

// Standard KTP/Dukcapil occupation categories, kept short so they fit as tap-to-select pills.
export const OCCUPATION_OPTIONS = ["Unemployed", "Homemaker", "Student", "Civil Servant", "Military/Police", "Private Employee", "Self-Employed", "Farmer", "Laborer", "Retired", "Other"];

export const NATIONALITY_OPTIONS = ["Indonesian Citizen", "Foreign Citizen"];

export const MARITAL_STATUS_OPTIONS = ["Single", "Married", "Divorced", "Widowed"];

// Optional additional-needs profile, filled in by the parent in their own words. This
// powers the adaptive "Gentle Prompts" check-in questions (see AUTISM_PROMPTS) — e.g. a
// known trigger or diet program the parent describes here gets reflected back as a
// check-in question, instead of the app guessing with a generic one.
