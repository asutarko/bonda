// ============================================================
// BONDA — COMPLIANCE MODULE
// File: bonda-compliance.jsx
//
// Contains:
//   1. PrivacyPolicy    — full PDPA-compliant policy
//   2. MedicalDisclaimer — required health content disclaimer
//   3. LegalHub         — all legal docs in one screen; mandatory mode
//                          gates the app until the user ticks + agrees
//                          (see LegalHub's mandatory prop in App.jsx)
//   4. DPIASummary      — Data Protection Impact Assessment
//
// HOW TO USE:
//   • Add <LegalHub /> to your settings/footer
//   • Place <MedicalDisclaimerBanner /> on any health content screen
//
// DEVELOPER NOTES:
//   • Replace DPO_EMAIL with a real monitored inbox before launch
//   • Tested against PDPA 2012 + PDPC Advisory Guidelines March 2024
// ============================================================

import { useState } from "react";

// ── CONFIG — update these before launch ──────────────────────
const COMPLIANCE_CONFIG = {
  appName:       "Bonda",
  dpoName:       "Norena Darsana",
  dpoEmail:      "norena@bondaapp.sg",       // ← set up this email before launch
  policyDate:    "July 2025",
  policyVersion: "1.0",
};

// ── DESIGN TOKENS (matches Bonda design system) ───────────────
const C = {
  ink:      "#065F46",
  inkSoft:  "#2D5A3D",
  inkMuted: "#7BA08A",
  canvas:   "#F2FAF6",
  surface:  "#FFFFFF",
  border:   "#D4EAE0",
  primary:  "#065F46",
  primaryL: "#DCFCE7",
  amber:    "#D97706",
  amberL:   "#FEF3C7",
  red:      "#DC2626",
  redL:     "#FEE2E2",
  green:    "#16A34A",
  greenL:   "#DCFCE7",
  r:        "12px",
  rL:       "20px",
  font:     "'Fraunces', Georgia, serif",
};

// ── SHARED PRIMITIVES ─────────────────────────────────────────
const Section = ({ title, children, accent = C.primary }) => (
  <div style={{ marginBottom: 16, borderRadius: C.r, overflow: "hidden", border: `1px solid ${C.border}` }}>
    <div style={{ padding: "10px 16px", background: accent + "12", borderBottom: `1px solid ${C.border}` }}>
      <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: accent }}>{title}</p>
    </div>
    <div style={{ padding: "12px 16px", background: C.surface }}>
      {children}
    </div>
  </div>
);

