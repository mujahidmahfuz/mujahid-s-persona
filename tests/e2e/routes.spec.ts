import { test, expect } from '@playwright/test';
import { sitemapRoutes } from './helpers';

const routes = sitemapRoutes();

test('sitemap is not empty', () => {
  expect(routes.length).toBeGreaterThan(5);
});

for (const route of routes) {
  test(`200 + one <h1>: /${route}`, async ({ page }) => {
    const res = await page.goto(route);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
  });
}

test('404 page is branded', async ({ page }) => {
  const res = await page.goto('this-page-does-not-exist/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText(/does not exist/);
});
