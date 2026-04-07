import { Prisma } from '@prisma/client';

// Models that support soft delete via deletedAt
const SOFT_DELETE_MODELS = new Set([
  'Content', 'Asset', 'Collection', 'Curriculum', 'Tag',
  'OfflinePack', 'Experiment', 'Prompt', 'Brief', 'LicensedRight',
  'Household', 'ParentAccount', 'ChildProfile',
  // v8 additions
  'FeatureFlag', 'ParentTip', 'HelpArticle', 'Routine', 'MerchandisingAsset',
]);

/**
 * Prisma middleware that auto-filters soft-deleted records.
 * - findMany / findFirst / count: adds `deletedAt: null` filter
 * - delete: converts to update with `deletedAt: now()`
 *
 * To bypass, pass `{ where: { deletedAt: { not: null } } }` explicitly
 * or use `$queryRaw`.
 */
// TODO: Prisma v5+ removed Prisma.Middleware type. Migrate to $extends pattern.
export function softDeleteMiddleware(): (params: any, next: any) => any {
  return async (params: any, next: any) => {
    if (!params.model || !SOFT_DELETE_MODELS.has(params.model)) {
      return next(params);
    }

    // Auto-filter deleted records on reads
    if (params.action === 'findMany' || params.action === 'findFirst' || params.action === 'count') {
      if (!params.args) params.args = {};
      if (!params.args.where) params.args.where = {};

      // Only add filter if deletedAt is not already specified
      if (params.args.where.deletedAt === undefined) {
        params.args.where.deletedAt = null;
      }
    }

    // Convert delete to soft delete
    if (params.action === 'delete') {
      params.action = 'update';
      if (!params.args) params.args = {};
      params.args.data = { deletedAt: new Date() };
    }

    // Convert deleteMany to soft delete
    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      if (!params.args) params.args = {};
      params.args.data = { deletedAt: new Date() };
    }

    return next(params);
  };
}
