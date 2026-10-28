/* Appearance preferences: light/dark mode and accent color, saved in this browser.
   Load in <head> (before the stylesheet paints) on every page:
     <script src="assets/prefs.js"></script>
   It applies the saved choice at once, then adds a small "Appearance" button and panel. */
(function () {
  "use strict";

  /* Each color: light-theme accent, dark-theme accent. Colors close to the SRAS (orange)
     or LRAS (green) curves swap that curve's color so the graphs stay readable. */
  var PURPLE = { srpc: "#6d28d9", srpcDark: "#c4b5fd" };
  var COLORS = [
    { id: "navy", name: "Navy", light: "#002e5d", dark: "#8db4e2" },
    { id: "blue", name: "Blue", light: "#2753b8", dark: "#7fa2ff" },
    { id: "sky", name: "Sky", light: "#0369a1", dark: "#7dd3fc" },
    { id: "teal", name: "Teal", light: "#0f766e", dark: "#5eead4", lrpc: "#4d7c0f", lrpcDark: "#a3e635" },
    { id: "green", name: "Green", light: "#15803d", dark: "#86efac", lrpc: "#0e7490", lrpcDark: "#67e8f9" },
    { id: "purple", name: "Purple", light: "#6d28d9", dark: "#c4b5fd" },
    { id: "plum", name: "Plum", light: "#86198f", dark: "#f0abfc" },
    { id: "rose", name: "Rose", light: "#be185d", dark: "#f9a8d4" },
    { id: "crimson", name: "Crimson", light: "#b91c1c", dark: "#fca5a5" },
    { id: "orange", name: "Orange", light: "#c2410c", dark: "#fdba74", srpc: PURPLE.srpc, srpcDark: PURPLE.srpcDark },
    { id: "gold", name: "Gold", light: "#a16207", dark: "#fcd34d", srpc: PURPLE.srpc, srpcDark: PURPLE.srpcDark },
    { id: "slate", name: "Slate", light: "#334155", dark: "#cbd5e1" }
  ];
  var DEFAULT = "navy", KEY_MODE = "macro-theme", KEY_COLOR = "macro-accent";

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function byId(id) { for (var i = 0; i < COLORS.length; i++) if (COLORS[i].id === id) return COLORS[i]; return null; }
  function hexMix(a, b, t) {
    var pa = [1, 3, 5].map(function (i) { return parseInt(a.substr(i, 2), 16); });
    var pb = [1, 3, 5].map(function (i) { return parseInt(b.substr(i, 2), 16); });
    return "#" + pa.map(function (v, i) { return ("0" + Math.round(v + (pb[i] - v) * t).toString(16)).slice(-2); }).join("");
  }

  var root = document.documentElement;
  var styleEl = document.createElement("style");
  styleEl.id = "macro-prefs";
  (document.head || root).appendChild(styleEl);

  function applyMode(mode) {
    if (mode === "light" || mode === "dark") root.setAttribute("data-theme", mode);
    else root.removeAttribute("data-theme");
  }
  function applyColor(id) {
    var c = byId(id) || byId(DEFAULT);
    var lightVars = "--accent:" + c.light + ";--accent-soft:" + hexMix(c.light, "#ffffff", .88) + ";" +
      (c.srpc ? "--srpc:" + c.srpc + ";" : "") + (c.lrpc ? "--lrpc:" + c.lrpc + ";" : "");
    var darkVars = "--accent:" + c.dark + ";--accent-soft:" + hexMix(c.dark, "#1a2029", .82) + ";" +
      (c.srpcDark ? "--srpc:" + c.srpcDark + ";" : "") + (c.lrpcDark ? "--lrpc:" + c.lrpcDark + ";" : "");
    // Same three blocks as lab.css, so the color follows the light/dark mode automatically.
    styleEl.textContent =
      ":root{" + lightVars + "}" +
      "@media (prefers-color-scheme: dark){:root:not([data-theme=\"light\"]){" + darkVars + "}}" +
      ":root[data-theme=\"dark\"]{" + darkVars + "}" + PANEL_CSS;
  }

  var PANEL_CSS =
    ".ap-btn{position:fixed;right:18px;bottom:18px;z-index:50;display:inline-flex;align-items:center;gap:8px;" +
    "padding:10px 16px;border-radius:999px;border:1px solid var(--rule);background:var(--surface);color:var(--ink);" +
    "font:500 .9rem var(--body,system-ui);box-shadow:0 6px 20px rgba(0,0,0,.15);cursor:pointer}" +
    ".ap-btn:hover{border-color:var(--accent)}.ap-btn:focus-visible,.ap-panel button:focus-visible{outline:3px solid var(--accent);outline-offset:2px}" +
    ".ap-dot{width:16px;height:16px;border-radius:50%;background:var(--accent);box-shadow:inset 0 0 0 2px rgba(255,255,255,.35)}" +
    ".ap-panel{position:fixed;right:18px;bottom:72px;z-index:51;width:min(320px,calc(100vw - 36px));padding:16px;border-radius:14px;" +
    "border:1px solid var(--rule);background:var(--surface);color:var(--ink);box-shadow:0 12px 36px rgba(0,0,0,.22);" +
    "display:grid;gap:14px;font-family:var(--body,system-ui)}" +
    ".ap-panel[hidden]{display:none}" +
    ".ap-panel h2{font:600 .78rem var(--mono,monospace);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:0}" +
    ".ap-seg{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--rule);border-radius:999px;padding:3px;gap:2px}" +
    ".ap-seg button{border:0;background:none;color:var(--ink);border-radius:999px;padding:6px 0;font:500 .86rem var(--body,system-ui);cursor:pointer}" +
    ".ap-seg button[aria-pressed=\"true\"]{background:var(--accent);color:var(--surface);font-weight:600}" +
    ".ap-sw{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}" +
    ".ap-sw button{aspect-ratio:1;width:100%;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0;position:relative}" +
    ".ap-sw button[aria-pressed=\"true\"]{border-color:var(--ink);box-shadow:inset 0 0 0 3px var(--surface)}" +
    ".ap-name{font-size:.84rem;color:var(--muted);margin:0}" +
    ".ap-reset{justify-self:start;border:1px solid var(--rule);background:none;color:var(--ink);border-radius:999px;padding:5px 12px;font:500 .82rem var(--body,system-ui);cursor:pointer}" +
    "@media print{.ap-btn,.ap-panel{display:none!important}}";

  var mode = get(KEY_MODE) || "auto", color = byId(get(KEY_COLOR)) ? get(KEY_COLOR) : DEFAULT;
  applyMode(mode); applyColor(color);

  function buildUI() {
    if (document.querySelector(".ap-btn")) return;
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "ap-btn";
    btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "ap-panel");
    btn.innerHTML = '<span class="ap-dot" aria-hidden="true"></span><span>Appearance</span>';

    var panel = document.createElement("div");
    panel.className = "ap-panel"; panel.id = "ap-panel"; panel.hidden = true;
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Appearance settings");
    panel.innerHTML =
      '<h2 id="ap-mode-h">Mode</h2><div class="ap-seg" role="group" aria-labelledby="ap-mode-h"></div>' +
      '<h2 id="ap-color-h">Color</h2><div class="ap-sw" role="group" aria-labelledby="ap-color-h"></div>' +
      '<p class="ap-name" aria-live="polite"></p><button type="button" class="ap-reset">Reset to defaults</button>';

    var seg = panel.querySelector(".ap-seg"), sw = panel.querySelector(".ap-sw"), nameEl = panel.querySelector(".ap-name");
    [["auto", "Auto"], ["light", "Light"], ["dark", "Dark"]].forEach(function (m) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = m[1]; b.setAttribute("data-mode", m[0]);
      b.addEventListener("click", function () { mode = m[0]; set(KEY_MODE, mode === "auto" ? null : mode); applyMode(mode); sync(); });
      seg.appendChild(b);
    });
    COLORS.forEach(function (c) {
      var b = document.createElement("button"); b.type = "button"; b.title = c.name; b.setAttribute("aria-label", c.name); b.setAttribute("data-color", c.id);
      b.style.background = c.light;
      b.addEventListener("click", function () { color = c.id; set(KEY_COLOR, color === DEFAULT ? null : color); applyColor(color); sync(); });
      sw.appendChild(b);
    });
    panel.querySelector(".ap-reset").addEventListener("click", function () {
      mode = "auto"; color = DEFAULT; set(KEY_MODE, null); set(KEY_COLOR, null); applyMode(mode); applyColor(color); sync();
    });
    function sync() {
      Array.prototype.forEach.call(seg.children, function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-mode") === mode ? "true" : "false"); });
      Array.prototype.forEach.call(sw.children, function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-color") === color ? "true" : "false"); });
      var c = byId(color);
      nameEl.textContent = c.name + (c.srpc || c.lrpc ? ". The " + (c.srpc ? "SRAS/supply" : "LRAS/long-run") + " curves switch to " + (c.srpc ? "purple" : (c.id === "teal" ? "olive" : "cyan")) + " so they stay distinct." : "") +
        (mode === "auto" ? " Mode follows your device." : "");
    }
    function open(v) { panel.hidden = !v; btn.setAttribute("aria-expanded", v ? "true" : "false"); if (v) { var p = panel.querySelector('[aria-pressed="true"]'); if (p) p.focus(); } }
    btn.addEventListener("click", function () { open(panel.hidden); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { open(false); btn.focus(); } });
    document.addEventListener("click", function (e) { if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) open(false); });
    sync();
    document.body.appendChild(panel); document.body.appendChild(btn);
    // keep the floating button from covering the last line of the page
    document.body.style.paddingBottom = "72px";
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", buildUI); else buildUI();

  window.MacroPrefs = { COLORS: COLORS };
})();
