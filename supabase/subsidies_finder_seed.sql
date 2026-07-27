-- Run this once in the Supabase Dashboard → SQL Editor for this project,
-- AFTER subsidies_finder_fields.sql.
--
-- 1) Backfills the 4 schemes already seeded in subsidies.sql with the new
--    filter/monitoring fields.
-- 2) Inserts the remaining schemes that used to live only in the hardcoded
--    src/components/BondaSubsidyFinder.jsx (now deleted — this table is the
--    single source of truth). Every insert is guarded by `where not exists`
--    on the label, so this file is safe to re-run.

-- ── 1. Backfill existing rows ──────────────────────────────────────────────

update public.subsidies set
  age_min = 0, age_max = 6,
  residency = '{SC,PR}'::text[],
  support_types = '{therapy}'::text[],
  target_groups = '{ASD,special_needs}'::text[],
  means_tested = true,
  means_note = 'Fee depends on your household income per person.',
  source_url = 'https://www.enablingguide.sg/im-looking-for-disability-support/therapy-intervention/early-intervention-programme-for-infants-children',
  source_name = 'SG Enable / ECDA',
  available_online = true,
  last_checked_at = now()
where label = 'EIPIC';

update public.subsidies set
  age_min = 0, age_max = 99,
  residency = '{SC,PR}'::text[],
  support_types = '{financial,caregiving}'::text[],
  target_groups = '{ASD,pwd}'::text[],
  means_tested = true,
  means_note = 'Income up to $3,600/month per person, or property value ≤ $21,000 if no income. PRs must have a close citizen family member.',
  source_url = 'https://www.aic.sg/Financial-Assistance/Home-Caregiving-Grant',
  source_name = 'Agency for Integrated Care (AIC)',
  available_online = true,
  last_checked_at = now()
where label = 'Home Caregiving Grant';

update public.subsidies set
  age_min = 0, age_max = 99,
  residency = '{SC,PR}'::text[],
  support_types = '{caregiving}'::text[],
  target_groups = '{ASD,special_needs,pwd}'::text[],
  means_tested = false,
  means_note = 'No income test.',
  source_url = 'https://www.enablingguide.sg/im-looking-for-disability-support/money-matters/child-adult-care',
  source_name = 'AIC',
  available_online = true,
  last_checked_at = now()
where label = 'Caregivers Training Grant';

update public.subsidies set
  age_min = 0, age_max = 99,
  residency = '{SC,PR}'::text[],
  support_types = '{devices}'::text[],
  target_groups = '{ASD,pwd}'::text[],
  means_tested = true,
  means_note = 'Household income up to $4,800/month per person (from Jan 2026).',
  source_url = 'https://www.enablingguide.sg/im-looking-for-disability-support/assistive-technology/assistive-technology-fund',
  source_name = 'SG Enable',
  available_online = true,
  last_checked_at = now()
where label = 'Assistive Technology Fund';

-- ── 2. Insert the remaining schemes ────────────────────────────────────────

insert into public.subsidies (badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order, age_min, age_max, residency, support_types, target_groups, means_tested, means_note, source_url, source_name, available_online, last_checked_at)
select * from (values (
  'PRESCHOOL SUPPORT', '#059669', 'Development Support–Plus', 'ECDA', '$2–$290/month (means-tested)',
  'Twice-weekly early intervention delivered inside your child''s own preschool.', '#059669',
  '["Ask your child''s preschool for an assessment.","The EI centre or preschool enrols your child directly."]'::jsonb,
  'Singapore Citizen or PR, ages 2–6, mild to moderate needs.', 'Contact your child''s preschool', 'ecda.gov.sg',
  'Because it happens inside preschool, your child keeps their regular routine and classmates.', 5,
  2, 6, '{SC,PR}'::text[], '{therapy}'::text[], '{ASD,special_needs}'::text[], true,
  'Fee depends on household income per person.',
  'https://www.ecda.gov.sg/parents/other-services/early-intervention-services/development-support-plus-(ds-plus)',
  'ECDA', true, now()
)) as v(badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order, age_min, age_max, residency, support_types, target_groups, means_tested, means_note, source_url, source_name, available_online, last_checked_at)
where not exists (select 1 from public.subsidies where label = 'Development Support–Plus');

