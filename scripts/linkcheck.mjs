#!/usr/bin/env node
/**
 * Link check on dist/ (QUALITY-GATES §1.7). Internal links are resolved against the built
 * files, honouring the site base path; broken internal links fail. External links are only
 * checked with --external, and failures there are warnings.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const BASE = (process.env.SITE_BASE ?? '/mujahid-s-persona').replace(/\/+$/, '');
const SITE = 'https://mujahidmahfuz.github.io';
const checkExternal = process.argv.includes('--external');

if (!existsSync(DIST)) {
  console.error('linkcheck: dist/ not found — run the build first');
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const htmlFiles = walk(DIST).filter((f) => f.endsWith('.html'));
const broken = [];
const external = new Map();
const ATTR = /\s(?:href|src|poster)=["']([^"']+)["']|\ssrcset=["']([^"']+)["']/g;

function resolveInternal(url) {
  let path = decodeURIComponent(url.split(/[?#]/)[0] ?? '');
  if (!path.startsWith(`${BASE}/`) && path !== BASE) return { ok: false, reason: `missing base path ${BASE}` };
  path = path.slice(BASE.length) || '/';
  const target = join(DIST, path);
  if (path.endsWith('/')) return { ok: existsSync(join(target, 'index.html')) };
  if (existsSync(target) && statSync(target).isFile()) return { ok: true };
  return { ok: existsSync(join(target, 'index.html')) || existsSync(`${target}.html`) };
}

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
  const page = '/' + relative(DIST, file).replace(/index\.html$/, '');
  for (const m of html.matchAll(ATTR)) {
    const urls = m[1] ? [m[1]] : (m[2] ?? '').split(',').map((s) => s.trim().split(/\s+/)[0] ?? '');
    for (let url of urls) {
      if (!url || url.startsWith('#') || /^(mailto|tel|data|javascript):/.test(url)) continue;
      url = url.replace(/&amp;/g, '&');
      if (url.startsWith(SITE + BASE + '/')) url = url.slice(SITE.length);
      if (/^https?:\/\//.test(url) || url.startsWith('//')) {
        if (!external.has(url)) external.set(url, page);
        continue;
      }
      if (!url.startsWith('/')) continue; // relative asset URLs are rare; Astro emits absolute ones
      const r = resolveInternal(url);
      if (!r.ok) broken.push(`${page} → ${url}${r.reason ? ` (${r.reason})` : ''}`);
    }
  }
}

if (checkExternal) {
  let bad = 0;
  for (const [url, page] of external) {
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(10000) });
      if (res.status >= 400 && res.status !== 405 && res.status !== 403 && res.status !== 999) {
        console.warn(`linkcheck: warning: ${res.status} ${url} (on ${page})`);
        bad++;
      }
    } catch (e) {
      console.warn(`linkcheck: warning: ${e.name} ${url} (on ${page})`);
      bad++;
    }
  }
  console.info(`linkcheck: ${external.size} external links checked, ${bad} warning(s)`);
}

if (broken.length) {
  for (const b of broken) console.error(`linkcheck: ✗ ${b}`);
  console.error(`linkcheck: ${broken.length} broken internal link(s)`);
  process.exit(1);
}
console.log(
  `linkcheck: ✓ ${htmlFiles.length} pages, no broken internal links (${external.size} external links not fetched${checkExternal ? ' — see above' : ''})`,
);
