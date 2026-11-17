// watch-help.jsx — /help (help center) + /download (apps & offline).
// Replaces the last two "coming soon" placeholder routes with real pages.
const { useState: usHC, useMemo: umHC } = React;

const HELP_TOPICS = [
  { id: "watching", label: "Watching", icon: "play", faqs: [
    { q: "What's the difference between renting and holding a film?", a: "Renting gives you 72 hours of streaming. Holding — buying the film's token — gives you permanent access, holder-room invites, and a share of the film's royalty pool where the director has opened one. You can always upgrade a rental to a hold; the rental price is credited." },
    { q: "What is branched cinema?", a: "Some films fork. At a fork, the room votes live and the winning cut plays on. The losing branches stay watchable afterwards — your cut path is saved to your library, and holders can lock a personal canon." },
    { q: "How do watch parties work?", a: "Open any film → Watch together. You get a room link; playback is synced for everyone, with chat between reels. Parties on branched films vote as one row." },
    { q: "Why did a film leave my Continue Watching?", a: "Finished films move to History automatically. Anything you abandoned mid-way stays for 90 days. You can pin a film to your Watchlist to keep it around indefinitely." },
  ]},
  { id: "money", label: "Payments & royalties", icon: "wallet", faqs: [
    { q: "How do royalty payouts work?", a: "Films with an open royalty pool split a share of net revenue across holders, monthly. Your Payouts page shows every accrual; claiming settles to your wallet. Unclaimed royalties roll over — nothing expires." },
    { q: "What payment methods can I use?", a: "Card, Apple Pay, or a connected wallet. Fiat purchases custody the token for you; connect a wallet any time to withdraw to self-custody." },
    { q: "How do refunds work?", a: "Rentals are refundable within 30 minutes if you've watched less than 5 minutes. Token purchases settle on-chain and can't be reversed, but they can be resold on the open market from your portfolio." },
    { q: "Where are my invoices?", a: "Account → Billing keeps every receipt. Producers tax statements (1099-DIV equivalents) are under Payouts → Tax statements each January." },
  ]},
  { id: "studios", label: "For filmmakers", icon: "film", faqs: [
    { q: "How do I get my film on Cina?", a: "Apply from the Studios page. Films made in Cina Studio publish directly — the publish wizard walks pricing, royalty split, and premiere slot. Outside work goes through a short curation review, usually under a week." },
    { q: "What does the studio site builder cost?", a: "Free covers 5 sections and the core fonts on a cina.site subdomain. Pro unlocks the full font library, unlimited sections, forms and the media library. Enterprise adds apex domains and code injection." },
    { q: "How do royalty pools get funded?", a: "You set the holder share at mint — most directors open 10–25% of net. Cina takes 10% of gross; everything else routes by your split, on-chain, monthly." },
  ]},
  { id: "account", label: "Account & devices", icon: "user", faqs: [
    { q: "How do I change my plan?", a: "Account → Plan. Switches take effect immediately; downgades prorate the difference as credit. Family controls live under Settings → Family." },
    { q: "Can I share my account?", a: "A plan covers one household — up to 5 profiles, 3 concurrent streams. Holder benefits (rooms, commentary tracks) follow the profile that holds the token." },
    { q: "How do I delete my account?", a: "Account → Danger zone. You'll get a data export first; holdings must be withdrawn or sold before deletion since we can't custody tokens for a closed account." },
  ]},
];

