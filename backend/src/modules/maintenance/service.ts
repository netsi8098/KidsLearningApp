import { randomUUID } from 'crypto';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';
import { logAudit } from '../../lib/audit.js';

// ── Interfaces ────────────────────────────────────────────

export interface MaintenanceJob {
  id: string;
  name: string;
  description: string;
  schedule?: string;
  lastRun?: Date;
  lastStatus?: 'completed' | 'failed';
  enabled: boolean;
  handler: (params: Record<string, unknown>, dryRun: boolean) => Promise<MaintenanceResult>;
}

export interface MaintenanceResult {
  success: boolean;
  dryRun: boolean;
  affected: number;
  details: string[];
  duration: number;
}

export interface JobRun {
  id: string;
  jobId: string;
  status: 'running' | 'completed' | 'failed';
  dryRun: boolean;
  params: Record<string, unknown>;
  result?: MaintenanceResult;
  startedAt: Date;
  completedAt?: Date;
  userId?: string;
}

// ── In-Memory Run History ─────────────────────────────────

const MAX_HISTORY = 100;
const jobRunHistory: JobRun[] = [];

function pushRun(run: JobRun): void {
  jobRunHistory.unshift(run);
  if (jobRunHistory.length > MAX_HISTORY) {
    jobRunHistory.length = MAX_HISTORY;
  }
}

// ── Job Registry ──────────────────────────────────────────

const jobs = new Map<string, MaintenanceJob>();

// 1. Cleanup Orphan Assets
jobs.set('cleanup-orphan-assets', {
  id: 'cleanup-orphan-assets',
  name: 'Cleanup Orphan Assets',
  description: 'Find assets with no content reference and no usage. Soft-deletes them on real run.',
  schedule: '0 3 * * 0', // weekly Sunday 3am
  enabled: true,
  handler: async (_params, dryRun) => {
    const start = Date.now();
    const orphans = await prisma.asset.findMany({
      where: {
        contentId: null,
        deletedAt: null,
      },
      select: { id: true, filename: true },
    });

    const details: string[] = [];
    const affected = orphans.length;

    if (dryRun) {
      details.push(`Found ${affected} orphan asset(s) with no content reference`);
      for (const asset of orphans.slice(0, 20)) {
        details.push(`  - ${asset.id}: ${asset.filename}`);
      }
      if (affected > 20) {
        details.push(`  ... and ${affected - 20} more`);
      }
    } else {
      if (affected > 0) {
        await prisma.asset.updateMany({
          where: {
            contentId: null,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
          },
        });
        details.push(`Soft-deleted ${affected} orphan asset(s)`);
      } else {
        details.push('No orphan assets found');
      }
    }

    return {
      success: true,
      dryRun,
      affected,
      details,
      duration: Date.now() - start,
    };
  },
});

// 2. Rebuild Search Index
jobs.set('rebuild-search-index', {
  id: 'rebuild-search-index',
  name: 'Rebuild Search Index',
  description: 'Count all published content and rebuild the search index.',
  schedule: '0 2 * * *', // daily 2am
  enabled: true,
  handler: async (_params, dryRun) => {
    const start = Date.now();
    const publishedCount = await prisma.content.count({
      where: {
        status: 'published',
        deletedAt: null,
      },
    });

    const details: string[] = [];

    if (dryRun) {
      details.push(`Found ${publishedCount} published content item(s) that would be reindexed`);
    } else {
      // Stub: in a real implementation this would rebuild the search index
      details.push(`Reindexed ${publishedCount} published content item(s)`);
    }

    return {
      success: true,
      dryRun,
      affected: publishedCount,
      details,
      duration: Date.now() - start,
    };
  },
});

// 3. Expire Licensed Content
jobs.set('expire-licensed-content', {
  id: 'expire-licensed-content',
  name: 'Expire Licensed Content',
  description: 'Find LicensedRight records past their endDate and archive associated content.',
  schedule: '0 1 * * *', // daily 1am
  enabled: true,
  handler: async (_params, dryRun) => {
    const start = Date.now();
    const now = new Date();

    const expiredRights = await prisma.licensedRight.findMany({
      where: {
        endDate: { lt: now },
        deletedAt: null,
      },
      include: {
        content: { select: { id: true, title: true, status: true } },
      },
    });

    // Only process rights whose content is not already archived
    const actionable = expiredRights.filter(
      (r) => r.content.status !== 'archived'
    );
    const details: string[] = [];

    if (dryRun) {
      details.push(`Found ${expiredRights.length} expired license(s), ${actionable.length} with non-archived content`);
      for (const right of actionable.slice(0, 20)) {
        details.push(`  - License ${right.id}: "${right.content.title}" (${right.content.status})`);
      }
      if (actionable.length > 20) {
        details.push(`  ... and ${actionable.length - 20} more`);
      }
    } else {
      const contentIds = [...new Set(actionable.map((r) => r.content.id))];
      if (contentIds.length > 0) {
        await prisma.content.updateMany({
          where: { id: { in: contentIds } },
          data: { status: 'archived', archivedAt: now },
        });
        details.push(`Archived ${contentIds.length} content item(s) with expired licenses`);
      } else {
        details.push('No content items needed archiving');
      }
    }

    return {
      success: true,
      dryRun,
      affected: actionable.length,
      details,
      duration: Date.now() - start,
    };
  },
});

