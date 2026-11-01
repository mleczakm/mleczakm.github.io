#!/usr/bin/env python3
"""Check static-page links, shared locale structure, metadata and local assets."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(); self.path=path; self.ids=set(); self.refs=[]; self.tags=[]; self.duplicate=[]
        self.feed(path.read_text())
    def handle_starttag(self, tag, attrs):
        a=dict(attrs); self.tags.append((tag,a))
        if a.get('id'):
            if a['id'] in self.ids: self.duplicate.append(a['id'])
            self.ids.add(a['id'])
        for key in ('href','src'):
            if a.get(key): self.refs.append(a[key])
        if tag=='img': assert 'alt' in a, f'{self.path}: image missing alt'

pages={p: Page(ROOT/p) for p in ('index.html','en/index.html','platnosci-blik/index.html')}
for file, page in pages.items():
    assert not page.duplicate, (file, page.duplicate)
    for ref in page.refs:
        u=urlsplit(ref)
        if u.scheme or u.netloc: continue
        if not u.path: target=page.path
        elif u.path.startswith('/'): target=ROOT / unquote(u.path).lstrip('/')
        else: target=page.path.parent / unquote(u.path)
        if target.is_dir(): target=target/'index.html'
        assert target.exists(), f'{file}: missing target {ref}'
        if u.fragment and target.suffix=='.html':
            assert u.fragment in Page(target).ids, f'{file}: missing fragment {ref}'
    print(f'OK links and unique IDs: {file}')
for lang, file in [('pl','index.html'),('en','en/index.html')]:
    p=pages[file]; tags=p.tags
    assert next(a['lang'] for t,a in tags if t=='html')==lang
    assert sum(t=='h1' for t,a in tags)==1
    canonical=next(a['href'] for t,a in tags if t=='link' and a.get('rel')=='canonical')
    assert canonical=='https://mleczakm.github.io/'+('en/' if lang=='en' else '')
    assert {a.get('hreflang') for t,a in tags if t=='link' and a.get('rel')=='alternate'}=={'pl','en','x-default'}
    assert '/platnosci-blik/' in p.refs
    assert 'https://bezreszty.org.pl' in p.refs
    assert any(t=='form' and a.get('action')=='https://formspree.io/f/xdavweok' and a.get('method')=='POST' for t,a in tags)
    assert not any(t=='script' and a.get('src','').startswith('https:') for t,a in tags), 'Unexpected external runtime'
    for m in re.findall(r'<script type="application/ld\+json">(.*?)</script>',p.path.read_text(),re.S): json.loads(m)
assert pages['index.html'].ids==pages['en/index.html'].ids, 'Language section IDs differ'
assert 'weryfikacja' in pages['platnosci-blik/index.html'].ids
for asset in re.findall(r"url\(['\"]?(/[^)'\"]+)", (ROOT/'assets/site.css').read_text()):
    assert (ROOT/asset.lstrip('/')).is_file(), f'Missing CSS asset: {asset}'
ET.parse(ROOT/'sitemap.xml')
subprocess.run(['python3',str(ROOT/'scripts/build.py'),'--check'],check=True)
subprocess.run(['node','--check',str(ROOT/'assets/site.js')],check=True)
print('OK bilingual SEO, BLIK permalink, verification, forms, JSON-LD, sitemap and JS syntax')
