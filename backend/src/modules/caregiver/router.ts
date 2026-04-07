import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { logAudit, getClientIp } from '../../lib/audit.js';
import * as caregiverService from './service.js';
import {
  listCaregiversSchema,
  sendInviteSchema,
  acceptInviteSchema,
  revokeAccessSchema,
  listChildAccessSchema,
  updateChildAccessSchema,
  caregiverAuditSchema,
} from './schemas.js';

const router = Router();

// ══════════════════════════════════════════════════════════
// Authenticated routes
// ══════════════════════════════════════════════════════════

// ── POST /api/caregivers/invite ──────────────────────────
// Send a caregiver invite. Creates CaregiverInvite with random token.

router.post(
  '/invite',
  authenticate,
  validate(sendInviteSchema),
  async (req, res) => {
    const invite = await caregiverService.sendInvite(req.body);
    await logAudit({
      action: 'create',
      entity: 'CaregiverInvite',
      entityId: invite.id,
      changes: { email: req.body.email, householdId: req.body.householdId, role: req.body.role },
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });
    res.status(201).json(invite);
  }
);

// ── POST /api/caregivers/revoke ──────────────────────────
// Revoke caregiver access. Deletes CaregiverAccess records and deactivates parent account.

router.post(
  '/revoke',
  authenticate,
  requireRole('admin'),
  validate(revokeAccessSchema),
  async (req, res) => {
    const result = await caregiverService.revokeAccess(req.body, req.user!.userId);
    await logAudit({
      action: 'revoke',
      entity: 'CaregiverAccess',
      entityId: req.body.caregiverId,
      changes: { householdId: req.body.householdId },
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });
    res.json(result);
  }
);

// ── GET /api/caregivers/access/:caregiverId ──────────────
// List child access records for a caregiver.

router.get(
  '/access/:caregiverId',
  authenticate,
  validate(listChildAccessSchema),
  async (req, res) => {
    const records = await caregiverService.listChildAccess(req.params.caregiverId as string);
    res.json(records);
  }
);

// ── PUT /api/caregivers/access ───────────────────────────
// Update child-specific access. Upserts CaregiverAccess.

router.put(
  '/access',
  authenticate,
  validate(updateChildAccessSchema),
  async (req, res) => {
    const access = await caregiverService.updateChildAccess(req.body, req.user!.userId);
    await logAudit({
      action: 'upsert',
      entity: 'CaregiverAccess',
      entityId: access.id,
      changes: {
        caregiverId: req.body.caregiverId,
        childProfileId: req.body.childProfileId,
        accessLevel: req.body.accessLevel,
      },
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });
    res.json(access);
  }
);

// ── GET /api/caregivers/audit/:householdId ───────────────
// Caregiver activity audit. Returns audit logs filtered to caregiver actions.

router.get(
  '/audit/:householdId',
  authenticate,
  validate(caregiverAuditSchema),
  async (req, res) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as
      Parameters<typeof caregiverService.getCaregiverAudit>[1];
    const result = await caregiverService.getCaregiverAudit(
      req.params.householdId as string,
      query
    );
    res.json(result);
  }
);

// ── GET /api/caregivers/:householdId ─────────────────────
// List caregivers for a household (parent accounts + pending invites).
// NOTE: Registered after static-prefix GET routes to avoid wildcard conflicts.

router.get(
  '/:householdId',
  authenticate,
  validate(listCaregiversSchema),
  async (req, res) => {
    const result = await caregiverService.listCaregivers(req.params.householdId as string);
    res.json(result);
  }
);

// ══════════════════════════════════════════════════════════
// Public routes (no authentication required)
// ══════════════════════════════════════════════════════════

// ── POST /api/caregivers/accept ──────────────────────────
// Accept a caregiver invite with a token.

router.post(
  '/accept',
  validate(acceptInviteSchema),
  async (req, res) => {
    const parent = await caregiverService.acceptInvite(req.body);
    await logAudit({
      action: 'accept_invite',
      entity: 'ParentAccount',
      entityId: parent.id,
      changes: { name: req.body.name },
      ipAddress: getClientIp(req),
    });
    res.status(201).json(parent);
  }
);

export default router;
