// ── Visual Depth & Layering System ──────────────────────────────
// Defines the z-index, opacity, blur, and shadow configurations
// for each visual layer in the Kids Learning Fun app.

import type { CSSProperties } from 'react';

// ── Layer Names ─────────────────────────────────────────────────

export type LayerName = 'base' | 'decorative' | 'interaction' | 'floating';

// ── Layer Configuration ─────────────────────────────────────────

export interface LayerConfig {
  readonly name: string;
  readonly description: string;
  readonly zIndex: number;
  readonly opacity: {
    readonly min: number;
    readonly max: number;
    readonly default: number;
  };
  readonly blur: {
    readonly min: number;   // px
    readonly max: number;   // px
    readonly default: number;
  };
  readonly shadow: {
    readonly value: string;
    readonly spread: number;  // px
    readonly color: string;
  };
}

export const layers: Record<LayerName, LayerConfig> = {
  base: {
    name: 'Base',
    description: 'Background gradients, scene backdrops, and ambient color washes.',
    zIndex: 0,
    opacity: { min: 1.0, max: 1.0, default: 1.0 },
    blur: { min: 0, max: 0, default: 0 },
    shadow: {
      value: 'none',
      spread: 0,
      color: 'transparent',
    },
  },
  decorative: {
    name: 'Decorative',
    description: 'Texture patterns, floating shapes, ambient particles, and subtle overlays.',
    zIndex: 10,
    opacity: { min: 0.03, max: 0.15, default: 0.06 },
    blur: { min: 0, max: 2, default: 0 },
    shadow: {
      value: 'none',
      spread: 0,
      color: 'transparent',
    },
  },
  interaction: {
    name: 'Interaction',
    description: 'Cards, buttons, content areas, form elements -- all user-interactable UI.',
    zIndex: 20,
    opacity: { min: 1.0, max: 1.0, default: 1.0 },
    blur: { min: 0, max: 0, default: 0 },
    shadow: {
      value: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
      spread: -1,
      color: 'rgba(0, 0, 0, 0.07)',
    },
  },
  floating: {
    name: 'Floating',
    description: 'Reward animations, celebration confetti, toasts, modals, and overlays.',
    zIndex: 30,
    opacity: { min: 0.8, max: 1.0, default: 1.0 },
    blur: { min: 0, max: 8, default: 0 },
    shadow: {
      value: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      spread: -5,
      color: 'rgba(0, 0, 0, 0.1)',
    },
  },
} as const;

// ── Bedtime Layer Variants ──────────────────────────────────────
// Bedtime mode uses reduced contrast between layers to create a
// calm, unified visual feel with softer shadows and lower opacity.

export const bedtimeLayers: Record<LayerName, Partial<LayerConfig>> = {
  base: {
    opacity: { min: 1.0, max: 1.0, default: 1.0 },
    shadow: {
      value: 'none',
      spread: 0,
      color: 'transparent',
    },
  },
  decorative: {
    opacity: { min: 0.02, max: 0.08, default: 0.04 },
    blur: { min: 0, max: 4, default: 1 },
    shadow: {
      value: 'none',
      spread: 0,
      color: 'transparent',
    },
  },
  interaction: {
    opacity: { min: 0.95, max: 1.0, default: 0.98 },
    shadow: {
      value: '0 2px 4px rgba(0, 0, 0, 0.2)',
      spread: 0,
      color: 'rgba(0, 0, 0, 0.2)',
    },
  },
  floating: {
    opacity: { min: 0.7, max: 0.95, default: 0.92 },
    blur: { min: 0, max: 12, default: 2 },
    shadow: {
      value: '0 8px 16px rgba(0, 0, 0, 0.25)',
      spread: -2,
      color: 'rgba(0, 0, 0, 0.25)',
    },
  },
} as const;

// ── Helper Functions ────────────────────────────────────────────

/**
 * Returns CSS properties for a given layer.
 * Optionally applies bedtime variant when `bedtime` is true.
 */
export function getLayerStyle(
  layer: LayerName,
  options: { bedtime?: boolean; opacity?: number } = {},
): CSSProperties {
  const config = layers[layer];
  const bedtimeOverride = options.bedtime ? bedtimeLayers[layer] : undefined;

  const resolvedOpacity =
    options.opacity ??
    bedtimeOverride?.opacity?.default ??
    config.opacity.default;

  const resolvedShadow =
    bedtimeOverride?.shadow?.value ?? config.shadow.value;

  return {
    zIndex: config.zIndex,
    opacity: resolvedOpacity,
    boxShadow: resolvedShadow !== 'none' ? resolvedShadow : undefined,
  };
}

/**
 * Returns the z-index for a specific layer. Useful for inline styles
 * or when you only need the stacking context value.
 */
export function getLayerZ(layer: LayerName): number {
  return layers[layer].zIndex;
}

/**
 * Merges the layer style with additional CSS properties.
 * Convenience wrapper for composing styles.
 */
export function withLayer(
  layer: LayerName,
  additionalStyles: CSSProperties = {},
  options: { bedtime?: boolean; opacity?: number } = {},
): CSSProperties {
  return {
    ...getLayerStyle(layer, options),
    ...additionalStyles,
  };
}

// ── Backdrop Blur Presets ───────────────────────────────────────
// Used for glass-morphism effects on floating elements

export const backdropBlur = {
  /** Subtle blur for semi-transparent cards */
  subtle: 'blur(4px)',
  /** Medium blur for modals and overlays */
  medium: 'blur(8px)',
  /** Heavy blur for full-screen overlays */
  heavy: 'blur(16px)',
  /** None -- for bedtime mode or performance */
  none: 'none',
} as const;
