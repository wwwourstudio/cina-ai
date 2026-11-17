// branch-script.jsx — Screenplay view of the branched-film tree.
//
// The second of two tabs on Studio's Branch panel (Graph ↔ Script). Renders
// the SAME tree state as branch-tree.jsx's node canvas, in screenplay form:
// act-grouped scenes, action lines, centered questions, and CHOICE blocks
// with editable labels + beats. Every edit writes through the same
// updateNode / updateOption callbacks the graph uses — the two views can
// never drift.

const { useState: useStateBS } = React;

const BS_ACT_ORDER = ["ACT I", "ACT II", "ACT III", "FINALE", "ENDING"];

function bsActColor(act) {
  return (window.BT_ACT_COLORS && window.BT_ACT_COLORS[act]) || {
    "ACT I": "var(--c-amber)", "ACT II": tkc("cat-1"), "ACT III": tkc("cat-2"),
    "FINALE": tkc("bad"), "ENDING": tkc("blood"),
  }[act] || tkc("amber");
}

// Editable inline text — looks like screenplay text until you click it.
function BSEditable({ value, onCommit, style, multiline = false, placeholder }) {
  const [editing, setEditing] = useStateBS(false);
  const [draft, setDraft] = useStateBS(value);
  const commit = () => { setEditing(false); if (draft !== value) onCommit(draft); };
  if (editing) {
    const common = {
      autoFocus: true, value: draft,
      onChange: e => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: e => { if (e.key === "Enter" && !multiline) { e.preventDefault(); commit(); } if (e.key === "Escape") { setDraft(value); setEditing(false); } },
      style: {
        ...style, width: "100%", background: "rgba(var(--accent-rgb),.05)",
        border: "1px solid var(--c-amber)", borderRadius: "var(--r-1)", outline: "none",
        padding: "2px 6px", color: "var(--c-ink)", resize: "vertical",
        fontFamily: style?.fontFamily || "inherit", fontSize: style?.fontSize || "inherit",
      },
    };
    return multiline ? <textarea rows={2} {...common}/> : <input {...common}/>;
  }
  return (
    <span
      onClick={() => { setDraft(value); setEditing(true); }}
      title="Click to edit"
      style={{ ...style, cursor: "text", borderBottom: "1px dashed transparent", transition: "border-color .12s" }}
      onMouseEnter={e => e.currentTarget.style.borderBottomColor = "var(--c-line-3)"}
      onMouseLeave={e => e.currentTarget.style.borderBottomColor = "transparent"}
    >{value || <span style={{ color: "var(--c-ink-4)" }}>{placeholder || "—"}</span>}</span>
  );
}

