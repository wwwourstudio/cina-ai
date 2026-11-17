// watch-home-v4.jsx — Calm editorial recomposition of the Watch homepage.
// Direction, per review: no full-bleed background photography anywhere on the
// page — imagery lives INSIDE contained, bordered frames. Type leads.
//   1. HeroV4        — type-led front page; the still is a framed card, not a wash
//   2. ResumeStripV4 — "Continue watching" redesigned as compact resume rows
//   3. The rest of the page reuses the existing sections in a quieter order.
// Overrides window.SplashPage (loads after watch-home-v3.jsx).

const { useState: usH4, useEffect: ueH4, useMemo: umH4, useRef: urH4 } = React;
const HERO_DUR_V4 = 7000;

// ─── helpers ──────────────────────────────────────────────────────────────
function v4RuntimeMin(rt) {
  if (!rt) return 0;
  const h = /(\d+)\s*h/i.exec(rt), m = /(\d+)\s*m/i.exec(rt);
  return (h ? +h[1] * 60 : 0) + (m ? +m[1] : 0);
}
function v4Progress(film) {
  const S = window.SESSION || {};
  const c = (S.continued || []).find((x) => x.filmId === film.id);
  if (c && c.dur) return { pct: Math.min(0.96, c.t / c.dur), leftMin: Math.max(1, Math.round((c.dur - c.t) / 60)) };
  if (film.kind === "series") {
    const e = (film.series || []).find((e) => e.watched > 0 && e.watched < 1);
    if (e) return { pct: e.watched, leftMin: Math.max(2, Math.round((1 - e.watched) * 42)), ep: e };
  }
  // deterministic demo progress so the strip reads real without a session
  const h = [...film.id].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const pct = 0.22 + (h % 55) / 100;
  const total = v4RuntimeMin(film.runtime) || 96;
  return { pct, leftMin: Math.max(4, Math.round(total * (1 - pct))) };
}
function v4Go(film) {
  navigate(film.branched ? `/branches/${film.id}` : film.kind === "series" ? `/series/${film.id}` : `/film/${film.id}`);
}

