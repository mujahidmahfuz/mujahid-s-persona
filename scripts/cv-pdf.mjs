#!/usr/bin/env node
/**
 * Renders dist/cv/index.html to dist/cv.pdf with Playwright (Phase 5). Serves dist/ under the
 * site base path on a throwaway local server so absolute asset URLs resolve.
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { chromium } from '@playwright/test';

const DIST = join(process.cwd(), 'dist');
const BASE = (process.env.SITE_BASE ?? '/mujahid-s-persona').replace(/\/+$/, '');
const TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.json': 'application/json',
};

const server = createServer((req, res) => {
  let p = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (!p.startsWith(BASE + '/')) return res.writeHead(404).end();
  p = normalize(p.slice(BASE.length)).replace(/^(\.\.[/\\])+/, '');
  let f = join(DIST, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) return res.writeHead(404).end();
  res.writeHead(200, { 'Content-Type': TYPES[extname(f)] ?? 'application/octet-stream' });
  createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const { port } = server.address();

try {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}${BASE}/cv/`, { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: join(DIST, 'cv.pdf'),
    format: 'Letter',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  });
  await browser.close();
  console.info(`cv-pdf: ✓ dist/cv.pdf (${Math.round(statSync(join(DIST, 'cv.pdf')).size / 1024)} KB)`);
} catch (e) {
  console.error(`cv-pdf: ✗ ${e.message}\n  Install Chromium with: npx playwright install chromium`);
  process.exitCode = 1;
} finally {
  server.close();
}
