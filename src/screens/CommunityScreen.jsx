import { useState, useEffect, useRef, Fragment } from "react";
import {
  Plus, Camera, Users, MessageSquare, Settings, Link2, Search, Check, X,
  ChevronRight, QrCode, Copy, UserPlus, MoreVertical, Lock,
  Unlock, Send, Pin, Heart, Paperclip, FileText, Bell, BellOff, Globe,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge, Btn, Input, TextArea, Avatar, Accordion, PageHero, AvatarIllustrations, ChildAvatar, ComAvatar, ROOM_ICONS, ACTIVITY_TEXTAREA_STYLE, ActionIllustration, HeroIllustration } from "../ui";
import { CHILD_AVATARS, DEFAULT_CHILDREN, DEFAULT_SCHEDULE, ROOM_COLORS, SOS_COLORS, VERBAL_STATUS_OPTIONS } from "../data";
import { uploadCommunityAttachment, compressImage, classifyCommunityAttachment, MAX_COMMUNITY_ATTACHMENT_BYTES, useBackHandler } from "../hooks";

const isDocAttachment = url => /\.(docx?|xlsx?|pdf)$/i.test(url || "");

// Icon choices offered when creating a group — the same set admins pick
// from for community_rooms (see ROOM_ICONS in ui.jsx).
const GROUP_ICON_KEYS = Object.keys(ROOM_ICONS);

const searchInputStyle = { width: "100%", padding: "11px 14px 11px 38px", borderRadius: T.r, border: `1.5px solid ${T.border}`, fontSize: 14, fontFamily: T.fontBody, color: T.ink, background: T.canvas, outline: "none", boxSizing: "border-box" };

// Display-only preference (see "Translate messages" in Group info) — no
// actual translation happens, this just remembers what the user picked.
const TRANSLATE_LANGUAGES = ["English", "Malay", "Mandarin", "Tamil"];

// Normalizes an admin community_rooms row or a parent-created community_groups
// row into the same shape, so chat/members/invite code doesn't need to care
// which kind of group it's dealing with.
const roomToGroup = r => ({ id: r.id, label: r.label, description: r.description, icon_key: r.icon_key, color_key: r.color_key, topics: r.topics || [], kind: "admin" });
const groupToGroup = g => ({ id: g.id, label: g.name, description: g.description, icon_key: g.icon_key, color_key: g.color_key, topics: g.topics || [], kind: "user" });

// Admin rooms (community_rooms) and parent-created groups (community_groups)
// each need their own join. Their membership rows live in different tables —
// community_group_members.group_id references community_groups, while
// community_room_members.room_id references community_rooms.
const membershipTable = kind => kind === "user" ? "community_group_members" : "community_room_members";
const membershipKey = kind => kind === "user" ? "group_id" : "room_id";

function timeAgo(iso) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

const copyText = async text => {
  try { await navigator.clipboard.writeText(text); } catch {
    // Clipboard API unavailable (older browser / non-HTTPS) — the code is
    // still shown on screen so the user can select and copy it manually.
  }
};

