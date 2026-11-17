// mint-drawer.jsx — THE mint workflow. One right-side slide-in, every surface.
//
// Replaces the 6-step full-panel wizard (Studio) and the full-page mint flow
// (Watch) with a single drawer in the CreditsSlidePanel / PayDrawer pattern:
// everything on one scrollable sheet, payment handed to PayDrawer, success
// state inline. Open from anywhere:
//
//   window.openMintDrawer({
//     title:    "THE PHOTO · GENESIS",   // contract name (editable inside)
//     symbol:   "PHOTO",
//     masters:  [{ id, label, dur, note, primary }],  // optional
//     accent: tkc("amber"),
//   })

const { useState: useStateMD, useEffect: useEffectMD, useMemo: useMemoMD } = React;

let _mintDrawerOpener = null;
function openMintDrawer(opts) { if (_mintDrawerOpener) _mintDrawerOpener(opts || {}); }
window.openMintDrawer = openMintDrawer;

const MD_DEFAULT_MASTERS = [
  { id: "v3", label: "Cut v3 · LOCKED", dur: "00:52:14", note: "Color graded · Mix v2 · 24fps", primary: true },
  { id: "v2", label: "Cut v2 · review", dur: "00:51:03", note: "Color WIP · Mix v1" },
  { id: "v1", label: "Cut v1 · rough",  dur: "00:48:22", note: "Assembly only" },
];

const MD_MODELS = [
  { id: "1of1",    name: "1 of 1",  sub: "One master, one owner" },
  { id: "limited", name: "Limited", sub: "Fixed numbered edition" },
  { id: "open",    name: "Open",    sub: "Unlimited · 72h window" },
];

function MDLabel({ children, style }) {
  return <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 8, ...style }}>{children}</div>;
}

