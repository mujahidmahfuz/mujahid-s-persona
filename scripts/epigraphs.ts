/**
 * Fetches the text of every Quranic epigraph and verifies every literature epigraph.
 *  - Quran: api.alquran.cloud — editions quran-uthmani (Tanzil) + en.sahih (Saheeh International).
 *    Writes src/data/cache/quran.json. The basmala that the Uthmani edition prefixes to verse 1
 *    (surahs other than 1 and 9) is removed, since it is not part of that verse.
 *  - Literature: downloads the cited Project Gutenberg text and checks the quote occurs verbatim
 *    (whitespace-normalised). Writes src/data/cache/quotes-verified.json.
 * Network failures keep the existing cache (never fails the build). Run: npm run epigraphs
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { EPIGRAPHS, type LiteratureEpigraph, type QuranEpigraph } from '../src/data/epigraphs.ts';

const CACHE = join(process.cwd(), 'src/data/cache');
const QFILE = join(CACHE, 'quran.json');
const VFILE = join(CACHE, 'quotes-verified.json');
const BASMALA = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

/** Compare without diacritics (the API's mark order can differ from a typed constant). */
const bare = (t: string) => t.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '');
function stripBasmala(text: string): string {
  const words = text.split(/\s+/);
  const head = words.slice(0, 4).map(bare).join(' ');
  return head === bare(BASMALA) ? words.slice(4).join(' ') : text;
}

type Verse = { n: number; arabic: string; english: string };
type Entry = { surah: { number: number; name: string; englishName: string; englishNameTranslation: string }; verses: Verse[] };
const quran: Record<string, Entry> = existsSync(QFILE) ? JSON.parse(readFileSync(QFILE, 'utf8')) : {};
const verified: Record<string, { ok: boolean; url: string; checkedAt: string }> = existsSync(VFILE) ? JSON.parse(readFileSync(VFILE, 'utf8')) : {};

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'muja-research-site/1.0' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

function parseRef(ref: string): { s: number; from: number; to: number } {
  const m = /^(\d+):(\d+)(?:-(\d+))?$/.exec(ref);
  if (!m) throw new Error(`bad ref ${ref}`);
  return { s: Number(m[1]), from: Number(m[2]), to: Number(m[3] ?? m[2]) };
}

let fetched = 0;
for (const e of EPIGRAPHS.filter((x): x is QuranEpigraph => x.type === 'quran')) {
  if (quran[e.ref]) continue;
  const { s, from, to } = parseRef(e.ref);
  try {
    const verses: Verse[] = [];
    let surah: Entry['surah'] | undefined;
    for (let v = from; v <= to; v++) {
      const d = (await getJson(`https://api.alquran.cloud/v1/ayah/${s}:${v}/editions/quran-uthmani,en.sahih`)) as {
        data: { text: string; numberInSurah: number; edition: { identifier: string }; surah: Entry['surah'] }[];
      };
      const ar = d.data.find((x) => x.edition.identifier === 'quran-uthmani')!;
      const en = d.data.find((x) => x.edition.identifier === 'en.sahih')!;
      let arabic = ar.text.trim();
      if (v === 1 && s !== 1 && s !== 9) arabic = stripBasmala(arabic);
      verses.push({ n: ar.numberInSurah, arabic, english: en.text.trim() });
      surah = { number: ar.surah.number, name: ar.surah.name, englishName: ar.surah.englishName, englishNameTranslation: ar.surah.englishNameTranslation };
    }
    quran[e.ref] = { surah: surah!, verses };
    fetched++;
  } catch (err) {
    console.warn(`epigraphs: warning: could not fetch ${e.ref}: ${(err as Error).message}`);
  }
}
writeFileSync(QFILE, `${JSON.stringify(quran, null, 2)}\n`);

const norm = (t: string) => t.replace(/\s+/g, ' ').replace(/[’‘]/g, "'").replace(/[“”]/g, '"').trim();
for (const e of EPIGRAPHS.filter((x): x is LiteratureEpigraph => ['literature', 'philosophy', 'poetry'].includes(x.type))) {
  try {
    const res = await fetch(e.verifyUrl, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(String(res.status));
    const ok = norm((await res.text()).replace(/<[^>]*>/g, ' ')).includes(norm(e.text));
    verified[e.id] = { ok, url: e.verifyUrl, checkedAt: new Date().toISOString().slice(0, 10) };
    if (!ok) console.warn(`epigraphs: ✗ "${e.text}" NOT found in ${e.verifyUrl}`);
  } catch (err) {
    console.warn(`epigraphs: warning: could not verify ${e.id}: ${(err as Error).message} (keeping cached result)`);
  }
}
writeFileSync(VFILE, `${JSON.stringify(verified, null, 2)}\n`);

const missing = EPIGRAPHS.filter((e) => e.type === 'quran' && !quran[(e as QuranEpigraph).ref]).map((e) => e.id);
console.info(`epigraphs: ${fetched} Quran references fetched, ${Object.keys(quran).length} cached; ${Object.values(verified).filter((v) => v.ok).length}/${Object.keys(verified).length} quotations verified${missing.length ? `; MISSING: ${missing.join(', ')}` : ''}`);
