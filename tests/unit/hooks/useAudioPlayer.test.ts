import { renderHook, act } from '@testing-library/react';
import { useAudioPlayer } from '../../../src/hooks/useAudioPlayer';
import type { AudioEpisode } from '../../../src/data/audioData';

// Mock SpeechSynthesisUtterance (not provided by jsdom)
class MockUtterance {
  text: string;
  rate = 1;
  pitch = 1;
  volume = 1;
  voice: SpeechSynthesisVoice | null = null;
  lang = '';
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}
globalThis.SpeechSynthesisUtterance = MockUtterance as unknown as typeof SpeechSynthesisUtterance;

const mocks = vi.hoisted(() => ({
  mockPlayerId: 1 as number | undefined,
  mockAudioProgressFirst: vi.fn(),
  mockAudioProgressAdd: vi.fn(),
  mockAudioProgressUpdate: vi.fn(),
  mockSpeechSpeak: vi.fn(),
  mockSpeechCancel: vi.fn(),
  mockSpeechPause: vi.fn(),
  mockSpeechResume: vi.fn(),
  mockGetVoices: vi.fn(() => []),
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    audioProgress: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          first: mocks.mockAudioProgressFirst,
        })),
      })),
      add: mocks.mockAudioProgressAdd,
      update: mocks.mockAudioProgressUpdate,
    },
  },
}));

const makeMockEpisode = (overrides = {}): AudioEpisode => ({
  id: 'bs-1',
  title: 'The Sleepy Bear',
  emoji: 'Bear',
  category: 'bedtime-stories',
  ageGroup: '2-3',
  duration: '3:00',
  ttsText: 'Once upon a time there was a sleepy bear who loved to nap under the stars.',
  ...overrides,
});

