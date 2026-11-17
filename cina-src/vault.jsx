// vault.jsx — Actor Vault: cast, audition, dress, deploy.
// 3-pane shell: Roster (left) · Stage (center, tabbed) · Inspector (right, tabbed)
// + version strip + QC HUD + top action bar.

const { useState: useStateV, useMemo: useMemoV, useEffect: useEffectV } = React;

// ─── Default attribute presets per character ────────────────────────

const DEFAULT_ATTRS = {
  c1: { age: 58, weight: 168, height: 71, build: 38, hair: 18, beard: 42, skin: 55, eyes: 75, posture: 32, gait: 48, voice: 92 },
  c2: { age: 34, weight: 124, height: 67, build: 18, hair: 65, beard: 0,  skin: 18, eyes: 0,  posture: 88, gait: 78, voice: 220 },
  c3: { age: 41, weight: 184, height: 70, build: 52, hair: 22, beard: 18, skin: 35, eyes: 0,  posture: 58, gait: 62, voice: 110 },
  c4: { age: 27, weight: 118, height: 66, build: 22, hair: 78, beard: 0,  skin: 12, eyes: 50, posture: 72, gait: 82, voice: 180 },
};

// ─── Default versions per character ────────────────────────────────

const DEFAULT_VERSIONS = {
  c1: [
    { id: "v1", label: "1.0", note: "First pass",          locked: true,  date: "Mar 14" },
    { id: "v2", label: "2.0", note: "Aged up, weathered",  locked: true,  date: "Mar 22" },
    { id: "v3", label: "3.0", note: "Hair shorter",        locked: false, date: "Apr 02" },
    { id: "v4", label: "3.2", note: "Active",              locked: false, date: "Apr 06" },
  ],
  c2: [
    { id: "v1", label: "1.0", note: "Cast",                locked: true,  date: "Mar 16" },
    { id: "v2", label: "1.4", note: "Active",              locked: false, date: "Apr 04" },
  ],
  c3: [
    { id: "v1", label: "1.0", note: "Cast",                locked: true,  date: "Mar 18" },
    { id: "v2", label: "1.2", note: "Active",              locked: false, date: "Apr 01" },
  ],
  c4: [
    { id: "v1", label: "1.0", note: "Active",              locked: false, date: "Mar 28" },
  ],
};

// ─── Procedural portrait — exposed for reuse ────────────────────────

function ActorPortraitImpl({ color, attrs }) {
  const skinTone = `oklch(${0.45 + attrs.skin / 400} 0.04 70)`;
  const hairLen = attrs.hair / 100;
  const beardOp = attrs.beard / 100;
  return (
    <svg viewBox="0 0 300 400" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <radialGradient id={`rim-${color}`} cx="100%" cy="50%" r="80%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
          <stop offset="60%" stopColor="var(--c-void)" stopOpacity="1"/>
        </radialGradient>
        <radialGradient id={`key-${color}`} cx="20%" cy="20%" r="70%">
          <stop offset="0%" stopColor= "var(--c-amber)" stopOpacity="0.55"/>
          <stop offset="100%" stopColor="var(--c-void)" stopOpacity="0"/>
        </radialGradient>
        <pattern id="vault-grain" width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill={tkc("white")} opacity="0.5"/>
          <rect width="1" height="1" fill={tkc("black")}/>
        </pattern>
      </defs>

      <rect width="300" height="400" fill="var(--c-void)"/>
      <rect width="300" height="400" fill={`url(#rim-${color})`}/>
      <rect width="300" height="400" fill={`url(#key-${color})`}/>

      <path d={`M 30 400 Q 60 ${320 - attrs.posture * 0.3} 150 ${310 - attrs.posture * 0.4} Q 240 ${320 - attrs.posture * 0.3} 270 400 Z`}
            fill={tkc("panel-2")} stroke="var(--c-line-3)" strokeWidth="0.5"/>
      <path d="M 130 320 L 150 340 L 170 320 L 165 360 L 135 360 Z" fill={tkc("bg")}/>
      <rect x="130" y="270" width="40" height="50" fill={skinTone} opacity="0.6"/>
      <ellipse cx="150" cy={210 - attrs.height * 0.3} rx={60 + attrs.build * 0.15} ry={80 - attrs.build * 0.05} fill={skinTone}/>
      <path d={`M 150 ${130 - attrs.height * 0.3} Q 90 ${210 - attrs.height * 0.3} 150 ${290 - attrs.height * 0.3} Z`}
            fill="var(--c-void)" opacity="0.7"/>
      {hairLen > 0.1 && (
        <path d={`M ${90 - hairLen * 10} ${190 - attrs.height * 0.3} Q 150 ${130 - attrs.height * 0.3 - hairLen * 30} ${210 + hairLen * 10} ${190 - attrs.height * 0.3} Q ${210 + hairLen * 30} ${230 - attrs.height * 0.3 + hairLen * 60} 150 ${260 - attrs.height * 0.3 + hairLen * 80} Q ${90 - hairLen * 30} ${230 - attrs.height * 0.3 + hairLen * 60} ${90 - hairLen * 10} ${190 - attrs.height * 0.3}`}
              fill={tkc("on-amber")} opacity={0.7 + hairLen * 0.3}/>
      )}
      {beardOp > 0.1 && (
        <ellipse cx="150" cy={250 - attrs.height * 0.3} rx={45} ry={20 + beardOp * 15} fill={tkc("on-amber")} opacity={beardOp * 0.85}/>
      )}
      <ellipse cx="125" cy={200 - attrs.height * 0.3} rx="6" ry="3" fill="var(--c-void)"/>
      <ellipse cx="175" cy={200 - attrs.height * 0.3} rx="6" ry="3" fill="var(--c-void)"/>
      <circle cx="177" cy={199 - attrs.height * 0.3} r="0.8" fill= "var(--c-amber)"/>
      <path d={`M 150 ${205 - attrs.height * 0.3} L 145 ${235 - attrs.height * 0.3} L 155 ${235 - attrs.height * 0.3} Z`} fill="var(--c-void)" opacity="0.5"/>
      <line x1="138" y1={252 - attrs.height * 0.3} x2="162" y2={252 - attrs.height * 0.3} stroke="var(--c-void)" strokeWidth="1.2" opacity="0.7"/>
      {Array.from({ length: Math.floor(attrs.skin / 20) }).map((_, i) => (
        <line key={i} x1={120 + i * 8} y1={222 + i * 3 - attrs.height * 0.3} x2={130 + i * 8} y2={224 + i * 3 - attrs.height * 0.3}
              stroke="var(--c-void)" strokeWidth="0.4" opacity="0.4"/>
      ))}
      <rect width="300" height="400" fill="url(#vault-grain)" opacity="0.07"/>
    </svg>
  );
}

function PortraitGlyphImpl({ color }) {
  return (
    <svg viewBox="0 0 38 50" style={{ width: "100%", height: "100%", display: "block" }}>
      <ellipse cx="19" cy="22" rx="11" ry="13" fill={color} opacity="0.4"/>
      <path d="M 5 50 Q 19 36 33 50 Z" fill={color} opacity="0.4"/>
      <ellipse cx="19" cy="22" rx="11" ry="13" fill="none" stroke={color} strokeWidth="0.8" opacity="0.7"/>
    </svg>
  );
}

Object.assign(window, { ActorPortraitImpl, PortraitGlyphImpl });
