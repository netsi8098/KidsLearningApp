import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { signToken, type AuthPayload } from '../../middleware/auth.js';
import { NotFoundError, ConflictError, UnauthorizedError } from '../../lib/errors.js';
import type { Role } from '@prisma/client';

// ── Types ─────────────────────────────────────────────────

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
  token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
}

// ── Selection Constants ───────────────────────────────────

const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
} as const;

const USER_PROFILE_SELECT = {
  ...USER_PUBLIC_SELECT,
  createdAt: true,
} as const;

// ── Password Utilities ────────────────────────────────────

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

// ── Auth Service ──────────────────────────────────────────

export async function register(input: RegisterInput): Promise<AuthResult> {
  const { email, password, name } = input;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictError('Email already registered');
  }

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, password: hashed, name },
    select: USER_PUBLIC_SELECT,
  });

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, token };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const { email, password } = input;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  };
}

export async function getProfile(userId: string): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: USER_PROFILE_SELECT,
  });

  if (!user) {
    throw new NotFoundError('User', userId);
  }

  return user;
}

export async function updateRole(
  userId: string,
  role: Role
): Promise<{ id: string; email: string; name: string; role: Role }> {
  // Verify user exists before updating
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    throw new NotFoundError('User', userId);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: USER_PUBLIC_SELECT,
  });

  return user;
}

export async function findUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: USER_PROFILE_SELECT,
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: USER_PROFILE_SELECT,
  });
}

/**
 * Generate a fresh token for a user (e.g. after role change or token refresh).
 */
export function generateToken(payload: AuthPayload): string {
  return signToken(payload);
}
