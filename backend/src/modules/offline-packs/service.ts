import { prisma } from '../../lib/prisma.js';
import { offlinePackQueue } from '../../lib/queue.js';
import { storage } from '../../lib/storage.js';
import { NotFoundError, ValidationError, ConflictError } from '../../lib/errors.js';
import { paginate, type PaginatedResult } from '../../types/index.js';
import type {
  CreatePackBody,
  UpdatePackBody,
  AddPackItemBody,
  ListPacksQuery,
} from './schemas.js';
import type { OfflinePack, OfflinePackItem } from '@prisma/client';

// ── Manifest Types ──────────────────────────────────────────

export interface PackManifest {
  id: string;
  title: string;
  slug: string;
  emoji: string;
  description: string | null;
  ageGroup: string;
  version: number;
  builtAt: string;
  totalSizeMB: number;
  items: PackManifestItem[];
  assets: PackManifestAsset[];
}

export interface PackManifestItem {
  contentId: string;
  type: string;
  title: string;
  slug: string;
  data: unknown;
}

export interface PackManifestAsset {
  assetId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  variants: Array<{
    variantKey: string;
    mimeType: string;
    sizeBytes: number;
    url: string;
  }>;
}

// ── Service Functions ───────────────────────────────────────

export async function listPacks(
  query: ListPacksQuery
): Promise<PaginatedResult<OfflinePack>> {
  const { page, limit, published, ageGroup, sortBy, sortOrder } = query;

  const where: Record<string, unknown> = {};
  if (published !== undefined) where.published = published;
  if (ageGroup) where.ageGroup = ageGroup;

  const [data, total] = await Promise.all([
    prisma.offlinePack.findMany({
      where,
      include: {
        items: {
          select: { id: true, contentId: true, includeAssets: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.offlinePack.count({ where }),
  ]);

  return paginate(data, total, { page, limit, sortBy, sortOrder });
}

export async function getPack(
  id: string
): Promise<OfflinePack & { items: OfflinePackItem[] }> {
  const pack = await prisma.offlinePack.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          content: {
            select: {
              id: true,
              title: true,
              slug: true,
              type: true,
              status: true,
              ageGroup: true,
            },
          },
        },
      },
    },
  });

  if (!pack) {
    throw new NotFoundError('OfflinePack', id);
  }

  return pack;
}

export async function createPack(data: CreatePackBody): Promise<OfflinePack> {
  // Check for slug uniqueness
  const existing = await prisma.offlinePack.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });

  if (existing) {
    throw new ConflictError(`An offline pack with slug '${data.slug}' already exists.`);
  }

  return prisma.offlinePack.create({
    data: {
      title: data.title,
      slug: data.slug,
      emoji: data.emoji,
      description: data.description ?? null,
      ageGroup: data.ageGroup,
    },
    include: {
      items: true,
    },
  });
}

export async function updatePack(
  id: string,
  data: UpdatePackBody
): Promise<OfflinePack> {
  const pack = await prisma.offlinePack.findUnique({ where: { id } });

  if (!pack) {
    throw new NotFoundError('OfflinePack', id);
  }

  if (pack.published) {
    throw new ValidationError(
      'Cannot update a published pack. Create a new version or unpublish first.'
    );
  }

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.emoji !== undefined) updateData.emoji = data.emoji;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.ageGroup !== undefined) updateData.ageGroup = data.ageGroup;

  return prisma.offlinePack.update({
    where: { id },
    data: updateData,
    include: {
      items: {
        include: {
          content: {
            select: { id: true, title: true, slug: true, type: true },
          },
        },
      },
    },
  });
}

export async function addPackItem(
  packId: string,
  data: AddPackItemBody
): Promise<OfflinePackItem> {
  const pack = await prisma.offlinePack.findUnique({ where: { id: packId } });

  if (!pack) {
    throw new NotFoundError('OfflinePack', packId);
  }

  if (pack.published) {
    throw new ValidationError('Cannot add items to a published pack.');
  }

  // Verify content exists
  const content = await prisma.content.findUnique({
    where: { id: data.contentId },
    select: { id: true },
  });

  if (!content) {
    throw new NotFoundError('Content', data.contentId);
  }

  // Check for duplicate
  const existing = await prisma.offlinePackItem.findUnique({
    where: {
      packId_contentId: {
        packId,
        contentId: data.contentId,
      },
    },
  });

  if (existing) {
    throw new ConflictError(
      `Content '${data.contentId}' is already in pack '${packId}'.`
    );
  }

  return prisma.offlinePackItem.create({
    data: {
      packId,
      contentId: data.contentId,
      includeAssets: data.includeAssets,
    },
    include: {
      content: {
        select: { id: true, title: true, slug: true, type: true },
      },
    },
  });
}

export async function removePackItem(
  packId: string,
  itemId: string
): Promise<void> {
  const pack = await prisma.offlinePack.findUnique({ where: { id: packId } });

  if (!pack) {
    throw new NotFoundError('OfflinePack', packId);
  }

  if (pack.published) {
    throw new ValidationError('Cannot remove items from a published pack.');
  }

  const item = await prisma.offlinePackItem.findFirst({
    where: { id: itemId, packId },
  });

  if (!item) {
    throw new NotFoundError('OfflinePackItem', itemId);
  }

  await prisma.offlinePackItem.delete({ where: { id: itemId } });
}

