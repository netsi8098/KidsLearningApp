import os from 'node:os';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';

// ── Types ─────────────────────────────────────────────────

export interface HealthCheckResult {
  status: 'ok';
  timestamp: string;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  version: string;
}

export interface QueueStat {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

export interface JobDetail {
  id: string;
  queue: string;
  status: string;
  data: Record<string, unknown>;
  progress: number;
  attempts: number;
  createdAt: string;
  finishedAt: string | null;
}

export interface SystemInfo {
  nodeVersion: string;
  platform: string;
  arch: string;
  cpus: number;
  totalMemory: number;
  freeMemory: number;
  uptime: number;
  env: string | undefined;
}

export interface TableStat {
  table: string;
  count: number;
}

// ── Queue Names ───────────────────────────────────────────

const ALL_QUEUES = [
  'media', 'ai', 'release', 'search', 'analytics', 'maintenance', 'notification',
] as const;

// ── Health Check ──────────────────────────────────────────

export async function getHealthCheck(): Promise<HealthCheckResult> {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
  };
}

// ── Queue Stats (mock) ────────────────────────────────────

export async function getQueueStats(queue?: string): Promise<QueueStat[]> {
  // Mock queue data since BullMQ may not be configured
  const mockStats: QueueStat[] = ALL_QUEUES.map((name) => ({
    name,
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
  }));

  if (queue) {
    const filtered = mockStats.filter((q) => q.name === queue);
    if (filtered.length === 0) {
      throw new NotFoundError('Queue', queue);
    }
    return filtered;
  }

  return mockStats;
}

// ── Job Detail (mock) ─────────────────────────────────────

export async function getJobDetail(queue: string, jobId: string): Promise<JobDetail> {
  // Validate queue name
  if (!ALL_QUEUES.includes(queue as typeof ALL_QUEUES[number])) {
    throw new NotFoundError('Queue', queue);
  }

  // Mock implementation - in production this would query BullMQ
  throw new NotFoundError('Job', `${queue}/${jobId}`);
}

// ── Retry Job (mock) ──────────────────────────────────────

export async function retryJob(
  queue: string,
  jobId: string
): Promise<{ success: true; message: string }> {
  // Validate queue name
  if (!ALL_QUEUES.includes(queue as typeof ALL_QUEUES[number])) {
    throw new NotFoundError('Queue', queue);
  }

  // Mock implementation - in production this would retry via BullMQ
  return { success: true, message: 'Job queued for retry' };
}

// ── Cancel Job (mock) ─────────────────────────────────────

export async function cancelJob(
  queue: string,
  jobId: string
): Promise<{ success: true; message: string }> {
  // Validate queue name
  if (!ALL_QUEUES.includes(queue as typeof ALL_QUEUES[number])) {
    throw new NotFoundError('Queue', queue);
  }

  // Mock implementation - in production this would cancel via BullMQ
  return { success: true, message: 'Job cancelled' };
}

// ── System Info ───────────────────────────────────────────

export async function getSystemInfo(): Promise<SystemInfo> {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    uptime: os.uptime(),
    env: process.env.NODE_ENV,
  };
}

// ── DB Stats ──────────────────────────────────────────────

export async function getDbStats(): Promise<TableStat[]> {
  const tables = [
    { table: 'Content', relation: 'Content' },
    { table: 'Asset', relation: 'Asset' },
    { table: 'Collection', relation: 'Collection' },
    { table: 'User', relation: 'User' },
    { table: 'AuditLog', relation: 'AuditLog' },
    { table: 'Household', relation: 'Household' },
  ];

  const stats: TableStat[] = [];

  for (const { table, relation } of tables) {
    const result = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::bigint AS count FROM "${relation}"
    `;
    stats.push({
      table,
      count: Number(result[0].count),
    });
  }

  return stats;
}

// ── Clear Cache (stub) ────────────────────────────────────

export async function clearCache(
  pattern: string = '*'
): Promise<{ cleared: true; pattern: string }> {
  // Stub for future Redis integration
  return { cleared: true, pattern };
}
