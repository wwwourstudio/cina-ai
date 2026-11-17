// watch-promo.jsx — the giant fading promotion slideshow on the homepage.
// One rotating cinematic stage for everything Cina is pushing tonight:
// the festival, film premieres, live rooms — plus paid sponsor slots.
//
// v2 — full-bleed imagery. Film slides use the still as the slide's own
// backdrop (hero treatment, not a small framed card); the festival slide
// builds a marquee from the actual premiere thumbs; rooms shows the real
// live rooms. Sponsors stay restrained and clearly marked.
//
// Sponsors: push entries to window.HOME_SPONSORS — each
// { id, name, tag, line, cta, url, color }.

const { useState: usPR, useEffect: uePR, useMemo: umPR } = React;
const PROMO_DUR = 7000;

// Sponsor slides removed from the home rotator (audit, Oct 2026): ads belong
// in pre-roll, not the browsing surface. Push entries here to bring them back.
window.HOME_SPONSORS = window.HOME_SPONSORS || [];

function promoSlides() {
  const C = window.CATALOG || [];
  const S = (window.SHELVES || []);
  const slides = [];

  // Never repeat what the hero + continue row already show.
  const taken = new Set();
  try { (heroPicks() || []).forEach(f => taken.add(f.id)); } catch {}
  const cont = S.find(s => s.id === "continue");
  (cont && cont.filmIds || []).forEach(id => taken.add(id));

  const prem = S.find(s => s.id === "premiere");
  const premAll = (prem && prem.filmIds || []).map(id => C.find(f => f.id === id)).filter(Boolean);
  const premFresh = premAll.filter(f => !taken.has(f.id));

  // 1 · Festival — marquee built from the actual premiere slate
  slides.push({
    kind: "festival", accent: tkc("amber"),
    kicker: "CINA FESTIVAL · VOL VII",
    title: "Twelve premieres. One night.",
    line: "The whole slate screens back-to-back, live, with the directors in the rooms. Holders stay for the afterparty.",
    meta: "FRIDAY · 7:00 PM PT",
    cta: "Get a pass", go: () => navigate("/festival"),
    marquee: premAll.slice(0, 4),
  });

  // 2 · Film premieres — full-bleed stills
  premFresh.slice(0, 2).forEach(f => slides.push({
    kind: "film", film: f, accent: tkc("amber"),
    kicker: "WORLD PREMIERE",
    title: f.title,
    line: f.programmerNote || f.logline,
    meta: `${(f.creator || "").toUpperCase()} · ${f.year || ""} · ${f.runtime || ""}`,
    cta: "Watch now", go: () => navigate(f.branched ? `/branches/${f.id}` : f.kind === "series" ? `/series/${f.id}` : `/film/${f.id}`),
  }));

  // 3 · Branched cinema — the room votes, the film forks
  const brIds = Object.keys(window.BRANCH_FILMS || {}).filter(id => !taken.has(id));
  const brFilm = brIds.map(id => C.find(f => f.id === id)).filter(Boolean)[0];
  if (brFilm) {
    const br = window.BRANCH_FILMS[brFilm.id];
    const stats = typeof branchStats === "function" ? branchStats(brFilm.id, br) : { forks: 4, cuts: 81, live: true, watching: 2100 };
    slides.push({
      kind: "branched", film: brFilm, accent: "var(--c-blood-l)",
      kicker: "BRANCHED CINEMA · LIVE ROOM",
      title: brFilm.title,
      line: "The room votes at every fork — the winning cut locks as canon. " + ((br && br.director) || brFilm.creator) + " is in the room tonight.",
      meta: null, stats,
      cta: stats.live ? "Vote now" : "Enter the room", go: () => navigate(`/branches/${brFilm.id}`),
    });
  }

  // 4 · Tonight's rooms — built from the real branched rooms (they're the live ones)
  const rooms = Object.keys(window.BRANCH_FILMS || {}).map(id => {
    const f = C.find(x => x.id === id);
    if (!f) return null;
    const br = window.BRANCH_FILMS[id];
    const seed = [...id].reduce((a, ch) => a + ch.charCodeAt(0), 0);
    return { id: "room-" + id, filmId: id, title: f.title, host: (br && br.director) || f.creator, viewers: 800 + (seed % 2400) };
  }).filter(Boolean).slice(0, 3);
  const totalWatching = rooms.reduce((a, r) => a + r.viewers, 0);
  slides.push({
    kind: "rooms", accent: tkc("cat-1"),
    kicker: "TONIGHT'S ROOMS · LIVE NOW",
    title: "Watch together.",
    line: "Synced screenings with the director in the room. Talk between reels, vote at the forks.",
    meta: totalWatching ? `${totalWatching.toLocaleString()} WATCHING ACROSS ${rooms.length} ROOMS` : "ROOMS OPEN ALL NIGHT",
    cta: "Browse rooms", go: () => navigate("/rooms"),
    rooms,
  });

  // 5 · Sponsors — restrained, clearly marked; a dim still gives the slide texture
  (window.HOME_SPONSORS || []).forEach((sp, i) => {
    const texFilm = premAll[i % Math.max(1, premAll.length)] || C[i % Math.max(1, C.length)];
    slides.push({
      kind: "sponsor", accent: sp.color || "var(--c-ink-3)", sponsor: sp, texFilm,
      kicker: "SPONSORED",
      title: sp.name,
      line: sp.line,
      meta: sp.tag || "",
      cta: sp.cta || "Learn more", go: () => { try { window.open(sp.url || "#", "_blank", "noopener"); } catch {} },
    });
  });

  return slides;
}

