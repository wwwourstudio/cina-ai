// watch-ads.jsx — Ad monetization + AI content rating + Kid Mode.
// Three systems share a file because they share data plumbing.
//
// ───────────────────────────────────────────────────────────────────
// AD SYSTEM
// Films are free to watch with ads. Cina's pitch vs YouTube:
//   • Premium-only inventory (no spam, no clickbait), so CPMs are 4-6× YT
//   • 75/25 creator split (YouTube is 55/45)
//   • NFT holders see no ads on the films they back
//   • Sponsor reads are read by Cina in the creator's voice — opt-in
//   • Mid-rolls are AI-placed at scene breaks, never mid-line
//
// CONTENT RATING
// Every film gets a rating G / PG / PG-13 / R / NC-17 inferred by Cina
// from the script + final cut. Reasons surface as chips. Kid Mode in
// the profile blocks everything > PG.

const { useState: usAd, useEffect: ueAd } = React;

// ─── Data ────────────────────────────────────────────────────────────────

// CPM rates (USD per 1000 views) by ad slot type. Premium because
// audience is opted-in to long-form film and brands pay for that.
const AD_RATES = {
  preroll:   { cpm: 28.00, name: "Pre-roll",   desc: "Before play. Skippable after 5s." },
  midroll:   { cpm: 42.00, name: "Mid-roll",   desc: "AI-placed at natural scene breaks." },
  sponsor:   { cpm: 95.00, name: "Sponsor read", desc: "60-90s, in creator's voice." },
  endcard:   { cpm: 16.00, name: "End card",   desc: "After credits. House inventory." },
  overlay:   { cpm:  8.00, name: "Frame overlay", desc: "Lower-third, pause-state only." },
};

// Sample brand inventory — what fits Cina's audience.
const BRANDS = [
  { id: "leica",   name: "Leica",        sector: "Camera",  cpm: 1.7, color: tkc("blood-x") },
  { id: "criterion", name: "Criterion Collection", sector: "Film",   cpm: 1.4, color: tkc("panel-2") },
  { id: "moleskine", name: "Moleskine",  sector: "Lifestyle", cpm: 1.2, color: tkc("panel-3") },
  { id: "audible", name: "Audible",      sector: "Media",   cpm: 1.3, color: tkc("amber") },
  { id: "redbull", name: "Red Bull",     sector: "Beverage", cpm: 1.0, color: tkc("line-2") },
  { id: "leibniz", name: "Leibniz Inst.", sector: "Education", cpm: 1.5, color: tkc("cat-6") },
  { id: "patagonia", name: "Patagonia",  sector: "Apparel", cpm: 1.6, color: tkc("line-3") },
  { id: "blue-bottle", name: "Blue Bottle Coffee", sector: "Lifestyle", cpm: 1.3, color: tkc("cat-6") },
];

// Content rating system (US-style: G, PG, PG-13, R, NC-17)
const RATINGS = {
  G:      { color: tkc("cat-5"), label: "G",     full: "General",            kidsOK: true,  desc: "Clean. Grandparents and kids both fine." },
  PG:     { color: tkc("cat-6"), label: "PG",    full: "Parental Guidance",  kidsOK: true,  desc: "Mild peril. Some intensity." },
  "PG-13":{ color: tkc("warn"), label: "PG-13", full: "Cautionary",         kidsOK: false, desc: "Strong themes, brief language, fantasy violence." },
  R:      { color: tkc("cat-3"), label: "R",     full: "Restricted",         kidsOK: false, desc: "Mature. Sustained intensity, language, sexuality, violence." },
  "NC-17":{ color: tkc("blood"), label: "NC-17", full: "Adults Only",        kidsOK: false, desc: "Adults only. Explicit." },
};

// Reason codes that explain why a rating was assigned.
const RATING_REASONS = {
  V: "Violence",
  L: "Language",
  S: "Sex / nudity",
  D: "Drug use",
  T: "Disturbing themes",
  P: "Strong peril",
  H: "Horror / fright",
};

