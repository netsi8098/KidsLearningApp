import { type Page } from '@playwright/test';

// ── Interfaces matching Dexie schema ─────────────────────────

interface TestProfile {
  name: string;
  avatarEmoji: string;
  totalStars: number;
  streakDays: number;
  lastStreakDate: string;
  createdAt: string;
  lastPlayedAt: string;
  age?: number;
  ageGroup?: '2-3' | '4-5' | '6-8';
  interests?: string[];
  onboardingCompleted?: boolean;
}

interface TestStarRecord {
  playerId: number;
  category: string;
  starsEarned: number;
  reason: string;
  earnedAt: string;
}

interface TestBadge {
  playerId: number;
  badgeId: string;
  earnedAt: string;
}

interface TestMessage {
  playerId: number;
  type: string;
  title: string;
  body: string;
  read: boolean;
  sentAt: string;
}

interface TestRoutine {
  playerId: number;
  name: string;
  type: string;
  days: string[];
  time: string;
  items: { contentId: string; title: string; emoji: string; durationMinutes: number }[];
  createdAt: string;
}

// ── Default test data ────────────────────────────────────────

export const DEFAULT_PROFILE: TestProfile = {
  name: 'TestKid',
  avatarEmoji: '\u{1F98A}',
  totalStars: 10,
  streakDays: 3,
  lastStreakDate: new Date().toISOString().split('T')[0],
  createdAt: new Date().toISOString(),
  lastPlayedAt: new Date().toISOString(),
  age: 5,
  ageGroup: '4-5',
  interests: ['letters', 'animals'],
  onboardingCompleted: true,
};

export const SECOND_PROFILE: TestProfile = {
  name: 'Player2',
  avatarEmoji: '\u{1F43B}',
  totalStars: 5,
  streakDays: 1,
  lastStreakDate: new Date().toISOString().split('T')[0],
  createdAt: new Date().toISOString(),
  lastPlayedAt: new Date().toISOString(),
  age: 3,
  ageGroup: '2-3',
  interests: ['colors', 'music'],
  onboardingCompleted: true,
};

// ── Seed functions (run in the browser context via page.evaluate) ──

/**
 * Seed a player profile into IndexedDB (Dexie) and return the profile ID.
 */
export async function seedProfile(page: Page, profile: TestProfile = DEFAULT_PROFILE): Promise<number> {
  return page.evaluate(async (p) => {
    // Access the Dexie database from the app's global scope
    const dbRequest = indexedDB.open('KidsLearningDB');
    return new Promise<number>((resolve, reject) => {
      dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const tx = db.transaction('profiles', 'readwrite');
        const store = tx.objectStore('profiles');

        const record = {
          name: p.name,
          avatarEmoji: p.avatarEmoji,
          totalStars: p.totalStars,
          streakDays: p.streakDays,
          lastStreakDate: p.lastStreakDate,
          createdAt: new Date(p.createdAt),
          lastPlayedAt: new Date(p.lastPlayedAt),
          age: p.age,
          ageGroup: p.ageGroup,
          interests: p.interests,
          onboardingCompleted: p.onboardingCompleted,
        };

        const req = store.add(record);
        req.onsuccess = () => resolve(req.result as number);
        req.onerror = () => reject(req.error);
      };
      dbRequest.onerror = () => reject(dbRequest.error);
    });
  }, profile);
}

/**
 * Seed star records for a player.
 */
