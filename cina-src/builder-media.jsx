// builder-media.jsx — Media Library for the site builder.
//
// A modal gallery the user uploads images & videos into and chooses from,
// plus a non-destructive image editor (filters, rotate, flip, crop presets).
// Uploaded media persists in IndexedDB (images are downscaled on import);
// legacy localStorage libraries migrate over on first open.
//
// Imperative API (set up by <MediaLibraryHost/>, mounted once in the builder):
//   window.openMediaLibrary({ type: "image" | "video" | "all", onPick })
//   onPick receives a src string (data URL or asset path).
//
// Loads after React, before the builder-*.jsx files.

const { useState: usML, useEffect: ueML, useRef: urML, useMemo: umML } = React;

const ML_LS = "cina:media-library";       // universal — shared by builder + notebook
const ML_LEGACY = ["cina:builder-media-v1", "cina:studio-media"];
const ML_STOCK = [
  { id: "stock-1", kind: "image", name: "Boy in the trees", src: "assets/film-1.jpg" },
  { id: "stock-2", kind: "image", name: "Figure under lights", src: "assets/film-2.jpg" },
  { id: "stock-3", kind: "image", name: "Earth from orbit", src: "assets/film-3.jpg" },
  { id: "stock-4", kind: "image", name: "Lone figure · dunes", src: "assets/film-4.jpg" },
];

function mlLegacyList() {
  const merged = []; const seen = new Set();
  [ML_LS, ...ML_LEGACY].forEach(k => { try { (JSON.parse(localStorage.getItem(k) || "[]") || []).forEach(it => { const key = it.src || it.id; if (it && !seen.has(key)) { seen.add(key); merged.push(it); } }); } catch {} });
  return merged;
}

