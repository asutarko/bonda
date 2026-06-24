import { useState } from "react";
import { T } from "../theme";
import { Page, SectionLabel, Card, Badge } from "../ui";

export function EmotionsBehavioursScreen({ pop }) {
  const [subTab, setSubTab] = useState("emotions"); // emotions | behaviours
  const [activeEmotion, setActiveEmotion] = useState(null);
  const [emotionTab, setEmotionTab] = useState("signs");
  const [activeBehaviour, setActiveBehaviour] = useState(null);

  if (activeBehaviour) return <BehaviourDetail b={activeBehaviour} onBack={() => setActiveBehaviour(null)} />;
  if (activeEmotion) return <EmotionDetail e={activeEmotion} tab={emotionTab} setTab={setEmotionTab} onBack={() => setActiveEmotion(null)} />;

  return (
    <Page>
      <div style={{ display: "flex", background: T.border, borderRadius: T.r, padding: 3, gap: 3, marginBottom: 24 }}>
        {[["emotions","Emotions"],["behaviours","Behaviours"]].map(([v, l]) => (
          <button key={v} onClick={() => setSubTab(v)} style={{ flex: 1, padding: "10px", borderRadius: 9, background: subTab === v ? T.surface : "transparent", border: "none", fontWeight: 700, fontSize: 13, color: subTab === v ? T.ink : T.inkMuted, cursor: "pointer", fontFamily: T.fontBody, boxShadow: subTab === v ? T.shadow : "none", transition: "all 0.2s" }}>{l}</button>
        ))}
      </div>

      {subTab === "emotions" && (
        <>
          <SectionLabel style={{ marginBottom: 10 }}>Emotions</SectionLabel>
          <p style={{ margin: "0 0 14px", color: T.inkSoft, fontSize: 13, lineHeight: 1.6 }}>Tap an emotion to see what it looks like in a non-verbal autistic child — and exactly what to do.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {EMOTIONS.map(e => (
              <Card key={e.id} onClick={() => { setActiveEmotion(e); setEmotionTab("signs"); }} style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0, overflow: "hidden" }}>
                    <EmotionIllustration id={e.id} size={48} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 3px", fontWeight: 800, color: e.color, fontSize: 15 }}>{e.label}</p>
                    <p style={{ margin: 0, color: T.inkMuted, fontSize: 12 }}>{e.signs.length} signs · {e.actions.length} actions</p>
                  </div>
                  <span style={{ color: T.inkMuted, fontSize: 20 }}>›</span>
                </div>
              </Card>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: "14px 16px", background: T.amberL, borderRadius: T.r, border: `1px solid ${T.amber}25` }}>
            <p style={{ margin: 0, color: T.amber, fontSize: 12, fontWeight: 700, lineHeight: 1.7 }}>🧭 Every autistic child is different. Bonda gives you <strong>frameworks, not prescriptions</strong>. Use what fits your child, leave what doesn't. You know them best.</p>
          </div>
        </>
      )}

      {subTab === "behaviours" && (
        <>
          <SectionLabel style={{ marginBottom: 10 }}>Behaviours</SectionLabel>
          <p style={{ margin: "0 0 14px", color: T.inkSoft, fontSize: 13, lineHeight: 1.6 }}>Research-backed explanations of specific behaviours parents find confusing or worrying — with practical steps.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {BEHAVIOURS.map(b => (
              <Card key={b.id} onClick={() => setActiveBehaviour(b)} style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: b.urgency ? T.redL : T.purpleL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1.5px solid ${b.urgency ? T.red + "25" : T.purple + "20"}` }}>
                    <span style={{ fontSize: 24, lineHeight: 1 }}>{b.icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <p style={{ margin: 0, fontWeight: 800, color: T.ink, fontSize: 14 }}>{b.label}</p>
                      {b.urgency && <Badge color={T.red} bg={T.redL}>URGENT</Badge>}
                    </div>
                    <p style={{ margin: 0, color: T.inkMuted, fontSize: 12, lineHeight: 1.4 }}>{b.summary}</p>
                  </div>
                  <span style={{ color: T.inkMuted, fontSize: 20 }}>›</span>
                </div>
              </Card>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: "14px 16px", background: T.amberL, borderRadius: T.r }}>
            <p style={{ margin: 0, color: T.amber, fontSize: 12, fontWeight: 700, lineHeight: 1.7 }}>💡 Every behaviour is communication. Before trying to stop it, ask: <em>what is my child trying to tell me?</em> Understanding function is the key to finding a real solution.</p>
          </div>
        </>
      )}
    </Page>
  );
}

export const EmotionIllustration = ({ id, size = 48 }) => {
  const s = size;
  const r = s / 2;
  const illustrations = {
    happy: (
      <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: "block" }}>
        <circle cx="50" cy="50" r="48" fill="#FEF3C7"/>
        <circle cx="50" cy="50" r="34" fill="#D97706" opacity="0.18"/>
        <circle cx="37" cy="43" r="5" fill="#0A2218"/>
        <circle cx="63" cy="43" r="5" fill="#0A2218"/>
        <path d="M34 60 Q50 74 66 60" fill="none" stroke="#0A2218" strokeWidth="3" strokeLinecap="round"/>
        <path d="M18 28 Q23 22 28 28" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M72 28 Q77 22 82 28" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    sad: (
      <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: "block" }}>
        <circle cx="50" cy="50" r="48" fill="#DBEAFE"/>
        <circle cx="50" cy="50" r="34" fill="#2563EB" opacity="0.12"/>
        <circle cx="37" cy="43" r="5" fill="#0A2218"/>
        <circle cx="63" cy="43" r="5" fill="#0A2218"/>
        <path d="M34 66 Q50 56 66 66" fill="none" stroke="#0A2218" strokeWidth="3" strokeLinecap="round"/>
        <ellipse cx="35" cy="57" rx="3.5" ry="6" fill="#2563EB" opacity="0.35"/>
        <ellipse cx="65" cy="57" rx="3.5" ry="6" fill="#2563EB" opacity="0.35"/>
      </svg>
    ),
    angry: (
      <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: "block" }}>
        <circle cx="50" cy="50" r="48" fill="#FEE2E2"/>
        <circle cx="50" cy="50" r="34" fill="#DC2626" opacity="0.12"/>
        <rect x="31" y="39" width="15" height="6" rx="3" fill="#0A2218"/>
        <rect x="54" y="39" width="15" height="6" rx="3" fill="#0A2218"/>
        <path d="M34 66 Q50 57 66 66" fill="none" stroke="#0A2218" strokeWidth="3" strokeLinecap="round"/>
        <path d="M30 32 L36 40" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M70 32 L64 40" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    confused: (
      <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: "block" }}>
        <circle cx="50" cy="50" r="48" fill="#EDE9FE"/>
        <circle cx="50" cy="50" r="34" fill="#7C3AED" opacity="0.1"/>
        <circle cx="37" cy="43" r="5" fill="#0A2218"/>
        <circle cx="63" cy="43" r="5" fill="#0A2218"/>
        <ellipse cx="50" cy="64" rx="9" ry="6" fill="#0A2218" opacity="0.65"/>
        <path d="M26 36 Q33 30 40 36" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        <path d="M60 36 Q67 30 74 36" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    excited: (
      <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: "block" }}>
        <circle cx="50" cy="50" r="48" fill="#EDE9FE"/>
        <circle cx="50" cy="50" r="34" fill="#065F46" opacity="0.1"/>
        <circle cx="37" cy="43" r="6" fill="#0A2218"/>
        <circle cx="63" cy="43" r="6" fill="#0A2218"/>
        <path d="M32 60 Q50 76 68 60" fill="none" stroke="#0A2218" strokeWidth="3" strokeLinecap="round"/>
        <path d="M16 20 Q21 13 26 20" fill="none" stroke="#065F46" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M74 20 Q79 13 84 20" fill="none" stroke="#065F46" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M22 11 Q27 4 32 11" fill="none" stroke="#065F46" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        <path d="M68 11 Q73 4 78 11" fill="none" stroke="#065F46" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
  };
  return illustrations[id] || null;
};

// Quick action illustrations — geometric scene icons

export const EMOTIONS = [
  {
    id: "happy", emoji: "😊", label: "Happy", color: "#D97706", bg: "#FEF3C7",
    signs: [
      { title: "Happy stimming", body: "Hand flapping, clapping, rocking with a smile. Research confirms these are expressions of joy in autistic children — not problems to suppress." },
      { title: "Jumping or spinning", body: "Full-body excitement release. A 2020 Journal of Autism study found stimming amplifies joy the way laughter does for neurotypical children." },
      { title: "Happy sounds", body: "Squealing, humming, repeating favourite sounds. These are positive vocal stims — the child's version of laughing out loud." },
      { title: "Approaching you", body: "Moving closer, leaning in, brief eye contact — the child is seeking shared positive experience with someone they feel safe with." },
      { title: "Relaxed body", body: "Loose limbs, open posture, visible smile. Physical relaxation is one of the most reliable cross-cultural happiness signals, including in ASD." },
    ],
    actions: [
      { title: "Join in — don't stop it", body: "Mirror their joy. If they're flapping, flap with them. Research shows shared positive stimming deepens parent-child attachment in ASD." },
      { title: "Name what made them happy", body: "Point to the object or activity and say its name calmly. You are building a vocabulary of joy that your child can eventually use to ask for more." },
      { title: "Repeat it soon", body: "If something lit them up, offer it again within the next day. Positive emotional experiences build the neural pathways that support emotional stability." },
    ],
  },
  {
    id: "sad", emoji: "😢", label: "Sad", color: "#2563EB", bg: "#DBEAFE",
    signs: [
      { title: "Looking away more", body: "Gaze avoidance increases during sadness. Autistic children process sadness differently — reduced eye contact with familiar people is a key signal." },
      { title: "Retreating or hiding", body: "Moving to a corner, under a table, or to their room. This is internalized sadness, not rejection of you." },
      { title: "Flat expression", body: "May look blank or 'empty'. Research consistently shows autistic children feel emotions just as intensely — their faces just show it differently." },
      { title: "Going quiet", body: "A sudden drop in their usual noise level — fewer sounds, less stimming. Silence below their baseline is a meaningful signal." },
      { title: "Refusing preferred foods", body: "Emotionally-driven food refusal is documented in non-verbal ASD. When a child stops wanting their favourite thing, something emotional is happening." },
    ],
    actions: [
      { title: "Sit near them silently", body: "Your calm physical presence is more soothing than words. For non-verbal children, nearness without demand is the most regulating thing you can offer." },
      { title: "Offer their comfort object", body: "Without asking. Without talking. Just place it near them. Familiar objects reduce cortisol in autistic children during emotional distress." },
      { title: "Play a familiar calm song", body: "Music activates different brain pathways than speech. A known, gentle song can shift emotional state without requiring anything from the child." },
      { title: "Give it time", body: "Autistic children often need longer recovery time from sadness. Resist the urge to 'fix' it quickly. Presence without pressure is the intervention." },
    ],
  },
  {
    id: "angry", emoji: "😤", label: "Angry", color: "#DC2626", bg: "#FEE2E2",
    signs: [
      { title: "Self-injury (SIB)", body: "Head banging, biting self, hitting self. This is communicative — the child is expressing peak frustration they cannot put into words. It is not a behaviour problem." },
      { title: "Hitting or throwing", body: "Aggression peaks during unmet needs, transitions, or sensory overload — not due to bad character. The body is doing what the voice cannot." },
      { title: "Fast or loud breathing", body: "A physiological sign the nervous system is activating. This is the warning window before a meltdown — the moment to intervene calmly." },
      { title: "Pushing things away", body: "Forcefully rejecting objects, food, or people. Research identifies this as a primary non-verbal 'NO' in minimally verbal autistic children. Honour it." },
      { title: "Stomping or pacing", body: "Rhythmic physical release of anger. The body is discharging emotion the only way it knows how without language." },
    ],
    actions: [
      { title: "Regulate yourself first", body: "Your nervous system directly co-regulates your child's. Take one slow breath before responding. A calm parent is the most powerful de-escalation tool available." },
      { title: "Remove all demands", body: "Stop all instructions, questions, and requests the moment you see anger rising. Demands during dysregulation always make it worse — every time." },
      { title: "Reduce the environment", body: "Lower lights, mute sounds, reduce visual clutter. Give physical space without leaving them alone. The environment may be the cause." },
      { title: "Balloon breathing — together", body: "Once the peak passes (not during): inhale 4 counts, hold 4, exhale 6. Do it visibly yourself. Non-verbal children co-regulate through mirroring." },
      { title: "Find the trigger afterward", body: "When calm is restored, ask: what happened 5 minutes before? Transitions? Noise? Hunger? Identifying the trigger prevents the next episode." },
    ],
  },
  {
    id: "confused", emoji: "😕", label: "Confused", color: "#7C3AED", bg: "#EDE9FE",
    signs: [
      { title: "Stimming suddenly increases", body: "Escalating repetitive behaviours signal the nervous system is trying to self-regulate against confusion. It is not bad behaviour — it is a distress response." },
      { title: "Freezing mid-action", body: "Stopping suddenly and staring blankly. The brain has 'paused' to process. Research confirms this is cognitive overload, not defiance." },
      { title: "Hyperfocusing on one object", body: "Fixating on something predictable when the world feels unpredictable. It is self-grounding — the child is narrowing their sensory field to something manageable." },
      { title: "Sudden clinginess", body: "NIH research links confusion in ASD directly to anxiety spikes. Unexplained clinginess often means the child simply doesn't know what comes next." },
      { title: "Sensory seeking escalates", body: "Jumping, spinning, crashing — the brain is trying to re-orient itself using predictable physical input when the situation makes no sense." },
    ],
    actions: [
      { title: "Show, don't tell", body: "Point, gesture, demonstrate. For non-verbal children, visual and physical information bypasses the confusion that verbal language in a distressed state creates." },
      { title: "Go to the visual schedule", body: "Open it together. Point to what comes next. Predictability is the antidote to confusion — it instantly lowers the anxiety that drives the behaviour." },
      { title: "Slow everything down", body: "Move slower, speak slower, reduce background noise. A confused autistic brain needs processing time — urgency and speed make confusion dramatically worse." },
      { title: "Return to a known routine", body: "A familiar song, a known activity, a regular sequence. Predictable structure restores the sense of safety that confusion takes away." },
    ],
  },
  {
    id: "excited", emoji: "🤩", label: "Excited", color: "#6D28D9", bg: "#EDE9FE",
    signs: [
      { title: "Non-stop movement", body: "Running, spinning, jumping — the nervous system is flooded with positive arousal and the body is trying to release it. It looks like happiness, but it needs management." },
      { title: "Very loud vocalizations", body: "High-pitched squealing, screaming, or phrase repetition. Excitement overflow — the child's internal volume has exceeded their capacity to regulate." },
      { title: "Grabbing and touching", body: "Over-excitement can look like aggression. The child isn't trying to harm — their sensory system is flooded and reaching for input without impulse control." },
      { title: "Followed by a crash", body: "Research confirms autistic children frequently meltdown immediately after peak excitement. The nervous system cannot sustain the arousal flood — collapse follows." },
      { title: "Demanding repetition", body: "Wanting the same experience over and over. The brain is chasing the excitement peak and trying to hold on to it by repeating the trigger." },
    ],
    actions: [
      { title: "Go lower — not higher", body: "Lower your voice, slow your movements. Don't match their energy. Your regulated nervous system is the anchor they need when their own is flooding." },
      { title: "Use a visual countdown", body: "Show 5 fingers, then 3, then 1 before ending the exciting activity. Abrupt endings trigger meltdowns — the countdown provides a bridge to transition." },
      { title: "Play a wind-down song", body: "Create a specific calming song used only after exciting events. Over time, the song becomes a nervous system signal: excitement is ending, safety is here." },
      { title: "Schedule recovery time", body: "After known exciting events — parties, outings, school presentations — schedule 30–60 minutes of quiet time. This prevents the post-excitement meltdown." },
    ],
  },
];
//  BEHAVIOUR DATA

export const BEHAVIOURS = [
  {
    id: "saliva", icon: "💧", label: "Playing with Saliva",
    urgency: null,
    summary: "Oral sensory seeking — not a habit or defiance.",
    source: "Behavior Analysis in Practice; NIH PMC; Griffin OT (2024)",
    why: [
      { title: "Oral sensory seeking", body: "The mouth has the densest sensory receptors in the body. Saliva provides texture, temperature, and wetness — a free, always-available sensory input for a child whose oral system is under-stimulated." },
      { title: "Proprioceptive regulation", body: "The jaw is one of the body's most powerful muscles. Oral activity sends strong proprioceptive signals that help organise and calm the nervous system." },
      { title: "A form of stimming", body: "Like hand-flapping or rocking, saliva play is repetitive, rhythmic, and calming. It is not a hygiene failure — it is self-regulation." },
      { title: "Low oral awareness", body: "Some autistic children have reduced sensory awareness around the mouth. They may not realise they are drooling or doing it at all." },
    ],
    actions: ["Rule out medical causes first — enlarged tonsils or oral motor weakness can increase drooling.", "Track when it happens: bored? Stressed? Excited? Timing reveals function.", "Offer safe alternatives: silicone chew necklaces, chewy foods, sour snacks.", "Never punish or shame — calmly redirect to a chew toy without drawing attention."],
  },
  {
    id: "eyepoke", icon: "👁️", label: "Digging Fingers into Eyes",
    urgency: "⚠️ Can damage vision over time. Requires consistent redirection.",
    summary: "Visual stimming — seeking phosphene light sensations.",
    source: "Blue ABA; Wonderbaby.org; Autism Research Institute",
    why: [
      { title: "Seeking phosphenes", body: "Pressing the eyes creates bright flashes of light (phosphenes) generated by pressure on the retina. For a visually under-stimulated child, this is genuinely fascinating and calming." },
      { title: "Activates the calm reflex", body: "Eye pressure activates the oculocardiac reflex, which slows the heart rate. The child may have discovered this accidentally and uses it to self-soothe." },
      { title: "Response to overwhelm", body: "Often escalates during sensory overload or anxiety — pressing the eyes shuts out chaotic external visual input and replaces it with predictable internal sensation." },
      { title: "Boredom", body: "In low-stimulation environments, pressing the eyes creates a more interesting visual experience than the surroundings." },
    ],
    actions: ["Get an eye exam first — undiagnosed vision problems can trigger this.", "Offer rich visual alternatives: lava lamps, fibre optic lights, glitter jars.", "Gently redirect hands to a fidget toy when you see it starting.", "🚨 If frequent and forceful: see an ophthalmologist — repeated pressure can damage the retina."],
  },
  {
    id: "skinpick", icon: "🩹", label: "Skin Picking Until Bleeding",
    urgency: "🚨 Medical alert — open wounds risk infection. Clean and cover immediately.",
    summary: "Sensory seeking or emotional dysregulation — not deliberate self-harm.",
    source: "CHOP Autism Roadmap; NIH PMC; Journal of Autism & Developmental Disorders (2024)",
    why: [
      { title: "Sensory seeking (most common)", body: "Research from CHOP confirms skin picking in ASD is primarily driven by the sensory feedback it provides — pressure, slight pain, and texture create an input that regulates an under-stimulated nervous system." },
      { title: "Emotional dysregulation outlet", body: "A 2024 NIH study found self-rubbing and scratching are most strongly linked to emotion dysregulation. When a child cannot express frustration or anxiety verbally, the body becomes the outlet." },
      { title: "Automatic reinforcement", body: "The behaviour itself feels good — creating an internal sensory reward that is very hard to extinguish without providing a meaningful replacement." },
      { title: "Anxiety and transition stress", body: "Picking escalates sharply during high-anxiety periods, transitions, or demand situations. It becomes a coping ritual — repetitive, predictable, calming." },
    ],
    actions: ["🚨 If bleeding: clean with antiseptic, cover, see a doctor if deep.", "Use physical barriers: soft gloves, long sleeves, bandaged target areas.", "Log: What happened before (trigger)? Where on body? What followed? This reveals function.", "Offer competing sensory input: textured fidgets, kinetic sand, bumpy mats.", "Request a Functional Behaviour Assessment (FBA) from a BCBA — this is the clinical gold standard."],
  },
  {
    id: "hairpull", icon: "🌀", label: "Pulling Own Hair",
    urgency: "⚠️ Bald patches need professional support. Swallowed hair can cause intestinal blockage.",
    summary: "Trichotillomania — sensory-compulsive behaviour, not a choice.",
    source: "NIH PMC11363882 (Cureus, 2024); Autism Research Institute",
    why: [
      { title: "Tactile sensory seeking", body: "The texture of hair between fingers and the sensation of pulling and release provides intense proprioceptive input. For sensory-seeking children, this is genuinely pleasurable." },
      { title: "Tension-release cycle", body: "A 2024 NIH study confirms hair pulling produces a 'sense of relief' — the nervous system experiences a brief tension-and-release that is immediately and powerfully calming." },
      { title: "Compulsive pattern", body: "Studies confirm 24.7% of autistic children have co-morbid compulsive behaviours including trichotillomania. The pulling becomes ritualistic and shares features with OCD-spectrum behaviours." },
      { title: "Anxiety response", body: "Escalates during transitions, new environments, or academic demands. It is a coping mechanism — predictable, controllable, immediately soothing for an overwhelmed nervous system." },
    ],
    actions: ["See a paediatrician or psychiatrist first to assess for co-occurring anxiety or OCD.", "Keep hands busy: fidget tools, textured gloves, putty, yarn balls.", "Use physical barriers at high-risk times: hats, hair clips, hoods.", "Ask your OT about Habit Reversal Training (HRT) adapted for ASD.", "🚨 If child swallows hair: seek medical attention immediately."],
  },
  {
    id: "pica", icon: "🚨", label: "Eating Non-Food Items (Pica)",
    urgency: "🚨 DANGEROUS — can cause poisoning, choking, blockage. Requires immediate medical assessment.",
    summary: "Affects 23–46% of autistic children. Sensory, nutritional, or compulsive in origin.",
    source: "Autism Research Institute; NIH PMC; DSM-5; Autism Parenting Magazine (2025)",
    why: [
      { title: "Oral sensory seeking", body: "The most common driver. Non-food items often provide stronger sensory feedback than food — more intense texture, temperature, or chewing resistance." },
      { title: "Nutritional deficiency", body: "NIH research links pica to iron, zinc, and calcium deficiencies — the body craves non-food items to compensate for missing minerals. Blood tests can identify this." },
      { title: "Compulsive and automatic", body: "For many children, pica becomes a compulsive routine maintained by automatic reinforcement — the eating itself feels rewarding regardless of environment." },
      { title: "Anxiety and overwhelm", body: "The oral act of eating activates the parasympathetic nervous system and has a genuine calming effect, even when the item is non-food." },
    ],
    actions: ["🚨 IMMEDIATELY: Remove paint chips, coins, batteries, soil from all accessible areas.", "See a doctor urgently — request blood tests for iron, zinc, calcium, and lead.", "Never leave unsupervised in environments where pica occurs.", "Offer safe oral alternatives: food-grade chew toys, crunchy foods, chewable sensory jewellery.", "🏥 If dangerous item swallowed (battery, coin, sharp object): go to A&E immediately."],
  },
];
// Maps a Supabase "subsidies" row to the shape the Subsidies screen renders.

export const SEMANTIC_ICONS = {
  "Happy stimming":
    <><path d="M5 13 Q9 16 13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M4 8 Q4 5 7 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M14 8 Q14 5 11 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M6 9 L5 7 M12 9 L13 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/></>,
  "Jumping or spinning":
    <><circle cx="9" cy="4" r="2" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M7 6.5 L5 10 L8 9 L9 13 L10 9 L13 10 L11 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M6 15 L12 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/></>,
  "Happy sounds":
    <><path d="M5 6 Q5 9 5 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.35"/>
      <path d="M8 4 Q8 9 8 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
      <path d="M11 5.5 Q11 9 11 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M14 7 Q14 9 14 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.45"/>
      <path d="M4 9 Q9 6 14 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.2" fill="none"/></>,
  "Approaching you":
    <><circle cx="13" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M13 6.5 L13 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M11 8.5 L13 11 L15 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5"/>
      <path d="M4 14 L10 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M4 10 L4 14 L8 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  "Relaxed body":
    <><path d="M5 9 Q9 5 13 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M4 12 Q9 16 14 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.5"/>
      <circle cx="9" cy="9" r="1.5" fill="currentColor" opacity="0.7"/></>,
  "Join in — don't stop it":
    <><circle cx="5.5" cy="9" r="3" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <circle cx="12.5" cy="9" r="3" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M8.5 9 L9.5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M5.5 6 L5.5 4 M12.5 6 L12.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/></>,
  "Name what made them happy":
    <><rect x="3" y="4" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M6 7.5 L12 7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M6 10 L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
      <path d="M13 2 L15 4 L13 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6"/></>,
  "Repeat it soon":
    <><path d="M4 9 Q4 4 9 4 Q14 4 14 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M14 9 Q14 14 9 14 Q4 14 4 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M12 6.5 L14 9 L16 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="9" cy="9" r="1.5" fill="currentColor" opacity="0.7"/></>,
  "Looking away more":
    <><ellipse cx="9" cy="9" rx="6" ry="4" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <circle cx="9" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <circle cx="9" cy="9" r="0.8" fill="currentColor"/>
      <path d="M13.5 4.5 L15.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/></>,
  "Retreating or hiding":
    <><path d="M9 14 L9 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M6 5 L9 8 L12 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M3 14 L15 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/>
      <path d="M5 11 L4 14 M13 11 L14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/></>,
  "Flat expression":
    <><circle cx="9" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <circle cx="7" cy="7" r="0.8" fill="currentColor"/>
      <circle cx="11" cy="7" r="0.8" fill="currentColor"/>
      <path d="M6.5 10.5 L11.5 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></>,
  "Going quiet":
    <><path d="M7 5 L7 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.2"/>
      <path d="M10 7 L10 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.3"/>
      <path d="M13 8 L13 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.2"/>
      <path d="M3 9 L15 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.1"/>
      <path d="M4 6 L4 6.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6"/></>,
  "Refusing preferred foods":
    <><circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M5.5 9 L12.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M6 6 L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/></>,
  "Sit near them silently":
    <><circle cx="6" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M4 14 L4 10 Q6 8 8 10 L8 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M10 14 L10 10 Q12 8 14 10 L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M8 12 L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/></>,
  "Offer their comfort object":
    <><path d="M9 14 C9 14 3.5 10.5 3.5 6.5 C3.5 4.5 5 3 6.5 3 C7.5 3 8.5 3.5 9 4.5 C9.5 3.5 10.5 3 11.5 3 C13 3 14.5 4.5 14.5 6.5 C14.5 10.5 9 14 9 14Z" stroke="currentColor" strokeWidth="1.4" fill="none"/></>,
  "Play a familiar calm song":
    <><path d="M7.5 13 L7.5 6 L13.5 5 L13.5 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="6.5" cy="13" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <circle cx="12.5" cy="12" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/></>,
  "Give it time":
    <><circle cx="9" cy="9.5" r="6" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M9 6 L9 10 L12 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 2.5 L11 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/></>,
  "Self-injury (SIB)":
    <><path d="M5 5 L13 13 M13 5 L5 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.7"/>
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.3" fill="none"/></>,
  "Hitting or throwing":
    <><path d="M4 13 L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 4 L14 4 L14 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="14" cy="4" r="1.5" fill="currentColor" opacity="0.6"/>
      <path d="M4 13 L4 16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/></>,
  "Fast or loud breathing":
    <><path d="M3 9 Q5 5 7 9 Q9 13 11 9 Q13 5 15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M3 12 Q6 10 9 12 Q12 14 15 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3"/></>,
  "Pushing things away":
    <><path d="M12 9 L5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M7 6 L4 9 L7 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M14 5 L14 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M14 5 L16 5 M14 13 L16 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/></>,
  "Stomping or pacing":
    <><ellipse cx="7" cy="14" rx="3" ry="1.5" stroke="currentColor" strokeWidth="1.3" fill="none" opacity="0.4"/>
      <path d="M7 14 L7 8 L6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M7 8 L10 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M3 9 Q7 7 11 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3" strokeDasharray="2 2"/></>,
  "Regulate yourself first":
    <><circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M9 5.5 L9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M6 7 Q9 10 12 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.5"/>
      <circle cx="9" cy="9" r="1.2" fill="currentColor" opacity="0.6"/></>,
  "Remove all demands":
    <><path d="M4 9 L14 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 6 L15 9 L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M5 5 L5 7 M8 4 L8 7 M11 5 L11 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35"/></>,
  "Reduce the environment":
    <><path d="M3 10 L9 4 L15 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M5 10 L5 15 L13 15 L13 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M7 15 L7 12 L11 12 L11 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M2 9 L4 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/></>,
  "Balloon breathing — together":
    <><circle cx="9" cy="8" r="5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M9 13 L9 16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
      <path d="M7 15.5 L11 15.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/>
      <path d="M6.5 7.5 Q9 6 11.5 7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.5"/></>,
  "Find the trigger afterward":
    <><circle cx="7.5" cy="7.5" r="4.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M11 11 L15 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M5.5 7.5 L9.5 7.5 M7.5 5.5 L7.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/></>,
  "Stimming suddenly increases":
    <><path d="M3 13 Q5 9 7 11 Q9 13 11 7 Q13 1 15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M13 3 L15 5 L13 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  "Freezing mid-action":
    <><circle cx="9" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M9 6.5 L9 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M6 9 L9 12 L12 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.4"/>
      <path d="M6 13 L12 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.7"/>
      <path d="M4 15 L14 15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.25"/></>,
  "Hyperfocusing on one object":
    <><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.6"/>
      <circle cx="8" cy="8" r="1" fill="currentColor"/>
      <path d="M12 12 L15.5 15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></>,
  "Sudden clinginess":
    <><circle cx="6" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M9 7.5 Q6 8 5 11 L5 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M9 7.5 Q12 8 13 11 L13 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M7 11 Q9 10 11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></>,
  "Sensory seeking escalates":
    <><path d="M4 14 Q4 9 9 9 Q14 9 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M4 11 Q6.5 8 9 8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4"/>
      <path d="M6 8 Q9 4 12 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M8 6 Q9 3 10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></>,
  "Show, don't tell":
    <><rect x="3" y="4" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M8 12 L8 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/>
      <path d="M5 15 L11 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/>
      <path d="M14 7 L16 9 L14 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M13 9 L16 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></>,
  "Go to the visual schedule":
    <><rect x="3" y="3" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M6 3 L6 5 M12 3 L12 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M5 8.5 L13 8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
      <path d="M6 11 L9 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.7"/></>,
  "Slow everything down":
    <><circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M9 5 L9 9.5 L12.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 2.5 L12 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/>
      <path d="M7.5 1.5 L7.5 3.5 M10.5 1.5 L10.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/></>,
  "Return to a known routine":
    <><path d="M13 5 Q15 9 13 13 Q9 16 5 13 Q2 9 5 5 Q9 2 13 5Z" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M11 3.5 L13 5 L11.5 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.6"/></>,
  "Non-stop movement":
    <><path d="M3 9 Q5 5 7 9 Q9 13 11 9 Q13 5 15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M13 7 L15 9 L13 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  "Very loud vocalizations":
    <><path d="M4 6 Q4 9 4 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.3"/>
      <path d="M7 4 Q7 9 7 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.55"/>
      <path d="M10 2.5 Q10 9 10 15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M13 5 Q13 9 13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.45"/>
      <path d="M16 7 Q16 9 16 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.25"/></>,
  "Grabbing and touching":
    <><path d="M6 14 L6 8 Q6 6.5 7.5 6.5 Q9 6.5 9 8 L9 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M9 10 L9 7.5 Q9 6 10.5 6 Q12 6 12 7.5 L12 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M12 10 L12 8 Q12 6.5 13.5 6.5 Q15 6.5 15 8 L15 12 Q15 15 12 15 L9 15 Q6 15 6 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  "Followed by a crash":
    <><path d="M3 5 Q9 3 15 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M9 5 L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6 9 L9 12 L12 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M4 14 L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5"/></>,
  "Demanding repetition":
    <><path d="M4 9 Q4 5 9 5 Q14 5 14 9 Q14 13 9 13 Q4 13 4 9" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M6 7 L9 7 L12 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/>
      <path d="M6 9 L12 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M6 11 L9 11 L12 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/>
      <path d="M15.5 7 L17 9 L15.5 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  "Go lower — not higher":
    <><path d="M3 5 L15 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.3"/>
      <path d="M3 9 L15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <path d="M3 13 L15 13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M12 11 L15 13 L12 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  "Use a visual countdown":
    <><circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M9 5 L9 9 L13 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.5 3 L4 1.5 M12.5 3 L14 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/></>,
  "Play a wind-down song":
    <><path d="M7.5 13 L7.5 6 L13.5 5 L13.5 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="6.5" cy="13" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <circle cx="12.5" cy="12" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M3 9 Q5 7 7 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.35"/></>,
  "Schedule recovery time":
    <><rect x="3" y="4" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M7 4 L7 6 M11 4 L11 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M5 9 L13 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.25"/>
      <path d="M6 11.5 Q9 10 12 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M8 13 L10 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/></>,
};

// Fallback for any title not in the lookup — elegant concentric mark

export const FallbackIcon = ({ color, active }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="6.5" stroke={active ? "white" : color} strokeWidth="1.4" fill="none" opacity={active ? 1 : 0.8}/>
    <circle cx="9" cy="9" r="3" fill={active ? "white" : color} opacity={active ? 1 : 0.6}/>
  </svg>
);

export const SignActionIcon = ({ title, color, bg, active }) => {
  const paths = SEMANTIC_ICONS[title];
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: active ? color : (bg || color + "15"),
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, border: `1px solid ${active ? "transparent" : color + "22"}`,
      transition: "background 0.2s, border-color 0.2s",
      color: active ? "white" : color,
    }}>
      {paths
        ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none" color={active ? "white" : color}>{paths}</svg>
        : <FallbackIcon color={color} active={active} />
      }
    </div>
  );
};

export function EmotionDetail({ e, tab, setTab, onBack }) {
  const [openIdx, setOpenIdx] = useState(null);
  const items = tab === "signs" ? e.signs : e.actions;
  return (
    <Page>
      <button onClick={onBack} style={{ background: "none", border: "none", color: T.purple, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody, padding: "0 0 16px", display: "flex", alignItems: "center", gap: 6 }}>← Back</button>


      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: "16px 18px", background: e.bg, borderRadius: T.rL }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", flexShrink: 0, overflow: "hidden", border: `2px solid ${e.color}30` }}>
          <EmotionIllustration id={e.id} size={56} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 3px", fontSize: 20, fontWeight: 800, color: e.color }}>{e.label}</p>
          <p style={{ margin: 0, color: T.inkSoft, fontSize: 11, fontStyle: "italic", lineHeight: 1.5 }}>{e.source}</p>
        </div>
      </div>


      <div style={{ display: "flex", background: T.border, borderRadius: T.r, padding: 3, gap: 3, marginBottom: 20 }}>
        {[
          { v: "signs",   label: "Signs to Look For", svgPath: <><circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.4" fill="none"/><circle cx="9" cy="9" r="2" fill="currentColor"/></> },
          { v: "actions", label: "What To Do",        svgPath: <><path d="M4 9 L7.5 12.5 L14 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/></> },
        ].map(({ v, label, svgPath }) => (
          <button key={v} onClick={() => { setTab(v); setOpenIdx(null); }}
            style={{ flex: 1, padding: "10px 8px", borderRadius: 9, background: tab === v ? T.surface : "transparent", border: "none", fontWeight: 700, fontSize: 13, color: tab === v ? e.color : T.inkMuted, cursor: "pointer", fontFamily: T.fontBody, boxShadow: tab === v ? T.shadow : "none", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" color={tab === v ? e.color : T.inkMuted}>{svgPath}</svg>
            {label}
          </button>
        ))}
      </div>


      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => {
          const isOpen = openIdx === i;
          return (
            <Card key={i} onClick={() => setOpenIdx(isOpen ? null : i)}
              style={{ background: isOpen ? e.bg : T.surface, border: `1px solid ${isOpen ? e.color + "30" : T.border}`, transition: "all 0.2s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <SignActionIcon title={item.title} color={e.color} bg={e.bg} active={isOpen} />
                <p style={{ flex: 1, margin: 0, fontWeight: 700, color: T.ink, fontSize: 14, lineHeight: 1.4 }}>{item.title}</p>
                <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 20, transform: isOpen ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block", flexShrink: 0 }}>+</span>
              </div>
              {isOpen && (
                <div style={{ margin: "12px 0 0 48px", padding: "10px 12px", background: T.surface, borderRadius: T.r }}>
                  <p style={{ margin: 0, color: T.inkSoft, fontSize: 13, lineHeight: 1.75 }}>{item.body}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </Page>
  );
}

export function BehaviourDetail({ b, onBack }) {
  const [openWhy, setOpenWhy] = useState(null);
  const [showActions, setShowActions] = useState(false);
  return (
    <Page>
      <button onClick={onBack} style={{ background: "none", border: "none", color: T.purple, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody, padding: "0 0 16px", display: "flex", alignItems: "center", gap: 6 }}>← Back</button>
      {b.urgency && (
        <div style={{ background: T.redL, borderRadius: T.r, padding: "12px 14px", marginBottom: 16, border: `1px solid ${T.red}30` }}>
          <p style={{ margin: 0, color: T.red, fontWeight: 800, fontSize: 13, lineHeight: 1.6 }}>{b.urgency}</p>
        </div>
      )}
      <div style={{ padding: "18px 16px", background: T.purpleL, borderRadius: T.rL, marginBottom: 20 }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>{b.icon}</div>
        <p style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: T.ink }}>{b.label}</p>
        <p style={{ margin: "0 0 10px", color: T.inkSoft, fontSize: 13, lineHeight: 1.6 }}>{b.summary}</p>
        <p style={{ margin: 0, color: T.inkMuted, fontSize: 11, fontStyle: "italic" }}>Source: {b.source}</p>
      </div>

      <SectionLabel style={{ marginBottom: 10 }}>Why does this happen?</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {b.why.map((w, wi) => (
          <Card key={wi} onClick={() => setOpenWhy(openWhy === wi ? null : wi)}
            style={{ border: `1px solid ${openWhy === wi ? T.purple + "30" : T.border}`, background: openWhy === wi ? T.purpleL : T.surface }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <SignActionIcon title={w.title} color={T.purple} bg={T.purpleL} active={openWhy === wi} />
              <p style={{ flex: 1, margin: 0, fontWeight: 700, color: T.ink, fontSize: 14 }}>{w.title}</p>
              <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 20, transform: openWhy === wi ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block" }}>+</span>
            </div>
            {openWhy === wi && (
              <div style={{ margin: "12px 0 0 48px", padding: "10px 12px", background: T.surface, borderRadius: T.r }}>
                <p style={{ margin: 0, color: T.inkSoft, fontSize: 13, lineHeight: 1.75 }}>{w.body}</p>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card onClick={() => setShowActions(!showActions)} style={{ background: showActions ? T.greenL : T.surface }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, fontWeight: 800, color: showActions ? T.green : T.ink, fontSize: 14 }}>✅ What should I do?</p>
          <span style={{ color: T.inkMuted, fontWeight: 300, fontSize: 20, transform: showActions ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "block" }}>+</span>
        </div>
        {showActions && (
          <div style={{ marginTop: 14 }}>
            {b.actions.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: i < b.actions.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: T.green, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <p style={{ margin: 0, color: T.inkSoft, fontSize: 13, lineHeight: 1.65, flex: 1 }}>{step}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </Page>
  );
}
