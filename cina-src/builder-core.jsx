// builder-core.jsx — Studio Builder data, presets, shared primitives and helpers.

const { useState: usbCo, useEffect: uebCo, useRef: urbCo } = React;
// watch-builder-v2.jsx — STUDIO BUILDER
//
// Complete rebuild of the creator/channel page builder. Renamed "Studio
// Builder" because the page IS a studio's standalone website now.
//
// What's new vs v1:
//   • 25+ block types organized into 5 categories (Heroes / Story /
//     Catalog / Community / Tail), including parallax heroes with bg
//     image picker, store, blog, contact form, NFT holders, upcoming
//     dates, news, actor vault, multiple footer presets.
//   • Logo Studio modal: upload an image, AI-generate from a prompt,
//     or remove background to make a transparent PNG.
//   • Header & Footer preset pickers — 11 header layouts, 9 footers.
//   • Per-section Animate-in (fade-up / fade-in / parallax / slide /
//     zoom / none) with scroll-triggered IntersectionObserver.
//   • Tier toggle: Free (Cina badge in corner) · Pro (no badge,
//     custom subdomain) · Enterprise (custom apex + extras).
//   • White-label-friendly: the parent app already hides Cina nav on
//     /creator/* and /build/* routes.
//
// Overrides window.CreatorBuilder. The published renderer lives in
// watch-creator.jsx (themed channels) for now; this builder writes
// to localStorage so the same data can be picked up there.



// ─── Block library ──────────────────────────────────────────────────────

const BLOCK_LIBRARY_V2 = [
  // ─ Heroes ─
  { type: "hero",            cat: "Heroes",    name: "Standard hero",     icon: "▣",  desc: "Big title + sub" },
  { type: "hero-parallax",   cat: "Heroes",    name: "Parallax hero",     icon: "▤",  desc: "Bg image + drift on scroll" },
  { type: "hero-video",      cat: "Heroes",    name: "Video hero",        icon: "▶",  desc: "Auto-playing film bg" },
  { type: "hero-split",      cat: "Heroes",    name: "Split hero",        icon: "◨",  desc: "Image + copy side-by-side" },

  // ─ Media ─
  { type: "image",           cat: "Media",     name: "Image",             icon: "▣",  desc: "Full-width still or upload" },
  { type: "video",           cat: "Media",     name: "Video",             icon: "▶",  desc: "Embedded clip / trailer" },
  { type: "gallery",         cat: "Media",     name: "Frame gallery",     icon: "▦▦", desc: "Stills mosaic" },

  // ─ Story ─
  { type: "marquee",         cat: "Story",     name: "Marquee",           icon: "▷",  desc: "Scrolling tagline" },
  { type: "faq",             cat: "Story",     name: "FAQ",               icon: "‽",  desc: "Questions, answered" },
  { type: "awards",          cat: "Story",     name: "Awards & laurels",  icon: "✿",  desc: "Festival selections" },
  { type: "logos",           cat: "Story",     name: "Logo strip",        icon: "▭",  desc: "Press & partners" },
  { type: "about",           cat: "Story",     name: "About / Bio",       icon: "¶",  desc: "Long-form prose" },
  { type: "press",           cat: "Story",     name: "Press quotes",      icon: "❝",  desc: "Critic blurbs" },
  { type: "stats",           cat: "Story",     name: "Stats strip",       icon: "▣▣", desc: "Numbers that matter" },
  { type: "timeline",        cat: "Story",     name: "Timeline",          icon: "─•", desc: "Career milestones" },

  // ─ Catalog ─
  { type: "featured",        cat: "Catalog",   name: "Featured film",     icon: "★",  desc: "One headline piece" },
  { type: "films",           cat: "Catalog",   name: "Films grid",        icon: "▦",  desc: "All your features" },
  { type: "branched-shelf",  cat: "Catalog",   name: "Branched films",    icon: "Y",  desc: "Choose-your-own-adventure" },
  { type: "episodes-shelf",  cat: "Catalog",   name: "Series episodes",   icon: "▥",  desc: "Episodic releases" },
  { type: "trailers-shelf",  cat: "Catalog",   name: "Trailers",          icon: "▶▶", desc: "Cuts shorter than 90s" },
  { type: "actor-vault",     cat: "Catalog",   name: "Actor vault",       icon: "◑",  desc: "Cast you've trained" },

  // ─ Community ─
  { type: "upcoming",        cat: "Community", name: "Upcoming dates",    icon: "◪",  desc: "Premieres + drops" },
  { type: "holders",         cat: "Community", name: "NFT holders",       icon: "◈",  desc: "Producers & royalty" },
  { type: "newsletter",      cat: "Community", name: "Newsletter",        icon: "✉",  desc: "Email signup" },
  { type: "contact",         cat: "Community", name: "Contact form",      icon: "✎",  desc: "Inbound from fans" },
  { type: "crew",            cat: "Community", name: "Crew",              icon: "◉",  desc: "The people behind it" },

  // ─ Commerce ─
  { type: "store",           cat: "Commerce",  name: "Store",             icon: "▢",  desc: "Merch, posters, vinyl" },
  { type: "shop-nft",        cat: "Commerce",  name: "Producer drops",    icon: "◇",  desc: "NFT-gated tickets" },
  { type: "blog",            cat: "Commerce",  name: "Blog",              icon: "▤",  desc: "Long-form notes & news" },
  { type: "cta",             cat: "Commerce",  name: "CTA banner",        icon: "▮",  desc: "One big action" },

  // ─ Tail ─
  { type: "spacer",          cat: "Tail",      name: "Spacer",            icon: "─",  desc: "Breathing room" },
  { type: "footer",          cat: "Tail",      name: "Footer",            icon: "▭",  desc: "Bottom of the page" },
];

