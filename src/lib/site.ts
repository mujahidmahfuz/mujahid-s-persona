/**
 * Site-wide facts. Sources: docs/CONTENT-INVENTORY.md §1 and Muja's CV (root, not committed).
 * Never publish: phone, address, student ID, date of birth (CLAUDE.md rule 6).
 */
export const SITE = {
  name: 'Md Mujahidul Islam',
  shortName: 'Muja',
  url: 'https://mujahidmahfuz.github.io',
  tagline: 'Undergraduate researcher — machine learning, explainable AI and quantum computing',
  description:
    'Md Mujahidul Islam (Muja) is an undergraduate researcher at Tokyo International University working with Prof. Fatih Ozaydin on explainable AI, continual learning and quantum information.',
  affiliation: 'Institute for International Strategy and Emerging Technologies, Tokyo International University',
  university: 'Tokyo International University',
  advisor: 'Prof. Fatih Ozaydin',
  sourceRepo: 'https://github.com/mujahidmahfuz/mujahid-s-persona',
  quantumCookbook: 'https://mujahidmahfuz.github.io/quantum-cookbook/',
  orcidId: '0009-0007-8507-3370',
} as const;

/** Email is split so no plain address sits in the HTML; it is assembled client-side (rule 7). */
export const EMAIL_PARTS = { user: 'mujahid168216', domain: 'gmail.com' } as const;

export const PROFILES = [
  { label: 'Google Scholar', href: 'https://scholar.google.com/citations?hl=en&user=lgPRHn0AAAAJ' },
  { label: 'ORCID', href: `https://orcid.org/${SITE.orcidId}` },
  { label: 'GitHub', href: 'https://github.com/mujahidmahfuz' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mujahidmahfuz' },
] as const;

export const NAV = [
  { label: 'Research', href: '/research/' },
  { label: 'Projects', href: '/projects/' },
  { label: 'Publications', href: '/publications/' },
  { label: 'Achievements', href: '/achievements/' },
  { label: 'Sports', href: '/sports/' },
  { label: 'About', href: '/about/' },
  { label: 'CV', href: '/cv/' },
] as const;

/** Matches Muja's name in author lists (used to bold it). See docs/PHASE-NOTES.md. */
export const MY_NAME_PATTERNS: readonly RegExp[] = [
  /^(md\.?\s+)?mujahidul\s+islam$/i,
  /^islam,\s*(md\.?\s+)?mujahidul$/i,
  /^m(d)?\.?\s*(m\.?\s*)?islam$/i,
  /^islam,\s*m(d)?\.?(\s*m\.?)?$/i,
];
