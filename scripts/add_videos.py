#!/usr/bin/env python3
"""Add or update the "Watch first" explainer video section on lab pages.

Videos are hosted on Cloudflare R2 at https://media.natebird.co/videos/<lab-file-base>.mp4,
with a poster image <base>-poster.jpg next to it.

Usage: python3 scripts/add_videos.py <seconds-json>   e.g. {"3.2": 227.4, "5.2": 192.2}
Pass the length of each video in seconds; only those labs are changed.
Bump VERSION when re-uploading changed videos so browsers and the CDN fetch the new file.
"""
import json, math, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_URL = "https://media.natebird.co/videos/"
VERSION = "1"

js = open(os.path.join(ROOT, "assets/lab.js"), encoding="utf-8").read()
topics = {i: (f, re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), t))
          for i, f, t in re.findall(r'\{ id: "(\d\.\d)", file: "([^"]+)", title: "([^"]+)" \}', js)}

def section(tid, seconds):
    f, title = topics[tid]
    base = f[:-5]
    mins = max(1, round(seconds / 60))
    src = f"{BASE_URL}{base}.mp4?v={VERSION}"
    poster = f"{BASE_URL}{base}-poster.jpg?v={VERSION}"
    return f'''<!-- VIDEO -->
<section aria-labelledby="video-h">
  <div class="sec-head">
    <h2 id="video-h">Watch first: {title} in {mins} minute{"s" if mins != 1 else ""}</h2>
    <p>A narrated walkthrough of this topic with captions on screen. Then try each idea yourself in the lab below.</p>
  </div>
  <div class="explainer-wrap" style="width:100%;">
  <video class="explainer" controls playsinline preload="none" poster="{poster}" style="display:block;width:100%;max-width:100%;height:auto;aspect-ratio:16/9;border-radius:12px;border:1px solid var(--rule);background:#000;">
    <source src="{src}" type="video/mp4">
    Your browser can't play this video. <a href="{src}">Download it instead</a>.
  </video>
  <img src="{poster}" alt="" width="1" height="1" style="display:none" onerror="this.closest('section').style.display='none'">
  </div>
</section>

'''

def apply(tid, seconds):
    path = os.path.join(ROOT, "labs", topics[tid][0])
    s = open(path, encoding="utf-8").read()
    new = section(tid, seconds)
    if "<!-- VIDEO -->" in s:
        s = re.sub(r"<!-- VIDEO -->.*?</section>\n\n", lambda m: new, s, count=1, flags=re.S)
    else:
        m = re.search(r"</header>\n", s)
        if not m:
            raise SystemExit(f"{tid}: no </header> found")
        s = s[:m.end()] + "\n" + new + s[m.end():].lstrip("\n")
    open(path, "w", encoding="utf-8").write(s)

if __name__ == "__main__":
    lengths = json.loads(sys.argv[1])
    for tid, sec in sorted(lengths.items(), key=lambda kv: [int(x) for x in kv[0].split(".")]):
        apply(tid, float(sec))
        print("video section:", tid, topics[tid][0])
