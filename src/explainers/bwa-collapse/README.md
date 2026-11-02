# bwa-collapse — why averaging fails, and what BWA does instead (2D, toy)

Source anchor: BWA preprint abstract (doi:10.2139/ssrn.7292748): "projects each bootstrap-replicate attribution
to a probability measure on the feature simplex and aggregates the replicates via a Wasserstein-barycenter
consensus paired with a per-feature sign-abstention mechanism … BWA-v1 with a hard binomial sign test [and
global normalisation] … Lemma 1 formalises the worst-case norm collapse failure of Euclidean averaging under
sign-flip symmetry."
Data provenance: (b) toy data — the hand-written 6 × 8 matrix `E` in `model.ts`. Labelled "Illustrative example".

## Simplifications (also in the "How to read this" panel)
- Simplex projection drawn as |e| / ‖e‖₁ — **assumed**; confirm against the paper.
- The consensus profile uses the renormalised per-feature **median** as a stand-in for the entropic
  Wasserstein barycenter (whose ground cost is not in the abstract). Labelled in the UI.
- Sign test: exact two-sided binomial, α = 0.05 (toy choice). Global scale = mean L1 norm of the replicates.
- Shows the v1-style hard sign test only; v2's Bayesian soft sign is described in text.

## Formulas and tests (`bwa-collapse.test.ts`)
Euclidean mean, L2 norm, simplex projection, exact binomial p (6/6 → 2/64, 5/6 → 14/64), sign vote, stand-in sums to 1.

## Verification record
- [ ] Muja: projection, sign test and normalisation match the paper
- [ ] Muja: OK to show the median stand-in, or provide the barycenter code to compute it properly
- [x] Muja set `verified: true` on 2026-11-03 after reviewing in dev (open items above stay open).
