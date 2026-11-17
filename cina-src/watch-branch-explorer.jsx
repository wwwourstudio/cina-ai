// watch-branch-explorer.jsx — Choice stats + named cuts for the branched viewer.
//
// Two panels that complete the branched film page alongside the path map:
//   <BranchRoomStats>  — per-fork vote bars: what the room actually picked
//   <BranchNamedCuts>  — episode-style list of notable paths through the tree
// Both read the same BRANCH_FILMS tree (votes per option) — no new data.

function _bxPct(opt, fork) {
  const total = fork.options.reduce((s, o) => s + (o.votes || 0), 0) || 1;
  return Math.round(((opt.votes || 0) / total) * 100);
}

// ─── The room's choices — per-fork vote breakdown ────────────────────────
function BranchRoomStats({ tree, picks, accent }) {
  return (
    <div style={{ padding: "22px 24px 20px", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", fontWeight: 600, textTransform: "uppercase" }}>
          WHAT THE ROOM PICKED
        </div>
        <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", lineHeight: 1, marginTop: 4, letterSpacing: "-0.01em" }}>
          {tree.roomSize.toLocaleString()} watchers · every vote, every fork.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${tree.forks.length}, 1fr)`, gap: 18 }}>
        {tree.forks.map((fork, fi) => {
          const leader = [...fork.options].sort((a, b) => (b.votes || 0) - (a.votes || 0))[0];
          return (
            <div key={fork.id}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 3 }}>
                {fork.actLabel} · {fork.atMinute}M
              </div>
              <div style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)", marginBottom: 10, lineHeight: 1.3, minHeight: 32 }}>
                {fork.question}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {fork.options.map(opt => {
                  const pct = _bxPct(opt, fork);
                  const isLeader = opt.id === leader.id;
                  const isYours = picks && picks[fi] === opt.id;
                  return (
                    <div key={opt.id}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: "var(--fs-body)", color: isLeader ? "var(--c-ink)" : "var(--c-ink-3)", fontWeight: isLeader ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {opt.title}
                        </span>
                        {isYours && (
                          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", border: `1px solid ${accent}66`, borderRadius: "var(--r-1)", padding: "1px 4px", flexShrink: 0 }}>YOU</span>
                        )}
                        <span style={{ marginLeft: "auto", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: isLeader ? opt.color : "var(--c-ink-4)", fontWeight: isLeader ? 700 : 400, flexShrink: 0 }}>{pct}%</span>
                      </div>
                      <div style={{ height: 4, background: "rgba(255,255,255,.05)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                        <div style={{ width: pct + "%", height: "100%", background: isLeader ? opt.color : `${opt.color}66`, borderRadius: "var(--r-1)", transition: "width .6s ease" }}/>
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

// ─── Named cuts — episode-style list of paths through the tree ──────────
function _bxBuildCuts(tree, picks) {
  const byVotes = (fork, dir) => [...fork.options].sort((a, b) => dir * ((b.votes || 0) - (a.votes || 0)))[0];
  const share = (path) => Math.round(path.reduce((s, [opt, fork]) => s * (_bxPct(opt, fork) / 100), 1) * 1000) / 10;
  const mk = (opts) => opts.map((o, i) => [o, tree.forks[i]]);

  const leading = mk(tree.forks.map(f => byVotes(f, 1)));
  const quiet   = mk(tree.forks.map(f => byVotes(f, -1)));

  const cuts = [
    { id: "room",  name: "The Room's Cut",  note: "The leading choice at every fork — canonical tonight.", path: leading, badge: "CANONICAL" },
    { id: "quiet", name: "The Quiet Cut",   note: "The road less taken, all four times.", path: quiet, badge: null },
  ];

  if (picks && picks.every(Boolean)) {
    cuts.unshift({
      id: "yours", name: "Your Cut", note: "The film as you chose it.",
      path: mk(tree.forks.map((f, i) => f.options.find(o => o.id === picks[i]))), badge: "YOURS",
    });
  }
  return cuts.map(c => ({ ...c, sharePct: share(c.path) }));
}

function BranchNamedCuts({ tree, picks, accent }) {
  const cuts = _bxBuildCuts(tree, picks);
  return (
    <div style={{ padding: "22px 24px 14px", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", fontWeight: 600, textTransform: "uppercase" }}>
            NAMED CUTS
          </div>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", lineHeight: 1, marginTop: 4, letterSpacing: "-0.01em" }}>
            {tree.totalCuts} possible films. These are the ones people talk about.
          </div>
        </div>
      </div>

      {cuts.map((cut, ci) => (
        <div key={cut.id} style={{
          display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 18, alignItems: "center",
          padding: "14px 4px", borderTop: ci > 0 ? "1px solid var(--c-line)" : "none",
        }}>
          {/* Glyph chain */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {cut.path.map(([opt], i) => (
              <React.Fragment key={i}>
                <span title={opt.title} style={{
                  width: 30, height: 30, borderRadius: "var(--r-1)", flexShrink: 0,
                  background: `linear-gradient(135deg, ${opt.color}44, ${tkc("bg")})`,
                  border: `1px solid ${opt.color}88`, color: opt.color,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)",
                }}>{opt.glyph}</span>
                {i < cut.path.length - 1 && <span style={{ color: "var(--c-ink-4)", fontSize: "var(--fs-label)" }}>›</span>}
              </React.Fragment>
            ))}
          </div>
          {/* Name + sequence */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500 }}>{cut.name}</span>
              {cut.badge && (
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", border: `1px solid ${accent}66`, borderRadius: "var(--r-1)", padding: "2px 5px" }}>{cut.badge}</span>
              )}
            </div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {cut.path.map(([opt]) => opt.title).join(" → ")} · {cut.note}
            </div>
          </div>
          {/* Share */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{cut.sharePct}%</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>OF ROOMS</div>
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { BranchRoomStats, BranchNamedCuts });
