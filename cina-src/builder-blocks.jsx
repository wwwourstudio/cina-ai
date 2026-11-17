// builder-blocks.jsx — Studio Builder content blocks (heroes, shelves, store, blog, footer…).

const { useState: usbBl, useEffect: uebBl, useRef: urbBl } = React;
// ─── Parallax hero ──────────────────────────────────────────────────────

function ParallaxHero({ section, t, headlineFont, accent, maxColumn, narrow }) {
  const [scrollY, setScrollY] = usbBl(0);
  const rootRef = urbBl(null);
  uebBl(() => {
    // Listen to the nearest scrollable ancestor (builder canvas or published
    // page scroller), not window — inside inner panes window never scrolls.
    let el = rootRef.current && rootRef.current.parentElement;
    while (el && el !== document.body) {
      const s = getComputedStyle(el);
      if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight) break;
      el = el.parentElement;
    }
    const target = el && el !== document.body ? el : window;
    const read = () => setScrollY(target === window ? window.scrollY : target.scrollTop);
    target.addEventListener("scroll", read, { passive: true });
    read();
    return () => target.removeEventListener("scroll", read);
  }, []);
  const drift = (section.props.parallax || 0.4) * scrollY;
  return (
    <div ref={rootRef} style={{
      position: "relative", minHeight: 640, color: t.ink,
      overflow: "hidden",
    }}>
      <BgImage id={section.props.bgImage || "noir-rain"} src={section.props.bgSrc} overlay={section.props.overlay ?? 0.55} parallaxY={-drift}/>
      <div style={{
        position: "relative", maxWidth: maxColumn, margin: "0 auto", padding: narrow ? "120px 24px 80px" : "180px 32px 120px",
        zIndex: 2,
      }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: accent, letterSpacing: ".16em", marginBottom: 22, textTransform: "uppercase", fontWeight: 700 }}>
          {section.props.kicker}
        </div>
        <h1 style={{
          fontFamily: headlineFont, fontStyle: "italic",
          fontSize: `clamp(${(narrow ? 52 : 72) * t.fontScale}px, ${narrow ? 15 : 9}cqi, ${144 * t.fontScale}px)`, fontWeight: 400, lineHeight: 0.93,
          margin: "0 0 28px", letterSpacing: "-0.02em", color: tkc("ink"),
          textShadow: "0 4px 24px rgba(0,0,0,.6)",
        }}>{section.props.title}</h1>
        <p style={{ fontSize: 22 * t.fontScale, color: "rgba(240,231,223,.92)", maxWidth: 640, lineHeight: 1.45, textShadow: "0 2px 12px rgba(0,0,0,.5)" }}>{section.props.sub}</p>
        {section.props.cta && (
          <a href={section.props.cta.href || "#"} onClick={(e) => {
            const h = section.props.cta.href || "";
            if (h.startsWith("#")) { e.preventDefault(); wbScrollToSectionV2(h.slice(1)); }
            else if (/^https?:\/\//.test(h)) { e.preventDefault(); window.open(h, "_blank", "noopener"); }
          }} style={{
            display: "inline-block", marginTop: 32,
            padding: "14px 24px", background: accent, color: t.bg,
            borderRadius: 999, textDecoration: "none",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", letterSpacing: ".16em",
            fontWeight: 700, textTransform: "uppercase",
            boxShadow: `0 10px 32px ${accent}55`,
          }}>{section.props.cta.label} →</a>
        )}
      </div>
    </div>
  );
}

// ─── Video hero ─────────────────────────────────────────────────────────

function VideoHero({ section, t, headlineFont, accent }) {
  return (
    <div style={{ position: "relative", minHeight: 580, overflow: "hidden", color: t.ink }}>
      <BgImage id="smoke" overlay={0.4}/>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
        <div style={{
          width: 92, height: 92, borderRadius: "50%",
          background: "rgba(0,0,0,.6)", backdropFilter: "blur(10px)",
          border: `2px solid ${accent}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "var(--fs-head)", color: accent,
          cursor: "pointer",
        }}>▶</div>
      </div>
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, padding: "40px 48px",
        background: "linear-gradient(180deg, transparent, rgba(0,0,0,.8))",
      }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 8 }}>{section.props.kicker}</div>
        <h1 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 84 * t.fontScale, fontWeight: 400, margin: 0, lineHeight: 1, letterSpacing: "-0.02em", color: tkc("ink") }}>{section.props.title}</h1>
        <p style={{ fontSize: 16 * t.fontScale, opacity: 0.78, marginTop: 12, maxWidth: 540 }}>{section.props.sub}</p>
      </div>
    </div>
  );
}

// ─── Branched shelf ─────────────────────────────────────────────────────

function BranchedShelf({ t, accent, headlineFont, section }) {
  const allFilms = [
    { id: "frequency", title: "Frequency 88.6", forks: 4, cuts: 81, room: 2840, status: "LIVE" },
    { id: "marauder",  title: "Marauder",       forks: 4, cuts: 81, room: 1410, status: "LIVE" },
    { id: "swallows",  title: "The Swallows",   forks: 4, cuts: 81, room: 982,  status: "LIVE" },
  ];
  const films = allFilms.slice(0, section.props.count || 3);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 26 }}>
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 8, textTransform: "uppercase" }}>● BRANCHED CINEMA</div>
          <h2 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 44 * t.fontScale, fontWeight: 500, margin: 0, letterSpacing: "-0.02em" }}>{section.props.headline}</h2>
        </div>
        <a href="#" onClick={(e) => { e.preventDefault(); wbGo(e, "/branches"); }} style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", textDecoration: "none", fontWeight: 700 }}>ALL ROOMS →</a>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 18 }}>
        {films.map((f, i) => (
          <div key={f.id} onClick={(e) => wbGo(e, `/film/${f.id}`)} style={{
            background: `${accent}08`, border: `1px solid ${accent}33`, borderRadius: "var(--r-2)", overflow: "hidden",
            cursor: "pointer",
          }}>
            <div style={{
              position: "relative", aspectRatio: "16/9", overflow: "hidden",
              background: `linear-gradient(${i * 73}deg, ${accent}66, ${tkc("black")} 80%)`,
            }}>
              {window.FrameThumb && <FrameThumb kind={(typeof getFilm === "function" && getFilm(f.id)?.thumb) || f.id} usePhoto/>}
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${accent}22, transparent 60%)` }}></div>
              <div style={{
                position: "absolute", top: 12, left: 12,
                padding: "3px 8px", background: "rgba(201,85,72,.18)", border: "1px solid rgba(201,85,72,.5)",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-blood-l)", letterSpacing: ".16em", fontWeight: 700, borderRadius: "var(--r-1)",
              }}>● {f.status}</div>
              <div style={{
                position: "absolute", top: 12, right: 12,
                padding: "3px 8px", background: "rgba(0,0,0,.7)",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tkc("white"), letterSpacing: ".16em",
              }}>{f.room.toLocaleString()} watching</div>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, lineHeight: 1, letterSpacing: "-0.01em" }}>{f.title}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginTop: 8, fontWeight: 700 }}>{f.forks} FORKS · {f.cuts} CUTS POSSIBLE</div>
              <button onClick={(e) => wbGo(e, `/film/${f.id}`)} style={{
                marginTop: 12, width: "100%", padding: "10px 14px",
                background: accent, color: t.bg, border: "none", borderRadius: "var(--r-1)", cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
              }}>Join the room →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Episodes shelf ─────────────────────────────────────────────────────

