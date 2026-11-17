// pay-drawer.jsx — Unified Smart-Contract Chained Payment Drawer + CinaSplitRouter Engine.
//
// Every rental, purchase, studio subscription, ticket, or producer pass mint
// routes through CinaSplitRouter.sol (Base L2 · 0x71C9…8A4F), executing an
// atomic chained revenue split so directors, co-finance investors, AI cast
// likeness vaults, and canonical branch writers are paid out automatically!

const { useState: usPD, useEffect: uePD } = React;

const PD_GAS_USD = 0.04; // Base L2 sub-cent gas
const CHAIN_SETTLEMENTS_KEY = "cina:chain:settlements";
const CHAIN_USER_KEY = "cina:chain:user-ledger";

function pdFmtUSD(n) {
  if (n == null || isNaN(n)) return "$0.00";
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function pdFmtETH(usd) { return (Number(usd || 0) / 2700).toFixed(4); }
function pdShortHash() {
  const hex = "0123456789abcdef";
  let h = "0x";
  for (let i = 0; i < 6; i++) h += hex[Math.floor(Math.random() * 16)];
  return h + "…" + Array.from({ length: 4 }, () => hex[Math.floor(Math.random() * 16)]).join("");
}

// ─── CinaChain: Atomic Smart-Contract Chained Split Engine ──────────────
function _resolveProjectId(ticker) {
  if (!ticker) return "voss-ll";
  const P = window.NFT_PROJECTS || {};
  if (P[ticker]) return ticker;
  const C = window.CATALOG || [];
  const film = C.find(f => f.id === ticker || f.nft === ticker);
  if (film && film.nft) return film.nft;
  return "voss-ll";
}

function _computeSplits(grossUSD, kind, ticker) {
  const projId = _resolveProjectId(ticker);
  const P = window.NFT_PROJECTS || {};
  const proj = P[projId];
  const C = window.CATALOG || [];
  const film = C.find(f => f.nft === projId || f.id === ticker) || proj?.film;
  const directorName = film ? ((film.creator || "").split("·")[0].trim() || "Director") : (proj?.creator || "Studio Treasury");

  // Chained Smart-Contract Waterfall (totals 100%)
  // Primary NFT mints route 62% to Production Escrow + 20% Early Investor Pool + 10% Cast + 5% Writers + 3% Protocol
  // Rentals / Purchases / Subscriptions / Tickets route 52% Director/Studio + 30% Investor Pool + 10% Cast Vault + 5% Heritage/Branch + 3% Protocol
  const weights = kind === "nft"
    ? [
        { id: "director",  pct: 62, role: "Production Escrow",     recipient: `${directorName} · Multi-Sig`, addr: "0x4E8a…91B0" },
        { id: "investors", pct: 20, role: "Investor Pool (Auto)",  recipient: `${proj?.backers || 412} Pass Holders · Pro-Rata`, addr: "0x9C2d…44E1" },
        { id: "cast",      pct: 10, role: "Cast Likeness Vault",   recipient: "Performer LoRA & Voice Pool", addr: "0x3F1b…77A8" },
        { id: "writers",   pct: 5,  role: "Heritage & Canon",      recipient: "Screenplay & Branch Tree",    addr: "0x8B0e…12C9" },
        { id: "protocol",  pct: 3,  role: "SplitRouter Protocol",  recipient: "CinaSplitRouter.sol · Base",  addr: "0x71C9…8A4F" },
      ]
    : [
        { id: "director",  pct: 52, role: "Director & Studio",     recipient: `${directorName} Treasury`,    addr: "0x4E8a…91B0" },
        { id: "investors", pct: 30, role: "Investor Pool (Auto)",  recipient: `${proj?.backers || 412} Pass Holders · Pro-Rata`, addr: "0x9C2d…44E1" },
        { id: "cast",      pct: 10, role: "Cast Likeness Vault",   recipient: "Performer LoRA & Voice Pool", addr: "0x3F1b…77A8" },
        { id: "writers",   pct: 5,  role: "Heritage & Canon",      recipient: "Screenplay & Branch Tree",    addr: "0x8B0e…12C9" },
        { id: "protocol",  pct: 3,  role: "SplitRouter Protocol",  recipient: "CinaSplitRouter.sol · Base",  addr: "0x71C9…8A4F" },
      ];

  // Calculate exact investor rebate if current user holds passes in this project
  const U = window.USER || { holdings: [] };
  const userProjectHoldings = (U.holdings || []).filter(h => h.projectId === projId && (h.qty || 0) > 0);
  const userWeight = userProjectHoldings.reduce((acc, h) => acc + (h.tier === "producer" ? 0.14 : h.tier === "patron" ? 0.045 : 0.012) * h.qty, 0);
  const clampedShare = Math.min(0.45, userWeight); // pro-rata share of the Investor Pool

  const rows = weights.map(w => {
    const usd = +(grossUSD * (w.pct / 100)).toFixed(2);
    const yourCut = w.id === "investors" && clampedShare > 0 ? +(usd * clampedShare).toFixed(2) : 0;
    return { ...w, usd, yourCut };
  });

  const userRebateUSD = rows.reduce((s, r) => s + (r.yourCut || 0), 0);
  return { projId, filmId: film?.id || ticker || "ll", title: film?.title || proj?.title || "Cina Release", rows, userRebateUSD, clampedShare };
}

function _readSettlements() {
  try {
    const raw = JSON.parse(localStorage.getItem(CHAIN_SETTLEMENTS_KEY) || "null");
    if (Array.isArray(raw) && raw.length) return raw;
  } catch (_) {}
  return [
    {
      id: "tx-seed-1",
      at: Date.now() - 1000 * 60 * 14,
      txHash: "0x8f3a…92c1",
      chain: "base",
      kind: "buy",
      title: "Buy Last Light · 4K Master",
      projId: "voss-ll",
      grossUSD: 24.99,
      investorPoolUSD: 7.50,
      yourAutoPayoutUSD: 0.61,
      directorUSD: 12.99,
      castUSD: 2.50,
    },
    {
      id: "tx-seed-2",
      at: Date.now() - 1000 * 60 * 52,
      txHash: "0x4c1d…e07b",
      chain: "base",
      kind: "nft",
      title: "Patron Pass · Frequency 88.6",
      projId: "reng-fr",
      grossUSD: 380.00,
      investorPoolUSD: 76.00,
      yourAutoPayoutUSD: 3.42,
      directorUSD: 235.60,
      castUSD: 38.00,
    },
  ];
}

function _persistUserLedger() {
  const U = window.USER;
  if (!U) return;
  try {
    localStorage.setItem(CHAIN_USER_KEY, JSON.stringify({
      walletUSD: U.walletUSD,
      walletETH: U.walletETH,
      totalEarned: U.totalEarned,
      pendingClaim: U.pendingClaim,
      holdings: U.holdings,
      txHistory: U.txHistory,
    }));
  } catch (_) {}
  if (window.CINA) window.CINA.walletUSD = U.walletUSD;
}

function _recordChainedSettlement({ kind, title, grossUSD, ticker, chain = "base", payMethod = "usdc", txHash, isExternalBuyer = false }) {
  const split = _computeSplits(grossUSD, kind, ticker);
  const U = window.USER;
  const hash = txHash || pdShortHash();
  const today = new Date().toISOString().slice(0, 10);

  if (U) {
    // 1. If current user initiated purchase with crypto wallet, debit grossUSD
    if (!isExternalBuyer && (payMethod === "usdc" || payMethod === "eth")) {
      U.walletUSD = Math.max(0, +(Number(U.walletUSD || 0) - grossUSD).toFixed(2));
      U.walletETH = +(U.walletUSD / 2700).toFixed(4);
      U.txHistory = [
        { d: today, kind: kind === "nft" ? "buy" : kind, project: split.projId, desc: `${title} · Chained Split`, amount: -Number(grossUSD.toFixed(2)), asset: payMethod.toUpperCase(), txHash: hash },
        ...(U.txHistory || []),
      ];
    }

    // 2. If user minted an NFT pass, add/increment their stake so future chained payments pay them even more!
    if (!isExternalBuyer && kind === "nft") {
      const tierGuess = /producer/i.test(title) ? "producer" : /patron/i.test(title) ? "patron" : "collector";
      const existing = (U.holdings || []).find(h => h.projectId === split.projId && h.tier === tierGuess);
      const ethPrice = +(grossUSD / 2700).toFixed(4);
      if (existing) {
        existing.qty = (existing.qty || 0) + 1;
        existing.onWatchlist = false;
      } else {
        U.holdings = [
          { projectId: split.projId, tier: tierGuess, qty: 1, costBasis: ethPrice, currentPrice: +(ethPrice * 1.06).toFixed(4), earned: 0 },
          ...(U.holdings || []),
        ];
      }
      // Also mirror into Producer session if mounted
      if (window.__pSession && typeof window.__pSession.set === "function") {
        window.__pSession.set(st => ({ ...st, holdings: (U.holdings || []).filter(h => (h.qty || 0) > 0) }));
      }
    }

    // 3. Recompute split after any newly minted pass and credit automatic chained investor payout!
    const updatedSplit = _computeSplits(grossUSD, kind, ticker);
    const autoPayout = updatedSplit.userRebateUSD;
    if (autoPayout > 0) {
      U.walletUSD = +(Number(U.walletUSD || 0) + autoPayout).toFixed(2);
      U.totalEarned = +(Number(U.totalEarned || 0) + autoPayout).toFixed(2);
      const matchHoldings = (U.holdings || []).filter(h => h.projectId === updatedSplit.projId && (h.qty || 0) > 0);
      if (matchHoldings.length > 0) {
        const each = +(autoPayout / matchHoldings.length).toFixed(2);
        matchHoldings.forEach(h => { h.earned = +(Number(h.earned || 0) + each).toFixed(2); });
      }
      U.txHistory = [
        { d: today, kind: "royalty", project: updatedSplit.projId, desc: `Auto-split payout · ${updatedSplit.title} (${hash})`, amount: +autoPayout, asset: "USDC", txHash: hash },
        ...(U.txHistory || []),
      ];
    }

    _persistUserLedger();
  }

  const investorRow = split.rows.find(r => r.id === "investors");
  const directorRow = split.rows.find(r => r.id === "director");
  const castRow = split.rows.find(r => r.id === "cast");

  const entry = {
    id: "tx-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    at: Date.now(),
    txHash: hash,
    chain,
    kind,
    title,
    projId: split.projId,
    grossUSD: +grossUSD.toFixed(2),
    investorPoolUSD: investorRow ? investorRow.usd : 0,
    yourAutoPayoutUSD: split.userRebateUSD,
    directorUSD: directorRow ? directorRow.usd : 0,
    castUSD: castRow ? castRow.usd : 0,
    rows: split.rows,
  };

  const nextList = [entry, ..._readSettlements()].slice(0, 40);
  try { localStorage.setItem(CHAIN_SETTLEMENTS_KEY, JSON.stringify(nextList)); } catch (_) {}

  if (window.bumpSession) window.bumpSession();
  window.dispatchEvent(new CustomEvent("cina:chain-tx", { detail: entry }));
  return entry;
}

const CinaChain = {
  contract: "0x71C9…8A4F",
  network: "Base L2",
  computeSplits: _computeSplits,
  getSettlements: _readSettlements,
  executeChainedPayment: _recordChainedSettlement,
  simulateBoxOfficeEvent(projectId = "voss-ll", grossUSD = 120) {
    const P = window.NFT_PROJECTS || {};
    const proj = P[projectId];
    const label = grossUSD >= 500
      ? `Global Screening Batch · ${proj?.title || "Last Light"}`
      : `Viewer Collector Bundle · ${proj?.title || "Last Light"}`;
    const entry = _recordChainedSettlement({
      kind: "buy",
      title: label,
      grossUSD,
      ticker: projectId,
      chain: "base",
      payMethod: "usdc",
      isExternalBuyer: true,
    });
    if (window.toast) {
      window.toast({
        title: "CHAINED SMART-CONTRACT SPLIT",
        text: `${pdFmtUSD(grossUSD)} routed → ${pdFmtUSD(entry.investorPoolUSD)} to Investors${entry.yourAutoPayoutUSD > 0 ? ` (+${pdFmtUSD(entry.yourAutoPayoutUSD)} auto-paid to your wallet)` : ""}`,
        kind: "good",
      });
    }
    return entry;
  },
};
window.CinaChain = CinaChain;

function useChainLedger() {
  const [list, setList] = usPD(() => _readSettlements());
  uePD(() => {
    const sync = () => setList(_readSettlements());
    window.addEventListener("cina:chain-tx", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cina:chain-tx", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return list;
}
window.useChainLedger = useChainLedger;

// ─── Reusable Smart-Contract Chained Split Panel (for Wallet, Payouts, NFT) ──
function ChainedSplitRouterPanel({ defaultProject = "voss-ll" }) {
  const settlements = useChainLedger();
  const [projId, setProjId] = usPD(defaultProject);
  const splitPreview = _computeSplits(100, "buy", projId);
  const projects = [
    { id: "voss-ll", label: "Last Light (Elias Voss)" },
    { id: "reng-fr", label: "Frequency 88.6 (Tao Reng)" },
    { id: "ykim-tf", label: "The Fence (Yara Kim)" },
  ];

  return (
    <div className="pm-panel" style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <span className="pm-k"><b>CinaSplitRouter.sol</b> · Base L2 ({CinaChain.contract}) · Atomic Chained Payouts</span>
          <h3 className="pm-h2">Instant Smart-Contract Revenue Waterfall</h3>
          <p className="pm-lede" style={{ fontSize: "var(--fs-body)" }}>
            Every rental, purchase, subscription, and pass mint splits USDC in the same block — paying the director, every co-finance pass holder pro-rata, and the AI cast likeness vault with zero middleman delay.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          <select
            aria-label="Select film contract"
            value={projId}
            onChange={e => setProjId(e.target.value)}
            style={{
              height: "2.4rem", padding: "0 0.75rem", background: "var(--c-bg)", color: "var(--c-ink)",
              border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
            }}
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <button
            type="button"
            className="pm-btn pm-btn--sm pm-btn--primary"
            onClick={() => CinaChain.simulateBoxOfficeEvent(projId, 120)}
          >
            Simulate $120 Box-Office Split →
          </button>
          <button
            type="button"
            className="pm-btn pm-btn--sm"
            onClick={() => CinaChain.simulateBoxOfficeEvent(projId, 1000)}
          >
            Simulate $1,000 Window Settlement
          </button>
        </div>
      </div>

      {/* Visual Split Waterfall Bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
        <div style={{ display: "flex", height: "0.55rem", width: "100%", borderRadius: "var(--r-1)", overflow: "hidden", gap: "2px" }}>
          {splitPreview.rows.map((r, idx) => {
            const colors = ["var(--c-amber)", "var(--c-good)", "var(--c-cat-1)", "var(--c-cat-4)", "var(--c-line-3)"];
            return <div key={r.id} style={{ width: `${r.pct}%`, background: colors[idx % colors.length] }} title={`${r.role}: ${r.pct}%`} />;
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 10.5rem), 1fr))", gap: "0.65rem", marginTop: "0.25rem" }}>
          {splitPreview.rows.map((r, idx) => {
            const colors = ["var(--c-amber)", "var(--c-good)", "var(--c-cat-1)", "var(--c-cat-4)", "var(--c-ink-3)"];
            return (
              <div key={r.id} style={{ padding: "0.65rem 0.75rem", background: "var(--c-bg)", border: "1px solid var(--c-line)", borderRadius: "var(--r-1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span className="pm-k" style={{ color: colors[idx] }}>{r.pct}%</span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{r.addr}</span>
                </div>
                <div style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)", marginTop: "0.2rem" }}>{r.role}</div>
                <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: "0.1rem" }}>{r.recipient}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent On-Chain Chained Settlements */}
      <div style={{ borderTop: "1px solid var(--c-line)", paddingTop: "0.9rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span className="pm-k">Recent Chained Contract Executions</span>
          <span className="pm-k" style={{ color: "var(--c-good)" }}>● Live on Base L2</span>
        </div>
        <div className="pm-index">
          {settlements.slice(0, 5).map(tx => (
            <div key={tx.id} className="pm-row" style={{ gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr) auto", cursor: "default", padding: "0.7rem 0" }}>
              <span style={{ display: "flex", flexDirection: "column", gap: "0.18rem", minWidth: 0 }}>
                <span style={{ fontSize: "var(--fs-body)", fontWeight: 500, color: "var(--c-ink)" }}>{tx.title}</span>
                <span className="pm-k">{tx.txHash} · Director {pdFmtUSD(tx.directorUSD)} · Cast {pdFmtUSD(tx.castUSD)}</span>
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: "0.18rem" }}>
                <span className="pm-k">Investor Pool (30%)</span>
                <span className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{pdFmtUSD(tx.investorPoolUSD)} distributed</span>
              </span>
              <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.18rem" }}>
                <span className="pm-k">Your Auto-Payout</span>
                <span className="t-mono" style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: tx.yourAutoPayoutUSD > 0 ? "var(--c-good)" : "var(--c-ink-3)" }}>
                  {tx.yourAutoPayoutUSD > 0 ? `+${pdFmtUSD(tx.yourAutoPayoutUSD)} USDC` : pdFmtUSD(tx.grossUSD)}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
window.ChainedSplitRouterPanel = ChainedSplitRouterPanel;

// ─── Global mount + open API ─────────────────────────────────────────────
let _pdSetState = null;
function openPay(config) {
  if (_pdSetState) _pdSetState({ ...config, open: true, ts: Date.now() });
}
window.openPay = openPay;

function PayDrawer() {
  const [state, setState] = usPD({ open: false });
  uePD(() => { _pdSetState = setState; return () => { _pdSetState = null; }; }, []);
  if (!state.open) return null;
  return <PayDrawerInstance config={state} onClose={() => {
    setState(s => ({ ...s, open: false }));
    if (state.onClose) state.onClose();
  }}/>;
}

function PayDrawerInstance({ config, onClose }) {
  const {
    kind = "nft", title, subtitle, image, accent: accentRaw,
    priceUSD = 0, recurring, qty: qty0 = 1, qtyMax = 99,
    items, perks, onConfirm, ticker,
  } = config;

  const accent = accentRaw || "var(--c-amber)";
  const labels = {
    nft:     { actionPrimary: "Execute Mint & Split", actionPast: "Minted On-Chain",   review: "Co-Finance Pass" },
    sub:     { actionPrimary: "Subscribe On-Chain",   actionPast: "Subscribed",        review: "Studio Subscription" },
    rent:    { actionPrimary: "Rent & Split USDC",    actionPast: "Unlocked (48h)",    review: "48-Hour Screening" },
    buy:     { actionPrimary: "Buy & Split USDC",     actionPast: "Owned Forever",     review: "Master Purchase" },
    tip:     { actionPrimary: "Send Chained Tip",     actionPast: "Tip Settled",       review: "Direct Patron Tip" },
    ticket:  { actionPrimary: "Mint Pass",            actionPast: "Pass Minted",       review: "Festival Pass" },
    license: { actionPrimary: "Execute License",      actionPast: "License Minted",    review: "Commercial License" },
  }[kind] || { actionPrimary: "Pay On-Chain", actionPast: "Settled", review: "Smart-Contract Checkout" };

  const [step, setStep] = usPD("review");
  const [qty, setQty] = usPD(qty0);
  const [agreed, setAgreed] = usPD(true);
  const [payMethod, setPayMethod] = usPD("usdc");
  const [chain, setChain] = usPD("base");
  const [progress, setProgress] = usPD(0);
  const [txHash] = usPD(() => pdShortHash());
  const [settlement, setSettlement] = usPD(null);
  const [animateOpen, setAnimateOpen] = usPD(false);

  uePD(() => { const t = setTimeout(() => setAnimateOpen(true), 16); return () => clearTimeout(t); }, []);

  const subtotal = Math.max(0, Number(priceUSD || 0)) * qty;
  const gas = payMethod === "card" || payMethod === "applepay" ? 0 : (chain === "mainnet" ? 4.20 : PD_GAS_USD);
  const total = subtotal + gas;
  const split = _computeSplits(subtotal, kind, ticker);

  uePD(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  uePD(() => {
    if (step !== "confirming") return;
    let p = 0;
    const id = setInterval(() => {
      p += 22;
      if (p >= 100) {
        p = 100;
        clearInterval(id);
        const entry = _recordChainedSettlement({
          kind,
          title: title || split.title,
          grossUSD: subtotal,
          ticker,
          chain,
          payMethod,
          txHash,
          isExternalBuyer: false,
        });
        setSettlement(entry);
        if (onConfirm) onConfirm({ kind, qty, total, txHash, payMethod, chain, settlement: entry });
        setStep("success");
      }
      setProgress(p);
    }, 150);
    return () => clearInterval(id);
  }, [step]);

  const confirm = () => {
    setProgress(0);
    setStep("confirming");
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 9700,
        background: "rgba(0,0,0,.78)", backdropFilter: "blur(8px)",
        opacity: animateOpen ? 1 : 0, transition: "opacity .2s ease",
      }}/>

      <aside role="dialog" aria-modal="true" aria-label={title || "Smart-contract payment"} style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 9701,
        width: "min(34rem, 100%)",
        background: "var(--c-panel)",
        borderLeft: "1px solid var(--c-line-2)",
        boxShadow: "-24px 0 60px rgba(0,0,0,.55)",
        display: "flex", flexDirection: "column",
        transform: animateOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform .26s cubic-bezier(.2,.7,.2,1)",
        color: "var(--c-ink)",
      }}>
        {/* Header */}
        <header style={{
          padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--c-line)",
          display: "flex", alignItems: "center", gap: "0.9rem",
        }}>
          <PdItemThumb image={image} accent={accent}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent,
              letterSpacing: ".16em", textTransform: "uppercase", marginBottom: "0.2rem", fontWeight: 600,
            }}>
              {labels.review}{subtitle ? ` · ${subtitle}` : ""}
            </div>
            <div style={{
              fontFamily: "var(--f-display)", fontStyle: "italic",
              fontSize: "var(--fs-title)", fontWeight: 500, lineHeight: 1.1,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{title}</div>
          </div>
          <button onClick={onClose} style={{
            width: "2rem", height: "2rem", background: "transparent", color: "var(--c-ink-3)",
            border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)", cursor: "pointer", fontSize: "var(--fs-body)", flexShrink: 0,
          }} aria-label="Close">×</button>
        </header>

        {/* Stepper */}
        <div style={{
          padding: "0.7rem 1.5rem", borderBottom: "1px solid var(--c-line)",
          display: "flex", gap: "0.4rem", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
          letterSpacing: ".14em", textTransform: "uppercase",
        }}>
          {["01 Review", "02 Split & Wallet", "03 Chain Route", "04 Receipt"].map((s, i) => {
            const idx = ["review", "pay", "confirming", "success"].indexOf(step);
            const active = i === idx;
            const done = i < idx;
            return (
              <span key={s} style={{
                flex: 1, padding: "0.35rem 0", textAlign: "center",
                color: active ? accent : done ? "var(--c-ink-2)" : "var(--c-ink-4)",
                fontWeight: active ? 700 : 500,
                borderBottom: active ? `2px solid ${accent}` : "2px solid transparent",
              }}>{s}</span>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.35rem 1.5rem" }}>
          {step === "review" && (
            <PdReview
              config={config} accent={accent}
              qty={qty} setQty={setQty} qtyMax={qtyMax}
              priceUSD={priceUSD} recurring={recurring}
              items={items} perks={perks}
              agreed={agreed} setAgreed={setAgreed}
              kind={kind} split={split}
            />
          )}
          {step === "pay" && (
            <PdPay
              accent={accent}
              payMethod={payMethod} setPayMethod={setPayMethod}
              chain={chain} setChain={setChain}
              subtotal={subtotal} gas={gas} total={total}
              recurring={recurring} split={split}
            />
          )}
          {step === "confirming" && (
            <PdConfirming accent={accent} progress={progress} payMethod={payMethod} chain={chain} split={split}/>
          )}
          {step === "success" && (
            <PdSuccess
              accent={accent} config={config} qty={qty} total={total}
              txHash={txHash} payMethod={payMethod} chain={chain}
              settlement={settlement} split={split} onClose={onClose}
            />
          )}
        </div>

        {/* Footer */}
        {(step === "review" || step === "pay") && (
          <footer style={{
            padding: "1rem 1.5rem", borderTop: "1px solid var(--c-line)",
            background: "var(--c-panel-2)",
            display: "flex", flexDirection: "column", gap: "0.75rem",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                color: "var(--c-ink-3)", textTransform: "uppercase",
              }}>{step === "review" ? "Chained Contract Amount" : "Total Settlement"}</span>
              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontFamily: "var(--f-display)", fontStyle: "italic",
                  fontWeight: 500, fontSize: "var(--fs-title)", lineHeight: 1, color: accent,
                }}>
                  {pdFmtUSD(step === "review" ? subtotal : total)}
                  {recurring ? <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginLeft: "0.25rem" }}>/ {recurring}</span> : null}
                </div>
                {(payMethod === "eth" || payMethod === "usdc") && (
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: "0.2rem" }}>
                    ≈ {pdFmtETH(total)} ETH · Wallet {pdFmtUSD(window.USER?.walletUSD || 28413)}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              {step === "pay" && (
                <button onClick={() => setStep("review")} style={{
                  padding: "0.75rem 1rem", background: "transparent",
                  border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
                  color: "var(--c-ink-2)", cursor: "pointer",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".14em", fontWeight: 600,
                }}>← BACK</button>
              )}
              <button
                disabled={step === "review" && !agreed}
                onClick={() => step === "review" ? setStep("pay") : confirm()}
                style={{
                  flex: 1, padding: "0.8rem 1.1rem",
                  background: (step === "review" && !agreed) ? "var(--c-line)" : accent,
                  color: (step === "review" && !agreed) ? "var(--c-ink-4)" : "var(--c-on-amber)",
                  border: "none", borderRadius: "var(--r-2)",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                  letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
                  cursor: (step === "review" && !agreed) ? "not-allowed" : "pointer",
                }}
              >
                {step === "review" ? "Inspect Smart-Contract Split →" : `${labels.actionPrimary} · ${pdFmtUSD(total)}`}
              </button>
            </div>
          </footer>
        )}
      </aside>
    </>
  );
}

function PdItemThumb({ image, accent }) {
  const box = { width: "2.8rem", height: "2.8rem", borderRadius: "var(--r-1)", overflow: "hidden", flexShrink: 0, border: "1px solid var(--c-line-2)", background: image?.color || "var(--c-panel-2)" };
  if (image?.src) return <div style={box}><img src={image.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/></div>;
  if (image?.kind && typeof FrameThumb === "function") return <div style={box}><FrameThumb kind={image.kind} usePhoto/></div>;
  return <div style={{ ...box, background: `linear-gradient(135deg, ${accent}, var(--c-panel-2))` }}/>;
}

function SplitWaterfallBox({ split, accent }) {
  return (
    <div style={{
      padding: "0.9rem 1rem", background: "var(--c-panel-2)",
      border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
      display: "flex", flexDirection: "column", gap: "0.55rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".14em", color: accent, fontWeight: 600 }}>
          CHAINED SMART-CONTRACT SPLIT
        </span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>
          {CinaChain.contract}
        </span>
      </div>
      {split.rows.map(r => (
        <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem", paddingTop: "0.35rem", borderTop: "1px solid var(--c-line)" }}>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{r.role}</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginLeft: "0.45rem" }}>{r.pct}%</span>
            <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{r.recipient}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 600 }}>{pdFmtUSD(r.usd)}</div>
            {r.yourCut > 0 && (
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)" }}>+{pdFmtUSD(r.yourCut)} to you</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function PdReview({ config, accent, qty, setQty, qtyMax, priceUSD, items, perks, agreed, setAgreed, kind, split }) {
  const hasQty = kind === "nft" || kind === "ticket" || kind === "buy";
  const itemList = items || [{ label: config.title, sub: config.subtitle, price: priceUSD }];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
      {hasQty && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0.85rem 1rem", background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
        }}>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>QUANTITY</div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)" }}>
              {qty}× <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>at {pdFmtUSD(priceUSD)}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.35rem" }}>
            <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: "2.2rem", height: "2.2rem", background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)", cursor: "pointer", color: "var(--c-ink)" }}>−</button>
            <button onClick={() => setQty(Math.min(qtyMax, qty + 1))} style={{ width: "2.2rem", height: "2.2rem", background: accent, color: "var(--c-on-amber)", border: "none", borderRadius: "var(--r-1)", cursor: "pointer", fontWeight: 700 }}>+</button>
          </div>
        </div>
      )}

      <div style={{ padding: "0.85rem 1rem", background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
        {itemList.map((it, i, a) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0.45rem 0", borderBottom: i < a.length - 1 ? "1px solid var(--c-line)" : "none" }}>
            <div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{it.label}</div>
              {it.sub && <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{it.sub}</div>}
            </div>
            <div className="t-mono" style={{ fontSize: "var(--fs-body)", fontWeight: 600 }}>
              {pdFmtUSD(it.price * (hasQty && itemList.length === 1 ? qty : 1))}
            </div>
          </div>
        ))}
      </div>

      {/* Live Chained Smart-Contract Waterfall Preview */}
      <SplitWaterfallBox split={split} accent={accent}/>

      {perks && perks.length > 0 && (
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: "0.5rem" }}>INCLUDED RIGHTS & ACCESS</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {perks.map((p, i) => (
              <li key={i} style={{ display: "flex", gap: "0.6rem", fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>
                <span style={{ color: accent }}>—</span><span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <label style={{
        display: "flex", alignItems: "flex-start", gap: "0.65rem",
        padding: "0.65rem 0.8rem", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", cursor: "pointer",
      }}>
        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ accentColor: accent, marginTop: "0.2rem" }}/>
        <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", lineHeight: 1.45 }}>
          Execute atomic split on CinaSplitRouter ({CinaChain.network}). All downstream investor and creator wallets settle immediately.
        </span>
      </label>
    </div>
  );
}

function PdPay({ accent, payMethod, setPayMethod, chain, setChain, subtotal, gas, total, split }) {
  const methods = [
    { id: "usdc",     label: "USDC Wallet", sub: `Balance ${pdFmtUSD(window.USER?.walletUSD || 28413)}`, icon: "$" },
    { id: "eth",      label: "ETH Native",  sub: `${(window.USER?.walletETH || 10.45).toFixed(2)} ETH available`, icon: "Ξ" },
    { id: "card",     label: "Card → USDC", sub: "Auto-onramp into SplitRouter", icon: "▭" },
    { id: "applepay", label: "Passkey Pay", sub: "Biometric instant sign", icon: "✦" },
  ];
  const chains = [
    { id: "base",     label: "Base L2",  sub: "Gas $0.04 · Instant" },
    { id: "optimism", label: "Optimism", sub: "Gas $0.06 · Instant" },
    { id: "mainnet",  label: "Ethereum", sub: "Gas $4.20 · L1" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
      <div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: "0.55rem" }}>PAYMENT ASSET</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.5rem" }}>
          {methods.map(m => {
            const on = payMethod === m.id;
            return (
              <button key={m.id} onClick={() => setPayMethod(m.id)} style={{
                padding: "0.8rem", textAlign: "left",
                background: on ? "rgba(var(--accent-rgb),.12)" : "var(--c-panel-2)",
                border: `1px solid ${on ? accent : "var(--c-line)"}`,
                borderRadius: "var(--r-2)", cursor: "pointer", color: "inherit",
                display: "flex", alignItems: "center", gap: "0.7rem",
              }}>
                <span className="t-mono" style={{ fontSize: "var(--fs-lead)", color: on ? accent : "var(--c-ink-2)", fontWeight: 700 }}>{m.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)" }}>{m.label}</div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{m.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: "0.55rem" }}>SETTLEMENT NETWORK</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.5rem" }}>
          {chains.map(c => {
            const on = chain === c.id;
            return (
              <button key={c.id} onClick={() => setChain(c.id)} style={{
                padding: "0.7rem 0.5rem", textAlign: "center",
                background: on ? "rgba(var(--accent-rgb),.12)" : "var(--c-panel-2)",
                border: `1px solid ${on ? accent : "var(--c-line)"}`,
                borderRadius: "var(--r-2)", cursor: "pointer", color: "inherit",
              }}>
                <div style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: on ? accent : "var(--c-ink)" }}>{c.label}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: "0.2rem" }}>{c.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      <SplitWaterfallBox split={split} accent={accent}/>

      <div style={{ padding: "0.75rem 1rem", background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0" }}>
          <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>Contract Split Principal</span>
          <span className="t-mono" style={{ fontSize: "var(--fs-body)" }}>{pdFmtUSD(subtotal)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0" }}>
          <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>Network Gas ({chain.toUpperCase()})</span>
          <span className="t-mono" style={{ fontSize: "var(--fs-body)" }}>{pdFmtUSD(gas)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.45rem", marginTop: "0.35rem", borderTop: "1px solid var(--c-line)" }}>
          <span style={{ fontSize: "var(--fs-body)", fontWeight: 600 }}>Total Debited</span>
          <span className="t-mono" style={{ fontSize: "var(--fs-lead)", fontWeight: 700, color: accent }}>{pdFmtUSD(total)}</span>
        </div>
      </div>
    </div>
  );
}

function PdConfirming({ accent, progress, chain, split }) {
  const stages = [
    { at: 0,  label: `Signing EIP-712 permit from ${window.CINA?.address || "0xA1c4…f3D2"}` },
    { at: 25, label: `Calling CinaSplitRouter.distribute() on ${chain.toUpperCase()}` },
    { at: 55, label: `Streaming ${pdFmtUSD(split.rows[0]?.usd)} → Director & ${pdFmtUSD(split.rows[1]?.usd)} → Investor Pool` },
    { at: 80, label: "Updating wallet balances, pass stakes & library access" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem", paddingTop: "1.2rem" }}>
      <div style={{ textAlign: "center", padding: "0.8rem 0" }}>
        <div style={{
          width: "3.4rem", height: "3.4rem", margin: "0 auto",
          borderRadius: "50%", border: `2px solid ${accent}`, borderTopColor: "transparent",
          animation: "pdspin .9s linear infinite",
        }}/>
        <div className="t-mono" style={{ marginTop: "0.9rem", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent }}>
          EXECUTING ATOMIC SPLIT · {Math.min(100, Math.floor(progress))}%
        </div>
      </div>
      {stages.map((s, i) => {
        const done = progress > s.at;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", opacity: done ? 1 : 0.4 }}>
            <span style={{
              width: "1.4rem", height: "1.4rem", borderRadius: "50%",
              background: done ? accent : "var(--c-panel-2)", color: done ? "var(--c-on-amber)" : "var(--c-ink-3)",
              display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-label)", fontWeight: 700, flexShrink: 0,
            }}>{done ? "✓" : i + 1}</span>
            <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{s.label}</span>
          </div>
        );
      })}
      <style>{`@keyframes pdspin { from { transform: rotate(0) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

function PdSuccess({ accent, config, total, txHash, payMethod, chain, settlement, split, onClose }) {
  const rows = settlement?.rows || split.rows;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
      <div style={{
        padding: "1.35rem", textAlign: "center",
        background: "var(--c-panel-2)", border: `1px solid ${accent}`, borderRadius: "var(--r-2)",
      }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".16em", marginBottom: "0.4rem" }}>
          ✓ CHAINED SMART-CONTRACT SETTLED
        </div>
        <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)" }}>
          {config.title}
        </div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: "0.4rem" }}>
          TX {txHash} · {chain.toUpperCase()} · {payMethod.toUpperCase()} · {pdFmtUSD(total)}
        </div>
        {settlement?.yourAutoPayoutUSD > 0 && (
          <div className="t-mono" style={{ marginTop: "0.65rem", padding: "0.4rem 0.65rem", background: "rgba(106,163,122,.14)", border: "1px solid var(--c-good)", borderRadius: "var(--r-1)", color: "var(--c-good)", fontSize: "var(--fs-label)" }}>
            +{pdFmtUSD(settlement.yourAutoPayoutUSD)} USDC AUTO-CREDITED BACK TO YOUR PASS HOLDER WALLET
          </div>
        )}
      </div>

      <div style={{ padding: "0.85rem 1rem", background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".14em", marginBottom: "0.45rem" }}>
          ON-CHAIN RECIPIENT SETTLEMENTS
        </div>
        {rows.map(r => (
          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", borderTop: "1px solid var(--c-line)" }}>
            <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{r.role} ({r.pct}%)</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-good)" }}>+{pdFmtUSD(r.usd)}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        {config.ticketUrl && (
          <button onClick={() => { onClose(); if (typeof navigate === "function") navigate(config.ticketUrl); }} style={{
            flex: 1, padding: "0.8rem 1rem", background: accent, color: "var(--c-on-amber)",
            border: "none", borderRadius: "var(--r-2)", cursor: "pointer",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
          }}>OPEN SCREENING →</button>
        )}
        <button onClick={onClose} style={{
          flex: 1, padding: "0.8rem 1rem", background: "transparent", color: "var(--c-ink)",
          border: "1px solid var(--c-line-3)", borderRadius: "var(--r-2)", cursor: "pointer",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
        }}>DONE</button>
      </div>
    </div>
  );
}

(function autoMount() {
  if (typeof document === "undefined") return;
  const ready = () => {
    if (document.getElementById("__pay-drawer-host")) return;
    const host = document.createElement("div");
    host.id = "__pay-drawer-host";
    document.body.appendChild(host);
    if (ReactDOM.createRoot) ReactDOM.createRoot(host).render(<PayDrawer/>);
    else ReactDOM.render(<PayDrawer/>, host);
  };
  if (document.readyState === "complete" || document.readyState === "interactive") setTimeout(ready, 25);
  else document.addEventListener("DOMContentLoaded", ready);
})();

window.NFTCheckout = function NFTCheckout({ project, tier, onClose }) {
  const tierObj = typeof tier === "string" ? project.tiers.find(t => t.id === tier) : tier;
  uePD(() => {
    if (!tierObj) return;
    openPay({
      kind: "nft",
      title: `${tierObj.name} · ${project.title}`,
      subtitle: project.creator,
      accent: tierObj.color,
      priceUSD: tierObj.priceUSD || tierObj.price || 0,
      qty: 1,
      qtyMax: Math.max(1, (tierObj.count || 1) - (tierObj.sold || 0)),
      image: { kind: project.thumb, color: project.color },
      perks: tierObj.perks || [],
      ticker: project.id,
      ticketUrl: project.filmId ? `/film/${project.filmId}` : null,
      onClose,
    });
  }, []);
  return null;
};

window.PayDrawer = PayDrawer;
window.openPay = openPay;
