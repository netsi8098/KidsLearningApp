// ── Vocabulary Levels ───────────────────────────────────────────────────────
// Age-appropriate vocabulary specifications for Kids Learning Fun.
// Every piece of child-facing copy is validated against these levels.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────

export type AgeGroup = '2-3' | '4-5' | '6-8';

export interface VocabLevel {
  ageGroup: AgeGroup;
  /** Maximum characters in any single word. */
  maxWordLength: number;
  /** Maximum syllable count per word. */
  maxSyllables: number;
  /** Words this age group comfortably knows and can read/understand. */
  safeWords: string[];
  /** Words that are too complex and should be substituted. */
  avoidWords: string[];
  /** Words currently being introduced — OK to use with context. */
  transitionWords: string[];
  /** Common sentence structures for this age. */
  sentencePatterns: string[];
}

// ── Vocabulary Definitions ──────────────────────────────────────────────────

export const vocabLevels: Record<AgeGroup, VocabLevel> = {

  // ─── Ages 2-3: Toddlers ──────────────────────────────────────────────────
  '2-3': {
    ageGroup: '2-3',
    maxWordLength: 6,
    maxSyllables: 2,
    safeWords: [
      // People & self
      'me', 'you', 'baby', 'mama', 'dada', 'friend',
      // Actions
      'go', 'stop', 'run', 'jump', 'sit', 'eat', 'drink', 'play', 'look',
      'see', 'find', 'tap', 'clap', 'sing', 'dance', 'sleep', 'hug',
      'give', 'get', 'put', 'push', 'pull', 'open', 'close', 'wash',
      // Things
      'ball', 'dog', 'cat', 'bird', 'fish', 'tree', 'sun', 'moon',
      'star', 'book', 'car', 'bus', 'hat', 'shoe', 'cup', 'bed',
      'door', 'home', 'toy', 'box', 'block',
      // Food
      'milk', 'water', 'apple', 'banana', 'cookie',
      // Colors
      'red', 'blue', 'green', 'yellow', 'pink', 'black', 'white',
      // Shapes
      'circle', 'square', 'star',
      // Body
      'hand', 'foot', 'head', 'eye', 'nose', 'mouth', 'ear', 'arm', 'leg',
      // Feelings
      'happy', 'sad', 'mad', 'nice', 'fun', 'good', 'yay',
      // Descriptors
      'big', 'small', 'hot', 'cold', 'wet', 'dry', 'soft', 'loud',
      'fast', 'slow', 'up', 'down', 'in', 'out', 'on', 'off',
      // Social
      'hi', 'bye', 'yes', 'no', 'please', 'thank', 'sorry', 'love',
      // Quantity
      'one', 'two', 'three', 'more', 'all', 'my',
    ],
    avoidWords: [
      'instruction', 'activity', 'complete', 'challenge', 'continue',
      'explore', 'discover', 'celebrate', 'achievement', 'collection',
      'progress', 'favorite', 'different', 'remember', 'important',
      'correct', 'incorrect', 'question', 'answer', 'example',
      'practice', 'pattern', 'sequence', 'beginning', 'exercise',
      'excellent', 'wonderful', 'brilliant', 'fantastic', 'incredible',
      'suggestion', 'recommend', 'especially', 'adventure', 'imagine',
    ],
    transitionWords: [
      'color', 'shape', 'animal', 'number', 'letter', 'name',
      'match', 'same', 'next', 'turn', 'try', 'again', 'new',
      'count', 'point', 'touch', 'listen', 'hear', 'say', 'sound',
      'today', 'now', 'here', 'this', 'that', 'which', 'where',
    ],
    sentencePatterns: [
      'Look at the {noun}.',
      'Tap the {noun}.',
      'This is a {noun}.',
      'Can you find the {noun}?',
      'Say {word}.',
      'Good job!',
      '{Noun} says {sound}.',
      'Where is the {noun}?',
      'It is {adjective}.',
      'You did it!',
    ],
  },

  // ─── Ages 4-5: Preschool ─────────────────────────────────────────────────
  '4-5': {
    ageGroup: '4-5',
    maxWordLength: 8,
    maxSyllables: 3,
    safeWords: [
      // Everything from 2-3, plus:
      // People
      'friend', 'teacher', 'helper', 'family', 'brother', 'sister',
      // Actions
      'learn', 'think', 'know', 'draw', 'paint', 'build', 'count',
      'spell', 'write', 'read', 'match', 'sort', 'guess', 'listen',
      'choose', 'pick', 'share', 'help', 'make', 'show', 'hide',
      'follow', 'start', 'finish', 'begin', 'try', 'move', 'shake',
      'touch', 'drag', 'spin', 'trace', 'color', 'mix', 'fill',
      // Things
      'letter', 'number', 'word', 'shape', 'animal', 'picture',
      'sound', 'music', 'song', 'story', 'page', 'button', 'screen',
      'puzzle', 'game', 'prize', 'badge', 'crown', 'heart',
      'garden', 'forest', 'ocean', 'mountain', 'river', 'cloud',
      'rainbow', 'flower', 'butterfly', 'rabbit', 'turtle', 'bear',
      // Concepts
      'same', 'other', 'next', 'first', 'last', 'after', 'before',
      'because', 'maybe', 'almost', 'ready', 'done', 'again', 'together',
      // Feelings
      'brave', 'proud', 'scared', 'angry', 'excited', 'careful',
      'gentle', 'quiet', 'silly', 'funny', 'kind', 'strong',
      // Descriptors
      'new', 'little', 'tiny', 'pretty', 'shiny', 'round', 'long',
      'short', 'tall', 'heavy', 'light', 'bright', 'dark', 'warm',
      'cool', 'smooth', 'bumpy', 'sticky', 'fuzzy', 'sparkly',
      // Time
      'today', 'morning', 'night', 'soon', 'later', 'now', 'always',
      // Quantity
      'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'many', 'some', 'few', 'every', 'each', 'both',
    ],
    avoidWords: [
      'instruction', 'achievement', 'assessment', 'curriculum',
      'demonstrate', 'comprehension', 'vocabulary', 'appropriate',
      'participate', 'recognize', 'identify', 'observation',
      'comparison', 'specifically', 'particularly', 'unfortunately',
      'immediately', 'approximately', 'information', 'opportunity',
      'experience', 'environment', 'communicate', 'understand',
      'improvement', 'development', 'combination', 'celebration',
    ],
    transitionWords: [
      'discover', 'explore', 'adventure', 'collect', 'favorite',
      'special', 'amazing', 'wonderful', 'practice', 'remember',
      'different', 'another', 'between', 'under', 'behind', 'above',
      'through', 'inside', 'outside', 'around', 'across', 'along',
      'question', 'answer', 'clue', 'secret', 'surprise', 'problem',
      'correct', 'perfect', 'pattern', 'complete',
    ],
    sentencePatterns: [
      'Can you find the {noun} that is {adjective}?',
      'Tap the {noun} that comes next.',
      'Which one is the {noun}?',
      'Let us {verb} the {noun} together.',
      'Great job! You found the {noun}.',
      'What sound does the letter {letter} make?',
      'Look! There are {number} {noun}s.',
      'Drag the {noun} to the right spot.',
      'Listen carefully. What do you hear?',
      'You are doing so well!',
    ],
  },

  // ─── Ages 6-8: Early Readers ─────────────────────────────────────────────
  '6-8': {
    ageGroup: '6-8',
    maxWordLength: 10,
    maxSyllables: 4,
    safeWords: [
      // Everything from 4-5, plus:
      // Actions
      'discover', 'explore', 'imagine', 'create', 'design', 'solve',
      'compare', 'measure', 'observe', 'explain', 'describe', 'predict',
      'collect', 'organize', 'arrange', 'improve', 'practice', 'complete',
      'achieve', 'succeed', 'continue', 'remember', 'forget', 'decide',
      'believe', 'wonder', 'notice', 'include', 'separate', 'combine',
      // Things
      'planet', 'universe', 'dinosaur', 'volcano', 'compass', 'treasure',
      'recipe', 'ingredient', 'character', 'adventure', 'invention',
      'experiment', 'collection', 'favorite', 'champion', 'explorer',
      'detective', 'scientist', 'artist', 'musician', 'builder',
      'continent', 'country', 'language', 'culture', 'tradition',
      // Concepts
      'challenge', 'question', 'answer', 'problem', 'solution', 'reason',
      'example', 'different', 'similar', 'opposite', 'between', 'during',
      'although', 'however', 'perhaps', 'exactly', 'probably', 'finally',
      'already', 'usually', 'actually', 'especially', 'certainly',
      // Feelings
      'curious', 'confident', 'nervous', 'surprised', 'grateful',
      'determined', 'peaceful', 'creative', 'patient', 'frustrated',
      'amazing', 'fantastic', 'wonderful', 'brilliant', 'incredible',
      // Descriptors
      'enormous', 'delicate', 'ancient', 'modern', 'natural', 'famous',
      'colorful', 'unusual', 'powerful', 'mysterious', 'invisible',
      'favorite', 'original', 'ordinary', 'perfect', 'important',
    ],
    avoidWords: [
      'algorithm', 'optimization', 'methodology', 'infrastructure',
      'implementation', 'configuration', 'authorization', 'subsequently',
      'comprehensive', 'sophisticated', 'functionality', 'prerequisite',
      'approximately', 'differentiate', 'categorization', 'fundamentally',
      'systematically', 'prioritization', 'accountability', 'characteristic',
    ],
    transitionWords: [
      'prediction', 'strategy', 'investigate', 'experiment',
      'hypothesis', 'conclusion', 'sequence', 'relationship',
      'connection', 'difference', 'similarity', 'category',
      'instruction', 'explanation', 'description', 'definition',
      'paragraph', 'chapter', 'summary', 'glossary',
    ],
    sentencePatterns: [
      'What do you think will happen if {condition}?',
      'Can you figure out the pattern?',
      'Put the {noun}s in order from {start} to {end}.',
      'Read the {noun} and answer the question.',
      'You discovered something new about {topic}!',
      'Here is a challenge: {challenge}.',
      'Think about it. What is the answer?',
      'Excellent work! You solved the puzzle.',
      'Compare these two {noun}s. What is different?',
      'You are becoming an expert at {skill}!',
    ],
  },
};

