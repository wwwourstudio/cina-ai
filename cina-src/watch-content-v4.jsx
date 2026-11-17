// watch-content-v4.jsx — Content ratings · Kids Zone · Branched visibility ·
// merged Studios directory · faces & festivals rows · ranked Trending.
// Loads near the end of index.html so it can patch CATALOG and override pages.

const { useState: usC4, useMemo: umC4, useRef: urC4, useEffect: ueC4 } = React;

// ═══ 1 · Content ratings ══════════════════════════════════════════════════
// Strict G / PG / PG-13 / R. Assigned editorially per title — never by the
// model. Adult content is banned platform-wide; R is the ceiling.
const CERTS = {
  // G — all ages
  pearl: "G", moss: "G",
  // PG
  bluejay: "PG", salt: "PG", cardinal: "PG", grail: "PG", longhall: "PG", after: "PG",
  // PG-13
  frequency: "PG-13", drift: "PG-13", marauder: "PG-13", swallows: "PG-13",
  haul: "PG-13", ghosting: "PG-13", bantam: "PG-13", anvil: "PG-13",
  obsidian: "PG-13", thefence: "PG-13", cellar: "PG-13", tender: "PG-13",
  // R — ceiling. Nothing above R exists on Cina.
  ll: "R", carrion: "R", pelt: "R", mire: "R", kindling: "R", needle: "R", verge: "R"
};
const CERT_COLORS = { "G": tkc("good"), "PG": tkc("cat-1"), "PG-13": "var(--c-amber)", "R": tkc("bad") };

(window.CATALOG || []).forEach((f) => {
  f.cert = f.cert || CERTS[f.id] || "PG-13";
  f.branched = !!(window.BRANCH_FILMS && window.BRANCH_FILMS[f.id]);
});

function CertBadge({ cert, size = 9 }) {
  if (!cert) return null;
  return (
    <span className="t-mono" style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 5px", borderRadius: "var(--r-1)",
      border: `1px solid ${CERT_COLORS[cert] || "var(--c-line-3)"}`,
      color: CERT_COLORS[cert] || "var(--c-ink-2)",
      background: "rgba(8,8,10,.6)",
      fontSize: size, fontWeight: 700, letterSpacing: ".16em", lineHeight: 1
    }}>{cert}</span>);

}

// Kids shelf — G and PG only
if (window.SHELVES && !window.SHELVES.some((s) => s.id === "kids")) {
  window.SHELVES.push({
    id: "kids", title: "Kids zone", subtitle: "G and PG only · every title human-reviewed",
    filmIds: (window.CATALOG || []).filter((f) => f.cert === "G" || f.cert === "PG").map((f) => f.id)
  });
}

// ═══ 3 · Branched cinema shelf — the vote-at-every-fork titles ════════════
// Mini branch-tree glyph — one root forking to three paths, the "leading"
// path lit. Makes the abstract idea of "branching" instantly legible on the
// card without a heavy illustration.
function BranchGlyph({ accent = tkc("amber-d"), lit = 0, w = 72, h = 44 }) {
  const leaves = [10, 22, 34];
  return (
    <svg width={w} height={h} viewBox="0 0 72 44" fill="none" style={{ display: "block" }} aria-hidden="true">
      <path d="M8 22 H26" stroke="rgba(255,255,255,.45)" strokeWidth="1.6" strokeLinecap="round" />
      {leaves.map((y, i) =>
      <path key={i} d={`M26 22 C40 22, 44 ${y}, 58 ${y}`} stroke={i === lit ? accent : "rgba(255,255,255,.3)"} strokeWidth={i === lit ? 2 : 1.4} strokeLinecap="round" />
      )}
      <circle cx="8" cy="22" r="3.4" fill={accent} />
      <circle cx="26" cy="22" r="2.6" fill="rgba(255,255,255,.65)" />
      {leaves.map((y, i) =>
      <circle key={i} cx="58" cy={y} r={i === lit ? 4 : 2.8} fill={i === lit ? accent : "rgba(255,255,255,.4)"} />
      )}
    </svg>);

}

