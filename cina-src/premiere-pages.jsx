// premiere-pages.jsx — Film page, Wallet and Auction floor on the Premiere system,
// plus the frame that gives every remaining page the same width, type and rules.

function PmFilm({ filmId }) {
  const film = window.getFilm ? getFilm(filmId) : pmFilm(filmId);
  const kidHook = typeof useKidMode === "function" ? useKidMode() : [false];
  const kid = kidHook[0];
  const [unlocked, setUnlocked] = usPm(() => !!(film && window.libraryOwns && libraryOwns(film.id)));
  const [sheetOpen, setSheetOpen] = usPm(false);
  const [trailerOpen, setTrailerOpen] = usPm(false);
  const [tab, setTab] = usPm("overview");
  const [, bump] = usPm(0);
  const isMobile = typeof useIsMobile === "function" ? useIsMobile() : false;
  if (!film) return <div className="pm"><PmMasthead index="—" path="Films" title="Film not found"><button className="pm-btn" onClick={() => pmGo("/genre/film")}>All films</button></PmMasthead></div>;
  const rating = typeof computeRating === "function" ? computeRating(film) : { rating: film.cert || "NR", blocked: false };
  const blocked = kid && rating.blocked;
  const creator = window.getCreator ? getCreator(film.creatorId) : null;
  const nft = (window.NFT_PROJECTS || {})[film.nft];
  const trophy = typeof topTrophy === "function" ? topTrophy(film.id) : null;

  const handlePick = (opt) => {
    if (opt.id === "nft") { pmGo(`/nft/${film.nft}`); return; }
    if (opt.id === "free") {
      setUnlocked(true); setSheetOpen(false);
      window.libraryRecord && libraryRecord({ filmId: film.id, kind: "free", price: 0 });
      window.toast && toast({ title: "PLAYING", text: `${film.title} · with ads`, kind: "good" });
      return;
    }
    setSheetOpen(false);
    if (!window.openPay) return;
    const subPrice = creator?.sub || 7.99;
    const cfg = {
      rent: { kind: "rent", priceUSD: film.rent, title: `Rent ${film.title}`, subtitle: `${film.year} · ${film.runtime}`, perks: ["48 hours from first play", "Stream in 4K HDR", "Re-rent any time"] },
      buy: { kind: "buy", priceUSD: film.buy, title: `Buy ${film.title}`, subtitle: `${film.year} · ${film.runtime}`, perks: ["Yours forever · stream on any device", "Includes director's cut + commentary", "Download for offline viewing"] },
      sub: { kind: "sub", priceUSD: subPrice, recurring: "month", title: `Subscribe to ${film.creator}`, subtitle: "Every film from this creator", perks: ["Every film this creator publishes", "24h early access on new drops", "Behind-the-scenes vault + dailies", "Cancel anytime"] },
    }[opt.id];
    openPay({ ...cfg, accent: film.color || tkc("amber"), image: { kind: film.thumb, color: film.color }, ticker: film.id,
      onConfirm: () => { setUnlocked(true); window.libraryRecord && libraryRecord({ filmId: film.id, kind: opt.id, price: cfg && cfg.priceUSD }); } });
  };
  const report = async () => {
    const ok = await (window.cinaConfirm ? cinaConfirm({ kicker: "Report this title", title: `Flag “${film.title}” for review?`, body: "A programmer reads every report. Tell us what's wrong and we'll look at the print, the rating, or the rights.", confirmLabel: "Send report" }) : Promise.resolve(false));
    if (ok && window.toast) toast({ title: "REPORT SENT", text: `A programmer will review ${film.title}.`, kind: "good" });
  };
  const share = () => (window.cinaCopyShareLink ? cinaCopyShareLink(film) : window.toast && toast({ title: "LINK COPIED", text: film.title }));
  const more = (window.CATALOG || []).filter(f => f.creatorId === film.creatorId && f.id !== film.id);
  const like = (window.CATALOG || []).filter(f => f.id !== film.id && f.creatorId !== film.creatorId && (f.genre || []).some(g => (film.genre || []).includes(g))).slice(0, 12);
  const price = film.free ? "Watch free" : film.rent ? `Rent · $${film.rent}` : film.buy ? `Buy · $${film.buy}` : "Watch now";
  const [first, ...rest] = (film.synopsis || "").split(". ");
  const pNote = (window.PROGRAMMER_NOTES || {})[film.id];
  const noteObj = pNote ? { body: pNote.split(/(?<=[.!?])\s/)[0], who: (window.PROGRAMMER && PROGRAMMER.name) || "Cina programmer" } : null;
  const ratingBadge = typeof RatingBadge === "function" ? <RatingBadge rating={rating.rating} size="sm"/> : rating.rating;

  const actions = <>
    <button className="pm-btn pm-btn--primary" onClick={() => unlocked ? pmScrollTo(0) : setSheetOpen(true)}><Icon name="play" size={13}/>{unlocked ? "Playing" : price}</button>
    <PmWatchlistBtn film={film} glass icon/>
    <button className="pm-btn pm-btn--glass" onClick={() => setTrailerOpen(true)}><Icon name="film" size={14}/>Trailer</button>
    <button className="pm-btn pm-btn--glass" onClick={share}><Icon name="share" size={14}/>Share</button>
    {film.nftPremiere && nft && <button className="pm-btn pm-btn--glass" onClick={() => pmGo(`/nft/${film.nft}`)}><Icon name="ticket" size={14}/>Co-finance this film</button>}
    {window.openCreateParty && <button className="pm-btn pm-btn--glass" onClick={() => openCreateParty(film)}><Icon name="users" size={14}/>Start a watch party</button>}
    <button className="pm-btn pm-btn--glass" onClick={report}><Icon name="flag" size={14}/>Report</button>
  </>;
  const meta = [film.year, (film.genre || [])[0], film.runtime, <>★ {film.rating}</>, ratingBadge];

  return (
    <div className="pm" data-screen-label={`Film · ${film.title}`}>
      {trailerOpen && typeof TrailerModal === "function" && <TrailerModal film={film} onClose={() => setTrailerOpen(false)}/>}
      {sheetOpen && typeof UnlockSheet === "function" && <UnlockSheet film={film} onPick={handlePick} onClose={() => setSheetOpen(false)}/>}

      {unlocked && !blocked && typeof Player === "function" ? (
        <>
          <div id="player-anchor" style={{ background: tkc("black") }}><div style={{ maxWidth: "var(--w-page)", margin: "0 auto" }}><Player film={film} autoplay={!film.free}/></div></div>
          <header className="pm-wrap" style={{ paddingTop: 28, display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <h1 className="pm-xl" style={{ fontSize: "clamp(32px,3.6vw,52px)" }}>{film.title}</h1>
              <div className="pm-hero__meta">{meta.map((v, i) => <span key={i}>{v}</span>)}</div>
            </div>
            <PmActionRow>{actions}</PmActionRow>
          </header>
        </>
      ) : (
        <PmHero image={film.thumb} color={film.color}
          kicker={<><b>Cina original</b> · {pmCreatorName(film)}</>}
          title={film.title} lede={film.logline || first} actions={actions} note={noteObj}
          facts={meta.map((v, i) => [String(i), v])}/>
      )}

      {blocked && unlocked && typeof KidLockCard === "function" && <section className="pm-wrap" style={{ maxWidth: 520, marginTop: 40 }}><KidLockCard film={film}/></section>}

      <PmTabs value={tab} onChange={setTab} tabs={[["overview", "Overview"], ["like", "More like this"], ["extras", "Extras"], ["details", "Details"]]}/>

      {tab === "overview" && <>
        <section className="pm-sec pm-wrap">
          <div className="pm-dossier">
            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              <span className="pm-k"><b>Synopsis</b></span>
              <p style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "clamp(1.35rem, 2.05vw, 1.9rem)", lineHeight: 1.28, letterSpacing: "-0.01em", textWrap: "pretty", color: "var(--c-ink)" }}>
                {first}{rest.length ? "." : ""}
              </p>
              {rest.length > 0 && (
                <p className="pm-lede" style={{ maxWidth: "62ch" }}>{rest.join(". ")}</p>
              )}
              {pNote && (
                <div className="pm-quote" style={{ marginTop: "0.35rem" }}>
                  <blockquote style={{ fontSize: "clamp(1rem, 1.25vw, 1.2rem)" }}>“{pNote}”</blockquote>
                  <span className="pm-k"><b>{(window.PROGRAMMER && PROGRAMMER.name) || "Ada Beresford"}</b> · Programmer's Dossier</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <dl className="pm-dossier__specs" style={{ margin: 0 }}>
                <div>
                  <dt>Director & Studio</dt>
                  <dd>
                    <button className="pm-link" style={{ color: "var(--c-ink)", textDecoration: "underline", textUnderlineOffset: "3px" }} onClick={() => pmGo(`/studios/${film.creatorId}`)}>
                      {creator ? creator.name : pmCreatorName(film)} ›
                    </button>
                  </dd>
                </div>
                <div>
                  <dt>Runtime & Year</dt>
                  <dd>{film.runtime} · {film.year}</dd>
                </div>
                <div>
                  <dt>Genre</dt>
                  <dd>{(film.genre || []).join(" · ") || "Independent"}</dd>
                </div>
                <div>
                  <dt>Audience Score</dt>
                  <dd><span style={{ color: "var(--c-amber)" }}>★ {film.rating}</span> · {pmNum(film.ratings || 0)} ratings</dd>
                </div>
                {film.moods && film.moods.length > 0 && (
                  <div style={{ gridColumn: "1 / -1", paddingTop: "0.65rem", borderTop: "1px solid var(--c-line)" }}>
                    <dt>Atmosphere & Tone</dt>
                    <dd style={{ color: "var(--c-ink-2)", textTransform: "capitalize" }}>{film.moods.join(" · ")}</dd>
                  </div>
                )}
              </dl>

              {nft && (
                <div className="pm-panel" style={{ display: "flex", flexDirection: "column", gap: "0.65rem", padding: "1.1rem 1.35rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                    <span className="pm-k"><b>Producer Pass</b> · {nft.daysLeft}d left</span>
                    <span className="pm-k">{nft.revShare}% rev share</span>
                  </div>
                  <div style={{ height: 3, background: "var(--c-line-2)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(100, (nft.raised / nft.goal) * 100)}%`, background: "var(--c-amber)" }}/>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                    <span className="pm-card__m">${pmNum(nft.raised)} of ${pmNum(nft.goal)} · {nft.backers} backers</span>
                    <button className="pm-link" style={{ color: "var(--c-amber)", fontSize: "0.78rem" }} onClick={() => pmGo(`/nft/${nft.id}`)}>Inspect pass ›</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {typeof FilmCastRow === "function" && (
          <PmSection title="Cast & Performers" note="Credited ensemble" link="Performer Vault" onLink={() => pmGo("/cast")}>
            <FilmCastRow filmId={film.id} hideHeader/>
          </PmSection>
        )}

        {more.length >= 3 ? (
          <PmRailSection title={`More from ${creator ? creator.name : pmCreatorName(film)}`} link="Visit Studio" onLink={() => pmGo(`/studios/${film.creatorId}`)}>
            {more.map(f => <PmPoster key={f.id} film={f}/>)}
          </PmRailSection>
        ) : more.length > 0 ? (
          <PmSection title={`More from ${creator ? creator.name : pmCreatorName(film)}`} note="Companion works & studio house" link="Visit Studio" onLink={() => pmGo(`/studios/${film.creatorId}`)}>
            <div className="pm-duo" style={{ alignItems: "stretch" }}>
              {more.map(f => (
                <PmStill key={f.id} film={f} sub={f.logline}/>
              ))}
              {more.length === 1 && creator && window.DirectorStudioCard && (
                <DirectorStudioCard film={film}/>
              )}
            </div>
          </PmSection>
        ) : null}

        {like.length > 0 && (
          <PmRailSection title="Recommended Screening" note={`Paired with ${film.title}`} link="See All Similar" onLink={() => setTab("like")}>
            {like.slice(0, 8).map(f => <PmPoster key={f.id} film={f}/>)}
          </PmRailSection>
        )}

        <PmSection title="Audience Reviews">
          {window.ReviewsAndRatings ? <ReviewsAndRatings film={film} hideHeader/> : typeof ReviewsList === "function" && <ReviewsList film={film}/>}
        </PmSection>
      </>}

      {tab === "like" && <>
        {like.length > 0 ? <PmSection title="More like this" note={(film.genre || []).join(" · ")}><div className="pm-grid">{like.map(f => <PmPoster key={f.id} film={f}/>)}</div></PmSection>
          : <PmSection title="More like this"><p className="pm-lede">Nothing close enough yet.</p></PmSection>}
      </>}

      {tab === "extras" && <>
        <PmSection title="Trailer and notes">
          <div className="pm-duo" style={{ alignItems: "start" }}>
            <PmStill film={film} title="Official trailer" meta="1:42" onClick={() => setTrailerOpen(true)}/>
            {typeof FromTheProgrammer === "function" ? <FromTheProgrammer film={film}/> : noteObj && <div className="pm-quote"><blockquote>“{pNote}”</blockquote><span className="pm-k">{noteObj.who}</span></div>}
          </div>
        </PmSection>
        {creator && typeof FromTheDirector === "function" && <PmSection title="From the director"><FromTheDirector film={film} creator={creator}/></PmSection>}
        <PmSection title="Behind the film">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 16, alignItems: "start" }}>
            {creator && window.DirectorStudioCard && <DirectorStudioCard film={film}/>}
            {nft && (
              <div className="pm-panel" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <span className="pm-k"><b>Co-finance</b> · {nft.daysLeft} days left</span>
                <span className="pm-h2">Own a piece of {film.title}</span>
                <p className="pm-lede" style={{ fontSize: "var(--fs-body)" }}>Holders get the premiere window, behind-the-scenes access and a share of revenue.</p>
                <div style={{ height: 4, borderRadius: 2, background: "var(--c-line-2)", overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(100, nft.raised / nft.goal * 100)}%`, background: "var(--c-amber)" }}></div></div>
                <span className="pm-card__m">${pmNum(nft.raised)} of ${pmNum(nft.goal)} · {nft.backers} backers</span>
                <div><button className="pm-btn pm-btn--primary pm-btn--sm" onClick={() => pmGo(`/nft/${nft.id}`)}>See the tiers</button></div>
              </div>
            )}
            {film.publishedByYou && film.studioProjectId && (
              <div className="pm-panel" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <span className="pm-k" style={{ color: "var(--c-good)" }}>Made in Cina Studio{film.studioCode ? ` · ${film.studioCode}` : ""}</span>
                <span className="pm-h2">You shipped this film.</span>
                <p className="pm-lede" style={{ fontSize: "var(--fs-body)" }}>Track its first views and royalties back in the editor.</p>
                <div><button className="pm-btn pm-btn--sm" onClick={() => { try { localStorage.setItem("cina:studio-open", film.studioProjectId); } catch (e) {} window.location.href = "Cina.html"; }}>Open in Studio</button></div>
              </div>
            )}
          </div>
        </PmSection>
      </>}

      {tab === "details" && (
        <PmSection title="Details">
          <PmFacts items={[["Director", film.creator], ["Runtime", film.runtime], ["Year", film.year], ["Genre", (film.genre || []).join(", ")], ["Certificate", rating.rating], ["Rating", `★ ${film.rating} · ${pmNum(film.ratings)} ratings`], ["Viewers", pmNum(film.views)], trophy ? ["Festival", `${trophy.award}${trophy.edition ? " · Edition " + trophy.edition : ""}`] : null, film.tags ? ["Tags", film.tags.join(", ")] : null].filter(Boolean)}/>
        </PmSection>
      )}

      {isMobile && !unlocked && !blocked && (
        <div className="pm-mobilebar" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40, background: "rgba(10,10,10,.96)", backdropFilter: "blur(18px)", borderTop: "1px solid var(--c-line)", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}><div className="pm-card__t">{film.title}</div><div className="pm-card__m">{film.year} · {film.runtime}</div></div>
          <button className="pm-btn pm-btn--primary" onClick={() => setSheetOpen(true)}><Icon name="play" size={13}/>{price}</button>
        </div>
      )}
    </div>
  );
}

function PmWallet({ embedded } = {}) {
  if (typeof window.useChainLedger === "function") window.useChainLedger();
  const U = window.USER || { holdings: [], txHistory: [] };
  const P = window.NFT_PROJECTS || {};
  const usd = (n) => "$" + Math.round(n).toLocaleString();
  const held = U.holdings.filter(h => h.qty > 0);
  const invested = held.reduce((s, h) => s + h.costBasis * h.qty * 2700, 0);
  const value = held.reduce((s, h) => s + h.currentPrice * h.qty * 2700, 0);
  const gain = value - invested, pct = invested > 0 ? gain / invested * 100 : 0;
  const pays = (U.txHistory || []).filter(t => t.kind === "royalty");
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const leadHeldFilm = held[0] ? (window.CATALOG || []).find(x => x.nft === held[0].projectId) : (window.CATALOG || [])[0];

  return (
    <div className="pm" data-screen-label="Wallet">
      {!embedded && (
        <PmHero
          short
          image={leadHeldFilm?.thumb}
          color={leadHeldFilm?.color || tkc("black")}
          kicker={<><b>On-Chain Portfolio &amp; Chained Splits</b> — {U.ens || U.handle || "you.eth"}</>}
          title="Films You've Backed"
          lede="Every rental, purchase, and producer mint settles atomically through CinaSplitRouter.sol on Base L2 — streaming USDC dividends directly to your wallet."
          facts={[
            ["Liquid Balance", usd(U.walletUSD || 0)],
            ["Stakes Value", `${usd(value)} (${gain >= 0 ? "+" : ""}${pct.toFixed(1)}%)`],
            ["Chained Dividends", usd(U.totalEarned || 0)],
            ["Active Stakes", `${held.length} films`],
          ]}
          actions={<>
            <button className="pm-btn pm-btn--primary" onClick={() => pmGo("/wallet/buy")}>Add Funds</button>
            <button className="pm-btn pm-btn--glass" onClick={() => pmGo("/payouts")}>Creator Payouts</button>
            <button className="pm-btn pm-btn--glass" onClick={() => pmGo("/auctions")}>Auction Floor</button>
            <button className="pm-btn pm-btn--glass" onClick={() => { window.location.href = "Producers.html#market"; }}>Producer Market →</button>
          </>}
        />
      )}

      <section className="pm-wrap" style={{ marginTop: embedded ? 0 : "1.75rem" }}>
        <div className="pm-stats pm-panel">
          <div className="pm-stat"><span className="pm-k">Liquid Wallet</span><span className="pm-stat__v">{usd(U.walletUSD || 0)}</span><span className="pm-k">{U.address || "Base L2"}</span></div>
          <div className="pm-stat"><span className="pm-k">Invested Stakes</span><span className="pm-stat__v">{usd(value)}</span><span className="pm-k" style={{ color: gain >= 0 ? "var(--c-good)" : "var(--c-blood-l)" }}>{gain >= 0 ? "+" : ""}{pct.toFixed(1)}% vs cost</span></div>
          <div className="pm-stat"><span className="pm-k">Auto-Paid Dividends</span><span className="pm-stat__v" style={{ color: "var(--c-amber)" }}>{usd(U.totalEarned || 0)}</span><span className="pm-k">Chained splits</span></div>
          <div className="pm-stat"><span className="pm-k">Accrued Stream Pool</span><span className="pm-stat__v">{usd(U.pendingClaim || 0)}</span><span className="pm-k">Auto-settled live</span></div>
        </div>
      </section>

      {window.ChainedSplitRouterPanel && (
        <PmSection n="01" title="Smart-Contract Chained Split Router" note="CinaSplitRouter.sol · Atomic investor auto-payouts on Base L2">
          <window.ChainedSplitRouterPanel defaultProject={held[0]?.projectId || "voss-ll"}/>
        </PmSection>
      )}

      <PmSection n="02" title="Backed Film Stakes" note={`${held.length} active positions`}>
        <div className="pm-index">
          {held.map((h, i) => {
            const p = P[h.projectId], f = (window.CATALOG || []).find(x => x.nft === h.projectId);
            const cost = h.costBasis * h.qty * 2700, val = h.currentPrice * h.qty * 2700, d = cost > 0 ? (val - cost) / cost * 100 : 0;
            return (
              <button key={i} className="pm-hold" onClick={() => pmGo(`/nft/${h.projectId}`)} style={{ gridTemplateColumns: "10% minmax(0,1fr) auto", alignItems: "center" }}>
                <span className="pm-card__img" style={{ aspectRatio: "16/9", width: "100%", background: f?.color }}>{f && <PmImg kind={f.thumb}/>}</span>
                <span style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: 0 }}>
                  <span className="pm-card__t" style={{ fontSize: "var(--fs-title)", fontStyle: "italic", fontFamily: "var(--f-display)" }}>{p?.title || h.projectId}</span>
                  <span className="pm-k">{h.tier} · {h.qty}× · {p?.creator}</span>
                </span>
                <span className="pm-hold__stats" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(5.5rem, auto))", gap: "1.25rem", textAlign: "right" }}>
                  <span className="pm-stat"><span className="pm-k">Cost</span><span>{usd(cost)}</span></span>
                  <span className="pm-stat"><span className="pm-k">Value</span><span>{usd(val)} <span style={{ color: d >= 0 ? "var(--c-good)" : "var(--c-blood-l)", fontSize: "var(--fs-label)" }}>{d >= 0 ? "+" : ""}{d.toFixed(1)}%</span></span></span>
                  <span className="pm-stat"><span className="pm-k">Dividends</span><span style={{ color: "var(--c-amber)" }}>{usd(h.earned)}</span></span>
                </span>
              </button>
            );
          })}
        </div>
      </PmSection>

      {pays.length > 0 && (
        <PmSection n="03" title="Chained Investor Payout Ledger" note="Real-time smart-contract distributions" link="All payouts" onLink={() => pmGo("/payouts")}>
          <div className="pm-index">
            {pays.map((r, i) => {
              const [, m, d] = (r.d || "2026-05-12").split("-");
              return (
                <button key={i} onClick={() => pmGo(`/nft/${r.project}`)} style={{ gridTemplateColumns: "12% minmax(0,1fr) auto" }}>
                  <span className="pm-k"><b>{mon[(parseInt(m, 10) || 5) - 1]} {d}</b></span>
                  <span style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <span className="pm-card__t" style={{ fontSize: "var(--fs-lead)" }}>{P[r.project]?.title || r.project}</span>
                    <span className="pm-k">{r.desc}</span>
                  </span>
                  <span className="pm-stat__v" style={{ fontSize: "var(--fs-title)", color: "var(--c-good)" }}>+{usd(r.amount)}</span>
                </button>
              );
            })}
          </div>
        </PmSection>
      )}

      {embedded && (
        <PmSection title="Open offerings" note="Back a film in production" link="Auction floor" onLink={() => pmGo("/auctions")}>
          <div className="pm-grid pm-grid--wide">
            {Object.values(P).filter(x => x.daysLeft > 0 && !x.synthetic).map(x => {
              const f = (window.CATALOG || []).find(c => c.nft === x.id);
              return <PmStill key={x.id} film={f || { thumb: x.thumb, color: x.color, title: x.title }} title={x.title} badge={{ t: `${x.daysLeft} days left` }}
                meta={`${usd(x.raised)} of ${usd(x.goal)} · ${x.revShare}% rev share`} sub={x.creator} onClick={() => pmGo(`/nft/${x.id}`)}/>;
            })}
          </div>
        </PmSection>
      )}
    </div>
  );
}

function PmAuctions() {
  const A = window.AUCTIONS || [];
  const [filter, setFilter] = usPm("all");
  const [sort, setSort] = usPm("ending");
  const [shown, setShown] = usPm(24);
  const branched = typeof HAS_BRANCHED_LOTS !== "undefined" && HAS_BRANCHED_LOTS;
  let list = filter === "all" ? A : filter === "branched" ? A.filter(a => a.branched) : A.filter(a => a.tierKey === filter);
  list = [...list].sort((a, b) => sort === "ending" ? a.endsInH - b.endsInH : sort === "price-low" ? a.currentBid - b.currentBid : sort === "price-high" ? b.currentBid - a.currentBid : b.bidCount - a.bidCount);
  const tvl = A.reduce((s, a) => s + a.currentBid, 0);
  const filters = [["all", "All"], ["directors-cut", "Director's cut"], ["frame", "Frame"], ["audience", "Audience"], ...(branched ? [["branched", "Branched rights"], ["canonical-cut", "Canonical cuts"]] : [])];
  const lead = list[0] || A[0];

  return (
    <div className="pm" data-screen-label="Auctions">
      <PmHero
        short
        image={lead?.thumb}
        color={lead?.color || tkc("black")}
        kicker={<><b>Secondary Market · Live</b> — {A.length} active lots</>}
        title="The Auction Floor"
        lede="Pass holders auctioning producer stakes, canonical cuts, and 1-of-1 frames. Every secondary settlement routes an 8% royalty back to the director automatically."
        facts={[
          ["Live Lots", A.length],
          ["Volume Locked", `${tvl.toFixed(1)} ETH`],
          ["Closing < 6h", A.filter(a => a.endsInH < 6).length],
          ["Director Royalty", "8% auto-split"],
        ]}
        actions={<>
          {lead && (
            <button className="pm-btn pm-btn--primary" onClick={() => pmGo(`/auctions/${lead.id}`)}>
              Inspect {lead.projectTitle} ({lead.currentBid} ETH)
            </button>
          )}
          <button className="pm-btn pm-btn--glass" onClick={() => pmGo("/wallet")}>Your Stakes</button>
        </>}
      />

      <PmSection n="01" title="Active Lots" note={`${list.length} shown`}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", marginBottom: "1.5rem" }}>
          <PmChips options={filters.map(([value, label]) => ({ value, label }))} value={filter} onChange={setFilter}/>
          <span className="pm-sep"/>
          <PmChips options={[{ value: "ending", label: "Ending soon" }, { value: "bids", label: "Most active" }, { value: "price-low", label: "Price ↑" }, { value: "price-high", label: "Price ↓" }]} value={sort} onChange={setSort}/>
        </div>
        {list.length ? (
          <div className="pm-grid pm-grid--wide">
            {list.slice(0, shown).map(a => typeof AuctionCard === "function" ? <AuctionCard key={a.id} auction={a}/> : null)}
          </div>
        ) : (
          <p className="pm-lede">No lots in this category right now.</p>
        )}
        {list.length > shown && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1.75rem" }}>
            <button className="pm-btn" onClick={() => setShown(n => n + 24)}>
              Show {Math.min(24, list.length - shown)} more · {list.length - shown} left
            </button>
          </div>
        )}
      </PmSection>
    </div>
  );
}

// Co-finance (producer pass) page — wired to CinaSplitRouter.sol smart-contract minting.
function PmNFT({ projectId }) {
  if (typeof window.useChainLedger === "function") window.useChainLedger();
  const project = (window.NFT_PROJECTS || {})[projectId];
  const film = project ? (window.CATALOG || []).find(f => f.nft === project.id) || project.film : null;
  const [checkout, setCheckout] = usPm(null);
  const [, bump] = usPm(0);

  if (!project) {
    return (
      <div className="pm">
        <PmMasthead index="—" path="Co-finance" title="Pass not found" lede={projectId ? `No producer pass with the ID “${projectId}”. The offering may have closed.` : "No project ID in the link."}>
          <button className="pm-btn" onClick={() => pmGo("/wallet")}>Browse open offerings</button>
        </PmMasthead>
      </div>
    );
  }
  const usd = window.fmtNftUSD || ((n) => "$" + Math.round(n).toLocaleString());
  const pct = Math.min(100, project.raised / project.goal * 100);
  const chain = project.chain || "Base L2";
  const title = film?.title || project.title;
  const sold = project.tiers.reduce((s, t) => s + t.sold, 0), count = project.tiers.reduce((s, t) => s + t.count, 0);
  const thumb = project.thumb || film?.thumb;
  const open = project.tiers.filter(t => t.count - t.sold > 0);
  const cheapest = open.length ? open.reduce((a, b) => (a.priceUSD || 0) <= (b.priceUSD || 0) ? a : b) : null;
  const Heart = window.HeartButton;
  let n = 0; const N = () => String(++n).padStart(2, "0");

  const startSmartMint = (tier) => {
    if (!tier) return;
    if (window.openPay) {
      window.openPay({
        kind: "nft",
        projectId: project.id,
        ticker: film?.id || project.id,
        title: `Mint ${tier.name} Pass · ${title}`,
        subtitle: `${project.revShare}% chained revenue share on Base L2`,
        accent: project.color || tkc("amber"),
        priceUSD: tier.priceUSD || 250,
        image: { kind: thumb, color: project.color },
        perks: tier.perks,
        onConfirm: () => {
          tier.sold = (tier.sold || 0) + 1;
          project.raised = (project.raised || 0) + (tier.priceUSD || 250);
          project.backers = (project.backers || 0) + 1;
          if (window.USER && Array.isArray(window.USER.holdings)) {
            const existing = window.USER.holdings.find(h => h.projectId === project.id);
            if (existing) {
              existing.qty += 1;
            } else {
              window.USER.holdings.push({
                projectId: project.id,
                tier: tier.name,
                qty: 1,
                costBasis: +((tier.priceUSD || 250) / 2700).toFixed(4),
                currentPrice: +((tier.priceUSD || 250) / 2700).toFixed(4),
                earned: 0,
              });
            }
          }
          bump(x => x + 1);
        },
      });
    } else {
      setCheckout(tier);
    }
  };

  return (
    <div className="pm" data-screen-label={`Co-finance · ${title}`}>
      <PmHero short image={thumb} color={project.color}
        kicker={<><b>Producer Pass · {(project.kind || film?.kind) === "series" ? "Series" : "Film"}</b> — {chain} · by {project.creator}</>}
        title={title} lede={project.summary}
        actions={<>
          {cheapest && <button className="pm-btn pm-btn--primary" onClick={() => startSmartMint(cheapest)}>{`Mint Pass from $${(cheapest.priceUSD || 0).toLocaleString()}`}</button>}
          <button className="pm-btn pm-btn--glass" onClick={() => pmScrollTo("pm-tiers")}>Compare Tiers</button>
          {window.openBidModal && <button className="pm-btn pm-btn--glass" onClick={() => openBidModal(project)}>Place a Bid</button>}
          {film && <button className="pm-btn pm-btn--glass" onClick={() => pmGo(pmDest(film))}><Icon name="play" size={13}/>Watch</button>}
          {Heart && <span style={{ display: "inline-flex", alignItems: "center" }}><Heart projectId={project.id} size={20}/></span>}
        </>}
        facts={[
          ["Raised", `${usd(project.raised)} of ${usd(project.goal)}`],
          ["Backers", (project.backers || 0).toLocaleString()],
          ["Mint Closes", `${project.daysLeft} days`],
          ["Chained Split", <span style={{ color: "var(--c-amber)" }}>{project.revShare}% investor pool</span>],
          ["Split Router", <span className="t-mono" style={{ fontSize: "var(--fs-body)" }}>0x71C9…8A4F</span>],
        ]}/>

      <section className="pm-wrap" style={{ marginTop: "1rem" }}>
        <div className="pm-panel" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <span className="pm-k"><b>{pct.toFixed(1)}% funded</b></span>
            <span className="pm-k">{sold.toLocaleString()} / {count.toLocaleString()} passes minted</span>
          </div>
          <div style={{ height: "0.25rem", background: "var(--c-line-2)" }}><div style={{ height: "100%", width: `${pct}%`, background: "var(--c-amber)" }}/></div>
        </div>
      </section>

      <PmSection n={N()} id="pm-tiers" title="Choose a Producer Tier" note={`${open.length} of ${project.tiers.length} open · settles via CinaSplitRouter.sol`}>
        <div className="pm-grid pm-grid--wide">
          {project.tiers.map(t => {
            const left = t.count - t.sold, feat = t.id === "producer";
            return (
              <div key={t.id} className="pm-panel" style={{ display: "flex", flexDirection: "column", gap: "1rem", borderColor: feat ? "var(--c-amber)" : "var(--c-line)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.75rem" }}>
                  <span className="pm-h2" style={{ fontSize: "var(--fs-title)" }}>{t.name}</span>
                  <span style={{ textAlign: "right" }}>
                    <span className="pm-stat__v" style={{ fontSize: "var(--fs-title)" }}>${(t.priceUSD || 0).toLocaleString()}</span>
                    {t.price ? <span className="pm-k" style={{ display: "block", marginTop: "0.25rem" }}>{t.price} ETH</span> : null}
                  </span>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {t.perks.map((p, i) => <li key={i} style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", paddingLeft: "1rem", position: "relative", lineHeight: 1.45 }}><span style={{ position: "absolute", left: 0, color: "var(--c-amber)" }}>—</span>{p}</li>)}
                </ul>
                <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ height: 2, background: "var(--c-line-2)" }}><div style={{ height: "100%", width: `${t.count ? t.sold / t.count * 100 : 0}%`, background: left > 0 ? "var(--c-ink-2)" : "var(--c-ink-4)" }}/></div>
                  <span className="pm-k">{t.sold.toLocaleString()} / {t.count.toLocaleString()} minted · {left > 0 ? `${left.toLocaleString()} left` : "sold out"}</span>
                  <button className={"pm-btn" + (feat && left > 0 ? " pm-btn--primary" : "")} style={{ justifyContent: "center" }} disabled={left <= 0} onClick={() => startSmartMint(t)}>
                    {left <= 0 ? "Sold out" : `Mint ${t.name} Pass`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </PmSection>

      {window.ChainedSplitRouterPanel && (
        <PmSection n={N()} title="Live Smart-Contract Split Waterfall" note="Simulate box-office rentals & verify instant pass-holder payouts">
          <window.ChainedSplitRouterPanel defaultProject={project.id}/>
        </PmSection>
      )}

      {window.FinancingMap && <PmSection n={N()} title="How co-financing works" note="Primary · secondary · royalty"><FinancingMap project={project} daysLeft={project.daysLeft}/></PmSection>}

      {project.timeline?.length > 0 && (
        <PmSection n={N()} title="Production timeline">
          <div className="pm-index">
            {project.timeline.map((m, i) => (
              <div key={i} className="pm-row" style={{ gridTemplateColumns: "15% minmax(0,1fr) auto", cursor: "default" }}>
                <span className="pm-k">{m.state === "done" ? "✓ " : ""}{m.d}</span>
                <span className="pm-index__name" style={{ color: m.state === "done" ? "var(--c-ink-3)" : "var(--c-ink)" }}>{m.label}</span>
                <span className="pm-k">{m.state === "live" ? <b>Live now</b> : m.state === "next" ? "Next" : m.state === "done" ? "Done" : ""}</span>
              </div>
            ))}
          </div>
        </PmSection>
      )}

      {!project.synthetic && window.HolderHub && <PmSection n={N()} title="Holder hub" note="For pass holders"><HolderHub initialProjectId={project.id}/></PmSection>}

      {checkout && window.NFTCheckout && <NFTCheckout project={project} tier={checkout} onClose={() => setCheckout(null)}/>}
    </div>
  );
}

// Frame for pages that keep their own content: same width, gutters and type.
function PmFrame({ children }) {
  return <div className="pm pm-legacy">{children}</div>;
}

Object.assign(window, { PmFilm, PmWallet, PmAuctions, PmNFT, PmFrame });
