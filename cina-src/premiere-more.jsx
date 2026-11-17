// premiere-more.jsx — Festival, Account and Help on the Premiere system.

(function pmMoreCss() {
  if (document.getElementById("pm-more-css")) return;
  const s = document.createElement("style");
  s.id = "pm-more-css";
  s.textContent = `
.pm-acct{display:grid;grid-template-columns:20% minmax(0,1fr);gap:5%;align-items:start;width:100%}
.pm-acct__nav{position:sticky;top:6rem;display:flex;flex-direction:column}
.pm-acct__nav button{all:unset;cursor:pointer;padding:0.75rem 0;border-top:1px solid var(--c-line);font-family:var(--f-display);font-style:italic;font-size:var(--fs-title);line-height:1.1;color:var(--c-ink-3);transition:color .15s,transform .2s}
.pm-acct__nav button:last-child{border-bottom:1px solid var(--c-line)}
.pm-acct__nav button:hover{color:var(--c-ink);transform:translateX(4px)}
.pm-acct__nav button[data-on="1"]{color:var(--c-amber);font-weight:500}
.pm-acct .pm-wrap{padding-left:0;padding-right:0;max-width:none}
.pm-acct .pm-sec:first-child{margin-top:0}
.pm-faq{border-top:1px solid var(--c-line)}
.pm-faq:last-child{border-bottom:1px solid var(--c-line)}
.pm-faq>button{all:unset;box-sizing:border-box;cursor:pointer;width:100%;display:grid;grid-template-columns:2rem minmax(0,1fr) auto;gap:0.9rem;align-items:baseline;padding:1.1rem 0}
.pm-faq__q{font-family:var(--f-display);font-size:clamp(1.15rem,1.65vw,1.5rem);line-height:1.25;color:var(--c-ink);transition:color .15s}
.pm-faq>button:hover .pm-faq__q{color:var(--c-amber-x)}
.pm-faq__x{font-family:var(--f-mono);font-size:var(--fs-lead);color:var(--c-amber);transition:transform .2s;display:inline-block}
.pm-faq[data-open="1"] .pm-faq__x{transform:rotate(45deg)}
.pm-faq p{margin:0 0 1.4rem 2.9rem;max-width:64ch;font-size:var(--fs-body);line-height:1.65;color:var(--c-ink-2)}
.pm-cols3{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,28%),1fr));gap:2.5%;width:100%}
.pm-bignum{font-family:var(--f-display);font-style:italic;font-size:clamp(3.2rem,5.5vw,5.8rem);line-height:.9;letter-spacing:-0.04em;color:var(--c-ink)}
@media (max-width:56em){.pm-acct{grid-template-columns:1fr}.pm-acct__nav{position:static;flex-direction:row;flex-wrap:wrap;gap:0.5rem}.pm-acct__nav button{border:1px solid var(--c-line-2)!important;padding:0.5rem 0.9rem;font-size:var(--fs-lead);border-radius:0!important}.pm-acct__nav button[data-on="1"]{border-color:var(--c-amber)!important}.pm-faq p{margin-left:0}.pm-cols3{grid-template-columns:1fr}}
`;
  document.head.appendChild(s);
})();