// Right-side visual per slide kind (desktop only).
function PromoVisual({ s }) {
  // Live tick — viewer counts drift so the rooms feel alive.
  const [tick, setTick] = usPR(0);
  uePR(() => {
    if (s.kind !== "rooms") return;
    const t = setInterval(() => setTick(x => x + 1), 3000);
    return () => clearInterval(t);
  }, [s.kind]);

  if (s.kind === "film") return null; // film slides are full-bleed
  if (s.kind === "festival" && (s.marquee || []).length) {
    // Fanned marquee of the premiere slate with the numeral over it.
    return (
      <div aria-hidden="true" style={{ position: "relative", width: "100%", maxWidth: 560, height: 300 }}>
        {s.marquee.map((f, i) => {
          const n = s.marquee.length;
          const rot = (i - (n - 1) / 2) * 6;
          const x = (i - (n - 1) / 2) * 84;
          return (
            <div key={f.id} style={{
              position: "absolute", left: "50%", top: "50%",
              width: 250, aspectRatio: "16/10", borderRadius: "var(--r-3)", overflow: "hidden",
              border: "1px solid var(--c-line-2)", background: f.color,
              boxShadow: "0 20px 44px rgba(0,0,0,.55)",
              transform: `translate(calc(-50% + ${x}px), -50%) rotate(${rot}deg)`,
              zIndex: i,
            }}>
              <FrameThumb kind={f.thumb} usePhoto />
              <span style={{ position: "absolute", inset: 0, background: "rgba(8,7,6,.35)" }}></span>
            </div>
          );
        })}
        <span className="t-display" style={{
          position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
          fontStyle: "italic", fontSize: "var(--fs-display)", lineHeight: 1, color:  "var(--c-amber)",
          textShadow: "0 6px 40px rgba(0,0,0,.8)", zIndex: 10, letterSpacing: "-0.02em",
        }}>VII</span>
      </div>
    );
  }
  if (s.kind === "rooms" && (s.rooms || []).length) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 500 }}>
        {s.rooms.map((r, ri) => {
          const f = (window.CATALOG || []).find(x => x.id === r.filmId);
          const drift = Math.round(Math.sin((tick + ri * 7) * 1.7) * 14) + ((tick + ri) % 3);
          return (
            <button key={r.id} onClick={() => navigate(`/branches/${r.filmId}`)} title={`Enter the ${(f && f.title) || r.title} room`} style={{
              appearance: "none", textAlign: "left", cursor: "pointer", width: "100%",
              display: "flex", alignItems: "center", gap: 12, padding: 8,
              background: "rgba(255,255,255,.04)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)",
              transition: "border-color .16s ease, transform .16s ease, background .16s ease",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(143,184,236,.55)"; e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.background = "rgba(143,184,236,.07)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--c-line-2)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.background = "rgba(255,255,255,.04)"; }}>
              <span style={{ position: "relative", width: 104, height: 60, borderRadius: "var(--r-2)", overflow: "hidden", background: (f && f.color) || tkc("line"), flexShrink: 0 }}>
                {f && <FrameThumb kind={f.thumb} usePhoto />}
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(8,7,6,.25)" }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(8,7,6,.72)", border: "1px solid rgba(255,255,255,.25)", color: tkc("white") }}><Icon name="play" size={8} /></span>
                </span>
              </span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span className="t-display" style={{ display: "block", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{(f && f.title) || r.title}</span>
                <span className="t-mono t-num" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" }}>{r.host ? r.host.toUpperCase() + " · " : ""}{Math.max(12, (r.viewers || 0) + drift).toLocaleString()} WATCHING</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 999, background: "rgba(194,80,80,.14)", border: "1px solid rgba(194,80,80,.4)", flexShrink: 0 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-blood-l)", boxShadow: "0 0 5px var(--c-blood-l)", animation: "pulse-dot 1.4s ease-in-out infinite" }}></span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-blood-l)", fontWeight: 700 }}>LIVE</span>
              </span>
            </button>
          );
        })}
        <button onClick={() => navigate("/rooms")} className="t-mono" style={{
          appearance: "none", alignSelf: "flex-end", marginTop: 2, cursor: "pointer",
          background: "transparent", border: "none", color: tkc("cat-1"),
          fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, padding: "4px 2px",
        }}>ALL ROOMS →</button>
      </div>
    );
  }
  // Sponsor — no plate; the slide is its own editorial spread (SponsorAd).
  return null;
}