// ── Word Substitution Map ───────────────────────────────────────────────────
// Maps complex words to simpler alternatives for younger age groups.
// Format: complexWord -> { '2-3': simpleVersion, '4-5': mediumVersion }
// If a key is absent, the word is considered OK for that age group.

export const wordSubstitutions: Record<string, Partial<Record<AgeGroup, string>>> = {
  'discover':     { '2-3': 'find' },
  'explore':      { '2-3': 'look at' },
  'adventure':    { '2-3': 'fun trip' },
  'amazing':      { '2-3': 'so good' },
  'wonderful':    { '2-3': 'so nice' },
  'incredible':   { '2-3': 'so good',    '4-5': 'amazing' },
  'excellent':    { '2-3': 'great',      '4-5': 'great' },
  'brilliant':    { '2-3': 'great',      '4-5': 'so smart' },
  'fantastic':    { '2-3': 'so fun',     '4-5': 'amazing' },
  'continue':     { '2-3': 'keep going', '4-5': 'keep going' },
  'complete':     { '2-3': 'finish',     '4-5': 'finish' },
  'challenge':    { '2-3': 'try',        '4-5': 'tricky one' },
  'collection':   { '2-3': 'group',      '4-5': 'set' },
  'favorite':     { '2-3': 'best one' },
  'practice':     { '2-3': 'do again' },
  'remember':     { '2-3': 'think of' },
  'different':    { '2-3': 'not same' },
  'correct':      { '2-3': 'right' },
  'incorrect':    { '2-3': 'not right',  '4-5': 'not right' },
  'celebrate':    { '2-3': 'be happy',   '4-5': 'hooray' },
  'achievement':  { '2-3': 'good job',   '4-5': 'big win' },
  'accomplish':   { '2-3': 'do it',      '4-5': 'do it' },
  'beautiful':    { '2-3': 'pretty' },
  'enormous':     { '2-3': 'very big',   '4-5': 'really big' },
  'delicate':     { '2-3': 'gentle',     '4-5': 'soft' },
  'ancient':      { '2-3': 'very old',   '4-5': 'really old' },
  'mysterious':   { '2-3': 'hidden',     '4-5': 'secret' },
  'invisible':    { '2-3': 'can not see','4-5': 'hidden' },
  'determine':    { '2-3': 'find out',   '4-5': 'figure out' },
  'investigate':  { '2-3': 'look at',    '4-5': 'look into' },
  'experiment':   { '2-3': 'try it',     '4-5': 'test it' },
  'instructions': { '2-3': 'what to do', '4-5': 'steps' },
  'suggestion':   { '2-3': 'idea',       '4-5': 'idea' },
  'recommend':    { '2-3': 'try this',   '4-5': 'try this' },
  'especially':   { '2-3': 'really',     '4-5': 'really' },
  'immediately':  { '2-3': 'right now',  '4-5': 'right now' },
  'unfortunately':{ '2-3': 'oh no',      '4-5': 'too bad' },
  'approximately':{ '2-3': 'about',      '4-5': 'about' },
  'environment':  { '2-3': 'place',      '4-5': 'world' },
  'opportunity':  { '2-3': 'chance',     '4-5': 'chance' },
  'comparison':   { '2-3': 'same or not','4-5': 'how they match' },
  'observation':  { '2-3': 'what I see', '4-5': 'what you see' },
  'progress':     { '2-3': 'how far',    '4-5': 'how you are doing' },
  'sequence':     { '2-3': 'order',      '4-5': 'order' },
  'pattern':      { '2-3': 'same again', '4-5': 'pattern' },
  'confident':    { '2-3': 'brave',      '4-5': 'sure' },
  'frustrated':   { '2-3': 'upset',      '4-5': 'stuck' },
  'determined':   { '2-3': 'not giving up', '4-5': 'not giving up' },
  'ingredients':  { '2-3': 'things we need', '4-5': 'what we need' },
  'recipe':       { '2-3': 'how to make it', '4-5': 'recipe' },
};

