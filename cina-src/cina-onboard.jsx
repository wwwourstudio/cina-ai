// cina-onboard.jsx — First-run onboarding for the three pro surfaces.
//
// Watch has its own rich onboarding (watch-onboarding.jsx). Studio, Producers
// and Pitch dropped you cold into a populated dashboard with no orientation —
// a new filmmaker, collector, or advertiser had no idea where to start. This
// is one shared, skippable + resumable flow in the same visual language as
// Watch's, themed per surface, that self-mounts on whichever pro surface
// loaded it. Runs once per surface (localStorage), resumes mid-flow on reload.
//
// Loaded (after cina-identity.jsx + that surface's data) on:
//   Cina.html (studio) · Producers.html (producers) · Pitch.html (pitch)

const { useState: useOb, useEffect: useObEff } = React;

// ─── Persistence ──────────────────────────────────────────────────────
function _obKey(surface) { return "cina:onboarded:" + surface; }
function _obStepKey(surface) { return "cina:onboard-step:" + surface; }
function _obDone(surface) { try { return localStorage.getItem(_obKey(surface)) === "1"; } catch { return false; } }
function _obMarkDone(surface) { try { localStorage.setItem(_obKey(surface), "1"); localStorage.removeItem(_obStepKey(surface)); } catch {} }
function _obLoadStep(surface) { try { return parseInt(localStorage.getItem(_obStepKey(surface)) || "0", 10) || 0; } catch { return 0; } }
function _obSaveStep(surface, s) { try { localStorage.setItem(_obStepKey(surface), String(s)); } catch {} }

// ─── Surface registry ─────────────────────────────────────────────────
const OB_SURFACES = {
  studio:    { label: "Studio",    accent: tkc("amber"), domain: "Cina Studio",   enter: "Enter Studio →" },
  producers: { label: "Producers", accent: tkc("bad"), domain: "Cina Producers", enter: "Browse the market →" },
};

// ─── Shared atoms (accent-parametrized) ───────────────────────────────
function ObPrimary({ accent, active = true, children, onClick }) {
  return (
    <button onClick={active ? onClick : undefined} style={{
      padding: "12px 24px", background: active ? accent : "var(--c-line-2)",
      border: "none", color: active ? tkc("on-amber") : "var(--c-ink-4)",
      borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", fontWeight: 600, cursor: active ? "pointer" : "not-allowed",
      fontFamily: "var(--f-sans)", letterSpacing: ".02em",
    }}>{children}</button>
  );
}
const obGhost = {
  padding: "12px 16px", background: "transparent", border: "none",
  color: "var(--c-ink-3)", fontSize: "var(--fs-body)", cursor: "pointer", fontFamily: "var(--f-sans)",
};

function ObHeader({ kicker, title, sub, accent }) {
  return (
    <div>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 9 }}>{kicker}</div>
      <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 500, margin: 0, letterSpacing: "-0.01em", lineHeight: 1.04 }}>{title}</h2>
      {sub && <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", margin: "11px 0 0", lineHeight: 1.55, maxWidth: 480 }}>{sub}</p>}
    </div>
  );
}

function ObBullet({ accent, icon, head, body }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{
        width: 34, height: 34, borderRadius: "var(--r-2)", flexShrink: 0, marginTop: 1,
        background: accent + "1e", border: `1px solid ${accent}55`, color: accent,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}><Icon name={icon} size={16}/></div>
      <div>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, color: "var(--c-ink)", letterSpacing: "-0.01em" }}>{head}</div>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5, marginTop: 3 }}>{body}</div>
      </div>
    </div>
  );
}

