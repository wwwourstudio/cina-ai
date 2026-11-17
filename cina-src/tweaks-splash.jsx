// tweaks-splash.jsx — Scoped CSS rules for Display Mood, Editorial Density, and Projection Motion.
// Controlled exclusively from the User Settings menu (CinaAppearance in cina-identity.jsx).

(function () {
  const SHEET = `
/* ─────────── PALETTE — full mood remixes ─────────── */
body[data-cina-mood="darkroom"] [data-cina-vignette] {
  background: radial-gradient(ellipse at 60% 50%,
              rgba(122,30,22,.0) 25%,
              rgba(82,12,8,.55) 95%) !important;
}
body[data-cina-mood="darkroom"] .pm-hero__scrim {
  background: linear-gradient(0deg,var(--c-bg) 0%,rgba(10,8,7,.62) 24%,rgba(10,8,7,0) 56%),
              linear-gradient(90deg,rgba(15,4,3,.88) 0%,rgba(15,4,3,.42) 38%,transparent 70%) !important;
}

/* Daylight — archival cream paper & bronze */
body[data-cina-mood="daylight"] {
  color-scheme: light;
}
body[data-cina-mood="daylight"] .pm-hero__scrim {
  background: linear-gradient(0deg,var(--c-bg) 0%,rgba(243,238,226,.78) 26%,rgba(243,238,226,.12) 60%),
              linear-gradient(90deg,rgba(243,238,226,.94) 0%,rgba(243,238,226,.65) 38%,rgba(243,238,226,.08) 72%) !important;
}
body[data-cina-mood="daylight"] .pm-hero__main .pm-xl,
body[data-cina-mood="daylight"] .pm-hero__main .pm-lede {
  text-shadow: 0 2px 18px rgba(243,238,226,.85) !important;
}

/* Midnight — cold steel & cyan */
body[data-cina-mood="midnight"] [data-cina-vignette] {
  background: radial-gradient(ellipse at 60% 50%,
              transparent 30%,
              rgba(4,8,16,.6) 95%) !important;
}

/* ─────────── VOICE — editorial density ─────────── */
body[data-cina-voice="quiet"] [data-cina-banner="triptych"],
body[data-cina-voice="quiet"] [data-cina-banner="double"],
body[data-cina-voice="quiet"] [data-cina-banner="studios"],
body[data-cina-voice="quiet"] [data-cina-banner="nft"],
body[data-cina-voice="quiet"] .pm-hero__note,
body[data-cina-voice="quiet"] .pm-hero__aside {
  display: none !important;
}
body[data-cina-voice="quiet"] [data-cina-hero] {
  min-height: 58vh !important;
}

body[data-cina-voice="loud"] [data-cina-hero] {
  min-height: 92vh !important;
}
body[data-cina-voice="loud"] [data-cina-hero] h1 {
  font-size: clamp(3.5rem, 9vw, 8.5rem) !important;
  letter-spacing: -0.045em !important;
  line-height: .88 !important;
}

/* ─────────── MOTION — cinema feel ─────────── */
body[data-cina-motion="still"] [data-cina-drift],
body[data-cina-motion="still"] .pm-hero__img.is-on > * {
  animation: none !important;
}
body[data-cina-motion="still"] [data-cina-grain] {
  display: none !important;
}

body[data-cina-motion="cinema"] [data-cina-hero]::after {
  content: "";
  position: absolute; inset: 0;
  background: rgba(255,238,200,.04);
  mix-blend-mode: overlay;
  pointer-events: none;
  animation: cinaProjectorFlicker 4.2s steps(80) infinite;
  z-index: 1;
}
@keyframes cinaProjectorFlicker {
  0%, 100% { opacity: .15; }
  3%  { opacity: .75; }
  6%  { opacity: .10; }
  47% { opacity: .45; }
  79% { opacity: .65; }
}
`;

  function ensureSheet() {
    if (document.getElementById("__cina_tweaks_sheet")) return;
    const el = document.createElement("style");
    el.id = "__cina_tweaks_sheet";
    el.textContent = SHEET;
    (document.head || document.documentElement).appendChild(el);
  }

  function boot() {
    ensureSheet();
    window.__cinaLayout = "premiere";
    if (window.CinaAppearance) {
      window.CinaAppearance.applyToDOM();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
