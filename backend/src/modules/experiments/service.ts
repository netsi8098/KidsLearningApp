import { createHash } from 'crypto';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError, ConflictError } from '../../lib/errors.js';
import { paginate, type PaginationParams, type PaginatedResult } from '../../types/index.js';
import { Prisma } from '@prisma/client';
import type { Experiment, ExperimentVariant, ExperimentStatus } from '@prisma/client';

// ── Types ─────────────────────────────────────────────────

export interface ExperimentWithVariants extends Experiment {
  variants: ExperimentVariant[];
}

export interface ExperimentDetail extends Experiment {
  variants: ExperimentVariant[];
  results: {
    id: string;
    variantId: string;
    metric: string;
    value: number;
    sampleSize: number;
    recordedAt: Date;
  }[];
  creator: { id: string; name: string; email: string };
}

export interface VariantResultSummary {
  variantId: string;
  variantName: string;
  metrics: {
    metric: string;
    mean: number;
    sampleSize: number;
    totalValue: number;
  }[];
}

export interface SignificanceResult {
  zScore: number;
  pValue: number;
  significant: boolean;
}

export interface ExperimentResultsSummary {
  experimentId: string;
  experimentName: string;
  status: ExperimentStatus;
  variants: VariantResultSummary[];
  comparisons: {
    metric: string;
    winner: string | null;
    significance: SignificanceResult | null;
  }[];
}

// ── Selects ───────────────────────────────────────────────

const EXPERIMENT_SELECT = {
  id: true,
  name: true,
  description: true,
  status: true,
  startDate: true,
  endDate: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
} as const;

const EXPERIMENT_DETAIL_SELECT = {
  ...EXPERIMENT_SELECT,
  variants: true,
  results: {
    orderBy: { recordedAt: 'desc' as const },
  },
  creator: {
    select: { id: true, name: true, email: true },
  },
} as const;

// ── Experiment CRUD ───────────────────────────────────────

export async function listExperiments(
  filters: { status?: ExperimentStatus },
  pagination: PaginationParams
): Promise<PaginatedResult<ExperimentWithVariants>> {
  const where: Prisma.ExperimentWhereInput = {};
  if (filters.status) {
    where.status = filters.status;
  }

  const [items, total] = await Promise.all([
    prisma.experiment.findMany({
      where,
      include: { variants: true },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      orderBy: pagination.sortBy
        ? { [pagination.sortBy]: pagination.sortOrder || 'desc' }
        : { createdAt: 'desc' },
    }),
    prisma.experiment.count({ where }),
  ]);

  return paginate(items, total, pagination);
}

export async function getExperiment(id: string): Promise<ExperimentDetail> {
  const experiment = await prisma.experiment.findUnique({
    where: { id },
    include: EXPERIMENT_DETAIL_SELECT,
  });

  if (!experiment) {
    throw new NotFoundError('Experiment', id);
  }

  return experiment as ExperimentDetail;
}

export async function createExperiment(
  data: { name: string; description?: string },
  createdBy: string
): Promise<Experiment> {
  // Check for name uniqueness
  const existing = await prisma.experiment.findUnique({ where: { name: data.name } });
  if (existing) {
    throw new ConflictError(`Experiment with name '${data.name}' already exists`);
  }

  return prisma.experiment.create({
    data: {
      name: data.name,
      description: data.description || null,
      createdBy,
      status: 'draft',
    },
  });
}

export async function updateExperiment(
  id: string,
  data: { name?: string; description?: string }
): Promise<Experiment> {
  const experiment = await prisma.experiment.findUnique({ where: { id } });
  if (!experiment) {
    throw new NotFoundError('Experiment', id);
  }

  if (experiment.status !== 'draft') {
    throw new ValidationError('Can only update experiments in draft status');
  }

  // Check name uniqueness if changing name
  if (data.name && data.name !== experiment.name) {
    const existing = await prisma.experiment.findUnique({ where: { name: data.name } });
    if (existing) {
      throw new ConflictError(`Experiment with name '${data.name}' already exists`);
    }
  }

  return prisma.experiment.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });
}

// ── Experiment Lifecycle ──────────────────────────────────

export async function startExperiment(id: string): Promise<Experiment> {
  const experiment = await prisma.experiment.findUnique({
    where: { id },
    include: { variants: true },
  });

  if (!experiment) {
    throw new NotFoundError('Experiment', id);
  }

  if (experiment.status !== 'draft' && experiment.status !== 'paused') {
    throw new ValidationError(`Cannot start experiment in '${experiment.status}' status. Must be draft or paused.`);
  }

  if (experiment.variants.length < 2) {
    throw new ValidationError('Experiment must have at least 2 variants before starting');
  }

  // Validate weights sum to approximately 1.0
  const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
  if (Math.abs(totalWeight - 1.0) > 0.01) {
    throw new ValidationError(`Variant weights must sum to 1.0 (currently ${totalWeight.toFixed(4)}). Adjust weights before starting.`);
  }

  return prisma.experiment.update({
    where: { id },
    data: {
      status: 'running',
      startDate: experiment.startDate || new Date(),
    },
  });
}

