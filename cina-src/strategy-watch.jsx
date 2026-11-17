// strategy-watch.jsx — Strategy Move 03 (Branched Cinema) + Move 07 (The Festival)
// Loaded after watch-splash, before watch-app.

const { useState: usSW, useEffect: ueSW, useMemo: umSW, useRef: urSW } = React;

// ─── Festival data ─────────────────────────────────────────────────────
// Monthly drops — 12 curated premieres, first Friday of every month.
// We synthesise from CATALOG plus invented festival-only entries.

const FESTIVAL_EDITION = {
  number: 7, // edition number
  name: "Cina Festival · Vol VII",
  tagline: "Twelve premieres. One night. Holder-only afterparty.",
  date: "2026-06-19T19:00:00", // third Friday June
  doors: "2026-06-19T18:30:00",
  curator: "Selected by ELIAS VOSS · LIN HARA · MIRA ASIM",
  pass: { regular: 12, holder: 0, frontRow: 49 }, // ticket prices
  lineupIds: ["ll", "frequency", "swallows", "marauder", "patina", "the-good-thief", "kinder-stunden", "ghost-frequencies"],
  // Three guest curators — each picks 4 of the 12
  curators: [
  { initials: "EV", name: "Elias Voss", role: "Director · Bluejay", pick: "Slow cinema that doesn’t apologize for itself.", color: "var(--c-amber)" },
  { initials: "LH", name: "Lin Hara", role: "Director · Haul", pick: "Crime films where nobody gets what they deserve.", color: tkc("bad") },
  { initials: "MA", name: "Mira Asim", role: "DP · Cannes ’24", pick: "Documentaries that refuse to look away.", color: tkc("cat-1") }],

  // Concrete minute-by-minute run-of-show, all in Pacific
  runOfShow: [
  { t: "6:30 PM", phase: "DOORS", label: "Front-row check-in", sub: "Live stage feed opens. Q&A queue opens.", dur: 30, color: tkc("ink-3") },
  { t: "7:00 PM", phase: "PROGRAM", label: "Twelve premieres", sub: "4h 12m total · in running order, no intermissions skipped.", dur: 252, color: "var(--c-amber)" },
  { t: "9:15 PM", phase: "VOTE", label: "Audience pick", sub: "Three minutes to settle the audience prize.", dur: 3, color: tkc("cat-2") },
  { t: "9:30 PM", phase: "AFTERPARTY", label: "Holder voice rooms", sub: "One room per director. Secondary market unlocks.", dur: 90, color: tkc("bad") },
  { t: "11:00 PM", phase: "DROP", label: "Watch unlocks for all", sub: "All 12 premieres roll into the catalog at midnight.", dur: 0, color: tkc("good") }],

  whatItIs: [
  { n: "01", h: "Curated, not algorithmic.", b: "Three guest curators each pick four films. Every release is debut — the first time anyone sees them." },
  { n: "02", h: "Live, then forever.", b: "Watch live with everyone else, or stream the same program on demand for 24 hours. After that it joins the catalog." },
  { n: "03", h: "The room is the show.", b: "Holders walk into voice rooms with the directors. Audience prize is voted between the last film and the afterparty." }]

};

const PAST_FESTIVALS = [
{ number: 6, date: "2026-05-01", attended: 18420, drops: 12, sales: 1840000, headline: "PATINA wins audience pick" },
{ number: 5, date: "2026-04-03", attended: 14310, drops: 11, sales: 1280000, headline: "First sold-out front row" },
{ number: 4, date: "2026-03-06", attended: 11200, drops: 10, sales: 890000, headline: "Inaugural director's slot" }];

// Festival-original entries that aren't in CATALOG — referenced as cards
const FESTIVAL_ONLY = [
{ id: "fest-08", title: "Cassis", creator: "Saul Ndiaye", runtime: "12m short", cover: tkc("line-3"), thumb: "voss-eye", logline: "A widow runs a bar that sells exactly one drink. The man who orders it tonight has been dead for nine years.", kind: "short" },
{ id: "fest-09", title: "Hollow Bell", creator: "Anaïs Vorono", runtime: "9m short", cover: tkc("cat-6"), thumb: "phone", logline: "On the loneliest mountain in Switzerland, the village bell rings without a hand on the rope.", kind: "short" },
{ id: "fest-10", title: "Two Roads", creator: "TAYLOR FUSS · interactive", runtime: "branched", cover: tkc("blood"), thumb: "the-photo", logline: "A noir told from the perspective of two cops. You vote on which one survives.", kind: "branched", branched: true },
{ id: "fest-11", title: "What She Saved", creator: "Quill Marlow", runtime: "16m doc", cover: tkc("cat-6"), thumb: "darkroom-est", logline: "A digital archivist preserves the last decade of vanished public webcams.", kind: "doc" }];

function getFestivalFilm(id) {
  if (typeof CATALOG !== "undefined") {
    const f = CATALOG.find((c) => c.id === id);
    if (f) return f;
  }
  return FESTIVAL_ONLY.find((c) => c.id === id);
}

