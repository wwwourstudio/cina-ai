// strategy-producers.jsx — Strategy Move 01 (Catalog Index) + Move 05 (Royalty Pool) + Move 10 (Treasury)
// Adds: CatalogIndexPage (#index), RoyaltyPoolCard, TreasuryStat.

const { useState: usSPr, useMemo: umSPr } = React;

// ─── Catalog Index — every film as a tradable asset class ──────────────
function CatalogIndexPage({ projects, onOpen }) {
  const [sort, setSort] = usSPr("vol");
  const [horizon, setHorizon] = usSPr("30d");

  const rows = umSPr(() => {
    // Deterministic per-film stats (seeded by id) so values don't churn on
    // every render / sort — the screenshot bug where %s changed each frame.
    const seedRand = (str, salt) => {
      let h = salt;
      for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
      const x = Math.sin(h) * 43758.5453;
      return x - Math.floor(x);
    };
    const list = (projects || []).map(p => {
      const price = (p.shareValue || p.entry || 100);
      const ch24h = (seedRand(p.id || "x", 11) - 0.4) * 12;
      const ch7d  = (seedRand(p.id || "x", 23) - 0.3) * 22;
      const vol   = Math.floor(40000 + seedRand(p.id || "x", 37) * 380000);
      const holders = p.holders || Math.floor(120 + seedRand(p.id || "x", 53) * 4200);
      const mcap = price * (p.totalShares || 10000);
      return { ...p, price, ch24h, ch7d, vol, holders, mcap };
    });
    if (sort === "vol")     list.sort((a,b) => b.vol - a.vol);
    if (sort === "mcap")    list.sort((a,b) => b.mcap - a.mcap);
    if (sort === "ch")      list.sort((a,b) => (horizon === "24h" ? b.ch24h - a.ch24h : b.ch7d - a.ch7d));
    if (sort === "holders") list.sort((a,b) => b.holders - a.holders);
    return list;
  }, [projects, sort, horizon]);

  const indexLevel = umSPr(() => {
    const avg = rows.reduce((s,r) => s + (horizon === "24h" ? r.ch24h : r.ch7d), 0) / Math.max(1, rows.length);
    return { level: 1000 + Math.round(avg * 4.2), change: avg };
  }, [rows, horizon]);

  return (
    <div style={{ padding: "32px var(--gutter) 80px", maxWidth: "var(--w-page)", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 12 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-amber)" }}/>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>
          THE CINA INDEX · STRATEGY MOVE 01
        </span>
      </div>
      <h1 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-display)", fontWeight: 400, margin: 0, lineHeight: 1, letterSpacing: "-0.02em" }}>
        Cinema as an asset class.
      </h1>
      <p className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink-2)", maxWidth: 720, marginTop: 16, lineHeight: 1.45 }}>
        Every released film mints fractional rights paying smart-contract royalties. The index tracks the whole catalog like the S&amp;P, weighted by market cap.
      </p>

      {/* Index hero */}
      <div style={{
        marginTop: 28, padding: "22px 26px",
        background: "linear-gradient(135deg, rgba(var(--accent-rgb),0.08), transparent 60%)",
        border: "1px solid rgba(var(--accent-rgb),0.30)", borderRadius: "var(--r-2)",
        display: "grid", gridTemplateColumns: "auto auto 1fr auto", gap: 32, alignItems: "center",
      }}>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>CINA INDEX</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-amber)", lineHeight: 1, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
            {indexLevel.level.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>{horizon.toUpperCase()} CHANGE</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: indexLevel.change >= 0 ? tkc("good") : tkc("bad"), marginTop: 6 }}>
            {indexLevel.change >= 0 ? "+" : ""}{indexLevel.change.toFixed(2)}%
          </div>
        </div>
        <SparkLine width={420}/>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {["24h","7d","30d","1y"].map(h => (
            <button key={h} onClick={() => setHorizon(h)} className="btn-ghost" style={{
              padding: "4px 10px", height: "auto", fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)",
              background: horizon === h ? "rgba(var(--accent-rgb),0.10)" : "transparent",
              border: `1px solid ${horizon === h ? "var(--c-amber)" : "var(--c-line)"}`,
              color: horizon === h ? "var(--c-amber)" : "var(--c-ink-2)", borderRadius: "var(--r-1)",
              letterSpacing: ".16em", textAlign: "left", minWidth: 64,
            }}>{h}</button>
          ))}
        </div>
      </div>

      {/* Royalty pool + Treasury row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 }}>
        <RoyaltyPoolCard/>
        <TreasuryCard/>
      </div>

      {/* Sort row */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", margin: "32px 0 14px" }}>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>SORT</span>
        {[
          { id: "vol",     label: "Volume" },
          { id: "mcap",    label: "Market cap" },
          { id: "ch",      label: "Change" },
          { id: "holders", label: "Holders" },
        ].map(o => (
          <button key={o.id} onClick={() => setSort(o.id)} className="btn-ghost" style={{
            padding: "5px 12px", height: "auto", fontSize: "var(--fs-body)",
            background: sort === o.id ? "rgba(var(--accent-rgb),0.10)" : "transparent",
            border: `1px solid ${sort === o.id ? "var(--c-amber)" : "var(--c-line)"}`,
            color: sort === o.id ? "var(--c-amber)" : "var(--c-ink-2)", borderRadius: "var(--r-1)",
          }}>{o.label}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
        {/* head */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "40px 1.5fr 1fr 100px 100px 1fr 100px 100px",
          padding: "10px 18px", gap: 12,
          background: "var(--c-panel-2)", borderBottom: "1px solid var(--c-line)",
          fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", fontFamily: "var(--f-mono)",
        }}>
          <span>#</span><span>FILM</span><span>CREATOR</span>
          <span style={{ textAlign: "right" }}>PRICE</span>
          <span style={{ textAlign: "right" }}>{horizon.toUpperCase()} %</span>
          <span style={{ textAlign: "right" }}>VOLUME</span>
          <span style={{ textAlign: "right" }}>HOLDERS</span>
          <span style={{ textAlign: "right" }}>MCAP</span>
        </div>
        {rows.map((r, i) => {
          const ch = horizon === "24h" ? r.ch24h : r.ch7d;
          return (
            <button key={r.id} onClick={() => onOpen && onOpen(r.id)} className="btn-ghost" style={{
              display: "grid", gridTemplateColumns: "40px 1.5fr 1fr 100px 100px 1fr 100px 100px",
              padding: "12px 18px", gap: 12, height: "auto", textAlign: "left", width: "100%",
              borderBottom: i < rows.length - 1 ? "1px solid var(--c-line)" : "none", borderRadius: 0,
              alignItems: "center",
            }}>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{String(i+1).padStart(2,"0")}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                <div style={{ width: 46, height: 30, borderRadius: "var(--r-2)", background: r.color || "var(--c-panel-3)", flexShrink: 0, overflow: "hidden", position: "relative" }}>
                  {window.FrameThumb ? <FrameThumb kind={r.thumb} usePhoto/> : null}
                </div>
                <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.film?.title || r.title}</span>
                {r.branched && window.BranchedTag ? <window.BranchedTag compact/> : null}
              </div>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", letterSpacing: ".08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {(r.creator || "").toString().toUpperCase()}
              </span>
              <span className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                ${r.price.toFixed(2)}
              </span>
              <span className="t-mono" style={{ fontSize: "var(--fs-body)", color: ch >= 0 ? tkc("good") : tkc("bad"), textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {ch >= 0 ? "+" : ""}{ch.toFixed(2)}%
              </span>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                ${(r.vol/1000).toFixed(1)}k
              </span>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {r.holders.toLocaleString()}
              </span>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                ${(r.mcap/1e6).toFixed(2)}M
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sparkline ─────────────────────────────────────────────────────────
function SparkLine({ width = 280 }) {
  const pts = umSPr(() => {
    let v = 50; const arr = [];
    for (let i = 0; i < 32; i++) { v += (Math.random() - 0.45) * 8; arr.push(Math.max(10, Math.min(90, v))); }
    return arr;
  }, []);
  const w = width, h = 64;
  const d = pts.map((y, i) => `${(i/(pts.length-1))*w},${h - (y/100)*h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline points={d} fill="none" stroke= "var(--c-amber)" strokeWidth="1.5" opacity="0.85"/>
      <polyline points={`0,${h} ${d} ${w},${h}`} fill="rgba(var(--accent-rgb),0.10)" stroke="none"/>
    </svg>
  );
}

// ─── Royalty Pool Card (Move 05) ───────────────────────────────────────
function RoyaltyPoolCard() {
  const session = window.useProducerSession ? window.useProducerSession() : null;
  const cited = 14;
  const earned = 4280;
  return (
    <div style={{
      padding: "20px 24px", background: "var(--c-panel)",
      border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>
        DIRECTOR ROYALTY POOL · MOVE 05
      </div>
      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", lineHeight: 1.15, color: "var(--c-ink)", fontWeight: 400 }}>
        Style citations earn for life.
      </div>
      <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", margin: 0, lineHeight: 1.5 }}>
        Every Cina film tithes 5% to the directors whose declared style is being borrowed. We publish the influence graph; the pool pays out monthly.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, paddingTop: 12, borderTop: "1px solid var(--c-line)" }}>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>POOL THIS MONTH</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-amber)", marginTop: 3 }}>$284k</div>
        </div>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>YOU CITED</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 3 }}>{cited}×</div>
        </div>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>YOUR SHARE</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 3 }}>${earned.toLocaleString()}</div>
        </div>
      </div>
      <button onClick={() => window.toast?.("Routed to royalty pool · claim ready")} className="btn-primary" style={{ minHeight: 36, fontSize: "var(--fs-body)" }}>
        Claim ${earned.toLocaleString()}
      </button>
    </div>
  );
}

// ─── Treasury Card (Move 10) ───────────────────────────────────────────
function TreasuryCard() {
  return (
    <div style={{
      padding: "20px 24px", background: "var(--c-panel)",
      border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>
        TREASURY YIELD · MOVE 10
      </div>
      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", lineHeight: 1.15, color: "var(--c-ink)", fontWeight: 400 }}>
        The float earns. Holders share.
      </div>
      <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", margin: 0, lineHeight: 1.5 }}>
        Every primary sale, ticket, tip and royalty parks briefly in the treasury. Staked on-chain in low-risk LSTs and T-bills. Yield published live; every holder gets a slice pro-rata to stake.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, paddingTop: 12, borderTop: "1px solid var(--c-line)" }}>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>FLOAT</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-amber)", marginTop: 3 }}>$48.2M</div>
        </div>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>NET APY</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 3 }}>4.62%</div>
        </div>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>YOUR Q YIELD</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 3 }}>$182.40</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => window.toast?.("Auto-stake enabled on idle balance")} className="btn-ghost" style={{ flex: 1, minHeight: 36, fontSize: "var(--fs-body)", border: "1px solid var(--c-line)" }}>
          Auto-stake idle
        </button>
        <button onClick={() => window.toast?.("View prospectus · published quarterly")} className="btn-ghost" style={{ flex: 1, minHeight: 36, fontSize: "var(--fs-body)", border: "1px solid var(--c-line)" }}>
          Prospectus
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { CatalogIndexPage });
