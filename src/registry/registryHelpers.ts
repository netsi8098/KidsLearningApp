// ── Registry Helpers ────────────────────────────────────
// Filter by tags, build related-content rails, tag-based groups

import type { ContentItem, ContentType, AgeGroup } from './types';
import { contentRegistry, contentById } from './contentRegistry';
import { getTagsForContent, tagDefinitions } from './tagsConfig';

/** Get all content matching ANY of the given tags */
export function getContentByTags(tags: string[]): ContentItem[] {
  if (tags.length === 0) return [];
  const tagSet = new Set(tags);
  return contentRegistry.filter((item) => {
    const itemTags = getTagsForContent(item.id);
    return itemTags.some((t) => tagSet.has(t));
  });
}

/** Get all content matching ALL of the given tags */
export function getContentByAllTags(tags: string[]): ContentItem[] {
  if (tags.length === 0) return contentRegistry;
  return contentRegistry.filter((item) => {
    const itemTags = new Set(getTagsForContent(item.id));
    return tags.every((t) => itemTags.has(t));
  });
}

/** Find related content based on shared tags */
export function getRelatedContent(
  contentId: string,
  limit = 6
): ContentItem[] {
  const item = contentById.get(contentId);
  if (!item) return [];

  const itemTags = getTagsForContent(contentId);
  if (itemTags.length === 0) return [];

  const scored: { item: ContentItem; score: number }[] = [];

  for (const candidate of contentRegistry) {
    if (candidate.id === contentId) continue;
    const candidateTags = getTagsForContent(candidate.id);
    const overlap = candidateTags.filter((t) => itemTags.includes(t)).length;
    if (overlap > 0) {
      // Bonus for same type
      const typeBonus = candidate.type === item.type ? 1 : 0;
      scored.push({ item: candidate, score: overlap + typeBonus });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}

/** Group content by a tag dimension */
export function groupByTagDimension(
  dimension: string
): Record<string, ContentItem[]> {
  const dimensionTags = tagDefinitions.filter((t) => t.dimension === dimension);
  const groups: Record<string, ContentItem[]> = {};

  for (const tag of dimensionTags) {
    groups[tag.id] = [];
  }

  for (const item of contentRegistry) {
    const tags = getTagsForContent(item.id);
    for (const tag of tags) {
      const def = tagDefinitions.find((t) => t.id === tag);
      if (def && def.dimension === dimension) {
        if (!groups[tag]) groups[tag] = [];
        groups[tag].push(item);
      }
    }
  }

  return groups;
}

/** Build a "For You" rail: mix of age-appropriate, diverse types */
export function buildForYouRail(
  ageGroup: AgeGroup,
  excludeIds: Set<string> = new Set(),
  limit = 8
): ContentItem[] {
  const ageFiltered = contentRegistry.filter(
    (item) =>
      (!item.ageGroup || item.ageGroup === ageGroup) &&
      !excludeIds.has(item.id)
  );

  // Ensure type diversity: pick max 2 per type
  const byType: Record<string, ContentItem[]> = {};
  for (const item of ageFiltered) {
    if (!byType[item.type]) byType[item.type] = [];
    byType[item.type].push(item);
  }

  const result: ContentItem[] = [];
  const types = Object.keys(byType);

  // Round-robin pick from each type
  let round = 0;
  while (result.length < limit && round < 3) {
    for (const type of types) {
      if (result.length >= limit) break;
      const items = byType[type];
      if (items.length > round) {
        result.push(items[round]);
      }
    }
    round++;
  }

  return result;
}

/** Get content suitable for bedtime mode */
export function getBedtimeContent(): ContentItem[] {
  return getContentByTags(['bedtime-friendly']);
}

/** Get content by energy level */
export function getContentByEnergy(energy: 'calm' | 'medium' | 'high'): ContentItem[] {
  return contentRegistry.filter((item) => item.energyLevel === energy);
}

/** Get counts per content type */
export function getContentCounts(): Record<ContentType, number> {
  const counts = {} as Record<ContentType, number>;
  for (const item of contentRegistry) {
    counts[item.type] = (counts[item.type] ?? 0) + 1;
  }
  return counts;
}

/** Get unique categories across all content */
export function getAllCategories(): string[] {
  const cats = new Set<string>();
  for (const item of contentRegistry) {
    if (item.category) cats.add(item.category);
  }
  return [...cats].sort();
}
