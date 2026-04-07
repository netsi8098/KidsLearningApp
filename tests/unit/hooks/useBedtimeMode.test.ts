import { renderHook, act } from '@testing-library/react';
import { useBedtimeMode } from '../../../src/hooks/useBedtimeMode';

const mocks = vi.hoisted(() => ({
  mockBedtimeMode: false,
  mockSetBedtimeMode: vi.fn(),
  mockPlayerId: 1 as number | undefined,
  mockProfilesUpdate: vi.fn(),
}));

vi.mock('../../../src/context/AppContext', () => ({
  useApp: () => ({
    bedtimeMode: mocks.mockBedtimeMode,
    setBedtimeMode: mocks.mockSetBedtimeMode,
    currentPlayer: mocks.mockPlayerId ? { id: mocks.mockPlayerId } : null,
  }),
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    profiles: {
      update: mocks.mockProfilesUpdate,
    },
  },
}));

describe('useBedtimeMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockBedtimeMode = false;
    mocks.mockPlayerId = 1;
    mocks.mockProfilesUpdate.mockResolvedValue(1);
  });

  describe('isBedtime', () => {
    it('returns false when bedtime mode is off', () => {
      const { result } = renderHook(() => useBedtimeMode());
      expect(result.current.isBedtime).toBe(false);
    });

    it('returns true when bedtime mode is on', () => {
      mocks.mockBedtimeMode = true;
      const { result } = renderHook(() => useBedtimeMode());
      expect(result.current.isBedtime).toBe(true);
    });
  });

  describe('toggleBedtime', () => {
    it('calls setBedtimeMode with true when currently off', async () => {
      mocks.mockBedtimeMode = false;
      const { result } = renderHook(() => useBedtimeMode());

      await act(async () => {
        await result.current.toggleBedtime();
      });

      expect(mocks.mockSetBedtimeMode).toHaveBeenCalledWith(true);
    });

    it('calls setBedtimeMode with false when currently on', async () => {
      mocks.mockBedtimeMode = true;
      const { result } = renderHook(() => useBedtimeMode());

      await act(async () => {
        await result.current.toggleBedtime();
      });

      expect(mocks.mockSetBedtimeMode).toHaveBeenCalledWith(false);
    });

    it('persists bedtime mode to player profile in DB', async () => {
      mocks.mockBedtimeMode = false;
      const { result } = renderHook(() => useBedtimeMode());

      await act(async () => {
        await result.current.toggleBedtime();
      });

      expect(mocks.mockProfilesUpdate).toHaveBeenCalledWith(1, { bedtimeMode: true });
    });

    it('persists false when toggling off', async () => {
      mocks.mockBedtimeMode = true;
      const { result } = renderHook(() => useBedtimeMode());

      await act(async () => {
        await result.current.toggleBedtime();
      });

      expect(mocks.mockProfilesUpdate).toHaveBeenCalledWith(1, { bedtimeMode: false });
    });

    it('does not update DB when no player is set', async () => {
      mocks.mockPlayerId = undefined;
      const { result } = renderHook(() => useBedtimeMode());

      await act(async () => {
        await result.current.toggleBedtime();
      });

      expect(mocks.mockSetBedtimeMode).toHaveBeenCalledWith(true);
      expect(mocks.mockProfilesUpdate).not.toHaveBeenCalled();
    });

    it('still calls setBedtimeMode even without a player', async () => {
      mocks.mockPlayerId = undefined;
      mocks.mockBedtimeMode = false;
      const { result } = renderHook(() => useBedtimeMode());

      await act(async () => {
        await result.current.toggleBedtime();
      });

      expect(mocks.mockSetBedtimeMode).toHaveBeenCalledWith(true);
    });
  });

  describe('return shape', () => {
    it('returns isBedtime boolean and toggleBedtime function', () => {
      const { result } = renderHook(() => useBedtimeMode());
      expect(typeof result.current.isBedtime).toBe('boolean');
      expect(typeof result.current.toggleBedtime).toBe('function');
    });

    it('returns exactly 2 properties', () => {
      const { result } = renderHook(() => useBedtimeMode());
      expect(Object.keys(result.current)).toHaveLength(2);
    });
  });
});
