import React, { useState, useMemo, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useBackHandler } from "../hooks";

/**
 * Bonda — Contacts
 * The caregiver's own address book for the people around their child:
 * teacher, doctor, clinic and therapist.
 *
 * Layout keeps the old Support Directory look (see SupportDirectory.backup.jsx):
 *   • white header zone over a soft grey body
 *   • search field + category filter button (dropdown)
 *   • a results count
 *   • cards: name, one sub-line ("Doctor", or the school / clinic / centre), note inset, then
 *     tap-to-contact actions (tel / WhatsApp / mailto)
 *   • an add / edit bottom sheet
 *
 * Data lives in public.user_contacts (supabase/user_contacts.sql), one row per
 * contact, private to its owner via RLS.
 */

const CATEGORIES = [
  { id: "school",    label: "Teacher",        orgLabel: "School name",        namePh: "e.g. Ms Tan (form teacher)", orgPh: "e.g. Rainbow Centre" },
  { id: "doctor",    label: "Doctor",         orgLabel: "Clinic / hospital",  namePh: "e.g. Dr Lim",               orgPh: "e.g. KKH Child Development Unit" },
  { id: "clinic",    label: "Clinic",         orgLabel: "Clinic name",        namePh: "e.g. Nurse Aisha (front desk)", orgPh: "e.g. KKH Child Development Unit" },
  { id: "therapist", label: "Therapist",      orgLabel: "Centre / practice",  namePh: "e.g. Sarah (speech therapist)", orgPh: "e.g. Thye Hua Kwan EIPIC" },
];
const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

const EMPTY = { category: "school", name: "", organisation: "", cc: "65", phone: "", email: "", address: "", note: "" };

// Phones are stored as "+<country code> <number>" because wa.me needs the
// country code. Older rows were saved without one — those are Singapore numbers.
const COUNTRIES = [
  { cc: "65",  label: "SG" }, { cc: "60",  label: "MY" }, { cc: "62",  label: "ID" },
  { cc: "63",  label: "PH" }, { cc: "66",  label: "TH" }, { cc: "84",  label: "VN" },
  { cc: "91",  label: "IN" }, { cc: "86",  label: "CN" }, { cc: "852", label: "HK" },
  { cc: "61",  label: "AU" }, { cc: "44",  label: "UK" }, { cc: "1",   label: "US" },
];
const DEFAULT_CC = "65";

// "+62 812 3456" → { cc: "62", local: "812 3456" }; "9123 4567" → { cc: "65", local: "9123 4567" }
const splitPhone = (phone) => {
  const p = (phone || "").trim();
  if (!p.startsWith("+")) return { cc: DEFAULT_CC, local: p };
  const digits = p.slice(1).replace(/\D/g, "");
  const match = COUNTRIES.map((c) => c.cc).sort((a, b) => b.length - a.length).find((cc) => digits.startsWith(cc));
  if (!match) return { cc: DEFAULT_CC, local: p };
  // drop the country code digits from the front, keeping the user's spacing after it
  const rest = p.slice(1);
  let i = 0, seen = 0;
  while (seen < match.length && i < rest.length) { if (/\d/.test(rest[i])) seen++; i++; }
  return { cc: match, local: rest.slice(i).replace(/^[\s-]+/, "") };
};
// Local numbers are often typed with a trunk "0" (e.g. 0812…) that is dropped after the country code.
const joinPhone = (cc, local) => {
  const l = local.trim().replace(/^0+/, "");
  return l ? `+${cc} ${l}` : "";
};
const fullPhone = (phone) => { const { cc, local } = splitPhone(phone); return joinPhone(cc, local); };

