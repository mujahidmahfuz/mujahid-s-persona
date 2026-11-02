import { test, expect } from '@playwright/test';

test('poster shows first; island hydrates only when scrolled into view', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('styleguide/');
  const fig = page.locator('[data-explainer="demo-lattice-3d"]');
  await expect(fig.locator('[data-poster]')).toHaveCount(1);
  await expect(fig.locator('canvas')).toHaveCount(0);
  await fig.scrollIntoViewIfNeeded();
  await expect(fig).toHaveAttribute('data-island-ready', '', { timeout: 20_000 });
  await expect(fig.locator('canvas')).toHaveCount(1);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('3D canvas is not mounted and the poster remains', async ({ page }) => {
    await page.goto('styleguide/');
    const fig = page.locator('[data-explainer="demo-lattice-3d"]');
    await fig.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2500);
    await expect(fig.locator('canvas')).toHaveCount(0);
    await expect(fig.locator('[data-poster]')).toBeVisible();
    // Static 2D explainers are still interactive under reduced motion.
    await page.locator('[data-explainer="demo-toy-2d"]').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-explainer="demo-toy-2d"]')).toHaveAttribute('data-island-ready', '', { timeout: 20_000 });
  });
});

test('2D explainer controls work from the keyboard and announce values', async ({ page }) => {
  await page.goto('styleguide/');
  const fig = page.locator('[data-explainer="demo-toy-2d"]');
  await fig.scrollIntoViewIfNeeded();
  await expect(fig).toHaveAttribute('data-island-ready', '', { timeout: 20_000 });
  const slider = fig.getByRole('slider', { name: /Window/ });
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(fig.locator('output[aria-live="polite"]')).toHaveText('6 points');
});

test('explainer frame has text description and illustrative label', async ({ page }) => {
  await page.goto('styleguide/');
  const fig = page.locator('[data-explainer="demo-toy-2d"]');
  await expect(fig.locator('[data-illustrative]')).toContainText('Illustrative example');
  await expect(fig.locator('[data-explainer-box]')).toHaveAttribute('aria-describedby', /explainer-desc/);
});
