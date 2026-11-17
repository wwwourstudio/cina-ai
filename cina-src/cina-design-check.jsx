// cina-design-check.jsx — "Cina AI · Design Check"
// A live design-QA agent. A small launcher sits bottom-left; opening it runs
// real heuristic audits against the CURRENT page DOM and grades it against
// Cina's design bar (the same checks a reviewer would run): horizontal
// overflow, text contrast (WCAG), tap-target size, minimum type size, broken
// imagery, and runtime errors. Re-runs on every route change.
//
// Mounted globally from watch-app.jsx (hidden on immersive player surfaces).

const { useState: usDC, useEffect: ueDC, useRef: urDC } = React;

// ── runtime error tally (set up once) ──────────────────────────────────────
window.__cinaErrCount = window.__cinaErrCount || 0;
if (!window.__cinaErrHook) {
  window.__cinaErrHook = true;
  window.addEventListener("error", () => { window.__cinaErrCount++; });
  window.addEventListener("unhandledrejection", () => { window.__cinaErrCount++; });
}

// ── colour math (WCAG) ──────────────────────────────────────────────────────
function dcParseRGB(str) {
  if (!str) return null;
  const m = str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(",").map((x) => parseFloat(x));
  return { r: p[0], g: p[1], b: p[2], a: p[3] == null ? 1 : p[3] };
}
function dcLum({ r, g, b }) {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function dcContrast(fg, bg) {
  const L1 = dcLum(fg), L2 = dcLum(bg);
  const a = Math.max(L1, L2), b = Math.min(L1, L2);
  return (a + 0.05) / (b + 0.05);
}
// walk ancestors to find the first opaque background colour
function dcBgOf(el) {
  let n = el;
  while (n && n !== document.documentElement) {
    const c = dcParseRGB(getComputedStyle(n).backgroundColor);
    if (c && c.a > 0.5) return c;
    n = n.parentElement;
  }
  return { r: 13, g: 14, b: 16, a: 1 }; // --c-bg fallback
}

// ── the audit ───────────────────────────────────────────────────────────────
function runDesignAudit() {
  const checks = [];
  const vw = window.innerWidth;

  // 1 — horizontal overflow
  const sw = document.documentElement.scrollWidth;
  checks.push({
    id: "overflow", label: "No horizontal overflow",
    status: sw <= vw + 2 ? "pass" : "fail",
    note: sw <= vw + 2 ? "Page fits the viewport width" : `Content is ${sw - vw}px wider than the viewport`,
  });

  // 2 — text contrast (Cina bar: body text AA; small tracked metadata is an
  //     intentional de-emphasis, held to a looser legibility floor)
  const textEls = [...document.querySelectorAll("h1,h2,h3,h4,p,a,button,span,div,li")]
    .filter((el) => {
      if (!el.offsetParent && getComputedStyle(el).position !== "fixed") return false;
      const txt = (el.textContent || "").trim();
      if (!txt || el.children.length > 0) return false; // leaf text only
      const r = el.getBoundingClientRect();
      return r.width > 4 && r.height > 4 && r.top < window.innerHeight * 2;
    }).slice(0, 90);
  let lowContrast = 0, illegible = 0, worst = null;
  textEls.forEach((el) => {
    const cs = getComputedStyle(el);
    const fg = dcParseRGB(cs.color);
    // Transparent fill = outlined numerals or gradient-clipped text: legibility
    // comes from the stroke / clip, which colour-sampling can't read. Skip.
    if (!fg || fg.a < 0.15) return;
    const bg = dcBgOf(el);
    const ratio = dcContrast(fg, bg);
    const size = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight) >= 600;
    const large = size >= 24 || (size >= 18.66 && bold);
    // Small, tracked, de-emphasized metadata (eyebrows, captions) — looser floor.
    const tracked = parseFloat(cs.letterSpacing) >= 0.5 || /uppercase/.test(cs.textTransform);
    const metadata = size <= 12 && tracked;
    const min = metadata ? 2.6 : large ? 3.0 : 4.5;
    if (ratio < min) { lowContrast++; if (!worst || ratio < worst.ratio) worst = { ratio, txt: (el.textContent || "").trim().slice(0, 28) }; }
    if (ratio < 1.9) illegible++;
  });
  checks.push({
    id: "contrast", label: "Text contrast",
    status: illegible >= 2 ? "fail" : lowContrast === 0 ? "pass" : "warn",
    note: illegible >= 2 ? `${illegible} illegible${worst ? ` — e.g. "${worst.txt}" at ${worst.ratio.toFixed(1)}:1` : ""}` : lowContrast === 0 ? `${textEls.length} text nodes clear the bar` : `${lowContrast} a touch low${worst ? ` — e.g. "${worst.txt}" at ${worst.ratio.toFixed(1)}:1` : ""}`,
  });

  // 3 — tap targets (real controls only: buttons/links with a background,
  //     border or icon. Inline text links in prose/footers are judged as text,
  //     and sub-10px decorative bits — pagination dots, rules — are skipped.)
  const dcReal = (el) => {
    const cs = getComputedStyle(el);
    const bg = dcParseRGB(cs.backgroundColor);
    const bw = parseFloat(cs.borderTopWidth) || 0;
    const bc = dcParseRGB(cs.borderTopColor);
    return (bg && bg.a > 0.1) || (bw > 0 && bc && bc.a > 0.1) || !!el.querySelector("svg, img");
  };
  const targets = [...document.querySelectorAll("button, [role=button], a")]
    .filter((el) => {
      if (!el.offsetParent) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) return false;
      return dcReal(el);
    });
  const small = targets.filter((el) => { const r = el.getBoundingClientRect(); return Math.min(r.width, r.height) < 22; });
  checks.push({
    id: "targets", label: "Tap targets ≥ 22px",
    status: small.length === 0 ? "pass" : small.length <= 6 ? "warn" : "fail",
    note: small.length === 0 ? `${targets.length} controls sized for the hand` : `${small.length} of ${targets.length} controls under 22px`,
  });

  // 4 — minimum type size (Cina uses 9px tracked mono eyebrows by design;
  //     anything below 8.5px is a true legibility regression)
  const tiny = textEls.filter((el) => parseFloat(getComputedStyle(el).fontSize) < 8.5);
  checks.push({
    id: "type", label: "Type ≥ 8.5px",
    status: tiny.length === 0 ? "pass" : "fail",
    note: tiny.length === 0 ? "No sub-legible text" : `${tiny.length} text nodes under 8.5px`,
  });

  // 5 — imagery loaded
  const imgs = [...document.querySelectorAll("img")];
  const broken = imgs.filter((im) => im.complete && im.naturalWidth === 0);
  checks.push({
    id: "img", label: "Imagery resolves",
    status: broken.length === 0 ? "pass" : "fail",
    note: imgs.length === 0 ? "No raster images on this view" : broken.length === 0 ? `${imgs.length} images loaded` : `${broken.length} broken of ${imgs.length}`,
  });

  // 6 — runtime errors
  const errs = window.__cinaErrCount || 0;
  checks.push({
    id: "runtime", label: "No runtime errors",
    status: errs === 0 ? "pass" : "fail",
    note: errs === 0 ? "Console is clean" : `${errs} JS error${errs === 1 ? "" : "s"} since load`,
  });

  const fails = checks.filter((c) => c.status === "fail").length;
  const warns = checks.filter((c) => c.status === "warn").length;
  const score = Math.round((checks.filter((c) => c.status === "pass").length + warns * 0.5) / checks.length * 100);
  const verdict = fails > 0 ? "needs-work" : warns > 0 ? "minor" : "qualified";
  return { checks, score, verdict, fails, warns, ts: Date.now() };
}

