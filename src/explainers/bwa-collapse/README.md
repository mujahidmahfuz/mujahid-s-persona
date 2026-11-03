# bwa-collapse — why averaging fails, and what BWA does instead (2D, toy)

Source anchor: BWA preprint abstract (doi:10.2139/ssrn.7292748): "projects each bootstrap-replicate attribution
to a probability measure on the feature simplex and aggregates the replicates via a Wasserstein-barycenter
consensus paired with a per-feature sign-abstention mechanism … BWA-v1 with a hard binomial sign test [and
global normalisation] … Lemma 1 formalises the worst-case norm collapse failure of Euclidean averaging under
sign-flip symmetry."
Data provenance: (b) toy data — the hand-written 6 × 8 matrix `E` in `model.ts`. Labelled "Illustrative example".

## Simplifications (also in the "How to read this" panel)
- Simplex projection |e| / ‖e‖₁ (+1e-10) — matches core.py `_replicates_to_weights` and the paper's Eq. (measure).
- Consensus = **entropic Wasserstein barycenter**, paper Algorithm 1 (iterative Bregman projections), log domain,
  ε = 0.01 (core.py default), uniform weights. Ground cost: core.py's `"euclidean"` option (|i−j| / max), because
  the toy has no feature matrix for the default correlation cost. Converged value stored as `BARYCENTER_E`;
  cross-checked against POT 0.9 `ot.barycenter(..., method="sinkhorn_log")` to 5 dp (2026-11-03).
- Rescale: L2 norm set to the replicates' mean L2 norm (core.py `_rescale_consensus`).
- Sign test: exact two-sided binomial, α = 0.05, abstaining when not significant (the published "sign
  abstention"; core.py instead defaults to +1 and uses the normal approximation).
- Shows the v1-style hard sign test only; v2's Bayesian soft sign is described in text.

## Formulas and tests (`bwa-collapse.test.ts`)
Euclidean mean, L2 norm, simplex projection, exact binomial p (6/6 → 2/64, 5/6 → 14/64), sign vote, barycenter is a
probability vector, identical replicates return themselves, stored barycenter = fresh run, energy preserved.

## Verification record
- [ ] Muja: projection, sign test and normalisation match the paper
- [x] Median stand-in replaced by the real barycenter (Algorithm 1 + core.py), 2026-11-03
- [x] Muja set `verified: true` on 2026-11-03 after reviewing in dev (open items above stay open).
