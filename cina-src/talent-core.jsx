// talent-core.jsx — ONE talent registry for the whole platform.
//
// Before this file, four disconnected actor datasets existed:
//   CAST        (watch-cast.jsx)    — public performer profiles on Watch
//   CHARACTERS  (data.jsx)          — studio vault working cast
//   PT_ROSTER   (pitch-talent.jsx)  — licensable IP in the Pitch market
//   producer "actor stocks"         — synthesized from the above
//
// talent-core merges whatever sources exist on the current surface into
// window.TALENT, persists career events (licenses, mints, promotions,
// training) in ONE localStorage overlay shared by all three apps, and
// provides the cross-app handoff used to jump Watch → Studio vault and
// Watch/Studio → Pitch with an actor preselected.
//
// Load AFTER the data sources on each surface:
//   index.html: after watch-cast.jsx        Cina.html: after data.jsx
//   Pitch.html: after pitch-talent.jsx
//
// API (window.TalentAPI):
//   all() / get(id)            — normalized records
//   upsert(rec)                — add/patch + persist + notify
//   record(id, event)          — career event {kind:"license"|"mint"|"promo"|"train"|"style", ...}
//   stages(rec)                — 8-stage career state for the journey UI
//   handoff(payload) / takeHandoff() / peekHandoff()
//   subscribe(fn)              — re-render hook for React consumers

