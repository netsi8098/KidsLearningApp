import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { logAudit, getClientIp } from '../../lib/audit.js';
import * as householdService from './service.js';
import {
  listHouseholdsSchema,
  getHouseholdSchema,
  createHouseholdSchema,
  updateHouseholdSchema,
  createParentSchema,
  updateParentSchema,
  createChildSchema,
  updateChildSchema,
  createInviteSchema,
  acceptInviteSchema,
  searchHouseholdsSchema,
  syncProfileSchema,
  householdSupportSchema,
} from './schemas.js';

const router = Router();

// ══════════════════════════════════════════════════════════
// Admin-only routes (authenticate + requireRole('admin'))
// ══════════════════════════════════════════════════════════

// ── GET /api/households ───────────────────────────────────
// List households with pagination, optional search and plan filter.

router.get(
  '/',
  authenticate,
  requireRole('admin'),
  validate(listHouseholdsSchema),
  async (req, res) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as
      Parameters<typeof householdService.listHouseholds>[0];
    const result = await householdService.listHouseholds(query);
    res.json(result);
  }
);

// ── GET /api/households/search ────────────────────────────
// Search households by email, name, or ID.

router.get(
  '/search',
  authenticate,
  requireRole('admin'),
  validate(searchHouseholdsSchema),
  async (req, res) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as
      { q: string };
    const results = await householdService.searchHouseholds(query.q);
    res.json(results);
  }
);

// ── GET /api/households/:id ───────────────────────────────
// Get a single household with parents, children, and invites.

router.get(
  '/:id',
  authenticate,
  requireRole('admin'),
  validate(getHouseholdSchema),
  async (req, res) => {
    const household = await householdService.getHousehold(req.params.id as string);
    res.json(household);
  }
);

// ── POST /api/households ──────────────────────────────────
// Create a new household.

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  validate(createHouseholdSchema),
  async (req, res) => {
    const household = await householdService.createHousehold(req.body);
    await logAudit({
      action: 'create',
      entity: 'Household',
      entityId: household.id,
      changes: req.body,
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });
    res.status(201).json(household);
  }
);

// ── PATCH /api/households/:id ─────────────────────────────
// Update household details.

router.patch(
  '/:id',
  authenticate,
  requireRole('admin'),
  validate(updateHouseholdSchema),
  async (req, res) => {
    const household = await householdService.updateHousehold(req.params.id as string, req.body);
    await logAudit({
      action: 'update',
      entity: 'Household',
      entityId: household.id,
      changes: req.body,
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });
    res.json(household);
  }
);

// ── GET /api/households/:id/support ───────────────────────
// Full support view with all parents, children, preferences, settings, invites.

router.get(
  '/:id/support',
  authenticate,
  requireRole('admin'),
  validate(householdSupportSchema),
  async (req, res) => {
    const household = await householdService.getHouseholdSupport(req.params.id as string);
    res.json(household);
  }
);

// ── POST /api/households/:householdId/parents ─────────────
// Create a parent account in a household.

router.post(
  '/:householdId/parents',
  authenticate,
  requireRole('admin'),
  validate(createParentSchema),
  async (req, res) => {
    const parent = await householdService.createParent(req.params.householdId as string, req.body);
    await logAudit({
      action: 'create',
      entity: 'ParentAccount',
      entityId: parent.id,
      changes: { email: req.body.email, name: req.body.name, role: req.body.role },
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });
    res.status(201).json(parent);
  }
);

// ── PATCH /api/households/:householdId/parents/:parentId ──
// Update a parent account.

router.patch(
  '/:householdId/parents/:parentId',
  authenticate,
  requireRole('admin'),
  validate(updateParentSchema),
  async (req, res) => {
    const parent = await householdService.updateParent(
      req.params.householdId as string,
      req.params.parentId as string,
      req.body
    );
    await logAudit({
      action: 'update',
      entity: 'ParentAccount',
      entityId: parent.id,
      changes: req.body,
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });
    res.json(parent);
  }
);

// ── POST /api/households/:householdId/children ────────────
// Create a child profile in a household.

router.post(
  '/:householdId/children',
  authenticate,
  requireRole('admin'),
  validate(createChildSchema),
  async (req, res) => {
    const child = await householdService.createChild(req.params.householdId as string, req.body);
    await logAudit({
      action: 'create',
      entity: 'ChildProfile',
      entityId: child.id,
      changes: { name: req.body.name, ageGroup: req.body.ageGroup },
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });
    res.status(201).json(child);
  }
);

// ── PATCH /api/households/:householdId/children/:childId ──
// Update a child profile.

router.patch(
  '/:householdId/children/:childId',
  authenticate,
  requireRole('admin'),
  validate(updateChildSchema),
  async (req, res) => {
    const child = await householdService.updateChild(
      req.params.householdId as string,
      req.params.childId as string,
      req.body
    );
    await logAudit({
      action: 'update',
      entity: 'ChildProfile',
      entityId: child.id,
      changes: req.body,
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });
    res.json(child);
  }
);

// ── POST /api/households/:householdId/invites ─────────────
// Create a caregiver invite for a household.

router.post(
  '/:householdId/invites',
  authenticate,
  requireRole('admin'),
  validate(createInviteSchema),
  async (req, res) => {
    const invite = await householdService.createInvite(
      req.params.householdId as string,
      req.body.email
    );
    await logAudit({
      action: 'create',
      entity: 'CaregiverInvite',
      entityId: invite.id,
      changes: { email: req.body.email, householdId: req.params.householdId },
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });
    res.status(201).json(invite);
  }
);

// ══════════════════════════════════════════════════════════
// Public routes (no authentication required)
// ══════════════════════════════════════════════════════════

// ── POST /api/households/invites/accept ───────────────────
// Accept a caregiver invite with a token.

router.post(
  '/invites/accept',
  validate(acceptInviteSchema),
  async (req, res) => {
    const { token, password, name } = req.body;
    const parent = await householdService.acceptInvite(token, password, name);
    await logAudit({
      action: 'accept_invite',
      entity: 'ParentAccount',
      entityId: parent.id,
      changes: { name },
      ipAddress: getClientIp(req),
    });
    res.status(201).json(parent);
  }
);

// ══════════════════════════════════════════════════════════
// Authenticated routes (any role)
// ══════════════════════════════════════════════════════════

// ── PATCH /api/households/:householdId/children/:childId/sync
// Sync child profile data (stars, streak, interests) from frontend.

router.patch(
  '/:householdId/children/:childId/sync',
  authenticate,
  validate(syncProfileSchema),
  async (req, res) => {
    const child = await householdService.syncChildProfile(
      req.params.householdId as string,
      req.params.childId as string,
      req.body
    );
    res.json(child);
  }
);

export default router;
