import { useEffect } from "react";
import { T } from "../theme";
import { Page } from "../ui";

// Ports the carer-letter.html mockup's "s-home" screen — the first thing that
// mockup shows before you ever get to the child picker / Generate button.
// It's just a 2-tile hub (Carer letter, Documents) so the "Generate Carer
// Letter" quick-access tile on the app's main Home now lands here first,
// matching that flow, instead of jumping straight into CarerLetterScreen.
const FONT_TITLE = "'Fraunces', Georgia, serif";
const FONT_BODY = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";

const Tile = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="cl-mock"
    style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: T.rL,
      padding: "18px 16px",
      textAlign: "left",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      gap: 14,
      minHeight: 118,
      transition: "transform 0.12s, box-shadow 0.12s, border-color 0.12s",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 22px rgba(35,32,28,.07)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
  >
    <span style={{ width: 52, height: 52, borderRadius: 14, background: T.purpleL, display: "flex", alignItems: "center", justifyContent: "center", color: T.purple }}>
      {icon}
    </span>
    <b style={{ fontSize: 15, fontWeight: 600, color: T.ink }}>{label}</b>
  </button>
);

export function CarerLetterHubScreen({ push }) {
  useEffect(() => {
    const id = "carer-letter-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <Page>
      <style>{`.cl-mock, .cl-mock * { font-family: ${FONT_BODY} !important; } .cl-mock b { font-family: ${FONT_TITLE} !important; }`}</style>
      <div className="cl-mock" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Tile
          onClick={() => push("carerLetter")}
          label="Carer letter"
          icon={
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m3.5 7 8.5 6 8.5-6" />
            </svg>
          }
        />
        <Tile
          onClick={() => push("documents")}
          label="Documents"
          icon={
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" /><path d="M14 4v5h5" />
            </svg>
          }
        />
      </div>
    </Page>
  );
}
