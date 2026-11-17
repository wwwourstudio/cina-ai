// watch-studios-v4.jsx — Studios directory, second pass.
// Keeps the v3 masthead / collectives / solo grid and adds the four bands the
// surface was missing: trending by growth, studio NFTs, the faces working
// across the houses, and the shared release calendar.
// Loads after watch-studios-v3.jsx and re-overrides window.StudiosIndexPage.

const { useState: usSV4, useMemo: umSV4 } = React;

const SV4_CSS = `
.sv4-wrap{padding:0 var(--sv-gut) 96px}
.sv4-band{display:flex;align-items:baseline;gap:14px;margin:0 0 18px;padding-bottom:11px;border-bottom:1px solid var(--c-line);flex-wrap:wrap}
.sv4-band__n{font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.2em;color:var(--c-amber);font-weight:700}
.sv4-band__s{font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.16em;color:var(--c-ink-4)}
.sv4-row{display:grid;grid-template-columns:34px minmax(0,1fr) 96px 92px 84px 108px;gap:14px;align-items:center;padding:13px 14px;border:1px solid var(--c-line);border-radius:6px;background:var(--c-panel);cursor:pointer;text-align:left;color:inherit;appearance:none;transition:border-color .15s ease,background .15s ease}
.sv-4row:hover,.sv4-row:hover{border-color:var(--c-line-3);background:var(--c-panel-2)}
.sv4-rows{display:flex;flex-direction:column;gap:6px}
@media(max-width:860px){.sv4-row{grid-template-columns:28px minmax(0,1fr) 84px;row-gap:8px}.sv4-hide{display:none}}
.sv4-face{flex:0 0 132px;width:132px;display:flex;flex-direction:column;gap:9px;cursor:pointer;appearance:none;background:transparent;border:0;padding:0;text-align:left;color:inherit}
.sv4-faces{display:flex;gap:14px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px}
.sv4-cal{display:grid;grid-template-columns:repeat(auto-fill,minmax(268px,1fr));gap:12px}
`;

const sv4Fmt = n => n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "K" : "" + n;

