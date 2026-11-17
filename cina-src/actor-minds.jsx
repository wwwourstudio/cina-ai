// actor-minds.jsx — Performers with minds of their own.
//
// Every Vault performer has an inner state — disposition, demands, disputes —
// and an agent who enforces it. This is the REAL-WORLD-PROBLEMS layer:
// residual disputes, double bookings, script approval, likeness objections.
// Friction surfaces exactly where it hurts: when you try to put the
// performer to work (Deploy / Send to scene), their agent can stop the shot
// until you settle. Settlements cost real things — credits, points, schedule.
//
//   window.actorMind(actor)          → { mood, dispute, agent } (persisted)
//   window.actorMindBlocks(actor)    → false | dispute (blocks deploy?)
//   window.openNegotiation(actor, onResolved) → agent negotiation modal
//   <ActorTalentDesk chars onOpen/>  → roster-wide dispute strip for the Vault
//
// State persists per actor in localStorage ("cina:actor-minds").

const { useState: usAM, useEffect: ueAM } = React;

// ─── Persistence ─────────────────────────────────────────────────────────
const AM_KEY = "cina:actor-minds";
function amLoad() { try { return JSON.parse(localStorage.getItem(AM_KEY) || "{}"); } catch { return {}; } }
function amSave(all) { try { localStorage.setItem(AM_KEY, JSON.stringify(all)); } catch {} }
function amPatch(actorId, patch) {
  const all = amLoad();
  all[actorId] = { ...(all[actorId] || {}), ...patch };
  amSave(all);
  window.dispatchEvent(new Event("actor-minds-updated"));
}

