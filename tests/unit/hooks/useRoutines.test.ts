import { renderHook, act } from '@testing-library/react';
import { useRoutines } from '../../../src/hooks/useRoutines';

const mocks = vi.hoisted(() => ({
  mockPlayerId: 1 as number | undefined,
  mockRoutines: [] as unknown[],
  mockRoutinesAdd: vi.fn(),
  mockRoutinesUpdate: vi.fn(),
  mockRoutinesDelete: vi.fn(),
}));

vi.mock('../../../src/context/AppContext', () => ({
  useApp: () => ({
    currentPlayer: mocks.mockPlayerId ? { id: mocks.mockPlayerId } : null,
  }),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => mocks.mockRoutines,
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    routines: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve(mocks.mockRoutines)),
        })),
      })),
      add: mocks.mockRoutinesAdd,
      update: mocks.mockRoutinesUpdate,
      delete: mocks.mockRoutinesDelete,
    },
  },
}));

describe('useRoutines', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockPlayerId = 1;
    mocks.mockRoutines = [];
  });

  describe('templates', () => {
    it('defines exactly 5 templates', () => {
      const { result } = renderHook(() => useRoutines());
      expect(result.current.templates).toHaveLength(5);
    });

    it('includes Morning Learner template', () => {
      const { result } = renderHook(() => useRoutines());
      const template = result.current.templates.find((t) => t.name === 'Morning Learner');
      expect(template).toBeDefined();
      expect(template!.type).toBe('morning');
      expect(template!.items.length).toBeGreaterThan(0);
    });

    it('includes After-School Fun template', () => {
      const { result } = renderHook(() => useRoutines());
      const template = result.current.templates.find((t) => t.name === 'After-School Fun');
      expect(template).toBeDefined();
      expect(template!.type).toBe('after_school');
    });

    it('includes Bedtime Wind Down template', () => {
      const { result } = renderHook(() => useRoutines());
      const template = result.current.templates.find((t) => t.name === 'Bedtime Wind Down');
      expect(template).toBeDefined();
      expect(template!.type).toBe('bedtime');
    });

    it('includes Weekend Explorer template', () => {
      const { result } = renderHook(() => useRoutines());
      const template = result.current.templates.find((t) => t.name === 'Weekend Explorer');
      expect(template).toBeDefined();
      expect(template!.type).toBe('weekend');
    });

    it('includes Travel Buddy template', () => {
      const { result } = renderHook(() => useRoutines());
      const template = result.current.templates.find((t) => t.name === 'Travel Buddy');
      expect(template).toBeDefined();
      expect(template!.type).toBe('travel');
    });

    it('all templates have estimatedMinutes > 0', () => {
      const { result } = renderHook(() => useRoutines());
      result.current.templates.forEach((template) => {
        expect(template.estimatedMinutes).toBeGreaterThan(0);
      });
    });

    it('all templates have emoji property', () => {
      const { result } = renderHook(() => useRoutines());
      result.current.templates.forEach((template) => {
        expect(template.emoji).toBeTruthy();
      });
    });

    it('all template items have required fields', () => {
      const { result } = renderHook(() => useRoutines());
      result.current.templates.forEach((template) => {
        template.items.forEach((item) => {
          expect(item.contentId).toBeTruthy();
          expect(item.title).toBeTruthy();
          expect(item.emoji).toBeTruthy();
          expect(item.durationMinutes).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('createRoutine', () => {
    it('adds routine to DB with timestamps', async () => {
      const { result } = renderHook(() => useRoutines());

      const routineData = {
        name: 'My Custom Routine',
        type: 'custom' as const,
        days: ['Mon', 'Wed', 'Fri'],
        time: '10:00',
        estimatedMinutes: 30,
        items: [
          { contentId: 'abc-practice', title: 'ABC', emoji: '📝', durationMinutes: 15 },
        ],
      };

      await act(async () => {
        await result.current.createRoutine(routineData);
      });

      expect(mocks.mockRoutinesAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          name: 'My Custom Routine',
          type: 'custom',
          days: ['Mon', 'Wed', 'Fri'],
          time: '10:00',
          estimatedMinutes: 30,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
    });

    it('sets createdAt and updatedAt to same value', async () => {
      const { result } = renderHook(() => useRoutines());

      await act(async () => {
        await result.current.createRoutine({
          name: 'Test',
          type: 'morning' as const,
          days: ['Mon'],
          time: '08:00',
          estimatedMinutes: 15,
          items: [],
        });
      });

      const callArgs = mocks.mockRoutinesAdd.mock.calls[0][0];
      expect(callArgs.createdAt).toEqual(callArgs.updatedAt);
    });

    it('does nothing when no player is set', async () => {
      mocks.mockPlayerId = undefined;
      const { result } = renderHook(() => useRoutines());

      await act(async () => {
        await result.current.createRoutine({
          name: 'Test',
          type: 'morning' as const,
          days: ['Mon'],
          time: '08:00',
          estimatedMinutes: 15,
          items: [],
        });
      });

      expect(mocks.mockRoutinesAdd).not.toHaveBeenCalled();
    });
  });

  describe('deleteRoutine', () => {
    it('removes routine from DB', async () => {
      const { result } = renderHook(() => useRoutines());

      await act(async () => {
        await result.current.deleteRoutine(42);
      });

      expect(mocks.mockRoutinesDelete).toHaveBeenCalledWith(42);
    });
  });

  describe('updateRoutine', () => {
    it('updates specific fields in DB', async () => {
      const { result } = renderHook(() => useRoutines());

      await act(async () => {
        await result.current.updateRoutine(42, { name: 'Updated Name' });
      });

      expect(mocks.mockRoutinesUpdate).toHaveBeenCalledWith(
        42,
        expect.objectContaining({
          name: 'Updated Name',
          updatedAt: expect.any(Date),
        })
      );
    });

    it('always sets updatedAt when updating', async () => {
      const { result } = renderHook(() => useRoutines());

      await act(async () => {
        await result.current.updateRoutine(1, { time: '14:00' });
      });

      const callArgs = mocks.mockRoutinesUpdate.mock.calls[0][1];
      expect(callArgs.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('createFromTemplate', () => {
    it('creates routine with Mon-Fri defaults', async () => {
      const { result } = renderHook(() => useRoutines());
      const template = result.current.templates[0]; // Morning Learner

      await act(async () => {
        await result.current.createFromTemplate(template);
      });

      expect(mocks.mockRoutinesAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          time: '09:00',
        })
      );
    });

    it('uses template name and type', async () => {
      const { result } = renderHook(() => useRoutines());
      const template = result.current.templates.find((t) => t.name === 'Bedtime Wind Down')!;

      await act(async () => {
        await result.current.createFromTemplate(template);
      });

      expect(mocks.mockRoutinesAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Bedtime Wind Down',
          type: 'bedtime',
        })
      );
    });

    it('uses template items and estimatedMinutes', async () => {
      const { result } = renderHook(() => useRoutines());
      const template = result.current.templates.find((t) => t.name === 'Weekend Explorer')!;

      await act(async () => {
        await result.current.createFromTemplate(template);
      });

      expect(mocks.mockRoutinesAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          items: template.items,
          estimatedMinutes: template.estimatedMinutes,
        })
      );
    });

    it('sets timestamps', async () => {
      const { result } = renderHook(() => useRoutines());
      const template = result.current.templates[0];

      await act(async () => {
        await result.current.createFromTemplate(template);
      });

      const callArgs = mocks.mockRoutinesAdd.mock.calls[0][0];
      expect(callArgs.createdAt).toBeInstanceOf(Date);
      expect(callArgs.updatedAt).toBeInstanceOf(Date);
      expect(callArgs.createdAt).toEqual(callArgs.updatedAt);
    });

    it('does nothing when no player is set', async () => {
      mocks.mockPlayerId = undefined;
      const { result } = renderHook(() => useRoutines());
      const template = result.current.templates[0];

      await act(async () => {
        await result.current.createFromTemplate(template);
      });

      expect(mocks.mockRoutinesAdd).not.toHaveBeenCalled();
    });
  });

  describe('routines list', () => {
    it('returns empty array when no routines', () => {
      const { result } = renderHook(() => useRoutines());
      expect(result.current.routines).toEqual([]);
    });

    it('returns mock routines from DB', () => {
      mocks.mockRoutines = [
        { id: 1, playerId: 1, name: 'Morning', type: 'morning' },
        { id: 2, playerId: 1, name: 'Evening', type: 'bedtime' },
      ];

      const { result } = renderHook(() => useRoutines());
      expect(result.current.routines).toHaveLength(2);
    });
  });
});
