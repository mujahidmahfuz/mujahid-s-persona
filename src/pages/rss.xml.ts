import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '~/lib/site';
import { withBase } from '~/lib/paths';

export function GET(context: APIContext) {
  return rss({
    title: `${SITE.name} — Notes`,
    description: 'Research notes',
    site: new URL(withBase('/'), context.site).href,
    items: [],
  });
}
