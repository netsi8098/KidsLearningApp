import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma, resetPrismaMocks } from '../../helpers/prisma.mock';

// ── Mock dependencies ────────────────────────────────────────
vi.mock('../../../src/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('../../../src/lib/audit', () => ({ logAudit: vi.fn() }));
vi.mock('../../../src/lib/policyEngine', () => ({ evaluateContentPolicies: vi.fn() }));

import { updateContent } from '../../../src/modules/content/service';
import { logAudit } from '../../../src/lib/audit';
import { ValidationError } from '../../../src/lib/errors';

// ── Helpers ──────────────────────────────────────────────────

function fakeContent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'content-1',
    slug: 'test-content',
    type: 'lesson',
    title: 'Test Content',
    emoji: '',
    description: 'A test content item',
    body: {},
    status: 'draft',
    accessTier: 'free',
    ageGroup: 'all',
    difficulty: null,
    energyLevel: null,
    durationMinutes: null,
    route: null,
    authorId: 'user-1',
    publishedAt: null,
    scheduledAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    version: 1,
    featured: false,
    mood: null,
    bedtimeFriendly: false,
    language: 'en',
    ...overrides,
  };
}

// ── Content Workflow State Machine Tests ──────────────────────

describe('Content Workflow State Machine', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.mocked(logAudit).mockReset();
  });

  // ── Valid Transitions ────────────────────────────────────────

  describe('Valid transitions', () => {
    const validTransitions: Array<{
      from: string;
      to: string;
      description: string;
    }> = [
      { from: 'draft', to: 'review', description: 'draft -> review (submit for review)' },
      { from: 'review', to: 'approved', description: 'review -> approved (reviewer approves)' },
      { from: 'review', to: 'draft', description: 'review -> draft (rejected/returned)' },
      { from: 'approved', to: 'scheduled', description: 'approved -> scheduled (schedule for publication)' },
      { from: 'approved', to: 'published', description: 'approved -> published (immediate publish)' },
      { from: 'scheduled', to: 'published', description: 'scheduled -> published (publish on schedule)' },
      { from: 'published', to: 'archived', description: 'published -> archived (retire content)' },
      { from: 'published', to: 'draft', description: 'published -> draft (reset to draft)' },
      { from: 'review', to: 'archived', description: 'review -> archived (archive from review)' },
      { from: 'approved', to: 'draft', description: 'approved -> draft (reset to draft)' },
      { from: 'approved', to: 'archived', description: 'approved -> archived (archive from approved)' },
      { from: 'scheduled', to: 'approved', description: 'scheduled -> approved (unschedule)' },
      { from: 'scheduled', to: 'archived', description: 'scheduled -> archived (archive from scheduled)' },
      { from: 'archived', to: 'draft', description: 'archived -> draft (restore from archive)' },
      { from: 'draft', to: 'archived', description: 'draft -> archived (archive from draft)' },
    ];

    for (const { from, to, description } of validTransitions) {
      it(`should allow: ${description}`, async () => {
        const existing = fakeContent({ status: from, version: 3 });
        mockPrisma.content.findUnique.mockResolvedValue(existing);
        mockPrisma.content.update.mockResolvedValue({
          ...existing,
          status: to,
          version: 4,
          updatedAt: new Date(),
        });

        const result = await updateContent('content-1', { status: to });

        expect(result.status).toBe(to);
      });

      it(`should increment version on transition: ${description}`, async () => {
        const existing = fakeContent({ status: from, version: 5 });
        mockPrisma.content.findUnique.mockResolvedValue(existing);
        mockPrisma.content.update.mockResolvedValue({
          ...existing,
          status: to,
          version: 6,
          updatedAt: new Date(),
        });

        await updateContent('content-1', { status: to });

        const updateCall = mockPrisma.content.update.mock.calls[0][0];
        expect(updateCall.data.version).toEqual({ increment: 1 });
      });

      it(`should set updatedAt on transition: ${description}`, async () => {
        const existing = fakeContent({ status: from });
        mockPrisma.content.findUnique.mockResolvedValue(existing);
        mockPrisma.content.update.mockResolvedValue({
          ...existing,
          status: to,
          updatedAt: new Date(),
        });

        await updateContent('content-1', { status: to });

        // Prisma auto-sets updatedAt, but we verify the update was called
        expect(mockPrisma.content.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: 'content-1' },
            data: expect.objectContaining({
              status: to,
              version: { increment: 1 },
            }),
          })
        );
      });

      it(`should create audit log on transition: ${description}`, async () => {
        const existing = fakeContent({ status: from });
        mockPrisma.content.findUnique.mockResolvedValue(existing);
        mockPrisma.content.update.mockResolvedValue({
          ...existing,
          status: to,
          updatedAt: new Date(),
        });

        await updateContent('content-1', { status: to });

        expect(logAudit).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'update',
            entity: 'Content',
            entityId: 'content-1',
            changes: expect.objectContaining({ status: to }),
          })
        );
      });
    }
  });

  // ── Invalid Transitions ──────────────────────────────────────

  describe('Invalid transitions', () => {
    const invalidTransitions: Array<{
      from: string;
      to: string;
      description: string;
    }> = [
      { from: 'draft', to: 'published', description: 'draft -> published (skip review)' },
      { from: 'draft', to: 'approved', description: 'draft -> approved (skip review)' },
      { from: 'draft', to: 'scheduled', description: 'draft -> scheduled (skip review and approval)' },
      { from: 'archived', to: 'published', description: 'archived -> published (must go through draft)' },
      { from: 'published', to: 'approved', description: 'published -> approved (backward movement)' },
      { from: 'review', to: 'scheduled', description: 'review -> scheduled (skip approval)' },
      { from: 'review', to: 'published', description: 'review -> published (skip approval)' },
      { from: 'published', to: 'review', description: 'published -> review (invalid backward)' },
      { from: 'published', to: 'scheduled', description: 'published -> scheduled (invalid backward)' },
      { from: 'archived', to: 'published', description: 'archived -> published (must restore to draft first)' },
      { from: 'archived', to: 'review', description: 'archived -> review (invalid)' },
      { from: 'archived', to: 'approved', description: 'archived -> approved (invalid)' },
      { from: 'archived', to: 'scheduled', description: 'archived -> scheduled (invalid)' },
      { from: 'scheduled', to: 'draft', description: 'scheduled -> draft (not allowed directly)' },
      { from: 'scheduled', to: 'review', description: 'scheduled -> review (invalid)' },
    ];

    for (const { from, to, description } of invalidTransitions) {
      it(`should reject: ${description}`, async () => {
        const existing = fakeContent({ status: from });
        mockPrisma.content.findUnique.mockResolvedValue(existing);

        await expect(
          updateContent('content-1', { status: to })
        ).rejects.toThrow(ValidationError);
      });

      it(`should include descriptive message when rejecting: ${description}`, async () => {
        const existing = fakeContent({ status: from });
        mockPrisma.content.findUnique.mockResolvedValue(existing);

        try {
          await updateContent('content-1', { status: to });
          // Should not reach here
          expect.unreachable('Expected ValidationError to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          const message = (error as ValidationError).message;
          expect(message).toContain(from);
          expect(message).toContain(to);
          expect(message).toContain('Invalid status transition');
        }
      });

      it(`should NOT create audit log on invalid transition: ${description}`, async () => {
        const existing = fakeContent({ status: from });
        mockPrisma.content.findUnique.mockResolvedValue(existing);

        try {
          await updateContent('content-1', { status: to });
        } catch {
          // expected
        }

        expect(logAudit).not.toHaveBeenCalled();
      });

      it(`should NOT modify content on invalid transition: ${description}`, async () => {
        const existing = fakeContent({ status: from });
        mockPrisma.content.findUnique.mockResolvedValue(existing);

        try {
          await updateContent('content-1', { status: to });
        } catch {
          // expected
        }

        expect(mockPrisma.content.update).not.toHaveBeenCalled();
      });
    }
  });

  // ── Side Effects on Status Changes ───────────────────────────

  describe('Side effects on specific status transitions', () => {
    it('should set publishedAt when transitioning to published for the first time', async () => {
      const existing = fakeContent({ status: 'approved', publishedAt: null });
      mockPrisma.content.findUnique.mockResolvedValue(existing);
      mockPrisma.content.update.mockResolvedValue({
        ...existing,
        status: 'published',
        publishedAt: new Date(),
      });

      await updateContent('content-1', { status: 'published' });

      const updateCall = mockPrisma.content.update.mock.calls[0][0];
      expect(updateCall.data.publishedAt).toBeInstanceOf(Date);
    });

    it('should NOT overwrite publishedAt on subsequent publishes', async () => {
      const originalPublishedAt = new Date('2024-06-01');
      const existing = fakeContent({
        status: 'approved',
        publishedAt: originalPublishedAt,
      });
      mockPrisma.content.findUnique.mockResolvedValue(existing);
      mockPrisma.content.update.mockResolvedValue({
        ...existing,
        status: 'published',
      });

      await updateContent('content-1', { status: 'published' });

      const updateCall = mockPrisma.content.update.mock.calls[0][0];
      // publishedAt should not be set because it already exists
      expect(updateCall.data.publishedAt).toBeUndefined();
    });

    it('should set archivedAt when transitioning to archived', async () => {
      const existing = fakeContent({ status: 'published' });
      mockPrisma.content.findUnique.mockResolvedValue(existing);
      mockPrisma.content.update.mockResolvedValue({
        ...existing,
        status: 'archived',
      });

      await updateContent('content-1', { status: 'archived' });

      const updateCall = mockPrisma.content.update.mock.calls[0][0];
      expect(updateCall.data.archivedAt).toBeInstanceOf(Date);
    });

    it('should create publishedSnapshot when transitioning to published', async () => {
      const existing = fakeContent({ status: 'approved', publishedAt: null });
      const snapshotContent = {
        ...existing,
        tags: [{ tag: { id: 'tag-1', name: 'Fun' } }],
        skills: [{ skill: { id: 'skill-1', name: 'Reading' } }],
      };
      // First findUnique call finds existing, second fetches snapshot
      mockPrisma.content.findUnique
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(snapshotContent);
      mockPrisma.content.update.mockResolvedValue({
        ...existing,
        status: 'published',
      });

      await updateContent('content-1', { status: 'published' });

      const updateCall = mockPrisma.content.update.mock.calls[0][0];
      expect(updateCall.data.publishedSnapshot).toBeDefined();
    });
  });

  // ── Same Status (No-op) ──────────────────────────────────────

  describe('Same status (no transition)', () => {
    it('should allow updating other fields without changing status', async () => {
      const existing = fakeContent({ status: 'draft' });
      mockPrisma.content.findUnique.mockResolvedValue(existing);
      mockPrisma.content.update.mockResolvedValue({
        ...existing,
        title: 'Updated Title',
      });

      const result = await updateContent('content-1', { title: 'Updated Title' });

      expect(result.title).toBe('Updated Title');
      expect(mockPrisma.content.update).toHaveBeenCalled();
    });

    it('should not validate status transition when status is unchanged', async () => {
      const existing = fakeContent({ status: 'draft' });
      mockPrisma.content.findUnique.mockResolvedValue(existing);
      mockPrisma.content.update.mockResolvedValue(existing);

      // Passing the same status should not trigger validation
      await expect(
        updateContent('content-1', { status: 'draft' })
      ).resolves.toBeDefined();
    });
  });
});
