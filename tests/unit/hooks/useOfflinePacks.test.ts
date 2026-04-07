import { renderHook, act } from '@testing-library/react';
import { useOfflinePacks } from '../../../src/hooks/useOfflinePacks';

const mocks = vi.hoisted(() => ({
  mockOfflinePacks: [
    { id: 'pack-road-trip', title: 'Road Trip', emoji: '🚗', contentIds: ['game:memory-match'], sizeEstimateMB: 2, ageGroup: '2-3' },
    { id: 'pack-bedtime', title: 'Bedtime', emoji: '🌙', contentIds: ['story:s-2-bed-1'], sizeEstimateMB: 1 },
    { id: 'pack-alphabet-starter', title: 'Alphabet Starter', emoji: '🔤', contentIds: ['lesson:l-2-abc-1'], sizeEstimateMB: 1, ageGroup: '2-3' },
  ],
}));

vi.mock('../../../src/registry/offlinePacksConfig', () => ({
  offlinePacks: mocks.mockOfflinePacks,
}));

describe('useOfflinePacks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('packs', () => {
    it('returns all available offline packs', () => {
      const { result } = renderHook(() => useOfflinePacks());
      expect(result.current.packs).toHaveLength(3);
    });

    it('packs have required fields', () => {
      const { result } = renderHook(() => useOfflinePacks());
      result.current.packs.forEach((pack) => {
        expect(pack.id).toBeTruthy();
        expect(pack.title).toBeTruthy();
        expect(pack.emoji).toBeTruthy();
        expect(pack.contentIds.length).toBeGreaterThan(0);
        expect(pack.sizeEstimateMB).toBeGreaterThan(0);
      });
    });
  });

  describe('getPackStatus', () => {
    it('returns available for all packs initially', () => {
      const { result } = renderHook(() => useOfflinePacks());
      expect(result.current.getPackStatus('pack-road-trip')).toBe('available');
      expect(result.current.getPackStatus('pack-bedtime')).toBe('available');
    });

    it('returns available for unknown pack ID', () => {
      const { result } = renderHook(() => useOfflinePacks());
      expect(result.current.getPackStatus('pack-unknown')).toBe('available');
    });
  });

  describe('getPackProgress', () => {
    it('returns 0 for all packs initially', () => {
      const { result } = renderHook(() => useOfflinePacks());
      expect(result.current.getPackProgress('pack-road-trip')).toBe(0);
    });

    it('returns 0 for unknown pack ID', () => {
      const { result } = renderHook(() => useOfflinePacks());
      expect(result.current.getPackProgress('pack-unknown')).toBe(0);
    });
  });

  describe('downloadPack', () => {
    it('sets status to downloading when download starts', async () => {
      const { result } = renderHook(() => useOfflinePacks());

      // Start the download but don't resolve timers yet
      act(() => {
        result.current.downloadPack('pack-road-trip');
      });

      expect(result.current.getPackStatus('pack-road-trip')).toBe('downloading');
    });

    it('completes download and sets status to ready', async () => {
      const { result } = renderHook(() => useOfflinePacks());

      await act(async () => {
        const downloadPromise = result.current.downloadPack('pack-road-trip');
        // Advance all timers to complete the simulated download
        await vi.runAllTimersAsync();
        await downloadPromise;
      });

      expect(result.current.getPackStatus('pack-road-trip')).toBe('ready');
      expect(result.current.getPackProgress('pack-road-trip')).toBe(100);
    });

    it('does nothing if pack is already downloading', async () => {
      const { result } = renderHook(() => useOfflinePacks());

      // Start first download
      act(() => {
        result.current.downloadPack('pack-road-trip');
      });

      // Try to start again while downloading
      await act(async () => {
        await result.current.downloadPack('pack-road-trip');
      });

      // Should still be downloading from the first call
      expect(result.current.getPackStatus('pack-road-trip')).toBe('downloading');
    });

    it('does nothing if pack is already ready', async () => {
      const { result } = renderHook(() => useOfflinePacks());

      // Complete the download
      await act(async () => {
        const downloadPromise = result.current.downloadPack('pack-road-trip');
        await vi.runAllTimersAsync();
        await downloadPromise;
      });

      expect(result.current.getPackStatus('pack-road-trip')).toBe('ready');

      // Try to download again
      await act(async () => {
        await result.current.downloadPack('pack-road-trip');
      });

      // Should still be ready
      expect(result.current.getPackStatus('pack-road-trip')).toBe('ready');
    });

    it('does nothing for unknown pack ID', async () => {
      const { result } = renderHook(() => useOfflinePacks());

      await act(async () => {
        await result.current.downloadPack('pack-unknown');
      });

      // No crash, graceful no-op
      expect(result.current.getPackStatus('pack-unknown')).toBe('available');
    });
  });

  describe('removePack', () => {
    it('resets pack status to available', async () => {
      const { result } = renderHook(() => useOfflinePacks());

      // First download the pack
      await act(async () => {
        const downloadPromise = result.current.downloadPack('pack-bedtime');
        await vi.runAllTimersAsync();
        await downloadPromise;
      });

      expect(result.current.getPackStatus('pack-bedtime')).toBe('ready');

      // Now remove it
      await act(async () => {
        await result.current.removePack('pack-bedtime');
      });

      expect(result.current.getPackStatus('pack-bedtime')).toBe('available');
      expect(result.current.getPackProgress('pack-bedtime')).toBe(0);
    });

    it('does nothing for unknown pack ID', async () => {
      const { result } = renderHook(() => useOfflinePacks());

      await act(async () => {
        await result.current.removePack('pack-unknown');
      });

      // No crash
      expect(result.current.getPackStatus('pack-unknown')).toBe('available');
    });
  });

  describe('packStates', () => {
    it('initializes with all packs as available with 0 progress', () => {
      const { result } = renderHook(() => useOfflinePacks());
      const states = result.current.packStates;

      expect(states.size).toBe(3);
      for (const [, state] of states) {
        expect(state.status).toBe('available');
        expect(state.progress).toBe(0);
      }
    });

    it('each state includes the pack data', () => {
      const { result } = renderHook(() => useOfflinePacks());
      const roadTripState = result.current.packStates.get('pack-road-trip');

      expect(roadTripState).toBeDefined();
      expect(roadTripState!.pack.title).toBe('Road Trip');
      expect(roadTripState!.pack.emoji).toBe('🚗');
    });
  });
});
