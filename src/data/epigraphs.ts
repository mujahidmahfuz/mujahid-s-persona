/**
 * Epigraph registry — Website_Redesign.md §5. One thought per route.
 *
 * Integrity rules (enforced by scripts/epigraphs.ts and the guard):
 *  - Quran: only the reference is written here. Arabic (Tanzil Uthmani text) and English
 *    (Saheeh International) are fetched from api.alquran.cloud into src/data/cache/quran.json.
 *    Nothing is typed by hand; full verses are shown, never trimmed mid-verse.
 *  - Literature: the exact text must be found in the cited public-domain edition (Project Gutenberg /
 *    Wikisource), verified into src/data/cache/quotes-verified.json.
 *  - Original: labelled "Original reflection" — never attributed to anyone famous.
 */
export type Treatment = 'grand' | 'verse' | 'margin' | 'note' | 'plate';

interface Base {
  id: string;
  /** Why this thought belongs to this page (kept for editors; not shown). */
  why: string;
}
export interface QuranEpigraph extends Base {
  type: 'quran';
  /** "S:V" or "S:V-W" (consecutive verses of one surah). */
  ref: string;
}
export interface LiteratureEpigraph extends Base {
  type: 'literature' | 'philosophy' | 'poetry';
  text: string;
  attribution: string;
  source: string;
  /** Plain-text URL the verifier searches for `text`. */
  verifyUrl: string;
}
export interface OriginalEpigraph extends Base {
  type: 'original';
  text: string;
}
export type Epigraph = QuranEpigraph | LiteratureEpigraph | OriginalEpigraph;

