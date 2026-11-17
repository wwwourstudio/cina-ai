// app.jsx — Root: Studio shell + Display Mood sync + responsive form-factor switch.

const { useState: useStateA, useEffect: useEffectA } = React;

const TWEAK_DEFAULTS = {
  dark: true,
  letterbox: false,
  grain: true,
  vignette: true,
  agents: "labelled",
  density: "pro",
  projectState: "current",
  studioMode: "full",
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [w, setW] = useStateA(window.innerWidth);
  const cina = useCinaId();
  const [appAppearance] = window.useCinaAppearance ? window.useCinaAppearance() : [null];

  useEffectA(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Sync Display Mood from User Settings across Studio
  useEffectA(() => {
    if (window.CinaAppearance) {
      window.CinaAppearance.applyToDOM();
      const mood = appAppearance ? appAppearance.mood : window.CinaAppearance.get().mood;
      document.documentElement.dataset.theme = mood === "daylight" ? "light" : (t.dark ? "dark" : "light");
    } else {
      document.documentElement.dataset.theme = t.dark ? "dark" : "light";
    }
  }, [t.dark, appAppearance && appAppearance.mood]);

  const isMobile = w < 720;
  window.__cinaStudioMode = t.studioMode || "full";
  window.__setCinaStudioMode = (mode) => setTweak("studioMode", mode);
  window.__cinaTweaks = t;
  window.__setCinaTweak = setTweak;
  if (window.openPay && !window.openPayDrawer) window.openPayDrawer = window.openPay;

  // One identity across the building: Studio requires a signed-in Cina ID.
  if (!cina.signedIn) {
    return <CinaSignedOut surface="studio" accent="var(--c-amber)"/>;
  }

  return (
    <div className={t.letterbox ? "letterbox" : ""} style={{ height: "calc(100vh - var(--orb-safe, 0px))", width: "100%" }}>
      {isMobile ? <MobileApp/> : <Shell tweaks={t} setTweak={setTweak}/>}

      {/* Global overlays — modal layers on top of any view */}
      <PublishWizard/>
      <ShortcutsOverlay/>
      <CinaCommandPalette/>
      {window.ActorAgentHost && <window.ActorAgentHost/>}
      {window.PayDrawer && <window.PayDrawer/>}

      {t.grain && <div className="grain"/>}
      {t.vignette && <div className="vignette"/>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
