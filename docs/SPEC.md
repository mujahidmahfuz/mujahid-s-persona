# SPEC — Pages, Routes, Content Model, Dynamic Features

## 1. Definition of "dynamic" for this site

The site has no server (it must be free). "Dynamic" means all of the following:

| Requirement | How it is met |
|---|---|
| Each paper/project gets its own page automatically | Content collections + `[slug].astro` with `getStaticPaths()` |
| Adding a new paper = adding one file | One `.mdx` file in `src/content/research/` creates the card, the page, tag links, search entry, sitemap entry |
| Pages respond to the visitor | Client-side filters, sort, search (Pagefind), interactive 2D/3D explainers |
| Data stays current without manual edits | Build-time sync from Crossref (DOI), ORCID public API, GitHub REST API; weekly scheduled rebuild via GitHub Actions cron |
| Cross-linking | Related items computed at build from shared tags/areas; topic pages per tag |

## 2. Sitemap and routes

| Route | Type | Purpose |
|---|---|---|
| `/` | static | Hero, one-line positioning, featured research (3), featured projects (3), latest achievement, sports strip, CTA (CV, contact) |
| `/about` | static | Bio (short + long), research interests, timeline generated from education + experience + awards |
| `/education` | static | Degrees, institution, expected graduation, relevant coursework, academic honours |
| `/research` | index | All research entries. Filters: area, status, year, kind. Sort: date, featured |
| `/research/[slug]` | generated | Dedicated research page (layout in §4) |
| `/publications` | index | Only entries with a DOI or accepted venue. Formatted citation, copy-BibTeX button, links |
| `/projects` | index | All projects. Filters: category, status, stack, year |
| `/projects/[slug]` | generated | Dedicated project page (layout in §4) |
| `/experience` | index | TA / SA / research roles |
| `/experience/[slug]` | generated | One page per role |
| `/achievements` | index | Competitions, awards, honours |
| `/achievements/[slug]` | generated | One page per achievement (context, rank, evidence link, photos) |
| `/sports` | index | Sports overview, teams, leagues, video grid |
| `/sports/[slug]` | generated | One page per team/season (e.g. TIU Soccer 2023–2025) |
| `/videos` | index | All videos (sports, talks, demos), filter by category |
| `/videos/[slug]` | generated | One page per video with description and related content |
| `/notes` | index | Optional blog / research notes (Phase 6) |
| `/notes/[slug]` | generated | One note |
| `/topics/[tag]` | generated | Everything sharing a tag (research + projects + notes + videos) |
| `/cv` | static | HTML CV generated from the same collections + PDF download |
| `/contact` | static | Obfuscated email, Google Scholar, ORCID, GitHub, LinkedIn |
| `/search` | static | Pagefind UI (also opened by Ctrl/Cmd+K anywhere) |
| `/404` | static | Branded not-found page with search |
| `/rss.xml`, `/sitemap-index.xml` | generated | Feeds |

External (link only, never re-route): `https://mujahidmahfuz.github.io/quantum-cookbook/`, Google Scholar, ORCID, DOIs.

## 3. Content model (Zod schemas in `src/content.config.ts`)

Shared enums:

```ts
const status = z.enum([
  'published', 'accepted', 'under-review', 'in-preparation',
  'in-progress', 'prototype', 'concept', 'archived',
]);
const area = z.enum([
  'xai', 'machine-learning', 'continual-learning', 'quantum-computing',
  'quantum-networking', 'quantum-sensing', 'medical-ai', 'computational-biology',
  'neuromorphic', 'cognitive-science', 'cryptography', 'optimization', 'hci', 'systems',
]);
const sourced = z.object({ text: z.string(), source: z.string() }); // source = "Paper §4.2, Table 3" or URL
const explainer = z.object({
  id: z.string(),                 // matches a component in src/explainers/registry.ts
  dim: z.enum(['2d', '3d']),
  title: z.string(),
  caption: z.string(),            // 1–2 sentences, plain language
  verified: z.boolean().default(false), // set true only after EXPLAINERS.md §3 is passed
});
```

### `research` (one file per paper or study)

