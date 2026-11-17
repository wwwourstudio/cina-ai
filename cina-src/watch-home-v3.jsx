// watch-home-v3.jsx — Streaming-first homepage refactor.
// Replaces the 3-chapter magazine splash with a dense, get-to-play layout:
//   1. Rotating multi-title hero (thumbnail switcher, auto-advance)
//   2. Pulse ribbon (kept)
//   3. Resume + mood chips (one utility band)
//   4. Dense shelves: new · premieres
//   5. Top 10 today — the ONE ranked row (trending was a duplicate of it)
//   6. Browse the library — genre-tabbed single shelf (kills 4 stacked rows)
//   7. Editors band — compact letter + director's note side by side
//   8. Live rooms + co-finance spotlight coda
// Keeps every data-cina-* hook so the existing Tweaks (mood/voice/motion)
// still reshape the page. Overrides window.SplashPage at the end.

const { useState: usH3, useEffect: ueH3, useMemo: umH3, useRef: urH3 } = React;

const HERO_DUR = 7000;

// ─── Scroll parallax hook ─────────────────────────────────────────────────
// Returns a translateY offset (px) for a ref, driven by its position in the
// viewport. rAF-throttled; respects prefers-reduced-motion.
function useParallax(ref, strength = 0.18) {
  const [off, setOff] = usH3(0);
  ueH3(() => {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = ref.current; if (!el) return;
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight || 800;
        // -1 (below) .. 1 (above) relative to viewport center
        const rel = (r.top + r.height / 2 - vh / 2) / vh;
        setOff(rel * strength * vh * -1);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [ref, strength]);
  return off;
}

// ─── Section parallax backdrop ────────────────────────────────────────────
// Wraps a band of the page with a large, slow-drifting cinematic still and
// layered gradient washes so any content stays high-contrast and legible.
// `covers` = array of FrameThumb kinds; the first is the main backdrop.
function SectionParallax({ covers = [], tint = "rgba(8,7,6,0.82)", strength = 0.16, edge = true, children, style }) {
  const ref = urH3(null);
  const y = useParallax(ref, strength);
  const main = covers[0];
  return (
    <div ref={ref} style={{ position: "relative", overflow: "hidden", ...style }}>
      {main && (
        <div aria-hidden="true" style={{
          position: "absolute", left: 0, right: 0, top: "-14%", height: "128%",
          transform: `translate3d(0, ${y.toFixed(1)}px, 0)`, willChange: "transform", zIndex: 0,
        }}>
          <FrameThumb kind={main} usePhoto/>
        </div>
      )}
      {/* contrast washes */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, background: tint }}/>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, background: "linear-gradient(180deg, var(--c-bg) 0%, transparent 14%, transparent 86%, var(--c-bg) 100%)", opacity: edge ? 1 : 0 }}/>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, background: "radial-gradient(ellipse at 30% 40%, transparent 40%, rgba(8,7,6,.5) 100%)" }}/>
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ─── Live on Cina — redesigned cinematic live band ────────────────────────
// Replaces the old top-of-page PulseRibbon position. Live stats over a
// parallax backdrop, paired with the live-rooms strip into one "live" zone.
function LiveOnCinaBand() {
  const [tick, setTick] = usH3(0);
  const isMobile = useIsMobile();
  ueH3(() => { const t = setInterval(() => setTick((x) => x + 1), 1700); return () => clearInterval(t); }, []);

  const nextDrop = umH3(() => {
    const all = (window.CATALOG || []).flatMap((f) =>
      (f.series || []).filter((e) => e.status === "scheduled").map((e) => ({ film: f, ep: e, iso: e.drop + "T19:00:00" })));
    return all.sort((a, b) => new Date(a.iso) - new Date(b.iso))[0];
  }, []);
  const t = nextDrop && typeof timeUntilFromNow === "function" ? timeUntilFromNow(nextDrop.iso) : null;
  const watching = (12847 + (tick * 31) % 117 - 50).toLocaleString();
  const invested = "$" + ((84320 + (tick * 13) % 220) / 1000).toFixed(1) + "K";

  const stats = [
    { kind: "live", icon: "play", accent: "var(--c-good)", label: "WATCHING NOW", value: watching, onClick: null },
    { kind: "rooms", icon: "globe", accent: "var(--c-good)", label: "HOLDER ROOMS LIVE", value: "3", sub: "1,284 listening", onClick: () => navigate("/rooms") },
    { kind: "invest", icon: "ticket", accent: tkc("amber"), label: "INVESTED TODAY", value: invested, sub: "across 6 projects", onClick: () => navigate("/producers") },
    { kind: "drop", icon: "bell", accent: "var(--c-blood-l)", label: "NEXT PREMIERE", value: t ? t.label : "—", sub: nextDrop ? `${nextDrop.film.title} · ${nextDrop.ep.title || "Ep " + nextDrop.ep.ep}` : "", onClick: nextDrop ? () => navigate(nextDrop.film.kind === "series" ? `/series/${nextDrop.film.id}` : `/film/${nextDrop.film.id}`) : null, urgent: t && t.urgent },
  ];

  return (
    <SectionParallax covers={["sci-neon"]} tint="rgba(8,7,6,0.88)" strength={0.2}
      style={{ borderTop: "1px solid var(--c-line)", borderBottom: "1px solid var(--c-line)" }}>
      <div style={{ padding: isMobile ? "30px 20px" : "40px var(--gutter)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 10px var(--c-good)", animation: "pulse-dot 1.6s ease-in-out infinite" }}/>
          <h2 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: isMobile ? 26 : 34, margin: 0, letterSpacing: "-0.02em" }}>Live on Cina, right now</h2>
          <span style={{ flex: 1, minWidth: 20 }}/>
          <button className="btn-ghost" style={{ height: 26, padding: "0 12px", fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }} onClick={() => navigate("/rooms")}>
            Browse rooms <Icon name="chev-r" size={10}/>
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {stats.map((s) => {
            const accent = s.urgent ? "var(--c-blood-l)" : s.accent;
            return (
              <button key={s.kind} onClick={s.onClick} disabled={!s.onClick} style={{
                appearance: "none", textAlign: "left", cursor: s.onClick ? "pointer" : "default",
                borderRadius: "var(--r-3)", border: "1px solid var(--c-line-2)",
                background: "linear-gradient(165deg, rgba(20,17,14,.78) 0%, rgba(12,10,9,.72) 100%)",
                backdropFilter: "blur(10px)",
                padding: "18px 18px", display: "flex", flexDirection: "column", gap: 11,
                transition: "border-color .15s ease, transform .15s ease",
              }}
                onMouseEnter={(e) => { if (!s.onClick) return; e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--c-line-2)"; e.currentTarget.style.transform = "none"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                  <span style={{ width: 30, height: 30, borderRadius: "var(--r-2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `color-mix(in oklch, ${accent} 20%, transparent)`, color: accent }}>
                    <Icon name={s.icon} size={14}/>
                  </span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", letterSpacing: ".16em", lineHeight: 1.3 }}>{s.label}</span>
                  <span style={{ flex: 1 }}/>
                  {s.onClick && <Icon name="chev-r" size={11}/>}
                </div>
                <div className="t-num" style={{ fontSize: "var(--fs-head)", fontWeight: 600, lineHeight: 1, color: s.urgent ? "var(--c-blood-l)" : s.kind === "invest" ? "var(--c-amber)" : "var(--c-ink)", letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
                {s.sub && <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{s.sub}</div>}
              </button>
            );
          })}
        </div>
      </div>
    </SectionParallax>
  );
}

