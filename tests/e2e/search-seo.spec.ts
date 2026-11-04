import { test, expect } from '@playwright/test';
import { existsSync } from 'node:fs';
import { sitemapRoutes } from './helpers';

test('Ctrl+K opens search and finds a research page', async ({ page }) => {
  await page.goto('');
  await page.keyboard.press('Control+k');
  const dialog = page.locator('[data-search-dialog]');
  await expect(dialog).toBeVisible();
  const input = dialog.locator('input').first();
  await expect(input).toBeVisible({ timeout: 10_000 });
  await input.fill('Wasserstein');
  await expect(dialog.locator('.pagefind-ui__result-link').first()).toBeVisible({ timeout: 10_000 });
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('every page has canonical, description and an OG image that exists', async ({ page }) => {
  test.setTimeout(240_000);
  for (const route of sitemapRoutes()) {
    await page.goto(route);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    expect((await page.locator('meta[name="description"]').getAttribute('content'))?.length).toBeGreaterThan(20);
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    const path = new URL(og!).pathname.replace(/^\/mujaverse/, '');
    expect(existsSync(`dist${path}`), `${route} → ${path}`).toBe(true);
  }
});

test('home has Person JSON-LD; robots.txt and RSS exist', async ({ page, request }) => {
  await page.goto('');
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.map((t) => JSON.parse(t)['@type'])).toContain('Person');
  expect((await request.get('robots.txt')).status()).toBe(200);
  expect((await request.get('rss.xml')).status()).toBe(200);
});

test('/search/ loads Pagefind on demand and shows results', async ({ page }) => {
  await page.goto('search/');
  await page.getByLabel('Search terms').fill('soccer');
  await expect(page.locator('.pagefind-ui__result-link').first()).toBeVisible({ timeout: 10_000 });
});
