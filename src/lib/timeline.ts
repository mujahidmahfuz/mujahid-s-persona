import { getPublic, formatDate, formatRange, dateKey } from './content';
import { entryPath } from './paths';

export interface TimelineItem {
  date: string;
  sortKey: string;
  title: string;
  org?: string | undefined;
  kind: 'Education' | 'Research' | 'Teaching' | 'Award' | 'Sports' | 'Other';
  href?: string | undefined;
}

export async function timelineItems(): Promise<TimelineItem[]> {
  const edu = (await getPublic('education')).map((e) => ({
    date: formatRange(e.data.start, e.data.end ?? e.data.expectedEnd) + (e.data.expectedEnd && !e.data.end ? ' (expected)' : ''),
    sortKey: dateKey(e.data.start),
    title: `${e.data.degree}, ${e.data.major}`,
    org: e.data.institution,
    kind: 'Education' as const,
  }));
  const exp = (await getPublic('experience')).map((e) => ({
    date: formatRange(e.data.start, e.data.end) ?? '',
    sortKey: dateKey(e.data.start),
    title: e.data.course ? `${e.data.role} — ${e.data.course}` : e.data.role,
    org: e.data.org,
    kind:
      e.data.type === 'research'
        ? ('Research' as const)
        : e.data.type === 'ta' || e.data.type === 'sa'
          ? ('Teaching' as const)
          : ('Other' as const),
    href: entryPath(e),
  }));
  const awards = (await getPublic('awards'))
    .filter((a) => formatDate(a.data.date))
    .map((a) => ({
      date: formatDate(a.data.date)!,
      sortKey: dateKey(a.data.date),
      title: a.data.title,
      org: a.data.issuer,
      kind: 'Award' as const,
      href: entryPath(a),
    }));
  const sports = (await getPublic('sports')).map((s) => ({
    date: formatRange(s.data.start, s.data.end) ?? '',
    sortKey: dateKey(s.data.start),
    title: s.data.team,
    org: s.data.leagues.join(', '),
    kind: 'Sports' as const,
    href: entryPath(s),
  }));
  return [...edu, ...exp, ...awards, ...sports];
}