// ─── Branch stats: derive forks/endings/watching consistently everywhere ──
function branchStats(id, br) {
  const forks = (br && (br.forks?.length || br.nodes?.length)) || 4;
  const cuts = (br && br.cutsPossible) || Math.pow(3, Math.min(forks, 5));
  const live = !!(br && br.live);
  const watching = (br && br.watching) || 640 + forks * 311 + (id.charCodeAt(0) % 9) * 120;
  return { forks, cuts, live, watching };
}

// ─── Shared branched-room card — used on home, /branches, branch watch page ─
// One canonical look so "branched" reads the same site-wide.
function BranchedRoomCard({ id, film, br, w }) {
  const stats = branchStats(id, br);
  const accent = film.color || tkc("amber-d");
  return (
    <button onClick={() => navigate(`/branches/${id}`)} className="branched-room-card" style={{
      width: w || "100%", height: "auto", padding: 0, borderRadius: 0, overflow: "visible", textAlign: "left",
      display: "flex", flexDirection: "column", gap: 11, flex: "0 0 auto",
      background: "transparent", border: 0, cursor: "pointer",
      transition: "transform .22s cubic-bezier(.2,.7,.2,1)"
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; const c = e.currentTarget.querySelector(".brc-cover"); if (c) { c.style.borderColor = "var(--c-line-3)"; c.style.boxShadow = "0 18px 38px rgba(0,0,0,.6)"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; const c = e.currentTarget.querySelector(".brc-cover"); if (c) { c.style.borderColor = "var(--c-line-2)"; c.style.boxShadow = "0 2px 6px rgba(0,0,0,.35)"; } }}>

      {/* Thumbnail */}
      <span className="brc-cover" style={{ display: "block", position: "relative", aspectRatio: "16/9", background: film.color, overflow: "hidden", borderRadius: "var(--r-2)", border: "1px solid var(--c-line-2)", boxShadow: "0 2px 6px rgba(0,0,0,.35)", transition: "border-color .15s ease, box-shadow .22s ease" }}>
        <FrameThumb kind={film.thumb} usePhoto />
        <span style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,7,6,.94) 0%, rgba(8,7,6,.1) 52%, rgba(8,7,6,.35) 100%)" }} />

        {/* top row: live + cert · watching */}
        <span style={{ position: "absolute", top: 11, left: 11, right: 11, display: "flex", alignItems: "center", gap: 6 }}>
          {stats.live && (
            <span className="t-mono" style={{
              display: "inline-flex", alignItems: "center", gap: 5, fontSize: "var(--fs-label)", fontWeight: 700,
              letterSpacing: ".16em", color: tkc("white"), background: "rgba(194,80,80,.95)", padding: "3px 8px", borderRadius: 999
            }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: tkc("white"), animation: "pulse-dot 1.4s ease-in-out infinite" }} /> VOTE OPEN</span>
          )}
          {typeof CertBadge === "function" && <CertBadge cert={film.cert} />}
          <span style={{ flex: 1 }} />
          <span className="t-mono" style={{
            fontSize: "var(--fs-label)", letterSpacing: ".08em", color: "rgba(255,255,255,.92)",
            background: "rgba(0,0,0,.5)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,.16)",
            borderRadius: 999, padding: "3px 8px", display: "inline-flex", alignItems: "center", gap: 5
          }}><span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--c-good)" }} /> {stats.watching.toLocaleString()}</span>
        </span>

        {/* fork diagram + stats, bottom-left over the image */}
        <span style={{ position: "absolute", left: 13, bottom: 12, right: 13, display: "flex", alignItems: "flex-end", gap: 12 }}>
          <BranchGlyph accent={accent} lit={(stats.forks + id.length) % 3} w={64} h={40} />
          <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span className="t-display t-num" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: tkc("white"), lineHeight: 1 }}>{stats.forks} forks</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.72)", letterSpacing: ".16em" }}>{stats.cuts} POSSIBLE ENDINGS</span>
          </span>
        </span>
      </span>

      {/* Footer */}
      <span style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 2px" }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="t-display" style={{ display: "block", fontStyle: "italic", fontSize: "var(--fs-lead)", letterSpacing: "-0.01em", lineHeight: 1.08, color: "var(--c-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{film.title}</span>
          <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 4 }}>
            {(((br && br.director) || film.creator) + "").toUpperCase()}
          </span>
        </span>
        <span aria-hidden="true" className="brc-cta" style={{
          flexShrink: 0, height: 32, padding: "0 14px", borderRadius: 999,
          display: "inline-flex", alignItems: "center", gap: 6,
          border: "1px solid rgba(194,80,80,.5)", color: "var(--c-blood-l)",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700, letterSpacing: ".16em",
          background: "transparent", transition: "background .16s ease, color .16s ease"
        }}>
          {stats.live ? "VOTE NOW" : "ENTER ROOM"}<Icon name="chev-r" size={13} />
        </span>
      </span>
    </button>
  );
}

