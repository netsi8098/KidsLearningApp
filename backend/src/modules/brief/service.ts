import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError, ConflictError } from '../../lib/errors.js';
import { aiQueue } from '../../lib/queue.js';
import type { PaginationParams } from '../../types/index.js';
import { paginate } from '../../types/index.js';
import { Prisma } from '@prisma/client';
import type { Brief, BriefStatus, ContentType, AgeGroup } from '@prisma/client';

// ── Age-Appropriate Content Guidelines ────────────────────

const AGE_GUIDELINES: Record<string, string> = {
  age_2_3: `Target audience: toddlers aged 2-3 years.
- Use very simple words (1-2 syllables preferred).
- Short sentences (3-5 words).
- Repetition is essential for learning.
- Focus on sensory experiences and basic concepts.
- Content must be gentle, comforting, and safe.
- No scary elements, conflict, or complex emotions.`,

  age_3_4: `Target audience: preschoolers aged 3-4 years.
- Use simple vocabulary with occasional new words.
- Sentences up to 8 words.
- Include interactive prompts (Can you find the...?).
- Introduce basic cause-and-effect.
- Themes: friendship, sharing, exploration, routine.
- No violence, danger, or negative stereotypes.`,

  age_4_5: `Target audience: pre-kindergarteners aged 4-5 years.
- Broader vocabulary; introduce 2-3 new words per piece.
- Sentences up to 10 words; can include dialogue.
- Simple problem-solving and sequencing.
- Can handle mild challenges (character feels lost but finds the way).
- Themes: curiosity, cooperation, self-expression, nature.
- Avoid complex moral dilemmas or frightening scenarios.`,

  age_5_6: `Target audience: kindergarteners aged 5-6 years.
- Richer vocabulary; explanations of new words encouraged.
- Sentences up to 12 words; multi-paragraph content okay.
- Simple plots with beginning, middle, end.
- Can include gentle humor and wordplay.
- Themes: independence, empathy, creativity, discovery.
- No mature themes, violence, or exclusionary content.`,

  all: `Target audience: children aged 2-6 years (universal).
- Use layered content: simple surface with optional depth.
- Avoid age-specific references that exclude younger or older children.
- Keep language simple but not patronizing.
- Focus on universal themes: kindness, curiosity, joy.
- Absolutely no violence, fear, stereotypes, or mature content.`,
};

// ── Service Methods ───────────────────────────────────────

export async function listBriefs(
  params: PaginationParams & {
    status?: BriefStatus;
    type?: ContentType;
    ageGroup?: AgeGroup;
  }
) {
  const where: Prisma.BriefWhereInput = {};
  if (params.status) where.status = params.status;
  if (params.type) where.type = params.type;
  if (params.ageGroup) where.ageGroup = params.ageGroup;

  const skip = (params.page - 1) * params.limit;
  const orderBy: Prisma.BriefOrderByWithRelationInput = {
    [params.sortBy || 'createdAt']: params.sortOrder || 'desc',
  };

  const [briefs, total] = await prisma.$transaction([
    prisma.brief.findMany({
      where,
      skip,
      take: params.limit,
      orderBy,
      include: { creator: { select: { id: true, name: true, email: true } } },
    }),
    prisma.brief.count({ where }),
  ]);

  return paginate(briefs, total, params);
}

export async function getBriefById(id: string) {
  const brief = await prisma.brief.findUnique({
    where: { id },
    include: { creator: { select: { id: true, name: true, email: true } } },
  });
  if (!brief) throw new NotFoundError('Brief', id);
  return brief;
}

export async function createBrief(data: {
  title: string;
  type: ContentType;
  ageGroup: AgeGroup;
  description: string;
  objectives: string[];
  constraints: Record<string, unknown>;
  createdBy: string;
}) {
  return prisma.brief.create({
    data: {
      title: data.title,
      type: data.type,
      ageGroup: data.ageGroup,
      description: data.description,
      objectives: data.objectives,
      constraints: data.constraints as Prisma.InputJsonValue,
      createdBy: data.createdBy,
      status: 'draft',
    },
    include: { creator: { select: { id: true, name: true, email: true } } },
  });
}

