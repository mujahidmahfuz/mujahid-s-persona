import { test, expect } from '@playwright/test';
import { sitemapRoutes } from './helpers';

test('every page has exactly one epigraph, and Quranic Arabic is marked up as Arabic', async ({ page }) => {
  test.setTimeout(240_000);
  for (const route of sitemapRoutes()) {
    await page.goto(route);
    const ep = page.locator('[data-epigraph]');
    await expect(ep, route).toHaveCount(1);
    const ar = ep.locator('[lang="ar"]');
    if ((await ar.count()) > 0) {
      await expect(ar).toHaveAttribute('dir', 'rtl');
      await expect(ep.locator('figcaption')).toContainText(/Surah .+\d+:\d+/);
      await expect(ep.locator('figcaption')).toContainText('Saheeh International');
    }
  }
});

test('the 404 page has its own epigraph', async ({ page }) => {
  await page.goto('no-such-page/');
  await expect(page.locator('[data-epigraph="404"]')).toHaveCount(1);
});
