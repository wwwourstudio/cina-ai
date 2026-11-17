// mint.jsx — Mint: releases overview for the active film.
//
// The mint WORKFLOW itself lives in one place: the slide-in MintDrawer
// (mint-drawer.jsx, window.openMintDrawer). This panel is the overview —
// masters ready to mint, live editions, and revenue — with a single CTA
// that opens the drawer. No more 6-step full-panel wizard.

const { useState: useStateM, useEffect: useEffectM, useMemo: useMemoM } = React;

const MINT_MASTERS = [
  { id: "v3", label: "Cut v3 · LOCKED", dur: "00:52:14", note: "Color graded · Mix v2 · 24fps", primary: true, ready: true },
  { id: "v2", label: "Cut v2 · review", dur: "00:51:03", note: "Color WIP · Mix v1", ready: false },
  { id: "v1", label: "Cut v1 · rough",  dur: "00:48:22", note: "Assembly only", ready: false },
];

// One pre-existing edition so the page shows what "minted" looks like.
const LIVE_EDITIONS = [
  {
    id: "ed1", contractName: "THE PHOTO · DAILIES", symbol: "PHOTO-D",
    model: "limited", priceEth: 0.04, supply: 500, sold: 387, royalty: 5,
    chain: "base", mintedAt: "May 12", revenue: 15.48,
  },
];

