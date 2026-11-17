// vault-v2.jsx — Actor Vault, rebuilt as a PERFORMER PIPELINE.
//
// The vault is no longer a bag of vague tabs. It's a left-to-right
// production pipeline every performer moves through:
//
//   01 Cast → 02 Identity → 03 Stills → 04 Motion → 05 Voice → 06 Wardrobe → 07 Deploy
//
// • Cast      — gather/seed reference faces (or Birth a new performer)
// • Identity  — train the LoRA, lock the likeness (continuity gate)
// • Stills    — photoreal frames; gated until identity is locked
// • Motion    — image→video takes; gated
// • Voice     — clone + line reads; gated
// • Wardrobe  — costume continuity (reuses WardrobeTab)
// • Deploy    — push to scene, export card, mint to vault NFT (reuses ContinuityTab)
//
// 3-pane shell: Roster (left) · Stage (center, pipeline) · Inspector (right, per-stage).
// Overrides window.VaultPanel. Birth flow comes from vault-birth.jsx.

const { useState: usV2, useMemo: umV2, useEffect: ueV2, useRef: urV2 } = React;

// ─── Pipeline definition ────────────────────────────────────────────────

const VAULT_STAGES = [
  { id: "cast",     n: "01", label: "Cast",     desc: "References",            gated: false },
  { id: "identity", n: "02", label: "Identity", desc: "Lock the likeness",     gated: false },
  { id: "stills",   n: "03", label: "Stills",   desc: "Photoreal frames",      gated: true },
  { id: "motion",   n: "04", label: "Motion",   desc: "Moving takes",          gated: true },
  { id: "voice",    n: "05", label: "Voice",    desc: "Clone & lines",         gated: true },
  { id: "wardrobe", n: "06", label: "Wardrobe", desc: "Costume continuity",    gated: true },
  { id: "deploy",   n: "07", label: "Deploy",   desc: "Scene · export · mint", gated: true },
];

const DEFAULT_ATTRS_V2 = {
  c1: { age: 58, weight: 168, height: 71, build: 38, hair: 18, beard: 42, skin: 55, eyes: 75, posture: 32, gait: 48, voice: 92 },
  c2: { age: 34, weight: 124, height: 67, build: 18, hair: 65, beard: 0,  skin: 18, eyes: 0,  posture: 88, gait: 78, voice: 220 },
  c3: { age: 41, weight: 184, height: 70, build: 52, hair: 22, beard: 18, skin: 35, eyes: 0,  posture: 58, gait: 62, voice: 110 },
  c4: { age: 27, weight: 118, height: 66, build: 22, hair: 78, beard: 0,  skin: 12, eyes: 50, posture: 72, gait: 82, voice: 180 },
};

function initPipe(c) {
  const training = c.training || 0;
  const locked = training >= 80;
  const films = c.films || 0;
  return {
    locked,
    hash: locked ? "0xLORA-" + (c.id || "X").toUpperCase() + (60 + Math.floor(training / 3)) : null,
    continuity: locked ? Math.min(0.98, 0.84 + (training - 80) / 90) : Math.min(0.78, 0.55 + (c.refs || 4) / 60),
    refs: c.refs || 6,
    stills: locked ? 8 + films * 5 : 0,
    motion: locked ? films * 2 : 0,
    voice: locked ? Math.max(1, films) : 0,
    training: false,
    progress: 0,
  };
}

// ─── Portrait helper (rich) ──────────────────────────────────────────────

function VFace({ c, size = 300, seedShift = 0, selected, label, sub }) {
  // Real performer cast into this role → render their photo (one path for
  // every surface: roster, stage, refs, stills, motion). Plain <img> so it
  // works on pages that don't load watch-cast.jsx (CastPortrait may be absent).
  if (c && c.photo) {
    return (
      <div style={{ width: "100%", height: "100%", overflow: "hidden", background: (c.palette && c.palette[1]) || tkc("bg") }}>
        <img src={c.photo} alt={c.castName || c.name || ""} loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 22%", display: "block" }}/>
      </div>
    );
  }
  if (window.BirthFace) {
    return window.BirthFace({ seed: (c.seed || 117) + seedShift, palette: c.palette || [c.color, tkc("void"), tkc("amber-x")], size, selected, label, sub });
  }
  // fallback
  return <div style={{ width: "100%", aspectRatio: "3/4", background: `linear-gradient(135deg, ${c.color}66, ${tkc("void")})` }}/>;
}

// ─── Main panel ──────────────────────────────────────────────────────────

