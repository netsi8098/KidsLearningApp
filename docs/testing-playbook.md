# Testing Playbook -- Kids Learning Fun

> Production-grade testing strategy for the Kids Learning Fun platform.
> Three apps, 40+ backend modules, 80+ frontend pages, zero excuses for shipping broken code.

**Last updated:** 2026-03-30
**Status:** Active -- roll out in phases

---

## Table of Contents

1. [Coverage Map](#1-coverage-map)
2. [Test Layers](#2-test-layers)
3. [Risky Areas and Missing Coverage](#3-risky-areas-and-missing-coverage)
4. [Prioritized Rollout Plan](#4-prioritized-rollout-plan)
5. [Test Folder Conventions](#5-test-folder-conventions)
6. [Naming Conventions](#6-naming-conventions)
7. [CI-Ready Commands](#7-ci-ready-commands)
8. [Performance Budgets](#8-performance-budgets)
9. [AI-Assisted Test Generation Workflow](#9-ai-assisted-test-generation-workflow)
10. [Release Certification Checklist](#10-release-certification-checklist)

---

## 1. Coverage Map

Every testable surface in the platform, grouped by domain.

### 1.1 Child-Facing PWA (43 pages, 48 hooks)

| Area | Pages / Components | Key Test Scenarios |
|------|--------------------|--------------------|
| **Learning Core** | AbcPage, NumbersPage, ColorsPage, ShapesPage, AnimalsPage, BodyPartsPage | Correct answer feedback, wrong answer retry, progress tracking, age-appropriate content filtering |
| **Lessons** | LessonsPage | Lesson listing, filtering by topic/age, lesson start flow, completion recording, lessonProgress Dexie writes |
| **Stories** | StoriesPage | Story listing, read-along playback, page turns, storyProgress tracking, bedtime-friendly filtering |
| **Videos** | VideosPage | YouTube nocookie embed loads, category filtering, queue playback, video completion tracking |
| **Audio** | AudioPage | Audio playback via Web Audio API, episode progress, playlist continuation, voice profile application during TTS, natural phrase splitting, premium voice selection and fallback chain |
| **Games** | GamesPage, MatchingPage, QuizPage | Game mechanics, scoring, difficulty progression, gameScores Dexie writes |
| **Creative** | ColoringPage, PrintablesPage, ScrapbookPage, CookingPage | Canvas interactions, save/export, scrapbook CRUD |
| **Wellbeing** | EmotionsPage, MovementPage, BedtimePage | Mood check-in flow, movement timer, bedtime mode activation/deactivation |
| **Exploration** | ExplorerPage, DiscoveryPage, CharacterMeetPage, HomeActivitiesPage | Content discovery, character selection, home activity suggestions |
| **Navigation** | MainMenu, WelcomePage, OnboardingPage, PreviewPage | 6-tab layout, first-run onboarding steps, preview rendering |
| **Collections** | CollectionsPage, CollectionDetailPage, WeeklyRecapPage | Collection listing, detail drill-down, weekly recap generation |
| **Rewards** | RewardsPage | Badge display, milestone celebration, daily goal tracking |
| **Routines** | RoutinePlannerPage, RoutinePlayerPage | Routine creation, step sequencing, timer playback, completion |
| **Parent Features** | ParentDashboard, SettingsPage, BillingPage, PrivacySettingsPage, ParentTipsPage, HelpCenterPage, InboxPage | Parent gate (math problem), settings persistence, billing flows, privacy controls, tip rendering, message inbox |
| **Queue** | QueuePage | Media queue management, offline pack selection |

**Hooks requiring dedicated unit tests (48 total):**

| Hook Category | Hooks | Priority |
|---------------|-------|----------|
| **State machines** | useSubscription, useEntitlement, useBedtimeMode, useBedtimeSession | Critical |
| **Data scoring** | useRecommendations, useEnhancedRecommendations | Critical |
| **Sync/offline** | useSync, useOfflinePacks, useMediaQueue | Critical |
| **Progress tracking** | useProgress, useCompletionTracking, useLessons, useMilestones, useDailyGoals, useDailyMissions, useWeeklyRecap | High |
| **Feature gating** | useFeatureFlag, useDeepLink, useNudges | High |
| **Content** | useAudio, useAudioPlayer, useVideos, useSearch, useExplorer, useFavorites, useRediscovery, useSeasonalContent | Medium (useAudio: High) |
| **Parent-facing** | useProfile, useRoutines, useParentTips, useHelpArticles, useInbox, usePrivacy, useScrapbook, useHomeActivities | Medium |
| **UX/motion** | useCelebration, useCharacter, useSwipe, useMoodCheckIn, useMovement, useCooking, useLifeSkills | Lower |
| **Infrastructure** | useAccessibility, usePerformanceTracker, useErrorReporter, useArtwork, useBadges | Lower |

**`useAudio` hook -- expanded test scenarios (voice profiles and natural speech):**

| Feature | Test Scenarios |
|---------|----------------|
| **`speak()` with voice profiles** | should apply voice profile (rate, pitch, volume) when profile name is passed; should use default profile when no profile specified; should handle all built-in profiles (childFriendly, slow, narrator, etc.) |
| **`speak()` backward compatibility** | should accept legacy numeric rate argument and apply it correctly; should not break when called with old `speak(text, rate)` signature |
| **Premium voice selection** | should prioritize Enhanced voices over Standard; should fall back to Standard when no Enhanced available; should prefer Google voices over generic; should use first available English voice as final fallback; should handle empty `speechSynthesis.getVoices()` gracefully |
| **`setPreferredVoice()`** | should persist selected voice name to localStorage; should clear the cached voice reference so next `speak()` re-resolves; should accept a `SpeechSynthesisVoice` name string |
| **`getAvailableVoices()`** | should return only English-language voices (`lang` starts with "en"); should return empty array when SpeechSynthesis is unavailable; should update when `voiceschanged` event fires |
| **`getActiveVoiceName()`** | should return the name of the currently active voice; should return the preferred voice name when one is set; should return the auto-selected premium voice name when no preference set |
| **Natural speech: `splitIntoPhrases()`** | should split at sentence boundaries (period, exclamation, question mark); should split at commas; should split at conjunctions ("and", "but", "or", "so"); should preserve short phrases without splitting; should handle empty string input |
| **Voice picker (Settings UI)** | should list available English voices; should play preview speech when a voice is tapped; should persist selection via `setPreferredVoice()` on confirm; should highlight the currently active voice |

### 1.2 Parent-Facing Features

| Feature | Test Scenarios |
|---------|----------------|
| **Parent Gate** | Math problem generation, correct/incorrect validation, gate bypass prevention |
| **Dashboard** | Child progress summary, weekly recap data, activity timeline |
| **Settings** | Profile CRUD, accessibility toggles (reducedMotion, largerText, highContrast), bedtime schedule, time limits, voice picker (preview, select, persist voice preference) |
| **Billing** | Plan display, subscription status, upgrade/downgrade flow, trial countdown |
| **Privacy** | Data collection toggles, export request, account deletion flow, COPPA compliance display |
| **Routines** | Routine creation/edit/delete, step management, schedule assignment |
| **Tips** | Tip listing, category filtering, read/unread state |
| **Inbox** | Message listing, read status, notification badges |
| **Help Center** | Article search, category browsing, contact form |

### 1.3 Admin Dashboard (31 page directories + 2 standalone pages)

| Section | Pages | Key Test Scenarios |
|---------|-------|--------------------|
| **Dashboard** | DashboardPage | Stats rendering, chart data loading, filter controls |
| **Login** | LoginPage | Auth flow, token storage, redirect logic |
| **Content** | content, content-lifecycle, collections, assets | CRUD operations, status transitions, bulk actions, content preview |
| **Workflow** | reviews, releases, policies | Review assignment/approval, release scheduling, policy evaluation display |
| **Billing** | subscriptions | Plan management, invoice listing, promo code CRUD |
| **Parents** | households, messages, support-tickets | Household detail, message sending, ticket status updates |
| **Analytics** | analytics, performance, errors | Chart rendering, date range filtering, error log display |
| **Operations** | exports, audit, maintenance, sla | Export triggering, audit log browsing, maintenance mode toggle |
| **System** | system, permissions, feature-flags, experiments | System health display, permission matrix editing, flag toggling |
| **Content Discovery** | recommendations, search, localization, deep-links | Recommendation preview/explain, search index status, locale management |
| **Journeys & Tips** | journeys, help-articles, merchandising | Journey builder, article editor, merchandising asset management |

### 1.4 Backend API (40 modules, ~178+ endpoints)

| Module Group | Modules | Endpoint Count (est.) | Key Test Scenarios |
|--------------|---------|----------------------|--------------------|
| **Auth & Identity** | auth, household, permissions | ~18 | Registration, login, JWT refresh, role enforcement, household CRUD |
| **Content Pipeline** | content, curriculum, review, release, governance, qa | ~32 | Content CRUD, status transitions (draft->review->approved->scheduled->published->archived), review workflow, release scheduling, policy evaluation, QA checks |
| **Content Generation** | brief, prompts, illustration, story-pipeline, voice, dedup | ~24 | Brief creation, prompt generation, illustration pipeline, story generation, voice synthesis, dedup detection |
| **Discovery** | recommendation, search, feature-flags, deep-links, experiments | ~22 | 5-factor recommendation scoring (age match, skill boost, bedtime bias, repeat penalty, freshness), search indexing, flag evaluation, deep link resolution, A/B experiment assignment |
| **Localization** | localization | ~8 | Locale management, translation CRUD, export/import |
| **Analytics** | analytics, performance, errors | ~14 | Event ingestion, aggregation, performance metrics, error tracking |
| **Sync** | sync | ~6 | Push changes, pull changes, conflict detection, conflict resolution, checkpoint management |
| **Subscriptions** | subscription | ~14 | Checkout flow, status transitions (active/trialing/past_due/cancelled/expired/paused), entitlement sync, webhook handling, promo codes |
| **Parent Engagement** | parent-tips, help-center, messages, caregiver, routines, journeys | ~24 | Tips CRUD, article search, message delivery, caregiver invites, routine templates, journey progression |
| **Privacy & Compliance** | privacy, audit, exports | ~10 | Data export, deletion request, audit log recording, COPPA compliance |
| **Infrastructure** | media, offline-packs, merchandising, maintenance, system | ~10 | Media upload/processing, offline pack generation, merchandising assets, maintenance mode, health checks |

### 1.5 Background Jobs (7 queues via BullMQ)

| Queue | Name | Key Test Scenarios |
|-------|------|--------------------|
| **Media** | `media-processing` | Image resize/optimize, format conversion, thumbnail generation, failure retry |
| **AI** | `ai-generation` | Prompt dispatch, response parsing, content creation from AI output, timeout handling |
| **Release** | `content-release` | Scheduled publish execution, batch release, rollback on failure |
| **Localization** | `localization` | Translation job dispatch, completion callback, missing translation detection |
| **Offline Packs** | `offline-packs` | Pack assembly, size validation, delta updates, download tracking |
| **Analytics** | `analytics-aggregate` | Event batching, period rollup (daily/weekly/monthly), stale data cleanup |
| **QA** | `content-qa` | Automated policy checks, broken link detection, age-appropriateness validation |

### 1.6 Sync Flows

| Flow | Test Scenarios |
|------|----------------|
| **Push** | Single change accepted, multiple changes batched, conflict detected (server newer), checkpoint updated |
| **Pull** | Pull from zero, pull incremental (since version), pagination (hasMore=true), empty pull |
| **Conflict Resolution** | Client-wins resolution, server-wins resolution, conflict list returned to client |
| **Offline Queue** | Queue builds while offline, queue drains on reconnect, failed items retry, queue persistence across app restart |

### 1.7 Offline Flows

| Flow | Test Scenarios |
|------|----------------|
| **PWA Caching** | Service worker registration, precache manifest (~97 entries, ~1290KB), runtime cache strategies, cache invalidation on deploy |
| **Dexie Persistence** | Database schema v6 with 30 tables, migration from earlier versions, read/write across all tables, live query reactivity |
| **Offline Pack Loading** | Pack download, pack extraction, content available offline, stale pack detection, storage quota management |

### 1.8 Entitlement Logic

| Tier | Features | Test Scenarios |
|------|----------|----------------|
| **Free** | `basic_content` | Free content accessible, premium content gated, upgrade prompt shown |
| **Trial** | `basic_content`, `premium_content`, `offline_packs` | Trial features accessible, trial expiry enforcement, trial-to-premium conversion |
| **Premium Monthly/Annual** | `basic_content`, `premium_content`, `offline_packs`, `ad_free` | All premium features accessible, expiry handling, grace period |
| **Family Monthly/Annual** | All premium + `family_profiles` | Multiple profile support, family plan limits |
| **Frontend (useEntitlement)** | `offline_packs`, `all_content`, `multiple_profiles`, `no_ads`, `advanced_reports`, `custom_routines`, `export_data`, `priority_support` | Hook returns correct boolean for each tier, trial subset enforcement |
| **Backend (checkEntitlement)** | DB-driven per household | Granted check, expired check, missing entitlement check, middleware rejection |

### 1.9 Recommendation Logic

**Backend 5-Factor Scoring (recommendation service):**

| Factor | Weight (default) | Scoring Logic | Test Scenarios |
|--------|-------------------|---------------|----------------|
| **Age Match** | 0.40 | Exact match=1.0, "all"=1.0/0.8, adjacent=0.5, 2-away=0.2, far=0.0 | All age group combinations, "all" content, "all" profile |
| **Skill Boost** | 0.30 | Average relevance + diversity bonus (up to 0.2 for 5+ skills) | No skills=0.5, single high-relevance, many low-relevance, diversity cap |
| **Bedtime Bias** | 0.25 | Bedtime mode ON: friendly=1.0, not friendly=-0.5. OFF: 0 | Bedtime mode on/off, bedtime-friendly content, active content during bedtime |
| **Repeat Penalty** | 0.20 | 0 views=0, 1=-0.3, 2=-0.6, 3+=-1.0 | First view, repeated views, heavy rotation |
| **Freshness** | 0.15 | <7d=1.0, <30d=0.8, <90d=0.5, older=0.3. Stored score preferred. | New content, month-old, quarter-old, unpublished |

**Frontend 5-Factor Scoring (useEnhancedRecommendations):**

| Factor | Weight | Test Scenarios |
|--------|--------|----------------|
| **Tag Affinity** | x3 | No history=0, heavy single-tag usage, diverse tag usage |
| **Age Match** | x5 | Exact match=1, no match=0, unset age group |
| **Novelty** | x2 | Unseen=1, completed=0 |
| **Skill Gap** | x4 | All skills covered=0, large gap=1, partial coverage |
| **Time Mode Match** | x3 | Preferred tags present, excluded tags present (=-0.5), neutral |

---

## 2. Test Layers

### 2.1 Unit Tests (Vitest)

| Property | Value |
|----------|-------|
| **Purpose** | Verify pure logic, hooks, services, and utilities in isolation |
| **Tools** | Vitest 4.x, @testing-library/react 16.x, fake-indexeddb 6.x, happy-dom/jsdom |
| **Scope** | Individual functions, React hooks (via renderHook), state machines, scoring algorithms, validators |
| **Mocking** | Dexie via fake-indexeddb, SpeechSynthesis/AudioContext/matchMedia/IntersectionObserver via vitest.setup.ts, Prisma via vi.mock |
| **Speed target** | <100ms per test, full suite <60s |
| **Expected count** | ~400-500 tests across all three apps |

**Breakdown by app:**

| App | Target Areas | Est. Tests |
|-----|-------------|------------|
| Frontend PWA | 48 hooks, registry helpers, scoring algorithms, data transformers | ~180 |
| Backend | 40 module services, 11 lib files, validators (Zod schemas) | ~250 |
| Admin | Form validators, data transformers, filter logic | ~50 |

### 2.2 Integration Tests (Vitest + Supertest)

| Property | Value |
|----------|-------|
| **Purpose** | Verify API routes end-to-end including middleware, validation, DB queries, and response format |
| **Tools** | Vitest 4.x, Supertest 7.x, Prisma (test database) |
| **Scope** | HTTP request -> middleware chain -> route handler -> service -> DB -> response |
| **Database** | Isolated test PostgreSQL database, reset between test files via Prisma migrate reset |
| **Speed target** | <500ms per test, full suite <5min |
| **Expected count** | ~200 tests covering all 178+ endpoints |

**Key middleware chains to test:**

| Middleware | What It Does | Test Focus |
|-----------|-------------|------------|
| `auth.ts` | JWT verification, user extraction | Valid token, expired token, missing token, malformed token |
| `errorHandler.ts` | Error formatting, status codes | NotFoundError->404, ValidationError->400, ConflictError->409, ForbiddenError->403, unknown->500 |
| `softDelete` (Prisma middleware) | Auto-filters deleted records, converts delete->update | findMany excludes deleted, delete sets deletedAt, deleteMany sets deletedAt, explicit deletedAt query bypasses |
| `requireEntitlement` | Checks household entitlement | Granted passes, expired blocks, missing blocks, no householdId returns 403 |

### 2.3 Contract Tests (Vitest)

| Property | Value |
|----------|-------|
| **Purpose** | Validate API response shapes match expected schemas so frontend/admin never get unexpected data |
| **Tools** | Vitest 4.x, Zod schemas (already defined per module) |
| **Scope** | Response body structure, required fields present, error response format, pagination envelope |
| **Speed target** | <50ms per test |
| **Expected count** | ~100 tests (one per distinct response shape) |

**Standard response envelopes to validate:**

```typescript
// Paginated list
{
  data: T[],
  pagination: { page: number, limit: number, total: number, totalPages: number }
}

// Single resource
{ id: string, ...fields, createdAt: string, updatedAt: string }

// Error response
{ error: { code: string, message: string, details?: unknown } }

// Delete response
{ deleted: true, id: string }
```

### 2.4 E2E Tests (Playwright)

| Property | Value |
|----------|-------|
| **Purpose** | Verify complete user flows across the real UI, simulating actual user behavior |
| **Tools** | Playwright 1.58.x (`@playwright/test` added as dev dependency), 5 browser projects (child-mobile, child-tablet, parent-mobile, parent-desktop, admin-desktop) |
| **Scope** | Multi-page flows, navigation, data persistence, cross-page state |
| **Speed target** | <30s per test, full suite <15min |
| **Expected count** | ~80 tests across child/parent/admin flows |

**Browser projects:**

| Project | Device | Base URL | Test Dir |
|---------|--------|----------|----------|
| `child-mobile` | iPhone 14 | http://localhost:5173 | `e2e/tests/child/` |
| `child-tablet` | iPad (gen 7) | http://localhost:5173 | `e2e/tests/child/` |
| `parent-mobile` | iPhone 14 | http://localhost:5173 | `e2e/tests/parent/` |
| `parent-desktop` | Desktop Chrome | http://localhost:5173 | `e2e/tests/parent/` |
| `admin-desktop` | Desktop Chrome | http://localhost:5174 | `e2e/tests/admin/` |

**Page object updates (2026-03-30):**

- `WelcomePage` page object selectors updated to match current UI (button text and structure changes)
- `MainMenu` page object updated to support quest board navigation
- `@playwright/test` added as an explicit dev dependency in `package.json`

**Critical E2E flows:**

| Flow | Steps |
|------|-------|
| **Child: First lesson** | Welcome -> Onboarding -> MainMenu -> Lessons -> Pick lesson -> Complete -> Reward |
| **Child: Story time** | MainMenu -> Stories -> Pick story -> Read through -> Completion tracked |
| **Child: Bedtime mode** | Parent enables bedtime -> Menu filters to bedtime content -> Bedtime stories only -> Exit bedtime |
| **Parent: Onboarding** | Welcome -> Create profile -> Set age group -> Set preferences -> Dashboard |
| **Parent: Settings** | Dashboard -> Parent gate -> Settings -> Toggle accessibility -> Verify applied; Settings -> Voice picker -> Preview voice -> Select -> Verify persisted |
| **Parent: Billing** | Dashboard -> Parent gate -> Billing -> View plan -> Subscription info displayed |
| **Admin: Content lifecycle** | Login -> Content list -> Create draft -> Submit for review -> Approve -> Schedule -> Publish |
| **Admin: Recommendation tuning** | Login -> Recommendations -> Select profile -> Preview scores -> Adjust weights -> Verify re-ranked |

### 2.5 Visual Regression Tests (Playwright Screenshots)

| Property | Value |
|----------|-------|
| **Purpose** | Catch unintended visual changes across key screens and viewports |
| **Tools** | Playwright built-in screenshot comparison (`toHaveScreenshot()`) |
| **Scope** | Key screens at mobile (375px), tablet (768px), and desktop (1280px) |
| **Threshold** | 0.2% pixel difference tolerance |
| **Expected count** | ~40 screenshot comparisons |

**Screens to capture:**

| Screen | Viewports | Notes |
|--------|-----------|-------|
| MainMenu (6-tab layout) | mobile, tablet | Most-seen screen |
| LessonsPage | mobile, tablet | Card grid layout |
| StoriesPage | mobile, tablet | Card grid layout |
| RewardsPage | mobile, tablet | Badge display grid |
| BedtimePage (bedtime mode) | mobile | Dark theme variant |
| ParentDashboard | mobile, desktop | Data-heavy layout |
| SettingsPage | mobile, desktop | Form layout |
| Admin DashboardPage | desktop | Charts and stats |
| Admin Content list | desktop | Table layout |
| Admin Content editor | desktop | Form layout |

### 2.6 Accessibility Tests (axe-core + Playwright)

| Property | Value |
|----------|-------|
| **Purpose** | Ensure WCAG 2.1 AA compliance across all user-facing pages |
| **Tools** | @axe-core/playwright 4.x (already installed), Playwright |
| **Scope** | Every page in child-facing and parent-facing app, critical admin pages |
| **Rules** | WCAG 2.1 AA (color contrast, keyboard navigation, ARIA labels, focus management, heading hierarchy) |
| **Expected count** | ~50 page scans |

**Critical a11y areas for a kids app:**

| Area | Why It Matters |
|------|---------------|
| **Color contrast** | Young children + parents with varying vision |
| **Touch targets** | Minimum 44x44px for child fingers |
| **Focus indicators** | Keyboard/switch access for children with motor disabilities |
| **Alt text** | Screen reader support for visually impaired children |
| **Reduced motion** | `useAccessibility` hook must disable Framer Motion animations |
| **Larger text** | `useAccessibility` largerText mode must scale all text |
| **High contrast** | `useAccessibility` highContrast mode must increase contrast ratios |

---

## 3. Risky Areas and Missing Coverage

These are the highest-risk areas with **zero test coverage today**. Bugs here cause the worst outcomes.

### 3.1 Risk Matrix

| Risk Area | Severity | Likelihood | Impact Description | Files |
|-----------|----------|------------|-------------------|-------|
| **Content Status Transitions** | CRITICAL | High | Invalid transition corrupts content pipeline; published content can't be unpublished or gets stuck | `backend/src/modules/content/service.ts` (VALID_TRANSITIONS map, `validateStatusTransition`) |
| **Subscription State Machine** | CRITICAL | High | Invalid transition loses revenue or gives free access; `active->paused->cancelled` edge cases | `backend/src/modules/subscription/service.ts` (VALID_TRANSITIONS map, `validateStatusTransition`) |
| **Entitlement Gate Logic** | CRITICAL | Medium | Free users access premium content or premium users get blocked | `backend/src/lib/entitlement.ts`, `src/hooks/useEntitlement.ts` |
| **Recommendation Scoring** | HIGH | Medium | Wrong content served to wrong age group; bedtime content showing active games | `backend/src/modules/recommendation/service.ts` (scoreAgeMatch, scoreFreshness, scoreBedtime, scoreRepeatPenalty, scoreSkillMatch), `src/hooks/useEnhancedRecommendations.ts` |
| **Sync Conflict Resolution** | HIGH | Medium | Data loss when parent uses two devices; child progress disappears | `backend/src/lib/syncEngine.ts` (pushChanges, pullChanges, resolveConflict) |
| **Permission/Role Enforcement** | HIGH | Medium | Unauthorized admin access; parent accessing admin endpoints | `backend/src/modules/permissions/service.ts` (checkPermission), `backend/src/middleware/auth.ts` |
| **Soft-Delete Middleware** | HIGH | Low | Deleted content appears to children; or legitimate content disappears | `backend/src/lib/softDelete.ts` (18 models affected) |
| **Policy Engine** | MEDIUM | Medium | Off-brand content reaches children; age-inappropriate content not blocked | `backend/src/lib/policyEngine.ts` (4 policy categories) |
| **Job Queue Reliability** | MEDIUM | Medium | Media not processed; scheduled releases don't publish; analytics gaps | `backend/src/lib/queue.ts` (7 queues) |
| **Analytics Event Validation** | MEDIUM | Low | Garbage data in analytics; wrong metrics shown to parents/admins | `backend/src/modules/analytics/service.ts` |
| **Release Workflow** | MEDIUM | Low | Content published before QA; scheduled releases fire at wrong time | `backend/src/modules/release/service.ts` |
| **Feature Flag Evaluation** | MEDIUM | Low | Wrong features enabled/disabled; A/B experiments corrupted | `backend/src/modules/feature-flags/service.ts` |

### 3.2 Specific Untested Edge Cases

**Content Status Transitions (6 states, 14 valid transitions, 22 invalid transitions):**
```
draft -> [review, archived]                    (2 valid, 4 invalid)
review -> [draft, approved, archived]          (3 valid, 3 invalid)
approved -> [scheduled, published, draft, archived] (4 valid, 2 invalid)
scheduled -> [approved, published, archived]   (3 valid, 3 invalid)
published -> [archived, draft]                 (2 valid, 4 invalid)
archived -> [draft]                            (1 valid, 5 invalid)
```
Every single transition path needs a test. No test exists today.

**Subscription State Machine (6 states, 11 valid transitions, 25 invalid transitions):**
```
active -> [past_due, cancelled, paused]        (3 valid, 3 invalid)
trialing -> [active, cancelled, expired]       (3 valid, 3 invalid)
past_due -> [active, cancelled, expired]       (3 valid, 3 invalid)
cancelled -> [active]                          (1 valid, 5 invalid)
expired -> [active]                            (1 valid, 5 invalid)
paused -> [active, cancelled]                  (2 valid, 4 invalid)
```

**Entitlement -- untested combinations:**
- Expired entitlement (expiresAt in the past) should return false
- Missing entitlement row should return false
- Granted=false should return false
- Frontend: trial user requesting `export_data` (not in trialFeatures set)
- Frontend: free user requesting `all_content`

**Recommendation Scoring -- untested boundaries:**
- Content with `ageGroup='all'` vs every profile age group
- Profile with `ageGroup='all'` vs every content age group
- Content viewed exactly 3 times (boundary for max penalty)
- Content published exactly 7, 30, 90 days ago (boundary for freshness tiers)
- Bedtime mode ON with non-bedtime content (should get -0.5 penalty)
- Content with zero skills tagged (should get 0.5 neutral score)

---

## 4. Prioritized Rollout Plan

### Phase 1 -- Critical (Weeks 1-2)

**Goal:** Cover the state machines and gate logic that, if broken, cause the worst user impact.

| Task | Files to Test | Test Type | Est. Tests |
|------|--------------|-----------|------------|
| Content status transitions | `backend/src/modules/content/service.ts` | Unit | 36 (14 valid + 22 invalid) |
| Subscription state machine | `backend/src/modules/subscription/service.ts` | Unit | 36 (11 valid + 25 invalid) |
| Entitlement gate (backend) | `backend/src/lib/entitlement.ts` | Unit | 8 |
| Entitlement gate (frontend) | `src/hooks/useEntitlement.ts` | Unit | 12 |
| Sync engine | `backend/src/lib/syncEngine.ts` | Unit | 15 |
| Soft-delete middleware | `backend/src/lib/softDelete.ts` | Unit | 12 |
| Policy engine | `backend/src/lib/policyEngine.ts` | Unit | 10 |
| Permission checker | `backend/src/modules/permissions/service.ts` | Unit | 8 |
| Recommendation scoring (backend) | `backend/src/modules/recommendation/service.ts` | Unit | 25 |
| Error classes and handler | `backend/src/lib/errors.ts`, `backend/src/middleware/errorHandler.ts` | Unit | 10 |

**Phase 1 total: ~172 unit tests**

### Phase 2 -- High Priority (Weeks 3-4)

**Goal:** API integration coverage and frontend hook tests.

| Task | Test Type | Est. Tests |
|------|-----------|------------|
| Auth endpoints (register, login, refresh, logout) | Integration | 15 |
| Content CRUD endpoints | Integration | 20 |
| Subscription endpoints (checkout, cancel, pause, resume, webhook) | Integration | 18 |
| Recommendation endpoints (preview, explain, simulate, diagnostics) | Integration | 12 |
| Sync endpoints (push, pull, resolve) | Integration | 10 |
| Household + profile CRUD endpoints | Integration | 12 |
| Frontend: useRecommendations | Unit (hook) | 10 |
| Frontend: useEnhancedRecommendations | Unit (hook) | 12 |
| Frontend: useSync | Unit (hook) | 8 |
| Frontend: useSubscription | Unit (hook) | 8 |
| Frontend: useBedtimeMode + useBedtimeSession | Unit (hook) | 10 |
| Frontend: useProgress + useCompletionTracking | Unit (hook) | 10 |
| Frontend: useAudio (voice profiles, natural speech, premium voice selection) | Unit (hook) | 14 |
| Frontend: useFeatureFlag | Unit (hook) | 6 |
| API contract tests (response shapes) | Contract | 40 |

**Phase 2 total: ~205 tests**

### Phase 3 -- Medium Priority (Weeks 5-7)

**Goal:** E2E coverage of critical user flows, remaining API endpoints.

| Task | Test Type | Est. Tests |
|------|-----------|------------|
| Child: first lesson flow | E2E | 4 (mobile + tablet) |
| Child: story reading flow | E2E | 4 |
| Child: bedtime mode flow | E2E | 4 |
| Child: game completion flow | E2E | 4 |
| Child: video playback flow | E2E | 2 |
| Child: reward/badge flow | E2E | 2 |
| Parent: onboarding flow | E2E | 4 (mobile + desktop) |
| Parent: settings + accessibility flow | E2E | 4 |
| Parent: billing flow | E2E | 4 |
| Parent: privacy settings flow | E2E | 4 |
| Admin: login flow | E2E | 2 |
| Admin: content lifecycle flow | E2E | 4 |
| Admin: recommendation tuning flow | E2E | 2 |
| Admin: subscription management flow | E2E | 2 |
| Remaining backend module services (28 modules) | Unit | 80 |
| Remaining API endpoints (~100 endpoints) | Integration | 60 |

**Phase 3 total: ~186 tests**

### Phase 4 -- Lower Priority (Weeks 8-10)

**Goal:** Visual regression, accessibility, and performance budgets.

| Task | Test Type | Est. Tests |
|------|-----------|------------|
| Visual regression -- child pages | Visual | 16 |
| Visual regression -- parent pages | Visual | 10 |
| Visual regression -- admin pages | Visual | 8 |
| Visual regression -- bedtime/dark mode | Visual | 6 |
| Accessibility -- child pages (43) | A11y | 43 |
| Accessibility -- parent pages | A11y | 9 |
| Accessibility -- admin critical pages | A11y | 10 |
| Performance budgets (bundle size, startup, transitions) | Performance | 8 |

**Phase 4 total: ~110 tests**

### Phase 5 -- Ongoing

**Goal:** AI-assisted test generation for new features, continuous coverage improvement.

| Task | Cadence |
|------|---------|
| Generate tests for every new module/hook | Per PR |
| Quarterly coverage audit | Every 3 months |
| Update visual regression baselines | After intentional design changes |
| Accessibility re-scan after UI changes | Per release |
| Performance budget enforcement in CI | Every build |

---

## 5. Test Folder Conventions

```
/tests/                              # Frontend PWA tests
  setup/
    vitest.setup.ts                  # Browser API mocks (Speech, Audio, IndexedDB, etc.)
  helpers/
    renderWithProviders.helper.ts    # Wraps component in AppContext + Router + QueryClient
    dexie.helper.ts                  # Seed/reset fake-indexeddb
    mockProfile.helper.ts            # Create mock player profiles
  fixtures/
    profiles.fixture.ts              # Player profiles (age groups, preferences)
    content.fixture.ts               # Content items (lessons, stories, videos)
    progress.fixture.ts              # Progress records at various stages
    subscriptions.fixture.ts         # Subscription states (free, trial, premium)
  unit/
    hooks/
      useEntitlement.test.ts
      useRecommendations.test.ts
      useEnhancedRecommendations.test.ts
      useSync.test.ts
      useBedtimeMode.test.ts
      useSubscription.test.ts
      useProgress.test.ts
      useAudio.test.ts
      useFeatureFlag.test.ts
      ...                            # One file per hook
    components/
      MainMenu.test.tsx
      ContentCover.test.tsx
      ...                            # One file per shared component
  e2e/                               # Frontend-specific E2E (not Playwright)
  visual/
    child-pages.visual.test.ts
    parent-pages.visual.test.ts
    bedtime-mode.visual.test.ts
  a11y/
    child-pages.a11y.test.ts
    parent-pages.a11y.test.ts

/backend/tests/                      # Backend tests
  setup/
    vitest.setup.ts                  # Env vars, mock reset
    prisma.setup.ts                  # Test DB connection, reset between suites
  helpers/
    request.helper.ts                # Supertest app instance factory
    auth.helper.ts                   # Generate test JWT tokens for roles
    seed.helper.ts                   # Seed test data into Prisma
  fixtures/
    content.fixture.ts               # Content records in various states
    households.fixture.ts            # Household + subscription combinations
    profiles.fixture.ts              # Child profiles with age groups
    permissions.fixture.ts           # Role-permission matrices
    recommendations.fixture.ts       # Scoring test cases with expected results
  unit/
    lib/
      entitlement.test.ts
      syncEngine.test.ts
      softDelete.test.ts
      policyEngine.test.ts
      queue.test.ts
      errors.test.ts
      audit.test.ts
      validate.test.ts
      featureFlags.test.ts
    modules/
      content.service.test.ts
      subscription.service.test.ts
      recommendation.service.test.ts
      permissions.service.test.ts
      auth.service.test.ts
      release.service.test.ts
      analytics.service.test.ts
      sync.service.test.ts
      ...                            # One file per module service
  integration/
    auth.integration.test.ts
    content.integration.test.ts
    subscription.integration.test.ts
    recommendation.integration.test.ts
    sync.integration.test.ts
    household.integration.test.ts
    ...                              # One file per route group
  contract/
    content.contract.test.ts
    subscription.contract.test.ts
    recommendation.contract.test.ts
    ...                              # One file per response shape group

/admin/tests/                        # Admin dashboard tests
  setup/
    vitest.setup.ts                  # Browser mocks, auth context mock
  helpers/
    renderWithAdmin.helper.ts        # Admin provider wrapper
    mockApi.helper.ts                # API response mocks
  unit/
    forms/
      ContentForm.test.tsx
      SubscriptionForm.test.tsx
      PermissionForm.test.tsx
    pages/
      DashboardPage.test.tsx
      ContentListPage.test.tsx
    hooks/
      useAdminAuth.test.ts

/e2e/                                # Playwright E2E tests (cross-app)
  fixtures/
    auth.fixture.ts                  # Login state for child/parent/admin
    testData.fixture.ts              # Seeded content/profiles for E2E
  helpers/
    childPage.helper.ts              # Page object for child-facing app
    parentPage.helper.ts             # Page object for parent-facing app
    adminPage.helper.ts              # Page object for admin dashboard
  tests/
    child/
      lesson-flow.spec.ts
      story-flow.spec.ts
      bedtime-flow.spec.ts
      game-flow.spec.ts
      video-flow.spec.ts
      rewards-flow.spec.ts
    parent/
      onboarding-flow.spec.ts
      settings-flow.spec.ts
      billing-flow.spec.ts
      privacy-flow.spec.ts
    admin/
      login-flow.spec.ts
      content-lifecycle.spec.ts
      recommendation-tuning.spec.ts
      subscription-management.spec.ts
  playwright.config.ts               # 5 projects: child-mobile, child-tablet, parent-mobile, parent-desktop, admin-desktop
```

---

## 6. Naming Conventions

### 6.1 File Names

| Type | Pattern | Example |
|------|---------|---------|
| Unit test | `{module}.test.ts` or `{Component}.test.tsx` | `entitlement.test.ts`, `MainMenu.test.tsx` |
| Hook test | `{hookName}.test.ts` | `useEntitlement.test.ts` |
| Integration test | `{module}.integration.test.ts` | `content.integration.test.ts` |
| Contract test | `{module}.contract.test.ts` | `subscription.contract.test.ts` |
| E2E test | `{flow-name}.spec.ts` | `lesson-flow.spec.ts` |
| Visual test | `{area}.visual.test.ts` | `child-pages.visual.test.ts` |
| A11y test | `{area}.a11y.test.ts` | `child-pages.a11y.test.ts` |
| Fixture | `{domain}.fixture.ts` | `profiles.fixture.ts` |
| Helper | `{purpose}.helper.ts` | `auth.helper.ts` |

### 6.2 Describe Blocks

Match the module, class, or function name exactly:

```typescript
// For a service function
describe('validateStatusTransition', () => {
  describe('from draft', () => {
    it('should allow transition to review', () => { ... });
    it('should reject transition to published', () => { ... });
  });
});

// For a hook
describe('useEntitlement', () => {
  describe('hasEntitlement', () => {
    it('should return true for free features regardless of tier', () => { ... });
  });
});

// For an API endpoint
describe('POST /api/content', () => {
  it('should create content and return 201', () => { ... });
  it('should return 400 when title is missing', () => { ... });
});
```

### 6.3 Test Names

Format: `should [expected behavior] when [condition]`

```typescript
// Good
it('should return false when entitlement has expired')
it('should reject transition from draft to published')
it('should apply -0.5 bedtime penalty when content is not bedtime-friendly')
it('should return 403 when household ID is missing')
it('should detect conflict when server timestamp is newer than client')

// Bad
it('test entitlement')
it('works correctly')
it('handles error')
```

### 6.4 Fixture Data

Use factory functions, not raw objects:

```typescript
// profiles.fixture.ts
export function createTestProfile(overrides?: Partial<Profile>): Profile {
  return {
    id: 1,
    name: 'Test Child',
    ageGroup: '2-3',
    avatar: 'bear',
    bedtimeMode: false,
    ...overrides,
  };
}

// content.fixture.ts
export function createTestContent(overrides?: Partial<Content>): Content {
  return {
    id: 'content-1',
    title: 'Test Lesson',
    type: 'lesson',
    status: 'published',
    ageGroup: 'age_2_3',
    bedtimeFriendly: false,
    publishedAt: new Date('2026-01-01'),
    freshnessScore: null,
    ...overrides,
  };
}
```

---

## 7. CI-Ready Commands

### 7.1 npm Scripts (root package.json)

| Command | What It Runs | When to Use |
|---------|-------------|-------------|
| `npm test` | `vitest run` -- frontend PWA unit tests | Local development, pre-commit |
| `npm run test:watch` | `vitest` -- frontend tests in watch mode | Active development |
| `npm run test:coverage` | `vitest run --coverage` -- with v8 coverage report | Coverage audit |
| `npm run test:ui` | `vitest --ui` -- browser-based test UI | Visual test debugging |
| `npm run test:backend` | `cd backend && npx vitest run` -- all backend tests | Backend development |
| `npm run test:admin` | `cd admin && npx vitest run` -- all admin tests | Admin development |
| `npm run test:all` | Frontend + backend + admin unit tests sequentially | Pre-push verification |
| `npm run test:e2e` | `npx playwright test --config=e2e/playwright.config.ts` -- all 5 projects | Pre-release |
| `npm run test:e2e:child` | Playwright child-mobile + child-tablet projects | Child feature verification |
| `npm run test:e2e:parent` | Playwright parent-mobile + parent-desktop projects | Parent feature verification |
| `npm run test:e2e:admin` | Playwright admin-desktop project | Admin feature verification |
| `npm run test:ci` | Frontend tests with JUnit reporter + backend + admin | CI pipeline |
| `npm run test:certify` | `test:all` then `test:e2e` -- full certification | Release gate |

### 7.2 Backend-Specific Scripts (backend/package.json)

| Command | What It Runs |
|---------|-------------|
| `npm test` | `vitest run` -- all backend tests |
| `npm run test:watch` | `vitest` -- watch mode |
| `npm run test:coverage` | `vitest run --coverage` |
| `npm run test:unit` | `vitest run tests/unit` -- unit tests only |
| `npm run test:integration` | `vitest run tests/integration` -- integration tests only |
| `npm run test:contract` | `vitest run tests/contract` -- contract tests only |

### 7.3 CI Pipeline Stages

```yaml
# Recommended CI pipeline order

stages:
  # Stage 1: Lint + Type Check (fastest feedback)
  - lint:
      - npm run lint                    # Frontend ESLint
      - cd backend && npm run lint      # Backend ESLint
      - cd admin && npm run typecheck   # Admin type check
      - tsc -b                          # Frontend type check
      - cd backend && npm run typecheck # Backend type check

  # Stage 2: Unit Tests (parallel per app)
  - test-frontend:
      - npm test -- --reporter=junit --outputFile=coverage/frontend-results.xml
  - test-backend:
      - cd backend && npm run test:unit
  - test-admin:
      - cd admin && npm test

  # Stage 3: Integration + Contract Tests
  - test-integration:
      - cd backend && npm run test:integration
  - test-contract:
      - cd backend && npm run test:contract

  # Stage 4: E2E Tests (needs running apps)
  - test-e2e:
      - npm run test:e2e

  # Stage 5: Coverage + Quality Gates
  - coverage:
      - npm run test:coverage
      - cd backend && npm run test:coverage
      - enforce minimum thresholds
```

### 7.4 Coverage Thresholds

| App | Statements | Branches | Functions | Lines |
|-----|-----------|----------|-----------|-------|
| Frontend PWA (current) | 40% | 30% | 35% | 40% |
| Frontend PWA (Phase 2 target) | 60% | 50% | 55% | 60% |
| Frontend PWA (Phase 4 target) | 75% | 65% | 70% | 75% |
| Backend (Phase 1 target) | 50% | 40% | 45% | 50% |
| Backend (Phase 3 target) | 70% | 60% | 65% | 70% |
| Admin (Phase 3 target) | 50% | 40% | 45% | 50% |

---

## 8. Performance Budgets

### 8.1 App Startup

| Metric | Budget | How to Measure |
|--------|--------|---------------|
| **First Contentful Paint (FCP)** | <1.5s | Lighthouse CI / Playwright `page.evaluate(() => performance.getEntriesByType('paint'))` |
| **Largest Contentful Paint (LCP)** | <2.5s | Lighthouse CI |
| **Time to Interactive (TTI)** | <3.0s | Lighthouse CI |
| **Cumulative Layout Shift (CLS)** | <0.1 | Lighthouse CI |

### 8.2 Route Transitions

| Metric | Budget | How to Measure |
|--------|--------|---------------|
| **Page-to-page navigation** | <500ms | Playwright: timestamp before click, timestamp after `networkidle` |
| **Tab switch (MainMenu)** | <200ms | Playwright: timestamp before tap, timestamp after content visible |
| **Parent gate response** | <100ms | Playwright: measure from input to validation feedback |
| **Content load (lessons, stories)** | <1s | Playwright: from route change to first content card visible |

### 8.3 Bundle Size

| Chunk | Budget | Current | How to Enforce |
|-------|--------|---------|---------------|
| **Main bundle (gzip)** | <180KB | ~156KB | `vite build` output parsing in CI |
| **Total precache** | <1500KB | ~1290KB | PWA manifest size check |
| **Largest lazy chunk** | <50KB (gzip) | -- | `vite build` output parsing |
| **CSS total** | <30KB (gzip) | -- | `vite build` output parsing |

### 8.4 Performance Test Implementation

```typescript
// e2e/tests/performance/budgets.spec.ts
import { test, expect } from '@playwright/test';

test('app startup meets performance budget', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  const fcp = await page.evaluate(() => {
    const entries = performance.getEntriesByType('paint');
    const fcpEntry = entries.find(e => e.name === 'first-contentful-paint');
    return fcpEntry?.startTime ?? Infinity;
  });

  expect(fcp).toBeLessThan(1500); // 1.5s budget
});

test('route transition meets performance budget', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const start = Date.now();
  await page.click('[data-testid="nav-lessons"]');
  await page.waitForSelector('[data-testid="lesson-card"]');
  const duration = Date.now() - start;

  expect(duration).toBeLessThan(500); // 500ms budget
});
```

### 8.5 Bundle Size Check Script

```typescript
// scripts/check-bundle-size.ts
import { readFileSync } from 'fs';
import { gzipSync } from 'zlib';
import { globSync } from 'glob';

const BUDGETS = {
  mainGzip: 180 * 1024,      // 180KB
  totalPrecache: 1500 * 1024, // 1500KB
  maxChunkGzip: 50 * 1024,    // 50KB
};

const jsFiles = globSync('dist/assets/*.js');
let totalSize = 0;

for (const file of jsFiles) {
  const content = readFileSync(file);
  const gzipped = gzipSync(content);
  totalSize += content.length;

  if (gzipped.length > BUDGETS.maxChunkGzip) {
    console.error(`OVER BUDGET: ${file} is ${(gzipped.length / 1024).toFixed(1)}KB gzip (budget: 50KB)`);
    process.exit(1);
  }
}

console.log(`Total JS: ${(totalSize / 1024).toFixed(1)}KB`);
```

---

## 9. AI-Assisted Test Generation Workflow

### 9.1 When to Use AI-Generated Tests

| Situation | AI Approach |
|-----------|-------------|
| New backend service module | Generate full unit test suite from service file |
| New React hook | Generate renderHook-based tests from hook file |
| New API endpoint | Generate integration test from router + schemas |
| Missing edge cases | Feed existing tests + source, ask for boundary cases |
| Visual regression baselines | Not applicable (screenshots are captured, not written) |

### 9.2 Generation Process

**Step 1: Gather context**

Feed Claude Code the source file plus any related files (schemas, types, fixtures):

```
Read these files and generate comprehensive unit tests:
- backend/src/modules/content/service.ts
- backend/src/modules/content/schemas.ts
- backend/tests/fixtures/content.fixture.ts (if exists)
```

**Step 2: Specify the test pattern**

```
Generate tests following these conventions:
- File: backend/tests/unit/modules/content.service.test.ts
- Use vi.mock for Prisma
- Use factory fixtures from fixtures/content.fixture.ts
- Test names: "should [behavior] when [condition]"
- Cover: happy path, validation errors, not-found errors, edge cases
- For state machines: test every valid transition AND every invalid transition
```

**Step 3: Review and refine**

Checklist for reviewing AI-generated tests:
- [ ] Tests actually run (`npm run test:unit`)
- [ ] No false positives (tests pass for wrong reasons)
- [ ] Mocks are realistic (match actual Prisma/Dexie behavior)
- [ ] Edge cases are meaningful (not just repeating happy path with different data)
- [ ] Assertions are specific (not just `toBeDefined()`)
- [ ] No snapshot abuse (snapshots only for stable output shapes)

**Step 4: Integrate**

```
Place the test file in the correct directory per conventions.
Run: npm test -- --filter=content.service
Verify: all tests pass, no flaky tests.
```

### 9.3 Prompt Templates

**Template: Backend Service Unit Tests**

```
I need unit tests for this backend service. The service uses Prisma for database
access and Zod for validation.

Source: [paste service.ts]
Schemas: [paste schemas.ts]

Generate tests in this structure:
- Mock Prisma with vi.mock('../../lib/prisma.js')
- Use factory fixtures for test data
- Group by function name in describe blocks
- Test: happy path, validation errors (bad input), not-found (missing records),
  conflict errors (duplicates), and edge cases
- For any state machine / transition map: test every valid AND invalid transition

Output format: Complete test file ready to save at
backend/tests/unit/modules/{name}.service.test.ts
```

**Template: Frontend Hook Unit Tests**

```
I need unit tests for this React hook. It uses Dexie.js (IndexedDB) via
dexie-react-hooks and may use AppContext.

Source: [paste hook.ts]
Database schema: [paste relevant Dexie table definitions]

Generate tests using:
- @testing-library/react renderHook
- fake-indexeddb (already in vitest.setup.ts)
- Seed Dexie tables before each test, clear after
- Test: initial state, data loading, mutations, error states, edge cases

Output format: Complete test file ready to save at
tests/unit/hooks/{hookName}.test.ts
```

**Template: API Integration Tests**

```
I need integration tests for this API route. Tests should hit real HTTP endpoints
using Supertest against the Express app.

Router: [paste router.ts]
Schemas: [paste schemas.ts]

Generate tests using:
- Supertest with the Express app instance
- Auth helper to generate JWT tokens for different roles
- Seed helper to populate test data
- Test: 200 success, 201 created, 400 validation, 401 unauthorized,
  403 forbidden, 404 not found, 409 conflict
- Verify response body shapes match contract

Output format: Complete test file ready to save at
backend/tests/integration/{name}.integration.test.ts
```

### 9.4 Coverage Gaps Prompt

When coverage stalls, use this prompt to find what is missing:

```
Here are the source files and existing tests for the {module} module:

Source: [paste source]
Existing tests: [paste tests]
Current coverage report: [paste coverage output]

Identify:
1. Functions with zero test coverage
2. Branches not covered (if/else paths)
3. Error paths not tested
4. Edge cases at boundaries (empty arrays, null values, max values)
5. Integration points not verified

Generate additional tests to fill these gaps.
```

---

## 10. Release Certification Checklist

Every release must pass this checklist. The `npm run test:certify` command automates the automated portions. Manual checks are documented below.

### 10.1 Automated Gates (must all pass)

| Gate | Command | Pass Criteria |
|------|---------|---------------|
| TypeScript compilation | `tsc -b` | Zero errors |
| Backend type check | `cd backend && npm run typecheck` | Zero errors |
| Admin type check | `cd admin && npm run typecheck` | Zero errors |
| ESLint (frontend) | `npm run lint` | Zero errors |
| ESLint (backend) | `cd backend && npm run lint` | Zero errors |
| Frontend unit tests | `npm test` | All pass, coverage above thresholds |
| Backend unit tests | `cd backend && npm run test:unit` | All pass |
| Backend integration tests | `cd backend && npm run test:integration` | All pass |
| Backend contract tests | `cd backend && npm run test:contract` | All pass |
| Admin unit tests | `cd admin && npm test` | All pass |
| E2E: Child flows | `npm run test:e2e:child` | All pass on mobile + tablet |
| E2E: Parent flows | `npm run test:e2e:parent` | All pass on mobile + desktop |
| E2E: Admin flows | `npm run test:e2e:admin` | All pass on desktop |
| Bundle size | Build output check | Main <180KB gzip, total precache <1500KB |
| Startup performance | Lighthouse or Playwright | FCP <1.5s, TTI <3.0s |

### 10.2 Manual Verification (required for major releases)

| Check | Who | What to Verify |
|-------|-----|----------------|
| **Child flow walkthrough** | QA | Play through 3 lessons, 2 stories, 1 game on a real device |
| **Bedtime mode** | QA | Enable bedtime, verify only calm content appears, verify dark theme |
| **Parent gate** | QA | Verify math problem blocks child, allows parent |
| **Offline mode** | QA | Enable airplane mode, verify content loads from cache/IndexedDB |
| **Fresh install** | QA | Clear all data, go through onboarding, verify no crashes |
| **Accessibility spot check** | QA | Tab through 3 key pages with keyboard, verify focus visible |
| **Different age groups** | QA | Switch between 2-3, 4-5, 6-8 and verify content filtering |
| **Subscription gating** | QA | Verify free user sees upgrade prompts on premium content |

### 10.3 Release Types and Required Gates

| Release Type | Automated Gates | Manual Gates | Approval |
|-------------|----------------|-------------|----------|
| **Hotfix** | All unit tests + affected E2E flows | Targeted manual check of fix | 1 reviewer |
| **Minor release** | Full `test:certify` | Manual verification of changed features | 1 reviewer |
| **Major release** | Full `test:certify` + visual regression + a11y scan | Full manual checklist | 2 reviewers |
| **Content-only update** | Backend unit + contract tests | Verify content renders correctly | Content lead |

### 10.4 Certification Report Template

After `npm run test:certify` completes, generate a report:

```
## Release Certification Report

**Version:** x.y.z
**Date:** YYYY-MM-DD
**Certified by:** [name]

### Automated Results
- Frontend unit tests: XX/XX passed (XX% coverage)
- Backend unit tests: XX/XX passed
- Backend integration tests: XX/XX passed
- Backend contract tests: XX/XX passed
- Admin unit tests: XX/XX passed
- E2E child flows: XX/XX passed
- E2E parent flows: XX/XX passed
- E2E admin flows: XX/XX passed
- Bundle size: XXX KB gzip (budget: 180KB)
- FCP: X.Xs (budget: 1.5s)

### Manual Checks
- [ ] Child flow walkthrough: PASS / FAIL
- [ ] Bedtime mode: PASS / FAIL
- [ ] Parent gate: PASS / FAIL
- [ ] Offline mode: PASS / FAIL
- [ ] Fresh install: PASS / FAIL

### Known Issues
- (list any known issues shipping with this release)

### Go / No-Go: ___
```

---

## Appendix A: Test Data Strategy

### Seed Data Sets

| Set | Purpose | Contents |
|-----|---------|----------|
| **Minimal** | Unit tests | 1 household, 1 parent, 1 child, 3 content items |
| **Standard** | Integration tests | 2 households, 2 parents, 3 children (different ages), 20 content items (all statuses), 1 subscription per household |
| **Full** | E2E tests | 5 households (free + trial + premium + family + expired), 5 children, 50 content items, progress records, sync events |

### Data Isolation

- **Unit tests:** In-memory mocks, no shared state
- **Integration tests:** Test database, truncated between test files (not between individual tests for speed)
- **E2E tests:** Seeded via API calls in `beforeAll`, cleaned in `afterAll`

---

## Appendix B: Flaky Test Prevention

| Cause | Prevention |
|-------|-----------|
| **Timing-dependent** | Never use `setTimeout` in tests; use `waitFor` / `findBy` / Playwright auto-waiting |
| **Shared state** | Each test file gets isolated DB state; never depend on test execution order |
| **Network calls** | Unit tests must never hit real network; mock all fetch/axios |
| **Animation timing** | Disable Framer Motion in tests via `MotionConfig` with `reducedMotion="always"` |
| **IndexedDB race** | Use `fake-indexeddb/auto` import before any Dexie import; await all DB operations |
| **Date/time** | Use `vi.useFakeTimers()` for anything time-sensitive; restore in afterEach |
| **Random data** | Use seeded random (fixed seeds) or deterministic fixtures; never `Math.random()` in assertions |

---

## Appendix C: Quick Reference -- Writing Your First Test

### Backend unit test example

```typescript
// backend/tests/unit/lib/entitlement.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkEntitlement } from '../../../src/lib/entitlement.js';
import { prisma } from '../../../src/lib/prisma.js';

vi.mock('../../../src/lib/prisma.js', () => ({
  prisma: {
    entitlement: {
      findUnique: vi.fn(),
    },
  },
}));

describe('checkEntitlement', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true when entitlement is granted and not expired', async () => {
    vi.mocked(prisma.entitlement.findUnique).mockResolvedValue({
      id: '1',
      householdId: 'h1',
      feature: 'premium_content',
      granted: true,
      expiresAt: new Date(Date.now() + 86400000), // tomorrow
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await checkEntitlement('h1', 'premium_content');
    expect(result).toBe(true);
  });

  it('should return false when entitlement has expired', async () => {
    vi.mocked(prisma.entitlement.findUnique).mockResolvedValue({
      id: '1',
      householdId: 'h1',
      feature: 'premium_content',
      granted: true,
      expiresAt: new Date(Date.now() - 86400000), // yesterday
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await checkEntitlement('h1', 'premium_content');
    expect(result).toBe(false);
  });

  it('should return false when entitlement does not exist', async () => {
    vi.mocked(prisma.entitlement.findUnique).mockResolvedValue(null);

    const result = await checkEntitlement('h1', 'premium_content');
    expect(result).toBe(false);
  });

  it('should return false when entitlement is not granted', async () => {
    vi.mocked(prisma.entitlement.findUnique).mockResolvedValue({
      id: '1',
      householdId: 'h1',
      feature: 'premium_content',
      granted: false,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await checkEntitlement('h1', 'premium_content');
    expect(result).toBe(false);
  });

  it('should return true when entitlement has no expiry', async () => {
    vi.mocked(prisma.entitlement.findUnique).mockResolvedValue({
      id: '1',
      householdId: 'h1',
      feature: 'premium_content',
      granted: true,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await checkEntitlement('h1', 'premium_content');
    expect(result).toBe(true);
  });
});
```

### Frontend hook test example

```typescript
// tests/unit/hooks/useEntitlement.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEntitlement } from '../../../src/hooks/useEntitlement';

// Mock the dependency
vi.mock('../../../src/hooks/useSubscription', () => ({
  useSubscription: vi.fn(),
}));

import { useSubscription } from '../../../src/hooks/useSubscription';

describe('useEntitlement', () => {
  describe('hasEntitlement', () => {
    it('should return true for non-premium features regardless of tier', () => {
      vi.mocked(useSubscription).mockReturnValue({
        isPremium: false,
        isTrialing: false,
        plan: 'free',
        status: 'active',
      });

      const { result } = renderHook(() => useEntitlement());
      expect(result.current.hasEntitlement('some_free_feature')).toBe(true);
    });

    it('should return true for premium features when user is premium', () => {
      vi.mocked(useSubscription).mockReturnValue({
        isPremium: true,
        isTrialing: false,
        plan: 'premium_monthly',
        status: 'active',
      });

      const { result } = renderHook(() => useEntitlement());
      expect(result.current.hasEntitlement('offline_packs')).toBe(true);
      expect(result.current.hasEntitlement('all_content')).toBe(true);
      expect(result.current.hasEntitlement('export_data')).toBe(true);
    });

    it('should return true for trial-allowed features when user is trialing', () => {
      vi.mocked(useSubscription).mockReturnValue({
        isPremium: false,
        isTrialing: true,
        plan: 'trial',
        status: 'trialing',
      });

      const { result } = renderHook(() => useEntitlement());
      expect(result.current.hasEntitlement('all_content')).toBe(true);
      expect(result.current.hasEntitlement('multiple_profiles')).toBe(true);
      expect(result.current.hasEntitlement('advanced_reports')).toBe(true);
      expect(result.current.hasEntitlement('custom_routines')).toBe(true);
    });

    it('should return false for premium-only features when user is trialing', () => {
      vi.mocked(useSubscription).mockReturnValue({
        isPremium: false,
        isTrialing: true,
        plan: 'trial',
        status: 'trialing',
      });

      const { result } = renderHook(() => useEntitlement());
      expect(result.current.hasEntitlement('offline_packs')).toBe(false);
      expect(result.current.hasEntitlement('no_ads')).toBe(false);
      expect(result.current.hasEntitlement('export_data')).toBe(false);
      expect(result.current.hasEntitlement('priority_support')).toBe(false);
    });

    it('should return false for premium features when user is free', () => {
      vi.mocked(useSubscription).mockReturnValue({
        isPremium: false,
        isTrialing: false,
        plan: 'free',
        status: 'active',
      });

      const { result } = renderHook(() => useEntitlement());
      expect(result.current.hasEntitlement('offline_packs')).toBe(false);
      expect(result.current.hasEntitlement('all_content')).toBe(false);
    });
  });
});
```

### E2E test example

```typescript
// e2e/tests/child/lesson-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Child Lesson Flow', () => {
  test('should complete a lesson and track progress', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to lessons
    await page.click('[data-testid="nav-lessons"]');
    await expect(page.locator('[data-testid="lesson-card"]').first()).toBeVisible();

    // Pick first lesson
    await page.click('[data-testid="lesson-card"]:first-child');
    await expect(page.locator('[data-testid="lesson-content"]')).toBeVisible();

    // Complete the lesson (interact with content)
    // ... interaction steps depend on lesson type

    // Verify completion
    await expect(page.locator('[data-testid="completion-celebration"]')).toBeVisible();
  });
});
```

---

## Appendix D: Glossary

| Term | Definition |
|------|-----------|
| **Content status** | One of: draft, review, approved, scheduled, published, archived |
| **SubStatus** | One of: active, trialing, past_due, cancelled, expired, paused |
| **Entitlement** | A feature gate tied to a household's subscription plan |
| **Sync event** | A versioned record of a data change, used for client-server sync |
| **Conflict** | When both client and server have changed the same entity since last sync |
| **Soft delete** | Setting `deletedAt` instead of removing the row; auto-filtered by middleware |
| **Policy engine** | Rules that validate content (age appropriateness, bedtime suitability, off-brand language, educational mismatch) |
| **Recommendation scoring** | 5-factor weighted algorithm: age match, skill boost, bedtime bias, repeat penalty, freshness |
| **BullMQ queue** | Background job processor backed by Redis for async tasks |
| **PWA precache** | Service worker cache of ~97 static assets for offline availability |
| **Parent gate** | Math problem that must be solved to access parent-only features |
| **Bedtime mode** | Reduced-stimulation mode that filters content and applies dark theme |
