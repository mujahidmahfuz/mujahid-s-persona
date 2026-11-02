import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { sitemapRoutes, firstRoute } from './helpers';

test('production build hides every TODO(muja) placeholder', async ({ page }) => {
  for (const route of sitemapRoutes()) {
    await page.goto(route);
    await expect(page.locator('[data-todo], [data-explainer-slot]')).toHaveCount(0);
    expect(await page.content()).not.toContain('TODO(muja)');
  }
});

test('private entries are not built', async ({ page }) => {
  for (const slug of [] as string[]) {
    const res = await page.goto(slug);
    expect(res?.status(), slug).toBe(404);
  }
});

test('no /quantum-cookbook route on this site; external link present', async ({ page }) => {
  const res = await page.goto('quantum-cookbook/');
  expect(res?.status()).toBe(404);
  await page.goto('projects/quantum-cookbook/');
  await expect(page.locator('a[href="https://mujahidmahfuz.github.io/quantum-cookbook/"]').first()).toBeVisible();
});

test('research page follows SPEC §4 order', async ({ page }) => {
  const route = firstRoute('research/');
  test.skip(!route, 'no research pages');
  await page.goto('research/sleep-continual-learning/');
  const ids = await page.locator('main h2[id]').evaluateAll((els) => els.map((e) => e.id));
  const order = ['tldr', 'the-problem', 'method', 'key-findings', 'limitations', 'my-role'];
  const positions = order.map((id) => ids.indexOf(id)).filter((i) => i !== -1);
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
  expect(positions.length).toBeGreaterThanOrEqual(5);
});

test('filters sync to the URL and filter cards', async ({ page }) => {
  await page.goto('research/?status=published');
  const visible = page.locator('[data-filter-scope="research"] [data-card]:visible');
  const n = await visible.count();
  for (let i = 0; i < n; i++) await expect(visible.nth(i)).toHaveAttribute('data-f-status', 'published');
  await page.getByLabel('Status').selectOption('');
  await expect(page).toHaveURL(/\/research\/$/);
});

test('every phone number and the CV PDF are absent from the site', () => {
  for (const route of sitemapRoutes()) {
    const html = readFileSync(`dist/${route}index.html`, 'utf8');
    expect(html).not.toMatch(/\b0[5789]0[-\s]?\d{4}[-\s]?\d{4}\b/);
  }
});
