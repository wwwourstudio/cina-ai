// watch-auction.jsx — NFT secondary marketplace + director mint flow.
// • AuctionMarketPage — list of live auctions across Cina, sortable filters
// • AuctionDetailPage — single auction with bid history + place bid
// • CreateAuctionOverlay — holder lists their stake at reserve / Buy It Now
// • DirectorMintFlow — director configures + mints a new film NFT collection

const { useState: usAu, useEffect: ueAu, useMemo: umAu, useRef: urAu } = React;

// ─── Synthetic auction data ──────────────────────────────────────────
function genAuctions() {
  const _np = (typeof NFT_PROJECTS !== "undefined" ? NFT_PROJECTS : {});
  const projects = (Array.isArray(_np) ? _np : Object.values(_np)).slice(0, 8);
  const sellers = ["yo.eth","rena_ko","ash.404","park_dr","june_a","tao_reng","soren_v","miradawn","kyle.b","void_91"];
  const photoThumbs = ["darkroom-wide", "voss-enter", "darkroom-est", "fence", "the-photo", "moss"];
  const pickThumb = (p) => {
    if (p.thumb) return p.thumb;
    const seed = (p.id || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return photoThumbs[seed % photoThumbs.length];
  };
  const list = [];
  let n = 0;
  projects.forEach((p, i) => {
    [
      { tier: "Director's Cut",  basePrice: 12.0, count: 2 },
      { tier: "Frame",           basePrice:  3.4, count: 4 },
      { tier: "Audience",        basePrice:  0.42, count: 6 },
    ].forEach(t => {
      for (let k = 0; k < t.count; k++) {
        n++;
        const drift = (Math.sin(n * 0.7) * 0.4 + 1);
        const top = +(t.basePrice * drift * (1 + (((n * 9301 + 49297) % 233280) / 233280) * 0.6)).toFixed(3);
        const reserve = +(top * 0.7).toFixed(3);
        const bin = +(top * 1.4).toFixed(3);
        list.push({
          id: `auc_${p.id}_${t.tier.replace(/\s/g,"")}_${k}`,
          projectId: p.id,
          projectTitle: p.title,
          creator: p.creator,
          color: p.color || tkc("cat-3"),
          thumb: pickThumb(p),
          edition: `${(i*9 + k + 1).toString().padStart(3,"0")} / ${p.editions || 100}`,
          tier: t.tier,
          tierKey: t.tier.toLowerCase().replace(/\s/g,"-"),
          seller: sellers[(n + i) % sellers.length],
          reservePrice: reserve,
          currentBid:   top,
          buyItNow:     bin,
          bidCount: 3 + (n % 9),
          endsInH: 1 + ((n * 17) % 96),
          royalty: 8,
          synopsis: p.synopsis || "Stake in an in-production Cina film. Holders earn from box-office, premiere access, and on-set perks.",
        });
      }
    });
  });
  if (window.pbBranchedLots) list.push(...window.pbBranchedLots());
  return list;
}

const AUCTIONS = genAuctions();
const HAS_BRANCHED_LOTS = AUCTIONS.some(a => a.branched);

// ─── Auction market — list page ──────────────────────────────────────
function AuctionMarketPage() {
  const [filter, setFilter] = usAu("all"); // all · directors-cut · frame · audience
  const [sort, setSort] = usAu("ending"); // ending · price-low · price-high · bids

  const filtered = umAu(() => {
    let list = AUCTIONS;
    if (filter === "branched") list = list.filter(a => a.branched);
    else if (filter !== "all") list = list.filter(a => a.tierKey === filter);
    if (sort === "ending")     list = [...list].sort((a,b) => a.endsInH - b.endsInH);
    if (sort === "price-low")  list = [...list].sort((a,b) => a.currentBid - b.currentBid);
    if (sort === "price-high") list = [...list].sort((a,b) => b.currentBid - a.currentBid);
    if (sort === "bids")       list = [...list].sort((a,b) => b.bidCount - a.bidCount);
    return list;
  }, [filter, sort]);

  const tvl = AUCTIONS.reduce((s, a) => s + a.currentBid, 0);
  const closingSoon = AUCTIONS.filter(a => a.endsInH < 6).length;

  return (
    <div style={{ padding: "32px var(--gutter) 80px", maxWidth: "var(--w-page)", margin: "0 auto" }}>

      {/* Header strip */}
      <div style={{ marginBottom: 28 }}>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>SECONDARY MARKET · LIVE</span>
        <h1 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-display)", fontWeight: 400, letterSpacing: "-0.02em", margin: "8px 0 8px", lineHeight: 1.05 }}>The auction floor.</h1>
        <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", maxWidth: 580, lineHeight: 1.5, margin: 0 }}>
          Cina holders auctioning their stake to new investors. Every resale pays the original director an 8% royalty.
        </p>
      </div>

      {/* Stats strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, marginBottom: 28, background: "var(--c-line)" }}>
        {[
          ["LIVE AUCTIONS", AUCTIONS.length, tkc("good")],
          ["VOLUME LOCKED", `${tvl.toFixed(1)} ETH`, "var(--c-amber)"],
          ["CLOSING <6H", closingSoon, "var(--c-amber)"],
          ["DIRECTOR ROYALTIES", "8%", "var(--c-ink)"],
        ].map(([k, v, c], i) => (
          <div key={i} style={{ background: "var(--c-panel)", padding: "18px 22px" }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 8 }}>{k}</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, color: c, letterSpacing: "-0.01em" }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[["all","All auctions"],["directors-cut","Director's Cut"],["frame","Frame"],["audience","Audience"],...(HAS_BRANCHED_LOTS ? [["branched","Branched rights"],["canonical-cut","Canonical cuts"]] : [])].map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k)} style={{
              padding: "8px 16px", fontSize: "var(--fs-body)",
              background: filter === k ? "var(--c-amber)" : "transparent",
              color: filter === k ? tkc("on-amber") : "var(--c-ink-2)",
              border: `1px solid ${filter === k ? "var(--c-amber)" : "var(--c-line-2)"}`,
              borderRadius: 999, cursor: "pointer", fontWeight: filter === k ? 600 : 400,
            }}>{l}</button>
          ))}
        </div>
        <span style={{ flex: 1 }}/>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>SORT</span>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{
          padding: "8px 12px", fontSize: "var(--fs-body)", background: "transparent",
          border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink-2)",
          fontFamily: "var(--f-sans)", cursor: "pointer",
        }}>
          <option value="ending">Ending soon</option>
          <option value="price-low">Price · low to high</option>
          <option value="price-high">Price · high to low</option>
          <option value="bids">Most active</option>
        </select>
      </div>

      {/* Auction grid — same card language as the Market page: clean cover with
          chips, title below the image, amber lead price, progress bar + mono footer. */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "30px 18px" }}>
        {filtered.map(a => <AuctionCard key={a.id} auction={a}/>)}
      </div>
    </div>
  );
}

