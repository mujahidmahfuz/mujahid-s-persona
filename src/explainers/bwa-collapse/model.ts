/**
 * Toy data and arithmetic for the BWA explainer. Everything here is ILLUSTRATIVE:
 * a hand-written 6 × 8 attribution matrix, not data from the paper.
 * Method structure from the BWA preprint abstract (doi:10.2139/ssrn.7292748) and the paper's
 * Algorithm 1 / public reference code (core.py).
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

/**
 * Ground cost between features — the `"euclidean"` option of the reference implementation
 * (github.com/mujahidmahfuz/bootstrap-wasserstein-alignment, core.py `_compute_cost_matrix`):
 * |i − j| between feature indices, divided by its maximum. The toy has no feature matrix X, so the
 * default correlation cost (1 − |corr|) cannot be formed; this choice is stated in the UI.
 */
export function indexCost(d: number): number[][] {
  return Array.from({ length: d }, (_, i) => Array.from({ length: d }, (_, j) => Math.abs(i - j) / (d - 1)));
}

/** core.py default entropic regularisation. */
export const EPSILON = 0.01;

const lse = (xs: number[]) => {
  const m = Math.max(...xs);
  return m === -Infinity ? m : m + Math.log(xs.reduce((a, x) => a + Math.exp(x - m), 0));
};

/**
 * Entropic Wasserstein barycenter of the replicates' simplex measures, uniform weights —
 * the paper's Algorithm 1 (iterative Bregman projections, Benamou et al. 2015; POT `ot.barycenter`),
 * run in the log domain so ε = 0.01 does not underflow. Returns the barycenter and the iterations used.
 */
export function wassersteinBarycenter(
  m: readonly (readonly number[])[],
  C: readonly (readonly number[])[] = indexCost(m[0]!.length),
  eps = EPSILON,
  maxIter = 30000,
  tol = 1e-5,
): { mu: number[]; iterations: number } {
  const d = m[0]!.length;
  const logA = m.map((row) => toSimplex(row).map((x) => Math.log(x + 1e-10)));
  const logK = C.map((r) => r.map((c) => -c / eps));
  const logKv = (lv: number[]) => logK.map((r) => lse(r.map((k, j) => k + lv[j]!)));
  const logKtu = (lu: number[]) => logK[0]!.map((_, j) => lse(logK.map((r, i) => r[j]! + lu[i]!)));
  let logV = m.map(() => new Array<number>(d).fill(0));
  let logU: number[][] | null = null;
  let logMu = new Array<number>(d).fill(-Math.log(d));
  let it = 0;
  for (; it < maxIter; it++) {
    const logKV = logV.map((lv) => logKv(lv));
    // Residual of the previous sweep: row marginals u_b ⊙ K v_b against a_b (column marginals are exact).
    if (logU) {
      const err = Math.max(
        ...logA.map((la, b) => la.reduce((s, x, i) => s + Math.abs(Math.exp(logU![b]![i]! + logKV[b]![i]!) - Math.exp(x)), 0)),
      );
      if (err < tol) break;
    }
    // u_b = a_b ⊘ (K v_b);   μ = exp( (1/B) Σ_b log(Kᵀ u_b) );   v_b = μ ⊘ (Kᵀ u_b)
    logU = logA.map((la, b) => la.map((x, i) => x - logKV[b]![i]!));
    const logKtU = logU.map((lu) => logKtu(lu));
    logMu = logKtU[0]!.map((_, j) => logKtU.reduce((s, r) => s + r[j]!, 0) / logKtU.length);
    logV = logKtU.map((r) => logMu.map((x, j) => x - r[j]!));
  }
  const mu = logMu.map(Math.exp);
  const z = mu.reduce((a, x) => a + x, 0);
  return { mu: mu.map((x) => x / z), iterations: it + 1 };
}

/**
 * The converged barycenter of the toy matrix E (ε = 0.01, index cost), as computed by
 * `wassersteinBarycenter(E)` (~17 000 sweeps) and cross-checked against POT's `ot.barycenter`
 * (method "sinkhorn_log", fully converged) to five decimals. Stored so the page does not spend
 * ~0.4 s of main-thread time on every visit; the unit test recomputes it and fails on any drift.
 */
export const BARYCENTER_E: readonly number[] = [0.22452, 0.17391, 0.19758, 0.02195, 0.12256, 0.14477, 0.01494, 0.09978];

/**
 * BWA-v1-style consensus: barycenter magnitudes, signs from the sign test (abstained features keep
 * their magnitude, drawn as outlines), rescaled so its L2 norm equals the replicates' mean L2 norm
 * (core.py `_rescale_consensus`, "preserve attribution energy").
 */
export function bwaConsensus(m: readonly (readonly number[])[], mu: readonly number[] = BARYCENTER_E): number[] {
  const votes = signVote(m);
  const target = m.reduce((s, r) => s + l2(r), 0) / m.length;
  const k = target / l2(mu);
  return mu.map((x, j) => x * k * (votes[j]!.sign || 1));
}
