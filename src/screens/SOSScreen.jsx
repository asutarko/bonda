import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge, Btn, Input, TextArea, Avatar, Accordion, AvatarIllustrations, ChildAvatar, ComAvatar, ROOM_ICONS, ACTIVITY_TEXTAREA_STYLE, ActionIllustration, HeroIllustration } from "../ui";
import { CHILD_AVATARS, DEFAULT_CHILDREN, DEFAULT_SCHEDULE, ROOM_COLORS, SOS_COLORS, VERBAL_STATUS_OPTIONS } from "../data";

export function SOSScreen({ pop, account }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...row} = editing
  const isAdmin = account?.role === "admin";

  const loadContacts = async () => {
    setLoading(true);
    const { data } = await supabase.from("sos_contacts").select("*").order("sort_order").order("created_at");
    setContacts(data || []);
    setLoading(false);
  };

  useEffect(() => { loadContacts(); }, []);

  const saveContact = async () => {
    const c = editing;
    if (!c?.label?.trim() || !c?.number?.trim()) return;
    const payload = { icon: (c.icon || "📞").trim(), label: c.label.trim(), number: c.number.trim(), type: (c.type || "").trim(), color_key: c.color_key || "purple" };
    if (c.id) {
      await supabase.from("sos_contacts").update(payload).eq("id", c.id);
    } else {
      await supabase.from("sos_contacts").insert({ ...payload, created_by: account.id, sort_order: contacts.length });
    }
    setEditing(null);
    await loadContacts();
  };

  const deleteContact = async id => {
    await supabase.from("sos_contacts").delete().eq("id", id);
    await loadContacts();
  };

  return (
    <Page>
      <h2 style={{ margin: "0 0 6px", color: T.ink, fontSize: 22, fontWeight: 800 }}>Emergency Contacts</h2>
      <p style={{ margin: "0 0 6px", color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Singapore government and specialist contacts for autism and caregiver support.</p>
      <div style={{ background: T.redL, borderRadius: T.r, padding: "12px 14px", marginBottom: 24, border: `1px solid ${T.red}20` }}>
        <p style={{ margin: 0, color: T.red, fontWeight: 800, fontSize: 13 }}>You don't have to do this alone. Every contact below is there for you. 💛</p>
      </div>

      {isAdmin && (
        <div style={{ marginBottom: 16 }}>
          {editing ? (
            <Card>
              <Input placeholder="Icon (emoji)" value={editing.icon ?? "📞"} onChange={e => setEditing(c => ({ ...c, icon: e.target.value }))} />
              <Input placeholder="Name (e.g. Autism Resource Centre)" value={editing.label || ""} onChange={e => setEditing(c => ({ ...c, label: e.target.value }))} />
              <Input placeholder="Phone number" value={editing.number || ""} onChange={e => setEditing(c => ({ ...c, number: e.target.value }))} />
              <Input placeholder="Type (e.g. Autism Specialist)" value={editing.type || ""} onChange={e => setEditing(c => ({ ...c, type: e.target.value }))} />
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {Object.entries(SOS_COLORS).map(([key, sc]) => {
                  const active = (editing.color_key || "purple") === key;
                  return <button key={key} onClick={() => setEditing(c => ({ ...c, color_key: key }))} style={{ width: 28, height: 28, borderRadius: "50%", background: sc.color, border: active ? `2.5px solid ${T.ink}` : "2.5px solid transparent", cursor: "pointer" }} />;
                })}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={saveContact} style={{ flex: 1, padding: "10px" }}>{editing.id ? "Save" : "Add"}</Btn>
                <Btn onClick={() => setEditing(null)} secondary style={{ flex: 1, padding: "10px" }}>Cancel</Btn>
              </div>
            </Card>
          ) : (
            <Btn onClick={() => setEditing({})} secondary full>+ Add Emergency Contact</Btn>
          )}
        </div>
      )}

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
                  {isAdmin && (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => setEditing(c)} style={{ background: "none", border: "none", color: T.purple, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: T.fontBody, padding: 0 }}>Edit</button>
                      <button onClick={() => deleteContact(c.id)} style={{ background: "none", border: "none", color: T.red, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: T.fontBody, padding: 0 }}>Delete</button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Page>
  );
}
