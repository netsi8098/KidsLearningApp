import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { logAudit, getClientIp } from '../../lib/audit.js';
import * as privacyService from './service.js';
import {
  listConsentsSchema,
  recordConsentSchema,
  revokeConsentSchema,
  listDataRequestsSchema,
  createExportRequestSchema,
  createDeletionRequestSchema,
  processRequestSchema,
  downloadRequestSchema,
} from './schemas.js';

const router = Router();

// ══════════════════════════════════════════════════════════
// Consent endpoints
// ══════════════════════════════════════════════════════════

// ── GET /api/privacy/consents/:parentId ──────────────────
// List consent records for a parent.

router.get(
  '/consents/:parentId',
  authenticate,
  validate(listConsentsSchema),
  async (req, res) => {
    const result = await privacyService.listConsents(req.params.parentId as string);
    res.json(result);
  }
);

// ── POST /api/privacy/consents ───────────────────────────
// Record consent.

router.post(
  '/consents',
  authenticate,
  validate(recordConsentSchema),
  async (req, res) => {
    const consent = await privacyService.recordConsent(req.body);
    await logAudit({
      action: 'record_consent',
      entity: 'ConsentRecord',
      entityId: consent.id,
      changes: {
        parentId: req.body.parentId,
        consentType: req.body.consentType,
        granted: req.body.granted,
        version: req.body.version,
      },
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });
    res.status(201).json(consent);
  }
);

// ── POST /api/privacy/consents/revoke ────────────────────
// Revoke consent.

router.post(
  '/consents/revoke',
  authenticate,
  validate(revokeConsentSchema),
  async (req, res) => {
    const consent = await privacyService.revokeConsent(req.body);
    await logAudit({
      action: 'revoke_consent',
      entity: 'ConsentRecord',
      entityId: consent.id,
      changes: {
        parentId: req.body.parentId,
        consentType: req.body.consentType,
      },
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });
    res.json(consent);
  }
);

// ══════════════════════════════════════════════════════════
// Data request endpoints
// ══════════════════════════════════════════════════════════

// ── GET /api/privacy/requests ────────────────────────────
// List data requests (admin, paginated).

router.get(
  '/requests',
  authenticate,
  requireRole('admin'),
  validate(listDataRequestsSchema),
  async (req, res) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as
      Parameters<typeof privacyService.listDataRequests>[0];
    const result = await privacyService.listDataRequests(query);
    res.json(result);
  }
);

// ── POST /api/privacy/requests/export ────────────────────
// Request data export.

router.post(
  '/requests/export',
  authenticate,
  validate(createExportRequestSchema),
  async (req, res) => {
    const request = await privacyService.createExportRequest(req.body);
    await logAudit({
      action: 'create_export_request',
      entity: 'DataRequest',
      entityId: request.id,
      changes: {
        parentId: req.body.parentId,
        householdId: req.body.householdId,
        type: 'export',
      },
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });
    res.status(201).json(request);
  }
);

// ── POST /api/privacy/requests/deletion ──────────────────
// Request data deletion.

router.post(
  '/requests/deletion',
  authenticate,
  validate(createDeletionRequestSchema),
  async (req, res) => {
    const request = await privacyService.createDeletionRequest(req.body);
    await logAudit({
      action: 'create_deletion_request',
      entity: 'DataRequest',
      entityId: request.id,
      changes: {
        parentId: req.body.parentId,
        householdId: req.body.householdId,
        type: 'deletion',
      },
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });
    res.status(201).json(request);
  }
);

// ── PATCH /api/privacy/requests/:id ──────────────────────
// Process a data request (admin).

router.patch(
  '/requests/:id',
  authenticate,
  requireRole('admin'),
  validate(processRequestSchema),
  async (req, res) => {
    const request = await privacyService.processRequest(req.params.id as string, req.body);
    await logAudit({
      action: 'process_data_request',
      entity: 'DataRequest',
      entityId: request.id,
      changes: {
        status: req.body.status,
        fileUrl: req.body.fileUrl,
      },
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });
    res.json(request);
  }
);

// ── GET /api/privacy/requests/:id/download ───────────────
// Download export file (returns fileUrl).

router.get(
  '/requests/:id/download',
  authenticate,
  validate(downloadRequestSchema),
  async (req, res) => {
    const result = await privacyService.getDownloadUrl(req.params.id as string);
    res.json(result);
  }
);

export default router;