// ─── Cina AI curation ─────────────────────────────────────────────────────
// Builds a taste profile from the viewer's real signals (continue-watching,
// watchlist, ratings, follows) and scores the catalog against it. Returns a
// ranked list of { film, score, reason } — the reason is shown on the card so
// the curation is legible, not a black box.
function cinaCurate() {
  cinaCurate._tp = null; // recompute the taste print per curation pass
  const cat = window.CATALOG || [];
  const S = window.SESSION || {};
  const watch = new Set(S.watchlist || []);
  const continued = S.continued || [];
  const ratings = S.ratings || {};
  const followed = new Set(S.followed || []);

  const genreW = {};
  const creatorSeen = {};
  const find = (id) => cat.find((x) => x.id === id);
  const bump = (id, w) => {
    const f = find(id); if (!f) return;
    (f.genre || []).forEach((g) => { genreW[g] = (genreW[g] || 0) + w; });
    creatorSeen[f.creatorId] = (creatorSeen[f.creatorId] || 0) + w;
  };
  continued.forEach((c) => bump(c.filmId, 3));
  [...watch].forEach((id) => bump(id, 2));
  Object.entries(ratings).forEach(([id, n]) => bump(id, (n - 3) * 1.6));

  const hasSignal = continued.length || watch.size || Object.keys(ratings).length || followed.size;
  const contIds = new Set(continued.map((c) => c.filmId));

  const topGenres = Object.entries(genreW).sort((a, b) => b[1] - a[1]).map(([g]) => g);

  const scored = cat.
  filter((f) => !contIds.has(f.id)).
  map((f) => {
    let s = 0;const reasons = [];
    (f.genre || []).forEach((g) => {if (genreW[g]) s += genreW[g] * 2.2;});
    if (followed.has(f.creatorId)) {s += 9;reasons.push({ t: "You follow " + f.creator, k: "follow" });}
    else if (creatorSeen[f.creatorId]) {s += 4.5;reasons.push({ t: "More from " + f.creator, k: "creator" });}
    const matchG = (f.genre || []).filter((g) => genreW[g]).sort((a, b) => genreW[b] - genreW[a])[0];
    if (matchG && !reasons.length) reasons.push({ t: "Because you watch " + matchG.toLowerCase(), k: "genre" });
    if (watch.has(f.id)) {s += 3;reasons.push({ t: "On your watchlist", k: "watch" });}
    s += (f.rating || 0) * 1.3 + Math.log10((f.views || 1) + 1) * 0.6;
    // Taste print — the choice ledgers (forks, wardrobe buys, ownership) tilt
    // the feed, with a legible reason when the signal is strong.
    if (window.computeTastePrint && !cinaCurate._tp) cinaCurate._tp = window.computeTastePrint();
    const tp = cinaCurate._tp;
    if (tp && tp.boost) {
      const b = tp.boost(f);
      s += b.s;
      if (b.reason) reasons.unshift({ t: b.reason, k: "taste" });
    }
    if (!reasons.length) reasons.push({ t: (f.rating || 0).toFixed(1) + "★ · loved by the room", k: "top" });
    return { film: f, score: s, reason: reasons[0], reasons };
  }).
  sort((a, b) => b.score - a.score);

  return { items: scored, topGenres, hasSignal, followCount: followed.size };
}

