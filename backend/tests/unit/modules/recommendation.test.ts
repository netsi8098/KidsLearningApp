import {
  previewRecommendations,
  explainRecommendation,
  simulateRecommendations,
  getContentDiagnostics,
  listConfigs,
  updateConfig,
} from '../../../src/modules/recommendation/service';
import { NotFoundError } from '../../../src/lib/errors';

vi.mock('../../../src/lib/prisma', () => ({
  prisma: {
    childProfile: {
      findUnique: vi.fn(),
    },
    content: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    contentAnalytics: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    recommendationConfig: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

import { prisma } from '../../../src/lib/prisma';

const mockProfileFindUnique = prisma.childProfile.findUnique as ReturnType<typeof vi.fn>;
const mockContentFindUnique = prisma.content.findUnique as ReturnType<typeof vi.fn>;
const mockContentFindMany = prisma.content.findMany as ReturnType<typeof vi.fn>;
const mockAnalyticsFindMany = prisma.contentAnalytics.findMany as ReturnType<typeof vi.fn>;
const mockAnalyticsFindFirst = prisma.contentAnalytics.findFirst as ReturnType<typeof vi.fn>;
const mockConfigFindMany = prisma.recommendationConfig.findMany as ReturnType<typeof vi.fn>;
const mockConfigUpsert = prisma.recommendationConfig.upsert as ReturnType<typeof vi.fn>;

// Helper to create content fixtures
function makeContent(overrides: Partial<{
  id: string;
  title: string;
  type: string;
  ageGroup: string;
  status: string;
  bedtimeFriendly: boolean;
  publishedAt: Date | null;
  freshnessScore: number | null;
  evergreenScore: number | null;
  skills: { skillId: string; relevance: number }[];
}> = {}) {
  const defaults = {
    id: 'content-1',
    title: 'Test Content',
    type: 'video',
    ageGroup: 'age_3_4',
    status: 'published',
    bedtimeFriendly: false,
    publishedAt: new Date('2026-03-20') as Date | null,
    freshnessScore: null as number | null,
    evergreenScore: null as number | null,
    skills: [] as { skillId: string; relevance: number }[],
  };
  return { ...defaults, ...overrides };
}

function makeProfile(overrides: Partial<{
  id: string;
  name: string;
  ageGroup: string;
  bedtimeMode: boolean;
}> = {}) {
  return {
    id: overrides.id ?? 'profile-1',
    name: overrides.name ?? 'Test Child',
    ageGroup: overrides.ageGroup ?? 'age_3_4',
    bedtimeMode: overrides.bedtimeMode ?? false,
  };
}

describe('previewRecommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no custom configs
    mockConfigFindMany.mockResolvedValue([]);
    // Default: no analytics
    mockAnalyticsFindMany.mockResolvedValue([]);
  });

  it('should throw NotFoundError when profile does not exist', async () => {
    mockProfileFindUnique.mockResolvedValue(null);

    await expect(previewRecommendations('nonexistent')).rejects.toThrow(NotFoundError);
  });

  it('should return scored content sorted by score descending', async () => {
    mockProfileFindUnique.mockResolvedValue(makeProfile({ ageGroup: 'age_3_4' }));
    mockContentFindMany.mockResolvedValue([
      makeContent({ id: 'c1', ageGroup: 'age_3_4', title: 'Exact match' }),
      makeContent({ id: 'c2', ageGroup: 'age_5_6', title: 'Far match' }),
    ]);

    const results = await previewRecommendations('profile-1');

    expect(results.length).toBeGreaterThanOrEqual(2);
    // First result should have a higher score (exact age match)
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
    expect(results[0].contentId).toBe('c1');
  });

  it('should limit results to 20', async () => {
    mockProfileFindUnique.mockResolvedValue(makeProfile());
    const contents = Array.from({ length: 30 }, (_, i) =>
      makeContent({ id: `c-${i}`, title: `Content ${i}` })
    );
    mockContentFindMany.mockResolvedValue(contents);

    const results = await previewRecommendations('profile-1');

    expect(results.length).toBe(20);
  });

  describe('age match scoring', () => {
    it('should score 1.0 for exact age match', async () => {
      mockProfileFindUnique.mockResolvedValue(makeProfile({ ageGroup: 'age_3_4' }));
      mockContentFindMany.mockResolvedValue([
        makeContent({ id: 'c1', ageGroup: 'age_3_4' }),
      ]);

      const results = await previewRecommendations('profile-1');

      // ageMatchScore = 1.0 * age_match_weight(0.4) = 0.4
      expect(results[0].breakdown.ageMatchScore).toBe(0.4);
    });

    it('should score 1.0 for content with ageGroup "all"', async () => {
      mockProfileFindUnique.mockResolvedValue(makeProfile({ ageGroup: 'age_3_4' }));
      mockContentFindMany.mockResolvedValue([
        makeContent({ id: 'c1', ageGroup: 'all' }),
      ]);

      const results = await previewRecommendations('profile-1');

      // ageMatchScore = 1.0 * 0.4 = 0.4
      expect(results[0].breakdown.ageMatchScore).toBe(0.4);
    });

    it('should score 0.5 for adjacent age group', async () => {
      mockProfileFindUnique.mockResolvedValue(makeProfile({ ageGroup: 'age_3_4' }));
      mockContentFindMany.mockResolvedValue([
        // age_3_4 (index 1) vs age_4_5 (index 2) => distance 1 => 0.5
        makeContent({ id: 'c1', ageGroup: 'age_4_5' }),
      ]);

      const results = await previewRecommendations('profile-1');

      // ageMatchScore = 0.5 * 0.4 = 0.2
      expect(results[0].breakdown.ageMatchScore).toBe(0.2);
    });

    it('should score 0.2 for age group 2 apart', async () => {
      mockProfileFindUnique.mockResolvedValue(makeProfile({ ageGroup: 'age_2_3' }));
      mockContentFindMany.mockResolvedValue([
        // age_2_3 (index 0) vs age_4_5 (index 2) => distance 2 => 0.2
        makeContent({ id: 'c1', ageGroup: 'age_4_5' }),
      ]);

      const results = await previewRecommendations('profile-1');

      // ageMatchScore = 0.2 * 0.4 = 0.08
      expect(results[0].breakdown.ageMatchScore).toBe(0.08);
    });
  });

  describe('skill boost scoring', () => {
    it('should score 0.5 when content has no skills', async () => {
      mockProfileFindUnique.mockResolvedValue(makeProfile());
      mockContentFindMany.mockResolvedValue([
        makeContent({ id: 'c1', skills: [] }),
      ]);

      const results = await previewRecommendations('profile-1');

      // skillMatchScore = 0.5 * skill_boost(0.3) = 0.15
      expect(results[0].breakdown.skillMatchScore).toBe(0.15);
    });

    it('should boost content with more skills and higher relevance', async () => {
      mockProfileFindUnique.mockResolvedValue(makeProfile());
      mockContentFindMany.mockResolvedValue([
        makeContent({
          id: 'c1',
          skills: [
            { skillId: 's1', relevance: 0.9 },
            { skillId: 's2', relevance: 0.8 },
            { skillId: 's3', relevance: 0.7 },
          ],
        }),
      ]);

      const results = await previewRecommendations('profile-1');

      // avgRelevance = (0.9 + 0.8 + 0.7) / 3 = 0.8
      // diversityBonus = min(3/5, 1.0) * 0.2 = 0.6 * 0.2 = 0.12
      // skillMatch = min(1.0, 0.8 + 0.12) = 0.92
      // skillMatchScore = 0.92 * 0.3 = 0.276
      expect(results[0].breakdown.skillMatchScore).toBeCloseTo(0.276, 3);
    });

    it('should cap diversity bonus at 5 skills', async () => {
      mockProfileFindUnique.mockResolvedValue(makeProfile());
      const skills = Array.from({ length: 10 }, (_, i) => ({
        skillId: `s${i}`,
        relevance: 0.5,
      }));
      mockContentFindMany.mockResolvedValue([
        makeContent({ id: 'c1', skills }),
      ]);

      const results = await previewRecommendations('profile-1');

      // avgRelevance = 0.5
      // diversityBonus = min(10/5, 1.0) * 0.2 = 1.0 * 0.2 = 0.2
      // skillMatch = min(1.0, 0.5 + 0.2) = 0.7
      // skillMatchScore = 0.7 * 0.3 = 0.21
      expect(results[0].breakdown.skillMatchScore).toBeCloseTo(0.21, 3);
    });
  });

  describe('bedtime bias scoring', () => {
    it('should return 0 bias when bedtime mode is off', async () => {
      mockProfileFindUnique.mockResolvedValue(makeProfile({ bedtimeMode: false }));
      mockContentFindMany.mockResolvedValue([
        makeContent({ id: 'c1', bedtimeFriendly: true }),
      ]);

      const results = await previewRecommendations('profile-1');

      expect(results[0].breakdown.bedtimeBiasScore).toBe(0);
    });

    it('should return +1.0 * weight for bedtime-friendly content during bedtime', async () => {
      mockProfileFindUnique.mockResolvedValue(makeProfile({ bedtimeMode: true }));
      mockContentFindMany.mockResolvedValue([
        makeContent({ id: 'c1', bedtimeFriendly: true }),
      ]);

      const results = await previewRecommendations('profile-1');

      // bedtimeBiasScore = 1.0 * bedtime_bias(0.25) = 0.25
      expect(results[0].breakdown.bedtimeBiasScore).toBe(0.25);
    });

    it('should return -0.5 * weight for non-bedtime content during bedtime', async () => {
      mockProfileFindUnique.mockResolvedValue(makeProfile({ bedtimeMode: true }));
      mockContentFindMany.mockResolvedValue([
        makeContent({ id: 'c1', bedtimeFriendly: false }),
      ]);

      const results = await previewRecommendations('profile-1');

      // bedtimeBiasScore = -0.5 * 0.25 = -0.125
      expect(results[0].breakdown.bedtimeBiasScore).toBe(-0.125);
    });
  });

  describe('repeat penalty scoring', () => {
    it('should return 0 penalty for unseen content', async () => {
      mockProfileFindUnique.mockResolvedValue(makeProfile());
      mockContentFindMany.mockResolvedValue([makeContent({ id: 'c1' })]);
      mockAnalyticsFindMany.mockResolvedValue([]);

      const results = await previewRecommendations('profile-1');

      expect(results[0].breakdown.repeatPenaltyScore).toBe(0);
    });

    it('should return -0.3 * weight for content viewed once', async () => {
      mockProfileFindUnique.mockResolvedValue(makeProfile());
      mockContentFindMany.mockResolvedValue([makeContent({ id: 'c1' })]);
      mockAnalyticsFindMany.mockResolvedValue([{ contentId: 'c1', views: 1 }]);

      const results = await previewRecommendations('profile-1');

      // repeatPenaltyScore = -0.3 * repeat_penalty(0.2) = -0.06
      expect(results[0].breakdown.repeatPenaltyScore).toBe(-0.06);
    });

    it('should return -0.6 * weight for content viewed twice', async () => {
      mockProfileFindUnique.mockResolvedValue(makeProfile());
      mockContentFindMany.mockResolvedValue([makeContent({ id: 'c1' })]);
      mockAnalyticsFindMany.mockResolvedValue([{ contentId: 'c1', views: 2 }]);

      const results = await previewRecommendations('profile-1');

      // repeatPenaltyScore = -0.6 * 0.2 = -0.12
      expect(results[0].breakdown.repeatPenaltyScore).toBe(-0.12);
    });

    it('should return -1.0 * weight for content viewed 3+ times', async () => {
      mockProfileFindUnique.mockResolvedValue(makeProfile());
      mockContentFindMany.mockResolvedValue([makeContent({ id: 'c1' })]);
      mockAnalyticsFindMany.mockResolvedValue([{ contentId: 'c1', views: 6 }]);

      const results = await previewRecommendations('profile-1');

      // repeatPenaltyScore = -1.0 * 0.2 = -0.2
      expect(results[0].breakdown.repeatPenaltyScore).toBe(-0.2);
    });
  });

  describe('freshness scoring', () => {
    it('should use stored freshnessScore when available', async () => {
      mockProfileFindUnique.mockResolvedValue(makeProfile());
      mockContentFindMany.mockResolvedValue([
        makeContent({ id: 'c1', freshnessScore: 0.9, publishedAt: null }),
      ]);

      const results = await previewRecommendations('profile-1');

      // freshnessScore = 0.9 * freshness_weight(0.15) = 0.135
      expect(results[0].breakdown.freshnessScore).toBe(0.135);
    });

    it('should return 1.0 for content published less than 7 days ago', async () => {
      mockProfileFindUnique.mockResolvedValue(makeProfile());
      const recentDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
      mockContentFindMany.mockResolvedValue([
        makeContent({ id: 'c1', publishedAt: recentDate, freshnessScore: null }),
      ]);

      const results = await previewRecommendations('profile-1');

      // freshnessScore = 1.0 * 0.15 = 0.15
      expect(results[0].breakdown.freshnessScore).toBe(0.15);
    });

    it('should return 0.8 for content published 7-30 days ago', async () => {
      mockProfileFindUnique.mockResolvedValue(makeProfile());
      const date = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000); // 15 days ago
      mockContentFindMany.mockResolvedValue([
        makeContent({ id: 'c1', publishedAt: date, freshnessScore: null }),
      ]);

      const results = await previewRecommendations('profile-1');

      // freshnessScore = 0.8 * 0.15 = 0.12
      expect(results[0].breakdown.freshnessScore).toBe(0.12);
    });

    it('should return 0.5 for content published 30-90 days ago', async () => {
      mockProfileFindUnique.mockResolvedValue(makeProfile());
      const date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
      mockContentFindMany.mockResolvedValue([
        makeContent({ id: 'c1', publishedAt: date, freshnessScore: null }),
      ]);

      const results = await previewRecommendations('profile-1');

      // freshnessScore = 0.5 * 0.15 = 0.075
      expect(results[0].breakdown.freshnessScore).toBe(0.075);
    });

    it('should return 0.3 for content published over 90 days ago', async () => {
      mockProfileFindUnique.mockResolvedValue(makeProfile());
      const date = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000); // 120 days ago
      mockContentFindMany.mockResolvedValue([
        makeContent({ id: 'c1', publishedAt: date, freshnessScore: null }),
      ]);

      const results = await previewRecommendations('profile-1');

      // freshnessScore = 0.3 * 0.15 = 0.045
      expect(results[0].breakdown.freshnessScore).toBe(0.045);
    });

    it('should return 0.5 for unpublished content without freshnessScore', async () => {
      mockProfileFindUnique.mockResolvedValue(makeProfile());
      mockContentFindMany.mockResolvedValue([
        makeContent({ id: 'c1', publishedAt: null, freshnessScore: null }),
      ]);

      const results = await previewRecommendations('profile-1');

      // freshnessScore = 0.5 * 0.15 = 0.075
      expect(results[0].breakdown.freshnessScore).toBe(0.075);
    });
  });
});