// ─── Screen builders per surface ──────────────────────────────────────
function buildStudioScreens(accent, st, set) {
  const formats = (window.CINA_FORMATS && Object.values(window.CINA_FORMATS)) || [
    { key: "movie", label: "Film", tagline: "A single-cut feature or short.", flow: ["Script","Board","Generate","Editor","Final cut"] },
    { key: "series", label: "Series", tagline: "Multi-episode arc on one bible.", flow: ["Bible","Writers' room","Episodes","Cuts","Release"] },
    { key: "branched", label: "Branch", tagline: "Choose-your-own-adventure cinema.", flow: ["Spine","Forks","Board","Generate","Branch cuts"] },
  ];
  const agents = window.AGENTS || [];
  const fmt = formats.find(f => f.key === st.format);
  return [
    {
      kicker: "WELCOME TO STUDIO",
      title: "Make a film with a crew of agents.",
      sub: "Studio is your production floor — a director, writer, visual, editor and audio agent working one project with you. Three quick steps and you're in.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ObBullet accent={accent} icon="film"  head="Pick what you're making" body="Film, series, or branching cut — each opens a pipeline tuned for it."/>
          <ObBullet accent={accent} icon="wand"  head="Direct in plain language" body="Tell the crew what you want. They draft script, boards, renders, score."/>
          <ObBullet accent={accent} icon="globe" head="Ship straight to Watch"    body="One Publish step masters your film and premieres it to the world."/>
        </div>
      ),
    },
    {
      kicker: "STEP 01 · FORMAT",
      title: "What are you making?",
      sub: "This sets your whole pipeline. You can start another anytime.",
      body: (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {formats.map(f => {
            const on = st.format === f.key;
            return (
              <button key={f.key} onClick={() => set(s => ({ ...s, format: f.key }))} style={{
                padding: "16px 14px", textAlign: "left", cursor: "pointer", borderRadius: "var(--r-2)",
                background: on ? accent + "14" : "var(--c-bg)",
                border: `1px solid ${on ? accent : "var(--c-line-2)"}`,
                color: "inherit", display: "flex", flexDirection: "column", gap: 8,
              }}>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: on ? accent : "var(--c-ink-4)" }}>{f.tag || f.label.toUpperCase()}</span>
                <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, color: "var(--c-ink)" }}>{f.label}</span>
                <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.4 }}>{f.tagline}</span>
              </button>
            );
          })}
        </div>
      ),
      canNext: !!st.format,
    },
    {
      kicker: "STEP 02 · TITLE",
      title: "Give it a working title.",
      sub: "Doesn't have to be final — your crew will pitch alternates in the Titles room.",
      body: (
        <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>WORKING TITLE</span>
          <input autoFocus value={st.title} onChange={e => set(s => ({ ...s, title: e.target.value }))}
            placeholder="e.g. The Long Hall" style={{
              background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
              padding: "13px 15px", color: "var(--c-ink)", fontSize: "var(--fs-lead)", fontFamily: "var(--f-display)", fontStyle: "italic",
            }}/>
          {fmt && (
            <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginRight: 4 }}>{(fmt.label || "").toUpperCase()} PIPELINE</span>
              {fmt.flow.map((s, i) => (
                <React.Fragment key={s}>
                  <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", fontFamily: "var(--f-mono)" }}>{s}</span>
                  {i < fmt.flow.length - 1 && <span style={{ color: accent, fontSize: "var(--fs-label)" }}>›</span>}
                </React.Fragment>
              ))}
            </div>
          )}
        </label>
      ),
    },
    {
      kicker: "STEP 03 · YOUR CREW",
      title: "Meet your crew.",
      sub: "Five agents, always on. Hand off as much or as little as you like — you're still the director.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {(agents.length ? agents : [
            { id:"director", name:"Director", glyph:"D", role:"Vision · shot design · routing", color: accent },
            { id:"writer", name:"Writer", glyph:"W", role:"Script · dialogue · structure", color: accent },
            { id:"visual", name:"Visual", glyph:"V", role:"Storyboard · character · set", color: accent },
            { id:"editor", name:"Editor", glyph:"E", role:"QC · flaw detection · polish", color: accent },
            { id:"audio", name:"Audio", glyph:"A", role:"Voice · score · SFX", color: accent },
          ]).map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 13, padding: "10px 12px", background: "var(--c-bg)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: (a.color || accent) + "22", border: `1px solid ${a.color || accent}`, color: a.color || accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 600, fontSize: "var(--fs-body)" }}>{a.glyph}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 500 }}>{a.name}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 1 }}>{a.role}</div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      kicker: "ALL SET",
      title: st.title ? `“${st.title}” is ready to roll.` : "Your studio is ready.",
      sub: "We've set up your floor. Open the Director chat to start, or explore the panels along the top.",
      isFinish: true,
      body: (
        <div style={{ background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 18 }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 12 }}>YOUR PROJECT</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: "var(--fs-body)" }}>
            <div><b style={{ color: "var(--c-ink)" }}>Title:</b> <span style={{ color: "var(--c-ink-2)" }}>{st.title || "Untitled"}</span></div>
            <div><b style={{ color: "var(--c-ink)" }}>Format:</b> <span style={{ color: "var(--c-ink-2)" }}>{fmt ? fmt.label : "Film"}</span></div>
            <div><b style={{ color: "var(--c-ink)" }}>Crew:</b> <span style={{ color: "var(--c-ink-2)" }}>{(agents.length || 5)} agents on call</span></div>
            <div><b style={{ color: "var(--c-ink)" }}>Next:</b> <span style={{ color: accent }}>Direct your first scene</span></div>
          </div>
        </div>
      ),
    },
  ];
}

