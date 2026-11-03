import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { SceneShell } from '../shared/SceneShell';
import { Slider } from '../shared/Slider';
import { useInView } from '../shared/useInView';
import type { ExplainerProps } from '../types';
import { centreIndex, latticePoints } from './math';

type OrbitControlsImpl = React.ComponentRef<typeof OrbitControls>;

const START: [number, number, number] = [6, 4.5, 7];

/** Rotates the camera while `active`, invalidating frames only then (frameloop="demand"). */
function AutoRotate({ active, controls }: { active: boolean; controls: React.RefObject<OrbitControlsImpl | null> }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const tick = () => {
      const c = controls.current;
      if (c) {
        c.autoRotate = true;
        c.update();
      }
      invalidate();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (controls.current) controls.current.autoRotate = false;
    };
  }, [active, controls, invalidate]);
  return null;
}

function Ready({ onReady }: { onReady?: (() => void) | undefined }) {
  useEffect(() => onReady?.(), [onReady]);
  return null;
}

export default function DemoLattice3D({ onReady }: ExplainerProps) {
  const [n, setN] = useState(3);
  const wrap = useRef<HTMLDivElement>(null);
  const controls = useRef<OrbitControlsImpl | null>(null);
  const inView = useInView(wrap);
  const pts = useMemo(() => latticePoints(n, 1.2), [n]);
  const centre = centreIndex(pts);

  const reset = useCallback(() => {
    const c = controls.current;
    if (!c) return;
    c.object.position.set(...START);
    c.target.set(0, 0, 0);
    c.update();
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    const c = controls.current;
    if (!c) return;
    const step = Math.PI / 24;
    const handled = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', '_', 'r', 'R'];
    if (!handled.includes(e.key)) return;
    e.preventDefault();
    const pos = c.object.position;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const a = e.key === 'ArrowLeft' ? step : -step;
      const { x, z } = pos;
      pos.x = x * Math.cos(a) - z * Math.sin(a);
      pos.z = x * Math.sin(a) + z * Math.cos(a);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      pos.y = Math.max(-10, Math.min(10, pos.y + (e.key === 'ArrowUp' ? 0.5 : -0.5)));
    } else if (e.key === '+' || e.key === '=') {
      pos.multiplyScalar(0.9);
    } else if (e.key === '-' || e.key === '_') {
      pos.multiplyScalar(1.1);
    } else {
      reset();
      return;
    }
    c.update();
  };

  return (
    <div
      ref={wrap}
      className="h-full bg-blue-900"
      tabIndex={0}
      onKeyDown={onKey}
      aria-label="3D lattice. Arrow keys rotate, plus and minus zoom, R resets."
    >
      <SceneShell
        label={`Cubic lattice with ${n} spheres per side; the centre sphere is highlighted in pink.`}
        onReset={reset}
        keyboardHelp="Arrows rotate · +/− zoom · R reset"
        controls={
          <div className="w-48 [&_label]:text-white [&_output]:text-white">
            <Slider label="Per side" value={n} min={2} max={6} onChange={setN} />
          </div>
        }
      >
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: START, fov: 45 }} style={{ background: '#17363d' }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1.2} />
          {pts.map((p, i) => (
            <mesh key={`${n}-${i}`} position={p}>
              <sphereGeometry args={[i === centre ? 0.22 : 0.14, 20, 20]} />
              <meshStandardMaterial
                color={i === centre ? '#b65d42' : '#ffffff'}
                emissive={i === centre ? '#b65d42' : '#000000'}
                emissiveIntensity={0.4}
              />
            </mesh>
          ))}
          <Html position={pts[centre]} center distanceFactor={10} zIndexRange={[10, 0]}>
            <span
              className="translate-y-6 rounded bg-blue-900 px-2 py-0.5 text-xs whitespace-nowrap text-pink"
              data-surface="dark"
            >
              centre
            </span>
          </Html>
          <OrbitControls ref={controls} enableDamping enablePan={false} minDistance={4} maxDistance={20} autoRotateSpeed={1.2} />
          <AutoRotate active={inView} controls={controls} />
          <Ready onReady={onReady} />
        </Canvas>
      </SceneShell>
    </div>
  );
}
