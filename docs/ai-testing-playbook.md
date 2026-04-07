# AI-Assisted Test Generation Playbook

## Overview

This playbook documents how to use Claude Code to generate and maintain tests for the Kids Learning App backend and frontend. It covers workflows, prompt templates, review criteria, and anti-patterns so that AI-generated tests are meaningful, maintainable, and CI-ready.

## Core Principles

1. **Tests lock in behavior, not implementation.** A valid test should break only when a user-visible behavior changes.
2. **Deterministic by default.** No random data, no timing-dependent assertions, no test-order coupling.
3. **Arrange/Act/Assert.** Every test body follows three clear phases.
4. **One behavior per test.** Each `it()` block tests a single expectation chain.

---

## Workflow

### 1. Detecting Changed Files

Before generating tests, identify what changed.

```bash
# Unstaged and staged changes
git diff --name-only

# Changes compared to a base branch
git diff --name-only origin/main...HEAD

# Only backend changes
git diff --name-only origin/main...HEAD -- backend/

# Only frontend changes
git diff --name-only origin/main...HEAD -- src/
```

**File-to-test mapping:**

| Changed path | Test area |
|---|---|
| `backend/src/modules/*/service.ts` | `backend/tests/unit/modules/*-service.test.ts` |
| `backend/src/modules/*/router.ts` | `backend/tests/integration/*-api.test.ts` |
| `backend/src/modules/*/schemas.ts` | `backend/tests/contract/*-contract.test.ts` |
| `backend/src/lib/*.ts` | `backend/tests/unit/lib/*.test.ts` |
| `backend/src/middleware/*.ts` | `backend/tests/unit/security/*.test.ts` |
| `src/hooks/use*.ts` | `src/__tests__/hooks/use*.test.ts` |
| `src/pages/*.tsx` | `e2e/specs/*.spec.ts` |

### 2. Generating Tests for New Code

Use this prompt template when a new service function or module is created.

#### Prompt Template: Unit Test Generation

```
Read [file path] and generate comprehensive unit tests using Vitest.

Requirements:
- Import the mock Prisma client from tests/helpers/prisma.mock.js
- Import fixtures from tests/fixtures/*.fixture.js
- Mock external dependencies (audit, queue, storage, policyEngine)
- Reset all mocks in beforeEach using resetPrismaMocks()
- Cover these scenarios:
  * Happy path with valid input
  * Edge case: empty input / null fields
  * Edge case: boundary values (min, max lengths)
  * Error case: resource not found (NotFoundError)
  * Error case: duplicate/conflict (ConflictError)
  * Error case: invalid state transition (ValidationError)
  * Authorization: verify the function uses the correct data
- Use the naming convention: should [behavior] when [condition]
- Each test must be self-contained (no shared mutable state between tests)
- Assertions must check specific values, not just toBeDefined()
```

#### Example invocation:

```
Read backend/src/modules/content/service.ts and generate unit tests
for the createContent, updateContent, and archiveContent functions.
Use the existing Prisma mock from tests/helpers/prisma.mock.ts.
Cover: happy path, slug conflict, status transitions, not-found errors.
```

### 3. Generating Tests for Bug Fixes

When fixing a bug, always write a reproduction test first. The test must fail before the fix and pass after.

#### Prompt Template: Bug Reproduction Test

```
Bug description: [description]
Affected file: [path]
Expected behavior: [expected]
Actual behavior: [actual]

Write a test that:
1. Sets up the exact conditions that trigger the bug
2. Calls the affected function with the problematic input
3. Asserts the CORRECT behavior (this test should FAIL on the current code)
4. Include a comment: // BUG: [ticket-id] - [one-line description]
5. Add 2-3 related edge cases to prevent regression

After the fix is applied, this test must pass without modification.
```

#### Example:

```
Bug description: Subscription cancellation does not downgrade entitlements
  when immediate=false
Affected file: backend/src/modules/subscription/service.ts
Expected behavior: Entitlements downgrade at period end
Actual behavior: Entitlements remain active indefinitely after cancellation

Write a reproduction test following the bug reproduction template.
```

### 4. Generating Integration Tests

Integration tests exercise real HTTP routes with supertest. They verify request/response shapes, status codes, auth requirements, and validation.

#### Prompt Template: Integration Test Generation

```
Read [router file] and [schema file].
Generate API integration tests using the supertest helper from
tests/helpers/supertest.helper.ts.

For each endpoint, test:
- Success response (correct status code and response shape)
- Validation errors (missing required fields, invalid types, boundary values)
- Authentication requirements (missing token, expired token, wrong role)
- Not-found handling (non-existent resource IDs)
- Response pagination shape (for list endpoints)

Use adminHeaders(), editorHeaders(), viewerHeaders() from auth.helper.ts
for authorization testing.

Mount the router with: mountRouter('/api/[resource]', router)
```

### 5. Generating Contract Tests

Contract tests validate that the API response shape matches the documented schema. They protect against accidental field renames, type changes, or missing fields.

#### Prompt Template: Contract Test Generation

```
Read [schema file] and generate contract tests.

For each Zod schema, test:
- Valid input passes parsing
- Each required field triggers error when missing
- Each enum field rejects values outside the allowed set
- Optional fields accept undefined
- Type coercion works correctly (e.g., string -> number for pagination)
- Default values are applied correctly

Use schema.safeParse() and check result.success and result.error.
```

---

## Review Criteria

Every AI-generated test must pass these checks before merging:

