// ── Speech Performance Rules ───────────────────────────────────────────────
// Age-appropriate speech rules, praise systems, correction patterns,
// pause timing, and SSML helper functions for Kids Learning Fun.

// ── Types ──────────────────────────────────────────────────────────────────

export type SpeechAgeGroup = '2-3' | '4-5' | '6-8';

export interface AgeGroupSpeechRules {
  ageGroup: SpeechAgeGroup;
  label: string;
  /** Maximum words per sentence for this age */
  maxWordsPerSentence: number;
  /** Max syllables per vocabulary word */
  maxSyllablesPerWord: number;
  /** SpeechSynthesis rate multiplier */
  rateMultiplier: number;
  /** SpeechSynthesis pitch offset */
  pitchOffset: number;
  /** Warmth level 1-10 (affects TTS and writing style) */
  warmthLevel: number;
  /** Whether to use repetition for reinforcement */
  useRepetition: boolean;
  /** Number of times to repeat key concepts */
  repetitionCount: number;
  /** Pause after questions (ms) */
  pauseAfterQuestionMs: number;
  /** Pause between sentences (ms) */
  pauseBetweenSentencesMs: number;
  /** Whether to explain new vocabulary inline */
  explainVocabulary: boolean;
  /** Example sentence patterns */
  sentencePatterns: string[];
  /** Speech style notes for copywriters */
  styleNotes: string;
}

export type PraiseType = 'effort' | 'result' | 'encouragement' | 'surprise';

export interface PraiseEntry {
  type: PraiseType;
  text: string;
  /** Which age groups this phrase works for */
  ageGroups: SpeechAgeGroup[];
}

export interface CorrectionPattern {
  id: string;
  label: string;
  /** The spoken phrase */
  text: string;
  /** Direction for when to use this pattern */
  whenToUse: string;
  ageGroups: SpeechAgeGroup[];
}

export interface ConceptIntroStep {
  step: number;
  label: string;
  description: string;
  exampleText: string;
  pauseAfterMs: number;
}

export interface PauseRule {
  context: string;
  durationMs: number;
  ssmlBreak: string;
  notes: string;
}

// ── Age Group Speech Rules ─────────────────────────────────────────────────

