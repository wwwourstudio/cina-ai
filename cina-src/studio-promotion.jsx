// studio-promotion.jsx — the creator's view of the advertiser/audience world.
//
// The Studio makes the work; this is where the money and attention come BACK:
//   · Inbox — advertisers requesting your performers + asking to run spots in
//     your films. You approve or decline.
//   · Promotion — live ad spend flowing through your published films.
//   · Press — mentions, sentiment, audience growth while you're promoted.
//   · Pitch Night — what your films funded, and films you've submitted to run.
//
// Exposes:
//   <StudioPromotionPage/>   full section (nav route "promo")
//   <PromoBand/>             compact summary band for the Slate home
//   <PitchNightStudioStrip/> tonight's-lineup strip for the Slate home
//   <SubmitToNightModal/>    director submits a film to a future night

const { useState: usPR, useEffect: uePR } = React;

const PR_GUT = "clamp(20px, 5vw, 88px)";
function prMoney(n) { return "$" + Math.round(n).toLocaleString(); }
function prCompact(n) {
  if (n >= 1e6) return (n/1e6).toFixed(1).replace(/\.0$/,"") + "M";
  if (n >= 1e3) return (n/1e3).toFixed(n>=1e4?0:1).replace(/\.0$/,"") + "K";
  return String(n);
}

// ═══════════════════════════════════════════════════════════════════════
//  FULL SECTION
// ═══════════════════════════════════════════════════════════════════════
function StudioPromotionPage({ onOpenVault }) {
  const bridge = usePromo();
  const s = bridge.get();
  const earn = bridge.earnings();
  const [submitOpen, setSubmitOpen] = usPR(false);
  const [detail, setDetail] = usPR(null); // { kind, item }
  const openDetail = (kind, item) => setDetail({ kind, item });

  const ribbon = [
    { k: "Earned from promotion", v: prMoney(earn.total), s: "all sources · lifetime", tint: "var(--c-amber)" },
    { k: "From your performers",  v: prMoney(earn.fromActors), s: "licensing approvals", tint: "var(--c-ink-2)" },
    { k: "From in-film spots",    v: prMoney(earn.fromSpots + earn.fromPromo), s: "your 70% share", tint: "var(--c-good)" },
    { k: "From Pitch Night",      v: prMoney(earn.fromNights), s: "funding raised", tint: tkc("cat-2") },
  ];

  return (
    <div data-screen-label="Studio · Promotion" style={{ position: "absolute", inset: 0, paddingTop: 64, overflowY: "auto" }}>
      <div className="pr-wrap">

        {/* Header */}
        <div className="pr-head">
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 12, display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-amber)", boxShadow: "0 0 8px var(--c-amber)" }}/>
              PROMOTION · THE ROOM AROUND YOUR WORK
            </div>
            <h1 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "clamp(38px,5.5vw,68px)", letterSpacing: "-0.02em", margin: 0, lineHeight: .95 }}>
              Where it comes back.
            </h1>
            <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", maxWidth: 560, marginTop: 14, lineHeight: 1.55 }}>
              Advertisers license your performers and run spots inside your films; the audience funds your work on Pitch Night. Approve what fits, decline what doesn't, and watch the money flow back to the studio.
            </p>
          </div>
        </div>

        {/* Earnings ribbon */}
        <div className="pr-ribbon">
          {ribbon.map(r => (
            <div key={r.k} className="pr-ribbon__cell">
              <span className="pr-ribbon__k"><span style={{ width: 5, height: 5, borderRadius: "50%", background: r.tint }}/>{r.k}</span>
              <span className="pr-ribbon__v" style={{ color: r.tint }}>{r.v}</span>
              <span className="pr-ribbon__s">{r.s}</span>
            </div>
          ))}
        </div>

        {/* INBOX — requests + approvals */}
        <PromoRule n="01" label="YOUR APPROVAL" sub={`${bridge.pendingTotal()} PENDING · ADVERTISERS WAITING ON YOU`}/>
        <div className="pr-inbox">
          <div className="pr-inbox__col">
            <div className="pr-colhead">
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-2)" }}>ACTOR REQUESTS</span>
              <span className="pr-pill">{bridge.counts().actorRequests}</span>
            </div>
            {s.actorRequests.length === 0 && <EmptyNote text="No performer requests right now."/>}
            {s.actorRequests.map(r => <ActorRequestCard key={r.id} r={r} bridge={bridge} onOpenVault={onOpenVault} onOpen={() => openDetail("actor", r)}/>)}
          </div>
          <div className="pr-inbox__col">
            <div className="pr-colhead">
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-2)" }}>COMMERCIAL PLACEMENTS</span>
              <span className="pr-pill">{bridge.counts().commercialApprovals}</span>
            </div>
            {s.commercialApprovals.length === 0 && <EmptyNote text="No placement requests right now."/>}
            {s.commercialApprovals.map(r => <CommercialCard_studioPromotion key={r.id} r={r} bridge={bridge} onOpen={() => openDetail("commercial", r)}/>)}
          </div>
        </div>

        {/* PROMOTION stats */}
        <PromoRule n="02" label="IN PROMOTION" sub="LIVE AD SPEND FLOWING THROUGH YOUR FILMS"/>
        <div className="pr-promo">
          {s.promo.films.map(f => <PromoFilmCard key={f.filmId} f={f} onOpen={() => openDetail("film", f)}/>)}
        </div>

        {/* PRESS */}
        <PromoRule n="03" label="PRESS & BUZZ" sub="MENTIONS · SENTIMENT · AUDIENCE GROWTH"/>
        <PressPanel pr={s.pr} onOpen={(it) => openDetail("press", it)}/>

        {/* PITCH NIGHT */}
        <PromoRule n="04" label="PITCH NIGHT" sub="WHAT YOUR FILMS FUNDED · WHAT'S QUEUED TO RUN"/>
        <div className="pr-night">
          <div className="pr-night__col">
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-2)", marginBottom: 12 }}>SUBMITTED TO RUN</div>
            {s.nightSubmissions.length === 0 && <EmptyNote text="You haven't submitted a film yet."/>}
            {s.nightSubmissions.map(sub => <NightSubmissionCard key={sub.id} sub={sub} bridge={bridge}/>)}
            <button className="btn btn-primary" onClick={() => setSubmitOpen(true)} style={{ height: 40, padding: "0 18px", fontSize: "var(--fs-body)", marginTop: 12 }}>
              <Icon name="plus" size={13}/> Submit a film to a night
            </button>
          </div>
          <div className="pr-night__col">
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-2)", marginBottom: 12 }}>YOUR RESULTS</div>
            {s.nightResults.map((n, i) => <NightResultRow key={i} n={n} onOpen={() => openDetail("result", n)}/>)}
          </div>
        </div>

      </div>
      {submitOpen && <SubmitToNightModal bridge={bridge} onClose={() => setSubmitOpen(false)}/>}
      {detail && <PromoDetailModal detail={detail} bridge={bridge} onOpenVault={onOpenVault} onClose={() => setDetail(null)}/>}
    </div>
  );
}

