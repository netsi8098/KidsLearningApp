import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError, ConflictError } from '../../lib/errors.js';
import { paginate, type PaginationParams, type PaginatedResult } from '../../types/index.js';
import { logAudit } from '../../lib/audit.js';
import { Prisma } from '@prisma/client';
import type { Journey, JourneyStep, JourneyEnrollment } from '@prisma/client';

// ── Types ─────────────────────────────────────────────────

export interface JourneyWithSteps extends Journey {
  steps: JourneyStep[];
}

export interface JourneyDetail extends Journey {
  steps: JourneyStep[];
  enrollments: JourneyEnrollment[];
}

export interface EnrollmentWithJourney extends JourneyEnrollment {
  journey: { id: string; name: string };
}

export interface PreviewMessage {
  stepIndex: number;
  orderIndex: number;
  delayHours: number;
  messageTemplate: unknown;
  conditions: unknown;
  scheduledOffsetHours: number;
}

export interface JourneyPreview {
  journeyId: string;
  journeyName: string;
  householdId: string;
  totalSteps: number;
  messages: PreviewMessage[];
}

// ── Journey CRUD ──────────────────────────────────────────

export async function listJourneys(
  filters: { triggerType?: string; enabled?: boolean },
  pagination: PaginationParams
): Promise<PaginatedResult<JourneyWithSteps>> {
  const where: Prisma.JourneyWhereInput = {};
  if (filters.triggerType) {
    where.triggerType = filters.triggerType;
  }
  if (filters.enabled !== undefined) {
    where.enabled = filters.enabled;
  }

  const [items, total] = await Promise.all([
    prisma.journey.findMany({
      where,
      include: { steps: { orderBy: { orderIndex: 'asc' } } },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      orderBy: pagination.sortBy
        ? { [pagination.sortBy]: pagination.sortOrder || 'desc' }
        : { createdAt: 'desc' },
    }),
    prisma.journey.count({ where }),
  ]);

  return paginate(items as JourneyWithSteps[], total, pagination);
}

export async function getJourney(id: string): Promise<JourneyDetail> {
  const journey = await prisma.journey.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { orderIndex: 'asc' } },
      enrollments: { orderBy: { enrolledAt: 'desc' } },
    },
  });

  if (!journey) {
    throw new NotFoundError('Journey', id);
  }

  return journey as JourneyDetail;
}

export async function createJourney(
  data: {
    name: string;
    description?: string;
    triggerType: string;
    enabled?: boolean;
    cooldownHours?: number;
  },
  createdBy: string
): Promise<Journey> {
  // Check for name uniqueness
  const existing = await prisma.journey.findUnique({ where: { name: data.name } });
  if (existing) {
    throw new ConflictError(`Journey with name '${data.name}' already exists`);
  }

  const journey = await prisma.journey.create({
    data: {
      name: data.name,
      description: data.description || null,
      triggerType: data.triggerType,
      enabled: data.enabled ?? false,
      cooldownHours: data.cooldownHours ?? 0,
    },
  });

  await logAudit({
    action: 'journey.create',
    entity: 'Journey',
    entityId: journey.id,
    changes: { name: data.name, triggerType: data.triggerType, enabled: journey.enabled },
    userId: createdBy,
  });

  return journey;
}

export async function updateJourney(
  id: string,
  data: {
    name?: string;
    description?: string;
    triggerType?: string;
    enabled?: boolean;
    cooldownHours?: number;
  },
  updatedBy: string
): Promise<Journey> {
  const journey = await prisma.journey.findUnique({ where: { id } });
  if (!journey) {
    throw new NotFoundError('Journey', id);
  }

  // Check name uniqueness if changing name
  if (data.name && data.name !== journey.name) {
    const existing = await prisma.journey.findUnique({ where: { name: data.name } });
    if (existing) {
      throw new ConflictError(`Journey with name '${data.name}' already exists`);
    }
  }

  const updateData: Prisma.JourneyUpdateInput = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.triggerType !== undefined) updateData.triggerType = data.triggerType;
  if (data.enabled !== undefined) updateData.enabled = data.enabled;
  if (data.cooldownHours !== undefined) updateData.cooldownHours = data.cooldownHours;

  const updated = await prisma.journey.update({
    where: { id },
    data: updateData,
  });

  await logAudit({
    action: 'journey.update',
    entity: 'Journey',
    entityId: id,
    changes: data,
    userId: updatedBy,
  });

  return updated;
}

// ── Steps ─────────────────────────────────────────────────

