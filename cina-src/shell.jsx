// shell.jsx — Quiet shell. One stage, ambient chrome, drawer for crew.

const { useState: useStateSh, useEffect: useEffectSh } = React;

function Shell({ tweaks, setTweak }) {
  return (
    <LightboxProvider>
      <ToastProvider>
        <ShellInner tweaks={tweaks} setTweak={setTweak}/>
      </ToastProvider>
    </LightboxProvider>
  );
}

function _parseStudioHash() {
  const STUDIO_STATIONS = new Set([
    "chat", "pipeline", "script", "episodes", "board", "generate",
    "editor", "branch", "cuts", "score", "titles", "dock", "mint", "deliver",
    "watch", "bible", "vault", "autopilot", "memory"
  ]);
  const raw = (window.location.hash || "").replace(/^#\/?/, "").trim().toLowerCase();
  if (raw === "dashboard" || raw === "slate") return { route: "dashboard", view: "bible" };
  if (["site", "promo", "analytics", "new"].includes(raw)) return { route: raw, view: "bible" };
  if (STUDIO_STATIONS.has(raw)) return { route: "studio", view: raw };
  return { route: "studio", view: "bible" };
}

function ShellInner({ tweaks, setTweak }) {
  const _initHash = _parseStudioHash();
  const [route, setRoute] = useStateSh(_initHash.route); // dashboard | new | studio | site | promo | analytics
  const [activeFilmId, setActiveFilmId] = useStateSh(() => {
    try { return localStorage.getItem("cina:active-film-id") || "p1"; } catch (_) { return "p1"; }
  });
  const [activeView, setActiveView] = useStateSh(_initHash.view);
  const [newKind, setNewKind] = useStateSh(null); // pre-selected format when starting from a homepage type card

  // Support URL hash deep-linking (e.g. Cina.html#vault, Cina.html#analytics, Cina.html#editor, Cina.html#site, Cina.html#slate)
  useEffectSh(() => {
    const applyStudioHash = () => {
      const raw = (window.location.hash || "").replace(/^#\/?/, "").trim().toLowerCase();
      if (!raw) return;
      if (raw === "build") {
        window.location.href = "index.html#/build";
        return;
      }
      const parsed = _parseStudioHash();
      setRoute(parsed.route);
      if (parsed.route === "studio") setActiveView(parsed.view);
    };
    window.addEventListener("hashchange", applyStudioHash);
    return () => window.removeEventListener("hashchange", applyStudioHash);
  }, []);

  // Also honor TalentAPI handoff (e.g. xActor intent: "vault" | "birth" | "cast")
  useEffectSh(() => {
    try {
      const handoff = window.TalentAPI && typeof window.TalentAPI.peekHandoff === "function"
        ? window.TalentAPI.peekHandoff()
        : JSON.parse(localStorage.getItem("cina:talent:handoff") || "null");
      if (handoff && handoff.intent) {
        if (handoff.intent === "vault" || handoff.intent === "birth") {
          setRoute("studio");
          setActiveView("vault");
        } else if (handoff.intent === "cast") {
          setRoute("studio");
          setActiveView("vault");
        }
      }
    } catch (_) {}
  }, []);

  // Start every route / view change at the top — never open a page mid-scroll.
  useEffectSh(() => {
    const toTop = () => {
      try { window.scrollTo(0, 0); } catch (e) {}
      document.querySelectorAll("[data-shell-scroll], main").forEach(el => { try { el.scrollTop = 0; } catch (e) {} });
    };
    toTop();
    requestAnimationFrame(toTop);
  }, [route, activeView, activeFilmId]);

  const activeFilm = window.PROJECTS.find(p => p.id === activeFilmId) || window.PROJECTS[0];
  const activeKind = activeFilm?.kind || "movie";

  // Expose active film & hydrate project state across stations.
  useEffectSh(() => {
    window.__cinaActiveFilmId = activeFilmId;
    if (window.CinaPipeline?.selectFilm) {
      window.CinaPipeline.selectFilm(activeFilmId);
    } else {
      try { localStorage.setItem("cina:active-film-id", activeFilmId); } catch (_) {}
    }
  }, [activeFilmId]);

  // If the active view isn't valid for this format, fall back to Step 01 DNA.
  useEffectSh(() => {
    const allowed = studioViews(activeKind).map(v => v.id);
    if (!allowed.includes(activeView)) setActiveView("bible");
  }, [activeKind]);
  useEffectSh(() => {
    const h = (e) => setActiveView(e.detail);
    window.addEventListener("cina:setView", h);
    return () => window.removeEventListener("cina:setView", h);
  }, []);
  useEffectSh(() => {
    const onRoute = (e) => setRoute(e.detail);
    const onProj = (e) => setActiveFilmId(e.detail);
    const onDrawer = () => setDrawerOpen(o => !o);
    window.__cinaStudioGo = (view, sub) => {
      setRoute("studio");
      setActiveView(view || "bible");
      if (sub) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("cina:studioSubTab", { detail: { view, sub } }));
        }, 40);
      }
    };
    window.addEventListener("cina:setRoute", onRoute);
    window.addEventListener("cina:setProject", onProj);
    window.addEventListener("cina:toggleDrawer", onDrawer);
    return () => {
      window.removeEventListener("cina:setRoute", onRoute);
      window.removeEventListener("cina:setProject", onProj);
      window.removeEventListener("cina:toggleDrawer", onDrawer);
    };
  }, []);
  const [drawerOpen, setDrawerOpen] = useStateSh(false);

  // Esc closes the drawer
  useEffectSh(() => {
    const onKey = (e) => { if (e.key === "Escape") setDrawerOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const [creditsPanelOpen, setCreditsPanelOpen] = useStateSh(false);
  const credits = (window.useCinaCredits ? window.useCinaCredits() : 342);
  const creditsStr = String(credits);
  const [teamPanelOpen, setTeamPanelOpen] = useStateSh(false);
  const [helpPanelOpen, setHelpPanelOpen] = useStateSh(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useStateSh(false);
  const toolsRef = React.useRef(null);

  useEffectSh(() => {
    if (!toolsMenuOpen) return;
    const onDoc = (e) => { if (toolsRef.current && !toolsRef.current.contains(e.target)) setToolsMenuOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setToolsMenuOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [toolsMenuOpen]);

  // Listen for panel-open events from Header User Menu / ProfileMenu
  useEffectSh(() => {
    const handler = (e) => {
      const p = e.detail;
      if (p === "profile") window.openCinaAccountSettings?.("profile");
      if (p === "preferences") window.openCinaAccountSettings?.("studio");
      if (p === "credits") setCreditsPanelOpen(true);
      if (p === "team") setTeamPanelOpen(true);
      if (p === "help") setHelpPanelOpen(true);
    };
    window.addEventListener("cina:openPanel", handler);
    return () => window.removeEventListener("cina:openPanel", handler);
  }, []);

  const launchWalkthrough = () => {
    if (setTweak) setTweak("studioMode", "full");
    setRoute("studio");
    setActiveView("bible");
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("cina:start-tour", { detail: { kind: activeKind || "movie" } }));
    }, 120);
  };

  return (
    <div style={{
      position: "relative",
      height: "calc(100vh - var(--orb-safe, 0px))", width: "100%",
      background: "var(--c-bg)", color: "var(--c-ink)",
      overflow: "hidden",
    }}>
      {/* TOP BAR */}
      <UnifiedTopNav
        surface="studio"
        collapseAt={1100}
        mobileNav={[
          { label: "Slate", active: route === "dashboard", onClick: () => setRoute("dashboard") },
          ...studioViews(activeKind).map(v => ({ label: v.label || v.name || v.id, active: route === "studio" && activeView === v.id, onClick: () => { setRoute("studio"); setActiveView(v.id); } })),
        ]}
        mobileActions={[
          { label: "Movie Walkthrough", onClick: launchWalkthrough },
          { label: `${creditsStr} credits`, onClick: () => setCreditsPanelOpen(true) },
        ]}
        onWordmark={() => setRoute("dashboard")}
        headerStyle={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20 }}
        wallet={null}
        bell={null}
        accountBalance={{
          label: "credits",
          value: creditsStr,
          sub: window.USER && typeof window.USER.walletUSD === "number" ? `$${window.USER.walletUSD.toLocaleString()} wallet` : undefined,
          onClick: () => setCreditsPanelOpen(true),
        }}
        tabs={route === "studio"
          ? (window.UnifiedPipelineRail
              ? <window.UnifiedPipelineRail activeView={activeView} setActiveView={setActiveView} kind={activeKind}/>
              : <ViewSwitch activeView={activeView} setActiveView={setActiveView} kind={activeKind}/>)
          : null}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <div ref={toolsRef} style={{ position: "relative" }}>
              <button
                onClick={() => setToolsMenuOpen(o => !o)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.4rem",
                  height: "2.1rem", padding: "0 0.75rem",
                  background: toolsMenuOpen || ["site", "promo", "analytics"].includes(route) ? "rgba(var(--accent-rgb),.1)" : "var(--c-panel-2)",
                  border: `1px solid ${toolsMenuOpen || ["site", "promo", "analytics"].includes(route) ? "var(--c-amber)" : "var(--c-line-2)"}`,
                  color: toolsMenuOpen || ["site", "promo", "analytics"].includes(route) ? "var(--c-amber)" : "var(--c-ink)",
                  cursor: "pointer", borderRadius: 0,
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".12em", fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
                title="Film website, promotion, analytics, walkthrough & NLE dock"
              >
                <span>Tools</span>
                <Icon name="chev-d" size={11}/>
              </button>
              {toolsMenuOpen && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 120,
                  width: 240, background: "var(--c-panel)", border: "1px solid var(--c-line-2)",
                  borderRadius: 0, boxShadow: "0 20px 56px rgba(0,0,0,.6)",
                  display: "flex", flexDirection: "column", padding: "4px 0",
                }}>
                  {[
                    { k: "site",      label: "Site Builder",         sub: "Microsite & merch store", onClick: () => setRoute("site") },
                    { k: "promo",     label: "Promotion",            sub: "Trailer campaigns & press", onClick: () => setRoute("promo") },
                    { k: "analytics", label: "Sales & Stats",        sub: "Revenue & split telemetry", onClick: () => setRoute("analytics") },
                    { k: "dock",      label: "Quick NLE Dock",       sub: "Open docked cut workspace", onClick: () => { setRoute("studio"); setActiveView("dock"); } },
                    { k: "walk",      label: "Studio Walkthrough",   sub: "Guided 7-step production tour", onClick: launchWalkthrough },
                    { k: "help",      label: "Shortcuts & Help",     sub: "Keyboard map & support", onClick: () => setHelpPanelOpen(true) },
                  ].map(item => (
                    <button key={item.k} onClick={() => { setToolsMenuOpen(false); item.onClick(); }} style={{
                      width: "100%", textAlign: "left", padding: "9px 14px", background: "transparent",
                      border: "none", borderRadius: 0, cursor: "pointer", color: "var(--c-ink)",
                      display: "flex", flexDirection: "column", gap: 2,
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--c-panel-2)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".1em", fontWeight: 600, color: route === item.k || (item.k === "dock" && activeView === "dock") ? "var(--c-amber)" : "var(--c-ink)" }}>
                        {item.label.toUpperCase()}
                      </span>
                      <span style={{ fontSize: "0.74rem", color: "var(--c-ink-4)" }}>{item.sub}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true }))}
              style={{
                width: "2.15rem", height: "2.15rem", borderRadius: "50%", flexShrink: 0, padding: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)",
                color: "var(--c-ink-3)", cursor: "pointer",
                transition: "border-color .14s ease, color .14s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--c-line-3)"; e.currentTarget.style.color = "var(--c-ink)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--c-line-2)"; e.currentTarget.style.color = "var(--c-ink-3)"; }}
              title="Search — jump anywhere (⌘K)"
              aria-label="Search"
            >
              <Icon name="search" size={15}/>
            </button>
            {route === "studio" && (
              <button
                data-tour="crew"
                onClick={() => setDrawerOpen(o => !o)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.45rem",
                  height: "2.1rem", padding: "0 0.75rem",
                  background: drawerOpen ? "rgba(var(--accent-rgb),.08)" : "var(--c-panel-2)",
                  border: `1px solid ${drawerOpen ? "rgba(var(--accent-rgb),.35)" : "var(--c-line-2)"}`,
                  color: drawerOpen ? "var(--c-amber)" : "var(--c-ink-2)",
                  cursor: "pointer", borderRadius: 0,
                  transition: "border-color .14s ease, background .14s ease",
                }}
                onMouseEnter={e => { if (!drawerOpen) e.currentTarget.style.borderColor = "var(--c-line-3)"; }}
                onMouseLeave={e => { if (!drawerOpen) e.currentTarget.style.borderColor = "var(--c-line-2)"; }}
                title={drawerOpen ? "Close crew" : "Open crew"}
              >
                <span style={{ fontSize: "var(--fs-body)", whiteSpace: "nowrap" }}>Crew</span>
              </button>
            )}
          </div>
        }
      >
        {(route === "dashboard" || route === "site" || route === "promo" || route === "analytics") ? (
          <nav className="cina-topnav" style={{ display: "flex", alignItems: "stretch", padding: "0 0.5rem", height: "100%", width: "100%" }}>
            {[
              { id: "slate",     label: "Slate",         view: null },
              { id: "site",      label: "Site Builder",  view: "__site" },
              { id: "promo",     label: "Promotion",     view: "__promo" },
              { id: "analytics", label: "Sales & Stats", view: "__analytics" },
            ].map(t => {
              const active = (t.id === "slate" && route === "dashboard") || (t.id === "site" && route === "site") || (t.id === "promo" && route === "promo") || (t.id === "analytics" && route === "analytics");
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    if (t.view == null) { setRoute("dashboard"); return; }
                    if (t.view === "__site") { setRoute("site"); return; }
                    if (t.view === "__promo") { setRoute("promo"); return; }
                    if (t.view === "__analytics") { setRoute("analytics"); return; }
                    setActiveView(t.view); setRoute("studio");
                  }}
                  style={{
                    position: "relative",
                    height: "100%", padding: "0 0.85rem",
                    fontSize: "var(--fs-body)", fontWeight: active ? 600 : 450,
                    color: active ? "var(--c-ink)" : "var(--c-ink-3)",
                    background: "transparent", border: "none", borderRadius: 0,
                    cursor: "pointer", transition: "color .14s ease",
                    fontFamily: "var(--f-sans)", whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = "var(--c-ink)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = "var(--c-ink-3)"; }}
                >
                  {t.label}
                  {active && (
                    <span style={{
                      position: "absolute", left: "0.85rem", right: "0.85rem", bottom: "0.85rem",
                      height: 2, background: "var(--c-amber)", borderRadius: 0,
                    }}/>
                  )}
                </button>
              );
            })}
            <span style={{ flex: 1 }}/>
            {activeFilm && (
              <button
                onClick={() => {
                  const target = window.CinaPipeline?.resolveSmartView ? window.CinaPipeline.resolveSmartView(activeFilm) : "bible";
                  setRoute("studio");
                  setActiveView(target);
                }}
                className="t-mono"
                style={{
                  alignSelf: "center", height: 28, padding: "0 12px", borderRadius: 0, cursor: "pointer",
                  background: "rgba(var(--accent-rgb),.1)", border: "1px solid var(--c-amber)",
                  color: "var(--c-amber)", fontSize: "var(--fs-label)", letterSpacing: ".1em",
                  fontWeight: 700, whiteSpace: "nowrap",
                }}
                title={`Resume ${activeFilm.title} inside Studio`}
              >
                OPEN {String(activeFilm.title || "STUDIO").toUpperCase()} →
              </button>
            )}
          </nav>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0 0.85rem" }}>
            {route === "studio" && (
              <>
                <button
                  onClick={() => setRoute("dashboard")}
                  style={{
                    height: "2rem", padding: "0 0.65rem", borderRadius: 0,
                    background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)",
                    color: "var(--c-ink-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                    letterSpacing: ".1em", cursor: "pointer", whiteSpace: "nowrap",
                  }}
                  title="Return to Studio Slate overview"
                >
                  ← Slate
                </button>
                <ProjectSwitcher
                  activeFilmId={activeFilmId}
                  activeKind={activeKind}
                  onSwitch={(id) => {
                    setActiveFilmId(id);
                    const nextView = window.CinaPipeline?.resolveSmartView ? window.CinaPipeline.resolveSmartView(id) : "bible";
                    setActiveView(nextView);
                  }}
                  onNewFilm={() => { setNewKind(null); setRoute("new"); }}
                />
              </>
            )}
            {route === "new" && (
              <span className="t-display" style={{
                fontSize: "var(--fs-body)", fontStyle: "italic", color: "var(--c-ink-3)",
              }}>New film</span>
            )}
          </div>
        )}
      </UnifiedTopNav>
      {/* STAGE — full bleed */}
      {route === "dashboard" && (
        <Dashboard
          activeFilmId={activeFilmId}
          onOpenFilm={(film, view) => {
            const id = typeof film === "string" ? film : (film && film.id);
            const targetId = id || activeFilmId;
            if (targetId) setActiveFilmId(targetId);
            const resolved = view || (window.CinaPipeline?.resolveSmartView ? window.CinaPipeline.resolveSmartView(film || targetId) : "bible");
            setRoute("studio");
            setActiveView(resolved);
          }}
          onNewFilm={(kind) => { setNewKind(typeof kind === "string" ? kind : null); setRoute("new"); }}
          onOpenVault={() => { setRoute("studio"); setActiveView("vault"); }}
          onOpenSite={() => setRoute("site")}
          onOpenPromo={() => setRoute("promo")}
          onOpenAnalytics={() => setRoute("analytics")}
        />
      )}
      {route === "site" && (window.StudioSitePanel ? <StudioSitePanel/> : null)}
      {route === "promo" && (window.StudioPromotionPage ? <StudioPromotionPage onOpenVault={() => { setRoute("studio"); setActiveView("vault"); }}/> : null)}
      {route === "analytics" && (window.StudioAnalyticsPage ? <StudioAnalyticsPage
        onOpenPromo={() => setRoute("promo")}
        onOpenFilm={(film) => {
          const id = typeof film === "string" ? film : (film && film.id);
          const targetId = id || activeFilmId;
          if (targetId) setActiveFilmId(targetId);
          const resolved = window.CinaPipeline?.resolveSmartView ? window.CinaPipeline.resolveSmartView(film || targetId) : "bible";
          setRoute("studio");
          setActiveView(resolved);
        }}
      /> : null)}
      {route === "new" && (
        <NewFilmFlow
          initialKind={newKind}
          onCancel={() => setRoute("dashboard")}
          onCreate={(kind) => {
            setRoute("studio"); setActiveView("bible");
            // Walk the director through every step in order when a new production is minted.
            setTimeout(() => window.dispatchEvent(new CustomEvent("cina:start-tour", { detail: { kind: kind || "movie" } })), 450);
          }}
        />
      )}
      {route === "studio" && (
        <main style={{
          position: "absolute", inset: 0,
          paddingTop: 105,
          display: "flex", flexDirection: "column",
          minHeight: 0,
        }}>
          {["editor", "cuts", "score", "titles", "dock"].includes(activeView) && window.UnifiedEditHub ? (
            <window.UnifiedEditHub activeView={activeView} setActiveView={setActiveView} kind={activeKind} activeFilmId={activeFilmId}/>
          ) : ["mint", "deliver", "watch"].includes(activeView) && window.UnifiedShipHub ? (
            <window.UnifiedShipHub activeView={activeView} setActiveView={setActiveView}/>
          ) : ["chat", "pipeline", "memory", "autopilot"].includes(activeView) && window.UnifiedDirectorHub ? (
            <window.UnifiedDirectorHub activeView={activeView} setActiveView={setActiveView} kind={activeKind}/>
          ) : (
            <>
              {activeView === "script"   && <ScriptFlow/>}
              {activeView === "episodes" && <EpisodesPanel/>}
              {activeView === "board"    && <StoryboardPanel/>}
              {activeView === "generate" && <GeneratePanel/>}
              {activeView === "branch"   && <BranchTreePanel/>}
              {activeView === "bible"    && <BiblePanel/>}
              {activeView === "vault"    && <VaultPanel/>}
            </>
          )}
        </main>
      )}

      {/* CREW DRAWER */}
      <CrewDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}/>

      {/* SLIDE-IN PANELS */}
      <CreditsSlidePanel open={creditsPanelOpen} onClose={() => setCreditsPanelOpen(false)}/>
      <TeamSlidePanel open={teamPanelOpen} onClose={() => setTeamPanelOpen(false)}/>
      {window.HelpPanel && <HelpPanel open={helpPanelOpen} onClose={() => setHelpPanelOpen(false)}/>}

      {/* STUDIO WALKTHROUGH — runs after every new film / series / branch or when clicking Walkthrough */}
      {window.StudioTour && <StudioTour/>}
    </div>
  );
}

