import { prisma } from './prisma.js';

export interface PolicyCheckResult {
  policyId: string;
  policyName: string;
  category: string;
  severity: string;
  status: 'pass' | 'warning' | 'block';
  message: string | null;
}

/**
 * Evaluate all enabled content policies against a piece of content.
 */
export async function evaluateContentPolicies(contentId: string): Promise<PolicyCheckResult[]> {
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: { tags: { include: { tag: true } }, skills: { include: { skill: true } } },
  });

  if (!content) return [];

  const policies = await prisma.contentPolicy.findMany({
    where: { enabled: true },
  });

  const results: PolicyCheckResult[] = [];

  for (const policy of policies) {
    const result = evaluateSinglePolicy(policy, content);
    results.push(result);

    // Store result in database
    await prisma.policyResult.upsert({
      where: {
        id: `${contentId}-${policy.id}`, // Will fail, use create instead
      },
      update: {
        status: result.status,
        message: result.message,
        checkedAt: new Date(),
      },
      create: {
        contentId,
        policyId: policy.id,
        status: result.status,
        message: result.message,
      },
    }).catch(async () => {
      // Upsert fallback: just create
      await prisma.policyResult.create({
        data: {
          contentId,
          policyId: policy.id,
          status: result.status,
          message: result.message,
        },
      });
    });
  }

  return results;
}

function evaluateSinglePolicy(
  policy: { id: string; name: string; category: string; severity: string; rules: unknown },
  content: Record<string, unknown>
): PolicyCheckResult {
  const rules = policy.rules as Record<string, unknown>;
  const base = {
    policyId: policy.id,
    policyName: policy.name,
    category: policy.category,
    severity: policy.severity,
  };

  try {
    switch (policy.category) {
      case 'age_appropriateness': {
        const requiredAge = rules.requiredAgeGroup as string | undefined;
        if (requiredAge && content.ageGroup !== requiredAge && content.ageGroup !== 'all') {
          return { ...base, status: 'warning', message: `Content age group mismatch: expected ${requiredAge}` };
        }
        return { ...base, status: 'pass', message: null };
      }

      case 'bedtime_suitability': {
        if (content.bedtimeFriendly && content.energyLevel === 'active') {
          return { ...base, status: 'block', message: 'Bedtime content should not have active energy level' };
        }
        return { ...base, status: 'pass', message: null };
      }

      case 'off_brand_language': {
        const bannedWords = (rules.bannedWords as string[]) ?? [];
        const body = JSON.stringify(content.body ?? '').toLowerCase();
        const title = String(content.title ?? '').toLowerCase();
        const found = bannedWords.filter((w) => body.includes(w) || title.includes(w));
        if (found.length > 0) {
          return { ...base, status: 'block', message: `Off-brand language detected: ${found.join(', ')}` };
        }
        return { ...base, status: 'pass', message: null };
      }

      case 'educational_mismatch': {
        const skills = content.skills as Array<{ skill: { category: string } }> | undefined;
        if (!skills || skills.length === 0) {
          return { ...base, status: 'warning', message: 'Content has no associated skills' };
        }
        return { ...base, status: 'pass', message: null };
      }

      default:
        return { ...base, status: 'pass', message: null };
    }
  } catch {
    return { ...base, status: 'warning', message: 'Policy evaluation error' };
  }
}
