import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge, Btn, Input, TextArea, Avatar, Accordion, PageHero, AvatarIllustrations, ChildAvatar, ComAvatar, ROOM_ICONS, ACTIVITY_TEXTAREA_STYLE, ActionIllustration, HeroIllustration } from "../ui";
import { CHILD_AVATARS, DEFAULT_CHILDREN, DEFAULT_SCHEDULE, ROOM_COLORS, SOS_COLORS, VERBAL_STATUS_OPTIONS } from "../data";

export function FosterHubScreen({ pop, push }) {
  const [openSection, setOpenSection] = useState(null);

  const sections = [
    {
      id: "healthhub",
      color: T.purple,
      title: "HealthHub Access — What To Do Now",
      urgent: true,
      urgentNote: "MSF has acknowledged this gap and is working to fix it. Until then, here are your practical options.",
      content: [
        { heading: "Call the hospital directly", body: "Each hospital has a patient service centre. Call early morning (8–8:30am) for shortest wait times. Ask to be added as the 'primary contact' for appointment notifications — some hospitals can do this with your MSF letter." },
        { heading: "Carry your MSF foster caregiver letter always", body: "This letter identifies you as the child's caregiver under the fostering scheme. Present it at every appointment. Ask each specialist to note you as the contact person in their system." },
        { heading: "Request a patient liaison officer", body: "At KKH, NUH, and SGH, ask to speak with a Medical Social Worker or Patient Relations Officer. They can flag your case and help ensure appointment notifications reach you directly." },
        { heading: "Set up a shared notes document", body: "Create a simple Google Doc or note with all upcoming appointments, test results you've received, and key medical history you've observed. Bring this to every appointment as a substitute for the digital record you cannot access." },
        { heading: "MSF is fixing this", body: "MSF told CNA in 2025 that they are working with MOH to give all foster parents HealthHub access by the second half of 2025. Follow up with your Foster Care Worker for updates." },
      ]
    },
    {
      id: "cda",
      color: T.amber,
      title: "Child Development Account (CDA)",
      urgent: false,
      content: [
        { heading: "What is the CDA?", body: "A special savings account for your foster child's education and healthcare expenses. The government deposits a First Step Grant and co-matches your savings up to a cap — money your child is entitled to." },
        { heading: "If the CDA has not been set up", body: "Contact your Foster Care Worker immediately. Push for this to be set up as soon as possible — every month of delay is lost government co-matching. The Foster Care Worker can escalate to MSF on your behalf." },
        { heading: "If the account was set up but details went to biological parents", body: "Ask your Foster Care Worker to retrieve the account details from the biological parents through the formal MSF channel. Do not contact the biological parents directly — let the Foster Care Worker facilitate." },
        { heading: "What you can use CDA funds for", body: "Approved uses include early intervention programmes (EIPIC), therapy sessions, special education school fees, assistive technology, and medical appointments. Keep all receipts." },
      ]
    },
    {
      id: "parentsgateway",
      color: T.teal,
      title: "Parents Gateway & School Access",
      urgent: false,
      content: [
        { heading: "Ask the school directly", body: "Email or visit the school's General Office. Bring your MSF foster caregiver letter. Ask to be added as the primary contact in the school system. Schools can override the system — they just need to know you are the active caregiver." },
        { heading: "Request to be added to Parents Gateway", body: "The school administrator can add you manually. This is not automatic — you must ask. Be specific: 'I am the foster caregiver and I need to be added to Parents Gateway and set as the primary contact for all school communications.'" },
        { heading: "If biological parents remain primary contact", body: "Ask the school to add you as a second contact so you receive all the same notifications. Some schools will do this without removing the biological parents — which may be appropriate if reunification is the goal." },
        { heading: "What you might be missing", body: "If you are not on Parents Gateway: consent forms for school activities, medical consent forms, fee payment notices, school event announcements, emergency notifications. All of these go only to the listed contacts." },
      ]
    },
    {
      id: "appointments",
      color: T.green,
      title: "Navigating Medical Appointments",
      urgent: false,
      content: [
        { heading: "What to bring to every appointment", body: "Your MSF foster caregiver letter, a written summary of behaviours and symptoms you have observed, any test results you have physical copies of, and a list of current medications." },
        { heading: "Script for introducing yourself to doctors", body: "Say to the doctor: I am the foster caregiver for this child under the MSF fostering scheme. I do not have HealthHub access but I provide daily care. Please add me as the contact for all future appointment notifications and test results. Here is my MSF caregiver letter." },
        { heading: "If both you and biological parents are present", body: "You have the right to be there as the active caregiver. If you feel uncomfortable, speak to a Medical Social Worker at the hospital before the appointment. You can request separate appointments where clinically appropriate." },
        { heading: "Documenting what you observe", body: "Keep a simple daily log of behaviours, sleep patterns, eating, meltdowns, and communication changes. This is your medical record substitute. Doctors — especially for non-verbal children — rely heavily on caregiver observation reports." },
      ]
    },
    {
      id: "subsidies",
      color: "#8B5CF6",
      title: "Subsidies & Financial Support for Foster Families",
      urgent: false,
      content: [
        { heading: "Fostering Allowance", body: "MSF provides SGD $1,100–$1,800/month depending on the child's age and needs. This is meant to cover childcare and out-of-pocket expenses. If your foster child has significant special needs, ask your Foster Care Worker about enhanced allowance options." },
        { heading: "EIPIC", body: "Foster children aged 6 and below with developmental needs are eligible for EIPIC (Early Intervention Programme). Fees after subsidy can be as low as $5/month. Ask your Foster Care Worker to facilitate the referral — you may need MSF's help since the child is in the fostering system." },
        { heading: "Assistive Technology Fund (ATF)", body: "Covers up to 90% of approved assistive devices — communication apps, AAC devices, sensory tools. Lifetime cap of $40,000. Requires a professional recommendation. Ask your Foster Care Worker to help you apply." },
        { heading: "MediFund Junior", body: "If your foster child has outstanding medical bills that subsidies do not fully cover, ask to speak to a Medical Social Worker at the hospital to apply for MediFund Junior as a safety net." },
        { heading: "ComCare", body: "If you are facing financial hardship as a foster caregiver, ComCare can provide additional support. Visit your nearest Social Service Office — no appointment needed." },
      ]
    },
    {
      id: "support",
      color: T.green,
      title: "Support Organisations for Foster Parents",
      urgent: false,
      content: [
        { heading: "Home for Good Singapore", body: "The main charity supporting foster families in Singapore. Programmes include Buddy for Good (trained befrienders) and Mentor for Good (experienced foster parents paired with newer ones). Contact: hfg.org.sg" },
        { heading: "MSF Foster Care Hotline", body: "1800-222-0000 (Mon–Fri 9am–6pm). For urgent foster care concerns, ask to speak with your assigned Foster Care Worker directly." },
        { heading: "Community Chapters", body: "Home for Good runs regular community gatherings for foster families. These are invaluable — other foster parents are the most practical source of advice for navigating the system." },
        { heading: "Bonda Community", body: "In the Community tab, look for the Singapore Resources room — share what has worked for you and ask other parents for advice. You are not the only one navigating this." },
      ]
    },
  ];

  return (
    <Page>

      <div style={{ background: T.ink, borderRadius: T.rL, padding: 22, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M13 23 C13 23 3 16.5 3 9.5 C3 6 5.5 3.5 8.5 3.5 C10.5 3.5 12 4.5 13 6.5 C14 4.5 15.5 3.5 17.5 3.5 C20.5 3.5 23 6 23 9.5 C23 16.5 13 23 13 23Z" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.15"/>
            </svg>
          </div>
          <div>
            <p style={{ margin: "0 0 2px", color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>For Foster Caregivers</p>
            <p style={{ margin: 0, color: "white", fontSize: 18, fontWeight: 800 }}>Foster Parent Hub</p>
          </div>
        </div>
        <p style={{ margin: "0 0 14px", color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.7 }}>You are doing one of the most demanding jobs in Singapore's child welfare system — often without the digital access that biological parents take for granted. This hub is built for you.</p>
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: T.r, padding: "10px 14px" }}>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 700, lineHeight: 1.6 }}>💛 MSF acknowledged in 2025 that HealthHub access for foster parents is a gap they are actively fixing. Until then — Bonda is here.</p>
        </div>
      </div>


      <div style={{ background: T.redL, borderRadius: T.r, padding: "12px 14px", marginBottom: 20, border: `1.5px solid ${T.red}25`, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: T.red, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 3 L5 5.5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/><circle cx="5" cy="7.5" r="0.8" fill="white"/></svg>
        </div>
        <p style={{ margin: 0, color: T.red, fontSize: 12, fontWeight: 700, lineHeight: 1.65 }}>If you have lost HealthHub access for your foster child — you are not alone. This was raised in Parliament in April 2025. Tap "HealthHub Access" below for what to do right now.</p>
      </div>


      <Card onClick={() => push("carerLetter")} style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: T.purpleL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 3.5 H15 V14.5 H3 Z" stroke={T.purple} strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
            <path d="M5.5 7 H12.5 M5.5 9.5 H12.5 M5.5 12 H9.5" stroke={T.purple} strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 2px", fontWeight: 800, color: T.ink, fontSize: 14 }}>Generate Foster Carer Letter</p>
          <p style={{ margin: 0, color: T.inkSoft, fontSize: 12, lineHeight: 1.5 }}>Auto-filled with your child's details — export a ready-to-print PDF.</p>
        </div>
        <span style={{ color: T.purple, fontSize: 18 }}>→</span>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sections.map(sec => (
          <Card key={sec.id} style={{ padding: 0, overflow: "hidden" }}>
            <div onClick={() => setOpenSection(openSection === sec.id ? null : sec.id)}
              style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: openSection === sec.id ? sec.color + "10" : T.surface }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: sec.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${sec.color}22` }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="6.5" stroke={sec.color} strokeWidth="1.4" fill={sec.color} fillOpacity="0.12"/>
                  <circle cx="9" cy="9" r="2.5" fill={sec.color} opacity="0.7"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 800, color: openSection === sec.id ? sec.color : T.ink, fontSize: 14 }}>{sec.title}</p>
                {sec.urgent && <Badge color={T.red} bg={T.redL}>Action needed</Badge>}
              </div>
              <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 20, transform: openSection === sec.id ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block", flexShrink: 0 }}>+</span>
            </div>
            {openSection === sec.id && (
              <div style={{ padding: "0 16px 16px" }}>
                {sec.urgentNote && (
                  <div style={{ background: T.amberL, borderRadius: T.r, padding: "10px 12px", marginBottom: 14, border: `1px solid ${T.amber}25` }}>
                    <p style={{ margin: 0, color: T.amber, fontSize: 12, fontWeight: 700, lineHeight: 1.6 }}>💡 {sec.urgentNote}</p>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {sec.content.map((item, i) => (
                    <div key={i} style={{ padding: "12px 14px", background: T.canvas, borderRadius: T.r, borderLeft: `3px solid ${sec.color}` }}>
                      <p style={{ margin: "0 0 6px", fontWeight: 800, color: T.ink, fontSize: 13 }}>{item.heading}</p>
                      <p style={{ margin: 0, color: T.inkSoft, fontSize: 13, lineHeight: 1.7 }}>{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 20, padding: "14px 16px", background: T.purpleL, borderRadius: T.r, border: `1px solid ${T.purple}20` }}>
        <p style={{ margin: "0 0 6px", fontWeight: 800, color: T.purple, fontSize: 13 }}>You are not just a caregiver. You are an advocate.</p>
        <p style={{ margin: 0, color: T.inkSoft, fontSize: 12, lineHeight: 1.7 }}>Every system access you fight for, every appointment you track, every piece of information you document — you are doing it for a child who cannot do it themselves. That matters.</p>
      </div>
    </Page>
  );
}
