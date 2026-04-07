import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError } from '../../lib/errors.js';
import type { Prisma } from '@prisma/client';

// ── Constants ─────────────────────────────────────────────

const TARGET_MARKETS = (process.env.TARGET_MARKETS || 'worldwide,US,GB,CA,AU').split(',').map((t) => t.trim().toLowerCase());

const EXPIRY_WARNING_DAYS = [90, 60, 30, 7] as const;

// ── Types ─────────────────────────────────────────────────

export interface CreateLicenseInput {
  contentId: string;
  licensor: string;
  licenseType: string;
  territories: string[];
  startDate: string;
  endDate?: string;
  terms?: string;
  contactEmail?: string;
}

export interface UpdateLicenseInput {
  licensor?: string;
  licenseType?: string;
  territories?: string[];
  startDate?: string;
  endDate?: string | null;
  terms?: string | null;
  contactEmail?: string | null;
}

export interface LicenseCheckResult {
  valid: boolean;
  contentId: string;
  licenses: Array<{
    id: string;
    licensor: string;
    licenseType: string;
    territories: unknown;
    startDate: Date;
    endDate: Date | null;
    isActive: boolean;
    isExpired: boolean;
    daysUntilExpiry: number | null;
  }>;
  warnings: string[];
}

export interface AuditItem {
  contentId: string;
  contentTitle: string;
  contentSlug: string;
  contentType: string;
  contentStatus: string;
  hasLicense: boolean;
  licenseCount: number;
  licenses: Array<{
    id: string;
    licensor: string;
    licenseType: string;
    expiresAt: Date | null;
    daysUntilExpiry: number | null;
  }>;
  warnings: string[];
}

// ── License Include ───────────────────────────────────────

const LICENSE_INCLUDE = {
  content: {
    select: { id: true, title: true, slug: true, type: true, status: true },
  },
} satisfies Prisma.LicensedRightInclude;

// ── Utility ───────────────────────────────────────────────

