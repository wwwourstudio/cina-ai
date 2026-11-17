// actor-agent.jsx — The Actor Agent Page.
//
// Every digital performer has its own AI agent that:
//   • Tracks earnings (royalties, residuals, commercial fees, buyout offers)
//   • Manages the actor's DNA (identity vector that drives every render)
//   • Negotiates job & commercial requests with creators and brands
//   • Recruits and buys out talent from other creators
//   • Runs a structured training workflow to grow performance range
//
// Open via:  window.openActorAgent(actorId)
// Returns a full-screen modal mounted at z=2000.

const { useState: useStateAA, useEffect: useEffectAA, useMemo: useMemoAA, useRef: useRefAA } = React;

// ─── Synthetic agent + market data per actor ────────────────────────────

const AGENT_NAMES = {
  c1: { agent: "ARIA-9",   firm: "Talents Synthetic, ICM-AI division" },
  c2: { agent: "ECHELON",  firm: "WME × Lattice" },
  c3: { agent: "PILOT",    firm: "CAA Synthetic Casting" },
  c4: { agent: "MUSE",     firm: "UTA Generative" },
};

function agentFor(actor) {
  return AGENT_NAMES[actor.id] || { agent: actor.name.split(" ")[0] + "-AI", firm: "Independent" };
}

// Earnings over last 12 weeks — deterministic from seed
function earningsHistory(actor) {
  const seed = actor.seed || 117;
  const base = (actor.credits || 500) / 12;
  return Array.from({ length: 12 }).map((_, i) => {
    const noise = ((seed * (i + 3) * 17) % 80) / 100;
    return Math.round(base * (0.6 + noise) + (i / 12) * base * 0.4);
  });
}

// Live job & commercial requests — deterministic from seed
function jobsForActor(actor) {
  const seed = actor.seed || 117;
  const pool = [
    { kind: "film",    from: "Tao Reng",         project: "Frequency 88.6 (S2)",  role: "The Operator",      fee: 1800, days: 12, status: "offer",        urgency: "high",   note: "Locked window — 3 weeks." },
    { kind: "series",  from: "Yara Kim",         project: "The Fence",            role: "Sheriff Holroyd",   fee: 3200, days: 22, status: "negotiating",  urgency: "medium", note: "Holdback clause under review." },
    { kind: "short",   from: "Mira Chen",        project: "Bluejay (prequel)",    role: "Voice-only",        fee: 480,  days: 3,  status: "offer",        urgency: "low",    note: "Voice-only · in-character." },
    { kind: "film",    from: "Boris Helm",       project: "Carrion II",           role: "The Surveyor",      fee: 2400, days: 18, status: "counter",      urgency: "medium", note: "Counter-offer +12%, +on-screen credit." },
    { kind: "guest",   from: "Dax Whorl",        project: "Static Falls",         role: "Episodic guest",    fee: 620,  days: 4,  status: "review",       urgency: "low",    note: "Genre fit good. Hold for read-through." },
    { kind: "feature", from: "Studio Akiyama",   project: "Untitled noir",        role: "Lead",              fee: 8400, days: 38, status: "offer",        urgency: "high",   note: "Lead. Exclusive Q4." },
  ];
  // Pick 3-4 deterministically
  const count = 3 + (seed % 2);
  const rotated = pool.slice(seed % pool.length).concat(pool.slice(0, seed % pool.length));
  return rotated.slice(0, count);
}

function commercialsForActor(actor) {
  const seed = actor.seed || 117;
  const pool = [
    { brand: "Patagonia",      campaign: "Mountain Time",        fee: 2200, term: "6 mo",  region: "Global",  status: "offer",       fit: 92, note: "Aligned with grain palette." },
    { brand: "Ritual",         campaign: "Quiet vitamins",       fee: 1400, term: "3 mo",  region: "NA",      status: "offer",       fit: 78, note: "Voice-over plus stills." },
    { brand: "Hennessy",       campaign: "Black Tie",            fee: 4800, term: "12 mo", region: "EU+JP",   status: "negotiating", fit: 86, note: "Spirits — flagged for usage rules." },
    { brand: "Equinox",        campaign: "Don't Quit",           fee: 1100, term: "3 mo",  region: "NA",      status: "review",      fit: 64, note: "Tone slightly off-brand." },
    { brand: "Aesop",          campaign: "Object Permanence",    fee: 1900, term: "9 mo",  region: "Global",  status: "offer",       fit: 88, note: "Library-quiet aesthetic match." },
    { brand: "Saint Laurent",  campaign: "Noir Eau de Parfum",   fee: 6200, term: "12 mo", region: "Global",  status: "counter",     fit: 91, note: "Counter accepted. Awaiting talent sign-off." },
  ];
  const count = 2 + (seed % 3);
  const rotated = pool.slice((seed * 3) % pool.length).concat(pool.slice(0, (seed * 3) % pool.length));
  return rotated.slice(0, count);
}

function buyoutOffersForActor(actor) {
  const seed = actor.seed || 117;
  if (seed % 7 === 0) return [];
  const pool = [
    { from: "Apex Pictures", offer: 24000, terms: "Full IP transfer, perpetual",     status: "rejected" },
    { from: "Halo Studios",  offer: 38500, terms: "Co-ownership · 60/40 split",      status: "negotiating" },
    { from: "Lantern Films", offer: 12000, terms: "Genre lockout (horror only)",     status: "offer" },
  ];
  return pool.slice(0, 1 + (seed % 3));
}

// DNA dimensions — the genetic/identity vector that drives every render.
function dnaForActor(actor) {
  const seed = actor.seed || 117;
  const r = (n) => ((seed * n * 13) % 100);
  return {
    likeness: {
      "Face geometry":   65 + r(2) % 30,
      "Eye spacing":     45 + r(3) % 35,
      "Jaw structure":   50 + r(5) % 40,
      "Skin tone":       40 + r(7) % 50,
      "Hair texture":    30 + r(11) % 60,
      "Brow density":    35 + r(13) % 45,
    },
    motion: {
      "Gait cadence":    r(17),
      "Posture":         r(19),
      "Hand idle":       r(23),
      "Micro-tells":     r(29),
      "Eye-line drift":  r(31),
    },
    voice: {
      "Pitch (Hz)":      90 + r(37) % 120,
      "Rasp":            r(41),
      "Sibilance":       r(43),
      "Breath length":   r(47),
      "Cadence":         r(53),
    },
    emotion: {
      "Resting affect":  r(59),
      "Joy ceiling":     r(61),
      "Anger floor":     r(67),
      "Tear threshold":  r(71),
      "Restraint":       60 + r(73) % 35,
    },
    seed: seed * 1009 + 7351,
    fingerprint: `0x${(seed * 0xCAFEFACE).toString(16).slice(0, 12).padStart(12, "0")}`,
  };
}

// Training arc — 6-stage workflow
const TRAINING_STAGES = [
  { id: "anchor",   label: "Identity anchor",  desc: "Lock face, body, voice fundamentals so renders never drift.", target: 7,  unit: "ref portraits" },
  { id: "range",    label: "Range",            desc: "Run dialogue clips across genres until micro-expressions read clean.", target: 24, unit: "test clips" },
  { id: "physical", label: "Physicality",      desc: "Train walk, stillness, props. Hands and posture must read as hers.", target: 18, unit: "motion takes" },
  { id: "voice",    label: "Voice",            desc: "Generate vocal samples across 6 emotional registers.", target: 36, unit: "vocal takes" },
  { id: "scene",    label: "Scene work",       desc: "Multi-actor scenes — eyeline, reaction, blocking continuity.", target: 12, unit: "ensemble scenes" },
  { id: "stress",   label: "Stress & continuity", desc: "Holds identity under extreme blur, water, smoke, fast cuts.", target: 8,  unit: "edge cases" },
];

