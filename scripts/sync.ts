/**
 * Build-time data sync — docs/SPEC.md §5. Run: npm run sync:pubs
 *  - Crossref works by DOI (title, authors, venue, year, abstract)
 *  - BibTeX by DOI (doi.org content negotiation)
 *  - ORCID public works list → warns about works with no research page (never auto-creates)
 *  - GitHub repo stats for projects with `repo`
 * Never throws on network errors: keeps the existing cache and prints a warning.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';

const ROOT = process.cwd();
const CACHE = join(ROOT, 'src/data/cache');
const ORCID = '0009-0007-8507-3370';
// Crossref etiquette: identify the client with a contact address.
const UA = 'muja-research-site/1.0 (https://mujahidmahfuz.github.io/mujaverse/; mailto:mujahid168216@gmail.com)';
const TIMEOUT = 20_000;

mkdirSync(CACHE, { recursive: true });

type Json = Record<string, unknown>;
function readCache<T>(name: string, fallback: T): T {
  const f = join(CACHE, `${name}.json`);
  try {
    return existsSync(f) ? (JSON.parse(readFileSync(f, 'utf8')) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeCache(name: string, data: unknown): void {
  writeFileSync(join(CACHE, `${name}.json`), `${JSON.stringify(data, null, 2)}\n`);
}
function warn(msg: string): void {
  console.warn(`sync: warning: ${msg}`);
}

async function get(url: string, accept: string, extra: Record<string, string> = {}): Promise<Response | undefined> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: accept, ...extra },
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!res.ok) {
      warn(`${res.status} ${res.statusText} for ${url}`);
      return undefined;
    }
    return res;
  } catch (e) {
    warn(`${(e as Error).name}: ${(e as Error).message} for ${url}`);
    return undefined;
  }
}

function frontmatter(file: string): Json {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(file, 'utf8'));
  try {
    return (m ? parseYaml(m[1] ?? '') : {}) ?? {};
  } catch {
    return {};
  }
}
function entries(dir: string): { id: string; data: Json }[] {
  const d = join(ROOT, 'src/content', dir);
  if (!existsSync(d)) return [];
  return readdirSync(d)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => ({ id: f.replace(/\.mdx?$/, ''), data: frontmatter(join(d, f)) }));
}

const stripTags = (s: string) =>
  s
    .replace(/<jats:title>[^<]*<\/jats:title>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// ---------- Crossref + BibTeX ----------
const research = entries('research');
const dois = research.map((r) => r.data.doi).filter((d): d is string => typeof d === 'string');
const crossref = readCache<{ fetchedAt?: string; works: Record<string, Json> }>('crossref', { works: {} });
const bib = readCache<{ fetchedAt?: string; entries: Record<string, string> }>('bibtex', { entries: {} });
let crossrefOk = 0;

for (const doi of dois) {
  const key = doi.toLowerCase();
  const res = await get(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, 'application/json');
  if (res) {
    try {
      const m = ((await res.json()) as { message: Json }).message;
      const issued = (m.issued as { 'date-parts'?: number[][] } | undefined)?.['date-parts']?.[0]?.[0];
      const published = (m.published as { 'date-parts'?: number[][] } | undefined)?.['date-parts']?.[0]?.[0];
      crossref.works[key] = {
        title: ((m.title as string[]) ?? [])[0] ?? '',
        authors: ((m.author as Json[]) ?? []).map((a) => ({ given: a.given, family: a.family, name: a.name, orcid: a.ORCID })),
        venue: ((m['container-title'] as string[]) ?? [])[0],
        year: published ?? issued,
        volume: m.volume,
        issue: m.issue,
        page: m.page,
        articleNumber: m['article-number'],
        publisher: m.publisher,
        type: m.type,
        url: m.URL,
        abstract: typeof m.abstract === 'string' ? stripTags(m.abstract) : undefined,
      };
      crossrefOk++;
    } catch (e) {
      warn(`could not parse Crossref response for ${doi}: ${(e as Error).message}`);
    }
  }
  const b = await get(`https://doi.org/${doi}`, 'application/x-bibtex; charset=utf-8');
  if (b) {
    const text = (await b.text()).trim();
    if (text.startsWith('@'))
      bib.entries[key] = text
        .replace(/},\s*/g, '},\n  ')
        .replace(/^(@\w+\{[^,]+,)\s*/, '$1\n  ')
        .replace(/\s*}$/, '\n}');
  }
}
if (crossrefOk) crossref.fetchedAt = new Date().toISOString();
writeCache('crossref', crossref);
writeCache('bibtex', bib);
console.info(`sync: Crossref ${crossrefOk}/${dois.length} DOIs refreshed; BibTeX cached for ${Object.keys(bib.entries).length}`);

