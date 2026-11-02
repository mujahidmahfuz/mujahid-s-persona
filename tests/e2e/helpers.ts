import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BASE = (process.env.SITE_BASE ?? '/mujahid-s-persona').replace(/\/+$/, '');

/** All routes from the built sitemap, as paths relative to the base (e.g. "research/bwa/"). */
export function sitemapRoutes(): string[] {
  const dist = join(process.cwd(), 'dist');
  if (!existsSync(dist)) throw new Error('Run `npm run build` before e2e tests');
  const files = readdirSync(dist).filter((f) => /^sitemap-\d+\.xml$/.test(f));
  const urls = files.flatMap((f) =>
    [...readFileSync(join(dist, f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1] ?? ''),
  );
  return urls.map((u) => new URL(u).pathname.slice(BASE.length + 1));
}

export function firstRoute(prefix: string): string | undefined {
  return sitemapRoutes().find((r) => r.startsWith(prefix) && r !== prefix);
}

export const KEY_PAGES = (): string[] =>
  ['', 'research/', firstRoute('research/'), firstRoute('projects/'), 'sports/'].filter((r): r is string => r !== undefined);

/** Routes of content entries marked `private: true` (they must not be built). */
export function privateRoutes(): string[] {
  return ['research', 'projects'].flatMap((section) => {
    const dir = join(process.cwd(), 'src/content', section);
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((f) => /\.mdx?$/.test(f) && /^private:\s*true\s*$/m.test(readFileSync(join(dir, f), 'utf8')))
      .map((f) => `${section}/${f.replace(/\.mdx?$/, '')}/`);
  });
}
