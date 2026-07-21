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
  diagnosis: row.diagnosis || "",
  placementStartDate: row.placement_start_date || "",
  fosteringAgency: row.fostering_agency || "",
  placementType: row.placement_type || "",
  courtOrderRef: row.court_order_ref || "",
  caseWorkerName: row.case_worker_name || "",
  caseWorkerPhone: row.case_worker_phone || "",
  caseWorkerEmail: row.case_worker_email || "",
  clinicName: row.clinic_name || "",
  location: row.location || "",
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
      diagnosis: child.diagnosis || "",
      placement_start_date: child.placementStartDate || null,
      fostering_agency: child.fosteringAgency || "",
      placement_type: child.placementType || "",
      court_order_ref: child.courtOrderRef || "",
      case_worker_name: child.caseWorkerName || "",
      case_worker_phone: child.caseWorkerPhone || "",
      case_worker_email: child.caseWorkerEmail || "",
      clinic_name: child.clinicName || "",
      location: child.location || "",
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
    if ("diagnosis" in patch) dbPatch.diagnosis = patch.diagnosis;
    if ("placementStartDate" in patch) dbPatch.placement_start_date = patch.placementStartDate || null;
    if ("fosteringAgency" in patch) dbPatch.fostering_agency = patch.fosteringAgency;
    if ("placementType" in patch) dbPatch.placement_type = patch.placementType;
    if ("courtOrderRef" in patch) dbPatch.court_order_ref = patch.courtOrderRef;
    if ("caseWorkerName" in patch) dbPatch.case_worker_name = patch.caseWorkerName;
    if ("caseWorkerPhone" in patch) dbPatch.case_worker_phone = patch.caseWorkerPhone;
    if ("caseWorkerEmail" in patch) dbPatch.case_worker_email = patch.caseWorkerEmail;
    if ("clinicName" in patch) dbPatch.clinic_name = patch.clinicName;
    if ("location" in patch) dbPatch.location = patch.location;
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

// Downscales an image file to fit within maxDim×maxDim and re-encodes it as
// JPEG at the given quality, via canvas — cuts typical phone-camera photos
// (3-8MB) down to a few hundred KB before they ever reach Supabase Storage,
// which matters on the free plan's storage cap. Falls back to the original
// file if decoding fails (e.g. unsupported format).
export const compressImage = (file, maxDim = 800, quality = 0.75) => new Promise(resolve => {
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(objectUrl);
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale) || 1;
    const h = Math.round(img.height * scale) || 1;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d").drawImage(img, 0, 0, w, h);
    canvas.toBlob(blob => resolve(blob || file), "image/jpeg", quality);
  };
  img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
  img.src = objectUrl;
});

// Community chat attachments are limited to images and Word/Excel/PDF
// documents — no video, audio, or other file types. Checked by MIME type
// first, falling back to the extension since some browsers/OSes report
// generic MIME types (e.g. "application/octet-stream") for .doc/.xls files.
const COMMUNITY_DOC_MIME_TO_EXT = {
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/pdf": "pdf",
};
const COMMUNITY_DOC_EXTS = ["doc", "docx", "xls", "xlsx", "pdf"];
export const MAX_COMMUNITY_ATTACHMENT_BYTES = 10 * 1024 * 1024;

// Returns "image", "document", or null (rejected) for a file picked for a
// community chat attachment.
export const classifyCommunityAttachment = file => {
  if (!file) return null;
  if (file.type.startsWith("image/")) return "image";
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (COMMUNITY_DOC_MIME_TO_EXT[file.type] || COMMUNITY_DOC_EXTS.includes(ext)) return "document";
  return null;
};

// Uploads a community chat attachment (an image Blob or a Word/Excel File)
// to assets/community/ and returns its public URL. Every upload gets a
// unique name — attachments accumulate rather than replacing each other.
export const uploadCommunityAttachment = async (file, ownerId, kind) => {
  if (!file) return null;
  const ext = kind === "image" ? "jpg" : (COMMUNITY_DOC_MIME_TO_EXT[file.type] || file.name.split(".").pop().toLowerCase());
  const contentType = kind === "image" ? "image/jpeg" : (file.type || "application/octet-stream");
  const path = `assets/community/${ownerId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("public").upload(path, file, { contentType });
  if (error) { console.error("Failed to upload community attachment:", error.message); return null; }
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

// Set right after a new account is created so the app knows to show the
// mandatory compliance screen the first time that account's session loads —
// even if email confirmation delays it to a later visit.
const NEW_SIGNUP_KEY = "bonda_pending_compliance";
export const markNewSignup = () => { try { localStorage.setItem(NEW_SIGNUP_KEY, "1"); } catch {} };
export const consumeNewSignupFlag = () => {
  try {
    if (localStorage.getItem(NEW_SIGNUP_KEY) !== "1") return false;
    localStorage.removeItem(NEW_SIGNUP_KEY);
    return true;
  } catch { return false; }
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
