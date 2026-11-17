// watch-player-ai.jsx — Cina Intelligence layer for the video player.
//
// Mounts INSIDE the Player (watch-watch.jsx) and gets the transport as
// props (t, dur, seek, playing, setPlaying). Everything is spoiler-safe:
// the engine only ever references story beats BEFORE the current timecode.
//
// Features:
//   · Chapters & scene search — natural-language seek ("the lighthouse scene")
//   · Catch me up — story-so-far recap, 3 beats, up to NOW only
//   · Ask the film — Q&A with a spoiler guard
//   · On screen now — cast x-ray with vault links
//   · Subtitles & voice-matched dub — language swap
//   · Smart skip — AI-detected intro/recap pill (rendered by the Player)

const { useState: usPI, useMemo: umPI, useRef: urPI, useEffect: uePI } = React;

// ─── Per-film chapter model (seeded, deterministic) ───────────────────────
function piChapters(film, dur) {
  const base = [
    { k: "opening",   label: "Cold open" },
    { k: "world",     label: "The world, established" },
    { k: "spark",     label: "The inciting spark" },
    { k: "turn",      label: "First turn" },
    { k: "midnight",  label: "The midpoint reversal" },
    { k: "low",       label: "All is lost" },
    { k: "run",       label: "The run home" },
    { k: "end",       label: "Last image" },
  ];
  return base.map((c, i) => ({
    ...c,
    t: Math.round((i / base.length) * dur),
    blurb: `${film.title}: ${c.label.toLowerCase()} — ${(film.logline || "").split(".")[0].toLowerCase()}.`,
  }));
}

// Cast x-ray — which performers are "on screen" in this stretch.
function piOnScreen(film, t, dur) {
  const cast = window.CAST || [];
  if (!cast.length) return [];
  const slice = Math.floor((t / Math.max(1, dur)) * 8);
  const a = cast[(slice * 3 + (film.id || "x").length) % cast.length];
  const b = cast[(slice * 5 + 2) % cast.length];
  return slice % 3 === 1 ? [a] : [a, b].filter((x, i, arr) => arr.indexOf(x) === i);
}

const PI_LANGS = [["en", "English"], ["es", "Español"], ["fr", "Français"], ["ja", "日本語"], ["hi", "हिन्दी"]];