function BranchedHomeShelf() {
  const isMobile = typeof useIsMobile === "function" ? useIsMobile() : false;
  const items = umC4(() => {
    const ids = Object.keys(window.BRANCH_FILMS || {});
    return ids.map((id) => ({ id, film: (window.CATALOG || []).find((f) => f.id === id), br: window.BRANCH_FILMS[id] })).
    filter((x) => x.film).slice(0, 4);
  }, []);
  if (!items.length) return null;
  return (
    <section style={{ padding: isMobile ? "28px 20px 22px" : "38px var(--gutter) 30px" }}>
      <style>{`.branched-room-card:hover .brc-cta{background:var(--c-blood-l);color:${tkc("white")};border-color:var(--c-blood-l)}`}</style>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-blood-l)", boxShadow: "0 0 8px var(--c-blood-l)" }}></span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-blood-l)", letterSpacing: ".16em", fontWeight: 700 }}>BRANCHED CINEMA</span>
          </span>
          <h2 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: isMobile ? 23 : 30, margin: 0, letterSpacing: "-0.02em", lineHeight: 0.98 }}>
            Films that fork. <span style={{ color: "var(--c-blood-l)" }}>You</span> decide.
          </h2>
          <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", margin: "6px 0 0", maxWidth: 460, lineHeight: 1.4 }}>
            The room votes at every turn — the winning cut locks as canon.
          </p>
        </div>
        <button className="btn-ghost" style={{ height: 30, padding: "0 13px", fontSize: "var(--fs-label)", color: "var(--c-ink-2)", flexShrink: 0, alignSelf: isMobile ? "flex-start" : "center" }} onClick={() => navigate("/branches")}>All rooms <Icon name="chev-r" size={10} /></button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {items.map(({ id, film, br }) => <BranchedRoomCard key={id} id={id} film={film} br={br} />)}
      </div>
    </section>);

}

