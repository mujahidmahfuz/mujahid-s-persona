# DESIGN — Colour, Type, Layout, Motion

## 1. Palette (fixed by Muja)

| Token | Hex | Role |
|---|---|---|
| `--blue` | `#09318d` | Primary. Headings, nav, buttons, deep sections, 3D scene background |
| `--white` | `#ffffff` | Page background, text on blue |
| `--pink` | `#fd91cc` | Accent. Highlights, underlines, active states on blue, chart accent, 3D emissive accents |

### Derived tokens (needed for accessibility; do not add other hues)

| Token | Hex | Why |
|---|---|---|
| `--blue-900` | `#061f5c` | Darker section / footer background. White on it: 15.5:1. Pink on it: 7.4:1 |
| `--blue-050` | `#eef2fb` | Very light tint for card backgrounds / zebra rows |
| `--blue-200` | `#c7d3f0` | Borders, dividers on white |
| `--pink-ink` | `#b0306f` | Pink-family **text** on white (6.0:1, AA) |
| `--pink-100` | `#ffe6f3` | Light pink tint for badges/highlights on white (text on it uses `--blue`) |
| `--ink` | `#0b1530` | Body text on white (near-black with blue cast) |
| `--muted` | `#4a5677` | Secondary text on white (7.27:1) and on `--blue-050` (6.48:1) |

### Measured contrast (WCAG 2.x)

| Pair | Ratio | Use |
|---|---|---|
| White on `#09318d` | 11.44:1 | ✅ all text |
| Pink `#fd91cc` on `#09318d` | 5.50:1 | ✅ all text, focus rings on blue |
| Pink `#fd91cc` on white | **2.08:1** | ❌ never for text, icons that carry meaning, or focus rings |
| `#b0306f` on white | 6.00:1 | ✅ pink-family text on white |

### Usage ratio

- Roughly **70 % white, 25 % deep blue, 5 % pink**. Pink is a highlight, not a background for large areas.
- Status badges: `published` = blue fill + white text; `under-review` / `in-preparation` = white + blue border + blue text; `in-progress` / `prototype` = `--pink-100` fill + blue text; `concept` = dashed blue border; `archived` = muted.
- Charts in explainers: blue for the main series, pink for the highlighted/compared series, `--blue-200` for grid/background series. Never encode meaning with colour alone — also use shape, label, or pattern.

## 2. Typography

- Headings: a geometric/grotesk sans (e.g. "Space Grotesk" or "Inter Tight"). Body: "Inter". Code/math: "JetBrains Mono". Self-host with `@fontsource` packages (no Google Fonts request, better privacy and speed).
- Scale (fluid, `clamp()`): H1 2.5→3.5 rem, H2 1.75→2.25 rem, H3 1.25→1.5 rem, body 1.0625 rem, small 0.875 rem.
- Line length 60–75 characters for long-form text. Line height 1.6 body, 1.15 headings.
- Japanese characters are not needed; English only unless Muja asks.

## 3. Layout

- Max content width 72 rem; long-form column 44 rem.
- 8-pt spacing scale.
- Rounded corners 12 px on cards, 999 px on chips.
- Hero: deep blue background, white text, one pink accent element (underline on the name or a pink node in a subtle animated network). Avoid big gradients.
- Section rhythm on the home page: white → blue → white → blue-900 footer.
- Breakpoints: 640 / 768 / 1024 / 1280 px. Design mobile-first; test at 360 px wide.

## 4. Motion

- Subtle: 150–250 ms ease-out on hover/focus; fade/slide-in on scroll ≤ 12 px travel.
- No parallax, no scroll-jacking, no cursor trails.
- `prefers-reduced-motion: reduce` → remove all non-essential motion; 3D scenes render one static frame (or poster image) and stop the render loop.
- 3D scenes pause their render loop when off-screen (`IntersectionObserver`) and when the tab is hidden.

## 5. Components (build once, reuse)

`Button`, `Chip`, `StatusBadge`, `Card` (research / project / video / award variants), `SectionHeading`, `LinkRow`, `Citation`, `BibtexButton`, `TOC`, `FilterBar`, `VideoFacade`, `Figure` (image + caption + credit), `ExplainerFrame` (title, caption, controls, fallback, "how to read this" toggle), `Timeline`, `Todo`, `SearchDialog`.

## 6. Tailwind v4 theme sketch

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  --color-blue: #09318d;
  --color-blue-900: #061f5c;
  --color-blue-200: #c7d3f0;
  --color-blue-050: #eef2fb;
  --color-pink: #fd91cc;
  --color-pink-ink: #b0306f;
  --color-pink-100: #ffe6f3;
  --color-ink: #0b1530;
  --color-muted: #4a5677;
  --color-white: #ffffff;
  --font-display: "Space Grotesk", system-ui, sans-serif;
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
```

Verify the exact v4 syntax against the installed version's docs before writing it.

## 7. Things that look cheap — avoid

- Stock "AI brain" images, glowing circuit backgrounds, neon gradients.
- Emoji as section icons.
- Progress bars for "skills" (e.g. "Python 90%"). Use evidence instead: projects that used the skill.
- Auto-playing video or sound.
- Carousels for important content.
