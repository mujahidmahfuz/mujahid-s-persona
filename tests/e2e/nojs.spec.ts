import { test, expect } from '@playwright/test';

test.use({ javaScriptEnabled: false });

test('without JS: text is readable and nav works', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('');
  await expect(page.locator('h1')).toBeVisible();
  await page.locator('nav[aria-label="Main"]').getByRole('link', { name: 'Research' }).click();
  await expect(page).toHaveURL(/\/research\/$/);
  await expect(page.locator('h1')).toBeVisible();
});

test('without JS: mobile menu opens (details/summary)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('');
  await page.locator('[data-mobile-nav] summary').click();
  await expect(page.locator('nav[aria-label="Main (mobile)"]').getByRole('link', { name: 'Projects' })).toBeVisible();
});

for (const route of ['research/', 'projects/', 'videos/']) {
  test(`without JS: filters show all items on /${route}`, async ({ page }) => {
    await page.goto(`${route}?status=__none__`);
    const cards = page.locator('[data-card]');
    const total = await cards.count();
    for (let i = 0; i < total; i++) await expect(cards.nth(i)).toBeVisible();
  });
}
