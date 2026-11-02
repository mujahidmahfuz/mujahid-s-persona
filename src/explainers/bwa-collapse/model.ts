/**
 * Toy data and arithmetic for the BWA explainer. Everything here is ILLUSTRATIVE:
 * a hand-written 6 × 8 attribution matrix, not data from the paper.
 * Method structure from the BWA preprint abstract (doi:10.2139/ssrn.7292748).
 */

/** B = 6 bootstrap replicates × d = 8 features. Features 3, 4, 6 and 7 flip sign across replicates. */
export const E: readonly (readonly number[])[] = [
  [0.92, -0.7, 0.8, 0.08, 0.52, 0.6, 0.05, -0.42],
  [0.85, -0.74, -0.82, -0.06, 0.47, -0.58, -0.04, -0.38],
  [0.96, -0.66, 0.78, 0.1, 0.55, 0.63, 0.07, -0.45],
  [0.88, -0.72, -0.79, -0.09, 0.5, 0.57, -0.06, -0.4],
  [0.9, -0.69, 0.81, 0.05, 0.49, -0.61, 0.03, -0.43],
  [0.94, -0.75, -0.77, -0.07, 0.53, 0.59, -0.05, -0.39],
];
export const B = E.length;
export const D = E[0]!.length;

export const l2 = (v: readonly number[]) => Math.sqrt(v.reduce((s, x) => s + x * x, 0));

/** Euclidean (arithmetic) mean of the replicates — the baseline the paper's Lemma 1 analyses. */
export function euclideanMean(m: readonly (readonly number[])[]): number[] {
  return m[0]!.map((_, j) => m.reduce((s, row) => s + row[j]!, 0) / m.length);
}

/** Magnitude of one attribution as a probability vector on the feature simplex: |e| / ‖e‖₁. */
export function toSimplex(v: readonly number[]): number[] {
  const s = v.reduce((a, x) => a + Math.abs(x), 0);
  return v.map((x) => (s === 0 ? 1 / v.length : Math.abs(x) / s));
}

function binom(n: number, k: number): number {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}

/** Exact two-sided binomial sign test p-value for k positives out of n (p = 0.5). */
export function signTestP(k: number, n: number): number {
  const pmf = (i: number) => binom(n, i) / 2 ** n;
  let lo = 0;
  let hi = 0;
  for (let i = 0; i <= k; i++) lo += pmf(i);
  for (let i = k; i <= n; i++) hi += pmf(i);
  return Math.min(1, 2 * Math.min(lo, hi));
}

export const ALPHA = 0.05;

/** Per-feature sign decision: +1 / −1 when the sign test rejects at ALPHA, else 0 (abstain). */
export function signVote(m: readonly (readonly number[])[], alpha = ALPHA): { sign: -1 | 0 | 1; positives: number; p: number }[] {
  return m[0]!.map((_, j) => {
    const positives = m.filter((row) => row[j]! > 0).length;
    const p = signTestP(positives, m.length);
    const sign = p < alpha ? (positives * 2 > m.length ? 1 : -1) : 0;
    return { sign, positives, p };
  });
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const h = Math.floor(s.length / 2);
  return s.length % 2 ? s[h]! : (s[h - 1]! + s[h]!) / 2;
};

/**
 * Consensus magnitude profile — SCHEMATIC STAND-IN. The paper aggregates the simplex measures
 * with an (entropic) Wasserstein barycenter; this toy uses the renormalised per-feature median
 * so the picture can be drawn without the paper's ground cost. Labelled as such in the UI.
 */
export function consensusStandIn(m: readonly (readonly number[])[]): number[] {
  const P = m.map(toSimplex);
  const med = P[0]!.map((_, j) => median(P.map((p) => p[j]!)));
  const s = med.reduce((a, x) => a + x, 0);
  return med.map((x) => x / s);
}
