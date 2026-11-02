import { test, expect } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';

function password(): string | undefined {
  if (process.env.VAULT_PASSWORD) return process.env.VAULT_PASSWORD;
  if (!existsSync('.env.local')) return undefined;
  return /^VAULT_PASSWORD=(.+)$/m.exec(readFileSync('.env.local', 'utf8'))?.[1]?.trim();
}

test('vault is noindex, out of the sitemap, and rejects a wrong password', async ({ page }) => {
  await page.goto('vault/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  expect(readFileSync('dist/sitemap-0.xml', 'utf8')).not.toContain('/vault/');
  await page.getByLabel('Password').fill('definitely-not-it');
  await page.getByRole('button', { name: 'Unlock' }).click();
  await expect(page.locator('[data-vault-error]')).toHaveText('Wrong password.', { timeout: 15_000 });
  await expect(page.locator('[data-vault-app]')).toBeHidden();
});

test('vault unlocks with the right password and filters items', async ({ page }) => {
  const pw = password();
  test.skip(!pw, 'VAULT_PASSWORD not available (CI)');
  await page.goto('vault/');
  await page.getByLabel('Password').fill(pw!);
  await page.getByRole('button', { name: 'Unlock' }).click();
  await expect(page.locator('[data-vault-app]')).toBeVisible({ timeout: 15_000 });
  const total = await page.locator('[data-vault-list] details').count();
  expect(total).toBeGreaterThan(0);
  await page.locator('[data-vf="visibility"]').selectOption('private');
  const priv = await page.locator('[data-vault-list] details').count();
  expect(priv).toBeLessThanOrEqual(total);
  await page.getByRole('button', { name: 'Lock' }).click();
  await expect(page.locator('[data-vault-app]')).toBeHidden();
});
