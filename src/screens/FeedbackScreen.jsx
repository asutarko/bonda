import { useState } from "react";
import { supabase } from "../lib/supabase";
import { T } from "../theme";
import { Page, Btn, Select, TextArea, FieldError } from "../ui";

const CATEGORY_OPTIONS = ["Suggestion", "Something isn't working", "Compliment", "Other"];

// Sent from the header's 3-dot menu; rows land in public.feedback
// (supabase/feedback.sql) and are read from the Supabase dashboard.
export function FeedbackScreen({ account, pop }) {
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    const fe = {};
    if (!category) fe.category = "Please choose what your feedback is about.";
    if (!message.trim()) fe.message = "Please write your feedback.";
    setErrors(fe);
    if (Object.keys(fe).length > 0) return;
    setErr(""); setSending(true);
    const { error } = await supabase.from("feedback").insert({ user_id: account.id, category, rating: rating || null, message: message.trim() });
    setSending(false);
    if (error) return setErr("Couldn't send your feedback. Please try again.");
    const { default: Swal } = await import("sweetalert2");
    await Swal.fire({ icon: "success", title: "Thank you for your feedback", confirmButtonColor: T.purple });
    pop();
  };

  return (
    <Page>
      <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: T.ink }}>Send feedback</h2>
      <p style={{ margin: "0 0 24px", color: T.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Tell us what's working, what isn't, or what you'd like Bonda to do next.</p>

      <Select label="What is it about?" placeholder="Select a topic" value={category} onChange={e => setCategory(e.target.value)} options={CATEGORY_OPTIONS} />
      <FieldError>{errors.category}</FieldError>

      <div style={{ marginBottom: 14 }}>
        <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: T.inkSoft }}>How is Bonda for you? <span style={{ fontWeight: 500, color: T.inkMuted }}>(optional)</span></p>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" onClick={() => setRating(rating === n ? 0 : n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}
              style={{ background: "none", border: "none", padding: 2, cursor: "pointer", fontSize: 28, lineHeight: 1, color: n <= rating ? "#D97706" : T.border }}>★</button>
          ))}
        </div>
      </div>

      <TextArea label="Your feedback" rows={5} value={message} onChange={e => setMessage(e.target.value)} placeholder="Write as much or as little as you like" />
      <FieldError>{errors.message}</FieldError>

      {err && <p style={{ margin: "0 0 12px", color: T.red, fontSize: 13, fontWeight: 700 }}>{err}</p>}
      <Btn onClick={send} disabled={sending} full>{sending ? "Sending…" : "Send feedback"}</Btn>
    </Page>
  );
}