// Small "Cina AI" mark — a curated-by sigil, not an emoji.
function CinaAIMark({ size = 15 }) {
  return (
    <span style={{
      width: size + 8, height: size + 8, borderRadius: "50%", flexShrink: 0,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(circle at 35% 30%, rgba(var(--accent-rgb),.32), rgba(155,142,196,.18))",
      border: "1px solid rgba(var(--accent-rgb),.45)"
    }}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2 L13.6 9.1 L20.5 7.2 L14.9 11.8 L19.4 17.6 L12.6 14.4 L11 21.5 L9.4 14.4 L2.6 17.6 L7.1 11.8 L1.5 7.2 L8.4 9.1 Z"
          fill= "var(--c-amber)" opacity="0.92" />
      </svg>
    </span>);

}

// ─── For You rail — the AI-curated feed, with legible reason chips ─────────
function ForYouRail() {
  const isMobile = useIsMobile();
  const ref = urH3(null);
  const { items, topGenres, hasSignal, followCount } = umH3(() => cinaCurate(), []);
  const picks = items.slice(0, 12);
  if (!picks.length) return null;

  const profile = hasSignal ?
  (topGenres.slice(0, 3).join(" · ") || "your taste") + (followCount ? ` · ${followCount} followed` : "") :
  "popular on Cina";

  const reasonColor = (k) =>
  k === "follow" ? "var(--c-amber)" :
  k === "watch" ? "var(--c-amber)" :
  k === "creator" ? "var(--c-agent-audio)" :
  k === "genre" ? "var(--c-agent-visual)" : "var(--c-ink-3)";

  return (
    <section style={{ padding: isMobile ? "28px 20px 10px" : "40px var(--gutter) 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
        <CinaAIMark size={16} />
        <h2 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: isMobile ? 26 : 34, margin: 0, letterSpacing: "-0.02em" }}>For you</h2>
        {window.TastePrintChip && !isMobile && <TastePrintChip/>}
        <span style={{ flex: 1, minWidth: 12 }} />
        <button className="btn-ghost" style={{ height: 26, padding: "0 12px", fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }} onClick={() => navigate("/browse")}>
          Browse all <Icon name="chev-r" size={10} />
        </button>
      </div>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 20 }}>
        CURATED BY CINA AI FROM <span style={{ color: "var(--c-ink-2)" }}>{profile.toUpperCase()}</span>
      </div>

      <CarouselRail fade="var(--c-bg)" gap={isMobile ? 14 : 20} padY={12} style={{ marginLeft: -4, marginRight: -4 }}>
        {picks.map(({ film, reason }) => {
          const isSeries = film.kind === "series";
          return (
            <button key={film.id} onClick={() => navigate(film.branched ? `/branches/${film.id}` : isSeries ? `/series/${film.id}` : `/film/${film.id}`)}
              style={{
                flex: "0 0 auto",
                width: isMobile ? "min(280px, 78vw)" : "clamp(264px, 23vw, 330px)",
                scrollSnapAlign: "start",
                appearance: "none", textAlign: "left", cursor: "pointer", padding: 0,
                display: "flex", flexDirection: "column",
                background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden",
                transition: "border-color .16s ease, transform .16s ease, box-shadow .16s ease"
              }}
              onMouseEnter={(e) => {e.currentTarget.style.borderColor = "rgba(var(--accent-rgb),.45)";e.currentTarget.style.transform = "translateY(-3px)";e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,.35)";}}
              onMouseLeave={(e) => {e.currentTarget.style.borderColor = "var(--c-line)";e.currentTarget.style.transform = "none";e.currentTarget.style.boxShadow = "none";}}>
              <span style={{ display: "block", position: "relative", aspectRatio: "16/9", background: film.color, overflow: "hidden" }}>
                <FrameThumb kind={film.thumb} usePhoto />
                <span style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,7,6,.82) 0%, transparent 55%)" }} />
                {typeof topTrophy === "function" && topTrophy(film.id) && typeof TrophyChip === "function" &&
                <span style={{ position: "absolute", top: 10, left: 10 }}><TrophyChip filmId={film.id} /></span>}
                <span style={{ position: "absolute", left: 12, bottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, color: tkc("white"), padding: "3px 7px", borderRadius: "var(--r-1)", background: "rgba(0,0,0,.66)", border: "1px solid rgba(255,255,255,.16)" }}>
                    {film.branched ? "⑂ BRANCHED" : isSeries ? "SERIES" : "FILM"}
                  </span>
                </span>
                <span style={{ position: "absolute", right: 10, bottom: 10, display: "flex", alignItems: "center", gap: 4, padding: "3px 7px", borderRadius: "var(--r-1)", background: "rgba(0,0,0,.72)", border: "1px solid rgba(255,255,255,.14)" }}>
                  <span style={{ color: "var(--c-amber)", fontSize: "var(--fs-label)" }}>★</span>
                  <span className="t-mono t-num" style={{ fontSize: "var(--fs-label)", color: tkc("white"), fontWeight: 600 }}>{Number(film.rating || 0).toFixed(1)}</span>
                </span>
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: 6, padding: "14px 16px 16px", flex: 1 }}>
                <span className="t-display" style={{ display: "block", fontStyle: "italic", fontSize: "var(--fs-lead)", letterSpacing: "-0.01em", lineHeight: 1.12, color: "var(--c-ink)" }}>{film.title}</span>
                <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
                  {(film.genre || []).slice(0, 2).join(" · ").toUpperCase()} · {film.year}
                </span>
                <span style={{ flex: 1 }}></span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 6, padding: "5px 10px", borderRadius: 999, alignSelf: "flex-start", maxWidth: "100%", background: "color-mix(in oklab, currentColor 0%, transparent)", border: `1px solid color-mix(in oklab, ${reasonColor(reason.k)} 40%, transparent)` }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: reasonColor(reason.k), flexShrink: 0 }} />
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: reasonColor(reason.k), letterSpacing: ".08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{reason.t}</span>
                </span>
              </span>
            </button>);

        })}
      </CarouselRail>
    </section>);

}

