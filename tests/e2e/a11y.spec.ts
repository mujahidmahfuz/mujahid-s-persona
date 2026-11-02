import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { KEY_PAGES } from './helpers';

for (const route of KEY_PAGES()) {
  test(`axe: 0 violations on /${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
    expect(summary).toEqual([]);
  });
}
