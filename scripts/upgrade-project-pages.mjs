import { readFileSync, writeFileSync } from 'node:fs';

const pages = {
  'ohana-robot': {
    poster: ['poster="../content/projects/畑ロボット/ohana-robot/images/cover.jpg"','poster="../assets/media/ohana-robot-poster.webp"'],
    gallery: '<div class="work-gallery"><img src="../assets/media/ohana-robot-15.webp" alt="畑でOHANA-ROBOTを調整する様子" loading="lazy" decoding="async"><img src="../assets/media/ohana-robot-28.webp" alt="畝をまたいで走行するOHANA-ROBOT" loading="lazy" decoding="async"></div>'
  },
  'shishi-odoshi': {
    poster: ['<video class="work-hero" controls playsinline>','<video class="work-hero" controls playsinline preload="metadata" poster="../assets/media/shishi-odoshi.webp">'],
    gallery: '<div class="work-gallery"><img src="../assets/media/shishi-2.webp" alt="毛綱毅曠設計の釧路EGGに置かれた鹿おどし" loading="lazy" decoding="async"><img src="../assets/media/shishi-7.webp" alt="光る浮き玉と鹿おどしの機構" loading="lazy" decoding="async"></div>'
  },
  'ohana-ike': {
    gallery: '<div class="work-gallery"><img src="../assets/media/ohana-ike-1.webp" alt="池と森に広がる光の全景" loading="lazy" decoding="async"><img src="../assets/media/ohana-ike-8.webp" alt="水面と浮き玉に現れる光" loading="lazy" decoding="async"></div>'
  },
  'vernacular-rice-robot': {
    poster: ['<video class="work-hero" autoplay muted loop playsinline>','<video class="work-hero" controls playsinline preload="metadata" poster="../assets/media/vernacular-rice-robot.webp">'],
    text: ['必要な仕事に応じて構成を変えられる道具として作りました。','必要な仕事に応じて構成を変えることを想定した構造試作です。']
  },
  hirune: {
    hero: ['../content/projects/季節、土地とともに生きる/objects/hirune/cover.jpg','../assets/media/hirune-overview.webp'],
    detail: ['../content/projects/季節、土地とともに生きる/objects/hirune/detail.jpg','../assets/media/hirune-detail.webp']
  }
};

for (const [slug, config] of Object.entries(pages)) {
  const file = new URL(`../works/${slug}.html`, import.meta.url);
  let html = readFileSync(file, 'utf8');
  html = html.replace('<body><header','<body><a class="skip" href="#main">本文へ</a><header');
  html = html.replace('<main class="work-page">','<main id="main" class="work-page">');
  html = html.replace('<a href="../projects.html">Projects</a>','<a href="../projects.html" aria-current="page">Projects</a>');
  for (const key of ['poster','text','hero','detail']) if (config[key]) html = html.replace(...config[key]);
  if (config.gallery && !html.includes(config.gallery)) html = html.replace('<div class="work-body">',config.gallery+'<div class="work-body">');
  writeFileSync(file, html);
}
