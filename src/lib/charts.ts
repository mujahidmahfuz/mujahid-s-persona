/**
 * Chart data computed from the content collections at build time — every number on a chart is a
 * count or a date taken from the content files, so the charts update themselves when content changes.
 */
import { getPublic, getResearch, AREA_LABEL, CATEGORY_LABEL, formatDate, formatRange } from './content';
import { entryPath, withBase } from './paths';
import { isTodo } from './todo';

export interface BarItem {
  label: string;
  value: number;
  href?: string | undefined;
}

const STATUS_ORDER = [
  'concept',
  'in-progress',
  'prototype',
  'in-preparation',
  'under-review',
  'accepted',
  'published',
  'archived',
] as const;
const STATUS_LABEL: Record<string, string> = {
  concept: 'Concept',
  'in-progress': 'In progress',
  prototype: 'Prototype',
  'in-preparation': 'In preparation',
  'under-review': 'Under review',
  accepted: 'Accepted',
  published: 'Published',
  archived: 'Archived',
};

async function work() {
  return [...(await getResearch()), ...(await getPublic('projects'))];
}

/** Research + projects per area, largest first; the long tail folds into "Other" (dataviz: no 15-row lists). */
export async function areaCounts(top = 6): Promise<BarItem[]> {
  const counts = new Map<string, number>();
  for (const e of await work()) for (const a of e.data.areas) counts.set(a, (counts.get(a) ?? 0) + 1);
  const sorted = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const head = sorted
    .slice(0, top)
    .map(([a, n]) => ({ label: AREA_LABEL[a] ?? a, value: n, href: withBase(`/research/?area=${a}`) }));
  const tail = sorted.slice(top);
  if (tail.length)
    head.push({
      label: `Other (${tail.length} areas)`,
      value: tail.reduce((n, [, v]) => n + v, 0),
      href: withBase('/research/'),
    });
  return head;
}

/** Research + projects per status, in pipeline order (idea → published). */
export async function statusCounts(collection?: 'research' | 'projects'): Promise<BarItem[]> {
  const list =
    collection === 'research' ? await getResearch() : collection === 'projects' ? await getPublic('projects') : await work();
  return STATUS_ORDER.map((s) => ({
    label: STATUS_LABEL[s]!,
    value: list.filter((e) => e.data.status === s).length,
    href: collection ? withBase(`/${collection}/?status=${s}`) : undefined,
  })).filter((b) => b.value > 0);
}

export async function categoryCounts(): Promise<BarItem[]> {
  const counts = new Map<string, number>();
  for (const p of await getPublic('projects')) counts.set(p.data.category, (counts.get(p.data.category) ?? 0) + 1);
  return [...counts]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([c, n]) => ({ label: CATEGORY_LABEL[c] ?? c, value: n, href: withBase(`/projects/?category=${c}`) }));
}

export async function stats() {
  const research = await getResearch();
  const projects = await getPublic('projects');
  const experience = await getPublic('experience');
  return [
    { value: research.filter((r) => r.data.doi).length, label: 'Peer-reviewed papers', href: withBase('/publications/') },
    {
      value: research.filter((r) => !r.data.doi && r.data.status !== 'concept').length,
      label: 'Studies in progress',
      href: withBase('/research/'),
    },
    { value: projects.length, label: 'Projects', href: withBase('/projects/') },
    {
      value: experience.filter((e) => e.data.type === 'ta' || e.data.type === 'sa').length,
      label: 'Teaching roles',
      href: withBase('/experience/'),
    },
  ];
}

// ---------- activity timeline ----------
/** Month index (months since year 0) for a partial date; year-only dates use January / December. */
export function monthIndex(d: string, edge: 'start' | 'end'): number {
  const [y, m] = d.split('-').map(Number);
  const month = m ?? (edge === 'start' ? 1 : 12);
  return y! * 12 + (month - 1) + (edge === 'end' ? 1 : 0);
}

