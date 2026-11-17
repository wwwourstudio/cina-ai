// bible.jsx — Film Bible (DNA): now interactive end-to-end.
// Tabs actually switch, edit-in-place, sliders for DNA weights, palette
// editor with re-tinting, rule add/remove/reorder, and a "Save & propagate"
// CTA that pushes changes back to the FILM_BIBLE store.

const { useState: usBb, useEffect: ueBb, useMemo: umBb, useRef: urBb } = React;

function BiblePanel() {
  const base = (window.CinaPipeline && typeof window.CinaPipeline.hydrateDna === "function")
    ? window.CinaPipeline.hydrateDna()
    : window.FILM_BIBLE;
  const [bible, setBible] = usBb(() => ({ ...base, director_dna: [...base.director_dna], rules: [...base.rules], palette: base.palette.map(p => ({ ...p })) }));
  const [tab, setTab] = usBb("tone");
  const [dirty, setDirty] = usBb(false);
  const [showSaved, setShowSaved] = usBb(false);
  const bibleRef = urBb(bible);
  bibleRef.current = bible;

  ueBb(() => {
    const onSub = (e) => {
      if (e.detail?.view === "bible" && e.detail.sub) setTab(e.detail.sub);
    };
    const onDna = (e) => {
      const next = e.detail;
      if (!next || next === bibleRef.current) return;
      setBible(prev => ({
        ...prev,
        ...next,
        director_dna: Array.isArray(next.director_dna) ? [...next.director_dna] : prev.director_dna,
        rules: Array.isArray(next.rules) ? [...next.rules] : prev.rules,
        palette: Array.isArray(next.palette) ? next.palette.map(p => ({ ...p })) : prev.palette,
      }));
    };
    window.addEventListener("cina:studioSubTab", onSub);
    window.addEventListener("cina:dna-updated", onDna);
    return () => {
      window.removeEventListener("cina:studioSubTab", onSub);
      window.removeEventListener("cina:dna-updated", onDna);
    };
  }, []);

  const patch = (next) => { setBible(next); bibleRef.current = next; setDirty(true); };

  const save = (andNext = false) => {
    const cur = bibleRef.current;
    if (window.CinaPipeline && typeof window.CinaPipeline.propagateDna === "function") {
      window.CinaPipeline.propagateDna(cur);
    } else {
      window.FILM_BIBLE = { ...window.FILM_BIBLE, ...cur };
    }
    setDirty(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2200);
    if (window.toast) window.toast({ title: andNext ? "01 DNA → 02 SCRIPT" : "DNA UPDATED", text: andNext ? "Synced to Script & Crew — advancing to 02 Script." : "Propagated to crew agents · Pipeline synced", kind: "good" });
    if (andNext) {
      if (window.CinaPipeline) window.CinaPipeline.go("script");
      else window.dispatchEvent(new CustomEvent("cina:setView", { detail: "script" }));
    }
  };
  const saveRef = urBb(save);
  saveRef.current = save;

  ueBb(() => {
    if (!window.CinaPipeline?.registerSendNext) return;
    return window.CinaPipeline.registerSendNext("bible", () => {
      saveRef.current(true);
      return true;
    });
  }, []);

  const reset = () => {
    const fresh = (window.CinaPipeline && typeof window.CinaPipeline.hydrateDna === "function")
      ? window.CinaPipeline.hydrateDna()
      : window.FILM_BIBLE;
    setBible({ ...fresh, director_dna: [...fresh.director_dna], rules: [...fresh.rules], palette: fresh.palette.map(p => ({ ...p })) });
    setDirty(false);
  };

  const TABS = [
    { id: "tone",      label: "Tone & rules" },
    { id: "director",  label: "Director DNA" },
    { id: "palette",   label: "Palette" },
    { id: "characters",label: "Characters" },
    { id: "scout",     label: "Locations & Scout" },
  ];

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
      {/* Hero */}
      <div style={{
        position: "relative", padding: "32px 40px 28px",
        borderBottom: "1px solid var(--c-line)",
        background: `linear-gradient(180deg, ${tkc("void")} 0%, var(--c-bg) 100%)`,
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 18, background: "repeating-linear-gradient(180deg, transparent 0 14px, var(--c-panel-2) 14px 22px)", opacity: 0.4 }}/>
        <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 18, background: "repeating-linear-gradient(180deg, transparent 0 14px, var(--c-panel-2) 14px 22px)", opacity: 0.4 }}/>

        <div style={{ paddingLeft: 30, paddingRight: 30, maxWidth: 960, display: "flex", gap: 24, alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div className="t-label" style={{ marginBottom: 10 }}>Project DNA · LL-01 · v0.7{dirty ? " · UNSAVED" : ""}</div>
            <EditableHeadline value={bible.title} onChange={v => patch({ ...bible, title: v })}/>
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              {bible.genre.map((g, i) => (
                <EditableChip key={i} value={g}
                  onChange={(v) => { const next = [...bible.genre]; if (v === "") next.splice(i, 1); else next[i] = v; patch({ ...bible, genre: next }); }}/>
              ))}
              <button onClick={() => patch({ ...bible, genre: [...bible.genre, "NEW TAG"] })} style={{
                padding: "3px 9px", border: "0.5px dashed var(--c-line-3)", borderRadius: 999,
                fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", color: "var(--c-ink-3)",
                textTransform: "uppercase", letterSpacing: ".08em",
                background: "transparent", cursor: "pointer",
              }}>+ Add</button>
            </div>
            <EditableLogline value={bible.logline} onChange={v => patch({ ...bible, logline: v })}/>
          </div>

          {/* Save bar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
            {showSaved && (
              <div style={{
                padding: "4px 10px",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                color: "var(--c-good)", border: "1px solid rgba(106,163,122,.4)",
                background: "rgba(106,163,122,.08)", borderRadius: 0,
              }}>✓ SAVED · PROPAGATED</div>
            )}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {dirty && (
                <button onClick={reset} style={{
                  padding: "8px 14px", background: "transparent",
                  border: "1px solid var(--c-line-2)", borderRadius: 0,
                  color: "var(--c-ink-3)", cursor: "pointer",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
                  textTransform: "uppercase",
                }}>Discard</button>
              )}
              <button onClick={() => save(false)} disabled={!dirty} style={{
                padding: "8px 16px",
                background: dirty ? "var(--c-amber)" : "var(--c-panel-2)",
                color: dirty ? tkc("on-amber") : "var(--c-ink-4)",
                border: "none", borderRadius: 0,
                cursor: dirty ? "pointer" : "not-allowed",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
                textTransform: "uppercase",
              }}>{dirty ? "▲ Save & propagate" : "✓ Synced"}</button>
              <button onClick={() => save(true)} style={{
                padding: "8px 16px",
                background: "transparent",
                color: "var(--c-amber)",
                border: "1px solid var(--c-amber)", borderRadius: 0,
                cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".14em", fontWeight: 700,
                textTransform: "uppercase",
              }}>Send Next · 02 Script →</button>
            </div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", textTransform: "uppercase" }}>
              Auto-syncs to all 5 agents &amp; downstream steps
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 0, padding: "0 24px",
        borderBottom: "1px solid var(--c-line)", background: "var(--c-panel)",
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none",
            padding: "12px 16px", fontSize: "var(--fs-body)", fontWeight: 500,
            color: tab === t.id ? "var(--c-amber)" : "var(--c-ink-3)",
            borderRadius: 0,
            borderBottom: tab === t.id ? "1.5px solid var(--c-amber)" : "1.5px solid transparent",
            marginBottom: -1, cursor: "pointer",
            fontFamily: "var(--f-mono)", textTransform: "uppercase", letterSpacing: ".08em",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Body */}
      <div style={{ padding: "28px 40px 60px", maxWidth: "var(--w-page)" }}>
        {tab === "tone"       && <ToneRulesTab bible={bible} patch={patch}/>}
        {tab === "director"   && <DirectorDnaTab bible={bible} patch={patch}/>}
        {tab === "palette"    && <PaletteTab bible={bible} patch={patch}/>}
        {tab === "characters" && <CharactersTab/>}
        {tab === "scout"      && window.CinaStudioAI?.StudioLocationScoutTab && <window.CinaStudioAI.StudioLocationScoutTab/>}
      </div>
    </div>
  );
}

