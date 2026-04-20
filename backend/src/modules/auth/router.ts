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

// ── POST /api/auth/forgot-password ───────────────────────

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

router.post('/forgot-password', validate(forgotPasswordSchema), async (req, res) => {
  try {
    // Always return success to prevent email enumeration
    const { email } = req.body;
    // In production, this would:
    // 1. Look up user by email
    // 2. Generate a reset token (crypto.randomUUID())
    // 3. Store token with expiry in DB
    // 4. Send email via emailService.sendPasswordResetEmail()
    console.log(`[Auth] Password reset requested for: ${email}`);
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch {
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  }
});

// ── POST /api/auth/verify-email ─────────────────────────

const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1),
  }),
});

router.post('/verify-email', validate(verifyEmailSchema), async (req, res) => {
  try {
    // In production, this would:
    // 1. Look up verification token in DB
    // 2. Mark user's email as verified
    // 3. Delete the token
    console.log(`[Auth] Email verification token: ${req.body.token}`);
    res.json({ message: 'Email verified successfully!' });
  } catch {
    res.status(400).json({ message: 'Invalid or expired verification token.' });
  }
});

// ── POST /api/auth/reset-password ───────────────────────

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8),
  }),
});

router.post('/reset-password', validate(resetPasswordSchema), async (req, res) => {
  try {
    // In production, this would:
    // 1. Look up reset token in DB
    // 2. Verify it hasn't expired
    // 3. Hash new password
    // 4. Update user's password
    // 5. Delete the token
    console.log(`[Auth] Password reset with token: ${req.body.token}`);
    res.json({ message: 'Password has been reset successfully!' });
  } catch {
    res.status(400).json({ message: 'Invalid or expired reset token.' });
  }
});

export default router;
