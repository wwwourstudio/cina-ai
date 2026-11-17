// builder-templates.jsx — Section Templates + publish flow + canvas scaler.
//
// Loads AFTER builder-app.jsx + builder-v3-inspector.jsx. Reads the
// window globals the builder exports (BLOCK_LIBRARY_V2, BG_IMAGES) and hands
// chosen specs back through callbacks — the builder still owns insertion +
// defaultPropsV2, so nothing here duplicates default content.
//
// Exports on window:
//   InsertOverlayV3  — the rich "Add" picker (Sections · Page templates · Saved)
//   GoLiveModal      — publish / go-live confirmation
//   WBScaler         — fixed-design-width canvas that scales to fit its column
//   BlockThumb       — schematic preview of a block type
//   CATS_ORDER_V3    — category order incl. Media
//   wbSaveSection / wbDeleteSavedSection / WB_PAGE_TEMPLATES / variantsForV3

const { useState: usBT, useMemo: umBT, useEffect: ueBT, useRef: urBT } = React;

window.CATS_ORDER_V3 = ["Heroes", "Media", "Story", "Catalog", "Community", "Commerce", "Tail"];

// ─── Saved-section storage ───────────────────────────────────────────────
const SAVED_LS = "cina:builder-saved-sections-v1";
function loadSavedSections() {
  try { const v = JSON.parse(localStorage.getItem(SAVED_LS) || "[]"); return Array.isArray(v) ? v : []; } catch { return []; }
}
function persistSavedSections(list) {
  try { localStorage.setItem(SAVED_LS, JSON.stringify(list)); } catch {}
}
// Snapshot a live section into a reusable template (strips id, keeps look + content).
window.wbSaveSection = function (section, label) {
  const list = loadSavedSections();
  const meta = (window.BLOCK_LIBRARY_V2 || []).find(b => b.type === section.type);
  const entry = {
    sid: "tpl" + Math.random().toString(36).slice(2, 8),
    type: section.type,
    name: label || section.title || meta?.name || section.type,
    savedAt: Date.now(),
    spec: {
      type: section.type,
      title: section.title || "",
      inMenu: !!section.inMenu,
      animate: section.animate || "fade-up",
      width: section.width || "container",
      pad: section.pad || "normal",
      margin: section.margin || "none",
      props: JSON.parse(JSON.stringify(section.props || {})),
    },
  };
  const next = [entry, ...list].slice(0, 40);
  persistSavedSections(next);
  if (window.toast) window.toast({ title: "SAVED", text: `"${entry.name}" → your section templates`, kind: "good" });
  window.dispatchEvent(new Event("cina:saved-sections-changed"));
  return entry;
};
window.wbDeleteSavedSection = function (sid) {
  persistSavedSections(loadSavedSections().filter(e => e.sid !== sid));
  window.dispatchEvent(new Event("cina:saved-sections-changed"));
};

