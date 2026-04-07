import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError, ConflictError } from '../../lib/errors.js';
import { aiQueue } from '../../lib/queue.js';
import type { PaginationParams } from '../../types/index.js';
import { paginate } from '../../types/index.js';
import { Prisma } from '@prisma/client';

// ── Pipeline Step Definitions ─────────────────────────────

const PIPELINE_STEPS = [
  { step: 'outline', orderIndex: 0 },
  { step: 'draft', orderIndex: 1 },
  { step: 'review', orderIndex: 2 },
  { step: 'illustration', orderIndex: 3 },
  { step: 'voiceover', orderIndex: 4 },
  { step: 'assembly', orderIndex: 5 },
] as const;

// ── Get Steps for Content ─────────────────────────────────

export async function getSteps(contentId: string) {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) throw new NotFoundError('Content', contentId);

  const steps = await prisma.storyStep.findMany({
    where: { contentId },
    orderBy: { orderIndex: 'asc' },
  });

  return { content: { id: content.id, title: content.title, type: content.type }, steps };
}

// ── Start Pipeline ────────────────────────────────────────

export async function startPipeline(contentId: string) {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) throw new NotFoundError('Content', contentId);

  if (content.type !== 'story') {
    throw new ValidationError('Story pipeline can only be started for story content');
  }

  // Check if pipeline already exists
  const existingSteps = await prisma.storyStep.findMany({
    where: { contentId },
  });
  if (existingSteps.length > 0) {
    throw new ConflictError('Pipeline already exists for this content. Delete existing steps first.');
  }

  // Create all 6 steps: first one is in_progress, rest are pending
  const steps = await prisma.$transaction(
    PIPELINE_STEPS.map((stepDef, index) =>
      prisma.storyStep.create({
        data: {
          contentId,
          step: stepDef.step,
          orderIndex: stepDef.orderIndex,
          status: index === 0 ? 'in_progress' : 'pending',
          data: {} as Prisma.InputJsonValue,
        },
      })
    )
  );

  return { contentId, steps };
}

// ── Update Step ───────────────────────────────────────────

export async function updateStep(
  contentId: string,
  stepId: string,
  data: { data?: Record<string, unknown>; status?: string }
) {
  const step = await prisma.storyStep.findFirst({
    where: { id: stepId, contentId },
  });
  if (!step) throw new NotFoundError('StoryStep', stepId);

  const updateData: Prisma.StoryStepUpdateInput = {};
  if (data.data !== undefined) {
    // Merge new data with existing data
    const existingData = (step.data as Record<string, unknown>) || {};
    updateData.data = { ...existingData, ...data.data } as Prisma.InputJsonValue;
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  return prisma.storyStep.update({
    where: { id: stepId },
    data: updateData,
  });
}

// ── Advance Step ──────────────────────────────────────────

export async function advanceStep(contentId: string, stepId: string) {
  const steps = await prisma.storyStep.findMany({
    where: { contentId },
    orderBy: { orderIndex: 'asc' },
  });

  if (steps.length === 0) {
    throw new NotFoundError('Pipeline steps for content', contentId);
  }

  const currentStep = steps.find(s => s.id === stepId);
  if (!currentStep) throw new NotFoundError('StoryStep', stepId);

  if (currentStep.status === 'completed') {
    throw new ConflictError('Step is already completed');
  }

  if (currentStep.status !== 'in_progress') {
    throw new ValidationError(
      `Step must be "in_progress" to advance. Current status: "${currentStep.status}"`
    );
  }

  // Find next step
  const nextStep = steps.find(s => s.orderIndex === currentStep.orderIndex + 1);

  // Complete current step and activate next in a transaction
  const updates: Prisma.PrismaPromise<unknown>[] = [
    prisma.storyStep.update({
      where: { id: stepId },
      data: { status: 'completed' },
    }),
  ];

  if (nextStep) {
    updates.push(
      prisma.storyStep.update({
        where: { id: nextStep.id },
        data: { status: 'in_progress' },
      })
    );
  }

  await prisma.$transaction(updates);

  // Return updated steps
  return prisma.storyStep.findMany({
    where: { contentId },
    orderBy: { orderIndex: 'asc' },
  });
}

// ── Generate Outline ──────────────────────────────────────

export async function generateOutline(
  contentId: string,
  params: {
    targetAgeGroup?: string;
    theme?: string;
    moral?: string;
    characterCount?: number;
    sceneCount?: number;
  }
) {
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: { tags: { include: { tag: true } } },
  });
  if (!content) throw new NotFoundError('Content', contentId);

  // Ensure outline step exists and is active
  const outlineStep = await prisma.storyStep.findFirst({
    where: { contentId, step: 'outline' },
  });
  if (!outlineStep) {
    throw new ValidationError('Pipeline not started. Start the pipeline first.');
  }
  if (outlineStep.status === 'completed') {
    throw new ConflictError('Outline step is already completed');
  }

  // Mark step as in_progress
  await prisma.storyStep.update({
    where: { id: outlineStep.id },
    data: { status: 'in_progress' },
  });

  // Build outline prompt
  const tagNames = content.tags.map(ct => ct.tag.name);
  const prompt = buildOutlinePrompt(content, tagNames, params);

  // Queue AI generation
  await aiQueue.add('generate-story-outline', {
    type: 'story' as const,
    contentId,
    params: {
      prompt,
      stepId: outlineStep.id,
      operation: 'outline',
      targetAgeGroup: params.targetAgeGroup || content.ageGroup,
      characterCount: params.characterCount || 3,
      sceneCount: params.sceneCount || 5,
    },
  });

  return {
    message: 'Outline generation queued',
    stepId: outlineStep.id,
    contentId,
  };
}