function VaultPanelV2() {
  const [chars, setChars] = usV2(() =>
    window.CinaPipeline?.loadCast ? window.CinaPipeline.loadCast() : (window.CHARACTERS || [])
  );
  const [activeId, setActiveId] = usV2(() => {
    const list = window.CinaPipeline?.loadCast ? window.CinaPipeline.loadCast() : (window.CHARACTERS || []);
    // Cross-app handoff: a career page on Watch may have sent us here
    // with a specific performer to train / style / cast.
    const h = window.TalentAPI ? TalentAPI.peekHandoff() : null;
    if (h && (h.intent === "vault" || h.intent === "cast" || h.intent === "style")) {
      const m = list.find(c =>
        c.id === h.actorId || (h.actorName && (c.name || "").toLowerCase() === h.actorName.toLowerCase()));
      if (m) { TalentAPI.takeHandoff(); return m.id; }
    }
    const curPerf = window.CinaPipeline?.getActivePerformer?.();
    if (curPerf?.id) {
      const match = list.find(c => c.id === curPerf.id);
      if (match) return match.id;
    }
    return (list[0] || { id: "c1" }).id;
  });
  const [birthOpen, setBirthOpen] = usV2(false);
  const [marketOpen, setMarketOpen] = usV2(false);
  const [search, setSearch] = usV2("");
  const [roleFilter, setRoleFilter] = usV2("All");

  const [stageByChar, setStageByChar] = usV2({});
  const [attrsByChar, setAttrsByChar] = usV2(DEFAULT_ATTRS_V2);
  const [pipeByChar, setPipeByChar] = usV2(() => {
    const m = {};
    const list = window.CinaPipeline?.loadCast ? window.CinaPipeline.loadCast() : (window.CHARACTERS || []);
    list.forEach(c => { m[c.id] = initPipe(c); });
    return m;
  });
  const [inspNotes, setInspNotes] = usV2(false);

  const active = chars.find(c => c.id === activeId) || chars[0];
  const attrs = attrsByChar[activeId] || DEFAULT_ATTRS_V2[activeId] || DEFAULT_ATTRS_V2.c1;
  const pipe = pipeByChar[activeId] || initPipe(active);
  const stage = stageByChar[activeId] || (pipe.locked ? "stills" : "identity");
  const toast = (typeof useToast === "function") ? useToast() : { push: () => {} };
  const lb = (typeof useLightbox === "function") ? useLightbox() : null;
  const shotCount = umV2(() => (window.vaultAppearsIn && active ? window.vaultAppearsIn(active).length : 0), [active && active.id, chars]);

  ueV2(() => {
    window.CinaPipeline?.syncCast?.(chars);
  }, [chars]);

  ueV2(() => {
    if (active) window.CinaPipeline?.setActivePerformer?.(active);
  }, [activeId]);

  // ── Birth flow takes over the panel
  if (birthOpen && window.ActorCreator) {
    return <window.ActorCreator
      onClose={() => setBirthOpen(false)}
      onCreate={(newActor) => {
        setChars(prev => [newActor, ...prev]);
        window.CHARACTERS = [newActor, ...(window.CHARACTERS || [])];
        if (window.TalentAPI) TalentAPI.upsert({ id: "studio-" + newActor.id, studioId: newActor.id, name: newActor.name, archetype: newActor.role, origin: "user" });
        setActiveId(newActor.id);
        setAttrsByChar(prev => ({ ...prev, [newActor.id]: { age: 30, weight: 150, height: 68, build: 38, hair: 50, beard: 20, skin: 40, eyes: 50, posture: 60, gait: 60, voice: 140 } }));
        setPipeByChar(prev => ({ ...prev, [newActor.id]: { locked: false, hash: null, continuity: 0.62, refs: newActor.refs || 6, stills: 0, motion: 0, voice: 0, training: false, progress: 0 } }));
        setStageByChar(prev => ({ ...prev, [newActor.id]: "identity" }));
        setBirthOpen(false);
        toast.push({ kind: "ok", agent: "director", title: `${newActor.name} cast`, message: "Now lock the identity to unlock the pipeline." });
      }}
    />;
  }

  const setAttr = (k, v) => setAttrsByChar(prev => ({ ...prev, [activeId]: { ...prev[activeId], [k]: v } }));
  const licenseFromMarket = (perf) => {
    const id = "lic_" + perf.castId;
    if (chars.some(c => c.id === id)) { setActiveId(id); setMarketOpen(false); return; }
    const copy = {
      id, name: perf.name, role: perf.role || "Guest", color: perf.color || tkc("ink-3"),
      photo: "assets/cast/" + perf.castId + ".png", refs: 12, films: 0, licensed: true, owner: perf.owner,
    };
    setChars(prev => [...prev, copy]);
    setPipeByChar(prev => ({ ...prev, [id]: { locked: true, hash: "licensed", continuity: 0.95, refs: 12, stills: 20, motion: 6, voice: 4, training: false, progress: 100 } }));
    setStageByChar(prev => ({ ...prev, [id]: "stills" }));
    setActiveId(id);
    setMarketOpen(false);
    if (window.openPay) {
      window.openPay({ kind: "buy", title: `License ${perf.name}`, subtitle: `${perf.owner} · ${perf.royalty}% royalty per render`, priceUSD: perf.fee });
    }
    toast.push({ kind: "ok", agent: "director", title: `${perf.name} licensed`, message: `From ${perf.owner} · $${perf.fee} + ${perf.royalty}% per render — paid to the owner automatically. Ready to cast.` });
  };

  const setStage = (s) => setStageByChar(prev => ({ ...prev, [activeId]: s }));
  const patchPipe = (patch) => setPipeByChar(prev => ({ ...prev, [activeId]: { ...prev[activeId], ...patch } }));

  // ── Roster filter
  const roles = ["All", "Lead", "Support", "Background"];
  const isLead = (c) => /protagonist|antagonist/i.test(c.role);
  const isSup  = (c) => /supporting/i.test(c.role);
  const filtered = chars.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.role.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter === "Lead" && !isLead(c)) return false;
    if (roleFilter === "Support" && !isSup(c)) return false;
    if (roleFilter === "Background" && (isLead(c) || isSup(c))) return false;
    return true;
  });

  // ── Stage completion for the stepper
  const stageDone = (sid) => {
    switch (sid) {
      case "cast": return pipe.refs > 0;
      case "identity": return pipe.locked;
      case "stills": return pipe.stills > 0;
      case "motion": return pipe.motion > 0;
      case "voice": return pipe.voice > 0;
      case "wardrobe": return pipe.locked;
      case "deploy": return (active.films || 0) > 0;
      default: return false;
    }
  };

  // ── Actions
  const trainIdentity = () => {
    patchPipe({ training: true, progress: 0 });
    const start = Date.now(); const DUR = 9000;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / DUR);
      setPipeByChar(prev => ({ ...prev, [activeId]: { ...prev[activeId], progress: p } }));
      if (p < 1) requestAnimationFrame(tick);
      else {
        setPipeByChar(prev => ({ ...prev, [activeId]: { ...prev[activeId], training: false, progress: 1, locked: true, hash: "0xLORA-" + Math.random().toString(36).slice(2, 8).toUpperCase(), continuity: 0.94 } }));
        setChars(prev => {
          const next = prev.map(c => c.id === activeId ? { ...c, training: Math.max(c.training || 0, 90) } : c);
          window.CHARACTERS = next;
          return next;
        });
        if (window.CinaProject) { window.CinaProject.addPerformer(active.name, active.role); window.CinaProject.lockPerformer(active.name); }
        window.CinaPipeline?.emit({ step: "cast", performer: active.name });
        toast.push({ kind: "ok", agent: "visual", title: `${active.name} · identity locked`, message: "LoRA trained · continuity 94%. Stills, Motion & Voice unlocked." });
      }
    };
    requestAnimationFrame(tick);
  };

  const renderStills = (n = 4) => {
    if (pipe.renderingStills) return;
    patchPipe({ renderingStills: n });
    toast.push({ kind: "info", agent: "visual", title: `${active.name} · rendering ${n} stills…`, message: "Flux 1.1 Ultra + LoRA · sampling" });
    setTimeout(() => {
      setPipeByChar(prev => {
        const p = prev[activeId] || {};
        return { ...prev, [activeId]: { ...p, stills: (p.stills || 0) + n, renderingStills: 0 } };
      });
      if (window.CinaProject) { window.CinaProject.addPerformer(active.name, active.role); window.CinaProject.bumpStills(active.name, n); }
      toast.push({ kind: "ok", agent: "visual", title: `${active.name} · ${n} stills ready`, message: `Continuity ${Math.round(pipe.continuity * 100)}% · → Pipeline board` });
    }, 1500);
  };
  const renderMotion = () => {
    if (pipe.renderingMotion) return;
    patchPipe({ renderingMotion: true });
    toast.push({ kind: "info", agent: "visual", title: `${active.name} · rendering clip…`, message: "Veo 3 · image-to-video · 8s" });
    setTimeout(() => {
      setPipeByChar(prev => {
        const p = prev[activeId] || {};
        return { ...prev, [activeId]: { ...p, motion: (p.motion || 0) + 1, renderingMotion: false } };
      });
      toast.push({ kind: "ok", agent: "visual", title: `${active.name} · clip ready`, message: "Veo 3 · 8s · native audio" });
    }, 1800);
  };
  const renderVoiceTake = () => {
    if (pipe.renderingVoice) return;
    patchPipe({ renderingVoice: true });
    toast.push({ kind: "info", agent: "audio", title: `${active.name} · synthesizing line…`, message: "Hedra + ElevenLabs v3 · lip-sync" });
    setTimeout(() => {
      setPipeByChar(prev => {
        const p = prev[activeId] || {};
        return { ...prev, [activeId]: { ...p, voice: (p.voice || 0) + 1, renderingVoice: false } };
      });
      toast.push({ kind: "ok", agent: "audio", title: `${active.name} · line recorded`, message: "Lip-sync locked" });
    }, 1500);
  };

  // ── Deploy actions ──────────────────────────────────────────────────
  const deploySendToScene = () => {
    const block = window.actorMindBlocks && window.actorMindBlocks(active);
    if (block) {
      toast.push({ kind: "warn", agent: "director", title: block.tag, message: `${active.name}'s agent is blocking new work — settle it at the Talent Desk.` });
      if (window.openNegotiation) window.openNegotiation(active, () => setStage("deploy"));
      return;
    }
    if (window.CinaProject) { window.CinaProject.addPerformer(active.name, active.role); }
    window.CinaPipeline?.setActivePerformer?.({ ...active, continuity: pipe.continuity });
    window.CinaPipeline?.syncCast?.(chars);
    toast.push({ kind: "ok", agent: "director", title: "03 CAST → 04 STILLS", message: `${active.name} attached (${Math.round(pipe.continuity * 100)}% continuity).` });
    if (window.CinaPipeline) window.CinaPipeline.go("board");
    else if (window.gotoStudioView) window.gotoStudioView("board");
  };
  const sendNextRef = urV2(deploySendToScene);
  sendNextRef.current = deploySendToScene;

  ueV2(() => {
    if (!window.CinaPipeline?.registerSendNext) return;
    return window.CinaPipeline.registerSendNext("vault", () => {
      sendNextRef.current();
      return true;
    });
  }, []);
  const deployExportCard = () => {
    const card = {
      performer: active.name, role: active.role,
      identityHash: pipe.hash || "unlocked",
      continuity: Math.round(pipe.continuity * 100) + "%",
      assets: { refs: pipe.refs, stills: pipe.stills, motionClips: pipe.motion, voiceLines: pipe.voice },
      loraModel: "flux-1.1-ultra-lora", exportedAt: new Date().toISOString(),
    };
    try {
      const blob = new Blob([JSON.stringify(card, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${active.name.replace(/\s+/g, "-").toLowerCase()}-identity-card.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.push({ kind: "ok", agent: "director", title: "Identity card exported", message: `${active.name} · refs + stills + voice manifest` });
    } catch (e) {
      toast.push({ kind: "warn", agent: "director", title: "Export failed", message: String(e) });
    }
  };
  const deployMint = () => {
    if (window.openPay) {
      window.openPay({
        kind: "nft",
        title: `${active.name} · Identity`,
        subtitle: "Vault LoRA · mint to chain",
        accent: tkc("amber"),
        priceUSD: 240,
        priceNote: "0.07 ETH · one-time mint",
        image: active.photo ? { url: active.photo } : { color: active.color },
        perks: ["On-chain identity hash " + (pipe.hash || ""), "Royalties on every downstream render", "Portable across any Cina production", "Provenance for the trained likeness"],
        onConfirm: () => {
          try { localStorage.setItem(`cina:actor-minted:${active.id}`, "1"); } catch {}
          patchPipe({ minted: true });
          toast.push({ kind: "ok", agent: "director", title: `${active.name} minted`, message: "Identity is on-chain. Royalties active." });
        },
      });
    } else {
      try { localStorage.setItem(`cina:actor-minted:${active.id}`, "1"); } catch {}
      patchPipe({ minted: true });
      toast.push({ kind: "ok", agent: "director", title: `${active.name} minted`, message: "Identity is on-chain." });
    }
  };

  const duplicateChar = () => {
    const id = "c" + Date.now().toString(36);
    const copy = { ...active, id, name: active.name + " (FORK)", refs: 0, training: 0, films: 0 };
    setChars(prev => [...prev, copy]);
    setAttrsByChar(prev => ({ ...prev, [id]: { ...attrs } }));
    setPipeByChar(prev => ({ ...prev, [id]: { locked: false, hash: null, continuity: 0.6, refs: 4, stills: 0, motion: 0, voice: 0, training: false, progress: 0 } }));
    setStageByChar(prev => ({ ...prev, [id]: "cast" }));
    setActiveId(id);
    toast.push({ kind: "info", agent: "director", title: "Forked actor", message: `${copy.name} created.` });
  };
  const archiveChar = () => {
    if (chars.length <= 1) return;
    const next = chars.find(c => c.id !== activeId)?.id;
    setChars(prev => prev.filter(c => c.id !== activeId));
    if (next) setActiveId(next);
    toast.push({ kind: "info", agent: "director", title: "Archived", message: `${active.name} moved to archive.` });
  };

  const openRefs = (startIdx) => {
    if (!lb) return;
    const items = Array.from({ length: pipe.refs }).map((_, i) => ({
      render: () => <div style={{ width: "100%", height: "100%" }}><VFace c={active} size={420} seedShift={i * 7}/></div>,
      label: i === 0 ? "ref-01 · key" : `ref-${String(i + 1).padStart(2, "0")}`,
      seed: (active.seed || 117) + i * 7, aspect: "3:4",
    }));
    lb.open({ subtitle: `Actor Vault · ${active.name}`, title: `Reference set · ${items.length}`, kind: "portrait", items, index: startIdx });
  };

  if (!active) return <div style={{ padding: 40 }}>No cast.</div>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "clamp(196px, 17vw, 248px) minmax(0, 1fr) clamp(248px, 22vw, 320px)", gridTemplateRows: "auto 1fr", flex: 1, minHeight: 0, position: "relative" }}>
      <style>{`@keyframes v2Pulse { 0%,100% { opacity:.4 } 50% { opacity:1 } } @keyframes v2Shimmer { 0% { background-position: 120% 0 } 100% { background-position: -120% 0 } }`}</style>

      {/* ── TALENT DESK — live disputes across the roster ── */}
      {window.ActorTalentDesk && (
        <div style={{ gridColumn: "1 / -1" }}>
          <ActorTalentDesk chars={chars} onNegotiate={(c) => { setActiveId(c.id); window.openNegotiation(c); }}/>
        </div>
      )}

      {marketOpen && <TalentMarket onClose={() => setMarketOpen(false)} onLicense={licenseFromMarket} owned={chars}/>}

      {/* ── ROSTER ── */}
      <div style={{ borderRight: "1px solid var(--c-line)", display: "flex", flexDirection: "column", minHeight: 0, background: "var(--c-panel)" }}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--c-line)" }}>
          <button onClick={() => setBirthOpen(true)} style={{
            width: "100%", padding: "11px 14px", marginBottom: 10,
            background: "var(--c-amber)", color: "var(--c-on-amber)", border: "none", borderRadius: "var(--r-2)", cursor: "pointer",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>✦ Birth performer</button>
          <button onClick={() => setMarketOpen(true)} style={{
            width: "100%", padding: "9px 14px", marginBottom: 10,
            background: "transparent", color: "var(--c-ink-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", cursor: "pointer",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600, textTransform: "uppercase",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>◈ Talent market</button>
          <div style={{ position: "relative" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cast..." style={{
              width: "100%", padding: "6px 10px 6px 26px",
              background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)",
              fontSize: "var(--fs-body)", color: "var(--c-ink)", outline: "none",
            }}/>
            <div style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "var(--c-ink-4)", display: "flex" }}>
              {window.Icon ? <Icon name="search" size={11}/> : "⌕"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 3, marginTop: 8 }}>
            {roles.map(r => (
              <button key={r} onClick={() => setRoleFilter(r)} style={{
                flex: 1, height: 22, fontSize: "var(--fs-label)", padding: "0 6px",
                background: roleFilter === r ? "var(--c-panel-3)" : "transparent",
                border: `1px solid ${roleFilter === r ? "var(--c-amber)" : "var(--c-line-2)"}`,
                color: roleFilter === r ? "var(--c-amber)" : "var(--c-ink-3)",
                borderRadius: "var(--r-1)", cursor: "pointer", fontFamily: "var(--f-mono)", letterSpacing: ".08em",
              }}>{r}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px 6px" }}>
          <span className="t-label">Cast · {filtered.length}</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 12 }}>
          {filtered.map(c => {
            const cActive = c.id === activeId;
            const cp = pipeByChar[c.id] || initPipe(c);
            const cStage = stageByChar[c.id] || (cp.locked ? "stills" : "identity");
            const stageMeta = VAULT_STAGES.find(s => s.id === cStage);
            return (
              <button key={c.id} onClick={() => setActiveId(c.id)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "10px 14px", border: "none",
                background: cActive ? "var(--c-panel-3)" : "transparent",
                borderLeft: cActive ? `2px solid ${c.color}` : "2px solid transparent",
                textAlign: "left", color: "inherit", cursor: "pointer",
              }}>
                <div style={{ width: 38, height: 50, borderRadius: "var(--r-1)", overflow: "hidden", flexShrink: 0, border: "1px solid var(--c-line-2)" }}>
                  <VFace c={c} size={38}/>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 4 }}>
                    {cp.locked && <span style={{ color: "var(--c-amber)", fontSize: "var(--fs-label)" }}>●</span>}
                    {c.name}
                  </div>
                  {c.castName && (
                    <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span style={{ color: "var(--c-ink-4)" }}>played by </span>{c.castName}
                    </div>
                  )}
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: cp.locked ? "var(--c-good)" : "var(--c-ink-3)", marginTop: 2, letterSpacing: ".08em", textTransform: "uppercase" }}>
                    {cp.locked ? `Locked · ${stageMeta?.label}` : `${stageMeta?.n} ${stageMeta?.label}`}
                  </div>
                  {/* mini pipeline progress */}
                  <div style={{ display: "flex", gap: 1.5, marginTop: 5 }}>
                    {VAULT_STAGES.map(s => {
                      const done = (() => {
                        switch (s.id) {
                          case "cast": return cp.refs > 0;
                          case "identity": return cp.locked;
                          case "stills": return cp.stills > 0;
                          case "motion": return cp.motion > 0;
                          case "voice": return cp.voice > 0;
                          case "wardrobe": return cp.locked;
                          case "deploy": return (c.films || 0) > 0;
                          default: return false;
                        }
                      })();
                      return <span key={s.id} style={{ flex: 1, height: 2, borderRadius: "var(--r-1)", background: done ? c.color : "var(--c-line-2)" }}/>;
                    })}
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: "32px 14px", textAlign: "center", color: "var(--c-ink-4)", fontSize: "var(--fs-label)", fontStyle: "italic", fontFamily: "var(--f-display)" }}>
              {search ? `No actors match "${search}".` : "No actors in this role."}
            </div>
          )}
        </div>

        <div style={{ padding: "8px 14px", borderTop: "1px solid var(--c-line)", display: "flex", gap: 4 }}>
          <button onClick={duplicateChar} style={rosterBtn}>⑂ Fork</button>
          <button onClick={archiveChar} disabled={chars.length <= 1} style={{ ...rosterBtn, flex: "0 0 auto", width: 36 }}>⌫</button>
        </div>
      </div>

      {/* ── STAGE ── */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0, position: "relative", background: tkc("black") }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid var(--c-line)", background: "rgba(8,8,10,0.7)", backdropFilter: "blur(8px)", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div className="t-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span>Actor Vault · {(active.id || "").toUpperCase()}</span>
              {pipe.locked && (
                <span style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--c-amber)", fontSize: "var(--fs-label)", padding: "1px 6px", background: "rgba(var(--accent-rgb),0.12)", border: "1px solid rgba(var(--accent-rgb),0.3)", borderRadius: "var(--r-1)", letterSpacing: ".16em" }}>
                  ● LOCKED · {pipe.hash}
                </span>
              )}
            </div>
            <div className="t-display" style={{ fontSize: "var(--fs-title)", fontStyle: "italic", color: "var(--c-ink)", lineHeight: 1 }}>{active.name}</div>
            <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 4, fontFamily: "var(--f-mono)" }}>
              {active.role} · age {attrs.age} · {(active.traits || []).join(" · ")}
            </div>
            {active.castName && (
              <button
                onClick={() => { window.location.href = `index.html#/cast/${active.castId}`; }}
                title={`Open ${active.castName}'s performer profile`}
                style={{ marginTop: 7, alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 7, padding: "3px 9px 3px 3px", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: 999, cursor: "pointer", color: "inherit" }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                  <VFace c={active}/>
                </span>
                <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }}>played by <b style={{ color: "var(--c-ink)" }}>{active.castName}</b></span>
                <span style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)" }}>↗</span>
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button style={topBtn} onClick={() => toast.push({ kind: "info", agent: "visual", title: "Upload reference", message: "Drop an image to seed the likeness." })}>↑ Upload</button>
            <button style={topBtn} onClick={() => toast.push({ kind: "info", agent: "writer", title: "Web search", message: "Pulling 12 candidate refs from public sources…" })}>⊕ Web</button>
            <button style={topBtn} onClick={() => toast.push({ kind: "ok", agent: "visual", title: "Identity card exported", message: `${active.name} · ${pipe.refs} refs → handoff package.` })}>⤓ Export</button>
            <button style={{ ...primaryBtn, borderRadius: 0 }} onClick={deploySendToScene}>Send Next · 04 Stills →</button>
          </div>
        </div>

        {/* Pipeline stepper */}
        <div style={{ display: "flex", alignItems: "stretch", padding: "0 16px", borderBottom: "1px solid var(--c-line)", background: "rgba(8,8,10,0.55)", position: "relative", zIndex: 2, overflowX: "auto" }}>
          {VAULT_STAGES.map((s, i) => {
            const isActive = stage === s.id;
            const done = stageDone(s.id);
            const locked = s.gated && !pipe.locked;
            return (
              <React.Fragment key={s.id}>
                <button onClick={() => !locked && setStage(s.id)} disabled={locked} style={{
                  flex: "1 0 auto", minWidth: 116, padding: "11px 12px",
                  background: isActive ? "rgba(var(--accent-rgb),0.08)" : "transparent",
                  border: "none", borderRadius: 0, borderBottom: `2px solid ${isActive ? "var(--c-amber)" : "transparent"}`,
                  cursor: locked ? "not-allowed" : "pointer", textAlign: "left",
                  display: "flex", flexDirection: "column", gap: 3, opacity: locked ? 0.4 : 1,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                      background: done ? "var(--c-amber)" : isActive ? "transparent" : "var(--c-panel-2)",
                      border: `1px solid ${done ? "var(--c-amber)" : isActive ? "var(--c-amber)" : "var(--c-line-2)"}`,
                      color: done ? tkc("on-amber") : isActive ? "var(--c-amber)" : "var(--c-ink-3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700,
                    }}>{locked ? "🔒" : done ? "✓" : s.n}</span>
                    <span style={{ fontSize: "var(--fs-body)", fontWeight: isActive ? 600 : 500, color: isActive ? "var(--c-ink)" : "var(--c-ink-2)" }}>{s.label}</span>
                  </div>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", paddingLeft: 25 }}>{s.desc}</span>
                </button>
                {i < VAULT_STAGES.length - 1 && <div style={{ alignSelf: "center", color: "var(--c-line-3)", fontSize: "var(--fs-label)", padding: "0 2px" }}>→</div>}
              </React.Fragment>
            );
          })}
        </div>

        {/* Stage body */}
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", position: "relative" }}>
          <QcBar pipe={pipe} shotCount={shotCount}/>
          {stage === "cast"     && <CastStage active={active} pipe={pipe} onOpenRefs={openRefs} onContinue={() => setStage("identity")}/>}
          {stage === "identity" && <IdentityStage active={active} pipe={pipe} attrs={attrs} onTrain={trainIdentity} onOpenRefs={openRefs} onContinue={() => setStage("stills")}/>}
          {stage === "stills"   && <StillsStage active={active} pipe={pipe} onRender={renderStills} onOpenRefs={openRefs} onContinue={() => setStage("motion")}/>}
          {stage === "motion"   && <MotionStage active={active} pipe={pipe} onRender={renderMotion} onContinue={() => setStage("voice")}/>}
          {stage === "voice"    && <VoiceStage active={active} pipe={pipe} onRecord={renderVoiceTake} onContinue={() => setStage("wardrobe")}/>}
          {stage === "wardrobe" && (window.WardrobeTab ? <window.WardrobeTab character={active}/> : <Empty label="Wardrobe"/>)}
          {stage === "deploy"   && <DeployStage active={active} pipe={pipe} onSendToScene={deploySendToScene} onExport={deployExportCard} onMint={deployMint}/>}
        </div>
      </div>

      {/* ── INSPECTOR ── */}
      <div style={{ borderLeft: "1px solid var(--c-line)", display: "flex", flexDirection: "column", minHeight: 0, background: "var(--c-panel)" }}>
        <div style={{ padding: "13px 16px", borderBottom: "1px solid var(--c-line)" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>
            {VAULT_STAGES.find(s => s.id === stage)?.n} · {VAULT_STAGES.find(s => s.id === stage)?.label.toUpperCase()} CONTROLS
          </div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", marginTop: 3, color: "var(--c-ink)" }}>
            {stage === "cast" || stage === "identity" ? "Identity dials" :
             stage === "stills" ? "Still settings" :
             stage === "motion" ? "Motion settings" :
             stage === "voice" ? "Voice register" :
             stage === "wardrobe" ? "Costume" : "Deploy"}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 18px" }}>
          {(stage === "cast" || stage === "identity") && window.IdentityInspector && <window.IdentityInspector attrs={attrs} setAttr={setAttr}/>}
          {stage === "stills"   && <StillsInspector pipe={pipe} onRender={renderStills}/>}
          {stage === "motion"   && <MotionInspector pipe={pipe} onRender={renderMotion}/>}
          {stage === "voice"    && window.VoiceInspector && <window.VoiceInspector attrs={attrs} setAttr={setAttr}/>}
          {stage === "wardrobe" && window.CostumeInspector && <window.CostumeInspector character={active}/>}
          {stage === "deploy"   && <DeployInspector active={active} pipe={pipe}/>}
        </div>

        {/* Footer — context action */}
        <div style={{ padding: "10px 14px", borderTop: "1px solid var(--c-line)", display: "flex", gap: 6 }}>
          {stage === "identity" && !pipe.locked && (
            <button onClick={trainIdentity} disabled={pipe.training} style={{ ...primaryBtn, flex: 1 }}>
              {pipe.training ? `Training · ${Math.round(pipe.progress * 100)}%` : "▲ Train & lock identity"}
            </button>
          )}
          {stage === "identity" && pipe.locked && (
            <>
              <button onClick={() => patchPipe({ locked: false, hash: null })} style={{ ...rosterBtn, flex: 1 }}>Retrain</button>
              <button onClick={() => setStage("stills")} style={{ ...primaryBtn, flex: 1 }}>Continue → Stills</button>
            </>
          )}
          {stage === "stills"   && <button onClick={() => renderStills(4)} style={{ ...primaryBtn, flex: 1 }}>✦ Render 4 stills</button>}
          {stage === "motion"   && <button onClick={renderMotion} style={{ ...primaryBtn, flex: 1 }}>✦ Render clip</button>}
          {stage === "voice"    && <button onClick={renderVoiceTake} style={{ ...primaryBtn, flex: 1 }}>● Record line</button>}
          {stage === "cast"     && <button onClick={() => setStage("identity")} style={{ ...primaryBtn, flex: 1 }}>Continue → Identity</button>}
          {stage === "wardrobe" && <button onClick={() => setStage("deploy")} style={{ ...primaryBtn, flex: 1 }}>Continue → Deploy</button>}
          {stage === "deploy"   && <button onClick={() => toast.push({ kind: "ok", agent: "visual", title: "Minted to vault", message: `${active.name}'s identity NFT minted. Royalties route to contract holder.` })} style={{ ...primaryBtn, flex: 1 }}>◈ Mint identity</button>}
        </div>
      </div>
    </div>
  );
}