// ─── Per-block variants ───────────────────────────────────────────────────
// Each returns { metaPatch, propsPatch } merged onto the block's defaults.
// Every option maps to a prop the renderer actually honours:
//   _bgTone (wash/panel/deep) · width/pad · bgImage/overlay · layout · speed
function variantsForV3(type) {
  const base = [
    { id: "default", name: "Clean", desc: "On the page background", metaPatch: {}, propsPatch: {} },
    { id: "panel",   name: "On a panel", desc: "Raised, hairline-bordered panel", metaPatch: { pad: "normal" }, propsPatch: { _bgTone: "panel" } },
    { id: "deep",    name: "Full-bleed", desc: "Darker, edge-to-edge, roomy", metaPatch: { width: "full", pad: "spacious" }, propsPatch: { _bgTone: "deep" } },
  ];
  const extra = {
    "hero-parallax": [
      { id: "noir",     name: "Noir · rain",    desc: "Cold blue-black backdrop", metaPatch: {}, propsPatch: { bgImage: "noir-rain", overlay: 0.6 } },
      { id: "sodium",   name: "Sodium · dusk",  desc: "Warm streetlight glow",    metaPatch: {}, propsPatch: { bgImage: "sodium", overlay: 0.5 } },
      { id: "darkroom", name: "Darkroom · red", desc: "Deep safelight wash",      metaPatch: {}, propsPatch: { bgImage: "darkroom", overlay: 0.55 } },
    ],
    "hero-split": [
      { id: "noir",   name: "Noir frame",  desc: "Cold blue-black still", metaPatch: {}, propsPatch: { bgImage: "noir-rain" } },
      { id: "desert", name: "Desert gold", desc: "Warm gold-hour still",  metaPatch: {}, propsPatch: { bgImage: "desert" } },
    ],
    hero: [
      { id: "roomy",   name: "Centered · roomy", desc: "Generous vertical space",  metaPatch: { pad: "spacious", width: "container" }, propsPatch: {} },
      { id: "band",    name: "Deep band",        desc: "Full-bleed, darker stage", metaPatch: { pad: "spacious", width: "full" }, propsPatch: { _bgTone: "deep" } },
    ],
    "hero-video": [
      { id: "band", name: "Deep band", desc: "Full-bleed cinematic stage", metaPatch: { pad: "spacious", width: "full" }, propsPatch: { _bgTone: "deep" } },
    ],
    store: [
      { id: "grid", name: "3-up grid", desc: "Three large product cards", metaPatch: {}, propsPatch: { layout: "grid" } },
      { id: "row",  name: "4-up row",  desc: "Tighter product row",       metaPatch: { width: "wide" }, propsPatch: { layout: "row" } },
    ],
    films: [
      { id: "poster",  name: "Caption below", desc: "Clean poster, title beneath", metaPatch: {}, propsPatch: { layout: "poster" } },
      { id: "overlay",  name: "Title on image", desc: "Poster with overlaid title", metaPatch: {}, propsPatch: { layout: "overlay" } },
      { id: "list",  name: "Filmography",   desc: "Horizontal list rows", metaPatch: { width: "container" }, propsPatch: { layout: "list" } },
    ],
    marquee: [
      { id: "slow", name: "Slow drift", desc: "Calm 30s loop",   metaPatch: {}, propsPatch: { speed: 30 } },
      { id: "fast", name: "Urgent",     desc: "Quick 12s loop",  metaPatch: {}, propsPatch: { speed: 12 } },
    ],
    gallery: [
      { id: "six",    name: "6 stills",      desc: "A tight contact sheet",   metaPatch: {}, propsPatch: { count: 6 } },
      { id: "nine",   name: "9 stills",      desc: "A fuller mosaic",         metaPatch: {}, propsPatch: { count: 9 } },
      { id: "twelve", name: "12 · wide wall", desc: "Edge-to-edge frame wall", metaPatch: { width: "wide" }, propsPatch: { count: 12 } },
    ],
    about: [
      { id: "column",    name: "Reading column", desc: "Narrow, book-like measure", metaPatch: { width: "container", pad: "normal" }, propsPatch: {} },
      { id: "manifesto", name: "Wide manifesto",  desc: "Big type, room to breathe",  metaPatch: { width: "wide", pad: "spacious" }, propsPatch: { _bgTone: "deep" } },
    ],
    featured: [
      { id: "standard", name: "Standard",   desc: "Image + copy, on the page", metaPatch: {}, propsPatch: {} },
      { id: "bleed",    name: "Full-bleed", desc: "Edge-to-edge headline piece", metaPatch: { width: "full", pad: "spacious" }, propsPatch: { _bgTone: "deep" } },
    ],
    newsletter: [
      { id: "boxed", name: "Boxed",      desc: "Raised panel, contained", metaPatch: { pad: "normal" }, propsPatch: { _bgTone: "panel" } },
      { id: "band",  name: "Full band",  desc: "Edge-to-edge dark band",  metaPatch: { width: "full", pad: "spacious" }, propsPatch: { _bgTone: "deep" } },
    ],
    stats: [
      { id: "band", name: "Full-bleed band", desc: "Numbers across a dark band", metaPatch: { width: "full" }, propsPatch: { _bgTone: "deep" } },
    ],
    "actor-vault": [
      { id: "wide", name: "Wide wall", desc: "More faces per row", metaPatch: { width: "wide" }, propsPatch: {} },
    ],
    press: [
      { id: "panel", name: "On a panel", desc: "Quotes on a raised card", metaPatch: { pad: "normal" }, propsPatch: { _bgTone: "panel" } },
    ],
  };
  if (extra[type]) return [...base.slice(0, 1), ...extra[type], ...base.slice(1)];
  return base;
}
window.variantsForV3 = variantsForV3;

// ─── Starter page templates ────────────────────────────────────────────────
const PAGE_TEMPLATES = [
  { id: "film-first", name: "Film-first", tag: "DIRECTOR",
    blurb: "A cinematic parallax hero leads straight into the work. For a director with a strong slate.",
    specs: [
      { type: "hero-parallax", title: "Home", props: { kicker: "STUDIO", sub: "One line on why you make films.", bgImage: "noir-rain", overlay: 0.6 } },
      { type: "marquee", props: { text: "NEW WORK · NOW SHOWING · COMING SOON" } },
      { type: "featured", title: "Featured" },
      { type: "films", title: "Films", inMenu: true },
      { type: "branched-shelf", title: "Branched", inMenu: true },
      { type: "about", title: "About", inMenu: true },
      { type: "contact", title: "Contact", inMenu: true },
      { type: "footer" },
    ] },
  { id: "minimal", name: "Minimal portfolio", tag: "QUIET",
    blurb: "Strip it back — a typographic hero, the films, a short note. Lets the work speak.",
    specs: [
      { type: "hero", title: "Home", props: { sub: "A studio of few films, made slowly." } },
      { type: "films", title: "Films", inMenu: true },
      { type: "about", title: "About", inMenu: true },
      { type: "contact", title: "Contact", inMenu: true },
      { type: "footer" },
    ] },
  { id: "series", name: "Series hub", tag: "EPISODIC",
    blurb: "Built around an ongoing show — video hero, episode list, drop schedule, notebook.",
    specs: [
      { type: "hero-video", title: "Home" },
      { type: "episodes-shelf", title: "Episodes", inMenu: true },
      { type: "upcoming", title: "Schedule", inMenu: true },
      { type: "blog", title: "Notebook", inMenu: true },
      { type: "newsletter" },
      { type: "footer" },
    ] },
  { id: "store", name: "Storefront", tag: "COMMERCE",
    blurb: "Lead with merch and producer drops. For a studio selling posters, vinyl and passes.",
    specs: [
      { type: "hero-split", title: "Home", props: { bgImage: "desert" } },
      { type: "store", title: "Store", inMenu: true, props: { layout: "row" } },
      { type: "shop-nft", title: "Drops", inMenu: true },
      { type: "holders", title: "Producers", inMenu: true },
      { type: "newsletter" },
      { type: "footer" },
    ] },
  { id: "presskit", name: "Press kit", tag: "EPK",
    blurb: "An electronic press kit — stats, critic quotes, a career timeline, a still gallery.",
    specs: [
      { type: "hero", title: "Home", props: { kicker: "PRESS KIT" } },
      { type: "stats" },
      { type: "press", title: "Press", inMenu: true },
      { type: "timeline", title: "Career", inMenu: true },
      { type: "gallery", title: "Stills", inMenu: true },
      { type: "contact", title: "Contact", inMenu: true },
      { type: "footer" },
    ] },
];
window.WB_PAGE_TEMPLATES = PAGE_TEMPLATES;

