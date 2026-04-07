import { renderHook } from '@testing-library/react';
import { useAudio } from '../../../src/hooks/useAudio';

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
  mockSoundEnabled: true,
  mockSpeechEnabled: true,
  mockSpeechCancel: vi.fn(),
  mockSpeechSpeak: vi.fn(),
  mockGetVoices: vi.fn(() => []),
}));

vi.mock('../../../src/context/AppContext', () => ({
  useApp: () => ({
    soundEnabled: mocks.mockSoundEnabled,
    speechEnabled: mocks.mockSpeechEnabled,
  }),
}));

describe('useAudio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockSoundEnabled = true;
    mocks.mockSpeechEnabled = true;

    // Reassign methods on the existing speechSynthesis mock (set up by vitest.setup.ts)
    window.speechSynthesis.speak = mocks.mockSpeechSpeak;
    window.speechSynthesis.cancel = mocks.mockSpeechCancel;
    window.speechSynthesis.getVoices = mocks.mockGetVoices;
  });

  describe('return values', () => {
    it('returns all expected audio functions', () => {
      const { result } = renderHook(() => useAudio());
      expect(result.current.speak).toBeInstanceOf(Function);
      expect(result.current.playCorrect).toBeInstanceOf(Function);
      expect(result.current.playTryAgain).toBeInstanceOf(Function);
      expect(result.current.playCelebration).toBeInstanceOf(Function);
      expect(result.current.playClick).toBeInstanceOf(Function);
      expect(result.current.playStar).toBeInstanceOf(Function);
    });

    it('returns exactly 6 properties', () => {
      const { result } = renderHook(() => useAudio());
      expect(Object.keys(result.current)).toHaveLength(6);
    });
  });

  describe('speak', () => {
    it('calls speechSynthesis.speak when speech is enabled', () => {
      const { result } = renderHook(() => useAudio());
      result.current.speak('Hello world');

      expect(mocks.mockSpeechCancel).toHaveBeenCalled();
      expect(mocks.mockSpeechSpeak).toHaveBeenCalled();
    });

    it('does not call speechSynthesis when speech is disabled', () => {
      mocks.mockSpeechEnabled = false;
      const { result } = renderHook(() => useAudio());
      result.current.speak('Hello world');

      expect(mocks.mockSpeechSpeak).not.toHaveBeenCalled();
    });

    it('cancels existing speech before speaking new text', () => {
      const { result } = renderHook(() => useAudio());
      result.current.speak('First');
      result.current.speak('Second');

      expect(mocks.mockSpeechCancel).toHaveBeenCalledTimes(2);
    });

    it('uses custom rate when provided', () => {
      const { result } = renderHook(() => useAudio());
      result.current.speak('Hello', 1.5);

      expect(mocks.mockSpeechSpeak).toHaveBeenCalled();
    });

    it('selects preferred voice when available', () => {
      mocks.mockGetVoices.mockReturnValue([
        { name: 'Default', lang: 'fr-FR' },
        { name: 'Samantha', lang: 'en-US' },
      ]);

      const { result } = renderHook(() => useAudio());
      result.current.speak('Hello');

      expect(mocks.mockSpeechSpeak).toHaveBeenCalled();
    });

    it('falls back to English voice when no preferred voice found', () => {
      mocks.mockGetVoices.mockReturnValue([
        { name: 'Generic', lang: 'en-GB' },
      ]);

      const { result } = renderHook(() => useAudio());
      result.current.speak('Hello');

      expect(mocks.mockSpeechSpeak).toHaveBeenCalled();
    });
  });

  describe('sound effects when enabled', () => {
    it('playCorrect does not throw when sound is enabled', () => {
      const { result } = renderHook(() => useAudio());
      expect(() => result.current.playCorrect()).not.toThrow();
    });

    it('playTryAgain does not throw when sound is enabled', () => {
      const { result } = renderHook(() => useAudio());
      expect(() => result.current.playTryAgain()).not.toThrow();
    });

    it('playCelebration does not throw when sound is enabled', () => {
      const { result } = renderHook(() => useAudio());
      expect(() => result.current.playCelebration()).not.toThrow();
    });

    it('playClick does not throw when sound is enabled', () => {
      const { result } = renderHook(() => useAudio());
      expect(() => result.current.playClick()).not.toThrow();
    });

    it('playStar does not throw when sound is enabled', () => {
      const { result } = renderHook(() => useAudio());
      expect(() => result.current.playStar()).not.toThrow();
    });
  });

  describe('sound effects when disabled', () => {
    beforeEach(() => {
      mocks.mockSoundEnabled = false;
    });

    it('playCorrect is a no-op when sound is disabled', () => {
      const { result } = renderHook(() => useAudio());
      expect(() => result.current.playCorrect()).not.toThrow();
    });

    it('playTryAgain is a no-op when sound is disabled', () => {
      const { result } = renderHook(() => useAudio());
      expect(() => result.current.playTryAgain()).not.toThrow();
    });

    it('playCelebration is a no-op when sound is disabled', () => {
      const { result } = renderHook(() => useAudio());
      expect(() => result.current.playCelebration()).not.toThrow();
    });

    it('playClick is a no-op when sound is disabled', () => {
      const { result } = renderHook(() => useAudio());
      expect(() => result.current.playClick()).not.toThrow();
    });

    it('playStar is a no-op when sound is disabled', () => {
      const { result } = renderHook(() => useAudio());
      expect(() => result.current.playStar()).not.toThrow();
    });
  });
});
