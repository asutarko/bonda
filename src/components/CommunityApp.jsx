import React, { useState, useEffect, useRef } from "react";
import {
  Users, Plus, Heart, MapPin, MessageSquare, Camera, ChevronRight,
  ChevronLeft, X, Send, Link2, Image as ImageIcon, Video, Search,
  Check, QrCode, Copy, UserPlus, MoreVertical, Settings,
} from "lucide-react";

// Bonda tokens
const c = {
  canvas: "#F4F1EB",
  card: "#FFFFFF",
  ink: "#23201C",
  ink70: "rgba(35,32,28,.70)",
  ink55: "rgba(35,32,28,.55)",
  ink40: "rgba(35,32,28,.40)",
  line: "rgba(35,32,28,.12)",
  lineStrong: "rgba(35,32,28,.20)",
  teal: "#3E6E6A",
  tealPress: "#345F5B",
};
const tones = {
  teal: { bg: "#E6EDEC", tx: "#2E5A56" },
  blue: { bg: "#E4ECF3", tx: "#3A5A78" },
  rose: { bg: "#F3E7EA", tx: "#7A4651" },
  violet: { bg: "#EDE8F3", tx: "#574B78" },
  indigo: { bg: "#E8EAF3", tx: "#444B78" },
  slate: { bg: "#E9EAEC", tx: "#474C52" },
};
const title = { fontFamily: '"Fraunces", Georgia, serif' };
const body = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' };

const iconFor = { heart: Heart, pin: MapPin, chat: MessageSquare, users: Users };

