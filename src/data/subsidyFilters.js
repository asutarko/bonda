// Filter option definitions for the Subsidies & Aid finder.
// Values here must match the residency / support_types / target_groups
// values written by supabase/subsidies_finder_seed.sql and by the
// check-subsidies Edge Function.

export const RESIDENCY = [
  { key: "all", label: "Anyone" },
  { key: "SC", label: "Citizen" },
  { key: "PR", label: "PR" },
  { key: "Foreigner", label: "Foreigner" },
];

export const STAGE = [
  { key: "any", label: "Any" },
  { key: "child", label: "Child · 0–18" },
  { key: "adult", label: "Adult · 18+" },
];

export const SUPPORT = [
  { key: "all", label: "All support" },
  { key: "financial", label: "Financial help" },
  { key: "therapy", label: "Therapy & medical" },
  { key: "education", label: "School" },
  { key: "devices", label: "Devices" },
  { key: "transport", label: "Transport" },
  { key: "caregiving", label: "Caregiving" },
  { key: "work", label: "Work & training" },
];

export const TARGET = [
  { key: "all", label: "All" },
  { key: "ASD", label: "Autism (ASD)" },
  { key: "special_needs", label: "Special needs" },
  { key: "pwd", label: "Disability (PWD)" },
];

export const MEANS = [
  { key: "any", label: "Any" },
  { key: "no", label: "No income test" },
  { key: "yes", label: "Income-tested" },
];
