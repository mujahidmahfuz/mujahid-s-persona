import { test, expect, type Page } from '@playwright/test';
import { gzipSync } from 'node:zlib';
import { sitemapRoutes } from './helpers';

/** Gzipped bytes of every script loaded so far (SPEC §8: ≤ 15 KB before scrolling). */
async function jsBytes(page: Page, route: string): Promise<number> {
  // Intercepting requests disables the HTTP cache, so every page is measured with a full download
  // (a cached shared chunk would come back as a 304 with no body).
  await page.route('**/*', (r) => r.continue());
  const bodies: Promise<Buffer>[] = [];
  page.on('response', (r) => {
    if (r.request().resourceType() === 'script') bodies.push(r.body());
  });
  await page.goto(route, { waitUntil: 'networkidle' });
  const inline = await page.evaluate(() =>
    [...document.querySelectorAll('script:not([src])')].map((s) => s.textContent ?? '').join('\n'),
  );
  const all = [...(await Promise.all(bodies)), Buffer.from(inline)];
  return all.reduce((n, b) => n + gzipSync(b).length, 0);
}

test('pages without explainers ship ≤ 15 KB gzipped JS', async ({ page }) => {
  test.setTimeout(180_000);
  const over: string[] = [];
  for (const route of sitemapRoutes()) {
    const bytes = await jsBytes(page, route);
    if (bytes > 15 * 1024) over.push(`${route}: ${bytes} B`);
  }
  expect(over).toEqual([]);
});

test('page with a 3D explainer ships ≤ 15 KB gzipped JS before scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const bytes = await jsBytes(page, 'styleguide/');
  expect(bytes).toBeLessThanOrEqual(15 * 1024);
});
