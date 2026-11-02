import { useEffect, useMemo } from 'react';
import { StepControls } from '../shared/StepControls';
import { PlayPause } from '../shared/PlayPause';
import { Legend } from '../shared/Legend';
import { useStepper } from '../shared/useStepper';
import type { ExplainerProps } from '../types';
import { B, D, E, euclideanMean, l2, toSimplex, signVote, consensusStandIn } from './model';

const STEPS = [
  {
    label: '1 Replicates',
    caption:
      'Six bootstrap replicates of a small dataset each give an attribution for the same input. Four of the eight features flip sign between replicates.',
  },
  {
    label: '2 Average',
    caption:
      'Averaging the replicates (the Euclidean mean) cancels the sign-flipping features. The averaged explanation is much shorter than a typical replicate — the norm collapse described in the paper’s Lemma 1.',
  },
  {
    label: '3 Split',
    caption:
      'BWA keeps magnitude and sign apart: each replicate’s magnitudes become a probability distribution over the features, and its signs are set aside for a vote.',
  },
  {
    label: '4 Consensus',
    caption:
      'The distributions are merged into one consensus profile (the paper uses a Wasserstein barycenter) and each feature’s sign goes to a binomial test. Inconsistent features abstain instead of silently shrinking.',
  },
] as const;

// Layout (viewBox units)
const ROW_H = 54;
const ROW_Y0 = 46;
const MINI_W = 20;
const MINI_GAP = 7;
const MINI_X0 = 34;
const MINI_UNIT = 20; // |e| = 1 → 20 units
const BIG_X0 = 352;
const BIG_W = 34;
const BIG_GAP = 20;
const BIG_BASE = 185;
const BIG_UNIT = 110; // |value| = 1 → 110 units

