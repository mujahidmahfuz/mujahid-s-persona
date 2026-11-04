/**
 * Site-wide motion layer (DESIGN §7). Every effect is progressive enhancement: the page is complete
 * without it, and nothing here runs under prefers-reduced-motion. Pointer effects run only on a
 * real hover-capable fine pointer (touch fires false hovers on tap).
 *
 *   [data-spotlight]   a soft light follows the cursor across the surface (sets --mx / --my)
 *   [data-tilt]        the element turns a few degrees toward the cursor inside its [data-tilt-zone]
 *   [data-magnetic]    a button leans toward the cursor while it is over it
 *   [data-parallax=f]  the element drifts at a slightly different speed from the page (f ≈ 0.04–0.12)
 *   [data-countup]     a number counts up once when it first scrolls into view
 *   [data-scrollstory] steps of a process light up as they cross the middle of the viewport
 *
 * All transforms are written to the element itself (never through a parent CSS variable) and only
 * `transform` / `opacity` are animated.
 */

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

function onFrame(fn: () => void) {
  let queued = false;
  return () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn();
    });
  };
}

/* ---------- Spotlight ---------- */
function spotlight() {
  document.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-spotlight]');
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    },
    { passive: true },
  );
}

/* ---------- Tilt (hero objects float toward the cursor) ---------- */
function tilt() {
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    const zone = el.closest<HTMLElement>('[data-tilt-zone]') ?? el;
    const max = Number(el.dataset.tilt) || 6; // degrees
    let px = 0;
    let py = 0;
    const apply = onFrame(() => {
      el.style.transform = `perspective(1100px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translate3d(${(px * 8).toFixed(1)}px, ${(py * 8).toFixed(1)}px, 0)`;
    });
    zone.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = zone.getBoundingClientRect();
        px = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
        py = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
        apply();
      },
      { passive: true },
    );
    zone.addEventListener('pointerleave', () => {
      px = 0;
      py = 0;
      apply();
    });
  });
}

/* ---------- Magnetic buttons ---------- */
function magnetic() {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${(dx * 0.22).toFixed(1)}px, ${(dy * 0.3).toFixed(1)}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
    });
  });
}

/* ---------- Parallax drift (light: a few dozen pixels at most) ---------- */
function parallax() {
  const els = [...document.querySelectorAll<HTMLElement>('[data-parallax]')];
  if (!els.length) return;
  const visible = new Set<HTMLElement>();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) visible.add(e.target as HTMLElement);
      else visible.delete(e.target as HTMLElement);
    }
    update();
  });
  els.forEach((el) => io.observe(el));
  const update = onFrame(() => {
    const vh = window.innerHeight;
    for (const el of visible) {
      const f = Number(el.dataset.parallax) || 0.08;
      const r = el.getBoundingClientRect();
      // offset of the element's centre from the viewport centre, scaled and capped
      const d = Math.max(-60, Math.min(60, (r.top + r.height / 2 - vh / 2) * f));
      el.style.transform = `translate3d(0, ${d.toFixed(1)}px, 0)`;
    }
  });
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
}

/* ---------- Count-up numbers ---------- */
function countup() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        const el = e.target as HTMLElement;
        const final = el.textContent ?? '';
        const m = /^(\D*)(\d[\d,]*(?:\.\d+)?)(.*)$/.exec(final);
        if (!m || /\d/.test(m[3] ?? '')) continue; // one number only ("8/8" stays as written)
        const [, pre = '', num = '', post = ''] = m;
        const target = Number(num.replace(/,/g, ''));
        const decimals = num.includes('.') ? (num.split('.')[1]?.length ?? 0) : 0;
        const grouped = num.includes(',');
        const fmt = (v: number) =>
          grouped
            ? v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
            : v.toFixed(decimals);
        const t0 = performance.now();
        const dur = 1100;
        const step = (t: number) => {
          const k = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - k, 4); // ease-out quart
          el.textContent = k < 1 ? `${pre}${fmt(target * eased)}${post}` : final;
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    },
    { threshold: 0.6 },
  );
  document.querySelectorAll('[data-countup]').forEach((el) => io.observe(el));
}

/* ---------- Scroll story: the step crossing the middle of the viewport is the active one ---------- */
function scrollstory() {
  document.querySelectorAll<HTMLElement>('[data-scrollstory]').forEach((root) => {
    const steps = [...root.querySelectorAll<HTMLElement>('[data-story-step]')];
    const panels = [...root.querySelectorAll<HTMLElement>('[data-story-panel]')];
    const meter = root.querySelector<HTMLElement>('[data-story-meter]');
    const setActive = (i: number) => {
      root.dataset.active = String(i);
      steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
      panels.forEach((p, k) => p.classList.toggle('is-active', k === i));
      if (meter) meter.style.transform = `scaleY(${(i + 1) / steps.length})`;
    };
    setActive(0);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(steps.indexOf(e.target as HTMLElement));
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    steps.forEach((s) => io.observe(s));
  });
}

/* ---------- Sub-navigation: mark the section being read ---------- */
function subnav() {
  const nav = document.querySelector<HTMLElement>('[data-subnav]');
  if (!nav) return;
  const links = [...nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  const byId = new Map(links.map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const a = byId.get(e.target.id);
        if (!a) continue;
        links.forEach((l) => l.removeAttribute('aria-current'));
        a.setAttribute('aria-current', 'location');
        // keep the active tab visible in the horizontal strip without moving the page
        const strip = a.closest<HTMLElement>('[data-subnav-strip]');
        if (strip) {
          const left = a.offsetLeft - strip.clientWidth / 2 + a.clientWidth / 2;
          strip.scrollTo({ left, behavior: reduce.matches ? 'auto' : 'smooth' });
        }
      }
    },
    { rootMargin: '-20% 0px -70% 0px' },
  );
  byId.forEach((_, id) => {
    const target = document.getElementById(id);
    if (target) io.observe(target);
  });
}

// Wayfinding works for everyone; only motion is gated.
subnav();
scrollstory();
if (!reduce.matches) {
  countup();
  parallax();
  if (finePointer.matches) {
    document.documentElement.classList.add('fine-pointer');
    spotlight();
    tilt();
    magnetic();
  }
}
