#!/usr/bin/env python3
"""Set each sitemap <lastmod> to the date of the last git commit that touched that page's index.html.

Run from the repo root:  python3 tools/update-sitemap-lastmod.py
Pages with noindex are skipped (they must not be in the sitemap). Nothing is submitted anywhere.
Only commit real content changes: a lastmod that moves on every deploy teaches Google to ignore it.
"""
import re, subprocess, sys
from pathlib import Path
root = Path(__file__).resolve().parent.parent
sm = root / 'sitemap.xml'
text = sm.read_text()
base = 'https://msconstruction.services'
def page_file(loc):
    rel = loc[len(base):].strip('/')
    return (root / rel / 'index.html') if rel else root / 'index.html'
def last_commit_date(f):
    out = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', str(f)], cwd=root, capture_output=True, text=True).stdout.strip()
    return out
changed = 0
def fix(m):
    global changed
    loc, old = m.group(1), m.group(2)
    f = page_file(loc)
    d = last_commit_date(f) if f.exists() else ''
    if not d or d == old:
        return m.group(0)
    changed += 1
    return m.group(0).replace(f'<lastmod>{old}</lastmod>', f'<lastmod>{d}</lastmod>')
text = re.sub(r'<url>\s*<loc>(.*?)</loc>\s*<lastmod>(.*?)</lastmod>', fix, text)
sm.write_text(text)
print(f'updated {changed} lastmod values')
