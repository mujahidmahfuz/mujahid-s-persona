import { useEffect, useMemo, useRef, useState } from 'react';
import { Slider } from '../shared/Slider';
import { Legend } from '../shared/Legend';
import { useReducedMotion } from '../shared/useReducedMotion';
import { isPosterMode } from '../shared/useStepper';
import type { ExplainerProps } from '../types';
import { makeLattice, percolate } from './model';

const L = 20;
const GAP = 18;
const PAD = 14;
const SIZE = PAD * 2 + GAP * (L - 1);

export default function Percolation({ onReady }: ExplainerProps) {
  const [seed, setSeed] = useState(11);
  const [p, setP] = useState(isPosterMode() ? 0.55 : 0.35);
  const [sweeping, setSweeping] = useState(false);
  const raf = useRef(0);
  const reduced = useReducedMotion();
  useEffect(() => onReady?.(), [onReady]);

  const bonds = useMemo(() => makeLattice(L, seed), [seed]);
  const state = useMemo(() => percolate(L, bonds, p), [bonds, p]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const sweep = () => {
    if (reduced) {
      setP(0.55);
      return;
    }
    cancelAnimationFrame(raf.current);
    setSweeping(true);
    const t0 = performance.now();
    const D = 4500; // explanatory pace: 0.30 → 0.70 over 4.5 s, linear (constant-rate change)
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / D);
      setP(Math.round((0.3 + 0.4 * k) * 100) / 100);
      if (k < 1) raf.current = requestAnimationFrame(tick);
      else setSweeping(false);
    };
    raf.current = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(raf.current);
    setSweeping(false);
  };

  const pos = (i: number) => ({ x: PAD + (i % L) * GAP, y: PAD + Math.floor(i / L) * GAP });

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto bg-white p-3 sm:flex-row sm:p-4">
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="aspect-square h-full max-h-full w-full max-w-[min(100%,30rem)]"
          aria-hidden="true"
        >
          {bonds.map((b, i) => {
            const A = pos(b.a);
            const B = pos(b.b);
            const open = state.openBond[i];
            const span = open && state.spanning && state.root[b.a] === state.spanRoot;
            return (
              <line
                key={i}
                x1={A.x}
                y1={A.y}
                x2={B.x}
                y2={B.y}
                stroke={span ? '#fd91cc' : open ? '#09318d' : '#c7d3f0'}
                strokeWidth={span ? 4.5 : open ? 3 : 1.2}
                strokeLinecap="round"
                opacity={open ? 1 : 0.6}
                style={{
                  transition: 'stroke 250ms var(--ease-out), stroke-width 250ms var(--ease-out), opacity 250ms var(--ease-out)',
                }}
              />
            );
          })}
          {Array.from({ length: L * L }, (_, i) => {
            const P = pos(i);
            const span = state.spanning && state.root[i] === state.spanRoot;
            return <circle key={i} cx={P.x} cy={P.y} r={span ? 3.2 : 2.2} fill={span ? '#b0306f' : '#09318d'} />;
          })}
          <rect x={1} y={1} width={4} height={SIZE - 2} fill="#09318d" opacity="0.25" />
          <rect x={SIZE - 5} y={1} width={4} height={SIZE - 2} fill="#09318d" opacity="0.25" />
        </svg>
      </div>
      <div className="flex flex-col justify-center gap-3 sm:w-64">
        <div className="flex">
          <Slider
            label="Bond-open probability p"
            value={p}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => {
              stop();
              setP(v);
            }}
            format={(v) => v.toFixed(2)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={sweeping ? stop : sweep}
            aria-pressed={sweeping}
            className="rounded-chip border-2 border-blue bg-blue px-3 py-1 text-sm font-semibold text-white hover:bg-blue-900"
          >
            {sweeping ? 'Stop' : 'Sweep 0.30 → 0.70'}
          </button>
          <button
            type="button"
            onClick={() => {
              stop();
              setSeed((s) => s + 1);
            }}
            className="rounded-chip border-2 border-blue bg-white px-3 py-1 text-sm font-semibold text-blue hover:bg-blue-050"
          >
            New lattice
          </button>
        </div>
        <p aria-live="polite" className="rounded-card bg-blue-050 p-3 text-sm text-ink">
          <strong className={state.spanning ? 'text-pink-ink' : 'text-blue'}>
            {state.spanning ? 'Spans left → right' : 'No spanning path yet'}
          </strong>
          <br />
          Largest cluster: {state.largest} of {L * L} nodes
        </p>
        <Legend
          items={[
            { label: 'Open bond', color: '#09318d', shape: 'line' },
            { label: 'Closed bond', color: '#c7d3f0', shape: 'line' },
            { label: 'Spanning cluster', color: '#fd91cc', shape: 'line' },
          ]}
        />
        <p className="text-xs text-muted">Exact threshold for the infinite square lattice: p = 0.5.</p>
      </div>
    </div>
  );
}
