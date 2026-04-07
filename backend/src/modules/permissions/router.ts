import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as permissionsService from './service.js';
import {
  listPermissionsSchema,
  createPermissionSchema,
  updatePermissionSchema,
  deletePermissionSchema,
  checkPermissionSchema,
} from './schemas.js';

const router = Router();

// ── GET /api/permissions ─────────────────────────────────

router.get(
  '/',
  authenticate,
  requireRole('admin'),
  validate(listPermissionsSchema),
  async (req, res) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      role?: string;
      resource?: string;
    };

    const result = await permissionsService.listPermissions(query);
    res.json(result);
  }
);

// ── GET /api/permissions/check ───────────────────────────

router.get(
  '/check',
  authenticate,
  requireRole('admin'),
  validate(checkPermissionSchema),
  async (req, res) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      role: string;
      resource: string;
      action: string;
    };

    const result = await permissionsService.checkPermission(
      query.role,
      query.resource,
      query.action
    );
    res.json(result);
  }
);

// ── POST /api/permissions ────────────────────────────────

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  validate(createPermissionSchema),
  async (req, res) => {
    const permission = await permissionsService.createPermission(req.body);
    res.status(201).json(permission);
  }
);

// ── PATCH /api/permissions/:id ───────────────────────────

router.patch(
  '/:id',
  authenticate,
  requireRole('admin'),
  validate(updatePermissionSchema),
  async (req, res) => {
    const permission = await permissionsService.updatePermission(
      req.params.id as string,
      req.body
    );
    res.json(permission);
  }
);

// ── DELETE /api/permissions/:id ──────────────────────────

router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  validate(deletePermissionSchema),
  async (req, res) => {
    const result = await permissionsService.deletePermission(req.params.id as string);
    res.json(result);
  }
);

export default router;
