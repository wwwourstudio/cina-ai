// watch-studios-v3.jsx — Studios & creators directory, full redesign.
//
// Before: a flat header + two card grids. Now it matches the cinematic
// language of the Films/Series pages: a film-still masthead, a sticky
// filter toolbar, a featured collective marquee, editorial bands for the
// other collectives (backdrop stills, members, revenue trend, next
// premiere), a refined solo-studio grid, and a closing "open your studio"
// band that routes into the page builder.
//
// Loads after watch-content-v4.jsx and re-overrides window.StudiosIndexPage.

const { useState: usSV3, useMemo: umSV3, useEffect: ueSV3, useRef: urSV3 } = React;

const SV3_CSS = `
:root { --sv-gut: clamp(20px, 5vw, 88px); }
.sv-wrap { width: 100%; max-width: none; margin: 0; padding: 0 var(--sv-gut) 110px; }

/* ════ THE CONSOLE — cinematic, full-bleed, dynamic backdrop ════ */
.sv-console {
  position: relative; min-height: clamp(440px, 62vh, 660px);
  display: flex; flex-direction: column; justify-content: flex-end;
  border-bottom: 1px solid var(--c-line); overflow: hidden; background: var(--c-void);
}
.sv-console__bg { position: absolute; inset: 0; }
.sv-console__layer {
  position: absolute; inset: 0; opacity: 0; transition: opacity 1.4s ease;
}
.sv-console__layer > * { position: absolute; inset: 0; width: 100%; height: 100%; }
.sv-console__layer[data-on="1"] { opacity: 1; animation: sv-kenburns 8s ease-out both; }
@keyframes sv-kenburns { from { transform: scale(1.08); } to { transform: scale(1.0); } }
@media (prefers-reduced-motion: reduce) { .sv-console__layer[data-on="1"] { animation: none; } }
.sv-console__scrim {
  position: absolute; inset: 0; pointer-events: none;
  background:
    linear-gradient(to top, var(--c-void) 5%, rgba(7,7,10,.45) 42%, rgba(7,7,10,.2) 72%, rgba(7,7,10,.5) 100%),
    linear-gradient(to right, rgba(7,7,10,.9) 0%, rgba(7,7,10,.4) 56%, rgba(7,7,10,.55) 100%);
}
.sv-console__grain {
  position: absolute; inset: 0; pointer-events: none; opacity: .5; mix-blend-mode: overlay;
  background-image: repeating-linear-gradient(0deg, rgba(255,255,255,.04) 0 1px, transparent 1px 3px);
}
.sv-console__inner { position: relative; padding: clamp(40px,5vw,72px) var(--sv-gut) 0; }
.sv-console__caption {
  position: absolute; bottom: 14px; right: var(--sv-gut); display: flex; align-items: center; gap: 8px;
  font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .14em; color: rgba(255,255,255,.55);
  background: rgba(0,0,0,.4); backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,.12);
  border-radius: 999px; padding: 4px 11px;
}
.sv-eyebrow { font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .28em; color: var(--c-amber); font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 9px; }
.sv-title {
  font-family: var(--f-display); font-style: italic; font-weight: 400;
  font-size: clamp(48px, 7vw, 104px); line-height: .9; letter-spacing: -0.035em;
  margin: 14px 0 0; color: var(--c-ink); text-wrap: balance; text-shadow: 0 2px 30px rgba(0,0,0,.5);
}
.sv-title em { font-style: italic; color: var(--c-amber); }
.sv-lede { font-size:var(--fs-body); color: var(--c-ink-2); max-width: 56ch; line-height: 1.6; margin: 16px 0 0; text-wrap: pretty; }
.sv-ribbon {
  position: relative; display: grid; grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid rgba(255,255,255,.12); margin-top: clamp(26px,3.5vw,40px);
  background: rgba(7,7,10,.55); backdrop-filter: blur(8px);
}
.sv-ribbon__cell { padding: 16px clamp(14px,2.4vw,28px) 18px; border-left: 1px solid rgba(255,255,255,.08); display: flex; flex-direction: column; gap: 6px; }
.sv-ribbon__cell:first-child { border-left: none; }
.sv-ribbon__k { font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .2em; color: var(--c-ink-4); text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
.sv-ribbon__v { font-family: var(--f-display); font-style: italic; font-size: clamp(26px,3.2vw,40px); line-height: 1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; color: var(--c-ink); }
.sv-ribbon__s { font-size:var(--fs-label); color: var(--c-ink-3); }
@media (max-width: 720px) {
  .sv-ribbon { grid-template-columns: repeat(2,1fr); }
  .sv-ribbon__cell:nth-child(n+3) { border-top: 1px solid rgba(255,255,255,.08); }
  .sv-ribbon__cell:nth-child(3) { border-left: none; }
}

/* ════ Sticky filter toolbar ════ */
.sv-toolbar { position: sticky; top: 0; z-index: 40; background: rgba(8,8,10,.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--c-line); }
.sv-toolbar__inner { display: flex; align-items: center; gap: 8px; padding: 11px var(--sv-gut); }

/* ════ Ledger band heads ════ */
.sv-band { display: flex; align-items: baseline; gap: 12px; margin: 0 0 18px; flex-wrap: wrap; }
.sv-band__n { font-family: var(--f-mono); font-size:var(--fs-label); color: var(--c-amber); letter-spacing: .24em; font-weight: 600; white-space: nowrap; }
.sv-band__s { font-family: var(--f-mono); font-size:var(--fs-label); color: var(--c-ink-4); letter-spacing: .14em; }

/* ════ Solo studio grid + card ════ */
.sv-solo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 26px 18px; }
.sv-card {
  border-radius: 0; overflow: visible; border: 0; background: transparent;
  display: flex; flex-direction: column; gap: 11px; cursor: pointer;
  transition: transform .22s cubic-bezier(.2,.7,.2,1);
}
.sv-card:hover { transform: translateY(-4px); }
.sv-card__cover {
  position: relative; width: 100%; height: 176px; overflow: hidden; flex-shrink: 0;
  border-radius: 4px; border: 1px solid var(--c-line-2);
  box-shadow: 0 2px 6px rgba(0,0,0,.35);
  transition: border-color .15s ease, box-shadow .22s ease;
}
.sv-card:hover .sv-card__cover { border-color: var(--c-line-3); box-shadow: 0 18px 38px rgba(0,0,0,.6); }
.sv-card__cover > .sv-card__img { position: absolute; inset: 0; transition: transform .5s cubic-bezier(.2,.7,.2,1); }
.sv-card:hover .sv-card__img { transform: scale(1.06); }
.sv-card__body { padding: 0 2px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
`;

