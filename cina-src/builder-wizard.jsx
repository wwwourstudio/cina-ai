// builder-wizard.jsx — Cina guided site builder (walkthrough lightbox).
//
// A simulated conversation with Cina that reads the studio's real account
// (films in CATALOG, followers, the creator's palette) and, from a few
// taps — vibe, palette, which films to feature — GENERATES a complete page
// (theme + ordered sections) and applies it to the builder canvas.
//
// Loads AFTER builder-app.jsx. Exports window.CinaSiteWizard and is
// rendered by StudioBuilder. Auto-opens once for first-time studios.

const { useState: uswz, useEffect: uewz, useRef: urwz, useMemo: umwz } = React;

// ─── Palette presets — mirror the theme inspector, with a display name ───
const WZ_PALETTES = [
  { id: "darkroom", name: "Darkroom",  ...CINA_TOKENS.SITE.themes.darkroom, mood: "Warm, low-lit, cinematic" },
  { id: "atlas",    name: "Atlas",     ...CINA_TOKENS.SITE.themes.atlas, mood: "Cool, clean, documentary" },
  { id: "basement", name: "Basement",  ...CINA_TOKENS.SITE.themes.basement, mood: "Stark black, oxblood, brutal" },
  { id: "tape",     name: "Tape",      ...CINA_TOKENS.SITE.themes.tape, mood: "Neon, VHS, after-hours" },
  { id: "plains",   name: "Plains",    ...CINA_TOKENS.SITE.themes.plains, mood: "Golden, wide, elegiac" },
  { id: "kitchen",  name: "Kitchen",   ...CINA_TOKENS.SITE.themes.kitchen, mood: "Bright, editorial, paper-white" },
];

// ─── Vibes — set the hero copy + which hero background reads right ───────
const WZ_VIBES = [
  { id: "noir",     label: "Noir & slow",     kicker: "DARKROOM FILMS",   sub: "Long stares. One safelight. Films that take their time.", bg: "noir-rain",  palette: "darkroom" },
  { id: "genre",    label: "Genre with grit", kicker: "GENRE, WITH GRIT", sub: "Tense, kinetic, built to be watched twice.",              bg: "smoke",      palette: "atlas" },
  { id: "arthouse", label: "Arthouse",        kicker: "INDEPENDENT CINEMA", sub: "Quiet pictures about people, made without permission.", bg: "dawn",       palette: "plains" },
  { id: "neon",     label: "Neon & now",      kicker: "AFTER HOURS",      sub: "Loud, luminous, unmistakably now.",                       bg: "neon",       palette: "tape" },
];

// ─── Section blocks the studio can include ───────────────────────────────
const WZ_BLOCKS = [
  { id: "featured",       label: "Featured film",  desc: "One headline title, big",       on: true },
  { id: "films",          label: "Films grid",     desc: "Your whole catalog",            on: true },
  { id: "trailers-shelf", label: "Trailers",       desc: "Cuts under 90 seconds",         on: true },
  { id: "branched-shelf", label: "Branched films", desc: "Choose-your-own-adventure",     on: false },
  { id: "about",          label: "About",          desc: "Who you are, in prose",         on: true },
  { id: "blog",           label: "Notebook",       desc: "Posts + production diary",      on: false },
  { id: "holders",        label: "Producers",      desc: "NFT holders / cap table",       on: false },
  { id: "contact",        label: "Contact",        desc: "Email + a note form",           on: true },
];

function wzFilms(creator) {
  const all = (window.CATALOG || []).filter(f => f.creatorId === (creator && creator.id));
  return all.length ? all : (window.CATALOG || []).slice(0, 6);
}