function studioSimpleSteps(kind) {
  return [
    { id: "dna",     label: "Build DNA",    views: [{ id: "bible", label: "DNA" }] },
    { id: "write",   label: "Write Script", views: [{ id: "script", label: "Script" }, ...(kind === "series" ? [{ id: "episodes", label: "Episodes" }] : [])] },
    { id: "cast",    label: "Cast Actors",  views: [{ id: "vault", label: "Vault" }] },
    { id: "stills",  label: "Make Stills",  views: [{ id: "board", label: "Board" }] },
    { id: "motion",  label: "Video",        views: [{ id: "generate", label: "Generate" }, ...(kind === "branched" ? [{ id: "branch", label: "Branches" }] : [])] },
    { id: "edit",    label: "Cut & Score",  views: [{ id: "editor", label: "Timeline" }, { id: "cuts", label: "Cuts" }, { id: "score", label: "Score" }, { id: "titles", label: "Titles" }] },
    { id: "release", label: "Splits & Ship",views: [{ id: "mint", label: "Splits" }, { id: "deliver", label: "Deliver" }, { id: "watch", label: "Premiere" }] },
  ];
}

function studioViewGroups(kind) {
  const groups = [
    { label: "01 DNA", views: [
      { id: "bible",  label: "DNA" },
    ]},
    { label: "02 SCRIPT", views: [
      { id: "script", label: "Script" },
      ...(kind === "series" ? [{ id: "episodes", label: "Episodes" }] : []),
    ]},
    { label: "03 CAST", views: [
      { id: "vault", label: "Cast Vault" },
    ]},
    { label: "04 STILLS", views: [
      { id: "board", label: "Stills & Board" },
    ]},
    { label: "05 VIDEO", views: [
      { id: "generate", label: "Generate" },
      ...(kind === "branched" ? [{ id: "branch", label: "Branch" }] : []),
    ]},
    { label: "06 EDIT", views: [
      { id: "editor", label: "Editor" },
      { id: "cuts",   label: "Cuts"   },
      { id: "score",  label: "Score"  },
      { id: "titles", label: "Titles" },
    ]},
    { label: "07 SHIP", views: [
      { id: "mint",    label: "Splits & Mint" },
      { id: "deliver", label: "Deliver" },
      { id: "watch",   label: "Premiere" },
    ]},
    { label: null, meta: true, views: [
      { id: "chat",      label: "Director AI" },
      { id: "pipeline",  label: "Pipeline" },
      { id: "memory",    label: "Memory" },
      { id: "autopilot", label: "Autopilot" },
    ]},
  ];
  return groups;
}

