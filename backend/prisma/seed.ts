import { PrismaClient, ContentType, AgeGroup } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Users ─────────────────────────────────────────────────

  const adminPassword = await bcrypt.hash('password123', 12);
  const editorPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@kidslearning.app' },
    update: {},
    create: {
      email: 'admin@kidslearning.app',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });
  console.log(`  Created admin user: ${admin.email} (${admin.id})`);

  const editor = await prisma.user.upsert({
    where: { email: 'editor@kidslearning.app' },
    update: {},
    create: {
      email: 'editor@kidslearning.app',
      password: editorPassword,
      name: 'Editor User',
      role: 'editor',
    },
  });
  console.log(`  Created editor user: ${editor.email} (${editor.id})`);

  // ── Tags ──────────────────────────────────────────────────

  const tagsData = [
    { name: 'beginner', dimension: 'level' },
    { name: 'interactive', dimension: 'theme' },
    { name: 'phonics', dimension: 'skill' },
    { name: 'counting', dimension: 'skill' },
    { name: 'creative', dimension: 'theme' },
  ];

  const tags: Array<{ id: string; name: string; dimension: string }> = [];
  for (const tagData of tagsData) {
    const tag = await prisma.tag.upsert({
      where: { name: tagData.name },
      update: {},
      create: tagData,
    });
    tags.push(tag);
  }
  console.log(`  Created ${tags.length} tags`);

  // ── Skills ─────────────────────────────────────────────────

  const skillsData = [
    { name: 'letter-recognition', category: 'cognitive', description: 'Recognizing and naming letters', ageGroup: 'age_2_3' as AgeGroup },
    { name: 'number-sense', category: 'cognitive', description: 'Understanding quantities and counting', ageGroup: 'age_2_3' as AgeGroup },
    { name: 'color-identification', category: 'cognitive', description: 'Identifying and naming colors', ageGroup: 'age_2_3' as AgeGroup },
    { name: 'shape-recognition', category: 'cognitive', description: 'Recognizing basic geometric shapes', ageGroup: 'age_2_3' as AgeGroup },
    { name: 'fine-motor', category: 'motor', description: 'Small muscle movements and coordination', ageGroup: 'all' as AgeGroup },
    { name: 'gross-motor', category: 'motor', description: 'Large muscle movements and balance', ageGroup: 'all' as AgeGroup },
    { name: 'emotional-awareness', category: 'emotional', description: 'Recognizing and expressing emotions', ageGroup: 'age_3_4' as AgeGroup },
    { name: 'social-skills', category: 'social', description: 'Interacting with others appropriately', ageGroup: 'all' as AgeGroup },
    { name: 'vocabulary', category: 'language', description: 'Building word knowledge', ageGroup: 'all' as AgeGroup },
    { name: 'listening', category: 'language', description: 'Active listening and comprehension', ageGroup: 'all' as AgeGroup },
    { name: 'creativity', category: 'creative', description: 'Imaginative thinking and expression', ageGroup: 'all' as AgeGroup },
    { name: 'problem-solving', category: 'cognitive', description: 'Finding solutions to challenges', ageGroup: 'age_4_5' as AgeGroup },
  ];

  const skills: Array<{ id: string; name: string }> = [];
  for (const skillData of skillsData) {
    const skill = await prisma.skill.upsert({
      where: { name: skillData.name },
      update: {},
      create: skillData,
    });
    skills.push(skill);
  }
  console.log(`  Created ${skills.length} skills`);

  // ── Permissions ────────────────────────────────────────────

  const permissionsData = [
    // Admin: full access
    { role: 'admin', resource: 'content', action: 'create' },
    { role: 'admin', resource: 'content', action: 'read' },
    { role: 'admin', resource: 'content', action: 'update' },
    { role: 'admin', resource: 'content', action: 'delete' },
    { role: 'admin', resource: 'content', action: 'publish' },
    { role: 'admin', resource: 'asset', action: 'create' },
    { role: 'admin', resource: 'asset', action: 'read' },
    { role: 'admin', resource: 'asset', action: 'update' },
    { role: 'admin', resource: 'asset', action: 'delete' },
    { role: 'admin', resource: 'collection', action: 'create' },
    { role: 'admin', resource: 'collection', action: 'read' },
    { role: 'admin', resource: 'collection', action: 'update' },
    { role: 'admin', resource: 'collection', action: 'delete' },
    { role: 'admin', resource: 'household', action: 'create' },
    { role: 'admin', resource: 'household', action: 'read' },
    { role: 'admin', resource: 'household', action: 'update' },
    { role: 'admin', resource: 'household', action: 'delete' },
    { role: 'admin', resource: 'audit', action: 'read' },
    { role: 'admin', resource: 'system', action: 'read' },
    { role: 'admin', resource: 'system', action: 'update' },
    { role: 'admin', resource: 'permission', action: 'create' },
    { role: 'admin', resource: 'permission', action: 'read' },
    { role: 'admin', resource: 'permission', action: 'update' },
    { role: 'admin', resource: 'permission', action: 'delete' },
    // Editor: content management
    { role: 'editor', resource: 'content', action: 'create' },
    { role: 'editor', resource: 'content', action: 'read' },
    { role: 'editor', resource: 'content', action: 'update' },
    { role: 'editor', resource: 'asset', action: 'create' },
    { role: 'editor', resource: 'asset', action: 'read' },
    { role: 'editor', resource: 'asset', action: 'update' },
    { role: 'editor', resource: 'collection', action: 'read' },
    { role: 'editor', resource: 'collection', action: 'update' },
    // Reviewer: read + approve
    { role: 'reviewer', resource: 'content', action: 'read' },
    { role: 'reviewer', resource: 'content', action: 'approve' },
    { role: 'reviewer', resource: 'asset', action: 'read' },
    { role: 'reviewer', resource: 'collection', action: 'read' },
    // Viewer: read only
    { role: 'viewer', resource: 'content', action: 'read' },
    { role: 'viewer', resource: 'asset', action: 'read' },
    { role: 'viewer', resource: 'collection', action: 'read' },
  ];

  let permCount = 0;
  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: {
        role_resource_action: { role: perm.role, resource: perm.resource, action: perm.action },
      },
      update: {},
      create: { ...perm, allowed: true },
    });
    permCount++;
  }
  console.log(`  Created ${permCount} permissions`);

  // ── Content Items ─────────────────────────────────────────

  const contentItems: Array<{
    slug: string;
    type: ContentType;
    title: string;
    emoji: string;
    description: string;
    body: Record<string, unknown>;
    ageGroup: AgeGroup;
    status: 'draft' | 'published';
    authorId: string;
    tagNames: string[];
  }> = [
    {
      slug: 'learn-letter-a',
      type: 'alphabet',
      title: 'Learn the Letter A',
      emoji: 'A',
      description: 'Discover the letter A with fun activities and examples.',
      body: {
        letter: 'A',
        uppercase: 'A',
        lowercase: 'a',
        words: ['Apple', 'Ant', 'Airplane'],
        phonicSound: '/ae/',
      },
      ageGroup: 'age_2_3',
      status: 'published',
      authorId: editor.id,
      tagNames: ['beginner', 'phonics'],
    },
    {
      slug: 'counting-to-five',
      type: 'number',
      title: 'Counting to Five',
      emoji: '5',
      description: 'Learn to count from 1 to 5 with colorful objects.',
      body: {
        range: [1, 5],
        objects: ['star', 'ball', 'flower', 'fish', 'butterfly'],
      },
      ageGroup: 'age_2_3',
      status: 'published',
      authorId: editor.id,
      tagNames: ['beginner', 'counting'],
    },
    {
      slug: 'primary-colors',
      type: 'color',
      title: 'Primary Colors',
      emoji: '',
      description: 'Explore red, blue, and yellow - the primary colors!',
      body: {
        colors: [
          { name: 'Red', hex: '#FF0000' },
          { name: 'Blue', hex: '#0000FF' },
          { name: 'Yellow', hex: '#FFFF00' },
        ],
      },
      ageGroup: 'age_3_4',
      status: 'published',
      authorId: editor.id,
      tagNames: ['beginner', 'interactive'],
    },
    {
      slug: 'basic-shapes',
      type: 'shape',
      title: 'Circle, Square, Triangle',
      emoji: '',
      description: 'Learn the three basic shapes with fun examples.',
      body: {
        shapes: [
          { name: 'Circle', sides: 0 },
          { name: 'Square', sides: 4 },
          { name: 'Triangle', sides: 3 },
        ],
      },
      ageGroup: 'age_2_3',
      status: 'published',
      authorId: admin.id,
      tagNames: ['beginner'],
    },
    {
      slug: 'farm-animals',
      type: 'animal',
      title: 'Farm Animals',
      emoji: '',
      description: 'Meet the animals that live on a farm!',
      body: {
        animals: [
          { name: 'Cow', sound: 'Moo', fact: 'Cows give us milk.' },
          { name: 'Chicken', sound: 'Cluck', fact: 'Chickens lay eggs.' },
          { name: 'Horse', sound: 'Neigh', fact: 'Horses can run very fast.' },
        ],
      },
      ageGroup: 'all',
      status: 'published',
      authorId: editor.id,
      tagNames: ['interactive'],
    },
    {
      slug: 'my-body-parts',
      type: 'bodypart',
      title: 'My Body Parts',
      emoji: '',
      description: 'Learn about your hands, feet, eyes, and more!',
      body: {
        parts: ['Head', 'Shoulders', 'Knees', 'Toes', 'Eyes', 'Ears', 'Mouth', 'Nose'],
      },
      ageGroup: 'age_2_3',
      status: 'draft',
      authorId: editor.id,
      tagNames: ['beginner'],
    },
    {
      slug: 'bedtime-story-moon',
      type: 'story',
      title: 'Goodnight Moon',
      emoji: '',
      description: 'A calming bedtime story about saying goodnight to everything.',
      body: {
        pages: [
          { text: 'In the great green room, there was a telephone and a red balloon.' },
          { text: 'And a picture of the cow jumping over the moon.' },
          { text: 'Goodnight room. Goodnight moon.' },
        ],
        theme: 'bedtime',
      },
      ageGroup: 'age_2_3',
      status: 'published',
      authorId: admin.id,
      tagNames: ['creative'],
    },
    {
      slug: 'cooking-fruit-salad',
      type: 'cooking',
      title: 'Make a Fruit Salad',
      emoji: '',
      description: 'A simple recipe to make a yummy fruit salad with your family.',
      body: {
        ingredients: ['Banana', 'Strawberry', 'Blueberry', 'Apple', 'Orange'],
        steps: [
          'Wash all the fruits.',
          'Ask an adult to help you cut the fruits.',
          'Mix them in a big bowl.',
          'Enjoy your fruit salad!',
        ],
        difficulty: 'easy',
      },
      ageGroup: 'age_4_5',
      status: 'draft',
      authorId: editor.id,
      tagNames: ['creative', 'interactive'],
    },
    {
      slug: 'happy-sad-feelings',
      type: 'emotion',
      title: 'Happy and Sad Feelings',
      emoji: '',
      description: 'Understanding when we feel happy or sad and what to do.',
      body: {
        emotions: [
          {
            name: 'Happy',
            triggers: ['Playing with friends', 'Getting a hug', 'Eating ice cream'],
            coping: 'Share your happiness with others!',
          },
          {
            name: 'Sad',
            triggers: ['Missing someone', 'Losing a toy', 'Feeling left out'],
            coping: 'Talk to someone you trust. It is okay to feel sad.',
          },
        ],
      },
      ageGroup: 'age_3_4',
      status: 'published',
      authorId: admin.id,
      tagNames: ['interactive'],
    },
    {
      slug: 'animal-quiz-easy',
      type: 'quiz',
      title: 'Animal Sounds Quiz',
      emoji: '',
      description: 'Can you match the animal to its sound?',
      body: {
        questions: [
          {
            question: 'Which animal says "Moo"?',
            options: ['Cat', 'Cow', 'Dog'],
            answer: 'Cow',
          },
          {
            question: 'Which animal says "Woof"?',
            options: ['Dog', 'Fish', 'Bird'],
            answer: 'Dog',
          },
          {
            question: 'Which animal says "Meow"?',
            options: ['Horse', 'Cat', 'Frog'],
            answer: 'Cat',
          },
        ],
      },
      ageGroup: 'age_3_4',
      status: 'published',
      authorId: editor.id,
      tagNames: ['beginner', 'interactive'],
    },
  ];

  const createdContent: Array<{ id: string; slug: string }> = [];

  for (const item of contentItems) {
    const { tagNames, ...data } = item;

    // Resolve tag IDs
    const itemTagIds = tags
      .filter((t) => tagNames.includes(t.name))
      .map((t) => t.id);

    const content = await prisma.content.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        publishedAt: data.status === 'published' ? new Date() : null,
        tags: {
          createMany: {
            data: itemTagIds.map((tagId) => ({ tagId })),
            skipDuplicates: true,
          },
        },
      },
    });
    createdContent.push({ id: content.id, slug: content.slug });
  }
  console.log(`  Created ${createdContent.length} content items`);

  // ── Content-Skill Associations ─────────────────────────────

  const contentSkillMap: Record<string, string[]> = {
    'learn-letter-a': ['letter-recognition', 'vocabulary'],
    'counting-to-five': ['number-sense'],
    'primary-colors': ['color-identification', 'vocabulary'],
    'basic-shapes': ['shape-recognition'],
    'farm-animals': ['vocabulary', 'listening'],
    'my-body-parts': ['vocabulary', 'listening'],
    'bedtime-story-moon': ['listening', 'vocabulary', 'creativity'],
    'cooking-fruit-salad': ['fine-motor', 'vocabulary'],
    'happy-sad-feelings': ['emotional-awareness', 'social-skills'],
    'animal-quiz-easy': ['listening', 'problem-solving'],
  };

  let skillLinkCount = 0;
  for (const [slug, skillNames] of Object.entries(contentSkillMap)) {
    const contentItem = createdContent.find((c) => c.slug === slug);
    if (!contentItem) continue;

    for (const skillName of skillNames) {
      const skill = skills.find((s) => s.name === skillName);
      if (!skill) continue;

      try {
        await prisma.contentSkill.upsert({
          where: { contentId_skillId: { contentId: contentItem.id, skillId: skill.id } },
          update: {},
          create: { contentId: contentItem.id, skillId: skill.id, relevance: 1.0 },
        });
        skillLinkCount++;
      } catch {
        // Skip duplicates
      }
    }
  }
  console.log(`  Created ${skillLinkCount} content-skill associations`);

  // ── Collection ────────────────────────────────────────────

  const collectionContentSlugs = ['learn-letter-a', 'counting-to-five', 'primary-colors'];
  const collectionContentIds = createdContent
    .filter((c) => collectionContentSlugs.includes(c.slug))
    .map((c) => c.id);

  const collection = await prisma.collection.upsert({
    where: { slug: 'getting-started' },
    update: {},
    create: {
      title: 'Getting Started',
      slug: 'getting-started',
      emoji: '',
      description: 'A beginner collection covering letters, numbers, and colors.',
      coverColor: '#4ECDC4',
      ageGroup: 'age_2_3',
      estimatedMinutes: 15,
      sequential: true,
      published: true,
      items: {
        createMany: {
          data: collectionContentIds.map((contentId, index) => ({
            contentId,
            orderIndex: index,
          })),
          skipDuplicates: true,
        },
      },
    },
  });
  console.log(`  Created collection: "${collection.title}" with ${collectionContentIds.length} items`);

  // ── Household (Demo) ──────────────────────────────────────

  const parentPassword = await bcrypt.hash('parent123', 12);

  const household = await prisma.household.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Demo Family',
      timezone: 'America/New_York',
      locale: 'en',
      plan: 'free',
    },
  });

  await prisma.parentAccount.upsert({
    where: { email: 'parent@demo.app' },
    update: {},
    create: {
      householdId: household.id,
      email: 'parent@demo.app',
      password: parentPassword,
      name: 'Demo Parent',
      role: 'primary',
    },
  });

  await prisma.childProfile.create({
    data: {
      householdId: household.id,
      name: 'Demo Child',
      avatarEmoji: '',
      ageGroup: 'age_3_4',
      interests: JSON.stringify(['animals', 'colors', 'stories']),
    },
  }).catch(() => {
    // May already exist from previous seed
  });

  console.log(`  Created demo household: "${household.name}"`);

  // ── Feature Flags ───────────────────────────────────────

  const flagsData = [
    { key: 'premium_content', name: 'Premium Content', description: 'Enable premium content gating', enabled: true },
    { key: 'cross_device_sync', name: 'Cross-Device Sync', description: 'Enable sync across devices', enabled: false },
    { key: 'family_routines', name: 'Family Routines', description: 'Enable routine planner feature', enabled: true },
    { key: 'deep_links', name: 'Deep Links', description: 'Enable deep link resolution', enabled: true },
    { key: 'parent_tips', name: 'Parent Tips', description: 'Enable parent tips section', enabled: true },
    { key: 'inbox_messages', name: 'Inbox Messages', description: 'Enable parent inbox', enabled: true },
    { key: 'performance_tracking', name: 'Performance Tracking', description: 'Enable frontend perf metrics', enabled: false },
    { key: 'error_reporting', name: 'Error Reporting', description: 'Enable client error reporting', enabled: true },
  ];

  let flagCount = 0;
  for (const flag of flagsData) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: { ...flag, defaultValue: false, targeting: {} },
    });
    flagCount++;
  }
  console.log(`  Created ${flagCount} feature flags`);

  // ── Recommendation Configs ──────────────────────────────

  const recoConfigs = [
    { key: 'freshness_weight', value: 0.3, description: 'Weight for content freshness in recommendations' },
    { key: 'repeat_penalty', value: 0.5, description: 'Penalty multiplier for recently viewed content' },
    { key: 'bedtime_bias', value: 1.5, description: 'Boost factor for calm content during bedtime' },
    { key: 'skill_boost', value: 1.2, description: 'Boost for content matching weak skills' },
    { key: 'age_match_weight', value: 2.0, description: 'Weight for age-appropriate content matching' },
    { key: 'diversity_factor', value: 0.4, description: 'Minimum diversity across content types' },
  ];

  for (const cfg of recoConfigs) {
    await prisma.recommendationConfig.upsert({
      where: { key: cfg.key },
      update: {},
      create: { key: cfg.key, value: cfg.value, description: cfg.description },
    });
  }
  console.log(`  Created ${recoConfigs.length} recommendation configs`);

  // ── Content Policies ────────────────────────────────────

  const policiesData = [
    {
      name: 'bedtime-energy-check',
      category: 'bedtime_suitability',
      severity: 'error',
      description: 'Bedtime content must not have active energy level',
      rules: {},
    },
    {
      name: 'skill-coverage',
      category: 'educational_mismatch',
      severity: 'warning',
      description: 'All content should have at least one skill association',
      rules: {},
    },
    {
      name: 'off-brand-language',
      category: 'off_brand_language',
      severity: 'error',
      description: 'Block content containing banned words',
      rules: { bannedWords: ['stupid', 'dumb', 'hate', 'ugly', 'loser'] },
    },
    {
      name: 'age-appropriateness',
      category: 'age_appropriateness',
      severity: 'warning',
      description: 'Flag content with mismatched age groups',
      rules: {},
    },
  ];

  for (const p of policiesData) {
    await prisma.contentPolicy.upsert({
      where: { name: p.name },
      update: {},
      create: { ...p, enabled: true },
    });
  }
  console.log(`  Created ${policiesData.length} content policies`);

  // ── Journey Templates ───────────────────────────────────

  const journeysData = [
    {
      name: 'welcome-journey',
      description: 'Onboarding journey for new families',
      triggerType: 'signup',
      enabled: true,
      cooldownHours: 24,
    },
    {
      name: 'trial-ending',
      description: 'Remind families their trial is ending',
      triggerType: 'trial_ending',
      enabled: false,
      cooldownHours: 48,
    },
    {
      name: 'inactivity-reengagement',
      description: 'Re-engage inactive families',
      triggerType: 'inactivity',
      enabled: false,
      cooldownHours: 72,
    },
  ];

  for (const j of journeysData) {
    const journey = await prisma.journey.upsert({
      where: { name: j.name },
      update: {},
      create: j,
    });
    // Add sample steps for welcome journey
    if (j.name === 'welcome-journey') {
      const existingSteps = await prisma.journeyStep.count({ where: { journeyId: journey.id } });
      if (existingSteps === 0) {
        await prisma.journeyStep.createMany({
          data: [
            { journeyId: journey.id, orderIndex: 0, delayHours: 0, messageTemplate: { type: 'tip', title: 'Welcome!', body: 'Start exploring fun learning activities with your child.' } },
            { journeyId: journey.id, orderIndex: 1, delayHours: 24, messageTemplate: { type: 'tip', title: 'Try a Story', body: 'Bedtime stories are a great way to wind down.' } },
            { journeyId: journey.id, orderIndex: 2, delayHours: 72, messageTemplate: { type: 'recap', title: 'First Week Done!', body: 'Check your child\'s progress in the parent dashboard.' } },
          ],
        });
      }
    }
  }
  console.log(`  Created ${journeysData.length} journeys`);

  // ── Help Articles ───────────────────────────────────────

  const helpArticles = [
    { title: 'Getting Started', slug: 'getting-started', body: 'Welcome to Kids Learning Fun! Here is how to set up your family account and start learning.', category: 'getting_started', searchKeywords: ['setup', 'start', 'begin', 'new'], published: true },
    { title: 'How Offline Mode Works', slug: 'offline-mode', body: 'Kids Learning Fun works offline! Content is cached automatically. You can also download packs for extended offline use.', category: 'troubleshooting', searchKeywords: ['offline', 'download', 'no internet'], published: true },
    { title: 'Managing Subscriptions', slug: 'manage-subscriptions', body: 'You can manage your subscription from the Billing page. Cancel, pause, or upgrade anytime.', category: 'billing', searchKeywords: ['subscription', 'billing', 'payment', 'cancel'], published: true },
    { title: 'Accessibility Features', slug: 'accessibility', body: 'We support reduced motion, larger text, and high contrast modes. Find these in Settings.', category: 'accessibility', searchKeywords: ['accessibility', 'a11y', 'large text', 'contrast'], published: true },
  ];

  for (const article of helpArticles) {
    await prisma.helpArticle.upsert({
      where: { slug: article.slug },
      update: {},
      create: { ...article, orderIndex: 0 },
    });
  }
  console.log(`  Created ${helpArticles.length} help articles`);

  // ── Routine Templates ───────────────────────────────────

  const routineTemplates = [
    {
      householdId: household.id,
      name: 'Morning Learning',
      type: 'morning',
      items: [
        { contentType: 'alphabet', label: 'Letter of the Day', duration: 5 },
        { contentType: 'number', label: 'Counting Practice', duration: 5 },
        { contentType: 'quiz', label: 'Quick Quiz', duration: 3 },
      ],
      isTemplate: true,
      scheduleDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      estimatedMinutes: 13,
    },
    {
      householdId: household.id,
      name: 'Bedtime Wind-Down',
      type: 'bedtime',
      items: [
        { contentType: 'story', label: 'Bedtime Story', duration: 10 },
        { contentType: 'audio', label: 'Calm Sounds', duration: 5 },
      ],
      isTemplate: true,
      scheduleDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      estimatedMinutes: 15,
    },
  ];

  for (const routine of routineTemplates) {
    const existing = await prisma.routine.findFirst({
      where: { householdId: routine.householdId, name: routine.name, isTemplate: true },
    });
    if (!existing) {
      await prisma.routine.create({ data: routine });
    }
  }
  console.log(`  Created ${routineTemplates.length} routine templates`);

  // ── Performance Baselines ───────────────────────────────

  const baselines = [
    { metricType: 'startup', p50: 800, p75: 1200, p95: 2500, threshold: 3000 },
    { metricType: 'navigation', p50: 150, p75: 300, p95: 800, threshold: 1000 },
    { metricType: 'media_load', p50: 500, p75: 1000, p95: 2000, threshold: 3000 },
    { metricType: 'animation', p50: 16, p75: 20, p95: 33, threshold: 50 },
  ];

  for (const b of baselines) {
    await prisma.performanceBaseline.upsert({
      where: { metricType: b.metricType },
      update: {},
      create: b,
    });
  }
  console.log(`  Created ${baselines.length} performance baselines`);

  console.log('\nSeed completed successfully!');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
