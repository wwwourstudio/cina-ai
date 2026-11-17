// watch-cast-v3.jsx — Actor profile, completely redesigned as the HUB that
// connects every performer workflow on Cina.
//
// Overrides ActorProfilePage (from watch-cast-v2.jsx). The page now:
//   · reads the unified TalentAPI record so it reflects live career state
//   · shows the 7-stage career lifecycle rail (birth→…→promote), each stage
//     a working link to the REAL surface (Vault, AI Studio, Pitch, mint…)
//   · surfaces every connected workflow as a card with no dead ends
//   · routes EVERY cross-app jump through TalentAPI.handoff so the target
//     app opens with this performer pre-selected
//
// Loads after watch-cast-v2.jsx.

const { useState: usC3, useMemo: umC3 } = React;

// Cross-app jump with handoff — the fix for the "links that don't work":
// every jump tells the destination which performer we mean.
function xActor(href, payload, toastMsg) {
  if (payload && window.TalentAPI) window.TalentAPI.handoff(payload);
  if (toastMsg && typeof window.toast === "function") window.toast(toastMsg);
  setTimeout(() => {window.location.href = href;}, toastMsg ? 480 : 0);
}

// ─── Career lifecycle rail ────────────────────────────────────────────────
// The connective tissue: the same 7 stages used everywhere, each linking to
// the tool that advances it.
function CareerRailV3({ actor, rec, accent }) {
  const stages = window.TalentAPI && rec ? window.TalentAPI.stages(rec) : {};
  const next = window.TalentAPI && rec ? window.TalentAPI.nextStage(rec) : null;
  const aid = actor.id,aname = actor.name;

  const STAGE_ACTIONS = {
    birth: { glyph: "✶", caption: "Identity locked", go: () => navigate(`/journey/${aid}`) },
    train: { glyph: "◉", caption: "Open AI Studio", go: () => navigate(`/cast/${aid}/studio`) },
    style: { glyph: "✂", caption: "Wardrobe · vault", go: () => xActor("Cina.html", { intent: "vault", actorId: aid, actorName: aname }, { title: "OPENING VAULT", text: `${aname} · wardrobe`, kind: "good" }) },
    mint: { glyph: "◈", caption: "Mint likeness", go: () => {if (window.openPay) window.openPay({ kind: "nft", title: `${aname} · likeness mint`, subtitle: "On-chain identity + royalty routing", priceUSD: 240, accent });if (window.TalentAPI) window.TalentAPI.record(aid, { kind: "mint" });} },
    cast: { glyph: "▶", caption: "Cast in a film", go: () => xActor("Cina.html", { intent: "cast", actorId: aid, actorName: aname }, { title: "OPENING STUDIO", text: `${aname} · cast in your film`, kind: "good" }) },
  };
  const order = window.TalentAPI ? window.TalentAPI.STAGES : [];

  return (
    <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "8px 32px 0" }}>
      <div style={{
        background: "var(--c-panel)", border: "1px solid var(--c-line)",
        borderRadius: "var(--r-2)", padding: "18px 20px"
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", fontWeight: 600 }}>CAREER LIFECYCLE</span>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>ONE PIPELINE · EVERY SURFACE · CLICK A STAGE TO ADVANCE IT</span>
          <span style={{ flex: 1 }}></span>
          <button onClick={() => navigate(`/journey/${aid}`)} className="t-mono" style={{
            fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, background: "transparent",
            border: "none", cursor: "pointer", fontWeight: 600
          }}>FULL CAREER JOURNEY →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${order.length}, 1fr)`, gap: 8 }}>
          {order.map((stg, i) => {
            const done = stages[stg.id];
            const isNext = next === stg.id;
            const act = STAGE_ACTIONS[stg.id] || {};
            return (
              <button key={stg.id} onClick={act.go} title={`${stg.label} · ${act.caption}`} style={{
                position: "relative", textAlign: "left", cursor: "pointer",
                padding: "12px 12px 13px", borderRadius: "var(--r-2)",
                background: isNext ? `${accent}14` : "var(--c-bg)",
                border: `1px solid ${isNext ? accent : done ? "var(--c-line-2)" : "var(--c-line)"}`,
                display: "flex", flexDirection: "column", gap: 7, minHeight: 92
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-body)",
                    background: done ? accent : "transparent",
                    border: done ? "none" : `1px solid var(--c-line-3)`,
                    color: done ? tkc("bg") : "var(--c-ink-3)"
                  }}>{act.glyph}</span>
                  {done ?
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".16em" }}>DONE</span> :
                  isNext ?
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em" }}>NEXT</span> :
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>OPEN</span>}
                </div>
                <div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{String(i + 1).padStart(2, "0")}</div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1.1 }}>{stg.label}</div>
                  <div style={{ fontSize: "var(--fs-label)", color: isNext ? accent : "var(--c-ink-3)", marginTop: 2 }}>{act.caption} →</div>
                </div>
              </button>);

          })}
        </div>
      </div>
    </div>);

}

// ─── Connected workflows — explicit, no dead ends ──────────────────────────
function ConnectedWorkflowsV3({ actor, accent }) {
  const aid = actor.id,aname = actor.name,first = aname.split(" ")[0];
  const isMobile = typeof useIsMobile === "function" ? useIsMobile() : false;
  const cards = [
  { glyph: "✶", eyebrow: "GENERATE", title: "AI Studio", body: "Shoot photoreal stills & motion with locked identity.", cta: "Open studio", go: () => navigate(`/cast/${aid}/studio`), tone: accent },
  { glyph: "◷", eyebrow: "CAREER", title: "Journey", body: "Their whole career on one living timeline.", cta: "View journey", go: () => navigate(`/journey/${aid}`) },
  { glyph: "◈", eyebrow: "IDENTITY", title: "The Vault", body: "Edit the LoRA, wardrobe and aging in the studio vault.", cta: "Open vault", go: () => xActor("Cina.html", { intent: "vault", actorId: aid, actorName: aname }, { title: "OPENING VAULT", text: `${aname}`, kind: "good" }) },
  { glyph: "▶", eyebrow: "PRODUCE", title: "Cast in a film", body: "Bring this performer into your own production.", cta: "Cast " + first, go: () => xActor("Cina.html", { intent: "cast", actorId: aid, actorName: aname }, { title: "OPENING STUDIO", text: `${aname} · cast`, kind: "good" }) }];

  return (
    <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "30px 32px 8px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
        <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, letterSpacing: "-0.01em", margin: 0 }}>Work with {first}</h2>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>EVERY WORKFLOW · ONE TAP AWAY</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12 }}>
        {cards.map((c, i) =>
        <button key={i} onClick={c.go} style={{
          textAlign: "left", cursor: "pointer", padding: "18px 18px 16px", borderRadius: "var(--r-3)",
          background: c.tone ? `linear-gradient(150deg, ${c.tone}16, var(--c-panel) 62%)` : "var(--c-panel)",
          border: `1px solid ${c.tone ? `${c.tone}44` : "var(--c-line)"}`,
          display: "flex", gap: 14, alignItems: "flex-start", color: "inherit",
          transition: "border-color .15s ease, transform .15s ease, box-shadow .15s ease"
        }}
        onMouseEnter={(e) => {e.currentTarget.style.borderColor = c.tone || accent;e.currentTarget.style.transform = "translateY(-3px)";e.currentTarget.style.boxShadow = "0 16px 36px rgba(0,0,0,.4)";}}
        onMouseLeave={(e) => {e.currentTarget.style.borderColor = c.tone ? `${c.tone}44` : "var(--c-line)";e.currentTarget.style.transform = "none";e.currentTarget.style.boxShadow = "none";}}>
            <span aria-hidden="true" style={{
              flexShrink: 0, width: 40, height: 40, borderRadius: "var(--r-3)", marginTop: 2,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: `color-mix(in oklch, ${accent} 16%, transparent)`, color: accent,
              border: `1px solid ${accent}44`, fontSize: "var(--fs-lead)"
            }}>{c.glyph}</span>
            <span style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: 1 }}>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", fontWeight: 600 }}>{c.eyebrow}</span>
              <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1.05, letterSpacing: "-0.01em" }}>{c.title}</span>
              <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.45 }}>{c.body}</span>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", fontWeight: 600, marginTop: 2 }}>{c.cta} →</span>
            </span>
          </button>
        )}
      </div>
    </div>);

}

// ─── Range radar (compact, local) ──────────────────────────────────────────
function RangeRadarV3({ axes, scores, color }) {
  const size = 240,cx = size / 2,cy = size / 2,r = 78;
  const pts = scores.map((s, i) => {
    const a = i / axes.length * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * r * s, cy + Math.sin(a) * r * s];
  });
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ") + " Z";
  const gid = "rr3-" + color.replace(/[^a-z0-9]/gi, "");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}>
      <defs><radialGradient id={gid} cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={color} stopOpacity="0.5" /><stop offset="100%" stopColor={color} stopOpacity="0.05" /></radialGradient></defs>
      {[0.25, 0.5, 0.75, 1].map((g, gi) =>
      <polygon key={gi} points={axes.map((_, i) => {const a = i / axes.length * Math.PI * 2 - Math.PI / 2;return `${cx + Math.cos(a) * r * g},${cy + Math.sin(a) * r * g}`;}).join(" ")} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="0.6" />
      )}
      {axes.map((_, i) => {const a = i / axes.length * Math.PI * 2 - Math.PI / 2;return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r} stroke="rgba(255,255,255,.10)" strokeWidth="0.6" />;})}
      <path d={d} fill={`url(#${gid})`} stroke={color} strokeWidth="1.5" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={color} stroke="var(--c-void)" strokeWidth="1" />)}
      {axes.map((label, i) => {
        const a = i / axes.length * Math.PI * 2 - Math.PI / 2;
        const lx = cx + Math.cos(a) * (r + 22),ly = cy + Math.sin(a) * (r + 22) + 3;
        return (
          <g key={i}>
            <text x={lx} y={ly} textAnchor="middle" fill="var(--c-ink-2)" style={{ font: "9.5px JetBrains Mono", letterSpacing: ".16em", fontWeight: 600 }}>{label.toUpperCase()}</text>
            <text x={lx} y={ly + 11} textAnchor="middle" fill={color} style={{ font: "9px JetBrains Mono", opacity: .85 }}>{Math.round(scores[i] * 100)}</text>
          </g>);

      })}
    </svg>);

}