// curated still rotation for the dynamic masthead
const SV3_HERO_IDS = ["swallows", "marauder", "carrion", "salt", "frequency", "kindling"];

function StudiosMasthead({ stats, films }) {
  const [idx, setIdx] = usSV3(0);
  const n = films.length || 1;
  ueSV3(() => {
    if (n < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % n), 5200);
    return () => clearInterval(t);
  }, [n]);
  const current = films[idx];
  return (
    <section className="sv-console" data-screen-label="Studios masthead">
      <div className="sv-console__bg">
        {films.map((f, i) =>
        <div key={f.id} className="sv-console__layer" data-on={i === idx ? "1" : "0"}>
            <FrameThumb kind={f.thumb} usePhoto />
          </div>
        )}
      </div>
      <div className="sv-console__scrim"></div>
      <div className="sv-console__grain"></div>
      {current &&
      <div className="sv-console__caption">
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-amber)", boxShadow: "0 0 6px var(--c-amber)" }}></span>
          STILL · {current.title.toUpperCase()}
        </div>
      }
      <div className="sv-console__inner">
        <div className="sv-eyebrow">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-amber)", boxShadow: "0 0 6px var(--c-amber)" }}></span>
          The Directory
        </div>
        <h1 className="sv-title"><em>Studios.</em></h1>
        <p className="sv-lede">
          Every studio on Cina — six-director collectives and one-person shops alike — runs its own
          site, built in the page builder. This is the index of all of them.
        </p>
        <div className="sv-ribbon">
          {stats.map((p) =>
          <div key={p.k} className="sv-ribbon__cell">
              <span className="sv-ribbon__k"><span style={{ width: 5, height: 5, borderRadius: "50%", background: p.tint || "var(--c-ink-4)" }}></span>{p.k}</span>
              <span className="sv-ribbon__v" style={{ color: p.tint || "var(--c-ink)" }}>{p.v}</span>
              <span className="sv-ribbon__s">{p.s}</span>
            </div>
          )}
        </div>
      </div>
    </section>);

}

