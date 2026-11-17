// chat.jsx — Director Chat panel (the hero surface)

const { useState: useStateC, useRef: useRefC, useEffect: useEffectC } = React;

function ChatMessage({ msg }) {
  if (msg.who === "user") {
    return (
      <div style={{ display: "flex", gap: 14, padding: "14px 32px" }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "var(--c-panel-3)", border: "1px solid var(--c-line-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--c-ink-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 600,
          flexShrink: 0,
        }}>EV</div>
        <div style={{ flex: 1, paddingTop: 4 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)" }}>You</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{msg.time}</span>
          </div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.55, textWrap: "pretty" }}>
            {msg.text}
          </div>
        </div>
      </div>
    );
  }

  // Cina / agent message
  return (
    <div style={{
      display: "flex", gap: 14, padding: "18px 32px",
    }}>
      <CinaBadge size={28}/>
      <div style={{ flex: 1, paddingTop: 2, maxWidth: 720 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
          <span className="t-display" style={{ fontSize: "var(--fs-body)", fontStyle: "italic", color: "var(--c-amber)", fontWeight: 500 }}>Cina</span>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{msg.time}</span>
        </div>

        {msg.scene && (
          <div style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginBottom: 10,
            opacity: 0.9, textWrap: "pretty",
          }}>
            {msg.scene}
          </div>
        )}

        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.6, whiteSpace: "pre-wrap", textWrap: "pretty" }}>
          {msg.text}
        </div>

        {msg.actions && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
            {msg.actions.map((a, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "4px 0",
                fontSize: "var(--fs-body)", color: "var(--c-ink-3)",
              }}>
                <AgentBadge agent={a.agent} size={12}/>
                <span style={{ flex: 1, lineHeight: 1.5 }}>{a.text}</span>
              </div>
            ))}
          </div>
        )}

        {msg.diff && (
          <div style={{
            marginTop: 12, padding: "10px 14px",
            background: "var(--c-panel-2)", border: "1px solid var(--c-line)",
            borderRadius: "var(--r-md)",
            display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
          }}>
            {msg.diff.removed.map((s, i) => (
              <span key={i} style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                color: "var(--c-blood-l)",
                textDecoration: "line-through",
                textDecorationThickness: 1,
              }}>− {s}</span>
            ))}
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginLeft: "auto" }}>
              {msg.diff.kept} shots remain
            </span>
          </div>
        )}

        {msg.clip && <ChatClip clip={msg.clip}/>}

        {msg.render && (
          <div style={{ marginTop: 12, padding: "11px 14px", background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: msg.render.pct != null ? 8 : 0 }}>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" }}>{msg.render.label}</span>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: msg.render.status === "DONE" ? "var(--c-good)" : "var(--c-amber)" }}>{msg.render.status}</span>
            </div>
            {msg.render.pct != null && (
              <div style={{ height: 3, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                <div style={{ width: `${msg.render.pct}%`, height: "100%", background: "var(--c-amber)" }}/>
              </div>
            )}
            <button className="btn btn-ghost" style={{ marginTop: 10, fontSize: "var(--fs-label)" }} onClick={() => window.dispatchEvent(new CustomEvent("cina:setView", { detail: "generate" }))}>
              <Icon name="play" size={11}/> Open render floor
            </button>
          </div>
        )}

        {msg.suggestions && (
          <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {msg.suggestions.map((s, i) => (
              <button key={i}
                onClick={() => msg.onSuggestion && msg.onSuggestion(s)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--c-line-2)",
                  borderRadius: 999,
                  padding: "4px 12px",
                  fontSize: "var(--fs-body)",
                  color: "var(--c-ink-2)",
                  cursor: "pointer",
                  transition: "all .14s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--c-amber)"; e.currentTarget.style.color = "var(--c-ink)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--c-line-2)"; e.currentTarget.style.color = "var(--c-ink-2)"; }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Inline video-proof clip card + lightbox (DIR 1).
function ChatClip({ clip }) {
  const [open, setOpen] = useStateC(false);
  const FT = window.FrameThumb;
  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        marginTop: 12, width: "min(420px, 100%)", padding: 0, cursor: "pointer",
        border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)", overflow: "hidden",
        background: "var(--c-panel-2)", textAlign: "left", display: "block",
      }}>
        <span style={{ position: "relative", display: "block", aspectRatio: "16/9", background: clip.color || tkc("panel"), overflow: "hidden" }}>
          {FT ? <FT kind={clip.thumb} usePhoto/> : null}
          <span style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,10,.7), transparent 55%)" }}/>
          <span style={{
            position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
            width: 44, height: 44, borderRadius: "50%", background: "rgba(14,12,16,.7)", backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill={tkc("white")}><path d="M8 5v14l11-7z"/></svg>
          </span>
          <span className="t-mono" style={{ position: "absolute", left: 11, bottom: 9, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.85)" }}>{clip.dur || "0:08"}</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px" }}>
          <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{clip.label}</span>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>{clip.meta || "PROOF"}</span>
        </span>
      </button>
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 9600, background: "rgba(6,5,7,.86)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 32,
        }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "min(880px, 100%)", borderRadius: "var(--r-3)", overflow: "hidden", border: "1px solid var(--c-line-2)", background: "var(--c-panel)" }}>
            <div style={{ position: "relative", aspectRatio: "16/9", background: clip.color || tkc("panel"), overflow: "hidden" }}>
              {FT ? <FT kind={clip.thumb} usePhoto/> : null}
              <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 64, height: 64, borderRadius: "50%", background: "rgba(14,12,16,.72)", border: "1px solid rgba(255,255,255,.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill={tkc("white")}><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px" }}>
              <div>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{clip.label}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 3 }}>{clip.meta || "RENDER PROOF"} · {clip.dur || "0:08"}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent("cina:setView", { detail: "editor" })); }} style={{ fontSize: "var(--fs-body)" }}>Open in editor</button>
                <button className="btn btn-primary" onClick={() => setOpen(false)} style={{ fontSize: "var(--fs-body)" }}>Approve take</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ChatPanel() {
  const [messages, setMessages] = useStateC(window.CHAT_SEED);
  const [input, setInput] = useStateC("");
  const [thinking, setThinking] = useStateC(false);
  const [activeAgents, setActiveAgents] = useStateC([]);
  const scrollRef = useRefC();

  useEffectC(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  // Action shortcuts that suggestion chips can trigger directly.
  const SHORTCUT_VIEWS = {
    "open vault": "vault",      "vault": "vault",
    "run it": "generate",       "render variations": "generate",
    "render": "generate",       "queue": "generate",
    "show 7 first": "board",    "open board": "board",
    "open script": "script",    "show the curve": "editor",
    "compare klute": "editor",  "apply lut": "editor",
    "lock current": "vault",    "defer to lock": "script",
    "open editor": "editor",    "open generate": "generate",
  };

  const sendText = (raw) => {
    const text = (raw || "").trim();
    if (!text) return;

    // Slash-commands (DIR 2) — run a concrete action, echo a system line.
    if (text[0] === "/") {
      const [cmd, ...rest] = text.slice(1).split(/\s+/);
      const arg = rest.join(" ");
      const cmds = {
        render:  () => { window.dispatchEvent(new CustomEvent("cina:setView", { detail: "generate" })); return "Render floor open — queue your shots."; },
        cast:    () => { window.dispatchEvent(new CustomEvent("cina:setView", { detail: "vault" })); return "Vault open — cast and dress your performers."; },
        tighten: () => "Tightening — I'll pull the two softest beats and show you the diff.",
        compare: () => { window.dispatchEvent(new CustomEvent("cina:setView", { detail: "cuts" })); return "Cuts open — compare versions side by side."; },
        board:   () => { window.dispatchEvent(new CustomEvent("cina:setView", { detail: "board" })); return "Storyboard open."; },
        score:   () => { window.dispatchEvent(new CustomEvent("cina:setView", { detail: "score" })); return "Score room open."; },
      };
      const run = cmds[cmd.toLowerCase()];
      const echo = run ? run() : `Unknown command: /${cmd}. Try /render /cast /tighten /compare /board /score.`;
      setMessages(prev => [...prev,
        { id: `u${Date.now()}`, who: "user", time: now(), text },
        { id: `c${Date.now() + 1}`, who: "cina", agent: "director", time: now(), text: echo },
      ]);
      setInput("");
      return;
    }

    // If it's a known view-jump shortcut, jump and post a quick echo.
    const view = SHORTCUT_VIEWS[text.toLowerCase()];
    if (view) {
      window.dispatchEvent(new CustomEvent("cina:setView", { detail: view }));
      return;
    }

    const newMsg = { id: `m${Date.now()}`, who: "user", time: now(), text };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setThinking(true);
    setActiveAgents(["director"]);
    // Drive the Cina orb: thinking while the reply is composed.
    if (window.CinaVoice) window.CinaVoice.think();

    setTimeout(() => setActiveAgents(["director", "writer"]), 600);
    setTimeout(() => setActiveAgents(["director", "writer", "visual"]), 1200);

    let settled = false;
    const finish = (reply) => {
      if (settled) return; settled = true;
      reply.onSuggestion = (s) => sendText(s);
      setMessages(prev => [...prev, reply]);
      setThinking(false);
      setActiveAgents([]);
      // Orb speaks the reply aloud (if voice is enabled) or returns to idle.
      if (window.CinaVoice) { if (window.CinaVoice.enabled) window.CinaVoice.speak(reply.text || ""); else window.CinaVoice.idle(); }
    };

    // Try real Gemini Writers' Room /api/ai/chat; fall back to local director voice if unavailable.
    const canned = generateReply(text);
    // Clip/render replies are structured — never route them through the model.
    if (canned.clip || canned.render) { finish(canned); return; }
    const ctx = directorContext();
    const aiFetch = window.CinaStudioAI && window.CinaStudioAI.authFetch ? window.CinaStudioAI.authFetch : fetch;
    aiFetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        tier: "argon",
        systemInstruction: `You are Cina, the AI co-director inside Cina Studio. Speak like a seasoned, concrete film director in 2-3 crisp sentences. ${ctx}`,
        history: messages.slice(-8).map(m => ({ role: m.who === "user" ? "user" : "model", content: m.text || "" })),
      }),
    })
      .then(r => r.ok ? r.json() : Promise.reject(new Error("AI chat offline")))
      .then(data => {
        const replyText = (data && (data.reply || data.text || "")).trim();
        finish(replyText ? { ...canned, id: `m${Date.now() + 1}`, text: replyText } : canned);
      })
      .catch(() => {
        if (window.claude && window.claude.complete) {
          const prompt = `You are Cina, the AI director inside a filmmaking studio. You speak like a seasoned, spare film director — concrete, a little poetic, never corporate. ${ctx}\n\nThe filmmaker says: "${text}"\n\nReply in 2-3 sentences with a specific creative call (a cut, a lighting move, a casting or render decision). No preamble, no lists.`;
          Promise.race([
            window.claude.complete(prompt),
            new Promise((_, rej) => setTimeout(() => rej(0), 9000)),
          ]).then(r => {
            const t2 = (typeof r === "string" ? r : (r && r.text) || "").trim();
            finish(t2 ? { ...canned, id: `m${Date.now() + 1}`, text: t2 } : canned);
          }).catch(() => finish(canned));
        } else {
          finish(canned);
        }
      });
  };

  const send = () => sendText(input);

  // Listen for external prompts (rails dispatch these)
  useEffectC(() => {
    const onPrompt = (e) => {
      const t = e.detail || "";
      setInput(t);
      // Auto-send if dispatched with shouldSend
      if (e.detail && e.detail.send) sendText(e.detail.text || "");
    };
    const onPromptText = (e) => { setInput(e.detail || ""); };
    const onPromptSend = (e) => { sendText(e.detail || ""); };
    window.addEventListener("cina:promptText", onPromptText);
    window.addEventListener("cina:promptSend", onPromptSend);
    return () => {
      window.removeEventListener("cina:promptText", onPromptText);
      window.removeEventListener("cina:promptSend", onPromptSend);
    };
  }, []);

  // Bind onSuggestion to seed messages too
  useEffectC(() => {
    setMessages(prev => prev.map(m => m.suggestions && !m.onSuggestion ? { ...m, onSuggestion: (s) => sendText(s) } : m));
  }, []);

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const QUICK_PROMPTS = [
    { icon: "wand",   label: "Tighten Act 2",         text: "Tighten Act 2 — pull two beats from the rooftop monologue." },
    { icon: "film",   label: "Render queued shots",   text: "Run it" },
    { icon: "actor",  label: "Cast brother role",     text: "Open Vault" },
    { icon: "spark",  label: "Compare to Klute",      text: "Compare Klute" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* Messages — no header, content does the talking */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", minHeight: 0, paddingTop: 8 }}>
        {messages.map(m => <ChatMessage key={m.id} msg={m}/>)}
        {thinking && <ThinkingRow agents={activeAgents}/>}
      </div>

      {/* Composer — single rounded pill, floats on the surface */}
      <div style={{ padding: "12px 32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        {/* Quick prompts */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 760, width: "100%", justifyContent: "center" }}>
          {QUICK_PROMPTS.map((q, i) => (
            <button key={i}
              onClick={() => sendText(q.text)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "transparent",
                border: "1px solid var(--c-line-2)",
                borderRadius: 999,
                padding: "5px 11px",
                fontSize: "var(--fs-body)", color: "var(--c-ink-3)",
                cursor: "pointer", transition: "all .14s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--c-amber)"; e.currentTarget.style.color = "var(--c-ink)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--c-line-2)"; e.currentTarget.style.color = "var(--c-ink-3)"; }}
            >
              <Icon name={q.icon} size={11}/>
              {q.label}
            </button>
          ))}
        </div>

        <div style={{
          width: "100%", maxWidth: 760,
          display: "flex", alignItems: "flex-end", gap: 10,
          background: "var(--c-panel-2)",
          border: "1px solid var(--c-line-2)",
          borderRadius: "var(--r-3)",
          padding: "10px 10px 10px 16px",
          boxShadow: "0 12px 40px rgba(0,0,0,.35)",
        }}>
          <textarea
            data-cina-chat-input
            className="cina-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Direct the scene…"
            rows={1}
            style={{
              flex: 1, resize: "none",
              background: "transparent",
              border: "none",
              padding: "8px 0",
              fontSize: "var(--fs-body)", lineHeight: 1.55,
              color: "var(--c-ink)",
              outline: "none",
              minHeight: 22, maxHeight: 180,
              fontFamily: "var(--f-sans)",
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className={input.trim() ? "btn btn-primary" : "btn btn-icon"}
            style={{ height: 32, width: 32, padding: 0, justifyContent: "center", opacity: input.trim() ? 1 : 0.5 }}
            title="Send"
          >
            <Icon name="send" size={12}/>
          </button>
        </div>
      </div>
    </div>
  );
}

function ThinkingRow({ agents }) {
  return (
    <div style={{
      display: "flex", gap: 12, padding: "16px 24px",
      borderBottom: "1px solid var(--c-line)",
      background: "linear-gradient(90deg, rgba(var(--accent-rgb),.04) 0%, transparent 40%)",
    }}>
      <CinaBadge size={28}/>
      <div style={{ flex: 1, paddingTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span className="t-display" style={{ fontSize: "var(--fs-body)", fontStyle: "italic", color: "var(--c-amber)" }}>
            Cina is composing
          </span>
          <span className="dots t-mono" style={{ color: "var(--c-amber)" }}>···</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {agents.map(a => {
            const ag = window.AGENTS.find(x => x.id === a);
            return (
              <div key={a} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 8px 4px 4px", background: "var(--c-panel-2)",
                border: "1px solid var(--c-line)", borderRadius: "var(--r-3)",
                fontSize: "var(--fs-label)", color: "var(--c-ink-2)",
              }}>
                <AgentBadge agent={a} size={16}/>
                {ag?.name} working
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .dots { animation: dots-blink 1.4s ease-in-out infinite; }
        @keyframes dots-blink { 0%,100%{opacity:.3} 50%{opacity:1} }
      `}</style>
    </div>
  );
}

function now() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

function generateReply(prompt) {
  const lower = prompt.toLowerCase();
  let scene, text, suggestions;

  // "show me shot 14 take 3" → inline clip proof (DIR 1)
  const shotMatch = lower.match(/shot\s*(\d+)(?:.*?take\s*(\d+))?/);
  if (shotMatch && /(show|see|play|proof|pull up|render of|look at)/.test(lower)) {
    const shot = shotMatch[1], take = shotMatch[2] || "1";
    const kinds = ["last-light", "diner", "rooftop", "sodium", "night-drive"];
    return {
      id: `m${Date.now() + 1}`, who: "cina", agent: "director", time: now(),
      scene: "Pulling the render.",
      text: `Here's shot ${shot}, take ${take}. The grade's holding — approve it or send it back for another pass.`,
      clip: { label: `Shot ${shot} · Take ${take}`, meta: "RENDER PROOF", dur: "0:0" + (2 + (+shot % 7)), thumb: kinds[(+shot) % kinds.length], color: tkc("on-amber") },
      suggestions: ["Approve take", "Another pass", "Compare takes"],
    };
  }

  if (lower.includes("light") || lower.includes("color") || lower.includes("look")) {
    scene = "The lamp hums. A car door slams outside.";
    text = "Hold the sodium. Push white balance 200K cooler in everything that isn't the practical. Warmth becomes a place.";
    suggestions = ["Apply LUT", "Show the curve", "Compare Klute"];
  } else if (lower.includes("cut") || lower.includes("trim") || lower.includes("shorter")) {
    scene = "Forty pages too long. Like every first draft.";
    text = "Tell me which beat we're protecting. We don't trim for length — we trim for pressure.";
    suggestions = ["Cut three", "Show 7 first", "Defer to lock"];
  } else if (lower.includes("actor") || lower.includes("character") || lower.includes("voss") || lower.includes("maren")) {
    scene = "The room goes quiet.";
    text = "Open the Vault. The hands are the tell — they need to shake on cue.";
    suggestions = ["Open Vault", "Render variations", "Lock current"];
  } else if (lower.includes("convert") || lower.includes("video") || lower.includes("render")) {
    scene = "The render queue lights up.";
    text = "Motion to Veo-3. Identity to Kling. Dialogue to Runway. Fourteen minutes, twenty-two credits.";
    suggestions = ["Run it", "Hold for review", "Adjust"];
  } else {
    scene = "The room listens.";
    text = "Walk me through it. I want the why before the what.";
    suggestions = ["Structural", "Tonal", "Both"];
  }

  return {
    id: `m${Date.now() + 1}`, who: "cina", agent: "director", time: now(),
    scene, text, suggestions,
  };
}

// Compact project context so model replies reference the real slate.
function directorContext() {
  try {
    const films = (window.PROJECTS || []).filter(f => f).slice(0, 4);
    const active = films.find(f => f.status === "in production") || films[0];
    const bits = [];
    if (active) bits.push(`The film in production is "${active.title}" (${active.genre || "drama"}, ${active.status || "in production"}).`);
    const chars = (window.CHARACTERS || []).slice(0, 3).map(c => c.name).join(", ");
    if (chars) bits.push(`Key performers: ${chars}.`);
    return bits.join(" ");
  } catch (e) { return ""; }
}

Object.assign(window, { ChatPanel });