// ─── Inbox cards ─────────────────────────────────────────────────────────
// Shared counter-offer editor: a tiny inline stepper for fee/royalty.
function CounterEditor({ fee, royalty, onSend, onCancel }) {
  const [f, setF] = usPR(fee);
  const [ro, setRo] = usPR(royalty);
  const step = (setter, val, d, min, max) => setter(Math.max(min, Math.min(max, val + d)));
  const StepRow = ({ label, val, suffix, onMinus, onPlus }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button className="btn" onClick={onMinus} style={{ width: 26, height: 26, padding: 0, fontSize: "var(--fs-body)", lineHeight: 1 }}>–</button>
        <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-amber)", minWidth: 62, textAlign: "center" }}>{suffix === "$" ? prMoney(val) : val + "%"}</span>
        <button className="btn" onClick={onPlus} style={{ width: 26, height: 26, padding: 0, fontSize: "var(--fs-body)", lineHeight: 1 }}>+</button>
      </div>
    </div>
  );
  return (
    <div style={{ marginTop: 12, padding: "12px 14px", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)", display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>COUNTER-OFFER</div>
      <StepRow label="FEE" val={f} suffix="$" onMinus={() => step(setF, f, -200, 0, 999999)} onPlus={() => step(setF, f, 200, 0, 999999)}/>
      <StepRow label="ROYALTY" val={ro} suffix="%" onMinus={() => step(setRo, ro, -1, 0, 100)} onPlus={() => step(setRo, ro, 1, 0, 100)}/>
      <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
        <button className="btn btn-primary" onClick={() => onSend({ fee: f, royalty: ro })} style={{ flex: 1, height: 32, fontSize: "var(--fs-body)" }}>Send counter</button>
        <button className="btn" onClick={onCancel} style={{ height: 32, fontSize: "var(--fs-body)", padding: "0 12px" }}>Cancel</button>
      </div>
    </div>
  );
}

function ActorRequestCard({ r, bridge, onOpenVault, onOpen }) {
  const resolved = r.status !== "pending";
  const [counter, setCounter] = usPR(false);
  const stop = (e) => e.stopPropagation();
  return (
    <div className="pr-card pr-card--click" onClick={onOpen} style={{ opacity: resolved ? 0.72 : 1, transition: "opacity .2s" }}>
      <span className="pr-card__view">Details ↗</span>
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
        <span style={{ width: 38, height: 38, borderRadius: "var(--r-2)", background: r.brand, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{r.advertiser[0]}</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)" }}>{r.advertiser}</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", marginTop: 2 }}>WANTS · {r.performer} · {r.ago}</div>
        </div>
        <StatusTag status={r.status}/>
      </div>
      <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5, marginBottom: 10 }}>{r.use}</div>
      <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5, marginBottom: 12, fontStyle: "italic" }}>"{r.note}"</div>
      <div className="pr-terms">
        <PrTerm k={r.countered ? "FEE · COUNTERED" : "FEE"} v={prMoney(r.fee)} amber/>
        <PrTerm k="ROYALTY" v={r.royalty + "%"}/>
        <PrTerm k="SCOPE" v={r.scope}/>
      </div>
      {counter && !resolved && (
        <div onClick={stop}><CounterEditor fee={r.fee} royalty={r.royalty}
          onSend={(patch) => { bridge.counterActor(r.id, patch); setCounter(false); window.toast?.("Counter sent · " + prMoney(patch.fee) + " / " + patch.royalty + "% to " + r.advertiser); }}
          onCancel={() => setCounter(false)}/></div>
      )}
      {!resolved && !counter && (
        <div style={{ display: "flex", gap: 8, marginTop: 14 }} onClick={stop}>
          <button className="btn btn-primary" onClick={() => { bridge.resolveActor(r.id, "approved"); window.toast?.("Approved · " + r.performer + " licensed to " + r.advertiser); }} style={{ flex: 1, height: 36, fontSize: "var(--fs-body)" }}>Approve</button>
          <button className="btn" onClick={() => setCounter(true)} style={{ height: 36, fontSize: "var(--fs-body)", padding: "0 12px" }}>Counter</button>
          <button className="btn" onClick={() => bridge.resolveActor(r.id, "declined")} style={{ height: 36, fontSize: "var(--fs-body)", padding: "0 12px" }}>Decline</button>
        </div>
      )}
      {resolved && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }} onClick={stop}>
          <button className="btn" onClick={() => bridge.reopenActor(r.id)} style={{ height: 30, fontSize: "var(--fs-label)", padding: "0 12px" }}>↩ Undo</button>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{r.status === "approved" ? prMoney(r.fee) + " BOOKED" : "DECLINED"}</span>
        </div>
      )}
    </div>
  );
}

function CommercialCard_studioPromotion({ r, bridge, onOpen }) {
  const resolved = r.status !== "pending";
  const [counter, setCounter] = usPR(false);
  const stop = (e) => e.stopPropagation();
  return (
    <div className="pr-card pr-card--click" onClick={onOpen} style={{ opacity: resolved ? 0.72 : 1, transition: "opacity .2s" }}>
      <span className="pr-card__view">Details ↗</span>
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
        <span style={{ width: 38, height: 38, borderRadius: "var(--r-2)", background: r.brand, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{r.advertiser[0]}</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)" }}>{r.advertiser}</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", marginTop: 2 }}>IN · {r.film} · {r.ago}</div>
        </div>
        <StatusTag status={r.status}/>
      </div>
      <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5, marginBottom: 8 }}>
        <b style={{ color: "var(--c-ink)" }}>{r.format}</b> · {r.placement}
      </div>
      <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5, marginBottom: 12, fontStyle: "italic" }}>"{r.spot}"</div>
      <div className="pr-terms">
        <PrTerm k="AD SPEND" v={prMoney(r.spend)}/>
        <PrTerm k={r.countered ? "SHARE · COUNTERED" : "YOUR SHARE"} v={prMoney(r.share)} amber/>
        <PrTerm k="SPLIT" v="70 / 30"/>
      </div>
      {counter && !resolved && (
        <div onClick={stop}><CounterEditor fee={r.share} royalty={30}
          onSend={(patch) => { bridge.counterCommercial(r.id, { share: patch.fee }); setCounter(false); window.toast?.("Counter sent · " + prMoney(patch.fee) + " your share to " + r.advertiser); }}
          onCancel={() => setCounter(false)}/></div>
      )}
      {!resolved && !counter && (
        <div style={{ display: "flex", gap: 8, marginTop: 14 }} onClick={stop}>
          <button className="btn btn-primary" onClick={() => { bridge.resolveCommercial(r.id, "approved"); window.toast?.("Approved · " + r.advertiser + " runs in " + r.film); }} style={{ flex: 1, height: 36, fontSize: "var(--fs-body)" }}>Approve</button>
          <button className="btn" onClick={() => setCounter(true)} style={{ height: 36, fontSize: "var(--fs-body)", padding: "0 12px" }}>Counter</button>
          <button className="btn" onClick={() => bridge.resolveCommercial(r.id, "declined")} style={{ height: 36, fontSize: "var(--fs-body)", padding: "0 12px" }}>Decline</button>
        </div>
      )}
      {resolved && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }} onClick={stop}>
          <button className="btn" onClick={() => bridge.reopenCommercial(r.id)} style={{ height: 30, fontSize: "var(--fs-label)", padding: "0 12px" }}>↩ Undo</button>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{r.status === "approved" ? prMoney(r.share) + " BOOKED" : "DECLINED"}</span>
        </div>
      )}
    </div>
  );
}

