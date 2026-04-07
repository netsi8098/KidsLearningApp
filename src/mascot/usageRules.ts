// =============================================================================
// Context-Aware Usage Rules - Governs when/how mascots express and pose
// =============================================================================

import type { ExpressionId } from './expressions.ts';
import type { PoseId } from './poses.ts';
import { getCharacterById } from '../data/charactersData.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The context in which the mascot is being shown */
export type MascotContextType =
  | 'lesson-intro'
  | 'lesson-progress'
  | 'lesson-complete'
  | 'lesson-mistake'
  | 'game-win'
  | 'game-loss'
  | 'game-timeout'
  | 'game-bonus'
  | 'story-opening'
  | 'story-climax'
  | 'story-ending'
  | 'story-sad-moment'
  | 'reward'
  | 'empty-state'
  | 'bedtime'
  | 'greeting'
  | 'idle';

export interface MascotContext {
  type: MascotContextType;
  characterId?: string;
  /** Bedtime mode active */
  isBedtime?: boolean;
  /** Recent expressions shown (for variety enforcement) */
  recentExpressions?: ExpressionId[];
}

export interface MascotReaction {
  expression: ExpressionId;
  pose: PoseId;
  line?: string;
}

// ---------------------------------------------------------------------------
// Expression pools by context
// ---------------------------------------------------------------------------

export const lessonExpressions: Record<string, ExpressionId[]> = {
  intro: ['happy', 'curious', 'encouraging'],
  progress: ['encouraging', 'proud', 'happy'],
  complete: ['celebrating', 'proud', 'happy'],
  mistake: ['empathetic', 'encouraging', 'calm'],
};

export const bedtimeExpressions: ExpressionId[] = ['sleepy', 'calm', 'empathetic'];

export const gameExpressions: Record<string, ExpressionId[]> = {
  win: ['celebrating', 'proud', 'happy'],
  loss: ['empathetic', 'encouraging', 'calm'],
  timeout: ['surprised', 'encouraging', 'empathetic'],
  bonus: ['surprised', 'celebrating', 'happy'],
};

export const storyExpressions: Record<string, ExpressionId[]> = {
  opening: ['curious', 'happy', 'encouraging'],
  climax: ['surprised', 'curious', 'happy'],
  ending: ['happy', 'proud', 'calm'],
  'sad-moment': ['empathetic', 'calm', 'encouraging'],
};

export const rewardExpressions: ExpressionId[] = ['celebrating', 'proud', 'happy'];

export const emptyStateExpressions: ExpressionId[] = ['encouraging', 'curious', 'happy'];

// ---------------------------------------------------------------------------
// Pose mappings by context
// ---------------------------------------------------------------------------

const contextPoses: Record<string, PoseId[]> = {
  'lesson-intro': ['waving', 'explaining'],
  'lesson-progress': ['cheering', 'clapping', 'pointing'],
  'lesson-complete': ['cheering', 'reward', 'dancing'],
  'lesson-mistake': ['explaining', 'listening'],
  'game-win': ['cheering', 'dancing', 'reward'],
  'game-loss': ['explaining', 'listening'],
  'game-timeout': ['pointing', 'waving'],
  'game-bonus': ['cheering', 'dancing', 'reward'],
  'story-opening': ['pointing', 'reading'],
  'story-climax': ['cheering', 'pointing'],
  'story-ending': ['reading', 'clapping', 'waving'],
  'story-sad-moment': ['listening', 'reading'],
  reward: ['reward', 'cheering', 'dancing'],
  'empty-state': ['waving', 'pointing', 'explaining'],
  bedtime: ['reading', 'listening', 'tiptoeing'],
  greeting: ['waving', 'cheering'],
  idle: ['waving', 'listening', 'reading'],
};

// ---------------------------------------------------------------------------
// Overuse protection
// ---------------------------------------------------------------------------

export interface OveruseConfig {
  /** Maximum mascot reaction appearances per session */
  maxAppearancesPerSession: number;
  /** Minimum ms between consecutive reactions */
  cooldownMs: number;
  /** Number of recent expressions to track for variety enforcement */
  varietyWindow: number;
}

export const overuseProtection: OveruseConfig = {
  maxAppearancesPerSession: 50,
  cooldownMs: 2000,
  varietyWindow: 3,
};

// ---------------------------------------------------------------------------
// Session tracking (module-level singleton)
// ---------------------------------------------------------------------------

let sessionAppearances = 0;
let lastReactionTimestamp = 0;

/** Reset session counters (call on new session/profile switch) */
export function resetSessionTracking(): void {
  sessionAppearances = 0;
  lastReactionTimestamp = 0;
}

/** Check if a reaction is allowed right now */
export function canShowReaction(): boolean {
  const now = Date.now();
  if (sessionAppearances >= overuseProtection.maxAppearancesPerSession) {
    return false;
  }
  if (now - lastReactionTimestamp < overuseProtection.cooldownMs) {
    return false;
  }
  return true;
}

