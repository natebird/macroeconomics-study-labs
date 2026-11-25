#!/usr/bin/env python3
"""Write question sets 2 and 3 into each lab's quiz.

Usage: python3 scripts/add_quiz_sets.py <dir-with-N.k.json> [ids...]
Each N.k.json holds {"set2": [...8], "set3": [...8]} with items {s, o, c, w}.
The lab's existing `var Q = [...]` (Set 1) is kept as written and becomes the first of
three sets. Running again replaces sets 2 and 3 and leaves Set 1 alone.
"""
import json, os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INTRO_OLD = "AP-style multiple choice. Pick an answer to see the explanation."
INTRO_NEW = ("Three sets of 8 multiple-choice questions: core ideas, more practice, then harder questions "
             "in the style of the AP exam. Pick an answer to see the explanation.")

def item(q):
    return ("    { s: %s, o: [%s], c: %d, w: %s }" %
            (json.dumps(q["s"], ensure_ascii=False), ", ".join(json.dumps(o, ensure_ascii=False) for o in q["o"]),
             q["c"], json.dumps(q["w"], ensure_ascii=False)))

def apply(path, data):
    s = open(path, encoding="utf-8").read()
    multi = re.search(r"  var Q = \[\n  \[\n(.*?)\n  \],\n  \[\n.*?\n  \]\n  \];", s, re.S)
    if multi:
        set1, span = multi.group(1), multi.span()
    else:
        m = re.search(r"  var Q = \[\n(.*?)\n  \];", s, re.S)
        if not m: raise SystemExit(f"no quiz found in {path}")
        set1, span = m.group(1), m.span()
    body = "  var Q = [\n  [\n" + set1 + "\n  ],\n  [\n" + ",\n".join(item(q) for q in data["set2"]) + \
           "\n  ],\n  [\n" + ",\n".join(item(q) for q in data["set3"]) + "\n  ]\n  ];"
    s = s[:span[0]] + body + s[span[1]:]
    s = s.replace(INTRO_OLD, INTRO_NEW)
    open(path, "w", encoding="utf-8").write(s)

src = sys.argv[1]
ids = sys.argv[2:] or sorted(f[:-5] for f in os.listdir(src) if re.match(r"^\d\.\d\.json$", f))
for tid in ids:
    n, k = tid.split(".")
    path = glob.glob(f"{ROOT}/labs/{n}-{k}-*.html")[0]
    apply(path, json.load(open(f"{src}/{tid}.json", encoding="utf-8")))
    print("quiz sets:", tid, os.path.basename(path))