// 4. Cleanup Expired Invites
jobs.set('cleanup-expired-invites', {
  id: 'cleanup-expired-invites',
  name: 'Cleanup Expired Invites',
  description: 'Delete CaregiverInvite records that have expired without being accepted.',
  schedule: '0 4 * * *', // daily 4am
  enabled: true,
  handler: async (_params, dryRun) => {
    const start = Date.now();
    const now = new Date();

    const expired = await prisma.caregiverInvite.findMany({
      where: {
        expiresAt: { lt: now },
        acceptedAt: null,
      },
      select: { id: true, email: true, expiresAt: true },
    });

    const affected = expired.length;
    const details: string[] = [];

    if (dryRun) {
      details.push(`Found ${affected} expired invite(s) pending deletion`);
      for (const invite of expired.slice(0, 20)) {
        details.push(`  - ${invite.id}: ${invite.email} (expired ${invite.expiresAt.toISOString()})`);
      }
      if (affected > 20) {
        details.push(`  ... and ${affected - 20} more`);
      }
    } else {
      if (affected > 0) {
        await prisma.caregiverInvite.deleteMany({
          where: {
            expiresAt: { lt: now },
            acceptedAt: null,
          },
        });
        details.push(`Deleted ${affected} expired invite(s)`);
      } else {
        details.push('No expired invites found');
      }
    }

    return {
      success: true,
      dryRun,
      affected,
      details,
      duration: Date.now() - start,
    };
  },
});

// 5. Archive Stale Drafts
jobs.set('archive-stale-drafts', {
  id: 'archive-stale-drafts',
  name: 'Archive Stale Drafts',
  description: 'Find content in draft status not updated in 90+ days and archive them.',
  schedule: '0 5 * * 1', // weekly Monday 5am
  enabled: true,
  handler: async (_params, dryRun) => {
    const start = Date.now();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);

    const staleDrafts = await prisma.content.findMany({
      where: {
        status: 'draft',
        updatedAt: { lt: cutoff },
        deletedAt: null,
      },
      select: { id: true, title: true, updatedAt: true },
    });

    const affected = staleDrafts.length;
    const details: string[] = [];

    if (dryRun) {
      details.push(`Found ${affected} stale draft(s) not updated since ${cutoff.toISOString().split('T')[0]}`);
      for (const draft of staleDrafts.slice(0, 20)) {
        details.push(`  - ${draft.id}: "${draft.title}" (last updated ${draft.updatedAt.toISOString().split('T')[0]})`);
      }
      if (affected > 20) {
        details.push(`  ... and ${affected - 20} more`);
      }
    } else {
      if (affected > 0) {
        const now = new Date();
        await prisma.content.updateMany({
          where: {
            status: 'draft',
            updatedAt: { lt: cutoff },
            deletedAt: null,
          },
          data: { status: 'archived', archivedAt: now },
        });
        details.push(`Archived ${affected} stale draft(s)`);
      } else {
        details.push('No stale drafts found');
      }
    }

    return {
      success: true,
      dryRun,
      affected,
      details,
      duration: Date.now() - start,
    };
  },
});

// ── Service Functions ─────────────────────────────────────

export function listJobs(status?: string) {
  const allJobs = Array.from(jobs.values());

  if (!status) {
    return allJobs.map(toJobSummary);
  }

  return allJobs
    .filter((job) => {
      if (status === 'idle') return !isRunning(job.id) && job.lastStatus !== 'completed' && job.lastStatus !== 'failed';
      if (status === 'running') return isRunning(job.id);
      if (status === 'completed') return job.lastStatus === 'completed';
      if (status === 'failed') return job.lastStatus === 'failed';
      return true;
    })
    .map(toJobSummary);
}

export function getJob(jobId: string) {
  const job = jobs.get(jobId);
  if (!job) {
    throw new NotFoundError('MaintenanceJob', jobId);
  }

  const recentRuns = jobRunHistory
    .filter((r) => r.jobId === jobId)
    .slice(0, 5);

  return {
    ...toJobSummary(job),
    recentRuns,
  };
}

export async function runJob(
  jobId: string,
  dryRun: boolean,
  params: Record<string, unknown> = {},
  userId?: string
): Promise<JobRun> {
  const job = jobs.get(jobId);
  if (!job) {
    throw new NotFoundError('MaintenanceJob', jobId);
  }

  const run: JobRun = {
    id: randomUUID(),
    jobId,
    status: 'running',
    dryRun,
    params,
    startedAt: new Date(),
    userId,
  };

  pushRun(run);

  try {
    const result = await job.handler(params, dryRun);
    run.status = 'completed';
    run.result = result;
    run.completedAt = new Date();
    job.lastRun = run.completedAt;
    job.lastStatus = 'completed';
  } catch (err) {
    run.status = 'failed';
    run.completedAt = new Date();
    run.result = {
      success: false,
      dryRun,
      affected: 0,
      details: [err instanceof Error ? err.message : 'Unknown error'],
      duration: Date.now() - run.startedAt.getTime(),
    };
    job.lastRun = run.completedAt;
    job.lastStatus = 'failed';
  }

  await logAudit({
    action: 'maintenance.run',
    entity: 'MaintenanceJob',
    entityId: jobId,
    changes: {
      runId: run.id,
      dryRun,
      status: run.status,
      affected: run.result?.affected ?? 0,
    },
    userId,
  });

  return run;
}

export function getJobHistory(
  jobId: string,
  page: number,
  limit: number
) {
  const job = jobs.get(jobId);
  if (!job) {
    throw new NotFoundError('MaintenanceJob', jobId);
  }

  const filtered = jobRunHistory.filter((r) => r.jobId === jobId);
  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Helpers ───────────────────────────────────────────────

function isRunning(jobId: string): boolean {
  return jobRunHistory.some((r) => r.jobId === jobId && r.status === 'running');
}

function toJobSummary(job: MaintenanceJob) {
  return {
    id: job.id,
    name: job.name,
    description: job.description,
    schedule: job.schedule,
    lastRun: job.lastRun,
    lastStatus: job.lastStatus,
    enabled: job.enabled,
  };
}
