// ── Universal Tags Configuration ────────────────────────
// Tag dimensions and auto-derivation from existing content fields.
// Manual overrides for skill/mood/theme tags.

import type { TagDefinition, ContentItem } from './types';
import { contentRegistry } from './contentRegistry';

// ── Tag Definitions ─────────────────────────────────────

export const tagDefinitions: TagDefinition[] = [
  // Age
  { id: 'age:2-3', dimension: 'age', label: 'Ages 2-3' },
  { id: 'age:4-5', dimension: 'age', label: 'Ages 4-5' },
  { id: 'age:6-8', dimension: 'age', label: 'Ages 6-8' },

  // Level / Difficulty
  { id: 'level:easy', dimension: 'level', label: 'Easy' },
  { id: 'level:medium', dimension: 'level', label: 'Medium' },
  { id: 'level:hard', dimension: 'level', label: 'Hard' },

  // Duration
  { id: 'duration:quick', dimension: 'duration', label: 'Quick (< 5 min)' },
  { id: 'duration:medium', dimension: 'duration', label: 'Medium (5-15 min)' },
  { id: 'duration:long', dimension: 'duration', label: 'Long (15+ min)' },

  // Energy
  { id: 'energy:calm', dimension: 'energy', label: 'Calm' },
  { id: 'energy:medium', dimension: 'energy', label: 'Medium Energy' },
  { id: 'energy:high', dimension: 'energy', label: 'High Energy' },

  // Skill area
  { id: 'skill:literacy', dimension: 'skill', label: 'Literacy' },
  { id: 'skill:math', dimension: 'skill', label: 'Math' },
  { id: 'skill:science', dimension: 'skill', label: 'Science' },
  { id: 'skill:creativity', dimension: 'skill', label: 'Creativity' },
  { id: 'skill:social-emotional', dimension: 'skill', label: 'Social-Emotional' },
  { id: 'skill:physical', dimension: 'skill', label: 'Physical' },
  { id: 'skill:life-skills', dimension: 'skill', label: 'Life Skills' },

  // Mood
  { id: 'mood:energetic', dimension: 'mood', label: 'Energetic' },
  { id: 'mood:calm', dimension: 'mood', label: 'Calm & Relaxed' },
  { id: 'mood:curious', dimension: 'mood', label: 'Curious' },
  { id: 'mood:creative', dimension: 'mood', label: 'Creative' },
  { id: 'mood:playful', dimension: 'mood', label: 'Playful' },

  // Theme
  { id: 'theme:animals', dimension: 'theme', label: 'Animals' },
  { id: 'theme:nature', dimension: 'theme', label: 'Nature' },
  { id: 'theme:space', dimension: 'theme', label: 'Space' },
  { id: 'theme:food', dimension: 'theme', label: 'Food & Cooking' },
  { id: 'theme:music', dimension: 'theme', label: 'Music' },
  { id: 'theme:art', dimension: 'theme', label: 'Art' },
  { id: 'theme:feelings', dimension: 'theme', label: 'Feelings' },
  { id: 'theme:adventure', dimension: 'theme', label: 'Adventure' },

  // Subject
  { id: 'subject:letters', dimension: 'subject', label: 'Letters' },
  { id: 'subject:numbers', dimension: 'subject', label: 'Numbers' },
  { id: 'subject:colors', dimension: 'subject', label: 'Colors' },
  { id: 'subject:shapes', dimension: 'subject', label: 'Shapes' },
  { id: 'subject:reading', dimension: 'subject', label: 'Reading' },
  { id: 'subject:vocabulary', dimension: 'subject', label: 'Vocabulary' },
  { id: 'subject:body', dimension: 'subject', label: 'Body & Health' },

  // Screen type
  { id: 'screen:interactive', dimension: 'screen-type', label: 'Interactive' },
  { id: 'screen:passive', dimension: 'screen-type', label: 'Watch / Listen' },
  { id: 'screen:hands-on', dimension: 'screen-type', label: 'Hands-On' },

  // Bedtime friendly
  { id: 'bedtime-friendly', dimension: 'bedtime-friendly', label: 'Bedtime Friendly' },
];

// ── Manual Tag Overrides ────────────────────────────────
// For tags that can't be auto-derived from data fields.

const manualTags: Record<string, string[]> = {
  // Bedtime-friendly content
  'story:*': ['bedtime-friendly', 'mood:calm', 'screen:passive'],
  'audio:*': ['bedtime-friendly', 'mood:calm', 'screen:passive'],
  'emotion:*': ['skill:social-emotional', 'theme:feelings', 'mood:calm'],

  // Type-level defaults
  'alphabet:*': ['skill:literacy', 'subject:letters', 'mood:curious', 'screen:interactive'],
  'number:*': ['skill:math', 'subject:numbers', 'mood:curious', 'screen:interactive'],
  'color:*': ['skill:creativity', 'subject:colors', 'mood:creative', 'screen:interactive'],
  'shape:*': ['skill:math', 'subject:shapes', 'mood:curious', 'screen:interactive'],
  'animal:*': ['skill:science', 'theme:animals', 'mood:curious', 'screen:interactive'],
  'bodypart:*': ['skill:science', 'subject:body', 'mood:curious', 'screen:interactive'],
  'lesson:*': ['screen:interactive', 'mood:curious'],
  'video:*': ['screen:passive'],
  'game:*': ['screen:interactive', 'mood:playful'],
  'cooking:*': ['skill:life-skills', 'theme:food', 'screen:hands-on', 'mood:creative'],
  'movement:*': ['skill:physical', 'screen:hands-on'],
  'homeactivity:*': ['skill:life-skills', 'screen:hands-on', 'mood:creative'],
  'explorer:*': ['skill:science', 'mood:curious', 'screen:interactive'],
  'lifeskill:*': ['skill:life-skills', 'mood:curious', 'screen:interactive'],
  'coloring:*': ['skill:creativity', 'theme:art', 'mood:creative', 'screen:interactive'],
  'quiz:*': ['screen:interactive', 'mood:playful'],
};

