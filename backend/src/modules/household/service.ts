import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ConflictError, ValidationError } from '../../lib/errors.js';
import type { PaginatedResult } from '../../types/index.js';
import type {
  ListHouseholdsQuery,
  CreateHouseholdInput,
  UpdateHouseholdInput,
  CreateParentInput,
  UpdateParentInput,
  CreateChildInput,
  UpdateChildInput,
  SyncProfileInput,
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

// ── List Households ───────────────────────────────────────

export async function listHouseholds(
  query: ListHouseholdsQuery
): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page, limit, search, plan } = query;

  const where: Prisma.HouseholdWhereInput = {
    deletedAt: null,
  };

  if (plan) {
    where.plan = plan;
  }

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const [data, total] = await Promise.all([
    prisma.household.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.household.count({ where }),
  ]);

  return {
    data: data as unknown as Record<string, unknown>[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Get Household ─────────────────────────────────────────

export async function getHousehold(id: string) {
  const household = await prisma.household.findUnique({
    where: { id },
    include: {
      parents: {
        select: PARENT_PUBLIC_SELECT,
        where: { deletedAt: null },
      },
      children: {
        where: { deletedAt: null },
      },
      invites: true,
    },
  });

  if (!household) {
    throw new NotFoundError('Household', id);
  }

  return household;
}

// ── Create Household ──────────────────────────────────────

export async function createHousehold(input: CreateHouseholdInput) {
  const household = await prisma.household.create({
    data: {
      name: input.name,
      timezone: input.timezone ?? 'UTC',
      locale: input.locale ?? 'en',
      plan: input.plan ?? 'free',
    },
  });

  return household;
}

// ── Update Household ──────────────────────────────────────

export async function updateHousehold(id: string, input: UpdateHouseholdInput) {
  const existing = await prisma.household.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('Household', id);
  }

  const household = await prisma.household.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.timezone !== undefined && { timezone: input.timezone }),
      ...(input.locale !== undefined && { locale: input.locale }),
      ...(input.plan !== undefined && { plan: input.plan }),
    },
  });

  return household;
}

// ── Create Parent ─────────────────────────────────────────

export async function createParent(householdId: string, input: CreateParentInput) {
  // Verify household exists
  const household = await prisma.household.findUnique({ where: { id: householdId } });
  if (!household) {
    throw new NotFoundError('Household', householdId);
  }

  // Check email uniqueness
  const existingEmail = await prisma.parentAccount.findUnique({
    where: { email: input.email },
  });
  if (existingEmail) {
    throw new ConflictError(`Parent account with email '${input.email}' already exists`);
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const parent = await prisma.parentAccount.create({
    data: {
      householdId,
      email: input.email,
      password: hashedPassword,
      name: input.name,
      role: input.role ?? 'primary',
    },
    select: PARENT_PUBLIC_SELECT,
  });

  return parent;
}

// ── Update Parent ─────────────────────────────────────────

export async function updateParent(
  householdId: string,
  parentId: string,
  input: UpdateParentInput
) {
  // Verify parent exists and belongs to household
  const existing = await prisma.parentAccount.findUnique({
    where: { id: parentId },
  });
  if (!existing || existing.householdId !== householdId) {
    throw new NotFoundError('ParentAccount', parentId);
  }

  const parent = await prisma.parentAccount.update({
    where: { id: parentId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.role !== undefined && { role: input.role }),
    },
    select: PARENT_PUBLIC_SELECT,
  });

  return parent;
}

// ── Create Child ──────────────────────────────────────────

export async function createChild(householdId: string, input: CreateChildInput) {
  // Verify household exists
  const household = await prisma.household.findUnique({ where: { id: householdId } });
  if (!household) {
    throw new NotFoundError('Household', householdId);
  }

  const child = await prisma.childProfile.create({
    data: {
      householdId,
      name: input.name,
      avatarEmoji: input.avatarEmoji ?? '',
      ageGroup: input.ageGroup ?? 'age_2_3',
      interests: input.interests ?? [],
      bedtimeMode: input.bedtimeMode ?? false,
      reducedMotion: input.reducedMotion ?? false,
      largerText: input.largerText ?? false,
      highContrast: input.highContrast ?? false,
      soundEnabled: input.soundEnabled ?? true,
      musicEnabled: input.musicEnabled ?? true,
    },
  });

  return child;
}

