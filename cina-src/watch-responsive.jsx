// watch-responsive.jsx — Mobile-responsive helpers for the Watch surface.
// Provides: useIsMobile hook, MobileNavDrawer slide-up sheet.
// Loaded in index.html right after primitives.jsx.

const { useState: rwUsw, useEffect: rwUew } = React;

// ─── Breakpoint hook ──────────────────────────────────────────────────────
// Returns true when viewport ≤ bp px. Re-evaluates on resize.
function useIsMobile(bp = 767) {
  const [m, setM] = rwUsw(() => window.innerWidth <= bp);
  rwUew(() => {
    const h = () => setM(window.innerWidth <= bp);
    window.addEventListener("resize", h, { passive: true });
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return m;
}

// ─── Mobile nav drawer ────────────────────────────────────────────────────
// Slide-up sheet with full nav + surface switcher. Triggered by the
// hamburger button TopNav renders on mobile.
function MobileNavDrawer({ open, onClose, navItems, isActive }) {
  if (!open) return null;
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 80,
          background: "rgba(0,0,0,.65)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          animation: "mndFadeIn .2s ease forwards",
        }}
      />

      {/* Sheet */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 81,
        background: "var(--c-panel)",
        borderTop: "1px solid var(--c-line)",
        borderRadius: "12px 12px 0 0",
        animation: "mndSlideUp .26s cubic-bezier(.32,.72,0,1) forwards",
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)",
      }}>
        {/* Handle pill */}
        <div style={{
          width: 32, height: 3, borderRadius: "var(--r-1)",
          background: "var(--c-line-3)",
          margin: "14px auto 4px",
        }}/>

        {/* Nav items */}
        <nav>
          {navItems.map(t => {
            const active = isActive(t.to);
            return (
              <button
                key={t.id}
                onClick={() => { window.location.hash = "#" + t.to; onClose(); }}
                style={{
                  width: "100%", padding: "13px 28px",
                  background: active ? "rgba(var(--accent-rgb),.06)" : "transparent",
                  border: "none",
                  borderLeft: `2px solid ${active ? "var(--c-amber)" : "transparent"}`,
                  display: "flex", alignItems: "center", gap: 14,
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <span style={{
                  fontFamily: "var(--f-display)", fontStyle: "italic",
                  fontSize: "var(--fs-title)", lineHeight: 1.2,
                  color: active ? "var(--c-amber)" : "var(--c-ink)",
                  letterSpacing: "-0.01em",
                }}>{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Surface switcher */}
        <div style={{
          borderTop: "1px solid var(--c-line)", marginTop: 8,
          padding: "16px 28px 4px",
        }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
            color: "var(--c-ink-4)", textTransform: "uppercase", marginBottom: 10,
          }}>Switch surface</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "Studio",    href: "Cina.html" },
              { label: "Producers", href: "Producers.html" },
            ].map(s => (
              <a key={s.label} href={s.href} style={{
                padding: "8px 14px",
                background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)",
                borderRadius: "var(--r-2)",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                color: "var(--c-ink-3)", textDecoration: "none",
                textTransform: "uppercase",
              }}>{s.label}</a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mndFadeIn  { from { opacity: 0; }                to { opacity: 1; }           }
        @keyframes mndSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </>
  );
}

Object.assign(window, { useIsMobile, MobileNavDrawer });

// ─── Mobile CSS overrides ─────────────────────────────────────────────────
// Injected once at parse time. Targets the data-* attributes already on
// Watch's sections and banners — no need to touch every JSX component.
(function () {
  if (document.getElementById("__watch-mobile-css")) return;
  const s = document.createElement("style");
  s.id = "__watch-mobile-css";
  s.textContent = `
    @media (max-width: 767px) {
      /* All banner sections: tighten horizontal padding */
      [data-cina-banner] {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }

      /* Poster triptych (3-col) → single column */
      [data-cina-banner="triptych"] > div {
        grid-template-columns: 1fr !important;
      }

      /* Double feature (2-col) → single column */
      [data-cina-banner="double"] > div {
        grid-template-columns: 1fr !important;
      }

      /* Genre tiles (6-col) → 3-col */
      [data-cina-banner="genre"] > div:last-child {
        grid-template-columns: repeat(3, 1fr) !important;
      }

      /* Studios grid → 2-col */
      [data-cina-banner="studios"] > div:last-child {
        grid-template-columns: repeat(2, 1fr) !important;
      }

      /* Chapter marks */
      [data-cina-chapter] {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }

      /* PageIntro sections */
      [class*="page-intro"], section[style*="padding: \"44px var(--gutter)"] {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }

      /* ── Generic reflow: collapse inline-styled grids ──────────────
         Watch pages lay out with inline style={{gridTemplateColumns}}.
         Attribute-substring selectors + !important reflow them all
         without touching each component. auto-fill/auto-fit grids are
         already responsive and left alone. */

      /* Sidebars + text panels: any 1-2 col / px-sidebar grid → single column */
      #root div[style*="grid-template-columns"]:not([style*="auto-fill"]):not([style*="auto-fit"]) {
        grid-template-columns: 1fr !important;
      }
      /* Card/poster grids (3+ cols) → 2-up */
      #root div[style*="repeat(3"]:not([style*="auto-fill"]):not([style*="auto-fit"]),
      #root div[style*="repeat(4"]:not([style*="auto-fill"]):not([style*="auto-fit"]),
      #root div[style*="repeat(5"]:not([style*="auto-fill"]):not([style*="auto-fit"]),
      #root div[style*="repeat(6"]:not([style*="auto-fill"]):not([style*="auto-fit"]),
      #root div[style*="repeat(8"]:not([style*="auto-fill"]):not([style*="auto-fit"]) {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      /* Genre tiles keep 3-up (small squares) */
      #root [data-cina-banner="genre"] > div:last-child[style*="grid-template-columns"],
      #root [data-cina-banner="genre"] > div:last-child {
        grid-template-columns: repeat(3, 1fr) !important;
      }

      /* Sections: tighten the big clamp() gutters */
      #root section { padding-left: 20px !important; padding-right: 20px !important; }

      /* Oversized display type scales down */
      #root h1 { font-size: clamp(30px, 9vw, 44px) !important; }

      /* Sticky side rails become normal flow */
      #root div[style*="position: sticky"], #root aside[style*="position: sticky"] {
        position: static !important;
      }

      /* Prevent any direct child of body from overflowing viewport */
      #root { overflow-x: hidden; }
      html, body { overflow-x: hidden; }
    }
  `;
  (document.head || document.documentElement).appendChild(s);
})();