// ─── BlockThumb — schematic preview of each block type ──────────────────────
function ThumbShell({ children, pad = 8, justify = "flex-start" }) {
  return (
    <div style={{
      position: "relative", width: "100%", aspectRatio: "16/10", overflow: "hidden",
      background: `linear-gradient(160deg, ${tkc("panel-2")}, ${tkc("bg")})`, borderRadius: "var(--r-2)",
      border: "1px solid var(--c-line)", display: "flex", flexDirection: "column",
      justifyContent: justify, gap: 5, padding: pad,
    }}>{children}</div>
  );
}
function bar(w, h, c, r = 1.5, o = 1) { return { width: w, height: h, background: c, borderRadius: r, opacity: o, flexShrink: 0 }; }

// Real catalog stills for thumbnails — the same imagery the sections render,
// so the picker previews what you'll actually get (no more colored boxes).
const WB_THUMB_KINDS = ["ll", "bluejay", "carrion", "swallows", "thefence", "drift", "marauder", "verge", "frequency"];
function PhotoTile({ i = 0, style, children }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: "var(--r-1)", ...style }}>
      {window.FrameThumb ? (
        <div style={{ position: "absolute", inset: 0 }}>
          {React.createElement(window.FrameThumb, { kind: WB_THUMB_KINDS[i % WB_THUMB_KINDS.length], usePhoto: true })}
        </div>
      ) : (
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${tkc("amber", 0.33)}, ${tkc("black")})` }}></div>
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.45), transparent 55%)" }}></div>
      {children}
    </div>
  );
}

function BlockThumb({ type, accent = "var(--c-amber)" }) {
  const ink = "rgba(240,231,223,.8)", dim = "rgba(240,231,223,.32)";
  switch (type) {
    case "hero": case "hero-video": return (
      <ThumbShell justify="center" pad={12}>
        <div style={bar(26, 5, accent, 2)}/>
        <div style={bar("80%", 13, ink, 2)}/>
        <div style={bar("55%", 5, dim, 2)}/>
        {type === "hero-video" && <div style={{ position: "absolute", top: 8, right: 8, color: accent, fontSize: "var(--fs-label)" }}>▶</div>}
      </ThumbShell>);
    case "hero-parallax": return (
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/10", overflow: "hidden", borderRadius: "var(--r-2)", border: "1px solid var(--c-line)" }}>
        <PhotoTile i={0} style={{ position: "absolute", inset: 0, borderRadius: 0 }}/>
        <div style={{ position: "absolute", left: 12, bottom: 12, right: 12 }}>
          <div style={{ ...bar(22, 4, accent, 2), marginBottom: 6 }}/>
          <div style={{ ...bar("70%", 11, tkc("white"), 2), opacity: .9 }}/>
        </div>
      </div>);
    case "hero-split": return (
      <ThumbShell justify="center"><div style={{ display: "flex", gap: 8, height: "70%" }}>
        <PhotoTile i={1} style={{ flex: 1, borderRadius: "var(--r-1)" }}/>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 5 }}>
          <div style={bar(18, 4, accent, 2)}/><div style={bar("90%", 9, ink, 2)}/><div style={bar("60%", 4, dim, 2)}/>
        </div>
      </div></ThumbShell>);
    case "marquee": return (
      <ThumbShell justify="center"><div style={{ display: "flex", gap: 6, alignItems: "center", borderTop: `1px solid ${accent}66`, borderBottom: `1px solid ${accent}66`, padding: "8px 0" }}>
        {["28%", "18%", "24%", "14%"].map((w, i) => <div key={i} style={bar(w, 5, accent, 2, .8)}/>)}
      </div></ThumbShell>);
    case "about": return (
      <ThumbShell justify="center" pad={12}>
        <div style={bar(16, 4, accent, 2)}/>
        {["95%", "100%", "88%", "60%"].map((w, i) => <div key={i} style={bar(w, 5, ink, 2, .55)}/>)}
      </ThumbShell>);
    case "press": return (
      <ThumbShell justify="center" pad={12}><div style={{ display: "flex", gap: 10 }}>
        {[0, 1].map(i => <div key={i} style={{ flex: 1 }}>
          <div style={{ ...bar("100%", 7, ink, 2, .7), marginBottom: 4 }}/><div style={{ ...bar("80%", 7, ink, 2, .7), marginBottom: 6 }}/><div style={bar("40%", 4, accent, 2)}/>
        </div>)}
      </div></ThumbShell>);
    case "stats": return (
      <ThumbShell justify="center"><div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map(i => <div key={i} style={{ flex: 1, borderTop: `1px solid ${accent}`, paddingTop: 5 }}>
          <div style={{ ...bar("70%", 12, ink, 2), marginBottom: 4 }}/><div style={bar("90%", 3, dim, 2)}/>
        </div>)}
      </div></ThumbShell>);
    case "timeline": return (
      <ThumbShell justify="center" pad={12}><div style={{ paddingLeft: 12, position: "relative" }}>
        <div style={{ position: "absolute", left: 3, top: 2, bottom: 2, width: 1, background: `${accent}88` }}/>
        {[0, 1, 2].map(i => <div key={i} style={{ position: "relative", marginBottom: 7 }}>
          <span style={{ position: "absolute", left: -12, top: 1, width: 6, height: 6, borderRadius: "50%", background: accent }}/>
          <div style={bar("60%", 6, ink, 2, .7)}/>
        </div>)}
      </div></ThumbShell>);
    case "featured": return (
      <ThumbShell justify="center"><div style={{ display: "flex", gap: 8, height: "72%" }}>
        <PhotoTile i={0} style={{ flex: 1.4, borderRadius: "var(--r-1)" }}/>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 5 }}>
          <div style={bar("90%", 10, ink, 2)}/><div style={bar("100%", 4, dim, 2)}/><div style={{ ...bar(34, 9, accent, 5), marginTop: 3 }}/>
        </div>
      </div></ThumbShell>);
    case "films": case "gallery": case "actor-vault": return (
      <ThumbShell justify="center"><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, height: "78%" }}>
        {[0, 1, 2, 3, 4, 5].map(i => <PhotoTile key={i} i={i}/>)}
      </div></ThumbShell>);
    case "branched-shelf": case "store": case "shop-nft": case "trailers-shelf": return (
      <ThumbShell justify="center"><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, height: "76%" }}>
        {[0, 1, 2].map(i => <div key={i} style={{ display: "flex", flexDirection: "column", border: `1px solid ${accent}44`, borderRadius: "var(--r-1)", overflow: "hidden" }}>
          <PhotoTile i={i + 3} style={{ flex: 1, borderRadius: 0 }}/>
          <div style={{ padding: 4 }}><div style={{ ...bar("80%", 5, ink, 2, .8), marginBottom: 3 }}/><div style={bar("100%", 6, accent, 1)}/></div>
        </div>)}
      </div></ThumbShell>);
    case "episodes-shelf": case "upcoming": case "news": case "blog": return (
      <ThumbShell justify="center" pad={12}>{[0, 1, 2].map(i => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", borderTop: `1px solid ${accent}33`, paddingTop: 6 }}>
          <div style={bar(20, 6, accent, 2)}/><div style={{ ...bar("55%", 6, ink, 2, .7), flex: 1 }}/><div style={bar(16, 6, dim, 3)}/>
        </div>))}</ThumbShell>);
    case "holders": return (
      <ThumbShell justify="center" pad={12}><div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 3 }}>
        {Array.from({ length: 24 }).map((_, i) => <div key={i} style={{ aspectRatio: "1/1", borderRadius: "var(--r-1)", background: i < 3 ? accent : `${accent}44`, border: i < 3 ? `1px solid ${accent}` : "none" }}/>)}
      </div></ThumbShell>);
    case "newsletter": case "contact": return (
      <ThumbShell justify="center" pad={12}>
        <div style={{ ...bar(22, 4, accent, 2), marginBottom: 2 }}/><div style={{ ...bar("70%", 9, ink, 2), marginBottom: 7 }}/>
        <div style={{ display: "flex" }}><div style={{ flex: 1, height: 16, background: "rgba(255,255,255,.06)", border: `1px solid ${accent}55`, borderRadius: "3px 0 0 3px" }}/><div style={{ width: 42, height: 18, background: accent, borderRadius: "0 3px 3px 0" }}/></div>
      </ThumbShell>);
    case "spacer": return (
      <ThumbShell justify="center"><div style={{ height: 18, border: `1px dashed ${accent}66`, borderRadius: "var(--r-1)", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={bar("30%", 1, accent, 1)}/></div></ThumbShell>);
    case "footer": return (
      <ThumbShell justify="flex-end" pad={10}><div style={{ display: "flex", gap: 10, borderTop: `1px solid ${accent}44`, paddingTop: 8 }}>
        <div style={{ flex: 1.6 }}><div style={bar("70%", 9, ink, 2)}/></div>
        {[0, 1].map(i => <div key={i} style={{ flex: 1 }}>{[0, 1, 2].map(j => <div key={j} style={{ ...bar("85%", 4, dim, 2), marginBottom: 3 }}/>)}</div>)}
      </div></ThumbShell>);
    case "image": case "video": return (
      <ThumbShell justify="center"><PhotoTile i={type === "video" ? 5 : 2} style={{ height: "80%", borderRadius: "var(--r-1)" }}>
        {type === "video" && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: tkc("white"), fontSize: "var(--fs-lead)", textShadow: "0 2px 8px rgba(0,0,0,.7)" }}>▶</div>}
      </PhotoTile></ThumbShell>);
    case "faq": return (
      <ThumbShell justify="center" pad={12}>{[0, 1, 2].map(i => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${accent}33`, paddingTop: 7, marginBottom: 3 }}>
          <div style={bar("62%", 7, ink, 2, .75)}/><span style={{ color: accent, fontSize: "var(--fs-label)", lineHeight: 1 }}>+</span>
        </div>))}</ThumbShell>);
    case "awards": return (
      <ThumbShell justify="center"><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
        {[0, 1, 2].map(i => <div key={i} style={{ border: `1px solid ${accent}33`, borderRadius: "var(--r-1)", padding: "8px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ color: accent, fontSize: "var(--fs-label)", lineHeight: 1 }}>❀</span>
          <div style={bar("70%", 4, ink, 2, .7)}/><div style={bar("40%", 6, ink, 2, .9)}/>
        </div>)}
      </div></ThumbShell>);
    case "logos": return (
      <ThumbShell justify="center"><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${accent}33`, borderBottom: `1px solid ${accent}33`, padding: "10px 2px" }}>
        {["18%", "22%", "15%", "20%"].map((w, i) => <div key={i} style={bar(w, 5, dim, 2)}/>)}
      </div></ThumbShell>);
    case "crew": return (
      <ThumbShell justify="center" pad={12}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 12px" }}>
        {[0, 1, 2, 3].map(i => <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${accent}33`, paddingTop: 6 }}>
          <div style={bar("45%", 6, ink, 2, .8)}/><div style={bar("30%", 3.5, dim, 2)}/>
        </div>)}
      </div></ThumbShell>);
    case "cta": return (
      <ThumbShell justify="center" pad={12}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <div style={bar(20, 3.5, accent, 2)}/><div style={bar("64%", 11, ink, 2)}/><div style={bar("44%", 4, dim, 2)}/>
          <div style={{ ...bar(46, 11, accent, 3), marginTop: 4 }}/>
        </div>
      </ThumbShell>);
    default: return <ThumbShell justify="center"><div style={{ flex: 1, background: "rgba(255,255,255,.05)", borderRadius: "var(--r-1)" }}/></ThumbShell>;
  }
}
window.BlockThumb = BlockThumb;

