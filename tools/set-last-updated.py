#!/usr/bin/env python3
"""Single place to change the 'Last updated' date on the cost guides and /services/pricing/.

Edit config/last-updated.json ("date": "YYYY-MM-DD"), then run from the repo root:
    python3 tools/set-last-updated.py
It rewrites, on every page listed in the config:
  - the visible 'Last updated' line (between the LASTUPDATED comment markers)
  - every "dateModified" in the page's JSON-LD
  - "datePublished", if it would otherwise be later than the new date
Change the date only when the rates on those pages are actually re-checked.
"""
import json, re, sys, datetime, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
cfg = json.loads((root / "config" / "last-updated.json").read_text())
d = datetime.date.fromisoformat(cfg["date"])
human = f"{d.day} {d.strftime('%B %Y')}"
block = (f'<!--LASTUPDATED--><p class="text-slate-400 text-sm mb-5">Last updated: '
         f'<time datetime="{d.isoformat()}">{human}</time></p><!--/LASTUPDATED-->')
for page in cfg["pages"]:
    p = root / page / "index.html"
    h = p.read_text(encoding="utf-8")
    if "<!--LASTUPDATED-->" in h:
        h = re.sub(r"<!--LASTUPDATED-->.*?<!--/LASTUPDATED-->", lambda m: block, h, flags=re.S)
    else:
        i = h.index("</h1>")
        j = h.index("</p>", i) + 4
        h = h[:j] + "\n      " + block + h[j:]
    h = re.sub(r'("dateModified":\s*")[^"]*(")', lambda m: m.group(1) + d.isoformat() + m.group(2), h)
    def fix_pub(m):
        return m.group(1) + min(m.group(2), d.isoformat()) + m.group(3)
    h = re.sub(r'("datePublished":\s*")(\d{4}-\d{2}-\d{2})(")', fix_pub, h)
    p.write_text(h, encoding="utf-8")
    print("updated", page)
