import React, { useState, useMemo, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useBackHandler } from "../hooks";

/**
 * Bonda — Contacts
 * The caregiver's own address book for the people around their child:
 * school, doctor / clinic and therapist.
 *
 * Layout keeps the old Support Directory look (see SupportDirectory.backup.jsx):
 *   • white header zone over a soft grey body
 *   • search field + category chips
 *   • a results count
 *   • cards: category pill, name, organisation, address / note inset, then
 *     tap-to-contact actions (tel / WhatsApp / mailto)
 *   • an add / edit bottom sheet
 *
 * Data lives in public.user_contacts (supabase/user_contacts.sql), one row per
 * contact, private to its owner via RLS.
 */

/* ---------- muted category tones (no yellow) ---------- */
const TONES = {
  teal:   { bg: "#E4F0EC", fg: "#2E7B6A", dot: "#2E7B6A" },
  blue:   { bg: "#E6ECF3", fg: "#3C6088", dot: "#4A79A6" },
  violet: { bg: "#ECE8F3", fg: "#63578A", dot: "#7E6FAC" },
};

const CATEGORIES = [
  { id: "school",    label: "School",         orgLabel: "School name",        namePh: "e.g. Ms Tan (form teacher)", orgPh: "e.g. Rainbow Centre", tone: "blue" },
  { id: "doctor",    label: "Doctor / Clinic", orgLabel: "Clinic / hospital", namePh: "e.g. Dr Lim",               orgPh: "e.g. KKH Child Development Unit", tone: "teal" },
  { id: "therapist", label: "Therapist",      orgLabel: "Centre / practice",  namePh: "e.g. Sarah (speech therapist)", orgPh: "e.g. Thye Hua Kwan EIPIC", tone: "violet" },
];
const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

const EMPTY = { category: "school", name: "", organisation: "", phone: "", email: "", address: "", note: "" };

// Singapore numbers are usually typed as 8 digits; wa.me needs the country code.
const telHref = (phone) => "tel:" + phone.replace(/[^\d+]/g, "");
const waHref = (phone) => {
  let d = phone.replace(/\D/g, "");
  if (d.length === 8) d = "65" + d;
  return "https://wa.me/" + d;
};

/* ---------- icons ---------- */
const I = {
  search: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  phone: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>,
  chat: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20l1.1-4.1A8.4 8.4 0 0 1 3 11.5a8.4 8.4 0 0 1 9-8.4 8.4 8.4 0 0 1 9 8.4Z"/></svg>,
  mail: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>,
  pin: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>,
  edit: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg>,
  plus: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
};

/* ---------- action link ---------- */
function Action({ href, icon, label, primary, external }) {
  return (
    <a className={"bd-act" + (primary ? " is-primary" : "")} href={href}
       target={external ? "_blank" : undefined}
       rel={external ? "noopener noreferrer" : undefined}>
      <span className="bd-act__i">{icon}</span><span>{label}</span>
    </a>
  );
}

/* ---------- contact card ---------- */
function Card({ c, onEdit }) {
  const cat = CAT[c.category] || CATEGORIES[0];
  const t = TONES[cat.tone];
  return (
    <article className="bd-card">
      <div className="bd-card__row">
        <span className="bd-pill" style={{ background: t.bg, color: t.fg }}>
          <span className="bd-pill__dot" style={{ background: t.dot }} />
          {cat.label}
        </span>
        <button className="bd-edit" onClick={() => onEdit(c)} aria-label={"Edit " + c.name}>{I.edit}</button>
      </div>

      <h3 className="bd-card__name">{c.name}</h3>
      {c.organisation && <p className="bd-card__org">{c.organisation}</p>}

      {(c.address || c.note) && (
        <div className="bd-inset">
          {c.address && (
            <a className="bd-inset__addr" href={"https://maps.google.com/?q=" + encodeURIComponent(c.address)} target="_blank" rel="noopener noreferrer">
              <span className="bd-act__i">{I.pin}</span>{c.address}
            </a>
          )}
          {c.note && <p className="bd-inset__val">{c.note}</p>}
        </div>
      )}

      {(c.phone || c.email) && (
        <div className="bd-actions">
          {c.phone && <Action href={telHref(c.phone)} icon={I.phone} label={c.phone} primary />}
          {c.phone && <Action href={waHref(c.phone)} icon={I.chat} label="WhatsApp" external />}
          {c.email && <Action href={`mailto:${c.email}`} icon={I.mail} label="Email" />}
        </div>
      )}
    </article>
  );
}