insert into public.subsidies (badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order, age_min, age_max, residency, support_types, target_groups, means_tested, means_note, source_url, source_name, available_online, last_checked_at)
select * from (values (
  'PRESCHOOL SUPPORT', '#059669', 'Development Support–Learning Support', 'ECDA', '$5–$290/month (means-tested)',
  'Targeted speech, motor, social and literacy support in K1–K2 for lighter needs.', '#059669',
  '["Ask your child''s preschool (K1–K2) about eligibility.","Their therapy team enrols your child."]'::jsonb,
  'Singapore Citizen or PR, ages 4–6 (K1–K2), lighter needs.', 'Contact your child''s preschool', 'ecda.gov.sg',
  'A lighter-touch option if your child needs some support but not full EIPIC-level intervention.', 6,
  4, 6, '{SC,PR}'::text[], '{therapy}'::text[], '{ASD,special_needs}'::text[], true,
  'Fee depends on household income per person.',
  'https://www.ecda.gov.sg/parents/other-services/early-intervention-services/development-support-and-learning-support-programme-(ds-ls)',
  'ECDA', true, now()
)) as v(badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order, age_min, age_max, residency, support_types, target_groups, means_tested, means_note, source_url, source_name, available_online, last_checked_at)
where not exists (select 1 from public.subsidies where label = 'Development Support–Learning Support');

insert into public.subsidies (badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order, age_min, age_max, residency, support_types, target_groups, means_tested, means_note, source_url, source_name, available_online, last_checked_at)
select * from (values (
  'PRIVATE CENTRES', '#059669', 'EIPIC – Private', 'SG Enable / ECDA', 'Partial subsidy of centre fees (means-tested)',
  'Government subsidy usable at an approved private early intervention centre.', '#059669',
  '["Wait for referrals to reopen (see note below).","Referral is then made via SG Enable."]'::jsonb,
  'Singapore Citizen or PR, ages 0–6.', 'SG Enable: 1800-8585-885', 'enablingguide.sg',
  'New referrals are paused, resuming Q4 2026 for enrolment from Jan 2027. Children already enrolled keep their subsidy.', 7,
  0, 6, '{SC,PR}'::text[], '{therapy}'::text[], '{ASD,special_needs}'::text[], true,
  'Fee depends on household income per person.',
  'https://www.enablingguide.sg/im-looking-for-disability-support/therapy-intervention/early-intervention-programme-for-infants-and-children-p',
  'SG Enable / ECDA', true, now()
)) as v(badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order, age_min, age_max, residency, support_types, target_groups, means_tested, means_note, source_url, source_name, available_online, last_checked_at)
where not exists (select 1 from public.subsidies where label = 'EIPIC – Private');

insert into public.subsidies (badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order, age_min, age_max, residency, support_types, target_groups, means_tested, means_note, source_url, source_name, available_online, last_checked_at)
select * from (values (
  'SCHOOL PLACES', '#0284C7', 'Special Education (SPED) school places', 'MOE', '$14–$250/month depending on the school',
  'Subsidised places at special education schools, including autism-focused schools like Pathlight, St. Andrew''s Autism School and Rainbow Centre.', '#0284C7',
  '["Citizens & PRs: apply via MOE''s Common SPED School Application Form.","International students: approach the school directly."]'::jsonb,
  'Ages 7–18. Citizens, PRs and international students (full fees for foreigners).', 'Via your child''s school application', 'moe.gov.sg',
  'PRs pay more; international students pay full fees — check the specific school''s fee schedule.', 8,
  7, 18, '{SC,PR,Foreigner}'::text[], '{education}'::text[], '{ASD,special_needs,pwd}'::text[], false,
  'Flat fee by nationality — not income-tested.',
  'https://www.moe.gov.sg/special-educational-needs/sped-schools',
  'MOE', true, now()
)) as v(badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order, age_min, age_max, residency, support_types, target_groups, means_tested, means_note, source_url, source_name, available_online, last_checked_at)
where not exists (select 1 from public.subsidies where label = 'Special Education (SPED) school places');

