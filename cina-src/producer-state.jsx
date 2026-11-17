// producer-state.jsx — global session for the Producers surface.
// Watchlist, distributions/claims, notifications, bids/listings, and the modal flows
// that wire them all up. Persists to localStorage so a refresh keeps state.

const { useState: psUseState, useEffect: psUseEffect, useMemo: psUseMemo, useRef: psUseRef, useCallback: psUseCallback } = React;

// ─── Persistence ────────────────────────────────────────────────────────
const PS_KEY = "cina-producer-session-v1";

function psLoad() {
  try {
    const raw = localStorage.getItem(PS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}
function psSave(s) {
  try { localStorage.setItem(PS_KEY, JSON.stringify(s)); } catch (_) {}
}

// Seed: derive a starting session from window.USER + NFT_PROJECTS so the
// first paint already shows realistic state.
function psSeed() {
  const user = window.USER || {};
  const NFT  = window.NFT_PROJECTS || {};
  const seedHoldings = (user.holdings || []).filter(h => !h.onWatchlist);
  const seedWatch = (user.holdings || []).filter(h => h.onWatchlist).map(h => h.projectId);

  // Build a few claimable distributions based on real holdings.
  const claims = [];
  seedHoldings.forEach((h) => {
    const proj = NFT[h.projectId];
    if (!proj) return;
    // Quarterly distribution candidate — realistic-ish numbers
    const tier = (proj.tiers || []).find(t => t.id === h.tier) || (proj.tiers || [])[0];
    if (!tier) return;
    const amt = Math.round(tier.priceUSD * 0.04 * h.qty * 100) / 100; // 4% quarterly
    if (amt > 0.5) {
      claims.push({
        id: `dist-${h.projectId}-${h.tier}-q1`,
        projectId: h.projectId,
        tier: h.tier,
        amount: amt,
        period: "Q4 2025 distribution",
        availableAt: Date.now() - 86400000 * 2,
        status: "claimable",
        sources: [
          { kind: "ad", label: "Pitch ad revenue",  amount: amt * 0.62 },
          { kind: "tix", label: "Theatrical window", amount: amt * 0.28 },
          { kind: "tip", label: "Audience tips",     amount: amt * 0.10 },
        ],
      });
    }
  });

  // Seed notifications
  const notes = [
    claims[0] && {
      id: "n1", kind: "claim", read: false, t: Date.now() - 86400000 * 1.4,
      title: `${psUSD(claims[0].amount)} ready to claim`,
      sub: `${(NFT[claims[0].projectId]||{}).title || ""} · ${claims[0].period}`,
      ref: { type: "claim", id: claims[0].id },
    },
    {
      id: "n2", kind: "vote", read: false, t: Date.now() - 3600 * 1000 * 6,
      title: "New vote: Theatrical window length",
      sub: "Voss & Voss · closes in 2 days",
      ref: { type: "project", id: Object.keys(NFT)[0] },
    },
    {
      id: "n3", kind: "bid", read: false, t: Date.now() - 3600 * 1000 * 10,
      title: "Bid offer on your Patron stake",
      sub: "Late Light · $186 (+8% over floor)",
      ref: { type: "bid", id: "b1" },
    },
    {
      id: "n4", kind: "sale", read: true, t: Date.now() - 86400000 * 2,
      title: "Sold out: A Beautiful End · Producer tier",
      sub: "Floor moved up 14%",
      ref: { type: "project", id: Object.keys(NFT)[1] || Object.keys(NFT)[0] },
    },
  ].filter(Boolean);

  return {
    holdings: seedHoldings,
    watchlist: seedWatch,
    claims,
    listings: [], // user-created secondary listings
    bids:     [], // user-placed bids on others' NFTs
    notifications: notes,
  };
}

function psUSD(n) {
  if (n == null) return "$0";
  if (n >= 1_000_000) return "$" + (n/1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000)     return "$" + Math.round(n/1_000) + "k";
  if (n >= 100)       return "$" + Math.round(n).toLocaleString();
  return "$" + n.toFixed(2);
}

// ─── Single shared session in window so all components see the same data ───
function ensureSession() {
  if (window.__pSession) return window.__pSession;
  const initial = psLoad() || psSeed();
  // Subscribers are React setState fns — when state changes, re-render them all.
  const subs = new Set();
  let state = initial;
  const get = () => state;
  const set = (mut) => {
    state = typeof mut === "function" ? mut(state) : { ...state, ...mut };
    psSave(state);
    subs.forEach(fn => fn(state));
  };
  const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn); };
  window.__pSession = { get, set, subscribe };
  return window.__pSession;
}

