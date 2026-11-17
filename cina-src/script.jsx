// script.jsx — Editable screenplay editor.
// • Click any line to edit. Tab/Enter to advance. Toolbar buttons set element type.
// • New Scene lightbox creates and inserts.
// • Cina sidebar: apply suggestions, ask Cina, link beat.

const { useState: useStateSc, useRef: useRefSc, useEffect: useEffectSc, useMemo: useMemoSc } = React;

const ELEMENT_TYPES = [
  { id: "action",     label: "Action",     hint: "A — describes what's seen on screen" },
  { id: "character",  label: "Character",  hint: "C — who's about to speak" },
  { id: "paren",      label: "Paren.",     hint: "P — direction for the line" },
  { id: "dialogue",   label: "Dialogue",   hint: "D — what they say" },
  { id: "transition", label: "Transition", hint: "T — CUT TO:, FADE OUT, etc" },
];

// Default cycle on Enter for screenplay flow
const NEXT_KIND = { action: "action", character: "dialogue", paren: "dialogue", dialogue: "action", transition: "action" };

function ScriptPanel() {
  const [scenes, setScenes] = useStateSc(() =>
    window.CinaPipeline?.loadScenes ? window.CinaPipeline.loadScenes() : JSON.parse(JSON.stringify(window.SCRIPT_SCENES || []))
  );
  const [activeId, setActiveId] = useStateSc(() => {
    const loaded = window.CinaPipeline?.loadScenes ? window.CinaPipeline.loadScenes() : (window.SCRIPT_SCENES || []);
    return loaded[0]?.id || "sc14";
  });
  const [dnaTitle, setDnaTitle] = useStateSc(() => window.FILM_BIBLE?.title || "LAST LIGHT");
  const [showNotes, setShowNotes] = useStateSc(true);
  const [newSceneOpen, setNewSceneOpen] = useStateSc(false);
  const [askOpen, setAskOpen] = useStateSc(false);
  const [askText, setAskText] = useStateSc("");
  const [askingState, setAskingState] = useStateSc("idle"); // idle | thinking | done
  const [cinaReply, setCinaReply] = useStateSc(null);
  const [focusedIdx, setFocusedIdx] = useStateSc(null);

  const scene = scenes.find(s => s.id === activeId) || scenes[0];
  const sceneIdx = scenes.findIndex(s => s.id === activeId);
  const totalPages = scenes.reduce((a, s) => a + s.pages, 0);

  const latestRef = useRefSc({ scenes, scene });
  latestRef.current = { scenes, scene };

  useEffectSc(() => {
    window.CinaPipeline?.saveScenes?.(scenes);
  }, [scenes]);

  useEffectSc(() => {
    const onDna = (e) => {
      if (e.detail?.title) setDnaTitle(e.detail.title);
    };
    window.addEventListener("cina:dna-updated", onDna);
    return () => window.removeEventListener("cina:dna-updated", onDna);
  }, []);

  const sendToNextCast = () => {
    const { scenes: curScenes, scene: curScene } = latestRef.current;
    const summary = window.CinaPipeline?.saveScenes?.(curScenes);
    if (curScene && window.CinaPipeline?.boardScene) {
      window.CinaPipeline.boardScene({ scene: curScene, openBoard: false });
    }
    const castCount = summary?.castNames?.length || 0;
    window.toast?.({
      title: "02 SCRIPT → 03 CAST",
      text: `${curScenes.length} scenes saved${castCount ? ` · ${castCount} speaking roles synced` : ""} & active scene staged on 04 Stills.`,
      kind: "good",
    });
    if (window.CinaPipeline) window.CinaPipeline.go("vault");
    else window.dispatchEvent(new CustomEvent("cina:setView", { detail: "vault" }));
  };
  const sendNextRef = useRefSc(sendToNextCast);
  sendNextRef.current = sendToNextCast;

  useEffectSc(() => {
    if (!window.CinaPipeline?.registerSendNext) return;
    return window.CinaPipeline.registerSendNext(["script", "episodes"], () => {
      sendNextRef.current();
      return true;
    });
  }, []);

  function updateScene(updater) {
    setScenes(s => s.map(sc => sc.id === activeId ? updater(sc) : sc));
  }
  function patchEl(i, patch) {
    updateScene(sc => ({ ...sc, elements: sc.elements.map((e, j) => j === i ? { ...e, ...patch } : e) }));
  }
  function insertEl(afterIdx, kind = "action", text = "") {
    updateScene(sc => {
      const next = [...sc.elements];
      next.splice(afterIdx + 1, 0, { kind, text });
      return { ...sc, elements: next };
    });
    setTimeout(() => setFocusedIdx(afterIdx + 1), 30);
  }
  function deleteEl(i) {
    updateScene(sc => ({ ...sc, elements: sc.elements.filter((_, j) => j !== i) }));
    setFocusedIdx(Math.max(0, i - 1));
  }
  function changeKind(i, kind) { patchEl(i, { kind }); }

  // Toolbar action: set focused element's kind, or insert new of that kind at end
  function applyKind(kind) {
    if (focusedIdx == null) {
      insertEl(scene.elements.length - 1, kind, "");
    } else {
      changeKind(focusedIdx, kind);
    }
  }

  function onCreateScene(meta) {
    const newId = "sc" + Math.floor(Math.random() * 9000 + 1000);
    const newNumber = (Math.max(...scenes.map(s => parseInt(s.number) || 0)) + 1);
    const slug = `${meta.intExt}. ${meta.location.toUpperCase()} — ${meta.timeOfDay.toUpperCase()}`;
    const newScene = {
      id: newId,
      number: String(newNumber),
      slug,
      location: meta.location,
      timeOfDay: meta.timeOfDay,
      status: "draft",
      pages: 0.4,
      elements: [
        { kind: "action", text: meta.opening || "Describe what we see first." },
      ],
    };
    setScenes(s => [...s, newScene]);
    setActiveId(newId);
    setNewSceneOpen(false);
    if (window.toast) window.toast({ title: "SCENE ADDED", text: `${slug} — ready to write.`, kind: "good" });
  }

  // Cina ask handler — uses real Gemini server proxy (/api/ai/chat) with graceful fallback & synced Film DNA
  async function askCina(prompt) {
    setAskingState("thinking");
    const sceneText = scene.elements.map(e => `[${e.kind.toUpperCase()}] ${e.text}`).join("\n");
    const bible = window.FILM_BIBLE || {};
    const dnaRules = Array.isArray(bible.rules) && bible.rules.length ? `World rules: ${bible.rules.slice(0, 4).join(" | ")}.` : "";
    const sys = `You are Cina, a script doctor for "${bible.title || window.PROJECTS?.[0]?.title || "the film"}". Tone: ${bible.tone || "cinematic"}. ${dnaRules} The user is editing scene ${scene.number} (${scene.slug}). Be terse, specific, and direct — like a working writer's room note. Two paragraphs max. No preamble.`;
    try {
      const fetcher = window.CinaStudioAI?.authFetch || fetch;
      const resp = await fetcher("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-3.1-pro-preview",
          system: sys,
          messages: [{ role: "user", content: `SCENE:\n${sceneText}\n\n---\n\nQUESTION:\n${prompt}` }],
        }),
      });
      if (resp.ok) {
        const d = await resp.json();
        if (d?.text) {
          setCinaReply({ q: prompt, a: d.text });
          setAskingState("done");
          return;
        }
      }
      const reply = await window.claude.complete({
        messages: [
          { role: "user", content: `SCENE:\n${sceneText}\n\n---\n\nQUESTION:\n${prompt}` },
        ],
        system: sys,
      });
      setCinaReply({ q: prompt, a: reply });
      setAskingState("done");
    } catch (e) {
      setCinaReply({ q: prompt, a: "Cina is thinking offline today. Try again — or rephrase." });
      setAskingState("done");
    }
  }

  function applyCinaSuggest(noteId, replacementText) {
    updateScene(sc => ({
      ...sc,
      elements: sc.elements.map((e, i) => i === noteId ? { ...e, text: replacementText } : e),
    }));
    if (window.toast) window.toast({ title: "APPLIED", text: "Cina's revision merged.", kind: "good" });
  }

  return (
    <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
      {/* LEFT — Scene navigator */}
      <aside style={{ width: 260, borderRight: "1px solid var(--c-line)", display: "flex", flexDirection: "column", flexShrink: 0, background: "var(--c-panel)" }}>
        <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid var(--c-line)" }}>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>Screenplay</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", marginTop: 3, letterSpacing: ".12em", textTransform: "uppercase" }}>
            DNA · {dnaTitle}
          </div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 4, letterSpacing: ".08em", textTransform: "uppercase" }}>
            {scenes.length} scenes · {totalPages.toFixed(1)} pp
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
          {scenes.map((s) => (
            <button key={s.id} onClick={() => { setActiveId(s.id); setFocusedIdx(null); }} style={{
              width: "100%", border: "none",
              padding: "10px 18px",
              display: "flex", flexDirection: "column", alignItems: "stretch", gap: 4,
              borderLeft: `3px solid ${activeId === s.id ? "var(--c-amber)" : "transparent"}`,
              textAlign: "left", cursor: "pointer",
              background: activeId === s.id ? "var(--c-panel-2)" : "transparent",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: activeId === s.id ? "var(--c-amber)" : "var(--c-ink-3)", letterSpacing: ".08em" }}>SC. {s.number}</span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{s.pages}pp</span>
              </div>
              <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", fontFamily: "var(--f-mono)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis" }}>
                {s.slug}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <StatusPill status={s.status === "locked" ? "approved" : s.status === "writing" ? "active" : "draft"}/>
              </div>
            </button>
          ))}
        </div>

        <div style={{ borderTop: "1px solid var(--c-line)", padding: "10px 14px" }}>
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start" }} onClick={() => setNewSceneOpen(true)}>
            <Icon name="plus" size={11}/>New scene
          </button>
        </div>
      </aside>

      {/* CENTER — The page */}
      <main style={{ flex: 1, overflowY: "auto", background: tkc("panel-2"), display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", padding: "10px 24px", borderBottom: "1px solid var(--c-line)", background: "var(--c-bg)", flexShrink: 0, gap: 4 }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", marginRight: 12 }}>
            SC. {scene.number} · {scene.location} · {scene.timeOfDay}
          </span>
          <div style={{ flex: 1 }}/>
          {/* Element type toolbar */}
          <div style={{ display: "flex", gap: 2, padding: 2, background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", marginRight: 8 }}>
            {ELEMENT_TYPES.map(t => {
              const on = focusedIdx != null && scene.elements[focusedIdx]?.kind === t.id;
              return (
                <button key={t.id} onClick={() => applyKind(t.id)} title={t.hint}
                  style={{
                    height: 24, padding: "0 10px", fontSize: "var(--fs-label)",
                    background: on ? "var(--c-amber)" : "transparent",
                    color: on ? tkc("on-amber") : "var(--c-ink-2)",
                    border: "none", borderRadius: "var(--r-1)", cursor: "pointer",
                    fontFamily: "var(--f-sans)", fontWeight: on ? 600 : 400,
                  }}
                >{t.label}</button>
              );
            })}
          </div>
          <button className="btn btn-ghost" onClick={() => sceneIdx > 0 && setActiveId(scenes[sceneIdx - 1].id)} disabled={sceneIdx === 0}>← Prev</button>
          <button className="btn btn-ghost" onClick={() => sceneIdx < scenes.length - 1 && setActiveId(scenes[sceneIdx + 1].id)} disabled={sceneIdx === scenes.length - 1}>Next →</button>
          {window.CinaStudioAI?.StudioVoiceSlateButton && (
            <window.CinaStudioAI.StudioVoiceSlateButton
              onTranscript={(text) => {
                const lines = String(text || "").split(/\n+/).map(l => l.trim()).filter(Boolean);
                if (!lines.length) return;
                updateScene(sc => ({
                  ...sc,
                  elements: [
                    ...sc.elements,
                    ...lines.map(l => ({
                      kind: /^[A-Z0-9 .()'-]{2,32}$/.test(l) ? "character" : "action",
                      text: l,
                    })),
                  ],
                }));
              }}
            />
          )}
          <button className="btn btn-ghost" onClick={() => {
            if (window.CinaPipeline && typeof window.CinaPipeline.boardScene === "function") {
              const added = window.CinaPipeline.boardScene({ scene, openBoard: true });
              window.toast?.({
                title: added ? `BOARDED SC. ${scene.number}` : `OPENING SC. ${scene.number}`,
                text: added ? `${added} shot cards drafted onto 04 Stills storyboard.` : `Jumped to Sc. ${scene.number} on 04 Stills.`,
                kind: "good",
              });
            } else {
              window.toast?.({ title: "BOARDING", text: `Sending sc. ${scene.number} to storyboard.`, kind: "good" });
              window.dispatchEvent(new CustomEvent("cina:setView", { detail: "board" }));
            }
          }}><Icon name="film" size={11}/>Board this →</button>
          <button className="btn btn-primary" style={{ borderRadius: 0 }} onClick={sendToNextCast}>Send Next · 03 Cast →</button>
          <button className="btn btn-ghost" onClick={() => window.toast?.({ title: "EXPORT", text: "Industry-format PDF queued.", kind: "good" })}><Icon name="upload" size={11}/>PDF</button>
          <button className="btn btn-ghost" onClick={() => setShowNotes(!showNotes)}>
            <Icon name="more" size={11}/>{showNotes ? "Hide" : "Show"} Cina
          </button>
        </div>

        {/* The page */}
        <div style={{ flex: 1, padding: "32px 0 80px", display: "flex", justifyContent: "center" }}>
          <div style={{
            width: 720, maxWidth: "100%",
            background: tkc("ink"), color: tkc("panel-2"),
            padding: "60px 84px 80px",
            borderRadius: "var(--r-1)",
            boxShadow: "0 20px 60px rgba(0,0,0,.4), 0 1px 0 rgba(0,0,0,.2)",
            fontFamily: "Courier, 'Courier New', monospace",
            fontSize: "var(--fs-body)", lineHeight: 1.6,
            position: "relative",
          }}>
            <div style={{ position: "absolute", top: 28, right: 60, fontSize: "var(--fs-label)", color: tkc("ink-4") }}>{scene.number}.</div>

            {/* Editable slug */}
            <EditableLine
              kind="slug" text={scene.slug}
              onChange={t => updateScene(sc => ({ ...sc, slug: t.toUpperCase() }))}
              focused={false} onFocus={() => setFocusedIdx(null)}
            />

            {scene.elements.map((el, i) => (
              <EditableLine
                key={i}
                kind={el.kind} text={el.text}
                focused={focusedIdx === i}
                onFocus={() => setFocusedIdx(i)}
                onChange={t => patchEl(i, { text: t })}
                onEnter={() => insertEl(i, NEXT_KIND[el.kind] || "action", "")}
                onTab={(shift) => {
                  // Tab cycles kind
                  const order = ["action","character","paren","dialogue","transition"];
                  const cur = order.indexOf(el.kind);
                  const ni = shift ? (cur - 1 + order.length) % order.length : (cur + 1) % order.length;
                  changeKind(i, order[ni]);
                }}
                onBackspaceEmpty={() => deleteEl(i)}
              />
            ))}

            {/* Add line CTA */}
            <button
              onClick={() => insertEl(scene.elements.length - 1, "action", "")}
              style={{
                marginTop: 24, padding: "8px 12px",
                background: "transparent", border: `1px dashed ${tkc("cat-4")}`,
                color: tkc("ink-4"), fontFamily: "Courier, monospace", fontSize: "var(--fs-label)",
                cursor: "pointer", borderRadius: "var(--r-1)", width: "100%",
              }}
            >+ add line  ·  Tab cycles kind  ·  Enter inserts next</button>
          </div>
        </div>
      </main>

      {/* RIGHT — Cina */}
      {showNotes && (
        <aside style={{ width: 320, borderLeft: "1px solid var(--c-line)", display: "flex", flexDirection: "column", flexShrink: 0, background: "var(--c-panel)" }}>
          <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 10 }}>
            <CinaBadge size={20}/>
            <div style={{ flex: 1 }}>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>Cina · script</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", textTransform: "uppercase", marginTop: 2 }}>
                Sc. {scene.number} · live notes
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Static notes — clicking apply mutates the scene */}
            <MarginNote agent="director" line="14"
              text="Hold the silence longer here. Let him stare at the canister for a beat. The audience needs to feel the weight before he moves."/>
            <MarginNote agent="writer" line="22" suggest replacement="What did you do to me?"
              text="‘What did you bring me’ is doing work, but ‘What did you do to me’ might be louder. Same syllables, different gravity."
              onApply={(repl) => {
                const idx = scene.elements.findIndex(e => e.kind === "dialogue" && /what did you bring/i.test(e.text));
                if (idx >= 0) applyCinaSuggest(idx, repl);
                else window.toast?.({ title: "NOT FOUND", text: "That line isn't in this scene anymore.", kind: "warn" });
              }}
            />
            <MarginNote agent="editor" line="28"
              text="If you cut the second action line, the dialogue lands harder. The reader sees the timestamp without us announcing it."/>
            <MarginNote agent="visual" line="34"
              text="The hand-stops-mid-air beat — I've boarded this two ways. ECU on his hand or wide on the room. Want to compare?"/>

            {/* Live ask response */}
            {cinaReply && (
              <div style={{ padding: "12px 14px", background: "var(--c-panel-2)", border: "1px solid var(--c-amber-d)", borderLeft: "2px solid var(--c-amber)", borderRadius: "var(--r-2)" }}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 8 }}>YOU ASKED</div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginBottom: 10, fontStyle: "italic" }}>{cinaReply.q}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 8 }}>CINA</div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55, whiteSpace: "pre-wrap", textWrap: "pretty" }}>{cinaReply.a}</div>
              </div>
            )}
            {askingState === "thinking" && (
              <div style={{ padding: 14, color: "var(--c-ink-3)", fontSize: "var(--fs-body)", fontStyle: "italic" }}>Cina is reading the scene…</div>
            )}

            <button className="btn" style={{ alignSelf: "flex-start", marginTop: 6 }} onClick={() => setAskOpen(true)}>
              <Icon name="plus" size={10}/>Ask Cina
            </button>
          </div>

          <div style={{ borderTop: "1px solid var(--c-line)", padding: "12px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div className="t-label" style={{ marginBottom: 4 }}>Length</div>
              <div className="t-mono t-num" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{scene.pages} pp</div>
            </div>
            <div>
              <div className="t-label" style={{ marginBottom: 4 }}>Est. runtime</div>
              <div className="t-mono t-num" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{(scene.pages * 60).toFixed(0)}s</div>
            </div>
          </div>
        </aside>
      )}

      {/* Lightboxes */}
      {newSceneOpen && <NewSceneLightbox onClose={() => setNewSceneOpen(false)} onCreate={onCreateScene}/>}
      {askOpen && (
        <AskCinaLightbox
          onClose={() => setAskOpen(false)}
          onAsk={(t) => { setAskOpen(false); askCina(t); }}
        />
      )}
    </div>
  );
}