export interface Segment {
  label: string;
  detail: string;
  start: number;
  end: number;
  /** future part of a dated span (e.g. expected graduation) — drawn hatched */
  expected?: boolean;
  /** year-only date — drawn as a thin band across the year */
  yearOnly?: boolean;
  href?: string | undefined;
}
export interface Lane {
  name: string;
  segments: Segment[];
}

export async function activityLanes(now = new Date()) {
  const nowIdx = now.getUTCFullYear() * 12 + now.getUTCMonth() + 0.5;
  const lanes: Lane[] = [];
  const ok = (d: string | undefined): d is string => !!d && !isTodo(d);

  const edu = (await getPublic('education')).filter((e) => ok(e.data.start));
  lanes.push({
    name: 'Education',
    segments: edu.flatMap((e) => {
      const start = monthIndex(e.data.start, 'start');
      const endD = e.data.end ?? e.data.expectedEnd;
      const end = ok(endD) ? monthIndex(endD, 'end') : nowIdx;
      const label = `${e.data.degree}, ${e.data.major}`;
      const detail = `${e.data.institution} · ${formatRange(e.data.start, endD) ?? ''}${!e.data.end && e.data.expectedEnd ? ' (expected)' : ''}`;
      if (!e.data.end && end > nowIdx) {
        return [
          { label, detail, start, end: nowIdx },
          { label: `${label} (expected)`, detail, start: nowIdx, end, expected: true },
        ];
      }
      return [{ label, detail, start, end }];
    }),
  });

  const exp = (await getPublic('experience')).filter((e) => ok(e.data.start));
  for (const [name, types] of [
    ['Research', ['research']],
    ['Teaching', ['ta', 'sa']],
  ] as const) {
    lanes.push({
      name,
      segments: exp
        .filter((e) => (types as readonly string[]).includes(e.data.type))
        .map((e) => ({
          label: e.data.course ? `${e.data.role} — ${e.data.course}` : e.data.role,
          detail: `${e.data.org} · ${formatRange(e.data.start, e.data.end) ?? ''}`,
          start: monthIndex(e.data.start, 'start'),
          end: ok(e.data.end) ? monthIndex(e.data.end, 'end') : nowIdx,
          href: entryPath(e),
        })),
    });
  }

  const sports = (await getPublic('sports')).filter((s) => ok(s.data.start));
  lanes.push({
    name: 'Sports',
    segments: sports.map((s) => ({
      label: s.data.team,
      detail: `${s.data.leagues.join(', ')} · ${formatRange(s.data.start, s.data.end) ?? ''}`,
      start: monthIndex(s.data.start, 'start'),
      end: ok(s.data.end) ? monthIndex(s.data.end, 'end') : nowIdx,
      href: entryPath(s),
    })),
  });

  const pubs = (await getResearch()).filter((r) => r.data.doi && r.cite.year);
  const awards = (await getPublic('awards')).filter((a) => ok(a.data.date) && a.data.category !== 'research');
  lanes.push({
    name: 'Papers & awards',
    segments: [
      ...pubs.map((r) => ({
        label: r.cite.venue ?? r.cite.title,
        detail: `Paper · ${r.cite.year}`,
        start: monthIndex(String(r.cite.year), 'start'),
        end: monthIndex(String(r.cite.year), 'end'),
        yearOnly: true,
        href: entryPath(r),
      })),
      ...awards.map((a) => ({
        label: a.data.title,
        detail: `${a.data.issuer} · ${formatDate(a.data.date)}`,
        start: monthIndex(a.data.date, 'start'),
        end: monthIndex(a.data.date, 'end'),
        yearOnly: a.data.date.length === 4,
        href: entryPath(a),
      })),
    ],
  });

  const all = lanes.flatMap((l) => l.segments);
  const minYear = Math.floor(Math.min(...all.map((s) => s.start)) / 12);
  const maxYear = Math.ceil(Math.max(...all.map((s) => s.end), nowIdx) / 12);
  return {
    lanes: lanes.filter((l) => l.segments.length > 0),
    minIdx: minYear * 12,
    maxIdx: maxYear * 12,
    nowIdx,
    years: Array.from({ length: maxYear - minYear }, (_, i) => minYear + i),
  };
}
