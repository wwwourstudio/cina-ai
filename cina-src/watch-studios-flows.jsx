// watch-studios-flows.jsx — Studio listing application + Studio token marketplace
// Two things the Watch app was previously alert()-stubbing. Now real.

const { useState: usSF, useMemo: umSF, useEffect: ueSF } = React;

// ─── List Your Studio · 5-step application modal ─────────────────────────
function ListYourStudioModal({ onClose }) {
  const [step, setStep] = usSF(0);
  const [data, setData] = usSF({
    legalName: "", display: "", domain: "", reps: "Hollow Pictures, LLC",
    catalogSize: 14, slate: ["Feature", "Series"],
    tokenName: "", supply: 100000, holderSplit: 25, vesting: "12mo cliff · 36mo linear",
    accept: false,
  });
  const update = (k, v) => setData(d => ({ ...d, [k]: v }));
  const steps = [
    { id: "co",     label: "Studio" },
    { id: "cat",    label: "Catalog" },
    { id: "token",  label: "Token" },
    { id: "kyc",    label: "KYC" },
    { id: "submit", label: "Submit" },
  ];

  const canNext = step === 0 ? data.legalName && data.display
                : step === 1 ? data.catalogSize > 0
                : step === 2 ? data.tokenName && data.supply > 0
                : step === 3 ? data.accept
                : true;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 8200,
      background: "rgba(0,0,0,.78)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(880px, 100%)", maxHeight: "100%",
        background: "var(--c-panel)", border: "1px solid var(--c-line-2)",
        borderRadius: "var(--r-2)", overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 28px",
          borderBottom: "1px solid var(--c-line)",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", textTransform: "uppercase", marginBottom: 3 }}>
              STUDIO APPLICATION · CONFIDENTIAL
            </div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, lineHeight: 1 }}>
              List your production company on Cina
            </div>
          </div>
          <div style={{ flex: 1 }}/>
          <button onClick={onClose} style={{
            padding: "4px 10px", background: "transparent", color: "var(--c-ink-3)",
            border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)", cursor: "pointer",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
          }} aria-label="Close" title="Close">ESC</button>
        </div>

        {/* Stepper */}
        <div style={{ padding: "14px 28px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 14 }}>
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: i < step ? "var(--c-good)" : i === step ? "var(--c-amber)" : "var(--c-panel-2)",
                  border: i === step ? "none" : "1px solid var(--c-line-2)",
                  color: i < step ? tkc("void") : i === step ? tkc("on-amber") : "var(--c-ink-3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700,
                }}>{i < step ? "✓" : i + 1}</span>
                <span style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                  letterSpacing: ".16em", textTransform: "uppercase",
                  color: i === step ? "var(--c-ink)" : "var(--c-ink-3)",
                  fontWeight: i === step ? 600 : 500,
                }}>{s.label}</span>
              </div>
              {i < steps.length - 1 && <div style={{ flex: 1, height: 1, background: "var(--c-line)" }}/>}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: "28px 36px", flex: 1, overflow: "auto", minHeight: 360 }}>
          {step === 0 && (
            <>
              <SfFieldLabel>STUDIO IDENTITY</SfFieldLabel>
              <SfField label="Legal entity">
                <SfInput value={data.legalName} onChange={v => update("legalName", v)} placeholder="e.g. Hollow Pictures, LLC"/>
              </SfField>
              <SfField label="Display name on Cina">
                <SfInput value={data.display} onChange={v => update("display", v)} placeholder="Hollow Pictures"/>
              </SfField>
              <SfField label="Primary domain">
                <SfInput value={data.domain} onChange={v => update("domain", v)} placeholder="hollowpictures.com"/>
              </SfField>
              <SfField label="Authorized representative(s)">
                <SfInput value={data.reps} onChange={v => update("reps", v)} placeholder="Name · Title"/>
              </SfField>
            </>
          )}
          {step === 1 && (
            <>
              <SfFieldLabel>CATALOG & SLATE</SfFieldLabel>
              <SfField label={`Releases ready to migrate: ${data.catalogSize}`}>
                <input type="range" min="1" max="80" value={data.catalogSize}
                  onChange={e => update("catalogSize", +e.target.value)}
                  style={{ width: "100%", accentColor: tkc("amber") }}/>
              </SfField>
              <SfField label="Slate composition">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["Feature", "Series", "Documentary", "Short", "Limited series"].map(t => {
                    const on = data.slate.includes(t);
                    return (
                      <button key={t} onClick={() => update("slate", on ? data.slate.filter(x => x !== t) : [...data.slate, t])}
                        style={{
                          padding: "6px 12px",
                          background: on ? "rgba(var(--accent-rgb),.12)" : "transparent",
                          color: on ? "var(--c-amber)" : "var(--c-ink-2)",
                          border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`,
                          borderRadius: "var(--r-1)", cursor: "pointer",
                          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                          letterSpacing: ".16em", fontWeight: 600,
                          textTransform: "uppercase",
                        }}>{t}</button>
                    );
                  })}
                </div>
              </SfField>
              <div style={{
                padding: 14, background: "var(--c-panel-2)",
                border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
                marginTop: 14, fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55,
              }}>
                Estimated <strong style={{ color: "var(--c-amber)" }}>$143k/mo MRR</strong> at current Watch CPMs for a {data.catalogSize}-title catalog. Royalty splits on every minute streamed.
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <SfFieldLabel>EQUITY TOKEN · OPTIONAL</SfFieldLabel>
              <SfField label="Token ticker">
                <SfInput value={data.tokenName} onChange={v => update("tokenName", v.toUpperCase().slice(0, 6))} placeholder="$HOLLOW"/>
              </SfField>
              <SfField label={`Initial supply: ${data.supply.toLocaleString()}`}>
                <input type="range" min="10000" max="1000000" step="10000" value={data.supply}
                  onChange={e => update("supply", +e.target.value)}
                  style={{ width: "100%", accentColor: tkc("amber") }}/>
              </SfField>
              <SfField label={`Holder revenue share: ${data.holderSplit}%`}>
                <input type="range" min="5" max="40" value={data.holderSplit}
                  onChange={e => update("holderSplit", +e.target.value)}
                  style={{ width: "100%", accentColor: tkc("amber") }}/>
              </SfField>
              <SfField label="Vesting">
                <SfInput value={data.vesting} onChange={v => update("vesting", v)}/>
              </SfField>
              <div style={{
                padding: 14, background: "var(--c-panel-2)",
                border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
                marginTop: 6, fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55,
              }}>
                Token deploys to Base on approval. {data.holderSplit}% of subscription + ad revenue auto-routes to holders quarterly. Cina takes 6% of token primary, 1% of secondary.
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <SfFieldLabel>KYC & RIGHTS ATTESTATION</SfFieldLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                {[
                  "I attest that all titles in our catalog are owned outright or fully licensed.",
                  "I confirm KYC documents for the representative will be provided within 7 days.",
                  "I acknowledge Cina's brand-safety + content standards.",
                  "I understand smart contracts are immutable post-deploy.",
                ].map((line, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: 12, background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
                    <span style={{ color: "var(--c-amber)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5 }}>{line}</span>
                  </div>
                ))}
              </div>
              <label style={{
                display: "flex", gap: 12, alignItems: "center", padding: 14,
                background: data.accept ? "rgba(var(--accent-rgb),.08)" : "var(--c-panel-2)",
                border: `1px solid ${data.accept ? "var(--c-amber)" : "var(--c-line)"}`,
                borderRadius: "var(--r-2)", cursor: "pointer",
              }}>
                <input type="checkbox" checked={data.accept} onChange={e => update("accept", e.target.checked)} style={{ accentColor: tkc("amber"), width: 18, height: 18 }}/>
                <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>
                  I accept on behalf of {data.legalName || "my company"}.
                </span>
              </label>
            </>
          )}
          {step === 4 && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              minHeight: 320, textAlign: "center", padding: 30,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "var(--c-good)", color: "var(--c-void)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "var(--fs-title)", marginBottom: 22,
              }}>✓</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 12 }}>APPLICATION RECEIVED</div>
              <h3 style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-head)", letterSpacing: "-0.02em" }}>
                <em style={{ color: "var(--c-amber)" }}>{data.display || data.legalName}</em> is on the list.
              </h3>
              <p style={{ margin: "12px 0 24px", maxWidth: 480, fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55 }}>
                Partnerships will reach out within 48h to schedule KYC and contract deployment. Average studio is live on Cina within 21 days. Reference <span style={{ fontFamily: "var(--f-mono)", color: "var(--c-amber)" }}>CINA-S-{Math.floor(Math.random() * 9000) + 1000}</span>.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 4 && (
          <div style={{
            padding: "14px 28px", borderTop: "1px solid var(--c-line)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <button onClick={() => step === 0 ? onClose() : setStep(step - 1)} style={{
              padding: "10px 16px", background: "transparent", color: "var(--c-ink-3)",
              border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)", cursor: "pointer",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              fontWeight: 600, textTransform: "uppercase",
            }}>{step === 0 ? "Cancel" : "← Back"}</button>
            <button disabled={!canNext} onClick={() => setStep(step + 1)} style={{
              padding: "10px 22px",
              background: canNext ? "var(--c-amber)" : "var(--c-line)",
              color: canNext ? tkc("on-amber") : "var(--c-ink-4)",
              border: "none", borderRadius: "var(--r-1)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              fontWeight: 700, textTransform: "uppercase",
              cursor: canNext ? "pointer" : "not-allowed",
            }}>{step === 3 ? "Submit application →" : "Next →"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

function SfFieldLabel({ children }) {
  return (
    <div style={{
      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
      letterSpacing: ".16em", color:  "var(--c-amber)",
      textTransform: "uppercase", marginBottom: 18,
    }}>{children}</div>
  );
}
function SfField({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
        letterSpacing: ".16em", color: "var(--c-ink-3)",
        textTransform: "uppercase", marginBottom: 6,
      }}>{label}</div>
      {children}
    </div>
  );
}
function SfInput({ value, onChange, placeholder }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: "100%", padding: "11px 14px",
        background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)",
        borderRadius: "var(--r-1)", color: "var(--c-ink)",
        fontSize: "var(--fs-body)", fontFamily: "var(--f-display)", fontStyle: "italic",
      }}/>
  );
}

// ─── Studio Token Marketplace ────────────────────────────────────────────
const ST_TOKENS = [
  { ticker: "$DARK",   studio: "Darkroom",       color: tkc("cat-3"), price: 64.20, change30d:  24.7, yieldApy: 8.4,  holders: 1820,  supply: 100000, available: 18400, raised: 5.2,  goal: 7.5,  mrr: 32000,  growth: 18.4 },
  { ticker: "$VRBM",   studio: "Verbatim",       color: tkc("cat-6"), price: 41.80, change30d:   8.2, yieldApy: 6.1,  holders:  988,  supply: 200000, available: 42100, raised: 4.1,  goal: 6.0,  mrr: 22400,  growth:  9.7 },
  { ticker: "$LOOM",   studio: "Loom Studios",   color: tkc("line-3"), price: 92.40, change30d:  -3.4, yieldApy: 5.2,  holders: 2104,  supply:  60000, available:  4200, raised: 5.5,  goal: 6.5,  mrr: 41800,  growth: 12.1 },
  { ticker: "$BRUSH",  studio: "Brushfire",      color: tkc("cat-6"), price: 28.10, change30d:  44.2, yieldApy: 9.8,  holders:  712,  supply: 250000, available: 80400, raised: 7.0,  goal: 9.0,  mrr: 18200,  growth: 24.0 },
  { ticker: "$LONG",   studio: "Long Take Co.",  color: tkc("cat-6"), price: 56.70, change30d:  11.8, yieldApy: 6.9,  holders: 1244,  supply: 120000, available: 12800, raised: 6.8,  goal: 8.0,  mrr: 28600,  growth: 14.4 },
  { ticker: "$HOLW",   studio: "Hollow Pictures",color: tkc("blood"), price: 112.50, change30d:  62.1, yieldApy: 11.2, holders:  610,  supply:  40000, available:   800, raised: 4.5,  goal: 5.0,  mrr: 52400,  growth: 38.2 },
];

const ST_TRADES = [
  { ticker: "$HOLW",  side: "BUY",  qty: 124, price: 112.5, who: "0xA1c4..f3D2", ago: "11s" },
  { ticker: "$BRUSH", side: "BUY",  qty: 880, price:  28.0, who: "0x9b48..ce71", ago: "28s" },
  { ticker: "$DARK",  side: "SELL", qty: 244, price:  64.3, who: "0x4f02..b8c1", ago: "44s" },
  { ticker: "$LONG",  side: "BUY",  qty: 320, price:  56.6, who: "0x77a2..00ee", ago: "1m" },
  { ticker: "$VRBM",  side: "BUY",  qty: 110, price:  41.7, who: "0x2210..3def", ago: "1m" },
  { ticker: "$LOOM",  side: "SELL", qty:  88, price:  92.4, who: "0xff10..2ab4", ago: "2m" },
  { ticker: "$HOLW",  side: "BUY",  qty:  64, price: 112.7, who: "0x80c1..1e22", ago: "2m" },
  { ticker: "$DARK",  side: "BUY",  qty: 420, price:  64.0, who: "0x5566..aabb", ago: "3m" },
];

function StudioTokenMarketplace() {
  const [sort, setSort] = usSF("hot");
  const [opened, setOpened] = usSF(null);

  const sorted = umSF(() => {
    let r = ST_TOKENS;
    if (sort === "growth") r = [...r].sort((a, b) => b.change30d - a.change30d);
    if (sort === "yield")  r = [...r].sort((a, b) => b.yieldApy - a.yieldApy);
    if (sort === "raise")  r = [...r].sort((a, b) => (b.raised / b.goal) - (a.raised / a.goal));
    if (sort === "hot")    r = [...r].sort((a, b) => b.holders - a.holders);
    return r;
  }, [sort]);

  const marketCap = ST_TOKENS.reduce((s, t) => s + t.price * t.supply, 0);
  const dailyVolume = ST_TRADES.reduce((s, t) => s + t.qty * t.price, 0) * 12;

  return (
    <div style={{ padding: "0 var(--gutter) 96px", maxWidth: "var(--w-page)", margin: "0 auto" }}>
      <PmMasthead bare index="Studios" path="Token market" count={`${ST_TOKENS.length} tokens`} title="Hold a piece of the studio." lede="Every verified studio mints an equity token on Base. Subscription and ad revenue routes to holders quarterly. Trade peer-to-peer on the order book; Cina takes 1%.">
        <button className="pm-chip" onClick={() => navigate("/studios")}>← Studios</button>
      </PmMasthead>

      {/* Stats */}
      <div className="m-2col" style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        marginTop: 36, marginBottom: 36,
        border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden",
      }}>
        {[
          { l: "MARKET CAP",     v: "$" + (marketCap / 1e6).toFixed(1) + "M",   s: `across ${ST_TOKENS.length} studios`, amber: true },
          { l: "24H VOLUME",     v: "$" + (dailyVolume / 1e6).toFixed(2) + "M",  s: "across all pairs" },
          { l: "TOTAL HOLDERS",  v: ST_TOKENS.reduce((s, t) => s + t.holders, 0).toLocaleString(), s: "unique wallets" },
          { l: "AVG 30D",        v: "+" + (ST_TOKENS.reduce((s, t) => s + t.change30d, 0) / ST_TOKENS.length).toFixed(1) + "%", s: "studio token index" },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "22px 24px", background: "var(--c-panel)",
            borderRight: i < 3 ? "1px solid var(--c-line)" : "none",
          }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textTransform: "uppercase", marginBottom: 8 }}>{s.l}</div>
            <div style={{
              fontFamily: "var(--f-display)", fontStyle: "italic",
              fontSize: "var(--fs-head)", color: s.amber ? "var(--c-amber)" : "var(--c-ink)",
              lineHeight: 1, fontWeight: 500, letterSpacing: "-0.02em",
            }}>{s.v}</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 6 }}>{s.s}</div>
          </div>
        ))}
      </div>

      {/* Sort + table + trade feed */}
      <div className="m-stack" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 24, alignItems: "flex-start" }}>
        <div>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 12, flexWrap: "wrap", gap: 10,
          }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textTransform: "uppercase" }}>
              ALL TOKENS · LIVE
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {[
                { id: "hot", l: "Most held" },
                { id: "growth", l: "Top 30d" },
                { id: "yield", l: "Yield" },
                { id: "raise", l: "Most raised" },
              ].map(s => (
                <button key={s.id} onClick={() => setSort(s.id)} style={{
                  padding: "5px 12px",
                  background: sort === s.id ? "var(--c-amber)" : "transparent",
                  color: sort === s.id ? tkc("on-amber") : "var(--c-ink-2)",
                  border: `1px solid ${sort === s.id ? "var(--c-amber)" : "var(--c-line)"}`,
                  borderRadius: "var(--r-1)", cursor: "pointer",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                  letterSpacing: ".16em", fontWeight: 600,
                  textTransform: "uppercase",
                }}>{s.l}</button>
              ))}
            </div>
          </div>

          {/* Token table */}
          <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1.4fr 90px 90px 90px 100px 110px 90px",
              padding: "12px 18px", background: "var(--c-panel-2)",
              borderBottom: "1px solid var(--c-line)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
              letterSpacing: ".16em", color: "var(--c-ink-3)",
              textTransform: "uppercase",
            }}>
              <div>TOKEN</div><div>PRICE</div><div>30D</div><div>YIELD</div><div>HOLDERS</div><div>RAISED</div><div style={{ textAlign: "right" }}>ACTION</div>
            </div>
            {sorted.map((t, i) => (
              <div key={t.ticker} style={{
                display: "grid", gridTemplateColumns: "1.4fr 90px 90px 90px 100px 110px 90px",
                padding: "14px 18px", alignItems: "center", gap: 4,
                borderBottom: i < sorted.length - 1 ? "1px solid var(--c-line)" : "none",
                cursor: "pointer",
              }}
              onClick={() => {
                // Open the full token page when the studio has one; else trade inline.
                const s = (window.STUDIOS || []).find(x => window.stMatch && window.stMatch(t.studio, x.name));
                if (s && window.StudioTokenPage) navigate("/studios/" + s.id + "/token");
                else setOpened(t);
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--c-panel-2)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "var(--r-2)",
                    background: `linear-gradient(135deg, ${t.color}60 0%, ${t.color}20 100%)`,
                    border: `1px solid ${t.color}80`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700, color: tkc("white"),
                    flexShrink: 0,
                  }}>{t.ticker.slice(1, 3)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-amber)", fontWeight: 600 }}>{t.ticker}</div>
                    <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.1, marginTop: 1 }}>{t.studio}</div>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500 }}>${t.price.toFixed(2)}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", fontWeight: 600, color: t.change30d >= 0 ? "var(--c-good)" : "var(--c-blood-l)" }}>
                  {t.change30d >= 0 ? "▲" : "▼"} {Math.abs(t.change30d).toFixed(1)}%
                </div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-amber)" }}>{t.yieldApy.toFixed(1)}%</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{t.holders.toLocaleString()}</div>
                <div>
                  <div style={{ height: 4, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                    <div style={{ width: `${(t.raised / t.goal) * 100}%`, height: "100%", background: t.color }}/>
                  </div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 3, letterSpacing: ".08em" }}>${t.raised.toFixed(1)}M / ${t.goal.toFixed(1)}M</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{
                    padding: "5px 10px",
                    background: "transparent", color: "var(--c-ink)",
                    border: "1px solid var(--c-line-3)", borderRadius: "var(--r-1)",
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                    letterSpacing: ".16em", fontWeight: 600,
                    textTransform: "uppercase",
                  }}>Trade →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live trade feed */}
        <aside style={{ position: "sticky", top: 84 }}>
          <div style={{
            background: "var(--c-panel)", border: "1px solid var(--c-line)",
            borderRadius: "var(--r-2)", overflow: "hidden",
          }}>
            <div style={{
              padding: "12px 16px", background: "var(--c-panel-2)",
              borderBottom: "1px solid var(--c-line)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
              letterSpacing: ".16em", color: "var(--c-ink-3)",
              display: "flex", alignItems: "center", gap: 10,
              textTransform: "uppercase",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 6px var(--c-good)" }}/>
              <span>ORDER BOOK · LIVE</span>
            </div>
            {ST_TRADES.map((tr, i) => (
              <div key={i} style={{
                padding: "10px 16px", display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center",
                borderBottom: i < ST_TRADES.length - 1 ? "1px solid var(--c-line)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--fs-body)" }}>
                  <span style={{
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                    letterSpacing: ".16em", fontWeight: 700,
                    color: tr.side === "BUY" ? "var(--c-good)" : "var(--c-blood-l)",
                  }}>{tr.side}</span>
                  <span style={{ fontFamily: "var(--f-mono)", color: "var(--c-amber)", fontWeight: 600 }}>{tr.ticker}</span>
                  <span style={{ color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)" }}>×{tr.qty}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-2)", fontWeight: 600 }}>${tr.price.toFixed(2)}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" }}>{tr.ago}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {opened && <TradeModal token={opened} onClose={() => setOpened(null)}/>}
    </div>
  );
}

// ─── Trade modal ─────────────────────────────────────────────────────────
function TradeModal({ token, onClose }) {
  const [side, setSide] = usSF("BUY");
  const [qty, setQty] = usSF(10);
  const total = qty * token.price;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 8200,
      background: "rgba(0,0,0,.78)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(520px, 100%)",
        background: "var(--c-panel)", border: `1px solid ${token.color}`,
        borderRadius: "var(--r-2)", overflow: "hidden",
        boxShadow: `0 24px 60px ${token.color}30`,
      }}>
        {/* Header */}
        <div style={{
          padding: 24, background: `linear-gradient(135deg, ${token.color}25 0%, var(--c-panel) 100%)`,
          borderBottom: `1px solid ${token.color}50`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: "var(--r-2)",
              background: `linear-gradient(135deg, ${token.color} 0%, ${token.color}40 100%)`,
              border: `1px solid ${token.color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-lead)", fontWeight: 700, color: tkc("white"),
            }}>{token.ticker.slice(1, 3)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: token.color, letterSpacing: ".16em", fontWeight: 700 }}>{token.ticker}</div>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", lineHeight: 1 }}>{token.studio}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", lineHeight: 1, fontWeight: 500 }}>${token.price.toFixed(2)}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 600, marginTop: 4, color: token.change30d >= 0 ? "var(--c-good)" : "var(--c-blood-l)" }}>
                {token.change30d >= 0 ? "▲" : "▼"} {Math.abs(token.change30d).toFixed(1)}% 30d
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {/* Buy/Sell toggle */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 16, background: "var(--c-panel-2)", padding: 4, borderRadius: "var(--r-2)" }}>
            {["BUY", "SELL"].map(s => (
              <button key={s} onClick={() => setSide(s)} style={{
                padding: "10px 0",
                background: side === s ? (s === "BUY" ? "var(--c-good)" : "var(--c-blood-l)") : "transparent",
                color: side === s ? tkc("void") : "var(--c-ink-2)",
                border: "none", borderRadius: "var(--r-1)", cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)",
                letterSpacing: ".16em", fontWeight: 700,
              }}>{s}</button>
            ))}
          </div>

          {/* Qty */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 6, textTransform: "uppercase" }}>QUANTITY</div>
            <input type="number" value={qty} min="1" max={token.available}
              onChange={e => setQty(Math.max(1, +e.target.value || 1))}
              style={{
                width: "100%", padding: "12px 14px",
                background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)",
                borderRadius: "var(--r-1)", color: "var(--c-ink)",
                fontSize: "var(--fs-lead)", fontFamily: "var(--f-display)", fontStyle: "italic",
              }}/>
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              {[10, 50, 100, 500].map(n => (
                <button key={n} onClick={() => setQty(n)} style={{
                  padding: "4px 10px", background: "transparent", color: "var(--c-ink-3)",
                  border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)", cursor: "pointer",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                }}>{n}</button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div style={{
            padding: 14, background: "var(--c-panel-2)",
            border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", marginBottom: 14,
          }}>
            {[
              { l: "Subtotal", v: `$${total.toLocaleString(undefined, {minimumFractionDigits: 2})}` },
              { l: "Cina fee · 1%", v: `$${(total * 0.01).toFixed(2)}` },
              { l: "Network gas", v: "$0.04" },
              { l: "Total", v: `$${(total * 1.01 + 0.04).toFixed(2)}`, accent: true },
            ].map((r, i, a) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "baseline",
                padding: "6px 0",
                borderBottom: i < a.length - 1 ? "1px solid var(--c-line)" : "none",
              }}>
                <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>{r.l}</span>
                <span style={{
                  fontFamily: r.accent ? "var(--f-display)" : "var(--f-mono)",
                  fontStyle: r.accent ? "italic" : "normal",
                  fontSize: r.accent ? 18 : 12,
                  color: r.accent ? "var(--c-amber)" : "var(--c-ink)",
                  fontWeight: r.accent ? 500 : 600,
                }}>{r.v}</span>
              </div>
            ))}
          </div>

          {/* Yield projection */}
          <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginBottom: 14, lineHeight: 1.5 }}>
            At <span style={{ color: "var(--c-amber)" }}>{token.yieldApy}% APY</span> projected yield, your {qty}× position earns ~<span style={{ color: "var(--c-amber)" }}>${(total * token.yieldApy / 100).toFixed(2)}</span>/year in {token.studio} revenue share.
          </div>

          {/* CTA */}
          <button onClick={() => {
            if (typeof window?.toast === "function") {
              window.toast({ title: `${side} CONFIRMED`, text: `${qty}× ${token.ticker} · $${(total * 1.01 + 0.04).toFixed(2)}`, kind: "good" });
            }
            onClose();
          }} style={{
            width: "100%", padding: "14px 0",
            background: side === "BUY" ? "var(--c-amber)" : "var(--c-blood-l)",
            color: side === "BUY" ? tkc("on-amber") : tkc("white"),
            border: "none", borderRadius: "var(--r-2)",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)",
            letterSpacing: ".16em", fontWeight: 700,
            textTransform: "uppercase", cursor: "pointer",
          }}>{side} {qty} {token.ticker} →</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ListYourStudioModal, StudioTokenMarketplace, ST_TOKENS });