export async function buildPack(id: string): Promise<{
  queued: boolean;
  estimatedSizeMB: number;
}> {
  const pack = await prisma.offlinePack.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!pack) {
    throw new NotFoundError('OfflinePack', id);
  }

  if (pack.items.length === 0) {
    throw new ValidationError('Cannot build a pack with no items.');
  }

  // Estimate size before building
  const estimatedSizeMB = await estimateSize(id);

  // Update size estimate on the pack
  await prisma.offlinePack.update({
    where: { id },
    data: { sizeEstimateMB: estimatedSizeMB },
  });

  // Queue the build job
  await offlinePackQueue.add(
    'build-pack',
    {
      packId: id,
      version: pack.version,
    },
    {
      attempts: 2,
      backoff: { type: 'exponential', delay: 10000 },
    }
  );

  return { queued: true, estimatedSizeMB };
}

export async function generateManifest(id: string): Promise<PackManifest> {
  const pack = await prisma.offlinePack.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          content: {
            include: {
              assets: {
                include: { variants: true },
              },
            },
          },
        },
      },
    },
  });

  if (!pack) {
    throw new NotFoundError('OfflinePack', id);
  }

  const manifestItems: PackManifestItem[] = [];
  const manifestAssets: PackManifestAsset[] = [];
  const seenAssetIds = new Set<string>();

  for (const item of pack.items) {
    const content = item.content;

    manifestItems.push({
      contentId: content.id,
      type: content.type,
      title: content.title,
      slug: content.slug,
      data: content.body,
    });

    // Collect assets if included
    if (item.includeAssets) {
      for (const asset of content.assets) {
        if (seenAssetIds.has(asset.id)) continue;
        seenAssetIds.add(asset.id);

        // Generate URLs for the asset and its variants
        const assetUrl = await storage.getSignedUrl(asset.storageKey);
        const variantEntries = await Promise.all(
          asset.variants.map(async (v) => ({
            variantKey: v.variantKey,
            mimeType: v.mimeType,
            sizeBytes: v.sizeBytes,
            url: await storage.getSignedUrl(v.storageKey),
          }))
        );

        manifestAssets.push({
          assetId: asset.id,
          filename: asset.filename,
          mimeType: asset.mimeType,
          sizeBytes: asset.sizeBytes,
          url: assetUrl,
          variants: variantEntries,
        });
      }
    }
  }

  const totalSizeBytes = manifestAssets.reduce(
    (sum, a) => sum + a.sizeBytes + a.variants.reduce((vs, v) => vs + v.sizeBytes, 0),
    0
  );

  // Add estimated content JSON size (rough estimate: 1KB per content item)
  const contentJsonSize = manifestItems.length * 1024;
  const totalSizeMB =
    Math.round(((totalSizeBytes + contentJsonSize) / (1024 * 1024)) * 100) / 100;

  return {
    id: pack.id,
    title: pack.title,
    slug: pack.slug,
    emoji: pack.emoji,
    description: pack.description,
    ageGroup: pack.ageGroup,
    version: pack.version,
    builtAt: new Date().toISOString(),
    totalSizeMB,
    items: manifestItems,
    assets: manifestAssets,
  };
}

export async function publishPack(id: string): Promise<OfflinePack> {
  const pack = await prisma.offlinePack.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!pack) {
    throw new NotFoundError('OfflinePack', id);
  }

  if (pack.published) {
    throw new ValidationError('Pack is already published.');
  }

  if (pack.items.length === 0) {
    throw new ValidationError('Cannot publish a pack with no items.');
  }

  // Verify all content items are in a publishable state
  const contentIds = pack.items.map((i) => i.contentId);
  const contents = await prisma.content.findMany({
    where: { id: { in: contentIds } },
    select: { id: true, title: true, status: true },
  });

  const unpublished = contents.filter(
    (c) => c.status !== 'published' && c.status !== 'approved'
  );

  if (unpublished.length > 0) {
    const names = unpublished.map((c) => `"${c.title}" (${c.status})`).join(', ');
    throw new ValidationError(
      `Cannot publish pack: the following content items are not published/approved: ${names}`
    );
  }

  return prisma.offlinePack.update({
    where: { id },
    data: {
      published: true,
      version: { increment: 1 },
    },
    include: {
      items: {
        include: {
          content: {
            select: { id: true, title: true, slug: true, type: true },
          },
        },
      },
    },
  });
}

export async function estimateSize(id: string): Promise<number> {
  const pack = await prisma.offlinePack.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          content: {
            include: {
              assets: {
                include: { variants: true },
              },
            },
          },
        },
      },
    },
  });

  if (!pack) {
    throw new NotFoundError('OfflinePack', id);
  }

  let totalBytes = 0;

  for (const item of pack.items) {
    // Content JSON size (rough estimate from serialized body)
    const bodyJson = JSON.stringify(item.content.body);
    totalBytes += Buffer.byteLength(bodyJson, 'utf-8');

    // Metadata overhead per content item (~500 bytes for title, slug, type, etc.)
    totalBytes += 500;

    // Asset sizes
    if (item.includeAssets) {
      for (const asset of item.content.assets) {
        totalBytes += asset.sizeBytes;
        for (const variant of asset.variants) {
          totalBytes += variant.sizeBytes;
        }
      }
    }
  }

  // Return in MB, rounded to 2 decimal places
  return Math.round((totalBytes / (1024 * 1024)) * 100) / 100;
}