// ─── QC bar ──────────────────────────────────────────────────────────────

function QcBar({ pipe, shotCount }) {
  const cont = Math.round(pipe.continuity * 100);
  return (
    <div style={{ alignSelf: "stretch", flexShrink: 0, display: "flex", justifyContent: "flex-end", gap: 10, padding: "10px 24px", borderBottom: "1px solid var(--c-line)", background: "rgba(8,8,10,0.4)", fontFamily: "var(--f-mono)" }}>
      <QcStat label="CONTINUITY" value={`${cont}%`} good={cont >= 92} warn={cont < 80}/>
      <QcDiv/>
      <QcStat label="REFS" value={pipe.refs}/>
      <QcDiv/>
      <QcStat label="STILLS" value={pipe.stills}/>
      <QcDiv/>
      <QcStat label="CLIPS" value={pipe.motion}/>
      <QcDiv/>
      <QcStat label="IN SHOTS" value={shotCount}/>
    </div>
  );
}
function QcStat({ label, value, good, warn }) {
  return <CinaStat size="sm" label={label} value={value} tone={good ? "good" : warn ? "warn" : undefined}/>;
}
function QcDiv() { return <div style={{ width: 1, alignSelf: "stretch", background: "var(--c-line)" }}/>; }

// ─── Stage: CAST ───────────────────────────────────────────────────────

