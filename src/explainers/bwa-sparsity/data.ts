/**
 * REAL numbers, copied from the BWA preprint abstract (Islam & Dubey, SSRN, doi:10.2139/ssrn.7292748).
 * Metric: Gini coefficient of the attribution map (higher = sparser). All BWA-v2 comparisons
 * reported there as p_bonf ≪ 0.001.
 */
export interface Group {
  domain: string;
  setting: string;
  bars: { method: string; gini: number; ours: boolean }[];
}
export const GROUPS: Group[] = [
  {
    domain: 'MNIST saliency',
    setting: 'N = 100, d = 784',
    bars: [
      { method: 'BWA-v2', gini: 0.645, ours: true },
      { method: 'Vanilla Mean', gini: 0.613, ours: false },
      { method: 'SmoothGrad (budget-matched)', gini: 0.584, ours: false },
    ],
  },
  {
    domain: 'Gene expression (Golub leukemia)',
    setting: 'N = 72, d = 500',
    bars: [
      { method: 'BWA-v2', gini: 0.417, ours: true },
      { method: 'Vanilla Mean', gini: 0.397, ours: false },
    ],
  },
  {
    domain: 'Gene expression (Golub leukemia)',
    setting: 'N = 72, d = 2000',
    bars: [
      { method: 'BWA-v2', gini: 0.427, ours: true },
      { method: 'Vanilla Mean', gini: 0.405, ours: false },
    ],
  },
];
export const AXIS_MAX = 0.7;
/** Fraction of the axis a value fills (bars start at zero — no truncated axis). */
export const frac = (g: number) => Math.max(0, Math.min(1, g / AXIS_MAX));