function PromoFilmCard({ f, onOpen }) {
  const bridge = usePromo();
  return (
    <div className="pr-card pr-card--click" onClick={onOpen} style={{ opacity: f.paused ? 0.66 : 1, transition: "opacity .2s" }}>
      <span className="pr-card__view">Details ↗</span>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14, gap: 10 }}>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", letterSpacing: "-0.01em" }}>{f.film}</div>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: f.paused ? "var(--c-ink-4)" : "var(--c-amber)", letterSpacing: ".16em", whiteSpace: "nowrap" }}>{f.paused ? "● PAUSED" : f.advertisers + " ADVERTISERS"}</span>
      </div>
      <div className="pr-promo-stats">
        <PrTerm k="AD SPEND" v={prMoney(f.spend)} amber/>
        <PrTerm k="IMPRESSIONS" v={prCompact(f.impressions)}/>
        <PrTerm k="REACH" v={prCompact(f.reach)}/>
        <PrTerm k="COMPLETION" v={Math.round(f.completion * 100) + "%"}/>
      </div>
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--c-line)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>
          Your share: <b style={{ color: "var(--c-good)" }}>{prMoney(f.spend * 0.7)}</b> of {prMoney(f.spend)}
        </span>
        <button className="btn" onClick={(e) => { e.stopPropagation(); bridge.togglePromoPause(f.filmId); window.toast?.((f.paused ? "Resumed" : "Paused") + " spend · " + f.film); }} style={{ height: 30, fontSize: "var(--fs-label)", padding: "0 12px", flexShrink: 0 }}>
          {f.paused ? "▶ Resume spend" : "❚❚ Pause spend"}
        </button>
      </div>
    </div>
  );
}

function PressPanel({ pr, onOpen }) {
  const [filter, setFilter] = usPR("all");
  const [limit, setLimit] = usPR(3);
  const stat = (k, v, s, tint) => (
    <div className="pr-press-stat">
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" }}>{k}</div>
      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: tint || "var(--c-ink)", lineHeight: 1, marginTop: 4 }}>{v}</div>
      <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 4 }}>{s}</div>
    </div>
  );
  const match = (it) => filter === "all" ? true
    : filter === "press" ? it.kind === "press"
    : filter === "social" ? it.kind === "social"
    : filter === "positive" ? it.sentiment === "pos" : true;
  const filtered = pr.items.filter(match);
  const shown = filtered.slice(0, limit);
  const chips = [["all", "All"], ["press", "Press"], ["social", "Social"], ["positive", "Positive"]];
  return (
    <div className="pr-press">
      <div className="pr-press__stats">
        {stat("MENTIONS", prCompact(pr.mentions), "+" + Math.round(pr.mentionsTrend * 100) + "% this week", "var(--c-amber)")}
        {stat("SENTIMENT", Math.round(pr.sentiment * 100) + "%", "positive", "var(--c-good)")}
        {stat("PRESS REACH", pr.reachM + "M", "earned, not paid")}
        {stat("AUDIENCE", "+" + Math.round(pr.audienceGrowth * 100) + "%", "followers, 30d", tkc("cat-2"))}
      </div>
      <div className="pr-press__feed">
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderBottom: "1px solid var(--c-line)", background: "var(--c-panel-2)" }}>
          {chips.map(([id, label]) => (
            <button key={id} onClick={() => { setFilter(id); setLimit(3); }} className="t-mono" style={{
              padding: "4px 10px", borderRadius: 999, cursor: "pointer",
              fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase",
              border: "1px solid " + (filter === id ? "var(--c-amber)" : "var(--c-line-2)"),
              background: filter === id ? "rgba(var(--accent-rgb),.12)" : "transparent",
              color: filter === id ? "var(--c-amber)" : "var(--c-ink-3)",
            }}>{label}</button>
          ))}
          <span style={{ flex: 1 }}></span>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{filtered.length} ITEM{filtered.length === 1 ? "" : "S"}</span>
        </div>
        {shown.length === 0 && <div style={{ padding: "24px 16px", textAlign: "center", fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>Nothing matches that filter.</div>}
        {shown.map((it, i) => (
          <div key={i} className="pr-press-item pr-press-item--click" onClick={() => onOpen && onOpen(it)}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, marginTop: 6, background: it.sentiment === "pos" ? "var(--c-good)" : it.sentiment === "neg" ? "var(--c-blood)" : "var(--c-ink-4)" }}/>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.45, fontStyle: "italic" }}>"{it.quote}"</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", marginTop: 4 }}>
                {it.outlet} · {it.kind === "press" ? "PRESS" : "SOCIAL"} · {it.ago}
              </div>
            </div>
          </div>
        ))}
        {limit < filtered.length && (
          <button onClick={() => setLimit(l => l + 3)} className="t-mono" style={{ padding: "11px 14px", background: "var(--c-panel-2)", border: "none", borderTop: "1px solid var(--c-line)", cursor: "pointer", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textTransform: "uppercase" }}>
            Load more · {filtered.length - limit} remaining
          </button>
        )}
      </div>
    </div>
  );
}

function NightSubmissionCard({ sub, bridge }) {
  // Live vote ticking — a queued submission slowly gathers early votes.
  uePR(() => {
    if (sub.status === "shipped") return;
    const t = setInterval(() => { if (Math.random() < 0.5) bridge.voteSubmission(sub.id); }, 3200);
    return () => clearInterval(t);
  }, [sub.id, sub.status]);
  return (
    <div className="pr-card" style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{sub.film}</div>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", padding: "2px 7px", borderRadius: "var(--r-1)", background: "rgba(155,142,196,.14)", color: "var(--c-agent-audio)", letterSpacing: ".16em", whiteSpace: "nowrap" }}>{(sub.ep || "QUEUED")}</span>
      </div>
      <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5, marginTop: 8 }}>{sub.logline}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, gap: 10 }}>
        <button className="btn" onClick={() => { bridge.withdrawSubmission(sub.id); window.toast?.("Withdrawn · " + sub.film + " pulled from the night"); }} style={{ height: 28, fontSize: "var(--fs-label)", padding: "0 11px" }}>Withdraw</button>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", transition: "color .2s" }}>♥ {(sub.votes || 0).toLocaleString()} early votes</span>
      </div>
    </div>
  );
}

