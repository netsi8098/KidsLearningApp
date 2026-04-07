import { renderHook } from '@testing-library/react';
import { useEntitlement } from '../../../src/hooks/useEntitlement';

// Mock useSubscription to control isPremium and isTrialing
const mockSubscriptionState = {
  plan: 'free' as 'free' | 'trial' | 'premium',
  status: 'active' as 'active' | 'cancelled' | 'expired',
  trialDaysLeft: 0,
  isPremium: false,
  isTrialing: false,
  subscription: undefined,
};

vi.mock('../../../src/hooks/useSubscription', () => ({
  useSubscription: () => mockSubscriptionState,
}));

describe('useEntitlement', () => {
  beforeEach(() => {
    // Reset to free plan defaults
    mockSubscriptionState.plan = 'free';
    mockSubscriptionState.status = 'active';
    mockSubscriptionState.trialDaysLeft = 0;
    mockSubscriptionState.isPremium = false;
    mockSubscriptionState.isTrialing = false;
    mockSubscriptionState.subscription = undefined;
  });

  describe('free plan', () => {
    it('returns true for free features regardless of plan', () => {
      const { result } = renderHook(() => useEntitlement());

      // Features not in premiumFeatures set are free
      expect(result.current.hasEntitlement('basic_content')).toBe(true);
      expect(result.current.hasEntitlement('some_random_feature')).toBe(true);
      expect(result.current.hasEntitlement('play_games')).toBe(true);
    });

    it('returns false for premium features on free plan', () => {
      const { result } = renderHook(() => useEntitlement());

      expect(result.current.hasEntitlement('offline_packs')).toBe(false);
      expect(result.current.hasEntitlement('all_content')).toBe(false);
      expect(result.current.hasEntitlement('multiple_profiles')).toBe(false);
      expect(result.current.hasEntitlement('no_ads')).toBe(false);
      expect(result.current.hasEntitlement('advanced_reports')).toBe(false);
      expect(result.current.hasEntitlement('custom_routines')).toBe(false);
      expect(result.current.hasEntitlement('export_data')).toBe(false);
      expect(result.current.hasEntitlement('priority_support')).toBe(false);
    });

    it('returns false for unknown features that are not in premium set', () => {
      const { result } = renderHook(() => useEntitlement());

      // Unknown features not in premiumFeatures -> treated as free
      expect(result.current.hasEntitlement('nonexistent_feature')).toBe(true);
    });
  });

  describe('trial plan', () => {
    beforeEach(() => {
      mockSubscriptionState.plan = 'trial';
      mockSubscriptionState.isTrialing = true;
      mockSubscriptionState.trialDaysLeft = 7;
    });

    it('returns true for trial-included features during active trial', () => {
      const { result } = renderHook(() => useEntitlement());

      expect(result.current.hasEntitlement('all_content')).toBe(true);
      expect(result.current.hasEntitlement('multiple_profiles')).toBe(true);
      expect(result.current.hasEntitlement('advanced_reports')).toBe(true);
      expect(result.current.hasEntitlement('custom_routines')).toBe(true);
    });

    it('returns false for premium-only features during trial', () => {
      const { result } = renderHook(() => useEntitlement());

      expect(result.current.hasEntitlement('offline_packs')).toBe(false);
      expect(result.current.hasEntitlement('no_ads')).toBe(false);
      expect(result.current.hasEntitlement('export_data')).toBe(false);
      expect(result.current.hasEntitlement('priority_support')).toBe(false);
    });

    it('returns true for free features during trial', () => {
      const { result } = renderHook(() => useEntitlement());

      expect(result.current.hasEntitlement('basic_content')).toBe(true);
      expect(result.current.hasEntitlement('play_games')).toBe(true);
    });

    it('returns false for trial features when trial has expired (isTrialing false)', () => {
      mockSubscriptionState.isTrialing = false;
      mockSubscriptionState.trialDaysLeft = 0;

      const { result } = renderHook(() => useEntitlement());

      expect(result.current.hasEntitlement('all_content')).toBe(false);
      expect(result.current.hasEntitlement('multiple_profiles')).toBe(false);
    });
  });

  describe('premium plan', () => {
    beforeEach(() => {
      mockSubscriptionState.plan = 'premium';
      mockSubscriptionState.status = 'active';
      mockSubscriptionState.isPremium = true;
    });

    it('returns true for all features on premium plan', () => {
      const { result } = renderHook(() => useEntitlement());

      // Premium features
      expect(result.current.hasEntitlement('offline_packs')).toBe(true);
      expect(result.current.hasEntitlement('all_content')).toBe(true);
      expect(result.current.hasEntitlement('multiple_profiles')).toBe(true);
      expect(result.current.hasEntitlement('no_ads')).toBe(true);
      expect(result.current.hasEntitlement('advanced_reports')).toBe(true);
      expect(result.current.hasEntitlement('custom_routines')).toBe(true);
      expect(result.current.hasEntitlement('export_data')).toBe(true);
      expect(result.current.hasEntitlement('priority_support')).toBe(true);

      // Free features
      expect(result.current.hasEntitlement('basic_content')).toBe(true);
      expect(result.current.hasEntitlement('play_games')).toBe(true);
    });

    it('returns false for premium features when premium is cancelled', () => {
      mockSubscriptionState.isPremium = false;
      mockSubscriptionState.status = 'cancelled';

      const { result } = renderHook(() => useEntitlement());

      expect(result.current.hasEntitlement('offline_packs')).toBe(false);
      expect(result.current.hasEntitlement('all_content')).toBe(false);
    });
  });

  describe('premium features list', () => {
    it('includes exactly 8 premium features', () => {
      const { result } = renderHook(() => useEntitlement());
      const premiumFeatures = [
        'offline_packs',
        'all_content',
        'multiple_profiles',
        'no_ads',
        'advanced_reports',
        'custom_routines',
        'export_data',
        'priority_support',
      ];

      // On free plan, all premium features return false
      premiumFeatures.forEach((feature) => {
        expect(result.current.hasEntitlement(feature)).toBe(false);
      });
    });
  });

  describe('trial features list', () => {
    it('trial features are a subset of premium features', () => {
      mockSubscriptionState.isTrialing = true;
      const { result } = renderHook(() => useEntitlement());

      const trialFeatures = [
        'all_content',
        'multiple_profiles',
        'advanced_reports',
        'custom_routines',
      ];

      trialFeatures.forEach((feature) => {
        expect(result.current.hasEntitlement(feature)).toBe(true);
      });
    });
  });
});
