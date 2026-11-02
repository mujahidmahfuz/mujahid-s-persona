/**
 * REAL numbers from Muja's experiment summary (CONTENT-INVENTORY §3) and CV (Nov 2026).
 * Status: single-run summary; 5-seed confirmation pending (shown in the UI).
 */
export const SLEEP_EVENTS = {
  title: 'Binary-MNIST: sleep events used (accuracy maintained)',
  max: 600,
  bars: [
    { label: 'Fixed interval', value: 555, ours: false },
    { label: 'Heuristic gate', value: 239, ours: true },
  ],
} as const;

export const CIFAR = {
  title: 'Split CIFAR-10 (multi-head): average accuracy',
  max: 1,
  bars: [
    { label: 'No sleep', value: 0.7926, ours: false },
    { label: 'Fixed deep sleep', value: 0.8665, ours: false },
    { label: 'Adaptive (graduated)', value: 0.8733, ours: true },
  ],
} as const;

/** Relative reduction in sleep events, e.g. 239 vs 555 → 0.569… (the CV's "57% fewer"). */
export const reduction = (ours: number, base: number) => 1 - ours / base;
