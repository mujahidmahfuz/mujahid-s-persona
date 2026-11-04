import { test, expect } from '@playwright/test';

test('tapping a card flips it to a summary with "Read more →", Escape flips back', async ({ page }) => {
  await page.goto('research/');
  const card = page.locator('[data-filter-scope="research"] [data-card][data-flippable]').first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await card.click({ force: true });
  await expect(card).toHaveClass(/is-flipped/);
  const back = card.locator('[data-flip-back]');
  await expect(back).toBeFocused();
  await expect(back.getByRole('link', { name: /Read more/ })).toHaveAttribute('href', /\/research\/.+\//);
  await expect(card.locator('[data-flip-toggle]')).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(card).not.toHaveClass(/is-flipped/);
  await expect(card.locator('[data-flip-toggle]')).toBeFocused();
});

test('clicking anywhere on the back turns the card over again (no "Flip back" button)', async ({ page }) => {
  await page.goto('research/');
  const card = page.locator('[data-filter-scope="research"] [data-card][data-flippable]').first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await card.click({ force: true });
  await expect(card).toHaveClass(/is-flipped/);
  await expect(card.getByRole('button', { name: /Flip back/ })).toHaveCount(0);
  await page.waitForTimeout(700); // let the turn finish
  await card.locator('[data-flip-back]').click({ position: { x: 30, y: 30 } });
  await expect(card).not.toHaveClass(/is-flipped/);
  await expect(card.locator('[data-flip-toggle]')).toBeFocused();
});

test.describe('without JS', () => {
  test.use({ javaScriptEnabled: false });
  test('cards show their summary and a title link', async ({ page }) => {
    await page.goto('research/');
    const card = page.locator('[data-filter-scope="research"] [data-card]').first();
    await expect(card.locator('[data-flip-toggle]')).toBeHidden();
    await expect(card.locator('[data-flip-front] p.text-muted').first()).toBeVisible();
    await expect(card.getByRole('heading').getByRole('link')).toBeVisible();
  });
});
