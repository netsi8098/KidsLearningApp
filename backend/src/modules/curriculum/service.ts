import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError, ConflictError } from '../../lib/errors.js';
import type { PaginatedResult } from '../../types/index.js';
import { paginate } from '../../types/index.js';
import type {
  CreateCurriculumInput,
  UpdateCurriculumInput,
  ListCurriculaQuery,
  CreateUnitInput,
  UpdateUnitInput,
  AddItemInput,
} from './schemas.js';

// ── Types ─────────────────────────────────────────────────

export interface CompilationWarning {
  type: 'missing_content' | 'unpublished_content' | 'age_group_mismatch' | 'missing_duration' | 'empty_unit';
  unitId?: string;
  unitTitle?: string;
  itemId?: string;
  contentId?: string;
  message: string;
}

export interface CompilationReport {
  curriculumId: string;
  valid: boolean;
  totalUnits: number;
  totalItems: number;
  totalDuration: number;
  warnings: CompilationWarning[];
  errors: CompilationWarning[];
  compiledAt: string;
}

// ── Content Types That Require Duration ───────────────────

const TIMED_CONTENT_TYPES = new Set(['lesson', 'story', 'video', 'audio']);

// ── Helpers ──────────────────────────────────────────────

/** Map schema ageGroup values ('2-3') to Prisma enum values ('age_2_3') */
function mapAgeGroupToPrisma(ag: string): string {
  const map: Record<string, string> = {
    '2-3': 'age_2_3',
    '3-4': 'age_3_4',
    '4-5': 'age_4_5',
    '5-6': 'age_5_6',
    'all': 'all',
  };
  return map[ag] ?? ag;
}

/** Convert 'published'/'draft'/'archived' status filter to Prisma `published` boolean */
function statusToPublishedFilter(status: string): boolean | undefined {
  if (status === 'published') return true;
  if (status === 'draft') return false;
  // 'archived' or others - treat as unpublished
  return false;
}

// ── List Curricula ────────────────────────────────────────

export async function listCurricula(query: ListCurriculaQuery): Promise<PaginatedResult<unknown>> {
  const { page, limit, sortBy, sortOrder, ageGroup, status, search } = query;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (ageGroup) where.ageGroup = mapAgeGroupToPrisma(ageGroup);
  if (status) where.published = statusToPublishedFilter(status);
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Map sortBy: 'totalDuration' is not a DB field, fallback to updatedAt
  const effectiveSortBy = sortBy === 'totalDuration' ? 'updatedAt' : sortBy;

  const [curricula, total] = await Promise.all([
    prisma.curriculum.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [effectiveSortBy]: sortOrder },
      include: {
        _count: {
          select: { units: true },
        },
      },
    }),
    prisma.curriculum.count({ where }),
  ]);

  return paginate(curricula, total, { page, limit, sortBy, sortOrder });
}

// ── Get Curriculum By ID ──────────────────────────────────

export async function getCurriculum(id: string) {
  const curriculum = await prisma.curriculum.findUnique({
    where: { id },
    include: {
      units: {
        orderBy: { orderIndex: 'asc' },
        include: {
          items: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
    },
  });

  if (!curriculum) {
    throw new NotFoundError('Curriculum', id);
  }

  return curriculum;
}

// ── Create Curriculum ─────────────────────────────────────

export async function createCurriculum(data: CreateCurriculumInput, _createdById: string) {
  // Only pass fields that exist on the Prisma Curriculum model
  const curriculum = await prisma.curriculum.create({
    data: {
      title: data.title,
      description: data.description,
      ageGroup: mapAgeGroupToPrisma(data.ageGroup) as any,
      published: false,
    },
  });

  return curriculum;
}

// ── Update Curriculum ─────────────────────────────────────

export async function updateCurriculum(id: string, data: UpdateCurriculumInput) {
  const existing = await prisma.curriculum.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('Curriculum', id);
  }

  if (existing.published) {
    throw new ConflictError('Cannot update a published curriculum. Create a new version instead.');
  }

  // Build update payload with only fields that exist on Curriculum model
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.ageGroup !== undefined) updateData.ageGroup = mapAgeGroupToPrisma(data.ageGroup);

  const curriculum = await prisma.curriculum.update({
    where: { id },
    data: updateData,
  });

  return curriculum;
}

// ── Create Unit ───────────────────────────────────────────

export async function createUnit(curriculumId: string, data: CreateUnitInput) {
  const curriculum = await prisma.curriculum.findUnique({
    where: { id: curriculumId },
    include: { units: { orderBy: { orderIndex: 'desc' }, take: 1 } },
  });

  if (!curriculum) {
    throw new NotFoundError('Curriculum', curriculumId);
  }

  if (curriculum.published) {
    throw new ConflictError('Cannot modify a published curriculum.');
  }

  const maxOrderIndex = curriculum.units[0]?.orderIndex ?? -1;
  const orderIndex = data.sortOrder ?? maxOrderIndex + 1;

  const unit = await prisma.curriculumUnit.create({
    data: {
      curriculumId,
      title: data.title,
      description: data.description ?? '',
      orderIndex,
    },
  });

  return unit;
}