// ─── The problem pool — real industry friction, synthetic performers ─────
// Each dispute: what the performer wants, what the agent says, and the
// resolution options with real costs. `blocking` stops deploy until settled.
const AM_DISPUTES = [
  {
    id: "residuals",
    tag: "RESIDUALS DISPUTE",
    blocking: true,
    severity: "high",
    wants: "Unpaid back-residuals cleared before any new work",
    agentLine: (a, ag) => `${ag.agent} here. ${a.name.split(" ")[0]}'s Q1 residuals — 412 credits — are still outstanding. No new scenes render until the ledger clears. This is non-negotiable; it's in the rider.`,
    context: "Streaming residuals from the last release window were never routed to the performer's contract. The agent froze availability.",
    options: [
      { id: "pay",     label: "Clear the ledger · 412 credits", cost: "412 credits", outcome: "settled", note: "Paid in full. Availability restored immediately.", goodwill: +12 },
      { id: "partial", label: "Pay half now, half on next release", cost: "206 credits", outcome: "settled-uneasy", note: "Accepted, reluctantly. Goodwill takes a hit.", goodwill: -4 },
      { id: "dispute", label: "Dispute the claim", cost: "Arbitration · 5 days", outcome: "escalated", note: "Goes to arbitration. Performer unavailable 5 days.", goodwill: -15 },
    ],
  },
  {
    id: "double-booked",
    tag: "SCHEDULING CONFLICT",
    blocking: true,
    severity: "high",
    wants: "Exclusive window honored — or bought out",
    agentLine: (a, ag) => `You're aware ${a.name.split(" ")[0]} signed a Q4 exclusive with Studio Akiyama? Your night-market sequence lands inside their window. Buy out the conflict or move your shoot.`,
    context: "The performer took outside work through their agent. The exclusivity window collides with your production schedule.",
    options: [
      { id: "buyout",  label: "Buy out the window · 800 credits", cost: "800 credits", outcome: "settled", note: "Akiyama releases the dates. Expensive but clean.", goodwill: +4 },
      { id: "reslot",  label: "Move your shoot 3 weeks", cost: "Schedule slip", outcome: "settled-uneasy", note: "Your release date slips. The crew grumbles.", goodwill: +6 },
      { id: "recast",  label: "Recast the role", cost: "Lose continuity", outcome: "severed", note: "The performer walks. All trained identity is shelved.", goodwill: -100 },
    ],
  },
  {
    id: "script-approval",
    tag: "CREATIVE DEMAND",
    blocking: true,
    severity: "medium",
    wants: "Script approval on scenes involving their likeness",
    agentLine: (a, ag) => `${a.name.split(" ")[0]} read the new pages. Scene 22 plays against the persona we've spent two years building. We want approval rights on likeness-bearing scenes going forward — or scene 22 gets rewritten.`,
    context: "The performer's persona model flagged scene 22 as out-of-character. Their agent is leveraging it into an approval clause.",
    options: [
      { id: "grant",   label: "Grant scene approval rights", cost: "Creative control", outcome: "settled", note: "They approve scene 22 with one line change. Precedent set.", goodwill: +10 },
      { id: "rewrite", label: "Rewrite scene 22 only", cost: "Writer pass · 1 day", outcome: "settled", note: "The Writer agent redrafts. No precedent.", goodwill: +5 },
      { id: "refuse",  label: "Shoot it as written", cost: "Relationship", outcome: "escalated", note: "They show up. The performance is... flat. QC drops 18%.", goodwill: -20 },
    ],
  },
  {
    id: "likeness-brand",
    tag: "LIKENESS OBJECTION",
    blocking: false,
    severity: "medium",
    wants: "Spirits campaign declined despite the fee",
    agentLine: (a, ag) => `The Hennessy campaign — we're passing. ${a.name.split(" ")[0]}'s audience skews young and the persona contract has a no-alcohol rider. The 4,800 fee doesn't change that. Stop forwarding these.`,
    context: "A lucrative brand deal conflicts with the performer's persona rules. Their agent declined on principle — and wants the category blocked.",
    options: [
      { id: "respect", label: "Block the category permanently", cost: "Future revenue", outcome: "settled", note: "Category blocked in the rider. Trust deepens.", goodwill: +14 },
      { id: "once",    label: "Ask them to reconsider once", cost: "Goodwill", outcome: "settled-uneasy", note: "They decline again. It cost you to ask.", goodwill: -8 },
    ],
  },
  {
    id: "rate-renegotiation",
    tag: "RATE RENEGOTIATION",
    blocking: false,
    severity: "low",
    wants: "Scale bump after the last film's numbers",
    agentLine: (a, ag) => `${a.name.split(" ")[0]} carried your last release — 84% finish rate, half the social clips are their scenes. Current scale is below market. We want 15% on the next production and a residual point.`,
    context: "Your performer became more valuable than their contract. Classic.",
    options: [
      { id: "meet",    label: "Meet it · +15% and a point", cost: "Margin", outcome: "settled", note: "Signed. They post about it. Other agents notice.", goodwill: +15 },
      { id: "counter", label: "Counter · +8%, no point", cost: "Some margin", outcome: "settled-uneasy", note: "Accepted after a week of silence.", goodwill: -2 },
      { id: "stall",   label: "Revisit after next film", cost: "Risk", outcome: "escalated", note: "They take the Akiyama meeting they'd been declining.", goodwill: -12 },
    ],
  },
  {
    id: "costar",
    tag: "CO-STAR FRICTION",
    blocking: false,
    severity: "low",
    wants: "No two-shots with The Subject until blocking changes",
    agentLine: (a, ag) => `Small one. The blocking in the interrogation scenes keeps putting ${a.name.split(" ")[0]} in The Subject's key light. Persona model reads it as upstaging — twelve takes of friction. Restage, or shoot singles.`,
    context: "Two synthetic performers' staging preferences conflict. Yes, this is a real thing now.",
    options: [
      { id: "restage", label: "Restage the scene", cost: "Board pass · 2h", outcome: "settled", note: "Visual agent restages. Both personas read clean.", goodwill: +6 },
      { id: "singles", label: "Shoot singles + stitch", cost: "2× render cost", outcome: "settled", note: "Works. Costs double the credits per take.", goodwill: +2 },
      { id: "ignore",  label: "Keep the blocking", cost: "QC risk", outcome: "escalated", note: "Continuity drift in every two-shot. Editor flags 9 takes.", goodwill: -6 },
    ],
  },
];

// ─── Deterministic assignment: each actor gets a stable current dispute ──
function amSeedDispute(actor) {
  const seed = actor.seed || (actor.id.charCodeAt(1) * 31);
  // Lead roles attract bigger problems
  const isLead = /protagonist|antagonist/i.test(actor.role || "");
  const pool = isLead ? AM_DISPUTES : AM_DISPUTES.slice(2);
  return pool[seed % pool.length];
}

