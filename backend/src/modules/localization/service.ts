import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError, ConflictError } from '../../lib/errors.js';
import { paginate, type PaginatedResult } from '../../types/index.js';
import type {
  CreateTranslationBody,
  UpdateTranslationBody,
  BatchTranslationItem,
  MissingTranslationsQuery,
  SupportedLocale,
  TranslationField,
} from './schemas.js';
import { supportedLocales, requiredFields, translationFields } from './schemas.js';
import type { Translation, Content, ContentStatus } from '@prisma/client';

// ── Locale Metadata ─────────────────────────────────────────

interface LocaleInfo {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
}

const localeMetadata: Record<SupportedLocale, LocaleInfo> = {
  en: { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Espanol', direction: 'ltr' },
  fr: { code: 'fr', name: 'French', nativeName: 'Francais', direction: 'ltr' },
  am: { code: 'am', name: 'Amharic', nativeName: '\u12A0\u121B\u122D\u129B', direction: 'ltr' },
};

// ── Status Transition Validation ────────────────────────────

const validTransitions: Record<string, string[]> = {
  draft: ['translated'],
  translated: ['reviewed', 'draft'],
  reviewed: ['published', 'translated'],
  published: ['reviewed'],
};

function validateStatusTransition(current: string, next: string): void {
  const allowed = validTransitions[current];
  if (!allowed || !allowed.includes(next)) {
    throw new ValidationError(
      `Invalid status transition from '${current}' to '${next}'. Allowed: ${(allowed || []).join(', ') || 'none'}`
    );
  }
}

// ── Service Functions ───────────────────────────────────────

export async function getContentTranslations(
  contentId: string,
  filters?: { locale?: string; field?: string; status?: string }
): Promise<Translation[]> {
  // Verify content exists
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    select: { id: true },
  });

  if (!content) {
    throw new NotFoundError('Content', contentId);
  }

  const where: Record<string, unknown> = { contentId };
  if (filters?.locale) where.locale = filters.locale;
  if (filters?.field) where.field = filters.field;
  if (filters?.status) where.status = filters.status;

  return prisma.translation.findMany({
    where,
    orderBy: [{ locale: 'asc' }, { field: 'asc' }],
  });
}

export async function createTranslation(
  contentId: string,
  data: CreateTranslationBody
): Promise<Translation> {
  // Verify content exists
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    select: { id: true },
  });

  if (!content) {
    throw new NotFoundError('Content', contentId);
  }

  // Upsert: if a translation already exists for this content+locale+field, update it
  const translation = await prisma.translation.upsert({
    where: {
      contentId_locale_field: {
        contentId,
        locale: data.locale,
        field: data.field,
      },
    },
    update: {
      value: data.value,
      status: data.status,
      translator: data.translator ?? undefined,
    },
    create: {
      contentId,
      locale: data.locale,
      field: data.field,
      value: data.value,
      status: data.status,
      translator: data.translator,
    },
  });

  return translation;
}

export async function updateTranslation(
  id: string,
  data: UpdateTranslationBody
): Promise<Translation> {
  const existing = await prisma.translation.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('Translation', id);
  }

  // Validate status transition if status is being changed
  if (data.status && data.status !== existing.status) {
    validateStatusTransition(existing.status, data.status);
  }

  const updateData: Record<string, unknown> = {};
  if (data.value !== undefined) updateData.value = data.value;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.translator !== undefined) updateData.translator = data.translator;

  return prisma.translation.update({
    where: { id },
    data: updateData,
  });
}

export interface TranslationCoverageResult {
  locale: SupportedLocale;
  totalContent: number;
  translatedFields: Record<TranslationField, { translated: number; total: number; percentage: number }>;
  overallPercentage: number;
}

export async function getTranslationCoverage(filters?: {
  ageGroup?: string;
  contentType?: string;
}): Promise<TranslationCoverageResult[]> {
  // Get total published/approved content count
  const contentWhere: Record<string, unknown> = {
    status: { in: ['published', 'approved', 'draft', 'review'] },
  };
  if (filters?.ageGroup) contentWhere.ageGroup = filters.ageGroup;
  if (filters?.contentType) contentWhere.type = filters.contentType;

  const totalContent = await prisma.content.count({ where: contentWhere });

  if (totalContent === 0) {
    return supportedLocales.map((locale) => ({
      locale,
      totalContent: 0,
      translatedFields: Object.fromEntries(
        translationFields.map((f) => [f, { translated: 0, total: 0, percentage: 0 }])
      ) as Record<TranslationField, { translated: number; total: number; percentage: number }>,
      overallPercentage: 0,
    }));
  }

  const results: TranslationCoverageResult[] = [];

  for (const locale of supportedLocales) {
    const fieldStats = {} as Record<
      TranslationField,
      { translated: number; total: number; percentage: number }
    >;

    let totalTranslated = 0;
    let totalRequired = 0;

    for (const field of translationFields) {
      // Count translations for this locale+field combo (any non-draft status)
      const translated = await prisma.translation.count({
        where: {
          locale,
          field,
          status: { in: ['translated', 'reviewed', 'published'] },
          content: contentWhere,
        },
      });

      fieldStats[field] = {
        translated,
        total: totalContent,
        percentage: totalContent > 0 ? Math.round((translated / totalContent) * 10000) / 100 : 0,
      };

      // Only required fields contribute to overall coverage
      if (requiredFields.includes(field as TranslationField)) {
        totalTranslated += translated;
        totalRequired += totalContent;
      }
    }

    results.push({
      locale,
      totalContent,
      translatedFields: fieldStats,
      overallPercentage:
        totalRequired > 0 ? Math.round((totalTranslated / totalRequired) * 10000) / 100 : 0,
    });
  }

  return results;
}

