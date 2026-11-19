#!/usr/bin/env node
// Makes a plain placeholder icon in the app's accent colour, so a test version has one and every
// build finds the files app.json names. The real icon is a later, separate choice (store listing).
//
// Usage: node scripts/make-icons.mjs [--dir <app folder>]
// A phone app gets assets/icon.png (1024, with no alpha channel: Apple refuses an icon that has one),
// assets/adaptive-icon.png (1024, transparent, the mark inside the middle two thirds) and
// assets/favicon.png (48), and icon, android.adaptiveIcon and web.favicon are set in app.json.
// A web app gets only the favicon. Run it again to remake them.
// Plain Node 20+, no packages: it writes the PNG files itself.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const HERE = dirname(fileURLToPath(import.meta.url));

const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const head = Buffer.alloc(4); head.writeUInt32BE(data.length);
  const tail = Buffer.alloc(4); tail.writeUInt32BE(crc32(body));
  return Buffer.concat([head, body, tail]);
};

// A PNG of size×size: `pixel(x, y)` returns [r, g, b, a]. With `alpha` false the file has no alpha
// channel at all (Apple's icon must have none); with true it keeps the transparency.
export function png(size, pixel, alpha = true) {
  const bytes = alpha ? 4 : 3;
  const rows = Buffer.alloc(size * (size * bytes + 1));
  for (let y = 0; y < size; y++) {
    const at = y * (size * bytes + 1);
    rows[at] = 0;
    for (let x = 0; x < size; x++) rows.set(pixel(x, y).slice(0, bytes), at + 1 + x * bytes);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4);
  header[8] = 8; header[9] = alpha ? 6 : 2; // 8 bits a channel; colour type 6 is RGBA, 2 is RGB
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(rows)), chunk('IEND', Buffer.alloc(0))]);
}

const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mix = (a, b, t) => a.map((c, i) => Math.round(c * (1 - t) + b[i] * t));

// A ring (the mark) in `ink`, over `bg` or, when bg is null, over nothing. The edge is softened by a pixel.
function icon(size, { bg, ink, scale }) {
  const mid = size / 2;
  const outer = size * 0.26 * scale;
  const inner = size * 0.13 * scale;
  return png(size, (x, y) => {
    const d = Math.hypot(x + 0.5 - mid, y + 0.5 - mid);
    const cover = Math.max(0, Math.min(1, Math.min(outer - d, d - inner) + 0.5));
    if (bg) return [...mix(bg, ink, cover), 255];
    return [...ink, Math.round(cover * 255)];
  }, !bg);
}

function main(argv) {
  const i = argv.indexOf('--dir');
  const dir = resolve(i >= 0 ? argv[i + 1] : join(HERE, '..'));
  const tokens = JSON.parse(readFileSync(join(dir, 'src', 'theme', 'tokens.json'), 'utf8'));
  const [accent, ink] = [rgb(tokens.colors.accent), rgb(tokens.colors.accentInk)];
  const phoneApp = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).launchwright?.template !== 'web-app';
  mkdirSync(join(dir, 'assets'), { recursive: true });
  if (phoneApp) {
    writeFileSync(join(dir, 'assets', 'icon.png'), icon(1024, { bg: accent, ink, scale: 1 }));
    writeFileSync(join(dir, 'assets', 'adaptive-icon.png'), icon(1024, { bg: null, ink, scale: 0.9 }));
  }
  writeFileSync(join(dir, 'assets', 'favicon.png'), icon(48, { bg: accent, ink, scale: 1 }));

  const appJsonPath = join(dir, 'app.json');
  const app = JSON.parse(readFileSync(appJsonPath, 'utf8'));
  if (phoneApp) {
    app.expo.icon = './assets/icon.png';
    app.expo.android = { ...app.expo.android, adaptiveIcon: { backgroundColor: tokens.colors.accent, foregroundImage: './assets/adaptive-icon.png' } };
  }
  app.expo.web = { ...app.expo.web, favicon: './assets/favicon.png' };
  writeFileSync(appJsonPath, `${JSON.stringify(app, null, 2)}\n`);
  console.log('Made the placeholder icon files in assets/ and set them in app.json.');
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv);