// Build the full section array from the wizard's answers.
function wzGenerate({ vibe, palette, blocks, filmIds, creator, studioName, tagline }) {
  const films = wzFilms(creator);
  const featured = filmIds[0] || (films[0] && films[0].id) || "ll";
  const sections = [];
  sections.push({ id: "wz-hero", type: "hero-parallax", animate: "fade-up", title: "Home", inMenu: false,
    props: { kicker: vibe.kicker, title: (studioName || "Studio").replace(/\s*Studio$/i, ""),
      sub: tagline || vibe.sub, bgImage: vibe.bg, overlay: 0.6, parallax: 0.4,
      cta: { label: "Watch the work", href: "#films" } } });
  sections.push({ id: "wz-marquee", type: "marquee", animate: "fade-in",
    props: { text: (films.map(f => (f.title || "").toUpperCase()).slice(0, 4).join("  ·  ") || "NOW SHOWING") + "  ·  NEW WORK" } });
  if (blocks.includes("featured"))
    sections.push({ id: "wz-featured", type: "featured", animate: "fade-up", title: "Featured", inMenu: true, props: { filmId: featured } });
  if (blocks.includes("films"))
    sections.push({ id: "wz-films", type: "films", animate: "fade-up", title: "Films", inMenu: true, props: { creatorId: (creator && creator.id) || "voss", layout: "poster", count: Math.max(2, filmIds.length || films.length) } });
  if (blocks.includes("trailers-shelf"))
    sections.push({ id: "wz-trailers", type: "trailers-shelf", animate: "fade-up", title: "Trailers", inMenu: true, props: { headline: "Trailers · short cuts", count: 4 } });
  if (blocks.includes("branched-shelf"))
    sections.push({ id: "wz-branched", type: "branched-shelf", animate: "fade-up", title: "Branched", inMenu: true, props: { headline: "Branched films · vote at every fork", count: 3 } });
  if (blocks.includes("about"))
    sections.push({ id: "wz-about", type: "about", animate: "fade-up", title: "About", inMenu: true, props: { text: tagline || `${studioName || "This studio"} makes ${vibe.label.toLowerCase()} films — and the occasional experiment. ${films.length} title${films.length === 1 ? "" : "s"} and counting.` } });
  if (blocks.includes("blog"))
    sections.push({ id: "wz-blog", type: "blog", animate: "fade-up", title: "Notebook", inMenu: true, props: { headline: "Notebook", limit: 4 } });
  if (blocks.includes("holders"))
    sections.push({ id: "wz-holders", type: "holders", animate: "fade-up", title: "Producers", inMenu: true, props: { headline: "Producers · holders" } });
  if (blocks.includes("contact"))
    sections.push({ id: "wz-contact", type: "contact", animate: "fade-up", title: "Contact", inMenu: true, props: { email: ((creator && creator.id) || "studio") + "@" + ((creator && creator.id) || "voss") + ".cina", agent: "", formEnabled: true, formHeadline: "Send a note", formSubline: "I read everything." } });
  return {
    theme: { bg: palette.bg, ink: palette.ink, accent: palette.accent,
      headlineFont: "display", bodyFont: "sans", fontScale: 1.0, spacing: 1.0, radius: 0,
      grain: palette.id === "kitchen" ? 0.15 : 0.4, columnWidth: 1180 },
    header: { preset: "wordmark-right", sticky: true, transparent: true },
    footer: { preset: "stacked-mono" },
    sections,
  };
}