| Field | Type | Notes |
|---|---|---|
| `title` | string | If `doi` is set, overwritten by Crossref title at build |
| `summary` | string ≤ 280 chars | Plain-language, used on cards and meta description |
| `status` | status | Required |
| `kind` | `journal-article \| conference-paper \| preprint \| technical-report \| thesis \| study` | |
| `doi` | string? | Triggers Crossref sync |
| `venue`, `year` | optional | Fallback if no DOI |
| `authors` | string[]? | Fallback only. Crossref wins when DOI exists |
| `myRole` | string | e.g. "First author: method, experiments, writing" — must come from Muja |
| `advisor` | string? | |
| `areas` | area[] | ≥ 1 |
| `tags` | string[] | free tags, kebab-case |
| `date` | date | Publication or last-update date |
| `links` | `{ paper?, pdf?, code?, data?, slides?, poster?, arxiv? }` | URLs |
| `cover` | image? | Astro `image()` helper |
| `keyFindings` | sourced[] | Every finding must cite where it comes from |
| `explainers` | explainer[] | Rendered in page order |
| `featured` | boolean | Home page |
| `private` | boolean | If true: excluded from build entirely |

### `projects`

| Field | Type | Notes |
|---|---|---|
| `title`, `summary`, `status` | as above | |
| `category` | `software \| mobile-app \| hardware \| research-tool \| education \| competition \| platform` | |
| `stack` | string[] | e.g. Flutter, Kotlin, FastAPI |
| `role` | string | |
| `period` | `{ start: date, end?: date }` | No end = ongoing |
| `links` | `{ repo?, live?, demo?, store?, report? }` | |
| `repo` | `owner/name`? | Triggers GitHub stats sync (stars, language, last commit) |
| `highlights` | sourced[] | |
| `relatedResearch` | reference('research')[] | |
| `explainers`, `cover`, `areas`, `tags`, `featured`, `private` | as above | |

### `education`, `experience`, `awards`, `sports`, `videos`, `notes`

- `education`: `institution, degree, major, start, expectedEnd?, end?, location, coursework[], honours[], gpa? (private by default)`
- `experience`: `role, org, type (ta|sa|research|internship|leadership|other), start, end?, supervisor?, course?, description, tags`
- `awards`: `title, issuer, date, rank?, category (competition|academic|research|sports|other), description, evidenceUrl?, photos[]`
- `sports`: `team, sport, org, leagues[], start, end?, position?, highlights (sourced[]), photos[], videos (reference('videos')[])`
- `videos`: `title, provider ('youtube'), videoId, date, category (sports|talk|demo|explainer), description, related ({collection, slug})[]`, optional `start` (seconds)
- `notes`: `title, date, summary, tags, draft`

Validation: `npm run check` must fail on unknown enum values, missing required fields, broken references, and `summary` > 280 chars.

## 4. Detail page layouts

### `/research/[slug]` — order is fixed

