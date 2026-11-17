// watch-money.jsx — money plumbing for the public site.
//
// Three pages (creator + collector + onboarding):
//
//   /payouts       Creator payout dashboard — earnings by film, payment
//                  history, methods (USDC / ETH / bank ACH), tax docs.
//   /leaderboard   Top-earning films + top holders. NFT market activity.
//   /wallet/buy    Buy crypto with card (fiat → USDC/ETH), connect wallet,
//                  on/off ramp.
//
// All three share the same calm reading column + numeric grid that the
// Watch app uses elsewhere. No new colors, no new fonts. Amber only on
// active states.

const { useState: usMx, useEffect: uMx, useMemo: umMx } = React;

// ─── Helpers ─────────────────────────────────────────────────────────────

function fmtUSD(n) {
  const s = Math.abs(n) >= 1000 ? Math.round(n).toLocaleString() : n.toFixed(2);
  return `$${s}`;
}
function fmtCompact(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n)}`;
}
function fmtMoneyPct(n, dp = 1) {
  const s = (n >= 0 ? "+" : "") + n.toFixed(dp) + "%";
  return s;
}

// ─── Synthetic creator earnings (keyed off CATALOG) ──────────────────────

function computeCreatorPayouts(creatorId) {
  const films = window.CATALOG.filter(f => f.creatorId === creatorId);
  const rows = films.map(f => {
    // Pull synthetic numbers from existing fields
    const views = f.views || (f.ratings * 12) || 5_000;
    const cpm = (f.kind === "series" ? 9 : 7);
    const adRev = (views / 1000) * cpm * 0.55; // 55% creator share
    const subRev = (f.subscribers || 0) * 4.99 * 0.7; // 70% of subs
    const rentBuy = (f.rentBuyCount || Math.round(views * 0.04)) * 5.5;
    const nftRoyalty = window.NFT_PROJECTS[f.nft]?.royaltyPaid * 0.5 || 0;
    const total = adRev + subRev + rentBuy + nftRoyalty;
    return {
      filmId: f.id, title: f.title, kind: f.kind, views, total,
      adRev, subRev, rentBuy, nftRoyalty,
    };
  });
  rows.sort((a, b) => b.total - a.total);
  const total = rows.reduce((s, r) => s + r.total, 0);
  return { rows, total, films };
}

// History — derived from txHistory + a few synthesized payouts
function fakePayoutHistory(creatorId) {
  const months = ["May 2026", "Apr 2026", "Mar 2026", "Feb 2026", "Jan 2026", "Dec 2025"];
  let base = 4200;
  return months.map((m, i) => {
    const amt = Math.round(base * (0.85 + Math.random() * 0.4));
    base = amt;
    return {
      month: m,
      amount: amt,
      method: i % 3 === 0 ? "USDC · Base" : i % 3 === 1 ? "ETH · Base" : "ACH · Mercury",
      status: i === 0 ? "scheduled" : "settled",
      txHash: i === 0 ? null : "0x" + ((i + 1) * 2654435761 >>> 0).toString(16).padStart(8, "0"),
      d: ({0:"2026-06-01",1:"2026-05-01",2:"2026-04-01",3:"2026-03-01",4:"2026-02-01",5:"2026-01-01"})[i],
    };
  });
}

// ─── Payouts page ────────────────────────────────────────────────────────

function PayoutsPage() {
  // Persona — pretend the user IS a creator. Use Voss as the demo.
  const creatorId = window.USER?.creatorId || "voss";
  const creator = window.getCreator(creatorId);
  const { rows, total, films } = umMx(() => computeCreatorPayouts(creatorId), [creatorId]);
  const history = umMx(() => fakePayoutHistory(creatorId), [creatorId]);

  const [method, setMethod] = usMx("usdc"); // usdc | eth | ach

  // Real ledger lines — the money the prototype actually recorded.
  const realLines = umMx(() => {
    const rd = (k) => { try { const v = JSON.parse(localStorage.getItem(k)); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
    const forks = rd("cina:fork-ledger");
    const sales = rd("cina:commerce:ledger");
    const wardrobe = sales.reduce((a, r) => a + (r.cut || 0), 0);
    return [
      { label: "Branch royalties", sub: `${forks.length} viewer choice${forks.length === 1 ? "" : "s"} · $0.12 view-share each`, amount: forks.length * 0.12, live: forks.length > 0 },
      { label: "Wardrobe commissions", sub: `${sales.length} piece${sales.length === 1 ? "" : "s"} bought off the screen · 12% of retail`, amount: wardrobe, live: sales.length > 0 },
    ];
  }, []);

  // 30-day series for the chart
  const trend = umMx(() => {
    const days = 30;
    const pts = [];
    let v = 80;
    for (let i = 0; i < days; i++) {
      v = v * (0.9 + Math.random() * 0.25);
      pts.push(Math.max(20, v));
    }
    return pts;
  }, []);

  return (
    <div style={{ background: "var(--c-bg)", minHeight: "100vh" }}>
      <div style={{ padding: "0 var(--gutter) 96px", maxWidth: "var(--w-page)", margin: "0 auto" }}>
        <PmMasthead bare index="Account" path="Payouts" count={creator?.name} title="Payouts" lede="Earnings from ads, subscriptions, rentals and producer passes. Paid monthly on the 1st."/>

        {/* TOP STATS — three columns, big numbers, no chrome */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0, borderTop: "1px solid var(--c-line-2)", borderBottom: "1px solid var(--c-line-2)",
          marginBottom: 40,
        }}>
          <StatCell label="Lifetime earned" value={fmtUSD(total)} sub={`across ${films.length} ${films.length===1?"film":"titles"}`}/>
          <StatCell label="Pending payout" value={fmtUSD(history[0].amount)} sub={`scheduled ${history[0].d}`} accent/>
          <StatCell label="Last 30 days" value={fmtUSD(trend.reduce((s,n)=>s+n,0))} sub={fmtMoneyPct(12.4)} positive/>
        </div>

        {/* Live ledger lines — real recorded money, not synthetic */}
        <Section label="Live this session" right={<span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".16em" }}>● FROM REAL LEDGERS</span>}>
          <div style={{ border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
            {realLines.map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 18px", borderBottom: "1px solid var(--c-line)", background: l.live ? "rgba(106,163,122,.04)" : "transparent" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: l.live ? "var(--c-good)" : "var(--c-line-2)", flexShrink: 0 }}></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{l.label}</span>
                  <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginTop: 2 }}>{l.sub.toUpperCase()}</span>
                </span>
                <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: l.live ? "var(--c-good)" : "var(--c-ink-3)" }}>{fmtUSD(l.amount)}</span>
              </div>
            ))}
            <div className="t-mono" style={{ padding: "9px 18px", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>EVERY FORK CHOICE AND WARDROBE SALE IN THE PROTOTYPE LANDS HERE · SETTLED WITH THE MONTHLY PAYOUT</div>
          </div>
        </Section>

        {/* 30-day trend */}
        <Section label="Earnings trend" right={<span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>30D · USD</span>}>
          <Sparkline points={trend} height={120}/>
        </Section>

        {/* By title — table */}
        <Section label="By title">
          <div style={{ border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1.2fr",
              padding: "10px 18px", borderBottom: "1px solid var(--c-line)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              color: "var(--c-ink-4)", textTransform: "uppercase",
            }}>
              <span>Title</span>
              <span style={{ textAlign: "right" }}>Views</span>
              <span style={{ textAlign: "right" }}>Ads</span>
              <span style={{ textAlign: "right" }}>Subs</span>
              <span style={{ textAlign: "right" }}>NFT</span>
              <span style={{ textAlign: "right" }}>Total</span>
            </div>
            {rows.map((r, i) => (
              <button
                key={r.filmId}
                onClick={() => navigate(`/film/${r.filmId}`)}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1.2fr",
                  padding: "14px 18px", border: "none", background: "transparent",
                  borderTop: i === 0 ? "none" : "1px solid var(--c-line)",
                  cursor: "pointer", textAlign: "left", width: "100%",
                  alignItems: "center", color: "var(--c-ink)",
                  transition: "background .14s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--c-panel)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{r.title}</div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 2 }}>
                    {r.kind === "series" ? "SERIES" : "FILM"}
                  </div>
                </div>
                <div className="t-mono" style={{ fontSize: "var(--fs-body)", textAlign: "right" }}>{r.views >= 1e6 ? (r.views/1e6).toFixed(1) + "M" : (r.views/1000).toFixed(1) + "K"}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", textAlign: "right" }}>{fmtCompact(r.adRev)}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", textAlign: "right" }}>{fmtCompact(r.subRev)}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", textAlign: "right" }}>{r.nftRoyalty > 0 ? fmtCompact(r.nftRoyalty) : "—"}</div>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", textAlign: "right" }}>{fmtUSD(r.total)}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* Two-column: Payment method + History */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 40, marginTop: 56 }}>

          {/* Payment method */}
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 14 }}>PAYMENT METHOD</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { id: "usdc", label: "USDC", chain: "Base", addr: "0x71c…3F2a", time: "instant" },
                { id: "eth",  label: "ETH",  chain: "Base", addr: "0x71c…3F2a", time: "instant" },
                { id: "ach",  label: "ACH transfer", chain: "Mercury Bank", addr: "•••• 4421", time: "1–3 business days" },
              ].map(m => {
                const active = method === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 16px", textAlign: "left",
                      border: `1px solid ${active ? "var(--c-amber)" : "var(--c-line)"}`,
                      background: active ? "rgba(var(--accent-rgb),.06)" : "transparent",
                      borderRadius: "var(--r-2)", cursor: "pointer", color: "var(--c-ink)",
                    }}
                  >
                    <div style={{
                      width: 14, height: 14, borderRadius: "50%",
                      border: `1.5px solid ${active ? "var(--c-amber)" : "var(--c-line-2)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {active && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-amber)" }}/>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{m.label}</div>
                      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 2 }}>{m.chain} · {m.addr}</div>
                    </div>
                    <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{m.time}</div>
                  </button>
                );
              })}
            </div>
            <button
              className="btn-ghost"
              onClick={() => toast({ title: "TAX DOCS", text: "1099-NEC for 2025 sent to your inbox", kind: "good" })}
              style={{
                marginTop: 16, fontSize: "var(--fs-body)", color: "var(--c-ink-3)",
                padding: "8px 0", height: "auto", justifyContent: "flex-start",
              }}
            >
              Download tax documents (1099) →
            </button>
          </div>

          {/* History */}
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 14 }}>PAYOUT HISTORY</div>
            <div style={{ borderTop: "1px solid var(--c-line)" }}>
              {history.map((p, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 0.8fr",
                  padding: "16px 0", borderBottom: "1px solid var(--c-line)",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{p.month}</div>
                    <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 2 }}>{p.d}</div>
                  </div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>{p.method}</div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", textAlign: "right" }}>{fmtUSD(p.amount)}</div>
                  <div style={{ textAlign: "right" }}>
                    {p.status === "scheduled" ? (
                      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>SCHEDULED</span>
                    ) : (
                      <button
                        onClick={() => toast({ title: "TX VIEW", text: p.txHash, kind: "good" })}
                        className="btn-ghost"
                        style={{ fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", color: "var(--c-ink-3)", padding: 0, height: "auto", letterSpacing: ".08em" }}
                      >
                        {p.txHash} ↗
                      </button>
                    )}
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

// ─── NFT Leaderboard page ────────────────────────────────────────────────

function LeaderboardPage() {
  const [tab, setTab] = usMx("films"); // films | holders | volume

  // Compute top-earning films from CATALOG + NFT_PROJECTS
  const films = umMx(() => {
    const all = window.CATALOG.map(f => {
      const proj = window.NFT_PROJECTS[f.nft];
      const earnings = (proj?.royaltyPaid || 0) + ((f.views || 0) * 0.012);
      const change = (Math.sin(f.id.charCodeAt(0)) * 25) + 5;
      return { ...f, earnings, change, project: proj };
    });
    all.sort((a, b) => b.earnings - a.earnings);
    return all.slice(0, 12);
  }, []);

  // Synthesize top holders
  const holders = umMx(() => {
    const handles = ["pellucid.eth", "noir.eth", "screenslip.eth", "darkroom.cina.eth", "rita.cina.eth", "fox.eth", "amaranth.cina.eth", "stillness.eth", "loop.eth", "agora.cina.eth"];
    return handles.map((h, i) => ({
      handle: h,
      address: "0x" + ((i + 7) * 40503 >>> 0).toString(16).slice(0, 4) + "…" + ((i + 3) * 2654435761 >>> 0).toString(16).slice(0, 4),
      portfolio: 240_000 / Math.pow(1.18, i),
      earned: 38_000 / Math.pow(1.22, i),
      films: 12 - i,
      change: (Math.sin(i * 1.7 + 1) * 17.5) + 12.5,
    }));
  }, []);

  return (
    <div style={{ background: "var(--c-bg)", minHeight: "100vh" }}>
      <div style={{ padding: "0 var(--gutter) 96px", maxWidth: "var(--w-page)", margin: "0 auto" }}>
        <PmMasthead bare index="Market" path="Leaderboard" count="This month" title="Leaderboard" lede="The films and collectors moving the most money on Cina this month."/>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--c-line)", marginBottom: 28 }}>
          {[
            { id: "films",   label: "Top earning films" },
            { id: "holders", label: "Top holders" },
            { id: "volume",  label: "Market activity" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="btn-ghost"
              style={{
                padding: "12px 0", marginRight: 32,
                borderRadius: 0,
                borderBottom: `2px solid ${tab === t.id ? "var(--c-amber)" : "transparent"}`,
                color: tab === t.id ? "var(--c-ink)" : "var(--c-ink-3)",
                fontSize: "var(--fs-body)", height: "auto", marginBottom: -1,
              }}
            >{t.label}</button>
          ))}
        </div>

        {tab === "films" && (
          <div className="m-scroll-x">
            {films.map((f, i) => (
              <button
                key={f.id}
                onClick={() => navigate(f.nft ? `/nft/${f.nft}` : `/film/${f.id}`)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 1.4fr 1fr 1fr 1fr",
                  alignItems: "center", gap: 18,
                  padding: "20px 0", borderBottom: "1px solid var(--c-line)",
                  border: "none", borderTop: i === 0 ? "1px solid var(--c-line)" : "none",
                  background: "transparent", cursor: "pointer",
                  textAlign: "left", width: "100%", color: "var(--c-ink)",
                }}
              >
                <div className="t-display" style={{
                  fontSize: "var(--fs-head)", fontStyle: "italic",
                  color: i < 3 ? "var(--c-amber)" : "var(--c-ink-4)",
                }}>{String(i + 1).padStart(2, "0")}</div>

                <div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", lineHeight: 1.05 }}>{f.title}</div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 4 }}>{f.creator?.toUpperCase()}</div>
                </div>

                <div>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.45 }}>
                    {f.genre[0]} · {f.runtime}
                  </div>
                  {f.project && (
                    <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 4 }}>
                      {f.project.backers || "—"} backers · floor {f.project.floorPrice}Ξ
                    </div>
                  )}
                </div>

                <div className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", textAlign: "right" }}>
                  {f.views ? `${f.views >= 1e6 ? (f.views/1e6).toFixed(1).replace(/\.0$/, "") + "M" : Math.round(f.views/1000) + "K"} views` : "—"}
                </div>

                <div className="t-mono" style={{ fontSize: "var(--fs-body)", color: f.change >= 0 ? "var(--c-good)" : "var(--c-warn)", textAlign: "right" }}>
                  {fmtMoneyPct(f.change, 1)}
                </div>

                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", textAlign: "right" }}>
                  {fmtCompact(f.earnings)}
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === "holders" && (
          <div>
            {holders.map((h, i) => (
              <div key={h.handle} style={{
                display: "grid",
                gridTemplateColumns: "60px 1.4fr 1fr 1fr 1fr 1fr",
                alignItems: "center", gap: 18,
                padding: "20px 0", borderBottom: "1px solid var(--c-line)",
                borderTop: i === 0 ? "1px solid var(--c-line)" : "none",
                color: "var(--c-ink)",
              }}>
                <div className="t-display" style={{
                  fontSize: "var(--fs-head)", fontStyle: "italic",
                  color: i < 3 ? "var(--c-amber)" : "var(--c-ink-4)",
                }}>{String(i + 1).padStart(2, "0")}</div>

                <div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{h.handle}</div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 4 }}>{h.address}</div>
                </div>
                <div className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", textAlign: "right" }}>{h.films} films</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-body)", color: h.change >= 0 ? "var(--c-good)" : "var(--c-warn)", textAlign: "right" }}>{fmtMoneyPct(h.change)}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", textAlign: "right" }}>{fmtCompact(h.earned)}</div>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", textAlign: "right" }}>{fmtCompact(h.portfolio)}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "volume" && (
          <div>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              borderTop: "1px solid var(--c-line-2)", borderBottom: "1px solid var(--c-line-2)",
              marginBottom: 28,
            }}>
              <StatCell label="24h volume"   value="$184K" sub={fmtMoneyPct(8.2)} positive/>
              <StatCell label="Active mints" value="6" sub="3 closing this week"/>
              <StatCell label="Floor avg"    value="0.062Ξ" sub={fmtMoneyPct(-2.1)}/>
              <StatCell label="Royalties"    value="$12.4K" sub="paid this month"/>
            </div>
            <Section label="Recent trades">
              <div style={{ borderTop: "1px solid var(--c-line)" }}>
                {[
                  { d: "2m",   action: "MINT",      film: "Verge",     who: "loop.eth",        amt: 0.075, usd: 204 },
                  { d: "8m",   action: "TRANSFER",  film: "Last Light", who: "0x9a1…ff2",       amt: 0.42,  usd: 1142 },
                  { d: "14m",  action: "MINT",      film: "Last Light", who: "noir.eth",        amt: 0.32,  usd: 870  },
                  { d: "31m",  action: "ROYALTY",   film: "Frequency 88.6", who: "→ 412 holders", amt: 0.85, usd: 2310 },
                  { d: "1h",   action: "MINT",      film: "The Fence", who: "agora.cina.eth",  amt: 0.06,  usd: 162 },
                  { d: "2h",   action: "TRANSFER",  film: "Last Light", who: "0x4f2…1ed",       amt: 0.082, usd: 223 },
                  { d: "3h",   action: "MINT",      film: "Verge",     who: "stillness.eth",   amt: 0.075, usd: 204 },
                ].map((t, i) => (
                  <div key={i} style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr 1.4fr 1fr 1fr",
                    alignItems: "center",
                    padding: "12px 0", borderBottom: "1px solid var(--c-line)",
                  }}>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{t.d}</span>
                    <span className="t-mono" style={{
                      fontSize: "var(--fs-label)", letterSpacing: ".16em",
                      color: t.action === "MINT" ? "var(--c-amber)" : t.action === "ROYALTY" ? "var(--c-good)" : "var(--c-ink-3)",
                    }}>{t.action}</span>
                    <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{t.film}</span>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{t.who}</span>
                    <span style={{ textAlign: "right" }}>
                      <span className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{t.amt}Ξ</span>
                      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginLeft: 8 }}>${t.usd}</span>
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Buy crypto / connect wallet flow ────────────────────────────────────

