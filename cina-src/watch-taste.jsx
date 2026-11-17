// watch-taste.jsx — Taste Print · who you are, computed from what you CHOSE.
//
// Every ledger in Cina is a taste signal nothing else has:
//   cina:fork-ledger        which way you go when a story forks
//   cina:commerce:ledger    what you buy off the actor's back
//   cina:library            what you paid to own vs rent
//   SESSION                 watchlist / ratings / follows (passive)
//
// computeTastePrint() folds them into an archetype + trait bars; the For You
// rail boosts with it (reason chips become "Because you choose mercy at
// forks"); /taste renders the full print. It updates live as you choose.
//
// Loaded after watch-home-v3.jsx, before watch-app.jsx.

(function () {
  const { useState: usTP, useEffect: ueTP, useMemo: umTP } = React;

  const tpRead = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };

  // Fork letters carry temperament. A tends to be the humane/open option,
  // B the hard/decisive one, C the strange third door (matches the Board's
  // branch grammar in watch-fork-moment).
  const TP_TEMPER = {
    A: { trait: "Mercy",    word: "merciful",  color: tkc("good") },
    B: { trait: "Ruthless", word: "decisive",  color: tkc("bad") },
    C: { trait: "Curious",  word: "curious",   color: tkc("cat-2") },
  };

  function computeTastePrint() {
    const forks = tpRead("cina:fork-ledger", []);
    const sales = tpRead("cina:commerce:ledger", []);
    const lib   = tpRead("cina:library", []);
    const S = window.SESSION || {};
    const cat = window.CATALOG || [];
    const find = (id) => cat.find(f => f.id === id);

    // Temperament from fork letters
    const byLetter = {};
    forks.forEach(r => byLetter[r.letter] = (byLetter[r.letter] || 0) + 1);
    const forkTotal = forks.length;
    const temper = ["A", "B", "C"].map(L => ({
      ...TP_TEMPER[L], letter: L,
      n: byLetter[L] || 0,
      pct: forkTotal ? Math.round(((byLetter[L] || 0) / forkTotal) * 100) : 0,
    })).sort((a, b) => b.n - a.n);
    const domTemper = forkTotal ? temper[0] : null;

    // Contrarian streak — votes cast against the room's leading option.
    const minority = forks.filter(r => r.minority).length;
    const contrarian = forkTotal >= 2 ? Math.round((minority / forkTotal) * 100) : 0;

    // Genre weights from everything the viewer touched, ownership counts double
    const genreW = {};
    const bump = (id, w) => { const f = find(id); if (f) (f.genre || []).forEach(g => genreW[g] = (genreW[g] || 0) + w); };
    (S.continued || []).forEach(c => bump(c.filmId, 2));
    (S.watchlist || []).forEach(id => bump(id, 1.5));
    lib.forEach(r => bump(r.filmId, r.kind === "buy" ? 4 : 2));
    forks.forEach(r => bump(r.filmId, 1));
    const topGenres = Object.entries(genreW).sort((a, b) => b[1] - a[1]).map(([g]) => g);

    // Style from wardrobe buys
    const brandN = {};
    sales.forEach(r => brandN[r.brand] = (brandN[r.brand] || 0) + 1);
    const topBrand = Object.entries(brandN).sort((a, b) => b[1] - a[1])[0];

    // Collector vs renter
    const buys = lib.filter(r => r.kind === "buy").length;
    const collector = buys >= 2;

    // Archetype name: temperament word + genre noun
    const genreNoun = (topGenres[0] || "").split(" ")[0] || null;
    const archetype = domTemper && genreNoun
      ? `The ${domTemper.word[0].toUpperCase() + domTemper.word.slice(1)} ${genreNoun[0].toUpperCase() + genreNoun.slice(1)} ${collector ? "Collector" : "Devotee"}`
      : domTemper ? `The ${domTemper.word[0].toUpperCase() + domTemper.word.slice(1)} One`
      : genreNoun ? `The ${genreNoun[0].toUpperCase() + genreNoun.slice(1)} ${collector ? "Collector" : "Devotee"}`
      : null;

    const signals = forkTotal + sales.length + lib.length + (S.watchlist || []).length + (S.continued || []).length;

    // Scorer for the feed: how much this film matches the print, with a reason.
    function boost(film) {
      let s = 0; let reason = null;
      if (domTemper && film.branched && forkTotal >= 2) { s += 6; reason = `Branched — you choose ${domTemper.word}ly at forks`; }
      const g = (film.genre || []).find(x => topGenres.slice(0, 2).includes(x));
      if (g && !reason) { s += 3; reason = null; }
      if (collector && film.kind === "series") s += 1.5;
      return { s, reason };
    }

    return { archetype, temper, domTemper, forkTotal, topGenres, topBrand, sales: sales.length, buys, lib: lib.length, collector, signals, boost, minority, contrarian };
  }

  function useTastePrint() {
    const [tick, setTick] = usTP(0);
    ueTP(() => {
      const on = (e) => { if (e.key && e.key.startsWith("cina:")) setTick(t => t + 1); };
      window.addEventListener("storage", on);
      return () => window.removeEventListener("storage", on);
    }, []);
    return umTP(computeTastePrint, [tick]);
  }

  // ─── The print card (shared by /taste and anywhere compact) ──────────────
  function TasteTraitBar({ t, max }) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "84px 1fr 44px", gap: 12, alignItems: "center" }}>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" }}>{t.trait.toUpperCase()}</span>
        <span style={{ height: 6, borderRadius: "var(--r-1)", background: "var(--c-line)", overflow: "hidden" }}>
          <span style={{ display: "block", height: "100%", width: (max ? Math.round((t.n / max) * 100) : 0) + "%", background: t.color, transition: "width .6s cubic-bezier(.2,.8,.2,1)" }}></span>
        </span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", textAlign: "right" }}>{t.pct}%</span>
      </div>
    );
  }

  function TastePrintPage() {
    useSession();
    const tp = useTastePrint();
    const [poster, setPoster] = usTP(false);
    const maxT = Math.max(1, ...tp.temper.map(t => t.n));

    return (
      <div style={{ padding: "0 var(--gutter) 96px", maxWidth: "var(--w-page)", margin: "0 auto" }}>
        <PmMasthead bare index="Library" path="Taste print" count="Computed from your choices" title={tp.signals < 2 ? "Taste print" : (tp.archetype || "Still forming")} lede={tp.signals < 2 ? null : <>Not what you watched, what you <i>chose</i>. Fork decisions, wardrobe buys, and what you paid to own, folded into one print. It tunes your For You feed.</>}>
          {tp.signals >= 2 && window.PosterOverlay && tp.archetype && <button className="pm-btn" onClick={() => setPoster(true)}>Save poster ↓</button>}
          <PmLibraryTabs current="/taste"/>
        </PmMasthead>
        {tp.signals < 2 ? (
          <div className="pm-empty">
            <h2 className="pm-h2">Your print hasn't formed yet.</h2>
            <p className="pm-lede">Watch a branched film and choose at a fork, buy a piece off the screen, or add to your library — every choice sharpens the print.</p>
            <button className="pm-btn pm-btn--primary" onClick={() => navigate("/branches")}>Watch something branched</button>
          </div>
        ) : (
          <>

            <div className="pm-duo" style={{ marginTop: 36 }}>
              {/* Temperament */}
              <div className="pm-panel">
                <span className="pm-k">{tp.forkTotal} choice{tp.forkTotal === 1 ? "" : "s"}</span><h2 className="pm-h2" style={{ margin: "6px 0 18px" }}>At the forks</h2>
                {tp.forkTotal === 0
                  ? <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)", fontStyle: "italic" }}>No forks taken yet.</div>
                  : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{tp.temper.map(t => <TasteTraitBar key={t.letter} t={t} max={maxT}/>)}</div>}
                {tp.domTemper && <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 14, lineHeight: 1.5 }}>When the story forks, you go <b style={{ color: tp.domTemper.color }}>{tp.domTemper.word}</b>. Directors see this — path {tp.domTemper.letter} earns them royalties every time you choose it.</div>}
                {tp.contrarian >= 40 && <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 8, lineHeight: 1.5 }}>And you're a <b style={{ color: "var(--c-amber)" }}>contrarian</b> — {tp.contrarian}% of your votes went against the room.</div>}
              </div>

              {/* Obsessions */}
              <div className="pm-panel">
                <span className="pm-k">Genres · wardrobe · library</span><h2 className="pm-h2" style={{ margin: "6px 0 18px" }}>Obsessions</h2>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {tp.topGenres.slice(0, 4).map((g, i) => (
                    <span key={g} className="pm-chip" data-on={i === 0 ? "1" : "0"} style={{ cursor: "default" }}>{g}</span>
                  ))}
                  {!tp.topGenres.length && <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)", fontStyle: "italic" }}>Watch more to reveal these.</span>}
                </div>
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  {tp.topBrand && <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>Screen wardrobe: <b style={{ color: "var(--c-ink)" }}>{tp.topBrand[0]}</b> — {tp.sales} piece{tp.sales === 1 ? "" : "s"} bought off the actor's back.</div>}
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>{tp.collector ? <span>You <b style={{ color: "var(--c-ink)" }}>own</b> what you love — {tp.buys} purchases, not rentals.</span> : tp.lib > 0 ? "You rent first, commit later." : "Your library is empty — for now."}</div>
                </div>
              </div>
            </div>

            <p className="pm-k" style={{ marginTop: 22 }}>The print lives on your device · it retunes your feed the moment you choose differently</p>
            {poster && <PosterOverlay kind="taste" tp={tp} onClose={() => setPoster(false)}/>}
          </>
        )}
      </div>
    );
  }

  // Compact chip for the For You rail header.
  function TastePrintChip() {
    const tp = useTastePrint();
    if (!tp.archetype) return null;
    return (
      <button onClick={() => navigate("/taste")} className="t-mono" title="Your taste print — computed from your fork choices, buys, and library" style={{
        display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 999,
        border: "1px solid var(--c-line-2)", background: "var(--c-panel)", cursor: "pointer",
        fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-2)",
      }}>
        {tp.domTemper && <span style={{ width: 7, height: 7, borderRadius: "50%", background: tp.domTemper.color }}></span>}
        {tp.archetype.toUpperCase()}
        <span style={{ color: "var(--c-amber)" }}>→</span>
      </button>
    );
  }

  Object.assign(window, { computeTastePrint, TastePrintPage, TastePrintChip });
})();
