// ── MODULE: primitives.jsx ──
;(function() {
const { useState, useEffect, useRef, useMemo, useCallback } = React;
function Icon({ name, size = 14, className }) {
  const s = size;
  const props = {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className
  };
  switch (name) {
    case "play":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M7.5 4.8a1 1 0 0 1 1.52-.85l11.2 7.2a1 1 0 0 1 0 1.7l-11.2 7.2A1 1 0 0 1 7.5 19.2z", fill: "currentColor", stroke: "none" }));
    case "pause":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("rect", { x: "6.5", y: "4.5", width: "3.8", height: "15", rx: "1", fill: "currentColor", stroke: "none" }), /* @__PURE__ */ React.createElement("rect", { x: "13.7", y: "4.5", width: "3.8", height: "15", rx: "1", fill: "currentColor", stroke: "none" }));
    case "rec":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "5.5", fill: "currentColor", stroke: "none" }));
    case "chat":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M21 12a8.5 8.5 0 0 1-8.5 8.5 8.7 8.7 0 0 1-3.8-.85L4 21l1.35-4.7A8.5 8.5 0 1 1 21 12z" }));
    case "board":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "4", width: "7.5", height: "6.5", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "13.5", y: "4", width: "7.5", height: "6.5", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "3", y: "13.5", width: "7.5", height: "6.5", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "13.5", y: "13.5", width: "7.5", height: "6.5", rx: "1" }));
    case "book":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" }), /* @__PURE__ */ React.createElement("path", { d: "M5 17h14" }));
    case "vault":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "8.5" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5" }));
    case "ref":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "5", width: "18", height: "14", rx: "1.5" }), /* @__PURE__ */ React.createElement("path", { d: "M3 9.5h18" }), /* @__PURE__ */ React.createElement("circle", { cx: "7.5", cy: "14", r: "1.4", fill: "currentColor", stroke: "none" }));
    case "search":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("circle", { cx: "11", cy: "11", r: "6.5" }), /* @__PURE__ */ React.createElement("path", { d: "M16 16l4.2 4.2" }));
    case "send":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M21 3L10 14" }), /* @__PURE__ */ React.createElement("path", { d: "M21 3l-7 18-4-7-7-4z" }));
    case "plus":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M12 5.5v13M5.5 12h13" }));
    case "x":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M6.5 6.5l11 11M17.5 6.5l-11 11" }));
    case "check":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M5 12.5l4.5 4.5 9.5-10" }));
    case "chev-r":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M9.5 6l6 6-6 6" }));
    case "chev-d":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M6.5 9.5l5.5 5.5 5.5-5.5" }));
    case "chev-l":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M14.5 6l-6 6 6 6" }));
    case "settings":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" }));
    case "more":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("circle", { cx: "6", cy: "12", r: "1.4", fill: "currentColor", stroke: "none" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "1.4", fill: "currentColor", stroke: "none" }), /* @__PURE__ */ React.createElement("circle", { cx: "18", cy: "12", r: "1.4", fill: "currentColor", stroke: "none" }));
    case "drag":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("circle", { cx: "9", cy: "6", r: "1", fill: "currentColor", stroke: "none" }), /* @__PURE__ */ React.createElement("circle", { cx: "15", cy: "6", r: "1", fill: "currentColor", stroke: "none" }), /* @__PURE__ */ React.createElement("circle", { cx: "9", cy: "12", r: "1", fill: "currentColor", stroke: "none" }), /* @__PURE__ */ React.createElement("circle", { cx: "15", cy: "12", r: "1", fill: "currentColor", stroke: "none" }), /* @__PURE__ */ React.createElement("circle", { cx: "9", cy: "18", r: "1", fill: "currentColor", stroke: "none" }), /* @__PURE__ */ React.createElement("circle", { cx: "15", cy: "18", r: "1", fill: "currentColor", stroke: "none" }));
    case "upload":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M12 16V4M7 9l5-5 5 5M4 20h16" }));
    case "wand":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M4 20L15 9M17.5 3.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9zM6.5 4.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" }));
    case "film":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "4.5", width: "18", height: "15", rx: "1.5" }), /* @__PURE__ */ React.createElement("path", { d: "M7 4.5v15M17 4.5v15M3 9h4M17 9h4M3 15h4M17 15h4" }));
    case "actor":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "8", r: "3.8" }), /* @__PURE__ */ React.createElement("path", { d: "M4.5 20.5c1.2-3.8 4-5.5 7.5-5.5s6.3 1.7 7.5 5.5" }));
    case "globe":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "9" }), /* @__PURE__ */ React.createElement("path", { d: "M3 12h18M12 3c2.4 2.5 3.7 5.6 3.7 9s-1.3 6.5-3.7 9c-2.4-2.5-3.7-5.6-3.7-9S9.6 5.5 12 3z" }));
    case "lock":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("rect", { x: "5", y: "11", width: "14", height: "9.5", rx: "1.5" }), /* @__PURE__ */ React.createElement("path", { d: "M8 11V7a4 4 0 0 1 8 0v4" }));
    case "spark":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M12 3l1.8 5.4L19 10.2l-5.2 1.8L12 17.5l-1.8-5.5L5 10.2l5.2-1.8z" }));
    case "sparkles":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M11 3l1.6 4.2L17 9l-4.4 1.8L11 15l-1.6-4.2L5 9l4.4-1.8z" }), /* @__PURE__ */ React.createElement("path", { d: "M18 14l.8 2 2 .8-2 .8L18 20l-.8-2.4L15 17l2.2-1z" }));
    case "reload":
    case "refresh":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M4 12a8 8 0 0 1 13.8-5.5L20 9" }), /* @__PURE__ */ React.createElement("path", { d: "M20 4v5h-5" }), /* @__PURE__ */ React.createElement("path", { d: "M20 12a8 8 0 0 1-13.8 5.5L4 15" }), /* @__PURE__ */ React.createElement("path", { d: "M4 20v-5h5" }));
    case "dot":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "3", fill: "currentColor", stroke: "none" }));
    case "circle":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "8" }));
    case "ticket":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" }), /* @__PURE__ */ React.createElement("path", { d: "M14 6.5v11", strokeDasharray: "2 2" }));
    case "vol":
    case "sound":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M11 5L6 9H3v6h3l5 4z" }), /* @__PURE__ */ React.createElement("path", { d: "M15.5 8.5a5 5 0 0 1 0 7M18.8 5.8a9 9 0 0 1 0 12.4" }));
    case "mute":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M11 5L6 9H3v6h3l5 4z" }), /* @__PURE__ */ React.createElement("path", { d: "M21 9l-5 6M16 9l5 6" }));
    case "apple":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M16 4c-1.5 0-2.8.8-3.5 2-.7-1.2-2-2-3.5-2C6.5 4 4 6.5 4 10c0 4 4 10 8 10s8-6 8-10c0-3.5-2.5-6-4-6z", fill: "currentColor", stroke: "none" }));
    case "share":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M4 13v6a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-6" }), /* @__PURE__ */ React.createElement("path", { d: "M16 7l-4-4-4 4M12 3v12" }));
    case "shuffle":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M16 3h5v5M21 3l-7 7M16 21h5v-5M21 21l-5-5M3 4l5 5M3 20l5-5" }));
    case "alert":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M12 3.5l9.5 16.5h-19z" }), /* @__PURE__ */ React.createElement("path", { d: "M12 9.5v4.5M12 17v.5" }));
    case "shield":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" }));
    case "clock":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "8.5" }), /* @__PURE__ */ React.createElement("path", { d: "M12 7v5l3.2 2" }));
    case "type":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M5 6h14M12 6v14M9 20h6" }));
    case "edit":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M4 20h4L19 9l-4-4L4 16z" }), /* @__PURE__ */ React.createElement("path", { d: "M13.5 6.5l4 4" }));
    case "grid":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("rect", { x: "3.5", y: "3.5", width: "7", height: "7", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "13.5", y: "3.5", width: "7", height: "7", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "3.5", y: "13.5", width: "7", height: "7", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "13.5", y: "13.5", width: "7", height: "7", rx: "1" }));
    case "close":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M6.5 6.5l11 11M17.5 6.5l-11 11" }));
    case "bell":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M6 16v-5a6 6 0 0 1 12 0v5l1.8 2H4.2z" }), /* @__PURE__ */ React.createElement("path", { d: "M10 20a2 2 0 0 0 4 0" }));
    case "apps":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M4 7h16M4 12h16M4 17h16" }));
    case "heart":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M12 20.2s-7-4.5-9.2-8.8A4.9 4.9 0 0 1 12 6.2a4.9 4.9 0 0 1 9.2 5.2c-2.2 4.3-9.2 8.8-9.2 8.8z" }));
    case "user":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "8", r: "3.8" }), /* @__PURE__ */ React.createElement("path", { d: "M4.5 20.5c1.2-3.8 4-5.5 7.5-5.5s6.3 1.7 7.5 5.5" }));
    case "inbox":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M4 13h4l2 3h4l2-3h4" }), /* @__PURE__ */ React.createElement("path", { d: "M4 13l2-8h12l2 8v6H4z" }));
    case "wallet":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "6", width: "18", height: "13", rx: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M3 10h18" }), /* @__PURE__ */ React.createElement("circle", { cx: "16.5", cy: "14", r: "1.2", fill: "currentColor", stroke: "none" }));
    case "folder":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }));
    case "trend":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M3 17l6-6 4 4 7-8" }), /* @__PURE__ */ React.createElement("path", { d: "M20 7h-5M20 7v5" }));
    case "arrow-right":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M5 12h14M13 6l6 6-6 6" }));
    case "coin":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "8.5" }), /* @__PURE__ */ React.createElement("path", { d: "M14.5 9.5c-.4-.9-1.4-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2s1.1 1.6 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1.1 0-2.1-.6-2.5-1.5M12 6.5V8M12 16v1.5" }));
    case "rows":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("rect", { x: "4", y: "5", width: "16", height: "4", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "4", y: "15", width: "16", height: "4", rx: "1" }));
    case "doc":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M6 3h8l4 4v14H6z" }), /* @__PURE__ */ React.createElement("path", { d: "M14 3v4h4M9 12h6M9 16h6" }));
    case "scissors":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("circle", { cx: "6", cy: "7", r: "2.5" }), /* @__PURE__ */ React.createElement("circle", { cx: "6", cy: "17", r: "2.5" }), /* @__PURE__ */ React.createElement("path", { d: "M8 8.5L20 18M8 15.5L20 6" }));
    case "music":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M9 18V5l11-2v13" }), /* @__PURE__ */ React.createElement("circle", { cx: "6.5", cy: "18", r: "2.5" }), /* @__PURE__ */ React.createElement("circle", { cx: "17.5", cy: "16", r: "2.5" }));
    case "diamond":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M12 3l9 9-9 9-9-9z" }));
    case "tag":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M3 12V4h8l10 10-8 8z" }), /* @__PURE__ */ React.createElement("circle", { cx: "7.5", cy: "8.5", r: "1.3", fill: "currentColor", stroke: "none" }));
    case "archive":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "4", width: "18", height: "4", rx: "1" }), /* @__PURE__ */ React.createElement("path", { d: "M5 8v11h14V8M10 12h4" }));
    case "robot":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("rect", { x: "5", y: "8", width: "14", height: "11", rx: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M12 4v4M9 13v1M15 13v1M3 12v3M21 12v3" }));
    case "key":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("circle", { cx: "8", cy: "14", r: "4" }), /* @__PURE__ */ React.createElement("path", { d: "M11 11l9-9M17 5l2 2M15 7l2 2" }));
    case "home":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M4 11l8-7 8 7v9h-5v-6H9v6H4z" }));
    case "users":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("circle", { cx: "9", cy: "8", r: "3.4" }), /* @__PURE__ */ React.createElement("path", { d: "M3 20c.8-3.5 3.2-5.4 6-5.4s5.2 1.9 6 5.4" }), /* @__PURE__ */ React.createElement("path", { d: "M16 4.8a3.4 3.4 0 0 1 0 6.8M18.2 14.8c1.5.7 2.5 2.5 2.8 5.2" }));
    case "sliders":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M4 7h10M18 7h2M4 17h4M12 17h8" }), /* @__PURE__ */ React.createElement("circle", { cx: "16", cy: "7", r: "2" }), /* @__PURE__ */ React.createElement("circle", { cx: "10", cy: "17", r: "2" }));
    case "download":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M12 4v12M7 11l5 5 5-5M4 20h16" }));
    case "bookmark":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.2L5.5 20.5v-16a1 1 0 0 1 1-1z" }));
    case "bookmark-fill":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.2L5.5 20.5v-16a1 1 0 0 1 1-1z", fill: "currentColor", stroke: "currentColor" }));
    case "calendar":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "5", width: "18", height: "16", rx: "1.5" }), /* @__PURE__ */ React.createElement("path", { d: "M3 10h18M8 3v4M16 3v4" }));
    case "mic":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("rect", { x: "9", y: "3", width: "6", height: "11", rx: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v3.5" }));
    case "captions":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M10 10.5a2 2 0 1 0 0 3M16 10.5a2 2 0 1 0 0 3" }));
    case "fullscreen":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" }));
    case "flag":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M5 21V4M5 4h12l-2 4 2 4H5" }));
    case "compass":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "9" }), /* @__PURE__ */ React.createElement("polygon", { points: "16.2 7.8 14.1 14.1 7.8 16.2 9.9 9.9 16.2 7.8" }));
    case "eye":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "2.8" }));
    case "info":
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "9" }), /* @__PURE__ */ React.createElement("path", { d: "M12 11v5M12 8h.01" }));
    default:
      return /* @__PURE__ */ React.createElement("svg", { ...props }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "2.5", fill: "currentColor", stroke: "none" }));
  }
}
function AgentBadge({ agent, size = 22 }) {
  const a = window.AGENTS.find((x) => x.id === agent) || { glyph: "C", color: "var(--c-amber)", name: "Cina" };
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      title: a.name,
      style: {
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--c-panel-2)",
        border: `1.5px solid ${a.color}`,
        color: a.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--f-mono)",
        fontSize: size * 0.42,
        fontWeight: 600,
        letterSpacing: 0,
        flexShrink: 0
      }
    },
    a.glyph
  );
}
function CinaMark({ size = 26, color = "var(--c-ink)" }) {
  return /* @__PURE__ */ React.createElement("span", { style: {
    fontFamily: "var(--f-display)",
    fontStyle: "italic",
    fontWeight: 400,
    fontSize: size,
    lineHeight: 1,
    color,
    letterSpacing: "-0.01em",
    flexShrink: 0,
    display: "inline-block"
  } }, "Cina");
}
function CinaBadge({ size = 28 }) {
  return /* @__PURE__ */ React.createElement(CinaMark, { size });
}
const C = "assets/covers/";
const THUMB_IMAGES = {
  // ── Noir / urban night ──
  "noir-m": C + "a1.png",
  // man, wet street, dusk
  "noir-f": C + "a4.png",
  // woman, wet alley, night
  "face-night": C + "d1.png",
  // intense face, neon night
  "alley-night": C + "d4.png",
  // man, cobblestone alley, night
  // ── Mood / interior / mystery ──
  "lantern": C + "a2.png",
  // lantern in dark forest
  "window-rain": C + "a3.png",
  // woman at rainy window
  "interior-dim": C + "d2.png",
  // dim room interior
  "scared-hall": C + "d3.png",
  // couple in hallway, fear
  // ── Western ──
  "west-rider": C + "b1.png",
  // lone rider, mesa, sunset
  "west-riders": C + "b2.png",
  // posse, monument valley
  "west-canyon": C + "b3.png",
  // rider in dusty canyon
  "west-dusk": C + "b4.png",
  // figure + horse, dead tree
  // ── Sci-fi ──
  "sci-surface": C + "c1.png",
  // astronauts, red planet
  "sci-neon": C + "c2.png",
  // explorer, neon alien world
  "sci-ship": C + "c3.png",
  // astronaut, ship porthole
  "sci-city": C + "c4.png",
  // figure over future city
  // ── Legacy keys (series episodes & ad-hoc) mapped onto the new stills ──
  "darkroom-wide": C + "a3.png",
  "darkroom-est": C + "a4.png",
  "developer": C + "d2.png",
  "voss-eye": C + "d1.png",
  "voss-enter": C + "a1.png",
  "the-photo": C + "a3.png",
  "phone": C + "c3.png",
  "frequency": C + "c2.png",
  "swallows": C + "a3.png",
  "noir": C + "a4.png",
  "thriller": C + "d4.png",
  "western": C + "b1.png",
  "drama": C + "a3.png",
  "earth": C + "c1.png",
  "cosmos": C + "c4.png",
  "ice": C + "c1.png",
  "vacuum": C + "c3.png",
  "dunes": C + "b4.png",
  "horizon": C + "b3.png"
};
const _THUMB_FALLBACK = [
  C + "a1.png",
  C + "a2.png",
  C + "a3.png",
  C + "a4.png",
  C + "b1.png",
  C + "b3.png",
  C + "c1.png",
  C + "c3.png",
  C + "d1.png",
  C + "d2.png",
  C + "d4.png",
  C + "b4.png"
];
function _photoForKind(kind) {
  if (THUMB_IMAGES[kind]) return THUMB_IMAGES[kind];
  if (!kind) return _THUMB_FALLBACK[0];
  let h = 0;
  for (let i = 0; i < kind.length; i++) h = h * 31 + kind.charCodeAt(i) | 0;
  return _THUMB_FALLBACK[Math.abs(h) % _THUMB_FALLBACK.length];
}
function FrameThumb({ kind, w = 220, h = 124, label, usePhoto = false }) {
  const photo = usePhoto ? _photoForKind(kind) : null;
  if (photo) {
    return /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: "100%", height: "100%", overflow: "hidden", background: tkc("bg") } }, /* @__PURE__ */ React.createElement(
      "img",
      {
        src: photo,
        alt: label || kind,
        style: { width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "saturate(.9) contrast(1.05)" }
      }
    ), label && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 8, bottom: 6, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: tkc("white"), textShadow: "0 1px 4px rgba(0,0,0,.8)" } }, label));
  }
  const compositions = {
    "darkroom-est": /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { width: "100%", height: "100%", fill: tkc("bg") }), /* @__PURE__ */ React.createElement("rect", { x: "0", y: "60%", width: "100%", height: "40%", fill: tkc("bg") }), /* @__PURE__ */ React.createElement("rect", { x: "20%", y: "20%", width: "60%", height: "50%", fill: tkc("panel") }), /* @__PURE__ */ React.createElement("rect", { x: "38%", y: "32%", width: "6%", height: "9%", fill: "var(--c-amber)", opacity: "0.85" }), /* @__PURE__ */ React.createElement("rect", { x: "50%", y: "42%", width: "4%", height: "6%", fill: "var(--c-amber)", opacity: "0.5" }), /* @__PURE__ */ React.createElement("circle", { cx: "14%", cy: "58%", r: "7", fill: "var(--c-amber)", opacity: "0.9" }), /* @__PURE__ */ React.createElement("circle", { cx: "14%", cy: "58%", r: "22", fill: "var(--c-amber)", opacity: "0.18" }), Array.from({ length: 18 }).map(
      (_, i) => /* @__PURE__ */ React.createElement("line", { key: i, x1: `${(i * 7 + 3) % 100}%`, y1: `${i * 13 % 100}%`, x2: `${(i * 7 + 3) % 100 - 2}%`, y2: `${i * 13 % 100 + 8}%`, stroke: "var(--c-agent-writer)", strokeWidth: "0.5", opacity: "0.25" })
    )),
    "voss-enter": /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { width: "100%", height: "100%", fill: tkc("on-amber") }), /* @__PURE__ */ React.createElement("rect", { width: "100%", height: "100%", fill: "url(#redwash)", opacity: "0.7" }), /* @__PURE__ */ React.createElement("rect", { x: "42%", y: "15%", width: "16%", height: "80%", fill: "var(--c-void)" }), /* @__PURE__ */ React.createElement("ellipse", { cx: "50%", cy: "38%", rx: "10", ry: "12", fill: "var(--c-void)" }), /* @__PURE__ */ React.createElement("rect", { x: "44%", y: "48%", width: "12%", height: "40%", fill: "var(--c-void)" }), /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("radialGradient", { id: "redwash", cx: "50%", cy: "50%", r: "60%" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: "var(--c-blood)" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: tkc("on-amber") })))),
    "developer": /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { width: "100%", height: "100%", fill: tkc("bg") }), /* @__PURE__ */ React.createElement("rect", { x: "10%", y: "55%", width: "80%", height: "40%", fill: tkc("on-amber"), stroke: "var(--c-blood)", strokeWidth: "0.5" }), /* @__PURE__ */ React.createElement("rect", { x: "32%", y: "58%", width: "36%", height: "24%", fill: "var(--c-agent-writer)", opacity: "0.7" }), /* @__PURE__ */ React.createElement("rect", { x: "38%", y: "62%", width: "24%", height: "16%", fill: tkc("panel-2") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "50%", cy: "80%", rx: "60", ry: "3", fill: "none", stroke: "var(--c-blood)", strokeWidth: "0.5", opacity: "0.5" }), /* @__PURE__ */ React.createElement("ellipse", { cx: "50%", cy: "80%", rx: "80", ry: "4", fill: "none", stroke: "var(--c-blood)", strokeWidth: "0.5", opacity: "0.3" }), /* @__PURE__ */ React.createElement("circle", { cx: "85%", cy: "15%", r: "14", fill: "var(--c-blood-l)", opacity: "0.6" })),
    "voss-eye": /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { width: "100%", height: "100%", fill: "var(--c-void)" }), /* @__PURE__ */ React.createElement("ellipse", { cx: "50%", cy: "50%", rx: "60", ry: "22", fill: tkc("panel-2") }), /* @__PURE__ */ React.createElement("circle", { cx: "50%", cy: "50%", r: "20", fill: tkc("line-2") }), /* @__PURE__ */ React.createElement("circle", { cx: "50%", cy: "50%", r: "9", fill: "var(--c-void)" }), /* @__PURE__ */ React.createElement("circle", { cx: "48%", cy: "46%", r: "2", fill: "var(--c-amber)" }), Array.from({ length: 9 }).map(
      (_, i) => /* @__PURE__ */ React.createElement("line", { key: i, x1: `${42 + i * 2}%`, y1: "38%", x2: `${42 + i * 2}%`, y2: "34%", stroke: "var(--c-void)", strokeWidth: "1" })
    )),
    "the-photo": /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { width: "100%", height: "100%", fill: tkc("on-amber") }), /* @__PURE__ */ React.createElement("rect", { x: "6%", y: "6%", width: "88%", height: "88%", fill: "var(--c-agent-writer)", opacity: "0.08" }), /* @__PURE__ */ React.createElement("rect", { x: "20%", y: "18%", width: "40%", height: "60%", fill: "var(--c-void)" }), /* @__PURE__ */ React.createElement("line", { x1: "40%", y1: "18%", x2: "40%", y2: "78%", stroke: tkc("line-2"), strokeWidth: "1" }), /* @__PURE__ */ React.createElement("line", { x1: "20%", y1: "48%", x2: "60%", y2: "48%", stroke: tkc("line-2"), strokeWidth: "1" }), /* @__PURE__ */ React.createElement("ellipse", { cx: "40%", cy: "38%", rx: "6", ry: "8", fill: "var(--c-agent-writer)", opacity: "0.85" }), /* @__PURE__ */ React.createElement("rect", { x: "36%", y: "44%", width: "8%", height: "24%", fill: "var(--c-agent-writer)", opacity: "0.7" }), /* @__PURE__ */ React.createElement("ellipse", { cx: "55%", cy: "42%", rx: "5", ry: "7", fill: "var(--c-void)", opacity: "0.85" }), /* @__PURE__ */ React.createElement("rect", { x: "52%", y: "48%", width: "6%", height: "20%", fill: "var(--c-void)", opacity: "0.7" })),
    "darkroom-wide": /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { width: "100%", height: "100%", fill: tkc("void") }), /* @__PURE__ */ React.createElement("polygon", { points: "0,0 100,0 70,40 30,40", fill: tkc("on-amber"), opacity: "0.4" }), /* @__PURE__ */ React.createElement("polygon", { points: "0,100 100,100 70,60 30,60", fill: tkc("on-amber"), opacity: "0.4" }), [15, 32, 50, 68, 85].map(
      (x, i) => /* @__PURE__ */ React.createElement("g", { key: i }, /* @__PURE__ */ React.createElement("line", { x1: `${x}%`, y1: "20%", x2: `${x}%`, y2: "35%", stroke: "var(--c-line-3)", strokeWidth: "0.5" }), /* @__PURE__ */ React.createElement("rect", { x: `${x - 3}%`, y: "30%", width: "6%", height: "9%", fill: tkc("on-amber"), stroke: tkc("line-2"), strokeWidth: "0.3" }))
    ), /* @__PURE__ */ React.createElement("ellipse", { cx: "50%", cy: "78%", rx: "4", ry: "5", fill: "var(--c-void)" }), /* @__PURE__ */ React.createElement("rect", { x: "46%", y: "80%", width: "8%", height: "14%", fill: "var(--c-void)" }), /* @__PURE__ */ React.createElement("rect", { width: "100%", height: "100%", fill: "var(--c-blood)", opacity: "0.18" })),
    "timestamp": /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { width: "100%", height: "100%", fill: tkc("bg") }), /* @__PURE__ */ React.createElement("circle", { cx: "50%", cy: "50%", r: "42", fill: tkc("panel-2"), stroke: "var(--c-line-3)", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("circle", { cx: "50%", cy: "50%", r: "10", fill: "var(--c-void)" }), /* @__PURE__ */ React.createElement("rect", { x: "28%", y: "42%", width: "44%", height: "16%", fill: tkc("bg"), stroke: "var(--c-amber)", strokeWidth: "0.5" }), /* @__PURE__ */ React.createElement("text", { x: "50%", y: "52%", textAnchor: "middle", fill: "var(--c-amber)", fontFamily: "JetBrains Mono, monospace", fontSize: "9", fontWeight: "600" }, "05\xB707\xB726 \xB7 02:14")),
    "phone": /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { width: "100%", height: "100%", fill: tkc("bg") }), /* @__PURE__ */ React.createElement("rect", { x: "0", y: "65%", width: "100%", height: "35%", fill: tkc("on-amber") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "50%", cy: "65%", rx: "40", ry: "6", fill: tkc("line-2") }), /* @__PURE__ */ React.createElement("rect", { x: "38%", y: "55%", width: "24%", height: "14%", rx: "2", fill: "var(--c-void)" }), /* @__PURE__ */ React.createElement("circle", { cx: "50%", cy: "58%", r: "6", fill: "var(--c-line-3)" }), /* @__PURE__ */ React.createElement("path", { d: "M 30,30 Q 45,25 50,40", fill: "none", stroke: "var(--c-void)", strokeWidth: "14", strokeLinecap: "round", opacity: "0.95" }), /* @__PURE__ */ React.createElement("circle", { cx: "80%", cy: "20%", r: "22", fill: "var(--c-amber)", opacity: "0.25" }))
  };
  const composition = compositions[kind] || compositions["darkroom-est"];
  return /* @__PURE__ */ React.createElement(
    "svg",
    {
      viewBox: `0 0 ${w} ${h}`,
      preserveAspectRatio: "xMidYMid slice",
      style: { width: "100%", height: "100%", display: "block" }
    },
    composition,
    /* @__PURE__ */ React.createElement("rect", { width: "100%", height: "100%", fill: "url(#grain-pattern)", opacity: "0.06" }),
    /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("pattern", { id: "grain-pattern", width: "3", height: "3", patternUnits: "userSpaceOnUse" }, /* @__PURE__ */ React.createElement("rect", { width: "3", height: "3", fill: tkc("white"), opacity: "0.5" }), /* @__PURE__ */ React.createElement("rect", { width: "1", height: "1", fill: tkc("black") }), /* @__PURE__ */ React.createElement("rect", { x: "2", y: "1", width: "1", height: "1", fill: tkc("black") })))
  );
}
function StatusPill({ status }) {
  const map = {
    approved: { color: tkc("good"), label: "Approved" },
    review: { color: tkc("warn"), label: "Review" },
    draft: { color: tkc("ink-3"), label: "Draft" },
    queued: { color: "var(--c-ink-4)", label: "Queued" },
    rendering: { color: "var(--c-amber)", label: "Rendering" },
    rendered: { color: "var(--c-amber)", label: "Rendered \u2726" },
    active: { color: tkc("good"), label: "Active" },
    idle: { color: tkc("ink-3"), label: "Idle" }
  };
  const s = map[status] || map.draft;
  return /* @__PURE__ */ React.createElement("span", { style: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: "var(--fs-label)",
    fontFamily: "var(--f-mono)",
    textTransform: "uppercase",
    letterSpacing: ".08em",
    color: s.color,
    fontWeight: 500
  } }, /* @__PURE__ */ React.createElement("span", { style: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: s.color,
    boxShadow: `0 0 6px ${s.color}`
  } }), s.label);
}
function Slider({ value, min = 0, max = 100, step = 1, onChange, format }) {
  const pct = (value - min) / (max - min) * 100;
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, width: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "relative",
    flex: 1,
    height: 4,
    background: "var(--c-line)",
    borderRadius: "var(--r-1)"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: `${pct}%`,
    background: "var(--c-amber)",
    borderRadius: "var(--r-1)"
  } }), /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    left: `${pct}%`,
    top: "50%",
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "var(--c-ink)",
    border: "1px solid var(--c-amber-d)",
    transform: "translate(-50%, -50%)"
  } }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min,
      max,
      step,
      value,
      onChange: (e) => onChange?.(Number(e.target.value)),
      style: {
        position: "absolute",
        inset: -8,
        width: "calc(100% + 16px)",
        opacity: 0,
        cursor: "default"
      }
    }
  )), /* @__PURE__ */ React.createElement("span", { className: "t-mono t-num", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-2)", minWidth: 32, textAlign: "right" } }, format ? format(value) : value));
}
function SectionHead({ title, count, action, children }) {
  return /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 32px 14px"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" } }, title), count != null && /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)" } }, count)), action || children);
}
function FilmTile({
  thumb,
  color,
  title,
  subtitle,
  topLeft,
  topRight,
  overlay,
  footer,
  width,
  ratio = "16/9",
  onClick,
  showTitleOnImage = false,
  progress,
  selected,
  rating,
  trophyFilmId,
  // when set + film has won, shows a tiny award seal bottom-left
  meta,
  // optional 3rd line in meta zone (e.g. updated time)
  className,
  style
}) {
  const [hover, setHover] = useState(false);
  const [preview, setPreview] = useState(false);
  const prevT = useRef(null);
  const enter = () => {
    setHover(true);
    if (onClick) prevT.current = setTimeout(() => setPreview(true), 1200);
  };
  const leave = () => {
    setHover(false);
    setPreview(false);
    if (prevT.current) {
      clearTimeout(prevT.current);
      prevT.current = null;
    }
  };
  useEffect(() => () => {
    if (prevT.current) clearTimeout(prevT.current);
  }, []);
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      onMouseEnter: enter,
      onMouseLeave: leave,
      onClick,
      className,
      style: {
        appearance: "none",
        border: 0,
        padding: 0,
        margin: 0,
        background: "transparent",
        color: "inherit",
        textAlign: "left",
        cursor: onClick ? "pointer" : "default",
        width: width || "100%",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transform: hover && onClick ? "translateY(-4px)" : "translateY(0)",
        transition: "transform .22s cubic-bezier(.2,.7,.2,1)",
        ...style
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      position: "relative",
      aspectRatio: ratio,
      background: color || "var(--c-panel-2)",
      border: selected ? "1px solid var(--c-amber)" : hover && onClick ? "1px solid var(--c-line-3)" : "1px solid var(--c-line-2)",
      borderRadius: "var(--r-2)",
      overflow: "hidden",
      boxShadow: hover ? "0 18px 38px rgba(0,0,0,.6)" : "0 2px 6px rgba(0,0,0,.35)",
      transition: "box-shadow .22s ease, border-color .15s ease"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      inset: 0,
      transform: preview ? void 0 : hover && onClick ? "scale(1.06)" : "scale(1)",
      animation: preview ? "cinaTilePlay 9s ease-in-out both" : "none",
      transition: "transform .5s cubic-bezier(.2,.7,.2,1)"
    } }, typeof thumb === "string" ? /* @__PURE__ */ React.createElement(FrameThumb, { kind: thumb, usePhoto: true }) : thumb || null), preview && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("style", null, `@keyframes cinaTilePlay{0%{transform:scale(1.07) translate(0,0)}100%{transform:scale(1.16) translate(-2.5%,-1.5%)}}@keyframes cinaTileBar{from{transform:scaleY(0)}to{transform:scaleY(1)}}@keyframes cinaTileTC{from{width:0%}to{width:100%}}`), /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", style: { position: "absolute", left: 0, right: 0, top: 0, height: "9%", background: "rgba(4,3,3,.92)", transformOrigin: "top", animation: "cinaTileBar .45s ease both", zIndex: 2 } }), /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", style: { position: "absolute", left: 0, right: 0, bottom: 0, height: "9%", background: "rgba(4,3,3,.92)", transformOrigin: "bottom", animation: "cinaTileBar .45s ease both", zIndex: 2 } }), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { position: "absolute", top: 8, left: 8, zIndex: 3, display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: "var(--r-1)", background: "rgba(0,0,0,.72)", border: "1px solid rgba(255,255,255,.16)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: tkc("white") } }, /* @__PURE__ */ React.createElement("span", { style: { width: 5, height: 5, borderRadius: "50%", background: "var(--c-amber)", boxShadow: "0 0 6px var(--c-amber)", animation: "pulse-dot 1.4s ease-in-out infinite" } }), "PREVIEW \xB7 MUTED"), /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", style: { position: "absolute", left: 0, bottom: 0, height: 2, background: "var(--c-amber)", zIndex: 3, animation: "cinaTileTC 9s linear both" } })), /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      background: showTitleOnImage ? "linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.15) 55%, transparent 100%)" : hover ? "linear-gradient(to top, rgba(0,0,0,.7) 0%, rgba(0,0,0,.1) 50%, transparent 100%)" : "transparent",
      transition: "background .2s ease"
    } }), overlay, onClick && !overlay && !showTitleOnImage && /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: 10,
      right: 10,
      bottom: progress > 0 ? 10 : 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      pointerEvents: "none",
      opacity: hover ? 1 : 0,
      transform: hover ? "translateY(0)" : "translateY(4px)",
      transition: "opacity .18s cubic-bezier(.16,1,.3,1), transform .18s cubic-bezier(.16,1,.3,1)",
      zIndex: 3
    } }, /* @__PURE__ */ React.createElement("span", { style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 10px",
      borderRadius: 3,
      background: "rgba(10,10,12,.84)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,.18)",
      fontFamily: "var(--f-mono)",
      fontSize: "var(--fs-label)",
      letterSpacing: ".12em",
      textTransform: "uppercase",
      color: tkc("white")
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "play", size: 10 }), " Watch")), (() => {
      const hasTrophy = trophyFilmId && typeof topTrophy === "function" && topTrophy(trophyFilmId);
      const badges = (topLeft || []).filter(Boolean);
      if (!hasTrophy && !badges.length) return null;
      return /* @__PURE__ */ React.createElement("div", { style: {
        position: "absolute",
        top: 8,
        left: 8,
        display: "flex",
        alignItems: "center",
        gap: 5,
        flexWrap: "wrap",
        maxWidth: "80%",
        zIndex: 2
      } }, hasTrophy && typeof MiniTrophy === "function" && /* @__PURE__ */ React.createElement(MiniTrophy, { filmId: trophyFilmId, size: 20 }), badges);
    })(), topRight && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 8, right: 8, zIndex: 2 } }, topRight), showTitleOnImage && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 12, right: 12, bottom: 10, zIndex: 2 } }, /* @__PURE__ */ React.createElement("div", { className: "t-display", style: {
      fontStyle: "italic",
      fontSize: "var(--fs-lead)",
      fontWeight: 500,
      color: tkc("white"),
      lineHeight: 1.12,
      letterSpacing: "-0.01em",
      textShadow: "0 2px 12px rgba(0,0,0,.65)"
    } }, title), subtitle && /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: {
      fontSize: "var(--fs-label)",
      color: "rgba(255,255,255,.72)",
      marginTop: 3,
      letterSpacing: ".12em",
      textTransform: "uppercase"
    } }, subtitle)), progress > 0 && progress < 1 && /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 2,
      background: "rgba(255,255,255,.18)",
      zIndex: 3
    } }, /* @__PURE__ */ React.createElement("div", { style: { width: `${progress * 100}%`, height: "100%", background: "var(--c-amber)" } }))),
    !showTitleOnImage && /* @__PURE__ */ React.createElement("div", { style: { padding: "0 2px", display: "flex", flexDirection: "column", gap: 3 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { className: "t-display", style: {
      fontStyle: "italic",
      fontSize: "var(--fs-lead)",
      fontWeight: 400,
      color: hover && onClick ? "var(--c-amber)" : "var(--c-ink)",
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      transition: "color .15s ease",
      minWidth: 0
    } }, title), rating > 0 && /* @__PURE__ */ React.createElement("span", { className: "t-mono t-num", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-amber)" } }, "\u2605"), " ", Number(rating).toFixed(1))), subtitle && /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: "var(--fs-label)",
      color: "var(--c-ink-3)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    } }, subtitle), meta && /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: {
      fontSize: "var(--fs-label)",
      color: "var(--c-ink-4)",
      letterSpacing: ".08em",
      marginTop: 1
    } }, meta)),
    footer
  );
}
function TileBadge({ kind = "info", children, icon }) {
  const accent = kind === "amber" || kind === "live";
  return /* @__PURE__ */ React.createElement("span", { style: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "2px 6px",
    borderRadius: 2,
    background: "rgba(10,10,12,.76)",
    backdropFilter: "blur(8px)",
    border: `1px solid ${accent ? "rgba(232,163,61,.45)" : "rgba(255,255,255,.14)"}`,
    color: accent ? "var(--c-amber)" : "var(--c-ink-2)",
    fontFamily: "var(--f-mono)",
    fontSize: "0.62rem",
    letterSpacing: ".12em",
    textTransform: "uppercase"
  } }, icon && /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 10 }), children);
}
function Eyebrow({ children, tone = "amber", dot = true, style }) {
  const cls = "t-eyebrow" + (tone === "dim" ? " t-eyebrow--dim" : "") + (!dot ? " t-eyebrow--bare" : "");
  return /* @__PURE__ */ React.createElement("span", { className: cls, style }, children);
}
function ChapterMark({ num, kicker, title, note, style }) {
  return /* @__PURE__ */ React.createElement("div", { "data-cina-chapter": true, style: { padding: "56px var(--gutter) 4px", ...style } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 24,
    flexWrap: "wrap",
    paddingBottom: 16,
    borderBottom: "1px solid var(--c-line)",
    position: "relative"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement(Eyebrow, { dot: false }, "\u2014\u2014 Chapter ", num, kicker ? ` \xB7 ${kicker}` : ""), /* @__PURE__ */ React.createElement("h2", { className: "t-d-2", style: {
    margin: 0,
    color: "var(--c-ink)"
  } }, title)), note && /* @__PURE__ */ React.createElement("span", { className: "t-eyebrow t-eyebrow--bare t-eyebrow--dim", style: {
    paddingBottom: 6,
    flexShrink: 0
  } }, note), /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    left: 0,
    bottom: -1,
    width: 64,
    height: 2,
    background: "var(--c-amber)"
  } })));
}
function PageIntro({ kicker, title, lede, count, countLabel = "TITLES", style }) {
  return /* @__PURE__ */ React.createElement("section", { style: {
    padding: "44px var(--gutter) 36px",
    background: "var(--c-bg)",
    borderBottom: "1px solid var(--c-line)",
    position: "relative",
    ...style
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    left: 56,
    top: 44,
    width: 36,
    height: 2,
    background: "var(--c-amber)"
  } }), /* @__PURE__ */ React.createElement("div", { style: {
    maxWidth: "var(--w-page)",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: 32,
    alignItems: "flex-end"
  } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { paddingTop: 10, marginBottom: 14 } }, /* @__PURE__ */ React.createElement(Eyebrow, { dot: false }, kicker)), /* @__PURE__ */ React.createElement("h1", { className: "t-d-4", style: { margin: 0, color: "var(--c-ink)" } }, title, "."), lede && /* @__PURE__ */ React.createElement("p", { style: {
    margin: "16px 0 0",
    fontFamily: "var(--f-display)",
    fontStyle: "italic",
    fontSize: "var(--fs-lead)",
    lineHeight: 1.45,
    color: "var(--c-ink-2)",
    maxWidth: 620,
    letterSpacing: "-0.01em",
    textWrap: "pretty"
  } }, lede)), count != null && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 10, paddingBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { className: "t-d-3", style: { color: "var(--c-amber)" } }, count), /* @__PURE__ */ React.createElement("span", { className: "t-eyebrow t-eyebrow--bare t-eyebrow--dim" }, countLabel))));
}
function FromTheProgrammer({ film, variant = "block", style }) {
  const note = film && film.programmerNote;
  if (!note) return null;
  const who = typeof PROGRAMMER !== "undefined" && PROGRAMMER || { name: "Ada Beresford", role: "Editor-in-chief", initials: "AB" };
  if (variant === "inline") {
    return /* @__PURE__ */ React.createElement("div", { "data-cina-prog": "inline", style: {
      display: "flex",
      alignItems: "baseline",
      gap: 10,
      flexWrap: "wrap",
      maxWidth: 720,
      ...style
    } }, /* @__PURE__ */ React.createElement("span", { style: {
      fontFamily: "var(--f-mono)",
      fontSize: "var(--fs-label)",
      color: "var(--c-amber)",
      letterSpacing: ".16em",
      textTransform: "uppercase",
      fontWeight: 700,
      flexShrink: 0
    } }, "\u2014 FROM THE PROGRAMMER"), /* @__PURE__ */ React.createElement("span", { style: {
      fontFamily: "var(--f-display)",
      fontStyle: "italic",
      fontSize: "var(--fs-body)",
      color: "var(--c-ink-2)",
      lineHeight: 1.45,
      letterSpacing: "-0.01em"
    } }, '"', note, '"'));
  }
  return /* @__PURE__ */ React.createElement("div", { "data-cina-prog": "block", style: {
    margin: "0 0 36px",
    padding: "22px 26px",
    background: "var(--c-panel)",
    border: "1px solid var(--c-line)",
    borderLeft: "2px solid var(--c-amber)",
    borderRadius: "var(--r-2)",
    ...style
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    color: "var(--c-amber)",
    letterSpacing: ".16em",
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: 14
  } }, "FROM THE PROGRAMMER"), /* @__PURE__ */ React.createElement("p", { style: {
    margin: 0,
    fontFamily: "var(--f-display)",
    fontStyle: "italic",
    fontSize: "var(--fs-lead)",
    lineHeight: 1.5,
    color: "var(--c-ink)",
    letterSpacing: "-0.01em",
    textWrap: "pretty",
    maxWidth: 660
  } }, '"', note, '"'), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, marginTop: 18 } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--c-amber) 0%, transparent 80%)",
    border: "1px solid var(--c-line-2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--f-display)",
    fontStyle: "italic",
    fontSize: "var(--fs-body)",
    color: "var(--c-ink)",
    fontWeight: 500,
    flexShrink: 0
  } }, who.initials), /* @__PURE__ */ React.createElement("span", { style: {
    fontFamily: "var(--f-display)",
    fontStyle: "italic",
    fontSize: "var(--fs-lead)",
    color: "var(--c-ink)",
    letterSpacing: "-0.01em"
  } }, who.name), /* @__PURE__ */ React.createElement("span", { style: {
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    color: "var(--c-ink-4)",
    letterSpacing: ".16em",
    textTransform: "uppercase",
    paddingLeft: 12,
    borderLeft: "1px solid var(--c-line-2)"
  } }, who.role)));
}
function SurfaceSegment({ surface }) {
  const [narrow, setNarrow] = useState(() => window.innerWidth <= 767);
  useEffect(() => {
    const h = () => setNarrow(window.innerWidth <= 767);
    window.addEventListener("resize", h, { passive: true });
    return () => window.removeEventListener("resize", h);
  }, []);
  if (narrow) return null;
  const surfaces = (window.CINA_SURFACES || []).length ? window.CINA_SURFACES : [
    { id: "watch", label: "Watch", href: "index.html" },
    { id: "studio", label: "Studio", href: "Cina.html" },
    { id: "producers", label: "Producers", href: "Producers.html" }
  ];
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "stretch", height: "100%" } }, surfaces.map((s) => {
    const here = s.id === surface;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: s.id,
        onClick: () => {
          if (!here) window.location.href = s.href;
        },
        title: here ? void 0 : `Switch to ${s.label}`,
        style: {
          position: "relative",
          height: "100%",
          padding: "0 11px",
          background: "transparent",
          border: "none",
          fontFamily: "var(--f-sans)",
          fontSize: "var(--fs-body)",
          fontWeight: here ? 600 : 400,
          color: here ? "var(--c-ink)" : "var(--c-ink-4)",
          cursor: here ? "default" : "pointer",
          transition: "color .14s ease",
          whiteSpace: "nowrap"
        },
        onMouseEnter: (e) => {
          if (!here) e.currentTarget.style.color = "var(--c-ink-2)";
        },
        onMouseLeave: (e) => {
          if (!here) e.currentTarget.style.color = "var(--c-ink-4)";
        }
      },
      s.label,
      here && /* @__PURE__ */ React.createElement("span", { style: {
        position: "absolute",
        left: 11,
        right: 11,
        bottom: 0,
        height: 2,
        background: "var(--c-amber)",
        borderRadius: 0
      } })
    );
  }));
}
function NavWalletPill({ value, label, dot = tkc("amber"), onClick, href, active }) {
  const [h, setH] = useState(false);
  const isLink = href && !onClick;
  const Tag = isLink ? "a" : "button";
  return /* @__PURE__ */ React.createElement(
    Tag,
    {
      href: isLink ? href : void 0,
      onClick,
      onMouseEnter: () => setH(true),
      onMouseLeave: () => setH(false),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        height: 34,
        padding: "0 12px",
        background: active ? "rgba(var(--accent-rgb),.08)" : "var(--c-panel-2)",
        border: `1px solid ${active ? "rgba(var(--accent-rgb),.35)" : h ? "var(--c-line-3)" : "var(--c-line-2)"}`,
        borderRadius: "var(--r-3)",
        cursor: "pointer",
        textDecoration: "none",
        transition: "border-color .14s ease, background .14s ease",
        appearance: "none",
        flexShrink: 0
      }
    },
    /* @__PURE__ */ React.createElement("span", { style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: dot,
      boxShadow: `0 0 6px ${dot}`,
      flexShrink: 0
    } }),
    /* @__PURE__ */ React.createElement("span", { style: {
      fontFamily: "var(--f-display)",
      fontStyle: "italic",
      fontWeight: 600,
      fontSize: "var(--fs-body)",
      color: active ? "var(--c-amber)" : "var(--c-ink)",
      whiteSpace: "nowrap"
    } }, value),
    label && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { width: 1, height: 12, background: "var(--c-line-2)", flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", { style: {
      fontFamily: "var(--f-mono)",
      fontSize: "var(--fs-label)",
      color: "var(--c-ink-3)",
      letterSpacing: ".08em",
      whiteSpace: "nowrap"
    } }, label))
  );
}
function NavBell({ count = 0, open, onClick, children }) {
  return /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn-ghost btn-icon",
      style: { width: 34, height: 34, position: "relative" },
      onClick,
      "data-active": open || void 0,
      title: count > 0 ? `${count} unread` : "Notifications"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "bell", size: 15 }),
    count > 0 && /* @__PURE__ */ React.createElement("span", { style: {
      position: "absolute",
      top: 5,
      right: 5,
      minWidth: 13,
      height: 13,
      padding: "0 3px",
      borderRadius: "var(--r-2)",
      background: "var(--c-blood)",
      border: "1.5px solid var(--c-bg)",
      fontSize: "var(--fs-label)",
      fontFamily: "var(--f-mono)",
      fontWeight: 600,
      color: tkc("ink"),
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    } }, count > 9 ? "9+" : count)
  ), open && children && /* @__PURE__ */ React.createElement("div", { style: {
    position: "fixed",
    top: 60,
    right: 12,
    width: 380,
    maxHeight: "calc(100vh - 80px)",
    background: "var(--c-panel)",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-2)",
    boxShadow: "0 24px 64px rgba(0,0,0,.55), 0 4px 12px rgba(0,0,0,.3)",
    zIndex: 9e3,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    animation: "dropIn .16s cubic-bezier(.2,.8,.2,1)"
  } }, /* @__PURE__ */ React.createElement("style", null, `@keyframes dropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}`), children));
}
function UTNMobileDrawer({ items, actions, onClose }) {
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: { position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,.65)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", animation: "utnFade .2s ease forwards" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 81, background: "var(--c-panel)", borderTop: "1px solid var(--c-line)", borderRadius: "12px 12px 0 0", animation: "utnSlide .26s cubic-bezier(.32,.72,0,1) forwards", paddingBottom: "max(env(safe-area-inset-bottom,0px),16px)", maxHeight: "82vh", overflowY: "auto" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 32, height: 3, borderRadius: "var(--r-1)", background: "var(--c-line-3)", margin: "14px auto 6px" } }), /* @__PURE__ */ React.createElement("nav", null, (items || []).map((t, i) => /* @__PURE__ */ React.createElement("button", { key: i, onClick: () => {
    t.onClick && t.onClick();
    onClose();
  }, style: {
    width: "100%",
    padding: "13px 28px",
    background: t.active ? "rgba(var(--accent-rgb),.06)" : "transparent",
    border: "none",
    borderLeft: `2px solid ${t.active ? "var(--c-amber)" : "transparent"}`,
    display: "flex",
    alignItems: "center",
    gap: 14,
    cursor: "pointer",
    textAlign: "left"
  } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", lineHeight: 1.2, color: t.active ? "var(--c-amber)" : "var(--c-ink)", letterSpacing: "-0.01em" } }, t.label)))), actions && /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 24px 4px", display: "flex", flexDirection: "column", gap: 10 }, onClick: onClose }, actions), /* @__PURE__ */ React.createElement("div", { style: { borderTop: "1px solid var(--c-line)", marginTop: 10, padding: "16px 28px 8px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase", marginBottom: 10 } }, "Switch surface"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, [{ label: "Watch", href: "index.html" }, { label: "Studio", href: "Cina.html" }, { label: "Producers", href: "Producers.html" }].map((s) => /* @__PURE__ */ React.createElement("a", { key: s.label, href: s.href, style: { padding: "8px 14px", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textDecoration: "none", textTransform: "uppercase" } }, s.label))))), /* @__PURE__ */ React.createElement("style", null, `@keyframes utnFade{from{opacity:0}to{opacity:1}}@keyframes utnSlide{from{transform:translateY(100%)}to{transform:translateY(0)}}`));
}
function UnifiedTopNav({
  collapseAt = 768,
  surface,
  onWordmark,
  children,
  right,
  tabs,
  wallet,
  bell,
  avatar,
  headerStyle,
  accountBalance,
  mobileNav,
  mobileActions
}) {
  const [utnNarrow, setUtnNarrow] = useState(() => typeof window !== "undefined" && window.innerWidth < collapseAt);
  const [utnDrawer, setUtnDrawer] = useState(false);
  useEffect(() => {
    const h = () => setUtnNarrow(window.innerWidth < collapseAt);
    window.addEventListener("resize", h, { passive: true });
    return () => window.removeEventListener("resize", h);
  }, []);
  const surfaceLabel = {
    watch: "WATCH",
    studio: "STUDIO",
    pitch: "PITCH",
    producers: "PRODUCERS"
  }[surface] || (surface ? surface.toUpperCase() : "");
  const avatarNode = (() => {
    if (avatar !== void 0) return avatar;
    if (typeof CinaAccountButton !== "undefined")
      return /* @__PURE__ */ React.createElement(CinaAccountButton, { surface, accent: "var(--c-amber)", balance: accountBalance });
    return null;
  })();
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("header", { style: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "rgba(8, 8, 10, 0.78)",
    backdropFilter: "blur(24px) saturate(140%)",
    WebkitBackdropFilter: "blur(24px) saturate(140%)",
    borderBottom: "1px solid var(--c-line)",
    ...headerStyle
  } }, /* @__PURE__ */ React.createElement("a", { href: "#main-content", className: "skip-link" }, "SKIP TO CONTENT"), /* @__PURE__ */ React.createElement("nav", { "aria-label": "Cina surfaces", style: { height: 60, display: "flex", alignItems: "stretch", padding: "0 24px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onWordmark,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        paddingRight: 14,
        height: "100%",
        background: "transparent",
        border: "none",
        cursor: onWordmark ? "pointer" : "default",
        color: "inherit",
        lineHeight: 1,
        flexShrink: 0
      }
    },
    /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", lineHeight: 1, transform: "translateY(-1px)" } }, /* @__PURE__ */ React.createElement(CinaMark, { size: 26 })),
    surfaceLabel && /* @__PURE__ */ React.createElement("span", { style: {
      fontFamily: "var(--f-mono)",
      fontSize: "var(--fs-label)",
      letterSpacing: ".16em",
      color: "var(--c-ink-4)",
      lineHeight: 1
    } }, surfaceLabel)
  ), /* @__PURE__ */ React.createElement("div", { style: { width: 1, alignSelf: "center", height: 22, background: "var(--c-line)", flexShrink: 0 } }), /* @__PURE__ */ React.createElement(SurfaceSegment, { surface }), children && !utnNarrow && /* @__PURE__ */ React.createElement("div", { style: { width: 1, alignSelf: "center", height: 22, background: "var(--c-line)", flexShrink: 0 } }), children && !utnNarrow && /* @__PURE__ */ React.createElement("div", { className: "utn-slot", style: { display: "flex", alignItems: "stretch", minWidth: 0, flex: "0 1 auto" } }, children), /* @__PURE__ */ React.createElement("div", { style: { flex: "1 0 12px" } }), right && !utnNarrow && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 } }, right), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: right && !utnNarrow ? 6 : 0 } }, !utnNarrow && surface !== "studio" && surface !== "watch" && /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => window.toggleCinaAtlas && window.toggleCinaAtlas(true),
      title: "Open Cina Workspace Atlas (\u2318K)",
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: "2.1rem",
        padding: "0 0.7rem",
        background: "rgba(255,255,255,.04)",
        border: "1px solid var(--c-line-2)",
        color: "var(--c-ink-3)",
        cursor: "pointer",
        borderRadius: 0,
        fontFamily: "var(--f-sans)",
        fontSize: "var(--fs-label)"
      }
    },
    /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--c-amber)" } }, "Cina"),
    /* @__PURE__ */ React.createElement("span", null, "Workspace"),
    /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "0.64rem", color: "var(--c-ink-4)" } }, "\u2318K")
  ), wallet && !utnNarrow && /* @__PURE__ */ React.createElement(NavWalletPill, { ...wallet }), bell && /* @__PURE__ */ React.createElement(NavBell, { count: bell.count || 0, open: bell.open, onClick: bell.onClick }, bell.dropdown), avatarNode, utnNarrow && (mobileNav || mobileActions) && /* @__PURE__ */ React.createElement("button", { "aria-label": "Open menu", onClick: () => setUtnDrawer(true), style: {
    width: 38,
    height: 38,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--c-panel-2)",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-2)",
    color: "var(--c-ink-2)",
    cursor: "pointer",
    flexShrink: 0
  } }, /* @__PURE__ */ React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M3 6h18M3 12h18M3 18h18" }))))), tabs && !utnNarrow && /* @__PURE__ */ React.createElement("div", { style: {
    height: 44,
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    borderTop: "1px solid var(--c-line)"
  } }, tabs)), utnNarrow && utnDrawer && (mobileNav || mobileActions) && /* @__PURE__ */ React.createElement(UTNMobileDrawer, { items: mobileNav, actions: mobileActions, onClose: () => setUtnDrawer(false) }));
}
Object.assign(window, { Icon, AgentBadge, CinaBadge, CinaMark, FrameThumb, StatusPill, Slider, SectionHead, FilmTile, TileBadge, Eyebrow, PageIntro, FromTheProgrammer, EmptyState, ErrorState, Skeleton, UnifiedTopNav, CarouselRail, _photoForKind });
(function() {
  const KEY = "cina:credits";
  const read = () => {
    try {
      const v = parseInt(localStorage.getItem(KEY), 10);
      return isNaN(v) ? 342 : v;
    } catch (e) {
      return 342;
    }
  };
  window.CinaCredits = {
    get: read,
    set(v) {
      try {
        localStorage.setItem(KEY, String(Math.max(0, Math.round(v))));
      } catch (e) {
      }
      window.dispatchEvent(new CustomEvent("cina:credits-changed", { detail: { value: read() } }));
    },
    add(n) {
      this.set(read() + (n || 0));
    },
    spend(n) {
      this.set(read() - (n || 0));
    }
  };
  window.useCinaCredits = function() {
    const [v, setV] = React.useState(read);
    React.useEffect(() => {
      const h = () => setV(read());
      window.addEventListener("cina:credits-changed", h);
      window.addEventListener("storage", h);
      return () => {
        window.removeEventListener("cina:credits-changed", h);
        window.removeEventListener("storage", h);
      };
    }, []);
    return v;
  };
})();
function EmptyState({ icon = "play", title, body, cta, children }) {
  return /* @__PURE__ */ React.createElement(CinaEmpty, { icon, title, body, cta }, children);
}
function ErrorState({ icon = "alert", title = "Something didn't load", body, onRetry, cta }) {
  return /* @__PURE__ */ React.createElement("div", { className: "cina-state cina-state--error" }, /* @__PURE__ */ React.createElement("div", { className: "cina-state__icon" }, /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 20 })), /* @__PURE__ */ React.createElement("div", { className: "cina-state__title" }, title), body && /* @__PURE__ */ React.createElement("div", { className: "cina-state__body" }, body), onRetry && /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm", onClick: onRetry, style: { height: 32 } }, /* @__PURE__ */ React.createElement(Icon, { name: "refresh", size: 11 }), " Try again"), cta || null);
}
function Skeleton({ w = "100%", h = 12, radius = 4, style }) {
  return /* @__PURE__ */ React.createElement("span", { className: "cina-skeleton", style: {
    width: typeof w === "number" ? `${w}px` : w,
    height: typeof h === "number" ? `${h}px` : h,
    borderRadius: radius,
    ...style
  } });
}
function CarouselRail({ children, fade = "var(--c-bg)", gap = 12, padY = 12, arrowOffset = -6, snap = true, fadeW = 80, style = {} }) {
  const ref = React.useRef(null);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(true);
  const [scrollable, setScrollable] = React.useState(false);
  const update = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setScrollable(max > 8);
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max - 4);
  }, []);
  React.useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    const t1 = setTimeout(update, 250);
    const t2 = setTimeout(update, 900);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [update, children]);
  const scroll = (dir) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" });
  };
  const arrow = (dir, show) => /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => scroll(dir),
      "aria-label": dir < 0 ? "Scroll left" : "Scroll right",
      tabIndex: show ? 0 : -1,
      style: {
        position: "absolute",
        top: "50%",
        [dir < 0 ? "left" : "right"]: arrowOffset,
        transform: "translateY(-50%)",
        width: 38,
        height: 38,
        borderRadius: "50%",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(8,8,10,.86)",
        backdropFilter: "blur(8px)",
        border: "1px solid var(--c-line-2)",
        color: "var(--c-ink)",
        cursor: "pointer",
        zIndex: 3,
        boxShadow: "0 6px 20px rgba(0,0,0,.4)",
        opacity: show ? 1 : 0,
        pointerEvents: show ? "auto" : "none",
        transition: "opacity .18s ease"
      }
    },
    /* @__PURE__ */ React.createElement("span", { style: { transform: dir < 0 ? "rotate(180deg)" : "none", display: "flex" } }, /* @__PURE__ */ React.createElement(Icon, { name: "chev-r", size: 15 }))
  );
  return /* @__PURE__ */ React.createElement("div", { style: { position: "relative", ...style } }, /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", style: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: fadeW,
    zIndex: 2,
    pointerEvents: "none",
    background: `linear-gradient(to right, ${fade} 10%, transparent)`,
    opacity: scrollable && !atStart ? 1 : 0,
    transition: "opacity .2s ease"
  } }), /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", style: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: fadeW,
    zIndex: 2,
    pointerEvents: "none",
    background: `linear-gradient(to left, ${fade} 12%, transparent)`,
    opacity: scrollable && !atEnd ? 1 : 0,
    transition: "opacity .2s ease"
  } }), /* @__PURE__ */ React.createElement("div", { ref, className: "cina-rail-scroller", style: {
    display: "flex",
    gap,
    overflowX: "auto",
    overflowY: "hidden",
    scrollbarWidth: "none",
    paddingTop: padY,
    paddingBottom: padY,
    scrollSnapType: snap ? "x proximity" : "none"
  } }, children), arrow(-1, scrollable && !atStart), arrow(1, scrollable && !atEnd));
}

  try { if (typeof useState !== "undefined") window["useState"] = useState; } catch (_) {}
  try { if (typeof useEffect !== "undefined") window["useEffect"] = useEffect; } catch (_) {}
  try { if (typeof useRef !== "undefined") window["useRef"] = useRef; } catch (_) {}
  try { if (typeof useMemo !== "undefined") window["useMemo"] = useMemo; } catch (_) {}
  try { if (typeof useCallback !== "undefined") window["useCallback"] = useCallback; } catch (_) {}
  try { if (typeof Icon !== "undefined") window["Icon"] = Icon; } catch (_) {}
  try { if (typeof AgentBadge !== "undefined") window["AgentBadge"] = AgentBadge; } catch (_) {}
  try { if (typeof CinaMark !== "undefined") window["CinaMark"] = CinaMark; } catch (_) {}
  try { if (typeof CinaBadge !== "undefined") window["CinaBadge"] = CinaBadge; } catch (_) {}
  try { if (typeof C !== "undefined") window["C"] = C; } catch (_) {}
  try { if (typeof THUMB_IMAGES !== "undefined") window["THUMB_IMAGES"] = THUMB_IMAGES; } catch (_) {}
  try { if (typeof _THUMB_FALLBACK !== "undefined") window["_THUMB_FALLBACK"] = _THUMB_FALLBACK; } catch (_) {}
  try { if (typeof _photoForKind !== "undefined") window["_photoForKind"] = _photoForKind; } catch (_) {}
  try { if (typeof FrameThumb !== "undefined") window["FrameThumb"] = FrameThumb; } catch (_) {}
  try { if (typeof StatusPill !== "undefined") window["StatusPill"] = StatusPill; } catch (_) {}
  try { if (typeof Slider !== "undefined") window["Slider"] = Slider; } catch (_) {}
  try { if (typeof SectionHead !== "undefined") window["SectionHead"] = SectionHead; } catch (_) {}
  try { if (typeof FilmTile !== "undefined") window["FilmTile"] = FilmTile; } catch (_) {}
  try { if (typeof TileBadge !== "undefined") window["TileBadge"] = TileBadge; } catch (_) {}
  try { if (typeof Eyebrow !== "undefined") window["Eyebrow"] = Eyebrow; } catch (_) {}
  try { if (typeof ChapterMark !== "undefined") window["ChapterMark"] = ChapterMark; } catch (_) {}
  try { if (typeof PageIntro !== "undefined") window["PageIntro"] = PageIntro; } catch (_) {}
  try { if (typeof FromTheProgrammer !== "undefined") window["FromTheProgrammer"] = FromTheProgrammer; } catch (_) {}
  try { if (typeof SurfaceSegment !== "undefined") window["SurfaceSegment"] = SurfaceSegment; } catch (_) {}
  try { if (typeof NavWalletPill !== "undefined") window["NavWalletPill"] = NavWalletPill; } catch (_) {}
  try { if (typeof NavBell !== "undefined") window["NavBell"] = NavBell; } catch (_) {}
  try { if (typeof UTNMobileDrawer !== "undefined") window["UTNMobileDrawer"] = UTNMobileDrawer; } catch (_) {}
  try { if (typeof UnifiedTopNav !== "undefined") window["UnifiedTopNav"] = UnifiedTopNav; } catch (_) {}
  try { if (typeof EmptyState !== "undefined") window["EmptyState"] = EmptyState; } catch (_) {}
  try { if (typeof ErrorState !== "undefined") window["ErrorState"] = ErrorState; } catch (_) {}
  try { if (typeof Skeleton !== "undefined") window["Skeleton"] = Skeleton; } catch (_) {}
  try { if (typeof CarouselRail !== "undefined") window["CarouselRail"] = CarouselRail; } catch (_) {}
})();

// ── MODULE: cina-ui.jsx ──
;(function() {
const { useState: usUI, useEffect: ueUI, useRef: urUI, useLayoutEffect: ulUI } = React;
(function cinaUiCss() {
  if (document.getElementById("cina-ui-css")) return;
  const s = document.createElement("style");
  s.id = "cina-ui-css";
  s.textContent = `
.cui-scrim{position:fixed;inset:0;z-index:900;background:rgba(0,0,0,.62);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:24px;animation:cuiFade .18s ease}
.cui-modal{position:relative;width:100%;max-height:min(88vh,900px);display:flex;flex-direction:column;background:var(--c-panel);border:1px solid var(--c-line-2);border-radius:var(--r-2);box-shadow:0 30px 80px rgba(0,0,0,.6);color:var(--c-ink);animation:cuiRise .24s cubic-bezier(.2,.8,.2,1)}
.cui-head{display:flex;align-items:flex-start;gap:16px;padding:20px 22px 14px;border-bottom:1px solid var(--c-line)}
.cui-head__t{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}
.cui-title{margin:0;font-family:var(--f-display);font-style:italic;font-weight:500;font-size:var(--fs-title);line-height:1.15;letter-spacing:-0.01em}
.cui-body{padding:18px 22px;overflow:auto;min-height:0;font-size:var(--fs-body);line-height:1.55;color:var(--c-ink-2)}
.cui-foot{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:8px;padding:14px 22px;border-top:1px solid var(--c-line)}
.cui-x{flex-shrink:0;width:32px;height:32px;border-radius:var(--r-full);border:1px solid var(--c-line-2);background:transparent;color:var(--c-ink-3);cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.cui-x:hover{color:var(--c-ink);border-color:var(--c-ink-3)}
.cui-label{font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.16em;text-transform:uppercase;color:var(--c-ink-3)}
.cui-sheet-scrim{position:fixed;inset:0;z-index:900;background:rgba(0,0,0,.5);animation:cuiFade .18s ease}
.cui-sheet{position:fixed;z-index:901;display:flex;flex-direction:column;background:var(--c-panel);color:var(--c-ink);box-shadow:0 0 60px rgba(0,0,0,.5)}
.cui-sheet[data-side="right"]{top:0;right:0;bottom:0;width:min(100vw,var(--cui-w,440px));border-left:1px solid var(--c-line-2);animation:cuiInR .26s cubic-bezier(.2,.8,.2,1)}
.cui-sheet[data-side="left"]{top:0;left:0;bottom:0;width:min(100vw,var(--cui-w,440px));border-right:1px solid var(--c-line-2);animation:cuiInL .26s cubic-bezier(.2,.8,.2,1)}
.cui-sheet[data-side="bottom"]{left:0;right:0;bottom:0;max-height:88vh;border-top:1px solid var(--c-line-2);border-radius:var(--r-2) var(--r-2) 0 0;animation:cuiInB .26s cubic-bezier(.2,.8,.2,1)}
.cui-stat{display:flex;flex-direction:column;gap:6px;min-width:0}
.cui-stat__v{font-family:var(--f-display);font-weight:500;font-size:var(--fs-head);line-height:1;letter-spacing:-0.02em;color:var(--c-ink);display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.cui-stat[data-size="sm"] .cui-stat__v{font-size:var(--fs-title)}
.cui-stat__sub{font-size:var(--fs-body);color:var(--c-ink-3);display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.cui-delta{font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.06em}
.cui-pill{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:var(--r-full);border:1px solid var(--c-line-2);background:transparent;color:var(--c-ink-2);font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;line-height:1}
button.cui-pill{cursor:pointer}
button.cui-pill:hover{border-color:var(--c-ink-3);color:var(--c-ink)}
.cui-pill[data-size="lg"]{height:34px;padding:0 14px}
.cui-pill[data-tone="accent"]{border-color:var(--c-amber);color:var(--c-amber)}
.cui-pill[data-tone="good"]{border-color:var(--c-good);color:var(--c-good)}
.cui-pill[data-tone="warn"]{border-color:var(--c-warn);color:var(--c-warn)}
.cui-pill[data-tone="bad"]{border-color:var(--c-bad);color:var(--c-bad)}
.cui-pill[data-tone="solid"]{background:var(--c-amber);border-color:var(--c-amber);color:var(--c-on-amber)}
.cui-pill[data-tone="dark"]{background:rgba(0,0,0,.72);border-color:rgba(255,255,255,.14);color:var(--c-white)}
.cui-pill[data-active="1"]{background:var(--c-ink);border-color:var(--c-ink);color:var(--c-bg)}
.cui-pill__dot{width:6px;height:6px;border-radius:var(--r-full);background:currentColor}
.cui-tabs{display:flex;gap:4px;border-bottom:1px solid var(--c-line);overflow-x:auto;scrollbar-width:none}
.cui-tabs::-webkit-scrollbar{display:none}
.cui-tab{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:10px 12px;margin-bottom:-1px;border-bottom:2px solid transparent;font-size:var(--fs-body);color:var(--c-ink-3);white-space:nowrap}
.cui-tab:hover{color:var(--c-ink)}
.cui-tab[aria-selected="true"]{color:var(--c-ink);border-bottom-color:var(--c-amber)}
.cui-tab__n{font-family:var(--f-mono);font-size:var(--fs-label);color:var(--c-ink-4)}
.cui-empty{display:flex;flex-direction:column;align-items:flex-start;gap:12px;padding:clamp(28px,4vw,56px) 0;max-width:520px}
.cui-empty[data-center="1"]{align-items:center;text-align:center;margin:0 auto}
.cui-empty[data-compact="1"]{padding:18px 0;gap:8px}
.cui-empty__icon{width:44px;height:44px;border-radius:var(--r-full);border:1px solid var(--c-line-2);display:flex;align-items:center;justify-content:center;color:var(--c-ink-3)}
.cui-empty__t{font-family:var(--f-display);font-style:italic;font-size:var(--fs-title);line-height:1.15;color:var(--c-ink)}
.cui-empty__b{font-size:var(--fs-body);line-height:1.55;color:var(--c-ink-3)}
.cui-toasts{position:fixed;right:20px;bottom:calc(20px + var(--orb-safe, 0px));z-index:1000;display:flex;flex-direction:column;gap:8px;pointer-events:none;max-width:min(380px,calc(100vw - 40px))}
.cui-toast{pointer-events:auto;padding:12px 14px;background:var(--c-panel);border:1px solid var(--c-line-2);border-left:3px solid var(--c-amber);border-radius:var(--r-1);box-shadow:0 12px 36px rgba(0,0,0,.55);font-size:var(--fs-body);line-height:1.45;color:var(--c-ink);animation:cuiRise .22s cubic-bezier(.2,.8,.2,1);display:flex;gap:10px;align-items:flex-start}
.cui-toast[data-kind="good"]{border-left-color:var(--c-good)}
.cui-toast[data-kind="warn"]{border-left-color:var(--c-warn)}
.cui-toast[data-kind="bad"]{border-left-color:var(--c-bad)}
.cui-tour{position:fixed;inset:0;z-index:950;pointer-events:none}
.cui-tour__card{position:fixed;width:min(340px,calc(100vw - 32px));pointer-events:auto;background:var(--c-panel);border:1px solid var(--c-amber);border-radius:var(--r-2);box-shadow:0 20px 50px rgba(0,0,0,.6);padding:18px;display:flex;flex-direction:column;gap:10px;animation:cuiRise .22s ease}
.cui-tour__bar{display:flex;gap:4px}
.cui-tour__bar span{flex:1;height:2px;background:var(--c-line-2)}
.cui-tour__bar span[data-on="1"]{background:var(--c-amber)}
.cui-btn{height:32px;padding:0 14px;border-radius:var(--r-1);border:1px solid var(--c-line-3);background:transparent;color:var(--c-ink);font-family:var(--f-sans);font-size:var(--fs-body);cursor:pointer}
.cui-btn:hover{border-color:var(--c-ink)}
.cui-btn--primary{background:var(--c-amber);border-color:var(--c-amber);color:var(--c-on-amber);font-weight:600}
@keyframes cuiFade{from{opacity:0}to{opacity:1}}
:root{--orb-safe:0px}
body[data-orb="on"]{--orb-safe:60px}
body[data-orb="on"]{padding-bottom:var(--orb-safe)}
body[data-orb="on"] .pm-mobilebar{bottom:var(--orb-safe)!important}
@keyframes cuiRise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes cuiInL{from{transform:translateX(-100%)}to{transform:none}}
@keyframes cuiInR{from{transform:translateX(100%)}to{transform:none}}
@keyframes cuiInB{from{transform:translateY(100%)}to{transform:none}}
`;
  document.head.appendChild(s);
})();
function useEscape(onClose) {
  ueUI(() => {
    if (!onClose) return;
    const h = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", h, true);
    return () => window.removeEventListener("keydown", h, true);
  }, [onClose]);
}
function useScrollLock() {
  ueUI(() => {
    const b = document.body, prev = b.style.overflow;
    b.style.overflow = "hidden";
    return () => {
      b.style.overflow = prev;
    };
  }, []);
}
function CinaModal({ onClose, title, kicker, width = 560, actions, children, bodyStyle, panelStyle, dismissible = true, label }) {
  useEscape(dismissible ? onClose : null);
  useScrollLock();
  const ref = urUI(null);
  ueUI(() => {
    const el = ref.current && ref.current.querySelector("input,textarea,select,button:not(.cui-x)");
    el && el.focus && el.focus({ preventScroll: true });
  }, []);
  return ReactDOM.createPortal(
    /* @__PURE__ */ React.createElement("div", { className: "cui-scrim", onMouseDown: (e) => {
      if (dismissible && e.target === e.currentTarget && onClose) onClose();
    } }, /* @__PURE__ */ React.createElement("div", { ref, className: "cui-modal", role: "dialog", "aria-modal": "true", "aria-label": label || (typeof title === "string" ? title : void 0), style: { maxWidth: width, ...panelStyle } }, (title || kicker || onClose) && /* @__PURE__ */ React.createElement("div", { className: "cui-head" }, /* @__PURE__ */ React.createElement("div", { className: "cui-head__t" }, kicker && /* @__PURE__ */ React.createElement("span", { className: "cui-label" }, kicker), title && /* @__PURE__ */ React.createElement("h2", { className: "cui-title" }, title)), onClose && /* @__PURE__ */ React.createElement("button", { className: "cui-x", onClick: onClose, "aria-label": "Close" }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 13 }))), /* @__PURE__ */ React.createElement("div", { className: "cui-body", style: bodyStyle }, children), actions && /* @__PURE__ */ React.createElement("div", { className: "cui-foot" }, actions))),
    document.body
  );
}
function CinaSheet({ onClose, title, kicker, side = "right", width = 440, actions, children, bodyStyle }) {
  useEscape(onClose);
  useScrollLock();
  return ReactDOM.createPortal(
    /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "cui-sheet-scrim", onClick: onClose }), /* @__PURE__ */ React.createElement("aside", { className: "cui-sheet", "data-side": side, role: "dialog", "aria-modal": "true", style: { "--cui-w": width + "px" } }, (title || kicker || onClose) && /* @__PURE__ */ React.createElement("div", { className: "cui-head" }, /* @__PURE__ */ React.createElement("div", { className: "cui-head__t" }, kicker && /* @__PURE__ */ React.createElement("span", { className: "cui-label" }, kicker), title && /* @__PURE__ */ React.createElement("h2", { className: "cui-title" }, title)), onClose && /* @__PURE__ */ React.createElement("button", { className: "cui-x", onClick: onClose, "aria-label": "Close" }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 13 }))), /* @__PURE__ */ React.createElement("div", { className: "cui-body", style: { flex: 1, ...bodyStyle } }, children), actions && /* @__PURE__ */ React.createElement("div", { className: "cui-foot" }, actions))),
    document.body
  );
}
function CinaSpark({ data, w = 72, h = 22 }) {
  if (!Array.isArray(data) || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data), r = max - min || 1;
  const pts = data.map((v, i) => `${i / (data.length - 1) * w},${h - (v - min) / r * h}`).join(" ");
  return /* @__PURE__ */ React.createElement("svg", { width: w, height: h, viewBox: `0 0 ${w} ${h}`, style: { overflow: "visible" } }, /* @__PURE__ */ React.createElement("polyline", { points: pts, fill: "none", stroke: "var(--c-amber)", strokeWidth: "1.5" }));
}
function CinaStat({ label, value, sub, delta, up, tone, size = "md", icon, trend, stars, children, style }) {
  const toneColor = { accent: "var(--c-amber)", good: "var(--c-good)", warn: "var(--c-warn)", bad: "var(--c-bad)" }[tone];
  let dUp = up;
  if (dUp == null && delta != null) dUp = typeof delta === "number" ? delta >= 0 : !/^\s*[-−▼]/.test(String(delta));
  const dText = delta == null ? null : typeof delta === "number" ? `${delta >= 0 ? "\u25B2" : "\u25BC"} ${Math.abs(delta)}%` : String(delta);
  return /* @__PURE__ */ React.createElement("div", { className: "cui-stat", "data-size": size, style }, /* @__PURE__ */ React.createElement("span", { className: "cui-label", style: { display: "flex", alignItems: "center", gap: 6 } }, icon && (typeof icon === "string" ? /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 12 }) : icon), label), /* @__PURE__ */ React.createElement("span", { className: "cui-stat__v", style: toneColor ? { color: toneColor } : null }, value, stars != null && /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", color: "var(--c-amber)", letterSpacing: ".1em" } }, "\u2605".repeat(Math.round(+stars || 5)))), (sub || dText || trend) && /* @__PURE__ */ React.createElement("span", { className: "cui-stat__sub" }, sub && /* @__PURE__ */ React.createElement("span", null, sub), Array.isArray(trend) ? /* @__PURE__ */ React.createElement(CinaSpark, { data: trend }) : trend != null && !dText ? /* @__PURE__ */ React.createElement("span", { className: "cui-delta" }, trend) : null, dText && /* @__PURE__ */ React.createElement("span", { className: "cui-delta", style: { color: dUp ? "var(--c-good)" : "var(--c-bad)" } }, dText)), children);
}
function CinaPill({ children, tone, active, onClick, size, dot, icon, title, style, className, ...rest }) {
  const Tag = onClick ? "button" : "span";
  return /* @__PURE__ */ React.createElement(Tag, { className: "cui-pill" + (className ? " " + className : ""), "data-tone": tone || void 0, "data-active": active ? "1" : void 0, "data-size": size || void 0, onClick, title, style, ...rest }, dot && /* @__PURE__ */ React.createElement("span", { className: "cui-pill__dot" }), icon && (typeof icon === "string" ? /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 11 }) : icon), children);
}
function CinaTabs({ tabs, value, onChange, style }) {
  const norm = (tabs || []).map((t) => typeof t === "string" ? { id: t, label: t } : Array.isArray(t) ? { id: t[0], label: t[1], count: t[2] } : { id: t.id ?? t.value ?? t.key, label: t.label ?? t.name, count: t.count });
  return /* @__PURE__ */ React.createElement("div", { className: "cui-tabs", role: "tablist", style }, norm.map((t) => /* @__PURE__ */ React.createElement("button", { key: t.id, className: "cui-tab", role: "tab", "aria-selected": value === t.id, onClick: () => onChange && onChange(t.id) }, t.label, t.count != null && /* @__PURE__ */ React.createElement("span", { className: "cui-tab__n" }, t.count))));
}
function CinaEmpty({ icon, title, body, cta, children, compact, center, kicker }) {
  return /* @__PURE__ */ React.createElement("div", { className: "cui-empty", "data-compact": compact ? "1" : void 0, "data-center": center ? "1" : void 0 }, icon && /* @__PURE__ */ React.createElement("span", { className: "cui-empty__icon" }, typeof icon === "string" ? /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 18 }) : icon), kicker && /* @__PURE__ */ React.createElement("span", { className: "cui-label" }, kicker), title && /* @__PURE__ */ React.createElement("span", { className: "cui-empty__t" }, title), body && /* @__PURE__ */ React.createElement("span", { className: "cui-empty__b" }, body), (cta || children) && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 } }, cta, children));
}
const __cuiToasts = { items: [], subs: /* @__PURE__ */ new Set() };
function cinaToast(p) {
  if (p == null) return;
  if (typeof p === "string") p = { text: p };
  const kindMap = { ok: "good", success: "good", good: "good", warn: "warn", warning: "warn", error: "bad", bad: "bad", danger: "bad" };
  const t = { id: Date.now() + Math.random(), kind: kindMap[p.kind] || "info", title: p.title, text: p.text || p.message || p.msg || p.body || "", duration: p.duration || 3600 };
  if (!t.title && !t.text) return;
  __cuiToasts.items = [...__cuiToasts.items.slice(-3), t];
  __cuiToasts.subs.forEach((fn) => fn(__cuiToasts.items));
  setTimeout(() => {
    __cuiToasts.items = __cuiToasts.items.filter((x) => x.id !== t.id);
    __cuiToasts.subs.forEach((fn) => fn(__cuiToasts.items));
  }, t.duration);
}
function CinaToastHost() {
  const [items, set] = usUI(__cuiToasts.items);
  ueUI(() => {
    __cuiToasts.subs.add(set);
    return () => __cuiToasts.subs.delete(set);
  }, []);
  return /* @__PURE__ */ React.createElement("div", { className: "cui-toasts", role: "status", "aria-live": "polite" }, items.map((t) => /* @__PURE__ */ React.createElement("div", { key: t.id, className: "cui-toast", "data-kind": t.kind }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, t.title && /* @__PURE__ */ React.createElement("div", { className: "cui-label", style: { marginBottom: 4 } }, t.title), t.text))));
}
(function mountToasts() {
  const go = () => {
    if (document.getElementById("cui-toast-root")) return;
    const host = document.createElement("div");
    host.id = "cui-toast-root";
    document.body.appendChild(host);
    ReactDOM.createRoot(host).render(/* @__PURE__ */ React.createElement(CinaToastHost, null));
  };
  if (document.body) go();
  else document.addEventListener("DOMContentLoaded", go);
  window.addEventListener("cina:toast", (e) => cinaToast(e.detail));
})();
const cinaTours = {
  active: null,
  seen: (id) => {
    try {
      return localStorage.getItem("cina:tour:" + id) === "1";
    } catch (e) {
      return false;
    }
  },
  markSeen: (id) => {
    try {
      localStorage.setItem("cina:tour:" + id, "1");
    } catch (e) {
    }
  },
  reset: (id) => {
    try {
      localStorage.removeItem("cina:tour:" + id);
    } catch (e) {
    }
  }
};
function CinaTour({ id, steps, start = 0, once = false, onDone, onStep }) {
  const [i, setI] = usUI(start);
  const [rect, setRect] = usUI(null);
  const [blocked, setBlocked] = usUI(() => once && cinaTours.seen(id) || cinaTours.active && cinaTours.active !== id);
  const step = steps && steps[i];
  const finish = () => {
    cinaTours.markSeen(id);
    if (cinaTours.active === id) cinaTours.active = null;
    onDone && onDone();
  };
  ueUI(() => {
    if (blocked) {
      onDone && onDone();
      return;
    }
    cinaTours.active = id;
    return () => {
      if (cinaTours.active === id) cinaTours.active = null;
    };
  }, []);
  ueUI(() => {
    if (blocked || !step) return;
    step.onEnter && step.onEnter();
    onStep && onStep(i);
    let raf, tries = 0;
    const measure = () => {
      const el = step.target && document.querySelector(step.target);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          setRect(r);
          return;
        }
      }
      if (step.target && tries++ < 30) raf = requestAnimationFrame(measure);
      else setRect(null);
    };
    raf = requestAnimationFrame(measure);
    const onR = () => measure();
    window.addEventListener("resize", onR);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onR);
    };
  }, [i, blocked]);
  ueUI(() => {
    if (blocked) return;
    const h = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        finish();
      } else if (e.key === "ArrowRight") {
        e.stopPropagation();
        next();
      } else if (e.key === "ArrowLeft") {
        e.stopPropagation();
        setI((x) => Math.max(0, x - 1));
      }
    };
    window.addEventListener("keydown", h, true);
    return () => window.removeEventListener("keydown", h, true);
  });
  if (blocked || !step) return null;
  const next = () => i + 1 < steps.length ? setI(i + 1) : finish();
  const W = Math.min(340, window.innerWidth - 32), H = 210, G = 14, vw = window.innerWidth, vh = window.innerHeight;
  let pos = { left: vw / 2 - W / 2, top: vh / 2 - H / 2 };
  if (rect) {
    const below = rect.bottom + G + H < vh, right = rect.right + G + W < vw, left = rect.left - G - W > 0;
    if (below) pos = { left: rect.left + rect.width / 2 - W / 2, top: rect.bottom + G };
    else if (right) pos = { left: rect.right + G, top: rect.top + rect.height / 2 - H / 2 };
    else if (left) pos = { left: rect.left - G - W, top: rect.top + rect.height / 2 - H / 2 };
    else pos = { left: rect.left + rect.width / 2 - W / 2, top: Math.max(16, rect.top - G - H) };
    pos.left = Math.max(16, Math.min(vw - W - 16, pos.left));
    pos.top = Math.max(16, Math.min(vh - H - 16, pos.top));
  }
  return ReactDOM.createPortal(
    /* @__PURE__ */ React.createElement("div", { className: "cui-tour" }, /* @__PURE__ */ React.createElement("svg", { width: "100%", height: "100%", style: { position: "absolute", inset: 0, pointerEvents: "auto" }, onClick: next }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("mask", { id: "cui-tour-mask-" + id }, /* @__PURE__ */ React.createElement("rect", { width: "100%", height: "100%", fill: "white" }), rect && /* @__PURE__ */ React.createElement("rect", { x: rect.left - 6, y: rect.top - 6, width: rect.width + 12, height: rect.height + 12, rx: "8", fill: "black" }))), /* @__PURE__ */ React.createElement("rect", { width: "100%", height: "100%", fill: "rgba(0,0,0,.66)", mask: `url(#cui-tour-mask-${id})` }), rect && /* @__PURE__ */ React.createElement("rect", { x: rect.left - 6, y: rect.top - 6, width: rect.width + 12, height: rect.height + 12, rx: "8", fill: "none", stroke: "var(--c-amber)", strokeWidth: "1.5" })), /* @__PURE__ */ React.createElement("div", { className: "cui-tour__card", style: pos, role: "dialog", "aria-label": step.title }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { className: "cui-label", style: { color: "var(--c-amber)" } }, step.kicker || `Step ${i + 1} of ${steps.length}`), /* @__PURE__ */ React.createElement("button", { onClick: finish, style: { background: "none", border: "none", color: "var(--c-ink-3)", fontSize: "var(--fs-label)", cursor: "pointer", padding: 0 } }, "Skip tour")), /* @__PURE__ */ React.createElement("div", { className: "cui-title" }, step.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", lineHeight: 1.55, color: "var(--c-ink-2)" } }, step.body), /* @__PURE__ */ React.createElement("div", { className: "cui-tour__bar" }, steps.map((_, k) => /* @__PURE__ */ React.createElement("span", { key: k, "data-on": k <= i ? "1" : "0" }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: 6 } }, i > 0 && /* @__PURE__ */ React.createElement("button", { className: "cui-btn", onClick: () => setI(i - 1) }, "Back"), /* @__PURE__ */ React.createElement("button", { className: "cui-btn cui-btn--primary", onClick: next }, i + 1 < steps.length ? "Next" : "Done")))),
    document.body
  );
}
const CinaIcon = (props) => /* @__PURE__ */ React.createElement(Icon, { ...props });
Object.assign(window, { CinaModal, CinaSheet, CinaStat, CinaPill, CinaTabs, CinaEmpty, CinaTour, cinaToast, toast: cinaToast });

  try { if (typeof usUI !== "undefined") window["usUI"] = usUI; } catch (_) {}
  try { if (typeof ueUI !== "undefined") window["ueUI"] = ueUI; } catch (_) {}
  try { if (typeof urUI !== "undefined") window["urUI"] = urUI; } catch (_) {}
  try { if (typeof ulUI !== "undefined") window["ulUI"] = ulUI; } catch (_) {}
  try { if (typeof useEscape !== "undefined") window["useEscape"] = useEscape; } catch (_) {}
  try { if (typeof useScrollLock !== "undefined") window["useScrollLock"] = useScrollLock; } catch (_) {}
  try { if (typeof CinaModal !== "undefined") window["CinaModal"] = CinaModal; } catch (_) {}
  try { if (typeof CinaSheet !== "undefined") window["CinaSheet"] = CinaSheet; } catch (_) {}
  try { if (typeof CinaSpark !== "undefined") window["CinaSpark"] = CinaSpark; } catch (_) {}
  try { if (typeof CinaStat !== "undefined") window["CinaStat"] = CinaStat; } catch (_) {}
  try { if (typeof CinaPill !== "undefined") window["CinaPill"] = CinaPill; } catch (_) {}
  try { if (typeof CinaTabs !== "undefined") window["CinaTabs"] = CinaTabs; } catch (_) {}
  try { if (typeof CinaEmpty !== "undefined") window["CinaEmpty"] = CinaEmpty; } catch (_) {}
  try { if (typeof __cuiToasts !== "undefined") window["__cuiToasts"] = __cuiToasts; } catch (_) {}
  try { if (typeof cinaToast !== "undefined") window["cinaToast"] = cinaToast; } catch (_) {}
  try { if (typeof CinaToastHost !== "undefined") window["CinaToastHost"] = CinaToastHost; } catch (_) {}
  try { if (typeof cinaTours !== "undefined") window["cinaTours"] = cinaTours; } catch (_) {}
  try { if (typeof CinaTour !== "undefined") window["CinaTour"] = CinaTour; } catch (_) {}
  try { if (typeof CinaIcon !== "undefined") window["CinaIcon"] = CinaIcon; } catch (_) {}
})();

// ── MODULE: watch-responsive.jsx ──
;(function() {
const { useState: rwUsw, useEffect: rwUew } = React;
function useIsMobile(bp = 767) {
  const [m, setM] = rwUsw(() => window.innerWidth <= bp);
  rwUew(() => {
    const h = () => setM(window.innerWidth <= bp);
    window.addEventListener("resize", h, { passive: true });
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return m;
}
function MobileNavDrawer({ open, onClose, navItems, isActive }) {
  if (!open) return null;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick: onClose,
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(0,0,0,.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: "mndFadeIn .2s ease forwards"
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { style: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 81,
    background: "var(--c-panel)",
    borderTop: "1px solid var(--c-line)",
    borderRadius: "12px 12px 0 0",
    animation: "mndSlideUp .26s cubic-bezier(.32,.72,0,1) forwards",
    paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 32,
    height: 3,
    borderRadius: "var(--r-1)",
    background: "var(--c-line-3)",
    margin: "14px auto 4px"
  } }), /* @__PURE__ */ React.createElement("nav", null, navItems.map((t) => {
    const active = isActive(t.to);
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: t.id,
        onClick: () => {
          window.location.hash = "#" + t.to;
          onClose();
        },
        style: {
          width: "100%",
          padding: "13px 28px",
          background: active ? "rgba(var(--accent-rgb),.06)" : "transparent",
          border: "none",
          borderLeft: `2px solid ${active ? "var(--c-amber)" : "transparent"}`,
          display: "flex",
          alignItems: "center",
          gap: 14,
          cursor: "pointer",
          textAlign: "left"
        }
      },
      /* @__PURE__ */ React.createElement("span", { style: {
        fontFamily: "var(--f-display)",
        fontStyle: "italic",
        fontSize: "var(--fs-title)",
        lineHeight: 1.2,
        color: active ? "var(--c-amber)" : "var(--c-ink)",
        letterSpacing: "-0.01em"
      } }, t.label)
    );
  })), /* @__PURE__ */ React.createElement("div", { style: {
    borderTop: "1px solid var(--c-line)",
    marginTop: 8,
    padding: "16px 28px 4px"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    color: "var(--c-ink-4)",
    textTransform: "uppercase",
    marginBottom: 10
  } }, "Switch surface"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, [
    { label: "Studio", href: "Cina.html" },
    { label: "Producers", href: "Producers.html" }
  ].map((s) => /* @__PURE__ */ React.createElement("a", { key: s.label, href: s.href, style: {
    padding: "8px 14px",
    background: "var(--c-panel-2)",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-2)",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    color: "var(--c-ink-3)",
    textDecoration: "none",
    textTransform: "uppercase"
  } }, s.label))))), /* @__PURE__ */ React.createElement("style", null, `
        @keyframes mndFadeIn  { from { opacity: 0; }                to { opacity: 1; }           }
        @keyframes mndSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `));
}
Object.assign(window, { useIsMobile, MobileNavDrawer });
(function() {
  if (document.getElementById("__watch-mobile-css")) return;
  const s = document.createElement("style");
  s.id = "__watch-mobile-css";
  s.textContent = `
    @media (max-width: 767px) {
      /* All banner sections: tighten horizontal padding */
      [data-cina-banner] {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }

      /* Poster triptych (3-col) \u2192 single column */
      [data-cina-banner="triptych"] > div {
        grid-template-columns: 1fr !important;
      }

      /* Double feature (2-col) \u2192 single column */
      [data-cina-banner="double"] > div {
        grid-template-columns: 1fr !important;
      }

      /* Genre tiles (6-col) \u2192 3-col */
      [data-cina-banner="genre"] > div:last-child {
        grid-template-columns: repeat(3, 1fr) !important;
      }

      /* Studios grid \u2192 2-col */
      [data-cina-banner="studios"] > div:last-child {
        grid-template-columns: repeat(2, 1fr) !important;
      }

      /* Chapter marks */
      [data-cina-chapter] {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }

      /* PageIntro sections */
      [class*="page-intro"], section[style*="padding: "44px var(--gutter)"] {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }

      /* \u2500\u2500 Generic reflow: collapse inline-styled grids \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
         Watch pages lay out with inline style={{gridTemplateColumns}}.
         Attribute-substring selectors + !important reflow them all
         without touching each component. auto-fill/auto-fit grids are
         already responsive and left alone. */

      /* Sidebars + text panels: any 1-2 col / px-sidebar grid \u2192 single column */
      #root div[style*="grid-template-columns"]:not([style*="auto-fill"]):not([style*="auto-fit"]) {
        grid-template-columns: 1fr !important;
      }
      /* Card/poster grids (3+ cols) \u2192 2-up */
      #root div[style*="repeat(3"]:not([style*="auto-fill"]):not([style*="auto-fit"]),
      #root div[style*="repeat(4"]:not([style*="auto-fill"]):not([style*="auto-fit"]),
      #root div[style*="repeat(5"]:not([style*="auto-fill"]):not([style*="auto-fit"]),
      #root div[style*="repeat(6"]:not([style*="auto-fill"]):not([style*="auto-fit"]),
      #root div[style*="repeat(8"]:not([style*="auto-fill"]):not([style*="auto-fit"]) {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      /* Genre tiles keep 3-up (small squares) */
      #root [data-cina-banner="genre"] > div:last-child[style*="grid-template-columns"],
      #root [data-cina-banner="genre"] > div:last-child {
        grid-template-columns: repeat(3, 1fr) !important;
      }

      /* Sections: tighten the big clamp() gutters */
      #root section { padding-left: 20px !important; padding-right: 20px !important; }

      /* Oversized display type scales down */
      #root h1 { font-size: clamp(30px, 9vw, 44px) !important; }

      /* Sticky side rails become normal flow */
      #root div[style*="position: sticky"], #root aside[style*="position: sticky"] {
        position: static !important;
      }

      /* Prevent any direct child of body from overflowing viewport */
      #root { overflow-x: hidden; }
      html, body { overflow-x: hidden; }
    }
  `;
  (document.head || document.documentElement).appendChild(s);
})();

  try { if (typeof rwUsw !== "undefined") window["rwUsw"] = rwUsw; } catch (_) {}
  try { if (typeof rwUew !== "undefined") window["rwUew"] = rwUew; } catch (_) {}
  try { if (typeof useIsMobile !== "undefined") window["useIsMobile"] = useIsMobile; } catch (_) {}
  try { if (typeof MobileNavDrawer !== "undefined") window["MobileNavDrawer"] = MobileNavDrawer; } catch (_) {}
})();

// ── MODULE: cina-identity.jsx ──
;(function() {
const { useState: useIdState, useEffect: useIdEffect, useRef: useIdRef } = React;
const CINA_MOODS_META = [
  { id: "premiere", label: "Premiere", sub: "Cinema black \xB7 lab red", bg: "#0a0a0a", ink: "#f3efe8", accent: "#e5482f" },
  { id: "programmer", label: "Programmer", sub: "Booth slate \xB7 warm amber", bg: "#0d0e10", ink: "#e8e3d6", accent: "#e8a33d" },
  { id: "darkroom", label: "Darkroom", sub: "Safelight oxblood \xB7 silver", bg: "#0a0807", ink: "#efd9c8", accent: "#d24a3a" },
  { id: "midnight", label: "Midnight", sub: "Nocturne steel \xB7 cold cyan", bg: "#07090d", ink: "#dde6f2", accent: "#7eb6ff" },
  { id: "daylight", label: "Daylight", sub: "Archival cream \xB7 warm bronze", bg: "#f3eee2", ink: "#1a1812", accent: "#b46a1f" }
];
const CINA_VOICES_META = [
  { id: "quiet", label: "Quiet", sub: "Minimal chrome, shelves first" },
  { id: "magazine", label: "Magazine", sub: "Editorial default" },
  { id: "loud", label: "Loud", sub: "Monumental widescreen scale" }
];
const CINA_MOTIONS_META = [
  { id: "still", label: "Still", sub: "Static frames, zero grain" },
  { id: "restless", label: "Restless", sub: "Subtle Ken-Burns drift" },
  { id: "cinema", label: "Cinema", sub: "35mm grain & projector pulse" }
];
const _appSubs = /* @__PURE__ */ new Set();
const CinaAppearance = {
  get() {
    let mood = "premiere", voice = "magazine", motion = "restless";
    try {
      const m = localStorage.getItem("cina:mood");
      if (m && CINA_MOODS_META.some((x) => x.id === m)) mood = m;
      const v = localStorage.getItem("cina:voice");
      if (v && CINA_VOICES_META.some((x) => x.id === v)) voice = v;
      const mo = localStorage.getItem("cina:motion");
      if (mo && CINA_MOTIONS_META.some((x) => x.id === mo)) motion = mo;
    } catch (_) {
    }
    return { mood, voice, motion };
  },
  applyToDOM(next) {
    const cur = next || this.get();
    if (document.body) {
      document.body.dataset.cinaMood = cur.mood;
      document.body.dataset.cinaVoice = cur.voice;
      document.body.dataset.cinaMotion = cur.motion;
    }
    document.documentElement.dataset.mood = cur.mood;
    document.documentElement.dataset.theme = cur.mood === "daylight" ? "light" : "dark";
    if (window.CINA_TOKENS && window.CINA_TOKENS.setThemeColor) {
      window.CINA_TOKENS.setThemeColor();
    }
  },
  set(patch) {
    const cur = { ...this.get(), ...patch };
    try {
      localStorage.setItem("cina:mood", cur.mood);
      localStorage.setItem("cina:voice", cur.voice);
      localStorage.setItem("cina:motion", cur.motion);
    } catch (_) {
    }
    this.applyToDOM(cur);
    _appSubs.forEach((fn) => fn(cur));
    window.dispatchEvent(new CustomEvent("cina:appearance-changed", { detail: cur }));
  }
};
CinaAppearance.applyToDOM();
function useCinaAppearance() {
  const [st, setSt] = useIdState(() => CinaAppearance.get());
  useIdEffect(() => {
    _appSubs.add(setSt);
    const onStorage = () => setSt(CinaAppearance.get());
    window.addEventListener("storage", onStorage);
    return () => {
      _appSubs.delete(setSt);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return [st, (patch) => CinaAppearance.set(patch)];
}
const CINA_KEY = "cina:identity";
const LEGACY = { signedIn: "cina:signed-in", email: "cina:email", handle: "cina:handle" };
function _idLoad() {
  try {
    const raw = localStorage.getItem(CINA_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
  }
  let legacySigned = null, legacyHandle = "", legacyEmail = "";
  try {
    const s = localStorage.getItem(LEGACY.signedIn);
    if (s != null) legacySigned = JSON.parse(s);
    legacyHandle = JSON.parse(localStorage.getItem(LEGACY.handle) || '""');
    legacyEmail = JSON.parse(localStorage.getItem(LEGACY.email) || '""');
  } catch {
  }
  return {
    signedIn: legacySigned == null ? true : !!legacySigned,
    handle: legacyHandle || "you.eth",
    email: legacyEmail || ""
  };
}
const _persisted = _idLoad();
const CINA = {
  signedIn: _persisted.signedIn,
  handle: _persisted.handle || "you.eth",
  ens: "you.cina.eth",
  email: _persisted.email || "",
  address: "0xA1c4\u2026f3D2",
  tier: "Patron",
  joined: "2025-09",
  walletUSD: 28413
};
function _idSave() {
  try {
    localStorage.setItem(CINA_KEY, JSON.stringify({
      signedIn: CINA.signedIn,
      handle: CINA.handle,
      email: CINA.email
    }));
    localStorage.setItem(LEGACY.signedIn, JSON.stringify(CINA.signedIn));
    localStorage.setItem(LEGACY.handle, JSON.stringify(CINA.handle));
    localStorage.setItem(LEGACY.email, JSON.stringify(CINA.email));
  } catch {
  }
}
const _idSubs = /* @__PURE__ */ new Set();
function bumpCina() {
  _idSubs.forEach((fn) => fn(Date.now()));
}
function useCinaId() {
  const [, setT] = useIdState(0);
  useIdEffect(() => {
    _idSubs.add(setT);
    const onTx = () => setT(Date.now());
    window.addEventListener("cina:chain-tx", onTx);
    return () => {
      _idSubs.delete(setT);
      window.removeEventListener("cina:chain-tx", onTx);
    };
  }, []);
  return CINA;
}
function cinaWallet() {
  const u = window.USER;
  if (u && typeof u.walletUSD === "number") return u.walletUSD;
  try {
    const saved = JSON.parse(localStorage.getItem("cina:chain:user-ledger") || "null");
    if (saved && typeof saved.walletUSD === "number") return saved.walletUSD;
  } catch (_) {
  }
  return CINA.walletUSD;
}
function cinaHoldingsCount() {
  const h = window.USER?.holdings;
  if (!Array.isArray(h)) return null;
  return h.filter((x) => (x.qty || 0) > 0).length;
}
function cinaGlyph() {
  return (CINA.handle || "Y").trim().charAt(0).toUpperCase() || "Y";
}
function _idMoney(n) {
  return window.fmtUSD ? window.fmtUSD(n) : "$" + Math.round(n || 0).toLocaleString("en-US");
}
function _idToast(o) {
  if (window.toast) window.toast(o);
}
function _idDownload(name, text, mime) {
  try {
    const blob = new Blob([text], { type: mime || "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
  } catch (e) {
    _idToast({ title: "DOWNLOAD", text: "Couldn't start the download.", kind: "warn" });
  }
}
const CINA_ACCT_KEY = "cina:account-prefs";
function _acctLoad() {
  try {
    return JSON.parse(localStorage.getItem(CINA_ACCT_KEY) || "{}");
  } catch {
    return {};
  }
}
function _acctSave(patch) {
  const next = { ..._acctLoad(), ...patch };
  try {
    localStorage.setItem(CINA_ACCT_KEY, JSON.stringify(next));
  } catch {
  }
  return next;
}
function cinaSync({ signedIn, handle, email } = {}) {
  if (signedIn != null) CINA.signedIn = !!signedIn;
  if (handle) CINA.handle = handle;
  if (email != null) CINA.email = email;
  _idSave();
  if (window.USER) window.USER.handle = CINA.handle;
  if (window.SESSION) {
    window.SESSION.signedIn = CINA.signedIn;
    window.SESSION.handle = CINA.handle;
    if (email != null) window.SESSION.email = CINA.email;
  }
  if (window.bumpSession) window.bumpSession();
  bumpCina();
}
function cinaSignIn({ email, handle, method } = {}) {
  const h = handle || (email ? email.split("@")[0] : CINA.handle) || "you.eth";
  cinaSync({ signedIn: true, handle: h, email: email || CINA.email });
  _idToast({ title: "WELCOME", text: `Signed in to Cina${method ? " \xB7 " + method : ""}`, kind: "good" });
}
function cinaSignOut() {
  cinaSync({ signedIn: false });
  if (window.CinaCloudAuth && typeof window.CinaCloudAuth.signOut === "function") {
    window.CinaCloudAuth.signOut().catch(() => {
    });
  }
  _idToast({ title: "SIGNED OUT", text: "Your Cina ID is signed out everywhere", kind: "info" });
}
const CINA_SURFACES = [
  { id: "watch", label: "Watch", sub: "Screenings & catalog", href: "index.html", dot: "var(--c-good)" },
  { id: "studio", label: "Studio", sub: "Filmmaking pipeline", href: "Cina.html", dot: "var(--c-amber)" },
  { id: "producers", label: "Producers", sub: "Smart-contract market", href: "Producers.html", dot: `var(--c-blood, ${tkc("cat-3")})` }
];
let _cinaSignInOpener = null;
function registerCinaSignIn(fn) {
  _cinaSignInOpener = fn;
}
function openCinaSignIn(opts) {
  if (window.CinaAuth) {
    window.CinaAuth.open(opts || {});
    return;
  }
  if (window.openSignIn && window.SESSION) {
    window.openSignIn(opts || {});
    return;
  }
  if (_cinaSignInOpener) _cinaSignInOpener(opts || {});
}
let _cinaSettingsOpener = null;
function openCinaAccountSettings(tab = "profile") {
  if (_cinaSettingsOpener) _cinaSettingsOpener(tab);
}
function CinaSignInModal({ surface, accent = tkc("amber"), onClose }) {
  if (window.CinaAuthSheet) return /* @__PURE__ */ React.createElement(window.CinaAuthSheet, { ctx: { surface, accent }, onClose });
  return null;
}
function AppearanceSection({ accent = "var(--c-amber)" }) {
  const [app, setApp] = useCinaAppearance();
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "1.4rem" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, textTransform: "uppercase", marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--c-line)" } }, "Display Mood \xB7 Color Theme"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 11.5rem), 1fr))", gap: "0.6rem" } }, CINA_MOODS_META.map((m) => {
    const on = app.mood === m.id;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: m.id,
        type: "button",
        "aria-pressed": on,
        onClick: () => {
          setApp({ mood: m.id });
          _idToast({ title: "DISPLAY MOOD", text: `${m.label} \xB7 ${m.sub}`, kind: "good" });
        },
        style: {
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          width: "100%",
          padding: "0.75rem 0.85rem",
          textAlign: "left",
          cursor: "pointer",
          background: on ? "rgba(var(--accent-rgb),.10)" : "var(--c-panel-2)",
          border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`,
          borderRadius: "var(--r-2)",
          color: "var(--c-ink)"
        }
      },
      /* @__PURE__ */ React.createElement("span", { style: {
        width: "1.65rem",
        height: "1.65rem",
        borderRadius: "50%",
        flexShrink: 0,
        background: m.bg,
        border: `2px solid ${m.accent}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      } }, /* @__PURE__ */ React.createElement("span", { style: { width: "0.55rem", height: "0.55rem", borderRadius: "50%", background: m.accent } })),
      /* @__PURE__ */ React.createElement("span", { style: { display: "flex", flexDirection: "column", minWidth: 0, flex: 1 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.1, color: "var(--c-ink)" } }, m.label), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: "0.2rem" } }, m.sub))
    );
  }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, textTransform: "uppercase", marginBottom: "0.65rem", paddingBottom: "0.45rem", borderBottom: "1px solid var(--c-line)" } }, "Editorial Density"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.5rem" } }, CINA_VOICES_META.map((v) => {
    const on = app.voice === v.id;
    return /* @__PURE__ */ React.createElement("button", { key: v.id, type: "button", onClick: () => setApp({ voice: v.id }), style: {
      padding: "0.65rem 0.7rem",
      textAlign: "left",
      cursor: "pointer",
      background: on ? "rgba(var(--accent-rgb),.10)" : "var(--c-panel-2)",
      border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`,
      borderRadius: "var(--r-2)",
      color: "var(--c-ink)"
    } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", fontWeight: on ? 600 : 500 } }, v.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: "0.18rem", lineHeight: 1.3 } }, v.sub));
  }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, textTransform: "uppercase", marginBottom: "0.65rem", paddingBottom: "0.45rem", borderBottom: "1px solid var(--c-line)" } }, "Projection Motion"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.5rem" } }, CINA_MOTIONS_META.map((m) => {
    const on = app.motion === m.id;
    return /* @__PURE__ */ React.createElement("button", { key: m.id, type: "button", onClick: () => setApp({ motion: m.id }), style: {
      padding: "0.65rem 0.7rem",
      textAlign: "left",
      cursor: "pointer",
      background: on ? "rgba(var(--accent-rgb),.10)" : "var(--c-panel-2)",
      border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`,
      borderRadius: "var(--r-2)",
      color: "var(--c-ink)"
    } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", fontWeight: on ? 600 : 500 } }, m.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: "0.18rem", lineHeight: 1.3 } }, m.sub));
  }))));
}
const CINA_ACCT_TABS = [
  { id: "profile", label: "Profile" },
  { id: "appearance", label: "Display" },
  { id: "studio", label: "Studio" },
  { id: "wallet", label: "Wallet" },
  { id: "billing", label: "Billing" },
  { id: "security", label: "Security" },
  { id: "alerts", label: "Alerts" },
  { id: "privacy", label: "Privacy" }
];
function _acctField() {
  return {
    width: "100%",
    boxSizing: "border-box",
    padding: "0.65rem 0.8rem",
    background: tkc("panel-2"),
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-2)",
    color: tkc("ink"),
    fontSize: "var(--fs-body)",
    fontFamily: "inherit",
    outline: "none"
  };
}
function CinaAcctLabel({ children }) {
  return /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase", marginBottom: "0.45rem" } }, children);
}
function CinaAcctToggle({ label, hint, on, onToggle, accent }) {
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "0.8rem" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink)" } }, label), hint && /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: "0.15rem", lineHeight: 1.4 } }, hint)), /* @__PURE__ */ React.createElement("button", { onClick: onToggle, role: "switch", "aria-checked": !!on, "aria-label": label, style: {
    width: "2.5rem",
    height: "1.4rem",
    borderRadius: "var(--r-full)",
    padding: "0.12rem",
    flexShrink: 0,
    background: on ? accent : "var(--c-panel-2)",
    border: `1px solid ${on ? accent : "var(--c-line-2)"}`,
    cursor: "pointer",
    position: "relative",
    transition: "background .15s, border-color .15s"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: "1rem",
    height: "1rem",
    borderRadius: "50%",
    background: on ? tkc("void") : "var(--c-ink-3)",
    transform: on ? "translateX(1.1rem)" : "translateX(0)",
    transition: "transform .15s ease"
  } })));
}
function BillingSheet({ kind, accent, card, tier, cardLast4, tiers, onClose, onChoose, onSaveCard }) {
  const [num, setNum] = useIdState("");
  const [exp, setExp] = useIdState("");
  const [cvc, setCvc] = useIdState("");
  const sheetField = {
    width: "100%",
    boxSizing: "border-box",
    padding: "0.65rem 0.8rem",
    background: "var(--c-panel-2)",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-2)",
    color: "var(--c-ink)",
    fontSize: "var(--fs-body)",
    fontFamily: "var(--f-mono)",
    outline: "none"
  };
  const title = kind === "card" ? "Payment method" : kind === "manage" ? "Manage plan" : "Choose a plan";
  const numClean = num.replace(/\D/g, "");
  return /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: { position: "absolute", inset: 0, zIndex: 5, background: "rgba(0,0,0,.5)", backdropFilter: "blur(2px)", display: "flex", alignItems: "flex-end" } }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: { width: "100%", maxHeight: "86%", overflowY: "auto", background: "var(--c-panel)", borderTop: "1px solid var(--c-line-2)", padding: "1.3rem 1.4rem 1.5rem" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" } }, /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" } }, title), /* @__PURE__ */ React.createElement("button", { onClick: onClose, "aria-label": "Close", title: "Close", className: "btn-ghost btn-icon", style: { width: "1.8rem", height: "1.8rem" } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 12 }))), kind === "card" ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "0.8rem" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(CinaAcctLabel, null, "Card number"), /* @__PURE__ */ React.createElement("input", { value: num, onChange: (e) => setNum(e.target.value), placeholder: "4242 4242 4242 4242", style: sheetField })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.65rem" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement(CinaAcctLabel, null, "Expiry"), /* @__PURE__ */ React.createElement("input", { value: exp, onChange: (e) => setExp(e.target.value), placeholder: "MM / YY", style: sheetField })), /* @__PURE__ */ React.createElement("div", { style: { width: "35%" } }, /* @__PURE__ */ React.createElement(CinaAcctLabel, null, "CVC"), /* @__PURE__ */ React.createElement("input", { value: cvc, onChange: (e) => setCvc(e.target.value), placeholder: "123", style: sheetField }))), /* @__PURE__ */ React.createElement("button", { onClick: () => onSaveCard(num), disabled: numClean.length < 4, style: { height: "2.6rem", borderRadius: "var(--r-2)", marginTop: "0.25rem", background: accent, color: "var(--c-on-amber)", border: "none", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, cursor: numClean.length < 4 ? "not-allowed" : "pointer", opacity: numClean.length < 4 ? 0.5 : 1 } }, "SAVE CARD")) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "0.65rem" } }, tiers.map((p) => {
    const current = p.id === tier;
    return /* @__PURE__ */ React.createElement("div", { key: p.id, style: { ...card, padding: "0.9rem 1rem", borderColor: current ? accent : "var(--c-line)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.6rem" } }, /* @__PURE__ */ React.createElement("span", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" } }, p.id), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: current ? accent : "var(--c-ink-3)" } }, p.price ? "$" + p.price + " / MO" : "FREE")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5, margin: "0.4rem 0 0.75rem" } }, p.blurb), /* @__PURE__ */ React.createElement("button", { onClick: () => onChoose(p.id), disabled: current, style: {
      width: "100%",
      height: "2.2rem",
      borderRadius: "var(--r-2)",
      background: current ? "transparent" : p.id === "Free" ? "transparent" : accent,
      color: current ? "var(--c-good)" : p.id === "Free" ? "var(--c-ink-2)" : tkc("on-amber"),
      border: current ? "1px solid var(--c-good)" : p.id === "Free" ? "1px solid var(--c-line-2)" : "none",
      fontFamily: "var(--f-mono)",
      fontSize: "var(--fs-label)",
      letterSpacing: ".16em",
      fontWeight: 700,
      cursor: current ? "default" : "pointer"
    } }, current ? "\u2713 CURRENT PLAN" : p.id === "Free" ? "DOWNGRADE TO FREE" : "SWITCH TO " + p.id.toUpperCase()));
  }))));
}
function CinaAccountPanel({ surface, accent = "var(--c-amber)", tab = "profile", onTab, onClose }) {
  useCinaId();
  const prefs = _acctLoad();
  const [name, setName] = useIdState(CINA.handle || "");
  const [email, setEmail] = useIdState(CINA.email || "");
  const [role, setRole] = useIdState(prefs.role || "Director");
  const [bio, setBio] = useIdState(prefs.bio != null ? prefs.bio : "Building cinema on Cina.");
  const [saved, setSaved] = useIdState(false);
  const [alerts, setAlerts] = useIdState(prefs.alerts || { drops: true, royalties: true, social: true, marketing: false });
  const [privacy, setPrivacy] = useIdState(prefs.privacy || { history: false, recs: true, holdings: false });
  const [billingSheet, setBillingSheet] = useIdState(null);
  const [tier, setTier] = useIdState(prefs.tier || CINA.tier);
  const [cardLast4, setCardLast4] = useIdState(prefs.cardLast4 || "4242");
  const [avatar, setAvatar] = useIdState(prefs.avatar || null);
  const [conns, setConns] = useIdState(prefs.connections || {});
  const [subs, setSubs] = useIdState(prefs.subs || [
    { id: "voss", name: "Elias Voss", price: 8, renews: "Jul 12, 2026", accent: tkc("amber") },
    { id: "hara", name: "Hara Lin", price: 6, renews: "Jul 3, 2026", accent: tkc("cat-1") }
  ]);
  const avatarInputRef = useIdRef(null);
  const PLAN_TIERS = [
    { id: "Free", price: 0, blurb: "Watch with ads. Public catalog, watchlist, ratings." },
    { id: "Patron", price: 12, blurb: "Ad-free, 24h-early drops, holder rooms, priority render queue." },
    { id: "House", price: 29, blurb: "Everything in Patron + 4K, offline, director's commentary, cinema mode." }
  ];
  const planPrice = (PLAN_TIERS.find((p) => p.id === tier) || {}).price;
  const onAvatarFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      setAvatar(r.result);
      _acctSave({ avatar: r.result });
      _idToast({ title: "AVATAR", text: "New avatar saved.", kind: "good" });
    };
    r.readAsDataURL(f);
  };
  const [studioPrefs, setStudioPrefs] = useIdState(() => Object.assign({
    autoSave: true,
    autoLock: true,
    renderQuality: "high",
    defaultChain: "base"
  }, prefs.studioPrefs || {}));
  const [twTick, setTwTick] = useIdState(0);
  const saveStudioPref = (k, v) => {
    const next = Object.assign({}, studioPrefs, { [k]: v });
    setStudioPrefs(next);
    _acctSave({ studioPrefs: next });
    _idToast({ title: "STUDIO PREFERENCE", text: `${k} updated.`, kind: "good" });
  };
  const choosePlan = (id) => {
    const p = PLAN_TIERS.find((x) => x.id === id);
    const applyPlan = () => {
      CINA.tier = id;
      bumpCina();
      setTier(id);
      _acctSave({ tier: id });
      setBillingSheet(null);
      _idToast({ title: "PLAN UPDATED", text: id === "Free" ? "You're on the free plan." : `You're on ${id} \xB7 ${_idMoney(p.price)}/mo.`, kind: "good" });
    };
    if (p && p.price > 0 && typeof window.openPay === "function") {
      setBillingSheet(null);
      window.openPay({
        kind: "sub",
        title: `Cina ${id} Plan`,
        subtitle: p.blurb,
        priceUSD: p.price,
        recurring: "month",
        perks: [p.blurb, "Chained smart-contract split discounts", "Cancel or downgrade anytime"],
        onConfirm: applyPlan
      });
      return;
    }
    applyPlan();
  };
  const saveCard = (raw) => {
    const clean = (raw || "").replace(/\D/g, "").slice(-4) || cardLast4;
    setCardLast4(clean);
    _acctSave({ cardLast4: clean });
    setBillingSheet(null);
    _idToast({ title: "CARD UPDATED", text: "\u2022\u2022\u2022\u2022 " + clean + " is now your default.", kind: "good" });
  };
  const cancelSub = (s) => {
    const next = subs.filter((x) => x.id !== s.id);
    setSubs(next);
    _acctSave({ subs: next });
    _idToast({ title: "SUBSCRIPTION CANCELLED", text: `${s.name} won't renew. Access until ${s.renews}.`, kind: "info" });
  };
  const toggleConn = (key, label) => {
    const next = { ...conns, [key]: !conns[key] };
    setConns(next);
    _acctSave({ connections: next });
    _idToast({ title: label.toUpperCase(), text: next[key] ? "Connected." : "Disconnected.", kind: next[key] ? "good" : "info" });
  };
  const downloadInvoice = (month, amt) => {
    const receipt = [
      "CINA \u2014 RECEIPT",
      "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500",
      "Billed to:  " + (CINA.handle || "you") + (CINA.email ? "  \xB7  " + CINA.email : ""),
      "Period:     " + month,
      "Plan:       " + tier + " (" + _idMoney(planPrice) + "/mo)",
      "Amount:     " + amt,
      "Card:       \u2022\u2022\u2022\u2022 " + cardLast4,
      "Status:     PAID"
    ].join("\n");
    _idDownload("cina-receipt-" + month.replace(/\s+/g, "-").toLowerCase() + ".txt", receipt, "text/plain");
    _idToast({ title: "RECEIPT", text: month + " receipt downloaded.", kind: "good" });
  };
  const exportData = () => {
    const payload = {
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      account: { handle: CINA.handle, email: CINA.email, tier, walletAddress: CINA.address },
      subscriptions: subs,
      preferences: { alerts, privacy, connections: conns, appearance: CinaAppearance.get() },
      billing: { defaultCard: "\u2022\u2022\u2022\u2022 " + cardLast4 }
    };
    _idDownload("cina-data-export.json", JSON.stringify(payload, null, 2), "application/json");
    _idToast({ title: "EXPORT", text: "Your data archive downloaded.", kind: "good" });
  };
  const deleteAccount = async () => {
    if (window.cinaDeleteAccount) {
      onClose();
      window.cinaDeleteAccount();
      return;
    }
    cinaSignOut();
    onClose();
  };
  useIdEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  const field = _acctField();
  const glyph = (name || CINA.handle || "Y").trim().charAt(0).toUpperCase() || "Y";
  const saveProfile = () => {
    cinaSync({ handle: name.trim() || CINA.handle, email: email.trim() });
    _acctSave({ role, bio });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
    _idToast({ title: "PROFILE SAVED", text: "Your Cina ID has been updated.", kind: "good" });
  };
  const toggleAlert = (k) => {
    const next = { ...alerts, [k]: !alerts[k] };
    setAlerts(next);
    _acctSave({ alerts: next });
  };
  const togglePrivacy = (k) => {
    const next = { ...privacy, [k]: !privacy[k] };
    setPrivacy(next);
    _acctSave({ privacy: next });
  };
  const goWallet = () => {
    onClose();
    window.location.href = "index.html#/wallet";
  };
  const card = { background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" };
  const sectionTitle = (t) => /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, textTransform: "uppercase", marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--c-line)" } }, t);
  return ReactDOM.createPortal(/* @__PURE__ */ React.createElement("div", { onClick: onClose, style: {
    position: "fixed",
    inset: 0,
    zIndex: 9710,
    background: "rgba(0,0,0,.6)",
    backdropFilter: "blur(6px)",
    display: "flex",
    justifyContent: "flex-end"
  } }, /* @__PURE__ */ React.createElement("style", null, `@keyframes cinaAcctSlide{from{transform:translateX(6%);opacity:.6}to{transform:translateX(0);opacity:1}}`), /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
    width: "min(32rem, 100%)",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "var(--c-panel)",
    borderLeft: "1px solid var(--c-line-2)",
    position: "relative",
    boxShadow: "-24px 0 60px rgba(0,0,0,.55)",
    animation: "cinaAcctSlide .24s cubic-bezier(.2,.8,.2,1)"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.1rem 1.4rem", borderBottom: "1px solid var(--c-line)", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", letterSpacing: "-0.01em" } }, "User Settings"), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: "0.2rem" } }, CINA.signedIn ? `${(CINA.handle || "").toUpperCase()} \xB7 CINA ID` : "GUEST \xB7 SIGN IN OR CUSTOMIZE DISPLAY")), /* @__PURE__ */ React.createElement("button", { onClick: onClose, "aria-label": "Close", title: "Close", className: "btn-ghost btn-icon", style: { width: "2rem", height: "2rem" } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 13 }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "0.15rem 1.05rem", padding: "0 1.4rem", borderBottom: "1px solid var(--c-line)", flexShrink: 0 } }, CINA_ACCT_TABS.map((t) => {
    const on = tab === t.id;
    return /* @__PURE__ */ React.createElement("button", { key: t.id, onClick: () => onTab(t.id), style: {
      whiteSpace: "nowrap",
      padding: "0.7rem 0 0.6rem",
      cursor: "pointer",
      background: "transparent",
      border: "none",
      borderRadius: 0,
      borderBottom: `2px solid ${on ? accent : "transparent"}`,
      color: on ? "var(--c-ink)" : "var(--c-ink-3)",
      fontFamily: "var(--f-sans)",
      fontSize: "var(--fs-body)",
      fontWeight: on ? 600 : 450
    } }, t.label);
  })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minHeight: 0, overflowY: "auto", padding: "1.35rem 1.4rem 2.25rem" } }, tab === "appearance" && /* @__PURE__ */ React.createElement(AppearanceSection, { accent }), tab === "studio" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "1.35rem" } }, /* @__PURE__ */ React.createElement("div", null, sectionTitle("Studio workflow"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "1rem" } }, /* @__PURE__ */ React.createElement(CinaAcctToggle, { accent, label: "Auto-save timeline & script", hint: "Save every 30 seconds while editing scenes.", on: studioPrefs.autoSave, onToggle: () => saveStudioPref("autoSave", !studioPrefs.autoSave) }), /* @__PURE__ */ React.createElement(CinaAcctToggle, { accent, label: "Auto-lock cuts", hint: "Lock a cut automatically after 48 hours of no edits.", on: studioPrefs.autoLock, onToggle: () => saveStudioPref("autoLock", !studioPrefs.autoLock) }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(CinaAcctLabel, null, "Default render quality"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.5rem" } }, ["draft", "high", "ultra"].map((q) => {
    const on = studioPrefs.renderQuality === q;
    return /* @__PURE__ */ React.createElement("button", { key: q, type: "button", onClick: () => saveStudioPref("renderQuality", q), style: {
      padding: "0.55rem 0",
      fontSize: "var(--fs-label)",
      cursor: "pointer",
      borderRadius: 0,
      background: on ? "rgba(var(--accent-rgb),.12)" : "var(--c-panel-2)",
      border: `1px solid ${on ? accent : "var(--c-line-2)"}`,
      color: on ? accent : "var(--c-ink-2)",
      fontFamily: "var(--f-mono)",
      letterSpacing: ".14em",
      textTransform: "uppercase"
    } }, q);
  }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(CinaAcctLabel, null, "Default settlement chain"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "0.45rem" } }, ["base", "ethereum", "zora", "polygon"].map((c) => {
    const on = studioPrefs.defaultChain === c;
    return /* @__PURE__ */ React.createElement("button", { key: c, type: "button", onClick: () => saveStudioPref("defaultChain", c), style: {
      padding: "0.5rem 0",
      fontSize: "var(--fs-label)",
      cursor: "pointer",
      borderRadius: 0,
      background: on ? "rgba(var(--accent-rgb),.12)" : "var(--c-panel-2)",
      border: `1px solid ${on ? accent : "var(--c-line-2)"}`,
      color: on ? accent : "var(--c-ink-2)",
      fontFamily: "var(--f-mono)",
      letterSpacing: ".08em",
      textTransform: "uppercase"
    } }, c);
  }))), window.__cinaTweaks && window.__setCinaTweak && /* @__PURE__ */ React.createElement("div", null, sectionTitle("Studio viewport & darkroom filters"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "1rem" } }, /* @__PURE__ */ React.createElement(CinaAcctToggle, { accent, label: "2.39:1 Letterbox matte", hint: "Cinema framing guides across preview monitors.", on: !!window.__cinaTweaks.letterbox, onToggle: () => {
    window.__setCinaTweak("letterbox", !window.__cinaTweaks.letterbox);
    setTwTick((n) => n + 1);
  } }), /* @__PURE__ */ React.createElement(CinaAcctToggle, { accent, label: "35mm film grain", hint: "Subtle Kodak 5219 texture over rendered frames.", on: !!window.__cinaTweaks.grain, onToggle: () => {
    window.__setCinaTweak("grain", !window.__cinaTweaks.grain);
    setTwTick((n) => n + 1);
  } }), /* @__PURE__ */ React.createElement(CinaAcctToggle, { accent, label: "Monitor vignette", hint: "Darken perimeter of playback canvases.", on: !!window.__cinaTweaks.vignette, onToggle: () => {
    window.__setCinaTweak("vignette", !window.__cinaTweaks.vignette);
    setTwTick((n) => n + 1);
  } })))), tab === "profile" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "1rem" } }, !CINA.signedIn && /* @__PURE__ */ React.createElement("div", { style: { ...card, padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.8rem" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)" } }, "You are browsing signed out"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: "0.15rem" } }, "Sign in with Google, passkey, or wallet to sync stakes and studio vault.")), /* @__PURE__ */ React.createElement("button", { onClick: () => {
    onClose();
    openCinaSignIn({ surface, accent });
  }, style: {
    padding: "0.55rem 1rem",
    background: accent,
    color: "var(--c-on-amber)",
    border: "none",
    borderRadius: "var(--r-2)",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".14em",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap"
  } }, "SIGN IN")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "1rem" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: "3.5rem",
    height: "3.5rem",
    borderRadius: "50%",
    flexShrink: 0,
    background: "var(--c-panel-2)",
    border: `2px solid ${accent}`,
    color: accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--f-display)",
    fontStyle: "italic",
    fontSize: "var(--fs-title)",
    fontWeight: 500,
    overflow: "hidden"
  } }, avatar ? /* @__PURE__ */ React.createElement("img", { src: avatar, alt: "", style: { width: "100%", height: "100%", objectFit: "cover" } }) : glyph), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" } }, name || CINA.handle), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: "0.15rem" } }, role, " \xB7 ", CINA.tier, " plan"), /* @__PURE__ */ React.createElement("input", { ref: avatarInputRef, type: "file", accept: "image/*", onChange: onAvatarFile, style: { display: "none" } }), /* @__PURE__ */ React.createElement("button", { className: "t-mono", onClick: () => avatarInputRef.current && avatarInputRef.current.click(), style: {
    marginTop: "0.4rem",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    color: accent,
    background: "transparent",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-1)",
    padding: "0.25rem 0.55rem",
    cursor: "pointer"
  } }, "CHANGE AVATAR"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(CinaAcctLabel, null, "Display name / ENS"), /* @__PURE__ */ React.createElement("input", { value: name, onChange: (e) => setName(e.target.value), style: field })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(CinaAcctLabel, null, "Email"), /* @__PURE__ */ React.createElement("input", { value: email, onChange: (e) => setEmail(e.target.value), type: "email", placeholder: "you@domain.com", style: field })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(CinaAcctLabel, null, "Primary role"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.4rem", flexWrap: "wrap" } }, ["Director", "Writer", "Producer", "Editor", "Watcher"].map((r) => /* @__PURE__ */ React.createElement("button", { key: r, onClick: () => setRole(r), style: {
    padding: "0.45rem 0.75rem",
    fontSize: "var(--fs-label)",
    cursor: "pointer",
    borderRadius: "var(--r-1)",
    fontFamily: "var(--f-sans)",
    background: role === r ? "rgba(var(--accent-rgb),.10)" : "transparent",
    border: `1px solid ${role === r ? accent : "var(--c-line-2)"}`,
    color: role === r ? accent : "var(--c-ink-2)"
  } }, r)))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(CinaAcctLabel, null, "Bio"), /* @__PURE__ */ React.createElement("textarea", { value: bio, onChange: (e) => setBio(e.target.value), rows: 2, style: { ...field, resize: "vertical" } })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(CinaAcctLabel, null, "Connected accounts"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "0.4rem" } }, (() => {
    const cloudU = window.CinaCloudAuth?.getCurrentUser?.();
    return [
      {
        key: "google",
        name: "Google \xB7 Cloud SQL Vault",
        value: cloudU ? cloudU.email || cloudU.displayName || "Connected" : "Not connected",
        connected: !!cloudU,
        onAction: () => {
          if (cloudU) {
            window.CinaCloudAuth?.signOut?.().then(() => setSaved((s) => !s));
          } else {
            window.CinaCloudAuth?.signInWithGoogle?.().then(() => _idToast({ title: "CLOUD VAULT", text: "Connected with Google.", kind: "good" })).catch(() => {
            });
          }
        }
      },
      { key: "wallet", name: "Base Smart Wallet", value: CINA.address, connected: true, primary: true },
      { key: "x", name: "X / Twitter", value: "@" + (CINA.handle || "you").replace(/\..*$/, ""), connected: true, primary: true },
      { key: "youtube", name: "YouTube", value: conns.youtube ? "Connected" : "Not connected", connected: !!conns.youtube }
    ];
  })().map((a) => /* @__PURE__ */ React.createElement("div", { key: a.name, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.55rem 0.8rem", ...card } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0, paddingRight: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink)" } }, a.name), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: a.connected ? "var(--c-ink-3)" : "var(--c-ink-4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, a.value)), /* @__PURE__ */ React.createElement("button", { onClick: () => a.onAction ? a.onAction() : a.primary ? _idToast({ title: a.name.toUpperCase(), text: "Primary connection \u2014 managed in Wallet.", kind: "info" }) : toggleConn(a.key, a.name), className: "t-mono", style: {
    fontSize: "var(--fs-label)",
    letterSpacing: ".14em",
    color: a.connected ? "var(--c-ink-3)" : accent,
    background: "transparent",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-1)",
    padding: "0.25rem 0.55rem",
    cursor: "pointer",
    flexShrink: 0
  } }, a.primary ? "PRIMARY" : a.connected ? "DISCONNECT" : "CONNECT")))))), tab === "billing" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "1.4rem" } }, /* @__PURE__ */ React.createElement("div", null, sectionTitle("Current plan"), /* @__PURE__ */ React.createElement("div", { style: { ...card, padding: "1rem 1.1rem" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.6rem" } }, /* @__PURE__ */ React.createElement("span", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)" } }, tier), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: accent } }, planPrice ? "$" + planPrice + " / MO" : "FREE")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5, margin: "0.5rem 0 0.9rem" } }, "Early access to drops, smart-contract split discounts, holder rooms, and priority render queue."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.5rem" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setBillingSheet("plan"), style: { flex: 1, height: "2.3rem", borderRadius: "var(--r-2)", background: accent, color: "var(--c-on-amber)", border: "none", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, cursor: "pointer" } }, "CHANGE PLAN"), /* @__PURE__ */ React.createElement("button", { onClick: () => choosePlan("Free"), disabled: tier === "Free", style: { flex: 1, height: "2.3rem", borderRadius: "var(--r-2)", background: "transparent", color: tier === "Free" ? "var(--c-ink-4)" : "var(--c-ink-2)", border: "1px solid var(--c-line-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", cursor: tier === "Free" ? "default" : "pointer" } }, tier === "Free" ? "FREE PLAN" : "CANCEL PLAN")))), /* @__PURE__ */ React.createElement("div", null, sectionTitle("Payment method"), /* @__PURE__ */ React.createElement("div", { style: { ...card, padding: "0.75rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink)" } }, "VISA \u2022\u2022\u2022\u2022 ", cardLast4), /* @__PURE__ */ React.createElement("button", { onClick: () => setBillingSheet("card"), className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)", padding: "0.25rem 0.55rem", cursor: "pointer" } }, "EDIT"))), /* @__PURE__ */ React.createElement("div", null, sectionTitle("Recent invoices"), /* @__PURE__ */ React.createElement("div", { style: { ...card, overflow: "hidden" } }, [["May 2026", "$12.00"], ["Apr 2026", "$12.00"], ["Mar 2026", "$12.00"]].map(([m, amt], i) => /* @__PURE__ */ React.createElement("div", { key: m, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.7rem 1rem", borderTop: i ? "1px solid var(--c-line)" : "none" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-2)" } }, m), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "0.9rem" } }, /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-body)", color: "var(--c-ink)" } }, amt), /* @__PURE__ */ React.createElement("button", { onClick: () => downloadInvoice(m, amt), className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, background: "transparent", border: "none", cursor: "pointer" } }, "PDF \u2193")))))), /* @__PURE__ */ React.createElement("div", null, sectionTitle("Subscriptions"), subs.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { ...card, padding: "1rem", fontSize: "var(--fs-body)", color: "var(--c-ink-4)" } }, "No active creator subscriptions.") : /* @__PURE__ */ React.createElement("div", { style: { ...card, overflow: "hidden" } }, subs.map((s, i) => /* @__PURE__ */ React.createElement("div", { key: s.id, style: { display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.7rem 1rem", borderTop: i ? "1px solid var(--c-line)" : "none" } }, /* @__PURE__ */ React.createElement("span", { style: { width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: s.accent, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink)" } }, s.name), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)" } }, _idMoney(s.price), "/MO \xB7 RENEWS ", s.renews.toUpperCase())), /* @__PURE__ */ React.createElement("button", { onClick: () => cancelSub(s), className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)", padding: "0.25rem 0.55rem", cursor: "pointer" } }, "CANCEL")))))), tab === "wallet" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "1.4rem" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, padding: "1rem", borderRight: "1px solid var(--c-line)", background: "var(--c-panel-2)" } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" } }, "USDC BALANCE"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: "0.25rem" } }, _idMoney(cinaWallet()))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, padding: "1rem", background: "var(--c-panel-2)" } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" } }, "PASS STAKES"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: "0.25rem" } }, cinaHoldingsCount() == null ? "\u2014" : cinaHoldingsCount()))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(CinaAcctLabel, null, "Smart-Contract Payout Address (Base L2)"), /* @__PURE__ */ React.createElement("div", { style: { ...card, padding: "0.7rem 0.9rem", display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-body)", color: "var(--c-ink)" } }, CINA.address), /* @__PURE__ */ React.createElement("button", { onClick: () => {
    navigator.clipboard && navigator.clipboard.writeText(CINA.address);
    _idToast({ title: "COPIED", text: "Wallet address copied.", kind: "good" });
  }, className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)", padding: "0.25rem 0.55rem", cursor: "pointer" } }, "COPY"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.5rem" } }, /* @__PURE__ */ React.createElement("button", { onClick: goWallet, style: { flex: 1, height: "2.5rem", borderRadius: "var(--r-2)", background: accent, color: "var(--c-on-amber)", border: "none", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, cursor: "pointer" } }, "OPEN FULL WALLET \u2192"), /* @__PURE__ */ React.createElement("button", { onClick: () => {
    onClose();
    window.location.href = "index.html#/payouts";
  }, style: { flex: 1, height: "2.5rem", borderRadius: "var(--r-2)", background: "transparent", color: "var(--c-ink-2)", border: "1px solid var(--c-line-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", cursor: "pointer" } }, "CHAINED PAYOUTS"))), tab === "alerts" && /* @__PURE__ */ React.createElement("div", null, sectionTitle("Email & push"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "1rem" } }, /* @__PURE__ */ React.createElement(CinaAcctToggle, { accent, label: "Drops & premieres", hint: "New episodes, premieres, and films from studios you follow.", on: alerts.drops, onToggle: () => toggleAlert("drops") }), /* @__PURE__ */ React.createElement(CinaAcctToggle, { accent, label: "Chained smart-contract payouts", hint: "Instant alert whenever CinaSplitRouter streams USDC to your wallet.", on: alerts.royalties, onToggle: () => toggleAlert("royalties") }), /* @__PURE__ */ React.createElement(CinaAcctToggle, { accent, label: "Replies & follows", hint: "Comments, follows, and watch-party invites.", on: alerts.social, onToggle: () => toggleAlert("social") }), /* @__PURE__ */ React.createElement(CinaAcctToggle, { accent, label: "Product & dispatches", hint: "Occasional news about Cina. No more than monthly.", on: alerts.marketing, onToggle: () => toggleAlert("marketing") }))), tab === "security" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "1.25rem" } }, window.CinaCredentialList ? /* @__PURE__ */ React.createElement(window.CinaCredentialList, { accent }) : null, /* @__PURE__ */ React.createElement("div", { style: { paddingTop: "1rem", borderTop: "1px solid var(--c-line)" } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: "0.6rem" } }, "SESSION"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55, margin: "0 0 0.8rem" } }, "Signing out clears your Cina ID on Watch, Studio, and Producers at once. Passkeys remain stored safely on this device."), /* @__PURE__ */ React.createElement("button", { onClick: () => {
    if (window.CinaAuth) window.CinaAuth.signOut();
    else cinaSignOut();
    onClose && onClose();
  }, className: "btn", style: { height: "2.3rem", fontSize: "var(--fs-body)" } }, "Sign out everywhere"))), tab === "privacy" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "1.4rem" } }, /* @__PURE__ */ React.createElement("div", null, sectionTitle("Privacy"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "1rem" } }, /* @__PURE__ */ React.createElement(CinaAcctToggle, { accent, label: "Public watch history", hint: "Let others see what you've watched on your profile.", on: privacy.history, onToggle: () => togglePrivacy("history") }), /* @__PURE__ */ React.createElement(CinaAcctToggle, { accent, label: "Personalized recommendations", hint: "Use your viewing to tune what Cina surfaces.", on: privacy.recs, onToggle: () => togglePrivacy("recs") }), /* @__PURE__ */ React.createElement(CinaAcctToggle, { accent, label: "Show holdings publicly", hint: "Display your stakes and editions on your profile.", on: privacy.holdings, onToggle: () => togglePrivacy("holdings") }))), /* @__PURE__ */ React.createElement("div", null, sectionTitle("Your data"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.5rem" } }, /* @__PURE__ */ React.createElement("button", { onClick: exportData, style: { flex: 1, height: "2.4rem", borderRadius: "var(--r-2)", background: "transparent", color: "var(--c-ink-2)", border: "1px solid var(--c-line-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", cursor: "pointer" } }, "EXPORT DATA"), /* @__PURE__ */ React.createElement("button", { onClick: deleteAccount, style: { flex: 1, height: "2.4rem", borderRadius: "var(--r-2)", background: "transparent", color: `var(--c-bad, ${tkc("bad")})`, border: "1px solid rgba(201,85,72,.4)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", cursor: "pointer" } }, "DELETE ACCOUNT"))))), /* @__PURE__ */ React.createElement("div", { style: { padding: "0.9rem 1.4rem", borderTop: "1px solid var(--c-line)", flexShrink: 0, display: "flex", gap: "0.6rem", alignItems: "center" } }, tab === "profile" ? /* @__PURE__ */ React.createElement("button", { onClick: saveProfile, style: {
    flex: 1,
    height: "2.6rem",
    borderRadius: "var(--r-2)",
    background: saved ? "rgba(106,163,122,.12)" : accent,
    color: saved ? "var(--c-good)" : tkc("on-amber"),
    border: saved ? "1px solid var(--c-good)" : "none",
    cursor: "pointer",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    fontWeight: 700,
    textTransform: "uppercase"
  } }, saved ? "\u2713 Saved" : "Save changes") : /* @__PURE__ */ React.createElement("div", { style: { flex: 1, fontSize: "var(--fs-label)", color: "var(--c-ink-4)", lineHeight: 1.4 } }, "Saved automatically across all surfaces."), CINA.signedIn ? /* @__PURE__ */ React.createElement("button", { onClick: () => {
    onClose();
    cinaSignOut();
  }, style: {
    height: "2.6rem",
    padding: "0 1rem",
    borderRadius: "var(--r-2)",
    flexShrink: 0,
    background: "transparent",
    color: `var(--c-blood-l, ${tkc("bad")})`,
    border: "1px solid var(--c-line-2)",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    cursor: "pointer"
  } }, "SIGN OUT") : /* @__PURE__ */ React.createElement("button", { onClick: () => {
    onClose();
    openCinaSignIn({ surface, accent });
  }, style: {
    height: "2.6rem",
    padding: "0 1rem",
    borderRadius: "var(--r-2)",
    flexShrink: 0,
    background: accent,
    color: "var(--c-on-amber)",
    border: "none",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    fontWeight: 700,
    cursor: "pointer"
  } }, "SIGN IN")), billingSheet && /* @__PURE__ */ React.createElement(
    BillingSheet,
    {
      kind: billingSheet,
      accent,
      card,
      tier,
      cardLast4,
      tiers: PLAN_TIERS,
      onClose: () => setBillingSheet(null),
      onChoose: choosePlan,
      onSaveCard: saveCard
    }
  ))), document.body);
}
function CinaAccountButton({ surface, accent = "var(--c-amber)", align = "right", balance = null }) {
  useCinaId();
  const [app, setApp] = useCinaAppearance();
  const [open, setOpen] = useIdState(false);
  const [modal, setModal] = useIdState(false);
  const [panel, setPanel] = useIdState(null);
  const ref = useIdRef(null);
  useIdEffect(() => {
    _cinaSettingsOpener = (t) => {
      setOpen(false);
      setPanel(t || "profile");
    };
    return () => {
      if (_cinaSettingsOpener) _cinaSettingsOpener = null;
    };
  }, []);
  useIdEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const signIn = () => {
    setOpen(false);
    if (window.CinaAuth) window.CinaAuth.open({ surface, accent });
    else if (window.openSignIn && window.SESSION) window.openSignIn();
    else setModal(true);
  };
  const holdings = cinaHoldingsCount();
  const unread = typeof cinaUnreadCount === "function" ? cinaUnreadCount(surface) : 0;
  const row = (label, hint, onClick, opts = {}) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: label,
      onClick: () => {
        setOpen(false);
        onClick && onClick();
      },
      style: {
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        width: "100%",
        padding: "0.52rem 0.95rem",
        background: "transparent",
        border: "none",
        textAlign: "left",
        cursor: "pointer",
        color: opts.danger ? `var(--c-blood-l, ${tkc("bad")})` : "var(--c-ink)",
        fontSize: "var(--fs-body)",
        fontFamily: "inherit"
      },
      onMouseEnter: (e) => e.currentTarget.style.background = "var(--c-panel-2)",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
    },
    /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }, label),
    hint && /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".14em" } }, hint)
  );
  const sectionLabel = (l) => /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { padding: "0.5rem 0.95rem 0.25rem", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" } }, l);
  const divider = (k) => /* @__PURE__ */ React.createElement("div", { key: k, style: { height: 1, background: "var(--c-line)", margin: "0.35rem 0" } });
  const moodStrip = /* @__PURE__ */ React.createElement("div", { style: { padding: "0.35rem 0.95rem 0.55rem" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.45rem" } }, /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" } }, "DISPLAY MOOD"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
    setOpen(false);
    setPanel("appearance");
  }, className: "t-mono", style: { background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "var(--fs-label)", letterSpacing: ".12em", color: accent } }, "ALL THEMES \u2192")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "0.32rem" } }, CINA_MOODS_META.map((m) => {
    const isCur = app.mood === m.id;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: m.id,
        type: "button",
        title: `${m.label} \u2014 ${m.sub}`,
        "aria-label": `Display mood: ${m.label}`,
        "aria-pressed": isCur,
        onClick: () => setApp({ mood: m.id }),
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.28rem",
          padding: "0.38rem 0.2rem",
          borderRadius: "var(--r-1)",
          cursor: "pointer",
          background: isCur ? "rgba(var(--accent-rgb),.14)" : "var(--c-panel-2)",
          border: `1px solid ${isCur ? "var(--c-amber)" : "var(--c-line-2)"}`,
          color: isCur ? "var(--c-ink)" : "var(--c-ink-3)"
        }
      },
      /* @__PURE__ */ React.createElement("span", { style: {
        width: "1.05rem",
        height: "1.05rem",
        borderRadius: "50%",
        background: m.bg,
        border: `2px solid ${m.accent}`,
        display: "inline-block"
      } }),
      /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "0.62rem", letterSpacing: ".04em", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" } }, m.label.slice(0, 4))
    );
  })));
  return /* @__PURE__ */ React.createElement("div", { ref, style: { position: "relative", display: "inline-flex", alignItems: "center", gap: "0.4rem" } }, !CINA.signedIn && /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: signIn,
      style: {
        height: "2.15rem",
        padding: "0 0.85rem",
        borderRadius: "var(--r-1)",
        background: accent,
        color: "var(--c-on-amber)",
        border: "none",
        fontFamily: "var(--f-mono)",
        fontSize: "var(--fs-label)",
        letterSpacing: ".14em",
        fontWeight: 700,
        cursor: "pointer",
        whiteSpace: "nowrap"
      }
    },
    "SIGN IN"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      "aria-label": CINA.signedIn ? `${CINA.handle} user menu and settings` : "User settings and sign in",
      onClick: () => setOpen((o) => !o),
      title: CINA.signedIn ? `${CINA.handle} \xB7 Settings & Cina ID` : "User Settings & Sign In",
      style: {
        position: "relative",
        height: "2.15rem",
        padding: CINA.signedIn ? "0 0.7rem 0 0.35rem" : "0 0.55rem",
        borderRadius: "var(--r-2)",
        background: CINA.signedIn ? "var(--c-panel-2)" : "transparent",
        border: open ? `1px solid ${accent}` : "1px solid var(--c-line-2)",
        color: "var(--c-ink)",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45rem",
        cursor: "pointer",
        transition: "border-color .14s ease"
      }
    },
    /* @__PURE__ */ React.createElement("span", { style: {
      width: "1.5rem",
      height: "1.5rem",
      borderRadius: "50%",
      background: "var(--c-panel-3)",
      border: `1px solid ${accent}`,
      color: accent,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--f-display)",
      fontStyle: "italic",
      fontSize: "var(--fs-body)",
      fontWeight: 500
    } }, CINA.signedIn ? cinaGlyph() : /* @__PURE__ */ React.createElement(Icon, { name: "actor", size: 13 })),
    CINA.signedIn && /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".06em", color: "var(--c-ink-2)", maxWidth: "7.5rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, CINA.handle),
    /* @__PURE__ */ React.createElement(Icon, { name: "chev-d", size: 11 }),
    CINA.signedIn && unread > 0 && /* @__PURE__ */ React.createElement("span", { style: {
      position: "absolute",
      top: "-0.25rem",
      right: "-0.25rem",
      minWidth: "1rem",
      height: "1rem",
      padding: "0 0.25rem",
      borderRadius: "var(--r-full)",
      background: `var(--c-blood-l, ${tkc("bad")})`,
      color: "var(--c-on-amber)",
      border: "2px solid var(--c-bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--f-mono)",
      fontSize: "var(--fs-label)",
      fontWeight: 700,
      lineHeight: 1
    } }, unread > 9 ? "9+" : unread)
  ), open && /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    top: "2.65rem",
    [align === "right" ? "right" : "left"]: 0,
    width: "min(19.5rem, 92vw)",
    background: "var(--c-panel)",
    border: "1px solid var(--c-line-2)",
    boxShadow: "0 24px 64px rgba(0,0,0,.62)",
    borderRadius: "var(--r-2)",
    padding: "0.45rem 0",
    zIndex: 9e3
  } }, CINA.signedIn ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 0.95rem 0.75rem" } }, /* @__PURE__ */ React.createElement("span", { style: {
    width: "2.35rem",
    height: "2.35rem",
    borderRadius: "50%",
    flexShrink: 0,
    background: "var(--c-panel-2)",
    border: `1px solid ${accent}`,
    color: accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--f-display)",
    fontStyle: "italic",
    fontSize: "var(--fs-lead)",
    fontWeight: 500
  } }, cinaGlyph()), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" } }, CINA.handle), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, CINA.email || CINA.address)), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".14em", color: accent, border: `1px solid ${accent}`, borderRadius: "var(--r-1)", padding: "0.12rem 0.4rem" } }, CINA.tier.toUpperCase())), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", margin: "0 0.95rem 0.5rem", border: "1px solid var(--c-line)", borderRadius: 0, overflow: "hidden" } }, balance ? /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setOpen(false);
    balance.onClick && balance.onClick();
  }, style: { flex: 1, padding: "0.6rem 0.75rem", textAlign: "left", background: "transparent", border: "none", borderRight: "1px solid var(--c-line)", cursor: balance.onClick ? "pointer" : "default" } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".14em" } }, (balance.label || "WALLET").toUpperCase()), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", marginTop: "0.15rem" } }, balance.value), balance.sub && /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "0.62rem", color: "var(--c-ink-4)", marginTop: "0.12rem", letterSpacing: ".06em" } }, balance.sub)) : /* @__PURE__ */ React.createElement("a", { href: "index.html#/wallet", onClick: () => setOpen(false), style: { flex: 1, padding: "0.6rem 0.75rem", textDecoration: "none", borderRight: "1px solid var(--c-line)" } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".14em" } }, "WALLET"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", marginTop: "0.15rem" } }, _idMoney(cinaWallet())), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "0.62rem", color: "var(--c-ink-4)", marginTop: "0.12rem", letterSpacing: ".06em" } }, CINA.address)), balance && balance.label === "credits" ? /* @__PURE__ */ React.createElement("a", { href: "index.html#/wallet", onClick: () => setOpen(false), style: { flex: 1, padding: "0.6rem 0.75rem", textDecoration: "none" } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".14em" } }, "WALLET"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", marginTop: "0.15rem" } }, _idMoney(cinaWallet())), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "0.62rem", color: "var(--c-ink-4)", marginTop: "0.12rem", letterSpacing: ".06em" } }, CINA.address)) : /* @__PURE__ */ React.createElement("a", { href: "index.html#/payouts", onClick: () => setOpen(false), style: { flex: 1, padding: "0.6rem 0.75rem", textDecoration: "none" } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".14em" } }, "STAKES"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", marginTop: "0.15rem" } }, holdings == null ? "4 active" : holdings + (holdings === 1 ? " stake" : " stakes")), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "0.62rem", color: "var(--c-good, #52b788)", marginTop: "0.12rem", letterSpacing: ".06em" } }, "ACTIVE"))), divider("dm"), moodStrip, divider("d1"), surface === "watch" && /* @__PURE__ */ React.createElement(React.Fragment, null, sectionLabel("LIBRARY & WATCH"), row("Watchlist", null, () => {
    if (typeof navigate === "function") navigate("/watchlist");
    else location.hash = "#/watchlist";
  }), row("Viewing History", null, () => {
    if (typeof navigate === "function") navigate("/history");
    else location.hash = "#/history";
  }), row("Taste Print", null, () => {
    if (typeof navigate === "function") navigate("/taste");
    else location.hash = "#/taste";
  }), divider("d-watch-tools")), surface === "studio" && /* @__PURE__ */ React.createElement(React.Fragment, null, sectionLabel("STUDIO WORKSPACE"), row("Studio preferences", "RENDER \xB7 CHAIN", () => setPanel("studio")), row("Credits & render currency", null, () => window.dispatchEvent(new CustomEvent("cina:openPanel", { detail: "credits" }))), row("Team & directing crew", null, () => window.dispatchEvent(new CustomEvent("cina:openPanel", { detail: "team" }))), row("Help & pipeline docs", null, () => window.dispatchEvent(new CustomEvent("cina:openPanel", { detail: "help" }))), divider("d-studio-tools")), sectionLabel("USER SETTINGS"), row("Profile & Cina ID", null, () => setPanel("profile")), row("Display mood & motion", app.mood.toUpperCase(), () => setPanel("appearance")), row("Wallet & smart-contract splits", null, () => setPanel("wallet")), row("Plan, billing & subscriptions", null, () => setPanel("billing")), row("Passkeys & security", null, () => setPanel("security")), row("Alerts & notifications", null, () => setPanel("alerts")), row("Privacy & data export", null, () => setPanel("privacy")), surface === "watch" && row("Full account & creator page", "#/account", () => {
    if (typeof navigate === "function") navigate("/account");
    else location.hash = "#/account";
  }), divider("ds"), sectionLabel("SWITCH SURFACE"), /* @__PURE__ */ React.createElement("div", { style: { padding: "0.15rem 0.5rem 0.25rem" } }, CINA_SURFACES.map((s) => {
    const here = s.id === surface;
    return /* @__PURE__ */ React.createElement("a", { key: s.id, href: here ? void 0 : s.href, onClick: (e) => {
      if (here) e.preventDefault();
      setOpen(false);
    }, style: {
      display: "flex",
      alignItems: "center",
      gap: "0.6rem",
      padding: "0.45rem 0.5rem",
      borderRadius: "var(--r-1)",
      textDecoration: "none",
      color: "inherit",
      cursor: here ? "default" : "pointer",
      background: here ? "var(--c-panel-2)" : "transparent"
    } }, /* @__PURE__ */ React.createElement("span", { style: { width: "0.45rem", height: "0.45rem", borderRadius: "50%", background: s.dot, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", fontWeight: 500, color: "var(--c-ink)", flex: 1 } }, s.label), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: here ? accent : "var(--c-ink-4)" } }, here ? "HERE" : s.sub));
  })), divider("d2"), row("Sign out", null, () => cinaSignOut(), { danger: true })) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { padding: "0.85rem 0.95rem 0.65rem" } }, /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" } }, "Sign in to Cina"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: "0.2rem", lineHeight: 1.45 } }, "Passkey, wallet, or email \u2014 one Cina ID carries your stakes, library, and studio across every surface.")), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 0.95rem 0.65rem" } }, /* @__PURE__ */ React.createElement("button", { onClick: signIn, style: { width: "100%", height: "2.35rem", background: accent, color: "var(--c-on-amber)", border: "none", borderRadius: "var(--r-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, cursor: "pointer" } }, "SIGN IN / CREATE ID")), surface === "watch" && /* @__PURE__ */ React.createElement(React.Fragment, null, divider("d-out-dir"), sectionLabel("LIBRARY & ACCOUNT"), row("Watchlist", null, () => {
    if (typeof navigate === "function") navigate("/watchlist");
    else location.hash = "#/watchlist";
  }), row("Full account & creator page", "#/account", () => {
    if (typeof navigate === "function") navigate("/account");
    else location.hash = "#/account";
  })), divider("dm-out"), moodStrip, divider("d-out-settings"), row("User settings & display", app.mood.toUpperCase(), () => setPanel("appearance")))), modal && /* @__PURE__ */ React.createElement(CinaSignInModal, { surface, accent, onClose: () => setModal(false) }), panel && /* @__PURE__ */ React.createElement(CinaAccountPanel, { surface, accent, tab: panel, onTab: setPanel, onClose: () => setPanel(null) }));
}
function CinaSignedOut({ surface = "studio", accent = "var(--c-amber)" }) {
  const [modal, setModal] = useIdState(false);
  const meta = CINA_SURFACES.find((s) => s.id === surface) || CINA_SURFACES[1];
  return /* @__PURE__ */ React.createElement("div", { style: {
    position: "fixed",
    inset: 0,
    zIndex: 8e3,
    background: `var(--c-void, ${tkc("void")})`,
    color: "var(--c-ink)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "5%"
  } }, /* @__PURE__ */ React.createElement("div", { style: { width: "100%", maxWidth: "30rem", textAlign: "left" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.8rem" } }, /* @__PURE__ */ React.createElement(CinaMark, { size: 28 }), /* @__PURE__ */ React.createElement("span", { style: { width: 1, height: "1.1rem", background: "var(--c-line-2)" } }), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" } }, meta.label.toUpperCase())), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, marginBottom: "1rem" } }, "CINA ID \xB7 SIGNED OUT"), /* @__PURE__ */ React.createElement("h1", { className: "t-display", style: { fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-display)", lineHeight: 1.02, letterSpacing: "-0.02em", margin: "0 0 1rem", color: "var(--c-ink)" } }, "Sign in to enter ", /* @__PURE__ */ React.createElement("span", { style: { color: accent } }, meta.label), "."), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "var(--fs-lead)", color: "var(--c-ink-2)", lineHeight: 1.6, margin: "0 0 1.8rem" } }, meta.sub, " runs on your Cina ID \u2014 the same identity, wallet and smart-contract holdings you use on Watch."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.65rem", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => {
    if (window.CinaAuth) window.CinaAuth.open({ surface, accent });
    else if (window.openSignIn && window.SESSION) window.openSignIn();
    else setModal(true);
  }, style: {
    height: "2.75rem",
    padding: "0 1.6rem",
    background: accent,
    color: "var(--c-on-amber)",
    border: "none",
    borderRadius: "var(--r-2)",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-body)",
    letterSpacing: ".16em",
    fontWeight: 600,
    cursor: "pointer"
  } }, "SIGN IN TO CINA"), /* @__PURE__ */ React.createElement("a", { href: "index.html", style: {
    height: "2.75rem",
    padding: "0 1.4rem",
    display: "inline-flex",
    alignItems: "center",
    background: "transparent",
    color: "var(--c-ink-2)",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-2)",
    textDecoration: "none",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-body)",
    letterSpacing: ".16em"
  } }, "\u2190 BACK TO WATCH"))), modal && /* @__PURE__ */ React.createElement(CinaSignInModal, { surface, accent, onClose: () => setModal(false) }));
}
Object.assign(window, {
  CINA,
  useCinaId,
  cinaSync,
  cinaSignIn,
  cinaSignOut,
  cinaGlyph,
  openCinaSignIn,
  registerCinaSignIn,
  openCinaAccountSettings,
  CinaAppearance,
  useCinaAppearance,
  AppearanceSection,
  CINA_MOODS_META,
  CinaSignInModal,
  CinaAccountButton,
  CinaAccountPanel,
  CinaSignedOut,
  CINA_SURFACES
});

  try { if (typeof useIdState !== "undefined") window["useIdState"] = useIdState; } catch (_) {}
  try { if (typeof useIdEffect !== "undefined") window["useIdEffect"] = useIdEffect; } catch (_) {}
  try { if (typeof useIdRef !== "undefined") window["useIdRef"] = useIdRef; } catch (_) {}
  try { if (typeof CINA_MOODS_META !== "undefined") window["CINA_MOODS_META"] = CINA_MOODS_META; } catch (_) {}
  try { if (typeof CINA_VOICES_META !== "undefined") window["CINA_VOICES_META"] = CINA_VOICES_META; } catch (_) {}
  try { if (typeof CINA_MOTIONS_META !== "undefined") window["CINA_MOTIONS_META"] = CINA_MOTIONS_META; } catch (_) {}
  try { if (typeof _appSubs !== "undefined") window["_appSubs"] = _appSubs; } catch (_) {}
  try { if (typeof CinaAppearance !== "undefined") window["CinaAppearance"] = CinaAppearance; } catch (_) {}
  try { if (typeof useCinaAppearance !== "undefined") window["useCinaAppearance"] = useCinaAppearance; } catch (_) {}
  try { if (typeof CINA_KEY !== "undefined") window["CINA_KEY"] = CINA_KEY; } catch (_) {}
  try { if (typeof LEGACY !== "undefined") window["LEGACY"] = LEGACY; } catch (_) {}
  try { if (typeof _idLoad !== "undefined") window["_idLoad"] = _idLoad; } catch (_) {}
  try { if (typeof _persisted !== "undefined") window["_persisted"] = _persisted; } catch (_) {}
  try { if (typeof CINA !== "undefined") window["CINA"] = CINA; } catch (_) {}
  try { if (typeof _idSave !== "undefined") window["_idSave"] = _idSave; } catch (_) {}
  try { if (typeof _idSubs !== "undefined") window["_idSubs"] = _idSubs; } catch (_) {}
  try { if (typeof bumpCina !== "undefined") window["bumpCina"] = bumpCina; } catch (_) {}
  try { if (typeof useCinaId !== "undefined") window["useCinaId"] = useCinaId; } catch (_) {}
  try { if (typeof cinaWallet !== "undefined") window["cinaWallet"] = cinaWallet; } catch (_) {}
  try { if (typeof cinaHoldingsCount !== "undefined") window["cinaHoldingsCount"] = cinaHoldingsCount; } catch (_) {}
  try { if (typeof cinaGlyph !== "undefined") window["cinaGlyph"] = cinaGlyph; } catch (_) {}
  try { if (typeof _idMoney !== "undefined") window["_idMoney"] = _idMoney; } catch (_) {}
  try { if (typeof _idToast !== "undefined") window["_idToast"] = _idToast; } catch (_) {}
  try { if (typeof _idDownload !== "undefined") window["_idDownload"] = _idDownload; } catch (_) {}
  try { if (typeof CINA_ACCT_KEY !== "undefined") window["CINA_ACCT_KEY"] = CINA_ACCT_KEY; } catch (_) {}
  try { if (typeof _acctLoad !== "undefined") window["_acctLoad"] = _acctLoad; } catch (_) {}
  try { if (typeof _acctSave !== "undefined") window["_acctSave"] = _acctSave; } catch (_) {}
  try { if (typeof cinaSync !== "undefined") window["cinaSync"] = cinaSync; } catch (_) {}
  try { if (typeof cinaSignIn !== "undefined") window["cinaSignIn"] = cinaSignIn; } catch (_) {}
  try { if (typeof cinaSignOut !== "undefined") window["cinaSignOut"] = cinaSignOut; } catch (_) {}
  try { if (typeof CINA_SURFACES !== "undefined") window["CINA_SURFACES"] = CINA_SURFACES; } catch (_) {}
  try { if (typeof _cinaSignInOpener !== "undefined") window["_cinaSignInOpener"] = _cinaSignInOpener; } catch (_) {}
  try { if (typeof registerCinaSignIn !== "undefined") window["registerCinaSignIn"] = registerCinaSignIn; } catch (_) {}
  try { if (typeof openCinaSignIn !== "undefined") window["openCinaSignIn"] = openCinaSignIn; } catch (_) {}
  try { if (typeof _cinaSettingsOpener !== "undefined") window["_cinaSettingsOpener"] = _cinaSettingsOpener; } catch (_) {}
  try { if (typeof openCinaAccountSettings !== "undefined") window["openCinaAccountSettings"] = openCinaAccountSettings; } catch (_) {}
  try { if (typeof CinaSignInModal !== "undefined") window["CinaSignInModal"] = CinaSignInModal; } catch (_) {}
  try { if (typeof AppearanceSection !== "undefined") window["AppearanceSection"] = AppearanceSection; } catch (_) {}
  try { if (typeof CINA_ACCT_TABS !== "undefined") window["CINA_ACCT_TABS"] = CINA_ACCT_TABS; } catch (_) {}
  try { if (typeof _acctField !== "undefined") window["_acctField"] = _acctField; } catch (_) {}
  try { if (typeof CinaAcctLabel !== "undefined") window["CinaAcctLabel"] = CinaAcctLabel; } catch (_) {}
  try { if (typeof CinaAcctToggle !== "undefined") window["CinaAcctToggle"] = CinaAcctToggle; } catch (_) {}
  try { if (typeof BillingSheet !== "undefined") window["BillingSheet"] = BillingSheet; } catch (_) {}
  try { if (typeof CinaAccountPanel !== "undefined") window["CinaAccountPanel"] = CinaAccountPanel; } catch (_) {}
  try { if (typeof CinaAccountButton !== "undefined") window["CinaAccountButton"] = CinaAccountButton; } catch (_) {}
  try { if (typeof CinaSignedOut !== "undefined") window["CinaSignedOut"] = CinaSignedOut; } catch (_) {}
})();

// ── MODULE: cina-auth.jsx ──
;(function() {
const { useState: usAu2, useEffect: ueAu2, useRef: urAu2 } = React;
const CA_KEY = "cina:credentials";
const CA_ACCENT = "var(--c-amber)";
function caLoad() {
  try {
    return JSON.parse(localStorage.getItem(CA_KEY)) || { creds: [], lastId: null };
  } catch (_) {
    return { creds: [], lastId: null };
  }
}
function caSave(v) {
  try {
    localStorage.setItem(CA_KEY, JSON.stringify(v));
  } catch (_) {
  }
}
const caSubs = /* @__PURE__ */ new Set();
function caBump() {
  caSubs.forEach((fn) => fn(Date.now()));
}
function useCinaAuth() {
  const [, setT] = usAu2(0);
  ueAu2(() => {
    caSubs.add(setT);
    return () => caSubs.delete(setT);
  }, []);
  return { ...caLoad(), ...CinaAuth.state() };
}
function caAdd(cred) {
  const reg = caLoad();
  const creds = [cred, ...reg.creds.filter((c) => c.id !== cred.id)].slice(0, 6);
  caSave({ creds, lastId: cred.id });
  caBump();
  return cred;
}
const caHasWebAuthn = () => typeof window.PublicKeyCredential === "function" && !!navigator.credentials;
async function caCreatePasskey(handle) {
  const id = "pk_" + Math.random().toString(36).slice(2, 10);
  if (caHasWebAuthn()) {
    try {
      await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: "Cina" },
          user: { id: crypto.getRandomValues(new Uint8Array(16)), name: handle, displayName: handle },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
          authenticatorSelection: { userVerification: "preferred" },
          timeout: 45e3
        }
      });
    } catch (_) {
    }
  }
  return { id, kind: "passkey", handle, label: caDeviceLabel(), at: Date.now() };
}
async function caAssertPasskey(cred) {
  if (caHasWebAuthn()) {
    try {
      await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          userVerification: "preferred",
          timeout: 45e3
        }
      });
    } catch (_) {
    }
  }
  return true;
}
function caDeviceLabel() {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad/.test(ua)) return "This iPhone \xB7 Face ID";
  if (/Macintosh/.test(ua)) return "This Mac \xB7 Touch ID";
  if (/Android/.test(ua)) return "This Android device";
  if (/Windows/.test(ua)) return "This PC \xB7 Windows Hello";
  return "This device";
}
let caOpener = null;
const CinaAuth = {
  registerOpener(fn) {
    caOpener = fn;
  },
  open(opts) {
    if (caOpener) caOpener(opts || {});
  },
  close() {
    if (caOpener) caOpener(null);
  },
  state() {
    const C = window.CINA || {};
    return { signedIn: !!C.signedIn, handle: C.handle || "", email: C.email || "", method: C.method || "" };
  },
  credentials() {
    return caLoad().creds;
  },
  lastCredential() {
    const reg = caLoad();
    return reg.creds.find((c) => c.id === reg.lastId) || reg.creds[0] || null;
  },
  // Every successful path lands here — one write, one propagation.
  complete({ handle, email, method, cred }) {
    if (cred) caAdd(cred);
    const h = handle || (email ? email.split("@")[0] : (window.CINA || {}).handle) || "you.eth";
    if (window.CINA) window.CINA.method = method || "";
    if (window.cinaSync) window.cinaSync({ signedIn: true, handle: h, email: email || "" });
    else if (window.signIn) window.signIn({ handle: h, email, method });
    caBump();
    if (window.toast) window.toast({ title: "WELCOME", text: "Signed in \xB7 " + (method || "Cina ID"), kind: "good" });
  },
  signOut() {
    if (window.cinaSignOut) window.cinaSignOut();
    else if (window.signOut) window.signOut();
    caBump();
  },
  // Drop one credential (a lost device, a rotated wallet).
  forget(id) {
    const reg = caLoad();
    caSave({ creds: reg.creds.filter((c) => c.id !== id), lastId: reg.lastId === id ? null : reg.lastId });
    caBump();
    if (window.toast) window.toast({ title: "REMOVED", text: "That credential can no longer sign you in.", kind: "info" });
  }
};
function CinaAuthSheet({ ctx, onClose }) {
  const accent = ctx.accent || CA_ACCENT;
  const known = CinaAuth.lastCredential();
  const [step, setStep] = usAu2(known ? "return" : "choose");
  const [email, setEmail] = usAu2("");
  const [code, setCode] = usAu2("");
  const [busy, setBusy] = usAu2("");
  ueAu2(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  const useKnown = async () => {
    setBusy("Waiting for " + (known.kind === "passkey" ? "your passkey" : "your wallet") + "\u2026");
    if (known.kind === "passkey") await caAssertPasskey(known);
    else await new Promise((r) => setTimeout(r, 600));
    CinaAuth.complete({ handle: known.handle, method: known.kind === "passkey" ? "Passkey" : known.label, cred: known });
    onClose();
  };
  const newPasskey = async () => {
    const handle = (email ? email.split("@")[0] : (window.CINA || {}).handle) || "you.eth";
    setBusy("Creating your passkey\u2026");
    const cred = await caCreatePasskey(handle);
    CinaAuth.complete({ handle, email, method: "Passkey", cred });
    onClose();
  };
  const signInGoogle = async () => {
    if (!window.CinaCloudAuth?.signInWithGoogle) {
      if (window.toast) window.toast({ title: "GOOGLE AUTH", text: "Google sign-in is loading, try again in a moment.", kind: "info" });
      return;
    }
    setBusy("Signing in with Google\u2026");
    try {
      const u = await window.CinaCloudAuth.signInWithGoogle();
      const handle = u?.displayName?.trim() || u?.email?.split("@")[0] || "Director";
      CinaAuth.complete({
        handle,
        email: u?.email || "",
        method: "Google",
        cred: { id: "g_" + (u?.uid || "cloud"), kind: "google", handle, label: u?.email || "Google Cloud Vault", at: Date.now() }
      });
      onClose();
    } catch (_) {
      setBusy("");
    }
  };
  const connectWallet = async (label) => {
    setBusy("Opening " + label + "\u2026");
    await new Promise((r) => setTimeout(r, 750));
    const handle = label.toLowerCase().replace(/[^a-z]/g, "") + ".eth";
    CinaAuth.complete({ handle, method: label, cred: { id: "w_" + label, kind: "wallet", handle, label, at: Date.now() } });
    onClose();
  };
  const sendCode = () => {
    if (!email.includes("@")) return;
    setBusy("Sending a code\u2026");
    setTimeout(() => {
      setBusy("");
      setStep("code");
    }, 600);
  };
  const verify = () => {
    if (code.replace(/\D/g, "").length < 4) return;
    setBusy("Verifying\u2026");
    setTimeout(() => {
      CinaAuth.complete({ email, method: "Email", cred: { id: "e_" + email, kind: "email", handle: email.split("@")[0], label: email, at: Date.now() } });
      onClose();
    }, 500);
  };
  const field = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    background: "var(--c-panel-2)",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-2)",
    color: "var(--c-ink)",
    fontSize: "var(--fs-body)",
    fontFamily: "inherit"
  };
  const primary = (on) => ({
    width: "100%",
    padding: "13px 16px",
    borderRadius: "var(--r-2)",
    background: on ? accent : tkc("panel-2"),
    color: on ? tkc("on-amber") : "var(--c-ink-3)",
    border: "none",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-body)",
    letterSpacing: ".16em",
    fontWeight: 700,
    cursor: on ? "pointer" : "default"
  });
  const secondary = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "var(--r-2)",
    textAlign: "left",
    background: "transparent",
    border: "1px solid var(--c-line-2)",
    color: "var(--c-ink)",
    fontSize: "var(--fs-body)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 11
  };
  const sheet = /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: {
    position: "fixed",
    inset: 0,
    zIndex: 9700,
    background: "rgba(0,0,0,.62)",
    backdropFilter: "blur(5px)",
    display: "flex",
    justifyContent: "flex-end"
  } }, /* @__PURE__ */ React.createElement("style", null, `@keyframes caIn{from{transform:translateX(26px);opacity:.5}to{transform:translateX(0);opacity:1}}
@keyframes caPulse{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}`), /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
    width: "100%",
    maxWidth: 432,
    height: "100%",
    overflowY: "auto",
    background: "var(--c-panel)",
    borderLeft: "1px solid var(--c-line-2)",
    boxShadow: "-20px 0 60px rgba(0,0,0,.5)",
    animation: "caIn .24s cubic-bezier(.2,.8,.2,1)"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "22px 24px 18px", borderBottom: "1px solid var(--c-line)" } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0, paddingRight: 12 } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 9, whiteSpace: "nowrap" } }, "CINA ID", ctx.surface ? " \xB7 " + String(ctx.surface).toUpperCase() : ""), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-title)", color: "var(--c-ink)", lineHeight: 1.05, letterSpacing: "-0.02em" } }, step === "code" ? "Check your inbox" : step === "return" ? "Welcome back" : step === "email" ? "Sign in with email" : "Sign in")), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "btn-ghost", style: { width: 32, height: 32, padding: 0, fontSize: "var(--fs-lead)", color: "var(--c-ink-3)" }, "aria-label": "Close", title: "Close" }, "\xD7")), /* @__PURE__ */ React.createElement("div", { style: { padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: 16 } }, ctx.reason && /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 12px", borderRadius: "var(--r-2)", background: "rgba(var(--accent-rgb),.08)", border: "1px solid rgba(var(--accent-rgb),.28)", fontSize: "var(--fs-body)", color: accent, lineHeight: 1.45 } }, ctx.reason), busy ? /* @__PURE__ */ React.createElement("div", { style: { padding: "44px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 46, height: 46, borderRadius: "var(--r-3)", border: `1.5px solid ${accent}`, display: "grid", placeItems: "center", color: accent, fontSize: "var(--fs-lead)", animation: "caPulse 1.3s ease-in-out infinite" } }, "\u25C9"), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textAlign: "center" } }, busy.toUpperCase())) : step === "return" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 13, padding: 15, borderRadius: "var(--r-2)", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 40, height: 40, borderRadius: "50%", background: accent, display: "grid", placeItems: "center", color: "var(--c-on-amber)", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", flex: "0 0 auto" } }, (known.handle || "y")[0].toUpperCase()), /* @__PURE__ */ React.createElement("span", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "block", fontSize: "var(--fs-lead)", color: "var(--c-ink)" } }, "@", known.handle), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { display: "block", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginTop: 4, textTransform: "uppercase" } }, known.kind === "passkey" ? known.label : known.label))), /* @__PURE__ */ React.createElement("button", { onClick: useKnown, style: primary(true) }, known.kind === "passkey" ? "CONTINUE WITH PASSKEY" : "CONTINUE WITH " + known.label.toUpperCase()), /* @__PURE__ */ React.createElement("button", { onClick: signInGoogle, style: secondary }, /* @__PURE__ */ React.createElement("span", { style: { width: 22, textAlign: "center", fontWeight: 700, color: accent } }, "G"), "Continue with Google \xB7 Cloud Vault"), /* @__PURE__ */ React.createElement("button", { onClick: () => setStep("choose"), style: { ...secondary, justifyContent: "center", color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em" } }, "USE A DIFFERENT METHOD")) : step === "choose" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55, margin: 0 } }, "One Cina ID for Watch, Studio, Pitch and Producers. Sign in with Google for Cloud Slate Vault or create a device passkey."), /* @__PURE__ */ React.createElement("button", { onClick: signInGoogle, style: primary(true) }, "CONTINUE WITH GOOGLE \xB7 CLOUD VAULT"), /* @__PURE__ */ React.createElement("button", { onClick: newPasskey, style: secondary }, /* @__PURE__ */ React.createElement("span", { style: { width: 22, textAlign: "center", color: accent } }, "\u2318"), "Create a Passkey (", caDeviceLabel(), ")"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement("span", { style: { flex: 1, height: 1, background: "var(--c-line)" } }), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" } }, "OR"), /* @__PURE__ */ React.createElement("span", { style: { flex: 1, height: 1, background: "var(--c-line)" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setStep("email"), style: secondary }, /* @__PURE__ */ React.createElement("span", { style: { width: 22, textAlign: "center", color: "var(--c-ink-3)" } }, "\u2709"), "Email a one-time code"), [["MetaMask", "\u{1F98A}"], ["WalletConnect", "\u25C7"], ["Coinbase Wallet", "\u25C9"]].map(([label, icon]) => /* @__PURE__ */ React.createElement("button", { key: label, onClick: () => connectWallet(label), style: secondary }, /* @__PURE__ */ React.createElement("span", { style: { width: 22, textAlign: "center" } }, icon), label)))) : step === "email" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("label", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", display: "block" } }, "EMAIL"), /* @__PURE__ */ React.createElement("input", { autoFocus: true, type: "email", value: email, onChange: (e) => setEmail(e.target.value), onKeyDown: (e) => e.key === "Enter" && sendCode(), placeholder: "you@domain.com", style: field }), /* @__PURE__ */ React.createElement("button", { disabled: !email.includes("@"), onClick: sendCode, style: primary(email.includes("@")) }, "SEND CODE"), /* @__PURE__ */ React.createElement("button", { onClick: () => setStep(known ? "return" : "choose"), style: { ...secondary, justifyContent: "center", color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em" } }, "BACK")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55, margin: 0 } }, "We sent a 6-digit code to ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink)" } }, email), "."), /* @__PURE__ */ React.createElement(
    "input",
    {
      autoFocus: true,
      value: code,
      onChange: (e) => setCode(e.target.value),
      onKeyDown: (e) => e.key === "Enter" && verify(),
      placeholder: "000000",
      inputMode: "numeric",
      style: { ...field, fontFamily: "var(--f-mono)", fontSize: "var(--fs-title)", letterSpacing: ".16em", textAlign: "center" }
    }
  ), /* @__PURE__ */ React.createElement("button", { disabled: code.replace(/\D/g, "").length < 4, onClick: verify, style: primary(code.replace(/\D/g, "").length >= 4) }, "VERIFY & SIGN IN"), /* @__PURE__ */ React.createElement("button", { onClick: () => setStep("email"), style: { ...secondary, justifyContent: "center", color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em" } }, "USE A DIFFERENT EMAIL")), /* @__PURE__ */ React.createElement("div", { style: { paddingTop: 8, borderTop: "1px solid var(--c-line)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", lineHeight: 1.5 } }, "Passkeys stay on your device. We never sell your watch history."))));
  return ReactDOM.createPortal(sheet, document.body);
}
function CinaAuthHost() {
  const [ctx, setCtx] = usAu2(null);
  ueAu2(() => {
    CinaAuth.registerOpener(setCtx);
    window.openSignIn = (opts) => setCtx(opts || {});
    window.openCinaSignIn = (opts) => setCtx(opts || {});
    if (window.registerSignInOpener) window.registerSignInOpener((o) => setCtx(o || {}));
    if (window.registerCinaSignIn) window.registerCinaSignIn((o) => setCtx(o || {}));
  }, []);
  return ctx ? /* @__PURE__ */ React.createElement(CinaAuthSheet, { ctx, onClose: () => setCtx(null) }) : null;
}
function CinaCredentialList({ accent = CA_ACCENT }) {
  const auth = useCinaAuth();
  const creds = auth.creds || [];
  const glyph = { passkey: "\u25C9", wallet: "\u25C8", email: "\u2709" };
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" } }, "HOW YOU SIGN IN"), creds.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5 } }, "No credentials on this device yet. Create a passkey and you'll sign in with your face or fingerprint next time."), creds.map((c) => /* @__PURE__ */ React.createElement("div", { key: c.id, style: { display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: "var(--r-2)", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 26, height: 26, borderRadius: "var(--r-2)", display: "grid", placeItems: "center", background: "var(--c-panel-3)", color: accent, fontSize: "var(--fs-body)", flex: "0 0 auto" } }, glyph[c.kind] || "\u25E6"), /* @__PURE__ */ React.createElement("span", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "block", fontSize: "var(--fs-body)", color: "var(--c-ink)" } }, c.kind === "passkey" ? "Passkey" : c.kind === "wallet" ? c.label : c.label), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { display: "block", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginTop: 3, textTransform: "uppercase" } }, c.kind === "passkey" ? c.label : "@" + c.handle, " \xB7 ADDED ", new Date(c.at).toLocaleDateString())), /* @__PURE__ */ React.createElement("button", { onClick: () => CinaAuth.forget(c.id), className: "btn-ghost", style: { height: 26, padding: "0 9px", fontSize: "var(--fs-label)", flex: "0 0 auto" } }, "Remove"))), !creds.some((c) => c.kind === "passkey") && /* @__PURE__ */ React.createElement("button", { onClick: () => CinaAuth.open({ reason: "Add a passkey so this device can sign you in instantly." }), className: "btn", style: { height: 34, fontSize: "var(--fs-body)", marginTop: 2 } }, "Add a passkey"));
}
Object.assign(window, { CinaAuth, CinaAuthSheet, CinaCredentialList });
(function() {
  const mount = () => {
    if (document.getElementById("__cina-auth-root")) return;
    const host = document.createElement("div");
    host.id = "__cina-auth-root";
    document.body.appendChild(host);
    if (ReactDOM.createRoot) ReactDOM.createRoot(host).render(/* @__PURE__ */ React.createElement(CinaAuthHost, null));
    else ReactDOM.render(/* @__PURE__ */ React.createElement(CinaAuthHost, null), host);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();

  try { if (typeof usAu2 !== "undefined") window["usAu2"] = usAu2; } catch (_) {}
  try { if (typeof ueAu2 !== "undefined") window["ueAu2"] = ueAu2; } catch (_) {}
  try { if (typeof urAu2 !== "undefined") window["urAu2"] = urAu2; } catch (_) {}
  try { if (typeof CA_KEY !== "undefined") window["CA_KEY"] = CA_KEY; } catch (_) {}
  try { if (typeof CA_ACCENT !== "undefined") window["CA_ACCENT"] = CA_ACCENT; } catch (_) {}
  try { if (typeof caLoad !== "undefined") window["caLoad"] = caLoad; } catch (_) {}
  try { if (typeof caSave !== "undefined") window["caSave"] = caSave; } catch (_) {}
  try { if (typeof caSubs !== "undefined") window["caSubs"] = caSubs; } catch (_) {}
  try { if (typeof caBump !== "undefined") window["caBump"] = caBump; } catch (_) {}
  try { if (typeof useCinaAuth !== "undefined") window["useCinaAuth"] = useCinaAuth; } catch (_) {}
  try { if (typeof caAdd !== "undefined") window["caAdd"] = caAdd; } catch (_) {}
  try { if (typeof caHasWebAuthn !== "undefined") window["caHasWebAuthn"] = caHasWebAuthn; } catch (_) {}
  try { if (typeof caCreatePasskey !== "undefined") window["caCreatePasskey"] = caCreatePasskey; } catch (_) {}
  try { if (typeof caAssertPasskey !== "undefined") window["caAssertPasskey"] = caAssertPasskey; } catch (_) {}
  try { if (typeof caDeviceLabel !== "undefined") window["caDeviceLabel"] = caDeviceLabel; } catch (_) {}
  try { if (typeof caOpener !== "undefined") window["caOpener"] = caOpener; } catch (_) {}
  try { if (typeof CinaAuth !== "undefined") window["CinaAuth"] = CinaAuth; } catch (_) {}
  try { if (typeof CinaAuthSheet !== "undefined") window["CinaAuthSheet"] = CinaAuthSheet; } catch (_) {}
  try { if (typeof CinaAuthHost !== "undefined") window["CinaAuthHost"] = CinaAuthHost; } catch (_) {}
  try { if (typeof CinaCredentialList !== "undefined") window["CinaCredentialList"] = CinaCredentialList; } catch (_) {}
})();

// ── MODULE: cina-actions.jsx ──
;(function() {
const { useState: usAc, useEffect: ueAc } = React;
function cinaDownload(filename, text, mime) {
  try {
    const url = URL.createObjectURL(new Blob([text], { type: mime || "application/json;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4e3);
    return true;
  } catch (_) {
    return false;
  }
}
let _acOpener = null;
function cinaConfirm(opts) {
  return new Promise((resolve) => {
    if (!_acOpener) {
      resolve(window.confirm(opts.title || "Are you sure?"));
      return;
    }
    _acOpener({ ...opts, resolve });
  });
}
function CinaConfirmHost() {
  const [ctx, setCtx] = usAc(null);
  const [typed, setTyped] = usAc("");
  ueAc(() => {
    _acOpener = (c) => {
      setTyped("");
      setCtx(c);
    };
  }, []);
  ueAc(() => {
    if (!ctx) return;
    const onKey = (e) => {
      if (e.key === "Escape") close(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ctx]);
  if (!ctx) return null;
  const close = (v) => {
    ctx.resolve(v);
    setCtx(null);
  };
  const needWord = ctx.requireTyping;
  const ready = !needWord || typed.trim().toUpperCase() === String(needWord).toUpperCase();
  return ReactDOM.createPortal(
    /* @__PURE__ */ React.createElement("div", { onClick: () => close(false), style: {
      position: "fixed",
      inset: 0,
      zIndex: 9800,
      background: "rgba(0,0,0,.66)",
      backdropFilter: "blur(5px)",
      display: "grid",
      placeItems: "center",
      padding: 24
    } }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
      width: "100%",
      maxWidth: 430,
      background: "var(--c-panel)",
      border: "1px solid var(--c-line-2)",
      borderRadius: "var(--r-2)",
      padding: 24,
      boxShadow: "0 24px 70px rgba(0,0,0,.55)"
    } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: {
      fontSize: "var(--fs-label)",
      letterSpacing: ".16em",
      marginBottom: 10,
      color: ctx.danger ? "var(--c-bad)" : "var(--c-amber)"
    } }, (ctx.kicker || (ctx.danger ? "THIS CANNOT BE UNDONE" : "CONFIRM")).toUpperCase()), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-title)", lineHeight: 1.2, marginBottom: 10 } }, ctx.title), ctx.body && /* @__PURE__ */ React.createElement("p", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55, margin: "0 0 16px", textWrap: "pretty" } }, ctx.body), needWord && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("label", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", display: "block", marginBottom: 7 } }, "TYPE \u201C", String(needWord).toUpperCase(), "\u201D TO CONFIRM"), /* @__PURE__ */ React.createElement("input", { autoFocus: true, value: typed, onChange: (e) => setTyped(e.target.value), style: {
      width: "100%",
      boxSizing: "border-box",
      padding: "10px 12px",
      background: "var(--c-panel-2)",
      border: "1px solid var(--c-line-2)",
      borderRadius: "var(--r-2)",
      color: "var(--c-ink)",
      fontFamily: "var(--f-mono)",
      fontSize: "var(--fs-body)",
      letterSpacing: ".16em"
    } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { className: "btn", style: { height: 34, fontSize: "var(--fs-body)" }, onClick: () => close(false) }, ctx.cancelLabel || "Cancel"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => ready && close(true),
        style: {
          height: 34,
          padding: "0 16px",
          borderRadius: "var(--r-2)",
          border: "none",
          fontFamily: "var(--f-mono)",
          fontSize: "var(--fs-body)",
          letterSpacing: ".16em",
          fontWeight: 700,
          cursor: ready ? "pointer" : "default",
          background: !ready ? "var(--c-panel-2)" : ctx.danger ? "var(--c-bad)" : "var(--c-amber)",
          color: !ready ? "var(--c-ink-4)" : ctx.danger ? tkc("white") : tkc("on-amber")
        }
      },
      (ctx.confirmLabel || "Confirm").toUpperCase()
    )))),
    document.body
  );
}
function cinaPrompt(opts) {
  return new Promise((resolve) => {
    if (!_apOpener) {
      const v = window.prompt(opts.title || "", opts.value || "");
      resolve(v == null ? null : v.trim() || null);
      return;
    }
    _apOpener({ ...opts, resolve });
  });
}
let _apOpener = null;
function CinaPromptHost() {
  const [ctx, setCtx] = usAc(null);
  const [val, setVal] = usAc("");
  ueAc(() => {
    _apOpener = (c) => {
      setVal(c && c.value || "");
      setCtx(c);
    };
  }, []);
  ueAc(() => {
    if (!ctx) return;
    const onKey = (e) => {
      if (e.key === "Escape") close(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ctx]);
  if (!ctx) return null;
  const close = (v) => {
    ctx.resolve(v);
    setCtx(null);
  };
  const err = ctx.validate ? ctx.validate(val.trim()) : null;
  const ready = val.trim().length > 0 && !err;
  const submit = () => {
    if (ready) close(val.trim());
  };
  return ReactDOM.createPortal(
    /* @__PURE__ */ React.createElement("div", { onClick: () => close(null), style: {
      position: "fixed",
      inset: 0,
      zIndex: 9800,
      background: "rgba(0,0,0,.66)",
      backdropFilter: "blur(5px)",
      display: "grid",
      placeItems: "center",
      padding: 24
    } }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
      width: "100%",
      maxWidth: 420,
      background: "var(--c-panel)",
      border: "1px solid var(--c-line-2)",
      borderRadius: "var(--r-2)",
      padding: 24,
      boxShadow: "0 24px 70px rgba(0,0,0,.55)"
    } }, ctx.kicker && /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", marginBottom: 10, color: "var(--c-amber)" } }, ctx.kicker.toUpperCase()), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-title)", lineHeight: 1.2, marginBottom: ctx.body ? 8 : 16 } }, ctx.title), ctx.body && /* @__PURE__ */ React.createElement("p", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55, margin: "0 0 16px", textWrap: "pretty" } }, ctx.body), /* @__PURE__ */ React.createElement(
      "input",
      {
        autoFocus: true,
        value: val,
        onChange: (e) => setVal(e.target.value),
        onKeyDown: (e) => e.key === "Enter" && submit(),
        placeholder: ctx.placeholder || "",
        style: {
          width: "100%",
          boxSizing: "border-box",
          padding: "11px 13px",
          background: "var(--c-panel-2)",
          border: "1px solid " + (err ? "var(--c-bad)" : "var(--c-line-2)"),
          borderRadius: "var(--r-2)",
          color: "var(--c-ink)",
          fontSize: "var(--fs-body)",
          fontFamily: "inherit"
        }
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { minHeight: 18, marginTop: 7 } }, err && /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-bad)" } }, err.toUpperCase())), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 } }, /* @__PURE__ */ React.createElement("button", { className: "btn", style: { height: 34, fontSize: "var(--fs-body)" }, onClick: () => close(null) }, "Cancel"), /* @__PURE__ */ React.createElement("button", { onClick: submit, style: {
      height: 34,
      padding: "0 16px",
      borderRadius: "var(--r-2)",
      border: "none",
      fontFamily: "var(--f-mono)",
      fontSize: "var(--fs-body)",
      letterSpacing: ".16em",
      fontWeight: 700,
      cursor: ready ? "pointer" : "default",
      background: ready ? "var(--c-amber)" : "var(--c-panel-2)",
      color: ready ? tkc("on-amber") : "var(--c-ink-4)"
    } }, (ctx.confirmLabel || "Save").toUpperCase())))),
    document.body
  );
}
function cinaExportData() {
  const S = window.SESSION || {};
  const C = window.CINA || {};
  const payload = {
    exported: (/* @__PURE__ */ new Date()).toISOString(),
    note: "Everything Cina holds for this account on this device.",
    identity: { handle: C.handle || null, email: C.email || null, signedIn: !!C.signedIn, method: C.method || null },
    credentials: (window.CinaAuth ? window.CinaAuth.credentials() : []).map((c) => ({ kind: c.kind, label: c.label, added: new Date(c.at).toISOString() })),
    watchlist: S.watchlist || [],
    ratings: S.ratings || {},
    history: S.history || [],
    holdings: S.holdings || [],
    credits: S.credits != null ? S.credits : null,
    localKeys: Object.keys(localStorage).filter((k) => /^cina/i.test(k))
  };
  const ok = cinaDownload("cina-account-data-" + (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) + ".json", JSON.stringify(payload, null, 2));
  if (window.toast) {
    ok ? toast({ title: "DATA EXPORTED", text: payload.watchlist.length + " saved \xB7 " + Object.keys(payload.ratings).length + " rated \xB7 " + payload.history.length + " watched", kind: "good" }) : toast({ title: "EXPORT BLOCKED", text: "Your browser refused the download.", kind: "bad" });
  }
}
async function cinaClearHistory() {
  const S = window.SESSION || {};
  const n = (S.history || []).length;
  if (!n) {
    if (window.toast) toast({ title: "NOTHING TO CLEAR", text: "No screenings logged yet.", kind: "info" });
    return;
  }
  const ok = await cinaConfirm({
    title: "Clear your watch history?",
    body: n + " logged screening" + (n === 1 ? "" : "s") + " will be removed. Continue-watching positions go with them. Your watchlist, ratings and holdings are untouched.",
    confirmLabel: "Clear history",
    danger: true
  });
  if (!ok) return;
  S.history = [];
  if (S.progress) S.progress = {};
  try {
    localStorage.removeItem("cina-watch-progress");
  } catch (_) {
  }
  if (window.bumpSession) window.bumpSession();
  if (window.toast) toast({ title: "HISTORY CLEARED", text: n + " screening" + (n === 1 ? "" : "s") + " removed.", kind: "good" });
}
async function cinaDeleteAccount() {
  const ok = await cinaConfirm({
    kicker: "This cannot be undone",
    title: "Delete your Cina account?",
    body: "Removes your profile, watchlist, ratings, history and comments from this device and from Cina. Wallets and anything you hold on-chain stay yours \u2014 tokens are not burned.",
    requireTyping: "DELETE",
    confirmLabel: "Delete account",
    danger: true
  });
  if (!ok) return;
  const S = window.SESSION || {};
  ["watchlist", "history", "ratings", "holdings"].forEach((k) => {
    if (Array.isArray(S[k])) S[k] = [];
    else if (S[k]) S[k] = {};
  });
  try {
    Object.keys(localStorage).filter((k) => /^cina/i.test(k)).forEach((k) => localStorage.removeItem(k));
  } catch (_) {
  }
  if (window.CinaAuth) window.CinaAuth.signOut();
  else if (window.cinaSignOut) window.cinaSignOut();
  if (window.bumpSession) window.bumpSession();
  if (window.toast) toast({ title: "ACCOUNT DELETED", text: "Everything local is gone. Sorry to see you go.", kind: "info" });
  if (window.navigate) window.navigate("/");
}
function cinaNotYet(what, detail) {
  if (window.toast) toast({
    title: "NOT IN THIS BUILD",
    text: detail || what + " needs the live Cina backend. Nothing was sent.",
    kind: "info"
  });
}
(function() {
  const mount = () => {
    if (document.getElementById("__cina-confirm-root")) return;
    const host = document.createElement("div");
    host.id = "__cina-confirm-root";
    document.body.appendChild(host);
    const tree = /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(CinaConfirmHost, null), /* @__PURE__ */ React.createElement(CinaPromptHost, null));
    if (ReactDOM.createRoot) ReactDOM.createRoot(host).render(tree);
    else ReactDOM.render(tree, host);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
Object.assign(window, { cinaConfirm, cinaPrompt, cinaExportData, cinaClearHistory, cinaDeleteAccount, cinaNotYet });

  try { if (typeof usAc !== "undefined") window["usAc"] = usAc; } catch (_) {}
  try { if (typeof ueAc !== "undefined") window["ueAc"] = ueAc; } catch (_) {}
  try { if (typeof cinaDownload !== "undefined") window["cinaDownload"] = cinaDownload; } catch (_) {}
  try { if (typeof _acOpener !== "undefined") window["_acOpener"] = _acOpener; } catch (_) {}
  try { if (typeof cinaConfirm !== "undefined") window["cinaConfirm"] = cinaConfirm; } catch (_) {}
  try { if (typeof CinaConfirmHost !== "undefined") window["CinaConfirmHost"] = CinaConfirmHost; } catch (_) {}
  try { if (typeof cinaPrompt !== "undefined") window["cinaPrompt"] = cinaPrompt; } catch (_) {}
  try { if (typeof _apOpener !== "undefined") window["_apOpener"] = _apOpener; } catch (_) {}
  try { if (typeof CinaPromptHost !== "undefined") window["CinaPromptHost"] = CinaPromptHost; } catch (_) {}
  try { if (typeof cinaExportData !== "undefined") window["cinaExportData"] = cinaExportData; } catch (_) {}
  try { if (typeof cinaClearHistory !== "undefined") window["cinaClearHistory"] = cinaClearHistory; } catch (_) {}
  try { if (typeof cinaDeleteAccount !== "undefined") window["cinaDeleteAccount"] = cinaDeleteAccount; } catch (_) {}
  try { if (typeof cinaNotYet !== "undefined") window["cinaNotYet"] = cinaNotYet; } catch (_) {}
})();

// ── MODULE: cina-notifs.jsx ──
;(function() {
const NOTIFS_KEY = "cina:notifs";
const NOTIFS_MAX = 80;
function _nLoad() {
  try {
    const r = localStorage.getItem(NOTIFS_KEY);
    return r ? JSON.parse(r) : [];
  } catch {
    return [];
  }
}
function _nSave(arr) {
  try {
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(arr.slice(0, NOTIFS_MAX)));
  } catch {
  }
}
let _nCache = null;
function _get() {
  if (!_nCache) _nCache = _nLoad();
  return _nCache;
}
function _set(arr) {
  _nCache = arr;
  _nSave(arr);
  _nBroadcast();
}
function _nBroadcast() {
  window.dispatchEvent(new Event("cina-notifs-updated"));
}
function _nSeedFromLegacy() {
  const existing = new Set(_get().map((n) => n.id));
  const alerts = window.USER && window.USER.alerts || [];
  const fromWatch = alerts.map((a) => ({
    id: "w-" + (a.filmId || "") + "-" + (a.ts || a.t || ""),
    surface: "watch",
    kind: a.kind || "drop",
    title: a.title || a.head || "New alert",
    sub: a.sub || a.body || "",
    t: a.ts || a.t || Date.now() - Math.random() * 864e5,
    read: false,
    href: a.filmId ? "#/film/" + a.filmId : null
  })).filter((n) => n.id && !existing.has(n.id));
  if (fromWatch.length) {
    const merged = [...fromWatch, ..._get()].sort((a, b) => b.t - a.t).slice(0, NOTIFS_MAX);
    _set(merged);
  }
}
function cinaNotifs(surface) {
  const all = _get();
  return surface ? all.filter((n) => !n.surface || n.surface === surface || n.surface === "all") : all;
}
function cinaAddNotif(n) {
  if (!n || !n.id) return;
  const prev = _get().filter((x) => x.id !== n.id);
  _set([{ surface: "all", read: false, t: Date.now(), ...n }, ...prev]);
}
function cinaMarkRead(id) {
  _set(_get().map((n) => n.id === id ? { ...n, read: true } : n));
}
function cinaMarkAllRead(surface) {
  _set(_get().map(
    (n) => !surface || !n.surface || n.surface === surface || n.surface === "all" ? { ...n, read: true } : n
  ));
}
function cinaUnreadCount(surface) {
  return cinaNotifs(surface).filter((n) => !n.read).length;
}
Object.assign(window, { cinaNotifs, cinaMarkRead, cinaMarkAllRead, cinaUnreadCount });
const { useState: useCN, useEffect: useCNEff, useCallback: useCNCb } = React;
function useCinaNotifs(surface) {
  const [notifs, setNotifs] = useCN(() => cinaNotifs(surface));
  useCNEff(() => {
    const refresh = () => setNotifs(cinaNotifs(surface));
    window.addEventListener("cina-notifs-updated", refresh);
    return () => window.removeEventListener("cina-notifs-updated", refresh);
  }, [surface]);
  const markRead = useCNCb((id) => {
    cinaMarkRead(id);
  }, []);
  const markAllRead = useCNCb(() => {
    cinaMarkAllRead(surface);
  }, [surface]);
  const unread = notifs.filter((n) => !n.read).length;
  return { notifs, unread, markRead, markAllRead };
}
const N_ICONS = {
  drop: "play",
  royalty: "coin",
  premiere: "spark",
  publish: "globe",
  render: "wand",
  bid: "trend",
  claim: "wallet",
  sale: "ticket",
  follow: "user",
  outbid: "bell"
};
const N_COLORS = {
  royalty: "var(--c-good)",
  claim: "var(--c-good)",
  publish: "var(--c-good)",
  render: "var(--c-amber)",
  drop: "var(--c-amber)",
  premiere: "var(--c-blood-l)",
  bid: "var(--c-amber)",
  outbid: "var(--c-blood-l)",
  sale: "var(--c-amber)"
};
const _nIcon = (k) => N_ICONS[k] || "bell";
const _nColor = (k) => N_COLORS[k] || "var(--c-ink-2)";
function _ago(t) {
  const s = Math.round((Date.now() - t) / 1e3);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
function CinaNotifDropdown({ surface, onClose }) {
  const { notifs, unread, markRead, markAllRead } = useCinaNotifs(surface);
  const goNotif = (n) => {
    markRead(n.id);
    onClose && onClose();
    if (n.href) {
      window.location.hash = n.href.replace(/^#/, "");
    }
  };
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", height: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px 10px", borderBottom: "1px solid var(--c-line)", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" } }, "NOTIFICATIONS"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, unread > 0 && /* @__PURE__ */ React.createElement("button", { onClick: markAllRead, style: { appearance: "none", background: "transparent", border: 0, color: "var(--c-amber)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", cursor: "pointer", letterSpacing: ".16em", padding: 0 } }, "MARK ALL READ"), surface === "watch" && /* @__PURE__ */ React.createElement("button", { onClick: () => {
    onClose && onClose();
    window.location.hash = "#/notifications";
  }, style: { appearance: "none", background: "transparent", border: 0, color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", cursor: "pointer", letterSpacing: ".16em", padding: 0 } }, "ALL \u2192"))), /* @__PURE__ */ React.createElement("div", { style: { overflowY: "auto", maxHeight: 440, flex: 1 } }, notifs.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: "36px 20px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-title)", marginBottom: 8, opacity: 0.4 } }, "\u{1F514}"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)" } }, "You're all caught up.")) : notifs.map((n) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: n.id,
      onClick: () => goNotif(n),
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        width: "100%",
        padding: "11px 16px",
        border: "none",
        textAlign: "left",
        cursor: "pointer",
        background: n.read ? "transparent" : "rgba(var(--accent-rgb),.06)",
        borderBottom: "1px solid var(--c-line)",
        color: "inherit",
        transition: "background .12s"
      },
      onMouseEnter: (e) => e.currentTarget.style.background = "var(--c-hover)",
      onMouseLeave: (e) => e.currentTarget.style.background = n.read ? "transparent" : "rgba(var(--accent-rgb),.06)"
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      width: 30,
      height: 30,
      borderRadius: "50%",
      flexShrink: 0,
      marginTop: 1,
      background: _nColor(n.kind) + "22",
      border: `1px solid ${_nColor(n.kind)}44`,
      color: _nColor(n.kind),
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    } }, /* @__PURE__ */ React.createElement(Icon, { name: _nIcon(n.kind), size: 13 })),
    /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: n.read ? 400 : 500, lineHeight: 1.3 } }, n.title), n.sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 2, lineHeight: 1.4 } }, n.sub), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 4 } }, _ago(n.t))),
    !n.read && /* @__PURE__ */ React.createElement("div", { style: { width: 6, height: 6, borderRadius: "50%", background: "var(--c-amber)", flexShrink: 0, marginTop: 6 } })
  ))));
}
function CinaNotifPage() {
  const { notifs, unread, markRead, markAllRead } = useCinaNotifs("watch");
  const [filter, setFilter] = useCN("all");
  const kinds = ["all", "drop", "premiere", "royalty", "publish", "render", "follow"];
  const filtered = filter === "all" ? notifs : notifs.filter((n) => n.kind === filter);
  const goNotif = (n) => {
    markRead(n.id);
    if (n.href && window.navigate) window.navigate(n.href.replace(/^#\//, "/"));
    else if (n.href) window.location.hash = n.href.replace(/^#/, "");
  };
  return /* @__PURE__ */ React.createElement("div", { style: { padding: "0 var(--gutter) 96px", maxWidth: "var(--w-page)", margin: "0 auto" } }, window.PmMasthead ? /* @__PURE__ */ React.createElement(PmMasthead, { bare: true, index: "Account", path: "Notifications", count: `${unread} unread`, title: "Notifications", lede: "Drops, premieres, royalties and renders from Watch, Studio and Producers." }, unread > 0 && /* @__PURE__ */ React.createElement("button", { onClick: markAllRead, className: "pm-btn" }, "Mark all read")) : /* @__PURE__ */ React.createElement("h1", null, "Notifications"), /* @__PURE__ */ React.createElement("div", { className: "pm-mast__tools", style: { margin: "18px 0 8px" } }, kinds.map((k) => /* @__PURE__ */ React.createElement("button", { key: k, className: "pm-chip", "data-on": filter === k ? "1" : "0", onClick: () => setFilter(k) }, k === "all" ? "All" : k.charAt(0).toUpperCase() + k.slice(1)))), filtered.length === 0 ? /* @__PURE__ */ React.createElement(EmptyState, { icon: "bell", title: "Nothing here yet", body: filter === "all" ? "Notifications from Watch, Studio and Producers show up here." : `No ${filter} notifications yet.` }) : /* @__PURE__ */ React.createElement("div", { className: "pm-index", style: { marginTop: 20 } }, filtered.map((n) => /* @__PURE__ */ React.createElement("button", { key: n.id, onClick: () => goNotif(n), style: { gridTemplateColumns: "44px minmax(0,1fr) auto", alignItems: "start" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 38, height: 38, borderRadius: "50%", background: _nColor(n.kind) + "1c", color: _nColor(n.kind), display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Icon, { name: _nIcon(n.kind), size: 16 })), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: 5, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { className: "pm-k", style: { color: _nColor(n.kind) } }, n.kind || "alert"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "clamp(19px,1.6vw,24px)", lineHeight: 1.2, color: n.read ? "var(--c-ink-2)" : "var(--c-ink)" } }, n.title), n.sub && /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5 } }, n.sub)), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { className: "pm-k" }, _ago(n.t)), !n.read && /* @__PURE__ */ React.createElement("span", { "aria-label": "Unread", style: { width: 8, height: 8, borderRadius: "50%", background: "var(--c-amber)" } }))))));
}
window.CinaNotifPage = CinaNotifPage;
_nSeedFromLegacy();
(function _patchShipMaster() {
  const _orig = window.shipMaster;
  if (!_orig) return;
  window.shipMaster = function(opts) {
    _orig(opts);
    const proj = window.getActiveProject && window.getActiveProject();
    cinaAddNotif({
      id: "pub-" + Date.now(),
      surface: "all",
      kind: "publish",
      title: `${proj && proj.title || "Your film"} is live on Watch`,
      sub: "Your master is published. Check the dashboard for first views and royalties.",
      t: Date.now(),
      href: null
    });
  };
})();
(function _patchRenderComplete() {
  const _origToast = window.toast;
  if (!_origToast) return;
  window.toast = function(opts) {
    _origToast(opts);
    if (opts && opts.kind === "good" && opts.title && /render|generated|complete/i.test(opts.title)) {
      cinaAddNotif({
        id: "render-" + Date.now(),
        surface: "studio",
        kind: "render",
        title: opts.title,
        sub: opts.text || "Ready in the Generate panel.",
        t: Date.now()
      });
    }
  };
})();

  try { if (typeof NOTIFS_KEY !== "undefined") window["NOTIFS_KEY"] = NOTIFS_KEY; } catch (_) {}
  try { if (typeof NOTIFS_MAX !== "undefined") window["NOTIFS_MAX"] = NOTIFS_MAX; } catch (_) {}
  try { if (typeof _nLoad !== "undefined") window["_nLoad"] = _nLoad; } catch (_) {}
  try { if (typeof _nSave !== "undefined") window["_nSave"] = _nSave; } catch (_) {}
  try { if (typeof _nCache !== "undefined") window["_nCache"] = _nCache; } catch (_) {}
  try { if (typeof _get !== "undefined") window["_get"] = _get; } catch (_) {}
  try { if (typeof _set !== "undefined") window["_set"] = _set; } catch (_) {}
  try { if (typeof _nBroadcast !== "undefined") window["_nBroadcast"] = _nBroadcast; } catch (_) {}
  try { if (typeof _nSeedFromLegacy !== "undefined") window["_nSeedFromLegacy"] = _nSeedFromLegacy; } catch (_) {}
  try { if (typeof cinaNotifs !== "undefined") window["cinaNotifs"] = cinaNotifs; } catch (_) {}
  try { if (typeof cinaAddNotif !== "undefined") window["cinaAddNotif"] = cinaAddNotif; } catch (_) {}
  try { if (typeof cinaMarkRead !== "undefined") window["cinaMarkRead"] = cinaMarkRead; } catch (_) {}
  try { if (typeof cinaMarkAllRead !== "undefined") window["cinaMarkAllRead"] = cinaMarkAllRead; } catch (_) {}
  try { if (typeof cinaUnreadCount !== "undefined") window["cinaUnreadCount"] = cinaUnreadCount; } catch (_) {}
  try { if (typeof useCN !== "undefined") window["useCN"] = useCN; } catch (_) {}
  try { if (typeof useCNEff !== "undefined") window["useCNEff"] = useCNEff; } catch (_) {}
  try { if (typeof useCNCb !== "undefined") window["useCNCb"] = useCNCb; } catch (_) {}
  try { if (typeof useCinaNotifs !== "undefined") window["useCinaNotifs"] = useCinaNotifs; } catch (_) {}
  try { if (typeof N_ICONS !== "undefined") window["N_ICONS"] = N_ICONS; } catch (_) {}
  try { if (typeof N_COLORS !== "undefined") window["N_COLORS"] = N_COLORS; } catch (_) {}
  try { if (typeof _nIcon !== "undefined") window["_nIcon"] = _nIcon; } catch (_) {}
  try { if (typeof _nColor !== "undefined") window["_nColor"] = _nColor; } catch (_) {}
  try { if (typeof _ago !== "undefined") window["_ago"] = _ago; } catch (_) {}
  try { if (typeof CinaNotifDropdown !== "undefined") window["CinaNotifDropdown"] = CinaNotifDropdown; } catch (_) {}
  try { if (typeof CinaNotifPage !== "undefined") window["CinaNotifPage"] = CinaNotifPage; } catch (_) {}
})();

// ── MODULE: watch-data.jsx ──
;(function() {
const _palette = {
  noir: tkc("line-3"),
  cobalt: tkc("cat-6"),
  rust: tkc("blood"),
  forest: tkc("cat-6"),
  pearl: tkc("ink-4"),
  ember: tkc("cat-3"),
  steel: tkc("cat-6"),
  amber: tkc("amber-d"),
  iron: tkc("line-2"),
  rose: tkc("blood"),
  sand: tkc("ink-3"),
  ash: tkc("cat-6"),
  spruce: tkc("line-3"),
  blood: tkc("blood")
};
const CATALOG = [
  // ── Series ── (S/E)
  {
    id: "ll",
    title: "Last Light",
    creator: "ELIAS VOSS \xB7 Cina Pictures",
    creatorId: "voss",
    kind: "series",
    season: 1,
    totalEpisodes: 8,
    currentEp: 5,
    nextDrop: "2026-05-12T19:00:00",
    // friday
    genre: ["Noir thriller"],
    runtime: "47m avg",
    year: 2026,
    rating: 4.7,
    ratings: 8412,
    views: 184e3,
    cover: _palette.noir,
    thumb: "noir-f",
    logline: "A photographer discovers her dead sister in undeveloped film, frame by frame.",
    synopsis: "Nadya Voss has been developing the same roll of film for thirteen years. Tonight, in the safelight, the seventh frame finally surfaces \u2014 and her sister is standing behind her in it. Each weekly episode pulls one more frame from the bath.",
    moods: ["slow burn", "rain", "secrets"],
    tags: ["AI generated", "series", "drops Fridays"],
    free: false,
    rent: 4.99,
    buy: 24.99,
    nftPremiere: true,
    premiereHrs: 168,
    series: [
      { ep: 1, title: "Eight, Hold", drop: "2026-04-10", duration: "44m", thumb: "darkroom-wide", watched: 1, status: "released" },
      { ep: 2, title: "The Stop Bath", drop: "2026-04-17", duration: "46m", thumb: "darkroom-est", watched: 1, status: "released" },
      { ep: 3, title: "Safelight", drop: "2026-04-24", duration: "48m", thumb: "developer", watched: 1, status: "released" },
      { ep: 4, title: "Fixer", drop: "2026-05-01", duration: "44m", thumb: "voss-eye", watched: 0.62, status: "released" },
      { ep: 5, title: "The Seventh Frame", drop: "2026-05-08", duration: "49m", thumb: "the-photo", watched: 0, status: "released", new: true },
      { ep: 6, title: "Print", drop: "2026-05-15", duration: "\u2014", thumb: "phone", watched: 0, status: "scheduled" },
      { ep: 7, title: "Dodge & Burn", drop: "2026-05-22", duration: "\u2014", thumb: "darkroom-est", watched: 0, status: "scheduled" },
      { ep: 8, title: "Negative", drop: "2026-05-29", duration: "\u2014", thumb: "darkroom-wide", watched: 0, status: "scheduled", finale: true }
    ],
    nft: "voss-ll",
    color: tkc("cat-3")
  },
  {
    id: "marauder",
    title: "Marauder",
    creator: "Lin Hara",
    creatorId: "hara",
    kind: "series",
    season: 2,
    totalEpisodes: 6,
    currentEp: 4,
    nextDrop: "2026-05-13T19:00:00",
    genre: ["Sci-fi", "Crime"],
    runtime: "52m avg",
    year: 2026,
    rating: 4.4,
    ratings: 12300,
    views: 41e4,
    cover: _palette.cobalt,
    thumb: "sci-ship",
    logline: "A salvage crew on Europa runs into something that learned to mimic ice.",
    synopsis: "After the events of Season One, the Marauder limps home with a stowaway nobody can find on cameras. Eight episodes. One of them is lying.",
    moods: ["tense", "crew dynamics"],
    tags: ["AI generated", "season 2"],
    free: false,
    rent: 4.99,
    buy: 29.99,
    nftPremiere: false,
    series: [
      { ep: 1, title: "Crawlspace", drop: "2026-04-22", duration: "52m", thumb: "phone", watched: 1, status: "released" },
      { ep: 2, title: "Ice Memory", drop: "2026-04-29", duration: "54m", thumb: "phone", watched: 0.45, status: "released" },
      { ep: 3, title: "The Hold", drop: "2026-05-06", duration: "51m", thumb: "phone", watched: 0, status: "released" },
      { ep: 4, title: "Hatch", drop: "2026-05-13", duration: "\u2014", thumb: "phone", watched: 0, status: "scheduled" },
      { ep: 5, title: "Vacuum", drop: "2026-05-20", duration: "\u2014", thumb: "phone", watched: 0, status: "scheduled" },
      { ep: 6, title: "Mimic", drop: "2026-05-27", duration: "\u2014", thumb: "phone", watched: 0, status: "scheduled", finale: true }
    ],
    nft: "hara-mar",
    color: tkc("cat-6")
  },
  {
    id: "longhall",
    title: "Long Hall",
    creator: "Mira Sten",
    creatorId: "sten",
    kind: "series",
    season: 1,
    totalEpisodes: 10,
    currentEp: 1,
    nextDrop: "2026-05-15T18:00:00",
    genre: ["Drama"],
    runtime: "38m avg",
    year: 2026,
    rating: 4.2,
    ratings: 980,
    views: 21e3,
    cover: _palette.forest,
    thumb: "window-rain",
    logline: "Two brothers run their late father's diner. Episode 1 is the day they put the sign up.",
    synopsis: "A quiet ten-part drama about grief and pancakes. Drops weekly through summer.",
    moods: ["warm", "slow"],
    tags: ["AI generated", "premieres Friday"],
    free: false,
    rent: 3.99,
    buy: 19.99,
    nftPremiere: true,
    premiereHrs: 72,
    series: [
      { ep: 1, title: "Pilot \u2014 Open", drop: "2026-05-15", duration: "\u2014", thumb: "darkroom-wide", watched: 0, status: "scheduled", premiere: true },
      ...Array.from({ length: 9 }, (_, i) => ({ ep: i + 2, title: ["Mornings", "The Gravy", "Mom Calls", "Card Reader", "Health Inspector", "The Regulars", "Mid-Shift", "The Sale", "Last Pancake"][i], drop: `2026-05-${22 + i * 7 < 30 ? 22 + i * 7 : (22 + i * 7) % 30}`, duration: "\u2014", thumb: "darkroom-wide", watched: 0, status: "scheduled" }))
    ],
    nft: "sten-lh",
    color: tkc("cat-5")
  },
  // ── Films (single)
  { id: "bluejay", title: "Bluejay", creator: "Elias Voss", creatorId: "voss", kind: "film", genre: ["Drama", "Coming-of-age"], runtime: "1h 47m", year: 2025, rating: 4.6, ratings: 38e3, views: 92e4, cover: _palette.cobalt, thumb: "interior-dim", logline: "A boy in 1991 finds a stolen radio scanner. What he hears makes him grow up in a single afternoon.", moods: ["tender", "summer"], tags: ["AI generated", "award winner"], free: false, rent: 4.99, buy: 14.99, nftPremiere: false, nft: "voss-bj", color: tkc("cat-6") },
  { id: "thefence", title: "The Fence", creator: "Yara Kim", creatorId: "ykim", kind: "film", genre: ["Western"], runtime: "2h 02m", year: 2026, rating: 4.5, ratings: 14500, views: 312e3, cover: _palette.rust, thumb: "west-rider", logline: "A widow in the high desert refuses to move the line.", moods: ["slow burn", "wide"], tags: ["AI generated"], free: false, rent: 4.99, buy: 19.99, nftPremiere: true, premiereHrs: 96, nft: "ykim-tf", color: tkc("cat-3") },
  { id: "frequency", title: "Frequency 88.6", creator: "Tao Reng", creatorId: "reng", kind: "film", genre: ["Sci-fi"], runtime: "1h 38m", year: 2026, rating: 4.3, ratings: 22100, views: 54e4, cover: _palette.steel, thumb: "sci-neon", logline: "A pirate radio DJ in 1979 starts receiving broadcasts from her own future.", moods: ["cassette", "neon"], tags: ["AI generated", "trending"], free: false, rent: 3.99, buy: 16.99, nftPremiere: true, premiereHrs: 48, nft: "reng-fr", color: tkc("ink-4") },
  { id: "carrion", title: "Carrion", creator: "Boris Helm", creatorId: "helm", kind: "film", genre: ["Horror"], runtime: "1h 32m", year: 2026, rating: 4.1, ratings: 18800, views: 39e4, cover: _palette.blood, thumb: "scared-hall", logline: "A taxidermist's apprentice finds out what her mentor really collects.", moods: ["wet", "patient"], tags: ["AI generated"], free: false, rent: 4.99, buy: 14.99, nftPremiere: false, nft: "helm-car", color: tkc("blood") },
  { id: "pelt", title: "Pelt", creator: "Boris Helm", creatorId: "helm", kind: "film", genre: ["Horror", "Folk"], runtime: "1h 18m", year: 2025, rating: 4, ratings: 9100, views: 178e3, cover: _palette.spruce, thumb: "lantern", logline: "A village wears its dead through the winter so the cold can't tell who's gone.", moods: ["folk", "cold"], tags: ["AI generated"], free: true, ads: true, nftPremiere: false, nft: "helm-pel", color: tkc("cat-6") },
  { id: "after", title: "Afterlight", creator: "Mira Sten", creatorId: "sten", kind: "film", genre: ["Romance"], runtime: "1h 52m", year: 2025, rating: 4.4, ratings: 31200, views: 62e4, cover: _palette.amber, thumb: "noir-m", logline: "Two strangers share a delayed flight. Then they share another one. Then another.", moods: ["warm", "patient"], tags: ["AI generated"], free: false, rent: 3.99, buy: 14.99, nftPremiere: false, nft: "sten-al", color: tkc("warn") },
  { id: "cellar", title: "Cellar Door", creator: "Anson Park", creatorId: "park", kind: "film", genre: ["Mystery"], runtime: "1h 41m", year: 2026, rating: 4.2, ratings: 7400, views: 142e3, cover: _palette.iron, thumb: "interior-dim", logline: "An estate sale turns up a key with no door. The house grows one to fit it.", moods: ["uncanny", "still"], tags: ["AI generated"], free: false, rent: 3.99, buy: 12.99, nftPremiere: false, nft: "park-cd", color: tkc("cat-6") },
  { id: "swallows", title: "The Swallows", creator: "Yara Kim", creatorId: "ykim", kind: "film", genre: ["Drama"], runtime: "2h 14m", year: 2025, rating: 4.7, ratings: 44500, views: 11e5, cover: _palette.sand, thumb: "window-rain", logline: "Three sisters return to their childhood home to bury a fourth they never told anyone about.", moods: ["unforgiving", "lyrical"], tags: ["AI generated", "Letterbox top 50"], free: false, rent: 4.99, buy: 19.99, nftPremiere: false, nft: "ykim-sw", color: tkc("ink-3") },
  { id: "haul", title: "Haul", creator: "Lin Hara", creatorId: "hara", kind: "film", genre: ["Crime"], runtime: "1h 49m", year: 2024, rating: 4, ratings: 12e3, views: 24e4, cover: _palette.ash, thumb: "face-night", logline: "Two long-haul truckers move a load they aren't supposed to know they're moving.", moods: ["asphalt", "diesel"], tags: ["AI generated"], free: false, rent: 2.99, buy: 9.99, nftPremiere: false, nft: "hara-hl", color: tkc("ink-4") },
  { id: "salt", title: "Salt Year", creator: "Eve Roan", creatorId: "roan", kind: "film", genre: ["Drama"], runtime: "1h 36m", year: 2025, rating: 4.5, ratings: 19800, views: 376e3, cover: _palette.pearl, thumb: "interior-dim", logline: "A widower spends a year salting fish with his late wife's recipe book.", moods: ["mourning", "salt"], tags: ["AI generated"], free: false, rent: 3.99, buy: 12.99, nftPremiere: false, nft: "roan-sy", color: tkc("ink-3") },
  { id: "kindling", title: "Kindling", creator: "Soren Vail", creatorId: "vail", kind: "film", genre: ["Thriller"], runtime: "1h 44m", year: 2026, rating: 4.3, ratings: 8800, views: 156e3, cover: _palette.ember, thumb: "alley-night", logline: "An arson inspector starts every fire she's called to investigate.", moods: ["heat", "guilt"], tags: ["AI generated", "new"], free: false, rent: 4.99, buy: 14.99, nftPremiere: true, premiereHrs: 72, nft: "vail-kn", color: tkc("bad") },
  { id: "moss", title: "Moss", creator: "June Aikara", creatorId: "aika", kind: "film", genre: ["Doc"], runtime: "58m", year: 2025, rating: 4.6, ratings: 4400, views: 88e3, cover: _palette.forest, thumb: "lantern", logline: "Four years inside a moss farm in northern Japan.", moods: ["green", "patient"], tags: ["doc"], free: true, ads: true, nftPremiere: false, nft: "aika-ms", color: tkc("ink-4") },
  { id: "bantam", title: "Bantam", creator: "Soren Vail", creatorId: "vail", kind: "film", genre: ["Sports"], runtime: "1h 22m", year: 2024, rating: 4.1, ratings: 14e3, views: 29e4, cover: _palette.rose, thumb: "face-night", logline: "An aging featherweight steps up to bantam to keep his daughter in school.", moods: ["sweat", "closeness"], tags: ["AI generated"], free: false, rent: 2.99, buy: 9.99, nftPremiere: false, nft: "vail-bn", color: tkc("blood-x") },
  { id: "cardinal", title: "Cardinal Rules", creator: "Anson Park", creatorId: "park", kind: "film", genre: ["Comedy"], runtime: "1h 28m", year: 2025, rating: 4, ratings: 22200, views: 48e4, cover: _palette.amber, thumb: "noir-m", logline: "A nun runs a pirate radio station. Her bishop is the only listener.", moods: ["dry", "warm"], tags: ["AI generated"], free: false, rent: 2.99, buy: 9.99, nftPremiere: false, nft: "park-cr", color: tkc("amber-d") },
  { id: "ghosting", title: "Ghosting", creator: "Eve Roan", creatorId: "roan", kind: "film", genre: ["Romance"], runtime: "1h 39m", year: 2026, rating: 4.2, ratings: 6200, views: 11e4, cover: _palette.cobalt, thumb: "window-rain", logline: "Two exes keep running into each other in dreams. Their therapist is concerned.", moods: ["liminal", "tender"], tags: ["AI generated"], free: false, rent: 3.99, buy: 12.99, nftPremiere: false, nft: "roan-gh", color: tkc("cat-6") },
  { id: "drift", title: "Drift", creator: "Tao Reng", creatorId: "reng", kind: "film", genre: ["Sci-fi"], runtime: "2h 04m", year: 2024, rating: 4.6, ratings: 58200, views: 13e5, cover: _palette.steel, thumb: "sci-surface", logline: "A solo astronaut on a one-way mission decides to turn around.", moods: ["cold", "vast"], tags: ["AI generated", "classic"], free: false, rent: 4.99, buy: 19.99, nftPremiere: false, nft: "reng-dr", color: tkc("cat-6") },
  { id: "mire", title: "Mire", creator: "Boris Helm", creatorId: "helm", kind: "film", genre: ["Horror"], runtime: "1h 21m", year: 2025, rating: 3.9, ratings: 5600, views: 92e3, cover: _palette.spruce, thumb: "scared-hall", logline: "Surveyors stake a property line through a swamp that doesn't want to be measured.", moods: ["wet", "patient"], tags: ["AI generated"], free: false, rent: 3.99, buy: 12.99, nftPremiere: false, nft: "helm-mr", color: tkc("cat-6") },
  { id: "verge", title: "Verge", creator: "Lin Hara", creatorId: "hara", kind: "film", genre: ["Crime"], runtime: "1h 51m", year: 2026, rating: 4.4, ratings: 11200, views: 198e3, cover: _palette.iron, thumb: "noir-m", logline: "A getaway driver's GPS keeps suggesting routes he's never taken before.", moods: ["asphalt", "tense"], tags: ["AI generated", "new"], free: false, rent: 4.99, buy: 14.99, nftPremiere: true, premiereHrs: 24, nft: "hara-vg", color: tkc("cat-6") },
  { id: "pearl", title: "Pearl & Me", creator: "June Aikara", creatorId: "aika", kind: "film", genre: ["Family"], runtime: "1h 14m", year: 2025, rating: 4.7, ratings: 16800, views: 286e3, cover: _palette.pearl, thumb: "window-rain", logline: "A 9-year-old keeps a journal of her grandmother's last summer.", moods: ["bright", "soft"], tags: ["family"], free: true, ads: true, nftPremiere: false, nft: "aika-pm", color: tkc("ink-3") },
  { id: "tender", title: "Tender", creator: "Mira Sten", creatorId: "sten", kind: "film", genre: ["Drama"], runtime: "1h 47m", year: 2024, rating: 4.3, ratings: 21e3, views: 41e4, cover: _palette.amber, thumb: "interior-dim", logline: "A line cook trains his replacement on the day he gets fired.", moods: ["kitchen", "tight"], tags: ["AI generated"], free: false, rent: 3.99, buy: 12.99, nftPremiere: false, nft: "sten-td", color: tkc("amber-d") },
  { id: "obsidian", title: "Obsidian", creator: "Yara Kim", creatorId: "ykim", kind: "film", genre: ["Western"], runtime: "1h 58m", year: 2024, rating: 4.4, ratings: 13800, views: 244e3, cover: _palette.iron, thumb: "west-canyon", logline: "A scout maps a canyon that shouldn't be on any map.", moods: ["wide", "still"], tags: ["AI generated"], free: false, rent: 3.99, buy: 14.99, nftPremiere: false, nft: "ykim-ob", color: tkc("cat-6") },
  { id: "needle", title: "Needle", creator: "Soren Vail", creatorId: "vail", kind: "film", genre: ["Thriller"], runtime: "1h 33m", year: 2024, rating: 3.8, ratings: 7200, views: 14e4, cover: _palette.rose, thumb: "alley-night", logline: "A tattoo artist starts inking memories she's never had.", moods: ["ink", "warm"], tags: ["AI generated"], free: false, rent: 2.99, buy: 9.99, nftPremiere: false, nft: "vail-nd", color: tkc("blood-x") },
  { id: "grail", title: "Saint Grail Pkwy", creator: "Anson Park", creatorId: "park", kind: "film", genre: ["Comedy"], runtime: "1h 26m", year: 2026, rating: 4, ratings: 4800, views: 78e3, cover: _palette.amber, thumb: "phone", logline: "A roadside attraction owner finds the actual grail. It's a coffee mug.", moods: ["dry", "americana"], tags: ["AI generated"], free: false, rent: 2.99, buy: 9.99, nftPremiere: false, nft: "park-gr", color: tkc("amber-d") },
  { id: "anvil", title: "Anvil", creator: "Eve Roan", creatorId: "roan", kind: "film", genre: ["Drama"], runtime: "1h 42m", year: 2024, rating: 4.5, ratings: 19200, views: 32e4, cover: _palette.ash, thumb: "darkroom-wide", logline: "A blacksmith's daughter inherits the forge and the long argument inside it.", moods: ["fire", "close"], tags: ["AI generated"], free: false, rent: 3.99, buy: 12.99, nftPremiere: false, nft: "roan-an", color: tkc("ink-4") }
];
CATALOG.forEach((c) => {
  if (!c.synopsis && c.kind === "film") c.synopsis = c.logline;
});
const _pubNorm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const PUBLISHED_FROM_STUDIO = window.cinaPublishedFilms ? window.cinaPublishedFilms() : [];
PUBLISHED_FROM_STUDIO.forEach((p) => {
  if (!p || !p.id) return;
  let at = CATALOG.findIndex((f) => f.id === p.id);
  if (at < 0) at = CATALOG.findIndex((f) => _pubNorm(f.title) === _pubNorm(p.title));
  if (at >= 0) {
    const authored = CATALOG[at];
    CATALOG[at] = {
      ...authored,
      studioProjectId: p.studioProjectId || authored.studioProjectId,
      studioCode: p.studioCode || authored.studioCode,
      publishedByYou: true,
      publishedAt: p.publishedAt || Date.now(),
      distribution: p.distribution || authored.distribution,
      releaseDate: p.releaseDate || authored.releaseDate,
      tags: [.../* @__PURE__ */ new Set([...authored.tags || [], ...p.tags || []])]
    };
    p.id = authored.id;
    return;
  }
  CATALOG.unshift(p);
});
const PROGRAMMER_NOTES = {
  ll: "Voss shoots a darkroom like a confession booth. Start here even if noir isn't yours \u2014 the seventh-frame reveal in episode five is the best-engineered gut-punch we've run all year.",
  marauder: "The rare genre series that respects your patience. Hara hides the whole mystery in episode one's camera blocking. Watch it twice; you'll be furious about everything you missed the first time.",
  longhall: "Ten episodes about grief and pancakes, and somehow never twee. Sten earns every quiet minute. The pilot's sign-hanging scene is the most I have ever cried at carpentry.",
  bluejay: "A single summer afternoon stretched to feature length, and it never sags. Voss's most tender film \u2014 proof the man who does dread so well can do warmth just as precisely.",
  thefence: "A western that refuses the showdown and is better for it. Kim lets the high desert do the threatening. Sit with the stillness; it pays back every minute you give it.",
  frequency: "The one I push hardest this season. Reng turns a pirate-radio booth into a time machine without a single effect that announces itself. Pure analog dread, and the soundtrack is immaculate.",
  carrion: "Helm's patience is the whole horror. Don't skip the first forty minutes \u2014 they are loading the spring. By the reveal you won't trust a single quiet room again.",
  pelt: "Folk horror that earns its cold. The village's grief-ritual logic is so airtight it stops reading as metaphor. Free, with ads, and worth far more than the price of neither.",
  after: "A romance built entirely in delayed departure lounges, and it somehow flies. Sten finds the whole relationship in the spaces between flights. Quietly one of the most rewatched films we carry.",
  cellar: "A haunted-house film where the house is the curious one. Park keeps every scare architectural. The key-with-no-door image has been renting space in my head for three weeks now.",
  swallows: "Our highest-rated drama, and it earns every star. Three sisters, one buried secret, zero melodrama. Kim writes silence better than most writers write dialogue. Unforgiving, lyrical, and never sentimental.",
  haul: "Two truckers, one load they shouldn't understand, and the most tension we've ever wrung from a speed limit. Hara shoots asphalt like a lead character. Lean, mean, badly underseen.",
  salt: "A widower, a recipe book, and a full year of salting fish. It should be unbearable; it is the opposite. Roan films mourning as a form of devotion.",
  kindling: "The arson inspector starts the fires she's called to investigate, and the film never lets you off the hook about why. Vail's tightest thriller yet \u2014 new, and already a staff fixation.",
  moss: "Four years inside a northern moss farm, and the slowest fifty-eight minutes you will happily lose. A documentary that quietly recalibrates your sense of time. Free; clear an evening for it.",
  bantam: "A boxing film that stays in the corner, not the ring. Vail keeps the camera close enough to smell the fatigue. The fatherhood underneath lands harder than any single punch.",
  cardinal: "A nun runs a pirate radio station for an audience of exactly one. Park's driest comedy and his warmest. Don't let the logline fool you \u2014 it is secretly about faith.",
  ghosting: "Exes who keep meeting in dreams, and a film smart enough to make that the problem rather than the cure. Roan finds real ache inside a premise that could have been a gimmick.",
  drift: "The astronaut decides to turn around, and the film becomes about everything that one word costs. A modern classic in our library \u2014 cold, vast, devastating. Begin your sci-fi here.",
  mire: "Surveyors versus a swamp that refuses to be measured. Helm at his most elemental. Slighter than Carrion, but cut from the same patient, dripping cloth. A quiet, wet nightmare.",
  verge: "A getaway driver whose GPS knows roads he has never driven. The premise could have been a trick; Hara makes it existential instead. New this week, and climbing the charts fast.",
  pearl: "A nine-year-old's journal of her grandmother's last summer. Family-rated and never once saccharine. Aikara trusts a child's eye completely and is rewarded. Free, and the film I'd show a skeptic.",
  tender: "A line cook trains his replacement on the day he is fired. Ninety minutes, one kitchen, no fat on it. Sten's most contained film, maybe her best. Wren Soto is a revelation.",
  obsidian: "A scout maps a canyon that should not exist, and Kim lets the landscape turn the screws. A western paced like a horror film. Badly underseen \u2014 please help me correct that.",
  needle: "A tattoo artist inks memories that were never hers. Vail's strangest film, and the one whose ideas gloriously outrun its budget. Flawed, haunting, and absolutely worth arguing about afterward.",
  grail: "The actual Holy Grail turns out to be a roadside coffee mug, and Park plays it dead straight. Americana comedy with a real ache underneath the gag. Genuinely, unexpectedly charming.",
  anvil: "A blacksmith's daughter inherits the forge and the family argument welded inside it. Roan writes inheritance like nobody else working. Fire, family, and a closing scene that fully earns its heat."
};
CATALOG.forEach((f) => {
  f.programmerNote = PROGRAMMER_NOTES[f.id] || null;
});
const PROGRAMMER = { name: "Ada Beresford", role: "Editor-in-chief", initials: "AB" };
const SHELVES = [
  {
    id: "trending",
    title: "Trending now",
    subtitle: "What everyone's watching this week",
    note: { who: "Ada Beresford", body: "Three premiered this week and none of them are losing." },
    filmIds: ["frequency", "verge", "ll", "drift", "kindling", "carrion", "marauder", "longhall"]
  },
  {
    id: "new",
    title: "New releases",
    subtitle: "Premiered in the last 30 days",
    note: { who: "Ada Beresford", body: "Watch the second one first. I'll defend that pick all week." },
    filmIds: ["verge", "kindling", "carrion", "ghosting", "grail", "longhall", "frequency", "cellar"]
  },
  { id: "premiere", title: "NFT premiere \xB7 holders watch first", filmIds: ["ll", "thefence", "frequency", "kindling", "verge", "longhall"] },
  { id: "free", title: "Free with ads", filmIds: ["pelt", "moss", "pearl"] },
  {
    id: "noir",
    title: "Slow-burn noir",
    note: { who: "Ada Beresford", body: "Order matters \u2014 Last Light, then Cellar, then Swallows." },
    filmIds: ["ll", "cellar", "swallows", "verge", "obsidian", "needle"]
  },
  { id: "scifi", title: "Sci-fi this season", filmIds: ["frequency", "drift", "marauder"] },
  {
    id: "horror",
    title: "After-dark horror",
    note: { who: "Ada Beresford", body: "Helm's Carrion is the one. Don't fast-forward the first 40 minutes." },
    filmIds: ["carrion", "pelt", "mire", "cellar"]
  },
  { id: "voss", title: "Films by Elias Voss", subtitle: "From the director of Bluejay", filmIds: ["ll", "bluejay"] },
  { id: "drama", title: "Drama, in close", filmIds: ["swallows", "tender", "anvil", "salt", "longhall", "after"] },
  { id: "continue", title: "Continue watching", filmIds: ["ll", "marauder", "drift", "carrion"] }
];
if (PUBLISHED_FROM_STUDIO.length) {
  const pubIds = PUBLISHED_FROM_STUDIO.map((f) => f.id).filter((id) => CATALOG.some((f) => f.id === id));
  if (pubIds.length) {
    SHELVES.unshift({
      id: "yourpremieres",
      title: "Premiered from your Studio",
      subtitle: "Mastered in Cina Studio \xB7 now live on Watch",
      note: { who: "Cina", body: "You made this, and now the world can watch it. This is the whole point." },
      filmIds: pubIds
    });
    const lead = (shelfId) => {
      const s = SHELVES.find((x) => x.id === shelfId);
      if (s) s.filmIds = [...pubIds, ...s.filmIds.filter((id) => !pubIds.includes(id))];
    };
    lead("new");
    lead("trending");
  }
}
const CREATORS = [
  { id: "voss", name: "Elias Voss", handle: "@voss", films: 4, followers: 184e3, sub: 5.99, color: tkc("cat-3"), bg: tkc("on-amber"), accent: tkc("warn"), theme: "darkroom", tagline: "Things developing in chemicals.", domain: "voss.cina", bio: "Noir. Slow burn. Things developing in chemicals.", since: 2023 },
  { id: "hara", name: "Lin Hara", handle: "@harafilm", films: 6, followers: 312e3, sub: 6.99, color: tkc("cat-6"), bg: tkc("bg"), accent: tkc("cat-1"), theme: "atlas", tagline: "Genre, with grit.", domain: "harafilm.cina", bio: "Sci-fi, crime, cold air. Built on cassette tape and hard math.", since: 2022 },
  { id: "sten", name: "Mira Sten", handle: "@stenframe", films: 5, followers: 96e3, sub: 4.99, color: tkc("cat-5"), bg: tkc("ink"), accent: tkc("line-2"), theme: "kitchen", tagline: "Quiet drama. Long takes. Kitchens.", domain: "sten.cina", bio: "I make small films about people who almost say it.", since: 2024 },
  { id: "ykim", name: "Yara Kim", handle: "@yk", films: 7, followers: 244e3, sub: 5.99, color: tkc("ink-3"), bg: tkc("panel-2"), accent: tkc("warn"), theme: "plains", tagline: "Westerns. Sisters.", domain: "yk.cina", bio: "Wide country, narrow dialogue.", since: 2021 },
  { id: "reng", name: "Tao Reng", handle: "@reng", films: 3, followers: 168e3, sub: 6.99, color: tkc("cat-6"), bg: tkc("bg"), accent: tkc("amber"), theme: "tape", tagline: "Cassette futures. Neon pasts.", domain: "reng.cina", bio: "Synthwave noir. Frame-by-frame VHS aesthetics.", since: 2023 },
  { id: "helm", name: "Boris Helm", handle: "@helm", films: 4, followers: 88e3, sub: 4.99, color: tkc("blood"), bg: tkc("void"), accent: tkc("blood-x"), theme: "basement", tagline: "Patient horror. Wet basements.", domain: "helm.cina", bio: "Don't watch alone.", since: 2024 },
  { id: "park", name: "Anson Park", handle: "@park", films: 5, followers: 76e3, sub: 4.99, color: tkc("cat-6"), bg: tkc("panel-2"), accent: tkc("cat-1"), theme: "atlas", tagline: "Comedy that doesn't feel like comedy.", domain: "park.cina", bio: "Awkward films about awkward people.", since: 2022 },
  { id: "roan", name: "Eve Roan", handle: "@roan", films: 4, followers: 142e3, sub: 5.99, color: tkc("ink-3"), bg: tkc("ink"), accent: tkc("line-2"), theme: "kitchen", tagline: "Grief. Salt. Pacific light.", domain: "roan.cina", bio: "I write the slow ones.", since: 2023 },
  { id: "vail", name: "Soren Vail", handle: "@vail", films: 4, followers: 64e3, sub: 4.99, color: tkc("bad"), bg: tkc("on-amber"), accent: tkc("amber"), theme: "darkroom", tagline: "Heat and consequence.", domain: "vail.cina", bio: "Films about people running out of time.", since: 2024 },
  { id: "aika", name: "June Aikara", handle: "@aika", films: 3, followers: 38e3, sub: 3.99, color: tkc("ink-4"), bg: tkc("panel"), accent: tkc("good"), theme: "plains", tagline: "Patient documentary.", domain: "aika.cina", bio: "Real people. Real time.", since: 2025 }
];
const REACTIONS_FOR_LL = [
  { t: 12.4, user: "rena_ko", color: tkc("bad"), text: "the safelight color grading. unreal.", count: 18 },
  { t: 14.1, user: "park_dr", color: tkc("cat-6"), text: "she heard something", count: 9 },
  { t: 18.6, user: "voss_fan99", color: tkc("cat-3"), text: "FRAME 7 IS COMING", count: 47 },
  { t: 22, user: "miradawn", color: tkc("cat-5"), text: "this is just the prologue isn't it", count: 5 },
  { t: 28.4, user: "ash.404", color: tkc("cat-6"), text: "second watch. still scared.", count: 22 },
  { t: 33.8, user: "june_a", color: tkc("ink-4"), text: "the developer hum is cold", count: 12 },
  { t: 41.2, user: "soren_v", color: tkc("bad"), text: "OH", count: 88 },
  { t: 46.5, user: "tao_reng", color: tkc("cat-6"), text: "she's been looking at it the whole time", count: 31 }
];
const REVIEWS_FOR_LL = [
  { user: "Marlowe Inks", stars: 5, when: "3 days ago", hearts: 412, body: "Voss has made the patience of a darkroom into a metaphor for grief. Episode 5 is the most controlled hour of television this year. The seventh frame doesn't show you what you think it will. It shows you what you've been afraid of for thirteen years.", spoiler: false },
  { user: "june_a", stars: 5, when: "2 days ago", hearts: 188, body: "I watched the first four episodes in a single sitting. I have not stopped thinking about the safelight scene. The way the red light makes everyone look like they have already been buried.", spoiler: false },
  { user: "harafilm", stars: 4, when: "1 day ago", hearts: 96, body: "The slow build is the show. If you bounce off the first 20 minutes, this isn't for you. If you stay, you're staying for the whole season.", spoiler: false },
  { user: "ash.404", stars: 5, when: "12h", hearts: 54, body: "[SPOILER] When she realizes the photo isn't of her sister but of HER, taken from across the room \u2014 I screamed. I am still screaming.", spoiler: true },
  { user: "rena_ko", stars: 4.5, when: "8h", hearts: 31, body: "Cinematography is doing things I didn't think AI generation could do this year. The grain. The patience.", spoiler: false },
  { user: "park_dr", stars: 3.5, when: "6h", hearts: 14, body: "I want to love this more than I do. Episode 4 stalled for me. Cutting back to the brother in episode 5 saved it.", spoiler: false }
];
const NFT_PROJECTS = {
  "voss-ll": {
    id: "voss-ll",
    filmId: "ll",
    title: "LAST LIGHT \xB7 The Seventh Frame",
    creator: "Elias Voss",
    creatorId: "voss",
    color: tkc("cat-3"),
    raised: 184200,
    goal: 25e4,
    backers: 1142,
    daysLeft: 11,
    summary: "Co-finance Last Light Season 1 finale week. Holders get premiere access, revenue share through Year 5, and tiered perks.",
    floorPrice: 0.082,
    // ETH
    floorUSD: 224,
    revShare: 12,
    // %
    royaltyPaid: 38400,
    // total to date
    nextDistribution: "2026-06-01",
    chain: "Base",
    contract: "0x73a2\u2026ee4c",
    tiers: [
      { id: "collector", name: "Collector", count: 1500, sold: 1142, price: 0.082, priceUSD: 224, perks: ["Premiere watch (168hr early)", "Animated frame collectible", "Pulse on the wall (live signal during episode)"], color: tkc("ink-4") },
      { id: "patron", name: "Patron", count: 250, sold: 184, price: 0.34, priceUSD: 920, perks: ["Everything in Collector", "0.04% revenue share through Y5", "Behind-the-scenes vault access"], color: tkc("cat-3") },
      { id: "producer", name: "Producer", count: 25, sold: 18, price: 2.4, priceUSD: 6500, perks: ["Everything in Patron", "0.4% revenue share through Y5", "Production credit on the closing card", "Set visit to Episode 8"], color: tkc("amber") }
    ],
    timeline: [
      { d: "2026-04-10", label: "Mint open \xB7 Collector tier", state: "done" },
      { d: "2026-04-22", label: "Episode 1 live \xB7 holders 168h early", state: "done" },
      { d: "2026-05-08", label: "Episode 5 \u2014 half-season distribution paid", state: "done" },
      { d: "2026-05-29", label: "Episode 8 finale \xB7 closing card credits Producers", state: "live" },
      { d: "2026-06-01", label: "Q2 revenue distribution", state: "next" },
      { d: "2026-09-01", label: "Q3 distribution + Season 2 vote", state: "future" }
    ],
    market: [
      { kind: "ask", tier: "collector", price: 0.085, qty: 1, seller: "0xC1\u2026a2" },
      { kind: "ask", tier: "collector", price: 0.088, qty: 2, seller: "0x4f\u2026b8" },
      { kind: "ask", tier: "collector", price: 0.091, qty: 1, seller: "0x91\u20267d" },
      { kind: "ask", tier: "patron", price: 0.42, qty: 1, seller: "0xab\u20263c" },
      { kind: "ask", tier: "patron", price: 0.46, qty: 1, seller: "0xee\u202614" },
      { kind: "bid", tier: "collector", price: 0.078, qty: 3, buyer: "0x8a\u2026fe" },
      { kind: "bid", tier: "collector", price: 0.075, qty: 2, buyer: "0x33\u20262b" },
      { kind: "bid", tier: "patron", price: 0.31, qty: 1, buyer: "0x7c\u20269a" }
    ],
    priceHistory: [0.05, 0.052, 0.058, 0.061, 0.064, 0.068, 0.071, 0.073, 0.076, 0.078, 0.079, 0.081, 0.082, 0.082]
  },
  "ykim-tf": {
    id: "ykim-tf",
    filmId: "thefence",
    title: "THE FENCE \xB7 Producer Credit",
    creator: "Yara Kim",
    creatorId: "ykim",
    color: tkc("cat-3"),
    raised: 92e3,
    goal: 12e4,
    backers: 312,
    daysLeft: 4,
    summary: "Co-finance the festival run.",
    floorPrice: 0.06,
    floorUSD: 162,
    revShare: 8,
    royaltyPaid: 4200,
    nextDistribution: "2026-07-01",
    chain: "Base",
    contract: "0x91b\u202622cd",
    tiers: [
      { id: "collector", name: "Collector", count: 800, sold: 312, price: 0.06, priceUSD: 162, perks: ["96hr premiere window", "Animated end-frame"], color: tkc("ink-4") },
      { id: "patron", name: "Patron", count: 100, sold: 41, price: 0.28, priceUSD: 760, perks: ["Q&A access", "0.05% rev share Y5"], color: tkc("cat-3") },
      { id: "producer", name: "Producer", count: 12, sold: 4, price: 1.8, priceUSD: 4800, perks: ["Production credit", "0.5% rev share Y5"], color: tkc("amber") }
    ],
    timeline: [
      { d: "2026-04-01", label: "Mint open", state: "done" },
      { d: "2026-04-15", label: "First festival screening", state: "done" },
      { d: "2026-05-20", label: "Streaming release \xB7 holders early", state: "next" },
      { d: "2026-07-01", label: "Q3 distribution", state: "future" }
    ],
    market: [
      { kind: "ask", tier: "collector", price: 0.062, qty: 2, seller: "0x..." },
      { kind: "bid", tier: "collector", price: 0.058, qty: 1, buyer: "0x..." }
    ],
    priceHistory: [0.04, 0.045, 0.05, 0.055, 0.058, 0.06, 0.062, 0.06, 0.06]
  },
  "reng-fr": {
    id: "reng-fr",
    filmId: "frequency",
    title: "FREQUENCY 88.6",
    creator: "Tao Reng",
    creatorId: "reng",
    color: tkc("cat-6"),
    raised: 142e3,
    goal: 2e5,
    backers: 781,
    daysLeft: 18,
    summary: "Pirate radio sci-fi \xB7 co-finance full release.",
    floorPrice: 0.075,
    floorUSD: 204,
    revShare: 10,
    royaltyPaid: 18900,
    nextDistribution: "2026-06-15",
    chain: "Base",
    contract: "0x4f1\u2026aa9e",
    tiers: [
      { id: "collector", name: "Collector", count: 1200, sold: 781, price: 0.075, priceUSD: 204, perks: ["48hr premiere", "Cassette-art collectible"], color: tkc("ink-4") },
      { id: "patron", name: "Patron", count: 200, sold: 96, price: 0.32, priceUSD: 870, perks: ["Director soundboard access", "0.06% rev Y5"], color: tkc("cat-3") },
      { id: "producer", name: "Producer", count: 18, sold: 11, price: 2.1, priceUSD: 5700, perks: ["Producer credit", "0.6% rev Y5"], color: tkc("amber") }
    ],
    timeline: [
      { d: "2026-03-22", label: "Mint open", state: "done" },
      { d: "2026-04-30", label: "Premiere window", state: "done" },
      { d: "2026-06-15", label: "Q2 distribution", state: "next" }
    ],
    market: [
      { kind: "ask", tier: "collector", price: 0.078, qty: 4, seller: "0x..." },
      { kind: "ask", tier: "patron", price: 0.34, qty: 2, seller: "0x..." },
      { kind: "bid", tier: "collector", price: 0.072, qty: 5, buyer: "0x..." }
    ],
    priceHistory: [0.05, 0.058, 0.062, 0.066, 0.07, 0.073, 0.075, 0.077, 0.075]
  }
};
const USER = {
  handle: "you.eth",
  ens: "you.cina.eth",
  address: "0xA1c4\u2026f3D2",
  walletUSD: 28413,
  walletETH: 10.45,
  totalEarned: 1842,
  // royalties to date
  pendingClaim: 184.2,
  joined: "2025-09",
  tier: "Patron",
  holdings: [
    { projectId: "voss-ll", tier: "patron", qty: 1, costBasis: 0.32, currentPrice: 0.42, earned: 268.4 },
    { projectId: "voss-ll", tier: "collector", qty: 3, costBasis: 0.075, currentPrice: 0.082, earned: 96 },
    { projectId: "reng-fr", tier: "patron", qty: 1, costBasis: 0.28, currentPrice: 0.32, earned: 142 },
    { projectId: "ykim-tf", tier: "collector", qty: 2, costBasis: 0.06, currentPrice: 0.062, earned: 28 },
    { projectId: "voss-ll", tier: "producer", qty: 0, costBasis: 0, currentPrice: 2.4, earned: 0, onWatchlist: true }
  ],
  txHistory: [
    { d: "2026-05-08", kind: "royalty", project: "voss-ll", desc: "Episode 5 distribution", amount: 84.2, asset: "USDC" },
    { d: "2026-05-02", kind: "buy", project: "voss-ll", desc: "Patron tier \xB7 1\xD7", amount: -920, asset: "USDC" },
    { d: "2026-04-22", kind: "royalty", project: "voss-ll", desc: "Episode 1 distribution", amount: 44, asset: "USDC" },
    { d: "2026-04-15", kind: "royalty", project: "ykim-tf", desc: "Festival distribution", amount: 28, asset: "USDC" },
    { d: "2026-04-08", kind: "buy", project: "reng-fr", desc: "Patron tier \xB7 1\xD7", amount: -870, asset: "USDC" },
    { d: "2026-03-30", kind: "buy", project: "voss-ll", desc: "Collector \xB7 3\xD7", amount: -612, asset: "USDC" },
    { d: "2026-03-22", kind: "royalty", project: "reng-fr", desc: "Mint allocation", amount: 120, asset: "USDC" },
    { d: "2026-03-15", kind: "buy", project: "ykim-tf", desc: "Collector \xB7 2\xD7", amount: -324, asset: "USDC" },
    { d: "2026-02-12", kind: "transfer", project: null, desc: "Inbound from Coinbase", amount: 5e3, asset: "USDC" }
  ],
  watchlist: ["ll", "marauder", "longhall", "frequency", "kindling"],
  followingCreators: ["voss", "ykim", "reng"],
  alerts: [
    { d: "now", kind: "drop", text: "Last Light Episode 6 drops Friday at 7pm", filmId: "ll", urgent: true },
    { d: "1h", kind: "royalty", text: "Royalty: $84.20 from LAST LIGHT \xB7 Ep 5", projectId: "voss-ll" },
    { d: "3h", kind: "premiere", text: "Verge premiere window opens (24h holder early)", filmId: "verge" },
    { d: "yest", kind: "follow", text: 'Yara Kim posted: "The Fence is on Letterbox top 50"', creatorId: "ykim" },
    { d: "2d", kind: "drop", text: "Marauder S2 E4 drops Wednesday", filmId: "marauder" },
    { d: "5d", kind: "drop", text: "Long Hall pilot drops May 15", filmId: "longhall" }
  ]
};
(function _hydrateChainUser() {
  try {
    const saved = JSON.parse(localStorage.getItem("cina:chain:user-ledger") || "null");
    if (saved && typeof saved === "object") {
      if (typeof saved.walletUSD === "number") USER.walletUSD = saved.walletUSD;
      if (typeof saved.walletETH === "number") USER.walletETH = saved.walletETH;
      if (typeof saved.totalEarned === "number") USER.totalEarned = saved.totalEarned;
      if (typeof saved.pendingClaim === "number") USER.pendingClaim = saved.pendingClaim;
      if (Array.isArray(saved.holdings)) USER.holdings = saved.holdings;
      if (Array.isArray(saved.txHistory)) USER.txHistory = saved.txHistory;
    }
  } catch (_) {
  }
})();
function _nftRand(filmId) {
  return (salt) => {
    let h = 2166136261 ^ salt * 2654435761;
    const s = String(filmId);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= h >>> 15;
    h = Math.imul(h, 2246822507);
    h ^= h >>> 13;
    return (h >>> 0) % 1e5 / 1e5;
  };
}
CATALOG.forEach((f) => {
  if (!f.nft || NFT_PROJECTS[f.nft]) return;
  const isHighProfile = f.views > 2e5 || f.kind === "series";
  const goal = isHighProfile ? 18e4 : 9e4;
  const rnd = _nftRand(f.id);
  const collectorPrice = +(0.04 + rnd(1) * 0.04).toFixed(3);
  const collectorUSD = Math.round(collectorPrice * 2700);
  const patronPrice = +(collectorPrice * 4.2).toFixed(2);
  const producerPrice = +(collectorPrice * 28).toFixed(2);
  const collectorCap = isHighProfile ? 1200 : 600;
  const collectorSold = Math.round(collectorCap * (0.4 + rnd(2) * 0.5));
  const patronCap = Math.round(collectorCap * 0.18);
  const producerCap = Math.max(6, Math.round(collectorCap * 0.018));
  const patronSold = Math.min(patronCap, Math.round(collectorSold * 0.16));
  const producerSold = Math.min(producerCap, Math.max(1, Math.round(collectorSold * 0.012)));
  const patronUSD = Math.round(patronPrice * 2700);
  const producerUSD = Math.round(producerPrice * 2700);
  const raised = collectorSold * collectorUSD + patronSold * patronUSD + producerSold * producerUSD;
  NFT_PROJECTS[f.nft] = {
    id: f.nft,
    filmId: f.id,
    title: f.title.toUpperCase(),
    creator: f.creator,
    creatorId: f.creatorId,
    color: f.color || tkc("cat-3"),
    raised,
    goal,
    _generated: true,
    backers: collectorSold + patronSold + producerSold,
    daysLeft: 4 + Math.floor(rnd(3) * 22),
    summary: `Co-finance ${f.title}. Holders get premiere access, revenue share through Y5, tiered perks.`,
    floorPrice: collectorPrice,
    floorUSD: collectorUSD,
    revShare: isHighProfile ? 10 : 8,
    royaltyPaid: Math.round(raised * 0.08),
    nextDistribution: "2026-07-01",
    chain: "Base",
    contract: "0x" + f.nft.replace(/[^0-9a-f]/gi, "").padEnd(4, "a") + "\u2026" + (1e3 + Math.floor(rnd(4) * 8999)).toString(16),
    tiers: [
      { id: "collector", name: "Collector", count: collectorCap, sold: collectorSold, price: collectorPrice, priceUSD: collectorUSD, perks: [`${isHighProfile ? 96 : 48}hr premiere window`, "Animated frame collectible", "Live signal during episode"], color: tkc("ink-4") },
      { id: "patron", name: "Patron", count: patronCap, sold: patronSold, price: patronPrice, priceUSD: patronUSD, perks: ["Everything in Collector", "0.05% revenue share Y5", "BTS vault access"], color: tkc("cat-3") },
      { id: "producer", name: "Producer", count: producerCap, sold: producerSold, price: producerPrice, priceUSD: producerUSD, perks: ["Everything in Patron", "0.5% revenue share Y5", "Production credit", "Set visit"], color: tkc("amber") }
    ],
    timeline: [
      { d: "2026-04-01", label: "Mint open", state: "done" },
      { d: "2026-04-22", label: "First release \xB7 holders early", state: "done" },
      { d: "2026-05-15", label: "Public release", state: "live" },
      { d: "2026-07-01", label: "Q3 distribution", state: "next" },
      { d: "2026-10-01", label: "Q4 distribution + sequel vote", state: "future" }
    ],
    market: [
      { kind: "ask", tier: "collector", price: +(collectorPrice * 1.04).toFixed(3), qty: 2, seller: "0xC1\u2026a2" },
      { kind: "ask", tier: "collector", price: +(collectorPrice * 1.08).toFixed(3), qty: 1, seller: "0x4f\u2026b8" },
      { kind: "ask", tier: "patron", price: +(patronPrice * 1.05).toFixed(2), qty: 1, seller: "0xab\u20263c" },
      { kind: "bid", tier: "collector", price: +(collectorPrice * 0.96).toFixed(3), qty: 3, buyer: "0x8a\u2026fe" },
      { kind: "bid", tier: "collector", price: +(collectorPrice * 0.92).toFixed(3), qty: 2, buyer: "0x33\u20262b" },
      { kind: "bid", tier: "patron", price: +(patronPrice * 0.94).toFixed(2), qty: 1, buyer: "0x7c\u20269a" }
    ],
    // Seeded, so a token's 12-month chart keeps its shape between visits
    // instead of redrawing a different history every load.
    priceHistory: Array.from({ length: 12 }, (_, i) => +(collectorPrice * (0.7 + i * 0.025 + (rnd(20 + i) - 0.5) * 0.02)).toFixed(3)),
    autoGenerated: true
  };
});
Object.values(NFT_PROJECTS).forEach((p) => {
  const film = CATALOG.find((f) => f.id === p.filmId) || {};
  const views = film.views || 8e4;
  const isHigh = views > 2e5 || film.kind === "series";
  const total = p.royaltyPaid || Math.round((p.raised || 1e5) * 0.18);
  const adPct = isHigh ? 0.42 : 0.36;
  const subPct = isHigh ? 0.31 : 0.28;
  const salePct = isHigh ? 0.17 : 0.22;
  const licPct = 1 - adPct - subPct - salePct;
  p.revenue = {
    total,
    sources: {
      ad: { name: "Ad revenue", color: tkc("amber"), paid: Math.round(total * adPct), monthly: Math.round(total * adPct / 8), description: "Pre-roll + mid-roll + sponsor reads" },
      sub: { name: "Subscriptions", color: tkc("cat-5"), paid: Math.round(total * subPct), monthly: Math.round(total * subPct / 8), description: "Channel + studio sub share" },
      sale: { name: "Secondary", color: tkc("cat-2"), paid: Math.round(total * salePct), monthly: Math.round(total * salePct / 8), description: "5% royalty on resale" },
      lic: { name: "Licensing", color: tkc("cat-3"), paid: Math.round(total * licPct), monthly: Math.round(total * licPct / 8), description: "Theatrical + distribution deals" }
    },
    monthlyHistory: Array.from({ length: 8 }, (_, i) => {
      const base = total / 12;
      const trend = 1 + i / 8 * 0.4;
      const noise = 0.85 + Math.random() * 0.3;
      return Math.round(base * trend * noise);
    })
  };
  const annual = Math.round(total * 1.6);
  p.projection = {
    low: Math.round(annual * 0.65),
    expected: annual,
    high: Math.round(annual * 1.45),
    yieldPct: (annual / (p.raised || 1e5) * 100).toFixed(1)
  };
});
const DIRECTOR_TRACK = {
  voss: {
    films: [
      { id: "ll", title: "Last Light", year: 2026, raised: 184200, returned: 38400, views: 412e3, ongoing: true, rating: 4.7 },
      { id: "static", title: "Static Country", year: 2024, raised: 6e4, returned: 71200, views: 184e3, ongoing: false, rating: 4.4 },
      { id: "lowtide", title: "Low Tide", year: 2023, raised: 42e3, returned: 38800, views: 96e3, ongoing: false, rating: 4.1 }
    ],
    hitRate: 0.83,
    avgROI: 1.34,
    totalReturned: 148400
  },
  ykim: {
    films: [
      { id: "thefence", title: "The Fence", year: 2026, raised: 92e3, returned: 4200, views: 28400, ongoing: true, rating: 4.5 },
      { id: "deltawk", title: "Delta Walk", year: 2024, raised: 38e3, returned: 41200, views: 72e3, ongoing: false, rating: 4.2 }
    ],
    hitRate: 0.5,
    avgROI: 1.08,
    totalReturned: 45400
  },
  reng: {
    films: [
      { id: "frequency", title: "Frequency 88.6", year: 2026, raised: 142e3, returned: 18900, views: 218e3, ongoing: true, rating: 4.6 },
      { id: "shortwave", title: "Shortwave", year: 2025, raised: 8e4, returned: 93e3, views: 162e3, ongoing: false, rating: 4.3 },
      { id: "hammr", title: "Hammr", year: 2023, raised: 5e4, returned: 22e3, views: 41e3, ongoing: false, rating: 3.7 }
    ],
    hitRate: 0.67,
    avgROI: 1.21,
    totalReturned: 133900
  }
};
USER.claimable = {
  ad: 124.8,
  sub: 68.4,
  sale: 32.1,
  lic: 18.5,
  get total() {
    return this.ad + this.sub + this.sale + this.lic;
  }
};
USER.holdings.forEach((h) => {
  const earned = h.earned || 0;
  h.earnedBy = {
    ad: +(earned * 0.42).toFixed(2),
    sub: +(earned * 0.3).toFixed(2),
    sale: +(earned * 0.18).toFixed(2),
    lic: +(earned * 0.1).toFixed(2)
  };
});
function _reconcileFunding(p) {
  const tiers = p.tiers || [];
  if (!tiers.length || !p.raised) return;
  const priced = tiers.map((t, i) => ({ t, i, usd: t.priceUSD || 0, cap: t.count != null ? t.count : t.supply || 0 })).filter((x) => x.usd > 0).sort((a, b) => b.usd - a.usd);
  if (!priced.length) return;
  let left = p.raised;
  priced.forEach((x, n) => {
    const isLast = n === priced.length - 1;
    if (isLast) {
      x.t.sold = Math.max(0, Math.min(x.cap, Math.round(left / x.usd)));
      left -= x.t.sold * x.usd;
      return;
    }
    const share = n === 0 ? 0.28 : 0.3;
    const want = Math.floor(p.raised * share / x.usd);
    x.t.sold = Math.max(1, Math.min(Math.floor(x.cap * 0.85), want));
    left -= x.t.sold * x.usd;
  });
  const cheapest = priced[priced.length - 1];
  if (left !== 0) {
    cheapest.t.sold = Math.max(0, Math.min(cheapest.cap, cheapest.t.sold + Math.round(left / cheapest.usd)));
  }
  p.raised = tiers.reduce((a, t) => a + (t.sold || 0) * (t.priceUSD || 0), 0);
  p.backers = tiers.reduce((a, t) => a + (t.sold || 0), 0);
  if (p.royaltyPaid == null) p.royaltyPaid = Math.round(p.raised * 0.08);
  if (p._generated) {
    const target = 0.34 + _nftRand(p.filmId || p.id)(7) * 0.58;
    const rawGoal = p.raised / target;
    const step = rawGoal > 4e5 ? 5e4 : rawGoal > 15e4 ? 25e3 : 1e4;
    p.goal = Math.max(p.raised > 0 ? step : 0, Math.round(rawGoal / step) * step);
    delete p._generated;
  }
}
Object.values(NFT_PROJECTS).forEach(_reconcileFunding);
function getFilm(id) {
  return CATALOG.find((f) => f.id === id);
}
function getCreator(id) {
  return CREATORS.find((c) => c.id === id);
}
Object.assign(window, { CATALOG, SHELVES, CREATORS, REVIEWS_FOR_LL, NFT_PROJECTS, USER, getFilm, getCreator, PROGRAMMER, PROGRAMMER_NOTES });

  try { if (typeof _palette !== "undefined") window["_palette"] = _palette; } catch (_) {}
  try { if (typeof CATALOG !== "undefined") window["CATALOG"] = CATALOG; } catch (_) {}
  try { if (typeof _pubNorm !== "undefined") window["_pubNorm"] = _pubNorm; } catch (_) {}
  try { if (typeof PUBLISHED_FROM_STUDIO !== "undefined") window["PUBLISHED_FROM_STUDIO"] = PUBLISHED_FROM_STUDIO; } catch (_) {}
  try { if (typeof PROGRAMMER_NOTES !== "undefined") window["PROGRAMMER_NOTES"] = PROGRAMMER_NOTES; } catch (_) {}
  try { if (typeof PROGRAMMER !== "undefined") window["PROGRAMMER"] = PROGRAMMER; } catch (_) {}
  try { if (typeof SHELVES !== "undefined") window["SHELVES"] = SHELVES; } catch (_) {}
  try { if (typeof CREATORS !== "undefined") window["CREATORS"] = CREATORS; } catch (_) {}
  try { if (typeof REACTIONS_FOR_LL !== "undefined") window["REACTIONS_FOR_LL"] = REACTIONS_FOR_LL; } catch (_) {}
  try { if (typeof REVIEWS_FOR_LL !== "undefined") window["REVIEWS_FOR_LL"] = REVIEWS_FOR_LL; } catch (_) {}
  try { if (typeof NFT_PROJECTS !== "undefined") window["NFT_PROJECTS"] = NFT_PROJECTS; } catch (_) {}
  try { if (typeof USER !== "undefined") window["USER"] = USER; } catch (_) {}
  try { if (typeof _nftRand !== "undefined") window["_nftRand"] = _nftRand; } catch (_) {}
  try { if (typeof DIRECTOR_TRACK !== "undefined") window["DIRECTOR_TRACK"] = DIRECTOR_TRACK; } catch (_) {}
  try { if (typeof _reconcileFunding !== "undefined") window["_reconcileFunding"] = _reconcileFunding; } catch (_) {}
  try { if (typeof getFilm !== "undefined") window["getFilm"] = getFilm; } catch (_) {}
  try { if (typeof getCreator !== "undefined") window["getCreator"] = getCreator; } catch (_) {}
})();

// ── MODULE: pitch-data.jsx ──
;(function() {
const ADVERTISER = {
  brand: "Patagonia",
  contact: "molly.k@patagonia.com",
  budget: 84e3,
  // remaining budget cents-equiv (USD)
  spent: 116e3,
  // lifetime spent
  walletUSD: 84e3,
  trustScore: 92,
  // brand-safety trust
  industry: "Apparel \xB7 Outdoor",
  color: tkc("line-3"),
  accent: tkc("good"),
  logo: "P"
};
const AD_FORMATS = [
  { id: "preroll-15", name: "15s pre-roll", duration: 15, cpm: 28, desc: "Before play.", fits: ["Awareness", "Reach"] },
  { id: "preroll-30", name: "30s pre-roll", duration: 30, cpm: 42, desc: "Skippable after 5s.", fits: ["Brand story", "Launch"] },
  { id: "midroll", name: "60s mid-roll", duration: 60, cpm: 64, desc: "AI-placed at scene breaks.", fits: ["Premium", "High intent"] },
  { id: "sponsor", name: "90s sponsor read", duration: 90, cpm: 95, desc: "In creator's voice. Opt-in.", fits: ["Trust", "Endorsement"] },
  { id: "endcard", name: "Endcard + offer", duration: 8, cpm: 16, desc: "After credits. House inv.", fits: ["Performance", "DTC"] }
];
const CAMPAIGNS = [
  {
    id: "c-001",
    name: "Snowpack Anorak \u2014 Spring",
    product: "Snowpack Anorak",
    state: "live",
    format: "midroll",
    creative: "draft-2",
    budget: 24e3,
    spent: 15840,
    flightStart: "2026-04-22",
    flightEnd: "2026-05-22",
    targets: { genres: ["Drama", "Doc", "Adventure"], rating: ["G", "PG", "PG-13"], creators: ["voss", "aika", "ykim", "sten"], audiences: ["outdoor", "slow-burn"] },
    metrics: { impressions: 184300, completion: 0.87, ctr: 0.024, cpv: 0.018 },
    payouts: { creators: 7920, holders: 3960, cinaCut: 3960 },
    placedOn: ["ll", "swallows", "moss", "thefence", "longhall"]
  },
  {
    id: "c-002",
    name: "Worn Wear \u2014 repair before replace",
    product: "Worn Wear",
    state: "scheduled",
    format: "sponsor",
    creative: "draft-1",
    budget: 36e3,
    spent: 0,
    flightStart: "2026-05-15",
    flightEnd: "2026-06-30",
    targets: { genres: ["Doc", "Drama"], rating: ["G", "PG"], creators: ["aika", "sten", "roan"], audiences: ["sustainability", "craft"] },
    metrics: { impressions: 0, completion: 0, ctr: 0, cpv: 0 },
    payouts: { creators: 0, holders: 0, cinaCut: 0 },
    placedOn: []
  },
  {
    id: "c-003",
    name: "Provisions Dry Bag \u2014 Endcard",
    product: "Provisions Dry Bag",
    state: "ended",
    format: "endcard",
    creative: "draft-1",
    budget: 8e3,
    spent: 8e3,
    flightStart: "2026-03-12",
    flightEnd: "2026-04-12",
    targets: { genres: ["Adventure", "Doc"], rating: ["G", "PG", "PG-13"], creators: ["aika", "ykim"], audiences: ["outdoor"] },
    metrics: { impressions: 92400, completion: 0.94, ctr: 0.041, cpv: 0.011 },
    payouts: { creators: 4400, holders: 2200, cinaCut: 2200 },
    placedOn: ["moss", "obsidian", "pearl"]
  },
  {
    id: "c-004",
    name: "Recycled Down Jacket \u2014 Pre-roll test",
    product: "Recycled Down",
    state: "draft",
    format: "preroll-30",
    creative: null,
    budget: 12e3,
    spent: 0,
    flightStart: null,
    flightEnd: null,
    targets: { genres: [], rating: [], creators: [], audiences: [] },
    metrics: { impressions: 0, completion: 0, ctr: 0, cpv: 0 },
    payouts: { creators: 0, holders: 0, cinaCut: 0 },
    placedOn: []
  }
];
const COMMERCIAL_DRAFTS = [
  {
    id: "draft-1",
    label: "The slow option",
    style: "Patient, observational. Long take of a single object.",
    duration: 60,
    palette: [tkc("line-3"), tkc("good"), tkc("panel-2"), tkc("cat-4")],
    storyboard: [
      { t: 0, frame: "moss", caption: "Wide. Worn anorak hung on a peg. Steam rises off it. Rain outside." },
      { t: 12, frame: "darkroom-est", caption: "Match cut to a sewing machine. Tight on hands repairing the same shoulder." },
      { t: 28, frame: "the-photo", caption: "Pull out: same person, twenty years older, still wearing it." },
      { t: 46, frame: "voss-eye", caption: "Endcard: WORN WEAR. Repair before replace." }
    ],
    voPrompt: "Soft baritone. Two sentences. The first is a statement. The second is a question.",
    safety: { brand: 0.96, ip: 0.98, model: "Cina Brand Verify v3" }
  },
  {
    id: "draft-2",
    label: "The mountain option",
    style: "Cold landscape. Wide. Synth pad swells.",
    duration: 60,
    palette: [tkc("line-3"), tkc("cat-1"), tkc("panel-2"), tkc("cat-4")],
    storyboard: [
      { t: 0, frame: "darkroom-wide", caption: "Wide. Two figures cresting a ridge in storm. Backs to camera." },
      { t: 14, frame: "phone", caption: "Tight on the closer figure's anorak \u2014 battered, taped at one elbow." },
      { t: 32, frame: "voss-enter", caption: "Lens flare. They drop down out of frame, into white." },
      { t: 50, frame: "developer", caption: "Card: SNOWPACK ANORAK. Made for the next thirty years." }
    ],
    voPrompt: 'No VO. Wind. A single line of dialogue: "Still good for one more."',
    safety: { brand: 0.94, ip: 0.99, model: "Cina Brand Verify v3" }
  },
  {
    id: "draft-3",
    label: "The unbranded option",
    style: "Documentary. Real customer. Rough handheld.",
    duration: 60,
    palette: [tkc("ink-4"), tkc("cat-4"), tkc("panel-2"), tkc("line-2")],
    storyboard: [
      { t: 0, frame: "darkroom-est", caption: `A woman, ~70, in her kitchen. "This was my husband's."` },
      { t: 18, frame: "voss-eye", caption: "Cut to her mending a sleeve. Long shot, no music." },
      { t: 38, frame: "the-photo", caption: "Photograph: her husband, 1986, wearing the same anorak." },
      { t: 52, frame: "moss", caption: "Card: WORN WEAR. (no logo, no website)" }
    ],
    voPrompt: "She speaks. We don't.",
    safety: { brand: 0.92, ip: 0.97, model: "Cina Brand Verify v3" }
  }
];
const AUDIENCES = [
  { id: "outdoor", label: "Outdoor / adventure", size: 42e5, fit: 0.94 },
  { id: "slow-burn", label: "Slow-burn drama viewers", size: 18e5, fit: 0.71 },
  { id: "craft", label: "Craft & maker", size: 92e4, fit: 0.88 },
  { id: "sustainability", label: "Sustainability-leaning", size: 27e5, fit: 0.91 },
  { id: "noir", label: "Noir / mystery", size: 14e5, fit: 0.32 },
  { id: "family", label: "Family-friendly viewers", size: 31e5, fit: 0.62 },
  { id: "scifi", label: "Sci-fi & speculative", size: 22e5, fit: 0.41 },
  { id: "horror", label: "Horror / after-dark", size: 98e4, fit: 0.08 }
];
const PAYOUT_DEFAULTS = {
  cinaCut: 0.25,
  creatorCut_unfunded: 0.75,
  creatorCut_funded: 0.5,
  holderCut_funded: 0.25
};
const TIER_WEIGHTS = { producer: 100, patron: 12, collector: 1 };
const ACTIVE_VOTES = {
  "voss-ll": [
    {
      id: "v-ll-001",
      title: "Approve Patagonia Worn Wear sponsor read",
      summary: "Run a 90s sponsor read in Voss's voice as the mid-break for Episodes 6 + 7. $34,200 to creator pool, $17,100 to holders.",
      kind: "ad-approval",
      created: "2026-05-09",
      closes: "2026-05-13T19:00:00",
      yesPower: 4280,
      noPower: 980,
      abstainPower: 220,
      yourVote: null,
      thread: 28,
      proposer: "Patagonia \xB7 via Cina Pitch",
      payoutPreview: 17100
    },
    {
      id: "v-ll-002",
      title: "Greenlight Season 2 \u2014 8 episodes",
      summary: "Director proposes a Season 2 mint at the same revenue split. New ceiling: $360,000 raise.",
      kind: "greenlight",
      created: "2026-05-04",
      closes: "2026-05-20T19:00:00",
      yesPower: 5120,
      noPower: 410,
      abstainPower: 80,
      yourVote: "yes",
      thread: 142,
      proposer: "Elias Voss",
      payoutPreview: null
    },
    {
      id: "v-ll-003",
      title: "Reject Liquid Death mid-roll",
      summary: "Liquid Death proposed a 30s mid-roll. Tone mismatch flagged by 14 holders. Recommend reject.",
      kind: "ad-rejection",
      created: "2026-05-07",
      closes: "2026-05-11T12:00:00",
      yesPower: 3640,
      noPower: 2180,
      abstainPower: 320,
      yourVote: null,
      thread: 64,
      proposer: "Holder coalition \xB7 @ash.404",
      payoutPreview: -8400
    }
  ],
  "reng-fr": [
    {
      id: "v-fr-001",
      title: "Approve Audible 60s mid-roll",
      summary: "Audible bidding on the mid-roll slot. Strong audience fit (sci-fi readers, 0.78).",
      kind: "ad-approval",
      created: "2026-05-08",
      closes: "2026-05-14T12:00:00",
      yesPower: 1840,
      noPower: 220,
      abstainPower: 60,
      yourVote: null,
      thread: 18,
      proposer: "Audible \xB7 via Cina Pitch",
      payoutPreview: 4200
    }
  ],
  "ykim-tf": [
    {
      id: "v-tf-001",
      title: "Festival cut vs streaming cut",
      summary: "Director asks: keep the 4-min coda for the streaming release, or trim to match the festival cut?",
      kind: "creative",
      created: "2026-05-06",
      closes: "2026-05-18T12:00:00",
      yesPower: 380,
      noPower: 240,
      abstainPower: 90,
      yourVote: null,
      thread: 52,
      proposer: "Yara Kim",
      payoutPreview: null
    }
  ]
};
const HOLDER_CHAT = {
  "voss-ll": [
    { user: "Elias Voss", role: "creator", color: tkc("cat-3"), text: "Sending the Episode 6 cut to the holder vault tonight. Let me know what lands.", t: "2026-05-09T22:14", avatar: "EV" },
    { user: "ash.404", role: "producer", color: tkc("amber"), text: "The Patagonia read is tonally right but I'd cut 8 seconds. Let it breathe at the front, not the tail.", t: "2026-05-10T08:02", avatar: "A4" },
    { user: "rena_ko", role: "patron", color: tkc("cat-3"), text: "+1. Front-load the brand mention, leave the back half to the creator.", t: "2026-05-10T08:14", avatar: "RK" },
    { user: "june_a", role: "patron", color: tkc("cat-3"), text: "The Liquid Death pitch felt off. We don't want sugar drinks against this tone.", t: "2026-05-10T09:01", avatar: "JA" },
    { user: "park_dr", role: "collector", color: tkc("ink-4"), text: "Voted no on Liquid Death. Yes on Worn Wear.", t: "2026-05-10T09:32", avatar: "PD" },
    { user: "Elias Voss", role: "creator", color: tkc("cat-3"), text: "I'd record the Patagonia read myself rather than have Cina synthesize. Keeps the trust chain clean.", t: "2026-05-10T11:08", avatar: "EV" },
    { user: "Cina \xB7 agent", role: "agent", color: tkc("amber"), text: "Synthesizing Voss's voice with consent flag set to off. Read will route to Voss directly. Estimated holder distribution: $17,100 if approved.", t: "2026-05-10T11:09", avatar: "C" },
    { user: "you.eth", role: "patron", color: tkc("cat-3"), text: "Sounds right. I'll vote yes once the cut comes back.", t: "2026-05-10T13:40", avatar: "Y" },
    { user: "soren_v", role: "collector", color: tkc("ink-4"), text: "Are we splitting the holder pool by tier weight or by token? Last time it felt like producers got disproportionate share.", t: "2026-05-10T14:22", avatar: "SV" },
    { user: "Cina \xB7 agent", role: "agent", color: tkc("amber"), text: "Tier weights: Producer 100\xB7, Patron 12\xB7, Collector 1\xB7. By design \u2014 proportional to capital risked. Adjustable by holder vote (60% threshold).", t: "2026-05-10T14:24", avatar: "C" }
  ],
  "reng-fr": [
    { user: "Tao Reng", role: "creator", color: tkc("cat-6"), text: "Audible read would be the first sponsor I've taken. Tempted but want to hear the holder room.", t: "2026-05-09T19:00", avatar: "TR" },
    { user: "kyle.b", role: "patron", color: tkc("cat-3"), text: "If they let you write it, yes. If it's a script handed to you, no.", t: "2026-05-09T19:14", avatar: "KB" },
    { user: "void_91", role: "collector", color: tkc("ink-4"), text: "Sci-fi readers are exactly Audible's market. Take it.", t: "2026-05-09T19:50", avatar: "V9" }
  ],
  "ykim-tf": [
    { user: "Yara Kim", role: "creator", color: tkc("ink-3"), text: "Festival cut won, but I keep coming back to the coda. Asking the room.", t: "2026-05-08T11:00", avatar: "YK" }
  ]
};
const CAMPAIGN_STORE_KEY = "cina:pitch:campaigns:v1";
const CampaignStore = (() => {
  let userCampaigns = [];
  try {
    const raw = localStorage.getItem(CAMPAIGN_STORE_KEY);
    if (raw) userCampaigns = JSON.parse(raw) || [];
  } catch {
  }
  const subs = /* @__PURE__ */ new Set();
  const persist = () => {
    try {
      localStorage.setItem(CAMPAIGN_STORE_KEY, JSON.stringify(userCampaigns));
    } catch {
    }
  };
  const emit = () => subs.forEach((fn) => {
    try {
      fn();
    } catch {
    }
  });
  return {
    all() {
      return [...userCampaigns, ...CAMPAIGNS];
    },
    get(id) {
      return this.all().find((c) => c.id === id) || null;
    },
    isUser(id) {
      return userCampaigns.some((c) => c.id === id);
    },
    add(c) {
      userCampaigns = [c, ...userCampaigns];
      persist();
      emit();
      return c;
    },
    update(id, patch) {
      userCampaigns = userCampaigns.map((c) => c.id === id ? { ...c, ...patch } : c);
      persist();
      emit();
    },
    remove(id) {
      userCampaigns = userCampaigns.filter((c) => c.id !== id);
      persist();
      emit();
    },
    // Advance live user campaigns — spend paces toward budget, impressions +
    // payouts follow. Called on an interval by the lobby so ON AIR numbers
    // move while you watch.
    advance() {
      let changed = false;
      userCampaigns = userCampaigns.map((c) => {
        if (c.state !== "live" || !c.budget) return c;
        const stepSpend = Math.max(8, Math.round(c.budget / ((c.flightDays || 30) * 240)));
        if ((c.spent || 0) >= c.budget) return c;
        changed = true;
        const spent = Math.min(c.budget, (c.spent || 0) + stepSpend);
        const imps = Math.round((c.metrics && c.metrics.impressions || 0) + stepSpend / 42 * 1e3);
        return {
          ...c,
          spent,
          metrics: { ...c.metrics || {}, impressions: imps },
          payouts: { ...c.payouts || {}, creators: Math.round(spent * 0.34), holders: Math.round(spent * 0.17) }
        };
      });
      if (changed) {
        persist();
        emit();
      }
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    }
  };
})();
Object.assign(window, { TIER_WEIGHTS, ACTIVE_VOTES, HOLDER_CHAT });

  try { if (typeof ADVERTISER !== "undefined") window["ADVERTISER"] = ADVERTISER; } catch (_) {}
  try { if (typeof AD_FORMATS !== "undefined") window["AD_FORMATS"] = AD_FORMATS; } catch (_) {}
  try { if (typeof CAMPAIGNS !== "undefined") window["CAMPAIGNS"] = CAMPAIGNS; } catch (_) {}
  try { if (typeof COMMERCIAL_DRAFTS !== "undefined") window["COMMERCIAL_DRAFTS"] = COMMERCIAL_DRAFTS; } catch (_) {}
  try { if (typeof AUDIENCES !== "undefined") window["AUDIENCES"] = AUDIENCES; } catch (_) {}
  try { if (typeof PAYOUT_DEFAULTS !== "undefined") window["PAYOUT_DEFAULTS"] = PAYOUT_DEFAULTS; } catch (_) {}
  try { if (typeof TIER_WEIGHTS !== "undefined") window["TIER_WEIGHTS"] = TIER_WEIGHTS; } catch (_) {}
  try { if (typeof ACTIVE_VOTES !== "undefined") window["ACTIVE_VOTES"] = ACTIVE_VOTES; } catch (_) {}
  try { if (typeof HOLDER_CHAT !== "undefined") window["HOLDER_CHAT"] = HOLDER_CHAT; } catch (_) {}
  try { if (typeof CAMPAIGN_STORE_KEY !== "undefined") window["CAMPAIGN_STORE_KEY"] = CAMPAIGN_STORE_KEY; } catch (_) {}
  try { if (typeof CampaignStore !== "undefined") window["CampaignStore"] = CampaignStore; } catch (_) {}
})();

// ── MODULE: tweaks-panel.jsx ──
;(function() {
const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;width:100%;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}
`;
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === "object" && keyOrEdits !== null ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => ({ ...prev, ...edits }));
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits }, "*");
  }, []);
  return [values, setTweak];
}
function TweaksPanel({ title = "Tweaks", children }) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({ x: 16, y: 16 });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth, h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + "px";
    panel.style.bottom = offsetRef.current.y + "px";
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", clampToViewport);
      return () => window.removeEventListener("resize", clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = (e) => {
      const t = e?.data?.type;
      if (t === "__activate_edit_mode") setOpen(true);
      else if (t === "__deactivate_edit_mode") setOpen(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*");
  };
  const onDragStart = (e) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };
  if (!open) return null;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("style", null, __TWEAKS_STYLE), /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: dragRef,
      className: "twk-panel",
      "data-noncommentable": "",
      style: { right: offsetRef.current.x, bottom: offsetRef.current.y }
    },
    /* @__PURE__ */ React.createElement("div", { className: "twk-hd", onMouseDown: onDragStart }, /* @__PURE__ */ React.createElement("b", null, title), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "twk-x",
        "aria-label": "Close tweaks",
        onMouseDown: (e) => e.stopPropagation(),
        onClick: dismiss
      },
      "\u2715"
    )),
    /* @__PURE__ */ React.createElement("div", { className: "twk-body" }, children)
  ));
}
function TweakSection({ label, children }) {
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "twk-sect" }, label), children);
}
function TweakRow({ label, value, children, inline = false }) {
  return /* @__PURE__ */ React.createElement("div", { className: inline ? "twk-row twk-row-h" : "twk-row" }, /* @__PURE__ */ React.createElement("div", { className: "twk-lbl" }, /* @__PURE__ */ React.createElement("span", null, label), value != null && /* @__PURE__ */ React.createElement("span", { className: "twk-val" }, value)), children);
}
function TweakSlider({ label, value, min = 0, max = 100, step = 1, unit = "", onChange }) {
  return /* @__PURE__ */ React.createElement(TweakRow, { label, value: `${value}${unit}` }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      className: "twk-slider",
      min,
      max,
      step,
      value,
      onChange: (e) => onChange(Number(e.target.value))
    }
  ));
}
function TweakToggle({ label, value, onChange }) {
  return /* @__PURE__ */ React.createElement("div", { className: "twk-row twk-row-h" }, /* @__PURE__ */ React.createElement("div", { className: "twk-lbl" }, /* @__PURE__ */ React.createElement("span", null, label)), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "twk-toggle",
      "data-on": value ? "1" : "0",
      role: "switch",
      "aria-checked": !!value,
      onClick: () => onChange(!value)
    },
    /* @__PURE__ */ React.createElement("i", null)
  ));
}
function TweakRadio({ label, value, options, onChange }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const opts = options.map((o) => typeof o === "object" ? o : { value: o, label: o });
  const idx = Math.max(0, opts.findIndex((o) => o.value === value));
  const n = opts.length;
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const segAt = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = (e) => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = (ev) => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  return /* @__PURE__ */ React.createElement(TweakRow, { label }, /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: trackRef,
      role: "radiogroup",
      onPointerDown,
      className: dragging ? "twk-seg dragging" : "twk-seg"
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "twk-seg-thumb",
        style: {
          left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
          width: `calc((100% - 4px) / ${n})`
        }
      }
    ),
    opts.map((o) => /* @__PURE__ */ React.createElement("button", { key: o.value, type: "button", role: "radio", "aria-checked": o.value === value }, o.label))
  ));
}
function TweakSelect({ label, value, options, onChange }) {
  return /* @__PURE__ */ React.createElement(TweakRow, { label }, /* @__PURE__ */ React.createElement("select", { className: "twk-field", value, onChange: (e) => onChange(e.target.value) }, options.map((o) => {
    const v = typeof o === "object" ? o.value : o;
    const l = typeof o === "object" ? o.label : o;
    return /* @__PURE__ */ React.createElement("option", { key: v, value: v }, l);
  })));
}
function TweakText({ label, value, placeholder, onChange }) {
  return /* @__PURE__ */ React.createElement(TweakRow, { label }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "twk-field",
      type: "text",
      value,
      placeholder,
      onChange: (e) => onChange(e.target.value)
    }
  ));
}
function TweakNumber({ label, value, min, max, step = 1, unit = "", onChange }) {
  const clamp = (n) => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({ x: 0, val: 0 });
  const onScrubStart = (e) => {
    e.preventDefault();
    startRef.current = { x: e.clientX, val: value };
    const decimals = (String(step).split(".")[1] || "").length;
    const move = (ev) => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "twk-num" }, /* @__PURE__ */ React.createElement("span", { className: "twk-num-lbl", onPointerDown: onScrubStart }, label), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      value,
      min,
      max,
      step,
      onChange: (e) => onChange(clamp(Number(e.target.value)))
    }
  ), unit && /* @__PURE__ */ React.createElement("span", { className: "twk-num-unit" }, unit));
}
function TweakColor({ label, value, onChange }) {
  return /* @__PURE__ */ React.createElement("div", { className: "twk-row twk-row-h" }, /* @__PURE__ */ React.createElement("div", { className: "twk-lbl" }, /* @__PURE__ */ React.createElement("span", null, label)), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "color",
      className: "twk-swatch",
      value,
      onChange: (e) => onChange(e.target.value)
    }
  ));
}
function TweakButton({ label, onClick, secondary = false }) {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: secondary ? "twk-btn secondary" : "twk-btn",
      onClick
    },
    label
  );
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});

  try { if (typeof __TWEAKS_STYLE !== "undefined") window["__TWEAKS_STYLE"] = __TWEAKS_STYLE; } catch (_) {}
  try { if (typeof useTweaks !== "undefined") window["useTweaks"] = useTweaks; } catch (_) {}
  try { if (typeof TweaksPanel !== "undefined") window["TweaksPanel"] = TweaksPanel; } catch (_) {}
  try { if (typeof TweakSection !== "undefined") window["TweakSection"] = TweakSection; } catch (_) {}
  try { if (typeof TweakRow !== "undefined") window["TweakRow"] = TweakRow; } catch (_) {}
  try { if (typeof TweakSlider !== "undefined") window["TweakSlider"] = TweakSlider; } catch (_) {}
  try { if (typeof TweakToggle !== "undefined") window["TweakToggle"] = TweakToggle; } catch (_) {}
  try { if (typeof TweakRadio !== "undefined") window["TweakRadio"] = TweakRadio; } catch (_) {}
  try { if (typeof TweakSelect !== "undefined") window["TweakSelect"] = TweakSelect; } catch (_) {}
  try { if (typeof TweakText !== "undefined") window["TweakText"] = TweakText; } catch (_) {}
  try { if (typeof TweakNumber !== "undefined") window["TweakNumber"] = TweakNumber; } catch (_) {}
  try { if (typeof TweakColor !== "undefined") window["TweakColor"] = TweakColor; } catch (_) {}
  try { if (typeof TweakButton !== "undefined") window["TweakButton"] = TweakButton; } catch (_) {}
})();

// ── MODULE: producers-branched.jsx ──
;(function() {
const PB_BRANCH = {
  frequency: {
    filmId: "frequency",
    title: "Frequency 88.6",
    forks: 4,
    optionsPerFork: 3,
    totalCuts: 81,
    roomSize: 2840,
    liveNow: 1284,
    voteWindowSec: 90,
    canonical: "Signal",
    cutRevShare: 4,
    rentPriceUSD: 6,
    cutsRentedWk: 3120,
    accent: tkc("amber")
  },
  marauder: {
    filmId: "marauder",
    title: "Marauder",
    forks: 4,
    optionsPerFork: 3,
    totalCuts: 64,
    roomSize: 1960,
    liveNow: 742,
    voteWindowSec: 75,
    canonical: "Take the road",
    cutRevShare: 5,
    rentPriceUSD: 5,
    cutsRentedWk: 2140,
    accent: tkc("bad")
  },
  swallows: {
    filmId: "swallows",
    title: "The Swallows",
    forks: 3,
    optionsPerFork: 3,
    totalCuts: 27,
    roomSize: 1210,
    liveNow: 388,
    voteWindowSec: 60,
    canonical: "She stays",
    cutRevShare: 4,
    rentPriceUSD: 4,
    cutsRentedWk: 980,
    accent: tkc("cat-2")
  }
};
const PB_BLOOD = tkc("bad");
function pbMeta(id) {
  return PB_BRANCH[id] || null;
}
function BranchGlyph({ size = 14, color = PB_BLOOD, dim = "currentColor" }) {
  return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 48 48", fill: "none", stroke: dim, strokeWidth: "3.2", strokeLinecap: "round", style: { opacity: 1 } }, /* @__PURE__ */ React.createElement("path", { d: "M24 8 L24 18" }), /* @__PURE__ */ React.createElement("path", { d: "M24 18 L10 26 L10 40", opacity: ".45" }), /* @__PURE__ */ React.createElement("path", { d: "M24 18 L24 40", stroke: color }), /* @__PURE__ */ React.createElement("path", { d: "M24 18 L38 26 L38 40", opacity: ".45" }));
}
function BranchedTag({ compact }) {
  return /* @__PURE__ */ React.createElement("span", { style: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: compact ? "3px 7px" : "4px 9px",
    borderRadius: "var(--r-2)",
    background: "rgba(201,85,72,.14)",
    border: "1px solid rgba(201,85,72,.42)",
    color: PB_BLOOD,
    fontFamily: "var(--f-mono)",
    fontSize: compact ? 8.5 : 9,
    letterSpacing: ".16em",
    textTransform: "uppercase",
    fontWeight: 700,
    whiteSpace: "nowrap"
  } }, /* @__PURE__ */ React.createElement(BranchGlyph, { size: 10, color: PB_BLOOD, dim: PB_BLOOD }), "Branched");
}
function BranchedStatStrip({ meta }) {
  if (!meta) return null;
  return /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 10px",
    border: "1px solid rgba(201,85,72,.28)",
    borderRadius: "var(--r-2)",
    background: "rgba(201,85,72,.06)",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    color: "var(--c-ink-2)",
    textTransform: "uppercase"
  } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, color: PB_BLOOD, fontWeight: 700 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 5, height: 5, borderRadius: "50%", background: PB_BLOOD, boxShadow: `0 0 7px ${PB_BLOOD}` } }), meta.liveNow.toLocaleString(), " in room"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-4)" } }, "\xB7"), /* @__PURE__ */ React.createElement("span", null, meta.forks, " forks"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-4)" } }, "\xB7"), /* @__PURE__ */ React.createElement("span", null, meta.totalCuts, " cuts"));
}
function pbBranchedLots() {
  const out = [];
  const thumbs = { frequency: "frequency", marauder: "marauder", swallows: "swallows" };
  const sellers = ["tao_reng", "void_91", "miradawn", "reel.eth", "june_a", "0x3c\u202644"];
  let n = 0;
  Object.values(PB_BRANCH).forEach((m, i) => {
    [
      {
        tier: "Canonical Cut",
        tierKey: "canonical-cut",
        base: 9.4,
        count: 1,
        note: `Owns the ${m.canonical} path \u2014 the room's locked ending. Rent revenue routes to the holder.`
      },
      {
        tier: "Fork Rights",
        tierKey: "fork-rights",
        base: 3.1,
        count: 2,
        note: "One fork of the tree. Every viewer who takes this branch pays through to you."
      },
      {
        tier: "Room Seat",
        tierKey: "room-seat",
        base: 0.38,
        count: 3,
        note: "5\xD7 vote weight in the live room, for every screening, forever."
      }
    ].forEach((t) => {
      for (let k = 0; k < t.count; k++) {
        n++;
        const drift = Math.sin(n * 0.9) * 0.35 + 1;
        const top = +(t.base * drift * (1 + n % 7 / 14)).toFixed(3);
        out.push({
          id: `auc_br_${m.filmId}_${t.tierKey}_${k}`,
          projectId: m.filmId,
          projectTitle: m.title,
          creator: m.title === "Frequency 88.6" ? "Tao Reng" : "Cina Originals",
          color: m.accent,
          thumb: thumbs[m.filmId],
          branched: true,
          branchMeta: m,
          edition: t.tierKey === "canonical-cut" ? "1 / 1" : `${k + 1} / ${m.forks}`,
          tier: t.tier,
          tierKey: t.tierKey,
          seller: sellers[(n + i) % sellers.length],
          reservePrice: +(top * 0.72).toFixed(3),
          currentBid: top,
          buyItNow: +(top * 1.45).toFixed(3),
          bidCount: 4 + n % 11,
          endsInH: 1 + n * 13 % 72,
          royalty: 8,
          synopsis: t.note
        });
      }
    });
  });
  return out;
}
Object.assign(window, { PB_BRANCH, pbMeta, PbBranchGlyph: BranchGlyph, BranchedTag, BranchedStatStrip, pbBranchedLots });
if (!window.BranchGlyph) window.BranchGlyph = BranchGlyph;

  try { if (typeof PB_BRANCH !== "undefined") window["PB_BRANCH"] = PB_BRANCH; } catch (_) {}
  try { if (typeof PB_BLOOD !== "undefined") window["PB_BLOOD"] = PB_BLOOD; } catch (_) {}
  try { if (typeof pbMeta !== "undefined") window["pbMeta"] = pbMeta; } catch (_) {}
  try { if (typeof BranchGlyph !== "undefined") window["BranchGlyph"] = BranchGlyph; } catch (_) {}
  try { if (typeof BranchedTag !== "undefined") window["BranchedTag"] = BranchedTag; } catch (_) {}
  try { if (typeof BranchedStatStrip !== "undefined") window["BranchedStatStrip"] = BranchedStatStrip; } catch (_) {}
  try { if (typeof pbBranchedLots !== "undefined") window["pbBranchedLots"] = pbBranchedLots; } catch (_) {}
})();

// ── MODULE: branched-rights.jsx ──
;(function() {
const { useState: usBR2, useMemo: umBR2 } = React;
const BR2_BLOOD = tkc("bad");
function br2Rights(meta, project) {
  const floor = project?.floorUSD || 120;
  return [
    {
      key: "canonical-cut",
      name: "Canonical Cut",
      supply: 1,
      priceUSD: floor * 34,
      body: `Co-owns the ${meta.canonical || "locked"} path \u2014 the ending the room voted in. Every rental of the canonical cut pays through to the holder.`,
      perks: ["1 / 1 edition", `${meta.cutRevShare}% of all cut rentals`, "Named in the room credits"]
    },
    {
      key: "fork-rights",
      name: "Fork Rights",
      supply: meta.forks,
      priceUSD: floor * 5,
      body: "One branch of the tree, for the life of the film. When a viewer takes your fork, the rental routes to you.",
      perks: [`1 of ${meta.forks} editions`, "Revenue on your path only", "Vote weight \xD73 at your fork"]
    },
    {
      key: "room-seat",
      name: "Room Seat",
      supply: meta.roomSize || 1200,
      priceUSD: floor,
      body: "A permanent seat in the live room: five times the vote weight at every fork, every screening.",
      perks: ["Vote weight \xD75", "All cuts you unlock stay yours", "Front-row chat"]
    }
  ];
}
function Br2Tree({ meta, tree }) {
  const forks = tree?.forks || (meta.forkSpec || []).map((f, i) => ({ actLabel: f.act, atMinute: f.at, heading: f.heading, question: f.question, options: [] }));
  if (!forks.length) return null;
  const per = meta.optionsPerFork || 3;
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 3 } }, forks.map((f, i) => {
    const opts = f.options && f.options.length ? f.options : Array.from({ length: per }, (_, j) => ({ id: j, title: "\u2014", votes: 0, leading: j === 0 }));
    const total = opts.reduce((s, o) => s + (o.votes || 0), 0) || 1;
    return /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "grid", gridTemplateColumns: "84px 1fr", gap: 14, padding: "12px 0", borderTop: i ? "1px solid var(--c-line)" : "none" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: BR2_BLOOD, fontWeight: 700 } }, f.actLabel || "ACT " + (i + 1)), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 5 } }, f.atMinute, "\u2032")), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.35 } }, f.heading), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 3, fontStyle: "italic" } }, f.question), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginTop: 9, flexWrap: "wrap" } }, opts.map((o, j) => {
      const share = Math.round((o.votes || 0) / total * 100);
      return /* @__PURE__ */ React.createElement("span", { key: j, style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "5px 9px",
        borderRadius: "var(--r-2)",
        border: `1px solid ${o.leading ? BR2_BLOOD + "88" : "var(--c-line-2)"}`,
        background: o.leading ? "rgba(201,85,72,.09)" : "transparent",
        fontSize: "var(--fs-body)",
        color: o.leading ? "var(--c-ink)" : "var(--c-ink-3)"
      } }, o.glyph ? /* @__PURE__ */ React.createElement("span", { style: { color: o.color || BR2_BLOOD, fontSize: "var(--fs-label)" } }, o.glyph) : null, o.title, o.votes ? /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)" } }, share, "%") : null);
    }))));
  }));
}
function BranchedProjectPanel({ project }) {
  const meta = project?.branch || (window.pbMeta ? window.pbMeta(project?.film?.id || project?.filmId) : null);
  if (!meta) return null;
  const tree = window.BRANCH_FILMS ? window.BRANCH_FILMS[meta.filmId] : null;
  const rights = br2Rights(meta, project);
  const weekly = (meta.cutsRentedWk || 0) * (meta.rentPriceUSD || 0);
  return /* @__PURE__ */ React.createElement("section", { style: { margin: "0 auto", maxWidth: "var(--w-mid)", padding: "0 clamp(16px,3vw,32px) 44px" } }, /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid rgba(201,85,72,.32)", borderRadius: "var(--r-2)", overflow: "hidden", background: "var(--c-panel)" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 20px", borderBottom: "1px solid var(--c-line)", background: "rgba(201,85,72,.06)", display: "flex", alignItems: "center", gap: 13, flexWrap: "wrap" } }, window.PbBranchGlyph ? /* @__PURE__ */ React.createElement(window.PbBranchGlyph, { size: 20, color: BR2_BLOOD, dim: "rgba(201,85,72,.5)" }) : null, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: BR2_BLOOD, fontWeight: 700 } }, "BRANCHED CINEMA"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-2)", marginTop: 5 } }, meta.forks, " forks \xB7 ", meta.totalCuts.toLocaleString(), " possible cuts \xB7 room votes ", meta.voteWindowSec, "s at each")), /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }), tree && /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      style: { height: 34, padding: "0 14px", fontSize: "var(--fs-body)" },
      onClick: () => {
        window.location.href = "index.html#/branches/" + meta.filmId;
      }
    },
    "Enter the room \u2192"
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", borderBottom: "1px solid var(--c-line)" } }, [
    ["IN ROOM NOW", meta.liveNow ? meta.liveNow.toLocaleString() : "\u2014"],
    ["CUTS RENTED / WK", (meta.cutsRentedWk || 0).toLocaleString()],
    ["RENTAL PRICE", "$" + (meta.rentPriceUSD || 0)],
    ["WEEKLY CUT REVENUE", "$" + weekly.toLocaleString()],
    ["TO HOLDERS", meta.cutRevShare + "%"]
  ].map(([k, v]) => /* @__PURE__ */ React.createElement("div", { key: k, style: { padding: "14px 18px", borderRight: "1px solid var(--c-line)" } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 6 } }, k), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-lead)", color: k === "TO HOLDERS" ? "var(--c-amber)" : "var(--c-ink)" } }, v)))), /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 20px", borderBottom: "1px solid var(--c-line)" } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 10 } }, "THE FORK TREE"), /* @__PURE__ */ React.createElement(Br2Tree, { meta, tree })), /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 20px" } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 12 } }, "RIGHTS ON SALE"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(258px,1fr))", gap: 12 } }, rights.map((r) => /* @__PURE__ */ React.createElement("div", { key: r.key, style: { padding: 15, border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", background: "var(--c-panel-2)", display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-lead)" } }, r.name), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", whiteSpace: "nowrap" } }, r.supply === 1 ? "1 / 1" : r.supply.toLocaleString() + " EDS")), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "var(--fs-body)", lineHeight: 1.5, color: "var(--c-ink-3)", margin: 0, textWrap: "pretty" } }, r.body), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: "auto", paddingTop: 4 } }, /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-lead)", color: "var(--c-amber)" } }, "$", r.priceUSD.toLocaleString()), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", style: { height: 32, padding: "0 13px", fontSize: "var(--fs-body)" }, onClick: () => {
    if (window.openPayDrawer) window.openPayDrawer({
      kind: "nft",
      title: r.name,
      subtitle: (project.film?.title || project.title) + " \xB7 branched rights",
      accent: BR2_BLOOD,
      priceUSD: r.priceUSD,
      perks: r.perks
    });
    else if (window.toast) window.toast({ title: "ADDED", text: r.name, kind: "good" });
  } }, "Acquire"))))))));
}
function BranchedLotContext({ auction }) {
  const meta = auction?.branchMeta || (window.pbMeta ? window.pbMeta(auction?.projectId) : null);
  if (!auction?.branched || !meta) return null;
  const tree = window.BRANCH_FILMS ? window.BRANCH_FILMS[meta.filmId] : null;
  const isCanon = auction.tierKey === "canonical-cut";
  const isFork = auction.tierKey === "fork-rights";
  const forkIdx = isFork ? (parseInt(String(auction.edition).split("/")[0]) || 1) - 1 : -1;
  const fork = tree && forkIdx >= 0 ? tree.forks[forkIdx] : null;
  return /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid rgba(201,85,72,.3)", borderRadius: "var(--r-2)", overflow: "hidden", background: "rgba(201,85,72,.05)" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 15px", borderBottom: "1px solid rgba(201,85,72,.22)", display: "flex", alignItems: "center", gap: 10 } }, window.PbBranchGlyph ? /* @__PURE__ */ React.createElement(window.PbBranchGlyph, { size: 15, color: BR2_BLOOD, dim: "rgba(201,85,72,.5)" }) : null, /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: BR2_BLOOD, fontWeight: 700 } }, isCanon ? "THE CANONICAL PATH" : isFork ? "FORK " + (forkIdx + 1) + " OF " + meta.forks : "A SEAT IN THE ROOM")), /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 15px", display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: "var(--fs-body)", lineHeight: 1.55, color: "var(--c-ink-2)", margin: 0, textWrap: "pretty" } }, isCanon ? `The room voted "${meta.canonical}" into canon. This lot is that path: the cut new viewers see first, and the one most rented of the ${meta.totalCuts.toLocaleString()} possible.` : isFork && fork ? `Fork at ${fork.atMinute}\u2032 \u2014 "${fork.heading}" The winner takes ${meta.optionsPerFork} ways from here; whoever holds this lot earns on every viewer who walks this branch.` : `${meta.forks} forks, ${meta.voteWindowSec} seconds each. This seat votes at five times weight, at every screening, forever.`), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 24, flexWrap: "wrap" } }, [
    ["CUTS RENTED / WK", (meta.cutsRentedWk || 0).toLocaleString()],
    ["RENTAL", "$" + (meta.rentPriceUSD || 0)],
    ["HOLDER SHARE", meta.cutRevShare + "%"],
    ["IN ROOM", (meta.liveNow || 0).toLocaleString()]
  ].map(([k, v]) => /* @__PURE__ */ React.createElement("div", { key: k }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 5 } }, k), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-body)", color: "var(--c-ink)" } }, v)))), fork && fork.options && fork.options.length > 0 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 8 } }, "WHERE IT LEADS"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, fork.options.map((o, j) => /* @__PURE__ */ React.createElement("span", { key: j, style: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 9px",
    borderRadius: "var(--r-2)",
    border: `1px solid ${o.leading ? BR2_BLOOD + "88" : "var(--c-line-2)"}`,
    background: o.leading ? "rgba(201,85,72,.09)" : "transparent",
    fontSize: "var(--fs-body)",
    color: o.leading ? "var(--c-ink)" : "var(--c-ink-3)"
  } }, /* @__PURE__ */ React.createElement("span", { style: { color: o.color || BR2_BLOOD, fontSize: "var(--fs-label)" } }, o.glyph), o.title))))));
}
function OwnThisForkButton({ tree, fork }) {
  const meta = window.pbMeta ? window.pbMeta(tree.filmId) : null;
  const [open, setOpen] = usBR2(false);
  if (!meta) return null;
  const rights = br2Rights(meta, { floorUSD: 120, film: tree, title: tree.title });
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { onClick: () => setOpen(true), style: {
    appearance: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 14px",
    borderRadius: "var(--r-2)",
    background: "rgba(201,85,72,.16)",
    border: "1px solid rgba(201,85,72,.5)",
    color: "var(--c-bad)",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    fontWeight: 700
  } }, window.PbBranchGlyph ? /* @__PURE__ */ React.createElement(window.PbBranchGlyph, { size: 11, color: tkc("amber-x"), dim: tkc("amber-x") }) : null, "OWN THIS FORK"), open && /* @__PURE__ */ React.createElement("div", { onClick: () => setOpen(false), style: {
    position: "fixed",
    inset: 0,
    zIndex: 400,
    background: "rgba(6,6,9,.86)",
    backdropFilter: "blur(10px)",
    display: "grid",
    placeItems: "center",
    padding: 20
  } }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
    width: "min(660px,100%)",
    maxHeight: "88vh",
    overflowY: "auto",
    borderRadius: "var(--r-3)",
    background: "var(--c-panel)",
    border: "1px solid var(--c-line-2)",
    padding: 24
  } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: BR2_BLOOD, fontWeight: 700, marginBottom: 9 } }, "BRANCHED RIGHTS \xB7 ", tree.title.toUpperCase()), /* @__PURE__ */ React.createElement("h2", { className: "t-display", style: { fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-head)", margin: "0 0 8px", letterSpacing: "-0.02em" } }, "Own a path, not a poster."), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "var(--fs-body)", lineHeight: 1.6, color: "var(--c-ink-3)", margin: "0 0 20px", textWrap: "pretty" } }, meta.cutsRentedWk.toLocaleString(), " cuts rented last week at $", meta.rentPriceUSD, " each. ", meta.cutRevShare, "% of that routes to rights holders, split by whose branch the viewer took."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 9 } }, rights.map((r) => /* @__PURE__ */ React.createElement("div", { key: r.key, style: { display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: "var(--r-2)", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-lead)" } }, r.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 4, lineHeight: 1.45 } }, r.body)), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right", flex: "0 0 auto" } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-lead)", color: "var(--c-amber)", marginBottom: 7 } }, "$", r.priceUSD.toLocaleString()), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", style: { height: 30, padding: "0 12px", fontSize: "var(--fs-body)" }, onClick: () => {
    setOpen(false);
    if (window.openPayDrawer) window.openPayDrawer({
      kind: "nft",
      title: r.name,
      subtitle: tree.title + " \xB7 branched rights",
      accent: BR2_BLOOD,
      priceUSD: r.priceUSD,
      perks: r.perks
    });
  } }, "Acquire"))))), /* @__PURE__ */ React.createElement("button", { className: "btn", style: { marginTop: 18, height: 34, padding: "0 14px", fontSize: "var(--fs-body)" }, onClick: () => setOpen(false) }, "Back to the room"))));
}
Object.assign(window, { BranchedProjectPanel, BranchedLotContext, OwnThisForkButton });

  try { if (typeof usBR2 !== "undefined") window["usBR2"] = usBR2; } catch (_) {}
  try { if (typeof umBR2 !== "undefined") window["umBR2"] = umBR2; } catch (_) {}
  try { if (typeof BR2_BLOOD !== "undefined") window["BR2_BLOOD"] = BR2_BLOOD; } catch (_) {}
  try { if (typeof br2Rights !== "undefined") window["br2Rights"] = br2Rights; } catch (_) {}
  try { if (typeof Br2Tree !== "undefined") window["Br2Tree"] = Br2Tree; } catch (_) {}
  try { if (typeof BranchedProjectPanel !== "undefined") window["BranchedProjectPanel"] = BranchedProjectPanel; } catch (_) {}
  try { if (typeof BranchedLotContext !== "undefined") window["BranchedLotContext"] = BranchedLotContext; } catch (_) {}
  try { if (typeof OwnThisForkButton !== "undefined") window["OwnThisForkButton"] = OwnThisForkButton; } catch (_) {}
})();

// ── MODULE: pay-drawer.jsx ──
;(function() {
const { useState: usPD, useEffect: uePD } = React;
const PD_GAS_USD = 0.04;
const CHAIN_SETTLEMENTS_KEY = "cina:chain:settlements";
const CHAIN_USER_KEY = "cina:chain:user-ledger";
function pdFmtUSD(n) {
  if (n == null || isNaN(n)) return "$0.00";
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function pdFmtETH(usd) {
  return (Number(usd || 0) / 2700).toFixed(4);
}
function pdShortHash() {
  const hex = "0123456789abcdef";
  let h = "0x";
  for (let i = 0; i < 6; i++) h += hex[Math.floor(Math.random() * 16)];
  return h + "\u2026" + Array.from({ length: 4 }, () => hex[Math.floor(Math.random() * 16)]).join("");
}
function _resolveProjectId(ticker) {
  if (!ticker) return "voss-ll";
  const P = window.NFT_PROJECTS || {};
  if (P[ticker]) return ticker;
  const C = window.CATALOG || [];
  const film = C.find((f) => f.id === ticker || f.nft === ticker);
  if (film && film.nft) return film.nft;
  return "voss-ll";
}
function _computeSplits(grossUSD, kind, ticker) {
  const projId = _resolveProjectId(ticker);
  const P = window.NFT_PROJECTS || {};
  const proj = P[projId];
  const C = window.CATALOG || [];
  const film = C.find((f) => f.nft === projId || f.id === ticker) || proj?.film;
  const directorName = film ? (film.creator || "").split("\xB7")[0].trim() || "Director" : proj?.creator || "Studio Treasury";
  const weights = kind === "nft" ? [
    { id: "director", pct: 62, role: "Production Escrow", recipient: `${directorName} \xB7 Multi-Sig`, addr: "0x4E8a\u202691B0" },
    { id: "investors", pct: 20, role: "Investor Pool (Auto)", recipient: `${proj?.backers || 412} Pass Holders \xB7 Pro-Rata`, addr: "0x9C2d\u202644E1" },
    { id: "cast", pct: 10, role: "Cast Likeness Vault", recipient: "Performer LoRA & Voice Pool", addr: "0x3F1b\u202677A8" },
    { id: "writers", pct: 5, role: "Heritage & Canon", recipient: "Screenplay & Branch Tree", addr: "0x8B0e\u202612C9" },
    { id: "protocol", pct: 3, role: "SplitRouter Protocol", recipient: "CinaSplitRouter.sol \xB7 Base", addr: "0x71C9\u20268A4F" }
  ] : [
    { id: "director", pct: 52, role: "Director & Studio", recipient: `${directorName} Treasury`, addr: "0x4E8a\u202691B0" },
    { id: "investors", pct: 30, role: "Investor Pool (Auto)", recipient: `${proj?.backers || 412} Pass Holders \xB7 Pro-Rata`, addr: "0x9C2d\u202644E1" },
    { id: "cast", pct: 10, role: "Cast Likeness Vault", recipient: "Performer LoRA & Voice Pool", addr: "0x3F1b\u202677A8" },
    { id: "writers", pct: 5, role: "Heritage & Canon", recipient: "Screenplay & Branch Tree", addr: "0x8B0e\u202612C9" },
    { id: "protocol", pct: 3, role: "SplitRouter Protocol", recipient: "CinaSplitRouter.sol \xB7 Base", addr: "0x71C9\u20268A4F" }
  ];
  const U = window.USER || { holdings: [] };
  const userProjectHoldings = (U.holdings || []).filter((h) => h.projectId === projId && (h.qty || 0) > 0);
  const userWeight = userProjectHoldings.reduce((acc, h) => acc + (h.tier === "producer" ? 0.14 : h.tier === "patron" ? 0.045 : 0.012) * h.qty, 0);
  const clampedShare = Math.min(0.45, userWeight);
  const rows = weights.map((w) => {
    const usd = +(grossUSD * (w.pct / 100)).toFixed(2);
    const yourCut = w.id === "investors" && clampedShare > 0 ? +(usd * clampedShare).toFixed(2) : 0;
    return { ...w, usd, yourCut };
  });
  const userRebateUSD = rows.reduce((s, r) => s + (r.yourCut || 0), 0);
  return { projId, filmId: film?.id || ticker || "ll", title: film?.title || proj?.title || "Cina Release", rows, userRebateUSD, clampedShare };
}
function _readSettlements() {
  try {
    const raw = JSON.parse(localStorage.getItem(CHAIN_SETTLEMENTS_KEY) || "null");
    if (Array.isArray(raw) && raw.length) return raw;
  } catch (_) {
  }
  return [
    {
      id: "tx-seed-1",
      at: Date.now() - 1e3 * 60 * 14,
      txHash: "0x8f3a\u202692c1",
      chain: "base",
      kind: "buy",
      title: "Buy Last Light \xB7 4K Master",
      projId: "voss-ll",
      grossUSD: 24.99,
      investorPoolUSD: 7.5,
      yourAutoPayoutUSD: 0.61,
      directorUSD: 12.99,
      castUSD: 2.5
    },
    {
      id: "tx-seed-2",
      at: Date.now() - 1e3 * 60 * 52,
      txHash: "0x4c1d\u2026e07b",
      chain: "base",
      kind: "nft",
      title: "Patron Pass \xB7 Frequency 88.6",
      projId: "reng-fr",
      grossUSD: 380,
      investorPoolUSD: 76,
      yourAutoPayoutUSD: 3.42,
      directorUSD: 235.6,
      castUSD: 38
    }
  ];
}
function _persistUserLedger() {
  const U = window.USER;
  if (!U) return;
  try {
    localStorage.setItem(CHAIN_USER_KEY, JSON.stringify({
      walletUSD: U.walletUSD,
      walletETH: U.walletETH,
      totalEarned: U.totalEarned,
      pendingClaim: U.pendingClaim,
      holdings: U.holdings,
      txHistory: U.txHistory
    }));
  } catch (_) {
  }
  if (window.CINA) window.CINA.walletUSD = U.walletUSD;
}
function _recordChainedSettlement({ kind, title, grossUSD, ticker, chain = "base", payMethod = "usdc", txHash, isExternalBuyer = false }) {
  const split = _computeSplits(grossUSD, kind, ticker);
  const U = window.USER;
  const hash = txHash || pdShortHash();
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  if (U) {
    if (!isExternalBuyer && (payMethod === "usdc" || payMethod === "eth")) {
      U.walletUSD = Math.max(0, +(Number(U.walletUSD || 0) - grossUSD).toFixed(2));
      U.walletETH = +(U.walletUSD / 2700).toFixed(4);
      U.txHistory = [
        { d: today, kind: kind === "nft" ? "buy" : kind, project: split.projId, desc: `${title} \xB7 Chained Split`, amount: -Number(grossUSD.toFixed(2)), asset: payMethod.toUpperCase(), txHash: hash },
        ...U.txHistory || []
      ];
    }
    if (!isExternalBuyer && kind === "nft") {
      const tierGuess = /producer/i.test(title) ? "producer" : /patron/i.test(title) ? "patron" : "collector";
      const existing = (U.holdings || []).find((h) => h.projectId === split.projId && h.tier === tierGuess);
      const ethPrice = +(grossUSD / 2700).toFixed(4);
      if (existing) {
        existing.qty = (existing.qty || 0) + 1;
        existing.onWatchlist = false;
      } else {
        U.holdings = [
          { projectId: split.projId, tier: tierGuess, qty: 1, costBasis: ethPrice, currentPrice: +(ethPrice * 1.06).toFixed(4), earned: 0 },
          ...U.holdings || []
        ];
      }
      if (window.__pSession && typeof window.__pSession.set === "function") {
        window.__pSession.set((st) => ({ ...st, holdings: (U.holdings || []).filter((h) => (h.qty || 0) > 0) }));
      }
    }
    const updatedSplit = _computeSplits(grossUSD, kind, ticker);
    const autoPayout = updatedSplit.userRebateUSD;
    if (autoPayout > 0) {
      U.walletUSD = +(Number(U.walletUSD || 0) + autoPayout).toFixed(2);
      U.totalEarned = +(Number(U.totalEarned || 0) + autoPayout).toFixed(2);
      const matchHoldings = (U.holdings || []).filter((h) => h.projectId === updatedSplit.projId && (h.qty || 0) > 0);
      if (matchHoldings.length > 0) {
        const each = +(autoPayout / matchHoldings.length).toFixed(2);
        matchHoldings.forEach((h) => {
          h.earned = +(Number(h.earned || 0) + each).toFixed(2);
        });
      }
      U.txHistory = [
        { d: today, kind: "royalty", project: updatedSplit.projId, desc: `Auto-split payout \xB7 ${updatedSplit.title} (${hash})`, amount: +autoPayout, asset: "USDC", txHash: hash },
        ...U.txHistory || []
      ];
    }
    _persistUserLedger();
  }
  const investorRow = split.rows.find((r) => r.id === "investors");
  const directorRow = split.rows.find((r) => r.id === "director");
  const castRow = split.rows.find((r) => r.id === "cast");
  const entry = {
    id: "tx-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    at: Date.now(),
    txHash: hash,
    chain,
    kind,
    title,
    projId: split.projId,
    grossUSD: +grossUSD.toFixed(2),
    investorPoolUSD: investorRow ? investorRow.usd : 0,
    yourAutoPayoutUSD: split.userRebateUSD,
    directorUSD: directorRow ? directorRow.usd : 0,
    castUSD: castRow ? castRow.usd : 0,
    rows: split.rows
  };
  const nextList = [entry, ..._readSettlements()].slice(0, 40);
  try {
    localStorage.setItem(CHAIN_SETTLEMENTS_KEY, JSON.stringify(nextList));
  } catch (_) {
  }
  if (window.bumpSession) window.bumpSession();
  window.dispatchEvent(new CustomEvent("cina:chain-tx", { detail: entry }));
  return entry;
}
const CinaChain = {
  contract: "0x71C9\u20268A4F",
  network: "Base L2",
  computeSplits: _computeSplits,
  getSettlements: _readSettlements,
  executeChainedPayment: _recordChainedSettlement,
  simulateBoxOfficeEvent(projectId = "voss-ll", grossUSD = 120) {
    const P = window.NFT_PROJECTS || {};
    const proj = P[projectId];
    const label = grossUSD >= 500 ? `Global Screening Batch \xB7 ${proj?.title || "Last Light"}` : `Viewer Collector Bundle \xB7 ${proj?.title || "Last Light"}`;
    const entry = _recordChainedSettlement({
      kind: "buy",
      title: label,
      grossUSD,
      ticker: projectId,
      chain: "base",
      payMethod: "usdc",
      isExternalBuyer: true
    });
    if (window.toast) {
      window.toast({
        title: "CHAINED SMART-CONTRACT SPLIT",
        text: `${pdFmtUSD(grossUSD)} routed \u2192 ${pdFmtUSD(entry.investorPoolUSD)} to Investors${entry.yourAutoPayoutUSD > 0 ? ` (+${pdFmtUSD(entry.yourAutoPayoutUSD)} auto-paid to your wallet)` : ""}`,
        kind: "good"
      });
    }
    return entry;
  }
};
window.CinaChain = CinaChain;
function useChainLedger() {
  const [list, setList] = usPD(() => _readSettlements());
  uePD(() => {
    const sync = () => setList(_readSettlements());
    window.addEventListener("cina:chain-tx", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cina:chain-tx", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return list;
}
window.useChainLedger = useChainLedger;
function ChainedSplitRouterPanel({ defaultProject = "voss-ll" }) {
  const settlements = useChainLedger();
  const [projId, setProjId] = usPD(defaultProject);
  const splitPreview = _computeSplits(100, "buy", projId);
  const projects = [
    { id: "voss-ll", label: "Last Light (Elias Voss)" },
    { id: "reng-fr", label: "Frequency 88.6 (Tao Reng)" },
    { id: "ykim-tf", label: "The Fence (Yara Kim)" }
  ];
  return /* @__PURE__ */ React.createElement("div", { className: "pm-panel", style: { display: "flex", flexDirection: "column", gap: "1.2rem" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "0.35rem" } }, /* @__PURE__ */ React.createElement("span", { className: "pm-k" }, /* @__PURE__ */ React.createElement("b", null, "CinaSplitRouter.sol"), " \xB7 Base L2 (", CinaChain.contract, ") \xB7 Atomic Chained Payouts"), /* @__PURE__ */ React.createElement("h3", { className: "pm-h2" }, "Instant Smart-Contract Revenue Waterfall"), /* @__PURE__ */ React.createElement("p", { className: "pm-lede", style: { fontSize: "var(--fs-body)" } }, "Every rental, purchase, subscription, and pass mint splits USDC in the same block \u2014 paying the director, every co-finance pass holder pro-rata, and the AI cast likeness vault with zero middleman delay.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" } }, /* @__PURE__ */ React.createElement(
    "select",
    {
      "aria-label": "Select film contract",
      value: projId,
      onChange: (e) => setProjId(e.target.value),
      style: {
        height: "2.4rem",
        padding: "0 0.75rem",
        background: "var(--c-bg)",
        color: "var(--c-ink)",
        border: "1px solid var(--c-line-2)",
        borderRadius: "var(--r-1)",
        fontFamily: "var(--f-mono)",
        fontSize: "var(--fs-label)"
      }
    },
    projects.map((p) => /* @__PURE__ */ React.createElement("option", { key: p.id, value: p.id }, p.label))
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "pm-btn pm-btn--sm pm-btn--primary",
      onClick: () => CinaChain.simulateBoxOfficeEvent(projId, 120)
    },
    "Simulate $120 Box-Office Split \u2192"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "pm-btn pm-btn--sm",
      onClick: () => CinaChain.simulateBoxOfficeEvent(projId, 1e3)
    },
    "Simulate $1,000 Window Settlement"
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "0.55rem" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", height: "0.55rem", width: "100%", borderRadius: "var(--r-1)", overflow: "hidden", gap: "2px" } }, splitPreview.rows.map((r, idx) => {
    const colors = ["var(--c-amber)", "var(--c-good)", "var(--c-cat-1)", "var(--c-cat-4)", "var(--c-line-3)"];
    return /* @__PURE__ */ React.createElement("div", { key: r.id, style: { width: `${r.pct}%`, background: colors[idx % colors.length] }, title: `${r.role}: ${r.pct}%` });
  })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 10.5rem), 1fr))", gap: "0.65rem", marginTop: "0.25rem" } }, splitPreview.rows.map((r, idx) => {
    const colors = ["var(--c-amber)", "var(--c-good)", "var(--c-cat-1)", "var(--c-cat-4)", "var(--c-ink-3)"];
    return /* @__PURE__ */ React.createElement("div", { key: r.id, style: { padding: "0.65rem 0.75rem", background: "var(--c-bg)", border: "1px solid var(--c-line)", borderRadius: "var(--r-1)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } }, /* @__PURE__ */ React.createElement("span", { className: "pm-k", style: { color: colors[idx] } }, r.pct, "%"), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)" } }, r.addr)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)", marginTop: "0.2rem" } }, r.role), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: "0.1rem" } }, r.recipient));
  }))), /* @__PURE__ */ React.createElement("div", { style: { borderTop: "1px solid var(--c-line)", paddingTop: "0.9rem" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" } }, /* @__PURE__ */ React.createElement("span", { className: "pm-k" }, "Recent Chained Contract Executions"), /* @__PURE__ */ React.createElement("span", { className: "pm-k", style: { color: "var(--c-good)" } }, "\u25CF Live on Base L2")), /* @__PURE__ */ React.createElement("div", { className: "pm-index" }, settlements.slice(0, 5).map((tx) => /* @__PURE__ */ React.createElement("div", { key: tx.id, className: "pm-row", style: { gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr) auto", cursor: "default", padding: "0.7rem 0" } }, /* @__PURE__ */ React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: "0.18rem", minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", fontWeight: 500, color: "var(--c-ink)" } }, tx.title), /* @__PURE__ */ React.createElement("span", { className: "pm-k" }, tx.txHash, " \xB7 Director ", pdFmtUSD(tx.directorUSD), " \xB7 Cast ", pdFmtUSD(tx.castUSD))), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: "0.18rem" } }, /* @__PURE__ */ React.createElement("span", { className: "pm-k" }, "Investor Pool (30%)"), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-body)", color: "var(--c-ink-2)" } }, pdFmtUSD(tx.investorPoolUSD), " distributed")), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.18rem" } }, /* @__PURE__ */ React.createElement("span", { className: "pm-k" }, "Your Auto-Payout"), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-body)", fontWeight: 600, color: tx.yourAutoPayoutUSD > 0 ? "var(--c-good)" : "var(--c-ink-3)" } }, tx.yourAutoPayoutUSD > 0 ? `+${pdFmtUSD(tx.yourAutoPayoutUSD)} USDC` : pdFmtUSD(tx.grossUSD))))))));
}
window.ChainedSplitRouterPanel = ChainedSplitRouterPanel;
let _pdSetState = null;
function openPay(config) {
  if (_pdSetState) _pdSetState({ ...config, open: true, ts: Date.now() });
}
window.openPay = openPay;
function PayDrawer() {
  const [state, setState] = usPD({ open: false });
  uePD(() => {
    _pdSetState = setState;
    return () => {
      _pdSetState = null;
    };
  }, []);
  if (!state.open) return null;
  return /* @__PURE__ */ React.createElement(PayDrawerInstance, { config: state, onClose: () => {
    setState((s) => ({ ...s, open: false }));
    if (state.onClose) state.onClose();
  } });
}
function PayDrawerInstance({ config, onClose }) {
  const {
    kind = "nft",
    title,
    subtitle,
    image,
    accent: accentRaw,
    priceUSD = 0,
    recurring,
    qty: qty0 = 1,
    qtyMax = 99,
    items,
    perks,
    onConfirm,
    ticker
  } = config;
  const accent = accentRaw || "var(--c-amber)";
  const labels = {
    nft: { actionPrimary: "Execute Mint & Split", actionPast: "Minted On-Chain", review: "Co-Finance Pass" },
    sub: { actionPrimary: "Subscribe On-Chain", actionPast: "Subscribed", review: "Studio Subscription" },
    rent: { actionPrimary: "Rent & Split USDC", actionPast: "Unlocked (48h)", review: "48-Hour Screening" },
    buy: { actionPrimary: "Buy & Split USDC", actionPast: "Owned Forever", review: "Master Purchase" },
    tip: { actionPrimary: "Send Chained Tip", actionPast: "Tip Settled", review: "Direct Patron Tip" },
    ticket: { actionPrimary: "Mint Pass", actionPast: "Pass Minted", review: "Festival Pass" },
    license: { actionPrimary: "Execute License", actionPast: "License Minted", review: "Commercial License" }
  }[kind] || { actionPrimary: "Pay On-Chain", actionPast: "Settled", review: "Smart-Contract Checkout" };
  const [step, setStep] = usPD("review");
  const [qty, setQty] = usPD(qty0);
  const [agreed, setAgreed] = usPD(true);
  const [payMethod, setPayMethod] = usPD("usdc");
  const [chain, setChain] = usPD("base");
  const [progress, setProgress] = usPD(0);
  const [txHash] = usPD(() => pdShortHash());
  const [settlement, setSettlement] = usPD(null);
  const [animateOpen, setAnimateOpen] = usPD(false);
  uePD(() => {
    const t = setTimeout(() => setAnimateOpen(true), 16);
    return () => clearTimeout(t);
  }, []);
  const subtotal = Math.max(0, Number(priceUSD || 0)) * qty;
  const gas = payMethod === "card" || payMethod === "applepay" ? 0 : chain === "mainnet" ? 4.2 : PD_GAS_USD;
  const total = subtotal + gas;
  const split = _computeSplits(subtotal, kind, ticker);
  uePD(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);
  uePD(() => {
    if (step !== "confirming") return;
    let p = 0;
    const id = setInterval(() => {
      p += 22;
      if (p >= 100) {
        p = 100;
        clearInterval(id);
        const entry = _recordChainedSettlement({
          kind,
          title: title || split.title,
          grossUSD: subtotal,
          ticker,
          chain,
          payMethod,
          txHash,
          isExternalBuyer: false
        });
        setSettlement(entry);
        if (onConfirm) onConfirm({ kind, qty, total, txHash, payMethod, chain, settlement: entry });
        setStep("success");
      }
      setProgress(p);
    }, 150);
    return () => clearInterval(id);
  }, [step]);
  const confirm = () => {
    setProgress(0);
    setStep("confirming");
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: {
    position: "fixed",
    inset: 0,
    zIndex: 9700,
    background: "rgba(0,0,0,.78)",
    backdropFilter: "blur(8px)",
    opacity: animateOpen ? 1 : 0,
    transition: "opacity .2s ease"
  } }), /* @__PURE__ */ React.createElement("aside", { role: "dialog", "aria-modal": "true", "aria-label": title || "Smart-contract payment", style: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 9701,
    width: "min(34rem, 100%)",
    background: "var(--c-panel)",
    borderLeft: "1px solid var(--c-line-2)",
    boxShadow: "-24px 0 60px rgba(0,0,0,.55)",
    display: "flex",
    flexDirection: "column",
    transform: animateOpen ? "translateX(0)" : "translateX(100%)",
    transition: "transform .26s cubic-bezier(.2,.7,.2,1)",
    color: "var(--c-ink)"
  } }, /* @__PURE__ */ React.createElement("header", { style: {
    padding: "1.2rem 1.5rem",
    borderBottom: "1px solid var(--c-line)",
    display: "flex",
    alignItems: "center",
    gap: "0.9rem"
  } }, /* @__PURE__ */ React.createElement(PdItemThumb, { image, accent }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    color: accent,
    letterSpacing: ".16em",
    textTransform: "uppercase",
    marginBottom: "0.2rem",
    fontWeight: 600
  } }, labels.review, subtitle ? ` \xB7 ${subtitle}` : ""), /* @__PURE__ */ React.createElement("div", { style: {
    fontFamily: "var(--f-display)",
    fontStyle: "italic",
    fontSize: "var(--fs-title)",
    fontWeight: 500,
    lineHeight: 1.1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  } }, title)), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
    width: "2rem",
    height: "2rem",
    background: "transparent",
    color: "var(--c-ink-3)",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-1)",
    cursor: "pointer",
    fontSize: "var(--fs-body)",
    flexShrink: 0
  }, "aria-label": "Close" }, "\xD7")), /* @__PURE__ */ React.createElement("div", { style: {
    padding: "0.7rem 1.5rem",
    borderBottom: "1px solid var(--c-line)",
    display: "flex",
    gap: "0.4rem",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".14em",
    textTransform: "uppercase"
  } }, ["01 Review", "02 Split & Wallet", "03 Chain Route", "04 Receipt"].map((s, i) => {
    const idx = ["review", "pay", "confirming", "success"].indexOf(step);
    const active = i === idx;
    const done = i < idx;
    return /* @__PURE__ */ React.createElement("span", { key: s, style: {
      flex: 1,
      padding: "0.35rem 0",
      textAlign: "center",
      color: active ? accent : done ? "var(--c-ink-2)" : "var(--c-ink-4)",
      fontWeight: active ? 700 : 500,
      borderBottom: active ? `2px solid ${accent}` : "2px solid transparent"
    } }, s);
  })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "1.35rem 1.5rem" } }, step === "review" && /* @__PURE__ */ React.createElement(
    PdReview,
    {
      config,
      accent,
      qty,
      setQty,
      qtyMax,
      priceUSD,
      recurring,
      items,
      perks,
      agreed,
      setAgreed,
      kind,
      split
    }
  ), step === "pay" && /* @__PURE__ */ React.createElement(
    PdPay,
    {
      accent,
      payMethod,
      setPayMethod,
      chain,
      setChain,
      subtotal,
      gas,
      total,
      recurring,
      split
    }
  ), step === "confirming" && /* @__PURE__ */ React.createElement(PdConfirming, { accent, progress, payMethod, chain, split }), step === "success" && /* @__PURE__ */ React.createElement(
    PdSuccess,
    {
      accent,
      config,
      qty,
      total,
      txHash,
      payMethod,
      chain,
      settlement,
      split,
      onClose
    }
  )), (step === "review" || step === "pay") && /* @__PURE__ */ React.createElement("footer", { style: {
    padding: "1rem 1.5rem",
    borderTop: "1px solid var(--c-line)",
    background: "var(--c-panel-2)",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } }, /* @__PURE__ */ React.createElement("span", { style: {
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    color: "var(--c-ink-3)",
    textTransform: "uppercase"
  } }, step === "review" ? "Chained Contract Amount" : "Total Settlement"), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("div", { style: {
    fontFamily: "var(--f-display)",
    fontStyle: "italic",
    fontWeight: 500,
    fontSize: "var(--fs-title)",
    lineHeight: 1,
    color: accent
  } }, pdFmtUSD(step === "review" ? subtotal : total), recurring ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginLeft: "0.25rem" } }, "/ ", recurring) : null), (payMethod === "eth" || payMethod === "usdc") && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: "0.2rem" } }, "\u2248 ", pdFmtETH(total), " ETH \xB7 Wallet ", pdFmtUSD(window.USER?.walletUSD || 28413)))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.5rem" } }, step === "pay" && /* @__PURE__ */ React.createElement("button", { onClick: () => setStep("review"), style: {
    padding: "0.75rem 1rem",
    background: "transparent",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-2)",
    color: "var(--c-ink-2)",
    cursor: "pointer",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".14em",
    fontWeight: 600
  } }, "\u2190 BACK"), /* @__PURE__ */ React.createElement(
    "button",
    {
      disabled: step === "review" && !agreed,
      onClick: () => step === "review" ? setStep("pay") : confirm(),
      style: {
        flex: 1,
        padding: "0.8rem 1.1rem",
        background: step === "review" && !agreed ? "var(--c-line)" : accent,
        color: step === "review" && !agreed ? "var(--c-ink-4)" : "var(--c-on-amber)",
        border: "none",
        borderRadius: "var(--r-2)",
        fontFamily: "var(--f-mono)",
        fontSize: "var(--fs-label)",
        letterSpacing: ".16em",
        fontWeight: 700,
        textTransform: "uppercase",
        cursor: step === "review" && !agreed ? "not-allowed" : "pointer"
      }
    },
    step === "review" ? "Inspect Smart-Contract Split \u2192" : `${labels.actionPrimary} \xB7 ${pdFmtUSD(total)}`
  )))));
}
function PdItemThumb({ image, accent }) {
  const box = { width: "2.8rem", height: "2.8rem", borderRadius: "var(--r-1)", overflow: "hidden", flexShrink: 0, border: "1px solid var(--c-line-2)", background: image?.color || "var(--c-panel-2)" };
  if (image?.src) return /* @__PURE__ */ React.createElement("div", { style: box }, /* @__PURE__ */ React.createElement("img", { src: image.src, alt: "", style: { width: "100%", height: "100%", objectFit: "cover" } }));
  if (image?.kind && typeof FrameThumb === "function") return /* @__PURE__ */ React.createElement("div", { style: box }, /* @__PURE__ */ React.createElement(FrameThumb, { kind: image.kind, usePhoto: true }));
  return /* @__PURE__ */ React.createElement("div", { style: { ...box, background: `linear-gradient(135deg, ${accent}, var(--c-panel-2))` } });
}
function SplitWaterfallBox({ split, accent }) {
  return /* @__PURE__ */ React.createElement("div", { style: {
    padding: "0.9rem 1rem",
    background: "var(--c-panel-2)",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-2)",
    display: "flex",
    flexDirection: "column",
    gap: "0.55rem"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".14em", color: accent, fontWeight: 600 } }, "CHAINED SMART-CONTRACT SPLIT"), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)" } }, CinaChain.contract)), split.rows.map((r) => /* @__PURE__ */ React.createElement("div", { key: r.id, style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem", paddingTop: "0.35rem", borderTop: "1px solid var(--c-line)" } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink)" } }, r.role), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginLeft: "0.45rem" } }, r.pct, "%"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)" } }, r.recipient)), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 600 } }, pdFmtUSD(r.usd)), r.yourCut > 0 && /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-good)" } }, "+", pdFmtUSD(r.yourCut), " to you")))));
}
function PdReview({ config, accent, qty, setQty, qtyMax, priceUSD, items, perks, agreed, setAgreed, kind, split }) {
  const hasQty = kind === "nft" || kind === "ticket" || kind === "buy";
  const itemList = items || [{ label: config.title, sub: config.subtitle, price: priceUSD }];
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "1.1rem" } }, hasQty && /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.85rem 1rem",
    background: "var(--c-panel-2)",
    border: "1px solid var(--c-line)",
    borderRadius: "var(--r-2)"
  } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, "QUANTITY"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)" } }, qty, "\xD7 ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)" } }, "at ", pdFmtUSD(priceUSD)))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.35rem" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setQty(Math.max(1, qty - 1)), style: { width: "2.2rem", height: "2.2rem", background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)", cursor: "pointer", color: "var(--c-ink)" } }, "\u2212"), /* @__PURE__ */ React.createElement("button", { onClick: () => setQty(Math.min(qtyMax, qty + 1)), style: { width: "2.2rem", height: "2.2rem", background: accent, color: "var(--c-on-amber)", border: "none", borderRadius: "var(--r-1)", cursor: "pointer", fontWeight: 700 } }, "+"))), /* @__PURE__ */ React.createElement("div", { style: { padding: "0.85rem 1rem", background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" } }, itemList.map((it, i, a) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0.45rem 0", borderBottom: i < a.length - 1 ? "1px solid var(--c-line)" : "none" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink)" } }, it.label), it.sub && /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)" } }, it.sub)), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-body)", fontWeight: 600 } }, pdFmtUSD(it.price * (hasQty && itemList.length === 1 ? qty : 1)))))), /* @__PURE__ */ React.createElement(SplitWaterfallBox, { split, accent }), perks && perks.length > 0 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: "0.5rem" } }, "INCLUDED RIGHTS & ACCESS"), /* @__PURE__ */ React.createElement("ul", { style: { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem" } }, perks.map((p, i) => /* @__PURE__ */ React.createElement("li", { key: i, style: { display: "flex", gap: "0.6rem", fontSize: "var(--fs-body)", color: "var(--c-ink-2)" } }, /* @__PURE__ */ React.createElement("span", { style: { color: accent } }, "\u2014"), /* @__PURE__ */ React.createElement("span", null, p))))), /* @__PURE__ */ React.createElement("label", { style: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.65rem",
    padding: "0.65rem 0.8rem",
    border: "1px solid var(--c-line)",
    borderRadius: "var(--r-2)",
    cursor: "pointer"
  } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: agreed, onChange: (e) => setAgreed(e.target.checked), style: { accentColor: accent, marginTop: "0.2rem" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", lineHeight: 1.45 } }, "Execute atomic split on CinaSplitRouter (", CinaChain.network, "). All downstream investor and creator wallets settle immediately.")));
}
function PdPay({ accent, payMethod, setPayMethod, chain, setChain, subtotal, gas, total, split }) {
  const methods = [
    { id: "usdc", label: "USDC Wallet", sub: `Balance ${pdFmtUSD(window.USER?.walletUSD || 28413)}`, icon: "$" },
    { id: "eth", label: "ETH Native", sub: `${(window.USER?.walletETH || 10.45).toFixed(2)} ETH available`, icon: "\u039E" },
    { id: "card", label: "Card \u2192 USDC", sub: "Auto-onramp into SplitRouter", icon: "\u25AD" },
    { id: "applepay", label: "Passkey Pay", sub: "Biometric instant sign", icon: "\u2726" }
  ];
  const chains = [
    { id: "base", label: "Base L2", sub: "Gas $0.04 \xB7 Instant" },
    { id: "optimism", label: "Optimism", sub: "Gas $0.06 \xB7 Instant" },
    { id: "mainnet", label: "Ethereum", sub: "Gas $4.20 \xB7 L1" }
  ];
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "1.2rem" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: "0.55rem" } }, "PAYMENT ASSET"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.5rem" } }, methods.map((m) => {
    const on = payMethod === m.id;
    return /* @__PURE__ */ React.createElement("button", { key: m.id, onClick: () => setPayMethod(m.id), style: {
      padding: "0.8rem",
      textAlign: "left",
      background: on ? "rgba(var(--accent-rgb),.12)" : "var(--c-panel-2)",
      border: `1px solid ${on ? accent : "var(--c-line)"}`,
      borderRadius: "var(--r-2)",
      cursor: "pointer",
      color: "inherit",
      display: "flex",
      alignItems: "center",
      gap: "0.7rem"
    } }, /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-lead)", color: on ? accent : "var(--c-ink-2)", fontWeight: 700 } }, m.icon), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)" } }, m.label), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)" } }, m.sub)));
  }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: "0.55rem" } }, "SETTLEMENT NETWORK"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.5rem" } }, chains.map((c) => {
    const on = chain === c.id;
    return /* @__PURE__ */ React.createElement("button", { key: c.id, onClick: () => setChain(c.id), style: {
      padding: "0.7rem 0.5rem",
      textAlign: "center",
      background: on ? "rgba(var(--accent-rgb),.12)" : "var(--c-panel-2)",
      border: `1px solid ${on ? accent : "var(--c-line)"}`,
      borderRadius: "var(--r-2)",
      cursor: "pointer",
      color: "inherit"
    } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", fontWeight: 600, color: on ? accent : "var(--c-ink)" } }, c.label), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: "0.2rem" } }, c.sub));
  }))), /* @__PURE__ */ React.createElement(SplitWaterfallBox, { split, accent }), /* @__PURE__ */ React.createElement("div", { style: { padding: "0.75rem 1rem", background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", padding: "0.25rem 0" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)" } }, "Contract Split Principal"), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-body)" } }, pdFmtUSD(subtotal))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", padding: "0.25rem 0" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)" } }, "Network Gas (", chain.toUpperCase(), ")"), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-body)" } }, pdFmtUSD(gas))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", paddingTop: "0.45rem", marginTop: "0.35rem", borderTop: "1px solid var(--c-line)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", fontWeight: 600 } }, "Total Debited"), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-lead)", fontWeight: 700, color: accent } }, pdFmtUSD(total)))));
}
function PdConfirming({ accent, progress, chain, split }) {
  const stages = [
    { at: 0, label: `Signing EIP-712 permit from ${window.CINA?.address || "0xA1c4\u2026f3D2"}` },
    { at: 25, label: `Calling CinaSplitRouter.distribute() on ${chain.toUpperCase()}` },
    { at: 55, label: `Streaming ${pdFmtUSD(split.rows[0]?.usd)} \u2192 Director & ${pdFmtUSD(split.rows[1]?.usd)} \u2192 Investor Pool` },
    { at: 80, label: "Updating wallet balances, pass stakes & library access" }
  ];
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "1.1rem", paddingTop: "1.2rem" } }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "0.8rem 0" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: "3.4rem",
    height: "3.4rem",
    margin: "0 auto",
    borderRadius: "50%",
    border: `2px solid ${accent}`,
    borderTopColor: "transparent",
    animation: "pdspin .9s linear infinite"
  } }), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { marginTop: "0.9rem", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent } }, "EXECUTING ATOMIC SPLIT \xB7 ", Math.min(100, Math.floor(progress)), "%")), stages.map((s, i) => {
    const done = progress > s.at;
    return /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: "0.75rem", opacity: done ? 1 : 0.4 } }, /* @__PURE__ */ React.createElement("span", { style: {
      width: "1.4rem",
      height: "1.4rem",
      borderRadius: "50%",
      background: done ? accent : "var(--c-panel-2)",
      color: done ? "var(--c-on-amber)" : "var(--c-ink-3)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "var(--fs-label)",
      fontWeight: 700,
      flexShrink: 0
    } }, done ? "\u2713" : i + 1), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink)" } }, s.label));
  }), /* @__PURE__ */ React.createElement("style", null, `@keyframes pdspin { from { transform: rotate(0) } to { transform: rotate(360deg) } }`));
}
function PdSuccess({ accent, config, total, txHash, payMethod, chain, settlement, split, onClose }) {
  const rows = settlement?.rows || split.rows;
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "1.1rem" } }, /* @__PURE__ */ React.createElement("div", { style: {
    padding: "1.35rem",
    textAlign: "center",
    background: "var(--c-panel-2)",
    border: `1px solid ${accent}`,
    borderRadius: "var(--r-2)"
  } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".16em", marginBottom: "0.4rem" } }, "\u2713 CHAINED SMART-CONTRACT SETTLED"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)" } }, config.title), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: "0.4rem" } }, "TX ", txHash, " \xB7 ", chain.toUpperCase(), " \xB7 ", payMethod.toUpperCase(), " \xB7 ", pdFmtUSD(total)), settlement?.yourAutoPayoutUSD > 0 && /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { marginTop: "0.65rem", padding: "0.4rem 0.65rem", background: "rgba(106,163,122,.14)", border: "1px solid var(--c-good)", borderRadius: "var(--r-1)", color: "var(--c-good)", fontSize: "var(--fs-label)" } }, "+", pdFmtUSD(settlement.yourAutoPayoutUSD), " USDC AUTO-CREDITED BACK TO YOUR PASS HOLDER WALLET")), /* @__PURE__ */ React.createElement("div", { style: { padding: "0.85rem 1rem", background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".14em", marginBottom: "0.45rem" } }, "ON-CHAIN RECIPIENT SETTLEMENTS"), rows.map((r) => /* @__PURE__ */ React.createElement("div", { key: r.id, style: { display: "flex", justifyContent: "space-between", padding: "0.3rem 0", borderTop: "1px solid var(--c-line)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-2)" } }, r.role, " (", r.pct, "%)"), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-body)", color: "var(--c-good)" } }, "+", pdFmtUSD(r.usd))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.5rem" } }, config.ticketUrl && /* @__PURE__ */ React.createElement("button", { onClick: () => {
    onClose();
    if (typeof navigate === "function") navigate(config.ticketUrl);
  }, style: {
    flex: 1,
    padding: "0.8rem 1rem",
    background: accent,
    color: "var(--c-on-amber)",
    border: "none",
    borderRadius: "var(--r-2)",
    cursor: "pointer",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    fontWeight: 700
  } }, "OPEN SCREENING \u2192"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
    flex: 1,
    padding: "0.8rem 1rem",
    background: "transparent",
    color: "var(--c-ink)",
    border: "1px solid var(--c-line-3)",
    borderRadius: "var(--r-2)",
    cursor: "pointer",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    fontWeight: 600
  } }, "DONE")));
}
(function autoMount() {
  if (typeof document === "undefined") return;
  const ready = () => {
    if (document.getElementById("__pay-drawer-host")) return;
    const host = document.createElement("div");
    host.id = "__pay-drawer-host";
    document.body.appendChild(host);
    if (ReactDOM.createRoot) ReactDOM.createRoot(host).render(/* @__PURE__ */ React.createElement(PayDrawer, null));
    else ReactDOM.render(/* @__PURE__ */ React.createElement(PayDrawer, null), host);
  };
  if (document.readyState === "complete" || document.readyState === "interactive") setTimeout(ready, 25);
  else document.addEventListener("DOMContentLoaded", ready);
})();
window.NFTCheckout = function NFTCheckout({ project, tier, onClose }) {
  const tierObj = typeof tier === "string" ? project.tiers.find((t) => t.id === tier) : tier;
  uePD(() => {
    if (!tierObj) return;
    openPay({
      kind: "nft",
      title: `${tierObj.name} \xB7 ${project.title}`,
      subtitle: project.creator,
      accent: tierObj.color,
      priceUSD: tierObj.priceUSD || tierObj.price || 0,
      qty: 1,
      qtyMax: Math.max(1, (tierObj.count || 1) - (tierObj.sold || 0)),
      image: { kind: project.thumb, color: project.color },
      perks: tierObj.perks || [],
      ticker: project.id,
      ticketUrl: project.filmId ? `/film/${project.filmId}` : null,
      onClose
    });
  }, []);
  return null;
};
window.PayDrawer = PayDrawer;
window.openPay = openPay;

  try { if (typeof usPD !== "undefined") window["usPD"] = usPD; } catch (_) {}
  try { if (typeof uePD !== "undefined") window["uePD"] = uePD; } catch (_) {}
  try { if (typeof PD_GAS_USD !== "undefined") window["PD_GAS_USD"] = PD_GAS_USD; } catch (_) {}
  try { if (typeof CHAIN_SETTLEMENTS_KEY !== "undefined") window["CHAIN_SETTLEMENTS_KEY"] = CHAIN_SETTLEMENTS_KEY; } catch (_) {}
  try { if (typeof CHAIN_USER_KEY !== "undefined") window["CHAIN_USER_KEY"] = CHAIN_USER_KEY; } catch (_) {}
  try { if (typeof pdFmtUSD !== "undefined") window["pdFmtUSD"] = pdFmtUSD; } catch (_) {}
  try { if (typeof pdFmtETH !== "undefined") window["pdFmtETH"] = pdFmtETH; } catch (_) {}
  try { if (typeof pdShortHash !== "undefined") window["pdShortHash"] = pdShortHash; } catch (_) {}
  try { if (typeof _resolveProjectId !== "undefined") window["_resolveProjectId"] = _resolveProjectId; } catch (_) {}
  try { if (typeof _computeSplits !== "undefined") window["_computeSplits"] = _computeSplits; } catch (_) {}
  try { if (typeof _readSettlements !== "undefined") window["_readSettlements"] = _readSettlements; } catch (_) {}
  try { if (typeof _persistUserLedger !== "undefined") window["_persistUserLedger"] = _persistUserLedger; } catch (_) {}
  try { if (typeof _recordChainedSettlement !== "undefined") window["_recordChainedSettlement"] = _recordChainedSettlement; } catch (_) {}
  try { if (typeof CinaChain !== "undefined") window["CinaChain"] = CinaChain; } catch (_) {}
  try { if (typeof useChainLedger !== "undefined") window["useChainLedger"] = useChainLedger; } catch (_) {}
  try { if (typeof ChainedSplitRouterPanel !== "undefined") window["ChainedSplitRouterPanel"] = ChainedSplitRouterPanel; } catch (_) {}
  try { if (typeof _pdSetState !== "undefined") window["_pdSetState"] = _pdSetState; } catch (_) {}
  try { if (typeof openPay !== "undefined") window["openPay"] = openPay; } catch (_) {}
  try { if (typeof PayDrawer !== "undefined") window["PayDrawer"] = PayDrawer; } catch (_) {}
  try { if (typeof PayDrawerInstance !== "undefined") window["PayDrawerInstance"] = PayDrawerInstance; } catch (_) {}
  try { if (typeof PdItemThumb !== "undefined") window["PdItemThumb"] = PdItemThumb; } catch (_) {}
  try { if (typeof SplitWaterfallBox !== "undefined") window["SplitWaterfallBox"] = SplitWaterfallBox; } catch (_) {}
  try { if (typeof PdReview !== "undefined") window["PdReview"] = PdReview; } catch (_) {}
  try { if (typeof PdPay !== "undefined") window["PdPay"] = PdPay; } catch (_) {}
  try { if (typeof PdConfirming !== "undefined") window["PdConfirming"] = PdConfirming; } catch (_) {}
  try { if (typeof PdSuccess !== "undefined") window["PdSuccess"] = PdSuccess; } catch (_) {}
})();

// ── MODULE: nft-page.jsx ──
;(function() {
const { useState: usNP } = React;
function fmtNftUSD(n) {
  if (!n) return "$0";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return "$" + Math.round(n / 1e3) + "k";
  return "$" + Math.round(n).toLocaleString();
}
function fmtNftViews(n) {
  if (typeof n !== "number") return n || "";
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return Math.round(n / 1e3) + "K";
  return String(n);
}
function FinancingMap({ project, daysLeft }) {
  const steps = [
    {
      tag: "1 \xB7 PRIMARY",
      where: "On Watch \u2014 \u201CBack this film\u201D",
      title: "Mint a producer pass",
      body: `Buy a pass straight from the production during the ${daysLeft || "open"}-day mint. Your capital funds the film. Price is fixed by tier.`,
      live: (daysLeft || 0) > 0 ? `${daysLeft} days left to mint` : "Mint closed"
    },
    {
      tag: "2 \xB7 SECONDARY",
      where: "On Producers \u2014 the market",
      title: "Trade it on the market",
      body: "Once minted, passes trade peer-to-peer on the Producers market. Buy in late or sell your stake anytime at the live floor price.",
      live: "Open 24/7 after mint"
    },
    {
      tag: "3 \xB7 ROYALTY",
      where: "Either way you got in",
      title: "Earn the royalty pool",
      body: `Holders split ${project.revShare}% of this film's revenue through Year 5 \u2014 paid pro-rata to your stake, whether you bought primary or secondary.`,
      live: `${project.revShare}% of revenue \xB7 to Y5`,
      amber: true
    }
  ];
  return /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 30 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, "HOW CO-FINANCING WORKS"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-sans)", fontSize: "var(--fs-body)", color: "var(--c-ink-4)" } }, "Three ways money moves on a film \u2014 one pass connects all three.")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden", background: "var(--c-panel)" } }, steps.map((s, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
    padding: "18px 20px",
    borderLeft: i === 0 ? "none" : "1px solid var(--c-line)",
    borderTop: s.amber ? "2px solid var(--c-amber)" : "2px solid transparent",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 9
  } }, i < 2 && /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    right: -9,
    top: "50%",
    transform: "translateY(-50%)",
    width: 18,
    height: 18,
    borderRadius: "50%",
    zIndex: 2,
    background: "var(--c-bg)",
    border: "1px solid var(--c-line-2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--c-ink-3)",
    fontSize: "var(--fs-label)",
    fontFamily: "var(--f-mono)"
  } }, "\u2192"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: s.amber ? "var(--c-amber)" : "var(--c-ink-3)", fontWeight: 700 } }, s.tag), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1.1, letterSpacing: "-0.01em" } }, s.title), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase" } }, s.where), /* @__PURE__ */ React.createElement("p", { style: { margin: "2px 0 0", fontSize: "var(--fs-body)", lineHeight: 1.5, color: "var(--c-ink-2)" } }, s.body), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "auto", paddingTop: 8 } }, /* @__PURE__ */ React.createElement("span", { style: {
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    color: s.amber ? "var(--c-amber)" : "var(--c-ink-3)",
    background: s.amber ? "rgba(var(--accent-rgb),.08)" : "var(--c-panel-2)",
    border: `1px solid ${s.amber ? "rgba(var(--accent-rgb),.3)" : "var(--c-line)"}`,
    borderRadius: "var(--r-1)",
    padding: "4px 8px",
    display: "inline-block"
  } }, s.live))))));
}
function UnifiedNFTPage({ project, film, onBack, navigate: nav, showHolderHub = false }) {
  const [checkout, setCheckout] = usNP(null);
  if (!project) {
    return /* @__PURE__ */ React.createElement("div", { style: { padding: 56, color: "var(--c-ink-2)", fontFamily: "var(--f-sans)" } }, "Project not found.");
  }
  const navTo = nav || ((url) => {
    location.hash = url;
  });
  const pct = Math.min(100, project.raised / project.goal * 100);
  const linkedFilm = film || project.film;
  const kindLabel = (project.kind || linkedFilm?.kind) === "series" ? "SERIES NFT" : "FILM NFT";
  const chain = (project.chain || "Base").toUpperCase();
  const title = linkedFilm?.title || project.title;
  const totalSold = project.tiers.reduce((s, t) => s + t.sold, 0);
  const totalCount = project.tiers.reduce((s, t) => s + t.count, 0);
  const HeartBtn = window.HeartButton;
  const HoldHub = window.HolderHub;
  const FT = window.FrameThumb;
  const heroBg = project.color || tkc("cat-3");
  const heroThumb = project.thumb || project.film?.thumb || linkedFilm?.thumb;
  return /* @__PURE__ */ React.createElement("div", { style: { maxWidth: "var(--w-page)", margin: "0 auto", padding: "22px 32px 96px" } }, onBack && /* @__PURE__ */ React.createElement("button", { onClick: onBack, style: {
    appearance: "none",
    border: 0,
    background: "transparent",
    color: "var(--c-ink-3)",
    cursor: "pointer",
    fontSize: "var(--fs-body)",
    marginBottom: 18,
    padding: 0,
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "var(--f-sans)"
  } }, "\u2190 All projects"), /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: "1.25fr 1fr",
    gap: 32,
    marginBottom: 30,
    paddingBottom: 28,
    borderBottom: "1px solid var(--c-line)"
  } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 } }, /* @__PURE__ */ React.createElement("span", { style: {
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    color: "var(--c-amber)",
    letterSpacing: ".16em",
    padding: "5px 10px",
    background: "rgba(var(--accent-rgb),.08)",
    border: "1px solid rgba(var(--accent-rgb),.35)",
    borderRadius: "var(--r-1)"
  } }, kindLabel, " \xB7 ", chain), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, (project.creator || "").toUpperCase())), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 10 } }, /* @__PURE__ */ React.createElement("h1", { style: {
    flex: 1,
    margin: 0,
    fontFamily: "var(--f-display)",
    fontStyle: "italic",
    fontSize: "var(--fs-display)",
    lineHeight: 0.95,
    letterSpacing: "-0.02em",
    fontWeight: 400,
    textWrap: "balance",
    color: "var(--c-ink)"
  } }, title), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, paddingTop: 10, alignItems: "center" } }, HeartBtn && /* @__PURE__ */ React.createElement(HeartBtn, { projectId: project.id, size: 20 }), window.openBidModal && /* @__PURE__ */ React.createElement("button", { onClick: () => window.openBidModal(project), style: {
    appearance: "none",
    padding: "9px 14px",
    background: "transparent",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-2)",
    color: "var(--c-ink)",
    fontSize: "var(--fs-body)",
    cursor: "pointer",
    fontFamily: "var(--f-sans)"
  } }, "Place bid \u2192"))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginBottom: 18 } }, "by ", project.creator), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "var(--fs-lead)", lineHeight: 1.55, color: "var(--c-ink-2)", margin: "0 0 28px", maxWidth: 580 } }, project.summary), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, maxWidth: 560 } }, [
    { l: "RAISED", v: fmtNftUSD(project.raised), s: `of ${fmtNftUSD(project.goal)}` },
    { l: "BACKERS", v: (project.backers || 0).toLocaleString(), s: "holders" },
    { l: "ENDS IN", v: `${project.daysLeft}d`, s: "primary mint" },
    { l: "REV SHARE", v: `${project.revShare}%`, s: "through Y5", amber: true }
  ].map((s, i) => /* @__PURE__ */ React.createElement("div", { key: i }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 6 } }, s.l), /* @__PURE__ */ React.createElement("div", { style: {
    fontFamily: "var(--f-display)",
    fontStyle: "italic",
    fontSize: "var(--fs-head)",
    lineHeight: 1,
    color: s.amber ? "var(--c-amber)" : "var(--c-ink)",
    fontWeight: 500
  } }, s.v), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-sans)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 5 } }, s.s))))), /* @__PURE__ */ React.createElement("div", { style: {
    aspectRatio: "16/10",
    borderRadius: "var(--r-3)",
    overflow: "hidden",
    background: heroBg,
    position: "relative",
    boxShadow: "0 24px 60px rgba(0,0,0,.4)"
  } }, FT && heroThumb ? /* @__PURE__ */ React.createElement(FT, { kind: heroThumb, usePhoto: true }) : /* @__PURE__ */ React.createElement("div", { style: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(255,255,255,.4)",
    fontFamily: "var(--f-mono)",
    letterSpacing: ".16em",
    fontSize: "var(--fs-label)"
  } }, kindLabel))), /* @__PURE__ */ React.createElement("div", { style: {
    background: "var(--c-panel)",
    border: "1px solid var(--c-line)",
    borderRadius: "var(--r-2)",
    padding: "20px 24px",
    marginBottom: 30
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, "FUNDING PROGRESS"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-amber)", fontWeight: 600 } }, pct.toFixed(1), "%")), /* @__PURE__ */ React.createElement("div", { style: { height: 8, background: "var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden", marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: `${pct}%`,
    height: "100%",
    background: "linear-gradient(90deg, var(--c-amber-d) 0%, var(--c-amber) 100%)",
    boxShadow: "0 0 12px rgba(var(--accent-rgb),.4)"
  } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "var(--fs-body)", color: "var(--c-ink-3)", fontFamily: "var(--f-mono)" } }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink)", fontWeight: 600 } }, fmtNftUSD(project.raised)), " raised"), /* @__PURE__ */ React.createElement("span", null, totalSold.toLocaleString(), " / ", totalCount.toLocaleString(), " stakes minted"), /* @__PURE__ */ React.createElement("span", null, "goal ", fmtNftUSD(project.goal)))), /* @__PURE__ */ React.createElement(FinancingMap, { project, daysLeft: project.daysLeft }), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 36 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, "CHOOSE A TIER"), project.contract && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" } }, "CONTRACT ", project.contract, " \xB7 ", chain)), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 } }, project.tiers.map((t) => {
    const remaining = t.count - t.sold;
    const sold = t.count > 0 ? t.sold / t.count : 0;
    const isProducer = t.id === "producer";
    const isPatron = t.id === "patron";
    return /* @__PURE__ */ React.createElement("div", { key: t.id, style: {
      padding: 22,
      background: isProducer ? "linear-gradient(180deg, rgba(var(--accent-rgb),.08), var(--c-panel) 70%)" : "var(--c-panel)",
      border: `1px solid ${isProducer ? "rgba(var(--accent-rgb),.5)" : isPatron ? "rgba(168,88,56,.35)" : "var(--c-line)"}`,
      borderRadius: "var(--r-3)",
      display: "flex",
      flexDirection: "column",
      gap: 14,
      minHeight: 280
    } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, "TIER"), /* @__PURE__ */ React.createElement("div", { style: {
      fontFamily: "var(--f-display)",
      fontSize: "var(--fs-title)",
      fontWeight: 500,
      color: t.color,
      fontStyle: "italic",
      marginTop: 4,
      lineHeight: 1
    } }, t.name)), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontSize: "var(--fs-title)", fontWeight: 500, color: "var(--c-ink)", lineHeight: 1 } }, "$", (t.priceUSD || 0).toLocaleString()), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 5 } }, t.price ? `${t.price} ETH` : ""))), /* @__PURE__ */ React.createElement("ul", { style: { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 } }, t.perks.map((p, i) => /* @__PURE__ */ React.createElement("li", { key: i, style: { display: "flex", gap: 8, fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.45 } }, /* @__PURE__ */ React.createElement("span", { style: { flexShrink: 0, color: t.color, marginTop: 1 } }, "\u25C6"), /* @__PURE__ */ React.createElement("span", null, p)))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "auto" } }, /* @__PURE__ */ React.createElement("div", { style: { height: 3, borderRadius: 999, background: "var(--c-line)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: `${sold * 100}%`, height: "100%", background: t.color } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 7, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" } }, /* @__PURE__ */ React.createElement("span", null, t.sold.toLocaleString(), " / ", t.count.toLocaleString(), " minted"), /* @__PURE__ */ React.createElement("span", null, remaining.toLocaleString(), " left"))), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCheckout(t),
        disabled: remaining <= 0,
        style: {
          appearance: "none",
          padding: "11px 14px",
          background: remaining <= 0 ? "var(--c-line)" : isProducer ? "var(--c-amber)" : "transparent",
          color: remaining <= 0 ? "var(--c-ink-3)" : isProducer ? tkc("on-amber") : "var(--c-ink)",
          border: isProducer ? "0" : "1px solid var(--c-line-2)",
          borderRadius: "var(--r-2)",
          fontWeight: 600,
          fontSize: "var(--fs-body)",
          cursor: remaining <= 0 ? "not-allowed" : "pointer",
          fontFamily: "var(--f-sans)"
        }
      },
      remaining <= 0 ? "Sold out" : `Buy ${t.name.toLowerCase()} \u2192`
    ));
  }))), (project.timeline?.length || linkedFilm) && /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: linkedFilm && FT ? "1fr 320px" : "1fr",
    gap: 24,
    marginBottom: 12
  } }, /* @__PURE__ */ React.createElement("div", null, project.timeline && project.timeline.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 12 } }, "TIMELINE"), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: 20 } }, project.timeline.map((m, i, arr) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", gap: 14, padding: "11px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--c-line)" : "none" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: m.state === "done" ? "var(--c-good)" : m.state === "live" ? "var(--c-amber)" : m.state === "next" ? "transparent" : "var(--c-panel-2)",
    border: m.state === "next" ? "2px solid var(--c-amber)" : "1px solid var(--c-line-2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: m.state === "done" ? tkc("panel-2") : m.state === "live" ? tkc("on-amber") : m.state === "next" ? "var(--c-amber)" : "var(--c-ink-3)",
    fontSize: "var(--fs-label)",
    fontWeight: 700,
    fontFamily: "var(--f-mono)",
    flexShrink: 0
  } }, m.state === "done" ? "\u2713" : i + 1), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: {
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    color: m.state === "done" ? "var(--c-good)" : m.state === "live" ? "var(--c-blood-l)" : m.state === "next" ? "var(--c-amber)" : "var(--c-ink-3)",
    letterSpacing: ".16em"
  } }, m.d, " ", m.state === "live" && "\xB7 LIVE NOW", " ", m.state === "next" && "\xB7 NEXT"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink)", marginTop: 3 } }, m.label))))))), linkedFilm && FT && /* @__PURE__ */ React.createElement("aside", null, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => navTo(linkedFilm.kind === "series" ? `/series/${linkedFilm.id}` : `/film/${linkedFilm.id}`),
      style: {
        appearance: "none",
        width: "100%",
        padding: 14,
        background: "var(--c-panel)",
        border: "1px solid var(--c-line)",
        borderRadius: "var(--r-2)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        textAlign: "left"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { aspectRatio: "16/9", borderRadius: "var(--r-2)", overflow: "hidden", background: linkedFilm.color } }, /* @__PURE__ */ React.createElement(FT, { kind: linkedFilm.thumb, usePhoto: true })),
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 6 } }, "WATCH ON CINA"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" } }, linkedFilm.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 4 } }, linkedFilm.views ? `${fmtNftViews(linkedFilm.views)} viewers` : "", linkedFilm.rating ? ` \xB7 \u2605 ${linkedFilm.rating}` : ""))
  ))), showHolderHub && !project.synthetic && HoldHub && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 36, paddingTop: 26, borderTop: "1px solid var(--c-line)" } }, /* @__PURE__ */ React.createElement("div", { className: "holder-surface", style: { borderRadius: "var(--r-3)", overflow: "hidden", margin: "0 -32px" } }, /* @__PURE__ */ React.createElement(HoldHub, { initialProjectId: project.id }))), checkout && window.NFTCheckout && /* @__PURE__ */ React.createElement(NFTCheckout, { project, tier: checkout, onClose: () => setCheckout(null) }));
}
Object.assign(window, { UnifiedNFTPage, FinancingMap, fmtNftUSD });

  try { if (typeof usNP !== "undefined") window["usNP"] = usNP; } catch (_) {}
  try { if (typeof fmtNftUSD !== "undefined") window["fmtNftUSD"] = fmtNftUSD; } catch (_) {}
  try { if (typeof fmtNftViews !== "undefined") window["fmtNftViews"] = fmtNftViews; } catch (_) {}
  try { if (typeof FinancingMap !== "undefined") window["FinancingMap"] = FinancingMap; } catch (_) {}
  try { if (typeof UnifiedNFTPage !== "undefined") window["UnifiedNFTPage"] = UnifiedNFTPage; } catch (_) {}
})();

// ── MODULE: watch-auction.jsx ──
;(function() {
const { useState: usAu, useEffect: ueAu, useMemo: umAu, useRef: urAu } = React;
function genAuctions() {
  const _np = typeof NFT_PROJECTS !== "undefined" ? NFT_PROJECTS : {};
  const projects = (Array.isArray(_np) ? _np : Object.values(_np)).slice(0, 8);
  const sellers = ["yo.eth", "rena_ko", "ash.404", "park_dr", "june_a", "tao_reng", "soren_v", "miradawn", "kyle.b", "void_91"];
  const photoThumbs = ["darkroom-wide", "voss-enter", "darkroom-est", "fence", "the-photo", "moss"];
  const pickThumb = (p) => {
    if (p.thumb) return p.thumb;
    const seed = (p.id || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return photoThumbs[seed % photoThumbs.length];
  };
  const list = [];
  let n = 0;
  projects.forEach((p, i) => {
    [
      { tier: "Director's Cut", basePrice: 12, count: 2 },
      { tier: "Frame", basePrice: 3.4, count: 4 },
      { tier: "Audience", basePrice: 0.42, count: 6 }
    ].forEach((t) => {
      for (let k = 0; k < t.count; k++) {
        n++;
        const drift = Math.sin(n * 0.7) * 0.4 + 1;
        const top = +(t.basePrice * drift * (1 + (n * 9301 + 49297) % 233280 / 233280 * 0.6)).toFixed(3);
        const reserve = +(top * 0.7).toFixed(3);
        const bin = +(top * 1.4).toFixed(3);
        list.push({
          id: `auc_${p.id}_${t.tier.replace(/\s/g, "")}_${k}`,
          projectId: p.id,
          projectTitle: p.title,
          creator: p.creator,
          color: p.color || tkc("cat-3"),
          thumb: pickThumb(p),
          edition: `${(i * 9 + k + 1).toString().padStart(3, "0")} / ${p.editions || 100}`,
          tier: t.tier,
          tierKey: t.tier.toLowerCase().replace(/\s/g, "-"),
          seller: sellers[(n + i) % sellers.length],
          reservePrice: reserve,
          currentBid: top,
          buyItNow: bin,
          bidCount: 3 + n % 9,
          endsInH: 1 + n * 17 % 96,
          royalty: 8,
          synopsis: p.synopsis || "Stake in an in-production Cina film. Holders earn from box-office, premiere access, and on-set perks."
        });
      }
    });
  });
  if (window.pbBranchedLots) list.push(...window.pbBranchedLots());
  return list;
}
const AUCTIONS = genAuctions();
const HAS_BRANCHED_LOTS = AUCTIONS.some((a) => a.branched);
function AuctionMarketPage() {
  const [filter, setFilter] = usAu("all");
  const [sort, setSort] = usAu("ending");
  const filtered = umAu(() => {
    let list = AUCTIONS;
    if (filter === "branched") list = list.filter((a) => a.branched);
    else if (filter !== "all") list = list.filter((a) => a.tierKey === filter);
    if (sort === "ending") list = [...list].sort((a, b) => a.endsInH - b.endsInH);
    if (sort === "price-low") list = [...list].sort((a, b) => a.currentBid - b.currentBid);
    if (sort === "price-high") list = [...list].sort((a, b) => b.currentBid - a.currentBid);
    if (sort === "bids") list = [...list].sort((a, b) => b.bidCount - a.bidCount);
    return list;
  }, [filter, sort]);
  const tvl = AUCTIONS.reduce((s, a) => s + a.currentBid, 0);
  const closingSoon = AUCTIONS.filter((a) => a.endsInH < 6).length;
  return /* @__PURE__ */ React.createElement("div", { style: { padding: "32px var(--gutter) 80px", maxWidth: "var(--w-page)", margin: "0 auto" } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 28 } }, /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" } }, "SECONDARY MARKET \xB7 LIVE"), /* @__PURE__ */ React.createElement("h1", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-display)", fontWeight: 400, letterSpacing: "-0.02em", margin: "8px 0 8px", lineHeight: 1.05 } }, "The auction floor."), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", maxWidth: 580, lineHeight: 1.5, margin: 0 } }, "Cina holders auctioning their stake to new investors. Every resale pays the original director an 8% royalty.")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, marginBottom: 28, background: "var(--c-line)" } }, [
    ["LIVE AUCTIONS", AUCTIONS.length, tkc("good")],
    ["VOLUME LOCKED", `${tvl.toFixed(1)} ETH`, "var(--c-amber)"],
    ["CLOSING <6H", closingSoon, "var(--c-amber)"],
    ["DIRECTOR ROYALTIES", "8%", "var(--c-ink)"]
  ].map(([k, v, c], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { background: "var(--c-panel)", padding: "18px 22px" } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 8 } }, k), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, color: c, letterSpacing: "-0.01em" } }, v)))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 16, marginBottom: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4 } }, [["all", "All auctions"], ["directors-cut", "Director's Cut"], ["frame", "Frame"], ["audience", "Audience"], ...HAS_BRANCHED_LOTS ? [["branched", "Branched rights"], ["canonical-cut", "Canonical cuts"]] : []].map(([k, l]) => /* @__PURE__ */ React.createElement("button", { key: k, onClick: () => setFilter(k), style: {
    padding: "8px 16px",
    fontSize: "var(--fs-body)",
    background: filter === k ? "var(--c-amber)" : "transparent",
    color: filter === k ? tkc("on-amber") : "var(--c-ink-2)",
    border: `1px solid ${filter === k ? "var(--c-amber)" : "var(--c-line-2)"}`,
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: filter === k ? 600 : 400
  } }, l))), /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" } }, "SORT"), /* @__PURE__ */ React.createElement("select", { value: sort, onChange: (e) => setSort(e.target.value), style: {
    padding: "8px 12px",
    fontSize: "var(--fs-body)",
    background: "transparent",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-2)",
    color: "var(--c-ink-2)",
    fontFamily: "var(--f-sans)",
    cursor: "pointer"
  } }, /* @__PURE__ */ React.createElement("option", { value: "ending" }, "Ending soon"), /* @__PURE__ */ React.createElement("option", { value: "price-low" }, "Price \xB7 low to high"), /* @__PURE__ */ React.createElement("option", { value: "price-high" }, "Price \xB7 high to low"), /* @__PURE__ */ React.createElement("option", { value: "bids" }, "Most active"))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "30px 18px" } }, filtered.map((a) => /* @__PURE__ */ React.createElement(AuctionCard, { key: a.id, auction: a }))));
}
function AuctionCard({ auction }) {
  const ending = auction.endsInH < 6;
  const [watch, setWatch] = usAu(false);
  const [hover, setHover] = usAu(false);
  const pct = Math.min(100, Math.round(auction.currentBid / auction.buyItNow * 100));
  const chip = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 9px",
    borderRadius: "var(--r-2)",
    background: "rgba(8,8,10,.72)",
    backdropFilter: "blur(6px)",
    color: tkc("ink"),
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    border: "1px solid rgba(255,255,255,.08)",
    textTransform: "uppercase",
    whiteSpace: "nowrap"
  };
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      role: "button",
      tabIndex: 0,
      onClick: () => navigate(`/auction/${auction.id}`),
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/auction/${auction.id}`);
        }
      },
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      style: { display: "flex", flexDirection: "column", cursor: "pointer", color: "inherit", textAlign: "left" }
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      aspectRatio: "16/10",
      borderRadius: "var(--r-2)",
      overflow: "hidden",
      position: "relative",
      background: `linear-gradient(135deg, ${auction.color} 0%, ${tkc("black")} 100%)`,
      border: `1px solid ${hover ? "var(--c-line-3)" : "var(--c-line)"}`,
      transition: "border-color .15s ease"
    } }, window.FrameThumb && auction.thumb ? /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, transform: hover ? "scale(1.03)" : "scale(1)", transition: "transform .35s ease" } }, /* @__PURE__ */ React.createElement(FrameThumb, { kind: auction.thumb, usePhoto: true })) : null, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.35), transparent 40%)" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 10, left: 10, display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: chip }, /* @__PURE__ */ React.createElement("span", { style: { width: 7, height: 7, borderRadius: "50%", background: auction.color } }), auction.tier), /* @__PURE__ */ React.createElement("span", { style: { ...chip, ...ending ? { background: "var(--c-blood)", border: "none", color: tkc("white") } : {} } }, ending ? "\u25CF ENDING" : `${auction.endsInH}H LEFT`), auction.branched && /* @__PURE__ */ React.createElement("span", { style: { ...chip, background: "rgba(201,85,72,.85)", border: "none", color: tkc("white"), gap: 5 } }, window.PbBranchGlyph ? /* @__PURE__ */ React.createElement(window.PbBranchGlyph, { size: 10, color: tkc("white"), dim: "rgba(255,255,255,.6)" }) : null, "Branched")), /* @__PURE__ */ React.createElement(
      "button",
      {
        title: watch ? "Remove from watchlist" : "Add to watchlist",
        onClick: (e) => {
          e.stopPropagation();
          setWatch((w) => !w);
          if (window.toast) window.toast({ title: watch ? "REMOVED" : "WATCHING", text: `${auction.projectTitle} \xB7 ${auction.tier} ${auction.edition}`, kind: "good" });
        },
        style: {
          position: "absolute",
          top: 10,
          right: 10,
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: "rgba(8,8,10,.72)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,.12)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: watch ? "var(--c-amber)" : tkc("ink")
        }
      },
      /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: watch ? "currentColor" : "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" }))
    )),
    /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.15, marginTop: 12, color: hover ? "var(--c-amber)" : "var(--c-ink)", transition: "color .15s ease" } }, auction.projectTitle),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 3 } }, auction.creator),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 14 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" } }, "HIGH BID"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, lineHeight: 1.05, letterSpacing: "-0.01em", color: "var(--c-amber)", marginTop: 3 } }, auction.currentBid, " ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", fontStyle: "normal", color: "var(--c-ink-3)" } }, "ETH"))), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" } }, "BUY NOW"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, lineHeight: 1.1, color: "var(--c-ink)", marginTop: 3 } }, auction.buyItNow, " ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", fontStyle: "normal", color: "var(--c-ink-3)" } }, "ETH")))),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 12, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink)", fontWeight: 700 } }, auction.bidCount, " bids"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-3)" } }, "edition ", auction.edition)),
    /* @__PURE__ */ React.createElement("div", { style: { height: 3, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden", marginTop: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { width: `${pct}%`, height: "100%", background: "var(--c-amber)" } })),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em", color: "var(--c-ink-3)" } }, /* @__PURE__ */ React.createElement("span", null, "seller \xB7 ", auction.seller), /* @__PURE__ */ React.createElement("span", null, auction.royalty, "% royalty"))
  );
}
function AuctionDetailPage({ auctionId }) {
  const auction = AUCTIONS.find((a) => a.id === auctionId) || AUCTIONS[0];
  const [bid, setBid] = usAu(+(auction.currentBid * 1.05).toFixed(3));
  const [bids, setBids] = usAu(() => synthBids(auction));
  const [ph, setPh] = usAu(false);
  const place = () => {
    if (bid <= auction.currentBid) {
      toast(`Bid must exceed ${auction.currentBid} ETH`);
      return;
    }
    setBids((b) => [{ user: "yo.eth", amount: bid, when: "just now", you: true }, ...b]);
    auction.currentBid = bid;
    auction.bidCount++;
    setBid(+(bid * 1.05).toFixed(3));
    setPh(false);
    toast(`Bid placed \xB7 ${bid} ETH`);
  };
  const buyNow = () => {
    const usd = Math.round(auction.buyItNow * 3400);
    if (window.openPay) {
      window.openPay({
        kind: "nft",
        title: auction.projectTitle,
        subtitle: `${auction.tier} \xB7 Edition ${auction.edition}`,
        accent: tkc("amber"),
        priceUSD: usd,
        priceNote: `${auction.buyItNow} ETH \xB7 buy it now`,
        image: { kind: auction.thumb, color: auction.color },
        perks: tierPerks(auction.tier).map((p) => p.title),
        onConfirm: () => {
          toast(`Owned \xB7 ${auction.projectTitle} ${auction.edition}`);
        }
      });
    } else {
      toast(`Bought \xB7 ${auction.buyItNow} ETH`);
    }
  };
  return /* @__PURE__ */ React.createElement("div", { style: { maxWidth: "var(--w-page)", margin: "0 auto", padding: "24px var(--gutter) 80px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", marginBottom: 20, fontSize: "var(--fs-label)", color: "var(--c-ink-3)" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => navigate("/auctions"), style: { background: "transparent", border: "none", color: "var(--c-ink-3)", cursor: "pointer", fontSize: "var(--fs-label)" } }, "Auctions"), /* @__PURE__ */ React.createElement("span", null, "/"), /* @__PURE__ */ React.createElement("span", null, auction.tier), /* @__PURE__ */ React.createElement("span", null, "/"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", color: "var(--c-ink-2)" } }, auction.edition)), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 36, alignItems: "start" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { aspectRatio: "4/5", background: `linear-gradient(135deg, ${auction.color} 0%, ${tkc("black")} 100%)`, padding: 24, position: "relative", marginBottom: 20, overflow: "hidden" } }, window.FrameThumb && auction.thumb ? /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0 } }, /* @__PURE__ */ React.createElement(FrameThumb, { kind: auction.thumb, usePhoto: true })) : null, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.9) 0%, rgba(0,0,0,.12) 50%, rgba(0,0,0,.5) 100%)" } }), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { position: "relative", fontSize: "var(--fs-label)", color: tkc("white"), opacity: 0.7, letterSpacing: ".16em" } }, "EDITION ", auction.edition), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 24, bottom: 24, color: tkc("white") } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", opacity: 0.6 } }, auction.tier.toUpperCase()), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-display)", fontWeight: 400, lineHeight: 0.95, letterSpacing: "-0.01em" } }, auction.projectTitle))), /* @__PURE__ */ React.createElement("div", { style: { borderTop: "1px solid var(--c-line)", paddingTop: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 10 } }, "WHAT YOU GET"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, tierPerks(auction.tier).map((p, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { padding: "10px 12px", background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 500 } }, p.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2 } }, p.desc)))))), /* @__PURE__ */ React.createElement("div", { style: { position: "sticky", top: 80 } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" } }, "AUCTION \xB7 ", auction.tier.toUpperCase()), /* @__PURE__ */ React.createElement("h1", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, letterSpacing: "-0.02em", margin: "6px 0 4px", lineHeight: 1 } }, auction.projectTitle), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)" } }, "by ", auction.creator, " \xB7 sold by ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--c-ink-2)" } }, auction.seller))), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 22, display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" } }, "CURRENT HIGH BID"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-display)", fontWeight: 400, lineHeight: 1, letterSpacing: "-0.02em", marginTop: 4 } }, auction.currentBid, " ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-lead)", color: "var(--c-ink-3)", fontFamily: "var(--f-mono)" } }, "ETH")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2, fontFamily: "var(--f-mono)" } }, "~ $", (auction.currentBid * 3400).toLocaleString(void 0, { maximumFractionDigits: 0 }))), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" } }, "ENDS IN"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 400, color: auction.endsInH < 6 ? "var(--c-blood)" : "var(--c-ink)", marginTop: 4, fontVariantNumeric: "tabular-nums" } }, Math.floor(auction.endsInH), "h ", Math.floor(auction.endsInH % 1 * 60), "m"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", paddingTop: 8, borderTop: "1px solid var(--c-line)" } }, /* @__PURE__ */ React.createElement("span", null, "Reserve \xB7 ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-2)", fontFamily: "var(--f-mono)" } }, auction.reservePrice, " ETH")), /* @__PURE__ */ React.createElement("span", null, auction.bidCount, " bids"), /* @__PURE__ */ React.createElement("span", null, "Royalty \xB7 ", auction.royalty, "% to director")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("input", { type: "number", value: bid, step: 0.01, onChange: (e) => setBid(parseFloat(e.target.value) || 0), style: {
    flex: 1,
    background: "var(--c-bg)",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-2)",
    padding: "12px 14px",
    color: "var(--c-ink)",
    fontSize: "var(--fs-lead)",
    fontFamily: "var(--f-mono)"
  } }), /* @__PURE__ */ React.createElement("button", { onClick: () => setPh(true), style: { padding: "0 22px", background: "var(--c-amber)", border: "none", color: "var(--c-on-amber)", borderRadius: "var(--r-2)", fontWeight: 600, fontSize: "var(--fs-body)", cursor: "pointer" } }, "Place bid")), /* @__PURE__ */ React.createElement("button", { onClick: buyNow, style: { padding: "12px 14px", background: "transparent", border: "1px solid var(--c-amber)", color: "var(--c-amber)", borderRadius: "var(--r-2)", fontWeight: 600, fontSize: "var(--fs-body)", cursor: "pointer" } }, "Buy it now \xB7 ", auction.buyItNow, " ETH"))), typeof window.BranchedLotContext === "function" && auction.branched && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 20 } }, /* @__PURE__ */ React.createElement(window.BranchedLotContext, { auction })), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 20 } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 10 } }, "BID HISTORY"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" } }, bids.map((b, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", padding: "9px 14px", background: i % 2 ? "transparent" : "var(--c-panel)", borderBottom: i < bids.length - 1 ? "1px solid var(--c-line)" : "none" } }, /* @__PURE__ */ React.createElement("span", { style: { flex: 1, fontSize: "var(--fs-body)", color: b.you ? "var(--c-amber)" : "var(--c-ink-2)", fontWeight: b.you ? 600 : 400 } }, b.user, " ", b.you && "(you)"), /* @__PURE__ */ React.createElement("span", { style: { width: 100, fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)" } }, b.amount, " ETH"), /* @__PURE__ */ React.createElement("span", { style: { width: 80, textAlign: "right", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", fontFamily: "var(--f-mono)" } }, b.when))))))), ph && /* @__PURE__ */ React.createElement("div", { onClick: () => setPh(false), style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(20px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 } }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: { width: 460, background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 28, display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" } }, "CONFIRM BID"), /* @__PURE__ */ React.createElement("h2", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, margin: "4px 0 6px" } }, bid, " ETH"), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 14, display: "flex", flexDirection: "column", gap: 6, fontSize: "var(--fs-body)" } }, /* @__PURE__ */ React.createElement(Row, { k: "Item", v: `${auction.projectTitle} \xB7 ${auction.tier} #${auction.edition}` }), /* @__PURE__ */ React.createElement(Row, { k: "Bid", v: `${bid} ETH` }), /* @__PURE__ */ React.createElement(Row, { k: "Director royalty", v: `${(bid * auction.royalty / 100).toFixed(3)} ETH (${auction.royalty}%)` }), /* @__PURE__ */ React.createElement(Row, { k: "Platform fee", v: `${(bid * 0.025).toFixed(3)} ETH (2.5%)` }), /* @__PURE__ */ React.createElement(Row, { k: "Seller receives", v: `${(bid * (1 - 0.025 - auction.royalty / 100)).toFixed(3)} ETH`, bold: true })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", lineHeight: 1.5 } }, "Funds are held in escrow until the auction ends. If outbid, you'll be refunded automatically."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setPh(false), style: { padding: "10px 16px", background: "transparent", border: "1px solid var(--c-line-2)", color: "var(--c-ink-2)", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", cursor: "pointer" } }, "Cancel"), /* @__PURE__ */ React.createElement("button", { onClick: place, style: { padding: "10px 22px", background: "var(--c-amber)", border: "none", color: "var(--c-on-amber)", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", fontWeight: 600, cursor: "pointer" } }, "Confirm bid")))));
}
function Row({ k, v, bold }) {
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", padding: "2px 0" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-3)" } }, k), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", color: "var(--c-ink)", fontWeight: bold ? 600 : 400 } }, v));
}
function synthBids(a) {
  const sellers = ["rena_ko", "ash.404", "park_dr", "june_a", "tao_reng", "void_91", "kyle.b"];
  const out = [];
  let p = a.currentBid;
  for (let i = 0; i < 8; i++) {
    out.push({ user: sellers[i % sellers.length], amount: +p.toFixed(3), when: `${i + 1}h ago` });
    p = p / (1 + Math.random() * 0.1);
  }
  return out;
}
function tierPerks(tier) {
  if (tier === "Director's Cut") return [
    { title: "Director's commentary cut", desc: "Annotated frame-by-frame edit" },
    { title: "On-set voting", desc: "Cast and DP decisions" },
    { title: "Premiere \xB7 top 50", desc: "Front row, named seat" },
    { title: "1.4% box office", desc: "Lifetime, royalty stream" }
  ];
  if (tier === "Frame") return [
    { title: "Signed frame NFT", desc: "Director-selected still" },
    { title: "Shoot day livestream", desc: "Day 1 of production" },
    { title: "Premiere lobby access", desc: "Standard seat" },
    { title: "0.4% box office", desc: "Lifetime stream" }
  ];
  return [
    { title: "Day-of-drop access", desc: "Watch when the film opens" },
    { title: "Edition badge on profile", desc: "Shows on Cina forever" },
    { title: "Director Q&A drop", desc: "Live, holders only" },
    { title: "0.05% box office", desc: "Lifetime stream" }
  ];
}
function CreateAuctionOverlay({ holding, onClose }) {
  const [step, setStep] = usAu(0);
  const [reserve, setReserve] = usAu(holding?.basis ? +(holding.basis * 0.9).toFixed(3) : 0.3);
  const [bin, setBin] = usAu(holding?.basis ? +(holding.basis * 1.6).toFixed(3) : 0.8);
  const [duration, setDuration] = usAu(72);
  const list = () => {
    setStep(2);
    setTimeout(() => {
      onClose();
      toast("Auction listed \xB7 live in 60s");
    }, 1500);
  };
  return /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(20px)", zIndex: 250, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 } }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: { width: 540, background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 32, display: "flex", flexDirection: "column", gap: 22 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" } }, "SELL ON THE FLOOR"), /* @__PURE__ */ React.createElement("h2", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 500, margin: "6px 0 4px" } }, "List your stake"), holding && /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)" } }, holding.title, " \xB7 ", holding.tier, " \xB7 #", holding.edition || "###")), step === 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Field, { label: "RESERVE PRICE" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center" } }, /* @__PURE__ */ React.createElement("input", { type: "number", value: reserve, step: 0.01, onChange: (e) => setReserve(parseFloat(e.target.value) || 0), style: inpAu }), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)" } }, "ETH")), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 2 } }, "The auction won't sell below this. ~ $", (reserve * 3400).toLocaleString(void 0, { maximumFractionDigits: 0 }))), /* @__PURE__ */ React.createElement(Field, { label: "BUY IT NOW PRICE" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center" } }, /* @__PURE__ */ React.createElement("input", { type: "number", value: bin, step: 0.01, onChange: (e) => setBin(parseFloat(e.target.value) || 0), style: inpAu }), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)" } }, "ETH")), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 2 } }, "Sale closes instantly at this price.")), /* @__PURE__ */ React.createElement(Field, { label: "DURATION" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, [24, 72, 168].map((h) => /* @__PURE__ */ React.createElement("button", { key: h, onClick: () => setDuration(h), style: {
    flex: 1,
    padding: "10px 8px",
    fontSize: "var(--fs-body)",
    background: duration === h ? "var(--c-amber)" : "transparent",
    color: duration === h ? tkc("on-amber") : "var(--c-ink-2)",
    border: `1px solid ${duration === h ? "var(--c-amber)" : "var(--c-line-2)"}`,
    borderRadius: "var(--r-2)",
    cursor: "pointer",
    fontWeight: duration === h ? 600 : 400
  } }, h === 24 ? "1 day" : h === 72 ? "3 days" : "1 week")))), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 12, fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5 } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 6 } }, "FEES IF SOLD AT BUY-NOW"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", null, "Director royalty (8%)"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)" } }, (bin * 0.08).toFixed(3), " ETH")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", null, "Platform fee (2.5%)"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)" } }, (bin * 0.025).toFixed(3), " ETH")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", color: "var(--c-ink)", paddingTop: 6, borderTop: "1px solid var(--c-line)", marginTop: 6 } }, /* @__PURE__ */ React.createElement("span", null, "You receive"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontWeight: 600 } }, (bin * 0.895).toFixed(3), " ETH"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: btnGhostAu, "aria-label": "Close", title: "Close" }, "Cancel"), /* @__PURE__ */ React.createElement("button", { onClick: () => setStep(1), disabled: reserve >= bin || reserve <= 0, style: { ...btnGhostAu, background: "var(--c-amber)", border: "none", color: "var(--c-on-amber)", fontWeight: 600, opacity: reserve >= bin || reserve <= 0 ? 0.4 : 1 } }, "Review"))), step === 1 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 18, display: "flex", flexDirection: "column", gap: 8, fontSize: "var(--fs-body)" } }, /* @__PURE__ */ React.createElement(Row, { k: "Item", v: holding?.title || "Edition" }), /* @__PURE__ */ React.createElement(Row, { k: "Reserve", v: `${reserve} ETH` }), /* @__PURE__ */ React.createElement(Row, { k: "Buy now", v: `${bin} ETH` }), /* @__PURE__ */ React.createElement(Row, { k: "Duration", v: `${duration} hours` })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", lineHeight: 1.5 } }, "Once listed, your stake is held in escrow and can't be sold elsewhere. You can cancel any time before the first bid."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setStep(0), style: btnGhostAu }, "\u2190 Edit"), /* @__PURE__ */ React.createElement("button", { onClick: list, style: { ...btnGhostAu, background: "var(--c-amber)", border: "none", color: "var(--c-on-amber)", fontWeight: 600 } }, "List auction"))), step === 2 && /* @__PURE__ */ React.createElement("div", { style: { padding: "32px 0", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 64, height: 64, margin: "0 auto 18px", borderRadius: "50%", background: "rgba(var(--accent-rgb),.12)", border: "1px solid var(--c-amber)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-title)" } }, "\u2726"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500 } }, "Listed."), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 8 } }, "Goes live on the auction floor in 60 seconds."))));
}
function DirectorMintPage({ filmId }) {
  const film = typeof getFilm === "function" && getFilm(filmId) || (CATALOG ? CATALOG[0] : { id: "ll", title: "The Long Look", creator: "Voss" });
  const [step, setStep] = usAu(0);
  const [mint, setMint] = usAu({
    title: film.title,
    totalRaise: 60,
    // ETH
    royalty: 8,
    // % on secondary
    splits: { director: 70, holders: 22, cina: 5, charity: 3 },
    tiers: [
      { name: "Director's Cut", price: 8, supply: 5, perks: ["Commentary cut", "On-set voting", "Premiere top 50", "1.4% box office"] },
      { name: "Frame", price: 2.4, supply: 24, perks: ["Signed frame NFT", "Shoot livestream", "Premiere lobby", "0.4% box office"] },
      { name: "Audience", price: 0.32, supply: 200, perks: ["Day-of-drop access", "Edition badge", "Holder-only Q&A", "0.05% box office"] }
    ],
    governance: ["color-grade", "ending", "poster"],
    presaleHours: 24,
    closeDays: 14
  });
  const setSplit = (k, v) => setMint((m) => ({ ...m, splits: { ...m.splits, [k]: parseInt(v) } }));
  const splitsTotal = Object.values(mint.splits).reduce((s, v) => s + v, 0);
  const totalSupply = mint.tiers.reduce((s, t) => s + t.supply, 0);
  const projectedRaise = mint.tiers.reduce((s, t) => s + t.price * t.supply, 0);
  const updateTier = (i, patch) => setMint((m) => ({ ...m, tiers: m.tiers.map((t, j) => j === i ? { ...t, ...patch } : t) }));
  return /* @__PURE__ */ React.createElement("div", { style: { padding: "0 var(--gutter) 96px", maxWidth: "var(--w-page)", margin: "0 auto" } }, /* @__PURE__ */ React.createElement(PmMasthead, { bare: true, index: "Director", path: "New collection", count: `Step ${step + 1} of 4`, title: /* @__PURE__ */ React.createElement(React.Fragment, null, "Mint ", mint.title), lede: "Set the economic terms, holder perks and on-chain governance. Cina deploys the contract once you approve." }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 0, marginBottom: 28, borderBottom: "1px solid var(--c-line)" } }, ["Economics", "Tiers", "Governance", "Review & mint"].map((label, i) => /* @__PURE__ */ React.createElement("button", { key: i, onClick: () => setStep(i), style: {
    flex: 1,
    padding: "14px 12px",
    background: "transparent",
    border: "none",
    borderRadius: 0,
    borderBottom: `2px solid ${step === i ? "var(--c-amber)" : "transparent"}`,
    color: step >= i ? "var(--c-ink)" : "var(--c-ink-4)",
    fontSize: "var(--fs-body)",
    cursor: "pointer",
    fontWeight: step === i ? 600 : 400,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  } }, /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: step === i ? "var(--c-amber)" : "var(--c-ink-4)" } }, String(i + 1).padStart(2, "0")), label))), step === 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 18 } }, /* @__PURE__ */ React.createElement(Field, { label: "COLLECTION TITLE" }, /* @__PURE__ */ React.createElement("input", { value: mint.title, onChange: (e) => setMint((m) => ({ ...m, title: e.target.value })), style: inpAu })), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 14 } }, "REVENUE SPLIT \xB7 NET INCOME FROM FILM"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement(SplitRow, { label: "Director", value: mint.splits.director, onChange: (v) => setSplit("director", v), accent: "var(--c-amber)" }), /* @__PURE__ */ React.createElement(SplitRow, { label: "Holders pool", value: mint.splits.holders, onChange: (v) => setSplit("holders", v), accent: tkc("good") }), /* @__PURE__ */ React.createElement(SplitRow, { label: "Cina platform", value: mint.splits.cina, onChange: (v) => setSplit("cina", v), accent: "var(--c-ink-3)" }), /* @__PURE__ */ React.createElement(SplitRow, { label: "Charity", value: mint.splits.charity, onChange: (v) => setSplit("charity", v), accent: tkc("cat-2") })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", paddingTop: 12, marginTop: 12, borderTop: "1px solid var(--c-line)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)" } }, "Total"), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-body)", color: splitsTotal === 100 ? tkc("good") : "var(--c-blood)", fontWeight: 600 } }, splitsTotal, "%"))), /* @__PURE__ */ React.createElement(Field, { label: "SECONDARY ROYALTY" }, /* @__PURE__ */ React.createElement(Slider, { min: 0, max: 15, step: 0.5, value: mint.royalty, onChange: (v) => setMint((m) => ({ ...m, royalty: v })), fmt: (v) => v + "%" }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 4 } }, "You earn this on every secondary auction, forever."))), /* @__PURE__ */ React.createElement("div", { style: { position: "sticky", top: 80, alignSelf: "start" } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 12 } }, "PROJECTIONS"), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 22 } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--c-line)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginBottom: 4 } }, "Mint sells out"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, lineHeight: 1, letterSpacing: "-0.02em" } }, projectedRaise.toFixed(1), " ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-lead)", fontFamily: "var(--f-mono)", color: "var(--c-ink-3)" } }, "ETH")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-4)", marginTop: 4, fontFamily: "var(--f-mono)" } }, "~ $", (projectedRaise * 3400).toLocaleString())), /* @__PURE__ */ React.createElement(SplitBar, { splits: mint.splits }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 14, lineHeight: 1.6 } }, "If ", /* @__PURE__ */ React.createElement("em", null, mint.title), " earns 1M USD post-launch:", /* @__PURE__ */ React.createElement("ul", { style: { margin: "6px 0 0", paddingLeft: 18 } }, /* @__PURE__ */ React.createElement("li", null, "You take $", (1e6 * mint.splits.director / 100).toLocaleString()), /* @__PURE__ */ React.createElement("li", null, totalSupply, " holders share $", (1e6 * mint.splits.holders / 100).toLocaleString())))))), step === 1 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, mint.tiers.map((t, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 22 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 } }, /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" } }, "TIER ", String(i + 1).padStart(2, "0")), /* @__PURE__ */ React.createElement("input", { value: t.name, onChange: (e) => updateTier(i, { name: e.target.value }), style: { flex: 1, background: "transparent", border: "none", color: "var(--c-ink)", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500 } })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 18, alignItems: "start" } }, /* @__PURE__ */ React.createElement(Field, { label: "PRICE" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center" } }, /* @__PURE__ */ React.createElement("input", { type: "number", step: 0.01, value: t.price, onChange: (e) => updateTier(i, { price: parseFloat(e.target.value) || 0 }), style: inpAu }), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)" } }, "ETH"))), /* @__PURE__ */ React.createElement(Field, { label: "SUPPLY" }, /* @__PURE__ */ React.createElement("input", { type: "number", value: t.supply, onChange: (e) => updateTier(i, { supply: parseInt(e.target.value) || 0 }), style: inpAu }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 2 } }, (t.price * t.supply).toFixed(2), " ETH from this tier")), /* @__PURE__ */ React.createElement(Field, { label: "PERKS" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, t.perks.map((p, j) => /* @__PURE__ */ React.createElement("div", { key: j, style: { display: "flex", gap: 4 } }, /* @__PURE__ */ React.createElement("input", { value: p, onChange: (e) => {
    const next = [...t.perks];
    next[j] = e.target.value;
    updateTier(i, { perks: next });
  }, style: inpAu }), /* @__PURE__ */ React.createElement("button", { onClick: () => updateTier(i, { perks: t.perks.filter((_, k) => k !== j) }), style: { width: 28, background: "transparent", border: "1px solid var(--c-line-2)", color: "var(--c-blood)", borderRadius: "var(--r-1)", cursor: "pointer", flexShrink: 0 } }, "\xD7"))), /* @__PURE__ */ React.createElement("button", { onClick: () => updateTier(i, { perks: [...t.perks, "New perk"] }), style: { padding: "6px 10px", background: "var(--c-bg)", border: "1px dashed var(--c-line-3)", borderRadius: "var(--r-2)", color: "var(--c-ink-3)", fontSize: "var(--fs-label)", cursor: "pointer" } }, "+ Perk")))))), /* @__PURE__ */ React.createElement("button", { onClick: () => setMint((m) => ({ ...m, tiers: [...m.tiers, { name: "New Tier", price: 0.5, supply: 50, perks: ["Perk"] }] })), style: { padding: "14px", background: "transparent", border: "1px dashed var(--c-line-3)", borderRadius: "var(--r-2)", color: "var(--c-ink-3)", fontSize: "var(--fs-body)", cursor: "pointer" } }, "+ Add tier")), step === 2 && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 8 } }, "HOLDER GOVERNANCE"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", margin: "0 0 18px", lineHeight: 1.5 } }, "What can your holders vote on? Each toggled item triggers an on-chain vote at the right point in production."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, [
    { k: "color-grade", title: "Color grade", desc: "Pick between two final color passes." },
    { k: "ending", title: "Alternate ending", desc: "Two-version vote before final cut." },
    { k: "poster", title: "Poster art", desc: "Three options put to a vote." },
    { k: "soundtrack", title: "Soundtrack", desc: "Approve composer's first cue." },
    { k: "casting", title: "Casting", desc: "Holders vote on supporting cast." },
    { k: "rerun", title: "Sequel green-light", desc: "Decision after 1 year of revenue." }
  ].map((g) => {
    const on = mint.governance.includes(g.k);
    return /* @__PURE__ */ React.createElement("button", { key: g.k, onClick: () => setMint((m) => ({ ...m, governance: on ? m.governance.filter((x) => x !== g.k) : [...m.governance, g.k] })), style: {
      padding: 14,
      background: on ? "rgba(var(--accent-rgb),.06)" : "var(--c-panel)",
      border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`,
      borderRadius: "var(--r-2)",
      cursor: "pointer",
      color: "inherit",
      textAlign: "left",
      display: "flex",
      gap: 12,
      alignItems: "flex-start"
    } }, /* @__PURE__ */ React.createElement("span", { style: { width: 16, height: 16, borderRadius: "var(--r-1)", background: on ? "var(--c-amber)" : "var(--c-bg)", border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-label)", color: "var(--c-on-amber)", fontWeight: 700, flexShrink: 0, marginTop: 2 } }, on && "\u2713"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", fontWeight: 500 } }, g.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 2 } }, g.desc)));
  }))), /* @__PURE__ */ React.createElement("div", { style: { position: "sticky", top: 80, alignSelf: "start" } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 12 } }, "SCHEDULE"), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 22, display: "flex", flexDirection: "column", gap: 18 } }, /* @__PURE__ */ React.createElement(Field, { label: "HOLDER PRESALE WINDOW (HOURS)" }, /* @__PURE__ */ React.createElement(Slider, { min: 0, max: 72, step: 6, value: mint.presaleHours, onChange: (v) => setMint((m) => ({ ...m, presaleHours: v })), fmt: (v) => v + "h" })), /* @__PURE__ */ React.createElement(Field, { label: "MINT WINDOW (DAYS)" }, /* @__PURE__ */ React.createElement(Slider, { min: 1, max: 30, step: 1, value: mint.closeDays, onChange: (v) => setMint((m) => ({ ...m, closeDays: v })), fmt: (v) => v + "d" })), /* @__PURE__ */ React.createElement("div", { style: { paddingTop: 14, borderTop: "1px solid var(--c-line)", fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6 } }, "Existing Cina holders can mint ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--c-amber)" } }, mint.presaleHours, "h"), " before public, then anyone can mint for ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--c-amber)" } }, mint.closeDays, " days"), ". Unsold supply is burned.")))), step === 3 && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 36 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 28, display: "flex", flexDirection: "column", gap: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" } }, "READY TO DEPLOY"), /* @__PURE__ */ React.createElement("h2", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 500, margin: 0 } }, mint.title), /* @__PURE__ */ React.createElement(SummaryRow, { k: "Total raise (max)", v: `${projectedRaise.toFixed(1)} ETH (~ $${(projectedRaise * 3400).toLocaleString()})` }), /* @__PURE__ */ React.createElement(SummaryRow, { k: "Total supply", v: `${totalSupply} editions across ${mint.tiers.length} tiers` }), /* @__PURE__ */ React.createElement(SummaryRow, { k: "Director split", v: `${mint.splits.director}% of net film income` }), /* @__PURE__ */ React.createElement(SummaryRow, { k: "Holders split", v: `${mint.splits.holders}% of net film income` }), /* @__PURE__ */ React.createElement(SummaryRow, { k: "Secondary royalty", v: `${mint.royalty}% on every resale, forever` }), /* @__PURE__ */ React.createElement(SummaryRow, { k: "Governance votes", v: mint.governance.length ? mint.governance.join(", ") : "None" }), /* @__PURE__ */ React.createElement(SummaryRow, { k: "Schedule", v: `${mint.presaleHours}h presale \u2192 ${mint.closeDays}d open mint` }), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 14, fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6, marginTop: 8 } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 6 } }, "WHAT HAPPENS NEXT"), "Cina deploys the contract on Base (~$8 gas). You sign once. The mint page goes live at the time you set. Holders can resell on the auction floor immediately \u2014 every resale earns you ", mint.royalty, "%.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 80, alignSelf: "start" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => {
    if (window.openPay) {
      window.openPay({
        kind: "license",
        title: mint.title,
        subtitle: "PRODUCER COLLECTION \xB7 BASE",
        accent: tkc("amber"),
        priceUSD: 8,
        items: [
          { label: "Deploy contract", sub: "ERC-721 \xB7 EIP-2981 royalty " + mint.royalty + "%", price: 8 },
          { label: "Tiers", sub: mint.tiers.map((t) => t.name).join(" \xB7 "), price: 0 },
          { label: "Governance", sub: mint.governance.join(", ") || "none", price: 0 }
        ],
        perks: [
          `Max raise ${projectedRaise.toFixed(1)} ETH across ${totalSupply} passes`,
          `${mint.presaleHours}h presale \xB7 closes in ${mint.closeDays} days`,
          "Gas refunded from the first edition sold"
        ],
        image: { kind: "darkroom-est" },
        onConfirm: () => {
          toast(`${mint.title} deployed \xB7 contract live in 90s`);
          setTimeout(() => navigate(`/nft/${film.id}`), 800);
        }
      });
    } else {
      toast(`${mint.title} deployed \xB7 contract live in 90s`);
      setTimeout(() => navigate(`/nft/${film.id}`), 800);
    }
  }, style: { padding: "16px 22px", background: "var(--c-amber)", border: "none", color: "var(--c-on-amber)", borderRadius: "var(--r-2)", fontSize: "var(--fs-lead)", fontWeight: 700, cursor: "pointer" } }, "Sign & deploy contract"), /* @__PURE__ */ React.createElement("button", { onClick: () => setStep(2), style: btnGhostAu }, "\u2190 Adjust governance"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", lineHeight: 1.5, marginTop: 4 } }, "You'll be asked to sign with your wallet. Cina covers the deploy gas \u2014 refunded from the first edition sold."))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 18, borderTop: "1px solid var(--c-line)" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setStep((s) => Math.max(0, s - 1)), disabled: step === 0, style: { ...btnGhostAu, opacity: step === 0 ? 0.3 : 1 } }, "\u2190 Back"), step < 3 && /* @__PURE__ */ React.createElement("button", { onClick: () => setStep((s) => s + 1), style: { ...btnGhostAu, background: "var(--c-amber)", border: "none", color: "var(--c-on-amber)", fontWeight: 600 } }, "Continue \u2192")));
}
function SplitRow({ label, value, onChange, accent }) {
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 110, fontSize: "var(--fs-body)", color: "var(--c-ink-2)" } }, label), /* @__PURE__ */ React.createElement("input", { type: "range", min: 0, max: 100, value, onChange: (e) => onChange(e.target.value), style: { flex: 1, accentColor: accent } }), /* @__PURE__ */ React.createElement("span", { style: { width: 50, textAlign: "right", fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: accent } }, value, "%"));
}
function SplitBar({ splits }) {
  const colors = { director: "var(--c-amber)", holders: tkc("good"), cina: "var(--c-ink-3)", charity: tkc("cat-2") };
  const total = Object.values(splits).reduce((s, v) => s + v, 0) || 1;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", height: 8, borderRadius: "var(--r-1)", overflow: "hidden", marginBottom: 8 } }, Object.entries(splits).map(([k, v]) => v > 0 && /* @__PURE__ */ React.createElement("div", { key: k, style: { width: `${v / total * 100}%`, background: colors[k] } }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 12, fontSize: "var(--fs-label)" } }, Object.entries(splits).map(([k, v]) => /* @__PURE__ */ React.createElement("div", { key: k, style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, background: colors[k], borderRadius: "var(--r-1)" } }), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-3)", textTransform: "capitalize" } }, k), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", color: "var(--c-ink-2)" } }, v, "%")))));
}
function SummaryRow({ k, v }) {
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--c-line)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)" } }, k), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink)", fontFamily: "var(--f-sans)", fontWeight: 500, maxWidth: 360, textAlign: "right" } }, v));
}
const inpAu = {
  width: "100%",
  background: "var(--c-bg)",
  border: "1px solid var(--c-line-2)",
  borderRadius: "var(--r-2)",
  padding: "10px 12px",
  color: "var(--c-ink)",
  fontSize: "var(--fs-body)",
  fontFamily: "var(--f-sans)"
};
const btnGhostAu = {
  padding: "10px 18px",
  background: "transparent",
  border: "1px solid var(--c-line-2)",
  borderRadius: "var(--r-2)",
  color: "var(--c-ink-2)",
  fontSize: "var(--fs-body)",
  cursor: "pointer"
};
Object.assign(window, { AuctionMarketPage, AuctionDetailPage, DirectorMintPage, AUCTIONS, auTierPerks: tierPerks, auSynthBids: synthBids });

  try { if (typeof usAu !== "undefined") window["usAu"] = usAu; } catch (_) {}
  try { if (typeof ueAu !== "undefined") window["ueAu"] = ueAu; } catch (_) {}
  try { if (typeof umAu !== "undefined") window["umAu"] = umAu; } catch (_) {}
  try { if (typeof urAu !== "undefined") window["urAu"] = urAu; } catch (_) {}
  try { if (typeof genAuctions !== "undefined") window["genAuctions"] = genAuctions; } catch (_) {}
  try { if (typeof AUCTIONS !== "undefined") window["AUCTIONS"] = AUCTIONS; } catch (_) {}
  try { if (typeof HAS_BRANCHED_LOTS !== "undefined") window["HAS_BRANCHED_LOTS"] = HAS_BRANCHED_LOTS; } catch (_) {}
  try { if (typeof AuctionMarketPage !== "undefined") window["AuctionMarketPage"] = AuctionMarketPage; } catch (_) {}
  try { if (typeof AuctionCard !== "undefined") window["AuctionCard"] = AuctionCard; } catch (_) {}
  try { if (typeof AuctionDetailPage !== "undefined") window["AuctionDetailPage"] = AuctionDetailPage; } catch (_) {}
  try { if (typeof Row !== "undefined") window["Row"] = Row; } catch (_) {}
  try { if (typeof synthBids !== "undefined") window["synthBids"] = synthBids; } catch (_) {}
  try { if (typeof tierPerks !== "undefined") window["tierPerks"] = tierPerks; } catch (_) {}
  try { if (typeof CreateAuctionOverlay !== "undefined") window["CreateAuctionOverlay"] = CreateAuctionOverlay; } catch (_) {}
  try { if (typeof DirectorMintPage !== "undefined") window["DirectorMintPage"] = DirectorMintPage; } catch (_) {}
  try { if (typeof SplitRow !== "undefined") window["SplitRow"] = SplitRow; } catch (_) {}
  try { if (typeof SplitBar !== "undefined") window["SplitBar"] = SplitBar; } catch (_) {}
  try { if (typeof SummaryRow !== "undefined") window["SummaryRow"] = SummaryRow; } catch (_) {}
  try { if (typeof inpAu !== "undefined") window["inpAu"] = inpAu; } catch (_) {}
  try { if (typeof btnGhostAu !== "undefined") window["btnGhostAu"] = btnGhostAu; } catch (_) {}
})();

// ── MODULE: holder-hub.jsx ──
;(function() {
const { useState: hhUseState, useMemo: hhUseMemo, useRef: hhUseRef, useEffect: hhUseEffect } = React;
const $f = (n, d = 0) => "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (n) => Math.round(Number(n || 0) * 100) + "%";
const compact = (n) => Number(n || 0) >= 1e3 ? (Number(n || 0) / 1e3).toFixed(1) + "k" : String(n || 0);
function HolderHub({ initialProjectId = "voss-ll" }) {
  const [projectId, setProjectId] = hhUseState(initialProjectId);
  const project = NFT_PROJECTS[projectId];
  const film = CATALOG.find((f) => f.id === project.filmId);
  const votes = ACTIVE_VOTES[projectId] || [];
  const myHoldings = { collector: 4, patron: 1, producer: 0 };
  const myValueUSD = myHoldings.collector * project.tiers[0].priceUSD + myHoldings.patron * project.tiers[1].priceUSD + myHoldings.producer * project.tiers[2].priceUSD;
  const myWeight = myHoldings.collector * TIER_WEIGHTS.collector + myHoldings.patron * TIER_WEIGHTS.patron + myHoldings.producer * TIER_WEIGHTS.producer;
  const totalProjectWeight = project.tiers.reduce((s, t) => s + t.sold * TIER_WEIGHTS[t.id], 0);
  const myShare = myWeight / totalProjectWeight;
  const myEarningsLifetime = (project.royaltyPaid || 0) * myShare;
  const myEarnings30d = myEarningsLifetime * 0.18;
  return /* @__PURE__ */ React.createElement("div", { className: "holder-surface", style: { minHeight: "calc(100vh - 60px)" } }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: "var(--w-page)", margin: "0 auto", padding: "28px 32px 96px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.6)", letterSpacing: ".16em" } }, "HOLDER HUB \xB7 YOUR PROJECTS"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, Object.values(NFT_PROJECTS).slice(0, 5).map((p) => /* @__PURE__ */ React.createElement("button", { key: p.id, onClick: () => setProjectId(p.id), style: {
    appearance: "none",
    cursor: "pointer",
    padding: "5px 12px",
    borderRadius: 999,
    background: projectId === p.id ? "var(--c-amber)" : "transparent",
    color: projectId === p.id ? tkc("on-amber") : "rgba(232,227,214,.7)",
    border: `1px solid ${projectId === p.id ? "var(--c-amber)" : "rgba(232,227,214,.18)"}`,
    fontSize: "var(--fs-body)"
  } }, p.title)))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 320px", gap: 28, marginBottom: 28, paddingBottom: 22, borderBottom: "1px solid rgba(232,227,214,.12)" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.5)", letterSpacing: ".16em", marginBottom: 8 } }, film?.creator?.toUpperCase() || project.title), /* @__PURE__ */ React.createElement("h1", { style: { fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", lineHeight: 1.05, margin: 0, fontWeight: 400, color: "var(--c-ink)" } }, project.title), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "var(--fs-body)", color: "rgba(232,227,214,.7)", margin: "10px 0 0", maxWidth: 580, lineHeight: 1.5 } }, project.summary || "Your stake, your earnings, your vote. Talk to the creator. Approve sponsors. Watch the money come in.")), /* @__PURE__ */ React.createElement("div", { style: { aspectRatio: "16/9", borderRadius: "var(--r-3)", overflow: "hidden", border: "1px solid rgba(232,227,214,.18)" } }, /* @__PURE__ */ React.createElement(FrameThumb, { kind: film?.thumb || "darkroom-est" }))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 } }, /* @__PURE__ */ React.createElement(HoldStat, { label: "YOUR HOLDINGS", value: myHoldings.collector + myHoldings.patron + myHoldings.producer, sub: `${myHoldings.collector}\xD7 collector \xB7 ${myHoldings.patron}\xD7 patron` }), /* @__PURE__ */ React.createElement(HoldStat, { label: "ESTIMATED VALUE", value: $f(myValueUSD), sub: `+${pct(0.14)} this month`, trend: "up" }), /* @__PURE__ */ React.createElement(HoldStat, { label: "EARNINGS \xB7 30D", value: $f(myEarnings30d, 2), sub: `incl. ad revenue from Pitch`, trend: "up" }), /* @__PURE__ */ React.createElement(HoldStat, { label: "LIFETIME PAYOUTS", value: $f(myEarningsLifetime, 2), sub: `next distribution ${project.nextDistribution || "\u2014"}` })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 18 } }, /* @__PURE__ */ React.createElement(ValueChart, { project, myShare }), /* @__PURE__ */ React.createElement(BidBook, { project }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.5)", letterSpacing: ".16em", marginBottom: 10 } }, "ACTIVE VOTES \xB7 ", votes.length), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, votes.map((v) => /* @__PURE__ */ React.createElement(VoteCard, { key: v.id, v })), votes.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { padding: 24, textAlign: "center", color: "rgba(232,227,214,.5)", border: "1px dashed rgba(232,227,214,.18)", borderRadius: "var(--r-3)" } }, "No active votes on this project.")))), /* @__PURE__ */ React.createElement(HolderChat, { projectId, project, film }))));
}
function HoldStat({ label, value, sub, trend }) {
  return /* @__PURE__ */ React.createElement(CinaStat, { label, value, sub, trend });
}
function ValueChart({ project, myShare }) {
  const points = hhUseMemo(() => Array.from({ length: 90 }, (_, i) => {
    const v = project.floorUSD * (0.85 + Math.sin(i / 9) * 0.08 + i / 90 * 0.18);
    return v;
  }), [project.id]);
  const w = 720, h = 180, pad = 8;
  const min = Math.min(...points) * 0.95, max = Math.max(...points) * 1.05;
  const pts = points.map((v, i) => [
    pad + i / (points.length - 1) * (w - pad * 2),
    h - pad - (v - min) / (max - min) * (h - pad * 2)
  ]);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const fill = `${path} L${pts[pts.length - 1][0]},${h - pad} L${pts[0][0]},${h - pad} Z`;
  return /* @__PURE__ */ React.createElement("div", { style: { padding: 18, background: "rgba(232,227,214,.04)", border: "1px solid rgba(232,227,214,.12)", borderRadius: "var(--r-3)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.5)", letterSpacing: ".16em" } }, "FLOOR \xB7 90D"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 4 } }, "$", project.floorUSD, " ", /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-good)" } }, "+18%"))), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.5)", textAlign: "right" } }, "your share", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-amber)" } }, (myShare * 100).toFixed(2), "%"))), /* @__PURE__ */ React.createElement("svg", { viewBox: `0 0 ${w} ${h}`, style: { width: "100%", height: 180 } }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("linearGradient", { id: "vgrad", x1: "0", x2: "0", y1: "0", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: "var(--c-amber)", stopOpacity: ".35" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: "var(--c-amber)", stopOpacity: "0" }))), [0.25, 0.5, 0.75].map(
    (y) => /* @__PURE__ */ React.createElement("line", { key: y, x1: pad, x2: w - pad, y1: pad + (h - pad * 2) * y, y2: pad + (h - pad * 2) * y, stroke: "rgba(232,227,214,.08)", strokeDasharray: "2 4" })
  ), /* @__PURE__ */ React.createElement("path", { d: fill, fill: "url(#vgrad)" }), /* @__PURE__ */ React.createElement("path", { d: path, fill: "none", stroke: "var(--c-amber)", strokeWidth: "1.5" })));
}
function BidBook({ project }) {
  const bids = [
    { addr: "0xCAFE\u202691a2", tier: "patron", priceUSD: project.tiers[1].priceUSD * 1.18, qty: 1, t: "12 min ago" },
    { addr: "0x49DA\u20260b4c", tier: "collector", priceUSD: project.tiers[0].priceUSD * 1.04, qty: 3, t: "44 min ago" },
    { addr: "0x12C8\u2026aa7e", tier: "patron", priceUSD: project.tiers[1].priceUSD * 1.06, qty: 1, t: "2h ago" },
    { addr: "0xBEEF\u2026ff03", tier: "collector", priceUSD: project.tiers[0].priceUSD * 0.98, qty: 5, t: "5h ago" }
  ];
  return /* @__PURE__ */ React.createElement("div", { style: { padding: 18, background: "rgba(232,227,214,.04)", border: "1px solid rgba(232,227,214,.12)", borderRadius: "var(--r-3)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.5)", letterSpacing: ".16em" } }, "OPEN BIDS \xB7 ON YOUR HOLDINGS"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)" } }, bids.length, " active")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, bids.map((b, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
    display: "grid",
    gridTemplateColumns: "120px 90px 1fr 90px 80px",
    alignItems: "center",
    gap: 10,
    padding: "9px 12px",
    background: "rgba(232,227,214,.025)",
    border: "1px solid rgba(232,227,214,.08)",
    borderRadius: "var(--r-2)",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)"
  } }, /* @__PURE__ */ React.createElement("span", { style: { color: "rgba(232,227,214,.7)" } }, b.addr), /* @__PURE__ */ React.createElement("span", { style: { color: "rgba(232,227,214,.5)" } }, b.tier), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-amber)" } }, "$", b.priceUSD.toFixed(0), " ", /* @__PURE__ */ React.createElement("span", { style: { color: "rgba(232,227,214,.4)" } }, "\xD7 ", b.qty)), /* @__PURE__ */ React.createElement("span", { style: { color: "rgba(232,227,214,.4)", fontSize: "var(--fs-label)" } }, b.t), /* @__PURE__ */ React.createElement("button", { style: {
    appearance: "none",
    border: "1px solid rgba(232,227,214,.2)",
    background: "transparent",
    color: "rgba(232,227,214,.8)",
    padding: "4px 8px",
    borderRadius: "var(--r-2)",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    cursor: "pointer"
  } }, "review")))));
}
function VoteCard({ v }) {
  const [yourVote, setYourVote] = hhUseState(v.yourVote);
  const total = v.yesPower + v.noPower + v.abstainPower;
  const yes = v.yesPower / total, no = v.noPower / total;
  const closes = new Date(v.closes);
  const hoursLeft = Math.max(0, (closes - Date.now()) / 36e5);
  const kindBadge = {
    "ad-approval": { label: "AD \xB7 APPROVE", c: "var(--c-amber)" },
    "ad-rejection": { label: "AD \xB7 REJECT", c: tkc("bad") },
    "greenlight": { label: "GREENLIGHT", c: tkc("good") },
    "creative": { label: "CREATIVE", c: tkc("cat-1") }
  }[v.kind] || { label: "GOVERNANCE", c: "rgba(232,227,214,.5)" };
  return /* @__PURE__ */ React.createElement("div", { style: {
    padding: 16,
    background: "rgba(232,227,214,.04)",
    border: "1px solid rgba(232,227,214,.12)",
    borderRadius: "var(--r-3)"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: {
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    padding: "2px 6px",
    borderRadius: "var(--r-1)",
    background: `color-mix(in oklab, ${kindBadge.c} 16%, transparent)`,
    color: kindBadge.c,
    marginRight: 8
  } }, kindBadge.label), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.4)" } }, hoursLeft < 24 ? `${hoursLeft.toFixed(0)}h left` : `${Math.floor(hoursLeft / 24)}d left`)), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.4)" } }, v.thread, " comments")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)", marginBottom: 4 } }, v.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "rgba(232,227,214,.65)", lineHeight: 1.45, marginBottom: 12 } }, v.summary), v.payoutPreview != null && /* @__PURE__ */ React.createElement("div", { style: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px", marginBottom: 10, background: "rgba(var(--accent-rgb),.12)", borderRadius: "var(--r-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)" } }, v.payoutPreview > 0 ? "+" : "", $f(v.payoutPreview), " to holder pool if passed"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", height: 6, borderRadius: 999, overflow: "hidden", background: "rgba(232,227,214,.08)", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { width: `${yes * 100}%`, background: "var(--c-good)" } }), /* @__PURE__ */ React.createElement("div", { style: { width: `${no * 100}%`, background: "var(--c-blood-l)" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.55)", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("span", null, "YES ", pct(yes), " \xB7 ", compact(v.yesPower), " pwr"), /* @__PURE__ */ React.createElement("span", null, "NO ", pct(no), " \xB7 ", compact(v.noPower), " pwr")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, ["yes", "no", "abstain"].map((opt) => /* @__PURE__ */ React.createElement("button", { key: opt, onClick: () => setYourVote(opt), style: {
    flex: 1,
    appearance: "none",
    padding: "8px 0",
    background: yourVote === opt ? opt === "yes" ? tkc("good") : opt === "no" ? tkc("bad") : "rgba(232,227,214,.2)" : "transparent",
    color: yourVote === opt ? tkc("bg") : "rgba(232,227,214,.7)",
    border: `1px solid ${yourVote === opt ? "transparent" : "rgba(232,227,214,.18)"}`,
    borderRadius: "var(--r-2)",
    fontSize: "var(--fs-label)",
    fontWeight: 600,
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: ".08em"
  } }, opt))));
}
function HolderChat({ projectId, project, film }) {
  const seed = HOLDER_CHAT[projectId] || [];
  const [msgs, setMsgs] = hhUseState(seed);
  const [draft, setDraft] = hhUseState("");
  const scrollRef = hhUseRef(null);
  hhUseEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs]);
  const send = () => {
    if (!draft.trim()) return;
    setMsgs([...msgs, { user: "you.eth", role: "patron", color: tkc("cat-3"), text: draft, t: (/* @__PURE__ */ new Date()).toISOString(), avatar: "Y" }]);
    setDraft("");
  };
  return /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    flexDirection: "column",
    background: "rgba(232,227,214,.04)",
    border: "1px solid rgba(232,227,214,.12)",
    borderRadius: "var(--r-3)",
    height: "calc(100vh - 220px)",
    minHeight: 540,
    position: "sticky",
    top: 86
  } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 16px", borderBottom: "1px solid rgba(232,227,214,.1)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.5)", letterSpacing: ".16em" } }, "HOLDER ROOM"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)", marginTop: 2 } }, project.title)), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)" } }, "\u25CF ", project.backers, " holders"))), /* @__PURE__ */ React.createElement("div", { ref: scrollRef, style: { flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 } }, msgs.map((m, i) => /* @__PURE__ */ React.createElement(ChatMsg, { key: i, m }))), /* @__PURE__ */ React.createElement("div", { style: { padding: 12, borderTop: "1px solid rgba(232,227,214,.1)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      value: draft,
      onChange: (e) => setDraft(e.target.value),
      onKeyDown: (e) => e.key === "Enter" && send(),
      placeholder: "Talk to the creator and 1,341 other holders\u2026",
      style: {
        flex: 1,
        appearance: "none",
        background: "rgba(232,227,214,.06)",
        border: "1px solid rgba(232,227,214,.14)",
        borderRadius: "var(--r-2)",
        padding: "9px 12px",
        color: "var(--c-ink)",
        fontFamily: "var(--f-sans)",
        fontSize: "var(--fs-body)",
        outline: "none"
      }
    }
  ), /* @__PURE__ */ React.createElement("button", { onClick: send, style: {
    appearance: "none",
    padding: "8px 12px",
    background: "var(--c-amber)",
    color: "var(--c-on-amber)",
    border: 0,
    borderRadius: "var(--r-2)",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "var(--fs-body)"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "send", size: 13 }))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.4)", display: "flex", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", null, "Voting power weighted by tier \xB7 your power: 12\xB7"), /* @__PURE__ */ React.createElement("span", null, "End-to-end encrypted"))));
}
function ChatMsg({ m }) {
  const isAgent = m.role === "agent";
  const isCreator = m.role === "creator";
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: isAgent ? "var(--c-amber)" : m.color,
    color: isAgent ? tkc("on-amber") : tkc("white"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--f-display)",
    fontSize: "var(--fs-label)",
    fontWeight: 600,
    flexShrink: 0
  } }, m.avatar), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "baseline", marginBottom: 2 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", fontWeight: 600, color: isCreator ? "var(--c-amber)" : isAgent ? "var(--c-amber)" : tkc("ink") } }, m.user), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.4)", letterSpacing: ".08em" } }, m.role.toUpperCase()), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.3)" } }, new Date(m.t).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }))), /* @__PURE__ */ React.createElement("div", { style: {
    fontSize: "var(--fs-body)",
    color: "rgba(232,227,214,.85)",
    lineHeight: 1.45,
    padding: isAgent ? "8px 10px" : 0,
    background: isAgent ? "rgba(var(--accent-rgb),.08)" : "transparent",
    borderRadius: isAgent ? 6 : 0,
    borderLeft: isAgent ? "2px solid var(--c-amber)" : "none"
  } }, m.text)));
}
Object.assign(window, { HolderHub });

  try { if (typeof hhUseState !== "undefined") window["hhUseState"] = hhUseState; } catch (_) {}
  try { if (typeof hhUseMemo !== "undefined") window["hhUseMemo"] = hhUseMemo; } catch (_) {}
  try { if (typeof hhUseRef !== "undefined") window["hhUseRef"] = hhUseRef; } catch (_) {}
  try { if (typeof hhUseEffect !== "undefined") window["hhUseEffect"] = hhUseEffect; } catch (_) {}
  try { if (typeof $f !== "undefined") window["$f"] = $f; } catch (_) {}
  try { if (typeof pct !== "undefined") window["pct"] = pct; } catch (_) {}
  try { if (typeof compact !== "undefined") window["compact"] = compact; } catch (_) {}
  try { if (typeof HolderHub !== "undefined") window["HolderHub"] = HolderHub; } catch (_) {}
  try { if (typeof HoldStat !== "undefined") window["HoldStat"] = HoldStat; } catch (_) {}
  try { if (typeof ValueChart !== "undefined") window["ValueChart"] = ValueChart; } catch (_) {}
  try { if (typeof BidBook !== "undefined") window["BidBook"] = BidBook; } catch (_) {}
  try { if (typeof VoteCard !== "undefined") window["VoteCard"] = VoteCard; } catch (_) {}
  try { if (typeof HolderChat !== "undefined") window["HolderChat"] = HolderChat; } catch (_) {}
  try { if (typeof ChatMsg !== "undefined") window["ChatMsg"] = ChatMsg; } catch (_) {}
})();

// ── MODULE: producer-state.jsx ──
;(function() {
const { useState: psUseState, useEffect: psUseEffect, useMemo: psUseMemo, useRef: psUseRef, useCallback: psUseCallback } = React;
const PS_KEY = "cina-producer-session-v1";
function psLoad() {
  try {
    const raw = localStorage.getItem(PS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}
function psSave(s) {
  try {
    localStorage.setItem(PS_KEY, JSON.stringify(s));
  } catch (_) {
  }
}
function psSeed() {
  const user = window.USER || {};
  const NFT = window.NFT_PROJECTS || {};
  const seedHoldings = (user.holdings || []).filter((h) => !h.onWatchlist);
  const seedWatch = (user.holdings || []).filter((h) => h.onWatchlist).map((h) => h.projectId);
  const claims = [];
  seedHoldings.forEach((h) => {
    const proj = NFT[h.projectId];
    if (!proj) return;
    const tier = (proj.tiers || []).find((t) => t.id === h.tier) || (proj.tiers || [])[0];
    if (!tier) return;
    const amt = Math.round(tier.priceUSD * 0.04 * h.qty * 100) / 100;
    if (amt > 0.5) {
      claims.push({
        id: `dist-${h.projectId}-${h.tier}-q1`,
        projectId: h.projectId,
        tier: h.tier,
        amount: amt,
        period: "Q4 2025 distribution",
        availableAt: Date.now() - 864e5 * 2,
        status: "claimable",
        sources: [
          { kind: "ad", label: "Pitch ad revenue", amount: amt * 0.62 },
          { kind: "tix", label: "Theatrical window", amount: amt * 0.28 },
          { kind: "tip", label: "Audience tips", amount: amt * 0.1 }
        ]
      });
    }
  });
  const notes = [
    claims[0] && {
      id: "n1",
      kind: "claim",
      read: false,
      t: Date.now() - 864e5 * 1.4,
      title: `${psUSD(claims[0].amount)} ready to claim`,
      sub: `${(NFT[claims[0].projectId] || {}).title || ""} \xB7 ${claims[0].period}`,
      ref: { type: "claim", id: claims[0].id }
    },
    {
      id: "n2",
      kind: "vote",
      read: false,
      t: Date.now() - 3600 * 1e3 * 6,
      title: "New vote: Theatrical window length",
      sub: "Voss & Voss \xB7 closes in 2 days",
      ref: { type: "project", id: Object.keys(NFT)[0] }
    },
    {
      id: "n3",
      kind: "bid",
      read: false,
      t: Date.now() - 3600 * 1e3 * 10,
      title: "Bid offer on your Patron stake",
      sub: "Late Light \xB7 $186 (+8% over floor)",
      ref: { type: "bid", id: "b1" }
    },
    {
      id: "n4",
      kind: "sale",
      read: true,
      t: Date.now() - 864e5 * 2,
      title: "Sold out: A Beautiful End \xB7 Producer tier",
      sub: "Floor moved up 14%",
      ref: { type: "project", id: Object.keys(NFT)[1] || Object.keys(NFT)[0] }
    }
  ].filter(Boolean);
  return {
    holdings: seedHoldings,
    watchlist: seedWatch,
    claims,
    listings: [],
    // user-created secondary listings
    bids: [],
    // user-placed bids on others' NFTs
    notifications: notes
  };
}
function psUSD(n) {
  if (n == null) return "$0";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return "$" + Math.round(n / 1e3) + "k";
  if (n >= 100) return "$" + Math.round(n).toLocaleString();
  return "$" + n.toFixed(2);
}
function ensureSession() {
  if (window.__pSession) return window.__pSession;
  const initial = psLoad() || psSeed();
  const subs = /* @__PURE__ */ new Set();
  let state = initial;
  const get = () => state;
  const set = (mut) => {
    state = typeof mut === "function" ? mut(state) : { ...state, ...mut };
    psSave(state);
    subs.forEach((fn) => fn(state));
  };
  const subscribe = (fn) => {
    subs.add(fn);
    return () => subs.delete(fn);
  };
  window.__pSession = { get, set, subscribe };
  return window.__pSession;
}
function useProducerSession() {
  const session = ensureSession();
  const [s, setS] = psUseState(session.get());
  psUseEffect(() => session.subscribe(setS), [session]);
  const toggleWatch = psUseCallback((projectId) => {
    session.set((st) => ({
      ...st,
      watchlist: st.watchlist.includes(projectId) ? st.watchlist.filter((id) => id !== projectId) : [...st.watchlist, projectId]
    }));
  }, [session]);
  const claim = psUseCallback((claimId) => {
    session.set((st) => {
      const c = st.claims.find((x) => x.id === claimId);
      if (!c || c.status !== "claimable") return st;
      return {
        ...st,
        claims: st.claims.map((x) => x.id === claimId ? { ...x, status: "claimed", claimedAt: Date.now() } : x),
        notifications: [
          {
            id: `n-${Date.now()}`,
            kind: "claim",
            read: false,
            t: Date.now(),
            title: `Claimed ${psUSD(c.amount)}`,
            sub: `Sent to your wallet \xB7 ${c.period}`,
            ref: { type: "claim", id: c.id }
          },
          ...st.notifications
        ]
      };
    });
  }, [session]);
  const claimAll = psUseCallback(() => {
    session.set((st) => {
      const claimable = st.claims.filter((c) => c.status === "claimable");
      if (claimable.length === 0) return st;
      const total = claimable.reduce((s2, c) => s2 + c.amount, 0);
      return {
        ...st,
        claims: st.claims.map((c) => c.status === "claimable" ? { ...c, status: "claimed", claimedAt: Date.now() } : c),
        notifications: [
          {
            id: `n-${Date.now()}`,
            kind: "claim",
            read: false,
            t: Date.now(),
            title: `Claimed ${psUSD(total)} across ${claimable.length} project${claimable.length > 1 ? "s" : ""}`,
            sub: "Sent to your wallet",
            ref: { type: "portfolio" }
          },
          ...st.notifications
        ]
      };
    });
  }, [session]);
  const placeBid = psUseCallback((bid) => {
    session.set((st) => ({
      ...st,
      bids: [{ ...bid, id: `bid-${Date.now()}`, t: Date.now(), status: "open" }, ...st.bids],
      notifications: [
        {
          id: `n-${Date.now()}`,
          kind: "bid",
          read: false,
          t: Date.now(),
          title: `Bid placed: ${psUSD(bid.priceUSD)} \xD7 ${bid.qty}`,
          sub: `${bid.projectTitle} \xB7 ${bid.tier} tier`,
          ref: { type: "project", id: bid.projectId }
        },
        ...st.notifications
      ]
    }));
  }, [session]);
  const cancelBid = psUseCallback((bidId) => {
    session.set((st) => ({ ...st, bids: st.bids.map((b) => b.id === bidId ? { ...b, status: "cancelled" } : b) }));
  }, [session]);
  const listForSale = psUseCallback((listing) => {
    session.set((st) => ({
      ...st,
      listings: [{ ...listing, id: `list-${Date.now()}`, t: Date.now(), status: "open" }, ...st.listings],
      notifications: [
        {
          id: `n-${Date.now()}`,
          kind: "sale",
          read: false,
          t: Date.now(),
          title: `Listed for ${psUSD(listing.priceUSD)}`,
          sub: `${listing.projectTitle} \xB7 ${listing.tier} tier \xB7 \xD7${listing.qty}`,
          ref: { type: "project", id: listing.projectId }
        },
        ...st.notifications
      ]
    }));
  }, [session]);
  const cancelListing = psUseCallback((listingId) => {
    session.set((st) => ({ ...st, listings: st.listings.map((l) => l.id === listingId ? { ...l, status: "cancelled" } : l) }));
  }, [session]);
  const markNotifRead = psUseCallback((id) => {
    session.set((st) => ({ ...st, notifications: st.notifications.map((n) => n.id === id ? { ...n, read: true } : n) }));
  }, [session]);
  const markAllRead = psUseCallback(() => {
    session.set((st) => ({ ...st, notifications: st.notifications.map((n) => ({ ...n, read: true })) }));
  }, [session]);
  return {
    s,
    toggleWatch,
    claim,
    claimAll,
    placeBid,
    cancelBid,
    listForSale,
    cancelListing,
    markNotifRead,
    markAllRead
  };
}
function HeartButton({ projectId, size = 18, style }) {
  const { s, toggleWatch } = useProducerSession();
  const on = s.watchlist.includes(projectId);
  return /* @__PURE__ */ React.createElement(
    "span",
    {
      role: "button",
      tabIndex: 0,
      onClick: (e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleWatch(projectId);
      },
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.stopPropagation();
          e.preventDefault();
          toggleWatch(projectId);
        }
      },
      title: on ? "Remove from watchlist" : "Add to watchlist",
      style: {
        width: size + 14,
        height: size + 14,
        borderRadius: "50%",
        background: on ? "rgba(var(--accent-rgb),.18)" : "rgba(0,0,0,.55)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all .15s ease",
        color: on ? "var(--c-amber)" : "rgba(255,255,255,.85)",
        ...style
      }
    },
    /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", width: size, height: size, fill: on ? "currentColor" : "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" }))
  );
}
function ProducerNotifBell({ onJump }) {
  const { s, markNotifRead, markAllRead } = useProducerSession();
  const [open, setOpen] = psUseState(false);
  const unread = s.notifications.filter((n) => !n.read).length;
  const ICONS = {
    claim: "\u{1F4E5}",
    vote: "\u{1F5F3}",
    bid: "\u{1F4B0}",
    sale: "\u{1F514}",
    mint: "\u2728"
  };
  return /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn-ghost btn-icon",
      style: { width: 34, height: 34, position: "relative" },
      onClick: () => setOpen((v) => !v),
      "data-active": open,
      title: "Notifications"
    },
    /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", width: "15", height: "15", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" }), /* @__PURE__ */ React.createElement("path", { d: "M13.73 21a2 2 0 0 1-3.46 0" })),
    unread > 0 && /* @__PURE__ */ React.createElement("span", { style: {
      position: "absolute",
      top: 4,
      right: 4,
      minWidth: 14,
      height: 14,
      padding: "0 3px",
      borderRadius: "var(--r-2)",
      background: "var(--c-amber)",
      color: "var(--c-on-amber)",
      fontFamily: "var(--f-mono)",
      fontSize: "var(--fs-label)",
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    } }, unread > 9 ? "9+" : unread)
  ), open && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { onClick: () => setOpen(false), style: { position: "fixed", inset: 0, zIndex: 60 } }), /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 6px)",
    zIndex: 70,
    width: 360,
    padding: 0,
    background: "var(--c-panel)",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-3)",
    boxShadow: "0 18px 48px rgba(0,0,0,.5)",
    maxHeight: 480,
    display: "flex",
    flexDirection: "column"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderBottom: "1px solid var(--c-line)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" } }, "NOTIFICATIONS"), unread > 0 && /* @__PURE__ */ React.createElement("button", { onClick: markAllRead, style: { appearance: "none", background: "transparent", border: 0, color: "var(--c-amber)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", cursor: "pointer", letterSpacing: ".08em" } }, "MARK ALL READ")), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto" } }, s.notifications.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { padding: 36, textAlign: "center", color: "var(--c-ink-3)", fontSize: "var(--fs-body)" } }, "You're all caught up."), s.notifications.map((n) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: n.id,
      onClick: () => {
        markNotifRead(n.id);
        setOpen(false);
        if (n.ref?.type === "claim") {
          const claim = s.claims.find((c) => c.id === n.ref.id);
          if (claim && window.openClaimModal) window.openClaimModal(claim);
        } else if (n.ref?.type === "project" && onJump) {
          onJump(`project/${n.ref.id}`);
        } else if (n.ref?.type === "portfolio" && onJump) {
          onJump("portfolio");
        }
      },
      style: {
        width: "100%",
        appearance: "none",
        border: 0,
        background: n.read ? "transparent" : "rgba(var(--accent-rgb),.04)",
        padding: "12px 14px",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        borderBottom: "1px solid var(--c-line)",
        cursor: "pointer",
        textAlign: "left",
        color: "inherit"
      },
      onMouseEnter: (e) => e.currentTarget.style.background = "var(--c-panel-2)",
      onMouseLeave: (e) => e.currentTarget.style.background = n.read ? "transparent" : "rgba(var(--accent-rgb),.04)"
    },
    /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-lead)", flexShrink: 0 } }, ICONS[n.kind] || "\u2022"),
    /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: n.read ? 400 : 500 } }, n.title), n.sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2 } }, n.sub), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 4, letterSpacing: ".08em" } }, psRelTime(n.t))),
    !n.read && /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: "var(--c-amber)", flexShrink: 0, marginTop: 6 } })
  ))))));
}
function psRelTime(t) {
  const diff = Date.now() - t;
  const m = Math.floor(diff / 6e4);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function ClaimModal_producerState({ claim, project, onClose }) {
  const { claim: doClaim } = useProducerSession();
  const [stage, setStage] = psUseState("review");
  const [progress, setProgress] = psUseState(0);
  psUseEffect(() => {
    if (stage !== "signing") return;
    setProgress(0);
    let p = 0;
    const failAt = Math.random() < 0.15 ? 42 + Math.random() * 26 : Infinity;
    const i = setInterval(() => {
      p += 12 + Math.random() * 14;
      if (p >= failAt) {
        clearInterval(i);
        setTimeout(() => setStage("error"), 220);
        return;
      }
      setProgress(Math.min(100, p));
      if (p >= 100) {
        clearInterval(i);
        doClaim(claim.id);
        setTimeout(() => setStage("done"), 350);
      }
    }, 240);
    return () => clearInterval(i);
  }, [stage, claim?.id, doClaim]);
  if (!claim) return null;
  return /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: {
    position: "fixed",
    inset: 0,
    zIndex: 200,
    background: "rgba(0,0,0,.55)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "flex-end"
  } }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
    width: "min(460px, 100%)",
    height: "100%",
    background: "var(--c-panel)",
    borderLeft: "1px solid var(--c-line-2)",
    overflowY: "auto",
    animation: "bid-slide-in 240ms cubic-bezier(.2,.8,.2,1)",
    boxShadow: "-20px 0 60px rgba(0,0,0,.5)"
  } }, /* @__PURE__ */ React.createElement("style", null, `@keyframes bid-slide-in { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`), /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 22px", borderBottom: "1px solid var(--c-line)", display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" } }, stage === "review" && "CLAIM DISTRIBUTION", stage === "signing" && "TRANSFERRING TO WALLET", stage === "error" && "CLAIM FAILED", stage === "done" && "CLAIMED"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", marginTop: 2 } }, project?.title || claim.projectId, " \xB7 ", claim.period)), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: { appearance: "none", background: "transparent", border: 0, color: "var(--c-ink-3)", fontSize: "var(--fs-lead)", cursor: "pointer", padding: 6 }, "aria-label": "Close", title: "Close" }, "\xD7")), /* @__PURE__ */ React.createElement("div", { style: { padding: 22 } }, stage === "review" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 18 } }, /* @__PURE__ */ React.createElement("div", { style: {
    padding: "20px 18px",
    textAlign: "center",
    background: "linear-gradient(180deg, rgba(var(--accent-rgb),.08), var(--c-panel-2) 100%)",
    border: "1px solid rgba(var(--accent-rgb),.3)",
    borderRadius: "var(--r-2)"
  } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" } }, "YOUR SHARE"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-amber)", marginTop: 6, lineHeight: 1 } }, psUSD(claim.amount)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 6 } }, claim.tier, " tier \xB7 proportional to your stake")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 8 } }, "WHERE IT CAME FROM"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, claim.sources.map((src, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-2)" } }, src.label), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", color: "var(--c-ink)" } }, psUSD(src.amount)))))), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: 14, fontSize: "var(--fs-body)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-3)" } }, "Network"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink)", fontFamily: "var(--f-mono)" } }, project?.chain || "Base")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-3)" } }, "Gas (estimated)"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-2)", fontFamily: "var(--f-mono)" } }, "~$0.18")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-3)" } }, "Receiving wallet"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-2)", fontFamily: "var(--f-mono)" } }, "0xA1c4\u2026f3D2")))), stage === "signing" && /* @__PURE__ */ React.createElement("div", { style: { padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 22 } }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: 100, height: 100 } }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 100 100", style: { width: "100%", height: "100%", transform: "rotate(-90deg)" } }, /* @__PURE__ */ React.createElement("circle", { cx: "50", cy: "50", r: "44", fill: "none", stroke: "var(--c-line)", strokeWidth: "3" }), /* @__PURE__ */ React.createElement(
    "circle",
    {
      cx: "50",
      cy: "50",
      r: "44",
      fill: "none",
      stroke: "var(--c-amber)",
      strokeWidth: "3",
      strokeDasharray: `${progress / 100 * 276} 276`,
      style: { transition: "stroke-dasharray .25s linear", filter: "drop-shadow(0 0 6px rgba(var(--accent-rgb),.5))" }
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-amber)" } }, Math.floor(progress), "%")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", fontSize: "var(--fs-body)", color: "var(--c-ink-2)" } }, "Signing claim \xB7 transferring to wallet\u2026")), stage === "done" && /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 56, height: 56, borderRadius: "50%", background: "var(--c-amber)", color: "var(--c-on-amber)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-title)" } }, "\u2713"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)" } }, "Claimed ", psUSD(claim.amount)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", textAlign: "center", maxWidth: 360 } }, "The funds are in your wallet. Next distribution arrives Apr 1.")), stage === "error" && /* @__PURE__ */ React.createElement(
    ErrorState,
    {
      icon: "alert",
      title: "That claim didn't go through",
      body: "The transaction was dropped before it confirmed \u2014 a gas spike on Base, most likely. Your funds were never touched, so it's safe to try again.",
      onRetry: () => setStage("signing")
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 22px", borderTop: "1px solid var(--c-line)", display: "flex", justifyContent: "flex-end", gap: 8 } }, stage === "review" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: btnGhost_producerState(), "aria-label": "Close", title: "Close" }, "Cancel"), /* @__PURE__ */ React.createElement("button", { onClick: () => setStage("signing"), style: btnPrimary_producerState() }, "Sign & claim ", psUSD(claim.amount), " \u2192")), stage === "done" && /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: btnPrimary_producerState(), "aria-label": "Close", title: "Close" }, "Done"), stage === "error" && /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: btnGhost_producerState(), "aria-label": "Close", title: "Close" }, "Close"))));
}
function BidModal_producerState({ project, tier, onClose }) {
  const { placeBid } = useProducerSession();
  const [stage, setStage] = psUseState("form");
  const [pricePct, setPricePct] = psUseState(105);
  const [qty, setQty] = psUseState(1);
  const [expiry, setExpiry] = psUseState("7d");
  const t = tier || project.tiers[0];
  const priceUSD = Math.round(t.priceUSD * (pricePct / 100));
  const total = priceUSD * qty;
  const submit = () => {
    placeBid({
      projectId: project.id,
      projectTitle: project.film?.title || project.title,
      tier: t.id,
      priceUSD,
      qty,
      expiry
    });
    setStage("done");
  };
  return /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: { position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
    width: "min(440px, 100%)",
    height: "100%",
    background: "var(--c-panel)",
    borderLeft: "1px solid var(--c-line-2)",
    overflowY: "auto",
    animation: "bid-slide-in 240ms cubic-bezier(.2,.8,.2,1)",
    boxShadow: "-20px 0 60px rgba(0,0,0,.5)"
  } }, /* @__PURE__ */ React.createElement("style", null, `@keyframes bid-slide-in { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`), /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 22px", borderBottom: "1px solid var(--c-line)", display: "flex", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" } }, stage === "form" ? "PLACE BID \xB7 SECONDARY" : "BID PLACED"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", marginTop: 2 } }, project.film?.title || project.title, " \xB7 ", t.name)), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: { appearance: "none", background: "transparent", border: 0, color: "var(--c-ink-3)", fontSize: "var(--fs-lead)", cursor: "pointer", padding: 6 }, "aria-label": "Close", title: "Close" }, "\xD7")), /* @__PURE__ */ React.createElement("div", { style: { padding: 22 } }, stage === "form" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 18 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 8 } }, "BID PRICE"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", fontWeight: 500, color: "var(--c-amber)" } }, "$", priceUSD.toLocaleString()), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: pricePct >= 100 ? "var(--c-amber)" : "var(--c-ink-3)" } }, pricePct >= 100 ? "+" : "", pricePct - 100, "% vs floor ($", t.priceUSD, ")")), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min: 70,
      max: 140,
      step: 1,
      value: pricePct,
      onChange: (e) => setPricePct(parseInt(e.target.value)),
      style: { width: "100%", accentColor: tkc("amber") }
    }
  ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 4 } }, /* @__PURE__ */ React.createElement("span", null, "\u221230%"), /* @__PURE__ */ React.createElement("span", null, "FLOOR"), /* @__PURE__ */ React.createElement("span", null, "+40%"))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 8 } }, "QUANTITY"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setQty(Math.max(1, qty - 1)), style: btnSmall() }, "\u2212"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-display)", fontSize: "var(--fs-title)", minWidth: 30, textAlign: "center" } }, qty), /* @__PURE__ */ React.createElement("button", { onClick: () => setQty(Math.min(5, qty + 1)), style: btnSmall() }, "+"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 8 } }, "EXPIRES"), /* @__PURE__ */ React.createElement("select", { value: expiry, onChange: (e) => setExpiry(e.target.value), style: {
    width: "100%",
    padding: "8px 12px",
    background: "var(--c-panel-2)",
    border: "1px solid var(--c-line)",
    borderRadius: "var(--r-2)",
    color: "var(--c-ink)",
    fontSize: "var(--fs-body)"
  } }, /* @__PURE__ */ React.createElement("option", { value: "1d" }, "1 day"), /* @__PURE__ */ React.createElement("option", { value: "3d" }, "3 days"), /* @__PURE__ */ React.createElement("option", { value: "7d" }, "7 days"), /* @__PURE__ */ React.createElement("option", { value: "30d" }, "30 days")))), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: 14, fontSize: "var(--fs-body)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-3)" } }, "Bid total"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink)", fontFamily: "var(--f-mono)" } }, "$", total.toLocaleString())), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-3)" } }, "Funds escrowed until accepted/cancelled"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-good)", fontFamily: "var(--f-mono)" } }, "WETH")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-3)" } }, "Cina fee"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-2)", fontFamily: "var(--f-mono)" } }, "2.5% on accept")))), stage === "done" && /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 56, height: 56, borderRadius: "50%", background: "var(--c-amber)", color: "var(--c-on-amber)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-title)" } }, "\u2713"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)" } }, "Bid is live"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", textAlign: "center", maxWidth: 360 } }, "We'll notify you the moment a holder accepts. Expires in ", expiry, "."))), /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 22px", borderTop: "1px solid var(--c-line)", display: "flex", justifyContent: "flex-end", gap: 8 } }, stage === "form" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: btnGhost_producerState(), "aria-label": "Close", title: "Close" }, "Cancel"), /* @__PURE__ */ React.createElement("button", { onClick: submit, style: btnPrimary_producerState() }, "Place $", total.toLocaleString(), " bid \u2192")), stage === "done" && /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: btnPrimary_producerState(), "aria-label": "Close", title: "Close" }, "Done"))));
}
function ListModal({ project, holding, onClose }) {
  const { listForSale } = useProducerSession();
  const [stage, setStage] = psUseState("form");
  const t = project.tiers.find((x) => x.id === holding.tier) || project.tiers[0];
  const [pricePct, setPricePct] = psUseState(110);
  const [qty, setQty] = psUseState(Math.min(holding.qty, 1));
  const priceUSD = Math.round(t.priceUSD * (pricePct / 100));
  const submit = () => {
    listForSale({
      projectId: project.id,
      projectTitle: project.film?.title || project.title,
      tier: t.id,
      priceUSD,
      qty
    });
    setStage("done");
  };
  return /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: { position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
    width: "min(440px, 100%)",
    height: "100%",
    background: "var(--c-panel)",
    borderLeft: "1px solid var(--c-line-2)",
    overflowY: "auto",
    animation: "bid-slide-in 240ms cubic-bezier(.2,.8,.2,1)",
    boxShadow: "-20px 0 60px rgba(0,0,0,.5)"
  } }, /* @__PURE__ */ React.createElement("style", null, `@keyframes bid-slide-in { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`), /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 22px", borderBottom: "1px solid var(--c-line)", display: "flex", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" } }, stage === "form" ? "LIST FOR SALE" : "LISTED"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", marginTop: 2 } }, project.film?.title || project.title, " \xB7 ", t.name)), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: { appearance: "none", background: "transparent", border: 0, color: "var(--c-ink-3)", fontSize: "var(--fs-lead)", cursor: "pointer", padding: 6 }, "aria-label": "Close", title: "Close" }, "\xD7")), /* @__PURE__ */ React.createElement("div", { style: { padding: 22, display: "flex", flexDirection: "column", gap: 16 } }, stage === "form" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 8 } }, "ASK PRICE"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", color: "var(--c-amber)" } }, "$", priceUSD.toLocaleString()), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" } }, pricePct >= 100 ? "+" : "", pricePct - 100, "% vs floor")), /* @__PURE__ */ React.createElement("input", { type: "range", min: 80, max: 200, step: 1, value: pricePct, onChange: (e) => setPricePct(parseInt(e.target.value)), style: { width: "100%", marginTop: 6, accentColor: tkc("amber") } })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 8 } }, "QUANTITY (you hold ", holding.qty, ")"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setQty(Math.max(1, qty - 1)), style: btnSmall() }, "\u2212"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-display)", fontSize: "var(--fs-title)", minWidth: 30, textAlign: "center" } }, qty), /* @__PURE__ */ React.createElement("button", { onClick: () => setQty(Math.min(holding.qty, qty + 1)), style: btnSmall() }, "+"))), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: 14, fontSize: "var(--fs-body)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-3)" } }, "You receive (after 2.5% fee)"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-good)", fontFamily: "var(--f-mono)" } }, "$", (priceUSD * qty * 0.975).toFixed(0))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-3)" } }, "Creator royalty"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-2)", fontFamily: "var(--f-mono)" } }, "5% to ", project.creator)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-3)" } }, "Listing duration"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-2)", fontFamily: "var(--f-mono)" } }, "30 days")))), stage === "done" && /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 56, height: 56, borderRadius: "50%", background: "var(--c-amber)", color: "var(--c-on-amber)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-title)" } }, "\u2713"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)" } }, "Listed for $", priceUSD.toLocaleString()), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", textAlign: "center", maxWidth: 340 } }, "You can cancel anytime from the Portfolio."))), /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 22px", borderTop: "1px solid var(--c-line)", display: "flex", justifyContent: "flex-end", gap: 8 } }, stage === "form" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: btnGhost_producerState(), "aria-label": "Close", title: "Close" }, "Cancel"), /* @__PURE__ */ React.createElement("button", { onClick: submit, style: btnPrimary_producerState() }, "List \xD7", qty, " for $", priceUSD.toLocaleString(), " \u2192")), stage === "done" && /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: btnPrimary_producerState(), "aria-label": "Close", title: "Close" }, "Done"))));
}
function btnPrimary_producerState() {
  return {
    appearance: "none",
    padding: "10px 16px",
    background: "var(--c-amber)",
    color: tkc("on-amber"),
    border: 0,
    borderRadius: "var(--r-2)",
    fontWeight: 600,
    fontSize: "var(--fs-body)",
    cursor: "pointer",
    letterSpacing: ".02em",
    fontFamily: "var(--f-sans)"
  };
}
function btnGhost_producerState() {
  return {
    appearance: "none",
    padding: "10px 14px",
    background: "transparent",
    border: "1px solid var(--c-line)",
    borderRadius: "var(--r-2)",
    color: tkc("ink"),
    fontSize: "var(--fs-body)",
    cursor: "pointer",
    fontFamily: "var(--f-sans)"
  };
}
function btnSmall() {
  return {
    appearance: "none",
    width: 30,
    height: 30,
    background: tkc("panel-2"),
    border: "1px solid var(--c-line)",
    borderRadius: "var(--r-2)",
    color: tkc("ink"),
    fontSize: "var(--fs-body)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };
}
function ProducerFlowsHost() {
  const [claimOpen, setClaimOpen] = psUseState(null);
  const [bidOpen, setBidOpen] = psUseState(null);
  const [listOpen, setListOpen] = psUseState(null);
  psUseEffect(() => {
    window.openClaimModal = (claim, project) => setClaimOpen({ claim, project });
    window.openBidModal = (project, tier) => setBidOpen({ project, tier });
    window.openListModal = (project, holding) => setListOpen({ project, holding });
    return () => {
      delete window.openClaimModal;
      delete window.openBidModal;
      delete window.openListModal;
    };
  }, []);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, claimOpen && /* @__PURE__ */ React.createElement(ClaimModal_producerState, { claim: claimOpen.claim, project: claimOpen.project, onClose: () => setClaimOpen(null) }), bidOpen && /* @__PURE__ */ React.createElement(BidModal_producerState, { project: bidOpen.project, tier: bidOpen.tier, onClose: () => setBidOpen(null) }), listOpen && /* @__PURE__ */ React.createElement(ListModal, { project: listOpen.project, holding: listOpen.holding, onClose: () => setListOpen(null) }));
}
function DistributionSchedule({ claims, projects, onClaim }) {
  const items = psUseMemo(() => {
    return [...claims].sort((a, b) => {
      const order = { claimable: 0, upcoming: 1, claimed: 2 };
      return (order[a.status] || 0) - (order[b.status] || 0);
    });
  }, [claims]);
  if (items.length === 0) {
    return /* @__PURE__ */ React.createElement("div", { style: { padding: 32, textAlign: "center", color: "var(--c-ink-3)", border: "1px dashed var(--c-line)", borderRadius: "var(--r-3)" } }, "No distributions yet \u2014 they accrue as your projects earn.");
  }
  return /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr", padding: "10px 16px", background: "var(--c-panel-2)", borderBottom: "1px solid var(--c-line)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, /* @__PURE__ */ React.createElement("div", null, "PROJECT"), /* @__PURE__ */ React.createElement("div", null, "PERIOD"), /* @__PURE__ */ React.createElement("div", null, "STATUS"), /* @__PURE__ */ React.createElement("div", null, "AMOUNT"), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, "ACTION")), items.map((c, i) => {
    const proj = projects.find((p) => p.id === c.projectId);
    const statusColor = c.status === "claimable" ? "var(--c-amber)" : c.status === "claimed" ? "var(--c-good)" : "var(--c-ink-3)";
    return /* @__PURE__ */ React.createElement("div", { key: c.id, style: {
      display: "grid",
      gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr",
      padding: "12px 16px",
      alignItems: "center",
      fontSize: "var(--fs-body)",
      borderBottom: i < items.length - 1 ? "1px solid var(--c-line)" : 0
    } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, proj && /* @__PURE__ */ React.createElement("div", { style: { width: 36, height: 24, borderRadius: "var(--r-1)", background: proj.color } }), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-display)", fontStyle: "italic" } }, proj?.film?.title || proj?.title || c.projectId)), /* @__PURE__ */ React.createElement("div", { style: { color: "var(--c-ink-2)" } }, c.period), /* @__PURE__ */ React.createElement("div", { style: { color: statusColor, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase" } }, c.status), /* @__PURE__ */ React.createElement("div", { style: { color: "var(--c-amber)", fontFamily: "var(--f-mono)", fontWeight: 500 } }, psUSD(c.amount)), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, c.status === "claimable" ? /* @__PURE__ */ React.createElement("button", { onClick: () => onClaim(c, proj), style: { ...btnPrimary_producerState(), padding: "6px 12px", fontSize: "var(--fs-label)" } }, "Claim \u2192") : c.status === "claimed" ? /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" } }, psRelTime(c.claimedAt || c.availableAt)) : /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" } }, "Pending")));
  }));
}
function PortfolioSpark({ width = 720, height = 160 }) {
  const points = psUseMemo(() => {
    return Array.from({ length: 60 }, (_, i) => {
      const base = 1 + i / 60 * 0.32;
      const wave = Math.sin(i / 7) * 0.06 + Math.cos(i / 11) * 0.04;
      return base + wave;
    });
  }, []);
  const w = width, h = height, pad = 6;
  const min = Math.min(...points) * 0.97, max = Math.max(...points) * 1.03;
  const pts = points.map((v, i) => [
    pad + i / (points.length - 1) * (w - pad * 2),
    h - pad - (v - min) / (max - min) * (h - pad * 2)
  ]);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const fill = `${path} L${pts[pts.length - 1][0]},${h - pad} L${pts[0][0]},${h - pad} Z`;
  return /* @__PURE__ */ React.createElement("svg", { viewBox: `0 0 ${w} ${h}`, style: { width: "100%", height } }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("linearGradient", { id: "psp", x1: "0", x2: "0", y1: "0", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: "var(--c-amber)", stopOpacity: ".3" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: "var(--c-amber)", stopOpacity: "0" }))), [0.25, 0.5, 0.75].map((y) => /* @__PURE__ */ React.createElement("line", { key: y, x1: pad, x2: w - pad, y1: pad + (h - pad * 2) * y, y2: pad + (h - pad * 2) * y, stroke: "rgba(232,227,214,.06)", strokeDasharray: "2 4" })), /* @__PURE__ */ React.createElement("path", { d: fill, fill: "url(#psp)" }), /* @__PURE__ */ React.createElement("path", { d: path, fill: "none", stroke: "var(--c-amber)", strokeWidth: "1.5" }));
}
Object.assign(window, { useProducerSession, HeartButton, ProducerNotifBell, ProducerFlowsHost, DistributionSchedule, PortfolioSpark, psRelTime });

  try { if (typeof psUseState !== "undefined") window["psUseState"] = psUseState; } catch (_) {}
  try { if (typeof psUseEffect !== "undefined") window["psUseEffect"] = psUseEffect; } catch (_) {}
  try { if (typeof psUseMemo !== "undefined") window["psUseMemo"] = psUseMemo; } catch (_) {}
  try { if (typeof psUseRef !== "undefined") window["psUseRef"] = psUseRef; } catch (_) {}
  try { if (typeof psUseCallback !== "undefined") window["psUseCallback"] = psUseCallback; } catch (_) {}
  try { if (typeof PS_KEY !== "undefined") window["PS_KEY"] = PS_KEY; } catch (_) {}
  try { if (typeof psLoad !== "undefined") window["psLoad"] = psLoad; } catch (_) {}
  try { if (typeof psSave !== "undefined") window["psSave"] = psSave; } catch (_) {}
  try { if (typeof psSeed !== "undefined") window["psSeed"] = psSeed; } catch (_) {}
  try { if (typeof psUSD !== "undefined") window["psUSD"] = psUSD; } catch (_) {}
  try { if (typeof ensureSession !== "undefined") window["ensureSession"] = ensureSession; } catch (_) {}
  try { if (typeof useProducerSession !== "undefined") window["useProducerSession"] = useProducerSession; } catch (_) {}
  try { if (typeof HeartButton !== "undefined") window["HeartButton"] = HeartButton; } catch (_) {}
  try { if (typeof ProducerNotifBell !== "undefined") window["ProducerNotifBell"] = ProducerNotifBell; } catch (_) {}
  try { if (typeof psRelTime !== "undefined") window["psRelTime"] = psRelTime; } catch (_) {}
  try { if (typeof ClaimModal_producerState !== "undefined") window["ClaimModal_producerState"] = ClaimModal_producerState; } catch (_) {}
  try { if (typeof BidModal_producerState !== "undefined") window["BidModal_producerState"] = BidModal_producerState; } catch (_) {}
  try { if (typeof ListModal !== "undefined") window["ListModal"] = ListModal; } catch (_) {}
  try { if (typeof btnPrimary_producerState !== "undefined") window["btnPrimary_producerState"] = btnPrimary_producerState; } catch (_) {}
  try { if (typeof btnGhost_producerState !== "undefined") window["btnGhost_producerState"] = btnGhost_producerState; } catch (_) {}
  try { if (typeof btnSmall !== "undefined") window["btnSmall"] = btnSmall; } catch (_) {}
  try { if (typeof ProducerFlowsHost !== "undefined") window["ProducerFlowsHost"] = ProducerFlowsHost; } catch (_) {}
  try { if (typeof DistributionSchedule !== "undefined") window["DistributionSchedule"] = DistributionSchedule; } catch (_) {}
  try { if (typeof PortfolioSpark !== "undefined") window["PortfolioSpark"] = PortfolioSpark; } catch (_) {}
})();

// ── MODULE: producers-extras.jsx ──
;(function() {
const { useState: usPex, useEffect: uePex, useMemo: umPex } = React;
function HowItWorks() {
  const steps = [
    { n: "01", t: "Browse", b: "Every Cina film and series opens a fundraise. Pick a project, read the slate, see the director's commitments." },
    { n: "02", t: "Pick a tier", b: "Three tiers. Collector ($90+), Patron ($400+), Producer ($2,500+). Higher tiers = larger revenue share + more perks." },
    { n: "03", t: "Earn", b: "Quarterly royalties from Watch subs, ad revenue, and licensing. Smart contracts auto-route on settlement. No invoices." },
    { n: "04", t: "Trade or hold", b: "Sell your stake on the secondary market anytime. Cina takes 1% of resale. Holders watch films first." }
  ];
  return /* @__PURE__ */ React.createElement("section", { style: {
    marginTop: 32,
    padding: "26px 30px",
    background: "linear-gradient(135deg, rgba(var(--accent-rgb),.05) 0%, var(--c-panel) 80%)",
    border: "1px solid var(--c-line)",
    borderLeft: "2px solid var(--c-amber)",
    borderRadius: "var(--r-2)"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 600 } }, "HOW IT WORKS"), /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, letterSpacing: "-0.01em", color: "var(--c-ink)" } }, "Back films. Earn royalties. Trade your stake.")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 } }, steps.map((s) => /* @__PURE__ */ React.createElement("div", { key: s.n, style: { display: "flex", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: {
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    color: "var(--c-amber)",
    fontWeight: 700,
    flexShrink: 0,
    paddingTop: 2
  } }, s.n), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500, lineHeight: 1.1 } }, s.t), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5, marginTop: 4 } }, s.b))))));
}
function TopMovers({ projects, onOpen }) {
  const movers = umPex(() => {
    return projects.map((p) => {
      const seed = (p.id || "x").split("").reduce((s, c) => s + c.charCodeAt(0), 0);
      const change24h = (seed * 13 % 60 - 18) / 10;
      const floor = p.tiers?.[0]?.priceUSD || 100;
      return { ...p, change24h, floor };
    }).sort((a, b) => b.change24h - a.change24h);
  }, [projects]);
  const top = movers.slice(0, 6);
  const trades = umPex(() => {
    const ticker = ["BUY", "BUY", "SELL", "BUY", "SELL", "BUY", "BUY"];
    return top.slice(0, 7).map((p, i) => ({
      side: ticker[i] || "BUY",
      project: p,
      tier: ["Collector", "Patron", "Producer"][i % 3],
      qty: [1, 2, 1, 3, 1, 4, 1][i],
      price: Math.round(p.floor * (0.9 + i % 4 * 0.1)),
      who: ["0xA1c4..f3D2", "0x9b48..ce71", "0x4f02..b8c1", "0x77a2..00ee", "0x2210..3def", "0x80c1..1e22", "0x5566..aabb"][i],
      ago: `${(i + 1) * 14}s`
    }));
  }, [top]);
  return /* @__PURE__ */ React.createElement("section", { className: "pex-movers", style: { marginTop: 28, display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: 18 } }, /* @__PURE__ */ React.createElement("style", null, `.pex-row{grid-template-columns:44px minmax(0,1fr) 80px 80px 80px}
@media (max-width:860px){.pex-movers{grid-template-columns:minmax(0,1fr)!important}}
@media (max-width:600px){.pex-row{grid-template-columns:40px minmax(0,1fr) 62px 64px;padding-left:14px!important;padding-right:14px!important}.pex-row>:nth-child(5){display:none}}`), /* @__PURE__ */ React.createElement("div", { style: {
    background: "var(--c-panel)",
    border: "1px solid var(--c-line)",
    borderRadius: "var(--r-2)",
    overflow: "hidden"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    padding: "12px 18px",
    background: "var(--c-panel-2)",
    borderBottom: "1px solid var(--c-line)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    color: "var(--c-ink-3)",
    textTransform: "uppercase"
  } }, /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 6px var(--c-good)" } }), /* @__PURE__ */ React.createElement("span", null, "TOP MOVERS \xB7 24H")), /* @__PURE__ */ React.createElement("div", { className: "pex-row", style: {
    display: "grid",
    padding: "10px 18px",
    background: "var(--c-panel-2)",
    borderBottom: "1px solid var(--c-line)",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    color: "var(--c-ink-3)",
    textTransform: "uppercase"
  } }, /* @__PURE__ */ React.createElement("div", null), /* @__PURE__ */ React.createElement("div", null, "PROJECT"), /* @__PURE__ */ React.createElement("div", null, "FLOOR"), /* @__PURE__ */ React.createElement("div", null, "24H"), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, "RAISED")), top.map((p, i) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: p.id,
      className: "pex-row",
      onClick: () => onOpen(p.id),
      style: {
        display: "grid",
        padding: "12px 18px",
        alignItems: "center",
        gap: 4,
        border: "none",
        background: "transparent",
        borderBottom: i < top.length - 1 ? "1px solid var(--c-line)" : "none",
        color: "inherit",
        textAlign: "left",
        cursor: "pointer",
        width: "100%",
        transition: "background .14s"
      },
      onMouseEnter: (e) => e.currentTarget.style.background = "var(--c-panel-2)",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
    },
    /* @__PURE__ */ React.createElement("div", { style: { width: 34, height: 22, borderRadius: "var(--r-1)", overflow: "hidden", background: p.color } }, typeof FrameThumb === "function" && /* @__PURE__ */ React.createElement(FrameThumb, { kind: p.thumb, usePhoto: true })),
    /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.1 } }, p.film?.title || p.title, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", marginLeft: 8, fontStyle: "normal" } }, p.kind === "series" ? "SERIES" : "FILM")),
    /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-amber)", fontWeight: 600 } }, "$", p.floor),
    /* @__PURE__ */ React.createElement("div", { style: {
      fontFamily: "var(--f-mono)",
      fontSize: "var(--fs-body)",
      fontWeight: 600,
      color: p.change24h >= 0 ? "var(--c-good)" : "var(--c-blood-l)"
    } }, p.change24h >= 0 ? "\u25B2" : "\u25BC", " ", Math.abs(p.change24h).toFixed(1), "%"),
    /* @__PURE__ */ React.createElement("div", { style: {
      fontFamily: "var(--f-mono)",
      fontSize: "var(--fs-label)",
      color: "var(--c-ink-2)",
      textAlign: "right"
    } }, "$", (p.raised / 1e3).toFixed(0), "k")
  ))), /* @__PURE__ */ React.createElement("div", { style: {
    background: "var(--c-panel)",
    border: "1px solid var(--c-line)",
    borderRadius: "var(--r-2)",
    overflow: "hidden"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    padding: "12px 18px",
    background: "var(--c-panel-2)",
    borderBottom: "1px solid var(--c-line)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    color: "var(--c-ink-3)",
    textTransform: "uppercase"
  } }, /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 6px var(--c-good)" } }), /* @__PURE__ */ React.createElement("span", null, "LIVE TRADES \xB7 ON-CHAIN")), trades.map((tr, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
    padding: "10px 16px",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 8,
    alignItems: "center",
    borderBottom: i < trades.length - 1 ? "1px solid var(--c-line)" : "none"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: "var(--fs-body)", minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: {
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    padding: "2px 5px",
    background: tr.side === "BUY" ? "rgba(106,163,122,.15)" : "rgba(201,85,72,.15)",
    color: tr.side === "BUY" ? "var(--c-good)" : "var(--c-blood-l)",
    border: `1px solid ${tr.side === "BUY" ? "rgba(106,163,122,.4)" : "rgba(201,85,72,.4)"}`,
    borderRadius: "var(--r-1)",
    letterSpacing: ".16em",
    fontWeight: 700
  } }, tr.side), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0, flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, tr.project.film?.title || tr.project.title), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", marginTop: 1 } }, "\xD7", tr.qty, " ", tr.tier, " \xB7 ", tr.who))), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-amber)", fontWeight: 600 } }, "$", (tr.price * tr.qty).toLocaleString()), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" } }, tr.ago))))));
}
Object.assign(window, { HowItWorks, TopMovers });

  try { if (typeof usPex !== "undefined") window["usPex"] = usPex; } catch (_) {}
  try { if (typeof uePex !== "undefined") window["uePex"] = uePex; } catch (_) {}
  try { if (typeof umPex !== "undefined") window["umPex"] = umPex; } catch (_) {}
  try { if (typeof HowItWorks !== "undefined") window["HowItWorks"] = HowItWorks; } catch (_) {}
  try { if (typeof TopMovers !== "undefined") window["TopMovers"] = TopMovers; } catch (_) {}
})();

// ── MODULE: producers-create.jsx ──
;(function() {
const { useState: usPC, useEffect: uePC, useMemo: umPC, useRef: urPC } = React;
let _pcSet = null;
function openCreateProject() {
  if (_pcSet) _pcSet(true);
}
window.openCreateProject = openCreateProject;
const PC_BASE_TIERS = [
  { id: "collector", name: "Collector", priceUSD: 120, count: 800, perks: ["Premiere window \xB7 watch first", "Animated frame collectible"] },
  { id: "patron", name: "Patron", priceUSD: 480, count: 120, perks: ["BTS vault access", "0.05% rev share \xB7 Y5"] },
  { id: "producer", name: "Producer", priceUSD: 3200, count: 12, perks: ["Production credit on screen", "0.6% rev share \xB7 Y5", "Set visit"] }
];
const PC_BRANCH_TIERS = [
  { id: "seat", name: "Room Seat", priceUSD: 90, count: 1200, perks: ["2\xD7 vote weight at every fork", "All cuts you unlock stay yours"] },
  { id: "fork", name: "Fork Rights", priceUSD: 620, count: 40, perks: ["Own one branch of the tree", "Rental revenue on that path"] },
  { id: "canonical", name: "Canonical Cut", priceUSD: 4200, count: 4, perks: ["Co-own the locked ending", "Named in the room credits", "1.2% rev share \xB7 Y5"] }
];
const PC_COLORS = [tkc("cat-3"), tkc("cat-6"), tkc("cat-6"), tkc("blood"), tkc("line-3"), tkc("cat-6"), tkc("warn"), tkc("ink-3")];
const PC_THUMBS = ["darkroom-wide", "frequency", "marauder", "swallows", "the-photo", "phone"];
function pcFmtUSD(n) {
  if (!n) return "$0";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return "$" + Math.round(n / 1e3) + "k";
  return "$" + Math.round(n);
}
function ProjectCreator() {
  const [open, setOpen] = usPC(false);
  uePC(() => {
    _pcSet = setOpen;
    return () => {
      _pcSet = null;
    };
  }, []);
  if (!open) return null;
  return /* @__PURE__ */ React.createElement(ProjectCreatorInstance, { onClose: () => setOpen(false) });
}
function ProjectCreatorInstance({ onClose }) {
  const [step, setStep] = usPC(0);
  const [data, setData] = usPC({
    title: "",
    kind: "film",
    genre: "Drama",
    runtime: 96,
    color: PC_COLORS[0],
    thumb: PC_THUMBS[0],
    coverUrl: "",
    logline: "",
    creator: window.USER?.handle || "you.eth",
    goalK: 250,
    daysLeft: 30,
    revShare: 8,
    chain: "Base",
    forkCount: 4,
    optionsPerFork: 3,
    voteWindowSec: 90,
    forks: [
      { act: "ACT I", at: 12, heading: "The first door.", question: "What does she do?" },
      { act: "ACT II", at: 38, heading: "Someone asks for a name.", question: "What name does she give?" },
      { act: "ACT III", at: 65, heading: "Headlights on the road.", question: "Who is it?" },
      { act: "FINALE", at: 88, heading: "The choice.", question: "How does it end?" }
    ],
    cutRentals: true,
    rentPriceUSD: 6,
    cutRevShare: 4,
    canonicalRule: "room",
    tiers: [
      { id: "collector", name: "Collector", priceUSD: 120, count: 800, perks: ["Premiere window \xB7 watch first", "Animated frame collectible"] },
      { id: "patron", name: "Patron", priceUSD: 480, count: 120, perks: ["BTS vault access", "0.05% rev share \xB7 Y5"] },
      { id: "producer", name: "Producer", priceUSD: 3200, count: 12, perks: ["Production credit on screen", "0.6% rev share \xB7 Y5", "Set visit"] }
    ],
    accept: false
  });
  const upd = (patch) => setData((d) => ({ ...d, ...patch }));
  const setFork = (i, patch) => setData((d) => ({ ...d, forks: d.forks.map((f, j) => j === i ? { ...f, ...patch } : f) }));
  const setTier = (i, patch) => setData((d) => ({ ...d, tiers: d.tiers.map((t, j) => j === i ? { ...t, ...patch } : t) }));
  const goal = data.goalK * 1e3;
  const projectedRaise = data.tiers.reduce((s, t) => s + t.priceUSD * t.count, 0);
  const branched = data.kind === "branched";
  const STEPS = branched ? ["Film", "Story", "Forks", "Raise", "Tiers", "Review", "Live"] : ["Film", "Story", "Raise", "Tiers", "Review", "Live"];
  const cur = STEPS[Math.min(step, STEPS.length - 1)];
  const lastNum = STEPS.length - 1;
  const canNext = cur === "Film" ? data.title.trim().length > 1 : cur === "Story" ? data.logline.trim().length > 8 : cur === "Forks" ? data.forks.slice(0, data.forkCount).every((f) => f.heading.trim().length > 2) : cur === "Raise" ? data.goalK > 0 : cur === "Tiers" ? data.tiers.every((t) => t.priceUSD > 0 && t.count > 0) && projectedRaise >= goal : cur === "Review" ? data.accept : true;
  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const launch = () => {
    const id = "usr-" + data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) + "-" + Date.now().toString(36).slice(-4);
    const proj = {
      id,
      filmId: id,
      kind: data.kind,
      thumb: data.thumb,
      cover: data.coverUrl || null,
      title: (data.title || "Untitled").toUpperCase(),
      creator: data.creator,
      creatorId: "you",
      color: data.color,
      raised: 0,
      goal,
      backers: 0,
      daysLeft: data.daysLeft,
      summary: data.logline,
      floorUSD: Math.min(...data.tiers.map((t) => t.priceUSD)),
      revShare: data.revShare,
      royaltyPaid: 0,
      nextDistribution: "2026-10-01",
      chain: data.chain,
      tiers: data.tiers.map((t, i) => ({ ...t, sold: 0, color: [tkc("ink-4"), tkc("cat-3"), "var(--c-amber)"][i] || tkc("ink-4") })),
      film: { id, title: data.title, kind: data.kind, creator: data.creator, color: data.color, thumb: data.thumb, cover: data.coverUrl || null, genre: data.genre, runtime: data.runtime },
      branched,
      branch: branched ? {
        filmId: id,
        title: data.title,
        forks: data.forkCount,
        optionsPerFork: data.optionsPerFork,
        totalCuts: Math.pow(data.optionsPerFork, data.forkCount),
        roomSize: 0,
        liveNow: 0,
        voteWindowSec: data.voteWindowSec,
        canonical: "\u2014",
        cutRevShare: data.cutRevShare,
        rentPriceUSD: data.rentPriceUSD,
        cutsRentedWk: 0,
        accent: data.color,
        forkSpec: data.forks.slice(0, data.forkCount)
      } : null,
      userLaunched: true,
      launchedAt: Date.now()
    };
    window.__cinaLaunched = [proj, ...window.__cinaLaunched || []];
    try {
      localStorage.setItem("cina-launched-v1", JSON.stringify(window.__cinaLaunched));
    } catch (_) {
    }
    window.dispatchEvent(new CustomEvent("cina-project-launched", { detail: proj }));
    next();
  };
  const back = () => step === 0 ? onClose() : setStep((s) => s - 1);
  uePC(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);
  return /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: {
    position: "fixed",
    inset: 0,
    zIndex: 9e3,
    background: "rgba(0,0,0,.8)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  } }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
    width: "min(1080px, 100%)",
    maxHeight: "100%",
    background: "var(--c-panel)",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-3)",
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "320px 1fr"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    background: "var(--c-void)",
    borderRight: "1px solid var(--c-line)",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 18
  } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", textTransform: "uppercase" } }, "LIVE PREVIEW"), /* @__PURE__ */ React.createElement(PcPreviewCard, { data, goal, projectedRaise }), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "auto", display: "flex", flexDirection: "column", gap: 4 } }, STEPS.map((s, i) => /* @__PURE__ */ React.createElement("div", { key: s, style: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "7px 10px",
    borderRadius: "var(--r-2)",
    background: i === step ? "rgba(var(--accent-rgb),.08)" : "transparent"
  } }, /* @__PURE__ */ React.createElement("span", { style: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    flexShrink: 0,
    background: i < step ? "var(--c-good)" : i === step ? "var(--c-amber)" : "var(--c-panel-2)",
    border: i === step ? "none" : "1px solid var(--c-line-2)",
    color: i < step ? tkc("void") : i === step ? tkc("on-amber") : "var(--c-ink-3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    fontWeight: 700
  } }, i < step ? "\u2713" : i + 1), /* @__PURE__ */ React.createElement("span", { style: {
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    textTransform: "uppercase",
    color: i === step ? "var(--c-ink)" : "var(--c-ink-3)",
    fontWeight: i === step ? 600 : 500
  } }, s))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
    padding: "18px 28px",
    borderBottom: "1px solid var(--c-line)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 3 } }, cur === "Live" ? "PROJECT LIVE \xB7 ON " + data.chain.toUpperCase() : (branched ? "LAUNCH A BRANCHED ROOM \xB7 STEP " : "LAUNCH A PROJECT \xB7 STEP ") + (step + 1) + " / " + lastNum), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, lineHeight: 1 } }, { Film: branched ? "Name your branched film" : "Name your film", Story: "Tell the story", Forks: "Build the fork tree", Raise: "Set the raise", Tiers: "Design the tiers", Review: "Review & launch", Live: "You're live" }[cur])), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
    width: 30,
    height: 30,
    background: "transparent",
    color: "var(--c-ink-3)",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-2)",
    cursor: "pointer",
    fontSize: "var(--fs-body)"
  }, "aria-label": "Close", title: "Close" }, "\xD7")), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "26px 28px", minHeight: 380 } }, cur === "Film" && /* @__PURE__ */ React.createElement(PcStepFilm, { data, upd }), cur === "Story" && /* @__PURE__ */ React.createElement(PcStepStory, { data, upd }), cur === "Forks" && /* @__PURE__ */ React.createElement(PcStepForks, { data, upd, setFork }), cur === "Raise" && /* @__PURE__ */ React.createElement(PcStepRaise, { data, upd, goal }), cur === "Tiers" && /* @__PURE__ */ React.createElement(PcStepTiers, { data, setTier, projectedRaise, goal }), cur === "Review" && /* @__PURE__ */ React.createElement(PcStepReview, { data, upd, goal, projectedRaise }), cur === "Live" && /* @__PURE__ */ React.createElement(PcStepLive, { data, onClose })), cur !== "Live" && /* @__PURE__ */ React.createElement("div", { style: {
    padding: "14px 28px",
    borderTop: "1px solid var(--c-line)",
    background: "var(--c-panel-2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  } }, /* @__PURE__ */ React.createElement("button", { onClick: back, style: {
    padding: "10px 16px",
    background: "transparent",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-2)",
    color: "var(--c-ink-2)",
    cursor: "pointer",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    fontWeight: 600,
    textTransform: "uppercase"
  } }, step === 0 ? "Cancel" : "\u2190 Back"), /* @__PURE__ */ React.createElement("div", { style: {
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    color: "var(--c-ink-3)",
    letterSpacing: ".16em",
    textTransform: "uppercase"
  } }, cur === "Tiers" && /* @__PURE__ */ React.createElement(React.Fragment, null, "Projected raise \xB7 ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-amber)", fontWeight: 600 } }, pcFmtUSD(projectedRaise))), cur === "Raise" && /* @__PURE__ */ React.createElement(React.Fragment, null, "Goal \xB7 ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-amber)", fontWeight: 600 } }, pcFmtUSD(goal))), cur === "Forks" && /* @__PURE__ */ React.createElement(React.Fragment, null, Math.pow(data.optionsPerFork, data.forkCount).toLocaleString(), " possible cuts")), /* @__PURE__ */ React.createElement("button", { disabled: !canNext, onClick: () => {
    if (cur === "Review") launch();
    else next();
  }, style: {
    padding: "10px 22px",
    background: canNext ? "var(--c-amber)" : "var(--c-line)",
    color: canNext ? tkc("on-amber") : "var(--c-ink-4)",
    border: "none",
    borderRadius: "var(--r-2)",
    cursor: canNext ? "pointer" : "not-allowed",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    fontWeight: 700,
    textTransform: "uppercase"
  } }, cur === "Review" ? branched ? "Open the room \u2192" : "Launch project \u2192" : "Next \u2192")))));
}
function PcPreviewCard({ data, goal, projectedRaise }) {
  const pct = Math.min(1, projectedRaise / goal);
  const cheapest = [...data.tiers].sort((a, b) => a.priceUSD - b.priceUSD)[0];
  return /* @__PURE__ */ React.createElement("div", { style: {
    background: "var(--c-panel)",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-2)",
    overflow: "hidden"
  } }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative", aspectRatio: "16/9", background: data.color, overflow: "hidden" } }, data.coverUrl ? /* @__PURE__ */ React.createElement("img", { src: data.coverUrl, alt: "", style: { width: "100%", height: "100%", objectFit: "cover", display: "block" } }) : typeof FrameThumb === "function" && /* @__PURE__ */ React.createElement(FrameThumb, { kind: data.thumb, usePhoto: true }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.1), rgba(0,0,0,.7))" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 8, left: 8, padding: "3px 7px", background: "rgba(0,0,0,.6)", border: "1px solid rgba(255,255,255,.15)", borderRadius: "var(--r-1)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tkc("white"), letterSpacing: ".16em" } }, data.kind === "branched" ? "BRANCHED" : data.kind === "series" ? "SERIES" : "FILM"), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 10, bottom: 8, right: 10, color: tkc("white") } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, lineHeight: 1 } }, data.title || "Untitled"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.65)", letterSpacing: ".16em", marginTop: 3 } }, data.creator.toUpperCase()))), /* @__PURE__ */ React.createElement("div", { style: { padding: 12, display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, "FROM"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-amber)", fontWeight: 500, lineHeight: 1 } }, "$", cheapest.priceUSD)), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, "REV SHARE"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500, lineHeight: 1 } }, data.revShare, "%"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { height: 3, background: "var(--c-line)", borderRadius: 999, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: `${pct * 100}%`, height: "100%", background: "var(--c-amber)" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 5, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em" } }, /* @__PURE__ */ React.createElement("span", null, pcFmtUSD(projectedRaise), " projected"), /* @__PURE__ */ React.createElement("span", null, (pct * 100).toFixed(0), "% / ", pcFmtUSD(goal))))));
}
const PC_LIBRARY = [
  "noir-m",
  "noir-f",
  "face-night",
  "alley-night",
  "lantern",
  "window-rain",
  "interior-dim",
  "scared-hall",
  "west-rider",
  "west-riders",
  "west-canyon",
  "west-dusk",
  "sci-surface",
  "sci-neon",
  "sci-ship",
  "sci-city"
];
function pcGenreStills(genre) {
  const m = {
    "Drama": ["window-rain", "interior-dim", "lantern", "noir-f", "face-night", "scared-hall"],
    "Sci-fi": ["sci-surface", "sci-neon", "sci-ship", "sci-city", "face-night", "interior-dim"],
    "Horror": ["scared-hall", "alley-night", "lantern", "interior-dim", "face-night", "west-dusk"],
    "Thriller": ["noir-m", "alley-night", "face-night", "interior-dim", "west-canyon", "sci-ship"],
    "Doc": ["window-rain", "interior-dim", "west-rider", "sci-city", "noir-m", "lantern"],
    "Romance": ["window-rain", "lantern", "noir-f", "interior-dim", "face-night", "west-dusk"]
  };
  return m[genre] || PC_LIBRARY.slice(0, 6);
}
function pcCoverSrc(kind) {
  return window._photoForKind ? window._photoForKind(kind) : null;
}
function PcCoverThumb({ kind, url, selected, onClick, fixed }) {
  const src = url || pcCoverSrc(kind);
  return /* @__PURE__ */ React.createElement("button", { onClick, style: {
    ...fixed ? { width: fixed.w, height: fixed.h } : { width: "100%", aspectRatio: "16 / 10" },
    borderRadius: "var(--r-2)",
    overflow: "hidden",
    padding: 0,
    cursor: "pointer",
    border: selected ? "2px solid var(--c-amber)" : "1px solid var(--c-line-2)",
    background: tkc("panel"),
    position: "relative",
    flexShrink: 0,
    boxShadow: selected ? "0 0 0 2px rgba(var(--accent-rgb),.25)" : "none"
  } }, src && /* @__PURE__ */ React.createElement("img", { src, alt: "", style: { width: "100%", height: "100%", objectFit: "cover", display: "block" } }), selected && /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%", background: "var(--c-amber)", color: "var(--c-on-amber)", fontSize: "var(--fs-label)", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" } }, "\u2713"));
}
function PcCoverArt({ data, upd }) {
  const [mode, setMode] = usPC("ai");
  const [prompt, setPrompt] = usPC("");
  const [busy, setBusy] = usPC(false);
  const [gen, setGen] = usPC([]);
  const [nonce, setNonce] = usPC(0);
  const fileRef = urPC(null);
  uePC(() => {
    setPrompt(`${data.genre}${data.title ? " \xB7 " + data.title : ""} \u2014 cinematic key art, moody light`);
  }, []);
  const pickKind = (k) => upd({ thumb: k, coverUrl: "" });
  const isSel = (k) => !data.coverUrl && data.thumb === k;
  const generate = () => {
    setBusy(true);
    const seed = (prompt || data.genre) + "#" + nonce;
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = h * 31 + seed.charCodeAt(i) | 0;
    setTimeout(() => {
      const pool = [...PC_LIBRARY];
      const out = [];
      let x = Math.abs(h) || 7;
      while (out.length < 4 && pool.length) {
        x = x * 1103515245 + 12345 & 2147483647;
        out.push(pool.splice(x % pool.length, 1)[0]);
      }
      setGen(out);
      setBusy(false);
      setNonce((n) => n + 1);
    }, 850);
  };
  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      window.toast && window.toast({ title: "TOO LARGE", text: "Pick an image under 5 MB.", kind: "warn" });
      e.target.value = "";
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      upd({ coverUrl: r.result });
      window.toast && window.toast({ title: "COVER UPLOADED", text: "Using your image as key art.", kind: "good" });
    };
    r.readAsDataURL(f);
    e.target.value = "";
  };
  const TABS = [["ai", "\u2726 AI generate"], ["stills", "Film stills"], ["upload", "Upload"], ["library", "Library"]];
  const note = { fontSize: "var(--fs-body)", color: "var(--c-ink-4)", margin: "0 0 10px", lineHeight: 1.5 };
  return /* @__PURE__ */ React.createElement(PcField, { label: "Cover art" }, /* @__PURE__ */ React.createElement("style", null, "@keyframes pcPulse{0%,100%{opacity:.45}50%{opacity:.9}}"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" } }, TABS.map(([id, lab]) => /* @__PURE__ */ React.createElement("button", { key: id, onClick: () => setMode(id), style: pcChip(mode === id) }, lab))), mode === "ai" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "stretch" } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      value: prompt,
      onChange: (e) => setPrompt(e.target.value),
      placeholder: "Describe the key art\u2026",
      onKeyDown: (e) => {
        if (e.key === "Enter") generate();
      },
      style: { ...pcInput, flex: 1 }
    }
  ), /* @__PURE__ */ React.createElement("button", { onClick: generate, disabled: busy, style: {
    padding: "0 16px",
    background: "var(--c-amber)",
    color: "var(--c-on-amber)",
    border: "none",
    borderRadius: "var(--r-2)",
    cursor: busy ? "default" : "pointer",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    fontWeight: 700,
    whiteSpace: "nowrap",
    opacity: busy ? 0.7 : 1
  } }, busy ? "GENERATING\u2026" : "\u2726 GENERATE")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 } }, busy && Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { aspectRatio: "16 / 10", borderRadius: "var(--r-2)", background: "var(--c-panel-2)", animation: "pcPulse 1s ease-in-out infinite", animationDelay: `${i * 0.12}s` } })), !busy && gen.map((k) => /* @__PURE__ */ React.createElement(PcCoverThumb, { key: k, kind: k, selected: isSel(k), onClick: () => pickKind(k) })), !busy && gen.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { gridColumn: "1 / -1", padding: "22px 16px", textAlign: "center", border: "1px dashed var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink-4)", fontSize: "var(--fs-body)" } }, "Write a prompt and hit Generate to render four cover options."))), mode === "stills" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { style: note }, "Frames pulled from your ", data.genre.toLowerCase(), " ", data.kind === "series" ? "series" : "film", ". Pick a still to use as key art."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 } }, pcGenreStills(data.genre).map((k) => /* @__PURE__ */ React.createElement(PcCoverThumb, { key: k, kind: k, selected: isSel(k), onClick: () => pickKind(k) })))), mode === "upload" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("input", { ref: fileRef, type: "file", accept: "image/*", onChange: onFile, style: { display: "none" } }), data.coverUrl ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 14, alignItems: "center" } }, /* @__PURE__ */ React.createElement("img", { src: data.coverUrl, alt: "", style: { width: 168, aspectRatio: "16 / 10", objectFit: "cover", borderRadius: "var(--r-2)", border: "2px solid var(--c-amber)" } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => fileRef.current && fileRef.current.click(), style: pcChip(false) }, "Replace image"), /* @__PURE__ */ React.createElement("button", { onClick: () => upd({ coverUrl: "" }), style: pcChip(false) }, "Remove"))) : /* @__PURE__ */ React.createElement("button", { onClick: () => fileRef.current && fileRef.current.click(), style: {
    width: "100%",
    padding: "30px 16px",
    borderRadius: "var(--r-2)",
    cursor: "pointer",
    border: "1px dashed var(--c-line-3)",
    background: "var(--c-panel-2)",
    color: "var(--c-ink-2)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6
  } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-title)", color: "var(--c-ink-3)" } }, "\u2191"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--c-ink-2)" } }, "Upload an image"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)" } }, "PNG or JPG \xB7 up to 5 MB \xB7 16:9 works best"))), mode === "library" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { style: note }, "Your universal media library \u2014 stills, stock, and past renders."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, maxHeight: 208, overflowY: "auto", paddingRight: 4 } }, PC_LIBRARY.map((k) => /* @__PURE__ */ React.createElement(PcCoverThumb, { key: k, kind: k, selected: isSel(k), onClick: () => pickKind(k) })))));
}
function PcStepFilm({ data, upd }) {
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 20 } }, /* @__PURE__ */ React.createElement(PcField, { label: "Title" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      value: data.title,
      onChange: (e) => upd({ title: e.target.value }),
      autoFocus: true,
      placeholder: "e.g. The Salt Year",
      style: pcInput
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } }, /* @__PURE__ */ React.createElement(PcField, { label: "Format", hint: data.kind === "branched" ? "Plays live \u2014 the room votes at every fork." : null }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, ["film", "series", "branched"].map((k) => {
    const on = data.kind === k;
    const isBr = k === "branched";
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: k,
        onClick: () => upd({ kind: k, tiers: isBr ? PC_BRANCH_TIERS : data.kind === "branched" ? PC_BASE_TIERS : data.tiers }),
        style: {
          ...pcChip(on),
          ...isBr ? {
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            borderColor: on ? tkc("bad") : "rgba(201,85,72,.45)",
            background: on ? "rgba(201,85,72,.16)" : "transparent",
            color: on ? tkc("amber-x") : tkc("ink-3")
          } : {}
        }
      },
      isBr && window.PbBranchGlyph ? /* @__PURE__ */ React.createElement(window.PbBranchGlyph, { size: 11, color: on ? tkc("amber-x") : tkc("ink-3"), dim: on ? tkc("amber-x") : tkc("ink-3") }) : null,
      k
    );
  }))), /* @__PURE__ */ React.createElement(PcField, { label: "Genre" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, ["Drama", "Sci-fi", "Horror", "Thriller", "Doc", "Romance"].map((g) => /* @__PURE__ */ React.createElement("button", { key: g, onClick: () => upd({ genre: g }), style: pcChip(data.genre === g) }, g))))), /* @__PURE__ */ React.createElement(PcCoverArt, { data, upd }), /* @__PURE__ */ React.createElement(PcField, { label: "Accent color" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, PC_COLORS.map((c) => /* @__PURE__ */ React.createElement("button", { key: c, onClick: () => upd({ color: c }), style: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: c,
    border: data.color === c ? `2px solid ${tkc("white")}` : "1px solid var(--c-line-2)",
    cursor: "pointer",
    boxShadow: data.color === c ? `0 0 0 2px ${c}` : "none"
  } })))));
}
function PcStepStory({ data, upd }) {
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 20 } }, /* @__PURE__ */ React.createElement(PcField, { label: "Logline", hint: "One sentence. The promise of the film." }, /* @__PURE__ */ React.createElement(
    "textarea",
    {
      value: data.logline,
      onChange: (e) => upd({ logline: e.target.value }),
      autoFocus: true,
      rows: 3,
      placeholder: "A retired conservator returns to a flooding archive to save one reel \u2014 and finds her own face in it.",
      style: { ...pcInput, resize: "vertical", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.45 }
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } }, /* @__PURE__ */ React.createElement(PcField, { label: "Director / handle" }, /* @__PURE__ */ React.createElement("input", { value: data.creator, onChange: (e) => upd({ creator: e.target.value }), style: pcInput })), /* @__PURE__ */ React.createElement(PcField, { label: `Runtime \xB7 ${data.runtime} min` }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min: "8",
      max: "180",
      value: data.runtime,
      onChange: (e) => upd({ runtime: +e.target.value }),
      style: { width: "100%", accentColor: tkc("amber") }
    }
  ))), /* @__PURE__ */ React.createElement("div", { style: { padding: 14, background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55 } }, "Your logline appears on the market card and the project page. It's the single most important thing backers read \u2014 make it concrete."));
}
function PcStepForks({ data, upd, setFork }) {
  const BLOOD = tkc("bad");
  const cuts = Math.pow(data.optionsPerFork, data.forkCount);
  const forks = data.forks.slice(0, data.forkCount);
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 } }, /* @__PURE__ */ React.createElement(PcField, { label: "Forks" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, [3, 4, 5, 6].map((n) => /* @__PURE__ */ React.createElement("button", { key: n, onClick: () => upd({
    forkCount: n,
    forks: Array.from({ length: n }, (_, i) => data.forks[i] || { act: "ACT " + (i + 1), at: 12 + i * 18, heading: "", question: "What happens?" })
  }), style: pcChip(data.forkCount === n) }, n)))), /* @__PURE__ */ React.createElement(PcField, { label: "Options per fork" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, [2, 3, 4].map((n) => /* @__PURE__ */ React.createElement("button", { key: n, onClick: () => upd({ optionsPerFork: n }), style: pcChip(data.optionsPerFork === n) }, n)))), /* @__PURE__ */ React.createElement(PcField, { label: "Vote window" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, [45, 60, 90, 120].map((n) => /* @__PURE__ */ React.createElement("button", { key: n, onClick: () => upd({ voteWindowSec: n }), style: pcChip(data.voteWindowSec === n) }, n, "s"))))), /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "12px 14px",
    border: "1px solid rgba(201,85,72,.32)",
    background: "rgba(201,85,72,.06)",
    borderRadius: "var(--r-2)"
  } }, window.PbBranchGlyph ? /* @__PURE__ */ React.createElement(window.PbBranchGlyph, { size: 26, color: BLOOD, dim: "rgba(201,85,72,.5)" }) : null, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1 } }, cuts.toLocaleString(), " possible cuts"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-2)", marginTop: 5, lineHeight: 1.45 } }, data.forkCount, " forks \xD7 ", data.optionsPerFork, " options. The room votes for ", data.voteWindowSec, "s at each fork; the leading branch plays and becomes canonical. Every other path stays rentable."))), /* @__PURE__ */ React.createElement(PcField, { label: "Decision points", hint: "Where the film stops and the room decides." }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, forks.map((f, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
    display: "grid",
    gridTemplateColumns: "62px 74px 1fr 1fr",
    gap: 10,
    alignItems: "center",
    padding: "10px 12px",
    background: "var(--c-panel-2)",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-2)"
  } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: BLOOD, letterSpacing: ".16em", fontWeight: 700 } }, String(i + 1).padStart(2, "0"), " \u25C6"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4 } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      value: f.at,
      onChange: (e) => setFork(i, { at: parseInt(e.target.value) || 0 }),
      type: "number",
      style: { ...pcInput, padding: "7px 8px", fontSize: "var(--fs-body)", width: 52, fontFamily: "var(--f-mono)" }
    }
  ), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" } }, "MIN")), /* @__PURE__ */ React.createElement(
    "input",
    {
      value: f.heading,
      onChange: (e) => setFork(i, { heading: e.target.value }),
      placeholder: "Scene heading \u2014 e.g. She finds the booth.",
      style: { ...pcInput, padding: "8px 10px", fontSize: "var(--fs-body)" }
    }
  ), /* @__PURE__ */ React.createElement(
    "input",
    {
      value: f.question,
      onChange: (e) => setFork(i, { question: e.target.value }),
      placeholder: "Question put to the room",
      style: { ...pcInput, padding: "8px 10px", fontSize: "var(--fs-body)" }
    }
  ))))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 } }, /* @__PURE__ */ React.createElement(PcField, { label: "Cut rentals" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => upd({ cutRentals: true }), style: pcChip(data.cutRentals) }, "On"), /* @__PURE__ */ React.createElement("button", { onClick: () => upd({ cutRentals: false }), style: pcChip(!data.cutRentals) }, "Off"))), /* @__PURE__ */ React.createElement(PcField, { label: "Rental price" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, [3, 4, 6, 9].map((n) => /* @__PURE__ */ React.createElement("button", { key: n, onClick: () => upd({ rentPriceUSD: n }), style: pcChip(data.rentPriceUSD === n), disabled: !data.cutRentals }, "$", n)))), /* @__PURE__ */ React.createElement(PcField, { label: "Canonical path set by" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, [["room", "The room"], ["holders", "Holders"], ["director", "You"]].map(([k, l]) => /* @__PURE__ */ React.createElement("button", { key: k, onClick: () => upd({ canonicalRule: k }), style: pcChip(data.canonicalRule === k) }, l))))));
}
function PcStepRaise({ data, upd, goal }) {
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 22 } }, /* @__PURE__ */ React.createElement(PcField, { label: `Funding goal \xB7 ${pcFmtUSD(goal)}` }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min: "25",
      max: "2000",
      step: "25",
      value: data.goalK,
      onChange: (e) => upd({ goalK: +e.target.value }),
      style: { width: "100%", accentColor: tkc("amber") }
    }
  ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 4 } }, /* @__PURE__ */ React.createElement("span", null, "$25k \xB7 short film"), /* @__PURE__ */ React.createElement("span", null, "$2M \xB7 feature"))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } }, /* @__PURE__ */ React.createElement(PcField, { label: `Raise window \xB7 ${data.daysLeft} days` }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min: "7",
      max: "90",
      value: data.daysLeft,
      onChange: (e) => upd({ daysLeft: +e.target.value }),
      style: { width: "100%", accentColor: tkc("amber") }
    }
  )), /* @__PURE__ */ React.createElement(PcField, { label: `Backer revenue share \xB7 ${data.revShare}%` }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min: "3",
      max: "25",
      value: data.revShare,
      onChange: (e) => upd({ revShare: +e.target.value }),
      style: { width: "100%", accentColor: tkc("amber") }
    }
  ))), /* @__PURE__ */ React.createElement(PcField, { label: "Settlement chain" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, ["Base", "Optimism", "Mainnet"].map((c) => /* @__PURE__ */ React.createElement("button", { key: c, onClick: () => upd({ chain: c }), style: pcChip(data.chain === c) }, c)))), /* @__PURE__ */ React.createElement("div", { style: {
    padding: 16,
    background: "linear-gradient(135deg, rgba(var(--accent-rgb),.06), var(--c-panel) 70%)",
    border: "1px solid rgba(var(--accent-rgb),.35)",
    borderLeft: "2px solid var(--c-amber)",
    borderRadius: "var(--r-2)"
  } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 6, textTransform: "uppercase" } }, "WHAT BACKERS GET"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55 } }, data.revShare, "% of all downstream revenue (Watch subs, ads, licensing) flows to holders quarterly, pro-rata by tier. Cina takes 6% of primary, 1% of secondary.")));
}
function PcStepTiers({ data, setTier, projectedRaise, goal }) {
  const palette = [tkc("ink-4"), tkc("cat-3"), "var(--c-amber)"];
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" } }, "Three tiers"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: projectedRaise >= goal ? "var(--c-good)" : "var(--c-warn)", letterSpacing: ".16em" } }, "Projected ", pcFmtUSD(projectedRaise), " \xB7 ", (projectedRaise / goal * 100).toFixed(0), "% of goal")), projectedRaise < goal && /* @__PURE__ */ React.createElement("div", { style: {
    padding: "10px 12px",
    borderRadius: "var(--r-2)",
    background: "rgba(216,163,66,.08)",
    border: "1px solid rgba(216,163,66,.3)",
    fontSize: "var(--fs-body)",
    color: "var(--c-warn)",
    lineHeight: 1.45
  } }, "Every tier sold out still leaves you ", pcFmtUSD(goal - projectedRaise), " short of ", pcFmtUSD(goal), ". Raise a price, add supply, or lower the goal before you launch."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 } }, data.tiers.map((t, i) => /* @__PURE__ */ React.createElement("div", { key: t.id, style: {
    padding: 16,
    background: "var(--c-panel-2)",
    border: "1px solid var(--c-line)",
    borderTop: `2px solid ${palette[i]}`,
    borderRadius: "var(--r-2)",
    display: "flex",
    flexDirection: "column",
    gap: 12
  } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, color: palette[i] } }, t.name), /* @__PURE__ */ React.createElement(PcMini, { label: `Price \xB7 $${t.priceUSD.toLocaleString()}` }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min: i === 0 ? 20 : i === 1 ? 200 : 1e3,
      max: i === 0 ? 400 : i === 1 ? 2e3 : 25e3,
      step: i === 0 ? 10 : i === 1 ? 50 : 500,
      value: t.priceUSD,
      onChange: (e) => setTier(i, { priceUSD: +e.target.value }),
      style: { width: "100%", accentColor: palette[i] }
    }
  )), /* @__PURE__ */ React.createElement(PcMini, { label: `Supply \xB7 ${t.count}` }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min: i === 0 ? 50 : i === 1 ? 10 : 1,
      max: i === 0 ? 2e3 : i === 1 ? 400 : 40,
      value: t.count,
      onChange: (e) => setTier(i, { count: +e.target.value }),
      style: { width: "100%", accentColor: palette[i] }
    }
  )), /* @__PURE__ */ React.createElement("ul", { style: { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 } }, t.perks.map((p, j) => /* @__PURE__ */ React.createElement("li", { key: j, style: { display: "flex", gap: 7, fontSize: "var(--fs-label)", color: "var(--c-ink-2)", lineHeight: 1.4 } }, /* @__PURE__ */ React.createElement("span", { style: { color: palette[i], flexShrink: 0 } }, "\u25C6"), /* @__PURE__ */ React.createElement("span", null, p)))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "auto", paddingTop: 10, borderTop: "1px solid var(--c-line)", display: "flex", justifyContent: "space-between", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" } }, /* @__PURE__ */ React.createElement("span", null, "Tier raise"), /* @__PURE__ */ React.createElement("span", { style: { color: palette[i], fontWeight: 600 } }, pcFmtUSD(t.priceUSD * t.count)))))));
}
function PcStepReview({ data, upd, goal, projectedRaise }) {
  const branched = data.kind === "branched";
  const rows = [
    ["Title", data.title || "Untitled"],
    ["Format", `${data.kind} \xB7 ${data.genre} \xB7 ${data.runtime}m`],
    ["Director", data.creator],
    ["Goal", pcFmtUSD(goal)],
    ["Window", `${data.daysLeft} days`],
    ["Rev share", `${data.revShare}% \xB7 quarterly`],
    ["Chain", data.chain],
    ["Projected raise", pcFmtUSD(projectedRaise)],
    ...branched ? [
      ["Fork tree", `${data.forkCount} forks \xD7 ${data.optionsPerFork} options \xB7 ${Math.pow(data.optionsPerFork, data.forkCount).toLocaleString()} cuts`],
      ["Vote window", `${data.voteWindowSec}s at each fork`],
      ["Canonical path", data.canonicalRule === "room" ? "Set by the room" : data.canonicalRule === "holders" ? "Set by holders" : "Set by you"],
      ["Cut rentals", data.cutRentals ? `$${data.rentPriceUSD} \xB7 ${data.cutRevShare}% to holders` : "Off"]
    ] : []
  ];
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: 20 } }, rows.map((r, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
    display: "grid",
    gridTemplateColumns: "160px 1fr",
    gap: 16,
    padding: "9px 0",
    borderBottom: i < rows.length - 1 ? "1px solid var(--c-line)" : "none"
  } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textTransform: "uppercase" } }, r[0]), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: r[0] === "Projected raise" ? "var(--c-amber)" : "var(--c-ink)", fontWeight: r[0] === "Projected raise" ? 600 : 400 } }, r[1])))), /* @__PURE__ */ React.createElement("label", { style: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    padding: 14,
    background: data.accept ? "rgba(var(--accent-rgb),.08)" : "var(--c-panel-2)",
    border: `1px solid ${data.accept ? "var(--c-amber)" : "var(--c-line)"}`,
    borderRadius: "var(--r-2)",
    cursor: "pointer"
  } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: data.accept, onChange: (e) => upd({ accept: e.target.checked }), style: { accentColor: tkc("amber"), marginTop: 2, width: 16, height: 16 } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5 } }, "I hold the rights to this project and agree to Cina's producer terms. Smart contracts deploy on launch and are immutable.")));
}
function PcStepLive({ data, onClose }) {
  const ref = data.title.replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase() || "FILM";
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 360, gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 64, height: 64, borderRadius: "50%", background: "var(--c-good)", color: "var(--c-void)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-head)", fontWeight: 700 } }, "\u2713"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", textTransform: "uppercase" } }, "PROJECT LIVE \xB7 DEPLOYED ON ", data.chain.toUpperCase()), /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-head)", letterSpacing: "-0.02em" } }, /* @__PURE__ */ React.createElement("em", { style: { color: "var(--c-amber)" } }, data.title || "Untitled"), " is raising."), /* @__PURE__ */ React.createElement("p", { style: { margin: "0 0 8px", maxWidth: 440, fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55 } }, "Your three tier contracts are live and listed on the market. Backers can buy in now; royalties settle quarterly. Reference ", /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", color: "var(--c-amber)" } }, "PROD-", ref, "-", Math.floor(Math.random() * 9e3) + 1e3), "."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => {
    onClose();
    location.hash = "market";
  }, style: {
    padding: "12px 22px",
    background: "var(--c-amber)",
    color: "var(--c-on-amber)",
    border: "none",
    borderRadius: "var(--r-2)",
    cursor: "pointer",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    fontWeight: 700,
    textTransform: "uppercase"
  } }, "View on market \u2192"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
    padding: "12px 18px",
    background: "transparent",
    color: "var(--c-ink)",
    border: "1px solid var(--c-line-3)",
    borderRadius: "var(--r-2)",
    cursor: "pointer",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    fontWeight: 600,
    textTransform: "uppercase"
  }, "aria-label": "Close", title: "Close" }, "Done")));
}
const pcInput = {
  width: "100%",
  padding: "11px 14px",
  background: "var(--c-panel-2)",
  border: "1px solid var(--c-line-2)",
  borderRadius: "var(--r-2)",
  color: "var(--c-ink)",
  fontSize: "var(--fs-body)",
  outline: "none",
  fontFamily: "var(--f-sans)"
};
function pcChip(active) {
  return {
    padding: "7px 13px",
    background: active ? "rgba(var(--accent-rgb),.14)" : "transparent",
    color: active ? "var(--c-amber)" : "var(--c-ink-2)",
    border: `1px solid ${active ? "var(--c-amber)" : "var(--c-line-2)"}`,
    borderRadius: "var(--r-1)",
    cursor: "pointer",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    fontWeight: 600,
    textTransform: "uppercase"
  };
}
function PcField({ label, hint, children }) {
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" } }, label), hint && /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)" } }, hint)), children);
}
function PcMini({ label, children }) {
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 5, textTransform: "uppercase" } }, label), children);
}
(function() {
  const ready = () => {
    if (document.getElementById("__project-creator-host")) return;
    const host = document.createElement("div");
    host.id = "__project-creator-host";
    document.body.appendChild(host);
    if (ReactDOM.createRoot) ReactDOM.createRoot(host).render(/* @__PURE__ */ React.createElement(ProjectCreator, null));
    else ReactDOM.render(/* @__PURE__ */ React.createElement(ProjectCreator, null), host);
  };
  if (document.readyState === "complete" || document.readyState === "interactive") setTimeout(ready, 60);
  else document.addEventListener("DOMContentLoaded", ready);
})();

  try { if (typeof usPC !== "undefined") window["usPC"] = usPC; } catch (_) {}
  try { if (typeof uePC !== "undefined") window["uePC"] = uePC; } catch (_) {}
  try { if (typeof umPC !== "undefined") window["umPC"] = umPC; } catch (_) {}
  try { if (typeof urPC !== "undefined") window["urPC"] = urPC; } catch (_) {}
  try { if (typeof _pcSet !== "undefined") window["_pcSet"] = _pcSet; } catch (_) {}
  try { if (typeof openCreateProject !== "undefined") window["openCreateProject"] = openCreateProject; } catch (_) {}
  try { if (typeof PC_BASE_TIERS !== "undefined") window["PC_BASE_TIERS"] = PC_BASE_TIERS; } catch (_) {}
  try { if (typeof PC_BRANCH_TIERS !== "undefined") window["PC_BRANCH_TIERS"] = PC_BRANCH_TIERS; } catch (_) {}
  try { if (typeof PC_COLORS !== "undefined") window["PC_COLORS"] = PC_COLORS; } catch (_) {}
  try { if (typeof PC_THUMBS !== "undefined") window["PC_THUMBS"] = PC_THUMBS; } catch (_) {}
  try { if (typeof pcFmtUSD !== "undefined") window["pcFmtUSD"] = pcFmtUSD; } catch (_) {}
  try { if (typeof ProjectCreator !== "undefined") window["ProjectCreator"] = ProjectCreator; } catch (_) {}
  try { if (typeof ProjectCreatorInstance !== "undefined") window["ProjectCreatorInstance"] = ProjectCreatorInstance; } catch (_) {}
  try { if (typeof PcPreviewCard !== "undefined") window["PcPreviewCard"] = PcPreviewCard; } catch (_) {}
  try { if (typeof PC_LIBRARY !== "undefined") window["PC_LIBRARY"] = PC_LIBRARY; } catch (_) {}
  try { if (typeof pcGenreStills !== "undefined") window["pcGenreStills"] = pcGenreStills; } catch (_) {}
  try { if (typeof pcCoverSrc !== "undefined") window["pcCoverSrc"] = pcCoverSrc; } catch (_) {}
  try { if (typeof PcCoverThumb !== "undefined") window["PcCoverThumb"] = PcCoverThumb; } catch (_) {}
  try { if (typeof PcCoverArt !== "undefined") window["PcCoverArt"] = PcCoverArt; } catch (_) {}
  try { if (typeof PcStepFilm !== "undefined") window["PcStepFilm"] = PcStepFilm; } catch (_) {}
  try { if (typeof PcStepStory !== "undefined") window["PcStepStory"] = PcStepStory; } catch (_) {}
  try { if (typeof PcStepForks !== "undefined") window["PcStepForks"] = PcStepForks; } catch (_) {}
  try { if (typeof PcStepRaise !== "undefined") window["PcStepRaise"] = PcStepRaise; } catch (_) {}
  try { if (typeof PcStepTiers !== "undefined") window["PcStepTiers"] = PcStepTiers; } catch (_) {}
  try { if (typeof PcStepReview !== "undefined") window["PcStepReview"] = PcStepReview; } catch (_) {}
  try { if (typeof PcStepLive !== "undefined") window["PcStepLive"] = PcStepLive; } catch (_) {}
  try { if (typeof pcInput !== "undefined") window["pcInput"] = pcInput; } catch (_) {}
  try { if (typeof pcChip !== "undefined") window["pcChip"] = pcChip; } catch (_) {}
  try { if (typeof PcField !== "undefined") window["PcField"] = PcField; } catch (_) {}
  try { if (typeof PcMini !== "undefined") window["PcMini"] = PcMini; } catch (_) {}
})();

// ── MODULE: strategy-producers.jsx ──
;(function() {
const { useState: usSPr, useMemo: umSPr } = React;
function CatalogIndexPage({ projects, onOpen }) {
  const [sort, setSort] = usSPr("vol");
  const [horizon, setHorizon] = usSPr("30d");
  const rows = umSPr(() => {
    const seedRand = (str, salt) => {
      let h = salt;
      for (let i = 0; i < str.length; i++) h = h * 31 + str.charCodeAt(i) | 0;
      const x = Math.sin(h) * 43758.5453;
      return x - Math.floor(x);
    };
    const list = (projects || []).map((p) => {
      const price = p.shareValue || p.entry || 100;
      const ch24h = (seedRand(p.id || "x", 11) - 0.4) * 12;
      const ch7d = (seedRand(p.id || "x", 23) - 0.3) * 22;
      const vol = Math.floor(4e4 + seedRand(p.id || "x", 37) * 38e4);
      const holders = p.holders || Math.floor(120 + seedRand(p.id || "x", 53) * 4200);
      const mcap = price * (p.totalShares || 1e4);
      return { ...p, price, ch24h, ch7d, vol, holders, mcap };
    });
    if (sort === "vol") list.sort((a, b) => b.vol - a.vol);
    if (sort === "mcap") list.sort((a, b) => b.mcap - a.mcap);
    if (sort === "ch") list.sort((a, b) => horizon === "24h" ? b.ch24h - a.ch24h : b.ch7d - a.ch7d);
    if (sort === "holders") list.sort((a, b) => b.holders - a.holders);
    return list;
  }, [projects, sort, horizon]);
  const indexLevel = umSPr(() => {
    const avg = rows.reduce((s, r) => s + (horizon === "24h" ? r.ch24h : r.ch7d), 0) / Math.max(1, rows.length);
    return { level: 1e3 + Math.round(avg * 4.2), change: avg };
  }, [rows, horizon]);
  return /* @__PURE__ */ React.createElement("div", { style: { padding: "32px var(--gutter) 80px", maxWidth: "var(--w-page)", margin: "0 auto" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 14, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: "var(--c-amber)" } }), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" } }, "THE CINA INDEX \xB7 STRATEGY MOVE 01")), /* @__PURE__ */ React.createElement("h1", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-display)", fontWeight: 400, margin: 0, lineHeight: 1, letterSpacing: "-0.02em" } }, "Cinema as an asset class."), /* @__PURE__ */ React.createElement("p", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink-2)", maxWidth: 720, marginTop: 16, lineHeight: 1.45 } }, "Every released film mints fractional rights paying smart-contract royalties. The index tracks the whole catalog like the S&P, weighted by market cap."), /* @__PURE__ */ React.createElement("div", { style: {
    marginTop: 28,
    padding: "22px 26px",
    background: "linear-gradient(135deg, rgba(var(--accent-rgb),0.08), transparent 60%)",
    border: "1px solid rgba(var(--accent-rgb),0.30)",
    borderRadius: "var(--r-2)",
    display: "grid",
    gridTemplateColumns: "auto auto 1fr auto",
    gap: 32,
    alignItems: "center"
  } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, "CINA INDEX"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-amber)", lineHeight: 1, marginTop: 4, fontVariantNumeric: "tabular-nums" } }, indexLevel.level.toLocaleString())), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, horizon.toUpperCase(), " CHANGE"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-title)", color: indexLevel.change >= 0 ? tkc("good") : tkc("bad"), marginTop: 6 } }, indexLevel.change >= 0 ? "+" : "", indexLevel.change.toFixed(2), "%")), /* @__PURE__ */ React.createElement(SparkLine, { width: 420 }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, ["24h", "7d", "30d", "1y"].map((h) => /* @__PURE__ */ React.createElement("button", { key: h, onClick: () => setHorizon(h), className: "btn-ghost", style: {
    padding: "4px 10px",
    height: "auto",
    fontSize: "var(--fs-label)",
    fontFamily: "var(--f-mono)",
    background: horizon === h ? "rgba(var(--accent-rgb),0.10)" : "transparent",
    border: `1px solid ${horizon === h ? "var(--c-amber)" : "var(--c-line)"}`,
    color: horizon === h ? "var(--c-amber)" : "var(--c-ink-2)",
    borderRadius: "var(--r-1)",
    letterSpacing: ".16em",
    textAlign: "left",
    minWidth: 64
  } }, h)))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 } }, /* @__PURE__ */ React.createElement(RoyaltyPoolCard, null), /* @__PURE__ */ React.createElement(TreasuryCard, null)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "center", margin: "32px 0 14px" } }, /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, "SORT"), [
    { id: "vol", label: "Volume" },
    { id: "mcap", label: "Market cap" },
    { id: "ch", label: "Change" },
    { id: "holders", label: "Holders" }
  ].map((o) => /* @__PURE__ */ React.createElement("button", { key: o.id, onClick: () => setSort(o.id), className: "btn-ghost", style: {
    padding: "5px 12px",
    height: "auto",
    fontSize: "var(--fs-body)",
    background: sort === o.id ? "rgba(var(--accent-rgb),0.10)" : "transparent",
    border: `1px solid ${sort === o.id ? "var(--c-amber)" : "var(--c-line)"}`,
    color: sort === o.id ? "var(--c-amber)" : "var(--c-ink-2)",
    borderRadius: "var(--r-1)"
  } }, o.label))), /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: "40px 1.5fr 1fr 100px 100px 1fr 100px 100px",
    padding: "10px 18px",
    gap: 12,
    background: "var(--c-panel-2)",
    borderBottom: "1px solid var(--c-line)",
    fontSize: "var(--fs-label)",
    color: "var(--c-ink-3)",
    letterSpacing: ".16em",
    fontFamily: "var(--f-mono)"
  } }, /* @__PURE__ */ React.createElement("span", null, "#"), /* @__PURE__ */ React.createElement("span", null, "FILM"), /* @__PURE__ */ React.createElement("span", null, "CREATOR"), /* @__PURE__ */ React.createElement("span", { style: { textAlign: "right" } }, "PRICE"), /* @__PURE__ */ React.createElement("span", { style: { textAlign: "right" } }, horizon.toUpperCase(), " %"), /* @__PURE__ */ React.createElement("span", { style: { textAlign: "right" } }, "VOLUME"), /* @__PURE__ */ React.createElement("span", { style: { textAlign: "right" } }, "HOLDERS"), /* @__PURE__ */ React.createElement("span", { style: { textAlign: "right" } }, "MCAP")), rows.map((r, i) => {
    const ch = horizon === "24h" ? r.ch24h : r.ch7d;
    return /* @__PURE__ */ React.createElement("button", { key: r.id, onClick: () => onOpen && onOpen(r.id), className: "btn-ghost", style: {
      display: "grid",
      gridTemplateColumns: "40px 1.5fr 1fr 100px 100px 1fr 100px 100px",
      padding: "12px 18px",
      gap: 12,
      height: "auto",
      textAlign: "left",
      width: "100%",
      borderBottom: i < rows.length - 1 ? "1px solid var(--c-line)" : "none",
      borderRadius: 0,
      alignItems: "center"
    } }, /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)" } }, String(i + 1).padStart(2, "0")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 11, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 46, height: 30, borderRadius: "var(--r-2)", background: r.color || "var(--c-panel-3)", flexShrink: 0, overflow: "hidden", position: "relative" } }, window.FrameThumb ? /* @__PURE__ */ React.createElement(FrameThumb, { kind: r.thumb, usePhoto: true }) : null), /* @__PURE__ */ React.createElement("span", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, r.film?.title || r.title), r.branched && window.BranchedTag ? /* @__PURE__ */ React.createElement(window.BranchedTag, { compact: true }) : null), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-2)", letterSpacing: ".08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, (r.creator || "").toString().toUpperCase()), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-body)", color: "var(--c-ink)", textAlign: "right", fontVariantNumeric: "tabular-nums" } }, "$", r.price.toFixed(2)), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-body)", color: ch >= 0 ? tkc("good") : tkc("bad"), textAlign: "right", fontVariantNumeric: "tabular-nums" } }, ch >= 0 ? "+" : "", ch.toFixed(2), "%"), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-2)", textAlign: "right", fontVariantNumeric: "tabular-nums" } }, "$", (r.vol / 1e3).toFixed(1), "k"), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-2)", textAlign: "right", fontVariantNumeric: "tabular-nums" } }, r.holders.toLocaleString()), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-amber)", textAlign: "right", fontVariantNumeric: "tabular-nums" } }, "$", (r.mcap / 1e6).toFixed(2), "M"));
  })));
}
function SparkLine({ width = 280 }) {
  const pts = umSPr(() => {
    let v = 50;
    const arr = [];
    for (let i = 0; i < 32; i++) {
      v += (Math.random() - 0.45) * 8;
      arr.push(Math.max(10, Math.min(90, v)));
    }
    return arr;
  }, []);
  const w = width, h = 64;
  const d = pts.map((y, i) => `${i / (pts.length - 1) * w},${h - y / 100 * h}`).join(" ");
  return /* @__PURE__ */ React.createElement("svg", { width: w, height: h, style: { overflow: "visible" } }, /* @__PURE__ */ React.createElement("polyline", { points: d, fill: "none", stroke: "var(--c-amber)", strokeWidth: "1.5", opacity: "0.85" }), /* @__PURE__ */ React.createElement("polyline", { points: `0,${h} ${d} ${w},${h}`, fill: "rgba(var(--accent-rgb),0.10)", stroke: "none" }));
}
function RoyaltyPoolCard() {
  const session = window.useProducerSession ? window.useProducerSession() : null;
  const cited = 14;
  const earned = 4280;
  return /* @__PURE__ */ React.createElement("div", { style: {
    padding: "20px 24px",
    background: "var(--c-panel)",
    border: "1px solid var(--c-line)",
    borderRadius: "var(--r-2)",
    display: "flex",
    flexDirection: "column",
    gap: 12
  } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" } }, "DIRECTOR ROYALTY POOL \xB7 MOVE 05"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-title)", lineHeight: 1.15, color: "var(--c-ink)", fontWeight: 400 } }, "Style citations earn for life."), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-2)", margin: 0, lineHeight: 1.5 } }, "Every Cina film tithes 5% to the directors whose declared style is being borrowed. We publish the influence graph; the pool pays out monthly."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, paddingTop: 12, borderTop: "1px solid var(--c-line)" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, "POOL THIS MONTH"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-amber)", marginTop: 3 } }, "$284k")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, "YOU CITED"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 3 } }, cited, "\xD7")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, "YOUR SHARE"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 3 } }, "$", earned.toLocaleString()))), /* @__PURE__ */ React.createElement("button", { onClick: () => window.toast?.("Routed to royalty pool \xB7 claim ready"), className: "btn-primary", style: { minHeight: 36, fontSize: "var(--fs-body)" } }, "Claim $", earned.toLocaleString()));
}
function TreasuryCard() {
  return /* @__PURE__ */ React.createElement("div", { style: {
    padding: "20px 24px",
    background: "var(--c-panel)",
    border: "1px solid var(--c-line)",
    borderRadius: "var(--r-2)",
    display: "flex",
    flexDirection: "column",
    gap: 12
  } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" } }, "TREASURY YIELD \xB7 MOVE 10"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-title)", lineHeight: 1.15, color: "var(--c-ink)", fontWeight: 400 } }, "The float earns. Holders share."), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-2)", margin: 0, lineHeight: 1.5 } }, "Every primary sale, ticket, tip and royalty parks briefly in the treasury. Staked on-chain in low-risk LSTs and T-bills. Yield published live; every holder gets a slice pro-rata to stake."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, paddingTop: 12, borderTop: "1px solid var(--c-line)" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, "FLOAT"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-amber)", marginTop: 3 } }, "$48.2M")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, "NET APY"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 3 } }, "4.62%")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, "YOUR Q YIELD"), /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 3 } }, "$182.40"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => window.toast?.("Auto-stake enabled on idle balance"), className: "btn-ghost", style: { flex: 1, minHeight: 36, fontSize: "var(--fs-body)", border: "1px solid var(--c-line)" } }, "Auto-stake idle"), /* @__PURE__ */ React.createElement("button", { onClick: () => window.toast?.("View prospectus \xB7 published quarterly"), className: "btn-ghost", style: { flex: 1, minHeight: 36, fontSize: "var(--fs-body)", border: "1px solid var(--c-line)" } }, "Prospectus")));
}
Object.assign(window, { CatalogIndexPage });

  try { if (typeof usSPr !== "undefined") window["usSPr"] = usSPr; } catch (_) {}
  try { if (typeof umSPr !== "undefined") window["umSPr"] = umSPr; } catch (_) {}
  try { if (typeof CatalogIndexPage !== "undefined") window["CatalogIndexPage"] = CatalogIndexPage; } catch (_) {}
  try { if (typeof SparkLine !== "undefined") window["SparkLine"] = SparkLine; } catch (_) {}
  try { if (typeof RoyaltyPoolCard !== "undefined") window["RoyaltyPoolCard"] = RoyaltyPoolCard; } catch (_) {}
  try { if (typeof TreasuryCard !== "undefined") window["TreasuryCard"] = TreasuryCard; } catch (_) {}
})();

// ── MODULE: cina-cmdk-shared.jsx ──
;(function() {
const CC_SURFACES = {
  watch: { label: "Watch", file: "index.html", dot: tkc("good") },
  studio: { label: "Studio", file: "Cina.html", dot: "var(--c-amber)" },
  producers: { label: "Producers", file: "Producers.html", dot: tkc("warn") }
};
function ccTarget(surface, hash) {
  const s = CC_SURFACES[surface];
  if (!s) return null;
  return s.file + (hash ? hash.startsWith("#") ? hash : "#" + hash : "");
}
function ccGo(href) {
  return () => {
    window.location.href = href;
  };
}
const CC_DESTS = {
  watch: [
    ["Watch home", "Browse everything", "play", "/"],
    ["Branched rooms", "Live interactive films", "shuffle", "/branches"],
    ["Festival programme", "Screenings & juries", "ticket", "/festival"],
    ["Studios directory", "Every house on Cina", "globe", "/studios"],
    ["Your watchlist", "Saved films", "heart", "/watchlist"]
  ],
  studio: [
    ["The slate", "Every project", "board", "slate"],
    ["New film", "Start a project", "plus", "new"],
    ["The vault", "Performers & likenesses", "actor", "vault"],
    ["Studio site builder", "Your public page", "globe", "site"],
    ["Analytics", "How the work is playing", "trend", "analytics"]
  ],
  pitch: [
    ["Campaign floor", "Every campaign", "trend", "lobby"],
    ["New brief", "Start a campaign", "plus", "brief"],
    ["Pitch Night", "The live auction", "ticket", "night"],
    ["Talent market", "License performers", "actor", "talent"]
  ],
  producers: [
    ["Producers market", "Back a film", "trend", "market"],
    ["My stakes", "Holdings & P/L", "wallet", "portfolio"],
    ["Auction floor", "Secondary market", "coin", "auctions"],
    ["Catalog index", "Every tradable title", "board", "index"],
    ["Launch a project", "Open a fundraise", "plus", "market"]
  ]
};
function cinaCrossCommands(current) {
  const out = [];
  const other = Object.keys(CC_SURFACES).filter((s) => s !== current);
  other.forEach((surface) => {
    const s = CC_SURFACES[surface];
    (CC_DESTS[surface] || []).forEach(([label, hint, icon, hash]) => {
      const href = ccTarget(surface, hash);
      out.push({
        id: "x:" + surface + ":" + hash + ":" + label,
        kind: s.label,
        label,
        hint,
        icon,
        href,
        run: ccGo(href),
        surface,
        dot: s.dot
      });
    });
  });
  const cat = window.CATALOG || [];
  const nft = window.NFT_PROJECTS || {};
  if (current !== "producers") {
    Object.values(nft).forEach((p) => {
      const film = cat.find((f) => f.id === p.filmId) || null;
      const title = film && film.title || p.title;
      if (!title) return;
      const href = ccTarget("producers", "project/" + p.id);
      out.push({
        id: "x:pr:" + p.id,
        kind: "Producers",
        label: title,
        hint: "Back it \xB7 " + (p.goal ? Math.round((p.raised || 0) / p.goal * 100) + "% funded" : "open pool"),
        icon: "coin",
        href,
        run: ccGo(href),
        surface: "producers",
        dot: CC_SURFACES.producers.dot
      });
    });
  }
  if (current !== "watch") {
    Object.values(window.BRANCH_FILMS || {}).forEach((t) => {
      const href = ccTarget("watch", "/branches/" + t.filmId);
      out.push({
        id: "x:room:" + t.filmId,
        kind: "Watch",
        label: t.title,
        hint: "Enter the room \xB7 " + t.totalCuts + " cuts",
        icon: "shuffle",
        href,
        run: ccGo(href),
        surface: "watch",
        dot: CC_SURFACES.watch.dot
      });
    });
    (window.fvLineup ? window.fvLineup() : []).forEach((f, i) => {
      const href = ccTarget("watch", "/festival/film/" + f.id);
      out.push({
        id: "x:fest:" + f.id,
        kind: "Watch",
        label: f.title,
        hint: "Screening " + String(i + 1).padStart(2, "0"),
        icon: "ticket",
        href,
        run: ccGo(href),
        surface: "watch",
        dot: CC_SURFACES.watch.dot
      });
    });
  }
  if (current !== "studio") {
    (window.PROJECTS || []).forEach((p) => {
      const href = ccTarget("studio", "film/" + p.id);
      out.push({
        id: "x:st:" + p.id,
        kind: "Studio",
        label: p.title,
        hint: "Open in Studio \xB7 " + (p.status || "draft"),
        icon: "board",
        href,
        run: ccGo(href),
        surface: "studio",
        dot: CC_SURFACES.studio.dot
      });
    });
  }
  return out;
}
function CcSurfaceBadge({ surface }) {
  const s = CC_SURFACES[surface];
  if (!s) return null;
  return /* @__PURE__ */ React.createElement("span", { style: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
    padding: "2px 7px",
    borderRadius: "var(--r-1)",
    border: "1px solid var(--c-line-2)",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    color: "var(--c-ink-3)",
    textTransform: "uppercase",
    whiteSpace: "nowrap"
  } }, /* @__PURE__ */ React.createElement("span", { style: { width: 4, height: 4, borderRadius: "50%", background: s.dot } }), s.label);
}
Object.assign(window, { cinaCrossCommands, CcSurfaceBadge });

  try { if (typeof CC_SURFACES !== "undefined") window["CC_SURFACES"] = CC_SURFACES; } catch (_) {}
  try { if (typeof ccTarget !== "undefined") window["ccTarget"] = ccTarget; } catch (_) {}
  try { if (typeof ccGo !== "undefined") window["ccGo"] = ccGo; } catch (_) {}
  try { if (typeof CC_DESTS !== "undefined") window["CC_DESTS"] = CC_DESTS; } catch (_) {}
  try { if (typeof cinaCrossCommands !== "undefined") window["cinaCrossCommands"] = cinaCrossCommands; } catch (_) {}
  try { if (typeof CcSurfaceBadge !== "undefined") window["CcSurfaceBadge"] = CcSurfaceBadge; } catch (_) {}
})();

// ── MODULE: cina-voice.jsx ──
;(function() {
const { useMemo: uvM, useState: uvS, useEffect: uvE } = React;
function _vPick(list, seedStr) {
  if (!list || !list.length) return "";
  const day = Math.floor(Date.now() / 864e5);
  let h = day;
  const s = String(seedStr || "");
  for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) | 0;
  return list[Math.abs(h) % list.length];
}
const CINA_VOICE = {
  // ── Loading — what the building is doing, not a spinner's apology ──
  loading: [
    "Threading the reel.",
    "Warming the lamp.",
    "Pulling the print.",
    "Cueing up."
  ],
  loadingLong: [
    "Still pulling the print. Big file.",
    "The lamp takes a moment."
  ],
  // ── Empty states, by where you are ──
  "empty.search": [
    "Nothing under that name.",
    "No print by that title."
  ],
  "empty.watchlist": [
    "Nothing saved yet. The catalog is deep \u2014 start anywhere.",
    "An empty list. Add the ones you mean to get to."
  ],
  "empty.history": [
    "No screenings logged. Yet."
  ],
  "empty.holdings": [
    "You don't hold anything on the slate. Back a film and it shows here."
  ],
  "empty.slate": [
    "No projects. Every film starts as one paragraph \u2014 write it."
  ],
  "empty.room": [
    "Nobody in the room. Doors open before the screening."
  ],
  "empty.notifications": [
    "Quiet. We'll tell you when something ships."
  ],
  "empty.generic": [
    "Nothing here yet."
  ],
  // ── Errors — plain, never chirpy, always a next move ──
  "error.route": [
    "That page isn't in the building."
  ],
  "error.save": [
    "That didn't save. Nothing is lost \u2014 try once more."
  ],
  "error.crash": [
    "This screen broke. The rest of the building is fine."
  ],
  // ── Header curator's note, rotates by route ──
  "note.home": [
    "Twenty-eight titles. Most of them shot this year.",
    "The room votes on the branched ones while they play."
  ],
  "note.films": [
    "Features and shorts. Runtime is honest \u2014 no padding."
  ],
  "note.series": [
    "Episodic work. New drops land Thursdays."
  ],
  "note.branches": [
    "The film stops and the room decides. Ninety seconds a fork."
  ],
  "note.festival": [
    "Twelve premieres, three purses, one running order."
  ],
  "note.studios": [
    "Collectives and one-person shops. Same page, same terms."
  ],
  "note.producers": [
    "Back the work, take a slice of what it earns."
  ],
  "note.slate": [
    "Your catalog, and what it's doing out in the world."
  ],
  // ── Confirmations — what happened, in the product's own terms ──
  "ok.saved": ["Saved."],
  "ok.published": ["Live."],
  "ok.backed": ["You're on the slate."]
};
function cinaVoice(slot, ctx) {
  const list = CINA_VOICE[slot] || CINA_VOICE[String(slot).split(".")[0]] || CINA_VOICE["empty.generic"];
  return _vPick(list, slot + "|" + (ctx || ""));
}
function cinaVoiceSlotForRoute(parts) {
  const p0 = parts && parts[0] || "";
  if (!p0) return "note.home";
  if (p0 === "genre") return parts[1] === "series" ? "note.series" : "note.films";
  if (p0 === "branches") return "note.branches";
  if (p0 === "festival") return "note.festival";
  if (p0 === "studios" || p0 === "creator") return "note.studios";
  if (p0 === "producers") return "note.producers";
  return null;
}
function VoiceLine({ slot, ctx, style, className }) {
  const line = uvM(() => cinaVoice(slot, ctx), [slot, ctx]);
  if (!line) return null;
  return /* @__PURE__ */ React.createElement("span", { className: className || "t-mono", style: {
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    color: "var(--c-ink-4)",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    ...style
  } }, line);
}
function VoiceEmpty({ slot, ctx, kicker, cta, icon }) {
  return /* @__PURE__ */ React.createElement(CinaEmpty, { center: true, icon, kicker, title: cinaVoice(slot, ctx), cta });
}
Object.assign(window, { CINA_VOICE, cinaVoice, cinaVoiceSlotForRoute, VoiceLine });

  try { if (typeof uvM !== "undefined") window["uvM"] = uvM; } catch (_) {}
  try { if (typeof uvS !== "undefined") window["uvS"] = uvS; } catch (_) {}
  try { if (typeof uvE !== "undefined") window["uvE"] = uvE; } catch (_) {}
  try { if (typeof _vPick !== "undefined") window["_vPick"] = _vPick; } catch (_) {}
  try { if (typeof CINA_VOICE !== "undefined") window["CINA_VOICE"] = CINA_VOICE; } catch (_) {}
  try { if (typeof cinaVoice !== "undefined") window["cinaVoice"] = cinaVoice; } catch (_) {}
  try { if (typeof cinaVoiceSlotForRoute !== "undefined") window["cinaVoiceSlotForRoute"] = cinaVoiceSlotForRoute; } catch (_) {}
  try { if (typeof VoiceLine !== "undefined") window["VoiceLine"] = VoiceLine; } catch (_) {}
  try { if (typeof VoiceEmpty !== "undefined") window["VoiceEmpty"] = VoiceEmpty; } catch (_) {}
})();

// ── MODULE: producers-app.jsx ──
;(function() {
const { useState: prUseState, useEffect: prUseEffect, useMemo: prUseMemo } = React;
function buildProjectIndex() {
  const list = [];
  if (!window.__cinaLaunched) {
    try {
      window.__cinaLaunched = JSON.parse(localStorage.getItem("cina-launched-v1")) || [];
    } catch (_) {
      window.__cinaLaunched = [];
    }
  }
  (window.__cinaLaunched || []).forEach((p) => list.push(p));
  const NFT = window.NFT_PROJECTS || {};
  const photoThumbs = ["darkroom-wide", "voss-enter", "darkroom-est", "fence"];
  const pickThumb = (f) => {
    if (f.thumb) return f.thumb;
    const seed = (f.id || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return photoThumbs[seed % photoThumbs.length];
  };
  const brOf = (f) => window.pbMeta ? window.pbMeta(f.id) : null;
  (window.CATALOG || []).forEach((f) => {
    if (!f.nft) return;
    const existing = NFT[f.nft];
    if (existing) {
      list.push({
        ...existing,
        film: f,
        kind: f.kind,
        // film | series
        thumb: pickThumb(f),
        cover: f.cover,
        branched: !!brOf(f),
        branch: brOf(f)
      });
      return;
    }
    const seed = (f.id.charCodeAt(0) || 60) + f.id.length * 11;
    const totalCol = 600 + seed % 9 * 80;
    const totalPat = 80 + seed % 6 * 18;
    const totalProd = 12 + seed % 5 * 3;
    const soldCol = Math.floor(totalCol * (0.18 + seed % 60 / 100));
    const soldPat = Math.floor(totalPat * (0.12 + seed % 50 / 100));
    const soldProd = Math.floor(totalProd * (0.08 + seed % 40 / 100));
    const floorUSD = 90 + seed % 18 * 11;
    const goal = totalCol * floorUSD * 0.4 + totalPat * floorUSD * 4 + totalProd * floorUSD * 28;
    const raised = Math.floor(goal * (0.18 + seed % 70 / 100));
    list.push({
      id: f.nft,
      filmId: f.id,
      film: f,
      kind: f.kind,
      thumb: pickThumb(f),
      cover: f.cover,
      title: (f.title || "Untitled").toUpperCase(),
      creator: f.creator,
      creatorId: f.creatorId,
      color: f.color || tkc("cat-3"),
      raised,
      goal,
      backers: Math.floor((soldCol + soldPat + soldProd) * 1),
      daysLeft: 6 + seed % 22,
      summary: `Co-finance ${f.title} \u2014 holders earn from ad revenue & exhibition windows.`,
      floorUSD,
      revShare: 6 + seed % 8,
      royaltyPaid: Math.floor(raised * 0.06),
      nextDistribution: "2026-07-01",
      chain: "Base",
      branched: !!brOf(f),
      branch: brOf(f),
      tiers: [
        { id: "collector", name: "Collector", count: totalCol, sold: soldCol, priceUSD: floorUSD, perks: ["Premiere window", "Animated frame collectible"], color: tkc("ink-4") },
        { id: "patron", name: "Patron", count: totalPat, sold: soldPat, priceUSD: floorUSD * 4.1, perks: ["BTS vault access", `${(0.04 + seed % 7 / 100).toFixed(2)}% rev share Y5`], color: tkc("cat-3") },
        { id: "producer", name: "Producer", count: totalProd, sold: soldProd, priceUSD: floorUSD * 28, perks: ["Production credit", `${(0.4 + seed % 6 / 10).toFixed(1)}% rev share Y5`, "Set visit"], color: "var(--c-amber)" }
      ],
      synthetic: true
    });
  });
  return list;
}
const SORTS = [
  { id: "trending", label: "Trending" },
  { id: "ending", label: "Ending soon" },
  { id: "raised", label: "Most raised" },
  { id: "floor", label: "Lowest floor" },
  { id: "new", label: "Newest" }
];
function sortProjects(list, sort) {
  const arr = [...list];
  if (sort === "ending") arr.sort((a, b) => a.daysLeft - b.daysLeft);
  else if (sort === "raised") arr.sort((a, b) => b.raised - a.raised);
  else if (sort === "floor") arr.sort((a, b) => a.floorUSD - b.floorUSD);
  else if (sort === "new") arr.sort((a, b) => b.daysLeft - a.daysLeft);
  else arr.sort((a, b) => (b.backers || 0) - (a.backers || 0));
  return arr;
}
const fmtNavUSD = (n) => "$" + (n || 0).toLocaleString("en-US", { maximumFractionDigits: n < 100 ? 2 : 0 });
function ProducersTopNav({ route, onRoute, query, onQuery }) {
  const tabs = [
    { id: "market", label: "Market" },
    { id: "auctions", label: "Auction floor" },
    { id: "index", label: "Index" },
    { id: "watchlist", label: "Watchlist" },
    { id: "portfolio", label: "My stakes" },
    { id: "activity", label: "Activity" }
  ];
  const user = window.USER || {};
  const walletUSD = user.walletUSD || 0;
  const addr = user.address || "0x\u2026";
  const [bellOpen, setBellOpen] = prUseState(false);
  const unread = window.cinaUnreadCount ? window.cinaUnreadCount("producers") : 0;
  return /* @__PURE__ */ React.createElement(
    UnifiedTopNav,
    {
      surface: "producers",
      onWordmark: () => onRoute("market"),
      mobileNav: tabs.map((t) => ({ label: t.label, active: route === t.id, onClick: () => onRoute(t.id) })),
      mobileActions: /* @__PURE__ */ React.createElement("button", { onClick: () => window.openCreateProject && window.openCreateProject(), style: {
        width: "100%",
        height: 44,
        background: "var(--c-amber)",
        color: "var(--c-on-amber)",
        border: "none",
        borderRadius: "var(--r-2)",
        cursor: "pointer",
        fontFamily: "var(--f-mono)",
        fontSize: "var(--fs-label)",
        letterSpacing: ".16em",
        fontWeight: 700,
        textTransform: "uppercase"
      } }, "+ Launch project"),
      wallet: null,
      bell: null,
      accountBalance: { label: "wallet", value: fmtNavUSD(walletUSD), sub: addr, onClick: () => {
        location.href = "index.html#/wallet";
      } },
      right: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => window.openProducersCmdK && window.openProducersCmdK(),
          title: "Command palette (\u2318K)",
          style: { display: "flex", alignItems: "center", gap: 7, height: 34, padding: "0 11px", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", color: "var(--c-ink-3)", cursor: "pointer", borderRadius: "var(--r-3)" },
          onMouseEnter: (e) => {
            e.currentTarget.style.borderColor = "var(--c-line-3)";
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.borderColor = "var(--c-line-2)";
          }
        },
        /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".08em" } }, "\u2318K")
      ), route === "market" && /* @__PURE__ */ React.createElement(ProducerSearch, { query, onQuery })),
      tabs: /* @__PURE__ */ React.createElement("nav", { style: { display: "flex", alignItems: "stretch", height: "100%", padding: "0 4px" } }, tabs.map((t) => {
        const active = route === t.id;
        return /* @__PURE__ */ React.createElement(
          "button",
          {
            key: t.id,
            onClick: () => onRoute(t.id),
            style: {
              position: "relative",
              height: "100%",
              padding: "0 14px",
              fontSize: "var(--fs-body)",
              fontWeight: active ? 600 : 450,
              color: active ? "var(--c-ink)" : "var(--c-ink-3)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "color .14s ease",
              fontFamily: "var(--f-sans)"
            },
            onMouseEnter: (e) => {
              if (!active) e.currentTarget.style.color = "var(--c-ink)";
            },
            onMouseLeave: (e) => {
              if (!active) e.currentTarget.style.color = "var(--c-ink-3)";
            }
          },
          t.label,
          active && /* @__PURE__ */ React.createElement("span", { style: {
            position: "absolute",
            left: 12,
            right: 12,
            bottom: 14,
            height: 2,
            background: "var(--c-amber)",
            borderRadius: "var(--r-1)"
          } })
        );
      }))
    }
  );
}
function ProducerSearch({ query, onQuery }) {
  const [open, setOpen] = prUseState(Boolean(query));
  if (!open) {
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "btn-ghost btn-icon",
        style: { width: 36, height: 36 },
        onClick: () => setOpen(true),
        title: "Search projects"
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 16 })
    );
  }
  return /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: 240 } }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 13, style: { position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--c-ink-3)" } }), /* @__PURE__ */ React.createElement(
    "input",
    {
      autoFocus: true,
      value: query,
      onChange: (e) => onQuery(e.target.value),
      onBlur: () => {
        if (!query) setOpen(false);
      },
      placeholder: "Search projects",
      style: {
        width: "100%",
        height: 34,
        padding: "0 12px 0 32px",
        background: "var(--c-panel-2)",
        border: "1px solid var(--c-line-2)",
        borderRadius: "var(--r-3)",
        color: "var(--c-ink)",
        fontSize: "var(--fs-body)",
        outline: "none",
        fontFamily: "var(--f-sans)"
      }
    }
  ));
}
let _marketBooted = false;
function MarketSkeleton() {
  return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, marginTop: 22 } }, Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement(Skeleton, { w: "100%", h: 150, radius: 0 }), /* @__PURE__ */ React.createElement("div", { style: { padding: 16, display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement(Skeleton, { w: "70%", h: 18, radius: 4 }), /* @__PURE__ */ React.createElement(Skeleton, { w: "45%", h: 11, radius: 3 }), /* @__PURE__ */ React.createElement(Skeleton, { w: "100%", h: 5, radius: 3, style: { marginTop: 4 } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 2 } }, /* @__PURE__ */ React.createElement(Skeleton, { w: 64, h: 10, radius: 3 }), /* @__PURE__ */ React.createElement(Skeleton, { w: 48, h: 10, radius: 3 }))))));
}
function ProducerMarket({ projects, query, onOpen }) {
  const [sort, setSort] = prUseState("trending");
  const [kindFilter, setKindFilter] = prUseState("all");
  const [booting, setBooting] = prUseState(!_marketBooted);
  prUseEffect(() => {
    if (_marketBooted) return;
    const t = setTimeout(() => {
      _marketBooted = true;
      setBooting(false);
    }, 640);
    return () => clearTimeout(t);
  }, []);
  const filtered = prUseMemo(() => {
    let list = projects;
    if (kindFilter === "branched") list = list.filter((p) => p.branched);
    else if (kindFilter !== "all") list = list.filter((p) => p.kind === kindFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || (p.creator || "").toLowerCase().includes(q) || (p.film?.genre || []).some((g) => g.toLowerCase().includes(q))
      );
    }
    return sortProjects(list, sort);
  }, [projects, query, sort, kindFilter]);
  const featured = prUseMemo(() => {
    return [...projects].filter((p) => p.raised < p.goal).sort((a, b) => b.raised / b.goal - a.raised / a.goal)[0];
  }, [projects]);
  if (booting) {
    return /* @__PURE__ */ React.createElement("div", { style: { maxWidth: "var(--w-page)", margin: "0 auto", padding: "28px 32px 96px" } }, /* @__PURE__ */ React.createElement("div", { style: { paddingBottom: 16, borderBottom: "1px solid var(--c-line)", marginBottom: 22 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 8 } }, "NFT MARKET \xB7 PRODUCERS"), /* @__PURE__ */ React.createElement("h1", { style: { fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", lineHeight: 1.05, margin: 0, fontWeight: 400, letterSpacing: "-0.01em", textWrap: "balance" } }, "Back films, series, and branched rooms. ", /* @__PURE__ */ React.createElement("span", { style: { fontStyle: "italic", color: "var(--c-amber)" } }, "Earn with the audience."))), /* @__PURE__ */ React.createElement(Skeleton, { w: "100%", h: 200, radius: 10, style: { marginBottom: 22 } }), /* @__PURE__ */ React.createElement(MarketSkeleton, null));
  }
  return /* @__PURE__ */ React.createElement("div", { style: { maxWidth: "var(--w-page)", margin: "0 auto", padding: "28px 32px 96px" } }, /* @__PURE__ */ React.createElement("div", { style: { paddingBottom: 16, borderBottom: "1px solid var(--c-line)", marginBottom: 22 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 8 } }, "NFT MARKET \xB7 PRODUCERS"), /* @__PURE__ */ React.createElement("h1", { style: { fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", lineHeight: 1.05, margin: 0, fontWeight: 400, letterSpacing: "-0.01em", textWrap: "balance" } }, "Back films, series, and branched rooms. ", /* @__PURE__ */ React.createElement("span", { style: { fontStyle: "italic", color: "var(--c-amber)" } }, "Earn with the audience.")), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-2)", margin: "10px 0 0", maxWidth: 720, lineHeight: 1.5 } }, "Every film, series, and branched room on Cina opens a stake. Pick a project, choose a tier, vote on what gets greenlit, and collect a slice of every ad, ticket, and cut rental the work earns.")), featured && /* @__PURE__ */ React.createElement(FeaturedHero, { project: featured, onOpen }), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => window.openCreateProject && window.openCreateProject(),
      style: {
        width: "100%",
        marginTop: 18,
        padding: "18px 24px",
        background: "linear-gradient(105deg, rgba(var(--accent-rgb),.10) 0%, rgba(var(--accent-rgb),.02) 60%, transparent 100%)",
        border: "1px solid rgba(var(--accent-rgb),.3)",
        borderRadius: "var(--r-2)",
        cursor: "pointer",
        textAlign: "left",
        color: "inherit",
        display: "flex",
        alignItems: "center",
        gap: 18
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      width: 44,
      height: 44,
      borderRadius: "50%",
      flexShrink: 0,
      background: "rgba(var(--accent-rgb),.14)",
      border: "1px solid rgba(var(--accent-rgb),.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--c-amber)",
      fontSize: "var(--fs-title)",
      fontFamily: "var(--f-display)",
      fontStyle: "italic"
    } }, "+"),
    /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 4 } }, "FOR CREATORS"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, letterSpacing: "-0.01em", color: "var(--c-ink)" } }, "Raising for your own film? Launch a pool in five steps."), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-2)", marginTop: 3 } }, "Set your goal, design three tiers, deploy on-chain \u2014 backers buy in immediately.")),
    /* @__PURE__ */ React.createElement("span", { style: {
      flexShrink: 0,
      padding: "10px 18px",
      background: "var(--c-amber)",
      color: "var(--c-on-amber)",
      borderRadius: "var(--r-2)",
      fontFamily: "var(--f-mono)",
      fontSize: "var(--fs-label)",
      letterSpacing: ".16em",
      fontWeight: 700,
      textTransform: "uppercase"
    } }, "Launch project \u2192")
  ), /* @__PURE__ */ React.createElement(HowItWorks, null), /* @__PURE__ */ React.createElement(TopMovers, { projects, onOpen }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", margin: "28px 0 14px", gap: 16, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4 } }, [
    { id: "all", label: "All projects" },
    { id: "series", label: "Series" },
    { id: "film", label: "Films" },
    { id: "branched", label: "Branched" }
  ].map((k) => {
    const active = kindFilter === k.id;
    return /* @__PURE__ */ React.createElement("button", { key: k.id, onClick: () => setKindFilter(k.id), style: {
      appearance: "none",
      padding: "6px 12px",
      borderRadius: 999,
      background: active ? "var(--c-amber)" : "transparent",
      color: active ? tkc("on-amber") : "var(--c-ink-2)",
      border: `1px solid ${active ? "var(--c-amber)" : "var(--c-line)"}`,
      fontSize: "var(--fs-body)",
      fontWeight: active ? 600 : 500,
      cursor: "pointer",
      fontFamily: "var(--f-sans)"
    } }, k.label);
  })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, "SORT"), /* @__PURE__ */ React.createElement("select", { value: sort, onChange: (e) => setSort(e.target.value), style: {
    appearance: "none",
    padding: "5px 28px 5px 10px",
    background: "var(--c-panel)",
    color: "var(--c-ink)",
    border: "1px solid var(--c-line)",
    borderRadius: "var(--r-2)",
    fontSize: "var(--fs-body)",
    fontFamily: "var(--f-sans)",
    backgroundImage: "linear-gradient(45deg, transparent 50%, var(--c-ink-3) 50%), linear-gradient(135deg, var(--c-ink-3) 50%, transparent 50%)",
    backgroundPosition: "calc(100% - 14px) 50%, calc(100% - 9px) 50%",
    backgroundSize: "5px 5px, 5px 5px",
    backgroundRepeat: "no-repeat"
  } }, SORTS.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.id }, s.label))))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 } }, filtered.map((p) => /* @__PURE__ */ React.createElement(MarketCard, { key: p.id, project: p, onOpen }))), filtered.length === 0 && /* @__PURE__ */ React.createElement(
    EmptyState,
    {
      icon: "search",
      title: query.trim() ? `No projects match \u201C${query.trim()}\u201D` : "No projects match those filters",
      body: "Try a different sort or filter, or clear your search to see every open pool.",
      cta: /* @__PURE__ */ React.createElement("button", { className: "btn", style: { height: 34 }, onClick: () => setKindFilter("all") }, "Show all projects")
    }
  ));
}
function FeaturedHero({ project, onOpen }) {
  const pctRaised = Math.min(1, project.raised / project.goal);
  const lowestTier = project.tiers[0];
  const isMobile = typeof useIsMobile === "function" ? useIsMobile() : false;
  return /* @__PURE__ */ React.createElement("div", { style: {
    marginTop: 22,
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr",
    gap: 0,
    background: "var(--c-panel)",
    border: "1px solid var(--c-line)",
    borderRadius: "var(--r-3)",
    overflow: "hidden"
  } }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative", aspectRatio: "16/9", background: project.color, overflow: "hidden" } }, /* @__PURE__ */ React.createElement(FrameThumb, { kind: project.thumb, usePhoto: true }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,.85) 0%, rgba(0,0,0,0) 50%)" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 18, bottom: 16, color: tkc("white") } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", marginBottom: 6 } }, "FEATURED \xB7 ", project.branched ? "BRANCHED" : project.kind === "series" ? "SERIES" : "FILM"), /* @__PURE__ */ React.createElement("h2", { style: { fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", fontStyle: "italic", margin: 0, fontWeight: 400, letterSpacing: "-0.01em", color: tkc("white") } }, project.film?.title || project.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "rgba(255,255,255,.7)", marginTop: 4, fontFamily: "var(--f-mono)", letterSpacing: ".16em" } }, project.creator?.toUpperCase()))), /* @__PURE__ */ React.createElement("div", { style: { padding: 22, display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-2)", margin: 0, lineHeight: 1.5 } }, project.summary), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 18, paddingTop: 6 } }, /* @__PURE__ */ React.createElement(Stat, { label: "RAISED", value: fmtUSDK(project.raised), sub: `of ${fmtUSDK(project.goal)} goal` }), /* @__PURE__ */ React.createElement(Stat, { label: "BACKERS", value: (project.backers || 0).toLocaleString(), sub: `${project.daysLeft}d left` }), /* @__PURE__ */ React.createElement(Stat, { label: "FROM", value: `$${lowestTier.priceUSD}`, sub: lowestTier.name + " tier", amber: true })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { height: 5, borderRadius: 999, background: "var(--c-line)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: `${pctRaised * 100}%`, height: "100%", background: "var(--c-amber)" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 6, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, /* @__PURE__ */ React.createElement("span", null, (pctRaised * 100).toFixed(0), "% FUNDED"), /* @__PURE__ */ React.createElement("span", null, project.daysLeft, " DAYS LEFT"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => onOpen(project.id), style: {
    appearance: "none",
    padding: "10px 16px",
    background: "var(--c-amber)",
    border: 0,
    borderRadius: "var(--r-2)",
    color: "var(--c-on-amber)",
    fontWeight: 700,
    fontSize: "var(--fs-body)",
    cursor: "pointer",
    letterSpacing: ".02em"
  } }, "Buy producer NFT \u2192"), /* @__PURE__ */ React.createElement("button", { onClick: () => onOpen(project.id), style: {
    appearance: "none",
    padding: "10px 14px",
    background: "transparent",
    border: "1px solid var(--c-line)",
    borderRadius: "var(--r-2)",
    color: "var(--c-ink)",
    fontSize: "var(--fs-body)",
    cursor: "pointer"
  } }, "View project"))));
}
function Stat({ label, value, sub, amber }) {
  return /* @__PURE__ */ React.createElement(CinaStat, { size: "sm", label, value, sub, tone: amber ? "accent" : void 0 });
}
function MarketCard({ project, onOpen }) {
  const pctRaised = Math.min(1, project.raised / project.goal);
  const cheapest = project.tiers[0];
  const totalSupply = project.tiers.reduce((s, t) => s + t.count, 0);
  const totalSold = project.tiers.reduce((s, t) => s + t.sold, 0);
  const meta = project.branch || null;
  const topLeft = [
    /* @__PURE__ */ React.createElement(TileBadge, { key: "k" }, project.branched ? "BRANCHED" : project.kind === "series" ? "SERIES" : "FILM"),
    meta && /* @__PURE__ */ React.createElement(TileBadge, { key: "live", kind: "amber" }, "\u25CF ", meta.liveNow.toLocaleString(), " IN ROOM"),
    !meta && project.daysLeft <= 7 && /* @__PURE__ */ React.createElement(TileBadge, { key: "d", kind: "amber" }, project.daysLeft, "D LEFT")
  ];
  return /* @__PURE__ */ React.createElement(
    FilmTile,
    {
      thumb: project.thumb,
      color: project.color,
      title: project.film?.title || project.title,
      subtitle: project.creator,
      topLeft,
      topRight: window.HeartButton ? /* @__PURE__ */ React.createElement(HeartButton, { projectId: project.id, size: 15 }) : null,
      onClick: () => onOpen(project.id),
      footer: /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 2px 2px", display: "flex", flexDirection: "column", gap: 13 } }, meta && window.BranchedStatStrip ? /* @__PURE__ */ React.createElement(window.BranchedStatStrip, { meta }) : null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, "FROM"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontSize: "var(--fs-title)", fontWeight: 500, color: "var(--c-amber)", lineHeight: 1, marginTop: 4 } }, "$", cheapest.priceUSD), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 3 } }, cheapest.name, " tier")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, "REV SHARE"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontSize: "var(--fs-lead)", fontWeight: 500, color: "var(--c-ink)", lineHeight: 1, marginTop: 4 } }, project.revShare, "%"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 3 } }, meta ? `+ ${meta.cutRevShare}% cut rentals` : "through Y5"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: pctRaised >= 0.8 ? "var(--c-amber)" : "var(--c-ink-2)", letterSpacing: ".08em", fontWeight: 600 } }, (pctRaised * 100).toFixed(0), "% funded"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em" } }, fmtUSDK(project.raised), " ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-4)" } }, "/ ", fmtUSDK(project.goal)))), /* @__PURE__ */ React.createElement("div", { style: { height: 4, borderRadius: 999, background: "var(--c-line)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: `${pctRaised * 100}%`, height: "100%", background: "var(--c-amber)" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 7, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em" } }, /* @__PURE__ */ React.createElement("span", null, totalSold.toLocaleString(), " backers"), /* @__PURE__ */ React.createElement("span", null, Math.max(0, totalSupply - totalSold).toLocaleString(), " passes left"))))
    }
  );
}
function fmtUSDK(n) {
  if (!n) return "$0";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return "$" + Math.round(n / 1e3) + "k";
  return "$" + n;
}
function ProducerDetail({ project, onBack }) {
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    UnifiedNFTPage,
    {
      project,
      film: project?.film,
      onBack,
      showHolderHub: true
    }
  ), typeof window.BranchedProjectPanel === "function" && /* @__PURE__ */ React.createElement(window.BranchedProjectPanel, { project }));
}
function BranchedRightsTable({ rows, onOpen }) {
  if (!rows.length) return null;
  return /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: "minmax(0,1.5fr) 90px 96px 104px 108px",
    gap: 12,
    padding: "10px 14px",
    background: "var(--c-panel-2)",
    borderBottom: "1px solid var(--c-line)",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    color: "var(--c-ink-4)"
  } }, /* @__PURE__ */ React.createElement("div", null, "FILM \xB7 RIGHT"), /* @__PURE__ */ React.createElement("div", null, "FORKS"), /* @__PURE__ */ React.createElement("div", null, "CUTS RENTED"), /* @__PURE__ */ React.createElement("div", null, "RENTAL YIELD"), /* @__PURE__ */ React.createElement("div", null, "YOUR SHARE")), rows.map((r) => {
    const m = r.project.branch || (window.pbMeta ? window.pbMeta(r.project.film?.id) : null);
    if (!m) return null;
    const weekly = (m.cutsRentedWk || 0) * (m.rentPriceUSD || 0);
    const yours = weekly * (m.cutRevShare / 100) * 0.04;
    return /* @__PURE__ */ React.createElement("button", { key: r.project.id, onClick: () => onOpen && onOpen(r.project.id), style: {
      width: "100%",
      appearance: "none",
      cursor: "pointer",
      textAlign: "left",
      color: "inherit",
      display: "grid",
      gridTemplateColumns: "minmax(0,1.5fr) 90px 96px 104px 108px",
      gap: 12,
      padding: "13px 14px",
      background: "transparent",
      border: 0,
      borderBottom: "1px solid var(--c-line)",
      alignItems: "center"
    } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0, display: "flex", alignItems: "center", gap: 9 } }, window.PbBranchGlyph ? /* @__PURE__ */ React.createElement(window.PbBranchGlyph, { size: 13, color: tkc("bad"), dim: "rgba(201,85,72,.45)" }) : null, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, r.project.film?.title || r.project.title), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginTop: 3 } }, (r.tier?.name || "ROOM SEAT").toUpperCase()))), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-ink-2)" } }, m.forks), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-ink-2)" } }, (m.cutsRentedWk || 0).toLocaleString()), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-ink-2)" } }, "$", weekly.toLocaleString(), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)" } }, "/WK")), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-amber)", fontWeight: 600 } }, "$", yours.toFixed(2), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)" } }, "/WK")));
  }));
}
function WatchlistPage({ projects, onOpen }) {
  const session = window.useProducerSession ? window.useProducerSession() : { s: { watchlist: [] } };
  const watched = session.s.watchlist || [];
  const list = projects.filter((p) => watched.includes(p.id));
  return /* @__PURE__ */ React.createElement("div", { style: { maxWidth: "var(--w-page)", margin: "0 auto", padding: "28px 32px 96px" } }, /* @__PURE__ */ React.createElement("div", { style: { paddingBottom: 16, borderBottom: "1px solid var(--c-line)", marginBottom: 22 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 8 } }, "WATCHLIST"), /* @__PURE__ */ React.createElement("h1", { style: { fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", margin: 0, fontWeight: 400, letterSpacing: "-0.01em" } }, "Projects you're tracking")), list.length === 0 ? /* @__PURE__ */ React.createElement(
    EmptyState,
    {
      icon: "folder",
      title: "Nothing on your watchlist yet",
      body: "Open any project in the market and bookmark it \u2014 tracked pools land here so you can watch them raise.",
      cta: /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", style: { height: 36 }, onClick: () => {
        location.hash = "market";
      } }, "Browse the market")
    }
  ) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 12 } }, list.length, " PROJECT", list.length === 1 ? "" : "S", " TRACKED"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 } }, list.map((p) => /* @__PURE__ */ React.createElement(MarketCard, { key: p.id, project: p, onOpen })))));
}
function PortfolioPage({ projects, onOpen }) {
  const isMobile = typeof useIsMobile === "function" ? useIsMobile() : false;
  const session = window.useProducerSession ? window.useProducerSession() : null;
  const holdings = session?.s?.holdings || window.USER?.holdings || [];
  const claims = session?.s?.claims || [];
  const listings = session?.s?.listings || [];
  const bids = session?.s?.bids || [];
  const [tab, setTab] = prUseState("holdings");
  const launched = projects.filter((p) => p.userLaunched);
  const synth = launched.map((p) => ({
    projectId: p.id,
    tierId: (p.tiers[p.tiers.length - 1] || {}).id,
    qty: 1,
    costUSD: 0,
    founder: true,
    at: p.launchedAt
  }));
  const allHoldings = [...synth.filter((sh) => !holdings.some((h) => h.projectId === sh.projectId)), ...holdings];
  const rows = allHoldings.map((h) => {
    const proj = projects.find((p) => p.id === h.projectId);
    if (!proj) return null;
    const tier = proj.tiers.find((t) => t.id === h.tier) || proj.tiers[0];
    const cost = (h.costBasis || tier.priceUSD * 0.85) * h.qty;
    const value = tier.priceUSD * h.qty;
    return { h, holding: h, proj, project: proj, tier, cost, value };
  }).filter(Boolean);
  const totalCost = rows.reduce((s, r) => s + r.cost, 0);
  const totalValue = rows.reduce((s, r) => s + r.value, 0);
  const pnl = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? pnl / totalCost * 100 : 0;
  const claimable = claims.filter((c) => c.status === "claimable");
  const claimableTotal = claimable.reduce((s, c) => s + c.amount, 0);
  const royalties = claims.filter((c) => c.status === "claimed").reduce((s, c) => s + c.amount, 0) + rows.reduce((s, r) => s + (r.proj.royaltyPaid || 0) * 1e-3 * r.h.qty, 0);
  const cutIncome = rows.reduce((s, r) => {
    const m = r.proj.branch || (window.pbMeta ? window.pbMeta(r.proj.film?.id) : null);
    if (!m) return s;
    return s + (m.cutsRentedWk || 0) * (m.rentPriceUSD || 0) * (m.cutRevShare / 100) * 0.04 * 4.3;
  }, 0);
  return /* @__PURE__ */ React.createElement("div", { style: { maxWidth: "var(--w-page)", margin: "0 auto", padding: "28px 32px 96px" } }, /* @__PURE__ */ React.createElement("div", { style: { paddingBottom: 16, borderBottom: "1px solid var(--c-line)", marginBottom: 22 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 8 } }, "MY STAKES"), /* @__PURE__ */ React.createElement("h1", { style: { fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", margin: 0, fontWeight: 400, letterSpacing: "-0.01em" } }, "Your producer holdings")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : `repeat(${cutIncome > 0 ? 5 : 4}, 1fr)`, gap: 12, marginBottom: 22 } }, /* @__PURE__ */ React.createElement(KPI, { label: "MARKET VALUE", value: fmtUSDK(totalValue), sub: "across all stakes" }), /* @__PURE__ */ React.createElement(KPI, { label: "COST BASIS", value: fmtUSDK(totalCost), sub: "invested" }), /* @__PURE__ */ React.createElement(KPI, { label: "UNREALIZED P/L", value: `${pnl >= 0 ? "+" : "\u2212"}${fmtUSDK(Math.abs(pnl))}`, sub: `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(1)}%`, amber: pnl >= 0 }), /* @__PURE__ */ React.createElement(KPI, { label: "ROYALTIES PAID", value: fmtUSDK(royalties), sub: "lifetime distributions" }), cutIncome > 0 && /* @__PURE__ */ React.createElement(KPI, { label: "CUT RENTALS", value: fmtUSDK(cutIncome), sub: "branched paths \xB7 /mo", amber: true })), rows.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.6fr 1fr", gap: 14, marginBottom: 22 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", padding: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, "PORTFOLIO VALUE \xB7 60D"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 4, fontStyle: "italic" } }, fmtUSDK(totalValue), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: pnl >= 0 ? "var(--c-amber)" : tkc("bad"), marginLeft: 8 } }, pnl >= 0 ? "\u25B2" : "\u25BC", " ", pnlPct.toFixed(1), "%")))), window.PortfolioSpark && /* @__PURE__ */ React.createElement(PortfolioSpark, { height: 150 })), /* @__PURE__ */ React.createElement("div", { style: {
    background: claimable.length > 0 ? "linear-gradient(180deg, rgba(var(--accent-rgb),.08) 0%, var(--c-panel) 100%)" : "var(--c-panel)",
    border: `1px solid ${claimable.length > 0 ? "rgba(var(--accent-rgb),.4)" : "var(--c-line)"}`,
    borderRadius: "var(--r-3)",
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 10
  } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, "READY TO CLAIM"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", fontStyle: "italic", color: "var(--c-amber)", lineHeight: 1 } }, fmtUSDK(claimableTotal)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", flex: 1 } }, claimable.length > 0 ? `${claimable.length} distribution${claimable.length > 1 ? "s" : ""} across ${new Set(claimable.map((c) => c.projectId)).size} project${new Set(claimable.map((c) => c.projectId)).size > 1 ? "s" : ""} \u2014 settle in one tx.` : "You're up to date. Next quarter's distribution arrives Apr 1."), claimable.length > 0 && /* @__PURE__ */ React.createElement("button", { onClick: () => session.claimAll(), style: {
    appearance: "none",
    padding: "10px 14px",
    background: "var(--c-amber)",
    border: 0,
    borderRadius: "var(--r-2)",
    color: "var(--c-on-amber)",
    fontWeight: 600,
    fontSize: "var(--fs-body)",
    cursor: "pointer"
  } }, "Claim all ", fmtUSDK(claimableTotal), " \u2192"))), rows.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 2, borderBottom: "1px solid var(--c-line)", marginBottom: 16 } }, [
    { id: "holdings", label: "Holdings", count: rows.length },
    ...rows.some((r) => r.project.branched) ? [{ id: "branched", label: "Branched rights", count: rows.filter((r) => r.project.branched).length }] : [],
    { id: "distributions", label: "Distributions", count: claims.length },
    { id: "listings", label: "My listings", count: listings.filter((l) => l.status === "open").length },
    { id: "bids", label: "My bids", count: bids.filter((b) => b.status === "open").length }
  ].map((p) => {
    const active = tab === p.id;
    return /* @__PURE__ */ React.createElement("button", { key: p.id, onClick: () => setTab(p.id), style: {
      appearance: "none",
      padding: "10px 14px",
      background: "transparent",
      border: 0,
      borderRadius: 0,
      borderBottom: `2px solid ${active ? "var(--c-amber)" : "transparent"}`,
      color: active ? "var(--c-ink)" : "var(--c-ink-3)",
      fontSize: "var(--fs-body)",
      fontWeight: active ? 600 : 450,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 6
    } }, p.label, p.count > 0 && /* @__PURE__ */ React.createElement("span", { style: {
      fontFamily: "var(--f-mono)",
      fontSize: "var(--fs-label)",
      padding: "1px 6px",
      background: active ? "var(--c-amber)" : "var(--c-line)",
      color: active ? tkc("on-amber") : "var(--c-ink-3)",
      borderRadius: "var(--r-2)"
    } }, p.count));
  })), rows.length === 0 ? /* @__PURE__ */ React.createElement(
    EmptyState,
    {
      icon: "wallet",
      title: "No stakes yet",
      body: "Back a film in the market and your producer holdings, distributions and P/L all show up here.",
      cta: /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", style: { height: 36 }, onClick: () => {
        location.hash = "market";
      } }, "Find a film to back")
    }
  ) : tab === "branched" ? /* @__PURE__ */ React.createElement(BranchedRightsTable, { rows: rows.filter((r) => r.project.branched), onOpen }) : tab === "distributions" ? /* @__PURE__ */ React.createElement(
    DistributionSchedule,
    {
      claims,
      projects,
      onClaim: (c, proj) => window.openClaimModal && window.openClaimModal(c, proj)
    }
  ) : tab === "listings" ? /* @__PURE__ */ React.createElement(ListingsTable, { listings, projects, onCancel: (id) => session.cancelListing(id) }) : tab === "bids" ? /* @__PURE__ */ React.createElement(BidsTable, { bids, projects, onCancel: (id) => session.cancelBid(id) }) : /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.6fr 1fr 0.8fr 1fr 1fr 1fr", padding: "10px 16px", background: "var(--c-panel-2)", borderBottom: "1px solid var(--c-line)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, /* @__PURE__ */ React.createElement("div", null, "PROJECT"), /* @__PURE__ */ React.createElement("div", null, "TIER"), /* @__PURE__ */ React.createElement("div", null, "QTY"), /* @__PURE__ */ React.createElement("div", null, "COST"), /* @__PURE__ */ React.createElement("div", null, "VALUE"), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, "P/L")), rows.map((r, i) => {
    const rowPnl = r.value - r.cost;
    return /* @__PURE__ */ React.createElement("button", { key: i, onClick: () => onOpen(r.proj.id), style: {
      display: "grid",
      gridTemplateColumns: "1.6fr 1fr 0.8fr 1fr 1fr 1fr",
      padding: "12px 16px",
      borderBottom: i < rows.length - 1 ? "1px solid var(--c-line)" : 0,
      fontSize: "var(--fs-body)",
      alignItems: "center",
      textAlign: "left",
      background: "transparent",
      border: "none",
      borderRadius: 0,
      color: "inherit",
      cursor: "pointer",
      width: "100%",
      appearance: "none",
      borderTopWidth: 0
    } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 36, height: 24, borderRadius: "var(--r-1)", overflow: "hidden", background: r.proj.color } }, /* @__PURE__ */ React.createElement(FrameThumb, { kind: r.proj.thumb, usePhoto: true })), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-display)", fontStyle: "italic" } }, r.proj.film?.title || r.proj.title)), /* @__PURE__ */ React.createElement("div", { style: { color: r.tier.color, fontWeight: 500 } }, r.tier.name), /* @__PURE__ */ React.createElement("div", { className: "t-num", style: { fontFamily: "var(--f-mono)" } }, "\xD7", r.h.qty), /* @__PURE__ */ React.createElement("div", { className: "t-num", style: { fontFamily: "var(--f-mono)", color: "var(--c-ink-2)" } }, fmtUSDK(r.cost)), /* @__PURE__ */ React.createElement("div", { className: "t-num", style: { fontFamily: "var(--f-mono)" } }, fmtUSDK(r.value)), /* @__PURE__ */ React.createElement("div", { className: "t-num", style: { fontFamily: "var(--f-mono)", textAlign: "right", color: rowPnl >= 0 ? "var(--c-amber)" : tkc("bad"), display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", null, rowPnl >= 0 ? "+" : "\u2212", fmtUSDK(Math.abs(rowPnl))), /* @__PURE__ */ React.createElement(
      "span",
      {
        onClick: (e) => {
          e.stopPropagation();
          window.openListModal && window.openListModal(r.proj, r.h);
        },
        style: {
          appearance: "none",
          border: "1px solid var(--c-line)",
          background: "var(--c-panel-2)",
          color: "var(--c-ink-2)",
          padding: "4px 8px",
          borderRadius: "var(--r-2)",
          fontFamily: "var(--f-mono)",
          fontSize: "var(--fs-label)",
          letterSpacing: ".16em",
          cursor: "pointer"
        }
      },
      "LIST"
    )));
  })));
}
const PRO_KYC_KEY = "cina:producers:kyc";
function prKycLoad() {
  try {
    return JSON.parse(localStorage.getItem(PRO_KYC_KEY)) || {};
  } catch (e) {
    return {};
  }
}
function prKycSave(v) {
  try {
    localStorage.setItem(PRO_KYC_KEY, JSON.stringify(v));
  } catch (e) {
  }
}
function downloadFile(name, text, mime) {
  const blob = new Blob([text], { type: mime || "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function ProducerDocsPage({ projects }) {
  const session = window.useProducerSession ? window.useProducerSession() : null;
  const claims = session?.s?.claims || [];
  const holdings = session?.s?.holdings || [];
  const cina = window.useCinaId ? window.useCinaId() : null;
  const [kyc, setKyc] = prUseState(prKycLoad());
  const [wizard, setWizard] = prUseState(null);
  const [form, setForm] = prUseState({ legalName: "", country: "United States", idType: "Passport", idNumber: "", tin: "" });
  const verified = kyc.status === "verified";
  const pending = kyc.status === "pending";
  const byYear = {};
  claims.filter((c) => c.status === "claimed").forEach((c) => {
    const yr = c.date && c.date.slice(0, 4) || "2025";
    byYear[yr] = (byYear[yr] || 0) + (c.amount || 0);
  });
  if (Object.keys(byYear).length === 0) {
    byYear["2025"] = 0;
  }
  const years = Object.keys(byYear).sort().reverse();
  const submitKyc = () => {
    const next = { status: "pending", legalName: form.legalName, country: form.country, submittedAt: Date.now() };
    setKyc(next);
    prKycSave(next);
    setWizard(null);
    window.toast && window.toast({ title: "SUBMITTED", text: "Verification usually clears within minutes.", kind: "info" });
    setTimeout(() => {
      const done = { ...next, status: "verified", verifiedAt: Date.now() };
      setKyc(done);
      prKycSave(done);
      window.toast && window.toast({ title: "VERIFIED", text: "You're cleared to receive distributions.", kind: "good" });
    }, 3200);
  };
  const export1099 = (yr) => {
    const gross = byYear[yr] || 0;
    const lines = [
      "FORM 1099-MISC (informational copy) \u2014 Cina Producers",
      "Tax year: " + yr,
      "Recipient: " + (kyc.legalName || cina?.handle || "Producer"),
      "TIN on file: " + (kyc.status === "verified" ? "\u2022\u2022\u2022-\u2022\u2022-" + String(Math.abs((kyc.legalName || "x").length * 137 % 1e4)).padStart(4, "0") : "NOT VERIFIED"),
      "Box 2 \u2014 Royalties: " + fmtNavUSD(gross),
      "Box 3 \u2014 Other income: $0.00",
      "",
      "Payer: Cina Studio, Inc. \xB7 payer EIN 88-\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
      "This is a platform-generated informational copy, not a filed tax document."
    ];
    downloadFile("cina-1099-" + yr + ".txt", lines.join("\n"), "text/plain");
    window.toast && window.toast({ title: "1099 EXPORTED", text: yr + " statement downloaded.", kind: "good" });
  };
  const exportAnnualCSV = (yr) => {
    const rows = [["date", "project", "type", "amount_usd"]];
    claims.filter((c) => c.status === "claimed" && (c.date && c.date.slice(0, 4) || "2025") === yr).forEach((c) => {
      const proj = projects.find((p) => p.id === c.projectId);
      rows.push([c.date || yr + "-01-01", proj?.film?.title || proj?.title || c.projectId, "royalty distribution", (c.amount || 0).toFixed(2)]);
    });
    if (rows.length === 1) rows.push([yr + "-01-01", "\u2014", "no distributions", "0.00"]);
    downloadFile("cina-statement-" + yr + ".csv", rows.map((r) => r.join(",")).join("\n"), "text/csv");
    window.toast && window.toast({ title: "STATEMENT EXPORTED", text: yr + " activity (CSV) downloaded.", kind: "good" });
  };
  const field = { width: "100%", boxSizing: "border-box", padding: "10px 12px", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)", outline: "none" };
  const lbl = { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 6, display: "block" };
  return /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 920, margin: "0 auto", padding: "28px 32px 96px" } }, /* @__PURE__ */ React.createElement("div", { style: { paddingBottom: 16, borderBottom: "1px solid var(--c-line)", marginBottom: 22 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 8 } }, "ACCOUNT \xB7 DOCUMENTS"), /* @__PURE__ */ React.createElement("h1", { style: { fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", margin: 0, fontWeight: 400, letterSpacing: "-0.01em" } }, "Verification & tax documents")), /* @__PURE__ */ React.createElement("div", { style: {
    background: verified ? "linear-gradient(180deg, rgba(106,163,122,.08), var(--c-panel))" : pending ? "linear-gradient(180deg, rgba(var(--accent-rgb),.07), var(--c-panel))" : "var(--c-panel)",
    border: `1px solid ${verified ? "rgba(106,163,122,.4)" : pending ? "rgba(var(--accent-rgb),.35)" : "var(--c-line-2)"}`,
    borderRadius: "var(--r-3)",
    padding: 20,
    marginBottom: 18,
    display: "flex",
    gap: 18,
    alignItems: "flex-start"
  } }, /* @__PURE__ */ React.createElement("div", { style: { width: 40, height: 40, borderRadius: "var(--r-2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: verified ? "rgba(106,163,122,.18)" : pending ? "rgba(var(--accent-rgb),.16)" : "var(--c-panel-2)", border: "1px solid var(--c-line-2)" } }, /* @__PURE__ */ React.createElement(Icon, { name: verified ? "check" : "shield", size: 18 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)" } }, "Identity verification"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", padding: "3px 8px", borderRadius: "var(--r-1)", background: verified ? "rgba(106,163,122,.2)" : pending ? "rgba(var(--accent-rgb),.18)" : "var(--c-line)", color: verified ? "var(--c-good)" : pending ? "var(--c-amber)" : "var(--c-ink-3)" } }, verified ? "VERIFIED" : pending ? "PENDING" : "REQUIRED")), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6, margin: "8px 0 0", maxWidth: 560 } }, verified ? `Cleared as ${kyc.legalName}. You can receive distributions and your tax statements carry a TIN on file.` : pending ? "Your details are in review \u2014 distributions are paused until this clears. This usually takes a few minutes." : "Producers must verify identity before receiving royalty distributions. KYC also unlocks your 1099 statements below."), !verified && !pending && /* @__PURE__ */ React.createElement("button", { onClick: () => setWizard(0), className: "btn btn-primary", style: { height: 38, padding: "0 18px", marginTop: 14 } }, "Start verification \u2192"))), (() => {
    const held = (projects || []).filter((pr) => pr.branched && holdings.some((h) => h.projectId === pr.id));
    if (!held.length) return null;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", margin: "26px 0 12px" } }, "BRANCHED RIGHTS \xB7 TERM SHEETS"), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-panel)", border: "1px solid rgba(201,85,72,.3)", borderRadius: "var(--r-3)", overflow: "hidden" } }, held.map((pr, i) => {
      const m = pr.branch || (window.pbMeta ? window.pbMeta(pr.film?.id) : null);
      if (!m) return null;
      return /* @__PURE__ */ React.createElement("div", { key: pr.id, style: { padding: "16px 18px", borderTop: i ? "1px solid var(--c-line)" : "none" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 11, marginBottom: 12, flexWrap: "wrap" } }, window.PbBranchGlyph ? /* @__PURE__ */ React.createElement(window.PbBranchGlyph, { size: 14, color: tkc("bad"), dim: "rgba(201,85,72,.45)" }) : null, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)" } }, pr.film?.title || pr.title), /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement("button", { className: "btn", style: { height: 30, padding: "0 12px", fontSize: "var(--fs-body)" }, onClick: () => {
        const lines = [
          "BRANCHED RIGHTS TERM SHEET \u2014 Cina Producers",
          "",
          "Work: " + (pr.film?.title || pr.title),
          "Director: " + (pr.creator || "\u2014"),
          "Chain: " + (pr.chain || "Base"),
          "",
          "STRUCTURE",
          "Forks: " + m.forks,
          "Options per fork: " + (m.optionsPerFork || 3),
          "Distinct cuts: " + m.totalCuts,
          "Vote window: " + m.voteWindowSec + " seconds per fork",
          "Canonical path: " + (m.canonical || "set by the room"),
          "",
          "ECONOMICS",
          "Rental price per cut: $" + m.rentPriceUSD,
          "Cuts rented (trailing week): " + (m.cutsRentedWk || 0),
          "Holder share of rental revenue: " + m.cutRevShare + "%",
          "Film revenue share: " + (pr.revShare || 0) + "% through Y5",
          "Distribution: monthly, on-chain, to the holder of record",
          "",
          "ALLOCATION OF RENTAL REVENUE",
          "Rentals are attributed to the branch the viewer walked. A holder of",
          "Fork Rights earns on their path only; the Canonical Cut holder earns",
          "on the path the room voted in. Room Seats carry vote weight, not",
          "rental revenue.",
          "",
          "This is an informational summary, not the executed agreement."
        ];
        const blob = new Blob([lines.join("\n")], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a2 = document.createElement("a");
        a2.href = url;
        a2.download = "cina-branched-terms-" + pr.id + ".txt";
        a2.click();
        URL.revokeObjectURL(url);
        window.toast && window.toast({ title: "DOWNLOADED", text: "Term sheet \xB7 " + (pr.film?.title || pr.title), kind: "good" });
      } }, "Download")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 14 } }, [
        ["FORKS", m.forks],
        ["CUTS", m.totalCuts.toLocaleString()],
        ["RENTAL", "$" + m.rentPriceUSD],
        ["HOLDER SHARE", m.cutRevShare + "%"],
        ["FILM REV SHARE", (pr.revShare || 0) + "%"]
      ].map(([k, v]) => /* @__PURE__ */ React.createElement("div", { key: k }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 5 } }, k), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: k === "HOLDER SHARE" ? "var(--c-amber)" : "var(--c-ink)" } }, v)))));
    })));
  })(), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", margin: "26px 0 12px" } }, "TAX STATEMENTS"), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "0.8fr 1fr 1.4fr", padding: "10px 18px", background: "var(--c-panel-2)", borderBottom: "1px solid var(--c-line)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, /* @__PURE__ */ React.createElement("div", null, "TAX YEAR"), /* @__PURE__ */ React.createElement("div", null, "ROYALTIES"), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, "DOCUMENTS")), years.map((yr, i) => /* @__PURE__ */ React.createElement("div", { key: yr, style: { display: "grid", gridTemplateColumns: "0.8fr 1fr 1.4fr", padding: "14px 18px", alignItems: "center", borderTop: i ? "1px solid var(--c-line)" : "none" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)" } }, yr), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-ink)" } }, fmtNavUSD(byYear[yr])), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => verified ? export1099(yr) : setWizard(0), title: verified ? "" : "Verify your identity first", style: {
    appearance: "none",
    padding: "7px 12px",
    borderRadius: "var(--r-2)",
    cursor: "pointer",
    background: verified ? "var(--c-amber)" : "var(--c-panel-2)",
    color: verified ? tkc("on-amber") : "var(--c-ink-4)",
    border: verified ? "none" : "1px solid var(--c-line-2)",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    fontWeight: 600
  } }, verified ? "1099-MISC \u2193" : "1099 \xB7 LOCKED"), /* @__PURE__ */ React.createElement("button", { onClick: () => exportAnnualCSV(yr), style: {
    appearance: "none",
    padding: "7px 12px",
    borderRadius: "var(--r-2)",
    cursor: "pointer",
    background: "transparent",
    color: "var(--c-ink-2)",
    border: "1px solid var(--c-line-2)",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em"
  } }, "STATEMENT (CSV) \u2193"))))), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-4)", lineHeight: 1.6, marginTop: 12 } }, "Statements are platform-generated informational copies covering royalty distributions paid to your wallet. They are not filed tax documents \u2014 consult a tax professional. A 1099-MISC is issued when annual distributions exceed $600."), wizard !== null && /* @__PURE__ */ React.createElement("div", { onClick: () => setWizard(null), style: { position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,.6)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 } }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: { width: "100%", maxWidth: 440, background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)", padding: 24, boxShadow: "0 30px 80px rgba(0,0,0,.6)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-lead)" } }, "Verify your identity"), /* @__PURE__ */ React.createElement("button", { onClick: () => setWizard(null), className: "btn-ghost btn-icon", style: { width: 28, height: 28 } }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 12 }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: lbl }, "LEGAL NAME"), /* @__PURE__ */ React.createElement("input", { value: form.legalName, onChange: (e) => setForm({ ...form, legalName: e.target.value }), placeholder: "As on your government ID", style: field })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: lbl }, "COUNTRY"), /* @__PURE__ */ React.createElement("select", { value: form.country, onChange: (e) => setForm({ ...form, country: e.target.value }), style: field }, ["United States", "Canada", "United Kingdom", "Germany", "Japan", "Nigeria", "Other"].map((c) => /* @__PURE__ */ React.createElement("option", { key: c }, c)))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: lbl }, "ID TYPE"), /* @__PURE__ */ React.createElement("select", { value: form.idType, onChange: (e) => setForm({ ...form, idType: e.target.value }), style: field }, ["Passport", "Driver's license", "National ID"].map((c) => /* @__PURE__ */ React.createElement("option", { key: c }, c))))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: lbl }, "ID NUMBER"), /* @__PURE__ */ React.createElement("input", { value: form.idNumber, onChange: (e) => setForm({ ...form, idNumber: e.target.value }), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", style: field })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: lbl }, "TAX ID (TIN / SSN)"), /* @__PURE__ */ React.createElement("input", { value: form.tin, onChange: (e) => setForm({ ...form, tin: e.target.value }), placeholder: "For 1099 reporting", style: field })), /* @__PURE__ */ React.createElement("button", { onClick: submitKyc, disabled: !form.legalName || !form.idNumber, style: {
    height: 44,
    borderRadius: "var(--r-2)",
    marginTop: 4,
    border: "none",
    background: form.legalName && form.idNumber ? "var(--c-amber)" : "var(--c-line)",
    color: form.legalName && form.idNumber ? tkc("on-amber") : "var(--c-ink-4)",
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    fontWeight: 700,
    cursor: form.legalName && form.idNumber ? "pointer" : "not-allowed"
  } }, "SUBMIT FOR REVIEW"), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", textAlign: "center", letterSpacing: ".16em" } }, "ENCRYPTED \xB7 DEMO MODE \xB7 NO REAL DATA STORED")))));
}
function ListingsTable({ listings, projects, onCancel }) {
  const items = listings.filter((l) => l.status === "open");
  if (items.length === 0) return /* @__PURE__ */ React.createElement("div", { style: { padding: 48, textAlign: "center", color: "var(--c-ink-3)", border: "1px dashed var(--c-line)", borderRadius: "var(--r-3)" } }, "No active listings. List a holding to put it on the secondary market.");
  return /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr 1fr", padding: "10px 16px", background: "var(--c-panel-2)", borderBottom: "1px solid var(--c-line)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, /* @__PURE__ */ React.createElement("div", null, "PROJECT"), /* @__PURE__ */ React.createElement("div", null, "TIER"), /* @__PURE__ */ React.createElement("div", null, "QTY"), /* @__PURE__ */ React.createElement("div", null, "ASK"), /* @__PURE__ */ React.createElement("div", null, "LISTED"), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, "ACTION")), items.map((l, i) => {
    const proj = projects.find((p) => p.id === l.projectId);
    return /* @__PURE__ */ React.createElement("div", { key: l.id, style: { display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr 1fr", padding: "12px 16px", fontSize: "var(--fs-body)", alignItems: "center", borderBottom: i < items.length - 1 ? "1px solid var(--c-line)" : 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic" } }, proj?.film?.title || l.projectTitle), /* @__PURE__ */ React.createElement("div", { style: { color: "var(--c-ink-2)" } }, l.tier), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)" } }, "\xD7", l.qty), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", color: "var(--c-amber)" } }, "$", l.priceUSD.toLocaleString()), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" } }, psRelTime ? psRelTime(l.t) : "recently"), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => onCancel(l.id), style: { appearance: "none", border: "1px solid var(--c-line)", background: "transparent", color: "var(--c-ink-2)", padding: "5px 10px", borderRadius: "var(--r-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", cursor: "pointer" } }, "CANCEL")));
  }));
}
function BidsTable({ bids, projects, onCancel }) {
  const items = bids.filter((b) => b.status === "open");
  if (items.length === 0) return /* @__PURE__ */ React.createElement("div", { style: { padding: 48, textAlign: "center", color: "var(--c-ink-3)", border: "1px dashed var(--c-line)", borderRadius: "var(--r-3)" } }, "No active bids. Place one from any project page.");
  return /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr 1fr", padding: "10px 16px", background: "var(--c-panel-2)", borderBottom: "1px solid var(--c-line)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, /* @__PURE__ */ React.createElement("div", null, "PROJECT"), /* @__PURE__ */ React.createElement("div", null, "TIER"), /* @__PURE__ */ React.createElement("div", null, "QTY"), /* @__PURE__ */ React.createElement("div", null, "BID"), /* @__PURE__ */ React.createElement("div", null, "EXPIRES"), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, "ACTION")), items.map((b, i) => /* @__PURE__ */ React.createElement("div", { key: b.id, style: { display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr 1fr", padding: "12px 16px", fontSize: "var(--fs-body)", alignItems: "center", borderBottom: i < items.length - 1 ? "1px solid var(--c-line)" : 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontStyle: "italic" } }, b.projectTitle), /* @__PURE__ */ React.createElement("div", { style: { color: "var(--c-ink-2)" } }, b.tier), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)" } }, "\xD7", b.qty), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", color: "var(--c-amber)" } }, "$", b.priceUSD.toLocaleString()), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" } }, b.expiry), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => onCancel(b.id), style: { appearance: "none", border: "1px solid var(--c-line)", background: "transparent", color: "var(--c-ink-2)", padding: "5px 10px", borderRadius: "var(--r-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", cursor: "pointer" } }, "CANCEL")))));
}
function KPI({ label, value, sub, amber }) {
  return /* @__PURE__ */ React.createElement(CinaStat, { label, value, sub, tone: amber ? "accent" : void 0 });
}
function ActivityPage({ projects }) {
  const session = window.useProducerSession ? window.useProducerSession() : null;
  const [scope, setScope] = prUseState("market");
  const [kind, setKind] = prUseState("all");
  const marketEvents = prUseMemo(() => {
    const WALLETS = [
      "0xC1\u2026a2",
      "0x4f\u2026b8",
      "0x91\u20267d",
      "0xab\u20263c",
      "0xee\u202614",
      "0x8a\u2026fe",
      "loop.eth",
      "noir.eth",
      "agora.eth",
      "still.eth",
      "0x2d\u202691",
      "0x77\u20260e",
      "frame.eth",
      "0xBE\u2026ff",
      "reel.eth",
      "0x3c\u202644",
      "vault.eth",
      "0x09\u20261b"
    ];
    const KIND_BAG = ["mint", "mint", "mint", "mint", "sale", "sale", "sale", "bid", "bid", "list", "claim"];
    const out = [];
    let clock = Date.now() - 4e4;
    projects.forEach((p) => {
      const seed = (p.id || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const rnd = (n2) => {
        const x = Math.sin(seed * 12.9898 + n2 * 78.233) * 43758.5453;
        return x - Math.floor(x);
      };
      const n = 3 + Math.floor(rnd(1) * 4);
      for (let i = 0; i < n; i++) {
        const tier = p.tiers[Math.floor(rnd(i * 7 + 2) * p.tiers.length)] || p.tiers[0];
        const kind2 = KIND_BAG[Math.floor(rnd(i * 5 + 3) * KIND_BAG.length)];
        const gapMin = Math.round(1 + rnd(i * 11 + 4) * 220 * (1 + i * 0.6));
        clock -= gapMin * 6e4;
        const jitter = 0.9 + rnd(i * 3 + 9) * 0.35;
        out.push({
          t: clock,
          project: p,
          tier,
          actor: WALLETS[Math.floor(rnd(i * 13 + 6) * WALLETS.length)],
          kind: kind2,
          priceUSD: Math.round((tier.priceUSD || 100) * jitter)
        });
      }
    });
    return out.sort((a, b) => b.t - a.t).slice(0, 60);
  }, [projects]);
  const myEvents = prUseMemo(() => {
    if (!session) return [];
    const out = [];
    (session.s.holdings || []).forEach((h) => {
      const proj = projects.find((p) => p.id === h.projectId);
      if (!proj) return;
      const tier = proj.tiers.find((t) => t.id === h.tier) || proj.tiers[0];
      out.push({ t: Date.now() - 864e5 * 14 * (out.length + 1), project: proj, tier, kind: "mint", actor: "you", priceUSD: (h.costBasis || tier.priceUSD * 0.85) * h.qty });
    });
    (session.s.claims || []).filter((c) => c.status === "claimed").forEach((c) => {
      const proj = projects.find((p) => p.id === c.projectId);
      if (!proj) return;
      out.push({ t: c.claimedAt || c.availableAt, project: proj, tier: proj.tiers[0], kind: "claim", actor: "you", priceUSD: c.amount });
    });
    (session.s.listings || []).forEach((l) => {
      const proj = projects.find((p) => p.id === l.projectId);
      if (!proj) return;
      out.push({ t: l.t, project: proj, tier: proj.tiers.find((x) => x.id === l.tier) || proj.tiers[0], kind: "list", actor: "you", priceUSD: l.priceUSD });
    });
    (session.s.bids || []).forEach((b) => {
      const proj = projects.find((p) => p.id === b.projectId);
      if (!proj) return;
      out.push({ t: b.t, project: proj, tier: proj.tiers.find((x) => x.id === b.tier) || proj.tiers[0], kind: "bid", actor: "you", priceUSD: b.priceUSD });
    });
    return out.sort((a, b) => b.t - a.t);
  }, [session?.s, projects]);
  const launchEvents = prUseMemo(() => projects.filter((x) => x.userLaunched).map((x) => ({
    t: x.launchedAt || Date.now(),
    project: x,
    tier: x.tiers[0] || {},
    actor: "you",
    kind: "mint",
    priceUSD: 0,
    launch: true
  })), [projects]);
  const events = prUseMemo(() => {
    const list = scope === "mine" ? [...launchEvents, ...myEvents] : [...launchEvents, ...marketEvents];
    return kind === "all" ? list : list.filter((e) => e.kind === kind);
  }, [scope, kind, marketEvents, myEvents, launchEvents]);
  const KIND_LABELS = {
    mint: { label: "MINT", color: tkc("good") },
    sale: { label: "SALE", color: "var(--c-amber)" },
    claim: { label: "CLAIM", color: tkc("cat-2") },
    bid: { label: "BID", color: tkc("cat-1") },
    list: { label: "LIST", color: tkc("bad") },
    vote: { label: "VOTE", color: tkc("good") }
  };
  return /* @__PURE__ */ React.createElement("div", { style: { maxWidth: "var(--w-mid)", margin: "0 auto", padding: "28px 32px 96px" } }, /* @__PURE__ */ React.createElement("div", { style: { paddingBottom: 16, borderBottom: "1px solid var(--c-line)", marginBottom: 22 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 8 } }, "ACTIVITY"), /* @__PURE__ */ React.createElement("h1", { style: { fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", margin: 0, fontWeight: 400, letterSpacing: "-0.01em" } }, scope === "mine" ? "Your activity" : "Across the market")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, padding: 3, background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: 999 } }, [{ id: "market", label: "Market" }, { id: "mine", label: "My activity" }].map((s) => /* @__PURE__ */ React.createElement("button", { key: s.id, onClick: () => setScope(s.id), style: {
    appearance: "none",
    padding: "6px 14px",
    borderRadius: 999,
    background: scope === s.id ? "var(--c-amber)" : "transparent",
    color: scope === s.id ? tkc("on-amber") : "var(--c-ink-2)",
    border: 0,
    fontSize: "var(--fs-body)",
    fontWeight: scope === s.id ? 600 : 450,
    cursor: "pointer"
  } }, s.label))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, ["all", "mint", "sale", "claim", "bid", "list"].map((k) => /* @__PURE__ */ React.createElement("button", { key: k, onClick: () => setKind(k), style: {
    appearance: "none",
    padding: "5px 10px",
    borderRadius: 999,
    background: kind === k ? "var(--c-amber)" : "transparent",
    color: kind === k ? tkc("on-amber") : "var(--c-ink-3)",
    border: `1px solid ${kind === k ? "var(--c-amber)" : "var(--c-line)"}`,
    fontFamily: "var(--f-mono)",
    fontSize: "var(--fs-label)",
    letterSpacing: ".16em",
    cursor: "pointer",
    textTransform: "uppercase"
  } }, k)))), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "100px 1.6fr 1fr 1fr 1fr 1fr", padding: "10px 16px", background: "var(--c-panel-2)", borderBottom: "1px solid var(--c-line)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" } }, /* @__PURE__ */ React.createElement("div", null, "EVENT"), /* @__PURE__ */ React.createElement("div", null, "PROJECT"), /* @__PURE__ */ React.createElement("div", null, "TIER"), /* @__PURE__ */ React.createElement("div", null, "PRICE"), /* @__PURE__ */ React.createElement("div", null, "ACTOR"), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, "TIME")), events.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { padding: 48, textAlign: "center", color: "var(--c-ink-3)", fontSize: "var(--fs-body)" } }, "No ", kind === "all" ? "" : kind + " ", "events ", scope === "mine" ? "in your activity" : "in the market", " yet."), events.map((e, i) => {
    const k = KIND_LABELS[e.kind] || KIND_LABELS.mint;
    return /* @__PURE__ */ React.createElement("div", { key: i, style: {
      display: "grid",
      gridTemplateColumns: "100px 1.6fr 1fr 1fr 1fr 1fr",
      padding: "11px 16px",
      borderBottom: i < events.length - 1 ? "1px solid var(--c-line)" : 0,
      fontSize: "var(--fs-body)",
      alignItems: "center"
    } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: {
      fontFamily: "var(--f-mono)",
      fontSize: "var(--fs-label)",
      letterSpacing: ".16em",
      padding: "3px 7px",
      borderRadius: "var(--r-1)",
      background: `color-mix(in oklab, ${k.color} 18%, transparent)`,
      color: k.color
    } }, k.label)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 36, height: 24, borderRadius: "var(--r-1)", overflow: "hidden", background: e.project.color } }, /* @__PURE__ */ React.createElement(FrameThumb, { kind: e.project.thumb, usePhoto: true })), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-display)", fontStyle: "italic" } }, e.project.film?.title || e.project.title)), /* @__PURE__ */ React.createElement("div", { style: { color: e.tier.color, fontWeight: 500 } }, e.tier.name), /* @__PURE__ */ React.createElement("div", { className: "t-num", style: { fontFamily: "var(--f-mono)" } }, "$", (e.priceUSD || e.tier.priceUSD).toLocaleString()), /* @__PURE__ */ React.createElement("div", { className: "t-num", style: { fontFamily: "var(--f-mono)", color: e.actor === "you" ? "var(--c-amber)" : "var(--c-ink-2)" } }, e.actor), /* @__PURE__ */ React.createElement("div", { className: "t-num", style: { fontFamily: "var(--f-mono)", color: "var(--c-ink-3)", textAlign: "right" } }, relTime(e.t)));
  })));
}
function relTime(t) {
  const diff = Date.now() - t;
  const s = Math.floor(diff / 1e3);
  if (s < 60) return s < 10 ? "just now" : `${s}s ago`;
  const m = Math.floor(diff / 6e4);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
const PRODUCERS_TWEAKS = (
  /*EDITMODE-BEGIN*/
  {
    "defaultSort": "trending",
    "showSyntheticBadge": false
  }
);
function ProducersCmdK() {
  const [open, setOpen] = prUseState(false);
  const [q, setQ] = prUseState("");
  const [sel, setSel] = prUseState(0);
  const inputRef = React.useRef(null);
  prUseEffect(() => {
    window.openProducersCmdK = () => {
      setOpen(true);
      setQ("");
      setSel(0);
    };
    const onKey = (e) => {
      const t = e.target, inField = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQ("");
        setSel(0);
        return;
      }
      if (e.key === "Escape" && open) setOpen(false);
      if (e.key === "/" && !inField && !open) {
        e.preventDefault();
        setOpen(true);
        setQ("");
        setSel(0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  prUseEffect(() => {
    if (open) setTimeout(() => inputRef.current && inputRef.current.focus(), 30);
  }, [open]);
  const goHash = (h) => () => {
    location.hash = h;
    setOpen(false);
  };
  const goHref = (href) => () => {
    window.location.href = href;
    setOpen(false);
  };
  const cmds = prUseMemo(() => {
    const out = [];
    [
      { label: "Market", hint: "All open projects", icon: "trend", to: "market" },
      { label: "Catalog Index", hint: "Every project", icon: "grid", to: "index" },
      { label: "Watchlist", hint: "Projects you track", icon: "heart", to: "watchlist" },
      { label: "My stakes", hint: "Portfolio & P/L", icon: "wallet", to: "portfolio" },
      { label: "Activity", hint: "Live market tape", icon: "clock", to: "activity" },
      { label: "Documents & tax", hint: "KYC \xB7 1099 \xB7 statements", icon: "shield", to: "documents" }
    ].forEach((v) => out.push({ id: "go:" + v.to, kind: "Go to", label: v.label, hint: v.hint, icon: v.icon, run: goHash(v.to) }));
    [
      { label: "Cina Watch", hint: "Public site", href: "index.html" },
      { label: "Cina Studio", hint: "Creator side", href: "Cina.html" }
    ].forEach((v) => out.push({ id: "surf:" + v.href, kind: "Switch to", label: v.label, hint: v.hint, icon: "apps", run: goHref(v.href) }));
    try {
      buildProjectIndex().forEach((p) => out.push({
        id: "proj:" + p.id,
        kind: "Project",
        label: p.film?.title || p.title,
        hint: (p.kind || "film") + (p.tiers ? " \xB7 " + p.tiers.length + " tiers" : ""),
        icon: "folder",
        run: goHash("project/" + p.id)
      }));
    } catch (e) {
    }
    if (window.cinaCrossCommands) out.push(...window.cinaCrossCommands("producers"));
    return out;
  }, [open]);
  const results = prUseMemo(() => {
    if (!q.trim()) return cmds.filter((c) => c.kind === "Go to" || c.kind === "Switch to");
    const n = q.toLowerCase();
    return cmds.map((c) => {
      const hay = (c.label + " " + (c.hint || "")).toLowerCase();
      let s = 0;
      if (c.label.toLowerCase().startsWith(n)) s = 100;
      else if (hay.includes(n)) s = 50;
      else {
        let i = 0;
        for (const ch of n) {
          const idx = hay.indexOf(ch, i);
          if (idx === -1) return null;
          i = idx + 1;
        }
        s = 10;
      }
      return { ...c, _s: s };
    }).filter(Boolean).sort((a, b) => b._s - a._s).slice(0, 16);
  }, [q, cmds]);
  prUseEffect(() => {
    setSel(0);
  }, [q]);
  if (!open) return null;
  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(results.length - 1, s + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(0, s - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[sel];
      if (r) r.run();
    }
  };
  const groups = [];
  let lk = null;
  results.forEach((r, i) => {
    if (r.kind !== lk) {
      groups.push({ kind: r.kind, items: [] });
      lk = r.kind;
    }
    groups[groups.length - 1].items.push({ ...r, _i: i });
  });
  return /* @__PURE__ */ React.createElement("div", { onClick: () => setOpen(false), style: { position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh" } }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: { width: "min(620px,92vw)", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", boxShadow: "0 40px 120px rgba(0,0,0,.6)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--c-line)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 14 }), /* @__PURE__ */ React.createElement("input", { ref: inputRef, value: q, onChange: (e) => setQ(e.target.value), onKeyDown, placeholder: "Jump to a project, view, or surface\u2026", style: { flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--c-ink)", fontSize: "var(--fs-lead)" } }), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", border: "1px solid var(--c-line-2)", padding: "2px 6px", borderRadius: "var(--r-1)" } }, "ESC")), /* @__PURE__ */ React.createElement("div", { style: { maxHeight: 420, overflowY: "auto", padding: "6px 0" } }, results.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { padding: "30px", textAlign: "center", color: "var(--c-ink-4)", fontSize: "var(--fs-body)" } }, 'No matches for "', q, '"'), groups.map((g, gi) => /* @__PURE__ */ React.createElement("div", { key: gi }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { padding: "6px 16px 4px", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" } }, g.kind.toUpperCase()), g.items.map((r) => {
    const active = r._i === sel;
    return /* @__PURE__ */ React.createElement("button", { key: r.id, onClick: r.run, onMouseEnter: () => setSel(r._i), style: { display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "9px 16px", background: active ? "rgba(255,255,255,.04)" : "transparent", border: "none", borderLeft: active ? "2px solid var(--c-amber)" : "2px solid transparent", textAlign: "left", cursor: "pointer", color: "var(--c-ink)" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 22, height: 22, borderRadius: "var(--r-2)", background: "var(--c-bg)", border: "1px solid var(--c-line-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: active ? "var(--c-amber)" : "var(--c-ink-3)" } }, /* @__PURE__ */ React.createElement(Icon, { name: r.icon || "dot", size: 11 })), /* @__PURE__ */ React.createElement("span", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "block", fontSize: "var(--fs-body)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, r.label), r.hint && /* @__PURE__ */ React.createElement("span", { style: { display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, r.hint)));
  }))))));
}
function _parseProducersHash() {
  const h = (location.hash || "").replace(/^#\/?/, "");
  if (!h) return { route: "market", projectId: null };
  const [r, sub] = h.split("/");
  if (r === "project" && sub) return { route: "market", projectId: sub };
  if (r === "auction" && sub) return { route: "auction/" + sub, projectId: null };
  if (["market", "watchlist", "portfolio", "activity", "index", "documents", "auctions"].includes(r)) {
    return { route: r, projectId: null };
  }
  return { route: "market", projectId: null };
}
function ProducersApp() {
  const [t, setTweak] = useTweaks(PRODUCERS_TWEAKS);
  const session = window.useProducerSession ? window.useProducerSession() : null;
  const cina = useCinaId();
  const [appAppearance] = window.useCinaAppearance ? window.useCinaAppearance() : [null];
  const _initP = _parseProducersHash();
  const [route, setRoute] = prUseState(_initP.route);
  const [openProjectId, setOpenProjectId] = prUseState(_initP.projectId);
  const [query, setQuery] = prUseState("");
  prUseEffect(() => {
    if (window.CinaAppearance) window.CinaAppearance.applyToDOM();
  }, [appAppearance && appAppearance.mood]);
  prUseEffect(() => {
    const apply = () => {
      const h = (location.hash || "").replace(/^#/, "");
      if (!h) {
        setRoute("market");
        setOpenProjectId(null);
        return;
      }
      const [r, sub] = h.split("/");
      if (r === "project" && sub) {
        setOpenProjectId(sub);
      } else if (r === "auction" && sub) {
        setRoute("auction/" + sub);
        setOpenProjectId(null);
      } else if (["market", "watchlist", "portfolio", "activity", "index", "documents", "auctions"].includes(r)) {
        setRoute(r);
        setOpenProjectId(null);
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);
  const goRoute = (r) => {
    location.hash = r;
    setRoute(r);
    setOpenProjectId(null);
  };
  prUseEffect(() => {
    if (window.navigate) return;
    window.navigate = (to) => {
      const m = String(to || "");
      if (m === "/auctions") {
        location.hash = "auctions";
        return;
      }
      const a = m.match(/^\/auction\/(.+)$/);
      if (a) {
        location.hash = "auction/" + a[1];
        return;
      }
      window.location.href = "index.html#" + m;
    };
  }, []);
  const openProject = (id) => {
    location.hash = `project/${id}`;
    setOpenProjectId(id);
  };
  const closeProject = () => {
    location.hash = "market";
    setOpenProjectId(null);
    setRoute("market");
  };
  const [launchNonce, setLaunchNonce] = prUseState(0);
  prUseEffect(() => {
    const h = () => setLaunchNonce((n) => n + 1);
    window.addEventListener("cina-project-launched", h);
    return () => window.removeEventListener("cina-project-launched", h);
  }, []);
  const projects = prUseMemo(() => buildProjectIndex(), [launchNonce]);
  const opened = openProjectId ? projects.find((p) => p.id === openProjectId) : null;
  if (!cina.signedIn) {
    return /* @__PURE__ */ React.createElement(CinaSignedOut, { surface: "producers", accent: "var(--c-amber)" });
  }
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(ProducersTopNav, { route, onRoute: goRoute, query, onQuery: setQuery }), /* @__PURE__ */ React.createElement("main", { id: "main-content", tabIndex: -1, style: { outline: "none" } }, opened ? /* @__PURE__ */ React.createElement(ProducerDetail, { project: opened, onBack: closeProject }) : route === "market" ? /* @__PURE__ */ React.createElement(ProducerMarket, { projects, query, onOpen: openProject }) : route === "watchlist" ? /* @__PURE__ */ React.createElement(WatchlistPage, { projects, onOpen: openProject }) : route === "portfolio" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(PortfolioPage, { projects, onOpen: openProject }), window.ChainedSplitRouterPanel && /* @__PURE__ */ React.createElement("div", { style: { width: "91%", margin: "0 auto 6vh" } }, /* @__PURE__ */ React.createElement(window.ChainedSplitRouterPanel, null))) : route === "activity" ? /* @__PURE__ */ React.createElement(ActivityPage, { projects }) : route === "auctions" ? window.AuctionMarketPage ? /* @__PURE__ */ React.createElement(AuctionMarketPage, null) : null : route.startsWith("auction/") ? window.AuctionDetailPage ? /* @__PURE__ */ React.createElement(AuctionDetailPage, { auctionId: route.slice(8) }) : null : route === "index" ? /* @__PURE__ */ React.createElement(CatalogIndexPage, { projects, onOpen: openProject }) : route === "documents" ? /* @__PURE__ */ React.createElement(ProducerDocsPage, { projects }) : null), window.ProducerFlowsHost && /* @__PURE__ */ React.createElement(ProducerFlowsHost, null), /* @__PURE__ */ React.createElement(ProducersCmdK, null));
}
queueMicrotask(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(ProducersApp, null));
});

  try { if (typeof prUseState !== "undefined") window["prUseState"] = prUseState; } catch (_) {}
  try { if (typeof prUseEffect !== "undefined") window["prUseEffect"] = prUseEffect; } catch (_) {}
  try { if (typeof prUseMemo !== "undefined") window["prUseMemo"] = prUseMemo; } catch (_) {}
  try { if (typeof buildProjectIndex !== "undefined") window["buildProjectIndex"] = buildProjectIndex; } catch (_) {}
  try { if (typeof SORTS !== "undefined") window["SORTS"] = SORTS; } catch (_) {}
  try { if (typeof sortProjects !== "undefined") window["sortProjects"] = sortProjects; } catch (_) {}
  try { if (typeof fmtNavUSD !== "undefined") window["fmtNavUSD"] = fmtNavUSD; } catch (_) {}
  try { if (typeof ProducersTopNav !== "undefined") window["ProducersTopNav"] = ProducersTopNav; } catch (_) {}
  try { if (typeof ProducerSearch !== "undefined") window["ProducerSearch"] = ProducerSearch; } catch (_) {}
  try { if (typeof _marketBooted !== "undefined") window["_marketBooted"] = _marketBooted; } catch (_) {}
  try { if (typeof MarketSkeleton !== "undefined") window["MarketSkeleton"] = MarketSkeleton; } catch (_) {}
  try { if (typeof ProducerMarket !== "undefined") window["ProducerMarket"] = ProducerMarket; } catch (_) {}
  try { if (typeof FeaturedHero !== "undefined") window["FeaturedHero"] = FeaturedHero; } catch (_) {}
  try { if (typeof Stat !== "undefined") window["Stat"] = Stat; } catch (_) {}
  try { if (typeof MarketCard !== "undefined") window["MarketCard"] = MarketCard; } catch (_) {}
  try { if (typeof fmtUSDK !== "undefined") window["fmtUSDK"] = fmtUSDK; } catch (_) {}
  try { if (typeof ProducerDetail !== "undefined") window["ProducerDetail"] = ProducerDetail; } catch (_) {}
  try { if (typeof BranchedRightsTable !== "undefined") window["BranchedRightsTable"] = BranchedRightsTable; } catch (_) {}
  try { if (typeof WatchlistPage !== "undefined") window["WatchlistPage"] = WatchlistPage; } catch (_) {}
  try { if (typeof PortfolioPage !== "undefined") window["PortfolioPage"] = PortfolioPage; } catch (_) {}
  try { if (typeof PRO_KYC_KEY !== "undefined") window["PRO_KYC_KEY"] = PRO_KYC_KEY; } catch (_) {}
  try { if (typeof prKycLoad !== "undefined") window["prKycLoad"] = prKycLoad; } catch (_) {}
  try { if (typeof prKycSave !== "undefined") window["prKycSave"] = prKycSave; } catch (_) {}
  try { if (typeof downloadFile !== "undefined") window["downloadFile"] = downloadFile; } catch (_) {}
  try { if (typeof ProducerDocsPage !== "undefined") window["ProducerDocsPage"] = ProducerDocsPage; } catch (_) {}
  try { if (typeof ListingsTable !== "undefined") window["ListingsTable"] = ListingsTable; } catch (_) {}
  try { if (typeof BidsTable !== "undefined") window["BidsTable"] = BidsTable; } catch (_) {}
  try { if (typeof KPI !== "undefined") window["KPI"] = KPI; } catch (_) {}
  try { if (typeof ActivityPage !== "undefined") window["ActivityPage"] = ActivityPage; } catch (_) {}
  try { if (typeof relTime !== "undefined") window["relTime"] = relTime; } catch (_) {}
  try { if (typeof PRODUCERS_TWEAKS !== "undefined") window["PRODUCERS_TWEAKS"] = PRODUCERS_TWEAKS; } catch (_) {}
  try { if (typeof ProducersCmdK !== "undefined") window["ProducersCmdK"] = ProducersCmdK; } catch (_) {}
  try { if (typeof _parseProducersHash !== "undefined") window["_parseProducersHash"] = _parseProducersHash; } catch (_) {}
  try { if (typeof ProducersApp !== "undefined") window["ProducersApp"] = ProducersApp; } catch (_) {}
})();

// ── MODULE: cina-orb.jsx ──
;(function() {
(function() {
  const LS_ON = "cina:voice:on:v1";
  const LS_NAME = "cina:user:name:v1";
  const Bus = /* @__PURE__ */ (() => {
    const subs = /* @__PURE__ */ new Set();
    let state = "idle";
    let level = 0;
    const emit = () => subs.forEach((fn) => {
      try {
        fn(state, level);
      } catch (_) {
      }
    });
    return {
      get state() {
        return state;
      },
      get level() {
        return level;
      },
      setState(s) {
        if (s !== state) {
          state = s;
          emit();
        }
      },
      setLevel(l) {
        level = l;
      },
      on(fn) {
        subs.add(fn);
        return () => subs.delete(fn);
      },
      emit
    };
  })();
  let activeAudio = null;
  let activeAbort = null;
  function stopNeuralSpeech() {
    if (activeAbort) {
      try {
        activeAbort.abort();
      } catch (_) {
      }
      activeAbort = null;
    }
    if (activeAudio) {
      try {
        activeAudio.pause();
        activeAudio.src = "";
      } catch (_) {
      }
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
        signal: controller.signal
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
  const setView = (v) => window.dispatchEvent(new CustomEvent("cina:setView", { detail: v }));
  const setRoute = (r) => window.dispatchEvent(new CustomEvent("cina:setRoute", { detail: r }));
  const goPage = (href) => {
    try {
      window.location.href = href;
    } catch (_) {
    }
  };
  const SURFACE_MAP = [
    { href: "index.html", keys: ["watch", "cina watch", "films", "streaming", "the app", "home page", "watch home"] },
    { href: "Cina.html", keys: ["studio", "the studio", "make a film", "production", "slate", "my films", "creator"] },
    { href: "Producers.html", keys: ["producers", "producer market", "invest", "auction floor", "my stakes", "wallet", "collect", "nft"] },
    { href: "index.html#/about", keys: ["about", "about cina", "company", "our story"] }
  ];
  const VIEW_MAP = [
    { v: "chat", keys: ["director", "chat", "the room", "talk to cina"] },
    { v: "pipeline", keys: ["pipeline", "production line", "overview"] },
    { v: "bible", keys: ["bible", "dna", "tone", "rules", "story bible"] },
    { v: "script", keys: ["script", "screenplay", "writing", "the writer"] },
    { v: "episodes", keys: ["episodes", "season", "the season"] },
    { v: "vault", keys: ["vault", "cast", "casting", "performers", "wardrobe"] },
    { v: "board", keys: ["board", "storyboard", "shots", "shot list"] },
    { v: "generate", keys: ["generate", "render", "render floor", "queue", "takes"] },
    { v: "branch", keys: ["branch", "fork", "branches", "fork tree"] },
    { v: "editor", keys: ["editor", "edit", "assembly", "the cut", "timeline"] },
    { v: "cuts", keys: ["cuts", "compare cuts", "versions"] },
    { v: "score", keys: ["score", "music", "sound", "composer"] },
    { v: "titles", keys: ["titles", "credits", "title design"] },
    { v: "deliver", keys: ["deliver", "delivery", "masters", "export", "package"] },
    { v: "mint", keys: ["mint", "minting", "release", "editions", "ownership"] },
    { v: "watch", keys: ["watch page", "preview it", "how it looks"] },
    { v: "memory", keys: ["memory", "what you learned", "my taste"] },
    { v: "autopilot", keys: ["autopilot", "auto pilot", "run it yourself"] }
  ];
  const ROUTE_MAP = [
    { r: "dashboard", keys: ["slate", "dashboard", "project picker", "back to slate"] },
    { r: "promo", keys: ["promotion", "promo", "advertisers", "inbox"] },
    { r: "analytics", keys: ["analytics", "numbers", "performance", "stats"] },
    { r: "site", keys: ["site", "my site", "public site", "watch page site"] }
  ];
  let voiceEnabled = localStorage.getItem(LS_ON) !== "0";
  window.__cinaSetOn = (v) => {
    voiceEnabled = !!v;
    try {
      localStorage.setItem(LS_ON, voiceEnabled ? "1" : "0");
    } catch (_) {
    }
    if (!voiceEnabled) stopNeuralSpeech();
  };
  const CinaCommand = {
    run(raw) {
      const text = (raw || "").trim();
      if (!text) return null;
      const q = text.toLowerCase().replace(/[.,!?]/g, "");
      if (/\b(stop|quiet|shush|be quiet|stop talking|cancel)\b/.test(q)) {
        stopNeuralSpeech();
        return null;
      }
      if (/\b(mute|silence)\b/.test(q)) {
        window.__cinaSetOn(false);
        return "Voice muted.";
      }
      if (/\b(unmute|speak again|talk to me)\b/.test(q)) {
        window.__cinaSetOn(true);
        return "Voice enabled.";
      }
      if (/\b(close|hide|dismiss)\b.*\b(voice|orb|chat|concierge)\b/.test(q)) {
        window.closeCinaConcierge && window.closeCinaConcierge();
        return null;
      }
      if (/\b(new film|new movie|new project|start a film|create a film)\b/.test(q)) {
        setRoute("new");
        return "Starting a new film.";
      }
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
        if (s.keys.some((k) => nav0 === k)) {
          goPage(s.href);
          return "Opening " + s.keys[0] + ".";
        }
      }
      for (const r of ROUTE_MAP) {
        if (r.keys.some((k) => nav0 === k)) {
          setRoute(r.r);
          return "Opening " + r.keys[0] + ".";
        }
      }
      for (const m of VIEW_MAP) {
        if (m.keys.some((k) => nav0 === k)) {
          setRoute("studio");
          setTimeout(() => setView(m.v), 30);
          return "Opening " + m.keys[0] + ".";
        }
      }
      return null;
    }
  };
  window.CinaCommand = CinaCommand;
  window.CINA_USER = localStorage.getItem(LS_NAME) || "";
  try {
    delete document.body.dataset.orb;
  } catch (_) {
  }
  window.CinaVoice = {
    get enabled() {
      return voiceEnabled;
    },
    get state() {
      return Bus.state;
    },
    get userName() {
      return localStorage.getItem(LS_NAME) || "";
    },
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
    voiceId: "Kore"
  };
  window.CinaOrb = { mount: () => {
  } };
})();


})();

// ── MODULE: cina-onboard.jsx ──
;(function() {
const { useState: useOb, useEffect: useObEff } = React;
function _obKey(surface) {
  return "cina:onboarded:" + surface;
}
function _obStepKey(surface) {
  return "cina:onboard-step:" + surface;
}
function _obDone(surface) {
  try {
    return localStorage.getItem(_obKey(surface)) === "1";
  } catch {
    return false;
  }
}
function _obMarkDone(surface) {
  try {
    localStorage.setItem(_obKey(surface), "1");
    localStorage.removeItem(_obStepKey(surface));
  } catch {
  }
}
function _obLoadStep(surface) {
  try {
    return parseInt(localStorage.getItem(_obStepKey(surface)) || "0", 10) || 0;
  } catch {
    return 0;
  }
}
function _obSaveStep(surface, s) {
  try {
    localStorage.setItem(_obStepKey(surface), String(s));
  } catch {
  }
}
const OB_SURFACES = {
  studio: { label: "Studio", accent: tkc("amber"), domain: "Cina Studio", enter: "Enter Studio \u2192" },
  producers: { label: "Producers", accent: tkc("bad"), domain: "Cina Producers", enter: "Browse the market \u2192" }
};
function ObPrimary({ accent, active = true, children, onClick }) {
  return /* @__PURE__ */ React.createElement("button", { onClick: active ? onClick : void 0, style: {
    padding: "12px 24px",
    background: active ? accent : "var(--c-line-2)",
    border: "none",
    color: active ? tkc("on-amber") : "var(--c-ink-4)",
    borderRadius: "var(--r-2)",
    fontSize: "var(--fs-body)",
    fontWeight: 600,
    cursor: active ? "pointer" : "not-allowed",
    fontFamily: "var(--f-sans)",
    letterSpacing: ".02em"
  } }, children);
}
const obGhost = {
  padding: "12px 16px",
  background: "transparent",
  border: "none",
  color: "var(--c-ink-3)",
  fontSize: "var(--fs-body)",
  cursor: "pointer",
  fontFamily: "var(--f-sans)"
};
function ObHeader({ kicker, title, sub, accent }) {
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 9 } }, kicker), /* @__PURE__ */ React.createElement("h2", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 500, margin: 0, letterSpacing: "-0.01em", lineHeight: 1.04 } }, title), sub && /* @__PURE__ */ React.createElement("p", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", margin: "11px 0 0", lineHeight: 1.55, maxWidth: 480 } }, sub));
}
function ObBullet({ accent, icon, head, body }) {
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 14, alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 34,
    height: 34,
    borderRadius: "var(--r-2)",
    flexShrink: 0,
    marginTop: 1,
    background: accent + "1e",
    border: `1px solid ${accent}55`,
    color: accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: icon, size: 16 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, color: "var(--c-ink)", letterSpacing: "-0.01em" } }, head), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5, marginTop: 3 } }, body)));
}
function buildStudioScreens(accent, st, set) {
  const formats = window.CINA_FORMATS && Object.values(window.CINA_FORMATS) || [
    { key: "movie", label: "Film", tagline: "A single-cut feature or short.", flow: ["Script", "Board", "Generate", "Editor", "Final cut"] },
    { key: "series", label: "Series", tagline: "Multi-episode arc on one bible.", flow: ["Bible", "Writers' room", "Episodes", "Cuts", "Release"] },
    { key: "branched", label: "Branch", tagline: "Choose-your-own-adventure cinema.", flow: ["Spine", "Forks", "Board", "Generate", "Branch cuts"] }
  ];
  const agents = window.AGENTS || [];
  const fmt = formats.find((f) => f.key === st.format);
  return [
    {
      kicker: "WELCOME TO STUDIO",
      title: "Make a film with a crew of agents.",
      sub: "Studio is your production floor \u2014 a director, writer, visual, editor and audio agent working one project with you. Three quick steps and you're in.",
      body: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement(ObBullet, { accent, icon: "film", head: "Pick what you're making", body: "Film, series, or branching cut \u2014 each opens a pipeline tuned for it." }), /* @__PURE__ */ React.createElement(ObBullet, { accent, icon: "wand", head: "Direct in plain language", body: "Tell the crew what you want. They draft script, boards, renders, score." }), /* @__PURE__ */ React.createElement(ObBullet, { accent, icon: "globe", head: "Ship straight to Watch", body: "One Publish step masters your film and premieres it to the world." }))
    },
    {
      kicker: "STEP 01 \xB7 FORMAT",
      title: "What are you making?",
      sub: "This sets your whole pipeline. You can start another anytime.",
      body: /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 } }, formats.map((f) => {
        const on = st.format === f.key;
        return /* @__PURE__ */ React.createElement("button", { key: f.key, onClick: () => set((s) => ({ ...s, format: f.key })), style: {
          padding: "16px 14px",
          textAlign: "left",
          cursor: "pointer",
          borderRadius: "var(--r-2)",
          background: on ? accent + "14" : "var(--c-bg)",
          border: `1px solid ${on ? accent : "var(--c-line-2)"}`,
          color: "inherit",
          display: "flex",
          flexDirection: "column",
          gap: 8
        } }, /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: on ? accent : "var(--c-ink-4)" } }, f.tag || f.label.toUpperCase()), /* @__PURE__ */ React.createElement("span", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, color: "var(--c-ink)" } }, f.label), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.4 } }, f.tagline));
      })),
      canNext: !!st.format
    },
    {
      kicker: "STEP 02 \xB7 TITLE",
      title: "Give it a working title.",
      sub: "Doesn't have to be final \u2014 your crew will pitch alternates in the Titles room.",
      body: /* @__PURE__ */ React.createElement("label", { style: { display: "flex", flexDirection: "column", gap: 7 } }, /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" } }, "WORKING TITLE"), /* @__PURE__ */ React.createElement(
        "input",
        {
          autoFocus: true,
          value: st.title,
          onChange: (e) => set((s) => ({ ...s, title: e.target.value })),
          placeholder: "e.g. The Long Hall",
          style: {
            background: "var(--c-bg)",
            border: "1px solid var(--c-line-2)",
            borderRadius: "var(--r-2)",
            padding: "13px 15px",
            color: "var(--c-ink)",
            fontSize: "var(--fs-lead)",
            fontFamily: "var(--f-display)",
            fontStyle: "italic"
          }
        }
      ), fmt && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginRight: 4 } }, (fmt.label || "").toUpperCase(), " PIPELINE"), fmt.flow.map((s, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: s }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-label)", color: "var(--c-ink-2)", fontFamily: "var(--f-mono)" } }, s), i < fmt.flow.length - 1 && /* @__PURE__ */ React.createElement("span", { style: { color: accent, fontSize: "var(--fs-label)" } }, "\u203A")))))
    },
    {
      kicker: "STEP 03 \xB7 YOUR CREW",
      title: "Meet your crew.",
      sub: "Five agents, always on. Hand off as much or as little as you like \u2014 you're still the director.",
      body: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 7 } }, (agents.length ? agents : [
        { id: "director", name: "Director", glyph: "D", role: "Vision \xB7 shot design \xB7 routing", color: accent },
        { id: "writer", name: "Writer", glyph: "W", role: "Script \xB7 dialogue \xB7 structure", color: accent },
        { id: "visual", name: "Visual", glyph: "V", role: "Storyboard \xB7 character \xB7 set", color: accent },
        { id: "editor", name: "Editor", glyph: "E", role: "QC \xB7 flaw detection \xB7 polish", color: accent },
        { id: "audio", name: "Audio", glyph: "A", role: "Voice \xB7 score \xB7 SFX", color: accent }
      ]).map((a) => /* @__PURE__ */ React.createElement("div", { key: a.id, style: { display: "flex", alignItems: "center", gap: 13, padding: "10px 12px", background: "var(--c-bg)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: (a.color || accent) + "22", border: `1px solid ${a.color || accent}`, color: a.color || accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 600, fontSize: "var(--fs-body)" } }, a.glyph), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 500 } }, a.name), /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 1 } }, a.role)))))
    },
    {
      kicker: "ALL SET",
      title: st.title ? `\u201C${st.title}\u201D is ready to roll.` : "Your studio is ready.",
      sub: "We've set up your floor. Open the Director chat to start, or explore the panels along the top.",
      isFinish: true,
      body: /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 12 } }, "YOUR PROJECT"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: "var(--fs-body)" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", { style: { color: "var(--c-ink)" } }, "Title:"), " ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-2)" } }, st.title || "Untitled")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", { style: { color: "var(--c-ink)" } }, "Format:"), " ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-2)" } }, fmt ? fmt.label : "Film")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", { style: { color: "var(--c-ink)" } }, "Crew:"), " ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--c-ink-2)" } }, agents.length || 5, " agents on call")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", { style: { color: "var(--c-ink)" } }, "Next:"), " ", /* @__PURE__ */ React.createElement("span", { style: { color: accent } }, "Direct your first scene"))))
    }
  ];
}
function buildProducersScreens(accent, st, set) {
  const wallets = [{ id: "mm", label: "MetaMask", glyph: "\u{1F98A}" }, { id: "wc", label: "WalletConnect", glyph: "\u25C7" }, { id: "cb", label: "Coinbase Wallet", glyph: "\u25C9" }];
  const tiers = [
    { name: "Collector", price: "from $90", line: "An animated frame, the premiere window, a live signal during the film." },
    { name: "Patron", price: "from $380", line: "Everything in Collector, plus revenue share through Year 5 and the BTS vault." },
    { name: "Producer", price: "from $2.5k", line: "A real production credit, the largest revenue share, and a set visit." }
  ];
  return [
    {
      kicker: "WELCOME TO PRODUCERS",
      title: "Co-finance the films you believe in.",
      sub: "Producers is a market for backing films before they exist \u2014 and earning alongside them when they land. Here's how it works.",
      body: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement(ObBullet, { accent, icon: "ticket", head: "Buy a producer pass", body: "Each open film is a pool. A pass is your on-chain stake in that film." }), /* @__PURE__ */ React.createElement(ObBullet, { accent, icon: "spark", head: "Earn when it performs", body: "Holders share ad revenue and exhibition windows \u2014 through Year 5." }), /* @__PURE__ */ React.createElement(ObBullet, { accent, icon: "lock", head: "Premiere + BTS access", body: "Watch before everyone, and get into the behind-the-scenes vault." }))
    },
    {
      kicker: "STEP 01 \xB7 THE PASS",
      title: "What a producer pass actually is.",
      sub: "Not a donation \u2014 a tradable stake. You can hold it, earn from it, or sell it on.",
      body: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 } }, [["Own", "a share of one film"], ["Earn", "revenue share to Y5"], ["Trade", "anytime, on Base"]].map(([k, v]) => /* @__PURE__ */ React.createElement("div", { key: k, style: { padding: "16px 14px", background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)" } }, /* @__PURE__ */ React.createElement("div", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-title)", color: accent, fontWeight: 500 } }, k), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 5, lineHeight: 1.4 } }, v)))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-4)", lineHeight: 1.5, padding: "2px 2px" } }, "Every pass is settled on-chain. Revenue distributions land in your wallet automatically \u2014 no claim forms, no waiting on a studio's accounting."))
    },
    {
      kicker: "STEP 02 \xB7 TIERS",
      title: "Three ways in.",
      sub: "Same film, different levels of stake and perk. Pick by how deep you want to go.",
      body: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, tiers.map((t, i) => /* @__PURE__ */ React.createElement("div", { key: t.name, style: { display: "flex", alignItems: "center", gap: 14, padding: "13px 15px", background: "var(--c-bg)", border: "1px solid var(--c-line)", borderLeft: `2px solid ${accent}`, borderRadius: "var(--r-2)" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { className: "t-display", style: { fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, color: "var(--c-ink)" } }, t.name), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: accent, letterSpacing: ".08em" } }, t.price)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 3, lineHeight: 1.45 } }, t.line)))))
    },
    {
      kicker: "STEP 03 \xB7 WALLET",
      title: "Connect a wallet to back a film.",
      sub: "It's how your stake and your payouts live with you. You can also spend from your Cina balance.",
      body: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, wallets.map((w) => {
        const on = st.wallet === w.id;
        return /* @__PURE__ */ React.createElement("button", { key: w.id, onClick: () => set((s) => ({ ...s, wallet: w.id })), style: {
          display: "flex",
          alignItems: "center",
          gap: 13,
          padding: "12px 14px",
          textAlign: "left",
          cursor: "pointer",
          background: on ? accent + "14" : "var(--c-bg)",
          border: `1px solid ${on ? accent : "var(--c-line-2)"}`,
          borderRadius: "var(--r-2)",
          color: "inherit"
        } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-lead)" } }, w.glyph), /* @__PURE__ */ React.createElement("span", { style: { flex: 1, fontSize: "var(--fs-body)", color: "var(--c-ink)" } }, w.label), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: on ? accent : "var(--c-ink-4)", letterSpacing: ".16em" } }, on ? "SELECTED" : "CONNECT"));
      }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-4)", textAlign: "center", marginTop: 4 } }, "You can connect later \u2014 browsing the market needs no wallet."))
    },
    {
      kicker: "ALL SET",
      title: "You're ready to back films.",
      sub: "Open the market to see every film currently raising, sorted by what's closing soon.",
      isFinish: true,
      body: /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 18, display: "flex", flexDirection: "column", gap: 8 } }, [["Browse", "open pools by film, director, days-left"], ["Back", "any tier with a wallet or Cina balance"], ["Earn", "automatic on-chain distributions"]].map(([k, v]) => /* @__PURE__ */ React.createElement("div", { key: k, style: { display: "flex", gap: 12, alignItems: "baseline" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 56, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent } }, k.toUpperCase()), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "var(--fs-body)", color: "var(--c-ink-2)" } }, v))))
    }
  ];
}
function CinaSurfaceOnboard({ surface }) {
  const cfg = OB_SURFACES[surface] || OB_SURFACES.studio;
  const accent = cfg.accent;
  const cina = window.useCinaId ? window.useCinaId() : null;
  const [open, setOpen] = useOb(() => !_obDone(surface));
  const [step, setStep] = useOb(() => Math.max(0, _obLoadStep(surface)));
  const [st, setSt] = useOb({ format: "", title: "", wallet: "" });
  const screens = surface === "producers" ? buildProducersScreens(accent, st, setSt) : buildStudioScreens(accent, st, setSt);
  const clampedStep = Math.min(step, screens.length - 1);
  useObEff(() => {
    if (open) _obSaveStep(surface, clampedStep);
  }, [clampedStep, open, surface]);
  if (!open) return null;
  if (cina && cina.signedIn === false) return null;
  const sc = screens[clampedStep];
  const isLast = !!sc.isFinish || clampedStep === screens.length - 1;
  const canNext = sc.canNext === void 0 ? true : sc.canNext;
  const finish = () => {
    _obMarkDone(surface);
    setOpen(false);
  };
  const next = () => {
    if (isLast) finish();
    else setStep(clampedStep + 1);
  };
  const back = () => setStep(Math.max(0, clampedStep - 1));
  return /* @__PURE__ */ React.createElement("div", { style: {
    position: "fixed",
    inset: 0,
    zIndex: 9500,
    background: "rgba(0,0,0,0.88)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    overflow: "auto"
  } }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
    width: 600,
    maxWidth: "100%",
    background: "var(--c-panel)",
    border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-2)",
    padding: 34,
    display: "flex",
    flexDirection: "column",
    gap: 24,
    maxHeight: "92vh",
    overflowY: "auto",
    boxShadow: "0 40px 120px rgba(0,0,0,.6)",
    animation: "obIn .26s cubic-bezier(.2,.8,.2,1)"
  } }, /* @__PURE__ */ React.createElement("style", null, `@keyframes obIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, display: "flex", alignItems: "center", gap: 7 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 7, height: 7, borderRadius: "50%", background: accent } }), cfg.domain.toUpperCase()), /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement("span", { className: "t-mono", style: { fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" } }, clampedStep + 1, " / ", screens.length)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, marginTop: -10 } }, screens.map((_, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { flex: 1, height: 2, borderRadius: "var(--r-1)", background: i <= clampedStep ? accent : "var(--c-line)", transition: "background .2s ease" } }))), /* @__PURE__ */ React.createElement(ObHeader, { kicker: sc.kicker, title: sc.title, sub: sc.sub, accent }), /* @__PURE__ */ React.createElement("div", null, sc.body), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", marginTop: 2 } }, clampedStep > 0 ? /* @__PURE__ */ React.createElement("button", { onClick: back, style: obGhost }, "\u2190 Back") : /* @__PURE__ */ React.createElement("button", { onClick: finish, style: obGhost }, "Skip tour"), /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }), !isLast && clampedStep > 0 && /* @__PURE__ */ React.createElement("button", { onClick: finish, style: { ...obGhost, marginRight: 4 } }, "Skip"), /* @__PURE__ */ React.createElement(ObPrimary, { accent, active: canNext, onClick: next }, isLast ? cfg.enter : "Continue \u2192"))));
}
function _obDetectSurface() {
  if (window.CINA_SURFACE && OB_SURFACES[window.CINA_SURFACE]) return window.CINA_SURFACE;
  const hasScript = (re) => Array.from(document.scripts).some((s) => re.test(s.getAttribute("src") || ""));
  if (hasScript(/producers-app\.jsx/)) return "producers";
  if (hasScript(/pitch-app\.jsx/)) return "pitch";
  if (window.STUDIO && hasScript(/cina-state\.jsx/)) return "studio";
  return null;
}
function _obMount() {
  const surface = _obDetectSurface();
  if (!surface) return;
  if (document.getElementById("__cina-onboard-root")) return;
  const host = document.createElement("div");
  host.id = "__cina-onboard-root";
  document.body.appendChild(host);
  if (ReactDOM.createRoot) ReactDOM.createRoot(host).render(/* @__PURE__ */ React.createElement(CinaSurfaceOnboard, { surface }));
  else ReactDOM.render(/* @__PURE__ */ React.createElement(CinaSurfaceOnboard, { surface }), host);
}
function cinaReplayOnboard(surface) {
  const s = surface || _obDetectSurface();
  if (!s) return;
  try {
    localStorage.removeItem(_obKey(s));
    localStorage.removeItem(_obStepKey(s));
  } catch {
  }
  const host = document.getElementById("__cina-onboard-root");
  if (host) {
    try {
      host.remove();
    } catch {
    }
  }
  _obMount();
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", _obMount);
} else {
  _obMount();
}

  try { if (typeof useOb !== "undefined") window["useOb"] = useOb; } catch (_) {}
  try { if (typeof useObEff !== "undefined") window["useObEff"] = useObEff; } catch (_) {}
  try { if (typeof _obKey !== "undefined") window["_obKey"] = _obKey; } catch (_) {}
  try { if (typeof _obStepKey !== "undefined") window["_obStepKey"] = _obStepKey; } catch (_) {}
  try { if (typeof _obDone !== "undefined") window["_obDone"] = _obDone; } catch (_) {}
  try { if (typeof _obMarkDone !== "undefined") window["_obMarkDone"] = _obMarkDone; } catch (_) {}
  try { if (typeof _obLoadStep !== "undefined") window["_obLoadStep"] = _obLoadStep; } catch (_) {}
  try { if (typeof _obSaveStep !== "undefined") window["_obSaveStep"] = _obSaveStep; } catch (_) {}
  try { if (typeof OB_SURFACES !== "undefined") window["OB_SURFACES"] = OB_SURFACES; } catch (_) {}
  try { if (typeof ObPrimary !== "undefined") window["ObPrimary"] = ObPrimary; } catch (_) {}
  try { if (typeof obGhost !== "undefined") window["obGhost"] = obGhost; } catch (_) {}
  try { if (typeof ObHeader !== "undefined") window["ObHeader"] = ObHeader; } catch (_) {}
  try { if (typeof ObBullet !== "undefined") window["ObBullet"] = ObBullet; } catch (_) {}
  try { if (typeof buildStudioScreens !== "undefined") window["buildStudioScreens"] = buildStudioScreens; } catch (_) {}
  try { if (typeof buildProducersScreens !== "undefined") window["buildProducersScreens"] = buildProducersScreens; } catch (_) {}
  try { if (typeof CinaSurfaceOnboard !== "undefined") window["CinaSurfaceOnboard"] = CinaSurfaceOnboard; } catch (_) {}
  try { if (typeof _obDetectSurface !== "undefined") window["_obDetectSurface"] = _obDetectSurface; } catch (_) {}
  try { if (typeof _obMount !== "undefined") window["_obMount"] = _obMount; } catch (_) {}
  try { if (typeof cinaReplayOnboard !== "undefined") window["cinaReplayOnboard"] = cinaReplayOnboard; } catch (_) {}
})();