// ─── Hero rotator ─────────────────────────────────────────────────────────
function heroPicks() {
  // Films + series + branched, mixed deliberately.
  const C = window.CATALOG || [];
  const picks = [];
  const push = (id) => {const f = C.find((x) => x.id === id);if (f && !picks.includes(f)) picks.push(f);};
  push("ll"); // flagship series
  Object.keys(window.BRANCH_FILMS || {}).slice(0, 3).forEach(push); // every branched room
  ["verge", "drift", "marauder"].forEach(push); // films + 2nd series
  return picks.slice(0, 6);
}

function HeroRotator() {
  const picks = umH3(heroPicks, []);
  const [idx, setIdx] = usH3(0);
  const [hover, setHover] = usH3(false);
  const isMobile = useIsMobile();

  ueH3(() => {
    if (hover || picks.length < 2) return;
    const t = setTimeout(() => setIdx((i) => (i + 1) % picks.length), HERO_DUR);
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
      data-cina-hero
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        height: isMobile ? "min(70vh, 600px)" : "min(72vh, 640px)",
        minHeight: isMobile ? 480 : 520,
        overflow: "hidden", background: "var(--c-bg)", marginTop: -1
      }}>
      
      {/* 1 — backdrop slides (crossfade inside the drift wrapper) */}
      <div data-cina-drift style={{
        position: "absolute", inset: 0,
        animation: "heroDriftV3 38s ease-in-out infinite alternate",
        transformOrigin: "60% 50%", willChange: "transform",
        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 58%, rgba(0,0,0,.55) 78%, transparent 97%)",
        maskImage: "linear-gradient(to bottom, black 0%, black 58%, rgba(0,0,0,.55) 78%, transparent 97%)"
      }}>
        {picks.map((f, i) =>
        <div key={f.id} style={{
          position: "absolute", inset: 0,
          opacity: i === idx ? 1 : 0,
          transition: "opacity .8s ease"
        }}>
            <FrameThumb kind={f.thumb} usePhoto />
          </div>
        )}
      </div>
      <style>{`
        @keyframes heroDriftV3 {
          0%   { transform: scale(1.02) translate(0,    0); }
          50%  { transform: scale(1.07) translate(-1.5%, -1%); }
          100% { transform: scale(1.04) translate(-2%,  -1.5%); }
        }
        @keyframes heroProgV3 { from { width: 0; } to { width: 100%; } }
        /* No overlay (incl. mood/motion overrides and the cinema flicker) may
           touch the hero's bottom edge — it must end as pure var(--c-bg). */
        [data-cina-hero]::after {
          -webkit-mask-image: linear-gradient(to bottom, black 0%, black 55%, rgba(0,0,0,.5) 78%, transparent 96%);
          mask-image: linear-gradient(to bottom, black 0%, black 55%, rgba(0,0,0,.5) 78%, transparent 96%);
        }
        @keyframes heroRiseV3 {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cina-hero-rail { display: flex; }
        .cina-hero-dots { display: none; }
        @media (max-width: 1180px) {
          .cina-hero-rail { display: none; }
          .cina-hero-dots { display: flex; }
        }
      `}</style>

      {/* 2 — left editorial gradient (tweaks target nth-of-type(2)) */}
      {(() => { const heroFade = { WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 55%, rgba(0,0,0,.5) 78%, transparent 96%)", maskImage: "linear-gradient(to bottom, black 0%, black 55%, rgba(0,0,0,.5) 78%, transparent 96%)" }; return (<>
      <div style={{
        position: "absolute", inset: 0, ...heroFade,
        background: "linear-gradient(to right, color-mix(in oklab, var(--c-bg) 74%, transparent) 0%, color-mix(in oklab, var(--c-bg) 32%, transparent) 40%, transparent 72%)"
      }}></div>
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, height: "62%",
        background: "linear-gradient(to top, var(--c-bg) 0%, var(--c-bg) 8%, color-mix(in oklab, var(--c-bg) 86%, transparent) 26%, color-mix(in oklab, var(--c-bg) 55%, transparent) 48%, color-mix(in oklab, var(--c-bg) 22%, transparent) 74%, transparent 100%)"
      }}></div>
      <div data-cina-vignette style={{
        position: "absolute", inset: 0, ...heroFade,
        background: "radial-gradient(ellipse at 60% 38%, transparent 35%, color-mix(in oklab, var(--c-bg) 35%, transparent) 90%)",
        pointerEvents: "none"
      }}></div>
      <div data-cina-grain style={{
        position: "absolute", inset: 0, ...heroFade,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "3px 3px", opacity: 0.6, mixBlendMode: "overlay", pointerEvents: "none"
      }}></div>
      </>); })()}

      {/* Content */}
      <div style={{
        position: "absolute", inset: 0,
        padding: isMobile ? "0 24px 32px" : "0 var(--gutter) 44px",
        display: "flex", flexDirection: "column", justifyContent: "flex-end"
      }}>
        <div key={film.id} style={{
          maxWidth: 640,
          animation: "heroRiseV3 .55s ease both"
        }}>
          {/* festival trophy laurel — sits above ALL the hero text */}
          {typeof topTrophy === "function" && topTrophy(film.id) && typeof WinnerTrophy === "function" && (
            <div style={{ marginBottom: 14 }}>
              <WinnerTrophy variant="laurel" award={topTrophy(film.id).award} edition={topTrophy(film.id).edition} date={topTrophy(film.id).date} color={topTrophy(film.id).color}/>
            </div>
          )}

          {/* kicker */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, rowGap: 8, marginBottom: 14, flexWrap: "wrap", minWidth: 0 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-amber)", boxShadow: "0 0 8px var(--c-amber)" }}></span>
            <span style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
              color: "var(--c-amber)", fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap", letterSpacing: "0.5px"
            }}>Front page</span>
            <span style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
              color: isBranched ? "var(--c-blood-l)" : "var(--c-ink-2)",
              padding: "2px 7px", borderRadius: "var(--r-1)",
              border: `1px solid ${isBranched ? "rgba(194,80,80,.5)" : "var(--c-line-2)"}`,
              whiteSpace: "nowrap"
            }}>{isBranched ? "⑂ " : ""}{kindLabel}</span>
            <span style={{ width: 1, height: 12, background: "var(--c-line-2)" }}></span>
            <span style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              color: "var(--c-ink-3)", fontWeight: 600, textTransform: "uppercase", whiteSpace: "nowrap"
            }}>
              {film.creator}
              {isSeries ?
              ` · S${film.season} · EP ${film.currentEp || 1} OF ${film.totalEpisodes}` :
              ` · ${film.year} · ${film.runtime}`}
            </span>
          </div>

          {/* title */}
          <h1 className="t-display" style={{
            fontStyle: "italic", fontWeight: 400,
            fontSize: "clamp(44px, 5.6vw, 76px)",
            lineHeight: 0.94, margin: "0 0 14px", color: "var(--c-ink)",
            letterSpacing: "-0.02em",
            textShadow: "0 4px 30px rgba(0,0,0,.6)", textWrap: "balance"
          }}>{film.title}.</h1>

          {/* one-line note */}
          <p style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: isMobile ? 15 : 17, lineHeight: 1.45,
            color: "var(--c-ink)", margin: "0 0 18px", maxWidth: 520,
            textShadow: "0 2px 14px rgba(0,0,0,.85)", letterSpacing: "-0.01em",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            textWrap: "pretty"
          }}>{note}</p>

          {/* meta + actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
            {typeof CertBadge === "function" && <CertBadge cert={film.cert} size={10} />}
            <span style={{ color: "var(--c-amber)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", fontWeight: 600, letterSpacing: ".08em" }}>
              {film.rating ? `★ ${film.rating}` : "JUST PREMIERED"}
            </span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--c-ink-4)" }}></span>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-2)", letterSpacing: ".08em" }}>
              {(film.genre || []).slice(0, 2).join(" · ").toUpperCase()}
            </span>
            {film.free &&
            <>
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--c-ink-4)" }}></span>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".16em" }}>FREE</span>
              </>
            }
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button
              className="btn btn-primary"
              style={{ height: 44, padding: "0 22px", fontSize: "var(--fs-body)", gap: 10 }}
              onClick={() => navigate(isBranched ? `/branches/${film.id}` : isSeries ? `/series/${film.id}` : `/film/${film.id}`)}>
              
              <Icon name="play" size={13} />
              <span>{isBranched ? "Enter the branch" : isSeries ? "Watch the episode" : "Watch the film"}</span>
            </button>
            <button
              className="btn"
              style={{ height: 44, padding: "0 16px", fontSize: "var(--fs-body)", gap: 6 }}
              onClick={() => toggleWatchlist(film.id)}>
              
              <Icon name={isOnWatchlist && isOnWatchlist(film.id) ? "heart" : "plus"} size={12} />
              {isOnWatchlist && isOnWatchlist(film.id) ? "On list" : "Add to list"}
            </button>

            {/* narrow-viewport dots */}
            <span className="cina-hero-dots" style={{ gap: 7, marginLeft: 8, alignItems: "center" }}>
              {picks.map((f, i) =>
              <button key={f.id} onClick={() => setIdx(i)} aria-label={`Show ${f.title}`} style={{
                appearance: "none", border: "none", cursor: "pointer", padding: 0,
                width: i === idx ? 22 : 7, height: 7, borderRadius: "var(--r-2)",
                background: i === idx ? "var(--c-amber)" : "rgba(255,255,255,.3)",
                transition: "all .25s ease"
              }}></button>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Thumbnail rail — the switcher */}
      <div className="cina-hero-rail" style={{
        position: "absolute", right: 56, bottom: 44,
        gap: 10, alignItems: "flex-end", zIndex: 3
      }}>
        {picks.map((f, i) => {
          const active = i === idx;
          return (
            <button key={f.id} onClick={() => setIdx(i)} title={f.title} style={{
              appearance: "none", cursor: "pointer", padding: 0,
              width: active ? 148 : 112, height: active ? 84 : 63,
              borderRadius: "var(--r-2)", overflow: "hidden", position: "relative", flexShrink: 0,
              border: active ? "1px solid var(--c-amber)" : "1px solid rgba(255,255,255,.18)",
              boxShadow: active ? "0 8px 24px rgba(0,0,0,.55)" : "0 4px 14px rgba(0,0,0,.4)",
              opacity: active ? 1 : .62,
              transition: "all .3s ease", background: f.color
            }}>
              <FrameThumb kind={f.thumb} usePhoto />
              {active && typeof TrophyChip === "function" && (
                <span style={{ position: "absolute", top: 6, left: 6 }}>
                  <TrophyChip filmId={f.id}/>
                </span>
              )}
              {!active && <span style={{ position: "absolute", inset: 0, background: "rgba(8,8,10,.3)" }}></span>}
              {active &&
              <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: "rgba(255,255,255,.22)" }}>
                  <span key={idx} style={{
                  display: "block", height: "100%", background:  "var(--c-amber)",
                  animation: `heroProgV3 ${HERO_DUR}ms linear both`,
                  animationPlayState: hover ? "paused" : "running"
                }}></span>
                </span>
              }
              <span style={{
                position: "absolute", left: 8, bottom: active ? 8 : 5, right: 8,
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700,
                letterSpacing: ".16em", textTransform: "uppercase",
                color: active ? tkc("white") : "rgba(255,255,255,.75)",
                textShadow: "0 1px 6px rgba(0,0,0,.9)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "left"
              }}>{f.title}</span>
            </button>);

        })}
      </div>
    </section>);

}

