import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge, Btn, Input, TextArea, Avatar, Accordion, PageHero, AvatarIllustrations, ChildAvatar, ComAvatar, ROOM_ICONS, ACTIVITY_TEXTAREA_STYLE, ActionIllustration, HeroIllustration } from "../ui";
import { CHILD_AVATARS, DEFAULT_CHILDREN, DEFAULT_SCHEDULE, ROOM_COLORS, SOS_COLORS, VERBAL_STATUS_OPTIONS } from "../data";
import { forceSignOut } from "../hooks";

export function ChatUI({ msgs, input, setInput, onSend, onDelete, loading, color, bg, backFn, icon, label, sub, isGroup, account, dmPartner, endRef }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)" }}>
      <div style={{ padding: "0 18px 12px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={backFn} style={{ background: "none", border: "none", color: T.purple, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: T.fontBody, padding: 0, flexShrink: 0 }}>←</button>
        <div style={{ background: bg, borderRadius: T.r, padding: "8px 14px", flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 800, color, fontSize: 14 }}>{icon} {label}</p>
          <p style={{ margin: 0, color: T.inkMuted, fontSize: 11 }}>{sub}</p>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && <p style={{ textAlign: "center", color: T.inkMuted, padding: 24, fontSize: 14 }}>Loading...</p>}
        {!loading && msgs.length === 0 && <div style={{ textAlign: "center", padding: "48px 20px" }}><div style={{ fontSize: 40, marginBottom: 12 }}>💬</div><p style={{ fontWeight: 700, color: T.ink, fontSize: 15 }}>No messages yet</p><p style={{ color: T.inkMuted, fontSize: 13 }}>{isGroup ? "Be the first to post!" : "Start a private conversation!"}</p></div>}
        {msgs.map(msg => {
          const isMe = msg.authorId ? msg.authorId === account.id : msg.author === account.name;
          return (
            <div key={msg.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 8, alignItems: "flex-end" }}>
              {!isMe && <ComAvatar value={msg.avatar} size={32} active={false} />}
              <div style={{ maxWidth: "74%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", gap: 2 }}>
                {!isMe && (
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: T.inkMuted, paddingLeft: 2, display: "flex", alignItems: "center", gap: 5 }}>
                    {msg.author}
                  </p>
                )}
                <div style={{ background: isMe ? color : T.surface, color: isMe ? "white" : T.ink, borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "10px 14px", boxShadow: T.shadow }}>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, wordBreak: "break-word" }}>{msg.text}</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <p style={{ margin: 0, fontSize: 10, color: T.inkMuted }}>{msg.date} · {msg.time}</p>
                  {isMe && <button onClick={() => onDelete(msg.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, color: T.red, fontWeight: 700, fontFamily: T.fontBody, padding: 0 }}>Delete</button>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "10px 18px 6px", background: T.surface, borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, alignItems: "flex-end" }}>
        <ComAvatar value={account.avatar} size={28} active={true} borderColor={bg} />
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }} placeholder="Write a message… (Enter to send)" rows={1} style={{ flex: 1, padding: "9px 13px", borderRadius: T.r, border: `1.5px solid ${T.border}`, fontSize: 14, fontFamily: T.fontBody, color: T.ink, outline: "none", resize: "none", lineHeight: 1.5, background: T.canvas }} />
        <button onClick={onSend} disabled={!input.trim()} style={{ width: 38, height: 38, borderRadius: "50%", background: input.trim() ? color : T.border, border: "none", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, transition: "background 0.2s", color: "white" }}>›</button>
      </div>
      <p style={{ textAlign: "center", color: T.inkMuted, fontSize: 10, margin: "2px 0 4px" }}>{isGroup ? "Visible to all parents · Be kind 💛" : `Private — only you and ${dmPartner?.name}`}</p>
    </div>
  );
}

