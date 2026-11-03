# Redesign plan — "An Atlas of a Curious Mind" (Website_Redesign.md)

## Phase 0 audit (Nov 2026)

**Keep (architecture):** Astro 7 static output, content collections + Zod, MDX bodies, React islands
(explainers only, `client:visible`), explainer registry + poster pipeline + fidelity protocol, Crossref/ORCID/GitHub
sync with cache, Pagefind, guard + linkcheck + Playwright/axe + Lighthouse gates, `withBase()`, GitHub Pages deploy.

**Keep (content):** every research/project/experience/award/sports entry, sourced findings, TODO(muja) handling.
No facts change in the redesign.

**Replace:** blue/white/pink palette and its "pink text" rules; Space Grotesk + JetBrains Mono; hero network;
generic card grid look; journal-badge-as-cover; uniform page headers.

**Improve:** cards (index-card / specimen look, front keeps a summary line, flip kept for the full summary);
publications (paper objects with original cover art, clearly labelled); every route gets an epigraph.

**Remove:** topic marquee (constant background motion), hero network.

**Limits found:** no paper PDFs or official cover permissions in the repo → original, labelled cover art + a
"first page" preview generated from Crossref metadata; PDF actions appear only where a PDF/preprint exists.

## Build order
1. Design system: tokens (colour, type, space, texture, motion), chapters (per-discipline accents), fonts,
   Epigraph registry + component (Quran text from the Tanzil/alquran.cloud API, never typed by hand;
   literature quotes verified against Project Gutenberg texts; original reflections labelled).
2. Homepage — 9 sections, celestial-instrument hero (rings = research areas, real counts, links).
3. Research index + paper pages + publications library + PDF/paper objects; a signature visual per paper.
4. Project index + pages; a visualisation per project from its sources.
5. All remaining routes restyled; epigraph on every route.
6. Motion review; 7. QA (check, e2e, a11y, reduced motion, mobile, Lighthouse); docs; deploy.
