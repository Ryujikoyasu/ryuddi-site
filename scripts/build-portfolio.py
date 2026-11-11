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
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(title)} — 子安竜司</title><meta name="description" content="{e(desc)}"><link rel="canonical" href="{canonical}"><link rel="icon" href="icons/ohana-mandala.svg"><link rel="stylesheet" href="portfolio.css?v=garden-3"><link rel="stylesheet" href="assets/garden/garden.css?v=garden-3"><meta property="og:title" content="{e(title)} — 子安竜司"><meta property="og:description" content="{e(desc)}"><meta property="og:type" content="website"><meta property="og:url" content="{canonical}"><meta property="og:image" content="{base}assets/media/oribe-square-plates-front.webp"><meta name="twitter:card" content="summary_large_image"></head><body><a class="skip" href="#main">本文へ</a>{nav(active=active)}<main id="main">{body}</main><footer class="footer"><div>制作・展示・共同研究などのご連絡<br><a href="mailto:ryuddi0wani@gmail.com">ryuddi0wani@gmail.com</a></div><small>© 2026 Ryuji Koyasu</small></footer><script src="portfolio.js?v=garden-3"></script></body></html>'''
# Themes is a navigable garden; the chronological documentation lives in Works.
art=(ROOT/'assets/garden/garden.svg').read_text()
art=art.replace('role="img"','role="group"')
intro='<header class="garden-intro"><div><h1>制作の庭</h1><p>つくること、暮らすこと。</p></div><span>子安竜司 / 2023—2026</span></header>'
intro+='<div class="garden-shell"><div class="garden-overview" id="garden-overview"><section class="garden-stage" aria-label="四つのテーマがつながる庭">'+art
for t in data['themes']:
 intro+=f'<a class="garden-label label-{t["year"]}" href="#year-{t["year"]}" data-garden-link><span>{t["year"]}</span><strong>{e(t["title"])}</strong><i aria-hidden="true">↗</i></a>'
intro+='</section><div class="garden-under"><p>気になる場所から、どうぞ。</p><a href="works.html">作品の記録を見る ↗</a></div></div>'
world_notes={
 2025:[('植物から、衣服へ','採取した草花を版にし、カラムシやクサギで布を染める。身につけるものに、季節と場所の痕跡を残す。'),('水辺から、空間へ','池や森、人の歩みと光・音をつなぐ。土地の素材を、身体で体験する空間へ。'),('草から、暮らしへ','真菰を縄に綯い、敷物、枕、草履へ。一株の硬さや太さを、身体を休める道具に使い分ける。')],
 2024:[('田と、そこでの暮らし','山間の地形、水の流れ、稲作の作業。小院瀬見での暮らしから、ものづくりを考える。'),('土地に合わせる技術','機械に土地を合わせるのではなく、そこで手に入る材料と作業に合わせて、稲作の道具を組み替える。'),('素材にあるかたち','アケビ天狗、カタメニョウ。蔓や藁など、稲作の周囲にある素材から造形を始める。')],
 2023:[('畑で、ともに暮らす','自給的な畑で、人と機械が一緒に暮らす方法を探る。ロボットを、暮らしの道具として試作する。'),('機械と、ことば','畑のロボット、歩行を支えるシルバーカー。対話によって、人と道具の関係を考える。'),('物語にする','畑での気づきや季節の息づかいを、絵本へ。技術の試作と、暮らしの物語を行き来する。')],
 2026:[('京都で学ぶ','料理、茶、香り、祭礼。暮らしのなかで受け継がれてきた所作や素材を学んでいる。'),('器をつくる','多治見・住吉窯で制作した織部鉄絵四方皿。動物ともうひとつのモティーフを掛け合わせ、言葉遊びを器へ。'),('いま、育っていること','学んだことを制作へつなぐ途中の年。図には制作した器と、現在学んでいる領域を一緒に描いている。')]
}
for t in data['themes']:
 y=t['year']; world=(ROOT/f'assets/garden/world-{y}.svg').read_text()
 # Local pattern references keep each inner illustration self-contained.
 world=world.replace('url(#rice-lines)',f'url(#inner-rice-{y})').replace('url(#water-lines)',f'url(#inner-rice-{y})')
 intro+=f'<section class="garden-world" id="year-{y}" aria-labelledby="world-heading-{y}"><header class="world-heading"><a href="#garden-overview" class="garden-back" data-garden-back>← 庭へ戻る</a><div><span>{y}</span><h2 id="world-heading-{y}" tabindex="-1">{e(t["title"])}</h2></div><a href="works.html#year-{y}" class="world-works">作品一覧 ↗</a></header><div class="world-illustration">{world}</div><div class="world-notes">'
 for heading,text in world_notes[y]:
  intro+=f'<section><h3>{e(heading)}</h3><p>{e(text)}</p></section>'
 intro+='</div><nav class="world-neighbors" aria-label="ほかのテーマへ">'
 for other in data['themes']:
  if other['year']!=y: intro+=f'<a href="#year-{other["year"]}" data-world-link><span>{other["year"]}</span> {e(other["title"])}</a>'
 intro+='</nav></section>'
intro+='</div>'
for name in ['index.html','projects.html']:
 (ROOT/name).write_text(page('Themes / 制作の庭','子安竜司のポートフォリオ。2026 京都、2025 季節、土地とともに生きる、2024 山、稲作文化、2023 畑ロボット。',intro,name,'themes'))
body='<header class="page-title"><span class="eyebrow">2023—2026</span><h1>作品一覧</h1><p>年ごとのテーマから生まれた作品と、素材・技法の記録。</p><nav class="year-nav" aria-label="制作年">'+''.join(f'<a href="#year-{t["year"]}">{t["year"]}</a>' for t in data['themes'])+'</nav></header>'
for t in data['themes']:
 y=t['year']; body+=f'<section class="archive-year" id="year-{y}"><header><h2>{y} <span>{e(t["title"])}</span></h2><a href="index.html#year-{y}">庭へ戻る ↗</a></header>'
 body+='<div class="archive-grid">'
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
