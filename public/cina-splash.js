// cina-splash.js — universal Cina page loader, route progress bar, and iframe-safe surface bridge.
// Injects the full-bleed Cina splash on initial load and cross-surface transitions,
// renders a slim 2px top progress bar on hash route changes, and routes internal
// window.open / target="_blank" calls seamlessly inside the frame.

(function () {
  if (window.__cinaSplashInjected) return;
  window.__cinaSplashInjected = true;

  const style = document.createElement("style");
  style.id = "__cina-splash-style";
  style.textContent = `
    #__cina-splash {
      position: fixed; inset: 0; z-index: 99999;
      background: var(--c-bg, #0a0a0a);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 28px;
      transition: opacity .42s cubic-bezier(.16,1,.3,1), visibility .42s cubic-bezier(.16,1,.3,1);
      pointer-events: none;
    }
    #__cina-splash.is-done {
      opacity: 0; visibility: hidden;
    }
    #__cina-splash .__cs-mark {
      font-family: "Bodoni Moda", Didot, "Bodoni 72", Georgia, serif;
      font-style: italic; font-weight: 400;
      font-size: var(--fs-display, clamp(40px, 6vw, 64px)); letter-spacing: -.025em;
      color: var(--c-ink, #f3efe8);
      opacity: 0;
      animation: __cs-fade-in .45s ease forwards;
      display: flex; align-items: center; gap: 14px;
    }
    #__cina-splash .__cs-mark::after {
      content: "";
      width: 9px; height: 9px; border-radius: 50%;
      background: var(--c-amber, #e5482f);
      box-shadow: 0 0 18px rgba(229,72,47,.7);
      animation: __cs-pulse 1.4s ease-in-out infinite;
    }
    #__cina-splash .__cs-tag {
      font-family: "JetBrains Mono", ui-monospace, monospace;
      font-size: var(--fs-label, 11px); letter-spacing: .28em;
      color: var(--c-ink-3, #918a80); text-transform: uppercase;
      opacity: 0; animation: __cs-fade-in .45s .1s ease forwards;
    }
    #__cina-splash .__cs-bar {
      width: 280px; height: 2px;
      background: rgba(229,72,47,.14);
      border-radius: 2px; overflow: hidden;
      opacity: 0; animation: __cs-fade-in .45s .2s ease forwards;
    }
    #__cina-splash .__cs-bar > span {
      display: block; height: 100%;
      background: linear-gradient(90deg, transparent 0%, var(--c-amber, #e5482f) 50%, transparent 100%);
      width: 60%; transform: translateX(-100%);
      animation: __cs-slide 1.35s cubic-bezier(.5,0,.5,1) infinite;
    }
    #__cina-splash::before {
      content: ""; position: absolute; inset: 0;
      pointer-events: none; opacity: .04; mix-blend-mode: overlay;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
    }
    #__cina-route-bar {
      position: fixed; top: 0; left: 0; right: 0; height: 2px;
      z-index: 99990; pointer-events: none;
      background: transparent; opacity: 0;
      transition: opacity .22s ease;
    }
    #__cina-route-bar.is-active { opacity: 1; }
    #__cina-route-bar > span {
      display: block; width: 100%; height: 100%;
      background: linear-gradient(90deg, var(--c-amber, #e5482f), var(--c-amber-x, #ff6b4f));
      transform-origin: left center;
      transform: scaleX(0);
      transition: transform .28s cubic-bezier(.16,1,.3,1);
      box-shadow: 0 0 10px rgba(229,72,47,.55);
    }
    @keyframes __cs-fade-in {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes __cs-pulse {
      0%, 100% { transform: scale(1);   opacity: 1;   }
      50%      { transform: scale(.7);  opacity: .55; }
    }
    @keyframes __cs-slide {
      0%   { transform: translateX(-110%); }
      100% { transform: translateX(380%);  }
    }
    @media (prefers-reduced-motion: reduce) {
      #__cina-splash .__cs-bar > span,
      #__cina-splash .__cs-mark::after { animation: none; }
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  const splash = document.createElement("div");
  splash.id = "__cina-splash";
  splash.setAttribute("aria-hidden", "true");
  splash.innerHTML = `
    <div class="__cs-mark">Cina</div>
    <div class="__cs-tag" id="__cs-tag-label">Loading the studio</div>
    <div class="__cs-bar"><span></span></div>
  `;

  const routeBar = document.createElement("div");
  routeBar.id = "__cina-route-bar";
  routeBar.setAttribute("aria-hidden", "true");
  routeBar.innerHTML = "<span></span>";

  function labelForTarget(pathStr, hashStr) {
    const path = (pathStr || "").toLowerCase();
    const hash = (hashStr || "").toLowerCase();
    if (/#\/build/.test(hash)) return "Loading Cina Site Builder";
    if (/#\/cast\/[^/]+\/studio/.test(hash)) return "Loading Actor AI Studio";
    if (/#\/journey|#\/talent/.test(hash)) return "Loading Career Timeline";
    if (/#\/payouts|#\/wallet|#\/leaderboard/.test(hash)) return "Loading Sales & Ledger";
    if (/#\/about\/blog/.test(hash)) return "Loading Editorial Dispatch";
    if (/#\/about\/press/.test(hash)) return "Loading Press Room";
    if (/producers/.test(path)) return "Loading Producer Market";
    if (/about/.test(path)) return "Loading Cina Manifesto";
    if (/cina\.html|\/cina$/i.test(path)) {
      if (/vault/.test(hash)) return "Loading Performer Vault";
      if (/analytics/.test(hash)) return "Loading Studio Analytics";
      if (/editor/.test(hash)) return "Loading NLE Timeline";
      return "Loading Cina Studio";
    }
    return "Loading Cina Watch";
  }

  function attach() {
    if (document.body) {
      if (!document.getElementById("__cina-splash")) document.body.appendChild(splash);
      if (!document.getElementById("__cina-route-bar")) document.body.appendChild(routeBar);
    } else {
      requestAnimationFrame(attach);
    }
  }
  attach();

  const tagEl = splash.querySelector("#__cs-tag-label");
  if (tagEl) tagEl.textContent = labelForTarget(location.pathname, location.hash);

  let dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    splash.classList.add("is-done");
  }
  window.__cinaSplashDismiss = dismiss;

  window.__cinaNavigateSurface = function (href, customLabel) {
    if (!href) return;
    try {
      const u = new URL(href, location.href);
      const sameDoc = u.pathname === location.pathname && u.search === location.search;
      if (sameDoc) {
        location.hash = u.hash || "#/";
        return;
      }
      if (!document.getElementById("__cina-splash") && document.body) {
        document.body.appendChild(splash);
      }
      if (tagEl) {
        tagEl.textContent = customLabel || labelForTarget(u.pathname, u.hash);
      }
      dismissed = false;
      splash.classList.remove("is-done");
      setTimeout(() => { location.href = u.href; }, 160);
    } catch (_) {
      location.href = href;
    }
  };

  // Pulse top route progress bar on in-page hash navigation
  let barTimer1 = null, barTimer2 = null;
  function pulseRouteBar() {
    const inner = routeBar.firstElementChild;
    if (!inner) return;
    clearTimeout(barTimer1);
    clearTimeout(barTimer2);
    routeBar.classList.add("is-active");
    inner.style.transition = "none";
    inner.style.transform = "scaleX(0.18)";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        inner.style.transition = "transform .26s cubic-bezier(.16,1,.3,1)";
        inner.style.transform = "scaleX(0.92)";
      });
    });
    barTimer1 = setTimeout(() => {
      inner.style.transform = "scaleX(1)";
      barTimer2 = setTimeout(() => {
        routeBar.classList.remove("is-active");
      }, 150);
    }, 180);
  }
  window.addEventListener("hashchange", pulseRouteBar);

  // iFrame-safe interception for internal Cina surfaces
  function isInternalCinaUrl(raw) {
    if (!raw || typeof raw !== "string") return false;
    if (/^(mailto:|tel:|blob:|data:|javascript:)/i.test(raw)) return false;
    try {
      const u = new URL(raw, location.href);
      return u.origin === location.origin;
    } catch (_) {
      return false;
    }
  }

  const origOpen = window.open;
  window.open = function (url, target, features) {
    if (isInternalCinaUrl(url)) {
      window.__cinaNavigateSurface(String(url));
      return window;
    }
    return origOpen ? origOpen.call(window, url, target, features) : null;
  };

  document.addEventListener("click", function (e) {
    const a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || a.hasAttribute("download")) return;
    if (isInternalCinaUrl(href)) {
      if (a.getAttribute("target") === "_blank") {
        e.preventDefault();
        window.__cinaNavigateSurface(href);
      } else if (/\.(html)(#|$|\?)/i.test(href) && new URL(href, location.href).pathname !== location.pathname) {
        e.preventDefault();
        window.__cinaNavigateSurface(href);
      }
    }
  }, true);

  function ready() {
    const root = document.getElementById("root") || document.querySelector("[data-cina-root]") || document.body;
    if (!root) return false;
    if (root.id === "root") {
      return root.children.length > 0 && (root.firstElementChild?.innerHTML?.length || 0) > 120;
    }
    return document.body && document.body.scrollHeight > 200;
  }

  let attempts = 0;
  const maxAttempts = 60;
  const tick = () => {
    attempts += 1;
    if (ready() || attempts >= maxAttempts) {
      setTimeout(dismiss, attempts < 3 ? 280 : 140);
    } else {
      setTimeout(tick, 60);
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(tick, 40), { once: true });
  } else {
    setTimeout(tick, 40);
  }
})();