// ─── Live mini-preview — repaints as answers change ──────────────────
function WzPreview({ vibe, palette, blocks, filmIds, films, studioName, tagline }) {
  const p = palette || WZ_PALETTES[0];
  const label = { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", opacity: 0.55, textTransform: "uppercase" };
  const order = ["featured", "films", "trailers-shelf", "branched-shelf", "about", "blog", "holders", "contact"];
  const chosen = order.filter(b => blocks.includes(b));
  const bar = (w, h, o = 1, c = p.ink) => <div style={{ width: w, height: h, background: c, opacity: o, borderRadius: 1.5 }}></div>;
  return (
    <div style={{ background: p.bg, color: p.ink, borderRadius: "var(--r-2)", overflow: "hidden", border: "1px solid var(--c-line-2)", height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: `1px solid ${p.accent}26`, flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)" }}>{studioName}</span>
        <span style={{ display: "flex", gap: 8 }}>{["FILMS", "ABOUT", "CONTACT"].map(m => <span key={m} style={label}>{m}</span>)}</span>
      </div>
      <div className="sc-scroll" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {/* hero */}
        <div style={{ position: "relative", aspectRatio: "16/8", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 14, overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(150deg, ${p.accent}44, ${p.bg} 80%)` }}></div>
          {films[0] && window.FrameThumb && (
            <div style={{ position: "absolute", inset: 0, opacity: 0.55 }}><FrameThumb kind={(films.find(f => f.id === filmIds[0]) || films[0]).thumb} usePhoto/></div>
          )}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${p.bg}ee, transparent 65%)` }}></div>
          <div style={{ position: "relative" }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: p.accent, marginBottom: 4 }}>{vibe ? vibe.kicker : "YOUR KICKER"}</div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.02, letterSpacing: "-0.02em" }}>{studioName.replace(/\s*Studio$/i, "")}</div>
            <div style={{ fontSize: "var(--fs-label)", opacity: 0.7, marginTop: 4, maxWidth: 220, lineHeight: 1.4 }}>{tagline || (vibe ? vibe.sub : "Pick a vibe — the copy writes itself.")}</div>
          </div>
        </div>
        {/* marquee */}
        <div style={{ borderTop: `1px solid ${p.accent}33`, borderBottom: `1px solid ${p.accent}33`, padding: "5px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: p.accent, paddingLeft: 12 }}>
            {(films.map(f => (f.title || "").toUpperCase()).slice(0, 3).join(" · ") || "NOW SHOWING")} · NEW WORK ·
          </span>
        </div>
        {/* sections */}
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          {chosen.length === 0 && <div style={{ ...label, padding: "14px 0", textAlign: "center" }}>NO SECTIONS SELECTED</div>}
          {chosen.map(b => {
            if (b === "films" || b === "trailers-shelf" || b === "branched-shelf") return (
              <div key={b}>
                <div style={{ ...label, marginBottom: 5 }}>{b === "films" ? "FILMS" : b === "trailers-shelf" ? "TRAILERS" : "BRANCHED"}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
                  {(b === "films" ? (filmIds.length ? filmIds : films.slice(0, 4).map(f => f.id)) : films.slice(0, 4).map(f => f.id)).slice(0, 4).map((fid, i) => {
                    const f = films.find(x => x.id === fid) || films[i];
                    return (
                      <div key={i} style={{ aspectRatio: b === "films" ? "2/3" : "16/10", borderRadius: "var(--r-1)", overflow: "hidden", position: "relative", background: `${p.accent}22` }}>
                        {f && window.FrameThumb && <FrameThumb kind={f.thumb} usePhoto/>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
            if (b === "featured") {
              const f = films.find(x => x.id === filmIds[0]) || films[0];
              return (
                <div key={b} style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1.3, aspectRatio: "16/10", borderRadius: "var(--r-1)", overflow: "hidden", position: "relative", background: `${p.accent}22` }}>{f && window.FrameThumb && <FrameThumb kind={f.thumb} usePhoto/>}</div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 4, paddingBottom: 2 }}>
                    <div style={{ ...label, color: p.accent, opacity: 1 }}>FEATURED</div>
                    <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)" }}>{f ? f.title : "—"}</div>
                    {bar("85%", 3, .35)}{bar("60%", 3, .35)}
                  </div>
                </div>
              );
            }
            return (
              <div key={b} style={{ borderTop: `1px solid ${p.accent}26`, paddingTop: 8 }}>
                <div style={{ ...label, color: p.accent, opacity: 1, marginBottom: 5 }}>{(WZ_BLOCKS.find(x => x.id === b) || {}).label}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>{bar("92%", 3, .3)}{bar("78%", 3, .3)}{b === "contact" ? bar("38%", 8, 1, p.accent) : bar("55%", 3, .3)}</div>
              </div>
            );
          })}
          {/* footer */}
          <div style={{ borderTop: `1px solid ${p.accent}33`, paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={label}>© 2026</span>
            <span style={{ ...label, color: p.accent, opacity: 1 }}>◈ PROFILE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Chat bubble — Cina speaking in the guided build.
function WzBubble({ who, children }) {
  const cina = who === "cina";
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      {cina && (
        <span style={{
          width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 2,
          background: "rgba(var(--accent-rgb),.14)", border: "1px solid rgba(var(--accent-rgb),.45)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          color: "var(--c-amber)", fontSize: "var(--fs-label)",
        }}>✦</span>
      )}
      <div style={{
        padding: "10px 13px", borderRadius: "3px 10px 10px 10px",
        background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
        fontSize: "var(--fs-body)", lineHeight: 1.55, color: "var(--c-ink-2)", maxWidth: 400,
      }}>{children}</div>
    </div>
  );
}

function WzChip({ on, onClick, children, sub }) {  return (
    <button onClick={onClick} style={{
      textAlign: "left", padding: "11px 13px", borderRadius: "var(--r-3)", cursor: "pointer",
      background: on ? "rgba(var(--accent-rgb),.12)" : "var(--c-bg)",
      border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`,
      color: "var(--c-ink)", display: "flex", flexDirection: "column", gap: 2,
    }}>
      <span style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: on ? "var(--c-amber)" : "var(--c-ink)" }}>{children}</span>
      {sub && <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{sub}</span>}
    </button>
  );
}

function CinaSiteWizard({ page, creator, onClose, onApply }) {
  const films = umwz(() => wzFilms(creator), [creator]);
  const followers = (creator && creator.followers) ? (creator.followers >= 1000 ? Math.round(creator.followers / 1000) + "k" : creator.followers) : "84k";
  const [step, setStep] = uswz(0);
  const [vibe, setVibe] = uswz(null);
  const [palette, setPalette] = uswz(null);
  const [blocks, setBlocks] = uswz(() => WZ_BLOCKS.filter(b => b.on).map(b => b.id));
  const [filmIds, setFilmIds] = uswz(() => films.slice(0, Math.min(3, films.length)).map(f => f.id));
  const [tagline, setTagline] = uswz("");
  const [genPct, setGenPct] = uswz(0);
  const scrollRef = urwz(null);

  const studioName = (page && page.studioName) || ((creator && creator.name) || "Studio");

  // When a vibe is chosen, pre-select its matching palette.
  const pickVibe = (v) => { setVibe(v); if (!palette) setPalette(WZ_PALETTES.find(p => p.id === v.palette) || WZ_PALETTES[0]); setStep(2); };
  const toggleBlock = (id) => setBlocks(bs => bs.includes(id) ? bs.filter(x => x !== id) : [...bs, id]);
  const toggleFilm = (id) => setFilmIds(fs => fs.includes(id) ? fs.filter(x => x !== id) : [...fs, id]);

  // Generate + apply on the final step.
  uewz(() => {
    if (step !== 5) return;
    setGenPct(0);
    let raf, start = Date.now();
    const run = () => {
      const p = Math.min(1, (Date.now() - start) / 2200);
      setGenPct(p);
      if (p < 1) raf = requestAnimationFrame(run);
      else {
        const updates = wzGenerate({ vibe, palette, blocks, filmIds, creator, studioName, tagline });
        onApply(updates);
      }
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [step]);

  uewz(() => { const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight; }, [step]);

  const finish = () => { try { localStorage.setItem("cina:builder-wizard-seen", "1"); } catch {} onClose(); };

  const steps = [
    // 0 — intro
    { title: "Let's build your site.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <WzBubble who="cina">Hi — I'm Cina. I already pulled your studio: <b>{studioName}</b>, <b>{films.length} film{films.length === 1 ? "" : "s"}</b>, <b>{followers}</b> followers. I'll turn that into a site in about a minute.</WzBubble>
          <WzBubble who="cina">A few quick questions and I'll design the whole thing from your work — you can tweak anything after.</WzBubble>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {films.slice(0, 5).map(f => (
              <div key={f.id} style={{ width: 62, borderRadius: "var(--r-2)", overflow: "hidden", border: "1px solid var(--c-line-2)" }}>
                <div style={{ aspectRatio: "2/3", position: "relative", background: tkc("bg") }}>
                  {window.FrameThumb && <FrameThumb kind={f.thumb} usePhoto/>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
      cta: "Start", onCta: () => setStep(1) },
    // 1 — vibe
    { title: "What's the vibe?",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <WzBubble who="cina">What should someone feel in the first three seconds?</WzBubble>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {WZ_VIBES.map(v => <WzChip key={v.id} on={vibe && vibe.id === v.id} onClick={() => pickVibe(v)} sub={v.sub}>{v.label}</WzChip>)}
          </div>
        </div>
      ),
      hideCta: true },
    // 2 — palette
    { title: "Pick a palette.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <WzBubble who="cina">{vibe ? `“${vibe.label}” usually reads best in one of these. Tap to preview.` : "Choose the colors."}</WzBubble>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {WZ_PALETTES.map(p => {
              const on = palette && palette.id === p.id;
              return (
                <button key={p.id} onClick={() => setPalette(p)} style={{
                  textAlign: "left", padding: 0, borderRadius: "var(--r-3)", overflow: "hidden", cursor: "pointer",
                  border: `1.5px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`, background: "var(--c-bg)",
                }}>
                  <div style={{ height: 46, background: p.bg, display: "flex", alignItems: "center", gap: 6, padding: "0 12px" }}>
                    <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: p.ink }}>Aa</span>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: p.accent, marginLeft: "auto" }}/>
                  </div>
                  <div style={{ padding: "7px 12px" }}>
                    <div style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: on ? "var(--c-amber)" : "var(--c-ink)" }}>{p.name}</div>
                    <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{p.mood}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ),
      cta: "Next", onCta: () => setStep(3), disabled: () => !palette },
    // 3 — films to feature
    { title: "What should we feature?",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <WzBubble who="cina">These are your films. Pick the ones to spotlight — the first becomes your featured title.</WzBubble>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 8 }}>
            {films.map(f => {
              const on = filmIds.includes(f.id);
              const rank = filmIds.indexOf(f.id);
              return (
                <button key={f.id} onClick={() => toggleFilm(f.id)} style={{
                  padding: 0, borderRadius: "var(--r-2)", overflow: "hidden", cursor: "pointer", position: "relative",
                  border: `1.5px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`, background: tkc("bg"),
                }}>
                  <div style={{ aspectRatio: "2/3", position: "relative" }}>
                    {window.FrameThumb && <FrameThumb kind={f.thumb} usePhoto/>}
                    {on && <span style={{ position: "absolute", top: 5, right: 5, width: 18, height: 18, borderRadius: "50%", background: "var(--c-amber)", color: "var(--c-on-amber)", fontSize: "var(--fs-label)", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{rank === 0 ? "★" : rank + 1}</span>}
                    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px 6px 5px", background: "linear-gradient(transparent, rgba(0,0,0,.85))", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-label)", color: tkc("white"), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.title}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ),
      cta: "Next", onCta: () => setStep(4), disabled: () => filmIds.length === 0 },
    // 4 — sections + tagline
    { title: "What goes on the page?",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <WzBubble who="cina">Here's what I'd include. Toggle anything — I'll order it for you.</WzBubble>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {WZ_BLOCKS.map(b => <WzChip key={b.id} on={blocks.includes(b.id)} onClick={() => toggleBlock(b.id)} sub={b.desc}>{b.label}</WzChip>)}
          </div>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 6 }}>ONE LINE ON WHY YOU MAKE FILMS</div>
            <input value={tagline} onChange={e => setTagline(e.target.value)} placeholder={vibe ? vibe.sub : "Optional — Cina will write one"} style={{
              width: "100%", padding: "10px 12px", background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink)", fontSize: "var(--fs-body)", outline: "none",
            }}/>
          </div>
        </div>
      ),
      cta: "✦ Generate my site", onCta: () => setStep(5), disabled: () => blocks.length === 0 },
    // 5 — generating / done
    { title: genPct < 1 ? "Building your site…" : "Your site is ready.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "10px 0" }}>
          {genPct < 1 ? (
            <>
              <WzBubble who="cina">Laying out {blocks.length} sections in {palette && palette.name} · pulling {filmIds.length} film{filmIds.length === 1 ? "" : "s"} from your catalog…</WzBubble>
              <div style={{ height: 6, borderRadius: "var(--r-1)", background: "var(--c-line)", overflow: "hidden" }}>
                <div style={{ width: `${Math.round(genPct * 100)}%`, height: "100%", background: "var(--c-amber)", transition: "width .1s" }}/>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {["Reading your account", "Choosing type & palette", "Placing your films", "Writing copy", "Wiring the menu"].map((s, i) => {
                  const done = genPct > (i + 1) / 5.5;
                  return <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--fs-body)", color: done ? "var(--c-good)" : "var(--c-ink-4)" }}><span>{done ? "✓" : "○"}</span>{s}</div>;
                })}
              </div>
            </>
          ) : (
            <WzBubble who="cina">Done. I built <b>{blocks.length + 2} sections</b> in <b>{palette && palette.name}</b> around <b>{studioName}</b>. It's on your canvas now — edit anything, then hit Publish.</WzBubble>
          )}
        </div>
      ),
      cta: genPct < 1 ? null : "Open my site →", onCta: finish, hideCta: genPct < 1 },
  ];

  const s = steps[step];
  const disabled = s.disabled ? s.disabled() : false;

  return (
    <div onClick={step === 5 ? undefined : finish} style={{
      position: "fixed", inset: 0, zIndex: 1000, background: "rgba(6,6,9,.85)", backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(960px, 100%)", height: "min(640px, 92vh)", display: "flex",
        background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)", overflow: "hidden",
        boxShadow: "0 40px 120px rgba(0,0,0,.6)",
      }}>
        {/* ── LEFT — conversation ── */}
        <div style={{ flex: 1.15, minWidth: 0, display: "flex", flexDirection: "column", borderRight: "1px solid var(--c-line)" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)" }}>CINA · GUIDED BUILD · {String(step + 1).padStart(2, "0")}/06</div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</div>
            </div>
            <button onClick={finish} title={step === 5 && genPct >= 1 ? "Close" : "Skip the guided build"} style={{
              flexShrink: 0, height: 28, padding: "0 12px", background: "transparent",
              border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink-3)", cursor: "pointer",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase",
            }}>{step === 5 && genPct >= 1 ? "Close" : "Skip"} ✕</button>
          </div>

          <div ref={scrollRef} className="sc-scroll" style={{ flex: 1, overflowY: "auto", padding: 18 }}>{s.body}</div>

          <div style={{ padding: "12px 18px", borderTop: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", gap: 5 }}>
              {steps.map((_, i) => <span key={i} style={{ width: i === step ? 18 : 6, height: 6, borderRadius: "var(--r-1)", background: i === step ? "var(--c-amber)" : i < step ? "rgba(var(--accent-rgb),.45)" : "var(--c-line-3)", transition: "width .2s" }}/>)}
            </div>
            <span style={{ flex: 1 }}/>
            {step > 0 && step < 5 && <button onClick={() => setStep(step - 1)} style={{ height: 32, padding: "0 14px", background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink-2)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase" }}>Back</button>}
            {!s.hideCta && s.cta && (
              <button onClick={s.onCta} disabled={disabled} style={{
                height: 32, padding: "0 18px", borderRadius: "var(--r-2)", border: "none", cursor: disabled ? "default" : "pointer",
                background: disabled ? "var(--c-line-2)" : "var(--c-amber)", color: disabled ? "var(--c-ink-4)" : tkc("on-amber"),
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
              }}>{s.cta}</button>
            )}
          </div>
        </div>

        {/* ── RIGHT — live preview, repaints with every answer ── */}
        <div style={{ flex: 1, minWidth: 0, display: window.innerWidth < 860 ? "none" : "flex", flexDirection: "column", background: `var(--c-void, ${tkc("bg")})`, padding: 14 }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", padding: "0 2px 10px", display: "flex", justifyContent: "space-between" }}>
            <span>LIVE PREVIEW</span>
            <span style={{ color: "var(--c-amber)" }}>{palette ? palette.name.toUpperCase() : "—"}</span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <WzPreview vibe={vibe} palette={palette} blocks={blocks} filmIds={filmIds} films={films} studioName={studioName} tagline={tagline}/>
          </div>
        </div>
      </div>
    </div>
  );
}

window.CinaSiteWizard = CinaSiteWizard;
