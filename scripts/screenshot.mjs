#!/usr/bin/env node
/** Screenshots routes from a running preview server: node scripts/screenshot.mjs <outDir> <route>... */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const [, , out = 'screenshots', ...routes] = process.argv;
const base = `http://localhost:${process.env.PORT ?? 4321}${process.env.SITE_BASE ?? '/mujahid-s-persona'}/`;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const [w, h] of [
  [1440, 900],
  [360, 800],
]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  for (const r of routes) {
    await page.goto(base + r);
    await page.screenshot({ path: `${out}/${r.replace(/\//g, '_') || 'home'}-${w}.png`, fullPage: true });
  }
}
await browser.close();
console.log(`screenshots written to ${out}`);