// (CATS_ORDER lives in builder-templates.jsx as CATS_ORDER_V3 — the V3 insert
// overlay is the only picker; the old V2 overlay + its stale category list
// were removed.)

// ─── Default page ───────────────────────────────────────────────────────

// Tier model — what FREE / PRO / ENTERPRISE actually unlock. Gating reads
// from here so the plan pills change real behavior, not just a label.
const WB_TIERS = {
  free:       { label: "Free",       maxSections: 5,       badge: true,  customDomain: false, apex: false, allFonts: false, codeInject: false, blurb: "Cina badge · up to 5 sections · cina subdomain" },
  pro:        { label: "Pro",        maxSections: Infinity, badge: false, customDomain: true,  apex: false, allFonts: true,  codeInject: false, blurb: "No badge · unlimited sections · custom subdomain" },
  enterprise: { label: "Enterprise", maxSections: Infinity, badge: false, customDomain: true,  apex: true,  allFonts: true,  codeInject: true,  blurb: "Everything in Pro · custom apex domain · priority support" },
};
const wbTier = (page) => WB_TIERS[page && page.tier] || WB_TIERS.free;

// Curated background + accent swatch palettes for the theme panel.
const WB_BG_SWATCHES = [
  ...CINA_TOKENS.SITE.swatches.bg

];
const WB_ACCENT_SWATCHES = [
  ...CINA_TOKENS.SITE.swatches.accent

];

// ─── Font library ───────────────────────────────────────────────────────
// Pro's "all fonts" claim is real now: curated families that load from
// Google Fonts on first render. Free keeps the core three.
const WB_FONTS = {
  display:   { label: "Fraunces · italic",  css: "var(--f-display)", free: true },
  sans:      { label: "Geist sans",         css: "var(--f-sans)",    free: true },
  mono:      { label: "JetBrains mono",     css: "var(--f-mono)",    free: true },
  playfair:  { label: "Playfair Display",   css: "'Playfair Display', Georgia, serif",   gf: "Playfair+Display:ital,wght@0,400..900;1,400..900" },
  dmserif:   { label: "DM Serif Display",   css: "'DM Serif Display', Georgia, serif",   gf: "DM+Serif+Display:ital@0;1" },
  cormorant: { label: "Cormorant Garamond", css: "'Cormorant Garamond', Georgia, serif", gf: "Cormorant+Garamond:ital,wght@0,400..700;1,400..700" },
  spectral:  { label: "Spectral",           css: "'Spectral', Georgia, serif",           gf: "Spectral:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600" },
  crimson:   { label: "Crimson Pro",        css: "'Crimson Pro', Georgia, serif",        gf: "Crimson+Pro:ital,wght@0,300..700;1,300..700" },
  grotesk:   { label: "Space Grotesk",      css: "'Space Grotesk', 'Geist', sans-serif", gf: "Space+Grotesk:wght@300..700" },
  archivo:   { label: "Archivo",            css: "'Archivo', 'Geist', sans-serif",       gf: "Archivo:ital,wght@0,300..800;1,300..800" },
  worksans:  { label: "Work Sans",          css: "'Work Sans', 'Geist', sans-serif",     gf: "Work+Sans:ital,wght@0,300..700;1,300..700" },
};
// Curated headline + body pairings surfaced in the theme inspector.
const WB_FONT_PAIRINGS = [
  { name: "Darkroom",  headline: "display",   body: "sans",     free: true },
  { name: "Terminal",  headline: "mono",      body: "sans",     free: true },
  { name: "Gallery",   headline: "sans",      body: "sans",     free: true },
  { name: "Playbill",  headline: "playfair",  body: "worksans" },
  { name: "Marquee",   headline: "dmserif",   body: "archivo"  },
  { name: "Festival",  headline: "cormorant", body: "spectral" },
  { name: "Criterion", headline: "grotesk",   body: "worksans" },
  { name: "Novella",   headline: "crimson",   body: "archivo"  },
];
// Resolve a font key to its CSS stack — and lazily inject the Google Fonts
// stylesheet the first time a non-core family is actually used.
function wbFont(key) {
  const f = WB_FONTS[key] || WB_FONTS.display;
  if (f.gf && typeof document !== "undefined" && !document.getElementById("wb-font-" + key)) {
    const l = document.createElement("link");
    l.id = "wb-font-" + key; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=" + f.gf + "&display=swap";
    document.head.appendChild(l);
  }
  return f.css;
}
if (typeof window !== "undefined") Object.assign(window, { WB_FONTS, wbFont });