// ─── Browse the library — genre-tabbed shelf ─────────────────────────────
// One shelf + chips instead of four stacked genre rows.
function GenreBrowse() {
  const tabs = [
  { id: "noir", label: "Noir" },
  { id: "scifi", label: "Sci-fi" },
  { id: "horror", label: "Horror" },
  { id: "drama", label: "Drama" },
  { id: "free", label: "Free with ads" },
  { id: "voss", label: "Studio Voss" }].
  filter((t) => (window.SHELVES || []).some((s) => s.id === t.id));
  const [tab, setTab] = usH3(tabs[0]?.id);
  const shelf = (window.SHELVES || []).find((s) => s.id === tab);
  const isMobile = useIsMobile();
  if (!shelf) return null;

  return (
    <section style={{ padding: isMobile ? "26px 0 6px" : "26px 0 10px" }}>
      <div style={{
        display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap",
        padding: isMobile ? "0 20px" : "0 var(--gutter)", marginBottom: 4
      }}>
        <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 400, margin: 0, letterSpacing: "-0.01em" }}>
          The library
        </h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {tabs.map((t) =>
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            appearance: "none", cursor: "pointer", borderRadius: 999, padding: "5px 13px",
            border: `1px solid ${tab === t.id ? "rgba(var(--accent-rgb),.4)" : "var(--c-line-2)"}`,
            background: tab === t.id ? "rgba(var(--accent-rgb),.1)" : "transparent",
            color: tab === t.id ? "var(--c-amber)" : "var(--c-ink-3)",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em", fontWeight: 600,
            transition: "all .15s ease"
          }}>{t.label.toUpperCase()}</button>
          )}
        </div>
        <span style={{ flex: 1 }}></span>
        <button
          className="btn-ghost"
          style={{ height: 24, padding: "0 10px", fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }}
          onClick={() => navigate("/genre/film")}>
          Everything <Icon name="chev-r" size={10} /></button>
      </div>
      {/* The Shelf renders its own title row; suppress duplication via slim variant */}
      <Shelf shelf={{ ...shelf, title: shelf.title, note: null }} />
    </section>);

}