function buildProducersScreens(accent, st, set) {
  const wallets = [{ id: "mm", label: "MetaMask", glyph: "🦊" }, { id: "wc", label: "WalletConnect", glyph: "◇" }, { id: "cb", label: "Coinbase Wallet", glyph: "◉" }];
  const tiers = [
    { name: "Collector", price: "from $90", line: "An animated frame, the premiere window, a live signal during the film." },
    { name: "Patron",    price: "from $380", line: "Everything in Collector, plus revenue share through Year 5 and the BTS vault." },
    { name: "Producer",  price: "from $2.5k", line: "A real production credit, the largest revenue share, and a set visit." },
  ];
  return [
    {
      kicker: "WELCOME TO PRODUCERS",
      title: "Co-finance the films you believe in.",
      sub: "Producers is a market for backing films before they exist — and earning alongside them when they land. Here's how it works.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ObBullet accent={accent} icon="ticket" head="Buy a producer pass" body="Each open film is a pool. A pass is your on-chain stake in that film."/>
          <ObBullet accent={accent} icon="spark"  head="Earn when it performs" body="Holders share ad revenue and exhibition windows — through Year 5."/>
          <ObBullet accent={accent} icon="lock"   head="Premiere + BTS access" body="Watch before everyone, and get into the behind-the-scenes vault."/>
        </div>
      ),
    },
    {
      kicker: "STEP 01 · THE PASS",
      title: "What a producer pass actually is.",
      sub: "Not a donation — a tradable stake. You can hold it, earn from it, or sell it on.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[["Own", "a share of one film"], ["Earn", "revenue share to Y5"], ["Trade", "anytime, on Base"]].map(([k, v]) => (
              <div key={k} style={{ padding: "16px 14px", background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)" }}>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: accent, fontWeight: 500 }}>{k}</div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 5, lineHeight: 1.4 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)", lineHeight: 1.5, padding: "2px 2px" }}>
            Every pass is settled on-chain. Revenue distributions land in your wallet automatically — no claim forms, no waiting on a studio's accounting.
          </div>
        </div>
      ),
    },
    {
      kicker: "STEP 02 · TIERS",
      title: "Three ways in.",
      sub: "Same film, different levels of stake and perk. Pick by how deep you want to go.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tiers.map((t, i) => (
            <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 15px", background: "var(--c-bg)", border: "1px solid var(--c-line)", borderLeft: `2px solid ${accent}`, borderRadius: "var(--r-2)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, color: "var(--c-ink)" }}>{t.name}</span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".08em" }}>{t.price}</span>
                </div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 3, lineHeight: 1.45 }}>{t.line}</div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      kicker: "STEP 03 · WALLET",
      title: "Connect a wallet to back a film.",
      sub: "It's how your stake and your payouts live with you. You can also spend from your Cina balance.",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {wallets.map(w => {
            const on = st.wallet === w.id;
            return (
              <button key={w.id} onClick={() => set(s => ({ ...s, wallet: w.id }))} style={{
                display: "flex", alignItems: "center", gap: 13, padding: "12px 14px", textAlign: "left", cursor: "pointer",
                background: on ? accent + "14" : "var(--c-bg)", border: `1px solid ${on ? accent : "var(--c-line-2)"}`, borderRadius: "var(--r-2)", color: "inherit",
              }}>
                <span style={{ fontSize: "var(--fs-lead)" }}>{w.glyph}</span>
                <span style={{ flex: 1, fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{w.label}</span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: on ? accent : "var(--c-ink-4)", letterSpacing: ".16em" }}>{on ? "SELECTED" : "CONNECT"}</span>
              </button>
            );
          })}
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)", textAlign: "center", marginTop: 4 }}>You can connect later — browsing the market needs no wallet.</div>
        </div>
      ),
    },
    {
      kicker: "ALL SET",
      title: "You're ready to back films.",
      sub: "Open the market to see every film currently raising, sorted by what's closing soon.",
      isFinish: true,
      body: (
        <div style={{ background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 18, display: "flex", flexDirection: "column", gap: 8 }}>
          {[["Browse", "open pools by film, director, days-left"], ["Back", "any tier with a wallet or Cina balance"], ["Earn", "automatic on-chain distributions"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
              <span style={{ width: 56, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent }}>{k.toUpperCase()}</span>
              <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{v}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];
}

// ─── The flow shell ───────────────────────────────────────────────────
function CinaSurfaceOnboard({ surface }) {
  const cfg = OB_SURFACES[surface] || OB_SURFACES.studio;
  const accent = cfg.accent;
  const cina = window.useCinaId ? window.useCinaId() : null;

  const [open, setOpen] = useOb(() => !_obDone(surface));
  const [step, setStep] = useOb(() => Math.max(0, _obLoadStep(surface)));
  const [st, setSt] = useOb({ format: "", title: "", wallet: "" });

  const screens =
    surface === "producers" ? buildProducersScreens(accent, st, setSt) :
                              buildStudioScreens(accent, st, setSt);

  const clampedStep = Math.min(step, screens.length - 1);
  useObEff(() => { if (open) _obSaveStep(surface, clampedStep); }, [clampedStep, open, surface]);

  if (!open) return null;
  // Don't cover the signed-out gate — wait until they're in.
  if (cina && cina.signedIn === false) return null;

  const sc = screens[clampedStep];
  const isLast = !!sc.isFinish || clampedStep === screens.length - 1;
  const canNext = sc.canNext === undefined ? true : sc.canNext;

  const finish = () => { _obMarkDone(surface); setOpen(false); };
  const next = () => { if (isLast) finish(); else setStep(clampedStep + 1); };
  const back = () => setStep(Math.max(0, clampedStep - 1));

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9500,
      background: "rgba(0,0,0,0.88)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflow: "auto",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 600, maxWidth: "100%", background: "var(--c-panel)", border: "1px solid var(--c-line-2)",
        borderRadius: "var(--r-2)", padding: 34, display: "flex", flexDirection: "column", gap: 24,
        maxHeight: "92vh", overflowY: "auto", boxShadow: "0 40px 120px rgba(0,0,0,.6)",
        animation: "obIn .26s cubic-bezier(.2,.8,.2,1)",
      }}>
        <style>{`@keyframes obIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>

        {/* Header row: surface badge + progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: accent }}/>{cfg.domain.toUpperCase()}
          </span>
          <span style={{ flex: 1 }}/>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{clampedStep + 1} / {screens.length}</span>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: -10 }}>
          {screens.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 2, borderRadius: "var(--r-1)", background: i <= clampedStep ? accent : "var(--c-line)", transition: "background .2s ease" }}/>
          ))}
        </div>

        <ObHeader kicker={sc.kicker} title={sc.title} sub={sc.sub} accent={accent}/>
        <div>{sc.body}</div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 2 }}>
          {clampedStep > 0
            ? <button onClick={back} style={obGhost}>← Back</button>
            : <button onClick={finish} style={obGhost}>Skip tour</button>}
          <span style={{ flex: 1 }}/>
          {!isLast && clampedStep > 0 && <button onClick={finish} style={{ ...obGhost, marginRight: 4 }}>Skip</button>}
          <ObPrimary accent={accent} active={canNext} onClick={next}>{isLast ? cfg.enter : "Continue →"}</ObPrimary>
        </div>
      </div>
    </div>
  );
}

// ─── Surface detection + self-mount ───────────────────────────────────
function _obDetectSurface() {
  if (window.CINA_SURFACE && OB_SURFACES[window.CINA_SURFACE]) return window.CINA_SURFACE;
  const hasScript = (re) => Array.from(document.scripts).some(s => re.test(s.getAttribute("src") || ""));
  if (hasScript(/producers-app\.jsx/)) return "producers";
  if (hasScript(/pitch-app\.jsx/)) return "pitch";
  if (window.STUDIO && hasScript(/cina-state\.jsx/)) return "studio";
  return null;
}

function _obMount() {
  const surface = _obDetectSurface();
  if (!surface) return;
  if (document.getElementById("__cina-onboard-root")) return;
  const host = document.createElement("div");
  host.id = "__cina-onboard-root";
  document.body.appendChild(host);
  if (ReactDOM.createRoot) ReactDOM.createRoot(host).render(<CinaSurfaceOnboard surface={surface}/>);
  else ReactDOM.render(<CinaSurfaceOnboard surface={surface}/>, host);
}

// Replay helper (e.g. from a Help menu): cinaReplayOnboard("studio")
function cinaReplayOnboard(surface) {
  const s = surface || _obDetectSurface();
  if (!s) return;
  try { localStorage.removeItem(_obKey(s)); localStorage.removeItem(_obStepKey(s)); } catch {}
  const host = document.getElementById("__cina-onboard-root");
  if (host) { try { host.remove(); } catch {} }
  _obMount();
}


if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", _obMount);
} else {
  _obMount();
}