// ── Update Unit ───────────────────────────────────────────

export async function updateUnit(curriculumId: string, unitId: string, data: UpdateUnitInput) {
  const unit = await prisma.curriculumUnit.findFirst({
    where: { id: unitId, curriculumId },
  });

  if (!unit) {
    throw new NotFoundError('CurriculumUnit', unitId);
  }

  const curriculum = await prisma.curriculum.findUnique({ where: { id: curriculumId } });
  if (curriculum?.published) {
    throw new ConflictError('Cannot modify a published curriculum.');
  }

  // Build update payload with only Prisma-valid fields
  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.sortOrder !== undefined) updateData.orderIndex = data.sortOrder;

  const updated = await prisma.curriculumUnit.update({
    where: { id: unitId },
    data: updateData,
  });

  return updated;
}

// ── Delete Unit ───────────────────────────────────────────

export async function deleteUnit(curriculumId: string, unitId: string) {
  const unit = await prisma.curriculumUnit.findFirst({
    where: { id: unitId, curriculumId },
  });

  if (!unit) {
    throw new NotFoundError('CurriculumUnit', unitId);
  }

  const curriculum = await prisma.curriculum.findUnique({ where: { id: curriculumId } });
  if (curriculum?.published) {
    throw new ConflictError('Cannot modify a published curriculum.');
  }

  await prisma.curriculumUnit.delete({ where: { id: unitId } });
}

// ── Add Item to Unit ──────────────────────────────────────

export async function addItem(curriculumId: string, unitId: string, data: AddItemInput) {
  const unit = await prisma.curriculumUnit.findFirst({
    where: { id: unitId, curriculumId },
    include: { items: { orderBy: { orderIndex: 'desc' }, take: 1 } },
  });

  if (!unit) {
    throw new NotFoundError('CurriculumUnit', unitId);
  }

  const curriculum = await prisma.curriculum.findUnique({ where: { id: curriculumId } });
  if (curriculum?.published) {
    throw new ConflictError('Cannot modify a published curriculum.');
  }

  // Verify referenced content exists
  const content = await prisma.content.findUnique({
    where: { id: data.contentId },
  });

  if (!content) {
    throw new NotFoundError('Content', data.contentId);
  }

  const maxOrderIndex = unit.items[0]?.orderIndex ?? -1;
  const orderIndex = data.sortOrder ?? maxOrderIndex + 1;

  const item = await prisma.curriculumItem.create({
    data: {
      unitId,
      contentId: data.contentId,
      orderIndex,
      required: data.isRequired,
    },
  });

  return item;
}

// ── Remove Item from Unit ─────────────────────────────────

export async function removeItem(curriculumId: string, unitId: string, itemId: string) {
  const item = await prisma.curriculumItem.findFirst({
    where: {
      id: itemId,
      unitId,
      unit: { curriculumId },
    },
  });

  if (!item) {
    throw new NotFoundError('CurriculumItem', itemId);
  }

  const curriculum = await prisma.curriculum.findUnique({ where: { id: curriculumId } });
  if (curriculum?.published) {
    throw new ConflictError('Cannot modify a published curriculum.');
  }

  await prisma.curriculumItem.delete({ where: { id: itemId } });
}

// ── Compile Curriculum ────────────────────────────────────