const DEFAULT_PAGE_V2 = (creator) => ({
  domain: (creator?.id || "voss") + ".cina",
  studioName: (creator?.name || "Voss") + " Studio",
  tier: "free", // free | pro | enterprise
  logo: { kind: "wordmark" }, // text defaults to the studio name — never the account holder. Or { kind: "image", src }
  theme: {
    bg: tkc("bg"),
    ink: tkc("ink"),
    accent: tkc("cat-3"),
    headlineFont: "display",
    bodyFont: "sans",
    fontScale: 1.0,
    spacing: 1.0,
    radius: 0,
    grain: 0.4,
    columnWidth: 1180,
  },
  header: { preset: "wordmark-right", sticky: true, transparent: true },
  footer: { preset: "stacked-mono" },
  defaultAnimation: "fade-up",
  sections: [
    { id: "s-hero", type: "hero-parallax", animate: "fade-up", title: "Home",
      props: {
        kicker: "DARKROOM FILMS",
        title: creator?.name || "Voss",
        sub: "Six films. One safelight. Long stares.",
        bgImage: "noir-rain",
        overlay: 0.6,
        parallax: 0.4,
        cta: { label: "Watch the work", href: "#films" },
      } },
    { id: "s-marquee", type: "marquee", animate: "fade-in", width: "full", pad: "none", margin: "none",
      props: { text: "WORK CURRENTLY ON THE WALL · STILL DEVELOPING · DO NOT EXPOSE TO LIGHT", speed: 22 } },
    { id: "s-stats", type: "stats", animate: "fade-up",
      props: { stats: [
        { k: "Films",     v: "6"   },
        { k: "Years",     v: "11"  },
        { k: "Holders",   v: "212" },
        { k: "Followers", v: "84k" },
      ]} },
    { id: "s-featured", type: "featured", animate: "fade-up", title: "Featured",
      props: { filmId: "ll" } },
    { id: "s-upcoming", type: "upcoming", animate: "fade-up", title: "Upcoming", inMenu: true,
      props: {
        headline: "What's coming",
        items: [
          { date: "JUN 14", time: "9:00 PM ET", title: "Last Light · Ep 09", sub: "Episode drop · Watch", cta: "Remind me" },
          { date: "JUL 02", time: "Festival",   title: "Bluejay · 4K restoration", sub: "Festival debut · Marseille", cta: "Tickets" },
          { date: "AUG 01", time: "Production", title: "Untitled · feature",  sub: "Principal photography starts", cta: "Watchlist" },
        ],
      } },
    { id: "s-branched", type: "branched-shelf", animate: "fade-up", title: "Branched", inMenu: true,
      props: { headline: "Branched films · vote at every fork" } },
    { id: "s-news", type: "blog", animate: "fade-up", title: "Notebook", inMenu: true,
      props: { headline: "Notebook",
        posts: [
          { date: "May 22, 2026", read: "8 min", title: "Why we shoot on safelight",   excerpt: "It's not nostalgia. It's that the wait teaches you what the photo is going to be.",
            body: "Digital shows you the frame before you've earned it. Under safelight there is a gap — thirty seconds, sometimes a full minute — where the image exists only as a guess. That gap is where the film gets made. You learn to hold a picture in your head long enough to want it, and wanting it changes how you frame the next one." },
          { date: "May 14, 2026", read: "5 min", title: "Working with Cina v3 for casting", excerpt: "The actor vault changed how we block. We can carry a face across every scene.",
            body: "We used to block scenes around availability. Now the vault carries a performer's face, voice, and gait across every setup, so blocking starts from the shot instead of the schedule. The strange result: rehearsal matters more, not less. The performance is the one thing the vault can't invent." },
          { date: "May 03, 2026", read: "12 min", title: "Score lessons · 'Last Light'",    excerpt: "A note on writing for the held image. Three rules I broke. One I won't again.",
            body: "Rule one: never score the stare. I broke it in reel four and the shot died — music told the audience what to feel before the face could. Rule two: silence is a cue, not an absence. Rule three: if the theme survives being hummed badly, it's strong enough. The rule I won't break again is the first one." },
        ],
      } },
    { id: "s-store", type: "store", animate: "fade-up", title: "Store", inMenu: true,
      props: { headline: "Wear the work", layout: "grid",
        products: [
          { name: "Poster · Last Light", price: 38, color: tkc("blood"), kind: "POSTER" },
          { name: "OST · vinyl 2LP",     price: 42, color: "var(--c-amber)", kind: "VINYL" },
          { name: "Darkroom tee",        price: 28, color: tkc("panel-2"), kind: "APPAREL" },
        ],
      } },
    { id: "s-holders", type: "holders", animate: "fade-up", title: "Producers",
      props: { headline: "Producers · 212 holders" } },
    { id: "s-films", type: "films", animate: "fade-up", title: "Films", inMenu: true,
      props: { creatorId: "voss", layout: "grid" } },
    { id: "s-press", type: "press", animate: "fade-up",
      props: { quotes: [
        { source: "Sight & Sound", text: "A patient terror that never lifts." },
        { source: "Letterboxd",    text: "Watched it. Slept with the lights on." },
      ]} },
    { id: "s-about", type: "about", animate: "fade-up", title: "About",
      props: { text: "Soren Voss makes films one frame at a time. Each is hand-developed in the studio under safelight, then scanned. The wait is part of the work." } },
    { id: "s-newsletter", type: "newsletter", animate: "fade-up",
      props: { headline: "A frame, once a month.",
        sub: "No spoilers. No selling. One image and a paragraph." } },
    { id: "s-contact", type: "contact", animate: "fade-up", title: "Contact", inMenu: true,
      props: { email: "studio@voss.cina", agent: "WME · Sara Lim",
        formEnabled: true, formHeadline: "Send a note", formSubline: "Reach the studio. I read everything." } },
    { id: "s-footer", type: "footer", animate: "none",
      props: {} },
  ],
});

