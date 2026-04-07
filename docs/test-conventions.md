# Test Conventions

This document defines naming conventions, directory structure, test patterns, mocking rules, and CI configuration for the Kids Learning App test suite.

---

## File Naming

| Test type | Pattern | Example |
|---|---|---|
| Unit test | `[module].test.ts` | `content-service.test.ts` |
| Integration test | `[module]-api.test.ts` | `content-api.test.ts` |
| Contract test | `[module]-contract.test.ts` | `content-contract.test.ts` |
| E2E test | `[feature].spec.ts` | `child-onboarding.spec.ts` |
| Fixture | `[domain].fixture.ts` | `content.fixture.ts` |
| Helper | `[domain].helper.ts` | `auth.helper.ts` |
| Mock | `[dependency].mock.ts` | `prisma.mock.ts` |
| Certification | descriptive name | `release-certification.test.ts` |

---

## Directory Structure

```
backend/
  tests/
    setup/
      vitest.setup.ts          # Global setup (env vars, global mocks)
    helpers/
      prisma.mock.ts           # Shared Prisma mock with all models
      auth.helper.ts           # JWT token generation for tests
      request.helper.ts        # Express req/res/next mocks
      supertest.helper.ts      # Supertest app factory
    fixtures/
      content.fixture.ts       # Content model fixtures + factory
      user.fixture.ts          # User, Household, Parent, Child fixtures
    unit/
      lib/
        errors.test.ts         # AppError, NotFoundError, etc.
        validate.test.ts       # Zod validation middleware
        featureFlags.test.ts   # evaluateFlag logic
        syncEngine.test.ts     # push/pull/conflict logic
        entitlement.test.ts    # Entitlement checks
        softDelete.test.ts     # Soft delete utilities
        policyEngine.test.ts   # Content policy evaluation
      modules/
        content-service.test.ts
        subscription-service.test.ts
        sync-service.test.ts
        # ...one file per module service
      security/
        auth-middleware.test.ts
        error-handler.test.ts
    integration/
      content-api.test.ts
      subscription-api.test.ts
      # ...one file per module router
    contract/
      content-contract.test.ts
      subscription-contract.test.ts
      # ...one file per module schema
    certification/
      release-certification.test.ts   # Curated critical-path tests
      smoke.test.ts                   # Module import verification
e2e/
  specs/
    child/
      onboarding.spec.ts
      content-browsing.spec.ts
      progress-tracking.spec.ts
    parent/
      dashboard.spec.ts
      subscription.spec.ts
      privacy-settings.spec.ts
    admin/
      content-management.spec.ts
      user-management.spec.ts
  fixtures/
    test-data.ts
  helpers/
    page-objects.ts
```

---

## Test Structure

### Unit Tests

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma, resetPrismaMocks } from '../../helpers/prisma.mock.js';
import { createContentFixture, resetContentCounter } from '../../fixtures/content.fixture.js';

vi.mock('../../../src/lib/prisma.js', () => ({ prisma: mockPrisma }));
vi.mock('../../../src/lib/audit.js', () => ({ logAudit: vi.fn() }));

beforeEach(() => {
  resetPrismaMocks();
  resetContentCounter();
});

describe('createContent', () => {
  it('should create content with valid data', async () => {
    // Arrange
    const input = { slug: 'test', type: 'lesson', title: 'Test' };
    const fixture = createContentFixture({ slug: 'test' });
    mockPrisma.content.findUnique.mockResolvedValueOnce(null);
    mockPrisma.content.create.mockResolvedValueOnce(fixture);

    // Act
    const result = await createContent(input, 'user-001');

    // Assert
    expect(result.slug).toBe('test');
    expect(mockPrisma.content.create).toHaveBeenCalledOnce();
  });

  it('should throw ConflictError when slug exists', async () => {
    // Arrange
    const existing = createContentFixture({ slug: 'taken' });
    mockPrisma.content.findUnique.mockResolvedValueOnce(existing);

    // Act & Assert
    await expect(createContent({ slug: 'taken' }, 'user-001'))
      .rejects.toThrow(/already exists/);
  });
});
```

### Integration Tests

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { mountRouter, adminHeaders, viewerHeaders } from '../../helpers/supertest.helper.js';
import { mockPrisma, resetPrismaMocks } from '../../helpers/prisma.mock.js';

vi.mock('../../../src/lib/prisma.js', () => ({ prisma: mockPrisma }));

const app = mountRouter('/api/content', (await import('../../../src/modules/content/router.js')).default);

describe('POST /api/content', () => {
  beforeEach(() => resetPrismaMocks());

  it('should create content and return 201', async () => {
    // Arrange: mock Prisma
    // Act: POST with adminHeaders()
    // Assert: status 201, response shape
  });

  it('should return 401 without auth', async () => {
    const res = await request(app)
      .post('/api/content')
      .send({ slug: 'test', type: 'lesson', title: 'Test' });

    expect(res.status).toBe(401);
  });

  it('should return 403 for viewer role', async () => {
    const res = await request(app)
      .post('/api/content')
      .set(viewerHeaders())
      .send({ slug: 'test', type: 'lesson', title: 'Test' });

    expect(res.status).toBe(403);
  });
});
```

### Contract Tests

