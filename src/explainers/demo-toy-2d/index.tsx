import { useEffect, useMemo, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import { extent } from 'd3-array';
import { Slider } from '../shared/Slider';
import { Legend } from '../shared/Legend';
import type { ExplainerProps } from '../types';
import { movingAverage, toySignal } from './math';

const W = 800;
const H = 400;
const M = { top: 20, right: 20, bottom: 36, left: 44 };
const DATA = toySignal(60);

export default function DemoToy2D({ onReady }: ExplainerProps) {
  const [k, setK] = useState(5);
  useEffect(() => onReady?.(), [onReady]);
  const smooth = useMemo(() => movingAverage(DATA, k), [k]);
  const x = scaleLinear([0, DATA.length - 1], [M.left, W - M.right]);
  const [lo = -2, hi = 2] = extent(DATA);
  const y = scaleLinear([lo, hi], [H - M.bottom, M.top]).nice();
  const path =
    line<number>(
      (_, i) => x(i),
      (d) => y(d),
    )(smooth) ?? '';

  return (
    <div className="flex h-full flex-col bg-white p-3 sm:p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="min-h-0 w-full flex-1"
        role="img"
        aria-label={`Toy data with a ${k}-point moving average`}
      >
        {y.ticks(5).map((t) => (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} stroke="#c9b186" />
            <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="16" fill="#4c574d">
              {t}
            </text>
          </g>
        ))}
        {DATA.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(d)} r="5" fill="#354a87" />
        ))}
        <path d={path} fill="none" stroke="#b65d42" strokeWidth="5" />
        <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="16" fill="#4c574d">
          sample index
        </text>
      </svg>
      <div className="mt-2 flex flex-wrap items-end gap-4">
        <Slider label="Window" value={k} min={1} max={15} onChange={setK} format={(v) => `${v} points`} />
        <Legend
          items={[
            { label: 'Toy data', color: '#354a87', shape: 'circle' },
            { label: 'Moving average', color: '#b65d42', shape: 'line' },
          ]}
        />
      </div>
    </div>
  );
}
