# qgan-loop — one training round of a QGAN (2D, concept)

Source anchor: the standard QGAN formulation — S. Lloyd & C. Weedbrook, PRL 121, 040502 (2018);
P.-L. Dallaire-Demers & N. Killoran, PRA 98, 012324 (2018). Link to Muja's paper: the QIP survey
(doi:10.1007/s11128-025-05044-6) "categorize[s] existing QGAN architectures based on their quantum-classical
hybrid structures" (Semantic Scholar's machine summary — the publisher withholds the abstract).
Data provenance: no data. Concept diagram; labelled "Illustrative example".

## Simplifications
- Three placements of the quantum part only; the survey's taxonomy may be finer (e.g. quantum data, patch/style variants).
- Loss functions, measurement and gradient estimation are not shown.

## Verification record
- [ ] Muja: wording matches the survey's taxonomy; add or rename configurations if needed
- [x] Muja set `verified: true` on 2026-11-03 after reviewing in dev (open items above stay open).
