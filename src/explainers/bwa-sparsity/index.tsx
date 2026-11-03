import { useEffect } from 'react';
import { useRevealOnce } from '../shared/useStepper';
import type { ExplainerProps } from '../types';
import { GROUPS, frac, AXIS_MAX } from './data';

const W = 820;
const LABEL_W = 250;
const PLOT_W = 500;
const BAR_H = 22;
const BAR_GAP = 8;
const GROUP_GAP = 30;

export default function BwaSparsity({ onReady }: ExplainerProps) {
  const { ref, shown } = useRevealOnce();
  useEffect(() => onReady?.(), [onReady]);

  let y = 30;
  let i = 0;
  const rows = GROUPS.map((g) => {
    const top = y;
    const bars = g.bars.map((b) => {
      const by = y;
      y += BAR_H + BAR_GAP;
      return { ...b, y: by, i: i++ };
    });
    y += GROUP_GAP;
    return { ...g, top, bars };
  });
  const H = y + 20;
  const ticks = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];

  return (
    <div ref={ref} className="flex h-full flex-col bg-white p-3 sm:p-4">
      <p className="text-sm font-semibold text-blue">Attribution sparsity (Gini, higher = sparser)</p>
      <p className="text-xs text-muted sm:hidden">Swipe the figure sideways to see all of it.</p>
      <div
        className="mt-1 min-h-0 shrink-0 overflow-x-auto sm:flex-1 sm:shrink"
        tabIndex={0}
        role="region"
        aria-label="Figure (scrolls sideways on small screens)"
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[720px] sm:h-full" aria-hidden="true">
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={LABEL_W + (t / AXIS_MAX) * PLOT_W}
                x2={LABEL_W + (t / AXIS_MAX) * PLOT_W}
                y1={18}
                y2={H - 26}
                stroke="#efe3c8"
              />
              <text x={LABEL_W + (t / AXIS_MAX) * PLOT_W} y={H - 8} fontSize="13" textAnchor="middle" fill="#4c574d">
                {t.toFixed(1)}
              </text>
            </g>
          ))}
          {rows.map((g) => (
            <g key={g.setting}>
              <text x={0} y={g.top + 4} fontSize="14" fontWeight={700} fill="#354a87">
                {g.domain}
              </text>
              <text x={0} y={g.top + 21} fontSize="12" fill="#4c574d">
                {g.setting}
              </text>
              {g.bars.map((b) => (
                <g key={b.method}>
                  <text
                    x={LABEL_W - 10}
                    y={b.y + BAR_H / 2 + 5}
                    fontSize="13"
                    textAnchor="end"
                    fill="#26332e"
                    fontWeight={b.ours ? 700 : 400}
                  >
                    {b.method}
                  </text>
                  <rect
                    x={LABEL_W}
                    y={b.y}
                    width={PLOT_W}
                    height={BAR_H}
                    rx={3}
                    className="ex-bar-h ex-move"
                    fill={b.ours ? '#354a87' : '#c9b186'}
                    stroke={b.ours ? 'none' : '#354a87'}
                    strokeDasharray={b.ours ? undefined : '4 3'}
                    vectorEffect="non-scaling-stroke"
                    style={{ transform: `scaleX(${shown ? frac(b.gini) : 0})`, transitionDelay: `${b.i * 70}ms` }}
                  />
                  <text
                    x={LABEL_W + frac(b.gini) * PLOT_W + 8}
                    y={b.y + BAR_H / 2 + 5}
                    fontSize="13"
                    fontWeight={700}
                    fill="#26332e"
                    className="ex-fade"
                    style={{ opacity: shown ? 1 : 0, transitionDelay: `${300 + b.i * 70}ms` }}
                  >
                    {b.gini.toFixed(3)}
                  </text>
                </g>
              ))}
            </g>
          ))}
        </svg>
      </div>
      <p className="mt-1 text-xs text-muted">
        Source: BWA preprint abstract (SSRN, doi:10.2139/ssrn.7292748). All BWA-v2 comparisons p_bonf ≪ 0.001.
      </p>
    </div>
  );
}
