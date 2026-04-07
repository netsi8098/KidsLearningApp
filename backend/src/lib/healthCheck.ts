import { prisma } from './prisma.js';
import { logger } from './logger.js';
import IORedis from 'ioredis';

// ── Health Check System ──────────────────────────────────────────────────────
// Comprehensive dependency health checks for Kubernetes readiness/liveness
// probes, load balancer health checks, and operational dashboards.
//
// Endpoints:
//   GET /health       - Simple liveness check (always fast)
//   GET /health/ready - Full readiness check (checks all dependencies)
// ─────────────────────────────────────────────────────────────────────────────

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface DependencyCheck {
  status: HealthStatus;
  latencyMs: number;
  message?: string;
}

export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: string;
  version: string;
  uptime: number;
  checks: Record<string, DependencyCheck>;
}

// ── Individual Dependency Checks ─────────────────────────────────────────────

/** Check database connectivity via a simple query */
async function checkDatabase(): Promise<DependencyCheck> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    logger.error({ err }, 'Database health check failed');
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      message: err instanceof Error ? err.message : 'Unknown database error',
    };
  }
}

/** Check Redis connectivity via PING */
async function checkRedis(): Promise<DependencyCheck> {
  const start = Date.now();
  let redis: IORedis | null = null;
  try {
    redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      lazyConnect: true,
    });
    await redis.connect();
    const pong = await redis.ping();
    await redis.quit();

    if (pong === 'PONG') {
      return { status: 'healthy', latencyMs: Date.now() - start };
    }
    return { status: 'degraded', latencyMs: Date.now() - start, message: `Unexpected ping response: ${pong}` };
  } catch (err) {
    if (redis) {
      try { await redis.quit(); } catch { /* ignore cleanup errors */ }
    }
    logger.error({ err }, 'Redis health check failed');
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      message: err instanceof Error ? err.message : 'Unknown Redis error',
    };
  }
}

/** Check storage accessibility */
async function checkStorage(): Promise<DependencyCheck> {
  const start = Date.now();
  try {
    const provider = process.env.STORAGE_PROVIDER || 'local';

    if (provider === 'local') {
      const fs = await import('fs/promises');
      const storagePath = process.env.STORAGE_LOCAL_PATH || './uploads';
      await fs.access(storagePath);
      return { status: 'healthy', latencyMs: Date.now() - start };
    }

    // S3 check: would use HeadBucket in production
    // For now, mark as healthy if configured
    if (process.env.STORAGE_S3_BUCKET) {
      return { status: 'healthy', latencyMs: Date.now() - start, message: 'S3 configured (no active check)' };
    }

    return { status: 'degraded', latencyMs: Date.now() - start, message: 'No storage provider configured' };
  } catch (err) {
    logger.error({ err }, 'Storage health check failed');
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      message: err instanceof Error ? err.message : 'Unknown storage error',
    };
  }
}

/** Check BullMQ queue connectivity and depth */
async function checkQueues(): Promise<DependencyCheck> {
  const start = Date.now();
  try {
    // Import queues dynamically to avoid circular dependencies
    const { mediaQueue, aiQueue, releaseQueue, localizationQueue, offlinePackQueue, analyticsQueue, qaQueue } = await import('./queue.js');

    const queues = [
      { name: 'media-processing', queue: mediaQueue },
      { name: 'ai-generation', queue: aiQueue },
      { name: 'content-release', queue: releaseQueue },
      { name: 'localization', queue: localizationQueue },
      { name: 'offline-packs', queue: offlinePackQueue },
      { name: 'analytics-aggregate', queue: analyticsQueue },
      { name: 'content-qa', queue: qaQueue },
    ];

    const depths: Record<string, number> = {};
    let totalWaiting = 0;

    for (const { name, queue } of queues) {
      const waiting = await queue.getWaitingCount();
      depths[name] = waiting;
      totalWaiting += waiting;
    }

    // Degraded if any queue has significant backlog
    const status: HealthStatus = totalWaiting > 1000 ? 'degraded' : 'healthy';
    return {
      status,
      latencyMs: Date.now() - start,
      message: `Total waiting jobs: ${totalWaiting}`,
    };
  } catch (err) {
    logger.error({ err }, 'Queue health check failed');
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      message: err instanceof Error ? err.message : 'Unknown queue error',
    };
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Simple liveness check. Always returns quickly.
 * Use for Kubernetes liveness probes and load balancer health checks.
 */
export function livenessCheck() {
  return {
    status: 'ok' as const,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Full readiness check that verifies all dependencies.
 * Use for Kubernetes readiness probes and operational dashboards.
 * Returns 'healthy' only if all dependencies are available.
 */
export async function detailedHealthCheck(): Promise<HealthCheckResult> {
  const [database, redis, storage, queues] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkStorage(),
    checkQueues(),
  ]);

  const checks = { database, redis, storage, queues };

  // Overall status: unhealthy if any dependency is unhealthy, degraded if any is degraded
  let status: HealthStatus = 'healthy';
  for (const check of Object.values(checks)) {
    if (check.status === 'unhealthy') {
      status = 'unhealthy';
      break;
    }
    if (check.status === 'degraded') {
      status = 'degraded';
    }
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || 'unknown',
    uptime: process.uptime(),
    checks,
  };
}