export default function BwaCollapse({ onReady }: ExplainerProps) {
  const { ref, step, setStep, playing, toggle } = useStepper(STEPS.length, 3200);
  useEffect(() => onReady?.(), [onReady]);

  const data = useMemo(() => {
    const mean = euclideanMean(E);
    const simplex = E.map(toSimplex);
    const votes = signVote(E);
    const consensus = consensusStandIn(E);
    // BWA-v1 uses a global normalisation: restore a natural scale with the replicates' average L1 norm.
    const scale = E.reduce((s, r) => s + r.reduce((a, x) => a + Math.abs(x), 0), 0) / B;
    const final = consensus.map((c, j) => c * scale * (votes[j]!.sign || 1));
    return { mean, simplex, votes, final, meanNorm: l2(mean), avgNorm: E.reduce((s, r) => s + l2(r), 0) / B };
  }, []);

  const split = step >= 2;
  return (
    <div ref={ref} className="flex h-full flex-col gap-2 overflow-auto bg-white p-3 sm:p-4">
      <p className="text-xs text-muted sm:hidden">Swipe the figure sideways to see all of it.</p>
      <div
        className="min-h-0 shrink-0 overflow-x-auto sm:flex-1 sm:shrink"
        tabIndex={0}
        role="region"
        aria-label="Figure (scrolls sideways on small screens)"
      >
        <svg viewBox="0 0 820 372" className="h-auto w-full min-w-[720px] sm:h-full" aria-hidden="true">
          <defs>
            <pattern id="bwa-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#b0306f" strokeWidth="2" />
            </pattern>
          </defs>

          {/* Left: replicate attributions */}
          <text x={MINI_X0} y={22} fontSize="15" fontWeight={700} fill="#09318d">
            {split ? 'Magnitude distributions (sign set aside)' : 'Bootstrap replicates'}
          </text>
          <g className="ex-fade" style={{ opacity: step === 1 ? 0.3 : 1 }}>
            {E.map((row, r) => {
              const base = ROW_Y0 + r * ROW_H + 26;
              return (
                <g key={r}>
                  <text x={MINI_X0 - 8} y={base + 4} fontSize="11" textAnchor="end" fill="#4a5677">
                    {`b${r + 1}`}
                  </text>
                  <line x1={MINI_X0 - 2} x2={MINI_X0 + D * (MINI_W + MINI_GAP)} y1={base} y2={base} stroke="#c7d3f0" />
                  {row.map((v, j) => {
                    const s = split ? data.simplex[r]![j]! * 4 : v;
                    const x = MINI_X0 + j * (MINI_W + MINI_GAP);
                    return (
                      <g key={j}>
                        <rect
                          x={x}
                          y={base - MINI_UNIT}
                          width={MINI_W}
                          height={MINI_UNIT}
                          className="ex-bar ex-morph"
                          fill={v >= 0 || split ? '#09318d' : '#fd91cc'}
                          style={{ transform: `scaleY(${s})`, transitionDelay: `${j * 35 + r * 25}ms` }}
                        />
                        <text
                          x={x + MINI_W / 2}
                          y={base + 14}
                          fontSize="11"
                          textAnchor="middle"
                          fill={v >= 0 ? '#09318d' : '#b0306f'}
                          className="ex-fade"
                          style={{ opacity: split ? 1 : 0 }}
                        >
                          {v >= 0 ? '+' : '−'}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </g>

          {/* Right: Euclidean mean, then BWA consensus */}
          <g className="ex-fade" style={{ opacity: step === 0 ? 0 : 1 }}>
            <text x={BIG_X0} y={22} fontSize="15" fontWeight={700} fill="#09318d">
              {step >= 3 ? 'BWA consensus (v1-style sign test)' : 'Euclidean mean of the replicates'}
            </text>
            <line x1={BIG_X0 - 6} x2={BIG_X0 + D * (BIG_W + BIG_GAP)} y1={BIG_BASE} y2={BIG_BASE} stroke="#4a5677" />
            {data.mean.map((m, j) => {
              const x = BIG_X0 + j * (BIG_W + BIG_GAP);
              const vote = data.votes[j]!;
              const abstain = vote.sign === 0;
              const f = data.final[j]!;
              const showFinal = step >= 3;
              return (
                <g key={j}>
                  {/* Euclidean mean: solid until step 4, then a ghost outline for comparison */}
                  <rect
                    x={x}
                    y={BIG_BASE - BIG_UNIT}
                    width={BIG_W}
                    height={BIG_UNIT}
                    className="ex-bar ex-morph"
                    fill={showFinal ? 'none' : '#09318d'}
                    stroke={showFinal ? '#4a5677' : 'none'}
                    strokeDasharray="3 3"
                    vectorEffect="non-scaling-stroke"
                    style={{ transform: `scaleY(${step >= 1 ? m : 0})`, transitionDelay: `${j * 45}ms` }}
                  />
                  {/* BWA consensus */}
                  <rect
                    x={x + 5}
                    y={BIG_BASE - BIG_UNIT}
                    width={BIG_W - 10}
                    height={BIG_UNIT}
                    className="ex-bar ex-morph"
                    fill={abstain ? 'url(#bwa-hatch)' : f >= 0 ? '#09318d' : '#fd91cc'}
                    stroke={abstain ? '#b0306f' : 'none'}
                    strokeDasharray={abstain ? '4 3' : undefined}
                    vectorEffect="non-scaling-stroke"
                    style={{
                      transform: `scaleY(${showFinal ? Math.abs(f) * (abstain ? 1 : Math.sign(f)) : 0})`,
                      opacity: showFinal ? 1 : 0,
                      transitionDelay: `${200 + j * 60}ms`,
                    }}
                  />
                  <text x={x + BIG_W / 2} y={BIG_BASE + 128} fontSize="13" textAnchor="middle" fill="#4a5677">
                    {`f${j + 1}`}
                  </text>
                  <text
                    x={x + BIG_W / 2}
                    y={BIG_BASE + 147}
                    fontSize="13"
                    textAnchor="middle"
                    fontWeight={700}
                    fill={abstain ? '#b0306f' : '#09318d'}
                    className="ex-fade"
                    style={{ opacity: showFinal ? 1 : 0, transitionDelay: `${400 + j * 60}ms` }}
                  >
                    {abstain ? '?' : vote.sign > 0 ? '+' : '−'}
                  </text>
                </g>
              );
            })}
            <text
              x={BIG_X0}
              y={BIG_BASE + 176}
              fontSize="13"
              fill="#0b1530"
              className="ex-fade"
              style={{ opacity: step === 1 || step === 2 ? 1 : 0 }}
            >
              {`Length of the mean: ${data.meanNorm.toFixed(2)} vs. a typical replicate: ${data.avgNorm.toFixed(2)}`}
            </text>
            <text
              x={BIG_X0}
              y={BIG_BASE + 176}
              fontSize="13"
              fill="#0b1530"
              className="ex-fade"
              style={{ opacity: step >= 3 ? 1 : 0 }}
            >
              {`Sign test (α = 0.05): only unanimous features keep a sign`}
            </text>
          </g>
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <PlayPause playing={playing} onToggle={toggle} atEnd={step === STEPS.length - 1} />
        <Legend
          items={[
            { label: 'Positive', color: '#09318d', shape: 'square' },
            { label: 'Negative', color: '#fd91cc', shape: 'square' },
            { label: 'Euclidean mean (ghost)', color: '#4a5677', shape: 'dashed' },
            { label: 'Abstained', color: '#b0306f', shape: 'dashed' },
          ]}
        />
      </div>
      <StepControls steps={STEPS.map((s) => ({ label: s.label, caption: s.caption }))} current={step} onChange={setStep} />
    </div>
  );
}
