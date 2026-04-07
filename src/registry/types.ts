// ── Content Registry Core Types ──────────────────────────

export type ContentType =
  | 'alphabet'
  | 'number'
  | 'color'
  | 'shape'
  | 'animal'
  | 'bodypart'
  | 'lesson'
  | 'story'
  | 'video'
  | 'game'
  | 'audio'
  | 'cooking'
  | 'movement'
  | 'homeactivity'
  | 'explorer'
  | 'lifeskill'
  | 'coloring'
  | 'emotion'
  | 'quiz';

export type AgeGroup = '2-3' | '4-5' | '6-8';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type EnergyLevel = 'calm' | 'medium' | 'high';

export interface ContentItem {
  /** Global unique ID: `${type}:${sourceId}` */
  id: string;
  /** Original ID from data file */
  sourceId: string;
  type: ContentType;
  title: string;
  emoji: string;
  route: string;
  ageGroup?: AgeGroup;
  category?: string;
  durationMinutes?: number;
  difficulty?: Difficulty;
  energyLevel?: EnergyLevel;
}

// ── Tag System Types ────────────────────────────────────

export type TagDimension =
  | 'age'
  | 'level'
  | 'duration'
  | 'energy'
  | 'skill'
  | 'mood'
  | 'theme'
  | 'subject'
  | 'screen-type'
  | 'bedtime-friendly';

export interface TagDefinition {
  id: string;
  dimension: TagDimension;
  label: string;
}

// ── Homepage Section Types ──────────────────────────────

export type HomepageSectionType =
  | 'continue'
  | 'missions'
  | 'collection-spotlight'
  | 'playlist-pick'
  | 'time-of-day-recs'
  | 'new-content'
  | 'skill-focus'
  | 'seasonal'
  | 'favorites'
  | 'assessment-cta';

export interface HomepageSection {
  type: HomepageSectionType;
  title: string;
  emoji: string;
  items: ContentItem[];
  priority: number;
  actionRoute?: string;
  actionLabel?: string;
}

// ── Collection Types ────────────────────────────────────

export interface Collection {
  id: string;
  title: string;
  emoji: string;
  description: string;
  coverColor: string;
  contentIds: string[];
  ageGroup?: AgeGroup;
  estimatedMinutes: number;
  sequential: boolean;
  learningGoals: string[];
  partner?: string;
}

// ── Playlist Types ──────────────────────────────────────

export interface Playlist {
  id: string;
  title: string;
  emoji: string;
  description: string;
  contentIds: string[];
  curatedBy: string;
  estimatedMinutes: number;
}

// ── Skill Graph Types ───────────────────────────────────

export interface SkillNode {
  id: string;
  label: string;
  emoji: string;
  parentId?: string;
  contentIds: string[];
}

export interface SkillCategory {
  id: string;
  label: string;
  emoji: string;
  skills: SkillNode[];
}

// ── Reward Types ────────────────────────────────────────

export interface RewardRule {
  contentType: ContentType;
  starsPerCompletion: number;
  firstCompletionBonus: number;
  collectionBonus: number;
  streakMultiplier: number;
}

export interface ExtendedBadge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  threshold: number;
}

// ── Access Types ────────────────────────────────────────

export type AccessTier = 'free' | 'premium';

// ── Time-of-Day Types ───────────────────────────────────

export type TimeMode = 'morning' | 'learning' | 'break' | 'quiet' | 'bedtime';

export interface TimeModeConfig {
  id: TimeMode;
  label: string;
  emoji: string;
  hoursStart: number;
  hoursEnd: number;
  preferredTags: string[];
  excludedTags: string[];
  bgClass: string;
}

// ── Release / Content Badge Types ───────────────────────

export type ContentBadge = 'new' | 'popular' | 'editors-pick';

export interface ReleaseMeta {
  contentId: string;
  addedDate: string;
  badges: ContentBadge[];
}

// ── Nudge Types ─────────────────────────────────────────

export interface NudgeRule {
  id: string;
  emoji: string;
  condition: string;
  message: string;
  actionRoute: string;
  actionLabel: string;
  priority: number;
}

// ── Offline Pack Types ──────────────────────────────────

export interface OfflinePack {
  id: string;
  title: string;
  emoji: string;
  contentIds: string[];
  sizeEstimateMB: number;
  ageGroup?: AgeGroup;
}