describe('explainRecommendation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfigFindMany.mockResolvedValue([]);
  });

  it('should throw NotFoundError when content does not exist', async () => {
    mockContentFindUnique.mockResolvedValue(null);
    mockProfileFindUnique.mockResolvedValue(makeProfile());

    await expect(explainRecommendation('bad-content', 'profile-1')).rejects.toThrow(NotFoundError);
  });

  it('should throw NotFoundError when profile does not exist', async () => {
    mockContentFindUnique.mockResolvedValue(
      makeContent({ id: 'c1', skills: [{ skillId: 's1', relevance: 0.8 }] })
    );
    mockProfileFindUnique.mockResolvedValue(null);

    await expect(explainRecommendation('c1', 'bad-profile')).rejects.toThrow(NotFoundError);
  });

  it('should return a complete explanation with breakdown and factors', async () => {
    const content = makeContent({
      id: 'c1',
      title: 'Fun Numbers',
      ageGroup: 'age_3_4',
      bedtimeFriendly: false,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      skills: [{ skillId: 's1', relevance: 0.7 }],
    });
    const profile = makeProfile({
      id: 'p1',
      name: 'Alice',
      ageGroup: 'age_3_4',
      bedtimeMode: false,
    });

    mockContentFindUnique.mockResolvedValue(content);
    mockProfileFindUnique.mockResolvedValue(profile);
    mockAnalyticsFindFirst.mockResolvedValue(null);

    const result = await explainRecommendation('c1', 'p1');

    expect(result.contentId).toBe('c1');
    expect(result.profileId).toBe('p1');
    expect(result.contentTitle).toBe('Fun Numbers');
    expect(result.profileName).toBe('Alice');
    expect(result.breakdown).toBeDefined();
    expect(result.breakdown.totalScore).toBeDefined();
    expect(result.factors).toHaveLength(5);
    expect(result.factors.map((f) => f.label)).toEqual([
      'Age Match',
      'Skill Match',
      'Freshness',
      'Bedtime Bias',
      'Repeat Penalty',
    ]);
  });

  it('should incorporate recent view counts into repeat penalty', async () => {
    mockContentFindUnique.mockResolvedValue(makeContent({ id: 'c1' }));
    mockProfileFindUnique.mockResolvedValue(makeProfile());
    mockAnalyticsFindFirst.mockResolvedValue({ views: 5 });

    const result = await explainRecommendation('c1', 'profile-1');

    // Viewed 5 times => penalty = -1.0 * 0.2 = -0.2
    expect(result.breakdown.repeatPenaltyScore).toBe(-0.2);
    expect(result.factors[4].detail).toContain('5 time(s) this week');
  });
});

