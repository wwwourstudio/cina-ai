// branch-handoff.jsx — Workflow walkthrough + Push-to-Watch handoff for the
// Branch panel (branch-tree.jsx). Two overlays:
//
//   BTWalkthrough   — 5-step guided tour of the graph workflow
//   BTHandoffModal  — pre-flight validation + the actual handoff: writes the
//                     tree into cina:branch-handoff (and window.BRANCH_HANDOFF)
//                     in the exact shape Watch's branched player consumes,
//                     with a JSON download for external pipelines.

const { useState: usBH, useMemo: umBH } = React;

// ─── Walkthrough ─────────────────────────────────────────────────────────

const BH_STEPS = [
  { n: "01", title: "Scenes are nodes.", body: "Every card on the canvas is a scene. Drag to reposition, click to edit it in the Inspector. Add scenes from the library rail or the toolbar.", glyph: "▢" },
  { n: "02", title: "Options are ports.", body: "A scene asks one question with up to 3 options. Each option has a colored port on the card's right edge — that port is where its story goes next.", glyph: "◉" },
  { n: "03", title: "Noodles are the story.", body: "Drag a port to any scene to connect it. Click a noodle to select it — press Delete or use the ✕ chip to disconnect. Drop on empty canvas to unwire.", glyph: "∿" },
  { n: "04", title: "Endings are terminal.", body: "Blood-red cards with no outgoing options. Every option must eventually reach one — the health check below the canvas counts paths per ending.", glyph: "◼" },
  { n: "05", title: "Preview, then push.", body: "▶ Preview plays the film fork-by-fork exactly as the audience votes it. When the tree is green, ↗ Push to Watch validates and ships it as a Branched film.", glyph: "↗" },
];

function BTWalkthrough({ onClose }) {
  return <CinaTour id="branch" steps={BH_STEPS.map(s => ({ title: s.title, body: s.body, kicker: `The branch workflow · ${s.n}` }))} onDone={onClose}/>;
}

// ─── Handoff validation ──────────────────────────────────────────────────

function bhValidate(tree) {
  const byId = Object.fromEntries(tree.nodes.map(n => [n.id, n]));
  const issues = [];
  // 1 · Unconnected options
  const loose = [];
  tree.nodes.forEach(n => n.options.forEach(o => { if (!o.next) loose.push(`${n.title} → ${o.label}`); }));
  if (loose.length) issues.push({ level: "error", label: `${loose.length} unconnected option${loose.length > 1 ? "s" : ""}`, detail: loose.slice(0, 4).join(" · ") + (loose.length > 4 ? " …" : "") });
  // 2 · Broken links
  const broken = [];
  tree.nodes.forEach(n => n.options.forEach(o => { if (o.next && !byId[o.next]) broken.push(o.label); }));
  if (broken.length) issues.push({ level: "error", label: `${broken.length} option${broken.length > 1 ? "s" : ""} pointing at deleted scenes`, detail: broken.join(" · ") });
  // 3 · Unreachable nodes
  const reachable = new Set();
  const walk = (id) => { if (!id || reachable.has(id)) return; reachable.add(id); (byId[id]?.options || []).forEach(o => walk(o.next)); };
  tree.nodes.filter(n => n.col === 0).forEach(n => walk(n.id));
  const orphans = tree.nodes.filter(n => !reachable.has(n.id));
  if (orphans.length) issues.push({ level: "warn", label: `${orphans.length} unreachable scene${orphans.length > 1 ? "s" : ""}`, detail: orphans.map(n => n.title).slice(0, 4).join(" · ") });
  // 4 · Ending count
  const endings = tree.nodes.filter(n => n.isEnding);
  if (!endings.length) issues.push({ level: "error", label: "No endings", detail: "Add at least one terminal ending card." });
  // 5 · Start node
  if (!tree.nodes.some(n => n.col === 0)) issues.push({ level: "error", label: "No opening scene", detail: "The tree needs a scene in ACT I (column 0)." });
  return issues;
}

// The exact shape watch-branches-v4's player consumes.
function bhPayload(tree, stats, filmTitle) {
  return {
    format: "cina.branched/1",
    exportedAt: new Date().toISOString(),
    film: { id: tree.filmId, title: filmTitle || tree.title, director: tree.director, runtimeMin: tree.totalRuntimeMin },
    stats: { nodes: tree.nodes.length, paths: stats.paths, endings: stats.endings },
    tree: tree.nodes.map(n => ({
      id: n.id, title: n.title, act: n.act, atMinute: n.atMinute, isEnding: !!n.isEnding,
      setup: n.setup, question: n.question || null,
      options: n.options.map(o => ({ id: o.id, label: o.label, beat: o.beat, tone: o.tone, color: o.color, next: o.next })),
    })),
  };
}

