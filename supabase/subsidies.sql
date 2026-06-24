-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds the "Subsidies & Aid" scheme catalogue shown on the Subsidies screen,
-- manageable from the app by admins (role = 'admin' on public.profiles).
-- Regular users can only view.

create table if not exists public.subsidies (
  id uuid primary key default gen_random_uuid(),
  badge text not null default '',
  badge_color text not null default '',
  label text not null,
  org text not null default '',
  amount text not null default '',
  saving text not null default '',
  color text not null default '',
  steps jsonb not null default '[]'::jsonb,
  eligibility text not null default '',
  contact text not null default '',
  website text not null default '',
  tip text not null default '',
  sort_order int not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.subsidies enable row level security;

drop policy if exists "Subsidies are viewable by authenticated users" on public.subsidies;
create policy "Subsidies are viewable by authenticated users"
  on public.subsidies for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage subsidies" on public.subsidies;
create policy "Admins can manage subsidies"
  on public.subsidies for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Seed with the schemes that previously lived in src/App.jsx (SUBSIDIES
-- constant) so admins can edit/remove them from the app instead of
-- redeploying code.
insert into public.subsidies (badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order)
select * from (values
  ('START HERE', '#DC2626', 'EIPIC', 'SG Enable / MSF', '$5–$430/month after subsidy',
    'Saves up to $780/month vs unsubsidised. 30–70% off depending on income.', '#7C3AED',
    '["Get your child assessed by a paediatrician at KKH, NUH, or SGH.","Ask the doctor to refer your child to SG Enable for EIPIC placement.","SG Enable contacts you and matches your child to a nearby centre.","Centre assesses needs and calculates your means-tested subsidy.","Enrol — fees range from $5 to $430/month for Singapore Citizens."]'::jsonb,
    'Singapore Citizen or PR, aged 6 or below, assessed by paediatrician.', 'SG Enable: 1800-8585-885', 'enablingguide.sg',
    'Waitlists can be 6–18 months — register early. Your spot is held from the referral date.', 0),
  ('MONTHLY CASH', '#16A34A', 'Home Caregiving Grant', 'AIC', '$250–$400/month cash',
    'Up to $4,800/year to offset therapy, transport, and caregiving costs.', '#16A34A',
    '["Child must be assessed as having permanent moderate-to-severe disability.","For children under 8, assessment must be done by a paediatrician.","Apply via AIC''s eFASS portal using Singpass (online).","Or visit any AIC Link office and fill in a printed form."]'::jsonb,
    'SC or PR. Monthly per-capita income ≤$3,600 or property AV ≤$21,000.', 'AIC: 1800-650-6060', 'aic.sg',
    'Budget 2025 enhanced HCG from April 2026. Apply now to lock in eligibility.', 1),
  ('TRAINING', '#0D9488', 'Caregivers Training Grant', 'SG Enable', '$200/year for approved courses',
    'Covers ABA, sensory, PECS, and autism management courses for parents.', '#0D9488',
    '["Browse approved CTG courses on SG Enable or AIC website.","Choose a course relevant to your child''s needs (ABA, sensory, PECS).","Apply for CTG when registering for the course.","Complete the course and claim your subsidy."]'::jsonb,
    'Caregiver of a person with disability. $200 tied to care recipient per year.', 'SG Enable: 1800-8585-885', 'sgenable.sg',
    'Use CTG to fund courses that teach you the same techniques therapists use — directly applicable at home.', 2),
  ('DEVICES', '#8B5CF6', 'Assistive Technology Fund', 'SG Enable', 'Up to 90% subsidy, cap $40,000',
    'A $2,000 AAC communication device can cost as little as $200 after subsidy.', '#8B5CF6',
    '["Get a recommendation from your child''s therapist, doctor, or school.","Download the ATF application form from SG Enable''s website.","Submit with professional recommendation and device quotation.","Once approved, purchase device and claim the subsidy."]'::jsonb,
    'Person with diagnosed disability. From Jan 2026: monthly PCI ≤$4,800.', 'SG Enable: 1800-8585-885', 'enablingguide.sg',
    'This fund covers AAC communication devices — tools that help non-verbal children speak. Life-changing.', 3),
  ('FINANCIAL AID', '#2D5A3D', 'ComCare', 'MSF', 'Varies — living needs, transport, fees',
    'Can cover therapy transport, school fees, and household bills.', '#2D5A3D',
    '["Visit supportgowhere.life.gov.sg to check qualifying schemes.","Or walk into any Social Service Office (SSO) near you.","Bring NRIC, child''s birth cert, income docs, and medical reports.","A social worker assesses your household holistically."]'::jsonb,
    'Singapore Citizens and PRs. Assessed holistically — no hard income cutoff.', 'MSF: 1800-222-0000 (Mon–Fri 9am–6pm)', 'msf.gov.sg',
    'ComCare SSOs are within 2km of 95% of HDB homes. Walk in — no appointment needed to start a conversation.', 4)
) as seed(badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order)
where not exists (select 1 from public.subsidies);
