import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { logAudit, getClientIp } from '../../lib/audit.js';
import * as routineService from './service.js';
import {
  listRoutinesSchema,
  getRoutineSchema,
  createRoutineSchema,
  updateRoutineSchema,
  deleteRoutineSchema,
  duplicateRoutineSchema,
  listTemplatesSchema,
  createFromTemplateSchema,
} from './schemas.js';

const router = Router();

// ── GET /api/routines/templates — List starter templates ──
// No auth required. Must be registered before /:id to avoid param collision.

router.get(
  '/templates',
  validate(listTemplatesSchema),
  async (req, res) => {
    const query = ((req as unknown as Record<string, unknown>).validatedQuery ?? {}) as
      { type?: string };
    const templates = await routineService.listTemplates(
      query.type ? { type: query.type as 'morning' | 'after_school' | 'travel' | 'bedtime' | 'weekend' | 'custom' } : undefined
    );
    res.json(templates);
  }
);

// ── GET /api/routines — List routines for household ───────

router.get(
  '/',
  authenticate,
  validate(listRoutinesSchema),
  async (req, res) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder: 'asc' | 'desc';
      householdId: string;
      type?: string;
      profileId?: string;
    };

    const result = await routineService.listRoutines({
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      householdId: query.householdId,
      type: query.type as Parameters<typeof routineService.listRoutines>[0]['type'],
      profileId: query.profileId,
    });

    res.json(result);
  }
);

// ── GET /api/routines/:id — Get routine detail ────────────

router.get(
  '/:id',
  authenticate,
  validate(getRoutineSchema),
  async (req, res) => {
    const routine = await routineService.getRoutineById(req.params.id as string);
    res.json(routine);
  }
);

// ── POST /api/routines — Create routine ───────────────────

router.post(
  '/',
  authenticate,
  validate(createRoutineSchema),
  async (req, res) => {
    const routine = await routineService.createRoutine(req.body);
    await logAudit({
      action: 'create',
      entity: 'Routine',
      entityId: routine.id,
      changes: { name: req.body.name, type: req.body.type, householdId: req.body.householdId },
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });
    res.status(201).json(routine);
  }
);

// ── PATCH /api/routines/:id — Update routine ──────────────

router.patch(
  '/:id',
  authenticate,
  validate(updateRoutineSchema),
  async (req, res) => {
    const routine = await routineService.updateRoutine(req.params.id as string, req.body);
    await logAudit({
      action: 'update',
      entity: 'Routine',
      entityId: routine.id,
      changes: req.body,
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });
    res.json(routine);
  }
);

// ── DELETE /api/routines/:id — Soft-delete routine ────────

router.delete(
  '/:id',
  authenticate,
  validate(deleteRoutineSchema),
  async (req, res) => {
    const routine = await routineService.deleteRoutine(req.params.id as string);
    await logAudit({
      action: 'delete',
      entity: 'Routine',
      entityId: routine.id,
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });
    res.json({ message: 'Routine deleted' });
  }
);

// ── POST /api/routines/:id/duplicate — Duplicate routine ──

router.post(
  '/:id/duplicate',
  authenticate,
  validate(duplicateRoutineSchema),
  async (req, res) => {
    const routine = await routineService.duplicateRoutine(req.params.id as string);
    await logAudit({
      action: 'duplicate',
      entity: 'Routine',
      entityId: routine.id,
      changes: { sourceId: req.params.id },
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });
    res.status(201).json(routine);
  }
);

// ── POST /api/routines/from-template — Create from template

router.post(
  '/from-template',
  authenticate,
  validate(createFromTemplateSchema),
  async (req, res) => {
    const routine = await routineService.createFromTemplate(req.body);
    await logAudit({
      action: 'create_from_template',
      entity: 'Routine',
      entityId: routine.id,
      changes: { templateId: req.body.templateId, householdId: req.body.householdId },
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });
    res.status(201).json(routine);
  }
);

export default router;
