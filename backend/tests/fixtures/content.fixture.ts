// ── Content Fixtures ───────────────────────────────────────
// Deterministic, fully-typed Content objects matching the Prisma
// schema. All dates and IDs are fixed for snapshot-stable tests.

// ── Fixed reference dates ──────────────────────────────────

const FIXED_CREATED = new Date('2026-01-15T10:00:00.000Z');
const FIXED_UPDATED = new Date('2026-01-20T14:30:00.000Z');
const FIXED_PUBLISHED = new Date('2026-02-01T09:00:00.000Z');
const FIXED_SCHEDULED = new Date('2026-03-01T08:00:00.000Z');
const FIXED_ARCHIVED = new Date('2026-02-15T12:00:00.000Z');

// ── Content fixture type (matches Prisma Content model) ────

export interface ContentFixture {
  id: string;
  slug: string;
  type: string;
  title: string;
  emoji: string;
  description: string;
  body: Record<string, unknown>;
  status: string;
  accessTier: string;
  ageGroup: string;
  difficulty: string | null;
  energyLevel: string | null;
  durationMinutes: number | null;
  route: string | null;
  authorId: string | null;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  deletedAt: Date | null;
  updatedBy: string | null;
  featured: boolean;
  archivedAt: Date | null;
  mood: string | null;
  bedtimeFriendly: boolean;
  language: string;
  publishedSnapshot: Record<string, unknown> | null;
  freshnessScore: number | null;
  evergreenScore: number | null;
  seasonalRelevance: Record<string, unknown> | null;
  needsRefresh: boolean;
  lastRefreshDate: Date | null;
  nextReviewDate: Date | null;
}

// ── Factory ────────────────────────────────────────────────

let contentCounter = 0;

/**
 * Creates a single realistic Content fixture.
 * Every call increments the internal counter for unique IDs
 * unless overridden.
 */
export function createContentFixture(
  overrides: Partial<ContentFixture> = {}
): ContentFixture {
  contentCounter++;
  const idx = String(contentCounter).padStart(3, '0');

  return {
    id: `content-${idx}`,
    slug: `test-content-${idx}`,
    type: 'lesson',
    title: `Test Content ${idx}`,
    emoji: '',
    description: `Description for test content ${idx}`,
    body: { blocks: [] },
    status: 'draft',
    accessTier: 'free',
    ageGroup: 'all',
    difficulty: 'easy',
    energyLevel: 'calm',
    durationMinutes: 5,
    route: `/content/${idx}`,
    authorId: 'user-editor-001',
    publishedAt: null,
    scheduledAt: null,
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    version: 1,
    deletedAt: null,
    updatedBy: null,
    featured: false,
    archivedAt: null,
    mood: null,
    bedtimeFriendly: false,
    language: 'en',
    publishedSnapshot: null,
    freshnessScore: null,
    evergreenScore: null,
    seasonalRelevance: null,
    needsRefresh: false,
    lastRefreshDate: null,
    nextReviewDate: null,
    ...overrides,
  };
}

/**
 * Creates an array of Content fixtures.
 */
export function createManyContentFixtures(
  count: number,
  overrides: Partial<ContentFixture> = {}
): ContentFixture[] {
  return Array.from({ length: count }, () =>
    createContentFixture(overrides)
  );
}

/**
 * Resets the internal counter. Call in beforeEach for
 * deterministic IDs across tests.
 */
export function resetContentCounter(): void {
  contentCounter = 0;
}

// ── Predefined set of 12 content items covering all core types + edge cases ──