export function ChatUI({ msgs, input, setInput, onSend, onDelete, loading, color, bg, icon, label, sub, isGroup, account, dmPartner, endRef, attachment, onPickAttachment, onRemoveAttachment, attachError, headerRight, belowHeader, onTitleClick, allowAttachments = true }) {
  const avatarEl = isGroup ? (
    <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="7" r="3"/><path d="M2.5 17c0-3.2 2.2-5 5-5s5 1.8 5 5"/><path d="M13.5 12.6c2.4.2 4 1.8 4 4.4"/><path d="M12.6 4.4A2.7 2.7 0 0 1 14.7 9"/></svg>
    </div>
  ) : (
    <ComAvatar value={icon} size={42} active={false} borderColor={T.border} />
  );
  const titleEl = (
    <div style={{ minWidth: 0, flex: 1 }}>
      <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: T.ink }}>{label}</p>
      <p style={{ margin: "2px 0 0", fontSize: 12.5, color: T.inkMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</p>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}>
      <div style={{ padding: "10px 18px 12px", display: "flex", alignItems: "center", gap: 12 }}>
        {onTitleClick ? (
          <button onClick={onTitleClick} style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}>
            {avatarEl}
            {titleEl}
          </button>
        ) : (
          <>
            {avatarEl}
            {titleEl}
          </>
        )}
        {headerRight}
      </div>
      {belowHeader}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && <p style={{ textAlign: "center", color: T.inkMuted, padding: 24, fontSize: 14 }}>Loading...</p>}
        {!loading && msgs.length === 0 && <div style={{ textAlign: "center", padding: "48px 20px" }}><MessageSquare size={40} color={T.inkMuted} style={{ marginBottom: 12 }} /><p style={{ fontWeight: 700, color: T.ink, fontSize: 15 }}>No messages yet</p><p style={{ color: T.inkMuted, fontSize: 13 }}>{isGroup ? "Be the first to post!" : "Start a private conversation!"}</p></div>}
        {msgs.map((msg, i) => {
          const isMe = msg.authorId ? msg.authorId === account.id : msg.author === account.name;
          const showSep = i === 0 || msgs[i - 1].date !== msg.date;
          return (
            <Fragment key={msg.id}>
              {showSep && (
                <p style={{ alignSelf: "center", margin: "2px 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", color: T.inkMuted, background: T.surface, border: `1px solid ${T.border}`, padding: "4px 12px", borderRadius: 999 }}>{msg.date}</p>
              )}
              <div style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 8, alignItems: "flex-end" }}>
              {!isMe && <ComAvatar value={msg.avatar} size={32} active={false} />}
              <div style={{ maxWidth: "74%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", gap: 2 }}>
                {!isMe && (
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: T.inkMuted, paddingLeft: 2, display: "flex", alignItems: "center", gap: 5 }}>
                    {msg.author}
                  </p>
                )}
                <div style={{ background: isMe ? color : T.surface, color: isMe ? "white" : T.ink, borderRadius: isMe ? "18px 18px 6px 18px" : "18px 18px 18px 6px", padding: msg.imageUrl && !isDocAttachment(msg.imageUrl) ? 6 : "10px 14px", boxShadow: T.shadow }}>
                  {msg.imageUrl && (isDocAttachment(msg.imageUrl) ? (
                    <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, color: "inherit", textDecoration: "none" }}>
                      <FileText size={18} />
                      <span style={{ fontSize: 13, fontWeight: 700, wordBreak: "break-word", textDecoration: "underline" }}>{msg.fileName || "Document"}</span>
                    </a>
                  ) : (
                    <img src={msg.imageUrl} alt="" style={{ display: "block", maxWidth: 220, maxHeight: 220, width: "100%", borderRadius: 12, objectFit: "cover" }} />
                  ))}
                  {msg.text && <p style={{ margin: msg.imageUrl && !isDocAttachment(msg.imageUrl) ? "6px 4px 0" : 0, fontSize: 14, lineHeight: 1.6, wordBreak: "break-word" }}>{msg.text}</p>}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <p style={{ margin: 0, fontSize: 10, color: T.inkMuted }}>{msg.time}</p>
                  {isMe && <button onClick={() => onDelete(msg.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, color: T.red, fontWeight: 700, fontFamily: T.fontBody, padding: 0 }}>Delete</button>}
                </div>
              </div>
              </div>
            </Fragment>
          );
        })}
        <div ref={endRef} />
      </div>
      <div style={{ position: "sticky", bottom: 0, background: T.surface, zIndex: 5 }}>
        {attachError && <p style={{ margin: "0 18px 6px", fontSize: 11, color: T.red, fontWeight: 700 }}>{attachError}</p>}
        {allowAttachments && attachment && (
          <div style={{ padding: "0 18px 8px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              {attachment.kind === "image" ? (
                <img src={attachment.url} alt="" style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 10, border: `1.5px solid ${T.border}`, display: "block" }} />
              ) : (
                <div style={{ width: 52, height: 52, borderRadius: 10, border: `1.5px solid ${T.border}`, background: T.canvas, display: "flex", alignItems: "center", justifyContent: "center", color: T.inkMuted }}><FileText size={22} /></div>
              )}
              <button onClick={onRemoveAttachment} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: T.red, color: "white", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={12} /></button>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: T.inkMuted, wordBreak: "break-word" }}>{attachment.kind === "image" ? "Image attached" : attachment.name}</p>
          </div>
        )}
        <div style={{ padding: "10px 12px 6px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, alignItems: "center" }}>
          <ComAvatar value={account.avatar} size={40} active={true} borderColor={bg} />
          {allowAttachments && (
            <label style={{ width: 38, height: 38, borderRadius: "50%", background: "transparent", border: `1.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: T.inkMuted }}>
              <Paperclip size={16} />
              <input type="file" accept="image/*,.doc,.docx,.xls,.xlsx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf" onChange={onPickAttachment} style={{ display: "none" }} />
            </label>
          )}
          <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 22, padding: "0 5px 0 16px" }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }} placeholder="Write a message… (Enter to send)" rows={1} style={{ flex: 1, minWidth: 0, padding: "11px 6px", border: "none", outline: "none", background: "transparent", fontSize: 14, fontFamily: T.fontBody, color: T.ink, resize: "none", lineHeight: 1.5 }} />
            <button onClick={onSend} disabled={!input.trim() && !attachment} style={{ width: 34, height: 34, borderRadius: "50%", background: (input.trim() || attachment) ? color : T.border, border: "none", cursor: (input.trim() || attachment) ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s", color: "white" }}><Send size={16} /></button>
          </div>
        </div>
        {!isGroup && (
          <p style={{ textAlign: "center", color: T.inkMuted, fontSize: 10, margin: "2px 0 4px" }}>{`Private — only you and ${dmPartner?.name}`}</p>
        )}
      </div>
    </div>
  );
}

// Sub-screen header — Literata title, same chrome across every screen pushed
// inside the Community tab (create group, share moment, all groups, all
// moments, members). No back button here — the app-bar back button already
// returns to the right place via the useBackHandler registrations below.
function SubHeader({ title, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <h2 style={{ margin: 0, fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 600, color: T.ink, flex: 1 }}>{title}</h2>
      {right}
    </div>
  );
}

// One row in a groups list — used on Home and in "All groups". Works for
// both admin-curated rooms and parent-created groups (see roomToGroup /
// groupToGroup above).
function GroupRow({ g, onClick }) {
  const c = ROOM_COLORS[g.color_key] || ROOM_COLORS.purple;
  const iconFn = ROOM_ICONS[g.icon_key] || ROOM_ICONS.community;
  return (
    <Card onClick={onClick} style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${c.color}20` }}>
          {iconFn(c.color)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: "0 0 3px", fontWeight: 800, color: c.color, fontSize: 14 }}>{g.label}</p>
          <p style={{ margin: 0, color: T.inkMuted, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.description || (g.kind === "user" ? "Parent-made group" : "")}</p>
        </div>
        {g.kind === "user" && <Badge color={T.inkMuted} bg={T.canvas}>Parent-made</Badge>}
        <ChevronRight size={20} color={T.inkMuted} />
      </div>
    </Card>
  );
}

function ToggleRow({ label, sub, on, onToggle }) {
  return (
    <button onClick={onToggle} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12, padding: "12px 0", background: "none", border: "none", borderBottom: `1px solid ${T.border}`, cursor: "pointer", fontFamily: T.fontBody }}>
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: T.ink }}>{label}</span>
        <span style={{ display: "block", fontSize: 12.5, color: T.inkMuted, marginTop: 2 }}>{sub}</span>
      </span>
      <span style={{ width: 44, height: 26, borderRadius: 99, flexShrink: 0, background: on ? T.purple : T.border, position: "relative", transition: "background .15s" }}>
        <span style={{ position: "absolute", top: 2.5, left: on ? 20 : 2.5, width: 21, height: 21, borderRadius: "50%", background: "#fff", transition: "left .15s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
      </span>
    </button>
  );
}

// Deterministic pseudo-QR pattern — cosmetic only (there's no real deep-link
// target yet), just enough to look like a scannable code next to the copyable
// text link.
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
function QRCode({ seed = "bonda", size = 160 }) {
  const n = 25, m = qrMatrix(seed, n), cell = size / n;
  const rects = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (m[y][x]) rects.push(<rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} rx={cell * 0.22} fill={T.ink} />);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Follow / invite code">
      {rects}
    </svg>
  );
}