export async function stopExperiment(id: string): Promise<Experiment> {
  const experiment = await prisma.experiment.findUnique({ where: { id } });
  if (!experiment) {
    throw new NotFoundError('Experiment', id);
  }

  if (experiment.status !== 'running' && experiment.status !== 'paused') {
    throw new ValidationError(`Cannot stop experiment in '${experiment.status}' status. Must be running or paused.`);
  }

  return prisma.experiment.update({
    where: { id },
    data: {
      status: 'completed',
      endDate: new Date(),
    },
  });
}

// ── Variant Management ────────────────────────────────────

export async function addVariant(
  experimentId: string,
  data: { name: string; contentId?: string; weight?: number; config?: Record<string, unknown> }
): Promise<ExperimentVariant> {
  const experiment = await prisma.experiment.findUnique({ where: { id: experimentId } });
  if (!experiment) {
    throw new NotFoundError('Experiment', experimentId);
  }

  if (experiment.status !== 'draft') {
    throw new ValidationError('Can only add variants to experiments in draft status');
  }

  // Verify content exists if contentId provided
  if (data.contentId) {
    const content = await prisma.content.findUnique({ where: { id: data.contentId }, select: { id: true } });
    if (!content) {
      throw new NotFoundError('Content', data.contentId);
    }
  }

  return prisma.experimentVariant.create({
    data: {
      experimentId,
      name: data.name,
      contentId: data.contentId || null,
      weight: data.weight ?? 0.5,
      config: (data.config || {}) as Prisma.InputJsonValue,
    },
  });
}

export async function updateVariantWeight(
  experimentId: string,
  variantId: string,
  weight: number
): Promise<ExperimentVariant> {
  const experiment = await prisma.experiment.findUnique({ where: { id: experimentId } });
  if (!experiment) {
    throw new NotFoundError('Experiment', experimentId);
  }

  const variant = await prisma.experimentVariant.findUnique({ where: { id: variantId } });
  if (!variant || variant.experimentId !== experimentId) {
    throw new NotFoundError('ExperimentVariant', variantId);
  }

  return prisma.experimentVariant.update({
    where: { id: variantId },
    data: { weight },
  });
}

// ── Variant Assignment ────────────────────────────────────

export async function assignVariant(
  experimentId: string,
  userId: string
): Promise<ExperimentVariant> {
  const experiment = await prisma.experiment.findUnique({
    where: { id: experimentId },
    include: {
      variants: {
        orderBy: { id: 'asc' },
      },
    },
  });

  if (!experiment) {
    throw new NotFoundError('Experiment', experimentId);
  }

  if (experiment.status !== 'running') {
    throw new ValidationError('Can only assign variants for running experiments');
  }

  if (experiment.variants.length === 0) {
    throw new ValidationError('Experiment has no variants');
  }

  // Deterministic assignment using hash(userId + experimentId) mod weights
  const hash = createHash('sha256')
    .update(userId + experimentId)
    .digest('hex');

  // Convert first 8 hex chars to a number between 0 and 1
  const hashValue = parseInt(hash.substring(0, 8), 16) / 0xffffffff;

  // Weight-based selection
  let cumulative = 0;
  for (const variant of experiment.variants) {
    cumulative += variant.weight;
    if (hashValue <= cumulative) {
      return variant;
    }
  }

  // Fallback to last variant (handles floating point edge case)
  return experiment.variants[experiment.variants.length - 1];
}

// ── Results ───────────────────────────────────────────────

export async function recordResult(
  experimentId: string,
  variantId: string,
  metric: string,
  value: number,
  sampleSize: number
): Promise<{ id: string }> {
  const experiment = await prisma.experiment.findUnique({ where: { id: experimentId } });
  if (!experiment) {
    throw new NotFoundError('Experiment', experimentId);
  }

  const variant = await prisma.experimentVariant.findUnique({ where: { id: variantId } });
  if (!variant || variant.experimentId !== experimentId) {
    throw new NotFoundError('ExperimentVariant', variantId);
  }

  const result = await prisma.experimentResult.create({
    data: {
      experimentId,
      variantId,
      metric,
      value,
      sampleSize,
    },
    select: { id: true },
  });

  return result;
}