function trainingProgressFor(actor) {
  const trained = Math.min(99, actor.training || 60);
  // distribute across stages
  return TRAINING_STAGES.map((s, i) => {
    const ideal = trained - (i * 8);
    const pct = Math.max(0, Math.min(100, ideal + (((actor.seed || 117) * (i + 1)) % 12)));
    return { ...s, pct: Math.round(pct), done: Math.round((pct / 100) * s.target) };
  });
}

// ─── Mount helpers ───────────────────────────────────────────────────────

function openActorAgent(actorId) {
  window.dispatchEvent(new CustomEvent("cina:openActorAgent", { detail: actorId }));
}
function ActorAgentHost() {
  const [actorId, setActorId] = useStateAA(null);
  useEffectAA(() => {
    const handler = (e) => setActorId(e.detail);
    window.addEventListener("cina:openActorAgent", handler);
    const esc = (e) => { if (e.key === "Escape") setActorId(null); };
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("cina:openActorAgent", handler);
      window.removeEventListener("keydown", esc);
    };
  }, []);
  if (!actorId) return null;
  const actor = (window.CHARACTERS || []).find(a => a.id === actorId);
  if (!actor) return null;
  return <ActorAgentPage actor={actor} onClose={() => setActorId(null)}/>;
}

// ─── Main page ───────────────────────────────────────────────────────────

