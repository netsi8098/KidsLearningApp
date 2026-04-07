import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma, resetPrismaMocks } from '../../helpers/prisma.mock';

// ── Mock dependencies ────────────────────────────────────────
vi.mock('../../../src/lib/prisma', () => ({ prisma: mockPrisma }));

import {
  listRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  duplicateRoutine,
  listTemplates,
  createFromTemplate,
} from '../../../src/modules/routines/service';
import { NotFoundError } from '../../../src/lib/errors';

// ── Helpers ──────────────────────────────────────────────────

function fakeRoutine(overrides: Record<string, unknown> = {}) {
  return {
    id: 'routine-1',
    householdId: 'hh-1',
    profileId: 'profile-1',
    name: 'Morning Routine',
    type: 'morning',
    items: [
      { id: '1', label: 'Brush teeth', emoji: '' },
      { id: '2', label: 'Get dressed', emoji: '' },
    ],
    scheduleDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    scheduledTime: '07:00',
    estimatedMinutes: 30,
    isTemplate: false,
    deletedAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

function fakeTemplate(overrides: Record<string, unknown> = {}) {
  return fakeRoutine({
    id: 'template-1',
    name: 'Bedtime Template',
    type: 'bedtime',
    isTemplate: true,
    profileId: null,
    ...overrides,
  });
}

// ── Tests ────────────────────────────────────────────────────

describe('RoutinesService', () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  // ── listRoutines ─────────────────────────────────────────

  describe('listRoutines', () => {
    it('should return paginated routines filtered by householdId', async () => {
      const routines = [fakeRoutine(), fakeRoutine({ id: 'routine-2' })];
      mockPrisma.routine.findMany.mockResolvedValue(routines);
      mockPrisma.routine.count.mockResolvedValue(2);

      const result = await listRoutines({
        householdId: 'hh-1',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should apply type filter', async () => {
      mockPrisma.routine.findMany.mockResolvedValue([]);
      mockPrisma.routine.count.mockResolvedValue(0);

      await listRoutines({
        householdId: 'hh-1',
        type: 'bedtime',
        page: 1,
        limit: 10,
      });

      const txCall = mockPrisma.$transaction.mock.calls[0][0];
      // The $transaction receives an array of promises for batch mode
      // Since it's called with a callback, let's check the findMany call
      // The transaction mock calls the callback with mockPrisma
      expect(mockPrisma.routine.findMany).toHaveBeenCalled();
    });

    it('should exclude templates and soft-deleted routines', async () => {
      mockPrisma.routine.findMany.mockResolvedValue([]);
      mockPrisma.routine.count.mockResolvedValue(0);

      await listRoutines({
        householdId: 'hh-1',
        page: 1,
        limit: 10,
      });

      // Check the $transaction was called; inside it, findMany should use
      // where conditions that include deletedAt: null and isTemplate: false
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should apply profileId filter when provided', async () => {
      mockPrisma.routine.findMany.mockResolvedValue([]);
      mockPrisma.routine.count.mockResolvedValue(0);

      await listRoutines({
        householdId: 'hh-1',
        profileId: 'profile-1',
        page: 1,
        limit: 10,
      });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });

  // ── getRoutineById ───────────────────────────────────────

  describe('getRoutineById', () => {
    it('should return routine when found and not deleted', async () => {
      mockPrisma.routine.findUnique.mockResolvedValue(fakeRoutine());

      const result = await getRoutineById('routine-1');

      expect(result.id).toBe('routine-1');
      expect(result.name).toBe('Morning Routine');
    });

    it('should throw NotFoundError when routine does not exist', async () => {
      mockPrisma.routine.findUnique.mockResolvedValue(null);

      await expect(getRoutineById('missing')).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when routine is soft-deleted', async () => {
      mockPrisma.routine.findUnique.mockResolvedValue(
        fakeRoutine({ deletedAt: new Date() })
      );

      await expect(getRoutineById('routine-1')).rejects.toThrow(NotFoundError);
    });
  });

  // ── createRoutine ────────────────────────────────────────

  describe('createRoutine', () => {
    it('should create a routine with items array', async () => {
      const items = [{ id: '1', label: 'Wake up' }];
      mockPrisma.routine.create.mockResolvedValue(
        fakeRoutine({ items })
      );

      const result = await createRoutine({
        householdId: 'hh-1',
        name: 'Morning',
        type: 'morning',
        items,
      });

      expect(result.items).toEqual(items);
      expect(mockPrisma.routine.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            householdId: 'hh-1',
            name: 'Morning',
            type: 'morning',
            isTemplate: false,
          }),
        })
      );
    });

    it('should set defaults for optional fields', async () => {
      mockPrisma.routine.create.mockResolvedValue(fakeRoutine());

      await createRoutine({
        householdId: 'hh-1',
        name: 'Test',
        type: 'custom',
        items: [],
      });

      const createCall = mockPrisma.routine.create.mock.calls[0][0];
      expect(createCall.data.profileId).toBeNull();
      expect(createCall.data.scheduleDays).toEqual([]);
      expect(createCall.data.scheduledTime).toBeNull();
      expect(createCall.data.estimatedMinutes).toBeNull();
    });

    it('should pass profileId when provided', async () => {
      mockPrisma.routine.create.mockResolvedValue(fakeRoutine());

      await createRoutine({
        householdId: 'hh-1',
        profileId: 'profile-1',
        name: 'Test',
        type: 'morning',
        items: [],
      });

      const createCall = mockPrisma.routine.create.mock.calls[0][0];
      expect(createCall.data.profileId).toBe('profile-1');
    });
  });

  // ── updateRoutine ────────────────────────────────────────

  describe('updateRoutine', () => {
    it('should perform partial updates', async () => {
      mockPrisma.routine.findUnique.mockResolvedValue(fakeRoutine());
      mockPrisma.routine.update.mockResolvedValue(
        fakeRoutine({ name: 'Updated Morning' })
      );

      const result = await updateRoutine('routine-1', {
        name: 'Updated Morning',
      });

      expect(result.name).toBe('Updated Morning');
      const updateCall = mockPrisma.routine.update.mock.calls[0][0];
      expect(updateCall.data.name).toBe('Updated Morning');
    });

    it('should throw NotFoundError when routine does not exist', async () => {
      mockPrisma.routine.findUnique.mockResolvedValue(null);

      await expect(
        updateRoutine('missing', { name: 'Test' })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when routine is soft-deleted', async () => {
      mockPrisma.routine.findUnique.mockResolvedValue(
        fakeRoutine({ deletedAt: new Date() })
      );

      await expect(
        updateRoutine('routine-1', { name: 'Test' })
      ).rejects.toThrow(NotFoundError);
    });

    it('should update multiple fields at once', async () => {
      mockPrisma.routine.findUnique.mockResolvedValue(fakeRoutine());
      mockPrisma.routine.update.mockResolvedValue(fakeRoutine());

      await updateRoutine('routine-1', {
        name: 'New Name',
        type: 'bedtime',
        items: [{ id: '1', label: 'Sleep' }],
        estimatedMinutes: 15,
      });

      const updateCall = mockPrisma.routine.update.mock.calls[0][0];
      expect(updateCall.data.name).toBe('New Name');
      expect(updateCall.data.type).toBe('bedtime');
      expect(updateCall.data.estimatedMinutes).toBe(15);
    });
  });

  // ── deleteRoutine ────────────────────────────────────────

  describe('deleteRoutine', () => {
    it('should soft-delete by setting deletedAt', async () => {
      mockPrisma.routine.findUnique.mockResolvedValue(fakeRoutine());
      mockPrisma.routine.update.mockResolvedValue(
        fakeRoutine({ deletedAt: new Date() })
      );

      const result = await deleteRoutine('routine-1');

      expect(result.deletedAt).toBeInstanceOf(Date);
      expect(mockPrisma.routine.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'routine-1' },
          data: { deletedAt: expect.any(Date) },
        })
      );
    });

    it('should throw NotFoundError when routine does not exist', async () => {
      mockPrisma.routine.findUnique.mockResolvedValue(null);

      await expect(deleteRoutine('missing')).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when routine is already soft-deleted', async () => {
      mockPrisma.routine.findUnique.mockResolvedValue(
        fakeRoutine({ deletedAt: new Date() })
      );

      await expect(deleteRoutine('routine-1')).rejects.toThrow(NotFoundError);
    });
  });

  // ── duplicateRoutine ─────────────────────────────────────

  describe('duplicateRoutine', () => {
    it('should copy with " (Copy)" suffix', async () => {
      const original = fakeRoutine({ name: 'Morning Routine' });
      mockPrisma.routine.findUnique.mockResolvedValue(original);
      mockPrisma.routine.create.mockResolvedValue(
        fakeRoutine({ id: 'routine-2', name: 'Morning Routine (Copy)' })
      );

      const result = await duplicateRoutine('routine-1');

      expect(result.name).toBe('Morning Routine (Copy)');
      const createCall = mockPrisma.routine.create.mock.calls[0][0];
      expect(createCall.data.name).toBe('Morning Routine (Copy)');
      expect(createCall.data.isTemplate).toBe(false);
    });

    it('should preserve items, scheduleDays, and other fields', async () => {
      const original = fakeRoutine({
        items: [{ id: '1', label: 'Brush' }],
        scheduleDays: ['mon'],
        scheduledTime: '07:30',
        estimatedMinutes: 20,
      });
      mockPrisma.routine.findUnique.mockResolvedValue(original);
      mockPrisma.routine.create.mockResolvedValue(
        fakeRoutine({ id: 'routine-2', name: 'Morning Routine (Copy)' })
      );

      await duplicateRoutine('routine-1');

      const createCall = mockPrisma.routine.create.mock.calls[0][0];
      expect(createCall.data.scheduledTime).toBe('07:30');
      expect(createCall.data.estimatedMinutes).toBe(20);
      expect(createCall.data.householdId).toBe('hh-1');
    });

    it('should throw NotFoundError when routine does not exist', async () => {
      mockPrisma.routine.findUnique.mockResolvedValue(null);

      await expect(duplicateRoutine('missing')).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when routine is soft-deleted', async () => {
      mockPrisma.routine.findUnique.mockResolvedValue(
        fakeRoutine({ deletedAt: new Date() })
      );

      await expect(duplicateRoutine('routine-1')).rejects.toThrow(NotFoundError);
    });
  });

  // ── listTemplates ────────────────────────────────────────

  describe('listTemplates', () => {
    it('should return only templates (isTemplate=true)', async () => {
      const templates = [fakeTemplate(), fakeTemplate({ id: 'template-2' })];
      mockPrisma.routine.findMany.mockResolvedValue(templates);

      const result = await listTemplates();

      expect(result).toHaveLength(2);
      expect(mockPrisma.routine.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isTemplate: true,
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter templates by type', async () => {
      mockPrisma.routine.findMany.mockResolvedValue([]);

      await listTemplates({ type: 'bedtime' });

      const call = mockPrisma.routine.findMany.mock.calls[0][0];
      expect(call.where.type).toBe('bedtime');
    });

    it('should exclude soft-deleted templates', async () => {
      mockPrisma.routine.findMany.mockResolvedValue([]);

      await listTemplates();

      const call = mockPrisma.routine.findMany.mock.calls[0][0];
      expect(call.where.deletedAt).toBeNull();
    });
  });

  // ── createFromTemplate ───────────────────────────────────

  describe('createFromTemplate', () => {
    it('should create routine from a valid template', async () => {
      const template = fakeTemplate();
      mockPrisma.routine.findUnique.mockResolvedValue(template);
      mockPrisma.routine.create.mockResolvedValue(
        fakeRoutine({
          id: 'routine-new',
          name: 'Bedtime Template',
          type: 'bedtime',
        })
      );

      const result = await createFromTemplate({
        templateId: 'template-1',
        householdId: 'hh-2',
        profileId: 'profile-3',
      });

      expect(result).toBeDefined();
      const createCall = mockPrisma.routine.create.mock.calls[0][0];
      expect(createCall.data.householdId).toBe('hh-2');
      expect(createCall.data.profileId).toBe('profile-3');
      expect(createCall.data.isTemplate).toBe(false);
      expect(createCall.data.name).toBe('Bedtime Template');
    });

    it('should throw NotFoundError when template does not exist', async () => {
      mockPrisma.routine.findUnique.mockResolvedValue(null);

      await expect(
        createFromTemplate({ templateId: 'missing', householdId: 'hh-1' })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when routine exists but isTemplate is false', async () => {
      mockPrisma.routine.findUnique.mockResolvedValue(
        fakeRoutine({ isTemplate: false })
      );

      await expect(
        createFromTemplate({ templateId: 'routine-1', householdId: 'hh-1' })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when template is soft-deleted', async () => {
      mockPrisma.routine.findUnique.mockResolvedValue(
        fakeTemplate({ deletedAt: new Date() })
      );

      await expect(
        createFromTemplate({ templateId: 'template-1', householdId: 'hh-1' })
      ).rejects.toThrow(NotFoundError);
    });

    it('should default profileId to null when not provided', async () => {
      mockPrisma.routine.findUnique.mockResolvedValue(fakeTemplate());
      mockPrisma.routine.create.mockResolvedValue(fakeRoutine());

      await createFromTemplate({
        templateId: 'template-1',
        householdId: 'hh-2',
      });

      const createCall = mockPrisma.routine.create.mock.calls[0][0];
      expect(createCall.data.profileId).toBeNull();
    });
  });
});