function BTScriptView({ tree, filmTitle, updateNode, updateOption, setSelectedId, onJumpToGraph }) {
  const byId = Object.fromEntries(tree.nodes.map(n => [n.id, n]));
  const acts = BS_ACT_ORDER.map(act => ({
    act,
    nodes: tree.nodes.filter(n => (n.act || (n.isEnding ? "ENDING" : "ACT I")) === act),
  })).filter(a => a.nodes.length);

  const jump = (id) => {
    const el = document.getElementById("bs-" + id);
    if (el) { const sc = el.closest("[data-bs-scroll]"); if (sc) sc.scrollTop = el.offsetTop - 80; }
  };

  return (
    <div data-bs-scroll="true" style={{ position: "absolute", inset: 0, top: 52, overflowY: "auto", background: "var(--c-bg)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "44px 32px 120px" }}>
        {/* Title page block */}
        <div style={{ textAlign: "center", marginBottom: 52, paddingBottom: 36, borderBottom: "1px solid var(--c-line)" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", marginBottom: 12 }}>BRANCHED SCREENPLAY · SYNCED WITH GRAPH</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, letterSpacing: "-0.02em", color: "var(--c-ink)" }}>{filmTitle || tree.title}</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 10 }}>
            {tree.nodes.filter(n => !n.isEnding).length} SCENES · {tree.nodes.filter(n => n.isEnding).length} ENDINGS · ~{tree.totalRuntimeMin}M
          </div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)", marginTop: 14, lineHeight: 1.5 }}>
            Click any line to edit. Changes appear in the Graph instantly — they're the same film.
          </div>
        </div>

        {acts.map(({ act, nodes }) => (
          <div key={act} style={{ marginBottom: 48 }}>
            {/* Act marker */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "0 0 28px" }}>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: bsActColor(act), fontWeight: 700, whiteSpace: "nowrap" }}>{act}</span>
              <span style={{ flex: 1, height: 1, background: "var(--c-line)" }}/>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", whiteSpace: "nowrap" }}>{nodes.length} SCENE{nodes.length > 1 ? "S" : ""}</span>
            </div>

            {nodes.map(node => (
              <div key={node.id} id={"bs-" + node.id} style={{ marginBottom: 40 }}>
                {/* Scene heading */}
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
                  <span className="t-mono" style={{
                    fontSize: "var(--fs-body)", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase",
                    color: node.isEnding ? tkc("bad") : "var(--c-ink)",
                  }}>
                    {node.isEnding ? "ENDING — " : ""}
                    <BSEditable value={node.title} onCommit={v => updateNode(node.id, { title: v })} style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}/>
                  </span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", whiteSpace: "nowrap" }}>MIN {node.atMinute}</span>
                  <span style={{ flex: 1 }}/>
                  <button
                    onClick={() => { setSelectedId(node.id); onJumpToGraph && onJumpToGraph(node.id); }}
                    className="btn-ghost" title="Show this scene on the graph"
                    style={{ height: 20, padding: "0 8px", fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", letterSpacing: ".16em", color: "var(--c-ink-4)", whiteSpace: "nowrap" }}
                  >VIEW IN GRAPH ↗</button>
                </div>

                {/* Action / setup */}
                <div style={{ fontSize: "var(--fs-body)", lineHeight: 1.7, color: "var(--c-ink-2)", marginBottom: 14 }}>
                  <BSEditable multiline value={node.setup} onCommit={v => updateNode(node.id, { setup: v })} style={{ fontSize: "var(--fs-body)", lineHeight: 1.7 }} placeholder="What happens in this scene?"/>
                </div>

                {/* Question (centered, like a character cue) */}
                {!node.isEnding && (
                  <div style={{ textAlign: "center", margin: "20px 0 14px" }}>
                    <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 5 }}>THE ROOM DECIDES</div>
                    <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>
                      <BSEditable value={node.question} onCommit={v => updateNode(node.id, { question: v })} style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)" }} placeholder="What's the question?"/>
                    </div>
                  </div>
                )}

                {/* CHOICE block */}
                {node.options && node.options.length > 0 && (
                  <div style={{ border: "1px solid var(--c-line)", borderLeft: `2px solid ${bsActColor(node.act)}`, borderRadius: "var(--r-2)", overflow: "hidden" }}>
                    {node.options.map((opt, i) => {
                      const target = opt.next ? byId[opt.next] : null;
                      return (
                        <div key={opt.id} style={{
                          display: "grid", gridTemplateColumns: "26px 1fr auto", gap: 12, alignItems: "baseline",
                          padding: "11px 16px", borderBottom: i < node.options.length - 1 ? "1px solid var(--c-line)" : "none",
                          background: i % 2 ? "rgba(255,255,255,.012)" : "transparent",
                        }}>
                          <span className="t-mono" style={{ fontSize: "var(--fs-label)", fontWeight: 700, color: opt.color || tkc("amber") }}>{String.fromCharCode(65 + i)}.</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)" }}>
                              <BSEditable value={opt.label} onCommit={v => updateOption(node.id, opt.id, { label: v })} style={{ fontSize: "var(--fs-body)", fontWeight: 600 }} placeholder="Choice label"/>
                            </div>
                            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 2, lineHeight: 1.5 }}>
                              <BSEditable multiline value={opt.beat} onCommit={v => updateOption(node.id, opt.id, { beat: v })} style={{ fontSize: "var(--fs-body)", lineHeight: 1.5 }} placeholder="What this choice plays like"/>
                            </div>
                          </div>
                          <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginBottom: 3 }}>{opt.tone || ""}</div>
                            {target ? (
                              <button onClick={() => jump(target.id)} className="t-mono" style={{
                                appearance: "none", background: "transparent", border: "none", cursor: "pointer",
                                fontSize: "var(--fs-label)", letterSpacing: ".08em", color: bsActColor(target.act || "ENDING"), padding: 0,
                              }}>→ {target.title.replace(/\.$/, "").slice(0, 26)}</button>
                            ) : (
                              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-blood-l)", letterSpacing: ".08em" }}>→ UNCONNECTED</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

window.BTScriptView = BTScriptView;