function ActorAgentPage({ actor, onClose }) {
  const [tab, setTab] = useStateAA("overview");
  const [minted, setMinted] = useStateAA(() => {
    try { return localStorage.getItem(`cina:actor-minted:${actor.id}`) === "1"; } catch (e) { return false; }
  });
  const [mintOpen, setMintOpen] = useStateAA(false);
  const mintActor = () => {
    setMinted(true);
    try { localStorage.setItem(`cina:actor-minted:${actor.id}`, "1"); } catch (e) {}
    setMintOpen(false);
  };
  const ag = agentFor(actor);
  const earnings = useMemoAA(() => earningsHistory(actor), [actor.id]);
  const totalEarnings = earnings.reduce((a, b) => a + b, 0);
  const jobs = useMemoAA(() => jobsForActor(actor), [actor.id]);
  const commercials = useMemoAA(() => commercialsForActor(actor), [actor.id]);
  const buyouts = useMemoAA(() => buyoutOffersForActor(actor), [actor.id]);
  const dna = useMemoAA(() => dnaForActor(actor), [actor.id]);
  const training = useMemoAA(() => trainingProgressFor(actor), [actor.id]);
  const trainedAvg = Math.round(training.reduce((a, s) => a + s.pct, 0) / training.length);

  const tabs = [
    { id: "overview",    label: "Overview" },
    { id: "dna",         label: "DNA",      hint: "AI generation vector" },
    { id: "jobs",        label: "Jobs",     count: jobs.length },
    { id: "commercials", label: "Commercials", count: commercials.length },
    { id: "agent",       label: "Agent",    hint: "Negotiation & recruiting" },
    { id: "training",    label: "Training", count: `${trainedAvg}%` },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(4,4,6,0.85)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "stretch", justifyContent: "center", padding: 20,
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        flex: 1, maxWidth: "var(--w-page)", maxHeight: "100%",
        background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
        borderRadius: "var(--r-2)", display: "flex", flexDirection: "column",
        boxShadow: "0 36px 96px rgba(0,0,0,.7)", overflow: "hidden",
      }}>
        {/* Header */}
        <header style={{
          padding: "22px 28px 18px",
          borderBottom: "1px solid var(--c-line)",
          display: "grid", gridTemplateColumns: "84px 1fr auto", gap: 18, alignItems: "center",
          background: "linear-gradient(180deg, rgba(var(--accent-rgb),0.04), transparent)",
        }}>
          <div style={{
            width: 84, height: 100, borderRadius: "var(--r-2)", overflow: "hidden",
            background: `linear-gradient(180deg, ${actor.color}33, ${tkc("void")})`,
            border: "1px solid var(--c-line-2)",
          }}>
            {window.ActorPortraitImpl ? (
              <window.ActorPortraitImpl color={actor.color} attrs={{ age: 30, weight: 150, height: 68, build: 38, hair: 50, beard: 20, skin: 40, eyes: 50, posture: 60, gait: 60, voice: 140 }}/>
            ) : (
              <div style={{ width: "100%", height: "100%" }}/>
            )}
          </div>

          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>
              ACTOR AGENT · {ag.firm.toUpperCase()}
            </div>
            <h1 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, color: "var(--c-ink)", margin: "4px 0 4px", letterSpacing: "-0.01em" }}>
              {actor.name}
            </h1>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>
              {actor.role} · {actor.archetype || "—"} · Represented by{" "}
              <span style={{ color: "var(--c-amber)", fontFamily: "var(--f-mono)", letterSpacing: ".08em" }}>{ag.agent}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {minted ? (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 999,
                background: "rgba(124,197,133,0.14)", color: "var(--c-good)",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              }}>
                <Icon name="lock" size={10}/> MINTED · DNA LOCKED
              </span>
            ) : (
              <button onClick={() => setMintOpen(true)} className="btn btn-primary" style={{ height: 32 }}>
                <Icon name="vault" size={11}/> Mint actor
              </button>
            )}
            <button onClick={onClose} className="btn" style={{ height: 32 }} aria-label="Close" title="Close">
              <Icon name="close" size={11}/> Close
            </button>
          </div>
        </header>

        {/* KPI strip */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
          borderBottom: "1px solid var(--c-line)",
        }}>
          <KpiCell label="Total earnings"   value={`${fmt(totalEarnings)} cr`} sub="last 12 weeks"          accent= "var(--c-amber)"/>
          <KpiCell label="Films / series"   value={`${actor.films || 0}`}      sub={`${actor.refs || 0} refs locked`}/>
          <KpiCell label="Open offers"      value={`${jobs.filter(j => j.status === "offer").length + commercials.filter(c => c.status === "offer").length}`} sub={`${jobs.length + commercials.length} total`}/>
          <KpiCell label="Market value"     value={`$${fmt(Math.round(totalEarnings * 4.2))}`} sub="agent estimate"/>
          <KpiCell label="Training"         value={`${trainedAvg}%`}           sub={`${training.filter(s => s.pct >= 80).length}/${training.length} stages locked`}/>
        </div>

        {/* Tabs */}
        <nav style={{
          display: "flex", borderBottom: "1px solid var(--c-line)",
          padding: "0 28px", background: "rgba(8,8,10,0.4)",
        }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "12px 18px", background: "transparent", border: "none", borderRadius: 0,
              borderBottom: tab === t.id ? "2px solid var(--c-amber)" : "2px solid transparent",
              color: tab === t.id ? "var(--c-ink)" : "var(--c-ink-3)",
              fontSize: "var(--fs-body)", fontWeight: tab === t.id ? 600 : 500,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
              transition: "color .14s ease",
            }}>
              {t.label}
              {t.count != null && (
                <span style={{
                  fontSize: "var(--fs-label)", padding: "1px 6px", borderRadius: 999,
                  background: tab === t.id ? "var(--c-amber)" : "var(--c-panel-3)",
                  color: tab === t.id ? tkc("on-amber") : "var(--c-ink-3)",
                  fontFamily: "var(--f-mono)", letterSpacing: ".08em",
                }}>{t.count}</span>
              )}
              {t.hint && (
                <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", fontStyle: "italic", fontFamily: "var(--f-display)" }}>· {t.hint}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Body */}
        {!minted && (
          <div style={{
            padding: "10px 28px", background: "rgba(var(--accent-rgb),0.08)",
            borderBottom: "1px solid rgba(var(--accent-rgb),0.25)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <Icon name="vault" size={13}/>
            <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", flex: 1 }}>
              <strong style={{ color: "var(--c-ink)" }}>{actor.name}</strong> isn't minted yet. Jobs and commercials are blocked until DNA is sealed on-chain.
            </span>
            <button className="btn btn-primary" style={{ height: 28, padding: "0 12px" }} onClick={() => setMintOpen(true)}>
              <Icon name="vault" size={11}/> Mint now
            </button>
          </div>
        )}
        {mintOpen && <MintActorModal actor={actor} dna={dna} onClose={() => setMintOpen(false)} onMint={mintActor}/>}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 32px" }}>
          {tab === "overview"    && <OverviewTab actor={actor} earnings={earnings} jobs={jobs} commercials={commercials} buyouts={buyouts} setTab={setTab}/>}
          {tab === "dna"         && <DnaTab actor={actor} dna={dna} minted={minted} onMint={() => setMintOpen(true)}/>}
          {tab === "jobs"        && <JobsTab actor={actor} jobs={jobs} minted={minted} onMint={() => setMintOpen(true)}/>}
          {tab === "commercials" && <CommercialsTab_actorAgent actor={actor} commercials={commercials} minted={minted} onMint={() => setMintOpen(true)}/>}
          {tab === "agent"       && <AgentTab actor={actor} ag={ag} buyouts={buyouts} minted={minted} onMint={() => setMintOpen(true)}/>}
          {tab === "training"    && <TrainingTab actor={actor} training={training}/>}
        </div>
      </div>
    </div>
  );
}

// ─── Shared bits ──────────────────────────────────────────────────────────

function fmt(n) { return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k" : String(n); }

function KpiCell({ label, value, sub, accent }) {
  return (
    <div style={{ padding: "16px 22px", borderRight: "1px solid var(--c-line)" }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{label.toUpperCase()}</div>
      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: accent || "var(--c-ink)", marginTop: 6, lineHeight: 1, letterSpacing: "-0.01em" }}>{value}</div>
      <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function SectionTitle({ children, hint }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
      <h3 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, color: "var(--c-ink)", margin: 0 }}>{children}</h3>
      {hint && <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{hint}</span>}
    </div>
  );
}

function StatusPill({ status }) {
  const colors = {
    offer:        { bg: "rgba(var(--accent-rgb),0.14)", fg: "var(--c-amber)", label: "Offer in" },
    negotiating:  { bg: "rgba(108,163,184,0.14)", fg: tkc("ink-2"),       label: "Negotiating" },
    counter:      { bg: "rgba(168,88,56,0.14)",  fg: tkc("amber-d"),        label: "Counter sent" },
    review:       { bg: "rgba(180,180,180,0.10)",fg: "var(--c-ink-3)", label: "Under review" },
    rejected:     { bg: "rgba(160,40,40,0.14)",  fg: tkc("bad"),        label: "Rejected" },
    accepted:     { bg: "rgba(70,160,90,0.14)",  fg: tkc("good"),        label: "Accepted" },
  };
  const c = colors[status] || colors.review;
  return (
    <span style={{
      padding: "3px 9px", borderRadius: 999, background: c.bg, color: c.fg,
      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
      textTransform: "uppercase",
    }}>{c.label}</span>
  );
}

// ─── Deal decisions ─────────────────────────────────────────────────────
// Every Accept / Decline / Counter button on this screen was inert: the deal
// desk looked like a working negotiation inbox and changed nothing when you
// used it. Decisions can't live in the deal objects (those are derived per
// render from jobsForActor / commercialsForActor / buyoutOffersForActor), so
// they live here — keyed by actor + deal, persisted, and layered over the
// derived status when a row renders.
const AG_DEALS_KEY = "cina:agent-deals";
function agLoadDeals() {
  try { return JSON.parse(localStorage.getItem(AG_DEALS_KEY)) || {}; } catch (_) { return {}; }
}
let _agDeals = agLoadDeals();
const _agSubs = new Set();
function agBump() { _agSubs.forEach(fn => fn(Date.now())); }
function useAgDeals() {
  const [, setT] = useStateAA(0);
  useEffectAA(() => { _agSubs.add(setT); return () => _agSubs.delete(setT); }, []);
  return _agDeals;
}
const agKey = (actorId, deal) =>
  actorId + "::" + (deal.project || deal.brand || deal.from || "?") + "::" + (deal.role || deal.campaign || deal.terms || "");

// The decided status wins over the seeded one.
function agStatusOf(actorId, deal) {
  const d = _agDeals[agKey(actorId, deal)];
  return d ? d.status : deal.status;
}
function agFeeOf(actorId, deal) {
  const d = _agDeals[agKey(actorId, deal)];
  return d && d.fee != null ? d.fee : (deal.fee != null ? deal.fee : deal.offer);
}

function agDecide(actorId, deal, status, opts) {
  const k = agKey(actorId, deal);
  _agDeals = { ..._agDeals, [k]: { status, at: Date.now(), ...(opts || {}) } };
  try { localStorage.setItem(AG_DEALS_KEY, JSON.stringify(_agDeals)); } catch (_) {}
  agBump();
  const who = deal.from || deal.brand || "the studio";
  const what = deal.project || deal.campaign || "the deal";
  if (window.toast) {
    if (status === "accepted") toast({ title: "DEAL ACCEPTED", text: what + " · " + who + " notified. Contract drafting.", kind: "good" });
    else if (status === "rejected") toast({ title: "DECLINED", text: who + " has been told. " + what + " is off the table.", kind: "info" });
    else if (status === "counter") toast({ title: "COUNTER SENT", text: fmt(opts && opts.fee) + " cr to " + who + " · awaiting their reply.", kind: "good" });
  }
}

// Counter-offer sheet: a counter needs a number, so ask for one.
function AgCounterSheet({ actorId, deal, onClose }) {
  const base = deal.fee != null ? deal.fee : deal.offer || 0;
  const [fee, setFee] = useStateAA(Math.round(base * 1.15));
  const pct = base ? Math.round(((fee - base) / base) * 100) : 0;
  return ReactDOM.createPortal(
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9600, background: "rgba(0,0,0,.66)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 400, background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 22 }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", marginBottom: 9 }}>COUNTER-OFFER</div>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", marginBottom: 4 }}>{deal.project || deal.campaign}</div>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginBottom: 16 }}>
          {deal.from || deal.brand} offered {fmt(base)} cr.
        </div>
        <label className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", display: "block", marginBottom: 7 }}>YOUR NUMBER (CR)</label>
        <input type="number" min="0" max={Math.max(1000, base * 10)} value={fee}
          onChange={e => setFee(Math.max(0, Math.min(Math.max(1000, base * 10), +e.target.value || 0)))} style={{
          width: "100%", boxSizing: "border-box", padding: "11px 13px", background: "var(--c-panel-2)",
          border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink)",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-lead)",
        }}/>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", marginTop: 8, color: pct > 0 ? "var(--c-good)" : pct < 0 ? "var(--c-bad)" : "var(--c-ink-4)" }}>
          {pct > 0 ? "+" : ""}{pct}% ON THEIR OFFER
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
          <button className="btn" style={{ height: 34 }} onClick={onClose} aria-label="Close" title="Close">Cancel</button>
          <button className="btn btn-primary" style={{ height: 34 }} onClick={() => { agDecide(actorId, deal, "counter", { fee }); onClose(); }}>Send counter</button>
        </div>
      </div>
    </div>, document.body);
}

// ─── Tab: Overview ───────────────────────────────────────────────────────