describe('simulateRecommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfigFindMany.mockResolvedValue([]);
    mockAnalyticsFindMany.mockResolvedValue([]);
  });

  it('should return defaults, applied weights, and results', async () => {
    mockProfileFindUnique.mockResolvedValue(makeProfile());
    mockContentFindMany.mockResolvedValue([makeContent({ id: 'c1' })]);

    const overrides = { age_match_weight: 0.8 };
    const result = await simulateRecommendations('profile-1', overrides);

    expect(result.defaults).toBeDefined();
    expect(result.defaults.age_match_weight).toBe(0.4); // default
    expect(result.applied).toBeDefined();
    expect(result.applied.age_match_weight).toBe(0.8); // overridden
    expect(result.results).toBeDefined();
    expect(Array.isArray(result.results)).toBe(true);
  });

  it('should apply overrides to scoring', async () => {
    mockProfileFindUnique.mockResolvedValue(makeProfile({ ageGroup: 'age_3_4' }));
    mockContentFindMany.mockResolvedValue([
      makeContent({ id: 'c1', ageGroup: 'age_3_4' }),
    ]);

    const result = await simulateRecommendations('profile-1', { age_match_weight: 1.0 });

    // ageMatchScore should be 1.0 * 1.0 = 1.0 with overridden weight
    expect(result.results[0].breakdown.ageMatchScore).toBe(1.0);
  });
});

