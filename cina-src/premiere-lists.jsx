// premiere-lists.jsx — Watchlist, History and Leaderboard on the Premiere system.

const pmCompact = (n) => window.fmtCompact ? fmtCompact(n) : "$" + pmNum(Math.round(n));
const pmPct = (n, d = 1) => window.fmtMoneyPct ? fmtMoneyPct(n, d) : (n >= 0 ? "+" : "") + n.toFixed(d) + "%";

function PmWatchlist() {
  useSession && useSession();
  const S = window.SESSION || {};
  const C = window.CATALOG || [];
  const saved = (S.watchlist || []).map(pmFilm).filter(Boolean);
  const rated = Object.entries(S.ratings || {}).map(([id, n]) => ({ n, film: pmFilm(id) })).filter(r => r.film).sort((a, b) => b.n - a.n);
  const followed = (S.followed || []).map(id => (window.CREATORS || []).find(c => c.id === id)).filter(Boolean);
  const [kind, setKind] = usPm("all");
  const list = saved.filter(f => kind === "all" || (kind === "series" ? f.kind === "series" : f.kind !== "series"));
  const nSer = saved.filter(f => f.kind === "series").length;
  return (
    <div className="pm" data-screen-label="Watchlist">
      <PmMasthead index="Library" path="Watchlist" count={`${saved.length} saved`} title="Watchlist" lede="Films and series you've saved, what you rated, and the filmmakers you follow.">
        <PmLibraryTabs current="/watchlist"/>
      </PmMasthead>
      <PmSection title="Saved" note={saved.length ? `${saved.length} titles` : null}>
        {saved.length > 0 && nSer > 0 && saved.length > nSer && (
          <div className="pm-mast__tools" style={{ marginTop: 0, marginBottom: 18 }}>
            <PmChips options={[{ value: "all", label: `All ${saved.length}` }, { value: "film", label: `Films ${saved.length - nSer}` }, { value: "series", label: `Series ${nSer}` }]} value={kind} onChange={setKind}/>
          </div>
        )}
        {saved.length ? <div className="pm-grid">{list.map(f => <PmPoster key={f.id} film={f}/>)}</div> : (
          <PmEmpty title="Your watchlist is empty." body="Tap + on any poster and it lands here.">
            <button className="pm-btn pm-btn--primary" onClick={() => pmGo("/browse")}>Browse Watch</button>
          </PmEmpty>
        )}
      </PmSection>
      {rated.length > 0 && (
        <PmRailSection title="Rated by you" note={`${rated.length} ratings`}>
          {rated.map(r => <PmPoster key={r.film.id} film={r.film} badge={{ t: "★".repeat(r.n) }}/>)}
        </PmRailSection>
      )}
      <PmSection title="Following" note={followed.length ? "Drop alerts are on for these filmmakers" : null}>
        {followed.length ? (
          <div className="pm-index">
            {followed.map(c => (
              <div key={c.id} className="pm-row" onClick={() => pmGo(`/creator/${c.id}`)}>
                <span style={{ width: 44, height: 44, borderRadius: "50%", background: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 18 }}>{c.name.split(" ").map(p => p[0]).join("")}</span>
                <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  <span className="pm-index__name">{c.name}</span>
                  <span className="pm-k">{pmNum(c.followers || 0)} followers · {C.filter(f => f.creatorId === c.id).length} films</span>
                </span>
                <span className="pm-row__act"><button className="pm-btn pm-btn--sm" onClick={(e) => { e.stopPropagation(); window.toggleFollow && toggleFollow(c.id); }}>Unfollow</button></span>
              </div>
            ))}
          </div>
        ) : (
          <PmEmpty title="Not following anyone yet." body="Follow a studio and you hear about every drop and premiere.">
            <button className="pm-btn" onClick={() => pmGo("/studios")}>Find studios</button>
          </PmEmpty>
        )}
      </PmSection>
    </div>
  );
}