// ─ IndexedDB store ─ media lives here (not in localStorage) so a few phone
// photos can't blow the ~5MB origin quota that page drafts share.
const ML_DB = "cina-media-db";
function mlIdb() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(ML_DB, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore("media", { keyPath: "id" }); };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}
async function mlPutMany(items) {
  const db = await mlIdb();
  return new Promise((res, rej) => {
    const tx = db.transaction("media", "readwrite");
    const st = tx.objectStore("media");
    items.forEach(it => st.put(it));
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function mlDeleteIdb(id) {
  const db = await mlIdb();
  return new Promise((res, rej) => {
    const tx = db.transaction("media", "readwrite");
    tx.objectStore("media").delete(id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function mlLoadAsync() {
  const legacy = mlLegacyList();
  try {
    const db = await mlIdb();
    const all = await new Promise((res, rej) => {
      const rq = db.transaction("media", "readonly").objectStore("media").getAll();
      rq.onsuccess = () => res(rq.result || []);
      rq.onerror = () => rej(rq.error);
    });
    if (legacy.length) {
      const fresh = legacy.filter(l => !all.some(a => a.id === l.id));
      if (fresh.length) await mlPutMany(fresh);
      try { [ML_LS, ...ML_LEGACY].forEach(k => localStorage.removeItem(k)); } catch {}
      return [...fresh, ...all].sort((a, b) => (b.at || 0) - (a.at || 0));
    }
    return all.sort((a, b) => (b.at || 0) - (a.at || 0));
  } catch { return legacy; }
}

// Downscale images on import (≤1600px, JPEG .85 — PNGs keep alpha) so one
// phone photo doesn't weigh 5MB.
function mlDownscale(file) {
  return new Promise((resolve) => {
    const fallback = () => { const r = new FileReader(); r.onload = () => resolve(r.result); r.readAsDataURL(file); };
    if (!file.type.startsWith("image") || file.type === "image/gif" || file.type === "image/svg+xml") return fallback();
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const MAX = 1600;
      const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      try { resolve(canvas.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.85)); }
      catch { fallback(); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); fallback(); };
    img.src = url;
  });
}
function mlId() { return "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

// ── Imperative host ────────────────────────────────────────────────────────
let _mlOpen = null;
function openMediaLibrary(opts) { if (_mlOpen) _mlOpen(opts || {}); }

// Filter presets for the editor.
const ML_PRESETS = {
  none:  { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0, blur: 0, hue: 0 },
  noir:  { brightness: 105, contrast: 130, saturate: 0,   grayscale: 100, sepia: 0, blur: 0, hue: 0 },
  warm:  { brightness: 104, contrast: 106, saturate: 120, grayscale: 0, sepia: 28, blur: 0, hue: -8 },
  cold:  { brightness: 98,  contrast: 110, saturate: 90,  grayscale: 0, sepia: 0, blur: 0, hue: 14 },
  faded: { brightness: 110, contrast: 86,  saturate: 78,  grayscale: 0, sepia: 12, blur: 0, hue: 0 },
};
function mlFilterStr(f) {
  return `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%) grayscale(${f.grayscale}%) sepia(${f.sepia}%) blur(${f.blur}px) hue-rotate(${f.hue}deg)`;
}

// Bake filter/rotate/flip/crop into a new data URL.
function mlBake(src, { filter, rotate = 0, flipH = false, aspect = "free" }) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let sw = img.naturalWidth, sh = img.naturalHeight;
      let sx = 0, sy = 0, cw = sw, ch = sh;
      // Center-crop to target aspect.
      if (aspect !== "free") {
        const [aw, ah] = aspect.split(":").map(Number);
        const target = aw / ah;
        if (sw / sh > target) { cw = sh * target; sx = (sw - cw) / 2; }
        else { ch = sw / target; sy = (sh - ch) / 2; }
      }
      const rot = ((rotate % 360) + 360) % 360;
      const swap = rot === 90 || rot === 270;
      const canvas = document.createElement("canvas");
      canvas.width = swap ? ch : cw;
      canvas.height = swap ? cw : ch;
      const ctx = canvas.getContext("2d");
      try { ctx.filter = mlFilterStr(filter); } catch {}
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rot * Math.PI / 180);
      ctx.scale(flipH ? -1 : 1, 1);
      ctx.drawImage(img, sx, sy, cw, ch, -cw / 2, -ch / 2, cw, ch);
      try { resolve(canvas.toDataURL("image/jpeg", 0.92)); }
      catch (e) { reject(e); }
    };
    img.onerror = reject;
    img.src = src;
  });
}

// ── Image editor ─────────────────────────────────────────────────────────
function MediaEditor({ item, onCancel, onSave }) {
  const [filter, setFilter] = usML({ ...ML_PRESETS.none });
  const [rotate, setRotate] = usML(0);
  const [flipH, setFlipH] = usML(false);
  const [aspect, setAspect] = usML("free");
  const [busy, setBusy] = usML(false);
  const set = (k, v) => setFilter(f => ({ ...f, [k]: v }));

  const apply = async () => {
    setBusy(true);
    try {
      const out = await mlBake(item.src, { filter, rotate, flipH, aspect });
      onSave(out);
    } catch (e) {
      if (window.toast) window.toast({ title: "EDIT FAILED", text: "Couldn't process that image.", kind: "bad" });
      setBusy(false);
    }
  };

  const sliders = [
    ["brightness", "Brightness", 0, 200], ["contrast", "Contrast", 0, 200],
    ["saturate", "Saturation", 0, 200], ["sepia", "Sepia", 0, 100],
    ["grayscale", "Grayscale", 0, 100], ["blur", "Blur", 0, 12],
    ["hue", "Hue", -180, 180],
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 300px", gap: 0, height: "100%", minHeight: 0 }}>
      {/* Live preview */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: tkc("void"), overflow: "hidden", padding: 24 }}>
        <img src={item.src} alt="" style={{
          maxWidth: "100%", maxHeight: "100%", objectFit: "contain",
          filter: mlFilterStr(filter),
          transform: `rotate(${rotate}deg) scaleX(${flipH ? -1 : 1})`,
          transition: "filter .1s linear",
          aspectRatio: aspect === "free" ? "auto" : aspect.replace(":", "/"),
        }}/>
      </div>
      {/* Controls */}
      <div style={{ borderLeft: "1px solid var(--c-line)", padding: 18, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, background: "var(--c-panel)" }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>EDIT IMAGE</div>

        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 6 }}>PRESET</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {Object.keys(ML_PRESETS).map(p => (
              <button key={p} onClick={() => setFilter({ ...ML_PRESETS[p] })} style={{
                padding: "5px 10px", borderRadius: 999, cursor: "pointer",
                background: "transparent", border: "1px solid var(--c-line-2)",
                color: "var(--c-ink-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase",
              }}>{p}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setRotate(r => r - 90)} style={mlToolBtn}>⤺ Rotate</button>
          <button onClick={() => setRotate(r => r + 90)} style={mlToolBtn}>Rotate ⤼</button>
          <button onClick={() => setFlipH(v => !v)} style={{ ...mlToolBtn, color: flipH ? "var(--c-amber)" : "var(--c-ink-2)" }}>⇋ Flip</button>
        </div>

        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 6 }}>CROP</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {["free", "16:9", "1:1", "4:3", "3:4", "21:9"].map(a => (
              <button key={a} onClick={() => setAspect(a)} style={{
                padding: "5px 10px", borderRadius: "var(--r-2)", cursor: "pointer",
                background: aspect === a ? "rgba(var(--accent-rgb),.12)" : "transparent",
                border: `1px solid ${aspect === a ? "var(--c-amber)" : "var(--c-line-2)"}`,
                color: aspect === a ? "var(--c-amber)" : "var(--c-ink-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
              }}>{a}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sliders.map(([k, label, min, max]) => (
            <label key={k} style={{ display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 3 }}>
                <span>{label.toUpperCase()}</span><span>{filter[k]}</span>
              </div>
              <input type="range" min={min} max={max} value={filter[k]} onChange={e => set(k, +e.target.value)} style={{ width: "100%", accentColor: tkc("amber") }}/>
            </label>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 10, borderTop: "1px solid var(--c-line)" }}>
          <button onClick={onCancel} style={{ ...mlToolBtn, flex: 1 }}>Cancel</button>
          <button onClick={apply} disabled={busy} style={{ ...mlToolBtn, flex: 1, background: "var(--c-amber)", color: "var(--c-on-amber)", border: "none", fontWeight: 700 }}>{busy ? "Saving…" : "Apply & use"}</button>
        </div>
      </div>
    </div>
  );
}
const mlToolBtn = {
  padding: "8px 12px", background: "transparent", border: "1px solid var(--c-line-2)",
  borderRadius: "var(--r-2)", color: "var(--c-ink-2)", cursor: "pointer",
  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
};

// ── The library modal ──────────────────────────────────────────────────────
function MediaLibrary({ type = "all", onPick, onClose }) {
  const [media, setMedia] = usML(mlLegacyList);
  const [tab, setTab] = usML("yours"); // yours | stock
  const [selected, setSelected] = usML(null);
  const [editing, setEditing] = usML(null);
  const fileRef = urML(null);

  ueML(() => { let on = true; mlLoadAsync().then(l => { if (on) setMedia(l); }); return () => { on = false; }; }, []);

  // Rough localStorage usage — the budget the page drafts share.
  const lsMB = umML(() => {
    try { let n = 0; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i) || ""; n += k.length + (localStorage.getItem(k) || "").length; } return (n * 2) / 1048576; }
    catch { return 0; }
  }, [media, editing]);

  const accept = type === "image" ? "image/*" : type === "video" ? "video/*" : "image/*,video/*";
  const wantKind = (k) => type === "all" || type === k;

  const saveFail = () => { if (window.toast) window.toast({ title: "COULDN'T SAVE", text: "Your browser refused to store that media — it's usable this session but won't survive a refresh.", kind: "bad" }); };

  const onFiles = async (e) => {
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    e.target.value = "";
    const added = [];
    for (const f of files) {
      const kind = f.type.startsWith("video") ? "video" : "image";
      if (kind === "video" && f.size > 12 * 1024 * 1024) {
        if (window.toast) window.toast({ title: "VIDEO TOO LARGE", text: `"${f.name}" is over 12MB — trim or compress it first.`, kind: "bad" });
        continue;
      }
      const src = kind === "image"
        ? await mlDownscale(f)
        : await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); });
      added.push({ id: mlId(), kind, name: f.name.replace(/\.[^.]+$/, ""), src, at: Date.now() });
    }
    if (!added.length) return;
    setMedia(m => [...added, ...m]);
    try {
      await mlPutMany(added);
      if (window.toast) window.toast({ title: "UPLOADED", text: `${added.length} item${added.length > 1 ? "s" : ""} added to your library`, kind: "good" });
    } catch { saveFail(); }
  };

  const remove = (id) => {
    setMedia(m => m.filter(x => x.id !== id));
    mlDeleteIdb(id).catch(() => {});
    if (selected && selected.id === id) setSelected(null);
  };

  const yours = media.filter(m => wantKind(m.kind));
  const stock = ML_STOCK.filter(m => wantKind(m.kind));
  const shown = tab === "yours" ? yours : stock;

  const use = (item) => { onPick && onPick(item.src); onClose(); };

  const Tile = ({ item }) => (
    <div onClick={() => setSelected(item)} style={{
      position: "relative", aspectRatio: "1/1", borderRadius: "var(--r-2)", overflow: "hidden", cursor: "pointer",
      border: `1.5px solid ${selected && selected.id === item.id ? "var(--c-amber)" : "var(--c-line)"}`,
      background: tkc("bg"),
    }}>
      {item.kind === "video"
        ? <video src={item.src} muted style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
        : <img src={item.src} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>}
      {item.kind === "video" && <span style={{ position: "absolute", top: 8, left: 8, fontSize: "var(--fs-label)", color: tkc("white"), background: "rgba(0,0,0,.6)", borderRadius: "var(--r-1)", padding: "2px 6px", fontFamily: "var(--f-mono)", letterSpacing: ".16em" }}>▶ VIDEO</span>}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px 8px 5px", background: "linear-gradient(to top, rgba(0,0,0,.85), transparent)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tkc("white"), letterSpacing: ".08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
    </div>
  );

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.82)", backdropFilter: "blur(16px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(1000px, 96vw)", height: "min(680px, 92vh)", background: "var(--c-bg)",
        border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderBottom: "1px solid var(--c-line)" }}>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)" }}>Media library</div>
          {!editing && (
            <span className="t-mono" title="Browser storage used by this site's pages & drafts — media itself is stored separately and doesn't count against it" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: lsMB > 4 ? "var(--c-blood-l)" : "var(--c-ink-4)", whiteSpace: "nowrap" }}>SITE DATA {lsMB.toFixed(1)}MB / ~5MB</span>
          )}
          {!editing && (
            <div style={{ display: "flex", gap: 2, background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: 2 }}>
              {[["yours", `Your media · ${yours.length}`], ["stock", `Stock · ${stock.length}`]].map(([k, l]) => (
                <button key={k} onClick={() => { setTab(k); setSelected(null); }} style={{
                  padding: "6px 12px", borderRadius: "var(--r-2)", cursor: "pointer", border: "none",
                  background: tab === k ? "var(--c-amber)" : "transparent", color: tab === k ? tkc("on-amber") : "var(--c-ink-3)",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
                }}>{l}</button>
              ))}
            </div>
          )}
          <span style={{ flex: 1 }}></span>
          {!editing && (
            <button onClick={() => fileRef.current && fileRef.current.click()} style={{ ...mlToolBtn, background: "var(--c-amber)", color: "var(--c-on-amber)", border: "none", fontWeight: 700 }}>↑ Upload</button>
          )}
          <button onClick={onClose} style={{ ...mlToolBtn, padding: "8px 10px" }} aria-label="Close" title="Close">✕</button>
          <input ref={fileRef} type="file" accept={accept} multiple hidden onChange={onFiles}/>
        </div>

        {editing ? (
          <div style={{ flex: 1, minHeight: 0 }}>
            <MediaEditor item={editing}
              onCancel={() => setEditing(null)}
              onSave={(out) => {
                const item = { id: mlId(), kind: "image", name: editing.name + " · edited", src: out, at: Date.now() };
                setMedia(m => [item, ...m]);
                mlPutMany([item]).catch(saveFail);
                onPick && onPick(out); onClose();
              }}/>
          </div>
        ) : (
          <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
            {/* Grid */}
            <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
              {shown.length === 0 ? (
                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "var(--c-ink-3)" }}>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)" }}>Nothing here yet.</div>
                  <div style={{ fontSize: "var(--fs-body)" }}>Upload {type === "video" ? "videos" : type === "image" ? "images" : "images or videos"} to build your library.</div>
                  <button onClick={() => fileRef.current && fileRef.current.click()} style={{ ...mlToolBtn, background: "var(--c-amber)", color: "var(--c-on-amber)", border: "none", fontWeight: 700 }}>↑ Upload your first</button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                  {shown.map(item => <Tile key={item.id} item={item}/>)}
                </div>
              )}
            </div>
            {/* Detail rail */}
            {selected && (
              <div style={{ width: 280, borderLeft: "1px solid var(--c-line)", padding: 18, display: "flex", flexDirection: "column", gap: 14, background: "var(--c-panel)" }}>
                <div style={{ borderRadius: "var(--r-2)", overflow: "hidden", border: "1px solid var(--c-line)", background: tkc("bg") }}>
                  {selected.kind === "video"
                    ? <video src={selected.src} controls style={{ width: "100%", display: "block" }}/>
                    : <img src={selected.src} alt="" style={{ width: "100%", display: "block" }}/>}
                </div>
                <div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{selected.name}</div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 3, textTransform: "uppercase" }}>{selected.kind}{selected.at ? " · uploaded" : " · stock"}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
                  {selected.kind === "image" && (
                    <button onClick={() => setEditing(selected)} style={mlToolBtn}>✎ Edit image</button>
                  )}
                  <button onClick={() => use(selected)} style={{ ...mlToolBtn, background: "var(--c-amber)", color: "var(--c-on-amber)", border: "none", fontWeight: 700 }}>Use this {selected.kind}</button>
                  {selected.at && <button onClick={() => remove(selected.id)} style={{ ...mlToolBtn, color: "var(--c-blood-l)", borderColor: "rgba(194,80,80,.4)" }}>Delete</button>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Host — mounted once; provides window.openMediaLibrary ──────────────────
function MediaLibraryHost() {
  const [opts, setOpts] = usML(null);
  ueML(() => { _mlOpen = (o) => setOpts(o); return () => { _mlOpen = null; }; }, []);
  if (!opts) return null;
  return <MediaLibrary type={opts.type || "all"} onPick={opts.onPick} onClose={() => setOpts(null)}/>;
}

Object.assign(window, { MediaLibraryHost, openMediaLibrary });