function EpisodesShelf({ t, accent, headlineFont, section }) {
  const allEps = [
    { n: "01", title: "The Booth",      runtime: "24m", drop: "JUN 14" },
    { n: "02", title: "The Voice",      runtime: "26m", drop: "JUN 21" },
    { n: "03", title: "The Door",       runtime: "22m", drop: "JUN 28" },
    { n: "04", title: "The Choice",     runtime: "24m", drop: "JUL 05" },
  ];
  const eps = allEps.slice(0, section.props.count || 4);
  return (
    <div>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 8, textTransform: "uppercase" }}>SERIES · WEEKLY DROPS</div>
      <h2 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 44 * t.fontScale, fontWeight: 500, margin: "0 0 26px", letterSpacing: "-0.02em" }}>{section.props.headline}</h2>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {eps.map((ep, i) => (
          <div key={ep.n} style={{
            display: "grid", gridTemplateColumns: "60px 1.5fr 1fr 80px auto", gap: 22, alignItems: "center",
            padding: "18px 0", borderTop: i === 0 ? `1px solid ${accent}55` : "none",
            borderBottom: `1px solid ${accent}22`,
          }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-title)", color: accent, fontWeight: 600 }}>{ep.n}</div>
            <div>
              <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, lineHeight: 1.1 }}>{ep.title}</div>
            </div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.55, letterSpacing: ".16em" }}>DROPS {ep.drop}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".08em" }}>{ep.runtime}</div>
            <button onClick={(e) => wbGo(e, "/series/ll")} style={{
              padding: "8px 14px", background: "transparent", color: accent,
              border: `1px solid ${accent}`, borderRadius: 999, cursor: "pointer",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
            }}>Watch</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Trailers shelf ─────────────────────────────────────────────────────

function TrailersShelf({ t, accent, headlineFont, section }) {
  const allTrailers = [
    { id: "ll-60", film: "Last Light", len: "60s", vibe: "Slow burn" },
    { id: "ll-90", film: "Last Light", len: "90s", vibe: "Score-forward" },
    { id: "ff-30", film: "Frequency 88.6", len: "30s", vibe: "Cold noir" },
    { id: "sw-60", film: "The Swallows", len: "60s", vibe: "Patient" },
  ];
  const trailers = allTrailers.slice(0, section.props.count || 4);
  return (
    <div>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 8, textTransform: "uppercase" }}>TRAILERS · CUTS UNDER 90s</div>
      <h2 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 44 * t.fontScale, fontWeight: 500, margin: "0 0 26px", letterSpacing: "-0.02em" }}>{section.props.headline}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))", gap: 14 }}>
        {trailers.map((tr, i) => {
          const trFilm = (window.CATALOG || []).find(f => f.title === tr.film);
          return (
          <div key={tr.id} onClick={(e) => trFilm && wbGo(e, `/film/${trFilm.id}`)} style={{
            background: `${accent}06`, border: `1px solid ${accent}22`, borderRadius: "var(--r-2)", overflow: "hidden",
            cursor: "pointer",
          }}>
            <div style={{
              position: "relative", aspectRatio: "21/9", overflow: "hidden",
              background: `linear-gradient(${(i * 89) % 360}deg, ${accent}55, ${tkc("black")} 75%)`,
            }}>
              {trFilm && window.FrameThumb && <FrameThumb kind={trFilm.thumb} usePhoto/>}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.55), transparent 60%)" }}></div>
              <div style={{
                position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
                width: 42, height: 42, borderRadius: "50%",
                background: "rgba(0,0,0,.6)", color: accent,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "var(--fs-lead)", border: `1.5px solid ${accent}`,
              }}>▶</div>
              <div style={{ position: "absolute", bottom: 8, right: 10, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tkc("white"), letterSpacing: ".16em" }}>{tr.len}</div>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, color: t.ink }}>{tr.film}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginTop: 4, textTransform: "uppercase" }}>{tr.vibe} · {tr.len}</div>
            </div>
          </div>
        ); })}
      </div>
    </div>
  );
}

