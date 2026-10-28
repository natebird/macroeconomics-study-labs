/* Shared helpers for the AP Macroeconomics study labs.
   Exposes a global `Lab` object: SVG chart drawing, a quiz builder, page navigation. */
(function () {
  "use strict";

  /* Every topic in the course. A unit's labs go live when its number is in READY. */
  var READY = [1, 2, 3, 4, 5, 6];
  var UNIT_TITLES = { 1: "Basic Economic Concepts", 2: "Economic Indicators and the Business Cycle", 3: "National Income and Price Determination", 4: "Financial Sector", 5: "Long-Run Consequences of Stabilization Policies", 6: "Open Economy\u2014International Trade and Finance" };
  var TOPICS = [
    { id: "1.1", file: "1-1-scarcity.html", title: "Scarcity" },
    { id: "1.2", file: "1-2-opportunity-cost-ppc.html", title: "Opportunity Cost and the PPC" },
    { id: "1.3", file: "1-3-comparative-advantage.html", title: "Comparative Advantage and Gains from Trade" },
    { id: "1.4", file: "1-4-demand.html", title: "Demand" },
    { id: "1.5", file: "1-5-supply.html", title: "Supply" },
    { id: "1.6", file: "1-6-market-equilibrium.html", title: "Market Equilibrium and Changes in Equilibrium" },
    { id: "2.1", file: "2-1-circular-flow-gdp.html", title: "The Circular Flow and GDP" },
    { id: "2.2", file: "2-2-limitations-of-gdp.html", title: "Limitations of GDP" },
    { id: "2.3", file: "2-3-unemployment.html", title: "Unemployment" },
    { id: "2.4", file: "2-4-price-indices-inflation.html", title: "Price Indices and Inflation" },
    { id: "2.5", file: "2-5-costs-of-inflation.html", title: "Costs of Inflation" },
    { id: "2.6", file: "2-6-real-vs-nominal-gdp.html", title: "Real vs. Nominal GDP" },
    { id: "2.7", file: "2-7-business-cycles.html", title: "Business Cycles" },
    { id: "3.1", file: "3-1-aggregate-demand.html", title: "Aggregate Demand" },
    { id: "3.2", file: "3-2-multipliers.html", title: "Multipliers" },
    { id: "3.3", file: "3-3-short-run-aggregate-supply.html", title: "Short-Run Aggregate Supply" },
    { id: "3.4", file: "3-4-long-run-aggregate-supply.html", title: "Long-Run Aggregate Supply" },
    { id: "3.5", file: "3-5-ad-as-equilibrium.html", title: "Equilibrium in the AD\u2013AS Model" },
    { id: "3.6", file: "3-6-short-run-changes-ad-as.html", title: "Changes in the AD\u2013AS Model in the Short Run" },
    { id: "3.7", file: "3-7-long-run-self-adjustment.html", title: "Long-Run Self-Adjustment" },
    { id: "3.8", file: "3-8-fiscal-policy.html", title: "Fiscal Policy" },
    { id: "3.9", file: "3-9-automatic-stabilizers.html", title: "Automatic Stabilizers" },
    { id: "4.1", file: "4-1-financial-assets.html", title: "Financial Assets" },
    { id: "4.2", file: "4-2-nominal-vs-real-interest-rates.html", title: "Nominal vs. Real Interest Rates" },
    { id: "4.3", file: "4-3-money.html", title: "Definition, Measurement, and Functions of Money" },
    { id: "4.4", file: "4-4-banking-money-supply.html", title: "Banking and the Expansion of the Money Supply" },
    { id: "4.5", file: "4-5-money-market.html", title: "The Money Market" },
    { id: "4.6", file: "4-6-monetary-policy.html", title: "Monetary Policy" },
    { id: "4.7", file: "4-7-loanable-funds-market.html", title: "The Loanable Funds Market" },
    { id: "5.1", file: "5-1-policy-actions-short-run.html", title: "Fiscal & Monetary Policy in the Short Run" },
    { id: "5.2", file: "5-2-phillips-curve.html", title: "The Phillips Curve" },
    { id: "5.3", file: "5-3-money-growth-inflation.html", title: "Money Growth and Inflation" },
    { id: "5.4", file: "5-4-deficits-national-debt.html", title: "Government Deficits and the National Debt" },
    { id: "5.5", file: "5-5-crowding-out.html", title: "Crowding Out" },
    { id: "5.6", file: "5-6-economic-growth.html", title: "Economic Growth" },
    { id: "5.7", file: "5-7-public-policy-growth.html", title: "Public Policy and Economic Growth" },
    { id: "6.1", file: "6-1-balance-of-payments.html", title: "Balance of Payments Accounts" },
    { id: "6.2", file: "6-2-exchange-rates.html", title: "Exchange Rates" },
    { id: "6.3", file: "6-3-foreign-exchange-market.html", title: "The Foreign Exchange Market" },
    { id: "6.4", file: "6-4-fx-market-shifts.html", title: "Policy and Economic Changes in the Foreign Exchange Market" },
    { id: "6.5", file: "6-5-fx-and-net-exports.html", title: "The Foreign Exchange Market and Net Exports" },
    { id: "6.6", file: "6-6-real-interest-rates-capital-flows.html", title: "Real Interest Rates and International Capital Flows" }
  ];
  function unitOf(id) { return +String(id).split(".")[0]; }

  var NS = "http://www.w3.org/2000/svg";
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function el(tag, attrs, parent, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }

  /* frame(svg, opts) clears the svg and draws axes + grid.
     opts: { x:[min,max], y:[min,max], xLabel, yLabel, xTicks:[], yTicks:[], fmtX(v), fmtY(v),
             width (440), height (330) }
     Returns F with sx(), sy(), g (clipped plot group), svg, xr, yr. */
  function frame(svg, o) {
    var W = o.width || 440, H = o.height || 330, M = { l: 52, r: 18, t: 18, b: 46 };
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var xr = o.x, yr = o.y;
    var sx = function (v) { return M.l + (v - xr[0]) / (xr[1] - xr[0]) * (W - M.l - M.r); };
    var sy = function (v) { return H - M.b - (v - yr[0]) / (yr[1] - yr[0]) * (H - M.t - M.b); };
    var fx = o.fmtX || function () { return ""; }, fy = o.fmtY || function () { return ""; };
    var defs = el("defs", {}, svg);
    var cid = (svg.id || "c") + "-clip";
    var cp = el("clipPath", { id: cid }, defs);
    el("rect", { x: M.l, y: M.t, width: W - M.l - M.r, height: H - M.t - M.b }, cp);
    (o.xTicks || []).forEach(function (v) {
      el("line", { x1: sx(v), x2: sx(v), y1: M.t, y2: H - M.b, stroke: "var(--grid)" }, svg);
      el("text", { x: sx(v), y: H - M.b + 16, "text-anchor": "middle" }, svg, fx(v));
    });
    (o.yTicks || []).forEach(function (v) {
      el("line", { x1: M.l, x2: W - M.r, y1: sy(v), y2: sy(v), stroke: "var(--grid)" }, svg);
      el("text", { x: M.l - 8, y: sy(v) + 4, "text-anchor": "end" }, svg, fy(v));
    });
    el("line", { x1: M.l, x2: M.l, y1: M.t, y2: H - M.b, stroke: "var(--ink)", "stroke-width": 1.5 }, svg);
    el("line", { x1: M.l, x2: W - M.r, y1: H - M.b, y2: H - M.b, stroke: "var(--ink)", "stroke-width": 1.5 }, svg);
    el("text", { x: (M.l + W - M.r) / 2, y: H - 8, "text-anchor": "middle", "class": "lbl", style: "fill:var(--ink)" }, svg, o.xLabel || "");
    var my = (M.t + H - M.b) / 2;
    el("text", { x: 14, y: my, "text-anchor": "middle", "class": "lbl", style: "fill:var(--ink)", transform: "rotate(-90 14 " + my + ")" }, svg, o.yLabel || "");
    var g = el("g", { "clip-path": "url(#" + cid + ")" }, svg);
    return { sx: sx, sy: sy, g: g, svg: svg, xr: xr, yr: yr, W: W, H: H, M: M };
  }

  /* line(F, [[x,y],...], color, width, dash) — polyline in data coords, clipped to plot. */
  function line(F, pts, color, w, dash) {
    var d = pts.map(function (p, i) { return (i ? "L" : "M") + F.sx(p[0]).toFixed(1) + " " + F.sy(p[1]).toFixed(1); }).join(" ");
    return el("path", { d: d, fill: "none", stroke: color, "stroke-width": w || 3, "stroke-linecap": "round", "stroke-dasharray": dash || null }, F.g);
  }
  /* fn(F, f, color, width, dash, steps) — plot y = f(x) across the x range. */
  function fn(F, f, color, w, dash, steps) {
    var n = steps || 60, pts = [];
    for (var i = 0; i <= n; i++) { var x = F.xr[0] + (F.xr[1] - F.xr[0]) * i / n; pts.push([x, f(x)]); }
    return line(F, pts, color, w, dash);
  }
  function vline(F, x, color, w, dash) { return line(F, [[x, F.yr[0]], [x, F.yr[1]]], color, w, dash); }
  function hline(F, y, color, w, dash) { return line(F, [[F.xr[0], y], [F.xr[1], y]], color, w, dash); }
  /* tag(F, x, y, text, color, anchor) — bold label, clamped inside the plot. */
  function tag(F, x, y, txt, color, anchor) {
    var cx = Math.max(F.xr[0], Math.min(F.xr[1], x)), cy = Math.max(F.yr[0], Math.min(F.yr[1], y));
    return el("text", { x: F.sx(cx), y: F.sy(cy), style: "fill:" + color, "class": "lbl", "text-anchor": anchor || "start" }, F.svg, txt);
  }
  /* dot(F, x, y, color, guides, xLabel, yLabel) — equilibrium point with dashed guides to the axes. */
  function dot(F, x, y, color, guides, xl, yl) {
    if (guides) line(F, [[x, F.yr[0]], [x, y], [F.xr[0], y]], "var(--muted)", 1, "3 3");
    el("circle", { cx: F.sx(x), cy: F.sy(y), r: 6, fill: color || "var(--ink)", stroke: "var(--surface)", "stroke-width": 2 }, F.g);
    if (xl) el("text", { x: F.sx(x), y: F.H - F.M.b + 16, "text-anchor": "middle", style: "fill:var(--ink); font-weight:600" }, F.svg, xl);
    if (yl) el("text", { x: F.M.l - 8, y: F.sy(y) - 6, "text-anchor": "end", style: "fill:var(--ink); font-weight:600" }, F.svg, yl);
  }
  /* arrow(F, x1,y1,x2,y2,color) — a shift arrow. */
  function arrow(F, x1, y1, x2, y2, color) {
    var X1 = F.sx(x1), Y1 = F.sy(y1), X2 = F.sx(x2), Y2 = F.sy(y2);
    var len = Math.hypot(X2 - X1, Y2 - Y1); if (len < 8) return;
    var ux = (X2 - X1) / len, uy = (Y2 - Y1) / len, h = 8;
    el("path", { d: "M" + X1 + " " + Y1 + " L" + X2 + " " + Y2, stroke: color, "stroke-width": 2, fill: "none" }, F.svg);
    el("path", { d: "M" + X2 + " " + Y2 + " L" + (X2 - h * ux + h * .5 * uy) + " " + (Y2 - h * uy - h * .5 * ux) + " L" + (X2 - h * ux - h * .5 * uy) + " " + (Y2 - h * uy + h * .5 * ux) + " Z", fill: color }, F.svg);
  }
  /* rect(F, x0,y0,x1,y1, fill, opacity) — shaded region in data coords. */
  function rect(F, x0, y0, x1, y1, fill, op) {
    return el("rect", { x: Math.min(F.sx(x0), F.sx(x1)), y: Math.min(F.sy(y0), F.sy(y1)), width: Math.abs(F.sx(x1) - F.sx(x0)), height: Math.abs(F.sy(y1) - F.sy(y0)), fill: fill, opacity: op == null ? .18 : op }, F.g);
  }

  function fmt(v, d) { var k = Math.pow(10, d == null ? 1 : d); return (Math.round(v * k) / k).toFixed(d == null ? 1 : d); }

  /* animate(duration, onFrame(t in 0..1), onDone) with ease-in-out; jumps to the end under reduced motion. */
  function animate(dur, onFrame, done) {
    if (reduceMotion) { onFrame(1); if (done) done(); return function () {}; }
    var t0 = null, id = null, stopped = false;
    function step(t) {
      if (stopped) return;
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      onFrame(e);
      if (k < 1) id = requestAnimationFrame(step); else if (done) done();
    }
    id = requestAnimationFrame(step);
    return function () { stopped = true; if (id) cancelAnimationFrame(id); };
  }

  /* quiz(questions, quizEl, scoreEl, resetBtn)
     questions: [{ s: stem, o: [options], c: correctIndex, w: explanation }] */
  function quiz(Q, quizEl, scoreEl, resetBtn) {
    var answered = 0, right = 0;
    function upd() { scoreEl.textContent = right + " / " + answered + " correct"; }
    function build() {
      quizEl.innerHTML = ""; answered = 0; right = 0; upd();
      Q.forEach(function (q, i) {
        var card = document.createElement("div"); card.className = "card q";
        card.innerHTML = '<div class="qn">Question ' + (i + 1) + ' of ' + Q.length + '</div><div class="stem"></div><div class="opts"></div><div class="why" hidden></div>';
        card.querySelector(".stem").textContent = q.s;
        var opts = card.querySelector(".opts"), why = card.querySelector(".why");
        q.o.forEach(function (t, j) {
          var b = document.createElement("button"); b.className = "opt"; b.type = "button";
          b.textContent = String.fromCharCode(65 + j) + ".  " + t;
          b.addEventListener("click", function () {
            var all = opts.querySelectorAll("button");
            all.forEach(function (x) { x.disabled = true; });
            all[q.c].classList.add("right");
            if (j !== q.c) b.classList.add("wrong"); else right++;
            answered++; upd();
            why.hidden = false;
            why.innerHTML = (j === q.c ? "<b style='color:var(--good)'>Correct.</b> " : "<b style='color:var(--bad)'>Not quite.</b> The answer is " + String.fromCharCode(65 + q.c) + ". ") + q.w;
          });
          opts.appendChild(b);
        });
        quizEl.appendChild(card);
      });
    }
    if (resetBtn) resetBtn.addEventListener("click", build);
    build();
  }

  /* nav(currentId) fills #topnav and #pager on a lab page.
     The topic chips show the current unit; the pager walks every ready lab in course order. */
  function nav(cur) {
    var u = unitOf(cur);
    var top = document.getElementById("topnav");
    if (top) {
      top.innerHTML = '<span style="display:flex;gap:16px;flex-wrap:wrap"><a href="../index.html">\u2190 All labs</a><a href="../terms/unit-' + u + '.html">Unit ' + u + ' terms</a><a href="../terms/index.html">All terms</a></span><nav class="topics" aria-label="Unit ' + u + ' topics"></nav>';
      var t = top.querySelector(".topics");
      TOPICS.filter(function (x) { return unitOf(x.id) === u; }).forEach(function (x) {
        var a = document.createElement("a"); a.href = x.file; a.textContent = x.id; a.title = x.title;
        if (x.id === cur) a.setAttribute("aria-current", "page");
        t.appendChild(a);
      });
    }
    var pg = document.getElementById("pager");
    if (pg) {
      var live = TOPICS.filter(function (x) { return READY.indexOf(unitOf(x.id)) >= 0 || unitOf(x.id) === u; });
      var i = live.findIndex(function (x) { return x.id === cur; });
      var prev = live[i - 1], next = live[i + 1];
      pg.innerHTML = (prev ? '<a href="' + prev.file + '">\u2190 ' + prev.id + ' ' + prev.title + '</a>' : '<a href="../index.html">\u2190 All labs</a>') +
        (next ? '<a href="' + next.file + '">' + next.id + ' ' + next.title + ' \u2192</a>' : '<a href="../index.html">Back to all labs \u2192</a>');
    }
  }

  /* market(svg, cfg) draws a standard market graph in a 0..10 by 0..10 space and returns the equilibrium.
     Use it for supply and demand, AD-AS, the money market, loanable funds, and foreign exchange.
     cfg = {
       xLabel, yLabel,                       axis titles (e.g. "Quantity", "Price")
       demand: { shift, label, color },      downward line; shift moves it right (+) or left (-), about -3..3
       supply: { shift, label, color, vertical },  upward line, or vertical (money supply, fixed quantity)
       longRun: { shift, label, color },     optional vertical line (LRAS) at x = 5 + shift
       start: { demand, supply, longRun },   optional starting shifts; drawn as dashed ghost curves when different
       slope: 0.8,                           steepness of demand and supply
       eqLabels: ["Q\u2081", "P\u2081"],   axis labels for the current equilibrium
       startLabels: ["Q\u2080", "P\u2080"] axis labels for the starting equilibrium, when it differs
       arrows: true                          draw shift arrows from ghost to current curves
       extra: function (F, eq) {}            hook to draw anything else (price ceilings, gaps) with Lab helpers
     }
     Returns { x, y, start: {x, y} } in the 0..10 space, so labs can compute readouts. */
  function market(svg, cfg) {
    var k = cfg.slope || 0.8;
    var st = cfg.start || {};
    var d = cfg.demand || null, s = cfg.supply || null, lr = cfg.longRun || null;
    var F = frame(svg, { x: [0, 10], y: [0, 10], xLabel: cfg.xLabel, yLabel: cfg.yLabel, xTicks: [], yTicks: [] });
    function D(sh) { return function (x) { return 5 - k * (x - 5 - sh); }; }
    function S(sh) { return function (x) { return 5 + k * (x - 5 - sh); }; }
    function eqOf(ds, ss, vertical) {
      if (vertical) { var x = 5 + ss; return { x: x, y: D(ds)(x) }; }
      return { x: 5 + (ds + ss) / 2, y: 5 + k * (ds - ss) / 2 };
    }
    var dsh = d ? d.shift || 0 : 0, ssh = s ? s.shift || 0 : 0;
    var d0 = st.demand != null ? st.demand : dsh, s0 = st.supply != null ? st.supply : ssh, l0 = st.longRun != null ? st.longRun : (lr ? lr.shift || 0 : 0);
    var vert = s && s.vertical;
    var eq = d && s ? eqOf(dsh, ssh, vert) : null;
    var eq0 = d && s ? eqOf(d0, s0, vert) : null;
    var ghost = "var(--ghost)";
    // ghosts
    if (lr && Math.abs(l0 - (lr.shift || 0)) > 1e-9) vline(F, 5 + l0, ghost, 2, "6 5");
    if (s && Math.abs(s0 - ssh) > 1e-9) { if (vert) vline(F, 5 + s0, ghost, 2, "6 5"); else fn(F, S(s0), ghost, 2, "6 5", 2); }
    if (d && Math.abs(d0 - dsh) > 1e-9) fn(F, D(d0), ghost, 2, "6 5", 2);
    var moved = eq && eq0 && (Math.abs(eq.x - eq0.x) > 1e-6 || Math.abs(eq.y - eq0.y) > 1e-6);
    if (moved) dot(F, eq0.x, eq0.y, ghost, true, cfg.startLabels ? cfg.startLabels[0] : null, cfg.startLabels ? cfg.startLabels[1] : null);
    // current curves
    if (lr) { vline(F, 5 + (lr.shift || 0), lr.color || "var(--lrpc)", 3); tag(F, 5 + (lr.shift || 0) + 0.15, 9.5, lr.label || "LRAS", lr.color || "var(--lrpc)"); }
    if (s) {
      var sc = s.color || "var(--srpc)";
      if (vert) { vline(F, 5 + ssh, sc, 3); tag(F, 5 + ssh + 0.15, 9.5, s.label || "S", sc); }
      else { fn(F, S(ssh), sc, 3, null, 2); var xe = Math.min(9.6, 5 + ssh + 5.5 / k); tag(F, xe, Math.min(9.6, S(ssh)(xe)) - 0.5, s.label || "S", sc, "end"); }
    }
    if (d) {
      var dc = d.color || "var(--accent)";
      fn(F, D(dsh), dc, 3, null, 2);
      var xd = Math.min(9.6, 5 + dsh + 4.6 / k); tag(F, xd, Math.max(0.4, D(dsh)(xd)) + 0.3, d.label || "D", dc, "end");
    }
    if (cfg.arrows !== false) {
      if (d && Math.abs(d0 - dsh) > 0.2) arrow(F, 5 + d0 + 1.6, D(d0)(5 + d0 + 1.6), 5 + dsh + 1.6, D(d0)(5 + d0 + 1.6), "var(--muted)");
      if (s && !vert && Math.abs(s0 - ssh) > 0.2) arrow(F, 5 + s0 + 2.4, S(s0)(5 + s0 + 2.4), 5 + ssh + 2.4, S(s0)(5 + s0 + 2.4), "var(--muted)");
    }
    if (eq) dot(F, eq.x, eq.y, "var(--ink)", true, cfg.eqLabels ? cfg.eqLabels[0] : null, cfg.eqLabels ? cfg.eqLabels[1] : null);
    if (cfg.extra) cfg.extra(F, eq, { D: D, S: S });
    return eq ? { x: eq.x, y: eq.y, start: eq0 } : null;
  }

  /* ppc(svg, cfg) draws a production possibilities curve with goods on each axis.
     cfg = { xLabel, yLabel, xMax: 10, yMax: 10 (intercepts), start: {xMax, yMax} (dashed ghost when different),
             bowed: true (increasing opportunity cost) or false (straight line, constant cost),
             point: [x, y] (optional dot, labelled by pointLabel), pointLabel, extra(F) }
     Returns { F, onCurve(x) -> y, status(x, y) -> "on" | "inside" | "outside" }. */
  function ppc(svg, cfg) {
    var F = frame(svg, { x: [0, 12], y: [0, 12], xLabel: cfg.xLabel, yLabel: cfg.yLabel, xTicks: [0, 2, 4, 6, 8, 10, 12], yTicks: [0, 2, 4, 6, 8, 10, 12], fmtX: String, fmtY: String });
    var bowed = cfg.bowed !== false;
    function curve(X, Y) { return function (x) { if (x > X) return NaN; var r = x / X; return bowed ? Y * Math.sqrt(Math.max(0, 1 - r * r)) : Y * (1 - r); }; }
    function draw(X, Y, color, w, dash) {
      var pts = [];
      for (var i = 0; i <= 90; i++) { var th = Math.PI / 2 * i / 90; pts.push(bowed ? [X * Math.sin(th), Y * Math.cos(th)] : [X * i / 90, Y * (1 - i / 90)]); }
      line(F, pts, color, w, dash);
    }
    var X = cfg.xMax || 10, Y = cfg.yMax || 10, st = cfg.start || {};
    var X0 = st.xMax || X, Y0 = st.yMax || Y;
    if (Math.abs(X0 - X) > 1e-9 || Math.abs(Y0 - Y) > 1e-9) draw(X0, Y0, "var(--ghost)", 2, "6 5");
    draw(X, Y, "var(--lrpc)", 3);
    tag(F, X * 0.72 + 0.2, curve(X, Y)(X * 0.72) + 0.5, cfg.curveLabel || "PPC", "var(--lrpc)");
    var on = curve(X, Y);
    function status(x, y) { var c = on(x); if (isNaN(c)) return "outside"; return Math.abs(y - c) < 0.15 ? "on" : (y < c ? "inside" : "outside"); }
    if (cfg.point) {
      dot(F, cfg.point[0], cfg.point[1], "var(--ink)", true);
      if (cfg.pointLabel) tag(F, cfg.point[0] + 0.25, cfg.point[1] + 0.35, cfg.pointLabel, "var(--ink)");
    }
    if (cfg.extra) cfg.extra(F, on);
    return { F: F, onCurve: on, status: status };
  }

  window.Lab = { TOPICS: TOPICS, READY: READY, UNIT_TITLES: UNIT_TITLES, unitOf: unitOf, market: market, ppc: ppc, el: el, frame: frame, line: line, fn: fn, vline: vline, hline: hline, tag: tag, dot: dot, arrow: arrow, rect: rect, fmt: fmt, animate: animate, quiz: quiz, nav: nav, reduceMotion: reduceMotion };
})();