// ─── Persistence ────────────────────────────────────────────────────────

const PAGES_LS_V2 = "cina:studio-pages-v2";
function loadPagesV2() {
  try { const s = localStorage.getItem(PAGES_LS_V2); return s ? JSON.parse(s) : {}; } catch { return {}; }
}
function savePagesV2(pages) {
  try { localStorage.setItem(PAGES_LS_V2, JSON.stringify(pages)); } catch {}
}
// Publish history — every publish keeps a snapshot so one bad publish is
// never one-way. Capped at 5 per studio.
const PAGES_HIST_LS_V2 = "cina:studio-pages-v2-history";
function wbLoadSnapshotsV2(id) {
  try { return (JSON.parse(localStorage.getItem(PAGES_HIST_LS_V2) || "{}")[id]) || []; } catch { return []; }
}
function wbPushSnapshotV2(id, page) {
  try {
    const all = JSON.parse(localStorage.getItem(PAGES_HIST_LS_V2) || "{}");
    all[id] = [{ at: Date.now(), page }, ...(all[id] || [])].slice(0, 5);
    localStorage.setItem(PAGES_HIST_LS_V2, JSON.stringify(all));
  } catch {}
}
// Site inbox — contact-form messages + newsletter subscribers land here so
// the studio can read them from the dashboard (studio-site-panel in Cina.html).
const SITE_INBOX_LS = "cina:site-inbox-v1";
function wbInboxLoad() {
  try { return JSON.parse(localStorage.getItem(SITE_INBOX_LS) || "null") || { messages: [], subscribers: [] }; }
  catch { return { messages: [], subscribers: [] }; }
}
function wbInboxPush(kind, entry) {
  try {
    const box = wbInboxLoad();
    box[kind] = [{ ...entry, at: Date.now() }, ...(box[kind] || [])].slice(0, 200);
    localStorage.setItem(SITE_INBOX_LS, JSON.stringify(box));
    window.dispatchEvent(new Event("cina:site-inbox"));
  } catch {}
}

// ─── Background image library (placeholders) ─────────────────────────────

const BG_IMAGES = {
  "noir-rain":    { tint: tkc("blood"), film: "ll",        grain: "rain",  blurb: "Noir · rain on glass" },
  "sodium":       { tint: tkc("cat-3"), film: "carrion",   grain: "lamp",  blurb: "Sodium streetlight · dusk" },
  "desert":       { tint: tkc("cat-4"), film: "swallows",  grain: "dust",  blurb: "Desert · gold hour" },
  "darkroom":     { tint: tkc("blood"), film: "thefence",  grain: "vignette", blurb: "Darkroom · red safelight" },
  "ocean":        { tint: tkc("cat-1"), film: "drift",     grain: "fog",   blurb: "Ocean · cold morning" },
  "studio":       { tint: tkc("ink-3"), film: "marauder",  grain: "flat",  blurb: "Studio · charcoal cyc" },
  "snow":         { tint: tkc("ink"), film: "verge",     grain: "flake", blurb: "Snow · grey daylight" },
  "smoke":        { tint: tkc("line-3"), film: "frequency", grain: "smoke", blurb: "Smoke · stage light" },
};