// ── Helper Functions ────────────────────────────────────────────────────────

/**
 * Count the syllables in an English word (rough heuristic).
 * Accurate enough for copy-level vocabulary checking.
 */
export function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 2) return 1;

  // Count vowel groups
  const vowelGroups = w.match(/[aeiouy]+/gi);
  let count = vowelGroups ? vowelGroups.length : 1;

  // Subtract silent e at end
  if (w.endsWith('e') && !w.endsWith('le')) {
    count = Math.max(1, count - 1);
  }

  // Handle common endings
  if (w.endsWith('ed') && !w.endsWith('ted') && !w.endsWith('ded')) {
    count = Math.max(1, count - 1);
  }

  return Math.max(1, count);
}

/**
 * Check if a word is safe for the given age group.
 * Returns true if the word is in safeWords or transitionWords.
 */
export function isWordSafe(word: string, ageGroup: AgeGroup): boolean {
  const level = vocabLevels[ageGroup];
  const lower = word.toLowerCase().replace(/[^a-z]/g, '');

  if (lower.length === 0) return true; // punctuation, etc.
  if (lower.length <= 2) return true;  // articles, prepositions

  return (
    level.safeWords.includes(lower) ||
    level.transitionWords.includes(lower)
  );
}

/**
 * Check if a word should be avoided for the given age group.
 */
