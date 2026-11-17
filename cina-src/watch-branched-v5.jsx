// watch-branched-v5.jsx — Branched watch page, films-watch-page layout.
//
// Opens like the film watch page — full-bleed hero over the film still, then a
// two-column editorial body. Sections:
//   01 THE FILM · 02 THE FORKS (thumbnailed) · THE PATH TREE (static chart) ·
//   03 THE BRANCHES (rentable cuts, each with its own watch page) ·
//   04 FROM THE DIRECTOR · 05 CAST (full ensemble) | live-room rail.
// "Enter the room" swaps in the existing BranchedViewerV4 cinema unchanged.
//
// Loads after watch-branches-v4.jsx + branched-monetize.jsx and re-overrides
// window.BranchedFilmPage.

const { useState: usB5, useMemo: umB5, useEffect: ueB5 } = React;

const _BranchedDispatchV4 = window.BranchedFilmPage; // v4 dispatcher (market / compose fallback)

// A short, real director's voice per branched film (authored per title).
const B5_DIRECTOR_VOICE = {
  frequency: "I wanted a film the audience finishes for me. Every fork is a real edit I shot both ways — there is no director's cut here, only the room's. Some nights she answers the voice; some nights she runs. Both are true.",
  marauder: "A salvage crew is just people deciding who to trust under bad light. So I let you decide. Vote to board it and the film gets meaner; vote to log and pass and it gets lonelier. I cut every branch like it was the only one.",
  swallows: "Grief is a series of small choices about what to open and what to burn. I shot each letter, each visit, each closed door. The room writes the granddaughter's restraint — or her reckoning. I trust whatever you choose.",
};

// Distinct, deterministic still per fork option (hashes into the photo set).
function b5OptThumb(tree, fi, oi) { return `${tree.poster}-fork${fi}-opt${oi}`; }

function B5Label({ children, accent }) {
  return (
    <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent || tkc("amber"), letterSpacing: ".16em", marginBottom: 14, fontWeight: 600 }}>
      {children}
    </div>
  );
}

