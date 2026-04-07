import { renderHook, act } from '@testing-library/react';
import { usePrivacy } from '../../../src/hooks/usePrivacy';

// Track DB calls for assertions
const mocks = vi.hoisted(() => ({
  mockConsentsAdd: vi.fn(),
  mockConsentsUpdate: vi.fn(),
  mockConsentsWhereFirst: vi.fn(),
  mockDataRequestsAdd: vi.fn(),
  mockConsentRecords: [] as { consentType: string; granted: boolean; grantedAt: Date }[],
  mockPendingRequests: [] as { type: string; status: string }[],
  mockPlayerId: 1 as number | undefined,
  useLiveQueryCallCount: 0,
}));

vi.mock('../../../src/context/AppContext', () => ({
  useApp: () => ({
    currentPlayer: mocks.mockPlayerId ? { id: mocks.mockPlayerId } : null,
  }),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => {
    mocks.useLiveQueryCallCount++;
    // First call: consent records, Second call: pending requests
    if (mocks.useLiveQueryCallCount % 2 === 1) {
      return mocks.mockConsentRecords;
    } else {
      return mocks.mockPendingRequests;
    }
  },
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    consents: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve(mocks.mockConsentRecords)),
          first: vi.fn(() => {
            return mocks.mockConsentsWhereFirst();
          }),
        })),
      })),
      add: mocks.mockConsentsAdd,
      update: mocks.mockConsentsUpdate,
    },
    dataRequests: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          filter: vi.fn(() => ({
            toArray: vi.fn(() => Promise.resolve(mocks.mockPendingRequests)),
          })),
        })),
      })),
      add: mocks.mockDataRequestsAdd,
    },
  },
}));

