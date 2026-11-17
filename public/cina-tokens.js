/* cina-tokens.js — THE token file.
   Every colour, fluid viewport-scaled type sizes, and architectural radii live here.
   CSS reads tokens as var(--c-*), var(--fs-*), var(--r-*).
   JS that needs a literal value (canvas, three.js, alpha math) calls tkc("name", alpha?). */
(function () {
  const MOODS = {
    premiere: {
      void: "#050505", bg: "#0a0a0a", panel: "#111111", "panel-2": "#171717", "panel-3": "#1f1f1f",
      line: "#232323", "line-2": "#2f2f2f", "line-3": "#404040",
      ink: "#f3efe8", "ink-2": "#c2bbb0", "ink-3": "#918a80", "ink-4": "#6e6961",
      amber: "#e5482f", "amber-x": "#ff6b4f", "amber-d": "#b8331d", "on-amber": "#130504",
      fonts: { display: '"Bodoni Moda", Didot, "Bodoni 72", Georgia, serif', sans: '"Plus Jakarta Sans", "DM Sans", ui-sans-serif, system-ui, sans-serif' },
    },
    programmer: {
      void: "#08080a", bg: "#0d0e10", panel: "#131418", "panel-2": "#181a1f", "panel-3": "#1f2127",
      line: "#25272d", "line-2": "#2e3038", "line-3": "#3a3d46",
      ink: "#e8e3d6", "ink-2": "#b9b3a4", "ink-3": "#807a6c", "ink-4": "#6a6456",
      amber: "#e8a33d", "amber-x": "#fbcb6e", "amber-d": "#b97f28", "on-amber": "#180d08",
      fonts: { display: '"Fraunces", "GT Sectra", Georgia, serif', sans: '"Plus Jakarta Sans", "DM Sans", ui-sans-serif, system-ui, -apple-system, sans-serif' },
    },
    darkroom: {
      void: "#050302", bg: "#0a0807", panel: "#14100e", "panel-2": "#1a1513", "panel-3": "#221a17",
      line: "#2a201d", "line-2": "#3a2b27", "line-3": "#4d3934",
      ink: "#efd9c8", "ink-2": "#b9a18d", "ink-3": "#8a7465", "ink-4": "#6a5649",
      amber: "#d24a3a", "amber-x": "#f06556", "amber-d": "#8a2018", "on-amber": "#140504",
      fonts: { display: '"Bodoni Moda", Didot, Georgia, serif', sans: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif' },
    },
    daylight: {
      void: "#ece6d5", bg: "#f3eee2", panel: "#fbf8ee", "panel-2": "#ffffff", "panel-3": "#ebe5d4",
      line: "#d4cdb9", "line-2": "#b8b09a", "line-3": "#968d76",
      ink: "#1a1812", "ink-2": "#4a4538", "ink-3": "#6b6455", "ink-4": "#8a826d",
      amber: "#b46a1f", "amber-x": "#d18430", "amber-d": "#8a4f13", "on-amber": "#fffaf0",
      fonts: { display: '"Bodoni Moda", Didot, Georgia, serif', sans: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif' },
      light: true,
    },
    midnight: {
      void: "#04060a", bg: "#07090d", panel: "#0d1219", "panel-2": "#131a24", "panel-3": "#1a2230",
      line: "#1f2735", "line-2": "#2a3344", "line-3": "#3a4458",
      ink: "#dde6f2", "ink-2": "#97a4b8", "ink-3": "#6f7d90", "ink-4": "#4f5a6c",
      amber: "#7eb6ff", "amber-x": "#b3d3ff", "amber-d": "#4a86d4", "on-amber": "#04101f",
      fonts: { display: '"Bodoni Moda", Didot, Georgia, serif', sans: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif' },
    },
  };

  const SHARED = {
    good: "#6aa37a", warn: "#d8a342", bad: "#c95548", rec: "#c95548",
    blood: "#7b2d26", "blood-x": "#a8392f", "blood-l": "#c95548",
    white: "#ffffff", black: "#000000",
    "cat-1": "#6aa3b8", "cat-2": "#9b8ec4", "cat-3": "#a85838", "cat-4": "#d4c5a0", "cat-5": "#5a8a6a", "cat-6": "#3d4f62",
  };

  const SITE = {
    themes: {
      darkroom: { bg: "#0d0a08", ink: "#efe6d6", accent: "#c8643c" },
      atlas:    { bg: "#0b1016", ink: "#e6edf3", accent: "#6aa3b8" },
      basement: { bg: "#000000", ink: "#e8e3d6", accent: "#a8392f" },
      tape:     { bg: "#100c16", ink: "#efe8f6", accent: "#c86bd8" },
      plains:   { bg: "#f3ead8", ink: "#2a241a", accent: "#b48a2c" },
      kitchen:  { bg: "#f6f3ee", ink: "#1c1915", accent: "#d0452c" },
      noir:     { bg: "#0a0a0a", ink: "#f2f2f2", accent: "#e5482f" },
      paper:    { bg: "#f4efe6", ink: "#1a1612", accent: "#a85838" },
      violet:   { bg: "#121018", ink: "#ebe6f4", accent: "#9b8ec4" },
      mono:     { bg: "#0c0c0c", ink: "#e9e9e9", accent: "#8a8a8a" },
      marine:   { bg: "#08121a", ink: "#e2edf2", accent: "#4fa3c7" },
      ochre:    { bg: "#120e08", ink: "#f0e6d2", accent: "#d8a342" },
      moss:     { bg: "#0b110d", ink: "#e4ede6", accent: "#6aa37a" },
    },
    swatches: {
      bg: ["#000000", "#0a0a0a", "#0d0a08", "#0b1016", "#100c16", "#120e08", "#0b110d", "#08121a", "#1a1512",
           "#f6f3ee", "#f4efe6", "#f3ead8", "#eef2f4", "#ffffff", "#e9e4da", "#f2ece4", "#efe9f6", "#e6efe8"],
      accent: ["#e5482f", "#c8643c", "#a8392f", "#d0452c", "#b48a2c", "#d8a342", "#6aa37a", "#4fa3c7", "#6aa3b8",
               "#9b8ec4", "#c86bd8", "#d4c5a0", "#8a8a8a", "#a85838", "#7b2d26", "#3d4f62", "#2e7d6b", "#e07a9a"],
    },
  };

  // Fluid viewport-responsive type scale — zero fixed pixel sizes.
  const TYPE = {
    label: "clamp(0.68rem, 0.72vw, 0.8rem)",
    body: "clamp(0.84rem, 0.88vw, 1rem)",
    lead: "clamp(1rem, 1.15vw, 1.32rem)",
    title: "clamp(1.32rem, 1.78vw, 2.05rem)",
    head: "clamp(1.85rem, 2.8vw, 3.35rem)",
    display: "clamp(2.6rem, 6.2vw, 7rem)",
  };

  // Crisp architectural radii in rem (scales proportionally with root percentage).
  const RADII = { 1: "0.2rem", 2: "0.35rem", 3: "0.45rem", full: "999rem" };

  const NEUTRAL_KEYS = ["void", "bg", "panel", "panel-2", "panel-3", "line", "line-2", "line-3", "ink", "ink-2", "ink-3", "ink-4", "amber", "amber-x", "amber-d", "on-amber"];
  const rgb = (h) => { h = h.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };

  function moodVars(m) {
    const P = MOODS[m] || MOODS.premiere;
    let s = NEUTRAL_KEYS.map(k => `--c-${k}:${P[k]};`).join("");
    s += `--accent-rgb:${rgb(P.amber).join(",")};--ink-rgb:${rgb(P.ink).join(",")};--bg-rgb:${rgb(P.bg).join(",")};`;
    s += `--c-agent-director:${P.amber};`;
    if (P.fonts) s += `--f-display:${P.fonts.display};--f-sans:${P.fonts.sans};`;
    s += P.light ? "color-scheme:light;" : "color-scheme:dark;";
    return s;
  }

  let css = ":root{";
  css += Object.entries(SHARED).map(([k, v]) => `--c-${k}:${v};`).join("");
  css += "--c-agent-editor:var(--c-blood-l);--c-agent-writer:var(--c-cat-4);--c-agent-visual:var(--c-cat-1);--c-agent-audio:var(--c-cat-2);";
  css += '--f-mono:"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;';
  css += Object.entries(TYPE).map(([k, v]) => `--fs-${k}:${v};`).join("");
  css += "--fs-xs:var(--fs-label);--fs-sm:var(--fs-body);--fs-base:var(--fs-body);--fs-md:var(--fs-lead);--fs-lg:var(--fs-lead);--fs-xl:var(--fs-title);--fs-2xl:var(--fs-head);--fs-hero:var(--fs-display);";
  css += Object.entries(RADII).map(([k, v]) => `--r-${k}:${v};`).join("");
  css += "--r-sm:var(--r-1);--r-md:var(--r-1);--r-lg:var(--r-2);--r-xl:var(--r-2);";
  css += "--gutter:4.5%;--w-page:100%;--sec-gap:6.5vh;";
  css += moodVars("premiere") + "}";
  Object.keys(MOODS).forEach(m => { css += `body[data-cina-mood="${m}"]{${moodVars(m)}}`; });
  css += `[data-theme="light"]{${moodVars("daylight")}}`;

  const existing = document.getElementById("cina-tokens");
  if (existing) existing.remove();
  const style = document.createElement("style");
  style.id = "cina-tokens";
  style.textContent = css;
  (document.head || document.documentElement).prepend(style);

  const savedMood = (() => {
    try {
      const m = localStorage.getItem("cina:mood");
      return m && MOODS[m] ? m : "premiere";
    } catch (_) {
      return "premiere";
    }
  })();

  function applySavedMoodOnBody() {
    if (!document.body) return;
    if (!document.body.dataset.cinaMood || !MOODS[document.body.dataset.cinaMood]) {
      document.body.dataset.cinaMood = savedMood;
    }
    try {
      const voice = localStorage.getItem("cina:voice");
      const motion = localStorage.getItem("cina:motion");
      if (voice) document.body.dataset.cinaVoice = voice;
      if (motion) document.body.dataset.cinaMotion = motion;
    } catch (_) {}
  }

  const currentMood = () => {
    const b = document.body;
    const m = b && b.dataset && b.dataset.cinaMood;
    return MOODS[m] ? m : savedMood;
  };

  function tkc(name, alpha) {
    const P = MOODS[currentMood()];
    const hex = (P && P[name]) || SHARED[name] || MOODS.premiere[name] || SHARED.black;
    if (alpha == null) return hex;
    return `rgba(${rgb(hex).join(",")},${Math.round(alpha * 1000) / 1000})`;
  }
  const tkv = (name) => `var(--c-${name})`;

  function setThemeColor() {
    applySavedMoodOnBody();
    let m = document.querySelector('meta[name="theme-color"]');
    if (!m) { m = document.createElement("meta"); m.name = "theme-color"; (document.head || document.documentElement).appendChild(m); }
    m.content = tkc("bg");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setThemeColor); else setThemeColor();

  window.CINA_TOKENS = { MOODS, SHARED, TYPE, RADII, SITE, setThemeColor };
  window.tkc = tkc;
  window.tkv = tkv;
})();
