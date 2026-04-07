import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ConflictError, ValidationError, ForbiddenError } from '../../lib/errors.js';
import type { PaginatedResult } from '../../types/index.js';
import type {
  SendInviteInput,
  AcceptInviteInput,
  RevokeAccessInput,
  UpdateChildAccessInput,
  CaregiverAuditQuery,
} from './schemas.js';

// ── Constants ─────────────────────────────────────────────

const SALT_ROUNDS = 12;
const INVITE_EXPIRY_DAYS = 7;

const PARENT_PUBLIC_SELECT = {
  id: true,
  householdId: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ── List Caregivers ───────────────────────────────────────
// Returns parent accounts with role="caregiver" and pending caregiver invites.

export async function listCaregivers(householdId: string) {
  // Verify household exists
  const household = await prisma.household.findUnique({ where: { id: householdId } });
  if (!household) {
    throw new NotFoundError('Household', householdId);
  }

  const [caregivers, invites] = await Promise.all([
    prisma.parentAccount.findMany({
      where: {
        householdId,
        role: 'caregiver',
        deletedAt: null,
      },
      select: PARENT_PUBLIC_SELECT,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.caregiverInvite.findMany({
      where: {
        householdId,
        acceptedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { caregivers, invites };
}

// ── Send Invite ───────────────────────────────────────────

export async function sendInvite(input: SendInviteInput) {
  // Verify household exists
  const household = await prisma.household.findUnique({ where: { id: input.householdId } });
  if (!household) {
    throw new NotFoundError('Household', input.householdId);
  }

  // Check if email already has an account in this household
  const existingParent = await prisma.parentAccount.findFirst({
    where: {
      email: input.email,
      householdId: input.householdId,
      deletedAt: null,
    },
  });
  if (existingParent) {
    throw new ConflictError(`A parent account with email '${input.email}' already exists in this household`);
  }

  // Check for an existing pending invite
  const existingInvite = await prisma.caregiverInvite.findFirst({
    where: {
      householdId: input.householdId,
      email: input.email,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (existingInvite) {
    throw new ConflictError(`A pending invite for '${input.email}' already exists`);
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

  const invite = await prisma.caregiverInvite.create({
    data: {
      householdId: input.householdId,
      email: input.email,
      token,
      role: input.role ?? 'caregiver',
      childScope: input.childScope ?? [],
      expiresAt,
    },
  });

  return invite;
}

// ── Accept Invite ─────────────────────────────────────────

export async function acceptInvite(input: AcceptInviteInput) {
  const invite = await prisma.caregiverInvite.findUnique({
    where: { token: input.token },
  });

  if (!invite) {
    throw new NotFoundError('CaregiverInvite');
  }

  if (invite.acceptedAt) {
    throw new ConflictError('Invite has already been accepted');
  }

  if (new Date() > invite.expiresAt) {
    throw new ValidationError('Invite has expired');
  }

  // Check email uniqueness
  const existingEmail = await prisma.parentAccount.findUnique({
    where: { email: invite.email },
  });
  if (existingEmail) {
    throw new ConflictError(`Parent account with email '${invite.email}' already exists`);
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  // Create parent account and mark invite as accepted in a transaction
  const [parent] = await prisma.$transaction([
    prisma.parentAccount.create({
      data: {
        householdId: invite.householdId,
        email: invite.email,
        password: hashedPassword,
        name: input.name,
        role: invite.role || 'caregiver',
      },
      select: PARENT_PUBLIC_SELECT,
    }),
    prisma.caregiverInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    }),
  ]);

  // If childScope was specified, create CaregiverAccess records
  const childScope = invite.childScope as string[];
  if (Array.isArray(childScope) && childScope.length > 0) {
    await prisma.caregiverAccess.createMany({
      data: childScope.map((childProfileId) => ({
        caregiverId: parent.id,
        childProfileId,
        accessLevel: invite.role === 'viewer' ? 'view_only' : 'full',
        grantedBy: parent.id,
      })),
    });
  }

  return parent;
}

// ── Revoke Access ─────────────────────────────────────────

export async function revokeAccess(input: RevokeAccessInput, revokedBy: string) {
  // Verify the caregiver exists and belongs to the household
  const caregiver = await prisma.parentAccount.findUnique({
    where: { id: input.caregiverId },
  });

  if (!caregiver || caregiver.householdId !== input.householdId) {
    throw new NotFoundError('ParentAccount', input.caregiverId);
  }

  if (caregiver.role !== 'caregiver') {
    throw new ForbiddenError('Cannot revoke access for a primary account');
  }

  // Soft-revoke CaregiverAccess records and soft-delete the parent account
  await prisma.$transaction([
    prisma.caregiverAccess.updateMany({
      where: {
        caregiverId: input.caregiverId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    }),
    prisma.parentAccount.update({
      where: { id: input.caregiverId },
      data: { deletedAt: new Date() },
    }),
  ]);

  return { revoked: true, caregiverId: input.caregiverId };
}

// ── List Child Access ─────────────────────────────────────

export async function listChildAccess(caregiverId: string) {
  // Verify the caregiver exists
  const caregiver = await prisma.parentAccount.findUnique({
    where: { id: caregiverId },
  });
  if (!caregiver) {
    throw new NotFoundError('ParentAccount', caregiverId);
  }

  const accessRecords = await prisma.caregiverAccess.findMany({
    where: {
      caregiverId,
      revokedAt: null,
    },
    orderBy: { grantedAt: 'desc' },
  });

  return accessRecords;
}

// ── Update Child Access ───────────────────────────────────

export async function updateChildAccess(input: UpdateChildAccessInput, grantedBy: string) {
  // Verify the caregiver exists
  const caregiver = await prisma.parentAccount.findUnique({
    where: { id: input.caregiverId },
  });
  if (!caregiver) {
    throw new NotFoundError('ParentAccount', input.caregiverId);
  }

  // Verify the child profile exists
  const child = await prisma.childProfile.findUnique({
    where: { id: input.childProfileId },
  });
  if (!child) {
    throw new NotFoundError('ChildProfile', input.childProfileId);
  }

  // Upsert the access record
  const access = await prisma.caregiverAccess.upsert({
    where: {
      caregiverId_childProfileId: {
        caregiverId: input.caregiverId,
        childProfileId: input.childProfileId,
      },
    },
    create: {
      caregiverId: input.caregiverId,
      childProfileId: input.childProfileId,
      accessLevel: input.accessLevel,
      grantedBy,
    },
    update: {
      accessLevel: input.accessLevel,
      grantedBy,
      revokedAt: null,
    },
  });

  return access;
}

// ── Caregiver Audit ───────────────────────────────────────
// Returns audit logs filtered to caregiver actions for a household.

export async function getCaregiverAudit(
  householdId: string,
  query: CaregiverAuditQuery
): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page, limit } = query;

  // Get all caregiver IDs for this household
  const caregivers = await prisma.parentAccount.findMany({
    where: {
      householdId,
      role: 'caregiver',
    },
    select: { id: true },
  });

  const caregiverIds = caregivers.map((c) => c.id);

  const where = {
    OR: [
      // Logs by caregiver users
      ...(caregiverIds.length > 0 ? [{ userId: { in: caregiverIds } }] : []),
      // Logs about caregiver-related entities
      {
        entity: { in: ['CaregiverInvite', 'CaregiverAccess'] },
      },
    ],
  };

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data: data as unknown as Record<string, unknown>[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
