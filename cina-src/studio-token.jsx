// studio-token.jsx — Studio equity token detail page at #/studios/:id/token.
// The marketplace row expanded into a real page: price history, the split
// that backs the yield, holder distribution, and the trade drawer.

const { useState: usST2, useMemo: umST2 } = React;

// Resolve a studio to its token. Tickers are derived the same way the
// marketplace derives them, so both surfaces agree.
function stTicker(name) {
  const w = String(name || "").replace(/[^a-z]/gi, "").toUpperCase();
  return "$" + w.slice(0, 4);
}

function stMatch(tokenStudio, studioName) {
  const a = String(tokenStudio || "").toLowerCase().replace(/[^a-z]/g, "");
  const b = String(studioName || "").toLowerCase().replace(/[^a-z]/g, "");
  return !!a && !!b && (a.startsWith(b) || b.startsWith(a));
}

function stToken(studioId) {
  const s = (window.STUDIOS || []).find(x => x.id === studioId);
  if (!s) return null;

  // The token marketplace is the source of truth where it lists a studio.
  const listed = (window.ST_TOKENS || []).find(t => stMatch(t.studio, s.name) || t.ticker === stTicker(s.name));
  if (listed) {
    return {
      studio: s, ticker: listed.ticker, chain: "Base",
      price: listed.price, supply: listed.supply, available: listed.available,
      change30d: listed.change30d, yieldApy: listed.yieldApy, holders: listed.holders,
      mrr: listed.mrr || s.mrr || 20000,
      history: s.monthlyRevenue || null,
      color: listed.color || s.color, accent: s.accent || tkc("amber"),
      raised: listed.raised, goal: listed.goal,
    };
  }

  const mrr = s.mrr || 20000;
  const supply = 100000;
  const price = +(mrr * 12 * 0.08 / supply * 10).toFixed(2);
  return {
    studio: s,
    ticker: stTicker(s.name),
    chain: "Base",
    price,
    supply,
    available: Math.round(supply * 0.18),
    change30d: s.growth30d || 8,
    yieldApy: +((mrr * 12 * 0.08) / (price * supply) * 100).toFixed(1),
    holders: Math.round((s.subs || 4000) * 0.14),
    mrr,
    history: s.monthlyRevenue || null,
    color: s.color,
    accent: s.accent || tkc("amber"),
  };
}