export const ageGroupRules: Record<SpeechAgeGroup, AgeGroupSpeechRules> = {

  // ─── Toddlers (2-3) ─────────────────────────────────────────────────────
  '2-3': {
    ageGroup: '2-3',
    label: 'Toddlers',
    maxWordsPerSentence: 6,
    maxSyllablesPerWord: 2,
    rateMultiplier: 0.78,
    pitchOffset: 0.15,
    warmthLevel: 10,
    useRepetition: true,
    repetitionCount: 3,
    pauseAfterQuestionMs: 1200,
    pauseBetweenSentencesMs: 600,
    explainVocabulary: false,
    sentencePatterns: [
      'Look! A {thing}!',
      'Can you say {word}?',
      '{Word}! {Word}! {Word}!',
      'Touch the {thing}!',
      'Where is the {thing}?',
      'Yay! You found it!',
      'This is {colour}.',
      'One, two, three!',
    ],
    styleNotes:
      'Very short, very simple. Use exclamation marks to convey vocal energy. ' +
      'Repeat key words 2-3 times. Always use concrete, visible things. ' +
      'Avoid abstractions entirely. Say "Look!" and "Wow!" a lot. ' +
      'Every sentence should feel like a tiny celebration.',
  },

  // ─── Preschool (4-5) ────────────────────────────────────────────────────
  '4-5': {
    ageGroup: '4-5',
    label: 'Preschool',
    maxWordsPerSentence: 10,
    maxSyllablesPerWord: 3,
    rateMultiplier: 0.88,
    pitchOffset: 0.1,
    warmthLevel: 8,
    useRepetition: true,
    repetitionCount: 2,
    pauseAfterQuestionMs: 800,
    pauseBetweenSentencesMs: 400,
    explainVocabulary: true,
    sentencePatterns: [
      'Let us learn about {topic} together!',
      'Can you find the one that is {adjective}?',
      'This is called a {word}. That means {simple definition}.',
      'How many {things} can you count?',
      'What colour is this one?',
      'Which one is different from the others?',
      'Great thinking! You figured it out!',
      'Try saying it with me: {word}.',
    ],
    styleNotes:
      'Slightly longer sentences but still concrete. Introduce one new word ' +
      'at a time, always with a simple explanation. Use "Let us" to invite ' +
      'collaboration. Questions should have clear, achievable answers. ' +
      'Celebrate effort explicitly: "You tried really hard!"',
  },

  // ─── Early Learners (6-8) ───────────────────────────────────────────────
  '6-8': {
    ageGroup: '6-8',
    label: 'Early Learners',
    maxWordsPerSentence: 15,
    maxSyllablesPerWord: 4,
    rateMultiplier: 0.95,
    pitchOffset: 0.05,
    warmthLevel: 7,
    useRepetition: false,
    repetitionCount: 1,
    pauseAfterQuestionMs: 600,
    pauseBetweenSentencesMs: 300,
    explainVocabulary: true,
    sentencePatterns: [
      'Did you know that {interesting fact}?',
      'Think about this: {thought-provoking question}.',
      'The word {word} means {definition}. Can you use it in a sentence?',
      'What do you think would happen if {hypothetical}?',
      'You are right! And here is why that works.',
      'That is a tricky one. Let us break it down step by step.',
      'Great question! Let us find out together.',
      'Challenge time: can you {challenge}?',
    ],
    styleNotes:
      'Full sentences, natural pacing. Introduce vocabulary with context. ' +
      'Use "why" and "how" questions to develop critical thinking. ' +
      'Praise should be specific: "You remembered that the triangle has ' +
      'three sides!" rather than generic "Good job!" Mix challenge with ' +
      'support. These children can handle mild difficulty if framed as exciting.',
  },
};

// ── Praise Variety System ──────────────────────────────────────────────────

export const praiseLibrary: PraiseEntry[] = [
  // ── Effort-based praise (the most important kind) ──
  { type: 'effort', text: 'You tried so hard! That is what makes you amazing.', ageGroups: ['2-3', '4-5', '6-8'] },
  { type: 'effort', text: 'I love how you kept going even when it was tricky!', ageGroups: ['4-5', '6-8'] },
  { type: 'effort', text: 'You did not give up! That takes real courage.', ageGroups: ['4-5', '6-8'] },
  { type: 'effort', text: 'Wow, you tried! Good job!', ageGroups: ['2-3'] },
  { type: 'effort', text: 'You practiced and practiced and it paid off!', ageGroups: ['6-8'] },
  { type: 'effort', text: 'Your hard work is really showing!', ageGroups: ['4-5', '6-8'] },
  { type: 'effort', text: 'You did your best. That is always enough.', ageGroups: ['2-3', '4-5'] },
  { type: 'effort', text: 'What great focus! You really concentrated on that one.', ageGroups: ['6-8'] },

  // ── Result-based praise (use sparingly, pair with effort) ──
  { type: 'result', text: 'You got it right! Brilliant!', ageGroups: ['2-3', '4-5', '6-8'] },
  { type: 'result', text: 'Perfect answer! You really know your stuff.', ageGroups: ['6-8'] },
  { type: 'result', text: 'That is correct! Well done!', ageGroups: ['4-5', '6-8'] },
  { type: 'result', text: 'Yay! Right answer!', ageGroups: ['2-3'] },
  { type: 'result', text: 'Spot on! First try too!', ageGroups: ['4-5', '6-8'] },
  { type: 'result', text: 'You nailed it!', ageGroups: ['6-8'] },

  // ── Encouragement (during struggle) ──
  { type: 'encouragement', text: 'You can do this. I believe in you.', ageGroups: ['2-3', '4-5', '6-8'] },
  { type: 'encouragement', text: 'Take your time. There is no rush.', ageGroups: ['2-3', '4-5', '6-8'] },
  { type: 'encouragement', text: 'You are getting closer with every try!', ageGroups: ['4-5', '6-8'] },
  { type: 'encouragement', text: 'This one is tough, but you are tougher!', ageGroups: ['6-8'] },
  { type: 'encouragement', text: 'I am right here with you. Let us do this together.', ageGroups: ['2-3', '4-5'] },
  { type: 'encouragement', text: 'Almost! Just a tiny bit more!', ageGroups: ['2-3', '4-5'] },

  // ── Surprise praise (unexpected delight) ──
  { type: 'surprise', text: 'Whoa! I did not expect you to get that so fast!', ageGroups: ['4-5', '6-8'] },
  { type: 'surprise', text: 'Wait, really?! You already knew that? Incredible!', ageGroups: ['6-8'] },
  { type: 'surprise', text: 'WOW! Just wow!', ageGroups: ['2-3', '4-5'] },
  { type: 'surprise', text: 'No way! You are too clever!', ageGroups: ['4-5', '6-8'] },
  { type: 'surprise', text: 'That was amazing! Even I learned something!', ageGroups: ['6-8'] },
];

