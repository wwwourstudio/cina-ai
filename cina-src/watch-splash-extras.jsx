// watch-splash-extras.jsx — engagement layer on top of the home splash.
// Pulse ribbon · Mood chips · Tonight card · Top 10 · Director's note.

const { useState: ussX, useEffect: uesX, useMemo: umsX, useRef: ursX } = React;

// ─── Live pulse ribbon ───────────────────────────────────────────────────
// Compact, always-on live stat strip directly under the hero. Each metric
// pulses on its own cadence so the page feels alive without animations
// dragging the eye away from content.
function PulseRibbon() {
  const [tick, setTick] = ussX(0);
  uesX(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1700);
    return () => clearInterval(t);
  }, []);

  // Find next scheduled drop across the catalog
  const nextDrop = umsX(() => {
    const all = (window.CATALOG || []).flatMap((f) =>
    (f.series || []).
    filter((e) => e.status === "scheduled").
    map((e) => ({ film: f, ep: e, iso: e.drop + "T19:00:00" }))
    );
    return all.sort((a, b) => new Date(a.iso) - new Date(b.iso))[0];
  }, []);
  const t = nextDrop ? timeUntilFromNow(nextDrop.iso) : null;

  const isMobile = useIsMobile();
  const baseWatching = 12847;
  const watching = baseWatching + tick * 31 % 117 - 50;
  const invested = 84320 + tick * 13 % 220;

  const stats = [
  {
    kind: "live",
    label: "WATCHING NOW",
    value: watching.toLocaleString(),
    onClick: null
  },
  {
    kind: "rooms",
    label: "HOLDER ROOMS LIVE",
    value: "3",
    sub: "1,284 listening",
    onClick: () => navigate("/rooms")
  },
  {
    kind: "invest",
    label: "INVESTED TODAY",
    value: "$" + (invested / 1000).toFixed(1) + "K",
    sub: "across 6 projects",
    onClick: () => navigate("/producers")
  },
  {
    kind: "drop",
    label: "NEXT PREMIERE",
    value: t ? t.label : "—",
    sub: nextDrop ? `${nextDrop.film.title} · ${nextDrop.ep.title || "Ep " + nextDrop.ep.ep}` : "",
    onClick: nextDrop ? () => navigate(nextDrop.film.kind === "series" ? `/series/${nextDrop.film.id}` : `/film/${nextDrop.film.id}`) : null,
    urgent: t?.urgent
  }];

  return (
    <section style={{ padding: isMobile ? "18px 20px" : "22px var(--gutter)", background: "var(--c-bg)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 8px var(--c-good)", animation: "pulse-dot 1.6s ease-in-out infinite" }} />
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-2)", fontWeight: 600 }}>LIVE ACROSS CINA RIGHT NOW</span>
        <span style={{ flex: 1, height: 1, background: "var(--c-line)" }} />
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>UPDATED LIVE</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
        {stats.map((s) => {
          const meta = {
            live: { icon: "play", accent: "var(--c-good)" },
            rooms: { icon: "globe", accent: "var(--c-good)" },
            invest: { icon: "ticket", accent: tkc("amber") },
            drop: { icon: "bell", accent: "var(--c-blood-l)" }
          }[s.kind] || { icon: "play", accent: tkc("amber") };
          const accent = s.urgent ? "var(--c-blood-l)" : meta.accent;
          return (
            <button
              key={s.kind}
              onClick={s.onClick}
              disabled={!s.onClick}
              style={{
                appearance: "none", textAlign: "left", cursor: s.onClick ? "pointer" : "default",
                borderRadius: "var(--r-3)", border: "1px solid var(--c-line)",
                background: "linear-gradient(165deg, var(--c-panel) 0%, var(--c-panel-2) 100%)",
                padding: "15px 17px", display: "flex", flexDirection: "column", gap: 9,
                transition: "border-color .15s ease, transform .15s ease"
              }}
              onMouseEnter={(e) => {if (!s.onClick) return;e.currentTarget.style.borderColor = "var(--c-line-3)";e.currentTarget.style.transform = "translateY(-2px)";}}
              onMouseLeave={(e) => {e.currentTarget.style.borderColor = "var(--c-line)";e.currentTarget.style.transform = "none";}}>
              
              <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                <span style={{
                  width: 28, height: 28, borderRadius: "var(--r-2)", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: `color-mix(in oklch, ${accent} 16%, transparent)`, color: accent
                }}><Icon name={meta.icon} size={13} /></span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", lineHeight: 1.3 }}>{s.label}</span>
                <span style={{ flex: 1 }} />
                {s.onClick && <Icon name="chev-r" size={11} className="" />}
              </div>
              <div className="t-num" style={{
                fontSize: "var(--fs-title)", fontWeight: 600, lineHeight: 1,
                color: s.urgent ? "var(--c-blood-l)" : s.kind === "invest" ? "var(--c-amber)" : "var(--c-ink)",
                letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums"
              }}>{s.value}</div>
              {s.sub &&
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{s.sub}</div>
              }
            </button>);

        })}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .4; transform: scale(.8); }
        }
      ` }} />
    </section>);

}

// ─── Mood chips ──────────────────────────────────────────────────────────
// Editorial vibe filter: "I want to feel ___". Each chip shows a curated
// mood with a sample film title underneath. Clicking jumps to a filtered shelf.
function MoodChips() {
  const moods = [
  { id: "dread", label: "Dread", glyph: "—", sample: "Carrion · Mire", color: tkc("blood"), to: "/genre/horror" },
  { id: "awe", label: "Awe", glyph: "○", sample: "Drift · Frequency 88.6", color: tkc("cat-6"), to: "/genre/scifi" },
  { id: "tender", label: "Tender", glyph: "·", sample: "Pearl & Me · Salt Year", color: tkc("amber-d"), to: "/genre/drama" },
  { id: "pulpy", label: "Pulpy", glyph: "/", sample: "Verge · Haul", color: tkc("cat-5"), to: "/genre/crime" },
  { id: "unsettled", label: "Unsettled", glyph: "~", sample: "Last Light · Cellar Door", color: tkc("ink-4"), to: "/genre/thriller" },
  { id: "grand", label: "Grand", glyph: "△", sample: "The Fence · The Swallows", color: tkc("cat-3"), to: "/genre/film" },
  { id: "alive", label: "Alive", glyph: "✦", sample: "Cardinal Rules", color: tkc("cat-5"), to: "/genre/comedy" },
  { id: "free", label: "On me", glyph: "◌", sample: "Free with ads", color: tkc("cat-5"), to: "/shelf/free" }];

  return (
    <section style={{ padding: "26px var(--gutter) 44px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
        <h2 className="t-display" style={{
          fontStyle: "italic", fontSize: "var(--fs-title)", margin: 0,
          letterSpacing: "-0.01em", color: "var(--c-ink)"
        }}>Watch by mood</h2>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
          EIGHT FEELINGS · ONE TAP TO THE SHELF
        </span>
      </div>
      <CarouselRail fade="var(--c-bg)" gap={12} padY={8} arrowOffset={-8}>
        {moods.map((m) =>
        <button
          key={m.id}
          onClick={() => navigate(m.to)}
          className="btn-ghost"
          style={{
            flex: "0 0 auto",
            minWidth: 168, height: "auto",
            padding: "16px 18px",
            background: "var(--c-panel-2)",
            border: "1px solid var(--c-line)",
            borderRadius: "var(--r-2)",
            display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6,
            textAlign: "left",
            transition: "all .2s ease",
            position: "relative", overflow: "hidden"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = m.color;
            e.currentTarget.style.background = "var(--c-panel-3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--c-line)";
            e.currentTarget.style.background = "var(--c-panel-2)";
          }}>
          
            <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0, width: 4,
            background: m.color
          }} />
            <div className="t-display" style={{
            fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", lineHeight: 1, letterSpacing: "-0.01em"
          }}>{m.label}</div>
            <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", lineHeight: 1.3 }}>{m.sample}</div>
          </button>
        )}
      </CarouselRail>
    </section>);

}

// ─── Top 10 Today ────────────────────────────────────────────────────────
// Big editorial numerals behind the tile, classic Netflix top-10 trope but
// done in italic display type with our color palette.
function Top10Today() {
  const isMobile = useIsMobile();
  const ranked = umsX(() => {
    const seen = new Set();
    return [...(window.CATALOG || [])].
    sort((a, b) => (b.views || 0) - (a.views || 0)).
    filter((f) => {if (seen.has(f.title)) return false;seen.add(f.title);return true;}).
    slice(0, 10);
  }, []);

  const ref = ursX(null);
  const scroll = (dir) => {
    const el = ref.current;if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.7), behavior: "smooth" });
  };

  return (
    <section style={{ padding: isMobile ? "30px 20px 8px" : "40px var(--gutter) 12px", position: "relative", margin: "0px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
        <h2 className="t-display" style={{
          fontStyle: "italic", fontSize: isMobile ? 26 : 34, margin: 0,
          letterSpacing: "-0.02em", color: "var(--c-ink)"
        }}>Top 10 today</h2>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", whiteSpace: "nowrap" }}>
          UPDATED HOURLY · BY VIEWS
        </span>
      </div>

      <CarouselRail fade="var(--c-bg)" gap={18} padY={16} arrowOffset={-8}>
          {ranked.map((film, i) =>
          <div
            key={film.id}
            style={{
              flex: "0 0 auto",
              // Numeral + vertical poster sit side by side in normal flow.
              display: "flex", alignItems: "flex-end", gap: 4,
              scrollSnapAlign: "start"
            }}>
            
              {/* Giant rank numeral — bottom-aligned to the poster edge */}
              <div aria-hidden="true" style={{
              fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 500,
              fontSize: isMobile ? (i === 9 ? 92 : 110) : (i === 9 ? 150 : 178),
              color: "transparent",
              WebkitTextStroke: (isMobile ? "1.5px " : "2px ") + "var(--c-line-3)",
              lineHeight: 0.7, letterSpacing: "-0.02em",
              pointerEvents: "none", userSelect: "none", flexShrink: 0,
              marginBottom: isMobile ? 26 : 40, marginRight: i === 0 ? 4 : -14
            }}>{i + 1}</div>

              <FilmCard film={film} portrait size={isMobile ? "sm" : "lg"} />
            </div>
          )}
      </CarouselRail>
    </section>);

}

// ─── Live holder rooms preview ───────────────────────────────────────────
// Compact horizontal strip of live rooms with mini-avatar stack of listeners.
function LiveRoomsStrip() {
  const rooms = umsX(() => {
    const c = (window.CATALOG || []).slice(0, 4);
    return c.map((f, i) => ({
      id: f.id,
      film: f,
      title: ["Director Q&A", "Premiere watch-along", "Investor AMA", "Cast hangout"][i % 4],
      host: f.creator,
      listeners: 84 - i * 14,
      speaking: 4 - i,
      live: i < 3
    })).filter((r) => r.live);
  }, []);

  if (!rooms.length) return null;

  return (
    <section style={{ padding: "10px var(--gutter) 24px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
        <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", margin: 0, letterSpacing: "-0.01em" }}>
          Holder rooms in session
        </h2>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".16em" }}>
          ● {rooms.length} HOLDER ROOMS IN SESSION
        </span>
        <span style={{ flex: 1 }} />
        <button
          className="btn-ghost"
          style={{ height: 24, padding: "0 10px", fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }}
          onClick={() => navigate("/rooms")}>
          Browse rooms <Icon name="chev-r" size={10} /></button>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 16
      }}>
        {rooms.map((room) => {
          const colors = [tkc("cat-4"), tkc("cat-1"), tkc("bad"), tkc("cat-2"), "var(--c-amber)"];
          return (
            <button
              key={room.id}
              onClick={() => navigate("/rooms")}
              style={{
                position: "relative", padding: 0, height: 248, cursor: "pointer",
                border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden",
                textAlign: "left", color: "inherit", background: room.film.color || tkc("panel"),
                display: "flex", flexDirection: "column", justifyContent: "flex-end",
                transition: "border-color .2s ease, transform .2s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--c-good)"; e.currentTarget.style.transform = "translateY(-3px)"; const im = e.currentTarget.querySelector("[data-rm-img]"); if (im) im.style.transform = "scale(1.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--c-line)"; e.currentTarget.style.transform = "none"; const im = e.currentTarget.querySelector("[data-rm-img]"); if (im) im.style.transform = "none"; }}>

              {/* Background film still */}
              <span data-rm-img style={{ position: "absolute", inset: 0, transition: "transform .6s cubic-bezier(.2,.7,.2,1)" }}>
                <FrameThumb kind={room.film.thumb} usePhoto/>
              </span>
              <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,8,10,.55) 0%, rgba(8,8,10,.2) 30%, rgba(8,8,10,.88) 78%, rgba(8,8,10,.96) 100%)" }}/>

              {/* Top row: LIVE + listening with live audio bars */}
              <span style={{ position: "absolute", top: 13, left: 13, right: 13, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 9px", background: "rgba(8,8,10,.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(155,201,122,.5)", borderRadius: 999 }}>
                  <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 1.5, height: 9 }}>
                    {[0,1,2].map((k) => <span key={k} style={{ width: 2, borderRadius: "var(--r-1)", background: "var(--c-good)", height: "100%", animation: `rmEq 0.9s ${k * 0.18}s ease-in-out infinite alternate` }}/>)}
                  </span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--c-good)", letterSpacing: ".16em" }}>LIVE</span>
                </span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.82)", letterSpacing: ".16em", textShadow: "0 1px 4px rgba(0,0,0,.6)" }}>{room.listeners} LISTENING</span>
                <span style={{ flex: 1 }}/>
                {window.RoomMatchBadge && <RoomMatchBadge filmId={room.film.id}/>}
              </span>

              {/* Body */}
              <span style={{ position: "relative", padding: "16px 16px 15px", display: "flex", flexDirection: "column", gap: 9 }}>
                <span>
                  <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 4 }}>{room.film.title.toUpperCase()}</span>
                  <span className="t-display" style={{ display: "block", fontStyle: "italic", fontSize: "var(--fs-title)", color: tkc("white"), letterSpacing: "-0.01em", lineHeight: 1.12, textShadow: "0 2px 12px rgba(0,0,0,.6)" }}>{room.title}</span>
                </span>
                <span style={{ fontSize: "var(--fs-body)", color: "rgba(255,255,255,.72)" }}>Hosted by <span style={{ color: tkc("white"), fontWeight: 500 }}>{room.host}</span></span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                  <span style={{ display: "flex" }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <span key={j} style={{ width: 24, height: 24, borderRadius: "50%", background: colors[j % colors.length], border: "2px solid rgba(8,8,10,.85)", marginLeft: j === 0 ? 0 : -8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--c-on-amber)" }}>{String.fromCharCode(65 + (j * 5 + room.listeners) % 26)}</span>
                    ))}
                  </span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.6)", letterSpacing: ".16em" }}>+{room.listeners - 5} OTHERS</span>
                  <span style={{ flex: 1 }}/>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 999, background: "var(--c-good)", color: tkc("panel"), fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700, letterSpacing: ".16em" }}>
                    <Icon name="play" size={9}/> JOIN
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>);

}

Object.assign(window, { PulseRibbon, MoodChips, Top10Today, LiveRoomsStrip });