// AI rating engine — deterministic based on film id so demo is stable.
// In production this would read the script + cut and call a model.
function computeRating(film) {
  // Hash film id → bucket
  const hash = [...film.id].reduce((a, c) => a * 31 + c.charCodeAt(0), 0);
  const buckets = ["G", "PG", "PG-13", "R", "NC-17"];
  // Genre-weighted assignment
  const g = (film.genre || []).join(" ").toLowerCase();
  let pick;
  if (g.includes("horror") || g.includes("noir")) pick = (hash % 3 === 0 ? "R" : "PG-13");
  else if (g.includes("crime") || g.includes("thriller")) pick = (hash % 4 === 0 ? "R" : "PG-13");
  else if (g.includes("doc") || g.includes("drama")) pick = (hash % 3 === 0 ? "PG-13" : "PG");
  else pick = buckets[hash % 4]; // skip NC-17 for general
  // Reasons
  const reasonMap = { G: [], PG: ["P"], "PG-13": ["V","L","P"], R: ["V","L","T"], "NC-17": ["V","L","S","D"] };
  const confidence = 88 + (hash % 12);
  return {
    rating: pick,
    reasons: reasonMap[pick] || [],
    confidence,
    auditedBy: "Cina · v2.4",
    method: "Script + final-cut multimodal pass",
  };
}

// ─── Kid Mode (persisted in window.USER) ─────────────────────────────────

function isKidMode() {
  return !!(window.USER && window.USER.kidMode);
}
function setKidMode(on) {
  if (!window.USER) return;
  window.USER.kidMode = !!on;
  // Notify subscribers
  window.dispatchEvent(new CustomEvent("cina:kidmode", { detail: on }));
}
function useKidMode() {
  const [on, setOn] = usAd(isKidMode());
  ueAd(() => {
    const h = (e) => setOn(!!e.detail);
    window.addEventListener("cina:kidmode", h);
    return () => window.removeEventListener("cina:kidmode", h);
  }, []);
  return [on, (v) => setKidMode(v)];
}

// ─── UI: Rating badge ────────────────────────────────────────────────────

function RatingBadge({ rating, size = "sm", showReasons = false }) {
  const r = RATINGS[rating];
  if (!r) return null;
  const pad = size === "lg" ? "5px 12px" : size === "md" ? "3px 9px" : "2px 7px";
  const fs = size === "lg" ? 14 : size === "md" ? 12 : 10.5;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: pad,
      background: `${r.color}1a`,
      border: `1px solid ${r.color}66`,
      borderRadius: "var(--r-1)",
      fontFamily: "var(--f-mono)",
      fontSize: fs,
      fontWeight: 700,
      letterSpacing: ".08em",
      color: r.color,
    }}>
      <span>{r.label}</span>
      {showReasons && (
        <span style={{ opacity: .7, fontWeight: 500, letterSpacing: ".16em" }}>
          {/* show reason codes */}
          {(r.reasons || []).join("·")}
        </span>
      )}
    </span>
  );
}

// ─── UI: Kid-mode lock card (replaces film hero/card content) ────────────

function KidLockCard({ film }) {
  const r = computeRating(film);
  return (
    <div style={{
      padding: "32px 28px",
      background: "var(--c-panel)",
      border: "1px solid var(--c-line-2)",
      borderRadius: "var(--r-2)",
      textAlign: "center",
      maxWidth: 480,
      margin: "40px auto",
    }}>
      <div style={{ fontSize: "var(--fs-title)", marginBottom: 10 }}>🔒</div>
      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", marginBottom: 6 }}>
        Not for kids
      </div>
      <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55, margin: "0 0 16px" }}>
        <RatingBadge rating={r.rating} size="md"/> films are blocked while Kid Mode is on.
      </p>
      <button
        onClick={() => setKidMode(false)}
        className="btn btn-primary"
        style={{ height: 36, padding: "0 16px" }}
      >
        Exit kid mode
      </button>
    </div>
  );
}

// ─── UI: Kid-mode toggle for the profile menu ────────────────────────────

