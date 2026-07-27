# Bonda Compliance Module — Developer Instructions

## Files in this package
- `bonda-compliance.jsx`  — the source file (React/JSX)
- `bonda-compliance-preview.html` — open in browser to see it working

---

## Components exported

| Component | What it does | Where to use it |
|---|---|---|
| `<ConsentGate>` | Blocks app until user accepts Privacy Policy + Medical Disclaimer | Wrap your root `<App />` |
| `<PrivacyPolicyScreen>` | Full PDPA-compliant policy | Navigated to from ConsentGate or LegalHub |
| `<MedicalDisclaimerScreen>` | Medical content disclaimer | Navigated to from ConsentGate or LegalHub |
| `<LegalHub>` | All legal docs in one screen | Settings screen or footer |
| `<DPIASummaryScreen>` | DPIA document | Inside LegalHub |
| `<MedicalDisclaimerBanner>` | Small amber banner | Top of any health content screen |

---

## How to integrate

### Step 1 — Copy the file
Place `bonda-compliance.jsx` in your `/src/components/` folder.

### Step 2 — Import the components you need
```jsx
import {
  ConsentGate,
  LegalHub,
  MedicalDisclaimerBanner
} from './components/bonda-compliance';
```

### Step 3 — Wrap your root app with ConsentGate
```jsx
// In your index.jsx or App.jsx
function Root() {
  return (
    <ConsentGate>
      <App />
    </ConsentGate>
  );
}
```
That's it. The first time a user opens the app, they see the consent screen.
They CANNOT skip it. Once they accept, they never see it again (unless you
bump the policy version number in COMPLIANCE_CONFIG).

### Step 4 — Add Legal Hub to your settings screen
```jsx
// In your SettingsScreen or footer
const [showLegal, setShowLegal] = useState(false);

if (showLegal) return <LegalHub onBack={() => setShowLegal(false)} />;

return (
  <button onClick={() => setShowLegal(true)}>
    Privacy Policy · Legal · DPO Contact
  </button>
);
```

### Step 5 — Add the medical disclaimer banner on health content screens
```jsx
// In MyChildScreen, HealthNotesScreen, etc.
return (
  <Page>
    <MedicalDisclaimerBanner />
    {/* rest of your screen */}
  </Page>
);
```

---

## Before launch — update COMPLIANCE_CONFIG

Open `bonda-compliance.jsx` and update the top section:

```jsx
const COMPLIANCE_CONFIG = {
  appName:       "Bonda",
  dpoName:       "Norena Darsana",
  dpoEmail:      "norena@bondaapp.sg",   // ← set up this email first
  policyDate:    "July 2025",
  policyVersion: "1.0",
  storageKey:    "bonda_consent_v1",
};
```

**Important:** Set up `norena@bondaapp.sg` as a real monitored inbox before
launch. You can use Gmail + a custom domain, or simply forward from this
address to your personal email. Parents will email this address with data
requests.

---

## How re-consent works

If you make a major change to the privacy policy:
1. Update `policyVersion` to `"1.1"` (or `"2.0"` for major changes)
2. Update `policyDate` to the new date
3. Update `storageKey` to `"bonda_consent_v1_1"` (matches new version)

Every existing user will be shown the consent gate again on their next visit.

---

## PDPA compliance checklist

- [x] Consent obtained before app use (ConsentGate)
- [x] Privacy Policy accessible before and after consent
- [x] Medical Disclaimer accessible before and after consent
- [x] DPO name and email publicly listed
- [x] Children's data protection (PDPC 2024 guidelines)
- [x] Data minimisation documented
- [x] User rights documented (access, correction, deletion)
- [x] Data breach notification procedure documented
- [x] DPIA completed and accessible
- [ ] DPO email monitored (action required before launch)
- [ ] Supabase migration with row-level security (future)
- [ ] App Store privacy nutrition label completed (when submitting)

