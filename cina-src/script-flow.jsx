/* global React */
// script-flow.jsx — Five-stage Script Maker workflow with Cina coaching.
// Stages: Idea → Outline → Beats → Scenes → Revisions.
// Wraps the existing ScriptPanel (the "Scenes" stage uses the editor we already built).

const { useState: useStateSf, useEffect: useEffectSf, useMemo: useMemoSf } = React;

const SCRIPT_STAGES = [
  { id: "idea",      num: "01", title: "Idea",      sub: "Logline, premise, pillars" },
  { id: "outline",   num: "02", title: "Outline",   sub: "Three acts, turning points" },
  { id: "beats",     num: "03", title: "Beats",     sub: "Sequence cards on the wall" },
  { id: "scenes",    num: "04", title: "Scenes",    sub: "Final-Draft format" },
  { id: "revisions", num: "05", title: "Revisions", sub: "Cina coaching pass" },
];

// ─── Stage rail (sticky, top of script) ────────────────────────────
function StageRail({ active, setActive, completion }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 0,
      padding: "14px 32px",
      background: "var(--c-panel)",
      borderBottom: "1px solid var(--c-line)",
    }}>
      {SCRIPT_STAGES.map((s, i) => {
        const isActive = s.id === active;
        const c = completion[s.id] || 0;
        return (
          <React.Fragment key={s.id}>
            <button
              onClick={() => setActive(s.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 14px", borderRadius: "var(--r-2)",
                background: isActive ? "var(--c-panel-2)" : "transparent",
                border: `1px solid ${isActive ? "var(--c-line-2)" : "transparent"}`,
                cursor: "pointer", color: "inherit",
                transition: "background .14s ease",
              }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: "50%",
                background: c >= 1 ? "var(--c-amber)" : "var(--c-bg)",
                border: `1.5px solid ${c >= 1 ? "var(--c-amber)" : isActive ? "var(--c-amber)" : "var(--c-line-2)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                color: c >= 1 ? tkc("panel-2") : isActive ? "var(--c-amber)" : "var(--c-ink-3)",
              }}>
                {c >= 1 ? "✓" : s.num}
              </span>
              <div style={{ textAlign: "left", lineHeight: 1.15 }}>
                <div style={{
                  fontFamily: "var(--f-display)", fontStyle: "italic",
                  fontSize: "var(--fs-lead)", color: isActive ? "var(--c-ink)" : "var(--c-ink-2)",
                }}>
                  {s.title}
                </div>
                <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>
                  {s.sub}
                </div>
              </div>
            </button>
            {i < SCRIPT_STAGES.length - 1 && (
              <span style={{
                width: 24, height: 1,
                background: completion[s.id] >= 1 ? "var(--c-amber)" : "var(--c-line-2)",
                margin: "0 2px",
              }}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Stage 1: Idea ─────────────────────────────────────────────────
const SAMPLE_IDEA = {
  logline: "After a storm strands a lighthouse keeper with a stranger she dreamed about for years, she must decide what to keep and what to let the sea take.",
  premise: "A study of solitude that turns into a study of recognition. Quiet, slow, and warm.",
  pillars: ["Solitude", "Recognition", "What we keep"],
  audience: "Adults who liked Past Lives or Aftersun",
  comp: "Past Lives × Tarkovsky's Stalker",
};

function IdeaStage({ data, setData, onAdvance }) {
  const [busy, setBusy] = useStateSf(false);

  async function critique() {
    if (!data.logline) return;
    setBusy(true);
    try {
      const text = await window.claude.complete({
        messages: [{
          role: "user",
          content: `You are Cina, a sharp story editor. The director's logline: "${data.logline}". In two short paragraphs (terse, working-room tone, no preamble), tell them: (1) what's working, (2) the one fix that would sharpen it most.`
        }]
      });
      setData(d => ({ ...d, cinaIdeaNote: text }));
    } catch (e) {
      setData(d => ({ ...d, cinaIdeaNote: "The premise is strong; the antagonist is implied but not present. Make the sea itself the second character — give it a want." }));
    }
    setBusy(false);
  }

  return (
    <div style={{ padding: "32px 40px", maxWidth: 880, margin: "0 auto", color: "var(--c-ink)" }}>
      <h2 className="t-display" style={{ fontSize: "var(--fs-head)", fontStyle: "italic", margin: 0, letterSpacing: "-0.01em" }}>
        Start with one sentence.
      </h2>
      <div style={{ marginTop: 8, color: "var(--c-ink-3)", fontSize: "var(--fs-body)" }}>
        Your logline is the seed everything grows from. Aim for 25–40 words; protagonist, want, obstacle, stakes.
      </div>

      <div style={{ marginTop: 24 }}>
        <label className="t-label" style={{ color: "var(--c-ink-4)", display: "block", marginBottom: 8 }}>LOGLINE</label>
        <textarea
          value={data.logline}
          onChange={e => setData(d => ({ ...d, logline: e.target.value }))}
          rows={3}
          placeholder="One sentence. Who, wants what, against what, and what happens if they fail."
          style={{
            width: "100%", padding: "14px 16px",
            background: "var(--c-panel)", border: "1px solid var(--c-line)",
            borderRadius: "var(--r-2)", color: "var(--c-ink)",
            fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)",
            lineHeight: 1.5, resize: "vertical",
          }}
        />
        <div style={{
          marginTop: 6, display: "flex", justifyContent: "space-between",
          fontSize: "var(--fs-label)", color: "var(--c-ink-4)",
        }}>
          <span>{data.logline.split(/\s+/).filter(Boolean).length} words</span>
          <button
            onClick={() => setData(d => ({ ...d, logline: SAMPLE_IDEA.logline }))}
            style={{ background: "transparent", border: "none", color: "var(--c-ink-3)", fontSize: "var(--fs-label)", cursor: "pointer", textDecoration: "underline" }}
          >
            Use sample
          </button>
        </div>
      </div>

      <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label className="t-label" style={{ color: "var(--c-ink-4)", display: "block", marginBottom: 8 }}>PREMISE</label>
          <textarea
            value={data.premise}
            onChange={e => setData(d => ({ ...d, premise: e.target.value }))}
            rows={4}
            placeholder="The feeling, mood, world. Two or three sentences."
            style={inputStyle()}
          />
        </div>
        <div>
          <label className="t-label" style={{ color: "var(--c-ink-4)", display: "block", marginBottom: 8 }}>COMPS</label>
          <input
            value={data.comp}
            onChange={e => setData(d => ({ ...d, comp: e.target.value }))}
            placeholder="Film × director, e.g. Past Lives × Tarkovsky"
            style={{ ...inputStyle(), height: 40 }}
          />
          <label className="t-label" style={{ color: "var(--c-ink-4)", display: "block", margin: "14px 0 8px" }}>AUDIENCE</label>
          <input
            value={data.audience}
            onChange={e => setData(d => ({ ...d, audience: e.target.value }))}
            placeholder="Who is this for?"
            style={{ ...inputStyle(), height: 40 }}
          />
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <label className="t-label" style={{ color: "var(--c-ink-4)", display: "block", marginBottom: 8 }}>THEMATIC PILLARS — three words</label>
        <div style={{ display: "flex", gap: 10 }}>
          {[0, 1, 2].map(i => (
            <input
              key={i}
              value={data.pillars[i] || ""}
              onChange={e => setData(d => {
                const next = [...d.pillars]; next[i] = e.target.value;
                return { ...d, pillars: next };
              })}
              placeholder={["Solitude", "Recognition", "Cost"][i]}
              style={{
                flex: 1, height: 44, padding: "0 14px",
                background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
                color: "var(--c-ink)", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)",
                textAlign: "center",
              }}
            />
          ))}
        </div>
      </div>

      {/* Cina note */}
      <CinaCard
        title="Cina's read on the idea"
        body={data.cinaIdeaNote}
        busy={busy}
        onCritique={critique}
        ctaLabel="Get Cina's note"
      />

      <StageFooter_scriptFlow
        canAdvance={!!data.logline.trim()}
        onAdvance={onAdvance}
        nextLabel="Build outline →"
      />
    </div>
  );
}

// ─── Stage 2: Outline ──────────────────────────────────────────────
const DEFAULT_OUTLINE = {
  act1: { title: "ACT I — Stillness", text: "VOSS keeps the lighthouse alone. Routine, sea, wind. A storm is forecast. She prepares; we learn she has been preparing for years." },
  midpt: { title: "MIDPOINT — The stranger", text: "After the storm, MIRA walks out of the surf — a face Voss has dreamed about for as long as she can remember. Voss takes her in." },
  act2: { title: "ACT II — Recognition", text: "Days pass. Mira knows things she shouldn't. Voss begins to fear — not Mira, but what Mira's presence is asking her to admit. The lighthouse lamp begins to fail." },
  climax: { title: "CLIMAX — The lamp", text: "A second storm. The lamp dies. Voss must choose: light it with the only thing left to burn, or let the sea take what it came for." },
  act3: { title: "ACT III — Keeping", text: "Morning. The lamp is lit again. Mira is gone. Voss is changed; the keeping was never the lamp." },
};

function OutlineStage({ data, setData, onAdvance, onBack }) {
  const [busy, setBusy] = useStateSf(false);

  async function critique() {
    setBusy(true);
    try {
      const outlineText = Object.entries(data.outline).map(([k, v]) => `${v.title}\n${v.text}`).join("\n\n");
      const text = await window.claude.complete({
        messages: [{
          role: "user",
          content: `You are Cina, a story editor. The film's logline: "${data.logline}". The outline:\n\n${outlineText}\n\nIn two short paragraphs (terse, working-room tone), tell the writer: (1) where the structure is solid, (2) the one act-level move that would deepen it most.`
        }]
      });
      setData(d => ({ ...d, cinaOutlineNote: text }));
    } catch (e) {
      setData(d => ({ ...d, cinaOutlineNote: "Act II reads observational. Find a midpoint cost — what does Voss have to give up to keep Mira longer? That cost is the engine of Act III." }));
    }
    setBusy(false);
  }

  const o = data.outline || DEFAULT_OUTLINE;

  function patch(key, val) {
    setData(d => ({ ...d, outline: { ...d.outline, [key]: { ...d.outline[key], text: val } } }));
  }

  return (
    <div style={{ padding: "32px 40px", maxWidth: "var(--w-mid)", margin: "0 auto", color: "var(--c-ink)" }}>
      <h2 className="t-display" style={{ fontSize: "var(--fs-head)", fontStyle: "italic", margin: 0, letterSpacing: "-0.01em" }}>
        Three acts. Two pivots. One climax.
      </h2>
      <div style={{ marginTop: 8, color: "var(--c-ink-3)", fontSize: "var(--fs-body)" }}>
        Don't write scenes here — write what each act <em>is about</em>. Two or three sentences each.
      </div>

      {/* Logline reminder */}
      <div style={{
        marginTop: 22, padding: "14px 18px",
        background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
        fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink-2)",
        lineHeight: 1.5,
      }}>
        "{data.logline}"
      </div>

      <div style={{ marginTop: 24, display: "grid", gap: 14 }}>
        {Object.entries(o).map(([key, beat]) => (
          <div key={key} style={{
            display: "grid", gridTemplateColumns: "180px 1fr", gap: 16,
            padding: "18px 20px",
            background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
          }}>
            <div>
              <div className="t-mono" style={{
                fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)",
                marginBottom: 4,
              }}>
                {beat.title.split("—")[0].trim()}
              </div>
              <div className="t-display" style={{
                fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)",
                lineHeight: 1.2,
              }}>
                {beat.title.split("—")[1]?.trim() || ""}
              </div>
            </div>
            <textarea
              value={beat.text}
              onChange={e => patch(key, e.target.value)}
              rows={3}
              style={{
                ...inputStyle(),
                background: "var(--c-bg)",
                fontSize: "var(--fs-body)", lineHeight: 1.55, resize: "vertical",
                fontFamily: "var(--f-sans)", fontStyle: "normal",
              }}
            />
          </div>
        ))}
      </div>

      <CinaCard
        title="Cina's read on the outline"
        body={data.cinaOutlineNote}
        busy={busy}
        onCritique={critique}
        ctaLabel="Get structural note"
      />

      <StageFooter_scriptFlow
        onBack={onBack}
        canAdvance={true}
        onAdvance={onAdvance}
        nextLabel="Card the beats →"
      />
    </div>
  );
}