function useProducerSession() {
  const session = ensureSession();
  const [s, setS] = psUseState(session.get());
  psUseEffect(() => session.subscribe(setS), [session]);

  const toggleWatch = psUseCallback((projectId) => {
    session.set(st => ({
      ...st,
      watchlist: st.watchlist.includes(projectId)
        ? st.watchlist.filter(id => id !== projectId)
        : [...st.watchlist, projectId],
    }));
  }, [session]);

  const claim = psUseCallback((claimId) => {
    session.set(st => {
      const c = st.claims.find(x => x.id === claimId);
      if (!c || c.status !== "claimable") return st;
      return {
        ...st,
        claims: st.claims.map(x => x.id === claimId ? { ...x, status: "claimed", claimedAt: Date.now() } : x),
        notifications: [
          { id: `n-${Date.now()}`, kind: "claim", read: false, t: Date.now(),
            title: `Claimed ${psUSD(c.amount)}`, sub: `Sent to your wallet · ${c.period}`,
            ref: { type: "claim", id: c.id } },
          ...st.notifications,
        ],
      };
    });
  }, [session]);

  const claimAll = psUseCallback(() => {
    session.set(st => {
      const claimable = st.claims.filter(c => c.status === "claimable");
      if (claimable.length === 0) return st;
      const total = claimable.reduce((s, c) => s + c.amount, 0);
      return {
        ...st,
        claims: st.claims.map(c => c.status === "claimable" ? { ...c, status: "claimed", claimedAt: Date.now() } : c),
        notifications: [
          { id: `n-${Date.now()}`, kind: "claim", read: false, t: Date.now(),
            title: `Claimed ${psUSD(total)} across ${claimable.length} project${claimable.length > 1 ? "s" : ""}`,
            sub: "Sent to your wallet", ref: { type: "portfolio" } },
          ...st.notifications,
        ],
      };
    });
  }, [session]);

  const placeBid = psUseCallback((bid) => {
    session.set(st => ({
      ...st,
      bids: [{ ...bid, id: `bid-${Date.now()}`, t: Date.now(), status: "open" }, ...st.bids],
      notifications: [
        { id: `n-${Date.now()}`, kind: "bid", read: false, t: Date.now(),
          title: `Bid placed: ${psUSD(bid.priceUSD)} × ${bid.qty}`,
          sub: `${bid.projectTitle} · ${bid.tier} tier`,
          ref: { type: "project", id: bid.projectId } },
        ...st.notifications,
      ],
    }));
  }, [session]);

  const cancelBid = psUseCallback((bidId) => {
    session.set(st => ({ ...st, bids: st.bids.map(b => b.id === bidId ? { ...b, status: "cancelled" } : b) }));
  }, [session]);

  const listForSale = psUseCallback((listing) => {
    session.set(st => ({
      ...st,
      listings: [{ ...listing, id: `list-${Date.now()}`, t: Date.now(), status: "open" }, ...st.listings],
      notifications: [
        { id: `n-${Date.now()}`, kind: "sale", read: false, t: Date.now(),
          title: `Listed for ${psUSD(listing.priceUSD)}`,
          sub: `${listing.projectTitle} · ${listing.tier} tier · ×${listing.qty}`,
          ref: { type: "project", id: listing.projectId } },
        ...st.notifications,
      ],
    }));
  }, [session]);

  const cancelListing = psUseCallback((listingId) => {
    session.set(st => ({ ...st, listings: st.listings.map(l => l.id === listingId ? { ...l, status: "cancelled" } : l) }));
  }, [session]);

  const markNotifRead = psUseCallback((id) => {
    session.set(st => ({ ...st, notifications: st.notifications.map(n => n.id === id ? { ...n, read: true } : n) }));
  }, [session]);
  const markAllRead = psUseCallback(() => {
    session.set(st => ({ ...st, notifications: st.notifications.map(n => ({ ...n, read: true })) }));
  }, [session]);

  return {
    s,
    toggleWatch,
    claim, claimAll,
    placeBid, cancelBid,
    listForSale, cancelListing,
    markNotifRead, markAllRead,
  };
}