function NightResultRow({ n, onOpen }) {
  const shipped = n.ships === "shipped";
  return (
    <div className="pr-result-row pr-card--click" onClick={onOpen}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)" }}>{n.film}</div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", marginTop: 2 }}>EP {n.ep} · {n.when}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-amber)" }}>{prMoney(n.funded)}</div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: shipped ? "var(--c-good)" : "var(--c-blood)" }}>{shipped ? "● SHIPPED" : "○ " + n.ships.toUpperCase()}{n.rating ? " · ★ " + n.rating : ""}</div>
      </div>
    </div>
  );
}

// ─── Submit-to-night modal ───────────────────────────────────────────────
function SubmitToNightModal({ bridge, onClose }) {
  const films = (window.PROJECTS || []);
  const [filmId, setFilmId] = usPR(films[0] ? films[0].id : "");
  const [logline, setLogline] = usPR("");
  const film = films.find(f => f.id === filmId);

  const submit = () => {
    bridge.submitToNight({ film: (film ? film.title : "Untitled"), filmId, director: "Elias Voss", logline: logline || (film && film.logline) || "A new film, premiering live.", ep: "Next night" });
    window.toast?.("Submitted to Pitch Night · the audience votes next");
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,.66)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 28 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "min(540px,100%)", background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)", padding: "30px 34px" }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-agent-audio)", letterSpacing: ".16em", marginBottom: 12 }}>SUBMIT TO PITCH NIGHT</div>
        <h2 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-head)", margin: 0, lineHeight: 1 }}>Put a film on the stage.</h2>
        <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", marginTop: 10, lineHeight: 1.55 }}>
          The audience votes on submissions; the winner is generated and funded live in a Dutch auction, then ships to Watch by midnight.
        </p>
        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 7 }}>WHICH FILM</div>
            <select value={filmId} onChange={e => setFilmId(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "var(--c-bg)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", color: "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)" }}>
              {films.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
            </select>
          </div>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 7 }}>PITCH (ONE LINE)</div>
            <textarea value={logline} onChange={e => setLogline(e.target.value)} placeholder="The hook you'd read to a live crowd…" rows={3} style={{ width: "100%", padding: "10px 12px", background: "var(--c-bg)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", color: "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)", resize: "vertical" }}/>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
          <button className="btn" onClick={onClose} style={{ height: 38, padding: "0 18px", fontSize: "var(--fs-body)" }} aria-label="Close" title="Close">Cancel</button>
          <button className="btn btn-primary" onClick={submit} style={{ height: 38, padding: "0 20px", fontSize: "var(--fs-body)" }}>Submit to the night →</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  HOME BAND (compact summary for the Slate home)