### Must Have
- [ ] Meaningful assertions (not trivially passing)
- [ ] Deterministic (no flaky timing, randomness, or network)
- [ ] Readable (clear arrange/act/assert structure)
- [ ] Isolated (no cross-test dependencies, no shared mutable state)
- [ ] Properly mocked (external deps mocked, SUT not mocked)
- [ ] Clean teardown (resetPrismaMocks in beforeEach)
- [ ] Descriptive names (`should reject expired promo code` not `test case 3`)

### Should Have
- [ ] Edge cases covered (empty arrays, null values, boundary numbers)
- [ ] Error paths tested (not just happy paths)
- [ ] Assertions on mock call arguments (verify correct Prisma queries)
- [ ] Fixture usage (use createContentFixture, not inline object literals)

### Must Not Have
- [ ] Tests that only assert `toBeDefined()` or `toBeTruthy()`
- [ ] Tests that mock the system under test
- [ ] Hardcoded `setTimeout` or `sleep` delays
- [ ] Tests that depend on execution order
- [ ] Tests that test framework behavior instead of app code
- [ ] Snapshot tests for API responses (use structural assertions instead)
- [ ] Secrets, credentials, or real API keys

---

## Anti-patterns to Reject

### 1. Trivial Pass Tests
```typescript
// BAD: This test always passes and catches nothing
it('should exist', () => {
  expect(createContent).toBeDefined();
});
```

### 2. Over-mocked Tests
```typescript
// BAD: The SUT itself is mocked -- this tests nothing
vi.mock('../../src/modules/content/service.js');
const { createContent } = await import('../../src/modules/content/service.js');
createContent.mockResolvedValue({ id: '1' });
expect(await createContent({})).toEqual({ id: '1' }); // Tautology
```

### 3. Timing-dependent Tests
```typescript
// BAD: Will flake on slow CI runners
it('should expire cache', async () => {
  await populateCache();
  await new Promise(r => setTimeout(r, 1000)); // Fragile
  expect(cache.get('key')).toBeNull();
});
```

### 4. Order-dependent Tests
```typescript
// BAD: Test B assumes Test A ran first
let sharedId: string;
it('A: should create', async () => { sharedId = result.id; });
it('B: should update', async () => { await update(sharedId); }); // Breaks if A skipped
```

### 5. Testing Framework Behavior
```typescript
// BAD: Tests that Vitest works, not that app code works
it('should mock functions', () => {
  const fn = vi.fn().mockReturnValue(42);
  expect(fn()).toBe(42); // This is vitest documentation, not a product test
});
```

---

## Prompt Templates Quick Reference

### Unit Test
```
Read [file path] and generate comprehensive unit tests.
Cover: happy path, edge cases, error cases.
Use Vitest with globals. Mock external dependencies.
Follow the naming convention: should [behavior] when [condition]
```

### Integration Test
```
Read [router file] and [schema file].
Generate API integration tests using supertest.
Test: success responses, validation errors, auth requirements, response shapes.
```

### Bug Reproduction Test
```
Bug description: [description]
Affected file: [path]
Expected behavior: [expected]
Actual behavior: [actual]

Write a test that:
1. Reproduces the bug (should fail before fix)
2. Verifies the correct behavior (should pass after fix)
3. Covers related edge cases
```

### Contract Test
```
Read [schema file] and generate contract tests.
For each Zod schema, validate: required fields, enum constraints,
type coercion, defaults, and optional field handling.
```

### Security Test
```
Read [middleware file] and generate security tests.
Test: missing auth header, malformed token, expired token,
wrong role, privilege escalation attempts.
```

---

## Maintenance Workflow

### When Adding a New Feature
1. Write tests alongside implementation (TDD or parallel)
2. Generate unit tests for new service functions
3. Generate integration tests for new API endpoints
4. Generate contract tests for new schemas
5. Update certification suite if the feature is critical-path

### When Fixing a Bug
1. Write a reproduction test that fails on the current code
2. Apply the fix
3. Verify the reproduction test now passes
4. Add edge-case tests around the same area

### When Refactoring
1. Run the full test suite before starting
2. Do not modify tests during the refactor
3. If tests break, the refactor changed behavior -- investigate
4. After refactoring, review test names to ensure they still describe the code

### Monthly Review
1. Run coverage report: `cd backend && npm run test:coverage`
2. Identify modules below threshold
3. Generate tests for uncovered code paths
4. Review and merge test additions
5. Update the coverage goals table below

---

## Coverage Goals

| Area | Current | Target (3mo) | Target (6mo) |
|------|---------|--------------|--------------|
| Backend lib/ | 0% | 80% | 90% |
| Backend modules/ | 0% | 60% | 80% |
| Frontend hooks/ | 0% | 70% | 85% |
| Frontend components/ | 0% | 50% | 70% |
| E2E child flows | 0 tests | 20 tests | 40 tests |
| E2E parent flows | 0 tests | 10 tests | 20 tests |
| E2E admin flows | 0 tests | 10 tests | 25 tests |

---

## CI Integration

Tests are automatically run on every push and pull request via the GitHub Actions workflow at `.github/workflows/test.yml`. The certification suite is a required check for releases.

### Running Locally

```bash
# Full backend suite
cd backend && npm test

# Only unit tests
cd backend && npm run test:unit

# Only certification suite
cd backend && npx vitest run tests/certification/

# Coverage report
cd backend && npm run test:coverage
```