// ─── 02 · THE FORKS — thumbnailed decision cards ──────────────────────────
function ForksSectionV5({ tree, accent }) {
  return (
    <div data-screen-label="branched · forks">
      <B5Label accent={accent}>02 · THE FORKS</B5Label>
      <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", margin: "0 0 8px", letterSpacing: "-0.02em", fontWeight: 400, lineHeight: 1.1 }}>
        The room votes at every fork.
      </h2>
      <p style={{ fontSize: "var(--fs-body)", lineHeight: 1.6, color: "var(--c-ink-3)", margin: "0 0 26px", maxWidth: 560 }}>
        {tree.forks.length} decision points. Sixty seconds each. The majority becomes the canonical cut — your own picks become a film only you own.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {tree.forks.map((fork, i) => {
          const total = fork.options.reduce((s, o) => s + (o.votes || 0), 0) || 1;
          const leading = [...fork.options].sort((a, b) => (b.votes || 0) - (a.votes || 0))[0];
          return (
            <div key={fork.id || i} style={{
              border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden",
              background: "var(--c-panel)",
            }}>
              {/* fork header */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "16px 18px 14px", flexWrap: "wrap" }}>
                <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink-3)", lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", fontWeight: 700 }}>{fork.actLabel} · {fork.atMinute}:00</span>
                <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", letterSpacing: "-0.01em" }}>{fork.heading}</span>
                <span style={{ flex: 1 }}></span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{fork.question}</span>
              </div>
              {/* three option thumbnails */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 1, background: "var(--c-line)" }}>
                {fork.options.map((o, oi) => {
                  const lead = o.id === leading.id;
                  const pct = Math.round(((o.votes || 0) / total) * 100);
                  const oc = o.color || accent;
                  return (
                    <div key={o.id} style={{ background: "var(--c-panel)", position: "relative" }}>
                      <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden", background: oc }}>
                        <FrameThumb kind={b5OptThumb(tree, i, oi)} usePhoto/>
                        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${oc}22 0%, rgba(8,8,10,.35) 45%, rgba(8,8,10,.92) 100%)` }}></div>
                        {/* glyph chip */}
                        <div style={{
                          position: "absolute", top: 10, left: 10, width: 28, height: 28, borderRadius: "var(--r-2)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: "rgba(8,8,10,.72)", border: `1px solid ${oc}`, color: oc,
                          fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)",
                        }}>{o.glyph}</div>
                        {lead && (
                          <div className="t-mono" style={{ position: "absolute", top: 13, right: 10, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-void)", background: oc, padding: "3px 7px", borderRadius: 999, fontWeight: 700 }}>LEADING</div>
                        )}
                        {/* title + beat over gradient */}
                        <div style={{ position: "absolute", left: 12, right: 12, bottom: 11 }}>
                          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: tkc("white"), lineHeight: 1.05, textShadow: "0 2px 10px rgba(0,0,0,.7)" }}>{o.title}</div>
                          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.6)", letterSpacing: ".08em", marginTop: 3 }}>{o.tone}</div>
                        </div>
                      </div>
                      {/* vote bar */}
                      <div style={{ padding: "9px 12px 11px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: "var(--fs-body)", color: lead ? "var(--c-ink)" : "var(--c-ink-3)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{o.beat}</span>
                          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: lead ? oc : "var(--c-ink-3)", fontWeight: 700, flexShrink: 0 }}>{pct}%</span>
                        </div>
                        <div style={{ height: 3, borderRadius: "var(--r-1)", background: "var(--c-line-2)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: oc, opacity: lead ? 1 : 0.55 }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── THE PATH TREE — static canonical-path chart ──────────────────────────
function PathTreeV5({ tree, accent }) {
  const W = 1040, H = 248;
  const colX = [70, 393, 716, 970];
  const rowY = [44, 124, 204];
  const lead = tree.forks.map(f => [...f.options].sort((a, b) => (b.votes || 0) - (a.votes || 0))[0].id);
  const pos = (fi, oi) => ({ x: colX[fi], y: rowY[oi] });
  return (
    <div data-screen-label="branched · path tree" style={{ border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", background: "var(--c-panel)", padding: "20px 22px 8px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
        <div>
          <B5Label accent={accent}>THE PATH TREE</B5Label>
          <h3 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", margin: 0, fontWeight: 400, letterSpacing: "-0.01em" }}>
            Every fork, every branch. The lit path is the room's.
          </h3>
        </div>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{tree.totalCuts} POSSIBLE CUTS</span>
      </div>
      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", minWidth: 620, height: H, display: "block" }}>
          {/* connectors */}
          {tree.forks.map((f, i) => i < tree.forks.length - 1 && f.options.map((opt, oi) =>
            tree.forks[i + 1].options.map((nx, ni) => {
              const onPath = lead[i] === opt.id && lead[i + 1] === nx.id;
              const a = pos(i, oi), b = pos(i + 1, ni);
              return (
                <path key={`${i}-${oi}-${ni}`} d={`M${a.x + 16},${a.y} C${a.x + 120},${a.y} ${b.x - 120},${b.y} ${b.x - 16},${b.y}`}
                  fill="none" stroke={onPath ? accent : `${accent}12`} strokeWidth={onPath ? 2.2 : 0.8}
                  style={{ filter: onPath ? `drop-shadow(0 0 6px ${accent}aa)` : "none" }}/>
              );
            })
          ))}
          {/* stage headers */}
          {tree.forks.map((f, i) => (
            <text key={"h" + i} x={colX[i]} y={16} textAnchor="middle" style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: "2px", fill: "var(--c-ink-4)", fontWeight: 700 }}>
              {f.actLabel} · {f.atMinute}M
            </text>
          ))}
          {/* nodes */}
          {tree.forks.map((f, i) => f.options.map((opt, oi) => {
            const { x, y } = pos(i, oi);
            const lit = lead[i] === opt.id;
            return (
              <g key={`n${i}-${oi}`} opacity={lit ? 1 : 0.5}>
                <circle cx={x} cy={y} r={lit ? 13 : 9} fill={lit ? (opt.color || accent) : `${opt.color || accent}22`}
                  stroke={lit ? tkc("white") : (opt.color || accent)} strokeWidth={lit ? 1.5 : 1}
                  style={{ filter: lit ? `drop-shadow(0 0 8px ${opt.color || accent})` : "none" }}/>
                <text x={x} y={y + 4} textAnchor="middle" style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: lit ? 12 : 10, fill: lit ? tkc("void") : (opt.color || accent), fontWeight: 600 }}>{opt.glyph}</text>
                <text x={x + 20} y={y + 4} style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: lit ? 14 : 12, fill: lit ? tkc("ink") : "var(--c-ink-3)", fontWeight: lit ? 500 : 400 }}>{opt.title}</text>
              </g>
            );
          }))}
        </svg>
      </div>
    </div>
  );
}

// ─── 03 · THE BRANCHES — rentable cuts, each with its own watch page ──────
function BranchesForSaleV5({ tree, accent, onOpenCut }) {
  const [tick, setTick] = usB5(0);
  const cuts = umB5(() => (window.branchedListCuts ? window.branchedListCuts(tree) : []), [tree, tick]);
  const owned = window.branchedOwned ? window.branchedOwned(tree.filmId) : { cuts: [], allAccess: false };
  const rent = (cut) => window.openBranchedRent && window.openBranchedRent(tree, cut, () => setTick(t => t + 1));

  return (
    <div data-screen-label="branched · branches for sale">
      <B5Label accent={accent}>03 · THE BRANCHES</B5Label>
      <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", margin: "0 0 8px", letterSpacing: "-0.02em", fontWeight: 400, lineHeight: 1.1 }}>
        {tree.totalCuts} possible films. The named branches are for sale.
      </h2>
      <p style={{ fontSize: "var(--fs-body)", lineHeight: 1.6, color: "var(--c-ink-3)", margin: "0 0 22px", maxWidth: 580 }}>
        Miss the live night? Every notable branch the room has locked in is saved as its own film — open its page, rent it for 48 hours, watch it end to end. Or take the Live Pass and grow a new one.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
        {cuts.map(cut => {
          const isOwned = owned.allAccess || (owned.cuts || []).includes(cut.id);
          const pct = cut.rarity * 100;
          const pctLabel = pct >= 1 ? pct.toFixed(0) + "%" : pct >= 0.1 ? pct.toFixed(1) + "%" : "<0.1%";
          const finale = cut.opts[cut.opts.length - 1];
          const tagColor = cut.tag === "CANONICAL" ? accent : cut.tag === "RARE" ? tkc("cat-2") : cut.tag === "YOURS" ? "var(--c-good)" : "var(--c-ink-3)";
          return (
            <div key={cut.id} style={{ border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden", background: "var(--c-panel)", display: "flex", flexDirection: "column" }}>
              {/* thumbnail — finale frame */}
              <button onClick={() => onOpenCut(cut)} style={{ position: "relative", aspectRatio: "16/9", padding: 0, border: "none", cursor: "pointer", overflow: "hidden", background: finale?.color || accent, display: "block" }}>
                <FrameThumb kind={b5OptThumb(tree, tree.forks.length - 1, tree.forks[tree.forks.length - 1].options.indexOf(finale))} usePhoto/>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,8,10,.15) 0%, rgba(8,8,10,.55) 60%, rgba(8,8,10,.95) 100%)" }}></div>
                {/* glyph path strip */}
                <div style={{ position: "absolute", left: 12, top: 12, display: "flex", gap: 5 }}>
                  {cut.opts.map((o, k) => (
                    <span key={k} style={{ width: 24, height: 24, borderRadius: "var(--r-2)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(8,8,10,.66)", border: `1px solid ${(o.color || accent)}`, color: o.color || accent, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)" }}>{o.glyph}</span>
                  ))}
                </div>
                <div style={{ position: "absolute", left: 14, right: 14, bottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: tkc("white"), textShadow: "0 2px 12px rgba(0,0,0,.7)" }}>{cut.name}</span>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: tagColor, border: `1px solid ${tagColor}88`, borderRadius: "var(--r-1)", padding: "2px 5px", fontWeight: 700, background: "rgba(8,8,10,.5)" }}>{cut.tag}</span>
                  </div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.62)", letterSpacing: ".08em", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cut.pathLabel}</div>
                </div>
              </button>
              {/* footer — rarity + actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: accent, lineHeight: 1 }}>{pctLabel}</div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 2 }}>OF ROOMS LAND HERE</div>
                </div>
                {isOwned ? (
                  <button onClick={() => onOpenCut(cut)} className="t-mono" style={{ padding: "9px 13px", background: `${accent}18`, color: accent, border: `1px solid ${accent}66`, borderRadius: "var(--r-2)", cursor: "pointer", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, whiteSpace: "nowrap" }}>▶ PLAY</button>
                ) : (
                  <button onClick={() => rent(cut)} className="t-mono" style={{ padding: "9px 13px", background: accent, color: "var(--c-void)", border: "none", borderRadius: "var(--r-2)", cursor: "pointer", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, whiteSpace: "nowrap" }}>RENT · ${cut.price.toFixed(2)}</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── A branch's own watch page (full-screen overlay) ──────────────────────
function BranchCutWatchV5({ tree, cut, film, accent, onClose, onEnter }) {
  const isMobile = useIsMobile();
  const owned = window.branchedOwned ? window.branchedOwned(tree.filmId) : { cuts: [], allAccess: false };
  const [tick, setTick] = usB5(0);
  const isOwned = owned.allAccess || (owned.cuts || []).includes(cut.id);
  const finale = cut.opts[cut.opts.length - 1];
  const finaleIdx = tree.forks[tree.forks.length - 1].options.indexOf(finale);
  const synopsis = cut.opts.map(o => o.beat).join(" ");
  const pct = cut.rarity * 100;
  const pctLabel = pct >= 1 ? pct.toFixed(0) + "%" : pct >= 0.1 ? pct.toFixed(1) + "%" : "<0.1%";

  ueB5(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const y = window.scrollY; window.scrollTo(0, 0);
    return () => { window.removeEventListener("keydown", onKey); window.scrollTo(0, y); };
  }, []);

  // light only this cut's path in a mini tree
  const lit = cut.opts.map(o => o.id);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 3000, background: "var(--c-bg)", overflowY: "auto" }}>
      {/* hero */}
      <section style={{ position: "relative", height: isMobile ? "min(64vh,460px)" : "min(56vh,520px)", minHeight: 360, background: finale?.color || accent, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}><FrameThumb kind={b5OptThumb(tree, tree.forks.length - 1, finaleIdx)} usePhoto/></div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(8,8,10,.94) 0%, rgba(8,8,10,.6) 48%, rgba(8,8,10,.2) 100%)" }}></div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "55%", background: "linear-gradient(to top, var(--c-bg), transparent)" }}></div>

        {/* back */}
        <button onClick={onClose} className="t-mono" style={{ position: "absolute", top: 20, left: isMobile ? 16 : 40, zIndex: 2, display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "rgba(8,8,10,.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.2)", borderRadius: "var(--r-2)", color: tkc("white"), cursor: "pointer", fontSize: "var(--fs-label)", letterSpacing: ".16em" }} aria-label="Close" title="Close">← ALL BRANCHES</button>

        <div style={{ position: "absolute", inset: 0, padding: isMobile ? "0 16px 36px" : "0 40px 52px", display: "flex", flexDirection: "column", justifyContent: "flex-end", maxWidth: 820 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", fontWeight: 700, padding: "4px 9px", border: `1px solid ${accent}77`, borderRadius: "var(--r-1)", background: "rgba(8,8,10,.4)" }}>⑂ A BRANCH OF {tree.title.toUpperCase()}</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", letterSpacing: ".16em" }}>{cut.tag} · {pctLabel} OF ROOMS</span>
          </div>
          <h1 className="t-display" style={{ fontStyle: "italic", fontSize: "clamp(44px,6vw,88px)", lineHeight: 0.95, margin: "0 0 16px", letterSpacing: "-0.02em", textShadow: "0 4px 30px rgba(0,0,0,.6)" }}>{cut.name}</h1>
          {/* glyph path */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {cut.opts.map((o, k) => (
              <React.Fragment key={k}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, background: "rgba(8,8,10,.5)", border: `1px solid ${(o.color || accent)}`, color: o.color || accent }}>
                  <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)" }}>{o.glyph}</span>
                  <span style={{ fontSize: "var(--fs-body)" }}>{o.title}</span>
                </span>
                {k < cut.opts.length - 1 && <span style={{ color: "var(--c-ink-4)" }}>→</span>}
              </React.Fragment>
            ))}
          </div>
          <p style={{ fontSize: "var(--fs-lead)", lineHeight: 1.55, color: "var(--c-ink)", margin: "0 0 24px", maxWidth: 620, textShadow: "0 2px 12px rgba(0,0,0,.7)" }}>{synopsis}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {isOwned ? (
              <button className="btn btn-primary" style={{ height: 46, padding: "0 24px", fontSize: "var(--fs-body)", gap: 8 }} onClick={onEnter}>
                <Icon name="play" size={14}/> Play this branch
              </button>
            ) : (
              <button className="btn btn-primary" style={{ height: 46, padding: "0 24px", fontSize: "var(--fs-body)", gap: 8 }} onClick={() => window.openBranchedRent && window.openBranchedRent(tree, cut, () => setTick(t => t + 1))}>
                <Icon name="ticket" size={14}/> Rent 48h · ${cut.price.toFixed(2)}
              </button>
            )}
            <button className="btn" style={{ height: 46, padding: "0 18px", fontSize: "var(--fs-body)", gap: 8 }} onClick={onEnter}>
              <Icon name="play" size={13}/> Enter the live room instead
            </button>
          </div>
        </div>
      </section>

      {/* body — the path + the beats */}
      <div style={{ padding: isMobile ? "28px 16px 80px" : "44px 40px 90px", maxWidth: "var(--w-mid)", margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", background: "var(--c-panel)", padding: "20px 22px" }}>
          <B5Label accent={accent}>THIS BRANCH, FORK BY FORK</B5Label>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {cut.opts.map((o, k) => (
              <div key={k} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "120px 1fr", gap: isMobile ? 10 : 20, padding: "16px 0", borderTop: k === 0 ? "none" : "1px solid var(--c-line)", alignItems: "center" }}>
                <div style={{ position: "relative", aspectRatio: "16/10", borderRadius: "var(--r-2)", overflow: "hidden", background: o.color || accent }}>
                  <FrameThumb kind={b5OptThumb(tree, k, tree.forks[k].options.indexOf(o))} usePhoto/>
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent, ${o.color || accent}aa)` }}></div>
                  <span style={{ position: "absolute", left: 8, bottom: 6, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: tkc("white") }}>{o.glyph}</span>
                </div>
                <div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", fontWeight: 700, marginBottom: 4 }}>{tree.forks[k].actLabel} · {tree.forks[k].heading}</div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1.1 }}>{o.title}</div>
                  <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55, margin: "5px 0 0" }}>{o.beat}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <PathTreeV5 tree={tree} accent={accent}/>
      </div>
    </div>
  );
}