// ─── Editors band — letter + director's note, one compact section ────────
function EditorsBand() {
  const featured = umH3(() => (window.CREATORS || [])[0], []);
  const isMobile = useIsMobile();
  return (
    <section style={{
      padding: isMobile ? "30px 20px" : "38px var(--gutter)",
      borderTop: "1px solid var(--c-line)", borderBottom: "1px solid var(--c-line)",
      background: "var(--c-void)"
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1.25fr) minmax(0, 1fr)",
        gap: isMobile ? 32 : 64,
        maxWidth: "var(--w-page)", margin: "0 auto"
      }}>
        {/* Editor's letter — compressed to the argument */}
        <div data-cina-letter>
          <span style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
            color: "var(--c-ink-3)", textTransform: "uppercase", fontWeight: 600,
            display: "block", marginBottom: 12
          }}>FROM THE EDITOR · WEEK OF MAY 12</span>
          <p style={{ ...{
              margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic",
              fontSize: isMobile ? 19 : 22, lineHeight: 1.38, color: "var(--c-ink)",
              letterSpacing: "-0.01em", textWrap: "pretty"
            }, fontSize: "20px" }}>
            Three things this week. Voss's <em style={{ color: "var(--c-amber)" }}>Last Light</em> reaches
            the darkroom. The <em style={{ color: "var(--c-amber)" }}>Frequency 88.6</em> fork is the most
            contested vote we have seen in this room. And Wren Soto's first lead
            in <em style={{ color: "var(--c-amber)" }}>Tender</em> — short, and wonderful.
          </p>
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)",
              color: "var(--c-amber)"
            }}>— Ada Beresford</span>
            <span style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              color: "var(--c-ink-4)", textTransform: "uppercase",
              paddingLeft: 12, borderLeft: "1px solid var(--c-line-2)"
            }}>Editor-in-chief</span>
          </div>
        </div>

        {/* Director's note — quote card */}
        {featured &&
        <div data-cina-director-note style={{
          paddingLeft: isMobile ? 0 : 36,
          borderLeft: isMobile ? "none" : "1px solid var(--c-line)",
          display: "flex", flexDirection: "column", justifyContent: "center", gap: 14
        }}>
            <span style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
            color: "var(--c-amber)", textTransform: "uppercase", fontWeight: 700
          }}>DIRECTOR'S NOTE</span>
            <p style={{
            margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-lead)", lineHeight: 1.5, color: "var(--c-ink-2)", textWrap: "pretty"
          }}>"{featured.note || featured.bio}"</p>
            <button
            className="btn-ghost"
            onClick={() => navigate(`/creator/${featured.id}`)}
            style={{ height: "auto", padding: 0, gap: 10, justifyContent: "flex-start" }}>
            
              <span style={{
              width: 32, height: 32, borderRadius: "50%", background: featured.color,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)"
            }}>{featured.name.split(" ").map((p) => p[0]).join("")}</span>
              <span style={{ textAlign: "left" }}>
                <span className="t-display" style={{ display: "block", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{featured.name}</span>
                <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 2 }}>
                  {featured.handle} · {fmtCount(featured.followers)} FOLLOWERS
                </span>
              </span>
            </button>
          </div>
        }
      </div>
    </section>);

}