// ─── Holders ─────────────────────────────────────────────────────────────

function HoldersBlock({ t, accent, headlineFont, section }) {
  const sample = Array.from({ length: 28 }).map((_, i) => ({
    handle: ["@maela","@orin","@bex","@p_chen","@a_kindt","@mosshouse","@quiet","@v_arrow","@ji_lin","@aurora","@laila","@sten"][i % 12] + (i > 11 ? i : ""),
    color: ["var(--c-amber)",tkc("bad"),tkc("cat-1"),tkc("cat-2"),tkc("ink-3")][i % 5],
    tier: i < 4 ? "executive" : i < 12 ? "producer" : "associate",
  }));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 8, textTransform: "uppercase" }}>HOLDERS · NFT PRODUCERS</div>
          <h2 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 44 * t.fontScale, fontWeight: 500, margin: 0, letterSpacing: "-0.02em" }}>{section.props.headline}</h2>
        </div>
        <button onClick={(e) => { const cid = section.props.creatorId || "voss"; const f = (window.CATALOG || []).find(x => x.nft && (x.creatorId === cid || String(x.creator || "").toLowerCase().includes(cid))); wbGo(e, f ? `/nft/${f.nft}` : "/auctions"); }} style={{
          padding: "10px 18px", background: accent, color: t.bg, border: "none", borderRadius: 999, cursor: "pointer",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
        }}>Become a holder →</button>
      </div>
      <div style={{
        padding: 22, background: `${accent}08`, border: `1px solid ${accent}33`, borderRadius: "var(--r-2)",
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 22,
      }}>
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", textTransform: "uppercase" }}>EXECUTIVE · 4</div>
          <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 500, marginTop: 4 }}>$2,000</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.6, letterSpacing: ".16em", marginTop: 4 }}>15% rev · ×10 vote · credit</div>
        </div>
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", textTransform: "uppercase" }}>PRODUCER · 8</div>
          <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 500, marginTop: 4 }}>$320</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.6, letterSpacing: ".16em", marginTop: 4 }}>5% rev · ×5 vote · perks</div>
        </div>
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", textTransform: "uppercase" }}>ASSOCIATE · 200</div>
          <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 500, marginTop: 4 }}>$48</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.6, letterSpacing: ".16em", marginTop: 4 }}>0.5% rev · ×2 vote</div>
        </div>
      </div>
      <div style={{ marginTop: 22 }}>
        <div className="t-label" style={{ marginBottom: 10, color: accent, letterSpacing: ".16em" }}>CURRENT CAP TABLE · {sample.length} OF 212</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gap: 4 }}>
          {sample.map((h, i) => (
            <div key={i} title={`${h.handle} · ${h.tier}`} style={{
              aspectRatio: "1/1", borderRadius: "var(--r-1)",
              background: `linear-gradient(135deg, ${h.color}66, ${h.color}22)`,
              border: h.tier === "executive" ? `2px solid var(--c-amber)` : `1px solid ${h.color}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: h.color, fontWeight: 700,
            }}>{h.handle.slice(1, 3).toUpperCase()}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Newsletter block ───────────────────────────────────────────────────
// Functional signup — subscribers land in the site inbox (cina:site-inbox-v1).
function NewsletterBlock({ section, t, accent, headlineFont }) {
  const [nlEmail, setNlEmail] = usbBl("");
  const [nlDone, setNlDone] = usbBl(false);
  const subscribe = () => {
    const v = nlEmail.trim();
    if (!v || !v.includes("@")) return;
    wbInboxPush("subscribers", { email: v });
    setNlDone(true);
    if (window.toast) window.toast({ title: "SUBSCRIBED", text: v, kind: "good" });
  };
  return (
    <div style={{
      padding: "clamp(22px, 5cqi, 40px)",
      background: `linear-gradient(135deg, ${accent}14, transparent 75%)`,
      border: `1px solid ${accent}55`,
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "24px 36px", alignItems: "center",
    }}>
      <div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 8, textTransform: "uppercase" }}>NEWSLETTER</div>
        <h2 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 40 * t.fontScale, fontWeight: 500, margin: 0, lineHeight: 1.05, letterSpacing: "-0.02em" }}>{section.props.headline}</h2>
        <p style={{ fontSize: 14 * t.fontScale, opacity: 0.65, marginTop: 12, maxWidth: 480, lineHeight: 1.55 }}>{section.props.sub}</p>
      </div>
      {nlDone ? (
        <div style={{ minWidth: 0, width: "100%", padding: "16px 18px", border: `1px solid ${accent}55`, textAlign: "center", fontFamily: headlineFont, fontStyle: "italic", fontSize: "var(--fs-lead)", color: accent }}>You're on the list.</div>
      ) : (
        <div style={{ display: "flex", minWidth: 0, width: "100%" }}>
          <input
            value={nlEmail} type="email" placeholder="you@domain.com"
            onChange={e => setNlEmail(e.target.value)}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => { if (e.key === "Enter") { e.stopPropagation(); subscribe(); } }}
            style={{
              flex: 1, minWidth: 0, padding: "16px 18px", background: "rgba(0,0,0,.3)",
              border: `1px solid ${accent}55`, borderRight: "none", outline: "none",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: t.ink,
            }}/>
          <button onClick={(e) => { e.stopPropagation(); subscribe(); }} style={{
            padding: "16px 22px", background: accent, color: t.bg, border: "none",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
            display: "flex", alignItems: "center", cursor: "pointer",
          }}>SUBSCRIBE</button>
        </div>
      )}
    </div>
  );
}

// ─── Contact block ──────────────────────────────────────────────────────

function ContactBlock({ section, t, accent, headlineFont }) {
  const [name, setName] = usbBl("");
  const [email, setEmail] = usbBl("");
  const [msg, setMsg] = usbBl("");
  // Existing saved pages predate the richer contact defaults — backfill in
  // the renderer so "get in touch" is never a lone email address.
  const cFallback = defaultPropsV2("contact", null);
  const cProps = { ...section.props };
  ["phone", "address", "hours"].forEach(k3 => { if (cProps[k3] === undefined) cProps[k3] = cFallback[k3]; });
  const [sent, setSent] = usbBl(false);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: section.props.formEnabled ? "repeat(auto-fit, minmax(min(100%, 300px), 1fr))" : "1fr", gap: 48, alignItems: "start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 8, textTransform: "uppercase" }}>GET IN TOUCH</div>
          <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: `clamp(28px, 5cqi, ${56 * t.fontScale}px)`, fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 14, wordBreak: "break-word" }}>{section.props.email}</div>
          {(cProps.agent || cProps.phone || cProps.address || cProps.hours) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 6 }}>
              {[
                cProps.agent && ["REPRESENTED BY", cProps.agent],
                cProps.phone && ["PHONE", cProps.phone],
                cProps.address && ["STUDIO", cProps.address],
                cProps.hours && ["HOURS", cProps.hours],
              ].filter(Boolean).map(([k2, v2], i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "baseline", padding: "11px 0", borderTop: `1px solid ${accent}26` }}>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", width: 110, flexShrink: 0 }}>{k2}</span>
                  <span style={{ fontSize: 13.5 * t.fontScale, opacity: 0.8 }}>{v2}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {section.props.formEnabled && (
          <div style={{
            padding: 28, background: `${accent}10`, border: `1px solid ${accent}55`, borderRadius: "var(--r-2)", minWidth: 0,
          }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 6, textTransform: "uppercase" }}>{section.props.formHeadline}</div>
            <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: "var(--fs-lead)", opacity: 0.78, marginBottom: 18 }}>{section.props.formSubline}</div>
            {sent ? (
              <div style={{ padding: 18, textAlign: "center", border: `1px solid ${accent}55`, borderRadius: "var(--r-1)" }}>
                <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: "var(--fs-lead)", color: accent }}>Sent. Thank you.</div>
                <div style={{ fontSize: "var(--fs-body)", opacity: 0.7, marginTop: 6 }}>I read every message. Reply window: 3–7 days.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={contactInp(t, accent)}/>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" style={contactInp(t, accent)}/>
                <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Your message" rows={4} style={{ ...contactInp(t, accent), resize: "vertical" }}/>
                <button onClick={(e) => { e.stopPropagation(); wbInboxPush("messages", { name, email, msg }); setSent(true); }} style={{
                  marginTop: 6, padding: "12px 18px", background: accent, color: t.bg,
                  border: "none", borderRadius: "var(--r-1)", cursor: "pointer",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                  fontWeight: 700, textTransform: "uppercase",
                }}>Send the note →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function contactInp(t, accent) {
  return {
    padding: "12px 14px", background: "rgba(0,0,0,.25)",
    border: `1px solid ${accent}55`, borderRadius: "var(--r-1)", color: t.ink,
    fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)", outline: "none",
  };
}

// ─── Store ───────────────────────────────────────────────────────────────
// Reads the SAME data the standalone Store manager writes (cina:studio-store),
// so products created there appear here on the live site automatically. Falls
// back to the section's own sample products only when the store is empty.
function readSharedStore() {
  try { const v = JSON.parse(localStorage.getItem("cina:studio-store") || "null"); if (Array.isArray(v)) return v; } catch {}
  return null;
}

function StoreBlock({ section, t, accent, headlineFont }) {
  const shared = readSharedStore();
  const live = shared && shared.filter(p => p.status === "active");
  const products = (live && live.length)
    ? live.map(p => ({ name: p.title, price: p.price, kind: (p.type || "ITEM").toUpperCase(), color: p.swatch || accent, image: (p.images || [])[0], glyph: p.glyph, source: p.source, desc: p.desc, colors: p.colors, subscribable: p.subscribable, sellerId: p.creatorId || "studio" }))
    : (section.props.products || []);
  const connected = !!(live && live.length);
  const layout = section.props.layout || "grid"; // grid | row
  const showPrice = section.props.showPrice !== false;
  const cid = section.props.creatorId || "voss";
  const studioFilms = (window.CATALOG || []).filter(f => f.creatorId === cid || String(f.creator || "").toLowerCase().includes(cid));
  const pool = studioFilms.length ? studioFilms : (window.CATALOG || []);
  const stillFor = (p, i) => {
    if (p.image || p.glyph) return null;
    const named = pool.find(f => f.title && String(p.name || "").toLowerCase().includes(f.title.toLowerCase()));
    return (named || pool[i % Math.max(1, pool.length)] || {}).thumb || null;
  };
  const shownProducts = products.slice(0, section.props.limit || 12).map((p, i) => ({ ...p, _still: stillFor(p, i) }));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 22 }}>
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 8, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
            STORE {connected && <span style={{ color: `var(--c-good, ${tkc("good")})`, fontSize: "var(--fs-label)" }}>● {live.length} LIVE</span>}
          </div>
          <h2 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 44 * t.fontScale, fontWeight: 500, margin: 0, letterSpacing: "-0.02em" }}>{section.props.headline}</h2>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: layout === "row" ? "repeat(4, 1fr)" : "repeat(3, 1fr)", gap: 18 }}>
        {shownProducts.map((p, i) => (
          <div key={i} onClick={() => { if (window.cinaCart && window.cinaCart.quickView) window.cinaCart.quickView(p); }} style={{
            background: `${accent}06`, border: `1px solid ${accent}22`, borderRadius: "var(--r-2)", overflow: "hidden",
            cursor: "pointer",
          }}>
            <div style={{
              aspectRatio: "1/1", position: "relative",
              background: p.color ? `linear-gradient(135deg, ${p.color}, ${tkc("black")} 90%)` : `linear-gradient(135deg, ${accent}99, ${tkc("black")} 80%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {p._still && window.FrameThumb && <span style={{ position: "absolute", inset: 0 }}><FrameThumb kind={p._still} usePhoto/></span>}
              {p._still && <span style={{ position: "absolute", left: 10, top: 10, padding: "4px 8px", borderRadius: 999, background: "rgba(0,0,0,.62)", color: tkc("white"), fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>{p.kind}</span>}
              {p._still ? null : p.image
                ? <img src={p.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
                : p.glyph
                  ? <span style={{ fontSize: "var(--fs-head)", opacity: 0.85 }}>{p.glyph}</span>
                  : <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: tkc("white"), opacity: 0.9, fontWeight: 700 }}>{p.kind}</span>}
            </div>
            <div style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, color: t.ink, lineHeight: 1.2 }}>{p.name}</div>
                {showPrice && <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginTop: 4 }}>${p.price}</div>}
              </div>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (window.cinaCart && window.cinaCart.quickView) window.cinaCart.quickView(p); }} style={{
                padding: "6px 12px", background: "transparent", color: accent,
                border: `1px solid ${accent}`, borderRadius: 999, cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
              }}>View</button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div style={{
            gridColumn: "1/-1", padding: "40px 20px", textAlign: "center", borderRadius: "var(--r-2)",
            border: `1.5px dashed ${accent}44`, color: accent, textDecoration: "none",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
          }}>+ ADD PRODUCTS IN THE STORE MANAGER →</div>
        )}
      </div>
    </div>
  );
}