// ─── 04 · FROM THE DIRECTOR — richer module ───────────────────────────────
function DirectorModuleV5({ tree, film, accent }) {
  const voice = B5_DIRECTOR_VOICE[tree.filmId] || `Every fork is a real edit. There is no 'right' cut — the room decides what ${tree.title} is, one night at a time.`;
  const backNext = () => window.openPay && window.openPay({
    kind: "nft", title: `${tree.title} · Producer`, subtitle: tree.director, accent, priceUSD: 320,
    image: { kind: tree.poster, color: accent },
    perks: ["5× vote weight in every Branched film", `All ${tree.totalCuts} branches unlocked`, "Director room afterparty access", "Quarterly royalty on Watch revenue"],
    ticketUrl: `/branches/${tree.filmId}`,
  });
  return (
    <div data-screen-label="branched · director">
      <B5Label accent={accent}>04 · FROM THE DIRECTOR</B5Label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 0, border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden", background: `linear-gradient(135deg, ${accent}0e, var(--c-panel) 60%)` }}>
        <div style={{ padding: "26px 26px 22px" }}>
          {/* attribution row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <span style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${accent}, ${accent}55)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: tkc("white"), flexShrink: 0 }}>{tree.directorInitials}</span>
            <div style={{ minWidth: 0 }}>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1 }}>{tree.director}</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 4, textTransform: "uppercase" }}>Director · wrote every branch</div>
            </div>
          </div>
          <blockquote style={{ margin: 0, borderLeft: `2px solid ${accent}`, paddingLeft: 20 }}>
            <p className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", lineHeight: 1.42, color: "var(--c-ink)", margin: 0, letterSpacing: "-0.01em", textWrap: "pretty" }}>
              &ldquo;{voice}&rdquo;
            </p>
          </blockquote>
          {/* stat strip */}
          <div style={{ display: "flex", gap: 28, marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--c-line)", flexWrap: "wrap" }}>
            {[[tree.forks.length, "forks shot both ways"], [tree.totalCuts, "possible final cuts"], [tree.totalRuntimeMin + "m", "longest path runtime"]].map(([n, l], k) => (
              <div key={k}>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: accent, lineHeight: 1 }}>{n}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 4, textTransform: "uppercase" }}>{l}</div>
              </div>
            ))}
            <div style={{ flex: 1 }}></div>
            <button onClick={backNext} className="btn" style={{ alignSelf: "center", height: 40, padding: "0 16px", fontSize: "var(--fs-body)", gap: 7, color: accent, borderColor: `${accent}66` }}>
              <Icon name="ticket" size={12}/> Back the next film
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 05 · CAST — full ensemble, canonical card ────────────────────────────
function CastSectionV5({ filmId, tree, accent }) {
  const cast = umB5(() => {
    const CAST = window.CAST || [];
    const out = [];
    const seen = new Set();
    // real role-holders first
    (typeof getCastForFilm === "function" ? getCastForFilm(filmId) : []).forEach(({ actor, role }) => {
      if (actor && !seen.has(actor.id)) { seen.add(actor.id); out.push({ actor, sub: role.as + (role.lead ? " · lead" : "") }); }
    });
    // top up the ensemble from the cast pool (real performers; sub = their range)
    for (const a of CAST) {
      if (out.length >= 6) break;
      if (seen.has(a.id) || !a.photo) continue;
      seen.add(a.id);
      out.push({ actor: a, sub: (a.range || a.archetype || "Performer").split("·")[0].trim() });
    }
    return out;
  }, [filmId]);

  if (!cast.length) return null;
  const CARD_W = 150;
  return (
    <div data-screen-label="branched · cast">
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <B5Label accent={accent}>05 · CAST</B5Label>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{cast.length} PERFORMERS</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        {cast.map(({ actor, sub }) => (
          <button key={actor.id} onClick={() => navigate(`/cast/${actor.id}`)} style={{
            width: CARD_W, background: "var(--c-panel)", border: "1px solid var(--c-line)", padding: 0, cursor: "pointer",
            borderRadius: "var(--r-2)", overflow: "hidden", display: "flex", flexDirection: "column", color: "inherit", textAlign: "left",
            transition: "border-color .15s ease, transform .15s ease",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--c-line-3)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--c-line)"; e.currentTarget.style.transform = "none"; }}>
            <div style={{ width: "100%", aspectRatio: "1/1", overflow: "hidden", background: actor.palette ? actor.palette[1] : "var(--c-panel-2)" }}>
              {window.CastPortrait && <CastPortrait actor={actor} size={CARD_W}/>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "10px 12px 12px" }}>
              <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{actor.name}</span>
              <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", lineHeight: 1.35, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</span>
            </div>
          </button>
        ))}
        <span style={{ flex: 999, minWidth: 0 }} aria-hidden="true"></span>
      </div>
    </div>
  );
}

