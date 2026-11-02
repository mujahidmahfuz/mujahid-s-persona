import { useEffect, useState } from 'react';
import { StepControls } from '../shared/StepControls';
import { PlayPause } from '../shared/PlayPause';
import { useStepper } from '../shared/useStepper';
import type { ExplainerProps } from '../types';
import { GATES, NODES, STEPS, markerAt, type GateId } from './model';

const BW = 272;
const BH = 64;

export default function SleepLoop({ onReady }: ExplainerProps) {
  const { ref, step, setStep, playing, toggle } = useStepper(STEPS.length, 2600);
  const [gate, setGate] = useState<GateId>('heuristic');
  useEffect(() => onReady?.(), [onReady]);
  const m = markerAt(step);

  return (
    <div
      ref={ref}
      className="flex h-full flex-col gap-2 overflow-auto bg-white p-3 sm:p-4"
      data-paused={playing ? undefined : ''}
    >
      <div role="radiogroup" aria-label="Gate" className="flex flex-wrap gap-2">
        {(Object.keys(GATES) as GateId[]).map((g) => (
          <button
            key={g}
            type="button"
            role="radio"
            aria-checked={gate === g}
            onClick={() => setGate(g)}
            className={`rounded-chip border-2 border-blue px-3 py-1 text-sm font-semibold transition-colors duration-150 ${gate === g ? 'bg-blue text-white' : 'bg-white text-blue'}`}
          >
            {GATES[g].name}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted sm:hidden">Swipe the figure sideways to see all of it.</p>
      <div
        className="min-h-0 shrink-0 overflow-x-auto sm:flex-1 sm:shrink"
        tabIndex={0}
        role="region"
        aria-label="Figure (scrolls sideways on small screens)"
      >
        <svg viewBox="0 -34 710 364" className="h-auto w-full min-w-[720px] sm:h-full" aria-hidden="true">
          <defs>
            <marker
              id="sl-arrow"
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
          {/* loop edges with flowing dashes */}
          <path
            d={`M${155 + BW / 2} 70 H${550 - BW / 2 - 6}`}
            stroke="#09318d"
            strokeWidth="2.5"
            className="ex-flow"
            markerEnd="url(#sl-arrow)"
            fill="none"
          />
          <path
            d={`M550 ${70 + BH / 2} V${250 - BH / 2 - 4}`}
            stroke="#09318d"
            strokeWidth="2.5"
            className="ex-flow"
            markerEnd="url(#sl-arrow)"
            fill="none"
          />
          <path
            d={`M${550 - BW / 2} 250 H${155 + BW / 2 + 6}`}
            stroke="#09318d"
            strokeWidth="2.5"
            className="ex-flow"
            markerEnd="url(#sl-arrow)"
            fill="none"
          />
          <path
            d={`M155 ${250 - BH / 2} V${70 + BH / 2 + 4}`}
            stroke="#09318d"
            strokeWidth="2.5"
            className="ex-flow"
            markerEnd="url(#sl-arrow)"
            fill="none"
          />
          {/* "keep training" branch from the gate back to wake */}
          <path d="M550 38 C 500 -4, 210 -4, 155 38" stroke="#c7d3f0" strokeWidth="2" fill="none" markerEnd="url(#sl-arrow)" />
          <text x={352} y={-12} fontSize="13" textAnchor="middle" fill="#4a5677">
            not yet → keep training
          </text>

          {NODES.map((n, i) => {
            const on = i === step;
            const isGate = n.id === 'gate';
            const w = BW;
            return (
              <g
                key={n.id}
                className="ex-move"
                style={{ transformOrigin: `${n.x}px ${n.y}px`, transformBox: 'view-box', transform: `scale(${on ? 1.04 : 1})` }}
              >
                <rect
                  x={n.x - w / 2}
                  y={n.y - BH / 2}
                  width={w}
                  height={BH}
                  rx={14}
                  fill={on ? '#09318d' : '#ffffff'}
                  stroke={on ? '#fd91cc' : '#09318d'}
                  strokeWidth={on ? 4 : 2}
                  style={{ transition: 'fill 300ms var(--ease-out), stroke 300ms var(--ease-out)' }}
                />
                <text
                  x={n.x}
                  y={n.y + (isGate ? -2 : 6)}
                  fontSize="15"
                  fontWeight={700}
                  textAnchor="middle"
                  fill={on ? '#ffffff' : '#09318d'}
                >
                  {n.label}
                </text>
                {isGate && (
                  <text x={n.x} y={n.y + 18} fontSize="13" textAnchor="middle" fill={on ? '#ffffff' : '#4a5677'}>
                    {GATES[gate].name}
                  </text>
                )}
              </g>
            );
          })}
          {/* travelling marker */}
          <circle
            cx={0}
            cy={0}
            r={11}
            fill="#fd91cc"
            stroke="#ffffff"
            strokeWidth="3"
            className="ex-morph"
            style={{ transform: `translate(${m.x - BW / 2 + 4}px, ${m.y - BH / 2 + 4}px)` }}
          />
        </svg>
      </div>
      <p className="rounded-card bg-blue-050 px-3 py-2 text-sm text-ink" aria-live="polite">
        <strong className="text-blue">{GATES[gate].name}:</strong> {GATES[gate].rule}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <PlayPause playing={playing} onToggle={toggle} atEnd={step === STEPS.length - 1} />
      </div>
      <StepControls steps={STEPS.map((s) => ({ label: s.label, caption: s.caption }))} current={step} onChange={setStep} />
    </div>
  );
}