function daysUntilExpiry(endDate: Date | null): number | null {
  if (!endDate) return null;
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getExpiryWarnings(endDate: Date | null, licensor: string): string[] {
  const warnings: string[] = [];
  const days = daysUntilExpiry(endDate);

  if (days === null) return warnings;

  if (days < 0) {
    warnings.push(`License from ${licensor} expired ${Math.abs(days)} days ago`);
  } else {
    for (const threshold of EXPIRY_WARNING_DAYS) {
      if (days <= threshold) {
        warnings.push(`License from ${licensor} expires in ${days} days (within ${threshold}-day warning threshold)`);
        break;
      }
    }
  }

  return warnings;
}

function checkTerritories(territories: unknown): string[] {
  const warnings: string[] = [];
  const territoryList = Array.isArray(territories)
    ? territories.map((t: string) => t.toLowerCase())
    : [];

  if (territoryList.includes('worldwide')) return warnings;

  const uncoveredMarkets = TARGET_MARKETS.filter(
    (market) => market !== 'worldwide' && !territoryList.includes(market)
  );

  if (uncoveredMarkets.length > 0) {
    warnings.push(`License does not cover target markets: ${uncoveredMarkets.join(', ')}`);
  }

  return warnings;
}

// ── List Licenses ─────────────────────────────────────────

export async function listLicenses(params: {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  licensor?: string;
  licenseType?: string;
  expiringSoon?: boolean;
}) {
  const { page, limit, sortBy, sortOrder, licensor, licenseType, expiringSoon } = params;

  const where: Prisma.LicensedRightWhereInput = {};

  if (licensor) {
    where.licensor = { contains: licensor, mode: 'insensitive' };
  }
  if (licenseType) {
    where.licenseType = licenseType;
  }
  if (expiringSoon) {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    where.endDate = {
      not: null,
      lte: thirtyDaysFromNow,
      gte: new Date(),
    };
  }

  const [data, total] = await Promise.all([
    prisma.licensedRight.findMany({
      where,
      include: LICENSE_INCLUDE,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.licensedRight.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Get License by ID ─────────────────────────────────────

export async function getLicenseById(id: string) {
  const license = await prisma.licensedRight.findUnique({
    where: { id },
    include: LICENSE_INCLUDE,
  });

  if (!license) {
    throw new NotFoundError('LicensedRight', id);
  }

  return license;
}

// ── Create License ────────────────────────────────────────

export async function createLicense(input: CreateLicenseInput) {
  // Verify content exists
  const content = await prisma.content.findUnique({ where: { id: input.contentId } });
  if (!content) {
    throw new NotFoundError('Content', input.contentId);
  }

  // Validate start date is before end date
  if (input.endDate) {
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    if (end <= start) {
      throw new ValidationError('End date must be after start date');
    }
  }

  const license = await prisma.licensedRight.create({
    data: {
      contentId: input.contentId,
      licensor: input.licensor,
      licenseType: input.licenseType,
      territories: input.territories,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      terms: input.terms ?? null,
      contactEmail: input.contactEmail ?? null,
    },
    include: LICENSE_INCLUDE,
  });

  return license;
}

// ── Update License ────────────────────────────────────────

export async function updateLicense(id: string, input: UpdateLicenseInput) {
  const existing = await prisma.licensedRight.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('LicensedRight', id);
  }

  const data: Prisma.LicensedRightUpdateInput = {};

  if (input.licensor !== undefined) data.licensor = input.licensor;
  if (input.licenseType !== undefined) data.licenseType = input.licenseType;
  if (input.territories !== undefined) data.territories = input.territories;
  if (input.startDate !== undefined) data.startDate = new Date(input.startDate);
  if (input.endDate !== undefined) data.endDate = input.endDate ? new Date(input.endDate) : null;
  if (input.terms !== undefined) data.terms = input.terms;
  if (input.contactEmail !== undefined) data.contactEmail = input.contactEmail;

  // Validate date consistency
  const startDate = input.startDate ? new Date(input.startDate) : existing.startDate;
  const endDate = input.endDate !== undefined
    ? (input.endDate ? new Date(input.endDate) : null)
    : existing.endDate;

  if (endDate && endDate <= startDate) {
    throw new ValidationError('End date must be after start date');
  }

  const license = await prisma.licensedRight.update({
    where: { id },
    data,
    include: LICENSE_INCLUDE,
  });

  return license;
}

// ── Delete License ────────────────────────────────────────

export async function deleteLicense(id: string) {
  const existing = await prisma.licensedRight.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('LicensedRight', id);
  }

  await prisma.licensedRight.delete({ where: { id } });

  return { deleted: true, id };
}

// ── Get Licenses for Content ──────────────────────────────

export async function getLicensesForContent(contentId: string) {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) {
    throw new NotFoundError('Content', contentId);
  }

  const licenses = await prisma.licensedRight.findMany({
    where: { contentId },
    include: LICENSE_INCLUDE,
    orderBy: { startDate: 'desc' },
  });

  return licenses;
}

// ── Expiring Licenses ─────────────────────────────────────

export async function getExpiringLicenses(
  withinDays: number,
  page: number,
  limit: number
) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + withinDays);

  const where: Prisma.LicensedRightWhereInput = {
    endDate: {
      not: null,
      lte: futureDate,
      gte: new Date(), // Only licenses that haven't expired yet
    },
  };

  const [data, total] = await Promise.all([
    prisma.licensedRight.findMany({
      where,
      include: LICENSE_INCLUDE,
      orderBy: { endDate: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.licensedRight.count({ where }),
  ]);

  const enriched = data.map((license) => ({
    ...license,
    daysUntilExpiry: daysUntilExpiry(license.endDate),
    warnings: getExpiryWarnings(license.endDate, license.licensor),
  }));

  return {
    data: enriched,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Check License ─────────────────────────────────────────

export async function checkLicense(contentId: string): Promise<LicenseCheckResult> {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) {
    throw new NotFoundError('Content', contentId);
  }

  const licenses = await prisma.licensedRight.findMany({
    where: { contentId },
    orderBy: { startDate: 'desc' },
  });

  const warnings: string[] = [];
  const now = new Date();

  if (licenses.length === 0) {
    warnings.push('No license records found for this content');
    return {
      valid: false,
      contentId,
      licenses: [],
      warnings,
    };
  }

  const enrichedLicenses = licenses.map((license) => {
    const isExpired = license.endDate ? license.endDate < now : false;
    const isActive =
      license.startDate <= now && !isExpired;

    return {
      id: license.id,
      licensor: license.licensor,
      licenseType: license.licenseType,
      territories: license.territories,
      startDate: license.startDate,
      endDate: license.endDate,
      isActive,
      isExpired,
      daysUntilExpiry: daysUntilExpiry(license.endDate),
    };
  });

  // Check if at least one license is active
  const hasActiveLicense = enrichedLicenses.some((l) => l.isActive);
  if (!hasActiveLicense) {
    warnings.push('No active license found (all licenses are expired or not yet started)');
  }

  // Check for expiring licenses
  for (const license of enrichedLicenses) {
    if (license.isActive) {
      warnings.push(...getExpiryWarnings(license.endDate, license.licensor));
    }
    if (license.isExpired) {
      warnings.push(`License from ${license.licensor} has expired`);
    }
  }

  // Check territory coverage for active licenses
  const activeLicenses = enrichedLicenses.filter((l) => l.isActive);
  for (const license of activeLicenses) {
    warnings.push(...checkTerritories(license.territories));
  }

  return {
    valid: hasActiveLicense && !warnings.some((w) => w.includes('expired') || w.includes('No active')),
    contentId,
    licenses: enrichedLicenses,
    warnings,
  };
}

// ── Audit Report ──────────────────────────────────────────

export async function auditReport(page: number, limit: number) {
  const [allContent, total] = await Promise.all([
    prisma.content.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        status: true,
        licensedRights: {
          select: {
            id: true,
            licensor: true,
            licenseType: true,
            endDate: true,
            territories: true,
            startDate: true,
          },
        },
      },
      orderBy: { title: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.content.count(),
  ]);

  const now = new Date();

  const items: AuditItem[] = allContent.map((content) => {
    const warnings: string[] = [];
    const hasLicense = content.licensedRights.length > 0;

    if (!hasLicense) {
      warnings.push('No license records');
    }

    const licenses = content.licensedRights.map((lr) => {
      const days = daysUntilExpiry(lr.endDate);
      const isExpired = lr.endDate ? lr.endDate < now : false;
      const isActive = lr.startDate <= now && !isExpired;

      if (isExpired) {
        warnings.push(`License from ${lr.licensor} has expired`);
      } else if (isActive) {
        warnings.push(...getExpiryWarnings(lr.endDate, lr.licensor));
        warnings.push(...checkTerritories(lr.territories));
      }

      return {
        id: lr.id,
        licensor: lr.licensor,
        licenseType: lr.licenseType,
        expiresAt: lr.endDate,
        daysUntilExpiry: days,
      };
    });

    return {
      contentId: content.id,
      contentTitle: content.title,
      contentSlug: content.slug,
      contentType: content.type,
      contentStatus: content.status,
      hasLicense,
      licenseCount: content.licensedRights.length,
      licenses,
      warnings: [...new Set(warnings)], // Deduplicate warnings
    };
  });

  // Summary stats
  const summary = {
    totalContent: total,
    withLicense: items.filter((i) => i.hasLicense).length,
    withoutLicense: items.filter((i) => !i.hasLicense).length,
    withWarnings: items.filter((i) => i.warnings.length > 0).length,
  };

  return {
    data: items,
    summary,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Get Licenses by Licensor ──────────────────────────────

export async function getLicensesByLicensor(licensor: string) {
  const licenses = await prisma.licensedRight.findMany({
    where: {
      licensor: { contains: licensor, mode: 'insensitive' },
    },
    include: LICENSE_INCLUDE,
    orderBy: { startDate: 'desc' },
  });

  return licenses;
}
