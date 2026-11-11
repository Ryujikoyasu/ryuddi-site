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
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(title)} — 子安竜司</title><meta name="description" content="{e(desc)}"><link rel="canonical" href="{canonical}"><link rel="icon" href="icons/ohana-mandala.svg"><link rel="stylesheet" href="portfolio.css"><meta property="og:title" content="{e(title)} — 子安竜司"><meta property="og:description" content="{e(desc)}"><meta property="og:type" content="website"><meta property="og:url" content="{canonical}"><meta property="og:image" content="{base}assets/media/oribe-square-plates-front.webp"><meta name="twitter:card" content="summary_large_image"></head><body><a class="skip" href="#main">本文へ</a>{nav(active=active)}<main id="main">{body}</main><footer class="footer"><div>制作・展示・共同研究などのご連絡<br><a href="mailto:ryuddi0wani@gmail.com">ryuddi0wani@gmail.com</a></div><small>© 2026 Ryuji Koyasu</small></footer><script src="portfolio.js"></script></body></html>'''
intro='''<header class="portfolio-intro"><div><span class="eyebrow">Ryuji Koyasu / Portfolio</span><h1>子安竜司</h1></div><div><p>土地にある素材や技術とともに、<br>どう暮らすか。</p><p class="intro-note">ロボットから、衣服、道具、空間へ。<br>暮らす場所とともに変わってきた、制作の記録。</p></div></header>'''
intro+='<nav class="year-nav" aria-label="年ごとのテーマ">'+''.join(f'<a href="#year-{t["year"]}">{t["year"]} <span>{e(t["title"])}</span></a>' for t in data['themes'])+'</nav>'
for t in data['themes']:
 y=t['year']; group=[w for w in data['works'] if w['year']==y]
 media=(f'<video controls playsinline preload="none" poster="{e(t["cover"])}" aria-label="{e(t["caption"])}"><source src="{e(t["video"])}" type="video/mp4"></video>' if t['video'] else f'<a href="works/{t["work"]}.html"><img src="{e(t["cover"])}" alt="{e(t["caption"])}" fetchpriority="high" width="1600" height="1600"></a>')
 intro+=f'''<section class="year-chapter" id="year-{y}" aria-labelledby="title-{y}"><header class="chapter-head"><span class="chapter-year">{y}</span><div><span class="eyebrow">{'Ongoing / 制作と研究' if y==2026 else 'Theme / 年のテーマ'}</span><h2 id="title-{y}">{e(t['title'])}</h2></div></header><div class="chapter-layout"><figure class="chapter-media">{media}<figcaption><span>{'制作写真' if not t['video'] else '作品映像'} — {e(t['caption'])}</span></figcaption></figure><div class="chapter-copy"><h3>テーマについて</h3><p>{e(t['intro'])}</p><dl><div><dt>関心・素材</dt><dd>{e(t['focus'])}</dd></div><div><dt>作品</dt><dd>{len(group)}件</dd></div></dl><ul class="chapter-works">'''
 intro+=''.join(f'<li><a href="{e(w["url"])}">{e(w["title"])} <span>↗</span></a></li>' for w in group)
 intro+=f'</ul><a class="text-link" href="works.html#year-{y}">{y}年の作品を一覧で見る →</a></div></div></section>'
intro+='<div class="portfolio-end"><a href="works.html">すべての作品を見る ↗</a><a href="about.html">プロフィール ↗</a></div>'
for name in ['index.html','projects.html']:
 (ROOT/name).write_text(page('Themes / 年ごとのテーマ','子安竜司のポートフォリオ。2026 京都、2025 季節、土地とともに生きる、2024 山、稲作文化、2023 畑ロボット。',intro,name,'themes'))
body='<header class="page-title"><span class="eyebrow">Portfolio / Index</span><h1>Works</h1><p>年ごとのテーマから生まれた作品と、素材・技法の記録。</p><nav class="year-nav" aria-label="制作年">'+''.join(f'<a href="#year-{t["year"]}">{t["year"]}</a>' for t in data['themes'])+'</nav></header>'
for t in data['themes']:
 y=t['year']; body+=f'<section class="archive-year" id="year-{y}"><header><h2>{y} <span>{e(t["title"])}</span></h2><a href="index.html#year-{y}">テーマを見る ↗</a></header><div class="archive-grid">'
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
 path.write_text(s)
print(f'Rendered themes and archive: {len(data["themes"])} themes, {len(data["works"])} works.')
