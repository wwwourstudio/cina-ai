import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'cina-src');
const OUT_DIR = path.join(ROOT, 'public', 'bundles');

const WATCH_CHAIN = [
  'primitives.jsx', 'cina-ui.jsx', 'watch-responsive.jsx', 'cina-identity.jsx',
  'cina-auth.jsx', 'cina-actions.jsx', 'cina-catalog.jsx', 'cina-notifs.jsx',
  'watch-data.jsx', 'watch-studios-data.jsx', 'watch-ads.jsx', 'watch-state.jsx',
  'cina-voice.jsx', 'watch-shell.jsx', 'watch-splash.jsx', 'watch-splash-extras.jsx',
  'watch-player-ai.jsx', 'watch-fork-moment.jsx', 'watch-your-cut.jsx',
  'watch-shop-moment.jsx', 'watch-director-card.jsx', 'watch-watch.jsx',
  'watch-series.jsx', 'watch-series-arc.jsx', 'watch-studio-profile.jsx',
  'watch-studios-flows.jsx', 'watch-content-v4.jsx', 'watch-home-v3.jsx',
  'watch-promo.jsx', 'watch-home-v4.jsx', 'watch-taste.jsx', 'watch-poster.jsx',
  'watch-room-match.jsx', 'watch-money.jsx', 'watch-party.jsx', 'watch-premiere.jsx',
  'watch-producers-v2.jsx', 'watch-producers-shelf.jsx', 'watch-onboarding.jsx',
  'builder-media.jsx', 'builder-core.jsx', 'builder-blocks.jsx', 'builder-canvas.jsx',
  'builder-toolbar.jsx', 'builder-inspector.jsx', 'builder-modals.jsx',
  'builder-app.jsx', 'builder-v3-inspector.jsx', 'builder-wizard.jsx',
  'builder-templates.jsx', 'builder-cart.jsx', 'watch-site.jsx', 'watch-auction.jsx',
  'watch-cast.jsx', 'talent-core.jsx', 'vault-kit.jsx', 'cina-trend.jsx',
  'actor-ai-studio.jsx', 'watch-cast-v3.jsx', 'actor-journey-v2.jsx',
  'actor-gallery-3d-v2.jsx', 'watch-cast-v4.jsx', 'watch-footer.jsx',
  'watch-company.jsx', 'pay-drawer.jsx', 'nft-page.jsx', 'watch-flows.jsx',
  'watch-pages-v2.jsx', 'watch-extras.jsx', 'watch-library.jsx', 'festival.jsx',
  'festival-system.jsx', 'holder-rooms.jsx', 'strategy-watch.jsx',
  'festival-viewer.jsx', 'watch-branches.jsx', 'watch-branch-explorer.jsx',
  'watch-branches-v4.jsx', 'branched-monetize.jsx', 'watch-branched-v5.jsx',
  'watch-royalty.jsx', 'cina-cmdk-shared.jsx', 'watch-cmdk.jsx', 'watch-help.jsx',
  'premiere-kit.jsx', 'premiere-home.jsx', 'premiere-browse.jsx',
  'premiere-detail.jsx', 'premiere-pages.jsx', 'premiere-people.jsx',
  'premiere-you.jsx', 'premiere-more.jsx', 'premiere-lists.jsx', 'watch-app.jsx',
  'cina-orb.jsx', 'watch-genre-v2.jsx', 'watch-studios-v3.jsx',
  'watch-studios-v4.jsx', 'studio-token.jsx', 'launched-rooms.jsx',
  'festival-standings.jsx', 'film-crosslinks.jsx', 'producers-branched.jsx',
  'branched-rights.jsx', 'cut-rentals.jsx', 'festival-record.jsx',
  'cina-design-check.jsx', 'tweaks-panel.jsx', 'tweaks-splash.jsx',
];