function OverviewTab({ actor, earnings, jobs, commercials, buyouts, setTab }) {
  const max = Math.max(...earnings);
  const totalEarn = earnings.reduce((a, b) => a + b, 0);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 24 }}>
      {/* Left column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {/* Earnings chart */}
        <section>
          <SectionTitle hint="last 12 weeks · ML credits">Earnings</SectionTitle>
          <div style={{
            background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
            padding: "20px 22px",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-amber)", lineHeight: 1 }}>
                {fmt(totalEarn)} cr
              </div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
                ≈ ${fmt(Math.round(totalEarn * 1.4))} USD
              </div>
            </div>
            <svg viewBox="0 0 480 120" style={{ width: "100%", height: 120, display: "block" }}>
              <defs>
                <linearGradient id="earnFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor= "var(--c-amber)" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor= "var(--c-amber)" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {earnings.map((v, i) => {
                const x = (i / (earnings.length - 1)) * 480;
                const y = 110 - (v / max) * 90;
                return <circle key={i} cx={x} cy={y} r={2.5} fill= "var(--c-amber)"/>;
              })}
              <path d={"M " + earnings.map((v, i) => {
                const x = (i / (earnings.length - 1)) * 480;
                const y = 110 - (v / max) * 90;
                return `${x} ${y}`;
              }).join(" L ")} stroke= "var(--c-amber)" strokeWidth="1.5" fill="none"/>
              <path d={"M " + earnings.map((v, i) => {
                const x = (i / (earnings.length - 1)) * 480;
                const y = 110 - (v / max) * 90;
                return `${x} ${y}`;
              }).join(" L ") + ` L 480 120 L 0 120 Z`} fill="url(#earnFill)"/>
            </svg>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--c-line)" }}>
              <EarnSplit label="Royalties"  v={Math.round(totalEarn * 0.42)}/>
              <EarnSplit label="Fees"       v={Math.round(totalEarn * 0.36)}/>
              <EarnSplit label="Residuals"  v={Math.round(totalEarn * 0.22)}/>
            </div>
          </div>
        </section>

        {/* Active negotiations digest */}
        <section>
          <SectionTitle hint={`${jobs.length} jobs · ${commercials.length} commercials`}>Active negotiations</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {jobs.slice(0, 3).map((j, i) => (
              <DigestRow key={`j${i}`} kind="film" who={j.from} project={j.project} fee={j.fee + " cr"} status={j.status} onClick={() => setTab("jobs")}/>
            ))}
            {commercials.slice(0, 2).map((c, i) => (
              <DigestRow key={`c${i}`} kind="brand" who={c.brand} project={c.campaign} fee={c.fee + " cr"} status={c.status} onClick={() => setTab("commercials")}/>
            ))}
          </div>
        </section>
      </div>

      {/* Right column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {/* Buyout offers */}
        <section>
          <SectionTitle hint={buyouts.length ? "talent acquisition" : "no offers"}>Buyout offers</SectionTitle>
          {buyouts.length === 0 ? (
            <EmptyCard>No buyout offers on the table. Your agent will surface here when other studios make bids.</EmptyCard>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {buyouts.map((b, i) => (
                <div key={i} style={{
                  background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
                  padding: "14px 16px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 600 }}>{b.from}</div>
                    <StatusPill status={b.status}/>
                  </div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-amber)", margin: "4px 0 6px" }}>
                    ${fmt(b.offer)} <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", fontStyle: "normal", fontFamily: "var(--f-mono)", letterSpacing: ".08em" }}>USD</span>
                  </div>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>{b.terms}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section>
          <SectionTitle>Agent actions</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ActionRow icon="send"   label="Pitch this actor to a director"   onClick={() => setTab("agent")}/>
            <ActionRow icon="globe"  label="Open commercial market"           onClick={() => setTab("commercials")}/>
            <ActionRow icon="user"   label="Recruit similar talent"           onClick={() => setTab("agent")}/>
            <ActionRow icon="wand"   label="Run training session"             onClick={() => setTab("training")}/>
            <ActionRow icon="vault"  label="View identity DNA"                onClick={() => setTab("dna")}/>
          </div>
        </section>
      </div>
    </div>
  );
}

function EarnSplit({ label, v }) {
  return (
    <div style={{ textAlign: "left" }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{label.toUpperCase()}</div>
      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", marginTop: 4 }}>{fmt(v)} cr</div>
    </div>
  );
}

function DigestRow({ kind, who, project, fee, status, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 14,
      background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
      padding: "12px 14px", textAlign: "left", color: "inherit", cursor: "pointer",
      transition: "border-color .14s ease",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--c-line-2)"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--c-line)"}>
      <div style={{ width: 34, height: 34, borderRadius: "var(--r-1)",
        background: kind === "brand" ? "rgba(108,163,184,0.18)" : "rgba(var(--accent-rgb),0.18)",
        color: kind === "brand" ? tkc("ink-2") :  "var(--c-amber)",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={kind === "brand" ? "globe" : "film"} size={14}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{project}</div>
        <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2 }}>{who} · {fee}</div>
      </div>
      <StatusPill status={status}/>
    </button>
  );
}

function ActionRow({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 12,
      background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
      padding: "11px 14px", textAlign: "left", color: "var(--c-ink-2)", cursor: "pointer",
      transition: "all .14s ease",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--c-amber)"; e.currentTarget.style.color = "var(--c-ink)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--c-line)"; e.currentTarget.style.color = "var(--c-ink-2)"; }}>
      <Icon name={icon} size={13}/>
      <span style={{ fontSize: "var(--fs-body)", flex: 1 }}>{label}</span>
      <Icon name="arrow-right" size={11}/>
    </button>
  );
}

function EmptyCard({ children }) {
  return (
    <div style={{
      background: "var(--c-panel)", border: "1px dashed var(--c-line-2)", borderRadius: "var(--r-2)",
      padding: "20px 22px", fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55, fontStyle: "italic", fontFamily: "var(--f-display)",
    }}>{children}</div>
  );
}

// ─── Tab: DNA ─────────────────────────────────────────────────────────────

function DnaTab({ actor, dna, minted, onMint }) {
  const [editing, setEditing] = useStateAA(false);
  // Once minted, never allow editing.
  useEffectAA(() => { if (minted) setEditing(false); }, [minted]);
  const [vals, setVals] = useStateAA({ ...dna.likeness, ...dna.motion, ...dna.voice, ...dna.emotion });
  const groups = [
    { label: "Likeness",  keys: Object.keys(dna.likeness), color: "var(--c-amber)", icon: "user",  desc: "Drives photo & 3D renders. Locked dims protect identity from drift." },
    { label: "Motion",    keys: Object.keys(dna.motion),   color: tkc("cat-1"), icon: "play",  desc: "Drives video gen — gait, posture, micro-tells." },
    { label: "Voice",     keys: Object.keys(dna.voice),    color: tkc("amber-d"), icon: "vol",   desc: "Drives TTS & dub generation. Pitch in Hz; rest 0–100." },
    { label: "Emotion",   keys: Object.keys(dna.emotion),  color: tkc("good"), icon: "spark", desc: "Range envelope. Higher resting affect = warmer reads." },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28 }}>
      {/* Left: groups */}
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        <div style={{
          background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
          padding: "16px 20px", display: "flex", alignItems: "center", gap: 18,
        }}>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>FINGERPRINT</div>
            <div className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-amber)", marginTop: 4, letterSpacing: ".08em" }}>{dna.fingerprint}</div>
          </div>
          <div style={{ height: 24, width: 1, background: "var(--c-line)" }}/>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>SEED</div>
            <div className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", marginTop: 4 }}>{dna.seed}</div>
          </div>
          <div style={{ flex: 1 }}/>
          {minted ? (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 999,
              background: "rgba(124,197,133,0.14)", color: "var(--c-good)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
            }}>
              <Icon name="lock" size={10}/> DNA SEALED ON-CHAIN
            </span>
          ) : (
            <button className="btn" onClick={() => setEditing(!editing)}>
              <Icon name={editing ? "lock" : "edit"} size={11}/> {editing ? "Lock draft" : "Edit DNA"}
            </button>
          )}
        </div>

        {groups.map(g => (
          <section key={g.label}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
              <h3 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, color: g.color, margin: 0 }}>{g.label}</h3>
              <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{g.desc}</span>
            </div>
            <div style={{
              background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
              padding: "14px 18px",
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 32px",
            }}>
              {g.keys.map(k => (
                <DnaSlider key={k} label={k} value={vals[k]} editable={editing} color={g.color}
                  onChange={v => setVals(prev => ({ ...prev, [k]: v }))}/>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Right: live render */}
      <aside style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 0, alignSelf: "start" }}>
        <SectionTitle>Live preview</SectionTitle>
        <div style={{
          aspectRatio: "3 / 4",
          background: `linear-gradient(180deg, ${actor.color}33, ${tkc("void")})`,
          border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", overflow: "hidden",
          position: "relative",
        }}>
          {window.ActorPortraitImpl && (
            <window.ActorPortraitImpl color={actor.color} attrs={{
              age: 30 + (vals["Face geometry"] || 50) * 0.4,
              weight: 130 + (vals["Jaw structure"] || 50) * 0.6,
              height: 64 + (vals["Face geometry"] || 50) * 0.1,
              build: vals["Jaw structure"] || 50,
              hair: vals["Hair texture"] || 50,
              beard: vals["Brow density"] || 0,
              skin: vals["Skin tone"] || 50,
              eyes: vals["Eye spacing"] || 50,
              posture: vals["Posture"] || 50,
              gait: vals["Gait cadence"] || 50,
              voice: 80 + (vals["Pitch (Hz)"] || 140),
            }}/>
          )}
          <div style={{
            position: "absolute", left: 10, top: 10, padding: "3px 8px",
            background: "rgba(0,0,0,0.6)", borderRadius: 999,
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em",
          }}>● LIVE</div>
        </div>
        <div style={{
          background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
          padding: "12px 14px", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", lineHeight: 1.55,
        }}>
          DNA changes propagate to every active render. Lock the actor's identity before publishing to prevent drift across episodes.
        </div>
        {minted ? (
          <button className="btn btn-primary" style={{ height: 38 }} onClick={() => window.cinaNotYet && window.cinaNotYet("Regenerating a portrait", "Portrait generation runs in the AI studio — open it from the vault.")}>
            <Icon name="wand" size={12}/> Regenerate from DNA </button>
        ) : (
          <button className="btn btn-primary" style={{ height: 38, background: `linear-gradient(135deg, var(--c-amber), ${tkc("amber-d")})` }} onClick={onMint}>
            <Icon name="vault" size={12}/> Mint to lock DNA
          </button>
        )}
        <button className="btn">
          <Icon name="share" size={11}/> Export DNA card (.json)
        </button>
      </aside>
    </div>
  );
}

