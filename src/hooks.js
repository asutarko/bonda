import { useState, useEffect, useRef } from "react";
import { supabase } from "./lib/supabase";
import { DEFAULT_SCHEDULE } from "./data";

export const childFromRow = (row) => ({
  id: row.id,
  name: row.name,
  emoji: row.emoji,
  caregiverType: row.caregiver_type,
  caregiverLabel: row.caregiver_label || "",
  dob: row.dob || "",
  gender: row.gender || "",
  scheduleItems: row.schedule_items?.length ? row.schedule_items : DEFAULT_SCHEDULE,
  history: row.history || [],
  devLog: row.dev_log || [],
  todayDone: row.today_done || {},
  todayDoneDate: row.today_done_date || null,
  hasSpecialNeeds: row.has_special_needs || false,
  verbalStatus: row.verbal_status || "",
  knownTriggers: row.known_triggers || "",
  therapySchedule: row.therapy_schedule || "",
  dietProgram: row.diet_program || "",
  psychologistId: row.psychologist_id || null,
  active: row.active ?? true,
  createdAt: row.created_at,
});

export function useChildren(userId) {
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
      caregiver_type: child.caregiverType,
      caregiver_label: child.caregiverLabel || "",
      dob: child.dob || null,
      gender: child.gender || "",
      schedule_items: DEFAULT_SCHEDULE,
      history: [],
      dev_log: [],
      has_special_needs: child.hasSpecialNeeds || false,
      verbal_status: child.hasSpecialNeeds ? (child.verbalStatus || "") : "",
      known_triggers: child.hasSpecialNeeds ? (child.knownTriggers || "") : "",
      therapy_schedule: child.hasSpecialNeeds ? (child.therapySchedule || "") : "",
      diet_program: child.hasSpecialNeeds ? (child.dietProgram || "") : "",
    }).select().single();
    if (error || !data) { if (error) console.error("Failed to add child profile:", error.message); return null; }
    const newChild = childFromRow(data);
    setChildren(cs => [...cs, newChild]);
    switchChild(newChild.id);
    return newChild.id;
  };

  // "active" is deliberately not whitelisted below — only an admin account can
  // change it (enforced by a DB trigger), so the parent-facing app never writes it.
  const updateChild = (id, patch) => {
    setChildren(cs => cs.map(c => c.id === id ? { ...c, ...patch } : c));
    const dbPatch = {};
    if ("name" in patch) dbPatch.name = patch.name;
    if ("emoji" in patch) dbPatch.emoji = patch.emoji;
    if ("caregiverType" in patch) dbPatch.caregiver_type = patch.caregiverType;
    if ("caregiverLabel" in patch) dbPatch.caregiver_label = patch.caregiverLabel;
    if ("dob" in patch) dbPatch.dob = patch.dob || null;
    if ("gender" in patch) dbPatch.gender = patch.gender;
    if ("scheduleItems" in patch) dbPatch.schedule_items = patch.scheduleItems;
    if ("history" in patch) dbPatch.history = patch.history;
    if ("devLog" in patch) dbPatch.dev_log = patch.devLog;
    if ("todayDone" in patch) dbPatch.today_done = patch.todayDone;
    if ("todayDoneDate" in patch) dbPatch.today_done_date = patch.todayDoneDate;
    if ("hasSpecialNeeds" in patch) dbPatch.has_special_needs = patch.hasSpecialNeeds;
    if ("verbalStatus" in patch) dbPatch.verbal_status = patch.verbalStatus;
    if ("knownTriggers" in patch) dbPatch.known_triggers = patch.knownTriggers;
    if ("therapySchedule" in patch) dbPatch.therapy_schedule = patch.therapySchedule;
    if ("dietProgram" in patch) dbPatch.diet_program = patch.dietProgram;
    supabase.from("children").update(dbPatch).eq("id", id).then(({ error }) => { if (error) console.error("Failed to save child profile:", error.message); });
  };

  const deleteChild = async (id) => {
    const { error } = await supabase.from("children").delete().eq("id", id);
    if (error) { console.error("Failed to delete child profile:", error.message); return false; }
    setChildren(cs => {
      const remaining = cs.filter(c => c.id !== id);
      if (activeId === id) {
        const nextId = remaining[0]?.id || null;
        setActiveId(nextId);
        try {
          if (nextId) localStorage.setItem(`cb_active_child_${userId}`, nextId);
          else localStorage.removeItem(`cb_active_child_${userId}`);
        } catch {}
      }
      return remaining;
    });
    return true;
  };

  const activeChild = children.find(c => c.id === activeId) || children[0] || null;

  return { children, activeChild, addChild, updateChild, deleteChild, switchChild, loading, userId };
}

// Stack of "close this" callbacks registered by open modals/forms, so the
// hardware/browser back button can dismiss them instead of leaving the app.

export const backHandlerStack = [];

export function useBackHandler(active, onBack) {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;
  useEffect(() => {
    if (!active) return;
    const handler = () => onBackRef.current();
    backHandlerStack.push(handler);
    return () => {
      const idx = backHandlerStack.lastIndexOf(handler);
      if (idx !== -1) backHandlerStack.splice(idx, 1);
    };
  }, [active]);
}

export const dataUrlToBlob = (dataUrl) => {
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

export const uploadPhoto = async (dataUrl, folder, ownerId) => {
  if (!dataUrl || !dataUrl.startsWith("data:")) return null;
  const blob = dataUrlToBlob(dataUrl);
  const dir = `assets/${folder}`;
  const fileName = `${ownerId}-${Date.now()}.jpg`;
  const path = `${dir}/${fileName}`;
  const { error } = await supabase.storage.from("public").upload(path, blob, { contentType: blob.type, upsert: true });
  if (error) { console.error(`Failed to upload ${folder} photo:`, error.message); return null; }

  // Remove this owner's previous photo(s) so old uploads don't pile up in storage.
  const { data: existing } = await supabase.storage.from("public").list(dir, { search: `${ownerId}-` });
  const stale = (existing || [])
    .filter(f => f.name.startsWith(`${ownerId}-`) && f.name !== fileName)
    .map(f => `${dir}/${f.name}`);
  if (stale.length) await supabase.storage.from("public").remove(stale);

  const { data } = supabase.storage.from("public").getPublicUrl(path);
  return data.publicUrl;
};

export const forceSignOut = async () => {
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

export const accountFromUser = (u) => u ? {
  id: u.id,
  name: u.user_metadata?.name || u.email,
  avatar: u.user_metadata?.avatar || "none",
  email: u.email,
  joined: u.user_metadata?.joined || new Date(u.created_at).toLocaleDateString("en-SG", { month: "short", year: "numeric" }),
  gender: u.user_metadata?.gender || "",
  address: u.user_metadata?.address || "",
  phone: u.user_metadata?.phone || "",
  relationship: u.user_metadata?.relationship || "",
  occupation: u.user_metadata?.occupation || "",
  nationality: u.user_metadata?.nationality || "",
  maritalStatus: u.user_metadata?.maritalStatus || "",
} : null;
