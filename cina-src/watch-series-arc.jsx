// watch-series-arc.jsx — Season-level branching.
//
// A branch can carry ACROSS episodes: choose Path B in one episode and the
// next opens on that branch. Two pieces:
//
//   SeasonArcMap({ film })   Season-level branch map on the series page —
//                            every episode a node, forks drawn where the
//                            director shot both ways, YOUR path threaded
//                            through in amber, carry-forward edges labeled.
//   fm.carry (fork hook)     The player reads "cina:series-arc:<seriesId>"
//                            (written on every fork choice) and opens the
//                            next episode on that branch.
//
// Loaded AFTER watch-series.jsx.

(function () {
  const { useState: usSA, useEffect: ueSA, useMemo: umSA } = React;

  const SA_ROYALTY = 0.12;

  function saRead(k, fb) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch (e) { return fb; } }

  // The season's fork structure: which episodes fork, and what was chosen.
  // Fork slots are authored per-series (deterministic from the episode list);
  // choices come from the real per-film choice store + carry record.
  function saArc(film) {
    const released = film.series.filter(e => e.status === "released");
    const choices = saRead("cina:fork-choices:" + film.id, {});
    const carry = saRead("cina:series-arc:" + film.id, null);
    const ledger = (window.forkLedgerRead ? window.forkLedgerRead() : []).filter(r => r.filmId === film.id);
    const chosenLetters = Object.values(choices);

    // Fork slots: episodes 2 and 4 of the released run (or ep 2 only if short).
    const forkEps = released.length >= 4 ? [2, 4] : released.length >= 2 ? [2] : [];
    let li = 0;
    return film.series.map(e => {
      const isFork = forkEps.includes(e.ep);
      const letter = isFork ? (chosenLetters[li++] || null) : null;
      const votes = ledger.length;
      return {
        ...e,
        isFork,
        chosen: letter,
        // an unreleased or unwatched ep after a choice "opens differently"
        carriesFrom: null,
      };
    }).map((e, i, arr) => {
      const prevFork = arr.slice(0, i).reverse().find(x => x.isFork && x.chosen);
      return { ...e, carriesFrom: prevFork ? prevFork : null };
    });
  }

  function SeasonArcMap({ film }) {
    const [tick, setTick] = usSA(0);
    const arc = umSA(() => saArc(film), [film.id, tick]);
    ueSA(() => {
      const onStorage = (e) => { if (e.key && e.key.startsWith("cina:")) setTick(t => t + 1); };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }, []);
    const anyFork = arc.some(e => e.isFork);
    if (!anyFork) return null;
    const choicesMade = arc.filter(e => e.isFork && e.chosen).length;
    const ledger = (window.forkLedgerRead ? window.forkLedgerRead() : []).filter(r => r.filmId === film.id);
    const accent = film.color || tkc("amber");

    return (
      <div style={{ padding: "18px 20px 16px", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", fontWeight: 700 }}>⑂ YOUR SEASON</span>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
            CHOICES CARRY ACROSS EPISODES — PICK PATH B AND THE NEXT EPISODE OPENS DIFFERENTLY
          </span>
          <span style={{ flex: 1 }}></span>
          {ledger.length > 0 && (
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-good)" }}>
              {ledger.length} CHOICE{ledger.length === 1 ? "" : "S"} · ${(ledger.length * SA_ROYALTY).toFixed(2)} TO {String(film.creator || "").split("·")[0].trim().toUpperCase() || "THE DIRECTOR"}
            </span>
          )}
        </div>

        {/* the rail */}
        <div className="sc-scroll" style={{ display: "flex", alignItems: "stretch", gap: 0, overflowX: "auto", paddingBottom: 6 }}>
          {arc.map((e, i) => {
            const released = e.status === "released";
            const last = i === arc.length - 1;
            return (
              <React.Fragment key={e.ep}>
                {/* node */}
                <div style={{ flexShrink: 0, width: 118, display: "flex", flexDirection: "column", gap: 6 }}>
                  <button
                    onClick={() => released && navigate(`/series/${film.id}/ep/${e.ep}`)}
                    disabled={!released}
                    style={{
                      position: "relative", textAlign: "left", padding: "9px 10px", borderRadius: "var(--r-2)",
                      cursor: released ? "pointer" : "default",
                      background: e.isFork ? (e.chosen ? "rgba(var(--accent-rgb),.08)" : "rgba(var(--accent-rgb),.04)") : "var(--c-panel-2)",
                      border: `1px solid ${e.isFork ? "rgba(var(--accent-rgb),.5)" : "var(--c-line-2)"}`,
                      opacity: released ? 1 : 0.55, color: "inherit",
                    }}>
                    <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: e.isFork ? "var(--c-amber)" : "var(--c-ink-3)" }}>
                      E{String(e.ep).padStart(2, "0")}{e.isFork ? " · ⑂ FORKS" : ""}
                    </div>
                    <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-body)", color: released ? "var(--c-ink)" : "var(--c-ink-3)", lineHeight: 1.2, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {e.title}
                    </div>
                    {e.isFork && (
                      <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", marginTop: 5, color: e.chosen ? "var(--c-amber)" : "var(--c-ink-4)" }}>
                        {e.chosen ? `YOU CHOSE PATH ${e.chosen}` : released ? "UNCHOSEN — WATCH IT" : "UPCOMING"}
                      </div>
                    )}
                    {!e.isFork && e.carriesFrom && e.carriesFrom.chosen && (
                      <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", marginTop: 5, color: "var(--c-good)" }}>
                        OPENS ON PATH {e.carriesFrom.chosen}
                      </div>
                    )}
                  </button>
                </div>
                {/* edge */}
                {!last && (
                  <div style={{ flexShrink: 0, width: 34, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    {e.isFork ? (
                      <svg width="34" height="44" viewBox="0 0 34 44" style={{ overflow: "visible" }}>
                        <path d="M0 22 C 12 22, 14 10, 34 10" fill="none" stroke={e.chosen === "A" || !e.chosen ? "var(--c-amber)" : "var(--c-line-2)"} strokeWidth={e.chosen === "A" ? 2 : 1} strokeDasharray={e.chosen ? "none" : "3 3"}/>
                        <path d="M0 22 C 12 22, 14 34, 34 34" fill="none" stroke={e.chosen && e.chosen !== "A" ? "var(--c-amber)" : "var(--c-line-2)"} strokeWidth={e.chosen && e.chosen !== "A" ? 2 : 1} strokeDasharray={e.chosen ? "none" : "3 3"}/>
                      </svg>
                    ) : (
                      <div style={{ width: "100%", height: 1, background: e.carriesFrom && e.carriesFrom.chosen ? "var(--c-amber)" : "var(--c-line-2)" }}></div>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginTop: 10 }}>
          {choicesMade === 0
            ? "NO FORKS TAKEN YET — CHOICE MOMENTS APPEAR DURING PLAYBACK, AND YOUR PATH THREADS THROUGH HERE."
            : `YOUR PATH IS ONE OF ${Math.pow(2, arc.filter(e => e.isFork).length)} WAYS THROUGH THE SEASON. REWATCH ANY FORK EPISODE TO RE-CHOOSE.`}
        </div>
      </div>
    );
  }

  Object.assign(window, { SeasonArcMap });
})();
