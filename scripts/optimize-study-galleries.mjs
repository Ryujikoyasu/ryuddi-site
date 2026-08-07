import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const slugs = ['kusabana','shirt1','shirt2','ohana-zabuton-kushiro','karamushi','kusagi','akebi-tengu','katamenyo','washi-light','tops1','pants1','zouri1'];
for (const slug of slugs) {
  const file = new URL(`../works/${slug}.html`,import.meta.url);
  let html = readFileSync(file,'utf8');
  let index = 0;
  html = html.replace(/(<div class="study-gallery">)(.*?)(<\/div>)/,(_,open,gallery,close)=>{
    const optimized = gallery.replace(/src="([^"\n]+)"/g,(match,src)=>{
      const source = new URL(src,file);
      const output = new URL(`../assets/media/study-${slug}-${++index}.webp`,import.meta.url);
      execFileSync('magick',[fileURLToPath(source),'-auto-orient','-resize','1600x1400>','-quality','76',fileURLToPath(output)]);
      return `src="../assets/media/study-${slug}-${index}.webp"`;
    });
    return open+optimized+close;
  });
  writeFileSync(file,html);
}