export default function CommunityApp() {
  const [screen, setScreen] = useState("home"); // home | group | createGroup | shareMoment | contacts | chat
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState("");

  const [groups, setGroups] = useState([
    { id: "foster", name: "Foster Parents", sub: "HealthHub, CDA, the system", icon: "heart", tone: "rose", members: 128, faces: [{ initials: "A", tone: "rose" }, { initials: "K", tone: "violet" }, { initials: "S", tone: "slate" }] },
    { id: "sg", name: "Singapore Resources", sub: "Subsidies, schools, therapists", icon: "pin", tone: "teal", members: 342, faces: [{ initials: "W", tone: "blue" }, { initials: "M", tone: "teal" }, { initials: "P", tone: "indigo" }] },
    { id: "parents", name: "Parent Community", sub: "Open chat for all parents", icon: "chat", tone: "blue", members: 1204, faces: [{ initials: "S", tone: "slate" }, { initials: "J", tone: "rose" }, { initials: "D", tone: "blue" }] },
  ]);
  const [moments, setMoments] = useState([
    { id: "aisha", label: "Aisha", name: "Aisha Rahman", initials: "A", tone: "rose", sub: "Bedok · 2h ago", caption: "First day at the new playgroup — she loved it." },
    { id: "wei", label: "Wei Ming", name: "Wei Ming", initials: "W", tone: "blue", sub: "Punggol · 4h ago", caption: "Morning walk before the heat kicks in." },
    { id: "kumar", label: "Kumar", name: "Kumar Nair", initials: "K", tone: "violet", sub: "Toa Payoh · 6h ago", caption: "Therapy session went really well today." },
    { id: "mei", label: "Mei Ling", name: "Mei Ling", initials: "M", tone: "teal", sub: "Tampines · 8h ago", caption: "Home-cooked lunch for the little one." },
    { id: "ravi", label: "Ravi", name: "Ravi Menon", initials: "R", tone: "indigo", sub: "Yishun · 10h ago", caption: "Weekend at the park with the kids." },
    { id: "grace", label: "Grace", name: "Grace Lim", initials: "G", tone: "slate", sub: "Clementi · 12h ago", caption: "Grateful for this community today." },
  ]);
  const [posts, setPosts] = useState({
    foster: [
      { id: 1, author: "Aisha Rahman", initials: "A", tone: "rose", text: "Just got our HealthHub subsidy approved. Happy to walk anyone through the forms — it took me two tries." },
      { id: 2, author: "Kumar Nair", initials: "K", tone: "violet", text: "Anyone been to the therapy centre in Toa Payoh? Looking for a speech therapist for my son." },
    ],
    sg: [
      { id: 1, author: "Wei Ming", initials: "W", tone: "blue", text: "Baby Bonus and CDA explained in plain words here: it matched everything I got at the clinic." },
    ],
    parents: [
      { id: 1, author: "Sarah Tan", initials: "S", tone: "slate", text: "Good morning everyone. Sending strength to whoever needs it today." },
    ],
  });

  const [contacts, setContacts] = useState([
    { id: "aisha", name: "Aisha Rahman", place: "Bedok", initials: "A", tone: "rose" },
    { id: "wei", name: "Wei Ming", place: "Punggol", initials: "W", tone: "blue" },
    { id: "kumar", name: "Kumar Nair", place: "Toa Payoh", initials: "K", tone: "violet" },
    { id: "sarah", name: "Sarah Tan", place: "Jurong", initials: "S", tone: "slate" },
  ]);
  const [chats, setChats] = useState({});

  const discover = [
    { id: "playgroup", name: "East Side Playgroup", icon: "users", tone: "violet", members: 820, faces: [{ initials: "L", tone: "rose" }, { initials: "N", tone: "blue" }, { initials: "T", tone: "slate" }] },
    { id: "special", name: "Special Needs Support", icon: "heart", tone: "indigo", members: 5400, faces: [{ initials: "M", tone: "teal" }, { initials: "R", tone: "violet" }, { initials: "P", tone: "blue" }] },
    { id: "newborn", name: "Newborn Parents", icon: "chat", tone: "slate", members: 2100, faces: [{ initials: "J", tone: "rose" }, { initials: "D", tone: "indigo" }, { initials: "F", tone: "teal" }] },
    { id: "single", name: "Single Parents SG", icon: "users", tone: "blue", members: 640, faces: [{ initials: "B", tone: "slate" }, { initials: "H", tone: "rose" }, { initials: "C", tone: "violet" }] },
  ];

  const [activeGroup, setActiveGroup] = useState(null);
  const [activeContact, setActiveContact] = useState(null);
  const [draft, setDraft] = useState("");

  // create-group form
  const [gName, setGName] = useState("");
  const [gSub, setGSub] = useState("");
  const [gTone, setGTone] = useState("teal");
  // share-moment form
  const [mCaption, setMCaption] = useState("");
  // moment viewer + follow-by-code
  const [viewingMoment, setViewingMoment] = useState(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [allowFollowers, setAllowFollowers] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [contactQuery, setContactQuery] = useState("");
  const [memberQuery, setMemberQuery] = useState("");

  const isFollowing = (id) => contacts.some((ct) => ct.id === id);
  function addFollow(p) {
    if (isFollowing(p.id)) return;
    setContacts((cs) => [...cs, { id: p.id, name: p.name || p.label, place: p.place || (p.sub || "").split(" · ")[0] || "Following", initials: p.initials, tone: p.tone }]);
    flash(`Following ${p.label || p.name}`);
  }
  function unfollow(p) {
    setContacts((cs) => cs.filter((ct) => ct.id !== p.id));
    flash(`Unfollowed ${p.label || p.name}`);
  }
  const followed = moments.filter((m) => isFollowing(m.id));

  const scrollRef = useRef(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [screen]);

  function flash(msg) {
    setToast(msg);
    window.clearTimeout(flash._t);
    flash._t = window.setTimeout(() => setToast(""), 2200);
  }

  function go(next) { setSheetOpen(false); setScreen(next); }

  function openGroup(g) { setActiveGroup(g); setDraft(""); setScreen("group"); }
  function openChat(ct) { setActiveContact(ct); setDraft(""); setScreen("chat"); }

  function sendPost() {
    const t = draft.trim();
    if (!t || !activeGroup) return;
    setPosts((p) => ({
      ...p,
      [activeGroup.id]: [...(p[activeGroup.id] || []), { id: Date.now(), author: "You", initials: "Y", tone: "teal", text: t }],
    }));
    setDraft("");
  }
  function sendMsg() {
    const t = draft.trim();
    if (!t || !activeContact) return;
    setChats((ch) => ({ ...ch, [activeContact.id]: [...(ch[activeContact.id] || []), { from: "me", text: t }] }));
    setDraft("");
  }
  function createGroup() {
    const name = gName.trim();
    if (!name) return;
    const id = "g" + Date.now();
    setGroups((gs) => [{ id, name, sub: gSub.trim() || "New group", icon: "users", tone: gTone, members: 1 }, ...gs]);
    setPosts((p) => ({ ...p, [id]: [] }));
    setGName(""); setGSub(""); setGTone("teal");
    flash("Group created");
    setScreen("home");
  }
  function shareMoment() {
    setMoments((m) => [{ id: "m" + Date.now(), label: "You", initials: "Y", tone: "teal" }, ...m]);
    setMCaption("");
    flash("Moment shared");
    setScreen("home");
  }

  // ---------- shared bits ----------
  const StatusBar = () => (
    <div style={{ ...body, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 18px 4px", fontSize: 13, fontWeight: 600, color: c.ink }}>
      <span>9:41</span>
      <span style={{ display: "flex", gap: 6, color: c.ink70 }}>
        <span style={{ fontSize: 11, letterSpacing: 1 }}>▮▮▮</span>
        <span style={{ fontSize: 11 }}>Wi-Fi</span>
        <span style={{ fontSize: 11 }}>100%</span>
      </span>
    </div>
  );

  const Avatar = ({ initials, tone, size = 40 }) => (
    <div style={{ width: size, height: size, borderRadius: "50%", flex: "0 0 auto", background: tones[tone].bg, color: tones[tone].tx, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: size * 0.34 }}>{initials}</div>
  );

  const BackHeader = ({ label, onBack, right }) => (
    <div style={{ background: c.card, borderBottom: `1px solid ${c.line}`, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
      <button onClick={onBack} aria-label="Back" style={btnPlain}><ChevronLeft size={26} color={c.teal} /></button>
      <span style={{ ...title, fontSize: 20, fontWeight: 600, color: c.ink, flex: 1 }}>{label}</span>
      {right}
    </div>
  );

  // ---------- screens ----------
  function Home() {
    return (
      <>
        <div style={{ background: c.card, borderBottom: `1px solid ${c.line}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={22} color={c.ink} />
            <span style={{ ...title, fontSize: 24, fontWeight: 600, color: c.ink }}>Communities</span>
          </span>
          <button onClick={() => setSheetOpen(true)} aria-label="Start something new" style={{ ...btnPlain, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: c.teal }}>
            <Plus size={26} /><span style={{ ...body, fontSize: 13, fontWeight: 600 }}>New</span>
          </button>
        </div>

        <div style={{ padding: "18px 14px 8px" }}>
          <Eyebrow label="Share a moment" onSeeAll={() => setScreen("allMoments")} />
          <div style={{ display: "flex", gap: 15, overflowX: "auto", paddingBottom: 6 }}>
            <button onClick={() => go("shareMoment")} aria-label="Add a moment" style={{ ...btnPlain, ...momentCol }}>
              <span style={{ width: 64, height: 64, borderRadius: "50%", background: c.card, border: `2px dashed ${c.teal}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.teal }}><Camera size={28} /></span>
              <span style={{ ...body, fontSize: 14, color: c.ink70 }}>Add</span>
            </button>
            {followed.map((m) => (
              <button key={m.id} onClick={() => setViewingMoment(m)} style={{ ...btnPlain, ...momentCol }}>
                <span style={{ borderRadius: "50%", border: `3px solid ${c.teal}`, padding: 2 }}><Avatar initials={m.initials} tone={m.tone} size={58} /></span>
                <span style={{ ...body, fontSize: 14, color: c.ink70 }}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "14px 14px 6px" }}>
          <Eyebrow label="Groups" onSeeAll={() => setScreen("allGroups")} />
          {groups.map((g) => {
            const Ico = iconFor[g.icon];
            return (
              <button key={g.id} onClick={() => openGroup(g)} style={{ ...btnPlain, width: "100%", textAlign: "left", background: c.card, border: `1px solid ${c.line}`, borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
                <span style={{ width: 48, height: 48, borderRadius: 12, flex: "0 0 auto", background: tones[g.tone].bg, color: tones[g.tone].tx, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico size={24} /></span>
                <span style={{ flex: 1 }}>
                  <span style={{ ...body, display: "block", fontSize: 17, fontWeight: 600, color: c.ink }}>{g.name}</span>
                  <span style={{ ...body, display: "block", fontSize: 14, color: c.ink55, marginTop: 3 }}>{g.sub}</span>
                </span>
                <ChevronRight size={22} color={c.ink40} />
              </button>
            );
          })}
        </div>
      </>
    );
  }

  function GroupScreen() {
    const list = posts[activeGroup?.id] || [];
    return (
      <>
        <BackHeader label={activeGroup?.name} onBack={() => setScreen("home")}
          right={<button onClick={() => setQrOpen(true)} aria-label="Invite to group" style={{ ...btnPlain, color: c.teal, display: "flex", alignItems: "center", gap: 4, fontSize: 14, fontWeight: 600, ...body }}><Link2 size={18} /> Invite</button>} />
        <button onClick={() => { setMemberQuery(""); setScreen("members"); }} style={{ ...btnPlain, ...body, width: "100%", textAlign: "left", padding: "10px 16px", fontSize: 13, color: c.teal, fontWeight: 600, background: c.card, borderBottom: `1px solid ${c.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>{activeGroup?.members} members</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, color: c.ink55, fontWeight: 500 }}>See members <ChevronRight size={16} /></span>
        </button>
        <div style={{ padding: 14 }}>
          {list.map((p) => (
            <div key={p.id} style={{ background: c.card, border: `1px solid ${c.line}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Avatar initials={p.initials} tone={p.tone} size={36} />
                <span style={{ ...body, fontSize: 15, fontWeight: 600, color: c.ink }}>{p.author}</span>
              </div>
              <p style={{ ...body, margin: 0, fontSize: 15, lineHeight: 1.55, color: c.ink70 }}>{p.text}</p>
            </div>
          ))}
          {list.length === 0 && (
            <p style={{ ...body, textAlign: "center", color: c.ink40, fontSize: 14, marginTop: 40 }}>No posts yet. Say hello to get things started.</p>
          )}
        </div>
      </>
    );
  }

  function Composer({ onSend, placeholder }) {
    return (
      <div style={{ background: c.card, borderTop: `1px solid ${c.line}`, padding: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter") onSend(); }}
          style={{ ...body, flex: 1, border: `1px solid ${c.line}`, borderRadius: 999, padding: "12px 16px", fontSize: 15, color: c.ink, outline: "none", background: c.canvas }} />
        <button onClick={onSend} aria-label="Send" style={{ ...btnPlain, width: 44, height: 44, borderRadius: "50%", background: c.teal, color: c.card, display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}><Send size={20} /></button>
      </div>
    );
  }

  function CreateGroup() {
    return (
      <>
        <BackHeader label="Create a group" onBack={() => setScreen("home")} />
        <div style={{ padding: 18 }}>
          <Field label="Group name">
            <input value={gName} onChange={(e) => setGName(e.target.value)} placeholder="Weekend playgroup" style={inputStyle} />
          </Field>
          <Field label="What it's for">
            <input value={gSub} onChange={(e) => setGSub(e.target.value)} placeholder="Meetups, tips, and support" style={inputStyle} />
          </Field>
          <Field label="Colour">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {Object.keys(tones).map((t) => (
                <button key={t} onClick={() => setGTone(t)} aria-label={t} style={{ ...btnPlain, width: 40, height: 40, borderRadius: 12, background: tones[t].bg, border: gTone === t ? `3px solid ${c.teal}` : `1px solid ${c.line}` }} />
              ))}
            </div>
          </Field>
          <button onClick={createGroup} style={{ ...primaryBtn, marginTop: 8 }}>Create group</button>
          <p style={{ ...body, margin: "10px 4px 0", fontSize: 12.5, color: c.ink40, textAlign: "center" }}>You can invite parents right after</p>
        </div>
      </>
    );
  }

  function ShareMoment() {
    return (
      <>
        <BackHeader label="Share a moment" onBack={() => setScreen("home")} />
        <div style={{ padding: 18 }}>
          <div style={{ border: `2px dashed ${c.lineStrong}`, borderRadius: 12, padding: "28px 16px", textAlign: "center", background: c.card }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 28, color: c.teal, marginBottom: 12 }}>
              <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, ...body, fontSize: 13, color: c.ink70 }}><ImageIcon size={30} /> Photo</span>
              <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, ...body, fontSize: 13, color: c.ink70 }}><Video size={30} /> Video</span>
            </div>
            <p style={{ ...body, margin: 0, fontSize: 14, color: c.ink55 }}>Choose a photo or video to share</p>
          </div>
          <div style={{ marginTop: 16 }}>
            <input value={mCaption} onChange={(e) => setMCaption(e.target.value)} placeholder="Add a few words (optional)" style={inputStyle} />
          </div>
          <button onClick={shareMoment} style={{ ...primaryBtn, marginTop: 16 }}>Post moment</button>
          <p style={{ ...body, margin: "10px 4px 0", fontSize: 12.5, color: c.ink40, textAlign: "center" }}>Moments stay visible so friends can see them anytime</p>
        </div>
      </>
    );
  }

  function Contacts() {
    return (
      <>
        <BackHeader label="Message a parent" onBack={() => setScreen("home")} />
        <div style={{ padding: "14px 16px 4px" }}>
          <button onClick={() => flash("Invite link copied")} style={{ ...body, width: "100%", background: c.card, border: `1px solid ${c.line}`, borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: 14 }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: tones.teal.bg, color: tones.teal.tx, display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}><Link2 size={22} /></span>
            <span style={{ textAlign: "left", flex: 1 }}>
              <span style={{ display: "block", fontSize: 16, fontWeight: 600, color: c.ink }}>Invite a parent</span>
              <span style={{ display: "block", fontSize: 13, color: c.ink55, marginTop: 2 }}>Share a link to bring someone in</span>
            </span>
            <ChevronRight size={20} color={c.ink40} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: c.card, border: `1px solid ${c.line}`, borderRadius: 999, padding: "10px 14px", marginBottom: 14 }}>
            <Search size={18} color={c.ink40} />
            <input value={contactQuery} onChange={(e) => setContactQuery(e.target.value)} placeholder="Search parents by name or area"
              style={{ ...body, flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 15, color: c.ink }} />
          </div>
          {contacts.filter((ct) => { const q = contactQuery.trim().toLowerCase(); return !q || ct.name.toLowerCase().includes(q) || (ct.place || "").toLowerCase().includes(q); }).map((ct) => (
            <button key={ct.id} onClick={() => openChat(ct)} style={{ ...btnPlain, width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderBottom: `1px solid ${c.line}` }}>
              <Avatar initials={ct.initials} tone={ct.tone} size={46} />
              <span style={{ flex: 1 }}>
                <span style={{ ...body, display: "block", fontSize: 16, fontWeight: 600, color: c.ink }}>{ct.name}</span>
                <span style={{ ...body, display: "block", fontSize: 13, color: c.ink55, marginTop: 2 }}>{ct.place}</span>
              </span>
              <MessageSquare size={20} color={c.teal} />
            </button>
          ))}
          {contacts.filter((ct) => { const q = contactQuery.trim().toLowerCase(); return !q || ct.name.toLowerCase().includes(q) || (ct.place || "").toLowerCase().includes(q); }).length === 0 && (
            <p style={{ ...body, textAlign: "center", color: c.ink40, fontSize: 14, marginTop: 24 }}>No one matches “{contactQuery}”.</p>
          )}
        </div>
      </>
    );
  }

  function Chat() {
    const msgs = chats[activeContact?.id] || [];
    return (
      <>
        <BackHeader label={activeContact?.name} onBack={() => setScreen("contacts")} />
        <div style={{ padding: 16 }}>
          <p style={{ ...body, textAlign: "center", fontSize: 12.5, color: c.ink40, margin: "0 0 14px" }}>Private · only the two of you can see this</p>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start", marginBottom: 8 }}>
              <span style={{ ...body, maxWidth: "78%", fontSize: 15, lineHeight: 1.5, padding: "10px 14px", borderRadius: 16, background: m.from === "me" ? c.teal : c.card, color: m.from === "me" ? c.card : c.ink70, border: m.from === "me" ? "none" : `1px solid ${c.line}` }}>{m.text}</span>
            </div>
          ))}
          {msgs.length === 0 && <p style={{ ...body, textAlign: "center", color: c.ink40, fontSize: 14, marginTop: 30 }}>Say hello to {activeContact?.name.split(" ")[0]}.</p>}
        </div>
      </>
    );
  }

  function AllGroups() {
    const list = [...groups, ...discover];
    return (
      <>
        <BackHeader label="Groups" onBack={() => setScreen("home")}
          right={<button onClick={() => flash("Search groups")} aria-label="Search" style={btnPlain}><Search size={22} color={c.teal} /></button>} />
        <div style={{ padding: "6px 16px 96px" }}>
          {list.map((g) => {
            const Ico = iconFor[g.icon] || Users;
            const faces = g.faces || defaultFaces;
            return (
              <button key={g.id} onClick={() => openGroup(g)} style={{ ...btnPlain, width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 14, padding: "14px 2px", borderBottom: `1px solid ${c.line}` }}>
                <span style={{ width: 52, height: 52, borderRadius: "50%", flex: "0 0 auto", background: tones[g.tone].bg, color: tones[g.tone].tx, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico size={24} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ ...body, display: "block", fontSize: 16.5, fontWeight: 600, color: c.ink }}>{g.name}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <span style={{ display: "flex" }}>
                      {faces.slice(0, 4).map((f, i) => (
                        <span key={i} style={{ width: 22, height: 22, borderRadius: "50%", background: tones[f.tone].bg, color: tones[f.tone].tx, fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${c.canvas}`, marginLeft: i === 0 ? 0 : -8 }}>{f.initials}</span>
                      ))}
                    </span>
                    <span style={{ ...body, fontSize: 13, color: c.ink55 }}>{g.members ? formatMembers(g.members) : "New group"}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ position: "absolute", bottom: 80, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 15 }}>
          <button onClick={() => go("createGroup")} style={{ ...body, display: "flex", alignItems: "center", gap: 10, background: c.teal, color: c.card, border: "none", borderRadius: 999, padding: "14px 26px", fontSize: 16, fontWeight: 600, cursor: "pointer", boxShadow: "0 8px 24px rgba(35,32,28,.22)" }}>
            <Plus size={20} /> Create group
          </button>
        </div>
      </>
    );
  }

  function AllMoments() {
    return (
      <>
        <BackHeader label="Moments" onBack={() => setScreen("home")}
          right={<button onClick={() => setMenuOpen(true)} aria-label="More options" style={{ ...btnPlain, color: c.ink70, padding: 4 }}><MoreVertical size={24} /></button>} />
        <div style={{ padding: "12px 16px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: c.card, border: `1px solid ${c.line}`, borderRadius: 999, padding: "12px 16px", marginBottom: 16 }}>
            <Search size={18} color={c.ink40} />
            <span style={{ ...body, fontSize: 15, color: c.ink40 }}>Search people</span>
          </div>

          {followed.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, background: c.card, border: `1px solid ${c.line}`, borderRadius: 14, padding: 12, marginBottom: 10 }}>
              <button onClick={() => setViewingMoment(p)} aria-label={`View ${p.label}'s moment`} style={{ ...btnPlain, borderRadius: "50%", border: `2.5px solid ${c.teal}`, padding: 2, flex: "0 0 auto" }}>
                <Avatar initials={p.initials} tone={p.tone} size={48} />
              </button>
              <button onClick={() => setViewingMoment(p)} style={{ ...btnPlain, flex: 1, textAlign: "left", minWidth: 0 }}>
                <span style={{ ...body, display: "block", fontSize: 16, fontWeight: 600, color: c.ink }}>{p.label}</span>
                <span style={{ ...body, display: "block", fontSize: 13, color: c.ink55, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.sub}</span>
              </button>
              <button onClick={() => unfollow(p)} aria-label={`Unfollow ${p.label}`}
                style={{ ...btnPlain, width: 44, height: 44, borderRadius: "50%", flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center", background: c.canvas, color: c.teal, border: `1px solid ${c.line}`, cursor: "pointer" }}>
                <Check size={22} />
              </button>
            </div>
          ))}

          {followed.length === 0 && (
            <p style={{ ...body, textAlign: "center", color: c.ink40, fontSize: 14, margin: "30px 10px" }}>You're not following anyone yet. Share your link or QR from the menu so parents can connect with you.</p>
          )}

          <p style={{ ...body, margin: "16px 6px 0", fontSize: 12.5, color: c.ink40, textAlign: "center", lineHeight: 1.5 }}>People connect inside the app only. Phone numbers are never shared.</p>
        </div>
      </>
    );
  }

  function Members() {
    const list = membersFor(activeGroup?.id);
    const q = memberQuery.trim().toLowerCase();
    const shown = q ? list.filter((m) => m.name.toLowerCase().includes(q) || m.place.toLowerCase().includes(q)) : list;
    return (
      <>
        <BackHeader label="Members" onBack={() => setScreen("group")}
          right={<button onClick={() => setQrOpen(true)} aria-label="Invite to group" style={{ ...btnPlain, color: c.teal, display: "flex", alignItems: "center", gap: 4, fontSize: 14, fontWeight: 600, ...body }}><Link2 size={18} /> Invite</button>} />
        <div style={{ padding: "12px 16px 24px" }}>
          <p style={{ ...body, margin: "0 0 12px", fontSize: 13, color: c.ink55 }}>{activeGroup?.name} · {activeGroup?.members} members</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: c.card, border: `1px solid ${c.line}`, borderRadius: 999, padding: "10px 14px", marginBottom: 14 }}>
            <Search size={18} color={c.ink40} />
            <input value={memberQuery} onChange={(e) => setMemberQuery(e.target.value)} placeholder="Search members"
              style={{ ...body, flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 15, color: c.ink }} />
          </div>

          {!q && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderBottom: `1px solid ${c.line}` }}>
              <Avatar initials="Y" tone="teal" size={46} />
              <span style={{ flex: 1 }}>
                <span style={{ ...body, display: "block", fontSize: 16, fontWeight: 600, color: c.ink }}>You</span>
                <span style={{ ...body, display: "block", fontSize: 13, color: c.ink55, marginTop: 2 }}>Member</span>
              </span>
            </div>
          )}

          {shown.map((m) => {
            const following = isFollowing(m.id);
            return (
              <div key={m.id} onClick={() => openChat(m)} role="button" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderBottom: `1px solid ${c.line}`, cursor: "pointer" }}>
                <Avatar initials={m.initials} tone={m.tone} size={46} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ ...body, display: "block", fontSize: 16, fontWeight: 600, color: c.ink }}>{m.name}</span>
                  <span style={{ ...body, display: "block", fontSize: 13, color: c.ink55, marginTop: 2 }}>{m.place}</span>
                </span>
                <button onClick={(e) => { e.stopPropagation(); following ? unfollow(m) : addFollow(m); }} aria-label={following ? `Unfollow ${m.name}` : `Follow ${m.name}`}
                  style={{ ...btnPlain, ...body, display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: 999, fontSize: 13.5, fontWeight: 600, background: following ? c.canvas : c.teal, color: following ? c.teal : c.card, border: following ? `1px solid ${c.line}` : "none" }}>
                  {following ? <><Check size={16} /> Following</> : <><Plus size={16} /> Follow</>}
                </button>
              </div>
            );
          })}
          {shown.length === 0 && (
            <p style={{ ...body, textAlign: "center", color: c.ink40, fontSize: 14, marginTop: 24 }}>No members match “{memberQuery}”.</p>
          )}
          <p style={{ ...body, margin: "16px 4px 0", fontSize: 12.5, color: c.ink40, lineHeight: 1.5 }}>Tap a name to message. You only see members of groups you've joined — there's no directory of everyone on Bonda.</p>
        </div>
      </>
    );
  }

  const showComposer = screen === "group" || screen === "chat";

  return (
    <div style={{ ...body, minHeight: 560, background: "#E7E2D6", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "24px 0" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        input::placeholder{color:${c.ink40};}
        *::-webkit-scrollbar{width:0;height:0;}`}</style>

      <div style={{ position: "relative", width: 375, height: 760, background: c.canvas, borderRadius: 34, border: `1px solid ${c.lineStrong}`, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 12px 40px rgba(35,32,28,.18)" }}>
        <StatusBar />

        <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {screen === "home" && <Home />}
          {screen === "group" && <GroupScreen />}
          {screen === "createGroup" && <CreateGroup />}
          {screen === "shareMoment" && <ShareMoment />}
          {screen === "contacts" && <Contacts />}
          {screen === "chat" && <Chat />}
          {screen === "allGroups" && <AllGroups />}
          {screen === "allMoments" && <AllMoments />}
          {screen === "members" && <Members />}
        </div>

        {showComposer && (
          screen === "group"
            ? <Composer onSend={sendPost} placeholder="Write a message to the group" />
            : <Composer onSend={sendMsg} placeholder="Type a message" />
        )}

        {!showComposer && (
          <div style={{ background: c.card, borderTop: `1px solid ${c.line}`, display: "flex", justifyContent: "space-around", padding: "11px 0 14px" }}>
            {[
              { ic: Users, label: "Home", key: "h" },
              { ic: Heart, label: "My child", key: "m" },
              { ic: MessageSquare, label: "Schedule", key: "s" },
              { ic: Users, label: "Community", key: "c", active: true },
            ].map((n) => (
              <span key={n.key} onClick={() => setScreen("home")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: n.active ? c.teal : c.ink40, fontWeight: n.active ? 600 : 400, cursor: "pointer" }}>
                <n.ic size={24} /><span style={{ fontSize: 12 }}>{n.label}</span>
              </span>
            ))}
          </div>
        )}

        {/* New action sheet */}
        {sheetOpen && (
          <div onClick={() => setSheetOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(35,32,28,.35)", display: "flex", alignItems: "flex-end", zIndex: 20 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", background: c.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: "10px 16px 22px" }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: c.line, margin: "6px auto 14px" }} />
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ ...title, fontSize: 20, fontWeight: 600, color: c.ink }}>Start something new</span>
                <button onClick={() => setSheetOpen(false)} aria-label="Close" style={btnPlain}><X size={22} color={c.ink40} /></button>
              </div>
              {[
                { ic: Camera, tone: "rose", title: "Share a moment", sub: "Post a photo or video", to: "shareMoment" },
                { ic: Users, tone: "teal", title: "Create a group", sub: "Bring parents together", to: "createGroup" },
                { ic: MessageSquare, tone: "blue", title: "Message a parent", sub: "Start a private chat or invite", to: "contacts" },
              ].map((a) => (
                <button key={a.to} onClick={() => go(a.to)} style={{ ...btnPlain, width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 14, padding: "13px 4px", borderBottom: `1px solid ${c.line}` }}>
                  <span style={{ width: 46, height: 46, borderRadius: 12, background: tones[a.tone].bg, color: tones[a.tone].tx, display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}><a.ic size={22} /></span>
                  <span style={{ flex: 1 }}>
                    <span style={{ ...body, display: "block", fontSize: 16, fontWeight: 600, color: c.ink }}>{a.title}</span>
                    <span style={{ ...body, display: "block", fontSize: 13, color: c.ink55, marginTop: 2 }}>{a.sub}</span>
                  </span>
                  <ChevronRight size={20} color={c.ink40} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Individual moment viewer */}
        {viewingMoment && (
          <div style={{ position: "absolute", inset: 0, background: c.ink, zIndex: 40, display: "flex", flexDirection: "column" }}>
            <div style={{ height: 4, margin: "12px 16px 0", borderRadius: 2, background: "rgba(255,255,255,.35)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px" }}>
              <span style={{ borderRadius: "50%", border: "2px solid rgba(255,255,255,.6)", padding: 2 }}><Avatar initials={viewingMoment.initials} tone={viewingMoment.tone} size={40} /></span>
              <span style={{ flex: 1 }}>
                <span style={{ ...body, display: "block", fontSize: 15, fontWeight: 600, color: "#F4F1EB" }}>{viewingMoment.label}</span>
                <span style={{ ...body, display: "block", fontSize: 12.5, color: "rgba(244,241,235,.7)" }}>{viewingMoment.sub}</span>
              </span>
              <button onClick={() => setViewingMoment(null)} aria-label="Close" style={btnPlain}><X size={24} color="#F4F1EB" /></button>
            </div>

            <div style={{ flex: 1, minHeight: 0, margin: "0 16px", borderRadius: 18, background: `linear-gradient(160deg, ${tones[viewingMoment.tone].bg}, ${tones[viewingMoment.tone].tx})`, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", position: "relative" }}>
                <ImageIcon size={64} color="rgba(255,255,255,.5)" />
                <p style={{ ...body, position: "absolute", left: 16, right: 16, bottom: 16, margin: 0, fontSize: 16, lineHeight: 1.5, color: "#FFFFFF", textShadow: "0 1px 8px rgba(0,0,0,.35)" }}>{viewingMoment.caption}</p>
              </div>
            </div>

            <div style={{ padding: "16px" }}>
              {isFollowing(viewingMoment.id) ? (
                <div style={{ ...body, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 12, background: "rgba(244,241,235,.14)", color: "#F4F1EB", fontSize: 15, fontWeight: 600 }}>
                  <Check size={20} /> In your contacts
                </div>
              ) : (
                <button onClick={() => addFollow(viewingMoment)} style={{ ...body, width: "100%", background: c.teal, color: c.card, border: "none", borderRadius: 12, padding: 15, fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer" }}>
                  <UserPlus size={20} /> Add to contacts
                </button>
              )}
              <p style={{ ...body, margin: "10px 6px 0", fontSize: 12, color: "rgba(244,241,235,.6)", textAlign: "center" }}>Following happens inside the app — no phone numbers shared.</p>
            </div>
          </div>
        )}

        {/* 3-dots menu (Moments options) */}
        {menuOpen && (
          <div onClick={() => setMenuOpen(false)} style={{ position: "absolute", inset: 0, zIndex: 44 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", top: 92, right: 12, width: 216, background: c.card, border: `1px solid ${c.line}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 10px 30px rgba(35,32,28,.18)" }}>
              {[
                { ic: Link2, label: "Share link", onClick: () => { setMenuOpen(false); flash("Link copied"); } },
                { ic: QrCode, label: "QR code", onClick: () => { setMenuOpen(false); setQrOpen(true); } },
                { ic: Settings, label: "Settings", onClick: () => { setMenuOpen(false); setSettingsOpen(true); } },
              ].map((it, i) => (
                <button key={it.label} onClick={it.onClick} style={{ ...btnPlain, ...body, width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", fontSize: 15, fontWeight: 500, color: c.ink, borderTop: i ? `1px solid ${c.line}` : "none" }}>
                  <it.ic size={20} color={c.teal} /> {it.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Moments settings sheet */}
        {settingsOpen && (
          <div onClick={() => setSettingsOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(35,32,28,.35)", display: "flex", alignItems: "flex-end", zIndex: 46 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", background: c.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: "10px 20px 24px" }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: c.line, margin: "6px auto 14px" }} />
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ ...title, fontSize: 20, fontWeight: 600, color: c.ink }}>Moments settings</span>
                <button onClick={() => setSettingsOpen(false)} aria-label="Close" style={btnPlain}><X size={22} color={c.ink40} /></button>
              </div>
              <ToggleRow label="Allow new followers" sub="Let parents follow you from your link or QR" on={allowFollowers} onToggle={() => setAllowFollowers((v) => !v)} />
              <ToggleRow label="Show location on my moments" sub="Display your area, like “Bedok”, on posts" on={showLocation} onToggle={() => setShowLocation((v) => !v)} />
              <p style={{ ...body, margin: "14px 4px 0", fontSize: 12.5, color: c.ink40, lineHeight: 1.5 }}>Your phone number is never shown to anyone, and only people you follow back can message you.</p>
            </div>
          </div>
        )}

        {/* Share my link / QR sheet */}
        {qrOpen && (
          <div onClick={() => setQrOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(35,32,28,.35)", display: "flex", alignItems: "flex-end", zIndex: 45 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", background: c.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: "10px 20px 24px" }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: c.line, margin: "6px auto 12px" }} />
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ ...title, fontSize: 20, fontWeight: 600, color: c.ink }}>Let people follow you</span>
                <button onClick={() => setQrOpen(false)} aria-label="Close" style={btnPlain}><X size={22} color={c.ink40} /></button>
              </div>
              <p style={{ ...body, margin: "0 0 16px", fontSize: 13.5, color: c.ink55, lineHeight: 1.5 }}>Share this code or link. When they open it in the app, you can follow each other — no phone numbers involved.</p>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <div style={{ padding: 14, background: c.card, border: `1px solid ${c.line}`, borderRadius: 16 }}>
                  <QRCode seed="bonda.app/u/nor" />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: c.canvas, border: `1px solid ${c.line}`, borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
                <Link2 size={18} color={c.ink40} />
                <span style={{ ...body, flex: 1, fontSize: 14, color: c.ink70, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>bonda.app/u/nor</span>
              </div>
              <button onClick={() => { setQrOpen(false); flash("Link copied"); }} style={{ ...body, width: "100%", background: c.teal, color: c.card, border: "none", borderRadius: 12, padding: 15, fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer" }}>
                <Copy size={18} /> Copy my link
              </button>
            </div>
          </div>
        )}

        {toast && (
          <div style={{ position: "absolute", bottom: 92, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 50, pointerEvents: "none" }}>
            <span style={{ ...body, background: c.ink, color: "#F4F1EB", fontSize: 14, fontWeight: 500, padding: "10px 18px", borderRadius: 999 }}>{toast}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// small helpers as components used above
function ToggleRow({ label, sub, on, onToggle }) {
  return (
    <button onClick={onToggle} style={{ ...btnPlain, width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${c.line}` }}>
      <span style={{ flex: 1 }}>
        <span style={{ ...body, display: "block", fontSize: 15.5, fontWeight: 600, color: c.ink }}>{label}</span>
        <span style={{ ...body, display: "block", fontSize: 13, color: c.ink55, marginTop: 2 }}>{sub}</span>
      </span>
      <span style={{ width: 46, height: 28, borderRadius: 999, flex: "0 0 auto", background: on ? c.teal : "rgba(35,32,28,.18)", position: "relative", transition: "background .15s" }}>
        <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left .15s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
      </span>
    </button>
  );
}

function Eyebrow({ label, onSeeAll }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
      <span style={{ ...body, fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: c.teal }}>{label}</span>
      <button onClick={onSeeAll} style={{ ...btnPlain, ...body, fontSize: 13, fontWeight: 600, color: c.teal }}>See all</button>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ ...body, display: "block", fontSize: 13, fontWeight: 600, color: c.ink70, marginBottom: 8 }}>{label}</label>
      {children}
    </div>
  );
}

function formatMembers(n) {
  const label = n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : "" + n;
  return label + " people";
}
const defaultFaces = [{ initials: "Y", tone: "teal" }, { initials: "A", tone: "rose" }, { initials: "K", tone: "violet" }];

const PEOPLE = {
  aisha: { id: "aisha", name: "Aisha Rahman", place: "Bedok", initials: "A", tone: "rose" },
  wei: { id: "wei", name: "Wei Ming", place: "Punggol", initials: "W", tone: "blue" },
  kumar: { id: "kumar", name: "Kumar Nair", place: "Toa Payoh", initials: "K", tone: "violet" },
  sarah: { id: "sarah", name: "Sarah Tan", place: "Jurong", initials: "S", tone: "slate" },
  mei: { id: "mei", name: "Mei Ling", place: "Tampines", initials: "M", tone: "teal" },
  ravi: { id: "ravi", name: "Ravi Menon", place: "Yishun", initials: "R", tone: "indigo" },
  grace: { id: "grace", name: "Grace Lim", place: "Clementi", initials: "G", tone: "slate" },
  lena: { id: "lena", name: "Lena Koh", place: "Bishan", initials: "L", tone: "blue" },
  ahmad: { id: "ahmad", name: "Ahmad Yusof", place: "Woodlands", initials: "A", tone: "teal" },
  priya: { id: "priya", name: "Priya Devi", place: "Serangoon", initials: "P", tone: "rose" },
  daniel: { id: "daniel", name: "Daniel Ong", place: "Hougang", initials: "D", tone: "indigo" },
};
const GROUP_MEMBERS = {
  foster: ["aisha", "kumar", "sarah", "mei", "ahmad", "priya"],
  sg: ["wei", "grace", "ravi", "lena", "daniel"],
  parents: ["aisha", "wei", "kumar", "sarah", "mei", "ravi", "grace", "lena", "ahmad", "priya", "daniel"],
};
function membersFor(groupId) {
  return (GROUP_MEMBERS[groupId] || []).map((id) => PEOPLE[id]).filter(Boolean);
}

function qrMatrix(seed, n = 25) {
  let h = 2166136261;
  for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  const rand = () => { h = (Math.imul(h, 1103515245) + 12345) >>> 0; return h / 4294967296; };
  const m = Array.from({ length: n }, () => Array(n).fill(false));
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) m[y][x] = rand() > 0.52;
  const finder = (ox, oy) => {
    for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
      const border = x === 0 || x === 6 || y === 0 || y === 6;
      const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
      m[oy + y][ox + x] = border || core;
    }
    for (let y = -1; y <= 7; y++) { if (oy + y < 0 || oy + y >= n) continue; if (ox - 1 >= 0) m[oy + y][ox - 1] = false; if (ox + 7 < n) m[oy + y][ox + 7] = false; }
    for (let x = -1; x <= 7; x++) { if (ox + x < 0 || ox + x >= n) continue; if (oy - 1 >= 0) m[oy - 1][ox + x] = false; if (oy + 7 < n) m[oy + 7][ox + x] = false; }
  };
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
  return m;
}

function QRCode({ seed = "bonda", size = 168 }) {
  const n = 25, m = qrMatrix(seed, n), cell = size / n;
  const rects = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (m[y][x]) rects.push(<rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} rx={cell * 0.22} fill="#23201C" />);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Your follow QR code">
      {rects}
    </svg>
  );
}
const btnPlain = { background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' };
const momentCol = { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: "0 0 auto" };
const inputStyle = { ...body, width: "100%", boxSizing: "border-box", border: `1px solid ${c.line}`, borderRadius: 10, padding: "13px 14px", fontSize: 15, color: c.ink, outline: "none", background: c.card };
const primaryBtn = { ...body, width: "100%", background: c.teal, color: c.card, border: "none", borderRadius: 12, padding: 16, fontSize: 17, fontWeight: 600, cursor: "pointer" };
