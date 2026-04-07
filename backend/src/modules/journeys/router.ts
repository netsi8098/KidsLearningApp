import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as journeysService from './service.js';
import {
  listJourneysSchema,
  getJourneySchema,
  createJourneySchema,
  updateJourneySchema,
  addStepSchema,
  listEnrollmentsSchema,
  enrollHouseholdSchema,
  previewJourneySchema,
} from './schemas.js';

const router = Router();

// ── GET /api/journeys — list journeys (admin, paginated) ──

router.get(
  '/',
  authenticate,
  requireRole('admin'),
  validate(listJourneysSchema),
  async (req, res) => {
    const query = (req as any).validatedQuery ?? req.query;
    const { page, limit, sortBy, sortOrder, triggerType, enabled } = query;

    const results = await journeysService.listJourneys(
      { triggerType, enabled },
      { page, limit, sortBy, sortOrder }
    );

    res.json(results);
  }
);

// ── GET /api/journeys/enrollments — list enrollments (admin) ──

router.get(
  '/enrollments',
  authenticate,
  requireRole('admin'),
  validate(listEnrollmentsSchema),
  async (req, res) => {
    const query = (req as any).validatedQuery ?? req.query;
    const { page, limit, sortBy, sortOrder, journeyId, status } = query;

    const results = await journeysService.listEnrollments(
      { journeyId, status },
      { page, limit, sortBy, sortOrder }
    );

    res.json(results);
  }
);

// ── GET /api/journeys/:id — journey detail with steps (admin) ──

router.get(
  '/:id',
  authenticate,
  requireRole('admin'),
  validate(getJourneySchema),
  async (req, res) => {
    const { id } = req.params;
    const journey = await journeysService.getJourney(id as string);
    res.json({ data: journey });
  }
);

// ── POST /api/journeys — create journey (admin) ──────────

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  validate(createJourneySchema),
  async (req, res) => {
    const { name, description, triggerType, enabled, cooldownHours } = req.body;
    const journey = await journeysService.createJourney(
      { name, description, triggerType, enabled, cooldownHours },
      req.user!.userId
    );
    res.status(201).json({ data: journey });
  }
);

// ── PATCH /api/journeys/:id — update journey (admin) ─────

router.patch(
  '/:id',
  authenticate,
  requireRole('admin'),
  validate(updateJourneySchema),
  async (req, res) => {
    const { id } = req.params;
    const journey = await journeysService.updateJourney(id as string, req.body, req.user!.userId);
    res.json({ data: journey });
  }
);

// ── POST /api/journeys/:id/steps — add step (admin) ──────

router.post(
  '/:id/steps',
  authenticate,
  requireRole('admin'),
  validate(addStepSchema),
  async (req, res) => {
    const { id } = req.params;
    const { orderIndex, delayHours, messageTemplate, conditions } = req.body;

    const step = await journeysService.addStep(
      id as string,
      { orderIndex, delayHours, messageTemplate, conditions },
      req.user!.userId
    );
    res.status(201).json({ data: step });
  }
);

// ── POST /api/journeys/enroll — enroll household ─────────

router.post(
  '/enroll',
  authenticate,
  validate(enrollHouseholdSchema),
  async (req, res) => {
    const { journeyId, householdId, profileId } = req.body;

    const enrollment = await journeysService.enrollHousehold(
      { journeyId, householdId, profileId },
      req.user!.userId
    );
    res.status(201).json({ data: enrollment });
  }
);

// ── POST /api/journeys/preview — preview journey (admin) ──

router.post(
  '/preview',
  authenticate,
  requireRole('admin'),
  validate(previewJourneySchema),
  async (req, res) => {
    const { journeyId, householdId } = req.body;

    const preview = await journeysService.previewJourney(journeyId, householdId);
    res.json({ data: preview });
  }
);

export default router;
