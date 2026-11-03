import { useEffect, useMemo, useState } from 'react';
import { StepControls } from '../shared/StepControls';
import { PlayPause } from '../shared/PlayPause';
import { useStepper } from '../shared/useStepper';
import type { ExplainerProps } from '../types';
import { SEATS, BALLOT_ORDER, LETTERS, LETTER_RANKING, runSession, type Seat } from './model';

const STEPS = [
  { label: '1 Question', caption: 'One question goes to every member of the council at once.' },
  {
    label: '2 Answer',
    caption: 'Round 1: each member answers on its own, in parallel. Nobody sees anyone else’s answer yet.',
  },
  {
    label: '3 Blind review',
    caption:
      'Round 2: each member is shown the other answers with names hidden, in a shuffled order, labelled A, B, C… It never sees its own. Pick a seat to see its ballot.',
  },
  {
    label: '4 Rank',
    caption:
      'Each reviewer ends with a FINAL RANKING of the letters. The letters are mapped back to seats. A reply whose ranking cannot be parsed is thrown away, not guessed.',
  },
  {
    label: '5 Consensus',
    caption:
      'Each placing is worth 1 − (position − 1)/(n − 1): first is 100%, last is 0%. A member’s score is the average over the reviews it received. Agreement is the mean Kendall τ between reviewers.',
  },
  {
    label: '6 Verdict',
    caption:
      'Round 3: a separate chairman model reads the answers best first, with their scores but without names, and writes the ruling. If the chairman fails, the top answer is returned, marked as a fallback.',
  },
];

const C = { x: 210, y: 240 };
const CHAIR = { x: 210, y: 40 };
const polar = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: C.x + r * Math.cos(a), y: C.y + r * Math.sin(a) };
};
const ANGLES = [-54, 18, 90, 162, 234];
const seatPos = (i: number) => polar(ANGLES[i]!, 166);
const cardPos = (i: number) => polar(ANGLES[i]!, 84);
const pct = (x: number | null) => (x === null ? '—' : `${Math.round(x * 100)}%`);

