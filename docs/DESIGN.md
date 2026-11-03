# DESIGN — "An Atlas of a Curious Mind"

This is the **authoritative design reference**. CLAUDE.md tells every session to follow it.
Source brief: `Website_Redesign.md` (repo root). If a new page cannot be made to fit this document,
change the document deliberately — never drift silently.

## 1. Idea

An unfinished atlas kept by one curious person: part observatory, part library, part inventor's
journal, set as a contemporary editorial publication. Old in its soul, modern in its execution.
The universe is a **metaphor used sparingly** (one instrument on the home page, orbit/measurement
motifs) — never planets, starfields or glowing particles.

Principles, in order: **meaning before decoration · beauty through restraint · discovery over
dumping · every page considered.** If a page looks like a template, it is not finished.

## 2. Colour (tokens in `src/styles/global.css` `@theme`)

| Role | Token | Hex | Notes |
|---|---|---|---|
| Page | `parchment` | #F2E6CC | with a 2 KB inline paper-grain tile |
| Secondary surface / plates | `paper` | #E6D3AF | |
| Tinted panel | `paper-light` | #EFE3C8 | |
| Cards, documents | `ivory` | #FBF6EA | |
| Hairlines (decorative only) | `rule` | #C9B186 | not for meaningful UI boundaries |
| Body text | `ink` | #26332E | 10.6:1 on parchment |
| Secondary text | `ink-soft` | #4C574D | 6.1:1 parchment, 5.2:1 paper; also input/button borders |
| Dark sections | `verdigris` / `petrol` | #1D4B45 / #17363D | ivory text 7.9 / 10.4:1 |
| Links, data series, focus on light | `indigo` | #354A87 | 6.8:1 |
| Accent text on light | `terracotta-ink`, `saffron-ink`, `olive-ink`, `mulberry` | #8E3B26, #7A5410, #4F5636, #78455F | all ≥ 5:1 on parchment |
| Accent **fills/marks only** | `terracotta`, `saffron`, `copper`, `olive` | #B65D42, #D3A13C, #A8653A, #78805A | < 4.5:1 as text — never text on light |
| Text/focus on dark | `saffron-light` | #E8C06A | 5.7:1 on verdigris |
| Highlight tint | `blush` | #F3DDC4 | verdigris text 7.4:1 |

Rules
- Black, white and grey never carry the identity. Surfaces are paper; ink is green-black.
- **Fill-only accents are never text on light surfaces** — enforced by `scripts/guard.mjs` (`text-saffron`, `text-terracotta`, `text-copper`, `text-olive`, `text-pink` allowed only inside `data-surface="dark"`).
- Focus: 3 px indigo outline + blush halo on light; saffron-light outline on dark.
- Legacy class names (`blue`, `pink`, `white`, `muted`, `blue-050`…) are **aliases** of the atlas palette so older markup restyles consistently. New code uses semantic names.
- Charts: one series → one hue (indigo or verdigris), no legend; highlight in terracotta with a label; texture (hatching) for "expected/uncertain"; never colour alone.

### Chapters — colour identities per discipline (`src/lib/chapters.ts`)

Set `data-chapter` on a page, card or row; components read `--accent`, `--accent-ink`, `--accent-2`, `--accent-soft`.

| Chapter | Areas | Accent pair |
|---|---|---|
| explainability | xai, machine-learning | indigo + saffron |
| memory | continual-learning, cognitive-science, neuromorphic | mulberry + saffron |
| quantum | quantum-* | verdigris + indigo |
| life | medical-ai, computational-biology | olive + copper |
| machines | cryptography, systems, optimization | petrol + terracotta |
| people | hci | terracotta + olive |

## 3. Typography

| Use | Face | Notes |
|---|---|---|
| Titles, epigraphs, editorial moments | **Cormorant Garamond** 500/600, italic 500 | h1 uses 500; italics for statements |
| Reading text, navigation, UI | **Inter** 400/600 | body 1.0625 rem, line-height 1.65 |
| Metadata, DOIs, dates, catalogue numbers | **IBM Plex Mono** 400/500 | `.label-mono`: 0.75 rem, +0.08em, uppercase |
| Quranic Arabic | **Amiri**, subset to the verses in use | `scripts/subset-arabic.py`; `lang="ar" dir="rtl"` |