export async function addStep(
  journeyId: string,
  data: {
    orderIndex: number;
    delayHours?: number;
    messageTemplate: Record<string, unknown>;
    conditions?: Record<string, unknown>;
  },
  createdBy: string
): Promise<JourneyStep> {
  const journey = await prisma.journey.findUnique({ where: { id: journeyId } });
  if (!journey) {
    throw new NotFoundError('Journey', journeyId);
  }

  const step = await prisma.journeyStep.create({
    data: {
      journeyId,
      orderIndex: data.orderIndex,
      delayHours: data.delayHours ?? 0,
      messageTemplate: data.messageTemplate as Prisma.InputJsonValue,
      conditions: (data.conditions ?? {}) as Prisma.InputJsonValue,
    },
  });

  await logAudit({
    action: 'journey_step.create',
    entity: 'JourneyStep',
    entityId: step.id,
    changes: { journeyId, orderIndex: data.orderIndex },
    userId: createdBy,
  });

  return step;
}

// ── Enrollments ───────────────────────────────────────────

export async function listEnrollments(
  filters: { journeyId?: string; status?: string },
  pagination: PaginationParams
): Promise<PaginatedResult<EnrollmentWithJourney>> {
  const where: Prisma.JourneyEnrollmentWhereInput = {};
  if (filters.journeyId) {
    where.journeyId = filters.journeyId;
  }
  if (filters.status) {
    where.status = filters.status;
  }

  const [items, total] = await Promise.all([
    prisma.journeyEnrollment.findMany({
      where,
      include: {
        journey: { select: { id: true, name: true } },
      },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      orderBy: pagination.sortBy
        ? { [pagination.sortBy]: pagination.sortOrder || 'desc' }
        : { enrolledAt: 'desc' },
    }),
    prisma.journeyEnrollment.count({ where }),
  ]);

  return paginate(items as EnrollmentWithJourney[], total, pagination);
}

export async function enrollHousehold(
  data: {
    journeyId: string;
    householdId: string;
    profileId?: string;
  },
  enrolledBy: string
): Promise<JourneyEnrollment> {
  // Verify journey exists and is enabled
  const journey = await prisma.journey.findUnique({ where: { id: data.journeyId } });
  if (!journey) {
    throw new NotFoundError('Journey', data.journeyId);
  }

  if (!journey.enabled) {
    throw new ValidationError('Cannot enroll in a disabled journey');
  }

  // Check for existing active enrollment (unique constraint: journeyId + householdId)
  const existing = await prisma.journeyEnrollment.findUnique({
    where: {
      journeyId_householdId: {
        journeyId: data.journeyId,
        householdId: data.householdId,
      },
    },
  });

  if (existing && existing.status === 'active') {
    throw new ConflictError('Household is already actively enrolled in this journey');
  }

  // If a previous enrollment exists but is not active, check cooldown
  if (existing) {
    if (journey.cooldownHours > 0 && existing.completedAt) {
      const cooldownEnd = new Date(existing.completedAt.getTime() + journey.cooldownHours * 60 * 60 * 1000);
      if (new Date() < cooldownEnd) {
        throw new ValidationError(
          `Cooldown period has not elapsed. Eligible again after ${cooldownEnd.toISOString()}`
        );
      }
    }

    // Re-enroll by updating the existing record
    const updated = await prisma.journeyEnrollment.update({
      where: { id: existing.id },
      data: {
        status: 'active',
        currentStepIndex: 0,
        profileId: data.profileId || null,
        enrolledAt: new Date(),
        lastStepAt: null,
        completedAt: null,
      },
    });

    await logAudit({
      action: 'journey_enrollment.re_enroll',
      entity: 'JourneyEnrollment',
      entityId: updated.id,
      changes: { journeyId: data.journeyId, householdId: data.householdId },
      userId: enrolledBy,
    });

    return updated;
  }

  const enrollment = await prisma.journeyEnrollment.create({
    data: {
      journeyId: data.journeyId,
      householdId: data.householdId,
      profileId: data.profileId || null,
      currentStepIndex: 0,
      status: 'active',
    },
  });

  await logAudit({
    action: 'journey_enrollment.create',
    entity: 'JourneyEnrollment',
    entityId: enrollment.id,
    changes: { journeyId: data.journeyId, householdId: data.householdId },
    userId: enrolledBy,
  });

  return enrollment;
}

// ── Preview ───────────────────────────────────────────────

export async function previewJourney(
  journeyId: string,
  householdId: string
): Promise<JourneyPreview> {
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    include: {
      steps: { orderBy: { orderIndex: 'asc' } },
    },
  });

  if (!journey) {
    throw new NotFoundError('Journey', journeyId);
  }

  // Build preview of what messages would be sent
  let cumulativeDelayHours = 0;
  const messages: PreviewMessage[] = journey.steps.map((step, index) => {
    cumulativeDelayHours += step.delayHours;
    return {
      stepIndex: index,
      orderIndex: step.orderIndex,
      delayHours: step.delayHours,
      messageTemplate: step.messageTemplate,
      conditions: step.conditions,
      scheduledOffsetHours: cumulativeDelayHours,
    };
  });

  return {
    journeyId: journey.id,
    journeyName: journey.name,
    householdId,
    totalSteps: journey.steps.length,
    messages,
  };
}
