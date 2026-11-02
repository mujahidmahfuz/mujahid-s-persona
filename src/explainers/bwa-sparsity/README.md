# bwa-sparsity — attribution sparsity results (2D, real numbers)

Source anchor: BWA preprint abstract — Islam & Dubey, "Bootstrap Wasserstein Alignment for Stable Feature
Attribution in Low-Data Regimes", SSRN 2026, doi:10.2139/ssrn.7292748 (Crossref record). Published version:
Knowledge-Based Systems, doi:10.1016/j.knosys.2026.117182.
Data provenance: (a) real reported numbers, typed from the abstract into `data.ts` (no export script; the
abstract is the source). `bwa-sparsity.test.ts` pins every value.

## Simplifications
- Only the Gini sparsity results are drawn; sign-accuracy (+5–15 pp for v2 over v1), σ_UQ and the UCI tie are in the text.
- No error bars: the abstract does not give them. Add them from the paper's table if wanted.

## Verification record
- [ ] Muja: numbers match the published KBS version (not only the preprint)
- [ ] Muja: method names match the paper's wording
