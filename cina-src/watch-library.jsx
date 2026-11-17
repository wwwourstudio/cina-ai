// watch-library.jsx — /library — everything the viewer owns, in one place.
//
// · Entitlement store: window.libraryRecord / libraryOwns persist every
//   unlock (buy / rent / sub / free-with-ads) to "cina:library". The watch
//   page records on pay-drawer confirm and auto-unlocks owned films.
// · LibraryPage: Continue watching → Owned & rentals → Series + your branch
//   paths (read from the real fork ledgers) → Watchlist → Wardrobe orders.
//
// Loaded after watch-extras.jsx, before watch-app.jsx.

(function () {
  const { useState: usLB, useMemo: umLB, useEffect: ueLB } = React;

  // ─── Entitlements ─────────────────────────────────────────────────────────
  const LB_KEY = "cina:library";
  const RENT_MS = 48 * 3600 * 1000;
  function libraryRead() {
    try { const v = JSON.parse(localStorage.getItem(LB_KEY)); return Array.isArray(v) ? v : []; } catch (e) { return []; }
  }
  function libraryRecord({ filmId, kind, price }) {
    const rows = libraryRead().filter(r => !(r.filmId === filmId && r.kind === kind));
    const rec = { filmId, kind, price: price || 0, at: Date.now(), expiresAt: kind === "rent" ? Date.now() + RENT_MS : null };
    try { localStorage.setItem(LB_KEY, JSON.stringify([rec, ...rows].slice(0, 100))); } catch (e) {}
    if (window.bumpSession) window.bumpSession();
    return rec;
  }
  function libraryOwns(filmId) {
    return libraryRead().some(r => r.filmId === filmId && (!r.expiresAt || r.expiresAt > Date.now()));
  }

  const lbFilm = (id) => (window.CATALOG || []).find(f => f.id === id);
  const lbAgo = (ts) => {
    const h = Math.round((Date.now() - ts) / 3600000);
    return h < 1 ? "just now" : h < 24 ? h + "h ago" : Math.round(h / 24) + "d ago";
  };
  const lbLeft = (ts) => {
    const h = Math.max(0, Math.round((ts - Date.now()) / 3600000));
    return h >= 1 ? h + "h left" : "expiring";
  };

  // ─── Pieces ───────────────────────────────────────────────────────────────
  function LbHead({ n, title, sub, count }) {
    return (
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "40px 0 14px" }}>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", fontWeight: 700 }}>{n}</span>
        <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{title}</span>
        {sub && <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>{sub.toUpperCase()}</span>}
        <span style={{ flex: 1 }}></span>
        {count != null && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{count}</span>}
      </div>
    );
  }

  function LbCard({ film, badge, badgeColor, meta, cta, onGo, progress }) {
    if (!film) return null;
    return (
      <button onClick={onGo} className="btn-ghost" style={{
        height: "auto", padding: 0, borderRadius: "var(--r-2)", overflow: "hidden", textAlign: "left",
        display: "flex", flexDirection: "column", alignItems: "stretch", gap: 0,
        border: "1px solid var(--c-line)", background: "var(--c-panel)",
      }}>
        <div style={{ position: "relative", aspectRatio: "16/9", background: film.color, overflow: "hidden" }}>
          <FrameThumb kind={film.thumb} usePhoto/>
          {badge && (
            <span className="t-mono" style={{
              position: "absolute", left: 8, top: 8, padding: "2px 8px", borderRadius: "var(--r-1)",
              background: "rgba(8,8,10,.82)", border: `1px solid ${badgeColor || "var(--c-line-2)"}`,
              color: badgeColor || "var(--c-ink-2)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
            }}>{badge}</span>
          )}
          {progress != null && (
            <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: "rgba(255,255,255,.15)" }}>
              <span style={{ display: "block", width: Math.round(progress * 100) + "%", height: "100%", background: "var(--c-amber)" }}></span>
            </span>
          )}
        </div>
        <div style={{ padding: "10px 12px 12px" }}>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 550 }}>{film.title}</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginTop: 4, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {meta}
          </div>
          {cta && <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", marginTop: 7 }}>{cta} →</div>}
        </div>
      </button>
    );
  }

  const LB_GRID = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 };

  // Branch data for a series the viewer has touched.
  function lbBranches() {
    const out = [];
    Object.keys(localStorage).forEach(k => {
      if (!k.startsWith("cina:fork-choices:")) return;
      try {
        const filmId = k.slice("cina:fork-choices:".length);
        const choices = JSON.parse(localStorage.getItem(k)) || {};
        const letters = Object.values(choices);
        if (!letters.length) return;
        const film = lbFilm(filmId);
        if (film) out.push({ film, letters });
      } catch (e) {}
    });
    return out;
  }

  // ─── The page ─────────────────────────────────────────────────────────────
  function LibraryPage() {
    useSession();
    const [tick, setTick] = usLB(0);
    ueLB(() => {
      const on = (e) => { if (e.key && e.key.startsWith("cina:")) setTick(t => t + 1); };
      window.addEventListener("storage", on);
      return () => window.removeEventListener("storage", on);
    }, []);

    const lib = libraryRead();
    const owned = lib.filter(r => r.kind === "buy");
    const rentals = lib.filter(r => r.kind === "rent");
    const others = lib.filter(r => r.kind === "sub" || r.kind === "free");
    const continued = (SESSION.continued || []).filter(c => lbFilm(c.filmId));
    const watchlist = (SESSION.watchlist || []).map(lbFilm).filter(Boolean);
    const branches = umLB(lbBranches, [tick]);
    const orders = (() => { try { const l = JSON.parse(localStorage.getItem("cina:commerce:ledger")); return Array.isArray(l) ? l : []; } catch (e) { return []; } })();

    const goWatch = (f) => navigate(f.kind === "series" ? `/series/${f.id}` : `/film/${f.id}`);
    const empty = !lib.length && !continued.length && !watchlist.length && !branches.length && !orders.length;

    return (
      <div style={{ padding: "36px var(--gutter) 96px", maxWidth: "var(--w-page)", margin: "0 auto" }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", fontWeight: 700 }}>YOUR LIBRARY</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 320 }}>
            <h1 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", margin: "8px 0 4px", letterSpacing: "-0.02em" }}>Everything you own, everywhere you left off.</h1>
            <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", margin: 0, maxWidth: 560, lineHeight: 1.55 }}>
              Purchases, rentals, the branch paths you've carved through every series, and your wardrobe orders — in one place.
            </p>
          </div>
          {!empty && (
            <div style={{ display: "flex", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden", background: "var(--c-panel)" }}>
              {[
                [owned.length, "OWNED"],
                [rentals.filter(r => r.expiresAt > Date.now()).length, "RENTALS"],
                [continued.length, "IN PROGRESS"],
                [watchlist.length, "WATCHLIST"],
              ].map(([v, l], i) => (
                <div key={l} style={{ padding: "10px 18px", borderLeft: i ? "1px solid var(--c-line)" : "none", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1 }}>{v}</div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {empty && (
          <div style={{ marginTop: 48, padding: "44px 32px", border: "1px dashed var(--c-line-2)", borderRadius: "var(--r-3)", textAlign: "center" }}>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink-2)" }}>Nothing here yet.</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)", marginTop: 6 }}>Buy, rent, or start watching anything and it lands here.</div>
            <button className="btn btn-primary" style={{ marginTop: 18, height: 38, padding: "0 18px" }} onClick={() => navigate("/")}>Browse films →</button>
          </div>
        )}

        {/* 01 · Continue watching */}
        {continued.length > 0 && <>
          <LbHead n="01" title="Continue watching" count={continued.length}/>
          <div style={LB_GRID}>
            {continued.map(c => {
              const f = lbFilm(c.filmId);
              return <LbCard key={c.filmId + (c.ep || "")} film={f} progress={c.t / c.dur}
                badge={c.ep ? "E" + String(c.ep).padStart(2, "0") : null}
                meta={<span>{Math.round((c.dur - c.t) / 60)} MIN LEFT · {lbAgo(c.at).toUpperCase()}</span>}
                cta="Resume" onGo={() => goWatch(f)}/>;
            })}
          </div>
        </>}

        {/* 02 · Owned + rentals */}
        {(owned.length > 0 || rentals.length > 0 || others.length > 0) && <>
          <LbHead n="02" title="Films & series you own" sub="purchases never expire" count={owned.length + rentals.length + others.length}/>
          <div style={LB_GRID}>
            {owned.map(r => <LbCard key={"b" + r.filmId} film={lbFilm(r.filmId)}
              badge="OWNED" badgeColor="var(--c-good)"
              meta={<span>BOUGHT {lbAgo(r.at).toUpperCase()} · ${r.price}</span>}
              cta="Watch" onGo={() => goWatch(lbFilm(r.filmId))}/>)}
            {rentals.map(r => {
              const live = r.expiresAt > Date.now();
              return <LbCard key={"r" + r.filmId} film={lbFilm(r.filmId)}
                badge={live ? "RENTAL · " + lbLeft(r.expiresAt).toUpperCase() : "RENTAL EXPIRED"}
                badgeColor={live ? "var(--c-amber)" : "var(--c-ink-4)"}
                meta={<span>48-HOUR RENTAL · ${r.price}</span>}
                cta={live ? "Watch" : "Rent again"} onGo={() => goWatch(lbFilm(r.filmId))}/>;
            })}
            {others.map(r => <LbCard key={"o" + r.filmId + r.kind} film={lbFilm(r.filmId)}
              badge={r.kind === "sub" ? "VIA SUBSCRIPTION" : "FREE WITH ADS"}
              meta={<span>UNLOCKED {lbAgo(r.at).toUpperCase()}</span>}
              cta="Watch" onGo={() => goWatch(lbFilm(r.filmId))}/>)}
          </div>
        </>}

        {/* 03 · Your branches */}
        {branches.length > 0 && <>
          <LbHead n="03" title="Your branches" sub="the paths you chose · rewatch to re-choose" count={branches.length}/>
          <div style={LB_GRID}>
            {branches.map(b => <LbCard key={"br" + b.film.id} film={b.film}
              badge={"⑂ PATH " + b.letters.join("·")} badgeColor= "var(--c-amber)"
              meta={<span>{b.letters.length} FORK{b.letters.length === 1 ? "" : "S"} TAKEN · CARRIES INTO THE NEXT EPISODE</span>}
              cta="See your season" onGo={() => goWatch(b.film)}/>)}
          </div>
        </>}

        {/* 04 · Watchlist */}
        {watchlist.length > 0 && <>
          <LbHead n="04" title="Watchlist" count={watchlist.length}/>
          <div style={LB_GRID}>
            {watchlist.map(f => <LbCard key={"w" + f.id} film={f}
              meta={<span>{String(Array.isArray(f.genre) ? f.genre[0] : f.genre || "").toUpperCase()} · {f.kind === "series" ? "SERIES" : "FILM"}</span>}
              cta="Open" onGo={() => goWatch(f)}/>)}
          </div>
        </>}

        {/* 05 · Wardrobe orders */}
        {orders.length > 0 && <>
          <LbHead n="05" title="Wardrobe orders" sub="bought from the screen" count={orders.length}/>
          <div style={{ border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden", background: "var(--c-panel)", maxWidth: 720 }}>
            {orders.slice(0, 8).map(o => {
              const f = o.filmId && lbFilm(o.filmId);
              return (
                <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: "1px solid var(--c-line)" }}>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>{o.brand.toUpperCase()}{f ? " · FROM " + f.title.toUpperCase() : ""}</span>
                    <span style={{ display: "block", fontSize: "var(--fs-body)", color: "var(--c-ink)", marginTop: 2 }}>{o.name}</span>
                  </span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", flexShrink: 0 }}>{lbAgo(o.ts).toUpperCase()}</span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink)", flexShrink: 0, minWidth: 48, textAlign: "right" }}>${o.price}</span>
                </div>
              );
            })}
            <div className="t-mono" style={{ padding: "9px 16px", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>ORDERS SHIP FROM THE RETAILER · EVERY SALE SUPPORTS THE DIRECTOR</div>
          </div>
        </>}
      </div>
    );
  }

  Object.assign(window, { LibraryPage, libraryRecord, libraryOwns, libraryRead, lbBranches, lbAgo, lbLeft });
})();
