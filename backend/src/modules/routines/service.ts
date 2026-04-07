import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError } from '../../lib/errors.js';
import type { PaginationParams } from '../../types/index.js';
import { paginate } from '../../types/index.js';
import type { Prisma } from '@prisma/client';

// ── Types ─────────────────────────────────────────────────

type RoutineType = 'morning' | 'after_school' | 'travel' | 'bedtime' | 'weekend' | 'custom';

// ── List Routines ─────────────────────────────────────────

export async function listRoutines(
  params: PaginationParams & {
    householdId: string;
    type?: RoutineType;
    profileId?: string;
  }
) {
  const where: Prisma.RoutineWhereInput = {
    householdId: params.householdId,
    deletedAt: null,
    isTemplate: false,
  };
  if (params.type) where.type = params.type;
  if (params.profileId) where.profileId = params.profileId;

  const skip = (params.page - 1) * params.limit;
  const orderBy: Prisma.RoutineOrderByWithRelationInput = {
    [params.sortBy || 'createdAt']: params.sortOrder || 'desc',
  };

  const [routines, total] = await prisma.$transaction([
    prisma.routine.findMany({
      where,
      skip,
      take: params.limit,
      orderBy,
    }),
    prisma.routine.count({ where }),
  ]);

  return paginate(routines, total, params);
}

// ── Get Routine by ID ─────────────────────────────────────

export async function getRoutineById(id: string) {
  const routine = await prisma.routine.findUnique({
    where: { id },
  });
  if (!routine || routine.deletedAt) {
    throw new NotFoundError('Routine', id);
  }
  return routine;
}

// ── Create Routine ────────────────────────────────────────

export async function createRoutine(data: {
  householdId: string;
  profileId?: string;
  name: string;
  type: RoutineType;
  items: unknown[];
  scheduleDays?: unknown[];
  scheduledTime?: string;
  estimatedMinutes?: number;
}) {
  return prisma.routine.create({
    data: {
      householdId: data.householdId,
      profileId: data.profileId ?? null,
      name: data.name,
      type: data.type,
      items: data.items as Prisma.InputJsonValue,
      scheduleDays: (data.scheduleDays ?? []) as Prisma.InputJsonValue,
      scheduledTime: data.scheduledTime ?? null,
      estimatedMinutes: data.estimatedMinutes ?? null,
      isTemplate: false,
    },
  });
}

// ── Update Routine ────────────────────────────────────────

export async function updateRoutine(
  id: string,
  data: Partial<{
    name: string;
    type: RoutineType;
    items: unknown[];
    profileId: string | null;
    scheduleDays: unknown[];
    scheduledTime: string | null;
    estimatedMinutes: number | null;
  }>
) {
  const existing = await prisma.routine.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    throw new NotFoundError('Routine', id);
  }

  const updateData: Prisma.RoutineUpdateInput = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.items !== undefined) updateData.items = data.items as Prisma.InputJsonValue;
  if (data.profileId !== undefined) updateData.profileId = data.profileId;
  if (data.scheduleDays !== undefined) updateData.scheduleDays = data.scheduleDays as Prisma.InputJsonValue;
  if (data.scheduledTime !== undefined) updateData.scheduledTime = data.scheduledTime;
  if (data.estimatedMinutes !== undefined) updateData.estimatedMinutes = data.estimatedMinutes;

  return prisma.routine.update({
    where: { id },
    data: updateData,
  });
}

// ── Soft-Delete Routine ───────────────────────────────────

export async function deleteRoutine(id: string) {
  const existing = await prisma.routine.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    throw new NotFoundError('Routine', id);
  }

  return prisma.routine.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

// ── Duplicate Routine ─────────────────────────────────────

export async function duplicateRoutine(id: string) {
  const existing = await prisma.routine.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    throw new NotFoundError('Routine', id);
  }

  return prisma.routine.create({
    data: {
      householdId: existing.householdId,
      profileId: existing.profileId,
      name: `${existing.name} (Copy)`,
      type: existing.type,
      items: existing.items as Prisma.InputJsonValue,
      scheduleDays: existing.scheduleDays as Prisma.InputJsonValue,
      scheduledTime: existing.scheduledTime,
      estimatedMinutes: existing.estimatedMinutes,
      isTemplate: false,
    },
  });
}

// ── List Templates ────────────────────────────────────────

export async function listTemplates(filters?: { type?: RoutineType }) {
  const where: Prisma.RoutineWhereInput = {
    isTemplate: true,
    deletedAt: null,
  };
  if (filters?.type) where.type = filters.type;

  return prisma.routine.findMany({
    where,
    orderBy: { createdAt: 'asc' },
  });
}

// ── Create From Template ──────────────────────────────────

export async function createFromTemplate(data: {
  templateId: string;
  householdId: string;
  profileId?: string;
}) {
  const template = await prisma.routine.findUnique({
    where: { id: data.templateId },
  });

  if (!template || !template.isTemplate || template.deletedAt) {
    throw new NotFoundError('Routine template', data.templateId);
  }

  return prisma.routine.create({
    data: {
      householdId: data.householdId,
      profileId: data.profileId ?? null,
      name: template.name,
      type: template.type,
      items: template.items as Prisma.InputJsonValue,
      scheduleDays: template.scheduleDays as Prisma.InputJsonValue,
      scheduledTime: template.scheduledTime,
      estimatedMinutes: template.estimatedMinutes,
      isTemplate: false,
    },
  });
}
