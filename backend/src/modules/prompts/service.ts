import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError, ConflictError } from '../../lib/errors.js';
import type { PaginationParams } from '../../types/index.js';
import { paginate } from '../../types/index.js';
import type { Prisma } from '@prisma/client';

// ── Variable Definition Type ──────────────────────────────

interface VariableDefinition {
  name: string;
  description?: string;
  required: boolean;
  defaultValue?: string;
}

// ── List Prompts ──────────────────────────────────────────

export async function listPrompts(
  params: PaginationParams & {
    category?: string;
    isActive?: boolean;
    search?: string;
  }
) {
  const where: Prisma.PromptWhereInput = {};
  if (params.category) where.category = params.category;
  if (params.isActive !== undefined) where.isActive = params.isActive;
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
      { template: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const skip = (params.page - 1) * params.limit;
  const orderBy: Prisma.PromptOrderByWithRelationInput = {
    [params.sortBy || 'createdAt']: params.sortOrder || 'desc',
  };

  const [prompts, total] = await prisma.$transaction([
    prisma.prompt.findMany({
      where,
      skip,
      take: params.limit,
      orderBy,
      include: {
        _count: { select: { usageLog: true } },
      },
    }),
    prisma.prompt.count({ where }),
  ]);

  return paginate(prompts, total, params);
}

// ── Get Prompt by ID ──────────────────────────────────────

export async function getPromptById(id: string) {
  const prompt = await prisma.prompt.findUnique({
    where: { id },
    include: {
      _count: { select: { usageLog: true } },
    },
  });
  if (!prompt) throw new NotFoundError('Prompt', id);

  // Compute basic usage stats inline
  const stats = await getUsageStats(id);

  return { ...prompt, usageStats: stats };
}

// ── Create Prompt ─────────────────────────────────────────

export async function createPrompt(data: {
  name: string;
  category: string;
  template: string;
  variables: VariableDefinition[];
  description?: string;
  isActive: boolean;
}) {
  // Check name uniqueness
  const existing = await prisma.prompt.findUnique({ where: { name: data.name } });
  if (existing) {
    throw new ConflictError(`Prompt with name "${data.name}" already exists`);
  }

  // Validate that template contains placeholders for all required variables
  validateTemplateVariables(data.template, data.variables);

  return prisma.prompt.create({
    data: {
      name: data.name,
      category: data.category,
      template: data.template,
      variables: data.variables as unknown as Prisma.InputJsonValue,
      description: data.description,
      isActive: data.isActive,
      version: 1,
    },
  });
}

// ── Update Prompt (creates new version) ───────────────────

export async function updatePrompt(
  id: string,
  data: Partial<{
    template: string;
    variables: VariableDefinition[];
    description: string;
    isActive: boolean;
    category: string;
  }>
) {
  const existing = await prisma.prompt.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Prompt', id);

  const updateData: Prisma.PromptUpdateInput = {};
  let shouldIncrementVersion = false;

  if (data.template !== undefined) {
    updateData.template = data.template;
    shouldIncrementVersion = true;
  }
  if (data.variables !== undefined) {
    updateData.variables = data.variables as unknown as Prisma.InputJsonValue;
    shouldIncrementVersion = true;
  }
  if (data.description !== undefined) {
    updateData.description = data.description;
  }
  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
  }
  if (data.category !== undefined) {
    updateData.category = data.category;
  }

  // Validate template + variables consistency if either changed
  const finalTemplate = data.template || existing.template;
  const finalVariables = data.variables || (existing.variables as unknown as VariableDefinition[]);
  if (data.template || data.variables) {
    validateTemplateVariables(finalTemplate, finalVariables);
  }

  // Increment version if template or variables changed
  if (shouldIncrementVersion) {
    updateData.version = existing.version + 1;
  }

  return prisma.prompt.update({
    where: { id },
    data: updateData,
  });
}

// ── Render Prompt ─────────────────────────────────────────

export async function renderPrompt(id: string, variables: Record<string, string>) {
  const prompt = await prisma.prompt.findUnique({ where: { id } });
  if (!prompt) throw new NotFoundError('Prompt', id);

  if (!prompt.isActive) {
    throw new ValidationError('Cannot render an inactive prompt');
  }

  const variableDefs = (prompt.variables as unknown as VariableDefinition[]) || [];

  // Check all required variables are provided
  const missingRequired: string[] = [];
  for (const varDef of variableDefs) {
    if (varDef.required && !variables[varDef.name] && !varDef.defaultValue) {
      missingRequired.push(varDef.name);
    }
  }

  if (missingRequired.length > 0) {
    throw new ValidationError(
      `Missing required variables: ${missingRequired.join(', ')}`,
      { variables: missingRequired.map(v => `Variable "${v}" is required`) }
    );
  }

  // Build the complete variables map with defaults
  const completeVariables: Record<string, string> = {};
  for (const varDef of variableDefs) {
    completeVariables[varDef.name] = variables[varDef.name] || varDef.defaultValue || '';
  }

  // Perform substitution
  const rendered = substituteVariables(prompt.template, completeVariables);

  return {
    promptId: prompt.id,
    promptName: prompt.name,
    version: prompt.version,
    rendered,
    variablesUsed: completeVariables,
  };
}

// ── Test Render (same as render but doesn't require active status) ──

