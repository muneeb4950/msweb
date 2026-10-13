#!/usr/bin/env python3
"""List every URL in sitemap.xml for Search Console rechecks. Reads local files only; submits nothing.

  python3 tools/list-sitemap-urls.py            plain list, one URL per line
  python3 tools/list-sitemap-urls.py --csv      url,lastmod,page_type,inspect_priority  (paste into a sheet)
  python3 tools/list-sitemap-urls.py --check    also confirm each URL has a page file and is not noindex
Request-indexing order (a few per day): inspect_priority 1 first.
"""
import re, sys
from pathlib import Path
root = Path(__file__).resolve().parent.parent
base = 'https://msconstruction.services'
text = (root / 'sitemap.xml').read_text()
rows = re.findall(r'<loc>(.*?)</loc>\s*<lastmod>(.*?)</lastmod>', text)
PRIORITY = ['/services/', '/areas/', '/']
def kind(u):
    p = u[len(base):]
    for k in ('areas', 'guides', 'services', 'company', 'projects', 'about'):
        if p.startswith(f'/{k}/'):
            return k + ('-hub' if p == f'/{k}/' else '')
    return 'home' if p == '/' else 'other'
def prio(u):
    p = u[len(base):]
    if p == '/services/': return 0
    return 1 if p in PRIORITY else 2 if kind(u) in ('guides-hub', 'services') else 3
if '--check' in sys.argv:
    bad = 0
    for u, _ in rows:
        rel = u[len(base):].strip('/')
        f = root / rel / 'index.html' if rel else root / 'index.html'
        if not f.exists(): print('MISSING PAGE', u); bad += 1
        elif 'noindex' in f.read_text(): print('NOINDEX IN SITEMAP', u); bad += 1
    print(f'{len(rows)} urls checked, {bad} problems'); sys.exit(1 if bad else 0)
if '--csv' in sys.argv:
    print('url,lastmod,page_type,inspect_priority,gsc_status_to_fill')
    for u, d in sorted(rows, key=lambda r: (prio(r[0]), r[0])): print(f'{u},{d},{kind(u)},{prio(u)},')
else:
    for u, _ in rows: print(u)
