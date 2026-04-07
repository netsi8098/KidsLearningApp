// ── Shared Types ───────────────────────────────────────────

export type ContentType =
  | 'alphabet' | 'number' | 'color' | 'shape' | 'animal' | 'bodypart'
  | 'lesson' | 'story' | 'video' | 'game' | 'audio' | 'cooking'
  | 'movement' | 'homeactivity' | 'explorer' | 'lifeskill' | 'coloring'
  | 'emotion' | 'quiz' | 'collection' | 'playlist';

export type AgeGroup = '2-3' | '3-4' | '4-5' | '5-6' | 'all';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type EnergyLevel = 'calm' | 'moderate' | 'active';

export type ContentStatus = 'draft' | 'review' | 'approved' | 'scheduled' | 'published' | 'archived';
export type ContentBadge = 'new' | 'popular' | 'editors-pick';
export type AccessTier = 'free' | 'premium';
export type Locale = 'en' | 'es' | 'fr' | 'am';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function paginate<T>(data: T[], total: number, params: PaginationParams): PaginatedResult<T> {
  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit),
  };
}

// ── Job Types ──────────────────────────────────────────────

export interface MediaProcessingJob {
  assetId: string;
  operation: 'resize' | 'optimize' | 'convert' | 'thumbnail';
  params: Record<string, unknown>;
}

export interface AIGenerationJob {
  type: 'brief' | 'story' | 'illustration-prompt' | 'voice-script';
  contentId: string;
  params: Record<string, unknown>;
}

export interface ReleaseJob {
  contentId: string;
  action: 'publish' | 'unpublish' | 'archive';
  scheduledAt?: string;
}
