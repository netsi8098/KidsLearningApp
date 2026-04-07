// ── Parent Mode Transition Component ──────────────────────────────
// Wraps content to provide smooth visual transitions between child
// and parent mode. Applied after the parent gate is unlocked.
//
// Visual effect: gentle fade + slight scale shift.
// Child mode feels "zoomed in" with large elements and warm colors.
// Parent mode "zooms out" to a cooler, data-dense overview.

import { useMemo, type ReactNode, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  parentModeConfig,
  childModeConfig,
  getParentModeCssVars,
} from './parentMode';

// ── Props ──────────────────────────────────────────────────────

export interface ParentModeTransitionProps {
  /** Whether parent mode is active (after gate unlock) */
  isParentMode: boolean;
  /** Child content to wrap with the transition */
  children: ReactNode;
  /** Optional: disable the scale transition, keep only color shift */
  disableScale?: boolean;
  /** Optional: override transition duration in seconds */
  duration?: number;
}

// ── Animation Variants ─────────────────────────────────────────

const TRANSITION_DURATION = 0.4; // seconds

/**
 * Child mode variant: warm, slightly scaled up (zoomed-in feel).
 */
const childVariants = {
  initial: { opacity: 0, scale: 1.02 },
  animate: { opacity: 1, scale: 1.0 },
  exit: { opacity: 0, scale: 1.02 },
};

/**
 * Parent mode variant: cool, slightly scaled down (zoomed-out overview).
 */
const parentVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1.0 },
  exit: { opacity: 0, scale: 0.98 },
};

/**
 * Flat variants (no scale) for when disableScale is true.
 */
const flatVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// ── Component ──────────────────────────────────────────────────

export default function ParentModeTransition({
  isParentMode,
  children,
  disableScale = false,
  duration,
}: ParentModeTransitionProps) {
  const transitionDuration = duration ?? TRANSITION_DURATION;

  // Build the CSS custom property overrides for parent mode
  const parentCssVars = useMemo(() => getParentModeCssVars(), []);

  // Choose the right style based on mode
  const wrapperStyle = useMemo<CSSProperties>(() => {
    if (isParentMode) {
      return {
        ...parentCssVars,
        backgroundColor: parentModeConfig.colors.background,
        color: parentModeConfig.colors.text.primary,
        fontSize: parentModeConfig.typography.bodySize,
        lineHeight: parentModeConfig.typography.lineHeight,
        fontFeatureSettings: parentModeConfig.typography.fontFeatures,
      };
    }
    return {
      backgroundColor: childModeConfig.colors.background,
      color: childModeConfig.colors.text.primary,
      fontSize: childModeConfig.typography.bodySize,
      lineHeight: childModeConfig.typography.lineHeight,
    };
  }, [isParentMode, parentCssVars]);

  // Select motion variants based on mode and settings
  const variants = disableScale
    ? flatVariants
    : isParentMode
      ? parentVariants
      : childVariants;

  const transition = {
    type: 'tween' as const,
    duration: transitionDuration,
    ease: [0.4, 0, 0.2, 1],
  };

  // CSS class applied to wrapper for downstream styling hooks
  const modeClass = isParentMode ? 'parent-mode' : 'child-mode';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isParentMode ? 'parent' : 'child'}
        className={`${modeClass} min-h-dvh`}
        style={wrapperStyle}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Utility: Parent Mode Wrapper ───────────────────────────────
// Lightweight wrapper that applies parent mode styles without
// animation. Useful for pages that are always in parent mode
// (like SettingsPage, ParentDashboard) after the gate is passed.

export interface ParentModeWrapperProps {
  children: ReactNode;
  className?: string;
}

export function ParentModeWrapper({
  children,
  className = '',
}: ParentModeWrapperProps) {
  const parentCssVars = useMemo(() => getParentModeCssVars(), []);

  const style: CSSProperties = {
    ...parentCssVars,
    backgroundColor: parentModeConfig.colors.background,
    color: parentModeConfig.colors.text.primary,
    fontSize: parentModeConfig.typography.bodySize,
    lineHeight: parentModeConfig.typography.lineHeight,
    fontFeatureSettings: parentModeConfig.typography.fontFeatures,
  };

  return (
    <div className={`parent-mode min-h-dvh ${className}`} style={style}>
      {children}
    </div>
  );
}

// ── Utility: Animated Parent Card ─────────────────────────────
// A single card component styled for parent mode with entrance animation.

export interface ParentCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ParentCard({
  children,
  className = '',
  delay = 0,
}: ParentCardProps) {
  return (
    <motion.div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}
      style={{ padding: parentModeConfig.spacing.cardPadding }}
      initial={{ opacity: 0, y: parentModeConfig.motion.entranceOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'tween',
        duration: parentModeConfig.motion.transitionDuration / 1000,
        ease: [0.4, 0, 0.2, 1],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

// ── Utility: Parent Section Header ────────────────────────────

export interface ParentSectionHeaderProps {
  children: ReactNode;
}

export function ParentSectionHeader({ children }: ParentSectionHeaderProps) {
  return (
    <h3
      style={{
        fontSize: parentModeConfig.typography.smallSize,
        fontWeight: parentModeConfig.typography.headingWeight,
        letterSpacing: parentModeConfig.typography.labelLetterSpacing,
        textTransform: 'uppercase',
        color: parentModeConfig.colors.text.muted,
        marginBottom: '12px',
      }}
    >
      {children}
    </h3>
  );
}
