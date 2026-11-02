# doombreak-architecture — DoomBreak session flow + architecture (2D)

Source anchor: docs/CONTENT-INVENTORY.md §4 (DoomBreak row) and docs/EXPLAINERS.md §3 (DoomBreak row:
"timer → reminders → lock overlay → Save Me; architecture Flutter ↔ Kotlin native usage tracking ↔ FastAPI ↔ LLM").
**Not yet checked against the DoomBreak codebase** — Muja must compare with the code before setting `verified: true`.
Data provenance: no numeric data. Structure only, taken from the source anchor; all names in `model.ts`.

## Simplifications
- Only the components and links named in the source are drawn. Internal modules, storage, notifications,
  error paths and where the lock overlay is implemented (Flutter vs native) are omitted.
- The Flutter ↔ Kotlin arrow is drawn two-way (“↔” in the source); the other links are one-way requests.
- Mission Mode, Net Momentum, streaks and CSV export are listed inside the Flutter block, not drawn.

## Formulas and tests
No formulas. `doombreak-architecture.test.ts` checks every link joins a documented block, the block list
matches the source exactly, and the flow order / step clamping.

## Verification record
- [ ] Muja: architecture matches the code (which layer draws the lock overlay? any other services?)
- [ ] Muja: flow order matches the session state machine
