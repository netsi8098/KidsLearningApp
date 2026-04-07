import { Request, Response, NextFunction } from 'express';
import { prisma } from './prisma.js';
import { ForbiddenError } from './errors.js';

/**
 * Check if a household has a specific entitlement.
 */
export async function checkEntitlement(householdId: string, feature: string): Promise<boolean> {
  const entitlement = await prisma.entitlement.findUnique({
    where: { householdId_feature: { householdId, feature } },
  });
  if (!entitlement) return false;
  if (!entitlement.granted) return false;
  if (entitlement.expiresAt && entitlement.expiresAt < new Date()) return false;
  return true;
}

/**
 * Middleware that requires a specific entitlement for the household.
 * Expects `req.params.householdId` or `req.body.householdId` or `req.query.householdId`.
 */
export function requireEntitlement(feature: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const householdId =
      req.params.householdId ??
      (req.body as Record<string, unknown>)?.householdId ??
      (req.query.householdId as string);

    if (!householdId) {
      throw new ForbiddenError('Household ID required for entitlement check');
    }

    const hasAccess = await checkEntitlement(String(householdId), feature);
    if (!hasAccess) {
      throw new ForbiddenError(`Requires entitlement: ${feature}`);
    }
    next();
  };
}