function PageTemplateThumb({ tpl, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, background: tkc("bg"), borderRadius: "var(--r-2)", padding: 6, border: "1px solid var(--c-line)" }}>
      {tpl.specs.filter(s => s.type !== "footer").slice(0, 3).map((s, i) => (
        <BlockThumb key={i} type={s.type} accent={accent}/>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// InsertOverlayV3 — the rich picker
// ════════════════════════════════════════════════════════════════════════════
const TAB_DEFS = [
  { id: "blocks", label: "Sections" },
  { id: "templates", label: "Page templates" },
  { id: "saved", label: "Saved" },
];

function InsertOverlayV3({ activeCat, setActiveCat, initialTab, onClose, onInsertBlock, onInsertTemplate, onInsertSaved, accent = "var(--c-amber)" }) {
  const LIB = window.BLOCK_LIBRARY_V2 || [];
  const CATS = window.CATS_ORDER_V3 || ["Heroes", "Media", "Story", "Catalog", "Community", "Commerce", "Tail"];
  const [tab, setTab] = usBT(initialTab || "blocks");
  const [focusType, setFocusType] = usBT(null);
  const [focusTpl, setFocusTpl] = usBT(null);
  const [saved, setSaved] = usBT(loadSavedSections);

  ueBT(() => {
    const h = () => setSaved(loadSavedSections());
    window.addEventListener("cina:saved-sections-changed", h);
    return () => window.removeEventListener("cina:saved-sections-changed", h);
  }, []);

  const cats = umBT(() => CATS.filter(c => LIB.some(b => b.cat === c)), [LIB]);
  const blocks = LIB.filter(b => b.cat === activeCat);
  const focusMeta = focusType && LIB.find(b => b.type === focusType);
  const variants = focusType ? variantsForV3(focusType) : [];
  const pickBlock = (type, v) => onInsertBlock(type, v ? { metaPatch: v.metaPatch, propsPatch: v.propsPatch } : {});

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", backdropFilter: "blur(18px)",
      zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 1040, maxWidth: "100%", height: 660, maxHeight: "88vh", display: "flex", flexDirection: "column",
        background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)", overflow: "hidden",
        boxShadow: "0 40px 120px -30px rgba(0,0,0,.85)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "14px 18px", borderBottom: "1px solid var(--c-line)" }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginRight: 14 }}>+ ADD</span>
          {TAB_DEFS.map(td => (
            <button key={td.id} onClick={() => { setTab(td.id); setFocusType(null); setFocusTpl(null); }} style={{
              padding: "7px 14px", background: tab === td.id ? "rgba(var(--accent-rgb),.12)" : "transparent",
              border: `1px solid ${tab === td.id ? "var(--c-amber)" : "transparent"}`, borderRadius: "var(--r-2)", cursor: "pointer",
              color: tab === td.id ? "var(--c-amber)" : "var(--c-ink-2)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600, textTransform: "uppercase",
            }}>{td.label}{td.id === "saved" && saved.length ? ` · ${saved.length}` : ""}</button>
          ))}
          <span style={{ flex: 1 }}/>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--c-bg)", border: "1px solid var(--c-line-2)", color: "var(--c-ink-3)", cursor: "pointer", fontSize: "var(--fs-lead)" }} aria-label="Close" title="Close">×</button>
        </div>

        {tab === "blocks" && (
          <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
            <div style={{ width: 150, padding: 12, borderRight: "1px solid var(--c-line)", display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
              {cats.map(c => (
                <button key={c} onClick={() => { setActiveCat(c); setFocusType(null); }} style={{
                  padding: "8px 10px", textAlign: "left",
                  background: activeCat === c ? "rgba(var(--accent-rgb),.10)" : "transparent",
                  border: `1px solid ${activeCat === c ? "var(--c-amber)" : "transparent"}`, borderRadius: "var(--r-2)", cursor: "pointer",
                  color: activeCat === c ? "var(--c-amber)" : "var(--c-ink-2)",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600, textTransform: "uppercase",
                  display: "flex", justifyContent: "space-between",
                }}><span>{c}</span><span style={{ color: "var(--c-ink-4)" }}>{LIB.filter(b => b.cat === c).length}</span></button>
              ))}
            </div>
            <div style={{ flex: 1, padding: 18, overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {blocks.map(b => {
                  const nVar = variantsForV3(b.type).length;
                  return (
                    <button key={b.type} onClick={() => { nVar > 1 ? setFocusType(b.type) : pickBlock(b.type); }} style={{
                      padding: 8, background: focusType === b.type ? "rgba(var(--accent-rgb),.07)" : "var(--c-bg)",
                      border: `1px solid ${focusType === b.type ? "var(--c-amber)" : "var(--c-line-2)"}`,
                      borderRadius: "var(--r-2)", cursor: "pointer", color: "inherit", textAlign: "left",
                    }}
                      onMouseEnter={e => { if (focusType !== b.type) e.currentTarget.style.borderColor = "var(--c-line-3)"; }}
                      onMouseLeave={e => { if (focusType !== b.type) e.currentTarget.style.borderColor = "var(--c-line-2)"; }}>
                      <BlockThumb type={b.type} accent={accent}/>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 8, padding: "0 2px" }}>
                        <span style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)" }}>{b.name}</span>
                        {nVar > 1 && <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>{nVar} STYLES</span>}
                      </div>
                      <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", padding: "1px 2px 2px", lineHeight: 1.35 }}>{b.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            {focusType && focusMeta && (
              <div style={{ width: 270, padding: 18, borderLeft: "1px solid var(--c-line)", overflowY: "auto", background: "var(--c-panel-2)" }}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>PICK A STYLE</div>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, margin: "4px 0 2px" }}>{focusMeta.name}</div>
                <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginBottom: 14, lineHeight: 1.4 }}>{focusMeta.desc}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {variants.map(v => {
                    const tint = v.propsPatch && v.propsPatch.bgImage ? ((window.BG_IMAGES || {})[v.propsPatch.bgImage]?.tint || accent) : null;
                    const sw = v.propsPatch && v.propsPatch._bgTone === "deep" ? tkc("black") : v.propsPatch && v.propsPatch._bgTone === "panel" ? "rgba(255,255,255,.06)" : tint ? `linear-gradient(135deg, ${tint}, ${tkc("black")})` : `${accent}22`;
                    return (
                      <button key={v.id} onClick={() => pickBlock(focusType, v)} style={{
                        padding: "10px 12px", textAlign: "left", background: "var(--c-bg)",
                        border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", cursor: "pointer", color: "inherit",
                        display: "flex", alignItems: "center", gap: 10,
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--c-amber)"; e.currentTarget.style.background = "rgba(var(--accent-rgb),.06)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--c-line-2)"; e.currentTarget.style.background = "var(--c-bg)"; }}>
                        <span style={{ width: 34, height: 22, borderRadius: "var(--r-1)", flexShrink: 0, background: sw, border: "1px solid var(--c-line-2)" }}/>
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: "block", fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)" }}>{v.name}</span>
                          <span style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", lineHeight: 1.3 }}>{v.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "templates" && (
          <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
            <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
              <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", margin: "0 0 16px", maxWidth: 560, lineHeight: 1.5 }}>
                Start from a full layout. <strong style={{ color: "var(--c-ink-2)" }}>This replaces all current sections</strong> — your theme, logo and domain stay.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {PAGE_TEMPLATES.map(tpl => (
                  <button key={tpl.id} onClick={() => setFocusTpl(tpl.id)} style={{
                    padding: 12, background: focusTpl === tpl.id ? "rgba(var(--accent-rgb),.07)" : "var(--c-bg)",
                    border: `1px solid ${focusTpl === tpl.id ? "var(--c-amber)" : "var(--c-line-2)"}`,
                    borderRadius: "var(--r-2)", cursor: "pointer", color: "inherit", textAlign: "left",
                  }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
                      <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, color: "var(--c-ink)" }}>{tpl.name}</span>
                      <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", border: "1px solid rgba(var(--accent-rgb),.35)", borderRadius: "var(--r-1)", padding: "1px 4px" }}>{tpl.tag}</span>
                    </div>
                    <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", margin: "0 0 10px", lineHeight: 1.45, minHeight: 30 }}>{tpl.blurb}</div>
                    <PageTemplateThumb tpl={tpl} accent={accent}/>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 8 }}>{tpl.specs.length} SECTIONS · CLICK FOR DETAILS</div>
                  </button>
                ))}
              </div>
            </div>
            {focusTpl && (() => {
              const tpl = PAGE_TEMPLATES.find(t => t.id === focusTpl);
              return (
                <div style={{ width: 280, padding: 20, borderLeft: "1px solid var(--c-line)", overflowY: "auto", background: "var(--c-panel-2)", display: "flex", flexDirection: "column" }}>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>{tpl.tag} LAYOUT</div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, margin: "4px 0 8px" }}>{tpl.name}</div>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5, marginBottom: 16 }}>{tpl.blurb}</div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 8 }}>{tpl.specs.length} SECTIONS</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
                    {tpl.specs.map((s, i) => {
                      const m = (window.BLOCK_LIBRARY_V2 || []).find(b => b.type === s.type);
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "5px 8px", background: "var(--c-bg)", borderRadius: "var(--r-2)", border: "1px solid var(--c-line)" }}>
                          
                          <span style={{ color: "var(--c-amber)", fontSize: "var(--fs-body)", width: 16, textAlign: "center" }}>{m?.icon || "■"}</span>
                          <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{s.title || m?.name || s.type}</span>
                          {s.inMenu && <span style={{ marginLeft: "auto", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", border: "1px solid rgba(var(--accent-rgb),.3)", borderRadius: "var(--r-1)", padding: "1px 3px" }}>MENU</span>}
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => onInsertTemplate(tpl)} style={{
                    marginTop: "auto", padding: "12px", background: "var(--c-amber)", color: "var(--c-on-amber)", border: "none",
                    borderRadius: "var(--r-2)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
                  }}>USE THIS LAYOUT →</button>
                </div>
              );
            })()}
          </div>
        )}

        {tab === "saved" && (
          <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
            {saved.length === 0 ? (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--c-ink-3)", gap: 10 }}>
                <div style={{ fontSize: "var(--fs-head)", opacity: .5 }}>❑</div>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink-2)" }}>No saved sections yet</div>
                <div style={{ fontSize: "var(--fs-body)", maxWidth: 380, lineHeight: 1.5 }}>Style any section how you like it, then hit <span style={{ color: "var(--c-amber)" }}>★ Save as template</span> in its inspector. It shows up here to reuse on any page.</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {saved.map(e => {
                  const m = (window.BLOCK_LIBRARY_V2 || []).find(b => b.type === e.type);
                  return (
                    <div key={e.sid} style={{ padding: 10, background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)" }}>
                      <BlockThumb type={e.type} accent={accent}/>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 9 }}>
                        <span style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.name}</span>
                        <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", flexShrink: 0, marginLeft: 6 }}>{m?.name?.toUpperCase() || e.type}</span>
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                        <button onClick={() => onInsertSaved(e.spec)} style={{
                          flex: 1, padding: "8px", background: "var(--c-amber)", color: "var(--c-on-amber)", border: "none", borderRadius: "var(--r-2)", cursor: "pointer",
                          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
                        }}>+ ADD</button>
                        <button onClick={() => window.wbDeleteSavedSection(e.sid)} title="Delete template" style={{
                          padding: "8px 11px", background: "transparent", border: "1px solid var(--c-line-2)", color: "var(--c-ink-3)", borderRadius: "var(--r-2)", cursor: "pointer", fontSize: "var(--fs-body)",
                        }}>×</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
window.InsertOverlayV3 = InsertOverlayV3;

// ════════════════════════════════════════════════════════════════════════════
// GoLiveModal — publish / go-live confirmation
// ════════════════════════════════════════════════════════════════════════════
function GoLiveModal({ page, updatePage, onClose, onConfirm }) {
  const tier = page.tier || "free";
  const TIERS = [
    { id: "free", label: "Free", price: "$0", domainNote: "On a cina.app subdomain", perks: ["Cina badge in the footer", "Hosted at " + page.domain] },
    { id: "pro", label: "Pro", price: "$19/mo", domainNote: "Custom subdomain · white-label", perks: ["No Cina badge", "yourname.cina + analytics"] },
    { id: "enterprise", label: "Enterprise", price: "Custom", domainNote: "Bring your own apex domain", perks: ["White-label", "Custom domain + SLA"] },
  ];
  const active = TIERS.find(t => t.id === tier) || TIERS[0];
  const inMenuCount = (page.sections || []).filter(s => s.inMenu).length;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.82)", backdropFilter: "blur(18px)",
      zIndex: 240, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 560, maxWidth: "100%", background: "var(--c-panel)", border: "1px solid var(--c-line-2)",
        borderRadius: "var(--r-3)", overflow: "hidden", boxShadow: "0 40px 120px -30px rgba(0,0,0,.85)",
      }}>
        <div style={{ padding: "26px 30px 20px", borderBottom: "1px solid var(--c-line)" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>▲ GO LIVE</div>
          <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 500, margin: "8px 0 6px", letterSpacing: "-0.02em" }}>Publish {page.studioName}?</h2>
          <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", margin: 0, lineHeight: 1.5 }}>
            Your site goes live at <span style={{ color: "var(--c-amber)" }}>{page.domain}</span> with {page.sections.length} sections{inMenuCount ? ` · ${inMenuCount} in the menu` : ""}.
          </p>
        </div>
        <div style={{ padding: "20px 30px" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 10 }}>PUBLISH PLAN</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {TIERS.map(t => (
              <button key={t.id} onClick={() => updatePage({ tier: t.id })} style={{
                flex: 1, padding: "12px 10px", textAlign: "left", cursor: "pointer", borderRadius: "var(--r-2)",
                background: tier === t.id ? "rgba(var(--accent-rgb),.08)" : "var(--c-bg)",
                border: `1px solid ${tier === t.id ? "var(--c-amber)" : "var(--c-line-2)"}`, color: "inherit",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, color: tier === t.id ? "var(--c-amber)" : "var(--c-ink-2)" }}>{t.label.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: "var(--fs-lead)", fontWeight: 600, color: "var(--c-ink)", marginTop: 4 }}>{t.price}</div>
                <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 3, lineHeight: 1.3 }}>{t.domainNote}</div>
              </button>
            ))}
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {active.perks.map((p, i) => (
              <li key={i} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>
                <span style={{ color: "var(--c-good)", fontSize: "var(--fs-body)" }}>✓</span>{p}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ padding: "16px 30px", borderTop: "1px solid var(--c-line)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{
            padding: "10px 16px", background: "transparent", border: "1px solid var(--c-line-2)", color: "var(--c-ink-2)",
            borderRadius: "var(--r-2)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase",
          }} aria-label="Close" title="Close">Keep editing</button>
          <button onClick={() => onConfirm(false)} style={{
            padding: "10px 16px", background: "transparent", border: "1px solid var(--c-amber)", color:  "var(--c-amber)",
            borderRadius: "var(--r-2)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 700,
          }}>Publish</button>
          <button onClick={() => onConfirm(true)} style={{
            padding: "10px 18px", background: "var(--c-amber)", color: "var(--c-on-amber)", border: "none",
            borderRadius: "var(--r-2)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 700,
          }}>Publish & view live ↗</button>
        </div>
      </div>
    </div>
  );
}
window.GoLiveModal = GoLiveModal;