// ─── 03 · Trending studios ──────────────────────────────────────────────
function Sv4Trending() {
  const studios = window.STUDIOS || [];
  const creators = window.CREATORS || [];
  const [scope, setScope] = usSV4("all");

  const rows = umSV4(() => {
    const a = studios.map(s => ({
      id: s.id, name: s.name, kind: "COLLECTIVE", color: s.color,
      subs: s.subs || 0, mrr: s.mrr || 0, growth: s.growth30d || 0,
      spark: s.monthlyRevenue || null, to: `/studios/${s.id}`,
    }));
    const b = creators.map((c, i) => ({
      id: c.id, name: c.name, kind: "SOLO", color: c.color,
      subs: Math.round((c.followers || 0) * 0.04), mrr: Math.round((c.followers || 0) * 0.04 * (c.sub || 4.99)),
      growth: 4 + ((String(c.id).charCodeAt(0) + i * 7) % 22), spark: null, to: `/studios/${c.id}`,
    }));
    const list = scope === "collectives" ? a : scope === "solo" ? b : [...a, ...b];
    return list.sort((x, y) => y.growth - x.growth).slice(0, 10);
  }, [scope, studios, creators]);

  return (
    <section style={{ marginBottom: 54 }}>
      <div className="sv4-band">
        <span className="sv4-band__n">03 · TRENDING</span>
        <span className="sv4-band__s">RANKED BY 30-DAY SUBSCRIBER GROWTH</span>
        <span style={{ flex: 1 }}/>
        <div style={{ display: "flex", gap: 6 }}>
          {[["all", "ALL"], ["collectives", "COLLECTIVES"], ["solo", "SOLO"]].map(([k, l]) => (
            <button key={k} onClick={() => setScope(k)} style={{
              appearance: "none", cursor: "pointer", borderRadius: 999, padding: "5px 12px",
              border: `1px solid ${scope === k ? "rgba(var(--accent-rgb),.4)" : "var(--c-line-2)"}`,
              background: scope === k ? "rgba(var(--accent-rgb),.1)" : "transparent",
              color: scope === k ? "var(--c-amber)" : "var(--c-ink-3)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
            }}>{l}</button>
          ))}
        </div>
      </div>
      <div className="sv4-rows">
        {rows.map((r, i) => (
          <button key={r.kind + r.id} className="sv4-row" onClick={() => navigate(r.to)}>
            <span className="t-mono" style={{ fontSize: "var(--fs-body)", color: i < 3 ? "var(--c-amber)" : "var(--c-ink-4)", fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
              <span style={{ width: 28, height: 28, flex: "0 0 auto", borderRadius: r.kind === "COLLECTIVE" ? 5 : "50%", background: r.color, display: "grid", placeItems: "center", color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)" }}>{r.name[0]}</span>
              <span style={{ minWidth: 0 }}>
                <span className="t-display" style={{ display: "block", fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</span>
                <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginTop: 3 }}>{r.kind}</span>
              </span>
            </span>
            <span className="sv4-hide t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{sv4Fmt(r.subs)}<span style={{ color: "var(--c-ink-4)", fontSize: "var(--fs-label)" }}> SUBS</span></span>
            <span className="sv4-hide t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>${sv4Fmt(r.mrr)}<span style={{ color: "var(--c-ink-4)", fontSize: "var(--fs-label)" }}>/MO</span></span>
            <span className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-good)", fontWeight: 700 }}>+{r.growth.toFixed(1)}%</span>
            <span className="sv4-hide" style={{ display: "flex", justifyContent: "flex-end" }}>
              {r.spark && window.StudioSpark ? <window.StudioSpark data={r.spark} color={r.color} w={100} h={24}/> : <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>VISIT →</span>}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── 05 · Faces across the houses ───────────────────────────────────────
function Sv4Faces() {
  const people = umSV4(() => {
    const src = [];
    if (window.CAST) src.push(...window.CAST);
    if (window.CHARACTERS) src.push(...window.CHARACTERS);
    if (window.ACTORS) src.push(...window.ACTORS);
    const cat = window.CATALOG || [];
    const seen = new Set(), out = [];
    src.forEach(p => {
      const name = p.name || p.actor;
      if (!name || seen.has(name)) return;
      seen.add(name);
      // Sub-label prefers the lead credit, then the archetype.
      const lead = (p.roles || []).find(r => r.lead) || (p.roles || [])[0];
      const leadFilm = lead && cat.find(f => f.id === lead.filmId);
      out.push({
        id: p.id || name.toLowerCase().replace(/\s+/g, "-"),
        name,
        color: (p.palette && p.palette[0]) || p.color || tkc("ink-4"),
        role: leadFilm ? leadFilm.title : (p.archetype || p.role || p.range || "Performer"),
        photo: p.photo || null,
        thumb: p.thumb || p.still || null,
      });
    });
    return out.slice(0, 14);
  }, []);
  if (!people.length) return null;
  return (
    <section style={{ marginBottom: 54 }}>
      <div className="sv4-band">
        <span className="sv4-band__n">05 · FACES</span>
        <span className="sv4-band__s">PERFORMERS WORKING ACROSS THESE HOUSES</span>
        <span style={{ flex: 1 }}/>
        <button className="btn-ghost" onClick={() => navigate("/cast")} style={{ height: 26, padding: "0 11px", fontSize: "var(--fs-label)" }}>Full cast →</button>
      </div>
      <div className="sv4-faces">
        {people.map(p => (
          <button key={p.id} className="sv4-face" onClick={() => navigate(`/talent/${p.id}`)}>
            <span style={{ position: "relative", display: "block", aspectRatio: "3/4", borderRadius: "var(--r-2)", overflow: "hidden", background: `linear-gradient(150deg, ${p.color}, ${tkc("void")})`, border: "1px solid var(--c-line-2)" }}>
              {p.photo
                ? <img src={p.photo} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
                : p.thumb && window.FrameThumb ? <FrameThumb kind={p.thumb} usePhoto/> : null}
              <span style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.7), transparent 55%)" }}/>
            </span>
            <span style={{ display: "block" }}>
              <span style={{ display: "block", fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
              <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textTransform: "uppercase" }}>{p.role}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── 06 · Release calendar ──────────────────────────────────────────────
function Sv4Releases() {
  const studios = window.STUDIOS || [];
  const creators = window.CREATORS || [];
  const items = umSV4(() => {
    const out = [];
    studios.forEach(s => (s.upcoming || []).forEach(u => {
      const c = creators.find(x => x.id === u.creatorId);
      out.push({ ...u, studio: s.name, studioId: s.id, color: s.color, director: c?.name || "" });
    }));
    return out.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 9);
  }, [studios, creators]);
  if (!items.length) return null;
  const fmt = d => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
  return (
    <section style={{ marginBottom: 20 }}>
      <div className="sv4-band">
        <span className="sv4-band__n">06 · RELEASES</span>
        <span className="sv4-band__s">WHAT THE HOUSES SHIP NEXT</span>
      </div>
      <div className="sv4-cal">
        {items.map((u, i) => (
          <button key={u.studioId + u.id + i} onClick={() => navigate(`/studios/${u.studioId}`)} style={{
            appearance: "none", cursor: "pointer", textAlign: "left", color: "inherit",
            padding: 15, borderRadius: "var(--r-2)", background: "var(--c-panel)",
            border: "1px solid var(--c-line)", borderLeft: `2px solid ${u.color}`,
            display: "flex", flexDirection: "column", gap: 9,
          }}>
            <span style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", fontWeight: 700 }}>{fmt(u.date)}</span>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>{(u.kind || "film").toUpperCase()}</span>
            </span>
            <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.08, color: "var(--c-ink)" }}>{u.title}</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textTransform: "uppercase" }}>
              {[u.studio, u.director].filter(Boolean).join(" · ")}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── Page: v3 + the new bands ───────────────────────────────────────────
function StudiosDirectoryV4() {
  const V3 = window.StudiosDirectoryV3;
  return (
    <div data-screen-label="Studios">
      <style>{SV4_CSS}</style>
      {V3 ? <V3/> : null}
      <div className="sv4-wrap">
        <Sv4Trending/>
        {window.StudioTokenMarketplace ? (
          <section style={{ marginBottom: 54 }}>
            <div className="sv4-band">
              <span className="sv4-band__n">04 · STUDIO NFTS</span>
              <span className="sv4-band__s">EQUITY IN THE HOUSE — TRADED ON BASE</span>
            </div>
            <window.StudioTokenMarketplace/>
          </section>
        ) : null}
        <Sv4Faces/>
        <Sv4Releases/>
      </div>
    </div>
  );
}

Object.assign(window, { StudiosIndexPage: StudiosDirectoryV4 });