// ─── Blog ────────────────────────────────────────────────────────────────
// Reads the SAME data the Notebook writer publishes (cina:studio-notebook).
function readSharedNotebook() {
  try { const v = JSON.parse(localStorage.getItem("cina:studio-notebook") || "null"); if (Array.isArray(v)) return v; } catch {}
  return null;
}

function BlogBlock({ section, t, accent, headlineFont, siteId }) {
  const shared = readSharedNotebook();
  const livePosts = shared && shared.filter(p => p.status === "published").map(p => ({
    id: p.id,
    date: (() => { if (!p.date) return ""; const dt = new Date(p.date + "T12:00"); return isNaN(dt.getTime()) ? "" : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); })(),
    read: Math.max(1, Math.round(((p.blocks || []).reduce((n, b) => n + ((b.value || "").split(/\s+/).filter(Boolean).length), 0)) / 200)) + " min",
    title: p.title || "Untitled",
    excerpt: p.dek || ((p.blocks || []).find(b => b.type === "text")?.value || "").slice(0, 150),
  }));
  const fallback = [
    { date: "May 22, 2026", read: "8 min", title: "Why we shoot on safelight",   excerpt: "It's not nostalgia. It's that the wait teaches you what the photo is going to be." },
    { date: "May 14, 2026", read: "5 min", title: "Working with Cina v3 for casting", excerpt: "The actor vault changed how we block. We can carry a face across every scene." },
    { date: "May 03, 2026", read: "12 min", title: "Score lessons · 'Last Light'", excerpt: "A note on writing for the held image. Three rules I broke. One I won't again." },
  ];
  const connected = !!(livePosts && livePosts.length);
  let posts = connected ? livePosts : ((section.props.posts && section.props.posts.length) ? section.props.posts : fallback);
  if (connected) {
    if (section.props.sort === "oldest") posts = [...posts].reverse();
    posts = posts.slice(0, section.props.limit || 4);
  }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
          NOTEBOOK {connected && <span style={{ color: `var(--c-good, ${tkc("good")})`, fontSize: "var(--fs-label)" }}>● {livePosts.length} PUBLISHED</span>}
        </div>
      </div>
      <h2 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 56 * t.fontScale, fontWeight: 400, margin: "0 0 30px", letterSpacing: "-0.02em" }}>{section.props.headline}</h2>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {posts.map((p, i) => (
          <a key={i} href="#"
            title="Read the post"
            onClick={(e) => {
              e.preventDefault();
              // Canvas clicks keep selecting the section; on the live site the
              // post opens its own page on the studio's domain.
              if (!e.currentTarget.closest("[data-wb-live]")) return;
              e.stopPropagation();
              const to = `/site/${siteId || "voss"}/notebook/${p.id != null ? p.id : i}`;
              if (window.navigate) navigate(to); else window.location.hash = "#" + to;
            }}
            style={{
            display: "block", textDecoration: "none", color: "inherit",
            padding: "26px 0", borderTop: `1px solid ${accent}33`,
            cursor: "pointer",
          }}>
            <div style={{ display: "flex", gap: 14, marginBottom: 8 }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase" }}>{p.date}</span>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: t.ink, opacity: 0.45, letterSpacing: ".16em", textTransform: "uppercase" }}>{p.read} read</span>
            </div>
            <h3 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 30 * t.fontScale, fontWeight: 500, margin: "4px 0 8px", letterSpacing: "-0.01em" }}>{p.title}</h3>
            <p style={{ fontSize: 15 * t.fontScale, opacity: 0.72, lineHeight: 1.55, margin: 0, maxWidth: 700 }}>{p.excerpt}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Shop NFT ────────────────────────────────────────────────────────────

function ShopNFTBlock({ section, t, accent, headlineFont }) {
  const drops = [
    { tier: "EXECUTIVE", title: "Last Light · Producer", price: "0.8 ETH", ed: 4 },
    { tier: "PRODUCER",  title: "Last Light · Backer",   price: "0.18 ETH", ed: 50 },
    { tier: "ASSOCIATE", title: "Last Light · Holder",   price: "0.04 ETH", ed: 200 },
  ];
  return (
    <div>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 8, textTransform: "uppercase" }}>OWN A PIECE</div>
      <h2 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 44 * t.fontScale, fontWeight: 500, margin: "0 0 26px", letterSpacing: "-0.02em" }}>{section.props.headline}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {drops.map((d, i) => (
          <div key={i} style={{
            padding: 22, background: `${accent}10`, border: `1.5px solid ${accent}77`, borderRadius: "var(--r-2)",
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", fontWeight: 700 }}>{d.tier}</div>
            <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, lineHeight: 1.2, letterSpacing: "-0.01em" }}>{d.title}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.6, letterSpacing: ".16em" }}>{d.price} · {d.ed} editions</div>
            <button onClick={(e) => {
              if (!e.currentTarget.closest("[data-wb-live]")) return;
              e.stopPropagation();
              if (window.openPay) openPay({ kind: "mint", title: d.title, subtitle: `${d.tier} · ${d.ed} editions · ${d.price}`, accent, priceUSD: Math.round((parseFloat(d.price) || 0) * 3200), perks: ["Revenue share on the film", "Holder rooms and votes", "Your name in the credits"] });
              else if (window.toast) toast({ title: "MINT", text: `${d.title} · ${d.price}`, kind: "good" });
            }} style={{
              marginTop: 4, padding: "10px 14px", background: accent, color: t.bg,
              border: "none", borderRadius: "var(--r-1)", cursor: "pointer",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
            }}>Mint →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Actor Vault ─────────────────────────────────────────────────────────

function ActorVaultBlock({ section, t, accent, headlineFont }) {
  const cast = [
    { name: "Elias Voss",   role: "Protagonist", color: tkc("ink-3"), refs: 12 },
    { name: "Maren Kell",   role: "Antagonist",  color: tkc("blood"), refs: 8 },
    { name: "Det. Nomura",  role: "Supporting",  color: tkc("cat-6"), refs: 5 },
    { name: "The Subject",  role: "Victim",      color: tkc("warn"), refs: 3 },
  ];
  return (
    <div>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 8, textTransform: "uppercase" }}>CAST VAULT</div>
      <h2 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 44 * t.fontScale, fontWeight: 500, margin: "0 0 8px", letterSpacing: "-0.02em" }}>{section.props.headline}</h2>
      <p style={{ fontSize: "var(--fs-body)", opacity: 0.65, marginBottom: 24, maxWidth: 600 }}>{section.props.subline}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {cast.map((c, i) => (
          <div key={c.name} style={{
            background: `${c.color}10`, border: `1px solid ${c.color}55`, borderRadius: "var(--r-2)", overflow: "hidden", cursor: "pointer",
          }}>
            <div style={{
              aspectRatio: "3/4", background: `linear-gradient(135deg, ${c.color}77, ${tkc("black")})`,
              position: "relative",
            }}>
              <div style={{
                position: "absolute", top: 8, right: 8,
                padding: "2px 7px", background: "rgba(0,0,0,.7)",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: c.color, letterSpacing: ".16em", border: `1px solid ${c.color}`,
              }}>LOCKED · {c.refs} REFS</div>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, color: t.ink, lineHeight: 1.1 }}>{c.name}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: c.color, letterSpacing: ".16em", marginTop: 4, textTransform: "uppercase" }}>{c.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Footer (preset-driven) ──────────────────────────────────────────────

function FooterBlock({ page, section, t, accent, headlineFont, narrow }) {
  const fp = (section && section.props) || {};
  const preset = fp.preset || page.footer?.preset || "stacked-mono";
  const tagline = fp.tagline || "An independent studio making slow films and the occasional branched one.";
  const socials = (fp.socials && fp.socials.length) ? fp.socials : [{ label: "Instagram", href: "#" }, { label: "X", href: "#" }, { label: "RSS", href: "#" }];
  const contacts = (fp.contacts && fp.contacts.length) ? fp.contacts : [{ label: "Studio mail", href: "#" }, { label: "Agent · WME", href: "#" }, { label: "Press", href: "#" }];
  const copyright = fp.copyright || `© 2026 ${page.studioName}`;
  const onLink = (e, href) => {
    const h = href || "";
    if (!h || h === "#") { e.preventDefault(); return; }
    if (h.startsWith("#")) { e.preventDefault(); wbScrollToSectionV2(h.slice(1)); }
    else if (/^https?:\/\//.test(h)) { e.preventDefault(); window.open(h, "_blank", "noopener"); }
  };
  // The studio's Cina profile — a small frame-mark that always leads the
  // social row, on every footer preset that shows socials.
  const cid = (page.domain || "").split(".")[0];
  const profileMark = (
    <a key="cina-profile" href="#" title="View this studio on Cina"
      onClick={(e) => { e.preventDefault(); if (e.currentTarget.closest("[data-wb-live]")) { if (window.navigate) window.navigate(`/studios/${cid}`); else window.location.hash = `#/studios/${cid}`; } }}
      style={{ display: "inline-flex", alignItems: "center", gap: 7, color: accent, textDecoration: "none" }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="4"/>
        <circle cx="12" cy="12" r="4.2"/>
        <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/>
      </svg>
      <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>PROFILE</span>
    </a>
  );
  if (preset === "single-line") {
    return (
      <div style={{
        padding: "28px 32px", borderTop: `1px solid ${accent}33`,
        display: "flex", alignItems: narrow ? "flex-start" : "center", justifyContent: "space-between", gap: narrow ? 14 : 18,
        flexDirection: narrow ? "column" : "row",
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: t.ink, opacity: 0.7,
        letterSpacing: ".16em", textTransform: "uppercase",
      }}>
        <span style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: "var(--fs-lead)", opacity: 1, letterSpacing: "-0.01em" }}>{page.studioName}</span>
        <span>{copyright}</span>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {profileMark}
          {socials.map((s, i) => <a key={i} href={s.href || "#"} onClick={(e) => onLink(e, s.href)} style={{ color: accent, textDecoration: "none" }}>{s.label}</a>)}
        </div>
      </div>
    );
  }
  if (preset === "big-cta") {
    return (
      <div style={{ padding: narrow ? "56px 24px" : "80px 32px", background: `linear-gradient(180deg, ${accent}10, ${accent}22)`, borderTop: `1px solid ${accent}55`, textAlign: "center" }}>
        <h2 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: `clamp(32px, 7cqi, 56px)`, fontWeight: 400, margin: 0, letterSpacing: "-0.02em" }}>One frame, every month.</h2>
        <p style={{ fontSize: "var(--fs-lead)", opacity: 0.7, margin: "16px auto 28px", maxWidth: 520, lineHeight: 1.5 }}>Subscribe to the studio's newsletter. No selling.</p>
        <div style={{ display: "flex", maxWidth: 420, width: "100%", margin: "0 auto", flexDirection: narrow ? "column" : "row", gap: narrow ? 8 : 0 }}>
          <input placeholder="you@domain.com" style={{
            flex: 1, padding: "14px 16px",
            background: "rgba(0,0,0,.3)", border: `1px solid ${accent}55`, borderRight: narrow ? `1px solid ${accent}55` : "none",
            color: t.ink, fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)",
          }}/>
          <button style={{ padding: "14px 22px", background: accent, color: t.bg, border: "none", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700 }} onClick={() => window.toast && toast({ title: "SUBSCRIBED", text: "You're on the studio's list.", kind: "good" })}>SUBSCRIBE </button>
        </div>
        <div style={{ marginTop: 36, display: "flex", justifyContent: "center" }}>{profileMark}</div>
        <div style={{ marginTop: 14, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.5, letterSpacing: ".16em" }}>
          {page.studioName.toUpperCase()} · © 2026 · ALL RIGHTS RESERVED
        </div>
      </div>
    );
  }
  if (preset === "manifesto") {
    return (
      <div style={{ padding: "100px 32px", borderTop: `1px solid ${accent}33`, textAlign: "center" }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 14 }}>THE STUDIO BELIEVES</div>
        <p style={{
          fontFamily: headlineFont, fontStyle: "italic", fontSize: `clamp(22px, 5cqi, 32px)`, fontWeight: 400,
          lineHeight: 1.35, maxWidth: 760, margin: "0 auto", letterSpacing: "-0.01em",
        }}>
          Stories are best when they're slow to find their shape. We hold every frame until it tells us why it's there. That's the work.
        </p>
        <div style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>{profileMark}</div>
        <div style={{ marginTop: 14, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.55, letterSpacing: ".16em" }}>— {page.studioName.toUpperCase()}</div>
      </div>
    );
  }
  if (preset === "directory") {
    return (
      <div style={{ padding: "60px 32px 32px", borderTop: `1px solid ${accent}55` }}>
        <div style={{ maxWidth: t.columnWidth, margin: "0 auto", display: "grid", gridTemplateColumns: narrow ? "1fr 1fr" : "1.5fr 1fr 1fr 1fr", gap: narrow ? 24 : 36 }}>
          <div>
            <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, marginBottom: 10 }}>{page.studioName}</div>
            <p style={{ fontSize: "var(--fs-body)", opacity: 0.6, lineHeight: 1.5, margin: 0 }}>{tagline}</p>
          </div>
          {[
            { h: "WORK", l: ["Films", "Series", "Branched", "Trailers", "Stills"] },
            { h: "STUDIO", l: ["About", "Notebook", "Press", "Cast vault"] },
            { h: "CONTACT", l: ["Studio mail", "Agent · WME", "Press inquiries", "Festivals"] },
          ].map((c, i) => (
            <div key={i}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 10, fontWeight: 700 }}>{c.h}</div>
              {c.l.map(item => (
                <a key={item} href="#" onClick={(e) => e.preventDefault()} style={{
                  display: "block", padding: "5px 0",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: t.ink, opacity: 0.7,
                  letterSpacing: ".08em", textDecoration: "none",
                }}>{item}</a>
              ))}
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 32, padding: "18px 0 0", borderTop: `1px solid ${accent}22`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.5, letterSpacing: ".16em",
        }}>
          <span>{copyright.toUpperCase()}</span>
          <span>{profileMark}</span>
          <span>{page.domain}</span>
        </div>
      </div>
    );
  }
  if (preset === "marquee-tail") {
    return (
      <div style={{ borderTop: `1px solid ${accent}33` }}>
        <div style={{ overflow: "hidden", padding: "16px 0", borderBottom: `1px solid ${accent}22` }}>
          <div style={{
            whiteSpace: "nowrap", display: "inline-block",
            animation: "wbV2Marquee 22s linear infinite",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: accent, letterSpacing: ".16em",
          }}>
            {(`${page.studioName.toUpperCase()} · MADE IN BERLIN · NEXT DROP JUN 14  ✦  `).repeat(4)}
          </div>
          <style>{`@keyframes wbV2Marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
        </div>
        <div style={{ padding: "18px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>
          <span style={{ opacity: 0.5 }}>© 2026</span>
          {profileMark}
          <span style={{ opacity: 0.5 }}>{page.domain.toUpperCase()}</span>
        </div>
      </div>
    );
  }
  if (preset === "centered-mark") {
    return (
      <div style={{ padding: narrow ? "48px 24px" : "64px 32px", borderTop: `1px solid ${accent}33`, textAlign: "center" }}>
        <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 500, letterSpacing: "-0.01em", marginBottom: 14 }}>{page.studioName}</div>
        <nav style={{ display: "flex", gap: 20, justifyContent: "center", alignItems: "center", flexWrap: "wrap", marginBottom: 18 }}>
          {profileMark}
          {socials.map((s, i) => <a key={i} href={s.href || "#"} onClick={(e) => onLink(e, s.href)} style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: t.ink, opacity: 0.7, textDecoration: "none", textTransform: "uppercase" }}>{s.label}</a>)}
        </nav>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.4, letterSpacing: ".16em" }}>{copyright.toUpperCase()}</div>
      </div>
    );
  }
  if (preset === "two-tone") {
    return (
      <div style={{ borderTop: `1px solid ${accent}55` }}>
        <div style={{ background: accent, color: t.bg, padding: narrow ? "28px 24px" : "36px 32px", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: narrow ? 26 : 34, fontWeight: 500, letterSpacing: "-0.02em" }}>{fp.tagline || "Made without permission."}</div>
          <nav style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
            {React.cloneElement(profileMark, { style: { display: "inline-flex", alignItems: "center", gap: 7, color: t.bg, textDecoration: "none" } })}
            {socials.map((s, i) => <a key={i} href={s.href || "#"} onClick={(e) => onLink(e, s.href)} style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: t.bg, fontWeight: 700, textDecoration: "none", textTransform: "uppercase" }}>{s.label}</a>)}
          </nav>
        </div>
        <div style={{ padding: "18px 32px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.5, letterSpacing: ".16em" }}>
          <span>{copyright.toUpperCase()}</span><span>{page.domain}</span>
        </div>
      </div>
    );
  }
  if (preset === "minimal-legal") {
    return (
      <div style={{ padding: "26px 32px", borderTop: `1px solid ${accent}22`, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: t.ink, opacity: 0.55, textTransform: "uppercase" }}>
        <span>{copyright.toUpperCase()}</span>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
          {profileMark}
          <a href="#" onClick={(e) => e.preventDefault()} style={{ color: t.ink, textDecoration: "none" }}>Terms</a>
          <a href="#" onClick={(e) => e.preventDefault()} style={{ color: t.ink, textDecoration: "none" }}>Privacy</a>
          <a href={"mailto:hello@" + page.domain} style={{ color: t.ink, textDecoration: "none" }}>Contact</a>
        </div>
      </div>
    );
  }
  // stacked-mono (default)
  return (
    <div style={{ padding: "56px 32px", borderTop: `1px solid ${accent}33` }}>
      <div style={{ maxWidth: t.columnWidth, margin: "0 auto", display: "grid", gridTemplateColumns: narrow ? "1fr" : "2fr 1fr 1fr", gap: narrow ? 24 : 36 }}>
        <div>
          <div style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, letterSpacing: "-0.01em" }}>{page.studioName}</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.55, letterSpacing: ".16em", marginTop: 8 }}>{page.domain}</div>
        </div>
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 8, fontWeight: 700 }}>FOLLOW</div>
          <div style={{ padding: "3px 0 5px" }}>{profileMark}</div>
          {socials.map((s, i) => <a key={i} href={s.href || "#"} onClick={(e) => onLink(e, s.href)} style={{ display: "block", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: t.ink, opacity: 0.65, padding: "3px 0", textDecoration: "none" }}>{s.label}</a>)}
        </div>
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 8, fontWeight: 700 }}>CONTACT</div>
          {contacts.map((s, i) => <a key={i} href={s.href || "#"} onClick={(e) => onLink(e, s.href)} style={{ display: "block", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: t.ink, opacity: 0.65, padding: "3px 0", textDecoration: "none" }}>{s.label}</a>)}
        </div>
      </div>
      <div style={{ marginTop: 28, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.4, letterSpacing: ".16em" }}>
        {copyright.toUpperCase()}
      </div>
    </div>
  );
}

Object.assign(window, { ParallaxHero, VideoHero, BranchedShelf, EpisodesShelf, TrailersShelf, HoldersBlock, NewsletterBlock, ContactBlock, StoreBlock, BlogBlock, ShopNFTBlock, ActorVaultBlock, FooterBlock });
