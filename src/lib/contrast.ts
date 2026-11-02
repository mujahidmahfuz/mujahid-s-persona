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
  blue: '#09318d',
  'blue-900': '#061f5c',
  'blue-200': '#c7d3f0',
  'blue-050': '#eef2fb',
  pink: '#fd91cc',
  'pink-ink': '#b0306f',
  'pink-100': '#ffe6f3',
  ink: '#0b1530',
  muted: '#4a5677',
  white: '#ffffff',
} as const;
