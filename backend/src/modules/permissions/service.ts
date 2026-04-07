import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ConflictError } from '../../lib/errors.js';
import { Prisma } from '@prisma/client';
import type { CreatePermissionInput, UpdatePermissionInput, ListPermissionsQuery } from './schemas.js';

// ── List Permissions ─────────────────────────────────────

export async function listPermissions(query: ListPermissionsQuery) {
  const where: Prisma.PermissionWhereInput = {};

  if (query.role) {
    where.role = query.role;
  }
  if (query.resource) {
    where.resource = query.resource;
  }

  const data = await prisma.permission.findMany({
    where,
    orderBy: [{ role: 'asc' }, { resource: 'asc' }, { action: 'asc' }],
  });

  return { data, total: data.length };
}

// ── Create Permission ────────────────────────────────────

export async function createPermission(input: CreatePermissionInput) {
  try {
    const permission = await prisma.permission.create({
      data: {
        role: input.role,
        resource: input.resource,
        action: input.action,
        allowed: input.allowed,
        conditions: (input.conditions ?? {}) as Prisma.InputJsonValue,
      },
    });

    return permission;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictError(
        `Permission for role '${input.role}' on resource '${input.resource}' with action '${input.action}' already exists`
      );
    }
    throw error;
  }
}

// ── Update Permission ────────────────────────────────────

export async function updatePermission(id: string, input: UpdatePermissionInput) {
  const existing = await prisma.permission.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('Permission', id);
  }

  const data: Prisma.PermissionUpdateInput = {};

  if (input.allowed !== undefined) data.allowed = input.allowed;
  if (input.conditions !== undefined) data.conditions = input.conditions as Prisma.InputJsonValue;

  const permission = await prisma.permission.update({
    where: { id },
    data,
  });

  return permission;
}

// ── Delete Permission ────────────────────────────────────

export async function deletePermission(id: string) {
  const existing = await prisma.permission.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('Permission', id);
  }

  await prisma.permission.delete({ where: { id } });

  return { deleted: true, id };
}

// ── Check Permission ─────────────────────────────────────

export async function checkPermission(
  role: string,
  resource: string,
  action: string
): Promise<{ allowed: boolean; conditions: Record<string, unknown> }> {
  const permission = await prisma.permission.findUnique({
    where: {
      role_resource_action: { role, resource, action },
    },
  });

  if (!permission) {
    return { allowed: false, conditions: {} };
  }

  return {
    allowed: permission.allowed,
    conditions: (permission.conditions as Record<string, unknown>) ?? {},
  };
}
