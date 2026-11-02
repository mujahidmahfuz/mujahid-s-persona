/**
 * DoomBreak structure, exactly as documented in CONTENT-INVENTORY §4 and EXPLAINERS §3.
 * Nothing here is inferred: components and links not stated in those sources are omitted.
 */
export interface Block {
  id: string;
  label: string;
  detail: string;
  layer: 0 | 1 | 2 | 3;
}
export const BLOCKS: Block[] = [
  {
    id: 'flutter',
    label: 'Flutter app',
    detail:
      'The app. Its features: session timer (state machine), full-screen lock overlay, escalating reminders, Mission Mode, “Save Me”, Net Momentum score, streaks, CSV export. Which features run in Flutter and which in native Kotlin is not documented here.',
    layer: 0,
  },
  { id: 'kotlin', label: 'Kotlin native layer', detail: 'Native usage tracking on Android.', layer: 1 },
  { id: 'fastapi', label: 'FastAPI service', detail: 'Backend for AI coaching.', layer: 2 },
  { id: 'groq', label: 'Groq — Llama 3.3 70B', detail: 'Language model that generates the coaching replies.', layer: 3 },
];
export const LINKS: [string, string, string][] = [
  ['flutter', 'kotlin', 'usage data'],
  ['flutter', 'fastapi', 'coaching request'],
  ['fastapi', 'groq', 'LLM call'],
];

/** Session flow from EXPLAINERS §3: timer → reminders → lock overlay → Save Me. */
export const FLOW = [
  { label: '1 Timer', caption: 'A scrolling session starts and the session timer (a state machine) tracks it.' },
  { label: '2 Reminders', caption: 'As the session goes on, reminders escalate.' },
  { label: '3 Lock', caption: 'A full-screen lock overlay interrupts the session.' },
  { label: '4 Save Me', caption: '“Save Me” is the user’s way to ask the app for help breaking the loop.' },
] as const;

/** Index of the flow step that is active, clamped to the valid range. */
export function clampStep(i: number): number {
  return Math.max(0, Math.min(FLOW.length - 1, Math.trunc(i)));
}

/** Every link must join two known blocks (guards against drawing undocumented components). */
export function linksAreValid(): boolean {
  const ids = new Set(BLOCKS.map((b) => b.id));
  return LINKS.every(([a, b]) => ids.has(a) && ids.has(b));
}
