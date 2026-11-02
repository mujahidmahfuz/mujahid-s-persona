import { useEffect, useState } from 'react';
import { StepControls } from '../shared/StepControls';
import { PlayPause } from '../shared/PlayPause';
import { Legend } from '../shared/Legend';
import { useStepper } from '../shared/useStepper';
import type { ExplainerProps } from '../types';
import { CONFIGS, STEPS, quantumParts, type ConfigId } from './model';

const G = { x: 250, y: 130 };
const D = { x: 600, y: 130 };
const NOISE = { x: 70, y: 130 };
const REAL = { x: 600, y: 300 };
const SCORE = { x: 600, y: 20 };

function Block({ x, y, title, quantum, active }: { x: number; y: number; title: string; quantum: boolean; active: boolean }) {
  const w = 200;
  const h = 96;
  return (
    <g
      className="ex-move"
      style={{ transformBox: 'view-box', transformOrigin: `${x}px ${y}px`, transform: `scale(${active ? 1.04 : 1})` }}
    >
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx={14}
        fill={active ? '#09318d' : '#ffffff'}
        stroke={quantum ? '#fd91cc' : '#09318d'}
        strokeWidth={quantum ? 5 : 2}
        style={{ transition: 'fill 300ms var(--ease-out), stroke 300ms var(--ease-out)' }}
      />
      <text x={x} y={y - 16} fontSize="18" fontWeight={700} textAnchor="middle" fill={active ? '#ffffff' : '#09318d'}>
        {title}
      </text>
      {quantum ? (
        // circuit symbol: three wires with gates
        <g stroke={active ? '#ffffff' : '#09318d'} strokeWidth="2" fill="none">
          {[0, 1, 2].map((i) => (
            <line key={i} x1={x - 60} x2={x + 60} y1={y + 6 + i * 12} y2={y + 6 + i * 12} />
          ))}
          <rect x={x - 38} y={y} width={14} height={12} fill={active ? '#09318d' : '#ffffff'} />
          <rect x={x - 6} y={y + 12} width={14} height={12} fill={active ? '#09318d' : '#ffffff'} />
          <line x1={x + 30} x2={x + 30} y1={y + 6} y2={y + 30} />
          <circle cx={x + 30} cy={y + 6} r={3} fill={active ? '#ffffff' : '#09318d'} />
        </g>
      ) : (
        // network symbol: 3–2 nodes
        <g fill={active ? '#ffffff' : '#09318d'} stroke={active ? '#ffffff' : '#09318d'} strokeWidth="1.2">
          {[0, 1, 2].map((i) =>
            [0, 1].map((k) => <line key={`${i}${k}`} x1={x - 30} y1={y + 2 + i * 13} x2={x + 30} y2={y + 9 + k * 13} />),
          )}
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={x - 30} cy={y + 2 + i * 13} r={4} />
          ))}
          {[0, 1].map((k) => (
            <circle key={k} cx={x + 30} cy={y + 9 + k * 13} r={4} />
          ))}
        </g>
      )}
      <text x={x - 14} y={y + h / 2 + 20} fontSize="13" textAnchor="end" fill={quantum ? '#b0306f' : '#4a5677'} fontWeight={700}>
        {quantum ? 'quantum circuit' : 'classical network'}
      </text>
    </g>
  );
}

