import { z } from 'zod';

// ── Constants ───────────────────────────────────────────────

export const supportedLocales = ['en', 'es', 'fr', 'am'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const translationFields = ['title', 'description', 'body'] as const;
export type TranslationField = (typeof translationFields)[number];

export const requiredFields: TranslationField[] = ['title', 'description'];
export const optionalFields: TranslationField[] = ['body'];

export const translationStatuses = [
  'draft',
  'translated',
  'reviewed',
  'published',
] as const;

export type TranslationStatus = (typeof translationStatuses)[number];

// ── Get Translations for Content ────────────────────────────

export const getContentTranslationsSchema = z.object({
  params: z.object({
    contentId: z.string().uuid(),
  }),
  query: z.object({
    locale: z.enum(supportedLocales).optional(),
    field: z.enum(translationFields).optional(),
    status: z.enum(translationStatuses).optional(),
  }),
});

// ── Add/Update Translation ──────────────────────────────────

export const createTranslationSchema = z.object({
  params: z.object({
    contentId: z.string().uuid(),
  }),
  body: z.object({
    locale: z.enum(supportedLocales),
    field: z.enum(translationFields),
    value: z.string().min(1).max(100_000),
    status: z.enum(translationStatuses).default('draft'),
    translator: z.string().max(255).optional(),
  }),
});

export type CreateTranslationBody = z.infer<typeof createTranslationSchema>['body'];

// ── Translation Status Dashboard ────────────────────────────

export const translationStatusSchema = z.object({
  query: z.object({
    ageGroup: z.enum(['age_2_3', 'age_3_4', 'age_4_5', 'age_5_6', 'all']).optional(),
    contentType: z.string().optional(),
  }),
});

// ── Missing Translations ────────────────────────────────────

export const missingTranslationsSchema = z.object({
  query: z.object({
    locale: z.enum(supportedLocales),
    field: z.enum(translationFields).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type MissingTranslationsQuery = z.infer<typeof missingTranslationsSchema>['query'];

// ── Batch Create Translations ───────────────────────────────

export const batchCreateTranslationsSchema = z.object({
  body: z.object({
    translations: z.array(
      z.object({
        contentId: z.string().uuid(),
        locale: z.enum(supportedLocales),
        field: z.enum(translationFields),
        value: z.string().min(1).max(100_000),
        status: z.enum(translationStatuses).default('draft'),
        translator: z.string().max(255).optional(),
      })
    ).min(1).max(500),
  }),
});

export type BatchTranslationItem = z.infer<
  typeof batchCreateTranslationsSchema
>['body']['translations'][number];

// ── Update Translation Status ───────────────────────────────

export const updateTranslationSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    value: z.string().min(1).max(100_000).optional(),
    status: z.enum(translationStatuses).optional(),
    translator: z.string().max(255).optional(),
  }).refine(
    (data) => data.value !== undefined || data.status !== undefined || data.translator !== undefined,
    { message: 'At least one field must be provided for update' }
  ),
});

export type UpdateTranslationBody = z.infer<typeof updateTranslationSchema>['body'];

// ── List Locales ────────────────────────────────────────────

export const listLocalesSchema = z.object({
  query: z.object({}).optional(),
});

// ── Export Locale ───────────────────────────────────────────

export const exportLocaleSchema = z.object({
  params: z.object({
    locale: z.enum(supportedLocales),
  }),
  query: z.object({
    status: z.enum(translationStatuses).optional(),
    contentType: z.string().optional(),
  }),
});
