// series-episodes.jsx — Episodes board. Only mounts for kind === "series".
// One bible, many entries: the season laid out as a shooting schedule.

const { useState: useStateEP } = React;

const EP_THUMBS = ["darkroom-est", "darkroom-wide", "voss-enter", "developer", "the-photo", "phone", "timestamp", "dawn"];

function buildEpisodes(film) {
  const total = film?.episodes || 8;
  const done  = film?.epDone   || 0;
  // Episode spine for THE LONG HALL (slow horror). Falls back gracefully.
  const seed = [
    { title: "The Tenant",        log: "A new resident moves into 4C. The hallway is one door longer than the blueprint." },
    { title: "Quiet Hours",       log: "Maintenance logs a noise complaint from a unit that was never rented." },
    { title: "The Long Hall",     log: "Mara paces the corridor at 3 a.m. and counts the doors twice. The numbers disagree." },
    { title: "Vacancy",           log: "A move-out that no one witnessed. The keys are still warm." },
    { title: "Sublet",            log: "Someone is living in the walls' worth of space between 4C and 4D." },
    { title: "Notice to Vacate",  log: "The landlord stops answering. The rent keeps clearing." },
    { title: "Showings",          log: "A prospective tenant tours a floor that the building doesn't have." },
    { title: "Final Walkthrough", log: "Mara reaches the end of the hall. The end of the hall reaches back." },
  ];
  return Array.from({ length: total }, (_, i) => {
    const s = seed[i % seed.length];
    let status, pct;
    if (i < done)            { status = "locked";  pct = 100; }
    else if (i === done)     { status = "cutting"; pct = 54; }
    else if (i === done + 1) { status = "boarding"; pct = 28; }
    else if (i === done + 2) { status = "writing";  pct = 12; }
    else                     { status = "outline";  pct = 4;  }
    return {
      n: i + 1, title: s.title, log: s.log,
      status, pct,
      runtime: ["~22m", "~24m", "~26m", "~23m", "~25m", "~24m", "~27m", "~31m"][i % 8],
      thumb: EP_THUMBS[i % EP_THUMBS.length],
    };
  });
}

const EP_STATUS = {
  locked:   { label: "LOCKED",   color: "var(--c-good)" },
  cutting:  { label: "CUTTING",  color: "var(--c-amber)" },
  boarding: { label: "BOARDING", color: "var(--c-amber-d)" },
  writing:  { label: "WRITING",  color: "var(--c-ink-2)" },
  outline:  { label: "OUTLINE",  color: "var(--c-ink-4)" },
};

