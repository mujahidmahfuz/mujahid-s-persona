# PROMPTS — Paste these into Claude Code, one phase at a time

## How to use

- Start every phase in a **fresh session** (`/clear`), so old context does not leak in. `CLAUDE.md` reloads automatically.
- Turn on **plan mode** (Shift+Tab) for Phases 1–4. Approve the plan only if it matches the docs.
- Paste the prompt exactly. Fill the `<…>` parts.
- Do not move to the next phase until the report says `PASS` and you have looked at the site yourself (`npm run dev`).
- If Claude Code goes off track, use the **Recovery prompts** at the bottom.

---

## Phase 0 — Understanding check (no code)

```
Read CLAUDE.md and every file in docs/. Do not write any code yet.

Then reply with:
1. A 10-line summary of what we are building, the stack, and the hosting.
2. The 10 rules you consider most likely to be broken during this project, and how you will prevent each.
3. Every contradiction or ambiguity you found across the docs.
4. Questions you need me to answer before Phase 1 (max 8, numbered).
5. Your version check: run `node -v` and `npm view astro version`, `npm view tailwindcss version`, `npm view @react-three/fiber version`, `npm view three version` and list them. Note any major-version change that affects the docs.

Do not install anything. Do not create files.
```

## Phase 1 — Scaffold, design system, deploy "hello world"

```
Phase 1. Goal: a deployed skeleton with the design system, layout and guardrails — no real content yet.

Do:
1. Scaffold Astro (current stable, TypeScript strict, static output) in the repo root. Add MDX, React, sitemap integrations; Tailwind v4 via the Vite plugin. Read the installed versions' docs before writing configs.
2. Implement the design tokens from docs/DESIGN.md §1 and §6 exactly. Self-host fonts with @fontsource.
3. Build BaseLayout (skip link, header with nav from SPEC §6, footer, SEO head component), and components: Button, Chip, StatusBadge, Card, SectionHeading, LinkRow, Todo.
4. Create a /styleguide page (excluded from sitemap and production nav) showing every component, every colour pair with its contrast ratio computed in code, and focus states.
5. Create stub pages for every route in SPEC §2 with a single <h1>, so navigation works.
6. Add scripts: dev, build, preview, check, test:e2e, sync:pubs (stub). Implement scripts/guard.mjs with every check in QUALITY-GATES §1.
7. Add Playwright with the route/axe/viewport tests from QUALITY-GATES §2 (only those that apply now).
8. Add .github/workflows/deploy.yml and ci.yml per DEPLOY §3.
9. Create TODO-MUJA.md.

Do not add content beyond stubs. Do not add explainers.
Finish with the report format from QUALITY-GATES §5, and tell me the exact git commands to push to github.com/mujahidmahfuz/mujahidmahfuz.github.io.
```

## Phase 2 — Content model, index pages, dedicated pages

```
Phase 2. Goal: every research paper, project, experience, achievement, sports entry and video has its own generated page from content files.

Do:
1. Implement src/content.config.ts with every collection and schema in SPEC §3. Fail validation on unknown enums, broken references, summary > 280 chars.
2. Create content files from docs/CONTENT-INVENTORY.md ONLY. One file per row marked "Yes". For rows marked "Ask", create the file with `private: true` and list them in TODO-MUJA.md under "Visibility decisions". Every missing fact = `TODO(muja): …`. Do not invent anything.
3. Implement the TODO behaviour from SPEC §7 (visible in dev, omitted in production, list printed at build, TODO-MUJA.md regenerated).
4. Build index pages with filters that sync to the URL query and degrade to "show all" without JS.
5. Build detail pages with the exact section order in SPEC §4, sticky TOC on desktop, prev/next, related items (shared areas/tags, max 3).
6. Leave an <Explainer> placeholder slot in each research/project page (renders nothing until Phase 4).
7. Build /topics/[tag].
8. Extend e2e tests: every generated page returns 200, one <h1>, axe 0 violations.

Before writing content files, show me the list of files you will create and the TODOs each will contain. Wait for my approval.
End with the QUALITY-GATES §5 report.
```

## Phase 3 — Live publication data (Crossref, ORCID, GitHub)

```
Phase 3. Goal: publication metadata and GitHub stats come from real sources at build time, with cached fallback.

Do:
1. Implement scripts/sync.ts per SPEC §5: Crossref works + BibTeX by DOI, ORCID works list, GitHub repo stats. Polite User-Agent. Write to src/data/cache/*.json. Never throw on network errors; keep the old cache and warn.
2. Merge Crossref data over frontmatter at build (title, authors, venue, year). Muja's name is bolded in author lists by matching "Islam, Md Mujahidul" variants — show me the matching rule.
3. /publications page: formatted citation (APA-like), copy-BibTeX button (works without layout shift, announces "Copied" via aria-live), DOI link, link to the research page.
4. ORCID: print a build warning listing works on ORCID that have no research file. Never auto-create pages.
5. GitHub stats card on project pages with `repo` set.
6. JSON-LD ScholarlyArticle on research pages with a DOI.
7. Run `npm run sync:pubs` now and show me the fetched titles/authors so I can confirm they are correct.

End with the QUALITY-GATES §5 report.
```

## Phase 4 — Explainer framework + first explainers

