import { evaluateContentPolicies } from '../../../src/lib/policyEngine';

vi.mock('../../../src/lib/prisma', () => ({
  prisma: {
    content: {
      findUnique: vi.fn(),
    },
    contentPolicy: {
      findMany: vi.fn(),
    },
    policyResult: {
      upsert: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from '../../../src/lib/prisma';

const mockContentFindUnique = prisma.content.findUnique as ReturnType<typeof vi.fn>;
const mockPolicyFindMany = prisma.contentPolicy.findMany as ReturnType<typeof vi.fn>;
const mockPolicyResultUpsert = prisma.policyResult.upsert as ReturnType<typeof vi.fn>;

describe('evaluateContentPolicies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: upsert succeeds
    mockPolicyResultUpsert.mockResolvedValue({});
  });

  it('should return empty array when content is not found', async () => {
    mockContentFindUnique.mockResolvedValue(null);

    const results = await evaluateContentPolicies('nonexistent-id');

    expect(results).toEqual([]);
    expect(mockPolicyFindMany).not.toHaveBeenCalled();
  });

  it('should return empty array when no enabled policies exist', async () => {
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Test Content',
      ageGroup: 'age_3_4',
      tags: [],
      skills: [],
    });
    mockPolicyFindMany.mockResolvedValue([]);

    const results = await evaluateContentPolicies('content-1');

    expect(results).toEqual([]);
  });

  it('should return pass for age_appropriateness when age group matches', async () => {
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Test Content',
      ageGroup: 'age_3_4',
      tags: [],
      skills: [],
    });
    mockPolicyFindMany.mockResolvedValue([
      {
        id: 'policy-1',
        name: 'Age Check',
        category: 'age_appropriateness',
        severity: 'high',
        enabled: true,
        rules: { requiredAgeGroup: 'age_3_4' },
      },
    ]);

    const results = await evaluateContentPolicies('content-1');

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      policyId: 'policy-1',
      policyName: 'Age Check',
      category: 'age_appropriateness',
      severity: 'high',
      status: 'pass',
      message: null,
    });
  });

  it('should return warning for age_appropriateness when age group mismatches', async () => {
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Test Content',
      ageGroup: 'age_5_6',
      tags: [],
      skills: [],
    });
    mockPolicyFindMany.mockResolvedValue([
      {
        id: 'policy-1',
        name: 'Age Check',
        category: 'age_appropriateness',
        severity: 'high',
        enabled: true,
        rules: { requiredAgeGroup: 'age_3_4' },
      },
    ]);

    const results = await evaluateContentPolicies('content-1');

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('warning');
    expect(results[0].message).toBe('Content age group mismatch: expected age_3_4');
  });

  it('should return pass for age_appropriateness when content ageGroup is "all"', async () => {
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Universal Content',
      ageGroup: 'all',
      tags: [],
      skills: [],
    });
    mockPolicyFindMany.mockResolvedValue([
      {
        id: 'policy-1',
        name: 'Age Check',
        category: 'age_appropriateness',
        severity: 'high',
        enabled: true,
        rules: { requiredAgeGroup: 'age_4_5' },
      },
    ]);

    const results = await evaluateContentPolicies('content-1');

    expect(results[0].status).toBe('pass');
  });

  it('should return block for bedtime_suitability when bedtimeFriendly but active energy', async () => {
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Active Bedtime',
      ageGroup: 'age_3_4',
      bedtimeFriendly: true,
      energyLevel: 'active',
      tags: [],
      skills: [],
    });
    mockPolicyFindMany.mockResolvedValue([
      {
        id: 'policy-2',
        name: 'Bedtime Check',
        category: 'bedtime_suitability',
        severity: 'critical',
        enabled: true,
        rules: {},
      },
    ]);

    const results = await evaluateContentPolicies('content-1');

    expect(results[0].status).toBe('block');
    expect(results[0].message).toBe('Bedtime content should not have active energy level');
  });

  it('should return pass for bedtime_suitability when not bedtimeFriendly', async () => {
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Regular Content',
      bedtimeFriendly: false,
      energyLevel: 'active',
      tags: [],
      skills: [],
    });
    mockPolicyFindMany.mockResolvedValue([
      {
        id: 'policy-2',
        name: 'Bedtime Check',
        category: 'bedtime_suitability',
        severity: 'critical',
        enabled: true,
        rules: {},
      },
    ]);

    const results = await evaluateContentPolicies('content-1');

    expect(results[0].status).toBe('pass');
  });

  it('should return pass for bedtime_suitability when bedtimeFriendly and calm energy', async () => {
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Calm Bedtime',
      bedtimeFriendly: true,
      energyLevel: 'calm',
      tags: [],
      skills: [],
    });
    mockPolicyFindMany.mockResolvedValue([
      {
        id: 'policy-2',
        name: 'Bedtime Check',
        category: 'bedtime_suitability',
        severity: 'critical',
        enabled: true,
        rules: {},
      },
    ]);

    const results = await evaluateContentPolicies('content-1');

    expect(results[0].status).toBe('pass');
  });

  it('should return block for off_brand_language when banned words found', async () => {
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'A stupid title',
      body: 'Some clean body text',
      tags: [],
      skills: [],
    });
    mockPolicyFindMany.mockResolvedValue([
      {
        id: 'policy-3',
        name: 'Language Check',
        category: 'off_brand_language',
        severity: 'high',
        enabled: true,
        rules: { bannedWords: ['stupid', 'dumb', 'hate'] },
      },
    ]);

    const results = await evaluateContentPolicies('content-1');

    expect(results[0].status).toBe('block');
    expect(results[0].message).toContain('stupid');
  });

  it('should return pass for off_brand_language when no banned words found', async () => {
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'A wonderful title',
      body: 'Some lovely body text',
      tags: [],
      skills: [],
    });
    mockPolicyFindMany.mockResolvedValue([
      {
        id: 'policy-3',
        name: 'Language Check',
        category: 'off_brand_language',
        severity: 'high',
        enabled: true,
        rules: { bannedWords: ['stupid', 'dumb', 'hate'] },
      },
    ]);

    const results = await evaluateContentPolicies('content-1');

    expect(results[0].status).toBe('pass');
  });

  it('should detect banned words in body text (case insensitive)', async () => {
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Nice title',
      body: 'This has a DUMB word in it',
      tags: [],
      skills: [],
    });
    mockPolicyFindMany.mockResolvedValue([
      {
        id: 'policy-3',
        name: 'Language Check',
        category: 'off_brand_language',
        severity: 'high',
        enabled: true,
        rules: { bannedWords: ['dumb'] },
      },
    ]);

    const results = await evaluateContentPolicies('content-1');

    expect(results[0].status).toBe('block');
    expect(results[0].message).toContain('dumb');
  });

  it('should return warning for educational_mismatch when no skills exist', async () => {
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Skillless Content',
      tags: [],
      skills: [],
    });
    mockPolicyFindMany.mockResolvedValue([
      {
        id: 'policy-4',
        name: 'Skill Check',
        category: 'educational_mismatch',
        severity: 'medium',
        enabled: true,
        rules: {},
      },
    ]);

    const results = await evaluateContentPolicies('content-1');

    expect(results[0].status).toBe('warning');
    expect(results[0].message).toBe('Content has no associated skills');
  });

  it('should return pass for educational_mismatch when skills exist', async () => {
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Skilled Content',
      tags: [],
      skills: [{ skill: { category: 'literacy' } }],
    });
    mockPolicyFindMany.mockResolvedValue([
      {
        id: 'policy-4',
        name: 'Skill Check',
        category: 'educational_mismatch',
        severity: 'medium',
        enabled: true,
        rules: {},
      },
    ]);

    const results = await evaluateContentPolicies('content-1');

    expect(results[0].status).toBe('pass');
  });

  it('should return pass for unknown policy category', async () => {
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Content',
      tags: [],
      skills: [],
    });
    mockPolicyFindMany.mockResolvedValue([
      {
        id: 'policy-unknown',
        name: 'Unknown Policy',
        category: 'some_future_category',
        severity: 'low',
        enabled: true,
        rules: {},
      },
    ]);

    const results = await evaluateContentPolicies('content-1');

    expect(results[0].status).toBe('pass');
    expect(results[0].message).toBeNull();
  });

  it('should evaluate multiple policies with mixed results', async () => {
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Mixed Content',
      ageGroup: 'age_5_6',
      bedtimeFriendly: true,
      energyLevel: 'active',
      body: 'Clean body text',
      tags: [],
      skills: [{ skill: { category: 'numeracy' } }],
    });
    mockPolicyFindMany.mockResolvedValue([
      {
        id: 'p1',
        name: 'Age Check',
        category: 'age_appropriateness',
        severity: 'high',
        enabled: true,
        rules: { requiredAgeGroup: 'age_3_4' },
      },
      {
        id: 'p2',
        name: 'Bedtime Check',
        category: 'bedtime_suitability',
        severity: 'critical',
        enabled: true,
        rules: {},
      },
      {
        id: 'p3',
        name: 'Language Check',
        category: 'off_brand_language',
        severity: 'high',
        enabled: true,
        rules: { bannedWords: ['bad'] },
      },
      {
        id: 'p4',
        name: 'Skill Check',
        category: 'educational_mismatch',
        severity: 'medium',
        enabled: true,
        rules: {},
      },
    ]);

    const results = await evaluateContentPolicies('content-1');

    expect(results).toHaveLength(4);
    expect(results[0].status).toBe('warning'); // age mismatch
    expect(results[1].status).toBe('block');   // bedtime + active
    expect(results[2].status).toBe('pass');    // no banned words
    expect(results[3].status).toBe('pass');    // has skills
  });

  it('should store results in the database via policyResult.upsert', async () => {
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Content',
      ageGroup: 'age_3_4',
      tags: [],
      skills: [],
    });
    mockPolicyFindMany.mockResolvedValue([
      {
        id: 'policy-1',
        name: 'Age Check',
        category: 'age_appropriateness',
        severity: 'high',
        enabled: true,
        rules: { requiredAgeGroup: 'age_3_4' },
      },
    ]);

    await evaluateContentPolicies('content-1');

    expect(mockPolicyResultUpsert).toHaveBeenCalledTimes(1);
    expect(mockPolicyResultUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          status: 'pass',
          message: null,
        }),
        create: expect.objectContaining({
          contentId: 'content-1',
          policyId: 'policy-1',
          status: 'pass',
          message: null,
        }),
      })
    );
  });

  it('should fallback to policyResult.create when upsert fails', async () => {
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Content',
      ageGroup: 'age_3_4',
      tags: [],
      skills: [],
    });
    mockPolicyFindMany.mockResolvedValue([
      {
        id: 'policy-1',
        name: 'Age Check',
        category: 'age_appropriateness',
        severity: 'high',
        enabled: true,
        rules: { requiredAgeGroup: 'age_3_4' },
      },
    ]);

    const mockCreate = prisma.policyResult.create as ReturnType<typeof vi.fn>;
    // Make upsert reject, triggering the catch fallback
    mockPolicyResultUpsert.mockRejectedValue(new Error('upsert failed'));
    mockCreate.mockResolvedValue({});

    const results = await evaluateContentPolicies('content-1');

    // Allow the microtask from the .catch() handler to settle
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('pass');
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        contentId: 'content-1',
        policyId: 'policy-1',
        status: 'pass',
      }),
    });
  });

  it('should handle off_brand_language with no bannedWords in rules', async () => {
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Title',
      body: 'Body text',
      tags: [],
      skills: [],
    });
    mockPolicyFindMany.mockResolvedValue([
      {
        id: 'policy-lang',
        name: 'Language Check',
        category: 'off_brand_language',
        severity: 'high',
        enabled: true,
        rules: {}, // no bannedWords
      },
    ]);

    const results = await evaluateContentPolicies('content-1');

    expect(results[0].status).toBe('pass');
  });

  it('should handle age_appropriateness with no requiredAgeGroup in rules', async () => {
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Content',
      ageGroup: 'age_3_4',
      tags: [],
      skills: [],
    });
    mockPolicyFindMany.mockResolvedValue([
      {
        id: 'policy-age',
        name: 'Age Check',
        category: 'age_appropriateness',
        severity: 'high',
        enabled: true,
        rules: {}, // no requiredAgeGroup
      },
    ]);

    const results = await evaluateContentPolicies('content-1');

    expect(results[0].status).toBe('pass');
  });
});