function DnaSlider({ label, value, onChange, editable, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }}>{label}</span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: color, letterSpacing: ".08em" }}>{Math.round(value)}</span>
      </div>
      {editable ? (
        <input type="range" min={0} max={300} step={1} value={value} onChange={e => onChange(+e.target.value)}
          style={{ accentColor: color, width: "100%" }}/>
      ) : (
        <div style={{ height: 4, background: "var(--c-panel-3)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
          <div style={{ width: `${Math.min(100, value / 3)}%`, height: "100%", background: color }}/>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Jobs ────────────────────────────────────────────────────────────

function JobsTab({ actor, jobs, minted, onMint }) {
  const [filter, setFilter] = useStateAA("all");
  useAgDeals();
  const filtered = filter === "all" ? jobs : jobs.filter(j => agStatusOf(actor.id, j) === filter);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <SectionTitle hint={`${jobs.length} active · agent reviewing`}>Job requests</SectionTitle>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "offer", "negotiating", "counter", "review"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className="btn" data-active={filter === f} style={{ fontSize: "var(--fs-label)", height: 26, padding: "0 10px" }}>
              {f === "all" ? "All" : f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {!minted && (
          <div style={{
            background: "rgba(var(--accent-rgb),0.06)", border: "1px dashed rgba(var(--accent-rgb),0.35)",
            borderRadius: "var(--r-2)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12,
          }}>
            <Icon name="vault" size={13}/>
            <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", flex: 1 }}>
              Acceptance is locked until <strong style={{ color: "var(--c-ink)" }}>{actor.name}</strong> is minted. You can still review and counter.
            </span>
            <button className="btn btn-primary" style={{ height: 28, padding: "0 12px" }} onClick={onMint}>Mint now</button>
          </div>
        )}
        {filtered.map((j, i) => (
          <JobRow key={i} job={j} minted={minted} onMint={onMint} actorId={actor.id}/>
        ))}
        {filtered.length === 0 && <EmptyCard>No jobs in this state right now.</EmptyCard>}
      </div>

      {/* Outbound — pitch this actor */}
      <div style={{ marginTop: 28 }}>
        <SectionTitle hint="Agent pitches actor proactively">Outbound pitches</SectionTitle>
        <div style={{
          background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
          padding: "16px 20px", display: "flex", alignItems: "center", gap: 14,
        }}>
          <Icon name="send" size={14}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 600 }}>Pitch {actor.name.split(" ")[0]} for an open role</div>
            <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2 }}>Agent will craft the read & rate, send to selected directors, and surface responses here.</div>
          </div>
          <button className="btn btn-primary" onClick={() => window.cinaNotYet && window.cinaNotYet("Composing a pitch", "Your agent drafts pitches in the Agent tab conversation.")}>Compose pitch </button>
        </div>
      </div>
    </div>
  );
}

function JobRow({ job, minted, onMint, actorId }) {
  const [open, setOpen] = useStateAA(false);
  const [counter, setCounter] = useStateAA(false);
  useAgDeals();
  const status = agStatusOf(actorId, job);
  const fee = agFeeOf(actorId, job);
  const settled = status === "accepted" || status === "rejected";
  return (
    <div style={{
      background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "grid", gridTemplateColumns: "auto 1fr auto auto auto", gap: 16, alignItems: "center",
        padding: "14px 18px", background: "transparent", border: "none", textAlign: "left", color: "inherit", cursor: "pointer",
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: job.urgency === "high" ? tkc("bad") : job.urgency === "medium" ? "var(--c-amber)" : "var(--c-ink-4)",
        }}/>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 600 }}>{job.project}</div>
          <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2 }}>
            <span style={{ color: "var(--c-amber)" }}>{job.role}</span> · {job.kind} · {job.from}
          </div>
        </div>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{fmt(fee)} cr</div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em" }}>{job.days}d</div>
        <StatusPill status={status}/>
      </button>
      {open && (
        <div style={{ borderTop: "1px solid var(--c-line)", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", fontStyle: "italic", fontFamily: "var(--f-display)", lineHeight: 1.55 }}>
            {job.note}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: "10px 0", borderTop: "1px dashed var(--c-line)", borderBottom: "1px dashed var(--c-line)" }}>
            <Stat k="Fee"          v={`${fmt(fee)} cr`}/>
            <Stat k="Shoot days"   v={`${job.days}d`}/>
            <Stat k="Genre"        v={job.kind}/>
            <Stat k="Exclusivity"  v={job.kind === "feature" ? "Q4" : "—"}/>
          </div>
          {settled ? (
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: status === "accepted" ? "var(--c-good)" : "var(--c-ink-4)", textAlign: "right" }}>
              {status === "accepted" ? "ACCEPTED · CONTRACT DRAFTING" : "DECLINED"}
              <button className="btn" style={{ height: 24, fontSize: "var(--fs-label)", marginLeft: 10 }} onClick={() => agDecide(actorId, job, job.status)}>Undo</button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => agDecide(actorId, job, "rejected")}>Decline</button>
              <button className="btn" onClick={() => setCounter(true)}>Counter-offer</button>
              {minted ? (
                <button className="btn btn-primary" onClick={() => agDecide(actorId, job, "accepted", { fee })}>Accept</button>
              ) : (
                <button className="btn" title="Mint actor to accept" onClick={onMint} style={{ opacity: 0.55, cursor: "pointer" }}>
                  <Icon name="lock" size={10}/> Mint to accept
                </button>
              )}
            </div>
          )}
          {counter && <AgCounterSheet actorId={actorId} deal={job} onClose={() => setCounter(false)}/>}
        </div>
      )}
    </div>
  );
}