const BulletList = ({ items, color = C.inkSoft }) => (
  <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
    {items.map((item, i) => (
      <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
        <span style={{ color: C.primary, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>•</span>
        <span style={{ fontSize: 13, color, lineHeight: 1.7 }}>{item}</span>
      </li>
    ))}
  </ul>
);

const BackButton = ({ onBack, label = "← Back" }) => (
  <button onClick={onBack} style={{
    background: "none", border: "none", color: C.primary, fontWeight: 700,
    fontSize: 14, cursor: "pointer", fontFamily: C.font,
    padding: "0 0 20px", display: "flex", alignItems: "center", gap: 6,
  }}>{label}</button>
);

// ═════════════════════════════════════════════════════════════
//  1. PRIVACY POLICY SCREEN
//  Full PDPA-compliant policy. Can be shown standalone
//  or navigated to from LegalHub.
// ═════════════════════════════════════════════════════════════
export function PrivacyPolicyScreen({ onBack }) {
  const { appName, dpoName, dpoEmail, policyDate } = COMPLIANCE_CONFIG;

  const sections = [
    {
      title: "Who we are",
      accent: C.primary,
      items: [
        `${appName} is a caregiver support app for parents of autistic children in Singapore.`,
        `Developed and operated by: ${dpoName}`,
        `Data Protection Officer (DPO): ${dpoName}`,
        `DPO Email: ${dpoEmail}`,
        "Governed by Singapore's Personal Data Protection Act (PDPA) 2012.",
      ]
    },
    {
      title: "What personal data we collect",
      accent: C.primary,
      items: [
        "Child's name, age, and avatar — to personalise your experience",
        "Caregiver type (biological parent, foster parent, grandparent, other)",
        "Schedule items and completion history — stored on your device only",
        "Health notes (allergies, medications, visible marks) — stored on your device only",
        "Community display name, password, and avatar — for the Community feature",
        "Profile photos (optional) — stored on your device only",
        "We do NOT collect NRIC numbers, government ID documents, or HealthHub records.",
      ]
    },
    {
      title: "Why we collect it (purpose limitation)",
      accent: C.primary,
      items: [
        "Child profile data: to personalise schedules, emotion guides, and behaviour guides",
        "Community account data: to enable parent-to-parent connection",
        "Health notes: to help you at medical appointments when HealthHub access is unavailable",
        "We do NOT use your data for advertising, profiling, or selling to any third party.",
      ]
    },
    {
      title: "Where your data is stored",
      accent: C.primary,
      items: [
        "Child profiles, schedules, and health notes: stored in localStorage on YOUR device only.",
        "Community messages and accounts: stored in an encrypted shared storage service.",
        "Community data is NOT linked to your child's profile data.",
        "No data is transferred outside Singapore.",
        "Future versions will use Supabase (Singapore region) with row-level security.",
      ]
    },
    {
      title: "Children's data — PDPC 2024 compliance",
      accent: C.primary,
      items: [
        "This app processes data about children under 18 years of age.",
        "You, the parent or guardian, provide consent on behalf of your child at account creation.",
        "Child profile data is NEVER made public or searchable — visible only to you.",
        "We apply data minimisation: we collect only what is strictly necessary.",
        "You can delete any child profile at any time from within the app.",
        "Complies with PDPC Advisory Guidelines on Children's Personal Data (March 2024).",
      ]
    },
    {
      title: "Your rights under the PDPA",
      accent: C.primary,
      items: [
        `Right to access personal data we hold: email ${dpoEmail}`,
        `Right to correct inaccurate data: email ${dpoEmail}`,
        "Right to withdraw consent and request data deletion at any time",
        "Right to lodge a complaint with the PDPC at pdpc.gov.sg",
        "We will respond to data access or correction requests within 30 days.",
      ]
    },
    {
      title: "Data breach notification",
      accent: C.red,
      items: [
        "In the event of a data breach, we will notify affected users as soon as practicable.",
        "Mandatory breaches will be reported to the PDPC within 3 business days as required by law.",
        "Where children's data is affected, we will also notify the parent or guardian.",
      ]
    },
    {
      title: "Changes to this policy",
      accent: C.inkMuted,
      items: [
        "Material changes will be notified within the app.",
        "Continued use after notification constitutes acceptance.",
        `Policy version: ${COMPLIANCE_CONFIG.policyVersion} · Last updated: ${policyDate}`,
      ]
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.canvas, fontFamily: C.font, overflowY: "auto" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 20px 40px" }}>
        <BackButton onBack={onBack} />
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: C.ink }}>Privacy Policy</h2>
        <p style={{ margin: "0 0 24px", color: C.inkMuted, fontSize: 12 }}>
          Version {COMPLIANCE_CONFIG.policyVersion} · {policyDate} · {appName}
        </p>

        {sections.map((sec, i) => (
          <Section key={i} title={sec.title} accent={sec.accent}>
            <BulletList items={sec.items} />
          </Section>
        ))}

        <div style={{ background: C.primaryL, borderRadius: C.r, padding: "14px 16px", border: `1px solid ${C.primary}20` }}>
          <p style={{ margin: "0 0 4px", fontWeight: 800, color: C.primary, fontSize: 13 }}>
            Data Protection Officer
          </p>
          <p style={{ margin: "0 0 2px", color: C.inkSoft, fontSize: 13 }}>{dpoName}</p>
          <p style={{ margin: 0, color: C.primary, fontSize: 13, fontWeight: 700 }}>📧 {dpoEmail}</p>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
//  2. MEDICAL DISCLAIMER SCREEN
// ═════════════════════════════════════════════════════════════
export function MedicalDisclaimerScreen({ onBack }) {
  const clauses = [
    {
      title: "Educational purposes only",
      accent: C.amber,
      body: "All content in Bonda — including information about autism, emotions, behaviours, activities, and training strategies — is provided for general educational and informational purposes only. It is not intended to be used as medical, psychological, or clinical advice.",
    },
    {
      title: "Always consult a qualified professional",
      accent: C.amber,
      body: "Every autistic child is different. The information in this app is not tailored to your child's specific diagnosis, severity, comorbidities, or individual needs. Always consult a qualified healthcare professional, therapist, psychologist, or specialist for advice specific to your child.",
    },
    {
      title: "Do not delay seeking professional help",
      accent: C.red,
      body: "If you are concerned about your child's health, development, or safety, do not rely on this app instead of seeking professional assessment. In an emergency, call 995 (Singapore Emergency Services) or bring your child to the nearest hospital.",
    },
    {
      title: "Health Notes feature",
      accent: C.amber,
      body: "The Health Notes feature is designed to help you record basic observations to share with healthcare professionals. These notes do not constitute a medical record and must not be used to make clinical decisions.",
    },
    {
      title: "Subsidy and government information",
      accent: C.inkMuted,
      body: "Information about subsidies, grants, and government programmes is provided as general guidance only. Eligibility criteria, amounts, and processes may change. Always verify current information directly with the relevant agency (MSF, MOH, SG Enable).",
    },
    {
      title: "Limitation of liability",
      accent: C.inkMuted,
      body: `To the maximum extent permitted by applicable Singapore law, ${COMPLIANCE_CONFIG.appName} and its developer (${COMPLIANCE_CONFIG.dpoName}) accept no liability for any loss, damage, or harm arising from reliance on any content in this app.`,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.canvas, fontFamily: C.font, overflowY: "auto" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 20px 40px" }}>
        <BackButton onBack={onBack} />
        <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 800, color: C.ink }}>Medical Disclaimer</h2>

        <div style={{ background: C.amberL, borderRadius: C.r, padding: "14px 16px", marginBottom: 20, border: `1.5px solid ${C.amber}40` }}>
          <p style={{ margin: 0, color: C.amber, fontWeight: 800, fontSize: 14, lineHeight: 1.6 }}>
            ⚕️ Bonda is an educational app. It does not provide medical advice, diagnose conditions, or replace professional care.
          </p>
        </div>

        {clauses.map((cl, i) => (
          <Section key={i} title={cl.title} accent={cl.accent}>
            <p style={{ margin: 0, color: C.inkSoft, fontSize: 13, lineHeight: 1.75 }}>{cl.body}</p>
          </Section>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
//  3. LEGAL HUB SCREEN
//  Put a link to this in your app's settings or footer.
//  Usage: <LegalHub onBack={() => ...} />
// ═════════════════════════════════════════════════════════════
export function LegalHub({ onBack, mandatory = false, onAgree }) {
  const [screen, setScreen] = useState(null);
  const [checked, setChecked] = useState(false);
  const [agreeing, setAgreeing] = useState(false);
  const [agreeErr, setAgreeErr] = useState("");

  if (screen === "privacy")    return <PrivacyPolicyScreen    onBack={() => setScreen(null)} />;
  if (screen === "disclaimer") return <MedicalDisclaimerScreen onBack={() => setScreen(null)} />;
  if (screen === "dpia")       return <DPIASummaryScreen       onBack={() => setScreen(null)} />;

  const items = [
    { id: "privacy",    icon: "🔒", label: "Privacy Policy",    sub: "How we collect, use and protect your data", color: C.primary },
    { id: "disclaimer", icon: "⚕️", label: "Medical Disclaimer", sub: "Important information about app content", color: C.amber },
    { id: "dpia",       icon: "📋", label: "Data Protection Impact Assessment", sub: "Our PDPA compliance documentation", color: C.inkMuted },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.canvas, fontFamily: C.font, overflowY: "auto" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 20px 40px" }}>
        {mandatory ? (
          <>
            <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: C.ink }}>Before you start</h2>
            <p style={{ margin: "0 0 24px", color: C.inkSoft, fontSize: 13, lineHeight: 1.7 }}>
              Please review the Privacy Policy and Medical Disclaimer below before using Bonda.
            </p>
          </>
        ) : (
          <>
            <BackButton onBack={onBack} />
            <h2 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 800, color: C.ink }}>Legal & Privacy</h2>
          </>
        )}

        {items.map(item => (
          <div key={item.id} onClick={() => setScreen(item.id)}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: C.surface, borderRadius: C.r, border: `1px solid ${C.border}`, marginBottom: 10, cursor: "pointer" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: item.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
              {item.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 2px", fontWeight: 800, color: C.ink, fontSize: 14 }}>{item.label}</p>
              <p style={{ margin: 0, color: C.inkMuted, fontSize: 12 }}>{item.sub}</p>
            </div>
            <span style={{ color: C.inkMuted, fontSize: 20 }}>›</span>
          </div>
        ))}

        <p style={{ textAlign: "center", marginTop: 20, color: C.inkMuted, fontSize: 11, lineHeight: 1.6 }}>
          Bonda complies with Singapore's PDPA 2012 and the<br/>
          PDPC Advisory Guidelines on Children's Personal Data (March 2024).
        </p>

        {mandatory && (
          <>
            <div style={{ background: C.surface, borderRadius: C.r, padding: "16px", marginTop: 20, border: `2px solid ${checked ? C.primary : C.border}`, transition: "border-color 0.2s", cursor: "pointer" }}
              onClick={() => setChecked(v => !v)}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked ? C.primary : C.border}`,
                  background: checked ? C.primary : C.surface, display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0, transition: "all 0.2s", marginTop: 1,
                }}>
                  {checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6 L5 9 L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: C.inkSoft, lineHeight: 1.7 }}>
                  I have read and agree to the Privacy Policy and Medical Disclaimer above.
                </p>
              </div>
            </div>

            {agreeErr && (
              <div style={{ background: C.redL, borderRadius: C.r, padding: "10px 14px", marginTop: 12, border: `1px solid ${C.red}25` }}>
                <p style={{ margin: 0, color: C.red, fontSize: 13, fontWeight: 700 }}>⚠️ {agreeErr}</p>
              </div>
            )}

            <button
              disabled={!checked || agreeing}
              onClick={async () => {
                if (!checked || agreeing) return;
                setAgreeing(true); setAgreeErr("");
                try {
                  await onAgree();
                } catch {
                  setAgreeErr("Something went wrong saving your consent. Please try again.");
                }
                setAgreeing(false);
              }}
              style={{
                width: "100%", marginTop: 12, padding: "16px", borderRadius: C.rL, border: "none",
                background: C.primary, color: "white", fontWeight: 800, fontSize: 16,
                cursor: (!checked || agreeing) ? "default" : "pointer", fontFamily: C.font, letterSpacing: "-0.01em",
                opacity: (!checked || agreeing) ? 0.5 : 1,
              }}>
              {agreeing ? "Saving…" : "I Understand — Continue to Bonda →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
//  4. DPIA SUMMARY SCREEN
//  Internal compliance document. Accessible from LegalHub.
// ═════════════════════════════════════════════════════════════
export function DPIASummaryScreen({ onBack }) {
  const { appName, dpoName, dpoEmail, policyDate } = COMPLIANCE_CONFIG;

  const items = [
    { title: "1. Nature of the product", points: [`${appName} is a mobile-first web application for caregivers of autistic children in Singapore.`, "Provides educational content, scheduling, emotion/behaviour guides, subsidy info, and a parent community.", "Does NOT provide medical diagnosis, treatment, or telemedicine services.", "Assessed as a wellness/lifestyle app — NOT a Software as a Medical Device (SaMD) under HSA classification."] },
    { title: "2. Data collected and purpose", points: ["Child profiles: name, age, avatar, caregiver type — Purpose: personalise experience", "Schedule data: activity names, times, history — Purpose: daily routine management", "Health notes: allergies, medications, visible marks — Purpose: support parents at appointments", "Community accounts: display name, password, avatar — Purpose: parent community", "Profile photos (optional): base64 on device — Purpose: avatar personalisation", "All data is minimal and directly relevant to stated purpose (PDPA data minimisation obligation)."] },
    { title: "3. Data subjects and risk level", points: ["Primary data subjects: children under 18 — elevated risk category under PDPA.", "Secondary data subjects: adult caregivers (parents, foster parents, grandparents).", "Consent obtained from parents/guardians on behalf of child at profile creation.", "Complies with PDPC 2024 Advisory Guidelines on Children's Personal Data."] },
    { title: "4. Data storage and security", points: ["Child profiles, schedules, health notes: localStorage on user's own device — never transmitted.", "Community data: encrypted shared storage (window.storage) — not linked to child profiles.", "No cloud database in v1. Planned migration to Supabase (Singapore region) with row-level security.", "No data transferred outside Singapore.", "HTTPS enforced for all network communication."] },
    { title: "5. Data minimisation", points: ["No NRIC or government identity documents collected.", "No location/GPS data collected.", "No biometric data collected.", "Health notes are optional and wholly under parental control.", "Community accounts use display names only — not real names."] },
    { title: "6. Consent mechanism", points: ["Consent gate shown on first app launch — cannot be bypassed.", "User must tick checkbox confirming they have read Privacy Policy and Medical Disclaimer.", "Consent record stored in localStorage with version number and ISO timestamp.", "Re-consent triggered if policy version number changes.", "Child profile creation has separate consent checkbox for parental data processing agreement."] },
    { title: "7. Risks identified and mitigations", points: ["Risk: Health notes contain sensitive child health data. Mitigation: On-device only, never transmitted, clearly labelled as informal caregiver notes not medical records.", "Risk: Community messages visible to other registered parents. Mitigation: Display names only, child profiles never linked to community accounts, private DMs behind paid feature.", "Risk: Foster parent entering data about a child no longer in their care. Mitigation: UI reminder in Health Notes and Foster Hub screens.", "Risk: Data loss if user clears browser localStorage. Mitigation: Planned Supabase migration; current users advised to not rely on app as sole record."] },
    { title: "8. Data Protection Officer", points: [`DPO: ${dpoName}`, `Email: ${dpoEmail}`, "Accessible during Singapore business hours (Mon–Fri, 9am–6pm SGT).", "Responsible for PDPA requests, data breach notifications, and DPIA review."] },
    { title: "9. Review schedule", points: ["Before any update that changes data collection practices.", "Before migration to Supabase cloud storage.", "Before App Store / Google Play submission.", `Annually. Next scheduled review: ${policyDate.replace("2025", "2026")}.`] },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.canvas, fontFamily: C.font, overflowY: "auto" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 20px 40px" }}>
        <BackButton onBack={onBack} />
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: C.ink }}>Data Protection Impact Assessment</h2>
        <p style={{ margin: "0 0 24px", color: C.inkMuted, fontSize: 12 }}>DPIA conducted: {policyDate} · Prepared by: {dpoName}</p>

        {items.map((sec, i) => (
          <Section key={i} title={sec.title} accent={C.primary}>
            <BulletList items={sec.points} />
          </Section>
        ))}

        <div style={{ background: C.greenL, borderRadius: C.r, padding: "14px 16px", border: `1px solid ${C.green}25` }}>
          <p style={{ margin: 0, color: C.green, fontSize: 12, fontWeight: 700, lineHeight: 1.6 }}>
            ✅ This DPIA was prepared in accordance with the PDPC Advisory Guidelines on Children's Personal Data in the Digital Environment (March 2024) and the Personal Data Protection Act 2012 (Singapore).
          </p>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
//  5. MEDICAL DISCLAIMER BANNER (inline, for content screens)
//  Place this at the top of any screen with health content.
//
//  Usage: <MedicalDisclaimerBanner />
// ═════════════════════════════════════════════════════════════
export function MedicalDisclaimerBanner() {
  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "flex-start",
      padding: "10px 14px", background: C.amberL, borderRadius: C.r,
      border: `1px solid ${C.amber}25`, marginBottom: 16,
    }}>
      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>⚕️</span>
      <p style={{ margin: 0, color: C.amber, fontSize: 11, fontWeight: 700, lineHeight: 1.6 }}>
        Educational content only — not medical advice. Always consult a qualified professional for your child's specific needs.
      </p>
    </div>
  );
}

