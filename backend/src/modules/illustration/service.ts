import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError, ConflictError } from '../../lib/errors.js';
import { aiQueue } from '../../lib/queue.js';
import type { PaginationParams } from '../../types/index.js';
import { paginate } from '../../types/index.js';
import { Prisma } from '@prisma/client';

// ── Available Illustration Styles ─────────────────────────

export const ILLUSTRATION_STYLES = [
  {
    id: 'flat-vector',
    name: 'Flat Vector',
    description: 'Clean, modern flat illustrations with bold shapes and limited color palettes. Great for UI elements and icons.',
    guidelines: 'Use geometric shapes, flat colors without gradients, consistent line weights, minimal shading.',
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    description: 'Soft, organic watercolor-style illustrations with gentle color blending. Ideal for stories about nature and emotions.',
    guidelines: 'Soft edges, color bleeding effects, organic textures, muted pastel tones with occasional bright accents.',
  },
  {
    id: 'cartoon',
    name: 'Cartoon',
    description: 'Bright, energetic cartoon style with expressive characters. Perfect for games and interactive content.',
    guidelines: 'Bold outlines, exaggerated proportions, vibrant saturated colors, dynamic poses, expressive faces.',
  },
  {
    id: 'storybook',
    name: 'Storybook',
    description: 'Classic storybook illustration style with rich detail and warm lighting. Best for narrative story content.',
    guidelines: 'Rich textures, warm lighting, detailed backgrounds, character-focused composition, inviting atmosphere.',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple, minimalist illustrations using limited elements. Good for focusing attention on specific concepts.',
    guidelines: 'White space, limited palette (2-3 colors), simple shapes, no unnecessary detail, clear focal point.',
  },
] as const;

// ── Style Guide (kid-friendly enforcement) ────────────────

const KID_FRIENDLY_GUIDELINES = [
  'All illustrations MUST be appropriate for children ages 2-6.',
  'Use bright, cheerful colors. Avoid dark, gloomy palettes.',
  'Characters should have friendly, approachable expressions.',
  'No scary, violent, or distressing imagery.',
  'Promote diversity: include characters of various backgrounds.',
  'Keep compositions clear and uncluttered for young viewers.',
  'Avoid text within illustrations unless specifically requested.',
  'Ensure all elements are clearly recognizable by young children.',
].join('\n- ');

// ── List Illustration Jobs ────────────────────────────────

export async function listIllustrations(
  params: PaginationParams & {
    status?: string;
    style?: string;
    contentId?: string;
  }
) {
  const where: Prisma.IllustrationJobWhereInput = {};
  if (params.status) where.status = params.status;
  if (params.style) where.style = params.style;
  if (params.contentId) where.contentId = params.contentId;

  const skip = (params.page - 1) * params.limit;
  const orderBy: Prisma.IllustrationJobOrderByWithRelationInput = {
    [params.sortBy || 'createdAt']: params.sortOrder || 'desc',
  };

  const [jobs, total] = await prisma.$transaction([
    prisma.illustrationJob.findMany({
      where,
      skip,
      take: params.limit,
      orderBy,
      include: {
        content: { select: { id: true, title: true, slug: true, type: true } },
      },
    }),
    prisma.illustrationJob.count({ where }),
  ]);

  return paginate(jobs, total, params);
}

// ── Get Illustration Job ──────────────────────────────────

export async function getIllustrationById(id: string) {
  const job = await prisma.illustrationJob.findUnique({
    where: { id },
    include: {
      content: { select: { id: true, title: true, slug: true, type: true, ageGroup: true } },
    },
  });
  if (!job) throw new NotFoundError('IllustrationJob', id);
  return job;
}

// ── Create Illustration Job ───────────────────────────────

