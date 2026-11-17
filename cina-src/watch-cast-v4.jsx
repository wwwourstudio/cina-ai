// watch-cast-v4.jsx — THE VAULT, rebuilt as the live performer hub.
//
// Overrides CastIndexPage (from watch-cast-v2.jsx). The old index read the
// static CAST array and dead-ended at a genre grid. This version:
//   · reads the unified TalentAPI registry via useTalent() — birthed
//     performers and live career state appear instantly, no reload
//   · opens the actor workflow: a "Birth a performer" CTA (handoff → Studio)
//     and a link into the /talent career journeys
//   · adds PIPELINE AT A GLANCE — the seven career stages as a working band:
//     each tile shows how many performers are waiting at that stage and
//     filters the grid to them (the production to-do list)
//   · keeps genre, search, sort, surprise — all wired
//
// Loads after watch-cast-v3.jsx.

const { useState: usC4, useMemo: umC4 } = React;

// Birth / cross-app handoff — every jump pre-selects the performer.
function v4Go_watchCastV4(href, payload, toastMsg) {
  if (payload && window.TalentAPI) window.TalentAPI.handoff(payload);
  if (toastMsg && typeof window.toast === "function") window.toast(toastMsg);
  setTimeout(() => { window.location.href = href; }, toastMsg ? 480 : 0);
}