function MintPanel() {
  const film = (window.cinaActiveFilm && window.cinaActiveFilm()) || { title: "The Photo" };
  const [pipeTick, setPipeTick] = useStateM(0);

  useEffectM(() => {
    const bump = () => setPipeTick(t => t + 1);
    window.addEventListener("cina:pipeline-change", bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener("cina:pipeline-change", bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  const pipeSummary = useMemoM(() => (
    window.CinaPipeline?.getSummary ? window.CinaPipeline.getSummary() : null
  ), [pipeTick]);

  const masters = useMemoM(() => {
    const edit = pipeSummary?.edit;
    if (!edit) return MINT_MASTERS;
    const lockActive = !!edit.locked;
    const v1Count = edit.v1Count || 0;
    const durLabel = edit.duration || "00:52:14";
    return MINT_MASTERS.map((m, idx) => {
      if (idx !== 0) return m;
      return {
        ...m,
        label: lockActive ? "Cut v3 · LOCKED" : "Cut v3 · working cut",
        dur: durLabel,
        note: lockActive
          ? `${v1Count || 1} timeline clip${v1Count === 1 ? "" : "s"} · Score & titles synced · 24fps`
          : `${v1Count} timeline clip${v1Count === 1 ? "" : "s"} · Lock in 06 Edit when ready`,
        ready: lockActive || m.ready,
      };
    });
  }, [pipeSummary]);

  const readyMaster = masters.find(m => m.ready);

  const openDrawer = () => {
    if (window.openMintDrawer) {
      window.openMintDrawer({
        title: (film.title || "UNTITLED").toUpperCase() + " · GENESIS",
        symbol: (film.code || film.title || "FILM").replace(/[^A-Za-z]/g, "").slice(0, 6).toUpperCase(),
        masters: masters.filter(m => m.ready || m.id === "v2"),
      });
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden", background: "var(--c-bg)" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: "var(--w-mid)", margin: "0 auto", padding: "36px 32px 80px" }}>

          {/* Hero — the one action */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center",
            padding: "26px 28px", marginBottom: 28,
            background: "linear-gradient(100deg, rgba(var(--accent-rgb),.08) 0%, var(--c-panel) 55%)",
            border: "1px solid rgba(var(--accent-rgb),.3)", borderRadius: "var(--r-3)",
          }}>
            <div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", marginBottom: 8 }}>
                MINT · {readyMaster ? `1 MASTER READY · ${readyMaster.dur}` : "NO LOCKED MASTER YET"}
              </div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, letterSpacing: "-0.01em", color: "var(--c-ink)", lineHeight: 1.05 }}>
                Turn the locked cut into a release.
              </div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 8, maxWidth: 520, lineHeight: 1.55 }}>
                {readyMaster
                  ? <>Cut v3 ({readyMaster.dur}) is graded, mixed, and locked from 06 Edit. Configure edition sizing, splits, and unlockables in one slide-in panel.</>
                  : <>Lock a cut in 06 Edit first — minting commits a master on-chain.</>}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {!pipeSummary?.edit?.locked && window.CinaPipeline?.go && (
                <button onClick={() => window.CinaPipeline.go("editor")} className="btn btn-ghost" style={{ height: 46, padding: "0 18px", fontSize: "var(--fs-body)", borderRadius: 0 }}>
                  ← 06 Edit
                </button>
              )}
              <button onClick={openDrawer} disabled={!readyMaster} className="btn btn-primary" style={{
                height: 46, padding: "0 26px", fontSize: "var(--fs-body)", opacity: readyMaster ? 1 : .4, borderRadius: 0,
              }}>
                Mint a master →
              </button>
              <button onClick={() => window.CinaPipeline?.sendNext ? window.CinaPipeline.sendNext("mint") : window.dispatchEvent(new CustomEvent("cina:setView", { detail: "deliver" }))} className="btn btn-ghost" style={{
                height: 46, padding: "0 18px", fontSize: "var(--fs-label)", borderRadius: 0,
                border: "1px solid var(--c-amber)", color: "var(--c-amber)",
                fontFamily: "var(--f-mono)", letterSpacing: ".12em", fontWeight: 700, textTransform: "uppercase",
              }}>
                Send Next · Deliver →
              </button>
            </div>
          </div>

          {/* Masters strip */}
          <div style={{ marginBottom: 32 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 12 }}>MASTERS</div>
            <div className="fluid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {masters.map(m => (
                <div key={m.id} style={{
                  padding: "14px 16px", borderRadius: "var(--r-3)",
                  background: "var(--c-panel)",
                  border: `1px solid ${m.ready ? "rgba(var(--accent-rgb),.4)" : "var(--c-line)"}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: m.ready ? "var(--c-good)" : "var(--c-line-3)" }}/>
                    <span style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)" }}>{m.label}</span>
                  </div>
                  <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{m.note}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{m.dur}</span>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: m.ready ? "var(--c-good)" : "var(--c-ink-4)" }}>
                      {m.ready ? "MINTABLE" : "NOT LOCKED"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live editions */}
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>LIVE EDITIONS</div>
              <span style={{ flex: 1, height: 1, background: "var(--c-line)" }}/>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{LIVE_EDITIONS.length} MINTED</span>
            </div>
            <div className="mint-2col" style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 20, alignItems: "start" }}>
              {LIVE_EDITIONS.map(ed => (
                <MintCard key={ed.id} contractName={ed.contractName} model={ed.model} priceEth={ed.priceEth}
                  supply={ed.supply} royalty={ed.royalty} chain={ed.chain} symbol={ed.symbol} tiers={[]} compact/>
              ))}
              {/* Edition performance */}
              {LIVE_EDITIONS.map(ed => (
                <div key={ed.id + "-stats"} style={{ padding: "18px 20px", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)" }}>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 14 }}>PERFORMANCE · MINTED {ed.mintedAt.toUpperCase()}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
                    {[["SOLD", `${ed.sold} / ${ed.supply}`], ["PRIMARY REVENUE", ed.revenue.toFixed(2) + " ETH"], ["ROYALTY", ed.royalty + "% · EIP-2981"]].map(([k, v]) => (
                      <div key={k}>
                        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 4 }}>{k}</div>
                        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,.06)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                    <div style={{ width: (ed.sold / ed.supply * 100) + "%", height: "100%", background: "var(--c-amber)" }}/>
                  </div>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)", marginTop: 12 }}>
                    {Math.round(ed.sold / ed.supply * 100)}% sold · secondary trading live on the Producers market.
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MintCard({ contractName, model, priceEth, supply, royalty, chain, masterId, tiers, symbol, compact }) {
  return (
    <div style={{
      border: "1px solid var(--c-line-2)",
      background: "var(--c-panel)",
      overflow: "hidden",
      borderRadius: "var(--r-3)",
    }}>
      <div style={{ aspectRatio: "16/9", background: tkc("black"), position: "relative" }}>
        <FrameThumb kind="darkroom-est"/>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,.85) 100%)" }}></div>
        <div style={{ position: "absolute", left: 14, bottom: 12, right: 14 }}>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: compact ? 18 : 24, color: tkc("white"), lineHeight: 1.1 }}>{contractName}</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.7)", letterSpacing: ".16em", marginTop: 4 }}>
            {symbol} · {chain.toUpperCase()} · {model.toUpperCase()}
          </div>
        </div>
      </div>
      <div style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" }}>PRICE</div>
          <div className="t-num" style={{ fontSize: compact ? 16 : 22, color: "var(--c-amber)", fontFamily: "var(--f-display)", fontStyle: "italic" }}>
            {model === "tiered" ? tiers[0].price + "+" : priceEth} ETH
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" }}>EDITION</div>
          <div className="t-mono t-num" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>
            {model === "1of1" ? "1 of 1" : model === "open" ? "open · 7d" : model === "tiered" ? tiers.reduce((a,t)=>a+t.supply,0) + " total" : supply}
          </div>
        </div>
      </div>
      <div style={{ padding: "10px 14px", borderTop: "1px solid var(--c-line)", display: "flex", justifyContent: "space-between" }}>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>Royalty {royalty}%</span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>EIP-2981</span>
      </div>
    </div>
  );
}

Object.assign(window, { MintPanel });
