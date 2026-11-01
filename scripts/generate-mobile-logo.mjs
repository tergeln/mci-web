import { writeFile } from 'node:fs/promises';
import { LOGO_SHAPES } from '../src/components/BrandLogo/logoShapes.js';

// Reuse the brand outlines at build time instead of loading Three.js on phones.
const polygons = LOGO_SHAPES.map((points) => `<polygon points="${points.map(([x, y]) => `${(200 + x * 90).toFixed(1)},${(125 - y * 90).toFixed(1)}`).join(' ')}"/>`).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250"><defs><pattern id="dots" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".85" fill="#6d85f7" opacity=".75"/></pattern></defs><g fill="url(#dots)">${polygons}</g></svg>\n`;
await writeFile(new URL('../public/assets/mobile-particle-logo.svg', import.meta.url), svg);