// Every first Friday, 7 PM. The edition number counts on from the data's edition.
function pmNextEdition() {
  const E = window.FESTIVAL_EDITION || { number: 7, date: "2026-06-19T19:00:00" };
  const base = new Date(E.date), now = new Date();
  const firstFriday = (y, m) => { const d = new Date(y, m, 1, 19, 0, 0); while (d.getDay() !== 5) d.setDate(d.getDate() + 1); return d; };
  let d = firstFriday(now.getFullYear(), now.getMonth());
  if (d.getTime() + 4.5 * 3600e3 < now.getTime()) d = firstFriday(now.getFullYear(), now.getMonth() + 1);
  if (d < base) d = base;
  const months = (d.getFullYear() - base.getFullYear()) * 12 + d.getMonth() - base.getMonth();
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T19:00:00`;
  return { date: d, iso, number: E.number + Math.max(0, months), live: now >= d && now.getTime() < d.getTime() + 4.5 * 3600e3 };
}

function PmFestival() {
  const E = window.FESTIVAL_EDITION;
  const ed = umPm(pmNextEdition, []);
  const cd = typeof useCountdown === "function" ? useCountdown(ed.iso) : { d: 0, h: 0, m: 0, s: 0 };
  const session = window.useSession ? useSession() : null;
  const isHolder = !!(session && session.s && session.s.signedIn);
  const [detail, setDetail] = usPm(null);
  if (!E) return <div className="pm"><PmMasthead index="Festival" title="The festival is resting" lede="The next edition hasn't been announced yet."/></div>;
  const C = window.CATALOG || [];
  const lineup = (() => {
    const out = [], seen = new Set();
    const add = (f) => { if (!f) return; const k = String(f.title || f.id).toLowerCase(); if (seen.has(k)) return; seen.add(k); out.push(f); };
    (E.lineupIds || []).map(id => (typeof getFestivalFilm === "function" ? getFestivalFilm(id) : C.find(f => f.id === id))).forEach(add);
    (typeof FESTIVAL_ONLY !== "undefined" ? FESTIVAL_ONLY : []).forEach(add);
    for (const f of C) { if (out.length >= 12) break; if (!String(f.id).startsWith("pub-")) add(f); }
    return out.slice(0, 12);
  })();
  const openFilm = (f) => {
    if (window.FestivalFilmPage) { pmGo(`/festival/film/${f.id}`); return; }
    if (!C.some(c => c.id === f.id)) { setDetail(f); return; }
    pmGo(f.branched ? `/branches/${f.id}` : pmDest(f));
  };
  const dateLabel = ed.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const passes = [
    { name: "Regular", price: E.pass.regular, sub: "Watch from anywhere.", color: tkc("ink-3"), perks: ["Stream all 12 films live and on demand for 24h", "Live chat alongside the audience", "Audience-pick vote at 9:15 PM"] },
    { name: "Holder", price: E.pass.holder, sub: isHolder ? "You're in." : "Free for any Cina pass holder.", primary: true, highlight: isHolder, color: tkc("amber"), perks: ["Everything in Regular", "Voice rooms with all 12 directors at 9:30 PM", "Secondary-market unlocks at first frame", "One holder per room wins a 1:1 the next morning"] },
    { name: "Front row", price: E.pass.frontRow, sub: "The full experience.", color: tkc("bad"), perks: ["Everything in Holder", "Live Q&A queue with the directors on stage", "Afterparty lounge with spatial audio", "Numbered seat and your name in the credits"] },
  ];
  const takePass = (p) => {
    if (p.highlight) { pmScrollTo("pm-lineup"); return; }
    if (p.price === 0) { window.openSignIn ? openSignIn() : window.toast && toast({ title: "JOIN", text: "Holders enter free. Sign in to claim.", kind: "good" }); return; }
    window.openPay && openPay({ kind: "ticket", title: `${p.name} pass`, subtitle: `Cina Festival · Edition ${String(ed.number).padStart(2, "0")}`, accent: p.color, priceUSD: p.price, image: { kind: "festival", color: p.color }, perks: p.perks,
      ticker: `festival-${p.name.toLowerCase().replace(/\s+/g, "-")}`, ticketUrl: "/festival",
      onConfirm: () => { pmToggleReminder(`fest:${ed.iso}`, { label: `Cina Festival · Edition ${String(ed.number).padStart(2, "0")}`, sub: `${p.name} pass`, date: ed.iso.slice(0, 10), to: "/festival" }); } });
  };
  const submit = () => (window.openFestivalSubmit ? openFestivalSubmit() : pmGo("/about/contact"));
  let n = 0; const N = () => String(++n).padStart(2, "0");

  return (
    <div className="pm" data-screen-label="Festival">
      <PmHero image={lineup[0]?.thumb} color={tkc("black")}
        kicker={<><b>{ed.live ? "● Live now" : `Edition ${String(ed.number).padStart(2, "0")}`}</b> — {dateLabel} · 7:00 PM PT</>}
        title={<>A film festival, once a month, on the internet.</>}
        lede="Three guest curators pick twelve films you couldn't see anywhere else. We screen them once, live, in order. Then the room turns into voice channels with the directors."
        actions={<>
          <button className="pm-btn pm-btn--primary" onClick={() => pmScrollTo("pm-passes")}>{ed.live ? "Join the screening" : "Get a pass"}</button>
          <PmRemindBtn glass k={`fest:${ed.iso}`} info={{ label: `Cina Festival · Edition ${String(ed.number).padStart(2, "0")}`, sub: "Doors 6:30 PM PT", date: ed.iso.slice(0, 10), to: "/festival" }}/>
          <button className="pm-btn pm-btn--glass" onClick={submit}>Submit your film</button>
        </>}
        facts={[
          ["Doors open in", ed.live ? <b style={{ color: "var(--c-amber)" }}>Now</b> : <span className="t-mono" style={{ fontSize: "var(--fs-body)" }}>{cd.d}d {String(cd.h).padStart(2, "0")}h {String(cd.m).padStart(2, "0")}m {String(cd.s).padStart(2, "0")}s</span>],
          ["Premieres", `${lineup.length} · one running order`],
          ["Curators", (E.curators || []).map(c => c.name).join(", ")],
          ["Runtime", "4h 12m · live, then on demand"],
          ["Host", "Lin Hara"],
        ]}/>

      {(E.whatItIs || []).length > 0 && (
        <PmSection n={N()} title="How it works">
          <div className="pm-cols3">
            {E.whatItIs.map(s => (
              <div key={s.n} className="pm-panel" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <span className="pm-k"><b>{s.n}</b></span>
                <span className="pm-h2" style={{ fontSize: "var(--fs-title)" }}>{s.h}</span>
                <p className="pm-lede" style={{ fontSize: "var(--fs-body)" }}>{s.b}</p>
              </div>
            ))}
          </div>
        </PmSection>
      )}

      <PmSection n={N()} id="pm-lineup" title="Twelve premieres" note="Shown once, live, in running order">
        <div className="pm-grid" style={{ "--pm-min": "280px" }}>
          {lineup.map((f, i) => (
            <PmStill key={f.id + i} film={f} onClick={() => openFilm(f)} badge={{ t: `No. ${String(i + 1).padStart(2, "0")}${f.branched ? " · Branched" : ""}`, red: i === 0 }}
              meta={`${pmCreatorName(f) || f.creator || ""} · ${f.runtime || (f.totalEpisodes ? f.totalEpisodes + " EP" : "")}`} sub={f.logline}/>
          ))}
        </div>
      </PmSection>

      {(E.runOfShow || []).length > 0 && (
        <PmSection n={N()} title="Run of show" note="All times Pacific">
          <div className="pm-index">
            {E.runOfShow.map((r, i) => (
              <div key={i} className="pm-row" style={{ gridTemplateColumns: "88px minmax(0,1fr) auto", cursor: "default" }}>
                <span className="pm-k"><b>{r.t}</b></span>
                <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  <span className="pm-index__name" style={{ fontSize: "clamp(22px, 2.2vw, 32px)" }}>{r.label}</span>
                  <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>{r.sub}</span>
                </span>
                <span className="pm-k">{r.phase}{r.dur > 0 ? ` · ${r.dur} min` : ""}</span>
              </div>
            ))}
          </div>
        </PmSection>
      )}

      {(E.curators || []).length > 0 && (
        <PmSection n={N()} title="The curators" note="Each picks four">
          <div className="pm-cols3">
            {E.curators.map(c => (
              <div key={c.initials} className="pm-panel" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <span className="pm-bignum" style={{ color: "var(--c-ink-3)" }}>{c.initials}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><span style={{ fontSize: "var(--fs-lead)" }}>{c.name}</span><span className="pm-k">{c.role}</span></div>
                <blockquote style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.35, color: "var(--c-ink)" }}>“{c.pick}”</blockquote>
              </div>
            ))}
          </div>
        </PmSection>
      )}

      <PmSection n={N()} id="pm-passes" title="Pick how you watch" note="Every pass gets all twelve films">
        <div className="pm-grid" style={{ "--pm-min": "260px" }}>
          {passes.map(p => (
            <div key={p.name} className="pm-panel" style={{ display: "flex", flexDirection: "column", gap: 16, borderTopColor: p.primary ? "var(--c-amber)" : undefined, borderTopWidth: p.primary ? 2 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <span className="pm-h2" style={{ fontSize: "var(--fs-title)" }}>{p.name}</span>
                <span className="pm-stat__v" style={{ fontSize: "var(--fs-title)" }}>{p.price === 0 ? "Free" : `$${p.price}`}</span>
              </div>
              <span className="pm-k">{p.primary ? <b>{p.highlight ? "You're in · " : "Most pick this · "}</b> : null}{p.sub}</span>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {p.perks.map(k => <li key={k} style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", paddingLeft: 16, position: "relative", lineHeight: 1.45 }}><span style={{ position: "absolute", left: 0, color: "var(--c-amber)" }}>—</span>{k}</li>)}
              </ul>
              <button className={"pm-btn" + (p.primary ? " pm-btn--primary" : "")} style={{ marginTop: "auto", justifyContent: "center" }} onClick={() => takePass(p)}>{p.highlight ? "Enter the festival" : p.price === 0 ? "Sign in to claim" : `Buy ${p.name}`}</button>
            </div>
          ))}
        </div>
      </PmSection>

      {(typeof FestivalVotePayout === "function" || typeof window.FestivalStandings === "function") && (
        <PmSection n={N()} title="The vote" note="Audience pick and prize payout">
          {typeof FestivalVotePayout === "function" && <FestivalVotePayout lineup={lineup}/>}
          {typeof window.FestivalStandings === "function" && <window.FestivalStandings/>}
        </PmSection>
      )}

      {typeof FestivalWinnersSection === "function" && <PmSection n={N()} title="Past winners"><FestivalWinnersSection/></PmSection>}

      <PmSection n={N()} title="After the screening">
        <div className="pm-duo" style={{ alignItems: "stretch" }}>
          <div className="pm-panel" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span className="pm-k"><b>For filmmakers</b> · submissions open</span>
            <span className="pm-h2" style={{ fontSize: "var(--fs-head)" }}>Made something? Get it in front of the room.</span>
            <p className="pm-lede" style={{ fontSize: "var(--fs-body)" }}>Free for verified Cina creators with a minted film. The curators watch everything; there's no algorithm and no gatekeeper inbox.</p>
            <div style={{ marginTop: "auto" }}><button className="pm-btn" onClick={submit}>Submit your film</button></div>
          </div>
          <div className="pm-panel" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span className="pm-k"><b>Holder rooms</b> · 9:30 PM</span>
            <span className="pm-h2" style={{ fontSize: "var(--fs-head)" }}>The afterparty is yours.</span>
            <p className="pm-lede" style={{ fontSize: "var(--fs-body)" }}>Voice rooms with every director who premiered tonight. Secondary listings unlock instantly, and one holder per room is drawn for a call with the director the next morning.</p>
            <div style={{ marginTop: "auto" }}><button className="pm-btn" onClick={() => isHolder ? pmGo("/rooms") : window.openSignIn && openSignIn()}>{isHolder ? "Pick a room" : "Sign in to enter"}</button></div>
          </div>
        </div>
      </PmSection>

      {typeof PAST_FESTIVALS !== "undefined" && PAST_FESTIVALS.length > 0 && (
        <PmSection n={N()} title="Past editions" note="The record">
          <div className="pm-index">
            {PAST_FESTIVALS.map(p => (
              <div key={p.number} className="pm-row" style={{ gridTemplateColumns: "72px minmax(0,1fr) auto", cursor: "default" }}>
                <span className="pm-k"><b>Vol. {String(p.number).padStart(2, "0")}</b></span>
                <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  <span className="pm-index__name" style={{ fontSize: "clamp(20px, 2vw, 30px)" }}>{p.headline}</span>
                  <span className="pm-k">{new Date(p.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                </span>
                <span className="pm-k" style={{ textAlign: "right" }}>{p.attended.toLocaleString()} attended<br/>${(p.sales / 1e6).toFixed(2)}M in sales</span>
              </div>
            ))}
          </div>
        </PmSection>
      )}

      {detail && typeof FestFilmDetail === "function" && <FestFilmDetail film={detail} onClose={() => setDetail(null)} onPass={() => { setDetail(null); pmScrollTo("pm-passes"); }}/>}
    </div>
  );
}

const PM_ACCT = [
  ["profile", "Profile", "ProfileSection"],
  ["appearance", "Display & mood", "AppearanceSection"],
  ["playback", "Playback", "PlaybackSection"],
  ["billing", "Plan & billing", "BillingSection"],
  ["portfolio", "Portfolio", null],
  ["subs", "Subscriptions", null],
  ["wallet", "Wallet", "WalletSettingsSection"],
  ["alerts", "Notifications", "AlertsSection"],
  ["privacy", "Privacy & data", "PrivacySection"],
  ["danger", "Sign out", "DangerSection"],
];

function PmAccount({ initial }) {
  useSession && useSession();
  usePmState();
  const [sec, setSec] = usPm(() => initial || (location.hash.match(/[?&]tab=(\w+)/) || [])[1] || "profile");
  const S = window.SESSION || {};
  const subs = pmSubs(), rems = pmReminders();
  const cur = PM_ACCT.find(x => x[0] === sec) || PM_ACCT[0];
  const Comp = cur[2] && window[cur[2]];
  return (
    <div className="pm" data-screen-label="Account">
      <PmMasthead index="Account" path={S.handle || S.email || "You"} title="Settings" lede="Your profile, plan, wallet, subscriptions and how Cina behaves on every device.">
        <button className="pm-chip" onClick={() => pmGo("/library")}>Library</button>
        <button className="pm-chip" onClick={() => pmGo("/wallet")}>Wallet</button>
        <button className="pm-chip" onClick={() => pmGo("/settings/family")}>Family & parental controls</button>
        <button className="pm-chip" onClick={() => pmGo("/help")}>Help</button>
      </PmMasthead>
      <section className="pm-wrap">
        <div className="pm-acct">
          <nav className="pm-acct__nav" aria-label="Settings sections">
            {PM_ACCT.map(([id, label]) => <button key={id} data-on={sec === id ? "1" : "0"} onClick={() => setSec(id)}>{label}</button>)}
          </nav>
          <div className="pm-legacy" style={{ minWidth: 0, paddingBottom: 0 }}>
            <div className="pm-sec__head" style={{ marginTop: 0 }}><div className="pm-sec__titles"><h2 className="pm-h2">{cur[1]}</h2></div><span></span></div>
            {sec === "portfolio" ? (window.PmWallet ? <div className="pm" style={{ paddingBottom: 0 }}><PmWallet embedded/></div> : null) : sec === "subs" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                {subs.length ? (
                  <div className="pm-index">
                    {subs.map(s => (
                      <div key={s.id} className="pm-row" style={{ gridTemplateColumns: "minmax(0,1fr) auto auto" }}>
                        <button className="pm-card" onClick={() => pmGo(s.to || `/studios/${s.id}`)} style={{ gap: 4 }}>
                          <span className="pm-index__name" style={{ fontSize: "clamp(22px, 2.2vw, 30px)" }}>{s.name}</span>
                          <span className="pm-k">{s.plan} plan · since {new Date(s.at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                        </button>
                        <span className="pm-stat__v" style={{ fontSize: "var(--fs-title)" }}>{`$${s.price}/mo`}</span>
                        <span className="pm-row__act"><button className="pm-btn pm-btn--sm" onClick={() => pmCancelSub(s.id, s.name)}>Cancel</button></span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <PmEmpty title="No studio subscriptions yet." body="Subscribing pays the filmmakers directly and unlocks every title they publish.">
                    <button className="pm-btn pm-btn--primary" onClick={() => pmGo("/studios")}>Browse studios</button>
                  </PmEmpty>
                )}
                {subs.length > 0 && <div className="pm-stats pm-panel"><div className="pm-stat"><span className="pm-k">Monthly total</span><span className="pm-stat__v">{`$${subs.reduce((a, s) => a + (+s.price || 0), 0).toFixed(2)}`}</span></div><div className="pm-stat"><span className="pm-k">Studios</span><span className="pm-stat__v">{subs.length}</span></div><div className="pm-stat"><span className="pm-k">Reminders</span><span className="pm-stat__v">{rems.length}</span></div></div>}
              </div>
            ) : Comp ? <Comp/> : <PmEmpty title="This section isn't available." body="Try another section, or contact support."/>}
          </div>
        </div>
      </section>
    </div>
  );
}

function PmHelp() {
  const T = window.HELP_TOPICS || [];
  const [q, setQ] = usPm("");
  const [topic, setTopic] = usPm(T[0]?.id);
  const [open, setOpen] = usPm(null);
  const needle = q.trim().toLowerCase();
  const results = umPm(() => !needle ? null : T.flatMap(t => t.faqs.map((f, i) => ({ ...f, topic: t.label, id: t.id + i }))).filter(f => (f.q + " " + f.a).toLowerCase().includes(needle)), [needle]);
  const active = T.find(t => t.id === topic) || T[0];
  const row = (f, id, label) => (
    <div key={id} className="pm-faq" data-open={open === id ? "1" : "0"}>
      <button onClick={() => setOpen(open === id ? null : id)} aria-expanded={open === id}>
        <span className="pm-faq__x">+</span>
        <span className="pm-faq__q">{f.q}</span>
        {label ? <span className="pm-k">{label}</span> : <span></span>}
      </button>
      {open === id && <p>{f.a}</p>}
    </div>
  );
  return (
    <div className="pm" data-screen-label="Help">
      <header className="pm-mast pm-wrap">
        <div className="pm-mast__top"><span className="pm-k"><b>Help center</b></span><span className="pm-k"><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "var(--c-good)", marginRight: 8 }}></span>All systems normal</span></div>
        <div className="pm-mast__body">
          <h1 className="pm-xl">How can we help?</h1>
          <p className="pm-lede">Answers on watching, holding, royalties and running a studio. If you can't find it, a person answers within a day.</p>
        </div>
        <label className="pm-search" style={{ marginTop: "clamp(28px, 3.5vw, 48px)" }}>
          <Icon name="search" size={24}/>
          <input value={q} onChange={e => { setQ(e.target.value); setOpen(null); }} placeholder="Refunds, royalties, watch parties…" style={{ fontSize: "clamp(26px, 3vw, 44px)" }}/>
          {q && <button className="pm-arrow" aria-label="Clear" onClick={(e) => { e.preventDefault(); setQ(""); }}><Icon name="x" size={14}/></button>}
        </label>
        {!results && <div className="pm-mast__tools"><PmChips options={T.map(t => ({ value: t.id, label: t.label }))} value={topic} onChange={(v) => { setTopic(v); setOpen(null); }}/></div>}
      </header>

      {results ? (
        <PmSection n="01" title={results.length ? "Answers" : "Nothing matched"} note={`${results.length} result${results.length === 1 ? "" : "s"}`}>
          {results.length ? <div>{results.map(f => row(f, f.id, f.topic))}</div> : (
            <PmEmpty title={`No answers for “${q}”.`} body="Try a different word, or write to us and we'll answer directly.">
              <button className="pm-btn pm-btn--primary" onClick={() => pmGo("/about/contact")}>Contact support</button>
            </PmEmpty>
          )}
        </PmSection>
      ) : active && (
        <PmSection n="01" title={active.label} note={`${active.faqs.length} questions`}>
          <div>{active.faqs.map((f, i) => row(f, active.id + i))}</div>
        </PmSection>
      )}

      <PmSection n="02" title="Still stuck?">
        <div className="pm-cols3">
          {[["Contact support", "support@cina.studio. A person answers within a day.", "/about/contact", "Write to us"], ["Your account", "Plan, billing, devices and privacy.", "/account", "Open settings"], ["Download the app", "Watch offline on every device.", "/download", "Get the app"]].map(([h, b, to, cta]) => (
            <div key={h} className="pm-panel" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span className="pm-h2" style={{ fontSize: "var(--fs-title)" }}>{h}</span>
              <p className="pm-lede" style={{ fontSize: "var(--fs-body)" }}>{b}</p>
              <div style={{ marginTop: "auto" }}><button className="pm-btn pm-btn--sm" onClick={() => pmGo(to)}>{cta}</button></div>
            </div>
          ))}
        </div>
      </PmSection>
    </div>
  );
}

Object.assign(window, { PmFestival, PmAccount, PmHelp, pmNextEdition });
