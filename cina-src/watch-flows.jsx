// watch-flows.jsx — Modal flows hosted at app root: SignIn, Tip, BuyCrypto,
// Claim, Bid, CreateParty. Each registers an opener via watch-state hooks.

const { useState: usFl, useEffect: ueFl, useRef: urFl } = React;

// ─── Shared modal shell ────────────────────────────────────────────────
function ModalBackdrop({ onClose, children, width = 480 }) {
  ueFl(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, []);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,.55)",
      backdropFilter: "blur(4px)",
      display: "flex", justifyContent: "flex-end",
      animation: "lb-fade .2s ease-out",
    }} onClick={onClose}>
      <style>{`@keyframes lb-slide { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: width,
        height: "100%", overflowY: "auto",
        background: "var(--c-panel)",
        borderLeft: "1px solid var(--c-line-2)",
        boxShadow: "-20px 0 60px rgba(0,0,0,.5)",
        animation: "lb-slide .24s cubic-bezier(.2,.8,.2,1)",
      }}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ eyebrow, title, onClose }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      padding: "20px 24px 16px",
      borderBottom: "1px solid var(--c-line)",
    }}>
      <div>
        {eyebrow && <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 6 }}>{eyebrow}</div>}
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", lineHeight: 1.05 }}>{title}</div>
      </div>
      <button onClick={onClose} className="btn-ghost" style={{
        width: 32, height: 32, padding: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "var(--fs-lead)", color: "var(--c-ink-3)",
      }} aria-label="Close" title="Close">×</button>
    </div>
  );
}

// ─── Sign-in modal ─────────────────────────────────────────────────────
// Sign-in now lives in cina-auth.jsx — one passkey-first sheet shared by all
// four surfaces. This shim keeps FlowsHost's contract while delegating.
function SignInModal({ ctx, onClose }) {
  if (window.CinaAuthSheet) return <window.CinaAuthSheet ctx={ctx || {}} onClose={onClose}/>;
  return null;
}

// ─── Tip creator modal ────────────────────────────────────────────────
function TipModal({ creator, onClose }) {
  const [amt, setAmt] = usFl(10);
  const [note, setNote] = usFl("");
  const presets = [5, 10, 25, 50, 100];
  const wallet = window.USER?.walletUSD || 0;
  const insufficient = amt > wallet;
  const send = () => {
    if (insufficient) { window.openBuyCrypto?.({ minNeeded: amt - wallet }); return; }
    window.recordTip(creator.id, amt);
    onClose();
  };
  return (
    <ModalBackdrop onClose={onClose} width={460}>
      <ModalHeader eyebrow="TIP CREATOR" title={`Send to ${creator.name}`} onClose={onClose}/>
      <div style={{ padding: "20px 24px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "var(--c-panel-2)",
            border: "1.5px solid " + (creator.color || tkc("amber")),
            display: "flex", alignItems: "center", justifyContent: "center",
            color: creator.color || tkc("amber"),
            fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)",
          }}>{creator.glyph || creator.name[0]}</div>
          <div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 500 }}>{creator.name}</div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
              {creator.handle || ""}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 12 }}>
          {presets.map(p => (
            <button key={p} onClick={() => setAmt(p)} style={{
              padding: "12px 0",
              background: amt === p ? "var(--c-amber)" : "var(--c-panel-2)",
              border: "1px solid " + (amt === p ? "var(--c-amber)" : "var(--c-line-2)"),
              color: amt === p ? tkc("on-amber") : "var(--c-ink)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", fontWeight: 600,
              cursor: "pointer",
            }}>${p}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>CUSTOM</span>
          <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>$</span>
          <input type="number" min={1} max={5000} value={amt}
            onChange={e => setAmt(Math.max(1, Math.min(5000, parseInt(e.target.value) || 0)))}
            style={{
              flex: 1, padding: "10px 12px",
              background: "var(--c-panel-2)",
              border: "1px solid var(--c-line-2)",
              color: "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "var(--f-mono)",
            }}/>
        </div>

        <input value={note} onChange={e => setNote(e.target.value.slice(0, 140))}
          placeholder="Add a note (optional)"
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "10px 12px", marginBottom: 16,
            background: "var(--c-panel-2)",
            border: "1px solid var(--c-line-2)",
            color: "var(--c-ink)", fontSize: "var(--fs-body)",
          }}/>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 14px", marginBottom: 12,
          background: "var(--c-panel-2)",
          border: "1px solid var(--c-line)",
          fontSize: "var(--fs-body)", color: "var(--c-ink-3)",
        }}>
          <span>Wallet balance</span>
          <span className="t-mono" style={{ color: insufficient ? "var(--c-blood)" : "var(--c-ink)", fontWeight: 600 }}>
            {window.fmtUSD(wallet)}
          </span>
        </div>

        <button onClick={send} style={{
          width: "100%", padding: "14px",
          background: insufficient ? "var(--c-panel-2)" :  "var(--c-amber)",
          color: insufficient ? "var(--c-amber)" : tkc("on-amber"),
          border: insufficient ? "1px solid var(--c-amber)" : "none",
          fontSize: "var(--fs-body)", fontFamily: "var(--f-mono)",
          letterSpacing: ".16em", fontWeight: 600,
          cursor: "pointer",
        }}>
          {insufficient ? `ADD ${window.fmtUSD(amt - wallet)} TO WALLET →` : `SEND ${window.fmtUSD(amt)} →`}
        </button>
      </div>
    </ModalBackdrop>
  );
}

// ─── Buy crypto sheet ────────────────────────────────────────────────
function BuyCryptoModal({ ctx, onClose }) {
  const presets = [25, 50, 100, 250, 500];
  const [amt, setAmt] = usFl(ctx?.minNeeded ? Math.ceil(ctx.minNeeded / 25) * 25 : 50);
  const [pay, setPay] = usFl("apple");
  const [busy, setBusy] = usFl(false);
  const buy = () => {
    setBusy(true);
    setTimeout(() => {
      if (window.USER) window.USER.walletUSD = (window.USER.walletUSD || 0) + amt;
      window.bumpSession();
      window.toast?.({ title: "WALLET TOPPED UP", text: `+${window.fmtUSD(amt)}`, kind: "good" });
      onClose();
    }, 900);
  };
  return (
    <ModalBackdrop onClose={onClose} width={440}>
      <ModalHeader eyebrow="ADD FUNDS" title="Top up wallet" onClose={onClose}/>
      <div style={{ padding: "20px 24px 24px" }}>
        {ctx?.minNeeded > 0 && (
          <div style={{
            padding: "10px 12px", marginBottom: 16,
            background: "rgba(217,151,87,.08)",
            border: "1px solid rgba(217,151,87,.28)",
            fontSize: "var(--fs-body)", color:  "var(--c-amber)",
          }}>
            You need at least {window.fmtUSD(ctx.minNeeded)} more to complete this action.
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 16 }}>
          {presets.map(p => (
            <button key={p} onClick={() => setAmt(p)} style={{
              padding: "12px 0",
              background: amt === p ? "var(--c-amber)" : "var(--c-panel-2)",
              border: "1px solid " + (amt === p ? "var(--c-amber)" : "var(--c-line-2)"),
              color: amt === p ? tkc("on-amber") : "var(--c-ink)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", fontWeight: 600,
              cursor: "pointer",
            }}>${p}</button>
          ))}
        </div>
        <label className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", display: "block", marginBottom: 8 }}>PAY WITH</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          {[
            { id: "apple",  label: "Apple Pay",          sub: "•••• 4920" },
            { id: "card",   label: "Credit / debit card", sub: "Visa ending 1188" },
            { id: "bank",   label: "Bank transfer",       sub: "ACH · 1–2 days" },
          ].map(p => (
            <button key={p.id} onClick={() => setPay(p.id)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left",
              padding: "12px 14px",
              background: pay === p.id ? "var(--c-panel-2)" : "transparent",
              border: "1px solid " + (pay === p.id ? "var(--c-amber)" : "var(--c-line)"),
              color: "var(--c-ink)", cursor: "pointer", fontSize: "var(--fs-body)",
            }}>
              <span>
                <span style={{ display: "block" }}>{p.label}</span>
                <span style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2 }}>{p.sub}</span>
              </span>
              <span style={{
                width: 14, height: 14, borderRadius: "50%",
                border: "1.5px solid " + (pay === p.id ? "var(--c-amber)" : "var(--c-line-2)"),
                background: pay === p.id ? "var(--c-amber)" : "transparent",
              }}/>
            </button>
          ))}
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between", padding: "10px 0",
          fontSize: "var(--fs-body)", color: "var(--c-ink-3)",
          borderTop: "1px solid var(--c-line)",
        }}>
          <span>Network fee</span><span className="t-mono">$0.32</span>
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between", padding: "8px 0 16px",
          fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 500,
        }}>
          <span>Total</span><span className="t-mono">{window.fmtUSD(amt + 0.32)}</span>
        </div>
        <button disabled={busy} onClick={buy} style={{
          width: "100%", padding: "14px",
          background: "var(--c-amber)", color: "var(--c-on-amber)", border: "none",
          fontSize: "var(--fs-body)", fontFamily: "var(--f-mono)",
          letterSpacing: ".16em", fontWeight: 600, cursor: "pointer",
        }}>
          {busy ? "PROCESSING…" : `BUY ${window.fmtUSD(amt)} →`}
        </button>
      </div>
    </ModalBackdrop>
  );
}

// ─── Claim royalty payout ────────────────────────────────────────────
function ClaimModal({ ctx, onClose }) {
  const [busy, setBusy] = usFl(false);
  const claim = () => {
    setBusy(true);
    setTimeout(() => {
      window.claimPayout(ctx.bucket, ctx.amount);
      onClose();
    }, 900);
  };
  return (
    <ModalBackdrop onClose={onClose} width={440}>
      <ModalHeader eyebrow="ROYALTY PAYOUT" title="Claim earnings" onClose={onClose}/>
      <div style={{ padding: "20px 24px 24px" }}>
        <div style={{ textAlign: "center", padding: "20px 0 24px" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 12 }}>AVAILABLE</div>
          <div className="t-display t-num" style={{ fontStyle: "italic", fontSize: "var(--fs-display)", color: "var(--c-amber)", lineHeight: 1 }}>
            {window.fmtUSD(ctx.amount)}
          </div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 10 }}>
            From {ctx.bucket || "stake earnings"} · paid out weekly
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--c-line)", padding: "16px 0", display: "grid", gap: 8, fontSize: "var(--fs-body)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--c-ink-3)" }}>Destination</span>
            <span style={{ color: "var(--c-ink)" }}>Cina wallet</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--c-ink-3)" }}>Network fee</span>
            <span className="t-mono" style={{ color: "var(--c-ink)" }}>$0.00 (sponsored)</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--c-ink-3)" }}>Settlement</span>
            <span className="t-mono" style={{ color: "var(--c-ink)" }}>Instant</span>
          </div>
        </div>
        <button disabled={busy} onClick={claim} style={{
          width: "100%", marginTop: 16, padding: "14px",
          background: "var(--c-amber)", color: "var(--c-on-amber)", border: "none",
          fontSize: "var(--fs-body)", fontFamily: "var(--f-mono)",
          letterSpacing: ".16em", fontWeight: 600, cursor: "pointer",
        }}>
          {busy ? "CLAIMING…" : `CLAIM ${window.fmtUSD(ctx.amount)} →`}
        </button>
      </div>
    </ModalBackdrop>
  );
}

// ─── Bid modal ───────────────────────────────────────────────────────
function BidModal({ auction, onClose }) {
  const minBid = (auction.currentUSD || auction.minUSD || 100) + (auction.minIncrement || 25);
  const [amt, setAmt] = usFl(minBid);
  const wallet = window.USER?.walletUSD || 0;
  const insufficient = amt > wallet;
  const place = () => {
    if (insufficient) { window.openBuyCrypto?.({ minNeeded: amt - wallet }); return; }
    if (window.placeBid(auction.id, amt)) onClose();
  };
  return (
    <ModalBackdrop onClose={onClose} width={460}>
      <ModalHeader eyebrow="PLACE BID" title={auction.title || "Auction"} onClose={onClose}/>
      <div style={{ padding: "20px 24px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--c-panel-2)", border: "1px solid var(--c-line)", marginBottom: 16 }}>
          <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>Current bid</span>
          <span className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 600 }}>
            {window.fmtUSD(auction.currentUSD || auction.minUSD || 0)}
          </span>
        </div>
        <label className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", display: "block", marginBottom: 8 }}>YOUR BID (MIN {window.fmtUSD(minBid)})</label>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
          <span style={{ fontSize: "var(--fs-lead)", color: "var(--c-ink-3)" }}>$</span>
          <input type="number" value={amt} min={minBid}
            onChange={e => setAmt(Math.max(minBid, parseInt(e.target.value) || minBid))}
            style={{
              flex: 1, padding: "12px 14px",
              background: "var(--c-panel-2)",
              border: "1px solid var(--c-line-2)",
              color: "var(--c-ink)", fontSize: "var(--fs-lead)", fontFamily: "var(--f-mono)", fontWeight: 600,
            }}/>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[0, 50, 100, 250].map(b => (
            <button key={b} onClick={() => setAmt(minBid + b)} className="btn-ghost" style={{
              flex: 1, padding: "8px",
              fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", letterSpacing: ".16em",
              border: "1px solid var(--c-line)",
            }}>+${b}</button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid var(--c-line)", fontSize: "var(--fs-body)" }}>
          <span style={{ color: "var(--c-ink-3)" }}>Wallet balance</span>
          <span className="t-mono" style={{ color: insufficient ? "var(--c-blood)" : "var(--c-ink)" }}>
            {window.fmtUSD(wallet)}
          </span>
        </div>
        <button onClick={place} style={{
          width: "100%", marginTop: 12, padding: "14px",
          background: insufficient ? "var(--c-panel-2)" :  "var(--c-amber)",
          color: insufficient ? "var(--c-amber)" : tkc("on-amber"),
          border: insufficient ? "1px solid var(--c-amber)" : "none",
          fontSize: "var(--fs-body)", fontFamily: "var(--f-mono)",
          letterSpacing: ".16em", fontWeight: 600, cursor: "pointer",
        }}>
          {insufficient ? `ADD ${window.fmtUSD(amt - wallet)} TO BID →` : `BID ${window.fmtUSD(amt)} →`}
        </button>
        <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", lineHeight: 1.5, marginTop: 12 }}>
          Bids are binding. If you win, the amount is debited from your wallet and the asset is delivered to your address.
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ─── Create Watch Party modal ────────────────────────────────────────
function CreatePartyModal({ film, onClose }) {
  const [when, setWhen] = usFl("now");
  const [vis, setVis]   = usFl("friends");
  const [name, setName] = usFl(film ? `${film.title} watch party` : "Watch party");
  const make = () => {
    onClose();
    window.toast?.({ title: "PARTY CREATED", text: `Invite link copied · ${name}`, kind: "good" });
    if (film) window.navigate(`/party/${film.id}`);
    else window.navigate("/party");
  };
  return (
    <ModalBackdrop onClose={onClose} width={460}>
      <ModalHeader eyebrow="WATCH PARTY" title="Host a party" onClose={onClose}/>
      <div style={{ padding: "20px 24px 24px" }}>
        <label className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", display: "block", marginBottom: 8 }}>PARTY NAME</label>
        <input value={name} onChange={e => setName(e.target.value.slice(0, 60))}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "12px 14px", marginBottom: 16,
            background: "var(--c-panel-2)",
            border: "1px solid var(--c-line-2)",
            color: "var(--c-ink)", fontSize: "var(--fs-body)",
          }}/>
        <label className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", display: "block", marginBottom: 8 }}>WHEN</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
          {[{ id: "now", l: "Start now" }, { id: "later", l: "Schedule" }].map(o => (
            <button key={o.id} onClick={() => setWhen(o.id)} style={{
              padding: "11px",
              background: when === o.id ? "var(--c-amber)" : "var(--c-panel-2)",
              border: "1px solid " + (when === o.id ? "var(--c-amber)" : "var(--c-line-2)"),
              color: when === o.id ? tkc("on-amber") : "var(--c-ink)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", letterSpacing: ".16em", fontWeight: 600,
              cursor: "pointer",
            }}>{o.l}</button>
          ))}
        </div>
        <label className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", display: "block", marginBottom: 8 }}>VISIBILITY</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          {[
            { id: "friends",  l: "Friends only",       s: "Invite link required" },
            { id: "stakers",  l: "Stakers only",       s: "Anyone holding the title" },
            { id: "public",   l: "Public",             s: "Discoverable on Cina" },
          ].map(o => (
            <button key={o.id} onClick={() => setVis(o.id)} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left",
              padding: "12px 14px",
              background: vis === o.id ? "var(--c-panel-2)" : "transparent",
              border: "1px solid " + (vis === o.id ? "var(--c-amber)" : "var(--c-line)"),
              color: "var(--c-ink)", cursor: "pointer", fontSize: "var(--fs-body)",
            }}>
              <span>
                <span style={{ display: "block" }}>{o.l}</span>
                <span style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2 }}>{o.s}</span>
              </span>
              <span style={{
                width: 14, height: 14, borderRadius: "50%",
                border: "1.5px solid " + (vis === o.id ? "var(--c-amber)" : "var(--c-line-2)"),
                background: vis === o.id ? "var(--c-amber)" : "transparent",
              }}/>
            </button>
          ))}
        </div>
        <button onClick={make} style={{
          width: "100%", padding: "14px",
          background: "var(--c-amber)", color: "var(--c-on-amber)", border: "none",
          fontSize: "var(--fs-body)", fontFamily: "var(--f-mono)",
          letterSpacing: ".16em", fontWeight: 600, cursor: "pointer",
        }}>{when === "now" ? "OPEN PARTY ROOM →" : "CREATE & COPY LINK →"}</button>
      </div>
    </ModalBackdrop>
  );
}

// ─── Host: registers all openers, renders the active modal ────────────
function FlowsHost() {
  const [signIn, setSignIn]     = usFl(null);
  const [tip, setTip]           = usFl(null);
  const [buy, setBuy]           = usFl(null);
  const [claim, setClaim]       = usFl(null);
  const [bid, setBid]           = usFl(null);
  const [party, setParty]       = usFl(null);

  ueFl(() => {
    window.registerSignInOpener(ctx => setSignIn(ctx));
    window.registerTipOpener(c => setTip(c));
    window.registerBuyCryptoOpener(ctx => setBuy(ctx));
    window.registerClaimOpener(ctx => setClaim(ctx));
    window.registerBidOpener(a => setBid(a));
    window.registerPartyOpener(f => setParty(f || {}));
  }, []);

  return (
    <>
      {signIn && <SignInModal ctx={signIn} onClose={() => setSignIn(null)}/>}
      {tip && <TipModal creator={tip} onClose={() => setTip(null)}/>}
      {buy && <BuyCryptoModal ctx={buy} onClose={() => setBuy(null)}/>}
      {claim && <ClaimModal ctx={claim} onClose={() => setClaim(null)}/>}
      {bid && <BidModal auction={bid} onClose={() => setBid(null)}/>}
      {party && <CreatePartyModal film={party.id ? party : null} onClose={() => setParty(null)}/>}
    </>
  );
}

Object.assign(window, { FlowsHost });
