/** Build-time Open Graph images (1200×630) in brand colours — satori → SVG → resvg → PNG. Free, runs in CI. */
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const font = (pkg: string, file: string) => readFileSync(join(process.cwd(), 'node_modules/@fontsource', pkg, 'files', file));
let fonts: { name: string; data: Buffer; weight: 400 | 700; style: 'normal' }[] | undefined;
function loadFonts() {
  fonts ??= [
    { name: 'Space Grotesk', data: font('space-grotesk', 'space-grotesk-latin-700-normal.woff'), weight: 700, style: 'normal' },
    { name: 'Inter', data: font('inter', 'inter-latin-400-normal.woff'), weight: 400, style: 'normal' },
  ];
  return fonts;
}

type Node = { type: string; props: Record<string, unknown> & { children?: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({ type, props: { style, children } });

export async function ogImage({ eyebrow, title, footer }: { eyebrow: string; title: string; footer: string }): Promise<Buffer> {
  const size = title.length > 90 ? 48 : title.length > 55 ? 58 : 68;
  const tree = h(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#09318d',
      padding: '56px 72px',
      fontFamily: 'Inter',
      color: '#ffffff',
    },
    [
      h('div', { display: 'flex', height: 40, alignItems: 'center', gap: 16, fontSize: 28, color: '#fd91cc' }, [
        h('div', { width: 18, height: 18, borderRadius: 9, background: '#fd91cc' }),
        eyebrow,
      ]),
      h('div', { display: 'flex', height: 380, alignItems: 'center' }, [
        h(
          'div',
          { display: 'flex', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: size, lineHeight: 1.12, maxWidth: 1050 },
          title,
        ),
      ]),
      h('div', { display: 'flex', height: 90, alignItems: 'flex-end', fontSize: 26, color: '#c7d3f0' }, [
        h('div', { display: 'flex', flexDirection: 'column' }, [
          h(
            'div',
            {
              display: 'flex',
              fontFamily: 'Space Grotesk',
              fontWeight: 700,
              color: '#ffffff',
              fontSize: 30,
              borderBottom: '5px solid #fd91cc',
              paddingBottom: 4,
            },
            'Md Mujahidul Islam',
          ),
          h('div', { display: 'flex', marginTop: 10 }, footer),
        ]),
      ]),
    ],
  );
  const svg = await satori(tree as never, { width: 1200, height: 630, fonts: loadFonts() });
  return Buffer.from(new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng());
}
