// studio-ai-bridge.jsx — Native Gemini AI Production Suite bridge for Cina Studio.
// Powers all 6 Studio stations natively using Cina's own editorial obsidian UI/UX:
//   - DirectorHub: Writers' Room (/api/ai/chat), Live Voice Rehearsal (/ws/live), Cloud SQL Vault (/api/vault/*)
//   - 01 DNA (BiblePanel): Real Google Maps & Search Location Scout (/api/ai/ground/maps, /api/ai/ground/search)
//   - 02 Script (ScriptPanel): Live Voice Slate -> Fountain Screenplay Transcriber (/api/ai/transcribe)
//   - 04 Stills (StoryboardPanel): 4K Frame Lab & Image Edit (/api/ai/image · gemini-nano-banana-2.1)
//   - 05 Video (GeneratePanelV2): Omni Motion Video Renderer (/api/ai/video · gemini-omni-1.2-flash)
//   - 06 Score (ScorePanel): Lyria Neural Film Score Composer (/api/ai/music · lyria-3-clip/pro-preview)

(function () {
  const { useState: usSA, useEffect: ueSA, useRef: urSA } = React;

  async function authFetch(url, options = {}) {
    const headers = new Headers(options.headers || {});
    if (window.CinaCloudAuth && typeof window.CinaCloudAuth.getIdToken === "function") {
      try {
        const token = await window.CinaCloudAuth.getIdToken();
        if (token) headers.set("Authorization", `Bearer ${token}`);
      } catch (_) {}
    }
    return fetch(url, { ...options, headers });
  }

  function float32ToPcm16Base64(float32, inputSampleRate = 16000) {
    let samples = float32;
    if (inputSampleRate !== 16000 && inputSampleRate > 0) {
      const ratio = inputSampleRate / 16000;
      const outLen = Math.max(1, Math.floor(float32.length / ratio));
      const down = new Float32Array(outLen);
      for (let i = 0; i < outLen; i++) {
        down[i] = float32[Math.min(float32.length - 1, Math.floor(i * ratio))];
      }
      samples = down;
    }
    const pcm = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const bytes = new Uint8Array(pcm.buffer);
    let bin = "";
    for (let i = 0; i < bytes.byteLength; i += 0x8000) {
      bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return btoa(bin);
  }

  function pcm24Base64ToAudioBuffer(ctx, base64) {
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const len = Math.floor(bytes.length / 2);
    if (!len) return null;
    const view = new DataView(bytes.buffer, bytes.byteOffset, len * 2);
    const buf = ctx.createBuffer(1, len, 24000);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      ch[i] = view.getInt16(i * 2, true) / 32768;
    }
    return buf;
  }

  // ─── 1. DirectorHub · Live Rehearsal Room (/ws/live) ─────────────────────
  function StudioLiveRehearsal() {
    const [role, setRole] = usSA("director");
    const [voice, setVoice] = usSA("Kore");
    const [status, setStatus] = usSA("idle"); // idle | connecting | live
    const [transcript, setTranscript] = usSA([]);
    const [err, setErr] = usSA("");

    const wsRef = urSA(null);
    const streamRef = urSA(null);
    const inCtxRef = urSA(null);
    const outCtxRef = urSA(null);
    const procRef = urSA(null);
    const sourcesRef = urSA(new Set());
    const nextStartRef = urSA(0);
    const logRef = urSA(null);

    const stopSession = () => {
      if (procRef.current) { try { procRef.current.disconnect(); } catch (_) {} procRef.current = null; }
      if (wsRef.current) { try { wsRef.current.close(); } catch (_) {} wsRef.current = null; }
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => { try { t.stop(); } catch (_) {} }); streamRef.current = null; }
      sourcesRef.current.forEach(s => { try { s.stop(); } catch (_) {} });
      sourcesRef.current.clear();
      if (inCtxRef.current) { inCtxRef.current.close().catch(() => {}); inCtxRef.current = null; }
      if (outCtxRef.current) { outCtxRef.current.close().catch(() => {}); outCtxRef.current = null; }
      nextStartRef.current = 0;
      setStatus("idle");
    };

    ueSA(() => stopSession, []);
    ueSA(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [transcript]);

    const startSession = async () => {
      if (status !== "idle") { stopSession(); return; }
      setErr("");
      setStatus("connecting");
      try {
        const mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
        streamRef.current = mic;
        const inCtx = new AudioContext({ sampleRate: 16000 });
        const outCtx = new AudioContext({ sampleRate: 24000 });
        inCtxRef.current = inCtx;
        outCtxRef.current = outCtx;

        const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
        const ws = new WebSocket(`${proto}//${window.location.host}/ws/live?voice=${encodeURIComponent(voice)}&role=${encodeURIComponent(role)}`);
        wsRef.current = ws;

        ws.onopen = () => {
          const src = inCtx.createMediaStreamSource(mic);
          const proc = inCtx.createScriptProcessor(4096, 1, 1);
          procRef.current = proc;
          proc.onaudioprocess = (ev) => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
            wsRef.current.send(JSON.stringify({ audio: float32ToPcm16Base64(ev.inputBuffer.getChannelData(0), inCtx.sampleRate) }));
          };
          src.connect(proc);
          proc.connect(inCtx.destination);
        };

        ws.onmessage = (e) => {
          let msg = null;
          try { msg = JSON.parse(e.data); } catch (_) { return; }
          if (!msg) return;
          if (msg.type === "ready") {
            setStatus("live");
            setTranscript([{ who: "Cina", text: `Live Rehearsal active (${voice} · ${role.replace("_", " ")}). Speak anytime.` }]);
          } else if (msg.type === "audio" && msg.audio && outCtxRef.current) {
            if (outCtxRef.current.state === "suspended") outCtxRef.current.resume().catch(() => {});
            const buf = pcm24Base64ToAudioBuffer(outCtxRef.current, msg.audio);
            if (buf) {
              const s = outCtxRef.current.createBufferSource();
              s.buffer = buf;
              s.connect(outCtxRef.current.destination);
              const at = Math.max(outCtxRef.current.currentTime, nextStartRef.current);
              s.start(at);
              nextStartRef.current = at + buf.duration;
              sourcesRef.current.add(s);
              s.onended = () => sourcesRef.current.delete(s);
            }
          } else if (msg.type === "interrupted" && outCtxRef.current) {
            sourcesRef.current.forEach(s => { try { s.stop(); } catch (_) {} });
            sourcesRef.current.clear();
            nextStartRef.current = outCtxRef.current.currentTime;
          } else if (msg.type === "inputTranscript" && msg.text) {
            setTranscript(prev => {
              const last = prev[prev.length - 1];
              if (last && last.who === "You") return [...prev.slice(0, -1), { who: "You", text: last.text + msg.text }];
              return [...prev, { who: "You", text: msg.text }];
            });
          } else if (msg.type === "outputTranscript" && msg.text) {
            setTranscript(prev => {
              const last = prev[prev.length - 1];
              if (last && last.who === "Cina") return [...prev.slice(0, -1), { who: "Cina", text: last.text + msg.text }];
              return [...prev, { who: "Cina", text: msg.text }];
            });
          } else if (msg.type === "error") {
            setErr(msg.error || "Live voice interrupted.");
            stopSession();
          }
        };

        ws.onerror = () => { setErr("Unable to connect Live Rehearsal."); stopSession(); };
        ws.onclose = () => { setStatus("idle"); };
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Microphone permission denied.");
        stopSession();
      }
    };

    const ROLES = [
      { id: "director", label: "Co-Director", desc: "Blocking, lens choice & story beats" },
      { id: "scene_partner", label: "Scene Partner", desc: "Live table read in character" },
      { id: "pitch_panel", label: "Festival Pitch", desc: "Cannes / Sundance Q&A critique" },
    ];
    const VOICES = ["Kore", "Aoede", "Zephyr", "Charon", "Puck"];

    return (
      <div className="sc-scroll" style={{ flex: 1, overflowY: "auto", padding: "1.6rem 2rem" }}>
        <div style={{ maxWidth: "46rem", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", borderBottom: "1px solid var(--c-line)", paddingBottom: "1rem" }}>
            <div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)" }}>GEMINI LIVE · REAL-TIME AUDIO</div>
              <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, margin: "0.25rem 0 0" }}>Live Rehearsal &amp; Pitch Room</h2>
            </div>
            <button onClick={startSession} className={status === "live" ? "btn" : "btn btn-primary"} style={{ height: "2.35rem", padding: "0 1.2rem" }}>
              {status === "connecting" ? "Connecting…" : status === "live" ? "■ End Rehearsal" : "● Start Live Voice"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))", gap: "0.6rem" }}>
            {ROLES.map(r => (
              <button key={r.id} onClick={() => { setRole(r.id); if (status === "live") stopSession(); }} style={{
                padding: "0.75rem 0.9rem", textAlign: "left", cursor: "pointer",
                background: role === r.id ? "rgba(var(--accent-rgb),.12)" : "var(--c-panel)",
                border: `1px solid ${role === r.id ? "var(--c-amber)" : "var(--c-line)"}`, color: "inherit",
              }}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: role === r.id ? "var(--c-amber)" : "var(--c-ink)", fontWeight: 700, letterSpacing: ".12em" }}>{r.label.toUpperCase()}</div>
                <div style={{ fontSize: "0.76rem", color: "var(--c-ink-3)", marginTop: "0.25rem" }}>{r.desc}</div>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".14em" }}>NEURAL VOICE</span>
            {VOICES.map(v => (
              <button key={v} onClick={() => { setVoice(v); if (status === "live") stopSession(); }} style={{
                padding: "0.3rem 0.7rem", cursor: "pointer",
                background: voice === v ? "var(--c-panel-3)" : "transparent",
                border: `1px solid ${voice === v ? "var(--c-amber)" : "var(--c-line-2)"}`,
                color: voice === v ? "var(--c-amber)" : "var(--c-ink-3)",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
              }}>{v}</button>
            ))}
          </div>

          {err && <div style={{ padding: "0.75rem 1rem", border: "1px solid var(--c-blood)", background: "rgba(195,69,57,.1)", fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{err}</div>}

          <div ref={logRef} style={{ border: "1px solid var(--c-line)", background: "var(--c-panel)", padding: "1rem 1.15rem", minHeight: "14rem", maxHeight: "22rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {transcript.length === 0 ? (
              <div style={{ margin: "auto", textAlign: "center", color: "var(--c-ink-4)", fontSize: "var(--fs-body)", maxWidth: "38ch" }}>
                Pick a partner mode above and press Start Live Voice to rehearse dialogue, test story pivots, or practice your festival pitch aloud.
              </div>
            ) : transcript.map((t, i) => (
              <div key={i} style={{ lineHeight: 1.55, fontSize: "var(--fs-body)" }}>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".12em", color: t.who === "Cina" ? "var(--c-amber)" : "var(--c-ink-4)", marginRight: "0.55rem" }}>{t.who.toUpperCase()}:</span>
                <span style={{ color: "var(--c-ink-2)" }}>{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── 2. DirectorHub · Persistent Cloud SQL Vault (/api/vault/*) ───────────
  function StudioCloudVault() {
    const [cloudUser, setCloudUser] = usSA(() => window.CinaCloudAuth?.currentUser || null);
    const [projects, setProjects] = usSA([]);
    const [assets, setAssets] = usSA([]);
    const [loading, setLoading] = usSA(false);
    const [newTitle, setNewTitle] = usSA("");

    const refresh = async () => {
      if (!window.CinaCloudAuth?.currentUser) return;
      setLoading(true);
      try {
        const [pRes, aRes] = await Promise.all([authFetch("/api/vault/projects"), authFetch("/api/vault/assets")]);
        if (pRes.ok) { const d = await pRes.json(); setProjects(d.projects || []); }
        if (aRes.ok) { const d = await aRes.json(); setAssets(d.assets || []); }
      } finally {
        setLoading(false);
      }
    };

    ueSA(() => {
      const unsub = window.CinaCloudAuth?.onAuthStateChanged?.(u => {
        setCloudUser(u);
        if (u) refresh();
      });
      refresh();
      return () => unsub && unsub();
    }, []);

    const createProj = async (e) => {
      e.preventDefault();
      if (!newTitle.trim()) return;
      const resp = await authFetch("/api/vault/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), genre: window.FILM_BIBLE?.genre?.join(", ") || "Drama", logline: window.FILM_BIBLE?.logline || "" }),
      });
      if (resp.ok) { setNewTitle(""); refresh(); window.toast?.({ title: "SAVED TO CLOUD VAULT", text: newTitle.trim(), kind: "good" }); }
    };

    return (
      <div className="sc-scroll" style={{ flex: 1, overflowY: "auto", padding: "1.6rem 2rem" }}>
        <div style={{ maxWidth: "52rem", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid var(--c-line)", paddingBottom: "1rem", gap: "1rem" }}>
            <div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)" }}>POSTGRESQL · PRODUCTION ARCHIVE</div>
              <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, margin: "0.25rem 0 0" }}>Cloud Slate Vault</h2>
            </div>
            {cloudUser ? (
              <button onClick={refresh} className="btn">{loading ? "Syncing…" : "↻ Sync Vault"}</button>
            ) : (
              <button onClick={() => window.CinaCloudAuth?.signInWithGoogle?.()} className="btn btn-primary">Connect Google Cloud Auth</button>
            )}
          </div>

          {!cloudUser ? (
            <div style={{ padding: "2rem", border: "1px dashed var(--c-line-2)", background: "var(--c-panel)", textAlign: "center" }}>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", marginBottom: "0.5rem" }}>Sign in with Google to persist AI stills, motion clips, and slates</div>
              <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", margin: "0 0 1rem" }}>Uses the unified Google account from your Studio Header menu.</p>
              <button onClick={() => window.CinaCloudAuth?.signInWithGoogle?.()} className="btn btn-primary">Sign In with Google</button>
            </div>
          ) : (
            <>
              <form onSubmit={createProj} style={{ display: "flex", gap: "0.5rem" }}>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Save current slate snapshot to Cloud SQL…" style={{ flex: 1, height: "2.35rem", padding: "0 0.85rem", background: "var(--c-panel)", border: "1px solid var(--c-line-2)", color: "var(--c-ink)", outline: "none" }}/>
                <button type="submit" className="btn btn-primary">Archive Slate</button>
              </form>

              <div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".14em", color: "var(--c-ink-4)", marginBottom: "0.55rem" }}>ARCHIVED SLATES ({projects.length})</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(15rem, 1fr))", gap: "0.65rem" }}>
                  {projects.map(p => (
                    <div key={p.id} style={{ padding: "0.9rem", border: "1px solid var(--c-line)", background: "var(--c-panel)" }}>
                      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{p.title}</div>
                      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: "0.2rem" }}>{p.genre}</div>
                      {p.logline && <div style={{ fontSize: "0.78rem", color: "var(--c-ink-3)", marginTop: "0.45rem", lineHeight: 1.45 }}>{p.logline}</div>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".14em", color: "var(--c-ink-4)", marginBottom: "0.55rem" }}>SAVED AI STILLS, CLIPS &amp; SCORES ({assets.length})</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(14rem, 1fr))", gap: "0.65rem" }}>
                  {assets.map(a => (
                    <div key={a.id} style={{ border: "1px solid var(--c-line)", background: "var(--c-panel)", overflow: "hidden" }}>
                      {a.kind === "image" && a.dataUrl && <img src={a.dataUrl} alt={a.title} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}/>}
                      {a.kind === "video" && a.dataUrl && <video src={a.dataUrl} controls style={{ width: "100%", aspectRatio: "16/9", display: "block", background: "#000" }}/>}
                      {a.kind === "music" && a.dataUrl && <audio src={a.dataUrl} controls style={{ width: "100%", marginTop: "0.5rem" }}/>}
                      <div style={{ padding: "0.6rem 0.75rem" }}>
                        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)" }}>{String(a.kind || "ASSET").toUpperCase()}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--c-ink)", marginTop: "0.15rem" }}>{a.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── 3. 01 DNA · Google Maps & Search Location Scout ─────────────────────
  function StudioLocationScoutTab() {
    const [mode, setMode] = usSA("maps");
    const [query, setQuery] = usSA("brutalist concrete port architecture overcast harbor Marseille");
    const [loading, setLoading] = usSA(false);
    const [result, setResult] = usSA(null);
    const [err, setErr] = usSA("");

    const runScout = async (e) => {
      e.preventDefault();
      if (!query.trim()) return;
      setLoading(true);
      setErr("");
      try {
        const endpoint = mode === "maps" ? "/api/ai/ground/maps" : "/api/ai/ground/search";
        const resp = await authFetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: query.trim(), persist: Boolean(window.CinaCloudAuth?.currentUser) }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.error || "Scout request failed.");
        setResult(data);
      } catch (e2) {
        setErr(e2 instanceof Error ? e2.message : "Location scout unavailable.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.6rem" }}>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".14em", color: "var(--c-amber)" }}>REAL-WORLD SCOUT · MAPS &amp; SEARCH GROUNDING</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", marginTop: "0.2rem" }}>Location &amp; Cultural Research</div>
          </div>
          <div style={{ display: "flex", border: "1px solid var(--c-line-2)" }}>
            <button type="button" onClick={() => setMode("maps")} style={{ padding: "0.45rem 0.9rem", border: "none", borderRight: "1px solid var(--c-line-2)", background: mode === "maps" ? "rgba(var(--accent-rgb),.14)" : "transparent", color: mode === "maps" ? "var(--c-amber)" : "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", cursor: "pointer" }}>GOOGLE MAPS VENUES</button>
            <button type="button" onClick={() => setMode("search")} style={{ padding: "0.45rem 0.9rem", border: "none", background: mode === "search" ? "rgba(var(--accent-rgb),.14)" : "transparent", color: mode === "search" ? "var(--c-amber)" : "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", cursor: "pointer" }}>SEARCH FACT &amp; ERA</button>
          </div>
        </div>

        <form onSubmit={runScout} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Describe architecture, city light, 1970s radio stations, or screening venues…" style={{ flex: "1 1 20rem", height: "2.5rem", padding: "0 0.9rem", background: "var(--c-panel)", border: "1px solid var(--c-line-2)", color: "var(--c-ink)", outline: "none" }}/>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ height: "2.5rem", padding: "0 1.25rem" }}>{loading ? "Scouting…" : "Scout Now"}</button>
        </form>

        {err && <div style={{ padding: "0.75rem", border: "1px solid var(--c-blood)", color: "var(--c-ink)" }}>{err}</div>}

        {result && (
          <div style={{ padding: "1.2rem", border: "1px solid var(--c-line)", background: "var(--c-panel)", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ fontSize: "var(--fs-body)", lineHeight: 1.65, color: "var(--c-ink-2)", whiteSpace: "pre-wrap" }}>{result.summary}</div>
            {Array.isArray(result.places) && result.places.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(15rem, 1fr))", gap: "0.6rem" }}>
                {result.places.map((p, idx) => (
                  <a key={idx} href={p.uri} target="_blank" rel="noreferrer" style={{ padding: "0.75rem", border: "1px solid var(--c-line-2)", background: "var(--c-bg)", textDecoration: "none", color: "inherit" }}>
                    <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)" }}>MAP PIN ↗</div>
                    <div style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)", marginTop: "0.2rem" }}>{p.title}</div>
                    {p.reviewSnippets?.[0] && <div style={{ fontSize: "0.74rem", color: "var(--c-ink-3)", marginTop: "0.3rem" }}>{p.reviewSnippets[0]}</div>}
                  </a>
                ))}
              </div>
            )}
            {Array.isArray(result.sources) && result.sources.length > 0 && (
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {result.sources.map((s, idx) => (
                  <a key={idx} href={s.uri} target="_blank" rel="noreferrer" className="t-mono" style={{ fontSize: "var(--fs-label)", padding: "0.3rem 0.6rem", border: "1px solid var(--c-line-2)", color: "var(--c-amber)", textDecoration: "none" }}>{s.title} ↗</a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ─── 4. 02 Script · Voice Slate Recorder (/api/ai/transcribe) ─────────────
  function StudioVoiceSlateButton({ onTranscript }) {
    const [recording, setRecording] = usSA(false);
    const [busy, setBusy] = usSA(false);
    const recRef = urSA(null);
    const chunksRef = urSA([]);

    const toggle = async () => {
      if (busy) return;
      if (recording && recRef.current) {
        recRef.current.stop();
        setRecording(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        chunksRef.current = [];
        mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        mr.onstop = async () => {
          stream.getTracks().forEach(t => t.stop());
          const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
          setBusy(true);
          try {
            const reader = new FileReader();
            const dataUrl = await new Promise((res, rej) => { reader.onload = () => res(reader.result); reader.onerror = rej; reader.readAsDataURL(blob); });
            const resp = await authFetch("/api/ai/transcribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ audioDataUrl: dataUrl, formatMode: "fountain", mode: "dialogue_polish" }),
            });
            const data = await resp.json();
            if (resp.ok && data.text) {
              onTranscript && onTranscript(data.text);
              window.toast?.({ title: "VOICE SLATE TRANSCRIBED", text: "Added to active scene.", kind: "good" });
            } else {
              throw new Error(data?.error || "Transcription failed.");
            }
          } catch (e) {
            window.toast?.({ title: "Voice Slate error", text: e instanceof Error ? e.message : "Could not transcribe", kind: "bad" });
          } finally {
            setBusy(false);
          }
        };
        recRef.current = mr;
        mr.start();
        setRecording(true);
      } catch (e) {
        window.toast?.({ title: "Microphone blocked", text: "Allow mic access to dictate lines.", kind: "bad" });
      }
    };

    return (
      <button type="button" className={recording ? "btn btn-primary" : "btn btn-ghost"} onClick={toggle} disabled={busy} title="Dictate scene dialogue or action directly into script">
        {busy ? "Transcribing…" : recording ? "■ Stop Voice Slate" : "● Voice Slate"}
      </button>
    );
  }

  // ─── 5. 04 Stills · 4K Frame Lab Generator (gemini-nano-banana-2.1) ──────
  function StudioFrameLabModal({ open, initialPrompt, onClose, onApplyImage }) {
    const [prompt, setPrompt] = usSA(initialPrompt || "Anamorphic 35mm cinema still, wet sodium-lit harbor street at dawn, lonely figure with tape recorder");
    const [aspectRatio, setAspectRatio] = usSA("16:9");
    const [imageSize, setImageSize] = usSA("2K");
    const [ground, setGround] = usSA(false);
    const [busy, setBusy] = usSA(false);
    const [imageUrl, setImageUrl] = usSA("");
    const [err, setErr] = usSA("");

    ueSA(() => { if (initialPrompt) setPrompt(initialPrompt); }, [initialPrompt]);
    if (!open) return null;

    const generate = async (e) => {
      e.preventDefault();
      if (!prompt.trim() || busy) return;
      setBusy(true);
      setErr("");
      try {
        const resp = await authFetch("/api/ai/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt.trim(), aspectRatio, imageSize, useSearchGrounding: ground }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.error || "Frame generation failed.");
        setImageUrl(data.imageDataUrl);
      } catch (e2) {
        setErr(e2 instanceof Error ? e2.message : "Image render failed.");
      } finally {
        setBusy(false);
      }
    };

    const saveToVault = async () => {
      if (!imageUrl) return;
      try {
        await authFetch("/api/vault/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "image", title: prompt.slice(0, 60), prompt, model: "gemini-nano-banana-2.1", dataUrl: imageUrl }),
        });
      } catch (_) {}
      onApplyImage && onApplyImage(imageUrl, prompt);
      window.toast?.({ title: "4K FRAME SAVED", text: "Attached to storyboard frame.", kind: "good" });
      onClose();
    };

    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9500, background: "rgba(5,5,8,.84)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div onClick={e => e.stopPropagation()} style={{ width: "min(48rem, 96%)", background: "var(--c-panel)", border: "1px solid var(--c-line-2)", padding: "1.4rem 1.6rem", display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "90vh", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--c-line)", paddingBottom: "0.75rem" }}>
            <div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>GEMINI NANO BANANA 2.1 · 4K FRAME LAB</div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>Generate Storyboard Still</div>
            </div>
            <button onClick={onClose} className="btn btn-icon btn-ghost">✕</button>
          </div>
          <form onSubmit={generate} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <textarea rows={3} value={prompt} onChange={e => setPrompt(e.target.value)} style={{ width: "100%", padding: "0.75rem", background: "var(--c-bg)", border: "1px solid var(--c-line-2)", color: "var(--c-ink)", outline: "none" }}/>
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
              <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} style={{ height: "2.15rem", background: "var(--c-bg)", border: "1px solid var(--c-line-2)", color: "var(--c-ink)", padding: "0 0.6rem" }}>
                <option value="16:9">16:9 Widescreen</option>
                <option value="9:16">9:16 Vertical</option>
                <option value="4:3">4:3 Academy</option>
                <option value="1:1">1:1 Square</option>
              </select>
              <select value={imageSize} onChange={e => setImageSize(e.target.value)} style={{ height: "2.15rem", background: "var(--c-bg)", border: "1px solid var(--c-line-2)", color: "var(--c-ink)", padding: "0 0.6rem" }}>
                <option value="1K">1K Draft</option>
                <option value="2K">2K Studio</option>
                <option value="4K">4K Master</option>
              </select>
              <label className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", display: "flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }}>
                <input type="checkbox" checked={ground} onChange={e => setGround(e.target.checked)}/> Visual Grounding
              </label>
              <span style={{ flex: 1 }}/>
              <button type="submit" disabled={busy} className="btn btn-primary">{busy ? "Rendering Frame…" : "Render Still"}</button>
            </div>
          </form>
          {err && <div style={{ padding: "0.7rem", border: "1px solid var(--c-blood)", color: "var(--c-ink)" }}>{err}</div>}
          {imageUrl && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <img src={imageUrl} alt="Generated frame" style={{ width: "100%", border: "1px solid var(--c-line)", display: "block" }}/>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button onClick={saveToVault} className="btn btn-primary">✓ Use Frame on Storyboard</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── 6. Shared Reactive Production Pipeline (01 DNA → 07 Ship) ──────────
  function plRead(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  }
  function plWrite(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (_) {}
  }

  const STATIONS = [
    { id: "dna",    n: "01", label: "DNA",    entry: "bible",    views: ["bible"] },
    { id: "write",  n: "02", label: "Script", entry: "script",   views: ["script", "episodes"] },
    { id: "cast",   n: "03", label: "Cast",   entry: "vault",    views: ["vault"] },
    { id: "stills", n: "04", label: "Stills", entry: "board",    views: ["board"] },
    { id: "motion", n: "05", label: "Video",  entry: "generate", views: ["generate", "branch"] },
    { id: "edit",   n: "06", label: "Edit",   entry: "editor",   views: ["editor", "cuts", "score", "titles", "dock"] },
    { id: "ship",   n: "07", label: "Ship",   entry: "mint",     views: ["mint", "deliver", "watch"] },
  ];

  const _sendNextRegistry = new Map();

  const CinaPipeline = {
    STATIONS,
    getFilmId() {
      if (window.__cinaActiveFilmId) return window.__cinaActiveFilmId;
      try {
        return localStorage.getItem("cina:active-film-id") || "p1";
      } catch (_) {
        return "p1";
      }
    },
    resolveSmartView(filmOrId) {
      const id = typeof filmOrId === "string" ? filmOrId : filmOrId?.id;
      const film = (typeof filmOrId === "object" && filmOrId) || (window.PROJECTS || []).find(p => p.id === id);
      const st = String(film?.status || "").toLowerCase();
      if (st === "released") return "deliver";
      if (st === "in production" || st === "storyboard") return "board";
      if (st === "script") return "script";
      return "bible";
    },
    selectFilm(filmOrId, opts = {}) {
      const id = (typeof filmOrId === "string" ? filmOrId : filmOrId?.id) || "p1";
      const film = (typeof filmOrId === "object" && filmOrId) || (window.PROJECTS || []).find(p => p.id === id) || null;
      window.__cinaActiveFilmId = id;
      try { localStorage.setItem("cina:active-film-id", id); } catch (_) {}

      const dnaKey = "cina:dna:" + id;
      let savedDna = plRead(dnaKey, null);
      if (!savedDna && film && window.FILM_BIBLE) {
        const genres = film.genre
          ? String(film.genre).split(/[·,/]/).map(s => s.trim().toUpperCase()).filter(Boolean)
          : (window.FILM_BIBLE.genre || ["DRAMA"]);
        savedDna = {
          ...window.FILM_BIBLE,
          title: String(film.title || window.FILM_BIBLE.title || "UNTITLED").toUpperCase(),
          logline: film.logline || window.FILM_BIBLE.logline || "",
          genre: genres.length ? genres : (window.FILM_BIBLE.genre || ["DRAMA"]),
        };
        plWrite(dnaKey, savedDna);
      }
      if (savedDna && window.FILM_BIBLE) {
        window.FILM_BIBLE = { ...window.FILM_BIBLE, ...savedDna };
      }
      if (window.__cinaDnaHydrated) delete window.__cinaDnaHydrated[id];
      if (window.__cinaScenesHydrated) delete window.__cinaScenesHydrated[id];
      if (window.__cinaCastHydrated) delete window.__cinaCastHydrated[id];

      if (window.STUDIO?.setState && film) {
        try {
          window.STUDIO.setState(s => ({
            ...s,
            workspace: {
              ...s.workspace,
              title: (savedDna?.title || film.title || s.workspace?.title),
              logline: (savedDna?.logline || film.logline || s.workspace?.logline),
            },
          }));
        } catch (_) {}
      }
      if (!opts.silent) {
        window.dispatchEvent(new CustomEvent("cina:dna-updated", { detail: window.FILM_BIBLE || savedDna || {} }));
        this.emit({ step: "slate", filmId: id });
      }
      return film;
    },
    emit(detail = {}) {
      window.dispatchEvent(new CustomEvent("cina:pipeline-change", { detail }));
    },
    go(view, sub) {
      if (typeof window.__cinaStudioGo === "function") {
        window.__cinaStudioGo(view, sub);
      } else {
        window.dispatchEvent(new CustomEvent("cina:setView", { detail: view }));
        if (sub) {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("cina:studioSubTab", { detail: { view, sub } }));
          }, 40);
        }
      }
      this.emit({ view, sub });
    },
    hydrateDna() {
      const filmId = this.getFilmId();
      const savedDna = plRead("cina:dna:" + filmId, null);
      if (savedDna && window.FILM_BIBLE) {
        window.FILM_BIBLE = { ...window.FILM_BIBLE, ...savedDna };
      }
      return window.FILM_BIBLE || {};
    },
    loadScenes() {
      const filmId = this.getFilmId();
      const saved = plRead("cina:scenes:" + filmId, null);
      if (Array.isArray(saved) && saved.length > 0) {
        window.SCRIPT_SCENES = saved;
        return saved;
      }
      return JSON.parse(JSON.stringify(window.SCRIPT_SCENES || []));
    },
    saveScenes(scenes) {
      if (!Array.isArray(scenes)) return;
      const filmId = this.getFilmId();
      window.SCRIPT_SCENES = scenes;
      plWrite("cina:scenes:" + filmId, scenes);
      const castNames = Array.from(new Set(
        scenes.flatMap(sc => (sc.elements || []).filter(e => e.kind === "character").map(e => String(e.text || "").replace(/\s*\(.*?\)\s*/g, "").trim()).filter(Boolean))
      ));
      const existing = plRead("cina:scriptData", {}) || {};
      const nextScriptData = {
        ...existing,
        scenesCount: scenes.length,
        totalPages: +scenes.reduce((a, s) => a + (Number(s.pages) || 0.5), 0).toFixed(1),
        castNames,
        updatedAt: Date.now(),
      };
      plWrite("cina:scriptData", nextScriptData);
      window.dispatchEvent(new CustomEvent("cina:script-updated", { detail: nextScriptData }));
      this.emit({ step: "write", scenesCount: scenes.length });
      return nextScriptData;
    },
    loadCast() {
      const filmId = this.getFilmId();
      const saved = plRead("cina:cast:" + filmId, null);
      if (Array.isArray(saved) && saved.length > 0) {
        window.CHARACTERS = saved;
        return saved;
      }
      return window.CHARACTERS || [];
    },
    syncCast(chars) {
      if (!Array.isArray(chars)) return;
      const filmId = this.getFilmId();
      window.CHARACTERS = chars;
      plWrite("cina:cast:" + filmId, chars);
      this.emit({ step: "cast", total: chars.length });
    },
    setActivePerformer(performer) {
      if (!performer) return null;
      const filmId = this.getFilmId();
      const snap = {
        id: performer.id || "",
        name: performer.name || "CAST",
        role: performer.role || "Performer",
        photo: performer.photo || null,
        color: performer.color || "var(--c-amber)",
        continuity: performer.continuity || 0.92,
        at: Date.now(),
      };
      window.__cinaActivePerformer = snap;
      plWrite("cina:active-performer:" + filmId, snap);
      window.dispatchEvent(new CustomEvent("cina:performer-sync", { detail: snap }));
      this.emit({ step: "cast", performer: snap.name });
      return snap;
    },
    getActivePerformer() {
      if (window.__cinaActivePerformer) return window.__cinaActivePerformer;
      const filmId = this.getFilmId();
      return plRead("cina:active-performer:" + filmId, null);
    },
    getSummary() {
      const filmId = this.getFilmId();
      const dnaKey = "cina:dna:" + filmId;
      const savedDna = plRead(dnaKey, null);
      if (savedDna && window.FILM_BIBLE && !window.__cinaDnaHydrated?.[filmId]) {
        window.__cinaDnaHydrated = { ...(window.__cinaDnaHydrated || {}), [filmId]: true };
        window.FILM_BIBLE = { ...window.FILM_BIBLE, ...savedDna };
      }
      const savedScenes = plRead("cina:scenes:" + filmId, null);
      if (Array.isArray(savedScenes) && savedScenes.length > 0 && !window.__cinaScenesHydrated?.[filmId]) {
        window.__cinaScenesHydrated = { ...(window.__cinaScenesHydrated || {}), [filmId]: true };
        window.SCRIPT_SCENES = savedScenes;
      }
      const savedCast = plRead("cina:cast:" + filmId, null);
      if (Array.isArray(savedCast) && savedCast.length > 0 && !window.__cinaCastHydrated?.[filmId]) {
        window.__cinaCastHydrated = { ...(window.__cinaCastHydrated || {}), [filmId]: true };
        window.CHARACTERS = savedCast;
      }

      const bible = window.FILM_BIBLE || {};
      const scriptData = plRead("cina:scriptData", null);
      const scenes = window.SCRIPT_SCENES || [];
      const chars = window.CHARACTERS || [];
      const lockedCast = chars.filter(c => (c.training || 0) >= 80 || c.licensed).length;

      const board = plRead("cina:board-v2", null);
      const frames = board ? Object.values(board.framesByScene || {}).flat() : (window.STORYBOARD || []);
      const drafts = frames.filter(f => f.status === "draft").length;
      const approved = frames.filter(f => f.status === "approved").length;
      const rendered = frames.filter(f => f.status === "rendered").length;

      const cutPath = (() => { try { return localStorage.getItem("cina:cut-path") || "main"; } catch (_) { return "main"; } })();
      const edTracks = plRead("cina:editor-tracks:" + cutPath, null);
      const edV1 = Array.isArray(edTracks)
        ? (edTracks.find(t => t.id === "V1")?.clips || [])
        : (window.TIMELINE_CLIPS?.V1 || []);
      const edA3 = Array.isArray(edTracks)
        ? (edTracks.find(t => t.id === "A3")?.clips || [])
        : (window.TIMELINE_CLIPS?.A3 || []);
      const edV2 = Array.isArray(edTracks)
        ? (edTracks.find(t => t.id === "V2")?.clips || [])
        : (window.TIMELINE_CLIPS?.V2 || []);
      const allEdClips = Array.isArray(edTracks)
        ? edTracks.flatMap(t => t.clips || [])
        : [...edV1, ...edA3, ...edV2];
      const cutDuration = allEdClips.reduce((m, c) => Math.max(m, (c.start || 0) + (c.dur || 0)), 0);

      const masterLock = plRead("cina:master-lock:" + filmId, null);
      const deliv = plRead("cina:deliver:" + filmId, {});
      const delivReady = Object.values(deliv).filter(Boolean).length;
      const settlements = plRead("cina:chain:settlements", []).length;
      const forkChoices = plRead("cina:fork-ledger", []).length;
      const sales = plRead("cina:commerce:ledger", []).length;

      const dropQueue = plRead("cina:editor-drop-queue", []);

      return {
        filmId,
        dna: {
          title: bible.title || "LAST LIGHT",
          rulesCount: (bible.rules || []).length,
          done: Boolean(bible.logline && (bible.rules || []).length > 0),
          sub: `${(bible.rules || []).length} rules · ${bible.director_dna?.length || 0} DNA refs`,
          badge: `${(bible.rules || []).length}`,
        },
        write: {
          scenesCount: scenes.length,
          hasLogline: Boolean(scriptData?.logline),
          done: scenes.length > 0,
          sub: `${scenes.length} scenes · ${(scenes.reduce((a, s) => a + (Number(s.pages) || 0), 0)).toFixed(1)} pp`,
          badge: `${scenes.length}`,
        },
        cast: {
          total: chars.length,
          locked: lockedCast,
          done: lockedCast > 0 || chars.length > 0,
          sub: lockedCast ? `${lockedCast}/${chars.length} likenesses locked` : `${chars.length} performers ready`,
          badge: `${chars.length}`,
        },
        stills: {
          total: frames.length,
          drafts,
          approved,
          rendered,
          done: frames.length > 0 && drafts === 0,
          sub: frames.length ? (drafts ? `${drafts} drafts · ${approved} approved` : `${frames.length} stills ready`) : "Frame key stills",
          badge: `${frames.length}`,
        },
        motion: {
          rendered,
          total: Math.max(frames.length, rendered),
          done: rendered > 0,
          sub: rendered ? `${rendered}/${Math.max(frames.length, rendered)} shots rendered` : "Render motion shots",
          badge: rendered ? `${rendered}` : "0",
        },
        edit: {
          v1Count: edV1.length,
          a3Count: edA3.length,
          v2Count: edV2.length,
          queuedCount: Array.isArray(dropQueue) ? dropQueue.length : 0,
          duration: Math.round(cutDuration),
          locked: Boolean(masterLock?.locked),
          masterLock,
          done: Boolean(masterLock?.locked) || (edV1.length > 0 && rendered > 0),
          sub: masterLock?.locked
            ? `${masterLock.name || "Cut"} locked (${Math.round(masterLock.duration || cutDuration)}s)`
            : `${edV1.length} cuts · ${Math.round(cutDuration)}s`,
          badge: `${edV1.length}`,
        },
        ship: {
          delivReady,
          settlements,
          locked: Boolean(masterLock?.locked),
          done: settlements + forkChoices + sales > 0 || Boolean(masterLock?.locked),
          sub: settlements ? `${settlements} splits live` : (masterLock?.locked ? "Master ready to ship" : "Lock cut & configure splits"),
          badge: masterLock?.locked ? "READY" : `${delivReady}`,
        },
      };
    },
    propagateDna(bible) {
      if (!bible) return;
      const filmId = this.getFilmId();
      window.FILM_BIBLE = { ...(window.FILM_BIBLE || {}), ...bible };
      plWrite("cina:dna:" + filmId, window.FILM_BIBLE);
      if (window.STUDIO?.setState) {
        try {
          window.STUDIO.setState(s => ({
            ...s,
            workspace: {
              ...s.workspace,
              title: bible.title || s.workspace?.title,
              logline: bible.logline || s.workspace?.logline,
            },
          }));
        } catch (_) {}
      }
      window.dispatchEvent(new CustomEvent("cina:dna-updated", { detail: window.FILM_BIBLE }));
      this.emit({ step: "dna" });
    },
    boardScene({ scene, openBoard = true } = {}) {
      if (!scene) return 0;
      const board = plRead("cina:board-v2", null) || {
        scenes: [
          { id: "sc12", number: "12", title: "Apartment, after the fight", color: "var(--c-ink-4)" },
          { id: "sc13", number: "13", title: "Stairwell descent", color: "var(--c-ink-4)" },
          { id: "sc14", number: "14", title: "Street, rain begins", color: "var(--c-ink-4)" },
          { id: "sc15", number: "15", title: "Diner, last booth", color: "var(--c-ink-3)" },
        ],
        framesByScene: {},
        activeSceneId: "sc14",
      };
      const sid = scene.id || ("sc" + (scene.number || Date.now()));
      if (!board.scenes.some(s => s.id === sid)) {
        board.scenes.push({
          id: sid,
          number: String(scene.number || board.scenes.length + 12),
          title: scene.location || scene.slug || `Scene ${scene.number || ""}`,
          color: "var(--c-amber)",
        });
      }
      const existing = board.framesByScene[sid] || [];
      let addedCount = 0;
      if (existing.length === 0) {
        const actions = (scene.elements || []).filter(e => e.kind === "action" || e.kind === "dialogue").map(e => e.text).filter(Boolean);
        const presets = [
          { type: "WS", lens: "24mm", duration: "0:05", thumb: "wide-rain", desc: actions[0] || `${scene.slug}. Wide establishing beat.` },
          { type: "MS", lens: "50mm", duration: "0:04", thumb: "medium-bench", desc: actions[1] || actions[0] || `Medium coverage inside ${scene.location || "scene"}.` },
          { type: "CU", lens: "85mm", duration: "0:03", thumb: "close-hands", desc: actions[2] || `Close reaction beat — Scene ${scene.number}.` },
        ];
        board.framesByScene[sid] = presets.map((p, idx) => ({
          id: `sb-${sid}-${Date.now()}-${idx}`,
          sceneId: sid,
          scene: String(scene.number || "14"),
          shot: String.fromCharCode(65 + idx),
          type: p.type,
          lens: p.lens,
          duration: p.duration,
          status: "draft",
          style: "cinema",
          thumb: p.thumb,
          desc: p.desc,
          seed: 7000 + Math.floor(Math.random() * 2500),
          history: [],
        }));
        addedCount = presets.length;
      }
      board.activeSceneId = sid;
      plWrite("cina:board-v2", board);
      window.dispatchEvent(new CustomEvent("cina:board-sync", { detail: { sceneId: sid, board, addedCount } }));
      this.emit({ step: "stills", sceneId: sid });
      if (openBoard) this.go("board");
      return addedCount;
    },
    sendShotToVideo({ frame, scene, photo, grade, mode = "replace" } = {}) {
      if (!frame) return;
      const perf = this.getActivePerformer();
      const req = {
        frameId: frame.id,
        sceneId: frame.sceneId || scene?.id,
        sceneNum: scene?.number || frame.scene,
        shotLabel: `${frame.scene || scene?.number || "14"}${frame.shot || "A"}`,
        shot: frame.shot || "A",
        type: frame.type || "MS",
        lens: frame.lens || "35mm",
        duration: frame.duration || "0:04",
        prompt: frame.desc || "",
        style: frame.style || "cinema",
        mode,
        photo,
        grade,
        performerName: perf?.name || null,
        performerId: perf?.id || null,
      };
      window.__cinaGenReq = req;
      plWrite("cina:gen-req", req);
      window.dispatchEvent(new CustomEvent("cina:generate-shot", { detail: req }));
      this.emit({ step: "motion", req });
      this.go("generate");
    },
    sendAssetToEdit(asset = {}) {
      const payload = {
        id: asset.id || ("drop-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6)),
        kind: asset.kind || "shot", // shot | audio | title
        label: asset.label || asset.shot || "Shot",
        shot: asset.shot || asset.label || "TAKE",
        thumb: asset.thumb || String(asset.shot || "wide-rain"),
        photo: asset.photo || null,
        videoUrl: asset.videoUrl || null,
        audioUrl: asset.audioUrl || null,
        dur: Math.max(1, parseFloat(asset.dur || asset.duration) || 4),
        engine: asset.engine || "Studio",
        seed: asset.seed || Math.floor(1000 + Math.random() * 8999),
        prompt: asset.prompt || "",
        color: asset.color || null,
        at: Date.now(),
      };
      const q = plRead("cina:editor-drop-queue", []);
      const nextQ = [...(Array.isArray(q) ? q : []), payload].slice(-12);
      plWrite("cina:editor-drop-queue", nextQ);
      plWrite("cina:editor-drop", payload);
      window.dispatchEvent(new CustomEvent("cina:editor-drop", { detail: payload }));
      this.emit({ step: "edit", asset: payload });
      if (asset.openEdit) this.go("editor");
      return payload;
    },
    consumeEditorQueue() {
      const q = plRead("cina:editor-drop-queue", []);
      const legacy = plRead("cina:editor-drop", null);
      const items = Array.isArray(q) ? [...q] : [];
      if (legacy && legacy.at && Date.now() - legacy.at < 10 * 60 * 1000) {
        if (!items.some(x => x.id === legacy.id && x.shot === legacy.shot && x.at === legacy.at)) {
          items.push(legacy);
        }
      }
      try {
        localStorage.removeItem("cina:editor-drop-queue");
        localStorage.removeItem("cina:editor-drop");
      } catch (_) {}
      return items.filter(x => !x.at || Date.now() - x.at < 30 * 60 * 1000);
    },
    lockCutForShip({ name = "Locked Cut", duration = 0, shotsCount = 0, openShip = true } = {}) {
      const filmId = this.getFilmId();
      const lock = {
        locked: true,
        name,
        duration: Math.round(duration || 0),
        shotsCount,
        lockedAt: Date.now(),
      };
      plWrite("cina:master-lock:" + filmId, lock);
      this.emit({ step: "ship", lock });
      if (openShip) this.go("mint");
      return lock;
    },
    registerSendNext(views, handler) {
      const list = Array.isArray(views) ? views : [views];
      list.forEach(v => _sendNextRegistry.set(v, handler));
      return () => {
        list.forEach(v => {
          if (_sendNextRegistry.get(v) === handler) _sendNextRegistry.delete(v);
        });
      };
    },
    getNextAction(activeView) {
      if (["chat", "pipeline", "memory", "autopilot"].includes(activeView)) {
        return { label: "START · 01 DNA →", target: "bible", title: "Begin production at 01 DNA" };
      }
      if (activeView === "mint") {
        return { label: "SEND NEXT · DELIVER →", target: "deliver", title: "Advance from Splits & Mint to Deliver & Festival" };
      }
      if (activeView === "deliver") {
        return { label: "SEND NEXT · PREMIERE →", target: "watch", title: "Advance to Live Premiere summary" };
      }
      if (activeView === "watch") {
        return { label: "▶ WATCH PREMIERE", target: "__watch", title: "Open film live on Cina Watch" };
      }
      const curIdx = STATIONS.findIndex(s => s.views.includes(activeView));
      const nextSt = curIdx >= 0 && curIdx < STATIONS.length - 1 ? STATIONS[curIdx + 1] : null;
      if (nextSt) {
        return {
          label: `SEND NEXT · ${nextSt.n} ${nextSt.label.toUpperCase()} →`,
          target: nextSt.entry,
          title: `Sync & send current state to Step ${nextSt.n} · ${nextSt.label}`,
        };
      }
      return { label: "START · 01 DNA →", target: "bible", title: "Go to 01 DNA" };
    },
    sendNext(activeView) {
      const action = this.getNextAction(activeView);
      const handler = _sendNextRegistry.get(activeView);
      if (typeof handler === "function") {
        try {
          const handled = handler(action);
          if (handled !== false) return;
        } catch (_) {}
      }
      // Fallback orchestration when panel handler is absent
      if (action.target === "__watch") {
        window.open("index.html#/", "_self");
        return;
      }
      if (activeView === "bible") {
        this.propagateDna(this.hydrateDna());
        window.toast?.({ title: "01 DNA → 02 SCRIPT", text: "Film DNA & rules synced to Script & Crew.", kind: "good" });
      } else if (["script", "episodes"].includes(activeView)) {
        const scenes = this.loadScenes();
        this.saveScenes(scenes);
        if (scenes[0]) this.boardScene({ scene: scenes[0], openBoard: false });
        window.toast?.({ title: "02 SCRIPT → 03 CAST", text: `${scenes.length} scenes & characters synced forward.`, kind: "good" });
      } else if (activeView === "vault") {
        const chars = this.loadCast();
        if (chars[0]) this.setActivePerformer(chars[0]);
        window.toast?.({ title: "03 CAST → 04 STILLS", text: "Performer continuity attached to 04 Stills.", kind: "good" });
      } else if (activeView === "board") {
        const board = plRead("cina:board-v2", null);
        const frames = board ? (board.framesByScene[board.activeSceneId] || Object.values(board.framesByScene || {}).flat()) : (window.STORYBOARD || []);
        const pick = frames.find(f => f.status === "approved") || frames[0];
        if (pick) {
          this.sendShotToVideo({ frame: pick });
          window.toast?.({ title: "04 STILLS → 05 VIDEO", text: `Shot ${pick.scene}${pick.shot} carried into 05 Video.`, kind: "good" });
          return;
        }
      } else if (["generate", "branch"].includes(activeView)) {
        const req = window.__cinaGenReq || plRead("cina:gen-req", null);
        this.sendAssetToEdit({
          kind: "shot",
          shot: req?.shotLabel || "14E",
          photo: req?.photo || null,
          dur: 6,
          engine: "Veo 3",
          prompt: req?.prompt || "",
          openEdit: true,
        });
        window.toast?.({ title: "05 VIDEO → 06 EDIT", text: "Shot queued on Timeline V1.", kind: "good" });
        return;
      } else if (["editor", "cuts", "score", "titles", "dock"].includes(activeView)) {
        const s = this.getSummary();
        this.lockCutForShip({ name: "Master Cut", duration: s.edit?.duration || 42, shotsCount: s.edit?.v1Count || 0, openShip: true });
        window.toast?.({ title: "06 EDIT → 07 SHIP", text: "Master cut locked & handed to 07 Ship.", kind: "good" });
        return;
      }
      this.go(action.target);
    },
  };

  window.CinaPipeline = CinaPipeline;
  window.CinaStudioAI = {
    authFetch,
    StudioLiveRehearsal,
    StudioCloudVault,
    StudioLocationScoutTab,
    StudioVoiceSlateButton,
    StudioFrameLabModal,
  };
})();