// Specific content overrides (higher priority than type-level)
const specificTags: Record<string, string[]> = {
  // Videos with specific themes
  'video:nursery-rhymes': ['theme:music', 'mood:playful', 'bedtime-friendly'],
  'video:bedtime': ['bedtime-friendly', 'mood:calm'],
  'video:alphabet': ['skill:literacy', 'subject:letters'],
  'video:numbers': ['skill:math', 'subject:numbers'],
  'video:animals': ['theme:animals', 'skill:science'],

  // Movement by energy
  'movement:yoga': ['mood:calm', 'energy:calm'],
  'movement:dance': ['mood:energetic', 'energy:high', 'theme:music'],
};

// ── Tag Cache (built once) ──────────────────────────────

let tagCache: Map<string, string[]> | null = null;

function buildTagCache(): Map<string, string[]> {
  const cache = new Map<string, string[]>();

  for (const item of contentRegistry) {
    const tags: Set<string> = new Set();

    // 1. Auto-derive from fields
    if (item.ageGroup) tags.add(`age:${item.ageGroup}`);
    if (item.difficulty) tags.add(`level:${item.difficulty}`);
    if (item.energyLevel) tags.add(`energy:${item.energyLevel}`);

    if (item.durationMinutes) {
      if (item.durationMinutes < 5) tags.add('duration:quick');
      else if (item.durationMinutes <= 15) tags.add('duration:medium');
      else tags.add('duration:long');
    }

    // 2. Apply type-level manual tags
    const typeWildcard = `${item.type}:*`;
    const typeTags = manualTags[typeWildcard];
    if (typeTags) {
      for (const t of typeTags) tags.add(t);
    }

    // 3. Apply category-based tags for videos
    if (item.type === 'video' && item.category) {
      const catKey = `video:${item.category}`;
      const catTags = specificTags[catKey];
      if (catTags) {
        for (const t of catTags) tags.add(t);
      }
    }

    // 4. Apply category-based tags for movement
    if (item.type === 'movement' && item.category) {
      const catKey = `movement:${item.category}`;
      const catTags = specificTags[catKey];
      if (catTags) {
        for (const t of catTags) tags.add(t);
      }
    }

    // 5. Apply specific overrides
    const specificOverrides = specificTags[item.id];
    if (specificOverrides) {
      for (const t of specificOverrides) tags.add(t);
    }

    // 6. Derive skill tags from lesson topics
    if (item.type === 'lesson' && item.category) {
      const topicSkillMap: Record<string, string> = {
        abc: 'skill:literacy',
        alphabet: 'skill:literacy',
        phonics: 'skill:literacy',
        reading: 'skill:literacy',
        numbers: 'skill:math',
        counting: 'skill:math',
        math: 'skill:math',
        shapes: 'skill:math',
        colors: 'skill:creativity',
        animals: 'skill:science',
        science: 'skill:science',
        nature: 'skill:science',
        emotions: 'skill:social-emotional',
        social: 'skill:social-emotional',
        body: 'skill:science',
      };
      const skill = topicSkillMap[item.category];
      if (skill) tags.add(skill);
    }

    // 7. Derive subject tags from type
    if (item.type === 'story') {
      tags.add('skill:literacy');
      tags.add('subject:reading');
    }

    cache.set(item.id, [...tags]);
  }

  return cache;
}

/** Get all tags for a content ID */
export function getTagsForContent(contentId: string): string[] {
  if (!tagCache) tagCache = buildTagCache();
  return tagCache.get(contentId) ?? [];
}

/** Get all content IDs that have a specific tag */
export function getContentIdsByTag(tag: string): string[] {
  if (!tagCache) tagCache = buildTagCache();
  const ids: string[] = [];
  for (const [id, tags] of tagCache) {
    if (tags.includes(tag)) ids.push(id);
  }
  return ids;
}

/** Get all unique tags used across the registry */
export function getAllUsedTags(): string[] {
  if (!tagCache) tagCache = buildTagCache();
  const allTags = new Set<string>();
  for (const tags of tagCache.values()) {
    for (const t of tags) allTags.add(t);
  }
  return [...allTags].sort();
}

/** Count how many items have each tag */
export function getTagCounts(): Record<string, number> {
  if (!tagCache) tagCache = buildTagCache();
  const counts: Record<string, number> = {};
  for (const tags of tagCache.values()) {
    for (const t of tags) {
      counts[t] = (counts[t] ?? 0) + 1;
    }
  }
  return counts;
}