// ─── Compose ──────────────────────────────────────────────────────────────

// Tonight's pick — one decisive, personalized call. The counterpart to the
// For-You rail: not a shelf to browse but a single confident recommendation,
// off the same cinaCurate() engine. "Not tonight" walks down the ranked list.
function TonightPick() {
  const isMobile = useIsMobile();
  const { items, hasSignal } = umH3(() => cinaCurate(), []);
  const [i, setI] = usH3(0);
  const pool = items.slice(0, 8);
  if (!pool.length) return null;
  const { film, reason } = pool[i % pool.length];
  const isSeries = film.kind === "series";
  const signedIn = !!((window.SESSION && window.SESSION.signedIn) || (window.CINA && window.CINA.signedIn));
  const go = () => navigate(film.branched ? `/branches/${film.id}` : isSeries ? `/series/${film.id}` : `/film/${film.id}`);
  const runtime = film.runtime || (isSeries ? (film.totalEpisodes ? film.totalEpisodes + " episodes" : "") : "");
  const blurb = film.synopsis || film.logline || film.note || "";

  return (
    <section style={{ padding: isMobile ? "8px 20px 6px" : "12px var(--gutter) 8px" }}>
      <div style={{
        position: "relative", overflow: "hidden",
        borderRadius: "var(--r-3)", border: "1px solid var(--c-line)", background: "var(--c-panel)",
        minHeight: isMobile ? "auto" : 336,
        display: isMobile ? "block" : "grid",
        gridTemplateColumns: isMobile ? undefined : "1.05fr 1fr"
      }}>
        {/* backdrop — right slab on desktop, top on mobile */}
        <div style={{
          position: isMobile ? "relative" : "absolute",
          inset: isMobile ? undefined : 0, left: isMobile ? undefined : "42%",
          height: isMobile ? 188 : "auto", overflow: "hidden", background: film.color
        }}>
          <FrameThumb kind={film.thumb} usePhoto />
          <span style={{
            position: "absolute", inset: 0,
            background: isMobile
              ? "linear-gradient(to bottom, rgba(19,20,24,0) 18%, var(--c-panel) 97%)"
              : "linear-gradient(to right, var(--c-panel) 3%, rgba(19,20,24,.5) 34%, transparent 72%)"
          }} />
        </div>

        {/* content */}
        <div style={{
          position: "relative", zIndex: 2,
          padding: isMobile ? "18px 20px 22px" : "34px 40px",
          display: "flex", flexDirection: "column", justifyContent: "center", gap: 13,
          maxWidth: isMobile ? "none" : 560
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <CinaAIMark size={15} />
            <span className="t-eyebrow t-eyebrow--bare" style={{ color: "var(--c-amber)" }}>
              {signedIn && hasSignal ? "Tonight, for you" : "Tonight on Cina"}
            </span>
          </div>

          <h2 className="t-display" style={{ margin: 0, fontStyle: "italic", fontWeight: 400, fontSize: isMobile ? 34 : 48, lineHeight: 0.98, letterSpacing: "-0.02em", color: "var(--c-ink)" }}>
            {film.title}
          </h2>

          <div className="t-mono t-num" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" }}>
            {(film.genre || []).slice(0, 2).join(" · ").toUpperCase()}
            {runtime ? "  ·  " + String(runtime).toUpperCase() : ""}
            {"  ·  "}<span style={{ color: "var(--c-amber)" }}>★ {Number(film.rating || 0).toFixed(1)}</span>
          </div>

          {blurb &&
          <p style={{ margin: 0, fontSize: "var(--fs-body)", lineHeight: 1.55, color: "var(--c-ink-2)", maxWidth: 460, textWrap: "pretty", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {blurb}
          </p>}

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-amber)", flexShrink: 0 }} />
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".08em" }}>{reason.t}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
            <button className="btn btn-primary btn-md" onClick={go}><Icon name="play" size={13} /> Play tonight</button>
            <button className="btn btn-md" onClick={() => setI((n) => n + 1)}><Icon name="refresh" size={12} /> Not tonight</button>
          </div>
        </div>
      </div>
    </section>);

}

function SplashPageV3() {
  useSession();
  const find = (id) => (window.SHELVES || []).find((s) => s.id === id);
  const continueShelf = find("continue");
  const newReleases = find("new");
  const premiere = find("premiere");
  const signedIn = !!((window.SESSION && window.SESSION.signedIn) || (window.CINA && window.CINA.signedIn));
  // Quick-start row: resume for members, "What's new" for signed-out visitors.
  const quickStartShelf = signedIn
    ? continueShelf
    : (newReleases ? { ...newReleases, title: "What's new", subtitle: "FRESH ON CINA THIS WEEK", note: null } : null);

  // ── Recomposed home: five acts, expressed visually ────────────────────────
  //  I   Arrive — hero; the resume strip PULLS UP over its base like a tray
  //  II  Yours  — Tonight + For-You + moods on one cinematic parallax wash
  //  III Live   — live band + rooms, one zone
  //  IV  Browse — dense middle on plain dark
  //  V   World  — studios/cast/festivals in a panel-toned closing band
  return (
    <div>
      {/* ═══ ACT I · ARRIVE — hero, then resume as a plain shelf ═══ */}
      <HeroRotator />
      {quickStartShelf && (
        <div style={{ paddingTop: 10 }}>
          <Shelf shelf={quickStartShelf} size="sm" />
        </div>
      )}

      {/* ═══ ACT II · YOURS ═══ */}
      <div style={{ borderBottom: "1px solid var(--c-line)", background: "var(--c-bg)" }}>
        <TonightPick />
        <ForYouRail />
        <MoodChips />
      </div>

      {/* ═══ ACT III · LIVE ═══ */}
      <LiveOnCinaBand />
      <LiveRoomsStrip />

      {/* ═══ ACT IV · BROWSE — the dense middle ═══ */}
      <div style={{ borderTop: "1px solid var(--c-line)", background: "var(--c-bg)" }}>
        {signedIn && newReleases && <Shelf shelf={newReleases} size="lg" />}
        {premiere && <Shelf shelf={premiere} size="lg" />}
        <BranchedHomeShelf />
        <Top10Today />
        <GenreBrowse />
      </div>

      {/* ═══ ACT V · THE WORLD OF CINA — panel-toned close ═══ */}
      <div style={{ borderTop: "1px solid var(--c-line)", background: "var(--c-panel)" }}>
        <StudiosHomeRow />
        <FacesRow />
        <FestivalStrip />
      </div>
      <EditorsBand />
      {window.ProducersShelf ? <window.ProducersShelf /> : null}
      <NFTSpotlight />
    </div>);

}

// Override the magazine splash. watch-app resolves SplashPage at render time.
Object.assign(window, { SplashPage: SplashPageV3, HeroRotator, GenreBrowse, EditorsBand });