// ─── Editable primitives ─────────────────────────────────────────────────
function EditableHeadline({ value, onChange }) {
  const [v, setV] = usBb(value);
  ueBb(() => setV(value), [value]);
  return (
    <input value={v} onChange={e => setV(e.target.value)} onBlur={() => onChange(v)}
      onKeyDown={e => { if (e.key === "Enter") e.target.blur(); }}
      style={{
        width: "100%", padding: 0, background: "transparent", border: "none",
        outline: "none", color: "var(--c-ink)",
        fontFamily: "var(--f-display)", fontSize: "var(--fs-display)", fontWeight: 400,
        letterSpacing: "-0.02em", lineHeight: 1,
        textTransform: "uppercase",
      }}/>
  );
}
function EditableLogline({ value, onChange }) {
  const [v, setV] = usBb(value);
  ueBb(() => setV(value), [value]);
  return (
    <textarea value={v} onChange={e => setV(e.target.value)} onBlur={() => onChange(v)}
      rows={2}
      style={{
        width: "100%", marginTop: 22, padding: 0, resize: "none",
        background: "transparent", border: "none", outline: "none",
        color: "var(--c-ink-2)",
        fontFamily: "var(--f-display)", fontStyle: "italic",
        fontSize: "var(--fs-lead)", lineHeight: 1.5, maxWidth: 640,
      }}/>
  );
}
function EditableChip({ value, onChange }) {
  const [v, setV] = usBb(value);
  ueBb(() => setV(value), [value]);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 4px 3px 9px", border: "0.5px solid var(--c-line-3)",
      borderRadius: 999, fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)",
      color: "var(--c-ink-2)", textTransform: "uppercase", letterSpacing: ".08em",
    }}>
      <input value={v} onChange={e => setV(e.target.value)} onBlur={() => onChange(v)}
        onKeyDown={e => { if (e.key === "Enter") e.target.blur(); }}
        style={{
          background: "transparent", border: "none", outline: "none",
          color: "inherit", fontFamily: "inherit", fontSize: "inherit", letterSpacing: "inherit",
          textTransform: "inherit", width: Math.max(48, v.length * 8),
        }}/>
      <button onClick={() => onChange("")} style={{
        width: 16, height: 16, background: "transparent",
        border: "none", color: "var(--c-ink-4)", cursor: "pointer",
        fontSize: "var(--fs-label)", padding: 0, lineHeight: 1,
      }}>×</button>
    </span>
  );
}

