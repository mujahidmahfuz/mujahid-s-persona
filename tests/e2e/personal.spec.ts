import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('video facade: no request to YouTube domains until play is pressed', async ({ page }) => {
  const yt: string[] = [];
  await page.route(/youtube|ytimg|googlevideo/, (route) => {
    yt.push(route.request().url());
    return route.abort();
  });
  await page.goto('styleguide/');
  const facade = page.locator('[data-video-facade]').first();
  await facade.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  expect(yt).toEqual([]);
  await facade.getByRole('button', { name: /Play video/ }).press('Enter');
  await expect(facade.locator('iframe')).toHaveAttribute('src', /youtube-nocookie\.com\/embed\//);
  await expect.poll(() => yt.length).toBeGreaterThan(0);
});

test('contact: email is assembled client-side and absent from the HTML', async ({ page }) => {
  const html = readFileSync('dist/contact/index.html', 'utf8');
  expect(html).not.toMatch(/mujahid168216@gmail\.com/);
  expect(html).not.toMatch(/mailto:[a-z0-9]/i);
  await page.goto('contact/');
  await expect(page.locator('[data-email] a')).toHaveAttribute('href', /^mailto:.+@.+/);
});

test('CV page links to a PDF that exists', async ({ page }) => {
  await page.goto('cv/');
  const href = await page.getByRole('link', { name: 'Download PDF' }).getAttribute('href');
  const res = await page.request.get(href!);
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('pdf');
});
