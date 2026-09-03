/**
 * useSceneParallax — pointer/tilt driven depth for the homepage worlds.
 *
 * Layers separated in z should not travel together. This returns a normalised
 * pointer offset (-1..1 on each axis) that world layers multiply by their own
 * depth factor, so distant sky barely moves while foreground foliage swings.
 *
 * Deliberately restrained: the brief warns parallax must never make the
 * interface harder to use, so travel is a few pixels and the effect is spring
 * damped. Disabled entirely under prefers-reduced-motion.
 */
import { useEffect, useState } from 'react';
import { useMotionPreset } from '../../motion/useMotionPreset';

export interface ParallaxOffset {
  /** -1 (pointer at left edge) … 1 (right edge) */
  x: number;
  /** -1 (top) … 1 (bottom) */
  y: number;
}

/** Depth multipliers, in px of travel at full deflection. */
export const DEPTH = {
  sky: 4,
  far: 9,
  mid: 16,
  hero: 22,
  fore: 34,
} as const;

export function useSceneParallax(): ParallaxOffset {
  const { isReducedMotion } = useMotionPreset();
  const [offset, setOffset] = useState<ParallaxOffset>({ x: 0, y: 0 });

  useEffect(() => {
    if (isReducedMotion) {
      setOffset({ x: 0, y: 0 });
      return;
    }
    // Coarse pointers (touch) get no pointer parallax — there is no hover, and
    // sampling touchmove would fight scrolling on the card shelf.
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(pointer: coarse)').matches) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame) return; // coalesce to one update per frame
      frame = requestAnimationFrame(() => {
        frame = 0;
        setOffset({
          x: (e.clientX / window.innerWidth) * 2 - 1,
          y: (e.clientY / window.innerHeight) * 2 - 1,
        });
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [isReducedMotion]);

  return offset;
}
