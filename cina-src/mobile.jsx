// mobile.jsx — Studio on phones: the dashboard + slate, Director chat, board and crew, with a project switcher.

const { useState: useStateM } = React;

const MOB_CSS = `
.mob-home{position:relative;flex:1;min-height:0}
.mob-home .dsh-shell{padding-top:0}
.mob-home .dsh-wrap{padding-left:16px!important;padding-right:16px!important}
.mob-tab{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:56px;border:none;background:transparent;font-size:var(--fs-label);font-family:var(--f-mono);text-transform:uppercase;letter-spacing:.08em;cursor:pointer}
.mob-sheet-row{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:8px 4px;border:none;border-top:1px solid var(--c-line);background:transparent;color:var(--c-ink);text-align:left;cursor:pointer;font:inherit}
`;

function MobileApp() {
  const [tab, setTab] = useStateM("home"); // home | chat | board | crew
  const [sheet, setSheet] = useStateM(null); // null | "films" | "crew"
  const [page, setPage] = useStateM(null); // null | site | promo | analytics | new
  const [filmId, setFilmId] = useStateM(window.__cinaActiveFilmId || (window.PROJECTS[0] && window.PROJECTS[0].id));
  const film = window.PROJECTS.find(p => p.id === filmId) || window.PROJECTS[0];
  React.useEffect(() => { window.__cinaActiveFilmId = filmId; }, [filmId]);

  const openFilm = (f, view) => {
    const id = typeof f === "string" ? f : f && f.id;
    if (id) setFilmId(id);
    setPage(null); setSheet(null);
    setTab(view === "board" ? "board" : "chat");
  };
  const toast = (text) => window.toast && window.toast({ title: "STUDIO", text });
  const pages = {
    site: { label: "Public site", el: window.StudioSitePanel ? <StudioSitePanel/> : null },
    promo: { label: "Promotion", el: window.StudioPromotionPage ? <StudioPromotionPage onOpenVault={() => toast("The vault opens on a larger screen.")}/> : null },
    analytics: { label: "Analytics", el: window.StudioAnalyticsPage ? <StudioAnalyticsPage onOpenPromo={() => setPage("promo")} onOpenFilm={openFilm}/> : null },
    new: { label: "New film", el: window.NewFilmFlow ? <NewFilmFlow initialKind={null} onCancel={() => setPage(null)} onCreate={() => { setPage(null); setTab("chat"); }}/> : null },
  };
  const tabs = [
    { id: "home",  icon: "film",  label: "Studio" },
    { id: "chat",  icon: "chat",  label: "Director" },
    { id: "board", icon: "board", label: "Board" },
    { id: "crew",  icon: "actor", label: "Crew" },
  ];

  return (
    <div data-theme="dark" style={{ display: "flex", flexDirection: "column", height: "calc(100dvh - var(--orb-safe, 0px))", width: "100vw", background: "var(--c-bg)", color: "var(--c-ink)", overflow: "hidden", position: "relative" }}>
      <style>{MOB_CSS}</style>
      <header style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px 8px 16px", minHeight: 56, borderBottom: "1px solid var(--c-line)", background: "var(--c-panel)", flexShrink: 0 }}>
        {page ? (
          <button onClick={() => setPage(null)} aria-label="Back" style={{ width: 44, height: 44, marginLeft: -10, border: "none", background: "transparent", color: "var(--c-ink-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="chev-l" size={16}/>
          </button>
        ) : <CinaBadge size={26}/>}
        {page ? (
          <div className="t-display" style={{ flex: 1, fontSize: "var(--fs-lead)", fontStyle: "italic" }}>{pages[page].label}</div>
        ) : tab === "home" ? (
          <div style={{ flex: 1 }}></div>
        ) : (
          <button onClick={() => setSheet("films")} style={{ flex: 1, minWidth: 0, minHeight: 44, border: "none", background: "transparent", color: "inherit", textAlign: "left", cursor: "pointer", padding: 0 }}>
            <div className="t-display" style={{ fontSize: "var(--fs-lead)", fontStyle: "italic", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{film.title} <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", fontStyle: "normal" }}>▾</span></div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" }}>{film.code} · {film.status}</div>
          </button>
        )}
        <a href="index.html" className="t-mono" style={{ minHeight: 44, display: "flex", alignItems: "center", padding: "0 10px", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textDecoration: "none" }}>WATCH ↗</a>
      </header>

      <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {page ? (
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", position: "relative" }}>{pages[page].el}</div>
        ) : (
          <>
            {tab === "home" && (
              <div className="mob-home">
                <Dashboard onOpenFilm={openFilm} onNewFilm={() => setPage("new")}
                  onOpenVault={() => toast("The vault opens on a larger screen.")}
                  onOpenSite={() => setPage("site")} onOpenPromo={() => setPage("promo")} onOpenAnalytics={() => setPage("analytics")}/>
              </div>
            )}
            {tab === "chat" && <ChatPanel key={filmId}/>}
            {tab === "board" && <MobileBoard/>}
            {tab === "crew" && <MobileCrew/>}
          </>
        )}
      </div>

      {!page && (
        <nav style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid var(--c-line)", background: "var(--c-panel)", paddingBottom: "env(safe-area-inset-bottom, 0px)", flexShrink: 0 }}>
          {tabs.map(t => (
            <button key={t.id} className="mob-tab" onClick={() => setTab(t.id)} aria-current={tab === t.id ? "page" : undefined}
              style={{ color: tab === t.id ? "var(--c-amber)" : "var(--c-ink-3)" }}>
              <Icon name={t.icon} size={18}/>{t.label}
            </button>
          ))}
        </nav>
      )}

      {sheet === "films" && (
        <div onClick={() => setSheet(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 100, display: "flex", alignItems: "flex-end" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", background: "var(--c-panel)", borderTop: "1px solid var(--c-line)", borderRadius: "14px 14px 0 0", padding: "12px 16px calc(12px + env(safe-area-inset-bottom, 0px))", maxHeight: "72vh", overflowY: "auto" }}>
            <div style={{ width: 40, height: 3, background: "var(--c-line-2)", borderRadius: "var(--r-1)", margin: "0 auto 14px" }}/>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 6 }}>SWITCH PROJECT</div>
            {window.PROJECTS.map(p => (
              <button key={p.id} className="mob-sheet-row" onClick={() => { setFilmId(p.id); setSheet(null); }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.id === filmId ? "var(--c-amber)" : "var(--c-line-2)", flexShrink: 0 }}></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="t-display" style={{ display: "block", fontStyle: "italic", fontSize: "var(--fs-lead)", color: p.id === filmId ? "var(--c-amber)" : "var(--c-ink)" }}>{p.title}</span>
                  <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textTransform: "uppercase", marginTop: 2 }}>{p.code} · {p.status}</span>
                </span>
              </button>
            ))}
            <button className="mob-sheet-row" onClick={() => { setSheet(null); setPage("new"); }} style={{ color: "var(--c-amber)" }}>
              <Icon name="plus" size={14}/><span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>NEW FILM</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileBoard() {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
      <SectionHead title="Scene 14 · Darkroom" count={`${window.STORYBOARD.length} shots`}/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
        {window.STORYBOARD.map((f, i) => (
          <div key={f.id} style={{
            border: "1px solid var(--c-line)", borderRadius: "var(--r-md)", overflow: "hidden",
            background: "var(--c-panel)",
          }}>
            <div style={{ aspectRatio: "16/9", position: "relative" }}>
              <FrameThumb kind={f.thumb} usePhoto/>
              <div style={{
                position: "absolute", top: 4, left: 4,
                padding: "1px 4px", borderRadius: "var(--r-1)",
                background: "rgba(8,8,10,.75)",
                color: "var(--c-ink-2)", fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)",
              }}>{f.scene}{f.shot} · {f.type}</div>
            </div>
            <div style={{ padding: "6px 8px" }}>
              <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", lineHeight: 1.35,
                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {f.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileCrew() {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
      <SectionHead title="Crew"/>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {window.AGENTS.map(a => (
          <div key={a.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: 12, background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-md)",
          }}>
            <AgentBadge agent={a.id} size={32}/>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "var(--fs-body)", fontWeight: 600 }}>{a.name}</span>
                <StatusPill status={a.status}/>
              </div>
              <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2 }}>{a.role}</div>
              <div style={{ marginTop: 6, height: 2, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                <div style={{ width: `${a.load * 100}%`, height: "100%", background: a.color }}/>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { MobileApp });