// Sponsor slide — "through the lens": the still sits inside a big circular
// lens element (concentric rings, aperture blades, spec ticks) while the
// wordmark runs oversized behind it, half solid / half outlined. A sprocket
// film edge runs along the bottom. Clearly marked, nothing coy.
function SponsorAd({ s, isMobile }) {
  const sp = s.sponsor || {};
  const acc = s.accent;
  const specs = sp.specs || [(sp.tag || "PARTNER")];
  const lensSize = isMobile ? 210 : "min(340px, 30vw)";
  return (
    <div style={{ position: "relative", height: "100%", overflow: "hidden" }}>
      {/* Ghost wordmark — oversized, outlined, running off-canvas behind everything */}
      <span aria-hidden="true" className="t-display" style={{
        position: "absolute", right: isMobile ? -20 : "-2%", bottom: isMobile ? 44 : 18,
        fontStyle: "italic", fontWeight: 400, lineHeight: 0.8, letterSpacing: "-0.02em",
        fontSize: isMobile ? 130 : "clamp(180px, 24vw, 320px)", whiteSpace: "nowrap",
        color: "transparent", WebkitTextStroke: `1px color-mix(in oklab, ${acc} 34%, transparent)`,
        userSelect: "none", pointerEvents: "none",
      }}>{sp.name}</span>

      <div style={{
        position: "relative", height: "100%", display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1fr) auto",
        alignItems: "center", gap: isMobile ? 18 : "clamp(28px, 4vw, 70px)",
        padding: isMobile ? "24px 24px 46px" : "0 clamp(36px, 5vw, 84px) 26px",
      }}>
        {/* Copy column */}
        <div style={{ minWidth: 0, position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 11px", borderRadius: 999,
              background: `color-mix(in oklab, ${acc} 9%, transparent)`,
              border: `1px solid color-mix(in oklab, ${acc} 35%, transparent)`,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: acc, boxShadow: `0 0 8px ${acc}` }}></span>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", fontWeight: 700, letterSpacing: ".16em", color: acc }}>SPONSORED</span>
            </span>
          </div>
          {/* Split wordmark: solid name over its role, set like a lens barrel engraving */}
          <div className="t-display" style={{
            fontStyle: "italic", fontWeight: 400, color: "var(--c-ink)",
            fontSize: isMobile ? "clamp(46px, 12vw, 62px)" : "clamp(44px, 6vw, 96px)",
            lineHeight: 0.92, letterSpacing: "-0.02em", marginBottom: 12, textWrap: "balance", overflowWrap: "break-word",
          }}>{sp.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <span aria-hidden="true" style={{ width: 26, height: 1, background: acc }}></span>
            <span className="t-mono" style={{ fontSize: isMobile ? 8.5 : 10, fontWeight: 700, letterSpacing: ".16em", color: acc, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{(sp.tag || "PARTNER OF CINA").toUpperCase()}</span>
          </div>
          <p style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: isMobile ? 14.5 : 17.5, lineHeight: 1.5, color: "var(--c-ink-2)",
            margin: "0 0 24px", maxWidth: 400, textWrap: "pretty",
          }}>{sp.line}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <button className="btn" style={{ height: 44, padding: "0 22px", fontSize: "var(--fs-body)", gap: 9, borderColor: `color-mix(in oklab, ${acc} 55%, transparent)` }} onClick={s.go}>
              <span>{s.cta}</span>
              <span aria-hidden="true" style={{ color: acc }}>→</span>
            </button>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>AD · {(sp.name || "").toUpperCase()} · PARTNER OF CINA</span>
          </div>
        </div>

        {/* The lens — still masked in a circle, ringed by barrel + spec ticks */}
        <div aria-hidden="true" style={{ position: "relative", width: lensSize, aspectRatio: "1", justifySelf: isMobile ? "center" : "end", zIndex: 1, flexShrink: 0 }}>
          {/* outer barrel rings */}
          <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid color-mix(in oklab, ${acc} 40%, transparent)` }}></span>
          <span style={{ position: "absolute", inset: "4.5%", borderRadius: "50%", border: "1px dashed rgba(255,255,255,.14)" }}></span>
          <span style={{ position: "absolute", inset: "9%", borderRadius: "50%", border: `1px solid color-mix(in oklab, ${acc} 22%, transparent)` }}></span>
          {/* focus-distance tick marks around the barrel */}
          {Array.from({ length: 36 }).map((_, i) => (
            <span key={i} style={{
              position: "absolute", left: "50%", top: "50%",
              width: i % 9 === 0 ? 2 : 1, height: i % 3 === 0 ? 10 : 5,
              background: i % 9 === 0 ? acc : "rgba(255,255,255,.28)",
              transformOrigin: "center 0",
              transform: `rotate(${i * 10}deg) translateY(calc(${typeof lensSize === "number" ? lensSize / 2 + "px" : lensSize + " / 2"} * -0.955))`,
            }}></span>
          ))}
          {/* the glass — still through the lens */}
          <div style={{
            position: "absolute", inset: "14%", borderRadius: "50%", overflow: "hidden",
            border: `1.5px solid color-mix(in oklab, ${acc} 60%, transparent)`,
            boxShadow: `0 0 0 6px rgba(8,7,6,.6), 0 0 80px color-mix(in oklab, ${acc} 26%, transparent), inset 0 0 60px rgba(0,0,0,.65)`,
            background: tkc("panel"),
          }}>
            {s.texFilm && <FrameThumb kind={s.texFilm.thumb} usePhoto/>}
            <span style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 32% 28%, transparent 30%, rgba(8,7,6,.55) 85%), linear-gradient(150deg, color-mix(in oklab, ${acc} 22%, transparent), transparent 60%)`, mixBlendMode: "multiply" }}></span>
            {/* coating flare */}
            <span style={{ position: "absolute", left: "16%", top: "12%", width: "34%", height: "22%", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,255,255,.22), transparent 70%)", transform: "rotate(-24deg)" }}></span>
            {/* aperture blade hints in the corners of the glass */}
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)" }}></span>
            {/* crosshair */}
            <span style={{ position: "absolute", left: "50%", top: "50%", width: 16, height: 1, background: "rgba(255,255,255,.75)", transform: "translate(-50%,-50%)" }}></span>
            <span style={{ position: "absolute", left: "50%", top: "50%", width: 1, height: 16, background: "rgba(255,255,255,.75)", transform: "translate(-50%,-50%)" }}></span>
          </div>
          {/* engraved spec readout under the lens */}
          <div style={{ position: "absolute", left: "50%", bottom: isMobile ? -26 : -30, transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 9, whiteSpace: "nowrap" }}>
            {specs.map((sx, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ width: 3, height: 3, borderRadius: "50%", background: `color-mix(in oklab, ${acc} 70%, transparent)` }}></span>}
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", fontWeight: 700, letterSpacing: ".16em", color: "var(--c-ink-3)" }}>{sx}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Sprocket film edge along the bottom */}
      <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 22, display: "flex", alignItems: "center", gap: 14, padding: "0 18px", borderTop: "1px solid var(--c-line)", background: "rgba(8,7,6,.5)", overflow: "hidden" }}>
        {Array.from({ length: 60 }).map((_, i) => (
          <span key={i} style={{ width: 8, height: 10, borderRadius: "var(--r-1)", flexShrink: 0, background: i % 10 === 4 ? `color-mix(in oklab, ${acc} 55%, transparent)` : "rgba(255,255,255,.10)" }}></span>
        ))}
        <span className="t-mono" style={{ position: "absolute", right: 60, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", background: "rgba(8,7,6,.8)", padding: "2px 8px" }}>{sp.plateCaption || ((sp.name || "").toUpperCase() + " × CINA")}</span>
      </div>
    </div>
  );
}

