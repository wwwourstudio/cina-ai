// builder-canvas.jsx — Studio Builder preview canvas, site header and section renderer.

const { useState: usbCv, useEffect: uebCv, useRef: urbCv } = React;
function PreviewCanvasV2({ page, mode, selectedId, onSelect, onInsertAfter, onMove, onRemove, onDuplicate, draggingId, dropTarget, onDragStartSec, onDragOverSec, onDropSec, onDragEndSec }) {
  const t = wbEffectiveTheme(page.theme, mode);
  const width = mode === "phone" ? 390 : mode === "tablet" ? 768 : "100%";
  const maxWidth = mode === "desktop" ? "100%" : width;

  return (
    <div style={{
      width, maxWidth, minHeight: "100%",
      background: t.bg, color: t.ink,
      fontFamily: wbFont(t.bodyFont === undefined ? "sans" : t.bodyFont),
      fontSize: 16 * t.fontScale,
      position: "relative",
      overflow: "hidden",
      containerType: "inline-size",
    }}>
      {/* Header preset */}
      <RenderedHeader page={page} mode={mode}/>

      {page.sections.map(s => (
        <SectionRendererV2
          key={s.id}
          section={s}
          page={page}
          mode={mode}
          selected={selectedId === s.id}
          onClick={() => onSelect(s.id)}
          onInsertAfter={() => onInsertAfter(s.id)}
          onMove={(d) => onMove(s.id, d)}
          onRemove={() => onRemove(s.id)}
          onDuplicate={() => onDuplicate(s.id)}
          dragging={draggingId === s.id}
          dropBefore={dropTarget && dropTarget.id === s.id && dropTarget.pos === "before"}
          dropAfter={dropTarget && dropTarget.id === s.id && dropTarget.pos === "after"}
          onDragStartSec={onDragStartSec} onDragOverSec={onDragOverSec}
          onDropSec={onDropSec} onDragEndSec={onDragEndSec}
        />
      ))}

      {/* Pages that never inserted a footer block still get the page.footer
          preset — the footer picker, socials + profile mark always render. */}
      {!page.sections.some(s => s.type === "footer") && (
        <SectionRendererV2
          section={{ id: "__auto-footer", type: "footer", props: {} }}
          page={page} mode={mode} selected={false}
          onClick={() => {}} onInsertAfter={() => {}} onMove={() => {}} onRemove={() => {}} onDuplicate={() => {}}
        />
      )}

      {/* Tier badge for free tier — slim in-flow bar, never floats over chrome */}
      {page.tier === "free" && (
        <div style={{
          padding: "14px 24px",
          borderTop: `1px solid ${t.accent}22`,
          background: "rgba(0,0,0,.25)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: t.accent }}></span>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase", opacity: .55 }}>Built with Cina</span>
          <span style={{ opacity: .25 }}>·</span>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase", color: t.accent, opacity: .9 }}>Upgrade to remove</span>
        </div>
      )}
    </div>
  );
}

// ─── Rendered header (presets) ──────────────────────────────────────────

// Scroll the live page (or the builder's preview scroller) to a section.
// Smooth-scroll a section into view. NOTE: native scrollTo({behavior:"smooth"})
// is a silent no-op inside this app's nested scroll containers, so we tween
// scrollTop ourselves with rAF — reliable in the builder preview AND on the
// published site.
function wbScrollToSectionV2(id) {
  // Exact section id first; then a friendly-slug fallback so hand-typed
  // anchors like #films or #contact resolve to the matching section.
  let el = document.getElementById("sec-" + id) || document.getElementById(id);
  if (!el) {
    const want = String(id).toLowerCase();
    el = [...document.querySelectorAll("[id^='sec-']")].find(n => {
      const ty = (n.getAttribute("data-sec-type") || "").toLowerCase();
      const tl = (n.getAttribute("data-sec-title") || "").toLowerCase().replace(/\s+/g, "-");
      return ty === want || tl === want || ty.startsWith(want) || want.startsWith(ty);
    });
  }
  if (!el) return;
  let p = el.parentElement, scroller = null;
  while (p && p !== document.body) {
    const oy = getComputedStyle(p).overflowY;
    if ((oy === "auto" || oy === "scroll") && p.scrollHeight > p.clientHeight + 4) { scroller = p; break; }
    p = p.parentElement;
  }
  const OFFSET = 72;
  const container = scroller || document.scrollingElement || document.documentElement;
  const from = container.scrollTop;
  const to = scroller
    ? Math.max(0, el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - OFFSET)
    : Math.max(0, el.getBoundingClientRect().top + container.scrollTop - OFFSET);
  const dist = to - from;
  if (Math.abs(dist) < 2) return;
  const DUR = Math.min(720, Math.max(300, Math.abs(dist) * 0.5));
  const start = (typeof performance !== "undefined" ? performance.now() : Date.now());
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  // Timer-driven tween — fires even when rAF is throttled (background tab,
  // non-painting iframe), so the jump always lands.
  const timer = setInterval(() => {
    const t = Math.min(1, ((typeof performance !== "undefined" ? performance.now() : Date.now()) - start) / DUR);
    container.scrollTop = from + dist * ease(t);
    if (t >= 1) { container.scrollTop = to; clearInterval(timer); }
  }, 16);
}

// In-section links (film cards, watch buttons) act only on the LIVE site —
// inside the builder canvas a click keeps selecting the section instead.
function wbGo(e, to) {
  if (!e.currentTarget.closest("[data-wb-live]")) return;
  e.stopPropagation();
  if (window.navigate) window.navigate(to);
  else window.location.hash = "#" + to;
}

// Section types that auto-join the menu when none are explicitly flagged.
const WB_AUTO_MENU = {
  films: "Films", "branched-shelf": "Branched", upcoming: "Upcoming",
  store: "Store", blog: "Notebook", news: "Notebook", contact: "Contact",
  about: "About", featured: "Featured", holders: "Producers",
};