function HelpCenterPage() {
  const [q, setQ] = usHC("");
  const [topic, setTopic] = usHC("watching");
  const [openId, setOpenId] = usHC(null);
  const needle = q.trim().toLowerCase();
  const results = umHC(() => {
    if (!needle) return null;
    const out = [];
    HELP_TOPICS.forEach(t => t.faqs.forEach((f, i) => {
      if ((f.q + " " + f.a).toLowerCase().includes(needle)) out.push({ ...f, topic: t.label, id: t.id + i });
    }));
    return out;
  }, [needle]);
  const active = HELP_TOPICS.find(t => t.id === topic);
  const faqRow = (f, id, topicLabel) => (
    <div key={id} style={{ borderBottom: "1px solid var(--c-line)" }}>
      <button onClick={() => setOpenId(openId === id ? null : id)} style={{
        width: "100%", display: "flex", alignItems: "baseline", gap: 14, padding: "18px 4px",
        background: "transparent", border: "none", cursor: "pointer", textAlign: "left", color: "var(--c-ink)",
      }}>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: openId === id ? "var(--c-amber)" : "var(--c-ink-4)", flexShrink: 0, transition: "transform .18s ease", display: "inline-block", transform: openId === id ? "rotate(45deg)" : "none" }}>+</span>
        <span style={{ flex: 1, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", letterSpacing: "-0.01em" }}>{f.q}</span>
        {topicLabel && <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase", flexShrink: 0 }}>{topicLabel}</span>}
      </button>
      {openId === id && <p style={{ margin: "0 0 20px 26px", maxWidth: 640, fontSize: "var(--fs-body)", lineHeight: 1.65, color: "var(--c-ink-2)", textWrap: "pretty" }}>{f.a}</p>}
    </div>
  );
  return (
    <div style={{ padding: "48px var(--gutter) 80px", maxWidth: "var(--w-mid)", margin: "0 auto" }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 14 }}>HELP CENTER</div>
      <h1 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "clamp(38px, 5vw, 56px)", margin: "0 0 10px", letterSpacing: "-0.02em" }}>How can we help?</h1>
      <p style={{ fontSize: "var(--fs-lead)", color: "var(--c-ink-3)", margin: "0 0 28px", maxWidth: 560, lineHeight: 1.6 }}>Answers on watching, holding, royalties, and running a studio. Can't find it? <a href="#/about/contact" style={{ color: "var(--c-amber)" }}>Contact us</a> — a person answers within a day.</p>
      <input value={q} onChange={e => { setQ(e.target.value); setOpenId(null); }} placeholder="Search — refunds, royalties, watch parties…" className="input" style={{ width: "100%", maxWidth: 560, height: 48, fontSize: "var(--fs-body)", marginBottom: 34 }}/>
      {results ? (
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 6 }}>{results.length} ANSWER{results.length === 1 ? "" : "S"}</div>
          {results.map(f => faqRow(f, f.id, f.topic))}
          {!results.length && <EmptyState icon="inbox" title="Nothing matched" body="Try a different word — or write to us and we'll answer directly." cta={<button className="btn btn-md btn-primary" onClick={() => navigate("/about/contact")}>Contact support</button>}/>}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 36, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {HELP_TOPICS.map(t => (
              <button key={t.id} onClick={() => { setTopic(t.id); setOpenId(null); }} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: "var(--r-2)",
                background: topic === t.id ? "rgba(var(--accent-rgb),.08)" : "transparent",
                border: `1px solid ${topic === t.id ? "rgba(var(--accent-rgb),.3)" : "transparent"}`,
                color: topic === t.id ? "var(--c-amber)" : "var(--c-ink-2)", cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase", textAlign: "left",
              }}>{t.label}</button>
            ))}
            <div style={{ marginTop: 18, padding: "14px 12px", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 6 }}>STATUS</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 6px var(--c-good)" }}></span>
                <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>All systems normal</span>
              </div>
            </div>
          </div>
          <div>{active.faqs.map((f, i) => faqRow(f, active.id + i))}</div>
        </div>
      )}
    </div>
  );
}

function DownloadPage() {
  const wl = (() => { try { return (window.USER && window.USER.watchlist) || []; } catch { return []; } })();
  const picks = (window.CATALOG || []).slice(0, 3);
  return (
    <div style={{ padding: "0 var(--gutter) 96px", maxWidth: "var(--w-page)", margin: "0 auto" }}>
      <PmMasthead bare index="Apps" path="Offline" title="Take the cinema with you." lede="Cina runs anywhere the web does — phone, tablet, TV browser — with one account and one library. Native apps with offline downloads are in closed beta."/>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 40 }}>
        <div style={{ padding: "22px 24px", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-good)", marginBottom: 10 }}>AVAILABLE NOW</div>
          <h3 style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, margin: "0 0 8px" }}>The web app</h3>
          <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6, margin: "0 0 16px" }}>Fully responsive — add it to your home screen and it opens full-screen like a native app, with your session intact.</p>
          <button className="btn btn-md btn-primary" onClick={() => navigate("/browse")}>Start watching</button>
        </div>
        <div style={{ padding: "22px 24px", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", marginBottom: 10 }}>CLOSED BETA</div>
          <h3 style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, margin: "0 0 8px" }}>iOS & Android, with offline</h3>
          <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6, margin: "0 0 16px" }}>Download rentals and holdings for planes and trains. Holders get beta invites first — we send a wave every other Friday.</p>
          <button className="btn btn-md" onClick={() => { if (window.toast) toast({ title: "ON THE LIST", text: "You'll get an invite in the next beta wave.", kind: "good" }); }}>Join the waitlist</button>
        </div>
        <div style={{ padding: "22px 24px", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 10 }}>IN DESIGN</div>
          <h3 style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, margin: "0 0 8px" }}>Living-room apps</h3>
          <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6, margin: 0 }}>Apple TV and Android TV, built around premieres and rooms — the couch is where branched cinema gets loud.</p>
        </div>
      </div>
      {picks.length > 0 && (
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 12 }}>MEANWHILE · TONIGHT ON THE WEB</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            {picks.map(f => (
              <FilmTile key={f.id} thumb={f.thumb} color={f.color} title={f.title} subtitle={f.creator} rating={f.rating}
                onClick={() => navigate(f.kind === "series" ? `/series/${f.id}` : `/film/${f.id}`)}
                footer={<div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{f.title}</span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase" }}>{f.creator}</span>
                </div>}/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { HelpCenterPage, DownloadPage, HELP_TOPICS });