```typescript
import { describe, it, expect } from 'vitest';
import { createContentSchema } from '../../../src/modules/content/schemas.js';

describe('createContentSchema', () => {
  it('should accept valid input', () => {
    const result = createContentSchema.safeParse({
      body: { slug: 'test-slug', type: 'lesson', title: 'Test Title' },
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing required slug', () => {
    const result = createContentSchema.safeParse({
      body: { type: 'lesson', title: 'Test Title' },
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid slug format', () => {
    const result = createContentSchema.safeParse({
      body: { slug: 'UPPERCASE SLUG', type: 'lesson', title: 'Test' },
    });
    expect(result.success).toBe(false);
  });
});
```

---

## Mocking Rules

### Always Mock

| Dependency | Mock location | Why |
|---|---|---|
| Prisma client | `tests/helpers/prisma.mock.ts` | No real database in unit/integration tests |
| Audit logging | Inline `vi.mock` | Side effect; should not affect test outcomes |
| Job queues | Inline `vi.mock` | Async workers not under test |
| File storage | Inline `vi.mock` | No real S3/GCS in tests |
| External HTTP | `vi.mock` or MSW | No real third-party calls |

### Never Mock

| Component | Why |
|---|---|
| The system under test (SUT) | Mocking the thing you are testing makes the test meaningless |
| Zod schemas | They are pure functions; test them directly |
| Error classes | They are simple constructors; test them directly |
| Utility functions | `paginate()`, date helpers, etc. are deterministic and fast |

### Mock Granularity

- **`mockResolvedValueOnce`** -- Use for sequential calls within a single test. Ensures mock returns are consumed in order and do not leak to subsequent calls.
- **`mockResolvedValue`** -- Use only when every call should return the same value (e.g., `logAudit` always resolving).
- **`mockImplementation`** -- Use when you need conditional logic in the mock (e.g., `$transaction` callback).

### Mock Reset Policy

Always call `resetPrismaMocks()` in `beforeEach`. This ensures:
- No mock return values carry over between tests
- No assertion on `toHaveBeenCalledOnce()` is affected by previous tests
- Tests can run in any order

---

## Naming Conventions

### Test Names

Follow the pattern: `should [expected behavior] when [condition/context]`

```typescript
// Good
it('should throw NotFoundError when content does not exist')
it('should return paginated results with correct totalPages')
it('should reject status transition from draft to published')

// Bad
it('test createContent')
it('works correctly')
it('error handling')
```

### Describe Blocks

```typescript
// Module-level describe
describe('ContentService', () => {
  // Function-level describe
  describe('createContent', () => {
    // Scenario-specific tests
    it('should create content with valid data');
    it('should throw ConflictError when slug exists');
  });
});
```

---

## Assertion Patterns

### Prefer Specific Assertions

```typescript
// Good: tests specific behavior
expect(result.status).toBe('published');
expect(result.publishedAt).toBeInstanceOf(Date);
expect(mockPrisma.content.update).toHaveBeenCalledWith(
  expect.objectContaining({
    where: { id: 'content-001' },
  })
);

// Bad: too vague
expect(result).toBeDefined();
expect(result).toBeTruthy();
```

### Assert Mock Calls

```typescript
// Verify the correct Prisma query was constructed
expect(mockPrisma.content.findMany).toHaveBeenCalledWith(
  expect.objectContaining({
    where: expect.objectContaining({ status: 'published' }),
    skip: 0,
    take: 20,
  })
);
```

### Assert Error Types

```typescript
await expect(fn()).rejects.toThrow(NotFoundError);
await expect(fn()).rejects.toThrow(/not found/i);
// For checking statusCode:
try {
  await fn();
  expect.fail('Expected error');
} catch (err) {
  expect(err).toBeInstanceOf(AppError);
  expect((err as AppError).statusCode).toBe(404);
}
```

---

## CI Pipeline

### GitHub Actions Workflow

Located at `.github/workflows/test.yml`. The pipeline runs:

1. **Unit Tests** -- Backend, Frontend, Admin unit tests in parallel
2. **Integration Tests** -- Backend API tests with mocked database
3. **E2E Tests** -- Playwright browser tests (when available)
4. **Certification** -- Release certification suite (required for main merges)

### Required Checks

| Check | Required for `main` | Required for `develop` |
|---|---|---|
| Unit tests pass | Yes | Yes |
| Integration tests pass | Yes | Yes |
| Certification suite pass | Yes | No |
| E2E tests pass | Yes | No |
| Coverage above threshold | Yes | No |

### Running in CI

```bash
# Unit tests (fast, parallel)
cd backend && npx vitest run tests/unit/ --reporter=junit --outputFile=junit-unit.xml

# Integration tests
cd backend && npx vitest run tests/integration/ --reporter=junit --outputFile=junit-integration.xml

# Certification
cd backend && npx vitest run tests/certification/ --reporter=junit --outputFile=junit-certification.xml

# Coverage
cd backend && npx vitest run --coverage --reporter=junit --outputFile=junit-coverage.xml
```

---

## Fixture Guidelines

### Use Factories

```typescript
// Good: deterministic, unique, overridable
const content = createContentFixture({
  status: 'published',
  accessTier: 'premium',
});

// Bad: inline objects with duplicated structure
const content = {
  id: 'content-001',
  slug: 'test',
  type: 'lesson',
  // ...20 more fields copied from another test
};
```

### Reset Counters

```typescript
beforeEach(() => {
  resetContentCounter();  // IDs start from content-001 each test
  resetUserCounters();    // User IDs reset each test
});
```

### Predefined Fixtures

Use `CONTENT_FIXTURES` (12 items) and `ROLE_FIXTURES` for tests that need realistic, diverse data. Use edge-case fixtures (`EDGE_CASE_ARCHIVED`, `EDGE_CASE_BEDTIME_ONLY`, etc.) for boundary testing.