// ─── The profile ───────────────────────────────────────────────────────────

// Reverse casting map — which performers are currently cast into a Studio
// production role. Mirrors CHARACTERS in data.jsx (Studio side). Closes the
// loop: Studio vault → performer profile → back into the Studio role.
const V3_PRODUCTION = {
  "evren-koll": { charId: "c1", role: "August Rein", film: "Last Light" },
  "nadya-ash":  { charId: "c2", role: "Maren Kell",  film: "Last Light" },
  "domek-ari":  { charId: "c3", role: "Det. Ari Nomura", film: "Last Light" },
  "siri-vale":  { charId: "c4", role: "The Subject", film: "Last Light" },
};

function ActorProfilePageV3({ id }) {
  const actor = typeof getCast === "function" ? getCast(id) : null;
  if (!actor) return <NotFoundPage kicker="The Vault" title="Performer not found." body="They may have been renamed or removed." cta={{ label: "All cast", href: "/cast" }} />;

  const rec = window.TalentAPI ? window.TalentAPI.get(id) : null;
  const films = umC3(() => (actor.roles || []).map((r) => ({
    role: r, film: typeof getFilm === "function" ? getFilm(r.filmId) : null
  })).filter((x) => x.film), [actor]);

  const [activeFilm, setActiveFilm] = usC3(films[0]?.film?.id);
  const accent = tkc("amber");
  const following = typeof isFollowing === "function" && isFollowing(actor.id);

  const coStars = umC3(() => {
    if (typeof CAST === "undefined") return [];
    const set = new Set();
    (actor.roles || []).forEach((r) => {
      CAST.forEach((other) => {
        if (other.id === actor.id) return;
        if ((other.roles || []).some((or) => or.filmId === r.filmId)) set.add(other.id);
      });
    });
    return [...set].map((i) => CAST.find((c) => c.id === i)).filter(Boolean).slice(0, 5);
  }, [actor]);

  const rangeAxes = ["Drama", "Comedy", "Action", "Quiet", "Voice", "Period"];
  const seed = actor.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const rangeScores = rangeAxes.map((_, i) => Math.min(1, 0.5 + seed * (i + 3) % 50 / 100));

  const lic = rec && rec.licensing || { base: 1900, royalty: 27, out: 0 };

  return (
    <div data-screen-label={`Cast · ${actor.name}`} style={{ background: "var(--c-bg)", color: "var(--c-ink)" }}>
      {/* ── Hero ── */}
      <div style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--c-line)" }}>
        {/* Full-bleed portrait wash behind */}
        <div style={{ position: "absolute", inset: 0, opacity: .22 }}>
          <CastPortrait actor={actor} size={1400} shot="wide" cover style={{ width: "100%", height: "100%", borderRadius: 0 }} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(8,8,10,.7) 0%, rgba(8,8,10,.82) 55%, var(--c-bg) 100%)` }}></div>
        <div style={{ position: "absolute", top: -120, right: -120, width: 420, height: 420, borderRadius: "50%", background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`, pointerEvents: "none" }} />

        <div className="m-stack" style={{ maxWidth: "var(--w-page)", margin: "0 auto", position: "relative", display: "grid", gridTemplateColumns: "300px minmax(0,1fr) 320px", gap: 36, alignItems: "stretch", padding: "40px 32px 32px" }}>
          {/* Portrait + palette */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ borderRadius: "var(--r-2)", overflow: "hidden", border: `1px solid ${accent}50`, boxShadow: `0 24px 60px ${accent}30` }}>
              <CastPortrait actor={actor} size={300} shot="wide" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {(actor.palette || []).slice(0, 3).map((c, i) =>
              <div key={i} style={{ padding: "8px 10px", background: c, border: "1px solid rgba(255,255,255,.08)", borderRadius: "var(--r-1)", display: "flex", flexDirection: "column", gap: 2, minHeight: 38 }}>
                  <div style={{ ...{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: i === 1 ? "rgba(0,0,0,.55)" : "rgba(255,255,255,.55)", textTransform: "uppercase" }, color: "rgba(255, 255, 255, 0.55)" }}>{["KEY", "FILL", "ACCENT"][i]}</div>
                  <div style={{ ...{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 600, color: i === 1 ? tkc("on-amber") : "rgba(255,255,255,.9)", letterSpacing: ".08em" }, color: "rgb(255, 255, 255)" }}>{c}</div>
                </div>
              )}
            </div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase", textAlign: "center", marginTop: 2 }}>SIGNATURE COLORWAY · DP REFERENCE</div>
          </div>

          {/* Identity */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 4 }}>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", textTransform: "uppercase" }}>{actor.archetype} · {actor.handle}</span>
            <h1 className="m-h1" style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "clamp(44px, 5.4vw, 88px)", fontWeight: 500, letterSpacing: "-0.03em", margin: 0, lineHeight: 0.94, overflowWrap: "break-word", minWidth: 0 }}>{actor.name}</h1>
            <p style={{ fontSize: "var(--fs-lead)", color: "var(--c-ink-2)", maxWidth: 580, lineHeight: 1.5, margin: "2px 0 0" }}>{actor.bio}</p>

            {V3_PRODUCTION[actor.id] && (
              <button
                onClick={() => xActor("Cina.html", { intent: "vault", actorId: V3_PRODUCTION[actor.id].charId, actorName: V3_PRODUCTION[actor.id].role }, { title: "OPENING STUDIO", text: `${actor.name} · ${V3_PRODUCTION[actor.id].role}`, kind: "good" })}
                title={`Open ${actor.name}'s role in the studio production`}
                style={{
                  alignSelf: "flex-start", marginTop: 10, display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "8px 14px 8px 10px", background: "rgba(var(--accent-rgb),.08)",
                  border: "1px solid rgba(var(--accent-rgb),.32)", borderRadius: 999, cursor: "pointer", color: "inherit",
                }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 6px var(--c-good)" }}></span>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-good)", textTransform: "uppercase" }}>Now in production</span>
                </span>
                <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>
                  Playing <b style={{ color: "var(--c-ink)" }}>{V3_PRODUCTION[actor.id].role}</b> in <i style={{ color: "var(--c-ink)" }}>{V3_PRODUCTION[actor.id].film}</i>
                </span>
                <span style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)" }}>↗</span>
              </button>
            )}

            <div style={{ display: "flex", gap: 0, marginTop: 14, border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden", background: "rgba(0,0,0,.3)", backdropFilter: "blur(8px)" }}>
              {[
              { l: "APPEARANCES", v: actor.appearances },
              { l: "FOLLOWERS", v: `${(actor.followers / 1000).toFixed(0)}K` },
              { l: "LEADS", v: (actor.roles || []).filter((r) => r.lead).length },
              { l: "LICENSES", v: lic.out }].
              map((s, i) =>
              <div key={s.l} style={{ flex: 1, padding: "12px 16px", borderRight: i < 3 ? "1px solid var(--c-line)" : "none" }}>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase" }}>{s.l}</div>
                  <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 2, fontWeight: 500, letterSpacing: "-0.01em" }}>{s.v}</div>
                </div>
              )}
            </div>

            {/* Primary actions — all connected */}
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", fontSize: "11px" }}>
              <button onClick={() => typeof toggleFollow === "function" && toggleFollow(actor.id)} style={{
                padding: "10px 22px", fontSize: "var(--fs-body)", fontWeight: 600,
                background: following ? "transparent" : "var(--c-ink)", color: following ? "var(--c-ink)" : "var(--c-bg)",
                border: following ? "1px solid var(--c-line-3)" : "1px solid var(--c-ink)", borderRadius: "var(--r-3)", cursor: "pointer"
              }}>{following ? "✓ Following" : "Follow"}</button>
              <button onClick={() => navigate(`/cast/${actor.id}/studio`)} style={{
                padding: "10px 22px", fontSize: "var(--fs-body)", fontWeight: 600,
                background: "var(--c-amber)", color: "var(--c-void)", border: "1px solid var(--c-amber)",
                borderRadius: "var(--r-3)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6
              }}>✦ AI Studio</button>
              <button onClick={() => navigate(`/journey/${actor.id}`)} title="A scrollable career story + full timeline" style={{
                padding: "10px 18px", fontSize: "var(--fs-body)", fontWeight: 600,
                background: "transparent", color: "var(--c-ink)", border: "1px solid var(--c-line-3)", borderRadius: "var(--r-3)", cursor: "pointer"
              }}>Career journey</button>
            </div>
          </div>

          {/* Right: vitals + range */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: "18px 20px", background: "rgba(0,0,0,.4)", border: `1px solid ${accent}40`, borderRadius: "var(--r-2)", backdropFilter: "blur(8px)" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, textTransform: "uppercase", marginBottom: 12 }}>VITALS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
                {[["Born", actor.born], ["Height", actor.height], ["Voice", actor.voice], ["Presence", actor.presence], ["Range", actor.range], ["Languages", (actor.languages || []).join(" · ")]].map(([k, v]) =>
                <div key={k} style={{ gridColumn: ["Range", "Languages"].includes(k) ? "span 2" : "auto" }}>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 3, textTransform: "uppercase" }}>{k}</div>
                    <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.35 }}>{v}</div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ padding: "16px 18px 20px", background: "rgba(0,0,0,.4)", border: `1px solid ${accent}40`, borderRadius: "var(--r-2)", backdropFilter: "blur(8px)" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, textTransform: "uppercase", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>RANGE PROFILE</span><span style={{ color: "var(--c-ink-4)", fontSize: "var(--fs-label)" }}>0–100</span>
              </div>
              <RangeRadarV3 axes={rangeAxes} scores={rangeScores} color={accent} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Career lifecycle rail ── */}
      <div style={{ paddingTop: 22 }}><CareerRailV3 actor={actor} rec={rec} accent={accent} /></div>

      {/* ── Vault provenance ── */}
      <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "22px 32px 4px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1, background: "var(--c-line)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
          {[
          ["Vault ID", `VLT-${actor.id.toUpperCase().replace(/-/g, "")}-${String(actor.seed || 0).padStart(2, "0")}`, "var(--c-ink)"],
          ["Continuity", `Locked · ${actor.appearances} titles`, "var(--c-good)"],
          ["License", lic.out > 0 ? `Active · ${lic.out} signed` : "Open · per-project", "var(--c-amber)"],
          ["Royalty", `${lic.royalty}% rev share`, "var(--c-ink)"],
          ["Last render", `${films[0]?.film?.title || "—"}`, "var(--c-ink-2)"]].
          map(([k, v, col]) =>
          <div key={k} style={{ padding: "16px 18px", background: "var(--c-panel)" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 6, textTransform: "uppercase" }}>{k}</div>
              <div style={{ fontSize: "var(--fs-body)", color: col, display: "flex", alignItems: "center", gap: 6 }}>
                {k === "Continuity" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 6px var(--c-good)" }} />}
                {v}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Connected workflows ── */}
      <ConnectedWorkflowsV3 actor={actor} accent={accent} />

      {/* ── Filmography + reel ── */}
      <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "24px 32px 24px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 28, alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 500, letterSpacing: "-0.01em", margin: "0 0 18px" }}>Filmography</h2>
          {films.length === 0 ?
          <div style={{ padding: "40px 24px", background: "var(--c-panel)", border: "1px dashed var(--c-line-2)", borderRadius: "var(--r-2)", textAlign: "center" }}>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink-2)", marginBottom: 6 }}>No screen credits yet.</div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginBottom: 16 }}>This performer is vault-ready — cast them and they'll appear here.</div>
              <button onClick={() => xActor("Cina.html", { intent: "cast", actorId: actor.id, actorName: actor.name }, { title: "OPENING STUDIO", text: `${actor.name} · cast`, kind: "good" })} className="btn btn-primary" style={{ height: 38 }}>▶ Cast {actor.name.split(" ")[0]} in a film</button>
            </div> :

          <>
              <div style={{ display: "flex", gap: 0, overflowX: "auto", borderBottom: "1px solid var(--c-line)", marginBottom: 18 }}>
                {films.map(({ film, role }) =>
              <button key={film.id} onClick={() => setActiveFilm(film.id)} style={{
                padding: "10px 16px", background: "transparent",
                color: activeFilm === film.id ? "var(--c-ink)" : "var(--c-ink-3)", border: "none",
                borderBottom: activeFilm === film.id ? `2px solid ${accent}` : "2px solid transparent",
                marginBottom: -1, cursor: "pointer", fontFamily: "var(--f-display)", fontStyle: "italic",
                fontSize: "var(--fs-body)", fontWeight: activeFilm === film.id ? 600 : 400, whiteSpace: "nowrap"
              }}>{film.title} <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginLeft: 4 }}>{role.lead ? "lead" : "ensemble"}</span></button>
              )}
              </div>
              {(() => {
              const entry = films.find((f) => f.film.id === activeFilm) || films[0];
              if (!entry) return null;
              return (
                <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
                    <div style={{ aspectRatio: "21/9", position: "relative", background: entry.film.color || tkc("panel-2") }}>
                      {typeof FrameThumb === "function" && <FrameThumb kind={entry.film.thumb} usePhoto />}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,8,10,.4) 0%, rgba(8,8,10,0) 50%, rgba(8,8,10,.85) 100%)" }} />
                      <div style={{ position: "absolute", left: 22, bottom: 18, color: tkc("white") }}>
                        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, marginBottom: 4 }}>AS {entry.role.as?.toUpperCase()}</div>
                        <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 500, letterSpacing: "-0.01em" }}>{entry.film.title}</div>
                        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.6)", marginTop: 4 }}>{entry.film.year} · {entry.film.kind === "series" ? `Season ${entry.film.season}` : entry.film.runtime}</div>
                      </div>
                      <button onClick={() => navigate(entry.film.branched ? `/branches/${entry.film.id}` : entry.film.kind === "series" ? `/series/${entry.film.id}` : `/film/${entry.film.id}`)} style={{
                      position: "absolute", right: 22, bottom: 18, padding: "10px 18px", background: accent, color: "var(--c-void)",
                      border: "none", borderRadius: "var(--r-2)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase"
                    }}>▶ Watch</button>
                    </div>
                  </div>);

            })()}
              <h3 style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, margin: "32px 0 12px" }}>All appearances</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                {films.map(({ film, role }) =>
              <button key={film.id} onClick={() => setActiveFilm(film.id)} style={{
                background: activeFilm === film.id ? "var(--c-panel-2)" : "transparent",
                border: `1px solid ${activeFilm === film.id ? accent : "var(--c-line)"}`, borderRadius: "var(--r-2)", padding: 12, cursor: "pointer",
                color: "inherit", textAlign: "left", display: "flex", flexDirection: "column", gap: 8
              }}>
                    <div style={{ aspectRatio: "16/9", borderRadius: "var(--r-1)", overflow: "hidden", background: film.color, position: "relative" }}>
                      {typeof FrameThumb === "function" && <FrameThumb kind={film.thumb} usePhoto />}
                      {role.lead && <span style={{ position: "absolute", top: 6, right: 6, padding: "2px 6px", background: "rgba(0,0,0,.7)", color: accent, border: `1px solid ${accent}40`, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", borderRadius: "var(--r-1)" }}>LEAD</span>}
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.15 }}>{film.title}</div>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 4, letterSpacing: ".08em" }}>{role.as?.toUpperCase()} · {film.year}</div>
                    </div>
                  </button>
              )}
              </div>
            </>
          }
        </div>

        {/* Sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 84 }}>
          {coStars.length > 0 &&
          <div style={{ padding: 18, background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textTransform: "uppercase", marginBottom: 12 }}>Has worked with</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {coStars.map((c) =>
              <button key={c.id} onClick={() => navigate(`/cast/${c.id}`)} style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", color: "inherit", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 50, borderRadius: "var(--r-1)", overflow: "hidden", flexShrink: 0, border: "1px solid var(--c-line)" }}>
                      <CastPortrait actor={c} size={80} shot="headshot" cover style={{ width: "100%", height: "100%", borderRadius: 0 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.15 }}>{c.name}</div>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 3, textTransform: "uppercase" }}>{c.archetype}</div>
                    </div>
                    <span style={{ color: "var(--c-ink-4)", fontSize: "var(--fs-body)" }}>→</span>
                  </button>
              )}
              </div>
            </div>
          }

          {actor.awards?.length > 0 &&
          <div style={{ padding: 18, background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, textTransform: "uppercase", marginBottom: 12 }}>Recognition</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {actor.awards.map((a, i) =>
              <li key={i} style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", display: "flex", gap: 10, lineHeight: 1.45 }}>
                    <span style={{ flexShrink: 0, color: accent, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)" }}>★</span><span>{a}</span>
                  </li>
              )}
              </ul>
            </div>
          }

          {/* License terms — routed through handoff */}
          <div style={{ padding: 20, background: `linear-gradient(135deg, ${accent}15 0%, var(--c-panel) 70%)`, border: `1px solid ${accent}40`, borderRadius: "var(--r-2)" }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, textTransform: "uppercase", marginBottom: 8 }}>License terms</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>
              {[["Base · full project", `$${lic.base.toLocaleString()}`], ["Royalty to performer", `${lic.royalty}%`], ["Usage", "Allow-list · on-chain"]].map(([k, v]) =>
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--fs-body)" }}>
                  <span style={{ color: "var(--c-ink-3)" }}>{k}</span>
                  <span style={{ color: "var(--c-ink)", fontFamily: "var(--f-mono)" }}>{v}</span>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>);

}

Object.assign(window, { ActorProfilePage: ActorProfilePageV3, xActor, CareerRailV3, ConnectedWorkflowsV3, RangeRadarV3, V3_PRODUCTION });