// ═══════════════════════════════════════════════════════════════════════
function PromoBand({ onOpenPromo }) {
  const bridge = usePromo();
  const s = bridge.get();
  const earn = bridge.earnings();
  const pending = bridge.pendingTotal();
  const reqs = [
    ...s.actorRequests.filter(r => r.status === "pending").map(r => ({ ...r, _kind: "actor" })),
    ...s.commercialApprovals.filter(r => r.status === "pending").map(r => ({ ...r, _kind: "spot" })),
  ];

  // Revenue split → stacked segment bar.
  const segs = [
    { k: "Performers", v: earn.fromActors, c: "var(--c-amber)" },
    { k: "In-film", v: earn.fromSpots + earn.fromPromo, c: "var(--c-good)" },
    { k: "Pitch Night", v: earn.fromNights, c: tkc("cat-2") },
  ].filter(x => x.v > 0);
  const segTotal = segs.reduce((a, b) => a + b.v, 0) || 1;

  // Deterministic 16-pt earnings sparkline so the hero number feels alive.
  const spark = React.useMemo(() => {
    const out = []; let acc = earn.total * 0.45;
    for (let i = 0; i < 16; i++) {
      const x = Math.sin(i * 12.9898 + earn.total * 0.0001) * 43758.5453;
      acc += (earn.total * 0.04) * (0.5 + (x - Math.floor(x)));
      out.push(acc);
    }
    out[out.length - 1] = earn.total;
    return out;
  }, [earn.total]);
  const sMax = Math.max(...spark), sMin = Math.min(...spark), sRng = sMax - sMin || 1;
  const sparkPts = spark.map((v, i) => `${(i / (spark.length - 1)) * 100},${28 - ((v - sMin) / sRng) * 26 - 1}`).join(" ");

  const approve = (r) => {
    if (r._kind === "actor") { bridge.resolveActor(r.id, "approved"); window.toast?.("Approved · " + r.performer); }
    else { bridge.resolveCommercial(r.id, "approved"); window.toast?.("Approved · " + r.advertiser); }
  };
  const decline = (r) => {
    if (r._kind === "actor") bridge.resolveActor(r.id, "declined");
    else bridge.resolveCommercial(r.id, "declined");
  };

  return (
    <div className="prx">
      {/* Header */}
      <div className="prx__head">
        <span className="prx__tag">
          <span className="prx__pulse" style={pending ? null : { background: "var(--c-ink-4)", boxShadow: "none" }}/>
          PROMOTION
        </span>
        <span className="prx__status" style={pending ? null : { color: "var(--c-ink-4)", borderColor: "var(--c-line-2)" }}>
          {pending ? `${pending} need you` : "All clear"}
        </span>
      </div>

      {/* Hero earnings + sparkline */}
      <button className="prx__hero" onClick={onOpenPromo}>
        <div style={{ minWidth: 0 }}>
          <div className="prx__big">{prMoney(earn.total)}</div>
          <div className="prx__sub">earned from being watched · lifetime</div>
        </div>
        <svg className="prx__spark" viewBox="0 0 100 28" preserveAspectRatio="none">
          <defs>
            <linearGradient id="prxg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor= "var(--c-amber)" stopOpacity=".35"/>
              <stop offset="100%" stopColor= "var(--c-amber)" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <polygon points={`0,28 ${sparkPts} 100,28`} fill="url(#prxg)"/>
          <polyline points={sparkPts} fill="none" stroke= "var(--c-amber)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Revenue split */}
      <div className="prx__bar">
        {segs.map(seg => (
          <span key={seg.k} className="prx__barseg" style={{ width: `${(seg.v / segTotal) * 100}%`, background: seg.c }}/>
        ))}
      </div>
      <div className="prx__legend">
        {segs.map(seg => (
          <span key={seg.k} className="prx__leg">
            <span className="prx__dot" style={{ background: seg.c }}/>{seg.k}
            <b>{prCompact(seg.v).startsWith("$") ? prCompact(seg.v) : "$" + prCompact(seg.v)}</b>
          </span>
        ))}
      </div>

      {/* Live in promotion */}
      <div className="prx__rule">
        <span>LIVE · {s.promo.films.length} FILM{s.promo.films.length === 1 ? "" : "S"}</span>
        <span style={{ color: "var(--c-ink-4)" }}>SPEND · REACH · FINISH</span>
      </div>
      <div className="prx__films">
        {s.promo.films.map(f => (
          <div key={f.filmId} className="prx__film">
            <div className="prx__filmname">{f.film}</div>
            <div className="prx__filmstat">${prCompact(f.spend)}<span> spend</span></div>
            <div className="prx__filmstat">{prCompact(f.reach)}<span> reach</span></div>
            <div className="prx__meter" title={`${Math.round(f.completion * 100)}% completion`}>
              <span style={{ width: `${Math.round(f.completion * 100)}%` }}/>
              <em>{Math.round(f.completion * 100)}%</em>
            </div>
          </div>
        ))}
      </div>

      {/* Needs you / inbox */}
      {reqs.length > 0 ? (
        <>
          <div className="prx__rule"><span style={{ color: "var(--c-amber)" }}>NEEDS YOU · {reqs.length}</span></div>
          <div className="prx__inbox">
            {reqs.slice(0, 3).map(r => (
              <div key={r.id} className="prx__req">
                <span className="prx__reqbrand" style={{ background: r.brand }}/>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="prx__reqtitle">{r.advertiser}</div>
                  <div className="prx__reqmeta">
                    {r._kind === "actor" ? `Wants ${r.performer}` : `In ${r.film}`} · <b>{prMoney(r._kind === "actor" ? r.fee : r.share)}</b>
                  </div>
                </div>
                <button className="prx__yes" onClick={() => approve(r)} title="Approve"><Icon name="check" size={13}/></button>
                <button className="prx__no" onClick={() => decline(r)} title="Decline">✕</button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="prx__clear">
          <Icon name="check" size={13}/> No approvals waiting — spend is flowing on its own.
        </div>
      )}

      <button className="prx__open" onClick={onOpenPromo}>
        Open Promotion <Icon name="chev-r" size={13}/>
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  PITCH NIGHT STRIP (for the Slate home)
// ═══════════════════════════════════════════════════════════════════════
function PitchNightStudioStrip({ onSubmit }) {
  const bridge = usePromo();
  const subs = bridge.get().nightSubmissions;
  return (
    <div className="pr-pnstrip">
      <div className="pr-pnstrip__head">
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-agent-audio)", letterSpacing: ".16em", marginBottom: 7, display: "flex", alignItems: "center", gap: 8 }}>
            <span className="rec-dot" style={{ background: "var(--c-blood-l)" }}/>
            PITCH NIGHT · EP 14 LIVE NOW
          </div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "clamp(22px,2.6vw,30px)", color: "var(--c-ink)", letterSpacing: "-0.01em", lineHeight: 1.08 }}>
            Films on the stage tonight.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={onSubmit} style={{ height: 38, padding: "0 16px", fontSize: "var(--fs-body)" }}><Icon name="plus" size={12}/> Submit a film</button>
        </div>
      </div>
      <div className="pr-pnstrip__list">
        {subs.map((sub, i) => {
          const live = /live/i.test(sub.ep || "");
          return (
            <div key={sub.id} className="pr-pnrow" style={live ? { borderColor: "rgba(201,85,72,.45)", background: "linear-gradient(90deg, rgba(201,85,72,.07), var(--c-panel-2) 55%)" } : null}>
              <span className="t-mono pr-pnrow__n">{String(i + 1).padStart(2, "0")}</span>
              <div className="pr-pnrow__thumb">
                {window.FrameThumb && sub.filmId ? <FrameThumb kind={(window.PROJECTS||[]).find(p=>p.id===sub.filmId)?.thumb || sub.filmId} usePhoto/> : null}
                <span style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,10,.55), transparent 60%)" }}></span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 9, minWidth: 0 }}>
                  <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub.film}</span>
                  {live && (
                    <span className="t-mono" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-blood-l)", flexShrink: 0 }}>
                      <span className="rec-dot" style={{ background: "var(--c-blood-l)", width: 5, height: 5 }}></span>ON STAGE
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.4, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub.logline}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: (sub.votes || 0) > 0 ? "var(--c-amber)" : "var(--c-ink-4)" }}>♥ {(sub.votes||0).toLocaleString()}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginTop: 3, textTransform: "uppercase" }}>{sub.ep || "QUEUED"}</div>
              </div>
            </div>
          );
        })}
        <button className="pr-pnrow pr-pnrow--add" onClick={onSubmit}>
          <Icon name="plus" size={13}/>
          <span>Submit yours — pitch to the room</span>
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  DETAIL LIGHTBOX — the full story behind any card, with actions
// ═══════════════════════════════════════════════════════════════════════
function PromoDetailModal({ detail, bridge, onOpenVault, onClose }) {
  const { kind, item } = detail;
  const [counter, setCounter] = usPR(false);
  // Re-read the live item from the bridge so the modal reflects approvals/counters.
  const s = bridge.get();
  const live = (() => {
    if (kind === "actor") return s.actorRequests.find(r => r.id === item.id) || item;
    if (kind === "commercial") return s.commercialApprovals.find(r => r.id === item.id) || item;
    if (kind === "film") return s.promo.films.find(f => f.filmId === item.filmId) || item;
    return item;
  })();

  const META = {
    actor:      { tag: "PERFORMER LICENSE REQUEST", tint: "var(--c-amber)" },
    commercial: { tag: "IN-FILM PLACEMENT REQUEST", tint: "var(--c-good)" },
    film:       { tag: "LIVE PROMOTION", tint: "var(--c-amber)" },
    press:      { tag: item.kind === "press" ? "PRESS MENTION" : "SOCIAL MENTION", tint: tkc("cat-2") },
    result:     { tag: "PITCH NIGHT RESULT", tint: tkc("cat-2") },
  }[kind] || { tag: "DETAILS", tint: "var(--c-amber)" };

  const Row = ({ k, v, tint }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>{k}</span>
      <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: tint || "var(--c-ink)", lineHeight: 1 }}>{v}</span>
    </div>
  );
  const Line = ({ k, v }) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "9px 0", borderBottom: "1px solid var(--c-line)" }}>
      <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>{k}</span>
      <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", textAlign: "right", fontWeight: 500 }}>{v}</span>
    </div>
  );

  const resolved = (kind === "actor" || kind === "commercial") && live.status !== "pending";
  const brandColor = live.brand || META.tint;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9200, background: "rgba(0,0,0,.72)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "min(600px, 100%)", maxHeight: "88vh", overflowY: "auto", background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)", boxShadow: "0 40px 120px rgba(0,0,0,.6)" }} className="sc-scroll">

        {/* Header band */}
        <div style={{ position: "relative", padding: "22px 26px 20px", borderBottom: "1px solid var(--c-line)", background: `linear-gradient(180deg, ${brandColor}18, transparent)` }}>
          <button onClick={onClose} className="btn" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30, padding: 0, fontSize: "var(--fs-lead)", lineHeight: 1 }} aria-label="Close" title="Close">✕</button>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: META.tint, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: META.tint }}/>{META.tag}
          </div>
          {(kind === "actor" || kind === "commercial") && (
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <span style={{ width: 46, height: 46, borderRadius: "var(--r-2)", background: brandColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{live.advertiser[0]}</span>
              <div style={{ minWidth: 0 }}>
                <h2 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-title)", margin: 0, lineHeight: 1 }}>{live.advertiser}</h2>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", marginTop: 6 }}>
                  {kind === "actor" ? `WANTS · ${live.performer}` : `IN · ${live.film}`} · {live.ago}{live.countered ? " · COUNTERED" : ""}
                </div>
              </div>
              <span style={{ marginLeft: "auto" }}><StatusTag status={live.status}/></span>
            </div>
          )}
          {kind === "film" && (
            <h2 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-head)", margin: 0, lineHeight: 1 }}>{live.film}</h2>
          )}
          {kind === "press" && (
            <h2 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-title)", margin: 0, lineHeight: 1.25 }}>"{live.quote}"</h2>
          )}
          {kind === "result" && (
            <h2 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-title)", margin: 0, lineHeight: 1 }}>{live.film}</h2>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "22px 26px 24px" }}>

          {kind === "actor" && (
            <>
              <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.6, margin: "0 0 8px" }}>{live.use}</p>
              <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6, fontStyle: "italic", margin: "0 0 20px" }}>"{live.note}"</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, padding: "16px 0", borderTop: "1px solid var(--c-line)", borderBottom: "1px solid var(--c-line)", marginBottom: 18 }}>
                <Row k={live.countered ? "FEE · COUNTERED" : "FEE"} v={prMoney(live.fee)} tint= "var(--c-amber)"/>
                <Row k="ROYALTY" v={live.royalty + "%"}/>
                <Row k="SCOPE" v={live.scope}/>
              </div>
              <Line k="Performer" v={live.performer}/>
              <Line k="Placement genres" v="Doc & Drama (your allow-list)"/>
              <Line k="Final-cut approval" v="Retained by you"/>
              <Line k="Est. lifetime value" v={prMoney(live.fee + live.fee * (live.royalty / 100) * 4)}/>
              {onOpenVault && (
                <button className="btn" onClick={() => { onClose(); onOpenVault(); }} style={{ height: 34, fontSize: "var(--fs-body)", padding: "0 14px", marginTop: 16 }}>
                  <Icon name="user" size={12}/> View {live.performer} in the Vault
                </button>
              )}
            </>
          )}

          {kind === "commercial" && (
            <>
              <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.6, margin: "0 0 6px" }}><b style={{ color: "var(--c-ink)" }}>{live.format}</b> · {live.placement}</p>
              <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6, fontStyle: "italic", margin: "0 0 20px" }}>"{live.spot}"</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, padding: "16px 0", borderTop: "1px solid var(--c-line)", borderBottom: "1px solid var(--c-line)", marginBottom: 18 }}>
                <Row k="AD SPEND" v={prMoney(live.spend)}/>
                <Row k={live.countered ? "SHARE · COUNTERED" : "YOUR SHARE"} v={prMoney(live.share)} tint= "var(--c-amber)"/>
                <Row k="SPLIT" v="70 / 30"/>
              </div>
              <Line k="Film" v={live.film}/>
              <Line k="Placement" v={live.placement}/>
              <Line k="Your cut (70%)" v={prMoney(live.share)}/>
              <Line k="Platform (30%)" v={prMoney(live.spend - live.share)} />
            </>
          )}

          {kind === "film" && (
            <>
              <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6, margin: "0 0 18px" }}>
                {live.paused ? "Spend is paused. Resume any time to keep advertisers running inside this film." : `${live.advertisers} advertiser${live.advertisers === 1 ? "" : "s"} are currently running paid placements inside this film.`}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, padding: "16px 0", borderTop: "1px solid var(--c-line)", borderBottom: "1px solid var(--c-line)", marginBottom: 18 }}>
                <Row k="AD SPEND" v={prMoney(live.spend)} tint= "var(--c-amber)"/>
                <Row k="YOUR SHARE · 70%" v={prMoney(live.spend * 0.7)} tint="var(--c-good)"/>
                <Row k="IMPRESSIONS" v={prCompact(live.impressions)}/>
                <Row k="COMPLETION" v={Math.round(live.completion * 100) + "%"}/>
              </div>
              <Line k="Reach" v={prCompact(live.reach)}/>
              <Line k="Active advertisers" v={String(live.advertisers)}/>
              <Line k="Effective CPM" v={prMoney((live.spend / live.impressions) * 1000)}/>
              <Line k="Status" v={live.paused ? "Paused" : "Live"}/>
              <button className="btn btn-primary" onClick={() => { bridge.togglePromoPause(live.filmId); window.toast?.((live.paused ? "Resumed" : "Paused") + " spend · " + live.film); }} style={{ height: 38, fontSize: "var(--fs-body)", marginTop: 18, width: "100%" }}>
                {live.paused ? "▶ Resume spend" : "❚❚ Pause spend"}
              </button>
            </>
          )}

          {kind === "press" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, padding: "4px 0 16px", borderBottom: "1px solid var(--c-line)", marginBottom: 18 }}>
                <Row k="OUTLET" v={live.outlet}/>
                <Row k="TYPE" v={live.kind === "press" ? "Press" : "Social"}/>
                <Row k="SENTIMENT" v={live.sentiment === "pos" ? "Positive" : live.sentiment === "neg" ? "Critical" : "Neutral"} tint={live.sentiment === "pos" ? "var(--c-good)" : live.sentiment === "neg" ? "var(--c-blood)" : "var(--c-ink-2)"}/>
              </div>
              <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6, margin: 0 }}>
                {live.ago} · Part of a {Math.round(s.pr.mentionsTrend * 100)}% rise in mentions this week, against {Math.round(s.pr.sentiment * 100)}% positive sentiment across {prCompact(s.pr.mentions)} total mentions.
              </p>
            </>
          )}

          {kind === "result" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, padding: "4px 0 16px", borderBottom: "1px solid var(--c-line)", marginBottom: 18 }}>
                <Row k="FUNDED" v={prMoney(live.funded)} tint= "var(--c-amber)"/>
                <Row k="RATING" v={live.rating ? "★ " + live.rating : "—"}/>
                <Row k="EPISODE" v={live.ep}/>
                <Row k="STATUS" v={live.ships === "shipped" ? "Shipped" : live.ships} tint={live.ships === "shipped" ? "var(--c-good)" : "var(--c-blood)"}/>
              </div>
              <Line k="When" v={live.when}/>
              <Line k="Audience share paid" v={prMoney(live.funded * 0.5)}/>
            </>
          )}

          {/* Actions for pending requests */}
          {(kind === "actor" || kind === "commercial") && !resolved && (
            counter ? (
              <div style={{ marginTop: 8 }}>
                <CounterEditor
                  fee={kind === "actor" ? live.fee : live.share}
                  royalty={kind === "actor" ? live.royalty : 30}
                  onSend={(patch) => {
                    if (kind === "actor") { bridge.counterActor(live.id, patch); window.toast?.("Counter sent · " + prMoney(patch.fee) + " / " + patch.royalty + "% to " + live.advertiser); }
                    else { bridge.counterCommercial(live.id, { share: patch.fee }); window.toast?.("Counter sent · " + prMoney(patch.fee) + " your share to " + live.advertiser); }
                    setCounter(false);
                  }}
                  onCancel={() => setCounter(false)}/>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                <button className="btn btn-primary" style={{ flex: 1, height: 42, fontSize: "var(--fs-body)" }} onClick={() => {
                  if (kind === "actor") { bridge.resolveActor(live.id, "approved"); window.toast?.("Approved · " + live.performer + " licensed to " + live.advertiser); }
                  else { bridge.resolveCommercial(live.id, "approved"); window.toast?.("Approved · " + live.advertiser + " runs in " + live.film); }
                }}>Approve · {prMoney(kind === "actor" ? live.fee : live.share)}</button>
                <button className="btn" style={{ height: 42, fontSize: "var(--fs-body)", padding: "0 16px" }} onClick={() => setCounter(true)}>Counter</button>
                <button className="btn" style={{ height: 42, fontSize: "var(--fs-body)", padding: "0 16px" }} onClick={() => {
                  if (kind === "actor") bridge.resolveActor(live.id, "declined"); else bridge.resolveCommercial(live.id, "declined");
                }}>Decline</button>
              </div>
            )
          )}
          {(kind === "actor" || kind === "commercial") && resolved && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22, paddingTop: 16, borderTop: "1px solid var(--c-line)" }}>
              <button className="btn" style={{ height: 34, fontSize: "var(--fs-body)", padding: "0 14px" }} onClick={() => { kind === "actor" ? bridge.reopenActor(live.id) : bridge.reopenCommercial(live.id); }}>↩ Reopen</button>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{live.status === "approved" ? prMoney(kind === "actor" ? live.fee : live.share) + " BOOKED" : "DECLINED"}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Shared bits ─────────────────────────────────────────────────────────