// ─── The page ─────────────────────────────────────────────────────────────
function BranchedWatchV5({ filmId }) {
  const tree = window.BRANCH_FILMS[filmId];
  const film = umB5(() => (window.CATALOG || []).find(f => f.id === filmId), [filmId]);
  const [entered, setEntered] = usB5(false);
  const [activeCut, setActiveCut] = usB5(null);
  const isMobile = useIsMobile();

  // The cinema itself — unchanged v4 viewer.
  if (entered && window.BranchedViewerV4) return <window.BranchedViewerV4 filmId={filmId}/>;

  const accent = tree.accentColor || tkc("amber");
  const synopsis = (film && (film.synopsis || film.logline)) || tree.lobbyBlurb || "";
  const firstSentence = synopsis.split(".")[0];
  const rest = synopsis.split(".").slice(1).join(".").trim();
  const genres = (film && film.genre) || tree.genre || [];
  const rating = (film && film.rating) || tree.rating;
  const nextFork = tree.forks[0];

  const backThis = () => window.openPay && window.openPay({
    kind: "nft", title: `${tree.title} · Producer`, subtitle: tree.director, accent, priceUSD: 320,
    image: { kind: tree.poster, color: accent },
    perks: ["5× vote weight in every Branched film", `All ${tree.totalCuts} branches unlocked`, "Director room afterparty access", "Quarterly royalty on Watch revenue"],
    ticketUrl: `/branches/${filmId}`,
  });

  return (
    <div style={{ background: "var(--c-bg)" }} data-screen-label="branched watch page">
      {/* a branch's own watch page */}
      {activeCut && <BranchCutWatchV5 tree={tree} cut={activeCut} film={film} accent={accent} onClose={() => setActiveCut(null)} onEnter={() => { setActiveCut(null); setEntered(true); }}/>}

      {/* Hero */}
      <section style={{ position: "relative", height: isMobile ? "min(72vh, 560px)" : "min(64vh, 620px)", minHeight: isMobile ? 380 : 460, background: (film && film.color) || tkc("black"), overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <FrameThumb kind={(film && film.thumb) || tree.poster} usePhoto/>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(8,8,10,.95) 0%, rgba(8,8,10,.7) 40%, rgba(8,8,10,.2) 70%, transparent 100%)" }}></div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "60%", background: "linear-gradient(to top, var(--c-bg) 0%, rgba(8,8,10,.6) 50%, transparent 100%)" }}></div>

        <div style={{ position: "absolute", inset: 0, padding: isMobile ? "60px 20px 60px" : "60px var(--gutter) 80px", display: "flex", flexDirection: "column", justifyContent: "flex-end", maxWidth: isMobile ? "100%" : 760 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-blood-l)", letterSpacing: ".16em", fontWeight: 600, padding: "4px 8px", border: "1px solid rgba(194,80,80,.55)", borderRadius: "var(--r-1)", background: "rgba(0,0,0,.4)", backdropFilter: "blur(8px)" }}>⑂ BRANCHED · CINA ORIGINAL</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", letterSpacing: ".16em" }}>
              {(film && film.year) ? `${film.year} · ` : ""}{tree.totalRuntimeMin} MIN · {genres.join(" / ").toUpperCase() || "ONE STORY, MANY CUTS"}
            </span>
          </div>
          <h1 className="t-display" style={{ fontStyle: "italic", fontSize: "clamp(56px, 7vw, 104px)", lineHeight: 0.95, margin: "0 0 18px", letterSpacing: "-0.02em", textShadow: "0 4px 30px rgba(0,0,0,.6)" }}>{tree.title}</h1>
          <p style={{ fontSize: "var(--fs-lead)", lineHeight: 1.5, color: "var(--c-ink)", margin: "0 0 8px", maxWidth: 580, textShadow: "0 2px 12px rgba(0,0,0,.7)" }}>{synopsis}</p>
          <div style={{ display: "flex", gap: 14, fontSize: "var(--fs-body)", color: "var(--c-ink-2)", marginBottom: 28, alignItems: "center", flexWrap: "wrap" }}>
            <span className="t-mono">{tree.director}</span>
            {rating > 0 && (<><span style={{ width: 3, height: 3, background: "var(--c-ink-3)", borderRadius: "50%" }}></span><span style={{ color: "var(--c-amber)" }}>★ {rating}</span></>)}
            <span style={{ width: 3, height: 3, background: "var(--c-ink-3)", borderRadius: "50%" }}></span>
            <span className="t-mono" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--c-blood-l)", letterSpacing: ".08em" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-blood-l)", boxShadow: "0 0 6px var(--c-blood-l)" }}></span>
              LIVE · {tree.roomSize.toLocaleString()} IN THE ROOM
            </span>
            <span style={{ width: 3, height: 3, background: "var(--c-ink-3)", borderRadius: "50%" }}></span>
            <span>{tree.forks.length} forks · {tree.totalCuts} possible cuts</span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary" style={{ height: 46, padding: "0 24px", fontSize: "var(--fs-body)", gap: 8 }} onClick={() => setEntered(true)}>
              <Icon name="play" size={14}/> Enter the room — vote live
            </button>
            <button className="btn" style={{ height: 46, padding: "0 18px", fontSize: "var(--fs-body)", gap: 8, color: isOnWatchlist(filmId) ? "var(--c-amber)" : "var(--c-ink)", borderColor: isOnWatchlist(filmId) ? "rgba(var(--accent-rgb),.4)" : "var(--c-line-2)" }} onClick={() => toggleWatchlist(filmId)}>
              <Icon name={isOnWatchlist(filmId) ? "heart" : "plus"} size={13}/> {isOnWatchlist(filmId) ? "On watchlist" : "Watchlist"}
            </button>
            <button className="btn" style={{ height: 46, padding: "0 18px", fontSize: "var(--fs-body)", gap: 8, background: "rgba(var(--accent-rgb),.08)", borderColor: "rgba(var(--accent-rgb),.4)", color: "var(--c-amber)" }} onClick={backThis}>
              <Icon name="ticket" size={13}/> Invest · Producer
            </button>
          </div>
        </div>
      </section>

      {/* Body */}
      <div style={{ padding: isMobile ? "28px 20px 100px" : "56px var(--gutter) 96px", maxWidth: "var(--w-page)", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 380px", gap: isMobile ? 24 : 48 }}>
          {/* Left */}
          <section style={{ minWidth: 0 }}>
            <div data-screen-label="branched · the film" style={{ marginBottom: 52, paddingBottom: 36, borderBottom: "1px solid var(--c-line)" }}>
              <B5Label accent={accent}>01 · THE FILM</B5Label>
              <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", margin: "0 0 22px", letterSpacing: "-0.02em", fontWeight: 400, lineHeight: 1.05, maxWidth: "20ch" }}>{firstSentence}.</h2>
              <p style={{ fontSize: "var(--fs-lead)", lineHeight: 1.65, color: "var(--c-ink-2)", margin: 0, maxWidth: 640, textWrap: "pretty" }}>{rest || synopsis}</p>
            </div>

            <div style={{ marginBottom: 52 }}><ForksSectionV5 tree={tree} accent={accent}/></div>

            <div style={{ marginBottom: 52, paddingTop: 8 }}><PathTreeV5 tree={tree} accent={accent}/></div>

            <div style={{ marginTop: 52, paddingTop: 40, borderTop: "1px solid var(--c-line)" }}>
              <BranchesForSaleV5 tree={tree} accent={accent} onOpenCut={setActiveCut}/>
            </div>

            <div style={{ marginTop: 52, paddingTop: 40, borderTop: "1px solid var(--c-line)" }}>
              <DirectorModuleV5 tree={tree} film={film} accent={accent}/>
            </div>

            <div style={{ marginTop: 52, paddingTop: 40, borderTop: "1px solid var(--c-line)" }}>
              <CastSectionV5 filmId={filmId} tree={tree} accent={accent}/>
            </div>
          </section>

          {/* Right rail */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 12, alignSelf: "start", position: isMobile ? "static" : "sticky", top: 24 }}>
            <div style={{ padding: 18, background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-blood-l)", letterSpacing: ".16em", fontWeight: 700, display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-blood-l)", boxShadow: "0 0 6px var(--c-blood-l)" }}></span> LIVE ROOM
              </div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", lineHeight: 1, color: "var(--c-ink)" }}>{tree.roomSize.toLocaleString()}</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 4 }}>WATCHING & VOTING NOW</div>
              {nextFork && (
                <div className="t-mono" style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--c-line)", fontSize: "var(--fs-label)", color: "var(--c-ink-2)", letterSpacing: ".16em" }}>
                  FIRST FORK · <span style={{ color: accent }}>{nextFork.actLabel}</span> AT {nextFork.atMinute}:00
                </div>
              )}
              <button className="btn btn-primary" style={{ marginTop: 14, width: "100%", height: 38, fontSize: "var(--fs-body)", gap: 8, justifyContent: "center" }} onClick={() => setEntered(true)}>
                <Icon name="play" size={11}/> Enter the room
              </button>
            </div>

            <div style={{ padding: 16, background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${accent}, ${accent}55)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: tkc("white"), flexShrink: 0 }}>{tree.directorInitials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{tree.director}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 2, textTransform: "uppercase" }}>Director · in room</div>
              </div>
              <button className="t-mono" style={{ padding: "4px 8px", background: "transparent", color: accent, border: `1px solid ${accent}55`, borderRadius: "var(--r-1)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600, cursor: "pointer", textTransform: "uppercase" }} onClick={() => window.toast && toast({ title: "FOLLOWING", text: "You'll get a nudge when this room opens its next fork.", kind: "good" })}>Follow </button>
            </div>

            {window.BranchedAccessCard
              ? <window.BranchedAccessCard tree={tree} onEnter={() => setEntered(true)}/>
              : (
            <div style={{ padding: 16, background: `linear-gradient(135deg, ${accent}10, var(--c-panel) 70%)`, border: `1px solid ${accent}44`, borderRadius: "var(--r-2)" }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>HOLDER PERK</div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1.3 }}>Vote 5× · unlock all {tree.totalCuts} cuts.</div>
              <button onClick={backThis} className="t-mono" style={{ marginTop: 12, width: "100%", padding: "10px 14px", background: accent, color: "var(--c-void)", border: "none", borderRadius: "var(--r-2)", cursor: "pointer", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase" }}>Back this film · $320</button>
            </div>
              )}
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─── Dispatcher override ──────────────────────────────────────────────────
function BranchedFilmPageV5({ filmId }) {
  if (filmId && filmId !== "compose" && window.BRANCH_FILMS && window.BRANCH_FILMS[filmId]) {
    return <BranchedWatchV5 filmId={filmId}/>;
  }
  return _BranchedDispatchV4 ? React.createElement(_BranchedDispatchV4, { filmId }) : null;
}

Object.assign(window, { BranchedFilmPage: BranchedFilmPageV5 });
