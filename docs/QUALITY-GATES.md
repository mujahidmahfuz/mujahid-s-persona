# QUALITY GATES — What "done" means

Claude Code may only report a phase as done after every gate for that phase passes, and it must paste the summary output.

## 1. `npm run check` (every phase)

Runs, in order, and fails fast:

1. `astro check` — type errors in `.astro` files.
2. `tsc --noEmit` — strict TypeScript.
3. `eslint .` and `prettier --check .`
4. `astro sync` + content validation — all frontmatter matches the Zod schemas; references resolve.
5. `node scripts/guard.mjs` — the custom guard (below).
6. `astro build` — production build succeeds with zero warnings from our code.
7. Link check on `dist/` (e.g. `lychee` or `linkinator`) — no broken internal links; external link failures reported as warnings.

### `scripts/guard.mjs` checks

- No file in `public/` or `src/` larger than 10 MB; no `.mp4/.mov/.webm` larger than 10 MB anywhere in the repo.
- No `tailwind.config.*` file exists.
- No string `/quantum-cookbook` used as an internal route.
- No `three` / `@react-three/*` import outside `src/explainers/**`.
- No `client:load` on any component under `src/explainers/**`.
- No fill-only accent (`text-saffron`, `text-terracotta`, `text-copper`, `text-olive`, legacy `text-pink`) used as a text colour on light surfaces — allowed only in files that mark a `data-surface="dark"` container (see DESIGN §2).
- No `lorem`, `ipsum`, `example.com`, `John Doe`, `TODO` (other than the `TODO(muja):` format), `console.log` in `src/`.
- Student ID never appears in content or built HTML. The guard stores only a SHA-256 hash of the ID (Muja supplies it locally via an untracked `.env.local`, `STUDENT_ID_SHA256=...`) and hashes every 8-digit number found in `dist/` to compare. The raw ID is never committed.
- Every explainer folder has `README.md` and `poster.png`; every `verified: true` explainer README contains "Source anchor:" and "Data provenance:" lines.
- Every number inside `keyFindings` / `highlights` text has a non-empty `source`.

## 2. `npm run test:e2e` (Phase 2 onwards)

Playwright, Chromium only (pre-installed in CI with the official action):

- Every route in the sitemap returns 200 and has exactly one `<h1>`.
- `@axe-core/playwright` on home, `/research`, one research page, one project page, `/sports`: **0 violations**.
- Keyboard: Tab reaches skip-link → nav → main content; focus is visible (screenshot diff of focus ring).
- Viewports: 360×800, 768×1024, 1440×900 — no horizontal scroll (`document.documentElement.scrollWidth <= innerWidth`).
- Explainer page: poster visible before island loads; with `reducedMotion: 'reduce'` the 3D canvas is not mounted and the poster remains.
- With JavaScript disabled: all text content readable, nav works, filters show all items.
- Video facade: no request to `youtube` domains until the play button is clicked.

## 3. Lighthouse CI (Phase 5 onwards)

`@lhci/cli` against `dist/` on home, one research page, one project page. Budgets from SPEC §8. Failing budget = failing gate.

## 4. Full list of mistakes to avoid

### Framework / build
| Mistake | Correct approach |
|---|---|
| Writing config from memory for the wrong major version | `npm ls` first, read the installed version's docs |
| `tailwind.config.js` with Tailwind v4 | `@import "tailwindcss"` + `@theme` in CSS, `@tailwindcss/vite` plugin |
| `[slug].astro` without `getStaticPaths()` | Always export `getStaticPaths()` returning every entry (filtered for `private` and production TODOs) |
| Using `entry.slug` vs `entry.id` inconsistently | Check the installed Astro content-layer API; use one helper `entryPath(entry)` everywhere |
| Browser-only libs (three, d3-selection, window) at module top level of SSR code | Import inside islands only; guard `typeof window` where needed |
| `client:load` on heavy islands | `client:visible` (or `client:idle` for small UI) |
| Absolute links without base | `withBase()` helper; `site` and `base` set in `astro.config` |
| Build depends on live API | Cache + fallback, never throw |
| Installing a package for one small function | Check bundle impact; prefer native APIs |
| Leaving unused dependencies | `npx depcheck` before each phase gate |

### Content / honesty
| Mistake | Correct approach |
|---|---|
| Inventing metrics, awards, dates, co-authors | `TODO(muja)` + `TODO-MUJA.md` |
| Typing author lists or titles by hand when DOI exists | Crossref sync |
| Presenting concepts as completed work | `status` badge + "Research directions" grouping |
| Saying "diagnose" for retinal work | "screen for / estimate risk" |
| Overclaiming quantum advantage for QLNRS | Report states no demonstrated advantage — say so |
| Marketing tone ("revolutionary", "cutting-edge", "world-class") | Plain, precise, evidence-first wording |

### Design / accessibility
| Mistake | Correct approach |
|---|---|
| Fill-only accent as text on parchment | the `*-ink` variant (e.g. `terracotta-ink`) or indigo |
| Low-contrast focus ring | Indigo ring on light, saffron-light on dark |
| Colour as the only signal in charts | Add shape/labels/patterns |
| Images without `alt` / decorative images with alt text | Meaningful alt, or `alt=""` for decoration |
| Layout shift when explainer loads | Fixed aspect-ratio container + poster |
| Autoplay video | Click-to-load facade |

### Deployment
| Mistake | Correct approach |
|---|---|
| Branch-based Pages deploy with Jekyll processing | GitHub Actions deploy (`withastro/action` + `actions/deploy-pages`), Pages source = "GitHub Actions" |
| Committing raw videos | YouTube embeds; ≤ 10 MB clips only, compressed |
| Secrets in the repo | None are needed; `GITHUB_TOKEN` is provided automatically in Actions |
| Paid add-ons | Rejected by rule; ask Muja |

## 5. Report format at the end of each phase

```
PHASE N — <name>: PASS | FAIL
Gates: check ✅  e2e ✅  lighthouse ✅ (scores: 98/100/100/100)
Files changed: <count> (list top-level folders)
New TODO(muja) items: <count> — see TODO-MUJA.md
Known limitations: <bullets>
Next phase needs from Muja: <bullets>
```

## 6. Redesign gates (Nov 2026)

Guard (`scripts/guard.mjs`) additionally fails when:
- a fill-only accent (`text-saffron`, `text-terracotta`, `text-copper`, `text-olive`, `text-pink`) is used as text outside `data-surface="dark"`;
- a built page has zero or more than one `data-epigraph`, or a non-pool epigraph appears on two pages;
- a Quran reference in `src/data/epigraphs.ts` is missing from `src/data/cache/quran.json`.

E2E adds `tests/e2e/epigraphs.spec.ts` (one epigraph per page; Arabic has `lang="ar" dir="rtl"`; surah,
verse and translation source are shown). Visual review at 360 px and 1440 px after every major change.