// ── Update Child ──────────────────────────────────────────

export async function updateChild(
  householdId: string,
  childId: string,
  input: UpdateChildInput
) {
  // Verify child exists and belongs to household
  const existing = await prisma.childProfile.findUnique({
    where: { id: childId },
  });
  if (!existing || existing.householdId !== householdId) {
    throw new NotFoundError('ChildProfile', childId);
  }

  const child = await prisma.childProfile.update({
    where: { id: childId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.avatarEmoji !== undefined && { avatarEmoji: input.avatarEmoji }),
      ...(input.ageGroup !== undefined && { ageGroup: input.ageGroup }),
      ...(input.interests !== undefined && { interests: input.interests }),
      ...(input.bedtimeMode !== undefined && { bedtimeMode: input.bedtimeMode }),
      ...(input.reducedMotion !== undefined && { reducedMotion: input.reducedMotion }),
      ...(input.largerText !== undefined && { largerText: input.largerText }),
      ...(input.highContrast !== undefined && { highContrast: input.highContrast }),
      ...(input.soundEnabled !== undefined && { soundEnabled: input.soundEnabled }),
      ...(input.musicEnabled !== undefined && { musicEnabled: input.musicEnabled }),
    },
  });

  return child;
}

// ── Create Invite ─────────────────────────────────────────

export async function createInvite(householdId: string, email: string) {
  // Verify household exists
  const household = await prisma.household.findUnique({ where: { id: householdId } });
  if (!household) {
    throw new NotFoundError('Household', householdId);
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

  const invite = await prisma.caregiverInvite.create({
    data: {
      householdId,
      email,
      token,
      expiresAt,
    },
  });

  return invite;
}

// ── Accept Invite ─────────────────────────────────────────

export async function acceptInvite(token: string, password: string, name: string) {
  const invite = await prisma.caregiverInvite.findUnique({
    where: { token },
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

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create parent account and mark invite as accepted in a transaction
  const [parent] = await prisma.$transaction([
    prisma.parentAccount.create({
      data: {
        householdId: invite.householdId,
        email: invite.email,
        password: hashedPassword,
        name,
        role: 'caregiver',
      },
      select: PARENT_PUBLIC_SELECT,
    }),
    prisma.caregiverInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    }),
  ]);

  return parent;
}

// ── Search Households ─────────────────────────────────────

export async function searchHouseholds(q: string) {
  const households = await prisma.household.findMany({
    where: {
      deletedAt: null,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { id: { contains: q, mode: 'insensitive' } },
        {
          parents: {
            some: {
              OR: [
                { email: { contains: q, mode: 'insensitive' } },
                { name: { contains: q, mode: 'insensitive' } },
              ],
            },
          },
        },
      ],
    },
    include: {
      parents: {
        select: PARENT_PUBLIC_SELECT,
        where: { deletedAt: null },
      },
      children: {
        where: { deletedAt: null },
        select: { id: true, name: true, ageGroup: true },
      },
    },
    take: 20,
    orderBy: { createdAt: 'desc' },
  });

  return households;
}

// ── Sync Child Profile ────────────────────────────────────

export async function syncChildProfile(
  householdId: string,
  childId: string,
  data: SyncProfileInput
) {
  // Verify child exists and belongs to household
  const existing = await prisma.childProfile.findUnique({
    where: { id: childId },
  });
  if (!existing || existing.householdId !== householdId) {
    throw new NotFoundError('ChildProfile', childId);
  }

  const child = await prisma.childProfile.update({
    where: { id: childId },
    data: {
      ...(data.totalStars !== undefined && { totalStars: data.totalStars }),
      ...(data.streakDays !== undefined && { streakDays: data.streakDays }),
      ...(data.interests !== undefined && { interests: data.interests }),
    },
  });

  return child;
}

// ── Household Support View ────────────────────────────────

export async function getHouseholdSupport(id: string) {
  const household = await prisma.household.findUnique({
    where: { id },
    include: {
      parents: {
        select: {
          ...PARENT_PUBLIC_SELECT,
          settings: true,
        },
      },
      children: {
        include: {
          preferences: true,
        },
      },
      invites: true,
    },
  });

  if (!household) {
    throw new NotFoundError('Household', id);
  }

  return household;
}