export const CONTENT_FIXTURES: ContentFixture[] = [
  // 1. Alphabet
  {
    id: 'content-alpha-001',
    slug: 'letter-a-adventure',
    type: 'alphabet',
    title: 'Letter A Adventure',
    emoji: 'A',
    description: 'Learn the letter A with fun animations.',
    body: { letter: 'A', words: ['apple', 'ant', 'airplane'] },
    status: 'published',
    accessTier: 'free',
    ageGroup: 'age_2_3',
    difficulty: 'easy',
    energyLevel: 'calm',
    durationMinutes: 3,
    route: '/alphabet/a',
    authorId: 'user-editor-001',
    publishedAt: FIXED_PUBLISHED,
    scheduledAt: null,
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    version: 2,
    deletedAt: null,
    updatedBy: 'user-editor-001',
    featured: true,
    archivedAt: null,
    mood: 'playful',
    bedtimeFriendly: false,
    language: 'en',
    publishedSnapshot: { letter: 'A', words: ['apple', 'ant', 'airplane'] },
    freshnessScore: 0.95,
    evergreenScore: 0.9,
    seasonalRelevance: null,
    needsRefresh: false,
    lastRefreshDate: FIXED_PUBLISHED,
    nextReviewDate: new Date('2026-08-01T00:00:00.000Z'),
  },

  // 2. Number
  {
    id: 'content-num-001',
    slug: 'counting-to-five',
    type: 'number',
    title: 'Counting to Five',
    emoji: '5',
    description: 'Count objects from 1 to 5.',
    body: { range: [1, 5] },
    status: 'published',
    accessTier: 'free',
    ageGroup: 'age_2_3',
    difficulty: 'easy',
    energyLevel: 'calm',
    durationMinutes: 4,
    route: '/numbers/1-5',
    authorId: 'user-editor-001',
    publishedAt: FIXED_PUBLISHED,
    scheduledAt: null,
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    version: 1,
    deletedAt: null,
    updatedBy: null,
    featured: false,
    archivedAt: null,
    mood: null,
    bedtimeFriendly: false,
    language: 'en',
    publishedSnapshot: null,
    freshnessScore: 0.88,
    evergreenScore: 0.95,
    seasonalRelevance: null,
    needsRefresh: false,
    lastRefreshDate: null,
    nextReviewDate: null,
  },

  // 3. Color
  {
    id: 'content-color-001',
    slug: 'rainbow-colors',
    type: 'color',
    title: 'Rainbow Colors',
    emoji: '',
    description: 'Explore the colors of the rainbow.',
    body: { colors: ['red', 'orange', 'yellow', 'green', 'blue', 'purple'] },
    status: 'published',
    accessTier: 'free',
    ageGroup: 'age_3_4',
    difficulty: 'easy',
    energyLevel: 'moderate',
    durationMinutes: 5,
    route: '/colors/rainbow',
    authorId: 'user-editor-001',
    publishedAt: FIXED_PUBLISHED,
    scheduledAt: null,
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    version: 1,
    deletedAt: null,
    updatedBy: null,
    featured: false,
    archivedAt: null,
    mood: 'curious',
    bedtimeFriendly: false,
    language: 'en',
    publishedSnapshot: null,
    freshnessScore: null,
    evergreenScore: null,
    seasonalRelevance: null,
    needsRefresh: false,
    lastRefreshDate: null,
    nextReviewDate: null,
  },

  // 4. Shape
  {
    id: 'content-shape-001',
    slug: 'basic-shapes',
    type: 'shape',
    title: 'Basic Shapes',
    emoji: '',
    description: 'Circle, square, and triangle.',
    body: { shapes: ['circle', 'square', 'triangle'] },
    status: 'review',
    accessTier: 'free',
    ageGroup: 'age_2_3',
    difficulty: 'easy',
    energyLevel: 'calm',
    durationMinutes: 4,
    route: '/shapes/basic',
    authorId: 'user-editor-001',
    publishedAt: null,
    scheduledAt: null,
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    version: 1,
    deletedAt: null,
    updatedBy: null,
    featured: false,
    archivedAt: null,
    mood: null,
    bedtimeFriendly: false,
    language: 'en',
    publishedSnapshot: null,
    freshnessScore: null,
    evergreenScore: null,
    seasonalRelevance: null,
    needsRefresh: false,
    lastRefreshDate: null,
    nextReviewDate: null,
  },

  // 5. Animal
  {
    id: 'content-animal-001',
    slug: 'farm-animals',
    type: 'animal',
    title: 'Farm Animals',
    emoji: '',
    description: 'Meet the animals on the farm.',
    body: { animals: ['cow', 'pig', 'chicken', 'horse', 'sheep'] },
    status: 'published',
    accessTier: 'free',
    ageGroup: 'all',
    difficulty: 'easy',
    energyLevel: 'moderate',
    durationMinutes: 6,
    route: '/animals/farm',
    authorId: 'user-editor-001',
    publishedAt: FIXED_PUBLISHED,
    scheduledAt: null,
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    version: 3,
    deletedAt: null,
    updatedBy: 'user-admin-001',
    featured: true,
    archivedAt: null,
    mood: 'playful',
    bedtimeFriendly: false,
    language: 'en',
    publishedSnapshot: null,
    freshnessScore: 0.92,
    evergreenScore: 0.85,
    seasonalRelevance: null,
    needsRefresh: false,
    lastRefreshDate: null,
    nextReviewDate: null,
  },

  // 6. Body Part
  {
    id: 'content-body-001',
    slug: 'my-body-parts',
    type: 'bodypart',
    title: 'My Body Parts',
    emoji: '',
    description: 'Learn about eyes, ears, nose, and mouth.',
    body: { parts: ['eyes', 'ears', 'nose', 'mouth', 'hands'] },
    status: 'approved',
    accessTier: 'free',
    ageGroup: 'age_2_3',
    difficulty: 'easy',
    energyLevel: 'active',
    durationMinutes: 5,
    route: '/bodyparts/basics',
    authorId: 'user-editor-001',
    publishedAt: null,
    scheduledAt: FIXED_SCHEDULED,
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    version: 1,
    deletedAt: null,
    updatedBy: null,
    featured: false,
    archivedAt: null,
    mood: null,
    bedtimeFriendly: false,
    language: 'en',
    publishedSnapshot: null,
    freshnessScore: null,
    evergreenScore: null,
    seasonalRelevance: null,
    needsRefresh: false,
    lastRefreshDate: null,
    nextReviewDate: null,
  },

  // 7. Lesson
  {
    id: 'content-lesson-001',
    slug: 'phonics-introduction',
    type: 'lesson',
    title: 'Phonics Introduction',
    emoji: '',
    description: 'An introduction to phonics for young learners.',
    body: { sections: [{ type: 'text', content: 'Phonics are fun!' }] },
    status: 'published',
    accessTier: 'premium',
    ageGroup: 'age_4_5',
    difficulty: 'medium',
    energyLevel: 'calm',
    durationMinutes: 10,
    route: '/lessons/phonics-intro',
    authorId: 'user-editor-001',
    publishedAt: FIXED_PUBLISHED,
    scheduledAt: null,
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    version: 2,
    deletedAt: null,
    updatedBy: 'user-editor-001',
    featured: false,
    archivedAt: null,
    mood: 'focused',
    bedtimeFriendly: false,
    language: 'en',
    publishedSnapshot: null,
    freshnessScore: 0.80,
    evergreenScore: 0.70,
    seasonalRelevance: null,
    needsRefresh: true,
    lastRefreshDate: null,
    nextReviewDate: new Date('2026-04-15T00:00:00.000Z'),
  },

  // 8. Story (bedtime-friendly)
  {
    id: 'content-story-001',
    slug: 'goodnight-moon-bear',
    type: 'story',
    title: 'Goodnight Moon Bear',
    emoji: '',
    description: 'A soothing bedtime story about a bear.',
    body: { pages: [{ text: 'Once upon a time...', illustration: null }] },
    status: 'published',
    accessTier: 'free',
    ageGroup: 'age_2_3',
    difficulty: 'easy',
    energyLevel: 'calm',
    durationMinutes: 8,
    route: '/stories/goodnight-moon-bear',
    authorId: 'user-editor-001',
    publishedAt: FIXED_PUBLISHED,
    scheduledAt: null,
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    version: 1,
    deletedAt: null,
    updatedBy: null,
    featured: false,
    archivedAt: null,
    mood: 'sleepy',
    bedtimeFriendly: true,
    language: 'en',
    publishedSnapshot: null,
    freshnessScore: 0.99,
    evergreenScore: 0.98,
    seasonalRelevance: null,
    needsRefresh: false,
    lastRefreshDate: null,
    nextReviewDate: null,
  },

  // 9. Video
  {
    id: 'content-video-001',
    slug: 'abc-song-video',
    type: 'video',
    title: 'ABC Song Video',
    emoji: '',
    description: 'Sing along with the ABC song.',
    body: { youtubeId: 'dQw4w9WgXcQ', duration: 180 },
    status: 'published',
    accessTier: 'free',
    ageGroup: 'all',
    difficulty: null,
    energyLevel: 'moderate',
    durationMinutes: 3,
    route: '/videos/abc-song',
    authorId: 'user-editor-001',
    publishedAt: FIXED_PUBLISHED,
    scheduledAt: null,
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    version: 1,
    deletedAt: null,
    updatedBy: null,
    featured: true,
    archivedAt: null,
    mood: 'energetic',
    bedtimeFriendly: false,
    language: 'en',
    publishedSnapshot: null,
    freshnessScore: null,
    evergreenScore: null,
    seasonalRelevance: null,
    needsRefresh: false,
    lastRefreshDate: null,
    nextReviewDate: null,
  },

  // 10. Game
  {
    id: 'content-game-001',
    slug: 'matching-game-colors',
    type: 'game',
    title: 'Color Matching Game',
    emoji: '',
    description: 'Match the colors to win!',
    body: { gameType: 'matching', items: 6 },
    status: 'draft',
    accessTier: 'premium',
    ageGroup: 'age_3_4',
    difficulty: 'medium',
    energyLevel: 'active',
    durationMinutes: 5,
    route: '/games/color-matching',
    authorId: 'user-editor-001',
    publishedAt: null,
    scheduledAt: null,
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    version: 1,
    deletedAt: null,
    updatedBy: null,
    featured: false,
    archivedAt: null,
    mood: 'playful',
    bedtimeFriendly: false,
    language: 'en',
    publishedSnapshot: null,
    freshnessScore: null,
    evergreenScore: null,
    seasonalRelevance: null,
    needsRefresh: false,
    lastRefreshDate: null,
    nextReviewDate: null,
  },

  // 11. Audio
  {
    id: 'content-audio-001',
    slug: 'nature-sounds-rain',
    type: 'audio',
    title: 'Nature Sounds: Rain',
    emoji: '',
    description: 'Relax with the sound of rain.',
    body: { audioUrl: '/audio/rain.mp3', loopable: true },
    status: 'published',
    accessTier: 'free',
    ageGroup: 'all',
    difficulty: null,
    energyLevel: 'calm',
    durationMinutes: 15,
    route: '/audio/nature-rain',
    authorId: 'user-editor-001',
    publishedAt: FIXED_PUBLISHED,
    scheduledAt: null,
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    version: 1,
    deletedAt: null,
    updatedBy: null,
    featured: false,
    archivedAt: null,
    mood: 'calm',
    bedtimeFriendly: true,
    language: 'en',
    publishedSnapshot: null,
    freshnessScore: null,
    evergreenScore: null,
    seasonalRelevance: null,
    needsRefresh: false,
    lastRefreshDate: null,
    nextReviewDate: null,
  },

  // 12. Quiz
  {
    id: 'content-quiz-001',
    slug: 'animal-sounds-quiz',
    type: 'quiz',
    title: 'Animal Sounds Quiz',
    emoji: '',
    description: 'Which animal makes this sound?',
    body: {
      questions: [
        { q: 'Moo!', a: 'cow', options: ['cow', 'pig', 'dog'] },
        { q: 'Woof!', a: 'dog', options: ['cat', 'dog', 'bird'] },
      ],
    },
    status: 'published',
    accessTier: 'free',
    ageGroup: 'age_3_4',
    difficulty: 'easy',
    energyLevel: 'moderate',
    durationMinutes: 4,
    route: '/quiz/animal-sounds',
    authorId: 'user-editor-001',
    publishedAt: FIXED_PUBLISHED,
    scheduledAt: null,
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    version: 1,
    deletedAt: null,
    updatedBy: null,
    featured: false,
    archivedAt: null,
    mood: null,
    bedtimeFriendly: false,
    language: 'en',
    publishedSnapshot: null,
    freshnessScore: 0.75,
    evergreenScore: 0.80,
    seasonalRelevance: null,
    needsRefresh: false,
    lastRefreshDate: null,
    nextReviewDate: null,
  },
];