// ════════════════════════════════════════════════════════════════════════════
// WBScaler — renders the preview at a FIXED design width, then scales the whole
// thing down to fit the available column. This is what kills the clipped /
// cramped text in the canvas: the site always lays out at a true desktop width
// (or the device width) and is letterboxed by transform, never reflowed into a
// too-narrow column.
// ════════════════════════════════════════════════════════════════════════════
function WBScaler({ designWidth, children }) {
  const wrapRef = urBT(null);
  const [scale, setScale] = usBT(1);
  const [innerH, setInnerH] = usBT(0);
  const innerRef = urBT(null);

  ueBT(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => {
      const avail = wrap.clientWidth;
      setScale(avail > 0 ? Math.min(1, avail / designWidth) : 1);
    });
    ro.observe(wrap);
    setScale(wrap.clientWidth > 0 ? Math.min(1, wrap.clientWidth / designWidth) : 1);
    return () => ro.disconnect();
  }, [designWidth]);

  ueBT(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const ro = new ResizeObserver(() => setInnerH(inner.offsetHeight));
    ro.observe(inner);
    setInnerH(inner.offsetHeight);
    return () => ro.disconnect();
  });

  return (
    <div ref={wrapRef} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      {/* spacer height = scaled content height so the scroll area is correct */}
      <div style={{ width: designWidth * scale, height: innerH * scale }}>
        <div ref={innerRef} style={{ width: designWidth, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
