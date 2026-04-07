import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma, resetPrismaMocks } from '../../helpers/prisma.mock';

// ── Mock dependencies ────────────────────────────────────────
vi.mock('../../../src/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('../../../src/lib/audit', () => ({ logAudit: vi.fn() }));
vi.mock('../../../src/lib/policyEngine', () => ({ evaluateContentPolicies: vi.fn() }));

import {
  listContent,
  getContent,
  createContent,
  updateContent,
  archiveContent,
  addTags,
  removeTag,
  duplicateContent,
  addSkills,
  bulkUpdateStatus,
} from '../../../src/modules/content/service';
import { NotFoundError, ConflictError, ValidationError } from '../../../src/lib/errors';

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

// ── Tests ────────────────────────────────────────────────────

describe('ContentService', () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  // ── listContent ──────────────────────────────────────────

  describe('listContent', () => {
    it('should return paginated content list', async () => {
      const items = [fakeContent(), fakeContent({ id: 'content-2', slug: 'test-2' })];
      mockPrisma.content.findMany.mockResolvedValue(items);
      mockPrisma.content.count.mockResolvedValue(2);

      const result = await listContent({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should calculate totalPages correctly', async () => {
      mockPrisma.content.findMany.mockResolvedValue([fakeContent()]);
      mockPrisma.content.count.mockResolvedValue(25);

      const result = await listContent({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.totalPages).toBe(3);
    });

    it('should apply type filter', async () => {
      mockPrisma.content.findMany.mockResolvedValue([]);
      mockPrisma.content.count.mockResolvedValue(0);

      await listContent({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        type: 'lesson',
      });

      const call = mockPrisma.content.findMany.mock.calls[0][0];
      expect(call.where.type).toBe('lesson');
    });

    it('should apply status filter', async () => {
      mockPrisma.content.findMany.mockResolvedValue([]);
      mockPrisma.content.count.mockResolvedValue(0);

      await listContent({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        status: 'published',
      });

      const call = mockPrisma.content.findMany.mock.calls[0][0];
      expect(call.where.status).toBe('published');
    });

    it('should apply ageGroup filter', async () => {
      mockPrisma.content.findMany.mockResolvedValue([]);
      mockPrisma.content.count.mockResolvedValue(0);

      await listContent({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ageGroup: '3-4',
      });

      const call = mockPrisma.content.findMany.mock.calls[0][0];
      expect(call.where.ageGroup).toBe('3-4');
    });

    it('should apply search filter with OR conditions', async () => {
      mockPrisma.content.findMany.mockResolvedValue([]);
      mockPrisma.content.count.mockResolvedValue(0);

      await listContent({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'hello',
      });

      const call = mockPrisma.content.findMany.mock.calls[0][0];
      expect(call.where.OR).toEqual([
        { title: { contains: 'hello', mode: 'insensitive' } },
        { description: { contains: 'hello', mode: 'insensitive' } },
        { slug: { contains: 'hello', mode: 'insensitive' } },
      ]);
    });

    it('should compute skip from page and limit', async () => {
      mockPrisma.content.findMany.mockResolvedValue([]);
      mockPrisma.content.count.mockResolvedValue(0);

      await listContent({
        page: 3,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      const call = mockPrisma.content.findMany.mock.calls[0][0];
      expect(call.skip).toBe(10); // (3 - 1) * 5
      expect(call.take).toBe(5);
    });
  });

  // ── getContent ───────────────────────────────────────────

  describe('getContent', () => {
    it('should return content with relations when found', async () => {
      const content = fakeContent({
        author: { id: 'user-1', email: 'a@b.com', name: 'Author', role: 'editor' },
        tags: [],
        skills: [],
      });
      mockPrisma.content.findUnique.mockResolvedValue(content);

      const result = await getContent('content-1');

      expect(result).toEqual(content);
      expect(mockPrisma.content.findUnique).toHaveBeenCalledWith({
        where: { id: 'content-1' },
        include: expect.objectContaining({
          author: expect.any(Object),
          tags: expect.any(Object),
          skills: expect.any(Object),
        }),
      });
    });

    it('should throw NotFoundError when content does not exist', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(null);

      await expect(getContent('missing-id')).rejects.toThrow(NotFoundError);
    });
  });

  // ── createContent ────────────────────────────────────────

  describe('createContent', () => {
    it('should create content with valid data', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(null); // slug not taken
      const created = fakeContent({ id: 'new-1' });
      mockPrisma.content.create.mockResolvedValue(created);

      const result = await createContent(
        {
          slug: 'test-content',
          type: 'lesson',
          title: 'Test Content',
        },
        'user-1'
      );

      expect(result.id).toBe('new-1');
      expect(mockPrisma.content.create).toHaveBeenCalled();
    });

    it('should throw ConflictError when slug already exists', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(fakeContent());

      await expect(
        createContent(
          { slug: 'test-content', type: 'lesson', title: 'Dup' },
          'user-1'
        )
      ).rejects.toThrow(ConflictError);
    });

    it('should include skills when provided', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(null);
      mockPrisma.content.create.mockResolvedValue(fakeContent());

      await createContent(
        {
          slug: 'skill-content',
          type: 'lesson',
          title: 'With Skills',
          skills: [{ skillId: 'skill-1', relevance: 0.8 }],
        },
        'user-1'
      );

      const createCall = mockPrisma.content.create.mock.calls[0][0];
      expect(createCall.data.skills).toBeDefined();
      expect(createCall.data.skills.createMany.data).toEqual([
        { skillId: 'skill-1', relevance: 0.8 },
      ]);
    });

    it('should set defaults for optional fields', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(null);
      mockPrisma.content.create.mockResolvedValue(fakeContent());

      await createContent(
        { slug: 'defaults', type: 'lesson', title: 'Defaults' },
        'user-1'
      );

      const createCall = mockPrisma.content.create.mock.calls[0][0];
      expect(createCall.data.emoji).toBe('');
      expect(createCall.data.description).toBe('');
      expect(createCall.data.accessTier).toBe('free');
      expect(createCall.data.ageGroup).toBe('all');
      expect(createCall.data.bedtimeFriendly).toBe(false);
      expect(createCall.data.language).toBe('en');
    });
  });

  // ── updateContent ────────────────────────────────────────

  describe('updateContent', () => {
    it('should throw NotFoundError when content does not exist', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(null);

      await expect(updateContent('missing', { title: 'New' })).rejects.toThrow(
        NotFoundError
      );
    });

    it('should validate valid status transitions', async () => {
      const existing = fakeContent({ status: 'draft' });
      mockPrisma.content.findUnique.mockResolvedValue(existing);
      mockPrisma.content.update.mockResolvedValue({ ...existing, status: 'review' });

      const result = await updateContent('content-1', { status: 'review' });

      expect(result.status).toBe('review');
    });

    it('should reject invalid status transitions', async () => {
      const existing = fakeContent({ status: 'draft' });
      mockPrisma.content.findUnique.mockResolvedValue(existing);

      await expect(
        updateContent('content-1', { status: 'published' })
      ).rejects.toThrow(ValidationError);
    });

    it('should increment version on every update', async () => {
      const existing = fakeContent({ version: 3 });
      mockPrisma.content.findUnique.mockResolvedValue(existing);
      mockPrisma.content.update.mockResolvedValue({ ...existing, version: 4 });

      await updateContent('content-1', { title: 'Updated' });

      const updateCall = mockPrisma.content.update.mock.calls[0][0];
      expect(updateCall.data.version).toEqual({ increment: 1 });
    });

    it('should check slug uniqueness when slug is changing', async () => {
      const existing = fakeContent({ slug: 'old-slug' });
      mockPrisma.content.findUnique
        .mockResolvedValueOnce(existing) // first call: find existing content
        .mockResolvedValueOnce(fakeContent({ slug: 'taken-slug' })); // second call: slug taken

      await expect(
        updateContent('content-1', { slug: 'taken-slug' })
      ).rejects.toThrow(ConflictError);
    });

    it('should set publishedAt on first publish', async () => {
      const existing = fakeContent({ status: 'approved', publishedAt: null });
      mockPrisma.content.findUnique.mockResolvedValue(existing);
      mockPrisma.content.update.mockResolvedValue({ ...existing, status: 'published' });

      await updateContent('content-1', { status: 'published' });

      const updateCall = mockPrisma.content.update.mock.calls[0][0];
      expect(updateCall.data.publishedAt).toBeInstanceOf(Date);
    });

    it('should set archivedAt when status changes to archived', async () => {
      const existing = fakeContent({ status: 'draft' });
      mockPrisma.content.findUnique.mockResolvedValue(existing);
      mockPrisma.content.update.mockResolvedValue({ ...existing, status: 'archived' });

      await updateContent('content-1', { status: 'archived' });

      const updateCall = mockPrisma.content.update.mock.calls[0][0];
      expect(updateCall.data.archivedAt).toBeInstanceOf(Date);
    });

    it('should replace skills when skills are provided', async () => {
      const existing = fakeContent();
      mockPrisma.content.findUnique.mockResolvedValue(existing);
      mockPrisma.contentSkill.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.contentSkill.createMany.mockResolvedValue({ count: 2 });
      mockPrisma.content.update.mockResolvedValue(existing);

      await updateContent('content-1', {
        skills: [
          { skillId: 's1', relevance: 0.9 },
          { skillId: 's2', relevance: 0.5 },
        ],
      });

      expect(mockPrisma.contentSkill.deleteMany).toHaveBeenCalledWith({
        where: { contentId: 'content-1' },
      });
      expect(mockPrisma.contentSkill.createMany).toHaveBeenCalledWith({
        data: [
          { contentId: 'content-1', skillId: 's1', relevance: 0.9 },
          { contentId: 'content-1', skillId: 's2', relevance: 0.5 },
        ],
        skipDuplicates: true,
      });
    });
  });

  // ── Status Transition Map ────────────────────────────────

  describe('VALID_TRANSITIONS enforcement', () => {
    const transitionTests: Array<{ from: string; to: string; valid: boolean }> = [
      { from: 'draft', to: 'review', valid: true },
      { from: 'draft', to: 'archived', valid: true },
      { from: 'draft', to: 'published', valid: false },
      { from: 'draft', to: 'scheduled', valid: false },
      { from: 'review', to: 'draft', valid: true },
      { from: 'review', to: 'approved', valid: true },
      { from: 'review', to: 'archived', valid: true },
      { from: 'review', to: 'published', valid: false },
      { from: 'approved', to: 'scheduled', valid: true },
      { from: 'approved', to: 'published', valid: true },
      { from: 'approved', to: 'draft', valid: true },
      { from: 'approved', to: 'archived', valid: true },
      { from: 'scheduled', to: 'approved', valid: true },
      { from: 'scheduled', to: 'published', valid: true },
      { from: 'scheduled', to: 'archived', valid: true },
      { from: 'scheduled', to: 'draft', valid: false },
      { from: 'published', to: 'archived', valid: true },
      { from: 'published', to: 'draft', valid: true },
      { from: 'published', to: 'review', valid: false },
      { from: 'archived', to: 'draft', valid: true },
      { from: 'archived', to: 'published', valid: false },
    ];

    for (const { from, to, valid } of transitionTests) {
      it(`should ${valid ? 'allow' : 'reject'} transition ${from} -> ${to}`, async () => {
        const existing = fakeContent({ status: from });
        mockPrisma.content.findUnique.mockResolvedValue(existing);

        if (valid) {
          mockPrisma.content.update.mockResolvedValue({ ...existing, status: to });
          await expect(updateContent('content-1', { status: to })).resolves.toBeDefined();
        } else {
          await expect(updateContent('content-1', { status: to })).rejects.toThrow(
            ValidationError
          );
        }
      });
    }
  });

  // ── archiveContent ───────────────────────────────────────

  describe('archiveContent', () => {
    it('should set status to archived', async () => {
      const existing = fakeContent({ status: 'published' });
      mockPrisma.content.findUnique.mockResolvedValue(existing);
      mockPrisma.content.update.mockResolvedValue({
        id: 'content-1',
        slug: 'test-content',
        status: 'archived',
      });

      const result = await archiveContent('content-1');

      expect(result.status).toBe('archived');
      expect(mockPrisma.content.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'archived',
            version: { increment: 1 },
          }),
        })
      );
    });

    it('should throw NotFoundError when content does not exist', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(null);

      await expect(archiveContent('missing')).rejects.toThrow(NotFoundError);
    });
  });

  // ── addTags ──────────────────────────────────────────────

  describe('addTags', () => {
    it('should add tags idempotently with skipDuplicates', async () => {
      mockPrisma.content.findUnique
        .mockResolvedValueOnce(fakeContent())  // verify content exists
        .mockResolvedValueOnce(fakeContent({ tags: [{ tag: { id: 'tag-1' } }] })); // return updated
      mockPrisma.tag.findMany.mockResolvedValue([
        { id: 'tag-1', name: 'Fun' },
        { id: 'tag-2', name: 'Learning' },
      ]);
      mockPrisma.contentTag.createMany.mockResolvedValue({ count: 2 });

      await addTags('content-1', ['tag-1', 'tag-2']);

      expect(mockPrisma.contentTag.createMany).toHaveBeenCalledWith({
        data: [
          { contentId: 'content-1', tagId: 'tag-1' },
          { contentId: 'content-1', tagId: 'tag-2' },
        ],
        skipDuplicates: true,
      });
    });

    it('should throw NotFoundError when content does not exist', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(null);

      await expect(addTags('missing', ['tag-1'])).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when some tags do not exist', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(fakeContent());
      mockPrisma.tag.findMany.mockResolvedValue([{ id: 'tag-1', name: 'Fun' }]);

      await expect(addTags('content-1', ['tag-1', 'tag-missing'])).rejects.toThrow(
        NotFoundError
      );
    });
  });

  // ── removeTag ────────────────────────────────────────────

  describe('removeTag', () => {
    it('should remove tag and return confirmation', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(fakeContent());
      mockPrisma.contentTag.findUnique.mockResolvedValue({
        contentId: 'content-1',
        tagId: 'tag-1',
      });
      mockPrisma.contentTag.delete.mockResolvedValue({});

      const result = await removeTag('content-1', 'tag-1');

      expect(result).toEqual({
        contentId: 'content-1',
        tagId: 'tag-1',
        removed: true,
      });
    });

    it('should throw NotFoundError when content does not exist', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(null);

      await expect(removeTag('missing', 'tag-1')).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when content-tag relation does not exist', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(fakeContent());
      mockPrisma.contentTag.findUnique.mockResolvedValue(null);

      await expect(removeTag('content-1', 'tag-1')).rejects.toThrow(NotFoundError);
    });
  });

  // ── duplicateContent ─────────────────────────────────────

  describe('duplicateContent', () => {
    it('should copy content with a new slug and draft status', async () => {
      const original = fakeContent({
        tags: [{ tagId: 'tag-1' }],
        status: 'published',
      });
      mockPrisma.content.findUnique
        .mockResolvedValueOnce(original) // find original
        .mockResolvedValueOnce(null);    // slug available
      mockPrisma.content.create.mockResolvedValue(
        fakeContent({ id: 'dup-1', slug: 'test-content-copy', status: 'draft' })
      );

      const result = await duplicateContent('content-1', {}, 'user-2');

      expect(result.status).toBe('draft');
      expect(result.slug).toBe('test-content-copy');
      const createCall = mockPrisma.content.create.mock.calls[0][0];
      expect(createCall.data.status).toBe('draft');
    });

    it('should use newSlug when provided', async () => {
      const original = fakeContent({ tags: [] });
      mockPrisma.content.findUnique
        .mockResolvedValueOnce(original)
        .mockResolvedValueOnce(null); // slug available
      mockPrisma.content.create.mockResolvedValue(
        fakeContent({ slug: 'custom-slug' })
      );

      await duplicateContent('content-1', { newSlug: 'custom-slug' }, 'user-2');

      const createCall = mockPrisma.content.create.mock.calls[0][0];
      expect(createCall.data.slug).toBe('custom-slug');
    });

    it('should use newTitle when provided', async () => {
      const original = fakeContent({ tags: [] });
      mockPrisma.content.findUnique
        .mockResolvedValueOnce(original)
        .mockResolvedValueOnce(null);
      mockPrisma.content.create.mockResolvedValue(fakeContent());

      await duplicateContent('content-1', { newTitle: 'My Copy' }, 'user-2');

      const createCall = mockPrisma.content.create.mock.calls[0][0];
      expect(createCall.data.title).toBe('My Copy');
    });

    it('should throw NotFoundError when original does not exist', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(null);

      await expect(
        duplicateContent('missing', {}, 'user-1')
      ).rejects.toThrow(NotFoundError);
    });

    it('should retry slug generation on collision', async () => {
      const original = fakeContent({ tags: [] });
      mockPrisma.content.findUnique
        .mockResolvedValueOnce(original)       // find original
        .mockResolvedValueOnce({ id: 'x' })    // slug collision
        .mockResolvedValueOnce(null);           // slug available after counter
      mockPrisma.content.create.mockResolvedValue(
        fakeContent({ slug: 'test-content-copy-1' })
      );

      const result = await duplicateContent('content-1', {}, 'user-2');

      expect(result).toBeDefined();
    });
  });

  // ── addSkills ────────────────────────────────────────────

  describe('addSkills', () => {
    it('should add skills with relevance scores', async () => {
      mockPrisma.content.findUnique
        .mockResolvedValueOnce(fakeContent())
        .mockResolvedValueOnce(fakeContent({ skills: [] }));
      mockPrisma.skill.findMany.mockResolvedValue([
        { id: 'skill-1' },
        { id: 'skill-2' },
      ]);
      mockPrisma.contentSkill.createMany.mockResolvedValue({ count: 2 });

      await addSkills('content-1', [
        { skillId: 'skill-1', relevance: 0.9 },
        { skillId: 'skill-2', relevance: 0.5 },
      ]);

      expect(mockPrisma.contentSkill.createMany).toHaveBeenCalledWith({
        data: [
          { contentId: 'content-1', skillId: 'skill-1', relevance: 0.9 },
          { contentId: 'content-1', skillId: 'skill-2', relevance: 0.5 },
        ],
        skipDuplicates: true,
      });
    });

    it('should throw NotFoundError when content does not exist', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(null);

      await expect(
        addSkills('missing', [{ skillId: 's1', relevance: 1 }])
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when some skills do not exist', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(fakeContent());
      mockPrisma.skill.findMany.mockResolvedValue([{ id: 'skill-1' }]);

      await expect(
        addSkills('content-1', [
          { skillId: 'skill-1', relevance: 0.9 },
          { skillId: 'skill-missing', relevance: 0.5 },
        ])
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ── bulkUpdateStatus ─────────────────────────────────────

  describe('bulkUpdateStatus', () => {
    it('should validate all transitions and update status', async () => {
      const contents = [
        { id: 'c1', status: 'draft' },
        { id: 'c2', status: 'draft' },
      ];
      mockPrisma.content.findMany.mockResolvedValue(contents);
      mockPrisma.content.updateMany.mockResolvedValue({ count: 2 });

      const result = await bulkUpdateStatus(['c1', 'c2'], 'review' as any);

      expect(result.updated).toBe(2);
    });

    it('should throw NotFoundError when some content IDs are missing', async () => {
      mockPrisma.content.findMany.mockResolvedValue([{ id: 'c1', status: 'draft' }]);

      await expect(
        bulkUpdateStatus(['c1', 'c2'], 'review' as any)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError when any transition is invalid', async () => {
      const contents = [
        { id: 'c1', status: 'draft' },
        { id: 'c2', status: 'published' },
      ];
      mockPrisma.content.findMany.mockResolvedValue(contents);

      // draft -> review is valid, but published -> review is not
      await expect(
        bulkUpdateStatus(['c1', 'c2'], 'review' as any)
      ).rejects.toThrow(ValidationError);
    });

    it('should set publishedAt when bulk updating to published', async () => {
      const contents = [
        { id: 'c1', status: 'approved' },
      ];
      mockPrisma.content.findMany.mockResolvedValue(contents);
      mockPrisma.content.updateMany.mockResolvedValue({ count: 1 });

      await bulkUpdateStatus(['c1'], 'published' as any);

      const updateCall = mockPrisma.content.updateMany.mock.calls[0][0];
      expect(updateCall.data.publishedAt).toBeInstanceOf(Date);
    });
  });
});