// ─────────── Editable line ───────────
function EditableLine({ kind, text, focused, onFocus, onChange, onEnter, onTab, onBackspaceEmpty }) {
  const ref = useRefSc(null);
  const styles = {
    slug:       { fontWeight: 700, textTransform: "uppercase", letterSpacing: ".02em", marginBottom: 18 },
    action:     { margin: "0 0 12px" },
    character:  { margin: "12px 0 0", marginLeft: 200, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" },
    paren:      { margin: "0", marginLeft: 152, fontStyle: "italic", color: tkc("ink-4") },
    dialogue:   { margin: "0 0 12px", marginLeft: 96, marginRight: 96 },
    transition: { margin: "12px 0", textAlign: "right", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: tkc("ink-4") },
  };
  const placeholder = {
    slug: "INT. LOCATION — TIME",
    action: "Describe what we see.",
    character: "WHO IS SPEAKING",
    paren: "(softly)",
    dialogue: "What they say.",
    transition: "CUT TO:",
  }[kind];

  function onKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnter?.();
    } else if (e.key === "Tab") {
      e.preventDefault();
      onTab?.(e.shiftKey);
    } else if (e.key === "Backspace" && !ref.current?.textContent.trim()) {
      e.preventDefault();
      onBackspaceEmpty?.();
    }
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onFocus={onFocus}
      onBlur={e => onChange(e.currentTarget.textContent)}
      onKeyDown={onKey}
      data-placeholder={placeholder}
      style={{
        ...styles[kind],
        outline: "none",
        position: "relative",
        background: focused ? "rgba(var(--accent-rgb),.12)" : "transparent",
        boxShadow: focused ? `inset 2px 0 0 ${tkc("warn")}` : "none",
        paddingLeft: focused ? 6 : 0,
        marginLeft: (styles[kind].marginLeft || 0) - (focused ? 6 : 0),
        minHeight: "1.6em",
        cursor: "text",
      }}
    >{text}</div>
  );
}

