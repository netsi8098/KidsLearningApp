import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as auditService from './service.js';
import {
  listAuditLogsSchema,
  getAuditLogSchema,
  entityTrailSchema,
} from './schemas.js';

const router = Router();

// ── GET /api/audit — list audit logs with filters ────────

router.get(
  '/',
  authenticate,
  requireRole('admin'),
  validate(listAuditLogsSchema),
  async (req, res) => {
    const query = (req as any).validatedQuery ?? req.query;
    const result = await auditService.listAuditLogs(query);
    res.json(result);
  }
);

// ── GET /api/audit/entity/:entity/:entityId — entity trail
// Must be registered before /:id to prevent "entity" matching as :id

router.get(
  '/entity/:entity/:entityId',
  authenticate,
  requireRole('admin'),
  validate(entityTrailSchema),
  async (req, res) => {
    const query = (req as any).validatedQuery ?? req.query;
    const result = await auditService.getEntityTrail(
      req.params.entity as string,
      req.params.entityId as string,
      query.page ?? 1,
      query.limit ?? 50
    );
    res.json(result);
  }
);

// ── GET /api/audit/:id — get single audit log ───────────

router.get(
  '/:id',
  authenticate,
  requireRole('admin'),
  validate(getAuditLogSchema),
  async (req, res) => {
    const log = await auditService.getAuditLog(req.params.id as string);
    res.json(log);
  }
);

export default router;