// ── Generate Draft ────────────────────────────────────────

export async function generateDraft(
  contentId: string,
  params: {
    maxWords?: number;
    tone?: string;
    includeDialogue?: boolean;
  }
) {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) throw new NotFoundError('Content', contentId);

  const steps = await prisma.storyStep.findMany({
    where: { contentId },
    orderBy: { orderIndex: 'asc' },
  });

  // Ensure outline step is completed
  const outlineStep = steps.find(s => s.step === 'outline');
  if (!outlineStep || outlineStep.status !== 'completed') {
    throw new ValidationError('Outline step must be completed before generating a draft');
  }

  // Ensure draft step exists
  const draftStep = steps.find(s => s.step === 'draft');
  if (!draftStep) {
    throw new ValidationError('Draft step not found in pipeline');
  }
  if (draftStep.status === 'completed') {
    throw new ConflictError('Draft step is already completed');
  }

  // Mark draft step as in_progress
  await prisma.storyStep.update({
    where: { id: draftStep.id },
    data: { status: 'in_progress' },
  });

  // Get outline data for the draft prompt
  const outlineData = outlineStep.data as Record<string, unknown>;
  const prompt = buildDraftPrompt(content, outlineData, params);

  // Queue AI generation
  await aiQueue.add('generate-story-draft', {
    type: 'story' as const,
    contentId,
    params: {
      prompt,
      stepId: draftStep.id,
      operation: 'draft',
      outlineData,
      maxWords: params.maxWords || 1000,
      includeDialogue: params.includeDialogue ?? true,
    },
  });

  return {
    message: 'Draft generation queued',
    stepId: draftStep.id,
    contentId,
  };
}

// ── Active Stories Count ──────────────────────────────────

export async function getActivePipelines(
  params: PaginationParams & { step?: string }
) {
  // Find content IDs that have active (non-completed) pipeline steps
  const where: Prisma.StoryStepWhereInput = {
    status: { in: ['in_progress', 'pending'] },
  };
  if (params.step) {
    where.step = params.step;
  }

  // Get distinct content IDs with active steps
  const activeSteps = await prisma.storyStep.findMany({
    where,
    select: { contentId: true },
    distinct: ['contentId'],
  });

  const contentIds = activeSteps.map(s => s.contentId);
  const total = contentIds.length;

  // Paginate the content IDs
  const skip = (params.page - 1) * params.limit;
  const paginatedIds = contentIds.slice(skip, skip + params.limit);

  // Get full content + step data for paginated set
  const stories = await Promise.all(
    paginatedIds.map(async (contentId) => {
      const [content, steps] = await Promise.all([
        prisma.content.findUnique({
          where: { id: contentId },
          select: { id: true, title: true, slug: true, type: true, ageGroup: true, status: true },
        }),
        prisma.storyStep.findMany({
          where: { contentId },
          orderBy: { orderIndex: 'asc' },
        }),
      ]);

      const currentStep = steps.find(s => s.status === 'in_progress');
      const completedCount = steps.filter(s => s.status === 'completed').length;

      return {
        content,
        steps,
        currentStep: currentStep?.step || null,
        progress: {
          completed: completedCount,
          total: steps.length,
          percentage: steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0,
        },
      };
    })
  );

  return paginate(stories, total, params);
}

