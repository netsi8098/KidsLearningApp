// ── Release / Content Badge Configuration ───────────────
// Track "new", "popular", "editors-pick" badges for content items.

import type { ContentBadge, ReleaseMeta } from './types';

const NEW_DURATION_DAYS = 14;

/** Content items with release metadata */
export const releaseMeta: ReleaseMeta[] = [
  // v5 content — mark as "new" with recent dates
  { contentId: 'cooking:ck-1', addedDate: '2026-03-15', badges: ['new'] },
  { contentId: 'cooking:ck-2', addedDate: '2026-03-15', badges: ['new'] },
  { contentId: 'movement:dance-party', addedDate: '2026-03-10', badges: ['new', 'popular'] },
  { contentId: 'movement:yoga-fun', addedDate: '2026-03-10', badges: ['new'] },
  { contentId: 'homeactivity:ha-1', addedDate: '2026-03-12', badges: ['new'] },
  { contentId: 'explorer:solar-system', addedDate: '2026-03-08', badges: ['new', 'editors-pick'] },
  { contentId: 'explorer:animals-intro', addedDate: '2026-03-08', badges: ['popular'] },
  { contentId: 'emotion:happy', addedDate: '2026-03-05', badges: ['popular'] },
  { contentId: 'coloring:cat', addedDate: '2026-03-01', badges: ['popular'] },

  // Editor's picks (evergreen)
  { contentId: 'lesson:l-2-abc-1', addedDate: '2025-06-01', badges: ['editors-pick'] },
  { contentId: 'lesson:l-4-abc-1', addedDate: '2025-06-01', badges: ['editors-pick'] },
  { contentId: 'story:s-2-bed-1', addedDate: '2025-06-01', badges: ['editors-pick', 'popular'] },
  { contentId: 'game:memory-match', addedDate: '2025-06-01', badges: ['popular'] },
  { contentId: 'audio:nursery-1', addedDate: '2025-06-01', badges: ['popular'] },
];

const metaMap = new Map<string, ReleaseMeta>(
  releaseMeta.map((m) => [m.contentId, m])
);

/** Check if content is "new" (added within NEW_DURATION_DAYS) */
export function isNew(contentId: string): boolean {
  const meta = metaMap.get(contentId);
  if (!meta) return false;
  const addedMs = new Date(meta.addedDate).getTime();
  const cutoff = Date.now() - NEW_DURATION_DAYS * 24 * 60 * 60 * 1000;
  return addedMs > cutoff;
}

/** Get all badges for a content item */
export function getContentBadges(contentId: string): ContentBadge[] {
  const meta = metaMap.get(contentId);
  if (!meta) return [];
  const badges = [...meta.badges];
  // Add 'new' badge dynamically if within date range
  if (!badges.includes('new') && isNew(contentId)) {
    badges.push('new');
  }
  // Remove 'new' if outside date range
  if (badges.includes('new') && !isNew(contentId)) {
    return badges.filter((b) => b !== 'new');
  }
  return badges;
}

/** Get all content with a specific badge */
export function getContentByBadge(badge: ContentBadge): string[] {
  return releaseMeta
    .filter((m) => {
      if (badge === 'new') return isNew(m.contentId);
      return m.badges.includes(badge);
    })
    .map((m) => m.contentId);
}