export default function QganLoop({ onReady }: ExplainerProps) {
  const { ref, step, setStep, playing, toggle } = useStepper(STEPS.length, 2600);
  const [config, setConfig] = useState<ConfigId>('qg');
  useEffect(() => onReady?.(), [onReady]);
  const q = quantumParts(config);

  // Sample dots: generated (pink) travels noise → G → D; real (white) travels up into D.
  const fakePos = step === 0 ? { x: G.x + 130, y: G.y } : { x: D.x - 130, y: D.y };
  const realPos = step >= 1 ? { x: REAL.x, y: D.y + 96 } : { x: REAL.x, y: REAL.y - 42 };

  return (
    <div
      ref={ref}
      className="flex h-full flex-col gap-2 overflow-auto bg-white p-3 sm:p-4"
      data-paused={playing ? undefined : ''}
    >
      <div role="radiogroup" aria-label="Where the quantum part sits" className="flex flex-wrap gap-2">
        {(Object.keys(CONFIGS) as ConfigId[]).map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={config === c}
            onClick={() => setConfig(c)}
            className={`rounded-chip border-2 border-blue px-3 py-1 text-sm font-semibold transition-colors duration-150 ${config === c ? 'bg-blue text-white' : 'bg-white text-blue'}`}
          >
            {CONFIGS[c].name}
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
        <svg viewBox="0 0 760 350" className="h-auto w-full min-w-[720px] sm:h-full" aria-hidden="true">
          <defs>
            <marker
              id="qg-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0 0L10 5L0 10z" fill="#09318d" />
            </marker>
            <marker
              id="qg-arrow-pink"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0 0L10 5L0 10z" fill="#b0306f" />
            </marker>
          </defs>
          {/* data paths */}
          <path
            d={`M${NOISE.x + 30} ${NOISE.y} H${G.x - 106}`}
            stroke="#09318d"
            strokeWidth="2.5"
            className="ex-flow"
            markerEnd="url(#qg-arrow)"
          />
          <path
            d={`M${G.x + 100} ${G.y} H${D.x - 106}`}
            stroke="#09318d"
            strokeWidth="2.5"
            className="ex-flow"
            markerEnd="url(#qg-arrow)"
          />
          <path
            d={`M${REAL.x} ${REAL.y - 16} V${D.y + 54}`}
            stroke="#09318d"
            strokeWidth="2.5"
            className="ex-flow"
            markerEnd="url(#qg-arrow)"
          />
          <path
            d={`M${D.x} ${D.y - 48} V${SCORE.y + 22}`}
            stroke="#09318d"
            strokeWidth="2.5"
            markerEnd="url(#qg-arrow)"
            className="ex-fade"
            style={{ opacity: step >= 2 ? 1 : 0.25 }}
          />

          <circle cx={NOISE.x} cy={NOISE.y} r={26} fill="#eef2fb" stroke="#c7d3f0" />
          <text x={NOISE.x} y={NOISE.y + 5} fontSize="14" textAnchor="middle" fill="#09318d" fontWeight={700}>
            noise
          </text>
          <rect x={REAL.x - 70} y={REAL.y - 16} width={140} height={34} rx={8} fill="#eef2fb" stroke="#c7d3f0" />
          <text x={REAL.x} y={REAL.y + 6} fontSize="14" textAnchor="middle" fill="#09318d" fontWeight={700}>
            real data
          </text>
          <rect
            x={SCORE.x - 90}
            y={SCORE.y - 18}
            width={180}
            height={34}
            rx={8}
            fill={step >= 2 ? '#ffe6f3' : '#eef2fb'}
            stroke="#c7d3f0"
            style={{ transition: 'fill 300ms var(--ease-out)' }}
          />
          <text x={SCORE.x} y={SCORE.y + 4} fontSize="14" textAnchor="middle" fill="#09318d" fontWeight={700}>
            real or generated?
          </text>

          <Block x={G.x} y={G.y} title="Generator" quantum={q.generator} active={step === 0 || step === 3} />
          <Block
            x={D.x}
            y={D.y}
            title="Discriminator"
            quantum={q.discriminator}
            active={step === 1 || step === 2 || step === 3}
          />

          {/* update arrows */}
          <g className="ex-fade" style={{ opacity: step === 3 ? 1 : 0 }}>
            <path
              d={`M${SCORE.x - 92} ${SCORE.y} H${G.x} V${G.y - 52}`}
              stroke="#b0306f"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="6 4"
              markerEnd="url(#qg-arrow-pink)"
            />
            <text x={(G.x + SCORE.x) / 2 - 40} y={SCORE.y - 4} fontSize="13" fill="#b0306f" fontWeight={700} textAnchor="middle">
              update: fool the discriminator
            </text>
            <path
              d={`M${SCORE.x + 92} ${SCORE.y} H${D.x + 140} V${D.y} H${D.x + 104}`}
              stroke="#b0306f"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="6 4"
              markerEnd="url(#qg-arrow-pink)"
            />
            <text x={D.x + 44} y={D.y + 112} fontSize="13" fill="#b0306f" fontWeight={700}>
              <tspan x={D.x + 44}>update: tell</tspan>
              <tspan x={D.x + 44} dy="16">
                them apart
              </tspan>
            </text>
          </g>

          {/* moving samples */}
          <circle
            cx={0}
            cy={0}
            r={10}
            fill="#fd91cc"
            stroke="#09318d"
            strokeWidth="2"
            className="ex-morph"
            style={{ transform: `translate(${fakePos.x}px, ${fakePos.y}px)` }}
          />
          <circle
            cx={0}
            cy={0}
            r={10}
            fill="#ffffff"
            stroke="#09318d"
            strokeWidth="2"
            className="ex-morph"
            style={{ transform: `translate(${realPos.x}px, ${realPos.y}px)` }}
          />
        </svg>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <PlayPause playing={playing} onToggle={toggle} atEnd={step === STEPS.length - 1} />
        <Legend
          items={[
            { label: 'Quantum part', color: '#fd91cc', shape: 'square' },
            { label: 'Generated sample', color: '#fd91cc', shape: 'circle' },
            { label: 'Update', color: '#b0306f', shape: 'dashed' },
          ]}
        />
      </div>
      <StepControls steps={STEPS.map((s) => ({ label: s.label, caption: s.caption }))} current={step} onChange={setStep} />
    </div>
  );
}
