import React, { useState, useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  Bonda — Add a Child Profile                                        */
/*  Categorised cards · toggles · multi-select · cascading provider    */
/*  Design tokens from the Bonda "Colours & type" reference.           */
/* ------------------------------------------------------------------ */

/* Starter provider lists — clinics, psychologists & psychiatrists.
   Selecting a country filters this list to that country only.
   Expand / verify these anytime. */
const PROVIDERS = {
  Singapore: [
    "KK Women's & Children's Hospital — Dept of Child Development",
    "National University Hospital — Child Development Unit",
    "Institute of Mental Health — Child Guidance Clinic",
    "Autism Resource Centre (ARC) Singapore",
    "Rainbow Centre Singapore",
    "Thomson Paediatric Centre",
    "SBCC Baby & Child Clinic",
    "Promises Healthcare (psychiatry & psychology)",
    "Annabelle Psychology",
    "Th!nk Psychological Services",
  ],
  Malaysia: [
    "Hospital Kuala Lumpur — Paediatric Institute",
    "University Malaya Medical Centre (PPUM)",
    "Hospital Tunku Azizah",
    "National Autism Society of Malaysia (NASOM)",
    "Sunway Medical Centre",
    "Gleneagles Hospital Kuala Lumpur",
    "KPJ Damansara Specialist Hospital",
    "Thrive Wellbeing Centre (psychology)",
    "Mindakami (child psychology)",
  ],
};

const DIAGNOSIS_OPTIONS = [
  "Autism Spectrum Disorder (ASD)",
  "ADHD",
  "Sensory Processing Disorder",
  "Global Developmental Delay",
  "Speech & Language Delay",
  "Intellectual Disability",
  "Dyslexia",
  "Dyspraxia (DCD)",
  "Dyscalculia",
  "Anxiety",
  "OCD",
  "Tourette / Tic Disorder",
  "Down Syndrome",
  "Epilepsy",
  "Not yet diagnosed / In assessment",
  "Other",
];

const TRIGGER_OPTIONS = [
  "Loud or sudden noises",
  "Bright or flickering lights",
  "Crowded / busy places",
  "Changes in routine",
  "Transitions between activities",
  "Certain textures",
  "Strong smells",
  "Unexpected touch",
  "Hunger or tiredness",
  "Screen time ending",
  "Waiting / delays",
  "Other",
];

const DIET_OPTIONS = [
  "Gluten-free",
  "Casein / dairy-free",
  "GFCF (gluten & casein-free)",
  "Low-sugar",
  "Feingold diet",
  "Specific Carbohydrate Diet",
  "Ketogenic",
  "Elimination diet",
  "Halal",
  "Vegetarian",
  "Other",
];

const ALLERGY_OPTIONS = [
  "Nuts",
  "Dairy",
  "Eggs",
  "Seafood / Shellfish",
  "Gluten / Wheat",
  "Soy",
  "Pollen / Dust",
  "Other",
];

const THERAPY_TYPES = [
  "Occupational Therapy",
  "Speech & Language Therapy",
  "ABA Therapy",
  "Physiotherapy",
  "Behavioural Therapy",
  "Psychology / Counselling",
  "Music Therapy",
  "Early Intervention (EIPIC)",
  "Other",
];

const RELATIONSHIP_OPTIONS = [
  "Biological or Adoptive Parent",
  "Foster Carer",
  "Extended Family",
  "Professional Caregiver",
  "Other",
];

const T = {
  canvas: "#F4F1EB",
  card: "#FFFFFF",
  ink: "#23201C",
  accent: "#3E6E6A",
  accentPress: "#345F5B",
  ink70: "rgba(35,32,28,.70)",
  ink55: "rgba(35,32,28,.55)",
  ink40: "rgba(35,32,28,.40)",
  line: "rgba(35,32,28,.12)",
  lineStrong: "rgba(35,32,28,.20)",
  focus: "rgba(62,110,106,.16)",
  tintBg: "#E6EDEC",
  required: "#9B5A5A",
  title: '"Fraunces", Georgia, serif',
  body: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
};

export default function AddChildProfile() {
  const [form, setForm] = useState({
    photo: null,
    name: "",
    dob: "",
    gender: "",
    relationship: "Biological or Adoptive Parent",
    relationshipOther: "",
    verbalStatus: "",
    diagnoses: [],
    diagnosisOther: "",
    triggersOn: false,
    triggers: [],
    triggersOther: "",
    therapyOn: false,
    therapySessions: [],
    dietOn: false,
    diets: [],
    dietOther: "",
    allergyOn: false,
    allergies: [],
    allergyOther: "",
    medicationOn: false,
    medicationDetail: "",
    careOn: false,
    country: "",
    provider: "",
    providerOther: "",
  });
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [openSections, setOpenSections] = useState({
    general: true, about: true, medical: false, care: false,
  });
  const toggleSection = (k) => setOpenSections((s) => ({ ...s, [k]: !s[k] }));

  useEffect(() => {
    const id = "bonda-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  const set = (key, value) =>
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "country") {
        next.provider = "";
        next.providerOther = "";
      }
      return next;
    });

  const toggleIn = (key, otherKey, option) =>
    setForm((f) => {
      const list = f[key];
      const has = list.includes(option);
      const nextList = has ? list.filter((x) => x !== option) : [...list, option];
      const next = { ...f, [key]: nextList };
      if (otherKey && option === "Other" && has) next[otherKey] = "";
      return next;
    });

  const setToggle = (key, on) =>
    setForm((f) => {
      const next = { ...f, [key]: on };
      // Seed one therapy row the first time therapy is turned on.
      if (key === "therapyOn" && on && f.therapySessions.length === 0) {
        next.therapySessions = [{ type: "", date: "" }];
      }
      return next;
    });

  const updateSession = (i, key, value) =>
    setForm((f) => {
      const sessions = f.therapySessions.map((s, idx) => (idx === i ? { ...s, [key]: value } : s));
      return { ...f, therapySessions: sessions };
    });
  const addSession = () =>
    setForm((f) => ({ ...f, therapySessions: [...f.therapySessions, { type: "", date: "" }] }));
  const removeSession = (i) =>
    setForm((f) => ({ ...f, therapySessions: f.therapySessions.filter((_, idx) => idx !== i) }));

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) set("photo", URL.createObjectURL(file));
  };

  const save = () => {
    const err = {};
    if (!form.name.trim()) err.name = "Please add a name.";
    if (!form.verbalStatus) err.verbalStatus = "Please choose a verbal status.";
    setErrors(err);
    if (Object.keys(err).length) {
      setOpenSections((s) => ({
        ...s,
        general: err.name ? true : s.general,
        about: err.verbalStatus ? true : s.about,
      }));
      return;
    }
    console.log("Saving child profile:", form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2600);
  };

  const providerList = form.country ? PROVIDERS[form.country] || [] : [];

  return (
    <div style={{ background: T.canvas, minHeight: "100vh", fontFamily: T.body, color: T.ink }}>
      <style>{`
        .bonda-input, .bonda-select, .bonda-textarea {
          width:100%; box-sizing:border-box; font-family:${T.body}; font-size:15px;
          color:${T.ink}; background:${T.card}; border:1px solid ${T.lineStrong};
          border-radius:12px; padding:13px 14px; outline:none; transition:border-color .15s, box-shadow .15s;
          -webkit-appearance:none; appearance:none;
        }
        .bonda-textarea { resize:vertical; min-height:74px; }
        .bonda-input::placeholder, .bonda-textarea::placeholder { color:${T.ink40}; }
        .bonda-input:focus, .bonda-select:focus, .bonda-textarea:focus {
          border-color:${T.accent}; box-shadow:0 0 0 4px ${T.focus};
        }
        .bonda-select {
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2323201C' stroke-opacity='.55' stroke-width='1.6' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat:no-repeat; background-position:right 15px center; padding-right:38px; cursor:pointer;
        }
        .bonda-select:disabled { color:${T.ink40}; cursor:not-allowed; background-color:#FAF8F3; }
        .bonda-btn:active { transform:translateY(1px); }
        .bonda-chip { transition:background .12s, border-color .12s, color .12s; }
        .bonda-opt { transition:background .12s; }
        .bonda-opt:hover { background:#F7F5F0 !important; }
        .bonda-opt[data-active="true"]:hover { background:#DDE7E5 !important; }
      `}</style>

      {/* Top bar */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 12, padding: "16px 20px",
          background: T.card, borderBottom: `1px solid ${T.line}`,
          position: "sticky", top: 0, zIndex: 5,
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 999, background: T.tintBg,
          display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, fontSize: 20,
        }}>‹</div>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Add a Child</div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "22px 18px 44px" }}>
        <h1 style={{
          fontFamily: T.title, fontWeight: 600, fontSize: 30, lineHeight: 1.05,
          letterSpacing: "-0.01em", margin: "6px 0 20px",
        }}>Add a child profile</h1>

        {/* Profile photo — centred avatar */}
        <div style={{
          background: "#E9F2EC", border: `1px solid ${T.line}`, borderRadius: 16, padding: "24px 18px",
          textAlign: "center", marginBottom: 18,
        }}>
          <div style={{
            width: 88, height: 88, borderRadius: 999, background: T.accent, margin: "0 auto 14px",
            display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
          }}>
            {form.photo ? (
              <img src={form.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="#fff" opacity=".9" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="#fff" opacity=".9" />
              </svg>
            )}
          </div>

          {form.photo ? (
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <label className="bonda-btn" style={{
                background: T.card, color: T.accent, fontWeight: 600, fontSize: 14,
                padding: "10px 20px", borderRadius: 999, border: `1px solid ${T.accent}`, cursor: "pointer",
              }}>
                Change photo
                <input type="file" accept="image/*" onChange={onPhoto} style={{ display: "none" }} />
              </label>
              <button className="bonda-btn" onClick={() => set("photo", null)} style={{
                background: "transparent", color: T.required, fontWeight: 600, fontSize: 14,
                padding: "10px 20px", borderRadius: 999, border: "none", cursor: "pointer",
              }}>Remove photo</button>
            </div>
          ) : (
            <>
              <label className="bonda-btn" style={{
                display: "inline-block", background: T.accent, color: "#fff", fontWeight: 600, fontSize: 15,
                padding: "11px 26px", borderRadius: 999, cursor: "pointer",
              }}>
                + Upload photo
                <input type="file" accept="image/*" onChange={onPhoto} style={{ display: "none" }} />
              </label>
              <div style={{ fontSize: 12.5, color: T.ink55, marginTop: 10 }}>
                Add a real photo (optional) — or keep the default.
              </div>
            </>
          )}
        </div>

        {/* ---- General information ---- */}
        <Card title="General information" open={openSections.general} onToggle={() => toggleSection("general")}>
          <Field label="Child's name" required error={errors.name}>
            <input className="bonda-input" placeholder="e.g. Aiden" value={form.name}
              onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Date of birth">
            <input className="bonda-input" type="date" value={form.dob}
              onChange={(e) => set("dob", e.target.value)} />
          </Field>
          <Field label="Gender">
            <select className="bonda-select" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="">Select gender</option>
              <option>Boy</option><option>Girl</option><option>Prefer not to say</option>
            </select>
          </Field>
          <Field label="Your relationship to this child" last={form.relationship !== "Other"}>
            <select className="bonda-select" value={form.relationship}
              onChange={(e) => set("relationship", e.target.value)}>
              {RELATIONSHIP_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          {form.relationship === "Other" && (
            <Field label="Please specify" last>
              <input className="bonda-input" placeholder="e.g. Legal guardian, kinship carer"
                value={form.relationshipOther} onChange={(e) => set("relationshipOther", e.target.value)} />
            </Field>
          )}
        </Card>

        {/* ---- About your child ---- */}
        <Card title="About your child" open={openSections.about} onToggle={() => toggleSection("about")}>
          <Field label="Verbal status" required error={errors.verbalStatus}>
            <select className="bonda-select" value={form.verbalStatus}
              onChange={(e) => set("verbalStatus", e.target.value)}>
              <option value="">Select verbal status</option>
              <option>Non-verbal</option><option>Minimally verbal</option><option>Verbal</option>
            </select>
          </Field>

          <Field label="Diagnosis" hint="Select all that apply.">
            <MultiSelect options={DIAGNOSIS_OPTIONS} selected={form.diagnoses}
              onToggle={(o) => toggleIn("diagnoses", "diagnosisOther", o)} />
            {form.diagnoses.includes("Other") && (
              <input className="bonda-input" style={{ marginTop: 10 }} placeholder="Other diagnosis"
                value={form.diagnosisOther} onChange={(e) => set("diagnosisOther", e.target.value)} />
            )}
          </Field>

          {/* Known triggers */}
          <ToggleField label="Known triggers?" on={form.triggersOn}
            onChange={(v) => setToggle("triggersOn", v)} last={!form.triggersOn} />
          {form.triggersOn && (
            <Field label="What are they?" hint="Select all that apply." last>
              <MultiSelect options={TRIGGER_OPTIONS} selected={form.triggers}
                onToggle={(o) => toggleIn("triggers", "triggersOther", o)} />
              {form.triggers.includes("Other") && (
                <input className="bonda-input" style={{ marginTop: 10 }} placeholder="Other trigger"
                  value={form.triggersOther} onChange={(e) => set("triggersOther", e.target.value)} />
              )}
            </Field>
          )}

          {/* Therapy schedule */}
          <ToggleField label="Therapy schedule?" on={form.therapyOn}
            onChange={(v) => setToggle("therapyOn", v)} last={!form.therapyOn} />
          {form.therapyOn && (
            <Field label="Sessions" hint="Pick a type and date. Add as many as you need." last>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {form.therapySessions.map((s, i) => (
                  <div key={i} style={{
                    border: `1px solid ${T.line}`, borderRadius: 12, padding: 12,
                    display: "flex", flexDirection: "column", gap: 8, position: "relative",
                  }}>
                    <select className="bonda-select" value={s.type}
                      onChange={(e) => updateSession(i, "type", e.target.value)}>
                      <option value="">Select therapy type</option>
                      {THERAPY_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <input className="bonda-input" type="date" value={s.date}
                      onChange={(e) => updateSession(i, "date", e.target.value)} />
                    {form.therapySessions.length > 1 && (
                      <button className="bonda-btn" onClick={() => removeSession(i)} style={{
                        position: "absolute", top: 8, right: 8, background: "transparent",
                        border: "none", color: T.ink40, fontSize: 18, cursor: "pointer", lineHeight: 1,
                      }} aria-label="Remove session">×</button>
                    )}
                  </div>
                ))}
                <button className="bonda-btn" onClick={addSession} style={{
                  alignSelf: "flex-start", background: T.tintBg, color: T.accentPress, fontWeight: 600,
                  fontSize: 14, padding: "10px 16px", borderRadius: 999, border: "none", cursor: "pointer",
                }}>+ Add another session</button>
              </div>
            </Field>
          )}

          {/* Diet program */}
          <ToggleField label="Diet program?" on={form.dietOn}
            onChange={(v) => setToggle("dietOn", v)} last={!form.dietOn} />
          {form.dietOn && (
            <Field label="Which diets?" hint="Select all that apply." last>
              <MultiSelect options={DIET_OPTIONS} selected={form.diets}
                onToggle={(o) => toggleIn("diets", "dietOther", o)} />
              {form.diets.includes("Other") && (
                <input className="bonda-input" style={{ marginTop: 10 }} placeholder="Other diet"
                  value={form.dietOther} onChange={(e) => set("dietOther", e.target.value)} />
              )}
            </Field>
          )}
        </Card>

        {/* ---- Medical information ---- */}
        <Card title="Medical information" open={openSections.medical} onToggle={() => toggleSection("medical")}>
          <ToggleField label="Any allergies?" on={form.allergyOn}
            onChange={(v) => setToggle("allergyOn", v)} last={!form.allergyOn} />
          {form.allergyOn && (
            <Field label="Which allergies?" hint="Select all that apply.">
              <MultiSelect options={ALLERGY_OPTIONS} selected={form.allergies}
                onToggle={(o) => toggleIn("allergies", "allergyOther", o)} />
              {form.allergies.includes("Other") && (
                <input className="bonda-input" style={{ marginTop: 10 }} placeholder="Other allergy"
                  value={form.allergyOther} onChange={(e) => set("allergyOther", e.target.value)} />
              )}
            </Field>
          )}

          <ToggleField label="On regular medication?" on={form.medicationOn}
            onChange={(v) => setToggle("medicationOn", v)} last={!form.medicationOn} />
          {form.medicationOn && (
            <Field label="Please specify" hint="Medication name and dosage." last>
              <textarea className="bonda-textarea" placeholder="e.g. Melatonin 3mg at night"
                value={form.medicationDetail} onChange={(e) => set("medicationDetail", e.target.value)} />
            </Field>
          )}
        </Card>

        {/* ---- Care & clinic ---- */}
        <Card title="Care & clinic" open={openSections.care} onToggle={() => toggleSection("care")}>
          <ToggleField label="Seeing a clinic or specialist?" on={form.careOn}
            onChange={(v) => setToggle("careOn", v)} last={!form.careOn} />
          {form.careOn && (
            <>
              <Field label="Location (country)">
                <select className="bonda-select" value={form.country}
                  onChange={(e) => set("country", e.target.value)}>
                  <option value="">Select country</option>
                  <option>Singapore</option><option>Malaysia</option>
                </select>
              </Field>
              <Field label="Clinic, psychologist or psychiatrist"
                last={form.provider !== "Other (not listed)"}
                hint={!form.country ? "Choose a country first to see providers." : undefined}>
                <select className="bonda-select" disabled={!form.country} value={form.provider}
                  onChange={(e) => set("provider", e.target.value)}>
                  <option value="">{form.country ? "Select a provider" : "Select a country first"}</option>
                  {providerList.map((p) => <option key={p}>{p}</option>)}
                  {form.country && <option>Other (not listed)</option>}
                </select>
              </Field>
              {form.provider === "Other (not listed)" && (
                <Field label="Name of clinic / specialist" last>
                  <input className="bonda-input" placeholder="e.g. Dr Tan — Sunrise Family Clinic"
                    value={form.providerOther} onChange={(e) => set("providerOther", e.target.value)} />
                </Field>
              )}
            </>
          )}
        </Card>

        {/* Actions */}
        <button className="bonda-btn" onClick={save} style={{
          width: "100%", background: T.accent, color: "#fff", fontFamily: T.body, fontWeight: 600,
          fontSize: 16, padding: "16px", borderRadius: 14, border: "none", cursor: "pointer", marginTop: 6,
        }}
          onMouseDown={(e) => (e.currentTarget.style.background = T.accentPress)}
          onMouseUp={(e) => (e.currentTarget.style.background = T.accent)}>
          Save profile
        </button>
        <button className="bonda-btn" style={{
          width: "100%", background: "transparent", color: T.ink70, fontFamily: T.body, fontWeight: 600,
          fontSize: 15, padding: "14px", borderRadius: 14, border: "none", cursor: "pointer", marginTop: 8,
        }}>Cancel</button>

        {saved && (
          <div style={{
            marginTop: 16, background: T.tintBg, color: T.accentPress, borderRadius: 12,
            padding: "12px 14px", fontSize: 14, fontWeight: 600, textAlign: "center",
          }}>Profile saved.</div>
        )}
      </div>
    </div>
  );
}

/* ---------- building blocks ---------- */

function Card({ title, open, onToggle, children }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.line}`, borderRadius: 16,
      overflow: "hidden", marginBottom: 18,
    }}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="bonda-btn" style={{
        width: "100%", boxSizing: "border-box", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 12, background: T.accent, color: "#fff",
        fontFamily: T.title, fontWeight: 600, fontSize: 18, padding: "14px 18px",
        letterSpacing: "-0.005em", border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <span>{title}</span>
        <svg width="15" height="10" viewBox="0 0 12 8" style={{
          flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .18s",
        }}>
          <path d="M1 1l5 5 5-5" stroke="#fff" strokeWidth="1.8" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div style={{ padding: "6px 18px 4px" }}>{children}</div>}
    </div>
  );
}

function Field({ label, required, error, hint, last, children }) {
  return (
    <div style={{ padding: "14px 0", borderBottom: last ? "none" : `1px solid ${T.line}` }}>
      <label style={{
        display: "block", fontSize: 13, fontWeight: 600, color: T.ink70,
        marginBottom: 8, letterSpacing: "0.01em",
      }}>
        {label}{required && <span style={{ color: T.required, marginLeft: 4 }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 12.5, color: T.ink40, marginTop: 7 }}>{hint}</div>}
      {error && <div style={{ fontSize: 12.5, color: T.required, marginTop: 7 }}>{error}</div>}
    </div>
  );
}

function ToggleField({ label, on, onChange, last }) {
  return (
    <div style={{
      padding: "16px 0", borderBottom: last ? "none" : `1px solid ${T.line}`,
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
    }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: on ? T.ink40 : T.ink70 }}>No</span>
        <button onClick={() => onChange(!on)} aria-pressed={on} aria-label={label} style={{
          width: 52, height: 30, borderRadius: 999, border: "none", cursor: "pointer",
          background: on ? T.accent : "#D9D6CF", position: "relative", padding: 0,
          transition: "background .18s",
        }}>
          <span style={{
            position: "absolute", top: 3, left: 3, width: 24, height: 24, borderRadius: 999,
            background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)",
            transform: on ? "translateX(22px)" : "translateX(0)", transition: "transform .18s",
          }} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: on ? T.accent : T.ink40 }}>Yes</span>
      </div>
    </div>
  );
}

function MultiSelect({ options, selected, onToggle, placeholder = "Tap to select" }) {
  const [open, setOpen] = useState(false);
  const summary =
    selected.length === 0
      ? placeholder
      : selected.length <= 2
      ? selected.join(", ")
      : `${selected.length} selected`;

  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="bonda-btn" style={{
        width: "100%", boxSizing: "border-box", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 10, fontFamily: T.body, fontSize: 15, textAlign: "left",
        background: T.card, border: `1px solid ${open ? T.accent : T.lineStrong}`,
        boxShadow: open ? `0 0 0 4px ${T.focus}` : "none", borderRadius: 12, padding: "13px 14px",
        cursor: "pointer", color: selected.length ? T.ink : T.ink40,
      }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{summary}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" style={{
          flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s",
        }}>
          <path d="M1 1l5 5 5-5" stroke="#23201C" strokeOpacity=".55" strokeWidth="1.6"
            fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          marginTop: 8, border: `1px solid ${T.line}`, borderRadius: 12, overflow: "hidden",
          maxHeight: 268, overflowY: "auto", background: T.card,
          boxShadow: "0 6px 20px rgba(35,32,28,.10)",
        }}>
          {options.map((o, i) => {
            const active = selected.includes(o);
            return (
              <button key={o} type="button" data-active={active} onClick={() => onToggle(o)}
                className="bonda-opt" style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 12, minHeight: 52, padding: "13px 16px", textAlign: "left", cursor: "pointer",
                  fontFamily: T.body, fontSize: 15, border: "none",
                  borderBottom: i === options.length - 1 ? "none" : `1px solid ${T.line}`,
                  background: active ? T.tintBg : T.card,
                  color: active ? T.accentPress : T.ink, fontWeight: active ? 600 : 400,
                }}>
                <span>{o}</span>
                <span style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  border: `1.5px solid ${active ? T.accent : T.lineStrong}`,
                  background: active ? T.accent : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {active && (
                    <svg width="13" height="11" viewBox="0 0 13 11">
                      <path d="M1.5 5.5l3.5 3.5L11.5 2" stroke="#fff" strokeWidth="2"
                        fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