function PmHistory() {
  useSession && useSession();
  const S = window.SESSION || {};
  const entries = (S.continued || []).map(c => ({ ...c, film: pmFilm(c.filmId) })).filter(c => c.film).sort((a, b) => b.at - a.at);
  const inProgress = entries.filter(e => e.t / e.dur < 0.96);
  const finished = entries.filter(e => e.t / e.dur >= 0.96);
  const ago = window.lbAgo || (() => "");
  const save = (list) => { S.continued = list; try { localStorage.setItem("cina:continued", JSON.stringify(list)); } catch (e) {} window.bumpSession && bumpSession(); };
  const remove = (e) => { save((S.continued || []).filter(c => !(c.filmId === e.filmId && c.ep === e.ep))); window.toast && toast({ title: "REMOVED", text: `${e.film.title} cleared from history` }); };
  const clearAll = async () => {
    const ok = window.cinaConfirm ? await cinaConfirm({ kicker: "History", title: "Clear your watch history?", body: "Your saved spots in every film and episode are lost.", confirmLabel: "Clear history" }) : true;
    if (!ok) return; save([]); window.toast && toast({ title: "CLEARED", text: "Watch history is empty", kind: "good" });
  };
  const dest = (e) => e.film.kind === "series" ? `/series/${e.film.id}/ep/${e.ep || 1}` : `/film/${e.film.id}`;
  const Row = ({ e, done }) => {
    const left = Math.max(1, Math.round((e.dur - e.t) / 60));
    const mine = (S.ratings || {})[e.film.id];
    return (
      <div className="pm-ep">
        <PmStill film={e.film} meta={null} progress={done ? 0 : e.t / e.dur} badge={done ? { t: "Finished" } : null} onClick={() => pmGo(dest(e))}/>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
          <span className="pm-k">{e.ep ? <b>{`Episode ${String(e.ep).padStart(2, "0")}`}</b> : <b>{e.film.kind === "series" ? "Series" : "Film"}</b>}{` · ${ago(e.at)}`}</span>
          <h3 className="pm-ep__t">{e.film.title}</h3>
          <span className="pm-card__m">{done ? (mine ? `You rated it ${"★".repeat(mine)}` : pmMeta(e.film)) : `${left} min left · ${Math.round(e.t / e.dur * 100)}% watched`}</span>
          <div className="pm-actions">
            <button className="pm-btn pm-btn--sm pm-btn--primary" onClick={() => pmGo(dest(e))}><Icon name="play" size={12}/>{done ? "Watch again" : "Resume"}</button>
            <button className="pm-btn pm-btn--sm" onClick={() => remove(e)}>Remove</button>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="pm" data-screen-label="History">
      <PmMasthead index="Library" path="History" count={`${entries.length} entries`} title="Watch history" lede="Everything you've started or finished. Pick up where you left off, or clear the record.">
        <PmLibraryTabs current="/history"/>
        {entries.length > 0 && <><span className="pm-sep"></span><button className="pm-chip" onClick={clearAll}>Clear all</button></>}
      </PmMasthead>
      {entries.length === 0 && (
        <section className="pm-wrap"><PmEmpty title="Nothing watched yet." body="Films and episodes you start show up here, with your exact spot saved.">
          <button className="pm-btn pm-btn--primary" onClick={() => pmGo("/browse")}>Browse Watch</button>
        </PmEmpty></section>
      )}
      {inProgress.length > 0 && <PmSection title="In progress" note={`${inProgress.length} unfinished`}><div>{inProgress.map((e, i) => <Row key={"p" + i} e={e}/>)}</div></PmSection>}
      {finished.length > 0 && <PmSection title="Finished" note={`${finished.length} watched to the end`}><div>{finished.map((e, i) => <Row key={"f" + i} e={e} done/>)}</div></PmSection>}
    </div>
  );
}

const PM_TRADES = [
  { d: "2m", action: "Mint", film: "Verge", who: "loop.eth", amt: 0.075, usd: 204 },
  { d: "8m", action: "Transfer", film: "Last Light", who: "0x9a1…ff2", amt: 0.42, usd: 1142 },
  { d: "14m", action: "Mint", film: "Last Light", who: "noir.eth", amt: 0.32, usd: 870 },
  { d: "31m", action: "Royalty", film: "Frequency 88.6", who: "→ 412 holders", amt: 0.85, usd: 2310 },
  { d: "1h", action: "Mint", film: "The Fence", who: "agora.cina.eth", amt: 0.06, usd: 162 },
  { d: "2h", action: "Transfer", film: "Last Light", who: "0x4f2…1ed", amt: 0.082, usd: 223 },
  { d: "3h", action: "Mint", film: "Verge", who: "stillness.eth", amt: 0.075, usd: 204 },
];

function PmLeaderboard() {
  if (typeof window.useChainLedger === "function") window.useChainLedger();
  const [tab, setTab] = usPm("films");
  const films = umPm(() => (window.CATALOG || []).map(f => {
    const proj = (window.NFT_PROJECTS || {})[f.nft];
    return { ...f, earnings: (proj?.royaltyPaid || 0) + (f.views || 0) * 0.012, change: Math.sin(f.id.charCodeAt(0)) * 25 + 5, project: proj };
  }).sort((a, b) => b.earnings - a.earnings).slice(0, 12), []);
  const holders = umPm(() => ["pellucid.eth", "noir.eth", "screenslip.eth", "darkroom.cina.eth", "rita.cina.eth", "fox.eth", "amaranth.cina.eth", "stillness.eth", "loop.eth", "agora.cina.eth"].map((h, i) => ({
    handle: h, address: "0x" + ((i + 7) * 40503 >>> 0).toString(16).slice(0, 4) + "…" + ((i + 3) * 2654435761 >>> 0).toString(16).slice(0, 4),
    portfolio: 240000 / Math.pow(1.18, i), earned: 38000 / Math.pow(1.22, i), films: 12 - i, change: Math.sin(i * 1.7 + 1) * 17.5 + 12.5,
  })), []);
  const up = (n) => ({ color: n >= 0 ? "var(--c-good)" : "var(--c-warn)" });
  const open = (f) => pmGo(f.nft ? `/nft/${f.nft}` : pmDest(f));
  const lead = films[0];

  return (
    <div className="pm" data-screen-label="Leaderboard">
      <PmHero
        short
        image={lead?.thumb}
        color={lead?.color || tkc("black")}
        kicker={<><b>Box-Office &amp; Co-Finance Index</b> — Monthly Standings</>}
        title="Platform Leaderboard"
        lede="The films, studios, and pass holders generating the highest box-office settlements and chained royalties on Cina this month."
        facts={[
          lead ? ["No. 01 Film", `${lead.title} (${pmCompact(lead.earnings)})`] : null,
          ["24h Settlement Volume", "$184K USDC"],
          ["Top Holder", `${holders[0]?.handle} (${pmCompact(holders[0]?.earned)} earned)`],
        ]}
        actions={<>
          {lead && <button className="pm-btn pm-btn--primary" onClick={() => open(lead)}>Inspect {lead.title}</button>}
          <button className="pm-btn pm-btn--glass" onClick={() => pmGo("/payouts")}>Your Payouts</button>
        </>}
      />
      <PmTabs tabs={[["films", "Top earning films"], ["holders", "Top holders"], ["volume", "Market activity"]]} value={tab} onChange={setTab}/>
      {tab === "films" && <>
        <PmSection title="Top three">
          <div className="pm-grid pm-grid--wide">
            {films.slice(0, 3).map((f, i) => <PmStill key={f.id} film={f} badge={{ t: `No. ${i + 1}`, red: i === 0 }} meta={`${pmCompact(f.earnings)} earned · ${pmPct(f.change)}`} sub={f.creator} onClick={() => open(f)}/>)}
          </div>
        </PmSection>
        <PmSection title="The rest of the dozen">
          <div className="pm-index">
            {films.slice(3).map((f, i) => (
              <div key={f.id} className="pm-row" onClick={() => open(f)} style={{ gridTemplateColumns: "3rem minmax(0,1fr) auto" }}>
                <span className="pm-k">{String(i + 4).padStart(2, "0")}</span>
                <span style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: 0 }}>
                  <span className="pm-index__name">{f.title}</span>
                  <span className="pm-k">{pmCreatorName(f)} · {f.views ? pmNum(f.views) + " views" : f.genre[0]}{f.project ? ` · floor ${f.project.floorPrice}Ξ` : ""}</span>
                </span>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                  <span className="pm-stat__v" style={{ fontSize: "clamp(1.25rem,1.8vw,1.65rem)" }}>{pmCompact(f.earnings)}</span>
                  <span className="pm-k" style={up(f.change)}>{pmPct(f.change)}</span>
                </span>
              </div>
            ))}
          </div>
        </PmSection>
      </>}
      {tab === "holders" && (
        <PmSection title="Top holders" note="Ranked by portfolio value">
          <div className="pm-index">
            {holders.map((h, i) => (
              <div key={h.handle} className="pm-row" style={{ cursor: "default", gridTemplateColumns: "3rem minmax(0,1fr) auto" }}>
                <span className="pm-k">{i < 3 ? <b>{String(i + 1).padStart(2, "0")}</b> : String(i + 1).padStart(2, "0")}</span>
                <span style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: 0 }}>
                  <span className="pm-index__name">{h.handle}</span>
                  <span className="pm-k">{h.address} · {h.films} films · {pmCompact(h.earned)} earned</span>
                </span>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                  <span className="pm-stat__v" style={{ fontSize: "clamp(1.25rem,1.8vw,1.65rem)" }}>{pmCompact(h.portfolio)}</span>
                  <span className="pm-k" style={up(h.change)}>{pmPct(h.change)}</span>
                </span>
              </div>
            ))}
          </div>
        </PmSection>
      )}
      {tab === "volume" && <>
        <section className="pm-sec pm-wrap">
          <div className="pm-stats pm-panel">
            {[["24h volume", "$184K", pmPct(8.2)], ["Active mints", "6", "3 closing this week"], ["Floor average", "0.062Ξ", pmPct(-2.1)], ["Royalties", "$12.4K", "paid this month"]].map(([l, v, s]) => (
              <div key={l} className="pm-stat"><span className="pm-k">{l}</span><span className="pm-stat__v">{v}</span><span className="pm-card__m">{s}</span></div>
            ))}
          </div>
        </section>
        <PmSection title="Recent trades">
          <div className="pm-index">
            {PM_TRADES.map((t, i) => (
              <div key={i} className="pm-row" style={{ cursor: "default", gridTemplateColumns: "4rem minmax(0,1fr) auto" }}>
                <span className="pm-k">{t.d}</span>
                <span style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: 0 }}>
                  <span className="pm-index__name" style={{ fontSize: "clamp(1.25rem,1.9vw,1.75rem)" }}>{t.film}</span>
                  <span className="pm-k"><span style={{ color: t.action === "Mint" ? "var(--c-amber)" : t.action === "Royalty" ? "var(--c-good)" : "var(--c-ink-3)" }}>{t.action}</span> · {t.who}</span>
                </span>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                  <span className="t-mono" style={{ fontSize: "var(--fs-body)" }}>{t.amt}Ξ</span>
                  <span className="pm-k">${t.usd.toLocaleString()}</span>
                </span>
              </div>
            ))}
          </div>
        </PmSection>
      </>}
    </div>
  );
}

