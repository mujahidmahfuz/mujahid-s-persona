#!/usr/bin/env node
/** Screenshots routes from a running preview server: node scripts/screenshot.mjs <outDir> <route>... */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const [, , out = 'screenshots', ...routes] = process.argv;
const base = `http://localhost:${process.env.PORT ?? 4321}${process.env.SITE_BASE ?? '/mujaverse'}/`;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const [w, h] of [
  [1440, 900],
  [360, 800],
]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  for (const r of routes) {
    await page.goto(base + r, { waitUntil: 'networkidle' });
    // scroll through once so scroll-reveals fire, as they would for a reader
    for (let y = 0; y < 12000; y += 400) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(70);
    }
    await page.waitForTimeout(900);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${out}/${r.replace(/\//g, '_') || 'home'}-${w}.png`, fullPage: true });
  }
}
await browser.close();
console.log(`screenshots written to ${out}`);
