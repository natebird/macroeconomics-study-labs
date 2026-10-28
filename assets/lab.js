/* Shared helpers for the Unit 5 study labs.
   Exposes a global `Lab` object: SVG chart drawing, a quiz builder, page navigation. */
(function () {
  "use strict";

  var TOPICS = [
    { id: "5.1", file: "5-1-policy-actions-short-run.html", title: "Fiscal & Monetary Policy in the Short Run" },
    { id: "5.2", file: "5-2-phillips-curve.html", title: "The Phillips Curve" },
    { id: "5.3", file: "5-3-money-growth-inflation.html", title: "Money Growth and Inflation" },
    { id: "5.4", file: "5-4-deficits-national-debt.html", title: "Government Deficits and the National Debt" },
    { id: "5.5", file: "5-5-crowding-out.html", title: "Crowding Out" },
    { id: "5.6", file: "5-6-economic-growth.html", title: "Economic Growth" },
    { id: "5.7", file: "5-7-public-policy-growth.html", title: "Public Policy and Economic Growth" }
  ];

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
    if (xl) el("text", { x: F.sx(x), y: F.H - F.M.b + 30, "text-anchor": "middle", style: "fill:var(--ink); font-weight:600" }, F.svg, xl);
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

  /* nav(currentId) fills #topnav and #pager on a lab page. */
  function nav(cur) {
    var top = document.getElementById("topnav");
    if (top) {
      top.innerHTML = '<a href="../index.html">← All Unit 5 labs</a><nav class="topics" aria-label="Unit 5 topics"></nav>';
      var t = top.querySelector(".topics");
      TOPICS.forEach(function (x) {
        var a = document.createElement("a"); a.href = x.file; a.textContent = x.id; a.title = x.title;
        if (x.id === cur) a.setAttribute("aria-current", "page");
        t.appendChild(a);
      });
    }
    var pg = document.getElementById("pager");
    if (pg) {
      var i = TOPICS.findIndex(function (x) { return x.id === cur; });
      var prev = TOPICS[i - 1], next = TOPICS[i + 1];
      pg.innerHTML = (prev ? '<a href="' + prev.file + '">← ' + prev.id + ' ' + prev.title + '</a>' : '<a href="../index.html">← All labs</a>') +
        (next ? '<a href="' + next.file + '">' + next.id + ' ' + next.title + ' →</a>' : '<a href="../index.html">Back to all labs →</a>');
    }
  }

  window.Lab = { TOPICS: TOPICS, el: el, frame: frame, line: line, fn: fn, vline: vline, hline: hline, tag: tag, dot: dot, arrow: arrow, rect: rect, fmt: fmt, animate: animate, quiz: quiz, nav: nav, reduceMotion: reduceMotion };
})();