function PromoRule({ n, label, sub }) {
  return (
    <div className="pr-rule">
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", fontWeight: 600 }}>{n} · {label}</span>
      {sub && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{sub}</span>}
    </div>
  );
}
function PrTerm({ k, v, amber }) {
  return (
    <div>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>{k}</div>
      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: amber ? "var(--c-amber)" : "var(--c-ink)", marginTop: 3 }}>{v}</div>
    </div>
  );
}
function StatusTag({ status }) {
  if (status === "pending") return null;
  return status === "approved" ? <CinaPill tone="good">✓ Approved</CinaPill> : <CinaPill tone="bad">Declined</CinaPill>;
}
function EmptyNote({ text }) {
  return <div style={{ padding: "20px 16px", textAlign: "center", border: "1px dashed var(--c-line)", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>{text}</div>;
}

const PROMO_CSS = `
.pr-wrap { width: 100%; max-width: none; margin: 0; padding: 24px ${PR_GUT} 120px; }
.pr-head { padding: 12px 0 26px; }
.pr-ribbon { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: var(--c-line); border: 1px solid var(--c-line); border-radius: 12px; overflow: hidden; }
.pr-ribbon__cell { background: var(--c-panel); padding: 16px 20px; display: flex; flex-direction: column; gap: 5px; }
.pr-ribbon__k { font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .18em; color: var(--c-ink-4); text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
.pr-ribbon__v { font-family: var(--f-display); font-style: italic; font-size: clamp(26px,3.2vw,38px); line-height: 1; letter-spacing: -0.02em; }
.pr-ribbon__s { font-size:var(--fs-label); color: var(--c-ink-3); }
@media (max-width: 820px) { .pr-ribbon { grid-template-columns: repeat(2,1fr); } }

.pr-rule { display: flex; align-items: baseline; gap: 12px; margin: clamp(40px,5vw,56px) 0 18px; padding-top: 22px; border-top: 1px solid var(--c-line); flex-wrap: wrap; row-gap: 8px; }

.pr-inbox { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
@media (max-width: 900px) { .pr-inbox { grid-template-columns: 1fr; } }
.pr-inbox__col { display: flex; flex-direction: column; gap: 12px; }
.pr-colhead { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }
.pr-pill { font-family: var(--f-mono); font-size:var(--fs-label); min-width: 20px; height: 20px; padding: 0 6px; border-radius: 999px; background: rgba(var(--accent-rgb),.16); color: var(--c-amber); display: inline-flex; align-items: center; justify-content: center; }
.pr-card { background: var(--c-panel); border: 1px solid var(--c-line); border-radius: 12px; padding: 16px 18px; }
.pr-terms, .pr-promo-stats { display: grid; gap: 10px; padding-top: 12px; border-top: 1px solid var(--c-line); }
.pr-terms { grid-template-columns: repeat(3,1fr); }
.pr-promo-stats { grid-template-columns: repeat(4,1fr); }

.pr-promo { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
@media (max-width: 900px) { .pr-promo { grid-template-columns: 1fr; } }

.pr-press { display: grid; grid-template-columns: 1fr 1.2fr; gap: 18px; }
@media (max-width: 900px) { .pr-press { grid-template-columns: 1fr; } }
.pr-press__stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--c-line); border: 1px solid var(--c-line); border-radius: 12px; overflow: hidden; }
.pr-press-stat { background: var(--c-panel); padding: 18px 20px; }
.pr-press__feed { display: flex; flex-direction: column; gap: 1px; background: var(--c-line); border: 1px solid var(--c-line); border-radius: 12px; overflow: hidden; }
.pr-press-item { background: var(--c-panel); padding: 14px 18px; display: flex; gap: 11px; }

.pr-night { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
@media (max-width: 900px) { .pr-night { grid-template-columns: 1fr; } }
.pr-night__col { display: flex; flex-direction: column; }
.pr-result-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 13px 16px; background: var(--c-panel); border: 1px solid var(--c-line); border-radius: 10px; margin-bottom: 8px; }

/* Home band — Promotion control desk */
.prx { display: flex; flex-direction: column; border: 1px solid rgba(var(--accent-rgb),.26); border-radius: 14px; background: linear-gradient(180deg, rgba(var(--accent-rgb),.05), var(--c-panel) 42%); padding: 16px 16px 14px; }
.prx__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.prx__tag { display: inline-flex; align-items: center; gap: 8px; font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .2em; color: var(--c-amber); }
.prx__pulse { width: 6px; height: 6px; border-radius: 50%; background: var(--c-amber); box-shadow: 0 0 7px var(--c-amber); animation: prxPulse 1.8s ease-in-out infinite; }
@keyframes prxPulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
.prx__status { font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .1em; text-transform: uppercase; color: var(--c-amber); border: 1px solid rgba(var(--accent-rgb),.4); border-radius: 999px; padding: 3px 9px; }
.prx__hero { appearance: none; background: none; border: none; cursor: pointer; width: 100%; text-align: left; display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; padding: 0 0 14px; }
.prx__big { font-family: var(--f-display); font-style: italic; font-weight: 400; font-size: clamp(30px,4vw,40px); letter-spacing: -0.025em; color: var(--c-ink); line-height: .95; }
.prx__sub { font-size:var(--fs-label); color: var(--c-ink-3); margin-top: 6px; }
.prx__spark { width: 96px; height: 34px; flex-shrink: 0; overflow: visible; }
.prx__bar { display: flex; height: 9px; border-radius: 5px; overflow: hidden; gap: 2px; background: var(--c-line); }
.prx__barseg { height: 100%; border-radius: 2px; transition: width .5s cubic-bezier(.2,.8,.2,1); }
.prx__legend { display: flex; flex-wrap: wrap; gap: 6px 14px; margin: 10px 0 2px; }
.prx__leg { display: inline-flex; align-items: center; gap: 6px; font-size:var(--fs-label); color: var(--c-ink-3); }
.prx__leg b { color: var(--c-ink); font-weight: 600; font-family: var(--f-mono); font-size:var(--fs-label); }
.prx__dot { width: 7px; height: 7px; border-radius: 2px; }
.prx__rule { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 14px 0 9px; padding-top: 13px; border-top: 1px solid var(--c-line); font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .16em; color: var(--c-ink-3); }
.prx__films { display: flex; flex-direction: column; gap: 7px; }
.prx__film { display: grid; grid-template-columns: minmax(0,1fr) auto auto 78px; gap: 10px; align-items: center; }
.prx__filmname { font-family: var(--f-display); font-style: italic; font-size:var(--fs-body); color: var(--c-ink); letter-spacing: -0.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.prx__filmstat { font-family: var(--f-mono); font-size:var(--fs-label); color: var(--c-ink); white-space: nowrap; }
.prx__filmstat span { color: var(--c-ink-4); }
.prx__meter { position: relative; height: 16px; border-radius: 4px; background: var(--c-line); overflow: hidden; }
.prx__meter > span { position: absolute; inset: 0 auto 0 0; background: linear-gradient(90deg, rgba(106,163,122,.5), var(--c-good)); border-radius: 4px; }
.prx__meter > em { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: var(--f-mono); font-style: normal; font-size:var(--fs-label); color: var(--c-ink); }
.prx__inbox { display: flex; flex-direction: column; gap: 7px; }
.prx__req { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: var(--c-panel-2); border: 1px solid var(--c-line); border-radius: 9px; }
.prx__reqbrand { width: 4px; align-self: stretch; border-radius: 3px; flex-shrink: 0; }
.prx__reqtitle { font-size:var(--fs-body); color: var(--c-ink); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.prx__reqmeta { font-family: var(--f-mono); font-size:var(--fs-label); color: var(--c-ink-3); margin-top: 2px; }
.prx__reqmeta b { color: var(--c-amber); }
.prx__yes, .prx__no { width: 30px; height: 30px; flex-shrink: 0; border-radius: 7px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .14s; }
.prx__yes { background: var(--c-amber); color: var(--c-on-amber); border: none; }
.prx__yes:hover { filter: brightness(1.08); }
.prx__no { background: transparent; border: 1px solid var(--c-line-2); color: var(--c-ink-3); font-size:var(--fs-body); }
.prx__no:hover { border-color: var(--c-blood-x); color: var(--c-blood-x); }
.prx__clear { display: flex; align-items: center; gap: 8px; margin: 13px 0 2px; padding-top: 13px; border-top: 1px solid var(--c-line); font-size:var(--fs-label); color: var(--c-ink-3); }
.prx__clear svg { color: var(--c-good); }
.prx__open { appearance: none; cursor: pointer; margin-top: auto; height: 38px; border-radius: 9px; border: 1px solid var(--c-line-2); background: var(--c-panel-2); color: var(--c-ink-2); font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .14em; text-transform: uppercase; display: inline-flex; align-items: center; justify-content: center; gap: 7px; transition: all .14s; }
.prx__open:hover { border-color: var(--c-amber-d); color: var(--c-amber); background: rgba(var(--accent-rgb),.06); }

/* Pitch Night strip — tonight's bill as a lineup list */
.pr-pnstrip { border: 1px solid var(--c-line); border-radius: 12px; padding: 18px 20px; background: var(--c-panel); display: flex; flex-direction: column; }
.pr-pnstrip__head { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; row-gap: 12px; margin-bottom: 16px; }
.pr-pnstrip__list { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.pr-pnrow {
  display: grid; grid-template-columns: 24px 84px minmax(0,1fr) auto;
  gap: 14px; align-items: center; padding: 10px 14px 10px 12px;
  border: 1px solid var(--c-line); border-radius: 10px; background: var(--c-panel-2);
  transition: border-color .15s ease;
}
.pr-pnrow:hover { border-color: var(--c-line-3); }
.pr-pnrow__n { font-size:var(--fs-label); letter-spacing: .1em; color: var(--c-ink-4); }
.pr-pnrow__thumb { position: relative; width: 84px; height: 48px; border-radius: 6px; overflow: hidden; background: var(--c-panel); }
.pr-pnrow__thumb > * { position: absolute; inset: 0; width: 100%; height: 100%; }
.pr-pnrow--add {
  display: flex; align-items: center; justify-content: center; gap: 9px;
  grid-template-columns: none; border-style: dashed; cursor: pointer;
  background: transparent; color: var(--c-ink-3); font-size:var(--fs-body); font-family: var(--f-sans);
  min-height: 46px; flex: 1;
}
.pr-pnrow--add:hover { color: var(--c-amber); border-color: var(--c-amber); }
`;

// Inject the section CSS globally so PromoBand + PitchNightStudioStrip render
// correctly on the Slate home, where StudioPromotionPage isn't mounted.
(function () {
  if (typeof document === "undefined") return;
  if (document.getElementById("promo-css")) return;
  const s = document.createElement("style");
  s.id = "promo-css";
  s.textContent = PROMO_CSS;
  document.head.appendChild(s);
})();

Object.assign(window, { StudioPromotionPage, PromoBand, PitchNightStudioStrip, SubmitToNightModal });