const STUDIO_CHAIN = [
  'tweaks-panel.jsx', 'data.jsx', 'talent-core.jsx', 'promo-bridge.jsx',
  'primitives.jsx', 'cina-ui.jsx', 'cina-identity.jsx', 'cina-auth.jsx',
  'cina-actions.jsx', 'cina-catalog.jsx', 'cina-notifs.jsx', 'cina-state.jsx',
  'studio-ai-bridge.jsx', 'overlays.jsx', 'chat.jsx', 'director-hub.jsx', 'storyboard.jsx', 'bible.jsx',
  'vault-tabs.jsx', 'vault.jsx', 'actor-creator.jsx', 'vault-birth.jsx',
  'vault-v2.jsx', 'vault-wardrobe.jsx', 'actor-minds.jsx', 'actor-agent.jsx',
  'animations.jsx', 'titles.jsx', 'watch-data.jsx', 'producers-branched.jsx',
  'slate-signals.jsx', 'studio-slate.jsx', 'cina-voice.jsx', 'dashboard.jsx',
  'cockpit.jsx', 'studio-promotion.jsx', 'studio-analytics.jsx',
  'studio-site-panel.jsx', 'new-film.jsx', 'pay-drawer.jsx',
  'series-episodes.jsx', 'account-panels.jsx', 'script.jsx', 'script-flow.jsx',
  'editor.jsx', 'editor-panel.jsx', 'editor-cuts.jsx', 'score.jsx', 'mint.jsx',
  'studio-delivery.jsx', 'mint-drawer.jsx', 'generate-v2.jsx', 'branch-tree.jsx',
  'branch-handoff.jsx', 'branch-script.jsx', 'cuts.jsx', 'cina-autopilot.jsx',
  'cina-auto.jsx', 'cina-publish.jsx', 'cina-shortcuts.jsx',
  'cina-cmdk-shared.jsx', 'cina-cmdk.jsx', 'cina-tour.jsx', 'cina-orb.jsx',
  'memory.jsx', 'pipeline.jsx', 'cina-pipeline.jsx', 'cina-flow.jsx',
  'station-flow.jsx', 'studio-v2-timeline.jsx', 'studio-v2-panels.jsx',
  'studio-v2.jsx', 'shell.jsx', 'mobile.jsx', 'app.jsx', 'cina-onboard.jsx',
];

const PRODUCERS_CHAIN = [
  'primitives.jsx', 'cina-ui.jsx', 'watch-responsive.jsx', 'cina-identity.jsx',
  'cina-auth.jsx', 'cina-actions.jsx', 'cina-notifs.jsx', 'watch-data.jsx',
  'pitch-data.jsx', 'tweaks-panel.jsx', 'producers-branched.jsx',
  'branched-rights.jsx', 'pay-drawer.jsx', 'nft-page.jsx', 'watch-auction.jsx',
  'holder-hub.jsx', 'producer-state.jsx', 'producers-extras.jsx',
  'producers-create.jsx', 'strategy-producers.jsx', 'cina-cmdk-shared.jsx',
  'cina-voice.jsx', 'producers-app.jsx', 'cina-orb.jsx', 'cina-onboard.jsx',
];

const PROTECTED_GLOBALS = new Set([
  'React', 'ReactDOM', 'THREE',
  'window', 'self', 'globalThis', 'top', 'parent', 'frames', 'opener', 'closed',
  'length', 'name', 'status', 'location', 'history', 'document', 'navigator',
  'screen', 'origin', 'performance', 'localStorage', 'sessionStorage', 'indexedDB',
  'crypto', 'console', 'fetch', 'alert', 'confirm', 'prompt', 'open', 'close',
  'print', 'stop', 'focus', 'blur', 'scroll', 'scrollTo', 'scrollBy',
  'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'queueMicrotask',
  'requestAnimationFrame', 'cancelAnimationFrame', 'Event', 'CustomEvent',
  'EventTarget', 'URL', 'URLSearchParams', 'Blob', 'File', 'FileReader',
  'FormData', 'Headers', 'Request', 'Response', 'AbortController',
  'MutationObserver', 'ResizeObserver', 'IntersectionObserver',
  'Audio', 'Image', 'Option', 'Worker', 'WebSocket', 'XMLHttpRequest',
  'Math', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Symbol',
  'BigInt', 'Date', 'RegExp', 'Error', 'Map', 'Set', 'WeakMap', 'WeakSet',
  'Promise', 'Proxy', 'Reflect', 'Intl',
]);

function splitAtDepthZero(str, sepChar) {
  const parts = [];
  let cur = '';
  let p = 0, b = 0, c = 0;
  let quote = null;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (quote) {
      cur += ch;
      if (ch === '\\') {
        if (i + 1 < str.length) cur += str[++i];
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      cur += ch;
      continue;
    }
    if (ch === '(') p++;
    else if (ch === ')') p = Math.max(0, p - 1);
    else if (ch === '[') b++;
    else if (ch === ']') b = Math.max(0, b - 1);
    else if (ch === '{') c++;
    else if (ch === '}') c = Math.max(0, c - 1);

    if (ch === sepChar && p === 0 && b === 0 && c === 0) {
      parts.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) parts.push(cur);
  return parts;
}

function stripTopLevelDefault(lhs) {
  let p = 0, b = 0, c = 0;
  let quote = null;
  for (let i = 0; i < lhs.length; i++) {
    const ch = lhs[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '(') p++;
    else if (ch === ')') p = Math.max(0, p - 1);
    else if (ch === '[') b++;
    else if (ch === ']') b = Math.max(0, b - 1);
    else if (ch === '{') c++;
    else if (ch === '}') c = Math.max(0, c - 1);
    else if (ch === '=' && p === 0 && b === 0 && c === 0) {
      return lhs.slice(0, i).trim();
    }
  }
  return lhs.trim();
}

function extractBindingPattern(pattern, out) {
  let s = stripTopLevelDefault(pattern.trim());
  if (!s) return;
  if (s.startsWith('...')) s = s.slice(3).trim();
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(s)) {
    if (!PROTECTED_GLOBALS.has(s)) out.add(s);
    return;
  }
  if (s.startsWith('{') && s.endsWith('}')) {
    const inner = s.slice(1, -1);
    for (const prop of splitAtDepthZero(inner, ',')) {
      const t = prop.trim();
      if (!t) continue;
      if (t.startsWith('...')) {
        extractBindingPattern(t.slice(3), out);
        continue;
      }
      const colonParts = splitAtDepthZero(t, ':');
      if (colonParts.length >= 2) {
        extractBindingPattern(colonParts.slice(1).join(':'), out);
      } else {
        extractBindingPattern(t, out);
      }
    }
    return;
  }
  if (s.startsWith('[') && s.endsWith(']')) {
    const inner = s.slice(1, -1);
    for (const elem of splitAtDepthZero(inner, ',')) {
      extractBindingPattern(elem, out);
    }
  }
}

