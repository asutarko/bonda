import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge, Btn, Input, TextArea, Avatar, Accordion, PageHero, AvatarIllustrations, ChildAvatar, ComAvatar, ROOM_ICONS, ACTIVITY_TEXTAREA_STYLE, ActionIllustration, HeroIllustration } from "../ui";
import { CHILD_AVATARS, DEFAULT_CHILDREN, DEFAULT_SCHEDULE, ROOM_COLORS, SOS_COLORS, VERBAL_STATUS_OPTIONS } from "../data";
import { useBackHandler } from "../hooks";

export function ActivitiesScreen({ pop, account }) {
  const isAdmin = account?.role === "admin";
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [openItem, setOpenItem] = useState(null);
  const [showFreq, setShowFreq] = useState(null);
  const [editingCat, setEditingCat] = useState(null); // null = closed, {} = new, {...cat} = editing
  const [editingItem, setEditingItem] = useState(null); // {category_id, ...} = new/editing item

  useBackHandler(!!editingItem, () => setEditingItem(null));
  useBackHandler(!!editingCat, () => setEditingCat(null));

  const loadActivities = async () => {
    setLoading(true);
    const [{ data: cats }, { data: items }] = await Promise.all([
      supabase.from("activity_categories").select("*").order("sort_order").order("created_at"),
      supabase.from("activity_items").select("*").order("sort_order").order("created_at"),
    ]);
    setCategories((cats || []).map(c => ({ ...c, items: (items || []).filter(i => i.category_id === c.id) })));
    setLoading(false);
  };

  useEffect(() => { loadActivities(); }, []);

  const saveCategory = async () => {
    const c = editingCat;
    if (!c?.label?.trim()) return;
    const payload = { emoji: (c.emoji || "🎨").trim(), label: c.label.trim(), color_key: c.color_key || "purple", freq: (c.freq || "").trim(), source: (c.source || "").trim(), tip: (c.tip || "").trim() };
    if (c.id) {
      await supabase.from("activity_categories").update(payload).eq("id", c.id);
    } else {
      await supabase.from("activity_categories").insert({ ...payload, created_by: account.id, sort_order: categories.length });
    }
    setEditingCat(null);
    await loadActivities();
  };

  const deleteCategory = async id => {
    await supabase.from("activity_categories").delete().eq("id", id);
    if (open === id) setOpen(null);
    await loadActivities();
  };

  const saveItem = async () => {
    const it = editingItem;
    if (!it?.name?.trim()) return;
    const payload = { name: it.name.trim(), description: (it.desc || "").trim(), benefit: (it.benefit || "").trim() };
    if (it.id) {
      await supabase.from("activity_items").update(payload).eq("id", it.id);
    } else {
      const cat = categories.find(c => c.id === it.category_id);
      await supabase.from("activity_items").insert({ ...payload, category_id: it.category_id, created_by: account.id, sort_order: cat?.items.length || 0 });
    }
    setEditingItem(null);
    await loadActivities();
  };

  const deleteItem = async id => {
    await supabase.from("activity_items").delete().eq("id", id);
    await loadActivities();
  };

  return (
    <Page>
      <h2 style={{ margin: "0 0 6px", color: T.ink, fontSize: 22, fontWeight: 800 }}>Activity Guide</h2>
      <p style={{ margin: "0 0 24px", color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Research-backed activities you can do at home. Each one targets a real developmental need.</p>

      {isAdmin && (
        <div style={{ marginBottom: 16 }}>
          {editingCat ? (
            <Card>
              <p style={{ margin: "0 0 10px", fontWeight: 800, color: T.purple, fontSize: 14 }}>{editingCat.id ? "Edit Category" : "New Category"}</p>
              <Input placeholder="Emoji" value={editingCat.emoji ?? "🎨"} onChange={e => setEditingCat(c => ({ ...c, emoji: e.target.value }))} />
              <Input placeholder="Category name (e.g. Sensory)" value={editingCat.label || ""} onChange={e => setEditingCat(c => ({ ...c, label: e.target.value }))} />
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {Object.entries(ROOM_COLORS).map(([key, sc]) => {
                  const active = (editingCat.color_key || "purple") === key;
                  return <button key={key} onClick={() => setEditingCat(c => ({ ...c, color_key: key }))} style={{ width: 28, height: 28, borderRadius: "50%", background: sc.color, border: active ? `2.5px solid ${T.ink}` : "2.5px solid transparent", cursor: "pointer" }} />;
                })}
              </div>
              <textarea value={editingCat.freq || ""} onChange={e => setEditingCat(c => ({ ...c, freq: e.target.value }))} placeholder="Recommended frequency (e.g. Daily — 2–3 sessions of 15–20 min)" rows={2} style={ACTIVITY_TEXTAREA_STYLE} />
              <textarea value={editingCat.source || ""} onChange={e => setEditingCat(c => ({ ...c, source: e.target.value }))} placeholder="Research source / citation" rows={2} style={ACTIVITY_TEXTAREA_STYLE} />
              <textarea value={editingCat.tip || ""} onChange={e => setEditingCat(c => ({ ...c, tip: e.target.value }))} placeholder="Practical tip for parents" rows={2} style={ACTIVITY_TEXTAREA_STYLE} />
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={saveCategory} style={{ flex: 1, padding: "10px" }}>{editingCat.id ? "Save" : "Add"}</Btn>
                <Btn onClick={() => setEditingCat(null)} secondary style={{ flex: 1, padding: "10px" }}>Cancel</Btn>
              </div>
            </Card>
          ) : (
            <Btn onClick={() => setEditingCat({})} secondary full>+ Add Category</Btn>
          )}
        </div>
      )}

      {loading ? (
        <p style={{ margin: 0, color: T.inkSoft, fontSize: 13 }}>Loading activities...</p>
      ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {categories.map((cat) => {
          const color = ROOM_COLORS[cat.color_key]?.color || T.purple;
          const isOpen = open === cat.id;
          return (
          <Card key={cat.id} style={{ padding: 0, overflow: "hidden" }}>
            <div onClick={() => setOpen(isOpen ? null : cat.id)} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: isOpen ? color + "10" : T.surface }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${color}20`, fontSize: 18 }}>
                {cat.emoji}
              </div>
              <p style={{ flex: 1, margin: 0, fontWeight: 800, color: color, fontSize: 15 }}>{cat.label}</p>
              <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 20, transform: isOpen ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block" }}>+</span>
            </div>
            {isOpen && (
              <div style={{ padding: "0 16px 16px" }}>
                {isAdmin && (
                  <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
                    <button onClick={() => setEditingCat(cat)} style={{ background: "none", border: "none", color: T.purple, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: T.fontBody, padding: 0 }}>Edit category</button>
                    <button onClick={() => deleteCategory(cat.id)} style={{ background: "none", border: "none", color: T.red, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: T.fontBody, padding: 0 }}>Delete category</button>
                  </div>
                )}
                <Card onClick={() => setShowFreq(showFreq === cat.id ? null : cat.id)} style={{ background: showFreq === cat.id ? T.ink : T.canvas, border: "none", marginBottom: 12, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ margin: 0, fontWeight: 800, color: showFreq === cat.id ? "white" : T.ink, fontSize: 13 }}>How often should my child do this?</p>
                    <span style={{ color: showFreq === cat.id ? "white" : T.inkMuted, fontWeight: 300, fontSize: 18, transform: showFreq === cat.id ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block" }}>+</span>
                  </div>
                  {showFreq === cat.id && (
                    <div style={{ marginTop: 10 }}>
                      <p style={{ margin: "0 0 4px", color: color, fontWeight: 800, fontSize: 14 }}>{cat.freq}</p>
                      <p style={{ margin: "0 0 8px", color: "rgba(255,255,255,0.65)", fontSize: 12, lineHeight: 1.6 }}>{cat.source}</p>
                      <p style={{ margin: 0, color: T.amber, fontSize: 12, fontWeight: 700 }}>💡 {cat.tip}</p>
                    </div>
                  )}
                </Card>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cat.items.map((item) => (
                    editingItem?.id === item.id ? (
                      <Card key={item.id} style={{ background: color + "10", border: "none", padding: "12px 14px" }}>
                        <Input placeholder="Activity name" value={editingItem.name || ""} onChange={e => setEditingItem(it => ({ ...it, name: e.target.value }))} />
                        <textarea value={editingItem.desc || ""} onChange={e => setEditingItem(it => ({ ...it, desc: e.target.value }))} placeholder="Description" rows={2} style={ACTIVITY_TEXTAREA_STYLE} />
                        <Input placeholder="Benefit (e.g. Calming · Motor skills)" value={editingItem.benefit || ""} onChange={e => setEditingItem(it => ({ ...it, benefit: e.target.value }))} />
                        <div style={{ display: "flex", gap: 8 }}>
                          <Btn onClick={saveItem} style={{ flex: 1, padding: "10px" }}>Save</Btn>
                          <Btn onClick={() => setEditingItem(null)} secondary style={{ flex: 1, padding: "10px" }}>Cancel</Btn>
                        </div>
                      </Card>
                    ) : (
                    <Card key={item.id} onClick={() => setOpenItem(openItem === item.id ? null : item.id)} style={{ background: openItem === item.id ? color + "10" : T.canvas, border: "none", padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ margin: 0, fontWeight: 700, color: T.ink, fontSize: 13 }}>{item.name}</p>
                        <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 18, transform: openItem === item.id ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block" }}>+</span>
                      </div>
                      {openItem === item.id && (
                        <div style={{ marginTop: 10 }}>
                          <p style={{ margin: "0 0 8px", color: T.inkSoft, fontSize: 13, lineHeight: 1.65 }}>{item.description}</p>
                          <Badge color={color} bg={color + "18"}>✓ {item.benefit}</Badge>
                          {isAdmin && (
                            <div style={{ display: "flex", gap: 14, marginTop: 10 }} onClick={e => e.stopPropagation()}>
                              <button onClick={() => setEditingItem({ ...item, category_id: cat.id, desc: item.description })} style={{ background: "none", border: "none", color: T.purple, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: T.fontBody, padding: 0 }}>Edit</button>
                              <button onClick={() => deleteItem(item.id)} style={{ background: "none", border: "none", color: T.red, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: T.fontBody, padding: 0 }}>Delete</button>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                    )
                  ))}
                </div>
                {isAdmin && (
                  editingItem && !editingItem.id && editingItem.category_id === cat.id ? (
                    <Card style={{ background: color + "10", border: "none", padding: "12px 14px", marginTop: 8 }}>
                      <Input placeholder="Activity name" value={editingItem.name || ""} onChange={e => setEditingItem(it => ({ ...it, name: e.target.value }))} />
                      <textarea value={editingItem.desc || ""} onChange={e => setEditingItem(it => ({ ...it, desc: e.target.value }))} placeholder="Description" rows={2} style={ACTIVITY_TEXTAREA_STYLE} />
                      <Input placeholder="Benefit (e.g. Calming · Motor skills)" value={editingItem.benefit || ""} onChange={e => setEditingItem(it => ({ ...it, benefit: e.target.value }))} />
                      <div style={{ display: "flex", gap: 8 }}>
                        <Btn onClick={saveItem} style={{ flex: 1, padding: "10px" }}>Add</Btn>
                        <Btn onClick={() => setEditingItem(null)} secondary style={{ flex: 1, padding: "10px" }}>Cancel</Btn>
                      </div>
                    </Card>
                  ) : (
                    <Btn onClick={() => setEditingItem({ category_id: cat.id })} secondary full style={{ marginTop: 8 }}>+ Add Activity</Btn>
                  )
                )}
              </div>
            )}
          </Card>
          );
        })}
      </div>
      )}
    </Page>
  );
}