export const EPIGRAPHS: Epigraph[] = [
  // ---------- static routes ----------
  { id: 'home', type: 'quran', ref: '3:190', why: 'The whole atlas: creation as signs for those who think.' },
  { id: 'about', type: 'quran', ref: '20:25-28', why: 'A personal prayer for courage and clear speech.' },
  { id: 'research', type: 'quran', ref: '17:85', why: 'Humility before how little we know.' },
  { id: 'publications', type: 'quran', ref: '31:27', why: 'Writing, ink and the inexhaustible.' },
  { id: 'projects', type: 'quran', ref: '29:20', why: 'Go, observe how creation began — making things.' },
  { id: 'achievements', type: 'quran', ref: '53:39-40', why: 'Only what one strives for; effort is seen.' },
  { id: 'sports', type: 'quran', ref: '3:200', why: 'Patience, endurance, standing firm together.' },
  { id: 'education', type: 'quran', ref: '96:1-5', why: 'Read; taught by the pen what one did not know.' },
  { id: 'experience', type: 'quran', ref: '2:269', why: 'Wisdom given is much good — teaching and research.' },
  { id: 'notes', type: 'quran', ref: '68:1', why: 'By the pen and what they write — a journal.' },
  { id: 'videos', type: 'quran', ref: '36:40', why: 'Everything in motion, each in its orbit.' },
  { id: 'search', type: 'quran', ref: '29:69', why: 'Those who strive are guided to the ways.' },
  { id: 'topics', type: 'quran', ref: '51:20-21', why: 'Signs on the earth and within ourselves — connections.' },
  {
    id: 'cv',
    type: 'original',
    text: 'A record is not a life. It is only the part of the work that happened to leave a trace on paper.',
    why: 'Humility about a CV.',
  },
  {
    id: 'contact',
    type: 'original',
    text: 'Most good work I know of began with an ordinary message between two curious people.',
    why: 'An invitation to begin a conversation.',
  },
  {
    id: '404',
    type: 'original',
    text: 'Not every path leads somewhere. Some only show you where the map ends — and that is worth knowing too.',
    why: 'A lost page, gently.',
  },
  {
    id: 'styleguide',
    type: 'original',
    text: 'A small set of rules, kept carefully, is how a world stays recognisable as it grows.',
    why: 'The design system itself.',
  },

  // ---------- research ----------
  {
    id: 'research/bwa-bootstrap-wasserstein-alignment',
    type: 'quran',
    ref: '17:36',
    why: 'Do not follow what you have no knowledge of — evidence for explanations.',
  },
  { id: 'research/qip-2025', type: 'quran', ref: '67:3-4', why: 'Look again, and again, for flaws — the adversarial gaze.' },
  { id: 'research/sleep-continual-learning', type: 'quran', ref: '30:23', why: 'Sleep by night and day among the signs.' },
  {
    id: 'research/lossmap-photonic-loss',
    type: 'quran',
    ref: '6:59',
    why: 'What is unseen and what is lost — humility in inference.',
  },
  { id: 'research/nv-center-odmr', type: 'quran', ref: '54:49', why: 'All things created in measure — measurement.' },
  { id: 'research/bee-venom-target-prioritisation', type: 'quran', ref: '16:68-69', why: 'The bee, and healing for people.' },
  { id: 'research/retinal-reliability', type: 'quran', ref: '16:78', why: 'Hearing, sight and understanding as gifts.' },
  { id: 'research/dicke-measurement-timing', type: 'quran', ref: '55:5', why: 'Precise calculation — circuits and timing.' },
  {
    id: 'research/pauli-frame-repeater-overhead',
    type: 'quran',
    ref: '18:66',
    why: 'Asking to learn what others were taught — re-deriving known results.',
  },
  {
    id: 'research/photonic-qec-ai',
    type: 'quran',
    ref: '59:18',
    why: 'Look to what is sent forward for tomorrow — forecasting.',
  },
  { id: 'research/music-inspired-ml', type: 'quran', ref: '55:7-8', why: 'The balance — regulation and rhythm.' },

  // ---------- projects ----------
  { id: 'projects/doombreak', type: 'quran', ref: '103:1-3', why: 'By time — the attention economy.' },
  {
    id: 'projects/qlnrs-fujitsu-challenge',
    type: 'original',
    text: 'An honest negative result is still a map: it shows the next traveller where the road does not go.',
    why: 'No demonstrated quantum advantage, reported honestly.',
  },
  { id: 'projects/quantum-cookbook', type: 'quran', ref: '20:114', why: 'My Lord, increase me in knowledge — a textbook.' },
  { id: 'projects/pqc-arduino', type: 'quran', ref: '15:19', why: 'Every well-balanced thing — fitting within a budget.' },
  { id: 'projects/llm-council', type: 'quran', ref: '42:38', why: 'Affairs decided by consultation — a council.' },
  { id: 'projects/ai-orchestrator', type: 'quran', ref: '4:135', why: 'Standing firm in justice — a fair judge.' },
  {
    id: 'projects/pl-2025-prediction',
    type: 'quran',
    ref: '31:34',
    why: 'No soul knows what it will earn tomorrow — prediction.',
  },
  { id: 'projects/pqc-openvpn', type: 'quran', ref: '4:58', why: 'Render trusts to whom they are due — secure channels.' },
  {
    id: 'projects/campusos',
    type: 'quran',
    ref: '49:13',
    why: 'Peoples and tribes, so that you may know one another — a campus.',
  },
  { id: 'projects/thought-to-reality', type: 'quran', ref: '17:70', why: 'The dignity of every person — assistive technology.' },
  {
    id: 'projects/aura-accessibility',
    type: 'original',
    text: 'Accessibility is not a feature added at the end. It is a decision, made at the start, about who the work is for.',
    why: 'An AI companion for blind users.',
  },
  { id: 'projects/mujaverse', type: 'quran', ref: '13:11', why: 'Change begins within — building something.' },

  // ---------- experience / achievements / sports ----------
  { id: 'experience/research-ozaydin', type: 'quran', ref: '39:9', why: 'Are those who know equal to those who do not?' },
  {
    id: 'experience/ta-intro-python',
    type: 'philosophy',
    text: 'Welcome those whom you yourself can improve. The process is mutual; for men learn while they teach.',
    attribution: 'Seneca, Moral Letters to Lucilius, Letter VII',
    source: 'Seneca, Ad Lucilium Epistulae Morales, trans. Richard M. Gummere (Loeb, 1917), Letter VII §8 — via Wikisource',
    verifyUrl: 'https://en.wikisource.org/wiki/Moral_letters_to_Lucilius/Letter_7',
    why: 'Teaching as learning.',
  },
  { id: 'experience/ta-intro-informatics', type: 'quran', ref: '55:1-4', why: 'Taught man eloquence — explaining clearly.' },
  { id: 'experience/sa-blockchain', type: 'quran', ref: '17:35', why: 'Full measure, an even balance — an honest ledger.' },
  {
    id: 'achievements/icpc-regional',
    type: 'original',
    text: 'A ranking measures one afternoon. What it leaves behind is the habit of reaching for the next problem.',
    why: 'A contest result, kept in proportion.',
  },
  { id: 'achievements/bwa-kbs-publication', type: 'quran', ref: '58:11', why: 'Those given knowledge raised by degrees.' },
  {
    id: 'achievements/fujitsu-quantum-challenge',
    type: 'original',
    text: 'Some problems are worth attempting precisely because nobody yet knows whether they can be solved.',
    why: 'Entering an open challenge.',
  },
  { id: 'sports/tiu-soccer', type: 'quran', ref: '94:5-6', why: 'With hardship comes ease — losing and continuing.' },

  // ---------- topic pages draw from this pool (repetition across topic pages only) ----------
  { id: 'pool/1', type: 'quran', ref: '30:22', why: 'Diversity of tongues and colours.' },
  { id: 'pool/2', type: 'quran', ref: '41:53', why: 'Signs in the horizons and in themselves.' },
  { id: 'pool/3', type: 'quran', ref: '45:13', why: 'Subjected for those who give thought.' },
  { id: 'pool/4', type: 'quran', ref: '88:17-20', why: 'Look at the camel, the sky, the mountains, the earth.' },
  { id: 'pool/5', type: 'quran', ref: '13:3', why: 'Signs for people who reflect.' },
  { id: 'pool/6', type: 'quran', ref: '10:5', why: 'Phases measured so you may know the count of years.' },
  { id: 'pool/7', type: 'quran', ref: '21:30', why: 'Joined then separated; life from water.' },
  { id: 'pool/8', type: 'quran', ref: '50:16', why: 'Closer than the jugular vein.' },
  { id: 'pool/9', type: 'quran', ref: '2:286', why: 'No soul burdened beyond its capacity.' },
  { id: 'pool/10', type: 'quran', ref: '12:87', why: 'Do not despair.' },
  { id: 'pool/11', type: 'quran', ref: '2:153', why: 'Seek help through patience.' },
  { id: 'pool/12', type: 'quran', ref: '25:2', why: 'Each thing created and given its measure.' },
  { id: 'pool/13', type: 'quran', ref: '17:11', why: 'Man is ever hasty.' },
  { id: 'pool/14', type: 'quran', ref: '5:8', why: 'Justice even towards those you dislike.' },
  { id: 'pool/15', type: 'quran', ref: '2:42', why: 'Do not mix truth with falsehood.' },
  { id: 'pool/16', type: 'quran', ref: '18:23-24', why: 'Never say "I will do it tomorrow" without humility.' },
  { id: 'pool/17', type: 'quran', ref: '39:53', why: 'Do not despair of mercy.' },
  { id: 'pool/18', type: 'quran', ref: '47:24', why: 'Do they not reflect?' },
  { id: 'pool/19', type: 'quran', ref: '6:96', why: 'Cleaver of the daybreak, a measured reckoning.' },
  { id: 'pool/20', type: 'quran', ref: '36:38', why: 'The sun runs to its resting place.' },
  {
    id: 'pool/21',
    type: 'quran',
    ref: '94:7-8',
    why: 'When you have finished, then stand up — and to your Lord direct your longing.',
  },
  { id: 'pool/22', type: 'quran', ref: '23:115', why: 'Did you think We created you without purpose?' },
  { id: 'pool/23', type: 'quran', ref: '57:20', why: 'The life of this world, like rain and its plants.' },
  { id: 'pool/24', type: 'quran', ref: '38:29', why: 'A blessed book so they may reflect.' },
];

/** Default treatment per route family (pages may override). */
export const TREATMENT: Record<string, Treatment> = {
  home: 'grand',
  about: 'grand',
  research: 'verse',
  publications: 'plate',
  projects: 'margin',
  cv: 'note',
  contact: 'note',
  '404': 'note',
};

export function byId(id: string): Epigraph | undefined {
  return EPIGRAPHS.find((e) => e.id === id);
}

const POOL = EPIGRAPHS.filter((e) => e.id.startsWith('pool/'));

/** Epigraph for a route key ("home", "research/<id>", "topics/<tag>", …). */
export function epigraphFor(key: string): Epigraph {
  const exact = byId(key);
  if (exact) return exact;
  if (key.startsWith('topics/')) {
    let h = 0;
    for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return POOL[h % POOL.length]!;
  }
  // Section fallback (e.g. a new research entry without its own epigraph yet).
  const section = key.split('/')[0]!;
  return byId(section) ?? byId('home')!;
}

export function quranRefs(): string[] {
  return EPIGRAPHS.filter((e): e is QuranEpigraph => e.type === 'quran').map((e) => e.ref);
}
