import { readFileSync, writeFileSync } from 'node:fs';

const base = 'https://ryujikoyasu.github.io/ryuddi-site/';
const pages = {
  'index.html':'assets/media/ohana-ike.webp',
  'projects.html':'assets/media/ohana-robot-poster.webp',
  'works.html':'assets/media/kusabana.webp',
  'about.html':'assets/media/ryu-portrait.webp',
  'works/ohana-ike.html':'assets/media/ohana-ike.webp',
  'works/ohana-robot.html':'assets/media/ohana-robot-poster.webp',
  'works/shishi-odoshi.html':'assets/media/shishi-odoshi.webp',
  'works/vernacular-rice-robot.html':'assets/media/vernacular-rice-robot.webp',
  'works/hirune.html':'assets/media/hirune-overview.webp'
};
for (const [path,image] of Object.entries(pages)) {
  const file = new URL(`../${path}`,import.meta.url);
  let html = readFileSync(file,'utf8');
  const title = html.match(/<title>(.*?)<\/title>/)?.[1] ?? '子安竜司';
  const description = html.match(/<meta name="description" content="(.*?)">/)?.[1] ?? '';
  const tags = [];
  if (!html.includes('rel="canonical"')) tags.push(`<link rel="canonical" href="${base}${path}">`);
  if (!html.includes('property="og:type"')) tags.push('<meta property="og:type" content="website">');
  if (!html.includes('property="og:title"')) tags.push(`<meta property="og:title" content="${title}">`);
  if (!html.includes('property="og:description"')) tags.push(`<meta property="og:description" content="${description}">`);
  if (!html.includes('property="og:url"')) tags.push(`<meta property="og:url" content="${base}${path}">`);
  if (!html.includes('property="og:image"')) tags.push(`<meta property="og:image" content="${base}${image}">`);
  if (!html.includes('name="twitter:card"')) tags.push('<meta name="twitter:card" content="summary_large_image">');
  html = html.replace('</head>',`${tags.join('')}</head>`);
  writeFileSync(file,html);
}