function KidModeToggle() {
  const [on, setOn] = useKidMode();
  return (
    <button
      onClick={() => setOn(!on)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", padding: "10px 12px",
        background: on ? "rgba(90,138,106,.1)" : "transparent",
        border: `1px solid ${on ? "rgba(90,138,106,.4)" : "var(--c-line)"}`,
        borderRadius: "var(--r-2)",
        cursor: "pointer", color: "var(--c-ink)",
        textAlign: "left",
      }}
    >
      <span style={{ fontSize: "var(--fs-lead)" }}>{on ? "🧒" : "🔓"}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "var(--fs-body)", fontWeight: 500 }}>Kid Mode {on ? "on" : "off"}</div>
        <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{on ? "Only G & PG content visible" : "All ratings visible"}</div>
      </div>
      <div style={{
        width: 32, height: 18, borderRadius: "var(--r-2)",
        background: on ? "var(--c-good)" : "var(--c-line-2)",
        position: "relative",
        transition: "background .2s",
      }}>
        <div style={{
          position: "absolute",
          top: 2, left: on ? 16 : 2,
          width: 14, height: 14, borderRadius: "50%",
          background: tkc("white"),
          transition: "left .2s",
        }}/>
      </div>
    </button>
  );
}

// ─── Cina Pitch · advertiser-uploaded commercials ────────────────────────
// These are the 30s spots advertisers built in the Pitch tool — different
// from generic AD_SLOTS above. Two run back-to-back every ~10 min for free
// users; paid users see none.

const PITCH_COMMERCIALS = [
  {
    id: "wornwear",
    advertiser: "Patagonia",
    product: "Worn Wear",
    duration: 30,
    palette: [tkc("line-3"),tkc("cat-5"),tkc("cat-4"),tkc("panel-2")],
    headline: "Repair before replace.",
    line: "We've fixed 100,386 jackets this year.",
    productThumb: "darkroom-est",
    banner: {
      title: "Worn Wear · Trade in & repair",
      desc: "Free repair on 40+ garment types",
      url: "patagonia.com/wornwear",
      cta: "Shop now",
      cover: "W",
      coverGrad: `linear-gradient(135deg, ${tkc("line-3")}, ${tkc("cat-5")})`,
    },
  },
  {
    id: "leica-m11",
    advertiser: "Leica",
    product: "M11 Monochrom",
    duration: 30,
    palette: [tkc("panel-2"),tkc("blood-x"),tkc("ink"),tkc("line-3")],
    headline: "Sixty megapixels of black-and-white.",
    line: "Made in Wetzlar. Ten-year warranty.",
    productThumb: "phone",
    banner: {
      title: "Leica M11 Monochrom · $9,195",
      desc: "Pre-order at your local dealer",
      url: "leica-camera.com/M11M",
      cta: "Pre-order",
      cover: "L",
      coverGrad: `linear-gradient(135deg, ${tkc("blood-x")}, ${tkc("blood")})`,
    },
  },
  {
    id: "blue-bottle",
    advertiser: "Blue Bottle",
    product: "Single-Origin",
    duration: 30,
    palette: [tkc("cat-6"),tkc("ink"),tkc("line-2"),tkc("warn")],
    headline: "Three farms. One bag.",
    line: "Roasted Tuesday. On your counter Friday.",
    productThumb: "kitchen-table",
    banner: {
      title: "Blue Bottle · 3-Bag Sampler",
      desc: "Free shipping on first order",
      url: "bluebottlecoffee.com",
      cta: "Try it",
      cover: "B",
      coverGrad: `linear-gradient(135deg, ${tkc("cat-6")}, ${tkc("line-2")})`,
    },
  },
  {
    id: "moleskine",
    advertiser: "Moleskine",
    product: "Pro Notebook",
    duration: 30,
    palette: [tkc("panel-3"),tkc("warn"),tkc("ink"),tkc("line-2")],
    headline: "Where the script starts.",
    line: "The notebook used by 9 of 10 Cina creators.",
    productThumb: "darkroom-wide",
    banner: {
      title: "Moleskine Pro · Limited",
      desc: "Cina-branded edition · 240 pages",
      url: "moleskine.com/pro",
      cta: "Get one",
      cover: "M",
      coverGrad: `linear-gradient(135deg, ${tkc("panel-3")}, ${tkc("line-2")})`,
    },
  },
];