export function CommunityScreen({ account }) {
  const [view, setView] = useState("home");
  const [dmPremium, setDmPremium] = useState(() => { try { return localStorage.getItem(`cb_premium_${account.name.toLowerCase()}`) === "true"; } catch { return false; } });
  const [showPaywall, setShowPaywall] = useState(false);

  const [activeRoom, setActiveRoom] = useState(null);
  const [groupMsgs, setGroupMsgs] = useState([]); const [groupInput, setGroupInput] = useState(""); const [groupLoading, setGroupLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]); const [dmPartner, setDmPartner] = useState(null);
  const [dmSearch, setDmSearch] = useState(""); const [dmSearchMatches, setDmSearchMatches] = useState(null);
  const [dmMsgs, setDmMsgs] = useState([]); const [dmInput, setDmInput] = useState(""); const [dmLoading, setDmLoading] = useState(false);

  const [rooms, setRooms] = useState([]);
  const [announcement, setAnnouncement] = useState(null);

  const endRef = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [groupMsgs, dmMsgs]);

  useEffect(() => {
    return () => { if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; } };
  }, []);

  const loadRooms = async () => {
    const { data } = await supabase.from("community_rooms").select("*").order("sort_order").order("created_at");
    setRooms(data || []);
  };

  const loadAnnouncement = async () => {
    const { data } = await supabase.from("community_announcements").select("*").order("created_at", { ascending: false }).limit(1);
    setAnnouncement(data?.[0] || null);
  };

  useEffect(() => {
    loadRooms();
    loadAnnouncement();
  }, []);

  const dmKey = (a, b) => { const s = [a, b].sort(); return `dm_${s[0]}_${s[1]}`; };

  const msgFromRow = m => ({ id: m.id, author: m.author_name, avatar: m.author_avatar, authorId: m.author_id, text: m.text, time: new Date(m.created_at).toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" }), date: new Date(m.created_at).toLocaleDateString("en-SG", { day: "numeric", month: "short" }) });

  // Search private messages by content — finds which DM partners have a
  // message matching the search term so they show up even if their name doesn't match.
  useEffect(() => {
    const term = dmSearch.trim();
    if (view !== "dm_list" || !term) { setDmSearchMatches(null); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      const { data } = await supabase.from("messages").select("room")
        .ilike("text", `%${term}%`)
        .or(`room.like.dm_${account.id}_%,room.like.dm_%_${account.id}`)
        .limit(100);
      if (cancelled) return;
      const partnerIds = new Set((data || []).map(m => {
        const [, idA, idB] = m.room.split("_");
        return idA === account.id ? idB : idA;
      }));
      setDmSearchMatches(partnerIds);
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [dmSearch, view, account.id]);

  const leaveRoom = () => { if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; } };

  const openGroup = async room => {
    leaveRoom();
    setActiveRoom(room); setGroupLoading(true); setView("groupchat");
    const { data } = await supabase.from("messages").select("id,author_id,author_name,author_avatar,text,created_at").eq("room", `room_${room.id}`).order("created_at", { ascending: true }).limit(120);
    setGroupMsgs((data || []).map(msgFromRow));
    setGroupLoading(false);
    channelRef.current = supabase.channel(`room_${room.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `room=eq.room_${room.id}` }, p => setGroupMsgs(prev => [...prev, msgFromRow(p.new)].slice(-120)))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages", filter: `room=eq.room_${room.id}` }, p => setGroupMsgs(prev => prev.filter(m => m.id !== p.old.id)))
      .subscribe();
  };

  const sendGroup = async () => {
    const text = groupInput.trim(); if (!text) return;
    setGroupInput("");
    await supabase.from("messages").insert({ room: `room_${activeRoom.id}`, author_id: account.id, author_name: account.name, author_avatar: account.avatar || "none", text });
  };

  const deleteGroup = async id => {
    setGroupMsgs(prev => prev.filter(m => m.id !== id));
    await supabase.from("messages").delete().eq("id", id).eq("author_id", account.id);
  };

  const openDMList = async () => {
    if (!dmPremium) { setShowPaywall(true); return; }
    setView("dm_list");
    const { data, error } = await supabase.from("profiles").select("id, name, avatar, joined");
    setAllUsers(error ? [] : data);
  };

  const openDMChat = async p => {
    leaveRoom();
    setDmPartner(p); setDmLoading(true); setView("dm_chat");
    const key = dmKey(account.id, p.id);
    const { data } = await supabase.from("messages").select("id,author_id,author_name,author_avatar,text,created_at").eq("room", key).order("created_at", { ascending: true }).limit(200);
    setDmMsgs((data || []).map(msgFromRow));
    setDmLoading(false);
    channelRef.current = supabase.channel(key)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `room=eq.${key}` }, p => setDmMsgs(prev => [...prev, msgFromRow(p.new)].slice(-200)))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages", filter: `room=eq.${key}` }, p => setDmMsgs(prev => prev.filter(m => m.id !== p.old.id)))
      .subscribe();
  };

  const sendDM = async () => {
    const text = dmInput.trim(); if (!text) return;
    setDmInput("");
    await supabase.from("messages").insert({ room: dmKey(account.id, dmPartner.id), author_id: account.id, author_name: account.name, author_avatar: account.avatar || "none", text });
  };

  const deleteDM = async id => {
    setDmMsgs(prev => prev.filter(m => m.id !== id));
    await supabase.from("messages").delete().eq("id", id).eq("author_id", account.id);
  };

  const purchase = () => { try { localStorage.setItem(`cb_premium_${account.name.toLowerCase()}`, "true"); } catch {} setDmPremium(true); setShowPaywall(false); setTimeout(openDMList, 300); };

  const Paywall = () => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,26,46,0.7)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: T.surface, borderRadius: T.rXL, padding: 28, maxWidth: 380, width: "100%", boxShadow: T.shadowM }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.purpleL, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: `1.5px solid ${T.purple}25` }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="5" y="13" width="18" height="13" rx="4" stroke={T.purple} strokeWidth="1.6" fill={T.purple} fillOpacity="0.12"/>
            <path d="M9 13 L9 9 Q9 4 14 4 Q19 4 19 9 L19 13" stroke={T.purple} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
            <circle cx="14" cy="19.5" r="2.5" fill={T.purple} opacity="0.7"/>
          </svg>
        </div>
        <p style={{ margin: "0 0 8px", fontWeight: 900, color: T.ink, fontSize: 20, textAlign: "center" }}>Private Messaging</p>
        <p style={{ margin: "0 0 20px", color: T.inkSoft, fontSize: 13, textAlign: "center", lineHeight: 1.6 }}>Chat one-on-one privately with any parent in the Bonda community.</p>
        <div style={{ background: T.purpleL, borderRadius: T.r, padding: "16px", marginBottom: 20, textAlign: "center" }}>
          <p style={{ margin: "0 0 2px", color: T.inkMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>One-Time Purchase</p>
          <p style={{ margin: "0 0 2px", color: T.purple, fontSize: 34, fontWeight: 900 }}>SGD $10</p>
          <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>Lifetime access · Never expires</p>
        </div>
        {[
          { label: "Private one-on-one chat", svg: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3 Q2 1.5 3.5 1.5 L10 1.5 Q11.5 1.5 11.5 3 L11.5 7 Q11.5 8.5 10 8.5 L6 8.5 L4 10.5 L4 8.5 Q2 8.5 2 7 Z" stroke={T.purple} strokeWidth="1.2" fill={T.purple} fillOpacity="0.12"/><path d="M5.5 10 Q5.5 9 6.5 9 L13 9 Q14 9 14 10 L14 13 Q14 14 13 14 L11.5 14 L11.5 15.5 L10 14 L6.5 14 Q5.5 14 5.5 13 Z" stroke={T.purple} strokeWidth="1.1" fill={T.purple} fillOpacity="0.18"/></svg> },
          { label: "Only visible to you and the recipient", svg: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7.5" width="10" height="7" rx="2" stroke={T.purple} strokeWidth="1.2" fill={T.purple} fillOpacity="0.1"/><path d="M5 7.5 L5 5 Q5 2 8 2 Q11 2 11 5 L11 7.5" stroke={T.purple} strokeWidth="1.2" strokeLinecap="round" fill="none"/><circle cx="8" cy="11" r="1.3" fill={T.purple} opacity="0.7"/></svg> },
          { label: "Unlimited conversations", svg: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8 Q4 5.5 8 5.5 Q12 5.5 12 8 Q12 10.5 8 10.5" stroke={T.purple} strokeWidth="1.2" strokeLinecap="round" fill="none"/><path d="M8 10.5 Q4 10.5 4 8" stroke={T.purple} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.45"/><path d="M1.5 8 Q1.5 4.5 4 4" stroke={T.purple} strokeWidth="1" strokeLinecap="round" opacity="0.3"/><path d="M14.5 8 Q14.5 4.5 12 4" stroke={T.purple} strokeWidth="1" strokeLinecap="round" opacity="0.3"/></svg> },
          { label: "Tied to your account forever", svg: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="3" stroke={T.purple} strokeWidth="1.2" fill={T.purple} fillOpacity="0.12"/><path d="M2.5 14.5 Q2.5 11 8 11 Q13.5 11 13.5 14.5" stroke={T.purple} strokeWidth="1.2" strokeLinecap="round" fill="none"/><path d="M10 4.5 L11.5 6 L14 3.5" stroke={T.purple} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/></svg> },
        ].map(({ label, svg }, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: T.purpleL, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${T.purple}15`, flexShrink: 0 }}>{svg}</div>
            <p style={{ margin: 0, color: T.ink, fontSize: 13, fontWeight: 600 }}>{label}</p>
          </div>
        ))}
        <div style={{ background: T.amberL, borderRadius: T.r, padding: "10px 14px", margin: "16px 0" }}>
          <p style={{ margin: 0, color: T.amber, fontSize: 11, fontWeight: 700, lineHeight: 1.6 }}>💡 In the live app this connects to Stripe / PayPal / Apple Pay. Tap below to simulate in this prototype.</p>
        </div>
        <Btn onClick={purchase} full style={{ marginBottom: 10 }}>🔓 Unlock for SGD $10</Btn>
        <Btn onClick={() => setShowPaywall(false)} full secondary>Maybe later</Btn>
      </div>
    </div>
  );

  if (view === "groupchat" && activeRoom) {
    const c = ROOM_COLORS[activeRoom.color_key] || ROOM_COLORS.purple;
    return <div style={{ position: "relative" }}>{showPaywall && <Paywall />}<ChatUI msgs={groupMsgs} input={groupInput} setInput={setGroupInput} onSend={sendGroup} onDelete={deleteGroup} loading={groupLoading} color={c.color} bg={c.bg} backFn={() => { leaveRoom(); setView("home"); }} icon={null} label={activeRoom.label} sub={activeRoom.description} isGroup account={account} dmPartner={null} endRef={endRef} /></div>;
  }
  if (view === "dm_chat" && dmPartner) return <div style={{ position: "relative" }}>{showPaywall && <Paywall />}<ChatUI msgs={dmMsgs} input={dmInput} setInput={setDmInput} onSend={sendDM} onDelete={deleteDM} loading={dmLoading} color={T.purple} bg={T.purpleL} backFn={() => { leaveRoom(); setView("dm_list"); }} icon={dmPartner.avatar} label={dmPartner.name} sub="Private message" isGroup={false} account={account} dmPartner={dmPartner} endRef={endRef} /></div>;

  if (view === "dm_list") {
    const others = allUsers.filter(u => u.id !== account.id);
    const term = dmSearch.trim().toLowerCase();
    const filtered = !term ? others : others.filter(p => p.name.toLowerCase().includes(term) || dmSearchMatches?.has(p.id));
    return (
      <Page>
        {showPaywall && <Paywall />}
        <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: T.purple, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: T.fontBody, padding: "0 0 16px", display: "flex", alignItems: "center", gap: 6 }}>← Back</button>
        <h2 style={{ margin: "0 0 6px", color: T.ink, fontSize: 20, fontWeight: 800 }}>Private Messages</h2>
        <p style={{ margin: "0 0 20px", color: T.inkSoft, fontSize: 14 }}>Choose a parent to message privately</p>
        {others.length > 0 && (
          <div style={{ position: "relative", marginBottom: 16 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, pointerEvents: "none", opacity: 0.5 }}>🔍</span>
            <input value={dmSearch} onChange={e => setDmSearch(e.target.value)} placeholder="Search by name or message..."
              style={{ width: "100%", padding: "11px 14px 11px 38px", borderRadius: T.r, border: `1.5px solid ${T.border}`, fontSize: 14, fontFamily: T.fontBody, color: T.ink, background: T.canvas, outline: "none", boxSizing: "border-box" }} />
          </div>
        )}
        {others.length === 0 ? <div style={{ textAlign: "center", padding: "48px 20px" }}><div style={{ fontSize: 44, marginBottom: 12 }}>👥</div><p style={{ fontWeight: 700, color: T.ink, fontSize: 15 }}>No other parents yet</p><p style={{ color: T.inkMuted, fontSize: 13, lineHeight: 1.6 }}>Once other parents join, they'll appear here.</p></div> :
          filtered.length === 0 ? <div style={{ textAlign: "center", padding: "48px 20px" }}><div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div><p style={{ fontWeight: 700, color: T.ink, fontSize: 15 }}>No matches</p><p style={{ color: T.inkMuted, fontSize: 13, lineHeight: 1.6 }}>No parent name or message matches "{dmSearch.trim()}".</p></div> :
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(p => (
              <Card key={p.id} onClick={() => openDMChat(p)} style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <ComAvatar value={p.avatar} size={44} active={false} borderColor={T.border} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 2px", fontWeight: 800, color: T.ink, fontSize: 14 }}>{p.name}</p>
                    <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>Member since {p.joined}</p>
                  </div>
                  <Badge color={T.purple}>Message</Badge>
                </div>
              </Card>
            ))}
          </div>
        }
      </Page>
    );
  }

  if (view === "home") return (
    <Page>
      {showPaywall && <Paywall />}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: T.ink, borderRadius: T.rL, marginBottom: 24 }}>
        <ComAvatar value={account.avatar} size={44} active={true} borderColor={T.purple} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 1px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Signed in as</p>
          <p style={{ margin: 0, color: "white", fontSize: 16, fontWeight: 800 }}>{account.name}</p>
        </div>
        <button onClick={forceSignOut} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "6px 12px", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody }}>Sign out</button>
      </div>

      {announcement && (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: T.purpleL, borderRadius: T.r, padding: "12px 14px", marginBottom: 16, border: `1px solid ${T.purple}25` }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 2px", color: T.purple, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>📌 Announcement</p>
            <p style={{ margin: 0, color: T.ink, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{announcement.text}</p>
          </div>
        </div>
      )}

      <div style={{ background: T.amberL, borderRadius: T.r, padding: "12px 14px", marginBottom: 24, border: `1px solid ${T.amber}20` }}>
        <p style={{ margin: 0, color: T.amber, fontSize: 12, fontWeight: 700, lineHeight: 1.6 }}>💛 Be kind and supportive. Everyone here is doing their best.</p>
      </div>

      <SectionLabel style={{ marginBottom: 10 }}>Group Rooms</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {rooms.map(r => {
          const c = ROOM_COLORS[r.color_key] || ROOM_COLORS.purple;
          const iconFn = ROOM_ICONS[r.icon_key] || ROOM_ICONS.community;
          return (
            <Card key={r.id} onClick={() => openGroup(r)}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${c.color}20` }}>
                  {iconFn(c.color)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 3px", fontWeight: 800, color: c.color, fontSize: 14 }}>{r.label}</p>
                  <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>{r.description}</p>
                </div>
                <span style={{ color: T.inkMuted, fontSize: 20 }}>›</span>
              </div>
            </Card>
          );
        })}
      </div>

      <SectionLabel style={{ marginBottom: 10 }}>Private Messages</SectionLabel>
      {dmPremium ? (
        /* ── UNLOCKED STATE — elegant, professional ── */
        <Card onClick={openDMList} style={{ background: T.surface, border: `1.5px solid ${T.purple}25`, padding: 0, overflow: "hidden" }}>

          <div style={{ background: T.purpleL, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: T.purple, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">

                <circle cx="7.5" cy="7" r="3" stroke="white" strokeWidth="1.4" fill="white" fillOpacity="0.2"/>
                <path d="M2 17 Q2 13 7.5 13 Q13 13 13 17" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
                <circle cx="16" cy="8" r="2.5" stroke="white" strokeWidth="1.3" fill="white" fillOpacity="0.3"/>
                <path d="M13 18 Q13.5 15 16 15 Q18.5 15 19 17" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.7"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 2px", fontWeight: 800, color: T.purple, fontSize: 15 }}>Message a Parent</p>
              <p style={{ margin: 0, color: T.inkSoft, fontSize: 12 }}>Private · one-on-one · only the two of you can see it</p>
            </div>
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M1.5 1.5 L6.5 7 L1.5 12.5" stroke={T.purple} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div style={{ padding: "14px 16px", display: "flex", gap: 0 }}>
            {[
              {
                label: "100% private",
                icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="4" y="9" width="12" height="9" rx="2.5" stroke={T.purple} strokeWidth="1.4" fill={T.purple} fillOpacity="0.1"/>
                  <path d="M6.5 9 L6.5 6.5 Q6.5 3 10 3 Q13.5 3 13.5 6.5 L13.5 9" stroke={T.purple} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
                  <circle cx="10" cy="13.5" r="1.5" fill={T.purple} opacity="0.7"/>
                </svg>
              },
              {
                label: "Unlimited chats",
                icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6 10 Q6 7 10 7 Q14 7 14 10 Q14 13 10 13" stroke={T.purple} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
                  <path d="M10 13 Q6 13 6 10" stroke={T.purple} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5"/>
                  <path d="M3 10 Q3 6 5.5 6" stroke={T.purple} strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/>
                  <path d="M17 10 Q17 6 14.5 6" stroke={T.purple} strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/>
                </svg>
              },
              {
                label: "Your account",
                icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="7.5" r="3.5" stroke={T.purple} strokeWidth="1.4" fill={T.purple} fillOpacity="0.12"/>
                  <path d="M3.5 17.5 Q3.5 13 10 13 Q16.5 13 16.5 17.5" stroke={T.purple} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
                  <path d="M12.5 6 L14.5 8 L17 5" stroke={T.purple} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
                </svg>
              },
            ].map(({ label, icon }) => (
              <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: T.purpleL, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${T.purple}15` }}>
                  {icon}
                </div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: T.inkMuted, textAlign: "center", lineHeight: 1.4 }}>{label}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        /* ── LOCKED STATE — clear premium prompt ── */
        <Card onClick={openDMList} style={{ background: T.surface }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: T.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🔒</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                <p style={{ margin: 0, fontWeight: 800, color: T.ink, fontSize: 14 }}>Message a Parent</p>
                <Badge color={T.purple}>SGD $10</Badge>
              </div>
              <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>Unlock private 1-on-1 chat · one-time · lifetime access</p>
            </div>
            <span style={{ color: T.inkMuted, fontSize: 20 }}>›</span>
          </div>
        </Card>
      )}
    </Page>
  );

}
