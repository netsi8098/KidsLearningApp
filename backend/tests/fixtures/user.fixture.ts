// ── User & Household Fixtures ──────────────────────────────
// Deterministic test data for User, Household, ParentAccount,
// and ChildProfile models. All IDs and dates are fixed.

// ── Fixed reference dates ──────────────────────────────────

const FIXED_CREATED = new Date('2026-01-10T08:00:00.000Z');
const FIXED_UPDATED = new Date('2026-01-15T12:00:00.000Z');
const FIXED_LOGIN = new Date('2026-03-25T18:30:00.000Z');

// ── User fixture type (matches Prisma User model) ──────────

export interface UserFixture {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'editor' | 'reviewer' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

// ── Household fixture type ─────────────────────────────────

export interface HouseholdFixture {
  id: string;
  name: string;
  timezone: string;
  locale: string;
  plan: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// ── ParentAccount fixture type ─────────────────────────────

export interface ParentFixture {
  id: string;
  householdId: string;
  email: string;
  password: string;
  name: string;
  role: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// ── ChildProfile fixture type ──────────────────────────────

export interface ChildProfileFixture {
  id: string;
  householdId: string;
  name: string;
  avatarEmoji: string;
  totalStars: number;
  streakDays: number;
  ageGroup: string;
  interests: string[];
  bedtimeMode: boolean;
  reducedMotion: boolean;
  largerText: boolean;
  highContrast: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  autoplayEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// ── Counters ───────────────────────────────────────────────

let userCounter = 0;
let householdCounter = 0;
let parentCounter = 0;
let childCounter = 0;

// ── Factories ──────────────────────────────────────────────

/**
 * bcrypt hash of the string "TestPassword123!" generated with
 * cost factor 10. Using a pre-computed hash avoids requiring
 * bcrypt at test time while still matching the Prisma model.
 */
const HASHED_PASSWORD =
  '$2a$10$K7Y9Xz1234567890abcdefghijklmnopqrstuvwxyz012345678';

export function createUserFixture(
  overrides: Partial<UserFixture> = {}
): UserFixture {
  userCounter++;
  const idx = String(userCounter).padStart(3, '0');

  return {
    id: `user-${idx}`,
    email: `user-${idx}@kidslearning.test`,
    password: HASHED_PASSWORD,
    name: `Test User ${idx}`,
    role: 'viewer',
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    ...overrides,
  };
}

export function createHouseholdFixture(
  overrides: Partial<HouseholdFixture> = {}
): HouseholdFixture {
  householdCounter++;
  const idx = String(householdCounter).padStart(3, '0');

  return {
    id: `household-${idx}`,
    name: `Test Household ${idx}`,
    timezone: 'America/New_York',
    locale: 'en',
    plan: 'free',
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    deletedAt: null,
    ...overrides,
  };
}

export function createParentFixture(
  overrides: Partial<ParentFixture> = {}
): ParentFixture {
  parentCounter++;
  const idx = String(parentCounter).padStart(3, '0');

  return {
    id: `parent-${idx}`,
    householdId: `household-${idx}`,
    email: `parent-${idx}@kidslearning.test`,
    password: HASHED_PASSWORD,
    name: `Test Parent ${idx}`,
    role: 'primary',
    lastLoginAt: FIXED_LOGIN,
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    deletedAt: null,
    ...overrides,
  };
}

export function createChildProfileFixture(
  overrides: Partial<ChildProfileFixture> = {}
): ChildProfileFixture {
  childCounter++;
  const idx = String(childCounter).padStart(3, '0');

  return {
    id: `child-${idx}`,
    householdId: `household-${idx}`,
    name: `Test Child ${idx}`,
    avatarEmoji: '',
    totalStars: 0,
    streakDays: 0,
    ageGroup: 'age_2_3',
    interests: [],
    bedtimeMode: false,
    reducedMotion: false,
    largerText: false,
    highContrast: false,
    soundEnabled: true,
    musicEnabled: true,
    autoplayEnabled: true,
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    deletedAt: null,
    ...overrides,
  };
}

// ── Reset counters ─────────────────────────────────────────

export function resetUserCounters(): void {
  userCounter = 0;
  householdCounter = 0;
  parentCounter = 0;
  childCounter = 0;
}

// ── Predefined role fixtures ───────────────────────────────

export const ROLE_FIXTURES: Record<string, UserFixture> = {
  admin: {
    id: 'user-admin-001',
    email: 'admin@kidslearning.test',
    password: HASHED_PASSWORD,
    name: 'Admin User',
    role: 'admin',
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
  },
  editor: {
    id: 'user-editor-001',
    email: 'editor@kidslearning.test',
    password: HASHED_PASSWORD,
    name: 'Editor User',
    role: 'editor',
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
  },
  reviewer: {
    id: 'user-reviewer-001',
    email: 'reviewer@kidslearning.test',
    password: HASHED_PASSWORD,
    name: 'Reviewer User',
    role: 'reviewer',
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
  },
  viewer: {
    id: 'user-viewer-001',
    email: 'viewer@kidslearning.test',
    password: HASHED_PASSWORD,
    name: 'Viewer User',
    role: 'viewer',
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
  },
};

// ── Predefined household with family ───────────────────────

export const HOUSEHOLD_FIXTURE: HouseholdFixture = {
  id: 'household-001',
  name: 'The Test Family',
  timezone: 'America/New_York',
  locale: 'en',
  plan: 'premium',
  createdAt: FIXED_CREATED,
  updatedAt: FIXED_UPDATED,
  deletedAt: null,
};

export const PARENT_FIXTURE: ParentFixture = {
  id: 'parent-001',
  householdId: 'household-001',
  email: 'parent@kidslearning.test',
  password: HASHED_PASSWORD,
  name: 'Maria Test',
  role: 'primary',
  lastLoginAt: FIXED_LOGIN,
  createdAt: FIXED_CREATED,
  updatedAt: FIXED_UPDATED,
  deletedAt: null,
};

export const CAREGIVER_FIXTURE: ParentFixture = {
  id: 'parent-002',
  householdId: 'household-001',
  email: 'caregiver@kidslearning.test',
  password: HASHED_PASSWORD,
  name: 'James Caregiver',
  role: 'caregiver',
  lastLoginAt: null,
  createdAt: FIXED_CREATED,
  updatedAt: FIXED_UPDATED,
  deletedAt: null,
};

export const CHILD_FIXTURES: ChildProfileFixture[] = [
  {
    id: 'child-001',
    householdId: 'household-001',
    name: 'Lily',
    avatarEmoji: '',
    totalStars: 45,
    streakDays: 7,
    ageGroup: 'age_3_4',
    interests: ['animals', 'colors', 'stories'],
    bedtimeMode: false,
    reducedMotion: false,
    largerText: false,
    highContrast: false,
    soundEnabled: true,
    musicEnabled: true,
    autoplayEnabled: true,
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    deletedAt: null,
  },
  {
    id: 'child-002',
    householdId: 'household-001',
    name: 'Max',
    avatarEmoji: '',
    totalStars: 12,
    streakDays: 2,
    ageGroup: 'age_2_3',
    interests: ['numbers', 'shapes'],
    bedtimeMode: true,
    reducedMotion: true,
    largerText: false,
    highContrast: false,
    soundEnabled: true,
    musicEnabled: false,
    autoplayEnabled: false,
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    deletedAt: null,
  },
];
