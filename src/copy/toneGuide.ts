// ── Tone Guide ──────────────────────────────────────────────────────────────
// Authoritative tone specification for every writing context in Kids Learning Fun.
// Each profile defines audience, rules, examples, and measurable constraints.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────

export type ToneAudience = 'child' | 'parent';

export type ToneId =
  | 'child-learning'
  | 'child-play'
  | 'child-bedtime'
  | 'child-reward'
  | 'parent-dashboard'
  | 'parent-settings'
  | 'mascot-leo'
  | 'mascot-daisy'
  | 'mascot-ollie'
  | 'mascot-ruby'
  | 'mascot-finn';

export interface ToneProfile {
  id: ToneId;
  audience: ToneAudience;
  mood: string;
  rules: string[];
  doExamples: string[];
  dontExamples: string[];
  maxSentenceLength: number;
  maxSyllablesPerWord: number;
  punctuationRules: string[];
}

export type AgeGroup = '2-3' | '4-5' | '6-8';

/** Returns the maximum sentence length (in words) for a given age group and tone. */
export function getMaxSentenceLength(toneId: ToneId, ageGroup: AgeGroup): number {
  const profile = toneProfiles[toneId];
  if (!profile) return 12;

  // The base number from the profile targets mid-range (4-5).
  // Scale down for younger, up for older.
  const base = profile.maxSentenceLength;
  switch (ageGroup) {
    case '2-3':
      return Math.max(4, Math.round(base * 0.65));
    case '4-5':
      return base;
    case '6-8':
      return Math.round(base * 1.35);
  }
}

// ── Profile Definitions ──────────────────────────────────────────────────────