const PM_PAY_METHODS = [
  { id: "usdc", label: "USDC", chain: "Base L2", addr: "0x71c…3F2a", time: "Instant chained split" },
  { id: "eth", label: "ETH", chain: "Base L2", addr: "0x71c…3F2a", time: "Instant chained split" },
  { id: "ach", label: "ACH transfer", chain: "Mercury Bank", addr: "•••• 4421", time: "1–3 business days" },
];

function PmPayouts() {
  const chainLedger = typeof window.useChainLedger === "function" ? window.useChainLedger() : [];
  const creatorId = window.USER?.creatorId || "voss";
  const creator = window.getCreator ? getCreator(creatorId) : null;
  const usd = window.fmtUSD || ((n) => "$" + Math.round(n).toLocaleString());
  const { rows, total, films } = umPm(() => window.computeCreatorPayouts ? computeCreatorPayouts(creatorId) : { rows: [], total: 0, films: [] }, [creatorId]);
  const history = umPm(() => window.fakePayoutHistory ? fakePayoutHistory(creatorId) : [], [creatorId]);
  const [tab, setTab] = usPm("overview");
  const [method, setMethod] = usPm(() => { try { return localStorage.getItem("cina:payout-method") || "usdc"; } catch (e) { return "usdc"; } });
  const pick = (id) => { setMethod(id); try { localStorage.setItem("cina:payout-method", id); } catch (e) {} window.toast && toast({ title: "PAYOUT METHOD", text: PM_PAY_METHODS.find(m => m.id === id).label, kind: "good" }); };
  const trend = umPm(() => { let v = 80; return Array.from({ length: 30 }, (_, i) => (v = Math.max(20, v * (0.93 + ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1 * 0.2)))); }, []);
  const sessionChainVolume = (chainLedger || []).reduce((a, s) => a + (s.grossUSD || 0), 0);
  const ledger = umPm(() => {
    const rd = (k) => { try { const v = JSON.parse(localStorage.getItem(k)); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
    const forks = rd("cina:fork-ledger"), sales = rd("cina:commerce:ledger");
    return [
      { label: "Smart-contract stream & rental splits", sub: `${(chainLedger || []).length} atomic settlements via CinaSplitRouter.sol`, amount: sessionChainVolume, live: (chainLedger || []).length > 0 },
      { label: "Branch royalties", sub: `${forks.length} viewer choice${forks.length === 1 ? "" : "s"} · $0.12 each`, amount: forks.length * 0.12, live: forks.length > 0 },
      { label: "Wardrobe commissions", sub: `${sales.length} piece${sales.length === 1 ? "" : "s"} bought off the screen · 12% of retail`, amount: sales.reduce((a, r) => a + (r.cut || 0), 0), live: sales.length > 0 },
    ];
  }, [chainLedger.length, sessionChainVolume]);
  const next = history[0];
  const m = PM_PAY_METHODS.find(x => x.id === method);
  const heroFilm = rows[0] ? pmFilm(rows[0].filmId) : (window.CATALOG || [])[0];

  return (
    <div className="pm" data-screen-label="Payouts">
      <PmHero
        short
        image={heroFilm?.thumb}
        color={heroFilm?.color || tkc("black")}
        kicker={<><b>Sales, Royalties &amp; Chained Splits</b> — {creator?.name || "Studio Desk"}</>}
        title="Sales &amp; Payouts"
        lede="Real-time earnings from rentals, purchases, studio subscriptions, and co-finance passes — split atomically across director, investors, and cast."
        facts={[
          ["Lifetime Earned", usd(total + sessionChainVolume * 0.52)],
          next ? ["Next Scheduled", `${usd(next.amount)} (${m.label})`] : null,
          ["Investor Dividends Paid", usd(window.USER?.totalEarned || 0)],
          ["Split Contract", "0x71C9…8A4F · Base L2"],
        ]}
        actions={<>
          <button className="pm-btn pm-btn--primary" onClick={() => pmGo("/wallet")}>Wallet &amp; Stakes</button>
          <button className="pm-btn pm-btn--glass" onClick={() => window.toast && toast({ title: "TAX DOCS", text: "1099-NEC & on-chain CSV ledger exported", kind: "good" })}>
            <Icon name="download" size={13}/>Export Tax &amp; Ledger CSV
          </button>
        </>}
      />

      <PmTabs tabs={[["overview", "Overview & Chained Splits"], ["titles", "By title"], ["history", "Payout history"], ["method", "Payment method"]]} value={tab} onChange={setTab}/>
      {tab === "overview" && <>
        {window.ChainedSplitRouterPanel && (
          <PmSection title="Smart-Contract Chained Split Router" note="Every viewer payment splits automatically to studio, investors, and cast">
            <window.ChainedSplitRouterPanel defaultProject="voss-ll"/>
          </PmSection>
        )}
        <PmSection title="Earnings trend" note="Last 30 days · USD">
          <div className="pm-panel">{window.Sparkline && <Sparkline points={trend} height={140}/>}</div>
        </PmSection>
        <PmSection title="Live session ledger" note="Atomic splits, fork choices, and wardrobe sales recorded in this session">
          <div className="pm-index">
            {ledger.map(l => (
              <div key={l.label} className="pm-row" style={{ cursor: "default", gridTemplateColumns: "1.25rem minmax(0,1fr) auto" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: l.live ? "var(--c-good)" : "var(--c-line-2)" }}/>
                <span style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: 0 }}>
                  <span className="pm-card__t" style={{ fontSize: "var(--fs-body)" }}>{l.label}</span>
                  <span className="pm-k">{l.sub}</span>
                </span>
                <span className="pm-stat__v" style={{ fontSize: "clamp(1.25rem,1.8vw,1.65rem)", color: l.live ? "var(--c-good)" : "var(--c-ink-3)" }}>{usd(l.amount)}</span>
              </div>
            ))}
          </div>
        </PmSection>
      </>}
      {tab === "titles" && (
        <PmSection title="By title" note={`${rows.length} titles · ads, subscriptions and producer royalties`}>
          <div className="pm-index">
            {rows.map(r => {
              const f = pmFilm(r.filmId);
              return (
                <div key={r.filmId} className="pm-ep" style={{ cursor: "pointer", gridTemplateColumns: "minmax(0,22%) minmax(0,1fr) auto" }} onClick={() => f && pmGo(pmDest(f))}>
                  {f ? <PmStill film={f} meta={null}/> : <span/>}
                  <span style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: 0 }}>
                    <h3 className="pm-ep__t">{r.title}</h3>
                    <span className="pm-k">{r.kind === "series" ? "Series" : "Film"} · {pmNum(r.views)} views</span>
                    <span className="pm-card__m">Ads {pmCompact(r.adRev)} · Subs {pmCompact(r.subRev)} · Producers {r.nftRoyalty > 0 ? pmCompact(r.nftRoyalty) : "—"}</span>
                  </span>
                  <span className="pm-stat__v" style={{ fontSize: "clamp(1.35rem,2vw,1.9rem)" }}>{usd(r.total)}</span>
                </div>
              );
            })}
          </div>
        </PmSection>
      )}
      {tab === "history" && (
        <PmSection title="Payout history" note="Settled on-chain and monthly">
          <div className="pm-index">
            {history.map((p, i) => (
              <div key={i} className="pm-row" style={{ cursor: "default", gridTemplateColumns: "minmax(0,1fr) auto auto" }}>
                <span style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: 0 }}>
                  <span className="pm-index__name" style={{ fontSize: "clamp(1.25rem,1.9vw,1.75rem)" }}>{p.month}</span>
                  <span className="pm-k">{p.d} · {p.method}</span>
                </span>
                {p.status === "scheduled" ? <span className="pm-k"><b>Scheduled</b></span> : <button className="pm-link" style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)" }} onClick={() => window.toast && toast({ title: "TRANSACTION", text: p.txHash, kind: "good" })}>{p.txHash} ↗</button>}
                <span className="pm-stat__v" style={{ fontSize: "clamp(1.25rem,1.8vw,1.65rem)", minWidth: "5ch", textAlign: "right" }}>{usd(p.amount)}</span>
              </div>
            ))}
          </div>
        </PmSection>
      )}
      {tab === "method" && (
        <PmSection title="Payment method" note="Where smart-contract splits and monthly sweeps route">
          <div className="pm-grid pm-grid--wide">
            {PM_PAY_METHODS.map(x => {
              const on = method === x.id;
              return (
                <button key={x.id} className="pm-panel" aria-pressed={on} onClick={() => pick(x.id)} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", flexDirection: "column", gap: "0.65rem", padding: "1.4rem", borderRadius: "var(--r-2)", background: on ? "rgba(var(--accent-rgb),.08)" : "var(--c-panel)", border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line)"}` }}>
                  <span className="pm-k">{on ? <b>Selected</b> : x.time}</span>
                  <span className="pm-h2">{x.label}</span>
                  <span className="pm-card__m">{x.chain} · {x.addr}{on ? ` · ${x.time}` : ""}</span>
                </button>
              );
            })}
          </div>
        </PmSection>
      )}
    </div>
  );
}

function PmAuctionDetail({ auctionId }) {
  const A = window.AUCTIONS || [];
  const a = A.find(x => x.id === auctionId) || A[0];
  const [, bump] = usPm(0);
  const [bid, setBid] = usPm(() => a ? +(a.currentBid * 1.05).toFixed(3) : 0);
  const [bids, setBids] = usPm(() => a && window.auSynthBids ? auSynthBids(a).map((b, i) => ({ ...b, amount: +(a.currentBid / Math.pow(1.04, i)).toFixed(3) })) : []);
  const [tab, setTab] = usPm("bid");
  const [confirm, setConfirm] = usPm(false);
  uePm(() => { if (!confirm) return; const k = (e) => e.key === "Escape" && setConfirm(false); document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k); }, [confirm]);
  if (!a) return <div className="pm"><section className="pm-wrap"><PmEmpty title="No auctions live." body="The floor is quiet right now."/></section></div>;
  const perks = window.auTierPerks ? auTierPerks(a.tier) : [];
  const usd = (eth) => "$" + Math.round(eth * 3400).toLocaleString();
  const ends = `${Math.floor(a.endsInH)}h ${Math.floor((a.endsInH % 1) * 60)}m`;
  const low = bid <= a.currentBid;
  const place = () => {
    if (low) return;
    setBids(b => [{ user: "yo.eth", amount: bid, when: "just now", you: true }, ...b]);
    a.currentBid = bid; a.bidCount++; setBid(+(bid * 1.05).toFixed(3)); setConfirm(false); bump(n => n + 1);
    window.toast && toast({ title: "BID PLACED", text: `${bid} ETH on ${a.projectTitle}`, kind: "good" });
  };
  const buyNow = () => window.openPay ? openPay({ kind: "nft", title: a.projectTitle, subtitle: `${a.tier} · Edition ${a.edition}`, accent: tkc("amber"), priceUSD: Math.round(a.buyItNow * 3400), priceNote: `${a.buyItNow} ETH · buy it now`, image: { kind: a.thumb, color: a.color }, perks: perks.map(p => p.title), onConfirm: () => window.toast && toast({ title: "OWNED", text: `${a.projectTitle} ${a.edition}`, kind: "good" }) }) : window.toast && toast(`Bought · ${a.buyItNow} ETH`);
  const lines = [["Item", `${a.projectTitle} · ${a.tier} #${a.edition}`], ["Your bid", `${bid} ETH`], [`Director royalty (${a.royalty}%)`, `${(bid * a.royalty / 100).toFixed(3)} ETH`], ["Platform fee (2.5%)", `${(bid * 0.025).toFixed(3)} ETH`], ["Seller receives", `${(bid * (1 - 0.025 - a.royalty / 100)).toFixed(3)} ETH`]];
  return (
    <div className="pm" data-screen-label="Auction lot">
      <PmHero short image={a.thumb} color={a.color} kicker={<><b style={{ color: "var(--c-amber)" }}>Auction</b>{` — ${a.tier} · Edition ${a.edition}`}</>} title={a.projectTitle}
        facts={[["Bid", `${a.currentBid} ETH high bid`], ["Ends", `Ends in ${ends}`], ["Bids", `${a.bidCount} bids`], ["By", `by ${a.creator}`]]}
        lede={`Sold by ${a.seller}. ${a.royalty}% of every resale goes back to the director.`}
        actions={<>
          <button className="pm-btn pm-btn--primary" onClick={() => { setTab("bid"); setConfirm(true); }}>Place bid · {bid} ETH</button>
          <button className="pm-btn pm-btn--glass" onClick={buyNow}>Buy now · {a.buyItNow} ETH</button>
          <button className="pm-btn pm-btn--glass" onClick={() => pmGo("/auctions")}>All lots</button>
        </>}/>
      <PmTabs tabs={[["bid", "Bid"], ["perks", "What you get"], ["history", `Bid history · ${bids.length}`]]} value={tab} onChange={setTab}/>
      {tab === "bid" && (
        <PmSection title="Your bid" note={`Reserve ${a.reservePrice} ETH · held in escrow until the auction ends`}>
          <div className="pm-duo">
            <div className="pm-panel" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="pm-stats">
                <div className="pm-stat"><span className="pm-k">Current high bid</span><span className="pm-stat__v">{a.currentBid} ETH</span><span className="pm-card__m">~ {usd(a.currentBid)}</span></div>
                <div className="pm-stat"><span className="pm-k">Ends in</span><span className="pm-stat__v" style={{ color: a.endsInH < 6 ? "var(--c-amber)" : "var(--c-ink)", fontVariantNumeric: "tabular-nums" }}>{ends}</span><span className="pm-card__m">{a.bidCount} bids so far</span></div>
              </div>
              <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span className="pm-k">Amount · ETH</span>
                <span style={{ display: "flex", gap: 8 }}>
                  <input type="number" value={bid} step={0.01} min={a.currentBid} onChange={e => setBid(parseFloat(e.target.value) || 0)} style={{ flex: 1, minWidth: 0, height: 44, background: "var(--c-bg)", border: `1px solid ${low ? "var(--c-warn)" : "var(--c-line-2)"}`, borderRadius: 8, padding: "0 14px", color: "var(--c-ink)", fontSize: 18, fontFamily: "var(--f-mono)" }}/>
                  <button className="pm-btn pm-btn--primary" disabled={low} style={{ opacity: low ? .45 : 1 }} onClick={() => setConfirm(true)}>Review bid</button>
                </span>
                <span className="pm-card__m" style={{ color: low ? "var(--c-warn)" : undefined }}>{low ? `Must be above ${a.currentBid} ETH` : `~ ${usd(bid)} · refunded automatically if you're outbid`}</span>
              </label>
            </div>
            <div className="pm-panel" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <span className="pm-k" style={{ marginBottom: 10 }}>Where the money goes</span>
              {lines.slice(1).map(([k, v], i) => <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "11px 0", borderTop: i ? "1px solid var(--c-line)" : "none", fontSize: "var(--fs-body)" }}><span style={{ color: "var(--c-ink-3)" }}>{k}</span><span style={{ fontFamily: "var(--f-mono)", color: "var(--c-ink)", fontWeight: i === 3 ? 600 : 400 }}>{v}</span></div>)}
            </div>
          </div>
          {typeof window.BranchedLotContext === "function" && a.branched && <div style={{ marginTop: 20 }}><window.BranchedLotContext auction={a}/></div>}
        </PmSection>
      )}
      {tab === "perks" && (
        <PmSection title="What you get" note={`${a.tier} tier`}>
          <div className="pm-index">
            {perks.map((p, i) => (
              <div key={p.title} className="pm-row" style={{ cursor: "default" }}>
                <span className="pm-k">{String(i + 1).padStart(2, "0")}</span>
                <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}><span className="pm-index__name" style={{ fontSize: "clamp(20px,1.9vw,28px)" }}>{p.title}</span><span className="pm-card__m">{p.desc}</span></span>
                <span></span>
              </div>
            ))}
          </div>
        </PmSection>
      )}
      {tab === "history" && (
        <PmSection title="Bid history">
          <div className="pm-index">
            {bids.map((b, i) => (
              <div key={i} className="pm-row" style={{ cursor: "default", gridTemplateColumns: "44px minmax(0,1fr) auto" }}>
                <span className="pm-k">{i === 0 ? <b>High</b> : String(i + 1).padStart(2, "0")}</span>
                <span className="pm-card__t" style={{ fontSize: "var(--fs-body)", color: b.you ? "var(--c-amber)" : "var(--c-ink)" }}>{b.user}{b.you ? " (you)" : ""}</span>
                <span style={{ display: "flex", gap: 16, alignItems: "baseline" }}><span className="t-mono" style={{ fontSize: "var(--fs-body)" }}>{b.amount} ETH</span><span className="pm-k" style={{ minWidth: "7ch", textAlign: "right" }}>{b.when}</span></span>
              </div>
            ))}
          </div>
        </PmSection>
      )}
      {confirm && (
        <div onClick={() => setConfirm(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.78)", backdropFilter: "blur(20px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div role="dialog" aria-modal="true" aria-label="Confirm bid" onClick={e => e.stopPropagation()} className="pm-panel" style={{ width: "min(460px,100%)", display: "flex", flexDirection: "column", gap: 16, background: "var(--c-panel-2)", padding: 28 }}>
            <span className="pm-k"><b>Confirm bid</b></span>
            <h2 className="pm-xl" style={{ fontSize: "clamp(36px,4vw,52px)" }}>{bid} ETH</h2>
            <div>{lines.map(([k, v], i) => <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderTop: "1px solid var(--c-line)", fontSize: "var(--fs-body)" }}><span style={{ color: "var(--c-ink-3)" }}>{k}</span><span style={{ fontFamily: "var(--f-mono)", textAlign: "right", fontWeight: i === 4 ? 600 : 400 }}>{v}</span></div>)}</div>
            <p className="pm-card__m" style={{ whiteSpace: "normal", lineHeight: 1.5 }}>Funds are held in escrow until the auction ends. If you're outbid, you're refunded automatically.</p>
            <div className="pm-actions" style={{ justifyContent: "flex-end" }}>
              <button className="pm-btn" onClick={() => setConfirm(false)}>Cancel</button>
              <button className="pm-btn pm-btn--primary" disabled={low} onClick={place} autoFocus>Confirm bid</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { PmWatchlist, PmHistory, PmLeaderboard, PmPayouts, PmAuctionDetail });
