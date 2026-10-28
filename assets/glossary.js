/* Terminology viewer for the study labs.
   Data lives in assets/glossary/unit-N.js, each appending to window.GLOSSARY:
   { t: term, d: definition, u: unit, tp: "N.k" topic, x?: example or AP tip, f?: formula, r?: [related terms] }
   Glossary.mount(el, opts) renders a searchable list, flashcards, and a self-quiz.
   opts: { units: [1..6] (default all present), topic: "5.2" (lock to one topic), compact: bool, storageKey: string } */
(function () {
  "use strict";

  var UNITS = {
    1: { title: "Basic Economic Concepts", topics: { "1.1": "Scarcity", "1.2": "Opportunity Cost and the Production Possibilities Curve", "1.3": "Comparative Advantage and Gains from Trade", "1.4": "Demand", "1.5": "Supply", "1.6": "Market Equilibrium, Disequilibrium, and Changes in Equilibrium" } },
    2: { title: "Economic Indicators and the Business Cycle", topics: { "2.1": "The Circular Flow and GDP", "2.2": "Limitations of GDP", "2.3": "Unemployment", "2.4": "Price Indices and Inflation", "2.5": "Costs of Inflation", "2.6": "Real v. Nominal GDP", "2.7": "Business Cycles" } },
    3: { title: "National Income and Price Determination", topics: { "3.1": "Aggregate Demand (AD)", "3.2": "Multipliers", "3.3": "Short-Run Aggregate Supply (SRAS)", "3.4": "Long-Run Aggregate Supply (LRAS)", "3.5": "Equilibrium in the AD–AS Model", "3.6": "Changes in the AD–AS Model in the Short Run", "3.7": "Long-Run Self-Adjustment", "3.8": "Fiscal Policy", "3.9": "Automatic Stabilizers" } },
    4: { title: "Financial Sector", topics: { "4.1": "Financial Assets", "4.2": "Nominal v. Real Interest Rates", "4.3": "Definition, Measurement, and Functions of Money", "4.4": "Banking and the Expansion of the Money Supply", "4.5": "The Money Market", "4.6": "Monetary Policy", "4.7": "The Loanable Funds Market" } },
    5: { title: "Long-Run Consequences of Stabilization Policies", topics: { "5.1": "Fiscal and Monetary Policy Actions in the Short Run", "5.2": "The Phillips Curve", "5.3": "Money Growth and Inflation", "5.4": "Government Deficits and the National Debt", "5.5": "Crowding Out", "5.6": "Economic Growth", "5.7": "Public Policy and Economic Growth" } },
    6: { title: "Open Economy—International Trade and Finance", topics: { "6.1": "Balance of Payments Accounts", "6.2": "Exchange Rates", "6.3": "The Foreign Exchange Market", "6.4": "Effect of Changes in Policies and Economic Conditions on the Foreign Exchange Market", "6.5": "Changes in the Foreign Exchange Market and Net Exports", "6.6": "Real Interest Rates and International Capital Flows" } }
  };

  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] == null || attrs[k] === false) continue;
      if (k === "text") e.textContent = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k] === true ? "" : attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function topicNum(tp) { var p = tp.split("."); return +p[0] * 100 + +p[1]; }
  function anchor(tp) { return "topic-" + tp.replace(".", "-"); }
  function norm(s) { return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, ""); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function store(key, val) { try { if (val === undefined) return JSON.parse(localStorage.getItem(key) || "null"); localStorage.setItem(key, JSON.stringify(val)); } catch (e) { return null; } }

  var uid = 0;

  function mount(root, opts) {
    opts = opts || {};
    var id = "g" + (++uid);
    var all = (window.GLOSSARY || []).slice();
    var present = {}; all.forEach(function (x) { present[x.u] = true; (x.also || []).forEach(function (tp) { present[+tp.split(".")[0]] = true; }); });
    var units = (opts.units || Object.keys(present).map(Number)).filter(function (u) { return present[u]; }).sort();
    function uOf(tp) { return +tp.split(".")[0]; }
    function topicsOf(x) { return [x.tp].concat(x.also || []); }
    // where a term sits for a given scope: its home topic if that unit is in scope, else the first later topic that is
    function eff(x, scopeUnits, topic) {
      if (topic) return topicsOf(x).indexOf(topic) >= 0 ? topic : null;
      var t = topicsOf(x).filter(function (tp) { return scopeUnits.indexOf(uOf(tp)) >= 0; });
      return t.length ? t[0] : null;
    }
    var base = all.filter(function (x) { return eff(x, units, opts.topic) != null; });
    var byTerm = {}; all.forEach(function (x) { byTerm[norm(x.t)] = x; });
    var skey = "macro-glossary-known:" + (opts.storageKey || (opts.topic || units.join("-")));
    var known = store(skey) || {};

    var state = { mode: "list", q: "", unit: 0, topic: opts.topic || "" };

    root.classList.add("gloss");
    root.innerHTML = "";

    // ---------- toolbar ----------
    var tabs = h("div", { "class": "g-tabs", role: "tablist", "aria-label": "Study mode" });
    var modes = [["list", "Term list"], ["cards", "Flashcards"], ["quiz", "Quiz me"]];
    var tabBtns = modes.map(function (m) {
      var b = h("button", { type: "button", role: "tab", "aria-selected": m[0] === state.mode ? "true" : "false", onclick: function () { setMode(m[0]); }, text: m[1] });
      tabs.appendChild(b); return b;
    });
    var search = h("input", { type: "search", id: id + "-search", placeholder: "Search terms and definitions", "aria-label": "Search terms", oninput: function (e) { state.q = e.target.value; render(); } });
    var bar = h("div", { "class": "g-bar" }, [tabs, opts.compact ? null : h("div", { "class": "g-search" }, [search])]);
    root.appendChild(bar);

    var filters = h("div", { "class": "g-filters" });
    if (!opts.topic) {
      if (units.length > 1) {
        var uRow = h("div", { "class": "g-chips", role: "group", "aria-label": "Filter by unit" });
        [0].concat(units).forEach(function (u) {
          uRow.appendChild(h("button", { type: "button", "class": "g-chip", "aria-pressed": u === state.unit ? "true" : "false", "data-u": u, onclick: function () { state.unit = u; state.topic = ""; render(); }, text: u ? "Unit " + u : "All units" }));
        });
        filters.appendChild(uRow);
      }
      var tSel = h("select", { id: id + "-topic", "aria-label": "Filter by topic", onchange: function (e) { state.topic = e.target.value; render(); } });
      filters.appendChild(h("label", { "class": "g-topic", "for": id + "-topic" }, ["Topic ", tSel]));
    }
    var count = h("span", { "class": "g-count", "aria-live": "polite" });
    filters.appendChild(count);
    root.appendChild(filters);

    var body = h("div", { "class": "g-body" });
    root.appendChild(body);

    function setMode(m) {
      state.mode = m;
      tabBtns.forEach(function (b, i) { b.setAttribute("aria-selected", modes[i][0] === m ? "true" : "false"); });
      render();
    }

    function filtered() {
      var q = norm(state.q.trim());
      var scope = state.unit ? [state.unit] : units;
      return base.map(function (x) { return { x: x, tp: eff(x, scope, state.topic) }; })
        .filter(function (v) {
          var x = v.x;
          if (v.tp == null) return false;
          if (!q) return true;
          return norm(x.t).indexOf(q) >= 0 || norm(x.d).indexOf(q) >= 0 || (x.x && norm(x.x).indexOf(q) >= 0);
        })
        .sort(function (a, b) { return topicNum(a.tp) - topicNum(b.tp) || a.x.t.localeCompare(b.x.t); })
        .map(function (v) { v.x._tp = v.tp; return v.x; });
    }

    function syncFilters() {
      Array.prototype.forEach.call(filters.querySelectorAll(".g-chip"), function (b) { b.setAttribute("aria-pressed", +b.getAttribute("data-u") === state.unit ? "true" : "false"); });
      var sel = filters.querySelector("select");
      if (sel) {
        sel.innerHTML = "";
        sel.appendChild(h("option", { value: "", text: "All topics" }));
        (state.unit ? [state.unit] : units).forEach(function (u) {
          Object.keys(UNITS[u].topics).forEach(function (tp) {
            var has = base.some(function (x) { return topicsOf(x).indexOf(tp) >= 0; });
            if (has) sel.appendChild(h("option", { value: tp, text: tp + " " + UNITS[u].topics[tp] }));
          });
        });
        sel.value = state.topic;
      }
    }

    function render() {
      syncFilters();
      var list = filtered();
      count.textContent = list.length + (list.length === 1 ? " term" : " terms");
      body.innerHTML = "";
      if (!list.length) { body.appendChild(h("p", { "class": "g-empty", text: "No terms match. Try a shorter search or clear the filters." })); return; }
      if (state.mode === "list") renderList(list);
      else if (state.mode === "cards") renderCards(list);
      else renderQuiz(list);
    }

    // ---------- list ----------
    function relatedLink(name) {
      var target = byTerm[norm(name)];
      if (!target || base.indexOf(target) < 0) return h("span", { "class": "g-rel", text: name });
      return h("button", { type: "button", "class": "g-rel", onclick: function () {
        state.q = target.t; if (search) search.value = target.t; state.unit = 0; if (!opts.topic) state.topic = ""; setMode("list");
      }, text: name });
    }
    function termCard(x) {
      var kids = [h("dt", { text: x.t }), h("dd", { "class": "g-def", text: x.d })];
      if (x.f) kids.push(h("dd", { "class": "g-f" }, [h("span", { "class": "formula", text: x.f })]));
      if (x.x) kids.push(h("dd", { "class": "g-x", text: x.x }));
      var where = x._tp && x._tp !== x.tp ? "First introduced in topic " + x.tp + " (Unit " + x.u + ")."
        : (x.also && x.also.length ? "Also used in topic" + (x.also.length > 1 ? "s " : " ") + x.also.join(", ") + "." : "");
      if (where) kids.push(h("dd", { "class": "g-where", text: where }));
      if (x.r && x.r.length) kids.push(h("dd", { "class": "g-r" }, [h("span", { text: "Related: " })].concat(x.r.map(relatedLink))));
      return h("div", { "class": "g-term" }, [h("dl", null, kids)]);
    }
    function renderList(list) {
      var lastU = 0, lastT = "", grid = null;
      list.forEach(function (x) {
        var tp = x._tp, u = uOf(tp);
        if (!opts.topic && u !== lastU && units.length > 1 && !state.unit) {
          body.appendChild(h("h3", { "class": "g-unit", id: id + "-unit-" + u, text: "Unit " + u + ": " + UNITS[u].title }));
          lastU = u;
        }
        if (!opts.topic && tp !== lastT) {
          body.appendChild(h("h4", { "class": "g-tp", id: anchor(tp) }, [h("span", { "class": "g-tpn", text: tp }), " " + UNITS[u].topics[tp]]));
          lastT = tp; grid = null;
        }
        if (!grid) { grid = h("div", { "class": "g-grid" }); body.appendChild(grid); }
        grid.appendChild(termCard(x));
      });
    }

    // ---------- flashcards ----------
    var cardState = { order: [], i: 0, flipped: false, defFirst: false, onlyLearning: false, key: "" };
    function renderCards(list) {
      var k = list.map(function (x) { return x.t; }).join("|") + cardState.onlyLearning;
      if (k !== cardState.key) {
        cardState.key = k;
        cardState.order = list.filter(function (x) { return !cardState.onlyLearning || !known[x.t]; });
        cardState.i = 0; cardState.flipped = false;
      }
      var deck = cardState.order;
      var nKnown = list.filter(function (x) { return known[x.t]; }).length;
      var stats = h("p", { "class": "g-cardstats", text: nKnown + " of " + list.length + " marked “Got it”" });
      if (!deck.length) {
        body.appendChild(stats);
        body.appendChild(h("p", { "class": "g-empty", text: "Every card here is marked “Got it.” Turn off “Only cards I'm still learning” or reset your progress to study them again." }));
        body.appendChild(cardOptions(list));
        return;
      }
      if (cardState.i >= deck.length) cardState.i = 0;
      var x = deck[cardState.i];
      var front = cardState.defFirst ? x.d : x.t, backMain = cardState.defFirst ? x.t : x.d;
      var face = cardState.flipped
        ? h("div", { "class": "g-face back" }, [h("div", { "class": "g-small", text: cardState.defFirst ? "Term" : "Definition" }), h("div", { "class": cardState.defFirst ? "g-big" : "g-mid", text: backMain }), x.f ? h("div", { "class": "formula", text: x.f }) : null, x.x ? h("div", { "class": "g-x", text: x.x }) : null])
        : h("div", { "class": "g-face" }, [h("div", { "class": "g-small", text: (cardState.defFirst ? "Which term is this?" : "Define this term") + " · Topic " + (x._tp || x.tp) }), h("div", { "class": cardState.defFirst ? "g-mid" : "g-big", text: front })]);
      var card = h("button", { type: "button", "class": "g-card" + (cardState.flipped ? " is-flipped" : ""), "aria-label": cardState.flipped ? "Card back. Click to flip." : "Card front. Click to flip.", onclick: flip }, [face]);
      body.appendChild(h("div", { "class": "g-cardwrap" }, [
        h("div", { "class": "g-prog", text: "Card " + (cardState.i + 1) + " of " + deck.length + (known[x.t] ? " · Got it" : "") }),
        card,
        h("div", { "class": "g-cardbtns" }, [
          h("button", { type: "button", onclick: function () { move(-1); }, text: "← Previous" }),
          h("button", { type: "button", "class": "g-learn", onclick: function () { mark(x, false); }, text: "Still learning" }),
          h("button", { type: "button", "class": "g-know primary", onclick: function () { mark(x, true); }, text: "Got it" }),
          h("button", { type: "button", onclick: function () { move(1); }, text: "Next →" })
        ]),
        h("p", { "class": "g-hint", text: "Keys: space flips, ← and → move, K marks “Got it”, L marks “Still learning.”" }),
        stats,
        cardOptions(list)
      ]));
    }
    function cardOptions(list) {
      return h("div", { "class": "g-opts" }, [
        h("label", null, [h("input", { type: "checkbox", checked: cardState.defFirst, onchange: function (e) { cardState.defFirst = e.target.checked; cardState.flipped = false; render(); } }), " Show the definition first"]),
        h("label", null, [h("input", { type: "checkbox", checked: cardState.onlyLearning, onchange: function (e) { cardState.onlyLearning = e.target.checked; render(); } }), " Only cards I'm still learning"]),
        h("button", { type: "button", onclick: function () { cardState.order = shuffle(cardState.order); cardState.i = 0; cardState.flipped = false; render(); }, text: "Shuffle" }),
        h("button", { type: "button", onclick: function () { list.forEach(function (x) { delete known[x.t]; }); store(skey, known); cardState.key = ""; render(); }, text: "Reset progress" })
      ]);
    }
    function flip() { cardState.flipped = !cardState.flipped; render(); focusCard(); }
    function move(d) { var n = cardState.order.length; if (!n) return; cardState.i = (cardState.i + d + n) % n; cardState.flipped = false; render(); focusCard(); }
    function mark(x, k) {
      if (k) known[x.t] = 1; else delete known[x.t];
      store(skey, known);
      if (cardState.onlyLearning && k) { cardState.order.splice(cardState.i, 1); cardState.flipped = false; render(); focusCard(); }
      else move(1);
    }
    function focusCard() { var c = body.querySelector(".g-card"); if (c) c.focus({ preventScroll: true }); }
    root.addEventListener("keydown", function (e) {
      if (state.mode !== "cards" || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
      var x = cardState.order[cardState.i];
      if (e.key === " " && e.target.classList.contains("g-card")) { e.preventDefault(); flip(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
      else if ((e.key === "k" || e.key === "K") && x) mark(x, true);
      else if ((e.key === "l" || e.key === "L") && x) mark(x, false);
    });

    // ---------- quiz ----------
    var quiz = null;
    function newQuiz(list) {
      var n = Math.min(10, list.length);
      var qs = shuffle(list).slice(0, n).map(function (x) {
        // distractors: prefer same topic, then same unit, then anything in scope
        var pool = shuffle(list.filter(function (y) { return y !== x && y._tp === x._tp; }))
          .concat(shuffle(base.filter(function (y) { return y !== x && y.u === x.u && y.tp !== x.tp; })))
          .concat(shuffle(base.filter(function (y) { return y !== x && y.u !== x.u; })));
        var seen = {}; seen[norm(x.t)] = 1;
        var opts2 = [];
        for (var i = 0; i < pool.length && opts2.length < 3; i++) { var k = norm(pool[i].t); if (!seen[k]) { seen[k] = 1; opts2.push(pool[i]); } }
        var choices = shuffle(opts2.concat([x]));
        return { x: x, choices: choices, picked: -1 };
      });
      quiz = { key: list.map(function (x) { return x.t; }).join("|"), qs: qs, i: 0, right: 0 };
    }
    function renderQuiz(list) {
      if (list.length < 4) { body.appendChild(h("p", { "class": "g-empty", text: "The quiz needs at least four terms. Clear the search or pick a wider filter." })); return; }
      var key = list.map(function (x) { return x.t; }).join("|");
      if (!quiz || quiz.key !== key) newQuiz(list);
      if (quiz.i >= quiz.qs.length) {
        body.appendChild(h("div", { "class": "card g-done" }, [
          h("h3", { text: "You got " + quiz.right + " of " + quiz.qs.length + " right." }),
          h("p", { text: quiz.right === quiz.qs.length ? "Perfect round. Try another, or switch to a different topic." : "Review the ones you missed below, then try another round." }),
          h("ul", { "class": "g-missed" }, quiz.qs.filter(function (q) { return q.choices[q.picked] !== q.x; }).map(function (q) { return h("li", null, [h("b", { text: q.x.t + ": " }), q.x.d]); })),
          h("button", { type: "button", "class": "primary", onclick: function () { newQuiz(list); render(); }, text: "New round" })
        ]));
        return;
      }
      var q = quiz.qs[quiz.i];
      var answered = q.picked >= 0;
      var opts3 = h("div", { "class": "opts" });
      q.choices.forEach(function (c, j) {
        var cls = "opt";
        if (answered && c === q.x) cls += " right";
        else if (answered && j === q.picked) cls += " wrong";
        opts3.appendChild(h("button", { type: "button", "class": cls, disabled: answered, onclick: function () { q.picked = j; if (c === q.x) quiz.right++; render(); }, text: String.fromCharCode(65 + j) + ".  " + c.t }));
      });
      var kids = [
        h("div", { "class": "qn", text: "Question " + (quiz.i + 1) + " of " + quiz.qs.length + " · Score " + quiz.right }),
        h("div", { "class": "stem", text: "Which term matches this definition?" }),
        h("blockquote", { "class": "g-quote", text: q.x.d }),
        opts3
      ];
      if (answered) {
        var ok = q.choices[q.picked] === q.x;
        kids.push(h("div", { "class": "why", html: (ok ? "<b style='color:var(--good)'>Correct.</b> " : "<b style='color:var(--bad)'>Not quite.</b> The answer is <b>" + q.x.t.replace(/</g, "&lt;") + "</b>. ") }));
        if (!ok) { var picked = q.choices[q.picked]; kids.push(h("div", { "class": "why", text: picked.t + " means: " + picked.d })); }
        if (q.x.x) kids.push(h("div", { "class": "why", text: q.x.x }));
        kids.push(h("div", null, [h("button", { type: "button", "class": "primary", onclick: function () { quiz.i++; render(); }, text: quiz.i + 1 < quiz.qs.length ? "Next question →" : "See results" })]));
      }
      body.appendChild(h("div", { "class": "card q" }, kids));
    }

    render();
    return { setMode: setMode };
  }

  window.Glossary = { UNITS: UNITS, mount: mount, anchor: anchor };
})();