const sv3Fmt = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "K" : "" + n;
const sv3FilmsBy = (cid) => (window.CATALOG || []).filter((f) => f.creatorId === cid);
const sv3Slate = (s) => (s.members || []).flatMap(sv3FilmsBy);
const sv3Dest = (f) => f.branched ? `/branches/${f.id}` : f.kind === "series" ? `/series/${f.id}` : `/film/${f.id}`;

function sv3NextPremiere(s) {
  const up = (s.upcoming || []).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  return up[0] || null;
}

// ─── Tiny revenue sparkline ───────────────────────────────────────────────
function StudioSpark({ data, color, w = 92, h = 26 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data),max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = i / (data.length - 1) * (w - 2) + 1;
    const y = h - 2 - (v - min) / (max - min || 1) * (h - 5);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts.split(" ").pop().split(",")[0]} cy={pts.split(" ").pop().split(",")[1]} r="2.2" fill={color} />
    </svg>);

}

// ─── Collective card — same language as SoloStudioCard, multi-director ────
function CollectiveCard({ s, featured }) {
  const creators = window.CREATORS || [];
  const memberCreators = (s.members || []).map((id) => creators.find((c) => c.id === id)).filter(Boolean);
  const slate = umSV3(() => {
    const seen = new Set();
    return sv3Slate(s).filter((f) => { if (seen.has(f.thumb)) return false; seen.add(f.thumb); return true; });
  }, [s.id]);
  const lead = slate[0];
  const next = sv3NextPremiere(s);
  const subbed = (window.USER_STUDIO_SUBS || []).includes(s.id);
  const monthly = (s.plans || []).find((p) => p.id === "monthly") || (s.plans || [])[0];
  const price = (monthly && monthly.price) || 4.99;
  const go = () => navigate(`/creator/${s.leadId || (s.members || [])[0]}`);
  const subscribe = (e) => { e.stopPropagation(); window.openPay && window.openPay({
    kind: "sub", title: `${s.name} · ${monthly ? monthly.name : "Monthly"}`, subtitle: "Cancel anytime",
    priceUSD: price, cadence: "/mo", accent: s.color
  }); };

  return (
    <div className="sv-card" data-screen-label={`Studios · ${s.name}`} onClick={go} title={`${s.name} · collective`}>
      {/* Film-still header */}
      <div className="sv-card__cover" style={{ background: s.bg || s.color }}>
        <div className="sv-card__img">
          {lead ?
          <FrameThumb kind={lead.thumb} usePhoto /> :
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${s.color}, ${tkc("void")})` }}></div>}
        </div>
        <span style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,10,.97) 2%, rgba(8,8,10,.18) 52%, transparent 100%)" }}></span>

        {/* badges top row */}
        <div style={{ position: "absolute", top: 11, left: 11, right: 11, display: "flex", alignItems: "center", gap: 6 }}>
          <span className="t-mono" style={{
            fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.92)",
            background: "rgba(0,0,0,.5)", backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,.14)", borderRadius: 999, padding: "3px 9px"
          }}>◇ COLLECTIVE · {(s.members || []).length}</span>
          <span style={{ flex: 1 }}></span>
          {featured &&
          <span className="t-mono" style={{
            fontSize: "var(--fs-label)", letterSpacing: ".16em", color: tkc("panel"), fontWeight: 700,
            background: s.accent && s.accent !== tkc("line-2") ? s.accent: tkc("amber"),
            borderRadius: 999, padding: "3px 9px"
          }}>★ FASTEST-GROWING</span>}
        </div>

        {lead &&
        <span className="t-mono" style={{
          position: "absolute", left: 14, bottom: 12, fontSize: "var(--fs-label)", letterSpacing: ".16em",
          color: "rgba(255,255,255,.72)"
        }}>FROM “{lead.title.toUpperCase()}”</span>}
      </div>

      {/* Body */}
      <div style={{ padding: "0 2px", display: "flex", flexDirection: "column", gap: 11, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            width: 42, height: 42, borderRadius: "var(--r-2)", background: s.color, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)",
            border: "1px solid rgba(255,255,255,.16)"
          }}>{s.name[0]}</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
              {s.verified &&
              <span title="Verified studio" style={{
                width: 15, height: 15, borderRadius: "50%", flexShrink: 0,
                background: tkc("cat-1"), color: tkc("panel"), fontSize: "var(--fs-label)", fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>✓</span>}
            </div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              SINCE {(s.founded || "").split("-")[0]} · {sv3Fmt(s.subs || 0)} SUBS
            </div>
          </div>
        </div>

        <div className="t-display" style={{
          fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.22, letterSpacing: "-0.01em", color: "var(--c-ink)",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 42
        }}>{s.tagline}</div>

        {/* Member avatar strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex" }}>
            {memberCreators.slice(0, 5).map((c, k) =>
              <span key={c.id} title={c.name} style={{
                width: 26, height: 26, borderRadius: "50%", background: c.color, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-label)",
                border: "2px solid var(--c-panel)", marginLeft: k ? -9 : 0, position: "relative", zIndex: 5 - k
              }}>{c.name.split(" ").map((p) => p[0]).join("")}</span>
            )}
          </div>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
            {memberCreators.length} DIRECTORS
          </span>
          <span style={{ flex: 1 }}></span>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".08em", fontWeight: 600 }}>▲ +{s.growth30d}%</span>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--c-line)" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            {next ?
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              NEXT · <span style={{ color: "var(--c-ink)", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", letterSpacing: 0 }}>{next.title}</span>
            </div> :
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{slate.length} TITLES</div>}
          </div>
          <button className="btn" style={{ height: 30, fontSize: "var(--fs-label)", flexShrink: 0 }} onClick={subscribe}>
            {subbed ? "Manage" : `$${price.toFixed(2)}/mo`}
          </button>
          <button className="btn btn-primary" style={{ height: 30, fontSize: "var(--fs-label)", flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); go(); }}>
            Visit →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Solo studio card — refined, full-bleed grid ──────────────────────────
function SoloStudioCard({ c }) {
  // Dedupe by thumbnail so the strip never shows the same still twice.
  const films = umSV3(() => {
    const seen = new Set();
    return sv3FilmsBy(c.id).filter((f) => {if (seen.has(f.thumb)) return false;seen.add(f.thumb);return true;});
  }, [c.id]);
  const lead = films[0];
  const go = () => navigate(`/creator/${c.id}`);
  const verified = c.verified != null ? c.verified : (c.followers || 0) >= 100000;
  return (
    <div className="sv-card" onClick={go} title={`${c.name} · studio`}>
      {/* Film-still header */}
      <div className="sv-card__cover" style={{ background: c.bg || c.color }}>
        <div className="sv-card__img">
          {lead ?
          <FrameThumb kind={lead.thumb} usePhoto /> :
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${c.color}, ${tkc("void")})` }}></div>}
        </div>
        <span style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,10,.97) 2%, rgba(8,8,10,.18) 52%, transparent 100%)" }}></span>

        {/* Title count */}
        <span className="t-mono" style={{
          position: "absolute", top: 11, left: 11, fontSize: "var(--fs-label)", letterSpacing: ".16em",
          color: "rgba(255,255,255,.9)", background: "rgba(0,0,0,.5)", backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,.14)", borderRadius: 999, padding: "3px 9px"
        }}>▶ {films.length} {films.length === 1 ? "TITLE" : "TITLES"}</span>

        {/* Lead-title caption */}
        {lead &&
        <span className="t-mono" style={{
          position: "absolute", left: 14, bottom: 12, fontSize: "var(--fs-label)", letterSpacing: ".16em",
          color: "rgba(255,255,255,.72)"
        }}>FROM “{lead.title.toUpperCase()}”</span>
        }
      </div>

      {/* Body */}
      <div style={{ padding: "0 2px", display: "flex", flexDirection: "column", gap: 11, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            width: 42, height: 42, borderRadius: "50%", background: c.color, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)",
            border: "1px solid rgba(255,255,255,.16)"
          }}>{c.name.split(" ").map((p) => p[0]).join("")}</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
              {verified &&
              <span title="Verified studio" style={{
                width: 15, height: 15, borderRadius: "50%", flexShrink: 0,
                background: tkc("cat-1"), color: tkc("panel"), fontSize: "var(--fs-label)", fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>✓</span>
              }
            </div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {(c.handle || "").toUpperCase()} · {sv3Fmt(c.followers)} FOLLOWERS
            </div>
          </div>
        </div>

        <div style={{
          fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5, textWrap: "pretty",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden", minHeight: 39
        }}>{c.tagline || c.bio}</div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--c-line)" }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", display: "inline-flex", alignItems: "center", gap: 5, minWidth: 0, overflow: "hidden" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-good)", flexShrink: 0 }}></span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.domain}</span>
          </span>
          <span style={{ flex: 1 }}></span>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", whiteSpace: "nowrap" }}>${(c.sub || 4.99).toFixed(2)}<span style={{ color: "var(--c-ink-4)" }}>/MO</span></span>
          <button className="btn btn-primary" style={{ height: 32, fontSize: "var(--fs-body)" }} onClick={(e) => {e.stopPropagation();go();}}>Visit studio →</button>
        </div>
      </div>
    </div>);

}

