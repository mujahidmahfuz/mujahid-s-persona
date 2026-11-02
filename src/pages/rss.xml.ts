import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublic } from '~/lib/content';
import { SITE } from '~/lib/site';
import { entryPath, withBase } from '~/lib/paths';

export async function GET(context: APIContext) {
  const notes = (await getPublic('notes')).sort((a, b) => b.data.date.localeCompare(a.data.date));
  return rss({
    title: `${SITE.name} — Notes`,
    description: 'Research notes',
    site: new URL(withBase('/'), context.site).href,
    items: notes.map((n) => ({
      title: n.data.title,
      description: n.data.summary,
      pubDate: new Date(n.data.date),
      link: new URL(entryPath(n), context.site).href,
      categories: n.data.tags,
    })),
  });
}