// Resolve a library entry to a real catalog still (photo-backed FrameThumb kind).
function bgPhotoKind(cfg) {
  if (!cfg || !cfg.film) return null;
  const f = (window.CATALOG || []).find(x => x.id === cfg.film);
  return f ? f.thumb : null;
}

function BgImage({ id, src, overlay = 0.5, parallaxY = 0, children }) {
  const cfg = BG_IMAGES[id] || BG_IMAGES["noir-rain"];
  const photoKind = bgPhotoKind(cfg);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: -40,
        background: `linear-gradient(135deg, ${cfg.tint}66, ${tkc("black")} 75%)`,
        transform: `translateY(${parallaxY}px)`,
        transition: "transform 0.08s linear",
      }}>
        {/* Real imagery — custom upload wins, then a catalog still, then the procedural fallback */}
        {src ? (
          <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>
        ) : photoKind && window.FrameThumb ? (
          <FrameThumb kind={photoKind} usePhoto/>
        ) : (
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }}>
          <defs>
            <radialGradient id={`bg-${id}`} cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor={cfg.tint} stopOpacity="0.65"/>
              <stop offset="55%" stopColor={tkc("black")} stopOpacity="0.85"/>
              <stop offset="100%" stopColor={tkc("black")} stopOpacity="1"/>
            </radialGradient>
            <linearGradient id={`bg-grad-${id}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={cfg.tint} stopOpacity="0.18"/>
              <stop offset="100%" stopColor={tkc("black")} stopOpacity="0.95"/>
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="1600" height="900" fill={`url(#bg-${id})`}/>
          <rect x="0" y="0" width="1600" height="900" fill={`url(#bg-grad-${id})`}/>
          {/* Faux subject */}
          <g opacity="0.6">
            <ellipse cx="800" cy="520" rx="180" ry="220" fill={`${cfg.tint}55`}/>
            <ellipse cx="800" cy="380" rx="80" ry="100" fill={`${cfg.tint}88`}/>
          </g>
          {/* Grain dots */}
          {Array.from({ length: 90 }).map((_, k) => (
            <circle key={k} cx={(k * 73 + 47) % 1600} cy={(k * 137 + 23) % 900} r="0.8" fill={tkc("white")} opacity={0.05 + (k % 3) * 0.04}/>
          ))}
        </svg>
        )}
      </div>
      {/* Overlay */}
      <div style={{ position: "absolute", inset: 0, background: `rgba(8,8,10,${overlay})`, pointerEvents: "none" }}/>
      <div style={{ position: "relative", height: "100%" }}>{children}</div>
    </div>
  );
}

// ─── Animate-in wrapper ──────────────────────────────────────────────────

function AnimateIn({ kind = "fade-up", children, style }) {
  const ref = urbCo(null);
  const [shown, setShown] = usbCo(false);
  uebCo(() => {
    if (kind === "none" || !ref.current) { setShown(true); return; }
    // If the element is already in the viewport on mount, show immediately —
    // never gate first paint on the observer.
    const r = ref.current.getBoundingClientRect();
    if (r.top < (window.innerHeight || 800) && r.bottom > 0) { setShown(true); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { setShown(true); io.disconnect(); }
      });
    }, { threshold: 0.15 });
    io.observe(ref.current);
    // Safety: if IO never fires (throttled iframe, print, background tab),
    // reveal anyway — a visible page always beats a perfect entrance.
    const safety = setTimeout(() => { setShown(true); io.disconnect(); }, 900);
    return () => { io.disconnect(); clearTimeout(safety); };
  }, [kind]);
  const base = { transition: "transform 800ms cubic-bezier(.2,.7,.2,1), opacity 600ms ease-out", willChange: "transform, opacity" };
  const styles = (() => {
    switch (kind) {
      case "fade-in": return { ...base, opacity: shown ? 1 : 0 };
      case "fade-up": return { ...base, opacity: shown ? 1 : 0, transform: shown ? "translateY(0)" : "translateY(40px)" };
      case "fade-down": return { ...base, opacity: shown ? 1 : 0, transform: shown ? "translateY(0)" : "translateY(-32px)" };
      case "slide-left": return { ...base, opacity: shown ? 1 : 0, transform: shown ? "translateX(0)" : "translateX(-40px)" };
      case "slide-right":return { ...base, opacity: shown ? 1 : 0, transform: shown ? "translateX(0)" : "translateX(40px)" };
      case "zoom":      return { ...base, opacity: shown ? 1 : 0, transform: shown ? "scale(1)" : "scale(0.97)" };
      case "blur":      return { ...base, opacity: shown ? 1 : 0, filter: shown ? "blur(0)" : "blur(12px)" };
      case "none":      return {};
      default:          return { ...base, opacity: shown ? 1 : 0, transform: shown ? "translateY(0)" : "translateY(40px)" };
    }
  })();
  return <div ref={ref} style={{ ...styles, ...style }}>{children}</div>;
}