export async function updateBrief(
  id: string,
  data: Partial<{
    title: string;
    type: ContentType;
    ageGroup: AgeGroup;
    description: string;
    objectives: string[];
    constraints: Record<string, unknown>;
  }>
) {
  const existing = await prisma.brief.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Brief', id);

  if (existing.status === 'accepted') {
    throw new ConflictError('Cannot update an accepted brief');
  }

  // If the brief was previously generated/rejected, reset status to draft on edit
  const { constraints, ...restData } = data;
  const updateData: Prisma.BriefUpdateInput = {
    ...restData,
    ...(constraints !== undefined ? { constraints: constraints as Prisma.InputJsonValue } : {}),
  };
  if (existing.status === 'generated' || existing.status === 'rejected') {
    updateData.status = 'draft';
    updateData.generatedContent = Prisma.JsonNull;
  }

  return prisma.brief.update({
    where: { id },
    data: updateData,
    include: { creator: { select: { id: true, name: true, email: true } } },
  });
}

export async function generateBrief(id: string) {
  const brief = await prisma.brief.findUnique({ where: { id } });
  if (!brief) throw new NotFoundError('Brief', id);

  if (brief.status === 'accepted') {
    throw new ConflictError('Cannot regenerate an accepted brief');
  }

  if (brief.status === 'generating') {
    throw new ConflictError('Brief generation is already in progress');
  }

  // Mark as generating
  await prisma.brief.update({
    where: { id },
    data: { status: 'generating' },
  });

  // Build the prompt
  const prompt = buildPrompt(brief);

  // Queue AI generation job
  await aiQueue.add('generate-brief', {
    type: 'brief' as const,
    contentId: id,
    params: {
      prompt,
      briefId: id,
      briefType: brief.type,
      ageGroup: brief.ageGroup,
    },
  });

  return prisma.brief.findUnique({
    where: { id },
    include: { creator: { select: { id: true, name: true, email: true } } },
  });
}

export async function completeBriefGeneration(id: string, generatedContent: Record<string, unknown>) {
  return prisma.brief.update({
    where: { id },
    data: {
      generatedContent: generatedContent as Prisma.InputJsonValue,
      status: 'generated',
    },
  });
}

export async function failBriefGeneration(id: string) {
  return prisma.brief.update({
    where: { id },
    data: { status: 'draft' },
  });
}

export async function acceptBrief(
  id: string,
  data: { slug: string; tagIds: string[] }
) {
  const brief = await prisma.brief.findUnique({ where: { id } });
  if (!brief) throw new NotFoundError('Brief', id);

  if (brief.status !== 'generated') {
    throw new ValidationError(
      `Brief must be in "generated" status to accept. Current status: "${brief.status}"`
    );
  }

  if (!brief.generatedContent) {
    throw new ValidationError('Brief has no generated content to accept');
  }

  // Check slug uniqueness
  const existingContent = await prisma.content.findUnique({ where: { slug: data.slug } });
  if (existingContent) {
    throw new ConflictError(`Content with slug "${data.slug}" already exists`);
  }

  // Validate tag IDs exist
  if (data.tagIds.length > 0) {
    const tags = await prisma.tag.findMany({
      where: { id: { in: data.tagIds } },
      select: { id: true },
    });
    const foundIds = new Set(tags.map(t => t.id));
    const missingIds = data.tagIds.filter(id => !foundIds.has(id));
    if (missingIds.length > 0) {
      throw new ValidationError(`Tags not found: ${missingIds.join(', ')}`);
    }
  }

  const generated = brief.generatedContent as Record<string, unknown>;

  // Create Content record and update Brief in a transaction
  const [content, updatedBrief] = await prisma.$transaction([
    prisma.content.create({
      data: {
        slug: data.slug,
        type: brief.type,
        title: (generated.title as string) || brief.title,
        description: (generated.description as string) || brief.description,
        body: (generated.body as Prisma.InputJsonValue) || {},
        ageGroup: brief.ageGroup,
        status: 'draft',
        authorId: brief.createdBy,
        tags: data.tagIds.length > 0
          ? { create: data.tagIds.map(tagId => ({ tagId })) }
          : undefined,
      },
      include: { tags: { include: { tag: true } } },
    }),
    prisma.brief.update({
      where: { id },
      data: { status: 'accepted' },
    }),
  ]);

  return { content, brief: updatedBrief };
}

