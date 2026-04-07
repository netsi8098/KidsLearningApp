import { evaluateFlag, requireFlag } from '../../../src/lib/featureFlags';
import { ForbiddenError } from '../../../src/lib/errors';
import type { Request, Response, NextFunction } from 'express';

vi.mock('../../../src/lib/prisma', () => ({
  prisma: {
    featureFlag: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from '../../../src/lib/prisma';

const mockFindUnique = prisma.featureFlag.findUnique as ReturnType<typeof vi.fn>;

describe('evaluateFlag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return false when the flag does not exist', async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await evaluateFlag('nonexistent_flag');

    expect(result).toBe(false);
  });

  it('should return false when the flag is soft-deleted', async () => {
    mockFindUnique.mockResolvedValue({
      key: 'deleted_flag',
      enabled: true,
      defaultValue: true,
      targeting: {},
      overrides: [],
      deletedAt: new Date(),
    });

    const result = await evaluateFlag('deleted_flag');

    expect(result).toBe(false);
  });

  it('should return defaultValue when the flag is disabled', async () => {
    mockFindUnique.mockResolvedValue({
      key: 'disabled_flag',
      enabled: false,
      defaultValue: 'some-default-value',
      targeting: {},
      overrides: [],
      deletedAt: null,
    });

    const result = await evaluateFlag('disabled_flag');

    expect(result).toBe('some-default-value');
  });

  it('should return true when the flag is enabled and all targeting passes', async () => {
    mockFindUnique.mockResolvedValue({
      key: 'active_flag',
      enabled: true,
      defaultValue: false,
      targeting: {},
      overrides: [],
      deletedAt: null,
    });

    const result = await evaluateFlag('active_flag');

    expect(result).toBe(true);
  });

  it('should return true when enabled with null targeting', async () => {
    mockFindUnique.mockResolvedValue({
      key: 'no_targeting',
      enabled: true,
      defaultValue: false,
      targeting: null,
      overrides: [],
      deletedAt: null,
    });

    const result = await evaluateFlag('no_targeting');

    expect(result).toBe(true);
  });

  describe('entity-level overrides', () => {
    it('should return household override value when household matches', async () => {
      mockFindUnique.mockResolvedValue({
        key: 'flag_with_overrides',
        enabled: true,
        defaultValue: false,
        targeting: {},
        overrides: [
          { entityType: 'household', entityId: 'hh-42', value: 'override-value' },
        ],
        deletedAt: null,
      });

      const result = await evaluateFlag('flag_with_overrides', { householdId: 'hh-42' });

      expect(result).toBe('override-value');
    });

    it('should return profile override value when profile matches', async () => {
      mockFindUnique.mockResolvedValue({
        key: 'flag_with_profile_override',
        enabled: true,
        defaultValue: false,
        targeting: {},
        overrides: [
          { entityType: 'profile', entityId: 'prof-7', value: 'profile-override' },
        ],
        deletedAt: null,
      });

      const result = await evaluateFlag('flag_with_profile_override', { profileId: 'prof-7' });

      expect(result).toBe('profile-override');
    });

    it('should prioritize household override over profile override', async () => {
      mockFindUnique.mockResolvedValue({
        key: 'flag_both_overrides',
        enabled: true,
        defaultValue: false,
        targeting: {},
        overrides: [
          { entityType: 'household', entityId: 'hh-1', value: 'household-wins' },
          { entityType: 'profile', entityId: 'prof-1', value: 'profile-loses' },
        ],
        deletedAt: null,
      });

      const result = await evaluateFlag('flag_both_overrides', {
        householdId: 'hh-1',
        profileId: 'prof-1',
      });

      expect(result).toBe('household-wins');
    });

    it('should fall through to targeting when override entityId does not match', async () => {
      mockFindUnique.mockResolvedValue({
        key: 'flag_no_match',
        enabled: true,
        defaultValue: false,
        targeting: {},
        overrides: [
          { entityType: 'household', entityId: 'hh-other', value: 'unused' },
        ],
        deletedAt: null,
      });

      const result = await evaluateFlag('flag_no_match', { householdId: 'hh-mine' });

      expect(result).toBe(true);
    });
  });

  describe('targeting rules', () => {
    it('should return defaultValue when environment does not match targeting', async () => {
      mockFindUnique.mockResolvedValue({
        key: 'env_flag',
        enabled: true,
        defaultValue: 'fallback',
        targeting: { environments: ['production', 'staging'] },
        overrides: [],
        deletedAt: null,
      });

      const result = await evaluateFlag('env_flag', { environment: 'development' });

      expect(result).toBe('fallback');
    });

    it('should return true when environment matches targeting', async () => {
      mockFindUnique.mockResolvedValue({
        key: 'env_flag',
        enabled: true,
        defaultValue: false,
        targeting: { environments: ['production', 'staging'] },
        overrides: [],
        deletedAt: null,
      });

      const result = await evaluateFlag('env_flag', { environment: 'production' });

      expect(result).toBe(true);
    });

    it('should return defaultValue when locale does not match targeting', async () => {
      mockFindUnique.mockResolvedValue({
        key: 'locale_flag',
        enabled: true,
        defaultValue: 'locale-fallback',
        targeting: { locales: ['en-US', 'en-GB'] },
        overrides: [],
        deletedAt: null,
      });

      const result = await evaluateFlag('locale_flag', { locale: 'fr-FR' });

      expect(result).toBe('locale-fallback');
    });

    it('should return true when locale matches targeting', async () => {
      mockFindUnique.mockResolvedValue({
        key: 'locale_flag',
        enabled: true,
        defaultValue: false,
        targeting: { locales: ['en-US', 'en-GB'] },
        overrides: [],
        deletedAt: null,
      });

      const result = await evaluateFlag('locale_flag', { locale: 'en-US' });

      expect(result).toBe(true);
    });

    it('should return defaultValue when premiumOnly is required but context is not premium', async () => {
      mockFindUnique.mockResolvedValue({
        key: 'premium_flag',
        enabled: true,
        defaultValue: 'not-premium',
        targeting: { premiumOnly: true },
        overrides: [],
        deletedAt: null,
      });

      const result = await evaluateFlag('premium_flag', { premiumOnly: false });

      expect(result).toBe('not-premium');
    });

    it('should return true when premiumOnly is required and context is premium', async () => {
      mockFindUnique.mockResolvedValue({
        key: 'premium_flag',
        enabled: true,
        defaultValue: false,
        targeting: { premiumOnly: true },
        overrides: [],
        deletedAt: null,
      });

      const result = await evaluateFlag('premium_flag', { premiumOnly: true });

      expect(result).toBe(true);
    });

    it('should return defaultValue when householdId is not in targeting householdIds', async () => {
      mockFindUnique.mockResolvedValue({
        key: 'household_flag',
        enabled: true,
        defaultValue: 'nope',
        targeting: { householdIds: ['hh-alpha', 'hh-beta'] },
        overrides: [],
        deletedAt: null,
      });

      const result = await evaluateFlag('household_flag', { householdId: 'hh-gamma' });

      expect(result).toBe('nope');
    });

    it('should return true when householdId is in targeting householdIds', async () => {
      mockFindUnique.mockResolvedValue({
        key: 'household_flag',
        enabled: true,
        defaultValue: false,
        targeting: { householdIds: ['hh-alpha', 'hh-beta'] },
        overrides: [],
        deletedAt: null,
      });

      const result = await evaluateFlag('household_flag', { householdId: 'hh-alpha' });

      expect(result).toBe(true);
    });

    it('should pass when context field is undefined and targeting has that field', async () => {
      // If context.environment is undefined, the environments check is skipped
      mockFindUnique.mockResolvedValue({
        key: 'env_flag',
        enabled: true,
        defaultValue: false,
        targeting: { environments: ['production'] },
        overrides: [],
        deletedAt: null,
      });

      const result = await evaluateFlag('env_flag', {}); // no environment in context

      expect(result).toBe(true);
    });

    it('should evaluate multiple targeting rules together', async () => {
      mockFindUnique.mockResolvedValue({
        key: 'multi_flag',
        enabled: true,
        defaultValue: 'default',
        targeting: {
          environments: ['production'],
          locales: ['en-US'],
          premiumOnly: true,
        },
        overrides: [],
        deletedAt: null,
      });

      // All match
      const result1 = await evaluateFlag('multi_flag', {
        environment: 'production',
        locale: 'en-US',
        premiumOnly: true,
      });
      expect(result1).toBe(true);

      // Environment fails
      const result2 = await evaluateFlag('multi_flag', {
        environment: 'development',
        locale: 'en-US',
        premiumOnly: true,
      });
      expect(result2).toBe('default');
    });
  });
});

describe('requireFlag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call next when flag evaluates to truthy', async () => {
    mockFindUnique.mockResolvedValue({
      key: 'enabled_flag',
      enabled: true,
      defaultValue: false,
      targeting: {},
      overrides: [],
      deletedAt: null,
    });

    const middleware = requireFlag('enabled_flag');
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn() as unknown as NextFunction;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should throw ForbiddenError when flag evaluates to false', async () => {
    mockFindUnique.mockResolvedValue(null);

    const middleware = requireFlag('nonexistent_flag');
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn() as unknown as NextFunction;

    await expect(middleware(req, res, next)).rejects.toThrow(ForbiddenError);
    await expect(middleware(req, res, next)).rejects.toThrow('Feature not enabled: nonexistent_flag');
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenError when flag is disabled and defaultValue is falsy', async () => {
    mockFindUnique.mockResolvedValue({
      key: 'disabled_flag',
      enabled: false,
      defaultValue: false,
      targeting: {},
      overrides: [],
      deletedAt: null,
    });

    const middleware = requireFlag('disabled_flag');
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn() as unknown as NextFunction;

    await expect(middleware(req, res, next)).rejects.toThrow(ForbiddenError);
  });
});