// ─── Pipeline band — the seven stages as a working filter ──────────────────
// stage===null shows everyone. Each tile counts the performers whose NEXT
// action is that stage (their frontier) — i.e. the work waiting there.
function VaultPipelineBand({ records, stage, onStage, accent }) {
  const counts = umC4(() => {
    const c = {};
    VAULT_STAGES_META.forEach((s) => { c[s.id] = 0; });
    let complete = 0;
    records.forEach((r) => {
      const next = window.TalentAPI ? window.TalentAPI.nextStage(r._rec || r) : null;
      if (next && c[next] != null) c[next] += 1;
      else if (!next) complete += 1;
    });
    return { c, complete };
  }, [records]);

  return (
    <div style={{
      border: "1px solid var(--c-line)", borderRadius: "var(--vk-radius)",
      background: "var(--c-panel)", overflow: "hidden"
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "14px 18px 12px", borderBottom: "1px solid var(--c-line)", flexWrap: "wrap" }}>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", fontWeight: 700 }}>PIPELINE AT A GLANCE</span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>EVERY PERFORMER MOVES BIRTH → PROMOTE · TAP A STAGE TO SEE WHO'S WAITING THERE</span>
        <span style={{ flex: 1 }}></span>
        {stage &&
          <button onClick={() => onStage(null)} className="t-mono" style={{
            fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, background: "transparent",
            border: "none", cursor: "pointer", fontWeight: 600
          }}>CLEAR ✕</button>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${VAULT_STAGES_META.length}, 1fr)`, gap: 1, background: "var(--c-line)" }}>
        {VAULT_STAGES_META.map((s, i) => {
          const isBirth = s.id === "birth";
          const n = isBirth ? records.length : (counts.c[s.id] || 0);
          const isLast = i === VAULT_STAGES_META.length - 1;
          const active = stage === s.id;
          const waiting = !isBirth && n > 0;
          return (
            <button key={s.id} onClick={() => onStage(active ? null : s.id)}
              title={`${s.label} · ${n} waiting`} style={{
                position: "relative", textAlign: "left", cursor: "pointer",
                padding: "13px 13px 14px", minHeight: 96,
                background: active ? `${accent}16` : "var(--c-panel)",
                border: "none", borderBottom: active ? `2px solid ${accent}` : "2px solid transparent",
                display: "flex", flexDirection: "column", gap: 8, color: "inherit",
                transition: "background .15s ease"
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--c-panel-2)"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "var(--c-panel)"; }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="t-mono" style={{
                  fontSize: "var(--fs-label)", fontWeight: 700, letterSpacing: ".08em",
                  padding: "2px 7px", borderRadius: 999,
                  background: waiting ? `${accent}1c` : isBirth ? "transparent" : "transparent",
                  border: `1px solid ${waiting || isBirth ? `${accent}55` : "var(--c-line-2)"}`,
                  color: waiting || isBirth ? accent : "var(--c-ink-4)"
                }}>{n}{isLast ? "" : " ▸"}</span>
              </div>
              <div>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: active ? accent : "var(--c-ink)", lineHeight: 1.05 }}>{s.label}</div>
                <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 3, lineHeight: 1.3 }}>{s.desc}</div>
              </div>
              <div style={{ marginTop: "auto", fontSize: "var(--fs-label)", color: isBirth ? "var(--c-ink-3)" : waiting ? accent : "var(--c-ink-4)", fontFamily: "var(--f-mono)", letterSpacing: ".08em" }}>
                {isBirth ? `${n} in vault` : waiting ? `${n} waiting →` : "all clear"}
              </div>
            </button>
          );
        })}
      </div>
      {counts.complete > 0 &&
        <div style={{ padding: "9px 18px", borderTop: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 6px var(--c-good)" }}></span>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".16em" }}>{counts.complete} PERFORMER{counts.complete > 1 ? "S" : ""} · FULL CAREER, BIRTH THROUGH PROMOTE</span>
        </div>}
    </div>
  );
}

// ─── Cast index V4 ─────────────────────────────────────────────────────────
function CastIndexPageV4() {
  if (typeof useAutoRetire === "function") useAutoRetire();
  const talent = typeof useTalent === "function" ? useTalent() : [];

  // Build display objects: the public CAST shape when we have it (for the
  // portrait + filmography), otherwise the raw talent record. Keep the live
  // record on _rec so cards and the pipeline read true career state.
  const roster = umC4(() => {
    return talent.map((rec) => {
      const cast = (window.CAST || []).find((a) => a.id === rec.id || a.id === rec.studioId);
      const base = cast ? { ...cast } : {
        ...rec,
        appearances: rec.appearances || 0,
        followers: rec.followers || 0,
        archetype: rec.archetype || "Performer",
      };
      base._rec = rec;
      return base;
    });
  }, [talent]);

  const [filter, setFilter] = usC4("all");
  const [sort, setSort] = usC4("featured");
  const [query, setQuery] = usC4("");
  const [stage, setStage] = usC4(null);
  const accent = "var(--c-amber)";

  const filters = ["all", "drama", "sci-fi", "western", "horror", "comedy", "noir"];

  const matchStage = (r) => {
    if (!stage || stage === "birth") return true;
    const next = window.TalentAPI ? window.TalentAPI.nextStage(r._rec || r) : null;
    if (stage === "promote") return next === "promote" || next === null;
    return next === stage;
  };

  const filtered = umC4(() => {
    let r = roster.filter(matchStage);
    if (filter !== "all") r = r.filter((a) => (a.range || a.archetype || "").toLowerCase().includes(filter));
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((a) => (a.name || "").toLowerCase().includes(q) || (a.archetype || "").toLowerCase().includes(q));
    }
    if (sort === "appearances") r = [...r].sort((a, b) => (b.appearances || 0) - (a.appearances || 0));
    if (sort === "followers") r = [...r].sort((a, b) => (b.followers || 0) - (a.followers || 0));
    if (sort === "name") r = [...r].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return r;
  }, [roster, filter, sort, query, stage]);

  const spotlight = umC4(() => [...roster].sort((a, b) => (b.followers || 0) - (a.followers || 0))[0], [roster]);

  const pickRandom = () => {
    const r = filtered[Math.floor(Math.random() * filtered.length)];
    if (r) navigate(`/cast/${r.id}`);
  };

  if (!roster.length) return <div style={{ padding: 56, color: "var(--c-ink-3)" }}>No performers in the vault yet.</div>;

  const mastheadFaces = umC4(() => [...roster].filter((a) => a.skin || a.palette).sort((a, b) => (b.followers || 0) - (a.followers || 0)).slice(0, 6), [roster]);
  const totalFollowers = roster.reduce((s, a) => s + (a.followers || 0), 0);
  const licensable = roster.filter((a) => (a._rec?.licensing?.out || 0) >= 0).length;
  const inProduction = roster.filter((a) => (a.appearances || 0) > 0 || (a.roles || []).length > 0).length;
  const heroStats = umC4(() => [
    { k: "Performers", v: String(roster.length), s: "in the cast", tint: "var(--c-amber)" },
    { k: "In production", v: String(inProduction), s: "cast in titles", tint: "var(--c-good)" },
    { k: "Followers", v: (totalFollowers / 1000).toFixed(0) + "K", s: "across the cast", tint: tkc("cat-1") },
    { k: "Licensable", v: String(licensable), s: "open cast IDs" },
  ], [roster]);

  const spotRec = spotlight?._rec;
  const spotStage = spotRec && window.TalentAPI ? window.TalentAPI.nextStage(spotRec) : null;

  return (
    <div data-screen-label="Cast · The Vault" style={{ background: "var(--c-bg)", minHeight: "100vh" }}>
      {/* ── Cinematic masthead ── */}
      <VaultHero
        kicker="The Cast · Performer Library"
        title={<>The <em>Cast.</em></>}
        lede="Every performer on Cina, living in one registry. Birth an original, train continuity, mint the likeness, license it out, cast it in a film, run a commercial — the same seven-stage pipeline, whichever surface you're on."
        faces={mastheadFaces}
        stats={heroStats}
      >
        <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
          <button onClick={() => v4Go_watchCastV4("Cina.html", { intent: "birth" }, { title: "OPENING STUDIO", text: "Birth flow · the vault", kind: "good" })}
            className="btn btn-primary" style={{ height: 52, padding: "0 28px", fontSize: "var(--fs-body)" }}>
            ✦ Birth a performer
          </button>
          <button onClick={() => navigate(spotlight ? `/journey/${spotlight.id}` : "/cast")} className="btn" style={{ height: 52, padding: "0 24px", fontSize: "var(--fs-body)" }}>
            Career journeys →
          </button>
        </div>
      </VaultHero>

      {/* ── Sticky filter + search toolbar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(8,8,10,.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--c-line)"
      }}>
        <div className="vk-wrap" style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", padding: "0 var(--vk-gut)" }}>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", padding: "9px 0" }}>
            {filters.map((f) =>
              <VaultChip key={f} on={filter === f} onClick={() => setFilter(f)}>{f}</VaultChip>
            )}
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={pickRandom} className="vk-chip" style={{ borderStyle: "dashed", borderColor: "rgba(var(--accent-rgb),.4)", color: "var(--c-amber)" }}>⟳ Surprise me</button>
          <div style={{ position: "relative" }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or archetype…"
              style={{
                width: 220, padding: "8px 12px 8px 32px",
                background: "var(--c-panel)", border: "1px solid var(--c-line-2)",
                borderRadius: "var(--r-3)", color: "var(--c-ink)", fontSize: "var(--fs-body)", outline: "none"
              }} />
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--c-ink-3)", fontSize: "var(--fs-body)" }}>⌕</span>
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{
            background: "var(--c-panel)", color: "var(--c-ink)",
            border: "1px solid var(--c-line-2)", padding: "8px 12px",
            borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", fontFamily: "var(--f-mono)"
          }}>
            <option value="featured">Featured</option>
            <option value="appearances">Most films</option>
            <option value="followers">Most followed</option>
            <option value="name">A → Z</option>
          </select>
        </div>
      </div>

      <div className="vk-wrap" style={{ padding: "clamp(26px,3.4vw,40px) var(--vk-gut) 90px", display: "flex", flexDirection: "column", gap: 30 }}>

        {/* Pipeline at a glance — the actor workflow, wired */}
        <VaultPipelineBand records={roster} stage={stage} onStage={setStage} accent={accent} />

        {/* Spotlight — only when not stage-filtering, so the grid stays the focus */}
        {spotlight && !stage && !query.trim() &&
          <div className="m-stack" style={{
            display: "grid", gridTemplateColumns: "minmax(260px, 320px) minmax(0,1fr)", gap: 0,
            background: `linear-gradient(120deg, ${spotlight.palette?.[1] || tkc("panel-2")} 0%, var(--c-panel) 80%)`,
            border: "1px solid var(--c-line)", borderRadius: "var(--vk-radius)", overflow: "hidden"
          }}>
            <button onClick={() => navigate(`/cast/${spotlight.id}`)} style={{
              background: "transparent", border: "none", padding: 0, cursor: "pointer",
              position: "relative", display: "block", overflow: "hidden"
            }}>
              <div style={{ width: "100%", height: "100%", minHeight: 320 }}><VaultAvatar actor={spotlight} size={340} shot="wide" /></div>
              <div style={{
                position: "absolute", top: 14, left: 14, padding: "4px 10px",
                background: "var(--c-amber)", color: "var(--c-on-amber)",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700,
                letterSpacing: ".16em", borderRadius: 999, textTransform: "uppercase"
              }}>★ MOST FOLLOWED</div>
            </button>
            <div style={{ padding: "clamp(20px, 4vw, 32px) clamp(18px, 4vw, 36px)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: tkc("amber"), textTransform: "uppercase" }}>{spotlight.archetype}</div>
              <h2 style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 400, fontSize: "clamp(36px, 9vw, 56px)", lineHeight: 0.96, letterSpacing: "-0.02em", color: "var(--c-ink)" }}>{spotlight.name}</h2>
              <p style={{ margin: 0, fontSize: "var(--fs-body)", color: "var(--c-ink-2)", maxWidth: 560, lineHeight: 1.5 }}>{spotlight.bio}</p>
              {/* Live career spine */}
              <div style={{ maxWidth: 560, margin: "2px 0 4px" }}>
                <VaultStageSpine rec={spotRec} compact onStage={() => navigate(`/cast/${spotlight.id}`)} />
              </div>
              <div style={{ display: "flex", gap: 24, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" }}>
                <span><b style={{ color: "var(--c-ink)", fontWeight: 700 }}>{spotlight.appearances || 0}</b> APPEARANCES</span>
                <span><b style={{ color: "var(--c-ink)", fontWeight: 700 }}>{((spotlight.followers || 0) / 1000).toFixed(0)}K</b> FOLLOWING</span>
                {spotStage && <span style={{ color: "var(--c-amber)" }}>NEXT · {spotStage.toUpperCase()}</span>}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => navigate(`/cast/${spotlight.id}`)} className="btn btn-primary" style={{ height: 40, padding: "0 18px", fontSize: "var(--fs-body)" }}>Open profile →</button>
                <button onClick={() => navigate(`/cast/${spotlight.id}/studio`)} className="btn" style={{ height: 40, padding: "0 16px", fontSize: "var(--fs-body)" }}>✦ AI Studio</button>
                <button onClick={() => navigate(`/journey/${spotlight.id}`)} className="btn" style={{ height: 40, padding: "0 16px", fontSize: "var(--fs-body)" }}>Career journey</button>
              </div>
            </div>
          </div>
        }

        {/* Grid header when stage-filtering */}
        {stage &&
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: -10, flexWrap: "wrap" }}>
            <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, margin: 0, letterSpacing: "-0.01em" }}>
              {stage === "birth"
                ? <>Every <span style={{ color: "var(--c-amber)" }}>performer</span></>
                : <>Waiting on <span style={{ color: "var(--c-amber)" }}>{(VAULT_STAGES_META.find((s) => s.id === stage) || {}).label}</span></>}
            </h2>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{filtered.length} PERFORMER{filtered.length === 1 ? "" : "S"}{stage === "birth" ? " · IN THE VAULT" : " · CLICK ONE TO ADVANCE THEIR CAREER"}</span>
          </div>
        }

        {/* Grid */}
        {filtered.length === 0 ?
          <div style={{ padding: 56, textAlign: "center", color: "var(--c-ink-3)", border: "1px dashed var(--c-line)", borderRadius: "var(--r-2)" }}>
            No performers match those filters.
          </div> :
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(232px, 1fr))", gap: 16 }}>
            {filtered.map((actor) => <VaultActorCard key={actor.id} actor={actor} variant="watch" onClick={() => navigate(`/cast/${actor.id}`)} />)}
          </div>
        }
      </div>
    </div>
  );
}

// Override the index page.
Object.assign(window, { CastIndexPage: CastIndexPageV4 });