export function isWordAvoided(word: string, ageGroup: AgeGroup): boolean {
  const level = vocabLevels[ageGroup];
  const lower = word.toLowerCase().replace(/[^a-z]/g, '');
  return level.avoidWords.includes(lower);
}

/**
 * Get a simpler substitute for a word at a given age level.
 * Returns the original word if no substitution is needed.
 */
export function getSubstitute(word: string, ageGroup: AgeGroup): string {
  const lower = word.toLowerCase().replace(/[^a-z]/g, '');
  const entry = wordSubstitutions[lower];
  if (!entry) return word;

  const sub = entry[ageGroup];
  if (!sub) return word;

  // Preserve original capitalization pattern
  if (word[0] === word[0].toUpperCase()) {
    return sub.charAt(0).toUpperCase() + sub.slice(1);
  }
  return sub;
}

/**
 * Transform a text string to be appropriate for a given age group.
 * - Substitutes complex words with simpler alternatives
 * - Flags (but does not remove) words that exceed syllable/length limits
 *
 * This is a best-effort text adaptation. For critical copy, always write
 * age-specific variants by hand using the phrase bank.
 */
export function getAgeAppropriateText(text: string, ageGroup: AgeGroup): string {
  const level = vocabLevels[ageGroup];

  return text
    .split(/(\s+)/)
    .map((token) => {
      // Preserve whitespace tokens
      if (/^\s+$/.test(token)) return token;

      // Strip punctuation for lookup, reattach later
      const match = token.match(/^([^a-zA-Z]*)([a-zA-Z]+)([^a-zA-Z]*)$/);
      if (!match) return token;

      const [, prefix, word, suffix] = match;

      // Check if substitution is available
      const substituted = getSubstitute(word, ageGroup);
      if (substituted !== word) {
        return prefix + substituted + suffix;
      }

      // Check syllable count
      const syllables = countSyllables(word);
      if (syllables > level.maxSyllables) {
        // Try to find a substitution in the map
        const lower = word.toLowerCase();
        const mapEntry = wordSubstitutions[lower];
        if (mapEntry && mapEntry[ageGroup]) {
          return prefix + getSubstitute(word, ageGroup) + suffix;
        }
      }

      return token;
    })
    .join('');
}

