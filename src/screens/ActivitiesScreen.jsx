import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge, Btn, Input, TextArea, Avatar, Accordion, PageHero, AvatarIllustrations, ChildAvatar, ComAvatar, ROOM_ICONS, ACTIVITY_TEXTAREA_STYLE, ActionIllustration, HeroIllustration } from "../ui";
import { CHILD_AVATARS, DEFAULT_CHILDREN, DEFAULT_SCHEDULE, ROOM_COLORS, SOS_COLORS, VERBAL_STATUS_OPTIONS } from "../data";

export function ActivitiesScreen({ pop, account }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [openItem, setOpenItem] = useState(null);
  const [showFreq, setShowFreq] = useState(null);

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

  return (
    <Page>
      <h2 style={{ margin: "0 0 6px", color: T.ink, fontSize: 22, fontWeight: 800 }}>Activity Guide</h2>
      <p style={{ margin: "0 0 24px", color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Research-backed activities you can do at home. Each one targets a real developmental need.</p>

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
                    <Card key={item.id} onClick={() => setOpenItem(openItem === item.id ? null : item.id)} style={{ background: openItem === item.id ? color + "10" : T.canvas, border: "none", padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ margin: 0, fontWeight: 700, color: T.ink, fontSize: 13 }}>{item.name}</p>
                        <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 18, transform: openItem === item.id ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block" }}>+</span>
                      </div>
                      {openItem === item.id && (
                        <div style={{ marginTop: 10 }}>
                          <p style={{ margin: "0 0 8px", color: T.inkSoft, fontSize: 13, lineHeight: 1.65 }}>{item.description}</p>
                          <Badge color={color} bg={color + "18"}>✓ {item.benefit}</Badge>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
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
