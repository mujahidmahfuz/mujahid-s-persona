# council-table — one LLM Council session at a round table (2D, toy)

Source anchor: github.com/mujahidmahfuz/LLM-Council —
`backend/council/ranking.py` (`aggregate`, `kendall_tau`, `agreement`, `parse_ranking`, prompt builders) and
`backend/council/pipeline.py` (`_review`: own answer dropped, others shuffled and lettered; `_chairman_ruling`:
top answer returned as `"fallback"` when the chairman fails). Public `ranking.py` checked identical to the
local copy on 2026-11-03.

Data provenance: (b) toy data — five anonymous seats, hand-written ballot orders (`BALLOT_ORDER`) and
letter rankings (`LETTER_RANKING`) in `model.ts`. Labelled "Illustrative example". No real model names, so
no real model is shown winning or losing.

## Simplifications (also in "How to read this")
- Answers are blank cards; the question is generic.
- Member failures and retries (README failure table) are not drawn; only the unparseable-review and
  chairman-fallback paths are.
- Five seats; the code allows up to 26.

## Formulas and tests (`council-table.test.ts`)
Score per placing 1 − (position − 1)/(n − 1), mean per member, rounded to 4 dp; average rank to 2 dp; members
nobody ranked score null and sort last; agreement = mean pairwise Kendall τ. Reference values were produced by
running the project's own `ranking.py` on the same rankings (full session and with Seat 4's review dropped).

## Verification record
- [ ] Muja: the steps match how a session runs
- [ ] Muja: set `verified: true` in `src/content/projects/llm-council.mdx`
