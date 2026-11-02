import { useEffect, useState, type RefObject } from 'react';

/** True while the element is on screen AND the tab is visible — render loops pause otherwise. */
export function useInView(ref: RefObject<Element | null>, rootMargin = '0px'): boolean {
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(!!e?.isIntersecting), { rootMargin });
    io.observe(el);
    const vis = () => setTabVisible(document.visibilityState === 'visible');
    vis();
    document.addEventListener('visibilitychange', vis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', vis);
    };
  }, [ref, rootMargin]);
  return onScreen && tabVisible;
}
