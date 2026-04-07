import { renderHook, act } from '@testing-library/react';
import { useParentTips } from '../../../src/hooks/useParentTips';

const mocks = vi.hoisted(() => ({
  mockPlayerId: 1 as number | undefined,
  mockSavedTipRecords: [] as { playerId: number; tipId: string; savedAt: Date }[],
  mockSavedTipsAdd: vi.fn(),
  mockSavedTipsDelete: vi.fn(),
  mockSavedTipsFirst: vi.fn(),
}));

vi.mock('../../../src/context/AppContext', () => ({
  useApp: () => ({
    currentPlayer: mocks.mockPlayerId ? { id: mocks.mockPlayerId } : null,
  }),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => mocks.mockSavedTipRecords,
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    savedTips: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve(mocks.mockSavedTipRecords)),
          first: mocks.mockSavedTipsFirst,
          delete: mocks.mockSavedTipsDelete,
        })),
      })),
      add: mocks.mockSavedTipsAdd,
    },
  },
}));

describe('useParentTips', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockPlayerId = 1;
    mocks.mockSavedTipRecords = [];
    mocks.mockSavedTipsFirst.mockResolvedValue(undefined);
  });

  describe('tips', () => {
    it('returns all 10 tips by default', () => {
      const { result } = renderHook(() => useParentTips());
      expect(result.current.tips).toHaveLength(10);
    });

    it('all tips have required fields', () => {
      const { result } = renderHook(() => useParentTips());
      result.current.tips.forEach((tip) => {
        expect(tip.id).toBeTruthy();
        expect(tip.title).toBeTruthy();
        expect(tip.category).toBeTruthy();
        expect(tip.format).toBeTruthy();
        expect(tip.body).toBeTruthy();
        expect(tip.preview).toBeTruthy();
        expect(tip.emoji).toBeTruthy();
      });
    });

    it('includes tips from all categories', () => {
      const { result } = renderHook(() => useParentTips());
      const categories = new Set(result.current.tips.map((t) => t.category));
      expect(categories).toContain('expert');
      expect(categories).toContain('routines');
      expect(categories).toContain('play');
      expect(categories).toContain('bedtime');
      expect(categories).toContain('education');
    });
  });

  describe('filterByCategory', () => {
    it('defaults category to all', () => {
      const { result } = renderHook(() => useParentTips());
      expect(result.current.category).toBe('all');
    });

    it('filters tips by expert category', () => {
      const { result } = renderHook(() => useParentTips());

      act(() => {
        result.current.filterByCategory('expert');
      });

      expect(result.current.category).toBe('expert');
      result.current.tips.forEach((tip) => {
        expect(tip.category).toBe('expert');
      });
    });

    it('filters tips by bedtime category', () => {
      const { result } = renderHook(() => useParentTips());

      act(() => {
        result.current.filterByCategory('bedtime');
      });

      expect(result.current.tips.length).toBeGreaterThan(0);
      result.current.tips.forEach((tip) => {
        expect(tip.category).toBe('bedtime');
      });
    });

    it('returns all tips when set back to all', () => {
      const { result } = renderHook(() => useParentTips());

      act(() => {
        result.current.filterByCategory('expert');
      });

      act(() => {
        result.current.filterByCategory('all');
      });

      expect(result.current.tips).toHaveLength(10);
    });
  });

  describe('saveTip', () => {
    it('adds tip to saved tips in DB', async () => {
      mocks.mockSavedTipsFirst.mockResolvedValue(undefined);

      const { result } = renderHook(() => useParentTips());

      await act(async () => {
        await result.current.saveTip('tip-001');
      });

      expect(mocks.mockSavedTipsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          tipId: 'tip-001',
          savedAt: expect.any(Date),
        })
      );
    });

    it('does not add duplicate saved tip', async () => {
      mocks.mockSavedTipsFirst.mockResolvedValue({ playerId: 1, tipId: 'tip-001', savedAt: new Date() });

      const { result } = renderHook(() => useParentTips());

      await act(async () => {
        await result.current.saveTip('tip-001');
      });

      expect(mocks.mockSavedTipsAdd).not.toHaveBeenCalled();
    });

    it('does nothing when no player is set', async () => {
      mocks.mockPlayerId = undefined;
      const { result } = renderHook(() => useParentTips());

      await act(async () => {
        await result.current.saveTip('tip-001');
      });

      expect(mocks.mockSavedTipsAdd).not.toHaveBeenCalled();
    });
  });

  describe('unsaveTip', () => {
    it('deletes tip from saved tips in DB', async () => {
      const { result } = renderHook(() => useParentTips());

      await act(async () => {
        await result.current.unsaveTip('tip-003');
      });

      expect(mocks.mockSavedTipsDelete).toHaveBeenCalled();
    });

    it('does nothing when no player is set', async () => {
      mocks.mockPlayerId = undefined;
      const { result } = renderHook(() => useParentTips());

      await act(async () => {
        await result.current.unsaveTip('tip-003');
      });

      expect(mocks.mockSavedTipsDelete).not.toHaveBeenCalled();
    });
  });

  describe('savedTips', () => {
    it('returns empty array when no tips are saved', () => {
      const { result } = renderHook(() => useParentTips());
      expect(result.current.savedTips).toEqual([]);
    });

    it('returns saved tips resolved from tip data', () => {
      mocks.mockSavedTipRecords = [
        { playerId: 1, tipId: 'tip-001', savedAt: new Date() },
        { playerId: 1, tipId: 'tip-005', savedAt: new Date() },
      ];

      const { result } = renderHook(() => useParentTips());
      expect(result.current.savedTips).toHaveLength(2);
      expect(result.current.savedTips[0].id).toBe('tip-001');
      expect(result.current.savedTips[1].id).toBe('tip-005');
    });
  });

  describe('isSaved', () => {
    it('returns false when tip is not saved', () => {
      const { result } = renderHook(() => useParentTips());
      expect(result.current.isSaved('tip-001')).toBe(false);
    });

    it('returns true when tip is saved', () => {
      mocks.mockSavedTipRecords = [
        { playerId: 1, tipId: 'tip-001', savedAt: new Date() },
      ];

      const { result } = renderHook(() => useParentTips());
      expect(result.current.isSaved('tip-001')).toBe(true);
    });

    it('returns false for an unsaved tip when others are saved', () => {
      mocks.mockSavedTipRecords = [
        { playerId: 1, tipId: 'tip-001', savedAt: new Date() },
      ];

      const { result } = renderHook(() => useParentTips());
      expect(result.current.isSaved('tip-002')).toBe(false);
    });
  });
});
