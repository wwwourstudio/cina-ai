// watch-your-cut.jsx — "Your Cut" · the end-of-film moment for branched films.
//
// When the credits hit and the viewer chose at least one fork, the player
// resolves their path into a named, shareable artifact — "The Mercy Cut" —
// with the scene-by-scene choices, how rare their exact path is (real fork
// ledger + seeded baseline), and three actions that all close loops that
// already exist: share the path link, re-choose (fm.resetPath + restart),
// or carry into the next episode (series-arc). Opening a shared link
// (#/film/:id?path=A·B) pre-loads those choices so a friend literally
// watches YOUR cut.
//
// Loaded after watch-fork-moment.jsx, before watch-watch.jsx.

(function () {
  const { useState: usYC, useEffect: ueYC, useMemo: umYC } = React;

  // Deterministic cut name from the choice letters + film.
  const YC_NAMES = {
    A: ["Mercy", "Daylight", "Honest", "Long Way Home", "Quiet"],
    B: ["Scorched", "Midnight", "Reckoning", "No Return", "Feral"],
    C: ["Sideways", "Stranger", "Third Door", "Undertow", "Borrowed"],
  };
  function ycHash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function ycCutName(film, letters) {
    if (!letters.length) return null;
    const counts = {}; letters.forEach(l => counts[l] = (counts[l] || 0) + 1);
    const dom = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    const pool = YC_NAMES[dom] || YC_NAMES.A;
    return "The " + pool[ycHash(film.id + letters.join("")) % pool.length] + " Cut";
  }

  // How rare is this exact path? Real ledger walkers + a seeded baseline of
  // simulated viewers so the number is meaningful from the first playthrough.
  function ycRarity(film, forks, choices) {
    const letters = forks.map(f => choices[f.id]).filter(Boolean);
    if (!letters.length) return null;
    const seedTotal = 240 + (ycHash(film.id) % 400);         // baseline audience
    let matching = seedTotal;
    forks.forEach((f, i) => {
      if (!choices[f.id]) return;
      // seeded per-fork split, tilted by the real ledger counts
      const by = window.forkLedgerCounts ? window.forkLedgerCounts(f.id) : {};
      const opts = (f.options || []).map(o => o.letter);
      const seedShare = 0.34 + ((ycHash(f.id + choices[f.id]) % 33) / 100); // .34–.66
      const real = (by[choices[f.id]] || 0);
      const realTotal = Object.values(by).reduce((a, n) => a + n, 0);
      const share = realTotal >= 5 ? real / realTotal : seedShare;
      matching = Math.max(1, Math.round(matching * share));
    });
    const pct = Math.max(0.4, Math.round((matching / seedTotal) * 1000) / 10);
    return { pct, seedTotal };
  }

  // Choices pre-load from a shared link: #/film/:id?path=B·A
  function ycApplySharedPath(film, forks) {
    try {
      const m = (location.hash || "").match(/[?&]path=([^&]+)/);
      if (!m) return false;
      const letters = decodeURIComponent(m[1]).split(/[·\-,]/).filter(Boolean);
      if (!letters.length) return false;
      const key = "cina:fork-choices:" + film.id;
      const existing = JSON.parse(localStorage.getItem(key) || "{}");
      if (Object.keys(existing).length) return false;   // never clobber the viewer's own path
      const next = {};
      forks.forEach((f, i) => { if (letters[i]) next[f.id] = letters[i].toUpperCase(); });
      localStorage.setItem(key, JSON.stringify(next));
      return true;
    } catch (e) { return false; }
  }

  function useYourCut({ film, t, dur, fm, setT, setPlaying }) {
    const [open, setOpen] = usYC(false);
    const [dismissed, setDismissed] = usYC(false);
    const letters = (fm.forks || []).map(f => fm.choices[f.id]).filter(Boolean);

    // Shared-link pre-load, once per mount.
    ueYC(() => {
      if (ycApplySharedPath(film, fm.forks || []) && window.toast) {
        toast({ title: "WATCHING A SHARED CUT", text: "This film will follow your friend's path — you can still re-choose", kind: "good" });
      }
    }, [film.id]);

    // Credits trigger: last 2% of runtime, at least one choice made.
    ueYC(() => {
      if (!dismissed && !open && letters.length > 0 && t >= dur * 0.98) { setOpen(true); setPlaying(false); }
    }, [t, letters.length, dismissed]);

    return {
      open, letters,
      show: () => { setOpen(true); setPlaying(false); },
      close: () => { setOpen(false); setDismissed(true); setPlaying(true); },
      rechoose: () => {
        fm.resetPath();
        setOpen(false); setDismissed(false);
        const first = (fm.forks || [])[0];
        setT(first ? Math.max(0, first.at - 8) : 0);
        setPlaying(true);
        if (window.toast) toast({ title: "PATH CLEARED", text: "Back to the first fork — choose differently", kind: "good" });
      },
    };
  }

  function YourCutOverlay({ film, fm, yc }) {
    const letters = yc.letters;
    const cutName = ycCutName(film, letters);
    const rare = ycRarity(film, fm.forks, fm.choices);
    const accent = film.color || tkc("amber");
    const shareUrl = location.href.split("?")[0].split("#")[0] + "#/film/" + film.id + "?path=" + letters.join("·");
    const [copied, setCopied] = usYC(false);
    const [poster, setPoster] = usYC(false);
    const nextEp = film.kind === "series" && film.currentEp ? film.currentEp + 1 : null;
    const chosen = (fm.forks || []).filter(f => fm.choices[f.id]);
    // Defiance: how often this path went against the room (real ledger rows).
    const defied = (window.forkLedgerRead ? window.forkLedgerRead() : []).filter(r => r.filmId === film.id && r.minority).length;

    const copy = () => {
      try { navigator.clipboard.writeText(shareUrl); } catch (e) {}
      setCopied(true);
      if (window.toast) toast({ title: "LINK COPIED", text: "Anyone who opens it watches your exact cut", kind: "good" });
      setTimeout(() => setCopied(false), 2500);
    };

    return (
      <div style={{ position: "absolute", inset: 0, zIndex: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(4,4,6,.88)", backdropFilter: "blur(10px)" }}>
        <div style={{ width: "min(560px, 92%)", textAlign: "center", padding: "10px 0" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, fontWeight: 700 }}>⑂ END OF YOUR PATH · {film.title.toUpperCase()}</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: tkc("white"), margin: "12px 0 2px", letterSpacing: "-0.02em", lineHeight: 1.05 }}>{cutName}</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.55)" }}>
            PATH {letters.join(" · ")}{rare ? ` — ${rare.pct <= 20 ? "ONLY " : ""}${rare.pct}% OF VIEWERS TOOK THIS EXACT CUT` : ""}{defied > 0 ? ` · DEFIED THE ROOM ${defied}×` : ""}
          </div>

          {/* the path, scene by scene */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, margin: "22px 0 6px", flexWrap: "wrap" }}>
            {chosen.map((f, i) => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ border: `1px solid ${accent}66`, background: `${accent}14`, borderRadius: "var(--r-2)", padding: "9px 13px", textAlign: "left" }}>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.5)" }}>SCENE {f.sceneNum}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginTop: 3 }}>
                    <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: accent }}>{fm.choices[f.id]}</span>
                    <span style={{ fontSize: "var(--fs-body)", color: "rgba(255,255,255,.82)" }}>{((f.options || []).find(o => o.letter === fm.choices[f.id]) || {}).label || "Your choice"}</span>
                  </div>
                </div>
                {i < chosen.length - 1 && <span style={{ color: "rgba(255,255,255,.35)" }}>→</span>}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 9, justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}>
            <button onClick={copy} className="t-mono" style={{
              padding: "12px 20px", borderRadius: "var(--r-2)", cursor: "pointer", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
              background: accent, color: tkc("bg"), border: `1px solid ${accent}`,
            }}>{copied ? "✓ COPIED" : "SHARE YOUR CUT"}</button>
            {window.PosterOverlay && (
              <button onClick={() => setPoster(true)} className="t-mono" style={{
                padding: "12px 20px", borderRadius: "var(--r-2)", cursor: "pointer", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
                background: "transparent", color: tkc("white"), border: "1px solid rgba(255,255,255,.35)",
              }}>SAVE POSTER</button>
            )}
            <button onClick={yc.rechoose} className="t-mono" style={{
              padding: "12px 20px", borderRadius: "var(--r-2)", cursor: "pointer", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
              background: "transparent", color: tkc("white"), border: "1px solid rgba(255,255,255,.35)",
            }}>⑂ RE-CHOOSE</button>
            {nextEp && (
              <button onClick={() => { yc.close(); if (window.toast) toast({ title: "PATH CARRIES FORWARD", text: `Episode ${nextEp} opens on path ${letters[letters.length - 1]}`, kind: "good" }); }} className="t-mono" style={{
                padding: "12px 20px", borderRadius: "var(--r-2)", cursor: "pointer", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
                background: "transparent", color: tkc("white"), border: "1px solid rgba(255,255,255,.35)",
              }}>NEXT EPISODE →</button>
            )}
            <button onClick={yc.close} className="t-mono" style={{
              padding: "12px 14px", borderRadius: "var(--r-2)", cursor: "pointer", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              background: "transparent", color: "rgba(255,255,255,.55)", border: "none",
            }}>CREDITS</button>
          </div>

          <div className="t-mono" style={{ marginTop: 18, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.35)" }}>
            EVERY CHOICE PAID THE DIRECTOR A VIEW-SHARE ROYALTY · YOUR PATH SHAPES THE SERIES
          </div>
        </div>
        {poster && (
          <PosterOverlay kind="cut" film={film} letters={letters} cutName={cutName}
            rarePct={rare ? rare.pct : null} defied={defied}
            choices={chosen.map(f => ({ sceneNum: f.sceneNum, label: ((f.options || []).find(o => o.letter === fm.choices[f.id]) || {}).label }))}
            onClose={() => setPoster(false)}/>
        )}
      </div>
    );
  }

  Object.assign(window, { useYourCut, YourCutOverlay });
})();