function Stat({ k, v, label, value }) {
  return <CinaStat size="sm" label={k ?? label} value={v ?? value}/>;
}

// ─── Tab: Commercials ─────────────────────────────────────────────────────

function CommercialsTab_actorAgent({ actor, commercials, minted, onMint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionTitle hint="brand deals routed via agent · usage rules apply">Commercial requests</SectionTitle>
      {!minted && (
        <div style={{
          background: "rgba(var(--accent-rgb),0.06)", border: "1px dashed rgba(var(--accent-rgb),0.35)",
          borderRadius: "var(--r-2)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12,
        }}>
          <Icon name="vault" size={13}/>
          <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", flex: 1 }}>
            Brand deals can't be accepted until <strong style={{ color: "var(--c-ink)" }}>{actor.name}</strong> is minted on-chain.
          </span>
          <button className="btn btn-primary" style={{ height: 28, padding: "0 12px" }} onClick={onMint}>Mint now</button>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {commercials.map((c, i) => (
          <CommercialCard key={i} c={c} minted={minted} onMint={onMint} actorId={actor.id}/>
        ))}
      </div>

      {/* Brand allow-list / no-go */}
      <section style={{ marginTop: 12 }}>
        <SectionTitle hint="categories the agent will / won't accept">Brand rules</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <RuleList title="Allowed" items={["Apparel · luxury", "Spirits · premium", "Tech · hardware", "Editorial print", "Films & series"]} positive/>
          <RuleList title="Blocked" items={["Crypto exchanges", "Gambling", "Political ads", "Pharmaceuticals", "Religious institutions"]}/>
        </div>
      </section>
    </div>
  );
}

function CommercialCard({ c, minted, onMint, actorId }) {
  const [counter, setCounter] = useStateAA(false);
  useAgDeals();
  const status = agStatusOf(actorId, c);
  const fee = agFeeOf(actorId, c);
  const settled = status === "accepted" || status === "rejected";
  return (
    <div style={{
      background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
      padding: "16px 18px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 600 }}>{c.brand}</div>
        <StatusPill status={status}/>
      </div>
      <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>{c.campaign}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "12px 0 10px" }}>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-amber)" }}>{fmt(fee)} cr</div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>· {c.term} · {c.region}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, height: 4, background: "var(--c-panel-3)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
          <div style={{ width: `${c.fit}%`, height: "100%", background: c.fit >= 80 ? tkc("good") : c.fit >= 65 ? "var(--c-amber)" : tkc("bad") }}/>
        </div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{c.fit}% fit</div>
      </div>
      <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", fontStyle: "italic", fontFamily: "var(--f-display)" }}>{c.note}</div>
      {settled ? (
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", color: status === "accepted" ? "var(--c-good)" : "var(--c-ink-4)" }}>
          <span>{status === "accepted" ? "ACCEPTED" : "DECLINED"}</span>
          <button className="btn" style={{ height: 24, fontSize: "var(--fs-label)" }} onClick={() => agDecide(actorId, c, c.status)}>Undo</button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          <button className="btn" style={{ flex: 1 }} onClick={() => agDecide(actorId, c, "rejected")}>Decline</button>
          <button className="btn" style={{ flex: 1 }} onClick={() => setCounter(true)}>Counter</button>
          {minted ? (
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => agDecide(actorId, c, "accepted", { fee })}>Accept</button>
          ) : (
            <button className="btn" style={{ flex: 1, opacity: 0.55 }} onClick={onMint} title="Mint actor to accept">
              <Icon name="lock" size={10}/> Mint to accept
            </button>
          )}
        </div>
      )}
      {counter && <AgCounterSheet actorId={actorId} deal={c} onClose={() => setCounter(false)}/>}
    </div>
  );
}

function RuleList({ title, items, positive }) {
  return (
    <div style={{
      background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
      padding: "14px 18px",
    }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: positive ? tkc("good") : tkc("bad"), letterSpacing: ".16em", marginBottom: 10 }}>{title.toUpperCase()}</div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((it, i) => (
          <li key={i} style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: positive ? tkc("good") : tkc("bad") }}>{positive ? "✓" : "✕"}</span> {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Tab: Agent (negotiations + recruit/buyout) ───────────────────────────

function AgentTab({ actor, ag, buyouts, minted, onMint }) {
  const [tab, setTab] = useStateAA("inbox");
  const [buyoutCounter, setBuyoutCounter] = useStateAA(null);
  useAgDeals();
  const [chatLog, setChatLog] = useStateAA([
    { from: "agent",  t: "9:14 AM", text: `${ag.agent} on watch. Two new offers came in this morning. Hennessy is ready to close.` },
    { from: "you",    t: "9:18 AM", text: "Push back on Hennessy. We've talked about not doing spirits this year." },
    { from: "agent",  t: "9:18 AM", text: "Acknowledged. I'll counter — non-alcoholic editorial only, +18% fee. Should land tomorrow." },
  ]);
  const [draft, setDraft] = useStateAA("");
  const send = () => {
    if (!draft.trim()) return;
    const t = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setChatLog(prev => [...prev, { from: "you", t, text: draft.trim() }]);
    setDraft("");
    setTimeout(() => {
      setChatLog(prev => [...prev, { from: "agent", t, text: "Got it — drafting and routing now. I'll surface a result in your inbox once they respond." }]);
    }, 900);
  };

  const subs = [
    { id: "inbox",     label: "Negotiations" },
    { id: "recruit",   label: "Recruit talent" },
    { id: "buyout",    label: "Buyout center", count: buyouts.length },
    { id: "rules",     label: "Agent rules" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
      {/* Left: subtab body */}
      <div>
        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
          {subs.map(s => (
            <button key={s.id} onClick={() => setTab(s.id)} className="btn" data-active={tab === s.id} style={{ fontSize: "var(--fs-label)", padding: "0 12px", height: 30 }}>
              {s.label}
              {s.count != null && <span style={{ marginLeft: 6, color: "var(--c-amber)" }}>{s.count}</span>}
            </button>
          ))}
        </div>

        {tab === "inbox"   && <NegotiationsInbox/>}
        {tab === "recruit" && <RecruitTalent actor={actor}/>}
        {tab === "buyout"  && <BuyoutCenter actor={actor} buyouts={buyouts}/>}
        {tab === "rules"   && <AgentRules ag={ag}/>}
      </div>

      {/* Right: agent chat */}
      <aside style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", display: "flex", flexDirection: "column", height: "min(100%, 640px)" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${tkc("amber")}, ${tkc("blood")})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-on-amber)", fontWeight: 700 }}>
            {ag.agent.slice(0, 2)}
          </div>
          <div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 600 }}>{ag.agent}</div>
            <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>Your AI agent · always on</div>
          </div>
          <div style={{ flex: 1 }}/>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)", animation: "agentPulse 1.6s ease-in-out infinite" }}/>
        </div>
        <style>{`@keyframes agentPulse { 0%, 100% { opacity: .4 } 50% { opacity: 1 } }`}</style>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {chatLog.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.from === "you" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              background: m.from === "you" ? "var(--c-amber)" : "var(--c-panel-2)",
              color: m.from === "you" ? tkc("on-amber") : "var(--c-ink)",
              padding: "8px 11px", borderRadius: "var(--r-2)",
              fontSize: "var(--fs-body)", lineHeight: 1.5,
            }}>
              {m.text}
              <div style={{ fontSize: "var(--fs-label)", opacity: 0.6, marginTop: 4, fontFamily: "var(--f-mono)" }}>{m.t}</div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid var(--c-line)", padding: 10, display: "flex", gap: 6 }}>
          <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            placeholder={`Message ${ag.agent}…`}
            style={{
              flex: 1, padding: "8px 12px", background: "var(--c-panel-2)",
              border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)",
              color: "var(--c-ink)", outline: "none", fontFamily: "var(--f-sans)",
            }}/>
          <button className="btn btn-primary" onClick={send}><Icon name="send" size={11}/></button>
        </div>
      </aside>
    </div>
  );
}

