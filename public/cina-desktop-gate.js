// cina-desktop-gate.js — small-viewport interstitial.
//
// The product surfaces (Watch, Studio, Pitch, Producers) are designed for
// desktop. Until the responsive pass ships, this script intercepts visitors
// on viewports narrower than the gate breakpoint and offers them a choice:
//   • Continue anyway (dismissed for the rest of this session)
//   • Read the marketing pages instead (About / Strategy / Enterprise)
//
// Auto-runs on load. Dismissal is per-session (sessionStorage).
// To disable on a specific page, set `window.__cinaSkipDesktopGate = true`
// BEFORE this script loads.

(function () {
  if (window.__cinaDesktopGateInjected) return;
  window.__cinaDesktopGateInjected = true;
  if (window.__cinaSkipDesktopGate) return;

  const BREAKPOINT = 900; // px — narrower than this triggers the gate
  const SESSION_KEY = "__cina_desktop_gate_dismissed";

  // Don't show if user already dismissed this session
  try {
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;
  } catch (e) { /* sessionStorage might be blocked */ }

  // Bail out early if viewport is wide enough
  if (window.innerWidth >= BREAKPOINT) {
    // But still listen for resize — if the viewport shrinks past the
    // threshold we re-evaluate once on the next breakpoint cross.
    let armed = true;
    const onResize = () => {
      if (!armed) return;
      if (window.innerWidth < BREAKPOINT) {
        armed = false;
        injectGate();
      }
    };
    window.addEventListener("resize", onResize);
    return;
  }

  function injectGate() {
    try { if (sessionStorage.getItem(SESSION_KEY) === "1") return; } catch(e) {}
    if (document.getElementById("__cina-desktop-gate")) return;

    const surface = (location.pathname.split("/").pop() || "").toLowerCase();
    const surfaceLabel =
      /producers/.test(surface)  ? "Producers"  :
      /pitch/.test(surface)      ? "Pitch"      :
      /cina\.html/.test(surface) ? "Studio"     :
      /index|^$|^watch/.test(surface) ? "Watch" :
      "Cina";

    const style = document.createElement("style");
    style.id = "__cina-desktop-gate-style";
    style.textContent = `
      #__cina-desktop-gate {
        position: fixed; inset: 0; z-index: 99998;
        background: var(--c-void);
        display: flex; flex-direction: column;
        align-items: stretch; justify-content: flex-end;
        padding: 24px;
        animation: __dg-fade-in .35s ease forwards;
        overflow-y: auto;
      }
      #__cina-desktop-gate::before {
        content: ""; position: absolute; inset: 0;
        background:
          radial-gradient(ellipse at top right, rgba(229,72,47,.18) 0%, transparent 55%),
          radial-gradient(ellipse at bottom left, rgba(201,85,72,.10) 0%, transparent 60%);
        pointer-events: none;
      }
      #__cina-desktop-gate::after {
        content: ""; position: absolute; inset: 0;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        opacity: .035; mix-blend-mode: overlay; pointer-events: none;
      }
      .__dg-card {
        position: relative; z-index: 1;
        margin: auto 0 0;
        color: var(--c-ink);
        display: flex; flex-direction: column; gap: 14px;
        max-width: 520px; width: 100%;
        margin-left: auto; margin-right: auto;
      }
      .__dg-eyebrow {
        display: flex; align-items: center; gap: 10px;
        font-family: "JetBrains Mono", ui-monospace, monospace;
        font-size:var(--fs-label); letter-spacing: .26em;
        color: var(--c-ink-3); text-transform: uppercase;
        margin-bottom: 6px;
      }
      .__dg-eyebrow .dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: var(--c-amber); box-shadow: 0 0 8px var(--c-amber);
        animation: __dg-pulse 1.6s ease-in-out infinite;
      }
      .__dg-h1 {
        font-family: "Fraunces", Georgia, serif;
        font-style: italic; font-weight: 400;
        font-size:var(--fs-head); line-height: 0.98;
        color: var(--c-ink); margin: 0;
        letter-spacing: -0.025em;
        text-wrap: balance;
      }
      .__dg-h1 em { color: var(--c-amber); font-style: italic; }
      .__dg-lede {
        font-family: "Fraunces", Georgia, serif;
        font-style: italic; font-size:var(--fs-lead); line-height: 1.5;
        color: var(--c-ink-2); margin: 0 0 8px;
        max-width: 460px;
      }
      .__dg-row {
        display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;
      }
      .__dg-btn {
        flex: 1 1 auto;
        padding: 14px 18px;
        background: var(--c-amber); color: var(--c-on-amber);
        border: none; border-radius: 4px;
        font-family: "JetBrains Mono", ui-monospace, monospace;
        font-size:var(--fs-label); font-weight: 700; letter-spacing: .18em;
        text-transform: uppercase; text-decoration: none;
        cursor: pointer; text-align: center;
        transition: background .14s ease;
      }
      .__dg-btn:hover { background: var(--c-amber-x); }
      .__dg-btn.__dg-sec {
        background: transparent; color: var(--c-ink);
        border: 1px solid var(--c-line-3);
      }
      .__dg-btn.__dg-sec:hover { border-color: var(--c-ink); }
      .__dg-meta {
        margin-top: 18px; padding-top: 14px;
        border-top: 1px solid var(--c-line);
        display: flex; gap: 18px; flex-wrap: wrap;
        font-family: "JetBrains Mono", ui-monospace, monospace;
        font-size:var(--fs-label); letter-spacing: .18em;
        color: var(--c-line-3); text-transform: uppercase;
      }
      .__dg-meta a {
        color: var(--c-ink-3); text-decoration: none;
        border-bottom: 1px solid rgba(128,122,108,.4);
        padding-bottom: 2px;
      }
      .__dg-meta a:hover { color: var(--c-amber); border-color: rgba(229,72,47,.5); }
      .__dg-mark {
        position: absolute; top: 28px; left: 28px;
        font-family: "Fraunces", Georgia, serif;
        font-style: italic; font-weight: 400;
        font-size:var(--fs-title); color: var(--c-ink);
        letter-spacing: -0.02em; line-height: 1;
        z-index: 1;
        display: flex; align-items: center; gap: 10px;
      }
      .__dg-mark .sub {
        font-family: "JetBrains Mono", ui-monospace, monospace;
        font-size:var(--fs-label); letter-spacing: .26em;
        color: var(--c-ink-3); text-transform: uppercase;
        padding-left: 10px; border-left: 1px solid var(--c-line-2);
      }
      @keyframes __dg-fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes __dg-pulse {
        0%, 100% { transform: scale(1);   opacity: 1; }
        50%      { transform: scale(.7);  opacity: .55; }
      }
    `;
    document.head.appendChild(style);

    const gate = document.createElement("div");
    gate.id = "__cina-desktop-gate";
    gate.setAttribute("role", "dialog");
    gate.setAttribute("aria-label", "Best on desktop");
    gate.innerHTML = `
      <div class="__dg-mark">
        Cina
        <span class="sub">${surfaceLabel.toUpperCase()}</span>
      </div>
      <div class="__dg-card">
        <div class="__dg-eyebrow"><span class="dot"></span>Best on desktop</div>
        <h1 class="__dg-h1">Cina ${surfaceLabel} is built for <em>a bigger screen.</em></h1>
        <p class="__dg-lede">
          The product surface is keyboard and mouse-first for now. A responsive pass is on the roadmap — until then, we'd rather show you the building from the right window.
        </p>
        <div class="__dg-row">
          <a href="About.html" class="__dg-btn">Read About instead →</a>
          <button class="__dg-btn __dg-sec" data-dg-continue>Continue anyway</button>
        </div>
        <div class="__dg-meta">
          <span>${window.innerWidth}px viewport · we recommend ≥ ${BREAKPOINT}px</span>
        </div>
      </div>
    `;

    function attach() {
      if (document.body) {
        document.body.appendChild(gate);
        // Wire the dismiss button
        const dismissBtn = gate.querySelector("[data-dg-continue]");
        if (dismissBtn) {
          dismissBtn.addEventListener("click", () => {
            try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) {}
            gate.style.opacity = "0";
            gate.style.pointerEvents = "none";
            setTimeout(() => { gate.remove(); style.remove(); }, 350);
          });
        }
      } else {
        requestAnimationFrame(attach);
      }
    }
    attach();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectGate, { once: true });
  } else {
    injectGate();
  }
})();
