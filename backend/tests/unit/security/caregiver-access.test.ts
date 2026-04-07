import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma, resetPrismaMocks } from '../../helpers/prisma.mock';

// ── Mock dependencies ────────────────────────────────────────
vi.mock('../../../src/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn().mockResolvedValue('$hashed$password') },
}));

import {
  sendInvite,
  acceptInvite,
  revokeAccess,
  listChildAccess,
  updateChildAccess,
  listCaregivers,
} from '../../../src/modules/caregiver/service';
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  ForbiddenError,
} from '../../../src/lib/errors';

// ── Helpers ──────────────────────────────────────────────────

function fakeHousehold(overrides: Record<string, unknown> = {}) {
  return {
    id: 'household-1',
    name: 'Test Family',
    plan: 'free',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

function fakeParentAccount(overrides: Record<string, unknown> = {}) {
  return {
    id: 'parent-1',
    householdId: 'household-1',
    email: 'parent@test.com',
    password: '$hashed$password',
    name: 'Parent',
    role: 'caregiver',
    deletedAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

function fakeCaregiverInvite(overrides: Record<string, unknown> = {}) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  return {
    id: 'invite-1',
    householdId: 'household-1',
    email: 'caregiver@test.com',
    token: 'valid-token-uuid',
    role: 'caregiver',
    childScope: [],
    acceptedAt: null,
    expiresAt,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

function fakeCaregiverAccess(overrides: Record<string, unknown> = {}) {
  return {
    id: 'access-1',
    caregiverId: 'caregiver-1',
    childProfileId: 'child-1',
    accessLevel: 'full',
    grantedBy: 'parent-1',
    grantedAt: new Date('2024-01-01'),
    revokedAt: null,
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────

describe('Caregiver Permission Model', () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  // ── Caregiver Can Only Access Assigned Children ──────────

  describe('Child access scoping', () => {
    it('should return only non-revoked access records for a caregiver', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(
        fakeParentAccount({ id: 'caregiver-1', role: 'caregiver' })
      );
      mockPrisma.caregiverAccess.findMany.mockResolvedValue([
        fakeCaregiverAccess({ childProfileId: 'child-1' }),
        fakeCaregiverAccess({ childProfileId: 'child-2', id: 'access-2' }),
      ]);

      const result = await listChildAccess('caregiver-1');

      expect(result).toHaveLength(2);
      expect(mockPrisma.caregiverAccess.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            caregiverId: 'caregiver-1',
            revokedAt: null,
          },
        })
      );
    });

    it('should exclude revoked access records', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(
        fakeParentAccount({ id: 'caregiver-1' })
      );
      mockPrisma.caregiverAccess.findMany.mockResolvedValue([
        fakeCaregiverAccess({ childProfileId: 'child-1' }),
        // child-2 access is revoked and should be filtered by the where clause
      ]);

      const result = await listChildAccess('caregiver-1');

      // The query filters revokedAt: null, so revoked records are excluded
      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundError for non-existent caregiver', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(null);

      await expect(listChildAccess('missing')).rejects.toThrow(NotFoundError);
    });
  });

  // ── Viewer Caregiver (Read-Only Access) ──────────────────

  describe('Viewer caregiver access level', () => {
    it('should create access with view_only level for viewer role invites', async () => {
      // When accepting an invite with role=viewer, childScope access should be view_only
      const invite = fakeCaregiverInvite({
        role: 'viewer',
        childScope: ['child-1', 'child-2'],
        email: 'viewer-caregiver@test.com',
      });
      mockPrisma.caregiverInvite.findUnique.mockResolvedValue(invite);
      mockPrisma.parentAccount.findUnique.mockResolvedValue(null);
      mockPrisma.parentAccount.create.mockResolvedValue(
        fakeParentAccount({
          id: 'new-caregiver',
          email: 'viewer-caregiver@test.com',
          role: 'viewer',
        })
      );
      mockPrisma.caregiverInvite.update.mockResolvedValue({
        ...invite,
        acceptedAt: new Date(),
      });
      mockPrisma.caregiverAccess.createMany.mockResolvedValue({ count: 2 });

      await acceptInvite({
        token: 'valid-token-uuid',
        password: 'securePass123',
        name: 'Viewer Caregiver',
      });

      expect(mockPrisma.caregiverAccess.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            caregiverId: 'new-caregiver',
            childProfileId: 'child-1',
            accessLevel: 'view_only',
          }),
          expect.objectContaining({
            caregiverId: 'new-caregiver',
            childProfileId: 'child-2',
            accessLevel: 'view_only',
          }),
        ]),
      });
    });

    it('should create access with full level for caregiver role invites', async () => {
      const invite = fakeCaregiverInvite({
        role: 'caregiver',
        childScope: ['child-1'],
        email: 'full-caregiver@test.com',
      });
      mockPrisma.caregiverInvite.findUnique.mockResolvedValue(invite);
      mockPrisma.parentAccount.findUnique.mockResolvedValue(null);
      mockPrisma.parentAccount.create.mockResolvedValue(
        fakeParentAccount({
          id: 'new-caregiver',
          email: 'full-caregiver@test.com',
          role: 'caregiver',
        })
      );
      mockPrisma.caregiverInvite.update.mockResolvedValue({
        ...invite,
        acceptedAt: new Date(),
      });
      mockPrisma.caregiverAccess.createMany.mockResolvedValue({ count: 1 });

      await acceptInvite({
        token: 'valid-token-uuid',
        password: 'securePass123',
        name: 'Full Caregiver',
      });

      expect(mockPrisma.caregiverAccess.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            accessLevel: 'full',
          }),
        ]),
      });
    });
  });

  // ── Caregiver with Full Access ───────────────────────────

  describe('Full access caregiver can modify child data', () => {
    it('should allow updating child access to full level', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(
        fakeParentAccount({ id: 'caregiver-1' })
      );
      mockPrisma.childProfile.findUnique.mockResolvedValue({
        id: 'child-1',
        name: 'Test Child',
      });
      mockPrisma.caregiverAccess.upsert.mockResolvedValue(
        fakeCaregiverAccess({ accessLevel: 'full' })
      );

      const result = await updateChildAccess(
        {
          caregiverId: 'caregiver-1',
          childProfileId: 'child-1',
          accessLevel: 'full',
        },
        'parent-1'
      );

      expect(result.accessLevel).toBe('full');
    });

    it('should allow updating child access to view_only level', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(
        fakeParentAccount({ id: 'caregiver-1' })
      );
      mockPrisma.childProfile.findUnique.mockResolvedValue({
        id: 'child-1',
        name: 'Test Child',
      });
      mockPrisma.caregiverAccess.upsert.mockResolvedValue(
        fakeCaregiverAccess({ accessLevel: 'view_only' })
      );

      const result = await updateChildAccess(
        {
          caregiverId: 'caregiver-1',
          childProfileId: 'child-1',
          accessLevel: 'view_only',
        },
        'parent-1'
      );

      expect(result.accessLevel).toBe('view_only');
    });

    it('should throw NotFoundError when caregiver does not exist', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(null);

      await expect(
        updateChildAccess(
          {
            caregiverId: 'missing',
            childProfileId: 'child-1',
            accessLevel: 'full',
          },
          'parent-1'
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when child profile does not exist', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(
        fakeParentAccount({ id: 'caregiver-1' })
      );
      mockPrisma.childProfile.findUnique.mockResolvedValue(null);

      await expect(
        updateChildAccess(
          {
            caregiverId: 'caregiver-1',
            childProfileId: 'missing',
            accessLevel: 'full',
          },
          'parent-1'
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ── Revoking Access ──────────────────────────────────────

  describe('Revoking caregiver access', () => {
    it('should soft-revoke all access records and deactivate account', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(
        fakeParentAccount({
          id: 'caregiver-1',
          householdId: 'household-1',
          role: 'caregiver',
        })
      );
      mockPrisma.caregiverAccess.updateMany.mockResolvedValue({ count: 2 });
      mockPrisma.parentAccount.update.mockResolvedValue(
        fakeParentAccount({ deletedAt: new Date() })
      );

      const result = await revokeAccess(
        { caregiverId: 'caregiver-1', householdId: 'household-1' },
        'admin-1'
      );

      expect(result.revoked).toBe(true);
      expect(mockPrisma.caregiverAccess.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            caregiverId: 'caregiver-1',
            revokedAt: null,
          },
          data: { revokedAt: expect.any(Date) },
        })
      );
      expect(mockPrisma.parentAccount.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'caregiver-1' },
          data: { deletedAt: expect.any(Date) },
        })
      );
    });

    it('should remove all child-level access on revocation', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(
        fakeParentAccount({
          id: 'caregiver-1',
          householdId: 'household-1',
          role: 'caregiver',
        })
      );
      mockPrisma.caregiverAccess.updateMany.mockResolvedValue({ count: 3 });
      mockPrisma.parentAccount.update.mockResolvedValue({});

      const result = await revokeAccess(
        { caregiverId: 'caregiver-1', householdId: 'household-1' },
        'admin-1'
      );

      expect(result.revoked).toBe(true);
      // Verify updateMany was called to revoke ALL access records
      expect(mockPrisma.caregiverAccess.updateMany).toHaveBeenCalled();
    });

    it('should throw NotFoundError when caregiver does not exist', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(null);

      await expect(
        revokeAccess(
          { caregiverId: 'missing', householdId: 'household-1' },
          'admin-1'
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when caregiver is in a different household', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(
        fakeParentAccount({
          id: 'caregiver-1',
          householdId: 'other-household',
          role: 'caregiver',
        })
      );

      await expect(
        revokeAccess(
          { caregiverId: 'caregiver-1', householdId: 'household-1' },
          'admin-1'
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should NOT allow revoking a primary parent account', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(
        fakeParentAccount({
          id: 'primary-parent',
          householdId: 'household-1',
          role: 'primary', // Not 'caregiver'
        })
      );

      await expect(
        revokeAccess(
          { caregiverId: 'primary-parent', householdId: 'household-1' },
          'admin-1'
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it('should include "primary" error message when trying to revoke primary', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(
        fakeParentAccount({
          id: 'primary-parent',
          householdId: 'household-1',
          role: 'primary',
        })
      );

      try {
        await revokeAccess(
          { caregiverId: 'primary-parent', householdId: 'household-1' },
          'admin-1'
        );
        expect.unreachable('Expected ForbiddenError');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenError);
        expect((error as ForbiddenError).message).toContain('primary');
      }
    });
  });

  // ── Invite Token Validation ──────────────────────────────

  describe('Invite token validation', () => {
    it('should accept a valid, non-expired invite token', async () => {
      const invite = fakeCaregiverInvite({
        email: 'new@test.com',
      });
      mockPrisma.caregiverInvite.findUnique.mockResolvedValue(invite);
      mockPrisma.parentAccount.findUnique.mockResolvedValue(null);
      mockPrisma.parentAccount.create.mockResolvedValue(
        fakeParentAccount({ id: 'new-parent', email: 'new@test.com' })
      );
      mockPrisma.caregiverInvite.update.mockResolvedValue({
        ...invite,
        acceptedAt: new Date(),
      });

      const result = await acceptInvite({
        token: 'valid-token-uuid',
        password: 'securePass123',
        name: 'New Caregiver',
      });

      expect(result).toBeDefined();
      expect(result.email).toBe('new@test.com');
    });

    it('should reject a non-existent token', async () => {
      mockPrisma.caregiverInvite.findUnique.mockResolvedValue(null);

      await expect(
        acceptInvite({
          token: 'invalid-token',
          password: 'pass123',
          name: 'Nobody',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('should reject an already accepted invite token', async () => {
      mockPrisma.caregiverInvite.findUnique.mockResolvedValue(
        fakeCaregiverInvite({ acceptedAt: new Date('2024-06-01') })
      );

      await expect(
        acceptInvite({
          token: 'valid-token-uuid',
          password: 'pass123',
          name: 'Late Acceptor',
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should reject an expired invite token', async () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1); // expired yesterday

      mockPrisma.caregiverInvite.findUnique.mockResolvedValue(
        fakeCaregiverInvite({ expiresAt: expiredDate })
      );

      await expect(
        acceptInvite({
          token: 'valid-token-uuid',
          password: 'pass123',
          name: 'Expired User',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should reject if email already has an account', async () => {
      const invite = fakeCaregiverInvite({ email: 'existing@test.com' });
      mockPrisma.caregiverInvite.findUnique.mockResolvedValue(invite);
      mockPrisma.parentAccount.findUnique.mockResolvedValue(
        fakeParentAccount({ email: 'existing@test.com' })
      );

      await expect(
        acceptInvite({
          token: 'valid-token-uuid',
          password: 'pass123',
          name: 'Existing User',
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  // ── Send Invite Validation ───────────────────────────────

  describe('Send invite validation', () => {
    it('should send an invite for a valid household and email', async () => {
      mockPrisma.household.findUnique.mockResolvedValue(fakeHousehold());
      mockPrisma.parentAccount.findFirst.mockResolvedValue(null);
      mockPrisma.caregiverInvite.findFirst.mockResolvedValue(null);
      mockPrisma.caregiverInvite.create.mockResolvedValue(fakeCaregiverInvite());

      const result = await sendInvite({
        householdId: 'household-1',
        email: 'caregiver@test.com',
      });

      expect(result).toBeDefined();
      expect(result.email).toBe('caregiver@test.com');
    });

    it('should throw NotFoundError for non-existent household', async () => {
      mockPrisma.household.findUnique.mockResolvedValue(null);

      await expect(
        sendInvite({
          householdId: 'missing',
          email: 'caregiver@test.com',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if email already has an account in the household', async () => {
      mockPrisma.household.findUnique.mockResolvedValue(fakeHousehold());
      mockPrisma.parentAccount.findFirst.mockResolvedValue(
        fakeParentAccount({ email: 'caregiver@test.com' })
      );

      await expect(
        sendInvite({
          householdId: 'household-1',
          email: 'caregiver@test.com',
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should throw ConflictError if there is already a pending invite', async () => {
      mockPrisma.household.findUnique.mockResolvedValue(fakeHousehold());
      mockPrisma.parentAccount.findFirst.mockResolvedValue(null);
      mockPrisma.caregiverInvite.findFirst.mockResolvedValue(
        fakeCaregiverInvite()
      );

      await expect(
        sendInvite({
          householdId: 'household-1',
          email: 'caregiver@test.com',
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should include childScope in the invite when provided', async () => {
      mockPrisma.household.findUnique.mockResolvedValue(fakeHousehold());
      mockPrisma.parentAccount.findFirst.mockResolvedValue(null);
      mockPrisma.caregiverInvite.findFirst.mockResolvedValue(null);
      mockPrisma.caregiverInvite.create.mockResolvedValue(
        fakeCaregiverInvite({ childScope: ['child-1', 'child-2'] })
      );

      await sendInvite({
        householdId: 'household-1',
        email: 'caregiver@test.com',
        childScope: ['child-1', 'child-2'],
      });

      expect(mockPrisma.caregiverInvite.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            childScope: ['child-1', 'child-2'],
          }),
        })
      );
    });
  });

  // ── List Caregivers ──────────────────────────────────────

  describe('List caregivers', () => {
    it('should return caregivers and pending invites for a household', async () => {
      mockPrisma.household.findUnique.mockResolvedValue(fakeHousehold());
      mockPrisma.parentAccount.findMany.mockResolvedValue([
        fakeParentAccount({ id: 'cg-1', name: 'Caregiver 1', role: 'caregiver' }),
      ]);
      mockPrisma.caregiverInvite.findMany.mockResolvedValue([
        fakeCaregiverInvite({ email: 'pending@test.com' }),
      ]);

      const result = await listCaregivers('household-1');

      expect(result.caregivers).toHaveLength(1);
      expect(result.invites).toHaveLength(1);
    });

    it('should only return non-deleted caregivers', async () => {
      mockPrisma.household.findUnique.mockResolvedValue(fakeHousehold());
      mockPrisma.parentAccount.findMany.mockResolvedValue([]);
      mockPrisma.caregiverInvite.findMany.mockResolvedValue([]);

      await listCaregivers('household-1');

      expect(mockPrisma.parentAccount.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        })
      );
    });

    it('should only return non-accepted invites', async () => {
      mockPrisma.household.findUnique.mockResolvedValue(fakeHousehold());
      mockPrisma.parentAccount.findMany.mockResolvedValue([]);
      mockPrisma.caregiverInvite.findMany.mockResolvedValue([]);

      await listCaregivers('household-1');

      expect(mockPrisma.caregiverInvite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            acceptedAt: null,
          }),
        })
      );
    });

    it('should throw NotFoundError for non-existent household', async () => {
      mockPrisma.household.findUnique.mockResolvedValue(null);

      await expect(listCaregivers('missing')).rejects.toThrow(NotFoundError);
    });
  });
});
