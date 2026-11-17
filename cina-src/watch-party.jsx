// watch-party.jsx — Watch Party synced room + live chat.
// 100% responsive grid, real FrameThumb cinema visuals, and unobstructed chat bar.

const { useState: usp, useEffect: uep, useRef: urp } = React;

(function pmPartyCss() {
  if (document.getElementById("pm-party-css")) return;
  const s = document.createElement("style");
  s.id = "pm-party-css";
  s.textContent = `
.pm-party-shell{min-height:calc(100vh - 3.75rem);width:100%;background:var(--c-black);display:grid;grid-template-columns:minmax(0,1fr) minmax(20rem,25%);border-top:1px solid var(--c-line)}
.pm-party-stage{display:flex;flex-direction:column;min-width:0;min-height:54vh;background:var(--c-black)}
.pm-party-screen{flex:1;position:relative;display:flex;align-items:flex-end;justify-content:space-between;padding:clamp(1.25rem,3vw,2.5rem);overflow:hidden;isolation:isolate}
.pm-party-screen__art{position:absolute;inset:0;z-index:-2;opacity:.72}
.pm-party-screen__art>*{width:100%;height:100%;object-fit:cover}
.pm-party-screen__scrim{position:absolute;inset:0;z-index:-1;background:linear-gradient(0deg,rgba(8,8,10,.92) 0%,rgba(8,8,10,.35) 45%,rgba(8,8,10,.62) 100%)}
.pm-party-topbar{position:absolute;top:1.25rem;left:1.5rem;right:1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;z-index:2;flex-wrap:wrap}
.pm-party-chat{display:flex;flex-direction:column;border-left:1px solid var(--c-line);background:var(--c-panel);height:calc(100vh - 3.75rem);position:sticky;top:3.75rem;min-width:0}
.pm-party-compose{padding:0.85rem 1rem;border-top:1px solid var(--c-line);background:var(--c-panel);display:flex;gap:0.5rem;align-items:center}
@media (max-width:58em){
  .pm-party-shell{grid-template-columns:1fr;min-height:auto}
  .pm-party-stage{min-height:52vh}
  .pm-party-chat{height:28rem;position:static;border-left:none;border-top:1px solid var(--c-line)}
}
`;
  document.head.appendChild(s);
})();

const PARTY_GUESTS = [
  { handle: "rena_ko",    color: tkc("bad"), initials: "RK" },
  { handle: "park_dr",    color: tkc("cat-6"), initials: "PD" },
  { handle: "voss_fan99", color: tkc("cat-3"), initials: "VF" },
  { handle: "miradawn",   color: tkc("cat-5"), initials: "MD" },
  { handle: "ash.404",    color: tkc("cat-2"), initials: "A4" },
  { handle: "june_a",     color: tkc("ink-3"), initials: "JA" },
];

const SCRIPTED_PARTY_CHAT = [
  { t: 3,  user: "rena_ko",    text: "everyone synced up? lights down." },
  { t: 8,  user: "park_dr",    text: "4K print looks incredible tonight" },
  { t: 14, user: "voss_fan99", text: "host locked frame sync" },
  { t: 22, user: "miradawn",   text: "listen to that score cue coming in" },
  { t: 34, user: "ash.404",    text: "the negative space in this wide shot…" },
  { t: 48, user: "june_a",     text: "wait for the cut at the doorway" },
  { t: 64, user: "voss_fan99", text: "she heard the transmission" },
  { t: 82, user: "miradawn",   text: "nobody breathe" },
  { t: 105, user: "rena_ko",   text: "that safelight transition is pure cinema" },
];