function MintDrawerHost() {
  const [cfg, setCfg] = useStateMD(null);       // open config or null
  const [closing, setClosing] = useStateMD(false);
  const [master, setMaster] = useStateMD("v3");
  const [model, setModel] = useStateMD("limited");
  const [supply, setSupply] = useStateMD(250);
  const [priceEth, setPriceEth] = useStateMD(0.08);
  const [royalty, setRoyalty] = useStateMD(7.5);
  const [chain, setChain] = useStateMD("base");
  const [unlock, setUnlock] = useStateMD({ stream: true, bts: true, score: false, signedFrame: true });
  const [done, setDone] = useStateMD(null);     // { hash, contract }

  useEffectMD(() => {
    _mintDrawerOpener = (opts) => {
      setCfg({
        title: opts.title || "UNTITLED · GENESIS",
        symbol: opts.symbol || "FILM",
        masters: opts.masters || MD_DEFAULT_MASTERS,
        accent: opts.accent || tkc("amber"),
      });
      setDone(null); setClosing(false);
      const m = (opts.masters || MD_DEFAULT_MASTERS).find(x => x.primary);
      if (m) setMaster(m.id);
    };
    return () => { _mintDrawerOpener = null; };
  }, []);

  const close = () => { setClosing(true); setTimeout(() => { setCfg(null); setClosing(false); }, 240); };

  // Esc closes
  useEffectMD(() => {
    if (!cfg) return;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cfg]);

  const revenue = useMemoMD(() => {
    if (model === "1of1") return priceEth;
    if (model === "open") return priceEth * 1000;
    return priceEth * supply;
  }, [model, priceEth, supply]);

  if (!cfg) return null;
  const accent = cfg.accent;

  const startMint = () => {
    if (!window.openPay) return;
    window.openPay({
      kind: "license",
      title: cfg.title,
      subtitle: cfg.symbol + " · " + chain.toUpperCase(),
      accent,
      priceUSD: 4.80,
      items: [
        { label: "Deploy contract", sub: "ERC-721 + royalty-aware (EIP-2981)", price: 0 },
        { label: "Pin metadata", sub: "IPFS · " + (Object.values(unlock).filter(Boolean).length + 4) + " files", price: 0 },
        { label: "Mint cost", sub: "120 render credits", price: 4.80 },
      ],
      perks: [
        "Contract deployed on " + chain.toUpperCase(),
        "Metadata pinned to IPFS",
        Object.values(unlock).filter(Boolean).length + " unlockables attached",
        "EIP-2981 royalty: " + royalty + "%",
      ],
      image: { kind: "darkroom-est" },
      onConfirm: () => {
        setDone({
          hash: "0x" + Math.random().toString(16).slice(2, 10) + "…" + Math.random().toString(16).slice(2, 6),
          contract: "0x" + Math.random().toString(16).slice(2, 10) + "…",
        });
        if (window.toast) window.toast({ title: "MINTED", text: cfg.title + " · 120 credits used", kind: "good" });
      },
    });
  };

  const chipRow = (options, value, onPick) => (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map(o => {
        const on = value === (o.id || o);
        const label = o.name || o;
        return (
          <button key={o.id || o} onClick={() => onPick(o.id || o)} style={{
            padding: o.sub ? "9px 13px" : "7px 13px", textAlign: "left",
            background: on ? `color-mix(in oklab, ${accent} 10%, transparent)` : "var(--c-bg)",
            border: `1px solid ${on ? accent : "var(--c-line-2)"}`, borderRadius: "var(--r-2)",
            color: on ? "var(--c-ink)" : "var(--c-ink-3)", cursor: "pointer",
          }}>
            <div style={{ fontSize: "var(--fs-body)", fontWeight: on ? 600 : 400 }}>{label}</div>
            {o.sub && <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 2 }}>{o.sub}</div>}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Scrim */}
      <div onClick={close} style={{
        position: "fixed", inset: 0, zIndex: 8800,
        background: "rgba(0,0,0,.5)", backdropFilter: "blur(2px)",
        opacity: closing ? 0 : 1, transition: "opacity .24s ease",
      }}/>
      {/* Drawer */}
      <aside style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 480, maxWidth: "100vw", zIndex: 8801,
        background: "var(--c-panel)", borderLeft: "1px solid var(--c-line-2)",
        display: "flex", flexDirection: "column",
        boxShadow: "-32px 0 80px rgba(0,0,0,.5)",
        transform: closing ? "translateX(100%)" : "translateX(0)",
        animation: closing ? "none" : "mdIn .26s cubic-bezier(.2,.8,.2,1)",
        transition: "transform .24s ease",
      }}>
        <style>{`@keyframes mdIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* Header */}
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, marginBottom: 5 }}>MINT · {chain.toUpperCase()}</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, letterSpacing: "-0.01em", color: "var(--c-ink)" }}>{cfg.title}</div>
          </div>
          <button onClick={close} className="btn-ghost btn-icon" style={{ width: 32, height: 32 }} title="Close">✕</button>
        </div>

        {done ? (
          /* ── Success state ── */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: accent, color: tkc("on-amber"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-title)" }}>✓</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)" }}>Minted.</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", marginBottom: 4 }}>TX {done.hash}</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)" }}>CONTRACT {done.contract}</div>
            </div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)", maxWidth: 300, lineHeight: 1.5 }}>
              Your edition is live. Collectors can find it on the film's page and in the Producers market.
            </div>
            <button onClick={close} className="btn btn-primary" style={{ height: 36, padding: "0 22px", marginTop: 8 }}>Done</button>
          </div>
        ) : (
          <>
            {/* ── Body: one scrollable sheet ── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Master */}
              <div>
                <MDLabel>1 · MASTER</MDLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {cfg.masters.map(m => {
                    const on = master === m.id;
                    return (
                      <button key={m.id} onClick={() => setMaster(m.id)} style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "10px 13px", textAlign: "left",
                        background: on ? `color-mix(in oklab, ${accent} 8%, transparent)` : "var(--c-bg)",
                        border: `1px solid ${on ? accent : "var(--c-line-2)"}`, borderRadius: "var(--r-2)",
                        color: "inherit", cursor: "pointer",
                      }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: on ? accent : "var(--c-line-3)" }}/>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)" }}>{m.label}</div>
                          <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 1 }}>{m.note}</div>
                        </div>
                        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{m.dur}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Model */}
              <div>
                <MDLabel>2 · EDITION MODEL</MDLabel>
                {chipRow(MD_MODELS, model, setModel)}
              </div>

              {/* Economics */}
              <div>
                <MDLabel>3 · ECONOMICS</MDLabel>
                <div style={{ display: "grid", gridTemplateColumns: model === "limited" ? "1fr 1fr 1fr" : "1fr 1fr", gap: 10 }}>
                  {model === "limited" && (
                    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>SUPPLY</span>
                      <input type="number" value={supply} min={1} onChange={e => setSupply(+e.target.value || 1)}
                        style={{ background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: "9px 11px", color: "var(--c-ink)", fontSize: "var(--fs-body)" }}/>
                    </label>
                  )}
                  <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>PRICE · ETH</span>
                    <input type="number" step="0.01" value={priceEth} min={0} onChange={e => setPriceEth(+e.target.value || 0)}
                      style={{ background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: "9px 11px", color: "var(--c-ink)", fontSize: "var(--fs-body)" }}/>
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>ROYALTY %</span>
                    <input type="number" step="0.5" value={royalty} min={0} max={15} onChange={e => setRoyalty(+e.target.value || 0)}
                      style={{ background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: "9px 11px", color: "var(--c-ink)", fontSize: "var(--fs-body)" }}/>
                  </label>
                </div>
                <div style={{ marginTop: 10 }}>
                  {chipRow(["base", "ethereum", "zora", "polygon"], chain, setChain)}
                </div>
              </div>

              {/* Unlockables */}
              <div>
                <MDLabel>4 · UNLOCKABLES</MDLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {[["stream", "4K stream"], ["bts", "BTS reel"], ["score", "Score stems"], ["signedFrame", "Signed frame"]].map(([k, l]) => (
                    <button key={k} onClick={() => setUnlock(u => ({ ...u, [k]: !u[k] }))} style={{
                      display: "flex", alignItems: "center", gap: 9, padding: "9px 12px",
                      background: unlock[k] ? `color-mix(in oklab, ${accent} 8%, transparent)` : "var(--c-bg)",
                      border: `1px solid ${unlock[k] ? accent : "var(--c-line-2)"}`, borderRadius: "var(--r-2)",
                      color: unlock[k] ? "var(--c-ink)" : "var(--c-ink-4)", cursor: "pointer", fontSize: "var(--fs-body)",
                    }}>
                      <span style={{ fontSize: "var(--fs-label)" }}>{unlock[k] ? "☑" : "☐"}</span>{l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Footer: estimate + CTA ── */}
            <div style={{ padding: "16px 22px", borderTop: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 14 }}>
              <div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 3 }}>EST. PRIMARY REVENUE</div>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)" }}>
                  {revenue.toFixed(2)} ETH
                </div>
              </div>
              <span style={{ flex: 1 }}/>
              <button onClick={startMint} className="btn btn-primary" style={{ height: 40, padding: "0 20px", fontSize: "var(--fs-body)" }}>
                Mint · 120 credits
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

// Self-mount
(function () {
  function mount() {
    if (document.getElementById("__mint-drawer-root")) return;
    const host = document.createElement("div");
    host.id = "__mint-drawer-root";
    document.body.appendChild(host);
    if (ReactDOM.createRoot) ReactDOM.createRoot(host).render(<MintDrawerHost/>);
    else ReactDOM.render(<MintDrawerHost/>, host);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
