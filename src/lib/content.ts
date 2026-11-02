/**
 * Content access layer. Every page reads collections through these helpers so that
 * private entries, production placeholders and Crossref merges are handled in one place.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { IS_PROD, isTodo } from './todo';
import { MY_NAME_PATTERNS } from './site';

// ---------- cached build-time data (SPEC §5) ----------
type CrossrefWork = {
  title: string;
  authors: { given?: string; family?: string; name?: string }[];
  venue?: string;
  year?: number;
  volume?: string;
  issue?: string;
  page?: string;
  articleNumber?: string;
  publisher?: string;
  abstract?: string;
  type?: string;
  url?: string;
};
type GithubRepo = { stars: number; language: string | null; pushedAt: string; htmlUrl: string; description: string | null };

const cacheFiles = import.meta.glob<{ default: unknown }>('../data/cache/*.json', { eager: true });
function cache<T>(name: string): T | undefined {
  const mod = cacheFiles[`../data/cache/${name}.json`];
  return mod?.default as T | undefined;
}
export const crossref = (doi: string): CrossrefWork | undefined =>
  cache<{ works: Record<string, CrossrefWork> }>('crossref')?.works?.[doi.toLowerCase()];
export const bibtex = (doi: string): string | undefined =>
  cache<{ entries: Record<string, string> }>('bibtex')?.entries?.[doi.toLowerCase()];
export const githubRepo = (repo: string): GithubRepo | undefined =>
  cache<{ repos: Record<string, GithubRepo> }>('github')?.repos?.[repo.toLowerCase()];

// ---------- collections ----------
type Name =
  'research' | 'projects' | 'experience' | 'awards' | 'sports' | 'videos' | 'notes' | 'education' | 'talks' | 'publications';

/**
 * Public entries: never `private: true`; notes never `draft` in production;
 * research/projects whose summary is still a placeholder are dropped in production (SPEC §7).
 */
const contentFiles = Object.keys(import.meta.glob('/src/content/**/*.{md,mdx,yaml,yml,json}'));
const hasFiles = (name: Name) => contentFiles.some((f) => f.startsWith(`/src/content/${name}/`));

export async function getPublic<C extends Name>(name: C): Promise<CollectionEntry<C>[]> {
  // Querying an empty collection makes Astro warn; an empty folder simply has no entries.
  if (!hasFiles(name)) return [];
  const all = await getCollection(name);
  return all.filter((e) => {
    const d = e.data as Record<string, unknown>;
    if (d.private === true) return false;
    if (name === 'notes' && IS_PROD && d.draft === true) return false;
    if ((name === 'research' || name === 'projects') && IS_PROD && isTodo(d.summary)) return false;
    return true;
  }) as CollectionEntry<C>[];
}

export type Research = CollectionEntry<'research'> & { cite: Citation };
export type Citation = {
  title: string;
  authors: string[];
  venue?: string | undefined;
  year?: number | undefined;
  volume?: string | undefined;
  issue?: string | undefined;
  pages?: string | undefined;
  doi?: string | undefined;
  abstract?: string | undefined;
  fromCrossref: boolean;
};

function authorName(a: { given?: string; family?: string; name?: string }): string {
  if (a.name) return a.name;
  return [a.given, a.family].filter(Boolean).join(' ');
}

/** Crossref wins over frontmatter for title, authors, venue and year (SPEC §3). */
export function citationFor(entry: CollectionEntry<'research'>): Citation {
  const d = entry.data;
  const cr = d.doi ? crossref(d.doi) : undefined;
  if (cr) {
    return {
      title: cr.title,
      authors: cr.authors.map(authorName),
      venue: cr.venue,
      year: cr.year,
      volume: cr.volume,
      issue: cr.issue,
      pages: cr.page ?? cr.articleNumber,
      doi: d.doi,
      abstract: cr.abstract,
      fromCrossref: true,
    };
  }
  return {
    title: d.title,
    authors: d.authors ?? [],
    venue: isTodo(d.venue) ? undefined : d.venue,
    year: d.year,
    doi: d.doi,
    fromCrossref: false,
  };
}

