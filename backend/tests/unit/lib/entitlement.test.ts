import { checkEntitlement, requireEntitlement } from '../../../src/lib/entitlement';
import { ForbiddenError } from '../../../src/lib/errors';
import type { Request, Response, NextFunction } from 'express';

// Mock the prisma module
vi.mock('../../../src/lib/prisma', () => ({
  prisma: {
    entitlement: {
      findUnique: vi.fn(),
    },
  },
}));

// Import the mocked prisma after vi.mock
import { prisma } from '../../../src/lib/prisma';

const mockFindUnique = prisma.entitlement.findUnique as ReturnType<typeof vi.fn>;

describe('checkEntitlement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when entitlement exists and is granted', async () => {
    mockFindUnique.mockResolvedValue({
      householdId: 'hh-1',
      feature: 'premium_content',
      granted: true,
      expiresAt: null,
    });

    const result = await checkEntitlement('hh-1', 'premium_content');

    expect(result).toBe(true);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { householdId_feature: { householdId: 'hh-1', feature: 'premium_content' } },
    });
  });

  it('should return false when entitlement does not exist', async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await checkEntitlement('hh-1', 'premium_content');

    expect(result).toBe(false);
  });

  it('should return false when entitlement exists but is not granted', async () => {
    mockFindUnique.mockResolvedValue({
      householdId: 'hh-1',
      feature: 'premium_content',
      granted: false,
      expiresAt: null,
    });

    const result = await checkEntitlement('hh-1', 'premium_content');

    expect(result).toBe(false);
  });

  it('should return false when entitlement has expired', async () => {
    const pastDate = new Date('2020-01-01');
    mockFindUnique.mockResolvedValue({
      householdId: 'hh-1',
      feature: 'premium_content',
      granted: true,
      expiresAt: pastDate,
    });

    const result = await checkEntitlement('hh-1', 'premium_content');

    expect(result).toBe(false);
  });

  it('should return true when entitlement has not expired', async () => {
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
    mockFindUnique.mockResolvedValue({
      householdId: 'hh-1',
      feature: 'premium_content',
      granted: true,
      expiresAt: futureDate,
    });

    const result = await checkEntitlement('hh-1', 'premium_content');

    expect(result).toBe(true);
  });

  it('should return true when granted is true and expiresAt is null (no expiry)', async () => {
    mockFindUnique.mockResolvedValue({
      householdId: 'hh-2',
      feature: 'offline_mode',
      granted: true,
      expiresAt: null,
    });

    const result = await checkEntitlement('hh-2', 'offline_mode');

    expect(result).toBe(true);
  });
});

describe('requireEntitlement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockReq(overrides: {
    params?: Record<string, string>;
    body?: Record<string, unknown>;
    query?: Record<string, string>;
  }): Request {
    return {
      params: overrides.params ?? {},
      body: overrides.body ?? {},
      query: overrides.query ?? {},
    } as unknown as Request;
  }

  const mockRes = {} as Response;

  it('should call next when household is entitled via params', async () => {
    mockFindUnique.mockResolvedValue({
      householdId: 'hh-1',
      feature: 'premium',
      granted: true,
      expiresAt: null,
    });

    const middleware = requireEntitlement('premium');
    const next = vi.fn() as unknown as NextFunction;
    const req = createMockReq({ params: { householdId: 'hh-1' } });

    await middleware(req, mockRes, next);

    expect(next).toHaveBeenCalled();
  });

  it('should call next when household is entitled via body', async () => {
    mockFindUnique.mockResolvedValue({
      householdId: 'hh-2',
      feature: 'premium',
      granted: true,
      expiresAt: null,
    });

    const middleware = requireEntitlement('premium');
    const next = vi.fn() as unknown as NextFunction;
    const req = createMockReq({ body: { householdId: 'hh-2' } });

    await middleware(req, mockRes, next);

    expect(next).toHaveBeenCalled();
  });

  it('should call next when household is entitled via query', async () => {
    mockFindUnique.mockResolvedValue({
      householdId: 'hh-3',
      feature: 'premium',
      granted: true,
      expiresAt: null,
    });

    const middleware = requireEntitlement('premium');
    const next = vi.fn() as unknown as NextFunction;
    const req = createMockReq({ query: { householdId: 'hh-3' } });

    await middleware(req, mockRes, next);

    expect(next).toHaveBeenCalled();
  });

  it('should throw ForbiddenError when householdId is missing', async () => {
    const middleware = requireEntitlement('premium');
    const next = vi.fn() as unknown as NextFunction;
    const req = createMockReq({});

    await expect(middleware(req, mockRes, next)).rejects.toThrow(ForbiddenError);
    await expect(middleware(req, mockRes, next)).rejects.toThrow(
      'Household ID required for entitlement check'
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenError when not entitled', async () => {
    mockFindUnique.mockResolvedValue(null);

    const middleware = requireEntitlement('premium');
    const next = vi.fn() as unknown as NextFunction;
    const req = createMockReq({ params: { householdId: 'hh-1' } });

    await expect(middleware(req, mockRes, next)).rejects.toThrow(ForbiddenError);
    await expect(middleware(req, mockRes, next)).rejects.toThrow(
      'Requires entitlement: premium'
    );
  });

  it('should throw ForbiddenError when entitlement is expired', async () => {
    mockFindUnique.mockResolvedValue({
      householdId: 'hh-1',
      feature: 'premium',
      granted: true,
      expiresAt: new Date('2020-01-01'),
    });

    const middleware = requireEntitlement('premium');
    const next = vi.fn() as unknown as NextFunction;
    const req = createMockReq({ params: { householdId: 'hh-1' } });

    await expect(middleware(req, mockRes, next)).rejects.toThrow(ForbiddenError);
  });
});