// ─── Heart button (used on cards + detail) ────────────────────────────
function HeartButton({ projectId, size = 18, style }) {
  const { s, toggleWatch } = useProducerSession();
  const on = s.watchlist.includes(projectId);
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleWatch(projectId); }}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); toggleWatch(projectId); } }}
      title={on ? "Remove from watchlist" : "Add to watchlist"}
      style={{
        width: size + 14, height: size + 14, borderRadius: "50%",
        background: on ? "rgba(var(--accent-rgb),.18)" : "rgba(0,0,0,.55)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all .15s ease",
        color: on ? "var(--c-amber)" : "rgba(255,255,255,.85)",
        ...style,
      }}
    >
      <svg viewBox="0 0 24 24" width={size} height={size} fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </span>
  );
}

// ─── Notification bell ────────────────────────────────────────────────
function ProducerNotifBell({ onJump }) {
  const { s, markNotifRead, markAllRead } = useProducerSession();
  const [open, setOpen] = psUseState(false);
  const unread = s.notifications.filter(n => !n.read).length;

  const ICONS = {
    claim: "📥", vote: "🗳", bid: "💰", sale: "🔔", mint: "✨",
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        className="btn-ghost btn-icon"
        style={{ width: 34, height: 34, position: "relative" }}
        onClick={() => setOpen(v => !v)}
        data-active={open}
        title="Notifications"
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 4, right: 4,
            minWidth: 14, height: 14, padding: "0 3px",
            borderRadius: "var(--r-2)",
            background: "var(--c-amber)", color: "var(--c-on-amber)",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{unread > 9 ? "9+" : unread}</span>
        )}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 60 }}/>
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 70,
            width: 360, padding: 0,
            background: "var(--c-panel)", border: "1px solid var(--c-line-2)",
            borderRadius: "var(--r-3)", boxShadow: "0 18px 48px rgba(0,0,0,.5)",
            maxHeight: 480, display: "flex", flexDirection: "column",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderBottom: "1px solid var(--c-line)" }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" }}>NOTIFICATIONS</span>
              {unread > 0 && (
                <button onClick={markAllRead} style={{ appearance: "none", background: "transparent", border: 0, color: "var(--c-amber)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", cursor: "pointer", letterSpacing: ".08em" }}>
                  MARK ALL READ
                </button>
              )}
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {s.notifications.length === 0 && (
                <div style={{ padding: 36, textAlign: "center", color: "var(--c-ink-3)", fontSize: "var(--fs-body)" }}>You're all caught up.</div>
              )}
              {s.notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => {
                    markNotifRead(n.id);
                    setOpen(false);
                    if (n.ref?.type === "claim") {
                      const claim = s.claims.find(c => c.id === n.ref.id);
                      if (claim && window.openClaimModal) window.openClaimModal(claim);
                    } else if (n.ref?.type === "project" && onJump) {
                      onJump(`project/${n.ref.id}`);
                    } else if (n.ref?.type === "portfolio" && onJump) {
                      onJump("portfolio");
                    }
                  }}
                  style={{
                    width: "100%", appearance: "none", border: 0,
                    background: n.read ? "transparent" : "rgba(var(--accent-rgb),.04)",
                    padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10,
                    borderBottom: "1px solid var(--c-line)", cursor: "pointer", textAlign: "left",
                    color: "inherit",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--c-panel-2)"}
                  onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : "rgba(var(--accent-rgb),.04)"}
                >
                  <span style={{ fontSize: "var(--fs-lead)", flexShrink: 0 }}>{ICONS[n.kind] || "•"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: n.read ? 400 : 500 }}>{n.title}</div>
                    {n.sub && <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2 }}>{n.sub}</div>}
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 4, letterSpacing: ".08em" }}>
                      {psRelTime(n.t)}
                    </div>
                  </div>
                  {!n.read && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-amber)", flexShrink: 0, marginTop: 6 }}/>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function psRelTime(t) {
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Claim royalties modal ───────────────────────────────────────────
function ClaimModal_producerState({ claim, project, onClose }) {
  const { claim: doClaim } = useProducerSession();
  const [stage, setStage] = psUseState("review"); // review | signing | error | done
  const [progress, setProgress] = psUseState(0);

  psUseEffect(() => {
    if (stage !== "signing") return;
    setProgress(0);
    let p = 0;
    // Real flows fail sometimes (dropped tx / gas spike). Surface it, don't no-op.
    const failAt = Math.random() < 0.15 ? 42 + Math.random() * 26 : Infinity;
    const i = setInterval(() => {
      p += 12 + Math.random() * 14;
      if (p >= failAt) { clearInterval(i); setTimeout(() => setStage("error"), 220); return; }
      setProgress(Math.min(100, p));
      if (p >= 100) { clearInterval(i); doClaim(claim.id); setTimeout(() => setStage("done"), 350); }
    }, 240);
    return () => clearInterval(i);
  }, [stage, claim?.id, doClaim]);

  if (!claim) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)",
      display: "flex", justifyContent: "flex-end",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(460px, 100%)", height: "100%", background: "var(--c-panel)",
        borderLeft: "1px solid var(--c-line-2)", overflowY: "auto",
        animation: "bid-slide-in 240ms cubic-bezier(.2,.8,.2,1)",
        boxShadow: "-20px 0 60px rgba(0,0,0,.5)",
      }}>
        <style>{`@keyframes bid-slide-in { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--c-line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" }}>
              {stage === "review" && "CLAIM DISTRIBUTION"}
              {stage === "signing" && "TRANSFERRING TO WALLET"}
              {stage === "error"  && "CLAIM FAILED"}
              {stage === "done"   && "CLAIMED"}
            </div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", marginTop: 2 }}>
              {project?.title || claim.projectId} · {claim.period}
            </div>
          </div>
          <button onClick={onClose} style={{ appearance: "none", background: "transparent", border: 0, color: "var(--c-ink-3)", fontSize: "var(--fs-lead)", cursor: "pointer", padding: 6 }} aria-label="Close" title="Close">×</button>
        </div>

        <div style={{ padding: 22 }}>
          {stage === "review" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{
                padding: "20px 18px", textAlign: "center",
                background: "linear-gradient(180deg, rgba(var(--accent-rgb),.08), var(--c-panel-2) 100%)",
                border: "1px solid rgba(var(--accent-rgb),.3)", borderRadius: "var(--r-2)",
              }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" }}>YOUR SHARE</div>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-amber)", marginTop: 6, lineHeight: 1 }}>
                  {psUSD(claim.amount)}
                </div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 6 }}>{claim.tier} tier · proportional to your stake</div>
              </div>

              <div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 8 }}>WHERE IT CAME FROM</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {claim.sources.map((src, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)" }}>
                      <span style={{ color: "var(--c-ink-2)" }}>{src.label}</span>
                      <span style={{ fontFamily: "var(--f-mono)", color: "var(--c-ink)" }}>{psUSD(src.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: 14, fontSize: "var(--fs-body)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "var(--c-ink-3)" }}>Network</span>
                  <span style={{ color: "var(--c-ink)", fontFamily: "var(--f-mono)" }}>{project?.chain || "Base"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "var(--c-ink-3)" }}>Gas (estimated)</span>
                  <span style={{ color: "var(--c-ink-2)", fontFamily: "var(--f-mono)" }}>~$0.18</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--c-ink-3)" }}>Receiving wallet</span>
                  <span style={{ color: "var(--c-ink-2)", fontFamily: "var(--f-mono)" }}>0xA1c4…f3D2</span>
                </div>
              </div>
            </div>
          )}
          {stage === "signing" && (
            <div style={{ padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
              <div style={{ position: "relative", width: 100, height: 100 }}>
                <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                  <circle cx="50" cy="50" r="44" fill="none" stroke="var(--c-line)" strokeWidth="3"/>
                  <circle cx="50" cy="50" r="44" fill="none" stroke= "var(--c-amber)" strokeWidth="3"
                          strokeDasharray={`${(progress/100) * 276} 276`}
                          style={{ transition: "stroke-dasharray .25s linear", filter: "drop-shadow(0 0 6px rgba(var(--accent-rgb),.5))" }}/>
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-amber)" }}>
                  {Math.floor(progress)}%
                </div>
              </div>
              <div style={{ textAlign: "center", fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>
                Signing claim · transferring to wallet…
              </div>
            </div>
          )}
          {stage === "done" && (
            <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--c-amber)", color: "var(--c-on-amber)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-title)" }}>✓</div>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)" }}>Claimed {psUSD(claim.amount)}</div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", textAlign: "center", maxWidth: 360 }}>
                The funds are in your wallet. Next distribution arrives Apr 1.
              </div>
            </div>
          )}
          {stage === "error" && (
            <ErrorState
              icon="alert"
              title="That claim didn't go through"
              body="The transaction was dropped before it confirmed — a gas spike on Base, most likely. Your funds were never touched, so it's safe to try again."
              onRetry={() => setStage("signing")}
            />
          )}
        </div>

        <div style={{ padding: "14px 22px", borderTop: "1px solid var(--c-line)", display: "flex", justifyContent: "flex-end", gap: 8 }}>
          {stage === "review" && (
            <>
              <button onClick={onClose} style={btnGhost_producerState()} aria-label="Close" title="Close">Cancel</button>
              <button onClick={() => setStage("signing")} style={btnPrimary_producerState()}>Sign &amp; claim {psUSD(claim.amount)} →</button>
            </>
          )}
          {stage === "done" && (
            <button onClick={onClose} style={btnPrimary_producerState()} aria-label="Close" title="Close">Done</button>
          )}
          {stage === "error" && (
            <button onClick={onClose} style={btnGhost_producerState()} aria-label="Close" title="Close">Close</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Bid modal (place bid on someone else's NFT) ──────────────────────
function BidModal_producerState({ project, tier, onClose }) {
  const { placeBid } = useProducerSession();
  const [stage, setStage] = psUseState("form");
  const [pricePct, setPricePct] = psUseState(105); // % of floor
  const [qty, setQty] = psUseState(1);
  const [expiry, setExpiry] = psUseState("7d");

  const t = tier || project.tiers[0];
  const priceUSD = Math.round(t.priceUSD * (pricePct / 100));
  const total = priceUSD * qty;

  const submit = () => {
    placeBid({
      projectId: project.id,
      projectTitle: project.film?.title || project.title,
      tier: t.id,
      priceUSD,
      qty,
      expiry,
    });
    setStage("done");
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(440px, 100%)", height: "100%",
        background: "var(--c-panel)", borderLeft: "1px solid var(--c-line-2)",
        overflowY: "auto",
        animation: "bid-slide-in 240ms cubic-bezier(.2,.8,.2,1)",
        boxShadow: "-20px 0 60px rgba(0,0,0,.5)",
      }}>
        <style>{`@keyframes bid-slide-in { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--c-line)", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" }}>
              {stage === "form" ? "PLACE BID · SECONDARY" : "BID PLACED"}
            </div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", marginTop: 2 }}>
              {project.film?.title || project.title} · {t.name}
            </div>
          </div>
          <button onClick={onClose} style={{ appearance: "none", background: "transparent", border: 0, color: "var(--c-ink-3)", fontSize: "var(--fs-lead)", cursor: "pointer", padding: 6 }} aria-label="Close" title="Close">×</button>
        </div>

        <div style={{ padding: 22 }}>
          {stage === "form" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 8 }}>BID PRICE</div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", fontWeight: 500, color: "var(--c-amber)" }}>${priceUSD.toLocaleString()}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: pricePct >= 100 ? "var(--c-amber)" : "var(--c-ink-3)" }}>
                    {pricePct >= 100 ? "+" : ""}{pricePct - 100}% vs floor (${t.priceUSD})
                  </div>
                </div>
                <input
                  type="range" min={70} max={140} step={1}
                  value={pricePct} onChange={(e) => setPricePct(parseInt(e.target.value))}
                  style={{ width: "100%", accentColor: tkc("amber") }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 4 }}>
                  <span>−30%</span><span>FLOOR</span><span>+40%</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 8 }}>QUANTITY</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => setQty(Math.max(1, qty - 1))} style={btnSmall()}>−</button>
                    <span style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-title)", minWidth: 30, textAlign: "center" }}>{qty}</span>
                    <button onClick={() => setQty(Math.min(5, qty + 1))} style={btnSmall()}>+</button>
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 8 }}>EXPIRES</div>
                  <select value={expiry} onChange={e => setExpiry(e.target.value)} style={{
                    width: "100%", padding: "8px 12px", background: "var(--c-panel-2)",
                    border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", color: "var(--c-ink)", fontSize: "var(--fs-body)",
                  }}>
                    <option value="1d">1 day</option>
                    <option value="3d">3 days</option>
                    <option value="7d">7 days</option>
                    <option value="30d">30 days</option>
                  </select>
                </div>
              </div>

              <div style={{ background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: 14, fontSize: "var(--fs-body)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "var(--c-ink-3)" }}>Bid total</span>
                  <span style={{ color: "var(--c-ink)", fontFamily: "var(--f-mono)" }}>${total.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "var(--c-ink-3)" }}>Funds escrowed until accepted/cancelled</span>
                  <span style={{ color: "var(--c-good)", fontFamily: "var(--f-mono)" }}>WETH</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--c-ink-3)" }}>Cina fee</span>
                  <span style={{ color: "var(--c-ink-2)", fontFamily: "var(--f-mono)" }}>2.5% on accept</span>
                </div>
              </div>
            </div>
          )}
          {stage === "done" && (
            <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--c-amber)", color: "var(--c-on-amber)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-title)" }}>✓</div>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)" }}>Bid is live</div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", textAlign: "center", maxWidth: 360 }}>
                We'll notify you the moment a holder accepts. Expires in {expiry}.
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "14px 22px", borderTop: "1px solid var(--c-line)", display: "flex", justifyContent: "flex-end", gap: 8 }}>
          {stage === "form" && (
            <>
              <button onClick={onClose} style={btnGhost_producerState()} aria-label="Close" title="Close">Cancel</button>
              <button onClick={submit} style={btnPrimary_producerState()}>Place ${total.toLocaleString()} bid →</button>
            </>
          )}
          {stage === "done" && <button onClick={onClose} style={btnPrimary_producerState()} aria-label="Close" title="Close">Done</button>}
        </div>
      </div>
    </div>
  );
}

