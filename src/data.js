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
export const RELATIONSHIP_OPTIONS = ["Father", "Mother", "Foster/Adoptive Parent", "Older Sibling", "Younger Sibling", "Grandfather", "Grandmother", "Aunt"];

// Standard KTP/Dukcapil occupation categories, kept short so they fit as tap-to-select pills.
export const OCCUPATION_OPTIONS = ["Unemployed", "Homemaker", "Student", "Civil Servant", "Military/Police", "Private Employee", "Self-Employed", "Farmer", "Laborer", "Retired", "Other"];

export const MARITAL_STATUS_OPTIONS = ["Single", "Married", "Divorced", "Widowed"];

// Singapore immigration/residency status of the caregiver.
export const HOLDER_PASS_OPTIONS = ["Singapore Citizen", "Singapore PR", "Employment Pass", "S Pass", "Student Pass", "Foreigner"];

// Countries shown in the searchable Location combobox on Edit Profile.
export const COUNTRY_OPTIONS = [
  "Singapore", "Indonesia", "Malaysia", "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia",
  "Australia", "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belarus", "Belgium", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Brazil", "Brunei", "Bulgaria", "Cambodia", "Cameroon", "Canada",
  "Chile", "China", "Colombia", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark",
  "Ecuador", "Egypt", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Georgia",
  "Germany", "Ghana", "Greece", "Hong Kong", "Hungary", "Iceland", "India", "Iran",
  "Iraq", "Ireland", "Israel", "Italy", "Japan", "Jordan", "Kazakhstan", "Kenya",
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Libya", "Lithuania", "Luxembourg",
  "Macau", "Madagascar", "Maldives", "Mali", "Malta", "Mexico", "Moldova", "Mongolia",
  "Montenegro", "Morocco", "Myanmar", "Nepal", "Netherlands", "New Zealand", "Nigeria", "North Korea",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Panama", "Papua New Guinea", "Paraguay", "Peru",
  "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saudi Arabia",
  "Serbia", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan",
  "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste",
  "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
  "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe", "Other",
];

// Optional additional-needs profile, filled in by the parent in their own words.
