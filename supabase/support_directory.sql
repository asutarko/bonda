-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Adds the Support Directory contact catalogue shown on the Support
-- Directory screen, manageable from the app by admins (role = 'admin' on
-- public.profiles). Regular users can only view.
--
-- available_online / last_checked_at are maintained by the automated
-- checker (supabase/functions/check-support-directory) so a dead website
-- link drops out of the app without anyone editing data by hand. Unlike the
-- Subsidies checker, this one only checks reachability — it does not try to
-- auto-extract or change phone/email/description, since a directory listing
-- has no single "headline number" that's safe to scrape and trust.

create table if not exists public.support_directory (
  id text primary key,
  name text not null,
  initials text not null default '',
  category text not null,
  context text not null default '',
  description text not null default '',
  note text not null default '',
  tags text[] not null default '{}'::text[],
  phone text not null default '',
  tel text not null default '',
  email text not null default '',
  whatsapp text not null default '',
  wa text not null default '',
  web text not null default '',
  web_label text not null default '',
  sort_order int not null default 0,
  available_online boolean not null default true,
  last_checked_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on column public.support_directory.available_online is
  'Set to false by the automated checker when the web URL stops resolving. Rows with available_online = false are excluded from the app.';
comment on column public.support_directory.last_checked_at is
  'Set by the automated checker every time it confirms the row''s web URL is reachable.';

alter table public.support_directory enable row level security;

drop policy if exists "Support directory is viewable by authenticated users" on public.support_directory;
create policy "Support directory is viewable by authenticated users"
  on public.support_directory for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage support directory" on public.support_directory;
create policy "Admins can manage support directory"
  on public.support_directory for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Seed with the contacts that previously lived in
-- src/components/SupportDirectory.jsx (ORGS constant) so admins can
-- edit/remove them from the app instead of redeploying code.
insert into public.support_directory (id, name, initials, category, context, description, note, tags, phone, tel, email, whatsapp, wa, web, web_label, sort_order)
select * from (values
  ('sgenable', 'SG Enable', 'SE', 'gov', 'First stop',
    'The focal agency for disability in Singapore. Your starting point for schemes, referrals and the Enabling Guide directory of services.',
    'Begin here if you''re unsure where to go — they''ll point you to the right service.',
    array['Islandwide', 'Free', 'All ages'], '1800 8585 885', '18008585885', 'contactus@sgenable.sg', '', '',
    'https://www.enablingguide.sg', 'enablingguide.sg', 0),
  ('kkh', 'KKH — Dept of Child Development', 'KK', 'diagnosis', 'Under 7',
    'Public developmental and autism assessment for young children, led by developmental paediatricians.',
    'Referral is usually through a polyclinic, GP or paediatrician.',
    array['Public', 'Referral needed', 'Subsidised'], '6394 3062', '+6563943062', '', '', '',
    'https://www.kkh.com.sg/our-specialties/child-development', 'kkh.com.sg', 1),
  ('nuh', 'NUH — Child Development Unit', 'NU', 'diagnosis', 'Birth to 7',
    'Public assessment and support for autism, developmental delay and behavioural needs in early childhood.',
    'Clinics at Jurong Medical Centre and Keat Hong.',
    array['Public', 'Referral needed', 'Subsidised'], '6665 0158', '+6566650158', '', '', '',
    'https://www.nuh.com.sg/care-at-nuh/services/paediatrics/developmental-and-behavioural-paediatrics', 'nuh.com.sg', 2),
  ('imh-cgc', 'IMH — Child Guidance Clinic', 'CGC', 'diagnosis', 'School age',
    'Assessment and mental-health support for school-age children, including autism and ADHD.',
    'For children in Primary 1 and above.',
    array['Public', 'Ages 7+'], '6389 2200', '+6563892200', '', '', '',
    'https://www.imh.com.sg', 'imh.com.sg', 3),
  ('arc', 'Autism Resource Centre (Singapore)', 'ARC', 'autism', 'All ages',
    'Charity dedicated to autism across the lifespan, with resources for families and professionals.',
    'Runs Pathlight School and the E2C employment centre.',
    array['Charity', 'School', 'Employment'], '6323 3258', '+6563233258', 'arc@autism.org.sg', '', '',
    'https://www.autism.org.sg', 'autism.org.sg', 4),
  ('aas', 'Autism Association (Singapore)', 'AA', 'autism', 'All ages',
    'Early intervention, a special-education school and adult day activities for people on the spectrum.',
    'Also has a caregiver-support section and helpline links.',
    array['Charity', 'School', 'Adult day'], '6774 6649', '+6567746649', '', '', '',
    'https://www.autismlinks.org.sg', 'autismlinks.org.sg', 5),
  ('saac', 'St. Andrew''s Autism Centre', 'SA', 'autism', 'All ages',
    'School, adult day-activity and residential programmes, plus caregiver training.',
    'Supports moderate to severe autism, including residential care.',
    array['Charity', 'Residential', 'Adult day'], '6517 3800', '+6565173800', '', '', '',
    'https://www.saac.org.sg', 'saac.org.sg', 6),
  ('rainbow', 'Rainbow Centre', 'RC', 'therapy', 'Early years',
    'Early Intervention (EIPIC) and special education for young children with developmental needs, including autism.',
    'One of the largest EIPIC providers, with therapy and family services.',
    array['EIPIC', 'Special ed', 'Therapy'], '6472 7077', '+6564727077', '', '', '',
    'https://www.rainbowcentre.org.sg', 'rainbowcentre.org.sg', 7),
  ('caringsg', 'CaringSG', 'CG', 'caregiver', 'For caregivers',
    'By caregivers, for caregivers of children with special needs — peer support and service coordination.',
    'CAREbuddy peer support, CAREconnect groups and CAREwell coordination.',
    array['Peer support', 'Free', 'Caregiver-led'], '', '', 'contact@caring.sg', '', '',
    'https://www.caring.sg', 'caring.sg', 8),
  ('cal', 'Caregivers Alliance (CAL)', 'CAL', 'caregiver', 'For caregivers',
    'Caregiver training, support groups and counselling, with deep experience in mental-health caregiving.',
    'Helpline is staffed on weekdays.',
    array['Training', 'Counselling', 'Support groups'], '6388 8631', '+6563888631', '', '', '',
    'https://www.cal.org.sg', 'cal.org.sg', 9),
  ('awwa-cfc', 'AWWA Centre for Caregivers', 'AW', 'caregiver', 'For caregivers',
    'Individual and family counselling, caregiver training, and information on respite options.',
    'Good place to ask about short-term respite for a break.',
    array['Counselling', 'Training', 'Respite info'], '6511 5280', '+6565115280', '', '', '',
    'https://www.awwa.org.sg', 'awwa.org.sg', 10),
  ('sos', 'Samaritans of Singapore (SOS)', 'SOS', 'crisis', '24-hour',
    'Free, confidential emotional support for anyone in distress or crisis, at any hour.',
    'Call 1767, or message CareText on WhatsApp at 9151 1767.',
    array['Free', 'Confidential', 'Crisis'], '1767', '1767', '', '9151 1767', 'https://wa.me/6591511767',
    'https://www.sos.org.sg', 'sos.org.sg', 11),
  ('imh-helpline', 'IMH Mental Health Helpline', 'MH', 'crisis', '24-hour',
    'Round-the-clock helpline from the Institute of Mental Health for anyone facing a mental-health crisis.',
    'For urgent emotional or mental-health support, day or night.',
    array['Free', 'Crisis', 'Mental health'], '6389 2000', '+6563892000', '', '', '',
    'https://www.imh.com.sg', 'imh.com.sg', 12),
  ('samh', 'Singapore Association for Mental Health', 'SM', 'crisis', 'Weekdays',
    'Counselling, rehabilitation and community mental-health support, with a toll-free general line.',
    'A gentler, non-crisis option for ongoing mental-health support.',
    array['Counselling', 'Community', 'Toll-free'], '1800 283 7019', '18002837019', '', '', '',
    'https://www.samhealth.org.sg', 'samhealth.org.sg', 13)
) as seed(id, name, initials, category, context, description, note, tags, phone, tel, email, whatsapp, wa, web, web_label, sort_order)
where not exists (select 1 from public.support_directory);