// ─── The page ─────────────────────────────────────────────────────────────
function StudiosDirectoryV3() {
  const studios = window.STUDIOS || [];
  const creators = window.CREATORS || [];
  const [tab, setTab] = usSV3("all");

  // Featured = fastest-growing collective; the rest follow as bands.
  const sorted = umSV3(() => [...studios].sort((a, b) => (b.growth30d || 0) - (a.growth30d || 0)), [studios]);
  const featured = sorted[0];

  const totalSubs = studios.reduce((s, x) => s + (x.subs || 0), 0) + creators.reduce((s, c) => s + Math.round((c.followers || 0) * 0.04), 0);
  const totalMRR = studios.reduce((s, x) => s + (x.mrr || 0), 0);

  const stats = [
  { k: "Collectives", v: String(studios.length), s: "director-owned houses", tint: "var(--c-amber)" },
  { k: "Solo studios", v: String(creators.length), s: "one-person shops", tint: "var(--c-ink)" },
  { k: "Subscribers", v: sv3Fmt(totalSubs), s: "across every site", tint: tkc("cat-1") },
  { k: "Paid to filmmakers", v: "$" + sv3Fmt(totalMRR), s: "per month, direct", tint: "var(--c-good)" }];

  // Dynamic masthead rotation — strong stills, deduped, in CATALOG order.
  const heroFilms = umSV3(() => {
    const cat = window.CATALOG || [];
    const pick = SV3_HERO_IDS.map((id) => cat.find((f) => f.id === id)).filter(Boolean);
    const list = pick.length >= 2 ? pick : cat.slice(0, 6);
    const seen = new Set();
    return list.filter((f) => {if (seen.has(f.thumb)) return false;seen.add(f.thumb);return true;});
  }, []);

  return (
    <div data-screen-label="Studios" style={{ background: "var(--c-bg)" }}>
      <style>{SV3_CSS}</style>

      {/* ── Dynamic cinematic masthead ── */}
      <StudiosMasthead stats={stats} films={heroFilms} />

      {/* ── Sticky filter toolbar ── */}
      <div className="sv-toolbar">
        <div className="sv-toolbar__inner">
          {[["all", "ALL"], ["collectives", "COLLECTIVES"], ["solo", "SOLO STUDIOS"]].map(([id, label]) =>
          <button key={id} onClick={() => setTab(id)} style={{
            appearance: "none", cursor: "pointer", borderRadius: 999, padding: "6px 14px",
            border: `1px solid ${tab === id ? "rgba(var(--accent-rgb),.4)" : "var(--c-line-2)"}`,
            background: tab === id ? "rgba(var(--accent-rgb),.1)" : "transparent",
            color: tab === id ? "var(--c-amber)" : "var(--c-ink-3)",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em", fontWeight: 600
          }}>{label}</button>
          )}
          <span style={{ flex: 1 }}></span>
          <span className="t-mono sv-toolbar__note" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", whiteSpace: "nowrap" }}>EVERY ONE HAS ITS OWN SITE</span>
        </div>
      </div>

      <div className="sv-wrap" style={{ paddingTop: "clamp(30px,4vw,44px)", padding: "44px 77px" }}>
        {/* ── Collectives ── */}
        {(tab === "all" || tab === "collectives") && studios.length > 0 &&
        <section style={{ marginBottom: 52 }}>
            <div className="sv-band">
              <span className="sv-band__n">01 · COLLECTIVES</span>
              <span className="sv-band__s">{studios.length} STUDIOS · REVENUE SPLIT BY AGREEMENT</span>
            </div>
            <div className="sv-solo-grid">
              {sorted.map((s) => <CollectiveCard key={s.id} s={s} featured={featured && s.id === featured.id} />)}
            </div>
          </section>
        }

        {/* ── Solo studios ── */}
        {(tab === "all" || tab === "solo") &&
        <section>
            <div className="sv-band">
              <span className="sv-band__n">{tab === "solo" ? "01" : "02"} · SOLO STUDIOS</span>
              <span className="sv-band__s">{creators.length} SOLO STUDIOS · ONE-PERSON SHOPS</span>
            </div>
            <div className="sv-solo-grid">
              {creators.map((c) => <SoloStudioCard key={c.id} c={c} />)}
            </div>
          </section>
        }

        {/* ── Open your studio ── */}
        <section style={{
          marginTop: 52, borderRadius: "var(--r-3)", border: "1px solid var(--c-line)",
          background: "linear-gradient(120deg, rgba(var(--accent-rgb),.08) 0%, var(--c-panel) 55%)",
          padding: "clamp(28px,3.5vw,40px) clamp(24px,3vw,44px)",
          display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap"
        }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 10, fontWeight: 600 }}>FOR FILMMAKERS</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "clamp(26px,3vw,34px)", letterSpacing: "-0.01em", lineHeight: 1.08, marginBottom: 8 }}>Open your own studio.</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55, maxWidth: "56ch" }}>
              A site in the page builder, a subscription you price yourself, and a revenue split you
              control. Solo, or invite your collective.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" style={{ height: 40, fontSize: "var(--fs-body)" }} onClick={() => navigate("/build")}>Open the builder →</button>
          </div>
        </section>
      </div>
    </div>);

}

Object.assign(window, { StudiosIndexPage: StudiosDirectoryV3, StudiosDirectoryV3, StudioSpark });