// ─── List for sale modal (sell from my holdings) ──────────────────────
function ListModal({ project, holding, onClose }) {
  const { listForSale } = useProducerSession();
  const [stage, setStage] = psUseState("form");
  const t = project.tiers.find(x => x.id === holding.tier) || project.tiers[0];
  const [pricePct, setPricePct] = psUseState(110);
  const [qty, setQty] = psUseState(Math.min(holding.qty, 1));
  const priceUSD = Math.round(t.priceUSD * (pricePct / 100));

  const submit = () => {
    listForSale({
      projectId: project.id,
      projectTitle: project.film?.title || project.title,
      tier: t.id, priceUSD, qty,
    });
    setStage("done");
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(440px, 100%)", height: "100%", background: "var(--c-panel)",
        borderLeft: "1px solid var(--c-line-2)", overflowY: "auto",
        animation: "bid-slide-in 240ms cubic-bezier(.2,.8,.2,1)",
        boxShadow: "-20px 0 60px rgba(0,0,0,.5)",
      }}>
        <style>{`@keyframes bid-slide-in { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--c-line)", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" }}>
              {stage === "form" ? "LIST FOR SALE" : "LISTED"}
            </div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", marginTop: 2 }}>
              {project.film?.title || project.title} · {t.name}
            </div>
          </div>
          <button onClick={onClose} style={{ appearance: "none", background: "transparent", border: 0, color: "var(--c-ink-3)", fontSize: "var(--fs-lead)", cursor: "pointer", padding: 6 }} aria-label="Close" title="Close">×</button>
        </div>
        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          {stage === "form" && (
            <>
              <div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 8 }}>ASK PRICE</div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <div style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", color: "var(--c-amber)" }}>${priceUSD.toLocaleString()}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>
                    {pricePct >= 100 ? "+" : ""}{pricePct - 100}% vs floor
                  </div>
                </div>
                <input type="range" min={80} max={200} step={1} value={pricePct} onChange={(e) => setPricePct(parseInt(e.target.value))} style={{ width: "100%", marginTop: 6, accentColor: tkc("amber") }}/>
              </div>
              <div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 8 }}>QUANTITY (you hold {holding.qty})</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={btnSmall()}>−</button>
                  <span style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-title)", minWidth: 30, textAlign: "center" }}>{qty}</span>
                  <button onClick={() => setQty(Math.min(holding.qty, qty + 1))} style={btnSmall()}>+</button>
                </div>
              </div>
              <div style={{ background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: 14, fontSize: "var(--fs-body)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: "var(--c-ink-3)" }}>You receive (after 2.5% fee)</span><span style={{ color: "var(--c-good)", fontFamily: "var(--f-mono)" }}>${(priceUSD * qty * 0.975).toFixed(0)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: "var(--c-ink-3)" }}>Creator royalty</span><span style={{ color: "var(--c-ink-2)", fontFamily: "var(--f-mono)" }}>5% to {project.creator}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--c-ink-3)" }}>Listing duration</span><span style={{ color: "var(--c-ink-2)", fontFamily: "var(--f-mono)" }}>30 days</span></div>
              </div>
            </>
          )}
          {stage === "done" && (
            <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--c-amber)", color: "var(--c-on-amber)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-title)" }}>✓</div>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)" }}>Listed for ${priceUSD.toLocaleString()}</div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", textAlign: "center", maxWidth: 340 }}>You can cancel anytime from the Portfolio.</div>
            </div>
          )}
        </div>
        <div style={{ padding: "14px 22px", borderTop: "1px solid var(--c-line)", display: "flex", justifyContent: "flex-end", gap: 8 }}>
          {stage === "form" && (
            <>
              <button onClick={onClose} style={btnGhost_producerState()} aria-label="Close" title="Close">Cancel</button>
              <button onClick={submit} style={btnPrimary_producerState()}>List ×{qty} for ${priceUSD.toLocaleString()} →</button>
            </>
          )}
          {stage === "done" && <button onClick={onClose} style={btnPrimary_producerState()} aria-label="Close" title="Close">Done</button>}
        </div>
      </div>
    </div>
  );
}

// ─── Button helpers ──────────────────────────────────────────────────
function btnPrimary_producerState() {
  return {
    appearance: "none", padding: "10px 16px",
    background: "var(--c-amber)", color: tkc("on-amber"),
    border: 0, borderRadius: "var(--r-2)",
    fontWeight: 600, fontSize: "var(--fs-body)", cursor: "pointer", letterSpacing: ".02em",
    fontFamily: "var(--f-sans)",
  };
}
function btnGhost_producerState() {
  return {
    appearance: "none", padding: "10px 14px",
    background: "transparent", border: "1px solid var(--c-line)",
    borderRadius: "var(--r-2)", color: tkc("ink"), fontSize: "var(--fs-body)", cursor: "pointer",
    fontFamily: "var(--f-sans)",
  };
}
function btnSmall() {
  return {
    appearance: "none", width: 30, height: 30,
    background: tkc("panel-2"), border: "1px solid var(--c-line)",
    borderRadius: "var(--r-2)", color: tkc("ink"), fontSize: "var(--fs-body)", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  };
}

// ─── Flows host (mounts modals based on global open* fns) ────────────
function ProducerFlowsHost() {
  const [claimOpen, setClaimOpen] = psUseState(null);
  const [bidOpen,   setBidOpen]   = psUseState(null);
  const [listOpen,  setListOpen]  = psUseState(null);

  psUseEffect(() => {
    window.openClaimModal = (claim, project) => setClaimOpen({ claim, project });
    window.openBidModal   = (project, tier) => setBidOpen({ project, tier });
    window.openListModal  = (project, holding) => setListOpen({ project, holding });
    return () => {
      delete window.openClaimModal;
      delete window.openBidModal;
      delete window.openListModal;
    };
  }, []);

  return (
    <>
      {claimOpen && <ClaimModal_producerState claim={claimOpen.claim} project={claimOpen.project} onClose={() => setClaimOpen(null)}/>}
      {bidOpen   && <BidModal_producerState   project={bidOpen.project}   tier={bidOpen.tier}     onClose={() => setBidOpen(null)}/>}
      {listOpen  && <ListModal  project={listOpen.project}  holding={listOpen.holding} onClose={() => setListOpen(null)}/>}
    </>
  );
}

// ─── Distribution schedule (used in Portfolio) ──────────────────────
function DistributionSchedule({ claims, projects, onClaim }) {
  const items = psUseMemo(() => {
    return [...claims].sort((a, b) => {
      // claimable first, then upcoming, then claimed
      const order = { claimable: 0, upcoming: 1, claimed: 2 };
      return (order[a.status] || 0) - (order[b.status] || 0);
    });
  }, [claims]);

  if (items.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "var(--c-ink-3)", border: "1px dashed var(--c-line)", borderRadius: "var(--r-3)" }}>
        No distributions yet — they accrue as your projects earn.
      </div>
    );
  }

  return (
    <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr", padding: "10px 16px", background: "var(--c-panel-2)", borderBottom: "1px solid var(--c-line)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
        <div>PROJECT</div><div>PERIOD</div><div>STATUS</div><div>AMOUNT</div><div style={{ textAlign: "right" }}>ACTION</div>
      </div>
      {items.map((c, i) => {
        const proj = projects.find(p => p.id === c.projectId);
        const statusColor = c.status === "claimable" ? "var(--c-amber)" : c.status === "claimed" ? "var(--c-good)" : "var(--c-ink-3)";
        return (
          <div key={c.id} style={{
            display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr",
            padding: "12px 16px", alignItems: "center", fontSize: "var(--fs-body)",
            borderBottom: i < items.length - 1 ? "1px solid var(--c-line)" : 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {proj && <div style={{ width: 36, height: 24, borderRadius: "var(--r-1)", background: proj.color }}/>}
              <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic" }}>{proj?.film?.title || proj?.title || c.projectId}</span>
            </div>
            <div style={{ color: "var(--c-ink-2)" }}>{c.period}</div>
            <div style={{ color: statusColor, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase" }}>{c.status}</div>
            <div style={{ color: "var(--c-amber)", fontFamily: "var(--f-mono)", fontWeight: 500 }}>{psUSD(c.amount)}</div>
            <div style={{ textAlign: "right" }}>
              {c.status === "claimable" ? (
                <button onClick={() => onClaim(c, proj)} style={{ ...btnPrimary_producerState(), padding: "6px 12px", fontSize: "var(--fs-label)" }}>
                  Claim →
                </button>
              ) : c.status === "claimed" ? (
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{psRelTime(c.claimedAt || c.availableAt)}</span>
              ) : (
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>Pending</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Performance sparkline (small chart for portfolio) ────────────────
function PortfolioSpark({ width = 720, height = 160 }) {
  const points = psUseMemo(() => {
    return Array.from({ length: 60 }, (_, i) => {
      const base = 1 + (i / 60) * 0.32;
      const wave = Math.sin(i / 7) * 0.06 + Math.cos(i / 11) * 0.04;
      return base + wave;
    });
  }, []);
  const w = width, h = height, pad = 6;
  const min = Math.min(...points) * 0.97, max = Math.max(...points) * 1.03;
  const pts = points.map((v, i) => [
    pad + (i / (points.length - 1)) * (w - pad * 2),
    h - pad - ((v - min) / (max - min)) * (h - pad * 2),
  ]);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const fill = `${path} L${pts[pts.length-1][0]},${h-pad} L${pts[0][0]},${h-pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height }}>
      <defs>
        <linearGradient id="psp" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor= "var(--c-amber)" stopOpacity=".3"/>
          <stop offset="100%" stopColor= "var(--c-amber)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(y => (
        <line key={y} x1={pad} x2={w-pad} y1={pad + (h-pad*2)*y} y2={pad + (h-pad*2)*y} stroke="rgba(232,227,214,.06)" strokeDasharray="2 4"/>
      ))}
      <path d={fill} fill="url(#psp)"/>
      <path d={path} fill="none" stroke= "var(--c-amber)" strokeWidth="1.5"/>
    </svg>
  );
}

Object.assign(window, { useProducerSession, HeartButton, ProducerNotifBell, ProducerFlowsHost, DistributionSchedule, PortfolioSpark, psRelTime });
