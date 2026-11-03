# CLAUDE.md — Muja's Personal Research Website

This file is loaded on every turn. It holds the rules. Detailed specs live in `docs/`.
Read the doc named for a task **before** starting that task.

| Task | Read first |
|---|---|
| Any page, route, data model | `docs/SPEC.md` |
| Any colour, font, layout, motion, epigraph, page design | `docs/DESIGN.md` (authoritative design reference) |
| Any 2D/3D explainer | `docs/EXPLAINERS.md` |
| Writing or showing any fact about Muja | `docs/CONTENT-INVENTORY.md` |
| Before saying "done" | `docs/QUALITY-GATES.md` |
| Deployment, CI, domains | `docs/DEPLOY.md` |

---

## 1. What we are building

- A personal academic + portfolio website for **Md Mujahidul Islam ("Muja")**.
- Audience, in priority order: (1) graduate admissions committees and professors (MIT CSAIL, Stanford, Harvard, Oxford, ETH Zurich), (2) research collaborators, (3) recruiters / investors, (4) friends, teammates.
- Every research paper and every project gets its **own page**, generated from a content file.
- Each research/project page has **2D explainers** (SVG / Canvas) and, where it helps understanding, a **3D explainer** (Three.js).
- Sports section with **videos**.
- **Hosting must cost $0.** No paid service, no trial that expires, no credit card required.

## 2. Fixed stack (do not change without asking)

- **Astro** (current stable) — static output (`output: 'static'`).
- **Content collections** with Zod schemas for: `research`, `projects`, `publications`, `education`, `experience`, `awards`, `sports`, `videos`, `talks`, `notes`.
- **MDX** for page bodies, so explainers can be embedded as components.
- **React islands** only where interaction is needed (explainers, filters). Everything else is `.astro` with zero JS.
- **Three.js via @react-three/fiber + @react-three/drei** for 3D. Lazy-loaded with `client:visible`.
- **SVG + D3 modules (d3-scale, d3-shape, etc., not the full `d3` bundle)** or plain Canvas for 2D.
- **Tailwind CSS v4** via the Vite plugin, theme defined in CSS with `@theme`. **There is no `tailwind.config.js` in v4. Do not create one.**
- **Pagefind** for free static full-text search.
- **TypeScript strict mode.**
- **Hosting: GitHub Pages**, deployed by GitHub Actions, repo `mujahidmahfuz/mujahidmahfuz.github.io` → `https://mujahidmahfuz.github.io/`.
- **Videos: YouTube (unlisted or public) embedded through a click-to-load facade** using `youtube-nocookie.com`. Never commit large video files to git.

Before writing any config file, run `npm ls <package>` and read the installed version's docs. Never write config from memory for a different major version.

## 3. Non-negotiable rules

### Truthfulness (most important)
1. **Never invent facts about Muja.** No made-up awards, metrics, dates, co-authors, venues, GPAs, citations, results, quotes or testimonials.
2. If a fact is missing, insert a visible placeholder: `TODO(muja): <what is needed>` and add it to `TODO-MUJA.md` at repo root. Pages with placeholders still build; the placeholder is rendered as a small dashed badge in dev and **hidden in production builds** (see SPEC §7).
3. Every project has a `status` field: `published | accepted | under-review | in-preparation | in-progress | prototype | concept | archived`. Display it honestly on the card and the page. A concept is never shown as a result.
4. Publication metadata (title, authors, venue, year) comes from **Crossref by DOI** at build time, with a committed JSON fallback. Never type author lists from memory.
5. Explainers must be **faithful to the actual method**. If unsure how the method works, stop and ask; do not draw a generic neural network and call it the method. Follow `docs/EXPLAINERS.md` §3 (fidelity protocol).

### Privacy
6. Never publish: student ID, home address, phone number, date of birth, passport/visa details, grades of other people, or anything marked `private: true` in content.
7. Email is shown obfuscated (assembled client-side) or via a contact form service on a free tier. No plain `mailto:` scraping target.

