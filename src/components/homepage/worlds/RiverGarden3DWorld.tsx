/**
 * RiverGarden3DWorld — the River Garden as real geometry instead of painted art.
 *
 * This is the same world contract as every other homepage world (mascot / title
 * / children slots), so the whole existing homepage — profile cards, parent
 * pill, theme picker, create flow — keeps working unchanged. What differs is the
 * scene BEHIND it: a Blender-authored GLB rendered by React Three Fiber, with a
 * rigged, skinned lion that walks around the island under its own state machine.
 *
 * WHY THE UI IS STILL DOM
 * The brief is explicit that this must not be "scenic art with UI pasted on
 * top". It also must not be UI dragged into the 3D scene: text rendered as
 * textures loses selection, scaling, screen readers and crisp type. The honest
 * split is the one used here — the world is 3D and truly live, the interface is
 * DOM, and they are tied together by anchors AUTHORED IN BLENDER (MARK_TitleZone,
 * MARK_CardShelfZone, MARK_SpeechAnchor) that are projected to screen space each
 * frame, so the interface tracks the world rather than merely floating over it.
 *
 * FALLBACK
 * A 3D homepage cannot be a hard dependency for a children's app. Anything that
 * fails — no WebGL, a context loss, a slow device, reduced-motion — falls back
 * to the painted RiverGardenWorld, which is a complete experience on its own.
 */
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import type { WorldProps } from './types';
import RiverGardenWorld from './RiverGardenWorld';
import { useMotionPreset } from '../../../motion/useMotionPreset';

/* Lazy so three.js, drei and the GLB loaders stay out of the main bundle. The
   homepage must still boot fast for everyone who is not using this world. */
const HomeWorld3D = lazy(() => import('../world3d/HomeWorld3D'));

function webglAvailable() {
  if (typeof document === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function RiverGarden3DWorld({ mascot, mascotInScene, title, children, brainRef }: WorldProps) {
  const { isReducedMotion } = useMotionPreset();
  const [supported] = useState(webglAvailable);
  const [failed, setFailed] = useState(false);
  const [anchors, setAnchors] = useState<Record<string, { x: number; y: number }>>({});
  const ref = useRef<HTMLDivElement>(null);

  const onAnchors = useCallback((a: Record<string, { x: number; y: number }>) => setAnchors(a), []);

  /* A phone gets far less horizontal room, so the authored wide framing leaves
     the mascot as a speck between two trees. Pulling the camera further in on
     narrow viewports keeps the character the same apparent size across devices
     — the responsive equivalent of holding a shot. */
  const [dolly, setDolly] = useState(0.53);

  /* Ambient occlusion and depth of field are the difference between "a 3D
     model of a garden" and a rendered frame, but they are also the most
     expensive thing on the page. Gate them on device capability rather than
     shipping them everywhere: a low core count or a small screen is a good
     enough proxy for a phone that would rather have frames. */
  const [effects] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    const cores = navigator.hardwareConcurrency ?? 4;
    /* `?nofx` forces the chain off, and it earned its place immediately.
       The proof route has NEVER enabled post-processing, so the production
       cage lion had never been seen through it — and the first look showed its
       eyes washed out to blank ovals. With `?nofx` the same asset in the same
       frame has clear dark irises, which isolates the cause to the chain
       rather than to the asset, in one reload instead of an afternoon. */
    if (new URLSearchParams(window.location.search).has('nofx')) return false;
    return cores >= 6 && window.innerWidth >= 700;
  });
  useEffect(() => {
    const apply = () => {
      // Drive off the SMALLER effective dimension. Keying on width alone put a
      // tall tablet in portrait at the closest setting, and the lion filled the
      // frame with its body cropped by the cards.
      const d = Math.min(window.innerWidth, window.innerHeight * 1.25);
      setDolly(d < 700 ? 0.44 : d < 1024 ? 0.48 : 0.53);
    };
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, []);

  /* Until the GLB has loaded there are no anchors, so each slot needs a sane
     starting position. These are the only hard-coded percentages in the file
     and they exist purely to avoid a flash of stacked UI in the top-left. */
  const at = (name: string, fx: number, fy: number) => anchors[name] ?? { x: fx, y: fy };
  const speech = at('MARK_SpeechAnchor', 56, 42);
  const titleAt = at('MARK_TitleZoneHero', 50, 26);

  /* A lost WebGL context is not an exception React can catch — it arrives as a
     DOM event on the canvas. Without this the page would keep a dead black
     rectangle where the world used to be. */
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const onLost = () => setFailed(true);
    node.addEventListener('webglcontextlost', onLost, true);
    return () => node.removeEventListener('webglcontextlost', onLost, true);
  }, []);

  if (!supported || failed || isReducedMotion) {
    return <RiverGardenWorld mascot={mascot} title={title}>{children}</RiverGardenWorld>;
  }

  return (
    <div ref={ref} className="relative min-h-dvh overflow-hidden" style={{ background: '#8fd0f0' }}>
      <Suspense fallback={<div className="absolute inset-0" style={{ background: '#8fd0f0' }} />}>
        <HomeWorld3D brainRef={brainRef} onAnchors={onAnchors} cameraDolly={dolly} stageRadius={0.26} effects={effects} />
      </Suspense>

      {/* Title straddles the island's front edge — MARK_TitleZone, projected. */}
      <div
        className="pointer-events-none absolute z-20 flex w-[96vw] max-w-[760px] -translate-x-1/2 -translate-y-1/2 justify-center px-3"
        style={{ left: `${titleAt.x}%`, top: `${titleAt.y}%` }}
      >
        <div className="pointer-events-auto w-full">{title}</div>
      </div>

      {/* The 3D lion IS the mascot here, so the slot carries only the speech
          bubble — anchored beside the lion's head at MARK_SpeechAnchor, which
          means it follows the character instead of sitting at a fixed offset. */}
      <div
        className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full"
        style={{ left: `${speech.x}%`, top: `${speech.y}%` }}
      >
        {mascotInScene ?? mascot}
      </div>

      {/* Cards sit at the BOTTOM of the viewport, as in the reference frame —
          they are not anchored to a 3D point. Anchoring them to
          MARK_CardShelfZone put them mid-island, directly over the lion's chest
          and front paws, which the art direction rules out. The column already
          carries a flex-1 spacer, so the cards fall to the bottom on their own
          and the top controls keep their normal safe-area layout. */}
      {/* pb keeps the card row clear of the lion's front paws. Without it the
          single "New Player" card lands centred directly under the chin. */}
      <div className="relative z-20 flex min-h-dvh flex-col pb-2 sm:pb-4">{children}</div>
    </div>
  );
}
