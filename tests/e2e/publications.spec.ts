import { test, expect } from '@playwright/test';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test('publications: Crossref metadata, bold name, copy BibTeX announces "Copied"', async ({ page }) => {
  await page.goto('publications/');
  await expect(page.locator('[data-citation]').first()).toBeVisible();
  await expect(page.locator('[data-citation] strong').first()).toHaveText(/Islam/);
  const btn = page.getByRole('button', { name: 'Copy BibTeX' }).first();
  // layout width (offsetWidth), not the visual box — the paper tilts slightly under the pointer
  const before = await btn.evaluate((el) => (el as HTMLElement).offsetWidth);
  await btn.click();
  await expect(page.locator('[data-copy-status]').first()).toHaveText(/copied/i);
  const after = await page
    .locator('[data-copy-target]')
    .first()
    .evaluate((el) => (el as HTMLElement).offsetWidth);
  expect(after).toBe(before);
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip).toMatch(/^@article\{/);
});

test('research page with DOI has ScholarlyArticle JSON-LD', async ({ page }) => {
  await page.goto('research/bwa-bootstrap-wasserstein-alignment/');
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.some((t) => JSON.parse(t)['@type'] === 'ScholarlyArticle')).toBe(true);
});
