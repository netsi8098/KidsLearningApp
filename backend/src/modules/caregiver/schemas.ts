import { z } from 'zod';

// ── Shared Enums ──────────────────────────────────────────

export const caregiverRoleEnum = z.enum(['caregiver', 'viewer']);

export const accessLevelEnum = z.enum(['full', 'view_only']);

// ── List Caregivers ───────────────────────────────────────

export const listCaregiversSchema = z.object({
  params: z.object({
    householdId: z.string().uuid(),
  }),
});

// ── Send Invite ───────────────────────────────────────────

export const sendInviteSchema = z.object({
  body: z.object({
    householdId: z.string().uuid(),
    email: z.string().email(),
    role: caregiverRoleEnum.default('caregiver'),
    childScope: z.array(z.string().uuid()).optional(),
  }),
});

export type SendInviteInput = z.infer<typeof sendInviteSchema>['body'];

// ── Accept Invite ─────────────────────────────────────────

export const acceptInviteSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    name: z.string().min(1, 'Name is required').max(100),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>['body'];

// ── Revoke Caregiver ──────────────────────────────────────

export const revokeAccessSchema = z.object({
  body: z.object({
    caregiverId: z.string().uuid(),
    householdId: z.string().uuid(),
  }),
});

export type RevokeAccessInput = z.infer<typeof revokeAccessSchema>['body'];

// ── List Child Access ─────────────────────────────────────

export const listChildAccessSchema = z.object({
  params: z.object({
    caregiverId: z.string().uuid(),
  }),
});

// ── Update Child Access ───────────────────────────────────

export const updateChildAccessSchema = z.object({
  body: z.object({
    caregiverId: z.string().uuid(),
    childProfileId: z.string().uuid(),
    accessLevel: accessLevelEnum,
  }),
});

export type UpdateChildAccessInput = z.infer<typeof updateChildAccessSchema>['body'];

// ── Caregiver Audit ───────────────────────────────────────

export const caregiverAuditSchema = z.object({
  params: z.object({
    householdId: z.string().uuid(),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type CaregiverAuditQuery = z.infer<typeof caregiverAuditSchema>['query'];
