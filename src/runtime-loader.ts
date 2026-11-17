import './index.css';
import { initCinaEnhancer, type CinaSurface } from './cina-enhancer';

declare global {
  interface Window {
    cinaToast?: (opts: { title?: string; text?: string; tone?: string } | string) => void;
    __cinaNavigateSurface?: (href: string, customLabel?: string) => void;
    __cinaSplashDismiss?: () => void;
    __cinaBootedSurface?: string;
  }
}

function loadScriptSequential(src: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (reason?: unknown) => void) => {
    const existing = Array.from(document.scripts).find(
      (s: HTMLScriptElement) => s.getAttribute('src') === src
    );
    if (existing && existing.dataset.loaded === '1') {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => {
      script.dataset.loaded = '1';
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

function installIframeSafeDialogs() {
  window.alert = (msg?: unknown) => {
    const text = msg == null ? '' : String(msg);
    if (typeof window.cinaToast === 'function') {
      try {
        window.cinaToast({ title: 'NOTICE', text });
        return;
      } catch {
        // fallback below
      }
    }
    console.info('[Cina Notice]', text);
  };

  window.open = (url?: string | URL) => {
    if (!url) return window;
    const raw = String(url);
    try {
      const target = new URL(raw, window.location.href);
      if (target.origin === window.location.origin) {
        if (typeof window.__cinaNavigateSurface === 'function') {
          window.__cinaNavigateSurface(target.href);
        } else {
          window.location.href = target.href;
        }
        return window;
      }
      if (typeof window.cinaToast === 'function') {
        window.cinaToast({
          title: 'EXTERNAL LINK',
          text: target.href,
        });
      }
    } catch {
      // ignore invalid URL
    }
    return window;
  };
}

export async function bootCinaSurface(surface: CinaSurface): Promise<void> {
  if (window.__cinaBootedSurface === surface) return;
  window.__cinaBootedSurface = surface;

  document.body.dataset.surface = surface;
  installIframeSafeDialogs();

  try {
    await loadScriptSequential('/cina-tokens.js');
    await loadScriptSequential('/cina-splash.js');

    // Re-assert iframe-safe window.open wrapper after cina-splash.js attaches its handler
    installIframeSafeDialogs();
    initCinaEnhancer(surface);

    if (surface !== 'about') {
      await loadScriptSequential('/vendor/react.production.min.js');
      await loadScriptSequential('/vendor/react-dom.production.min.js');

      if (surface === 'watch' || surface === 'studio') {
        await loadScriptSequential('/vendor/three.min.js');
      }

      const bundleMap: Record<Exclude<CinaSurface, 'about'>, string> = {
        watch: '/bundles/watch.bundle.js',
        studio: '/bundles/studio.bundle.js',
        producers: '/bundles/producers.bundle.js',
      };
      await loadScriptSequential(bundleMap[surface]);
    }
  } catch (err) {
    console.error('[Cina Surface Boot Error]', err);
    const root = document.getElementById('root');
    if (root && !root.children.length) {
      root.innerHTML = `
        <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6%;background:var(--c-bg,#0a0a0a);color:var(--c-ink,#f3efe8);font-family:var(--f-sans,sans-serif);text-align:center;gap:1rem;">
          <div style="font-family:var(--f-mono,monospace);font-size:0.75rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--c-amber,#e5482f);">SURFACE RECOVERY</div>
          <h1 style="font-family:var(--f-display,serif);font-style:italic;font-size:clamp(1.75rem,3vw,2.6rem);margin:0;">Reloading projection room…</h1>
          <button onclick="window.location.reload()" style="padding:0.7rem 1.4rem;border-radius:4px;border:1px solid var(--c-amber,#e5482f);background:var(--c-amber,#e5482f);color:#0b0806;font-weight:600;cursor:pointer;">Reload</button>
        </div>
      `;
    }
  } finally {
    setTimeout(() => {
      if (typeof window.__cinaSplashDismiss === 'function') {
        window.__cinaSplashDismiss();
      }
    }, 240);
  }
}
