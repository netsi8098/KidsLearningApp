import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Deterministic IDs for edge case entities
const EDGE = {
  hhMaxKids:     'e0000000-0000-0000-0000-000000000001',
  hhExpiringSoon: 'e0000000-0000-0000-0000-000000000002',
  hhMaxStars:    'e0000000-0000-0000-0000-000000000003',
  parentMax:     'e1000000-0000-0000-0000-000000000001',
  parentExpSoon: 'e1000000-0000-0000-0000-000000000002',
  parentStars:   'e1000000-0000-0000-0000-000000000003',
  childMax1:     'e2000000-0000-0000-0000-000000000001',
  childMax2:     'e2000000-0000-0000-0000-000000000002',
  childMax3:     'e2000000-0000-0000-0000-000000000003',
  childMax4:     'e2000000-0000-0000-0000-000000000004',
  childMax5:     'e2000000-0000-0000-0000-000000000005',
  childStars:    'e2000000-0000-0000-0000-000000000006',
  edgeUser:      'e3000000-0000-0000-0000-000000000001',
};

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function hoursFromNow(hours: number): Date {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d;
}

function daysAgo(days: number): Date {
  return daysFromNow(-days);
}

async function seedEdgeCases() {
  console.log('Seeding edge case scenarios...\n');

  const pw = await bcrypt.hash('edgecase123', 12);
  const parentPw = await bcrypt.hash('parent123', 12);

  // Ensure an editor user exists for authoring
  const edgeUser = await prisma.user.upsert({
    where: { email: 'edge@staging.kidslearning.app' },
    update: {},
    create: {
      id: EDGE.edgeUser,
      email: 'edge@staging.kidslearning.app',
      name: 'Edge Case Editor',
      password: pw,
      role: 'editor',
    },
  });

  // ── 1. Content with very long title (200 chars) ─────────

  const longTitle = 'The Amazing Incredible Super Duper Extra Long Title About Learning Colors Shapes Numbers Letters Animals And Everything Else A Young Child Could Ever Want To Know About In A Single Activity Session';
  await prisma.content.upsert({
    where: { slug: 'edge-long-title' },
    update: {},
    create: {
      slug: 'edge-long-title',
      type: 'lesson',
      title: longTitle.substring(0, 200),
      emoji: '',
      description: 'Tests rendering of extremely long titles in cards, lists, and detail views.',
      body: { note: 'Edge case: long title' },
      status: 'published',
      accessTier: 'free',
      ageGroup: 'all',
      authorId: edgeUser.id,
      publishedAt: new Date(),
    },
  });
  console.log('  [Edge] Long title content (200 chars)');

  // ── 2. Content with no tags or skills ───────────────────

  await prisma.content.upsert({
    where: { slug: 'edge-no-tags' },
    update: {},
    create: {
      slug: 'edge-no-tags',
      type: 'lesson',
      title: 'Untagged Content',
      emoji: '',
      description: 'Content with zero tags and zero skills to test empty-state handling.',
      body: { note: 'Edge case: no tags, no skills' },
      status: 'published',
      accessTier: 'free',
      ageGroup: 'all',
      authorId: edgeUser.id,
      publishedAt: new Date(),
    },
  });
  console.log('  [Edge] Content with no tags or skills');

  // ── 3. Content with empty body ──────────────────────────

  await prisma.content.upsert({
    where: { slug: 'edge-empty-body' },
    update: {},
    create: {
      slug: 'edge-empty-body',
      type: 'lesson',
      title: 'Empty Body Content',
      emoji: '',
      description: '',
      body: {},
      status: 'draft',
      accessTier: 'free',
      ageGroup: 'all',
      authorId: edgeUser.id,
    },
  });
  console.log('  [Edge] Content with empty body and description');

  // ── 4. Content with very long description ───────────────

  const longDesc = 'This is an exceptionally long description that goes well beyond what most content items would normally have. '.repeat(10);
  await prisma.content.upsert({
    where: { slug: 'edge-long-desc' },
    update: {},
    create: {
      slug: 'edge-long-desc',
      type: 'story',
      title: 'Long Description Story',
      emoji: '',
      description: longDesc.substring(0, 1000),
      body: { pages: [{ text: 'Page 1' }] },
      status: 'published',
      accessTier: 'free',
      ageGroup: 'all',
      authorId: edgeUser.id,
      publishedAt: new Date(),
    },
  });
  console.log('  [Edge] Content with very long description (1000 chars)');

  // ── 5. Content in every possible status ─────────────────

  const statuses = ['draft', 'review', 'approved', 'scheduled', 'published', 'archived'] as const;
  for (const status of statuses) {
    const slug = `edge-status-${status}`;
    await prisma.content.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        type: 'lesson',
        title: `Status: ${status}`,
        emoji: '',
        description: `Content item in ${status} status for testing.`,
        body: { status },
        status,
        accessTier: 'free',
        ageGroup: 'all',
        authorId: edgeUser.id,
        publishedAt: status === 'published' ? new Date() : null,
        scheduledAt: status === 'scheduled' ? daysFromNow(14) : null,
        archivedAt: status === 'archived' ? daysAgo(7) : null,
      },
    });
  }
  console.log('  [Edge] Content in every status (6 items)');

  // ── 6. Content with every content type ──────────────────

  const allTypes = [
    'alphabet', 'number', 'color', 'shape', 'animal', 'bodypart',
    'lesson', 'story', 'video', 'game', 'audio', 'cooking',
    'movement', 'homeactivity', 'explorer', 'lifeskill', 'coloring',
    'emotion', 'quiz', 'collection', 'playlist',
  ] as const;

  for (const ctype of allTypes) {
    const slug = `edge-type-${ctype}`;
    try {
      await prisma.content.upsert({
        where: { slug },
        update: {},
        create: {
          slug,
          type: ctype,
          title: `Type: ${ctype}`,
          emoji: '',
          description: `Edge case content of type ${ctype}.`,
          body: { type: ctype },
          status: 'draft',
          accessTier: 'free',
          ageGroup: 'all',
          authorId: edgeUser.id,
        },
      });
    } catch { /* skip if type not in enum */ }
  }
  console.log(`  [Edge] Content for every content type (${allTypes.length} items)`);

  // ── 7. Bedtime content with active energy (policy violation) ──

  await prisma.content.upsert({
    where: { slug: 'edge-bedtime-active' },
    update: {},
    create: {
      slug: 'edge-bedtime-active',
      type: 'game',
      title: 'Bedtime Jump Game',
      emoji: '',
      description: 'Policy violation: bedtime-friendly but active energy.',
      body: { note: 'Should trigger bedtime-energy-check policy' },
      status: 'review',
      accessTier: 'free',
      ageGroup: 'all',
      energyLevel: 'active',
      bedtimeFriendly: true,
      authorId: edgeUser.id,
    },
  });
  console.log('  [Edge] Bedtime + active energy policy violation');

  // ── 8. Household with 5 child profiles (max) ───────────

  await prisma.household.upsert({
    where: { id: EDGE.hhMaxKids },
    update: {},
    create: {
      id: EDGE.hhMaxKids,
      name: 'Max Kids Family',
      timezone: 'America/New_York',
      locale: 'en',
      plan: 'premium',
    },
  });

  await prisma.parentAccount.upsert({
    where: { email: 'maxkids@edge.test' },
    update: {},
    create: {
      id: EDGE.parentMax,
      householdId: EDGE.hhMaxKids,
      email: 'maxkids@edge.test',
      name: 'Max Kids Parent',
      password: parentPw,
      role: 'primary',
    },
  });

  const childNames = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo'];
  const childIds = [EDGE.childMax1, EDGE.childMax2, EDGE.childMax3, EDGE.childMax4, EDGE.childMax5];
  const childAges = ['age_2_3', 'age_3_4', 'age_4_5', 'age_5_6', 'age_2_3'] as const;
  const childEmojis = ['', '', '', '', ''];

  for (let i = 0; i < 5; i++) {
    try {
      await prisma.childProfile.create({
        data: {
          id: childIds[i],
          householdId: EDGE.hhMaxKids,
          name: childNames[i],
          avatarEmoji: childEmojis[i],
          ageGroup: childAges[i],
          interests: JSON.stringify(['animals', 'colors']),
          totalStars: (i + 1) * 100,
          streakDays: i * 3,
        },
      });
    } catch { /* may already exist */ }
  }
  console.log('  [Edge] Household with 5 child profiles (max)');

  // ── 9. Subscription that expires in 1 hour ─────────────

  await prisma.household.upsert({
    where: { id: EDGE.hhExpiringSoon },
    update: {},
    create: {
      id: EDGE.hhExpiringSoon,
      name: 'Expiring Soon Family',
      timezone: 'UTC',
      locale: 'en',
      plan: 'premium',
    },
  });

  await prisma.parentAccount.upsert({
    where: { email: 'expiring@edge.test' },
    update: {},
    create: {
      id: EDGE.parentExpSoon,
      householdId: EDGE.hhExpiringSoon,
      email: 'expiring@edge.test',
      name: 'Expiring Parent',
      password: parentPw,
      role: 'primary',
    },
  });

  try {
    await prisma.subscription.create({
      data: {
        householdId: EDGE.hhExpiringSoon,
        plan: 'premium_monthly',
        status: 'active',
        currentPeriodStart: daysAgo(30),
        currentPeriodEnd: hoursFromNow(1),
        provider: 'manual',
        metadata: { note: 'Edge case: expires in 1 hour' },
      },
    });
  } catch { /* skip */ }
  console.log('  [Edge] Subscription expiring in 1 hour');

  // ── 10. Profile with maximum stars (99999) ──────────────

  await prisma.household.upsert({
    where: { id: EDGE.hhMaxStars },
    update: {},
    create: {
      id: EDGE.hhMaxStars,
      name: 'Max Stars Family',
      timezone: 'UTC',
      locale: 'en',
      plan: 'premium',
    },
  });

  await prisma.parentAccount.upsert({
    where: { email: 'maxstars@edge.test' },
    update: {},
    create: {
      id: EDGE.parentStars,
      householdId: EDGE.hhMaxStars,
      email: 'maxstars@edge.test',
      name: 'Star Parent',
      password: parentPw,
      role: 'primary',
    },
  });

  try {
    await prisma.childProfile.create({
      data: {
        id: EDGE.childStars,
        householdId: EDGE.hhMaxStars,
        name: 'Superstar',
        avatarEmoji: '',
        ageGroup: 'age_5_6',
        interests: JSON.stringify(['everything']),
        totalStars: 99999,
        streakDays: 365,
      },
    });
  } catch { /* may exist */ }
  console.log('  [Edge] Child profile with 99999 stars and 365-day streak');

  // ── 11. Routine with 20 items ───────────────────────────

  const routineItems = [];
  for (let i = 0; i < 20; i++) {
    routineItems.push({
      contentType: ['alphabet', 'number', 'color', 'shape', 'game'][i % 5],
      label: `Activity ${i + 1}`,
      duration: 3 + (i % 5),
    });
  }

  const existingRoutine = await prisma.routine.findFirst({
    where: { householdId: EDGE.hhMaxKids, name: 'Marathon Routine' },
  });
  if (!existingRoutine) {
    await prisma.routine.create({
      data: {
        householdId: EDGE.hhMaxKids,
        name: 'Marathon Routine',
        type: 'custom',
        items: routineItems,
        isTemplate: false,
        scheduleDays: ['sat'],
        estimatedMinutes: routineItems.reduce((sum, item) => sum + item.duration, 0),
      },
    });
  }
  console.log('  [Edge] Routine with 20 items');

  // ── 12. Message that expires today ──────────────────────

  try {
    await prisma.message.create({
      data: {
        householdId: EDGE.hhExpiringSoon,
        type: 'urgent',
        title: 'Last Chance to Renew!',
        body: 'Your subscription expires today. Renew now to keep premium access.',
        expiresAt: hoursFromNow(2),
        read: false,
        metadata: { urgency: 'high' },
      },
    });
  } catch { /* skip */ }
  console.log('  [Edge] Message expiring in 2 hours');

  // ── 13. Review with many comments (simulating heavy discussion) ──

  const edgeContent = await prisma.content.findUnique({ where: { slug: 'edge-long-title' } });
  if (edgeContent) {
    try {
      const review = await prisma.review.create({
        data: {
          contentId: edgeContent.id,
          reviewerId: edgeUser.id,
          status: 'changes_requested',
          summary: 'Extensive review with 50 comments simulating heavy editorial discussion.',
        },
      });

      const commentBodies = [
        'The title is too long for mobile display.',
        'Agreed, we should truncate at 80 characters on small screens.',
        'What about tablet view?',
        'Tablet should show the full title.',
        'I think we need a subtitle field instead.',
        'Can we add a "shortTitle" field to the schema?',
        'That would require a migration.',
        'Worth it for UX improvement.',
        'Let me check with the design team.',
        'Design says truncation with ellipsis is fine.',
        'OK, I will update the component.',
        'What about accessibility? Screen readers should read the full title.',
        'Good point. We should use aria-label for the full title.',
        'Added aria-label support in the Card component.',
        'Looks good. Testing now.',
        'Found a bug: long titles break the grid layout.',
        'Fixed with overflow-hidden and text-ellipsis.',
        'Confirmed fix works on all breakpoints.',
        'One more thing: SEO title should be different from display title.',
        'We could add a metaTitle field.',
        'That is out of scope for this review.',
        'Agreed, creating a separate ticket.',
        'Back to this review: the body content needs work.',
        'What specifically needs to change?',
        'The educational objectives are unclear.',
        'I will rewrite the objectives section.',
        'Updated. Please re-review.',
        'Much better. The flow is clear now.',
        'One typo in paragraph 3.',
        'Fixed the typo.',
        'Can we add more interactive elements?',
        'That would change the content type from lesson to game.',
        'Let us keep it as lesson for now.',
        'Agreed. Final review pass...',
        'Everything looks clean.',
        'Approving the content structure.',
        'Wait, one more issue: the age group seems wrong.',
        'It is set to "all" but contains advanced concepts.',
        'Changed to age_5_6.',
        'That makes more sense.',
        'Also, should this be premium content?',
        'Given the depth, yes.',
        'Updated to premium tier.',
        'Running QA checks...',
        'All QA checks pass.',
        'Ready for final sign-off.',
        'Signed off by editor.',
        'Signed off by reviewer.',
        'Moving to approved status.',
        'Review complete. 50 comments later!',
      ];

      for (let i = 0; i < 50; i++) {
        await prisma.reviewComment.create({
          data: {
            reviewId: review.id,
            authorId: edgeUser.id,
            body: commentBodies[i],
            field: i < 5 ? 'title' : i < 20 ? 'body' : i < 40 ? 'description' : null,
            resolved: i < 45,
          },
        });
      }
    } catch { /* skip if already created */ }
  }
  console.log('  [Edge] Review with 50 comments');

  // ── 14. Feature flag with complex targeting rules ───────

  await prisma.featureFlag.upsert({
    where: { key: 'edge_complex_targeting' },
    update: {},
    create: {
      key: 'edge_complex_targeting',
      name: 'Edge: Complex Targeting',
      description: 'Feature flag with multi-condition targeting for testing.',
      enabled: true,
      defaultValue: false,
      targeting: {
        rules: [
          {
            condition: 'plan_in',
            values: ['premium_monthly', 'premium_annual', 'family_monthly', 'family_annual'],
            result: true,
          },
          {
            condition: 'age_group_in',
            values: ['age_4_5', 'age_5_6'],
            result: true,
          },
          {
            condition: 'locale_eq',
            values: ['en'],
            result: true,
          },
          {
            condition: 'percentage',
            values: [25],
            result: true,
          },
          {
            condition: 'registered_after',
            values: ['2026-01-01'],
            result: true,
          },
        ],
        combinator: 'any',
        fallback: false,
      },
    },
  });
  console.log('  [Edge] Feature flag with complex targeting (5 rules)');

  // ── 15. Content with all optional fields populated ──────

  await prisma.content.upsert({
    where: { slug: 'edge-all-fields' },
    update: {},
    create: {
      slug: 'edge-all-fields',
      type: 'lesson',
      title: 'All Fields Populated',
      emoji: '',
      description: 'Every optional field is populated to test full rendering.',
      body: { sections: [{ title: 'Intro', text: 'Welcome' }, { title: 'Main', text: 'Content' }, { title: 'Outro', text: 'Goodbye' }] },
      status: 'published',
      accessTier: 'premium',
      ageGroup: 'age_4_5',
      difficulty: 'hard',
      energyLevel: 'active',
      durationMinutes: 30,
      route: '/learn/all-fields',
      authorId: edgeUser.id,
      publishedAt: daysAgo(10),
      scheduledAt: null,
      version: 3,
      featured: true,
      mood: 'excited',
      bedtimeFriendly: false,
      language: 'en',
      publishedSnapshot: { title: 'All Fields Populated', version: 2 },
      freshnessScore: 0.95,
      evergreenScore: 0.8,
      seasonalRelevance: { spring: 0.9, summer: 0.7, fall: 0.5, winter: 0.3 },
      needsRefresh: false,
      lastRefreshDate: daysAgo(5),
      nextReviewDate: daysFromNow(25),
    },
  });
  console.log('  [Edge] Content with all optional fields populated');

  // ── 16. Caregiver invite edge cases ─────────────────────

  // Expired invite
  try {
    await prisma.caregiverInvite.create({
      data: {
        householdId: EDGE.hhMaxKids,
        email: 'expired-invite@edge.test',
        token: 'edge-token-expired-' + Date.now(),
        role: 'caregiver',
        childScope: [EDGE.childMax1],
        expiresAt: daysAgo(1),
      },
    });
  } catch { /* skip */ }

  // Active invite
  try {
    await prisma.caregiverInvite.create({
      data: {
        householdId: EDGE.hhMaxKids,
        email: 'pending-invite@edge.test',
        token: 'edge-token-pending-' + Date.now(),
        role: 'caregiver',
        childScope: [EDGE.childMax1, EDGE.childMax2, EDGE.childMax3],
        expiresAt: daysFromNow(7),
      },
    });
  } catch { /* skip */ }
  console.log('  [Edge] Caregiver invites (expired + active)');

  // ── 17. Support ticket edge cases ───────────────────────

  const ticketStatuses = ['open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed'];
  const ticketPriorities = ['low', 'normal', 'high', 'urgent', 'normal'];
  const ticketSubjects = [
    'App crashes when opening stories',
    'Cannot download offline pack',
    'Billing issue with subscription',
    'Feature request: dark mode',
    'Child profile disappeared after update',
  ];

  for (let i = 0; i < 5; i++) {
    try {
      await prisma.supportTicket.create({
        data: {
          householdId: EDGE.hhMaxKids,
          parentEmail: 'maxkids@edge.test',
          subject: ticketSubjects[i],
          body: `Detailed description of the issue: ${ticketSubjects[i]}. Steps to reproduce: 1. Open app 2. Navigate to feature 3. Issue occurs.`,
          category: ['bug', 'bug', 'billing', 'feature_request', 'bug'][i],
          status: ticketStatuses[i],
          priority: ticketPriorities[i],
          resolvedAt: ticketStatuses[i] === 'resolved' || ticketStatuses[i] === 'closed' ? daysAgo(1) : null,
        },
      });
    } catch { /* skip */ }
  }
  console.log('  [Edge] Support tickets in all statuses (5 tickets)');

  // ── 18. Data export job (large) ─────────────────────────

  try {
    await prisma.exportJob.create({
      data: {
        type: 'content_catalog',
        filters: { status: ['published'], ageGroup: ['all'] },
        format: 'csv',
        status: 'completed',
        fileUrl: 'https://staging-exports.s3.amazonaws.com/edge-large-export.csv',
        rowCount: 50000,
        requestedBy: EDGE.edgeUser,
        startedAt: daysAgo(1),
        completedAt: daysAgo(1),
      },
    });
  } catch { /* skip */ }
  console.log('  [Edge] Large export job (50000 rows)');

  // ── 19. Invoice in every status ─────────────────────────

  // First ensure the expiring subscription exists
  const expSub = await prisma.subscription.findFirst({
    where: { householdId: EDGE.hhExpiringSoon },
  });

  if (expSub) {
    const invoiceStatuses = ['draft', 'open', 'paid', 'void_status', 'uncollectible'] as const;
    for (let i = 0; i < invoiceStatuses.length; i++) {
      try {
        await prisma.invoice.create({
          data: {
            subscriptionId: expSub.id,
            amount: 999,
            currency: 'usd',
            status: invoiceStatuses[i],
            periodStart: daysAgo(30 * (i + 1)),
            periodEnd: daysAgo(30 * i),
            paidAt: invoiceStatuses[i] === 'paid' ? daysAgo(30 * i) : null,
            lineItems: [{ description: 'Premium Monthly', amount: 999, quantity: 1 }],
          },
        });
      } catch { /* skip */ }
    }
    console.log('  [Edge] Invoices in every status (5 invoices)');
  }

  // ── 20. Error groups (simulating production errors) ─────

  const errorScenarios = [
    { fingerprint: 'edge-err-001', category: 'runtime',   message: 'Cannot read property "id" of undefined', count: 1523, status: 'new' },
    { fingerprint: 'edge-err-002', category: 'network',   message: 'Failed to fetch: /api/content/feed',     count: 87,   status: 'investigating' },
    { fingerprint: 'edge-err-003', category: 'rendering', message: 'Maximum update depth exceeded',           count: 45,   status: 'resolved', resolvedAt: daysAgo(2) },
    { fingerprint: 'edge-err-004', category: 'storage',   message: 'QuotaExceededError: IndexedDB full',     count: 12,   status: 'new' },
    { fingerprint: 'edge-err-005', category: 'audio',     message: 'AudioContext was not allowed to start',  count: 890,  status: 'wont_fix' },
  ];

  for (const err of errorScenarios) {
    try {
      await prisma.errorGroup.create({
        data: {
          fingerprint: err.fingerprint,
          category: err.category,
          message: err.message,
          firstSeen: daysAgo(30),
          lastSeen: err.status === 'resolved' ? daysAgo(2) : new Date(),
          count: err.count,
          status: err.status,
          resolvedAt: err.resolvedAt || null,
        },
      });
    } catch { /* skip duplicates */ }
  }
  console.log('  [Edge] Error groups (5 scenarios)');

  // ── 21. Merchandising asset (expired) ───────────────────

  try {
    await prisma.merchandisingAsset.create({
      data: {
        type: 'hero_banner',
        title: 'Expired Holiday Banner',
        filename: 'holiday-banner-2025.png',
        storageKey: 'merch/edge-expired-banner.png',
        locale: 'en',
        platform: 'web',
        aspectRatio: '16:9',
        campaign: 'holiday_2025',
        status: 'published',
        expiresAt: daysAgo(60),
        version: 1,
        metadata: { width: 1920, height: 1080 },
      },
    });
  } catch { /* skip */ }
  console.log('  [Edge] Expired merchandising asset');

  // ── 22. Concurrent experiment ───────────────────────────

  try {
    const exp = await prisma.experiment.create({
      data: {
        name: 'edge-concurrent-experiment',
        description: 'Tests concurrent A/B testing with multiple variants.',
        status: 'running',
        startDate: daysAgo(7),
        endDate: daysFromNow(21),
        createdBy: EDGE.edgeUser,
      },
    });

    await prisma.experimentVariant.createMany({
      data: [
        { experimentId: exp.id, name: 'control',   weight: 0.34, config: { layout: 'grid' } },
        { experimentId: exp.id, name: 'variant_a',  weight: 0.33, config: { layout: 'list' } },
        { experimentId: exp.id, name: 'variant_b',  weight: 0.33, config: { layout: 'carousel' } },
      ],
    });
  } catch { /* skip */ }
  console.log('  [Edge] Running experiment with 3 variants');

  // ── 23. Payment method edge cases ───────────────────────

  try {
    await prisma.paymentMethod.create({
      data: {
        householdId: EDGE.hhExpiringSoon,
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiresAt: hoursFromNow(1),
        isDefault: true,
        externalId: 'pm_edge_expiring_soon',
      },
    });
    await prisma.paymentMethod.create({
      data: {
        householdId: EDGE.hhExpiringSoon,
        type: 'card',
        last4: '0000',
        brand: 'mastercard',
        expiresAt: daysAgo(30),
        isDefault: false,
        externalId: 'pm_edge_already_expired',
      },
    });
  } catch { /* skip */ }
  console.log('  [Edge] Payment methods (expiring + already expired)');

  // ── 24. Profile preferences (all possible keys) ─────────

  const prefKeys = [
    'theme', 'mascot', 'favorite_color', 'favorite_animal',
    'difficulty_override', 'sound_volume', 'speech_rate', 'tts_voice',
  ];
  const prefValues = [
    { selected: 'ocean' },
    { character: 'luna', expression: 'happy' },
    { color: '#4ECDC4' },
    { animal: 'dolphin' },
    { level: 'hard' },
    { volume: 0.3 },
    { rate: 0.8 },
    { voice: 'en-US-Standard-C' },
  ];

  for (let i = 0; i < prefKeys.length; i++) {
    try {
      await prisma.profilePreference.upsert({
        where: { profileId_key: { profileId: EDGE.childStars, key: prefKeys[i] } },
        update: {},
        create: {
          profileId: EDGE.childStars,
          key: prefKeys[i],
          value: prefValues[i],
        },
      });
    } catch { /* skip */ }
  }
  console.log('  [Edge] Profile with 8 preference keys');

  // ── Done ────────────────────────────────────────────────

  console.log('\nEdge case seed complete!');
  console.log('\nEdge case accounts (password: edgecase123 / parent123):');
  console.log('  Editor:     edge@staging.kidslearning.app');
  console.log('  Max kids:   maxkids@edge.test');
  console.log('  Expiring:   expiring@edge.test');
  console.log('  Max stars:  maxstars@edge.test');
}

seedEdgeCases()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Edge case seed failed:', e);
    prisma.$disconnect();
    process.exit(1);
  });
