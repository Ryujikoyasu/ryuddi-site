"""Render the static portfolio from data/portfolio.json (Python standard library)."""
from pathlib import Path
import json,html,re
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'data/portfolio.json').read_text())
e=lambda s:html.escape(str(s),quote=True)
base='https://ryujikoyasu.github.io/ryuddi-site/'
def nav(prefix='',active=''):
 return '<header class="site-header"><div class="nav"><a class="wordmark" href="'+prefix+'index.html">子安竜司 <small>RYUJI KOYASU</small></a><nav class="nav-links" aria-label="メインナビゲーション">'+''.join(f'<a href="{prefix}{url}"'+(' aria-current="page"' if key==active else '')+f'>{label}</a>' for key,url,label in [('themes','index.html','Themes'),('works','works.html','Works'),('about','about.html','About')])+'<a href="mailto:ryuddi0wani@gmail.com">Contact</a></nav></div></header>'
def page(title,desc,body,name,active):
 canonical=base+('' if name in ['index.html','projects.html'] else name)
 return f'''<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(title)} — 子安竜司</title><meta name="description" content="{e(desc)}"><link rel="canonical" href="{canonical}"><link rel="icon" href="icons/ohana-mandala.svg"><link rel="stylesheet" href="portfolio.css?v=garden-1"><link rel="stylesheet" href="assets/garden/garden.css?v=garden-1"><meta property="og:title" content="{e(title)} — 子安竜司"><meta property="og:description" content="{e(desc)}"><meta property="og:type" content="website"><meta property="og:url" content="{canonical}"><meta property="og:image" content="{base}assets/media/oribe-square-plates-front.webp"><meta name="twitter:card" content="summary_large_image"></head><body><a class="skip" href="#main">本文へ</a>{nav(active=active)}<main id="main">{body}</main><footer class="footer"><div>制作・展示・共同研究などのご連絡<br><a href="mailto:ryuddi0wani@gmail.com">ryuddi0wani@gmail.com</a></div><small>© 2026 Ryuji Koyasu</small></footer><script src="portfolio.js?v=garden-1"></script></body></html>'''
# Themes is a navigable garden; the chronological documentation lives in Works.
art=(ROOT/'assets/garden/garden.svg').read_text()
art=art.replace('role="img"','role="group"')
intro='<header class="garden-intro"><div><h1>制作の庭</h1><p>つくること、暮らすこと。</p></div><span>子安竜司 / 2023—2026</span></header>'
intro+='<section class="garden-stage" aria-label="四つのテーマがつながる庭">'+art
for t in data['themes']:
 intro+=f'<a class="garden-label label-{t["year"]}" href="#year-{t["year"]}" data-garden-link><span>{t["year"]}</span><strong>{e(t["title"])}</strong><i aria-hidden="true">↗</i></a>'
intro+='</section><div class="garden-under"><p>気になる場所から、どうぞ。</p><a href="works.html">制作の記録を年ごとに見る ↗</a></div>'
intro+='<div class="garden-records">'
for t in data['themes']:
 y=t['year']
 media=(f'<video controls playsinline preload="none" poster="{e(t["cover"])}" aria-label="{e(t["caption"])}"><source src="{e(t["video"])}" type="video/mp4"></video>' if t['video'] else f'<a href="works/{t["work"]}.html"><img src="{e(t["cover"])}" alt="{e(t["caption"])}" loading="lazy"></a>')
 intro+=f'<details class="garden-record" id="year-{y}" open><summary><span>{y}</span><h2>{e(t["title"])}</h2><span class="record-sign" aria-hidden="true">＋</span></summary><div class="record-body"><figure>{media}<figcaption>{e(t["caption"])}</figcaption></figure><div class="record-copy"><p>{e(t["intro"])}</p><dl><dt>関心・素材</dt><dd>{e(t["focus"])}</dd></dl><a href="works.html#year-{y}">映像・作品の記録を見る ↗</a><a href="#main" class="back-to-garden">庭に戻る ↑</a></div></div></details>'