function EpisodesPanel() {
  const film = (window.cinaActiveFilm && window.cinaActiveFilm())
            || (window.PROJECTS || []).find(p => p.kind === "series")
            || (window.PROJECTS || [])[0];
  const [eps] = useStateEP(() => buildEpisodes(film));
  const [active, setActive] = useStateEP(film?.epDone || 0);

  const total = eps.length;
  const done = eps.filter(e => e.status === "locked").length;
  const seasonPct = Math.round(eps.reduce((a, e) => a + e.pct, 0) / total);

  const go = (view) => window.dispatchEvent(new CustomEvent("cina:setView", { detail: view }));

  return (
    <div style={{ position: "absolute", inset: 0, paddingTop: 0, overflowY: "auto" }}>
      <div style={{ maxWidth: "var(--w-mid)", margin: "0 auto", padding: "28px 40px 80px" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          gap: 24, paddingBottom: 18, marginBottom: 26,
          borderBottom: "1px solid var(--c-line)",
        }}>
          <div>
            <div className="t-mono" style={{
              fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em",
              textTransform: "uppercase", fontWeight: 700, marginBottom: 10,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <SeriesGlyph size={13}/> Series workflow · Season {film?.season || 1}
            </div>
            <h1 className="t-display" style={{
              margin: 0, fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400,
              letterSpacing: "-0.02em", color: "var(--c-ink)", lineHeight: 1,
            }}>The season.</h1>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 10 }}>
              {total} episodes · <span style={{ color: "var(--c-good)" }}>{done} locked</span> ·
              {" "}{film?.cadence || "weekly"} cadence · one bible, carried across every entry.
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={() => go("bible")} style={{ height: 36, padding: "0 14px" }}>
              <Icon name="grid" size={11}/> Open bible
            </button>
            <button className="btn btn-primary" style={{ height: 36, padding: "0 16px" }} onClick={() => window.cinaNotYet && window.cinaNotYet("Adding an episode", "New episodes are created from the slate, not here — open the project and add a cut.")}>
              <Icon name="plus" size={12}/> Add episode </button>
          </div>
        </div>

        {/* Season progress strip */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
          marginBottom: 30,
        }}>
          {[
            { label: "Season progress", value: `${seasonPct}%` },
            { label: "Locked",          value: `${done} / ${total}` },
            { label: "In the room",     value: String(total - done) },
            { label: "Next release",    value: film?.epReleased ? "Ep " + (film.epReleased + 1) : "Premiere" },
          ].map((s, i) => (
            <div key={s.label} style={{
              padding: "4px 0 4px 0", paddingLeft: i === 0 ? 0 : 24,
              borderLeft: i === 0 ? "none" : "1px solid var(--c-line)",
            }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 10 }}>{s.label}</div>
              <div className="t-display t-num" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, color: "var(--c-ink)", lineHeight: 1, letterSpacing: "-0.02em" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Episode list */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {eps.map((e, i) => {
            const st = EP_STATUS[e.status];
            const isActive = i === active;
            return (
              <div key={e.n}
                onClick={() => setActive(i)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "54px 96px 1.6fr 150px 130px",
                  gap: 20, alignItems: "center",
                  padding: "16px 14px 16px 6px",
                  borderTop: i === 0 ? "1px solid var(--c-line)" : "none",
                  borderBottom: "1px solid var(--c-line)",
                  cursor: "pointer",
                  background: isActive ? "var(--c-panel)" : "transparent",
                  transition: "background .14s ease",
                }}
                onMouseEnter={e2 => { if (!isActive) e2.currentTarget.style.background = "var(--c-panel-2)"; }}
                onMouseLeave={e2 => { if (!isActive) e2.currentTarget.style.background = "transparent"; }}
              >
                {/* Ep number */}
                <div className="t-display t-num" style={{
                  fontStyle: "italic", fontSize: "var(--fs-head)", lineHeight: 1,
                  color: isActive ? "var(--c-amber)" : "var(--c-ink-3)",
                  letterSpacing: "-0.02em",
                }}>{String(e.n).padStart(2, "0")}</div>

                {/* Thumb */}
                <div style={{ width: 96, height: 54, borderRadius: "var(--r-1)", overflow: "hidden", position: "relative", background: tkc("bg") }}>
                  <FrameThumb kind={e.thumb} usePhoto/>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,.4))" }}/>
                </div>

                {/* Title + logline */}
                <div style={{ minWidth: 0 }}>
                  <div className="t-display" style={{
                    fontStyle: "italic", fontSize: "var(--fs-lead)", letterSpacing: "-0.01em",
                    color: isActive ? "var(--c-amber)" : "var(--c-ink)", lineHeight: 1.15,
                  }}>{e.title}</div>
                  <div style={{
                    fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 3, lineHeight: 1.45,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{e.log}</div>
                </div>

                {/* Status + progress */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: st.color }}>{st.label}</span>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{e.pct}%</span>
                  </div>
                  <div style={{ height: 2, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                    <div style={{ width: `${e.pct}%`, height: "100%", background: e.status === "locked" ? "var(--c-good)" : "var(--c-amber)" }}/>
                  </div>
                </div>

                {/* Runtime + action */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 14 }}>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{e.runtime}</span>
                  <button
                    onClick={(ev) => { ev.stopPropagation(); go(e.status === "outline" || e.status === "writing" ? "script" : e.status === "boarding" ? "board" : "editor"); }}
                    className="t-mono"
                    style={{
                      background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
                      color: "var(--c-amber)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                      padding: "6px 10px", cursor: "pointer",
                    }}
                    onMouseEnter={ev => ev.currentTarget.style.borderColor = "var(--c-amber)"}
                    onMouseLeave={ev => ev.currentTarget.style.borderColor = "var(--c-line-2)"}
                  >OPEN →</button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 20, fontSize: "var(--fs-body)", color: "var(--c-ink-4)", fontFamily: "var(--f-display)", fontStyle: "italic" }}>
          Lock an episode to ship it on cadence. The bible, palette and cast carry forward automatically.
        </div>
      </div>
    </div>
  );
}

function SeriesGlyph({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3">
      <rect x="5"  y="8"  width="16" height="13" rx="2"/>
      <rect x="27" y="8"  width="16" height="13" rx="2"/>
      <rect x="5"  y="27" width="16" height="13" rx="2"/>
      <rect x="27" y="27" width="16" height="13" rx="2"/>
    </svg>
  );
}

Object.assign(window, { EpisodesPanel });
