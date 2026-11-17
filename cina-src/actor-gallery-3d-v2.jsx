// actor-gallery-3d-v2.jsx — THE GALLERY, an immersive cinematic photo
// constellation. Stills float as rounded cards on a loose sphere in deep space.
// The cloud auto-drifts; grab to spin it (trackball + momentum). Whichever card
// drifts through the centre is spotlit — brightened, swelled, haloed — so the
// eye always has a focal point. Dust motes and a film-grain vignette sink the
// far cards into the dark. Click any card for a quiet prev/next lightbox.
// No captions, no chrome. Falls back to a CSS scatter without WebGL.
//
// Props: images = [{ src, onOpen? }] · accent · height

const { useRef: s3Ref, useEffect: s3Eff, useState: s3State, useCallback: s3CB } = React;

// Draw an image into a rounded-corner canvas → texture with transparent corners.
function s3RoundTex(THREE, img, radiusFrac = 0.045) {
  const maxd = 512;
  const iw = img.width || 1, ih = img.height || 1;
  const sc = Math.min(1, maxd / Math.max(iw, ih));
  const w = Math.max(2, Math.round(iw * sc)), h = Math.max(2, Math.round(ih * sc));
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  const r = Math.min(w, h) * radiusFrac;
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.arcTo(w, 0, w, h, r); ctx.arcTo(w, h, 0, h, r);
  ctx.arcTo(0, h, 0, 0, r); ctx.arcTo(0, 0, w, 0, r); ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, 0, 0, w, h);
  // subtle inner edge so cards read as framed objects
  ctx.strokeStyle = "rgba(255,255,255,0.10)"; ctx.lineWidth = Math.max(1, w * 0.004);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(c);
  if ("colorSpace" in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  else if (THREE.sRGBEncoding !== undefined) tex.encoding = THREE.sRGBEncoding;
  tex.anisotropy = 4;
  return { tex, aspect: w / h };
}