/**
 * Validate a piece of copy against an age group's vocabulary rules.
 * Returns an array of issues found (empty if all is well).
 */
export interface VocabIssue {
  word: string;
  issue: 'too-long' | 'too-many-syllables' | 'avoided' | 'not-in-safe-list';
  suggestion?: string;
}

export function validateCopy(text: string, ageGroup: AgeGroup): VocabIssue[] {
  const level = vocabLevels[ageGroup];
  const issues: VocabIssue[] = [];

  const words = text.match(/[a-zA-Z]+/g) || [];

  for (const word of words) {
    const lower = word.toLowerCase();

    // Check avoid list
    if (isWordAvoided(lower, ageGroup)) {
      issues.push({
        word: lower,
        issue: 'avoided',
        suggestion: getSubstitute(lower, ageGroup),
      });
      continue;
    }

    // Check word length
    if (lower.length > level.maxWordLength) {
      issues.push({
        word: lower,
        issue: 'too-long',
        suggestion: getSubstitute(lower, ageGroup),
      });
    }

    // Check syllable count
    const syllables = countSyllables(lower);
    if (syllables > level.maxSyllables) {
      issues.push({
        word: lower,
        issue: 'too-many-syllables',
        suggestion: getSubstitute(lower, ageGroup),
      });
    }
  }

  return issues;
}

/**
 * Validate a sentence length against age group rules.
 * Returns true if the sentence is within acceptable length.
 */
export function validateSentenceLength(sentence: string, ageGroup: AgeGroup): boolean {
  const wordCount = (sentence.match(/[a-zA-Z]+/g) || []).length;
  const maxWords: Record<AgeGroup, number> = {
    '2-3': 8,
    '4-5': 12,
    '6-8': 16,
  };
  return wordCount <= maxWords[ageGroup];
}

/** All defined age groups. */
export const allAgeGroups: AgeGroup[] = ['2-3', '4-5', '6-8'];
