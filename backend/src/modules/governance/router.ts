import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as governanceService from './service.js';
import {
  listLicensesSchema,
  getLicenseSchema,
  createLicenseSchema,
  updateLicenseSchema,
  deleteLicenseSchema,
  contentLicensesSchema,
  expiringLicensesSchema,
  auditReportSchema,
  checkLicenseSchema,
} from './schemas.js';

const router = Router();

// ── GET /api/governance ───────────────────────────────────

router.get(
  '/',
  authenticate,
  validate(listLicensesSchema),
  async (req, res) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      page: number;
      limit: number;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
      licensor?: string;
      licenseType?: string;
      expiringSoon?: boolean;
    };

    const result = await governanceService.listLicenses({
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      licensor: query.licensor,
      licenseType: query.licenseType,
      expiringSoon: query.expiringSoon,
    });
    res.json(result);
  }
);

// ── GET /api/governance/expiring ──────────────────────────

router.get(
  '/expiring',
  authenticate,
  validate(expiringLicensesSchema),
  async (req, res) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      withinDays: number;
      page: number;
      limit: number;
    };

    const result = await governanceService.getExpiringLicenses(
      query.withinDays,
      query.page,
      query.limit
    );
    res.json(result);
  }
);

// ── GET /api/governance/audit ─────────────────────────────

router.get(
  '/audit',
  authenticate,
  requireRole('admin', 'editor'),
  validate(auditReportSchema),
  async (req, res) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      page: number;
      limit: number;
    };

    const result = await governanceService.auditReport(query.page, query.limit);
    res.json(result);
  }
);

// ── POST /api/governance/check/:contentId ─────────────────

router.post(
  '/check/:contentId',
  authenticate,
  validate(checkLicenseSchema),
  async (req, res) => {
    const result = await governanceService.checkLicense(req.params.contentId as string);
    res.json(result);
  }
);

// ── GET /api/governance/content/:contentId ────────────────

router.get(
  '/content/:contentId',
  authenticate,
  validate(contentLicensesSchema),
  async (req, res) => {
    const licenses = await governanceService.getLicensesForContent(
      req.params.contentId as string
    );
    res.json({ data: licenses, total: licenses.length });
  }
);

// ── GET /api/governance/:id ───────────────────────────────

router.get(
  '/:id',
  authenticate,
  validate(getLicenseSchema),
  async (req, res) => {
    const license = await governanceService.getLicenseById(req.params.id as string);
    res.json(license);
  }
);

// ── POST /api/governance ──────────────────────────────────

router.post(
  '/',
  authenticate,
  requireRole('admin', 'editor'),
  validate(createLicenseSchema),
  async (req, res) => {
    const license = await governanceService.createLicense(req.body);
    res.status(201).json(license);
  }
);

// ── PATCH /api/governance/:id ─────────────────────────────

router.patch(
  '/:id',
  authenticate,
  requireRole('admin', 'editor'),
  validate(updateLicenseSchema),
  async (req, res) => {
    const license = await governanceService.updateLicense(req.params.id as string, req.body);
    res.json(license);
  }
);

// ── DELETE /api/governance/:id ────────────────────────────

router.delete(
  '/:id',
  authenticate,
  requireRole('admin', 'editor'),
  validate(deleteLicenseSchema),
  async (req, res) => {
    const result = await governanceService.deleteLicense(req.params.id as string);
    res.json(result);
  }
);

export default router;
