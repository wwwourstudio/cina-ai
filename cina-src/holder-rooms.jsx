// holder-rooms.jsx — Post-premiere afterparty for NFT holders.
// Voice/chat lobby per director, draws, secondary listings, audit-call.

const { useState: hrUS, useEffect: hrUE, useMemo: hrUM, useRef: hrUR } = React;

// ─── Mock data ─────────────────────────────────────────────────────────

const _hrColors = ["var(--c-amber)", tkc("cat-4"), tkc("cat-1"), tkc("bad"), tkc("cat-2")];

function _hrRooms() {
  const c = (window.CATALOG || []).slice(0, 4);
  return c.map((f, i) => ({
    id: f.id,
    title: f.title,
    director: f.creator?.split("·")[0]?.trim() || "Director",
    creatorId: f.creatorId,
    poster: f.id,
    color: _hrColors[i % _hrColors.length],
    listeners: 84 - i * 14,
    speaking: 4 - i,
    drew: false,
    drawAt: Date.now() + 1000 * 60 * (12 + i * 7),
    secondaryFloor: [0.18, 0.12, 0.09, 0.07][i],
    secondaryDelta: [+18, -4, +6, +2][i],
    listed: [3, 1, 6, 2][i],
    chips: ["LIVE NOW", "ENCORE Q&A", "ROUNDTABLE", "DRINKS LOBBY"][i],
    presence: "live",
  }));
}

// Fake chat messages
const _hrInitChat = (room) => [
  { id: 1, who: room.director, role: "DIRECTOR", color: room.color, body: "thanks for showing up tonight. ask me anything.", t: 1, mic: true },
  { id: 2, who: "@mira_h",  role: "PRODUCER · 3×",  color: tkc("good"), body: "the long take in scene 14 — was that one shot?", t: 14, mic: false },
  { id: 3, who: room.director, role: "DIRECTOR", color: room.color, body: "two. cut on the door close. the cellist plays through both.", t: 28, mic: true },
  { id: 4, who: "@klaus.w", role: "COLLECTOR · 1×", color: tkc("cat-1"), body: "how soon do we vote on the cut for the festival edition?", t: 41, mic: false },
  { id: 5, who: "@yara",    role: "PATRON · 2×",    color: tkc("cat-2"), body: "the score 🥺", t: 52, mic: false },
  { id: 6, who: room.director, role: "DIRECTOR", color: room.color, body: "voting opens monday. you'll all get a private link.", t: 67, mic: true },
];

// ─── Countdown helper ──────────────────────────────────────────────────

function _hrCD(ts) {
  const [now, setNow] = hrUS(Date.now());
  hrUE(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const d = Math.max(0, ts - now);
  return { m: Math.floor(d / 60000), s: Math.floor(d / 1000) % 60, done: d === 0 };
}

// ─── Page root ─────────────────────────────────────────────────────────

function HolderRoomsPage() {
  const rooms = hrUM(() => _hrRooms(), []);
  const [activeId, setActiveId] = hrUS(rooms[0]?.id);
  const active = rooms.find(r => r.id === activeId) || rooms[0];

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)" }}>
      {/* Hero */}
      <section style={{
        padding: "44px var(--gutter) 28px",
        borderBottom: "1px solid var(--c-line)",
        background: "var(--c-bg)",
      }}>
        <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 12 }}>
              ◐ HOLDER ROOMS · TONIGHT 9:30 PM
            </div>
            <h1 className="pm-xl">The afterparty is yours.</h1>
            <div className="pm-lede" style={{ marginTop: 18, maxWidth: "56ch" }}>
              Voice + text rooms with every director who premiered tonight. One holder per room is randomly drawn for an audit-call with the director the next morning. Secondary listings unlock the moment doors close.
            </div>
          </div>
          <HRStatusCard rooms={rooms}/>
        </div>
      </section>

      {/* Room picker */}
      <section style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "28px var(--gutter) 0" }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 14 }}>
          01 · ROOMS LIVE
        </div>
        <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {rooms.map(r => (
            <HRRoomTile key={r.id} room={r} active={activeId === r.id} onClick={() => setActiveId(r.id)}/>
          ))}
        </div>
      </section>

      {/* Active room */}
      <section style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "32px var(--gutter) 32px" }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 14 }}>
          02 · IN THE ROOM · {active.title.toUpperCase()}
        </div>
        <HRActiveRoom room={active} key={active.id}/>
      </section>

      {/* Live polls */}
      <section style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "0 var(--gutter) 32px" }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 14 }}>
          03 · LIVE POLLS · ROOM DECIDES · {active.listeners} HOLDERS VOTING
        </div>
        <HRLivePolls room={active} key={`polls-${active.id}`}/>
      </section>

      {/* Draw + market + after */}
      <section style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "0 var(--gutter) 80px" }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 14 }}>
          04 · DRAW · MARKET · WEEK AHEAD
        </div>
        <div className="m-stack" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr) minmax(0,1fr)", gap: 18 }}>
          <HRAuditDraw room={active}/>
          <HRSecondary room={active}/>
          <HRSchedule rooms={rooms}/>
        </div>
      </section>
    </div>
  );
}