function BuyCryptoPage() {
  const [amount, setAmount] = usMx(500);
  const [asset, setAsset] = usMx("USDC");
  const [walletConnected, setWalletConnected] = usMx(false);
  const [connecting, setConnecting] = usMx(null); // null | "metamask" | "coinbase" | "wc"

  const rate = asset === "ETH" ? 2740 : asset === "BTC" ? 64200 : 1.0;
  const youGet = amount / rate;

  const openBuyDrawer = () => {
    if (!window.openPay) return;
    window.openPay({
      kind: "buy",
      title: "Buy " + asset,
      subtitle: "CINA WALLET · BASE",
      accent: tkc("amber"),
      priceUSD: amount,
      items: [
        { label: youGet.toFixed(4) + " " + asset, sub: "1 " + asset + " = " + fmtUSD(rate), price: amount },
      ],
      perks: [
        "Settled on Base L2",
        "Instant delivery to 0xA1c4…f3D2",
        "Use for mints, rentals, tips",
        "Powered by Stripe · KYC complete",
      ],
      image: { color: "var(--c-amber)" },
      onConfirm: () => {
        toast({ title: "PURCHASE CONFIRMED", text: youGet.toFixed(4) + " " + asset + " → wallet", kind: "good" });
      },
    });
  };

  // Connect wallet step is its own card BEFORE everything else
  if (!walletConnected) {
    return (
      <div style={{ background: "var(--c-bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 480, width: "100%" }}>
          <h1 className="t-display" style={{
            fontStyle: "italic", fontSize: "var(--fs-head)", margin: "0 0 8px",
            letterSpacing: "-0.02em", fontWeight: 400,
          }}>Connect a wallet</h1>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginBottom: 32 }}>
            Cina pays royalties to your wallet. We never custody your funds.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { id: "metamask", label: "MetaMask",        sub: "Browser extension", icon: "M" },
              { id: "coinbase", label: "Coinbase Wallet", sub: "Mobile or extension", icon: "C" },
              { id: "wc",       label: "WalletConnect",   sub: "Scan with any wallet", icon: "WC" },
            ].map(w => (
              <button
                key={w.id}
                onClick={() => {
                  setConnecting(w.id);
                  setTimeout(() => {
                    setWalletConnected(true);
                    setConnecting(null);
                    toast({ title: "WALLET CONNECTED", text: w.label + " · 0xA1c4…f3D2", kind: "good" });
                  }, 1100);
                }}
                disabled={connecting !== null}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "16px 18px", textAlign: "left",
                  border: "1px solid var(--c-line)", background: "transparent",
                  borderRadius: "var(--r-2)", cursor: connecting ? "wait" : "pointer",
                  color: "var(--c-ink)",
                  opacity: connecting && connecting !== w.id ? 0.4 : 1,
                  transition: "all .14s",
                }}
                onMouseEnter={e => !connecting && (e.currentTarget.style.borderColor = "var(--c-amber)")}
                onMouseLeave={e => !connecting && (e.currentTarget.style.borderColor = "var(--c-line)")}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "var(--r-2)",
                  background: "var(--c-panel)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color:  "var(--c-amber)",
                }}>{w.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{w.label}</div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 2 }}>{w.sub}</div>
                </div>
                {connecting === w.id ? (
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>CONNECTING…</div>
                ) : (
                  <span style={{ fontSize: "var(--fs-lead)", color: "var(--c-ink-4)" }}>→</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 24, padding: "14px 0", borderTop: "1px solid var(--c-line)", fontSize: "var(--fs-body)", color: "var(--c-ink-4)", lineHeight: 1.6 }}>
            New to crypto? You can also buy your first wallet credit with a card —
            <button onClick={() => { setWalletConnected(true); toast({ title: "CINA WALLET CREATED", text: "Custodial · upgrade anytime" }); }} style={{ background: "none", border: "none", color: "var(--c-amber)", padding: 0, cursor: "pointer", marginLeft: 4, fontSize: "var(--fs-body)" }}>create a Cina wallet</button>.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--c-bg)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "56px 24px 80px" }}>

        <h1 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", margin: "0 0 8px", fontWeight: 400 }}>Buy crypto</h1>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginBottom: 36 }}>
          Funds your Cina wallet, settled on Base. Used for mints, rentals, tips.
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
          <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-display)", color: "var(--c-ink)", fontWeight: 400 }}>$</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(Number(e.target.value) || 0)}
            style={{
              background: "transparent", border: "none", outline: "none",
              fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-display)",
              color: "var(--c-ink)", width: "100%", padding: 0, fontWeight: 400,
              letterSpacing: "-0.02em",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {[100, 250, 500, 1000].map(p => (
            <button key={p} onClick={() => setAmount(p)} className="btn-ghost"
              style={{ height: 30, padding: "0 14px", fontSize: "var(--fs-body)",
                border: "1px solid var(--c-line)", borderRadius: 999,
                color: amount === p ? "var(--c-amber)" : "var(--c-ink-2)",
                borderColor: amount === p ? "var(--c-amber)" : "var(--c-line)",
              }}
            >${p}</button>
          ))}
        </div>

        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 12 }}>RECEIVE AS</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
          {[
            { id: "USDC", label: "USDC", sub: "1:1 dollar" },
            { id: "ETH",  label: "ETH",  sub: "ether" },
            { id: "BTC",  label: "BTC",  sub: "bitcoin" },
          ].map(a => (
            <button key={a.id} onClick={() => setAsset(a.id)} style={{
              flex: 1, padding: "12px 14px",
              background: "transparent",
              border: "1px solid " + (asset === a.id ? "var(--c-amber)" : "var(--c-line)"),
              borderRadius: "var(--r-2)", color: "var(--c-ink)",
              cursor: "pointer", textAlign: "left",
            }}>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{a.label}</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 2 }}>{a.sub}</div>
            </button>
          ))}
        </div>

        <button className="btn btn-primary" style={{ width: "100%", height: 48, fontSize: "var(--fs-body)" }} onClick={openBuyDrawer}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Shared atoms ────────────────────────────────────────────────────────