export const toneProfiles: Record<ToneId, ToneProfile> = {

  // ─── Child: Learning ──────────────────────────────────────────────────────
  'child-learning': {
    id: 'child-learning',
    audience: 'child',
    mood: 'encouraging, clear, steady',
    rules: [
      'Use short, declarative sentences — one idea per sentence.',
      'Never use the word "wrong". Prefer "let\'s try again" or "not quite".',
      'Avoid conditional phrasing ("if you can..."). Use confident language ("you can!").',
      'Name the action the child should take ("Tap the red one") rather than the concept ("Select the correct answer").',
      'Lead with the visual or tangible element, then explain.',
      'Keep vocabulary within the target age band (see vocabularyLevels).',
      'Questions are allowed but only one per screen.',
      'Avoid negatives — frame everything as what TO do, not what NOT to do.',
    ],
    doExamples: [
      'This is the letter A. Can you say A?',
      'Tap the number that comes next.',
      'Great listening! Let\'s hear it one more time.',
      'Look at the red circle. Red is a warm color.',
    ],
    dontExamples: [
      'Please select the correct alphabetical character.',
      'Wrong! Try harder.',
      'Don\'t press the wrong button.',
      'If you think you know the answer, go ahead and tap it.',
    ],
    maxSentenceLength: 12,
    maxSyllablesPerWord: 3,
    punctuationRules: [
      'Periods for statements.',
      'Question marks for direct questions — max one question per view.',
      'One exclamation point per paragraph when celebrating progress.',
      'No semicolons, em dashes, or parentheses.',
    ],
  },

  // ─── Child: Play ──────────────────────────────────────────────────────────
  'child-play': {
    id: 'child-play',
    audience: 'child',
    mood: 'playful, excited, celebratory',
    rules: [
      'Energy is high — short punchy sentences OK.',
      'Sound words are encouraged: Whoosh, Boing, Pop, Yay.',
      'Max one exclamation point per line.',
      'Onomatopoeia can stand alone as a sentence.',
      'Use second person ("you") to keep the child in the action.',
      'Active verbs only — tap, drag, spin, shake, jump, match.',
      'Playful rhymes welcome but not required.',
      'Never pressure or add urgency ("Hurry up!" is not allowed).',
    ],
    doExamples: [
      'Whoosh! You matched them all!',
      'Tap tap tap — find the hidden star.',
      'Boing! Up you go!',
      'Spin the wheel and see what happens.',
    ],
    dontExamples: [
      'Hurry up before time runs out!',
      'You need to try harder.',
      'This is a game where you should click.',
      'AMAZING!!! WOW!!! GREAT!!!',
    ],
    maxSentenceLength: 10,
    maxSyllablesPerWord: 3,
    punctuationRules: [
      'Exclamation points allowed — max one per line.',
      'Ellipses OK for suspense: "Ready... set... go!"',
      'No semicolons, colons, or parentheses.',
      'Dashes allowed for rhythmic pacing: "Tap tap tap".',
    ],
  },

  // ─── Child: Bedtime ───────────────────────────────────────────────────────
  'child-bedtime': {
    id: 'child-bedtime',
    audience: 'child',
    mood: 'gentle, calm, reassuring',
    rules: [
      'No exclamation points — everything is soft.',
      'Use flowing, lyrical language with a lullaby cadence.',
      'Vocabulary should evoke warmth: cozy, gentle, soft, warm, quiet, sleepy.',
      'Short sentences separated by breathing room (visual spacing).',
      'Never mention energy, speed, or action.',
      'Nature imagery welcome: stars, moon, clouds, gentle breeze.',
      'Whisper-like phrasing: "Shhh..." "Let\'s be very quiet..."',
      'Address the child with tenderness: "little one", "sleepyhead", "dear".',
    ],
    doExamples: [
      'The stars are coming out, one by one.',
      'Close your eyes. Take a slow, deep breath.',
      'Shhh... the moon is watching over you.',
      'You had such a wonderful day. Time to rest now.',
    ],
    dontExamples: [
      'Great job going to bed!',
      'Let\'s race to sleep!',
      'YOU DID IT! Bedtime!',
      'Tap here to start your bedtime routine!',
    ],
    maxSentenceLength: 10,
    maxSyllablesPerWord: 3,
    punctuationRules: [
      'Periods and ellipses only.',
      'No exclamation points ever.',
      'Ellipses create gentle pauses: "The moon rises... soft and silver..."',
      'No question marks in bedtime narration — keep it declarative and soothing.',
    ],
  },

  // ─── Child: Reward ────────────────────────────────────────────────────────
  'child-reward': {
    id: 'child-reward',
    audience: 'child',
    mood: 'proud, warm, specific',
    rules: [
      'Name what the child accomplished — never generic "good job".',
      'Graduate the celebration: small win = warm nod, big win = full fanfare.',
      'Small wins: "Nice! You found the blue one." (calm, specific)',
      'Medium wins: "You matched all the shapes! That took focus." (warm, proud)',
      'Big wins: "You finished the whole lesson! Look how far you have come!" (celebratory)',
      'The praise should make the child feel seen, not just entertained.',
      'Reference effort over talent: "You kept trying" beats "You are so smart".',
      'Keep it present tense — "You did it" not "You have completed the task".',
    ],
    doExamples: [
      'You found all the circles. Sharp eyes!',
      'You remembered every letter from A to Z. That is incredible!',
      'Three stars! You really focused on that one.',
      'Look at your badge collection growing.',
    ],
    dontExamples: [
      'Good job!',
      'Nice!',
      'Congratulations on completing the activity module.',
      'You are the smartest kid ever!',
    ],
    maxSentenceLength: 14,
    maxSyllablesPerWord: 3,
    punctuationRules: [
      'Exclamation points allowed for big wins — max one per message.',
      'Periods for small-win acknowledgments.',
      'No question marks in reward copy.',
      'No ellipses — rewards should feel complete, not trailing off.',
    ],
  },

  // ─── Parent: Dashboard ────────────────────────────────────────────────────
  'parent-dashboard': {
    id: 'parent-dashboard',
    audience: 'parent',
    mood: 'professional, warm, data-clear',
    rules: [
      'Lead with the number or data point, then provide context.',
      'Avoid edu-jargon: say "counting" not "numeracy", "reading" not "literacy skills".',
      'Be specific: "3 lessons this week" not "good progress".',
      'Positive framing first, then areas for growth.',
      'Never alarm or guilt parents — every insight is an opportunity.',
      'Keep sentences under 20 words.',
      'Use "your child" or the child\'s name, never "the user".',
      'Trust-building: explain why something matters, briefly.',
    ],
    doExamples: [
      '12 activities completed this week — up from 8 last week.',
      'Strong pattern in letter recognition. Next step: letter sounds.',
      'Most active time: mornings between 8-9 AM.',
      'Consistent daily practice builds lasting skills.',
    ],
    dontExamples: [
      'Your child\'s literacy competency metrics show upward trajectory.',
      'Warning: your child has not practiced in 3 days.',
      'Performance data indicates suboptimal engagement.',
      'Click here to optimize your child\'s learning outcomes.',
    ],
    maxSentenceLength: 20,
    maxSyllablesPerWord: 4,
    punctuationRules: [
      'Standard punctuation — periods, commas, en dashes for ranges.',
      'No exclamation points in data summaries.',
      'Colons OK for labels: "Favorite topic: Animals".',
      'Parentheses allowed sparingly for clarification.',
    ],
  },

  // ─── Parent: Settings ─────────────────────────────────────────────────────
  'parent-settings': {
    id: 'parent-settings',
    audience: 'parent',
    mood: 'practical, reassuring, clear',
    rules: [
      'Explain what each setting does in one sentence.',
      'Explain the benefit, not just the mechanism.',
      'Use "this" or "when enabled" rather than technical labels.',
      'Reassure when toggling off: "You can turn this back on anytime."',
      'Never assume technical knowledge.',
      'Group related settings conceptually in description copy.',
    ],
    doExamples: [
      'When enabled, the app reads instructions aloud for early learners.',
      'Reduces animations for children sensitive to motion.',
      'Sets a daily time limit. Your child sees a friendly reminder when time is up.',
      'Only you can access this area. A simple math question keeps it parent-only.',
    ],
    dontExamples: [
      'Toggles the TTS engine on/off.',
      'Enables the reduced-motion CSS media query override.',
      'Configure the session timeout threshold.',
      'API: speechSynthesis enabled=true',
    ],
    maxSentenceLength: 18,
    maxSyllablesPerWord: 4,
    punctuationRules: [
      'Standard punctuation.',
      'Periods to end descriptions.',
      'No exclamation points.',
      'Parentheses allowed for brief asides.',
    ],
  },

  // ─── Mascot: Leo Lion ─────────────────────────────────────────────────────
  'mascot-leo': {
    id: 'mascot-leo',
    audience: 'child',
    mood: 'warm, supportive, brave leader',
    rules: [
      'Uses "we" and "together" frequently — Leo is a team player.',
      '"I believe in you" energy in every line.',
      'Leo gently coaches. He doesn\'t just cheer — he guides.',
      'Signature sound: "ROAR!" — used sparingly for big moments.',
      'Leo references courage: "Be brave", "You\'re so brave".',
      'Uses the child\'s accomplishments as proof: "See? You already know this."',
      'Never bossy. Leo suggests, never demands.',
      'Warm and grounding — Leo is the friend who holds your hand.',
    ],
    doExamples: [
      'We can do this together. Ready?',
      'ROAR! That was amazing! I knew you could do it.',
      'Let\'s take this one step at a time.',
      'See? You already know more than you think.',
    ],
    dontExamples: [
      'Do it now.',
      'That was easy, right?',
      'I told you so.',
      'Why did you pick that one?',
    ],
    maxSentenceLength: 12,
    maxSyllablesPerWord: 3,
    punctuationRules: [
      'Exclamation points for ROAR moments only.',
      'Questions to invite participation: "Ready?" "Shall we?"',
      'Periods for coaching statements.',
      'No ellipses — Leo is direct and grounding.',
    ],
  },

  // ─── Mascot: Daisy Duck ───────────────────────────────────────────────────
  'mascot-daisy': {
    id: 'mascot-daisy',
    audience: 'child',
    mood: 'musical, bubbly, sing-song',
    rules: [
      'Daisy speaks in a lilting, musical cadence.',
      'She rhymes when it feels natural — never forced.',
      'Signature sound: "Quack!" — playful, not every line.',
      'She peppers in "la la la" and "tra la la" as fillers.',
      'Daisy notices beauty: colors, patterns, music, creativity.',
      'She encourages artistic expression over correctness.',
      'Loves alliteration: "Beautiful bright blue!"',
      'Her excitement is bubbly, not loud — sparkle, not shouting.',
    ],
    doExamples: [
      'La la la, what shall we paint today?',
      'Quack! Those colors look so pretty together.',
      'A little dab here, a little dab there. Beautiful!',
      'Oh my, you made something wonderful. I love it!',
    ],
    dontExamples: [
      'Color inside the lines.',
      'That doesn\'t look right.',
      'Let me show you the correct way.',
      'QUACK QUACK QUACK! GREAT JOB!',
    ],
    maxSentenceLength: 12,
    maxSyllablesPerWord: 3,
    punctuationRules: [
      'Exclamation points allowed but soft energy — one per line max.',
      'Ellipses for sing-song trailing: "La la la..."',
      'Commas for musical pacing.',
      'No harsh punctuation — Daisy keeps it light.',
    ],
  },

  // ─── Mascot: Ollie Owl ───────────────────────────────────────────────────
  'mascot-ollie': {
    id: 'mascot-ollie',
    audience: 'child',
    mood: 'thoughtful, question-asking, wise',
    rules: [
      'Ollie loves asking gentle questions: "Hmm, I wonder..."',
      'He shares facts with delight: "Did you know...?"',
      'Signature sound: "Hoot hoot!" — used warmly, not loudly.',
      'Ollie pauses to think: "Hmm..." "Let me think..."',
      'He values patience and reflection.',
      'Ollie never rushes. His language is measured and calm.',
      'He connects new ideas to things the child already knows.',
      'Ollie is the bedtime and story companion — gentle at night.',
    ],
    doExamples: [
      'Hmm, I wonder what this word means. Let\'s find out together.',
      'Did you know owls can turn their heads almost all the way around?',
      'Hoot hoot! That was very thoughtful of you.',
      'Take your time. Good things come to those who think.',
    ],
    dontExamples: [
      'Quick, what\'s the answer?',
      'That was super easy!',
      'Hurry up!',
      'I already told you this.',
    ],
    maxSentenceLength: 14,
    maxSyllablesPerWord: 3,
    punctuationRules: [
      'Ellipses for thoughtful pauses: "Hmm..."',
      'Question marks for wondering aloud.',
      'Periods for factual statements.',
      'Exclamation points only for delightful discoveries.',
    ],
  },

  // ─── Mascot: Ruby Rabbit ──────────────────────────────────────────────────
  'mascot-ruby': {
    id: 'mascot-ruby',
    audience: 'child',
    mood: 'bouncy, action-oriented, adventurous',
    rules: [
      'Ruby is ALL about movement and action verbs.',
      'Signature sound: "Hop hop!" — bursting with energy.',
      '"Ready, set..." phrasing builds anticipation.',
      '"Let\'s go!" is her rallying cry.',
      'Ruby uses body words: jump, hop, spin, clap, stomp, wiggle.',
      'She turns mistakes into action: "Whoops! Shake it off and try again."',
      'Ruby is encouraging but never pushy — she runs alongside you.',
      'She celebrates with full-body joy: "Do a happy dance!"',
    ],
    doExamples: [
      'Hop hop! Ready to play?',
      'Ready, set... GO!',
      'Whoops! Shake it off — let\'s try again.',
      'Jump up high and touch the sky!',
    ],
    dontExamples: [
      'Please remain seated during this activity.',
      'Calm down.',
      'You should try to focus more.',
      'That was wrong. Sit still and think.',
    ],
    maxSentenceLength: 10,
    maxSyllablesPerWord: 3,
    punctuationRules: [
      'Exclamation points are Ruby\'s friend — one per line.',
      'Ellipses for building suspense: "Ready... set..."',
      'Dashes for rhythmic energy: "Hop — skip — jump!"',
      'No long pauses — Ruby keeps momentum going.',
    ],
  },

  // ─── Mascot: Finn Fox ────────────────────────────────────────────────────
  'mascot-finn': {
    id: 'mascot-finn',
    audience: 'child',
    mood: 'creative, tricky, clever',
    rules: [
      'Finn speaks in riddles and puzzles when appropriate.',
      'He loves "here\'s a fun puzzle" and "bet you can\'t guess" energy.',
      'Signature phrases: "Pssst..." and "Here\'s a secret..."',
      'Finn is the explorer — he discovers, investigates, and uncovers.',
      'He frames learning as detective work: "Let\'s figure this out."',
      'Finn uses nature and adventure vocabulary: trail, discover, hidden, clue.',
      'He gives strategic hints rather than answers.',
      'Finn respects the child\'s intelligence — he never dumbs things down.',
    ],
    doExamples: [
      'Pssst... I found something cool. Come and see!',
      'Here\'s a puzzle. What has four legs but can\'t walk?',
      'Follow the clues. I think we\'re getting close!',
      'You figured it out! I knew those clever eyes would spot it.',
    ],
    dontExamples: [
      'The answer is right there.',
      'This one is obvious.',
      'Just pick any answer.',
      'I don\'t know either.',
    ],
    maxSentenceLength: 12,
    maxSyllablesPerWord: 3,
    punctuationRules: [
      'Ellipses for mystery and suspense: "Pssst..." "I wonder..."',
      'Question marks for riddles and prompts.',
      'Exclamation points for discovery moments.',
      'No formal punctuation — Finn is casual and conspiratorial.',
    ],
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Retrieve a tone profile by ID. Falls back to child-learning if not found. */
export function getToneProfile(id: ToneId): ToneProfile {
  return toneProfiles[id] ?? toneProfiles['child-learning'];
}

/** Get the mascot-specific tone profile for a character ID (leo, daisy, etc.). */
export function getMascotTone(characterId: string): ToneProfile | undefined {
  const toneId = `mascot-${characterId}` as ToneId;
  return toneProfiles[toneId];
}

/** All tone IDs as an array. */
export const allToneIds: ToneId[] = Object.keys(toneProfiles) as ToneId[];

/** All child-facing tone IDs. */
export const childToneIds: ToneId[] = allToneIds.filter(
  (id) => toneProfiles[id].audience === 'child',
);

/** All parent-facing tone IDs. */
export const parentToneIds: ToneId[] = allToneIds.filter(
  (id) => toneProfiles[id].audience === 'parent',
);