/* ---------- add / edit sheet ---------- */
function Sheet({ initial, onClose, onSave, onDelete }) {
  const [f, setF] = useState(initial);
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
    const error = await onSave(f);
    setSaving(false);
    if (error) setErr("Couldn't save. Please try again.");
  };

  return (
    <div className="bd-sheet-bg" onClick={onClose}>
      <form className="bd-sheet" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        {/* stays pinned while the fields below scroll */}
        <div className="bd-sheet__top">
          <div className="bd-sheet__grip" />
          <h2 className="bd-sheet__t">{initial.id ? "Edit contact" : "New contact"}</h2>
        </div>

        <span className="bd-lbl">Category</span>
        <div className="bd-seg">
          {CATEGORIES.map((c) => (
            <button type="button" key={c.id} className={"bd-seg__b" + (f.category === c.id ? " is-on" : "")}
              onClick={() => setF((p) => ({ ...p, category: c.id }))}>{c.label}</button>
          ))}
        </div>

        <label className="bd-lbl">Name *
          <input className="bd-in" value={f.name} onChange={set("name")} placeholder={cat.namePh} />
        </label>
        <label className="bd-lbl">{cat.orgLabel}
          <input className="bd-in" value={f.organisation} onChange={set("organisation")} placeholder={cat.orgPh} />
        </label>
        <label className="bd-lbl">Phone
          <input className="bd-in" type="tel" inputMode="tel" value={f.phone} onChange={set("phone")} placeholder="e.g. 9123 4567" />
        </label>
        <label className="bd-lbl">Email
          <input className="bd-in" type="email" inputMode="email" autoCapitalize="off" value={f.email} onChange={set("email")} />
        </label>
        <label className="bd-lbl">Address
          <input className="bd-in" value={f.address} onChange={set("address")} />
        </label>
        <label className="bd-lbl">Notes
          <textarea className="bd-in bd-in--ta" rows={3} value={f.note} onChange={set("note")} placeholder="Opening hours, appointment days, who to ask for…" />
        </label>

        {initial.id && (
          confirmDel ? (
            <div className="bd-del">
              <span>Delete this contact?</span>
              <button type="button" className="bd-del__no" onClick={() => setConfirmDel(false)}>No</button>
              <button type="button" className="bd-del__yes" onClick={() => onDelete(initial.id)}>Delete</button>
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
export default function SupportDirectory({ account }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("all");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // contact being edited, or EMPTY-based draft

  useEffect(() => {
    supabase.from("user_contacts").select("*").order("name")
      .then(({ data }) => { setContacts(data || []); setLoading(false); });
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      if (active !== "all" && c.category !== active) return false;
      if (!q) return true;
      return [c.name, c.organisation, c.phone, c.email, c.address, c.note]
        .some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [contacts, query, active]);

  const counts = useMemo(() => {
    const n = { all: contacts.length };
    CATEGORIES.forEach((c) => { n[c.id] = contacts.filter((x) => x.category === c.id).length; });
    return n;
  }, [contacts]);

  const save = async (f) => {
    const row = {
      category: f.category, name: f.name.trim(), organisation: f.organisation.trim(),
      phone: f.phone.trim(), email: f.email.trim(), address: f.address.trim(), note: f.note.trim(),
    };
    const q = f.id
      ? supabase.from("user_contacts").update({ ...row, updated_at: new Date().toISOString() }).eq("id", f.id)
      : supabase.from("user_contacts").insert({ ...row, user_id: account.id });
    const { data, error } = await q.select().single();
    if (error) return error;
    setContacts((list) => {
      const next = f.id ? list.map((c) => (c.id === f.id ? data : c)) : [...list, data];
      return next.sort((a, b) => a.name.localeCompare(b.name));
    });
    setEditing(null);
    return null;
  };

  const remove = async (id) => {
    const { error } = await supabase.from("user_contacts").delete().eq("id", id);
    if (!error) setContacts((list) => list.filter((c) => c.id !== id));
    setEditing(null);
  };

  const startNew = () => setEditing({ ...EMPTY, category: active === "all" ? "school" : active });

  return (
    <div className="bd-root">
      <style>{CSS}</style>

      {/* header (white zone) */}
      <header className="bd-head">
        <div className="bd-wrap">
          <p className="bd-sub">Your child's school, doctors and therapists in one place.</p>
        </div>
        <div className="bd-head__tools bd-wrap">
          <div className="bd-search">
            <span className="bd-search__i">{I.search}</span>
            <input className="bd-search__in" type="text" inputMode="search"
              placeholder="Search contacts…" value={query}
              onChange={(e) => setQuery(e.target.value)} aria-label="Search contacts" />
            {query && <button className="bd-search__x" onClick={() => setQuery("")} aria-label="Clear search">×</button>}
          </div>
          <button className="bd-addbtn" onClick={startNew}>
            <span className="bd-addbtn__i">{I.plus}</span>Add
          </button>
        </div>
        <div className="bd-chips bd-wrap" role="group" aria-label="Filter by category">
          <button className={"bd-chip" + (active === "all" ? " is-on" : "")} onClick={() => setActive("all")}>
            All <span className="bd-chip__n">{counts.all}</span>
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.id} className={"bd-chip" + (active === c.id ? " is-on" : "")} onClick={() => setActive(c.id)}>
              <span className="bd-opt__dot" style={{ background: TONES[c.tone].dot }} />
              {c.label} <span className="bd-chip__n">{counts[c.id]}</span>
            </button>
          ))}
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
              <p className="bd-empty__b">Save your child's school, doctor or clinic, and therapists so they're always one tap away.</p>
              <button className="bd-empty__reset" onClick={startNew}>Add first contact</button>
            </div>
          ) : (
            <>
              <div className="bd-countrow">
                <span className="bd-count">{results.length} {results.length === 1 ? "contact" : "contacts"}</span>
              </div>
              {results.length === 0 ? (
                <div className="bd-empty">
                  <p className="bd-empty__t">No matches</p>
                  <p className="bd-empty__b">Try another word, or show all categories.</p>
                  <button className="bd-empty__reset" onClick={() => { setQuery(""); setActive("all"); }}>Show all</button>
                </div>
              ) : (
                results.map((c) => <Card key={c.id} c={c} onEdit={setEditing} />)
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
  flex:1; display:flex; align-items:center; gap:9px; height:46px;
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

/* category chips */
.bd-chips{display:flex; gap:8px; overflow-x:auto; scrollbar-width:none; padding-bottom:14px;}
.bd-chips::-webkit-scrollbar{display:none;}
.bd-chip{
  flex:none; display:inline-flex; align-items:center; gap:7px; height:38px; padding:0 13px;
  background:var(--surface); border:1px solid var(--line); border-radius:999px;
  font:inherit; font-size:13px; font-weight:500; color:var(--ink-2); cursor:pointer; white-space:nowrap;
  transition:border-color .15s, color .15s, background .15s;
}
.bd-chip.is-on{border-color:var(--teal); color:var(--teal-ink); font-weight:600; background:rgba(46,123,106,.05);}
.bd-chip__n{font-size:11.5px; color:var(--ink-3); font-weight:600;}
.bd-opt__dot{width:8px; height:8px; border-radius:50%; flex:none;}

/* body */
.bd-body{padding-top:18px; padding-bottom:calc(30px + env(safe-area-inset-bottom));}

/* count row */
.bd-countrow{display:flex; align-items:center; justify-content:space-between; gap:10px; margin:2px 0 14px;}
.bd-count{font-size:15px; font-weight:500; color:var(--ink-2);}

/* card */
.bd-card{background:var(--surface); border:1px solid var(--line); border-radius:16px; padding:16px; margin-bottom:12px;}
.bd-card__row{display:flex; align-items:center; justify-content:space-between; gap:10px;}
.bd-pill{display:inline-flex; align-items:center; gap:6px; padding:5px 11px 5px 9px; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:0.045em; text-transform:uppercase;}
.bd-pill__dot{width:7px; height:7px; border-radius:50%; flex:none;}
.bd-edit{display:flex; align-items:center; justify-content:center; width:36px; height:36px; margin:-6px -6px -6px 0; border:0; border-radius:10px; background:transparent; color:var(--ink-3); cursor:pointer;}
.bd-edit:active{background:var(--fill);}

.bd-card__name{margin:13px 0 0; font-size:16px; font-weight:600; letter-spacing:-0.01em; line-height:1.28;}
.bd-card__org{margin:3px 0 0; font-size:14px; color:var(--ink-2);}

.bd-inset{margin-top:13px; background:var(--fill); border-radius:12px; padding:12px 13px; display:flex; flex-direction:column; gap:8px;}
.bd-inset__addr{display:flex; gap:7px; font-size:13.5px; color:var(--ink); text-decoration:none; line-height:1.45;}
.bd-inset__addr .bd-act__i{margin-top:2px;}
.bd-inset__val{margin:0; font-size:13.5px; color:var(--ink-2); line-height:1.45; white-space:pre-wrap;}

.bd-actions{display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; padding-top:14px; border-top:1px solid var(--line);}
.bd-act{display:inline-flex; align-items:center; gap:7px; min-height:44px; padding:0 14px; border-radius:11px; border:1px solid var(--line); background:var(--surface); color:var(--ink); font-size:13.5px; font-weight:500; text-decoration:none; transition:background .15s, border-color .15s;}
.bd-act:active{background:var(--fill);}
.bd-act__i{color:var(--ink-3); display:flex; flex:none;}
.bd-act.is-primary{border-color:rgba(46,123,106,.45); color:var(--teal-ink); font-weight:600;}
.bd-act.is-primary .bd-act__i{color:var(--teal);}
.bd-act.is-primary:active{background:rgba(46,123,106,.07);}

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
.bd-seg{display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-top:-6px;}
.bd-seg__b{min-height:42px; padding:0 6px; border:1px solid var(--line); border-radius:10px; background:var(--surface); font:inherit; font-size:12.5px; font-weight:500; color:var(--ink-2); cursor:pointer;}
.bd-seg__b.is-on{border-color:var(--teal); color:var(--teal-ink); font-weight:600; background:rgba(46,123,106,.06);}
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
