import { useCallback, useEffect, useRef, useState } from 'react';
import { useInView } from './useInView';
import { useReducedMotion } from './useReducedMotion';

/** Poster mode (scripts/posters.ts adds ?poster): show the final step, no autoplay. */
export const isPosterMode = () => typeof location !== 'undefined' && new URLSearchParams(location.search).has('poster');

/**
 * Step-through explainer state with optional autoplay.
 * Autoplay runs only while on screen and the tab is visible, never under reduced motion,
 * stops at the last step, and stops for good once the user picks a step themselves.
 */
export function useStepper(count: number, intervalMs = 2600) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduced = useReducedMotion();
  const poster = isPosterMode();
  const [step, setStepState] = useState(poster ? count - 1 : 0);
  const [playing, setPlaying] = useState(!poster);

  useEffect(() => {
    if (reduced) {
      setPlaying(false);
      setStepState(count - 1);
    }
  }, [reduced, count]);

  useEffect(() => {
    if (!playing || !inView || reduced) return;
    if (step >= count - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStepState((s) => Math.min(s + 1, count - 1)), intervalMs);
    return () => clearTimeout(t);
  }, [playing, inView, reduced, step, count, intervalMs]);

  const setStep = useCallback(
    (i: number) => {
      setPlaying(false);
      setStepState(Math.max(0, Math.min(count - 1, i)));
    },
    [count],
  );

  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (!p && step >= count - 1) setStepState(0); // replay from the start
      return !p;
    });
  }, [step, count]);

  return { ref, step, setStep, playing: playing && !reduced, toggle, canAutoplay: !reduced };
}

/** True once the element has been on screen (charts animate in once). Immediate under reduced motion / poster. */
export function useRevealOnce() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, '0px 0px -15% 0px');
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(isPosterMode());
  useEffect(() => {
    if (inView || reduced) setShown(true);
  }, [inView, reduced]);
  return { ref, shown };
}
