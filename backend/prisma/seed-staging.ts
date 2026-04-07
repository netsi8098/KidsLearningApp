import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Deterministic UUIDs for repeatability
const ID = {
  // Users
  admin:    '10000000-0000-0000-0000-000000000001',
  editor:   '10000000-0000-0000-0000-000000000002',
  reviewer: '10000000-0000-0000-0000-000000000003',
  viewer:   '10000000-0000-0000-0000-000000000004',
  // Households
  hhFree:      '20000000-0000-0000-0000-000000000001',
  hhTrial:     '20000000-0000-0000-0000-000000000002',
  hhPremium:   '20000000-0000-0000-0000-000000000003',
  hhExpired:   '20000000-0000-0000-0000-000000000004',
  hhMultiKid:  '20000000-0000-0000-0000-000000000005',
  // Parents
  parentFree1:     '30000000-0000-0000-0000-000000000001',
  parentTrial1:    '30000000-0000-0000-0000-000000000002',
  parentPremium1:  '30000000-0000-0000-0000-000000000003',
  parentExpired1:  '30000000-0000-0000-0000-000000000004',
  parentMulti1:    '30000000-0000-0000-0000-000000000005',
  parentMulti2:    '30000000-0000-0000-0000-000000000006',
  // Children
  childFree1:     '40000000-0000-0000-0000-000000000001',
  childTrial1:    '40000000-0000-0000-0000-000000000002',
  childPremium1:  '40000000-0000-0000-0000-000000000003',
  childExpired1:  '40000000-0000-0000-0000-000000000004',
  childMulti1:    '40000000-0000-0000-0000-000000000005',
  childMulti2:    '40000000-0000-0000-0000-000000000006',
  childMulti3:    '40000000-0000-0000-0000-000000000007',
  childMulti4:    '40000000-0000-0000-0000-000000000008',
  // Subscriptions
  subFree:    '50000000-0000-0000-0000-000000000001',
  subTrial:   '50000000-0000-0000-0000-000000000002',
  subPremium: '50000000-0000-0000-0000-000000000003',
  subExpired: '50000000-0000-0000-0000-000000000004',
  subMulti:   '50000000-0000-0000-0000-000000000005',
  // Collections
  colGettingStarted: '60000000-0000-0000-0000-000000000001',
  colBedtime:        '60000000-0000-0000-0000-000000000002',
  colNumbers:        '60000000-0000-0000-0000-000000000003',
  colCreative:       '60000000-0000-0000-0000-000000000004',
};

// Helper: date offsets
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function daysAgo(days: number): Date {
  return daysFromNow(-days);
}

