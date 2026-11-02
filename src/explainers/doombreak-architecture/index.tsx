import { useEffect, useState } from 'react';
import { StepControls } from '../shared/StepControls';
import type { ExplainerProps } from '../types';
import { BLOCKS, FLOW, LINKS, clampStep } from './model';

const BW = 190;
const BH = 64;
const pos = (layer: number) => ({ x: 20 + layer * 260, y: 40 });

export default function DoomBreakArchitecture({ onReady }: ExplainerProps) {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState('flutter');
  useEffect(() => onReady?.(), [onReady]);
  const selected = BLOCKS.find((b) => b.id === sel)!;

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto bg-white p-3 sm:p-4">
      <div>
        <p className="text-sm font-semibold text-blue">Session flow</p>
        <svg viewBox="0 0 1000 90" className="mt-1 w-full" aria-hidden="true">
          {FLOW.map((f, i) => {
            const x = 10 + i * 250;
            const on = i === clampStep(step);
            return (
              <g key={f.label}>
                <rect
                  x={x}
                  y={10}
                  width={210}
                  height={64}
                  rx={12}
                  fill={on ? '#ffe6f3' : '#eef2fb'}
                  stroke={on ? '#fd91cc' : '#c7d3f0'}
                  strokeWidth={on ? 5 : 2}
                />
                <text x={x + 105} y={48} textAnchor="middle" fontSize="22" fontWeight={on ? 700 : 400} fill="#09318d">
                  {f.label.slice(2)}
                </text>
                {i < FLOW.length - 1 && (
                  <path d={`M${x + 214} 42 h30`} stroke="#09318d" strokeWidth="3" markerEnd="url(#arrow-db)" />
                )}
              </g>
            );
          })}
          <defs>
            <marker
              id="arrow-db"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0 0L10 5L0 10z" fill="#09318d" />
            </marker>
          </defs>
        </svg>
        <StepControls
          steps={FLOW.map((f) => ({ label: f.label, caption: f.caption }))}
          current={step}
          onChange={(i) => setStep(clampStep(i))}
        />
      </div>

      <div>
        <p className="text-sm font-semibold text-blue">Architecture</p>
        <svg viewBox="0 0 1000 150" className="mt-1 w-full" aria-hidden="true">
          {LINKS.map(([a, b, label]) => {
            const A = BLOCKS.find((x) => x.id === a)!;
            const B = BLOCKS.find((x) => x.id === b)!;
            const pa = pos(A.layer);
            const pb = pos(B.layer);
            const twoWay = a === 'flutter' && b === 'kotlin';
            const y = pa.y + BH / 2 + (b === 'fastapi' ? 40 : 0);
            return (
              <g key={`${a}-${b}`}>
                <path
                  d={
                    b === 'fastapi'
                      ? `M${pa.x + BW / 2} ${pa.y + BH} V${y + 10} H${pb.x + BW / 2} V${pb.y + BH + 4}`
                      : `M${pa.x + BW} ${y} H${pb.x - 4}`
                  }
                  fill="none"
                  stroke="#09318d"
                  strokeWidth="3"
                  markerEnd="url(#arrow-db)"
                  markerStart={twoWay ? 'url(#arrow-db)' : undefined}
                />
                <text
                  x={b === 'fastapi' ? (pa.x + pb.x + BW) / 2 : (pa.x + BW + pb.x) / 2}
                  y={b === 'fastapi' ? y + 30 : pa.y - 12}
                  textAnchor="middle"
                  fontSize="15"
                  fill="#4a5677"
                >
                  {label}
                </text>
              </g>
            );
          })}
          {BLOCKS.map((b) => {
            const p = pos(b.layer);
            const on = b.id === sel;
            return (
              <g key={b.id}>
                <rect
                  x={p.x}
                  y={p.y}
                  width={BW}
                  height={BH}
                  rx={12}
                  fill={on ? '#09318d' : '#ffffff'}
                  stroke={on ? '#fd91cc' : '#09318d'}
                  strokeWidth={on ? 5 : 2}
                />
                <text
                  x={p.x + BW / 2}
                  y={p.y + BH / 2 + 7}
                  textAnchor="middle"
                  fontSize="17"
                  fontWeight={700}
                  fill={on ? '#ffffff' : '#09318d'}
                >
                  {b.label}
                </text>
              </g>
            );
          })}
        </svg>
        <div role="group" aria-label="Architecture blocks" className="flex flex-wrap gap-2">
          {BLOCKS.map((b) => (
            <button
              key={b.id}
              type="button"
              aria-pressed={b.id === sel}
              onClick={() => setSel(b.id)}
              className={`rounded-chip border-2 border-blue px-3 py-1 text-sm font-semibold ${b.id === sel ? 'bg-blue text-white' : 'bg-white text-blue'}`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <p aria-live="polite" className="mt-2 text-sm text-ink">
          <strong>{selected.label}:</strong> {selected.detail}
        </p>
      </div>
    </div>
  );
}
