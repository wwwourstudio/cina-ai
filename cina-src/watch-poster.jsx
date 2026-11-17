// watch-poster.jsx — canvas-drawn shareable posters for Your Cut + Taste Print.
//
// drawCutPoster(film, letters, opts) and drawTastePoster(tp) render a
// 1000×1500 one-sheet to a canvas; PosterOverlay previews it with Download
// PNG (toDataURL → <a download>). No server, no fonts beyond what ships.
//
// Loaded after watch-taste.jsx, before watch-your-cut.jsx consumers render.

(function () {
  const { useState: usPO, useEffect: uePO, useRef: urPO } = React;

  const PO_W = 1000, PO_H = 1500;
  const PO_SERIF = 'italic 500 %spx Georgia, "Times New Roman", serif';
  const PO_MONO  = '%spx "Courier New", monospace';
  const TEMPER_COLORS = { A: tkc("good"), B: tkc("bad"), C: tkc("cat-2") };

  function poBg(ctx, tint) {
    ctx.fillStyle = tkc("bg");
    ctx.fillRect(0, 0, PO_W, PO_H);
    const g = ctx.createRadialGradient(PO_W * 0.3, PO_H * 0.25, 80, PO_W * 0.3, PO_H * 0.25, PO_H);
    g.addColorStop(0, tint + "33");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, PO_W, PO_H);
    // film grain
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
      ctx.fillRect(Math.random() * PO_W, Math.random() * PO_H, 1.2, 1.2);
    }
    // frame
    ctx.strokeStyle = "rgba(232,163,61,.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, PO_W - 72, PO_H - 72);
  }

  function poMono(ctx, text, x, y, size, color, ls = 4) {
    ctx.font = PO_MONO.replace("%s", size);
    ctx.fillStyle = color;
    let cx = x;
    for (const ch of text) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + ls; }
    return cx;
  }
  function poMonoWidth(ctx, text, size, ls = 4) {
    ctx.font = PO_MONO.replace("%s", size);
    let w = 0;
    for (const ch of text) w += ctx.measureText(ch).width + ls;
    return Math.max(0, w - ls);
  }
  function poMonoCenter(ctx, text, y, size, color, ls = 4) {
    poMono(ctx, text, (PO_W - poMonoWidth(ctx, text, size, ls)) / 2, y, size, color, ls);
  }

  // ─── The "Your Cut" one-sheet ─────────────────────────────────────────────
  function drawCutPoster(canvas, { film, letters, cutName, rarePct, defied, choices = [] }) {
    const ctx = canvas.getContext("2d");
    canvas.width = PO_W; canvas.height = PO_H;
    const tint = film.color || tkc("amber");
    poBg(ctx, tint);

    poMonoCenter(ctx, "CINA · ONE VIEWER'S CUT", 130, 20, tkc("amber"), 8);
    poMonoCenter(ctx, film.title.toUpperCase(), 185, 26, "rgba(255,255,255,.75)", 6);

    // big fork glyph
    ctx.strokeStyle = tint; ctx.lineWidth = 5; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(PO_W / 2, 270); ctx.lineTo(PO_W / 2, 360);
    ctx.moveTo(PO_W / 2, 360); ctx.lineTo(PO_W / 2 - 60, 450);
    ctx.moveTo(PO_W / 2, 360); ctx.lineTo(PO_W / 2 + 60, 450);
    ctx.stroke();

    // cut name — the star of the sheet
    ctx.textAlign = "center";
    ctx.font = PO_SERIF.replace("%s", 92);
    ctx.fillStyle = tkc("ink");
    const nameLines = cutName.length > 16 ? [cutName.replace(/ Cut$/, ""), "Cut"] : [cutName];
    nameLines.forEach((ln, i) => ctx.fillText(ln, PO_W / 2, 590 + i * 104));
    ctx.textAlign = "left";

    // path letters, huge
    const py = nameLines.length > 1 ? 840 : 760;
    const seg = 130;
    const startX = PO_W / 2 - ((letters.length - 1) * seg) / 2;
    letters.forEach((L, i) => {
      ctx.textAlign = "center";
      ctx.font = PO_SERIF.replace("%s", 76);
      ctx.fillStyle = TEMPER_COLORS[L] || tint;
      ctx.fillText(L, startX + i * seg, py);
      if (i < letters.length - 1) {
        ctx.fillStyle = "rgba(255,255,255,.35)";
        ctx.font = "40px Georgia, serif";
        ctx.fillText("·", startX + i * seg + seg / 2, py - 10);
      }
    });
    ctx.textAlign = "left";

    // scene choices
    let cy = py + 90;
    choices.slice(0, 4).forEach(c => {
      poMonoCenter(ctx, `SCENE ${c.sceneNum} — ${String(c.label || "").toUpperCase().slice(0, 34)}`, cy, 17, "rgba(255,255,255,.6)", 3);
      cy += 44;
    });

    // stats band
    const stats = [];
    if (rarePct != null) stats.push(`${rarePct}% OF VIEWERS TOOK THIS CUT`);
    if (defied > 0) stats.push(`DEFIED THE ROOM ${defied}×`);
    if (stats.length) poMonoCenter(ctx, stats.join("  ·  "), PO_H - 210, 18, tkc("amber"), 4);

    poMonoCenter(ctx, "EVERY CHOICE PAID THE DIRECTOR", PO_H - 130, 14, "rgba(255,255,255,.4)", 4);
    poMonoCenter(ctx, "CINA.FILM", PO_H - 96, 14, "rgba(255,255,255,.4)", 6);
  }

  // ─── The Taste Print one-sheet ────────────────────────────────────────────
  function drawTastePoster(canvas, tp) {
    const ctx = canvas.getContext("2d");
    canvas.width = PO_W; canvas.height = PO_H;
    const tint = (tp.domTemper && tp.domTemper.color) || tkc("amber");
    poBg(ctx, tint);

    poMonoCenter(ctx, "CINA · TASTE PRINT", 130, 20, tkc("amber"), 8);
    poMonoCenter(ctx, "COMPUTED FROM CHOICES, NOT VIEWS", 180, 15, "rgba(255,255,255,.5)", 4);

    // archetype
    ctx.textAlign = "center";
    ctx.fillStyle = tkc("ink");
    const words = (tp.archetype || "Still Forming").replace(/^The /, "").split(" ");
    const l1 = "The", rest = words.join(" ");
    ctx.font = PO_SERIF.replace("%s", 54);
    ctx.fillText(l1, PO_W / 2, 330);
    const restLines = rest.length > 14 ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")] : [rest];
    ctx.font = PO_SERIF.replace("%s", 88);
    restLines.forEach((ln, i) => ctx.fillText(ln, PO_W / 2, 440 + i * 100));
    ctx.textAlign = "left";

    // temperament bars
    let by = restLines.length > 1 ? 680 : 600;
    poMono(ctx, `AT THE FORKS · ${tp.forkTotal} CHOICES`, 120, by, 15, "rgba(255,255,255,.5)", 3);
    by += 40;
    const maxN = Math.max(1, ...tp.temper.map(t => t.n));
    tp.temper.forEach(t => {
      poMono(ctx, t.trait.toUpperCase(), 120, by + 17, 16, "rgba(255,255,255,.75)", 3);
      ctx.fillStyle = "rgba(255,255,255,.12)";
      ctx.fillRect(320, by, 440, 22);
      ctx.fillStyle = t.color;
      ctx.fillRect(320, by, Math.round((t.n / maxN) * 440), 22);
      poMono(ctx, `${t.pct}%`, 785, by + 17, 16, "rgba(255,255,255,.75)", 2);
      by += 56;
    });

    // obsessions
    by += 36;
    poMono(ctx, "OBSESSIONS", 120, by, 15, "rgba(255,255,255,.5)", 3);
    by += 44;
    let ox = 120;
    tp.topGenres.slice(0, 3).forEach((g, i) => {
      const label = g.toUpperCase();
      const w = poMonoWidth(ctx, label, 16, 3) + 44;
      ctx.strokeStyle = i === 0 ? tkc("amber") : "rgba(255,255,255,.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(ox, by - 26, w, 40, 20); else ctx.rect(ox, by - 26, w, 40);
      ctx.stroke();
      poMono(ctx, label, ox + 22, by, 16, i === 0 ? tkc("amber") : "rgba(255,255,255,.75)", 3);
      ox += w + 16;
    });

    // footline facts
    const facts = [];
    if (tp.contrarian >= 40) facts.push(`CONTRARIAN — ${tp.contrarian}% AGAINST THE ROOM`);
    if (tp.collector) facts.push(`OWNS, DOESN'T RENT`);
    if (tp.topBrand) facts.push(`WEARS THE SCREEN — ${String(tp.topBrand[0]).toUpperCase()}`);
    if (facts.length) poMonoCenter(ctx, facts.join("  ·  "), PO_H - 210, 15, tkc("amber"), 3);

    poMonoCenter(ctx, "THE PRINT RETUNES WITH EVERY CHOICE", PO_H - 130, 14, "rgba(255,255,255,.4)", 4);
    poMonoCenter(ctx, "CINA.FILM", PO_H - 96, 14, "rgba(255,255,255,.4)", 6);
  }

  // ─── Preview + download overlay ───────────────────────────────────────────
  function PosterOverlay({ kind, film, letters, cutName, rarePct, defied, choices, tp, onClose }) {
    const ref = urPO(null);
    uePO(() => {
      if (!ref.current) return;
      if (kind === "cut") drawCutPoster(ref.current, { film, letters, cutName, rarePct, defied, choices });
      else drawTastePoster(ref.current, tp);
    }, [kind]);

    const download = () => {
      try {
        const a = document.createElement("a");
        a.download = kind === "cut" ? `${(cutName || "your-cut").toLowerCase().replace(/\s+/g, "-")}.png` : "taste-print.png";
        a.href = ref.current.toDataURL("image/png");
        a.click();
        if (window.toast) toast({ title: "POSTER SAVED", text: "PNG downloaded — post it anywhere", kind: "good" });
      } catch (e) {}
    };

    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(4,4,6,.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
          <canvas ref={ref} style={{ height: "min(74vh, 820px)", width: "auto", borderRadius: "var(--r-2)", boxShadow: "0 30px 90px rgba(0,0,0,.7)" }}></canvas>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={download} className="t-mono" style={{ padding: "11px 20px", borderRadius: "var(--r-2)", cursor: "pointer", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, background: "var(--c-amber)", color: tkc("bg"), border: "none" }}>DOWNLOAD PNG</button>
            <button onClick={onClose} className="t-mono" style={{ padding: "11px 16px", borderRadius: "var(--r-2)", cursor: "pointer", fontSize: "var(--fs-label)", letterSpacing: ".16em", background: "transparent", color: "rgba(255,255,255,.7)", border: "1px solid rgba(255,255,255,.3)" }} aria-label="Close" title="Close">CLOSE</button>
          </div>
        </div>
      </div>
    );
  }

  Object.assign(window, { PosterOverlay });
})();