async function seedStaging() {
  console.log('Seeding staging environment...\n');

  const pw = await bcrypt.hash('staging123', 12);
  const parentPw = await bcrypt.hash('parent123', 12);

  // ── 1. Users (4 roles) ──────────────────────────────────

  const usersData = [
    { id: ID.admin,    email: 'admin@staging.kidslearning.app',    name: 'Alice Admin',      role: 'admin'    as const },
    { id: ID.editor,   email: 'editor@staging.kidslearning.app',   name: 'Eddie Editor',     role: 'editor'   as const },
    { id: ID.reviewer, email: 'reviewer@staging.kidslearning.app', name: 'Rachel Reviewer',  role: 'reviewer' as const },
    { id: ID.viewer,   email: 'viewer@staging.kidslearning.app',   name: 'Victor Viewer',    role: 'viewer'   as const },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: pw },
    });
  }
  console.log(`  [Users] Created ${usersData.length} users`);

  // ── 2. Tags (25) ────────────────────────────────────────

  const tagsData = [
    { name: 'beginner',      dimension: 'level' },
    { name: 'intermediate',  dimension: 'level' },
    { name: 'advanced',      dimension: 'level' },
    { name: 'phonics',       dimension: 'skill' },
    { name: 'counting',      dimension: 'skill' },
    { name: 'reading',       dimension: 'skill' },
    { name: 'writing',       dimension: 'skill' },
    { name: 'music',         dimension: 'skill' },
    { name: 'art',           dimension: 'skill' },
    { name: 'science',       dimension: 'skill' },
    { name: 'nature',        dimension: 'theme' },
    { name: 'animals',       dimension: 'theme' },
    { name: 'space',         dimension: 'theme' },
    { name: 'ocean',         dimension: 'theme' },
    { name: 'food',          dimension: 'theme' },
    { name: 'family',        dimension: 'theme' },
    { name: 'friendship',    dimension: 'theme' },
    { name: 'interactive',   dimension: 'theme' },
    { name: 'creative',      dimension: 'theme' },
    { name: 'calm',          dimension: 'energy' },
    { name: 'active',        dimension: 'energy' },
    { name: 'bedtime',       dimension: 'mood' },
    { name: 'morning',       dimension: 'mood' },
    { name: 'short',         dimension: 'duration' },
    { name: 'long',          dimension: 'duration' },
  ];

  const tags: Record<string, string> = {};
  for (const t of tagsData) {
    const tag = await prisma.tag.upsert({
      where: { name: t.name },
      update: {},
      create: t,
    });
    tags[t.name] = tag.id;
  }
  console.log(`  [Tags] Created ${tagsData.length} tags`);

  // ── 3. Skills (16) ──────────────────────────────────────

  const skillsData = [
    { name: 'letter-recognition',    category: 'cognitive',  description: 'Recognizing and naming letters',            ageGroup: 'age_2_3' as const },
    { name: 'number-sense',          category: 'cognitive',  description: 'Understanding quantities and counting',      ageGroup: 'age_2_3' as const },
    { name: 'color-identification',  category: 'cognitive',  description: 'Identifying and naming colors',              ageGroup: 'age_2_3' as const },
    { name: 'shape-recognition',     category: 'cognitive',  description: 'Recognizing basic geometric shapes',         ageGroup: 'age_2_3' as const },
    { name: 'pattern-recognition',   category: 'cognitive',  description: 'Identifying repeating patterns',             ageGroup: 'age_3_4' as const },
    { name: 'problem-solving',       category: 'cognitive',  description: 'Finding solutions to challenges',            ageGroup: 'age_4_5' as const },
    { name: 'fine-motor',            category: 'motor',      description: 'Small muscle movements and coordination',    ageGroup: 'all'     as const },
    { name: 'gross-motor',           category: 'motor',      description: 'Large muscle movements and balance',         ageGroup: 'all'     as const },
    { name: 'emotional-awareness',   category: 'emotional',  description: 'Recognizing and expressing emotions',        ageGroup: 'age_3_4' as const },
    { name: 'self-regulation',       category: 'emotional',  description: 'Managing feelings and behavior',             ageGroup: 'age_4_5' as const },
    { name: 'social-skills',         category: 'social',     description: 'Interacting with others appropriately',      ageGroup: 'all'     as const },
    { name: 'vocabulary',            category: 'language',   description: 'Building word knowledge',                    ageGroup: 'all'     as const },
    { name: 'listening',             category: 'language',   description: 'Active listening and comprehension',          ageGroup: 'all'     as const },
    { name: 'storytelling',          category: 'language',   description: 'Sequencing events and narrating',             ageGroup: 'age_3_4' as const },
    { name: 'creativity',            category: 'creative',   description: 'Imaginative thinking and expression',         ageGroup: 'all'     as const },
    { name: 'rhythm-sense',          category: 'creative',   description: 'Feeling and following musical rhythms',       ageGroup: 'all'     as const },
  ];

  const skills: Record<string, string> = {};
  for (const s of skillsData) {
    const skill = await prisma.skill.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
    skills[s.name] = skill.id;
  }
  console.log(`  [Skills] Created ${skillsData.length} skills`);

  // ── 4. Content Catalog (55 items) ───────────────────────

  type ContentSeed = {
    slug: string;
    type: string;
    title: string;
    emoji: string;
    description: string;
    body: Record<string, unknown>;
    status: string;
    accessTier: string;
    ageGroup: string;
    difficulty?: string;
    energyLevel?: string;
    durationMinutes?: number;
    bedtimeFriendly?: boolean;
    featured?: boolean;
    authorId: string;
    tagNames: string[];
    skillNames: string[];
  };

  const contentItems: ContentSeed[] = [
    // ── Alphabet (6) ──
    { slug: 'letter-a', type: 'alphabet', title: 'Learn the Letter A', emoji: 'A', description: 'Discover the letter A with fun activities.', body: { letter: 'A', words: ['Apple', 'Ant', 'Airplane'], phonicSound: '/ae/' }, status: 'published', accessTier: 'free', ageGroup: 'age_2_3', difficulty: 'easy', energyLevel: 'moderate', durationMinutes: 5, authorId: ID.editor, tagNames: ['beginner', 'phonics', 'short'], skillNames: ['letter-recognition', 'vocabulary'] },
    { slug: 'letter-b', type: 'alphabet', title: 'Learn the Letter B', emoji: 'B', description: 'Bounce into the letter B!', body: { letter: 'B', words: ['Ball', 'Bear', 'Butterfly'], phonicSound: '/buh/' }, status: 'published', accessTier: 'free', ageGroup: 'age_2_3', difficulty: 'easy', energyLevel: 'moderate', durationMinutes: 5, authorId: ID.editor, tagNames: ['beginner', 'phonics', 'short'], skillNames: ['letter-recognition', 'vocabulary'] },
    { slug: 'letter-c', type: 'alphabet', title: 'Learn the Letter C', emoji: 'C', description: 'C is for Cat and Cake!', body: { letter: 'C', words: ['Cat', 'Cake', 'Car'], phonicSound: '/kuh/' }, status: 'published', accessTier: 'free', ageGroup: 'age_2_3', difficulty: 'easy', energyLevel: 'moderate', durationMinutes: 5, authorId: ID.editor, tagNames: ['beginner', 'phonics', 'short'], skillNames: ['letter-recognition', 'vocabulary'] },
    { slug: 'letter-d', type: 'alphabet', title: 'Learn the Letter D', emoji: 'D', description: 'Dance with the letter D!', body: { letter: 'D', words: ['Dog', 'Duck', 'Drum'], phonicSound: '/duh/' }, status: 'review', accessTier: 'free', ageGroup: 'age_2_3', difficulty: 'easy', energyLevel: 'moderate', durationMinutes: 5, authorId: ID.editor, tagNames: ['beginner', 'phonics'], skillNames: ['letter-recognition'] },
    { slug: 'letter-e', type: 'alphabet', title: 'Learn the Letter E', emoji: 'E', description: 'Explore the letter E.', body: { letter: 'E', words: ['Elephant', 'Egg', 'Earth'], phonicSound: '/eh/' }, status: 'draft', accessTier: 'free', ageGroup: 'age_2_3', difficulty: 'easy', authorId: ID.editor, tagNames: ['beginner', 'phonics'], skillNames: ['letter-recognition'] },
    { slug: 'alphabet-song', type: 'audio', title: 'The Alphabet Song', emoji: '', description: 'Sing along to the classic ABC song!', body: { lyrics: 'A B C D E F G, H I J K L M N O P...', genre: 'educational' }, status: 'published', accessTier: 'free', ageGroup: 'all', energyLevel: 'active', durationMinutes: 3, authorId: ID.admin, tagNames: ['beginner', 'music', 'active'], skillNames: ['letter-recognition', 'rhythm-sense', 'listening'] },

    // ── Numbers (5) ──
    { slug: 'counting-1-5', type: 'number', title: 'Counting to Five', emoji: '5', description: 'Learn to count from 1 to 5.', body: { range: [1, 5], objects: ['star', 'ball', 'flower', 'fish', 'butterfly'] }, status: 'published', accessTier: 'free', ageGroup: 'age_2_3', difficulty: 'easy', energyLevel: 'moderate', durationMinutes: 5, authorId: ID.editor, tagNames: ['beginner', 'counting', 'short'], skillNames: ['number-sense'] },
    { slug: 'counting-6-10', type: 'number', title: 'Counting to Ten', emoji: '', description: 'Continue counting from 6 to 10.', body: { range: [6, 10], objects: ['apple', 'car', 'tree', 'house', 'boat'] }, status: 'published', accessTier: 'free', ageGroup: 'age_3_4', difficulty: 'easy', energyLevel: 'moderate', durationMinutes: 7, authorId: ID.editor, tagNames: ['beginner', 'counting'], skillNames: ['number-sense'] },
    { slug: 'counting-11-20', type: 'number', title: 'Counting to Twenty', emoji: '', description: 'Big numbers! Count from 11 to 20.', body: { range: [11, 20] }, status: 'published', accessTier: 'premium', ageGroup: 'age_4_5', difficulty: 'medium', energyLevel: 'moderate', durationMinutes: 10, authorId: ID.editor, tagNames: ['intermediate', 'counting', 'long'], skillNames: ['number-sense', 'pattern-recognition'] },
    { slug: 'simple-addition', type: 'number', title: 'Simple Addition', emoji: '+', description: 'Adding small numbers together.', body: { problems: [{ a: 1, b: 2, answer: 3 }, { a: 2, b: 3, answer: 5 }] }, status: 'approved', accessTier: 'premium', ageGroup: 'age_5_6', difficulty: 'medium', durationMinutes: 10, authorId: ID.editor, tagNames: ['intermediate', 'counting'], skillNames: ['number-sense', 'problem-solving'] },
    { slug: 'number-patterns', type: 'number', title: 'Number Patterns', emoji: '', description: 'Find the pattern in number sequences.', body: { sequences: [[2, 4, 6], [1, 3, 5]] }, status: 'draft', accessTier: 'premium', ageGroup: 'age_5_6', difficulty: 'hard', authorId: ID.reviewer, tagNames: ['advanced', 'counting'], skillNames: ['pattern-recognition', 'problem-solving'] },

    // ── Colors (3) ──
    { slug: 'primary-colors', type: 'color', title: 'Primary Colors', emoji: '', description: 'Explore red, blue, and yellow.', body: { colors: [{ name: 'Red', hex: '#FF0000' }, { name: 'Blue', hex: '#0000FF' }, { name: 'Yellow', hex: '#FFFF00' }] }, status: 'published', accessTier: 'free', ageGroup: 'age_2_3', difficulty: 'easy', energyLevel: 'moderate', durationMinutes: 5, authorId: ID.editor, tagNames: ['beginner', 'creative', 'short'], skillNames: ['color-identification', 'vocabulary'] },
    { slug: 'secondary-colors', type: 'color', title: 'Secondary Colors', emoji: '', description: 'Mix colors to make new ones!', body: { mixes: [{ a: 'Red', b: 'Blue', result: 'Purple' }, { a: 'Red', b: 'Yellow', result: 'Orange' }, { a: 'Blue', b: 'Yellow', result: 'Green' }] }, status: 'published', accessTier: 'free', ageGroup: 'age_3_4', difficulty: 'medium', energyLevel: 'active', durationMinutes: 8, authorId: ID.editor, tagNames: ['intermediate', 'creative', 'art', 'interactive'], skillNames: ['color-identification', 'creativity'] },
    { slug: 'rainbow-colors', type: 'color', title: 'Rainbow Colors', emoji: '', description: 'All the colors of the rainbow!', body: { colors: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet'] }, status: 'published', accessTier: 'premium', ageGroup: 'age_3_4', difficulty: 'medium', durationMinutes: 10, featured: true, authorId: ID.admin, tagNames: ['intermediate', 'creative', 'nature'], skillNames: ['color-identification', 'pattern-recognition', 'vocabulary'] },

    // ── Shapes (3) ──
    { slug: 'basic-shapes', type: 'shape', title: 'Circle, Square, Triangle', emoji: '', description: 'Learn the three basic shapes.', body: { shapes: [{ name: 'Circle', sides: 0 }, { name: 'Square', sides: 4 }, { name: 'Triangle', sides: 3 }] }, status: 'published', accessTier: 'free', ageGroup: 'age_2_3', difficulty: 'easy', energyLevel: 'moderate', durationMinutes: 5, authorId: ID.admin, tagNames: ['beginner', 'short'], skillNames: ['shape-recognition'] },
    { slug: 'more-shapes', type: 'shape', title: 'Rectangle, Oval, Star', emoji: '', description: 'Discover three more shapes!', body: { shapes: [{ name: 'Rectangle', sides: 4 }, { name: 'Oval', sides: 0 }, { name: 'Star', sides: 5 }] }, status: 'published', accessTier: 'free', ageGroup: 'age_3_4', difficulty: 'medium', durationMinutes: 7, authorId: ID.editor, tagNames: ['intermediate'], skillNames: ['shape-recognition', 'vocabulary'] },
    { slug: 'shape-hunt', type: 'game', title: 'Shape Hunt', emoji: '', description: 'Find shapes hidden in pictures!', body: { levels: 5, shapesPerLevel: 3 }, status: 'published', accessTier: 'premium', ageGroup: 'age_3_4', difficulty: 'medium', energyLevel: 'active', durationMinutes: 10, featured: true, authorId: ID.editor, tagNames: ['intermediate', 'interactive', 'active'], skillNames: ['shape-recognition', 'problem-solving'] },

    // ── Animals (4) ──
    { slug: 'farm-animals', type: 'animal', title: 'Farm Animals', emoji: '', description: 'Meet the animals that live on a farm!', body: { animals: [{ name: 'Cow', sound: 'Moo' }, { name: 'Chicken', sound: 'Cluck' }, { name: 'Horse', sound: 'Neigh' }] }, status: 'published', accessTier: 'free', ageGroup: 'all', energyLevel: 'moderate', durationMinutes: 7, authorId: ID.editor, tagNames: ['beginner', 'animals', 'interactive'], skillNames: ['vocabulary', 'listening'] },
    { slug: 'ocean-animals', type: 'animal', title: 'Ocean Animals', emoji: '', description: 'Dive into the ocean and meet its creatures!', body: { animals: [{ name: 'Dolphin', fact: 'Dolphins are very smart.' }, { name: 'Octopus', fact: 'Octopus has 8 arms.' }, { name: 'Whale', fact: 'Blue whales are the largest animals.' }] }, status: 'published', accessTier: 'premium', ageGroup: 'age_3_4', energyLevel: 'moderate', durationMinutes: 8, authorId: ID.editor, tagNames: ['intermediate', 'animals', 'ocean'], skillNames: ['vocabulary', 'listening', 'creativity'] },
    { slug: 'jungle-animals', type: 'animal', title: 'Jungle Animals', emoji: '', description: 'Explore the jungle and its wild animals!', body: { animals: [{ name: 'Lion', sound: 'Roar' }, { name: 'Monkey', sound: 'Ooh ooh' }, { name: 'Parrot', sound: 'Squawk' }] }, status: 'review', accessTier: 'premium', ageGroup: 'age_3_4', durationMinutes: 8, authorId: ID.editor, tagNames: ['intermediate', 'animals', 'nature'], skillNames: ['vocabulary'] },
    { slug: 'dinosaurs', type: 'animal', title: 'Dinosaurs!', emoji: '', description: 'Travel back in time to meet dinosaurs.', body: { dinosaurs: ['T-Rex', 'Triceratops', 'Brontosaurus'] }, status: 'archived', accessTier: 'premium', ageGroup: 'age_4_5', durationMinutes: 10, archivedAt: daysAgo(30), authorId: ID.admin, tagNames: ['advanced', 'animals', 'science'], skillNames: ['vocabulary', 'listening'] },

    // ── Body parts (2) ──
    { slug: 'my-body-parts', type: 'bodypart', title: 'My Body Parts', emoji: '', description: 'Learn about your hands, feet, eyes, and more!', body: { parts: ['Head', 'Shoulders', 'Knees', 'Toes'] }, status: 'published', accessTier: 'free', ageGroup: 'age_2_3', difficulty: 'easy', energyLevel: 'active', durationMinutes: 5, authorId: ID.editor, tagNames: ['beginner', 'active'], skillNames: ['vocabulary', 'gross-motor'] },
    { slug: 'five-senses', type: 'bodypart', title: 'My Five Senses', emoji: '', description: 'Sight, sound, smell, taste, and touch!', body: { senses: ['Sight', 'Hearing', 'Smell', 'Taste', 'Touch'] }, status: 'published', accessTier: 'free', ageGroup: 'age_3_4', difficulty: 'medium', durationMinutes: 8, authorId: ID.editor, tagNames: ['intermediate', 'science'], skillNames: ['vocabulary', 'listening'] },

    // ── Stories (5) ──
    { slug: 'goodnight-moon', type: 'story', title: 'Goodnight Moon', emoji: '', description: 'A calming bedtime story about saying goodnight.', body: { pages: [{ text: 'In the great green room...' }, { text: 'Goodnight room. Goodnight moon.' }], theme: 'bedtime' }, status: 'published', accessTier: 'free', ageGroup: 'age_2_3', energyLevel: 'calm', durationMinutes: 5, bedtimeFriendly: true, authorId: ID.admin, tagNames: ['beginner', 'calm', 'bedtime', 'short'], skillNames: ['listening', 'vocabulary', 'storytelling'] },
    { slug: 'brave-little-bear', type: 'story', title: 'The Brave Little Bear', emoji: '', description: 'A bear cub goes on an adventure in the forest.', body: { pages: [{ text: 'Once upon a time, a little bear...' }, { text: 'He found his way home.' }], theme: 'adventure' }, status: 'published', accessTier: 'free', ageGroup: 'age_3_4', energyLevel: 'moderate', durationMinutes: 8, authorId: ID.editor, tagNames: ['beginner', 'animals', 'nature'], skillNames: ['listening', 'storytelling', 'emotional-awareness'] },
    { slug: 'space-adventure', type: 'story', title: 'Space Adventure', emoji: '', description: 'Blast off to the stars!', body: { pages: [{ text: '3... 2... 1... Blast off!' }, { text: 'They landed on the moon.' }], theme: 'space' }, status: 'published', accessTier: 'premium', ageGroup: 'age_4_5', energyLevel: 'active', durationMinutes: 12, featured: true, authorId: ID.admin, tagNames: ['intermediate', 'space', 'active', 'long'], skillNames: ['listening', 'storytelling', 'creativity', 'vocabulary'] },
    { slug: 'ocean-friends', type: 'story', title: 'Ocean Friends', emoji: '', description: 'An undersea tale of friendship.', body: { pages: [{ text: 'Deep in the ocean...' }], theme: 'friendship' }, status: 'review', accessTier: 'premium', ageGroup: 'age_3_4', energyLevel: 'calm', durationMinutes: 10, bedtimeFriendly: true, authorId: ID.editor, tagNames: ['intermediate', 'ocean', 'friendship', 'calm'], skillNames: ['listening', 'social-skills'] },
    { slug: 'rainy-day', type: 'story', title: 'Rainy Day Inside', emoji: '', description: 'Making the best of a rainy day at home.', body: { pages: [{ text: 'Drip, drop, drip...' }], theme: 'home' }, status: 'draft', accessTier: 'free', ageGroup: 'age_2_3', energyLevel: 'calm', durationMinutes: 6, bedtimeFriendly: true, authorId: ID.reviewer, tagNames: ['beginner', 'calm', 'family'], skillNames: ['listening', 'creativity'] },

    // ── Videos (3) ──
    { slug: 'counting-song-video', type: 'video', title: 'Counting Song Video', emoji: '', description: 'A fun animated counting song.', body: { youtubeId: 'test-counting-123', chapters: [{ time: 0, label: 'Intro' }, { time: 30, label: 'Counting' }] }, status: 'published', accessTier: 'free', ageGroup: 'age_2_3', energyLevel: 'active', durationMinutes: 4, authorId: ID.editor, tagNames: ['beginner', 'counting', 'music', 'active', 'short'], skillNames: ['number-sense', 'rhythm-sense', 'listening'] },
    { slug: 'animal-sounds-video', type: 'video', title: 'Animal Sounds Video', emoji: '', description: 'Hear and see real animal sounds.', body: { youtubeId: 'test-animals-456' }, status: 'published', accessTier: 'free', ageGroup: 'all', energyLevel: 'moderate', durationMinutes: 6, authorId: ID.admin, tagNames: ['beginner', 'animals', 'interactive'], skillNames: ['vocabulary', 'listening'] },
    { slug: 'science-experiment', type: 'video', title: 'Baking Soda Volcano', emoji: '', description: 'Watch a fun science experiment!', body: { youtubeId: 'test-science-789' }, status: 'approved', accessTier: 'premium', ageGroup: 'age_4_5', energyLevel: 'active', durationMinutes: 8, authorId: ID.editor, tagNames: ['advanced', 'science', 'active'], skillNames: ['problem-solving', 'vocabulary'] },

    // ── Games (3) ──
    { slug: 'color-match', type: 'game', title: 'Color Matching Game', emoji: '', description: 'Match the colors to win!', body: { gridSize: 4, pairs: 8 }, status: 'published', accessTier: 'free', ageGroup: 'age_2_3', difficulty: 'easy', energyLevel: 'moderate', durationMinutes: 5, authorId: ID.editor, tagNames: ['beginner', 'creative', 'interactive', 'short'], skillNames: ['color-identification', 'problem-solving'] },
    { slug: 'word-builder', type: 'game', title: 'Word Builder', emoji: '', description: 'Build words from letter tiles.', body: { words: ['cat', 'dog', 'sun', 'hat'] }, status: 'published', accessTier: 'premium', ageGroup: 'age_4_5', difficulty: 'medium', energyLevel: 'moderate', durationMinutes: 10, authorId: ID.editor, tagNames: ['intermediate', 'phonics', 'reading', 'interactive'], skillNames: ['letter-recognition', 'vocabulary', 'problem-solving'] },
    { slug: 'number-puzzle', type: 'game', title: 'Number Puzzle', emoji: '', description: 'Put the numbers in the right order!', body: { maxNumber: 10 }, status: 'draft', accessTier: 'premium', ageGroup: 'age_4_5', difficulty: 'medium', authorId: ID.reviewer, tagNames: ['intermediate', 'counting', 'interactive'], skillNames: ['number-sense', 'problem-solving'] },

    // ── Audio (3) ──
    { slug: 'lullaby-twinkle', type: 'audio', title: 'Twinkle Twinkle Little Star', emoji: '', description: 'A gentle lullaby for bedtime.', body: { genre: 'lullaby', bpm: 60 }, status: 'published', accessTier: 'free', ageGroup: 'all', energyLevel: 'calm', durationMinutes: 3, bedtimeFriendly: true, authorId: ID.admin, tagNames: ['beginner', 'music', 'calm', 'bedtime', 'short'], skillNames: ['listening', 'rhythm-sense'] },
    { slug: 'nature-sounds', type: 'audio', title: 'Rainforest Sounds', emoji: '', description: 'Relaxing sounds of the rainforest.', body: { genre: 'ambient', sounds: ['rain', 'birds', 'frogs'] }, status: 'published', accessTier: 'free', ageGroup: 'all', energyLevel: 'calm', durationMinutes: 10, bedtimeFriendly: true, authorId: ID.editor, tagNames: ['calm', 'nature', 'bedtime', 'long'], skillNames: ['listening'] },
    { slug: 'action-song-jump', type: 'audio', title: 'Jump and Clap Song', emoji: '', description: 'Get moving with this action song!', body: { genre: 'action', bpm: 120 }, status: 'published', accessTier: 'free', ageGroup: 'age_2_3', energyLevel: 'active', durationMinutes: 4, authorId: ID.editor, tagNames: ['beginner', 'music', 'active', 'short'], skillNames: ['gross-motor', 'rhythm-sense', 'listening'] },

    // ── Quizzes (3) ──
    { slug: 'animal-sounds-quiz', type: 'quiz', title: 'Animal Sounds Quiz', emoji: '', description: 'Match the animal to its sound!', body: { questions: [{ q: 'Which animal says Moo?', options: ['Cat', 'Cow', 'Dog'], answer: 'Cow' }, { q: 'Which animal says Woof?', options: ['Dog', 'Fish', 'Bird'], answer: 'Dog' }] }, status: 'published', accessTier: 'free', ageGroup: 'age_3_4', difficulty: 'easy', energyLevel: 'moderate', durationMinutes: 5, authorId: ID.editor, tagNames: ['beginner', 'animals', 'interactive', 'short'], skillNames: ['listening', 'vocabulary', 'problem-solving'] },
    { slug: 'shape-quiz', type: 'quiz', title: 'Shape Quiz', emoji: '', description: 'How well do you know your shapes?', body: { questions: [{ q: 'How many sides does a triangle have?', options: ['2', '3', '4'], answer: '3' }] }, status: 'published', accessTier: 'free', ageGroup: 'age_3_4', difficulty: 'easy', durationMinutes: 5, authorId: ID.editor, tagNames: ['beginner', 'interactive'], skillNames: ['shape-recognition', 'problem-solving'] },
    { slug: 'color-quiz-hard', type: 'quiz', title: 'Color Mixing Quiz', emoji: '', description: 'What colors do you get when you mix?', body: { questions: [{ q: 'Red + Blue = ?', options: ['Green', 'Purple', 'Orange'], answer: 'Purple' }] }, status: 'review', accessTier: 'premium', ageGroup: 'age_4_5', difficulty: 'hard', durationMinutes: 8, authorId: ID.editor, tagNames: ['advanced', 'creative', 'interactive'], skillNames: ['color-identification', 'problem-solving'] },

    // ── Cooking (2) ──
    { slug: 'fruit-salad', type: 'cooking', title: 'Make a Fruit Salad', emoji: '', description: 'A simple recipe for a yummy fruit salad.', body: { ingredients: ['Banana', 'Strawberry', 'Blueberry'], steps: ['Wash fruits', 'Cut with help', 'Mix together'] }, status: 'published', accessTier: 'free', ageGroup: 'age_4_5', difficulty: 'easy', energyLevel: 'moderate', durationMinutes: 15, authorId: ID.editor, tagNames: ['beginner', 'food', 'family', 'long'], skillNames: ['fine-motor', 'vocabulary'] },
    { slug: 'trail-mix', type: 'cooking', title: 'Make Your Own Trail Mix', emoji: '', description: 'A crunchy snack you can customize!', body: { ingredients: ['Cereal', 'Raisins', 'Pretzels'], steps: ['Measure ingredients', 'Mix in bowl', 'Shake bag'] }, status: 'approved', accessTier: 'free', ageGroup: 'age_3_4', difficulty: 'easy', energyLevel: 'moderate', durationMinutes: 10, authorId: ID.editor, tagNames: ['beginner', 'food', 'family'], skillNames: ['fine-motor', 'number-sense'] },

    // ── Emotions (2) ──
    { slug: 'happy-sad', type: 'emotion', title: 'Happy and Sad Feelings', emoji: '', description: 'Understanding when we feel happy or sad.', body: { emotions: [{ name: 'Happy', triggers: ['Playing with friends'] }, { name: 'Sad', triggers: ['Missing someone'] }] }, status: 'published', accessTier: 'free', ageGroup: 'age_3_4', energyLevel: 'calm', durationMinutes: 7, authorId: ID.admin, tagNames: ['beginner', 'calm'], skillNames: ['emotional-awareness', 'social-skills', 'vocabulary'] },
    { slug: 'angry-scared', type: 'emotion', title: 'Feeling Angry or Scared', emoji: '', description: 'Learning to manage big feelings.', body: { emotions: [{ name: 'Angry', coping: 'Take deep breaths' }, { name: 'Scared', coping: 'Talk to someone you trust' }] }, status: 'published', accessTier: 'free', ageGroup: 'age_4_5', energyLevel: 'calm', durationMinutes: 8, authorId: ID.admin, tagNames: ['intermediate', 'calm'], skillNames: ['emotional-awareness', 'self-regulation', 'social-skills'] },

    // ── Movement (2) ──
    { slug: 'animal-yoga', type: 'movement', title: 'Animal Yoga', emoji: '', description: 'Stretch like your favorite animals!', body: { poses: ['Cat stretch', 'Cobra pose', 'Frog jump'] }, status: 'published', accessTier: 'free', ageGroup: 'age_3_4', difficulty: 'easy', energyLevel: 'active', durationMinutes: 10, authorId: ID.editor, tagNames: ['beginner', 'animals', 'active'], skillNames: ['gross-motor', 'listening'] },
    { slug: 'dance-party', type: 'movement', title: 'Dance Party!', emoji: '', description: 'Move your body to the beat!', body: { songs: 3, moves: ['stomp', 'clap', 'spin', 'jump'] }, status: 'published', accessTier: 'premium', ageGroup: 'all', energyLevel: 'active', durationMinutes: 8, featured: true, authorId: ID.editor, tagNames: ['beginner', 'music', 'active'], skillNames: ['gross-motor', 'rhythm-sense', 'creativity'] },

    // ── Life skills / Home / Explorer (4) ──
    { slug: 'tying-shoes', type: 'lifeskill', title: 'Tying Your Shoes', emoji: '', description: 'Step by step guide to tying shoelaces.', body: { steps: ['Make an X', 'Loop under', 'Pull tight', 'Make bunny ears'] }, status: 'published', accessTier: 'free', ageGroup: 'age_5_6', difficulty: 'hard', energyLevel: 'calm', durationMinutes: 10, authorId: ID.editor, tagNames: ['advanced', 'family'], skillNames: ['fine-motor', 'problem-solving'] },
    { slug: 'plant-a-seed', type: 'homeactivity', title: 'Plant a Seed', emoji: '', description: 'Watch a plant grow from a tiny seed!', body: { materials: ['seed', 'soil', 'cup', 'water'], days: 7 }, status: 'published', accessTier: 'free', ageGroup: 'age_3_4', difficulty: 'medium', durationMinutes: 15, authorId: ID.editor, tagNames: ['intermediate', 'nature', 'science', 'family', 'long'], skillNames: ['vocabulary', 'fine-motor'] },
    { slug: 'weather-explorer', type: 'explorer', title: 'Weather Explorer', emoji: '', description: 'Learn about different types of weather.', body: { types: ['Sunny', 'Rainy', 'Snowy', 'Windy', 'Cloudy'] }, status: 'published', accessTier: 'free', ageGroup: 'age_3_4', difficulty: 'medium', durationMinutes: 8, authorId: ID.admin, tagNames: ['intermediate', 'nature', 'science'], skillNames: ['vocabulary', 'listening'] },
    { slug: 'coloring-animals', type: 'coloring', title: 'Color the Animals', emoji: '', description: 'Choose your colors and bring animals to life!', body: { templates: ['cat', 'dog', 'fish', 'bird'] }, status: 'published', accessTier: 'free', ageGroup: 'all', difficulty: 'easy', energyLevel: 'calm', durationMinutes: 10, authorId: ID.editor, tagNames: ['beginner', 'animals', 'art', 'creative', 'calm'], skillNames: ['fine-motor', 'creativity', 'color-identification'] },

    // ── Lessons (2) ──
    { slug: 'seasons-lesson', type: 'lesson', title: 'The Four Seasons', emoji: '', description: 'Spring, Summer, Fall, and Winter explained.', body: { seasons: ['Spring', 'Summer', 'Fall', 'Winter'] }, status: 'published', accessTier: 'premium', ageGroup: 'age_4_5', difficulty: 'medium', energyLevel: 'moderate', durationMinutes: 12, authorId: ID.admin, tagNames: ['intermediate', 'nature', 'science', 'long'], skillNames: ['vocabulary', 'listening', 'pattern-recognition'] },
    { slug: 'day-night-lesson', type: 'lesson', title: 'Day and Night', emoji: '', description: 'Why does it get dark? Learn about day and night.', body: { concepts: ['sunrise', 'sunset', 'moon', 'stars'] }, status: 'scheduled', accessTier: 'premium', ageGroup: 'age_4_5', difficulty: 'medium', scheduledAt: daysFromNow(7), authorId: ID.admin, tagNames: ['intermediate', 'space', 'science'], skillNames: ['vocabulary', 'listening'] },
  ];

  const contentIdMap: Record<string, string> = {};

  for (const item of contentItems) {
    const { tagNames, skillNames, ...data } = item;

    const tagConnections = tagNames
      .filter((n) => tags[n])
      .map((n) => ({ tagId: tags[n] }));

    const content = await prisma.content.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        slug: data.slug,
        type: data.type as any,
        title: data.title,
        emoji: data.emoji,
        description: data.description,
        body: data.body,
        status: data.status as any,
        accessTier: (data.accessTier || 'free') as any,
        ageGroup: (data.ageGroup || 'all') as any,
        difficulty: (data.difficulty || null) as any,
        energyLevel: (data.energyLevel || null) as any,
        durationMinutes: data.durationMinutes || null,
        bedtimeFriendly: data.bedtimeFriendly || false,
        featured: data.featured || false,
        authorId: data.authorId,
        publishedAt: data.status === 'published' ? daysAgo(Math.floor(Math.random() * 60)) : null,
        scheduledAt: data.scheduledAt || null,
        archivedAt: (data as any).archivedAt || null,
        tags: {
          createMany: { data: tagConnections, skipDuplicates: true },
        },
      },
    });
    contentIdMap[data.slug] = content.id;

    // Link skills
    for (const skillName of skillNames) {
      if (!skills[skillName]) continue;
      try {
        await prisma.contentSkill.upsert({
          where: { contentId_skillId: { contentId: content.id, skillId: skills[skillName] } },
          update: {},
          create: { contentId: content.id, skillId: skills[skillName], relevance: 1.0 },
        });
      } catch { /* skip duplicates */ }
    }
  }
  console.log(`  [Content] Created ${contentItems.length} content items`);

  // ── 5. Collections (4) ──────────────────────────────────

  const collectionsData = [
    { id: ID.colGettingStarted, title: 'Getting Started', slug: 'getting-started', emoji: '', description: 'A beginner collection for new learners.', coverColor: '#4ECDC4', ageGroup: 'age_2_3' as const, estimatedMinutes: 15, sequential: true, published: true, slugs: ['letter-a', 'counting-1-5', 'primary-colors', 'basic-shapes'] },
    { id: ID.colBedtime, title: 'Bedtime Collection', slug: 'bedtime-favorites', emoji: '', description: 'Calm activities perfect for winding down.', coverColor: '#A78BFA', ageGroup: 'all' as const, estimatedMinutes: 25, sequential: false, published: true, slugs: ['goodnight-moon', 'lullaby-twinkle', 'nature-sounds', 'happy-sad'] },
    { id: ID.colNumbers, title: 'Numbers Journey', slug: 'numbers-journey', emoji: '', description: 'From counting to addition.', coverColor: '#FFE66D', ageGroup: 'age_3_4' as const, estimatedMinutes: 30, sequential: true, published: true, slugs: ['counting-1-5', 'counting-6-10', 'counting-11-20', 'simple-addition'] },
    { id: ID.colCreative, title: 'Creative Corner', slug: 'creative-corner', emoji: '', description: 'Art, music, and imagination.', coverColor: '#FF6B6B', ageGroup: 'all' as const, estimatedMinutes: 40, sequential: false, published: false, slugs: ['secondary-colors', 'coloring-animals', 'dance-party', 'alphabet-song'] },
  ];

  for (const col of collectionsData) {
    const { slugs, ...colData } = col;
    const itemsToCreate = slugs
      .filter((s) => contentIdMap[s])
      .map((s, i) => ({ contentId: contentIdMap[s], orderIndex: i }));

    await prisma.collection.upsert({
      where: { slug: colData.slug },
      update: {},
      create: {
        ...colData,
        items: { createMany: { data: itemsToCreate, skipDuplicates: true } },
      },
    });
  }
  console.log(`  [Collections] Created ${collectionsData.length} collections`);

  // ── 6. Households (5) ───────────────────────────────────

  const householdsData = [
    { id: ID.hhFree,     name: 'Free Family',      timezone: 'America/New_York',    locale: 'en', plan: 'free' },
    { id: ID.hhTrial,    name: 'Trial Family',      timezone: 'America/Chicago',     locale: 'en', plan: 'free' },
    { id: ID.hhPremium,  name: 'Premium Family',    timezone: 'America/Los_Angeles', locale: 'en', plan: 'premium' },
    { id: ID.hhExpired,  name: 'Expired Family',    timezone: 'Europe/London',       locale: 'en', plan: 'free' },
    { id: ID.hhMultiKid, name: 'Multi-Child Family', timezone: 'Asia/Tokyo',         locale: 'en', plan: 'premium' },
  ];

  for (const hh of householdsData) {
    await prisma.household.upsert({
      where: { id: hh.id },
      update: {},
      create: hh,
    });
  }
  console.log(`  [Households] Created ${householdsData.length} households`);

  // ── 7. Parent Accounts (6) ──────────────────────────────

  const parentsData = [
    { id: ID.parentFree1,    householdId: ID.hhFree,     email: 'free@staging.test',      name: 'Fiona Free',     role: 'primary' },
    { id: ID.parentTrial1,   householdId: ID.hhTrial,    email: 'trial@staging.test',     name: 'Tina Trial',     role: 'primary' },
    { id: ID.parentPremium1, householdId: ID.hhPremium,  email: 'premium@staging.test',   name: 'Pete Premium',   role: 'primary' },
    { id: ID.parentExpired1, householdId: ID.hhExpired,  email: 'expired@staging.test',   name: 'Elaine Expired', role: 'primary' },
    { id: ID.parentMulti1,   householdId: ID.hhMultiKid, email: 'multi1@staging.test',    name: 'Maya Multi',     role: 'primary' },
    { id: ID.parentMulti2,   householdId: ID.hhMultiKid, email: 'multi2@staging.test',    name: 'Marcus Multi',   role: 'caregiver' },
  ];

  for (const p of parentsData) {
    await prisma.parentAccount.upsert({
      where: { email: p.email },
      update: {},
      create: { ...p, password: parentPw },
    });
  }
  console.log(`  [Parents] Created ${parentsData.length} parent accounts`);

  // ── 8. Child Profiles (8) ──────────────────────────────

  const childrenData = [
    { id: ID.childFree1,    householdId: ID.hhFree,     name: 'Freddie',  avatarEmoji: '', ageGroup: 'age_3_4' as const, interests: ['animals', 'colors'], totalStars: 45,  streakDays: 3 },
    { id: ID.childTrial1,   householdId: ID.hhTrial,    name: 'Tara',     avatarEmoji: '', ageGroup: 'age_2_3' as const, interests: ['stories', 'music'],   totalStars: 12,  streakDays: 1 },
    { id: ID.childPremium1, householdId: ID.hhPremium,  name: 'Penny',    avatarEmoji: '', ageGroup: 'age_4_5' as const, interests: ['science', 'games'],   totalStars: 350, streakDays: 14 },
    { id: ID.childExpired1, householdId: ID.hhExpired,  name: 'Ethan',    avatarEmoji: '', ageGroup: 'age_3_4' as const, interests: ['animals'],            totalStars: 80,  streakDays: 0 },
    { id: ID.childMulti1,   householdId: ID.hhMultiKid, name: 'Mika',     avatarEmoji: '', ageGroup: 'age_2_3' as const, interests: ['colors', 'music'],    totalStars: 20,  streakDays: 5 },
    { id: ID.childMulti2,   householdId: ID.hhMultiKid, name: 'Kai',      avatarEmoji: '', ageGroup: 'age_3_4' as const, interests: ['animals', 'stories'], totalStars: 150, streakDays: 7 },
    { id: ID.childMulti3,   householdId: ID.hhMultiKid, name: 'Suki',     avatarEmoji: '', ageGroup: 'age_4_5' as const, interests: ['science', 'space'],   totalStars: 500, streakDays: 21 },
    { id: ID.childMulti4,   householdId: ID.hhMultiKid, name: 'Ryo',      avatarEmoji: '', ageGroup: 'age_5_6' as const, interests: ['games', 'reading'],   totalStars: 820, streakDays: 30, reducedMotion: true, largerText: true },
  ];

  for (const c of childrenData) {
    const { interests, reducedMotion, largerText, ...rest } = c as any;
    try {
      await prisma.childProfile.create({
        data: {
          ...rest,
          interests: JSON.stringify(interests),
          reducedMotion: reducedMotion || false,
          largerText: largerText || false,
        },
      });
    } catch { /* may already exist */ }
  }
  console.log(`  [Children] Created ${childrenData.length} child profiles`);

  // ── 9. Subscriptions (5) ────────────────────────────────

  const subscriptionsData = [
    { id: ID.subFree,    householdId: ID.hhFree,     plan: 'free' as const,            status: 'active'   as const, currentPeriodStart: daysAgo(90),  currentPeriodEnd: daysFromNow(275) },
    { id: ID.subTrial,   householdId: ID.hhTrial,    plan: 'trial' as const,           status: 'trialing' as const, currentPeriodStart: daysAgo(7),   currentPeriodEnd: daysFromNow(7),  trialEndsAt: daysFromNow(7) },
    { id: ID.subPremium, householdId: ID.hhPremium,  plan: 'premium_annual' as const,  status: 'active'   as const, currentPeriodStart: daysAgo(60),  currentPeriodEnd: daysFromNow(305) },
    { id: ID.subExpired, householdId: ID.hhExpired,  plan: 'premium_monthly' as const, status: 'expired'  as const, currentPeriodStart: daysAgo(60),  currentPeriodEnd: daysAgo(30),     cancelledAt: daysAgo(35) },
    { id: ID.subMulti,   householdId: ID.hhMultiKid, plan: 'family_annual' as const,   status: 'active'   as const, currentPeriodStart: daysAgo(120), currentPeriodEnd: daysFromNow(245) },
  ];

  for (const sub of subscriptionsData) {
    try {
      await prisma.subscription.create({ data: { ...sub, provider: 'manual', metadata: {} } });
    } catch { /* skip if exists */ }
  }
  console.log(`  [Subscriptions] Created ${subscriptionsData.length} subscriptions`);

  // ── 10. Entitlements ────────────────────────────────────

  const entitlementsData = [
    { householdId: ID.hhFree,     feature: 'basic_content',     granted: true,  source: 'plan:free' },
    { householdId: ID.hhTrial,    feature: 'basic_content',     granted: true,  source: 'plan:trial' },
    { householdId: ID.hhTrial,    feature: 'premium_content',   granted: true,  source: 'plan:trial',           expiresAt: daysFromNow(7) },
    { householdId: ID.hhPremium,  feature: 'basic_content',     granted: true,  source: 'plan:premium_annual' },
    { householdId: ID.hhPremium,  feature: 'premium_content',   granted: true,  source: 'plan:premium_annual' },
    { householdId: ID.hhPremium,  feature: 'offline_packs',     granted: true,  source: 'plan:premium_annual' },
    { householdId: ID.hhPremium,  feature: 'cross_device_sync', granted: true,  source: 'plan:premium_annual' },
    { householdId: ID.hhExpired,  feature: 'basic_content',     granted: true,  source: 'plan:free' },
    { householdId: ID.hhExpired,  feature: 'premium_content',   granted: false, source: 'plan:expired' },
    { householdId: ID.hhMultiKid, feature: 'basic_content',     granted: true,  source: 'plan:family_annual' },
    { householdId: ID.hhMultiKid, feature: 'premium_content',   granted: true,  source: 'plan:family_annual' },
    { householdId: ID.hhMultiKid, feature: 'offline_packs',     granted: true,  source: 'plan:family_annual' },
    { householdId: ID.hhMultiKid, feature: 'cross_device_sync', granted: true,  source: 'plan:family_annual' },
    { householdId: ID.hhMultiKid, feature: 'multi_profile',     granted: true,  source: 'plan:family_annual' },
  ];

  for (const ent of entitlementsData) {
    try {
      await prisma.entitlement.upsert({
        where: { householdId_feature: { householdId: ent.householdId, feature: ent.feature } },
        update: {},
        create: ent,
      });
    } catch { /* skip */ }
  }
  console.log(`  [Entitlements] Created ${entitlementsData.length} entitlements`);

  // ── 11. Reviews (10) ────────────────────────────────────

  const reviewSlugs = ['letter-d', 'jungle-animals', 'ocean-friends', 'color-quiz-hard', 'letter-e', 'rainy-day', 'number-puzzle', 'number-patterns', 'trail-mix', 'science-experiment'];
  const reviewStatuses = ['pending', 'in_progress', 'approved', 'changes_requested', 'rejected', 'pending', 'in_progress', 'approved', 'approved', 'changes_requested'] as const;

  for (let i = 0; i < reviewSlugs.length; i++) {
    const cid = contentIdMap[reviewSlugs[i]];
    if (!cid) continue;
    try {
      const review = await prisma.review.create({
        data: {
          contentId: cid,
          reviewerId: ID.reviewer,
          status: reviewStatuses[i],
          summary: `Review for ${reviewSlugs[i]}: ${reviewStatuses[i]}`,
        },
      });

      // Add 1-3 comments per review
      const commentCount = (i % 3) + 1;
      for (let j = 0; j < commentCount; j++) {
        await prisma.reviewComment.create({
          data: {
            reviewId: review.id,
            authorId: j % 2 === 0 ? ID.reviewer : ID.editor,
            body: `Comment ${j + 1} on ${reviewSlugs[i]}: ${['Looks good overall.', 'Please fix the description.', 'Great content, approved!', 'Needs more detail in body section.', 'Updated as requested.'][j % 5]}`,
            field: j === 0 ? 'description' : j === 1 ? 'body' : null,
            resolved: reviewStatuses[i] === 'approved',
          },
        });
      }
    } catch { /* skip */ }
  }
  console.log(`  [Reviews] Created ${reviewSlugs.length} reviews with comments`);

  // ── 12. Releases (5) ────────────────────────────────────

  const releasesData = [
    { contentSlug: 'letter-a',          action: 'publish'   as const, status: 'completed' as const, notes: 'Initial publish',       executedAt: daysAgo(30) },
    { contentSlug: 'space-adventure',   action: 'feature'   as const, status: 'completed' as const, notes: 'Featured for March',    executedAt: daysAgo(5) },
    { contentSlug: 'day-night-lesson',  action: 'publish'   as const, status: 'scheduled' as const, notes: 'Scheduled for next week', scheduledAt: daysFromNow(7) },
    { contentSlug: 'dinosaurs',         action: 'archive'   as const, status: 'completed' as const, notes: 'Content outdated',      executedAt: daysAgo(30) },
    { contentSlug: 'number-puzzle',     action: 'publish'   as const, status: 'failed'    as const, notes: 'Missing assets',        executedAt: daysAgo(2) },
  ];

  for (const rel of releasesData) {
    const cid = contentIdMap[rel.contentSlug];
    if (!cid) continue;
    try {
      await prisma.release.create({
        data: {
          contentId: cid,
          action: rel.action,
          status: rel.status,
          notes: rel.notes,
          scheduledAt: rel.scheduledAt || null,
          executedAt: rel.executedAt || null,
          createdBy: ID.admin,
        },
      });
    } catch { /* skip */ }
  }
  console.log(`  [Releases] Created ${releasesData.length} releases`);

  // ── 13. Feature Flags (12) ──────────────────────────────

  const flagsData = [
    { key: 'premium_content',       name: 'Premium Content',       description: 'Enable premium content gating',      enabled: true },
    { key: 'cross_device_sync',     name: 'Cross-Device Sync',     description: 'Enable sync across devices',          enabled: true },
    { key: 'family_routines',       name: 'Family Routines',       description: 'Enable routine planner feature',      enabled: true },
    { key: 'deep_links',            name: 'Deep Links',            description: 'Enable deep link resolution',         enabled: true },
    { key: 'parent_tips',           name: 'Parent Tips',           description: 'Enable parent tips section',          enabled: true },
    { key: 'inbox_messages',        name: 'Inbox Messages',        description: 'Enable parent inbox',                 enabled: true },
    { key: 'performance_tracking',  name: 'Performance Tracking',  description: 'Enable frontend perf metrics',        enabled: true },
    { key: 'error_reporting',       name: 'Error Reporting',       description: 'Enable client error reporting',       enabled: true },
    { key: 'offline_packs',         name: 'Offline Packs',         description: 'Enable downloadable offline packs',   enabled: true },
    { key: 'ab_testing',            name: 'A/B Testing',           description: 'Enable experiment framework',         enabled: true },
    { key: 'ai_briefs',             name: 'AI Content Briefs',     description: 'Enable AI brief generation',          enabled: false },
    { key: 'voice_pipeline',        name: 'Voice Pipeline',        description: 'Enable AI voice generation',          enabled: false },
  ];

  for (const flag of flagsData) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: { ...flag, defaultValue: false, targeting: {} },
    });
  }
  console.log(`  [Feature Flags] Created ${flagsData.length} flags`);

  // ── 14. Routines (4) ────────────────────────────────────

  const routinesData = [
    { householdId: ID.hhPremium, profileId: ID.childPremium1, name: 'Morning Learning', type: 'morning', items: [{ contentType: 'alphabet', label: 'Letter of the Day', duration: 5 }, { contentType: 'number', label: 'Counting Practice', duration: 5 }, { contentType: 'quiz', label: 'Quick Quiz', duration: 3 }], isTemplate: false, scheduleDays: ['mon', 'tue', 'wed', 'thu', 'fri'], scheduledTime: '08:00', estimatedMinutes: 13 },
    { householdId: ID.hhPremium, profileId: ID.childPremium1, name: 'Bedtime Wind-Down', type: 'bedtime', items: [{ contentType: 'story', label: 'Bedtime Story', duration: 10 }, { contentType: 'audio', label: 'Calm Sounds', duration: 5 }], isTemplate: false, scheduleDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], scheduledTime: '19:30', estimatedMinutes: 15 },
    { householdId: ID.hhMultiKid, name: 'Weekend Fun', type: 'custom', items: [{ contentType: 'game', label: 'Game Time', duration: 10 }, { contentType: 'movement', label: 'Dance Break', duration: 5 }, { contentType: 'cooking', label: 'Cook Together', duration: 15 }], isTemplate: false, scheduleDays: ['sat', 'sun'], estimatedMinutes: 30 },
    { householdId: ID.hhFree, name: 'Quick Learn', type: 'custom', items: [{ contentType: 'alphabet', label: 'Letters', duration: 5 }, { contentType: 'color', label: 'Colors', duration: 5 }], isTemplate: true, scheduleDays: ['mon', 'wed', 'fri'], estimatedMinutes: 10 },
  ];

  for (const r of routinesData) {
    const existing = await prisma.routine.findFirst({ where: { householdId: r.householdId, name: r.name } });
    if (!existing) {
      await prisma.routine.create({ data: r });
    }
  }
  console.log(`  [Routines] Created ${routinesData.length} routines`);

  // ── 15. Messages (8) ────────────────────────────────────

  const messagesData = [
    { householdId: ID.hhFree,     type: 'welcome',      title: 'Welcome to Kids Learning Fun!', body: 'Start exploring fun learning activities with your child.', read: true,  readAt: daysAgo(5) },
    { householdId: ID.hhFree,     type: 'tip',          title: 'Try a Bedtime Story',           body: 'Bedtime stories help children wind down. Try one tonight!', read: false },
    { householdId: ID.hhTrial,    type: 'welcome',      title: 'Welcome to Your Free Trial!',   body: 'You have 14 days to explore all premium content.', read: true, readAt: daysAgo(3) },
    { householdId: ID.hhTrial,    type: 'trial_ending',  title: 'Your Trial Ends Soon',          body: 'Only 7 days left! Upgrade to keep premium access.', read: false, expiresAt: daysFromNow(7) },
    { householdId: ID.hhPremium,  type: 'milestone',    title: 'Penny earned 300 stars!',        body: 'Amazing progress! Penny has been learning so much.', read: true, readAt: daysAgo(2), profileId: ID.childPremium1 },
    { householdId: ID.hhPremium,  type: 'weekly_recap',  title: 'Weekly Learning Recap',          body: 'Penny completed 12 activities this week. Great job!', read: false, profileId: ID.childPremium1 },
    { householdId: ID.hhExpired,  type: 'subscription',  title: 'Your Subscription Has Expired',  body: 'Renew to access premium content again.', read: false },
    { householdId: ID.hhMultiKid, type: 'new_content',   title: 'New Content Available!',          body: 'Check out 5 new activities added this week.', read: false },
  ];

  for (const msg of messagesData) {
    try {
      await prisma.message.create({ data: msg });
    } catch { /* skip */ }
  }
  console.log(`  [Messages] Created ${messagesData.length} messages`);

  // ── 16. Help Articles (5) ───────────────────────────────

  const helpArticles = [
    { title: 'Getting Started',         slug: 'getting-started',      body: 'Welcome to Kids Learning Fun! Set up your family account and start learning together.',                   category: 'getting_started',  searchKeywords: ['setup', 'start', 'begin', 'new'],               published: true, orderIndex: 0 },
    { title: 'How Offline Mode Works',  slug: 'offline-mode',         body: 'Content is cached automatically. Download packs for extended offline use via Settings.',                   category: 'troubleshooting',  searchKeywords: ['offline', 'download', 'no internet'],            published: true, orderIndex: 1 },
    { title: 'Managing Subscriptions',  slug: 'manage-subscriptions', body: 'Manage your subscription from the Billing page. Cancel, pause, or upgrade anytime.',                     category: 'billing',          searchKeywords: ['subscription', 'billing', 'payment', 'cancel'], published: true, orderIndex: 2 },
    { title: 'Accessibility Features',  slug: 'accessibility',        body: 'We support reduced motion, larger text, and high contrast modes. Find these in Settings.',                category: 'accessibility',    searchKeywords: ['accessibility', 'a11y', 'large text'],           published: true, orderIndex: 3 },
    { title: 'Setting Up Child Profiles', slug: 'child-profiles',     body: 'Each child gets their own profile with age-appropriate content recommendations and progress tracking.',  category: 'getting_started',  searchKeywords: ['profile', 'child', 'setup', 'age'],             published: true, orderIndex: 4 },
  ];

  for (const article of helpArticles) {
    await prisma.helpArticle.upsert({
      where: { slug: article.slug },
      update: {},
      create: article,
    });
  }
  console.log(`  [Help Articles] Created ${helpArticles.length} articles`);

  // ── 17. Parent Tips (5) ─────────────────────────────────

  const parentTips = [
    { title: 'Reading Together',           slug: 'reading-together',         body: 'Reading aloud to your child for just 15 minutes a day builds vocabulary and listening skills.',                        category: 'learning',     format: 'article', ageGroup: 'all'     as const, published: true, publishedAt: daysAgo(30), tags: ['reading', 'vocabulary'] },
    { title: 'Screen Time Balance',        slug: 'screen-time-balance',      body: 'Use the daily timer to set healthy limits. Aim for 30-60 minutes of educational screen time for ages 3-5.',          category: 'wellness',     format: 'quick_tip', ageGroup: 'age_3_4' as const, published: true, publishedAt: daysAgo(20), tags: ['screen-time', 'health'] },
    { title: 'Making Math Fun',            slug: 'making-math-fun',          body: 'Count objects during everyday activities: stairs, snacks, toys. Make it a game!',                                      category: 'learning',     format: 'article', ageGroup: 'age_2_3' as const, published: true, publishedAt: daysAgo(15), tags: ['counting', 'everyday'] },
    { title: 'Bedtime Routine Tips',       slug: 'bedtime-routine-tips',     body: 'A consistent bedtime routine helps children feel secure. Try: bath, story, song, lights out.',                        category: 'routines',     format: 'checklist', ageGroup: 'all'     as const, published: true, publishedAt: daysAgo(10), tags: ['bedtime', 'routine'] },
    { title: 'Encouraging Creativity',     slug: 'encouraging-creativity',   body: 'Let your child lead creative play. Ask open-ended questions like "What do you think happens next?"',                  category: 'development',  format: 'article', ageGroup: 'age_4_5' as const, published: false, tags: ['creativity', 'play'] },
  ];

  for (const tip of parentTips) {
    const { tags: tipTags, ...tipData } = tip;
    await prisma.parentTip.upsert({
      where: { slug: tipData.slug },
      update: {},
      create: { ...tipData, tags: tipTags },
    });
  }
  console.log(`  [Parent Tips] Created ${parentTips.length} tips`);

  // ── 18. Consent Records ─────────────────────────────────

  const consentRecords = [
    { parentId: ID.parentFree1,    consentType: 'terms_of_service', granted: true,  version: '1.0', ipAddress: '192.168.1.1' },
    { parentId: ID.parentFree1,    consentType: 'privacy_policy',   granted: true,  version: '1.0', ipAddress: '192.168.1.1' },
    { parentId: ID.parentTrial1,   consentType: 'terms_of_service', granted: true,  version: '1.0', ipAddress: '10.0.0.2' },
    { parentId: ID.parentTrial1,   consentType: 'privacy_policy',   granted: true,  version: '1.0', ipAddress: '10.0.0.2' },
    { parentId: ID.parentTrial1,   consentType: 'marketing_emails', granted: false, version: '1.0', ipAddress: '10.0.0.2' },
    { parentId: ID.parentPremium1, consentType: 'terms_of_service', granted: true,  version: '1.0', ipAddress: '172.16.0.5' },
    { parentId: ID.parentPremium1, consentType: 'privacy_policy',   granted: true,  version: '1.0', ipAddress: '172.16.0.5' },
    { parentId: ID.parentPremium1, consentType: 'marketing_emails', granted: true,  version: '1.0', ipAddress: '172.16.0.5' },
    { parentId: ID.parentMulti1,   consentType: 'terms_of_service', granted: true,  version: '1.0', ipAddress: '192.168.10.1' },
    { parentId: ID.parentMulti1,   consentType: 'privacy_policy',   granted: true,  version: '1.0', ipAddress: '192.168.10.1' },
  ];

  for (const c of consentRecords) {
    try {
      await prisma.consentRecord.create({ data: c });
    } catch { /* skip */ }
  }
  console.log(`  [Consent] Created ${consentRecords.length} consent records`);

  // ── 19. Recommendation Configs ──────────────────────────

  const recoConfigs = [
    { key: 'freshness_weight',  value: 0.3, description: 'Weight for content freshness in recommendations' },
    { key: 'repeat_penalty',    value: 0.5, description: 'Penalty multiplier for recently viewed content' },
    { key: 'bedtime_bias',      value: 1.5, description: 'Boost factor for calm content during bedtime' },
    { key: 'skill_boost',       value: 1.2, description: 'Boost for content matching weak skills' },
    { key: 'age_match_weight',  value: 2.0, description: 'Weight for age-appropriate content matching' },
    { key: 'diversity_factor',  value: 0.4, description: 'Minimum diversity across content types' },
  ];

  for (const cfg of recoConfigs) {
    await prisma.recommendationConfig.upsert({
      where: { key: cfg.key },
      update: {},
      create: { key: cfg.key, value: cfg.value, description: cfg.description },
    });
  }
  console.log(`  [Recommendation] Created ${recoConfigs.length} configs`);

  // ── 20. Permissions ─────────────────────────────────────

  const permissionsData = [
    { role: 'admin', resource: 'content',    action: 'create' },
    { role: 'admin', resource: 'content',    action: 'read' },
    { role: 'admin', resource: 'content',    action: 'update' },
    { role: 'admin', resource: 'content',    action: 'delete' },
    { role: 'admin', resource: 'content',    action: 'publish' },
    { role: 'admin', resource: 'asset',      action: 'create' },
    { role: 'admin', resource: 'asset',      action: 'read' },
    { role: 'admin', resource: 'asset',      action: 'update' },
    { role: 'admin', resource: 'asset',      action: 'delete' },
    { role: 'admin', resource: 'collection', action: 'create' },
    { role: 'admin', resource: 'collection', action: 'read' },
    { role: 'admin', resource: 'collection', action: 'update' },
    { role: 'admin', resource: 'collection', action: 'delete' },
    { role: 'admin', resource: 'household',  action: 'create' },
    { role: 'admin', resource: 'household',  action: 'read' },
    { role: 'admin', resource: 'household',  action: 'update' },
    { role: 'admin', resource: 'household',  action: 'delete' },
    { role: 'admin', resource: 'audit',      action: 'read' },
    { role: 'admin', resource: 'system',     action: 'read' },
    { role: 'admin', resource: 'system',     action: 'update' },
    { role: 'admin', resource: 'permission', action: 'create' },
    { role: 'admin', resource: 'permission', action: 'read' },
    { role: 'admin', resource: 'permission', action: 'update' },
    { role: 'admin', resource: 'permission', action: 'delete' },
    { role: 'editor', resource: 'content',    action: 'create' },
    { role: 'editor', resource: 'content',    action: 'read' },
    { role: 'editor', resource: 'content',    action: 'update' },
    { role: 'editor', resource: 'asset',      action: 'create' },
    { role: 'editor', resource: 'asset',      action: 'read' },
    { role: 'editor', resource: 'asset',      action: 'update' },
    { role: 'editor', resource: 'collection', action: 'read' },
    { role: 'editor', resource: 'collection', action: 'update' },
    { role: 'reviewer', resource: 'content',    action: 'read' },
    { role: 'reviewer', resource: 'content',    action: 'approve' },
    { role: 'reviewer', resource: 'asset',      action: 'read' },
    { role: 'reviewer', resource: 'collection', action: 'read' },
    { role: 'viewer', resource: 'content',    action: 'read' },
    { role: 'viewer', resource: 'asset',      action: 'read' },
    { role: 'viewer', resource: 'collection', action: 'read' },
  ];

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { role_resource_action: { role: perm.role, resource: perm.resource, action: perm.action } },
      update: {},
      create: { ...perm, allowed: true },
    });
  }
  console.log(`  [Permissions] Created ${permissionsData.length} permissions`);

  // ── 21. Content Policies ────────────────────────────────

  const policiesData = [
    { name: 'bedtime-energy-check',  category: 'bedtime_suitability',   severity: 'error',   description: 'Bedtime content must not have active energy level', rules: {}, enabled: true },
    { name: 'skill-coverage',        category: 'educational_mismatch',  severity: 'warning', description: 'All content should have at least one skill association', rules: {}, enabled: true },
    { name: 'off-brand-language',    category: 'off_brand_language',    severity: 'error',   description: 'Block content containing banned words', rules: { bannedWords: ['stupid', 'dumb', 'hate', 'ugly', 'loser'] }, enabled: true },
    { name: 'age-appropriateness',   category: 'age_appropriateness',   severity: 'warning', description: 'Flag content with mismatched age groups', rules: {}, enabled: true },
  ];

  for (const p of policiesData) {
    await prisma.contentPolicy.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
  }
  console.log(`  [Policies] Created ${policiesData.length} content policies`);

  // ── 22. Performance Baselines ───────────────────────────

  const baselines = [
    { metricType: 'startup',    p50: 800,  p75: 1200, p95: 2500, threshold: 3000 },
    { metricType: 'navigation', p50: 150,  p75: 300,  p95: 800,  threshold: 1000 },
    { metricType: 'media_load', p50: 500,  p75: 1000, p95: 2000, threshold: 3000 },
    { metricType: 'animation',  p50: 16,   p75: 20,   p95: 33,   threshold: 50 },
  ];

  for (const b of baselines) {
    await prisma.performanceBaseline.upsert({
      where: { metricType: b.metricType },
      update: {},
      create: b,
    });
  }
  console.log(`  [Baselines] Created ${baselines.length} performance baselines`);

  // ── 23. Journeys ────────────────────────────────────────

  const journeysData = [
    { name: 'welcome-journey',            description: 'Onboarding journey for new families',   triggerType: 'signup',        enabled: true,  cooldownHours: 24 },
    { name: 'trial-ending',               description: 'Remind families their trial is ending', triggerType: 'trial_ending',  enabled: true,  cooldownHours: 48 },
    { name: 'inactivity-reengagement',    description: 'Re-engage inactive families',            triggerType: 'inactivity',    enabled: false, cooldownHours: 72 },
  ];

  for (const j of journeysData) {
    const journey = await prisma.journey.upsert({
      where: { name: j.name },
      update: {},
      create: j,
    });
    if (j.name === 'welcome-journey') {
      const count = await prisma.journeyStep.count({ where: { journeyId: journey.id } });
      if (count === 0) {
        await prisma.journeyStep.createMany({
          data: [
            { journeyId: journey.id, orderIndex: 0, delayHours: 0,  messageTemplate: { type: 'tip', title: 'Welcome!', body: 'Start exploring fun learning activities.' } },
            { journeyId: journey.id, orderIndex: 1, delayHours: 24, messageTemplate: { type: 'tip', title: 'Try a Story', body: 'Bedtime stories are a great way to wind down.' } },
            { journeyId: journey.id, orderIndex: 2, delayHours: 72, messageTemplate: { type: 'recap', title: 'First Week Done!', body: 'Check your child\'s progress.' } },
          ],
        });
      }
    }
  }
  console.log(`  [Journeys] Created ${journeysData.length} journeys`);

  // ── 24. Offline Packs (2) ──────────────────────────────

  const packsData = [
    { title: 'Starter Pack', slug: 'starter-pack', emoji: '', description: 'Essential activities for offline learning.', ageGroup: 'age_2_3' as const, sizeEstimateMB: 25.5, version: 1, published: true, slugs: ['letter-a', 'letter-b', 'counting-1-5', 'primary-colors', 'basic-shapes', 'goodnight-moon'] },
    { title: 'Adventure Pack', slug: 'adventure-pack', emoji: '', description: 'Stories and games for road trips.', ageGroup: 'age_3_4' as const, sizeEstimateMB: 45.0, version: 1, published: true, slugs: ['brave-little-bear', 'farm-animals', 'ocean-animals', 'shape-hunt', 'color-match', 'animal-sounds-quiz'] },
  ];

  for (const pack of packsData) {
    const { slugs: packSlugs, ...packData } = pack;
    const packItems = packSlugs
      .filter((s) => contentIdMap[s])
      .map((s) => ({ contentId: contentIdMap[s], includeAssets: true }));

    await prisma.offlinePack.upsert({
      where: { slug: packData.slug },
      update: {},
      create: {
        ...packData,
        items: { createMany: { data: packItems, skipDuplicates: true } },
      },
    });
  }
  console.log(`  [Offline Packs] Created ${packsData.length} packs`);

  // ── 25. Deep Links (4) ──────────────────────────────────

  const deepLinksData = [
    { shortCode: 'welcome',   targetType: 'page',       targetPath: '/onboarding',              campaign: 'onboarding', clicks: 142 },
    { shortCode: 'space',     targetType: 'content',     targetId: contentIdMap['space-adventure'], campaign: 'featured_march', clicks: 87 },
    { shortCode: 'shapes',    targetType: 'collection',  targetId: ID.colGettingStarted,         campaign: 'social_share', clicks: 33 },
    { shortCode: 'upgrade',   targetType: 'page',       targetPath: '/settings/billing',        campaign: 'trial_ending', clicks: 256, expiresAt: daysFromNow(30) },
  ];

  for (const dl of deepLinksData) {
    try {
      await prisma.deepLink.create({ data: dl });
    } catch { /* skip if shortCode exists */ }
  }
  console.log(`  [Deep Links] Created ${deepLinksData.length} deep links`);

  // ── 26. Promo Codes (3) ─────────────────────────────────

  const promoCodes = [
    { code: 'STAGING50',     description: '50% off first month',    discountType: 'percent', discountValue: 50, maxRedemptions: 100, timesRedeemed: 12, validFrom: daysAgo(30), validUntil: daysFromNow(60) },
    { code: 'FREEMONTH',     description: 'One free month',          discountType: 'fixed',   discountValue: 999, maxRedemptions: 50,  timesRedeemed: 3,  validFrom: daysAgo(10), validUntil: daysFromNow(20) },
    { code: 'EXPIRED2025',   description: 'Expired promo code',      discountType: 'percent', discountValue: 25, maxRedemptions: 200, timesRedeemed: 87, validFrom: daysAgo(365), validUntil: daysAgo(30) },
  ];

  for (const promo of promoCodes) {
    try {
      await prisma.promoCode.create({ data: promo });
    } catch { /* skip if exists */ }
  }
  console.log(`  [Promo Codes] Created ${promoCodes.length} promo codes`);

  // ── 27. Analytics Samples ───────────────────────────────

  const topContentSlugs = ['letter-a', 'counting-1-5', 'farm-animals', 'goodnight-moon', 'color-match', 'animal-sounds-quiz'];
  for (const slug of topContentSlugs) {
    const cid = contentIdMap[slug];
    if (!cid) continue;
    for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
      const d = daysAgo(weekOffset * 7);
      const weekKey = `${d.getFullYear()}-W${String(Math.ceil((d.getDate()) / 7)).padStart(2, '0')}`;
      try {
        await prisma.contentAnalytics.create({
          data: {
            contentId: cid,
            period: 'weekly',
            periodKey: weekKey + `-${slug.substring(0, 4)}`,
            views: 50 + Math.floor(Math.random() * 200),
            completions: 30 + Math.floor(Math.random() * 100),
            avgTimeMs: 120000 + Math.floor(Math.random() * 180000),
            stars: Math.floor(Math.random() * 50),
            favorites: Math.floor(Math.random() * 20),
            shares: Math.floor(Math.random() * 5),
          },
        });
      } catch { /* skip unique violations */ }
    }
  }
  console.log(`  [Analytics] Created sample analytics data`);

  // ── Done ────────────────────────────────────────────────

  console.log('\nStaging seed complete!');
  console.log('\nTest accounts:');
  console.log('  Admin:    admin@staging.kidslearning.app / staging123');
  console.log('  Editor:   editor@staging.kidslearning.app / staging123');
  console.log('  Reviewer: reviewer@staging.kidslearning.app / staging123');
  console.log('  Viewer:   viewer@staging.kidslearning.app / staging123');
  console.log('\nParent accounts (password: parent123):');
  console.log('  Free:     free@staging.test');
  console.log('  Trial:    trial@staging.test');
  console.log('  Premium:  premium@staging.test');
  console.log('  Expired:  expired@staging.test');
  console.log('  Multi:    multi1@staging.test / multi2@staging.test');
}

seedStaging()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Staging seed failed:', e);
    prisma.$disconnect();
    process.exit(1);
  });
