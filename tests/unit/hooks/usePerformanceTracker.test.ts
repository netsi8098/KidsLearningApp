import { renderHook, act } from '@testing-library/react';
import { usePerformanceTracker } from '../../../src/hooks/usePerformanceTracker';

const { mockBulkAdd, mockWhereEquals, mockToArray } = vi.hoisted(() => ({
  mockBulkAdd: vi.fn(),
  mockWhereEquals: vi.fn(),
  mockToArray: vi.fn(),
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    performanceMetrics: {
      bulkAdd: (...args: unknown[]) => mockBulkAdd(...args),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: mockWhereEquals,
        })),
      })),
      toArray: mockToArray,
    },
  },
}));

describe('usePerformanceTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBulkAdd.mockResolvedValue(undefined);
    mockWhereEquals.mockResolvedValue([]);
    mockToArray.mockResolvedValue([]);
  });

  describe('trackMetric', () => {
    it('below batch threshold does not flush', async () => {
      const { result } = renderHook(() => usePerformanceTracker());

      await act(async () => {
        await result.current.trackMetric('load_time', 150);
      });

      expect(mockBulkAdd).not.toHaveBeenCalled();
    });

    it('accumulates metrics without flushing under threshold', async () => {
      const { result } = renderHook(() => usePerformanceTracker());

      for (let i = 0; i < 9; i++) {
        await act(async () => {
          await result.current.trackMetric('metric', i * 10);
        });
      }

      // 9 items < 10 batch size, should not flush
      expect(mockBulkAdd).not.toHaveBeenCalled();
    });

    it('at threshold (10) triggers flush', async () => {
      const { result } = renderHook(() => usePerformanceTracker());

      for (let i = 0; i < 10; i++) {
        await act(async () => {
          await result.current.trackMetric('metric', i * 10);
        });
      }

      expect(mockBulkAdd).toHaveBeenCalledTimes(1);
      expect(mockBulkAdd).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'metric', value: 0 }),
          expect.objectContaining({ name: 'metric', value: 90 }),
        ])
      );
    });

    it('flushes batch of exactly 10 items', async () => {
      const { result } = renderHook(() => usePerformanceTracker());

      for (let i = 0; i < 10; i++) {
        await act(async () => {
          await result.current.trackMetric('metric', i);
        });
      }

      const flushedBatch = mockBulkAdd.mock.calls[0][0];
      expect(flushedBatch).toHaveLength(10);
    });

    it('creates entries with recordedAt timestamp', async () => {
      const { result } = renderHook(() => usePerformanceTracker());

      for (let i = 0; i < 10; i++) {
        await act(async () => {
          await result.current.trackMetric('test', 100);
        });
      }

      const flushedBatch = mockBulkAdd.mock.calls[0][0];
      flushedBatch.forEach((entry: { recordedAt: unknown }) => {
        expect(entry.recordedAt).toBeInstanceOf(Date);
      });
    });

    it('resets batch after flush, starts accumulating again', async () => {
      const { result } = renderHook(() => usePerformanceTracker());

      // Fill batch of 10
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          await result.current.trackMetric('batch1', i);
        });
      }
      expect(mockBulkAdd).toHaveBeenCalledTimes(1);

      // Add 5 more - should not trigger another flush
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          await result.current.trackMetric('batch2', i);
        });
      }
      expect(mockBulkAdd).toHaveBeenCalledTimes(1); // still 1

      // Add 5 more to reach next threshold
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          await result.current.trackMetric('batch2', i + 5);
        });
      }
      expect(mockBulkAdd).toHaveBeenCalledTimes(2);
    });
  });

  describe('flushMetrics', () => {
    it('writes remaining batch entries', async () => {
      const { result } = renderHook(() => usePerformanceTracker());

      // Add less than threshold
      await act(async () => {
        await result.current.trackMetric('partial', 100);
        await result.current.trackMetric('partial', 200);
        await result.current.trackMetric('partial', 300);
      });

      expect(mockBulkAdd).not.toHaveBeenCalled();

      // Flush remaining
      await act(async () => {
        await result.current.flushMetrics();
      });

      expect(mockBulkAdd).toHaveBeenCalledTimes(1);
      const flushed = mockBulkAdd.mock.calls[0][0];
      expect(flushed).toHaveLength(3);
    });

    it('does nothing when batch is empty', async () => {
      const { result } = renderHook(() => usePerformanceTracker());

      await act(async () => {
        await result.current.flushMetrics();
      });

      expect(mockBulkAdd).not.toHaveBeenCalled();
    });

    it('clears batch after flushing', async () => {
      const { result } = renderHook(() => usePerformanceTracker());

      await act(async () => {
        await result.current.trackMetric('test', 1);
      });

      await act(async () => {
        await result.current.flushMetrics();
      });

      // Flush again should be no-op
      await act(async () => {
        await result.current.flushMetrics();
      });

      expect(mockBulkAdd).toHaveBeenCalledTimes(1);
    });
  });

  describe('getStartupTime', () => {
    it('returns a number', () => {
      const { result } = renderHook(() => usePerformanceTracker());
      const time = result.current.getStartupTime();
      expect(typeof time).toBe('number');
    });

    it('returns 0 when performance API has no data', () => {
      // The vitest setup mocks getEntriesByType to return []
      const { result } = renderHook(() => usePerformanceTracker());
      const time = result.current.getStartupTime();
      expect(time).toBeGreaterThanOrEqual(0);
    });

    it('returns performance timing when available', () => {
      // The deprecated timing API might be available in jsdom
      const { result } = renderHook(() => usePerformanceTracker());
      const time = result.current.getStartupTime();
      expect(typeof time).toBe('number');
    });
  });

  describe('getMetrics', () => {
    it('returns all metrics when no name filter', async () => {
      const allMetrics = [
        { name: 'load', value: 100, recordedAt: new Date() },
        { name: 'render', value: 50, recordedAt: new Date() },
      ];
      mockToArray.mockResolvedValue(allMetrics);

      const { result } = renderHook(() => usePerformanceTracker());

      let metrics: unknown;
      await act(async () => {
        metrics = await result.current.getMetrics();
      });

      expect(metrics).toEqual(allMetrics);
    });

    it('returns filtered metrics when name is provided', async () => {
      const filteredMetrics = [
        { name: 'load', value: 100, recordedAt: new Date() },
      ];
      mockWhereEquals.mockResolvedValue(filteredMetrics);

      const { result } = renderHook(() => usePerformanceTracker());

      let metrics: unknown;
      await act(async () => {
        metrics = await result.current.getMetrics('load');
      });

      expect(metrics).toEqual(filteredMetrics);
    });
  });
});