// The site menu is DYNAMIC — built from the page's sections. A section
// appears when its "Show in menu" toggle is on; if nothing is flagged we
// auto-detect common section types. Labels come from the editable title.
function wbMenuFromSections(page) {
  const sections = page.sections || [];
  const flagged = sections.filter(s => s.inMenu);
  const list = flagged.length
    ? flagged
    : sections.filter(s => WB_AUTO_MENU[s.type] && s.inMenu !== false).slice(0, 6);
  return list.map(s => ({
    id: s.id,
    label: s.title || WB_AUTO_MENU[s.type] || s.type,
    href: `#sec-${s.id}`,
  }));
}

function RenderedHeader({ page, mode }) {
  const { header, logo, theme, studioName } = page;
  const headlineFont = wbFont(theme.headlineFont);
  const accent = theme.accent;
  const preset = header?.preset || "wordmark-right";
  const transparent = header?.transparent || preset === "transparent";

  // Overlay headers gain a solid backdrop once the page scrolls past the
  // hero, so the nav never collides with section content underneath.
  const hdrRef = urbCv(null);
  const [hdrScrolled, setHdrScrolled] = usbCv(false);
  uebCv(() => {
    if (!transparent) return;
    const el = hdrRef.current;
    let target = null, node = el && el.parentElement;
    while (node && node !== document.body) {
      const oy = getComputedStyle(node).overflowY;
      if ((oy === "auto" || oy === "scroll") && node.scrollHeight > node.clientHeight + 4) { target = node; break; }
      node = node.parentElement;
    }
    const src = target || window;
    const read = () => setHdrScrolled((target ? target.scrollTop : window.scrollY) > 48);
    read();
    src.addEventListener("scroll", read, { passive: true });
    return () => src.removeEventListener("scroll", read);
  }, [transparent]);

  const renderLogo = (size = 28) => {
    if (logo?.kind === "image" && logo.src) {
      return <img src={logo.src} alt={studioName}
        style={{ height: size, width: "auto", objectFit: "contain", filter: logo.transparentBg ? "" : "" }}/>;
    }
    if (logo?.kind === "monogram") {
      const shape = logo.shape || "circle";
      const fill = (logo.color === "ink") ? theme.ink : accent;
      return (
        <div style={{
          width: size, height: size,
          borderRadius: shape === "circle" ? 999 : shape === "square" ? size * 0.18 : 0,
          background: shape === "none" ? "transparent" : fill,
          color: shape === "none" ? fill : theme.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: headlineFont, fontStyle: "italic", fontSize: size * (shape === "none" ? 0.7 : 0.5), fontWeight: 600,
        }}>{(logo?.text || studioName)[0]}</div>
      );
    }
    return (
      <span style={{
        fontFamily: headlineFont, fontStyle: "italic", fontSize: size * 0.75,
        color: theme.ink, fontWeight: 500, letterSpacing: "-0.01em",
      }}>{logo?.text || studioName}</span>
    );
  };

  const menu = wbMenuFromSections(page);
  const lastItem = menu[menu.length - 1] || { label: "Contact", id: null, href: "#" };

  // ── Scroll-spy: highlight the menu item for whichever section is centered
  //    in the viewport. Re-attaches when the menu set changes. ──
  const [activeSec, setActiveSec] = usbCv(null);
  uebCv(() => {
    const ids = menu.map(m => m.id).filter(Boolean);
    const els = ids.map(id => document.getElementById("sec-" + id)).filter(Boolean);
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActiveSec(e.target.id.replace(/^sec-/, "")); });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [menu.map(m => m.id).join(","), (page.sections || []).length]);

  const menuLink = (item, i) => {
    const isActive = item.id && item.id === activeSec;
    return (
    <a key={i} href={item.href || "#"}
      onClick={(e) => { if (item.id) { e.preventDefault(); wbScrollToSectionV2(item.id); } }}
      style={{
      color: isActive ? accent : theme.ink, opacity: isActive ? 1 : 0.78, textDecoration: "none",
      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
      textTransform: "uppercase", fontWeight: 600, cursor: "pointer",
      paddingBottom: 3, borderBottom: `1.5px solid ${isActive ? accent : "transparent"}`,
      transition: "color .2s, opacity .2s, border-color .2s", whiteSpace: "nowrap",
    }}>{item.label}</a>
    );
  };

  const wrap = (content, extra = {}) => {
    if (transparent) {
      // 0-height sticky shell: the hero still starts at the very top (the
      // overlay look is preserved) while the header stays pinned and gains
      // a backdrop once scrolled.
      return (
        <div style={{ position: header?.sticky === false ? "absolute" : "sticky", top: 0, left: 0, right: 0, zIndex: 5, height: 0 }}>
          <header ref={hdrRef} style={{
            padding: "18px 32px",
            background: hdrScrolled ? `${theme.bg}ee` : "transparent",
            backdropFilter: hdrScrolled ? "blur(10px)" : "none",
            borderBottom: header?.preset === "framed" ? `1px solid ${accent}33` : "none",
            transition: "background .25s ease",
            ...extra,
          }}>
            {content}
          </header>
        </div>
      );
    }
    return (
      <header style={{
        position: header?.sticky ? "sticky" : "static",
        top: 0, left: 0, right: 0, zIndex: 4,
        padding: "18px 32px",
        background: `${theme.bg}ee`,
        backdropFilter: "blur(10px)",
        borderBottom: header?.preset === "framed" ? `1px solid ${accent}33` : "none",
        ...extra,
      }}>
        {content}
      </header>
    );
  };

  if (preset === "logo-only") {
    return wrap(
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {renderLogo(36)}
      </div>
    );
  }

  // Phone: every preset collapses to logo + hamburger dropdown so the nav
  // never overflows off-screen.
  if (mode === "phone") {
    return <PhoneHeader wrap={wrap} renderLogo={renderLogo} menu={menu} theme={theme} accent={accent}/>;
  }
  if (preset === "hamburger") {
    return wrap(
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, cursor: "pointer" }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 20, height: 1.5, background: theme.ink }}/>)}
          </div>
          {renderLogo(28)}
        </div>
        <a href={lastItem.href || "#"} onClick={(e) => { if (lastItem.id) { e.preventDefault(); wbScrollToSectionV2(lastItem.id); } }} style={{ color: accent, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 600, textDecoration: "none", cursor: "pointer" }}>{lastItem.label}</a>
      </div>
    );
  }
  if (preset === "wordmark-center") {
    return wrap(
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {renderLogo(36)}
        <nav style={{ display: "flex", gap: 28 }}>
          {menu.map((m, i) => menuLink(m, i))}
        </nav>
      </div>
    );
  }
  if (preset === "split-bar") {
    return wrap(
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center" }}>
        {renderLogo(28)}
        <nav style={{ display: "flex", gap: 22 }}>
          {menu.slice(0, 4).map((m, i) => menuLink(m, i))}
        </nav>
        <div style={{ justifySelf: "end" }}>
          <a href={lastItem.href || "#"} onClick={(e) => { if (lastItem.id) { e.preventDefault(); wbScrollToSectionV2(lastItem.id); } }} style={{
            padding: "8px 16px",
            background: accent, color: theme.bg,
            borderRadius: 999, textDecoration: "none", cursor: "pointer",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
            fontWeight: 700, textTransform: "uppercase",
          }}>{lastItem.label}</a>
        </div>
      </div>
    );
  }
  if (preset === "transparent") {
    return wrap(
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {renderLogo(28)}
        <nav style={{ display: "flex", gap: 22 }}>{menu.map((m, i) => menuLink(m, i))}</nav>
      </div>
    );
  }
  if (preset === "ticker") {
    return wrap(
      <div>
        <div style={{
          padding: "4px 0",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent,
          letterSpacing: ".16em", textAlign: "center", marginBottom: 10,
        }}>● LIVE · 2,840 watching · 9 in studio · Next premiere Jun 14</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {renderLogo(28)}
          <nav style={{ display: "flex", gap: 22 }}>{menu.map((m, i) => menuLink(m, i))}</nav>
        </div>
      </div>
    );
  }
  if (preset === "stacked-serif") {
    return wrap(
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        {renderLogo(40)}
        <nav style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>{menu.map((m, i) => menuLink(m, i))}</nav>
      </div>
    );
  }
  if (preset === "pill-nav") {
    return wrap(
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        {renderLogo(28)}
        <nav style={{ display: "flex", gap: 6, alignItems: "center", padding: "6px 8px", borderRadius: 999, border: `1px solid ${accent}44`, background: `${accent}0f` }}>
          {menu.map((m, i) => menuLink(m, i))}
        </nav>
      </div>
    );
  }
  if (preset === "sidebar-mark") {
    return wrap(
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        {renderLogo(30)}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, textTransform: "uppercase" }}>{studioName} · est. 2024</span>
          <nav style={{ display: "flex", gap: 20 }}>{menu.map((m, i) => menuLink(m, i))}</nav>
        </div>
      </div>
    );
  }
  // wordmark-right + framed (default)
  return wrap(
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {renderLogo(28)}
      <nav style={{ display: "flex", gap: 22 }}>
        {menu.map((m, i) => menuLink(m, i))}
      </nav>
    </div>
  );
}

