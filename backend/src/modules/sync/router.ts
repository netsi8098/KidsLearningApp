import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as syncService from './service.js';
import {
  pushChangesSchema,
  pullChangesSchema,
  syncStatusSchema,
  resolveConflictSchema,
  resetCheckpointSchema,
} from './schemas.js';

export const router = Router();

// ── POST /api/sync/push — push local changes to server ───

router.post('/push', authenticate, validate(pushChangesSchema), async (req, res) => {
  const { profileId, changes } = req.body;
  const result = await syncService.push(profileId, changes);
  res.json({ success: true, ...result });
});

// ── POST /api/sync/pull — pull server changes since checkpoint ──

router.post('/pull', authenticate, validate(pullChangesSchema), async (req, res) => {
  const { profileId, entityType, sinceVersion } = req.body;
  const result = await syncService.pull(profileId, entityType, sinceVersion);
  res.json({ data: result });
});

// ── GET /api/sync/status/:profileId — sync status per entity type ──

router.get(
  '/status/:profileId',
  authenticate,
  validate(syncStatusSchema),
  async (req, res) => {
    const { profileId } = req.params;
    const checkpoints = await syncService.getStatus(profileId as string);
    res.json({ data: checkpoints });
  }
);

// ── POST /api/sync/resolve — resolve a sync conflict ─────

router.post('/resolve', authenticate, validate(resolveConflictSchema), async (req, res) => {
  const { profileId, entityType, entityId, resolution, clientPayload } = req.body;
  const result = await syncService.resolve(profileId, entityType, entityId, resolution, clientPayload);
  res.json({ success: true, ...result });
});

// ── POST /api/sync/reset/:profileId — reset sync checkpoint (admin only) ──

router.post(
  '/reset/:profileId',
  authenticate,
  requireRole('admin'),
  validate(resetCheckpointSchema),
  async (req, res) => {
    const { profileId } = req.params;
    const result = await syncService.resetCheckpoint(profileId as string);
    res.json({ success: true, message: 'Sync checkpoints reset', ...result });
  }
);

export default router;