function PromoSlideshow() {
  const isMobile = useIsMobile();
  const slides = umPR(promoSlides, []);
  const [idx, setIdx] = usPR(0);
  const [hover, setHover] = usPR(false);

  uePR(() => {
    if (hover || slides.length < 2) return;
    const t = setTimeout(() => setIdx(i => (i + 1) % slides.length), PROMO_DUR);
    return () => clearTimeout(t);
  }, [idx, hover, slides.length]);

  if (!slides.length) return null;
  const H = isMobile ? 470 : 440;

  return (
    <section
      aria-label="Featured tonight"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        margin: isMobile ? "26px 0" : "44px 0",
        padding: isMobile ? "20px 0 24px" : "28px 0 34px",
        background: "var(--c-void)",
        borderTop: "1px solid var(--c-line)",
        borderBottom: "1px solid var(--c-line)",
      }}>
      <style>{`@keyframes promoBarV1 { from { transform: scaleX(0) } to { transform: scaleX(1) } }`}</style>
      <div style={{ width: "90vw", margin: "0 auto" }}>
        {/* Masthead — label · rule · counter */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", fontWeight: 700, letterSpacing: ".16em", color: "var(--c-ink-3)" }}>FEATURED TONIGHT</span>
          <span style={{ flex: 1, height: 1, background: "var(--c-line)" }}></span>
          <span className="t-mono t-num" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>
            <span style={{ color: "var(--c-amber)", fontWeight: 700 }}>{String(idx + 1).padStart(2, "0")}</span> / {String(slides.length).padStart(2, "0")}
          </span>
        </div>
        <div style={{
          position: "relative", height: H,
          borderRadius: "var(--r-3)", overflow: "hidden",
          border: "1px solid var(--c-line-2)", background: "var(--c-panel)",
          boxShadow: "0 30px 80px rgba(0,0,0,.5)",
        }}>
        {slides.map((s, i) => {
          const active = i === idx;
          const isSponsor = s.kind === "sponsor";
          const isFilm = s.kind === "film";
          const isBranched = s.kind === "branched";
          const fullBleed = isFilm || isBranched;
          return (
            <div key={s.kind + i} aria-hidden={!active} style={{
              position: "absolute", inset: 0,
              opacity: active ? 1 : 0, transition: "opacity .9s ease",
              pointerEvents: active ? "auto" : "none",
            }}>
              {/* Backdrop */}
              {(isFilm || s.kind === "branched") ? (
                <>
                  <div style={{ position: "absolute", inset: 0, background: s.film.color }}>
                    <FrameThumb kind={s.film.thumb} usePhoto />
                  </div>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, color-mix(in oklab, var(--c-panel) 96%, transparent) 26%, color-mix(in oklab, var(--c-panel) 62%, transparent) 52%, transparent 78%)" }}></div>
                  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "40%", background: "linear-gradient(to top, color-mix(in oklab, var(--c-panel) 90%, transparent), transparent)" }}></div>
                </>
              ) : (
                <>
                  {isSponsor && s.texFilm && (
                    <div aria-hidden="true" style={{
                      position: "absolute", inset: 0, opacity: .32, filter: "saturate(.55)",
                      WebkitMaskImage: "radial-gradient(85% 110% at 50% 42%, transparent 30%, black 80%)",
                      maskImage: "radial-gradient(85% 110% at 50% 42%, transparent 30%, black 80%)",
                    }}>
                      <FrameThumb kind={s.texFilm.thumb} usePhoto />
                    </div>
                  )}
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 170% at 88% 12%, color-mix(in oklab, ${s.accent} ${isSponsor ? 15 : 13}%, transparent), transparent 55%)${isSponsor ? `, radial-gradient(100% 130% at 10% 92%, color-mix(in oklab, ${s.accent} 9%, transparent), transparent 58%)` : ""}, ${isSponsor ? "color-mix(in oklab, var(--c-panel) 76%, transparent)" : "var(--c-panel)"}` }}></div>
                </>
              )}

              {/* Content */}
              {isSponsor ? (
                <SponsorAd s={s} isMobile={isMobile}/>
              ) : (
              <div style={{
                position: "relative", height: "100%",
                display: "grid",
                gridTemplateColumns: isMobile || fullBleed || isSponsor ? "1fr" : "minmax(0,1.05fr) minmax(0,1fr)",
                alignItems: "center", gap: isMobile ? 0 : 44,
                padding: isMobile ? "28px 24px" : "0 clamp(32px, 4.5vw, 72px)",
                justifyItems: isSponsor ? "center" : "stretch",
                textAlign: isSponsor ? "center" : "left",
              }}>
                <div style={{ minWidth: 0, maxWidth: fullBleed ? 620 : isSponsor ? 640 : undefined }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap", justifyContent: isSponsor ? "center" : "flex-start" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 11px", borderRadius: 999,
                      background: `color-mix(in oklab, ${s.accent} 9%, transparent)`,
                      border: `1px solid color-mix(in oklab, ${s.accent} 35%, transparent)`,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.accent, boxShadow: `0 0 8px ${s.accent}`, animation: isBranched ? "pulse-dot 1.4s ease-in-out infinite" : "none" }}></span>
                      <span className="t-mono" style={{ fontSize: "var(--fs-label)", fontWeight: 700, letterSpacing: ".16em", color: s.accent }}>{s.kicker}</span>
                    </span>
                    {s.meta && <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" }}>{s.meta}</span>}
                  </div>
                  {isSponsor && <div aria-hidden="true" style={{ width: 54, height: 2, borderRadius: "var(--r-1)", background: `color-mix(in oklab, ${s.accent} 70%, transparent)`, margin: "0 auto 20px" }}></div>}
                  <div className="t-display" style={{
                    fontStyle: "italic", fontWeight: 400, color: "var(--c-ink)",
                    fontSize: isMobile ? "clamp(36px, 9.5vw, 48px)" : "clamp(44px, 4.4vw, 68px)",
                    lineHeight: 0.97, letterSpacing: "-0.02em", marginBottom: 16, textWrap: "balance",
                  }}>{s.title}{fullBleed ? "." : ""}</div>
                  <p style={{
                    fontFamily: "var(--f-display)", fontStyle: "italic",
                    fontSize: isMobile ? 14.5 : 17, lineHeight: 1.5, color: "var(--c-ink-2)",
                    margin: "0 0 24px", maxWidth: 470, textWrap: "pretty",
                    display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                    marginLeft: isSponsor ? "auto" : 0, marginRight: isSponsor ? "auto" : 0,
                  }}>{s.line}</p>

                  {/* Branched — fork diagram + stats row, straight off the room card */}
                  {isBranched && s.stats && (
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
                      {typeof BranchGlyph === "function" && <BranchGlyph accent="var(--c-blood-l)" lit={1} w={72} h={44} />}
                      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span className="t-display t-num" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", lineHeight: 1 }}>{s.stats.forks} forks</span>
                        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>{s.stats.cuts} POSSIBLE ENDINGS</span>
                      </span>
                      <span style={{ width: 1, height: 30, background: "var(--c-line-2)" }}></span>
                      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span className="t-display t-num" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", lineHeight: 1 }}>{s.stats.watching.toLocaleString()}</span>
                        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>IN THE ROOM NOW</span>
                      </span>
                      {s.stats.live && (
                        <span className="t-mono" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "var(--fs-label)", fontWeight: 700, letterSpacing: ".16em", color: tkc("white"), background: "rgba(194,80,80,.95)", padding: "4px 10px", borderRadius: 999 }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: tkc("white") }}></span> VOTE OPEN
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: isSponsor ? "center" : "flex-start" }}>
                    <button className={isSponsor ? "btn" : "btn btn-primary"} style={{ height: 44, padding: "0 22px", fontSize: "var(--fs-body)", gap: 9, ...(isBranched ? { background: "var(--c-blood-l)", borderColor: "var(--c-blood-l)", color: tkc("white") } : {}), ...(isSponsor ? { borderColor: `color-mix(in oklab, ${s.accent} 55%, transparent)` } : {}) }} onClick={s.go}>
                      {!isSponsor && <Icon name={s.kind === "rooms" ? "users" : "play"} size={12} />}
                      <span>{s.cta}</span>
                    </button>
                    {isSponsor && s.sponsor && s.sponsor.tag && (
                      <span className="t-mono" style={{ display: "block", width: "100%", marginTop: 14, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>AD · {s.sponsor.name.toUpperCase()} · PARTNER OF CINA</span>
                    )}
                    {fullBleed && (
                      <button className="btn" style={{ height: 44, padding: "0 16px", fontSize: "var(--fs-body)", gap: 6, background: "rgba(8,7,6,.4)", backdropFilter: "blur(6px)" }} onClick={() => toggleWatchlist(s.film.id)}>
                        <Icon name={isOnWatchlist && isOnWatchlist(s.film.id) ? "heart" : "plus"} size={12} />
                        {isOnWatchlist && isOnWatchlist(s.film.id) ? "On list" : "Add to list"}
                      </button>
                    )}
                  </div>
                </div>

                {!isMobile && !fullBleed && !isSponsor && (
                  <div style={{ minWidth: 0, display: "flex", justifyContent: "flex-end" }}>
                    <PromoVisual s={s} />
                  </div>
                )}
              </div>
              )}
            </div>
          );
        })}

        {/* Rail: dots with inline progress, tucked inside the frame */}
        <div style={{ position: "absolute", right: 20, bottom: 16, display: "flex", alignItems: "center", gap: 7, zIndex: 5 }}>
          {slides.map((s, i) => (
            <button key={i} onClick={() => setIdx(i)} aria-label={`Slide ${i + 1}`} style={{
              position: "relative", width: i === idx ? 30 : 8, height: 8, borderRadius: 999,
              border: "none", cursor: "pointer", padding: 0, overflow: "hidden",
              background: "rgba(255,255,255,.18)", transition: "width .35s cubic-bezier(.22,1,.36,1)",
            }}>
              {i === idx && (
                <span key={idx} style={{
                  position: "absolute", inset: 0, background:  "var(--c-amber)",
                  transformOrigin: "left", animation: `promoBarV1 ${PROMO_DUR}ms linear both`,
                  animationPlayState: hover ? "paused" : "running",
                }}></span>
              )}
            </button>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { PromoSlideshow });