// Phone header — logo + hamburger that expands the full menu as a dropdown.
function PhoneHeader({ wrap, renderLogo, menu, theme, accent }) {
  const [open, setOpen] = usbCv(false);
  return wrap(
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {renderLogo(26)}
        <button onClick={() => setOpen(o => !o)} aria-label="Menu" style={{
          width: 38, height: 38, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
          background: "transparent", border: `1px solid ${accent}44`, borderRadius: "var(--r-2)", cursor: "pointer", flexShrink: 0,
        }}>
          {open
            ? <span style={{ color: theme.ink, fontSize: "var(--fs-lead)", lineHeight: 1 }}>✕</span>
            : [0, 1, 2].map(i => <span key={i} style={{ width: 18, height: 1.6, background: theme.ink, display: "block" }}/>)}
        </button>
      </div>
      {open && (
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${accent}22` }}>
          {menu.map((m, i) => (
            <a key={i} href={m.href || "#"} onClick={(e) => { if (m.id) { e.preventDefault(); wbScrollToSectionV2(m.id); } setOpen(false); }} style={{
              color: theme.ink, textDecoration: "none", padding: "11px 4px",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 600,
              borderBottom: `1px solid ${accent}14`, cursor: "pointer",
            }}>{m.label}</a>
          ))}
        </nav>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// SECTION RENDERER — switch on type
// ═════════════════════════════════════════════════════════════════════════

function SectionRendererV2({ section, page, mode, selected, onClick, onInsertAfter, onMove, onRemove, onDuplicate, dragging, dropBefore, dropAfter, onDragStartSec, onDragOverSec, onDropSec, onDragEndSec, siteId }) {
  const t0 = wbEffectiveTheme(page.theme, mode);
  const accent = t0.accent;
  const narrow = mode === "phone" || mode === "tablet";
  const phone = mode === "phone";
  const sid = siteId || (page.domain || "voss.cina").split(".")[0];
  // Per-section typography overrides (set in the section inspector).
  const typo = (section.props || {})._typo || {};
  const t = { ...t0, fontScale: (t0.fontScale || 1) * ((typo.scalePct || 100) / 100), headlineFont: typo.headline || t0.headlineFont };
  const headlineFont = wbFont(t.headlineFont);
  // A style block that pins weight / style / spacing on THIS section's headings
  // and body, overriding the section's inline defaults. Sizes stay %-relative
  // to the theme via fontScale above, so everything scales together.
  const typoStyle = (typo.weight || typo.italic != null || typo.letter != null || typo.bodyPct) ? (
    <style>{`
      #sec-${section.id} h1, #sec-${section.id} h2, #sec-${section.id} h3 {
        ${typo.weight ? `font-weight:${typo.weight}!important;` : ""}
        ${typo.italic === true ? "font-style:italic!important;" : typo.italic === false ? "font-style:normal!important;" : ""}
        ${typo.letter != null ? `letter-spacing:${typo.letter}em!important;` : ""}
      }
      ${typo.bodyPct ? `#sec-${section.id} p { font-size:${typo.bodyPct}%!important; }` : ""}
    `}</style>
  ) : null;
  const padY = 80 * t.spacing;

  // Per-section layout overrides — set in the section inspector.
  const PAD_MULT = { none: 0, compact: 0.45, normal: 1, spacious: 1.7 };
  const padMult = PAD_MULT[section.pad] != null ? PAD_MULT[section.pad] : 1;
  const secPadY = Math.round(padY * padMult);
  const widthMode = section.width || "container"; // container | wide | full
  const TONE_BG = { wash: `${accent}10`, panel: "rgba(255,255,255,.025)", deep: "rgba(0,0,0,.38)" };
  const toneBg = TONE_BG[(section.props || {})._bgTone] || null;
  // Margin between sections — set in the section inspector.
  const MARGIN = { none: 0, sm: 24, md: 56, lg: 96 };
  const secMargin = MARGIN[section.margin] != null ? MARGIN[section.margin] : 0;
  // Background media (image / video) baked behind the section content.
  const bgImageSrc = (section.props || {})._bgImageSrc;
  const bgVideoSrc = (section.props || {})._bgVideoSrc;
  const bgOverlay = (section.props || {})._bgOverlay ?? 0.55;
  const hasMediaBg = !!(bgImageSrc || bgVideoSrc);

  const dropLine = (where) => (
    <span style={{
      position: "absolute", [where]: -2, left: 0, right: 0, height: 3, zIndex: 6,
      background: accent, boxShadow: `0 0 10px ${accent}`,
    }}>
      <span style={{ position: "absolute", [where === "top" ? "top" : "bottom"]: -4, left: 18, width: 11, height: 11, borderRadius: "50%", background: accent }}/>
    </span>
  );

  const wrap = (children, opts = {}) => (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onDragOver={onDragOverSec ? (e) => onDragOverSec(e, section.id) : undefined}
      onDrop={onDropSec}
      id={"sec-" + section.id}
      data-sec-type={section.type}
      data-sec-title={section.title || ""}
      style={{
        position: "relative",
        margin: `${secMargin}px 0`,
        padding: opts.padless ? 0 : `${secPadY}px ${widthMode === "full" ? 0 : 32}px`,
        outline: selected ? `1.5px solid ${accent}` : "1px solid transparent",
        outlineOffset: -1,
        cursor: "pointer", transition: "outline-color .15s ease, opacity .15s ease",
        background: opts.bg || (hasMediaBg ? tkc("void") : toneBg) || "transparent",
        opacity: dragging ? 0.45 : 1,
        ...opts.style,
      }}>
      {/* Background media */}
      {bgVideoSrc && (
        <video src={bgVideoSrc} autoPlay muted loop playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}/>
      )}
      {!bgVideoSrc && bgImageSrc && (
        <img src={bgImageSrc} alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}/>
      )}
      {hasMediaBg && (
        <div style={{ position: "absolute", inset: 0, background: `rgba(8,8,10,${bgOverlay})`, zIndex: 0 }}/>
      )}
      {dropBefore && dropLine("top")}
      {dropAfter && dropLine("bottom")}
      {typoStyle}
      <AnimateIn kind={section.animate || "none"}>
        <div style={{
          position: "relative", zIndex: 1,
          maxWidth: (opts.padless || widthMode === "full") ? "100%" : widthMode === "wide" ? "min(1480px, 96%)" : t.columnWidth,
          margin: "0 auto",
        }}>
          {children}
        </div>
      </AnimateIn>
      {selected && <SectionToolbar accent={accent} onInsertAfter={onInsertAfter} onMove={onMove} onRemove={onRemove} onDuplicate={onDuplicate}
        onDragStart={onDragStartSec ? (e) => onDragStartSec(e, section.id) : undefined}
        onDragEnd={onDragEndSec}/>}
    </div>
  );

  switch (section.type) {
    case "hero": return wrap(
      <div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 16, textTransform: "uppercase", fontWeight: 700 }}>
          {section.props.kicker}
        </div>
        <h1 style={{
          fontFamily: headlineFont, fontStyle: "italic",
          fontSize: `clamp(${(narrow ? 46 : 64) * t.fontScale}px, ${narrow ? 13 : 8}cqi, ${120 * t.fontScale}px)`, fontWeight: 400, lineHeight: 0.95,
          margin: "0 0 24px", letterSpacing: "-0.02em",
        }}>{section.props.title}</h1>
        <p style={{ fontSize: 20 * t.fontScale, color: t.ink, opacity: 0.78, maxWidth: 620, lineHeight: 1.4 }}>{section.props.sub}</p>
      </div>
    );

    case "hero-parallax": return wrap(
      <ParallaxHero section={section} t={t} headlineFont={headlineFont} accent={accent} maxColumn={t.columnWidth} narrow={narrow}/>,
      { padless: true, style: { padding: 0 } }
    );

    case "hero-video":
      return wrap(<VideoHero section={section} t={t} headlineFont={headlineFont} accent={accent}/>, { padless: true });

    case "hero-split":
      return wrap(
        <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "1fr 1fr", gap: narrow ? 24 : 40, alignItems: "center" }}>
          <div style={{
            position: "relative", aspectRatio: narrow ? "16/9" : "4/5", overflow: "hidden",
            background: `linear-gradient(135deg, ${BG_IMAGES[section.props.bgImage]?.tint || accent}66, ${tkc("black")})`,
            border: `1px solid ${accent}33`,
          }}>
            <BgImage id={section.props.bgImage} src={section.props.bgSrc} overlay={0.35}/>
          </div>
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 14, textTransform: "uppercase" }}>{section.props.kicker}</div>
            <h1 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: `clamp(${(narrow ? 40 : 54) * t.fontScale}px, ${narrow ? 12 : 6}cqi, ${84 * t.fontScale}px)`, fontWeight: 400, margin: "0 0 18px", lineHeight: 0.95, letterSpacing: "-0.02em" }}>{section.props.title}</h1>
            <p style={{ fontSize: 17 * t.fontScale, lineHeight: 1.55, opacity: 0.78, maxWidth: 460 }}>{section.props.sub}</p>
          </div>
        </div>
      );

    case "faq": return wrap(
      <div style={{ maxWidth: 780 }}>
        <h2 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 44 * t.fontScale, fontWeight: 500, margin: "0 0 22px", letterSpacing: "-0.02em" }}>{section.props.headline}</h2>
        {(section.props.items || []).map((it, i) => (
          <details key={i} style={{ borderTop: `1px solid ${accent}33`, padding: "4px 0" }}>
            <summary style={{ cursor: "pointer", padding: "16px 0", fontFamily: headlineFont, fontStyle: "italic", fontSize: 21 * t.fontScale, fontWeight: 500, letterSpacing: "-0.01em", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <span>{it.q}</span><span style={{ color: accent, fontSize: "var(--fs-lead)", flexShrink: 0 }}>+</span>
            </summary>
            <p style={{ fontSize: 14.5 * t.fontScale, lineHeight: 1.6, opacity: 0.72, margin: "0 0 18px", maxWidth: 640 }}>{it.a}</p>
          </details>
        ))}
        <div style={{ borderTop: `1px solid ${accent}33` }}></div>
      </div>
    );

    case "awards": return wrap(
      <div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 26, textTransform: "uppercase" }}>{section.props.headline || "Selections"}</div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 190px), 1fr))`, gap: 18 }}>
          {(section.props.items || []).map((it, i) => (
            <div key={i} style={{ textAlign: "center", padding: "22px 12px", border: `1px solid ${accent}2e`, borderRadius: "var(--r-1)" }}>
              <div style={{ color: accent, fontSize: "var(--fs-lead)", marginBottom: 10 }}>❀</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", lineHeight: 1.5 }}>{it.fest}</div>
              <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 20 * t.fontScale, marginTop: 6 }}>{it.year}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.5, letterSpacing: ".16em", marginTop: 6, textTransform: "uppercase" }}>{it.note}</div>
            </div>
          ))}
        </div>
      </div>
    );

    case "logos": return wrap(
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "18px 32px", padding: "6px 0", borderTop: `1px solid ${accent}22`, borderBottom: `1px solid ${accent}22` }}>
        {(section.props.items || []).map((name, i) => (
          <span key={i} style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", letterSpacing: ".16em", opacity: 0.45, padding: "14px 0", whiteSpace: "nowrap" }}>{name}</span>
        ))}
      </div>
    );

    case "crew": return wrap(
      <div>
        <h2 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 44 * t.fontScale, fontWeight: 500, margin: "0 0 26px", letterSpacing: "-0.02em" }}>{section.props.headline}</h2>
        <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "1fr 1fr", gap: "0 48px" }}>
          {(section.props.people || []).map((p2, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, padding: "15px 0", borderTop: `1px solid ${accent}33` }}>
              <span style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 21 * t.fontScale, fontWeight: 500 }}>{p2.name}</span>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", opacity: 0.55, textTransform: "uppercase", textAlign: "right" }}>{p2.role}</span>
            </div>
          ))}
        </div>
      </div>
    );

    case "cta": return wrap(
      <div style={{ textAlign: "center", padding: "26px 0" }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 14, textTransform: "uppercase" }}>{section.props.kicker}</div>
        <h2 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: `clamp(${(narrow ? 34 : 44) * t.fontScale}px, 6cqi, ${72 * t.fontScale}px)`, fontWeight: 400, margin: 0, lineHeight: 1.02, letterSpacing: "-0.02em" }}>{section.props.headline}</h2>
        <p style={{ fontSize: 16 * t.fontScale, opacity: 0.7, margin: "16px auto 26px", maxWidth: 520, lineHeight: 1.5 }}>{section.props.sub}</p>
        <a href={section.props.href || "#"} onClick={(e) => {
          const h = section.props.href || "";
          if (h.startsWith("#") && h.length > 1) { e.preventDefault(); wbScrollToSectionV2(h.slice(1)); }
          else if (/^https?:\/\//.test(h)) { e.preventDefault(); window.open(h, "_blank", "noopener"); }
          else e.preventDefault();
        }} style={{ display: "inline-block", padding: "15px 34px", background: accent, color: t.bg, borderRadius: "var(--r-1)", textDecoration: "none", fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase" }}>{section.props.label} →</a>
      </div>
    );

    case "marquee":
      return wrap(
        <div style={{
          padding: "16px 0", borderTop: `1px solid ${accent}33`, borderBottom: `1px solid ${accent}33`,
          overflow: "hidden", whiteSpace: "nowrap",
          background: t.bg, position: "relative", zIndex: 1,
        }}>
          <div style={{
            fontFamily: typo.headline ? headlineFont : "var(--f-mono)", fontSize: 14 * t.fontScale, color: accent, letterSpacing: ".16em",
            animation: `wbV2Marquee ${section.props.speed || 22}s linear infinite`,
            display: "inline-block",
          }}>
            {(section.props.text + "  ✦  ").repeat(4)}
          </div>
          <style>{`@keyframes wbV2Marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
        </div>
      );

    case "stats": return wrap(
      <div style={{
        display: "grid",
        // Phone: always 2-up. Desktop: at most 4 across, so 5+ stats fall to
        // a second row instead of crushing the numerals.
        gridTemplateColumns: narrow
          ? "repeat(2, 1fr)"
          : `repeat(${Math.min(section.props.stats.length, 4)}, minmax(0, 1fr))`,
        gap: narrow ? "28px 20px" : "32px 24px",
      }}>
        {section.props.stats.map((st, i) => (
          <div key={i} style={{ borderTop: `1px solid ${accent}55`, paddingTop: 14 }}>
            <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: (narrow ? 40 : 64) * t.fontScale, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.02em", overflowWrap: "anywhere" }}>{st.v}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: t.ink, opacity: 0.55, letterSpacing: ".16em", marginTop: 8, textTransform: "uppercase" }}>{st.k}</div>
          </div>
        ))}
      </div>
    );

    case "timeline": return wrap(
      <div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 14 }}>{section.props.headline?.toUpperCase()}</div>
        <div style={{ position: "relative", paddingLeft: 28 }}>
          <div style={{ position: "absolute", left: 8, top: 4, bottom: 4, width: 1, background: `${accent}55` }}/>
          {section.props.items.map((it, i) => (
            <div key={i} style={{ position: "relative", paddingBottom: 22 }}>
              <span style={{ position: "absolute", left: -25, top: 8, width: 12, height: 12, borderRadius: "50%", background: accent, border: `2px solid ${t.bg}` }}/>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 4 }}>{it.year}</div>
              <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 22 * t.fontScale, fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.01em" }}>{it.title}</div>
              <div style={{ fontSize: 13 * t.fontScale, opacity: 0.7, marginTop: 4 }}>{it.sub}</div>
            </div>
          ))}
        </div>
      </div>
    );

    case "featured": {
      const film = typeof getFilm === "function" ? (getFilm(section.props.filmId) || (typeof CATALOG !== "undefined" ? CATALOG[0] : null)) : null;
      if (!film) return wrap(<div style={{ opacity: 0.5 }}>Featured film placeholder</div>);
      return wrap(
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 14, textTransform: "uppercase" }}>FEATURED</div>
          <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "1.4fr 1fr", gap: narrow ? 24 : 38, alignItems: narrow ? "stretch" : "end" }}>
            <div style={{ aspectRatio: "16/9", background: `linear-gradient(135deg, ${film.cover || accent}, ${tkc("black")} 100%)`, position: "relative", overflow: "hidden" }}>
              {window.FrameThumb && <FrameThumb kind={film.thumb} usePhoto/>}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.1) 55%, transparent 100%)" }}></div>
              <div style={{ position: "absolute", left: 20, bottom: 20, color: tkc("white") }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", opacity: 0.7 }}>{film.year}</div>
                <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 500 }}>{film.title}</div>
              </div>
            </div>
            <div>
              <h2 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: (narrow ? 34 : 48) * t.fontScale, fontWeight: 400, margin: 0, lineHeight: 1, letterSpacing: "-0.01em" }}>{film.title}</h2>
              <p style={{ fontSize: 14 * t.fontScale, opacity: 0.7, marginTop: 14, lineHeight: 1.55 }}>{film.synopsis}</p>
              <button onClick={(e) => wbGo(e, film.kind === "series" ? `/series/${film.id}` : `/film/${film.id}`)} style={{
                marginTop: 18, padding: "10px 18px", background: accent, color: t.bg,
                border: "none", borderRadius: 999, cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
              }}>Watch the film</button>
            </div>
          </div>
        </div>
      );
    }

    case "films": {
      const wantCid = section.props.creatorId || "";
      const films = typeof CATALOG !== "undefined" ? CATALOG.filter(f => f.creatorId === wantCid || f.creator?.toLowerCase().includes(wantCid)).slice(0, section.props.count || 6) : [];
      if (films.length === 0) return wrap(<div style={{ opacity: 0.5 }}>Films grid (no catalog loaded)</div>);
      const flayout = section.props.layout || "poster"; // poster | overlay | list
      const head = (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 26 }}>
          <h2 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 44 * t.fontScale, fontWeight: 500, margin: 0, letterSpacing: "-0.02em" }}>{section.props.headline || "Films"}</h2>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em" }}>{films.length} {films.length === 1 ? "WORK" : "WORKS"}</span>
        </div>
      );
      if (flayout === "list") {
        return wrap(
          <div>{head}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {films.map((f, i) => (
                <div key={f.id} className="wb-filmrow" onClick={(e) => wbGo(e, f.kind === "series" ? `/series/${f.id}` : `/film/${f.id}`)} style={{ display: "grid", gridTemplateColumns: "92px 1fr auto", gap: 22, alignItems: "center", padding: "18px 0", borderTop: `1px solid ${accent}22`, cursor: "pointer" }}>
                  <div style={{ aspectRatio: "3/4", borderRadius: "var(--r-2)", overflow: "hidden", position: "relative", background: `linear-gradient(135deg, ${f.cover || accent}55, ${tkc("black")})` }}>
                    {window.FrameThumb && <FrameThumb kind={f.thumb} usePhoto/>}
                  </div>
                  <div>
                    <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 26 * t.fontScale, fontWeight: 500, lineHeight: 1.1 }}>{f.title}</div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.55, letterSpacing: ".16em", marginTop: 6 }}>{f.year} · {f.runtime || (f.episodeCount + " EP")}</div>
                  </div>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", opacity: 0.8 }}>NO. {String(i + 1).padStart(2, "0")} →</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      // poster (clean, caption below) + overlay (caption on image)
      const overlay = flayout === "overlay";
      return wrap(
        <div>{head}
          <div style={{ display: "grid", gridTemplateColumns: films.length < 4 && !narrow ? `repeat(${films.length}, minmax(0, 300px))` : "repeat(auto-fill, minmax(220px, 1fr))", justifyContent: films.length < 4 && !narrow ? "center" : undefined, gap: 22 }}>
            {films.map((f, i) => (
              <div key={f.id} className="wb-filmcard" onClick={(e) => wbGo(e, f.kind === "series" ? `/series/${f.id}` : `/film/${f.id}`)} style={{ cursor: "pointer" }}>
                <div style={{ aspectRatio: "2/3", borderRadius: "var(--r-3)", overflow: "hidden", position: "relative", background: `linear-gradient(150deg, ${f.cover || accent}40, ${tkc("black")} 88%)`, border: `1px solid ${accent}1f` }}>
                  {window.FrameThumb && <FrameThumb kind={f.thumb} usePhoto/>}
                  <div style={{ position: "absolute", top: 12, left: 12, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tkc("white"), opacity: 0.85, letterSpacing: ".16em", mixBlendMode: "difference" }}>NO. {String(i + 1).padStart(2, "0")}</div>
                  {overlay && <>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.85), transparent 55%)" }}></div>
                    <div style={{ position: "absolute", left: 14, right: 14, bottom: 13, color: tkc("white") }}>
                      <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, lineHeight: 1.05 }}>{f.title}</div>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.7, letterSpacing: ".16em", marginTop: 5 }}>{f.year} · {f.runtime || (f.episodeCount + " EP")}</div>
                    </div>
                  </>}
                </div>
                {!overlay && (
                  <div style={{ padding: "12px 2px 0" }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 22 * t.fontScale, fontWeight: 500, lineHeight: 1.1 }}>{f.title}</span>
                      <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", flexShrink: 0 }}>{f.year}</span>
                    </div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.5, letterSpacing: ".16em", marginTop: 5, textTransform: "uppercase" }}>{f.runtime || (f.episodeCount + " episodes")}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "branched-shelf": return wrap(
      <BranchedShelf headlineFont={headlineFont} accent={accent} t={t} section={section}/>
    );
    case "episodes-shelf": return wrap(
      <EpisodesShelf headlineFont={headlineFont} accent={accent} t={t} section={section}/>
    );
    case "trailers-shelf": return wrap(
      <TrailersShelf headlineFont={headlineFont} accent={accent} t={t} section={section}/>
    );

    case "upcoming": return wrap(
      <div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 14, textTransform: "uppercase" }}>UPCOMING</div>
        <h2 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 44 * t.fontScale, fontWeight: 500, margin: "0 0 26px", letterSpacing: "-0.02em" }}>{section.props.headline}</h2>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {section.props.items.map((it, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: narrow ? "1fr" : "140px minmax(0, 1fr) auto",
              gap: narrow ? 12 : 28, alignItems: narrow ? "start" : "center",
              justifyItems: narrow ? "start" : "stretch",
              padding: "22px 0", borderTop: i === 0 ? `1px solid ${accent}55` : "none",
              borderBottom: `1px solid ${accent}22`,
            }}>
              <div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-title)", color: accent, letterSpacing: ".08em", fontWeight: 600 }}>{it.date}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.55, letterSpacing: ".16em", marginTop: 4 }}>{it.time}</div>
              </div>
              <div>
                <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 26 * t.fontScale, fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.01em" }}>{it.title}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.55, letterSpacing: ".16em", marginTop: 6, textTransform: "uppercase" }}>{it.sub}</div>
              </div>
              <button onClick={(e) => {
                if (!e.currentTarget.closest("[data-wb-live]")) return;
                e.stopPropagation();
                const key = `site:${page.domain || "studio"}:${it.title}`;
                if (window.pmToggleReminder) pmToggleReminder(key, { label: it.title, sub: `${page.studioName} · ${it.sub || ""}`, date: it.date, to: location.hash.slice(1) });
                else if (window.toast) toast({ title: "REMINDER SET", text: it.title, kind: "good" });
              }} style={{
                padding: "8px 16px", background: "transparent", color: accent,
                border: `1px solid ${accent}`, borderRadius: 999, cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
              }}>{it.cta}</button>
            </div>
          ))}
        </div>
      </div>
    );

    case "news": return wrap(
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 26 }}>
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 8, textTransform: "uppercase" }}>NEWS &amp; NOTES</div>
            <h2 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 44 * t.fontScale, fontWeight: 500, margin: 0, letterSpacing: "-0.02em" }}>{section.props.headline}</h2>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {section.props.posts.map((p, i) => (
            <article key={i} onClick={(e) => wbGo(e, `/site/${sid}/notebook/${i}`)} title="Read the post" style={{
              padding: 20, background: `${accent}08`, border: `1px solid ${accent}22`,
              borderRadius: "var(--r-2)", cursor: "pointer",
            }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 10, textTransform: "uppercase" }}>{p.date}</div>
              <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 22 * t.fontScale, fontWeight: 500, lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: 8 }}>{p.title}</div>
              <p style={{ fontSize: 13 * t.fontScale, lineHeight: 1.55, opacity: 0.7, margin: 0 }}>{p.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    );

    case "holders": return wrap(
      <HoldersBlock t={t} accent={accent} headlineFont={headlineFont} section={section}/>
    );

    case "newsletter": return wrap(
      <NewsletterBlock section={section} t={t} accent={accent} headlineFont={headlineFont}/>
    );

    case "contact": return wrap(
      <ContactBlock section={section} t={t} accent={accent} headlineFont={headlineFont}/>
    );

    case "store": return wrap(
      <StoreBlock section={section} t={t} accent={accent} headlineFont={headlineFont}/>
    );

    case "image": {
      const imf = (window.CATALOG || []).find(f => f.id === section.props.filmId);
      const imgBP = mode === "phone" ? "Mobile" : mode === "tablet" ? "Tablet" : "";
      const imgSize = (imgBP && section.props["size" + imgBP] != null) ? section.props["size" + imgBP] : (section.props.size != null ? section.props.size : 100);
      return wrap(
        <figure style={{ margin: 0 }}>
          <div style={{ position: "relative", width: imgSize + "%", marginLeft: "auto", marginRight: "auto", aspectRatio: section.props.aspect || "21/9", overflow: "hidden", borderRadius: "var(--r-2)", background: tkc("black") }}>
            {section.props.src
              ? <img src={section.props.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>
              : imf ? <FrameThumb kind={imf.thumb} usePhoto/> : null}
          </div>
          {section.props.caption ? <figcaption style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: t.ink, opacity: .55, marginTop: 10, textTransform: "uppercase", textAlign: "center" }}>{section.props.caption}</figcaption> : null}
        </figure>
      );
    }

    case "video": {
      const vf = (window.CATALOG || []).find(f => f.id === section.props.filmId) || (window.CATALOG || [])[0];
      const vsrc = section.props.src;
      return wrap(
        <div>
          <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", borderRadius: "var(--r-2)", background: tkc("black") }}>
            {vsrc
              ? <video src={vsrc} controls playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>
              : <>
                  {vf && <FrameThumb kind={vf.thumb} usePhoto/>}
                  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.55) 100%)" }}></div>
                  <button onClick={(e) => { e.stopPropagation(); if (window.toast) toast({ title: "ADD A VIDEO", text: "Pick a clip from the media library in the inspector.", kind: "good" }); }} style={{
                    position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
                    width: 72, height: 72, borderRadius: "50%", cursor: "pointer",
                    background: "rgba(0,0,0,.55)", backdropFilter: "blur(8px)",
                    border: `1.5px solid ${accent}`, color: accent, fontSize: "var(--fs-title)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>▶</button>
                  <span style={{ position: "absolute", right: 12, bottom: 12, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: tkc("white"), background: "rgba(0,0,0,.6)", padding: "3px 8px", borderRadius: "var(--r-1)" }}>{section.props.duration || "2:31"}</span>
                </>}
          </div>
          {section.props.caption ? <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: t.ink, opacity: .55, marginTop: 10, textTransform: "uppercase" }}>{section.props.caption}</div> : null}
        </div>
      );
    }

    case "blog": return wrap(
      <BlogBlock section={section} t={t} accent={accent} headlineFont={headlineFont} siteId={sid}/>
    );

    case "shop-nft": return wrap(
      <ShopNFTBlock section={section} t={t} accent={accent} headlineFont={headlineFont}/>
    );

    case "actor-vault": return wrap(
      <ActorVaultBlock section={section} t={t} accent={accent} headlineFont={headlineFont}/>
    );

    case "gallery": {
      // Real stills — frames pulled from the catalog, keyed off the picked film.
      const gAll = (window.CATALOG || []);
      const gFirst = gAll.findIndex(f => f.id === section.props.filmId);
      const gKinds = (gFirst >= 0 ? [...gAll.slice(gFirst), ...gAll.slice(0, gFirst)] : gAll).map(f => f.thumb);
      return wrap(
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
          <h2 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 40 * t.fontScale, fontWeight: 500, margin: 0, letterSpacing: "-0.02em" }}>{section.props.headline}</h2>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em" }}>{section.props.count} FRAMES</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridAutoRows: 140, gap: 8 }}>
          {Array.from({ length: section.props.count || 8 }).map((_, i) => {
            const big = i === 0;
            return (
              <div key={i} style={{
                gridColumn: big ? "span 2" : "span 1", gridRow: big ? "span 2" : "span 1",
                background: `linear-gradient(${(i * 53) % 360}deg, ${accent}33, ${tkc("black")} 90%)`,
                position: "relative", overflow: "hidden", border: `1px solid ${accent}22`,
              }}>
                {gKinds.length > 0 && window.FrameThumb && <FrameThumb kind={gKinds[i % gKinds.length]} usePhoto/>}
                <div style={{ position: "absolute", top: 8, left: 10, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tkc("white"), opacity: 0.85, letterSpacing: ".16em", textShadow: "0 1px 4px rgba(0,0,0,.85)" }}>FRAME {String(i + 1).padStart(2, "0")}</div>
              </div>
            );
          })}
        </div>
      </div>
      );
    }

    case "about": return wrap(
      <div style={{ maxWidth: 640 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 18, textTransform: "uppercase" }}>ABOUT</div>
        <p style={{ fontSize: 22 * t.fontScale, lineHeight: 1.55, fontFamily: headlineFont, fontStyle: "italic", fontWeight: 400, color: t.ink, opacity: 0.92 }}>{section.props.text}</p>
      </div>
    );

    case "press": return wrap(
      <div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 24, textTransform: "uppercase" }}>PRESS</div>
        <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: narrow ? 24 : 32 }}>
          {(section.props.quotes || []).map((q, i) => (
            <div key={i}>
              <div style={{ fontSize: 24 * t.fontScale, fontFamily: headlineFont, fontStyle: "italic", lineHeight: 1.35, marginBottom: 12 }}>"{q.text}"</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, fontWeight: 700, textTransform: "uppercase" }}>— {q.source}</div>
            </div>
          ))}
        </div>
      </div>
    );

    case "spacer": return wrap(<div style={{ height: section.props.size }}/>, { padless: true });

    case "footer": return wrap(<FooterBlock page={page} section={section} t={t} accent={accent} headlineFont={headlineFont} narrow={narrow}/>, { padless: true, style: { padding: 0 } });

    default:
      return wrap(<div style={{ opacity: 0.4 }}>Unknown block: {section.type}</div>);
  }
}

Object.assign(window, { PreviewCanvasV2, wbScrollToSectionV2, wbGo, RenderedHeader, SectionRendererV2 });
