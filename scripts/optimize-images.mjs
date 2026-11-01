import sharp from 'sharp';
import './generate-mobile-logo.mjs';
import { mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const jobs = [
  ...['hushkhan', 'num', 'young-women-entrepreneurs'].map((name) => ({ src: `/assets/partners/${name}.png`, widths: [96, 128, 192, 288], quality: 85 })),
  { src: '/assets/chatbot-owl.png', widths: [96, 128, 160, 192], quality: 85 },
  { src: '/assets/about/director-enkhtuya.jpg', widths: [200, 400, 600] },
  { src: '/assets/news/khush-tugul/group-photo.jpg', aliases: ['/assets/news/khush-tugul/group-photo-small.jpg'], widths: [320, 480, 768, 1284] },
];
const manifest = {};
for (const job of jobs) {
  const input = path.join(root, 'public', job.src);
  const outputBase = job.src.replace(/\.[^.]+$/, '');
  const variants = [];
  for (const width of job.widths) {
    const src = `${outputBase}-${width}.webp`;
    const output = path.join(root, 'public', src);
    await mkdir(path.dirname(output), { recursive: true });
    const info = await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: job.quality || 80, alphaQuality: 100, effort: 6 }).toFile(output);
    variants.push({ src, width: info.width });
  }
  const delivery = { src: variants[0].src, srcSet: variants.map((v) => `${v.src} ${v.width}w`).join(', ') };
  for (const src of [job.src, ...(job.aliases || [])]) manifest[src] = delivery;
  const original = (await stat(input)).size;
  const smallest = (await stat(path.join(root, 'public', delivery.src))).size;
  console.log(`${job.src}: ${Math.round(original / 1024)} KiB -> ${(smallest / 1024).toFixed(1)} KiB (smallest variant)`);
}
await writeFile(path.join(root, 'src/assets/optimizedImages.json'), `${JSON.stringify(manifest, null, 2)}\n`);