// Pick 2 commercials for a pod — deterministic per film, random offset over time
function pickPodCommercials(film, podIndex = 0) {
  const seed = ([...film.id].reduce((a,c)=>a+c.charCodeAt(0),0) + podIndex * 11) % PITCH_COMMERCIALS.length;
  const a = PITCH_COMMERCIALS[seed];
  const b = PITCH_COMMERCIALS[(seed + 1 + podIndex) % PITCH_COMMERCIALS.length];
  return [a, b];
}

// ─── UI: One commercial spot — non-skippable, banner pinned to bottom ────

function PitchCommercial({ commercial, podPosition = "1 of 2", onComplete, onPaywall }) {
  const [t, setT] = usAd(0);
  const dur = commercial.duration;
  ueAd(() => {
    const id = setInterval(() => {
      setT(v => {
        const next = v + 0.1;
        if (next >= dur) { clearInterval(id); onComplete?.(); return dur; }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [commercial.id]);

  const remaining = Math.ceil(dur - t);
  const progress = (t / dur) * 100;

  // Storyboard-like beat progression — change visual every ~6s
  const beat = Math.min(4, Math.floor(t / (dur / 5)));
  const beatColor = commercial.palette[beat % commercial.palette.length];

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 10,
      background: tkc("black"),
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Beat-driven full-bleed visual */}
      <div style={{ position: "absolute", inset: 0 }}>
        <FrameThumb kind={commercial.productThumb} />
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(135deg, ${beatColor}cc 0%, transparent 50%, ${commercial.palette[(beat+2)%4]}99 100%)`,
          transition: "background .9s ease",
        }}/>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,.55) 100%)",
        }}/>
      </div>

      {/* Top chrome — non-skip indicator + countdown + pod position */}
      <div style={{
        position: "relative", zIndex: 2,
        padding: "16px 24px",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <span style={{
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
          color: "rgba(255,255,255,.85)", fontWeight: 700,
          padding: "4px 8px", border: "1px solid rgba(255,255,255,.35)",
          background: "rgba(0,0,0,.35)", backdropFilter: "blur(6px)",
        }}>AD · {commercial.advertiser.toUpperCase()}</span>
        <span style={{
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
          color: "rgba(255,255,255,.55)",
        }}>{podPosition}</span>
        <span style={{ flex: 1 }}/>
        <span style={{
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
          color: "rgba(255,255,255,.85)", padding: "5px 10px",
          background: "rgba(0,0,0,.55)", backdropFilter: "blur(6px)",
          borderRadius: "var(--r-1)",
        }}>{remaining}s</span>
      </div>

      {/* Center content */}
      <div style={{
        position: "relative", zIndex: 2,
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", textAlign: "center", padding: "0 32px",
      }}>
        <div className="t-mono" style={{
          fontSize: "var(--fs-label)", letterSpacing: ".16em",
          color: "rgba(255,255,255,.55)", marginBottom: 18,
        }}>{commercial.product.toUpperCase()}</div>
        <div className="t-display" style={{
          fontStyle: "italic", fontSize: "clamp(38px, 5.2vw, 78px)",
          lineHeight: 1.05, color: tkc("white"), letterSpacing: "-0.02em",
          maxWidth: 900, margin: "0 0 16px",
          textShadow: "0 4px 30px rgba(0,0,0,.7)",
        }}>{commercial.headline}</div>
        <div style={{
          fontSize: "var(--fs-lead)", color: "rgba(255,255,255,.75)",
          maxWidth: 540, lineHeight: 1.5,
        }}>{commercial.line}</div>
      </div>

      {/* Non-skip notice + ad-free upsell */}
      <div style={{
        position: "relative", zIndex: 2,
        padding: "10px 24px",
        display: "flex", alignItems: "center", gap: 12,
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.55)",
        letterSpacing: ".16em",
      }}>
        <Icon name="lock" size={11}/>
        <span>NON-SKIPPABLE · 2 ADS EVERY 10 MINUTES</span>
        <span style={{ flex: 1 }}/>
        <button onClick={onPaywall} style={{
          appearance: "none", border: "1px solid rgba(255,255,255,.35)",
          background: "rgba(0,0,0,.4)", backdropFilter: "blur(6px)",
          color: tkc("white"), padding: "6px 12px", borderRadius: "var(--r-1)",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
          cursor: "pointer",
        }}>GO AD-FREE →</button>
      </div>

      {/* Banner pinned to bottom — clickable */}
      <a
        href={"https://" + commercial.banner.url.replace(/^https?:\/\//,"")}
        target="_blank" rel="noopener noreferrer"
        onClick={e => { e.preventDefault(); window.toast?.({ title: "OPENED", text: commercial.banner.url, kind: "good" }); }}
        style={{
          position: "relative", zIndex: 2,
          margin: "0 16px 14px",
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 14px",
          background: "rgba(0,0,0,.78)", backdropFilter: "blur(10px)",
          borderLeft: "3px solid var(--c-amber)",
          borderRadius: "var(--r-2)",
          textDecoration: "none",
          cursor: "pointer",
          transition: "transform .15s ease, background .15s ease",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(20,15,8,.9)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,.78)"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: "var(--r-2)", flexShrink: 0,
          background: commercial.banner.coverGrad,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: tkc("white"), fontFamily: "var(--f-display)", fontSize: "var(--fs-title)", fontStyle: "italic", fontWeight: 600,
          boxShadow: "0 2px 8px rgba(0,0,0,.4)",
        }}>{commercial.banner.cover}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "var(--fs-body)", color: tkc("white"), fontWeight: 600, lineHeight: 1.3 }}>{commercial.banner.title}</div>
          <div style={{ fontSize: "var(--fs-body)", color: "rgba(255,255,255,.7)", lineHeight: 1.3, marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
            <span>{commercial.banner.desc}</span>
            <span style={{ color: "rgba(255,255,255,.4)" }}>·</span>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.5)" }}>{commercial.banner.url}</span>
          </div>
        </div>
        <div style={{
          padding: "8px 14px",
          background: "var(--c-amber)", color: "var(--c-on-amber)",
          borderRadius: "var(--r-1)",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
          flexShrink: 0,
        }}>{commercial.banner.cta.toUpperCase()} ›</div>
      </a>

      {/* Progress bar */}
      <div style={{ position: "relative", zIndex: 2, height: 3, background: "rgba(255,255,255,.15)" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "var(--c-amber)", transition: "width .1s linear" }}/>
      </div>
    </div>
  );
}

// ─── Commercial pod — 2 × 30s back-to-back, non-skip ─────────────────────

function CommercialPod({ film, podIndex = 0, onComplete, onPaywall }) {
  const [spots] = usAd(() => pickPodCommercials(film, podIndex));
  const [idx, setIdx] = usAd(0);
  const current = spots[idx];

  const handleSpotComplete = () => {
    if (idx < spots.length - 1) setIdx(idx + 1);
    else onComplete?.();
  };

  return (
    <PitchCommercial
      key={current.id + "-" + idx}
      commercial={current}
      podPosition={`${idx + 1} of ${spots.length}`}
      onComplete={handleSpotComplete}
      onPaywall={onPaywall}
    />
  );
}

// ─── useAdGate hook — controls cadence of pods every ~10min ──────────────
// Returns: { showAds, dismissPod, podIndex, secondsUntilNextPod, isAdFree, setAdFree }

function useAdGate({ playing, currentTime, adFree, intervalSec = 600 }) {
  const [showAds, setShowAds] = usAd(false);
  const [podIndex, setPodIndex] = usAd(0);
  const [lastPodAt, setLastPodAt] = usAd(-1);

  ueAd(() => {
    if (adFree || !playing) return;
    // Pre-roll at start
    if (currentTime < 1 && lastPodAt < 0) {
      setShowAds(true);
      setLastPodAt(0);
      return;
    }
    // Mid-rolls every intervalSec
    if (currentTime - lastPodAt >= intervalSec && lastPodAt >= 0 && !showAds) {
      setShowAds(true);
      setLastPodAt(currentTime);
      setPodIndex(p => p + 1);
    }
  }, [currentTime, playing, adFree, intervalSec]);

  const dismissPod = () => setShowAds(false);
  const secondsUntilNextPod = adFree ? null : Math.max(0, lastPodAt + intervalSec - currentTime);

  return { showAds, dismissPod, podIndex, secondsUntilNextPod };
}

// ─── Ad-free paywall sheet ───────────────────────────────────────────────

function AdFreeSheet({ onClose, onSubscribe }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,.88)", backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }} onClick={onClose}>
      <div style={{
        width: "min(560px, 100%)", background: "var(--c-panel)",
        border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden",
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          padding: "32px 32px 24px",
          background: "linear-gradient(180deg, rgba(var(--accent-rgb),.1), transparent)",
          borderBottom: "1px solid var(--c-line)",
        }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 8, fontWeight: 600 }}>
            CINA PREMIUM · AD-FREE
          </div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", lineHeight: 1.05, marginBottom: 10 }}>
            No ads. Ever.
          </div>
          <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5, margin: 0 }}>
            Free viewers see two 30-second commercials every 10 minutes. Premium members see none — just the film, start to finish.
          </p>
        </div>

        <div style={{ padding: "20px 32px 24px" }}>
          {[
            { id: "monthly", label: "Monthly", price: "$9.99", per: "/month", note: "Cancel anytime" },
            { id: "annual",  label: "Annual",  price: "$79.99", per: "/year",  note: "Save 33% · 4 months free", featured: true },
          ].map(plan => (
            <button
              key={plan.id}
              onClick={() => onSubscribe?.(plan)}
              style={{
                width: "100%", appearance: "none", cursor: "pointer",
                marginBottom: 10, padding: "16px 18px",
                display: "flex", alignItems: "center", gap: 14,
                background: plan.featured ? "rgba(var(--accent-rgb),.08)" : "var(--c-panel-2)",
                border: plan.featured ? "1px solid var(--c-amber)" : "1px solid var(--c-line)",
                borderRadius: "var(--r-2)", textAlign: "left",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 600 }}>{plan.label}</span>
                  {plan.featured && (
                    <span style={{
                      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                      color: "var(--c-amber)", padding: "2px 6px",
                      border: "1px solid var(--c-amber)", borderRadius: "var(--r-1)",
                    }}>BEST VALUE</span>
                  )}
                </div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 3 }}>{plan.note}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-title)", color: "var(--c-amber)", fontWeight: 600, fontStyle: "italic" }}>{plan.price}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{plan.per}</div>
              </div>
            </button>
          ))}

          <div style={{
            marginTop: 12, padding: "10px 12px",
            background: "var(--c-panel-3)", borderRadius: "var(--r-2)",
            fontSize: "var(--fs-label)", color: "var(--c-ink-3)", lineHeight: 1.5,
          }}>
            <strong style={{ color: "var(--c-ink-2)" }}>NFT holders</strong> get ad-free for the films they back. <strong style={{ color: "var(--c-ink-2)" }}>Creator subscriptions</strong> include ad-free for that creator's catalog.
          </div>

          <button onClick={onClose} className="btn-ghost" style={{
            width: "100%", marginTop: 12, height: 36, justifyContent: "center", fontSize: "var(--fs-body)",
          }} aria-label="Close" title="Close">Keep watching with ads</button>
        </div>
      </div>
    </div>
  );
}

// ─── Premium state (persisted to localStorage so refresh holds) ──────────

function isPremium() {
  try { return localStorage.getItem("cina:premium") === "1"; } catch { return false; }
}
function setPremium(on) {
  try { localStorage.setItem("cina:premium", on ? "1" : "0"); } catch {}
  window.dispatchEvent(new CustomEvent("cina:premium", { detail: !!on }));
}
function usePremium() {
  const [on, setOn] = usAd(isPremium());
  ueAd(() => {
    const h = e => setOn(!!e.detail);
    window.addEventListener("cina:premium", h);
    return () => window.removeEventListener("cina:premium", h);
  }, []);
  return [on, setPremium];
}

Object.assign(window, { BRANDS, computeRating, setKidMode, useKidMode, RatingBadge, KidLockCard, KidModeToggle, // Pitch commercial system
  PITCH_COMMERCIALS, CommercialPod, useAdGate, AdFreeSheet, setPremium, usePremium });
