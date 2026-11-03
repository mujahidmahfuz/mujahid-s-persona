import { useEffect, useMemo, useState } from 'react';
import { StepControls } from '../shared/StepControls';
import { PlayPause } from '../shared/PlayPause';
import { useStepper, isPosterMode } from '../shared/useStepper';
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

// Same layout as the real app (frontend/src/components/RoundTable.jsx): the chairman at the head of the
// table (top), the members round the ring, a live status under every seat.
const SIZE = 460;
const C = { x: SIZE / 2, y: 236 };
const RING = 150;
const slot = (k: number, r = RING) => {
  const a = ((-90 + 60 * k) * Math.PI) / 180;
  return { x: C.x + r * Math.cos(a), y: C.y + r * Math.sin(a), cos: Math.cos(a), sin: Math.sin(a) };
};
const seatPos = (i: number) => slot(i + 1);
const cardPos = (i: number) => slot(i + 1, 74);
const CHAIR = slot(0);
type Status = 'waiting' | 'thinking' | 'reviewing' | 'answered' | 'failed' | 'winner';
const RING_STYLE: Record<Status, { stroke: string; width: number; dash?: string; fill: string; pulse?: boolean }> = {
  waiting: { stroke: '#c9b186', width: 2.5, fill: '#fbf6ea' },
  thinking: { stroke: '#354a87', width: 3, fill: '#fbf6ea', pulse: true },
  reviewing: { stroke: '#354a87', width: 3, fill: '#fbf6ea', pulse: true },
  answered: { stroke: '#1d4b45', width: 3, fill: '#fbf6ea' },
  failed: { stroke: '#8e3b26', width: 3, dash: '5 4', fill: '#fbf6ea' },
  winner: { stroke: '#d3a13c', width: 5, fill: '#f3ddc4' },
};
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
  // Live feel, as in the app: on entering round 1 or 3 the seats "think" for a moment before answering.
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [answering, setAnswering] = useState(false);
  useEffect(() => {
    if (reduced || isPosterMode() || (step !== 1 && step !== 5)) return setAnswering(false);
    setAnswering(true);
    const t = setTimeout(() => setAnswering(false), 1300);
    return () => clearTimeout(t);
  }, [step, reduced]);
  const order = session.leaderboard.map((e) => e.model);
  const ballot = BALLOT_ORDER[viewer];
  const statusOf = (s: Seat): Status => {
    if (step === 0) return 'waiting';
    if (step === 1) return answering ? 'thinking' : 'answered';
    if (step === 2) return 'reviewing';
    if (unparseable && s === 'Seat 4') return 'failed';
    if (step >= 4 && s === session.winner) return 'winner';
    return 'answered';
  };
  const chairStatus: Status = step < 5 ? 'waiting' : answering ? 'thinking' : chairFails ? 'failed' : 'answered';
  const letterFor = (s: Seat) => (ballot.includes(s) ? LETTERS[ballot.indexOf(s)]! : null);

  return (
    <div
      ref={ref}
      className="flex h-full flex-col gap-3 overflow-auto bg-white p-3 sm:p-4"
      data-paused={playing ? undefined : ''}
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-start">
        {/* The round table */}
        <svg viewBox={`0 0 ${SIZE} 480`} className="mx-auto h-auto w-full max-w-[28rem]" aria-hidden="true">
          <circle cx={C.x} cy={C.y} r={RING - 38} fill="#efe3c8" stroke="#c9b186" strokeWidth={2} />
          <text x={C.x} y={C.y + 52} textAnchor="middle" fontSize="13" fontWeight={600} fill="#4c574d" letterSpacing="1.5">
            LLM COUNCIL
          </text>

          {/* question → members */}
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
              transform: `scale(${step === 0 ? 1 : 0.62})`,
              opacity: step === 5 ? 0 : 1,
            }}
          >
            <rect x={C.x - 50} y={C.y - 20} width={100} height={40} rx={8} fill="#354a87" />
            <text x={C.x} y={C.y + 6} textAnchor="middle" fontSize="16" fontWeight={700} fill="#fbf6ea">
              Question
            </text>
          </g>

          {/* answer cards: written in round 1, lettered in round 2, carried to the chairman (best first) in round 3 */}
          {SEATS.map((s, i) => {
            const p = cardPos(i);
            const rank = order.indexOf(s);
            const atChair = step === 5;
            const target = { x: C.x - 60 + rank * 30, y: CHAIR.y + 62 };
            const own = step === 2 && s === viewer;
            const letter = step === 2 ? letterFor(s) : null;
            const winner = step >= 4 && s === session.winner;
            return (
              <g
                key={s}
                className="ex-move"
                style={{
                  opacity: step === 0 || (step === 1 && answering) ? 0 : own ? 0.35 : 1,
                  transform: atChair ? `translate(${target.x - p.x}px, ${target.y - p.y}px) scale(0.6)` : 'none',
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  transitionDelay: atChair ? `${rank * 110}ms` : `${i * 70}ms`,
                }}
              >
                <rect
                  x={p.x - 22}
                  y={p.y - 16}
                  width={44}
                  height={32}
                  rx={5}
                  fill="#fbf6ea"
                  stroke={winner ? '#d3a13c' : '#354a87'}
                  strokeWidth={winner ? 3 : 1.6}
                  strokeDasharray={own ? '4 3' : undefined}
                />
                {letter ? (
                  <text x={p.x} y={p.y + 7} textAnchor="middle" fontSize="19" fontWeight={700} fill="#354a87">
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
                      x1={p.x - 13}
                      x2={p.x + (k === 2 ? 3 : 13)}
                      y1={p.y - 7 + k * 7}
                      y2={p.y - 7 + k * 7}
                      stroke="#4c574d"
                      strokeWidth={2}
                    />
                  ))
                )}
              </g>
            );
          })}

          {/* seats: chairman at the head, members round the ring, status under each name */}
          {[
            { key: 'chair', pos: CHAIR, glyph: '⚖', name: 'Chairman', st: chairStatus, large: true },
            ...SEATS.map((s, i) => ({ key: s, pos: seatPos(i), glyph: String(i + 1), name: s, st: statusOf(s), large: false })),
          ].map(({ key, pos, glyph, name, st, large }) => {
            const r = large ? 33 : 27;
            const look = RING_STYLE[st];
            const lx = pos.x + pos.cos * (r + 10);
            const ly = pos.y + pos.sin * (r + 14);
            const anchor = Math.abs(pos.cos) < 0.3 ? 'middle' : pos.cos > 0 ? 'start' : 'end';
            const above = pos.sin < -0.5;
            const isViewer = step === 2 && key === viewer;
            return (
              <g key={key}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r}
                  fill={isViewer ? '#354a87' : look.fill}
                  stroke={look.stroke}
                  strokeWidth={look.width}
                  strokeDasharray={look.dash}
                  className={look.pulse ? 'ex-pulse' : undefined}
                  style={{ transition: 'stroke 300ms var(--ease-out), fill 300ms var(--ease-out)' }}
                />
                <text
                  x={pos.x}
                  y={pos.y + 6}
                  textAnchor="middle"
                  fontSize={large ? 22 : 17}
                  fontWeight={700}
                  fill={isViewer ? '#fbf6ea' : '#354a87'}
                >
                  {glyph}
                </text>
                <text x={lx} y={ly + (above ? -12 : 0)} textAnchor={anchor} fontSize="14" fontWeight={600} fill="#26332e">
                  {name}
                </text>
                <text
                  x={lx}
                  y={ly + (above ? 3 : 15)}
                  textAnchor={anchor}
                  fontSize="12.5"
                  fill={st === 'failed' ? '#8e3b26' : '#4c574d'}
                >
                  {st}
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