```
Phase 4. Goal: the explainer system from docs/EXPLAINERS.md, plus the first explainers that have real inputs.

Part A — framework only:
1. Build src/explainers/ structure, registry, shared controls (Slider, StepControls, Legend, SceneShell, useReducedMotion, useInView), Explainer.astro and ExplainerFrame exactly as in EXPLAINERS §1.
2. scripts/posters.ts: Playwright screenshots each explainer at 1200×675 into poster.png.
3. Production rule: explainers with verified:false are not rendered.
4. Two demo explainers in /styleguide only: a 2D toy (labelled "Illustrative example") and a 3D toy (rotating lattice). Prove: poster first, island on visibility, reduced-motion fallback, keyboard controls, render loop pauses off-screen, JS budget from SPEC §8.
Stop after Part A and report.

Part B — real explainers (one per session):
Build the explainer `<id>` for page `<slug>`.
Inputs I am providing: <paths in content-source/>.
Follow the fidelity protocol in EXPLAINERS §2 step by step. Before coding, write README.md with Source anchor, Data provenance, Simplifications, and the list of formulas you will compute with their unit tests. Wait for my approval of the README. Then build, test, generate the poster, and show me screenshots at 360 px and 1440 px.
Leave verified:false — I will set it to true after checking.
```

Recommended Part B order (inputs are simplest first): DoomBreak System Map → Sleep continual-learning timeline + Pareto (needs results JSON) → BWA barycenter (needs attribution arrays) → Lossmap percolation lattice 2D + 3D → NV-centre ODMR 2D + 3D → QLNRS → others.

## Phase 5 — About, experience, achievements, sports, videos, CV

```
Phase 5. Goal: the personal side of the site.

Do:
1. /about: short + long bio from CONTENT-INVENTORY §9 (wording edits only, no new facts), research interests, Timeline component generated from education + experience + awards.
2. /education, /experience(+[slug]), /achievements(+[slug]).
3. /sports and /sports/[slug]: team page with leagues, period, highlights, photo grid (Astro <Image>, AVIF/WebP), and a video grid.
4. VideoFacade component: thumbnail + play button; loads youtube-nocookie iframe only on click; keyboard-accessible; title shown; no request to YouTube domains before click (add e2e test).
5. /videos and /videos/[slug] with related content.
6. /cv: HTML CV generated from collections, print stylesheet, and a build step that renders cv.pdf with Playwright into dist/.
7. /contact with obfuscated email and profile links.

Every missing fact → TODO(muja). End with the QUALITY-GATES §5 report.
```

## Phase 6 — Search, SEO, performance, polish

```
Phase 6. Goal: discoverability and speed.

Do:
1. Pagefind index after build; SearchDialog opened by Ctrl/Cmd+K and the header button; /search page. Exclude nav/footer from indexing.
2. SEO per SPEC §6: canonical, OG/Twitter meta, JSON-LD Person on home, sitemap, robots.txt, RSS for notes.
3. Build-time OG images per page in brand colours (satori + resvg or the current recommended Astro approach; must be free and run in CI).
4. Lighthouse CI with SPEC §8 budgets on home, one research page, one project page. Fix until passing.
5. Optional theme toggle (deep-blue mode) only if it keeps every contrast pair ≥ 4.5:1 — show me the computed table first.
6. Remove unused deps (depcheck), dead code, console logs.

End with the QUALITY-GATES §5 report including Lighthouse scores.
```

## Phase 7 — Independent review

```
Phase 7. Use a subagent that has NOT seen this conversation. Give it only the built site (npm run preview URL), CLAUDE.md and docs/. Ask it to review as three people, separately:
(a) a graduate admissions reviewer at a top CS programme — is the research clear in 30 seconds, is anything overclaimed, what is missing;
(b) a WCAG 2.2 AA auditor — test keyboard, contrast, screen-reader text of explainers;
(c) a front-end performance engineer — bundle sizes, images, layout shift.
Collect findings into REVIEW.md ranked by severity. Do not fix anything yet; show me the list.
```

---

## Maintenance prompts (use any time)

### Add a new paper or project

```
Add a new <research|project> entry.
Source material: content-source/<path>.
Create the content file using the schema, fill only facts present in the source, TODO(muja) for the rest, run sync if it has a DOI, propose (do not build) a 2D and 3D explainer plan following EXPLAINERS §1 "When to use 3D", then run npm run check and report.
```

(Or use the slash command `/add-research` or `/add-project` from `.claude/commands/`.)

### Add a video

```
Add video: YouTube ID <id>, title "<title>", date <YYYY-MM-DD>, category <sports|talk|demo|explainer>, description "<one line>", related to <collection/slug>. Run check and show me the page.
```

### Fix a bug

```
Bug: <what I see> on <URL/route> at <viewport/browser>. Expected: <what should happen>.
First reproduce it with a failing Playwright test. Then fix it with the smallest change. Show the test passing and the diff summary.
```

---

## Recovery prompts (when Claude Code makes mistakes)

### It invented facts
```
Stop. You wrote facts that are not in docs/CONTENT-INVENTORY.md or content-source/. List every such sentence with file and line, replace each with TODO(muja), add them to TODO-MUJA.md, and re-read CLAUDE.md §3 "Truthfulness" before continuing.
```

### It is looping on the same error
```
Stop editing. Summarise: the error, the 2–3 approaches you tried, and why each failed. Then read the installed package's docs/changelog for this API, and propose one new approach with reasoning. Wait for my approval.
```

### It ignored the design rules
```
Run node scripts/guard.mjs and the axe tests. List every colour/contrast/motion violation against docs/DESIGN.md, fix them, and show the /styleguide page screenshot.
```

### It drifted from scope
```
Stop. List every file you changed that is not required by the current phase in docs/PROMPTS.md. Revert those changes (git restore / git revert), then continue with only the current phase.
```

### It claims "done" without proof
```
Run npm run check and npm run test:e2e now and paste the last 30 lines of each. Then give the QUALITY-GATES §5 report. Do not summarise from memory.
```
