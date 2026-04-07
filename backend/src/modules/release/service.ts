import { prisma } from '../../lib/prisma.js';
import { releaseQueue } from '../../lib/queue.js';
import { ContentStatus } from '@prisma/client';
import { NotFoundError, ValidationError, ConflictError } from '../../lib/errors.js';
import type { PaginatedResult } from '../../types/index.js';
import { paginate } from '../../types/index.js';
import type {
  CreateReleaseInput,
  UpdateReleaseInput,
  ListReleasesQuery,
  CalendarQuery,
  BatchCreateInput,
} from './schemas.js';

// ── Status Transition Validations ─────────────────────────

const ACTION_REQUIRES_STATUS: Record<string, string[]> = {
  publish: ['approved', 'scheduled'],
  unpublish: ['published'],
  archive: ['published', 'unpublished'],
  feature: ['published'],
  unfeature: ['published'],
};

function validateContentForAction(contentStatus: string, action: string): void {
  const allowedStatuses = ACTION_REQUIRES_STATUS[action];
  if (allowedStatuses && !allowedStatuses.includes(contentStatus)) {
    throw new ValidationError(
      `Cannot "${action}" content with status "${contentStatus}". Content must be in one of: ${allowedStatuses.join(', ')}.`
    );
  }
}

// ── List Releases ─────────────────────────────────────────

export async function listReleases(query: ListReleasesQuery): Promise<PaginatedResult<unknown>> {
  const { page, limit, sortBy, sortOrder, status, action, from, to } = query;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (action) where.action = action;

  if (from || to) {
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
    where.scheduledAt = dateFilter;
  }

  const [releases, total] = await Promise.all([
    prisma.release.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        content: {
          select: { id: true, title: true, type: true, status: true },
        },
        creator: {
          select: { id: true, email: true },
        },
      },
    }),
    prisma.release.count({ where }),
  ]);

  return paginate(releases, total, { page, limit, sortBy, sortOrder });
}

// ── Get Release By ID ─────────────────────────────────────

export async function getRelease(id: string) {
  const release = await prisma.release.findUnique({
    where: { id },
    include: {
      content: {
        select: { id: true, title: true, type: true, status: true, ageGroup: true },
      },
      creator: {
        select: { id: true, email: true },
      },
    },
  });

  if (!release) {
    throw new NotFoundError('Release', id);
  }

  return release;
}

// ── Create Release ────────────────────────────────────────