// ─── Stage 3: Beats ────────────────────────────────────────────────
const DEFAULT_BEATS = [
  { id: "b1", act: "I", title: "The morning routine", body: "Voss wakes, climbs the lighthouse stairs, checks the lamp. We learn the rhythm.", tag: "establish" },
  { id: "b2", act: "I", title: "The storm warning", body: "Radio. Voss prepares: shutters, water, the cellar.", tag: "setup" },
  { id: "b3", act: "I", title: "The dream we don't see", body: "Voss writes one sentence in a journal: 'She came again.'", tag: "subtext" },
  { id: "b4", act: "II", title: "Mira from the surf", body: "After the storm, a body in the foam. Mira lives. Voss recognizes her.", tag: "midpoint" },
  { id: "b5", act: "II", title: "The shared silence", body: "They don't talk for a day. Mira knows where the salt is kept.", tag: "tension" },
  { id: "b6", act: "II", title: "The lamp flickers", body: "Voss notices the lamp is dimmer. She doesn't tell Mira.", tag: "ticking" },
  { id: "b7", act: "III", title: "Second storm", body: "It's worse. The lamp goes. Voss must choose.", tag: "climax" },
  { id: "b8", act: "III", title: "Morning, alone", body: "Light. Mira gone. Voss writes one sentence: 'I let her go.'", tag: "resolve" },
];

