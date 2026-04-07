import { z } from 'zod';

// ── Shared Enums ──────────────────────────────────────────

export const messageTypeEnum = z.enum([
  'recap', 'new_content', 'bedtime_suggestion', 'subscription_reminder',
  'tip', 'seasonal_launch', 'system',
]);

export const channelEnum = z.enum(['in_app', 'email', 'push']);

// ── List Messages (paginated) ─────────────────────────────

export const listMessagesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    householdId: z.string().uuid(),
    read: z.enum(['true', 'false']).optional(),
    type: messageTypeEnum.optional(),
  }),
});

export type ListMessagesQuery = z.infer<typeof listMessagesSchema>['query'];

// ── Get Message ───────────────────────────────────────────

export const getMessageSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ── Mark Message Read ─────────────────────────────────────

export const markReadSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ── Mark All Read ─────────────────────────────────────────

export const markAllReadSchema = z.object({
  body: z.object({
    householdId: z.string().uuid(),
  }),
});

export type MarkAllReadInput = z.infer<typeof markAllReadSchema>['body'];

// ── Get Preferences ───────────────────────────────────────

export const getPreferencesSchema = z.object({
  query: z.object({
    parentId: z.string().uuid(),
  }),
});

export type GetPreferencesQuery = z.infer<typeof getPreferencesSchema>['query'];

// ── Update Preferences ────────────────────────────────────

export const updatePreferencesSchema = z.object({
  body: z.object({
    parentId: z.string().uuid(),
    preferences: z.array(
      z.object({
        channel: channelEnum,
        messageType: messageTypeEnum,
        enabled: z.boolean(),
      })
    ).min(1, 'At least one preference must be provided'),
  }),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>['body'];

// ── Send Message (admin) ──────────────────────────────────

export const sendMessageSchema = z.object({
  body: z.object({
    householdId: z.string().uuid(),
    profileId: z.string().uuid().optional(),
    type: messageTypeEnum,
    title: z.string().min(1, 'Title is required').max(200),
    body: z.string().min(1, 'Body is required').max(5000),
    actionUrl: z.string().url().optional(),
    actionLabel: z.string().max(100).optional(),
    expiresAt: z.string().datetime().optional(),
    metadata: z.record(z.unknown()).default({}),
  }),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>['body'];

// ── Send Bulk Messages (admin) ────────────────────────────

export const sendBulkSchema = z.object({
  body: z.object({
    householdIds: z.array(z.string().uuid()).min(1, 'At least one household ID is required'),
    type: messageTypeEnum,
    title: z.string().min(1, 'Title is required').max(200),
    body: z.string().min(1, 'Body is required').max(5000),
    actionUrl: z.string().url().optional(),
    actionLabel: z.string().max(100).optional(),
  }),
});

export type SendBulkInput = z.infer<typeof sendBulkSchema>['body'];
