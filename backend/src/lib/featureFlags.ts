import { Request, Response, NextFunction } from 'express';
import { prisma } from './prisma.js';
import { ForbiddenError } from './errors.js';

export interface FlagContext {
  environment?: string;
  appVersion?: string;
  locale?: string;
  ageBand?: string;
  premiumOnly?: boolean;
  householdId?: string;
  profileId?: string;
}

/**
 * Evaluate a feature flag against a given context.
 * Returns the resolved value (boolean or JSON).
 */
export async function evaluateFlag(key: string, context: FlagContext = {}): Promise<unknown> {
  const flag = await prisma.featureFlag.findUnique({
    where: { key },
    include: { overrides: true },
  });

  if (!flag || flag.deletedAt) return false;
  if (!flag.enabled) return flag.defaultValue;

  // Check entity-level overrides first
  if (context.householdId) {
    const override = flag.overrides.find(
      (o) => o.entityType === 'household' && o.entityId === context.householdId
    );
    if (override) return override.value;
  }
  if (context.profileId) {
    const override = flag.overrides.find(
      (o) => o.entityType === 'profile' && o.entityId === context.profileId
    );
    if (override) return override.value;
  }

  // Check targeting rules
  const targeting = flag.targeting as Record<string, unknown>;
  if (targeting && typeof targeting === 'object') {
    if (targeting.environments && Array.isArray(targeting.environments)) {
      if (context.environment && !targeting.environments.includes(context.environment)) {
        return flag.defaultValue;
      }
    }
    if (targeting.locales && Array.isArray(targeting.locales)) {
      if (context.locale && !targeting.locales.includes(context.locale)) {
        return flag.defaultValue;
      }
    }
    if (targeting.premiumOnly === true && !context.premiumOnly) {
      return flag.defaultValue;
    }
    if (targeting.householdIds && Array.isArray(targeting.householdIds)) {
      if (context.householdId && !targeting.householdIds.includes(context.householdId)) {
        return flag.defaultValue;
      }
    }
  }

  return true;
}

/**
 * Middleware that requires a feature flag to be enabled.
 */
export function requireFlag(key: string) {
  return async (_req: Request, _res: Response, next: NextFunction) => {
    const value = await evaluateFlag(key);
    if (!value) {
      throw new ForbiddenError(`Feature not enabled: ${key}`);
    }
    next();
  };
}
