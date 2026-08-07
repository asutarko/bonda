import { T } from "../theme";
import { Page, SectionLabel, Card, Btn, ChildAvatar } from "../ui";

// Small local copy of MyChildScreen's ageFromDob — duplicated rather than
// imported so this screen's lazy chunk doesn't drag in MyChildScreen's much
// heavier dependency tree (growth tracker, compliance, onboarding forms).
const ageFromDob = dob => {
  if (!dob) return "";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "";
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) return "";
  if (months < 24) return `${months} mo`;
  const years = Math.floor(months / 12);
  return `${years} yr`;
};

// Hard cap on child profiles per account, counting every profile regardless
// of active/pending status.
const MAX_CHILDREN = 6;

export function AllChildrenScreen({ childCtx, pop, setTab, push }) {
  const { children, activeChild, switchChild } = childCtx;
  const atLimit = children.length >= MAX_CHILDREN;

  const openChild = (id) => {
    switchChild(id);
    setTab("mychild");
    pop();
  };

  return (
    <Page>
      <SectionLabel style={{ marginBottom: 10 }}>My Children</SectionLabel>

      {children.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "24px 16px" }}>
          <p style={{ margin: 0, color: T.inkMuted, fontSize: 13 }}>No child profiles yet.</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {children.map(c => {
            const isSelected = activeChild?.id === c.id;
            return (
              <Card
                key={c.id}
                onClick={() => openChild(c.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer", border: isSelected ? `1.5px solid ${T.purple}` : undefined }}
              >
                <ChildAvatar value={c.emoji} size={46} active={isSelected} borderColor={isSelected ? T.purple : "transparent"} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: T.ink }}>{c.name}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    {ageFromDob(c.dob) && <span style={{ fontSize: 11, color: T.inkMuted }}>{ageFromDob(c.dob)}</span>}
                    <span style={{ background: c.active ? T.greenL : T.redL, color: c.active ? T.green : T.red, fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {atLimit ? (
        <p style={{ margin: "16px 0 0", color: T.inkMuted, fontSize: 12, textAlign: "center", lineHeight: 1.6 }}>You've reached the maximum of {MAX_CHILDREN} child profiles.</p>
      ) : (
        <Btn onClick={() => push("addChild")} style={{ marginTop: 16, borderRadius: 999 }} full>+ Add a child profile</Btn>
      )}
    </Page>
  );
}
