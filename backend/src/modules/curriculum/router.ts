import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../lib/validate.js';
import {
  listCurriculaSchema,
  getCurriculumSchema,
  createCurriculumSchema,
  updateCurriculumSchema,
  createUnitSchema,
  updateUnitSchema,
  deleteUnitSchema,
  addItemSchema,
  removeItemSchema,
  compileCurriculumSchema,
  publishCurriculumSchema,
} from './schemas.js';
import * as curriculumService from './service.js';

const router = Router();

// All curriculum routes require authentication
router.use(authenticate);

// ── GET /api/curriculum ───────────────────────────────────
// List curricula with pagination and filters
router.get(
  '/',
  validate(listCurriculaSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req as unknown as Record<string, unknown>).validatedQuery as Parameters<typeof curriculumService.listCurricula>[0];
      const result = await curriculumService.listCurricula(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ── GET /api/curriculum/:id ───────────────────────────────
// Get curriculum with units and items
router.get(
  '/:id',
  validate(getCurriculumSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const curriculum = await curriculumService.getCurriculum(req.params.id as string);
      res.json(curriculum);
    } catch (error) {
      next(error);
    }
  }
);

// ── POST /api/curriculum ──────────────────────────────────
// Create curriculum (editor+)
router.post(
  '/',
  requireRole('editor', 'admin'),
  validate(createCurriculumSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const curriculum = await curriculumService.createCurriculum(req.body, req.user!.userId);
      res.status(201).json(curriculum);
    } catch (error) {
      next(error);
    }
  }
);

// ── PATCH /api/curriculum/:id ─────────────────────────────
// Update curriculum
router.patch(
  '/:id',
  requireRole('editor', 'admin'),
  validate(updateCurriculumSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const curriculum = await curriculumService.updateCurriculum(req.params.id as string, req.body);
      res.json(curriculum);
    } catch (error) {
      next(error);
    }
  }
);

// ── POST /api/curriculum/:id/units ────────────────────────
// Add unit to curriculum
router.post(
  '/:id/units',
  requireRole('editor', 'admin'),
  validate(createUnitSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const unit = await curriculumService.createUnit(req.params.id as string, req.body);
      res.status(201).json(unit);
    } catch (error) {
      next(error);
    }
  }
);

// ── PATCH /api/curriculum/:id/units/:unitId ───────────────
// Update unit
router.patch(
  '/:id/units/:unitId',
  requireRole('editor', 'admin'),
  validate(updateUnitSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const unit = await curriculumService.updateUnit(req.params.id as string, req.params.unitId as string, req.body);
      res.json(unit);
    } catch (error) {
      next(error);
    }
  }
);

// ── DELETE /api/curriculum/:id/units/:unitId ──────────────
// Delete unit
router.delete(
  '/:id/units/:unitId',
  requireRole('editor', 'admin'),
  validate(deleteUnitSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await curriculumService.deleteUnit(req.params.id as string, req.params.unitId as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// ── POST /api/curriculum/:id/units/:unitId/items ──────────
// Add content item to unit
router.post(
  '/:id/units/:unitId/items',
  requireRole('editor', 'admin'),
  validate(addItemSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await curriculumService.addItem(req.params.id as string, req.params.unitId as string, req.body);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }
);

// ── DELETE /api/curriculum/:id/units/:unitId/items/:itemId
// Remove item from unit
router.delete(
  '/:id/units/:unitId/items/:itemId',
  requireRole('editor', 'admin'),
  validate(removeItemSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await curriculumService.removeItem(req.params.id as string, req.params.unitId as string, req.params.itemId as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// ── POST /api/curriculum/:id/compile ──────────────────────
// Compile/validate curriculum
router.post(
  '/:id/compile',
  requireRole('editor', 'admin'),
  validate(compileCurriculumSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await curriculumService.compileCurriculum(req.params.id as string);
      res.json(report);
    } catch (error) {
      next(error);
    }
  }
);

// ── POST /api/curriculum/:id/publish ──────────────────────
// Publish curriculum
router.post(
  '/:id/publish',
  requireRole('editor', 'admin'),
  validate(publishCurriculumSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const curriculum = await curriculumService.publishCurriculum(req.params.id as string);
      res.json(curriculum);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
