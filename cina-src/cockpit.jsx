// cockpit.jsx — "On your desk": live decisions + earnings, inline on the Slate.
//
// Loads AFTER dashboard.jsx and registers window.CockpitSection, which the
// Dashboard renders as zone 00 right under the hero — part of the page flow,
// styled with the dashboard's own zone vocabulary. Every number is pulled
// live from the same ledgers the rest of the system writes:
//   cina:board-v2          shots + statuses + branches   (Board)
//   cina:fork-ledger       viewer path choices           (Watch player)
//   cina:commerce:ledger   wardrobe sales + director cut (Wardrobe + player)
//   cina:cut-path          assembled cut                 (Editor)

(function () {
  const { useState: usCK, useMemo: umCK, useEffect: ueCK } = React;
  const FORK_RATE = 0.12;

  const ckRead = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch (e) { return fb; } };
  const ckMoney = (n) => "$" + (Math.round(n * 100) / 100).toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0 });

  // ─── Live state of the whole operation ───────────────────────────────────
  function ckState() {
    const board = ckRead("cina:board-v2", null);
    const frames = board ? Object.values(board.framesByScene || {}).flat() : [];
    const drafts = frames.filter(f => f.status === "draft").length;
    const approved = frames.filter(f => f.status === "approved").length;
    const rendered = frames.filter(f => f.status === "rendered").length;

    const forkLedger = ckRead("cina:fork-ledger", []);
    const forkRoyalty = forkLedger.length * FORK_RATE;
    const byFork = {};
    forkLedger.forEach(r => { (byFork[r.forkId] = byFork[r.forkId] || {})[r.letter] = ((byFork[r.forkId] || {})[r.letter] || 0) + 1; });
    let hotFork = null;
    Object.entries(byFork).forEach(([fid, by]) => {
      const total = Object.values(by).reduce((a, b) => a + b, 0);
      const [winLetter, winCount] = Object.entries(by).sort((a, b) => b[1] - a[1])[0];
      const share = winCount / total;
      if (total >= 1 && share >= 0.66 && (!hotFork || total > hotFork.total)) {
        const scene = forkLedger.find(r => r.forkId === fid);
        hotFork = { forkId: fid, sceneNum: scene && scene.sceneNum, letter: winLetter, share: Math.round(share * 100), total };
      }
    });

    const sales = ckRead("cina:commerce:ledger", []);
    const wardrobeCut = sales.reduce((a, r) => a + (r.cut || 0), 0);
    const branched = board ? board.scenes.filter(s => s.branchOf).length : 0;
    const cutPath = (() => { try { return localStorage.getItem("cina:cut-path"); } catch (e) { return null; } })();

    return { frames: frames.length, drafts, approved, rendered, forkChoices: forkLedger.length, forkRoyalty, hotFork, sales: sales.length, wardrobeCut, branched, cutPath, lastSale: sales[0] || null };
  }

  function DecisionCard({ glyph, title, detail, cta, onGo, urgent }) {
    return (
      <button onClick={onGo} className="ck-card" style={{
        flex: "1 1 180px", minWidth: 0, textAlign: "left", padding: "14px 16px", borderRadius: 0, cursor: "pointer",
        background: urgent ? "linear-gradient(135deg, rgba(var(--accent-rgb),.08), rgba(var(--accent-rgb),.02))" : "var(--c-panel)",
        border: `1px solid ${urgent ? "rgba(var(--accent-rgb),.45)" : "var(--c-line)"}`,
        color: "inherit", display: "flex", flexDirection: "column", gap: 6,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--c-amber)", fontSize: "var(--fs-body)" }}>{glyph}</span>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: urgent ? "var(--c-amber)" : "var(--c-ink-4)" }}>{urgent ? "NEEDS YOU" : "STANDING BY"}</span>
        </div>
        <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.45 }}>{detail}</div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", marginTop: "auto", paddingTop: 4 }}>{cta} →</div>
      </button>
    );
  }

  function EarnRow({ label, sub, amount, count, onGo }) {
    return (
      <button onClick={onGo} style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
        padding: "10px 16px", background: "transparent", border: "none", borderTop: "1px solid var(--c-line)",
        cursor: "pointer", color: "inherit",
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{label}</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginTop: 2 }}>{sub}</div>
        </div>
        <span className="t-mono t-num" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", whiteSpace: "nowrap" }}>{count}</span>
        <span className="t-num" style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-good)", minWidth: 62, textAlign: "right" }}>{ckMoney(amount)}</span>
      </button>
    );
  }

  function CockpitSection({ onOpenFilm, ZoneHead, compact, activeFilmId }) {
    const [tick, setTick] = usCK(0);
    ueCK(() => {
      const bump = () => setTick(t => t + 1);
      window.addEventListener("cina:pipeline-change", bump);
      window.addEventListener("cina:board-sync", bump);
      window.addEventListener("storage", bump);
      return () => {
        window.removeEventListener("cina:pipeline-change", bump);
        window.removeEventListener("cina:board-sync", bump);
        window.removeEventListener("storage", bump);
      };
    }, []);
    const s = umCK(ckState, [tick]);
    const list = window.PROJECTS || [];
    const film = (activeFilmId && list.find(p => p.id === activeFilmId)) || list[0];
    const go = (view) => film && onOpenFilm && onOpenFilm(film, view);

    const decisions = [];
    if (s.drafts > 0) decisions.push({
      glyph: "✎", urgent: true, title: `${s.drafts} shot${s.drafts === 1 ? "" : "s"} awaiting approval`,
      detail: "Drafts on the Board can't render until you approve them.",
      cta: "Review on the Board", onGo: () => go("board"),
    });
    if (s.approved > 0) decisions.push({
      glyph: "✦", urgent: true, title: `${s.approved} approved, not yet rendered`,
      detail: "Approved shots are ready for the render queue.",
      cta: "Render from the Board", onGo: () => go("board"),
    });
    if (s.hotFork) decisions.push({
      glyph: "⑂", urgent: true, title: `Path ${s.hotFork.letter} wins Scene ${s.hotFork.sceneNum} · ${s.hotFork.share}%`,
      detail: `Viewers are decisive here. Consider making Path ${s.hotFork.letter} canon.`,
      cta: "Open the Branch map", onGo: () => go("board"),
    });
    if (s.rendered > 0 && !s.cutPath && s.branched > 0) decisions.push({
      glyph: "▤", urgent: false, title: "Takes rendered, no cut assembled",
      detail: "Assemble a per-path cut so each branch is watchable.",
      cta: "Assemble in the Editor", onGo: () => go("editor"),
    });
    if (decisions.length === 0) decisions.push({
      glyph: "☉", urgent: false, title: "Nothing is waiting on you",
      detail: "Board is clean, renders are done. Shoot more, or ship.",
      cta: "Open the Board", onGo: () => go("board"),
    });

    const totalEarn = s.wardrobeCut + s.forkRoyalty;

    return (
      <div style={{ width: "100%" }}>
        {ZoneHead && (
          <ZoneHead n="00" title="On your desk" sub="Decisions & dollars · live"
            action={<button className="t-mono" onClick={() => setTick(t => t + 1)} style={{ background: "transparent", border: "none", color: "var(--c-ink-4)", fontSize: "var(--fs-label)", letterSpacing: ".16em", cursor: "pointer" }}>↻ REFRESH</button>}/>
        )}
        <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 12, alignItems: "start" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "stretch", minWidth: 0 }}>
            {decisions.slice(0, compact ? 2 : 3).map((d, i) => <DecisionCard key={i} {...d}/>)}
          </div>

          <div style={{ border: "1px solid var(--c-line)", borderRadius: 0, background: "var(--c-panel)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "12px 16px 10px", display: "flex", alignItems: "flex-end", gap: 10, background: "linear-gradient(180deg, rgba(106,163,122,.07), transparent)" }}>
              <div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>YOU'VE EARNED</div>
                <div className="t-num" style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-good)", lineHeight: 1.05 }}>{ckMoney(totalEarn)}</div>
              </div>
              <span style={{ flex: 1 }}></span>
              {s.lastSale && <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".08em", color: "var(--c-ink-4)", textAlign: "right", lineHeight: 1.6 }}>LATEST · {s.lastSale.brand.toUpperCase()}<br/>+{ckMoney(s.lastSale.cut)}</span>}
            </div>
            <EarnRow label="Wardrobe commissions" sub="SHOPTHISLOOK · STUDIO + PLAYER" amount={s.wardrobeCut} count={s.sales + " SALES"} onGo={() => go("vault")}/>
            <EarnRow label="Branch royalties" sub="VIEWER PATH CHOICES · $0.12 EACH" amount={s.forkRoyalty} count={s.forkChoices + " CHOICES"} onGo={() => go("board")}/>
          </div>
        </div>
      </div>
    );
  }

  window.CockpitSection = CockpitSection;
})();
