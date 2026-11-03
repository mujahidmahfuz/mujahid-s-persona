/** WCAG 2.x relative luminance and contrast ratio. Used by /styleguide and unit tests. */
function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? [...h].map((x) => x + x).join('') : h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(fg: string, bg: string): number {
  const a = luminance(fg);
  const b = luminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

export const PALETTE = {
  parchment: '#f2e6cc',
  paper: '#e6d3af',
  ivory: '#fbf6ea',
  ink: '#26332e',
  'ink-soft': '#4c574d',
  verdigris: '#1d4b45',
  petrol: '#17363d',
  indigo: '#354a87',
  'terracotta-ink': '#8e3b26',
  'saffron-ink': '#7a5410',
  'olive-ink': '#4f5636',
  mulberry: '#78455f',
  'saffron-light': '#e8c06a',
  terracotta: '#b65d42',
  saffron: '#d3a13c',
  blush: '#f3ddc4',
} as const;
