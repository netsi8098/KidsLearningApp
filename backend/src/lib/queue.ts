import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// ── Queue Factory ──────────────────────────────────────────
export function createQueue(name: string) {
  return new Queue(name, { connection });
}

// ── Worker Factory ─────────────────────────────────────────
export function createWorker<T = unknown>(
  name: string,
  processor: (job: Job<T>) => Promise<void>,
  opts?: { concurrency?: number }
) {
  return new Worker<T>(name, processor, {
    connection,
    concurrency: opts?.concurrency ?? 1,
  });
}

// ── Predefined Queues ──────────────────────────────────────
export const mediaQueue = createQueue('media-processing');
export const aiQueue = createQueue('ai-generation');
export const releaseQueue = createQueue('content-release');
export const localizationQueue = createQueue('localization');
export const offlinePackQueue = createQueue('offline-packs');
export const analyticsQueue = createQueue('analytics-aggregate');
export const qaQueue = createQueue('content-qa');