function StatCell({ label, value, sub, accent, positive }) {
  return (
    <div style={{
      padding: "28px 24px",
      borderRight: "1px solid var(--c-line)",
    }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 8 }}>
        {label.toUpperCase()}
      </div>
      <div className="t-display" style={{
        fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400,
        color: accent ? "var(--c-amber)" : "var(--c-ink)",
        letterSpacing: "-0.02em", lineHeight: 1.05,
      }}>{value}</div>
      {sub && (
        <div className="t-mono" style={{
          fontSize: "var(--fs-label)", color: positive ? "var(--c-good)" : "var(--c-ink-4)",
          letterSpacing: ".08em", marginTop: 6,
        }}>{sub}</div>
      )}
    </div>
  );
}

function Section({ label, right, children }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{label.toUpperCase()}</div>
        {right}
      </div>
      {children}
    </section>
  );
}

function Sparkline({ points, height = 80 }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(1, max - min);
  const w = 100;
  const path = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = ((max - p) / range) * 80 + 10;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
  const fill = path + ` L 100 100 L 0 100 Z`;
  return (
    <div style={{ position: "relative", height, border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: 12 }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
        <defs>
          <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor= "var(--c-amber)" stopOpacity="0.18"/>
            <stop offset="100%" stopColor= "var(--c-amber)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={fill} fill="url(#sparkfill)" stroke="none"/>
        <path d={path} fill="none" stroke= "var(--c-amber)" strokeWidth="0.8" vectorEffect="non-scaling-stroke"/>
      </svg>
    </div>
  );
}

Object.assign(window, { PayoutsPage, LeaderboardPage, BuyCryptoPage, fmtUSD, computeCreatorPayouts, fakePayoutHistory, Sparkline });