// ── Edge-case fixtures ─────────────────────────────────────

/** Title at the maximum practical length (200 characters) */
export const EDGE_CASE_LONG_TITLE: ContentFixture = {
  ...CONTENT_FIXTURES[0],
  id: 'content-edge-long-title',
  slug: 'edge-case-long-title',
  title: 'A'.repeat(200),
  description: 'Content with an unusually long title for boundary testing.',
};

/** Content with no thumbnail or route -- missing optional fields */
export const EDGE_CASE_MISSING_THUMBNAIL: ContentFixture = {
  ...CONTENT_FIXTURES[0],
  id: 'content-edge-no-thumb',
  slug: 'edge-case-no-thumbnail',
  title: 'No Thumbnail Content',
  route: null,
  body: {},
  publishedSnapshot: null,
};

/** Bedtime-only content (bedtimeFriendly=true, mood=sleepy, energyLevel=calm) */
export const EDGE_CASE_BEDTIME_ONLY: ContentFixture = {
  ...CONTENT_FIXTURES[7], // the story
  id: 'content-edge-bedtime',
  slug: 'edge-case-bedtime-only',
  title: 'Bedtime Only Content',
  bedtimeFriendly: true,
  mood: 'sleepy',
  energyLevel: 'calm',
};

/** Premium-only content */
export const EDGE_CASE_PREMIUM_ONLY: ContentFixture = {
  ...CONTENT_FIXTURES[6], // the premium lesson
  id: 'content-edge-premium',
  slug: 'edge-case-premium-only',
  title: 'Premium Only Lesson',
  accessTier: 'premium',
  status: 'published',
  publishedAt: FIXED_PUBLISHED,
};

/** Archived content */
export const EDGE_CASE_ARCHIVED: ContentFixture = {
  ...CONTENT_FIXTURES[0],
  id: 'content-edge-archived',
  slug: 'edge-case-archived',
  title: 'Archived Content',
  status: 'archived',
  archivedAt: FIXED_ARCHIVED,
};

/** Content with duplicate tags scenario (two tags with same dimension) */
export const EDGE_CASE_DUPLICATE_TAGS: ContentFixture = {
  ...CONTENT_FIXTURES[0],
  id: 'content-edge-dup-tags',
  slug: 'edge-case-duplicate-tags',
  title: 'Content With Duplicate Tags',
  body: { _testMeta: { duplicateTags: ['skill:phonics', 'skill:phonics'] } },
};
