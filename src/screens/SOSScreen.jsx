import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge, Btn, Input, TextArea, Avatar, Accordion, AvatarIllustrations, ChildAvatar, ComAvatar, ROOM_ICONS, ACTIVITY_TEXTAREA_STYLE, ActionIllustration, HeroIllustration } from "../ui";
import { CHILD_AVATARS, DEFAULT_CHILDREN, DEFAULT_SCHEDULE, ROOM_COLORS, SOS_COLORS, VERBAL_STATUS_OPTIONS } from "../data";

export function SOSScreen({ pop, account }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadContacts = async () => {
    setLoading(true);
    const { data } = await supabase.from("sos_contacts").select("*").order("sort_order").order("created_at");
    setContacts(data || []);
    setLoading(false);
  };

  useEffect(() => { loadContacts(); }, []);

  return (
    <Page>
      <h2 style={{ margin: "0 0 6px", color: T.ink, fontSize: 22, fontWeight: 800 }}>Emergency Contacts</h2>
      <p style={{ margin: "0 0 6px", color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Singapore government and specialist contacts for autism and caregiver support.</p>
      <div style={{ background: T.redL, borderRadius: T.r, padding: "12px 14px", marginBottom: 24, border: `1px solid ${T.red}20` }}>
        <p style={{ margin: 0, color: T.red, fontWeight: 800, fontSize: 13 }}>You don't have to do this alone. Every contact below is there for you. 💛</p>
      </div>

      {loading ? (
        <p style={{ margin: 0, color: T.inkSoft, fontSize: 13 }}>Loading contacts...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {contacts.map(c => {
            const sc = SOS_COLORS[c.color_key] || SOS_COLORS.purple;
            return (
              <Card key={c.id} accent={sc.color}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: sc.color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${sc.color}20`, fontSize: 18 }}>
                    {c.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 2px", fontWeight: 800, color: T.ink, fontSize: 13 }}>{c.label}</p>
                    <Badge color={sc.color} bg={sc.color + "15"}>{c.type}</Badge>
                  </div>
                  <a href={`tel:${c.number.replace(/\s/g, "")}`} style={{ background: sc.color, color: "white", borderRadius: T.r, padding: "8px 12px", textDecoration: "none", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>📞 Call</a>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <p style={{ margin: 0, color: T.inkMuted, fontSize: 12, fontWeight: 600 }}>{c.number}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Page>
  );
}
