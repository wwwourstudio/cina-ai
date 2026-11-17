// watch-premiere.jsx — Red carpet premiere experience.
// Theatrical countdown + holder lobby + live audience pulse.

const { useState: usq, useEffect: ueq, useMemo: umq, useRef: urq } = React;

function PremierePage({ filmId }) {
  const film = getFilm(filmId) || CATALOG[0];
  const [phase, setPhase] = usq("countdown"); // countdown · doors · curtain · live
  const [secs, setSecs] = usq(180); // 3 min countdown for demo
  const [audience, setAudience] = usq(842);
  const [recentJoins, setRecentJoins] = usq([]);

  // Tick countdown
  ueq(() => {
    if (phase !== "countdown") return;
    const id = setInterval(() => {
      setSecs(s => {
        if (s <= 1) { setPhase("doors"); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Audience grows live
  ueq(() => {
    const id = setInterval(() => {
      setAudience(a => a + Math.floor(Math.random() * 3));
      const names = ["rena_ko","ash.404","june_a","park_dr","miradawn","tao_reng","soren_v","voss_fan99"];
      const name = names[Math.floor(Math.random() * names.length)];
      setRecentJoins(prev => [name, ...prev].slice(0, 4));
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  // ─── Countdown phase ────────────────────────────────────────────────
  if (phase === "countdown") {
    return (
      <div style={{
        minHeight: "calc(100vh - 60px)",
        background: `radial-gradient(ellipse at center, ${film.color || tkc("cat-3")}22 0%, ${tkc("black")} 70%)`,
        position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {/* Searchlights */}
        <SearchLights color={film.color || tkc("amber")}/>
        {/* Floating dust */}
        <Dust/>

        <div style={{ textAlign: "center", zIndex: 2, padding: 32 }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: film.color || tkc("amber"), letterSpacing: ".16em", marginBottom: 16, opacity: 0.85 }}>WORLD PREMIERE · TONIGHT</div>
          <h1 className="t-display" style={{
            fontStyle: "italic", fontSize: "clamp(64px, 12vw, 180px)", fontWeight: 400,
            letterSpacing: "-0.02em", margin: 0, lineHeight: 0.95,
            color: tkc("white"),
            textShadow: `0 0 40px ${film.color || tkc("amber")}55`,
          }}>{film.title}</h1>
          <div style={{ fontSize: "var(--fs-body)", color: "rgba(255,255,255,0.55)", marginTop: 18, fontFamily: "var(--f-mono)", letterSpacing: ".16em" }}>BY {film.creator?.toUpperCase()}</div>

          {/* Big timer */}
          <div style={{
            marginTop: 56,
            display: "inline-flex", alignItems: "baseline", gap: 12,
            padding: "20px 48px",
            border: `1px solid ${film.color || tkc("amber")}66`,
            borderRadius: "var(--r-2)",
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(20px)",
          }}>
            <div className="t-display" style={{
              fontStyle: "italic", fontSize: "var(--fs-display)", fontWeight: 400,
              fontVariantNumeric: "tabular-nums",
              color: tkc("white"), letterSpacing: "-0.02em", lineHeight: 1,
            }}>{fmt(secs)}</div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,0.6)" }}>UNTIL DOORS</div>
          </div>

          {/* Audience tally */}
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--fs-body)", color: "rgba(255,255,255,0.7)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: tkc("good"), boxShadow: `0 0 8px ${tkc("good")}` }}/>
              <span><b style={{ color: tkc("white"), fontFamily: "var(--f-mono)" }}>{audience.toLocaleString()}</b> already in the lobby</span>
            </div>
            <div style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,0.4)", fontFamily: "var(--f-mono)", letterSpacing: ".16em", textTransform: "uppercase" }}>
              {recentJoins[0] && `${recentJoins[0]} just arrived`}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 36 }}>
            <button onClick={() => setSecs(s => Math.max(0, s - 30))} style={{ padding: "10px 18px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: tkc("white"), borderRadius: "var(--r-3)", fontSize: "var(--fs-body)", cursor: "pointer", fontFamily: "var(--f-mono)", letterSpacing: ".16em" }}>SKIP 30S (DEMO)</button>
            <button onClick={() => navigate(`/film/${film.id}`)} style={{ padding: "10px 18px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", borderRadius: "var(--r-3)", fontSize: "var(--fs-body)", cursor: "pointer" }}>Back to film page</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Doors open phase ──────────────────────────────────────────────
  if (phase === "doors") {
    return (
      <div style={{
        minHeight: "calc(100vh - 60px)",
        background: tkc("black"), color: tkc("white"),
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Curtain doors that part */}
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: 0, width: "50%",
          background: `linear-gradient(90deg, ${film.color || tkc("blood")} 0%, ${tkc("on-amber")} 100%)`,
          animation: "premiere-door-l 2.4s ease-in-out forwards",
          boxShadow: "inset -20px 0 60px rgba(0,0,0,0.6)",
        }}/>
        <div style={{
          position: "absolute", top: 0, bottom: 0, right: 0, width: "50%",
          background: `linear-gradient(270deg, ${film.color || tkc("blood")} 0%, ${tkc("on-amber")} 100%)`,
          animation: "premiere-door-r 2.4s ease-in-out forwards",
          boxShadow: "inset 20px 0 60px rgba(0,0,0,0.6)",
        }}/>

        <div style={{ textAlign: "center", zIndex: 2 }}>
          <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-display)", fontWeight: 400, margin: 0, letterSpacing: "-0.02em", animation: "premiere-fade 2s ease-out 0.4s forwards", opacity: 0 }}>Doors open.</h2>
        </div>

        <button onClick={() => setPhase("live")} style={{
          position: "absolute", bottom: 48, left: "50%", transform: "translateX(-50%)",
          padding: "14px 32px", background: "var(--c-amber)", border: "none", color: "var(--c-on-amber)",
          borderRadius: 30, fontSize: "var(--fs-body)", fontWeight: 700, cursor: "pointer", zIndex: 5,
          animation: "premiere-fade 1s ease-out 1.6s forwards", opacity: 0,
          fontFamily: "var(--f-display)", fontStyle: "italic", letterSpacing: "-0.01em",
        }}>Take your seat →</button>

        <style>{`
          @keyframes premiere-door-l { 0% { transform: translateX(0) } 100% { transform: translateX(-100%) } }
          @keyframes premiere-door-r { 0% { transform: translateX(0) } 100% { transform: translateX(100%) } }
          @keyframes premiere-fade { 0% { opacity: 0 } 100% { opacity: 1 } }
        `}</style>
      </div>
    );
  }

  // ─── Live phase — playing with live pulse ──────────────────────────
  return (
    <div style={{ minHeight: "calc(100vh - 60px)", background: tkc("black"), display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, position: "relative", background: `linear-gradient(135deg, ${film.cover} 0%, ${tkc("black")} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ textAlign: "center", color: tkc("white"), zIndex: 1 }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: tkc("good"), marginBottom: 12 }}>● LIVE · {audience.toLocaleString()} WATCHING</div>
          <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-display)", fontWeight: 400, margin: 0, letterSpacing: "-0.02em" }}>{film.title}</h2>
          <div style={{ fontSize: "var(--fs-body)", color: "rgba(255,255,255,0.5)", marginTop: 16, fontFamily: "var(--f-mono)" }}>WORLD PREMIERE</div>
        </div>

        {/* Pulse strip — emoji reactions floating up */}
        <PulseStrip color={film.color || tkc("amber")}/>
      </div>

      <div style={{ padding: "12px 24px", background: "rgba(0,0,0,0.85)", borderTop: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => navigate(film.kind === "series" ? `/series/${film.id}/ep/1` : `/film/${film.id}`)} style={{ padding: "8px 16px", background: "var(--c-amber)", border: "none", color: "var(--c-on-amber)", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", fontWeight: 600, cursor: "pointer" }}>Continue in player</button>
        <span style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,0.5)", fontFamily: "var(--f-mono)" }}>The premiere ends · the film opens to everyone in 7 days</span>
      </div>
    </div>
  );
}

function SearchLights({ color }) {
  return (
    <>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: "absolute",
          top: "-20%", left: `${20 + i * 25}%`,
          width: 8, height: "140%",
          background: `linear-gradient(180deg, ${color}33 0%, transparent 80%)`,
          transformOrigin: "top center",
          animation: `search-${i} ${6 + i}s ease-in-out infinite alternate`,
          opacity: 0.6,
        }}/>
      ))}
      <style>{`
        @keyframes search-0 { 0% { transform: rotate(-22deg) } 100% { transform: rotate(18deg) } }
        @keyframes search-1 { 0% { transform: rotate(15deg) } 100% { transform: rotate(-12deg) } }
        @keyframes search-2 { 0% { transform: rotate(-8deg) } 100% { transform: rotate(22deg) } }
      `}</style>
    </>
  );
}

function Dust() {
  const dots = umq(() => Array.from({ length: 30 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    s: 1 + Math.random() * 2,
    d: 8 + Math.random() * 12,
    a: Math.random() * 0.4 + 0.2,
  })), []);
  return (
    <>
      {dots.map((d, i) => (
        <div key={i} style={{
          position: "absolute", left: `${d.x}%`, top: `${d.y}%`,
          width: d.s, height: d.s, borderRadius: "50%",
          background: tkc("white"), opacity: d.a,
          animation: `dust-${i % 3} ${d.d}s linear infinite`,
        }}/>
      ))}
      <style>{`
        @keyframes dust-0 { 0% { transform: translate(0,0) } 100% { transform: translate(20px, -120px) } }
        @keyframes dust-1 { 0% { transform: translate(0,0) } 100% { transform: translate(-30px, -100px) } }
        @keyframes dust-2 { 0% { transform: translate(0,0) } 100% { transform: translate(10px, -140px) } }
      `}</style>
    </>
  );
}

function PulseStrip({ color }) {
  const [bursts, setBursts] = usq([]);
  ueq(() => {
    const id = setInterval(() => {
      const emoji = ["🔥","♡","✦","🥶","👁","💀","✨"][Math.floor(Math.random() * 7)];
      const x = 20 + Math.random() * 60;
      const id = Math.random();
      setBursts(b => [...b, { id, emoji, x }]);
      setTimeout(() => setBursts(b => b.filter(z => z.id !== id)), 4000);
    }, 600);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      {bursts.map(b => (
        <div key={b.id} style={{
          position: "absolute", bottom: 0, left: `${b.x}%`,
          fontSize: "var(--fs-title)",
          animation: "burst 4s ease-out forwards",
          pointerEvents: "none",
        }}>{b.emoji}</div>
      ))}
      <style>{`
        @keyframes burst { 0% { transform: translateY(0); opacity: 0 } 10% { opacity: 1 } 100% { transform: translateY(-280px); opacity: 0 } }
      `}</style>
    </>
  );
}

Object.assign(window, { PremierePage });