export async function getActiveStoriesCount() {
  const steps = await prisma.storyStep.findMany({
    where: { status: 'in_progress' },
    select: { step: true },
  });

  const counts: Record<string, number> = {
    outline: 0,
    draft: 0,
    review: 0,
    illustration: 0,
    voiceover: 0,
    assembly: 0,
  };

  for (const s of steps) {
    if (s.step in counts) {
      counts[s.step]++;
    }
  }

  return counts;
}

// ── Prompt Builders ───────────────────────────────────────

function buildOutlinePrompt(
  content: { title: string; description: string; ageGroup: string },
  tags: string[],
  params: {
    targetAgeGroup?: string;
    theme?: string;
    moral?: string;
    characterCount?: number;
    sceneCount?: number;
  }
): string {
  const ageGroup = params.targetAgeGroup || content.ageGroup;
  const sceneCount = params.sceneCount || 5;
  const characterCount = params.characterCount || 3;

  const parts = [
    `# Story Outline Generation`,
    ``,
    `## Story Title: ${content.title}`,
    `## Description: ${content.description}`,
    `## Age Group: ${ageGroup.replace('age_', '').replace('_', '-')}`,
    tags.length > 0 ? `## Tags: ${tags.join(', ')}` : '',
    ``,
    `## Requirements`,
    `- Create ${characterCount} characters suitable for the target age group.`,
    `- Design ${sceneCount} scenes that form a coherent narrative arc.`,
    `- Include a clear moral or learning outcome.`,
    `- All characters must be diverse and inclusive.`,
    `- Content must be age-appropriate, gentle, and encouraging.`,
    params.theme ? `- Theme: ${params.theme}` : '',
    params.moral ? `- Intended moral: ${params.moral}` : '',
    ``,
    `## Output Format (JSON)`,
    `{`,
    `  "characters": [{ "name": string, "description": string, "role": string }],`,
    `  "scenes": [{ "sceneNumber": number, "title": string, "summary": string, "setting": string, "characters": string[] }],`,
    `  "moral": string,`,
    `  "estimatedWordCount": number,`,
    `  "suggestedIllustrations": [{ "scene": number, "description": string }]`,
    `}`,
  ];

  return parts.filter(Boolean).join('\n');
}

function buildDraftPrompt(
  content: { title: string; ageGroup: string },
  outlineData: Record<string, unknown>,
  params: {
    maxWords?: number;
    tone?: string;
    includeDialogue?: boolean;
  }
): string {
  const maxWords = params.maxWords || 1000;
  const tone = params.tone || 'warm and encouraging';

  const parts = [
    `# Story Draft Generation`,
    ``,
    `## Story Title: ${content.title}`,
    `## Age Group: ${content.ageGroup.replace('age_', '').replace('_', '-')}`,
    `## Tone: ${tone}`,
    `## Max Words: ${maxWords}`,
    params.includeDialogue !== false ? `## Include dialogue between characters.` : `## Narration only, no dialogue.`,
    ``,
    `## Story Outline`,
    `\`\`\`json`,
    JSON.stringify(outlineData, null, 2),
    `\`\`\``,
    ``,
    `## Instructions`,
    `- Write the full story based on the outline above.`,
    `- Keep the language simple and age-appropriate.`,
    `- Use short paragraphs and sentences.`,
    `- Include sensory details children can relate to.`,
    `- Build up to the moral naturally through the story.`,
    `- End on a positive, satisfying note.`,
    `- No scary content, violence, or exclusionary themes.`,
    ``,
    `## Output Format (JSON)`,
    `{`,
    `  "fullText": string,`,
    `  "pages": [{ "pageNumber": number, "text": string, "illustrationHint": string }],`,
    `  "wordCount": number,`,
    `  "readingTimeMinutes": number,`,
    `  "vocabulary": [{ "word": string, "definition": string }]`,
    `}`,
  ];

  return parts.join('\n');
}
