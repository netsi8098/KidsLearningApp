import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';
import type { PaginatedResult } from '../../types/index.js';
import type {
  ListMessagesQuery,
  MarkAllReadInput,
  GetPreferencesQuery,
  UpdatePreferencesInput,
  SendMessageInput,
  SendBulkInput,
} from './schemas.js';

// ── List Messages ────────────────────────────────────────

export async function listMessages(
  query: ListMessagesQuery
): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page, limit, sortBy, sortOrder, householdId, read, type } = query;

  const where: Prisma.MessageWhereInput = {
    householdId,
  };

  if (read !== undefined) {
    where.read = read === 'true';
  }

  if (type) {
    where.type = type;
  }

  const [data, total] = await Promise.all([
    prisma.message.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.message.count({ where }),
  ]);

  return {
    data: data as unknown as Record<string, unknown>[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Get Message ──────────────────────────────────────────

export async function getMessage(id: string) {
  const message = await prisma.message.findUnique({
    where: { id },
  });

  if (!message) {
    throw new NotFoundError('Message', id);
  }

  return message;
}

// ── Mark Message Read ────────────────────────────────────

export async function markRead(id: string) {
  const existing = await prisma.message.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('Message', id);
  }

  const message = await prisma.message.update({
    where: { id },
    data: {
      read: true,
      readAt: new Date(),
    },
  });

  return message;
}

// ── Mark All Read ────────────────────────────────────────

export async function markAllRead(input: MarkAllReadInput) {
  const { householdId } = input;

  const result = await prisma.message.updateMany({
    where: {
      householdId,
      read: false,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });

  return { updated: result.count };
}

// ── Get Preferences ──────────────────────────────────────

export async function getPreferences(query: GetPreferencesQuery) {
  const { parentId } = query;

  const preferences = await prisma.messagePreference.findMany({
    where: { parentId },
    orderBy: [{ channel: 'asc' }, { messageType: 'asc' }],
  });

  return preferences;
}

// ── Update Preferences ───────────────────────────────────

export async function updatePreferences(input: UpdatePreferencesInput) {
  const { parentId, preferences } = input;

  const results = await prisma.$transaction(
    preferences.map((pref) =>
      prisma.messagePreference.upsert({
        where: {
          parentId_channel_messageType: {
            parentId,
            channel: pref.channel,
            messageType: pref.messageType,
          },
        },
        update: {
          enabled: pref.enabled,
        },
        create: {
          parentId,
          channel: pref.channel,
          messageType: pref.messageType,
          enabled: pref.enabled,
        },
      })
    )
  );

  return results;
}

// ── Send Message (admin/system) ──────────────────────────

export async function sendMessage(input: SendMessageInput) {
  const message = await prisma.message.create({
    data: {
      householdId: input.householdId,
      profileId: input.profileId ?? null,
      type: input.type,
      title: input.title,
      body: input.body,
      actionUrl: input.actionUrl ?? null,
      actionLabel: input.actionLabel ?? null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });

  return message;
}

// ── Send Bulk Messages (admin) ───────────────────────────

export async function sendBulk(input: SendBulkInput) {
  const { householdIds, type, title, body, actionUrl, actionLabel } = input;

  const messages = await prisma.message.createMany({
    data: householdIds.map((householdId) => ({
      householdId,
      type,
      title,
      body,
      actionUrl: actionUrl ?? null,
      actionLabel: actionLabel ?? null,
      metadata: {} as Prisma.InputJsonValue,
    })),
  });

  return { created: messages.count };
}