function actorMind(actor) {
  if (!actor) return null;
  const saved = amLoad()[actor.id] || {};
  const dispute = saved.resolvedId === amSeedDispute(actor).id ? null : amSeedDispute(actor);
  const goodwill = saved.goodwill != null ? saved.goodwill : 50 + ((actor.seed || 7) % 30);
  const ag = (window.AGENT_NAMES && window.AGENT_NAMES[actor.id]) || { agent: (actor.name || "X").split(" ")[0] + "-AI", firm: "Independent" };
  return {
    goodwill,
    mood: goodwill > 70 ? "committed" : goodwill > 45 ? "professional" : goodwill > 25 ? "wary" : "adversarial",
    dispute,
    agent: ag,
    lastResolution: saved.lastResolution || null,
  };
}

function actorMindBlocks(actor) {
  const m = actorMind(actor);
  return m && m.dispute && m.dispute.blocking ? m.dispute : false;
}

// ─── Negotiation modal ───────────────────────────────────────────────────
function NegotiationModal({ actor, onClose, onResolved }) {
  const mind = actorMind(actor);
  const [picked, setPicked] = usAM(null);
  const [done, setDone] = usAM(null);
  if (!mind || !mind.dispute) return null;
  const d = mind.dispute;
  const ag = mind.agent;

  const resolve = (opt) => {
    const newGoodwill = Math.max(0, Math.min(100, mind.goodwill + opt.goodwill));
    amPatch(actor.id, {
      resolvedId: opt.outcome === "escalated" ? null : d.id,
      goodwill: newGoodwill,
      lastResolution: { disputeId: d.id, optionId: opt.id, outcome: opt.outcome, at: Date.now() },
      ...(opt.outcome === "escalated" ? { escalatedAt: Date.now() } : {}),
    });
    setDone(opt);
    if (window.pushActivity) window.pushActivity("director", `${actor.name} · ${d.tag.toLowerCase()} — ${opt.outcome === "escalated" ? "escalated" : "settled"} (${opt.label})`);
    if (opt.outcome !== "escalated" && onResolved) setTimeout(() => onResolved(opt), 900);
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2400, background: "rgba(0,0,0,.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 620, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto",
        background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
        boxShadow: "0 40px 100px rgba(0,0,0,.6)",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--c-blood)", color: tkc("ink"), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 600, fontSize: "var(--fs-lead)", flexShrink: 0 }}>
            {ag.agent[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink)", fontWeight: 600, letterSpacing: ".08em" }}>{ag.agent}</span>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" }}>{ag.firm.toUpperCase()}</span>
            </div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-blood-l)", letterSpacing: ".16em", marginTop: 3 }}>
              {d.tag} · REPRESENTING {actor.name.toUpperCase()}
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost btn-icon" style={{ width: 30, height: 30 }} aria-label="Close" title="Close">✕</button>
        </div>

        {done ? (
          <div style={{ padding: "36px 28px", textAlign: "center" }}>
            <div style={{
              width: 52, height: 52, margin: "0 auto 16px", borderRadius: "50%",
              background: done.outcome === "escalated" ? "var(--c-blood)" : "var(--c-good)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-title)",
              color: done.outcome === "escalated" ? tkc("ink") : tkc("panel"),
            }}>{done.outcome === "escalated" ? "!" : "✓"}</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", marginBottom: 10 }}>
              {done.outcome === "escalated" ? "It escalated." : "Settled."}
            </div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6, maxWidth: 400, margin: "0 auto 20px" }}>{done.note}</div>
            <button className="btn btn-primary" style={{ height: 36, padding: "0 20px" }} onClick={onClose} aria-label="Close" title="Close">
              {done.outcome === "escalated" ? "Understood" : "Back to work"}
            </button>
          </div>
        ) : (
          <>
            {/* The agent speaks */}
            <div style={{ padding: "20px 22px 6px" }}>
              <div style={{
                padding: "16px 18px", background: "var(--c-bg)", border: "1px solid var(--c-line)",
                borderLeft: "2px solid var(--c-blood)", borderRadius: "var(--r-2)",
                fontSize: "var(--fs-body)", lineHeight: 1.65, color: "var(--c-ink)", fontStyle: "italic",
              }}>
                “{d.agentLine(actor, ag)}”
              </div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)", lineHeight: 1.55, margin: "12px 2px 4px" }}>{d.context}</div>
            </div>

            {/* Goodwill meter */}
            <div style={{ padding: "8px 22px 4px", display: "flex", alignItems: "center", gap: 10 }}>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>GOODWILL</span>
              <div style={{ flex: 1, height: 4, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                <div style={{ width: mind.goodwill + "%", height: "100%", borderRadius: "var(--r-1)", background: mind.goodwill > 45 ? "var(--c-good)" : "var(--c-warn)" }}/>
              </div>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{mind.goodwill} · {actorMind(actor).mood.toUpperCase()}</span>
            </div>

            {/* Options */}
            <div style={{ padding: "12px 22px 22px", display: "flex", flexDirection: "column", gap: 8 }}>
              {d.options.map(opt => (
                <button key={opt.id} onClick={() => setPicked(opt.id)} onDoubleClick={() => resolve(opt)} style={{
                  display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center",
                  padding: "13px 16px", textAlign: "left", cursor: "pointer", borderRadius: "var(--r-2)",
                  background: picked === opt.id ? "rgba(var(--accent-rgb),.08)" : "var(--c-bg)",
                  border: `1px solid ${picked === opt.id ? "var(--c-amber)" : "var(--c-line-2)"}`,
                  color: "inherit",
                }}>
                  <span>
                    <span style={{ display: "block", fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)" }}>{opt.label}</span>
                    <span style={{ display: "block", fontSize: "var(--fs-body)", color: "var(--c-ink-4)", marginTop: 3 }}>{opt.note}</span>
                  </span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: opt.goodwill >= 0 ? "var(--c-good)" : "var(--c-blood-l)", letterSpacing: ".08em", whiteSpace: "nowrap" }}>
                    {opt.cost.toUpperCase()}
                  </span>
                </button>
              ))}
              <button
                disabled={!picked}
                onClick={() => { const o = d.options.find(x => x.id === picked); if (o) resolve(o); }}
                className="btn btn-primary"
                style={{ height: 40, marginTop: 6, opacity: picked ? 1 : .4 }}
              >
                Make the call
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function openNegotiation(actor, onResolved) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = ReactDOM.createRoot ? ReactDOM.createRoot(host) : null;
  const close = () => { try { root ? root.unmount() : ReactDOM.unmountComponentAtNode(host); } catch {} host.remove(); };
  const el = <NegotiationModal actor={actor} onClose={close} onResolved={onResolved}/>;
  if (root) root.render(el); else ReactDOM.render(el, host);
}