// ─────────── Margin note ───────────
function MarginNote({ agent, line, text, suggest, replacement, onApply }) {
  return (
    <div style={{
      padding: "10px 12px", background: "var(--c-panel-2)", border: "1px solid var(--c-line)",
      borderRadius: "var(--r-2)", borderLeft: `2px solid var(--c-agent-${agent})`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <AgentBadge agent={agent} size={14}/>
        <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", textTransform: "capitalize", fontWeight: 500 }}>{agent}</span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>line {line}</span>
        {suggest && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", marginLeft: "auto", textTransform: "uppercase", letterSpacing: ".08em" }}>suggests</span>}
      </div>
      <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5, textWrap: "pretty" }}>{text}</div>
      {suggest && (
        <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
          <button className="btn" style={{ height: 22, fontSize: "var(--fs-label)", padding: "0 8px" }} onClick={() => onApply?.(replacement)}>Apply</button>
          <button className="btn btn-ghost" style={{ height: 22, fontSize: "var(--fs-label)", padding: "0 8px" }} onClick={() => window.toast?.({ title: "COMPARE", text: "Side-by-side coming.", kind: "info" })}>Compare</button>
        </div>
      )}
    </div>
  );
}

// ─────────── New Scene Lightbox ───────────
function NewSceneLightbox({ onClose, onCreate }) {
  const [intExt, setIntExt] = useStateSc("INT");
  const [location, setLocation] = useStateSc("");
  const [timeOfDay, setTimeOfDay] = useStateSc("NIGHT");
  const [opening, setOpening] = useStateSc("");

  const valid = location.trim().length > 0;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,.78)", backdropFilter: "blur(20px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 560, background: "var(--c-panel)", border: "1px solid var(--c-line-2)",
        borderRadius: "var(--r-2)", padding: 32, display: "flex", flexDirection: "column", gap: 20,
      }}>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 8 }}>NEW SCENE</div>
          <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 500, margin: 0 }}>What's the slug?</h2>
          <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", margin: "8px 0 0" }}>Industry format: location and time. Cina will draft an opening line you can rewrite.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 130px", gap: 10, alignItems: "stretch" }}>
          <select value={intExt} onChange={e => setIntExt(e.target.value)} style={inp}>
            <option>INT</option><option>EXT</option><option>INT/EXT</option>
          </select>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="DARKROOM" autoFocus style={{ ...inp, textTransform: "uppercase" }}/>
          <select value={timeOfDay} onChange={e => setTimeOfDay(e.target.value)} style={inp}>
            <option>DAY</option><option>NIGHT</option><option>DAWN</option><option>DUSK</option><option>CONTINUOUS</option><option>LATER</option>
          </select>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>OPENING ACTION (OPTIONAL)</span>
          <textarea value={opening} onChange={e => setOpening(e.target.value)} placeholder="Nadya stands over the bath, sleeves rolled, watching."
            style={{ ...inp, minHeight: 80, fontFamily: "Courier, monospace", fontSize: "var(--fs-body)", lineHeight: 1.5, resize: "vertical" }}/>
        </label>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <button onClick={onClose} className="btn btn-ghost" aria-label="Close" title="Close">Cancel</button>
          <button
            onClick={() => valid && onCreate({ intExt, location, timeOfDay, opening })}
            disabled={!valid}
            className="btn btn-primary"
            style={{ opacity: valid ? 1 : 0.4, cursor: valid ? "pointer" : "not-allowed" }}
          >Create scene →</button>
        </div>
      </div>
    </div>
  );
}

