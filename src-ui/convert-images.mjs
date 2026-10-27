// Converts source images to WebP (two widths) into assets/gallery/. Run: node convert-images.mjs <sourceDir>
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const src = process.argv[2];
const out = new URL('../assets/gallery/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
fs.mkdirSync(out, { recursive: true });

const IMAGES = [
  ['3.webp', 'modern-grey-facade-concept'],
  ['5.webp', 'modern-tiled-facade-day-concept'],
  ['6.webp', 'modern-tiled-facade-night-concept'],
  ['7.webp', 'classical-facade-concept'],
  ['8.webp', 'classical-facade-night-concept'],
  ['9.webp', 'contemporary-black-white-facade-concept'],
  ['10.jpg', 'arched-window-house-photo'],
];
const meta = {};
for (const [file, name] of IMAGES) {
  const input = path.join(src, file);
  const m = await sharp(input).metadata();
  for (const w of [640, 1280]) {
    const width = Math.min(w, m.width);
    const info = await sharp(input).resize({ width }).webp({ quality: 78, effort: 5 }).toFile(path.join(out, `${name}-${w}.webp`));
    (meta[name] ||= {})[w] = { width: info.width, height: info.height, bytes: info.size };
  }
  meta[name].orig = { width: m.width, height: m.height, bytes: fs.statSync(input).size };
}
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(meta, null, 1));
for (const [n, v] of Object.entries(meta)) console.log(n.padEnd(46), `${v[640].width}x${v[640].height} ${(v[640].bytes / 1024).toFixed(0)}KB | ${v[1280].width}x${v[1280].height} ${(v[1280].bytes / 1024).toFixed(0)}KB | source ${(v.orig.bytes / 1024).toFixed(0)}KB`);