### Free deployment
8. No server, no database, no paid API. Everything is pre-rendered. "Dynamic" means: generated routes from content, client-side filtering/search, build-time data fetching (Crossref, ORCID, GitHub), scheduled rebuilds via GitHub Actions cron.
9. Build-time fetches must **never fail the build**. On network error, use the cached JSON in `src/data/cache/` and log a warning.

### Design
10. The visual identity is **"An Atlas of a Curious Mind"** (`docs/DESIGN.md`, from `Website_Redesign.md`): parchment and ink surfaces, verdigris/petrol dark sections, indigo links, chapter accents per discipline; Cormorant Garamond + Inter + IBM Plex Mono (+ Amiri for Quranic Arabic). Fill-only accents (saffron, terracotta, copper, olive) are **never text on light surfaces** — use the `*-ink` variants; the guard enforces this. Every text/background pair must pass WCAG 2.2 AA. Do not drift into a generic template, a space theme, or black-white-grey.
10a. **Every route has exactly one epigraph** from `src/data/epigraphs.ts`. Quranic text is never typed by hand — add the reference and run `npm run epigraphs` (Arabic: Tanzil; English: Saheeh International). Literature quotes must be verified against a public-domain text; original thoughts are labelled "Original reflection". Never fabricate or trim a verse or attribution.
10b. Publication covers are original artwork and must be labelled as such unless an official image with confirmed reuse rights is supplied.
11. Respect `prefers-reduced-motion`: all animation and auto-rotation stop; 3D scenes show a static poster.
12. Every 3D scene has a **2D/static fallback** (no WebGL, low-power device, reduced motion, JS disabled).

### Routes
13. Do **not** create a route at `/quantum-cookbook`. That path is already served by Muja's separate repo `mujahidmahfuz/quantum-cookbook`. Link to it as an external project.
14. All internal links use the `withBase()` helper so the site still works if moved to a sub-path.

## 4. How to work

- **One phase at a time.** Phases are defined in `docs/PROMPTS.md`. Do not start the next phase until the current phase passes its gate.
- **Plan before editing.** For any task touching more than 3 files, first print a short plan (files to create/modify, why) and wait for approval.
- **Small commits.** One logical change per commit, conventional-commit messages (`feat:`, `fix:`, `content:`, `chore:`).
- **Run the gate, then report.** "Done" means `npm run check` passes (see QUALITY-GATES). Paste the actual command output summary, not a claim.
- **Never delete Muja's content files** to make a build pass. Fix the schema or the component instead.
- **Ask instead of guessing** when: a fact about Muja is missing, a method is unclear, a design choice conflicts with these rules, or a free-tier limit is involved.
- When you hit an error twice with the same approach, stop, explain the error, and propose a different approach.

## 5. Commands

```bash
npm run dev        # local dev server
npm run build      # production build + pagefind index
npm run preview    # serve the built site
npm run check      # astro check + tsc + lint + content validation + link check
npm run test:e2e   # Playwright smoke + accessibility tests
npm run sync:pubs  # refresh Crossref/ORCID cache in src/data/cache/
```

## 6. Known mistakes to avoid (short list — full list in QUALITY-GATES §4)

- Writing `tailwind.config.js` for Tailwind v4.
- Importing `three` in a `.astro` frontmatter or a non-island component (breaks SSR build: `window is not defined`).
- Using `client:load` for 3D (blocks first paint). Use `client:visible`.
- Hard-coding `/research/...` links without the base helper.
- Committing `.mp4` files > 10 MB.
- Invented numbers in explainers ("accuracy 98%").
- Fill-only accents (saffron/terracotta/copper/olive) as text on parchment; a new page without its epigraph; an unlabelled conceptual diagram.
- Skipping `getStaticPaths()` on dynamic routes (`[slug].astro`) — required for static output.
- Forgetting `.nojekyll` / using the old branch-based Pages deploy instead of the Actions deploy.
- Leaving `console.log`, unused deps, or placeholder Lorem Ipsum in production.
