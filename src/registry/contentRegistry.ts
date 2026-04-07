// ── Content Registry ────────────────────────────────────
// Wraps all 29 data files into a unified ContentItem[]
// NO existing data files are modified.

import type { ContentItem, ContentType, AgeGroup } from './types';

// ── Import all data sources ─────────────────────────────
import { alphabetData } from '../data/alphabetData';
import { numbersData } from '../data/numbersData';
import { colorsData } from '../data/colorsData';
import { shapesData } from '../data/shapesData';
import { animalsData } from '../data/animalsData';
import { bodyPartsData } from '../data/bodyPartsData';
import { lessonsData } from '../data/lessonsData';
import { storiesData } from '../data/storiesData';
import { curatedVideos } from '../data/videoConfig';
import { gamesConfig } from '../data/gamesConfig';
import { audioEpisodes } from '../data/audioData';
import { cookingRecipes } from '../data/cookingData';
import { movementActivities } from '../data/movementData';
import { homeActivities } from '../data/homeActivitiesData';
import { explorerTopics } from '../data/worldExplorerData';
import { lifeSkillsData } from '../data/lifeSkillsData';
import { emotionsData } from '../data/emotionsData';
import { coloringTemplates } from '../data/coloringData';

// ── Normalize each data source into ContentItem[] ───────

function normalizeAlphabet(): ContentItem[] {
  return alphabetData.map((a) => ({
    id: `alphabet:${a.letter}`,
    sourceId: a.letter,
    type: 'alphabet' as ContentType,
    title: `Letter ${a.upper} — ${a.word}`,
    emoji: a.emoji,
    route: '/abc',
    category: 'alphabet',
  }));
}

function normalizeNumbers(): ContentItem[] {
  return numbersData.map((n) => ({
    id: `number:${n.number}`,
    sourceId: String(n.number),
    type: 'number' as ContentType,
    title: `Number ${n.number} — ${n.word}`,
    emoji: n.emoji,
    route: '/numbers',
    category: 'numbers',
  }));
}

function normalizeColors(): ContentItem[] {
  return colorsData.map((c) => ({
    id: `color:${c.name.toLowerCase()}`,
    sourceId: c.name.toLowerCase(),
    type: 'color' as ContentType,
    title: c.name,
    emoji: c.emojis[0] ?? '🎨',
    route: '/colors',
    category: 'colors',
  }));
}

function normalizeShapes(): ContentItem[] {
  return shapesData.map((s) => ({
    id: `shape:${s.name.toLowerCase()}`,
    sourceId: s.name.toLowerCase(),
    type: 'shape' as ContentType,
    title: s.name,
    emoji: s.emoji,
    route: '/shapes',
    category: 'shapes',
  }));
}

function normalizeAnimals(): ContentItem[] {
  return animalsData.map((a) => ({
    id: `animal:${a.name.toLowerCase()}`,
    sourceId: a.name.toLowerCase(),
    type: 'animal' as ContentType,
    title: a.name,
    emoji: a.emoji,
    route: '/animals',
    category: 'animals',
  }));
}

function normalizeBodyParts(): ContentItem[] {
  return bodyPartsData.map((b) => ({
    id: `bodypart:${b.id}`,
    sourceId: b.id,
    type: 'bodypart' as ContentType,
    title: b.name,
    emoji: b.emoji,
    route: '/bodyparts',
    category: 'bodyparts',
  }));
}

function normalizeLessons(): ContentItem[] {
  return lessonsData.map((l) => ({
    id: `lesson:${l.id}`,
    sourceId: l.id,
    type: 'lesson' as ContentType,
    title: l.title,
    emoji: l.emoji,
    route: '/lessons',
    ageGroup: l.ageGroup as AgeGroup,
    category: l.topic,
    durationMinutes: l.durationMinutes,
  }));
}

function normalizeStories(): ContentItem[] {
  return storiesData.map((s) => ({
    id: `story:${s.id}`,
    sourceId: s.id,
    type: 'story' as ContentType,
    title: s.title,
    emoji: s.emoji,
    route: '/stories',
    ageGroup: s.ageGroup as AgeGroup,
    category: s.category,
  }));
}

function normalizeVideos(): ContentItem[] {
  return curatedVideos.map((v) => ({
    id: `video:${v.id}`,
    sourceId: v.id,
    type: 'video' as ContentType,
    title: v.title,
    emoji: getCategoryEmoji(v.category),
    route: '/videos',
    category: v.category,
    durationMinutes: v.durationMinutes,
  }));
}

function normalizeGames(): ContentItem[] {
  return gamesConfig.map((g) => ({
    id: `game:${g.id}`,
    sourceId: g.id,
    type: 'game' as ContentType,
    title: g.title,
    emoji: g.emoji,
    route: '/games',
    ageGroup: (g as any).ageGroup as AgeGroup | undefined,
    category: (g as any).category,
    durationMinutes: (g as any).durationMinutes,
    difficulty: g.difficulty?.[0] as any,
  }));
}

function normalizeAudio(): ContentItem[] {
  return audioEpisodes.map((a) => ({
    id: `audio:${a.id}`,
    sourceId: a.id,
    type: 'audio' as ContentType,
    title: a.title,
    emoji: a.emoji,
    route: '/audio',
    ageGroup: (a as any).ageGroup as AgeGroup | undefined,
    category: a.category,
    durationMinutes: Math.ceil((a as any).duration / 60) || undefined,
  }));
}