intro+='</div><div class="garden-colophon"><p>畑から山へ。土地の素材、身体、空間へ。<br>場所とともに変わってきた関心が、ひとつの庭でつながっています。</p><a href="about.html">つくっている人について ↗</a></div>'
for name in ['index.html','projects.html']:
 (ROOT/name).write_text(page('Themes / 制作の庭','子安竜司のポートフォリオ。2026 京都、2025 季節、土地とともに生きる、2024 山、稲作文化、2023 畑ロボット。',intro,name,'themes'))
body='<header class="page-title"><span class="eyebrow">2023—2026</span><h1>作品一覧</h1><p>年ごとのテーマから生まれた作品と、素材・技法の記録。</p><nav class="year-nav" aria-label="制作年">'+''.join(f'<a href="#year-{t["year"]}">{t["year"]}</a>' for t in data['themes'])+'</nav></header>'
for t in data['themes']:
 y=t['year']; body+=f'<section class="archive-year" id="year-{y}"><header><h2>{y} <span>{e(t["title"])}</span></h2><a href="index.html#year-{y}">庭へ戻る ↗</a></header>'
 media=(f'<video controls playsinline preload="none" poster="{e(t["cover"])}" aria-label="{e(t["caption"])}"><source src="{e(t["video"])}" type="video/mp4"></video>' if t['video'] else f'<img src="{e(t["cover"])}" alt="{e(t["caption"])}" loading="lazy">')
 body+=f'<div class="archive-theme"><figure>{media}<figcaption>{e(t["caption"])}</figcaption></figure><div><p>{e(t["intro"])}</p><dl><dt>関心・素材</dt><dd>{e(t["focus"])}</dd></dl></div></div><div class="archive-grid">'
 for w in data['works']:
  if w['year']!=y: continue
  body+=f'<a class="archive-card" href="{e(w["url"])}"><img src="{e(w["cover"])}" alt="{e(w["title"])}" loading="lazy" decoding="async"><div class="meta">{y} / {e(t["title"])}</div><h3>{e(w["title"])}</h3><p>{e(w["summary"])}</p><span class="archive-method">{e(w["methods"])}</span></a>'
 body+='</div></section>'
(ROOT/'works.html').write_text(page('Works / 作品一覧','子安竜司の作品一覧。京都の器、光と音の空間、衣服、土地の素材、稲作と畑のロボット。',body,'works.html','works'))
# Use the same navigation everywhere, retaining each work's authored text.
for path in [ROOT/'about.html',ROOT/'work-with-me.html',*sorted((ROOT/'works').glob('*.html'))]:
 s=path.read_text(); prefix='../' if path.parent.name=='works' else ''
 s=re.sub(r'<header class="site-header">.*?</header>',nav(prefix,'works' if prefix else 'about' if path.name=='about.html' else ''),s,flags=re.S)
 s=s.replace('../works.html#techniques','../works.html#year-2025')
 s=s.replace('Studiesへ戻る','作品一覧へ戻る').replace('Projectsへ戻る','テーマ一覧へ戻る')
 w=next((w for w in data['works'] if w['id']==path.stem),None)
 if w:
  t=next(t for t in data['themes'] if t['year']==w['year'])
  s=re.sub(r'<aside class="work-context".*?</aside>','',s,flags=re.S)
  context=f'<aside class="work-context" aria-label="作品の基本情報"><dl><div><dt>制作年</dt><dd>{w["year"]}</dd></div><div><dt>年のテーマ</dt><dd><a href="../index.html#year-{w["year"]}">{e(t["title"])}</a></dd></div><div><dt>素材・技法</dt><dd>{e(w["methods"]) or "作品本文に記載"}</dd></div></dl></aside>'
  s=re.sub(r'(<h1[^>]*>.*?</h1>)',lambda m:m[0]+context,s,count=1,flags=re.S)
 path.write_text('\n'.join(line.rstrip() for line in s.splitlines())+'\n')
print(f'Rendered themes and archive: {len(data["themes"])} themes, {len(data["works"])} works.')
