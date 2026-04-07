import { renderHook, act } from '@testing-library/react';
import { useSearch } from '../../../src/hooks/useSearch';

const mocks = vi.hoisted(() => ({
  mockSearchResults: [] as {
    type: string;
    sourceId: string;
    title: string;
    emoji: string;
    route: string;
    category?: string;
    ageGroup?: string;
  }[],
}));

vi.mock('../../../src/registry/contentRegistry', () => ({
  searchContent: vi.fn((query: string) => {
    if (!query.trim()) return [];
    return mocks.mockSearchResults.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.type.includes(query.toLowerCase()) ||
        (item.category?.toLowerCase().includes(query.toLowerCase()) ?? false)
    );
  }),
}));

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockSearchResults = [
      { type: 'lesson', sourceId: 'l-1', title: 'ABC Letters', emoji: '🔤', route: '/abc', category: 'alphabet', ageGroup: '2-3' },
      { type: 'lesson', sourceId: 'l-2', title: 'Numbers Fun', emoji: '🔢', route: '/numbers', category: 'numbers', ageGroup: '4-5' },
      { type: 'story', sourceId: 's-1', title: 'The Magic Tree', emoji: '🌳', route: '/stories', category: 'adventure' },
      { type: 'game', sourceId: 'g-1', title: 'Color Splash', emoji: '🎨', route: '/games', category: 'colors', ageGroup: '2-3' },
      { type: 'video', sourceId: 'v-1', title: 'ABC Song', emoji: '🎵', route: '/videos', category: 'alphabet', ageGroup: '2-3' },
    ];
  });

  describe('initial state', () => {
    it('starts with empty results', () => {
      const { result } = renderHook(() => useSearch());
      expect(result.current.results).toEqual([]);
    });

    it('starts with isSearching as false', () => {
      const { result } = renderHook(() => useSearch());
      expect(result.current.isSearching).toBe(false);
    });
  });

  describe('search', () => {
    it('returns matching results by title', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.search('ABC');
      });

      expect(result.current.results.length).toBeGreaterThan(0);
      expect(result.current.results.some((r) => r.title === 'ABC Letters')).toBe(true);
    });

    it('returns empty results for empty query', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.search('');
      });

      expect(result.current.results).toEqual([]);
    });

    it('returns empty results for whitespace-only query', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.search('   ');
      });

      expect(result.current.results).toEqual([]);
    });

    it('maps search results to SearchResult format', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.search('ABC');
      });

      const abcResult = result.current.results.find((r) => r.title === 'ABC Letters');
      expect(abcResult).toBeDefined();
      expect(abcResult!.type).toBe('lesson');
      expect(abcResult!.id).toBe('l-1');
      expect(abcResult!.emoji).toBe('🔤');
      expect(abcResult!.route).toBe('/abc');
      expect(abcResult!.category).toBe('alphabet');
    });

    it('sets isSearching to false after search completes', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.search('ABC');
      });

      expect(result.current.isSearching).toBe(false);
    });
  });

  describe('search with filters', () => {
    it('filters by type', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.search('ABC', { type: 'lesson' });
      });

      result.current.results.forEach((r) => {
        expect(r.type).toBe('lesson');
      });
    });

    it('filters by ageGroup', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.search('ABC', { ageGroup: '2-3' });
      });

      // Should only include items with ageGroup '2-3' or no ageGroup
      expect(result.current.results.length).toBeGreaterThan(0);
    });

    it('filters by both type and ageGroup', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.search('ABC', { type: 'lesson', ageGroup: '2-3' });
      });

      result.current.results.forEach((r) => {
        expect(r.type).toBe('lesson');
      });
    });

    it('returns empty when filter excludes all results', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.search('Magic Tree', { type: 'lesson' });
      });

      // 'Magic Tree' is a story, not a lesson
      expect(result.current.results).toHaveLength(0);
    });
  });

  describe('category fallback', () => {
    it('uses type as category when category is undefined', () => {
      mocks.mockSearchResults = [
        { type: 'lesson', sourceId: 'l-x', title: 'Test Item', emoji: '📝', route: '/test' },
      ];

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.search('Test');
      });

      expect(result.current.results[0].category).toBe('lesson');
    });
  });
});