// ─── 1 · Hero — type-led front page, framed still ─────────────────────────
function HeroV4() {
  const picks = umH4(heroPicks, []);
  const [idx, setIdx] = usH4(0);
  const [hover, setHover] = usH4(false);
  const isMobile = useIsMobile();

  ueH4(() => {
    if (hover || picks.length < 2) return;
    const t = setTimeout(() => setIdx((i) => (i + 1) % picks.length), HERO_DUR_V4);
    return () => clearTimeout(t);
  }, [idx, hover, picks.length]);

  if (!picks.length) return null;
  const film = picks[idx];
  const isSeries = film.kind === "series";
  const isBranched = !!film.branched;
  const kindLabel = isBranched ? "BRANCHED" : isSeries ? "SERIES" : "FILM";
  const note = film.programmerNote || film.logline;

  return (
    <section
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "var(--c-bg)",
        borderBottom: "1px solid var(--c-line)",
        padding: isMobile ? "28px 20px 30px" : "48px var(--gutter) 44px"
      }}>
      <style>{`
        @keyframes heroRiseV4 {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroProgV4 { from { width: 0; } to { width: 100%; } }
        @media (prefers-reduced-motion: reduce) {
          .cina-hero-v4-copy { animation: none !important; }
        }
      `}</style>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1.02fr) minmax(0, 1fr)",
        gap: isMobile ? 24 : "clamp(32px, 4vw, 64px)",
        alignItems: "center", maxWidth: "var(--w-page)", margin: "0 auto"
      }}>
        {/* Copy column */}
        <div key={film.id} className="cina-hero-v4-copy" style={{ animation: "heroRiseV4 .5s ease both", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-amber)", boxShadow: "0 0 8px var(--c-amber)" }}></span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", whiteSpace: "nowrap" }}>Front page</span>
            <span className="t-mono" style={{
              fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
              color: isBranched ? "var(--c-blood-l)" : "var(--c-ink-2)",
              padding: "2px 7px", borderRadius: "var(--r-1)",
              border: `1px solid ${isBranched ? "rgba(194,80,80,.5)" : "var(--c-line-2)"}`,
              whiteSpace: "nowrap"
            }}>{isBranched ? "⑂ " : ""}{kindLabel}</span>
            <span style={{ width: 1, height: 12, background: "var(--c-line-2)" }}></span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", fontWeight: 600, textTransform: "uppercase", whiteSpace: "nowrap" }}>
              {film.creator}
              {isSeries ? ` · S${film.season} · EP ${film.currentEp || 1} OF ${film.totalEpisodes}` : ` · ${film.year} · ${film.runtime}`}
            </span>
          </div>

          <h1 className="t-display" style={{
            fontStyle: "italic", fontWeight: 400,
            fontSize: isMobile ? "clamp(40px, 10vw, 56px)" : "clamp(44px, 4.6vw, 72px)",
            lineHeight: 0.96, margin: "0 0 16px", color: "var(--c-ink)",
            letterSpacing: "-0.02em", textWrap: "balance"
          }}>{film.title}.</h1>

          <p style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: isMobile ? 15 : 17, lineHeight: 1.5,
            color: "var(--c-ink-2)", margin: "0 0 20px", maxWidth: 480,
            letterSpacing: "-0.01em", textWrap: "pretty",
            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden"
          }}>{note}</p>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
            {typeof CertBadge === "function" && <CertBadge cert={film.cert} size={10} />}
            <span className="t-mono" style={{ color: "var(--c-amber)", fontSize: "var(--fs-body)", fontWeight: 600, letterSpacing: ".08em" }}>
              {film.rating ? `★ ${film.rating}` : "JUST PREMIERED"}
            </span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--c-ink-4)" }}></span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em" }}>
              {(film.genre || []).slice(0, 2).join(" · ").toUpperCase()}
            </span>
            {film.free && <>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--c-ink-4)" }}></span>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".16em" }}>FREE</span>
            </>}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary" style={{ height: 44, padding: "0 22px", fontSize: "var(--fs-body)", gap: 10 }} onClick={() => v4Go(film)}>
              <Icon name="play" size={13} />
              <span>{isBranched ? "Enter the branch" : isSeries ? "Watch the episode" : "Watch the film"}</span>
            </button>
            <button className="btn" style={{ height: 44, padding: "0 16px", fontSize: "var(--fs-body)", gap: 6 }} onClick={() => toggleWatchlist(film.id)}>
              <Icon name={isOnWatchlist && isOnWatchlist(film.id) ? "heart" : "plus"} size={12} />
              {isOnWatchlist && isOnWatchlist(film.id) ? "On list" : "Add to list"}
            </button>
          </div>
        </div>

        {/* Framed still + switcher */}
        <div style={{ minWidth: 0 }}>
          <div style={{
            position: "relative", aspectRatio: "16/9", overflow: "hidden",
            borderRadius: "var(--r-3)", border: "1px solid var(--c-line-2)",
            background: film.color, boxShadow: "0 24px 60px rgba(0,0,0,.45)"
          }}>
            {picks.map((f, i) => (
              <div key={f.id} aria-hidden={i !== idx} style={{
                position: "absolute", inset: 0,
                opacity: i === idx ? 1 : 0, transition: "opacity .7s ease"
              }}>
                <FrameThumb kind={f.thumb} usePhoto />
              </div>
            ))}
            {typeof topTrophy === "function" && topTrophy(film.id) && typeof TrophyChip === "function" && (
              <span style={{ position: "absolute", top: 12, left: 12 }}><TrophyChip filmId={film.id} /></span>
            )}
            {/* rotation progress along the frame's bottom edge */}
            {picks.length > 1 && (
              <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: "rgba(255,255,255,.14)" }}>
                <span key={idx} style={{
                  display: "block", height: "100%", background:  "var(--c-amber)",
                  animation: `heroProgV4 ${HERO_DUR_V4}ms linear both`,
                  animationPlayState: hover ? "paused" : "running"
                }}></span>
              </span>
            )}
          </div>

          {picks.length > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
              {picks.map((f, i) => {
                const active = i === idx;
                return (
                  <button key={f.id} onClick={() => setIdx(i)} title={f.title} aria-label={`Show ${f.title}`} style={{
                    appearance: "none", cursor: "pointer", padding: 0,
                    width: 72, height: 42, borderRadius: "var(--r-2)", overflow: "hidden",
                    position: "relative", flexShrink: 0, background: f.color,
                    border: active ? "1px solid var(--c-amber)" : "1px solid var(--c-line-2)",
                    opacity: active ? 1 : 0.55, transition: "all .25s ease"
                  }}>
                    <FrameThumb kind={f.thumb} usePhoto />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── 2 · Continue watching — compact resume rows ──────────────────────────
function ResumeStripV4({ shelf }) {
  const isMobile = useIsMobile();
  const films = (shelf.filmIds || []).map((id) => (window.CATALOG || []).find((f) => f.id === id)).filter(Boolean).slice(0, 8);
  if (!films.length) return null;

  return (
    <section style={{ padding: isMobile ? "26px 20px 6px" : "34px var(--gutter) 10px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
        <h2 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-title)", margin: 0, letterSpacing: "-0.01em" }}>
          {shelf.title || "Continue watching"}
        </h2>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>
          {films.length} TITLE{films.length === 1 ? "" : "S"}
        </span>
        <span style={{ flex: 1 }}></span>
        <button className="btn-ghost" style={{ height: 24, padding: "0 10px", fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }} onClick={() => navigate("/library")}>
          Your library <Icon name="chev-r" size={10} />
        </button>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(310px, 1fr))",
        gap: 12
      }}>
        {films.map((film) => {
          const p = v4Progress(film);
          const isSeries = film.kind === "series";
          const sub = isSeries
            ? `S${film.season || 1}${p.ep ? ` · EP ${p.ep.ep}` : ""} · ${film.creator}`
            : `${film.creator} · ${(film.genre || [])[0] || ""}`;
          return (
            <button key={film.id} onClick={() => v4Go(film)} style={{
              appearance: "none", textAlign: "left", cursor: "pointer",
              display: "flex", gap: 14, alignItems: "center",
              padding: 10, borderRadius: "var(--r-3)",
              background: "var(--c-panel)", border: "1px solid var(--c-line)",
              transition: "border-color .16s ease, transform .16s ease", minWidth: 0
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(var(--accent-rgb),.45)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--c-line)"; e.currentTarget.style.transform = "none"; }}>
              <span style={{
                position: "relative", width: 136, height: 78, flexShrink: 0,
                borderRadius: "var(--r-2)", overflow: "hidden", background: film.color,
                border: "1px solid var(--c-line-2)"
              }}>
                <FrameThumb kind={film.thumb} usePhoto />
                <span style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(8,7,6,.28)"
                }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(8,7,6,.72)", border: "1px solid rgba(255,255,255,.25)", color: tkc("white")
                  }}><Icon name="play" size={10} /></span>
                </span>
                <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: "rgba(255,255,255,.16)" }}>
                  <span style={{ display: "block", height: "100%", width: `${Math.round(p.pct * 100)}%`, background: "var(--c-amber)" }}></span>
                </span>
              </span>
              <span style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.1, color: "var(--c-ink)", letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {film.title}
                </span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {sub}
                </span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>
                  RESUME · {p.leftMin} MIN LEFT
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ─── Compose ──────────────────────────────────────────────────────────────
function SplashPageV4() {
  useSession();
  const find = (id) => (window.SHELVES || []).find((s) => s.id === id);
  const continueShelf = find("continue");
  const newReleases = find("new");
  const premiere = find("premiere");
  const signedIn = !!((window.SESSION && window.SESSION.signedIn) || (window.CINA && window.CINA.signedIn));

  return (
    <div className="cina-home-v4">
      <style>{`
        /* Mobile polish — one consistent header scale + rhythm on ≤767px */
        @media (max-width: 767px) {
          .cina-home-v4 section { padding-left: 20px !important; padding-right: 20px !important; }
          .cina-home-v4 h2 { font-size:var(--fs-title) !important; letter-spacing: -0.015em !important; }
          .cina-home-v4 h3 { font-size:var(--fs-lead) !important; }
        }
      `}</style>
      {/* I · Arrive — full-bleed rotating hero (v3), then resume */}
      <HeroRotator />
      {signedIn && continueShelf && (
        <div style={{ paddingTop: 10 }}>
          <Shelf shelf={continueShelf} size="sm" />
        </div>
      )}
      {!signedIn && newReleases && (
        <div style={{ paddingTop: 10 }}>
          <Shelf shelf={{ ...newReleases, title: "What's new", note: null }} size="sm" />
        </div>
      )}

      {/* II · Featured tonight — giant fading promo stage + yours */}
      <div style={{ borderBottom: "1px solid var(--c-line)", background: "var(--c-bg)" }}>
        {typeof PromoSlideshow === "function" ? <PromoSlideshow /> : <TonightPick />}
        <ForYouRail />
        <MoodChips />
      </div>

      {/* III · Live */}
      <LiveOnCinaBand />
      <LiveRoomsStrip />

      {/* IV · Browse */}
      <div style={{ borderTop: "1px solid var(--c-line)", background: "var(--c-bg)" }}>
        {signedIn && newReleases && <Shelf shelf={newReleases} size="lg" />}
        {premiere && <Shelf shelf={premiere} size="lg" />}
        <BranchedHomeShelf />
        <Top10Today />
        <GenreBrowse />
      </div>

      {/* V · The world of Cina */}
      <div style={{ borderTop: "1px solid var(--c-line)", background: "var(--c-panel)" }}>
        <StudiosHomeRow />
        <FacesRow />
        <FestivalStrip />
      </div>
      <EditorsBand />
      {window.ProducersShelf ? <window.ProducersShelf /> : null}
      <NFTSpotlight />
    </div>
  );
}

Object.assign(window, { SplashPage: SplashPageV4 });