export async function getResearch(): Promise<Research[]> {
  const list = await getPublic('research');
  return list.map((e) => {
    const cite = citationFor(e);
    return { ...e, cite, data: { ...e.data, title: cite.title } };
  });
}

/**
 * Bold Muja's name: matches "Md Mujahidul Islam", "Mujahidul Islam", "Islam, Md Mujahidul",
 * "M. Islam", "Md. M. Islam" (case-insensitive, whitespace-normalised). See MY_NAME_PATTERNS.
 */
export function isMe(author: string): boolean {
  const n = author.replace(/\s+/g, ' ').trim();
  return MY_NAME_PATTERNS.some((re) => re.test(n));
}

// ---------- dates ----------
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026" → "2026", "2026-04" → "Apr 2026", "2026-04-15" → "15 Apr 2026"; placeholder → undefined. */
export function formatDate(d: string | undefined): string | undefined {
  if (!d || isTodo(d)) return undefined;
  const [y, m, day] = d.split('-');
  if (!m) return y;
  const mon = MONTHS[Number(m) - 1];
  return day ? `${Number(day)} ${mon} ${y}` : `${mon} ${y}`;
}

export function formatRange(start: string | undefined, end: string | undefined, ongoing = 'Present'): string | undefined {
  const s = formatDate(start);
  const e = end === undefined ? ongoing : formatDate(end);
  if (!s && !e) return undefined;
  if (!s) return e;
  return `${s} – ${e ?? '…'}`;
}

/** Sort key: placeholder / missing dates sort last. */
export function dateKey(d: string | undefined): string {
  return !d || isTodo(d) ? '0000' : d;
}

export function yearOf(d: string | undefined): string | undefined {
  return !d || isTodo(d) ? undefined : d.slice(0, 4);
}

// ---------- related items ----------
type Relatable = { collection: string; id: string; data: { areas?: string[]; tags?: string[] } };

/** Up to `max` items sharing areas/tags (areas weigh 1, tags weigh 2), stable by id. */
export function related<T extends Relatable>(entry: Relatable, pool: T[], max = 3): T[] {
  const areas = new Set(entry.data.areas ?? []);
  const tags = new Set(entry.data.tags ?? []);
  return pool
    .filter((p) => !(p.collection === entry.collection && p.id === entry.id))
    .map((p) => ({
      p,
      score: (p.data.areas ?? []).filter((a) => areas.has(a)).length + 2 * (p.data.tags ?? []).filter((t) => tags.has(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.p.id.localeCompare(b.p.id))
    .slice(0, max)
    .map((x) => x.p);
}

export const AREA_LABEL: Record<string, string> = {
  xai: 'Explainable AI',
  'machine-learning': 'Machine learning',
  'continual-learning': 'Continual learning',
  'quantum-computing': 'Quantum computing',
  'quantum-networking': 'Quantum networking',
  'quantum-sensing': 'Quantum sensing',
  'medical-ai': 'Medical AI',
  'computational-biology': 'Computational biology',
  neuromorphic: 'Neuromorphic computing',
  'cognitive-science': 'Cognitive science',
  cryptography: 'Cryptography',
  optimization: 'Optimisation',
  hci: 'Human-computer interaction',
  systems: 'Systems',
};

export const KIND_LABEL: Record<string, string> = {
  'journal-article': 'Journal article',
  'conference-paper': 'Conference paper',
  preprint: 'Preprint',
  'technical-report': 'Technical report',
  thesis: 'Thesis',
  study: 'Study',
};

export const CATEGORY_LABEL: Record<string, string> = {
  software: 'Software',
  'mobile-app': 'Mobile app',
  hardware: 'Hardware',
  'research-tool': 'Research tool',
  education: 'Education',
  competition: 'Competition',
  platform: 'Platform',
};
