import { prisma } from '../../lib/prisma.js';
import { storage, generateStorageKey } from '../../lib/storage.js';
import { mediaQueue } from '../../lib/queue.js';
import { NotFoundError, ValidationError } from '../../lib/errors.js';
import { paginate, type PaginatedResult } from '../../types/index.js';
import type {
  UploadMediaBody,
  UpdateAssetBody,
  ListAssetsQuery,
  ProcessAssetBody,
  ProcessingOperation,
} from './schemas.js';
import { allowedMimeTypes, MAX_FILE_SIZE_BYTES } from './schemas.js';
import { Prisma } from '@prisma/client';
import type { Asset } from '@prisma/client';

// ── MIME Type Helpers ────────────────────────────────────────

function isAllowedMimeType(mimeType: string): boolean {
  return (allowedMimeTypes as readonly string[]).includes(mimeType);
}

function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/') && mimeType !== 'image/svg+xml';
}

// ── Upload ──────────────────────────────────────────────────

export async function uploadAsset(
  file: {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
  },
  body: UploadMediaBody
): Promise<Asset> {
  // Validate MIME type
  if (!isAllowedMimeType(file.mimetype)) {
    throw new ValidationError(
      `File type '${file.mimetype}' is not allowed. Allowed types: images, audio, video, SVG, PDF.`
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ValidationError(
      `File size ${Math.round(file.size / 1024 / 1024)}MB exceeds maximum allowed size of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`
    );
  }

  // Verify content exists if contentId is provided
  if (body.contentId) {
    const content = await prisma.content.findUnique({
      where: { id: body.contentId },
      select: { id: true },
    });
    if (!content) {
      throw new NotFoundError('Content', body.contentId);
    }
  }

  // Determine storage prefix from MIME type
  const prefix = file.mimetype.startsWith('image/')
    ? 'images'
    : file.mimetype.startsWith('audio/')
      ? 'audio'
      : file.mimetype.startsWith('video/')
        ? 'video'
        : 'documents';

  const storageKey = generateStorageKey(prefix, file.originalname);

  // Upload to storage provider
  await storage.upload(storageKey, file.buffer, file.mimetype);

  // Extract dimensions for images (will be null for non-images)
  let width: number | null = null;
  let height: number | null = null;

  if (isImageMimeType(file.mimetype)) {
    try {
      // Dynamically import sharp only when needed for images
      const sharp = (await import('sharp')).default;
      const metadata = await sharp(file.buffer).metadata();
      width = metadata.width ?? null;
      height = metadata.height ?? null;
    } catch {
      // Non-critical: dimensions will be null
    }
  }

  // Create asset record
  const asset = await prisma.asset.create({
    data: {
      contentId: body.contentId ?? null,
      filename: file.originalname,
      storageKey,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      width,
      height,
      alt: body.alt ?? null,
      metadata: (body.metadata ?? {}) as Prisma.InputJsonValue,
    },
    include: { variants: true },
  });

  return asset;
}

// ── Get Asset ───────────────────────────────────────────────

export async function getAsset(id: string): Promise<Asset & { variants: unknown[] }> {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      variants: true,
      content: { select: { id: true, title: true, slug: true, type: true } },
    },
  });

  if (!asset) {
    throw new NotFoundError('Asset', id);
  }

  return asset;
}

// ── Get Signed URL ──────────────────────────────────────────

export async function getSignedUrl(
  id: string,
  expiresIn: number = 3600,
  variant?: string
): Promise<{ url: string; expiresIn: number }> {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: { variants: true },
  });

  if (!asset) {
    throw new NotFoundError('Asset', id);
  }

  let key = asset.storageKey;

  // If a variant is requested, find its storage key
  if (variant) {
    const variantRecord = asset.variants.find((v) => v.variantKey === variant);
    if (!variantRecord) {
      throw new NotFoundError(`Asset variant '${variant}'`, id);
    }
    key = variantRecord.storageKey;
  }

  const url = await storage.getSignedUrl(key, expiresIn);

  return { url, expiresIn };
}

// ── Delete Asset ────────────────────────────────────────────

export async function deleteAsset(id: string): Promise<void> {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: { variants: true },
  });

  if (!asset) {
    throw new NotFoundError('Asset', id);
  }

  // Delete all variant files from storage
  const deletePromises: Promise<void>[] = [];

  for (const variant of asset.variants) {
    deletePromises.push(storage.delete(variant.storageKey));
  }

  // Delete original file
  deletePromises.push(storage.delete(asset.storageKey));

  await Promise.allSettled(deletePromises);

  // Delete DB records (variants cascade from asset)
  await prisma.asset.delete({ where: { id } });
}

// ── Process Image ───────────────────────────────────────────

export async function processImage(
  assetId: string,
  operations: ProcessingOperation[]
): Promise<{ queued: boolean; operationCount: number }> {
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });

  if (!asset) {
    throw new NotFoundError('Asset', assetId);
  }

  if (!isImageMimeType(asset.mimeType)) {
    throw new ValidationError(
      `Asset '${assetId}' is not a processable image (type: ${asset.mimeType}).`
    );
  }

  // Queue each operation
  for (const operation of operations) {
    await mediaQueue.add(
      `process-${operation.type}`,
      {
        assetId,
        operation: operation.type,
        params: operation,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
      }
    );
  }

  return { queued: true, operationCount: operations.length };
}

// ── Generate Thumbnail ──────────────────────────────────────