function studioViews(kind) {
  return studioViewGroups(kind).flatMap(g => g.views);
}

const FORMAT_COLORS = { movie: tkc("ink-3"), series: tkc("cat-1"), branched: "var(--c-amber)" };

function FormatTag({ kind, size = "sm" }) {
  const f = (window.CINA_FORMATS || {})[kind] || (window.CINA_FORMATS || {}).movie || { tag: "FILM" };
  const color = FORMAT_COLORS[kind] || "var(--c-ink-2)";
  return (
    <span className="t-mono" style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: size === "sm" ? "2px 7px" : "3px 9px",
      border: `1px solid ${color === "var(--c-amber)" ? "rgba(var(--accent-rgb),.4)" : color}`,
      borderRadius: "var(--r-1)", color,
      fontSize: size === "sm" ? 8.5 : 9.5, letterSpacing: ".16em", fontWeight: 600,
      lineHeight: 1, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: color }}/>
      {f.tag}
    </span>
  );
}

const VIEW_ICONS = {
  chat: "chat", pipeline: "reload",
  bible: "book", script: "edit", episodes: "film",
  vault: "vault",
  board: "board", generate: "sparkles", branch: "shuffle",
  editor: "film", cuts: "grid", score: "spark", titles: "type",
  deliver: "upload", mint: "circle", watch: "play",
  memory: "clock", autopilot: "wand",
};