function normalizeCooking(): ContentItem[] {
  return cookingRecipes.map((c) => ({
    id: `cooking:${c.id}`,
    sourceId: c.id,
    type: 'cooking' as ContentType,
    title: c.title,
    emoji: c.emoji,
    route: '/cooking',
    ageGroup: c.ageGroup as AgeGroup,
    category: c.category,
    durationMinutes: c.durationMinutes,
    difficulty: c.difficulty as any,
  }));
}

function normalizeMovement(): ContentItem[] {
  return movementActivities.map((m) => ({
    id: `movement:${m.id}`,
    sourceId: m.id,
    type: 'movement' as ContentType,
    title: m.title,
    emoji: m.emoji,
    route: '/movement',
    ageGroup: m.ageGroup as AgeGroup,
    category: m.category,
    durationMinutes: m.durationMinutes,
    energyLevel: m.energyLevel as any,
  }));
}

function normalizeHomeActivities(): ContentItem[] {
  return homeActivities.map((h) => ({
    id: `homeactivity:${h.id}`,
    sourceId: h.id,
    type: 'homeactivity' as ContentType,
    title: h.title,
    emoji: h.emoji,
    route: '/home-activities',
    ageGroup: h.ageGroup as AgeGroup,
    category: h.category,
    durationMinutes: (h as any).timeNeeded,
  }));
}

function normalizeExplorer(): ContentItem[] {
  return explorerTopics.map((e) => ({
    id: `explorer:${e.id}`,
    sourceId: e.id,
    type: 'explorer' as ContentType,
    title: e.title,
    emoji: e.emoji,
    route: '/explorer',
    ageGroup: (e as any).ageGroup as AgeGroup | undefined,
    category: e.category,
  }));
}

function normalizeLifeSkills(): ContentItem[] {
  return lifeSkillsData.map((l) => ({
    id: `lifeskill:${l.id}`,
    sourceId: l.id,
    type: 'lifeskill' as ContentType,
    title: l.title,
    emoji: l.emoji,
    route: '/home-activities',
    ageGroup: l.ageGroup as AgeGroup,
    category: l.topic,
  }));
}

function normalizeEmotions(): ContentItem[] {
  return emotionsData.map((e) => ({
    id: `emotion:${e.id}`,
    sourceId: e.id,
    type: 'emotion' as ContentType,
    title: e.name,
    emoji: e.emoji,
    route: '/emotions',
    category: 'emotions',
  }));
}

function normalizeColoring(): ContentItem[] {
  return coloringTemplates.map((c) => ({
    id: `coloring:${c.id}`,
    sourceId: c.id,
    type: 'coloring' as ContentType,
    title: c.title,
    emoji: c.emoji,
    route: '/coloring',
    category: c.category,
    difficulty: c.difficulty as any,
  }));
}

// ── Helpers ─────────────────────────────────────────────

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    learning: '📖',
    'nursery-rhymes': '🎵',
    alphabet: '🔤',
    numbers: '🔢',
    'colors-shapes': '🎨',
    animals: '🐾',
    bedtime: '🌙',
  };
  return map[category] ?? '🎬';
}

// ── Build Registry ──────────────────────────────────────

function buildRegistry(): ContentItem[] {
  return [
    ...normalizeAlphabet(),
    ...normalizeNumbers(),
    ...normalizeColors(),
    ...normalizeShapes(),
    ...normalizeAnimals(),
    ...normalizeBodyParts(),
    ...normalizeLessons(),
    ...normalizeStories(),
    ...normalizeVideos(),
    ...normalizeGames(),
    ...normalizeAudio(),
    ...normalizeCooking(),
    ...normalizeMovement(),
    ...normalizeHomeActivities(),
    ...normalizeExplorer(),
    ...normalizeLifeSkills(),
    ...normalizeEmotions(),
    ...normalizeColoring(),
  ];
}

/** Flat array of all content items */
export const contentRegistry: ContentItem[] = buildRegistry();

/** Map from global ID → ContentItem for O(1) lookup */
export const contentById: Map<string, ContentItem> = new Map(
  contentRegistry.map((item) => [item.id, item])
);

// ── Query Functions ─────────────────────────────────────

export function getContentByType(type: ContentType): ContentItem[] {
  return contentRegistry.filter((item) => item.type === type);
}

export function getContentByAgeGroup(ageGroup: AgeGroup): ContentItem[] {
  return contentRegistry.filter(
    (item) => !item.ageGroup || item.ageGroup === ageGroup
  );
}

export function getContentByCategory(category: string): ContentItem[] {
  return contentRegistry.filter((item) => item.category === category);
}

export function searchContent(query: string): ContentItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return contentRegistry.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.type.includes(q) ||
      (item.category?.toLowerCase().includes(q) ?? false)
  );
}

export function getContentItem(id: string): ContentItem | undefined {
  return contentById.get(id);
}

/** Resolve an array of content IDs to ContentItems (skipping missing) */
export function resolveContentIds(ids: string[]): ContentItem[] {
  const items: ContentItem[] = [];
  for (const id of ids) {
    const item = contentById.get(id);
    if (item) items.push(item);
  }
  return items;
}
