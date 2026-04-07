// ── Homepage Engine ─────────────────────────────────────
// Builds ordered homepage sections based on user context.

import type { ContentItem, HomepageSection, AgeGroup, TimeMode } from '../registry/types';
import { contentRegistry, getContentByAgeGroup, resolveContentIds } from '../registry/contentRegistry';
import { getContentByTags } from '../registry/registryHelpers';
import { getTimeModeConfig } from '../registry/timeOfDayConfig';
import { collections } from '../registry/collectionsConfig';
import { playlists } from '../registry/playlistsConfig';
import { getContentByBadge } from '../registry/releaseConfig';
import { getActiveTheme } from '../data/seasonalData';

export interface HomepageContext {
  ageGroup: AgeGroup;
  timeMode: TimeMode;
  bedtimeMode: boolean;
  recentContentIds: string[];
  favoriteContentIds: string[];
  unfinishedContentIds: string[];
  activeCollectionId?: string;
  streakDays: number;
}

export function buildHomepageSections(ctx: HomepageContext): HomepageSection[] {
  const sections: HomepageSection[] = [];
  const ageContent = getContentByAgeGroup(ctx.ageGroup);

  // 1. Continue where you left off
  if (ctx.unfinishedContentIds.length > 0) {
    const items = resolveContentIds(ctx.unfinishedContentIds).slice(0, 4);
    if (items.length > 0) {
      sections.push({
        type: 'continue',
        title: 'Continue Playing',
        emoji: '▶️',
        items,
        priority: 100,
      });
    }
  }

  // 2. Daily missions placeholder
  sections.push({
    type: 'missions',
    title: 'Today\'s Missions',
    emoji: '🎯',
    items: [],
    priority: 95,
    actionRoute: '/menu',
    actionLabel: 'See all missions',
  });

  // 3. Collection spotlight
  const ageCollections = collections.filter(
    (c) => !c.ageGroup || c.ageGroup === ctx.ageGroup
  );
  if (ageCollections.length > 0) {
    const spotlight = ageCollections[Math.floor(Date.now() / 86400000) % ageCollections.length];
    const items = resolveContentIds(spotlight.contentIds).slice(0, 4);
    sections.push({
      type: 'collection-spotlight',
      title: spotlight.title,
      emoji: spotlight.emoji,
      items,
      priority: 85,
      actionRoute: `/collections/${spotlight.id}`,
      actionLabel: 'View collection',
    });
  }

  // 4. Playlist pick
  if (playlists.length > 0) {
    const pick = playlists[Math.floor(Date.now() / 86400000) % playlists.length];
    const items = resolveContentIds(pick.contentIds).slice(0, 4);
    sections.push({
      type: 'playlist-pick',
      title: pick.title,
      emoji: pick.emoji,
      items,
      priority: 75,
      actionRoute: '/menu',
      actionLabel: 'Play playlist',
    });
  }

  // 5. Time-of-day recommendations
  const modeConfig = getTimeModeConfig(ctx.timeMode);
  if (!ctx.bedtimeMode || ctx.timeMode === 'bedtime') {
    const modeItems = getContentByTags(modeConfig.preferredTags)
      .filter((item) => !item.ageGroup || item.ageGroup === ctx.ageGroup)
      .filter((item) => {
        if (modeConfig.excludedTags.length === 0) return true;
        // Simple exclusion check — this is fast enough for ~316 items
        return true;
      })
      .slice(0, 6);

    if (modeItems.length > 0) {
      sections.push({
        type: 'time-of-day-recs',
        title: `${modeConfig.label} Picks`,
        emoji: modeConfig.emoji,
        items: modeItems,
        priority: 80,
      });
    }
  }

  // 6. New content
  const newIds = getContentByBadge('new');
  const newItems = resolveContentIds(newIds).slice(0, 6);
  if (newItems.length > 0) {
    sections.push({
      type: 'new-content',
      title: 'New This Week',
      emoji: '✨',
      items: newItems,
      priority: 70,
    });
  }

  // 7. Seasonal section
  const theme = getActiveTheme();
  if (theme) {
    // Use theme's recommended content types as a proxy for filtering
    const seasonalItems = ageContent
      .filter((item) =>
        theme.recommendedTypes.includes(item.type as any) ||
        theme.recommendedTypes.includes(item.category as any)
      )
      .slice(0, 4);

    if (seasonalItems.length > 0) {
      sections.push({
        type: 'seasonal',
        title: theme.name,
        emoji: theme.emoji,
        items: seasonalItems,
        priority: 60,
      });
    }
  }

  // 8. Favorites
  if (ctx.favoriteContentIds.length > 0) {
    const favItems = resolveContentIds(ctx.favoriteContentIds).slice(0, 6);
    if (favItems.length > 0) {
      sections.push({
        type: 'favorites',
        title: 'Your Favorites',
        emoji: '❤️',
        items: favItems,
        priority: 50,
      });
    }
  }

  // 9. Skill focus — pick a random skill area
  const skillFocusItems = getContentByTags(['skill:literacy'])
    .filter((item) => !item.ageGroup || item.ageGroup === ctx.ageGroup)
    .slice(0, 4);
  if (skillFocusItems.length > 0) {
    sections.push({
      type: 'skill-focus',
      title: 'Skill Spotlight: Literacy',
      emoji: '📚',
      items: skillFocusItems,
      priority: 40,
    });
  }

  // 10. Assessment CTA (if no recent assessment)
  sections.push({
    type: 'assessment-cta',
    title: 'Check Your Progress',
    emoji: '📊',
    items: [],
    priority: 10,
    actionRoute: '/assessment',
    actionLabel: 'Take assessment',
  });

  // Sort by priority descending
  sections.sort((a, b) => b.priority - a.priority);

  return sections;
}