// ---------- ORCID ----------
const orcid = readCache<{ fetchedAt?: string; works: { title: string; doi?: string; year?: string; type?: string }[] }>('orcid', {
  works: [],
});
const ores = await get(`https://pub.orcid.org/v3.0/${ORCID}/works`, 'application/json');
if (ores) {
  try {
    const groups = ((await ores.json()) as { group?: Json[] }).group ?? [];
    orcid.works = groups.map((g) => {
      const s = ((g['work-summary'] as Json[]) ?? [])[0] ?? {};
      const ids = ((s['external-ids'] as { 'external-id'?: Json[] })?.['external-id'] ?? []) as Json[];
      const doi = ids.find((i) => String(i['external-id-type']).toLowerCase() === 'doi')?.['external-id-value'] as
        string | undefined;
      return {
        title: ((s.title as Json)?.title as Json)?.value as string,
        doi: doi?.toLowerCase(),
        year: (((s['publication-date'] as Json)?.year as Json)?.value as string) ?? undefined,
        type: s.type as string,
      };
    });
    orcid.fetchedAt = new Date().toISOString();
  } catch (e) {
    warn(`could not parse ORCID response: ${(e as Error).message}`);
  }
}
writeCache('orcid', orcid);
const known = new Set(dois.map((d) => d.toLowerCase()));
const knownTitles = new Set(research.map((r) => String(r.data.title ?? '').toLowerCase()));
for (const w of Object.values(crossref.works)) knownTitles.add(String(w.title ?? '').toLowerCase());
const norm = (t: string) =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
const normTitles = new Set([...knownTitles].map(norm));
const missing = orcid.works.filter((w) => !(w.doi && known.has(w.doi)));
for (const w of missing.filter((x) => normTitles.has(norm(x.title ?? '')))) {
  console.info(
    `sync: note: ORCID work "${w.title}" (${w.doi ?? 'no DOI'}) has the same title as an existing page — likely a preprint version`,
  );
}
console.info(`sync: ORCID lists ${orcid.works.length} works`);
for (const w of missing.filter((x) => !normTitles.has(norm(x.title ?? ''))))
  warn(
    `ORCID work has no research page: "${w.title}" (${w.year ?? 'n.d.'}${w.doi ? `, doi:${w.doi}` : ''}) — add one with /add-research`,
  );

// ---------- GitHub ----------
const repos = entries('projects')
  .map((p) => p.data.repo)
  .filter((r): r is string => typeof r === 'string');
const github = readCache<{ fetchedAt?: string; repos: Record<string, Json> }>('github', { repos: {} });
const token = process.env.GITHUB_TOKEN;
for (const repo of repos) {
  const res = await get(
    `https://api.github.com/repos/${repo}`,
    'application/vnd.github+json',
    token ? { Authorization: `Bearer ${token}` } : {},
  );
  if (!res) continue;
  const r = (await res.json()) as Json;
  github.repos[repo.toLowerCase()] = {
    stars: r.stargazers_count,
    language: r.language,
    pushedAt: r.pushed_at,
    htmlUrl: r.html_url,
    description: r.description,
  };
  github.fetchedAt = new Date().toISOString();
}
writeCache('github', github);
console.info(`sync: GitHub stats cached for ${Object.keys(github.repos).length} repo(s)`);