/**
 * Get a praise phrase by type, filtered by age group.
 * Implements rotation by tracking recently used indices.
 */
const _praiseRotation = new Map<string, number[]>();

export function getPraise(type: PraiseType, ageGroup: SpeechAgeGroup): string {
  const key = `${type}-${ageGroup}`;
  const candidates = praiseLibrary.filter(
    (p) => p.type === type && p.ageGroups.includes(ageGroup),
  );
  if (candidates.length === 0) return 'Great job!';

  let usedIndices = _praiseRotation.get(key) ?? [];
  // Reset if all have been used
  if (usedIndices.length >= candidates.length) {
    usedIndices = [];
  }
  // Pick a random unused index
  const available = candidates.map((_, i) => i).filter((i) => !usedIndices.includes(i));
  const pick = available[Math.floor(Math.random() * available.length)];
  usedIndices.push(pick);
  _praiseRotation.set(key, usedIndices);
  return candidates[pick].text;
}

// ── Gentle Correction Patterns ─────────────────────────────────────────────

export const correctionPatterns: CorrectionPattern[] = [
  {
    id: 'cor-almost',
    label: 'Almost There',
    text: 'Almost! You are so close!',
    whenToUse: 'When the child picked a nearby or related answer',
    ageGroups: ['2-3', '4-5', '6-8'],
  },
  {
    id: 'cor-try-again',
    label: 'Try Again',
    text: 'Let us try again! You will get it!',
    whenToUse: 'Generic retry prompt after any wrong answer',
    ageGroups: ['2-3', '4-5', '6-8'],
  },
  {
    id: 'cor-great-guess',
    label: 'Great Guess',
    text: 'That is a great guess! The answer is a little different though.',
    whenToUse: 'When the child made a logical but incorrect choice',
    ageGroups: ['4-5', '6-8'],
  },
  {
    id: 'cor-so-close',
    label: 'So Close',
    text: 'Ooh, so close! Just one little thing is different.',
    whenToUse: 'When the answer is partially correct',
    ageGroups: ['4-5', '6-8'],
  },
  {
    id: 'cor-tricky',
    label: 'Tricky One',
    text: 'That is a tricky one, is it not? Do not worry, we will figure it out together.',
    whenToUse: 'When the child has failed the same item multiple times',
    ageGroups: ['4-5', '6-8'],
  },
  {
    id: 'cor-oopsie',
    label: 'Oopsie',
    text: 'Whoopsie! Not that one. Try again!',
    whenToUse: 'Lighthearted first-attempt correction for toddlers',
    ageGroups: ['2-3'],
  },
  {
    id: 'cor-show-you',
    label: 'Let Me Show You',
    text: 'Here, let me show you. Look!',
    whenToUse: 'After 2+ failed attempts, scaffolding the answer',
    ageGroups: ['2-3', '4-5'],
  },
  {
    id: 'cor-thinking',
    label: 'Good Thinking',
    text: 'Good thinking! That was not it, but your reasoning was smart.',
    whenToUse: 'When the child\'s logic was sound even if the answer was wrong',
    ageGroups: ['6-8'],
  },
];

