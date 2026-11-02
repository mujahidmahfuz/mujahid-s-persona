/**
 * Generates src/explainers/<id>/poster.png (1200×900, 4:3) for every explainer — EXPLAINERS §1.
 * Starts `astro dev` in the foreground on a spare port, screenshots /explainer-preview/<id>/,
 * waits for the island to report ready, then stops the server.
 * Run: npm run posters [-- <id> ...]
 */
import { spawn } from 'node:child_process';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const PORT = 4329;
const BASE = (process.env.SITE_BASE ?? '/mujahid-s-persona').replace(/\/+$/, '');
const dir = join(process.cwd(), 'src/explainers');
const only = process.argv.slice(2);
const ids = readdirSync(dir).filter((d) => existsSync(join(dir, d, 'meta.ts')) && (only.length === 0 || only.includes(d)));

const server = spawn('npx', ['astro', 'dev', '--port', String(PORT)], {
  env: { ...process.env, ASTRO_DEV_BACKGROUND: '0' },
  stdio: 'ignore',
  detached: true,
});
const url = `http://localhost:${PORT}${BASE}/explainer-preview/`;
async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://localhost:${PORT}${BASE}/`);
      if (r.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('astro dev did not start');
}

try {
  await waitForServer();
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
  for (const id of ids) {
    // ?poster → explainers render their final step with no autoplay (see shared/useStepper.ts).
    await page.goto(`${url}${id}/?poster`);
    await page.waitForSelector('[data-island-ready]', { timeout: 30_000 });
    await page.waitForTimeout(800);
    await page.locator(`[data-explainer="${id}"]`).screenshot({ path: join(dir, id, 'poster.png') });
    console.info(`posters: ✓ ${id}`);
  }
  await browser.close();
} finally {
  // Kill the whole process group (npx → astro), otherwise the dev server outlives us.
  if (server.pid) process.kill(-server.pid, 'SIGTERM');
}
