import { z } from 'zod';

// ── List Permissions ─────────────────────────────────────

export const listPermissionsSchema = z.object({
  query: z.object({
    role: z.string().optional(),
    resource: z.string().optional(),
  }),
});

export type ListPermissionsQuery = z.infer<typeof listPermissionsSchema>['query'];

// ── Create Permission ────────────────────────────────────

export const createPermissionSchema = z.object({
  body: z.object({
    role: z.string().min(1),
    resource: z.string().min(1),
    action: z.string().min(1),
    allowed: z.boolean().default(true),
    conditions: z.record(z.unknown()).optional(),
  }),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>['body'];

// ── Update Permission ────────────────────────────────────

export const updatePermissionSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    allowed: z.boolean().optional(),
    conditions: z.record(z.unknown()).optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  ),
});

export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>['body'];

// ── Delete Permission ────────────────────────────────────

export const deletePermissionSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ── Check Permission ─────────────────────────────────────

export const checkPermissionSchema = z.object({
  query: z.object({
    role: z.string().min(1),
    resource: z.string().min(1),
    action: z.string().min(1),
  }),
});

export type CheckPermissionQuery = z.infer<typeof checkPermissionSchema>['query'];
