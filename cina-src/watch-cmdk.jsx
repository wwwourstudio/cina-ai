// watch-cmdk.jsx — Global command palette for Cina Watch.
// ⌘K / Ctrl-K / "/" opens. Fuzzy search across routes, films, series,
// studios, cast, account actions, and the other surfaces. Uses navigate().

const { useState: uwcS, useEffect: uwcE, useMemo: uwcM, useRef: uwcR } = React;

function WatchCommandPalette() {
  const [open, setOpen] = uwcS(false);
  const [q, setQ] = uwcS("");
  const [sel, setSel] = uwcS(0);
  const inputRef = uwcR(null);

  // Global open: ⌘K / Ctrl-K toggles, "/" quick-opens, Esc closes,
  // and window.openWatchCmdK() lets the top-nav button open it.
  uwcE(() => {
    window.openWatchCmdK = () => { setOpen(true); setQ(""); setSel(0); };
    const onKey = (e) => {
      const t = e.target;
      const inField = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); setOpen(o => !o); setQ(""); setSel(0); return;
      }
      if (e.key === "Escape" && open) { setOpen(false); return; }
      if (e.key === "/" && !inField && !open) { e.preventDefault(); setOpen(true); setQ(""); setSel(0); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  uwcE(() => { if (open) setTimeout(() => inputRef.current && inputRef.current.focus(), 30); }, [open]);

  const go = (to) => () => { (window.navigate || ((u) => location.hash = "#" + u))(to); setOpen(false); };
  const goHref = (href) => () => { window.location.href = href; setOpen(false); };

  const cmds = uwcM(() => {
    const out = [];

    // ── Navigate ──
    [
      { label: "Home",       hint: "Browse everything",      icon: "play",   to: "/" },
      { label: "Films",      hint: "All original films",     icon: "film",   to: "/genre/film" },
      { label: "Series",     hint: "Episodic · weekly drops",icon: "board",  to: "/genre/series" },
      { label: "Branched",   hint: "Interactive films",      icon: "shuffle",to: "/branches" },
      { label: "Kids",       hint: "Family-safe catalog",    icon: "heart",  to: "/kids" },
      { label: "Studios",    hint: "Filmmaker channels",     icon: "globe",  to: "/studios" },
      { label: "Cast",       hint: "Performer catalog",      icon: "actor",  to: "/cast" },
      { label: "Festivals",  hint: "Programme & juries",     icon: "ticket", to: "/festival" },
      { label: "Trending",   hint: "What the room's watching",icon: "trend", to: "/shelf/trending" },
      { label: "Royalty pool",hint: "Distribution schedule", icon: "coin",   to: "/royalty" },
      { label: "Holder rooms",hint: "Backer-only spaces",    icon: "lock",   to: "/rooms" },
      { label: "Producers market", hint: "Back a film",      icon: "trend",  to: "/producers" },
    ].forEach(v => out.push({ id: "go:" + v.to, kind: "Go to", label: v.label, hint: v.hint, icon: v.icon, run: go(v.to) }));

    // ── Account ──
    [
      { label: "Watchlist",        hint: "Saved films",        icon: "heart",  to: "/watchlist" },
      { label: "Watch history",    hint: "Recently played",    icon: "clock",  to: "/history" },
      { label: "Wallet & holdings",hint: "Balance, passes, P/L",icon: "wallet",to: "/wallet" },
      { label: "Buy crypto",       hint: "Top up your wallet", icon: "coin",   to: "/wallet/buy" },
      { label: "Payouts",          hint: "Creator earnings",   icon: "coin",   to: "/payouts" },
      { label: "Leaderboard",      hint: "Top backers",        icon: "trend",  to: "/leaderboard" },
      { label: "Notifications",    hint: "Drops & royalties",  icon: "bell",   to: "/notifications" },
      { label: "Account & billing",hint: "Plan, card, subs",   icon: "settings",to: "/account" },
      { label: "Family settings",  hint: "Parental controls",  icon: "lock",   to: "/settings/family" },
    ].forEach(v => out.push({ id: "acct:" + v.to, kind: "Account", label: v.label, hint: v.hint, icon: v.icon, run: go(v.to) }));

    // ── Switch surface ──
    [
      { label: "Cina Studio",     hint: "Creator side",      href: "Cina.html" },
      { label: "Cina Producers",  hint: "Backer market",     href: "Producers.html" },
    ].forEach(v => out.push({ id: "surf:" + v.href, kind: "Switch to", label: v.label, hint: v.hint, icon: "apps", run: goHref(v.href) }));

    // ── Branched rooms ──
    Object.values(window.BRANCH_FILMS || {}).forEach(t => out.push({
      id: "room:" + t.filmId, kind: "Room",
      label: t.title, hint: (t.roomSize ? t.roomSize.toLocaleString() + " in room · " : "") + t.totalCuts + " cuts",
      icon: "shuffle", run: go("/branches/" + t.filmId),
    }));

    // ── Studio equity tokens ──
    (window.STUDIOS || []).forEach(s => {
      const t = window.stToken && window.stToken(s.id);
      if (!t) return;
      out.push({
        id: "token:" + s.id, kind: "Token",
        label: t.ticker + " · " + s.name, hint: "$" + t.price.toFixed(2) + " · " + t.yieldApy.toFixed(1) + "% APY",
        icon: "coin", run: go("/studios/" + s.id + "/token"),
      });
    });

    // ── Festival screenings ──
    (window.fvLineup ? window.fvLineup() : []).forEach((f, i) => out.push({
      id: "fest:" + f.id, kind: "Screening",
      label: f.title, hint: "No. " + String(i + 1).padStart(2, "0") + " in the running order",
      icon: "ticket", run: go("/festival/film/" + f.id),
    }));

    // ── Films & series ──
    (window.CATALOG || []).forEach(f => out.push({
      id: "film:" + f.id, kind: f.kind === "series" ? "Series" : "Film",
      label: f.title, hint: (f.creator || "") + (f.genre && f.genre[0] ? " · " + f.genre[0] : ""),
      icon: f.kind === "series" ? "board" : "play",
      run: go(f.kind === "series" ? "/series/" + f.id : "/film/" + f.id),
    }));

    // ── Studios / creators ──
    (window.CREATORS || []).forEach(c => out.push({
      id: "creator:" + c.id, kind: "Studio",
      label: c.name, hint: (c.tagline || c.handle || "") + (c.films ? " · " + c.films + " films" : ""),
      icon: "globe", run: go("/creator/" + c.id),
    }));

    // ── Cast ──
    (window.CAST || []).forEach(p => out.push({
      id: "cast:" + p.id, kind: "Cast",
      label: p.name, hint: p.role || p.tagline || "Performer",
      icon: "actor", run: go("/cast/" + p.id),
    }));

    // ── Everywhere else on Cina — one palette reaches all four surfaces ──
    if (window.cinaCrossCommands) out.push(...window.cinaCrossCommands("watch"));

    return out;
  }, [open]);

  const results = uwcM(() => {
    if (!q.trim()) return cmds.filter(c => c.kind === "Go to" || c.kind === "Account").slice(0, 13);
    const needle = q.toLowerCase();
    const scored = cmds.map(c => {
      const hay = (c.label + " " + (c.hint || "") + " " + c.kind).toLowerCase();
      let score = 0;
      if (c.label.toLowerCase().startsWith(needle)) score = 110;
      else if (hay.startsWith(needle)) score = 95;
      else if (c.label.toLowerCase().includes(needle)) score = 60;
      else if (hay.includes(needle)) score = 30;
      else {
        let i = 0;
        for (const ch of needle) { const idx = hay.indexOf(ch, i); if (idx === -1) return null; i = idx + 1; }
        score = 10;
      }
      return { ...c, _score: score };
    }).filter(Boolean);
    scored.sort((a, b) => b._score - a._score);
    return scored.slice(0, 18);
  }, [q, cmds]);

  uwcE(() => { setSel(0); }, [q]);

  if (!open) return null;

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(results.length - 1, s + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); const r = results[sel]; if (r) r.run(); }
  };

  // Group by kind
  const groups = [];
  let lastKind = null;
  results.forEach((r, i) => {
    if (r.kind !== lastKind) { groups.push({ kind: r.kind, items: [] }); lastKind = r.kind; }
    groups[groups.length - 1].items.push({ ...r, _idx: i });
  });

  return (
    <div onClick={() => setOpen(false)} style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      paddingTop: "12vh", animation: "watchCmdkFade .14s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(640px, 92vw)", background: "var(--c-panel)",
        border: "1px solid var(--c-line)", borderRadius: "var(--r-3)",
        boxShadow: "0 40px 120px rgba(0,0,0,.6)", overflow: "hidden",
        animation: "watchCmdkRise .18s cubic-bezier(.2,.8,.2,1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--c-line)" }}>
          <Icon name="search" size={14}/>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKeyDown}
            placeholder="Search films, studios, cast, your account…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--c-ink)", fontSize: "var(--fs-lead)", fontFamily: "var(--f-sans)" }}/>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", border: "1px solid var(--c-line-2)", padding: "2px 6px", borderRadius: "var(--r-1)" }}>ESC</span>
        </div>

        <div style={{ maxHeight: 440, overflowY: "auto", padding: "6px 0" }}>
          {results.length === 0 && (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--c-ink-4)", fontSize: "var(--fs-body)" }}>No matches for "{q}"</div>
          )}
          {groups.map((g, gi) => (
            <div key={gi} style={{ padding: "4px 0" }}>
              <div className="t-mono" style={{ padding: "6px 16px 4px", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>{g.kind.toUpperCase()}</div>
              {g.items.map(r => {
                const active = r._idx === sel;
                return (
                  <button key={r.id} onClick={r.run} onMouseEnter={() => setSel(r._idx)} style={{
                    display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "9px 16px",
                    background: active ? "rgba(255,255,255,.04)" : "transparent",
                    border: "none", textAlign: "left", cursor: "pointer", color: "var(--c-ink)",
                    borderLeft: active ? "2px solid var(--c-amber)" : "2px solid transparent",
                  }}>
                    <span style={{ width: 22, height: 22, borderRadius: "var(--r-2)", background: "var(--c-bg)", border: "1px solid var(--c-line-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: active ? "var(--c-amber)" : "var(--c-ink-3)" }}>
                      <Icon name={r.icon || "dot"} size={11}/>
                    </span>
                    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
                      <span style={{ fontSize: "var(--fs-body)", fontWeight: 500, color: "var(--c-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</span>
                      {r.hint && <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.hint}</span>}
                    </span>
                    {r.surface && window.CcSurfaceBadge ? <window.CcSurfaceBadge surface={r.surface}/> : null}
                    {active && <Icon name="chev-r" size={12}/>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 16px", borderTop: "1px solid var(--c-line)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", background: "var(--c-bg)" }}>
          <span><b style={{ color: "var(--c-ink-3)" }}>↑↓</b> navigate</span>
          <span><b style={{ color: "var(--c-ink-3)" }}>↵</b> open</span>
          <span><b style={{ color: "var(--c-ink-3)" }}>esc</b> close</span>
          <span style={{ flex: 1 }}/>
          <span className="t-mono" style={{ letterSpacing: ".16em" }}>CINA · COMMAND</span>
        </div>
      </div>

      <style>{`
        @keyframes watchCmdkFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes watchCmdkRise { from { opacity: 0; transform: translateY(-6px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}

window.WatchCommandPalette = WatchCommandPalette;