export async function compileCurriculum(id: string): Promise<CompilationReport> {
  const curriculum = await prisma.curriculum.findUnique({
    where: { id },
    include: {
      units: {
        orderBy: { orderIndex: 'asc' },
        include: {
          items: {
            orderBy: { orderIndex: 'asc' },
            include: { content: true },
          },
        },
      },
    },
  });

  if (!curriculum) {
    throw new NotFoundError('Curriculum', id);
  }

  const warnings: CompilationWarning[] = [];
  const errors: CompilationWarning[] = [];
  let totalItems = 0;
  let totalDuration = 0;

  // Check each unit
  for (const unit of curriculum.units) {
    if (unit.items.length === 0) {
      warnings.push({
        type: 'empty_unit',
        unitId: unit.id,
        unitTitle: unit.title,
        message: `Unit "${unit.title}" has no content items.`,
      });
      continue;
    }

    // Check each item in the unit
    for (const item of unit.items) {
      totalItems++;

      const content = item.content;

      if (!content) {
        errors.push({
          type: 'missing_content',
          unitId: unit.id,
          unitTitle: unit.title,
          itemId: item.id,
          contentId: item.contentId,
          message: `Content "${item.contentId}" referenced in unit "${unit.title}" does not exist.`,
        });
        continue;
      }

      // Check if content is published
      if (content.status !== 'published') {
        warnings.push({
          type: 'unpublished_content',
          unitId: unit.id,
          unitTitle: unit.title,
          itemId: item.id,
          contentId: item.contentId,
          message: `Content "${content.title}" in unit "${unit.title}" is not published (status: ${content.status}).`,
        });
      }

      // Check age group consistency
      if (
        curriculum.ageGroup !== 'all' &&
        content.ageGroup !== 'all' &&
        content.ageGroup !== curriculum.ageGroup
      ) {
        warnings.push({
          type: 'age_group_mismatch',
          unitId: unit.id,
          unitTitle: unit.title,
          itemId: item.id,
          contentId: item.contentId,
          message: `Content "${content.title}" (age: ${content.ageGroup}) does not match curriculum age group (${curriculum.ageGroup}).`,
        });
      }

      // Check duration for timed content
      if (TIMED_CONTENT_TYPES.has(content.type)) {
        if (content.durationMinutes && content.durationMinutes > 0) {
          totalDuration += content.durationMinutes;
        } else {
          warnings.push({
            type: 'missing_duration',
            unitId: unit.id,
            unitTitle: unit.title,
            itemId: item.id,
            contentId: item.contentId,
            message: `Content "${content.title}" is timed content but has no duration set.`,
          });
        }
      }
    }
  }

  const hasErrors = errors.length > 0;

  // Note: totalDuration, lastCompiledAt, compilationValid are not in Prisma schema.
  // We update only the updatedAt timestamp to mark that compilation ran.
  await prisma.curriculum.update({
    where: { id },
    data: {
      updatedAt: new Date(),
    },
  });

  return {
    curriculumId: id,
    valid: !hasErrors,
    totalUnits: curriculum.units.length,
    totalItems,
    totalDuration,
    warnings,
    errors,
    compiledAt: new Date().toISOString(),
  };
}

// ── Publish Curriculum ────────────────────────────────────

export async function publishCurriculum(id: string) {
  const curriculum = await prisma.curriculum.findUnique({
    where: { id },
    include: {
      units: {
        include: {
          items: true,
        },
      },
    },
  });

  if (!curriculum) {
    throw new NotFoundError('Curriculum', id);
  }

  if (curriculum.published) {
    throw new ConflictError('Curriculum is already published.');
  }

  // Run compilation check first
  const report = await compileCurriculum(id);

  if (!report.valid) {
    throw new ValidationError(
      'Curriculum cannot be published due to compilation errors.',
      { errors: report.errors.map((e: CompilationWarning) => e.message) }
    );
  }

  if (report.totalItems === 0) {
    throw new ValidationError('Curriculum cannot be published with no content items.');
  }

  // Snapshot the current state
  const _snapshot = JSON.stringify({
    units: curriculum.units.map((u: any) => ({
      id: u.id,
      title: u.title,
      orderIndex: u.orderIndex,
      items: u.items.map((i: any) => ({
        id: i.id,
        contentId: i.contentId,
        orderIndex: i.orderIndex,
      })),
    })),
    totalDuration: report.totalDuration,
    totalItems: report.totalItems,
    publishedAt: new Date().toISOString(),
  });

  const published = await prisma.curriculum.update({
    where: { id },
    data: {
      published: true,
    },
  });

  return published;
}

// ── Get Curriculum Progress (for future child progress) ───
// Note: `childProgress` model does not exist in the Prisma schema yet.
// This is a placeholder that returns a computed structure without DB queries for progress.

export async function getCurriculumProgress(curriculumId: string, childId: string) {
  const curriculum = await prisma.curriculum.findUnique({
    where: { id: curriculumId },
    include: {
      units: {
        orderBy: { orderIndex: 'asc' },
        include: {
          items: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
    },
  });

  if (!curriculum) {
    throw new NotFoundError('Curriculum', curriculumId);
  }

  // TODO: When a childProgress model is added to Prisma schema, query actual progress records here.
  // For now, return empty progress (nothing completed).
  const completedContentIds = new Set<string>();

  const unitProgress = curriculum.units.map((unit: any) => {
    const unitTotalItems: number = unit.items.length;
    const completedItems: number = unit.items.filter((item: any) =>
      completedContentIds.has(item.contentId)
    ).length;

    return {
      unitId: unit.id,
      unitTitle: unit.title,
      totalItems: unitTotalItems,
      completedItems,
      percentage: unitTotalItems > 0 ? Math.round((completedItems / unitTotalItems) * 100) : 0,
    };
  });

  const totalItems: number = unitProgress.reduce((sum: number, u: any) => sum + u.totalItems, 0);
  const totalCompleted: number = unitProgress.reduce((sum: number, u: any) => sum + u.completedItems, 0);

  return {
    curriculumId,
    childId,
    totalItems,
    totalCompleted,
    overallPercentage: totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0,
    units: unitProgress,
  };
}