export function CommunityScreen({ account }) {
  const [view, setView] = useState("home");
  const [dmPremium, setDmPremium] = useState(() => { try { return localStorage.getItem(`cb_premium_${account.name.toLowerCase()}`) === "true"; } catch { return false; } });
  const [showPaywall, setShowPaywall] = useState(false);

  const [activeRoom, setActiveRoom] = useState(null);
  const [groupMsgs, setGroupMsgs] = useState([]); const [groupInput, setGroupInput] = useState(""); const [groupLoading, setGroupLoading] = useState(false); const [groupAttachment, setGroupAttachment] = useState(null);
  const [allUsers, setAllUsers] = useState([]); const [dmPartner, setDmPartner] = useState(null);
  const [dmSearch, setDmSearch] = useState(""); const [dmSearchMatches, setDmSearchMatches] = useState(null);
  const [dmMsgs, setDmMsgs] = useState([]); const [dmInput, setDmInput] = useState(""); const [dmLoading, setDmLoading] = useState(false); const [dmAttachment, setDmAttachment] = useState(null);
  const [attachError, setAttachError] = useState(null);

  // Picks a file for the chat's attachment preview; each chat (group/DM) keeps its own.
  // Only images and Word/Excel documents are allowed — everything else (video, audio, etc.)
  // is rejected. Images are compressed immediately so the preview and the eventual upload
  // use the same small file.
  const pickAttachment = setter => async e => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const kind = classifyCommunityAttachment(file);
    if (!kind) { setAttachError("Only images or Word/Excel/PDF documents can be attached."); return; }
    if (file.size > MAX_COMMUNITY_ATTACHMENT_BYTES) { setAttachError("File is too large (max 10MB)."); return; }
    setAttachError(null);
    if (kind === "image") {
      const compressed = await compressImage(file);
      setter(prev => { if (prev?.url) URL.revokeObjectURL(prev.url); return { file: compressed, url: URL.createObjectURL(compressed), kind, name: file.name }; });
    } else {
      setter(prev => { if (prev?.url) URL.revokeObjectURL(prev.url); return { file, url: null, kind, name: file.name }; });
    }
  };
  const clearAttachment = (setter, current) => { if (current?.url) URL.revokeObjectURL(current.url); setter(null); };

  const [rooms, setRooms] = useState([]);
  const [groups, setGroups] = useState([]);
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

  const loadGroups = async () => {
    const { data } = await supabase.from("community_groups").select("*").order("created_at", { ascending: false });
    setGroups(data || []);
  };

  const loadAnnouncement = async () => {
    const { data } = await supabase.from("community_announcements").select("*").order("created_at", { ascending: false }).limit(1);
    setAnnouncement(data?.[0] || null);
  };

  // ---- Moments / follows (contacts) ----------------------------------------
  const [followingIds, setFollowingIds] = useState(new Set());
  const [moments, setMoments] = useState([]);
  const [viewingMoment, setViewingMoment] = useState(null);
  const isFollowing = id => followingIds.has(id);

  const loadMoments = async ids => {
    if (!ids.length) { setMoments([]); return; }
    const { data } = await supabase.from("moments").select("*").in("author_id", ids).order("created_at", { ascending: false }).limit(300);
    const seen = new Map();
    (data || []).forEach(m => { if (!seen.has(m.author_id)) seen.set(m.author_id, m); });
    setMoments([...seen.values()]);
  };

  const loadFollows = async () => {
    const { data } = await supabase.from("follows").select("followee_id").eq("follower_id", account.id);
    const ids = (data || []).map(f => f.followee_id);
    setFollowingIds(new Set(ids));
    loadMoments(ids);
  };

  const followUser = async person => {
    const { error } = await supabase.from("follows").insert({ follower_id: account.id, followee_id: person.id });
    if (error) { flash("Could not follow — they may not be accepting new followers."); return; }
    const nextIds = [...followingIds, person.id];
    setFollowingIds(new Set(nextIds));
    flash(`Following ${person.name}`);
    loadMoments(nextIds);
  };
  const unfollowUser = async person => {
    await supabase.from("follows").delete().eq("follower_id", account.id).eq("followee_id", person.id);
    const nextIds = [...followingIds].filter(id => id !== person.id);
    setFollowingIds(new Set(nextIds));
    setMoments(prev => prev.filter(m => m.author_id !== person.id));
    flash(`Unfollowed ${person.name}`);
  };

  useEffect(() => {
    loadRooms();
    loadGroups();
    loadAnnouncement();
    loadFollows();
    supabase.from("profiles").select("allow_followers, show_location_on_moments").eq("id", account.id).single().then(({ data }) => {
      if (data) { setAllowFollowers(data.allow_followers); setShowLocation(data.show_location_on_moments); }
    });
  }, []);

  const dmKey = (a, b) => { const s = [a, b].sort(); return `dm_${s[0]}_${s[1]}`; };

  const msgFromRow = m => ({ id: m.id, author: m.author_name, avatar: m.author_avatar, authorId: m.author_id, text: m.text, imageUrl: m.image_url, fileName: m.file_name, time: new Date(m.created_at).toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" }), date: new Date(m.created_at).toLocaleDateString("en-SG", { day: "numeric", month: "short" }) });

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

  // Per-device group prefs (Group info's Notify/Translate) — no server-side
  // push muting or real translation exists, so these just remember the
  // user's choice on this device.
  const [notifyOn, setNotifyOn] = useState(true);
  const [translateOn, setTranslateOn] = useState(false);
  const [translateLang, setTranslateLang] = useState("English");
  const [translateSheetOpen, setTranslateSheetOpen] = useState(false);
  // Where Group info's back button returns to: the chat (opened via its title)
  // or home (opened directly from the group list because the user hasn't joined yet).
  const [groupInfoReturnTo, setGroupInfoReturnTo] = useState("groupchat");

  // Lets the app-bar back button (and hardware/browser back) return to the
  // room list instead of exiting the Community tab while a chat is open.
  useBackHandler(view === "groupchat" || view === "dm_chat", () => {
    leaveRoom();
    setView(view === "groupchat" ? "home" : "dm_list");
  });
  useBackHandler(view === "createGroup" || view === "shareMoment" || view === "allGroups" || view === "allMoments" || view === "dm_list", () => setView("home"));
  useBackHandler(view === "members", () => setView("groupchat"));
  useBackHandler(view === "groupInfo", () => setView(groupInfoReturnTo));
  useBackHandler(translateSheetOpen, () => setTranslateSheetOpen(false));

  // Every group — admin room or parent-created — needs membership to chat.
  // A user who hasn't joined yet gets the info screen (with a Join button)
  // instead of dropping straight into the chat.
  const openGroup = async group => {
    const { data: memberRows } = await supabase.from(membershipTable(group.kind)).select("user_id").eq(membershipKey(group.kind), group.id).eq("user_id", account.id).limit(1);
    if (!memberRows?.length) { openGroupInfo(group, "home"); return; }
    leaveRoom();
    setActiveRoom(group); setGroupLoading(true); setView("groupchat");
    const { data } = await supabase.from("messages").select("id,author_id,author_name,author_avatar,text,image_url,file_name,created_at").eq("room", `room_${group.id}`).order("created_at", { ascending: true }).limit(120);
    setGroupMsgs((data || []).map(msgFromRow));
    setGroupLoading(false);
    channelRef.current = supabase.channel(`room_${group.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `room=eq.room_${group.id}` }, p => setGroupMsgs(prev => prev.some(m => m.id === p.new.id) ? prev : [...prev, msgFromRow(p.new)].slice(-120)))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages", filter: `room=eq.room_${group.id}` }, p => setGroupMsgs(prev => prev.filter(m => m.id !== p.old.id)))
      .subscribe();
  };

  const sendGroup = async () => {
    const text = groupInput.trim(); const attachment = activeRoom.kind === "user" ? groupAttachment : null;
    if (!text && !attachment) return;
    setGroupInput(""); setGroupAttachment(null);
    const image_url = attachment ? await uploadCommunityAttachment(attachment.file, account.id, attachment.kind) : null;
    if (attachment?.url) URL.revokeObjectURL(attachment.url);
    if (attachment && !image_url) return;
    const file_name = attachment?.kind === "document" ? attachment.name : null;
    const { data, error } = await supabase.from("messages").insert({ room: `room_${activeRoom.id}`, author_id: account.id, author_name: account.name, author_avatar: account.avatar || "none", text, image_url, file_name }).select("id,author_id,author_name,author_avatar,text,image_url,file_name,created_at").single();
    if (error) { console.error(error); setAttachError("Could not send the message. Please try again."); return; }
    setGroupMsgs(prev => prev.some(m => m.id === data.id) ? prev : [...prev, msgFromRow(data)]);
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
    const { data } = await supabase.from("messages").select("id,author_id,author_name,author_avatar,text,image_url,file_name,created_at").eq("room", key).order("created_at", { ascending: true }).limit(200);
    setDmMsgs((data || []).map(msgFromRow));
    setDmLoading(false);
    channelRef.current = supabase.channel(key)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `room=eq.${key}` }, p => setDmMsgs(prev => prev.some(m => m.id === p.new.id) ? prev : [...prev, msgFromRow(p.new)].slice(-200)))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages", filter: `room=eq.${key}` }, p => setDmMsgs(prev => prev.filter(m => m.id !== p.old.id)))
      .subscribe();
  };

  // Gate for message buttons reached from places other than the "Private
  // Messages" card (e.g. the Members screen) — same paywall either way.
  const messageMember = p => { if (!dmPremium) { setShowPaywall(true); return; } openDMChat(p); };

  const sendDM = async () => {
    const text = dmInput.trim(); const attachment = dmAttachment;
    if (!text && !attachment) return;
    setDmInput(""); setDmAttachment(null);
    const image_url = attachment ? await uploadCommunityAttachment(attachment.file, account.id, attachment.kind) : null;
    if (attachment?.url) URL.revokeObjectURL(attachment.url);
    if (attachment && !image_url) return;
    const file_name = attachment?.kind === "document" ? attachment.name : null;
    const { data, error } = await supabase.from("messages").insert({ room: dmKey(account.id, dmPartner.id), author_id: account.id, author_name: account.name, author_avatar: account.avatar || "none", text, image_url, file_name }).select("id,author_id,author_name,author_avatar,text,image_url,file_name,created_at").single();
    if (error) { console.error(error); setAttachError("Could not send the message. Please try again."); return; }
    setDmMsgs(prev => prev.some(m => m.id === data.id) ? prev : [...prev, msgFromRow(data)]);
  };

  const deleteDM = async id => {
    setDmMsgs(prev => prev.filter(m => m.id !== id));
    await supabase.from("messages").delete().eq("id", id).eq("author_id", account.id);
  };

  const purchase = () => { try { localStorage.setItem(`cb_premium_${account.name.toLowerCase()}`, "true"); } catch {} setDmPremium(true); setShowPaywall(false); setTimeout(openDMList, 300); };

  // ---- toast / groups / moments / members / invite UI state ---------------
  const [toast, setToast] = useState("");
  function flash(msg) { setToast(msg); window.clearTimeout(flash._t); flash._t = window.setTimeout(() => setToast(""), 2200); }

  const [gName, setGName] = useState(""); const [gDescription, setGDescription] = useState("");
  const [gColor, setGColor] = useState("purple"); const [gIcon, setGIcon] = useState("community");
  const [gTopics, setGTopics] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);

  const createGroup = async () => {
    const name = gName.trim();
    if (!name) return;
    setCreatingGroup(true);
    const topics = gTopics.split(",").map(t => t.trim()).filter(Boolean);
    const { data, error } = await supabase.from("community_groups")
      .insert({ name, description: gDescription.trim(), icon_key: gIcon, color_key: gColor, topics, created_by: account.id })
      .select().single();
    if (!error && data) {
      await supabase.from("community_group_members").insert({ group_id: data.id, user_id: account.id });
      setGroups(gs => [data, ...gs]);
    }
    setCreatingGroup(false);
    if (error || !data) { flash("Could not create the group. Please try again."); return; }
    setGName(""); setGDescription(""); setGColor("purple"); setGIcon("community"); setGTopics("");
    flash("Group created");
    openGroup(groupToGroup(data));
  };

  const [momentFile, setMomentFile] = useState(null); const [momentPreview, setMomentPreview] = useState(null);
  const [momentCaption, setMomentCaption] = useState(""); const [momentLocation, setMomentLocation] = useState("");
  const [sharingMoment, setSharingMoment] = useState(false); const [momentErr, setMomentErr] = useState("");

  const pickMomentPhoto = e => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { setMomentErr("Please choose a photo."); return; }
    if (file.size > MAX_COMMUNITY_ATTACHMENT_BYTES) { setMomentErr("Photo is too large (max 10MB)."); return; }
    setMomentErr("");
    if (momentPreview) URL.revokeObjectURL(momentPreview);
    setMomentFile(file);
    setMomentPreview(URL.createObjectURL(file));
  };
  const shareMoment = async () => {
    if (!momentFile) { setMomentErr("Please choose a photo first."); return; }
    setSharingMoment(true);
    const compressed = await compressImage(momentFile);
    const image_url = await uploadCommunityAttachment(compressed, account.id, "image");
    setSharingMoment(false);
    if (!image_url) { setMomentErr("Could not upload the photo. Please try again."); return; }
    await supabase.from("moments").insert({
      author_id: account.id, author_name: account.name, author_avatar: account.avatar || "none",
      image_url, caption: momentCaption.trim(), location: showLocation ? momentLocation.trim() : "",
    });
    if (momentPreview) URL.revokeObjectURL(momentPreview);
    setMomentFile(null); setMomentPreview(null); setMomentCaption(""); setMomentLocation("");
    flash("Moment shared");
    setView("home");
  };

  const [members, setMembers] = useState([]); const [membersLoading, setMembersLoading] = useState(false);
  const [memberQuery, setMemberQuery] = useState("");
  const [isGroupMember, setIsGroupMember] = useState(false);
  const [joiningGroup, setJoiningGroup] = useState(false);
  const [leavingGroup, setLeavingGroup] = useState(false);

  const toggleNotify = () => {
    if (!activeRoom) return;
    const next = !notifyOn;
    setNotifyOn(next);
    try { localStorage.setItem(`bonda_group_notify_${activeRoom.id}`, next ? "on" : "off"); } catch {}
  };

  const setTranslatePref = (on, lang) => {
    if (!activeRoom) return;
    setTranslateOn(on);
    if (lang) setTranslateLang(lang);
    try {
      localStorage.setItem(`bonda_group_translate_${activeRoom.id}`, on ? "on" : "off");
      if (lang) localStorage.setItem(`bonda_group_translate_lang_${activeRoom.id}`, lang);
    } catch {}
  };

  // Shared by the "Members" list and "Group info" screens — both need the
  // member roster and whether the current user is in it.
  const loadGroupMembers = async group => {
    const { data: memberRows } = await supabase.from(membershipTable(group.kind)).select("user_id").eq(membershipKey(group.kind), group.id);
    setIsGroupMember((memberRows || []).some(m => m.user_id === account.id));
    const ids = (memberRows || []).map(m => m.user_id);
    if (!ids.length) { setMembers([]); return; }
    const { data: profs } = await supabase.from("profiles").select("id, name, avatar").in("id", ids);
    setMembers(profs || []);
  };

  const openGroupInfo = async (group, returnTo = "groupchat") => {
    setActiveRoom(group);
    setGroupInfoReturnTo(returnTo);
    setView("groupInfo"); setMembersLoading(true);
    setAboutExpanded(false);
    try { setNotifyOn(localStorage.getItem(`bonda_group_notify_${group.id}`) !== "off"); } catch { setNotifyOn(true); }
    try {
      setTranslateOn(localStorage.getItem(`bonda_group_translate_${group.id}`) === "on");
      setTranslateLang(localStorage.getItem(`bonda_group_translate_lang_${group.id}`) || "English");
    } catch { setTranslateOn(false); setTranslateLang("English"); }
    await loadGroupMembers(group);
    setMembersLoading(false);
  };

  const joinActiveGroup = async () => {
    if (!activeRoom) return;
    setJoiningGroup(true);
    await supabase.from(membershipTable(activeRoom.kind)).insert({ [membershipKey(activeRoom.kind)]: activeRoom.id, user_id: account.id });
    setJoiningGroup(false);
    setIsGroupMember(true);
    setMembers(ms => ms.some(m => m.id === account.id) ? ms : [...ms, { id: account.id, name: account.name, avatar: account.avatar || "none" }]);
    flash("Joined group");
    openGroup(activeRoom);
  };

  const leaveActiveGroup = async () => {
    if (!activeRoom) return;
    setLeavingGroup(true);
    await supabase.from(membershipTable(activeRoom.kind)).delete().eq(membershipKey(activeRoom.kind), activeRoom.id).eq("user_id", account.id);
    setLeavingGroup(false);
    leaveRoom();
    setView("home");
    flash("Left group");
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrData, setQrData] = useState({ title: "", code: "", hint: "" });
  const openGroupInvite = group => { setQrData({ title: `Invite to ${group.label}`, code: `bonda.app/g/${group.id}`, hint: "Share this code or link so other parents can find and join this group." }); setQrOpen(true); };
  const openProfileInvite = () => { setQrData({ title: "Let people follow you", code: `bonda.app/u/${account.id}`, hint: "Share this code or link. When they open it in the app, they can follow you back — no phone numbers involved." }); setQrOpen(true); };

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [allowFollowers, setAllowFollowers] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const toggleAllowFollowers = async () => { const next = !allowFollowers; setAllowFollowers(next); await supabase.from("profiles").update({ allow_followers: next }).eq("id", account.id); };
  const toggleShowLocation = async () => { const next = !showLocation; setShowLocation(next); await supabase.from("profiles").update({ show_location_on_moments: next }).eq("id", account.id); };

  const [groupQuery, setGroupQuery] = useState("");
  const [aboutExpanded, setAboutExpanded] = useState(false);

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
        <Btn onClick={purchase} full style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Unlock size={16} /> Unlock for SGD $10</Btn>
        <Btn onClick={() => setShowPaywall(false)} full secondary>Maybe later</Btn>
      </div>
    </div>
  );

  // ---- main screen content, by view -----------------------------------------
  let content = null;

  if (view === "groupchat" && activeRoom) {
    const c = ROOM_COLORS[activeRoom.color_key] || ROOM_COLORS.purple;
    content = (
      <div style={{ position: "relative", display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}>
        {showPaywall && <Paywall />}
        <ChatUI msgs={groupMsgs} input={groupInput} setInput={setGroupInput} onSend={sendGroup} onDelete={deleteGroup} loading={groupLoading} color={c.color} bg={c.bg} icon={null} label={activeRoom.label} sub={activeRoom.description} isGroup account={account} dmPartner={null} endRef={endRef} attachment={groupAttachment} onPickAttachment={pickAttachment(setGroupAttachment)} onRemoveAttachment={() => clearAttachment(setGroupAttachment, groupAttachment)} attachError={attachError} onTitleClick={() => openGroupInfo(activeRoom)} allowAttachments={activeRoom.kind === "user"} />
      </div>
    );
  } else if (view === "dm_chat" && dmPartner) {
    content = <div style={{ position: "relative", display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}>{showPaywall && <Paywall />}<ChatUI msgs={dmMsgs} input={dmInput} setInput={setDmInput} onSend={sendDM} onDelete={deleteDM} loading={dmLoading} color={T.purple} bg={T.purpleL} icon={dmPartner.avatar} label={dmPartner.name} sub="Private message" isGroup={false} account={account} dmPartner={dmPartner} endRef={endRef} attachment={dmAttachment} onPickAttachment={pickAttachment(setDmAttachment)} onRemoveAttachment={() => clearAttachment(setDmAttachment, dmAttachment)} attachError={attachError} /></div>;
  } else if (view === "dm_list") {
    const others = allUsers.filter(u => u.id !== account.id);
    const term = dmSearch.trim().toLowerCase();
    const filtered = !term ? others : others.filter(p => p.name.toLowerCase().includes(term) || dmSearchMatches?.has(p.id));
    content = (
      <Page>
        {showPaywall && <Paywall />}
        <h2 style={{ margin: "0 0 6px", color: T.ink, fontSize: 20, fontWeight: 800 }}>Private Messages</h2>
        <p style={{ margin: "0 0 20px", color: T.inkSoft, fontSize: 14 }}>Choose a parent to message privately</p>
        {others.length > 0 && (
          <div style={{ position: "relative", marginBottom: 16 }}>
            <Search size={16} color={T.inkMuted} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input value={dmSearch} onChange={e => setDmSearch(e.target.value)} placeholder="Search by name or message..." style={searchInputStyle} />
          </div>
        )}
        {others.length === 0 ? <div style={{ textAlign: "center", padding: "48px 20px" }}><Users size={44} color={T.inkMuted} style={{ marginBottom: 12 }} /><p style={{ fontWeight: 700, color: T.ink, fontSize: 15 }}>No other parents yet</p><p style={{ color: T.inkMuted, fontSize: 13, lineHeight: 1.6 }}>Once other parents join, they'll appear here.</p></div> :
          filtered.length === 0 ? <div style={{ textAlign: "center", padding: "48px 20px" }}><Search size={44} color={T.inkMuted} style={{ marginBottom: 12 }} /><p style={{ fontWeight: 700, color: T.ink, fontSize: 15 }}>No matches</p><p style={{ color: T.inkMuted, fontSize: 13, lineHeight: 1.6 }}>No parent name or message matches "{dmSearch.trim()}".</p></div> :
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
  } else if (view === "createGroup") {
    content = (
      <Page>
        <SubHeader title="Create a group" />
        <div style={{ marginTop: 18 }}>
          <Input label="Group name" value={gName} onChange={e => setGName(e.target.value)} placeholder="e.g. Weekend playgroup" />
          <TextArea label="What it's for" value={gDescription} onChange={e => setGDescription(e.target.value)} placeholder="Meetups, tips, and support" rows={2} />
          <Input label="Topics (optional)" value={gTopics} onChange={e => setGTopics(e.target.value)} placeholder="e.g. HealthHub, CDA, Getting started" />
          <p style={{ margin: "-10px 0 18px", fontSize: 11.5, color: T.inkMuted }}>Separate topics with commas — shown as tags on the group's info page.</p>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: T.inkSoft }}>Colour</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
            {Object.keys(ROOM_COLORS).map(key => {
              const c = ROOM_COLORS[key];
              return <button key={key} onClick={() => setGColor(key)} aria-label={key} style={{ width: 38, height: 38, borderRadius: 12, background: c.bg, border: gColor === key ? `3px solid ${c.color}` : `1px solid ${T.border}`, cursor: "pointer" }} />;
            })}
          </div>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: T.inkSoft }}>Icon</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
            {GROUP_ICON_KEYS.map(key => {
              const c = ROOM_COLORS[gColor];
              const iconFn = ROOM_ICONS[key];
              return (
                <button key={key} onClick={() => setGIcon(key)} aria-label={key} style={{ width: 44, height: 44, borderRadius: 12, background: gIcon === key ? c.bg : T.canvas, border: gIcon === key ? `2px solid ${c.color}` : `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  {iconFn(gIcon === key ? c.color : T.inkMuted)}
                </button>
              );
            })}
          </div>
          <Btn onClick={createGroup} full disabled={creatingGroup || !gName.trim()}>{creatingGroup ? "Creating..." : "Create group"}</Btn>
          <p style={{ margin: "10px 4px 0", fontSize: 12, color: T.inkMuted, textAlign: "center" }}>Anyone in the Bonda community can find and join.</p>
        </div>
      </Page>
    );
  } else if (view === "shareMoment") {
    content = (
      <Page>
        <SubHeader title="Share a moment" />
        <div style={{ marginTop: 18 }}>
          {momentPreview ? (
            <div style={{ position: "relative", borderRadius: T.rL, overflow: "hidden", marginBottom: 16 }}>
              <img src={momentPreview} alt="" style={{ width: "100%", maxHeight: 320, objectFit: "cover", display: "block" }} />
              <button onClick={() => { URL.revokeObjectURL(momentPreview); setMomentFile(null); setMomentPreview(null); }} style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,.5)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} /></button>
            </div>
          ) : (
            <label style={{ display: "block", border: `2px dashed ${T.border}`, borderRadius: T.rL, padding: "36px 16px", textAlign: "center", background: T.surface, cursor: "pointer", marginBottom: 16 }}>
              <Camera size={34} color={T.purple} style={{ marginBottom: 8 }} />
              <p style={{ margin: 0, fontSize: 14, color: T.inkSoft, fontWeight: 600 }}>Choose a photo to share</p>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={pickMomentPhoto} />
            </label>
          )}
          {momentErr && <p style={{ margin: "-8px 0 12px", color: T.red, fontSize: 12, fontWeight: 700 }}>{momentErr}</p>}
          <Input label="Caption (optional)" value={momentCaption} onChange={e => setMomentCaption(e.target.value)} placeholder="Add a few words" />
          {showLocation && <Input label="Location (optional)" value={momentLocation} onChange={e => setMomentLocation(e.target.value)} placeholder="e.g. Bedok" />}
          <Btn onClick={shareMoment} full disabled={sharingMoment || !momentFile} style={{ marginTop: 6 }}>{sharingMoment ? "Sharing..." : "Post moment"}</Btn>
          <p style={{ margin: "10px 4px 0", fontSize: 12, color: T.inkMuted, textAlign: "center" }}>Moments stay visible to people who follow you — there's no expiry.</p>
        </div>
      </Page>
    );
  } else if (view === "allGroups") {
    const combined = [...rooms.map(roomToGroup), ...groups.map(groupToGroup)];
    const q = groupQuery.trim().toLowerCase();
    const filtered = !q ? combined : combined.filter(g => g.label.toLowerCase().includes(q) || (g.description || "").toLowerCase().includes(q));
    content = (
      <Page style={{ paddingBottom: 110 }}>
        <SubHeader title="Groups" />
        <div style={{ position: "relative", margin: "16px 0" }}>
          <Search size={16} color={T.inkMuted} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input value={groupQuery} onChange={e => setGroupQuery(e.target.value)} placeholder="Search groups" style={searchInputStyle} />
        </div>
        {filtered.map(g => <GroupRow key={`${g.kind}-${g.id}`} g={g} onClick={() => openGroup(g)} />)}
        {filtered.length === 0 && <p style={{ textAlign: "center", color: T.inkMuted, fontSize: 14, marginTop: 24 }}>No groups match "{groupQuery}".</p>}
        <div style={{ position: "fixed", bottom: 86, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 60 }}>
          <button onClick={() => setView("createGroup")} style={{ display: "flex", alignItems: "center", gap: 8, background: T.purple, color: "white", border: "none", borderRadius: 999, padding: "13px 24px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody, boxShadow: T.shadowM }}><Plus size={18} /> Create group</button>
        </div>
      </Page>
    );
  } else if (view === "allMoments") {
    content = (
      <Page>
        <SubHeader title="Moments"
          right={
            <div style={{ position: "relative" }}>
              <button onClick={() => setMenuOpen(o => !o)} aria-label="More options" style={{ background: "none", border: "none", color: T.inkSoft, cursor: "pointer", padding: 6, display: "flex" }}><MoreVertical size={22} /></button>
              {menuOpen && (
                <>
                  <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 44 }} />
                  <div style={{ position: "absolute", top: 38, right: 0, width: 200, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", boxShadow: T.shadowM, zIndex: 45 }}>
                    {[
                      { ic: Link2, label: "Share link", onClick: () => { setMenuOpen(false); copyText(`bonda.app/u/${account.id}`); flash("Link copied"); } },
                      { ic: QrCode, label: "QR code", onClick: () => { setMenuOpen(false); openProfileInvite(); } },
                      { ic: Settings, label: "Settings", onClick: () => { setMenuOpen(false); setSettingsOpen(true); } },
                    ].map((it, i) => (
                      <button key={it.label} onClick={it.onClick} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", fontSize: 14, fontWeight: 600, color: T.ink, background: "none", border: "none", borderTop: i ? `1px solid ${T.border}` : "none", cursor: "pointer", fontFamily: T.fontBody }}>
                        <it.ic size={17} color={T.purple} /> {it.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          } />
        <div style={{ marginTop: 16 }}>
          {moments.map(m => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 14, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 12, marginBottom: 10 }}>
              <button onClick={() => setViewingMoment(m)} aria-label={`View ${m.author_name}'s moment`} style={{ background: "none", border: `2.5px solid ${T.purple}`, borderRadius: "50%", padding: 2, cursor: "pointer", flexShrink: 0, display: "flex" }}>
                <ComAvatar value={m.author_avatar} size={48} active={false} />
              </button>
              <button onClick={() => setViewingMoment(m)} style={{ flex: 1, textAlign: "left", minWidth: 0, background: "none", border: "none", cursor: "pointer", fontFamily: T.fontBody }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.ink }}>{m.author_name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12.5, color: T.inkMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{[m.location, timeAgo(m.created_at)].filter(Boolean).join(" · ")}</p>
              </button>
              <button onClick={() => unfollowUser({ id: m.author_id, name: m.author_name })} aria-label={`Unfollow ${m.author_name}`} style={{ width: 40, height: 40, borderRadius: "50%", background: T.canvas, border: `1px solid ${T.border}`, color: T.purple, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={18} /></button>
            </div>
          ))}
          {moments.length === 0 && (
            <p style={{ textAlign: "center", color: T.inkMuted, fontSize: 14, margin: "30px 10px" }}>You're not following anyone yet. Follow parents from a group's member list, or share your own link so they can follow you.</p>
          )}
          <p style={{ margin: "16px 6px 0", fontSize: 12, color: T.inkMuted, textAlign: "center", lineHeight: 1.5 }}>People connect inside the app only. Phone numbers are never shared.</p>
        </div>
      </Page>
    );
  } else if (view === "members" && activeRoom) {
    const q = memberQuery.trim().toLowerCase();
    const shown = !q ? members : members.filter(m => m.name.toLowerCase().includes(q));
    content = (
      <Page>
        <SubHeader title="Members" />
        <p style={{ margin: "14px 0 12px", fontSize: 13, color: T.inkMuted }}>{activeRoom.label} · {members.length} {members.length === 1 ? "member" : "members"}</p>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={16} color={T.inkMuted} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input value={memberQuery} onChange={e => setMemberQuery(e.target.value)} placeholder="Search members" style={searchInputStyle} />
        </div>
        {membersLoading && <p style={{ textAlign: "center", color: T.inkMuted, padding: 20 }}>Loading...</p>}
        {!membersLoading && shown.map(m => {
          const isMe = m.id === account.id;
          const following = isFollowing(m.id);
          return (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderBottom: `1px solid ${T.border}` }}>
              <ComAvatar value={m.avatar} size={44} active={false} borderColor={T.border} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, color: T.ink, fontSize: 15 }}>{m.name}{isMe && " (You)"}</p>
              </div>
              {!isMe && (
                <>
                  <button onClick={() => messageMember(m)} aria-label={`Message ${m.name}`} style={{ background: "none", border: "none", color: T.purple, cursor: "pointer", padding: 6, flexShrink: 0, display: "flex" }}><MessageSquare size={18} /></button>
                  <button onClick={() => following ? unfollowUser(m) : followUser(m)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 99, fontSize: 12.5, fontWeight: 700, background: following ? T.canvas : T.purple, color: following ? T.purple : "white", border: following ? `1px solid ${T.border}` : "none", cursor: "pointer", fontFamily: T.fontBody, flexShrink: 0 }}>
                    {following ? <><Check size={14} /> Following</> : <><Plus size={14} /> Follow</>}
                  </button>
                </>
              )}
            </div>
          );
        })}
        {!membersLoading && shown.length === 0 && <p style={{ textAlign: "center", color: T.inkMuted, fontSize: 14, marginTop: 24 }}>No members match "{memberQuery}".</p>}
      </Page>
    );
  } else if (view === "groupInfo" && activeRoom) {
    const c = ROOM_COLORS[activeRoom.color_key] || ROOM_COLORS.purple;
    const iconFn = ROOM_ICONS[activeRoom.icon_key] || ROOM_ICONS.community;
    const desc = (activeRoom.description || "").trim();
    const canJoin = !isGroupMember;
    const tiles = [
      canJoin
        ? { key: "join", Icon: Plus, label: joiningGroup ? "Joining…" : "Join", onClick: joinActiveGroup, disabled: joiningGroup }
        : { key: "join", Icon: Check, label: "Joined", disabled: true },
      { key: "invite", Icon: UserPlus, label: "Invite", onClick: () => openGroupInvite(activeRoom) },
      { key: "notify", Icon: notifyOn ? Bell : BellOff, label: notifyOn ? "Notify" : "Muted", onClick: toggleNotify },
    ];
    content = (
      <Page>
        <SubHeader title="Group info" />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", margin: "8px 0 20px" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            {iconFn(c.color)}
          </div>
          <h2 style={{ margin: 0, fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, color: T.ink }}>{activeRoom.label}</h2>
          <p style={{ margin: "4px 0 0", color: T.inkMuted, fontSize: 13 }}>
            {activeRoom.kind === "admin" ? "Community group" : "Parent group"} · {membersLoading ? "…" : `${members.length} ${members.length === 1 ? "member" : "members"}`}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {tiles.map(t => (
            <button key={t.key} onClick={t.onClick} disabled={t.disabled}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 8px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.r, cursor: "pointer", fontFamily: T.fontBody, opacity: t.disabled ? 0.6 : 1 }}>
              <t.Icon size={18} color={c.color} />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>{t.label}</span>
            </button>
          ))}
        </div>

        <SectionLabel style={{ marginBottom: 10 }}>About this group</SectionLabel>
        <Card style={{ marginBottom: 24 }}>
          <p style={{ margin: 0, color: T.inkSoft, fontSize: 13.5, lineHeight: 1.6, ...(aboutExpanded ? {} : { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }) }}>
            {desc || "No description yet."}
          </p>
          {desc.length > 140 && (
            <button onClick={() => setAboutExpanded(v => !v)} style={{ background: "none", border: "none", color: c.color, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: T.fontBody, padding: "8px 0 0" }}>
              {aboutExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </Card>

        <SectionLabel style={{ marginBottom: 10 }}>Language</SectionLabel>
        <Card onClick={() => setTranslateSheetOpen(true)} style={{ marginBottom: 24, cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: T.purpleL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Globe size={18} color={T.purple} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, color: T.ink, fontSize: 14 }}>Translate messages</p>
              <p style={{ margin: "2px 0 0", color: T.inkMuted, fontSize: 12.5 }}>{translateOn ? `On · to ${translateLang}` : "Off"}</p>
            </div>
            <ChevronRight size={18} color={T.inkMuted} />
          </div>
        </Card>

        <SectionLabel style={{ marginBottom: 10 }}>Good to know</SectionLabel>
        <Card style={{ marginBottom: isGroupMember ? 24 : 8 }}>
          <p style={{ margin: 0, color: T.inkSoft, fontSize: 13.5, lineHeight: 1.6 }}>
            <span style={{ fontWeight: 800, color: T.ink }}>Keep it private.</span> Please don't share full names, addresses, or a child's case details here. Be kind and supportive — everyone here is doing their best. What's said in the group stays in the group.
          </p>
        </Card>

        {isGroupMember && (
          <button onClick={leaveActiveGroup} disabled={leavingGroup} style={{ display: "block", width: "100%", background: "none", border: "none", color: T.red, fontWeight: 700, fontSize: 14, cursor: leavingGroup ? "default" : "pointer", fontFamily: T.fontBody, padding: "8px 0", textAlign: "center", opacity: leavingGroup ? 0.6 : 1 }}>
            {leavingGroup ? "Leaving…" : "Leave group"}
          </button>
        )}

        {translateSheetOpen && (
          <div onClick={() => setTranslateSheetOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(35,32,28,.35)", display: "flex", alignItems: "flex-end", zIndex: 230 }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, margin: "0 auto", background: T.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: "10px 20px 24px" }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: T.border, margin: "6px auto 14px" }} />
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontFamily: T.fontDisplay, fontSize: 19, fontWeight: 600, color: T.ink }}>Translate messages</span>
                <button onClick={() => setTranslateSheetOpen(false)} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: T.inkMuted, display: "flex" }}><X size={22} /></button>
              </div>
              <ToggleRow label="Translate this group's messages" sub="Shows a translated view for you only" on={translateOn} onToggle={() => setTranslatePref(!translateOn)} />
              {translateOn && (
                <>
                  <p style={{ margin: "14px 4px 8px", fontSize: 11.5, fontWeight: 700, color: T.inkSoft, textTransform: "uppercase", letterSpacing: "0.05em" }}>Translate to</p>
                  {TRANSLATE_LANGUAGES.map(lang => (
                    <button key={lang} onClick={() => setTranslatePref(true, lang)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 4px", background: "none", border: "none", borderBottom: `1px solid ${T.border}`, cursor: "pointer", fontFamily: T.fontBody }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{lang}</span>
                      {translateLang === lang && <Check size={16} color={T.purple} />}
                    </button>
                  ))}
                </>
              )}
              <p style={{ margin: "14px 4px 0", fontSize: 11.5, color: T.inkMuted, lineHeight: 1.5 }}>This is a display preference only — it doesn't translate messages for anyone else in the group.</p>
            </div>
          </div>
        )}
      </Page>
    );
  } else if (view === "home") {
    content = (
      <Page>
        {showPaywall && <Paywall />}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={T.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="7.5" r="3.2"/><path d="M2.5 18c0-3.4 2.4-5.3 5.5-5.3s5.5 1.9 5.5 5.3"/><path d="M14.5 13.2c2.6.2 4.3 1.9 4.3 4.8"/><path d="M13.5 4.6a2.9 2.9 0 0 1 2.3 4.9"/></svg>
          <h1 style={{ margin: 0, fontFamily: T.fontDisplay, fontSize: 25, fontWeight: 600, color: T.ink, letterSpacing: "-0.01em" }}>Communities</h1>
        </div>

        {announcement && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: T.purpleL, borderRadius: T.r, padding: "12px 14px", marginBottom: 16, border: `1px solid ${T.purple}25` }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 2px", color: T.purple, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 5 }}><Pin size={12} /> Announcement</p>
              <p style={{ margin: 0, color: T.ink, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{announcement.text}</p>
            </div>
          </div>
        )}

        <SectionLabel action={<button onClick={() => setView("allMoments")} style={{ background: "none", border: "none", color: T.purple, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: T.fontBody }}>See all</button>}>Share a Moment</SectionLabel>
        <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8, marginBottom: 24 }}>
          <button onClick={() => setView("shareMoment")} aria-label="Add a moment" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0, fontFamily: T.fontBody }}>
            <span style={{ width: 56, height: 56, borderRadius: "50%", border: `2px dashed ${T.purple}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.purple }}><Camera size={22} /></span>
            <span style={{ fontSize: 12, color: T.inkSoft, fontWeight: 600 }}>Add</span>
          </button>
          {moments.map(m => (
            <button key={m.id} onClick={() => setViewingMoment(m)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0, fontFamily: T.fontBody, maxWidth: 64 }}>
              <span style={{ borderRadius: "50%", border: `2.5px solid ${T.purple}`, padding: 2, display: "flex" }}>
                <ComAvatar value={m.author_avatar} size={52} active={false} />
              </span>
              <span style={{ fontSize: 11, color: T.inkSoft, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 60 }}>{m.author_name.split(" ")[0]}</span>
            </button>
          ))}
          {moments.length === 0 && (
            <p style={{ margin: 0, fontSize: 12.5, color: T.inkMuted, alignSelf: "center", paddingLeft: 6 }}>Follow other parents (from a group's member list) to see their moments here.</p>
          )}
        </div>

        <SectionLabel action={<button onClick={() => setView("allGroups")} style={{ background: "none", border: "none", color: T.purple, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: T.fontBody }}>See all</button>}>Groups</SectionLabel>
        <div style={{ marginBottom: 24 }}>
          {rooms.map(r => <GroupRow key={`admin-${r.id}`} g={roomToGroup(r)} onClick={() => openGroup(roomToGroup(r))} />)}
          {groups.slice(0, 3).map(g => <GroupRow key={`user-${g.id}`} g={groupToGroup(g)} onClick={() => openGroup(groupToGroup(g))} />)}
          <button onClick={() => setView("createGroup")} style={{ width: "100%", background: "none", border: `1.5px dashed ${T.border}`, borderRadius: T.r, padding: "14px", color: T.purple, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: T.fontBody, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Plus size={16} /> Create your own group</button>
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
              <div style={{ width: 44, height: 44, borderRadius: 12, background: T.border, display: "flex", alignItems: "center", justifyContent: "center", color: T.inkSoft, flexShrink: 0 }}><Lock size={20} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                  <p style={{ margin: 0, fontWeight: 800, color: T.ink, fontSize: 14 }}>Message a Parent</p>
                  <Badge color={T.purple}>SGD $10</Badge>
                </div>
                <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>Unlock private 1-on-1 chat · one-time · lifetime access</p>
              </div>
              <ChevronRight size={20} color={T.inkMuted} />
            </div>
          </Card>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.amberL, borderRadius: T.r, padding: "12px 14px", marginTop: 22, border: `1px solid ${T.amber}20` }}>
          <Heart size={15} color={T.amber} style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, color: T.amber, fontSize: 12, fontWeight: 700, lineHeight: 1.6 }}>Be kind and supportive. Everyone here is doing their best.</p>
        </div>
      </Page>
    );
  }

  return (
    <>
      {content}

      {viewingMoment && (
        <div style={{ position: "fixed", inset: 0, background: T.ink, zIndex: 250, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 16px 12px" }}>
            <ComAvatar value={viewingMoment.author_avatar} size={40} active={false} borderColor="rgba(255,255,255,.5)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#F4F1EB" }}>{viewingMoment.author_name}</p>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(244,241,235,.65)" }}>{[viewingMoment.location, timeAgo(viewingMoment.created_at)].filter(Boolean).join(" · ")}</p>
            </div>
            <button onClick={() => setViewingMoment(null)} aria-label="Close" style={{ background: "none", border: "none", color: "#F4F1EB", cursor: "pointer", display: "flex" }}><X size={26} /></button>
          </div>
          <div style={{ flex: 1, minHeight: 0, margin: "0 16px 16px", borderRadius: 18, overflow: "hidden", position: "relative", background: "#000" }}>
            <img src={viewingMoment.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            {viewingMoment.caption && (
              <p style={{ position: "absolute", left: 16, right: 16, bottom: 16, margin: 0, color: "white", fontSize: 15, lineHeight: 1.5, textShadow: "0 1px 8px rgba(0,0,0,.5)" }}>{viewingMoment.caption}</p>
            )}
          </div>
          <div style={{ padding: 16 }}>
            {isFollowing(viewingMoment.author_id) ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 12, background: "rgba(244,241,235,.14)", color: "#F4F1EB", fontSize: 15, fontWeight: 700 }}><Check size={20} /> In your contacts</div>
            ) : (
              <button onClick={() => followUser({ id: viewingMoment.author_id, name: viewingMoment.author_name })} style={{ width: "100%", background: T.purple, color: "white", border: "none", borderRadius: 12, padding: 15, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><UserPlus size={18} /> Add to contacts</button>
            )}
          </div>
        </div>
      )}

      {qrOpen && (
        <div onClick={() => setQrOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(35,32,28,.35)", display: "flex", alignItems: "flex-end", zIndex: 220 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, margin: "0 auto", background: T.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: "10px 20px 24px" }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: T.border, margin: "6px auto 12px" }} />
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: T.fontDisplay, fontSize: 19, fontWeight: 600, color: T.ink }}>{qrData.title}</span>
              <button onClick={() => setQrOpen(false)} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: T.inkMuted, display: "flex" }}><X size={22} /></button>
            </div>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: T.inkSoft, lineHeight: 1.5 }}>{qrData.hint}</p>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{ padding: 14, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16 }}>
                <QRCode seed={qrData.code} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
              <Link2 size={16} color={T.inkMuted} />
              <span style={{ flex: 1, fontSize: 13, color: T.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{qrData.code}</span>
            </div>
            <Btn full onClick={() => { copyText(qrData.code); flash("Link copied"); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Copy size={16} /> Copy link</Btn>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div onClick={() => setSettingsOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(35,32,28,.35)", display: "flex", alignItems: "flex-end", zIndex: 230 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, margin: "0 auto", background: T.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: "10px 20px 24px" }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: T.border, margin: "6px auto 14px" }} />
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontFamily: T.fontDisplay, fontSize: 19, fontWeight: 600, color: T.ink }}>Moments settings</span>
              <button onClick={() => setSettingsOpen(false)} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: T.inkMuted, display: "flex" }}><X size={22} /></button>
            </div>
            <ToggleRow label="Allow new followers" sub="Let other parents follow you from your link or QR" on={allowFollowers} onToggle={toggleAllowFollowers} />
            <ToggleRow label="Show location on my moments" sub='Display text like "Bedok" on your posts' on={showLocation} onToggle={toggleShowLocation} />
            <p style={{ margin: "14px 4px 0", fontSize: 12, color: T.inkMuted, lineHeight: 1.5 }}>Your phone number is never shown to anyone in Community.</p>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 100, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 240, pointerEvents: "none" }}>
          <span style={{ background: T.ink, color: "#F4F1EB", fontSize: 13.5, fontWeight: 600, padding: "10px 18px", borderRadius: 999, fontFamily: T.fontBody }}>{toast}</span>
        </div>
      )}
    </>
  );
}