// ─── Status card ───────────────────────────────────────────────────────

function HRStatusCard({ rooms }) {
  const total = rooms.reduce((a, r) => a + r.listeners, 0);
  return (
    <div style={{
      border: "1px solid var(--c-line-2)", padding: "20px 24px", borderRadius: "var(--r-2)",
      background: "var(--c-panel)", minWidth: "min(280px, 100%)", boxSizing: "border-box",
    }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 14 }}>● ALL ROOMS</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-amber)", lineHeight: 1 }}>{rooms.length}</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 4 }}>OPEN</div>
        </div>
        <div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-ink)", lineHeight: 1 }}>{total}</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 4 }}>HOLDERS IN</div>
        </div>
      </div>
    </div>
  );
}

// ─── Room tile ─────────────────────────────────────────────────────────

function HRRoomTile({ room, active, onClick }) {
  return (
    <button onClick={onClick} className="btn-ghost" style={{
      padding: 0, height: "auto", display: "block", textAlign: "left",
      background: "var(--c-panel)", borderRadius: "var(--r-2)", overflow: "hidden",
      border: "1px solid " + (active ? "var(--c-amber)" : "var(--c-line)"),
      transform: active ? "translateY(-1px)" : "none",
      transition: "transform .14s ease, border-color .14s ease",
    }}>
      <div style={{ position: "relative", aspectRatio: "16/8",
        background: `linear-gradient(135deg, ${room.color}33, ${tkc("void")})`, overflow: "hidden" }}>
        {window.FrameThumb && (
          <div style={{ position: "absolute", inset: 0 }}>
            <FrameThumb kind={room.thumb || room.filmId || room.id} usePhoto/>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${room.color}44, rgba(10,6,6,.45))` }}></div>
          </div>
        )}
        <div style={{
          position: "absolute", top: 8, left: 8, padding: "3px 8px", borderRadius: 999,
          background: "rgba(216,106,106,0.92)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-on-amber)", letterSpacing: ".16em",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "var(--r-1)", background: tkc("void"), animation: "hrPulse 1.2s infinite ease-in-out" }}/>
          {room.chips}
        </div>
        <div style={{
          position: "absolute", top: 8, right: 8, padding: "3px 8px", borderRadius: 999,
          background: "rgba(0,0,0,0.7)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tkc("white"), letterSpacing: ".16em",
        }}>● {room.listeners}</div>
      </div>
      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--c-line)" }}>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1.1 }}>{room.title}</div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 4, textTransform: "uppercase" }}>
          DIRECTOR · {room.director}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
            <span style={{ color: "var(--c-amber)" }}>◉</span> {room.speaking} on mic
          </span>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>
            FLOOR {room.secondaryFloor}E
          </span>
        </div>
      </div>
      <style>{`@keyframes hrPulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }`}</style>
    </button>
  );
}

// ─── Active room — chat + voice strip ──────────────────────────────────

function HRActiveRoom({ room }) {
  const [chat, setChat] = hrUS(() => _hrInitChat(room));
  const [draft, setDraft] = hrUS("");
  const [muted, setMuted] = hrUS(true);
  const [hand, setHand] = hrUS(false);
  const scroller = hrUR(null);

  hrUE(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [chat]);

  // Auto-trickle a few faux messages
  hrUE(() => {
    const lines = [
      { who: "@dax", role: "COLLECTOR · 1×", color: tkc("cat-1"), body: "the lighting in act 2 felt like a different film. on purpose?" },
      { who: room.director, role: "DIRECTOR", color: room.color, body: "yes — we shot act 2 on tungsten and pushed the green channel. wanted it to feel sick.", mic: true },
      { who: "@elena.r", role: "PRODUCER · 5×", color: tkc("good"), body: "you nailed it 🟢" },
    ];
    let i = 0;
    const t = setInterval(() => {
      if (i >= lines.length) { clearInterval(t); return; }
      setChat(c => [...c, { ...lines[i], id: c.length + 1, t: c.length * 13 }]);
      i++;
    }, 5200);
    return () => clearInterval(t);
  }, [room.id]);

  const send = () => {
    if (!draft.trim()) return;
    setChat(c => [...c, { id: c.length + 1, who: "@you", role: "PATRON · 2×", color: "var(--c-amber)", body: draft, t: c.length * 13 }]);
    setDraft("");
  };

  return (
    <div className="m-stack" style={{
      display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 18,
      background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden",
    }}>
      {/* LEFT: voice stage */}
      <div style={{ padding: "22px 24px 18px", borderRight: "1px solid var(--c-line)", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>● ON STAGE</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 4 }}>{room.director}'s Q&amp;A</div>
          </div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
            {room.listeners} listening · {room.speaking} on mic
          </div>
        </div>

        {/* Speakers grid */}
        <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12 }}>
          <HRSpeaker name={room.director} role="DIRECTOR" color={room.color} active mic/>
          <HRSpeaker name="@mira_h"  role="PRODUCER · 3×" color={tkc("cat-4")} mic active={false}/>
          <HRSpeaker name="@klaus.w" role="COLLECTOR" color={tkc("cat-1")} mic active={false}/>
          <HRSpeaker name="@yara"    role="PATRON · 2×" color={tkc("cat-2")} mic={false} active={false} hand/>
        </div>

        {/* Listening rail */}
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--c-line)" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 10 }}>
            LISTENING · {room.listeners - 4}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {Array.from({ length: Math.min(28, room.listeners - 4) }).map((_, i) => {
              const c = [tkc("cat-4"),tkc("cat-1"),tkc("bad"),tkc("cat-2"),"var(--c-amber)"][i % 5];
              return (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: "var(--r-3)",
                  background: c,
                  display: "grid", placeItems: "center",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-on-amber)", fontWeight: 700,
                  border: "1px solid var(--c-line)",
                }}>{String.fromCharCode(65 + (i % 26))}</div>
              );
            })}
          </div>
        </div>

        {/* Mic controls */}
        <div style={{ marginTop: "auto", paddingTop: 18 }}>
          <div style={{
            display: "flex", gap: 8, padding: 12,
            background: "var(--c-bg)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
          }}>
            <button className="btn" onClick={() => setMuted(m => !m)} style={{
              flex: 1, height: 44, padding: "0 14px",
              background: muted ? "transparent" :  "var(--c-amber)",
              color: muted ? "var(--c-ink)" : tkc("void"),
              border: "1px solid " + (muted ? "var(--c-line-2)" : "var(--c-amber)"),
              borderRadius: "var(--r-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <Icon name={muted ? "mic-off" : "mic"} size={14}/>
              {muted ? "UNMUTE TO SPEAK" : "● LIVE — TAP TO MUTE"}
            </button>
            <button className="btn" onClick={() => setHand(h => !h)} style={{
              height: 44, padding: "0 14px",
              background: hand ? "rgba(var(--accent-rgb),0.18)" : "transparent",
              color: hand ? "var(--c-amber)" : "var(--c-ink-2)",
              border: "1px solid " + (hand ? "var(--c-amber)" : "var(--c-line-2)"),
              borderRadius: "var(--r-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
            }}>{hand ? "✋ HAND UP" : "✋ RAISE HAND"}</button>
            <button className="btn-ghost" style={{
              width: 44, height: 44, borderRadius: "var(--r-2)", padding: 0,
              border: "1px solid var(--c-line-2)", color: "var(--c-ink-3)",
            }}><Icon name="x" size={14}/></button>
          </div>
        </div>
      </div>

      {/* RIGHT: chat */}
      <div style={{ display: "flex", flexDirection: "column", height: 540 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--c-line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>● ROOM CHAT</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{chat.length} MSGS</div>
        </div>
        <div ref={scroller} style={{ flex: 1, overflow: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {chat.map(m => <HRChatMsg key={m.id} m={m}/>)}
        </div>
        <div style={{ padding: 12, borderTop: "1px solid var(--c-line)", display: "flex", gap: 8 }}>
          <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter") send(); }}
            placeholder="Say something to the room…"
            style={{
              flex: 1, padding: "10px 12px", background: "var(--c-bg)", color: "var(--c-ink)",
              border: "1px solid var(--c-line)", borderRadius: "var(--r-1)", fontSize: "var(--fs-body)", fontFamily: "inherit",
            }}/>
          <button className="btn btn-primary" onClick={send} style={{ height: 38, padding: "0 16px" }}>
            <Icon name="send" size={12}/> Post
          </button>
        </div>
      </div>
    </div>
  );
}

function HRSpeaker({ name, role, color, active, mic, hand }) {
  const safeName = String(name || "Guest");
  const initial = (safeName.replace(/^@/, "").trim()[0] || "X").toUpperCase();
  return (
    <div style={{
      padding: "16px 12px", textAlign: "center",
      background: active ? "rgba(var(--accent-rgb),0.06)" : "var(--c-bg)",
      border: "1px solid " + (active ? "var(--c-amber)" : "var(--c-line)"),
      borderRadius: "var(--r-2)", position: "relative",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "var(--r-3)", margin: "0 auto",
        background: `linear-gradient(135deg, ${color || "var(--c-amber)"}, ${tkc("void")})`,
        display: "grid", placeItems: "center",
        boxShadow: active ? `0 0 0 3px var(--c-bg), 0 0 0 4px ${color || "var(--c-amber)"}` : "none",
        position: "relative",
      }}>
        <span className="t-display" style={{ fontStyle: "italic", color: "rgba(255,255,255,0.85)", fontSize: "var(--fs-title)" }}>
          {initial}
        </span>
        {active && (
          <div style={{ position: "absolute", inset: -8, borderRadius: 32, border: `1.5px solid ${color || "var(--c-amber)"}`, animation: "hrSpeak 1.4s ease-in-out infinite" }}/>
        )}
      </div>
      <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", marginTop: 10, fontWeight: 500 }}>{safeName}</div>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 3 }}>{role}</div>
      <div style={{
        position: "absolute", bottom: 8, right: 10,
        width: 22, height: 22, borderRadius: "var(--r-3)",
        background: mic ? "var(--c-amber)" : "var(--c-panel-2)",
        color: mic ? tkc("void") : "var(--c-ink-3)",
        display: "grid", placeItems: "center",
      }}>{hand ? "✋" : <Icon name={mic ? "mic" : "mic-off"} size={10}/>}</div>
      <style>{`@keyframes hrSpeak { 0%, 100% { transform: scale(1); opacity: 0.6 } 50% { transform: scale(1.08); opacity: 0.2 } }`}</style>
    </div>
  );
}

function HRChatMsg({ m }) {
  if (!m) return null;
  const safeWho = String(m.who || m.author || "@viewer");
  const initial = (safeWho.replace(/^@/, "").trim()[0] || "X").toUpperCase();
  const accentCol = m.color || "var(--c-amber)";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 10, alignItems: "start" }}>
      <div style={{
        width: 32, height: 32, borderRadius: "var(--r-3)",
        background: `linear-gradient(135deg, ${accentCol}, ${tkc("void")})`,
        display: "grid", placeItems: "center",
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,0.85)",
        position: "relative",
      }}>
        {initial}
        {m.mic && (
          <div style={{ position: "absolute", bottom: -2, right: -2,
            width: 12, height: 12, borderRadius: "var(--r-2)", background: "var(--c-amber)",
            border: "2px solid var(--c-panel)" }}/>
        )}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: "var(--fs-body)", color: accentCol, fontWeight: 500 }}>{safeWho}</span>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{m.role || "HOLDER"}</span>
        </div>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", marginTop: 3, lineHeight: 1.45 }}>{m.body || ""}</div>
      </div>
    </div>
  );
}

// ─── Live polls — the room votes on cut/release/title decisions ──────
// Each poll has a tick-driven counter that nudges totals to feel live.
// Bars animate when totals shift; the holder can vote and "lock" their pick.

const _hrPollSeeds = (room) => [
  {
    id: "cut",
    eyebrow: `FESTIVAL CUT · ${room.director}`,
    question: "Which cut do we send to Telluride?",
    note: "Closes when @" + room.director.split(" ")[0].toLowerCase() + " calls it · auto-resolves at room close.",
    bonus: "Holders only · 1 vote each · 5× weight for Producers",
    options: [
      { id: "a", label: "Director's cut",   sub: "112 min · the original",         color: "var(--c-amber)", base: 218, drift: +0.42 },
      { id: "b", label: "Festival cut",      sub: "94 min · sharper edit",          color: tkc("good"), base: 312, drift: +0.88 },
      { id: "c", label: "Anthology cut",     sub: "78 min · series-friendly",       color: tkc("cat-1"), base: 144, drift: +0.18 },
    ],
  },
  {
    id: "title",
    eyebrow: "WORKING TITLE · NEEDS RESOLVE",
    question: "Which working title sticks for theatrical?",
    note: "Vote informs the marketing brief. Not binding — director keeps final cut.",
    options: [
      { id: "a", label: "\"Last Light\"",      sub: "the original",                    color: "var(--c-amber)", base: 184, drift: +0.55 },
      { id: "b", label: "\"After the Storm\"", sub: "test screening favorite",         color: tkc("cat-2"), base: 102, drift: +0.31 },
      { id: "c", label: "\"Eleven Trips\"",     sub: "the cinematographer's pick",      color: tkc("bad"), base: 76,  drift: +0.21 },
    ],
  },
  {
    id: "drop",
    eyebrow: "DROP WINDOW · BOARD DECISION",
    question: "When do we open the holder pre-sale?",
    note: "Producers + Patrons can vote. Drop slot fills inside the next 24 hours.",
    options: [
      { id: "a", label: "This Saturday, 8pm",  sub: "tight · capitalize on press",     color: "var(--c-amber)", base: 198, drift: +0.61 },
      { id: "b", label: "Next Friday, 9pm",     sub: "with festival momentum",          color: tkc("good"), base: 264, drift: +0.74 },
      { id: "c", label: "Next month · staged",  sub: "tour first, drop second",         color: tkc("cat-2"), base: 88,  drift: +0.24 },
    ],
  },
];

function HRLivePolls({ room }) {
  const seeds = hrUM(() => _hrPollSeeds(room), [room.id]);
  // Per-poll local state: votes object keyed by option id, plus the user's locked choice
  const [polls, setPolls] = hrUS(() =>
    seeds.map(s => ({
      ...s,
      votes: Object.fromEntries(s.options.map(o => [o.id, o.base])),
      myPick: null,
      ticks: 0,
    }))
  );

  // Tick — nudges vote counts upward at each option's drift rate. Adds light
  // noise so bars move enough to feel live, but never decrement.
  hrUE(() => {
    const id = setInterval(() => {
      setPolls(prev => prev.map(p => {
        const votes = { ...p.votes };
        p.options.forEach(o => {
          // Per-tick: each option gains 0–2 votes based on its drift weight + jitter.
          const r = (Math.random() + Math.random()) / 2;
          const add = Math.max(0, Math.round((o.drift * 2 + (r - 0.4)) * 1.4));
          votes[o.id] = (votes[o.id] || 0) + add;
        });
        return { ...p, votes, ticks: p.ticks + 1 };
      }));
    }, 1700);
    return () => clearInterval(id);
  }, []);

  const castVote = (pollId, optId) => {
    setPolls(prev => prev.map(p => {
      if (p.id !== pollId) return p;
      // Allow vote-changing — un-cast the old, cast the new
      const votes = { ...p.votes };
      if (p.myPick && votes[p.myPick] > 0) votes[p.myPick] = votes[p.myPick] - 1;
      votes[optId] = (votes[optId] || 0) + 1;
      return { ...p, votes, myPick: optId };
    }));
  };

  return (
    <div className="m-stack" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
      {polls.map(p => <HRPollCard key={p.id} poll={p} onVote={(optId) => castVote(p.id, optId)}/>)}
    </div>
  );
}

function HRPollCard({ poll, onVote }) {
  const total = Object.values(poll.votes).reduce((s, n) => s + n, 0);
  const leadingId = poll.options.reduce((best, o) => (poll.votes[o.id] || 0) > (poll.votes[best] || 0) ? o.id : best, poll.options[0].id);
  const closed = false;
  const accent = poll.options.find(o => o.id === leadingId)?.color || tkc("amber");

  return (
    <div style={{
      background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
      padding: "20px 22px 18px", display: "flex", flexDirection: "column", gap: 14,
      position: "relative", overflow: "hidden",
    }}>
      {/* Live dot */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="t-mono" style={{
          fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", fontWeight: 600,
          textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "var(--r-1)", background: accent,
            boxShadow: `0 0 6px ${accent}`,
            animation: "hrPulse 1.4s ease-in-out infinite",
          }}/>
          {poll.eyebrow}
        </div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", fontVariantNumeric: "tabular-nums" }}>
          {total.toLocaleString()} VOTES
        </div>
      </div>

      <div className="t-display" style={{
        fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)",
        lineHeight: 1.2, letterSpacing: "-0.01em",
      }}>{poll.question}</div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {poll.options.map(o => {
          const votes = poll.votes[o.id] || 0;
          const share = total > 0 ? votes / total : 0;
          const mine = poll.myPick === o.id;
          const winning = o.id === leadingId;
          return (
            <button key={o.id} onClick={() => onVote(o.id)} disabled={closed} style={{
              padding: "10px 14px 12px",
              background: mine ? `linear-gradient(90deg, ${o.color}18 0%, transparent 60%)` : "var(--c-bg)",
              border: `1px solid ${mine ? o.color : winning ? "var(--c-line-2)" : "var(--c-line)"}`,
              borderRadius: "var(--r-1)", cursor: closed ? "default" : "pointer",
              textAlign: "left", color: "inherit",
              display: "flex", flexDirection: "column", gap: 6,
              transition: "background .2s, border-color .2s",
              position: "relative",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 500, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {o.label}
                    {mine && (
                      <span className="t-mono" style={{
                        fontSize: "var(--fs-label)", color: o.color, letterSpacing: ".16em", fontWeight: 700,
                        padding: "1px 5px", border: `1px solid ${o.color}55`, borderRadius: "var(--r-1)",
                      }}>✓ YOUR VOTE</span>
                    )}
                    {winning && !mine && (
                      <span className="t-mono" style={{
                        fontSize: "var(--fs-label)", color: o.color, letterSpacing: ".16em", fontWeight: 700,
                        padding: "1px 5px", border: `1px solid ${o.color}55`, borderRadius: "var(--r-1)",
                      }}>LEADING</span>
                    )}
                  </div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 3, textTransform: "uppercase" }}>{o.sub}</div>
                </div>
                <div className="t-num" style={{
                  fontFamily: "var(--f-mono)", fontVariantNumeric: "tabular-nums",
                  fontSize: "var(--fs-body)", fontWeight: 700, color: winning ? o.color : "var(--c-ink-2)",
                  flexShrink: 0,
                }}>
                  {(share * 100).toFixed(0)}%
                  <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", fontWeight: 500, marginLeft: 4 }}>{votes.toLocaleString()}</span>
                </div>
              </div>
              {/* Live bar */}
              <div style={{ position: "relative", height: 4, background: "rgba(255,255,255,.05)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: `${share * 100}%`,
                  background: o.color,
                  borderRadius: "var(--r-1)",
                  transition: "width .9s cubic-bezier(.2,.7,.2,1)",
                  boxShadow: winning ? `0 0 8px ${o.color}88` : "none",
                }}/>
                {/* Subtle live shimmer for the leading bar */}
                {winning && share > 0 && (
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: `${share * 100}%`,
                    background: `linear-gradient(90deg, transparent 0%, ${o.color}50 50%, transparent 100%)`,
                    backgroundSize: "200% 100%",
                    animation: "hrShimmer 2.2s ease-in-out infinite",
                  }}/>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", lineHeight: 1.5, marginTop: 2 }}>
        {poll.note}
      </div>
      {poll.bonus && (
        <div className="t-mono" style={{
          fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em",
          textTransform: "uppercase", padding: "6px 8px",
          background: "rgba(var(--accent-rgb),.06)", border: "1px solid rgba(var(--accent-rgb),.2)",
          borderRadius: "var(--r-1)", fontWeight: 600,
        }}>★ {poll.bonus}</div>
      )}

      <style>{`@keyframes hrShimmer { 0% { background-position: -100% 0; } 100% { background-position: 200% 0; } }`}</style>
    </div>
  );
}

// ─── Audit-call draw ───────────────────────────────────────────────────
function HRAuditDraw({ room }) {
  const cd = _hrCD(room.drawAt);
  const [drew, setDrew] = hrUS(false);
  const [winner, setWinner] = hrUS(null);
  const draw = () => {
    setDrew(true);
    setTimeout(() => setWinner({ who: "@klaus.w", tier: "Collector · 1×" }), 1800);
  };
  return (
    <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: "20px 22px" }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>◉ AUDIT-CALL DRAW</div>
      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 6, lineHeight: 1.15 }}>
        One holder gets a 1:1 call with {room.director} tomorrow at 10am.
      </div>

      {!drew && (
        <>
          <div style={{
            marginTop: 16, padding: "14px 16px",
            background: "var(--c-bg)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>DRAW IN</div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-amber)", lineHeight: 1, marginTop: 2 }}>
                {String(cd.m).padStart(2, "0")}<span style={{ color: "var(--c-ink-3)", margin: "0 4px" }}>:</span>{String(cd.s).padStart(2, "0")}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>ELIGIBLE HOLDERS</div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-ink)", lineHeight: 1, marginTop: 2 }}>{room.listeners}</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={draw} style={{ marginTop: 14, width: "100%", height: 44 }}>
            ◉ Run draw now
          </button>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)", marginTop: 10, lineHeight: 1.5 }}>
            Eligible: any holder of {room.title} who showed up tonight. Winner is paid out a private call link 60 seconds after the draw.
          </div>
        </>
      )}

      {drew && !winner && (
        <div style={{ marginTop: 22, padding: "26px 18px", background: "var(--c-bg)", border: "1px solid var(--c-amber)", borderRadius: "var(--r-2)", textAlign: "center" }}>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-amber)", letterSpacing: "-0.02em", animation: "hrShuf .14s steps(1) infinite" }}>
            @{["mira_h","klaus.w","yara","dax","elena.r"][Math.floor(Math.random() * 5)]}
          </div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 8 }}>SHUFFLING…</div>
          <style>{`@keyframes hrShuf { 0% { opacity: 1 } 50% { opacity: .4 } 100% { opacity: 1 } }`}</style>
        </div>
      )}

      {winner && (
        <div style={{ marginTop: 22, padding: "20px 18px", background: "rgba(var(--accent-rgb),0.10)", border: "1px solid var(--c-amber)", borderRadius: "var(--r-2)" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>★ WINNER</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-ink)", marginTop: 6 }}>{winner.who}</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 4 }}>{winner.tier.toUpperCase()}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button className="btn btn-primary" style={{ flex: 1, height: 36 }} onClick={() => { const u = location.origin + location.pathname + "#/rooms"; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => window.toast && toast({ title: "CALL LINK COPIED", text: "Paste it to the holders you want in the room.", kind: "good" })).catch(() => window.toast && toast({ title: "COULDN'T COPY", text: u, kind: "info" })); }}>Send call link </button>
            <button className="btn btn-ghost" style={{ height: 36, padding: "0 14px" }}>Re-draw</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Secondary floor ───────────────────────────────────────────────────

function HRSecondary({ room }) {
  const rising = room.secondaryDelta >= 0;
  const listings = Array.from({ length: 5 }).map((_, i) => ({
    tier: ["Collector","Patron","Producer","Collector","Patron"][i],
    price: room.secondaryFloor * (1 + i * 0.18),
    seller: ["@hana","@dax","@elena.r","@arn","@klaus.w"][i],
  }));
  return (
    <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: "20px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>◐ SECONDARY · {room.title.toUpperCase()}</div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: rising ? tkc("good") : tkc("bad"), letterSpacing: ".16em" }}>
          {rising ? "▲" : "▼"} {Math.abs(room.secondaryDelta)}% / 24H
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-amber)", lineHeight: 1 }}>{room.secondaryFloor}E</div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>FLOOR · {room.listed} listed</div>
      </div>

      {/* Sparkline */}
      <svg viewBox="0 0 200 40" style={{ width: "100%", height: 40, marginTop: 12 }}>
        <polyline fill="none" stroke= "var(--c-amber)" strokeWidth="1.5" points={Array.from({ length: 40 }).map((_, i) => `${i * 5},${24 - 14 * Math.sin(i / 4 + room.secondaryFloor * 8) - i * 0.18 * (rising ? -1 : 1)}`).join(" ")}/>
      </svg>

      <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
        {listings.slice(0, 4).map((l, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "center",
            padding: "8px 12px", background: "var(--c-bg)", border: "1px solid var(--c-line)", borderRadius: "var(--r-1)",
          }}>
            <div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{l.tier}</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{l.seller}</div>
            </div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)" }}>{l.price.toFixed(3)}E</div>
            <button className="btn btn-primary" style={{ height: 28, padding: "0 10px", fontSize: "var(--fs-label)" }} onClick={() => { if (window.openPayDrawer) window.openPayDrawer({ kind: "buy", title: "Place a bid", subtitle: "Secondary market · holders only", priceUSD: 240 }); else if (window.cinaNotYet) window.cinaNotYet("Bidding"); }}>Bid </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Schedule of upcoming rooms ────────────────────────────────────────

function HRSchedule({ rooms }) {
  return (
    <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: "20px 22px" }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>◇ THIS WEEK</div>
      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 6 }}>Upcoming rooms</div>

      <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
        {[
          { day: "WED", time: "21:30", title: "Last Light · S2 finale", who: "Elias Voss" },
          { day: "FRI", time: "20:00", title: "Marauder · pilot", who: "Hara Lin" },
          { day: "SAT", time: "22:30", title: "The Frequency · short", who: "Renée Ng" },
          { day: "SUN", time: "21:00", title: "Open mic · directors only", who: "Cina Independent" },
        ].map((s, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 12, alignItems: "center",
            padding: "10px 14px", background: "var(--c-bg)", border: "1px solid var(--c-line)", borderRadius: "var(--r-1)",
          }}>
            <div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>{s.day}</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{s.time}</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>{s.who.toUpperCase()}</div>
            </div>
            <button className="btn btn-ghost" style={{ height: 28, padding: "0 10px", fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", letterSpacing: ".16em" }} onClick={() => window.toast && toast({ title: "YOU'RE IN", text: "Added to the room. We'll remind you an hour before.", kind: "good" })}>RSVP </button>
          </div>
        ))}
      </div>
    </div>
  );
}

window.HolderRoomsPage = HolderRoomsPage;
