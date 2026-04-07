import 'dotenv/config';
import { createWorker } from './lib/queue.js';

console.log('Starting workers...');
console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`  Redis: ${process.env.REDIS_URL || 'redis://localhost:6379'}`);

// ── Media Processing Worker ───────────────────────────────────
// Handles image resizing (sharp), video transcoding, thumbnail generation
const mediaWorker = createWorker('media-processing', async (job) => {
  console.log(`[media-processing] Job ${job.id}: ${job.name}`, job.data);
  // Processor logic is imported from respective modules at runtime
  // e.g., image resize, format conversion, thumbnail generation
}, { concurrency: parseInt(process.env.WORKER_MEDIA_CONCURRENCY || '2') });

// ── AI Generation Worker ──────────────────────────────────────
// Handles story generation, illustration prompts, voice synthesis
const aiWorker = createWorker('ai-generation', async (job) => {
  console.log(`[ai-generation] Job ${job.id}: ${job.name}`, job.data);
}, { concurrency: parseInt(process.env.WORKER_AI_CONCURRENCY || '1') });

// ── Content Release Worker ────────────────────────────────────
// Scheduled content publishing, version promotion
const releaseWorker = createWorker('content-release', async (job) => {
  console.log(`[content-release] Job ${job.id}: ${job.name}`, job.data);
}, { concurrency: 1 });

// ── Localization Worker ───────────────────────────────────────
// Translation jobs, locale-specific asset generation
const localizationWorker = createWorker('localization', async (job) => {
  console.log(`[localization] Job ${job.id}: ${job.name}`, job.data);
}, { concurrency: 2 });

// ── Offline Packs Worker ──────────────────────────────────────
// Bundle generation for offline content packs
const offlinePackWorker = createWorker('offline-packs', async (job) => {
  console.log(`[offline-packs] Job ${job.id}: ${job.name}`, job.data);
}, { concurrency: 1 });

// ── Analytics Aggregation Worker ──────────────────────────────
// Roll up raw events into daily/weekly summaries
const analyticsWorker = createWorker('analytics-aggregate', async (job) => {
  console.log(`[analytics-aggregate] Job ${job.id}: ${job.name}`, job.data);
}, { concurrency: 1 });

// ── Content QA Worker ─────────────────────────────────────────
// Automated quality checks on content submissions
const qaWorker = createWorker('content-qa', async (job) => {
  console.log(`[content-qa] Job ${job.id}: ${job.name}`, job.data);
}, { concurrency: 1 });

const workers = [
  mediaWorker,
  aiWorker,
  releaseWorker,
  localizationWorker,
  offlinePackWorker,
  analyticsWorker,
  qaWorker,
];

// ── Graceful Shutdown ─────────────────────────────────────────
let isShuttingDown = false;

async function shutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\nReceived ${signal}. Shutting down workers gracefully...`);

  try {
    await Promise.all(workers.map((w) => w.close()));
    console.log('All workers stopped cleanly.');
    process.exit(0);
  } catch (err) {
    console.error('Error during worker shutdown:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors so workers don't silently die
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception in worker process:', err);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection in worker process:', reason);
  shutdown('unhandledRejection');
});

console.log(`${workers.length} workers started successfully.`);
console.log('  Queues: media-processing, ai-generation, content-release,');
console.log('          localization, offline-packs, analytics-aggregate, content-qa');
