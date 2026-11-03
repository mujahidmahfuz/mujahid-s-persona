/**
 * Official journal covers supplied by Muja (Nov 2026). They identify the journal; they are
 * representative issues, NOT the issue that carries the paper — the QIP image is Vol. 16 No. 8
 * (Aug 2017), the paper is Vol. 25 (2026). Shown with that note and the publisher credited.
 */
import type { ImageMetadata } from 'astro';
import kbs from '~/assets/journals/knowledge-based-systems.gif';
import qip from '~/assets/journals/quantum-information-processing.webp';

export interface JournalCover {
  src: ImageMetadata;
  alt: string;
  publisher: string;
  note: string;
}

const COVERS: Record<string, JournalCover> = {
  'Knowledge-Based Systems': {
    src: kbs,
    alt: 'Cover of the journal Knowledge-Based Systems (Elsevier)',
    publisher: 'Elsevier',
    note: 'Journal cover — a representative issue, not necessarily the one carrying this paper.',
  },
  'Quantum Information Processing': {
    src: qip,
    alt: 'Cover of the journal Quantum Information Processing (Springer)',
    publisher: 'Springer Nature',
    note: 'Journal cover — a representative issue (Vol. 16, No. 8, 2017), not the 2026 issue carrying this paper.',
  },
};

export function journalCover(venue: string | undefined): JournalCover | undefined {
  return venue ? COVERS[venue] : undefined;
}