export async function createIllustration(data: {
  contentId: string;
  prompt: string;
  style: string;
  metadata: Record<string, unknown>;
}) {
  // Verify content exists
  const content = await prisma.content.findUnique({ where: { id: data.contentId } });
  if (!content) throw new NotFoundError('Content', data.contentId);

  // Validate style
  const validStyle = ILLUSTRATION_STYLES.find(s => s.id === data.style);
  if (!validStyle) {
    throw new ValidationError(
      `Invalid style "${data.style}". Valid styles: ${ILLUSTRATION_STYLES.map(s => s.id).join(', ')}`
    );
  }

  return prisma.illustrationJob.create({
    data: {
      contentId: data.contentId,
      prompt: data.prompt,
      style: data.style,
      status: 'pending',
      metadata: data.metadata as Prisma.InputJsonValue,
    },
    include: {
      content: { select: { id: true, title: true, slug: true, type: true } },
    },
  });
}

// ── Generate Illustration ─────────────────────────────────

export async function generateIllustration(id: string) {
  const job = await prisma.illustrationJob.findUnique({
    where: { id },
    include: {
      content: { select: { id: true, title: true, type: true, ageGroup: true, description: true } },
    },
  });
  if (!job) throw new NotFoundError('IllustrationJob', id);

  if (job.status === 'generating') {
    throw new ConflictError('Illustration generation is already in progress');
  }
  if (job.status === 'approved') {
    throw new ConflictError('Cannot regenerate an approved illustration');
  }

  // Mark as generating
  await prisma.illustrationJob.update({
    where: { id },
    data: { status: 'generating' },
  });

  // Build the full prompt with style guide
  const fullPrompt = buildIllustrationPrompt(job, job.content);

  // Queue AI generation
  await aiQueue.add('generate-illustration', {
    type: 'illustration-prompt' as const,
    contentId: job.contentId,
    params: {
      jobId: id,
      prompt: fullPrompt,
      style: job.style,
      metadata: job.metadata,
    },
  });

  return prisma.illustrationJob.findUnique({
    where: { id },
    include: {
      content: { select: { id: true, title: true, slug: true, type: true } },
    },
  });
}

// ── Approve Illustration ──────────────────────────────────

export async function approveIllustration(id: string) {
  const job = await prisma.illustrationJob.findUnique({ where: { id } });
  if (!job) throw new NotFoundError('IllustrationJob', id);

  if (job.status === 'approved') {
    throw new ConflictError('Illustration is already approved');
  }
  if (job.status !== 'review' && job.status !== 'generating') {
    throw new ValidationError(
      `Illustration must be in "review" or "generating" status to approve. Current status: "${job.status}"`
    );
  }

  // Update job to approved
  const updatedJob = await prisma.illustrationJob.update({
    where: { id },
    data: { status: 'approved' },
  });

  // If there's a result URL, create an Asset record linked to the content
  if (updatedJob.resultUrl) {
    await prisma.asset.create({
      data: {
        contentId: updatedJob.contentId,
        filename: `illustration-${id}.png`,
        storageKey: updatedJob.resultUrl,
        mimeType: 'image/png',
        sizeBytes: 0, // Will be updated when actual file is stored
        alt: `Illustration for content ${updatedJob.contentId}`,
        metadata: {
          illustrationJobId: id,
          style: updatedJob.style,
          generatedPrompt: updatedJob.prompt,
        },
      },
    });
  }

  return updatedJob;
}

// ── Reject Illustration ───────────────────────────────────

export async function rejectIllustration(id: string, feedback?: string) {
  const job = await prisma.illustrationJob.findUnique({ where: { id } });
  if (!job) throw new NotFoundError('IllustrationJob', id);

  if (job.status === 'approved') {
    throw new ConflictError('Cannot reject an approved illustration');
  }

  const existingMetadata = (job.metadata as Record<string, unknown>) || {};
  const rejectionHistory = (existingMetadata.rejectionHistory as Array<Record<string, unknown>>) || [];

  return prisma.illustrationJob.update({
    where: { id },
    data: {
      status: 'rejected',
      metadata: {
        ...existingMetadata,
        lastRejectionFeedback: feedback || null,
        rejectionHistory: [
          ...rejectionHistory,
          {
            feedback: feedback || null,
            rejectedAt: new Date().toISOString(),
            previousResultUrl: job.resultUrl,
          },
        ],
      } as unknown as Prisma.InputJsonValue,
    },
    include: {
      content: { select: { id: true, title: true, slug: true, type: true } },
    },
  });
}