insert into public.subsidies (badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order, age_min, age_max, residency, support_types, target_groups, means_tested, means_note, source_url, source_name, available_online, last_checked_at)
select * from (values (
  'FINANCIAL AID', '#0284C7', 'MOE Financial Assistance Scheme (SPED)', 'MOE', 'Covers fees plus a 70% school bus subsidy',
  'Extra help for lower-income families with fees, transport, meals and supplies at MOE-funded SPED schools.', '#0284C7',
  '["Apply through your child''s SPED school (eFAS).","ComCare families are included automatically."]'::jsonb,
  'Singapore Citizen, ages 7–18, household income up to $4,000/month gross (or $1,000 per person, from 2026).', 'Via your child''s SPED school', 'moe.gov.sg',
  'ComCare families don''t need to apply separately — they''re included automatically.', 9,
  7, 18, '{SC}'::text[], '{financial,education}'::text[], '{ASD,special_needs,pwd}'::text[], true,
  'Household income up to $4,000/month gross, or $1,000 per person (from 2026).',
  'https://www.moe.gov.sg/financial-matters/financial-assistance',
  'MOE', true, now()
)) as v(badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order, age_min, age_max, residency, support_types, target_groups, means_tested, means_note, source_url, source_name, available_online, last_checked_at)
where not exists (select 1 from public.subsidies where label = 'MOE Financial Assistance Scheme (SPED)');

insert into public.subsidies (badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order, age_min, age_max, residency, support_types, target_groups, means_tested, means_note, source_url, source_name, available_online, last_checked_at)
select * from (values (
  'HELPER LEVY', '#D97706', 'Migrant Domestic Worker Levy Concession', 'MOM / AIC', '$60/month instead of $300',
  'A much lower monthly helper levy if your helper cares for a family member with disabilities. Saves about $2,880/year.', '#D97706',
  '["Under 16: covered automatically, no application needed.","16 and above: apply via AIC/MOM with a doctor''s certification."]'::jsonb,
  'The person cared for must be a Singapore Citizen.', 'Via AIC or MOM', 'aic.sg',
  'Children under 16 don''t need to apply — the concession kicks in automatically.', 10,
  0, 99, '{SC}'::text[], '{financial,caregiving}'::text[], '{ASD,pwd}'::text[], false,
  'The person cared for must be a citizen. Children under 16 are covered automatically.',
  'https://www.aic.sg/Financial-Assistance/Migrant-Domestic-Worker-Levy-Concession',
  'MOM / AIC', true, now()
)) as v(badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order, age_min, age_max, residency, support_types, target_groups, means_tested, means_note, source_url, source_name, available_online, last_checked_at)
where not exists (select 1 from public.subsidies where label = 'Migrant Domestic Worker Levy Concession');

insert into public.subsidies (badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order, age_min, age_max, residency, support_types, target_groups, means_tested, means_note, source_url, source_name, available_online, last_checked_at)
select * from (values (
  'TRANSPORT', '#4F46E5', 'Enabling Transport Subsidy', 'SG Enable', 'Up to 80% of transport fees',
  'Subsidy on dedicated bus transport to EIPIC, SPED schools and other approved disability services.', '#4F46E5',
  '["Arranged through your child''s SPED school or service provider."]'::jsonb,
  'Citizens: income ≤ $3,600/month per person. PRs: ≤ $2,600.', 'Via your child''s school or provider', 'enablingguide.sg',
  'Being enhanced from July 2026 — check for a higher subsidy rate.', 11,
  0, 99, '{SC,PR}'::text[], '{transport}'::text[], '{ASD,pwd}'::text[], true,
  'Citizens: income ≤ $3,600/month per person. PRs: ≤ $2,600.',
  'https://www.enablingguide.sg/im-looking-for-disability-support/transport/enabling-transport-subsidy',
  'SG Enable', true, now()
)) as v(badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order, age_min, age_max, residency, support_types, target_groups, means_tested, means_note, source_url, source_name, available_online, last_checked_at)
where not exists (select 1 from public.subsidies where label = 'Enabling Transport Subsidy');