// ── UI ───────────────────────────────────────────────────────────────────────
const DC_TINT = { pass: "var(--c-good)", warn: "var(--c-amber)", fail: "var(--c-blood-l)" };
const DC_GLYPH = { pass: "✓", warn: "!", fail: "✕" };

function CinaDesignCheck() {
  const route = typeof useRoute === "function" ? useRoute() : { parts: [] };
  const [open, setOpen] = usDC(false);
  const [result, setResult] = usDC(null);
  const [running, setRunning] = usDC(false);

  const p0 = (route.parts && route.parts[0]) || "";
  // Cina Design Check is a tool for studios building their own site — it only
  // appears inside the site builder (/build), where it audits the page being
  // assembled. It is hidden everywhere else on Cina.
  const showHere = p0 === "build";

  const run = () => {
    setRunning(true);
    // brief defer so the "analyzing" state paints — feels like work, and lets
    // the DOM settle after a route change.
    setTimeout(() => { setResult(runDesignAudit()); setRunning(false); }, 420);
  };

  // auto-run when opened and on route change while open
  ueDC(() => { if (open) run(); /* eslint-disable-next-line */ }, [open, p0]);

  // The launcher lives in the builder toolbar (not floating over the canvas —
  // a QA tool shouldn't cover the design it's judging). The toolbar button
  // dispatches this event to toggle the panel.
  ueDC(() => {
    const t = () => setOpen(v => !v);
    window.addEventListener("cina:design-check", t);
    return () => window.removeEventListener("cina:design-check", t);
  }, []);

  if (!showHere || !open) return null;

  return (
    <div style={{ position: "fixed", right: 14, top: 62, zIndex: 1400, fontFamily: "var(--f-sans)", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      {open && result && (
        <div style={{
          width: 320, marginBottom: 10, background: "rgba(16,14,12,0.97)", backdropFilter: "blur(14px)",
          border: "1px solid var(--c-line-2)", borderRadius: 14, overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,.55)", animation: "dcUp .2s ease",
        }}>
          <style>{`@keyframes dcUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
            @keyframes dcSpin{to{transform:rotate(360deg)}}`}</style>

          {/* header / verdict */}
          <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid var(--c-line)", background: `linear-gradient(180deg, ${verdictTint(result.verdict)}1a, transparent)` }} data-dc-head="">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <DCMark/>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".2em", color: "var(--c-ink-2)" }}>CINA AI · DESIGN CHECK</span>
              <span style={{ flex: 1 }}/>
              <button onClick={() => setOpen(false)} className="btn-ghost btn-icon" style={{ width: 22, height: 22, color: "var(--c-ink-3)" }}><Icon name="x" size={11}/></button>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", lineHeight: 0.9, color: verdictTint(result.verdict) }}>{result.score}</div>
              <div style={{ paddingBottom: 4 }}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: verdictTint(result.verdict), fontWeight: 700 }}>{verdictLabel(result.verdict)}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".12em", color: "var(--c-ink-4)", marginTop: 2 }}>/{route.parts && route.parts[0] ? "/" + route.parts.join("/") : " home"}</div>
              </div>
            </div>
          </div>

          {/* checks */}
          <div style={{ padding: "8px 10px", maxHeight: 320, overflowY: "auto" }}>
            {result.checks.map((c) => (
              <div key={c.id} style={{ display: "flex", gap: 10, padding: "9px 8px", borderRadius: 8, alignItems: "flex-start" }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", background: DC_TINT[c.status] + "22", color: DC_TINT[c.status], fontSize: "var(--fs-label)", fontWeight: 700 }}>{DC_GLYPH[c.status]}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.2 }}>{c.label}</div>
                  <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2, lineHeight: 1.35 }}>{c.note}</div>
                </div>
              </div>
            ))}
          </div>

          {/* footer */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderTop: "1px solid var(--c-line)" }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".1em" }}>
              {result.fails ? `${result.fails} blocking` : result.warns ? `${result.warns} to polish` : "Meets the bar"}
            </span>
            <span style={{ flex: 1 }}/>
            <button className="btn" style={{ height: 28, padding: "0 12px", fontSize: "var(--fs-label)" }} onClick={run} disabled={running}>
              {running ? "Analyzing…" : "Re-run"}
            </button>
          </div>
        </div>
      )}
      {open && !result && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 34, padding: "0 13px", background: "rgba(16,14,12,0.94)", border: "1px solid var(--c-line-2)", borderRadius: 999, color: "var(--c-ink)" }}>
          <span style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid var(--c-line-3)", borderTopColor: "var(--c-amber)", animation: "dcSpin .7s linear infinite" }}/>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".14em" }}>ANALYZING…</span>
          <style>{`@keyframes dcSpin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
    </div>
  );
}

function DCMark() {
  // small 4-point spark — the Cina AI mark
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" style={{ flexShrink: 0 }} aria-hidden="true">
      <path d="M12 2l2.2 6.4L21 11l-6.8 2.6L12 22l-2.2-6.4L3 11l6.8-2.6z" fill= "var(--c-amber)"/>
    </svg>
  );
}

function verdictTint(v) { return v === "qualified" ? "var(--c-good)" : v === "minor" ? "var(--c-amber)" : "var(--c-blood-l)"; }
function verdictLabel(v) { return v === "qualified" ? "QUALIFIED" : v === "minor" ? "MINOR POLISH" : "NEEDS REVIEW"; }

Object.assign(window, { CinaDesignCheck });