export async function rejectBrief(
  id: string,
  data: { reason?: string; regenerate?: boolean }
) {
  const brief = await prisma.brief.findUnique({ where: { id } });
  if (!brief) throw new NotFoundError('Brief', id);

  if (brief.status !== 'generated') {
    throw new ValidationError(
      `Brief must be in "generated" status to reject. Current status: "${brief.status}"`
    );
  }

  await prisma.brief.update({
    where: { id },
    data: {
      status: 'rejected',
      // Store rejection reason in constraints for reference
      constraints: {
        ...(brief.constraints as Record<string, unknown>),
        lastRejectionReason: data.reason || null,
      },
    },
  });

  // Optionally trigger regeneration
  if (data.regenerate) {
    return generateBrief(id);
  }

  return prisma.brief.findUnique({
    where: { id },
    include: { creator: { select: { id: true, name: true, email: true } } },
  });
}

// ── Prompt Construction ───────────────────────────────────

export function buildPrompt(brief: Brief): string {
  const objectives = (brief.objectives as string[]) || [];
  const constraints = (brief.constraints as Record<string, unknown>) || {};
  const ageGuideline = AGE_GUIDELINES[brief.ageGroup] || AGE_GUIDELINES.all;

  const parts: string[] = [
    `# Content Generation Brief`,
    ``,
    `## Content Type: ${brief.type}`,
    `## Age Group: ${brief.ageGroup.replace('age_', '').replace('_', '-')}`,
    ``,
    `## Description`,
    brief.description,
    ``,
    `## Learning Objectives`,
    ...objectives.map((obj, i) => `${i + 1}. ${obj}`),
    ``,
    `## Age-Appropriate Guidelines`,
    ageGuideline,
    ``,
    `## Safety Requirements`,
    `- All content MUST be safe and appropriate for young children.`,
    `- No violence, scary elements, or negative stereotypes.`,
    `- Promote inclusivity, kindness, and positive values.`,
    `- Use gentle, encouraging language.`,
    `- Characters should reflect diversity.`,
  ];

  // Add constraints
  if (Object.keys(constraints).length > 0) {
    parts.push(``, `## Additional Constraints`);
    if (constraints.maxWords) {
      parts.push(`- Maximum word count: ${constraints.maxWords}`);
    }
    if (constraints.tone) {
      parts.push(`- Tone: ${constraints.tone}`);
    }
    if (Array.isArray(constraints.avoidTopics) && constraints.avoidTopics.length > 0) {
      parts.push(`- Topics to avoid: ${(constraints.avoidTopics as string[]).join(', ')}`);
    }
    if (Array.isArray(constraints.requiredElements) && constraints.requiredElements.length > 0) {
      parts.push(`- Required elements: ${(constraints.requiredElements as string[]).join(', ')}`);
    }
    if (constraints.readingLevel) {
      parts.push(`- Reading level: ${constraints.readingLevel}`);
    }
  }

  parts.push(
    ``,
    `## Output Format`,
    `Respond with a JSON object containing:`,
    `- "title": string — the content title`,
    `- "description": string — a short description (1-2 sentences)`,
    `- "body": object — the structured content body appropriate for the content type`,
    `- "keywords": string[] — relevant keywords for discoverability`,
    `- "estimatedDuration": number — estimated engagement time in minutes`,
  );

  return parts.join('\n');
}
