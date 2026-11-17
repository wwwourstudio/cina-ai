// cina-flow.jsx — the Pipeline view: a LIVE flow board with real faces.
//
// v2. Every stage reads the shared CinaProject. Upgrades over v1:
//   • REAL HEADSHOTS — stills/motion/cast/voice render the performer's actual
//     cast photo (resolved from window.CHARACTERS / assets/cast), with a
//     per-seed cinematic grade so every still reads as a distinct frame.
//   • PERFORMER FILTER — chip rail scopes Cast/Stills/Motion/Voice to one
//     performer, so columns stay coherent as the project grows.
//   • QUICK ACTIONS — hover any card for one-tap handoffs (Animate, Voice,
//     Board, Render) that materialize the downstream asset in place.
//   • ACTIONABLE EMPTY STATES + column "+" — generate stills / animate the
//     newest still / add a performer without leaving the board.
//   • NEXT UP — the board computes the next best action and offers it.
//
// Loaded AFTER pipeline.jsx + cina-pipeline.jsx, so window.PipelinePanel wins.

(function () {
  const { useState: usF, useMemo: umF } = React;
  const P = window.CinaProject;

  const goView = (v) => window.dispatchEvent(new CustomEvent("cina:setView", { detail: v }));

  // ─── Headshot resolution — one path from any asset to a real photo ────────
  const CF_PHOTOS = ["calo-vey", "domek-ari", "evren-koll", "io-marsh", "nadya-ash", "rune-okafor", "siri-vale", "wren-soto"].map(n => "assets/cast/" + n + ".png");
  const CF_ALIAS = { "elias voss": "assets/cast/calo-vey.png", "maren kell": "assets/cast/nadya-ash.png", "mira": "assets/cast/nadya-ash.png" };
  function photoForName(name) {
    const q = (name || "").toLowerCase().trim();
    if (!q) return CF_PHOTOS[0];
    if (CF_ALIAS[q]) return CF_ALIAS[q];
    const chars = window.CHARACTERS || [];
    const hit = chars.find(c => (c.name || "").toLowerCase() === q || (c.castName || "").toLowerCase() === q);
    if (hit && hit.photo) return hit.photo;
    let h = 0; for (let i = 0; i < q.length; i++) h = (h * 31 + q.charCodeAt(i)) >>> 0;
    return CF_PHOTOS[h % CF_PHOTOS.length];
  }
  function performerOf(a) {
    const perfs = (P.get().performers || []);
    const byId = (id) => perfs.find(p => (id || "").includes(p.id));
    let hit = byId(a.id);
    if (!hit) { for (const anc of P.lineage(a.id)) { hit = byId(anc.id); if (hit) break; } }
    return hit || null;
  }

  // Per-seed cinematic grades — same face, different frame.
  const CF_GRADES = [
    { f: "saturate(.92) contrast(1.06) brightness(.96)",                                   p: "50% 14%", s: 1.0 },
    { f: "grayscale(.55) sepia(.34) hue-rotate(-12deg) contrast(1.06) brightness(.9)",     p: "42% 20%", s: 1.14 },
    { f: "grayscale(.25) saturate(1.18) hue-rotate(6deg) brightness(.88) contrast(1.1)",   p: "58% 16%", s: 1.07 },
    { f: "grayscale(.9) contrast(1.2) brightness(.94)",                                    p: "50% 24%", s: 1.2 },
    { f: "sepia(.42) hue-rotate(-26deg) saturate(1.22) contrast(1.05) brightness(.9)",     p: "46% 12%", s: 1.04 },
  ];
  const gradeFor = (a) => CF_GRADES[((a.seed || 0) + (a.kind === "motion" ? 1 : 0)) % CF_GRADES.length];

  // ─── Frame — a real still/motion thumbnail ─────────────────────────────────
  function Frame({ a, wide }) {
    const perf = performerOf(a);
    const photo = perf ? photoForName(perf.name) : null;
    const g = gradeFor(a);
    return (
      <div style={{ width: "100%", aspectRatio: wide ? "16/9" : "1", borderRadius: "var(--r-2)", overflow: "hidden", position: "relative", background: tkc("bg") }}>
        {photo
          ? <img src={photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: g.p, transform: `scale(${g.s})`, transformOrigin: g.p, filter: g.f, display: "block" }}/>
          : <div style={{ position: "absolute", left: "50%", top: "42%", transform: "translate(-50%,-50%)", width: "46%", height: "52%", borderRadius: "50% 50% 46% 46%", background: "hsl(44,30%,62%)", opacity: .9 }}/>}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,5,8,.05) 55%, rgba(5,5,8,.62))" }}/>
        {typeof a.seed === "number" && <span style={{ position: "absolute", left: 7, bottom: 6, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.75)" }}>SEED {a.seed}</span>}
        {typeof a.cont === "number" && <span style={{ position: "absolute", top: 6, right: 6, padding: "1px 6px", background: "rgba(8,8,10,.75)", border: "1px solid var(--c-good)", color: "var(--c-good)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", borderRadius: "var(--r-1)" }}>{a.cont}%</span>}
        {a.kind === "motion" && <>
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 34, height: 34, borderRadius: "50%", background: "rgba(8,8,10,.6)", border: "1px solid rgba(255,255,255,.3)", display: "flex", alignItems: "center", justifyContent: "center", color: tkc("white"), fontSize: "var(--fs-body)", paddingLeft: 2 }}>▶</div>
          <span style={{ position: "absolute", right: 7, bottom: 6, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.8)" }}>{a.dur || "0:08"}</span>
        </>}
      </div>
    );
  }

  // ─── Face — small round headshot ───────────────────────────────────────────
  function Face({ name, size = 26, ring }) {
    return (
      <span style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, display: "inline-block", border: ring ? "1.5px solid var(--c-amber)" : "1px solid var(--c-line-2)", background: tkc("bg") }}>
        <img src={photoForName(name)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 18%", display: "block" }}/>
      </span>
    );
  }

  function kindGlyph(a) {
    return ({ tone: "❖", rule: "§", beat: "✎", scene: "▤", cast: "☉", identity: "◉", still: "▦", motion: "▶", voice: "♫", line: "“", shot: "▣", render: "✦" })[a.kind] || "•";
  }

  // One-tap handoffs per kind — the real pipeline actions, in place.
  function quickActs(a) {
    if (a.kind === "still")  return [{ step: "motion", label: "▶ Animate" }, { step: "board", label: "▣ Board" }];
    if (a.kind === "motion") return [{ step: "voice", label: "♫ Voice" }, { step: "board", label: "▣ Board" }];
    if (a.kind === "scene")  return [{ step: "board", label: "▣ Board it" }];
    if (a.kind === "shot")   return [{ step: "render", label: "✦ Render" }];
    return [];
  }

  // ─── Asset card ─────────────────────────────────────────────────────────────
  function AssetCard({ a, selected, onSelect }) {
    const parent = (a.from || [])[0];
    const pmap = P.allAssets();
    const pLabel = parent && pmap[parent] ? (pmap[parent].label || pmap[parent].name) : null;
    const hasThumb = a.kind === "still" || a.kind === "motion";
    const perf = (a.kind === "cast" || a.kind === "identity" || a.kind === "voice" || hasThumb) ? performerOf(a) : null;
    const acts = quickActs(a);
    const step = P.STEPS.find(s => s.id === a.step);
    return (
      <div className="cf-card" data-sel={selected} onClick={() => onSelect(a)} onDoubleClick={() => step && goView(step.view)} role="button" tabIndex={0}
        style={{
          textAlign: "left", width: "100%", padding: 9, borderRadius: "var(--r-2)", cursor: "pointer", color: "inherit",
          background: selected ? "rgba(var(--accent-rgb),.08)" : "var(--c-panel)",
          border: `1px solid ${selected ? "var(--c-amber)" : "var(--c-line)"}`,
        }}>
        {hasThumb && <div style={{ marginBottom: 7 }}><Frame a={a} wide={a.kind === "motion"}/></div>}

        <div style={{ display: "flex", alignItems: hasThumb ? "center" : "flex-start", gap: 7 }}>
          {!hasThumb && perf && <Face name={perf.name} size={26} ring={a.kind === "identity" && a.locked}/>}
          {!hasThumb && !perf && <span style={{ color: "var(--c-amber)", fontSize: "var(--fs-body)", lineHeight: 1.3 }}>{kindGlyph(a)}</span>}
          {hasThumb && perf && <Face name={perf.name} size={16}/>}
          <span style={{ flex: 1, minWidth: 0, fontSize: hasThumb ? 11 : 12, color: "var(--c-ink)", lineHeight: 1.35, fontFamily: a.kind === "scene" || a.kind === "line" ? "var(--f-mono)" : "var(--f-sans)", letterSpacing: a.kind === "scene" ? ".02em" : 0, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {a.kind === "line" ? "“" + (a.text || a.label) + "”" : (a.label || a.name || a.kind)}
          </span>
        </div>

        {(pLabel || typeof a.cont === "number") && !hasThumb && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
            {typeof a.cont === "number" && <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".08em" }}>{a.cont}%</span>}
            {pLabel && <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>← {pLabel.slice(0, 20)}</span>}
          </div>
        )}
        {hasThumb && pLabel && (
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>← {pLabel.slice(0, 26)}</div>
        )}

        {acts.length > 0 && (
          <div className="cf-acts">
            {acts.map(t => (
              <button key={t.step} className="cf-act" onClick={(e) => { e.stopPropagation(); P.handoff(a, t.step, { navigate: false }); }}>{t.label}</button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Column-level actions ────────────────────────────────────────────────────
  function lockedPerf(proj, filterId) {
    const perfs = proj.performers || [];
    if (filterId !== "all") { const p = perfs.find(x => x.id === filterId); if (p) return p; }
    return perfs.find(p => p.identity && p.identity.locked) || perfs[0] || null;
  }
  function newestStill(proj, filterId) {
    const perfs = (proj.performers || []).filter(p => filterId === "all" || p.id === filterId);
    const stills = perfs.flatMap(p => p.stills || []);
    return stills[stills.length - 1] || null;
  }
  function columnAdd(stepId, proj, filterId) {
    if (stepId === "cast") {
      (window.cinaPrompt ? window.cinaPrompt({
        kicker: "Cast", title: "Name the performer",
        body: "You can set their role, DNA and wardrobe once they're in the vault.",
        placeholder: "e.g. Ada Reyes", confirmLabel: "Add to cast",
      }) : Promise.resolve(window.prompt && window.prompt("New performer — name", ""))).then(name => {
        if (name && name.trim()) { P.addPerformer(name.trim(), "Performer"); window.toast && window.toast({ title: "PERFORMER ADDED", text: name.trim() + " → Cast", kind: "good" }); }
      });
      return;
    }
    if (stepId === "stills") {
      const p = lockedPerf(proj, filterId);
      if (!p) { window.toast && window.toast({ title: "NO PERFORMER", text: "Add a performer in Cast first" }); return; }
      P.bumpStills(p.id, 3);
      window.toast && window.toast({ title: "STILLS RENDERED", text: "3 new frames · " + p.name, kind: "good" });
      return;
    }
    if (stepId === "motion") {
      const st = newestStill(proj, filterId);
      if (!st) { window.toast && window.toast({ title: "NO STILLS", text: "Generate stills first" }); return; }
      P.handoff(st, "motion", { navigate: false });
      return;
    }
  }
  const ADDABLE = { cast: "+ performer", stills: "+ 3 stills", motion: "+ animate newest" };

  function EmptyCTA({ step, proj, filterId }) {
    const open = () => goView(step.view);
    let label = "Open " + step.label + " →", fn = open, hint = null;
    if (step.id === "stills") {
      const p = lockedPerf(proj, filterId);
      if (p && p.identity && p.identity.locked) { label = "✦ Generate 3 stills"; fn = () => columnAdd("stills", proj, filterId); }
      else { hint = "Lock an identity in Cast first"; label = "Open Cast →"; fn = () => goView("vault"); }
    } else if (step.id === "motion") {
      const st = newestStill(proj, filterId);
      if (st) { label = "▶ Animate " + st.label; fn = () => P.handoff(st, "motion", { navigate: false }); }
      else hint = "Motion animates FROM a still";
    } else if (step.id === "cast") { label = "+ Add performer"; fn = () => columnAdd("cast", proj, filterId); }
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "22px 8px", textAlign: "center" }}>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{hint ? hint.toUpperCase() : "NOTHING HERE YET"}</span>
        <button className="cf-act" style={{ flex: "none", padding: "0 12px", height: 28 }} onClick={fn}>{label}</button>
      </div>
    );
  }

  // Next best action for the whole board.
  function nextUp(proj) {
    for (const s of P.STEPS) {
      if (P.assetsForStep(s.id).length === 0) {
        if (s.id === "stills") return { text: "Generate first stills", fn: () => columnAdd("stills", proj, "all") };
        if (s.id === "motion") { const st = newestStill(proj, "all"); if (st) return { text: "Animate " + st.label + " → Motion", fn: () => P.handoff(st, "motion", { navigate: false }) }; }
        return { text: "Start " + s.label, fn: () => goView(s.view) };
      }
    }
    const perfs = proj.performers || [];
    for (const p of perfs) {
      const animated = new Set(p.motion.flatMap(m => m.from || []));
      const un = (p.stills || []).filter(st => !animated.has(st.id));
      if (un.length && p.stills.length > p.motion.length) return { text: "Animate " + un[un.length - 1].label + " · " + p.name.split(" ")[0] + " → Motion", fn: () => P.handoff(un[un.length - 1], "motion", { navigate: false }) };
    }
    return null;
  }

  // ─── The board ───────────────────────────────────────────────────────────────
  const PERF_STEPS = new Set(["cast", "stills", "motion", "voice"]);

  function FlowBoard() {
    const proj = window.useProject();
    const [sel, setSel] = usF(null);
    const [filter, setFilter] = usF("all");
    const STEPS = P.STEPS;
    const selAsset = sel ? P.allAssets()[sel] : null;
    const perfs = proj.performers || [];
    const hint = nextUp(proj);

    const filterAssets = (stepId, assets) => {
      if (filter === "all" || !PERF_STEPS.has(stepId)) return assets;
      return assets.filter(a => { const p = performerOf(a); return p && p.id === filter; });
    };

    return (
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "var(--c-bg)", color: "var(--c-ink)" }}>
        <style>{CF_CSS}</style>

        {/* ── Project context ── */}
        <div style={{ padding: "16px 32px 14px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "flex-end", gap: 28, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 7, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-amber)", boxShadow: "0 0 6px var(--c-amber)" }}/>
              PROJECT CONTEXT · ONE SOURCE OF TRUTH
            </div>
            <h1 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-head)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1 }}>
              {proj.meta.title} <span style={{ color: "var(--c-ink-4)", fontSize: "var(--fs-lead)" }}>· v{proj.meta.version}</span>
            </h1>
            <p style={{ margin: "7px 0 0", fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5, maxWidth: 640, fontStyle: "italic", fontFamily: "var(--f-display)" }}>{proj.dna.tone}</p>
          </div>
          <div style={{ display: "flex", gap: 22, alignItems: "flex-end" }}>
            <div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 6 }}>PALETTE</div>
              <div style={{ display: "flex", gap: 4 }}>{proj.dna.palette.map(c => <span key={c} title={c} style={{ width: 20, height: 20, borderRadius: "var(--r-2)", background: c, border: "1px solid rgba(255,255,255,.12)" }}/>)}</div>
            </div>
            <button onClick={() => goView("bible")} style={ctaSm}>Open DNA →</button>
          </div>
        </div>

        {/* ── Performer rail + next-up ── */}
        <div style={{ padding: "9px 32px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginRight: 2 }}>PERFORMERS</span>
          <button className="cf-chip" data-on={filter === "all"} onClick={() => setFilter("all")}>All</button>
          {perfs.map(p => (
            <button key={p.id} className="cf-chip" data-on={filter === p.id} onClick={() => setFilter(filter === p.id ? "all" : p.id)} title={p.name + " · " + p.role}>
              <Face name={p.name} size={18} ring={p.identity && p.identity.locked}/>
              {p.name.split(" ")[0]}
              <span style={{ color: "var(--c-ink-4)", fontSize: "var(--fs-label)" }}>{(p.stills || []).length}▦ {(p.motion || []).length}▶</span>
            </button>
          ))}
          <span style={{ flex: 1 }}/>
          {hint && (
            <button className="cf-next" onClick={hint.fn}>
              <span style={{ letterSpacing: ".16em", opacity: .75 }}>NEXT UP</span> {hint.text} →
            </button>
          )}
        </div>

        {/* ── Columns ── */}
        <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
          <div className="sc-scroll" style={{ flex: 1, overflowX: "auto", overflowY: "hidden", display: "flex", alignItems: "stretch", padding: "0 8px" }}>
            {STEPS.map((step, i) => {
              const assets = filterAssets(step.id, P.assetsForStep(step.id));
              return (
                <React.Fragment key={step.id}>
                  <div style={{ width: 230, minWidth: 230, display: "flex", flexDirection: "column", borderRight: "1px solid var(--c-line)", minHeight: 0 }}>
                    <div style={{ display: "flex", alignItems: "stretch", borderBottom: "1px solid var(--c-line)" }}>
                      <button onClick={() => goView(step.view)} title={"Open " + step.label + " tool"} style={{
                        flex: 1, minWidth: 0, textAlign: "left", padding: "13px 12px 10px", background: "transparent", border: "none", cursor: "pointer", color: "inherit",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{String(i + 1).padStart(2, "0")}</span>
                          <span style={{ color: "var(--c-amber)", fontSize: "var(--fs-body)" }}>{step.icon}</span>
                          <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{step.label}</span>
                          <span style={{ flex: 1 }}/>
                          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: assets.length ? "var(--c-amber)" : "var(--c-ink-4)" }}>{assets.length}</span>
                        </div>
                        <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 5, lineHeight: 1.4 }}>{step.blurb}</div>
                      </button>
                      {ADDABLE[step.id] && (
                        <button className="cf-plus" title={ADDABLE[step.id]} onClick={() => columnAdd(step.id, proj, filter)}>+</button>
                      )}
                    </div>
                    <div className="sc-scroll" style={{ flex: 1, overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                      {assets.length === 0
                        ? <EmptyCTA step={step} proj={proj} filterId={filter}/>
                        : assets.map(a => <AssetCard key={a.id} a={a} selected={sel === a.id} onSelect={(x) => setSel(x.id)}/>)}
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ display: "flex", alignItems: "center", padding: "0 2px", color: "var(--c-line-3)", fontSize: "var(--fs-body)" }}>›</div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* ── Detail drawer ── */}
          {selAsset ? (
            <aside style={{ width: 340, minWidth: 340, borderLeft: "1px solid var(--c-line)", background: "var(--c-panel)", padding: "20px 20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ color: "var(--c-amber)" }}>{kindGlyph(selAsset)}</span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase" }}>{selAsset.kind}</span>
                  <span style={{ flex: 1 }}/>
                  <button onClick={() => setSel(null)} style={{ ...ctaGhost, width: 26, height: 26, padding: 0, justifyContent: "center" }}>×</button>
                </div>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.15, color: "var(--c-ink)" }}>{selAsset.kind === "line" ? "“" + selAsset.text + "”" : (selAsset.label || selAsset.name)}</div>
                {(() => { const p = performerOf(selAsset); return p ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 9 }}>
                    <Face name={p.name} size={24} ring={p.identity && p.identity.locked}/>
                    <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{p.name} <span style={{ color: "var(--c-ink-4)" }}>· {p.role}</span></span>
                  </div>
                ) : null; })()}
                {typeof selAsset.cont === "number" && <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-good)", marginTop: 7 }}>CONTINUITY {selAsset.cont}%</div>}
              </div>

              {(selAsset.kind === "still" || selAsset.kind === "motion") && <Frame a={selAsset} wide={selAsset.kind === "motion"}/>}

              <div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 10 }}>WHERE IT CAME FROM</div>
                <window.Lineage assetId={selAsset.id}/>
                {P.lineage(selAsset.id).length <= 1 && <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>Origin asset — defined in {selAsset.step.toUpperCase()}.</div>}
              </div>

              <div style={{ marginTop: "auto" }}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 10 }}>CARRY IT FORWARD</div>
                <window.HandoffBar asset={selAsset} onAfter={() => {}}/>
              </div>
            </aside>
          ) : (
            <aside style={{ width: 340, minWidth: 340, borderLeft: "1px solid var(--c-line)", background: "var(--c-panel)", padding: 26, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 14, color: "var(--c-ink-3)" }}>
              <div style={{ display: "flex" }}>
                {perfs.slice(0, 3).map((p, i) => <span key={p.id} style={{ marginLeft: i ? -10 : 0, zIndex: 3 - i }}><Face name={p.name} size={44} ring={p.identity && p.identity.locked}/></span>)}
              </div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink-2)" }}>Pick any asset.</div>
              <div style={{ fontSize: "var(--fs-body)", lineHeight: 1.55, maxWidth: 260 }}>See exactly what it grew from — DNA → script → performer → still → motion — and hand it forward. Hover a card for one-tap actions.</div>
            </aside>
          )}
        </div>
      </div>
    );
  }

  const ctaSm = { height: 32, padding: "0 14px", borderRadius: "var(--r-2)", background: "var(--c-amber)", color: tkc("on-amber"), border: "none", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700 };
  const ctaGhost = { display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", borderRadius: "var(--r-2)", background: "transparent", border: "1px solid var(--c-line-2)", color: "var(--c-ink-2)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)" };

  const CF_CSS = `
  .cf-acts { display: flex; gap: 5px; max-height: 0; overflow: hidden; opacity: 0; margin-top: 0; transition: max-height .16s ease, opacity .16s ease, margin-top .16s ease; }
  .cf-card:hover .cf-acts, .cf-card[data-sel="true"] .cf-acts { max-height: 30px; opacity: 1; margin-top: 8px; }
  .cf-act { flex: 1; height: 26px; border-radius: 6px; border: 1px solid rgba(var(--accent-rgb),.4); background: rgba(var(--accent-rgb),.08); color: var(--c-amber); font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .05em; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background .12s; }
  .cf-act:hover { background: rgba(var(--accent-rgb),.2); }
  .cf-card { transition: border-color .13s, transform .13s; }
  .cf-card:hover { border-color: var(--c-line-3) !important; }
  .cf-chip { display: inline-flex; align-items: center; gap: 7px; height: 28px; padding: 0 11px 0 5px; border-radius: 999px; border: 1px solid var(--c-line-2); background: transparent; color: var(--c-ink-2); font-size:var(--fs-label); cursor: pointer; transition: all .13s; }
  .cf-chip[data-on="true"] { border-color: var(--c-amber); color: var(--c-amber); background: rgba(var(--accent-rgb),.08); }
  .cf-chip:hover:not([data-on="true"]) { border-color: var(--c-line-3); color: var(--c-ink); }
  .cf-plus { width: 30px; border: none; border-left: 1px solid var(--c-line); background: transparent; color: var(--c-ink-4); font-size:var(--fs-body); cursor: pointer; transition: all .13s; }
  .cf-plus:hover { color: var(--c-amber); background: rgba(var(--accent-rgb),.06); }
  .cf-next { display: inline-flex; align-items: center; gap: 8; height: 28px; padding: 0 13px; border-radius: 999px; border: 1px solid rgba(var(--accent-rgb),.45); background: rgba(var(--accent-rgb),.08); color: var(--c-amber); font-family: var(--f-mono); font-size:var(--fs-label); cursor: pointer; gap: 8px; transition: background .13s; }
  .cf-next:hover { background: rgba(var(--accent-rgb),.18); }
  `;

  window.PipelinePanel = FlowBoard;
})();