describe('usePrivacy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useLiveQueryCallCount = 0;
    mocks.mockConsentRecords = [];
    mocks.mockPendingRequests = [];
    mocks.mockPlayerId = 1;
    mocks.mockConsentsWhereFirst.mockResolvedValue(undefined);
  });

  describe('consent definitions', () => {
    it('defines exactly 4 consent types', () => {
      const { result } = renderHook(() => usePrivacy());
      expect(result.current.consentDefinitions).toHaveLength(4);
    });

    it('defines privacy_policy as required', () => {
      const { result } = renderHook(() => usePrivacy());
      const pp = result.current.consentDefinitions.find(
        (d) => d.type === 'privacy_policy'
      );
      expect(pp).toBeDefined();
      expect(pp!.required).toBe(true);
    });

    it('defines data_collection as optional', () => {
      const { result } = renderHook(() => usePrivacy());
      const dc = result.current.consentDefinitions.find(
        (d) => d.type === 'data_collection'
      );
      expect(dc).toBeDefined();
      expect(dc!.required).toBe(false);
    });

    it('defines marketing as optional', () => {
      const { result } = renderHook(() => usePrivacy());
      const mk = result.current.consentDefinitions.find(
        (d) => d.type === 'marketing'
      );
      expect(mk).toBeDefined();
      expect(mk!.required).toBe(false);
    });

    it('defines analytics as optional', () => {
      const { result } = renderHook(() => usePrivacy());
      const an = result.current.consentDefinitions.find(
        (d) => d.type === 'analytics'
      );
      expect(an).toBeDefined();
      expect(an!.required).toBe(false);
    });

    it('includes correct consent type names', () => {
      const { result } = renderHook(() => usePrivacy());
      const types = result.current.consentDefinitions.map((d) => d.type);
      expect(types).toEqual([
        'privacy_policy',
        'data_collection',
        'marketing',
        'analytics',
      ]);
    });
  });

  describe('consents merge', () => {
    it('merges DB records with definitions', () => {
      const { result } = renderHook(() => usePrivacy());
      // Without DB records, consents should have defaults
      expect(result.current.consents).toHaveLength(4);
      result.current.consents.forEach((consent) => {
        expect(consent).toHaveProperty('type');
        expect(consent).toHaveProperty('label');
        expect(consent).toHaveProperty('description');
        expect(consent).toHaveProperty('required');
        expect(consent).toHaveProperty('granted');
        expect(consent).toHaveProperty('grantedAt');
        expect(consent).toHaveProperty('currentVersion');
      });
    });

    it('defaults required consents to granted when no DB record', () => {
      const { result } = renderHook(() => usePrivacy());
      const pp = result.current.consents.find((c) => c.type === 'privacy_policy');
      expect(pp!.granted).toBe(true);
    });

    it('defaults optional consents to not granted when no DB record', () => {
      const { result } = renderHook(() => usePrivacy());
      const dc = result.current.consents.find((c) => c.type === 'data_collection');
      expect(dc!.granted).toBe(false);
    });

    it('uses DB record value when available', () => {
      mocks.mockConsentRecords = [
        { consentType: 'marketing', granted: true, grantedAt: new Date() },
      ];
      mocks.useLiveQueryCallCount = 0;
      const { result } = renderHook(() => usePrivacy());
      const mk = result.current.consents.find((c) => c.type === 'marketing');
      expect(mk!.granted).toBe(true);
    });
  });

  describe('updateConsent', () => {
    it('prevents revoking required consents (privacy_policy)', async () => {
      const { result } = renderHook(() => usePrivacy());

      await act(async () => {
        await result.current.updateConsent('privacy_policy', false);
      });

      expect(mocks.mockConsentsAdd).not.toHaveBeenCalled();
      expect(mocks.mockConsentsUpdate).not.toHaveBeenCalled();
    });

    it('allows granting required consent', async () => {
      mocks.mockConsentsWhereFirst.mockResolvedValue(undefined);
      const { result } = renderHook(() => usePrivacy());

      await act(async () => {
        await result.current.updateConsent('privacy_policy', true);
      });

      expect(mocks.mockConsentsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          consentType: 'privacy_policy',
          granted: true,
          version: '2.0',
        })
      );
    });

    it('allows toggling optional consent to true', async () => {
      mocks.mockConsentsWhereFirst.mockResolvedValue(undefined);
      const { result } = renderHook(() => usePrivacy());

      await act(async () => {
        await result.current.updateConsent('marketing', true);
      });

      expect(mocks.mockConsentsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          consentType: 'marketing',
          granted: true,
        })
      );
    });

    it('allows toggling optional consent to false', async () => {
      mocks.mockConsentsWhereFirst.mockResolvedValue(undefined);
      const { result } = renderHook(() => usePrivacy());

      await act(async () => {
        await result.current.updateConsent('analytics', false);
      });

      expect(mocks.mockConsentsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          consentType: 'analytics',
          granted: false,
        })
      );
    });

    it('updates existing consent record instead of adding', async () => {
      mocks.mockConsentsWhereFirst.mockResolvedValue({ id: 42, granted: false });
      const { result } = renderHook(() => usePrivacy());

      await act(async () => {
        await result.current.updateConsent('data_collection', true);
      });

      expect(mocks.mockConsentsUpdate).toHaveBeenCalledWith(42, expect.objectContaining({
        granted: true,
      }));
      expect(mocks.mockConsentsAdd).not.toHaveBeenCalled();
    });

    it('does nothing when no player is set', async () => {
      mocks.mockPlayerId = undefined;
      const { result } = renderHook(() => usePrivacy());

      await act(async () => {
        await result.current.updateConsent('marketing', true);
      });

      expect(mocks.mockConsentsAdd).not.toHaveBeenCalled();
      expect(mocks.mockConsentsUpdate).not.toHaveBeenCalled();
    });

    it('does nothing for unknown consent type', async () => {
      const { result } = renderHook(() => usePrivacy());

      await act(async () => {
        await result.current.updateConsent('nonexistent', true);
      });

      expect(mocks.mockConsentsAdd).not.toHaveBeenCalled();
      expect(mocks.mockConsentsUpdate).not.toHaveBeenCalled();
    });
  });

  describe('requestExport', () => {
    it('creates a pending export request', async () => {
      const { result } = renderHook(() => usePrivacy());

      await act(async () => {
        await result.current.requestExport();
      });

      expect(mocks.mockDataRequestsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          type: 'export',
          status: 'pending',
        })
      );
    });

    it('does nothing when no player is set', async () => {
      mocks.mockPlayerId = undefined;
      const { result } = renderHook(() => usePrivacy());

      await act(async () => {
        await result.current.requestExport();
      });

      expect(mocks.mockDataRequestsAdd).not.toHaveBeenCalled();
    });
  });

  describe('requestDeletion', () => {
    it('creates a pending deletion request', async () => {
      const { result } = renderHook(() => usePrivacy());

      await act(async () => {
        await result.current.requestDeletion();
      });

      expect(mocks.mockDataRequestsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          type: 'deletion',
          status: 'pending',
        })
      );
    });

    it('does nothing when no player is set', async () => {
      mocks.mockPlayerId = undefined;
      const { result } = renderHook(() => usePrivacy());

      await act(async () => {
        await result.current.requestDeletion();
      });

      expect(mocks.mockDataRequestsAdd).not.toHaveBeenCalled();
    });
  });
});
