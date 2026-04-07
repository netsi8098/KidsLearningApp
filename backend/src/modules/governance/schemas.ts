import { z } from 'zod';

// ── Enums / Constants ─────────────────────────────────────

export const licenseTypeEnum = z.enum([
  'exclusive',
  'non-exclusive',
  'creative-commons',
  'original',
]);

export type LicenseTypeValue = z.infer<typeof licenseTypeEnum>;

// ── List Licenses ─────────────────────────────────────────

export const listLicensesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'updatedAt', 'startDate', 'endDate', 'licensor']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    licensor: z.string().optional(),
    licenseType: licenseTypeEnum.optional(),
    expiringSoon: z.coerce.boolean().optional(),
  }),
});

export type ListLicensesQuery = z.infer<typeof listLicensesSchema>['query'];

// ── Get License ───────────────────────────────────────────

export const getLicenseSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Create License ────────────────────────────────────────

export const createLicenseSchema = z.object({
  body: z.object({
    contentId: z.string().uuid(),
    licensor: z.string().min(1).max(500),
    licenseType: licenseTypeEnum,
    territories: z.array(z.string().min(1).max(100)).min(1).default(['worldwide']),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    terms: z.string().max(10000).optional(),
    contactEmail: z.string().email().optional(),
  }),
});

export type CreateLicenseInput = z.infer<typeof createLicenseSchema>['body'];

// ── Update License ────────────────────────────────────────

export const updateLicenseSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    licensor: z.string().min(1).max(500).optional(),
    licenseType: licenseTypeEnum.optional(),
    territories: z.array(z.string().min(1).max(100)).min(1).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().nullable().optional(),
    terms: z.string().max(10000).nullable().optional(),
    contactEmail: z.string().email().nullable().optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  ),
});

export type UpdateLicenseInput = z.infer<typeof updateLicenseSchema>['body'];

// ── Delete License ────────────────────────────────────────

export const deleteLicenseSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Get Licenses for Content ──────────────────────────────

export const contentLicensesSchema = z.object({
  params: z.object({
    contentId: z.string().uuid(),
  }),
});

// ── Expiring Licenses ─────────────────────────────────────

export const expiringLicensesSchema = z.object({
  query: z.object({
    withinDays: z.coerce.number().int().min(1).max(365).default(30),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type ExpiringLicensesQuery = z.infer<typeof expiringLicensesSchema>['query'];

// ── Audit Report ──────────────────────────────────────────

export const auditReportSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  }),
});

export type AuditReportQuery = z.infer<typeof auditReportSchema>['query'];

// ── Check License ─────────────────────────────────────────

export const checkLicenseSchema = z.object({
  params: z.object({
    contentId: z.string().uuid(),
  }),
});
