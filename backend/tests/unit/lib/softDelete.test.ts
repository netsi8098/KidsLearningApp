import { softDeleteMiddleware } from '../../../src/lib/softDelete';

describe('softDeleteMiddleware', () => {
  const middleware = softDeleteMiddleware();

  // Helper to create a mock next function that returns the (possibly modified) params
  function createNext() {
    return vi.fn((params) => params);
  }

  describe('findMany on soft-delete models', () => {
    it('should add deletedAt: null filter when no where clause exists', async () => {
      const next = createNext();
      const params = {
        model: 'Content',
        action: 'findMany',
        args: {},
      };

      await middleware(params as any, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          args: { where: { deletedAt: null } },
        })
      );
    });

    it('should add deletedAt: null filter to existing where clause', async () => {
      const next = createNext();
      const params = {
        model: 'Content',
        action: 'findMany',
        args: { where: { status: 'published' } },
      };

      await middleware(params as any, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          args: { where: { status: 'published', deletedAt: null } },
        })
      );
    });

    it('should not override an explicit deletedAt filter', async () => {
      const next = createNext();
      const params = {
        model: 'Content',
        action: 'findMany',
        args: { where: { deletedAt: { not: null } } },
      };

      await middleware(params as any, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          args: { where: { deletedAt: { not: null } } },
        })
      );
    });

    it('should handle missing args by initializing them', async () => {
      const next = createNext();
      const params = {
        model: 'Content',
        action: 'findMany',
        args: undefined as unknown,
      };

      await middleware(params as any, next);

      expect(params.args).toEqual({ where: { deletedAt: null } });
    });
  });

  describe('findFirst on soft-delete models', () => {
    it('should add deletedAt: null filter for findFirst', async () => {
      const next = createNext();
      const params = {
        model: 'Asset',
        action: 'findFirst',
        args: { where: { type: 'image' } },
      };

      await middleware(params as any, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          args: { where: { type: 'image', deletedAt: null } },
        })
      );
    });
  });

  describe('count on soft-delete models', () => {
    it('should add deletedAt: null filter for count', async () => {
      const next = createNext();
      const params = {
        model: 'Collection',
        action: 'count',
        args: {},
      };

      await middleware(params as any, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          args: { where: { deletedAt: null } },
        })
      );
    });
  });

  describe('delete conversion to soft delete', () => {
    it('should convert delete to update with deletedAt timestamp', async () => {
      const next = createNext();
      const params = {
        model: 'Content',
        action: 'delete' as string,
        args: { where: { id: 'content-123' } },
      };

      const before = new Date();
      await middleware(params as any, next);
      const after = new Date();

      expect(params.action).toBe('update');
      expect(params.args.data).toBeDefined();
      expect(params.args.data.deletedAt).toBeInstanceOf(Date);
      expect(params.args.data.deletedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(params.args.data.deletedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should initialize args when delete has no args', async () => {
      const next = createNext();
      const params = {
        model: 'Tag',
        action: 'delete' as string,
        args: undefined as unknown,
      };

      await middleware(params as any, next);

      expect(params.action).toBe('update');
      expect((params.args as any).data.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('deleteMany conversion to soft delete', () => {
    it('should convert deleteMany to updateMany with deletedAt timestamp', async () => {
      const next = createNext();
      const params = {
        model: 'Household',
        action: 'deleteMany' as string,
        args: { where: { region: 'us' } },
      };

      const before = new Date();
      await middleware(params as any, next);
      const after = new Date();

      expect(params.action).toBe('updateMany');
      expect(params.args.data.deletedAt).toBeInstanceOf(Date);
      expect(params.args.data.deletedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(params.args.data.deletedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('models not in the soft-delete list', () => {
    it('should pass through findMany without modification', async () => {
      const next = createNext();
      const params = {
        model: 'SyncEvent',
        action: 'findMany',
        args: { where: { profileId: 'p-1' } },
      };

      await middleware(params as any, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          args: { where: { profileId: 'p-1' } },
        })
      );
      // Should NOT have deletedAt added
      expect(params.args.where).not.toHaveProperty('deletedAt');
    });

    it('should pass through delete without conversion', async () => {
      const next = createNext();
      const params = {
        model: 'SyncEvent',
        action: 'delete',
        args: { where: { id: 'se-1' } },
      };

      await middleware(params as any, next);

      // action should remain 'delete'
      expect(params.action).toBe('delete');
      // should not have data.deletedAt
      expect(params.args).not.toHaveProperty('data');
    });

    it('should pass through when model is undefined', async () => {
      const next = createNext();
      const params = {
        model: undefined,
        action: 'findMany',
        args: {},
      };

      await middleware(params as any, next);

      expect(next).toHaveBeenCalledWith(params);
    });
  });

  describe('all soft-delete models', () => {
    const softDeleteModels = [
      'Content', 'Asset', 'Collection', 'Curriculum', 'Tag',
      'OfflinePack', 'Experiment', 'Prompt', 'Brief', 'LicensedRight',
      'Household', 'ParentAccount', 'ChildProfile',
      'FeatureFlag', 'ParentTip', 'HelpArticle', 'Routine', 'MerchandisingAsset',
    ];

    it.each(softDeleteModels)('should apply soft-delete filter for model %s on findMany', async (model) => {
      const next = createNext();
      const params = {
        model,
        action: 'findMany',
        args: {},
      };

      await middleware(params as any, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          args: { where: { deletedAt: null } },
        })
      );
    });

    it.each(softDeleteModels)('should convert delete to soft-delete for model %s', async (model) => {
      const next = createNext();
      const params = {
        model,
        action: 'delete' as string,
        args: { where: { id: 'test' } },
      };

      await middleware(params as any, next);

      expect(params.action).toBe('update');
      expect(params.args.data.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('non-affected actions', () => {
    it('should not modify create action on soft-delete models', async () => {
      const next = createNext();
      const params = {
        model: 'Content',
        action: 'create',
        args: { data: { title: 'New Content' } },
      };

      await middleware(params as any, next);

      expect(params.action).toBe('create');
      expect(params.args.data).toEqual({ title: 'New Content' });
    });

    it('should not modify update action on soft-delete models', async () => {
      const next = createNext();
      const params = {
        model: 'Content',
        action: 'update',
        args: { where: { id: 'c-1' }, data: { title: 'Updated' } },
      };

      await middleware(params as any, next);

      expect(params.action).toBe('update');
      expect(params.args.data).toEqual({ title: 'Updated' });
    });
  });
});