// ─── Header preset library ──────────────────────────────────────────────

const HEADER_PRESETS = [
  { id: "wordmark-right", name: "Wordmark · right menu",  blurb: "Classic editorial." },
  { id: "wordmark-center",name: "Wordmark · center menu", blurb: "Symmetrical, magazine." },
  { id: "logo-only",      name: "Logo only",              blurb: "Minimal. Menu in footer." },
  { id: "hamburger",      name: "Hamburger · left",       blurb: "Hidden until tapped." },
  { id: "split-bar",      name: "Split bar",              blurb: "Logo + menu + CTA on far right." },
  { id: "framed",         name: "Framed",                 blurb: "Hairline border under header." },
  { id: "transparent",    name: "Transparent overlay",    blurb: "Hero shows through." },
  { id: "ticker",         name: "Ticker + menu",          blurb: "Live status above menu." },
  { id: "stacked-serif",  name: "Stacked serif",          blurb: "Big wordmark over centered menu." },
  { id: "pill-nav",       name: "Pill nav",               blurb: "Menu inside a rounded capsule." },
  { id: "sidebar-mark",   name: "Sidebar mark",           blurb: "Logo left, contact + menu right." },
];

const FOOTER_PRESETS = [
  { id: "stacked-mono",   name: "Stacked · mono",         blurb: "Three columns, code-style labels." },
  { id: "single-line",    name: "Single line",            blurb: "Wordmark · year · social row." },
  { id: "big-cta",        name: "Big CTA",                blurb: "Newsletter-style block + minimal links." },
  { id: "manifesto",      name: "Manifesto",              blurb: "Studio's own credo, signed." },
  { id: "directory",      name: "Directory",              blurb: "All sub-pages + contact + legal." },
  { id: "marquee-tail",   name: "Marquee tail",           blurb: "Scrolling fact + tiny menu." },
  { id: "centered-mark",  name: "Centered mark",          blurb: "Logo, one line, centered links." },
  { id: "two-tone",       name: "Two-tone band",          blurb: "Accent band over dark base." },
  { id: "minimal-legal",  name: "Minimal legal",          blurb: "Just © and legal links." },
];


// ─── Default props per type ─────────────────────────────────────────────