function SimpleViewSwitch({ activeView, setActiveView, kind }) {
  const steps = studioSimpleSteps(kind);
  const cur = steps.find(st => st.views.some(v => v.id === activeView));
  const btn = (on) => ({
    height: 34, padding: "0 14px", border: "none", borderRadius: "var(--r-2)", cursor: "pointer", whiteSpace: "nowrap",
    display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--f-sans)", fontSize: "var(--fs-body)",
    fontWeight: on ? 650 : 450, background: on ? "rgba(var(--accent-rgb),.12)" : "transparent",
    color: on ? "var(--c-amber)" : "var(--c-ink-2)", transition: "color .14s, background .14s",
  });
  return (
    <nav className="cina-topnav" style={{ display: "flex", alignItems: "center", gap: 4, height: "100%" }}>
      <button data-tour="chat" onClick={() => setActiveView("chat")} style={btn(activeView === "chat")}>
        <Icon name="chat" size={15}/>Director
      </button>
      <span style={{ width: 1, height: 18, background: "var(--c-line-2)", margin: "0 8px", flexShrink: 0 }}></span>
      {steps.map((st, i) => {
        const on = cur && cur.id === st.id;
        return (
          <React.Fragment key={st.id}>
            {i > 0 && <span aria-hidden="true" style={{ color: "var(--c-ink-4)", fontSize: "var(--fs-label)" }}>›</span>}
            <button data-tour={st.views[0].id} onClick={() => setActiveView(st.views[0].id)} style={btn(on)}>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", opacity: .6 }}>{i + 1}</span>{st.label}
            </button>
            {on && st.views.length > 1 && (
              <span style={{ display: "inline-flex", gap: 2, padding: 3, borderRadius: "var(--r-2)", background: "var(--c-panel-2)", border: "1px solid var(--c-line)", marginRight: 4 }}>
                {st.views.map(v => (
                  <button key={v.id} onClick={() => setActiveView(v.id)} style={{
                    height: 26, padding: "0 10px", border: "none", borderRadius: "var(--r-2)", cursor: "pointer", whiteSpace: "nowrap",
                    fontFamily: "var(--f-sans)", fontSize: "var(--fs-body)", fontWeight: activeView === v.id ? 600 : 450,
                    background: activeView === v.id ? "var(--c-panel-3)" : "transparent",
                    color: activeView === v.id ? "var(--c-ink)" : "var(--c-ink-3)",
                  }}>{v.label}</button>
                ))}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

function ViewSwitch({ activeView, setActiveView, kind }) {
  if (window.__cinaStudioMode !== "full") return <SimpleViewSwitch activeView={activeView} setActiveView={setActiveView} kind={kind}/>;
  const groups = studioViewGroups(kind);
  return (
    <nav className="cina-topnav" style={{ display: "flex", alignItems: "stretch", gap: 2, height: "100%" }}>
      <style>{`
        @media (max-width: 1200px) {
          .cina-topnav .vsw-label { display: none; }
          .cina-topnav button[data-tour] { padding: 0 9px !important; gap: 0 !important; }
        }
      `}</style>
      {groups.map((g, gi) => {
        const primary = g.views[0];
        if (!primary) return null;
        const groupActive = g.views.some(v => v.id === activeView);
        const btnLabel = g.meta ? "Director AI" : (g.label || primary.label);
        return (
          <React.Fragment key={gi}>
            {g.meta && (
              <span style={{ width: 1, height: 18, background: "var(--c-line-2)", alignSelf: "center", margin: "0 6px", flexShrink: 0 }}/>
            )}
            <button
              data-tour={primary.id}
              onClick={() => setActiveView(primary.id)}
              style={{
                position: "relative",
                height: "100%", padding: "0 11px", border: "none",
                borderBottom: groupActive ? "2px solid var(--c-amber)" : "2px solid transparent",
                display: "inline-flex", alignItems: "center", gap: 6,
                background: groupActive ? "rgba(var(--accent-rgb),.08)" : "transparent",
                borderRadius: 0,
                fontSize: "var(--fs-label)", fontWeight: groupActive ? 700 : 500,
                letterSpacing: ".08em", textTransform: "uppercase",
                color: groupActive ? "var(--c-amber)" : "var(--c-ink-2)",
                whiteSpace: "nowrap", cursor: "pointer",
                transition: "color .14s ease, background .14s ease",
                fontFamily: "var(--f-mono)",
              }}
              onMouseEnter={e => { if (!groupActive) { e.currentTarget.style.color = "var(--c-ink)"; e.currentTarget.style.background = "var(--c-panel-2)"; } }}
              onMouseLeave={e => { if (!groupActive) { e.currentTarget.style.color = "var(--c-ink-2)"; e.currentTarget.style.background = "transparent"; } }}
            >
              <Icon name={VIEW_ICONS[primary.id] || "dot"} size={14}/>
              <span className="vsw-label">{btnLabel}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

function CrewDrawer({ open, onClose }) {
  return (
    <>
      {/* scrim */}
      {open && (
        <div onClick={onClose} style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,.45)",
          zIndex: 50, opacity: open ? 1 : 0, transition: "opacity .2s ease",
        }}/>
      )}
      {/* panel */}
      <aside style={{
        position: "absolute", top: 0, right: 0, bottom: 0,
        width: 320, background: "var(--c-panel)",
        borderLeft: "1px solid var(--c-line)",
        zIndex: 51,
        transform: open ? "translateX(0)" : "translateX(110%)",
        transition: "transform .26s cubic-bezier(.2,.8,.2,1)",
        display: "flex", flexDirection: "column",
        boxShadow: "0 30px 80px rgba(0,0,0,.5)",
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid var(--c-line)",
        }}>
          <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>Crew</span>
          <div style={{ flex: 1 }}/>
          <button onClick={onClose} className="btn btn-icon btn-ghost" aria-label="Close" title="Close"><Icon name="x" size={12}/></button>
        </div>

        <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {window.AGENTS.map(a => <AgentRow key={a.id} agent={a}/>)}
        </div>

        <div style={{ padding: "16px 20px 8px", borderTop: "1px solid var(--c-line)" }}>
          <div className="t-label" style={{ marginBottom: 8 }}>Recent</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
          {window.ACTIVITY.map((e, i) => (
            <div key={i} style={{
              display: "flex", gap: 10, padding: "8px 0",
              borderBottom: i < window.ACTIVITY.length - 1 ? "1px solid var(--c-line)" : "none",
            }}>
              <AgentBadge agent={e.agent} size={14}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "var(--c-ink-2)", fontSize: "var(--fs-body)", lineHeight: 1.45, textWrap: "pretty" }}>{e.text}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 2 }}>{e.t}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--c-line)", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span className="t-label">Budget</span>
          <span className="t-mono t-num" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }}>
            <span style={{ color: "var(--c-amber)" }}>342</span> / 1000
          </span>
        </div>
      </aside>
    </>
  );
}

function AgentRow({ agent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <AgentBadge agent={agent.id} size={20}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{agent.name}</span>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", textTransform: "uppercase", letterSpacing: ".08em" }}>{agent.status}</span>
        </div>
        <div style={{ marginTop: 5, height: 1.5, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
          <div style={{ width: `${agent.load * 100}%`, height: "100%", background: agent.color, opacity: 0.85 }}/>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Shell, FormatTag, FORMAT_COLORS });
window.cinaActiveFilm = () => (window.PROJECTS || []).find(p => p.id === window.__cinaActiveFilmId) || (window.PROJECTS || [])[0];

// ─── Project switcher dropdown ──────────────────────────────────────
function ProjectSwitcher({ activeFilmId, activeKind, onSwitch, onNewFilm }) {
  const [open, setOpen] = useStateSh(false);
  const ref = React.useRef(null);

  useEffectSh(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const projects = window.PROJECTS || [];
  const active = projects.find(p => p.id === activeFilmId) || projects[0];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 7,
          background: open ? "var(--c-panel)" : "transparent", border: "none", padding: "5px 10px",
          cursor: "pointer", color: "var(--c-ink-2)", borderRadius: "var(--r-2)", height: 30,
          transition: "background .12s ease",
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = "var(--c-panel)"; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = open ? "var(--c-panel)" : "transparent"; }}
        title="Switch project"
      >
        <span className="t-display" style={{
          fontSize: "var(--fs-body)", fontStyle: "italic",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220,
          color: "var(--c-ink)",
        }}>
          {active?.title || "Last Light"}
        </span>
        <FormatTag kind={activeKind}/>
        <Icon name="chev-d" size={11}/>
      </button>

      {open && (
        <div style={{
          position: "absolute", left: 0, top: "calc(100% + 6px)", zIndex: 100,
          width: 310,
          background: "var(--c-panel)",
          border: "1px solid var(--c-line)",
          boxShadow: "0 20px 60px rgba(0,0,0,.55)",
          borderRadius: "var(--r-3)",
          display: "flex", flexDirection: "column",
          maxHeight: 420,
          animation: "profileFade .14s ease",
        }}>
          <div className="t-mono" style={{
            fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)",
            padding: "12px 14px 8px", flexShrink: 0,
          }}>YOUR SLATE</div>

          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 6px" }}>
            {projects.map(p => {
              const isCurrent = p.id === activeFilmId;
              const fmt = (window.CINA_FORMATS || {})[p.kind] || {};
              const color = FORMAT_COLORS[p.kind] || "var(--c-ink-2)";
              return (
                <button key={p.id}
                  onClick={() => { if (!isCurrent) { onSwitch(p.id); } setOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    width: "100%", padding: "10px 10px",
                    background: isCurrent ? "var(--c-panel-2)" : "transparent",
                    border: "none", borderRadius: "var(--r-2)",
                    textAlign: "left", cursor: isCurrent ? "default" : "pointer",
                    transition: "background .1s ease",
                  }}
                  onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = "var(--c-panel-2)"; }}
                  onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = isCurrent ? "var(--c-panel-2)" : "transparent"; }}
                >
                  {/* Color dot */}
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: color, flexShrink: 0,
                    boxShadow: isCurrent ? `0 0 8px ${color === "var(--c-amber)" ? "rgba(var(--accent-rgb),.5)" : color + "88"}` : "none",
                  }}/>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="t-display" style={{
                        fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        lineHeight: 1.1,
                      }}>{p.title}</span>
                      <FormatTag kind={p.kind}/>
                    </div>
                    <div className="t-mono" style={{
                      fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 3,
                    }}>
                      {p.code} · {p.stage} · {p.runtime || "—"}
                    </div>
                  </div>
                  {/* Current indicator */}
                  {isCurrent && (
                    <span className="t-mono" style={{
                      fontSize: "var(--fs-label)", letterSpacing: ".16em", color:  "var(--c-amber)",
                      flexShrink: 0,
                    }}>OPEN</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sticky new-film button */}
          <div style={{
            padding: "8px 8px 10px", borderTop: "1px solid var(--c-line)",
            flexShrink: 0,
          }}>
            <button
              onClick={() => { setOpen(false); onNewFilm(); }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", height: 38, borderRadius: "var(--r-2)",
                background: "var(--c-amber)", color: "var(--c-void)",
                border: "none", cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                letterSpacing: ".16em", fontWeight: 700,
                textTransform: "uppercase",
                transition: "filter .12s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
              onMouseLeave={e => e.currentTarget.style.filter = "none"}
            >
              <Icon name="plus" size={12}/> New film
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Credits slide-in payment panel ─────────────────────────────────
const CREDIT_PACKS = [
  { id: "starter",  credits: 100,  price: "$4.99",  perCredit: "$0.05", popular: false },
  { id: "standard", credits: 500,  price: "$19.99", perCredit: "$0.04", popular: true  },
  { id: "pro",      credits: 2000, price: "$59.99", perCredit: "$0.03", popular: false },
  { id: "studio",   credits: 5000, price: "$129.99",perCredit: "$0.026",popular: false },
];

function CreditsSlidePanel({ open, onClose }) {
  const credits = (window.useCinaCredits ? window.useCinaCredits() : 342);
  const [selectedPack, setSelectedPack] = useStateSh("standard");
  const [purchasing, setPurchasing] = useStateSh(false);
  const [purchaseSuccess, setPurchaseSuccess] = useStateSh(false);

  const buyCredits = () => {
    const pack = CREDIT_PACKS.find(p => p.id === selectedPack);
    if (!pack) return;
    const priceNum = parseFloat(String(pack.price).replace(/[^0-9.]/g, "")) || 19.99;
    if (typeof window.openPay === "function") {
      onClose?.();
      window.openPay({
        kind: "credits",
        title: `${pack.credits.toLocaleString()} Render Credits`,
        subtitle: "Cina Studio · Instant Render Currency",
        priceUSD: priceNum,
        perks: [
          "Powers 4K Nano Banana stills, Omni Flash video & Lyria Score",
          "Added to your Studio balance immediately on confirmation",
          "15% routed back to the cited Director DNA pool",
        ],
        onConfirm: () => {
          if (window.CinaCredits) window.CinaCredits.add(pack.credits);
          setPurchaseSuccess(true);
          setTimeout(() => setPurchaseSuccess(false), 2400);
          if (window.toast) window.toast({ title: "CREDITS ADDED", text: `+${pack.credits} credits`, kind: "good" });
        },
      });
      return;
    }
    setPurchasing(true);
    setTimeout(() => {
      setPurchasing(false);
      setPurchaseSuccess(true);
      if (window.CinaCredits) window.CinaCredits.add(pack.credits);
      setTimeout(() => setPurchaseSuccess(false), 2400);
      if (window.toast) window.toast({ title: "CREDITS ADDED", text: `+${pack.credits} credits`, kind: "good" });
    }, 800);
  };

  return (
    <>
      {/* Scrim */}
      {open && (
        <div onClick={onClose} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
          zIndex: 200,
        }}/>
      )}

      {/* Panel */}
      <aside style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: 380,
        background: "var(--c-panel)",
        borderLeft: "1px solid var(--c-line)",
        zIndex: 201,
        transform: open ? "translateX(0)" : "translateX(110%)",
        transition: "transform .28s cubic-bezier(.2,.8,.2,1)",
        display: "flex", flexDirection: "column",
        boxShadow: "0 30px 80px rgba(0,0,0,.6)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 22px", borderBottom: "1px solid var(--c-line)", flexShrink: 0,
        }}>
          <div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", letterSpacing: "-0.01em" }}>Credits</div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 4 }}>RENDER CURRENCY</div>
          </div>
          <button onClick={onClose} className="btn btn-icon btn-ghost" style={{ width: 30, height: 30 }} aria-label="Close" title="Close">
            <Icon name="x" size={12}/>
          </button>
        </div>

        {/* Balance */}
        <div style={{
          padding: "22px 22px 18px",
          borderBottom: "1px solid var(--c-line)",
          flexShrink: 0,
        }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase", marginBottom: 10 }}>Current balance</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span className="t-display t-num" style={{ fontStyle: "italic", fontSize: "var(--fs-display)", fontWeight: 400, color: "var(--c-amber)", lineHeight: .9, letterSpacing: "-0.02em" }}>{credits}</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em" }}>/ 1000 plan cap</span>
          </div>
          {/* Usage bar */}
          <div style={{ marginTop: 14, height: 4, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, credits / 10)}%`, height: "100%", background: credits > 200 ? "var(--c-amber)" : "var(--c-bad)", transition: "width .6s ease" }}/>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>USED THIS MONTH</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{1000 - credits} credits</span>
          </div>
        </div>

        {/* Pack selection */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase", marginBottom: 14 }}>Buy credits</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CREDIT_PACKS.map(pack => {
              const sel = selectedPack === pack.id;
              return (
                <button key={pack.id}
                  onClick={() => setSelectedPack(pack.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 14px",
                    background: sel ? "rgba(var(--accent-rgb),.08)" : "transparent",
                    border: `1.5px solid ${sel ? "var(--c-amber)" : "var(--c-line-2)"}`,
                    borderRadius: "var(--r-2)", cursor: "pointer",
                    textAlign: "left", width: "100%",
                    transition: "border-color .12s ease, background .12s ease",
                    position: "relative",
                  }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = "var(--c-line-3)"; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = "var(--c-line-2)"; }}
                >
                  {/* Radio */}
                  <span style={{
                    width: 18, height: 18, borderRadius: "50%",
                    border: `2px solid ${sel ? "var(--c-amber)" : "var(--c-line-2)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "border-color .12s",
                  }}>
                    {sel && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--c-amber)" }}/>}
                  </span>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", lineHeight: 1, letterSpacing: "-0.01em" }}>{pack.credits.toLocaleString()}</span>
                      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em" }}>credits</span>
                    </div>
                    <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 4 }}>{pack.perCredit} / credit</div>
                  </div>
                  {/* Price */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div className="t-display t-num" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: sel ? "var(--c-amber)" : "var(--c-ink)", lineHeight: 1 }}>{pack.price}</div>
                  </div>
                  {/* Popular badge */}
                  {pack.popular && (
                    <span className="t-mono" style={{
                      position: "absolute", top: -8, right: 12,
                      fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
                      background: "var(--c-amber)", color: "var(--c-void)",
                      padding: "2px 8px", borderRadius: "var(--r-1)",
                    }}>POPULAR</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* What credits buy */}
          <div style={{ marginTop: 22, padding: "14px 0", borderTop: "1px solid var(--c-line)" }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase", marginBottom: 12 }}>What credits buy</div>
            {[
              { label: "AI render (1 shot)", cost: "4 cr" },
              { label: "Script generation", cost: "8 cr" },
              { label: "Score composition", cost: "12 cr" },
              { label: "Full episode render", cost: "40 cr" },
              { label: "Branch fork render", cost: "24 cr" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{r.label}</span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{r.cost}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Purchase button — sticky bottom */}
        <div style={{
          padding: "14px 22px 18px", borderTop: "1px solid var(--c-line)",
          flexShrink: 0,
        }}>
          {purchaseSuccess ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              height: 44, borderRadius: "var(--r-2)",
              background: "rgba(61, 189, 105, .12)", border: "1px solid var(--c-good)",
              color: "var(--c-good)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
            }}>✓ CREDITS ADDED</div>
          ) : (
            <button
              onClick={buyCredits}
              disabled={purchasing}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", height: 44, borderRadius: "var(--r-2)",
                background: purchasing ? "var(--c-panel-2)" :  "var(--c-amber)",
                color: purchasing ? "var(--c-ink-3)" : tkc("void"),
                border: "none", cursor: purchasing ? "wait" : "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                letterSpacing: ".16em", fontWeight: 700,
                textTransform: "uppercase",
                transition: "filter .12s ease, background .2s ease",
              }}
              onMouseEnter={e => { if (!purchasing) e.currentTarget.style.filter = "brightness(1.1)"; }}
              onMouseLeave={e => e.currentTarget.style.filter = "none"}
            >
              {purchasing ? (
                <>Processing...</>
              ) : (
                <>Buy {CREDIT_PACKS.find(p => p.id === selectedPack)?.credits.toLocaleString()} credits · {CREDIT_PACKS.find(p => p.id === selectedPack)?.price}</>
              )}
            </button>
          )}
          <div style={{ textAlign: "center", marginTop: 10 }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" }}>Powered by Slide-in Pay · Secure checkout</span>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Team & roles slide-in panel ────────────────────────────────────
const TEAM_ROLES = [
  { id: "owner",    label: "Owner",       can: "Full control · billing · delete" },
  { id: "director", label: "Director",    can: "Edit all · publish · mint" },
  { id: "editor",   label: "Editor",      can: "Edit cuts, score, titles" },
  { id: "writer",   label: "Writer",      can: "Script & story bible only" },
  { id: "viewer",   label: "Viewer",      can: "Comment & view, no edits" },
];
const TEAM_KEY = "cina:studio:team";

function TeamSlidePanel({ open, onClose }) {
  const seed = [
    { id: "u-you", name: window.CINA?.handle || "you.eth", role: "owner", you: true, color: "var(--c-amber)" },
    { id: "u-mara", name: "mara.eth", role: "editor", color: tkc("cat-1") },
    { id: "u-jun", name: "jun.cina.eth", role: "writer", color: tkc("good") },
  ];
  const load = () => { try { return JSON.parse(localStorage.getItem(TEAM_KEY)) || seed; } catch (e) { return seed; } };
  const [members, setMembers] = useStateSh(load());
  const save = (next) => { setMembers(next); try { localStorage.setItem(TEAM_KEY, JSON.stringify(next)); } catch (e) {} };

  const [invite, setInvite] = useStateSh("");
  const [inviteRole, setInviteRole] = useStateSh("editor");

  const addMember = () => {
    const handle = invite.trim();
    if (!handle) return;
    const colors = [tkc("amber-d"), tkc("cat-2"), tkc("bad"), tkc("good"), tkc("cat-2")];
    const next = [...members, { id: "u-" + Date.now(), name: handle, role: inviteRole, color: colors[members.length % colors.length] }];
    save(next); setInvite("");
    window.toast && window.toast({ title: "INVITE SENT", text: handle + " added as " + inviteRole + ".", kind: "good" });
  };
  const changeRole = (id, role) => { save(members.map(m => m.id === id ? { ...m, role } : m)); };
  const removeMember = (m) => { save(members.filter(x => x.id !== m.id)); window.toast && window.toast({ title: "REMOVED", text: m.name + " no longer has access.", kind: "info" }); };

  return (
    <>
      {open && <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 200 }}/>}
      <aside style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 400,
        background: "var(--c-panel)", borderLeft: "1px solid var(--c-line)", zIndex: 201,
        transform: open ? "translateX(0)" : "translateX(110%)",
        transition: "transform .28s cubic-bezier(.2,.8,.2,1)",
        display: "flex", flexDirection: "column", boxShadow: "0 30px 80px rgba(0,0,0,.6)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--c-line)", flexShrink: 0 }}>
          <div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>Team &amp; roles</div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 4 }}>WHO CAN TOUCH THIS SLATE</div>
          </div>
          <button onClick={onClose} className="btn btn-icon btn-ghost" style={{ width: 30, height: 30 }} aria-label="Close" title="Close"><Icon name="x" size={12}/></button>
        </div>

        {/* Invite */}
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--c-line)", flexShrink: 0 }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase", marginBottom: 10 }}>Invite a collaborator</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={invite} onChange={e => setInvite(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addMember(); }}
              placeholder="handle.eth or email"
              style={{ flex: 1, minWidth: 0, background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: "10px 12px", color: "var(--c-ink)", fontSize: "var(--fs-body)", outline: "none" }}/>
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
              style={{ background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink)", fontSize: "var(--fs-body)", padding: "0 8px", cursor: "pointer" }}>
              {TEAM_ROLES.filter(r => r.id !== "owner").map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>
          <button onClick={addMember} disabled={!invite.trim()} style={{
            marginTop: 10, width: "100%", height: 40, borderRadius: "var(--r-2)", border: "none",
            background: invite.trim() ? "var(--c-amber)" : "var(--c-line)", color: invite.trim() ? tkc("void") : "var(--c-ink-4)",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, cursor: invite.trim() ? "pointer" : "not-allowed",
          }}>SEND INVITE</button>
        </div>

        {/* Members */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase", marginBottom: 12 }}>{members.length} member{members.length !== 1 ? "s" : ""}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {members.map(m => {
              const role = TEAM_ROLES.find(r => r.id === m.role) || TEAM_ROLES[2];
              return (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)" }}>
                  <span style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: "var(--c-bg)", border: `1.5px solid ${m.color}`, color: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)" }}>{m.name.slice(0, 2)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</span>
                      {m.you && <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", border: "1px solid rgba(var(--accent-rgb),.4)", borderRadius: "var(--r-1)", padding: "1px 5px" }}>YOU</span>}
                    </div>
                    <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 3, letterSpacing: ".08em" }}>{role.can}</div>
                  </div>
                  {m.role === "owner" || m.you ? (
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", flexShrink: 0 }}>OWNER</span>
                  ) : (
                    <>
                      <select value={m.role} onChange={e => changeRole(m.id, e.target.value)}
                        style={{ background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink-2)", fontSize: "var(--fs-label)", padding: "5px 6px", cursor: "pointer", flexShrink: 0 }}>
                        {TEAM_ROLES.filter(r => r.id !== "owner").map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                      </select>
                      <button onClick={() => removeMember(m)} className="btn btn-icon btn-ghost" style={{ width: 28, height: 28, flexShrink: 0 }} title="Remove"><Icon name="x" size={11}/></button>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Role legend */}
          <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid var(--c-line)" }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase", marginBottom: 10 }}>What roles can do</div>
            {TEAM_ROLES.map(r => (
              <div key={r.id} style={{ display: "flex", gap: 10, padding: "5px 0", alignItems: "baseline" }}>
                <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", width: 64, flexShrink: 0 }}>{r.label}</span>
                <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)", lineHeight: 1.4 }}>{r.can}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Profile menu ──────────────────────────────────────────────────
function ProfileMenu_shell({ setRoute, setActiveView, setTweak }) {
  const [open, setOpen] = useStateSh(false);
  const ref = React.useRef(null);
  useCinaId();
  const cinaGlyph = window.cinaGlyph ? window.cinaGlyph() : "yo";
  const cinaHandle = window.CINA ? window.CINA.handle : "you.eth";

  useEffectSh(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const goWatch = () => { window.location.href = "index.html"; };
  const goProducers = () => { window.location.href = "Producers.html"; };
  const goDocs = () => { window.location.href = "index.html#/about"; };
  const signOut = () => { if (window.cinaSignOut) window.cinaSignOut(); else window.location.href = "index.html"; };

  const item = (icon, label, hint, onClick, danger) => (
    <button onClick={() => { onClick && onClick(); setOpen(false); }} style={{
      display: "flex", alignItems: "center", gap: 12,
      width: "100%", padding: "8px 14px",
      background: "transparent", border: "none", textAlign: "left", cursor: "pointer",
      color: danger ? "var(--c-bad)" : "var(--c-ink)",
      fontSize: "var(--fs-body)",
    }}
    onMouseEnter={e => e.currentTarget.style.background = "var(--c-bg-elev, rgba(255,255,255,.04))"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <span style={{
        width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center",
        color: danger ? "var(--c-bad)" : "var(--c-ink-3)",
      }}>
        <Icon name={icon} size={11}/>
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {hint && (
        <span className="t-mono" style={{
          fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em",
          border: "1px solid var(--c-line-2)", padding: "1px 5px", borderRadius: "var(--r-1)",
        }}>{hint}</span>
      )}
    </button>
  );

  const sectionLabel = (label) => (
    <div className="t-mono" style={{
      padding: "8px 14px 4px", fontSize: "var(--fs-label)",
      letterSpacing: ".16em", color: "var(--c-ink-4)",
    }}>{label}</div>
  );

  const divider = (key) => <div key={key} style={{ height: 1, background: "var(--c-line)", margin: "6px 0" }}/>;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: 34, height: 34, borderRadius: "50%",
        background: "var(--c-panel-2)",
        border: open ? "1px solid var(--c-amber)" : "1px solid var(--c-line-2)",
        color:  "var(--c-amber)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", fontWeight: 500,
        transition: "border-color .14s ease",
      }}
      onMouseEnter={e => { if (!open) e.currentTarget.style.borderColor = "var(--c-amber-d)"; }}
      onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = "var(--c-line-2)"; }}
      title={`${cinaHandle} · Director`}>{cinaGlyph}</button>

      {open && (
        <div style={{
          position: "absolute", top: 42, right: 0,
          width: 260,
          background: "var(--c-panel)",
          border: "1px solid var(--c-line)",
          boxShadow: "0 20px 60px rgba(0,0,0,.55)",
          borderRadius: "var(--r-2)",
          padding: "8px 0",
          zIndex: 100,
          animation: "profileFade .14s ease",
        }}>
          {/* Identity */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px 12px" }}>
            <span style={{
              width: 36, height: 36, borderRadius: "50%",
              background: `linear-gradient(135deg, ${tkc("line")}, ${tkc("panel-2")})`,
              border: "1px solid var(--c-line-2)",
              color:  "var(--c-amber)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", fontWeight: 500,
              flexShrink: 0,
            }}>{cinaGlyph}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{cinaHandle}</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" }}>Director · Pro</div>
            </div>
          </div>

          {divider("d1")}

          {sectionLabel("ACCOUNT")}
          {item("actor",    "Profile",         null, () => { window.dispatchEvent(new CustomEvent("cina:openPanel", { detail: "profile" })); })}
          {item("settings", "Preferences",     null, () => { window.dispatchEvent(new CustomEvent("cina:openPanel", { detail: "preferences" })); })}
          {item("ticket",   "Credits & billing", "342 cr", () => { window.dispatchEvent(new CustomEvent("cina:openPanel", { detail: "credits" })); })}
          {item("wand",     "Keyboard shortcuts", "?", () => { window.setShortcuts && window.setShortcuts(true); })}

          {divider("d2")}

          {sectionLabel("SWITCH SURFACE")}
          {item("globe",    "Cina Watch",      null, goWatch)}
          {item("share",    "Cina Producers",  null, goProducers)}

          {divider("d3")}

          {sectionLabel("WORKSPACE")}
          {item("film",     "Back to slate",   null, () => setRoute("dashboard"))}
          {item("plus",     "New film",        null, () => setRoute("new"))}
          {item("actor",    "Team & roles",    null, () => { window.dispatchEvent(new CustomEvent("cina:openPanel", { detail: "team" })); })}
          {item("alert",    "Help & docs",     null, () => { window.dispatchEvent(new CustomEvent("cina:openPanel", { detail: "help" })); })}

          {divider("d4")}

          {item("x",        "Sign out",        null, signOut, true)}
        </div>
      )}

      <style>{`
        @keyframes profileFade {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
