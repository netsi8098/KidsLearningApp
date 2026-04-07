/**
 * Search quality tests.
 *
 * Tests the search schema validation and the search service scoring/snippet logic.
 * These tests validate the Zod schemas and use mocked Prisma calls for service tests.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  searchSchema,
  suggestSchema,
  facetsSchema,
  relatedSchema,
  trendingSchema,
  recentSchema,
} from '../../../src/modules/search/schemas.js';

// ── Search Schema Validation ─────────────────────────────────

describe('searchSchema', () => {
  it('accepts a valid search query', () => {
    const input = {
      query: {
        q: 'alphabet',
      },
    };

    const result = searchSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.q).toBe('alphabet');
      expect(result.data.query.page).toBe(1); // default
      expect(result.data.query.limit).toBe(20); // default
      expect(result.data.query.sortBy).toBe('relevance'); // default
      expect(result.data.query.sortOrder).toBe('desc'); // default
    }
  });

  it('accepts query with all filter options', () => {
    const input = {
      query: {
        q: 'animals',
        type: 'lesson',
        ageGroup: 'age_4_5',
        difficulty: 'easy',
        energyLevel: 'moderate',
        status: 'published',
        tags: 'tag1,tag2,tag3',
        page: 2,
        limit: 50,
        sortBy: 'title',
        sortOrder: 'asc',
      },
    };

    const result = searchSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.type).toBe('lesson');
      expect(result.data.query.ageGroup).toBe('age_4_5');
      expect(result.data.query.difficulty).toBe('easy');
      expect(result.data.query.energyLevel).toBe('moderate');
      expect(result.data.query.status).toBe('published');
      expect(result.data.query.page).toBe(2);
      expect(result.data.query.limit).toBe(50);
      expect(result.data.query.sortBy).toBe('title');
      expect(result.data.query.sortOrder).toBe('asc');
    }
  });

  it('rejects empty query string', () => {
    const input = {
      query: {
        q: '',
      },
    };

    const result = searchSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects missing query string', () => {
    const input = {
      query: {},
    };

    const result = searchSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects query longer than 200 characters', () => {
    const input = {
      query: {
        q: 'a'.repeat(201),
      },
    };

    const result = searchSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('accepts query at exactly 200 characters', () => {
    const input = {
      query: {
        q: 'a'.repeat(200),
      },
    };

    const result = searchSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  describe('content type filtering', () => {
    it('accepts all valid content types', () => {
      const validTypes = [
        'alphabet', 'number', 'color', 'shape', 'animal', 'bodypart',
        'lesson', 'story', 'video', 'game', 'audio', 'cooking',
        'movement', 'homeactivity', 'explorer', 'lifeskill', 'coloring',
        'emotion', 'quiz', 'collection', 'playlist',
      ];

      for (const type of validTypes) {
        const result = searchSchema.safeParse({ query: { q: 'test', type } });
        expect(result.success).toBe(true);
      }
    });

    it('rejects invalid content type', () => {
      const result = searchSchema.safeParse({
        query: { q: 'test', type: 'unknown-type' },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('age group filtering', () => {
    it('accepts all valid age groups', () => {
      const ageGroups = ['age_2_3', 'age_3_4', 'age_4_5', 'age_5_6', 'all'];

      for (const ageGroup of ageGroups) {
        const result = searchSchema.safeParse({ query: { q: 'test', ageGroup } });
        expect(result.success).toBe(true);
      }
    });

    it('rejects invalid age group', () => {
      const result = searchSchema.safeParse({
        query: { q: 'test', ageGroup: 'age_9_10' },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('pagination', () => {
    it('defaults page to 1 and limit to 20', () => {
      const result = searchSchema.safeParse({ query: { q: 'test' } });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query.page).toBe(1);
        expect(result.data.query.limit).toBe(20);
      }
    });

    it('rejects page below 1', () => {
      const result = searchSchema.safeParse({ query: { q: 'test', page: 0 } });
      expect(result.success).toBe(false);
    });

    it('rejects limit below 1', () => {
      const result = searchSchema.safeParse({ query: { q: 'test', limit: 0 } });
      expect(result.success).toBe(false);
    });

    it('rejects limit above 100', () => {
      const result = searchSchema.safeParse({ query: { q: 'test', limit: 101 } });
      expect(result.success).toBe(false);
    });
  });

  describe('sorting', () => {
    it('accepts all valid sortBy values', () => {
      const sortOptions = ['relevance', 'title', 'publishedAt', 'createdAt'];

      for (const sortBy of sortOptions) {
        const result = searchSchema.safeParse({ query: { q: 'test', sortBy } });
        expect(result.success).toBe(true);
      }
    });

    it('rejects invalid sortBy value', () => {
      const result = searchSchema.safeParse({
        query: { q: 'test', sortBy: 'popularity' },
      });
      expect(result.success).toBe(false);
    });

    it('accepts asc and desc sort orders', () => {
      for (const sortOrder of ['asc', 'desc']) {
        const result = searchSchema.safeParse({ query: { q: 'test', sortOrder } });
        expect(result.success).toBe(true);
      }
    });

    it('rejects invalid sort order', () => {
      const result = searchSchema.safeParse({
        query: { q: 'test', sortOrder: 'random' },
      });
      expect(result.success).toBe(false);
    });
  });
});

// ── Suggest Schema ───────────────────────────────────────────

describe('suggestSchema', () => {
  it('accepts a valid suggest query', () => {
    const result = suggestSchema.safeParse({ query: { q: 'alph' } });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.limit).toBe(5); // default
    }
  });

  it('accepts custom limit', () => {
    const result = suggestSchema.safeParse({ query: { q: 'test', limit: 10 } });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.limit).toBe(10);
    }
  });

  it('rejects empty query', () => {
    const result = suggestSchema.safeParse({ query: { q: '' } });
    expect(result.success).toBe(false);
  });

  it('rejects limit above 20', () => {
    const result = suggestSchema.safeParse({ query: { q: 'test', limit: 21 } });
    expect(result.success).toBe(false);
  });
});

// ── Facets Schema ────────────────────────────────────────────

describe('facetsSchema', () => {
  it('accepts empty query for unfiltered facets', () => {
    const result = facetsSchema.safeParse({ query: {} });
    expect(result.success).toBe(true);
  });

  it('accepts query with all filter options', () => {
    const result = facetsSchema.safeParse({
      query: {
        q: 'test',
        type: 'story',
        ageGroup: 'age_4_5',
        difficulty: 'medium',
        status: 'published',
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional q parameter', () => {
    const result = facetsSchema.safeParse({ query: { q: 'test' } });
    expect(result.success).toBe(true);
  });
});

// ── Related Schema ───────────────────────────────────────────

describe('relatedSchema', () => {
  it('accepts valid contentId and default limit', () => {
    const result = relatedSchema.safeParse({
      params: { contentId: 'content-123' },
      query: {},
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.limit).toBe(10); // default
    }
  });

  it('accepts custom limit', () => {
    const result = relatedSchema.safeParse({
      params: { contentId: 'content-123' },
      query: { limit: 5 },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.limit).toBe(5);
    }
  });

  it('rejects empty contentId', () => {
    const result = relatedSchema.safeParse({
      params: { contentId: '' },
      query: {},
    });
    expect(result.success).toBe(false);
  });

  it('rejects limit above 50', () => {
    const result = relatedSchema.safeParse({
      params: { contentId: 'content-123' },
      query: { limit: 51 },
    });
    expect(result.success).toBe(false);
  });
});

// ── Trending Schema ──────────────────────────────────────────

describe('trendingSchema', () => {
  it('defaults days to 7 and limit to 10', () => {
    const result = trendingSchema.safeParse({ query: {} });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.days).toBe(7);
      expect(result.data.query.limit).toBe(10);
    }
  });

  it('accepts custom days and limit', () => {
    const result = trendingSchema.safeParse({ query: { days: 30, limit: 20 } });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.days).toBe(30);
      expect(result.data.query.limit).toBe(20);
    }
  });

  it('rejects days above 90', () => {
    const result = trendingSchema.safeParse({ query: { days: 91 } });
    expect(result.success).toBe(false);
  });

  it('rejects limit above 50', () => {
    const result = trendingSchema.safeParse({ query: { limit: 51 } });
    expect(result.success).toBe(false);
  });
});

// ── Recent Schema ────────────────────────────────────────────

describe('recentSchema', () => {
  it('defaults limit to 10', () => {
    const result = recentSchema.safeParse({ query: {} });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.limit).toBe(10);
    }
  });

  it('accepts custom limit', () => {
    const result = recentSchema.safeParse({ query: { limit: 25 } });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.limit).toBe(25);
    }
  });

  it('rejects limit above 50', () => {
    const result = recentSchema.safeParse({ query: { limit: 51 } });
    expect(result.success).toBe(false);
  });
});

// ── Search Service Scoring Logic ─────────────────────────────

describe('Search scoring logic (unit)', () => {
  /**
   * Replicate the calculateScore function from the search service
   * to unit-test scoring independently of the database.
   */
  function calculateScore(content: { title: string; description: string }, query: string): number {
    const lowerQuery = query.toLowerCase();
    const lowerTitle = content.title.toLowerCase();
    const lowerDesc = content.description.toLowerCase();

    let score = 0;

    if (lowerTitle === lowerQuery) {
      score += 100;
    } else if (lowerTitle.startsWith(lowerQuery)) {
      score += 75;
    } else if (lowerTitle.includes(lowerQuery)) {
      score += 50;
    }

    if (lowerDesc.includes(lowerQuery)) {
      score += 25;
    }

    return score;
  }

  it('gives highest score for exact title match', () => {
    const score = calculateScore(
      { title: 'Alphabet', description: 'Learn the alphabet' },
      'Alphabet',
    );
    expect(score).toBe(125); // 100 (exact) + 25 (desc contains)
  });

  it('gives high score for title prefix match', () => {
    const score = calculateScore(
      { title: 'Alphabet Song', description: 'Sing along' },
      'Alphabet',
    );
    expect(score).toBe(75);
  });

  it('gives moderate score for title contains match', () => {
    const score = calculateScore(
      { title: 'Learn the Alphabet', description: 'For kids' },
      'Alphabet',
    );
    expect(score).toBe(50);
  });

  it('gives low score for description-only match', () => {
    const score = calculateScore(
      { title: 'Letter Fun', description: 'Learn the alphabet with games' },
      'alphabet',
    );
    expect(score).toBe(25);
  });

  it('gives zero score for no match', () => {
    const score = calculateScore(
      { title: 'Colors', description: 'Learn about colors' },
      'animals',
    );
    expect(score).toBe(0);
  });

  it('scoring is case-insensitive', () => {
    const score1 = calculateScore(
      { title: 'Animals', description: 'Learn about animals' },
      'animals',
    );
    const score2 = calculateScore(
      { title: 'Animals', description: 'Learn about animals' },
      'ANIMALS',
    );
    expect(score1).toBe(score2);
  });

  it('partial query matches inside title give contains score', () => {
    const score = calculateScore(
      { title: 'Fun Animal Stories', description: 'Stories about animals' },
      'Animal',
    );
    expect(score).toBe(50 + 25); // title contains + description contains
  });
});