export async function generateThumbnail(assetId: string): Promise<void> {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: { variants: true },
  });

  if (!asset) {
    throw new NotFoundError('Asset', assetId);
  }

  if (!isImageMimeType(asset.mimeType)) {
    throw new ValidationError(`Asset '${assetId}' is not a processable image.`);
  }

  // Download the original file
  const original = await storage.download(asset.storageKey);

  // Process with sharp
  const sharp = (await import('sharp')).default;
  const thumbnailBuffer = await sharp(original)
    .resize(200, 200, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toBuffer();

  // Store the thumbnail
  const thumbnailKey = generateStorageKey('thumbnails', `${asset.filename}.jpg`);
  await storage.upload(thumbnailKey, thumbnailBuffer, 'image/jpeg');

  // Create or update variant record
  await prisma.assetVariant.upsert({
    where: {
      assetId_variantKey: {
        assetId,
        variantKey: 'thumbnail',
      },
    },
    update: {
      storageKey: thumbnailKey,
      mimeType: 'image/jpeg',
      sizeBytes: thumbnailBuffer.length,
      width: 200,
      height: 200,
    },
    create: {
      assetId,
      variantKey: 'thumbnail',
      storageKey: thumbnailKey,
      mimeType: 'image/jpeg',
      sizeBytes: thumbnailBuffer.length,
      width: 200,
      height: 200,
    },
  });
}

// ── Optimize Image ──────────────────────────────────────────

export async function optimizeImage(assetId: string): Promise<void> {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: { variants: true },
  });

  if (!asset) {
    throw new NotFoundError('Asset', assetId);
  }

  if (!isImageMimeType(asset.mimeType)) {
    throw new ValidationError(`Asset '${assetId}' is not a processable image.`);
  }

  // Download the original file
  const original = await storage.download(asset.storageKey);

  const sharp = (await import('sharp')).default;

  // Create optimized WebP version
  const webpBuffer = await sharp(original)
    .webp({ quality: 80 })
    .toBuffer();

  const webpKey = generateStorageKey('optimized', `${asset.filename}.webp`);
  await storage.upload(webpKey, webpBuffer, 'image/webp');

  // Get dimensions of the optimized image
  const webpMetadata = await sharp(webpBuffer).metadata();

  // Create variant record for WebP
  await prisma.assetVariant.upsert({
    where: {
      assetId_variantKey: {
        assetId,
        variantKey: 'webp',
      },
    },
    update: {
      storageKey: webpKey,
      mimeType: 'image/webp',
      sizeBytes: webpBuffer.length,
      width: webpMetadata.width ?? null,
      height: webpMetadata.height ?? null,
    },
    create: {
      assetId,
      variantKey: 'webp',
      storageKey: webpKey,
      mimeType: 'image/webp',
      sizeBytes: webpBuffer.length,
      width: webpMetadata.width ?? null,
      height: webpMetadata.height ?? null,
    },
  });

  // Create 2x variant (double resolution for retina displays)
  if (asset.width && asset.height) {
    const retinaBuffer = await sharp(original)
      .resize(asset.width * 2, asset.height * 2, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();

    const retinaKey = generateStorageKey('optimized', `${asset.filename}@2x.webp`);
    await storage.upload(retinaKey, retinaBuffer, 'image/webp');

    const retinaMetadata = await sharp(retinaBuffer).metadata();

    await prisma.assetVariant.upsert({
      where: {
        assetId_variantKey: {
          assetId,
          variantKey: '2x',
        },
      },
      update: {
        storageKey: retinaKey,
        mimeType: 'image/webp',
        sizeBytes: retinaBuffer.length,
        width: retinaMetadata.width ?? null,
        height: retinaMetadata.height ?? null,
      },
      create: {
        assetId,
        variantKey: '2x',
        storageKey: retinaKey,
        mimeType: 'image/webp',
        sizeBytes: retinaBuffer.length,
        width: retinaMetadata.width ?? null,
        height: retinaMetadata.height ?? null,
      },
    });
  }
}

// ── List Assets ─────────────────────────────────────────────

export async function listAssets(
  query: ListAssetsQuery
): Promise<PaginatedResult<Asset>> {
  const { page, limit, mimeType, contentId, sortBy, sortOrder } = query;

  const where: Record<string, unknown> = {};
  if (mimeType) {
    // Support partial match (e.g., "image" matches "image/jpeg", "image/png", etc.)
    if (!mimeType.includes('/')) {
      where.mimeType = { startsWith: `${mimeType}/` };
    } else {
      where.mimeType = mimeType;
    }
  }
  if (contentId) where.contentId = contentId;

  const [data, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      include: {
        variants: { select: { id: true, variantKey: true, mimeType: true, sizeBytes: true } },
        content: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.asset.count({ where }),
  ]);

  return paginate(data, total, { page, limit, sortBy, sortOrder });
}

// ── Update Asset Metadata ───────────────────────────────────

export async function updateAsset(
  id: string,
  data: UpdateAssetBody
): Promise<Asset> {
  const asset = await prisma.asset.findUnique({ where: { id } });

  if (!asset) {
    throw new NotFoundError('Asset', id);
  }

  // Verify new contentId exists if provided
  if (data.contentId) {
    const content = await prisma.content.findUnique({
      where: { id: data.contentId },
      select: { id: true },
    });
    if (!content) {
      throw new NotFoundError('Content', data.contentId);
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.alt !== undefined) updateData.alt = data.alt;
  if (data.contentId !== undefined) updateData.contentId = data.contentId;
  if (data.metadata !== undefined) {
    updateData.metadata = {
      ...(asset.metadata as Record<string, unknown>),
      ...data.metadata,
    };
  }

  return prisma.asset.update({
    where: { id },
    data: updateData,
    include: {
      variants: true,
      content: { select: { id: true, title: true, slug: true } },
    },
  });
}