/**
 * Get a context-appropriate correction pattern.
 */
export function getCorrection(ageGroup: SpeechAgeGroup, attemptNumber: number): CorrectionPattern {
  const candidates = correctionPatterns.filter((c) => c.ageGroups.includes(ageGroup));
  if (attemptNumber >= 3) {
    // After multiple attempts, use the "show you" pattern
    return candidates.find((c) => c.id === 'cor-show-you') ?? candidates[0];
  }
  if (attemptNumber === 2) {
    return candidates.find((c) => c.id === 'cor-tricky' || c.id === 'cor-so-close') ?? candidates[0];
  }
  // First attempt: light touch
  const firstAttempt = candidates.filter((c) =>
    ['cor-almost', 'cor-try-again', 'cor-great-guess', 'cor-oopsie'].includes(c.id),
  );
  return firstAttempt[Math.floor(Math.random() * firstAttempt.length)] ?? candidates[0];
}

// ── Concept Introduction Pattern ───────────────────────────────────────────

export const conceptIntroSteps: ConceptIntroStep[] = [
  {
    step: 1,
    label: 'Name It',
    description: 'Introduce the concept by name with enthusiasm.',
    exampleText: 'This is the letter B!',
    pauseAfterMs: 500,
  },
  {
    step: 2,
    label: 'Show It',
    description: 'Show or highlight the concept visually on screen.',
    exampleText: 'Look! Here it is. See the letter B?',
    pauseAfterMs: 800,
  },
  {
    step: 3,
    label: 'Explain It',
    description: 'Give a brief, age-appropriate explanation.',
    exampleText: 'The letter B makes a "buh" sound. Buh, buh, B!',
    pauseAfterMs: 600,
  },
  {
    step: 4,
    label: 'Repeat It',
    description: 'Have the child repeat or interact with the concept.',
    exampleText: 'Can you say B? Say it with me! B!',
    pauseAfterMs: 1200,
  },
  {
    step: 5,
    label: 'Practice It',
    description: 'Let the child apply the concept in a simple exercise.',
    exampleText: 'Now touch the letter B on the screen!',
    pauseAfterMs: 0,
  },
];

// ── Pause Rules ────────────────────────────────────────────────────────────

export const pauseRules: PauseRule[] = [
  {
    context: 'After a question (waiting for child to think/respond)',
    durationMs: 500,
    ssmlBreak: '<break time="500ms"/>',
    notes: 'Critical pause. Never rush past a question. For toddlers, extend to 1200ms.',
  },
  {
    context: 'Between sentences (natural breathing pause)',
    durationMs: 300,
    ssmlBreak: '<break time="300ms"/>',
    notes: 'Standard inter-sentence pause. Slightly longer in bedtime mode (500ms).',
  },
  {
    context: 'Dramatic pause (before a reveal or surprise)',
    durationMs: 1000,
    ssmlBreak: '<break time="1000ms"/>',
    notes: 'Use before revealing an answer or a new concept. Builds anticipation.',
  },
  {
    context: 'After praise (let it land emotionally)',
    durationMs: 400,
    ssmlBreak: '<break time="400ms"/>',
    notes: 'Let the child feel the praise. Do not immediately move on.',
  },
  {
    context: 'Before retry prompt (processing time after mistake)',
    durationMs: 600,
    ssmlBreak: '<break time="600ms"/>',
    notes: 'Give the child a moment to process the mistake before the retry invite.',
  },
  {
    context: 'Bedtime breath pause (between breathing cues)',
    durationMs: 1500,
    ssmlBreak: '<break time="1500ms"/>',
    notes: 'Match real breathing rhythm during guided relaxation.',
  },
  {
    context: 'Counting pause (between numbers)',
    durationMs: 400,
    ssmlBreak: '<break time="400ms"/>',
    notes: 'Even spacing for counting. Slower for toddlers (600ms).',
  },
  {
    context: 'Song countdown (between count numbers)',
    durationMs: 250,
    ssmlBreak: '<break time="250ms"/>',
    notes: 'Rhythmic, establishes tempo.',
  },
];