// ─── Tone & rules ────────────────────────────────────────────────────────
function ToneRulesTab({ bible, patch }) {
  const setRule = (i, v) => { const next = [...bible.rules]; next[i] = v; patch({ ...bible, rules: next }); };
  const removeRule = (i) => { const next = [...bible.rules]; next.splice(i, 1); patch({ ...bible, rules: next }); };
  const moveRule = (i, dir) => {
    const j = i + dir; if (j < 0 || j >= bible.rules.length) return;
    const next = [...bible.rules]; [next[i], next[j]] = [next[j], next[i]]; patch({ ...bible, rules: next });
  };
  const addRule = () => patch({ ...bible, rules: [...bible.rules, "New rule. Click to edit."] });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
      <section>
        <div className="t-label" style={{ marginBottom: 12 }}>Tone</div>
        <textarea value={bible.tone} onChange={e => patch({ ...bible, tone: e.target.value })}
          rows={6} style={{
            width: "100%", padding: 12, resize: "vertical",
            background: "var(--c-panel)", border: "1px solid var(--c-line)",
            borderLeft: "1.5px solid var(--c-amber)", borderRadius: "var(--r-2)",
            color: "var(--c-ink)",
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-lead)", lineHeight: 1.55, outline: "none",
          }}/>
      </section>

      <section>
        <div className="t-label" style={{ marginBottom: 12 }}>Genre tags</div>
        <div style={{
          padding: 14, background: "var(--c-panel)", border: "1px solid var(--c-line)",
          borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55,
        }}>
          Edit tags inline in the header above. Tags scope the genre allow-lists for cast licensing and the writer agent's reference corpus.
        </div>
      </section>

      <section style={{ gridColumn: "1 / -1" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <span className="t-label">Rules of the world · {bible.rules.length}</span>
          <button onClick={addRule} style={{
            padding: "5px 11px", background: "transparent", border: "1px dashed var(--c-line-3)",
            borderRadius: "var(--r-1)", color: "var(--c-ink-2)", cursor: "pointer",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
            textTransform: "uppercase",
          }}>+ Add rule</button>
        </div>
        <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {bible.rules.map((r, i) => (
            <li key={i} style={{
              display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10,
              padding: "10px 14px",
              background: "var(--c-panel)", border: "1px solid var(--c-line)",
              borderLeft: "1.5px solid var(--c-amber)", borderRadius: "var(--r-2)",
              alignItems: "center",
            }}>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", flexShrink: 0 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <input value={r} onChange={e => setRule(i, e.target.value)} style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "var(--c-ink)", fontSize: "var(--fs-body)", lineHeight: 1.5,
                fontFamily: "var(--f-sans)",
              }}/>
              <div style={{ display: "flex", gap: 2, opacity: 0.5 }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
                <RuleBtn onClick={() => moveRule(i, -1)} title="Up">↑</RuleBtn>
                <RuleBtn onClick={() => moveRule(i, 1)} title="Down">↓</RuleBtn>
                <RuleBtn onClick={() => removeRule(i)} title="Delete" danger>×</RuleBtn>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function RuleBtn({ onClick, children, title, danger }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 22, height: 22, background: "transparent",
      border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)",
      color: danger ? "var(--c-blood-l)" : "var(--c-ink-3)",
      cursor: "pointer", fontSize: "var(--fs-body)", padding: 0, lineHeight: 1,
    }}>{children}</button>
  );
}