// ─── Rich studio card for the home row — mirrors the directory's SoloStudioCard
//     (film-still cover, avatar, meta, tagline, domain, price, visit). Inline
//     styles so it doesn't depend on the studios-page CSS. ───────────────────
function StudioHomeCard({ entry }) {
  const e = entry;
  return (
    <button onClick={e.onClick} title={e.name} style={{
      flex: "0 0 300px", width: 300, padding: 0, cursor: "pointer", textAlign: "left",
      display: "flex", flexDirection: "column", gap: 11, color: "inherit",
      background: "transparent", border: 0,
      transition: "transform .22s cubic-bezier(.2,.7,.2,1)",
    }}
      onMouseEnter={(ev) => { ev.currentTarget.style.transform = "translateY(-4px)"; const c = ev.currentTarget.querySelector(".shc-cover"); if (c) { c.style.borderColor = "var(--c-line-3)"; c.style.boxShadow = "0 18px 38px rgba(0,0,0,.6)"; } }}
      onMouseLeave={(ev) => { ev.currentTarget.style.transform = "none"; const c = ev.currentTarget.querySelector(".shc-cover"); if (c) { c.style.borderColor = "var(--c-line-2)"; c.style.boxShadow = "0 2px 6px rgba(0,0,0,.35)"; } }}>
      {/* Film-still cover */}
      <span className="shc-cover" style={{ position: "relative", display: "block", aspectRatio: "16/9", background: e.bg || e.color, overflow: "hidden", borderRadius: "var(--r-2)", border: "1px solid var(--c-line-2)", boxShadow: "0 2px 6px rgba(0,0,0,.35)", transition: "border-color .15s ease, box-shadow .22s ease" }}>
        {e.coverFilm
          ? <FrameThumb kind={e.coverFilm.thumb} usePhoto/>
          : <span style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${e.color}, ${tkc("void")})` }}/>}
        <span style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,10,.97) 2%, rgba(8,8,10,.16) 52%, transparent 100%)" }}/>
        <span className="t-mono" style={{ position: "absolute", top: 10, left: 10, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.9)", background: "rgba(0,0,0,.5)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 999, padding: "3px 9px" }}>{e.kindLabel}</span>
        {e.coverFilm && <span className="t-mono" style={{ position: "absolute", left: 13, bottom: 11, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.72)" }}>FROM “{e.coverFilm.title.toUpperCase()}”</span>}
      </span>
      {/* Body */}
      <span style={{ display: "flex", flexDirection: "column", gap: 11, padding: "0 2px", flex: 1 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <span style={{ width: 38, height: 38, borderRadius: e.collective ? 7 : "50%", background: e.color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", border: "1px solid rgba(255,255,255,.16)" }}>{e.avatarText}</span>
          <span style={{ minWidth: 0, flex: 1 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.name}</span>
              {e.verified && <span title="Verified" style={{ width: 14, height: 14, borderRadius: "50%", flexShrink: 0, background: tkc("cat-1"), color: tkc("panel"), fontSize: "var(--fs-label)", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>}
            </span>
            <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.metaLine}</span>
          </span>
        </span>
        <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 36 }}>{e.tagline}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto", paddingTop: 11, borderTop: "1px solid var(--c-line)" }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", display: "inline-flex", alignItems: "center", gap: 5, minWidth: 0, overflow: "hidden" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-good)", flexShrink: 0 }}/>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.domain}</span>
          </span>
          <span style={{ flex: 1 }}/>
          {e.price != null && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", whiteSpace: "nowrap" }}>${e.price.toFixed(2)}<span style={{ color: "var(--c-ink-4)" }}>/MO</span></span>}
          <span className="btn btn-primary" style={{ height: 30, fontSize: "var(--fs-label)", padding: "0 12px", display: "inline-flex", alignItems: "center" }}>Visit studio →</span>
        </span>
      </span>
    </button>
  );
}

// ═══ 4 · Studios row — collectives + solo studios, linked to their sites ══
function StudiosHomeRow() {
  const isMobile = typeof useIsMobile === "function" ? useIsMobile() : false;
  const studios = (window.STUDIOS || []).slice(0, 3);
  const creators = (window.CREATORS || []).slice(0, 5);
  const filmsBy = (cid) => (window.CATALOG || []).filter((f) => f.creatorId === cid);
  const dedupeLead = (films) => { const seen = new Set(); return films.filter((f) => { if (seen.has(f.thumb)) return false; seen.add(f.thumb); return true; }); };

  const studioEntries = studios.map((s) => {
    const slate = dedupeLead((s.members || []).flatMap(filmsBy));
    return {
      collective: true, color: s.color, bg: s.bg, coverFilm: slate[0],
      kindLabel: `▶ ${slate.length} ${slate.length === 1 ? "TITLE" : "TITLES"}`,
      avatarText: s.name[0],
      name: s.name, verified: (s.subs || 0) >= 100000,
      metaLine: `COLLECTIVE · ${(s.members || []).length} DIRECTORS · ${fmtCount(s.subs || 0)} SUBS`,
      tagline: s.tagline || "A director-owned studio on Cina.",
      domain: (s.domain || (s.id + ".cina")),
      price: (s.plans && s.plans[0] && s.plans[0].price) || null,
      onClick: () => navigate("/studios"),
    };
  });
  const creatorEntries = creators.map((c) => {
    const slate = dedupeLead(filmsBy(c.id));
    return {
      collective: false, color: c.color, bg: c.bg, coverFilm: slate[0],
      kindLabel: `▶ ${slate.length} ${slate.length === 1 ? "TITLE" : "TITLES"}`,
      avatarText: c.name.split(" ").map((p) => p[0]).join(""),
      name: c.name, verified: (c.followers || 0) >= 100000,
      metaLine: `${(c.handle || "").toUpperCase()} · ${fmtCount(c.followers || 0)} FOLLOWERS`,
      tagline: c.tagline || c.bio || "An independent studio on Cina.",
      domain: c.domain || (c.id + ".cina"),
      price: c.sub || 4.99,
      onClick: () => navigate(`/site/${c.id}`),
    };
  });
  const entries = [...studioEntries, ...creatorEntries];

  return (
    <section style={{ padding: isMobile ? "30px 20px 36px" : "40px var(--gutter) 44px", borderBottom: "1px solid var(--c-line)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <h2 className="t-display" style={{ fontStyle: "italic", fontSize: isMobile ? 24 : 30, margin: 0, letterSpacing: "-0.02em" }}>Studios on Cina</h2>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>EVERY ONE HAS ITS OWN SITE</span>
        <span style={{ flex: 1 }}></span>
        <button className="btn-ghost" style={{ height: 24, padding: "0 10px", fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }} onClick={() => navigate("/studios")}>The directory <Icon name="chev-r" size={10} /></button>
      </div>
      <CarouselRail fade="var(--c-bg)" gap={14} padY={8} arrowOffset={-8}>
        {entries.map((e, i) => <StudioHomeCard key={i} entry={e}/>)}
      </CarouselRail>
    </section>);

}

// ═══ 5 · Faces of the season — cast row ═══════════════════════════════════
function FacesRow() {
  const isMobile = typeof useIsMobile === "function" ? useIsMobile() : false;
  const cast = (window.CAST || []).slice(0, 8);
  if (!cast.length) return null;
  return (
    <section style={{ padding: isMobile ? "26px 20px 8px" : "30px var(--gutter) 8px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <h2 className="t-display" style={{ fontStyle: "italic", fontSize: isMobile ? 24 : 30, margin: 0, letterSpacing: "-0.02em" }}>Faces of the season</h2>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>SYNTHETIC PERFORMERS · REAL CAREERS</span>
        <span style={{ flex: 1 }}></span>
        <button className="btn-ghost" style={{ height: 24, padding: "0 10px", fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }} onClick={() => navigate("/cast")}>Full cast <Icon name="chev-r" size={10} /></button>
      </div>
      <CarouselRail fade="var(--c-bg)" gap={16} padY={10} arrowOffset={-8}>
        {cast.map((a) => (
          <div key={a.id} style={{ flex: "0 0 246px", width: 246 }}>
            {typeof VaultActorCard === "function"
              ? <VaultActorCard actor={a} variant="watch" onClick={() => navigate(`/cast/${a.id}`)} />
              : null}
          </div>
        ))}
      </CarouselRail>
    </section>);

}

// ═══ 6 · Festival strip ═══════════════════════════════════════════════════
const FESTIVALS = [
{ date: "JUN 14", where: "Cina Premiere Week", what: "Seven world premieres, one a night", cta: "Tickets", to: "/premieres" },
{ date: "JUL 02", where: "Marseille · festival debut", what: "Bluejay 4K restoration screens in competition", cta: "The film", to: "/film/bluejay" },
{ date: "AUG 21", where: "Branch Night · live", what: "Frequency 88.6 — one fork decided by the whole site", cta: "The room", to: "/branches/frequency" }];



// ═══ 8 · Studios directory — studios + creators merged, one layout ════════
function StudiosDirectoryV2() {
  const studios = window.STUDIOS || [];
  const creators = window.CREATORS || [];
  const [tab, setTab] = usC4("all"); // all | collectives | solo
  const filmsBy = (cid) => (window.CATALOG || []).filter((f) => f.creatorId === cid);

  return (
    <div style={{ padding: "36px clamp(20px, 4vw, var(--gutter)) 80px", maxWidth: "var(--w-page)", margin: "0 auto" }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 6 }}>THE DIRECTORY</div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 26 }}>
        <h1 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-head)", margin: 0, letterSpacing: "-0.02em" }}>
          Studios & creators.
        </h1>
        <div style={{ display: "flex", gap: 8 }}>
          {[["all", "ALL"], ["collectives", "COLLECTIVES"], ["solo", "SOLO STUDIOS"]].map(([id, label]) =>
          <button key={id} onClick={() => setTab(id)} style={{
            appearance: "none", cursor: "pointer", borderRadius: 999, padding: "6px 14px",
            border: `1px solid ${tab === id ? "rgba(var(--accent-rgb),.4)" : "var(--c-line-2)"}`,
            background: tab === id ? "rgba(var(--accent-rgb),.1)" : "transparent",
            color: tab === id ? "var(--c-amber)" : "var(--c-ink-3)",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em", fontWeight: 600
          }}>{label}</button>
          )}
        </div>
      </div>
      <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", maxWidth: 640, lineHeight: 1.55, margin: "-10px 0 30px" }}>
        Every studio on Cina — six-director collectives and one-person shops alike — runs its own
        site, built in the page builder. This is the index of all of them.
      </p>

      {/* Collectives */}
      {(tab === "all" || tab === "collectives") && studios.length > 0 &&
      <section style={{ marginBottom: 40 }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 14 }}>COLLECTIVES · {studios.length}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 14 }}>
            {studios.map((s) => {
            const memberCreators = (s.members || []).map((id) => creators.find((c) => c.id === id)).filter(Boolean);
            const slate = (s.members || []).flatMap(filmsBy).slice(0, 4);
            return (
              <div key={s.id} style={{
                borderRadius: "var(--r-2)", overflow: "hidden",
                border: `1px solid ${s.color}55`,
                background: `linear-gradient(150deg, ${s.color}1e 0%, var(--c-panel) 55%)`,
                display: "flex", flexDirection: "column"
              }}>
                  <div style={{ padding: "20px 22px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ width: 42, height: 42, borderRadius: "var(--r-2)", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{s.name[0]}</span>
                      <div>
                        <div className="t-mono" style={{ fontSize: "var(--fs-body)", letterSpacing: ".16em", fontWeight: 700 }}>{s.name}</div>
                        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 3 }}>
                          COLLECTIVE · SINCE {(s.founded || "").split("-")[0]} · {fmtCount(s.subs || 0)} SUBS
                        </div>
                      </div>
                    </div>
                    <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", margin: "14px 0 6px", lineHeight: 1.3 }}>{s.tagline}</div>
                    <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5 }}>{(s.description || "").split(". ").slice(0, 2).join(". ")}.</div>
                  </div>
                  {/* slate strip */}
                  <div style={{ display: "flex", gap: 6, padding: "14px 22px 0" }}>
                    {slate.map((f) =>
                  <button key={f.id} onClick={() => navigate(f.kind === "series" ? `/series/${f.id}` : `/film/${f.id}`)} className="btn-ghost" title={f.title} style={{
                    flex: 1, height: "auto", aspectRatio: "16/9", padding: 0, borderRadius: "var(--r-1)", overflow: "hidden",
                    background: f.color, border: "1px solid var(--c-line-2)"
                  }}>
                        <FrameThumb kind={f.thumb} usePhoto />
                      </button>
                  )}
                  </div>
                  {/* members + actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 22px 18px", marginTop: "auto" }}>
                    <div style={{ display: "flex" }}>
                      {memberCreators.map((c, i) =>
                    <span key={c.id} title={c.name} style={{
                      width: 26, height: 26, borderRadius: "50%", background: c.color,
                      border: "1.5px solid var(--c-bg)", marginLeft: i ? -8 : 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-label)"
                    }}>{c.name[0]}</span>
                    )}
                    </div>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em" }}>{(s.members || []).length} CREATORS</span>
                    <span style={{ flex: 1 }}></span>
                    <button className="btn" style={{ height: 30, fontSize: "var(--fs-body)" }} onClick={() => window.openPay && window.openPay({
                    kind: "sub", title: `${s.name} · Monthly`, subtitle: "Cancel anytime",
                    priceUSD: s.plans && s.plans[0]?.price || 4.99, cadence: "/mo", accent: s.color
                  })}>Subscribe ${(s.plans && s.plans[0]?.price || 4.99).toFixed(2)}</button>
                    <button className="btn btn-primary" style={{ height: 30, fontSize: "var(--fs-body)" }} onClick={() => navigate(`/site/${s.leadId || (s.members || [])[0]}`)}>
                      Visit site →
                    </button>
                  </div>
                </div>);

          })}
          </div>
        </section>
      }

      {/* Solo studios (creators) */}
      {(tab === "all" || tab === "solo") &&
      <section>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 14 }}>SOLO STUDIOS · {creators.length}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 14 }}>
            {creators.map((c) => {
            const films = filmsBy(c.id);
            return (
              <div key={c.id} style={{ borderRadius: "var(--r-2)", border: "1px solid var(--c-line)", background: "var(--c-panel)", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 40, height: 40, borderRadius: "50%", background: c.color, display: "flex", alignItems: "center", justifyContent: "center", color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", flexShrink: 0 }}>{c.name.split(" ").map((p) => p[0]).join("")}</span>
                    <div style={{ minWidth: 0 }}>
                      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{c.name}</div>
                      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 2 }}>
                        {(c.handle || "").toUpperCase()} · {fmtCount(c.followers)} FOLLOWERS · {films.length} TITLES
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5 }}>{c.bio || c.tagline}</div>
                  <div style={{ display: "flex", gap: 5 }}>
                    {films.slice(0, 3).map((f) =>
                  <button key={f.id} onClick={() => navigate(f.kind === "series" ? `/series/${f.id}` : `/film/${f.id}`)} className="btn-ghost" title={f.title} style={{
                    flex: 1, height: "auto", aspectRatio: "16/9", padding: 0, borderRadius: "var(--r-1)", overflow: "hidden",
                    background: f.color, border: "1px solid var(--c-line-2)"
                  }}>
                        <FrameThumb kind={f.thumb} usePhoto />
                      </button>
                  )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto" }}>
                    <span className="t-mono" style={{
                    fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em",
                    padding: "4px 9px", border: "1px solid var(--c-line-2)", borderRadius: 999
                  }}>● {c.domain}</span>
                    <span style={{ flex: 1 }}></span>
                    <button className="btn" style={{ height: 30, fontSize: "var(--fs-body)" }} onClick={() => navigate(`/creator/${c.id}`)}>Profile</button>
                    <button className="btn btn-primary" style={{ height: 30, fontSize: "var(--fs-body)" }} onClick={() => navigate(`/site/${c.id}`)}>Visit site →</button>
                  </div>
                </div>);

          })}
          </div>
        </section>
      }
    </div>);

}

// FestivalStrip lives in strategy-watch.jsx (reads the live FESTIVAL_EDITION).
Object.assign(window, { CertBadge, BranchedHomeShelf, BranchedRoomCard, branchStats, BranchGlyph, StudiosHomeRow, FacesRow, StudiosIndexPage: StudiosDirectoryV2 });