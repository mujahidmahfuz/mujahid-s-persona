/**
 * "Chapters" give each discipline a subtle colour identity inside one palette (DESIGN §3).
 * explainability — indigo + saffron · memory — mulberry + saffron · quantum — verdigris + indigo ·
 * life — olive + copper · machines — petrol + terracotta · people — terracotta + olive.
 */
export type Chapter = 'explainability' | 'memory' | 'quantum' | 'life' | 'machines' | 'people';

const BY_AREA: Record<string, Chapter> = {
  xai: 'explainability',
  'machine-learning': 'explainability',
  'continual-learning': 'memory',
  'cognitive-science': 'memory',
  neuromorphic: 'memory',
  'quantum-computing': 'quantum',
  'quantum-networking': 'quantum',
  'quantum-sensing': 'quantum',
  'medical-ai': 'life',
  'computational-biology': 'life',
  cryptography: 'machines',
  systems: 'machines',
  optimization: 'machines',
  hci: 'people',
};

export const CHAPTER_LABEL: Record<Chapter, string> = {
  explainability: 'Explanation & learning',
  memory: 'Memory & mind',
  quantum: 'Quantum',
  life: 'Life & health',
  machines: 'Machines & security',
  people: 'People & interfaces',
};

/** The chapter of an entry: its first area that maps to a chapter. */
export function chapterFor(areas: readonly string[] | undefined): Chapter {
  for (const a of areas ?? []) if (BY_AREA[a]) return BY_AREA[a]!;
  return 'explainability';
}