// ─── Countdown hook ────────────────────────────────────────────────────
function useCountdown(iso) {
  const [now, setNow] = usSW(Date.now());
  ueSW(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const target = new Date(iso).getTime();
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff % 86400000 / 3600000);
  const m = Math.floor(diff % 3600000 / 60000);
  const s = Math.floor(diff % 60000 / 1000);
  return { d, h, m, s, live: diff === 0 };
}

// ─── Festival page ─────────────────────────────────────────────────────// ─── Festival redesign — helpers ────────────────────────────────────────
// Image-free hero: a typographic marquee of the lineup replaces the old
// drifting cover-still parallax. All festival wiring is preserved.
(function _festInjectCSS() {
  if (typeof document === "undefined" || document.getElementById("fest-redesign-css")) return;
  const el = document.createElement("style");
  el.id = "fest-redesign-css";
  el.textContent =
  "@keyframes festMarqueeX{from{transform:translateX(0)}to{transform:translateX(-50%)}}" +
  ".fest-marquee{display:flex;width:max-content;animation:festMarqueeX 65s linear infinite}" +
  "@keyframes festPulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.25)}}" +
  ".fest-livedot{animation:festPulse 1.7s ease-in-out infinite}" +
  ".fest-tile .fest-tile-img{transition:transform .6s cubic-bezier(.2,.7,.2,1),filter .45s ease;filter:saturate(.9) brightness(.82)}" +
  ".fest-tile:hover .fest-tile-img{transform:scale(1.05);filter:saturate(1) brightness(.92)}" +
  ".fest-tile{transition:border-color .2s ease,background .2s ease}" +
  ".fest-tile:hover{border-color:var(--c-line-3)!important;background:var(--c-panel-2)!important}" +
  ".fest-cta:hover{transform:translateY(-1px)}" +
  ".fest-cta{transition:transform .12s ease}" +
  "@media (prefers-reduced-motion: reduce){.fest-marquee{animation:none}.fest-livedot{animation:none}}";
  document.head.appendChild(el);
})();

function FestMarquee({ titles }) {
  if (!titles || !titles.length) return null;
  const row =
  <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
      {titles.map((t, i) =>
    <span key={i} style={{ display: "inline-flex", alignItems: "center", paddingRight: 30 }}>
          <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink-3)", whiteSpace: "nowrap" }}>{t}</span>
          <span style={{ width: 5, height: 5, marginLeft: 30, transform: "rotate(45deg)", background: "var(--c-amber)", opacity: 0.55, flexShrink: 0 }} />
        </span>
    )}
    </div>;

  return (
    <div aria-hidden="true" style={{
      overflow: "hidden", borderTop: "1px solid var(--c-line)",
      padding: "13px 0", background: "rgba(0,0,0,0.22)",
      maskImage: `linear-gradient(90deg, transparent, ${tkc("black")} 5%, ${tkc("black")} 95%, transparent)`,
      WebkitMaskImage: `linear-gradient(90deg, transparent, ${tkc("black")} 5%, ${tkc("black")} 95%, transparent)`
    }}>
      <div className="fest-marquee">{row}{row}</div>
    </div>);

}

function FestCountdown({ cd, size = 64 }) {
  const units = [{ v: cd.d, l: "DAYS" }, { v: cd.h, l: "HRS" }, { v: cd.m, l: "MIN" }, { v: cd.s, l: "SEC" }];
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "clamp(6px, 2vw, 18px)" }}>
      {units.map((u, i) =>
      <React.Fragment key={i}>
          <div style={{ textAlign: "center", minWidth: `min(${size * 0.84}px, 15vw)` }}>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: `min(${size}px, 13vw)`, lineHeight: 0.82, color: i === 0 ? "var(--c-amber)" : "var(--c-ink)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
              {String(u.v).padStart(2, "0")}
            </div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 11 }}>{u.l}</div>
          </div>
          {i < units.length - 1 &&
        <div className="t-display" style={{ fontStyle: "italic", fontSize: `min(${size * 0.6}px, 8vw)`, lineHeight: 1, color: "var(--c-line-3)" }}>:</div>
        }
        </React.Fragment>
      )}
    </div>);

}

function FestHead({ kicker, title, sub, kickerColor, right }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 28, flexWrap: "wrap" }}>
      <div style={{ minWidth: 0 }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: kickerColor || tkc("amber"), letterSpacing: ".16em", fontWeight: 700, marginBottom: 14 }}>{kicker}</div>
        <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "clamp(30px, 4vw, 46px)", margin: 0, fontWeight: 400, letterSpacing: "-0.02em", color: "var(--c-ink)", lineHeight: 1 }}>{title}</h2>
        {sub && <div style={{ color: "var(--c-ink-3)", marginTop: 13, maxWidth: 580, lineHeight: 1.55, fontSize: "12px" }}>{sub}</div>}
      </div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>);

}