function AuctionCard({ auction }) {
  const ending = auction.endsInH < 6;
  const [watch, setWatch] = usAu(false);
  const [hover, setHover] = usAu(false);
  const pct = Math.min(100, Math.round((auction.currentBid / auction.buyItNow) * 100));
  const chip = {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 9px",
    borderRadius: "var(--r-2)", background: "rgba(8,8,10,.72)", backdropFilter: "blur(6px)",
    color: tkc("ink"), fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
    border: "1px solid rgba(255,255,255,.08)", textTransform: "uppercase", whiteSpace: "nowrap",
  };
  return (
    <div
      role="button" tabIndex={0}
      onClick={() => navigate(`/auction/${auction.id}`)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/auction/${auction.id}`); } }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: "flex", flexDirection: "column", cursor: "pointer", color: "inherit", textAlign: "left" }}
    >
      {/* Cover — clean image, chips over it, nothing else */}
      <div style={{
        aspectRatio: "16/10", borderRadius: "var(--r-2)", overflow: "hidden", position: "relative",
        background: `linear-gradient(135deg, ${auction.color} 0%, ${tkc("black")} 100%)`,
        border: `1px solid ${hover ? "var(--c-line-3)" : "var(--c-line)"}`,
        transition: "border-color .15s ease",
      }}>
        {window.FrameThumb && auction.thumb ? (
          <div style={{ position: "absolute", inset: 0, transform: hover ? "scale(1.03)" : "scale(1)", transition: "transform .35s ease" }}>
            <FrameThumb kind={auction.thumb} usePhoto/>
          </div>
        ) : null}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.35), transparent 40%)" }}></div>
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
          <span style={chip}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: auction.color }}></span>
            {auction.tier}
          </span>
          <span style={{ ...chip, ...(ending ? { background: "var(--c-blood)", border: "none", color: tkc("white") } : {}) }}>
            {ending ? "● ENDING" : `${auction.endsInH}H LEFT`}
          </span>
          {auction.branched && (
            <span style={{ ...chip, background: "rgba(201,85,72,.85)", border: "none", color: tkc("white"), gap: 5 }}>
              {window.PbBranchGlyph ? <window.PbBranchGlyph size={10} color={tkc("white")} dim="rgba(255,255,255,.6)"/> : null}Branched
            </span>
          )}
        </div>
        <button
          title={watch ? "Remove from watchlist" : "Add to watchlist"}
          onClick={(e) => { e.stopPropagation(); setWatch(w => !w); if (window.toast) window.toast({ title: watch ? "REMOVED" : "WATCHING", text: `${auction.projectTitle} · ${auction.tier} ${auction.edition}`, kind: "good" }); }}
          style={{
            position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: "50%",
            background: "rgba(8,8,10,.72)", backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,.12)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: watch ? "var(--c-amber)" : tkc("ink"),
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={watch ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
        </button>
      </div>

      {/* Title + creator — below the image, like Market */}
      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.15, marginTop: 12, color: hover ? "var(--c-amber)" : "var(--c-ink)", transition: "color .15s ease" }}>{auction.projectTitle}</div>
      <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 3 }}>{auction.creator}</div>

      {/* Lead price row — amber serif lead, secondary right-aligned */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 14 }}>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>HIGH BID</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, lineHeight: 1.05, letterSpacing: "-0.01em", color: "var(--c-amber)", marginTop: 3 }}>{auction.currentBid} <span style={{ fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", fontStyle: "normal", color: "var(--c-ink-3)" }}>ETH</span></div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>BUY NOW</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, lineHeight: 1.1, color: "var(--c-ink)", marginTop: 3 }}>{auction.buyItNow} <span style={{ fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", fontStyle: "normal", color: "var(--c-ink-3)" }}>ETH</span></div>
        </div>
      </div>

      {/* Bid heat — same rhythm as Market's funded row + bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 12, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em" }}>
        <span style={{ color: "var(--c-ink)", fontWeight: 700 }}>{auction.bidCount} bids</span>
        <span style={{ color: "var(--c-ink-3)" }}>edition {auction.edition}</span>
      </div>
      <div style={{ height: 3, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden", marginTop: 6 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "var(--c-amber)" }}></div>
      </div>

      {/* Footer — mono meta, like backers / passes left */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em", color: "var(--c-ink-3)" }}>
        <span>seller · {auction.seller}</span>
        <span>{auction.royalty}% royalty</span>
      </div>
    </div>
  );
}

// ─── Auction detail ──────────────────────────────────────────────────
function AuctionDetailPage({ auctionId }) {
  const auction = AUCTIONS.find(a => a.id === auctionId) || AUCTIONS[0];
  const [bid, setBid] = usAu(+(auction.currentBid * 1.05).toFixed(3));
  const [bids, setBids] = usAu(() => synthBids(auction));
  const [ph, setPh] = usAu(false); // place bid overlay

  const place = () => {
    if (bid <= auction.currentBid) { toast(`Bid must exceed ${auction.currentBid} ETH`); return; }
    setBids(b => [{ user: "yo.eth", amount: bid, when: "just now", you: true }, ...b]);
    auction.currentBid = bid;
    auction.bidCount++;
    setBid(+(bid * 1.05).toFixed(3));
    setPh(false);
    toast(`Bid placed · ${bid} ETH`);
  };
  const buyNow = () => {
    const usd = Math.round(auction.buyItNow * 3400);
    if (window.openPay) {
      window.openPay({
        kind: "nft",
        title: auction.projectTitle,
        subtitle: `${auction.tier} · Edition ${auction.edition}`,
        accent: tkc("amber"),
        priceUSD: usd,
        priceNote: `${auction.buyItNow} ETH · buy it now`,
        image: { kind: auction.thumb, color: auction.color },
        perks: tierPerks(auction.tier).map(p => p.title),
        onConfirm: () => { toast(`Owned · ${auction.projectTitle} ${auction.edition}`); },
      });
    } else {
      toast(`Bought · ${auction.buyItNow} ETH`);
    }
  };

  return (
    <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "24px var(--gutter) 80px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 20, fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>
        <button onClick={() => navigate("/auctions")} style={{ background: "transparent", border: "none", color: "var(--c-ink-3)", cursor: "pointer", fontSize: "var(--fs-label)" }}>Auctions</button>
        <span>/</span>
        <span>{auction.tier}</span>
        <span>/</span>
        <span style={{ fontFamily: "var(--f-mono)", color: "var(--c-ink-2)" }}>{auction.edition}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 36, alignItems: "start" }}>
        {/* Left: visuals */}
        <div>
          <div style={{ aspectRatio: "4/5", background: `linear-gradient(135deg, ${auction.color} 0%, ${tkc("black")} 100%)`, padding: 24, position: "relative", marginBottom: 20, overflow: "hidden" }}>
            {window.FrameThumb && auction.thumb ? <div style={{ position: "absolute", inset: 0 }}><FrameThumb kind={auction.thumb} usePhoto/></div> : null}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.9) 0%, rgba(0,0,0,.12) 50%, rgba(0,0,0,.5) 100%)" }}/>
            <div className="t-mono" style={{ position: "relative", fontSize: "var(--fs-label)", color: tkc("white"), opacity: 0.7, letterSpacing: ".16em" }}>EDITION {auction.edition}</div>
            <div style={{ position: "absolute", left: 24, bottom: 24, color: tkc("white") }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", opacity: 0.6 }}>{auction.tier.toUpperCase()}</div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-display)", fontWeight: 400, lineHeight: 0.95, letterSpacing: "-0.01em" }}>{auction.projectTitle}</div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--c-line)", paddingTop: 18 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 10 }}>WHAT YOU GET</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {tierPerks(auction.tier).map((p, i) => (
                <div key={i} style={{ padding: "10px 12px", background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)" }}>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 500 }}>{p.title}</div>
                  <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2 }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: bid panel */}
        <div style={{ position: "sticky", top: 80 }}>
          <div style={{ marginBottom: 18 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>AUCTION · {auction.tier.toUpperCase()}</div>
            <h1 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, letterSpacing: "-0.02em", margin: "6px 0 4px", lineHeight: 1 }}>{auction.projectTitle}</h1>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>by {auction.creator} · sold by <b style={{ color: "var(--c-ink-2)" }}>{auction.seller}</b></div>
          </div>

          {/* Bid summary card */}
          <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>CURRENT HIGH BID</div>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-display)", fontWeight: 400, lineHeight: 1, letterSpacing: "-0.02em", marginTop: 4 }}>{auction.currentBid} <span style={{ fontSize: "var(--fs-lead)", color: "var(--c-ink-3)", fontFamily: "var(--f-mono)" }}>ETH</span></div>
                <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2, fontFamily: "var(--f-mono)" }}>~ ${(auction.currentBid * 3400).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>ENDS IN</div>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 400, color: auction.endsInH < 6 ? "var(--c-blood)" : "var(--c-ink)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{Math.floor(auction.endsInH)}h {Math.floor((auction.endsInH%1)*60)}m</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", paddingTop: 8, borderTop: "1px solid var(--c-line)" }}>
              <span>Reserve · <span style={{ color: "var(--c-ink-2)", fontFamily: "var(--f-mono)" }}>{auction.reservePrice} ETH</span></span>
              <span>{auction.bidCount} bids</span>
              <span>Royalty · {auction.royalty}% to director</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <input type="number" value={bid} step={0.01} onChange={e => setBid(parseFloat(e.target.value)||0)} style={{
                  flex: 1, background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
                  borderRadius: "var(--r-2)", padding: "12px 14px", color: "var(--c-ink)",
                  fontSize: "var(--fs-lead)", fontFamily: "var(--f-mono)",
                }}/>
                <button onClick={() => setPh(true)} style={{ padding: "0 22px", background: "var(--c-amber)", border: "none", color: "var(--c-on-amber)", borderRadius: "var(--r-2)", fontWeight: 600, fontSize: "var(--fs-body)", cursor: "pointer" }}>Place bid</button>
              </div>
              <button onClick={buyNow} style={{ padding: "12px 14px", background: "transparent", border: "1px solid var(--c-amber)", color: "var(--c-amber)", borderRadius: "var(--r-2)", fontWeight: 600, fontSize: "var(--fs-body)", cursor: "pointer" }}>
                Buy it now · {auction.buyItNow} ETH
              </button>
            </div>
          </div>

          {typeof window.BranchedLotContext === "function" && auction.branched && (
            <div style={{ marginTop: 20 }}>
              <window.BranchedLotContext auction={auction}/>
            </div>
          )}

          {/* Bid history */}
          <div style={{ marginTop: 20 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 10 }}>BID HISTORY</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
              {bids.map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", padding: "9px 14px", background: i % 2 ? "transparent" : "var(--c-panel)", borderBottom: i < bids.length - 1 ? "1px solid var(--c-line)" : "none" }}>
                  <span style={{ flex: 1, fontSize: "var(--fs-body)", color: b.you ? "var(--c-amber)" : "var(--c-ink-2)", fontWeight: b.you ? 600 : 400 }}>{b.user} {b.you && "(you)"}</span>
                  <span style={{ width: 100, fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)" }}>{b.amount} ETH</span>
                  <span style={{ width: 80, textAlign: "right", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", fontFamily: "var(--f-mono)" }}>{b.when}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {ph && (
        <div onClick={() => setPh(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(20px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 460, background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>CONFIRM BID</div>
            <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, margin: "4px 0 6px" }}>{bid} ETH</h2>
            <div style={{ background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 14, display: "flex", flexDirection: "column", gap: 6, fontSize: "var(--fs-body)" }}>
              <Row k="Item" v={`${auction.projectTitle} · ${auction.tier} #${auction.edition}`}/>
              <Row k="Bid" v={`${bid} ETH`}/>
              <Row k="Director royalty" v={`${(bid * auction.royalty / 100).toFixed(3)} ETH (${auction.royalty}%)`}/>
              <Row k="Platform fee" v={`${(bid * 0.025).toFixed(3)} ETH (2.5%)`}/>
              <Row k="Seller receives" v={`${(bid * (1 - 0.025 - auction.royalty/100)).toFixed(3)} ETH`} bold/>
            </div>
            <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", lineHeight: 1.5 }}>
              Funds are held in escrow until the auction ends. If outbid, you'll be refunded automatically.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setPh(false)} style={{ padding: "10px 16px", background: "transparent", border: "1px solid var(--c-line-2)", color: "var(--c-ink-2)", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", cursor: "pointer" }}>Cancel</button>
              <button onClick={place} style={{ padding: "10px 22px", background: "var(--c-amber)", border: "none", color: "var(--c-on-amber)", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", fontWeight: 600, cursor: "pointer" }}>Confirm bid</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ k, v, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
      <span style={{ color: "var(--c-ink-3)" }}>{k}</span>
      <span style={{ fontFamily: "var(--f-mono)", color: "var(--c-ink)", fontWeight: bold ? 600 : 400 }}>{v}</span>
    </div>
  );
}

function synthBids(a) {
  const sellers = ["rena_ko","ash.404","park_dr","june_a","tao_reng","void_91","kyle.b"];
  const out = [];
  let p = a.currentBid;
  for (let i = 0; i < 8; i++) {
    out.push({ user: sellers[i % sellers.length], amount: +p.toFixed(3), when: `${i + 1}h ago` });
    p = p / (1 + Math.random() * 0.1);
  }
  return out;
}

function tierPerks(tier) {
  if (tier === "Director's Cut") return [
    { title: "Director's commentary cut",   desc: "Annotated frame-by-frame edit" },
    { title: "On-set voting",               desc: "Cast and DP decisions" },
    { title: "Premiere · top 50",           desc: "Front row, named seat" },
    { title: "1.4% box office",             desc: "Lifetime, royalty stream" },
  ];
  if (tier === "Frame") return [
    { title: "Signed frame NFT",            desc: "Director-selected still" },
    { title: "Shoot day livestream",        desc: "Day 1 of production" },
    { title: "Premiere lobby access",       desc: "Standard seat" },
    { title: "0.4% box office",             desc: "Lifetime stream" },
  ];
  return [
    { title: "Day-of-drop access",          desc: "Watch when the film opens" },
    { title: "Edition badge on profile",    desc: "Shows on Cina forever" },
    { title: "Director Q&A drop",           desc: "Live, holders only" },
    { title: "0.05% box office",            desc: "Lifetime stream" },
  ];
}

// ─── Sell flow — overlay, used from /wallet ──────────────────────────
function CreateAuctionOverlay({ holding, onClose }) {
  const [step, setStep] = usAu(0); // 0 setup, 1 review, 2 listed
  const [reserve, setReserve] = usAu(holding?.basis ? +(holding.basis * 0.9).toFixed(3) : 0.3);
  const [bin, setBin] = usAu(holding?.basis ? +(holding.basis * 1.6).toFixed(3) : 0.8);
  const [duration, setDuration] = usAu(72);

  const list = () => { setStep(2); setTimeout(() => { onClose(); toast("Auction listed · live in 60s"); }, 1500); };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(20px)", zIndex: 250, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 540, background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 32, display: "flex", flexDirection: "column", gap: 22 }}>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>SELL ON THE FLOOR</div>
          <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 500, margin: "6px 0 4px" }}>List your stake</h2>
          {holding && <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>{holding.title} · {holding.tier} · #{holding.edition || "###"}</div>}
        </div>

        {step === 0 && (
          <>
            <Field label="RESERVE PRICE">
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="number" value={reserve} step={0.01} onChange={e => setReserve(parseFloat(e.target.value)||0)} style={inpAu}/>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>ETH</span>
              </div>
              <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 2 }}>The auction won't sell below this. ~ ${(reserve * 3400).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </Field>
            <Field label="BUY IT NOW PRICE">
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="number" value={bin} step={0.01} onChange={e => setBin(parseFloat(e.target.value)||0)} style={inpAu}/>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>ETH</span>
              </div>
              <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 2 }}>Sale closes instantly at this price.</span>
            </Field>
            <Field label="DURATION">
              <div style={{ display: "flex", gap: 6 }}>
                {[24, 72, 168].map(h => (
                  <button key={h} onClick={() => setDuration(h)} style={{
                    flex: 1, padding: "10px 8px", fontSize: "var(--fs-body)",
                    background: duration === h ? "var(--c-amber)" : "transparent",
                    color: duration === h ? tkc("on-amber") : "var(--c-ink-2)",
                    border: `1px solid ${duration === h ? "var(--c-amber)" : "var(--c-line-2)"}`,
                    borderRadius: "var(--r-2)", cursor: "pointer", fontWeight: duration === h ? 600 : 400,
                  }}>{h === 24 ? "1 day" : h === 72 ? "3 days" : "1 week"}</button>
                ))}
              </div>
            </Field>
            <div style={{ background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 12, fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 6 }}>FEES IF SOLD AT BUY-NOW</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Director royalty (8%)</span><span style={{ fontFamily: "var(--f-mono)" }}>{(bin*0.08).toFixed(3)} ETH</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Platform fee (2.5%)</span><span style={{ fontFamily: "var(--f-mono)" }}>{(bin*0.025).toFixed(3)} ETH</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--c-ink)", paddingTop: 6, borderTop: "1px solid var(--c-line)", marginTop: 6 }}><span>You receive</span><span style={{ fontFamily: "var(--f-mono)", fontWeight: 600 }}>{(bin*0.895).toFixed(3)} ETH</span></div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={onClose} style={btnGhostAu} aria-label="Close" title="Close">Cancel</button>
              <button onClick={() => setStep(1)} disabled={reserve >= bin || reserve <= 0} style={{ ...btnGhostAu, background: "var(--c-amber)", border: "none", color: "var(--c-on-amber)", fontWeight: 600, opacity: (reserve >= bin || reserve <= 0) ? 0.4 : 1 }}>Review</button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div style={{ background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 18, display: "flex", flexDirection: "column", gap: 8, fontSize: "var(--fs-body)" }}>
              <Row k="Item" v={holding?.title || "Edition"}/>
              <Row k="Reserve" v={`${reserve} ETH`}/>
              <Row k="Buy now" v={`${bin} ETH`}/>
              <Row k="Duration" v={`${duration} hours`}/>
            </div>
            <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", lineHeight: 1.5 }}>
              Once listed, your stake is held in escrow and can't be sold elsewhere. You can cancel any time before the first bid.
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(0)} style={btnGhostAu}>← Edit</button>
              <button onClick={list} style={{ ...btnGhostAu, background: "var(--c-amber)", border: "none", color: "var(--c-on-amber)", fontWeight: 600 }}>List auction</button>
            </div>
          </>
        )}

        {step === 2 && (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, margin: "0 auto 18px", borderRadius: "50%", background: "rgba(var(--accent-rgb),.12)", border: "1px solid var(--c-amber)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-title)" }}>✦</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500 }}>Listed.</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 8 }}>Goes live on the auction floor in 60 seconds.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Director Mint Flow — full page ──────────────────────────────────