(function () {
  const LS_KEY = "cina:talent-v1";
  const HANDOFF_KEY = "cina:talent-handoff";

  const readOverlay = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
  };
  const writeOverlay = (o) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(o)); } catch {}
  };

  const slug = (name) => (name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // ── Normalize each source into one shape ────────────────────────────────
  function fromCast(a) {
    return {
      id: a.id, name: a.name, handle: a.handle,
      archetype: a.archetype, bio: a.bio, born: a.born,
      range: a.range, voice: a.voice, languages: a.languages,
      palette: a.palette, seed: a.seed,
      skin: a.skin, hair: a.hair, hairStyle: a.hairStyle, eyes: a.eyes, lipColor: a.lipColor,
      followers: a.followers || 0, appearances: a.appearances || 0,
      awards: a.awards || [], roles: a.roles || [],
      origin: "watch",
      licensing: { base: 1400 + ((a.seed || 1) % 9) * 200, royalty: 24 + ((a.seed || 1) % 7), out: ((a.seed || 7) * 13) % 160 },
    };
  }
  function fromCharacter(c) {
    return {
      id: "studio-" + c.id, studioId: c.id,
      name: c.name, archetype: c.role || c.archetype,
      bio: c.persona || c.notes || "",
      palette: [c.color || tkc("ink-3"), tkc("panel"), tkc("amber-x")],
      followers: 0, appearances: c.films || 0,
      roles: [], training: c.training || 0, credits: c.credits || 0,
      origin: "studio",
      licensing: { base: 900, royalty: 20, out: 0 },
    };
  }
  function fromRoster(p) {
    return {
      id: "ip-" + (p.id || slug(p.name)),
      name: p.name, archetype: p.tag || p.archetype,
      bio: p.line || p.bio || "", palette: [p.color || tkc("cat-6"), tkc("bg"), "var(--c-amber)"],
      followers: p.following || 0, appearances: p.films || 0,
      roles: [], origin: "pitch",
      licensing: { base: p.basePrice || p.base || p.price || 1900, royalty: p.royalty || 27, out: p.usages || p.licenses || 0 },
    };
  }

  // ── Build the registry from whatever exists here ────────────────────────
  function build() {
    const byKey = new Map(); // slug(name) -> record
    const put = (rec) => {
      const k = slug(rec.name);
      const prev = byKey.get(k);
      if (!prev) { byKey.set(k, rec); return; }
      // Merge: watch identity wins; studio adds training; pitch adds licensing
      const merged = { ...prev, ...Object.fromEntries(Object.entries(rec).filter(([, v]) => v != null)) };
      merged.origin = prev.origin === "watch" ? "watch" : rec.origin === "watch" ? "watch" : prev.origin;
      merged.id = prev.origin === "watch" ? prev.id : rec.origin === "watch" ? rec.id : prev.id;
      merged.licensing = { ...prev.licensing, ...(rec.licensing || {}) };
      merged.roles = (prev.roles && prev.roles.length ? prev.roles : rec.roles) || [];
      if (rec.studioId) merged.studioId = rec.studioId;
      byKey.set(k, merged);
    };

    (window.CAST || []).forEach(a => put(fromCast(a)));
    (window.CHARACTERS || []).forEach(c => put(fromCharacter(c)));
    (window.PT_ROSTER || []).forEach(p => put(fromRoster(p)));

    // Apply persisted overlay (user-birthed actors + career events)
    const overlay = readOverlay();
    Object.entries(overlay).forEach(([id, patch]) => {
      const existing = [...byKey.values()].find(r => r.id === id);
      if (existing) {
        Object.assign(existing, patch, {
          events: patch.events || existing.events || [],
          licensing: { ...existing.licensing, ...(patch.licensing || {}) },
        });
      } else if (patch.name) {
        byKey.set(slug(patch.name), { origin: "user", roles: [], licensing: { base: 900, royalty: 20, out: 0 }, ...patch, id });
      }
    });

    return [...byKey.values()];
  }

  let REGISTRY = build();
  const listeners = new Set();
  const notify = () => { REGISTRY = build(); listeners.forEach(fn => { try { fn(); } catch {} }); };

  // ── Career stages ────────────────────────────────────────────────────────
  // The one pipeline every performer moves through, everywhere on Cina.
  const STAGES = [
    { id: "birth",   label: "Birth",    desc: "Portrait, screen test, identity" },
    { id: "train",   label: "Train",    desc: "Continuity LoRA · range work" },
    { id: "style",   label: "Style",    desc: "Wardrobe · aging · looks" },
    { id: "mint",    label: "Mint",     desc: "Likeness NFT · on-chain ID" },
    { id: "license", label: "License",  desc: "Open for outside projects" },
    { id: "cast",    label: "Cast",     desc: "Roles in films & series" },
    { id: "promote", label: "Promote",  desc: "Commercials · campaigns" },
  ];

  function stages(rec) {
    const ev = rec.events || [];
    const has = (k) => ev.some(e => e.kind === k);
    return {
      birth:   true,
      train:   (rec.training || 0) >= 40 || rec.appearances > 0 || has("train"),
      style:   has("style") || rec.appearances > 2,
      mint:    !!rec.minted || has("mint"),
      license: (rec.licensing?.out || 0) > 0 || has("license"),
      cast:    (rec.roles || []).length > 0 || rec.appearances > 0,
      promote: has("promo"),
    };
  }
  function nextStage(rec) {
    const s = stages(rec);
    const order = ["train", "style", "mint", "license", "cast", "promote"];
    return order.find(k => !s[k]) || null;
  }

  // ── API ──────────────────────────────────────────────────────────────────
  const TalentAPI = {
    STAGES,
    all: () => REGISTRY,
    get: (id) => REGISTRY.find(r => r.id === id || r.studioId === id || slug(r.name) === slug(id)),
    stages, nextStage,

    upsert(rec) {
      const overlay = readOverlay();
      const id = rec.id || "user-" + slug(rec.name);
      overlay[id] = { ...(overlay[id] || {}), ...rec, id };
      writeOverlay(overlay);
      notify();
      return id;
    },

    record(id, event) {
      const rec = TalentAPI.get(id);
      const key = rec ? rec.id : id;
      const overlay = readOverlay();
      const prev = overlay[key] || {};
      const events = [...(prev.events || (rec && rec.events) || []), { ...event, at: Date.now() }];
      overlay[key] = { ...prev, events };
      if (event.kind === "mint") overlay[key].minted = true;
      if (event.kind === "license") {
        const base = (rec && rec.licensing) || {};
        overlay[key].licensing = { ...base, ...(prev.licensing || {}), out: ((prev.licensing && prev.licensing.out) || base.out || 0) + 1 };
      }
      writeOverlay(overlay);
      notify();
    },

    // Cross-app handoff: Watch → Studio vault, anywhere → Pitch create.
    handoff(payload) {
      try { localStorage.setItem(HANDOFF_KEY, JSON.stringify({ ...payload, at: Date.now() })); } catch {}
    },
    peekHandoff() {
      try {
        const h = JSON.parse(localStorage.getItem(HANDOFF_KEY) || "null");
        if (!h || Date.now() - h.at > 10 * 60 * 1000) return null; // 10-min TTL
        return h;
      } catch { return null; }
    },
    takeHandoff() {
      const h = TalentAPI.peekHandoff();
      try { localStorage.removeItem(HANDOFF_KEY); } catch {}
      return h;
    },

    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };

  // React hook for consumers
  function useTalent() {
    const [, force] = React.useState(0);
    React.useEffect(() => TalentAPI.subscribe(() => force(n => n + 1)), []);
    return TalentAPI.all();
  }

  Object.defineProperty(window, "TALENT", { get: () => REGISTRY, configurable: true });
  Object.assign(window, { TalentAPI, useTalent });
})();