// ─────────── Ask Cina Lightbox ───────────
function AskCinaLightbox({ onClose, onAsk }) {
  const [t, setT] = useStateSc("");
  const presets = [
    "Tighten this scene by 30%.",
    "What is the subtext she's not saying?",
    "Suggest a stronger button line.",
    "What's the visual hook here?",
  ];
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,.78)", backdropFilter: "blur(20px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 560, background: "var(--c-panel)", border: "1px solid var(--c-line-2)",
        borderRadius: "var(--r-2)", padding: 32, display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CinaBadge size={28}/>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>ASK CINA</div>
            <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, margin: "4px 0 0" }}>What do you want to know?</h2>
          </div>
        </div>

        <textarea value={t} onChange={e => setT(e.target.value)} placeholder="Ask anything about this scene…" autoFocus
          style={{ ...inp, minHeight: 100, fontSize: "var(--fs-body)", lineHeight: 1.5, resize: "vertical" }}/>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {presets.map(p => (
            <button key={p} onClick={() => setT(p)} className="btn btn-ghost" style={{ fontSize: "var(--fs-label)", height: 26 }}>{p}</button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button onClick={onClose} className="btn btn-ghost" aria-label="Close" title="Close">Cancel</button>
          <button onClick={() => t.trim() && onAsk(t.trim())} disabled={!t.trim()}
            className="btn btn-primary" style={{ opacity: t.trim() ? 1 : 0.4 }}>Ask Cina →</button>
        </div>
      </div>
    </div>
  );
}

const inp = {
  background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
  color: "var(--c-ink)", fontFamily: "var(--f-sans)", fontSize: "var(--fs-body)",
  padding: "10px 12px", borderRadius: "var(--r-2)", outline: "none",
};

// CSS for placeholders on contentEditable
if (typeof document !== "undefined" && !document.getElementById("script-ce-css")) {
  const s = document.createElement("style");
  s.id = "script-ce-css";
  s.textContent = `[contenteditable]:empty:before { content: attr(data-placeholder); color: ${tkc("ink-2")}; pointer-events: none; }`;
  document.head.appendChild(s);
}

Object.assign(window, { ScriptPanel });
