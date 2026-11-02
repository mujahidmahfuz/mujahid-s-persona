/**
 * The only island Explainer.astro hydrates (client:visible). It decides whether the
 * interactive version may replace the poster — WebGL present (3D), motion allowed
 * (animated), no data-saver — and only then lazy-loads the explainer code.
 * Server render is an empty, transparent box over the poster: client:visible observes the
 * island's children, so there must be an element for it to watch.
 */
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { loaderFor } from './registry';

interface Props {
  id: string;
  dim: '2d' | '3d';
  animated: boolean;
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function ExplainerIsland({ id, dim, animated }: Props) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    setAllowed(!saveData && !(animated && reduce) && (dim === '2d' || hasWebGL()));
  }, [dim, animated]);

  const Component = useMemo(() => {
    const load = loaderFor(id);
    return load ? lazy(load) : null;
  }, [id]);

  const onReady = () => ref.current?.closest('[data-explainer]')?.setAttribute('data-island-ready', '');

  const active = !!allowed && !!Component;
  return (
    <div ref={ref} className={`absolute inset-0 ${active ? '' : 'pointer-events-none'}`} data-island-root>
      {active && Component && (
        <Suspense fallback={null}>
          <Component onReady={onReady} />
        </Suspense>
      )}
    </div>
  );
}
