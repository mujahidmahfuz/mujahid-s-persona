/**
 * Every internal link goes through withBase() (CLAUDE.md rule 14) so the site works
 * at https://mujahidmahfuz.github.io/mujaverse/ today and at a root domain later.
 */
const RAW_BASE: string = import.meta.env.BASE_URL ?? '/';
const BASE = RAW_BASE.replace(/\/+$/, '');

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

export function withBase(path: string = '/'): string {
  if (EXTERNAL.test(path)) return path;
  const match = /^([^?#]*)(.*)$/.exec(path);
  let pathname = match?.[1] ?? '';
  const suffix = match?.[2] ?? '';
  if (!pathname.startsWith('/')) pathname = `/${pathname}`;
  const isFile = /\.[a-z0-9]+$/i.test(pathname);
  if (!isFile && !pathname.endsWith('/')) pathname = `${pathname}/`;
  return `${BASE}${pathname}${suffix}`;
}

/** Strips the base so we can compare the current route with nav items. */
export function stripBase(pathname: string): string {
  if (BASE && pathname.startsWith(BASE)) {
    const rest = pathname.slice(BASE.length);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }
  return pathname;
}

export type CollectionName =
  'research' | 'projects' | 'publications' | 'education' | 'experience' | 'awards' | 'sports' | 'videos' | 'talks' | 'notes';

/** Route prefix for each collection that has detail pages. */
const ROUTE: Partial<Record<CollectionName, string>> = {
  research: 'research',
  projects: 'projects',
  experience: 'experience',
  awards: 'achievements',
  sports: 'sports',
  videos: 'videos',
  notes: 'notes',
};

/** The one helper used everywhere for an entry's URL (QUALITY-GATES §4: entry.id, never entry.slug). */
export function entryPath(entry: { collection: string; id: string }): string {
  const prefix = ROUTE[entry.collection as CollectionName];
  if (!prefix) return withBase('/');
  return withBase(`/${prefix}/${entry.id}/`);
}

export function topicPath(tag: string): string {
  return withBase(`/topics/${tag}/`);
}