function NegotiationsInbox() {
  const items = [
    { who: "Hennessy",       last: "Counter sent — non-alcoholic editorial, +18%. Awaiting reply.",   t: "12m ago",   tag: "commercial" },
    { who: "Yara Kim",       last: "Reviewing holdback clause for The Fence.",                         t: "2h ago",    tag: "series" },
    { who: "Studio Akiyama", last: "Initial offer received — Lead, $8.4k, Q4 exclusive.",              t: "Yesterday", tag: "feature" },
    { who: "Apex Pictures",  last: "Buyout rejected — terms too restrictive.",                          t: "3d ago",    tag: "buyout" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((it, i) => (
        <div key={i} style={{
          background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
          padding: "12px 16px", display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ width: 6, height: 36, borderRadius: "var(--r-1)", background: it.tag === "buyout" ? tkc("bad") : it.tag === "commercial" ? tkc("ink-2") : "var(--c-amber)" }}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 600 }}>{it.who}</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 2 }}>{it.last}</div>
          </div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" }}>{it.t}</div>
        </div>
      ))}
    </div>
  );
}

function RecruitTalent({ actor }) {
  const candidates = (window.CHARACTERS || []).filter(c => c.id !== actor.id).slice(0, 5).map((c, i) => ({
    ...c, owner: ["Tao Reng", "Yara Kim", "Boris Helm", "Mira Chen", "Studio Akiyama"][i % 5],
    askPrice: 8000 + (c.seed || 100) * 40,
    similarity: 60 + ((c.seed || 100) * 7) % 38,
  }));
  return (
    <div>
      <div style={{
        background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
        padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 16,
      }}>
        <Icon name="user" size={18}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 600 }}>Talent acquisition</div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 2 }}>Your agent scouts other creators' rosters and surfaces actors with similar DNA. Initiate a buyout to bring them into your studio.</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {candidates.map(c => (
          <div key={c.id} style={{
            background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
            padding: "12px 16px", display: "grid", gridTemplateColumns: "44px 1fr auto auto auto", gap: 14, alignItems: "center",
          }}>
            <div style={{ width: 44, height: 54, borderRadius: "var(--r-1)", overflow: "hidden", background: `linear-gradient(180deg, ${c.color}33, ${tkc("void")})`, border: "1px solid var(--c-line-2)" }}>
              {window.PortraitGlyphImpl?.({ color: c.color })}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2 }}>Owned by {c.owner} · {c.role}</div>
            </div>
            <div style={{ width: 80 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>SIMILARITY</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <div style={{ flex: 1, height: 3, background: "var(--c-panel-3)", borderRadius: "var(--r-1)" }}><div style={{ width: `${c.similarity}%`, height: "100%", background: "var(--c-amber)" }}/></div>
                <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{c.similarity}%</span>
              </div>
            </div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-amber)" }}>${fmt(c.askPrice)}</div>
            <button className="btn btn-primary" onClick={() => window.cinaNotYet && window.cinaNotYet("Making an offer", "Outbound offers go through your agent.")}>Make offer </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BuyoutCenter({ actor, buyouts }) {
  return (
    <div>
      <div style={{
        background: "linear-gradient(180deg, rgba(var(--accent-rgb),0.08), transparent)",
        border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
        padding: "18px 22px", marginBottom: 16,
      }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>INCOMING BIDS FOR {actor.name}</div>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 6 }}>
          {buyouts.length} studio{buyouts.length === 1 ? "" : "s"} are bidding to buy this performer.
        </div>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 6, lineHeight: 1.55 }}>
          Selling transfers identity rights, training history, and royalty stream. Your agent will negotiate terms and protect downstream usage.
        </div>
      </div>

      {buyoutCounter && <AgCounterSheet actorId={actor.id} deal={buyoutCounter} onClose={() => setBuyoutCounter(null)}/>}
      {buyouts.length === 0 ? (
        <EmptyCard>No incoming bids. Your agent is shopping {actor.name} to interested studios — check back soon.</EmptyCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {buyouts.map((b, i) => (
            <div key={i} style={{
              background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
              padding: "16px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 600 }}>{b.from}</div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-amber)", marginTop: 4 }}>${fmt(b.offer)}</div>
                </div>
                <StatusPill status={b.status}/>
              </div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginBottom: 12 }}>{b.terms}</div>
              {agStatusOf(actor.id, b) === "accepted" || agStatusOf(actor.id, b) === "rejected" ? (
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", textAlign: "right", color: agStatusOf(actor.id, b) === "accepted" ? "var(--c-good)" : "var(--c-ink-4)" }}>
                  {agStatusOf(actor.id, b) === "accepted" ? "BUYOUT ACCEPTED · LEGAL NOTIFIED" : "DECLINED"}
                  <button className="btn" style={{ height: 24, fontSize: "var(--fs-label)", marginLeft: 10 }} onClick={() => agDecide(actor.id, b, b.status)}>Undo</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button className="btn" onClick={() => agDecide(actor.id, b, "rejected")}>Decline</button>
                  <button className="btn" onClick={() => setBuyoutCounter(b)}>Counter</button>
                  {minted ? (
                    <button className="btn btn-primary" onClick={async () => {
                      const ok = await (window.cinaConfirm ? window.cinaConfirm({
                        kicker: "This transfers the likeness",
                        title: "Accept " + b.from + "'s buyout?",
                        body: "$" + fmt(b.offer) + " for " + actor.name + " on these terms: " + b.terms + ". Once accepted, future work under this likeness is theirs to license.",
                        confirmLabel: "Accept buyout", danger: true,
                      }) : Promise.resolve(true));
                      if (ok) agDecide(actor.id, b, "accepted", { fee: b.offer });
                    }}>Accept buyout</button>
                  ) : (
                    <button className="btn" style={{ opacity: 0.55 }} onClick={onMint} title="Mint actor to accept">
                      <Icon name="lock" size={10}/> Mint to accept
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AgentRules({ ag }) {
  const rules = [
    { k: "Minimum fee", v: "1,200 cr per shoot day" },
    { k: "No-go list",  v: "Crypto · gambling · politics · pharma" },
    { k: "Exclusivity", v: "Max 90 days, fee +25%" },
    { k: "Holdback",    v: "Allow up to 6 months in genre" },
    { k: "Buyout floor",v: "$25,000 USD or 18× annual royalty" },
    { k: "Royalty split", v: "60% talent · 40% creator" },
    { k: "Auto-decline", v: "Anything below 60% brand fit" },
    { k: "Counter rate", v: "Default +12% on initial offers" },
  ];
  return (
    <div style={{
      background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
      padding: "20px 24px",
    }}>
      <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55, marginBottom: 18, fontStyle: "italic", fontFamily: "var(--f-display)" }}>
        {ag.agent} negotiates within these rules without checking in. Tighten or loosen them anytime.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 28px" }}>
        {rules.map((r, i) => (
          <div key={i} style={{ borderBottom: "1px solid var(--c-line)", paddingBottom: 8 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{r.k.toUpperCase()}</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", marginTop: 4 }}>{r.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Training (workflow) ─────────────────────────────────────────────

function TrainingTab({ actor, training }) {
  const [activeStage, setActiveStage] = useStateAA(training.find(s => s.pct < 100)?.id || training[0].id);
  const [running, setRunning] = useStateAA(false);
  const [progress, setProgress] = useStateAA(training.reduce((acc, s) => ({ ...acc, [s.id]: s.pct }), {}));

  const stage = training.find(s => s.id === activeStage);
  const localPct = progress[stage.id];

  const runSession = () => {
    setRunning(true);
    let p = localPct;
    const tick = setInterval(() => {
      p = Math.min(100, p + Math.random() * 6 + 3);
      setProgress(prev => ({ ...prev, [stage.id]: Math.round(p) }));
      if (p >= 100) { clearInterval(tick); setRunning(false); }
    }, 380);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24 }}>
      {/* Stage list */}
      <aside>
        <SectionTitle>Workflow</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {training.map((s, i) => {
            const p = progress[s.id];
            const active = s.id === activeStage;
            const locked = i > 0 && progress[training[i - 1].id] < 60;
            return (
              <button key={s.id} onClick={() => !locked && setActiveStage(s.id)} disabled={locked} style={{
                background: active ? "var(--c-panel-2)" : "transparent",
                border: "1px solid", borderColor: active ? "var(--c-amber)" : "var(--c-line)",
                borderRadius: "var(--r-2)", padding: "10px 12px", textAlign: "left",
                color: locked ? "var(--c-ink-4)" : "inherit", cursor: locked ? "not-allowed" : "pointer",
                opacity: locked ? 0.5 : 1,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    border: "1px solid", borderColor: p >= 100 ? tkc("good") : active ? "var(--c-amber)" : "var(--c-line-2)",
                    background: p >= 100 ? "rgba(124,197,133,0.18)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: p >= 100 ? tkc("good") : active ? "var(--c-amber)" : "var(--c-ink-3)",
                  }}>{p >= 100 ? "✓" : i + 1}</div>
                  <div style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: active ? "var(--c-ink)" : "var(--c-ink-2)" }}>{s.label}</div>
                </div>
                <div style={{ height: 3, background: "var(--c-panel-3)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                  <div style={{ width: `${p}%`, height: "100%", background: p >= 100 ? tkc("good") : "var(--c-amber)" }}/>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" }}>{p}%</span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" }}>{Math.round((p / 100) * s.target)}/{s.target} {s.unit}</span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Stage detail */}
      <main style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>STAGE {training.findIndex(s => s.id === activeStage) + 1} OF {training.length}</div>
          <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, color: "var(--c-ink)", margin: "6px 0 8px" }}>{stage.label}</h2>
          <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55, maxWidth: 640, margin: 0 }}>{stage.desc}</p>
        </div>

        <div style={{
          background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
          padding: "20px 24px",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 18 }}>
            <Stat k="Target"        v={`${stage.target} ${stage.unit}`}/>
            <Stat k="Completed"     v={`${Math.round((localPct / 100) * stage.target)}`}/>
            <Stat k="Progress"      v={`${localPct}%`}/>
            <Stat k="Est. credits"  v={`+${Math.round(stage.target * 14)} cr`}/>
          </div>

          {/* Progress bar */}
          <div style={{ height: 6, background: "var(--c-panel-3)", borderRadius: "var(--r-1)", overflow: "hidden", marginBottom: 18 }}>
            <div style={{
              width: `${localPct}%`, height: "100%",
              background: localPct >= 100 ? tkc("good") : `linear-gradient(90deg, var(--c-amber), ${tkc("amber-d")})`,
              transition: "width .3s ease",
            }}/>
          </div>

          {/* Substeps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>SESSION TASKS</div>
            {stageTasks(stage).map((t, i) => {
              const threshold = ((i + 1) / 4) * 100;
              const done = localPct >= threshold;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", background: "var(--c-panel-2)", borderRadius: "var(--r-1)",
                  opacity: done ? 1 : 0.6,
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    border: `1px solid ${done ? tkc("good") : "var(--c-line-2)"}`,
                    background: done ? "rgba(124,197,133,0.18)" : "transparent",
                    color: done ? tkc("good") : "var(--c-ink-4)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-label)",
                  }}>{done ? "✓" : ""}</div>
                  <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", flex: 1 }}>{t}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
            <button className="btn" onClick={() => window.toast && toast({ title: "STAGE SKIPPED", text: "Moved on. You can come back to it any time.", kind: "info" })}>Skip stage </button>
            <button className="btn btn-primary" onClick={runSession} disabled={running || localPct >= 100}>
              <Icon name="wand" size={11}/> {running ? "Running training…" : localPct >= 100 ? "Stage complete" : "Run training session"}
            </button>
          </div>
        </div>

        {/* History */}
        <section>
          <SectionTitle hint="recent training events">History</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { t: "Today",       label: `${stage.label} session`, delta: "+12%" },
              { t: "Yesterday",   label: "Identity anchor refresh", delta: "+8%"  },
              { t: "3 days ago",  label: "Voice register expansion", delta: "+15%" },
              { t: "1 week ago",  label: "Wardrobe continuity check", delta: "+4%" },
            ].map((h, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "8px 12px", background: "var(--c-panel)", borderRadius: "var(--r-1)", border: "1px solid var(--c-line)",
              }}>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", width: 90 }}>{h.t}</span>
                <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", flex: 1 }}>{h.label}</span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".08em" }}>{h.delta}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function stageTasks(stage) {
  const tasks = {
    anchor:   ["Capture 7 reference portraits at key angles", "Lock face geometry vector", "Verify facial landmark consistency", "Sign identity hash"],
    range:    ["Generate dramatic clips (4 genres)", "Run micro-expression diff", "Calibrate emotion envelope", "Lock range profile"],
    physical: ["Record walk cycles (3 paces)", "Capture standing stillness baseline", "Train hand idle gestures", "Verify posture continuity"],
    voice:    ["Sample 6 emotional registers", "Train pitch envelope", "Calibrate breath & sibilance", "Lock vocal fingerprint"],
    scene:    ["Generate 2-actor reaction shots", "Verify eyeline continuity", "Test blocking continuity", "Lock ensemble profile"],
    stress:   ["Render under blur / fast cut", "Test water & smoke continuity", "Generate dance / chase motion", "Stress-test identity hash"],
  };
  return tasks[stage.id] || ["Step 1", "Step 2", "Step 3", "Step 4"];
}

// ─── Export ───────────────────────────────────────────────────────────────

// ─── Mint modal ───────────────────────────────────────────────────────────

function MintActorModal({ actor, dna, onMint, onClose }) {
  // Immediately open the PayDrawer and close this modal shell
  const opened = React.useRef(false);
  useEffectAA(() => {
    if (opened.current) return;
    opened.current = true;
    if (window.openPay) {
      window.openPay({
        kind: "nft",
        title: actor.name,
        subtitle: "MINT PERFORMER · DNA LOCK",
        accent: tkc("amber"),
        priceUSD: 42,
        items: [
          { label: "Performer DNA mint", sub: "Locks identity vector on-chain", price: 42 },
        ],
        perks: [
          "DNA fingerprint: " + (dna.fingerprint || "—"),
          "Seed " + (dna.seed || "—") + " · 21 dimensions",
          "Genome becomes permanent after mint",
          "Royalty stream activates on every render",
        ],
        image: { color: actor.color || tkc("amber") },
        onConfirm: () => {
          if (window.toast) window.toast({ title: "MINTED", text: actor.name + " · DNA locked on-chain", kind: "good" });
          onMint();
        },
        onClose: onClose,
      });
    }
    onClose(); // close the modal shell immediately — PayDrawer takes over
  }, []);
  return null;
}

Object.assign(window, { ActorAgentHost });
