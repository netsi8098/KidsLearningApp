import { renderHook, act } from '@testing-library/react';
import { useHelpArticles } from '../../../src/hooks/useHelpArticles';

const mocks = vi.hoisted(() => ({
  mockPlayerId: 1 as number | undefined,
  mockHelpFeedbackFirst: vi.fn(),
  mockHelpFeedbackUpdate: vi.fn(),
  mockHelpFeedbackAdd: vi.fn(),
}));

vi.mock('../../../src/context/AppContext', () => ({
  useApp: () => ({
    currentPlayer: mocks.mockPlayerId ? { id: mocks.mockPlayerId } : null,
  }),
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    helpFeedback: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          first: mocks.mockHelpFeedbackFirst,
        })),
      })),
      update: mocks.mockHelpFeedbackUpdate,
      add: mocks.mockHelpFeedbackAdd,
    },
  },
}));

describe('useHelpArticles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockPlayerId = 1;
    mocks.mockHelpFeedbackFirst.mockResolvedValue(undefined);
  });

  describe('articles', () => {
    it('returns all 12 articles', () => {
      const { result } = renderHook(() => useHelpArticles());
      expect(result.current.articles).toHaveLength(12);
    });

    it('all articles have required fields', () => {
      const { result } = renderHook(() => useHelpArticles());
      result.current.articles.forEach((article) => {
        expect(article.id).toBeTruthy();
        expect(article.title).toBeTruthy();
        expect(article.category).toBeTruthy();
        expect(article.body).toBeTruthy();
        expect(article.emoji).toBeTruthy();
      });
    });

    it('includes articles from all categories', () => {
      const { result } = renderHook(() => useHelpArticles());
      const categories = new Set(result.current.articles.map((a) => a.category));
      expect(categories).toContain('getting_started');
      expect(categories).toContain('troubleshooting');
      expect(categories).toContain('billing');
      expect(categories).toContain('content');
      expect(categories).toContain('accessibility');
      expect(categories).toContain('account');
    });
  });

  describe('getArticle', () => {
    it('returns article by ID', () => {
      const { result } = renderHook(() => useHelpArticles());
      const article = result.current.getArticle('help-001');
      expect(article).toBeDefined();
      expect(article!.title).toBe('How to Create a Profile');
    });

    it('returns undefined for unknown ID', () => {
      const { result } = renderHook(() => useHelpArticles());
      const article = result.current.getArticle('help-999');
      expect(article).toBeUndefined();
    });
  });

  describe('getArticlesByCategory', () => {
    it('returns articles filtered by getting_started category', () => {
      const { result } = renderHook(() => useHelpArticles());
      const articles = result.current.getArticlesByCategory('getting_started');
      expect(articles.length).toBeGreaterThan(0);
      articles.forEach((a) => {
        expect(a.category).toBe('getting_started');
      });
    });

    it('returns articles filtered by troubleshooting category', () => {
      const { result } = renderHook(() => useHelpArticles());
      const articles = result.current.getArticlesByCategory('troubleshooting');
      expect(articles.length).toBeGreaterThan(0);
      articles.forEach((a) => {
        expect(a.category).toBe('troubleshooting');
      });
    });

    it('returns articles filtered by billing category', () => {
      const { result } = renderHook(() => useHelpArticles());
      const articles = result.current.getArticlesByCategory('billing');
      expect(articles).toHaveLength(2);
    });
  });

  describe('searchArticles', () => {
    it('returns all articles for empty query', () => {
      const { result } = renderHook(() => useHelpArticles());
      const results = result.current.searchArticles('');
      expect(results).toHaveLength(12);
    });

    it('returns all articles for whitespace query', () => {
      const { result } = renderHook(() => useHelpArticles());
      const results = result.current.searchArticles('   ');
      expect(results).toHaveLength(12);
    });

    it('searches by title', () => {
      const { result } = renderHook(() => useHelpArticles());
      const results = result.current.searchArticles('Profile');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((a) => a.title.includes('Profile'))).toBe(true);
    });

    it('searches by body content', () => {
      const { result } = renderHook(() => useHelpArticles());
      const results = result.current.searchArticles('Progressive Web App');
      expect(results.length).toBeGreaterThan(0);
    });

    it('searches case-insensitively', () => {
      const { result } = renderHook(() => useHelpArticles());
      const results = result.current.searchArticles('subscription');
      expect(results.length).toBeGreaterThan(0);
    });

    it('searches by category', () => {
      const { result } = renderHook(() => useHelpArticles());
      const results = result.current.searchArticles('billing');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('filteredArticles', () => {
    it('returns all articles when searchQuery is empty', () => {
      const { result } = renderHook(() => useHelpArticles());
      expect(result.current.filteredArticles).toHaveLength(12);
    });

    it('updates filteredArticles when setSearchQuery is called', () => {
      const { result } = renderHook(() => useHelpArticles());

      act(() => {
        result.current.setSearchQuery('Sound');
      });

      expect(result.current.filteredArticles.length).toBeGreaterThan(0);
      expect(result.current.filteredArticles.length).toBeLessThan(12);
    });

    it('returns empty when no match found', () => {
      const { result } = renderHook(() => useHelpArticles());

      act(() => {
        result.current.setSearchQuery('xyznonexistent');
      });

      expect(result.current.filteredArticles).toHaveLength(0);
    });
  });

  describe('submitFeedback', () => {
    it('adds new feedback when none exists', async () => {
      mocks.mockHelpFeedbackFirst.mockResolvedValue(undefined);

      const { result } = renderHook(() => useHelpArticles());

      await act(async () => {
        await result.current.submitFeedback('help-001', true);
      });

      expect(mocks.mockHelpFeedbackAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          articleId: 'help-001',
          helpful: true,
          submittedAt: expect.any(Date),
        })
      );
    });

    it('updates existing feedback', async () => {
      mocks.mockHelpFeedbackFirst.mockResolvedValue({ id: 42, playerId: 1, articleId: 'help-001', helpful: true });

      const { result } = renderHook(() => useHelpArticles());

      await act(async () => {
        await result.current.submitFeedback('help-001', false);
      });

      expect(mocks.mockHelpFeedbackUpdate).toHaveBeenCalledWith(
        42,
        expect.objectContaining({
          helpful: false,
          submittedAt: expect.any(Date),
        })
      );
      expect(mocks.mockHelpFeedbackAdd).not.toHaveBeenCalled();
    });

    it('does nothing when no player is set', async () => {
      mocks.mockPlayerId = undefined;
      const { result } = renderHook(() => useHelpArticles());

      await act(async () => {
        await result.current.submitFeedback('help-001', true);
      });

      expect(mocks.mockHelpFeedbackAdd).not.toHaveBeenCalled();
      expect(mocks.mockHelpFeedbackUpdate).not.toHaveBeenCalled();
    });
  });
});