/** Record that a reaction was shown */
function recordReaction(): void {
  sessionAppearances++;
  lastReactionTimestamp = Date.now();
}

// ---------------------------------------------------------------------------
// Variety-aware selection
// ---------------------------------------------------------------------------

/**
 * Pick from a pool while avoiding recently used expressions.
 * Falls back to first item if all have been used recently.
 */
function pickWithVariety(
  pool: ExpressionId[],
  recent: ExpressionId[],
): ExpressionId {
  // Filter out recently used
  const fresh = pool.filter((e) => !recent.slice(-overuseProtection.varietyWindow).includes(e));
  if (fresh.length > 0) {
    return fresh[Math.floor(Math.random() * fresh.length)];
  }
  // Fallback: pick random from full pool
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickPose(contextType: MascotContextType): PoseId {
  const pool = contextPoses[contextType] ?? contextPoses.idle;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ---------------------------------------------------------------------------
// Expression pool resolver
// ---------------------------------------------------------------------------

function getExpressionPool(contextType: MascotContextType, isBedtime: boolean): ExpressionId[] {
  // Bedtime always overrides to gentle expressions
  if (isBedtime) {
    return bedtimeExpressions;
  }

  switch (contextType) {
    case 'lesson-intro':
      return lessonExpressions.intro;
    case 'lesson-progress':
      return lessonExpressions.progress;
    case 'lesson-complete':
      return lessonExpressions.complete;
    case 'lesson-mistake':
      return lessonExpressions.mistake;
    case 'game-win':
      return gameExpressions.win;
    case 'game-loss':
      return gameExpressions.loss;
    case 'game-timeout':
      return gameExpressions.timeout;
    case 'game-bonus':
      return gameExpressions.bonus;
    case 'story-opening':
      return storyExpressions.opening;
    case 'story-climax':
      return storyExpressions.climax;
    case 'story-ending':
      return storyExpressions.ending;
    case 'story-sad-moment':
      return storyExpressions['sad-moment'];
    case 'reward':
      return rewardExpressions;
    case 'empty-state':
      return emptyStateExpressions;
    case 'bedtime':
      return bedtimeExpressions;
    case 'greeting':
      return ['happy', 'encouraging', 'curious'];
    case 'idle':
    default:
      return ['happy', 'calm', 'curious'];
  }
}

// ---------------------------------------------------------------------------
// Line selection helper
// ---------------------------------------------------------------------------

function pickLine(
  characterId: string,
  contextType: MascotContextType,
): string | undefined {
  const character = getCharacterById(characterId);

  switch (contextType) {
    case 'lesson-intro':
    case 'greeting':
    case 'idle':
      return pickRandom(character.greetings);
    case 'lesson-complete':
    case 'game-win':
    case 'game-bonus':
    case 'reward':
      return pickRandom(character.celebrations);
    case 'lesson-mistake':
    case 'game-loss':
    case 'game-timeout':
    case 'empty-state':
      return pickRandom(character.encouragements);
    case 'lesson-progress':
      return pickRandom(character.encouragements);
    case 'story-opening':
    case 'story-climax':
    case 'story-ending':
    case 'story-sad-moment':
      return pickRandom(character.greetings);
    case 'bedtime':
      return pickRandom([
        'Time to rest, little one...',
        'Sweet dreams ahead...',
        'Let\'s get cozy...',
      ]);
    default:
      return undefined;
  }
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------------------------------------------------------
// Main API
// ---------------------------------------------------------------------------

/**
 * Get the appropriate mascot reaction for a given context.
 * Enforces overuse protection and variety rules.
 * Returns null if overuse limits have been hit.
 */
export function getMascotReaction(context: MascotContext): MascotReaction | null {
  if (!canShowReaction()) {
    return null;
  }

  const isBedtime = context.isBedtime ?? false;
  const charId = context.characterId ?? 'leo';
  const recent = context.recentExpressions ?? [];

  const expressionPool = getExpressionPool(context.type, isBedtime);
  const expression = pickWithVariety(expressionPool, recent);

  // In bedtime, override pose to gentle ones
  const pose = isBedtime
    ? pickRandom(contextPoses.bedtime)
    : pickPose(context.type);

  const line = pickLine(charId, context.type);

  recordReaction();

  return { expression, pose, line };
}

/**
 * Get a mascot reaction without overuse checks (for forced/system displays).
 * Still respects variety rules.
 */
export function getMascotReactionForced(context: MascotContext): MascotReaction {
  const isBedtime = context.isBedtime ?? false;
  const charId = context.characterId ?? 'leo';
  const recent = context.recentExpressions ?? [];

  const expressionPool = getExpressionPool(context.type, isBedtime);
  const expression = pickWithVariety(expressionPool, recent);

  const pose = isBedtime
    ? pickRandom(contextPoses.bedtime)
    : pickPose(context.type);

  const line = pickLine(charId, context.type);

  return { expression, pose, line };
}
