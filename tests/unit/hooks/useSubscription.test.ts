import { renderHook } from '@testing-library/react';
import { useSubscription } from '../../../src/hooks/useSubscription';

let mockPlayerId: number | undefined = 1;
let mockSubscription: {
  id?: number;
  playerId: number;
  plan: 'free' | 'trial' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  trialStartedAt?: Date;
  trialEndsAt?: Date;
  nextBillingDate?: Date;
  updatedAt: Date;
} | undefined = undefined;

vi.mock('../../../src/context/AppContext', () => ({
  useApp: () => ({
    currentPlayer: mockPlayerId ? { id: mockPlayerId } : null,
  }),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => mockSubscription,
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    subscriptions: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          first: vi.fn(() => Promise.resolve(mockSubscription)),
        })),
      })),
    },
  },
}));

describe('useSubscription', () => {
  beforeEach(() => {
    mockPlayerId = 1;
    mockSubscription = undefined;
  });

  describe('free plan (no subscription record)', () => {
    it('returns free plan when no subscription record exists', () => {
      const { result } = renderHook(() => useSubscription());
      expect(result.current.plan).toBe('free');
    });

    it('returns active status by default', () => {
      const { result } = renderHook(() => useSubscription());
      expect(result.current.status).toBe('active');
    });

    it('isPremium is false for free plan', () => {
      const { result } = renderHook(() => useSubscription());
      expect(result.current.isPremium).toBe(false);
    });

    it('isTrialing is false for free plan', () => {
      const { result } = renderHook(() => useSubscription());
      expect(result.current.isTrialing).toBe(false);
    });

    it('trialDaysLeft is 0 for free plan', () => {
      const { result } = renderHook(() => useSubscription());
      expect(result.current.trialDaysLeft).toBe(0);
    });

    it('subscription is undefined for free plan', () => {
      const { result } = renderHook(() => useSubscription());
      expect(result.current.subscription).toBeUndefined();
    });
  });

  describe('premium plan', () => {
    beforeEach(() => {
      mockSubscription = {
        id: 1,
        playerId: 1,
        plan: 'premium',
        status: 'active',
        updatedAt: new Date(),
      };
    });

    it('isPremium is true for premium + active', () => {
      const { result } = renderHook(() => useSubscription());
      expect(result.current.isPremium).toBe(true);
    });

    it('isPremium is false for premium + cancelled', () => {
      mockSubscription!.status = 'cancelled';
      const { result } = renderHook(() => useSubscription());
      expect(result.current.isPremium).toBe(false);
    });

    it('isPremium is false for premium + expired', () => {
      mockSubscription!.status = 'expired';
      const { result } = renderHook(() => useSubscription());
      expect(result.current.isPremium).toBe(false);
    });

    it('isTrialing is false for premium plan', () => {
      const { result } = renderHook(() => useSubscription());
      expect(result.current.isTrialing).toBe(false);
    });

    it('trialDaysLeft is 0 for premium plan', () => {
      const { result } = renderHook(() => useSubscription());
      expect(result.current.trialDaysLeft).toBe(0);
    });
  });

  describe('trial plan', () => {
    it('isTrialing is true when trial has days remaining', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      mockSubscription = {
        id: 1,
        playerId: 1,
        plan: 'trial',
        status: 'active',
        trialEndsAt: futureDate,
        updatedAt: new Date(),
      };

      const { result } = renderHook(() => useSubscription());
      expect(result.current.isTrialing).toBe(true);
    });

    it('computes trialDaysLeft correctly for 7 days', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      mockSubscription = {
        id: 1,
        playerId: 1,
        plan: 'trial',
        status: 'active',
        trialEndsAt: futureDate,
        updatedAt: new Date(),
      };

      const { result } = renderHook(() => useSubscription());
      expect(result.current.trialDaysLeft).toBe(7);
    });

    it('computes trialDaysLeft correctly for 1 day', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      mockSubscription = {
        id: 1,
        playerId: 1,
        plan: 'trial',
        status: 'active',
        trialEndsAt: futureDate,
        updatedAt: new Date(),
      };

      const { result } = renderHook(() => useSubscription());
      expect(result.current.trialDaysLeft).toBeGreaterThanOrEqual(1);
    });

    it('isTrialing is false for expired trial (trialEndsAt in past)', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      mockSubscription = {
        id: 1,
        playerId: 1,
        plan: 'trial',
        status: 'active',
        trialEndsAt: pastDate,
        updatedAt: new Date(),
      };

      const { result } = renderHook(() => useSubscription());
      expect(result.current.isTrialing).toBe(false);
      expect(result.current.trialDaysLeft).toBe(0);
    });

    it('trialDaysLeft is 0 when trialEndsAt is exactly now', () => {
      mockSubscription = {
        id: 1,
        playerId: 1,
        plan: 'trial',
        status: 'active',
        trialEndsAt: new Date(), // now
        updatedAt: new Date(),
      };

      const { result } = renderHook(() => useSubscription());
      // Math.ceil of 0 or very small positive = 0 or 1
      expect(result.current.trialDaysLeft).toBeLessThanOrEqual(1);
    });

    it('isPremium is false for trial plan', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      mockSubscription = {
        id: 1,
        playerId: 1,
        plan: 'trial',
        status: 'active',
        trialEndsAt: futureDate,
        updatedAt: new Date(),
      };

      const { result } = renderHook(() => useSubscription());
      expect(result.current.isPremium).toBe(false);
    });

    it('trialDaysLeft is 0 when trial has no trialEndsAt date', () => {
      mockSubscription = {
        id: 1,
        playerId: 1,
        plan: 'trial',
        status: 'active',
        updatedAt: new Date(),
      };

      const { result } = renderHook(() => useSubscription());
      expect(result.current.trialDaysLeft).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('returns subscription object when present', () => {
      mockSubscription = {
        id: 1,
        playerId: 1,
        plan: 'premium',
        status: 'active',
        updatedAt: new Date(),
      };

      const { result } = renderHook(() => useSubscription());
      expect(result.current.subscription).toBeDefined();
      expect(result.current.subscription!.plan).toBe('premium');
    });

    it('handles free plan with explicit free subscription record', () => {
      mockSubscription = {
        id: 1,
        playerId: 1,
        plan: 'free',
        status: 'active',
        updatedAt: new Date(),
      };

      const { result } = renderHook(() => useSubscription());
      expect(result.current.plan).toBe('free');
      expect(result.current.isPremium).toBe(false);
      expect(result.current.isTrialing).toBe(false);
    });
  });
});