// ─── Director DNA ────────────────────────────────────────────────────────
function DirectorDnaTab({ bible, patch }) {
  // Normalize weights so they sum to 1 after editing
  const setWeight = (i, w) => {
    const next = bible.director_dna.map((d, j) => j === i ? { ...d, weight: w } : d);
    const sum = next.reduce((s, d) => s + d.weight, 0) || 1;
    const normalized = next.map(d => ({ ...d, weight: d.weight / sum }));
    patch({ ...bible, director_dna: normalized });
  };
  const setNote = (i, v) => {
    const next = bible.director_dna.map((d, j) => j === i ? { ...d, note: v } : d);
    patch({ ...bible, director_dna: next });
  };
  const setName = (i, v) => {
    const next = bible.director_dna.map((d, j) => j === i ? { ...d, name: v } : d);
    patch({ ...bible, director_dna: next });
  };
  const removeDna = (i) => {
    if (bible.director_dna.length <= 1) return;
    const next = [...bible.director_dna]; next.splice(i, 1);
    const sum = next.reduce((s, d) => s + d.weight, 0) || 1;
    patch({ ...bible, director_dna: next.map(d => ({ ...d, weight: d.weight / sum })) });
  };
  const addDna = () => {
    const next = [...bible.director_dna, { name: "New", weight: 0.1, note: "Describe the borrowed move." }];
    const sum = next.reduce((s, d) => s + d.weight, 0);
    patch({ ...bible, director_dna: next.map(d => ({ ...d, weight: d.weight / sum })) });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
        <div>
          <div className="t-label" style={{ marginBottom: 6 }}>Director DNA · {bible.director_dna.length} influences</div>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", fontWeight: 500, letterSpacing: "-0.01em" }}>
            What your film borrows from, and how much.
          </div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 8, lineHeight: 1.5, maxWidth: 580 }}>
            Each influence routes 5% of the film's revenue back to the cited director (or estate) via the Royalty Pool. Weights auto-normalize.
          </div>
        </div>
        <button onClick={addDna} style={{
          padding: "7px 14px", background: "transparent", border: "1px dashed var(--c-line-3)",
          borderRadius: "var(--r-1)", color: "var(--c-ink-2)", cursor: "pointer",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
          textTransform: "uppercase",
        }}>+ Add influence</button>
      </div>

      {/* Visual weight bar */}
      <div style={{ display: "flex", height: 32, borderRadius: "var(--r-1)", overflow: "hidden", marginBottom: 18, border: "1px solid var(--c-line)" }}>
        {bible.director_dna.map((d, i) => (
          <div key={i} style={{
            flex: d.weight,
            background: ["var(--c-amber)", tkc("bad"), tkc("cat-1"), tkc("cat-2"), tkc("cat-4"), tkc("good")][i % 6],
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--c-on-amber)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
            fontWeight: 700, letterSpacing: ".08em",
            position: "relative",
          }}>
            {d.weight > 0.06 ? `${(d.weight * 100).toFixed(0)}%` : ""}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {bible.director_dna.map((d, i) => {
          const color = ["var(--c-amber)", tkc("bad"), tkc("cat-1"), tkc("cat-2"), tkc("cat-4"), tkc("good")][i % 6];
          return (
            <div key={i} style={{
              padding: 16, background: "var(--c-panel)", border: "1px solid var(--c-line)",
              borderLeft: `2px solid ${color}`, borderRadius: "var(--r-2)",
              display: "grid", gridTemplateColumns: "180px 80px 1fr auto", gap: 16, alignItems: "center",
            }}>
              <input value={d.name} onChange={e => setName(i, e.target.value)} style={{
                background: "transparent", border: "none", outline: "none",
                color: "var(--c-ink)",
                fontFamily: "var(--f-display)", fontStyle: "italic",
                fontSize: "var(--fs-lead)", fontWeight: 500, letterSpacing: "-0.01em",
              }}/>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <input type="range" min="0" max="100" value={Math.round(d.weight * 100)}
                  onChange={e => setWeight(i, +e.target.value / 100)}
                  style={{ width: "100%", accentColor: color }}/>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color, textAlign: "center", fontWeight: 600 }}>
                  {(d.weight * 100).toFixed(0)}%
                </div>
              </div>
              <input value={d.note} onChange={e => setNote(i, e.target.value)} style={{
                background: "transparent", border: "none", outline: "none",
                color: "var(--c-ink-2)", fontSize: "var(--fs-body)", lineHeight: 1.5,
                fontFamily: "var(--f-sans)",
              }}/>
              <button onClick={() => removeDna(i)} disabled={bible.director_dna.length <= 1} style={{
                width: 24, height: 24, background: "transparent",
                border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)",
                color: "var(--c-blood-l)", cursor: bible.director_dna.length <= 1 ? "not-allowed" : "pointer",
                opacity: bible.director_dna.length <= 1 ? 0.4 : 1,
                fontSize: "var(--fs-body)", padding: 0, lineHeight: 1,
              }}>×</button>
            </div>
          );
        })}
      </div>

      {/* Royalty preview */}
      <div style={{
        marginTop: 22, padding: "16px 18px",
        background: "linear-gradient(135deg, rgba(var(--accent-rgb),.06) 0%, var(--c-panel) 70%)",
        border: "1px solid rgba(var(--accent-rgb),.35)", borderLeft: "2px solid var(--c-amber)",
        borderRadius: "var(--r-2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
      }}>
        <div>
          <div className="t-label" style={{ color: "var(--c-amber)", marginBottom: 4 }}>ROYALTY ROUTE PREVIEW</div>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>
            $1,000 in film revenue routes <em style={{ color: "var(--c-amber)" }}>$50</em> to the Royalty Pool, split: {bible.director_dna.map(d => `${d.name} ${(d.weight * 5).toFixed(2)}$`).join(" · ")}
          </div>
        </div>
        <a href="index.html#/royalty" style={{
          padding: "8px 14px", background: "transparent",
          border: "1px solid var(--c-amber)", borderRadius: "var(--r-1)",
          color: "var(--c-amber)", textDecoration: "none",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
          textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0,
        }}>View pool →</a>
      </div>
    </div>
  );
}

