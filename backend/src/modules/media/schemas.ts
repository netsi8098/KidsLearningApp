import { z } from 'zod';

// ── Constants ───────────────────────────────────────────────

export const allowedMimeTypes = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  'audio/mp4',
  // Video
  'video/mp4',
  'video/webm',
  'video/ogg',
  // Documents
  'application/pdf',
] as const;

export type AllowedMimeType = (typeof allowedMimeTypes)[number];

export const imageProcessingOperations = [
  'resize',
  'webp',
  'thumbnail',
  'optimize',
] as const;

export type ImageProcessingOperation = (typeof imageProcessingOperations)[number];

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

// ── Upload ──────────────────────────────────────────────────

export const uploadMediaSchema = z.object({
  body: z.object({
    contentId: z.string().uuid().optional(),
    alt: z.string().max(500).optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export type UploadMediaBody = z.infer<typeof uploadMediaSchema>['body'];

// ── Get Asset ───────────────────────────────────────────────

export const getAssetSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Get Signed URL ──────────────────────────────────────────

export const getSignedUrlSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({
    expiresIn: z.coerce.number().int().min(60).max(86400).default(3600),
    variant: z.string().optional(),
  }),
});

// ── Delete Asset ────────────────────────────────────────────

export const deleteAssetSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Process Asset ───────────────────────────────────────────

export const processAssetSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    operations: z.array(
      z.discriminatedUnion('type', [
        z.object({
          type: z.literal('resize'),
          width: z.number().int().min(1).max(4096),
          height: z.number().int().min(1).max(4096).optional(),
          fit: z.enum(['cover', 'contain', 'fill', 'inside', 'outside']).default('inside'),
        }),
        z.object({
          type: z.literal('webp'),
          quality: z.number().int().min(1).max(100).default(80),
        }),
        z.object({
          type: z.literal('thumbnail'),
          size: z.number().int().min(50).max(500).default(200),
        }),
        z.object({
          type: z.literal('optimize'),
          quality: z.number().int().min(1).max(100).default(80),
        }),
      ])
    ).min(1).max(10),
  }),
});

export type ProcessAssetBody = z.infer<typeof processAssetSchema>['body'];
export type ProcessingOperation = ProcessAssetBody['operations'][number];

// ── List Assets ─────────────────────────────────────────────

export const listAssetsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    mimeType: z.string().optional(),
    contentId: z.string().uuid().optional(),
    sortBy: z.enum(['createdAt', 'sizeBytes', 'filename']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export type ListAssetsQuery = z.infer<typeof listAssetsSchema>['query'];

// ── Update Asset Metadata ───────────────────────────────────

export const updateAssetSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    alt: z.string().max(500).optional(),
    contentId: z.string().uuid().nullable().optional(),
    metadata: z.record(z.unknown()).optional(),
  }).refine(
    (data) => data.alt !== undefined || data.contentId !== undefined || data.metadata !== undefined,
    { message: 'At least one field must be provided for update' }
  ),
});

export type UpdateAssetBody = z.infer<typeof updateAssetSchema>['body'];
