import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as authService from './service.js';

const router = Router();

// ── POST /api/auth/register ───────────────────────────────

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required').max(100),
  }),
});

router.post('/register', validate(registerSchema), async (req, res) => {
  const { email, password, name } = req.body;
  const result = await authService.register({ email, password, name });
  res.status(201).json(result);
});

// ── POST /api/auth/login ──────────────────────────────────

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
  }),
});

router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (err: any) {
    const status = err.statusCode || 500;
    res.status(status).json({ message: err.message || 'Login failed' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────

router.get('/me', authenticate, async (req, res) => {
  const profile = await authService.getProfile(req.user!.userId);
  res.json(profile);
});

// ── PATCH /api/auth/users/:id/role  (admin only) ─────────

const updateRoleSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    role: z.enum(['admin', 'editor', 'reviewer', 'viewer']),
  }),
});

router.patch(
  '/users/:id/role',
  authenticate,
  requireRole('admin'),
  validate(updateRoleSchema),
  async (req, res) => {
    const user = await authService.updateRole(req.params.id as string, req.body.role);
    res.json(user);
  }
);

export default router;