function WatchPartyPage({ filmId }) {
  const film = getFilm(filmId) || CATALOG[0];
  const [t, setT] = usp(6);
  const [playing, setPlaying] = usp(true);
  const [muted, setMuted] = usp(false);
  const [chatInput, setChatInput] = usp("");
  const [userMessages, setUserMessages] = usp([]);
  const chatBoxRef = urp(null);

  uep(() => {
    if (!playing) return;
    const id = setInterval(() => setT(v => v + 1), 1000);
    return () => clearInterval(id);
  }, [playing]);

  const chat = [
    ...SCRIPTED_PARTY_CHAT.filter(m => m.t <= t),
    ...userMessages,
  ].sort((a, b) => a.t - b.t);

  uep(() => {
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [chat.length]);

  const send = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    setUserMessages(prev => [...prev, { t, user: "you", text: trimmed }]);
    setChatInput("");
  };

  const copyInvite = () => {
    try { navigator.clipboard?.writeText(window.location.href); } catch (_) {}
    window.toast && toast({ title: "INVITE LINK COPIED", text: `Share link to watch ${film.title} in sync.`, kind: "good" });
  };

  const totalSeconds = 49 * 60;
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="pm-party-shell" data-screen-label={`Watch Party · ${film.title}`}>
      {/* Synced Cinema Stage */}
      <div className="pm-party-stage">
        <div className="pm-party-screen" style={{ background: film.color || tkc("black") }}>
          <div className="pm-party-screen__art">
            <FrameThumb kind={film.thumb} usePhoto/>
          </div>
          <div className="pm-party-screen__scrim"/>

          <div className="pm-party-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="pm-btn pm-btn--glass pm-btn--sm" onClick={() => navigate("/rooms")}>
                <Icon name="chev-l" size={13}/>All Rooms
              </button>
              <span className="t-mono" style={{ fontSize: "0.66rem", letterSpacing: ".15em", textTransform: "uppercase", color: "var(--c-amber)", padding: "5px 9px", background: "rgba(10,10,12,.76)", border: "1px solid rgba(var(--accent-rgb),.4)" }}>
                ● Live Sync · {PARTY_GUESTS.length + 1} Watching
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {PARTY_GUESTS.slice(0, 5).map((g, idx) => (
                  <div key={g.handle} title={g.handle} style={{
                    width: 26, height: 26, borderRadius: "50%",
                    marginLeft: idx === 0 ? 0 : -6,
                    background: "rgba(16,16,20,.92)", border: `1.5px solid ${g.color}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--f-mono)", fontSize: "0.58rem", color: "var(--c-ink)", fontWeight: 600,
                  }}>{g.initials}</div>
                ))}
                <div title="You" style={{
                  width: 26, height: 26, borderRadius: "50%", marginLeft: -6,
                  background: "var(--c-amber)", border: `1.5px solid ${tkc("black")}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--f-mono)", fontSize: "0.58rem", color: "var(--c-on-amber)", fontWeight: 700,
                }}>YOU</div>
              </div>
              <button className="pm-btn pm-btn--glass pm-btn--sm" onClick={copyInvite}>
                <Icon name="share" size={13}/>Invite
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: "42rem" }}>
            <span className="pm-k"><b>Synced Screening</b> · {film.creator || "Cina Original"}</span>
            <h1 className="t-display" style={{ fontStyle: "italic", fontSize: "clamp(2rem, 4vw, 3.6rem)", fontWeight: 400, margin: 0, lineHeight: 0.98, letterSpacing: "-0.02em" }}>
              {film.title}
            </h1>
            <span className="t-mono" style={{ fontSize: "0.72rem", color: "var(--c-ink-2)", letterSpacing: ".08em" }}>
              {playing ? "Frame-locked playback" : "Paused for room"} · {fmt(t)} / 49:00
            </span>
          </div>
        </div>

        {/* Transport Bar */}
        <div style={{ padding: "12px 20px", background: "rgba(8,8,10,0.96)", borderTop: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => setPlaying(p => !p)}
            aria-label={playing ? "Pause room playback" : "Resume room playback"}
            style={{
              width: 36, height: 36, borderRadius: "2px", background: "var(--c-amber)", border: "none",
              color: "var(--c-on-amber)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
            }}
          >
            <Icon name={playing ? "pause" : "play"} size={14}/>
          </button>

          <button
            onClick={() => setMuted(m => !m)}
            aria-label={muted ? "Unmute" : "Mute"}
            style={{
              width: 34, height: 34, borderRadius: "2px", background: "transparent", border: "1px solid var(--c-line-2)",
              color: "var(--c-ink-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
            }}
          >
            <Icon name={muted ? "mute" : "volume"} size={14}/>
          </button>

          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              setT(Math.round(ratio * totalSeconds));
            }}
            title="Seek synced timeline"
            style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.14)", cursor: "pointer", position: "relative", overflow: "hidden" }}
          >
            <div style={{ width: `${Math.min(100, (t / totalSeconds) * 100)}%`, height: "100%", background: "var(--c-amber)" }}/>
          </div>

          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-2)", fontVariantNumeric: "tabular-nums" }}>
            {fmt(t)} / 49:00
          </span>
        </div>
      </div>

      {/* Room Chat Sidebar — completely unobstructed submit bar */}
      <aside className="pm-party-chat" aria-label="Watch party room chat">
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div>
            <div className="t-mono" style={{ fontSize: "0.64rem", color: "var(--c-amber)", letterSpacing: ".16em", textTransform: "uppercase" }}>● Room Chat</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "1.15rem", fontWeight: 400, marginTop: 2 }}>Screening Salon</div>
          </div>
          <span className="t-mono" style={{ fontSize: "0.66rem", letterSpacing: ".12em", color: "var(--c-ink-3)" }}>{PARTY_GUESTS.length + 1} ONLINE</span>
        </div>

        {window.PartyLeanBanner && <PartyLeanBanner film={film}/>}

        <div ref={chatBoxRef} style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {chat.length === 0 && (
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)", textAlign: "center", padding: "36px 0" }}>
              Lights dimming. Say hello to the room.
            </div>
          )}
          {chat.map((m, i) => {
            const g = PARTY_GUESTS.find(p => p.handle === m.user);
            const me = m.user === "you";
            return (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: me ? "var(--c-amber)" : "var(--c-panel-2)",
                  border: me ? "none" : `1px solid ${g?.color || "var(--c-line-2)"}`,
                  flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--f-mono)", fontSize: "0.58rem",
                  color: me ? "var(--c-on-amber)" : "var(--c-ink)", fontWeight: 700,
                }}>
                  {me ? "YOU" : (g?.initials || "G")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 2 }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: me ? "var(--c-amber)" : "var(--c-ink)" }}>{m.user}</span>
                    <span style={{ fontFamily: "var(--f-mono)", fontSize: "0.64rem", color: "var(--c-ink-4)" }}>{fmt(m.t)}</span>
                  </div>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.45, overflowWrap: "break-word" }}>{m.text}</div>
                </div>
              </div>
            );
          })}
        </div>

        <form
          className="pm-party-compose"
          onSubmit={(e) => { e.preventDefault(); send(); }}
        >
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Whisper to the room…"
            aria-label="Message the watch party"
            style={{
              flex: 1, minWidth: 0, height: 38, background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
              borderRadius: "2px", padding: "0 12px", color: "var(--c-ink)",
              fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)", outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              height: 38, padding: "0 14px", background: "var(--c-amber)", border: "none",
              color: "var(--c-on-amber)", borderRadius: "2px", fontSize: "var(--fs-body)",
              fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0,
            }}
          >
            <span>Send</span>
            <Icon name="send" size={13}/>
          </button>
        </form>
      </aside>
    </div>
  );
}

Object.assign(window, { WatchPartyPage });