export async function createRelease(data: CreateReleaseInput, createdById: string) {
  // Verify content exists
  const content = await prisma.content.findUnique({
    where: { id: data.contentId },
  });

  if (!content) {
    throw new NotFoundError('Content', data.contentId);
  }

  // Validate that the action is allowed for current content status
  validateContentForAction(content.status, data.action);

  const isScheduled = !!data.scheduledAt;
  const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;

  // Validate scheduled time is in the future
  if (scheduledAt && scheduledAt <= new Date()) {
    throw new ValidationError('Scheduled time must be in the future.');
  }

  const release = await prisma.release.create({
    data: {
      contentId: data.contentId,
      action: data.action,
      status: isScheduled ? 'scheduled' : 'pending',
      scheduledAt,
      notes: data.notes,
      createdBy: createdById,
    },
    include: {
      content: {
        select: { id: true, title: true, type: true, status: true },
      },
    },
  });

  // If scheduled, create a BullMQ delayed job
  if (isScheduled && scheduledAt) {
    const delay = scheduledAt.getTime() - Date.now();
    await releaseQueue.add(
      'execute-release',
      { releaseId: release.id, contentId: data.contentId, action: data.action },
      {
        delay,
        jobId: `release-${release.id}`,
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
  }

  // If not scheduled, execute immediately
  if (!isScheduled) {
    return executeReleaseAction(release.id);
  }

  return release;
}

// ── Execute Release ───────────────────────────────────────

export async function executeReleaseAction(id: string) {
  const release = await prisma.release.findUnique({
    where: { id },
    include: { content: true },
  });

  if (!release) {
    throw new NotFoundError('Release', id);
  }

  if (release.status === 'completed') {
    throw new ConflictError('Release has already been executed.');
  }

  if (release.status === 'cancelled') {
    throw new ConflictError('Cannot execute a cancelled release.');
  }

  // Re-validate content status at execution time
  validateContentForAction(release.content.status, release.action);

  // Determine the new content status based on the action
  const statusMap: Record<string, string> = {
    publish: 'published',
    unpublish: 'draft',
    archive: 'archived',
  };

  try {
    // Use a transaction to update both content and release atomically
    const result = await prisma.$transaction(async (tx) => {
      // Update content status for status-changing actions
      if (statusMap[release.action]) {
        await tx.content.update({
          where: { id: release.contentId },
          data: {
            status: statusMap[release.action] as ContentStatus,
            ...(release.action === 'publish' ? { publishedAt: new Date() } : {}),
            ...(release.action === 'archive' ? { archivedAt: new Date() } : {}),
          },
        });
      }

      // Handle feature/unfeature
      if (release.action === 'feature') {
        await tx.content.update({
          where: { id: release.contentId },
          data: { featured: true },
        });
      }

      if (release.action === 'unfeature') {
        await tx.content.update({
          where: { id: release.contentId },
          data: { featured: false },
        });
      }

      // Mark release as executed
      const updatedRelease = await tx.release.update({
        where: { id },
        data: {
          status: 'completed',
          executedAt: new Date(),
        },
        include: {
          content: {
            select: { id: true, title: true, type: true, status: true },
          },
        },
      });

      return updatedRelease;
    });

    return result;
  } catch (error) {
    // Mark release as failed
    await prisma.release.update({
      where: { id },
      data: {
        status: 'failed',
        notes: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    throw error;
  }
}

// ── Update Release (Cancel / Reschedule) ──────────────────

export async function updateRelease(id: string, data: UpdateReleaseInput) {
  const release = await prisma.release.findUnique({ where: { id } });

  if (!release) {
    throw new NotFoundError('Release', id);
  }

  if (release.status === 'completed') {
    throw new ConflictError('Cannot modify an already executed release.');
  }

  if (release.status === 'cancelled') {
    throw new ConflictError('Cannot modify a cancelled release.');
  }

  // Handle cancellation
  if (data.status === 'cancelled') {
    // Cancel the BullMQ job if it exists
    const job = await releaseQueue.getJob(`release-${id}`);
    if (job) {
      await job.remove();
    }

    const updated = await prisma.release.update({
      where: { id },
      data: {
        status: 'cancelled',
        notes: data.notes ?? release.notes,
      },
    });

    return updated;
  }

  // Handle rescheduling
  if (data.scheduledAt) {
    const newScheduledAt = new Date(data.scheduledAt);

    if (newScheduledAt <= new Date()) {
      throw new ValidationError('Scheduled time must be in the future.');
    }

    // Cancel existing job
    const existingJob = await releaseQueue.getJob(`release-${id}`);
    if (existingJob) {
      await existingJob.remove();
    }

    // Create new delayed job
    const delay = newScheduledAt.getTime() - Date.now();
    await releaseQueue.add(
      'execute-release',
      { releaseId: id, contentId: release.contentId, action: release.action },
      {
        delay,
        jobId: `release-${id}`,
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    const updated = await prisma.release.update({
      where: { id },
      data: {
        scheduledAt: newScheduledAt,
        status: 'scheduled',
        notes: data.notes ?? release.notes,
      },
    });

    return updated;
  }

  // Update notes only
  const updated = await prisma.release.update({
    where: { id },
    data: {
      notes: data.notes ?? release.notes,
    },
  });

  return updated;
}

// ── Calendar View ─────────────────────────────────────────

export async function getCalendar(query: CalendarQuery) {
  const from = new Date(query.from);
  const to = new Date(query.to);

  const releases = await prisma.release.findMany({
    where: {
      OR: [
        { scheduledAt: { gte: from, lte: to } },
        { executedAt: { gte: from, lte: to } },
      ],
    },
    include: {
      content: {
        select: { id: true, title: true, type: true, status: true, emoji: true },
      },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  // Group releases by date
  const calendar: Record<string, typeof releases> = {};

  for (const release of releases) {
    const dateKey = (release.scheduledAt ?? release.createdAt).toISOString().split('T')[0];
    if (!calendar[dateKey]) {
      calendar[dateKey] = [];
    }
    calendar[dateKey].push(release);
  }

  return calendar;
}

// ── Batch Create Releases ─────────────────────────────────

export async function batchCreateReleases(data: BatchCreateInput, createdById: string) {
  const results: Array<{ contentId: string; success: boolean; release?: unknown; error?: string }> = [];

  for (const item of data.releases) {
    try {
      const release = await createRelease(item, createdById);
      results.push({ contentId: item.contentId, success: true, release });
    } catch (error) {
      results.push({
        contentId: item.contentId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  return {
    total: data.releases.length,
    succeeded: successCount,
    failed: failureCount,
    results,
  };
}