insert into public.subsidies (badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order, age_min, age_max, residency, support_types, target_groups, means_tested, means_note, source_url, source_name, available_online, last_checked_at)
select * from (values (
  'TRANSPORT', '#4F46E5', 'Taxi Subsidy Scheme', 'SG Enable', 'Up to 80% of the fare',
  'Help with taxi or private-hire fares for those who can''t take public transport to school, work or training.', '#4F46E5',
  '["Apply via SG Enable."]'::jsonb,
  'Income ≤ $4,800/month per person. Cannot combine with the Enabling Transport Subsidy.', 'SG Enable: 1800-8585-885', 'enablingguide.sg',
  'Compare against the Enabling Transport Subsidy first — you can only use one.', 12,
  0, 99, '{SC,PR}'::text[], '{transport}'::text[], '{ASD,pwd}'::text[], true,
  'Income ≤ $4,800/month per person. Cannot combine with the Enabling Transport Subsidy.',
  'https://www.enablingguide.sg/im-looking-for-disability-support/transport',
  'SG Enable', true, now()
)) as v(badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order, age_min, age_max, residency, support_types, target_groups, means_tested, means_note, source_url, source_name, available_online, last_checked_at)
where not exists (select 1 from public.subsidies where label = 'Taxi Subsidy Scheme');

insert into public.subsidies (badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order, age_min, age_max, residency, support_types, target_groups, means_tested, means_note, source_url, source_name, available_online, last_checked_at)
select * from (values (
  'TRANSPORT', '#4F46E5', 'Persons with Disabilities Concession Card', 'SimplyGo / SG Enable', 'Up to 55% off adult fares',
  'Discounted public bus and train travel for people with disabilities. Can be used alongside other transport subsidies.', '#4F46E5',
  '["Apply via SimplyGo, or through SG Enable if not from a SPED school / social service agency."]'::jsonb,
  'No income test.', 'SG Enable: 1800-8585-885', 'enablingguide.sg',
  'Unlike the other two transport schemes, this one stacks with the rest — worth getting regardless.', 13,
  0, 99, '{SC,PR}'::text[], '{transport}'::text[], '{ASD,pwd}'::text[], false,
  'No income test.',
  'https://www.enablingguide.sg/im-looking-for-disability-support/transport',
  'SimplyGo / SG Enable', true, now()
)) as v(badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order, age_min, age_max, residency, support_types, target_groups, means_tested, means_note, source_url, source_name, available_online, last_checked_at)
where not exists (select 1 from public.subsidies where label = 'Persons with Disabilities Concession Card');

insert into public.subsidies (badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order, age_min, age_max, residency, support_types, target_groups, means_tested, means_note, source_url, source_name, available_online, last_checked_at)
select * from (values (
  'WORK & SKILLS', '#7C3AED', 'Training Grant (skills & independent living)', 'SG Enable / ARC(S)', 'Funded by SSG, WSG and MSF',
  'Subsidised skills and independent-living training for people with disabilities preparing for work.', '#7C3AED',
  '["Enrol through SG Enable-appointed providers such as ARC Learning Academy."]'::jsonb,
  'Ages 16+. Must not be in full-time education or a government / SPED school.', 'Via SG Enable-appointed providers', 'learningacademy.autism.org.sg',
  'A good next step once your teen ages out of SPED schooling.', 14,
  16, 99, '{SC,PR}'::text[], '{work}'::text[], '{ASD,pwd}'::text[], false,
  'Must not be in full-time education or a government / SPED school.',
  'https://learningacademy.autism.org.sg/training-grants',
  'SG Enable / ARC(S)', true, now()
)) as v(badge, badge_color, label, org, amount, saving, color, steps, eligibility, contact, website, tip, sort_order, age_min, age_max, residency, support_types, target_groups, means_tested, means_note, source_url, source_name, available_online, last_checked_at)
where not exists (select 1 from public.subsidies where label = 'Training Grant (skills & independent living)');
