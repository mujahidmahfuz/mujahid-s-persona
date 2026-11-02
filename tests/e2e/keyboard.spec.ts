import { test, expect } from '@playwright/test';

test('Tab reaches skip link, then nav, and skip link moves focus to main', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  const outline = await skip.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe('none');

  // Next stops: site name, then the main navigation.
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const inNav = await page.evaluate(() => !!document.activeElement?.closest('nav[aria-label="Main"]'));
  expect(inNav).toBe(true);
  const ring = await page.evaluate(() => getComputedStyle(document.activeElement as Element).outlineStyle);
  expect(ring).not.toBe('none');

  await page.goto('');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('main#main')).toBeFocused();
});
