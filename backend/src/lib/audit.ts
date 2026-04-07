import { Prisma } from '@prisma/client';
import { prisma } from './prisma.js';

export interface AuditLogInput {
  action: string;
  entity: string;
  entityId: string;
  changes?: Record<string, unknown>;
  userId?: string;
  ipAddress?: string;
}

export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        changes: (input.changes ?? {}) as Prisma.InputJsonValue,
        userId: input.userId ?? null,
        ipAddress: input.ipAddress ?? null,
      },
    });
  } catch {
    // Audit logging should never break the main operation
    console.error('[AuditLog] Failed to write audit log:', input);
  }
}

export function getClientIp(req: { headers: Record<string, string | string[] | undefined>; ip?: string }): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.ip ?? 'unknown';
}