function StudioTokenPage({ studioId }) {
  const t = umST2(() => stToken(studioId), [studioId]);
  const [qty, setQty] = usST2(10);
  const [side, setSide] = usST2("BUY");
  if (!t) { const s = (window.STUDIOS || []).find(x => x.id === studioId) || (window.CREATORS || []).find(x => x.id === studioId); return (
    <div className="pm" style={{ minHeight: "60vh" }}>
      <PmMasthead index="Studio equity" path={s ? s.name : "Unknown studio"} title={s ? `${s.name} hasn't issued a token.` : "No studio at this address."} lede="Only verified studios mint equity tokens. You can still subscribe to this studio, or browse the ones that trade.">
        {s && <button className="pm-btn pm-btn--primary" onClick={() => navigate(`/studios/${s.id}`)}>Back to {s.name}</button>}
        <button className="pm-btn" onClick={() => navigate("/tokens")}>Tokens that trade</button>
      </PmMasthead>
    </div>
  ); }

  const s = t.studio;
  const creators = window.CREATORS || [];
  const members = (s.members || []).map(id => creators.find(c => c.id === id)).filter(Boolean);
  const hist = t.history || Array.from({ length: 8 }, (_, i) => t.mrr * (0.62 + i * 0.055));
  const min = Math.min(...hist), max = Math.max(...hist);
  const pts = hist.map((v, i) => `${(i / (hist.length - 1)) * 100},${34 - ((v - min) / (max - min || 1)) * 30}`).join(" ");
  const cost = qty * t.price;
  const PADX = "var(--gutter)";

  return (
    <div data-screen-label="Studio token" style={{ background: "var(--c-bg)", minHeight: "100vh", paddingBottom: 90 }}>
      {/* Masthead */}
      <div style={{ padding: `26px ${PADX} 0` }}>
        <button className="btn-ghost" onClick={() => navigate(`/studios/${s.id}`)} style={{ height: 28, padding: "0 11px", fontSize: "var(--fs-body)", marginBottom: 20 }}>← {s.name}</button>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 26, flexWrap: "wrap", paddingBottom: 20, borderBottom: "1px solid var(--c-line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
            <span style={{ width: 56, height: 56, borderRadius: "var(--r-2)", background: t.color, display: "grid", placeItems: "center", color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", flex: "0 0 auto" }}>{s.name[0]}</span>
            <div style={{ minWidth: 0 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 7 }}>STUDIO EQUITY · {t.chain.toUpperCase()}</div>
              <h1 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "clamp(32px,4vw,50px)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1 }}>
                {t.ticker}
              </h1>
            </div>
          </div>
          <span style={{ flex: 1 }}/>
          <div style={{ display: "flex", gap: 34, flexWrap: "wrap" }}>
            {[
              ["PRICE", "$" + t.price.toFixed(2), null],
              ["30D", (t.change30d >= 0 ? "+" : "") + t.change30d.toFixed(1) + "%", t.change30d >= 0 ? "var(--c-good)" : tkc("bad")],
              ["YIELD APY", t.yieldApy.toFixed(1) + "%", "var(--c-amber)"],
              ["HOLDERS", t.holders.toLocaleString(), null],
            ].map(([k, v, c]) => (
              <div key={k}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 6 }}>{k}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-lead)", color: c || "var(--c-ink)", fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 26, padding: `26px ${PADX} 0`, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 26, minWidth: 0 }}>
          {/* Revenue that backs the yield */}
          <section style={{ padding: 20, border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", background: "var(--c-panel)" }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 16 }}>WHAT BACKS THE YIELD · MONTHLY REVENUE</div>
            <svg viewBox="0 0 100 36" preserveAspectRatio="none" style={{ width: "100%", height: 96, display: "block" }}>
              <polyline points={pts} fill="none" stroke={t.accent} strokeWidth="1" vectorEffect="non-scaling-stroke"/>
            </svg>
            <div style={{ display: "flex", gap: 30, marginTop: 16, flexWrap: "wrap" }}>
              {[["MRR", "$" + (t.mrr / 1000).toFixed(1) + "K"], ["SUBSCRIBERS", (s.subs || 0).toLocaleString()], ["CHURN", (s.churn || 0) + "%"], ["TO HOLDERS", "8% OF NET"]].map(([k, v]) => (
                <div key={k}>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 5 }}>{k}</div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{v}</div>
                </div>
              ))}
            </div>
          </section>

          {/* The split */}
          {members.length > 0 && (
            <section style={{ padding: 20, border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", background: "var(--c-panel)" }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 16 }}>THE AGREEMENT · REVENUE SPLIT</div>
              <div style={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", marginBottom: 16 }}>
                {members.map(m => (
                  <span key={m.id} style={{ width: `${(s.splits?.[m.id] || Math.round(100 / members.length))}%`, background: m.color || t.color }}/>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {members.map(m => (
                  <button key={m.id} onClick={() => navigate(`/studios/${m.id}`)} style={{
                    appearance: "none", cursor: "pointer", textAlign: "left", color: "inherit", border: "none",
                    background: "transparent", display: "flex", alignItems: "center", gap: 11, padding: "9px 2px",
                  }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: m.color, flex: "0 0 auto" }}/>
                    <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", flex: 1, minWidth: 0 }}>{m.name}</span>
                    <span className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{s.splits?.[m.id] || Math.round(100 / members.length)}%</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <p style={{ fontSize: "var(--fs-body)", lineHeight: 1.6, color: "var(--c-ink-3)", maxWidth: 660, margin: 0, textWrap: "pretty" }}>
            {t.ticker} is an equity token in {s.name}. Holders receive 8% of net studio revenue, distributed monthly on {t.chain}, and a vote on which submissions the house accepts. It is not a claim on any single film — individual titles are financed separately on Producers.
          </p>
        </div>

        {/* Trade */}
        <aside style={{ padding: 18, border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", background: "var(--c-panel)", position: "sticky", top: 16 }}>
          <div style={{ display: "flex", gap: 4, padding: 3, background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: 999, marginBottom: 16 }}>
            {["BUY", "SELL"].map(k => (
              <button key={k} onClick={() => setSide(k)} style={{
                flex: 1, appearance: "none", cursor: "pointer", padding: "7px 0", borderRadius: 999, border: "none",
                background: side === k ? (k === "BUY" ? "var(--c-good)" : tkc("bad")) : "transparent",
                color: side === k ? tkc("bg") : "var(--c-ink-3)",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
              }}>{k}</button>
            ))}
          </div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 7 }}>QUANTITY</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            <input type="number" value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} style={{
              flex: 1, minWidth: 0, appearance: "none", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)",
              borderRadius: "var(--r-2)", padding: "10px 11px", color: "var(--c-ink)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)",
            }}/>
            {[10, 50, 250].map(n => (
              <button key={n} onClick={() => setQty(n)} className="btn-ghost" style={{ height: 38, padding: "0 10px", fontSize: "var(--fs-label)" }}>{n}</button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 14, borderBottom: "1px solid var(--c-line)", marginBottom: 14 }}>
            {[["Price", "$" + t.price.toFixed(2)], ["Est. annual yield", "$" + (cost * t.yieldApy / 100).toFixed(2)], ["Available", t.available.toLocaleString() + " / " + t.supply.toLocaleString()]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--fs-body)" }}>
                <span style={{ color: "var(--c-ink-3)" }}>{k}</span><span className="t-mono" style={{ color: "var(--c-ink)" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>TOTAL</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-title)", color: "var(--c-amber)" }}>${cost.toFixed(2)}</span>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", height: 42 }} onClick={() => {
            if (window.openPayDrawer) {
              window.openPayDrawer({
                kind: "nft", title: t.ticker + " · " + s.name, subtitle: qty + " tokens · " + t.chain,
                accent: t.accent, priceUSD: cost,
                perks: [t.yieldApy.toFixed(1) + "% APY from studio revenue", "Vote on house submissions", "Monthly distribution on " + t.chain],
                ticker: t.ticker,
                onConfirm: () => window.toast && window.toast({ title: side + " FILLED", text: qty + " " + t.ticker + " · $" + cost.toFixed(2), kind: "good" }),
              });
            } else if (window.toast) {
              window.toast({ title: side + " FILLED", text: qty + " " + t.ticker + " · $" + cost.toFixed(2), kind: "good" });
            }
          }}>{side === "BUY" ? "Buy" : "Sell"} {qty} {t.ticker}</button>
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { StudioTokenPage, stToken, stMatch });