export async function getMissingTranslations(
  query: MissingTranslationsQuery
): Promise<PaginatedResult<Content>> {
  const { locale, field, page, limit } = query;

  // Find content that does NOT have a translation for the given locale + field(s)
  const fieldsToCheck = field ? [field] : requiredFields;

  // Get content IDs that already have translations for ALL required fields in this locale
  const translatedContentIds = await prisma.translation.groupBy({
    by: ['contentId'],
    where: {
      locale,
      field: { in: fieldsToCheck },
      status: { in: ['translated', 'reviewed', 'published'] },
    },
    having: {
      contentId: {
        _count: {
          gte: fieldsToCheck.length,
        },
      },
    },
  });

  const excludeIds = translatedContentIds.map((t) => t.contentId);

  const where = {
    id: excludeIds.length > 0 ? { notIn: excludeIds } : undefined,
    status: { in: ['published', 'approved', 'draft', 'review'] as ContentStatus[] },
  };

  const [data, total] = await Promise.all([
    prisma.content.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        status: true,
        ageGroup: true,
        createdAt: true,
        translations: {
          where: { locale },
          select: { field: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.content.count({ where }),
  ]);

  return paginate(data as unknown as Content[], total, { page, limit });
}

export async function batchCreateTranslations(
  items: BatchTranslationItem[]
): Promise<{ created: number; updated: number; errors: Array<{ index: number; error: string }> }> {
  let created = 0;
  let updated = 0;
  const errors: Array<{ index: number; error: string }> = [];

  // Verify all content IDs exist in one query
  const contentIds = [...new Set(items.map((i) => i.contentId))];
  const existingContent = await prisma.content.findMany({
    where: { id: { in: contentIds } },
    select: { id: true },
  });
  const existingIds = new Set(existingContent.map((c) => c.id));

  // Process in batches of 50 using transactions
  const batchSize = 50;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    await prisma.$transaction(async (tx) => {
      for (let j = 0; j < batch.length; j++) {
        const item = batch[j];
        const globalIndex = i + j;

        if (!existingIds.has(item.contentId)) {
          errors.push({ index: globalIndex, error: `Content '${item.contentId}' not found` });
          continue;
        }

        try {
          const existing = await tx.translation.findUnique({
            where: {
              contentId_locale_field: {
                contentId: item.contentId,
                locale: item.locale,
                field: item.field,
              },
            },
          });

          if (existing) {
            await tx.translation.update({
              where: { id: existing.id },
              data: {
                value: item.value,
                status: item.status,
                translator: item.translator ?? undefined,
              },
            });
            updated++;
          } else {
            await tx.translation.create({
              data: {
                contentId: item.contentId,
                locale: item.locale,
                field: item.field,
                value: item.value,
                status: item.status,
                translator: item.translator,
              },
            });
            created++;
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          errors.push({ index: globalIndex, error: message });
        }
      }
    });
  }

  return { created, updated, errors };
}

export interface ExportedLocaleData {
  locale: SupportedLocale;
  exportedAt: string;
  totalEntries: number;
  content: Record<
    string,
    {
      contentId: string;
      slug: string;
      type: string;
      fields: Record<string, string>;
    }
  >;
}

export async function exportLocale(
  locale: SupportedLocale,
  filters?: { status?: string; contentType?: string }
): Promise<ExportedLocaleData> {
  const where: Record<string, unknown> = {
    locale,
    status: filters?.status || 'published',
  };

  if (filters?.contentType) {
    where.content = { type: filters.contentType };
  }

  const translations = await prisma.translation.findMany({
    where,
    include: {
      content: {
        select: { id: true, slug: true, type: true },
      },
    },
    orderBy: [{ contentId: 'asc' }, { field: 'asc' }],
  });

  // Group translations by content slug
  const contentMap: ExportedLocaleData['content'] = {};

  for (const t of translations) {
    const slug = t.content.slug;
    if (!contentMap[slug]) {
      contentMap[slug] = {
        contentId: t.content.id,
        slug: t.content.slug,
        type: t.content.type,
        fields: {},
      };
    }
    contentMap[slug].fields[t.field] = t.value;
  }

  return {
    locale,
    exportedAt: new Date().toISOString(),
    totalEntries: translations.length,
    content: contentMap,
  };
}

export interface LocaleWithStats extends LocaleInfo {
  translationCount: number;
  publishedCount: number;
  completionPercentage: number;
}

export async function listLocalesWithStats(): Promise<LocaleWithStats[]> {
  const totalContent = await prisma.content.count({
    where: { status: { in: ['published', 'approved', 'draft', 'review'] } },
  });

  const results: LocaleWithStats[] = [];

  for (const locale of supportedLocales) {
    const info = localeMetadata[locale];

    const [translationCount, publishedCount] = await Promise.all([
      prisma.translation.count({ where: { locale } }),
      prisma.translation.count({ where: { locale, status: 'published' } }),
    ]);

    // Completion: count content that has all required fields translated
    const totalRequiredSlots = totalContent * requiredFields.length;
    const filledSlots = await prisma.translation.count({
      where: {
        locale,
        field: { in: requiredFields },
        status: { in: ['translated', 'reviewed', 'published'] },
      },
    });

    const completionPercentage =
      totalRequiredSlots > 0
        ? Math.round((filledSlots / totalRequiredSlots) * 10000) / 100
        : 0;

    results.push({
      ...info,
      translationCount,
      publishedCount,
      completionPercentage,
    });
  }

  return results;
}
