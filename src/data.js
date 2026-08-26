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

// Colour choices for Community group rooms & groups — admins pick one of
// these when creating an admin room, and parents pick one when creating
// their own group (community_groups).

export const ROOM_COLORS = {
  red:    { color: T.red,    bg: T.redL },
  amber:  { color: T.amber,  bg: T.amberL },
  green:  { color: T.green,  bg: T.greenL },
  teal:   { color: T.teal,   bg: T.tealL },
  indigo: { color: T.indigo, bg: T.indigoL },
  violet: { color: T.violet, bg: T.violetL },
  purple: { color: T.purple, bg: T.purpleL },
  slate:  { color: T.slate,  bg: T.slateL },
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
