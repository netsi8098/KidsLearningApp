// =============================================================================
// AnimateIn - Reusable entrance animation wrapper
// =============================================================================
// Wraps children in a Framer Motion element that animates them into view.
// Supports 10 entrance variants, viewport-triggered "once" mode, bedtime
// adaptation, reduced-motion fallback, and child stagger.

import { useMemo, type ReactNode, type CSSProperties } from 'react';
import {
  motion,
  type Variants,
  type Transition,
  type UseInViewOptions,
} from 'framer-motion';
import { useAccessibility } from '../context/AccessibilityContext';
import { useApp } from '../context/AppContext';
import {
  timing,
  springs,
  easings,
  BEDTIME_TIMING_MULTIPLIER,
  type SpringKey,
} from './motionPrimitives';

// ── Props ───────────────────────────────────────────────────────────────────

export type AnimateInVariant =
  | 'fadeUp'
  | 'fadeDown'
  | 'fadeLeft'
  | 'fadeRight'
  | 'scaleUp'
  | 'scaleDown'
  | 'pop'
  | 'slideUp'
  | 'dropIn'
  | 'flipIn';

export interface AnimateInProps {
  children: ReactNode;
  /** Entrance animation variant (default: fadeUp) */
  variant?: AnimateInVariant;
  /** Additional delay in seconds before this element animates */
  delay?: number;
  /** Override duration in seconds (ignored when using spring) */
  duration?: number;
  /** Spring preset to use instead of tween easing */
  spring?: SpringKey;
  /** Stagger delay between children (seconds). Wrap children in their own AnimateIn or motion elements */
  stagger?: number;
  /** Additional CSS class on the wrapper */
  className?: string;
  /** Inline styles on the wrapper */
  style?: CSSProperties;
  /** Animate only once when entering the viewport */
  once?: boolean;
  /** Use calmer bedtime variant regardless of context */
  bedtimeVariant?: boolean;
  /** Viewport margin for "once" mode (default: "-50px") */
  viewportMargin?: UseInViewOptions['margin'];
  /** HTML tag to render (default: div) */
  as?: 'div' | 'span' | 'section' | 'article' | 'li' | 'ul';
}

// ── Variant Definitions ─────────────────────────────────────────────────────

interface VariantDef {
  initial: Record<string, unknown>;
  animate: Record<string, unknown>;
  useSpring: boolean; // Whether this variant benefits from spring physics
}

const variantDefs: Record<AnimateInVariant, VariantDef> = {
  fadeUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    useSpring: false,
  },
  fadeDown: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    useSpring: false,
  },
  fadeLeft: {
    initial: { x: -30, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    useSpring: false,
  },
  fadeRight: {
    initial: { x: 30, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    useSpring: false,
  },
  scaleUp: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    useSpring: true,
  },
  scaleDown: {
    initial: { scale: 1.15, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    useSpring: true,
  },
  pop: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    useSpring: true,
  },
  slideUp: {
    initial: { y: 40 },
    animate: { y: 0 },
    useSpring: true,
  },
  dropIn: {
    initial: { y: -60, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    useSpring: true,
  },
  flipIn: {
    initial: { rotateX: 90, opacity: 0 },
    animate: { rotateX: 0, opacity: 1 },
    useSpring: false,
  },
};

// ── Reduced Motion Variant ──────────────────────────────────────────────────

const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.1 },
  },
};

// ── Bedtime Variant ─────────────────────────────────────────────────────────

const bedtimeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      type: 'tween',
      duration: timing.gentle * BEDTIME_TIMING_MULTIPLIER,
      ease: easings.decelerate as unknown as number[],
    },
  },
};

// ── Build Variants ──────────────────────────────────────────────────────────

function buildVariants(
  variantName: AnimateInVariant,
  delay: number,
  duration: number | undefined,
  springKey: SpringKey | undefined,
  stagger: number | undefined,
): Variants {
  const def = variantDefs[variantName];

  let transition: Transition;

  if (springKey) {
    // Explicit spring requested
    transition = { ...springs[springKey], delay };
  } else if (def.useSpring) {
    // Variant default to spring
    transition = {
      ...springs.bouncy,
      delay,
    };
  } else {
    // Tween
    transition = {
      type: 'tween',
      duration: duration ?? timing.normal,
      ease: easings.decelerate as unknown as number[],
      delay,
    };
  }

  // Add perspective for flipIn
  const perspectiveProps: Record<string, unknown> = {};
  if (variantName === 'flipIn') {
    perspectiveProps.transformPerspective = 800;
  }

  return {
    hidden: {
      ...def.initial,
      ...perspectiveProps,
    },
    visible: {
      ...def.animate,
      ...perspectiveProps,
      transition: stagger
        ? {
            ...transition,
            staggerChildren: stagger,
          }
        : transition,
    },
  };
}

// ── Component ───────────────────────────────────────────────────────────────

export default function AnimateIn({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration,
  spring,
  stagger,
  className,
  style,
  once = false,
  bedtimeVariant = false,
  viewportMargin,
  as = 'div',
}: AnimateInProps) {
  const { reducedMotion } = useAccessibility();
  const { bedtimeMode } = useApp();

  const useBedtime = bedtimeVariant || bedtimeMode;

  // Memoize variants to avoid re-creating on every render
  const variants = useMemo(() => {
    if (reducedMotion) return reducedMotionVariants;
    if (useBedtime) return bedtimeVariants;
    return buildVariants(variant, delay, duration, spring, stagger);
  }, [reducedMotion, useBedtime, variant, delay, duration, spring, stagger]);

  // Adjust bedtime variant delay
  const bedtimeDelayedVariants = useMemo(() => {
    if (!useBedtime || reducedMotion) return variants;
    if (delay <= 0) return variants;

    return {
      ...variants,
      visible: {
        ...(variants.visible as Record<string, unknown>),
        transition: {
          ...((variants.visible as Record<string, unknown>).transition as Record<string, unknown>),
          delay: delay * BEDTIME_TIMING_MULTIPLIER,
        },
      },
    } as Variants;
  }, [variants, useBedtime, reducedMotion, delay]);

  const finalVariants = useBedtime && !reducedMotion ? bedtimeDelayedVariants : variants;

  // Determine the motion component tag
  const MotionTag = motion[as] as typeof motion.div;

  // Common props
  const motionProps = {
    className,
    style: {
      ...style,
      // GPU-composited: ensure will-change hint for entrance
      willChange: reducedMotion ? undefined : 'transform, opacity',
    },
    variants: finalVariants,
    initial: 'hidden',
    ...(once
      ? {
          whileInView: 'visible' as const,
          viewport: {
            once: true,
            margin: viewportMargin ?? '-50px',
          },
        }
      : {
          animate: 'visible' as const,
        }),
  };

  return <MotionTag {...motionProps}>{children}</MotionTag>;
}

// ── Re-export for convenience ───────────────────────────────────────────────

export { AnimateIn };