function ActorGallerySphere({ images = [], accent = tkc("amber"), height = 640 }) {
  const mountRef = s3Ref(null);
  const [openIdx, setOpenIdx] = s3State(-1);
  const [failed, setFailed] = s3State(false);
  const [loaded, setLoaded] = s3State(0);
  const openRef = s3Ref(null); openRef.current = setOpenIdx;
  const ac = (typeof accent === "string" && accent.startsWith("#")) ? accent : tkc("amber");
  const total = images.length;

  s3Eff(() => {
    const THREE = window.THREE;
    const mount = mountRef.current;
    if (!THREE || !mount || !images.length) { setFailed(!THREE); return; }
    setLoaded(0);
    let loadedCount = 0;
    const bumpLoaded = () => { loadedCount++; setLoaded(loadedCount); };

    let renderer, raf, ro, disposed = false;
    const acCol = new THREE.Color(ac);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06060a, 0.028);
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    const CAM_Z = 15.5;
    camera.position.set(0, 0, CAM_Z);

    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch (e) { setFailed(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%;cursor:grab;touch-action:none";

    const N = images.length;
    const R = 7.0;
    const loader = new THREE.TextureLoader(); loader.crossOrigin = "anonymous";
    const cards = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    const rand = (s) => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };

    // soft radial sprite for per-card glow + dust
    const glowTex = (() => {
      const s = 128, cv = document.createElement("canvas"); cv.width = cv.height = s;
      const g = cv.getContext("2d");
      const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      grd.addColorStop(0, "rgba(255,255,255,1)");
      grd.addColorStop(0.4, "rgba(255,255,255,0.35)");
      grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd; g.fillRect(0, 0, s, s);
      return new THREE.CanvasTexture(cv);
    })();

    images.forEach((img, i) => {
      const y = 1 - (i / Math.max(1, N - 1)) * 2;
      const radf = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const rr = R * (0.84 + rand(i + 1) * 0.3);
      const base = new THREE.Vector3(Math.cos(theta) * radf * rr, y * rr, Math.sin(theta) * radf * rr);

      // glow plane removed — cards carry their own centre-spotlight brightening

      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, depthTest: false, fog: true });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
      mesh.position.copy(base);
      const scl = 3.0 + rand(i + 9) * 1.5;
      mesh.userData = { base, idx: i, scl, aspect: 1, hov: 0, emph: 0, rev: 0, ready: false };
      scene.add(mesh); cards.push(mesh);

      loader.load(img.src, (tex) => {
        if (disposed) return;
        try {
          const { tex: rt, aspect } = s3RoundTex(THREE, tex.image);
          mat.map = rt; mat.color.set(0xffffff); mat.needsUpdate = true;
          mesh.userData.aspect = aspect;
          tex.dispose && tex.dispose();
        } catch (e) {
          if ("colorSpace" in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 4; mat.map = tex; mat.color.set(0xffffff); mat.needsUpdate = true;
          mesh.userData.aspect = (tex.image.width || 1) / (tex.image.height || 1);
        }
        mesh.userData.ready = true;
        bumpLoaded();
      }, undefined, () => { if (!disposed) bumpLoaded(); });
    });

    // ── dust motes for depth/atmosphere — sparse + light so they never drag fps ──
    const dustN = 150;
    const dgeo = new THREE.BufferGeometry();
    const dpos = new Float32Array(dustN * 3);
    for (let i = 0; i < dustN; i++) {
      const rr = 5 + Math.random() * 9, t = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      dpos[i * 3] = rr * Math.sin(ph) * Math.cos(t);
      dpos[i * 3 + 1] = rr * Math.sin(ph) * Math.sin(t) * 0.8;
      dpos[i * 3 + 2] = rr * Math.cos(ph);
    }
    dgeo.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
    const dust = new THREE.Points(dgeo, new THREE.PointsMaterial({
      map: glowTex, color: acCol, size: 0.09, transparent: true, opacity: 0.4,
      depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    }));
    scene.add(dust);

    // ── interaction state ──
    const rotQ = new THREE.Quaternion();
    const st = { drag: false, lx: 0, ly: 0, vx: 0.0015, vy: 0.0003, moved: 0, mx: 0, my: 0, tmx: 0, tmy: 0 };
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    let hover = null, hasPtr = false, tSec = 0;
    const el = renderer.domElement;
    const ptr = (e) => (e.touches ? e.touches[0] : e);

    const applyDrag = (dx, dy) => {
      const k = 0.005;
      const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx * k);
      const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * k);
      rotQ.premultiply(qy).premultiply(qx);
      st.vx = dx * k * 0.6; st.vy = dy * k * 0.6;
    };
    const toNdc = (e) => {
      const r = el.getBoundingClientRect(); const p = ptr(e);
      ndc.x = ((p.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((p.clientY - r.top) / r.height) * 2 + 1;
      st.tmx = ndc.x; st.tmy = ndc.y; hasPtr = true;
    };
    const onDown = (e) => { st.drag = true; st.moved = 0; const p = ptr(e); st.lx = p.clientX; st.ly = p.clientY; el.style.cursor = "grabbing"; };
    const onMove = (e) => {
      toNdc(e);
      if (!st.drag) return;
      const p = ptr(e); const dx = p.clientX - st.lx, dy = p.clientY - st.ly;
      st.lx = p.clientX; st.ly = p.clientY; st.moved += Math.abs(dx) + Math.abs(dy);
      applyDrag(dx, dy);
    };
    const onUp = () => { if (!st.drag) return; st.drag = false; el.style.cursor = "grab"; };
    const onClick = (e) => {
      if (st.moved > 6) return;
      toNdc(e); ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(cards)[0];
      if (hit) openRef.current && openRef.current(hit.object.userData.idx);
    };
    const onLeave = () => { hasPtr = false; st.tmx = 0; st.tmy = 0; };
    el.addEventListener("mousedown", onDown); el.addEventListener("mousemove", onMove); el.addEventListener("mouseleave", onLeave);
    window.addEventListener("mouseup", onUp);
    el.addEventListener("touchstart", onDown, { passive: true }); el.addEventListener("touchmove", onMove, { passive: true }); window.addEventListener("touchend", onUp);
    el.addEventListener("click", onClick);

    const resize = () => { const w = mount.clientWidth || 1; if (w < 2) return; camera.aspect = w / height; camera.updateProjectionMatrix(); renderer.setSize(w, height, false); };
    if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(resize); ro.observe(mount); }
    window.addEventListener("resize", resize);
    let tries = 0; const ensure = () => { resize(); if (++tries < 40 && (mount.clientWidth || 0) < 2 && !disposed) requestAnimationFrame(ensure); }; ensure();

    const tmpV = new THREE.Vector3(), proj = new THREE.Vector3();
    let last = performance.now();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now(); const dt = Math.min(0.05, (now - last) / 1000); last = now; tSec += dt;

      if (!st.drag) {
        st.vx += (0.0015 - st.vx) * 0.01;
        st.vy += (0.0003 - st.vy) * 0.02;
        const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), st.vx);
        const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), st.vy);
        rotQ.premultiply(qy).premultiply(qx);
      }

      // camera: smooth parallax + gentle cinematic bob
      st.mx += (st.tmx - st.mx) * 0.06; st.my += (st.tmy - st.my) * 0.06;
      camera.position.x = st.mx * 2.6 + Math.sin(tSec * 0.25) * 0.5;
      camera.position.y = st.my * 1.7 + Math.cos(tSec * 0.19) * 0.35;
      camera.position.z = CAM_Z;
      camera.lookAt(0, 0, 0);

      dust.rotation.y -= dt * 0.03; dust.rotation.x += dt * 0.012;

      // hover pick
      let pick = null;
      if (hasPtr && !st.drag) { ray.setFromCamera(ndc, camera); const hit = ray.intersectObjects(cards)[0]; pick = hit ? hit.object : null; }
      hover = pick;

      cards.forEach((m, ci) => {
        const u = m.userData;
        tmpV.copy(u.base).applyQuaternion(rotQ);

        // centre-of-screen spotlight: closer to NDC origin + nearer = brighter
        proj.copy(tmpV).project(camera);
        const d = Math.hypot(proj.x, proj.y);
        const centerF = Math.max(0, 1 - d / 0.6); const center2 = centerF * centerF;
        const dist = camera.position.distanceTo(tmpV);
        const near = THREE.MathUtils.clamp(1 - (dist - (CAM_Z - R)) / (2 * R), 0, 1);
        const targetEmph = center2 * (0.5 + near * 0.5);
        u.emph += (targetEmph - u.emph) * 0.12;

        const isH = m === hover;
        u.hov += ((isH ? 1 : 0) - u.hov) * 0.16;
        const lift = Math.max(u.hov, u.emph);
        if (lift > 0.001) tmpV.lerp(camera.position, lift * 0.13);
        m.position.copy(tmpV);
        m.quaternion.copy(camera.quaternion);

        const s = u.scl * (1 + u.hov * 0.26 + u.emph * 0.3);
        const a = u.aspect || 1;
        const sx = s * (a >= 1 ? 1 : a), sy = s * (a >= 1 ? 1 / a : 1);
        m.scale.set(sx, sy, 1);

        if (m.material.map) {
          const b = 0.5 + near * 0.34 + u.emph * 0.55 + u.hov * 0.3;
          m.material.color.setScalar(Math.min(1, b));
        }
        u.rev += ((u.ready ? 1 : 0) - u.rev) * 0.12;
        m.material.opacity = (0.55 + near * 0.32 + u.emph * 0.13) * u.rev;
        m.renderOrder = Math.round((near + u.emph) * 100);
      });

      el.style.cursor = st.drag ? "grabbing" : (hover ? "pointer" : "grab");
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true; cancelAnimationFrame(raf); if (ro) ro.disconnect();
      window.removeEventListener("resize", resize);
      el.removeEventListener("mousedown", onDown); el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mouseup", onUp); window.removeEventListener("touchend", onUp); el.removeEventListener("click", onClick);
      cards.forEach((m) => { m.geometry.dispose(); if (m.material.map) m.material.map.dispose(); m.material.dispose(); });
      glowTex.dispose(); dust.geometry.dispose(); dust.material.dispose();
      renderer.dispose(); if (el.parentNode) el.parentNode.removeChild(el);
    };
  }, [images, height, ac]);

  const hasThree = typeof window !== "undefined" && !!window.THREE && !failed;

  return (
    <div style={{ position: "relative", width: "100%", height }}>
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />

      {hasThree && <>
        {/* film grain */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.06, mixBlendMode: "overlay",
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
        {/* vignette */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(120% 120% at 50% 50%, transparent 52%, var(--c-void,${tkc("void")}) 100%)` }} />
      </>}

      {/* no loading overlay — cards fade in individually as each still decodes */}

      {!hasThree && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "center", padding: 24, overflow: "hidden" }}>
          {images.slice(0, 12).map((img, i) => (
            <button key={i} onClick={() => setOpenIdx(i)} style={{
              flex: "0 0 auto", width: 150 + (i % 3) * 40, height: 180, borderRadius: "var(--r-3)", overflow: "hidden",
              border: "1px solid var(--c-line-2)", padding: 0, cursor: "pointer", background: tkc("panel"),
              transform: `translateY(${(i % 4) * 10 - 15}px) rotate(${(i % 5 - 2) * 1.4}deg)`,
            }}>
              <img src={img.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}

      {openIdx >= 0 && <S3Lightbox images={images} idx={openIdx} accent={ac} onIdx={setOpenIdx} onClose={() => setOpenIdx(-1)} />}
    </div>
  );
}

function S3Lightbox({ images, idx, accent, onIdx, onClose }) {
  const img = images[idx];
  const go = s3CB((dir) => onIdx((idx + dir + images.length) % images.length), [idx, images.length, onIdx]);
  s3Eff(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);
  if (!img) return null;
  const Arrow = ({ dir }) => (
    <button onClick={(e) => { e.stopPropagation(); go(dir); }} aria-label={dir > 0 ? "Next" : "Previous"} style={{
      position: "absolute", top: "50%", [dir > 0 ? "right" : "left"]: "clamp(12px,3vw,40px)", transform: "translateY(-50%)",
      width: 54, height: 54, borderRadius: "50%", border: "1px solid rgba(255,255,255,.2)", background: "rgba(20,18,16,.6)",
      backdropFilter: "blur(6px)", color: tkc("white"), fontSize: "var(--fs-title)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
    }}>{dir > 0 ? "›" : "‹"}</button>
  );
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1200, background: "rgba(5,4,3,.95)",
      backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "clamp(24px,5vw,72px)", animation: "s3Fade .22s ease",
    }}>
      <style>{`@keyframes s3Fade{from{opacity:0}to{opacity:1}}@keyframes s3Pop{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}`}</style>
      <Arrow dir={-1} /><Arrow dir={1} />
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", animation: "s3Pop .3s cubic-bezier(.2,.8,.2,1)", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <img key={img.src} src={img.src} alt="" style={{ display: "block", maxWidth: "min(90vw,1180px)", maxHeight: "78vh", objectFit: "contain", borderRadius: "var(--r-3)", border: "1px solid rgba(255,255,255,.14)", boxShadow: "0 50px 140px rgba(0,0,0,.7)", animation: "s3Pop .3s ease" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.55)" }}>
            <span style={{ color: accent }}>{String(idx + 1).padStart(2, "0")}</span> / {String(images.length).padStart(2, "0")}
          </span>
          {img.onOpen && <button className="btn btn-primary" onClick={() => { onClose(); img.onOpen(); }} style={{ height: 40, padding: "0 20px", fontSize: "var(--fs-body)" }}>Open title →</button>}
          <button className="btn" onClick={onClose} style={{ height: 40, padding: "0 18px", fontSize: "var(--fs-body)" }} aria-label="Close" title="Close">Close</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ActorGallerySphere });
