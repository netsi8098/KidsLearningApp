import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as messagesService from './service.js';
import {
  listMessagesSchema,
  getMessageSchema,
  markReadSchema,
  markAllReadSchema,
  getPreferencesSchema,
  updatePreferencesSchema,
  sendMessageSchema,
  sendBulkSchema,
} from './schemas.js';

const router = Router();

// ══════════════════════════════════════════════════════════
// Authenticated routes (any role)
// ══════════════════════════════════════════════════════════

// ── GET /api/messages ───────────────────────────────────
// List messages for a household with pagination and optional filters.

router.get(
  '/',
  authenticate,
  validate(listMessagesSchema),
  async (req, res) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as
      Parameters<typeof messagesService.listMessages>[0];
    const result = await messagesService.listMessages(query);
    res.json(result);
  }
);

// ── GET /api/messages/preferences ───────────────────────
// Get message preferences for a parent.
// NOTE: Must be registered before /:id to avoid route conflicts.

router.get(
  '/preferences',
  authenticate,
  validate(getPreferencesSchema),
  async (req, res) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as
      Parameters<typeof messagesService.getPreferences>[0];
    const preferences = await messagesService.getPreferences(query);
    res.json(preferences);
  }
);

// ── GET /api/messages/:id ───────────────────────────────
// Get a single message by ID.

router.get(
  '/:id',
  authenticate,
  validate(getMessageSchema),
  async (req, res) => {
    const message = await messagesService.getMessage(req.params.id as string);
    res.json(message);
  }
);

// ── PATCH /api/messages/:id/read ────────────────────────
// Mark a single message as read.

router.patch(
  '/:id/read',
  authenticate,
  validate(markReadSchema),
  async (req, res) => {
    const message = await messagesService.markRead(req.params.id as string);
    res.json(message);
  }
);

// ── POST /api/messages/mark-all-read ────────────────────
// Mark all unread messages as read for a household.

router.post(
  '/mark-all-read',
  authenticate,
  validate(markAllReadSchema),
  async (req, res) => {
    const result = await messagesService.markAllRead(req.body);
    res.json(result);
  }
);

// ── PUT /api/messages/preferences ───────────────────────
// Update message preferences for a parent.

router.put(
  '/preferences',
  authenticate,
  validate(updatePreferencesSchema),
  async (req, res) => {
    const preferences = await messagesService.updatePreferences(req.body);
    res.json(preferences);
  }
);

// ══════════════════════════════════════════════════════════
// Admin-only routes (authenticate + requireRole('admin'))
// ══════════════════════════════════════════════════════════

// ── POST /api/messages ──────────────────────────────────
// Send a message to a household (admin/system use).

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  validate(sendMessageSchema),
  async (req, res) => {
    const message = await messagesService.sendMessage(req.body);
    res.status(201).json(message);
  }
);

// ── POST /api/messages/bulk ─────────────────────────────
// Send a message to multiple households (admin use).

router.post(
  '/bulk',
  authenticate,
  requireRole('admin'),
  validate(sendBulkSchema),
  async (req, res) => {
    const result = await messagesService.sendBulk(req.body);
    res.status(201).json(result);
  }
);

export default router;