// ─── Talent desk — roster-wide strip for the Vault ──────────────────────
function ActorTalentDesk({ chars, onNegotiate }) {
  const [, force] = usAM(0);
  ueAM(() => {
    const f = () => force(n => n + 1);
    window.addEventListener("actor-minds-updated", f);
    return () => window.removeEventListener("actor-minds-updated", f);
  }, []);

  const issues = (chars || []).map(c => ({ c, mind: actorMind(c) })).filter(x => x.mind && x.mind.dispute);
  if (!issues.length) return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderBottom: "1px solid var(--c-line)", background: "var(--c-panel)" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-good)" }}/>
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>TALENT DESK · ALL QUIET — NO OPEN DISPUTES</span>
    </div>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", borderBottom: "1px solid var(--c-line)", background: "rgba(195,69,57,.04)", overflowX: "auto" }}>
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-blood-l)", flexShrink: 0, fontWeight: 700 }}>
        TALENT DESK · {issues.length} OPEN
      </span>
      {issues.map(({ c, mind }) => (
        <button key={c.id} onClick={() => onNegotiate ? onNegotiate(c) : openNegotiation(c)} style={{
          display: "flex", alignItems: "center", gap: 8, padding: "5px 12px 5px 7px", flexShrink: 0,
          background: "var(--c-bg)", border: `1px solid ${mind.dispute.blocking ? "rgba(195,69,57,.5)" : "var(--c-line-2)"}`,
          borderRadius: "var(--r-3)", cursor: "pointer", color: "inherit",
        }}>
          <span style={{
            width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
            background: (c.color || tkc("ink-3")) + "33", border: `1px solid ${c.color || tkc("ink-3")}`,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-label)", color: c.color || "var(--c-ink)",
          }}>{(c.name || "?")[0]}</span>
          <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", whiteSpace: "nowrap" }}>
            {(c.name || "").split(" ")[0]} · <span style={{ color: mind.dispute.blocking ? "var(--c-blood-l)" : "var(--c-warn)" }}>{mind.dispute.tag.toLowerCase()}</span>
          </span>
          {mind.dispute.blocking && <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-blood-l)", border: "1px solid rgba(195,69,57,.4)", borderRadius: "var(--r-1)", padding: "1px 4px", flexShrink: 0 }}>BLOCKS WORK</span>}
        </button>
      ))}
    </div>
  );
}

Object.assign(window, { actorMindBlocks, openNegotiation, ActorTalentDesk });
