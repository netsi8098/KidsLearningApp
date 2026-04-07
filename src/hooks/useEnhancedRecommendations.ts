// ── Enhanced Recommendations Hook ───────────────────────
// Scoring: tagAffinity x3 + ageMatch x5 + novelty x2 + skillGap x4 + timeModeMatch x3

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { contentRegistry, getContentItem } from '../registry/contentRegistry';
import { getTagsForContent } from '../registry/tagsConfig';
import { getTimeModeConfig, getAutoTimeMode } from '../registry/timeOfDayConfig';
import { getAllSkills } from '../registry/skillsConfig';
import type { ContentItem, AgeGroup, TimeMode } from '../registry/types';

export interface EnhancedRecommendation {
  item: ContentItem;
  score: number;
}

export function useEnhancedRecommendations(
  playerId: number | undefined,
  timeMode?: TimeMode
) {
  const profile = useLiveQuery(
    () => (playerId ? db.profiles.get(playerId) : undefined),
    [playerId]
  );

  const history = useLiveQuery(
    () =>
      playerId
        ? db.contentHistory
            .where('playerId')
            .equals(playerId)
            .toArray()
        : [],
    [playerId],
    []
  );

  const playerAgeGroup: AgeGroup = (profile?.ageGroup as AgeGroup) ?? '2-3';
  const activeTimeMode = timeMode ?? getAutoTimeMode();
  const modeConfig = getTimeModeConfig(activeTimeMode);

  // Build tag affinity from history
  const tagCounts: Record<string, number> = {};
  for (const h of history) {
    const tags = getTagsForContent(h.contentId);
    for (const tag of tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const maxTagCount = Math.max(1, ...Object.values(tagCounts));

  // Completed content set
  const completedSet = new Set(
    history.filter((h) => h.completed).map((h) => h.contentId)
  );

  // Skill gap: find skills with least coverage
  const allSkills = getAllSkills();
  const skillCoverage: Record<string, number> = {};
  for (const skill of allSkills) {
    const covered = skill.contentIds.filter((id) => completedSet.has(id)).length;
    skillCoverage[skill.id] = skill.contentIds.length > 0
      ? covered / skill.contentIds.length
      : 1;
  }

  // Score each content item
  const scored: EnhancedRecommendation[] = [];

  for (const item of contentRegistry) {
    const tags = getTagsForContent(item.id);

    // 1. Tag affinity (0-1)
    let tagAffinity = 0;
    if (tags.length > 0) {
      const affinitySum = tags.reduce(
        (sum, t) => sum + (tagCounts[t] ?? 0) / maxTagCount,
        0
      );
      tagAffinity = affinitySum / tags.length;
    }

    // 2. Age match (0 or 1)
    const ageMatch = !item.ageGroup || item.ageGroup === playerAgeGroup ? 1 : 0;

    // 3. Novelty (0 or 1)
    const novelty = completedSet.has(item.id) ? 0 : 1;

    // 4. Skill gap (0-1, higher = more needed)
    let skillGap = 0;
    for (const skill of allSkills) {
      if (skill.contentIds.includes(item.id)) {
        const gap = 1 - (skillCoverage[skill.id] ?? 0);
        skillGap = Math.max(skillGap, gap);
      }
    }

    // 5. Time mode match (0-1)
    let timeModeMatch = 0;
    const preferred = new Set(modeConfig.preferredTags);
    const excluded = new Set(modeConfig.excludedTags);
    const matchingPreferred = tags.filter((t) => preferred.has(t)).length;
    const hasExcluded = tags.some((t) => excluded.has(t));
    if (hasExcluded) {
      timeModeMatch = -0.5;
    } else if (preferred.size > 0) {
      timeModeMatch = matchingPreferred / preferred.size;
    }

    const score =
      tagAffinity * 3 +
      ageMatch * 5 +
      novelty * 2 +
      skillGap * 4 +
      timeModeMatch * 3;

    scored.push({ item, score });
  }

  scored.sort((a, b) => b.score - a.score);
  const recommendations = scored.slice(0, 12);

  return { recommendations };
}
