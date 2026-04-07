import { renderHook, act } from '@testing-library/react';
import { useErrorReporter } from '../../../src/hooks/useErrorReporter';

const mocks = vi.hoisted(() => ({
  mockErrorLogsAdd: vi.fn(),
  mockErrorLogsCount: vi.fn(),
  mockErrorLogsClear: vi.fn(),
  mockErrorLogsBulkDelete: vi.fn(),
  mockOldestToArray: vi.fn(),
  mockLastErrors: [] as { id: number; message: string; reportedAt: Date }[],
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => mocks.mockLastErrors,
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    errorLogs: {
      orderBy: vi.fn(() => ({
        reverse: vi.fn(() => ({
          limit: vi.fn(() => ({
            toArray: vi.fn(() => Promise.resolve(mocks.mockLastErrors)),
          })),
        })),
        limit: vi.fn(() => ({
          toArray: mocks.mockOldestToArray,
        })),
      })),
      add: mocks.mockErrorLogsAdd,
      count: mocks.mockErrorLogsCount,
      clear: mocks.mockErrorLogsClear,
      bulkDelete: mocks.mockErrorLogsBulkDelete,
    },
  },
}));

describe('useErrorReporter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockLastErrors = [];
    mocks.mockErrorLogsAdd.mockResolvedValue(1);
    mocks.mockErrorLogsCount.mockResolvedValue(0);
    mocks.mockOldestToArray.mockResolvedValue([]);
  });

  describe('reportError', () => {
    it('stores Error objects with message and stack', async () => {
      const { result } = renderHook(() => useErrorReporter());
      const testError = new Error('Something went wrong');

      await act(async () => {
        await result.current.reportError(testError);
      });

      expect(mocks.mockErrorLogsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Something went wrong',
          stack: expect.any(String),
          reportedAt: expect.any(Date),
        })
      );
    });

    it('stores string errors by wrapping in Error object', async () => {
      const { result } = renderHook(() => useErrorReporter());

      await act(async () => {
        await result.current.reportError('A string error message');
      });

      expect(mocks.mockErrorLogsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'A string error message',
          reportedAt: expect.any(Date),
        })
      );
    });

    it('stores Error with context', async () => {
      const { result } = renderHook(() => useErrorReporter());
      const testError = new Error('DB error');

      await act(async () => {
        await result.current.reportError(testError, 'useSync.triggerSync');
      });

      expect(mocks.mockErrorLogsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'DB error',
          context: 'useSync.triggerSync',
        })
      );
    });

    it('stores string error with context', async () => {
      const { result } = renderHook(() => useErrorReporter());

      await act(async () => {
        await result.current.reportError('network failure', 'API call');
      });

      expect(mocks.mockErrorLogsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'network failure',
          context: 'API call',
        })
      );
    });

    it('stores error without context when not provided', async () => {
      const { result } = renderHook(() => useErrorReporter());

      await act(async () => {
        await result.current.reportError(new Error('no context'));
      });

      expect(mocks.mockErrorLogsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'no context',
          context: undefined,
        })
      );
    });

    it('auto-trims when exceeding 50 entries', async () => {
      mocks.mockErrorLogsCount.mockResolvedValue(55);
      const oldEntries = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
      ];
      mocks.mockOldestToArray.mockResolvedValue(oldEntries);

      const { result } = renderHook(() => useErrorReporter());

      await act(async () => {
        await result.current.reportError(new Error('trim test'));
      });

      expect(mocks.mockErrorLogsBulkDelete).toHaveBeenCalledWith([1, 2, 3, 4, 5]);
    });

    it('does not trim when at or below 50 entries', async () => {
      mocks.mockErrorLogsCount.mockResolvedValue(50);

      const { result } = renderHook(() => useErrorReporter());

      await act(async () => {
        await result.current.reportError(new Error('no trim'));
      });

      expect(mocks.mockErrorLogsBulkDelete).not.toHaveBeenCalled();
    });

    it('does not trim when count is less than 50', async () => {
      mocks.mockErrorLogsCount.mockResolvedValue(10);

      const { result } = renderHook(() => useErrorReporter());

      await act(async () => {
        await result.current.reportError(new Error('small count'));
      });

      expect(mocks.mockErrorLogsBulkDelete).not.toHaveBeenCalled();
    });
  });

  describe('clearErrors', () => {
    it('clears all error logs', async () => {
      const { result } = renderHook(() => useErrorReporter());

      await act(async () => {
        await result.current.clearErrors();
      });

      expect(mocks.mockErrorLogsClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('lastErrors', () => {
    it('returns empty array when no errors', () => {
      mocks.mockLastErrors = [];
      const { result } = renderHook(() => useErrorReporter());
      expect(result.current.lastErrors).toEqual([]);
    });

    it('returns recent errors from DB', () => {
      mocks.mockLastErrors = [
        { id: 1, message: 'Error 1', reportedAt: new Date() },
        { id: 2, message: 'Error 2', reportedAt: new Date() },
      ];

      const { result } = renderHook(() => useErrorReporter());
      expect(result.current.lastErrors).toHaveLength(2);
      expect(result.current.lastErrors[0].message).toBe('Error 1');
    });
  });
});
