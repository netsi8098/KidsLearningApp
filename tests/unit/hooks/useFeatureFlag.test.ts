import { renderHook } from '@testing-library/react';
import { useFeatureFlag } from '../../../src/hooks/useFeatureFlag';

// Mock useLiveQuery to return controlled test data
let mockFlags: { key: string; enabled: boolean }[] = [];

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => mockFlags,
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    featureFlags: {
      toArray: vi.fn(() => Promise.resolve(mockFlags)),
    },
  },
}));

describe('useFeatureFlag', () => {
  beforeEach(() => {
    mockFlags = [];
  });

  describe('default flags', () => {
    it('returns true for routines by default', () => {
      const { result } = renderHook(() => useFeatureFlag());
      expect(result.current.isEnabled('routines')).toBe(true);
    });

    it('returns true for inbox by default', () => {
      const { result } = renderHook(() => useFeatureFlag());
      expect(result.current.isEnabled('inbox')).toBe(true);
    });

    it('returns true for billing by default', () => {
      const { result } = renderHook(() => useFeatureFlag());
      expect(result.current.isEnabled('billing')).toBe(true);
    });

    it('returns true for parent_tips by default', () => {
      const { result } = renderHook(() => useFeatureFlag());
      expect(result.current.isEnabled('parent_tips')).toBe(true);
    });

    it('returns true for help_center by default', () => {
      const { result } = renderHook(() => useFeatureFlag());
      expect(result.current.isEnabled('help_center')).toBe(true);
    });

    it('returns true for privacy_settings by default', () => {
      const { result } = renderHook(() => useFeatureFlag());
      expect(result.current.isEnabled('privacy_settings')).toBe(true);
    });

    it('returns true for deep_links by default', () => {
      const { result } = renderHook(() => useFeatureFlag());
      expect(result.current.isEnabled('deep_links')).toBe(true);
    });

    it('returns false for sync by default', () => {
      const { result } = renderHook(() => useFeatureFlag());
      expect(result.current.isEnabled('sync')).toBe(false);
    });

    it('returns true for performance_tracking by default', () => {
      const { result } = renderHook(() => useFeatureFlag());
      expect(result.current.isEnabled('performance_tracking')).toBe(true);
    });

    it('returns true for error_reporting by default', () => {
      const { result } = renderHook(() => useFeatureFlag());
      expect(result.current.isEnabled('error_reporting')).toBe(true);
    });
  });

  describe('DB overrides', () => {
    it('returns DB value when flag exists and is true', () => {
      mockFlags = [{ key: 'sync', enabled: true }];
      const { result } = renderHook(() => useFeatureFlag());
      expect(result.current.isEnabled('sync')).toBe(true);
    });

    it('returns DB value when flag exists and is false', () => {
      mockFlags = [{ key: 'routines', enabled: false }];
      const { result } = renderHook(() => useFeatureFlag());
      expect(result.current.isEnabled('routines')).toBe(false);
    });

    it('returns DB value overriding default true flag', () => {
      mockFlags = [{ key: 'inbox', enabled: false }];
      const { result } = renderHook(() => useFeatureFlag());
      expect(result.current.isEnabled('inbox')).toBe(false);
    });

    it('returns DB value overriding default false flag', () => {
      mockFlags = [{ key: 'sync', enabled: true }];
      const { result } = renderHook(() => useFeatureFlag());
      expect(result.current.isEnabled('sync')).toBe(true);
    });

    it('handles multiple flags in DB', () => {
      mockFlags = [
        { key: 'sync', enabled: true },
        { key: 'routines', enabled: false },
        { key: 'billing', enabled: true },
      ];
      const { result } = renderHook(() => useFeatureFlag());
      expect(result.current.isEnabled('sync')).toBe(true);
      expect(result.current.isEnabled('routines')).toBe(false);
      expect(result.current.isEnabled('billing')).toBe(true);
    });
  });

  describe('unknown flags', () => {
    it('returns false for completely unknown flag', () => {
      const { result } = renderHook(() => useFeatureFlag());
      expect(result.current.isEnabled('nonexistent_feature')).toBe(false);
    });

    it('returns false for empty string flag', () => {
      const { result } = renderHook(() => useFeatureFlag());
      expect(result.current.isEnabled('')).toBe(false);
    });

    it('returns DB value even for unknown flags if present in DB', () => {
      mockFlags = [{ key: 'custom_flag', enabled: true }];
      const { result } = renderHook(() => useFeatureFlag());
      expect(result.current.isEnabled('custom_flag')).toBe(true);
    });
  });
});