// ── Regenerate Illustration ───────────────────────────────

export async function regenerateIllustration(
  id: string,
  params: {
    promptModification?: string;
    style?: string;
    feedback?: string;
  }
) {
  const job = await prisma.illustrationJob.findUnique({ where: { id } });
  if (!job) throw new NotFoundError('IllustrationJob', id);

  if (job.status === 'approved') {
    throw new ConflictError('Cannot regenerate an approved illustration');
  }
  if (job.status === 'generating') {
    throw new ConflictError('Illustration generation is already in progress');
  }

  // Update prompt and/or style if provided
  const updateData: Prisma.IllustrationJobUpdateInput = {
    status: 'pending',
  };

  if (params.promptModification) {
    updateData.prompt = `${job.prompt}\n\n## Additional guidance:\n${params.promptModification}`;
  }
  if (params.style) {
    const validStyle = ILLUSTRATION_STYLES.find(s => s.id === params.style);
    if (!validStyle) {
      throw new ValidationError(
        `Invalid style "${params.style}". Valid styles: ${ILLUSTRATION_STYLES.map(s => s.id).join(', ')}`
      );
    }
    updateData.style = params.style;
  }

  // Store feedback in metadata
  if (params.feedback) {
    const existingMetadata = (job.metadata as Record<string, unknown>) || {};
    updateData.metadata = {
      ...existingMetadata,
      regenerationFeedback: params.feedback,
    };
  }

  await prisma.illustrationJob.update({ where: { id }, data: updateData });

  // Trigger generation
  return generateIllustration(id);
}

// ── Get Available Styles ──────────────────────────────────

export function getAvailableStyles() {
  return ILLUSTRATION_STYLES;
}

// ── Prompt Construction ───────────────────────────────────

function buildIllustrationPrompt(
  job: { prompt: string; style: string; metadata: unknown },
  content: { title: string; type: string; ageGroup: string; description: string } | null
): string {
  const styleGuide = ILLUSTRATION_STYLES.find(s => s.id === job.style);
  const metadata = (job.metadata as Record<string, unknown>) || {};

  const parts = [
    `# Illustration Generation`,
    ``,
    `## Subject`,
    job.prompt,
    ``,
  ];

  if (content) {
    parts.push(
      `## Content Context`,
      `- Title: ${content.title}`,
      `- Type: ${content.type}`,
      `- Age Group: ${content.ageGroup.replace('age_', '').replace('_', '-')}`,
      `- Description: ${content.description}`,
      ``
    );
  }

  if (styleGuide) {
    parts.push(
      `## Art Style: ${styleGuide.name}`,
      styleGuide.description,
      `### Style Guidelines`,
      styleGuide.guidelines,
      ``
    );
  }

  // Add metadata-driven details
  if (metadata.sceneDescription) {
    parts.push(`## Scene Description`, metadata.sceneDescription as string, ``);
  }
  if (Array.isArray(metadata.characters) && metadata.characters.length > 0) {
    parts.push(`## Characters in Scene`, (metadata.characters as string[]).join(', '), ``);
  }
  if (metadata.mood) {
    parts.push(`## Mood/Atmosphere: ${metadata.mood as string}`, ``);
  }
  if (Array.isArray(metadata.colorPalette) && metadata.colorPalette.length > 0) {
    parts.push(`## Suggested Color Palette`, (metadata.colorPalette as string[]).join(', '), ``);
  }
  if (metadata.dimensions) {
    const dims = metadata.dimensions as { width: number; height: number };
    parts.push(`## Dimensions: ${dims.width}x${dims.height}`, ``);
  }

  parts.push(
    `## Kid-Friendly Requirements`,
    `- ${KID_FRIENDLY_GUIDELINES}`,
    ``,
    `## Art Direction Consistency`,
    `- Maintain consistent character proportions across illustrations.`,
    `- Use the same color palette for recurring characters.`,
    `- Keep backgrounds complementary but not distracting.`,
    `- Ensure focal elements are clearly distinguishable.`,
  );

  return parts.join('\n');
}