function extractTopLevelNamesFromCompiledJS(jsCode) {
  const names = new Set();
  const lines = jsCode.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // esbuild indents nested blocks with spaces; top-level statements start at column 0
    const fnMatch = line.match(/^(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/);
    if (fnMatch) {
      if (!PROTECTED_GLOBALS.has(fnMatch[1])) names.add(fnMatch[1]);
      continue;
    }
    const clsMatch = line.match(/^class\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/);
    if (clsMatch) {
      if (!PROTECTED_GLOBALS.has(clsMatch[1])) names.add(clsMatch[1]);
      continue;
    }
    const varMatch = line.match(/^(?:const|let|var)\s+(.*)$/);
    if (varMatch) {
      // Collect statement lines until semicolon at depth 0
      let stmt = varMatch[1];
      let p = 0, b = 0, c = 0, quote = null, done = false;
      const scanLine = (str) => {
        for (let k = 0; k < str.length; k++) {
          const ch = str[k];
          if (quote) {
            if (ch === '\\') k++;
            else if (ch === quote) quote = null;
            continue;
          }
          if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
          if (ch === '/' && str[k + 1] === '/') break;
          if (ch === '(') p++;
          else if (ch === ')') p = Math.max(0, p - 1);
          else if (ch === '[') b++;
          else if (ch === ']') b = Math.max(0, b - 1);
          else if (ch === '{') c++;
          else if (ch === '}') c = Math.max(0, c - 1);
          else if (ch === ';' && p === 0 && b === 0 && c === 0) {
            done = true;
            return str.slice(0, k);
          }
        }
        return str;
      };
      stmt = scanLine(stmt);
      while (!done && i + 1 < lines.length) {
        i++;
        stmt += '\n' + scanLine(lines[i]);
      }
      for (const decl of splitAtDepthZero(stmt, ',')) {
        extractBindingPattern(decl, names);
      }
    }
  }
  return [...names];
}

function wrapAndCompileFile(filename) {
  const fullPath = path.join(SRC_DIR, filename);
  let raw = fs.readFileSync(fullPath, 'utf8');

  // Defer #root mount to queueMicrotask so trailing modules in the chain
  // (e.g. studio-token.jsx, tweaks-splash.jsx, cina-onboard.jsx) register on window first.
  raw = raw.replace(
    /ReactDOM\.createRoot\(document\.getElementById\(["']root["']\)\)\.render\(([^\n;]+)\);?/g,
    'queueMicrotask(() => { ReactDOM.createRoot(document.getElementById("root")).render($1); });'
  );

  // Transform JSX -> clean ES2020 JS first so top-level declarations are normalized at column 0
  const compiled = esbuild.transformSync(raw, {
    loader: 'jsx',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    target: 'es2020',
    sourcefile: filename,
  });

  const names = extractTopLevelNamesFromCompiledJS(compiled.code);
  const exportLines = names
    .map(
      (id) =>
        `  try { if (typeof ${id} !== "undefined") window["${id}"] = ${id}; } catch (_) {}`
    )
    .join('\n');

  return `// ── MODULE: ${filename} ──\n;(function() {\n${compiled.code}\n${exportLines}\n})();\n`;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const [bundleName, chain] of [
  ['watch.bundle.js', WATCH_CHAIN],
  ['studio.bundle.js', STUDIO_CHAIN],
  ['producers.bundle.js', PRODUCERS_CHAIN],
]) {
  const chunks = chain.map((file) => wrapAndCompileFile(file));
  const outPath = path.join(OUT_DIR, bundleName);
  fs.writeFileSync(outPath, chunks.join('\n'), 'utf8');
  const kb = Math.round(fs.statSync(outPath).size / 1024);
  console.log(`Built ${bundleName} (${chain.length} modules -> ${kb} KB)`);
}
