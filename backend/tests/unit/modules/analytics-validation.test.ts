/**
 * Analytics event schema validation tests.
 *
 * Tests the Zod schemas defined in backend/src/modules/analytics/schemas.ts
 * to ensure proper validation of analytics events, dashboard queries, and exports.
 */
import { describe, it, expect } from 'vitest';
import {
  recordEventSchema,
  contentAnalyticsSchema,
  dashboardSchema,
  topContentSchema,
  engagementSchema,
  exportSchema,
  aggregateSchema,
} from '../../../src/modules/analytics/schemas.js';

// ── recordEventSchema ────────────────────────────────────────

describe('recordEventSchema', () => {
  describe('valid payloads', () => {
    it('accepts a "view" metric event', () => {
      const input = {
        body: {
          contentId: 'lesson-abc-01',
          metric: 'view',
        },
      };

      const result = recordEventSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.metric).toBe('view');
        expect(result.data.body.value).toBe(1); // default value
      }
    });

    it('accepts a "completion" metric event', () => {
      const input = {
        body: {
          contentId: 'story-bedtime-01',
          metric: 'completion',
          value: 1,
        },
      };

      const result = recordEventSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('accepts a "star" metric event', () => {
      const input = {
        body: {
          contentId: 'game-word-builder',
          metric: 'star',
          value: 3,
        },
      };

      const result = recordEventSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.value).toBe(3);
      }
    });

    it('accepts a "favorite" metric event', () => {
      const input = {
        body: {
          contentId: 'video-123',
          metric: 'favorite',
        },
      };

      const result = recordEventSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('accepts a "share" metric event', () => {
      const input = {
        body: {
          contentId: 'collection-abc-bundle',
          metric: 'share',
        },
      };

      const result = recordEventSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('accepts an event with optional timeMs', () => {
      const input = {
        body: {
          contentId: 'lesson-colors-01',
          metric: 'view',
          timeMs: 5000,
        },
      };

      const result = recordEventSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.timeMs).toBe(5000);
      }
    });

    it('defaults value to 1 when not provided', () => {
      const input = {
        body: {
          contentId: 'lesson-shapes-01',
          metric: 'view',
        },
      };

      const result = recordEventSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.value).toBe(1);
      }
    });
  });

  describe('invalid payloads', () => {
    it('rejects invalid metric values', () => {
      const input = {
        body: {
          contentId: 'lesson-abc-01',
          metric: 'click', // Not a valid metric
        },
      };

      const result = recordEventSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects empty contentId', () => {
      const input = {
        body: {
          contentId: '',
          metric: 'view',
        },
      };

      const result = recordEventSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects missing contentId', () => {
      const input = {
        body: {
          metric: 'view',
        },
      };

      const result = recordEventSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects missing metric', () => {
      const input = {
        body: {
          contentId: 'lesson-abc-01',
        },
      };

      const result = recordEventSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects negative value', () => {
      const input = {
        body: {
          contentId: 'lesson-abc-01',
          metric: 'view',
          value: -1,
        },
      };

      const result = recordEventSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects negative timeMs', () => {
      const input = {
        body: {
          contentId: 'lesson-abc-01',
          metric: 'view',
          timeMs: -100,
        },
      };

      const result = recordEventSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects non-integer value', () => {
      const input = {
        body: {
          contentId: 'lesson-abc-01',
          metric: 'view',
          value: 1.5,
        },
      };

      const result = recordEventSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects non-integer timeMs', () => {
      const input = {
        body: {
          contentId: 'lesson-abc-01',
          metric: 'view',
          timeMs: 1.5,
        },
      };

      const result = recordEventSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects missing body entirely', () => {
      const input = {};
      const result = recordEventSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});

// ── contentAnalyticsSchema ───────────────────────────────────

describe('contentAnalyticsSchema', () => {
  it('accepts valid params and query', () => {
    const input = {
      params: { contentId: 'lesson-abc-01' },
      query: { period: 'daily' },
    };

    const result = contentAnalyticsSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('defaults period to daily', () => {
    const input = {
      params: { contentId: 'lesson-abc-01' },
      query: {},
    };

    const result = contentAnalyticsSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.period).toBe('daily');
    }
  });

  it('accepts optional from and to date filters', () => {
    const input = {
      params: { contentId: 'lesson-abc-01' },
      query: {
        period: 'weekly',
        from: '2026-01-01',
        to: '2026-03-26',
      },
    };

    const result = contentAnalyticsSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.from).toBe('2026-01-01');
      expect(result.data.query.to).toBe('2026-03-26');
    }
  });

  it('rejects empty contentId in params', () => {
    const input = {
      params: { contentId: '' },
      query: {},
    };

    const result = contentAnalyticsSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid period value', () => {
    const input = {
      params: { contentId: 'lesson-abc-01' },
      query: { period: 'yearly' },
    };

    const result = contentAnalyticsSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ── dashboardSchema ──────────────────────────────────────────

describe('dashboardSchema', () => {
  it('accepts empty query with defaults', () => {
    const input = { query: {} };
    const result = dashboardSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.period).toBe('daily');
    }
  });

  it('accepts all query parameters', () => {
    const input = {
      query: {
        from: '2026-01-01',
        to: '2026-03-26',
        period: 'monthly',
      },
    };

    const result = dashboardSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.period).toBe('monthly');
    }
  });

  it('rejects invalid period', () => {
    const input = { query: { period: 'quarterly' } };
    const result = dashboardSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ── topContentSchema ─────────────────────────────────────────

describe('topContentSchema', () => {
  it('defaults metric to views and limit to 10', () => {
    const input = { query: {} };
    const result = topContentSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.metric).toBe('views');
      expect(result.data.query.limit).toBe(10);
    }
  });

  it('accepts all valid metric types', () => {
    const validMetrics = ['views', 'completions', 'avgTimeMs', 'stars', 'favorites', 'shares'];

    for (const metric of validMetrics) {
      const input = { query: { metric } };
      const result = topContentSchema.safeParse(input);
      expect(result.success).toBe(true);
    }
  });

  it('rejects limit exceeding 100', () => {
    const input = { query: { limit: 101 } };
    const result = topContentSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects limit below 1', () => {
    const input = { query: { limit: 0 } };
    const result = topContentSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ── engagementSchema ─────────────────────────────────────────

describe('engagementSchema', () => {
  it('defaults period to daily', () => {
    const input = { query: {} };
    const result = engagementSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.period).toBe('daily');
    }
  });

  it('accepts valid period values', () => {
    for (const period of ['daily', 'weekly', 'monthly']) {
      const result = engagementSchema.safeParse({ query: { period } });
      expect(result.success).toBe(true);
    }
  });
});

// ── exportSchema ─────────────────────────────────────────────

describe('exportSchema', () => {
  it('defaults period to daily', () => {
    const input = { query: {} };
    const result = exportSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.period).toBe('daily');
    }
  });

  it('accepts all filter options', () => {
    const input = {
      query: {
        from: '2026-01-01',
        to: '2026-03-26',
        period: 'weekly',
        contentType: 'story',
        metric: 'completions',
      },
    };

    const result = exportSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.contentType).toBe('story');
      expect(result.data.query.metric).toBe('completions');
    }
  });

  it('accepts all valid content types', () => {
    const contentTypes = [
      'alphabet', 'number', 'color', 'shape', 'animal', 'bodypart',
      'lesson', 'story', 'video', 'game', 'audio', 'cooking',
      'movement', 'homeactivity', 'explorer', 'lifeskill', 'coloring',
      'emotion', 'quiz', 'collection', 'playlist',
    ];

    for (const contentType of contentTypes) {
      const result = exportSchema.safeParse({ query: { contentType } });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid content type', () => {
    const input = { query: { contentType: 'invalid-type' } };
    const result = exportSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid metric', () => {
    const input = { query: { metric: 'clicks' } };
    const result = exportSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ── aggregateSchema ──────────────────────────────────────────

describe('aggregateSchema', () => {
  it('accepts empty body with defaults', () => {
    const input = {};
    const result = aggregateSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('accepts optional period in body', () => {
    const input = { body: { period: 'weekly' } };
    const result = aggregateSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body?.period).toBe('weekly');
    }
  });

  it('rejects invalid period in body', () => {
    const input = { body: { period: 'biweekly' } };
    const result = aggregateSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