describe('getContentDiagnostics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw NotFoundError when content does not exist', async () => {
    mockContentFindUnique.mockResolvedValue(null);

    await expect(getContentDiagnostics('bad-id')).rejects.toThrow(NotFoundError);
  });

  it('should return complete diagnostics for existing content', async () => {
    const publishDate = new Date('2026-03-10');
    mockContentFindUnique.mockResolvedValue({
      id: 'c1',
      title: 'Test Content',
      type: 'video',
      ageGroup: 'age_3_4',
      status: 'published',
      bedtimeFriendly: true,
      freshnessScore: 0.8,
      evergreenScore: 0.6,
      publishedAt: publishDate,
      createdAt: new Date('2026-03-01'),
      needsRefresh: false,
      lastRefreshDate: null,
      nextReviewDate: null,
      skills: [
        { relevance: 0.9, skill: { id: 'sk1', name: 'Counting', category: 'numeracy' } },
      ],
      tags: [
        { tag: { id: 'tag1', name: 'numbers', dimension: 'topic' } },
      ],
      analytics: [
        {
          period: 'weekly',
          periodKey: '2026-W12',
          views: 100,
          completions: 80,
          avgTimeMs: 120000,
          stars: 50,
          favorites: 20,
        },
      ],
    });

    const result = await getContentDiagnostics('c1');

    expect(result.content.id).toBe('c1');
    expect(result.content.title).toBe('Test Content');
    expect(result.content.bedtimeFriendly).toBe(true);
    expect(result.content.freshnessScore).toBe(0.8);

    expect(result.skills).toHaveLength(1);
    expect(result.skills[0]).toEqual({
      skillId: 'sk1',
      skillName: 'Counting',
      category: 'numeracy',
      relevance: 0.9,
    });

    expect(result.tags).toHaveLength(1);
    expect(result.tags[0]).toEqual({
      tagId: 'tag1',
      tagName: 'numbers',
      dimension: 'topic',
    });

    expect(result.analytics).toHaveLength(1);
    expect(result.analytics[0].views).toBe(100);

    expect(result.freshness.daysSincePublished).toBeGreaterThanOrEqual(0);
    expect(result.freshness.needsRefresh).toBe(false);
  });

  it('should return null daysSincePublished when content is not published', async () => {
    mockContentFindUnique.mockResolvedValue({
      id: 'c2',
      title: 'Draft',
      type: 'story',
      ageGroup: 'age_2_3',
      status: 'draft',
      bedtimeFriendly: false,
      freshnessScore: null,
      evergreenScore: null,
      publishedAt: null,
      createdAt: new Date(),
      needsRefresh: false,
      lastRefreshDate: null,
      nextReviewDate: null,
      skills: [],
      tags: [],
      analytics: [],
    });

    const result = await getContentDiagnostics('c2');

    expect(result.freshness.daysSincePublished).toBeNull();
  });
});