function CastStage({ active, pipe, onOpenRefs, onContinue }) {
  return (
    <>
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: tkc("black"), overflow: "hidden" }}>
        <div style={{ width: "44%", maxWidth: 360 }}><VFace c={active} size={420}/></div>
      </div>
      <div style={{ borderTop: "1px solid var(--c-line)", padding: "12px 18px", background: "rgba(8,8,10,0.45)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>REFERENCE SET · {pipe.refs}</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => onOpenRefs(0)} style={topBtn}>⊞ All refs</button>
            <button onClick={onContinue} style={primaryBtn}>Lock identity →</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {Array.from({ length: pipe.refs }).map((_, i) => (
            <button key={i} onClick={() => onOpenRefs(i)} style={{ flex: "0 0 76px", height: 96, borderRadius: "var(--r-1)", overflow: "hidden", border: i === 0 ? "1.5px solid var(--c-amber)" : "1px solid var(--c-line-2)", cursor: "zoom-in", padding: 0, background: "transparent", position: "relative" }}>
              <VFace c={active} size={76} seedShift={i * 7}/>
              {i === 0 && <div style={{ position: "absolute", top: 3, left: 3, fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", color: "var(--c-amber)", background: "rgba(8,8,10,.8)", padding: "1px 4px", borderRadius: "var(--r-1)", letterSpacing: ".08em" }}>KEY</div>}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Stage: IDENTITY ───────────────────────────────────────────────────

function IdentityStage({ active, pipe, attrs, onTrain, onOpenRefs, onContinue }) {
  return (
    <>
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: tkc("black"), overflow: "hidden", padding: 24 }}>
        <div style={{ width: "40%", maxWidth: 320, position: "relative" }}>
          <VFace c={active} size={420}/>
          {pipe.locked && (
            <div style={{ position: "absolute", top: 10, left: 10, padding: "4px 10px", background: "rgba(8,8,10,.85)", border: "1px solid var(--c-amber)", borderRadius: "var(--r-1)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>● IDENTITY LOCKED</div>
          )}
        </div>

        {/* Training overlay */}
        {pipe.training && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(8,8,10,0.78)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <div style={{ width: 360, maxWidth: "80%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-amber)", animation: "v2Pulse 1s infinite" }}/>
                  TRAINING LoRA · {Math.round(pipe.progress * 100)}%
                </span>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{Math.max(0, Math.ceil((1 - pipe.progress) * 9))}s · H100</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,.08)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pipe.progress * 100}%`, background: "var(--c-amber)", boxShadow: "0 0 12px var(--c-amber)", transition: "width .1s linear" }}/>
              </div>
              <div style={{ marginTop: 12, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", lineHeight: 1.6 }}>
                <div>$ flux-train --identity {(active.id||"x")} --refs {pipe.refs} --steps 2400</div>
                {pipe.progress > 0.3 && <div>{">"} embedding face · InstantID</div>}
                {pipe.progress > 0.6 && <div>{">"} lora rank=32 · alpha=16</div>}
                {pipe.progress > 0.9 && <div style={{ color: "var(--c-good)" }}>{">"} compiling identity hash…</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lower panel */}
      <div style={{ borderTop: "1px solid var(--c-line)", padding: "14px 18px", background: "rgba(8,8,10,0.45)" }}>
        {!pipe.locked ? (
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ flex: 1 }}>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>Lock the likeness.</div>
              <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5, margin: "4px 0 0", maxWidth: 520 }}>
                Train a Flux LoRA on {pipe.refs} references. The output is an identity hash every downstream render must match at ≥92%. ~20 min on an H100 · ~$1.40. Use the dials on the right to tune before locking.
              </p>
            </div>
            <button onClick={onTrain} disabled={pipe.training} style={{ ...primaryBtn, padding: "12px 20px", fontSize: "var(--fs-body)" }}>
              {pipe.training ? `Training · ${Math.round(pipe.progress * 100)}%` : "▲ Train & lock identity"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--c-good)", color: tkc("panel-2"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-lead)", flexShrink: 0 }}>✓</div>
            <div style={{ flex: 1 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".16em", marginBottom: 3 }}>IDENTITY LOCKED · {pipe.hash} · CONTINUITY {Math.round(pipe.continuity * 100)}%</div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{active.name} is photoreal. Stills, Motion & Voice are unlocked.</div>
            </div>
            <button onClick={onContinue} style={{ ...primaryBtn, padding: "11px 18px" }}>Continue → Stills</button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Stage: STILLS ─────────────────────────────────────────────────────

function StageFooter({ ready, done, cta, hint, onContinue }) {
  return (
    <div style={{ flexShrink: 0, borderTop: "1px solid var(--c-line)", background: "rgba(8,8,10,0.55)", padding: "12px 24px", display: "flex", alignItems: "center", gap: 14 }}>
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: ready ? "var(--c-good)" : "var(--c-ink-4)" }}>
        {ready ? "✓ " + done : hint}
      </span>
      <span style={{ flex: 1 }}/>
      <button onClick={onContinue} disabled={!ready} style={{
        ...primaryBtn,
        opacity: ready ? 1 : 0.4, cursor: ready ? "pointer" : "default",
      }}>{cta} →</button>
    </div>
  );
}

function StillsStage({ active, pipe, onRender, onOpenRefs, onContinue }) {
  const count = Math.max(6, pipe.stills);
  const rendering = pipe.renderingStills || 0;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "rgba(8,8,10,0.4)" }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>STILLS · FLUX 1.1 ULTRA + LoRA</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 4 }}>{count} photoreal stills</div>
          </div>
          <button onClick={() => onRender(4)} disabled={!!rendering} style={{ ...primaryBtn, opacity: rendering ? 0.6 : 1, cursor: rendering ? "default" : "pointer" }}>{rendering ? `✦ Rendering ${rendering}…` : "✦ Render 4"}</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
          {rendering > 0 && Array.from({ length: rendering }).map((_, i) => (
            <div key={"gen" + i} style={{ borderRadius: "var(--r-2)", overflow: "hidden", border: "1px solid var(--c-amber)", background: "var(--c-panel)" }}>
              <div style={{ position: "relative", aspectRatio: "1", background: `linear-gradient(115deg, ${active.color}22, ${tkc("bg")} 70%)`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(100deg, transparent 20%, rgba(var(--accent-rgb),.14) 50%, transparent 80%)", backgroundSize: "220% 100%", animation: "v2Shimmer 1.1s linear infinite" }}/>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", zIndex: 1 }}>SAMPLING…</span>
              </div>
              <div style={{ padding: "7px 9px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" }}>FLUX · LoRA</span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)" }}>●</span>
              </div>
            </div>
          ))}
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} style={{ borderRadius: "var(--r-2)", overflow: "hidden", border: "1px solid var(--c-line)", background: "var(--c-panel)" }}>
              <div style={{ position: "relative" }}>
                <VFace c={active} size={200} seedShift={i * 13 + 40}/>
                <div style={{ position: "absolute", top: 6, right: 6, padding: "1px 6px", background: "rgba(8,8,10,.75)", border: "1px solid var(--c-good)", color: "var(--c-good)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>
                  {Math.round((0.92 + (i % 6) * 0.01) * 100)}%
                </div>
              </div>
              <div style={{ padding: "7px 9px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em" }}>SEED {1000 + i * 137}</span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>$0.06</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <StageFooter ready={pipe.stills > 0} done={`${pipe.stills} stills approved`} hint="Render at least one still to continue" cta="Continue to Motion" onContinue={onContinue}/>
    </div>
  );
}

// ─── Stage: MOTION ─────────────────────────────────────────────────────

function MotionStage({ active, pipe, onRender, onContinue }) {
  const count = Math.max(3, pipe.motion);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "rgba(8,8,10,0.4)" }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>MOTION · VEO 3 · I2V + AUDIO</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 4 }}>{count} takes</div>
          </div>
          <button onClick={onRender} style={primaryBtn}>✦ Render clip</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} style={{ borderRadius: "var(--r-2)", overflow: "hidden", border: "1px solid var(--c-line)", background: "var(--c-panel)" }}>
              <div style={{ position: "relative", aspectRatio: "16/9", background: `linear-gradient(${(i * 67) % 360}deg, ${active.color}33, ${tkc("void")} 80%)`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {active.photo && <img src={active.photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `${40 + (i * 9) % 26}% 16%`, filter: ["saturate(.9) contrast(1.08) brightness(.88)", "grayscale(.55) sepia(.3) hue-rotate(-12deg) brightness(.82) contrast(1.06)", "grayscale(.85) contrast(1.16) brightness(.86)", "sepia(.4) hue-rotate(-26deg) saturate(1.2) brightness(.85)"][i % 4] }}/>}
                {active.photo && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,5,7,.12), rgba(5,5,7,.5) 88%)" }}/>}
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(8,8,10,.65)", border: "1px solid rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center", color: tkc("white"), fontSize: "var(--fs-lead)", paddingLeft: 3, zIndex: 1 }}>▶</div>
                <div style={{ position: "absolute", top: 8, left: 8, padding: "2px 7px", background: "rgba(var(--accent-rgb),.15)", border: "1px solid rgba(var(--accent-rgb),.4)", color: "var(--c-amber)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>VEO 3 · ♪</div>
                <div style={{ position: "absolute", bottom: 8, right: 10, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.7)" }}>0:08</div>
              </div>
              <div style={{ padding: "8px 10px" }}>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>
                  {["Slow push-in, rim light catches the eyes.", "Walks into frame, sits, looks off-screen.", "Tight pull-focus to the rear-view.", "Wide cliff edge, slow dolly."][i % 4]}
                </div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 5, letterSpacing: ".08em" }}>CONT {Math.round((0.92 + (i % 5) * 0.01) * 100)}% · 8s · $6.00</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <StageFooter ready={pipe.motion > 0 || pipe.locked} done={`${Math.max(0, pipe.motion)} motion takes ready`} hint="Render a take to continue" cta="Continue to Voice" onContinue={onContinue}/>
    </div>
  );
}

// ─── Stage: VOICE ──────────────────────────────────────────────────────

function VoiceStage({ active, pipe, onRecord, onContinue }) {
  const lines = [
    { line: "I know what's in the photograph.", len: "0:04", status: "approved" },
    { line: "Don't ask me that again.", len: "0:02", status: "approved" },
    { line: "It rained for a week. I remember the week.", len: "0:06", status: "review" },
    { line: "She was already gone when I got there.", len: "0:05", status: "draft" },
  ].slice(0, Math.max(2, pipe.voice + 2));
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "rgba(8,8,10,0.4)" }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "20px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>VOICE · HEDRA + ELEVENLABS v3</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 4 }}>{lines.length} lip-synced lines</div>
        </div>
        <button onClick={onRecord} style={primaryBtn}>● Record line</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {lines.map((t, i) => (
          <div key={i} style={{ padding: "12px 14px", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", display: "grid", gridTemplateColumns: "30px 1fr 180px 70px 70px", alignItems: "center", gap: 12 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--c-panel-3)", border: "1px solid var(--c-line-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-ink-2)", fontSize: "var(--fs-label)", cursor: "pointer" }}>▶</div>
            <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>"{t.line}"</span>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 1.5, height: 22 }}>
              {Array.from({ length: 44 }).map((_, k) => <div key={k} style={{ width: 2.5, height: `${20 + Math.abs(Math.sin(i + k * 0.5)) * 80}%`, background: active.color, opacity: 0.5, borderRadius: "var(--r-1)" }}/>)}
            </div>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{t.len}</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", padding: "2px 7px", borderRadius: "var(--r-1)", textAlign: "center", letterSpacing: ".16em",
              background: t.status === "approved" ? "rgba(106,163,122,.15)" : t.status === "review" ? "rgba(216,163,66,.15)" : "var(--c-panel-2)",
              color: t.status === "approved" ? "var(--c-good)" : t.status === "review" ? "var(--c-warn)" : "var(--c-ink-3)" }}>{t.status.toUpperCase()}</span>
          </div>
        ))}
      </div>
      </div>
      <StageFooter ready={pipe.voice > 0 || pipe.locked} done={`${Math.max(0, pipe.voice)} voice lines ready`} hint="Record a line to continue" cta="Continue to Wardrobe" onContinue={onContinue}/>
    </div>
  );
}

// ─── Stage: DEPLOY ─────────────────────────────────────────────────────

function DeployStage({ active, pipe, onSendToScene, onExport, onMint }) {
  const minted = pipe.minted || (() => { try { return localStorage.getItem(`cina:actor-minted:${active.id}`) === "1"; } catch { return false; } })();
  const cards = [
    { h: "Send to scene", b: "Drop into a storyboard shot. Continuity carries.", cta: "Pick a shot", icon: "⊳", on: onSendToScene },
    { h: "Export card", b: `${pipe.refs} refs · ${pipe.stills} stills · ${pipe.voice} lines → handoff package.`, cta: "Export .json", icon: "⤓", on: onExport },
    { h: "Mint identity", b: "Mint the LoRA to a vault NFT. Royalties on every render.", cta: minted ? "✓ Minted" : "Mint NFT", icon: "◈", on: minted ? null : onMint },
  ];
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "22px 26px", background: "rgba(8,8,10,0.4)" }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>DEPLOY · {active.name}</div>
      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 4, marginBottom: 18 }}>Send the performer to work.</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {cards.map(d => (
          <div key={d.h} style={{ padding: 16, background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: "var(--fs-lead)", color: "var(--c-amber)" }}>{d.icon}</div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, color: "var(--c-ink)" }}>{d.h}</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5, flex: 1 }}>{d.b}</div>
            <button onClick={d.on || undefined} disabled={!d.on} style={{ ...topBtn, justifyContent: "center", marginTop: 4, cursor: d.on ? "pointer" : "default", opacity: d.on ? 1 : 0.6, borderColor: d.h === "Mint identity" && minted ? "var(--c-good)" : undefined, color: d.h === "Mint identity" && minted ? "var(--c-good)" : undefined }}>{d.cta}</button>
          </div>
        ))}
      </div>

      {/* Continuity */}
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 4 }}>CONTINUITY · WHERE THEY APPEAR</div>
      <div style={{ marginTop: 8 }}>
        {window.ContinuityTab ? <window.ContinuityTab character={active}/> : <Empty label="Continuity"/>}
      </div>
    </div>
  );
}

// ─── Inspectors for stills/motion/deploy ─────────────────────────────────

function StillsInspector({ pipe, onRender }) {
  const [light, setLight] = usV2("key");
  const [pose, setPose] = usV2("p1");
  const [prompt, setPrompt] = usV2("noir street, sodium streetlight, three-quarter from below, rain on asphalt");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <InspGroup label="ENGINE">
        <div style={{ padding: 10, background: "var(--c-bg)", border: "1px solid var(--c-amber)", borderRadius: "var(--r-1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>Flux 1.1 [pro] Ultra</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)" }}>$0.06/img</span>
          </div>
          <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 4 }}>Photoreal · native LoRA · 2k</div>
        </div>
      </InspGroup>
      <InspGroup label="PROMPT">
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} style={inspInp}/>
      </InspGroup>
      <InspGroup label="LIGHTING">
        <InspChips items={[["key","Key · 220°"],["rim","Rim · 90°"],["soft","Soft fill"],["harsh","Harsh noir"]]} value={light} onChange={setLight}/>
      </InspGroup>
      <InspGroup label="POSE">
        <InspChips items={[["p1","Three-quarter L"],["p2","Profile"],["p3","Direct"],["p4","Looking down"]]} value={pose} onChange={setPose}/>
      </InspGroup>
      <div style={{ padding: 10, background: "var(--c-bg)", border: `1px solid ${pipe.locked ? "var(--c-good)" : "var(--c-line-2)"}`, borderRadius: "var(--r-1)", fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }}>
        Identity guard <b style={{ color: pipe.locked ? "var(--c-good)" : "var(--c-ink-4)" }}>{pipe.locked ? "ON" : "OFF"}</b>{pipe.locked && ` · ${pipe.hash}`}
      </div>
    </div>
  );
}

function MotionInspector({ pipe, onRender }) {
  const [dur, setDur] = usV2(8);
  const [prompt, setPrompt] = usV2("She turns slowly, catching the rim light. Camera dollies in to a tight close-up.");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <InspGroup label="ENGINE">
        <div style={{ padding: 10, background: "var(--c-bg)", border: "1px solid var(--c-amber)", borderRadius: "var(--r-1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>Veo 3</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)" }}>$0.75/s</span>
          </div>
          <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 4 }}>Cinema I2V · native audio · 4K</div>
        </div>
      </InspGroup>
      <InspGroup label="SCENE PROMPT">
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} style={inspInp}/>
      </InspGroup>
      <InspGroup label={`DURATION · ${dur}s`}>
        <input type="range" min={2} max={10} step={2} value={dur} onChange={e => setDur(parseInt(e.target.value))} style={{ width: "100%", accentColor: tkc("amber") }}/>
      </InspGroup>
      <div style={{ padding: 10, background: "var(--c-bg)", border: `1px solid ${pipe.locked ? "var(--c-good)" : "var(--c-line-2)"}`, borderRadius: "var(--r-1)", fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }}>
        Identity guard <b style={{ color: pipe.locked ? "var(--c-good)" : "var(--c-ink-4)" }}>{pipe.locked ? "ON" : "OFF"}</b> · enforced per-frame
      </div>
    </div>
  );
}

function DeployInspector({ active, pipe }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <InspGroup label="CHAIN OF CUSTODY">
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55 }}>
          {active.name}'s LoRA + face embedding live on a vault NFT. The contract holder earns a royalty on every downstream render.
        </div>
      </InspGroup>
      <InspGroup label="LIKENESS HASH">
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: pipe.locked ? "var(--c-amber)" : "var(--c-ink-4)", padding: "8px 10px", background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)" }}>
          {pipe.hash || "— not locked —"}
        </div>
      </InspGroup>
      <InspGroup label="STATS">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[["Films", active.films || 0], ["Credits", active.credits || 0], ["Stills", pipe.stills], ["Clips", pipe.motion]].map(([k, v]) => (
            <div key={k} style={{ padding: "8px 10px", background: "var(--c-bg)", border: "1px solid var(--c-line)", borderRadius: "var(--r-1)" }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{k.toUpperCase()}</div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </InspGroup>
    </div>
  );
}

// ─── Inspector primitives ────────────────────────────────────────────────

function InspGroup({ label, children }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 8 }}><div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{label}</div>{children}</div>;
}
function InspChips({ items, value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {items.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} style={{
          padding: "6px 10px", fontSize: "var(--fs-label)",
          background: value === v ? "rgba(var(--accent-rgb),.12)" : "var(--c-bg)",
          border: `1px solid ${value === v ? "var(--c-amber)" : "var(--c-line-2)"}`,
          color: value === v ? "var(--c-amber)" : "var(--c-ink-2)", borderRadius: "var(--r-1)", cursor: "pointer",
          fontFamily: "var(--f-mono)", letterSpacing: ".08em",
        }}>{l}</button>
      ))}
    </div>
  );
}
const inspInp = {
  width: "100%", padding: "8px 10px", background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
  borderRadius: "var(--r-1)", color: "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)", outline: "none", resize: "vertical",
};

function Empty({ label }) {
  return <CinaEmpty compact title={label}/>;
}

// ─── Button styles ─────────────────────────────────────────────────────

const topBtn = {
  padding: "7px 12px", background: "transparent", border: "1px solid var(--c-line-2)",
  color: "var(--c-ink-2)", borderRadius: "var(--r-1)", cursor: "pointer",
  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
  display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
};
const primaryBtn = {
  padding: "8px 14px", background: "var(--c-amber)", color: tkc("on-amber"), border: "none",
  borderRadius: "var(--r-1)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
  letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
};
const rosterBtn = {
  flex: 1, padding: "7px 10px", background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
  color: "var(--c-ink-2)", borderRadius: "var(--r-1)", cursor: "pointer",
  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
};

// ─── Talent Market — license performers from other creators ──────────────
const TALENT_MARKET = [
  { castId: "calo-vey",    name: "Calo Vey",    role: "Lead",       owner: "Vermilion Pictures",  fee: 240, royalty: 8,  films: 14, note: "Weathered lead · noir & western range" },
  { castId: "domek-ari",   name: "Domek Ari",   role: "Character",  owner: "Nine Rivers Studio",  fee: 180, royalty: 6,  films: 22, note: "Character actor · comedic timing" },
  { castId: "rune-okafor", name: "Rune Okafor", role: "Lead",       owner: "Atlas & Co.",         fee: 320, royalty: 10, films: 9,  note: "Action lead · verified stunt library" },
  { castId: "wren-soto",   name: "Wren Soto",   role: "Supporting", owner: "Halcyon Films",       fee: 150, royalty: 6,  films: 31, note: "Ensemble · high continuity score" },
  { castId: "io-marsh",    name: "Io Marsh",    role: "Lead",       owner: "Longitude Media",     fee: 275, royalty: 9,  films: 12, note: "Dramatic lead · 40+ voice languages" },
  { castId: "siri-vale",   name: "Siri Vale",   role: "Lead",       owner: "Solstice House",      fee: 300, royalty: 10, films: 18, note: "A-list likeness · premium tier" },
];

function TalentMarket({ onClose, onLicense, owned }) {
  const [q, setQ] = usV2("");
  const list = TALENT_MARKET.filter(p => (p.name + p.owner + p.role).toLowerCase().includes(q.toLowerCase()));
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 90, background: "rgba(6,6,9,.82)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 28 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "min(920px, 100%)", maxHeight: "88%", display: "flex", flexDirection: "column", background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)" }}>TALENT MARKET</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 2 }}>License a performer from another creator</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 3 }}>Cast a verified star into your film. The owner is paid a license fee + a royalty on every render — automatically, via Stripe Connect.</div>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ flexShrink: 0 }} aria-label="Close" title="Close">Close ✕</button>
        </div>
        <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--c-line)" }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search performers or studios…" style={{
            width: "100%", padding: "9px 12px", background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink)", fontSize: "var(--fs-body)", outline: "none",
          }}/>
        </div>
        <div className="sc-scroll" style={{ flex: 1, overflowY: "auto", padding: 18, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {list.map(p => {
            const isOwned = (owned || []).some(c => c.id === "lic_" + p.castId);
            return (
              <div key={p.castId} style={{ border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden", background: "var(--c-bg)", display: "flex", flexDirection: "column" }}>
                <div style={{ position: "relative", aspectRatio: "4/3", background: tkc("bg") }}>
                  <img src={"assets/cast/" + p.castId + ".png"} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}/>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(8,8,10,.85))" }}/>
                  <span style={{ position: "absolute", top: 8, right: 8, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", padding: "2px 7px", background: "rgba(8,8,10,.7)", border: "1px solid var(--c-amber)", borderRadius: 999 }}>{p.royalty}% / render</span>
                  <div style={{ position: "absolute", left: 11, bottom: 9 }}>
                    <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: tkc("white") }}>{p.name}</div>
                    <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.72)" }}>{p.role.toUpperCase()} · {p.films} FILMS</div>
                  </div>
                </div>
                <div style={{ padding: "11px 13px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.45, flex: 1 }}>{p.note}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>© {p.owner}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>${p.fee}</span>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>license</span>
                    <span style={{ flex: 1 }}/>
                    <button onClick={() => onLicense(p)} disabled={isOwned} style={{
                      ...primaryBtn, height: 32, opacity: isOwned ? 0.5 : 1, cursor: isOwned ? "default" : "pointer",
                    }}>{isOwned ? "✓ Licensed" : "License →"}</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Override ────────────────────────────────────────────────────────────

window.VaultPanel = VaultPanelV2;