export async function getResults(
  experimentId: string,
  metricFilter?: string
): Promise<ExperimentResultsSummary> {
  const experiment = await prisma.experiment.findUnique({
    where: { id: experimentId },
    include: {
      variants: true,
      results: {
        orderBy: { recordedAt: 'desc' },
      },
    },
  });

  if (!experiment) {
    throw new NotFoundError('Experiment', experimentId);
  }

  // Filter results by metric if specified
  let results = experiment.results;
  if (metricFilter) {
    results = results.filter((r) => r.metric === metricFilter);
  }

  // Build variant-level summary
  const variantMap = new Map<string, { name: string; metrics: Map<string, { totalValue: number; totalSampleSize: number; count: number }> }>();

  for (const variant of experiment.variants) {
    variantMap.set(variant.id, { name: variant.name, metrics: new Map() });
  }

  for (const result of results) {
    const variantData = variantMap.get(result.variantId);
    if (!variantData) continue;

    const metricData = variantData.metrics.get(result.metric) || { totalValue: 0, totalSampleSize: 0, count: 0 };
    metricData.totalValue += result.value * result.sampleSize;
    metricData.totalSampleSize += result.sampleSize;
    metricData.count += 1;
    variantData.metrics.set(result.metric, metricData);
  }

  const variants: VariantResultSummary[] = [];
  for (const [variantId, data] of variantMap) {
    const metrics: VariantResultSummary['metrics'] = [];
    for (const [metric, metricData] of data.metrics) {
      metrics.push({
        metric,
        mean: metricData.totalSampleSize > 0 ? metricData.totalValue / metricData.totalSampleSize : 0,
        sampleSize: metricData.totalSampleSize,
        totalValue: metricData.totalValue,
      });
    }
    variants.push({ variantId, variantName: data.name, metrics });
  }

  // Generate comparisons between first two variants for each metric
  const allMetrics = new Set<string>();
  for (const result of results) {
    allMetrics.add(result.metric);
  }

  const comparisons: ExperimentResultsSummary['comparisons'] = [];
  const variantEntries = Array.from(variantMap.entries());

  for (const metric of allMetrics) {
    if (variantEntries.length < 2) {
      comparisons.push({ metric, winner: null, significance: null });
      continue;
    }

    const [variantAId, variantAData] = variantEntries[0];
    const [variantBId, variantBData] = variantEntries[1];

    const metricA = variantAData.metrics.get(metric);
    const metricB = variantBData.metrics.get(metric);

    if (!metricA || !metricB || metricA.totalSampleSize === 0 || metricB.totalSampleSize === 0) {
      comparisons.push({ metric, winner: null, significance: null });
      continue;
    }

    const meanA = metricA.totalValue / metricA.totalSampleSize;
    const meanB = metricB.totalValue / metricB.totalSampleSize;

    const significance = calculateSignificance(
      { mean: meanA, sampleSize: metricA.totalSampleSize },
      { mean: meanB, sampleSize: metricB.totalSampleSize }
    );

    let winner: string | null = null;
    if (significance.significant) {
      winner = meanA > meanB ? variantAData.name : variantBData.name;
    }

    comparisons.push({ metric, winner, significance });
  }

  return {
    experimentId: experiment.id,
    experimentName: experiment.name,
    status: experiment.status,
    variants,
    comparisons,
  };
}

// ── Statistical Significance ──────────────────────────────

export function calculateSignificance(
  variantA: { mean: number; sampleSize: number },
  variantB: { mean: number; sampleSize: number }
): SignificanceResult {
  const pA = variantA.mean;
  const pB = variantB.mean;
  const nA = variantA.sampleSize;
  const nB = variantB.sampleSize;

  // Pooled proportion for z-test
  const pooled = (pA * nA + pB * nB) / (nA + nB);

  // Handle edge cases
  if (pooled <= 0 || pooled >= 1 || nA === 0 || nB === 0) {
    return { zScore: 0, pValue: 1, significant: false };
  }

  const standardError = Math.sqrt(pooled * (1 - pooled) * (1 / nA + 1 / nB));

  if (standardError === 0) {
    return { zScore: 0, pValue: 1, significant: false };
  }

  const zScore = (pA - pB) / standardError;

  // Approximate two-tailed p-value using the error function approximation
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));

  return {
    zScore: Math.round(zScore * 10000) / 10000,
    pValue: Math.round(pValue * 10000) / 10000,
    significant: pValue < 0.05,
  };
}

// Approximation of the normal cumulative distribution function
function normalCDF(x: number): number {
  // Abramowitz and Stegun approximation 7.1.26
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX / 2);

  return 0.5 * (1.0 + sign * y);
}