describe('useAudioPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mocks.mockPlayerId = 1;
    mocks.mockAudioProgressFirst.mockResolvedValue(undefined);
    mocks.mockAudioProgressAdd.mockResolvedValue(1);

    // Reassign methods on the existing speechSynthesis mock (set up by vitest.setup.ts)
    window.speechSynthesis.speak = mocks.mockSpeechSpeak;
    window.speechSynthesis.cancel = mocks.mockSpeechCancel;
    window.speechSynthesis.pause = mocks.mockSpeechPause;
    window.speechSynthesis.resume = mocks.mockSpeechResume;
    window.speechSynthesis.getVoices = mocks.mockGetVoices;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('returns isPlaying as false initially', () => {
      const { result } = renderHook(() => useAudioPlayer(1));
      expect(result.current.isPlaying).toBe(false);
    });

    it('returns currentEpisode as null initially', () => {
      const { result } = renderHook(() => useAudioPlayer(1));
      expect(result.current.currentEpisode).toBeNull();
    });

    it('returns playbackSpeed as 1 initially', () => {
      const { result } = renderHook(() => useAudioPlayer(1));
      expect(result.current.playbackSpeed).toBe(1);
    });

    it('returns sleepTimerMinutes as null initially', () => {
      const { result } = renderHook(() => useAudioPlayer(1));
      expect(result.current.sleepTimerMinutes).toBeNull();
    });

    it('returns all expected functions and properties', () => {
      const { result } = renderHook(() => useAudioPlayer(1));
      expect(result.current.playEpisode).toBeInstanceOf(Function);
      expect(result.current.pause).toBeInstanceOf(Function);
      expect(result.current.resume).toBeInstanceOf(Function);
      expect(result.current.setSpeed).toBeInstanceOf(Function);
      expect(result.current.setSleepTimer).toBeInstanceOf(Function);
      expect(result.current.markComplete).toBeInstanceOf(Function);
    });
  });

  describe('playEpisode', () => {
    it('sets isPlaying to true and currentEpisode', () => {
      const { result } = renderHook(() => useAudioPlayer(1));
      const episode = makeMockEpisode();

      act(() => {
        result.current.playEpisode(episode);
      });

      expect(result.current.isPlaying).toBe(true);
      expect(result.current.currentEpisode).toEqual(episode);
    });

    it('cancels any existing speech before starting new', () => {
      const { result } = renderHook(() => useAudioPlayer(1));
      const episode = makeMockEpisode();

      act(() => {
        result.current.playEpisode(episode);
      });

      expect(mocks.mockSpeechCancel).toHaveBeenCalled();
      expect(mocks.mockSpeechSpeak).toHaveBeenCalled();
    });

    it('saves initial progress when playing', async () => {
      const { result } = renderHook(() => useAudioPlayer(1));
      const episode = makeMockEpisode();

      await act(async () => {
        result.current.playEpisode(episode);
      });

      expect(mocks.mockAudioProgressAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          episodeId: 'bs-1',
          completed: false,
        })
      );
    });
  });

  describe('pause', () => {
    it('pauses speech synthesis and sets isPlaying to false', () => {
      const { result } = renderHook(() => useAudioPlayer(1));

      act(() => {
        result.current.playEpisode(makeMockEpisode());
      });

      act(() => {
        result.current.pause();
      });

      expect(mocks.mockSpeechPause).toHaveBeenCalled();
      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('resume', () => {
    it('resumes speech synthesis and sets isPlaying to true', () => {
      const { result } = renderHook(() => useAudioPlayer(1));

      act(() => {
        result.current.playEpisode(makeMockEpisode());
      });
      act(() => {
        result.current.pause();
      });
      act(() => {
        result.current.resume();
      });

      expect(mocks.mockSpeechResume).toHaveBeenCalled();
      expect(result.current.isPlaying).toBe(true);
    });
  });

  describe('setSpeed', () => {
    it('updates playback speed', () => {
      const { result } = renderHook(() => useAudioPlayer(1));

      act(() => {
        result.current.setSpeed(1.5);
      });

      expect(result.current.playbackSpeed).toBe(1.5);
    });
  });

  describe('setSleepTimer', () => {
    it('sets the sleep timer minutes', () => {
      const { result } = renderHook(() => useAudioPlayer(1));

      act(() => {
        result.current.setSleepTimer(15);
      });

      expect(result.current.sleepTimerMinutes).toBe(15);
    });

    it('clears sleep timer when set to null', () => {
      const { result } = renderHook(() => useAudioPlayer(1));

      act(() => {
        result.current.setSleepTimer(10);
      });
      act(() => {
        result.current.setSleepTimer(null);
      });

      expect(result.current.sleepTimerMinutes).toBeNull();
    });
  });

  describe('markComplete', () => {
    it('saves completed progress for episode', async () => {
      mocks.mockAudioProgressFirst.mockResolvedValue(undefined);
      const { result } = renderHook(() => useAudioPlayer(1));

      await act(async () => {
        await result.current.markComplete('bs-1');
      });

      expect(mocks.mockAudioProgressAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          episodeId: 'bs-1',
          completed: true,
        })
      );
    });

    it('updates existing progress to completed', async () => {
      mocks.mockAudioProgressFirst.mockResolvedValue({
        id: 5,
        playerId: 1,
        episodeId: 'bs-1',
        completed: false,
        currentTime: 0,
        duration: 0,
        favorite: false,
        lastListenedAt: new Date(),
      });

      const { result } = renderHook(() => useAudioPlayer(1));

      await act(async () => {
        await result.current.markComplete('bs-1');
      });

      expect(mocks.mockAudioProgressUpdate).toHaveBeenCalledWith(
        5,
        expect.objectContaining({
          completed: true,
          lastListenedAt: expect.any(Date),
        })
      );
    });

    it('does nothing when no player is set', async () => {
      const { result } = renderHook(() => useAudioPlayer(undefined));

      await act(async () => {
        await result.current.markComplete('bs-1');
      });

      expect(mocks.mockAudioProgressAdd).not.toHaveBeenCalled();
      expect(mocks.mockAudioProgressUpdate).not.toHaveBeenCalled();
    });
  });

  describe('cleanup on unmount', () => {
    it('cancels speech synthesis on unmount', () => {
      const { unmount } = renderHook(() => useAudioPlayer(1));
      unmount();

      expect(mocks.mockSpeechCancel).toHaveBeenCalled();
    });
  });
});
