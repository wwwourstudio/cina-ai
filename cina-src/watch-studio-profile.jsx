// watch-studio-profile.jsx — THE standard studio profile.
//
// One noun: STUDIO. A collective (Darkroom) and a one-person shop (Elias
// Voss) get the SAME standardized profile page at /studios/:id — identity,
// spec strip, latest release spotlight, directors, filmography, notebook,
// upcoming slate, plans — with the same density and finish as the actor
// profile (watch-cast-v3). The studio's custom SITE (built in the page
// builder, published at /site/:id) is linked from here.
//
// Loaded after watch-studios-index.jsx, before watch-app.jsx.

(function () {
  const { useState: usSP, useMemo: umSP } = React;

  const spCount = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K" : String(n);

  // ─── Resolve ANY id (collective or director) to one studio shape ─────────
  function resolveStudio(id) {
    const S = window.STUDIOS || [];
    const C = window.CREATORS || [];
    const collective = S.find(s => s.id === id);
    if (collective) {
      return { ...collective, kind: "collective", siteId: collective.leadId, directors: collective.members.map(m => C.find(c => c.id === m)).filter(Boolean) };
    }
    const c = C.find(x => x.id === id);
    if (!c) return null;
    const home = S.find(s => (s.members || []).includes(c.id));
    return {
      id: c.id, name: c.name, verified: true, kind: "solo",
      tagline: c.tagline, description: c.bio || c.tagline,
      color: c.color, accent: c.accent, founded: null,
      subs: null, followers: c.followers, growth30d: null,
      siteId: c.id, leadId: c.id, directors: [c], home,
      plans: [{ id: "monthly", name: "Monthly", price: c.sub, features: [`Every ${c.name.split(" ")[0]} film & series`, "Early premiere windows", "Comments + reactions"], pop: true }],
      upcoming: [],
    };
  }

  function spFilms(studio) {
    const memberIds = (studio.directors || []).map(d => d.id);
    return (window.CATALOG || []).filter(f => memberIds.includes(f.creatorId));
  }

  function spNotebook() {
    try { const v = JSON.parse(localStorage.getItem("cina:studio-notebook") || "null"); if (Array.isArray(v)) return v.filter(p => p.status === "published"); } catch (e) {}
    return [];
  }

  function SpSectionHead({ n, title, sub, count, action }) {
    return (
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "52px 0 18px" }}>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", fontWeight: 700 }}>{n}</span>
        <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", letterSpacing: "-0.01em" }}>{title}</span>
        {sub && <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>{sub.toUpperCase()}</span>}
        <span style={{ flex: 1 }}></span>
        {action}
        {count != null && !action && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{count}</span>}
      </div>
    );
  }

  // Spec strip — the studio's "vault card", same pattern as the actor page.
  function SpSpecStrip({ studio, films }) {
    const series = films.filter(f => f.kind === "series").length;
    const avg = films.length ? (films.reduce((n, f) => n + (parseFloat(f.rating) || 0), 0) / films.length).toFixed(1) : "—";
    const years = films.map(f => f.year).filter(Boolean);
    const span = years.length ? Math.min(...years) + "–" + String(Math.max(...years)).slice(2) : "—";
    const cells = [
      ["Studio ID", `STU-${studio.id.toUpperCase().replace(/-/g, "")}`, "var(--c-ink)"],
      ["Catalog", `${films.length - series} films · ${series} series`, "var(--c-ink)"],
      ["Active", span, "var(--c-ink)"],
      ["Avg rating", `★ ${avg}`, "var(--c-amber)"],
      studio.kind === "collective"
        ? ["Payouts", `${studio.directors.length}-way split`, "var(--c-good)"]
        : ["Represented", studio.home ? studio.home.name : "Independent", studio.home ? "var(--c-good)" : "var(--c-ink-3)"],
    ];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1, background: "var(--c-line)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden", marginTop: 26 }}>
        {cells.map(([k, v, tint]) => (
          <div key={k} style={{ background: "var(--c-panel)", padding: "12px 14px" }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase" }}>{k}</div>
            <div className="t-mono" style={{ fontSize: "var(--fs-body)", color: tint, marginTop: 5, letterSpacing: ".02em" }}>{v}</div>
          </div>
        ))}
      </div>
    );
  }

  function StudioProfilePage({ id }) {
    const studio = umSP(() => resolveStudio(id), [id]);
    const [subbed, setSubbed] = usSP(false);
    const [following, setFollowing] = usSP(false);
    if (!studio) return (
      <div style={{ padding: "80px var(--gutter)", textAlign: "center" }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 10 }}>STUDIO NOT FOUND</div>
        <button className="btn" onClick={() => navigate("/studios")}>All studios</button>
      </div>
    );

    const films = spFilms(studio);
    const latest = [...films].sort((a, b) => (b.year || 0) - (a.year || 0))[0];
    const heroFilm = films[0];
    const posts = studio.kind === "solo" ? spNotebook().slice(0, 3) : [];
    const sitePublished = (() => { try { return !!(JSON.parse(localStorage.getItem("cina:studio-pages-v2") || "{}")[studio.siteId]); } catch (e) { return false; } })();
    const price = studio.plans && studio.plans[0] ? studio.plans[0].price : 4.99;
    let secN = 0;
    const nextN = () => String(++secN).padStart(2, "0");

    const subscribe = () => {
      if (window.openPay) {
        window.openPay({
          kind: "sub", title: studio.name, price, cadence: "mo",
          accent: studio.accent || tkc("amber"),
          image: heroFilm ? { kind: heroFilm.thumb, color: studio.color } : { color: studio.color },
          perks: (studio.plans[0] && studio.plans[0].features) || [],
          onConfirm: () => setSubbed(true),
        });
      } else setSubbed(true);
    };

    const fmtDate = (d) => { if (!d) return ""; let dt = new Date(d + "T12:00"); if (isNaN(dt.getTime())) dt = new Date(d); return isNaN(dt.getTime()) ? String(d) : dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }); };

    return (
      <div data-screen-label={`Studio · ${studio.name}`} style={{ paddingBottom: 96 }}>
        {/* ── Hero — film-strip backdrop, identity, actions ── */}
        <section style={{ position: "relative", borderBottom: "1px solid var(--c-line)", overflow: "hidden" }}>
          {/* Backdrop: a strip of the studio's own frames */}
          <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: `repeat(${Math.max(3, Math.min(films.length, 5))}, 1fr)`, opacity: .30 }}>
            {films.slice(0, 5).map(f => (
              <div key={f.id} style={{ position: "relative", overflow: "hidden" }}><FrameThumb kind={f.thumb} usePhoto/></div>
            ))}
            {films.length === 0 && <div style={{ background: studio.color }}></div>}
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,9,8,.62), var(--c-bg) 88%)" }}></div>

          <div style={{ position: "relative", maxWidth: "var(--w-page)", margin: "0 auto", padding: "64px var(--gutter) 34px" }}>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{
                  width: 96, height: 96, borderRadius: "var(--r-3)", display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: studio.color, color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-head)",
                  border: "1px solid rgba(255,255,255,.25)", boxShadow: "0 18px 50px rgba(0,0,0,.5)",
                }}>{studio.name[0]}</span>
                {/* signature colorway — same affordance as the actor page */}
                <div style={{ display: "flex", gap: 3 }}>
                  {[studio.color, studio.accent || tkc("amber"), "var(--c-ink-3)"].map((c, i) => (
                    <span key={i} style={{ width: 16, height: 6, borderRadius: "var(--r-1)", background: c, border: "1px solid rgba(255,255,255,.15)" }}></span>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 280 }}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  {studio.kind === "collective" ? "COLLECTIVE" : "SOLO STUDIO"}
                  {studio.verified && <span style={{ color: tkc("cat-1") }}>✓ VERIFIED</span>}
                  {window.stToken && window.stToken(studio.id) && (
                    <button onClick={() => navigate("/studios/" + studio.id + "/token")} className="t-mono" style={{ background: "rgba(var(--accent-rgb),.12)", border: "1px solid rgba(var(--accent-rgb),.45)", borderRadius: "var(--r-1)", color: "var(--c-amber)", fontSize: "var(--fs-label)", letterSpacing: ".16em", padding: "1px 7px", cursor: "pointer", fontWeight: 700 }}>
                      {window.stToken(studio.id).ticker} · ${window.stToken(studio.id).price.toFixed(2)}
                    </button>
                  )}
                  {studio.home && <button onClick={() => navigate(`/studios/${studio.home.id}`)} className="t-mono" style={{ background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)", color: "var(--c-ink-3)", fontSize: "var(--fs-label)", letterSpacing: ".16em", padding: "1px 7px", cursor: "pointer" }}>MEMBER OF {studio.home.name.toUpperCase()}</button>}
                </div>
                <h1 className="t-display" style={{ fontStyle: "italic", fontSize: "clamp(40px, 5vw, 60px)", margin: "8px 0 6px", letterSpacing: "-0.02em", lineHeight: .98 }}>{studio.name}</h1>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", maxWidth: 560, lineHeight: 1.5 }}>{studio.description || studio.tagline}</div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn btn-primary" style={{ height: 42, padding: "0 18px", fontSize: "var(--fs-body)" }} onClick={subscribe}>{subbed ? "✓ Subscribed" : `Subscribe · $${price}/mo`}</button>
                <button className="btn" style={{ height: 42, padding: "0 16px", fontSize: "var(--fs-body)" }} onClick={() => setFollowing(f => !f)}>{following ? "✓ Following" : "+ Follow"}</button>
                <button className="btn" style={{ height: 42, padding: "0 16px", fontSize: "var(--fs-body)" }} title="The studio's own website, built in the page builder" onClick={() => navigate(`/site/${studio.siteId}`)}>{sitePublished ? "Visit site ↗" : "Preview site ↗"}</button>
                <button className="btn" style={{ height: 42, padding: "0 16px", fontSize: "var(--fs-body)" }} title="Open in the site builder" onClick={() => navigate(`/build/${studio.siteId}`)}>✎ Edit site</button>
              </div>
            </div>

            {/* stat row */}
            <div style={{ display: "flex", gap: 0, marginTop: 30, borderTop: "1px solid var(--c-line-2)", flexWrap: "wrap" }}>
              {[
                ["TITLES", films.length],
                studio.subs != null ? ["SUBSCRIBERS", spCount(studio.subs)] : ["FOLLOWERS", spCount((studio.followers || 0) + (following ? 1 : 0))],
                ["DIRECTORS", studio.directors.length],
                studio.growth30d != null ? ["GROWTH · 30D", "+" + studio.growth30d + "%"] : null,
                studio.founded ? ["FOUNDED", studio.founded] : null,
              ].filter(Boolean).map(([l, v]) => (
                <div key={l} style={{ padding: "16px 32px 0 0", marginRight: 32 }}>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", lineHeight: 1 }}>{v}</div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginTop: 5 }}>{l}</div>
                </div>
              ))}
            </div>

            <SpSpecStrip studio={studio} films={films}/>
          </div>
        </section>

        <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "0 var(--gutter)" }}>

          {/* ── Latest release spotlight ── */}
          {latest && (
            <>
              <SpSectionHead n={nextN()} title="Latest release" sub={String(latest.year || "")}/>
              <button className="btn-ghost" onClick={() => navigate(latest.kind === "series" ? `/series/${latest.id}` : `/film/${latest.id}`)} style={{
                height: "auto", padding: 0, borderRadius: "var(--r-3)", overflow: "hidden", textAlign: "left", width: "100%",
                display: "grid", gridTemplateColumns: "minmax(280px, 1.5fr) 1fr", border: "1px solid var(--c-line)", background: "var(--c-panel)",
              }}>
                <div style={{ position: "relative", aspectRatio: "16/8", overflow: "hidden", background: latest.color }}>
                  <FrameThumb kind={latest.thumb} usePhoto/>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, var(--c-panel))" }}></div>
                </div>
                <div style={{ padding: "clamp(16px, 2.5vw, 32px)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)" }}>{latest.kind === "series" ? `SERIES · SEASON ${latest.season || 1}` : "FEATURE FILM"}</span>
                  <span className="t-display" style={{ fontStyle: "italic", fontSize: "clamp(24px, 3vw, 38px)", letterSpacing: "-0.02em", lineHeight: 1.02, color: "var(--c-ink)" }}>{latest.title}</span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>{String(Array.isArray(latest.genre) ? latest.genre[0] : latest.genre || "").toUpperCase()} · {latest.year} · ★ {latest.rating}</span>
                  {(window.PROGRAMMER_NOTES || {})[latest.id] && (
                    <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.6, maxWidth: 460 }}>{PROGRAMMER_NOTES[latest.id]}</span>
                  )}
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", marginTop: 4 }}>WATCH NOW →</span>
                </div>
              </button>
            </>
          )}

          {/* ── Directors ── */}
          {studio.kind === "collective" && (
            <>
              <SpSectionHead n={nextN()} title="The directors" sub={studio.splits ? "revenue split by agreement" : null} count={studio.directors.length}/>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
                {studio.directors.map(d => (
                  <button key={d.id} className="btn-ghost" onClick={() => navigate(`/studios/${d.id}`)} style={{
                    height: "auto", padding: 16, textAlign: "left", display: "flex", gap: 13, alignItems: "center",
                    border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", background: "var(--c-panel)",
                  }}>
                    <span style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", background: d.color, color: tkc("white"), fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", fontWeight: 700 }}>
                      {d.name.split(" ").map(w => w[0]).join("")}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 550 }}>{d.name}</span>
                      <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginTop: 3 }}>
                        {spCount(d.followers)} FOLLOWERS{studio.splits && studio.splits[d.id] ? ` · ${studio.splits[d.id]}% SPLIT` : ""}
                      </span>
                    </span>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", flexShrink: 0 }}>PROFILE →</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {typeof window.StudioFestivalRecord === "function" && (() => {
            const rec = window.frStudioRecord ? window.frStudioRecord(studio.id, films) : [];
            const run = window.frInLineup ? window.frInLineup(films) : [];
            if (!rec.length && !run.length) return null;
            return (
              <>
                <SpSectionHead n={nextN()} title="Festival record" count={rec.length + run.length}/>
                <div style={{ marginBottom: 34 }}>
                  <window.StudioFestivalRecord studio={studio} films={films}/>
                </div>
              </>
            );
          })()}

          {/* ── Filmography — real art, wired links ── */}
          <SpSectionHead n={nextN()} title="Filmography" count={films.length}/>
          {films.length === 0 && <div style={{ padding: "28px 0", color: "var(--c-ink-4)", fontStyle: "italic" }}>Nothing released yet.</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14 }}>
            {films.map(f => (
              <button key={f.id} className="btn-ghost" onClick={() => navigate(f.kind === "series" ? `/series/${f.id}` : `/film/${f.id}`)} style={{
                height: "auto", padding: 0, borderRadius: "var(--r-2)", overflow: "hidden", textAlign: "left",
                display: "flex", flexDirection: "column", alignItems: "stretch",
                border: "1px solid var(--c-line)", background: "var(--c-panel)",
              }}>
                <div style={{ position: "relative", aspectRatio: "16/9", background: f.color, overflow: "hidden" }}>
                  <FrameThumb kind={f.thumb} usePhoto/>
                  <span className="t-mono" style={{ position: "absolute", left: 8, top: 8, padding: "2px 7px", borderRadius: "var(--r-1)", background: "rgba(8,8,10,.8)", color: "rgba(255,255,255,.8)", fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>
                    {f.kind === "series" ? `SERIES · S${f.season || 1}` : "FILM"}
                  </span>
                </div>
                <div style={{ padding: "11px 13px 13px" }}>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 550 }}>{f.title}</div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginTop: 4 }}>
                    {String(Array.isArray(f.genre) ? f.genre[0] : f.genre || "").toUpperCase()} · {f.year} · ★ {f.rating}
                  </div>
                  {(window.PROGRAMMER_NOTES || {})[f.id] && (
                    <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5, marginTop: 7, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {PROGRAMMER_NOTES[f.id]}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* ── From the notebook ── */}
          {posts.length > 0 && (
            <>
              <SpSectionHead n={nextN()} title="From the notebook" sub="production diary"
                action={<button className="t-mono" onClick={() => navigate(`/site/${studio.siteId}`)} style={{ background: "transparent", border: "none", color: "var(--c-amber)", fontSize: "var(--fs-label)", letterSpacing: ".16em", cursor: "pointer", padding: 0 }}>ALL POSTS ON THE SITE →</button>}/>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                {posts.map(p => (
                  <button key={p.id} className="btn-ghost" onClick={() => { if (window.cinaNotebook) window.cinaNotebook.open(p.id); }} style={{
                    height: "auto", padding: 18, textAlign: "left", display: "flex", flexDirection: "column", gap: 8,
                    border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", background: "var(--c-panel)",
                  }}>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)" }}>{fmtDate(p.date).toUpperCase()}{p.read ? ` · ${String(p.read).toUpperCase()}` : ""}</span>
                    <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.15, color: "var(--c-ink)", letterSpacing: "-0.01em" }}>{p.title || "Untitled"}</span>
                    <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.dek || p.excerpt || ""}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Upcoming slate ── */}
          {studio.upcoming && studio.upcoming.length > 0 && (
            <>
              <SpSectionHead n={nextN()} title="Upcoming" sub="dated on the slate" count={studio.upcoming.length}/>
              <div style={{ border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden", background: "var(--c-panel)", maxWidth: 760 }}>
                {studio.upcoming.map(u => {
                  const d = (window.CREATORS || []).find(c => c.id === u.creatorId);
                  return (
                    <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--c-line)" }}>
                      <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", flexShrink: 0, width: 76 }}>{u.date.slice(5).replace("-", " · ")}</span>
                      <span style={{ flex: 1, fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{u.title}</span>
                      <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>{(u.kind || "").toUpperCase()}{d ? " · " + d.name.toUpperCase() : ""}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Plans ── */}
          {studio.plans && studio.plans.length > 0 && (
            <>
              <SpSectionHead n={nextN()} title="Subscribe" sub="direct to the filmmakers"/>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 280px))", gap: 12 }}>
                {studio.plans.map(p => (
                  <div key={p.id} style={{ border: `1px solid ${p.pop ? "var(--c-amber)" : "var(--c-line)"}`, borderRadius: "var(--r-3)", padding: "18px 18px 16px", background: p.pop ? "rgba(var(--accent-rgb),.05)" : "var(--c-panel)", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{p.name}</span>
                      {p.savings && <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-good)" }}>{p.savings.toUpperCase()}</span>}
                      <span style={{ flex: 1 }}></span>
                      <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-amber)" }}>${p.price}</span>
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
                      {p.features.map(f => <li key={f} style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", display: "flex", gap: 7 }}><span style={{ color: "var(--c-amber)" }}>◆</span>{f}</li>)}
                    </ul>
                    <button className={p.pop ? "btn btn-primary" : "btn"} style={{ height: 36, marginTop: "auto" }} onClick={subscribe}>Choose {p.name}</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  Object.assign(window, { StudioProfilePage });
})();
