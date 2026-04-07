import { renderHook, act } from '@testing-library/react';
import { useBedtimeSession } from '../../../src/hooks/useBedtimeSession';

const mocks = vi.hoisted(() => ({
  mockPlayerId: 1 as number | undefined,
  mockTonightSession: undefined as {
    id?: number;
    playerId: number;
    date: string;
    storyId?: string;
    breathingExercise?: string;
    calmSoundPlayed: boolean;
    startedAt: Date;
    completedAt?: Date;
  } | undefined,
  mockBedtimeSessionsAdd: vi.fn(),
  mockBedtimeSessionsUpdate: vi.fn(),
  mockBedtimeSessionsFirst: vi.fn(),
  mockBedtimeSessionsLast: vi.fn(),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => mocks.mockTonightSession,
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    bedtimeSessions: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          first: mocks.mockBedtimeSessionsFirst,
          last: mocks.mockBedtimeSessionsLast,
        })),
      })),
      add: mocks.mockBedtimeSessionsAdd,
      update: mocks.mockBedtimeSessionsUpdate,
    },
  },
}));

describe('useBedtimeSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockPlayerId = 1;
    mocks.mockTonightSession = undefined;
    mocks.mockBedtimeSessionsFirst.mockResolvedValue(undefined);
    mocks.mockBedtimeSessionsLast.mockResolvedValue(undefined);
    mocks.mockBedtimeSessionsAdd.mockResolvedValue(1);
  });

  describe('tonightSession', () => {
    it('returns undefined when no session exists', () => {
      const { result } = renderHook(() => useBedtimeSession(1));
      expect(result.current.tonightSession).toBeUndefined();
    });

    it('returns current session from live query', () => {
      const session = {
        id: 1,
        playerId: 1,
        date: new Date().toISOString().slice(0, 10),
        calmSoundPlayed: false,
        startedAt: new Date(),
      };
      mocks.mockTonightSession = session;

      const { result } = renderHook(() => useBedtimeSession(1));
      expect(result.current.tonightSession).toEqual(session);
    });
  });

  describe('startSession', () => {
    it('does nothing when no player is set', async () => {
      const { result } = renderHook(() => useBedtimeSession(undefined));

      await act(async () => {
        await result.current.startSession();
      });

      expect(mocks.mockBedtimeSessionsAdd).not.toHaveBeenCalled();
    });

    it('creates new session when none exists for today', async () => {
      mocks.mockBedtimeSessionsFirst.mockResolvedValue(undefined);
      const { result } = renderHook(() => useBedtimeSession(1));

      await act(async () => {
        await result.current.startSession();
      });

      expect(mocks.mockBedtimeSessionsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          date: expect.any(String),
          calmSoundPlayed: false,
          startedAt: expect.any(Date),
        })
      );
    });

    it('returns existing session when one already exists for today', async () => {
      const existingSession = {
        id: 5,
        playerId: 1,
        date: new Date().toISOString().slice(0, 10),
        calmSoundPlayed: true,
        startedAt: new Date(),
      };
      mocks.mockBedtimeSessionsFirst.mockResolvedValue(existingSession);

      const { result } = renderHook(() => useBedtimeSession(1));

      let returnedSession: unknown;
      await act(async () => {
        returnedSession = await result.current.startSession();
      });

      expect(returnedSession).toEqual(existingSession);
      expect(mocks.mockBedtimeSessionsAdd).not.toHaveBeenCalled();
    });

    it('returns new session object with generated id', async () => {
      mocks.mockBedtimeSessionsFirst.mockResolvedValue(undefined);
      mocks.mockBedtimeSessionsAdd.mockResolvedValue(42);
      const { result } = renderHook(() => useBedtimeSession(1));

      let returnedSession: unknown;
      await act(async () => {
        returnedSession = await result.current.startSession();
      });

      expect(returnedSession).toEqual(
        expect.objectContaining({
          id: 42,
          playerId: 1,
          calmSoundPlayed: false,
        })
      );
    });
  });

  describe('recordStory', () => {
    it('does nothing when no player is set', async () => {
      const { result } = renderHook(() => useBedtimeSession(undefined));

      await act(async () => {
        await result.current.recordStory('story-1');
      });

      expect(mocks.mockBedtimeSessionsUpdate).not.toHaveBeenCalled();
    });

    it('updates session with storyId', async () => {
      mocks.mockBedtimeSessionsLast.mockResolvedValue({
        id: 10,
        playerId: 1,
        date: new Date().toISOString().slice(0, 10),
        calmSoundPlayed: false,
        startedAt: new Date(),
      });

      const { result } = renderHook(() => useBedtimeSession(1));

      await act(async () => {
        await result.current.recordStory('sleepy-bear');
      });

      expect(mocks.mockBedtimeSessionsUpdate).toHaveBeenCalledWith(10, { storyId: 'sleepy-bear' });
    });

    it('does nothing when no session exists for today', async () => {
      mocks.mockBedtimeSessionsLast.mockResolvedValue(undefined);
      const { result } = renderHook(() => useBedtimeSession(1));

      await act(async () => {
        await result.current.recordStory('story-1');
      });

      expect(mocks.mockBedtimeSessionsUpdate).not.toHaveBeenCalled();
    });
  });

  describe('recordBreathing', () => {
    it('does nothing when no player is set', async () => {
      const { result } = renderHook(() => useBedtimeSession(undefined));

      await act(async () => {
        await result.current.recordBreathing('breath-1');
      });

      expect(mocks.mockBedtimeSessionsUpdate).not.toHaveBeenCalled();
    });

    it('updates session with breathing exercise id', async () => {
      mocks.mockBedtimeSessionsLast.mockResolvedValue({
        id: 10,
        playerId: 1,
        date: new Date().toISOString().slice(0, 10),
        calmSoundPlayed: false,
        startedAt: new Date(),
      });

      const { result } = renderHook(() => useBedtimeSession(1));

      await act(async () => {
        await result.current.recordBreathing('deep-breaths');
      });

      expect(mocks.mockBedtimeSessionsUpdate).toHaveBeenCalledWith(10, { breathingExercise: 'deep-breaths' });
    });
  });

  describe('completeSession', () => {
    it('does nothing when no player is set', async () => {
      const { result } = renderHook(() => useBedtimeSession(undefined));

      await act(async () => {
        await result.current.completeSession();
      });

      expect(mocks.mockBedtimeSessionsUpdate).not.toHaveBeenCalled();
    });

    it('updates session with completedAt timestamp', async () => {
      mocks.mockBedtimeSessionsLast.mockResolvedValue({
        id: 10,
        playerId: 1,
        date: new Date().toISOString().slice(0, 10),
        calmSoundPlayed: false,
        startedAt: new Date(),
      });

      const { result } = renderHook(() => useBedtimeSession(1));

      await act(async () => {
        await result.current.completeSession();
      });

      expect(mocks.mockBedtimeSessionsUpdate).toHaveBeenCalledWith(10, {
        completedAt: expect.any(Date),
      });
    });

    it('does nothing when no session exists for today', async () => {
      mocks.mockBedtimeSessionsLast.mockResolvedValue(undefined);
      const { result } = renderHook(() => useBedtimeSession(1));

      await act(async () => {
        await result.current.completeSession();
      });

      expect(mocks.mockBedtimeSessionsUpdate).not.toHaveBeenCalled();
    });
  });

  describe('return shape', () => {
    it('returns all expected properties', () => {
      const { result } = renderHook(() => useBedtimeSession(1));
      expect(result.current).toHaveProperty('tonightSession');
      expect(result.current).toHaveProperty('startSession');
      expect(result.current).toHaveProperty('recordStory');
      expect(result.current).toHaveProperty('recordBreathing');
      expect(result.current).toHaveProperty('completeSession');
    });

    it('returns exactly 5 properties', () => {
      const { result } = renderHook(() => useBedtimeSession(1));
      expect(Object.keys(result.current)).toHaveLength(5);
    });
  });
});
