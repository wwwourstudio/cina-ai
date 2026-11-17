// station-flow.jsx — Unified 7-Step Filmmaking Pipeline Rail & Consolidated Stage Hubs
//
// 01 DNA → 02 Script → 03 Cast → 04 Stills → 05 Video → 06 Edit → 07 Ship
// Plus unified internal hubs for:
//   • 06 Edit (Timeline NLE | Score & Lyria | Titles | Cuts & Trailers | Quick Dock)
//   • 07 Ship (Splits & Mint | Deliver & Export | Live Premiere)
//   • Director AI (Copilot | Pipeline | Memory | Autopilot)

(function () {
  const { useState: usSF, useEffect: ueSF, useMemo: umSF } = React;

  const sfRead = (k, fb) => {
    try {
      const v = JSON.parse(localStorage.getItem(k));
      return v == null ? fb : v;
    } catch (e) {
      return fb;
    }
  };

  const STATIONS = [
    { id: "dna",    n: "01", label: "DNA",    entry: "bible",    views: ["bible"] },
    { id: "write",  n: "02", label: "Script", entry: "script",   views: ["script", "episodes"] },
    { id: "cast",   n: "03", label: "Cast",   entry: "vault",    views: ["vault"] },
    { id: "stills", n: "04", label: "Stills", entry: "board",    views: ["board"] },
    { id: "motion", n: "05", label: "Video",  entry: "generate", views: ["generate", "branch"] },
    { id: "edit",   n: "06", label: "Edit",   entry: "editor",   views: ["editor", "cuts", "score", "titles", "dock"] },
    { id: "ship",   n: "07", label: "Ship",   entry: "mint",     views: ["mint", "deliver", "watch"] },
  ];

  function getLiveSummary() {
    if (window.CinaPipeline && typeof window.CinaPipeline.getSummary === "function") {
      return window.CinaPipeline.getSummary();
    }
    return {};
  }

  // ─── Single Unified Pipeline Rail inside Top Nav Row 2 ───────────────────
  function UnifiedPipelineRail({ activeView, setActiveView, kind }) {
    const [tick, setTick] = usSF(0);
    const summary = umSF(getLiveSummary, [tick, activeView]);

    ueSF(() => {
      const bump = () => setTick(t => t + 1);
      const iv = setInterval(bump, 5000);
      window.addEventListener("cina:pipeline-change", bump);
      window.addEventListener("cina:dna-updated", bump);
      window.addEventListener("cina:board-sync", bump);
      window.addEventListener("cina:board-writeback", bump);
      window.addEventListener("cina:chain-tx", bump);
      window.addEventListener("storage", bump);
      return () => {
        clearInterval(iv);
        window.removeEventListener("cina:pipeline-change", bump);
        window.removeEventListener("cina:dna-updated", bump);
        window.removeEventListener("cina:board-sync", bump);
        window.removeEventListener("cina:board-writeback", bump);
        window.removeEventListener("cina:chain-tx", bump);
        window.removeEventListener("storage", bump);
      };
    }, []);

    const isMeta = ["chat", "pipeline", "memory", "autopilot"].includes(activeView);
    const curIdx = STATIONS.findIndex(s => s.views.includes(activeView));
    const isSeries = kind === "series";
    const isBranched = kind === "branched";
    const nextAction = window.CinaPipeline?.getNextAction
      ? window.CinaPipeline.getNextAction(activeView)
      : (() => {
          const nst = curIdx >= 0 && curIdx < STATIONS.length - 1 ? STATIONS[curIdx + 1] : null;
          if (nst) return { label: `SEND NEXT · ${nst.n} ${nst.label.toUpperCase()} →`, target: nst.entry, title: `Advance to Step ${nst.n} · ${nst.label}` };
          if (isMeta) return { label: "START · 01 DNA →", target: "bible", title: "Begin at 01 DNA" };
          return { label: "▶ WATCH PREMIERE", target: "__watch", title: "Watch premiere live" };
        })();

    const handleSendNext = () => {
      if (window.CinaPipeline && typeof window.CinaPipeline.sendNext === "function") {
        window.CinaPipeline.sendNext(activeView);
      } else if (nextAction.target === "__watch") {
        window.open("index.html#/", "_self");
      } else {
        setActiveView(nextAction.target);
      }
    };

    const isFinalCta = nextAction.target === "__watch";

    return (
      <nav
        aria-label="Production workflow"
        className="cina-topnav"
        style={{
          display: "flex", alignItems: "stretch", width: "100%", height: "100%",
          gap: 0, overflowX: "auto", overflowY: "hidden",
        }}
      >
        {/* Director AI suite */}
        <button
          data-tour="chat"
          onClick={() => setActiveView("chat")}
          style={{
            height: "100%", padding: "0 14px", border: "none",
            borderBottom: isMeta ? "2px solid var(--c-amber)" : "2px solid transparent",
            borderRadius: 0, cursor: "pointer", whiteSpace: "nowrap",
            display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0,
            background: isMeta ? "rgba(var(--accent-rgb),.08)" : "transparent",
            color: isMeta ? "var(--c-amber)" : "var(--c-ink-2)",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
            fontWeight: isMeta ? 700 : 500, letterSpacing: ".09em", textTransform: "uppercase",
          }}
        >
          <Icon name="chat" size={13}/>
          <span>Director AI</span>
        </button>

        <span style={{ width: 1, height: 18, background: "var(--c-line-2)", alignSelf: "center", margin: "0 6px", flexShrink: 0 }}/>

        {/* Ordered 7-step production line */}
        {STATIONS.map((st, idx) => {
          const on = st.views.includes(activeView);
          const info = summary[st.id] || {};
          const done = Boolean(info.done);
          return (
            <React.Fragment key={st.id}>
              {idx > 0 && (
                <span aria-hidden="true" style={{
                  alignSelf: "center", color: "var(--c-ink-4)", fontSize: "10px",
                  padding: "0 2px", flexShrink: 0, userSelect: "none",
                }}>›</span>
              )}
              <button
                data-tour={st.entry}
                onClick={() => setActiveView(st.entry)}
                title={info.sub || st.label}
                style={{
                  position: "relative", height: "100%", padding: "0 12px", border: "none",
                  borderBottom: on ? "2px solid var(--c-amber)" : "2px solid transparent",
                  borderRadius: 0, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: on ? "rgba(var(--accent-rgb),.09)" : "transparent",
                  color: on ? "var(--c-amber)" : "var(--c-ink-2)",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                  fontWeight: on ? 700 : 500, letterSpacing: ".09em", textTransform: "uppercase",
                  transition: "color .12s ease, background .12s ease",
                }}
                onMouseEnter={e => { if (!on) { e.currentTarget.style.color = "var(--c-ink)"; e.currentTarget.style.background = "var(--c-panel-2)"; } }}
                onMouseLeave={e => { if (!on) { e.currentTarget.style.color = "var(--c-ink-2)"; e.currentTarget.style.background = "transparent"; } }}
              >
                <span style={{
                  width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                  background: done ? "var(--c-good)" : on ? "var(--c-amber)" : "var(--c-line-3)",
                }}/>
                <span style={{ opacity: on ? 1 : 0.65 }}>{st.n}</span>
                <span>{st.label}</span>
                {info.badge != null && (
                  <span style={{
                    fontSize: "9.5px", padding: "1px 5px",
                    border: `1px solid ${on ? "rgba(var(--accent-rgb),.38)" : "var(--c-line)"}`,
                    color: on ? "var(--c-amber)" : "var(--c-ink-4)",
                    borderRadius: 0, lineHeight: 1.2,
                  }}>{info.badge}</span>
                )}
              </button>
            </React.Fragment>
          );
        })}

        {/* Format-specific inline quick switcher (Series -> Episodes, Branched -> Branches) */}
        {isSeries && curIdx === 1 && (
          <button
            onClick={() => setActiveView(activeView === "episodes" ? "script" : "episodes")}
            style={{
              alignSelf: "center", marginLeft: 8, height: 26, padding: "0 10px",
              borderRadius: 0, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              background: activeView === "episodes" ? "var(--c-panel-3)" : "transparent",
              border: `1px solid ${activeView === "episodes" ? "var(--c-amber)" : "var(--c-line-2)"}`,
              color: activeView === "episodes" ? "var(--c-amber)" : "var(--c-ink-3)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em",
            }}
          >{activeView === "episodes" ? "← Screenplay" : "Episodes ↗"}</button>
        )}
        {isBranched && curIdx === 4 && (
          <button
            onClick={() => setActiveView(activeView === "branch" ? "generate" : "branch")}
            style={{
              alignSelf: "center", marginLeft: 8, height: 26, padding: "0 10px",
              borderRadius: 0, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              background: activeView === "branch" ? "var(--c-panel-3)" : "transparent",
              border: `1px solid ${activeView === "branch" ? "var(--c-amber)" : "var(--c-line-2)"}`,
              color: activeView === "branch" ? "var(--c-amber)" : "var(--c-ink-3)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em",
            }}
          >{activeView === "branch" ? "← Render Shot" : "Branch Tree ↗"}</button>
        )}

        <span style={{ flex: 1, minWidth: 12 }}/>

        {/* Single contextual Send Next CTA right inside the rail */}
        <button
          onClick={handleSendNext}
          className="t-mono"
          style={{
            alignSelf: "center", display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0,
            height: 28, padding: "0 12px", borderRadius: 0, cursor: "pointer",
            background: isFinalCta ? "var(--c-amber)" : "rgba(var(--accent-rgb),.12)",
            border: "1px solid var(--c-amber)",
            color: isFinalCta ? "var(--c-on-amber)" : "var(--c-amber)",
            fontSize: "var(--fs-label)", letterSpacing: ".1em",
            fontWeight: 700, whiteSpace: "nowrap",
          }}
          title={nextAction.title}
        >
          {nextAction.label}
        </button>
      </nav>
    );
  }

  // ─── Unified 06 EDIT Hub (Timeline | Score & Lyria | Titles | Cuts | Quick Dock) ──
  function UnifiedEditHub({ activeView, setActiveView, kind, activeFilmId }) {
    const [, setTick] = usSF(0);
    ueSF(() => {
      const bump = () => setTick(t => t + 1);
      window.addEventListener("cina:pipeline-change", bump);
      return () => window.removeEventListener("cina:pipeline-change", bump);
    }, []);
    const summary = getLiveSummary();
    const editInfo = summary.edit || {};
    const TABS = [
      { id: "editor", label: "Timeline NLE", badge: editInfo.v1Count ? `${editInfo.v1Count}v` : null },
      { id: "score",  label: "Score & Lyria", badge: editInfo.a3Count ? `${editInfo.a3Count}a` : null },
      { id: "titles", label: "Titles",        badge: editInfo.v2Count ? `${editInfo.v2Count}t` : null },
      { id: "cuts",   label: "Trailers & Cuts" },
      ...(window.StudioWorkspace ? [{ id: "dock", label: "Quick NLE Dock" }] : []),
    ];

    const lockAndShip = () => {
      const latest = getLiveSummary().edit || {};
      const dur = latest.duration || 42;
      const count = latest.v1Count || 0;
      if (window.CinaPipeline) {
        window.CinaPipeline.lockCutForShip({ name: "Master Cut", duration: dur, shotsCount: count, openShip: true });
      } else {
        setActiveView("mint");
      }
      window.toast?.({ title: "06 EDIT → 07 SHIP", text: `${count} picture clips (${dur}s) locked for distribution.`, kind: "good" });
    };

    ueSF(() => {
      if (!window.CinaPipeline?.registerSendNext) return;
      return window.CinaPipeline.registerSendNext(["editor", "score", "titles", "cuts", "dock"], () => {
        lockAndShip();
        return true;
      });
    }, []);

    return (
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{
          display: "flex", alignItems: "stretch", height: 38, padding: "0 18px",
          background: "var(--c-panel)", borderBottom: "1px solid var(--c-line)", flexShrink: 0,
          overflowX: "auto", gap: 2,
        }}>
          <span className="t-mono" style={{
            alignSelf: "center", fontSize: "var(--fs-label)", color: "var(--c-amber)",
            letterSpacing: ".14em", fontWeight: 700, marginRight: 12, whiteSpace: "nowrap",
          }}>06 · POST-PRODUCTION HUB</span>
          {TABS.map(t => {
            const on = activeView === t.id;
            return (
              <button key={t.id} onClick={() => setActiveView(t.id)} style={{
                height: "100%", padding: "0 14px", background: "transparent", border: "none",
                borderBottom: on ? "2px solid var(--c-amber)" : "2px solid transparent",
                borderRadius: 0, cursor: "pointer", whiteSpace: "nowrap",
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".1em",
                textTransform: "uppercase", color: on ? "var(--c-ink)" : "var(--c-ink-3)",
                fontWeight: on ? 700 : 500,
              }}>
                <span>{t.label}</span>
                {t.badge && <span style={{ fontSize: "9.5px", color: on ? "var(--c-amber)" : "var(--c-ink-4)" }}>{t.badge}</span>}
              </button>
            );
          })}
          <span style={{ flex: 1 }}/>
          <span className="t-mono" style={{ alignSelf: "center", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginRight: 12, whiteSpace: "nowrap" }}>
            {editInfo.duration || 0}s runtime{editInfo.locked ? " · CUT LOCKED" : ""}
          </span>
          <button
            onClick={lockAndShip}
            className="t-mono"
            style={{
              alignSelf: "center", height: 26, padding: "0 12px", borderRadius: 0, cursor: "pointer",
              background: editInfo.locked ? "rgba(106,163,122,.16)" : "var(--c-amber)",
              border: editInfo.locked ? "1px solid var(--c-good)" : "1px solid var(--c-amber)",
              color: editInfo.locked ? "var(--c-good)" : "var(--c-on-amber)",
              fontSize: "var(--fs-label)", letterSpacing: ".1em", fontWeight: 700, whiteSpace: "nowrap",
            }}
          >
            {editInfo.locked ? "✓ LOCKED · SEND TO 07 SHIP →" : "LOCK CUT · SEND NEXT →"}
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {activeView === "editor" && window.EditorPanel && <window.EditorPanel/>}
          {activeView === "score"  && window.ScorePanel  && <window.ScorePanel/>}
          {activeView === "titles" && window.TitlesPanel && <window.TitlesPanel/>}
          {activeView === "cuts"   && window.CutsPanel   && <window.CutsPanel/>}
          {activeView === "dock"   && window.StudioWorkspace && <window.StudioWorkspace key={activeFilmId} kind={kind} activeView="chat" setActiveView={setActiveView}/>}
        </div>
      </div>
    );
  }

  // ─── Unified 07 SHIP Hub (Splits & Mint | Deliver & Festival | Premiere) ──
  function UnifiedShipHub({ activeView, setActiveView }) {
    ueSF(() => {
      if (!window.CinaPipeline?.registerSendNext) return;
      return window.CinaPipeline.registerSendNext(["mint", "deliver"], () => {
        if (activeView === "mint") {
          setActiveView("deliver");
          window.toast?.({ title: "07 SHIP · DELIVER", text: "Master edition synced — ready for festival & format exports.", kind: "good" });
          return true;
        }
        if (activeView === "deliver") {
          setActiveView("watch");
          window.toast?.({ title: "07 SHIP · PREMIERE", text: "Deliverables packaged — live release status ready.", kind: "good" });
          return true;
        }
        return false;
      });
    }, [activeView]);

    const TABS = [
      { id: "mint",    label: "Splits & Mint" },
      { id: "deliver", label: "Deliver & Festival" },
      { id: "watch",   label: "Premiere Live" },
    ];
    return (
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{
          display: "flex", alignItems: "stretch", height: 38, padding: "0 18px",
          background: "var(--c-panel)", borderBottom: "1px solid var(--c-line)", flexShrink: 0, gap: 2,
        }}>
          <span className="t-mono" style={{
            alignSelf: "center", fontSize: "var(--fs-label)", color: "var(--c-amber)",
            letterSpacing: ".14em", fontWeight: 700, marginRight: 12, whiteSpace: "nowrap",
          }}>07 · DISTRIBUTION &amp; PAYOUTS</span>
          {TABS.map(t => {
            const on = activeView === t.id;
            return (
              <button key={t.id} onClick={() => setActiveView(t.id)} style={{
                height: "100%", padding: "0 14px", background: "transparent", border: "none",
                borderBottom: on ? "2px solid var(--c-amber)" : "2px solid transparent",
                borderRadius: 0, cursor: "pointer", whiteSpace: "nowrap",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".1em",
                textTransform: "uppercase", color: on ? "var(--c-ink)" : "var(--c-ink-3)",
                fontWeight: on ? 700 : 500,
              }}>{t.label}</button>
            );
          })}
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {activeView === "mint"    && window.MintPanel     && <window.MintPanel/>}
          {activeView === "deliver" && window.DeliveryPanel && <window.DeliveryPanel/>}
          {activeView === "watch"   && <WatchStation/>}
        </div>
      </div>
    );
  }

  // ─── Unified Director AI Suite Hub (Copilot | Pipeline | Memory | Autopilot) ──
  function UnifiedDirectorHub({ activeView, setActiveView, kind }) {
    const TABS = [
      { id: "chat",      label: "Director Room & Live Voice" },
      { id: "pipeline",  label: "Production Pipeline" },
      { id: "memory",    label: "Project Memory" },
      { id: "autopilot", label: "Autopilot" },
    ];
    return (
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{
          display: "flex", alignItems: "stretch", height: 38, padding: "0 18px",
          background: "var(--c-panel)", borderBottom: "1px solid var(--c-line)", flexShrink: 0, gap: 2,
        }}>
          <span className="t-mono" style={{
            alignSelf: "center", fontSize: "var(--fs-label)", color: "var(--c-amber)",
            letterSpacing: ".14em", fontWeight: 700, marginRight: 12, whiteSpace: "nowrap",
          }}>DIRECTOR SUITE</span>
          {TABS.map(t => {
            const on = activeView === t.id;
            return (
              <button key={t.id} onClick={() => setActiveView(t.id)} style={{
                height: "100%", padding: "0 14px", background: "transparent", border: "none",
                borderBottom: on ? "2px solid var(--c-amber)" : "2px solid transparent",
                borderRadius: 0, cursor: "pointer", whiteSpace: "nowrap",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".1em",
                textTransform: "uppercase", color: on ? "var(--c-ink)" : "var(--c-ink-3)",
                fontWeight: on ? 700 : 500,
              }}>{t.label}</button>
            );
          })}
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {activeView === "chat"      && window.DirectorHub   && <window.DirectorHub kind={kind}/>}
          {activeView === "pipeline"  && window.PipelinePanel && <window.PipelinePanel/>}
          {activeView === "memory"    && window.MemoryPanel   && <window.MemoryPanel/>}
          {activeView === "autopilot" && window.AutopilotView && <window.AutopilotView/>}
        </div>
      </div>
    );
  }

  // Backward-compatible StationFlow (no-op unless explicitly invoked)
  function StationFlow({ activeView, setActiveView }) {
    return null;
  }

  // ─── Station 07 · WATCH — the wired handoff to the public page ───────────
  function WatchStation() {
    const [, setTick] = usSF(0);
    ueSF(() => {
      const onStorage = (e) => { if (!e.key || e.key.startsWith("cina:")) setTick(t => t + 1); };
      const onChain = () => setTick(t => t + 1);
      window.addEventListener("storage", onStorage);
      window.addEventListener("cina:chain-tx", onChain);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener("cina:chain-tx", onChain);
      };
    }, []);
    const forks = sfRead("cina:fork-ledger", []);
    const sales = sfRead("cina:commerce:ledger", []);
    const settlements = sfRead("cina:chain:settlements", []);
    const chainVolume = settlements.reduce((a, s) => a + (s.grossUSD || 0), 0);
    const earned = sales.reduce((a, r) => a + (r.cut || 0), 0) + forks.length * 0.12 + chainVolume * 0.52;
    const by = {};
    forks.forEach(r => { by[r.letter] = (by[r.letter] || 0) + 1; });
    const winner = Object.entries(by).sort((a, b) => b[1] - a[1])[0];

    const stat = (label, value, sub, color) => (
      <div style={{ padding: "1.2rem 1.35rem", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".14em", color: "var(--c-ink-4)" }}>{label}</div>
        <div className="t-display t-num" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: color || "var(--c-ink)", lineHeight: 1.05, marginTop: "0.4rem" }}>{value}</div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".08em", color: "var(--c-ink-3)", marginTop: "0.35rem" }}>{sub}</div>
      </div>
    );

    return (
      <div className="sc-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", width: "100%" }}>
        <div style={{ width: "92%", maxWidth: "68rem", margin: "0 auto", padding: "3rem 0 4.5rem" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", fontWeight: 700 }}>07 · PREMIERE &amp; CHAINED SPLITS</div>
          <h1 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", margin: "0.6rem 0 0.5rem", letterSpacing: "-0.02em" }}>The film is live on Cina Watch.</h1>
          <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.65, maxWidth: "62ch", margin: 0 }}>
            Every station feeds this release: your DNA, cast LoRAs, stills, motion cuts, and smart-contract split router (`CinaSplitRouter.sol`) settle rentals, producer passes, and investor royalties automatically on every stream.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.5rem" }}>
            <a href="index.html#/" style={{
              display: "inline-flex", alignItems: "center", gap: "0.55rem", height: "2.75rem", padding: "0 1.4rem",
              borderRadius: "var(--r-2)", background: "var(--c-amber)", color: "var(--c-on-amber)", textDecoration: "none",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".14em", fontWeight: 700,
            }}>▶ OPEN CINA WATCH</a>
            <a href="index.html#/payouts" style={{
              display: "inline-flex", alignItems: "center", gap: "0.55rem", height: "2.75rem", padding: "0 1.25rem",
              borderRadius: "var(--r-2)", background: "transparent", border: "1px solid var(--c-line-2)", color: "var(--c-ink)", textDecoration: "none",
              fontSize: "var(--fs-body)",
            }}>Inspect Chained Investor Payouts →</a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))", gap: "1rem", marginTop: "2.2rem" }}>
            {stat("VIEWER PATH CHOICES", forks.length, winner ? `PATH ${winner[0]} LEADS · ${winner[1]} OF ${forks.length}` : "FORK MOMENTS LIVE IN THE PLAYER", "var(--c-amber)")}
            {stat("CHAINED SETTLEMENTS", settlements.length, settlements.length ? `$${chainVolume.toFixed(2)} ROUTED ON BASE L2` : "CinaSplitRouter.sol ACTIVE")}
            {stat("DIRECTOR NET BOOKED", "$" + earned.toFixed(2), "52% STREAM SPLIT + WARDROBE + FORKS", "var(--c-good)")}
          </div>
        </div>
      </div>
    );
  }

  Object.assign(window, { StationFlow, UnifiedPipelineRail, UnifiedEditHub, UnifiedShipHub, UnifiedDirectorHub, WatchStation });
})();