function BTHandoffModal({ tree, stats, filmTitle, onClose }) {
  const issues = umBH(() => bhValidate(tree), [tree]);
  const errors = issues.filter(i => i.level === "error");
  const [pushed, setPushed] = usBH(false);
  const payload = umBH(() => bhPayload(tree, stats, filmTitle), [tree, stats, filmTitle]);

  const doPush = () => {
    try {
      localStorage.setItem("cina:branch-handoff", JSON.stringify(payload));
      window.BRANCH_HANDOFF = payload;
      window.dispatchEvent(new CustomEvent("cina:branch-handoff", { detail: payload }));
    } catch {}
    setPushed(true);
  };
  const doDownload = () => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (payload.film.title || "branched-film").toLowerCase().replace(/\s+/g, "-") + ".branched.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(5,5,6,.78)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "min(620px, 100%)", maxHeight: "88vh", overflowY: "auto", background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)", boxShadow: "0 40px 100px rgba(0,0,0,.6)" }}>
        <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 12 }}>
          <span className="t-label" style={{ color: "var(--c-amber)", letterSpacing: ".16em" }}>PUSH TO WATCH</span>
          <span style={{ flex: 1 }}></span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--c-ink-3)", cursor: "pointer", fontSize: "var(--fs-body)", padding: 2 }} aria-label="Close" title="Close">✕</button>
        </div>

        <div style={{ padding: "22px 24px" }}>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", letterSpacing: "-0.02em", marginBottom: 4 }}>{payload.film.title}</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 20 }}>
            {payload.stats.nodes} SCENES · {payload.stats.paths} PATHS · {payload.stats.endings} ENDINGS · ~{payload.film.runtimeMin}M
          </div>

          {/* Pre-flight checks */}
          <div className="t-label" style={{ marginBottom: 10 }}>PRE-FLIGHT</div>
          {issues.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "rgba(111,191,138,.07)", border: "1px solid rgba(111,191,138,.35)", borderRadius: "var(--r-2)", marginBottom: 20 }}>
              <span style={{ color: `var(--c-good, ${tkc("good")})`, fontSize: "var(--fs-body)" }}>✓</span>
              <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>Every option is wired, every path reaches an ending. Ready to ship.</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {issues.map((iss, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "11px 14px", borderRadius: "var(--r-2)", background: iss.level === "error" ? "rgba(201,85,72,.08)" : "rgba(var(--accent-rgb),.07)", border: `1px solid ${iss.level === "error" ? "rgba(201,85,72,.4)" : "rgba(var(--accent-rgb),.3)"}` }}>
                  <span style={{ color: iss.level === "error" ? `var(--c-blood-l, ${tkc("bad")})` : "var(--c-amber)", fontSize: "var(--fs-body)", flexShrink: 0 }}>{iss.level === "error" ? "✕" : "△"}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 600 }}>{iss.label}</div>
                    <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 2, lineHeight: 1.4 }}>{iss.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* What happens on push */}
          <div className="t-label" style={{ marginBottom: 10 }}>HANDOFF</div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6, marginBottom: 18 }}>
            Pushing publishes this tree in the <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }}>cina.branched/1</span> format — Watch's branched player reads it directly, and the JSON download is the same payload for external pipelines.
          </div>

          {pushed ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "rgba(111,191,138,.08)", border: "1px solid rgba(111,191,138,.4)", borderRadius: "var(--r-2)", marginBottom: 16 }}>
              <span style={{ color: `var(--c-good, ${tkc("good")})`, fontSize: "var(--fs-lead)" }}>✓</span>
              <div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 600 }}>Pushed to Watch.</div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 2 }}>The tree is live in the branched pipeline. Open Watch → Branched to see the room.</div>
              </div>
            </div>
          ) : null}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={doPush} disabled={errors.length > 0} style={{ ...bhPrimaryBtn, opacity: errors.length ? .45 : 1, cursor: errors.length ? "not-allowed" : "pointer" }}>
              {pushed ? "✓ Pushed" : errors.length ? `Fix ${errors.length} error${errors.length > 1 ? "s" : ""} first` : "↗ Push to Watch"}
            </button>
            <button onClick={doDownload} style={bhGhostBtn}>⤓ Download .branched.json</button>
            {pushed && <button onClick={() => { window.location.href = "index.html#/branches"; }} style={bhGhostBtn}>Open in Watch →</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

const bhPrimaryBtn = {
  padding: "10px 18px", background: "var(--c-amber)", color: "var(--c-void)",
  border: "none", borderRadius: "var(--r-2)", cursor: "pointer",
  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
};
const bhGhostBtn = {
  padding: "10px 16px", background: "transparent", color: "var(--c-ink-2)",
  border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", cursor: "pointer",
  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600, textTransform: "uppercase",
};

Object.assign(window, { BTWalkthrough, BTHandoffModal });