function DirectorMintPage({ filmId }) {
  const film = (typeof getFilm === "function" && getFilm(filmId)) || (CATALOG ? CATALOG[0] : { id: "ll", title: "The Long Look", creator: "Voss" });
  const [step, setStep] = usAu(0);
  const [mint, setMint] = usAu({
    title: film.title,
    totalRaise: 60,         // ETH
    royalty: 8,             // % on secondary
    splits: { director: 70, holders: 22, cina: 5, charity: 3 },
    tiers: [
      { name: "Director's Cut", price: 8.0, supply: 5,  perks: ["Commentary cut","On-set voting","Premiere top 50","1.4% box office"] },
      { name: "Frame",          price: 2.4, supply: 24, perks: ["Signed frame NFT","Shoot livestream","Premiere lobby","0.4% box office"] },
      { name: "Audience",       price: 0.32, supply: 200, perks: ["Day-of-drop access","Edition badge","Holder-only Q&A","0.05% box office"] },
    ],
    governance: ["color-grade","ending","poster"],
    presaleHours: 24,
    closeDays: 14,
  });

  const setSplit = (k, v) => setMint(m => ({ ...m, splits: { ...m.splits, [k]: parseInt(v) } }));
  const splitsTotal = Object.values(mint.splits).reduce((s, v) => s + v, 0);
  const totalSupply = mint.tiers.reduce((s, t) => s + t.supply, 0);
  const projectedRaise = mint.tiers.reduce((s, t) => s + t.price * t.supply, 0);

  const updateTier = (i, patch) => setMint(m => ({ ...m, tiers: m.tiers.map((t,j) => j === i ? {...t, ...patch} : t) }));

  return (
    <div style={{ padding: "0 var(--gutter) 96px", maxWidth: "var(--w-page)", margin: "0 auto" }}>
      <PmMasthead bare index="Director" path="New collection" count={`Step ${step + 1} of 4`} title={<>Mint {mint.title}</>} lede="Set the economic terms, holder perks and on-chain governance. Cina deploys the contract once you approve."/>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: 0, marginBottom: 28, borderBottom: "1px solid var(--c-line)" }}>
        {["Economics","Tiers","Governance","Review & mint"].map((label, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            flex: 1, padding: "14px 12px", background: "transparent",
            border: "none", borderRadius: 0, borderBottom: `2px solid ${step === i ? "var(--c-amber)" : "transparent"}`,
            color: step >= i ? "var(--c-ink)" : "var(--c-ink-4)",
            fontSize: "var(--fs-body)", cursor: "pointer", fontWeight: step === i ? 600 : 400,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: step === i ? "var(--c-amber)" : "var(--c-ink-4)" }}>{String(i+1).padStart(2,"0")}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Step content */}
      {step === 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Field label="COLLECTION TITLE"><input value={mint.title} onChange={e => setMint(m => ({...m, title: e.target.value}))} style={inpAu}/></Field>

            <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 18 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 14 }}>REVENUE SPLIT · NET INCOME FROM FILM</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <SplitRow label="Director" value={mint.splits.director} onChange={v => setSplit("director", v)} accent= "var(--c-amber)"/>
                <SplitRow label="Holders pool" value={mint.splits.holders} onChange={v => setSplit("holders", v)} accent={tkc("good")}/>
                <SplitRow label="Cina platform" value={mint.splits.cina} onChange={v => setSplit("cina", v)} accent="var(--c-ink-3)"/>
                <SplitRow label="Charity" value={mint.splits.charity} onChange={v => setSplit("charity", v)} accent={tkc("cat-2")}/>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, marginTop: 12, borderTop: "1px solid var(--c-line)" }}>
                <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>Total</span>
                <span className="t-mono" style={{ fontSize: "var(--fs-body)", color: splitsTotal === 100 ? tkc("good") : "var(--c-blood)", fontWeight: 600 }}>{splitsTotal}%</span>
              </div>
            </div>

            <Field label="SECONDARY ROYALTY">
              <Slider min={0} max={15} step={0.5} value={mint.royalty} onChange={v => setMint(m => ({...m, royalty: v}))} fmt={(v) => v + "%"}/>
              <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 4 }}>You earn this on every secondary auction, forever.</span>
            </Field>
          </div>

          {/* Live preview / sanity check */}
          <div style={{ position: "sticky", top: 80, alignSelf: "start" }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 12 }}>PROJECTIONS</div>
            <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 22 }}>
              <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--c-line)" }}>
                <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginBottom: 4 }}>Mint sells out</div>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, lineHeight: 1, letterSpacing: "-0.02em" }}>{projectedRaise.toFixed(1)} <span style={{ fontSize: "var(--fs-lead)", fontFamily: "var(--f-mono)", color: "var(--c-ink-3)" }}>ETH</span></div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)", marginTop: 4, fontFamily: "var(--f-mono)" }}>~ ${(projectedRaise * 3400).toLocaleString()}</div>
              </div>
              <SplitBar splits={mint.splits}/>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 14, lineHeight: 1.6 }}>
                If <em>{mint.title}</em> earns 1M USD post-launch:
                <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                  <li>You take ${(1e6 * mint.splits.director/100).toLocaleString()}</li>
                  <li>{totalSupply} holders share ${(1e6 * mint.splits.holders/100).toLocaleString()}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mint.tiers.map((t, i) => (
            <div key={i} style={{ background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 22 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>TIER {String(i+1).padStart(2,"0")}</span>
                <input value={t.name} onChange={e => updateTier(i, { name: e.target.value })} style={{ flex: 1, background: "transparent", border: "none", color: "var(--c-ink)", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500 }}/>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 18, alignItems: "start" }}>
                <Field label="PRICE">
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input type="number" step={0.01} value={t.price} onChange={e => updateTier(i, { price: parseFloat(e.target.value)||0 })} style={inpAu}/>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)" }}>ETH</span>
                  </div>
                </Field>
                <Field label="SUPPLY">
                  <input type="number" value={t.supply} onChange={e => updateTier(i, { supply: parseInt(e.target.value)||0 })} style={inpAu}/>
                  <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 2 }}>{(t.price * t.supply).toFixed(2)} ETH from this tier</span>
                </Field>
                <Field label="PERKS">
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {t.perks.map((p, j) => (
                      <div key={j} style={{ display: "flex", gap: 4 }}>
                        <input value={p} onChange={e => { const next = [...t.perks]; next[j] = e.target.value; updateTier(i, { perks: next }); }} style={inpAu}/>
                        <button onClick={() => updateTier(i, { perks: t.perks.filter((_,k) => k !== j) })} style={{ width: 28, background: "transparent", border: "1px solid var(--c-line-2)", color: "var(--c-blood)", borderRadius: "var(--r-1)", cursor: "pointer", flexShrink: 0 }}>×</button>
                      </div>
                    ))}
                    <button onClick={() => updateTier(i, { perks: [...t.perks, "New perk"] })} style={{ padding: "6px 10px", background: "var(--c-bg)", border: "1px dashed var(--c-line-3)", borderRadius: "var(--r-2)", color: "var(--c-ink-3)", fontSize: "var(--fs-label)", cursor: "pointer" }}>+ Perk</button>
                  </div>
                </Field>
              </div>
            </div>
          ))}
          <button onClick={() => setMint(m => ({ ...m, tiers: [...m.tiers, { name: "New Tier", price: 0.5, supply: 50, perks: ["Perk"] }] }))} style={{ padding: "14px", background: "transparent", border: "1px dashed var(--c-line-3)", borderRadius: "var(--r-2)", color: "var(--c-ink-3)", fontSize: "var(--fs-body)", cursor: "pointer" }}>+ Add tier</button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 8 }}>HOLDER GOVERNANCE</div>
            <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", margin: "0 0 18px", lineHeight: 1.5 }}>What can your holders vote on? Each toggled item triggers an on-chain vote at the right point in production.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { k: "color-grade", title: "Color grade", desc: "Pick between two final color passes." },
                { k: "ending",      title: "Alternate ending", desc: "Two-version vote before final cut." },
                { k: "poster",      title: "Poster art",   desc: "Three options put to a vote." },
                { k: "soundtrack",  title: "Soundtrack",   desc: "Approve composer's first cue." },
                { k: "casting",     title: "Casting",      desc: "Holders vote on supporting cast." },
                { k: "rerun",       title: "Sequel green-light", desc: "Decision after 1 year of revenue." },
              ].map(g => {
                const on = mint.governance.includes(g.k);
                return (
                  <button key={g.k} onClick={() => setMint(m => ({ ...m, governance: on ? m.governance.filter(x => x !== g.k) : [...m.governance, g.k] }))} style={{
                    padding: 14, background: on ? "rgba(var(--accent-rgb),.06)" : "var(--c-panel)",
                    border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`,
                    borderRadius: "var(--r-2)", cursor: "pointer", color: "inherit", textAlign: "left",
                    display: "flex", gap: 12, alignItems: "flex-start",
                  }}>
                    <span style={{ width: 16, height: 16, borderRadius: "var(--r-1)", background: on ? "var(--c-amber)" : "var(--c-bg)", border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-label)", color: "var(--c-on-amber)", fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{on && "✓"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "var(--fs-body)", fontWeight: 500 }}>{g.title}</div>
                      <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 2 }}>{g.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ position: "sticky", top: 80, alignSelf: "start" }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 12 }}>SCHEDULE</div>
            <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
              <Field label="HOLDER PRESALE WINDOW (HOURS)">
                <Slider min={0} max={72} step={6} value={mint.presaleHours} onChange={v => setMint(m => ({...m, presaleHours: v}))} fmt={(v) => v + "h"}/>
              </Field>
              <Field label="MINT WINDOW (DAYS)">
                <Slider min={1} max={30} step={1} value={mint.closeDays} onChange={v => setMint(m => ({...m, closeDays: v}))} fmt={(v) => v + "d"}/>
              </Field>
              <div style={{ paddingTop: 14, borderTop: "1px solid var(--c-line)", fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6 }}>
                Existing Cina holders can mint <b style={{ color: "var(--c-amber)" }}>{mint.presaleHours}h</b> before public, then anyone can mint for <b style={{ color: "var(--c-amber)" }}>{mint.closeDays} days</b>. Unsold supply is burned.
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 36 }}>
          <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>READY TO DEPLOY</div>
            <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 500, margin: 0 }}>{mint.title}</h2>
            <SummaryRow k="Total raise (max)" v={`${projectedRaise.toFixed(1)} ETH (~ $${(projectedRaise*3400).toLocaleString()})`}/>
            <SummaryRow k="Total supply" v={`${totalSupply} editions across ${mint.tiers.length} tiers`}/>
            <SummaryRow k="Director split" v={`${mint.splits.director}% of net film income`}/>
            <SummaryRow k="Holders split" v={`${mint.splits.holders}% of net film income`}/>
            <SummaryRow k="Secondary royalty" v={`${mint.royalty}% on every resale, forever`}/>
            <SummaryRow k="Governance votes" v={mint.governance.length ? mint.governance.join(", ") : "None"}/>
            <SummaryRow k="Schedule" v={`${mint.presaleHours}h presale → ${mint.closeDays}d open mint`}/>

            <div style={{ background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 14, fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6, marginTop: 8 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 6 }}>WHAT HAPPENS NEXT</div>
              Cina deploys the contract on Base (~$8 gas). You sign once. The mint page goes live at the time you set. Holders can resell on the auction floor immediately — every resale earns you {mint.royalty}%.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 80, alignSelf: "start" }}>
            <button onClick={() => {
              // Deploy confirms through the one slide-in payment surface (PayDrawer).
              if (window.openPay) {
                window.openPay({
                  kind: "license",
                  title: mint.title,
                  subtitle: "PRODUCER COLLECTION · BASE",
                  accent: tkc("amber"),
                  priceUSD: 8,
                  items: [
                    { label: "Deploy contract", sub: "ERC-721 · EIP-2981 royalty " + mint.royalty + "%", price: 8 },
                    { label: "Tiers", sub: mint.tiers.map(t => t.name).join(" · "), price: 0 },
                    { label: "Governance", sub: mint.governance.join(", ") || "none", price: 0 },
                  ],
                  perks: [
                    `Max raise ${projectedRaise.toFixed(1)} ETH across ${totalSupply} passes`,
                    `${mint.presaleHours}h presale · closes in ${mint.closeDays} days`,
                    "Gas refunded from the first edition sold",
                  ],
                  image: { kind: "darkroom-est" },
                  onConfirm: () => { toast(`${mint.title} deployed · contract live in 90s`); setTimeout(() => navigate(`/nft/${film.id}`), 800); },
                });
              } else { toast(`${mint.title} deployed · contract live in 90s`); setTimeout(() => navigate(`/nft/${film.id}`), 800); }
            }} style={{ padding: "16px 22px", background: "var(--c-amber)", border: "none", color: "var(--c-on-amber)", borderRadius: "var(--r-2)", fontSize: "var(--fs-lead)", fontWeight: 700, cursor: "pointer" }}>Sign &amp; deploy contract</button>
            <button onClick={() => setStep(2)} style={btnGhostAu}>← Adjust governance</button>
            <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", lineHeight: 1.5, marginTop: 4 }}>
              You'll be asked to sign with your wallet. Cina covers the deploy gas — refunded from the first edition sold.
            </div>
          </div>
        </div>
      )}

      {/* Step nav */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 18, borderTop: "1px solid var(--c-line)" }}>
        <button onClick={() => setStep(s => Math.max(0, s-1))} disabled={step === 0} style={{ ...btnGhostAu, opacity: step === 0 ? 0.3 : 1 }}>← Back</button>
        {step < 3 && <button onClick={() => setStep(s => s+1)} style={{ ...btnGhostAu, background: "var(--c-amber)", border: "none", color: "var(--c-on-amber)", fontWeight: 600 }}>Continue →</button>}
      </div>
    </div>
  );
}

function SplitRow({ label, value, onChange, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 110, fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{label}</span>
      <input type="range" min={0} max={100} value={value} onChange={e => onChange(e.target.value)} style={{ flex: 1, accentColor: accent }}/>
      <span style={{ width: 50, textAlign: "right", fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: accent }}>{value}%</span>
    </div>
  );
}

function SplitBar({ splits }) {
  const colors = { director: "var(--c-amber)", holders: tkc("good"), cina: "var(--c-ink-3)", charity: tkc("cat-2") };
  const total = Object.values(splits).reduce((s,v) => s + v, 0) || 1;
  return (
    <>
      <div style={{ display: "flex", height: 8, borderRadius: "var(--r-1)", overflow: "hidden", marginBottom: 8 }}>
        {Object.entries(splits).map(([k,v]) => v > 0 && <div key={k} style={{ width: `${v/total*100}%`, background: colors[k] }}/>)}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: "var(--fs-label)" }}>
        {Object.entries(splits).map(([k,v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, background: colors[k], borderRadius: "var(--r-1)" }}/>
            <span style={{ color: "var(--c-ink-3)", textTransform: "capitalize" }}>{k}</span>
            <span style={{ fontFamily: "var(--f-mono)", color: "var(--c-ink-2)" }}>{v}%</span>
          </div>
        ))}
      </div>
    </>
  );
}

function SummaryRow({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--c-line)" }}>
      <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>{k}</span>
      <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontFamily: "var(--f-sans)", fontWeight: 500, maxWidth: 360, textAlign: "right" }}>{v}</span>
    </div>
  );
}

const inpAu = {
  width: "100%", background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
  borderRadius: "var(--r-2)", padding: "10px 12px", color: "var(--c-ink)",
  fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)",
};
const btnGhostAu = {
  padding: "10px 18px", background: "transparent",
  border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
  color: "var(--c-ink-2)", fontSize: "var(--fs-body)", cursor: "pointer",
};

Object.assign(window, { AuctionMarketPage, AuctionDetailPage, DirectorMintPage, AUCTIONS, auTierPerks: tierPerks, auSynthBids: synthBids });