// ─── Palette ─────────────────────────────────────────────────────────────
function PaletteTab({ bible, patch }) {
  const setColor = (i, hex) => {
    const next = bible.palette.map((p, j) => j === i ? { ...p, hex } : p);
    patch({ ...bible, palette: next });
  };
  const setName = (i, v) => {
    const next = bible.palette.map((p, j) => j === i ? { ...p, name: v } : p);
    patch({ ...bible, palette: next });
  };
  const setUsage = (i, v) => {
    const next = bible.palette.map((p, j) => j === i ? { ...p, usage: v } : p);
    patch({ ...bible, palette: next });
  };
  const removeColor = (i) => {
    if (bible.palette.length <= 1) return;
    const next = [...bible.palette]; next.splice(i, 1);
    patch({ ...bible, palette: next });
  };
  const addColor = () => {
    const next = [...bible.palette, { name: "New", hex: tkc("ink-3"), usage: "Describe usage." }];
    patch({ ...bible, palette: next });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
        <div>
          <div className="t-label" style={{ marginBottom: 6 }}>Palette · {bible.palette.length} colors</div>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", fontWeight: 500, letterSpacing: "-0.01em" }}>
            The colors your film allows itself to use.
          </div>
        </div>
        <button onClick={addColor} style={{
          padding: "7px 14px", background: "transparent", border: "1px dashed var(--c-line-3)",
          borderRadius: "var(--r-1)", color: "var(--c-ink-2)", cursor: "pointer",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
          textTransform: "uppercase",
        }}>+ Add color</button>
      </div>

      {/* Combined palette strip */}
      <div style={{ display: "flex", height: 80, borderRadius: "var(--r-1)", overflow: "hidden", marginBottom: 18, border: "1px solid var(--c-line)" }}>
        {bible.palette.map((p, i) => (
          <div key={i} style={{ flex: 1, background: p.hex }} title={`${p.name} · ${p.hex}`}/>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {bible.palette.map((p, i) => (
          <div key={i} style={{
            background: "var(--c-panel)", border: "1px solid var(--c-line)",
            borderRadius: "var(--r-2)", overflow: "hidden", position: "relative",
          }}>
            <label style={{ display: "block", position: "relative", height: 90, background: p.hex, cursor: "pointer" }}>
              <input type="color" value={p.hex} onChange={e => setColor(i, e.target.value)}
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}/>
              <span style={{
                position: "absolute", bottom: 6, left: 8,
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                letterSpacing: ".16em", color: "rgba(255,255,255,.8)",
                textShadow: "0 1px 2px rgba(0,0,0,.8)",
              }}>CLICK</span>
            </label>
            <div style={{ padding: "8px 10px 10px" }}>
              <input value={p.name} onChange={e => setName(i, e.target.value)} style={{
                width: "100%", background: "transparent", border: "none", outline: "none",
                color: "var(--c-ink)",
                fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", fontWeight: 500,
                marginBottom: 4,
              }}/>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginBottom: 6 }}>{p.hex.toUpperCase()}</div>
              <input value={p.usage} onChange={e => setUsage(i, e.target.value)} style={{
                width: "100%", background: "transparent", border: "1px solid var(--c-line)", outline: "none",
                color: "var(--c-ink-2)", fontSize: "var(--fs-label)", padding: "4px 6px", borderRadius: "var(--r-1)",
                fontFamily: "var(--f-sans)",
              }}/>
              <button onClick={() => removeColor(i)} disabled={bible.palette.length <= 1} style={{
                marginTop: 6, padding: "3px 8px",
                background: "transparent", color: "var(--c-blood-l)",
                border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)",
                cursor: bible.palette.length <= 1 ? "not-allowed" : "pointer",
                opacity: bible.palette.length <= 1 ? 0.4 : 1,
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
                textTransform: "uppercase",
              }}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Characters ──────────────────────────────────────────────────────────
function CharactersTab() {
  const characters = (window.CHARACTERS || []).slice(0, 6);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
        <div>
          <div className="t-label" style={{ marginBottom: 6 }}>Cast · {characters.length} characters</div>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", fontWeight: 500, letterSpacing: "-0.01em" }}>
            Who is in this story.
          </div>
        </div>
        <button onClick={() => { if (window.dispatchEvent) window.dispatchEvent(new CustomEvent("cina:setView", { detail: "vault" })); }} style={{
          padding: "7px 14px", background: "var(--c-amber)", color: "var(--c-on-amber)",
          border: "none", borderRadius: "var(--r-1)", cursor: "pointer",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
          textTransform: "uppercase",
        }}>Open Vault →</button>
      </div>

      {characters.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", border: "1px dashed var(--c-line)", borderRadius: "var(--r-2)", color: "var(--c-ink-3)" }}>
          No characters cast yet. Open the Vault to add some.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {characters.map(c => (
            <div key={c.id || c.name} style={{
              padding: 16, background: "var(--c-panel)", border: "1px solid var(--c-line)",
              borderRadius: "var(--r-2)", display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <div style={{
                width: 56, height: 70, borderRadius: "var(--r-1)", overflow: "hidden",
                background: c.color || "var(--c-panel-2)", flexShrink: 0,
                border: "1px solid var(--c-line)",
              }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500, lineHeight: 1.1 }}>{c.name}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginTop: 4, textTransform: "uppercase" }}>{c.role || c.archetype || "Lead"}</div>
                {c.bio && <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.45, marginTop: 6 }}>{c.bio.slice(0, 80)}{c.bio.length > 80 ? "…" : ""}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { BiblePanel });
