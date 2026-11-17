// editor-panel.jsx — The Cut editor root (window.EditorPanel).
// Builds on the pieces in editor.jsx (Track, Clip, EdStill, Toggle, Walkthrough, DND)
// and is wrapped by editor-cuts.jsx with the branch-path bar.
// Bin · program viewer · inspector, one grouped toolbar, Cina auto-edit passes, render to Score.

(function () {
  const { useState: usEP, useEffect: ueEP, useMemo: umEP, useRef: urEP, useCallback: ucEP } = React;
  const FPS = 24;
  const TRACK_DEFS = [
    { id: "V2", name: "V2 · Titles", kind: "video" },
    { id: "V1", name: "V1 · Picture", kind: "video", primary: true },
    { id: "A1", name: "A1 · Dialogue", kind: "audio" },
    { id: "A2", name: "A2 · SFX", kind: "audio" },
    { id: "A3", name: "A3 · Score", kind: "audio" },
  ];
  const WALK_KEY = "cina:editor-walk-done";
  const uid = () => "c" + Math.random().toString(36).slice(2, 8);
  const tc = (t) => { const f = Math.floor((t % 1) * FPS), s = Math.floor(t) % 60, m = Math.floor(t / 60) % 60, h = Math.floor(t / 3600); return [h, m, s, f].map(x => String(x).padStart(2, "0")).join(":"); };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const endOf = (clips) => clips.reduce((m, c) => Math.max(m, c.start + c.dur), 0);
  const at = (clips, t) => clips.find(c => t >= c.start && t < c.start + c.dur);

  function initialTracks() {
    const src = window.TIMELINE_CLIPS || {};
    return TRACK_DEFS.map(d => ({ ...d, clips: clone(src[d.id] || []).sort((a, b) => a.start - b.start) }));
  }
  const savedKey = () => { let p = "main"; try { p = localStorage.getItem("cina:cut-path") || "main"; } catch (e) {} return "cina:editor-tracks:" + p; };
  function loadTracks() {
    try {
      const s = JSON.parse(localStorage.getItem(savedKey()) || "null");
      if (Array.isArray(s) && s.length === TRACK_DEFS.length) return TRACK_DEFS.map(d => ({ ...d, clips: (s.find(x => x.id === d.id) || {}).clips || [] }));
    } catch (e) {}
    return initialTracks();
  }
  function buildBin(tracks) {
    const v1 = tracks.find(t => t.id === "V1").clips;
    const seen = new Set();
    const shots = v1.filter(c => { if (seen.has(c.thumb)) return false; seen.add(c.thumb); return true; })
      .map(c => ({ id: "bin-" + c.id, kind: "shot", label: c.label, thumb: c.thumb, photo: c.photo, dur: c.dur }));
    const audio = [
      { id: "bin-a1", kind: "dialogue", label: "VOSS — wild line", color: tkc("cat-4"), dur: 2 },
      { id: "bin-a2", kind: "sfx", label: "door · latch", color: tkc("cat-1"), dur: 0.8 },
      { id: "bin-a3", kind: "score", label: "SCORE · cello swell", color: tkc("blood"), dur: 10 },
      { id: "bin-a4", kind: "ambience", label: "AMB · rain on glass", color: tkc("line-2"), dur: 20 },
    ];
    const titles = [
      { id: "bin-t1", kind: "title", label: "TITLE: card", color: tkc("amber"), dur: 4 },
      { id: "bin-t2", kind: "title", label: "LOWER THIRD", color: tkc("cat-1"), dur: 3 },
    ];
    return { shots, audio, titles };
  }

  const epCss = `
.ep{flex:1;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;background:var(--c-bg);position:relative}
.ep-bar{display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;padding:8px 14px;border-bottom:1px solid var(--c-line);background:var(--c-panel)}
.ep-grp{display:flex;align-items:center;gap:4px;padding-right:14px;border-right:1px solid var(--c-line)}
.ep-grp:last-of-type{border-right:none}
.ep-b{height:30px;min-width:30px;padding:0 10px;border-radius:var(--r-2);border:1px solid var(--c-line);background:transparent;color:var(--c-ink-2);font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.08em;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}
.ep-b:hover:not(:disabled){border-color:var(--c-ink-3);color:var(--c-ink)}
.ep-b:disabled{opacity:.35;cursor:default}
.ep-b.on{border-color:var(--c-amber);color:var(--c-amber);background:rgba(var(--accent-rgb),.1)}
.ep-mid{display:grid;grid-template-columns:minmax(180px,240px) minmax(0,1fr) minmax(220px,280px);min-height:0}
.ep-side{border-right:1px solid var(--c-line);overflow:auto;min-height:0;padding:12px}
.ep-insp{border-left:1px solid var(--c-line);overflow:auto;min-height:0;padding:14px;display:flex;flex-direction:column;gap:14px}
.ep-k{font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.16em;text-transform:uppercase;color:var(--c-ink-4)}
.ep-bin{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0 16px}
.ep-item{position:relative;aspect-ratio:16/9;border-radius:var(--r-2);overflow:hidden;border:1px solid var(--c-line);cursor:grab;background:var(--c-panel-2)}
.ep-item:hover{border-color:var(--c-amber)}
.ep-item span{position:absolute;left:5px;right:5px;bottom:4px;font-family:var(--f-mono);font-size:var(--fs-label);color:var(--c-white);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px var(--c-black);z-index:2}
.ep-row{display:flex;align-items:center;gap:8px;padding:7px 8px;border:1px solid var(--c-line);border-radius:var(--r-2);margin-bottom:6px;cursor:grab;font-size:var(--fs-body);color:var(--c-ink-2)}
.ep-row:hover{border-color:var(--c-amber)}
.ep-view{display:flex;flex-direction:column;min-height:0;padding:14px;gap:10px}
.ep-screen{position:relative;flex:1;min-height:160px;background:var(--c-black);border-radius:var(--r-2);overflow:hidden}
.ep-field{display:flex;flex-direction:column;gap:6px}
.ep-field input[type=range]{width:100%;accent-color:var(--c-amber)}
.ep-step{display:flex;align-items:center;gap:6px}
.ep-step b{min-width:46px;text-align:center;font-family:var(--f-mono);font-size:var(--fs-body);color:var(--c-ink);font-weight:500}
.ep-tl{border-top:1px solid var(--c-line);display:grid;grid-template-columns:120px minmax(0,1fr);height:clamp(240px,34vh,340px);background:var(--c-bg)}
.ep-heads{border-right:1px solid var(--c-line)}
.ep-head{display:flex;align-items:center;justify-content:space-between;padding:0 8px;border-bottom:1px solid var(--c-line);font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.06em;color:var(--c-ink-3)}
.ep-scroll{overflow:auto;position:relative;min-width:0}
.ep-ruler{position:sticky;top:0;z-index:6;height:26px;background:var(--c-panel);border-bottom:1px solid var(--c-line);cursor:ew-resize}
.ep-menu{position:absolute;top:calc(100% + 6px);right:0;width:260px;background:var(--c-panel);border:1px solid var(--c-line-2);border-radius:var(--r-2);box-shadow:0 16px 40px rgba(0,0,0,.5);z-index:50;padding:6px}
.ep-menu button{all:unset;display:flex;flex-direction:column;gap:2px;width:100%;box-sizing:border-box;padding:9px 10px;border-radius:var(--r-1);cursor:pointer}
.ep-menu button:hover{background:var(--c-panel-2)}
@media (max-width:1100px){.ep-mid{grid-template-columns:minmax(160px,200px) minmax(0,1fr)}.ep-insp{position:absolute;right:0;top:48px;bottom:0;width:280px;background:var(--c-panel);z-index:40;box-shadow:-12px 0 32px rgba(0,0,0,.4)}.ep-insp[data-empty="1"]{display:none}}
`;

  function Stepper({ value, onChange, min = 0, max = 3, step = 0.5, unit = "s" }) {
    return (
      <div className="ep-step">
        <button className="ep-b" onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))}>−</button>
        <b>{value}{unit}</b>
        <button className="ep-b" onClick={() => onChange(Math.min(max, +(value + step).toFixed(2)))}>+</button>
      </div>
    );
  }

  function EditorPanel() {
    const [tracks, setTracks] = usEP(loadTracks);
    const [saved, setSaved] = usEP(() => { try { return !!localStorage.getItem(savedKey()); } catch (e) { return false; } });
    const [hist, setHist] = usEP([]);
    const [bin, setBin] = usEP(() => buildBin(initialTracks()));
    const [sel, setSel] = usEP(null);
    const [t, setT] = usEP(0);
    const [playing, setPlaying] = usEP(false);
    const [zoom, setZoom] = usEP(14);
    const [snap, setSnap] = usEP(true);
    const [ripple, setRipple] = usEP(false);
    const [muted, setMuted] = usEP([]);
    const [marks, setMarks] = usEP([]);
    const [hover, setHover] = usEP(null);
    const [walk, setWalk] = usEP(-1);
    const [menu, setMenu] = usEP(false);
    const [render, setRender] = usEP(null);
    const scrollRef = urEP(null);
    const total = Math.max(10, ...tracks.map(tr => endOf(tr.clips)));

    const commit = ucEP((fn) => {
      setTracks(prev => { setHist(h => [...h.slice(-40), prev]); return fn(clone(prev)); });
    }, []);
    const firstSave = urEP(true);
    ueEP(() => {
      if (firstSave.current) { firstSave.current = false; return; }
      try { localStorage.setItem(savedKey(), JSON.stringify(tracks.map(tr => ({ id: tr.id, clips: tr.clips })))); setSaved(true); } catch (e) {}
      window.CinaPipeline?.emit({ step: "edit" });
    }, [tracks]);
    const revert = async () => {
      const ok = window.cinaConfirm ? await cinaConfirm({ kicker: "Cut", title: "Revert to the assembled cut?", body: "Your saved edits on this path are discarded. Undo still works afterwards.", confirmLabel: "Revert" }) : true;
      if (!ok) return;
      try { localStorage.removeItem(savedKey()); } catch (e) {}
      setTracks(prev => { setHist(h => [...h.slice(-40), prev]); return initialTracks(); });
      firstSave.current = true; setSaved(false); setSel(null);
      toast("Reverted to the assembled cut");
    };
    const undo = () => setHist(h => { if (!h.length) return h; setTracks(h[h.length - 1]); toast("Undone"); return h.slice(0, -1); });
    const findClip = (trs, id) => { for (const tr of trs) { const c = tr.clips.find(x => x.id === id); if (c) return { tr, c }; } return null; };
    const selInfo = sel ? findClip(tracks, sel) : null;

    const snapTime = (tr, time, ignoreId) => {
      if (!snap) return Math.max(0, time);
      const edges = [0, t, ...tr.clips.filter(c => c.id !== ignoreId).flatMap(c => [c.start, c.start + c.dur])];
      let best = time, d = 0.5;
      edges.forEach(e => { if (Math.abs(e - time) < d) { d = Math.abs(e - time); best = e; } });
      return Math.max(0, +best.toFixed(2));
    };

    // Playback
    ueEP(() => {
      if (!playing) return;
      let raf, last = performance.now();
      const tick = (now) => {
        const dt = (now - last) / 1000; last = now;
        setT(prev => { const n = prev + dt; if (n >= total) { setPlaying(false); return total; } return n; });
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [playing, total]);

    // Shots, audio cues & title cards sent from Generate / Score / Titles
    ueEP(() => {
      const add = (d) => {
        if (!d) return;
        const kind = d.kind || (d.shot ? "shot" : d.audioUrl ? "audio" : "shot");
        if (kind === "audio") {
          const item = { id: d.id || ("bin-aud-" + uid()), kind: "score", label: d.label || "Lyria Score Cue", color: d.color || tkc("blood"), dur: Math.max(2, parseFloat(d.dur || d.duration) || 12), audioUrl: d.audioUrl };
          setBin(b => b.audio.some(s => s.id === item.id) ? b : { ...b, audio: [item, ...b.audio] });
          commit(trs => {
            const a3 = trs.find(x => x.id === "A3");
            if (a3 && !a3.clips.some(c => c.id === item.id + "-tl")) {
              a3.clips.push({ id: item.id + "-tl", start: 0, dur: item.dur, label: item.label, kind: "score", color: item.color, audioUrl: item.audioUrl });
            }
            return trs;
          });
          toast(`${item.label} placed on A3`);
          return;
        }
        if (kind === "title") {
          const item = { id: d.id || ("bin-ttl-" + uid()), kind: "title", label: d.label || "TITLE: LAST LIGHT", color: d.color || tkc("amber"), dur: Math.max(1, parseFloat(d.dur || d.duration) || 4) };
          setBin(b => b.titles.some(s => s.id === item.id) ? b : { ...b, titles: [item, ...b.titles] });
          commit(trs => {
            const v2 = trs.find(x => x.id === "V2");
            if (v2 && !v2.clips.some(c => c.id === item.id + "-tl")) {
              v2.clips.push({ id: item.id + "-tl", start: endOf(v2.clips), dur: item.dur, label: item.label, kind: "title", color: item.color });
            }
            return trs;
          });
          toast(`${item.label} placed on V2`);
          return;
        }
        if (!d.shot && !d.label) return;
        const shotName = d.shot || d.label;
        const item = { id: d.id || ("bin-gen-" + (d.seed || uid())), kind: "shot", label: `${shotName} · ${d.engine || "take"}`, thumb: String(shotName), photo: d.photo, videoUrl: d.videoUrl, dur: Math.max(2, parseFloat(d.dur || d.duration) || 4) };
        setBin(b => b.shots.some(s => s.id === item.id) ? b : { ...b, shots: [item, ...b.shots] });
        commit(trs => {
          const v1 = trs.find(x => x.id === "V1");
          if (v1 && !v1.clips.some(c => c.id === item.id + "-tl")) {
            v1.clips.push({ id: item.id + "-tl", start: endOf(v1.clips), dur: item.dur, label: item.label, kind: "shot", color: tkc("line-2"), thumb: item.thumb, photo: item.photo, videoUrl: item.videoUrl });
          }
          return trs;
        });
        toast(`${shotName} added to V1`);
      };
      if (window.CinaPipeline && typeof window.CinaPipeline.consumeEditorQueue === "function") {
        window.CinaPipeline.consumeEditorQueue().forEach(add);
      } else {
        try { const d = JSON.parse(localStorage.getItem("cina:editor-drop") || "null"); if (d && Date.now() - (d.at || 0) < 10 * 60 * 1000) { add(d); localStorage.removeItem("cina:editor-drop"); } } catch (e) {}
      }
      const h = (e) => { add(e.detail); try { localStorage.removeItem("cina:editor-drop"); localStorage.removeItem("cina:editor-drop-queue"); } catch (x) {} };
      window.addEventListener("cina:editor-drop", h);
      return () => window.removeEventListener("cina:editor-drop", h);
    }, []);

    // Edit ops
    const dropBin = (trackId, item, time) => commit(trs => {
      const tr = trs.find(x => x.id === trackId);
      const start = snapTime(tr, time);
      if (ripple && tr.primary) tr.clips.forEach(c => { if (c.start >= start) c.start += item.dur; });
      const clip = { id: uid(), start, dur: item.dur, label: item.label, kind: item.kind, color: item.color || tkc("line-2"), thumb: item.thumb, photo: item.photo };
      tr.clips.push(clip); tr.clips.sort((a, b) => a.start - b.start);
      setSel(clip.id);
      return trs;
    });
    const moveClip = (trackId, id, time) => commit(trs => {
      const f = findClip(trs, id); if (!f) return trs;
      const dest = trs.find(x => x.id === trackId);
      if (dest.kind !== f.tr.kind) return trs;
      f.tr.clips = f.tr.clips.filter(c => c.id !== id);
      f.c.start = snapTime(dest, time, id);
      dest.clips.push(f.c); dest.clips.sort((a, b) => a.start - b.start);
      return trs;
    });
    const appendShot = (item) => dropBin("V1", item, endOf(tracks.find(x => x.id === "V1").clips));
    const updateSel = (patch) => sel && commit(trs => { const f = findClip(trs, sel); if (f) Object.assign(f.c, patch); return trs; });
    const target = () => selInfo ? selInfo.c : at(tracks.find(x => x.id === "V1").clips, t);
    const split = () => {
      const c = target(); if (!c || t <= c.start + 0.1 || t >= c.start + c.dur - 0.1) { toast("Park the playhead inside a clip to split"); return; }
      commit(trs => { const f = findClip(trs, c.id); const right = { ...f.c, id: uid(), start: t, dur: +(f.c.start + f.c.dur - t).toFixed(2), fadeIn: 0 }; f.c.dur = +(t - f.c.start).toFixed(2); f.c.fadeOut = 0; f.tr.clips.push(right); f.tr.clips.sort((a, b) => a.start - b.start); return trs; });
    };
    const dup = () => { const c = target(); if (!c) return; commit(trs => { const f = findClip(trs, c.id); const n = { ...f.c, id: uid(), start: endOf(f.tr.clips) }; f.tr.clips.push(n); setSel(n.id); return trs; }); };
    const del = () => {
      if (!sel) return;
      commit(trs => { const f = findClip(trs, sel); if (!f) return trs; f.tr.clips = f.tr.clips.filter(c => c.id !== sel); if (ripple) f.tr.clips.forEach(c => { if (c.start > f.c.start) c.start = +(c.start - f.c.dur).toFixed(2); }); return trs; });
      setSel(null);
    };
    const mark = () => { setMarks(m => [...m, +t.toFixed(2)].sort((a, b) => a - b)); toast(`Marker at ${tc(t)}`); };
    const fit = () => { const w = scrollRef.current ? scrollRef.current.clientWidth - 24 : 900; setZoom(Math.max(4, Math.min(60, w / total))); };
    const jump = (dir) => { const cuts = [...new Set(tracks.find(x => x.id === "V1").clips.flatMap(c => [c.start, c.start + c.dur]))].sort((a, b) => a - b); const n = dir > 0 ? cuts.find(c => c > t + 0.01) : [...cuts].reverse().find(c => c < t - 0.01); setT(n != null ? n : dir > 0 ? total : 0); };

    // Cina passes
    const cina = {
      assemble: () => { commit(trs => { const v1 = trs.find(x => x.id === "V1"); let s = 0; v1.clips = bin.shots.map(b => { const c = { id: uid(), start: s, dur: b.dur, label: b.label, kind: "shot", color: tkc("line-2"), thumb: b.thumb, photo: b.photo }; s += b.dur; return c; }); return trs; }); toast(`Assembled ${bin.shots.length} shots on V1`); },
      xfade: () => { commit(trs => { trs.find(x => x.id === "V1").clips.forEach((c, i) => { if (i > 0) { c.transition = "xfade"; c.fadeIn = 0.5; } }); return trs; }); toast("Crossfaded every cut"); },
      fadeProgram: () => { commit(trs => { const v = trs.find(x => x.id === "V1").clips; if (v.length) { v[0].fadeIn = 1.5; v[v.length - 1].fadeOut = 2; } return trs; }); toast("Faded the program in and out"); },
      duck: () => { commit(trs => { const dia = trs.find(x => x.id === "A1").clips; trs.find(x => x.id === "A3").clips.forEach(c => { const hit = dia.some(d => d.start < c.start + c.dur && d.start + d.dur > c.start); if (hit) c.volume = 45; }); return trs; }); toast("Music ducked under dialogue"); },
      normalize: () => { commit(trs => { const lv = { A1: 100, A2: 75, A3: 60 }; trs.forEach(tr => { if (lv[tr.id]) tr.clips.forEach(c => { c.volume = lv[tr.id]; }); }); return trs; }); toast("Levels normalized · dialogue 100 · sfx 75 · score 60"); },
    };
    const CINA_ACTIONS = [["assemble", "Assemble the bin", "Lay every shot on V1 in bin order"], ["xfade", "Crossfade every cut", "0.5s dissolve between shots"], ["fadeProgram", "Fade the program", "Fade up from black, out to black"], ["duck", "Duck music under dialogue", "Score drops while anyone speaks"], ["normalize", "Normalize levels", "Dialogue, effects and score to house levels"]];

    const doRender = () => {
      if (render != null) return;
      setRender(0);
      let p = 0;
      const iv = setInterval(() => {
        p += 7 + Math.random() * 9;
        if (p >= 100) { clearInterval(iv); setRender(null); toast(`Cut rendered · ${tc(total)} · sent to Score`); window.dispatchEvent(new CustomEvent("cina:setView", { detail: "score" })); }
        else setRender(Math.round(p));
      }, 180);
    };

    // Keyboard
    ueEP(() => {
      const h = (e) => {
        if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable) return;
        const k = e.key.toLowerCase();
        if ((e.metaKey || e.ctrlKey) && k === "z") { e.preventDefault(); undo(); return; }
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (k === " ") { e.preventDefault(); setPlaying(p => !p); }
        else if (k === "s") split();
        else if (k === "d") dup();
        else if (k === "m") mark();
        else if (k === "delete" || k === "backspace") { if (sel) { e.preventDefault(); del(); } }
        else if (k === "escape") { setSel(null); setMenu(false); }
        else if (k === "=" || k === "+") setZoom(z => Math.min(80, z * 1.25));
        else if (k === "-") setZoom(z => Math.max(3, z / 1.25));
        else if (k === "arrowleft") jump(-1);
        else if (k === "arrowright") jump(1);
      };
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    });

    // Program frame
    const v1 = tracks.find(x => x.id === "V1"), v2 = tracks.find(x => x.id === "V2");
    const cur = at(v1.clips, t), title = at(v2.clips, t);
    const alpha = cur ? Math.min(1, cur.fadeIn ? (t - cur.start) / cur.fadeIn : 1, cur.fadeOut ? (cur.start + cur.dur - t) / cur.fadeOut : 1) * ((cur.opacity != null ? cur.opacity : 100) / 100) : 0;

    const scrub = (e) => {
      const el = e.currentTarget, r = el.getBoundingClientRect();
      const set = (x) => setT(Math.max(0, Math.min(total, (x - r.left + el.parentElement.scrollLeft - el.parentElement.scrollLeft) / zoom)));
      set(e.clientX);
      const mv = (ev) => set(ev.clientX), up = () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
      window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
    };
    const step = total > 120 ? 10 : total > 40 ? 5 : 1;
    const width = Math.max(total + 8, 30) * zoom;
    const binDrag = (item) => (e) => { DND.current = { kind: "bin", payload: item }; e.dataTransfer.effectAllowed = "copy"; e.dataTransfer.setData("text/plain", item.label); };
    const finishWalk = () => { setWalk(-1); try { localStorage.setItem(WALK_KEY, "1"); } catch (e) {} };

    return (
      <div className="ep" data-screen-label="Studio · Cut">
        <style>{epCss}</style>
        <div className="ep-bar" data-walk="toolbar">
          <div className="ep-grp">
            <button className="ep-b" title="Start (Home)" onClick={() => setT(0)}>|◀</button>
            <button className="ep-b" title="Previous cut (←)" onClick={() => jump(-1)}>◀◀</button>
            <button className={"ep-b" + (playing ? " on" : "")} title="Play / pause (Space)" onClick={() => setPlaying(p => !p)} style={{ minWidth: 64 }}>{playing ? "❚❚ PAUSE" : "▶ PLAY"}</button>
            <button className="ep-b" title="Next cut (→)" onClick={() => jump(1)}>▶▶</button>
            <span className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", marginLeft: 6, minWidth: 92 }}>{tc(t)}</span>
          </div>
          <div className="ep-grp">
            <button className="ep-b" title="Split at playhead (S)" onClick={split}>SPLIT</button>
            <button className="ep-b" title="Duplicate (D)" onClick={dup}>DUP</button>
            <button className="ep-b" title="Add marker (M)" onClick={mark}>MARK</button>
            <button className="ep-b" title="Delete (⌫)" onClick={del} disabled={!sel}>DEL</button>
            <button className="ep-b" title="Undo (⌘Z)" onClick={undo} disabled={!hist.length}>UNDO</button>
            <button className="ep-b" title="Discard saved edits on this path" onClick={revert} disabled={!saved}>REVERT</button>
          </div>
          <div className="ep-grp">
            <button className="ep-b" title="Fade in selected" disabled={!sel} onClick={() => updateSel({ fadeIn: selInfo?.c.fadeIn ? 0 : 1 })}>FADE IN</button>
            <button className="ep-b" title="Fade out selected" disabled={!sel} onClick={() => updateSel({ fadeOut: selInfo?.c.fadeOut ? 0 : 1 })}>FADE OUT</button>
            <button className={"ep-b" + (selInfo?.c.transition === "xfade" ? " on" : "")} title="Crossfade into selected" disabled={!sel} onClick={() => updateSel(selInfo?.c.transition === "xfade" ? { transition: null, fadeIn: 0 } : { transition: "xfade", fadeIn: 0.5 })}>XFADE</button>
          </div>
          <div className="ep-grp">
            <button className={"ep-b" + (snap ? " on" : "")} onClick={() => setSnap(s => !s)} title="Snap to edges and playhead">SNAP</button>
            <button className={"ep-b" + (ripple ? " on" : "")} onClick={() => setRipple(r => !r)} title="Ripple inserts and deletes on V1">RIPPLE</button>
          </div>
          <div className="ep-grp">
            <button style={zoomBtn} title="Zoom out (−)" onClick={() => setZoom(z => Math.max(3, z / 1.25))}>−</button>
            <button style={zoomBtn} title="Zoom in (+)" onClick={() => setZoom(z => Math.min(80, z * 1.25))}>+</button>
            <button className="ep-b" title="Fit the whole cut" onClick={fit}>FIT</button>
          </div>
          <span style={{ flex: 1 }}></span>
          <button className="ep-b" title="Show the tour" onClick={() => setWalk(0)}>?</button>
          <div style={{ position: "relative" }}>
            <button className={"ep-b" + (menu ? " on" : "")} data-walk="cina-btn" onClick={() => setMenu(m => !m)}>✦ CINA</button>
            {menu && (
              <div className="ep-menu">
                {CINA_ACTIONS.map(([k, l, s]) => (
                  <button key={k} onClick={() => { cina[k](); setMenu(false); }}>
                    <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{l}</span>
                    <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-primary" data-walk="render" onClick={doRender} disabled={render != null} style={{ height: 30, fontSize: "var(--fs-label)" }}>{render != null ? `Rendering ${render}%` : "Render → Score"}</button>
        </div>

        <div className="ep-mid">
          <aside className="ep-side" data-walk="bin">
            <div className="ep-k">Shots · {bin.shots.length}</div>
            <div className="ep-bin">
              {bin.shots.map(b => (
                <div key={b.id} className="ep-item" draggable onDragStart={binDrag(b)} onDragEnd={() => { DND.current = null; }} onDoubleClick={() => appendShot(b)} title="Drag to the timeline · double-click to append">
                  <EdStill thumb={b.thumb} photo={b.photo}/><span>{b.label}</span>
                </div>
              ))}
            </div>
            <div className="ep-k" style={{ marginBottom: 8 }}>Audio</div>
            {bin.audio.map(b => (
              <div key={b.id} className="ep-row" draggable onDragStart={binDrag(b)} onDragEnd={() => { DND.current = null; }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: b.color, flexShrink: 0 }}></span>
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.label}</span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{b.dur}s</span>
              </div>
            ))}
            <div className="ep-k" style={{ margin: "14px 0 8px" }}>Titles</div>
            {bin.titles.map(b => (
              <div key={b.id} className="ep-row" draggable onDragStart={binDrag(b)} onDragEnd={() => { DND.current = null; }}>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)" }}>T</span><span style={{ flex: 1 }}>{b.label}</span>
              </div>
            ))}
          </aside>

          <section className="ep-view">
            <div className="ep-screen">
              {cur && cur.videoUrl ? (
                <video src={cur.videoUrl} autoPlay={playing} muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: alpha, display: "block" }}/>
              ) : cur && (
                <div style={{ position: "absolute", inset: 0, opacity: alpha }}><EdStill thumb={cur.thumb} photo={cur.photo} dim={false}/></div>
              )}
              {title && <div style={{ position: "absolute", left: 0, right: 0, bottom: "12%", textAlign: "center", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "clamp(20px, 3vw, 40px)", color: tkc("white"), textShadow: "0 2px 18px rgba(0,0,0,.8)" }}>{title.label.replace(/^TITLE:\s*/, "")}</div>}
              {!cur && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span className="ep-k">{v1.clips.length ? "Black" : "Drop a shot on V1 to start the cut"}</span></div>}
              <span className="t-mono" style={{ position: "absolute", left: 10, top: 8, fontSize: "var(--fs-label)", color: "rgba(255,255,255,.7)", letterSpacing: ".1em" }}>{cur ? cur.label : "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="ep-k">Program · {tc(t)} / {tc(total)}</span>
              <span className="ep-k">{v1.clips.length} shots · {marks.length} markers{saved ? " · edits saved" : ""}</span>
            </div>
          </section>

          <aside className="ep-insp" data-walk="inspector" data-empty={selInfo ? "0" : "1"}>
            {selInfo ? (() => {
              const { c, tr } = selInfo;
              return <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <span className="ep-k">{tr.name}</span>
                  <button className="ep-b" onClick={() => setSel(null)} title="Close (Esc)">✕</button>
                </div>
                <div className="t-display" style={{ fontSize: "var(--fs-lead)", fontStyle: "italic", lineHeight: 1.2 }}>{c.label}</div>
                <div className="ep-k" style={{ color: "var(--c-ink-3)" }}>In {tc(c.start)} · {c.dur.toFixed(1)}s</div>
                <div className="ep-field"><span className="ep-k">Fade in</span><Stepper value={c.fadeIn || 0} onChange={v => updateSel({ fadeIn: v })}/></div>
                <div className="ep-field"><span className="ep-k">Fade out</span><Stepper value={c.fadeOut || 0} onChange={v => updateSel({ fadeOut: v })}/></div>
                {tr.kind === "video" && <div className="ep-field"><span className="ep-k">Transition in</span>
                  <div style={{ display: "flex", gap: 4 }}>{[[null, "CUT"], ["xfade", "XFADE"], ["dip", "DIP"]].map(([v, l]) => <button key={l} className={"ep-b" + ((c.transition || null) === v ? " on" : "")} onClick={() => updateSel({ transition: v, fadeIn: v ? Math.max(c.fadeIn || 0, 0.5) : c.fadeIn })}>{l}</button>)}</div></div>}
                {tr.kind === "audio"
                  ? <div className="ep-field"><span className="ep-k">Volume · {c.volume != null ? c.volume : 80}%</span><input type="range" min="0" max="120" value={c.volume != null ? c.volume : 80} onChange={e => updateSel({ volume: +e.target.value })}/></div>
                  : <div className="ep-field"><span className="ep-k">Opacity · {c.opacity != null ? c.opacity : 100}%</span><input type="range" min="0" max="100" value={c.opacity != null ? c.opacity : 100} onChange={e => updateSel({ opacity: +e.target.value })}/></div>}
                <div className="ep-field"><span className="ep-k">Speed · {c.speed || 1}×</span>
                  <div style={{ display: "flex", gap: 4 }}>{[0.5, 1, 1.5, 2].map(s => <button key={s} className={"ep-b" + ((c.speed || 1) === s ? " on" : "")} onClick={() => { const base = c.dur * (c.speed || 1); updateSel({ speed: s, dur: +(base / s).toFixed(2) }); }}>{s}×</button>)}</div></div>
                <div className="ep-field"><span className="ep-k">Duration</span><Stepper value={+c.dur.toFixed(1)} min={0.5} max={60} step={0.5} onChange={v => updateSel({ dur: v })}/></div>
                <button className="ep-b" onClick={del} style={{ marginTop: "auto", color: "var(--c-bad)", borderColor: "var(--c-line-2)" }}>DELETE CLIP</button>
              </>;
            })() : <>
              <span className="ep-k">The cut</span>
              <div className="t-display" style={{ fontSize: "var(--fs-head)", lineHeight: 1 }}>{tc(total)}</div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5 }}>Select a clip to tune its fades, transition, level and speed.</div>
              {marks.length > 0 && <div className="ep-field"><span className="ep-k">Markers</span>{marks.map((m, i) => <button key={i} className="ep-b" style={{ justifyContent: "space-between" }} onClick={() => setT(m)}>M{i + 1}<span>{tc(m)}</span></button>)}</div>}
            </>}
          </aside>
        </div>

        <div className="ep-tl" data-walk="timeline">
          <div className="ep-heads">
            <div style={{ height: 26, borderBottom: "1px solid var(--c-line)" }}></div>
            {tracks.map(tr => (
              <div key={tr.id} className="ep-head" style={{ height: tr.primary ? 72 : 46 }}>
                <span>{tr.name}</span>
                <button className={"ep-b" + (muted.includes(tr.id) ? " on" : "")} style={{ height: 22, minWidth: 22, padding: 0 }} title={muted.includes(tr.id) ? "Unmute" : "Mute"} onClick={() => setMuted(m => m.includes(tr.id) ? m.filter(x => x !== tr.id) : [...m, tr.id])}>M</button>
              </div>
            ))}
          </div>
          <div className="ep-scroll" ref={scrollRef}>
            <div style={{ width, position: "relative" }}>
              <div className="ep-ruler" onPointerDown={scrub}>
                {Array.from({ length: Math.ceil((total + 8) / step) + 1 }).map((_, i) => (
                  <span key={i} style={{ position: "absolute", left: i * step * zoom, top: 0, bottom: 0, borderLeft: "1px solid var(--c-line-2)", paddingLeft: 3, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", lineHeight: "26px" }}>{i * step}s</span>
                ))}
                {marks.map((m, i) => <span key={"m" + i} title={tc(m)} style={{ position: "absolute", left: m * zoom - 4, bottom: 2, width: 8, height: 8, background: "var(--c-amber)", transform: "rotate(45deg)" }}></span>)}
              </div>
              {tracks.map(tr => (
                <Track key={tr.id} track={tr} zoom={zoom} muted={muted.includes(tr.id)} selected={sel} hover={hover === tr.id}
                  onSelectClip={(id) => { setSel(id); const f = findClip(tracks, id); if (f && !playing) setT(Math.max(t, 0)); }}
                  onHover={(on) => setHover(on ? tr.id : (h => h === tr.id ? null : h))}
                  onDropBin={(item, time) => dropBin(tr.id, item, time)}
                  onMoveClip={(id, time) => moveClip(tr.id, id, time)}/>
              ))}
              <div style={{ position: "absolute", top: 0, bottom: 0, left: t * zoom, width: 1, background: "var(--c-amber)", zIndex: 8, pointerEvents: "none", boxShadow: "0 0 6px rgba(var(--accent-rgb),.6)" }}></div>
            </div>
          </div>
        </div>

        {walk >= 0 && <Walkthrough step={walk} setStep={(s) => s < 0 || s >= WALK_STEPS.length ? finishWalk() : setWalk(s)} onFinish={finishWalk}/>}
      </div>
    );
  }

  window.EditorPanel = EditorPanel;
})();
