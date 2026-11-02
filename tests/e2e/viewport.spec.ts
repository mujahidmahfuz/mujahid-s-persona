import { test, expect } from '@playwright/test';
import { sitemapRoutes } from './helpers';

const VIEWPORTS = [
  { width: 360, height: 800 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];
const routes = sitemapRoutes();

for (const vp of VIEWPORTS) {
  test(`no horizontal scroll at ${vp.width}px`, async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize(vp);
    const offenders: string[] = [];
    for (const route of routes) {
      await page.goto(route);
      const ok = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
      if (!ok) offenders.push(route);
    }
    expect(offenders).toEqual([]);
  });
}