/**
 * Get the recommended pause duration for a given context and age group.
 */
export function getPauseDuration(
  context: string,
  ageGroup: SpeechAgeGroup = '4-5',
): number {
  const rule = pauseRules.find((r) =>
    r.context.toLowerCase().includes(context.toLowerCase()),
  );
  const base = rule?.durationMs ?? 300;
  // Toddlers get longer pauses
  if (ageGroup === '2-3') return Math.round(base * 1.5);
  if (ageGroup === '6-8') return Math.round(base * 0.85);
  return base;
}

// ── SSML Helper Functions ──────────────────────────────────────────────────

/**
 * Wrap text with SSML prosody based on age group speech rules.
 */
export function wrapWithProsody(
  text: string,
  ageGroup: SpeechAgeGroup,
  overrides?: { rate?: string; pitch?: string; volume?: string },
): string {
  const rules = ageGroupRules[ageGroup];
  const ratePercent = Math.round(rules.rateMultiplier * 100);
  const pitchPercent = Math.round(rules.pitchOffset * 100);

  const rate = overrides?.rate ?? `${ratePercent}%`;
  const pitch = overrides?.pitch ?? `+${pitchPercent}%`;
  const volume = overrides?.volume ?? 'medium';

  return `<speak><prosody rate="${rate}" pitch="${pitch}" volume="${volume}">${text}</prosody></speak>`;
}

/**
 * Add appropriate pauses to text based on punctuation.
 * Replaces sentence-ending punctuation with SSML breaks.
 */
export function addPauses(text: string, ageGroup: SpeechAgeGroup): string {
  const sentencePause = getPauseDuration('between sentences', ageGroup);
  const questionPause = getPauseDuration('question', ageGroup);

  return text
    .replace(/\.\s+/g, `. <break time="${sentencePause}ms"/> `)
    .replace(/!\s+/g, `! <break time="${sentencePause}ms"/> `)
    .replace(/\?\s+/g, `? <break time="${questionPause}ms"/> `);
}

/**
 * Add emphasis to a word or phrase within SSML.
 */
export function emphasize(
  text: string,
  level: 'reduced' | 'moderate' | 'strong' = 'moderate',
): string {
  return `<emphasis level="${level}">${text}</emphasis>`;
}

/**
 * Create an SSML break element.
 */
export function ssmlBreak(durationMs: number): string {
  return `<break time="${durationMs}ms"/>`;
}

/**
 * Create a complete SSML document for a sentence, applying age-appropriate
 * prosody, pauses, and emphasis automatically.
 */
export function buildSSML(
  text: string,
  ageGroup: SpeechAgeGroup,
  options?: {
    emphasizeWords?: string[];
    volume?: string;
  },
): string {
  let processed = addPauses(text, ageGroup);

  // Apply emphasis to specified words
  if (options?.emphasizeWords) {
    for (const word of options.emphasizeWords) {
      processed = processed.replace(
        new RegExp(`\\b(${word})\\b`, 'gi'),
        emphasize('$1', 'moderate'),
      );
    }
  }

  return wrapWithProsody(processed, ageGroup, { volume: options?.volume });
}

/**
 * Get the SpeechSynthesis rate and pitch values for an age group.
 * Useful for applying rules to the Web SpeechSynthesis API directly.
 */
export function getTTSParams(ageGroup: SpeechAgeGroup): { rate: number; pitch: number } {
  const rules = ageGroupRules[ageGroup];
  return {
    rate: rules.rateMultiplier,
    pitch: 1.0 + rules.pitchOffset,
  };
}