1. **Header**: title, status badge, venue + year, authors (Muja's name in bold), links row (Paper · PDF · Code · Data · BibTeX).
2. **TL;DR**: `summary`, max 3 lines.
3. **The problem** (MDX section, plain language, 1 paragraph).
4. **Explainer 1 — 2D**: the core idea as a diagram or interactive figure.
5. **Method** (MDX). Equations via KaTeX (build-time render, no client JS).
6. **Explainer 2 — 3D** (only if 3D genuinely adds understanding; see EXPLAINERS §2).
7. **Key findings**: list from `keyFindings`, each with its source in small text.
8. **Limitations & honest notes** (MDX). Required section — admissions readers value this.
9. **My role**.
10. **Cite**: formatted citation + copy BibTeX.
11. **Related**: up to 3 items with shared areas/tags.
12. Prev / next navigation within the collection.

Sticky table of contents on desktop (≥ 1024 px); collapsible on mobile.

### `/projects/[slug]`

Header (title, status, period, stack chips, links) → TL;DR → Why it exists → 2D architecture/flow explainer → Features / phases → optional 3D explainer → Screenshots / demo video (facade) → Highlights (sourced) → What I learned / limitations → Role → GitHub stats card (if `repo`) → Related.

### Index pages

- Card grid; each card: cover (or generated pattern in brand colours), title, status badge, 1-line summary, 3 tags.
- Filters update the URL query (`?area=xai&status=published`) so filtered views are shareable.
- Filters work without JS degraded to "show all".

## 5. Build-time data sync (`scripts/sync.ts`, run by `npm run sync:pubs` and in CI)

| Source | Endpoint | Used for | Notes |
|---|---|---|---|
| Crossref | `https://api.crossref.org/works/{doi}` | Title, authors, venue, year, BibTeX | Send `User-Agent` with a mailto per Crossref etiquette |
| Crossref BibTeX | `https://doi.org/{doi}` with `Accept: application/x-bibtex` | Copy-BibTeX | Cache result |
| ORCID | `https://pub.orcid.org/v3.0/0009-0007-8507-3370/works` with `Accept: application/json` | Detect new works not yet in `research/`; print a warning listing them | Never auto-create pages |
| GitHub | `https://api.github.com/repos/{owner}/{repo}` | Stars, primary language, `pushed_at` | Use `GITHUB_TOKEN` in Actions |
| Google Scholar | — | **No API. Do not scrape.** Link only | |

Rules: results written to `src/data/cache/*.json` and committed; on any network failure, keep the old cache and print a warning; never fail the build.

## 6. Global features

- Header: name/logo, nav (Research, Projects, Publications, Achievements, Sports, About, CV), search button (Ctrl/Cmd+K), theme toggle (optional, Phase 6).
- Footer: social links, ORCID, Scholar, "last updated" (build date), source link.
- SEO: `<title>`, meta description from `summary`, canonical URL, Open Graph + Twitter cards, JSON-LD (`Person` on home, `ScholarlyArticle` on research pages with DOI, `SoftwareSourceCode` on projects with repo).
- OG images: generated at build per page in brand colours (Phase 6).
- Sitemap, RSS, `robots.txt`.
- Privacy-friendly analytics optional (free tier, no cookies) — ask Muja before adding.

## 7. Placeholder handling

- Component `<Todo>` and frontmatter value `"TODO(muja): …"`.
- Dev: rendered as a dashed pink badge so gaps are visible.
- Production: the element containing a TODO is **omitted**; the build prints a list of all TODOs; `scripts/todos.ts` regenerates `TODO-MUJA.md`.
- A research/project page whose `summary` is still a TODO is excluded from production entirely.

## 8. Performance and accessibility budgets

| Metric | Budget |
|---|---|
| Lighthouse (mobile) Performance / Accessibility / Best Practices / SEO | ≥ 90 / 100 / 100 / 100 on home, one research page, one project page |
| JS on a page without explainers | ≤ 15 KB gzipped |
| JS on a page with a 3D explainer, before scrolling to it | ≤ 15 KB gzipped (3D loads on visibility) |
| Largest image delivered | ≤ 250 KB (Astro `<Image>` → AVIF/WebP, responsive `srcset`) |
| WCAG | 2.2 AA; keyboard reachable; visible focus; alt text on every image; captions/transcripts linked for videos where available |

## 9. Redesign additions (Nov 2026 — `Website_Redesign.md`, design in `docs/DESIGN.md`)

- **Epigraph on every route.** Every page renders exactly one `<Epigraph page="…">`. Keys: `home`, `about`,
  `research`, `publications`, `projects`, `achievements`, `sports`, `education`, `experience`, `notes`,
  `videos`, `search`, `topics`, `cv`, `contact`, `404`, `styleguide`, and `<collection>/<id>` for entries
  (`research/…`, `projects/…`, `experience/…`, `achievements/…`, `sports/…`). Topic pages use `topics/<tag>`
  (shared pool). A new entry without its own registry item falls back to its section's epigraph — add one.
- **Chapters.** Pages and cards carry `data-chapter` from `chapterFor(areas)` for their colour identity.
- **Home** (§2 `/`): opening + instrument + contents, epigraph band, featured research (editorial list),
  workshop (flip cards), library (paper objects), on the desk, ledger, beyond research, questions + contact.
- **Research pages** add: breadcrumb, original cover, DOI line, epigraph, § numbering, and at least one
  visual — an explainer and/or a `<Flow>` (`kind="documented"` from sources, or `kind="conceptual"`).
- **Project pages** add: stage note per status (an idea is never shown as a product), spec sheet
  (stack, my part, repository), epigraph (margin), and a `<Flow>` where the project has a describable process.
- **Publications**: `PaperObject` per paper — cover (original art), Crossref record, stamp, actions
  (paper page, PDF only if one exists, preprint, publisher, citation + BibTeX).
