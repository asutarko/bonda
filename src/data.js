import { T } from "./theme";

export const CHILD_AVATARS = ["🦁","🐨","🐼","🦊","🐸","🦋","🌸","🌟","🐬","🦄","🐧","🐯"];

export const DEFAULT_CHILDREN = [];

// Maps a Supabase "children" row to the shape the rest of the app expects

export const DEFAULT_SCHEDULE = [
  { id: "s1", emoji: "🌅", label: "Wake Up",      time: "07:00", category: "routine" },
  { id: "s2", emoji: "🍳", label: "Breakfast",    time: "07:30", category: "meals" },
  { id: "s3", emoji: "🦷", label: "Brush Teeth",  time: "08:00", category: "routine" },
  { id: "s4", emoji: "🎨", label: "Activity Time",time: "09:00", category: "play" },
  { id: "s5", emoji: "🥗", label: "Lunch",        time: "12:00", category: "meals" },
  { id: "s6", emoji: "😴", label: "Rest Time",    time: "13:00", category: "rest" },
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

// Colour choices for Community group rooms & groups — admins pick one of
// these when creating an admin room, and parents pick one when creating
// their own group (community_groups). "purple" stays the original Bonda
// brand teal: community_groups.color_key defaults to 'purple' in Supabase,
// and it's the fallback everywhere a group/message has no explicit colour
// (see the `|| ROOM_COLORS.purple` call sites), so recolouring it would
// change the default look of existing groups and DM bubbles app-wide. The
// other 7 match the rainbow swatches used for schedule categories in
// ScheduleScreen.jsx's CATEGORY_COLORS (red, orange, yellow, green, blue,
// violet) plus a neutral slate. Key names are legacy (e.g. "teal" holds
// yellow, "indigo" holds blue) — they're stored as color_key and never shown
// as text, so keep them stable even though they no longer describe the hue.
export const ROOM_COLORS = {
  red:    { color: "#E5484D", bg: "#FDE7E7" },
  amber:  { color: "#F5A623", bg: "#FDEEDA" },
  green:  { color: "#3DA35D", bg: "#E3F3E8" },
  teal:   { color: "#E9C716", bg: "#FBF6D9" },
  indigo: { color: "#3B82C4", bg: "#E3EEF8" },
  violet: { color: "#8B5CF6", bg: "#EFE9FE" },
  purple: { color: T.purple,  bg: T.purpleL },
  slate:  { color: "#64748B", bg: "#E9ECF0" },
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

// Used on the child profile form and reused as-is when generating a carer letter.
export const PLACEMENT_TYPE_OPTIONS = ["short-term", "long-term", "kinship", "emergency"];

// The parent account's relationship to the child(ren) they care for.
export const RELATIONSHIP_OPTIONS = ["Father", "Mother", "Foster/Adoptive Parent", "Older Sibling", "Younger Sibling", "Grandfather", "Grandmother", "Aunt"];

// Standard KTP/Dukcapil occupation categories, kept short so they fit as tap-to-select pills.
export const OCCUPATION_OPTIONS = ["Unemployed", "Homemaker", "Student", "Civil Servant", "Military/Police", "Private Employee", "Self-Employed", "Farmer", "Laborer", "Retired", "Other"];

export const MARITAL_STATUS_OPTIONS = ["Single", "Married", "Divorced", "Widowed"];

// Multi-select option lists for the child profile's "About your child" and
// "Medical information" sections. Selections are joined into the existing
// free-text columns (diagnosis, known_triggers, diet_program) on save, so an
// "Other" pick always carries its typed detail along with it.
export const DIAGNOSIS_OPTIONS = [
  "Autism Spectrum Disorder (ASD)", "ADHD", "Sensory Processing Disorder",
  "Global Developmental Delay", "Speech & Language Delay", "Intellectual Disability",
  "Dyslexia", "Dyspraxia (DCD)", "Dyscalculia", "Anxiety", "OCD",
  "Tourette / Tic Disorder", "Down Syndrome", "Epilepsy",
  "Not yet diagnosed / In assessment", "Other",
];

export const TRIGGER_OPTIONS = [
  "Loud or sudden noises", "Bright or flickering lights", "Crowded / busy places",
  "Changes in routine", "Transitions between activities", "Certain textures",
  "Strong smells", "Unexpected touch", "Hunger or tiredness", "Screen time ending",
  "Waiting / delays", "Other",
];

export const DIET_OPTIONS = [
  "Gluten-free", "Casein / dairy-free", "GFCF (gluten & casein-free)", "Low-sugar",
  "Feingold diet", "Specific Carbohydrate Diet", "Ketogenic", "Elimination diet",
  "Halal", "Vegetarian", "Other",
];

export const ALLERGY_OPTIONS = [
  "Nuts", "Dairy", "Eggs", "Seafood / Shellfish", "Gluten / Wheat", "Soy",
  "Pollen / Dust", "Other",
];

export const THERAPY_TYPES = [
  "Occupational Therapy", "Speech & Language Therapy", "ABA Therapy", "Physiotherapy",
  "Behavioural Therapy", "Psychology / Counselling", "Music Therapy",
  "Early Intervention (EIPIC)", "Other",
];

// Optional additional-needs profile, filled in by the parent in their own words.
