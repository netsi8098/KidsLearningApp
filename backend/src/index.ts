import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { validateConfig, getConfig } from './config/index.js';
import { getRedactedConfig } from './config/secrets.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { metricsMiddleware, metricsEndpoint, metricsJsonEndpoint } from './middleware/metricsMiddleware.js';
import { maintenanceMode } from './middleware/maintenanceMode.js';
import { logger } from './lib/logger.js';
import { livenessCheck, detailedHealthCheck } from './lib/healthCheck.js';

// ── Validate configuration before anything else ──────────
const config = validateConfig();

// Module routers
import authRouter from './modules/auth/router.js';
import contentRouter from './modules/content/router.js';
import curriculumRouter from './modules/curriculum/router.js';
import releaseRouter from './modules/release/router.js';
import qaRouter from './modules/qa/router.js';
import briefRouter from './modules/brief/router.js';
import storyPipelineRouter from './modules/story-pipeline/router.js';
import illustrationRouter from './modules/illustration/router.js';
import promptsRouter from './modules/prompts/router.js';
import voiceRouter from './modules/voice/router.js';
import localizationRouter from './modules/localization/router.js';
import mediaRouter from './modules/media/router.js';
import offlinePacksRouter from './modules/offline-packs/router.js';
import searchRouter from './modules/search/router.js';
import experimentsRouter from './modules/experiments/router.js';
import analyticsRouter from './modules/analytics/router.js';
import reviewRouter from './modules/review/router.js';
import dedupRouter from './modules/dedup/router.js';
import governanceRouter from './modules/governance/router.js';
import auditRouter from './modules/audit/router.js';
import permissionsRouter from './modules/permissions/router.js';
import householdRouter from './modules/household/router.js';
import systemRouter from './modules/system/router.js';
import maintenanceRouter from './modules/maintenance/router.js';
import subscriptionRouter from './modules/subscription/router.js';
import featureFlagsRouter from './modules/feature-flags/router.js';
import syncRouter from './modules/sync/router.js';
import deepLinksRouter from './modules/deep-links/router.js';
import parentTipsRouter from './modules/parent-tips/router.js';
import helpCenterRouter from './modules/help-center/router.js';
import privacyRouter from './modules/privacy/router.js';
import messagesRouter from './modules/messages/router.js';
import journeysRouter from './modules/journeys/router.js';
import caregiverRouter from './modules/caregiver/router.js';
import routinesRouter from './modules/routines/router.js';
import recommendationRouter from './modules/recommendation/router.js';
import merchandisingRouter from './modules/merchandising/router.js';
import performanceRouter from './modules/performance/router.js';
import errorsRouter from './modules/errors/router.js';
import exportsRouter from './modules/exports/router.js';

const app = express();

// ── Global Middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(metricsMiddleware);
app.use(
  rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ── Health & Metrics Endpoints ────────────────────────────
app.get('/health', (_req, res) => {
  res.json(livenessCheck());
});

app.get('/health/ready', async (_req, res) => {
  const result = await detailedHealthCheck();
  const statusCode = result.status === 'healthy' ? 200 : result.status === 'degraded' ? 200 : 503;
  res.status(statusCode).json(result);
});

app.get('/metrics', metricsEndpoint);
app.get('/metrics/json', metricsJsonEndpoint);

// ── Maintenance Mode Gate (after health, before API routes) ─
app.use(maintenanceMode);

// ── API Routes ─────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/content', contentRouter);
app.use('/api/curriculum', curriculumRouter);
app.use('/api/releases', releaseRouter);
app.use('/api/qa', qaRouter);
app.use('/api/briefs', briefRouter);
app.use('/api/story-pipeline', storyPipelineRouter);
app.use('/api/illustrations', illustrationRouter);
app.use('/api/prompts', promptsRouter);
app.use('/api/voice', voiceRouter);
app.use('/api/localization', localizationRouter);
app.use('/api/media', mediaRouter);
app.use('/api/offline-packs', offlinePacksRouter);
app.use('/api/search', searchRouter);
app.use('/api/experiments', experimentsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/dedup', dedupRouter);
app.use('/api/governance', governanceRouter);
app.use('/api/audit', auditRouter);
app.use('/api/permissions', permissionsRouter);
app.use('/api/households', householdRouter);
app.use('/api/system', systemRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/feature-flags', featureFlagsRouter);
app.use('/api/sync', syncRouter);
app.use('/api/deep-links', deepLinksRouter);
app.use('/api/parent-tips', parentTipsRouter);
app.use('/api/help', helpCenterRouter);
app.use('/api/privacy', privacyRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/journeys', journeysRouter);
app.use('/api/caregivers', caregiverRouter);
app.use('/api/routines', routinesRouter);
app.use('/api/recommendations', recommendationRouter);
app.use('/api/merchandising', merchandisingRouter);
app.use('/api/performance', performanceRouter);
app.use('/api/errors', errorsRouter);
app.use('/api/exports', exportsRouter);

// Serve uploads locally in dev
if (config.storageProvider !== 's3') {
  app.use('/uploads', express.static(config.storageLocalPath));
}

// ── Error Handler (must be last) ───────────────────────────
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────
app.listen(config.port, () => {
  logger.info({
    port: config.port,
    env: config.nodeEnv,
    logLevel: config.logLevel,
  }, 'Kids Learning Backend started');

  if (config.nodeEnv === 'development') {
    logger.debug({ config: getRedactedConfig() }, 'Loaded configuration');
  }
});

export default app;