function defaultPropsV2(type, creator) {
  switch (type) {
    case "hero":             return { kicker: (creator?.name || "Studio").toUpperCase(), title: creator?.name || "Studio", sub: "One sentence — your studio's why." };
    case "hero-parallax":    return { kicker: (creator?.name || "Studio").toUpperCase(), title: creator?.name || "Studio", sub: "One sentence — your studio's why.", bgImage: "sodium", overlay: 0.5, parallax: 0.4, cta: { label: "Watch the work", href: "#films" } };
    case "hero-video":       return { kicker: "NOW SHOWING", title: creator?.name || "Studio", sub: "Auto-playing reel as bg.", filmId: "ll" };
    case "hero-split":       return { kicker: "STUDIO", title: creator?.name || "Studio", sub: "Image left, copy right.", bgImage: "darkroom" };
    case "marquee":          return { text: "NEW WORK · STILL DEVELOPING · COMING SOON", speed: 22 };
    case "about":            return { text: "A few words about the studio." };
    case "press":            return { quotes: [{ source: "Variety", text: "Watch this director." }] };
    case "stats":            return { stats: [{ k: "Films", v: "4" }, { k: "Years", v: "7" }, { k: "Awards", v: "3" }] };
    case "timeline":         return { headline: "Career", items: [
      { year: "2019", title: "First short", sub: "Festival debut at Sundance" },
      { year: "2022", title: "First feature", sub: "Limited theatrical release" },
      { year: "2025", title: "First branched film", sub: "81 cuts. 2,840 watching live." },
    ] };
    case "featured":         return { filmId: "ll" };
    case "films":            return { creatorId: creator?.id || "voss", layout: "grid" };
    case "branched-shelf":   return { headline: "Branched films · choose-your-own" };
    case "episodes-shelf":   return { headline: "Series · seasons" };
    case "trailers-shelf":   return { headline: "Trailers · short cuts" };
    case "gallery":          return { headline: "Stills", count: 8, filmId: "ll" };
    case "actor-vault":      return { headline: "The cast", subline: "Faces trained for this studio's films" };
    case "upcoming":         return { headline: "What's coming", items: [
      { date: "JUN 14", time: "9:00 PM", title: "Episode drop", sub: "Watch · Series", cta: "Remind me" },
      { date: "JUL 02", time: "Festival", title: "Festival premiere", sub: "Marseille", cta: "Tickets" },
    ] };
    case "news":             return { headline: "News & notes", posts: [
      { date: "May 22", title: "Notes from this week", excerpt: "What I'm working on and why." },
      { date: "May 14", title: "On directing AI",       excerpt: "A short essay." },
    ] };
    case "holders":          return { headline: "Producers · holders" };
    case "newsletter":       return { headline: "Get a frame, monthly.", sub: "No spam. One image and a paragraph." };
    case "contact":          return { email: `studio@${creator?.id || "voss"}.cina`, agent: "", phone: "+49 30 555 01 92", address: "Ritterstraße 12 · 10969 Berlin", hours: "Tue–Fri · 10–6 CET", formEnabled: true, formHeadline: "Send a note", formSubline: "I read everything." };
    case "faq":              return { headline: "Questions", items: [
      { q: "Where can I watch the films?", a: "Every finished film streams on this site and on the studio's Cina profile. Festival cuts screen where listed under Upcoming." },
      { q: "Do you take commissions?", a: "Occasionally — one commissioned piece per year. Write through the contact form with a one-paragraph brief." },
      { q: "Can I license a still or the score?", a: "Yes. Stills and score cues are licensable for editorial and film use — include the frame or cue you're after." },
    ] };
    case "awards":           return { headline: "Selections", items: [
      { fest: "CANNES · SEMAINE", year: "2025", note: "Official selection" },
      { fest: "ROTTERDAM · IFFR", year: "2024", note: "Tiger competition" },
      { fest: "TELLURIDE",        year: "2024", note: "Premiere" },
      { fest: "NYFF",             year: "2023", note: "Main slate" },
    ] };
    case "logos":            return { items: ["VARIETY", "SIGHT & SOUND", "MUBI", "CRITERION", "INDIEWIRE"] };
    case "crew":             return { headline: "The crew", people: [
      { name: "N. Voss",    role: "Director · editor" },
      { name: "L. Ademi",   role: "Cinematography" },
      { name: "R. Sandoval",role: "Score" },
      { name: "H. Brandt",  role: "Production design" },
    ] };
    case "cta":              return { kicker: "NOW SHOWING", headline: "Watch the new film.", sub: "Streaming on Cina — first week free for followers.", label: "Watch now", href: "#" };
    case "store":            return { headline: "Store", products: [
      { name: "Poster · Last Light",  price: 38, color: tkc("blood"), kind: "POSTER" },
      { name: "OST · vinyl 2LP",       price: 42, color: "var(--c-amber)", kind: "VINYL" },
      { name: "Screenplay · book",     price: 24, color: tkc("cat-1"), kind: "BOOK" },
    ] };
    case "shop-nft":         return { headline: "Available now · holder drops" };
    case "blog":             return { headline: "Notebook", posts: [
      { date: "May 22, 2026", read: "8 min", title: "Why we shoot on safelight",   excerpt: "It's not nostalgia. It's that the wait teaches you what the photo is going to be." },
      { date: "May 14, 2026", read: "5 min", title: "Working with Cina v3 for casting", excerpt: "The actor vault changed how we block. We can carry a face across every scene." },
      { date: "May 03, 2026", read: "12 min", title: "Score lessons · 'Last Light'", excerpt: "A note on writing for the held image. Three rules I broke. One I won't again." },
      { date: "Apr 24, 2026", read: "4 min", title: "Branched cinema: the new theatre", excerpt: "The room is a co-author. That's the whole bet." },
    ] };
    case "spacer":           return { size: 80 };
    case "image":            return { src: null, filmId: "ll", caption: "", aspect: "21/9" };
    case "video":            return { filmId: "ll", caption: "", duration: "2:31" };
    case "footer":           return {};
    default:                 return {};
  }
}

// ─── Preview canvas ─────────────────────────────────────────────────────

