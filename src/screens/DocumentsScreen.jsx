import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, Card, Btn, Input, Select, Badge } from "../ui";

const DOC_CATEGORIES = ["Medical", "Placement", "School", "Identity", "Other"];

const CATEGORY_TONE = {
  "Carer letter": { color: T.purple, bg: T.purpleL },
  Medical: { color: T.red, bg: T.redL },
  Placement: { color: T.indigo, bg: T.indigoL },
  School: { color: T.teal, bg: T.tealL },
  Identity: { color: T.violet, bg: T.violetL },
  Other: { color: T.slate, bg: T.slateL },
};

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

const DocIcon = ({ tone }) => (
  <div style={{ width: 38, height: 38, borderRadius: 11, background: tone.bg, color: tone.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h8l4 4v14H6Z" /><path d="M14 3v4h4" />
    </svg>
  </div>
);

export function DocumentsScreen({ push, childCtx, account }) {
  const { children = [], switchChild } = childCtx || {};
  const [letters, setLetters] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetChild, setSheetChild] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(DOC_CATEGORIES[0]);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: l }, { data: d }] = await Promise.all([
      supabase.from("carer_letters").select("child_id, updated_at"),
      supabase.from("child_documents").select("*").order("created_at", { ascending: false }),
    ]);
    setLetters(l || []);
    setDocs(d || []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const openLetter = (childId) => {
    switchChild?.(childId);
    push("carerLetter");
  };

  const openAddDoc = (child) => {
    setSheetChild(child);
    setTitle("");
    setCategory(DOC_CATEGORIES[0]);
  };

  const saveDoc = async () => {
    if (!title.trim() || !sheetChild || !account?.id) return;
    await supabase.from("child_documents").insert({
      user_id: account.id,
      child_id: sheetChild.id,
      title: title.trim(),
      category,
    });
    setSheetChild(null);
    loadAll();
  };

  if (loading) {
    return <Page><p style={{ color: T.inkSoft, fontSize: 13 }}>Loading documents...</p></Page>;
  }

  return (
    <Page>
      <p style={{ margin: "0 0 20px", color: T.inkSoft, fontSize: 13, lineHeight: 1.6 }}>Every letter and file for the children in your care, saved in one place. Show them to a school, clinic, or agency whenever they're needed.</p>

      {children.length === 0 && (
        <Card style={{ textAlign: "center", padding: "28px 20px" }}>
          <p style={{ margin: "0 0 6px", fontFamily: T.fontDisplay, fontWeight: 600, fontSize: 17, color: T.ink }}>No documents yet</p>
          <p style={{ margin: "0 0 16px", color: T.inkSoft, fontSize: 13, lineHeight: 1.5 }}>Add a child and create their carer letter — it'll be saved here automatically.</p>
          <Btn onClick={() => push("addChild")}>Add a child</Btn>
        </Card>
      )}

      {children.map(child => {
        const letter = letters.find(l => l.child_id === child.id);
        const childDocs = docs.filter(d => d.child_id === child.id);
        const count = (letter ? 1 : 0) + childDocs.length;
        return (
          <Card key={child.id} style={{ marginBottom: 16, padding: "6px 16px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0 4px" }}>
              <p style={{ margin: 0, fontFamily: T.fontDisplay, fontWeight: 600, fontSize: 16, color: T.ink }}>{child.name}</p>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.inkMuted }}>{count} file{count === 1 ? "" : "s"}</span>
            </div>

            {count === 0 ? (
              <p style={{ fontSize: 13, color: T.inkSoft, padding: "10px 0", borderTop: `1px solid ${T.border}`, lineHeight: 1.5, margin: 0 }}>
                No files yet — generate a carer letter or add a document below.
              </p>
            ) : (
              <>
                {letter && (
                  <div onClick={() => openLetter(child.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: `1px solid ${T.border}`, cursor: "pointer" }}>
                    <DocIcon tone={CATEGORY_TONE["Carer letter"]} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.ink, display: "flex", alignItems: "center", gap: 6 }}>
                        Foster carer letter <Badge color={T.purple}>Auto-saved</Badge>
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: T.inkSoft }}>Carer letter · {formatDate(letter.updated_at)}</p>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.purple, flexShrink: 0 }}>Open ›</span>
                  </div>
                )}
                {childDocs.map(doc => {
                  const tone = CATEGORY_TONE[doc.category] || CATEGORY_TONE.Other;
                  return (
                    <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: `1px solid ${T.border}` }}>
                      <DocIcon tone={tone} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.ink }}>{doc.title}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: T.inkSoft }}>{doc.category} · {formatDate(doc.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            <button
              onClick={() => openAddDoc(child)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", marginTop: 12, border: `1px dashed ${T.border}`, background: "none", color: T.purple, borderRadius: T.r, padding: 12, fontFamily: T.fontBody, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              ＋ Add document
            </button>
          </Card>
        );
      })}

      {sheetChild && (
        <div onClick={() => setSheetChild(null)} style={{ position: "fixed", inset: 0, background: "rgba(35,32,28,.34)", zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: T.canvas, borderRadius: "22px 22px 0 0", padding: "20px 20px calc(env(safe-area-inset-bottom, 0px) + 24px)", boxShadow: "0 -10px 40px rgba(35,32,28,.2)" }}>
            <div style={{ width: 40, height: 4, borderRadius: 99, background: T.border, margin: "0 auto 16px" }} />
            <p style={{ margin: "0 0 4px", fontFamily: T.fontDisplay, fontWeight: 600, fontSize: 19, color: T.ink }}>Add a document</p>
            <p style={{ margin: "0 0 16px", color: T.inkSoft, fontSize: 13 }}>For <b>{sheetChild.name}</b></p>
            <Input label="Document name" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Medical Fee Exemption Card" />
            <Select label="Category" value={category} onChange={e => setCategory(e.target.value)} options={DOC_CATEGORIES} />
            <p style={{ margin: "-6px 0 16px", fontSize: 12, color: T.inkMuted, lineHeight: 1.5 }}>Preview only — this records the document in the list; it doesn't upload a file.</p>
            <Btn full onClick={saveDoc} style={{ marginBottom: 10 }}>Save to documents</Btn>
            <Btn full secondary onClick={() => setSheetChild(null)}>Cancel</Btn>
          </div>
        </div>
      )}
    </Page>
  );
}
