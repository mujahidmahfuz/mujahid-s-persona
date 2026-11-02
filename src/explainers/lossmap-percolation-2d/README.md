# lossmap-percolation-2d — bond percolation on a square lattice (2D, toy)

Source anchor: project README (github.com/mujahidmahfuz/Adaptive-Photonic-Quantum-Computer), “Current Status”:
E001 = square-lattice bond-percolation validation, p_c = 0.499520 ± 0.000682 vs exact 0.5 (0.70σ).
The exact square-lattice bond threshold p_c = 1/2 is a classical result (Kesten, 1980).
Data provenance: (b) toy — random bonds from a seeded PRNG in `model.ts`. Labelled "Illustrative example".
The measured E001 number is shown in Key findings, not in this figure (no mixing of real and toy data).

## Simplifications
- 20 × 20 lattice, left–right spanning only; not the project's engine, loss maps or photonic model.
- "Bond open" stands in for "link survives"; how the project maps photon loss onto bonds is in its docs.

## Formulas and tests (`lossmap-percolation-2d.test.ts`)
Bond count 2·L·(L−1); p = 0 / p = 1 limits; union–find on a hand-built path; monotone opening in p.

## Verification record
- [ ] Muja: wording of the bond ↔ photon-loss analogy is acceptable