// Default contacts from each child's "Clinic & doctor" profile section
// (child.clinics, see hooks.js). A clinic shared by several children shows once.
// source_key ties a saved user_contacts row (an edit, or hidden = deleted) to its default.
const profileClinics = (children) => {
  const byKey = new Map();
  (children || []).forEach((child) => {
    (child.clinics || []).forEach((c) => {
      const clinic = (c.name || "").trim(), doctor = (c.doctor || "").trim();
      if (!clinic && !doctor) return;
      const key = "clinic:" + clinic.toLowerCase() + "|" + doctor.toLowerCase();
      const seen = byKey.get(key);
      if (seen) { if (!seen.children.includes(child.name)) seen.children.push(child.name); return; }
      const address = (c.address || "").trim();
      byKey.set(key, {
        source_key: key, children: [child.name],
        category: doctor ? "doctor" : "clinic", name: doctor || clinic, organisation: doctor ? clinic : "",
        phone: (c.phone || "").trim(), email: (c.email || "").trim(), address, note: address,
      });
    });
  });
  return [...byKey.values()];
};

const telHref =(phone) => "tel:" + phone.replace(/[^\d+*#]/g, "");
const waHref = (phone) => "https://wa.me/" + fullPhone(phone).replace(/\D/g, "");

/* ---------- icons ---------- */
const I = {
  search: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  phone: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>,
  whatsapp: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>,
  mail: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>,
  plus: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  filter: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M3 6h2.8M10.2 6H21M3 12h10.8M18.2 12H21M3 18h5.8M13.2 18H21"/><circle cx="8" cy="6" r="2.2"/><circle cx="16" cy="12" r="2.2"/><circle cx="11" cy="18" r="2.2"/></svg>,
  check: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>,
};

const FILTERS = [{ id: "all", label: "All" }, ...CATEGORIES];

/* ---------- filter button + menu ---------- */
function FilterMenu({ active, counts, onPick }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const away = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div className="bd-filter" ref={ref}>
      <button className={"bd-filter__btn" + (active !== "all" ? " is-on" : "")} onClick={() => setOpen((o) => !o)}
        aria-label="Filter by category" aria-haspopup="menu" aria-expanded={open}>
        {I.filter}
        {active !== "all" && <span className="bd-filter__dot" />}
      </button>
      {open && (
        <div className="bd-filter__menu" role="menu">
          {FILTERS.map((c) => (
            <button key={c.id} role="menuitemradio" aria-checked={active === c.id}
              className={"bd-filter__item" + (active === c.id ? " is-on" : "")}
              onClick={() => { onPick(c.id); setOpen(false); }}>
              <span className="bd-filter__check">{active === c.id && I.check}</span>
              <span className="bd-filter__lbl">{c.short || c.label}</span>
              <span className="bd-chip__n">{counts[c.id]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- action link ---------- */
function Action({ href, icon, label, variant, external }) {
  return (
    <a className={"bd-act" + (variant ? " is-" + variant : "")} href={href}
       target={external ? "_blank" : undefined}
       rel={external ? "noopener noreferrer" : undefined}
       aria-label={label} title={label}>
      <span className="bd-act__i">{icon}</span>
    </a>
  );
}

/* ---------- contact card ---------- */
function Card({ c, onEdit }) {
  const cat = CAT[c.category] || CATEGORIES[0];
  const sub = c.category === "doctor" || c.category === "school" ? cat.label : c.organisation;
  return (
    <article className="bd-card">
      <div className="bd-card__row">
        <h3 className="bd-card__name">
          <button className="bd-card__namebtn" onClick={() => onEdit(c)}>{c.name}</button>
        </h3>
      </div>
      {/* one line under the name: "Doctor" / "Teacher" for those; the clinic / centre name for everyone else */}
      {sub && <p className="bd-card__cat">{sub}</p>}
      {c.children && <p className="bd-card__src">From {c.children.join(" & ")}'s profile</p>}

      {c.note && (
        <div className="bd-inset">
          <p className="bd-inset__val">{c.note}</p>
        </div>
      )}

      {(c.phone || c.email) && (
        <div className="bd-actions">
          {c.phone && <Action href={telHref(fullPhone(c.phone))} icon={I.phone} label={"Call " + fullPhone(c.phone)} variant="primary" />}
          {c.phone && <Action href={waHref(c.phone)} icon={I.whatsapp} label="WhatsApp" variant="wa" external />}
          {c.email && <Action href={`mailto:${c.email}`} icon={I.mail} label={"Email " + c.email} />}
        </div>
      )}
    </article>
  );
}

/* ---------- add / edit sheet ---------- */
function Sheet({ initial, onClose, onSave, onDelete }) {
  // an existing contact: a saved row, or a default from a child profile
  const existing = !!(initial.id || initial.source_key);
  const [f, setF] = useState(() => {
    if (!existing) return initial;
    const { cc, local } = splitPhone(initial.phone);
    return { ...initial, cc, phone: local };
  });
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const cat = CAT[f.category];

  useBackHandler(true, onClose);

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim()) { setErr("Please enter a name."); return; }
    setSaving(true); setErr("");
    let error;
    try { error = await onSave(f); } catch (ex) { error = ex; }
    setSaving(false);
    if (error) {
      console.error("Saving contact failed:", error);
      // 23514 = check constraint violation: the database doesn't know this category yet
      setErr(error.code === "23514"
        ? "This category isn't available yet. Please try another category."
        : "Couldn't save. Please try again." + (error.message ? ` (${error.message})` : ""));
    }
  };

  return (
    <div className="bd-sheet-bg" onClick={onClose}>
      <form className="bd-sheet" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        {/* stays pinned while the fields below scroll */}
        <div className="bd-sheet__top">
          <div className="bd-sheet__grip" />
          <h2 className="bd-sheet__t">{existing ? "Edit contact" : "New contact"}</h2>
        </div>

        <label className="bd-lbl">Category
          <select className="bd-in bd-select" value={f.category} onChange={set("category")}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>

        <label className="bd-lbl">Name *
          <input className="bd-in" value={f.name} onChange={set("name")} placeholder={cat.namePh} />
        </label>
        <label className="bd-lbl">{cat.orgLabel}
          <input className="bd-in" value={f.organisation} onChange={set("organisation")} placeholder={cat.orgPh} />
        </label>
        <label className="bd-lbl">Phone
          <div className="bd-phone">
            <select className="bd-in bd-cc" value={f.cc} onChange={set("cc")} aria-label="Country code">
              {COUNTRIES.map((c) => <option key={c.cc} value={c.cc}>{c.label} +{c.cc}</option>)}
            </select>
            <input className="bd-in" type="tel" inputMode="tel" value={f.phone} onChange={set("phone")} placeholder="e.g. 9123 4567" />
          </div>
        </label>
        <label className="bd-lbl">Email
          <input className="bd-in" type="email" inputMode="email" autoCapitalize="off" value={f.email} onChange={set("email")} />
        </label>
        <label className="bd-lbl">Notes
          <textarea className="bd-in bd-in--ta" rows={3} value={f.note} onChange={set("note")} placeholder="Opening hours, appointment days, who to ask for…" />
        </label>

        {existing && (
          confirmDel ? (
            <div className="bd-del">
              <span>Delete this contact?</span>
              <button type="button" className="bd-del__no" onClick={() => setConfirmDel(false)}>No</button>
              <button type="button" className="bd-del__yes" onClick={() => onDelete(initial)}>Delete</button>
            </div>
          ) : (
            <button type="button" className="bd-del__link" onClick={() => setConfirmDel(true)}>Delete contact</button>
          )
        )}

        {/* stays pinned at the bottom while the fields above scroll */}
        <div className="bd-sheet__bottom">
          {err && <p className="bd-err">{err}</p>}
          <div className="bd-sheet__btns">
            <button type="button" className="bd-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="bd-btn is-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ---------- main ---------- */
export default function SupportDirectory({ account, kids }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("all");
  const [rows, setRows] = useState([]); // user_contacts rows, incl. edited / hidden profile defaults
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // contact being edited, or EMPTY-based draft

  useEffect(() => {
    supabase.from("user_contacts").select("*").order("name")
      .then(({ data }) => { setRows(data || []); setLoading(false); });
  }, []);

  // saved rows, plus the profile clinics the caregiver hasn't edited or deleted yet
  const contacts = useMemo(() => {
    const saved = new Set(rows.map((r) => r.source_key).filter(Boolean));
    return [...rows.filter((r) => !r.hidden), ...profileClinics(kids).filter((d) => !saved.has(d.source_key))]
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rows, kids]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      if (active !== "all" && c.category !== active) return false;
      if (!q) return true;
      return [c.name, c.organisation, c.phone, c.email, c.note]
        .some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [contacts, query, active]);

  const counts = useMemo(() => {
    const n = { all: contacts.length };
    CATEGORIES.forEach((c) => { n[c.id] = contacts.filter((x) => x.category === c.id).length; });
    return n;
  }, [contacts]);

  const save = async (f) => {
    const t = (v) => (v || "").trim();
    const row = {
      category: f.category, name: t(f.name), organisation: t(f.organisation),
      phone: joinPhone(f.cc, f.phone || ""), email: t(f.email), address: t(f.address), note: t(f.note),
    };
    const q = f.id
      ? supabase.from("user_contacts").update({ ...row, updated_at: new Date().toISOString() }).eq("id", f.id)
      : supabase.from("user_contacts").insert({ ...row, user_id: account.id, source_key: f.source_key || null });
    const { data, error } = await q.select().single();
    if (error) return error;
    setRows((list) => (f.id ? list.map((c) => (c.id === f.id ? data : c)) : [...list, data]));
    setEditing(null);
    return null;
  };

  // A profile default can't simply be deleted — it would come back from the
  // profile — so it's kept as a hidden row instead.
  const remove = async (c) => {
    let error;
    if (!c.source_key) {
      ({ error } = await supabase.from("user_contacts").delete().eq("id", c.id));
      if (!error) setRows((list) => list.filter((r) => r.id !== c.id));
    } else {
      const q = c.id
        ? supabase.from("user_contacts").update({ hidden: true, updated_at: new Date().toISOString() }).eq("id", c.id)
        : supabase.from("user_contacts").insert({
            user_id: account.id, source_key: c.source_key, hidden: true, category: c.category, name: c.name,
          });
      const { data, error: e } = await q.select().single();
      error = e;
      if (!error) setRows((list) => (c.id ? list.map((r) => (r.id === c.id ? data : r)) : [...list, data]));
    }
    if (error) console.error("Deleting contact failed:", error);
    setEditing(null);
  };

  const startNew = () => setEditing({ ...EMPTY, category: active === "all" ? "school" : active });

  return (
    <div className="bd-root">
      <style>{CSS}</style>

      {/* header (white zone) */}
      <header className="bd-head">
        <div className="bd-wrap">
          <p className="bd-sub">Your child's teachers, doctors, clinics and therapists in one place.</p>
        </div>
        <div className="bd-head__tools bd-wrap">
          <div className="bd-search">
            <span className="bd-search__i">{I.search}</span>
            <input className="bd-search__in" type="text" inputMode="search"
              placeholder="Search contacts…" value={query}
              onChange={(e) => setQuery(e.target.value)} aria-label="Search contacts" />
            {query && <button className="bd-search__x" onClick={() => setQuery("")} aria-label="Clear search">×</button>}
          </div>
          <FilterMenu active={active} counts={counts} onPick={setActive} />
          <button className="bd-addbtn" onClick={startNew}>
            <span className="bd-addbtn__i">{I.plus}</span>Add
          </button>
        </div>
      </header>

      {/* body (grey zone) */}
      <main className="bd-body">
        <div className="bd-wrap">
          {loading ? (
            <p className="bd-empty__b" style={{ padding: "20px 0" }}>Loading contacts…</p>
          ) : contacts.length === 0 ? (
            <div className="bd-empty">
              <p className="bd-empty__t">No contacts yet</p>
              <p className="bd-empty__b">Save your child's teachers, doctors, clinics and therapists so they're always one tap away.</p>
              <button className="bd-empty__reset" onClick={startNew}>Add first contact</button>
            </div>
          ) : (
            <>
              <div className="bd-countrow">
                <span className="bd-count">{results.length} {results.length === 1 ? "contact" : "contacts"}</span>
                {active !== "all" && (
                  <button className="bd-tag" onClick={() => setActive("all")} aria-label={"Clear filter " + (CAT[active].short || CAT[active].label)}>
                    {CAT[active].short || CAT[active].label}<span aria-hidden="true">×</span>
                  </button>
                )}
              </div>
              {results.length === 0 ? (
                <div className="bd-empty">
                  <p className="bd-empty__t">No matches</p>
                  <p className="bd-empty__b">Try another word, or show all categories.</p>
                  <button className="bd-empty__reset" onClick={() => { setQuery(""); setActive("all"); }}>Show all</button>
                </div>
              ) : (
                results.map((c) => <Card key={c.id || c.source_key} c={c} onEdit={setEditing} />)
              )}
            </>
          )}

          <div className="bd-foot">
            <p className="bd-foot__em">
              In an emergency, call <a href="tel:995">995</a> for an ambulance or <a href="tel:999">999</a> for the police.
            </p>
          </div>
        </div>
      </main>

      {editing && <Sheet initial={editing} onClose={() => setEditing(null)} onSave={save} onDelete={remove} />}
    </div>
  );
}

/* ---------- styles ---------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400;7..72,500;7..72,600;7..72,700&display=swap');

.bd-root{
  --ink:#1E2320; --ink-2:#6B7069; --ink-3:#9A9E99;
  --canvas:#F3F2EF; --surface:#FFFFFF; --line:#EBE9E3; --fill:#F5F4F1;
  --teal:#2E7B6A; --teal-ink:#266657; --red:#A4474A;
  font-family:'Literata',Georgia,serif;
  background:var(--canvas); color:var(--ink); min-height:100%;
  -webkit-font-smoothing:antialiased; -webkit-tap-highlight-color:transparent; line-height:1.5;
}
.bd-root *{box-sizing:border-box;}
.bd-wrap{max-width:560px; margin:0 auto; padding-left:18px; padding-right:18px;}

/* header */
.bd-head{
  position:sticky; top:0; z-index:30; background:var(--surface);
  border-bottom:1px solid var(--line); padding-top:env(safe-area-inset-top);
}
.bd-head > .bd-wrap:first-child{padding-top:18px; padding-bottom:2px;}
.bd-sub{margin:0; font-size:13.5px; color:var(--ink-2);}
.bd-head__tools{display:flex; gap:10px; padding-top:14px; padding-bottom:12px;}

.bd-search{
  flex:1; min-width:0; display:flex; align-items:center; gap:9px; height:46px;
  background:var(--fill); border:1px solid var(--line); border-radius:12px; padding:0 12px;
  transition:border-color .15s, box-shadow .15s;
}
.bd-search:focus-within{border-color:var(--teal); box-shadow:0 0 0 3px rgba(46,123,106,.12);}
.bd-search__i{color:var(--ink-3); display:flex; flex:none;}
.bd-search__in{flex:1; min-width:0; border:0; outline:0; background:transparent; font:inherit; font-size:15px; color:var(--ink);}
.bd-search__in::placeholder{color:var(--ink-3);}
.bd-search__x{border:0; background:transparent; color:var(--ink-3); font-size:22px; line-height:1; cursor:pointer; min-width:28px; min-height:28px;}

.bd-addbtn{
  flex:none; display:inline-flex; align-items:center; gap:6px; height:46px; padding:0 16px;
  background:var(--teal); border:0; border-radius:12px;
  font:inherit; font-size:14px; font-weight:600; color:#FBFAF7; cursor:pointer;
}
.bd-addbtn__i{display:flex;}

/* category filter — icon button with a dropdown menu */
.bd-filter{position:relative; flex:none;}
.bd-filter__btn{
  position:relative; display:flex; align-items:center; justify-content:center; width:46px; height:46px;
  background:var(--fill); border:1px solid var(--line); border-radius:12px; color:var(--ink-2); cursor:pointer;
  transition:border-color .15s, color .15s, background .15s;
}
.bd-filter__btn.is-on{border-color:var(--teal); color:var(--teal-ink); background:rgba(46,123,106,.06);}
.bd-filter__dot{position:absolute; top:9px; right:9px; width:8px; height:8px; border-radius:50%; background:var(--teal); box-shadow:0 0 0 2px var(--surface);}
.bd-filter__menu{
  position:absolute; top:calc(100% + 6px); right:0; z-index:40; min-width:190px; padding:6px;
  background:var(--surface); border:1px solid var(--line); border-radius:14px;
  box-shadow:0 10px 28px rgba(30,35,32,.12); animation:bd-fade .12s ease;
}
.bd-filter__item{
  width:100%; display:flex; align-items:center; gap:8px; min-height:44px; padding:0 10px;
  border:0; border-radius:10px; background:transparent; font:inherit; font-size:14px; font-weight:500;
  color:var(--ink); text-align:left; cursor:pointer;
}
.bd-filter__item:active{background:var(--fill);}
.bd-filter__item.is-on{color:var(--teal-ink); font-weight:600;}
.bd-filter__check{width:16px; display:flex; color:var(--teal); flex:none;}
.bd-filter__lbl{flex:1;}
.bd-chip__n{
  min-width:18px; height:18px; padding:0 5px; border-radius:999px; background:var(--fill);
  display:inline-flex; align-items:center; justify-content:center;
  font-size:11px; font-weight:600; color:var(--ink-3);
}
.bd-filter__item.is-on .bd-chip__n{background:var(--teal); color:#FBFAF7;}
.bd-tag{
  display:inline-flex; align-items:center; gap:6px; height:30px; padding:0 10px 0 12px;
  border:1px solid var(--teal); border-radius:999px; background:rgba(46,123,106,.06);
  font:inherit; font-size:12.5px; font-weight:600; color:var(--teal-ink); cursor:pointer;
}
.bd-tag span{font-size:16px; line-height:1;}

/* body */
.bd-body{padding-top:18px; padding-bottom:calc(30px + env(safe-area-inset-bottom));}

/* count row */
.bd-countrow{display:flex; align-items:center; justify-content:space-between; gap:10px; margin:2px 0 14px;}
.bd-count{font-size:15px; font-weight:500; color:var(--ink-2);}

/* card */
.bd-card{background:var(--surface); border:1px solid var(--line); border-radius:16px; padding:16px; margin-bottom:12px;}
.bd-card__row{display:flex; align-items:flex-start; justify-content:space-between; gap:10px;}

.bd-card__name{margin:0; min-width:0; font-size:16px; font-weight:600; letter-spacing:-0.01em; line-height:1.28;}
.bd-card__namebtn{padding:0; border:0; background:transparent; font:inherit; color:inherit; text-align:left; cursor:pointer;}
.bd-card__cat{margin:2px 0 0; font-size:12.5px; font-weight:600; color:var(--teal-ink);}
.bd-card__src{margin:2px 0 0; font-size:12px; color:var(--ink-3);}
.bd-inset{margin-top:13px; background:var(--fill); border-radius:12px; padding:12px 13px; display:flex; flex-direction:column; gap:8px;}
.bd-inset__val{margin:0; font-size:13.5px; color:var(--ink-2); line-height:1.45; white-space:pre-wrap;}

.bd-actions{display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; padding-top:14px; border-top:1px solid var(--line);}
.bd-act{display:inline-flex; align-items:center; justify-content:center; width:48px; height:44px; border-radius:11px; border:1px solid var(--line); background:var(--surface); color:var(--ink); text-decoration:none; transition:background .15s, border-color .15s;}
.bd-act .bd-act__i svg{width:20px; height:20px;}
.bd-act:active{background:var(--fill);}
.bd-act__i{color:var(--ink-3); display:flex; flex:none;}
.bd-act.is-primary{border-color:rgba(46,123,106,.45); color:var(--teal-ink); font-weight:600;}
.bd-act.is-primary .bd-act__i{color:var(--teal);}
.bd-act.is-primary:active{background:rgba(46,123,106,.07);}
.bd-act.is-wa .bd-act__i{color:#25D366;}
.bd-act.is-wa:active{background:rgba(37,211,102,.08);}

/* empty */
.bd-empty{text-align:center; padding:48px 20px; background:var(--surface); border:1px solid var(--line); border-radius:16px;}
.bd-empty__t{margin:0; font-size:16px; font-weight:600;}
.bd-empty__b{margin:6px 0 16px; font-size:13.5px; color:var(--ink-2);}
.bd-empty__reset{font:inherit; font-size:13.5px; font-weight:600; color:#FBFAF7; background:var(--teal); border:0; border-radius:10px; padding:11px 18px; min-height:44px; cursor:pointer;}

/* footer */
.bd-foot{margin-top:20px; padding-top:18px; border-top:1px solid var(--line);}
.bd-foot__em{margin:0; font-size:13px;}
.bd-foot__em a{color:var(--teal-ink); font-weight:600; text-decoration:none;}

/* sheet */
.bd-sheet-bg{position:fixed; inset:0; z-index:300; background:rgba(30,35,32,.4); display:flex; align-items:flex-end; justify-content:center; animation:bd-fade .15s ease;}
@keyframes bd-fade{from{opacity:0;} to{opacity:1;}}
.bd-sheet{
  width:100%; max-width:480px; max-height:92vh; overflow-y:auto; -webkit-overflow-scrolling:touch;
  background:var(--surface); border-radius:20px 20px 0 0; padding:0 18px;
  display:flex; flex-direction:column; gap:12px; animation:bd-up .2s ease;
}
@keyframes bd-up{from{transform:translateY(24px);} to{transform:none;}}
.bd-sheet__top{
  position:sticky; top:0; z-index:2; background:var(--surface);
  margin:0 -18px; padding:10px 18px 12px; border-bottom:1px solid var(--line);
  display:flex; flex-direction:column; gap:12px;
}
.bd-sheet__grip{width:38px; height:4px; border-radius:99px; background:#DCDAD3; margin:0 auto 4px;}
.bd-sheet__t{margin:0 0 2px; font-size:18px; font-weight:700; letter-spacing:-0.01em;}
.bd-lbl{display:flex; flex-direction:column; gap:6px; font-size:12px; font-weight:600; color:var(--ink-2);}
.bd-in{
  width:100%; min-height:44px; padding:10px 12px; border:1px solid var(--line); border-radius:11px;
  background:var(--fill); font:inherit; font-size:15px; font-weight:400; color:var(--ink); outline:0;
}
.bd-in:focus{border-color:var(--teal); box-shadow:0 0 0 3px rgba(46,123,106,.12);}
.bd-in--ta{resize:vertical; line-height:1.45;}
.bd-phone{display:flex; gap:8px;}
.bd-cc{flex:none; width:auto; padding-right:8px;}
.bd-select{
  appearance:none; -webkit-appearance:none; padding-right:38px; cursor:pointer;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239A9E99' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat:no-repeat; background-position:right 12px center; background-size:18px;
}
.bd-err{margin:0; font-size:13px; color:var(--red);}
.bd-sheet__bottom{
  position:sticky; bottom:0; z-index:2; background:var(--surface);
  margin:0 -18px; padding:12px 18px calc(14px + env(safe-area-inset-bottom)); border-top:1px solid var(--line);
  display:flex; flex-direction:column; gap:10px;
}
.bd-sheet__btns{display:flex; gap:10px;}
.bd-btn{flex:1; min-height:46px; border:1px solid var(--line); border-radius:12px; background:var(--surface); font:inherit; font-size:14.5px; font-weight:600; color:var(--ink); cursor:pointer;}
.bd-btn.is-primary{background:var(--teal); border-color:var(--teal); color:#FBFAF7;}
.bd-btn:disabled{opacity:.6;}
.bd-del__link{align-self:center; border:0; background:transparent; font:inherit; font-size:13.5px; font-weight:600; color:var(--red); padding:8px; cursor:pointer;}
.bd-del{display:flex; align-items:center; gap:8px; font-size:13.5px; color:var(--ink-2);}
.bd-del span{flex:1;}
.bd-del__no,.bd-del__yes{min-height:38px; padding:0 14px; border-radius:10px; font:inherit; font-size:13.5px; font-weight:600; cursor:pointer;}
.bd-del__no{border:1px solid var(--line); background:var(--surface); color:var(--ink);}
.bd-del__yes{border:0; background:var(--red); color:#fff;}

@media (prefers-reduced-motion:reduce){ .bd-root *{transition:none !important; animation:none !important;} }
`;
