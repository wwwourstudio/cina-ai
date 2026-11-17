// cina-cmdk.jsx — Global command palette for Cina Studio.
// ⌘K / Ctrl-K opens. Fuzzy search. Jumps to any view, action, project,
// agent, or recent activity. Uses cina:setView event to switch views.

const { useState: ucS, useEffect: ucE, useMemo: ucM, useRef: ucR } = React;

function CinaCommandPalette() {
  const [open, setOpen] = ucS(false);
  const [q, setQ] = ucS("");
  const [sel, setSel] = ucS(0);
  const inputRef = ucR(null);

  // ⌘K / Ctrl-K toggle, Esc closes
  ucE(() => {
    const onKey = (e) => {
      const t = e.target;
      const inField = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
        setQ(""); setSel(0);
        return;
      }
      if (e.key === "Escape" && open) { setOpen(false); return; }
      // "/" as quick-open when not in a field
      if (e.key === "/" && !inField && !open) {
        e.preventDefault();
        setOpen(true); setQ(""); setSel(0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Auto-focus input on open
  ucE(() => {
    if (open) {
      setTimeout(() => inputRef.current && inputRef.current.focus(), 30);
    }
  }, [open]);

  // ─── Command catalog ─────────────────────────────────────────────
  const cmds = ucM(() => {
    const out = [];
    const goView = (v) => () => {
      window.dispatchEvent(new CustomEvent("cina:setView", { detail: v }));
      setOpen(false);
    };

    // Workflow stages
    const views = [
      { id: "chat",      label: "Director",  hint: "Ask Cina anything",     icon: "spark"  },
      { id: "pipeline",  label: "Pipeline",  hint: "Production overview",   icon: "rows"   },
      { id: "bible",     label: "DNA / Bible", hint: "World, characters, tone", icon: "book"  },
      { id: "script",    label: "Script",    hint: "Scenes, beats, dialogue", icon: "doc"   },
      { id: "board",     label: "Board",     hint: "Storyboards per scene", icon: "grid"   },
      { id: "vault",     label: "Vault",     hint: "Cast & wardrobe",       icon: "user"   },
      { id: "generate",  label: "Generate",  hint: "Render shots",          icon: "spark"  },
      { id: "editor",    label: "Editor",    hint: "Cut, score, color",     icon: "scissors" },
      { id: "score",     label: "Score",     hint: "Music & sound",         icon: "music"  },
      { id: "mint",      label: "Mint",      hint: "Tokenize the master",   icon: "diamond" },
      { id: "titles",    label: "Titles",    hint: "Release & monetize",    icon: "tag"    },
      { id: "memory",    label: "Memory",    hint: "Project archive",       icon: "archive"},
      { id: "autopilot", label: "Autopilot", hint: "Cina runs the project", icon: "robot"  },
    ];
    views.forEach(v => out.push({
      id: `go:${v.id}`,
      kind: "Go to",
      label: v.label,
      hint: v.hint,
      icon: v.icon,
      run: goView(v.id),
      keys: [],
    }));

    // Quick actions
    out.push(
      { id: "act:publish",    kind: "Action", label: "Open Publish wizard",  hint: "Ship master to Watch / mint",  icon: "send",
        run: () => { window.openPublishWizard && window.openPublishWizard(); setOpen(false); }, keys: ["⌘", "P"] },
      { id: "act:shortcuts",  kind: "Action", label: "Show keyboard shortcuts", hint: "All hotkeys",                 icon: "key",
        run: () => { window.setShortcuts && window.setShortcuts(true); setOpen(false); }, keys: ["?"] },
      { id: "act:newfilm",    kind: "Action", label: "New film",             hint: "Spin up a new project",         icon: "plus",
        run: () => { window.dispatchEvent(new CustomEvent("cina:setRoute", { detail: "new" })); setOpen(false); } },
      { id: "act:dashboard",  kind: "Action", label: "Back to slate",        hint: "Project picker",                icon: "home",
        run: () => { window.dispatchEvent(new CustomEvent("cina:setRoute", { detail: "dashboard" })); setOpen(false); } },
      { id: "act:crew",       kind: "Action", label: "Toggle crew drawer",   hint: "Agents & recent activity",      icon: "users",
        run: () => { window.dispatchEvent(new CustomEvent("cina:toggleDrawer")); setOpen(false); } },
      { id: "act:tweaks",     kind: "Action", label: "Open Tweaks panel",    hint: "Density, theme, presets",       icon: "sliders",
        run: () => { window.parent.postMessage({ type: "__activate_edit_mode" }, "*"); setOpen(false); } },
      { id: "act:render",     kind: "Action", label: "Render selected shot", hint: "Send to queue",                 icon: "play",
        run: () => { window.dispatchEvent(new CustomEvent("cina:setView", { detail: "generate" })); setOpen(false); } },
      { id: "act:tour",       kind: "Action", label: "Studio walkthrough",   hint: "Tour every tool on the line",   icon: "spark",
        run: () => {
          const f = (window.PROJECTS || []).find(p => p.id === window.__cinaActiveFilmId);
          window.dispatchEvent(new CustomEvent("cina:setRoute", { detail: "studio" }));
          setTimeout(() => window.dispatchEvent(new CustomEvent("cina:start-tour", { detail: { kind: (f && f.kind) || "movie" } })), 250);
          setOpen(false);
        } },
      { id: "act:export",     kind: "Action", label: "Export current cut",   hint: "Master + delivery files",       icon: "download",
        run: () => { window.dispatchEvent(new CustomEvent("cina:setView", { detail: "editor" })); setOpen(false); } },
    );

    // Projects (each becomes a switch)
    if (window.PROJECTS) {
      window.PROJECTS.forEach(p => out.push({
        id: `proj:${p.id}`,
        kind: "Project",
        label: p.title,
        hint: `${p.format || "Feature"} · ${p.runtime || ""}`.trim(),
        icon: "folder",
        run: () => {
          window.dispatchEvent(new CustomEvent("cina:setProject", { detail: p.id }));
          window.dispatchEvent(new CustomEvent("cina:setRoute", { detail: "studio" }));
          setOpen(false);
        },
      }));
    }

    // Agents
    if (window.AGENTS) {
      window.AGENTS.forEach(a => out.push({
        id: `agent:${a.id}`,
        kind: "Agent",
        label: a.name,
        hint: a.role || "",
        icon: "user",
        run: () => {
          window.dispatchEvent(new CustomEvent("cina:setView", { detail: "chat" }));
          window.dispatchEvent(new CustomEvent("cina:focusAgent", { detail: a.id }));
          setOpen(false);
        },
      }));
    }

    if (window.cinaCrossCommands) out.push(...window.cinaCrossCommands("studio"));

    return out;
  }, [open]);

  // ─── Fuzzy filter ────────────────────────────────────────────────
  const results = ucM(() => {
    if (!q.trim()) {
      // Show core nav + actions when empty
      return cmds.filter(c => c.kind === "Go to" || c.kind === "Action").slice(0, 14);
    }
    const needle = q.toLowerCase();
    const scored = cmds.map(c => {
      const hay = `${c.label} ${c.hint} ${c.kind}`.toLowerCase();
      let score = 0;
      if (hay.startsWith(needle)) score = 100;
      else if (c.label.toLowerCase().includes(needle)) score = 60;
      else if (hay.includes(needle)) score = 30;
      else {
        // letter-by-letter fuzzy
        let i = 0;
        for (const ch of needle) {
          const idx = hay.indexOf(ch, i);
          if (idx === -1) return null;
          i = idx + 1;
        }
        score = 10;
      }
      return { ...c, _score: score };
    }).filter(Boolean);
    scored.sort((a, b) => b._score - a._score);
    return scored.slice(0, 16);
  }, [q, cmds]);

  ucE(() => { setSel(0); }, [q]);

  if (!open) return null;

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(results.length - 1, s + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); const r = results[sel]; if (r) r.run(); }
  };

  // Group results by kind
  const groups = [];
  let lastKind = null;
  results.forEach((r, i) => {
    if (r.kind !== lastKind) { groups.push({ kind: r.kind, items: [] }); lastKind = r.kind; }
    groups[groups.length - 1].items.push({ ...r, _idx: i });
  });

  return (
    <div onClick={() => setOpen(false)} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,.6)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      paddingTop: "12vh",
      animation: "cinaCmdkFade .14s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(640px, 92vw)",
        background: "var(--c-panel)",
        border: "1px solid var(--c-line)",
        borderRadius: "var(--r-3)",
        boxShadow: "0 40px 120px rgba(0,0,0,.6)",
        overflow: "hidden",
        animation: "cinaCmdkRise .18s cubic-bezier(.2,.8,.2,1)",
      }}>
        {/* Search field */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 16px",
          borderBottom: "1px solid var(--c-line)",
        }}>
          <Icon name="search" size={14}/>
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Jump to anywhere · search projects, views, actions, agents…"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "var(--c-ink)", fontSize: "var(--fs-lead)",
              fontFamily: "var(--f-sans)",
            }}
          />
          <span className="t-mono" style={{
            fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em",
            border: "1px solid var(--c-line-2)", padding: "2px 6px", borderRadius: "var(--r-1)",
          }}>ESC</span>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 440, overflowY: "auto", padding: "6px 0" }}>
          {results.length === 0 && (
            <div style={{
              padding: "32px 16px", textAlign: "center",
              color: "var(--c-ink-4)", fontSize: "var(--fs-body)",
            }}>
              No matches for "{q}"
            </div>
          )}

          {groups.map((g, gi) => (
            <div key={gi} style={{ padding: "4px 0" }}>
              <div className="t-mono" style={{
                padding: "6px 16px 4px", fontSize: "var(--fs-label)",
                letterSpacing: ".16em", color: "var(--c-ink-4)",
              }}>{g.kind.toUpperCase()}</div>
              {g.items.map(r => {
                const active = r._idx === sel;
                return (
                  <button
                    key={r.id}
                    onClick={r.run}
                    onMouseEnter={() => setSel(r._idx)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      width: "100%", padding: "9px 16px",
                      background: active ? "var(--c-bg-elev, rgba(255,255,255,.04))" : "transparent",
                      border: "none", textAlign: "left", cursor: "pointer",
                      color: "var(--c-ink)",
                      borderLeft: active ? "2px solid var(--c-amber)" : "2px solid transparent",
                    }}
                  >
                    <span style={{
                      width: 22, height: 22, borderRadius: "var(--r-2)",
                      background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      color: active ? "var(--c-amber)" : "var(--c-ink-3)",
                    }}>
                      <Icon name={r.icon || "dot"} size={11}/>
                    </span>
                    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
                      <span style={{ fontSize: "var(--fs-body)", fontWeight: 500, color: "var(--c-ink)" }}>{r.label}</span>
                      {r.hint && (
                        <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.hint}</span>
                      )}
                    </span>
                    {r.keys && r.keys.length > 0 && (
                      <span style={{ display: "flex", gap: 3 }}>
                        {r.keys.map((k, i) => (
                          <span key={i} className="t-mono" style={{
                            fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
                            border: "1px solid var(--c-line-2)", padding: "1px 5px",
                            borderRadius: "var(--r-1)", minWidth: 16, textAlign: "center",
                          }}>{k}</span>
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          padding: "10px 16px",
          borderTop: "1px solid var(--c-line)",
          fontSize: "var(--fs-label)", color: "var(--c-ink-4)",
          background: "var(--c-bg)",
        }}>
          <span><b style={{ color: "var(--c-ink-3)" }}>↑↓</b> navigate</span>
          <span><b style={{ color: "var(--c-ink-3)" }}>↵</b> select</span>
          <span><b style={{ color: "var(--c-ink-3)" }}>esc</b> close</span>
          <span style={{ flex: 1 }}/>
          <span className="t-mono" style={{ letterSpacing: ".16em" }}>CINA · COMMAND</span>
        </div>
      </div>

      <style>{`
        @keyframes cinaCmdkFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cinaCmdkRise { from { opacity: 0; transform: translateY(-6px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}

window.CinaCommandPalette = CinaCommandPalette;