export async function testRender(id: string, variables: Record<string, string>) {
  const prompt = await prisma.prompt.findUnique({ where: { id } });
  if (!prompt) throw new NotFoundError('Prompt', id);

  const variableDefs = (prompt.variables as unknown as VariableDefinition[]) || [];

  // Build the complete variables map with defaults
  const completeVariables: Record<string, string> = {};
  for (const varDef of variableDefs) {
    completeVariables[varDef.name] = variables[varDef.name] || varDef.defaultValue || '';
  }

  // Also include any extra variables provided that aren't defined
  for (const [key, value] of Object.entries(variables)) {
    if (!completeVariables[key]) {
      completeVariables[key] = value;
    }
  }

  const rendered = substituteVariables(prompt.template, completeVariables);

  // Identify any unresolved placeholders
  const unresolvedPattern = /\{\{([^}]+)\}\}/g;
  const unresolved: string[] = [];
  let match;
  while ((match = unresolvedPattern.exec(rendered)) !== null) {
    unresolved.push(match[1].trim());
  }

  return {
    promptId: prompt.id,
    promptName: prompt.name,
    version: prompt.version,
    rendered,
    variablesUsed: completeVariables,
    unresolvedVariables: unresolved,
    isComplete: unresolved.length === 0,
  };
}

// ── Log Usage ─────────────────────────────────────────────

export async function logUsage(
  promptId: string,
  input: Record<string, unknown>,
  output: Record<string, unknown>,
  tokensUsed?: number,
  latencyMs?: number
) {
  const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
  if (!prompt) throw new NotFoundError('Prompt', promptId);

  return prisma.promptUsage.create({
    data: {
      promptId,
      input: input as Prisma.InputJsonValue,
      output: output as Prisma.InputJsonValue,
      tokensUsed: tokensUsed ?? null,
      latencyMs: latencyMs ?? null,
    },
  });
}

// ── Get Usage Stats ───────────────────────────────────────

export async function getUsageStats(promptId: string) {
  const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
  if (!prompt) throw new NotFoundError('Prompt', promptId);

  const usages = await prisma.promptUsage.findMany({
    where: { promptId },
    select: { tokensUsed: true, latencyMs: true },
  });

  const totalUses = usages.length;
  if (totalUses === 0) {
    return {
      totalUses: 0,
      avgTokensUsed: 0,
      avgLatencyMs: 0,
      minTokensUsed: 0,
      maxTokensUsed: 0,
      minLatencyMs: 0,
      maxLatencyMs: 0,
    };
  }

  const tokensValues = usages.filter(u => u.tokensUsed !== null).map(u => u.tokensUsed!);
  const latencyValues = usages.filter(u => u.latencyMs !== null).map(u => u.latencyMs!);

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const avg = (arr: number[]) => (arr.length > 0 ? Math.round(sum(arr) / arr.length) : 0);

  return {
    totalUses,
    avgTokensUsed: avg(tokensValues),
    avgLatencyMs: avg(latencyValues),
    minTokensUsed: tokensValues.length > 0 ? Math.min(...tokensValues) : 0,
    maxTokensUsed: tokensValues.length > 0 ? Math.max(...tokensValues) : 0,
    minLatencyMs: latencyValues.length > 0 ? Math.min(...latencyValues) : 0,
    maxLatencyMs: latencyValues.length > 0 ? Math.max(...latencyValues) : 0,
  };
}

// ── Get Usage History ─────────────────────────────────────

export async function getUsageHistory(
  promptId: string,
  params: PaginationParams
) {
  const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
  if (!prompt) throw new NotFoundError('Prompt', promptId);

  const skip = (params.page - 1) * params.limit;

  const [usages, total] = await prisma.$transaction([
    prisma.promptUsage.findMany({
      where: { promptId },
      skip,
      take: params.limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.promptUsage.count({ where: { promptId } }),
  ]);

  return paginate(usages, total, params);
}

// ── Template Variable Substitution ────────────────────────

function substituteVariables(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\s*[^}]+\s*)\}\}/g, (_match, key: string) => {
    const trimmedKey = key.trim();
    if (trimmedKey in variables) {
      return variables[trimmedKey];
    }
    // Return the original placeholder if variable not found
    return `{{${trimmedKey}}}`;
  });
}

// ── Template Validation ───────────────────────────────────

function validateTemplateVariables(template: string, variables: VariableDefinition[]) {
  // Extract all placeholder names from template
  const placeholderPattern = /\{\{(\s*[^}]+\s*)\}\}/g;
  const templateVarNames = new Set<string>();
  let match;
  while ((match = placeholderPattern.exec(template)) !== null) {
    templateVarNames.add(match[1].trim());
  }

  // Check that all defined variables appear in the template
  const definedNames = new Set(variables.map(v => v.name));
  const unusedVariables = variables.filter(v => !templateVarNames.has(v.name));
  const undefinedPlaceholders = [...templateVarNames].filter(name => !definedNames.has(name));

  const warnings: string[] = [];
  if (unusedVariables.length > 0) {
    warnings.push(
      `Variables defined but not used in template: ${unusedVariables.map(v => v.name).join(', ')}`
    );
  }
  if (undefinedPlaceholders.length > 0) {
    warnings.push(
      `Placeholders in template without variable definitions: ${undefinedPlaceholders.join(', ')}`
    );
  }

  // Only throw for undefined placeholders referenced as required
  // Unused definitions are warnings only (logged but not blocking)
  if (undefinedPlaceholders.length > 0) {
    throw new ValidationError(
      `Template contains undefined placeholders: ${undefinedPlaceholders.join(', ')}. Define these in the variables array or remove them from the template.`
    );
  }
}
