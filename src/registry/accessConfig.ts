// ── Access Control Configuration ────────────────────────
// Default: all content is free. Premium overrides for future use.

import type { AccessTier } from './types';

/** Override specific content to premium tier */
const accessOverrides: Record<string, AccessTier> = {
  // Currently all content is free
  // Future premium content:
  // 'lesson:l-premium-1': 'premium',
};

/** Get the access tier for a content item (defaults to 'free') */
export function getAccessTier(contentId: string): AccessTier {
  return accessOverrides[contentId] ?? 'free';
}

/** Check if content is freely accessible */
export function isFreeContent(contentId: string): boolean {
  return getAccessTier(contentId) === 'free';
}

/** Check if content requires premium access */
export function isPremiumContent(contentId: string): boolean {
  return getAccessTier(contentId) === 'premium';
}

/** Get all premium content IDs */
export function getPremiumContentIds(): string[] {
  return Object.entries(accessOverrides)
    .filter(([, tier]) => tier === 'premium')
    .map(([id]) => id);
}