export default function CouncilTable({ onReady }: ExplainerProps) {
  const { ref, step, setStep, playing, toggle } = useStepper(STEPS.length, 3200);
  const [viewer, setViewer] = useState<Seat>('Seat 1');
  const [unparseable, setUnparseable] = useState(false);
  const [chairFails, setChairFails] = useState(false);
  useEffect(() => onReady?.(), [onReady]);

  const session = useMemo(
    () => runSession({ unparseable: unparseable ? 'Seat 4' : null, chairmanFails: chairFails }),
    [unparseable, chairFails],
  );
  const order = session.leaderboard.map((e) => e.model);
  const ballot = BALLOT_ORDER[viewer];
  const letterFor = (s: Seat) => (ballot.includes(s) ? LETTERS[ballot.indexOf(s)]! : null);

  return (
    <div
      ref={ref}
      className="flex h-full flex-col gap-3 overflow-auto bg-white p-3 sm:p-4"
      data-paused={playing ? undefined : ''}
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-start">
        {/* The round table */}
        <svg viewBox="0 0 420 440" className="mx-auto h-auto w-full max-w-[26rem]" aria-hidden="true">
          {/* chairman */}
          <g className="ex-fade" style={{ opacity: step === 5 ? 1 : 0.45 }}>
            <line x1={CHAIR.x} y1={CHAIR.y + 28} x2={C.x} y2={C.y - 120} stroke="#c9b186" strokeDasharray="3 5" />
            <rect
              x={CHAIR.x - 62}
              y={CHAIR.y - 24}
              width={124}
              height={48}
              rx={10}
              fill={step === 5 ? (chairFails ? '#efe3c8' : '#d3a13c') : '#efe3c8'}
              stroke={chairFails && step === 5 ? '#8e3b26' : '#7a5410'}
              strokeWidth={2}
              strokeDasharray={chairFails && step === 5 ? '6 4' : undefined}
              style={{ transition: 'fill 300ms var(--ease-out)' }}
            />
            <text x={CHAIR.x} y={CHAIR.y + 6} textAnchor="middle" fontSize="16" fontWeight={700} fill="#26332e">
              Chairman
            </text>
          </g>

          {/* table */}
          <circle cx={C.x} cy={C.y} r={120} fill="#efe3c8" stroke="#c9b186" strokeWidth={2} />
          <circle cx={C.x} cy={C.y} r={112} fill="none" stroke="#c9b186" strokeWidth={0.8} />

          {/* question → seats */}
          {SEATS.map((_, i) => {
            const p = seatPos(i);
            return (
              <line
                key={i}
                x1={C.x}
                y1={C.y}
                x2={p.x}
                y2={p.y}
                stroke="#354a87"
                strokeWidth={2}
                className="ex-flow ex-fade"
                style={{ opacity: step === 0 ? 0.9 : 0 }}
              />
            );
          })}
          <g
            className="ex-move"
            style={{
              transformBox: 'view-box',
              transformOrigin: `${C.x}px ${C.y}px`,
              transform: `scale(${step === 0 ? 1 : 0.6})`,
            }}
          >
            <rect x={C.x - 50} y={C.y - 20} width={100} height={40} rx={8} fill="#354a87" />
            <text x={C.x} y={C.y + 6} textAnchor="middle" fontSize="16" fontWeight={700} fill="#fbf6ea">
              Question
            </text>
          </g>

          {/* answer cards: appear in round 1, take letters in round 2, travel to the chairman in round 3 (best first) */}
          {SEATS.map((s, i) => {
            const p = cardPos(i);
            const rank = order.indexOf(s);
            const atChair = step === 5;
            const target = { x: CHAIR.x - 48 + rank * 24, y: CHAIR.y + 46 };
            const own = step === 2 && s === viewer;
            const letter = step === 2 ? letterFor(s) : null;
            const winner = step >= 4 && s === session.winner;
            return (
              <g
                key={s}
                className="ex-move"
                style={{
                  opacity: step === 0 ? 0 : own ? 0.35 : 1,
                  transform: atChair ? `translate(${target.x - p.x}px, ${target.y - p.y}px) scale(0.55)` : 'none',
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  transitionDelay: atChair ? `${rank * 90}ms` : `${i * 60}ms`,
                }}
              >
                <rect
                  x={p.x - 24}
                  y={p.y - 18}
                  width={48}
                  height={36}
                  rx={5}
                  fill="#fbf6ea"
                  stroke={winner ? '#8e3b26' : '#354a87'}
                  strokeWidth={winner ? 3 : 1.6}
                  strokeDasharray={own ? '4 3' : undefined}
                />
                {letter ? (
                  <text x={p.x} y={p.y + 7} textAnchor="middle" fontSize="20" fontWeight={700} fill="#354a87">
                    {letter}
                  </text>
                ) : own ? (
                  <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="13" fill="#4c574d">
                    own
                  </text>
                ) : (
                  [0, 1, 2].map((k) => (
                    <line
                      key={k}
                      x1={p.x - 15}
                      x2={p.x + (k === 2 ? 4 : 15)}
                      y1={p.y - 8 + k * 8}
                      y2={p.y - 8 + k * 8}
                      stroke="#4c574d"
                      strokeWidth={2}
                    />
                  ))
                )}
              </g>
            );
          })}

          {/* seats */}
          {SEATS.map((s, i) => {
            const p = seatPos(i);
            const isViewer = step === 2 && s === viewer;
            const reviewDropped = step >= 3 && unparseable && s === 'Seat 4';
            return (
              <g key={s}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={26}
                  strokeDasharray={reviewDropped ? '5 4' : undefined}
                  fill={isViewer ? '#354a87' : '#fbf6ea'}
                  stroke="#354a87"
                  strokeWidth={2}
                  style={{ transition: 'fill 200ms var(--ease-out)' }}
                />
                <text
                  x={p.x}
                  y={p.y + 6}
                  textAnchor="middle"
                  fontSize="17"
                  fontWeight={700}
                  fill={isViewer ? '#fbf6ea' : '#354a87'}
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* What the current step means, with the numbers */}
        <div className="min-h-[15rem] text-sm text-ink" aria-live="polite">
          {step <= 1 && (
            <div>
              <p className="label-mono text-ink-soft">Round 1</p>
              <ul className="mt-2 grid grid-cols-5 gap-2 text-center">
                {SEATS.map((s, i) => (
                  <li key={s} className="rounded-md border border-blue/40 px-1 py-2">
                    <span className="block font-semibold text-blue">{i + 1}</span>
                    <span className="text-xs text-ink-soft">{step === 0 ? 'waiting' : 'answered'}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-ink-soft">Five seats here; the real council is configurable (up to 26, one letter each).</p>
            </div>
          )}

          {step === 2 && (
            <div>
              <div role="radiogroup" aria-label="Show the ballot of" className="flex flex-wrap items-center gap-2">
                <span className="label-mono text-ink-soft">Ballot of</span>
                {SEATS.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={viewer === s}
                    onClick={() => setViewer(s)}
                    className={`rounded-chip border-2 border-blue px-2.5 py-0.5 text-sm font-semibold ${viewer === s ? 'bg-blue text-white' : 'bg-white text-blue'}`}
                  >
                    Seat {i + 1}
                  </button>
                ))}
              </div>
              <ol className="mt-3 space-y-1.5">
                {ballot.map((_, k) => (
                  <li key={k} className="flex items-center gap-3 rounded-md border border-blue/30 bg-paper-light/60 px-3 py-1.5">
                    <span className="font-mono font-semibold text-blue">Response {LETTERS[k]}</span>
                    <span className="text-ink-soft">author hidden</span>
                  </li>
                ))}
              </ol>
              <p className="mt-2 text-ink-soft">
                {viewer}’s own answer is not on its ballot. Switch seats: the letters land on different answers, because each
                ballot is shuffled separately.
              </p>
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={unparseable}
                  onChange={(e) => setUnparseable(e.target.checked)}
                  className="h-4 w-4 accent-[#354a87]"
                />
                Seat 4’s reply has no readable ranking
              </label>
              <table className="mt-3 w-full border-collapse text-left">
                <caption className="sr-only">Each reviewer’s ranking, best first</caption>
                <thead>
                  <tr className="label-mono text-ink-soft">
                    <th scope="col" className="py-1 pr-2 font-normal">
                      Reviewer
                    </th>
                    <th scope="col" className="py-1 pr-2 font-normal">
                      Letters
                    </th>
                    <th scope="col" className="py-1 font-normal">
                      Seats, best first
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SEATS.map((s, i) => {
                    const r = session.rankings.find((x) => x.reviewer === s);
                    return (
                      <tr key={s} className={`border-t border-rule ${r ? '' : 'text-ink-soft line-through'}`}>
                        <th scope="row" className="py-1 pr-2 font-semibold">
                          Seat {i + 1}
                        </th>
                        <td className="py-1 pr-2 font-mono">{LETTER_RANKING[s].join(' ')}</td>
                        <td className="py-1">{r ? r.ranking.map((x) => x.replace('Seat ', '')).join(' › ') : 'discarded'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {step >= 4 && (
            <div>
              <div className="flex flex-wrap gap-x-5 gap-y-1">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={unparseable}
                    onChange={(e) => setUnparseable(e.target.checked)}
                    className="h-4 w-4 accent-[#354a87]"
                  />
                  Discard Seat 4’s review
                </label>
                {step === 5 && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={chairFails}
                      onChange={(e) => setChairFails(e.target.checked)}
                      className="h-4 w-4 accent-[#354a87]"
                    />
                    Chairman call fails
                  </label>
                )}
              </div>
              <table className="mt-3 w-full border-collapse text-left">
                <caption className="sr-only">Leaderboard after peer review</caption>
                <thead>
                  <tr className="label-mono text-ink-soft">
                    <th scope="col" className="py-1 pr-2 font-normal">
                      Seat
                    </th>
                    <th scope="col" className="w-1/2 py-1 pr-2 font-normal">
                      Score
                    </th>
                    <th scope="col" className="py-1 pr-2 font-normal">
                      Avg rank
                    </th>
                    <th scope="col" className="py-1 font-normal">
                      Votes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {session.leaderboard.map((e) => (
                    <tr key={e.model} className="border-t border-rule">
                      <th scope="row" className="py-1.5 pr-2 font-semibold">
                        {e.model.replace('Seat ', '')}
                        {e.model === session.winner && <span className="ml-1 text-xs font-normal text-terracotta-ink">best</span>}
                      </th>
                      <td className="py-1.5 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="relative block h-3 flex-1 rounded-[3px] bg-paper-light">
                            <span
                              className="ex-move absolute inset-y-0 left-0 w-full origin-left rounded-[3px]"
                              style={{
                                transform: `scaleX(${e.score ?? 0})`,
                                background: e.model === session.winner ? '#b65d42' : '#354a87',
                              }}
                            />
                          </span>
                          <span className="w-10 text-right font-mono">{pct(e.score)}</span>
                        </div>
                      </td>
                      <td className="py-1.5 pr-2 font-mono">{e.averageRank?.toFixed(2) ?? '—'}</td>
                      <td className="py-1.5 font-mono">{e.votes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2">
                Agreement between reviewers: <strong className="font-mono">τ = {session.agreement?.toFixed(2) ?? '—'}</strong>{' '}
                <span className="text-ink-soft">
                  (+1 = identical orders, −1 = reversed; when it is low, read the answers yourself)
                </span>
              </p>
              {step === 5 && (
                <p className="mt-2 rounded-md border border-rule bg-paper-light/60 px-3 py-2">
                  {session.verdictSource === 'chairman' ? (
                    <>
                      The chairman sees “Council member 1 … 5”, best first, each with its score — not who wrote it — and writes
                      the ruling.
                    </>
                  ) : (
                    <>
                      <strong className="text-terracotta-ink">Fallback.</strong> The chairman did not answer, so the council
                      returns Seat {session.leaderboard[0]!.model.replace('Seat ', '')}’s answer, marked as a fallback rather than
                      a ruling.
                    </>
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <PlayPause playing={playing} onToggle={toggle} atEnd={step === STEPS.length - 1} />
      </div>
      <StepControls steps={STEPS} current={step} onChange={setStep} />
    </div>
  );
}