export async function seedStars(page: Page, stars: TestStarRecord[]): Promise<void> {
  await page.evaluate(async (records) => {
    const dbRequest = indexedDB.open('KidsLearningDB');
    return new Promise<void>((resolve, reject) => {
      dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const tx = db.transaction('stars', 'readwrite');
        const store = tx.objectStore('stars');

        for (const r of records) {
          store.add({
            playerId: r.playerId,
            category: r.category,
            starsEarned: r.starsEarned,
            reason: r.reason,
            earnedAt: new Date(r.earnedAt),
          });
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      dbRequest.onerror = () => reject(dbRequest.error);
    });
  }, stars);
}

/**
 * Seed badge records for a player.
 */
export async function seedBadges(page: Page, badges: TestBadge[]): Promise<void> {
  await page.evaluate(async (records) => {
    const dbRequest = indexedDB.open('KidsLearningDB');
    return new Promise<void>((resolve, reject) => {
      dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const tx = db.transaction('badges', 'readwrite');
        const store = tx.objectStore('badges');

        for (const r of records) {
          store.add({
            playerId: r.playerId,
            badgeId: r.badgeId,
            earnedAt: new Date(r.earnedAt),
          });
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      dbRequest.onerror = () => reject(dbRequest.error);
    });
  }, badges);
}

/**
 * Seed activity progress for a player.
 */
export async function seedProgress(
  page: Page,
  playerId: number,
  items: { category: string; itemKey: string; timesCompleted: number }[],
): Promise<void> {
  await page.evaluate(
    async ({ pid, entries }) => {
      const dbRequest = indexedDB.open('KidsLearningDB');
      return new Promise<void>((resolve, reject) => {
        dbRequest.onsuccess = () => {
          const db = dbRequest.result;
          const tx = db.transaction('progress', 'readwrite');
          const store = tx.objectStore('progress');

          for (const entry of entries) {
            store.add({
              playerId: pid,
              category: entry.category,
              itemKey: entry.itemKey,
              timesCompleted: entry.timesCompleted,
              correctAnswers: entry.timesCompleted,
              totalAttempts: entry.timesCompleted,
              lastPracticedAt: new Date(),
            });
          }

          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        };
        dbRequest.onerror = () => reject(dbRequest.error);
      });
    },
    { pid: playerId, entries: items },
  );
}

/**
 * Seed messages for the inbox.
 */
export async function seedMessages(page: Page, messages: TestMessage[]): Promise<void> {
  await page.evaluate(async (records) => {
    const dbRequest = indexedDB.open('KidsLearningDB');
    return new Promise<void>((resolve, reject) => {
      dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const tx = db.transaction('messages', 'readwrite');
        const store = tx.objectStore('messages');

        for (const r of records) {
          store.add({
            playerId: r.playerId,
            type: r.type,
            title: r.title,
            body: r.body,
            read: r.read,
            sentAt: new Date(r.sentAt),
          });
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      dbRequest.onerror = () => reject(dbRequest.error);
    });
  }, messages);
}

/**
 * Seed routines for a player.
 */
export async function seedRoutines(page: Page, routines: TestRoutine[]): Promise<void> {
  await page.evaluate(async (records) => {
    const dbRequest = indexedDB.open('KidsLearningDB');
    return new Promise<void>((resolve, reject) => {
      dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const tx = db.transaction('routines', 'readwrite');
        const store = tx.objectStore('routines');

        for (const r of records) {
          store.add({
            playerId: r.playerId,
            name: r.name,
            type: r.type,
            days: r.days,
            time: r.time,
            items: r.items,
            createdAt: new Date(r.createdAt),
          });
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      dbRequest.onerror = () => reject(dbRequest.error);
    });
  }, routines);
}

/**
 * Clear all IndexedDB data for a fresh test run.
 */
export async function clearDatabase(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
      }
    }
  });
}

/**
 * Create a full test environment: a profile with stars, badges, and progress.
 */
export async function seedFullTestEnvironment(page: Page): Promise<{ profileId: number }> {
  // First navigate to the app so the database is created
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const profileId = await seedProfile(page, DEFAULT_PROFILE);

  await seedStars(page, [
    { playerId: profileId, category: 'abc', starsEarned: 3, reason: 'Learned A', earnedAt: new Date().toISOString() },
    { playerId: profileId, category: 'abc', starsEarned: 3, reason: 'Learned B', earnedAt: new Date().toISOString() },
    { playerId: profileId, category: 'numbers', starsEarned: 2, reason: 'Counted to 5', earnedAt: new Date().toISOString() },
  ]);

  await seedProgress(page, profileId, [
    { category: 'abc', itemKey: 'A', timesCompleted: 1 },
    { category: 'abc', itemKey: 'B', timesCompleted: 1 },
    { category: 'numbers', itemKey: '1', timesCompleted: 1 },
  ]);

  // Reload so the app picks up the seeded data
  await page.reload();
  await page.waitForLoadState('networkidle');

  return { profileId };
}