Vary heading treatments: chapter eyebrows (`label-mono`, terracotta-ink), § numbers on detail pages,
roman numerals on featured lists. Do not make every heading huge.

## 4. Layout, texture, components

- Container 88 rem; reading measure 46 rem (figures, explainers and flows use the full column).
- Radius 6 px (cards), 2 px (stamps, actions), full (chips). Shadows are long, soft and warm.
- **Graticule** (`.graticule`): faint 64 px grid behind page headers — the atlas sheet.
- Rhythm: alternate parchment, `paper-light`, and one or two dark bands (verdigris/petrol) per page.
- Components: `PageIntro`, `Epigraph`, `CelestialInstrument`, `PaperCover`, `PaperObject`, `Card` (flip),
  `Flow`, `PitchHero`, charts (`BarList`, `ActivityChart`, `DotRank`, `SeasonBar`), `StatusBadge` (stamp).

## 5. Epigraphs — one human thought per page

Registry: `src/data/epigraphs.ts`. Component: `src/components/Epigraph.astro`. Treatments: `grand`,
`verse`, `margin`, `note`, `plate` — vary them; do not make every epigraph the same card.

- **Quran**: write only the reference. Arabic (Tanzil Uthmani) and English (Saheeh International) are
  fetched by `npm run epigraphs` into `src/data/cache/quran.json`. Show the full verse(s), surah name and
  number, translation source. Never type, trim or alter verse text. Check context before choosing.
- **Literature/philosophy/poetry**: exact text verified against a public-domain edition (`verifyUrl`).
- **Original**: labelled "Original reflection"; never attributed to anyone famous.
- Research pages → knowledge, evidence, discovery. Projects → creation, responsibility. Sports →
  discipline, perseverance. About → personal. Topic pages draw from a shared pool (`pool/*`).
- The guard enforces: exactly one epigraph per built page, no repetition outside the pool, every
  Quran reference present in the cache.

## 6. Publications and papers

- No official cover with confirmed reuse rights is available, so covers are **original artwork**
  (`PaperCover`) and always labelled "original cover art". Do not use journal logos as covers; do not
  fabricate an official cover. If Muja supplies an accepted-manuscript first page or a cover with
  permission, add it and credit it.
- `PaperObject`: layered sheets, stamp, journal/volume/issue/year/DOI from Crossref, actions (paper
  page · PDF if available · preprint · publisher · citation + BibTeX). Never hide information behind hover.

## 7. Motion

| Level | Where | Rules |
|---|---|---|
| Quiet | navigation, links | ≤ 200 ms colour/underline; 200 ms page cross-fade (view transitions) |
| Reveal | sections, lists | opacity + ≤ 12 px rise, once, 40 ms stagger; hidden only when JS runs |
| Object | cards, papers | lift via inner layer (hover target never moves), ≤ 4° tilt on fine pointers, 600 ms flip |
| Explanatory | explainers, flows, instrument | step-throughs with Play/Pause; slow linear rete (240 s) |

Strong curves only: `--ease-out` (0.23,1,0.32,1), `--ease-in-out` (0.77,0,0.175,1). Animate transform and
opacity. Continuous motion pauses off-screen (`data-pause-offscreen`) and in hidden tabs.
`prefers-reduced-motion`: no travel, no autoplay, no rotation; explainers show their final step.
Never: particles, cursor trails, parallax, scroll-jacking, autoplaying sound or video.

## 8. Quality questions before a page is done

Does it belong to this world? Has its own personality? Colour used with intent? Typography composed?
Epigraph relevant? Animation useful? Personal, not templated? Clear hierarchy? Beautiful on a 360 px
phone and without animation? Memorable? Look at the rendered page at 360 and 1440 px — a passing
build is not a finished design.