describe('listConfigs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all recommendation configs ordered by key', async () => {
    const configs = [
      { key: 'age_match_weight', value: 0.4, description: null, updatedBy: 'admin' },
      { key: 'freshness_weight', value: 0.15, description: null, updatedBy: 'admin' },
    ];
    mockConfigFindMany.mockResolvedValue(configs);

    const result = await listConfigs();

    expect(result).toEqual(configs);
    expect(mockConfigFindMany).toHaveBeenCalledWith({
      orderBy: { key: 'asc' },
    });
  });
});

describe('updateConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should upsert a config with the given key, value, and updatedBy', async () => {
    const expected = {
      key: 'age_match_weight',
      value: 0.6,
      description: 'New weight for age matching',
      updatedBy: 'admin-1',
    };
    mockConfigUpsert.mockResolvedValue(expected);

    const result = await updateConfig('age_match_weight', 0.6, 'New weight for age matching', 'admin-1');

    expect(result).toEqual(expected);
    expect(mockConfigUpsert).toHaveBeenCalledWith({
      where: { key: 'age_match_weight' },
      update: expect.objectContaining({
        value: 0.6,
        description: 'New weight for age matching',
        updatedBy: 'admin-1',
      }),
      create: expect.objectContaining({
        key: 'age_match_weight',
        value: 0.6,
        description: 'New weight for age matching',
        updatedBy: 'admin-1',
      }),
    });
  });

  it('should omit description from update when undefined', async () => {
    mockConfigUpsert.mockResolvedValue({
      key: 'bedtime_bias',
      value: 0.5,
      description: null,
      updatedBy: 'admin',
    });

    await updateConfig('bedtime_bias', 0.5, undefined, 'admin');

    const updateArg = mockConfigUpsert.mock.calls[0][0].update;
    expect(updateArg).not.toHaveProperty('description');
    expect(updateArg.updatedBy).toBe('admin');
  });
});