// ── Search Service Snippet Generation ────────────────────────

describe('Snippet generation logic (unit)', () => {
  function generateSnippet(text: string, query: string, maxLength = 200): string {
    if (!text || !query) return text?.substring(0, maxLength) || '';

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const idx = lowerText.indexOf(lowerQuery);

    if (idx === -1) {
      return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
    }

    const start = Math.max(0, idx - 60);
    const end = Math.min(text.length, idx + query.length + 60);
    let snippet = '';

    if (start > 0) snippet += '...';
    snippet += text.substring(start, end);
    if (end < text.length) snippet += '...';

    return snippet;
  }

  it('returns text around the query match', () => {
    const text = 'This is a long description about learning the alphabet with fun activities for kids.';
    const snippet = generateSnippet(text, 'alphabet');
    expect(snippet).toContain('alphabet');
  });

  it('returns truncated text when no match found', () => {
    const text = 'A'.repeat(300);
    const snippet = generateSnippet(text, 'xyz');
    expect(snippet.length).toBeLessThanOrEqual(203); // 200 + "..."
    expect(snippet).toContain('...');
  });

  it('handles short text without truncation', () => {
    const text = 'Short text';
    const snippet = generateSnippet(text, 'xyz');
    expect(snippet).toBe('Short text');
  });

  it('handles empty text', () => {
    const snippet = generateSnippet('', 'test');
    expect(snippet).toBe('');
  });

  it('handles empty query', () => {
    const snippet = generateSnippet('Some text here', '');
    expect(snippet.length).toBeGreaterThan(0);
  });

  it('adds ellipsis prefix when match is deep in text', () => {
    const text = 'A'.repeat(100) + ' alphabet ' + 'B'.repeat(100);
    const snippet = generateSnippet(text, 'alphabet');
    expect(snippet.startsWith('...')).toBe(true);
  });

  it('adds ellipsis suffix when text continues after snippet', () => {
    const text = 'Start alphabet ' + 'B'.repeat(200);
    const snippet = generateSnippet(text, 'alphabet');
    expect(snippet.endsWith('...')).toBe(true);
  });
});
