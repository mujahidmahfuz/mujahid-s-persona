# Muja Site Kit — Start Here

This kit tells Claude Code exactly how to build your personal research website, and how not to make the usual mistakes.

## What is inside

| File | Who reads it | Purpose |
|---|---|---|
| `CLAUDE.md` | Claude Code (auto-loaded every turn) | Stack, hard rules, known mistakes |
| `docs/SPEC.md` | Claude Code | Every page, route, data schema, "dynamic" features |
| `docs/DESIGN.md` | Claude Code | Colours (with contrast checks), fonts, layout, motion |
| `docs/EXPLAINERS.md` | Claude Code | 2D/3D explainer system, fidelity protocol, per-paper plan |
| `docs/CONTENT-INVENTORY.md` | **You first**, then Claude Code | The only facts Claude Code may publish |
| `docs/QUALITY-GATES.md` | Claude Code | Tests and checks that define "done" |
| `docs/DEPLOY.md` | You + Claude Code | Free GitHub Pages deployment |
| `docs/PROMPTS.md` | **You** | Copy-paste prompts, phase by phase, plus recovery prompts |
| `.claude/commands/*.md` | Claude Code | Slash commands: `/add-research`, `/add-project`, `/add-video`, `/verify` |

## Steps

1. Create an empty folder (or the repo `mujahidmahfuz.github.io`) and copy **everything** from this kit into its root, including the hidden `.claude/` folder.
2. Open `docs/CONTENT-INVENTORY.md`. Correct anything wrong, fill what you can, decide the "Ask" rows. This is the most important 30 minutes.
3. Create `content-source/` and drop in: paper PDFs, experiment result JSON/CSV, reports, photos, screenshots.
4. Upload sports videos to YouTube (Unlisted is fine). Paste the IDs into the inventory §8.
5. Open Claude Code in that folder. Paste **Phase 0** from `docs/PROMPTS.md`. Answer its questions.
6. Run Phases 1 → 7, one per fresh session (`/clear`). Check the site yourself with `npm run dev` after each phase.
7. Do the one-time GitHub Pages setup in `docs/DEPLOY.md` §2 after Phase 1.

## The three ideas that prevent most mistakes

- **No invented facts.** Missing information becomes `TODO(muja)`, visible in dev, hidden in production, listed in `TODO-MUJA.md`.
- **Gates, not claims.** A phase is done only when `npm run check` and the tests pass and Claude Code pastes the output.
- **Explainers are verified.** Each one names its source, separates real data from toy data, unit-tests its math, and stays hidden in production until you set `verified: true`.