// ─── Festival page ─────────────────────────────────────────────────────
function FestivalPage() {
  const cd = useCountdown(FESTIVAL_EDITION.date);
  const session = window.useSession ? window.useSession() : null;
  const isHolder = !!session?.s?.signedIn;
  const [detailFilm, setDetailFilm] = React.useState(null);

  // A film opens its real page only if it has a catalog entry; festival-only
  // originals (no detail page) open a self-contained lightbox instead of
  // routing to a dead URL.
  const inCatalog = (id) => typeof CATALOG !== "undefined" && CATALOG.some((c) => c.id === id);
  const openFilm = (f) => {
    if (window.FestivalFilmPage) { navigate(`/festival/film/${f.id}`); return; }
    if (!inCatalog(f.id)) {setDetailFilm(f);return;}
    navigate(f.branched ? `/branches/${f.id}` : f.kind === "series" ? `/series/${f.id}` : `/film/${f.id}`);
  };

  // Build a lineup of 12 DISTINCT films (dedup by title): curated ids first,
  // then festival-only originals, then top up from the catalog.
  const lineup = (() => {
    const out = [],seen = new Set();
    const add = (f) => {
      if (!f) return;
      const key = String(f.title || f.id).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);out.push(f);
    };
    FESTIVAL_EDITION.lineupIds.map(getFestivalFilm).forEach(add);
    FESTIVAL_ONLY.forEach(add);
    if (typeof CATALOG !== "undefined") {
      for (const f of CATALOG) {if (out.length >= 12) break;if (!String(f.id).startsWith("pub-")) add(f);}
    }
    return out.slice(0, 12);
  })();

  const dt = new Date(FESTIVAL_EDITION.date);
  const dateLabel = dt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase();
  const timeLabel = dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toUpperCase();
  const PADX = "clamp(20px, 5vw, 72px)";
  const wrap = { maxWidth: "var(--w-page)", marginLeft: "auto", marginRight: "auto", width: "100%" };

  const scrollToPasses = () => {
    const el = document.getElementById("fest-passes");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 16, behavior: "smooth" });
  };

  const passes = [
  { name: "Regular", price: FESTIVAL_EDITION.pass.regular, sub: "Watch from anywhere.", color: tkc("ink-3"),
    perks: ["Stream all 12 films live + on demand 24h", "Live chat alongside the audience", "Audience-pick vote at 9:15 PM"] },
  { name: "Holder", price: FESTIVAL_EDITION.pass.holder, sub: isHolder ? "You\u2019re in." : "Free for any Cina NFT holder.", primary: true, highlight: isHolder, color:  "var(--c-amber)",
    perks: ["Everything in Regular", "Voice rooms with all 12 directors at 9:30 PM", "24h secondary-market unlocks at first frame", "One random holder per room gets a 1:1 next morning"] },
  { name: "Front row", price: FESTIVAL_EDITION.pass.frontRow, sub: "The full experience.", color: tkc("bad"),
    perks: ["Everything in Holder", "Live Q&A queue — ask the directors on stage", "Afterparty lounge — spatial audio bar", "Numbered seat · your name in the credits roll"] }];

  const handlePass = (p) => {
    if (p.highlight) {navigate("/festival");return;}
    if (p.price === 0) {
      if (window.openSignIn) window.openSignIn();else
      if (window.toast) window.toast({ title: "JOIN", text: "Holders enter free \u2014 sign in to claim", kind: "good" });
      return;
    }
    if (window.openPay) {
      window.openPay({
        kind: "ticket", title: `${p.name} pass`,
        subtitle: `Cina Festival \u00b7 Edition ${FESTIVAL_EDITION.number || "07"}`,
        accent: p.color, priceUSD: p.price,
        image: { kind: "festival", color: p.color }, perks: p.perks,
        ticker: `festival-${p.name.toLowerCase().replace(/\s+/g, "-")}`, ticketUrl: "/festival",
        onConfirm: () => {if (window.toast) window.toast({ title: "RESERVED", text: `${p.name} pass \u00b7 doors open Friday`, kind: "good" });}
      });
    }
  };

  return (
    <div style={{ background: "var(--c-bg)", minHeight: "calc(100vh - var(--gutter))" }}>

      {/* ─── HERO (image-free) ─── */}
      <section style={{
        position: "relative",
        background: `radial-gradient(120% 90% at 82% -10%, rgba(var(--accent-rgb),0.12) 0%, transparent 46%), linear-gradient(180deg, ${tkc("panel")} 0%, var(--c-bg) 80%)`,
        borderBottom: "1px solid var(--c-line)", overflow: "hidden"
      }}>
        <div style={{ ...wrap, padding: `clamp(40px,6vw,88px) ${PADX} 0` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: "clamp(28px,4vw,44px)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "5px 13px 5px 11px", border: "1px solid rgba(var(--accent-rgb),.4)", borderRadius: 999, background: "rgba(var(--accent-rgb),.06)" }}>
              <span className="fest-livedot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-amber)", boxShadow: "0 0 10px var(--c-amber)" }} />
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", fontWeight: 700 }}>EDITION {String(FESTIVAL_EDITION.number).padStart(2, "0")}</span>
            </span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", letterSpacing: ".16em" }}>{dateLabel} · {timeLabel} PT</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>4H 12M · LIVE + ON DEMAND</span>
          </div>

          <h1 className="t-display" style={{ fontStyle: "italic", lineHeight: 0.9, fontWeight: 400, margin: 0, letterSpacing: "-0.02em", color: "var(--c-ink)", textWrap: "balance", maxWidth: "var(--w-mid)", fontSize: "clamp(46px, 11vw, 100px)" }}>
            A film festival,<br /><span style={{ color: "var(--c-amber)" }}>once a month,</span> on the internet.
          </h1>
          <p className="t-display" style={{ fontStyle: "italic", fontSize: "clamp(16px,2vw,22px)", color: "var(--c-ink-2)", maxWidth: 640, margin: "clamp(20px,3vw,30px) 0 0", lineHeight: 1.5 }}>
            Three guest curators pick twelve films you couldn’t see anywhere else. We screen them once, live, in order — then the room turns into voice channels with the directors.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: "clamp(28px,4vw,40px)" }}>
            <button className="btn btn-primary fest-cta" onClick={scrollToPasses} style={{ height: 50, padding: "0 26px", fontSize: "var(--fs-body)" }}>Get a pass →</button>
            <button className="btn fest-cta" onClick={() => window.openFestivalSubmit && window.openFestivalSubmit()} style={{ height: 50, padding: "0 24px", fontSize: "var(--fs-body)" }}>Submit your film</button>
          </div>

          <div style={{ marginTop: "clamp(40px,5vw,64px)", paddingTop: "clamp(28px,3vw,36px)", borderTop: "1px solid var(--c-line)", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, flexWrap: "wrap", paddingBottom: "clamp(36px,4vw,52px)" }}>
            <div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 20 }}>◐ DOORS OPEN IN</div>
              <FestCountdown cd={cd} />
            </div>
            <div style={{ display: "grid", gap: 11 }}>
              {[["EVERY FIRST FRIDAY", "Monthly drop"], [lineup.length + " PREMIERES", "One running order"], ["3 CURATORS", "Each picks four"]].map(([a, b], i) =>
              <div key={i} style={{ display: "flex", gap: 16, justifyContent: "flex-end", alignItems: "baseline" }}>
                  <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>{b}</span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink)", letterSpacing: ".16em", minWidth: 150, textAlign: "left" }}>{a}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <FestMarquee titles={lineup.map((f) => f.title)} />
      </section>

      {/* ─── PREMISE ─── */}
      <section style={{ ...wrap, padding: `clamp(48px,6vw,82px) ${PADX}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px,100%),1fr))", gap: 14 }}>
          {FESTIVAL_EDITION.whatItIs.map((s) =>
          <div key={s.n} style={{ padding: "clamp(24px,3vw,34px)", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-amber)", lineHeight: 1, letterSpacing: "-0.02em" }}>{s.n}</div>
              <h3 className="t-display" style={{ fontStyle: "italic", margin: "18px 0 0", fontWeight: 500, lineHeight: 1.12, color: "var(--c-ink)", fontSize: "22px" }}>{s.h}</h3>
              <p style={{ margin: "12px 0 0", fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.6 }}>{s.b}</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── RUN OF SHOW ─── */}
      <section style={{ background: "var(--c-void)", borderTop: "1px solid var(--c-line)", borderBottom: "1px solid var(--c-line)" }}>
        <div style={{ ...wrap, padding: `clamp(48px,6vw,82px) ${PADX}` }}>
          <FestHead kicker="RUN OF SHOW · ALL TIMES PT" title="One night, in order." sub="Doors at 6:30, first frame at 7. No intermissions skipped." right={<div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>HOST · LIN HARA</div>} />
          <div>
            {FESTIVAL_EDITION.runOfShow.map((r, i, arr) =>
            <div key={i} style={{ display: "grid", gridTemplateColumns: "minmax(64px,auto) 1fr auto", gap: "clamp(14px,3vw,40px)", alignItems: "start", padding: "20px 0", borderTop: "1px solid var(--c-line)" }}>
                <div className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", letterSpacing: ".08em", paddingTop: 3, whiteSpace: "nowrap" }}>{r.t}</div>
                <div style={{ position: "relative", paddingLeft: 26, minWidth: 0 }}>
                  <span style={{ position: "absolute", left: 0, top: 5, width: 9, height: 9, borderRadius: "50%", background: r.color, boxShadow: `0 0 0 4px ${r.color}22` }} />
                  {i < arr.length - 1 && <span style={{ position: "absolute", left: 4, top: 17, bottom: -29, width: 1, background: "var(--c-line)" }} />}
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: r.color, fontWeight: 700, textTransform: "uppercase" }}>{r.phase}</div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500, marginTop: 4 }}>{r.label}</div>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 4, lineHeight: 1.5, maxWidth: 540 }}>{r.sub}</div>
                </div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", textAlign: "right", paddingTop: 3, whiteSpace: "nowrap" }}>{r.dur > 0 ? r.dur + " MIN" : "—"}</div>
              </div>
            )}
            <div style={{ borderTop: "1px solid var(--c-line)" }} />
          </div>
        </div>
      </section>

      {/* ─── CURATORS ─── */}
      <section style={{ ...wrap, padding: `clamp(48px,6vw,82px) ${PADX}` }}>
        <FestHead kicker="THIS MONTH’S JURY · EACH PICKS FOUR" title="The curators." sub="Three filmmakers choose the twelve. They watch every submission, then defend their picks live on stage." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px,100%),1fr))", gap: 14 }}>
          {FESTIVAL_EDITION.curators.map((c) =>
          <div key={c.initials} style={{ padding: "28px 26px", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderTop: `2px solid ${c.color}`, borderRadius: "1px 1px 8px 8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 58, height: 58, borderRadius: "50%", background: `radial-gradient(circle at 32% 30%, ${c.color}55, ${c.color}10)`, border: `1px solid ${c.color}70`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: tkc("white"), flexShrink: 0 }}>{c.initials}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", fontWeight: 500, lineHeight: 1 }}>{c.name}</div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: c.color, letterSpacing: ".16em", marginTop: 7, textTransform: "uppercase" }}>{c.role}</div>
                </div>
              </div>
              <p className="t-display" style={{ margin: "22px 0 0", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink-2)", lineHeight: 1.4, letterSpacing: "-0.01em" }}>“{c.pick}”</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── PASSES ─── */}
      <section id="fest-passes" style={{ background: "var(--c-void)", borderTop: "1px solid var(--c-line)", borderBottom: "1px solid var(--c-line)" }}>
        <div style={{ ...wrap, padding: `clamp(48px,6vw,82px) ${PADX}` }}>
          <FestHead kicker="ADMISSION" title="Pick how you watch." sub="Every pass gets all twelve films. The difference is the room you sit in." right={<div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>182 SEATS LEFT · FRONT ROW</div>} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px,100%),1fr))", gap: 14, alignItems: "stretch" }}>
            {passes.map((p) =>
            <button key={p.name} className="btn-ghost fest-cta" onClick={() => handlePass(p)} style={{
              height: "auto", padding: 26, textAlign: "left",
              background: p.highlight ? "rgba(var(--accent-rgb),0.06)" : "var(--c-panel)",
              border: `1px solid ${p.highlight ? "var(--c-amber)" : p.primary ? p.color + "80" : "var(--c-line)"}`,
              borderRadius: "var(--r-2)", display: "flex", flexDirection: "column", alignItems: "stretch", gap: 18, justifyContent: "flex-start",
              ...(p.primary ? { boxShadow: "0 24px 60px -28px rgba(var(--accent-rgb),.4)" } : null)
            }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: p.color, letterSpacing: ".16em", fontWeight: 700 }}>{p.name.toUpperCase()}</span>
                  {p.primary &&
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: p.highlight ? tkc("on-amber") : "var(--c-amber)", background: p.highlight ? "var(--c-amber)" : "rgba(var(--accent-rgb),.12)", padding: "3px 8px", borderRadius: 999, letterSpacing: ".16em", fontWeight: 700 }}>{p.highlight ? "YOU\u2019RE IN" : "MOST PICK THIS"}</span>
                }
                </div>
                <div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-display)", lineHeight: 0.92, color: "var(--c-ink)", fontWeight: 500, letterSpacing: "-0.02em" }}>
                    {p.price === 0 ? "Free" : <>${p.price}<span style={{ fontSize: "var(--fs-lead)", color: "var(--c-ink-3)", marginLeft: 6, fontFamily: "var(--f-mono)", fontStyle: "normal", letterSpacing: ".16em" }}>/NIGHT</span></>}
                  </div>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 6 }}>{p.sub}</div>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
                  {p.perks.map((perk, j) =>
                <li key={j} style={{ display: "flex", gap: 10, fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.45 }}>
                      <span style={{ color: p.color, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", lineHeight: 1.4 }}>▸</span><span style={{ fontSize: "12px" }}>{perk}</span>
                    </li>
                )}
                </ul>
                <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--c-line)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: p.color, fontWeight: 700, textTransform: "uppercase" }}>
                  {p.highlight ? "→ Enter the festival" : `→ Pick ${p.name}`}
                </div>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ─── LINEUP ─── */}
      <section style={{ ...wrap, padding: `clamp(48px,6vw,82px) ${PADX}` }}>
        <FestHead kicker="THE PROGRAM · IN RUNNING ORDER" title="Twelve premieres." sub="Each shown once, live. The numbers are the running order — no skips." right={<div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>{lineup.length} FILMS</div>} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(265px,1fr))", gap: 16 }}>
          {lineup.map((f, i) =>
          <button key={f.id + i} className="btn-ghost fest-tile" onClick={() => openFilm(f)} style={{ padding: 0, height: "auto", borderRadius: "var(--r-2)", overflow: "hidden", textAlign: "left", background: "var(--c-panel)", border: "1px solid var(--c-line)", display: "flex", flexDirection: "column", alignItems: "stretch" }}>
              <div style={{ position: "relative", aspectRatio: "3 / 2", background: f.cover, overflow: "hidden" }}>
                {window.FrameThumb && <div className="fest-tile-img" style={{ position: "absolute", inset: 0 }}><FrameThumb kind={f.thumb} usePhoto /></div>}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.12) 0%, transparent 28%, rgba(0,0,0,.5) 100%)" }} />
                <div style={{ position: "absolute", top: 12, left: 12, minWidth: 30, height: 30, padding: "0 7px", borderRadius: "var(--r-1)", background: "rgba(8,8,10,.78)", backdropFilter: "blur(4px)", border: "1px solid rgba(var(--accent-rgb),.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-amber)" }}>{String(i + 1).padStart(2, "0")}</span>
                </div>
                {f.branched &&
              <div style={{ position: "absolute", top: 12, right: 12, padding: "4px 7px", background: "rgba(8,8,10,.78)", backdropFilter: "blur(4px)", border: "1px solid rgba(var(--accent-rgb),.45)", borderRadius: "var(--r-1)" }}>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>BRANCHED</span>
                  </div>
              }
                {typeof TrophyChip === "function" && <div style={{ position: "absolute", bottom: 12, right: 12 }}><TrophyChip filmId={f.id} /></div>}
              </div>
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 7 }}>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.08, color: "var(--c-ink)" }}>{f.title}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>{f.creator?.toUpperCase()} · {f.runtime || f.totalEpisodes + " EP"}</div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5, marginTop: 2, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{f.logline}</div>
              </div>
            </button>
          )}
        </div>
      </section>

      {/* ─── SUBMIT ─── */}
      <section style={{ background: "var(--c-void)", borderTop: "1px solid var(--c-line)", borderBottom: "1px solid var(--c-line)" }}>
        <div style={{ ...{ ...wrap, padding: `clamp(40px,5vw,64px) ${PADX}`, display: "flex", gap: 32, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }, padding: "64px 72px" }}>
          <div style={{ flex: "1 1 380px", minWidth: 0, textAlign: "left" }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", fontWeight: 700, marginBottom: 14 }}>FOR FILMMAKERS · CLOSES IN 12 DAYS</div>
            <h2 className="t-display" style={{ fontStyle: "italic", margin: 0, fontWeight: 400, color: "var(--c-ink)", letterSpacing: "-0.02em", lineHeight: 1.02, fontSize: "40px" }}>Made something? Get it in front of the room.</h2>
            <p style={{ color: "var(--c-ink-2)", margin: "14px 0 0", maxWidth: 640, lineHeight: 1.6, fontSize: "var(--fs-lead)" }}>Free for verified Cina creators with a minted film. The three curators watch everything — no algorithm, no gatekeeper inbox.</p>
          </div>
          <button className="btn btn-primary fest-cta" onClick={() => window.openFestivalSubmit && window.openFestivalSubmit()} style={{ height: 50, padding: "0 26px", fontSize: "var(--fs-body)", whiteSpace: "nowrap" }}>Submit your film →</button>
        </div>
      </section>

      {/* ─── Live audience vote + prize payout ─── */}
      {typeof FestivalVotePayout === "function" && <FestivalVotePayout lineup={lineup} />}

      {typeof window.FestivalStandings === "function" && <window.FestivalStandings />}

      {/* ─── Past winners honour roll ─── */}
      {typeof FestivalWinnersSection === "function" && <FestivalWinnersSection />}

      {/* ─── AFTERPARTY ─── */}
      <section style={{ ...wrap, padding: `clamp(40px,5vw,60px) ${PADX}` }}>
        <div style={{ padding: "clamp(28px,3vw,40px)", background: "linear-gradient(120deg, rgba(201,85,72,.10), rgba(var(--accent-rgb),.04) 58%, transparent)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)", display: "flex", gap: 32, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 380px", minWidth: 0 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-blood-l)", letterSpacing: ".16em", fontWeight: 700, marginBottom: 12 }}>HOLDER ROOMS · 9:30 PM</div>
            <h3 className="t-display" style={{ fontStyle: "italic", fontSize: "clamp(26px,3vw,34px)", margin: 0, color: "var(--c-ink)", fontWeight: 400 }}>The afterparty is yours.</h3>
            <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", margin: "12px 0 0", maxWidth: 560, lineHeight: 1.6 }}>Voice rooms with every director who premiered tonight. Secondary listings unlock instantly. One holder per room is randomly drawn for a director audit-call the next morning.</p>
          </div>
          <button className="btn-primary fest-cta" onClick={() => isHolder ? navigate("/wallet") : window.openSignIn?.()} style={{ minHeight: 48, padding: "0 26px", fontSize: "var(--fs-body)", borderRadius: "8px" }}>{isHolder ? "Pick a room" : "Sign in to enter"}</button>
        </div>
      </section>

      {/* ─── PAST EDITIONS ─── */}
      <section style={{ ...wrap, padding: `clamp(12px,2vw,24px) ${PADX} clamp(64px,8vw,100px)` }}>
        <FestHead kicker="THE RECORD" title="Past editions." right={<div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>VOL I — VI</div>} />
        <style>{`@media (max-width:760px){.fest-past{grid-template-columns:auto minmax(0,1fr) auto!important;row-gap:4px!important}.fest-past>:nth-child(2),.fest-past__att{display:none}}`}</style>
        <div style={{ border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
          {PAST_FESTIVALS.map((p, i) =>
          <div key={p.number} className="fest-past" style={{ display: "grid", gridTemplateColumns: "68px 130px minmax(0,1fr) auto auto", gap: "clamp(12px,2vw,24px)", padding: "16px 20px", alignItems: "center", background: "var(--c-panel)", borderTop: i ? "1px solid var(--c-line)" : "none", fontSize: "var(--fs-body)" }}>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>VOL.{String(p.number).padStart(2, "0")}</span>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em" }}>{new Date(p.date).toLocaleDateString("en-US", { month: "long", day: "numeric" }).toUpperCase()}</span>
              <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink-2)" }}>{p.headline}</span>
              <span className="t-mono fest-past__att" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", textAlign: "right", whiteSpace: "nowrap" }}>{p.attended.toLocaleString()} ATTENDED</span>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", textAlign: "right", minWidth: 64 }}>${(p.sales / 1e6).toFixed(2)}M</span>
            </div>
          )}
        </div>
      </section>

      {detailFilm && <FestFilmDetail film={detailFilm} onClose={() => setDetailFilm(null)} onPass={scrollToPasses} />}
    </div>);

}

// Lightweight detail card for festival-only originals (no standalone page).
function FestFilmDetail({ film, onClose, onPass }) {
  React.useEffect(() => {
    const onKey = (e) => {if (e.key === "Escape") onClose();};
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 4000, background: "rgba(6,6,8,.74)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(560px, 100%)", background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)", overflow: "hidden", boxShadow: "0 40px 100px -30px rgba(0,0,0,.8)" }}>
        <div style={{ position: "relative", aspectRatio: "16 / 9", background: film.cover }}>
          {window.FrameThumb && <div style={{ position: "absolute", inset: 0 }}><FrameThumb kind={film.thumb} usePhoto /></div>}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.1), rgba(0,0,0,.62))" }} />
          <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--c-line-2)", background: "rgba(8,8,10,.7)", color: "var(--c-ink)", cursor: "pointer", fontSize: "var(--fs-lead)", lineHeight: 1 }}>×</button>
          <div style={{ position: "absolute", left: 16, bottom: 14, display: "flex", gap: 8 }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", border: "1px solid rgba(var(--accent-rgb),.45)", background: "rgba(8,8,10,.7)", padding: "4px 8px", borderRadius: "var(--r-1)" }}>{(film.runtime || film.kind || "FILM").toUpperCase()}</span>
            {film.branched && <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", border: "1px solid rgba(var(--accent-rgb),.45)", background: "rgba(8,8,10,.7)", padding: "4px 8px", borderRadius: "var(--r-1)" }}>BRANCHED</span>}
          </div>
        </div>
        <div style={{ padding: "24px 26px 26px" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" }}>{(film.creator || "").toUpperCase()}</div>
          <h3 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", margin: "8px 0 0", color: "var(--c-ink)", fontWeight: 500, letterSpacing: "-0.02em" }}>{film.title}</h3>
          <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.6, margin: "14px 0 0" }}>{film.logline}</p>
          <div style={{ marginTop: 22, padding: "14px 16px", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", background: "var(--c-void)", display: "flex", alignItems: "center", gap: 10 }}>
            <span className="fest-livedot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-amber)", flexShrink: 0 }} />
            <span style={{ color: "var(--c-ink-2)", fontSize: "12px" }}>Premieres live at the festival — there&rsquo;s no early stream. A pass is the only way in.</span>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button className="btn btn-primary fest-cta" onClick={() => {onClose();onPass && onPass();}} style={{ height: 46, padding: "0 22px", fontSize: "var(--fs-body)" }}>Get a pass →</button>
            <button className="btn fest-cta" onClick={onClose} style={{ height: 46, padding: "0 20px", fontSize: "var(--fs-body)" }} aria-label="Close" title="Close">Close</button>
          </div>
        </div>
      </div>
    </div>);

}

// ─── Splash → Festival CTA strip ─────────────────────────────────────────
// Mounted at the top of the splash to drive traffic to the next drop.
function FestivalStrip() {
  const cd = useCountdown(FESTIVAL_EDITION.date);
  if (cd.d > 14) return null; // only show within 2 weeks
  if (cd.d <= 0 && cd.h <= 0 && cd.m <= 0) return null; // countdown over — don't show zeros
  return (
    <button onClick={() => navigate("/festival")} className="btn-ghost" style={{
      width: "auto", margin: "16px var(--gutter) 30px",
      height: "auto", padding: "14px 20px", flexWrap: "wrap", rowGap: 8,
      background: "linear-gradient(90deg, rgba(var(--accent-rgb),0.08), rgba(var(--accent-rgb),0.02))",
      border: "1px solid rgba(var(--accent-rgb),0.3)", borderRadius: "var(--r-2)",
      display: "flex", alignItems: "center", gap: 18, justifyContent: "flex-start", textAlign: "left"
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-amber)", boxShadow: "0 0 8px rgba(var(--accent-rgb),0.6)" }} />
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>
        FESTIVAL VOL.{FESTIVAL_EDITION.number}
      </span>
      <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>
        12 premieres in <span style={{ color: "var(--c-amber)", fontVariantNumeric: "tabular-nums" }}>
          {cd.d}d {String(cd.h).padStart(2, "0")}h {String(cd.m).padStart(2, "0")}m
        </span>
      </span>
      <span style={{ flex: 1 }} />
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", letterSpacing: ".16em" }}>
        VIEW LINEUP →
      </span>
    </button>);

}

// ─── Branched cinema — overlay during player ────────────────────────────
// Triggered at the climax of films marked `branched: true` in CATALOG.
// Persists choice in localStorage; shows live vote tally.

function BranchOverlay({ filmId, branchPoint, options, onChoose, onClose }) {
  const [voted, setVoted] = usSW(() => {
    try {return localStorage.getItem(`cina:branch:${filmId}:${branchPoint}`);} catch (e) {return null;}
  });
  const [tally, setTally] = usSW(() => options.map(() => 33 + Math.floor(Math.random() * 30)));

  // Every second, drift the tallies a bit to feel live
  ueSW(() => {
    const t = setInterval(() => {
      setTally((prev) => {
        const drift = prev.map((v) => v + (Math.random() - 0.5) * 2);
        const sum = drift.reduce((a, b) => a + b, 0);
        return drift.map((v) => v / sum * 100);
      });
    }, 1500);
    return () => clearInterval(t);
  }, []);

  const choose = (i) => {
    setVoted(options[i].id);
    try {localStorage.setItem(`cina:branch:${filmId}:${branchPoint}`, options[i].id);} catch (e) {}
    onChoose && onChoose(options[i]);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 32
    }}>
      <div style={{
        width: "min(880px, 100%)", padding: "44px 52px",
        background: "var(--c-panel)", border: "1px solid var(--c-line)",
        borderRadius: "var(--r-2)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-amber)", boxShadow: "0 0 8px rgba(var(--accent-rgb),0.7)" }} />
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>
            BRANCH POINT · LIVE VOTE
          </span>
        </div>
        <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", margin: 0, fontWeight: 400, lineHeight: 1.1 }}>
          {voted ? "Locked in." : "Pick your ending."}
        </h2>
        <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", margin: "10px 0 28px", maxWidth: 560, lineHeight: 1.55 }}>
          {voted ?
          "Your cut continues with this branch. The other endings unlock next month with the rerelease." :
          "Vote within 30 seconds. Tally is live across all viewers."}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: 12 }}>
          {options.map((o, i) => {
            const pct = Math.round(tally[i]);
            const picked = voted === o.id;
            return (
              <button key={o.id} disabled={!!voted} onClick={() => choose(i)} className="btn-ghost" style={{
                padding: "20px 18px", height: "auto", textAlign: "left",
                background: picked ? "rgba(var(--accent-rgb),0.10)" : "var(--c-bg)",
                border: `1px solid ${picked ? "var(--c-amber)" : "var(--c-line)"}`,
                borderRadius: "var(--r-2)",
                display: "flex", flexDirection: "column", alignItems: "stretch", gap: 8,
                opacity: voted && !picked ? 0.5 : 1,
                cursor: voted ? "default" : "pointer"
              }}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: picked ? "var(--c-amber)" : "var(--c-ink-3)", letterSpacing: ".16em" }}>
                  BRANCH {String.fromCharCode(65 + i)}
                </div>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.2, color: "var(--c-ink)" }}>
                  {o.title}
                </div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5 }}>
                  {o.synopsis}
                </div>
                {/* Tally bar */}
                <div style={{ marginTop: 10 }}>
                  <div style={{
                    height: 4, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden"
                  }}>
                    <div style={{
                      height: "100%", width: pct + "%",
                      background: picked ? "var(--c-amber)" : "var(--c-ink-3)",
                      transition: "width 1.4s ease"
                    }} />
                  </div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 6, letterSpacing: ".08em" }}>
                    {pct}% · {(pct * 124).toLocaleString()} votes
                  </div>
                </div>
              </button>);

          })}
        </div>

        {voted &&
        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
            <button onClick={onClose} className="btn-primary" style={{ minHeight: 38, padding: "0 22px", fontSize: "var(--fs-body)" }} aria-label="Close" title="Close">
              Continue watching
            </button>
          </div>
        }
      </div>
    </div>);

}

// Demo: trigger via window.openBranchPoint() from console for live preview
window.openBranchPoint = function (filmId = "demo") {
  const root = document.createElement("div");
  document.body.appendChild(root);
  const r = ReactDOM.createRoot(root);
  const close = () => {r.unmount();root.remove();};
  r.render(<BranchOverlay filmId={filmId} branchPoint="climax" onClose={close} options={[
  { id: "a", title: "She walks away", synopsis: "Nadya leaves the seventh frame in the bath. The negative dissolves." },
  { id: "b", title: "She prints it", synopsis: "Nadya prints the photograph. Her sister is in the next room when she turns around." },
  { id: "c", title: "She burns it", synopsis: "Nadya destroys every frame. The thirteen years collapse into one minute of safelight." }]
  } />);
};

Object.assign(window, { FestivalPage, FestivalStrip, FESTIVAL_EDITION });