function BeatsStage({ data, setData, onAdvance, onBack }) {
  const beats = data.beats || DEFAULT_BEATS;
  const [busy, setBusy] = useStateSf(false);
  const [draggingId, setDraggingId] = useStateSf(null);

  // ── Live write-back: the Beats stage owns the beat cards, so it pushes them
  //    into the shared project spine. The Pipeline Flow board's Script column
  //    re-renders the moment a beat is edited, added, reordered or removed. ──
  const [synced, setSynced] = useStateSf(false);
  React.useEffect(() => {
    if (window.CinaProject && window.CinaProject.syncBeats) {
      window.CinaProject.syncBeats(beats);
      setSynced(true);
      const t = setTimeout(() => setSynced(false), 1200);
      return () => clearTimeout(t);
    }
  }, [beats]);

  function patchBeat(id, patch) {
    setData(d => ({ ...d, beats: (d.beats || DEFAULT_BEATS).map(b => b.id === id ? { ...b, ...patch } : b) }));
  }
  function addBeat(actLetter) {
    const id = "b" + Math.floor(Math.random() * 9999);
    setData(d => ({ ...d, beats: [...(d.beats || DEFAULT_BEATS), { id, act: actLetter, title: "New beat", body: "", tag: "" }] }));
  }
  function removeBeat(id) {
    setData(d => ({ ...d, beats: (d.beats || DEFAULT_BEATS).filter(b => b.id !== id) }));
  }
  function moveBeat(id, beforeId) {
    setData(d => {
      const list = [...(d.beats || DEFAULT_BEATS)];
      const fromIdx = list.findIndex(b => b.id === id);
      if (fromIdx < 0) return d;
      const [item] = list.splice(fromIdx, 1);
      const toIdx = beforeId == null ? list.length : list.findIndex(b => b.id === beforeId);
      list.splice(toIdx < 0 ? list.length : toIdx, 0, item);
      return { ...d, beats: list };
    });
  }

  async function critique() {
    setBusy(true);
    try {
      const beatText = beats.map(b => `${b.act} • ${b.title} — ${b.body}`).join("\n");
      const audLine = audience ? `\n\nAudience data (real recorded fork choices): they choose the ${audience.word} option ${audience.domPct}% of the time; ${audience.contrarian}% vote against the room. Suggest ONE beat to fork with options tuned to that.` : "";
      const text = await window.claude.complete({
        messages: [{ role: "user", content: `You are Cina, a story editor. The beats:\n\n${beatText}${audLine}\n\nIn two short paragraphs, name the beat that's pulling its weight and the one that's missing. Working-room tone.` }]
      });
      setData(d => ({ ...d, cinaBeatsNote: text }));
    } catch (e) {
      setData(d => ({ ...d, cinaBeatsNote: "The 'shared silence' beat is doing the heaviest lift; trust it. Missing: a beat where Mira asks Voss for something specific, so the cost in Act III lands." }));
    }
    setBusy(false);
  }

  const acts = ["I", "II", "III"];

  // ── Audience lens — what YOUR viewers do at forks (real fork ledger) ──
  const audience = React.useMemo(() => {
    let rows = [];
    try { const l = JSON.parse(localStorage.getItem("cina:fork-ledger")); rows = Array.isArray(l) ? l : []; } catch (e) {}
    if (!rows.length) return null;
    const by = { A: 0, B: 0, C: 0 }; let minority = 0;
    rows.forEach(r => { if (by[r.letter] != null) by[r.letter]++; if (r.minority) minority++; });
    const total = by.A + by.B + by.C;
    const dom = Object.entries(by).sort((a, b) => b[1] - a[1])[0][0];
    const WORDS = { A: { w: "merciful", tip: "they spare, they wait, they forgive — make the humane option COST something or it's not a choice" }, B: { w: "ruthless", tip: "they burn the bridge every time — give path B a consequence that follows them into the next act" }, C: { w: "curious", tip: "they take the third door — hide one fork option so only they find it" } };
    return { total, dom, word: WORDS[dom].w, tip: WORDS[dom].tip, domPct: Math.round((by[dom] / total) * 100), contrarian: Math.round((minority / total) * 100) };
  }, []);

  return (
    <div style={{ padding: "32px 40px", color: "var(--c-ink)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <h2 className="t-display" style={{ fontSize: "var(--fs-head)", fontStyle: "italic", margin: 0, letterSpacing: "-0.01em" }}>
          Card the beats.
        </h2>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, border: `1px solid ${synced ? "rgba(var(--accent-rgb),.5)" : "var(--c-line)"}`, background: synced ? "rgba(var(--accent-rgb),.1)" : "transparent", transition: "all .2s" }} title="Beats flow live into the Pipeline board">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: synced ? "var(--c-amber)" : "var(--c-good)", boxShadow: synced ? "0 0 6px var(--c-amber)" : "none" }}/>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: synced ? "var(--c-amber)" : "var(--c-ink-3)" }}>{synced ? "SYNCED → BOARD" : "LIVE TO BOARD"}</span>
        </span>
      </div>
      <div style={{ marginTop: 8, color: "var(--c-ink-3)", fontSize: "var(--fs-body)" }}>
        Each card is one beat — a unit of story you could film. Drag to reorder. Aim for 8–14.
      </div>

      {/* Audience lens — fork suggestions from the real viewer ledger */}
      {audience && (
        <div style={{ marginTop: 16, padding: "13px 16px", border: "1px solid var(--c-line)", borderLeft: "3px solid var(--c-amber)", borderRadius: "var(--r-2)", background: "var(--c-panel)", maxWidth: 760 }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", fontWeight: 700 }}>⤑ AUDIENCE LENS · {audience.total} RECORDED CHOICES</div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", marginTop: 6, lineHeight: 1.55 }}>
            Your viewers choose <b style={{ color: "var(--c-ink)" }}>{audience.word}</b> {audience.domPct}% of the time{audience.contrarian > 0 ? <span> — and <b style={{ color: "var(--c-ink)" }}>{audience.contrarian}%</b> vote against the room</span> : null}. When you fork a beat: {audience.tip}.
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
        {acts.map(act => (
          <div key={act}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>
                ACT {act}
              </div>
              <button
                onClick={() => addBeat(act)}
                style={{
                  height: 24, padding: "0 10px", borderRadius: "var(--r-2)",
                  background: "transparent", border: "1px solid var(--c-line)",
                  color: "var(--c-ink-3)", fontSize: "var(--fs-label)", cursor: "pointer",
                }}
              >
                + Beat
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 200 }}
                 onDragOver={e => e.preventDefault()}
                 onDrop={() => { if (draggingId) { /* drop into act handled via card drops */ } }}
            >
              {beats.filter(b => b.act === act).map(b => (
                <div
                  key={b.id}
                  draggable
                  onDragStart={() => setDraggingId(b.id)}
                  onDragEnd={() => setDraggingId(null)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => { if (draggingId && draggingId !== b.id) moveBeat(draggingId, b.id); setDraggingId(null); }}
                  style={{
                    padding: "14px 16px",
                    background: "var(--c-panel)",
                    border: "1px solid var(--c-line)",
                    borderRadius: "var(--r-2)",
                    cursor: draggingId === b.id ? "grabbing" : "grab",
                    opacity: draggingId === b.id ? 0.5 : 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <input
                      value={b.title}
                      onChange={e => patchBeat(b.id, { title: e.target.value })}
                      style={{
                        flex: 1, background: "transparent", border: "none",
                        fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)",
                        color: "var(--c-ink)", padding: 0, outline: "none",
                      }}
                    />
                    <button
                      onClick={() => removeBeat(b.id)}
                      style={{ background: "transparent", border: "none", color: "var(--c-ink-4)", cursor: "pointer", fontSize: "var(--fs-label)" }}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                  <textarea
                    value={b.body}
                    onChange={e => patchBeat(b.id, { body: e.target.value })}
                    rows={2}
                    placeholder="What happens in this beat."
                    style={{
                      width: "100%", background: "transparent", border: "none",
                      color: "var(--c-ink-2)", fontSize: "var(--fs-body)", lineHeight: 1.5,
                      resize: "none", padding: 0, outline: "none",
                      fontFamily: "var(--f-sans)",
                    }}
                  />
                  {b.tag && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{
                        display: "inline-block", padding: "2px 8px",
                        background: "var(--c-bg)", border: "1px solid var(--c-line)",
                        borderRadius: 999, fontSize: "var(--fs-label)", letterSpacing: ".16em",
                        color: "var(--c-ink-4)", textTransform: "uppercase",
                        fontFamily: "var(--f-mono)",
                      }}>
                        {b.tag}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <CinaCard
        title="Cina's read on the beats"
        body={data.cinaBeatsNote}
        busy={busy}
        onCritique={critique}
        ctaLabel="Find the missing beat"
      />

      <StageFooter_scriptFlow
        onBack={onBack}
        canAdvance={true}
        onAdvance={onAdvance}
        nextLabel="Write scenes →"
      />
    </div>
  );
}

// ─── Stage 5: Revisions — Cina coaching pass ──────────────────────
const COACHING_DIMENSIONS = [
  {
    id: "dialogue",
    title: "Dialogue",
    sub: "Voice, distinction, naturalism",
    sample: [
      { line: "VOSS: I don't know why you're here.", note: "On-the-nose. Try sub-text — Voss's tell." , revised: "VOSS: There's tea. If you want it." },
      { line: "MIRA: I came back for you.", note: "Says the theme out loud. Subtract.", revised: "MIRA: The salt is where it always was." },
    ],
    score: 0.62,
  },
  {
    id: "structure",
    title: "Structure",
    sub: "Cause, escalation, payoff",
    sample: [
      { line: "Act II → III pivot is slack.", note: "Add a cost: Voss promises Mira the lamp; the storm makes her break it.", revised: "" },
    ],
    score: 0.71,
  },
  {
    id: "subtext",
    title: "Subtext",
    sub: "What's underneath the line",
    sample: [
      { line: "Sc 7: VOSS asks where Mira is from.", note: "Mira's answer is direct. Make her dodge with detail — show recognition without naming it.", revised: "MIRA: There's a cottage. You'd know it." },
    ],
    score: 0.55,
  },
  {
    id: "pace",
    title: "Pace",
    sub: "Page count, scene length",
    sample: [
      { line: "Sc 4: 4.2 pages of action, no dialogue.", note: "The silence is earning. Keep it. Cut nothing.", revised: "" },
    ],
    score: 0.84,
  },
];

function RevisionsStage({ data, setData, onBack }) {
  const [activeDim, setActiveDim] = useStateSf("dialogue");
  const [busy, setBusy] = useStateSf(false);
  const dim = COACHING_DIMENSIONS.find(d => d.id === activeDim);

  async function passOf(dimId) {
    setBusy(true);
    const dimMeta = COACHING_DIMENSIONS.find(d => d.id === dimId);
    try {
      const text = await window.claude.complete({
        messages: [{
          role: "user",
          content: `You are Cina, doing a ${dimMeta.title.toLowerCase()} pass on a screenplay. Logline: "${data.logline}". In two short paragraphs (working-room tone, terse, no preamble), give the writer: (1) the strongest pattern to keep, (2) the most surgical fix.`
        }]
      });
      setData(d => ({ ...d, [`coaching_${dimId}`]: text }));
    } catch (e) {
      setData(d => ({ ...d, [`coaching_${dimId}`]: `${dimMeta.title} pass: keep the restraint; cut every line that names the theme. Trust the audience to read silence.` }));
    }
    setBusy(false);
  }

  return (
    <div style={{ padding: "32px 40px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 28, color: "var(--c-ink)" }}>
      <div>
        <h2 className="t-display" style={{ fontSize: "var(--fs-head)", fontStyle: "italic", margin: 0, letterSpacing: "-0.01em" }}>
          Revisions pass.
        </h2>
        <div style={{ marginTop: 8, color: "var(--c-ink-3)", fontSize: "var(--fs-body)" }}>
          Cina reads the script along four axes. Pick a lens, get inline notes, apply or dismiss.
        </div>

        {/* Lens picker */}
        <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {COACHING_DIMENSIONS.map(d => {
            const active = d.id === activeDim;
            return (
              <button
                key={d.id}
                onClick={() => setActiveDim(d.id)}
                style={{
                  textAlign: "left", padding: "14px 16px",
                  background: active ? "var(--c-panel-2)" : "var(--c-panel)",
                  border: `1px solid ${active ? "var(--c-amber)" : "var(--c-line)"}`,
                  borderRadius: "var(--r-2)", cursor: "pointer", color: "inherit",
                }}
              >
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>
                  {d.title}
                </div>
                <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 2 }}>
                  {d.sub}
                </div>
                <div style={{
                  marginTop: 10, height: 3, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden",
                }}>
                  <div style={{ width: `${d.score * 100}%`, height: "100%", background: active ? "var(--c-amber)" : "var(--c-ink-3)" }}/>
                </div>
                <div style={{ marginTop: 4, fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", color: "var(--c-ink-4)" }}>
                  {Math.round(d.score * 100)}% • Cina rating
                </div>
              </button>
            );
          })}
        </div>

        {/* Inline notes for active dim */}
        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          {dim.sample.map((s, i) => (
            <div key={i} style={{
              padding: "16px 18px",
              background: "var(--c-panel)",
              border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
            }}>
              <div style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em",
                color: "var(--c-ink-3)", marginBottom: 6,
              }}>
                {s.line}
              </div>
              <div style={{
                fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55,
                fontStyle: "italic", fontFamily: "var(--f-display)",
                marginBottom: s.revised ? 10 : 0,
              }}>
                — {s.note}
              </div>
              {s.revised && (
                <div style={{
                  marginTop: 6, padding: "10px 12px",
                  background: "var(--c-bg)",
                  borderLeft: "2px solid var(--c-amber)",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
                }}>
                  <span style={{ color: "var(--c-ink-4)", marginRight: 8 }}>SUGGESTED</span>
                  {s.revised}
                </div>
              )}
              {s.revised && (
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <button onClick={() => window.toast && toast({ title: "APPLIED", text: "The note is in the script.", kind: "good" })} style={btnPrimary_scriptFlow()}>Apply</button>
                  <button style={btnGhost()} onClick={() => window.toast && toast({ title: "DISMISSED", text: "We won't raise that one again.", kind: "info" })}>Dismiss </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18 }}>
          <button
            onClick={() => passOf(activeDim)}
            disabled={busy}
            style={{
              height: 36, padding: "0 16px", borderRadius: "var(--r-2)",
              background: "transparent", border: "1px solid var(--c-amber)",
              color: "var(--c-amber)", cursor: "pointer", fontSize: "var(--fs-body)",
              fontWeight: 500, opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? "Cina is reading…" : `Run ${dim.title.toLowerCase()} pass`}
          </button>
        </div>

        {data[`coaching_${activeDim}`] && (
          <div style={{
            marginTop: 16, padding: "16px 18px",
            background: "var(--c-bg)", border: "1px solid var(--c-line)",
            borderRadius: "var(--r-2)",
          }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 8 }}>
              CINA · {dim.title.toUpperCase()} PASS
            </div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.6, fontStyle: "italic", fontFamily: "var(--f-display)", whiteSpace: "pre-wrap" }}>
              {data[`coaching_${activeDim}`]}
            </div>
          </div>
        )}

        <StageFooter_scriptFlow onBack={onBack} canAdvance={false} hideAdvance={true}/>
      </div>

      {/* RIGHT: revision summary */}
      <aside style={{
        background: "var(--c-panel)", border: "1px solid var(--c-line)",
        borderRadius: "var(--r-3)", padding: "20px 22px",
        height: "fit-content", position: "sticky", top: 20,
      }}>
        <div className="t-label" style={{ color: "var(--c-ink-4)", marginBottom: 12 }}>SCRIPT HEALTH</div>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-ink)", lineHeight: 1 }}>
          {Math.round(COACHING_DIMENSIONS.reduce((a, d) => a + d.score, 0) / COACHING_DIMENSIONS.length * 100)}
          <span style={{ fontSize: "var(--fs-lead)", color: "var(--c-ink-4)", marginLeft: 4 }}>/100</span>
        </div>
        <div style={{ marginTop: 4, fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>
          Up 6 since last revision pass
        </div>

        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          {COACHING_DIMENSIONS.map(d => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{d.title}</div>
                <div style={{ marginTop: 4, height: 2, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                  <div style={{ width: `${d.score * 100}%`, height: "100%", background: "var(--c-amber)" }}/>
                </div>
              </div>
              <div style={{ fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", color: "var(--c-ink-3)", width: 28, textAlign: "right" }}>
                {Math.round(d.score * 100)}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 22, paddingTop: 16, borderTop: "1px solid var(--c-line)",
        }}>
          <div className="t-label" style={{ color: "var(--c-ink-4)", marginBottom: 8 }}>NEXT STEPS</div>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.7 }}>
            <li>Apply 6 dialogue suggestions</li>
            <li>Address Act II midpoint cost</li>
            <li>Lock script for board prep</li>
          </ol>
        </div>
      </aside>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────
function inputStyle() {
  return {
    width: "100%", padding: "10px 14px",
    background: "var(--c-panel)", border: "1px solid var(--c-line)",
    borderRadius: "var(--r-2)", color: "var(--c-ink)",
    fontFamily: "var(--f-sans)", fontSize: "var(--fs-body)", lineHeight: 1.5,
    outline: "none", resize: "vertical",
  };
}
function btnPrimary_scriptFlow() {
  return {
    height: 30, padding: "0 14px", borderRadius: "var(--r-2)",
    background: "var(--c-amber)", color: tkc("panel-2"),
    border: "none", cursor: "pointer", fontSize: "var(--fs-body)", fontWeight: 600,
  };
}
function btnGhost() {
  return {
    height: 30, padding: "0 14px", borderRadius: "var(--r-2)",
    background: "transparent", color: "var(--c-ink-3)",
    border: "1px solid var(--c-line)", cursor: "pointer", fontSize: "var(--fs-body)",
  };
}

function CinaCard({ title, body, busy, onCritique, ctaLabel }) {
  return (
    <div style={{
      marginTop: 28, padding: "18px 20px",
      background: "var(--c-panel)",
      border: "1px solid var(--c-line)",
      borderRadius: "var(--r-2)", position: "relative",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-amber)" }}/>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>
          CINA
        </span>
        <div style={{ flex: 1 }}/>
        {!body && (
          <button
            onClick={onCritique}
            disabled={busy}
            style={{
              height: 28, padding: "0 14px", borderRadius: "var(--r-2)",
              background: "transparent", border: "1px solid var(--c-amber)",
              color: "var(--c-amber)", cursor: busy ? "default" : "pointer",
              fontSize: "var(--fs-body)", opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? "Reading…" : ctaLabel}
          </button>
        )}
      </div>
      <div style={{
        fontSize: "var(--fs-body)", color: body ? "var(--c-ink-2)" : "var(--c-ink-4)",
        fontStyle: "italic", fontFamily: "var(--f-display)",
        lineHeight: 1.55, whiteSpace: "pre-wrap",
        minHeight: 24,
      }}>
        {body || `${title} — click to read.`}
      </div>
    </div>
  );
}

function StageFooter_scriptFlow({ onBack, onAdvance, canAdvance, nextLabel, hideAdvance }) {
  return (
    <div style={{
      marginTop: 32, paddingTop: 18, borderTop: "1px solid var(--c-line)",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      {onBack && (
        <button onClick={onBack} style={{ ...btnGhost(), height: 38, padding: "0 16px", fontSize: "var(--fs-body)" }}>
          ← Back
        </button>
      )}
      <div style={{ flex: 1 }}/>
      {!hideAdvance && (
        <button
          onClick={onAdvance}
          disabled={!canAdvance}
          style={{
            ...btnPrimary_scriptFlow(), height: 40, padding: "0 22px", fontSize: "var(--fs-body)",
            opacity: canAdvance ? 1 : 0.5, cursor: canAdvance ? "pointer" : "default",
          }}
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}

// ─── Wrapper that owns the workflow state ─────────────────────────
function ScriptFlow() {
  const [active, setActive] = useStateSf(() => {
    try { return localStorage.getItem("cina:scriptStage") || "idea"; } catch (e) { return "idea"; }
  });
  const [data, setData] = useStateSf(() => {
    try {
      const raw = localStorage.getItem("cina:scriptData");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      logline: SAMPLE_IDEA.logline,
      premise: SAMPLE_IDEA.premise,
      pillars: [...SAMPLE_IDEA.pillars],
      audience: SAMPLE_IDEA.audience,
      comp: SAMPLE_IDEA.comp,
      outline: DEFAULT_OUTLINE,
      beats: DEFAULT_BEATS,
    };
  });

  useEffectSf(() => {
    try { localStorage.setItem("cina:scriptStage", active); } catch (e) {}
  }, [active]);
  useEffectSf(() => {
    try { localStorage.setItem("cina:scriptData", JSON.stringify(data)); } catch (e) {}
  }, [data]);

  const completion = useMemoSf(() => ({
    idea: data.logline ? 1 : 0,
    outline: data.outline ? 1 : 0,
    beats: (data.beats || DEFAULT_BEATS).length >= 6 ? 1 : 0.5,
    scenes: 0.5,
    revisions: 0,
  }), [data]);

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "var(--c-bg)" }}>
      <StageRail active={active} setActive={setActive} completion={completion}/>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        {active === "idea" && (
          <IdeaStage data={data} setData={setData} onAdvance={() => setActive("outline")}/>
        )}
        {active === "outline" && (
          <OutlineStage data={data} setData={setData}
            onBack={() => setActive("idea")}
            onAdvance={() => setActive("beats")}/>
        )}
        {active === "beats" && (
          <BeatsStage data={data} setData={setData}
            onBack={() => setActive("outline")}
            onAdvance={() => setActive("scenes")}/>
        )}
        {active === "scenes" && (
          <ScenesStageWrapper onBack={() => setActive("beats")} onAdvance={() => setActive("revisions")}/>
        )}
        {active === "revisions" && (
          <RevisionsStage data={data} setData={setData} onBack={() => setActive("scenes")}/>
        )}
      </div>
    </div>
  );
}

function ScenesStageWrapper({ onBack, onAdvance }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{
        padding: "12px 32px", display: "flex", alignItems: "center", gap: 12,
        background: "var(--c-panel)", borderBottom: "1px solid var(--c-line)",
      }}>
        <div style={{ flex: 1, fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>
          The screenplay editor — write each scene in industry format. Cina's notes appear inline as you write.
        </div>
        <button onClick={onBack} style={{ ...btnGhost(), height: 30, fontSize: "var(--fs-body)" }}>← Beats</button>
        <button onClick={onAdvance} style={{ ...btnPrimary_scriptFlow(), height: 30, fontSize: "var(--fs-body)" }}>Revisions pass →</button>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <ScriptPanel/>
      </div>
    </div>
  );
}

window.ScriptFlow = ScriptFlow;
