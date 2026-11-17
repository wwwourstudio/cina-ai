// cina-orb.jsx — Global CinaVoice + CinaCommand bus powered by Gemini neural TTS
// (/api/ai/tts · gemini-3.8-flash-lite-tts).
// Retires the legacy bottom-right floating orb & robotic window.speechSynthesis
// so Watch Party chat/submit buttons are never overlapped and Cina's voice sounds natural.
// UI is now unified inside CinaConciergeWidget mounted via cina-enhancer.ts.

(function () {
  const LS_ON = "cina:voice:on:v1";
  const LS_NAME = "cina:user:name:v1";

  const Bus = (() => {
    const subs = new Set();
    let state = "idle"; // idle | listening | thinking | speaking
    let level = 0;
    const emit = () => subs.forEach(fn => { try { fn(state, level); } catch (_) {} });
    return {
      get state() { return state; },
      get level() { return level; },
      setState(s) { if (s !== state) { state = s; emit(); } },
      setLevel(l) { level = l; },
      on(fn) { subs.add(fn); return () => subs.delete(fn); },
      emit,
    };
  })();

  // ─── Natural Neural Audio Player (gemini-3.8-flash-lite-tts via /api/ai/tts) ───
  let activeAudio = null;
  let activeAbort = null;

  function stopNeuralSpeech() {
    if (activeAbort) {
      try { activeAbort.abort(); } catch (_) {}
      activeAbort = null;
    }
    if (activeAudio) {
      try {
        activeAudio.pause();
        activeAudio.src = "";
      } catch (_) {}
      activeAudio = null;
    }
    Bus.setLevel(0);
    if (Bus.state === "speaking") Bus.setState("idle");
  }

  async function speakNeural(text, voiceName = "Kore", onEnd) {
    const clean = String(text || "").trim();
    if (!clean) {
      if (onEnd) onEnd();
      return;
    }
    stopNeuralSpeech();
    const controller = new AbortController();
    activeAbort = controller;
    Bus.setState("thinking");

    try {
      const resp = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: clean.slice(0, 900), voiceName: voiceName || "Kore" }),
        signal: controller.signal,
      });
      if (!resp.ok) throw new Error("TTS request failed");
      const data = await resp.json();
      if (!data?.audioDataUrl || controller.signal.aborted) {
        Bus.setState("idle");
        if (onEnd) onEnd();
        return;
      }
      const audio = new Audio(data.audioDataUrl);
      activeAudio = audio;
      audio.onplay = () => {
        Bus.setState("speaking");
        Bus.setLevel(0.75);
      };
      audio.onended = () => {
        if (activeAudio === audio) activeAudio = null;
        Bus.setLevel(0);
        Bus.setState("idle");
        if (onEnd) onEnd();
      };
      audio.onerror = () => {
        if (activeAudio === audio) activeAudio = null;
        Bus.setLevel(0);
        Bus.setState("idle");
        if (onEnd) onEnd();
      };
      await audio.play();
    } catch (_) {
      Bus.setLevel(0);
      Bus.setState("idle");
      if (onEnd) onEnd();
    }
  }

  // ─── Command Router (Preserves all Studio & Cross-Surface Voice/Chat Commands) ───
  const setView  = (v) => window.dispatchEvent(new CustomEvent("cina:setView",  { detail: v }));
  const setRoute = (r) => window.dispatchEvent(new CustomEvent("cina:setRoute", { detail: r }));
  const goPage   = (href) => { try { window.location.href = href; } catch (_) {} };

  const SURFACE_MAP = [
    { href: "index.html",        keys: ["watch", "cina watch", "films", "streaming", "the app", "home page", "watch home"] },
    { href: "Cina.html",         keys: ["studio", "the studio", "make a film", "production", "slate", "my films", "creator"] },
    { href: "Producers.html",    keys: ["producers", "producer market", "invest", "auction floor", "my stakes", "wallet", "collect", "nft"] },
    { href: "index.html#/about", keys: ["about", "about cina", "company", "our story"] },
  ];

  const VIEW_MAP = [
    { v: "chat",      keys: ["director", "chat", "the room", "talk to cina"] },
    { v: "pipeline",  keys: ["pipeline", "production line", "overview"] },
    { v: "bible",     keys: ["bible", "dna", "tone", "rules", "story bible"] },
    { v: "script",    keys: ["script", "screenplay", "writing", "the writer"] },
    { v: "episodes",  keys: ["episodes", "season", "the season"] },
    { v: "vault",     keys: ["vault", "cast", "casting", "performers", "wardrobe"] },
    { v: "board",     keys: ["board", "storyboard", "shots", "shot list"] },
    { v: "generate",  keys: ["generate", "render", "render floor", "queue", "takes"] },
    { v: "branch",    keys: ["branch", "fork", "branches", "fork tree"] },
    { v: "editor",    keys: ["editor", "edit", "assembly", "the cut", "timeline"] },
    { v: "cuts",      keys: ["cuts", "compare cuts", "versions"] },
    { v: "score",     keys: ["score", "music", "sound", "composer"] },
    { v: "titles",    keys: ["titles", "credits", "title design"] },
    { v: "deliver",   keys: ["deliver", "delivery", "masters", "export", "package"] },
    { v: "mint",      keys: ["mint", "minting", "release", "editions", "ownership"] },
    { v: "watch",     keys: ["watch page", "preview it", "how it looks"] },
    { v: "memory",    keys: ["memory", "what you learned", "my taste"] },
    { v: "autopilot", keys: ["autopilot", "auto pilot", "run it yourself"] },
  ];

  const ROUTE_MAP = [
    { r: "dashboard", keys: ["slate", "dashboard", "project picker", "back to slate"] },
    { r: "promo",     keys: ["promotion", "promo", "advertisers", "inbox"] },
    { r: "analytics", keys: ["analytics", "numbers", "performance", "stats"] },
    { r: "site",      keys: ["site", "my site", "public site", "watch page site"] },
  ];

  let voiceEnabled = localStorage.getItem(LS_ON) !== "0";
  window.__cinaSetOn = (v) => {
    voiceEnabled = !!v;
    try { localStorage.setItem(LS_ON, voiceEnabled ? "1" : "0"); } catch (_) {}
    if (!voiceEnabled) stopNeuralSpeech();
  };

  const CinaCommand = {
    run(raw) {
      const text = (raw || "").trim();
      if (!text) return null;
      const q = text.toLowerCase().replace(/[.,!?]/g, "");

      if (/\b(stop|quiet|shush|be quiet|stop talking|cancel)\b/.test(q)) { stopNeuralSpeech(); return null; }
      if (/\b(mute|silence)\b/.test(q)) { window.__cinaSetOn(false); return "Voice muted."; }
      if (/\b(unmute|speak again|talk to me)\b/.test(q)) { window.__cinaSetOn(true); return "Voice enabled."; }
      if (/\b(close|hide|dismiss)\b.*\b(voice|orb|chat|concierge)\b/.test(q)) {
        window.closeCinaConcierge && window.closeCinaConcierge();
        return null;
      }

      if (/\b(new film|new movie|new project|start a film|create a film)\b/.test(q)) { setRoute("new"); return "Starting a new film."; }
      if (/\b(command palette|search everything|find)\b/.test(q)) {
        if (window.toggleCinaAtlas) window.toggleCinaAtlas(true);
        else window.dispatchEvent(new CustomEvent("cina:studio-search"));
        return "Workspace search is open.";
      }
      if (/\b(design (the|my) site|build (a|my) site|site builder)\b/.test(q)) {
        goPage("index.html#/build");
        return "Opening the studio website builder.";
      }
      if (/\b(festival|submit (a|my) film|enter (a )?festival)\b/.test(q)) {
        goPage("index.html#/festival");
        return "Opening the Cina monthly film festival.";
      }

      const nav0 = q.replace(/^(go to|open|show me|show|take me to|jump to|switch to|bring up|pull up|visit)\s+(the\s+)?/, "");
      for (const s of SURFACE_MAP) {
        if (s.keys.some(k => nav0 === k)) {
          goPage(s.href);
          return "Opening " + s.keys[0] + ".";
        }
      }
      for (const r of ROUTE_MAP) {
        if (r.keys.some(k => nav0 === k)) {
          setRoute(r.r);
          return "Opening " + r.keys[0] + ".";
        }
      }
      for (const m of VIEW_MAP) {
        if (m.keys.some(k => nav0 === k)) {
          setRoute("studio");
          setTimeout(() => setView(m.v), 30);
          return "Opening " + m.keys[0] + ".";
        }
      }
      return null;
    },
  };

  window.CinaCommand = CinaCommand;
  window.CINA_USER = localStorage.getItem(LS_NAME) || "";

  // Make sure legacy data-orb attribute is never set
  try { delete document.body.dataset.orb; } catch (_) {}

  window.CinaVoice = {
    get enabled() { return voiceEnabled; },
    get state() { return Bus.state; },
    get userName() { return localStorage.getItem(LS_NAME) || ""; },
    setState: (s) => Bus.setState(s),
    think: () => Bus.setState("thinking"),
    idle: () => Bus.setState("idle"),
    stop: stopNeuralSpeech,
    open: () => {
      if (typeof window.openCinaConcierge === "function") window.openCinaConcierge("live");
    },
    close: () => {
      stopNeuralSpeech();
      if (typeof window.closeCinaConcierge === "function") window.closeCinaConcierge();
    },
    on: (fn) => Bus.on(fn),
    speak: (text, voiceName, onEnd) => {
      if (!voiceEnabled) {
        Bus.setState("idle");
        if (onEnd) onEnd();
        return;
      }
      speakNeural(text, typeof voiceName === "string" && voiceName !== "cina" ? voiceName : "Kore", onEnd);
    },
    listen: () => {
      if (typeof window.openCinaConcierge === "function") window.openCinaConcierge("live");
    },
    voiceId: "Kore",
  };

  window.CinaOrb = { mount: () => {} };
})();
