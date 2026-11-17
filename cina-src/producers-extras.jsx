// producers-extras.jsx — Inline enhancements for Producers.html market view.
// Adds: "How it works" explainer + Top movers live ticker.

const { useState: usPex, useEffect: uePex, useMemo: umPex } = React;

function HowItWorks() {
  const steps = [
    { n: "01", t: "Browse", b: "Every Cina film and series opens a fundraise. Pick a project, read the slate, see the director's commitments." },
    { n: "02", t: "Pick a tier", b: "Three tiers. Collector ($90+), Patron ($400+), Producer ($2,500+). Higher tiers = larger revenue share + more perks." },
    { n: "03", t: "Earn", b: "Quarterly royalties from Watch subs, ad revenue, and licensing. Smart contracts auto-route on settlement. No invoices." },
    { n: "04", t: "Trade or hold", b: "Sell your stake on the secondary market anytime. Cina takes 1% of resale. Holders watch films first." },
  ];
  return (
    <section style={{
      marginTop: 32,
      padding: "26px 30px",
      background: "linear-gradient(135deg, rgba(var(--accent-rgb),.05) 0%, var(--c-panel) 80%)",
      border: "1px solid var(--c-line)",
      borderLeft: "2px solid var(--c-amber)",
      borderRadius: "var(--r-2)",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18 }}>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 600 }}>HOW IT WORKS</span>
        <h2 style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, letterSpacing: "-0.01em", color: "var(--c-ink)" }}>Back films. Earn royalties. Trade your stake.</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {steps.map(s => (
          <div key={s.n} style={{ display: "flex", gap: 12 }}>
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
              letterSpacing: ".16em", color:  "var(--c-amber)",
              fontWeight: 700, flexShrink: 0, paddingTop: 2,
            }}>{s.n}</div>
            <div>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500, lineHeight: 1.1 }}>{s.t}</div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5, marginTop: 4 }}>{s.b}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TopMovers({ projects, onOpen }) {
  // Synthesize a "24h change" from project seed
  const movers = umPex(() => {
    return projects.map(p => {
      const seed = (p.id || "x").split("").reduce((s, c) => s + c.charCodeAt(0), 0);
      const change24h = ((seed * 13) % 60 - 18) / 10; // -1.8% to +4.2%
      const floor = p.tiers?.[0]?.priceUSD || 100;
      return { ...p, change24h, floor };
    }).sort((a, b) => b.change24h - a.change24h);
  }, [projects]);

  const top = movers.slice(0, 6);
  const trades = umPex(() => {
    const ticker = ["BUY", "BUY", "SELL", "BUY", "SELL", "BUY", "BUY"];
    return top.slice(0, 7).map((p, i) => ({
      side: ticker[i] || "BUY",
      project: p,
      tier: ["Collector", "Patron", "Producer"][i % 3],
      qty: [1, 2, 1, 3, 1, 4, 1][i],
      price: Math.round(p.floor * (0.9 + (i % 4) * 0.1)),
      who: ["0xA1c4..f3D2", "0x9b48..ce71", "0x4f02..b8c1", "0x77a2..00ee", "0x2210..3def", "0x80c1..1e22", "0x5566..aabb"][i],
      ago: `${(i + 1) * 14}s`,
    }));
  }, [top]);

  return (
    <section className="pex-movers" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: 18 }}>
      <style>{`.pex-row{grid-template-columns:44px minmax(0,1fr) 80px 80px 80px}
@media (max-width:860px){.pex-movers{grid-template-columns:minmax(0,1fr)!important}}
@media (max-width:600px){.pex-row{grid-template-columns:40px minmax(0,1fr) 62px 64px;padding-left:14px!important;padding-right:14px!important}.pex-row>:nth-child(5){display:none}}`}</style>
      {/* Top movers */}
      <div style={{
        background: "var(--c-panel)", border: "1px solid var(--c-line)",
        borderRadius: "var(--r-2)", overflow: "hidden",
      }}>
        <div style={{
          padding: "12px 18px", background: "var(--c-panel-2)",
          borderBottom: "1px solid var(--c-line)",
          display: "flex", alignItems: "center", gap: 10,
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
          letterSpacing: ".16em", color: "var(--c-ink-3)",
          textTransform: "uppercase",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 6px var(--c-good)" }}/>
          <span>TOP MOVERS · 24H</span>
        </div>
        <div className="pex-row" style={{
          display: "grid",
          padding: "10px 18px", background: "var(--c-panel-2)",
          borderBottom: "1px solid var(--c-line)",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
          letterSpacing: ".16em", color: "var(--c-ink-3)",
          textTransform: "uppercase",
        }}>
          <div></div><div>PROJECT</div><div>FLOOR</div><div>24H</div><div style={{ textAlign: "right" }}>RAISED</div>
        </div>
        {top.map((p, i) => (
          <button key={p.id} className="pex-row" onClick={() => onOpen(p.id)} style={{
            display: "grid",
            padding: "12px 18px", alignItems: "center", gap: 4,
            border: "none", background: "transparent",
            borderBottom: i < top.length - 1 ? "1px solid var(--c-line)" : "none",
            color: "inherit", textAlign: "left", cursor: "pointer", width: "100%",
            transition: "background .14s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--c-panel-2)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ width: 34, height: 22, borderRadius: "var(--r-1)", overflow: "hidden", background: p.color }}>
              {typeof FrameThumb === "function" && <FrameThumb kind={p.thumb} usePhoto/>}
            </div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.1 }}>
              {p.film?.title || p.title}
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", marginLeft: 8, fontStyle: "normal" }}>
                {p.kind === "series" ? "SERIES" : "FILM"}
              </span>
            </div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-amber)", fontWeight: 600 }}>${p.floor}</div>
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", fontWeight: 600,
              color: p.change24h >= 0 ? "var(--c-good)" : "var(--c-blood-l)",
            }}>
              {p.change24h >= 0 ? "▲" : "▼"} {Math.abs(p.change24h).toFixed(1)}%
            </div>
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-2)",
              textAlign: "right",
            }}>
              ${(p.raised / 1000).toFixed(0)}k
            </div>
          </button>
        ))}
      </div>

      {/* Trade feed */}
      <div style={{
        background: "var(--c-panel)", border: "1px solid var(--c-line)",
        borderRadius: "var(--r-2)", overflow: "hidden",
      }}>
        <div style={{
          padding: "12px 18px", background: "var(--c-panel-2)",
          borderBottom: "1px solid var(--c-line)",
          display: "flex", alignItems: "center", gap: 10,
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
          letterSpacing: ".16em", color: "var(--c-ink-3)",
          textTransform: "uppercase",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 6px var(--c-good)" }}/>
          <span>LIVE TRADES · ON-CHAIN</span>
        </div>
        {trades.map((tr, i) => (
          <div key={i} style={{
            padding: "10px 16px",
            display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center",
            borderBottom: i < trades.length - 1 ? "1px solid var(--c-line)" : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--fs-body)", minWidth: 0 }}>
              <span style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", padding: "2px 5px",
                background: tr.side === "BUY" ? "rgba(106,163,122,.15)" : "rgba(201,85,72,.15)",
                color: tr.side === "BUY" ? "var(--c-good)" : "var(--c-blood-l)",
                border: `1px solid ${tr.side === "BUY" ? "rgba(106,163,122,.4)" : "rgba(201,85,72,.4)"}`,
                borderRadius: "var(--r-1)", letterSpacing: ".16em", fontWeight: 700,
              }}>{tr.side}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {tr.project.film?.title || tr.project.title}
                </div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", marginTop: 1 }}>
                  ×{tr.qty} {tr.tier} · {tr.who}
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-amber)", fontWeight: 600 }}>${(tr.price * tr.qty).toLocaleString()}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" }}>{tr.ago}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

Object.assign(window, { HowItWorks, TopMovers });