// ─── The panel ────────────────────────────────────────────────────────────
function CinaPlayerIntel({ film, t, dur, seek, playing, setPlaying, onClose, topOffset = 0 }) {
  const chapters = umPI(() => piChapters(film, dur), [film.id, dur]);
  const [tab, setTab] = usPI("scenes"); // scenes | shop | ask | audio
  const [shopSel, setShopSel] = usPI(null);
  const [shopTick, setShopTick] = usPI(0);
  const [q, setQ] = usPI("");
  const [thread, setThread] = usPI([]);
  const [shopThread, setShopThread] = usPI([]);
  const [recap, setRecap] = usPI(null);
  const [lang, setLang] = usPI("en");
  const [dub, setDub] = usPI(false);
  const scrollRef = urPI(null);
  const onScreen = piOnScreen(film, t, dur);
  const seen = chapters.filter(c => c.t <= t);
  const current = seen[seen.length - 1] || chapters[0];

  uePI(() => { if (scrollRef.current) scrollRef.current.scrollTop = 1e6; }, [thread, shopThread, recap]);

  // Tell the Cina orb this rail is open (it hides so it can't cover the composer).
  uePI(() => {
    window.dispatchEvent(new CustomEvent("cina:overlay", { detail: true }));
    return () => window.dispatchEvent(new CustomEvent("cina:overlay", { detail: false }));
  }, []);

  const catchMeUp = () => {
    setPlaying(false);
    const beats = seen.slice(0, Math.max(1, seen.length)).slice(-3);
    setRecap({
      upTo: t,
      lines: beats.length
        ? beats.map(b => `${b.label} (${fmtT(b.t)}) — ${b.blurb}`)
        : [`You're ${fmtT(t)} in — the film is still setting its table. ${film.logline}`],
    });
    setTab("ask");
  };

  // Spoiler-safe local answer engine; uses the live model when available.
  const ask = async (text) => {
    if (!text.trim()) return;
    const mine = { who: "you", text };
    setThread(th => [...th, mine]);
    setQ("");
    const futureWords = ["end", "ending", "die", "dies", "killer", "twist", "finale", "who did"];
    const hitsFuture = futureWords.some(w => text.toLowerCase().includes(w)) && t < dur * 0.85;
    const answer = (body) => setThread(th => [...th, { who: "cina", text: body }]);

    if (hitsFuture) {
      answer(`The film hasn't answered that yet — you're at ${fmtT(t)} of ${fmtT(dur)}. I only read up to where you are. Keep watching; ask me again after ${current.label.toLowerCase()}.`);
      return;
    }
    // Scene-search intent → seek
    const target = chapters.find(c => text.toLowerCase().split(/\s+/).some(w => w.length > 3 && c.label.toLowerCase().includes(w)));
    if (/take me|jump|go to|scene|rewatch|show me/i.test(text) && target) {
      seek(target.t);
      answer(`Jumping to “${target.label}” at ${fmtT(target.t)}. (Your spot at ${fmtT(t)} is bookmarked.)`);
      return;
    }
    if (window.claude && window.claude.complete) {
      try {
        const r = await window.claude.complete(
          `You are Cina, the in-player film companion. Film: "${film.title}" — ${film.logline} Viewer is at ${fmtT(t)} of ${fmtT(dur)}. Beats seen so far: ${seen.map(s => s.label).join("; ")}. Answer in 1-2 sentences, NEVER reveal anything past the current timecode. Question: ${text}`);
        answer(r.slice(0, 400));
        return;
      } catch {}
    }
    answer(`So far: ${seen.map(s => s.label.toLowerCase()).join(" → ")}. ${film.logline} Within what you've seen — ${current.blurb} Anything past ${fmtT(t)} stays sealed.`);
  };

  // Shopping chat — Cina finds clothes & objects from the scene's look.
  const shopAsk = async (text) => {
    if (!text.trim() || !SHOP) return;
    setShopThread(th => [...th, { who: "you", text }]);
    setQ("");
    const items = SHOP.LOOK || [];
    const words = text.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2);
    const hits = items.filter(it => {
      const hay = `${it.name || ""} ${it.brand || ""} ${it.kind || ""} ${it.desc || ""} ${it.tag || ""}`.toLowerCase();
      return words.some(w => hay.includes(w));
    });
    const say = (body, found) => setShopThread(th => [...th, { who: "cina", text: body, items: found || [] }]);
    if (window.claude && window.claude.complete) {
      try {
        const r = await window.claude.complete(
          `You are Cina, an in-player shopping assistant for the film "${film.title}". The scene's shoppable items are: ${items.map(i => `${i.name} by ${i.brand} ($${i.price})`).join("; ")}. The viewer asked: "${text}". In 1-2 sentences, answer their shopping question — recommend matching items from the list by name if any fit, or say nothing in this scene matches and suggest the closest thing.`);
        say(r.slice(0, 350), hits.slice(0, 3));
        return;
      } catch {}
    }
    if (hits.length) say(`Found ${hits.length === 1 ? "it" : hits.length + " pieces"} in this scene — here${hits.length === 1 ? " it is" : " they are"}. Every purchase supports the director.`, hits.slice(0, 3));
    else say(`Nothing on screen matches “${text}” right now — the scene's look is ${items.slice(0, 3).map(i => i.name.toLowerCase()).join(", ")}. Ask me again in another scene.`);
  };

  // Shopping pauses the film; leaving the tab resumes it.
  const SHOP = window.CinaShopLook;
  const shopPlat = SHOP ? SHOP.usePlatform() : null;
  uePI(() => {
    if (tab === "shop") setPlaying(false);
  }, [tab]);
  const shopBuy = (item) => {
    try { window.open(SHOP.buyUrl(item), "_blank", "noopener,noreferrer"); } catch (e) {}
    SHOP.record(item, film.id);
    setShopTick(x => x + 1);
    if (window.toast) window.toast({ title: "SALE RECORDED · " + item.brand.toUpperCase(), text: `${item.name} · ${Math.round(SHOP.rate * 100)}% supports the director`, kind: "good" });
  };
  const shopEarnings = umPI(() => SHOP ? SHOP.earnings(film.id) : { sales: 0, earned: 0 }, [film.id, shopTick]);

  const chip = (id, label, glyph) => (
    <button key={id} onClick={() => setTab(id)} className="t-mono" style={{
      flex: 1, minWidth: 0, padding: "10px 2px 9px", background: "transparent",
      border: "none", borderRadius: 0,
      borderBottom: tab === id ? "2px solid var(--c-amber)" : "2px solid transparent",
      color: tab === id ? "var(--c-amber)" : "rgba(255,255,255,.5)",
      cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
      transition: "color .12s",
    }}>
      <span style={{ fontSize: "var(--fs-body)", lineHeight: 1, opacity: tab === id ? 1 : .75 }}>{glyph}</span>
      <span style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>
    </button>
  );

  return (
    <div onClick={e => e.stopPropagation()} style={{
      position: "fixed", top: 0, right: 0, bottom: 0, width: "min(340px, 90vw)", zIndex: 80,
      background: "rgba(10,10,12,.94)", backdropFilter: "blur(18px)",
      borderLeft: "1px solid rgba(255,255,255,.12)", borderRadius: 0,
      display: "flex", flexDirection: "column",
      boxShadow: "-24px 0 60px rgba(0,0,0,.45)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 10px" }}>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", fontWeight: 700 }}>✦ CINA · FILM COMPANION</span>
        <span style={{ flex: 1 }}></span>
        <button onClick={onClose} className="btn-ghost btn-icon" style={{ width: 26, height: 26, color: tkc("white") }} aria-label="Close" title="Close">✕</button>
      </div>

      {/* On screen now — always visible */}
      {onScreen.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px 12px", borderBottom: "1px solid rgba(255,255,255,.08)", flexWrap: "wrap" }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.4)", letterSpacing: ".16em" }}>ON SCREEN</span>
          {onScreen.map(a => (
            <button key={a.id} onClick={() => navigate(`/cast/${a.id}`)} title={`${a.name} · open in the Vault`} style={{
              display: "inline-flex", alignItems: "center", gap: 7, padding: "3px 10px 3px 3px",
              background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.14)",
              borderRadius: 999, cursor: "pointer",
            }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", overflow: "hidden", background: a.color, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                {typeof CastPortrait === "function" && a.skin
                  ? <CastPortrait actor={a} size={40} shot="headshot" cover style={{ width: "100%", height: "100%", borderRadius: 0 }}/>
                  : <span style={{ color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-label)" }}>{a.name[0]}</span>}
              </span>
              <span style={{ fontSize: "var(--fs-label)", color: tkc("white") }}>{a.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.02)" }}>
        {chip("scenes", "SCENES", "⧉")}
        {SHOP && chip("shop", "SHOP", "✦")}
        {chip("ask", "ASK", "‽")}
        {chip("audio", "AUDIO", "≋")}
      </div>

      {/* Body */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {tab === "scenes" && (
          <>
            <div style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.5)", lineHeight: 1.5 }}>
              Chapters are read from the cut by Cina — click to jump. Unseen beats stay unlabeled to protect the story.
            </div>
            {chapters.map((c, i) => {
              const isSeen = c.t <= t;
              const isCurrent = current.k === c.k;
              return (
                <button key={c.k} onClick={() => seek(c.t)} style={{
                  display: "grid", gridTemplateColumns: "58px 1fr", gap: 10, alignItems: "center",
                  padding: "7px 8px", textAlign: "left", borderRadius: "var(--r-2)", cursor: "pointer",
                  background: isCurrent ? "rgba(var(--accent-rgb),.1)" : "transparent",
                  border: `1px solid ${isCurrent ? "rgba(var(--accent-rgb),.4)" : "rgba(255,255,255,.07)"}`,
                }}>
                  {/* frame thumb — blurred until the beat has been seen */}
                  <span style={{ position: "relative", width: 58, aspectRatio: "16/9", borderRadius: "var(--r-2)", overflow: "hidden", background: tkc("bg") }}>
                    <span style={{ position: "absolute", inset: 0, filter: `hue-rotate(${i * 42}deg) saturate(.85) ${isSeen || isCurrent ? "" : "blur(5px) brightness(.45)"}` }}>
                      {typeof FrameThumb === "function" ? <FrameThumb kind={film.thumb}/> : null}
                    </span>
                    {!isSeen && !isCurrent && (
                      <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.55)", fontSize: "var(--fs-label)" }}>🔒</span>
                    )}
                    {isCurrent && <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, background: "var(--c-amber)" }}></span>}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", color: isCurrent ? "var(--c-amber)" : "rgba(255,255,255,.4)", letterSpacing: ".16em" }}>{fmtT(c.t)}</span>
                    <span style={{ display: "block", fontSize: "var(--fs-body)", color: isSeen || isCurrent ? tkc("white") : "rgba(255,255,255,.35)", fontStyle: isSeen ? "normal" : "italic", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {isSeen || isCurrent ? c.label : `Chapter ${i + 1} · unseen`}
                    </span>
                  </span>
                </button>
              );
            })}
          </>
        )}

        {tab === "shop" && SHOP && (
          <>
            {!shopPlat ? (
              <SHOP.ConnectGate compact/>
            ) : (
              <>
                <div className="t-mono" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-good)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)" }}></span>
                  SHOPPING VIA {String((SHOP.platforms.find(p => p.id === shopPlat.provider) || {}).label).toUpperCase()}
                  <span style={{ flex: 1 }}></span>
                  <button onClick={() => SHOP.disconnect()} className="t-mono" style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.4)", fontSize: "var(--fs-label)", letterSpacing: ".16em", cursor: "pointer" }}>DISCONNECT</button>
                </div>
                <div style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.5)", lineHeight: 1.5 }}>
                  As worn in this scene — the film is paused while you browse.
                </div>
                {SHOP.LOOK.map(item => <SHOP.ProductCard key={item.id} item={item} onBuy={shopBuy}/>)}

                {/* Cina shopping chat */}
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.4)", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,.1)" }}>ASK CINA TO FIND ANYTHING ON SCREEN</div>
                {shopThread.length === 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["Find the coat she's wearing", "Anything under $100?", "The lamp on the desk"].map(s => (
                      <button key={s} onClick={() => shopAsk(s)} className="t-mono" style={{
                        padding: "5px 10px", fontSize: "var(--fs-label)", letterSpacing: ".08em",
                        background: "transparent", border: "1px dashed rgba(255,255,255,.25)",
                        borderRadius: 999, color: "rgba(255,255,255,.7)", cursor: "pointer",
                      }}>{s}</button>
                    ))}
                  </div>
                )}
                {shopThread.map((m, i) => (
                  <React.Fragment key={i}>
                    <div style={{
                      alignSelf: m.who === "you" ? "flex-end" : "flex-start", maxWidth: "88%",
                      padding: "8px 12px", borderRadius: "var(--r-2)",
                      background: m.who === "you" ? "rgba(var(--accent-rgb),.14)" : "rgba(255,255,255,.06)",
                      border: `1px solid ${m.who === "you" ? "rgba(var(--accent-rgb),.35)" : "rgba(255,255,255,.1)"}`,
                      fontSize: "var(--fs-body)", color: tkc("white"), lineHeight: 1.5,
                    }}>{m.text}</div>
                    {(m.items || []).map(it => <SHOP.ProductCard key={it.id + "-chat"} item={it} onBuy={shopBuy}/>)}
                  </React.Fragment>
                ))}

                <div style={{ display: "flex", alignItems: "baseline", gap: 8, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,.1)" }}>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.45)" }}>{Math.round(SHOP.rate * 100)}% OF EVERY SALE SUPPORTS THE DIRECTOR</span>
                  <span style={{ flex: 1 }}></span>
                  {shopEarnings.sales > 0 && <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-good)" }}>${shopEarnings.earned} · {shopEarnings.sales} SALE{shopEarnings.sales === 1 ? "" : "S"}</span>}
                </div>
              </>
            )}
          </>
        )}
        {tab === "ask" && (
          <>
            {recap && (
              <div style={{ padding: 12, background: "rgba(var(--accent-rgb),.07)", border: "1px solid rgba(var(--accent-rgb),.3)", borderRadius: "var(--r-2)" }}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 8 }}>STORY SO FAR · UP TO {fmtT(recap.upTo)}</div>
                {recap.lines.map((l, i) => (
                  <div key={i} style={{ fontSize: "var(--fs-body)", color: "rgba(255,255,255,.85)", lineHeight: 1.55, marginBottom: 6 }}>{l}</div>
                ))}
              </div>
            )}
            {thread.length === 0 && !recap && (
              <div style={{ fontSize: "var(--fs-body)", color: "rgba(255,255,255,.5)", lineHeight: 1.6 }}>
                Ask anything about what you've seen — characters, timeline, that line you missed. Cina reads only up to your timecode; it will never spoil ahead.
              </div>
            )}
            {thread.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.who === "you" ? "flex-end" : "flex-start", maxWidth: "88%",
                padding: "8px 12px", borderRadius: "var(--r-2)",
                background: m.who === "you" ? "rgba(var(--accent-rgb),.14)" : "rgba(255,255,255,.06)",
                border: `1px solid ${m.who === "you" ? "rgba(var(--accent-rgb),.35)" : "rgba(255,255,255,.1)"}`,
                fontSize: "var(--fs-body)", color: tkc("white"), lineHeight: 1.5,
              }}>{m.text}</div>
            ))}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Catch me up", "Who is she again?", "Take me to the first turn"].map(s => (
                <button key={s} onClick={() => s === "Catch me up" ? catchMeUp() : ask(s)} className="t-mono" style={{
                  padding: "5px 10px", fontSize: "var(--fs-label)", letterSpacing: ".08em",
                  background: "transparent", border: "1px dashed rgba(255,255,255,.25)",
                  borderRadius: 999, color: "rgba(255,255,255,.7)", cursor: "pointer",
                }}>{s}</button>
              ))}
            </div>
          </>
        )}

        {tab === "audio" && (
          <>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.4)", letterSpacing: ".16em" }}>SUBTITLES · AI-TIMED</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {PI_LANGS.map(([code, label]) => (
                <button key={code} onClick={() => { setLang(code); toast?.({ title: "SUBTITLES", text: `${label} · AI-translated, timed to the cut`, kind: "good" }); }} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                  background: lang === code ? "rgba(var(--accent-rgb),.1)" : "transparent",
                  border: `1px solid ${lang === code ? "rgba(var(--accent-rgb),.4)" : "rgba(255,255,255,.08)"}`,
                  borderRadius: "var(--r-2)", cursor: "pointer", color: tkc("white"), fontSize: "var(--fs-body)", textAlign: "left",
                }}>
                  {label}
                  <span style={{ flex: 1 }}></span>
                  {lang === code && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>ON</span>}
                </button>
              ))}
            </div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.4)", letterSpacing: ".16em", marginTop: 10 }}>VOICE-MATCHED DUB</div>
            <button onClick={() => { setDub(d => !d); toast?.({ title: dub ? "DUB OFF" : "DUB ON", text: dub ? "Original audio" : `${(PI_LANGS.find(l => l[0] === lang) || [])[1]} · cloned from the original cast voices`, kind: "good" }); }} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              background: dub ? "rgba(95,165,106,.1)" : "transparent",
              border: `1px solid ${dub ? "rgba(95,165,106,.45)" : "rgba(255,255,255,.12)"}`,
              borderRadius: "var(--r-2)", cursor: "pointer", color: tkc("white"), fontSize: "var(--fs-body)", textAlign: "left",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: dub ? "var(--c-good)" : "rgba(255,255,255,.25)" }}></span>
              {dub ? "Dub on — voices cloned from the cast" : "Dub the film in the cast's own voices"}
            </button>
            <div style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.4)", lineHeight: 1.55 }}>
              Cina synthesizes the dub from each performer's licensed voice print — same timbre, new language. Lip timing is re-rendered per shot.
            </div>
          </>
        )}
      </div>

      {/* Composer */}
      {tab !== "audio" && !(tab === "shop" && !shopPlat) && (
        <div style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <input value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") (tab === "shop" ? shopAsk : ask)(q); }}
            placeholder={tab === "scenes" ? "Find a scene — “the radio booth at night”" : tab === "shop" ? "Find clothes & objects — “her red coat”" : "Ask without spoilers…"}
            style={{
              flex: 1, minWidth: 0, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.15)",
              borderRadius: "var(--r-2)", padding: "9px 12px", color: tkc("white"), fontSize: "var(--fs-body)", outline: "none",
            }}/>
          <button onClick={() => (tab === "shop" ? shopAsk : ask)(q)} style={{
            padding: "0 14px", background: "var(--c-amber)", color: "var(--c-on-amber)",
            border: "none", borderRadius: "var(--r-2)", cursor: "pointer", fontWeight: 700, fontSize: "var(--fs-body)",
          }}>→</button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { CinaPlayerIntel, piChapters });
