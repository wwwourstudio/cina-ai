// studio-v2-panels.jsx — Dock panels, scene inspector, Director bar and stage strip for Studio v2.

const { useState: useStateWP, useEffect: useEffectWP } = React;

function WsPanelHead({ title, onFull, onClose, fullLabel = "Open full" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderBottom: "1px solid var(--c-line)" }}>
      <span style={{ fontSize: "var(--fs-body)", fontWeight: 600, flex: 1 }}>{title}</span>
      {onFull && <button className="ws-btn ws-btn--ghost" style={{ height: 26, fontSize: "var(--fs-body)" }} onClick={onFull}>{fullLabel} ↗</button>}
      {onClose && <button className="ws-btn ws-btn--ghost" style={{ height: 26, width: 26, padding: 0, justifyContent: "center" }} onClick={onClose} aria-label="Close">×</button>}
    </div>
  );
}

const wsSceneOf = (clip) => (clip?.label.match(/^(\d+)/) || [])[1];
const WS_SCENE_CAST = { "14": ["c1", "c4"], "15": ["c1"] };

function WsDock({ id, onClose, onFull, tracks, setTracks, sel, onSelect, time, fidelity, onRender, setProposal }) {
  const scene = wsSceneOf(sel);
  const [prompt, setPrompt] = useStateWP("");
  const [model, setModel] = useStateWP("veo3");
  const code = wsShotCode(sel || { label: "" });
  useEffectWP(() => {
    const g = window.GEN_HISTORY.find(x => x.shot === code);
    const sb = window.STORYBOARD.find(s => s.thumb === sel?.thumb);
    setPrompt(g ? g.prompt : (sb ? sb.desc : sel?.label || ""));
  }, [sel?.id]);
  const titles = { script: "Script", bible: "Story", vault: "Cast", board: "Board", generate: "Generate", score: "Music", titles: "Titles" };
  const body = { padding: 14, display: "flex", flexDirection: "column", gap: 12 };
  return (
    <div style={{ borderRight: "1px solid var(--c-line)", background: "var(--c-panel)", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <WsPanelHead title={titles[id]} onFull={onFull} onClose={onClose}/>
      <div className="ws-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        {id === "script" && (
          <div style={body}>
            {window.SCRIPT_SCENES.map(sc => {
              const on = sc.number === scene;
              return (
                <div key={sc.id} style={{ borderRadius: "var(--r-2)", border: `1px solid ${on ? "rgba(var(--accent-rgb),.35)" : "var(--c-line)"}`, background: on ? "rgba(var(--accent-rgb),.04)" : "transparent", padding: "10px 12px" }}>
                  <button onClick={() => { const c = tracks.V1.find(x => wsSceneOf(x) === sc.number); c && onSelect(c.id, "V1"); }} style={{ all: "unset", cursor: "pointer", display: "block", width: "100%" }}>
                    <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: on ? "var(--c-amber)" : "var(--c-ink-3)", letterSpacing: ".08em" }}>{sc.number} · {sc.slug}</div>
                    <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", marginTop: 4, textWrap: "pretty" }}>{sc.summary}</div>
                  </button>
                  {on && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--c-line)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", lineHeight: 1.55, color: "var(--c-ink)" }}>
                      {sc.elements.map((el, i) => (
                        <div key={i} style={{ margin: el.kind === "character" ? "10px 0 0" : "0 0 8px", paddingLeft: el.kind === "character" ? "30%" : el.kind === "dialogue" ? "12%" : el.kind === "paren" ? "20%" : 0, paddingRight: el.kind === "dialogue" ? "10%" : 0, textAlign: el.kind === "transition" ? "right" : "left", color: el.kind === "paren" ? "var(--c-ink-3)" : undefined }}>{el.text}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {id === "bible" && (
          <div style={body}>
            <div className="ws-k">Logline</div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-lead)", lineHeight: 1.4, textWrap: "pretty" }}>{window.FILM_BIBLE.logline}</div>
            {window.FILM_BIBLE.tone && <><div className="ws-k">Tone</div><div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{[].concat(window.FILM_BIBLE.tone).join(" · ")}</div></>}
            <div className="ws-k">References</div>
            {window.REFERENCES.map(r => <div key={r.id} style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{r.source} <span style={{ color: "var(--c-ink-4)" }}>· {r.tag}</span></div>)}
          </div>
        )}
        {id === "vault" && (
          <div style={body}>
            <div className="ws-k">In scene {scene}</div>
            {window.CHARACTERS.map(ch => {
              const inScene = (WS_SCENE_CAST[scene] || []).includes(ch.id);
              return (
                <div key={ch.id} style={{ display: "flex", gap: 10, alignItems: "center", opacity: inScene ? 1 : .55 }}>
                  <img src={ch.photo} alt="" style={{ width: 40, height: 40, borderRadius: "var(--r-2)", objectFit: "cover", background: "var(--c-panel-3)" }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "var(--fs-body)", fontWeight: 600 }}>{ch.name}</div>
                    <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{ch.castName} · {ch.role}</div>
                  </div>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: inScene ? "var(--c-good)" : "var(--c-ink-4)" }}>{inScene ? "IN SCENE" : "—"}</span>
                </div>
              );
            })}
          </div>
        )}
        {id === "board" && (
          <div style={{ ...body, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {tracks.V1.map(c => {
              const f = WS_FIDELITY[fidelity(c)];
              return (
                <button key={c.id} onClick={() => onSelect(c.id, "V1")} style={{ all: "unset", cursor: "pointer", borderRadius: "var(--r-2)", overflow: "hidden", boxShadow: c.id === sel?.id ? "0 0 0 2px var(--c-amber)" : "0 0 0 1px var(--c-line)" }}>
                  <div style={{ aspectRatio: "16/9", position: "relative" }}><FrameThumb kind={c.thumb} usePhoto/></div>
                  <div style={{ padding: "6px 8px", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: f.color }}></span>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {id === "generate" && (
          <div style={body}>
            <div className="ws-k">Shot {code}</div>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={6} style={{ resize: "vertical", background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink)", padding: 10, fontFamily: "var(--f-sans)", fontSize: "var(--fs-body)", lineHeight: 1.5 }}></textarea>
            <div className="ws-k">Model</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {window.GEN_PRESETS.map(m => (
                <button key={m.id} onClick={() => setModel(m.id)} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: "var(--r-2)", border: `1px solid ${model === m.id ? "rgba(var(--accent-rgb),.4)" : "var(--c-line)"}`, background: model === m.id ? "rgba(var(--accent-rgb),.06)" : "transparent" }}>
                  <span style={{ fontSize: "var(--fs-body)", fontWeight: 600, flex: 1 }}>{m.name}<span style={{ fontWeight: 400, color: "var(--c-ink-3)" }}> · {m.strength}</span></span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{m.cost} cr</span>
                </button>
              ))}
            </div>
            <button className="ws-btn ws-btn--amber" style={{ justifyContent: "center", height: 36 }} onClick={() => onRender(sel.id, prompt, model)}>Render new take of {code}</button>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>The take lands on the timeline in place of the current one. Earlier takes stay in the inspector.</div>
          </div>
        )}
        {id === "score" && (
          <div style={body}>
            <div className="ws-k">Cues on the timeline</div>
            {tracks.A3.map(c => <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--fs-body)", gap: 8 }}><span>{c.label}</span><span className="t-mono" style={{ color: "var(--c-ink-3)", fontSize: "var(--fs-label)" }}>{wsFmt(c.start)}</span></div>)}
            <div className="ws-k" style={{ marginTop: 6 }}>Add at playhead · {wsFmt(time)}</div>
            {["Low cello · held", "Ambient pad · 62bpm", "Silence · duck all"].map(s => (
              <button key={s} className="ws-btn" onClick={() => { const cue = { id: "a3-" + Date.now(), start: time, dur: 8, label: "SCORE · " + s, kind: "score", color: tkc("cat-2") }; setTracks(t => ({ ...t, A3: [...t.A3, cue] })); }}>+ {s}</button>
            ))}
          </div>
        )}
        {id === "titles" && (
          <div style={body}>
            <div className="ws-k">Title cards</div>
            {tracks.V2.map(c => <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--fs-body)", gap: 8 }}><span>{c.label.replace("TITLE: ", "")}</span><span className="t-mono" style={{ color: "var(--c-ink-3)", fontSize: "var(--fs-label)" }}>{wsFmt(c.start)}</span></div>)}
            <div className="ws-k" style={{ marginTop: 6 }}>Add at playhead · {wsFmt(time)}</div>
            {["LAST LIGHT", "THREE DAYS EARLIER", "THE END"].map(s => (
              <button key={s} className="ws-btn" onClick={() => { const card = { id: "v2-" + Date.now(), start: time, dur: 4, label: "TITLE: " + s, kind: "title", color: "var(--c-amber)" }; setTracks(t => ({ ...t, V2: [...t.V2, card] })); }}>+ {s}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WsInspector({ clip, track, tracks, fidelity, takes, onRender, onOpen, setDock }) {
  if (!clip) return <div></div>;
  const isShot = track === "V1";
  const code = wsShotCode(clip);
  const sb = window.STORYBOARD.find(s => s.thumb === clip.thumb);
  const scene = wsSceneOf(clip);
  const sc = window.SCRIPT_SCENES.find(s => s.number === scene);
  const allTakes = [...takes, ...window.GEN_HISTORY.filter(g => g.shot === code)];
  const f = isShot ? WS_FIDELITY[fidelity(clip)] : null;
  const lines = sc ? sc.elements.filter(e => e.kind === "dialogue") : [];
  const music = tracks.A3.filter(c => c.start < clip.start + clip.dur && c.start + c.dur > clip.start);
  const sec = { padding: "12px 16px", borderBottom: "1px solid var(--c-line)", display: "flex", flexDirection: "column", gap: 8 };
  return (
    <div className="ws-scroll" style={{ borderLeft: "1px solid var(--c-line)", background: "var(--c-panel)", overflowY: "auto", minHeight: 0 }}>
      <div style={{ ...sec, gap: 10 }}>
        <div className="ws-k">{isShot ? `Scene ${scene} · Shot ${code?.slice(-1)}` : `${track} · ${clip.kind}`}</div>
        {isShot && <div style={{ aspectRatio: "16/9", borderRadius: "var(--r-2)", overflow: "hidden", position: "relative" }}><FrameThumb kind={clip.thumb} usePhoto/></div>}
        <div style={{ fontSize: "var(--fs-lead)", fontWeight: 600, lineHeight: 1.3 }}>{clip.label}</div>
        {sb && <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5, textWrap: "pretty" }}>{sb.desc}</div>}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }} className="t-mono">
          {f && <span style={{ fontSize: "var(--fs-label)", color: f.color }}>● {f.label}</span>}
          {sb && <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{sb.type} · {sb.lens}</span>}
          <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{clip.dur}s @ {wsFmt(clip.start)}</span>
        </div>
      </div>
      {isShot && (
        <div style={sec}>
          <div style={{ display: "flex", alignItems: "center" }}><span className="ws-k" style={{ flex: 1 }}>Takes</span><button className="ws-btn ws-btn--ghost" style={{ height: 24, fontSize: "var(--fs-label)" }} onClick={() => setDock("generate")}>Prompt…</button></div>
          {allTakes.length === 0 && <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>Board frame only. Render a first take.</div>}
          {allTakes.slice(0, 4).map((g, i) => (
            <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--fs-body)" }}>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", width: 24, color: i === 0 ? "var(--c-amber)" : "var(--c-ink-3)" }}>v{g.v}</span>
              <span style={{ flex: 1, color: "var(--c-ink-2)" }}>{(window.GEN_PRESETS.find(m => m.id === g.model) || {}).name || g.model}</span>
              {g.status === "rendering" ? (
                <span style={{ width: 70, height: 4, borderRadius: "var(--r-1)", background: "var(--c-line-2)", overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: `${g.progress * 100}%`, background: "var(--c-amber)", transition: "width .3s" }}></span></span>
              ) : <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: g.status === "rejected" ? "var(--c-bad)" : "var(--c-ink-3)" }}>{g.status}</span>}
            </div>
          ))}
          <button className="ws-btn ws-btn--amber" style={{ justifyContent: "center" }} onClick={() => onRender(clip.id)}>Regenerate {code}</button>
        </div>
      )}
      {isShot && lines.length > 0 && (
        <div style={sec}>
          <div style={{ display: "flex", alignItems: "center" }}><span className="ws-k" style={{ flex: 1 }}>Script · sc {scene}</span><button className="ws-btn ws-btn--ghost" style={{ height: 24, fontSize: "var(--fs-label)" }} onClick={() => setDock("script")}>Edit</button></div>
          {lines.map((l, i) => <div key={i} style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>“{l.text}”</div>)}
        </div>
      )}
      {isShot && (
        <div style={sec}>
          <div style={{ display: "flex", alignItems: "center" }}><span className="ws-k" style={{ flex: 1 }}>Cast</span><button className="ws-btn ws-btn--ghost" style={{ height: 24, fontSize: "var(--fs-label)" }} onClick={() => setDock("vault")}>Change</button></div>
          <div style={{ display: "flex", gap: 8 }}>
            {(WS_SCENE_CAST[scene] || []).map(cid => { const ch = window.CHARACTERS.find(c => c.id === cid); return ch && (
              <div key={cid} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <img src={ch.photo} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}/>
                <span style={{ fontSize: "var(--fs-body)" }}>{ch.castName}</span>
              </div>); })}
          </div>
        </div>
      )}
      <div style={sec}>
        <div style={{ display: "flex", alignItems: "center" }}><span className="ws-k" style={{ flex: 1 }}>Music under this</span><button className="ws-btn ws-btn--ghost" style={{ height: 24, fontSize: "var(--fs-label)" }} onClick={() => setDock("score")}>Add</button></div>
        {music.length ? music.map(m => <div key={m.id} style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{m.label}</div>) : <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>None</div>}
      </div>
      <div style={{ ...sec, borderBottom: "none" }}>
        <button className="ws-btn ws-btn--ghost" onClick={() => onOpen("board")}>Open in Storyboard ↗</button>
        <button className="ws-btn ws-btn--ghost" onClick={() => onOpen("editor")}>Open in Pro editor ↗</button>
      </div>
    </div>
  );
}

function WsDirectorBar({ proposal, onPropose, onAccept, onReject, onOpenFull, canUndo, onUndo, lastChange }) {
  const [v, setV] = useStateWP("");
  const submit = (txt) => { const t = (txt ?? v).trim(); if (!t) return; onPropose(t); setV(""); };
  const agent = proposal && window.AGENTS.find(a => a.id === proposal.agent);
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8, maxWidth: 820, width: "100%", alignSelf: "center" }}>
      {proposal && (
        <div className="ws-scroll" style={{ position: "absolute", left: 0, right: 0, bottom: "calc(100% + 10px)", zIndex: 5, maxHeight: 260, overflowY: "auto", border: "1px solid rgba(var(--accent-rgb),.35)", background: "color-mix(in oklab, var(--c-panel) 94%, transparent)", backdropFilter: "blur(8px)", boxShadow: "0 10px 30px rgba(0,0,0,.45)", borderRadius: "var(--r-3)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AgentBadge agent={proposal.agent} size={20}/>
            <span style={{ fontSize: "var(--fs-body)", fontWeight: 600 }}>{agent?.name || "Director"}</span>
            <span className="ws-k" style={{ marginLeft: "auto" }}>{proposal.none ? "No change" : "Previewing on timeline"}</span>
          </div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-lead)", lineHeight: 1.4, fontStyle: "italic", textWrap: "pretty" }}>{proposal.text}</div>
          {proposal.changes.length > 0 && <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {proposal.changes.map((c, i) => <div key={i} className="t-mono" style={{ fontSize: "var(--fs-label)", color: /^Remove/.test(c) ? "var(--c-blood-l)" : "var(--c-ink-2)" }}>{/^Remove/.test(c) ? "−" : "+"} {c}</div>)}
          </div>}
          <div style={{ display: "flex", gap: 8 }}>
            {!proposal.none && <button className="ws-btn ws-btn--amber" onClick={onAccept}>Accept</button>}
            <button className="ws-btn" onClick={onReject}>{proposal.none ? "OK" : "Reject"}</button>
          </div>
        </div>
      )}
      <form onSubmit={e => { e.preventDefault(); submit(); }} style={{ display: "flex", alignItems: "center", gap: 8, height: 46, padding: "0 6px 0 14px", borderRadius: "var(--r-3)", border: "1px solid var(--c-line-2)", background: "var(--c-panel-2)" }}>
        <AgentBadge agent="director" size={22}/>
        <input id="ws-director-input" value={v} onChange={e => setV(e.target.value)} placeholder="Tell the Director what to change…" style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)" }}/>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", padding: "2px 6px", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)" }}>/</span>
        <button type="submit" className="ws-btn ws-btn--amber" style={{ borderRadius: "var(--r-3)", height: 34 }}>Send</button>
      </form>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        {["Tighten scene 14", "Hold this shot longer", "Add score under the eye", "Regenerate with more dust"].map(s => <button key={s} className="ws-chip" onClick={() => submit(s)}>{s}</button>)}
        <span style={{ flex: 1 }}></span>
        {canUndo && <button className="ws-btn ws-btn--ghost" style={{ height: 28, fontSize: "var(--fs-body)" }} onClick={onUndo} title={lastChange}>↶ Undo</button>}
        <button className="ws-btn ws-btn--ghost" style={{ height: 28, fontSize: "var(--fs-body)" }} onClick={onOpenFull}>Full conversation ↗</button>
      </div>
    </div>
  );
}

// Top-bar stage strip — progress through the film, each step opens its tools.
function WsStageStrip({ kind }) {
  const [, force] = useStateWP(0);
  useEffectWP(() => { const h = () => force(n => n + 1); window.addEventListener("cina:ws-progress", h); return () => window.removeEventListener("cina:ws-progress", h); }, []);
  const p = window.__wsProgress;
  const shots = p ? p.tracks.V1 : [];
  const final = p ? shots.filter(c => ["approved", "review"].includes(p.fidelity(c))).length : 0;
  const locked = window.SCRIPT_SCENES.filter(s => s.status === "locked").length;
  const steps = [
    { id: "script", label: "Write", meta: `${locked}/${window.SCRIPT_SCENES.length}` },
    { id: "vault", label: "Cast", meta: `${window.CHARACTERS.length}` },
    { id: "board", label: "Shots", meta: `${final}/${shots.length}` },
    { id: "score", label: "Edit", meta: "rough" },
    { id: "deliver", label: "Release", meta: "" },
  ];
  return (
    <nav className="cina-topnav" style={{ display: "flex", alignItems: "center", gap: 2, height: "100%" }}>
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          {i > 0 && <span aria-hidden="true" style={{ color: "var(--c-ink-4)", fontSize: "var(--fs-label)" }}>›</span>}
          <button onClick={() => window.dispatchEvent(new CustomEvent("cina:ws-dock", { detail: s.id }))} style={{ height: 32, padding: "0 11px", border: "none", borderRadius: "var(--r-2)", background: s.id === "deliver" ? "rgba(var(--accent-rgb),.12)" : "transparent", color: s.id === "deliver" ? "var(--c-amber)" : "var(--c-ink-2)", cursor: "pointer", fontFamily: "var(--f-sans)", fontSize: "var(--fs-body)", display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
            {s.label}{s.meta && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{s.meta}</span>}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}

Object.assign(window, { WsDock, WsInspector, WsDirectorBar, WsStageStrip });
