import { useEffect } from 'react';
import { useRevealOnce } from '../shared/useStepper';
import type { ExplainerProps } from '../types';
import { SLEEP_EVENTS, CIFAR, reduction } from './data';

type Chart = { title: string; max: number; bars: readonly { label: string; value: number; ours: boolean }[] };

function Bars({
  chart,
  shown,
  offset,
  fmt,
  y0,
}: {
  chart: Chart;
  shown: boolean;
  offset: number;
  fmt: (v: number) => string;
  y0: number;
}) {
  const LABEL_W = 200;
  const PLOT_W = 500;
  return (
    <g>
      <text x={0} y={y0} fontSize="15" fontWeight={700} fill="#09318d">
        {chart.title}
      </text>
      {chart.bars.map((b, i) => {
        const y = y0 + 16 + i * 36;
        const f = b.value / chart.max;
        return (
          <g key={b.label}>
            <text x={LABEL_W - 10} y={y + 17} fontSize="14" textAnchor="end" fill="#0b1530" fontWeight={b.ours ? 700 : 400}>
              {b.label}
            </text>
            <rect x={LABEL_W} y={y} width={PLOT_W} height={26} fill="#eef2fb" rx={3} />
            <rect
              x={LABEL_W}
              y={y}
              width={PLOT_W}
              height={26}
              rx={3}
              className="ex-bar-h ex-move"
              fill={b.ours ? '#09318d' : '#c7d3f0'}
              stroke={b.ours ? 'none' : '#09318d'}
              strokeDasharray={b.ours ? undefined : '4 3'}
              vectorEffect="non-scaling-stroke"
              style={{ transform: `scaleX(${shown ? f : 0})`, transitionDelay: `${(offset + i) * 90}ms` }}
            />
            <text
              x={LABEL_W + f * PLOT_W + 8}
              y={y + 18}
              fontSize="14"
              fontWeight={700}
              fill="#0b1530"
              className="ex-fade"
              style={{ opacity: shown ? 1 : 0, transitionDelay: `${350 + (offset + i) * 90}ms` }}
            >
              {fmt(b.value)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export default function SleepResults({ onReady }: ExplainerProps) {
  const { ref, shown } = useRevealOnce();
  useEffect(() => onReady?.(), [onReady]);
  const pct = Math.round(reduction(SLEEP_EVENTS.bars[1].value, SLEEP_EVENTS.bars[0].value) * 100);
  return (
    <div ref={ref} className="flex h-full flex-col bg-white p-3 sm:p-4">
      <p className="text-xs text-muted sm:hidden">Swipe the figure sideways to see all of it.</p>
      <div
        className="min-h-0 shrink-0 overflow-x-auto sm:flex-1 sm:shrink"
        tabIndex={0}
        role="region"
        aria-label="Figure (scrolls sideways on small screens)"
      >
        <svg viewBox="0 0 800 330" className="h-auto w-full min-w-[720px] sm:h-full" aria-hidden="true">
          <Bars chart={SLEEP_EVENTS} shown={shown} offset={0} fmt={(v) => String(v)} y0={22} />
          <text
            x={200}
            y={122}
            fontSize="14"
            fill="#b0306f"
            fontWeight={700}
            className="ex-fade"
            style={{ opacity: shown ? 1 : 0, transitionDelay: '600ms' }}
          >
            {`${pct}% fewer sleep events`}
          </text>
          <Bars chart={CIFAR} shown={shown} offset={2} fmt={(v) => v.toFixed(4)} y0={170} />
        </svg>
      </div>
      <p className="mt-1 text-xs text-muted">Single-run results from the experiment summary; a 5-seed confirmation is pending.</p>
    </div>
  );
}
