# sleep-loop — the wake / sleep scheduler (2D, structure only)

Source anchor: CONTENT-INVENTORY §3 (sleep-continual-learning row) and CV: fixed-interval baseline → heuristic gate
→ learned policy (contextual bandit, REINFORCE); graduated micro / light / deep sleep on Split CIFAR-10;
replay/consolidation. EXPLAINERS §3 suggests a scheduler System Map.
Data provenance: no numeric data. Structure only (`model.ts`).

## Simplifications
- The gate's rule, the replay buffer, and what each tier changes are not drawn (not in the sources available).
- The marker's position is a teaching device, not a timeline.

## Verification record
- [ ] Muja: loop order and wording match the code / paper draft
- [x] Muja set `verified: true` on 2026-11-03 after reviewing in dev (open items above stay open).