// Per-breakpoint theme: Tablet/Mobile can override the desktop fontScale +
// spacing so type and rhythm are tuned separately per device. Desktop is the
// base; a device value of null/undefined inherits it.
function wbEffectiveTheme(theme, mode) {
  const bp = mode === "phone" ? "Mobile" : mode === "tablet" ? "Tablet" : null;
  if (!bp) return theme;
  const fs = theme["fontScale" + bp];
  const sp = theme["spacing" + bp];
  return {
    ...theme,
    fontScale: fs != null ? fs : theme.fontScale,
    spacing: sp != null ? sp : theme.spacing,
  };
}


// ─── Primitives ─────────────────────────────────────────────────────────

const inpV2 = {
  width: "100%", background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
  borderRadius: "var(--r-2)", padding: "8px 10px", color: "var(--c-ink)",
  fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)", outline: "none",
};
const smBtnV2 = {
  padding: "8px 14px", background: "transparent",
  border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)",
  color: "var(--c-ink-2)", fontSize: "var(--fs-body)", cursor: "pointer",
  fontFamily: "var(--f-mono)", letterSpacing: ".16em", textTransform: "uppercase",
};
const smallTool = {
  padding: "9px 10px", background: "var(--c-bg)",
  border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
  color: "var(--c-ink-2)", fontSize: "var(--fs-label)", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
  fontFamily: "var(--f-mono)", letterSpacing: ".16em", fontWeight: 600,
  whiteSpace: "nowrap",
};

function FieldV2({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", textTransform: "uppercase" }}>{label}</span>
      <div>{children}</div>
    </label>
  );
}

// Inspector group — a tab panel inside the inspector tabs, or a collapsible group elsewhere.
function InsGroup({ n, label, open, onToggle, children, badge, tabbed }) {
  if (tabbed) return open ? <section role="tabpanel" aria-label={label} style={{ display: "flex", flexDirection: "column", gap: 18, padding: "20px 2px" }}>{children}</section> : null;
  return (
    <section style={{ borderTop: "1px solid var(--c-line)" }}>
      <button onClick={onToggle} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 10,
        padding: "14px 2px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: open ? "var(--c-ink)" : "var(--c-ink-3)", fontWeight: 600, textTransform: "uppercase" }}>{label}</span>
        {badge && <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", border: "1px solid rgba(var(--accent-rgb),.35)", borderRadius: "var(--r-1)", padding: "1px 5px" }}>{badge}</span>}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ marginLeft: "auto", color: open ? "var(--c-amber)" : "var(--c-ink-4)", transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "2px 2px 20px" }}>{children}</div>}
    </section>
  );
}
function ColorRow({ label, value, onChange }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)", padding: 3, minWidth: 0 }}>
        <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ width: 26, height: 26, border: "none", padding: 0, background: "transparent", cursor: "pointer", flexShrink: 0 }}/>
        <input value={value} onChange={e => onChange(e.target.value)} style={{ flex: 1, background: "transparent", border: "none", color: "var(--c-ink)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", minWidth: 0, width: "100%" }}/>
      </div>
    </label>
  );
}
function SliderV2({ label, min, max, step, value, onChange, fmt }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{label}</span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{fmt ? fmt(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{ width: "100%", accentColor: tkc("amber") }}/>
    </div>
  );
}
function SelectV2({ label, value, onChange, options }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{label.toUpperCase()}</span>}
      <select value={value} onChange={e => onChange(e.target.value)} style={inpV2}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
function ToggleV2({ label, value, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "5px 8px", background: value ? "rgba(var(--accent-rgb),.08)" : "transparent", border: "1px solid var(--c-line)", borderRadius: "var(--r-1)", flex: 1 }}>
      <span style={{
        width: 30, height: 16, borderRadius: "var(--r-2)", padding: 1.5,
        background: value ? "var(--c-amber)" : "var(--c-panel-3)",
        position: "relative", transition: "background .15s",
        flexShrink: 0,
      }}>
        <span style={{
          display: "block", width: 13, height: 13, borderRadius: "50%", background: value ? tkc("on-amber") : "var(--c-ink-3)",
          transform: value ? "translateX(14px)" : "translateX(0)",
          transition: "transform .15s",
        }}/>
      </span>
      <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} style={{ display: "none" }}/>
      <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{label}</span>
    </label>
  );
}

Object.assign(window, { BLOCK_LIBRARY_V2, WB_TIERS, wbTier, WB_BG_SWATCHES, WB_ACCENT_SWATCHES, WB_FONTS, WB_FONT_PAIRINGS, wbFont, DEFAULT_PAGE_V2, loadPagesV2, savePagesV2, wbLoadSnapshotsV2, wbPushSnapshotV2, wbInboxPush, BG_IMAGES, BgImage, AnimateIn, HEADER_PRESETS, FOOTER_PRESETS, defaultPropsV2, wbEffectiveTheme, inpV2, smBtnV2, smallTool, FieldV2, InsGroup, ColorRow, SliderV2, SelectV2, ToggleV2 });
