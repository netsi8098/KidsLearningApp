// ── Phrase Bank ─────────────────────────────────────────────────────────────
// 220+ premium, hand-crafted phrases for every interaction context in
// Kids Learning Fun. Every phrase is written to the quality bar of a
// top-tier children's media product.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────

export type PhraseCat =
  | 'praise-effort'
  | 'praise-result'
  | 'encouragement'
  | 'gentle-correction'
  | 'lesson-intro'
  | 'activity-instruction'
  | 'reward-moment'
  | 'empty-state'
  | 'error-message'
  | 'search-no-results'
  | 'bedtime-transition'
  | 'pause-screen'
  | 'greeting-morning'
  | 'greeting-returning'
  | 'goodbye'
  | 'curiosity-prompt'
  | 'transition'
  | 'parent-insight';

export type AgeGroup = '2-3' | '4-5' | '6-8' | 'all';

export interface PhraseEntry {
  id: string;
  text: string;
  category: PhraseCat;
  ageGroup: AgeGroup;
  mood: string;
  characterId?: string;
  variationGroup?: string;
}

// ── Phrase Definitions ──────────────────────────────────────────────────────

export const phrases: PhraseEntry[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // PRAISE - EFFORT (15)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'pe-01',
    text: 'You worked so hard on that!',
    category: 'praise-effort',
    ageGroup: 'all',
    mood: 'warm',
    variationGroup: 'effort-general',
  },
  {
    id: 'pe-02',
    text: 'Look at you trying new things!',
    category: 'praise-effort',
    ageGroup: 'all',
    mood: 'proud',
    variationGroup: 'effort-general',
  },
  {
    id: 'pe-03',
    text: "You didn't give up, and that's amazing.",
    category: 'praise-effort',
    ageGroup: '4-5',
    mood: 'proud',
    variationGroup: 'effort-persistence',
  },
  {
    id: 'pe-04',
    text: 'You kept going even when it was tricky.',
    category: 'praise-effort',
    ageGroup: '4-5',
    mood: 'encouraging',
    variationGroup: 'effort-persistence',
  },
  {
    id: 'pe-05',
    text: 'That took real focus. Well done!',
    category: 'praise-effort',
    ageGroup: '6-8',
    mood: 'proud',
    variationGroup: 'effort-focus',
  },
  {
    id: 'pe-06',
    text: 'I can see you really thought about that one.',
    category: 'praise-effort',
    ageGroup: '6-8',
    mood: 'warm',
    variationGroup: 'effort-focus',
  },
  {
    id: 'pe-07',
    text: 'You tried so hard! I love that.',
    category: 'praise-effort',
    ageGroup: '2-3',
    mood: 'warm',
    variationGroup: 'effort-general',
  },
  {
    id: 'pe-08',
    text: 'Trying is the bravest thing you can do.',
    category: 'praise-effort',
    ageGroup: 'all',
    mood: 'encouraging',
    characterId: 'leo',
    variationGroup: 'effort-bravery',
  },
  {
    id: 'pe-09',
    text: 'Every try teaches you something new.',
    category: 'praise-effort',
    ageGroup: '6-8',
    mood: 'wise',
    characterId: 'ollie',
    variationGroup: 'effort-learning',
  },
  {
    id: 'pe-10',
    text: 'You gave it your very best. That matters most.',
    category: 'praise-effort',
    ageGroup: '4-5',
    mood: 'proud',
    variationGroup: 'effort-general',
  },
  {
    id: 'pe-11',
    text: 'Look at how brave you are for trying!',
    category: 'praise-effort',
    ageGroup: '2-3',
    mood: 'encouraging',
    characterId: 'leo',
    variationGroup: 'effort-bravery',
  },
  {
    id: 'pe-12',
    text: 'You stuck with it and I am so proud of you.',
    category: 'praise-effort',
    ageGroup: 'all',
    mood: 'proud',
    variationGroup: 'effort-persistence',
  },
  {
    id: 'pe-13',
    text: 'Even the tricky ones can not stop you!',
    category: 'praise-effort',
    ageGroup: '4-5',
    mood: 'playful',
    characterId: 'ruby',
    variationGroup: 'effort-persistence',
  },
  {
    id: 'pe-14',
    text: 'Your brain is growing stronger with every try.',
    category: 'praise-effort',
    ageGroup: '6-8',
    mood: 'wise',
    characterId: 'ollie',
    variationGroup: 'effort-learning',
  },
  {
    id: 'pe-15',
    text: 'That was hard and you did it anyway. Wow!',
    category: 'praise-effort',
    ageGroup: 'all',
    mood: 'proud',
    variationGroup: 'effort-persistence',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRAISE - RESULT (15)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'pr-01',
    text: 'You got it!',
    category: 'praise-result',
    ageGroup: 'all',
    mood: 'excited',
    variationGroup: 'result-correct',
  },
  {
    id: 'pr-02',
    text: "That's exactly right!",
    category: 'praise-result',
    ageGroup: 'all',
    mood: 'warm',
    variationGroup: 'result-correct',
  },
  {
    id: 'pr-03',
    text: 'All the stars for you!',
    category: 'praise-result',
    ageGroup: '2-3',
    mood: 'celebratory',
    variationGroup: 'result-celebration',
  },
  {
    id: 'pr-04',
    text: 'You matched every single one. Perfect!',
    category: 'praise-result',
    ageGroup: '4-5',
    mood: 'proud',
    variationGroup: 'result-perfect',
  },
  {
    id: 'pr-05',
    text: 'Nailed it! Not a single mistake.',
    category: 'praise-result',
    ageGroup: '6-8',
    mood: 'impressed',
    variationGroup: 'result-perfect',
  },
  {
    id: 'pr-06',
    text: 'Yes! You remembered!',
    category: 'praise-result',
    ageGroup: 'all',
    mood: 'excited',
    variationGroup: 'result-memory',
  },
  {
    id: 'pr-07',
    text: 'Look at that! You knew the answer right away.',
    category: 'praise-result',
    ageGroup: '4-5',
    mood: 'impressed',
    variationGroup: 'result-quick',
  },
  {
    id: 'pr-08',
    text: 'You found it! Sharp eyes.',
    category: 'praise-result',
    ageGroup: 'all',
    mood: 'warm',
    characterId: 'finn',
    variationGroup: 'result-discovery',
  },
  {
    id: 'pr-09',
    text: 'That is one hundred percent correct.',
    category: 'praise-result',
    ageGroup: '6-8',
    mood: 'proud',
    variationGroup: 'result-correct',
  },
  {
    id: 'pr-10',
    text: 'You are really getting the hang of this!',
    category: 'praise-result',
    ageGroup: '4-5',
    mood: 'encouraging',
    variationGroup: 'result-progress',
  },
  {
    id: 'pr-11',
    text: 'Wow, you did that all by yourself!',
    category: 'praise-result',
    ageGroup: '2-3',
    mood: 'proud',
    variationGroup: 'result-independence',
  },
  {
    id: 'pr-12',
    text: 'Your answer is spot on. Brilliant!',
    category: 'praise-result',
    ageGroup: '6-8',
    mood: 'impressed',
    variationGroup: 'result-correct',
  },
  {
    id: 'pr-13',
    text: 'ROAR! That was so good!',
    category: 'praise-result',
    ageGroup: 'all',
    mood: 'celebratory',
    characterId: 'leo',
    variationGroup: 'result-celebration',
  },
  {
    id: 'pr-14',
    text: 'You solved the puzzle! What a detective.',
    category: 'praise-result',
    ageGroup: '4-5',
    mood: 'impressed',
    characterId: 'finn',
    variationGroup: 'result-discovery',
  },
  {
    id: 'pr-15',
    text: 'Every answer, right on the nose. Amazing!',
    category: 'praise-result',
    ageGroup: '6-8',
    mood: 'proud',
    variationGroup: 'result-perfect',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENCOURAGEMENT (15)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'en-01',
    text: 'You can do it!',
    category: 'encouragement',
    ageGroup: 'all',
    mood: 'encouraging',
    variationGroup: 'encourage-general',
  },
  {
    id: 'en-02',
    text: 'Almost there! Keep going.',
    category: 'encouragement',
    ageGroup: 'all',
    mood: 'encouraging',
    variationGroup: 'encourage-close',
  },
  {
    id: 'en-03',
    text: 'One more try. I believe in you!',
    category: 'encouragement',
    ageGroup: 'all',
    mood: 'warm',
    characterId: 'leo',
    variationGroup: 'encourage-retry',
  },
  {
    id: 'en-04',
    text: 'Take your time. There is no rush.',
    category: 'encouragement',
    ageGroup: 'all',
    mood: 'calm',
    characterId: 'ollie',
    variationGroup: 'encourage-patience',
  },
  {
    id: 'en-05',
    text: 'You are so close! Just a little more.',
    category: 'encouragement',
    ageGroup: '4-5',
    mood: 'encouraging',
    variationGroup: 'encourage-close',
  },
  {
    id: 'en-06',
    text: 'Every great learner started right where you are.',
    category: 'encouragement',
    ageGroup: '6-8',
    mood: 'wise',
    characterId: 'ollie',
    variationGroup: 'encourage-perspective',
  },
  {
    id: 'en-07',
    text: 'Let us try together. Ready?',
    category: 'encouragement',
    ageGroup: '2-3',
    mood: 'supportive',
    characterId: 'leo',
    variationGroup: 'encourage-together',
  },
  {
    id: 'en-08',
    text: 'Hop back up! You have got this.',
    category: 'encouragement',
    ageGroup: '4-5',
    mood: 'energetic',
    characterId: 'ruby',
    variationGroup: 'encourage-retry',
  },
  {
    id: 'en-09',
    text: 'I know you can figure this out.',
    category: 'encouragement',
    ageGroup: '6-8',
    mood: 'trusting',
    characterId: 'finn',
    variationGroup: 'encourage-challenge',
  },
  {
    id: 'en-10',
    text: 'Look how far you have come already!',
    category: 'encouragement',
    ageGroup: 'all',
    mood: 'proud',
    variationGroup: 'encourage-progress',
  },
  {
    id: 'en-11',
    text: 'You are braver than you think.',
    category: 'encouragement',
    ageGroup: '4-5',
    mood: 'warm',
    characterId: 'leo',
    variationGroup: 'encourage-bravery',
  },
  {
    id: 'en-12',
    text: 'Give it another go. Something tells me you will get it this time.',
    category: 'encouragement',
    ageGroup: '6-8',
    mood: 'clever',
    characterId: 'finn',
    variationGroup: 'encourage-retry',
  },
  {
    id: 'en-13',
    text: 'Deep breath. You are doing great.',
    category: 'encouragement',
    ageGroup: 'all',
    mood: 'calm',
    variationGroup: 'encourage-calm',
  },
  {
    id: 'en-14',
    text: 'La la la, you are on your way!',
    category: 'encouragement',
    ageGroup: '2-3',
    mood: 'musical',
    characterId: 'daisy',
    variationGroup: 'encourage-general',
  },
  {
    id: 'en-15',
    text: 'Mistakes help us learn. Let us try once more.',
    category: 'encouragement',
    ageGroup: '6-8',
    mood: 'wise',
    characterId: 'ollie',
    variationGroup: 'encourage-retry',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GENTLE CORRECTION (15)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'gc-01',
    text: "Not quite. Let's look again!",
    category: 'gentle-correction',
    ageGroup: 'all',
    mood: 'gentle',
    variationGroup: 'correction-retry',
  },
  {
    id: 'gc-02',
    text: "Hmm, that's a great guess! Try the other one.",
    category: 'gentle-correction',
    ageGroup: '4-5',
    mood: 'warm',
    variationGroup: 'correction-redirect',
  },
  {
    id: 'gc-03',
    text: 'So close! Give it one more try.',
    category: 'gentle-correction',
    ageGroup: 'all',
    mood: 'encouraging',
    variationGroup: 'correction-close',
  },
  {
    id: 'gc-04',
    text: 'Oops! That is not the one. But you are learning!',
    category: 'gentle-correction',
    ageGroup: '2-3',
    mood: 'playful',
    variationGroup: 'correction-playful',
  },
  {
    id: 'gc-05',
    text: 'Almost! Look carefully and try again.',
    category: 'gentle-correction',
    ageGroup: '4-5',
    mood: 'calm',
    variationGroup: 'correction-observe',
  },
  {
    id: 'gc-06',
    text: 'Hmm, not that one. Shall we think about it together?',
    category: 'gentle-correction',
    ageGroup: '4-5',
    mood: 'supportive',
    characterId: 'leo',
    variationGroup: 'correction-together',
  },
  {
    id: 'gc-07',
    text: 'Good thinking! But the answer is a little different.',
    category: 'gentle-correction',
    ageGroup: '6-8',
    mood: 'respectful',
    variationGroup: 'correction-redirect',
  },
  {
    id: 'gc-08',
    text: 'Whoops! Shake it off and try again.',
    category: 'gentle-correction',
    ageGroup: 'all',
    mood: 'energetic',
    characterId: 'ruby',
    variationGroup: 'correction-playful',
  },
  {
    id: 'gc-09',
    text: 'I wonder... is there another answer that fits better?',
    category: 'gentle-correction',
    ageGroup: '6-8',
    mood: 'curious',
    characterId: 'ollie',
    variationGroup: 'correction-guide',
  },
  {
    id: 'gc-10',
    text: 'Not quite, but what a good try! Let us look closer.',
    category: 'gentle-correction',
    ageGroup: '4-5',
    mood: 'warm',
    variationGroup: 'correction-observe',
  },
  {
    id: 'gc-11',
    text: 'Hmm, that was close. Here is a little clue...',
    category: 'gentle-correction',
    ageGroup: '6-8',
    mood: 'clever',
    characterId: 'finn',
    variationGroup: 'correction-hint',
  },
  {
    id: 'gc-12',
    text: 'Oopsie! Try again, you will get it.',
    category: 'gentle-correction',
    ageGroup: '2-3',
    mood: 'gentle',
    variationGroup: 'correction-retry',
  },
  {
    id: 'gc-13',
    text: 'That is a smart guess. The right answer is just next door.',
    category: 'gentle-correction',
    ageGroup: '6-8',
    mood: 'encouraging',
    variationGroup: 'correction-close',
  },
  {
    id: 'gc-14',
    text: 'Let us listen one more time. You almost had it!',
    category: 'gentle-correction',
    ageGroup: '4-5',
    mood: 'patient',
    variationGroup: 'correction-retry',
  },
  {
    id: 'gc-15',
    text: 'Not yet, but you are getting warmer!',
    category: 'gentle-correction',
    ageGroup: 'all',
    mood: 'playful',
    variationGroup: 'correction-close',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LESSON INTRO (12)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'li-01',
    text: 'Today we are going to learn about {topic}.',
    category: 'lesson-intro',
    ageGroup: 'all',
    mood: 'friendly',
    variationGroup: 'intro-topic',
  },
  {
    id: 'li-02',
    text: 'Ready to discover something new?',
    category: 'lesson-intro',
    ageGroup: 'all',
    mood: 'curious',
    variationGroup: 'intro-invitation',
  },
  {
    id: 'li-03',
    text: 'Let us explore {topic} together!',
    category: 'lesson-intro',
    ageGroup: '2-3',
    mood: 'warm',
    characterId: 'leo',
    variationGroup: 'intro-topic',
  },
  {
    id: 'li-04',
    text: 'Did you know there is so much to learn about {topic}?',
    category: 'lesson-intro',
    ageGroup: '6-8',
    mood: 'curious',
    characterId: 'ollie',
    variationGroup: 'intro-topic',
  },
  {
    id: 'li-05',
    text: 'Pssst... I found something fun about {topic}. Come and see!',
    category: 'lesson-intro',
    ageGroup: '4-5',
    mood: 'adventurous',
    characterId: 'finn',
    variationGroup: 'intro-topic',
  },
  {
    id: 'li-06',
    text: 'Get your thinking cap on. Here we go!',
    category: 'lesson-intro',
    ageGroup: '4-5',
    mood: 'playful',
    variationGroup: 'intro-invitation',
  },
  {
    id: 'li-07',
    text: 'Something wonderful is waiting for you.',
    category: 'lesson-intro',
    ageGroup: 'all',
    mood: 'warm',
    variationGroup: 'intro-invitation',
  },
  {
    id: 'li-08',
    text: 'Here comes a brand new adventure!',
    category: 'lesson-intro',
    ageGroup: '2-3',
    mood: 'excited',
    variationGroup: 'intro-invitation',
  },
  {
    id: 'li-09',
    text: 'You are about to learn something really cool.',
    category: 'lesson-intro',
    ageGroup: '6-8',
    mood: 'confident',
    variationGroup: 'intro-invitation',
  },
  {
    id: 'li-10',
    text: 'La la la, time to learn about {topic}!',
    category: 'lesson-intro',
    ageGroup: '2-3',
    mood: 'musical',
    characterId: 'daisy',
    variationGroup: 'intro-topic',
  },
  {
    id: 'li-11',
    text: 'I have been so excited to show you this!',
    category: 'lesson-intro',
    ageGroup: '4-5',
    mood: 'warm',
    characterId: 'leo',
    variationGroup: 'intro-invitation',
  },
  {
    id: 'li-12',
    text: 'Ready, set, learn!',
    category: 'lesson-intro',
    ageGroup: 'all',
    mood: 'energetic',
    characterId: 'ruby',
    variationGroup: 'intro-invitation',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVITY INSTRUCTION (12)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'ai-01',
    text: 'Tap the right answer!',
    category: 'activity-instruction',
    ageGroup: 'all',
    mood: 'clear',
    variationGroup: 'instruction-tap',
  },
  {
    id: 'ai-02',
    text: 'Drag the picture to match!',
    category: 'activity-instruction',
    ageGroup: '4-5',
    mood: 'clear',
    variationGroup: 'instruction-drag',
  },
  {
    id: 'ai-03',
    text: 'Listen and repeat!',
    category: 'activity-instruction',
    ageGroup: '2-3',
    mood: 'friendly',
    variationGroup: 'instruction-listen',
  },
  {
    id: 'ai-04',
    text: 'Find the one that matches.',
    category: 'activity-instruction',
    ageGroup: 'all',
    mood: 'calm',
    variationGroup: 'instruction-match',
  },
  {
    id: 'ai-05',
    text: 'Can you point to the {item}?',
    category: 'activity-instruction',
    ageGroup: '2-3',
    mood: 'inviting',
    variationGroup: 'instruction-point',
  },
  {
    id: 'ai-06',
    text: 'Look at the picture. What do you see?',
    category: 'activity-instruction',
    ageGroup: '4-5',
    mood: 'curious',
    variationGroup: 'instruction-observe',
  },
  {
    id: 'ai-07',
    text: 'Put the pieces in the right order.',
    category: 'activity-instruction',
    ageGroup: '6-8',
    mood: 'clear',
    variationGroup: 'instruction-sequence',
  },
  {
    id: 'ai-08',
    text: 'Tap each one to hear how it sounds.',
    category: 'activity-instruction',
    ageGroup: 'all',
    mood: 'inviting',
    variationGroup: 'instruction-listen',
  },
  {
    id: 'ai-09',
    text: 'Trace the shape with your finger.',
    category: 'activity-instruction',
    ageGroup: '2-3',
    mood: 'gentle',
    variationGroup: 'instruction-trace',
  },
  {
    id: 'ai-10',
    text: 'Choose the one that does not belong.',
    category: 'activity-instruction',
    ageGroup: '6-8',
    mood: 'challenging',
    variationGroup: 'instruction-choose',
  },
  {
    id: 'ai-11',
    text: 'Say it out loud! What letter is this?',
    category: 'activity-instruction',
    ageGroup: '4-5',
    mood: 'energetic',
    variationGroup: 'instruction-speak',
  },
  {
    id: 'ai-12',
    text: 'Count along with me. Ready?',
    category: 'activity-instruction',
    ageGroup: '2-3',
    mood: 'warm',
    characterId: 'leo',
    variationGroup: 'instruction-count',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // REWARD MOMENT (12)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'rm-01',
    text: 'You earned a star!',
    category: 'reward-moment',
    ageGroup: 'all',
    mood: 'celebratory',
    variationGroup: 'reward-star',
  },
  {
    id: 'rm-02',
    text: 'Look at that shiny new badge!',
    category: 'reward-moment',
    ageGroup: 'all',
    mood: 'proud',
    variationGroup: 'reward-badge',
  },
  {
    id: 'rm-03',
    text: 'You are on a roll! Three in a row.',
    category: 'reward-moment',
    ageGroup: '4-5',
    mood: 'excited',
    variationGroup: 'reward-streak',
  },
  {
    id: 'rm-04',
    text: 'Superstar! Your collection is growing.',
    category: 'reward-moment',
    ageGroup: 'all',
    mood: 'warm',
    variationGroup: 'reward-collection',
  },
  {
    id: 'rm-05',
    text: 'You finished the whole lesson. Incredible!',
    category: 'reward-moment',
    ageGroup: '4-5',
    mood: 'proud',
    variationGroup: 'reward-completion',
  },
  {
    id: 'rm-06',
    text: 'Hop hop hooray! You did it!',
    category: 'reward-moment',
    ageGroup: 'all',
    mood: 'bouncy',
    characterId: 'ruby',
    variationGroup: 'reward-celebration',
  },
  {
    id: 'rm-07',
    text: 'ROAR! What a champion!',
    category: 'reward-moment',
    ageGroup: 'all',
    mood: 'powerful',
    characterId: 'leo',
    variationGroup: 'reward-celebration',
  },
  {
    id: 'rm-08',
    text: 'Five stars! You are really shining today.',
    category: 'reward-moment',
    ageGroup: '4-5',
    mood: 'warm',
    variationGroup: 'reward-star',
  },
  {
    id: 'rm-09',
    text: 'A new badge just for you. You earned every bit of it.',
    category: 'reward-moment',
    ageGroup: '6-8',
    mood: 'proud',
    variationGroup: 'reward-badge',
  },
  {
    id: 'rm-10',
    text: 'You unlocked something special!',
    category: 'reward-moment',
    ageGroup: '6-8',
    mood: 'exciting',
    variationGroup: 'reward-unlock',
  },
  {
    id: 'rm-11',
    text: 'What a beautiful day of learning. Here is your star!',
    category: 'reward-moment',
    ageGroup: 'all',
    mood: 'warm',
    characterId: 'daisy',
    variationGroup: 'reward-star',
  },
  {
    id: 'rm-12',
    text: 'Every badge tells a story. This one says you are amazing.',
    category: 'reward-moment',
    ageGroup: '6-8',
    mood: 'wise',
    characterId: 'ollie',
    variationGroup: 'reward-badge',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EMPTY STATE (10)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'es-01',
    text: "Nothing here yet. Let's explore!",
    category: 'empty-state',
    ageGroup: 'all',
    mood: 'inviting',
    variationGroup: 'empty-explore',
  },
  {
    id: 'es-02',
    text: 'Your adventure starts now!',
    category: 'empty-state',
    ageGroup: 'all',
    mood: 'exciting',
    variationGroup: 'empty-begin',
  },
  {
    id: 'es-03',
    text: 'Time to discover something fun!',
    category: 'empty-state',
    ageGroup: 'all',
    mood: 'playful',
    variationGroup: 'empty-discover',
  },
  {
    id: 'es-04',
    text: 'This is brand new! You get to be the first.',
    category: 'empty-state',
    ageGroup: '4-5',
    mood: 'special',
    variationGroup: 'empty-begin',
  },
  {
    id: 'es-05',
    text: 'An empty page is full of possibilities.',
    category: 'empty-state',
    ageGroup: '6-8',
    mood: 'wise',
    characterId: 'ollie',
    variationGroup: 'empty-creative',
  },
  {
    id: 'es-06',
    text: "You haven't tried this yet. Shall we start?",
    category: 'empty-state',
    ageGroup: 'all',
    mood: 'warm',
    characterId: 'leo',
    variationGroup: 'empty-begin',
  },
  {
    id: 'es-07',
    text: 'No favorites yet. Tap the heart on things you love!',
    category: 'empty-state',
    ageGroup: '4-5',
    mood: 'helpful',
    variationGroup: 'empty-favorites',
  },
  {
    id: 'es-08',
    text: 'Your scrapbook is waiting for its first page.',
    category: 'empty-state',
    ageGroup: '6-8',
    mood: 'creative',
    characterId: 'daisy',
    variationGroup: 'empty-creative',
  },
  {
    id: 'es-09',
    text: 'No badges yet. Go earn your first one!',
    category: 'empty-state',
    ageGroup: 'all',
    mood: 'motivating',
    characterId: 'ruby',
    variationGroup: 'empty-badges',
  },
  {
    id: 'es-10',
    text: 'What will you discover first? The choice is yours.',
    category: 'empty-state',
    ageGroup: '6-8',
    mood: 'adventurous',
    characterId: 'finn',
    variationGroup: 'empty-explore',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ERROR MESSAGE (10)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'er-01',
    text: "Oops! Something went a little sideways.",
    category: 'error-message',
    ageGroup: 'all',
    mood: 'gentle',
    variationGroup: 'error-general',
  },
  {
    id: 'er-02',
    text: "Let's try that again.",
    category: 'error-message',
    ageGroup: 'all',
    mood: 'calm',
    variationGroup: 'error-retry',
  },
  {
    id: 'er-03',
    text: "Hmm, that didn't work. One more try!",
    category: 'error-message',
    ageGroup: 'all',
    mood: 'encouraging',
    variationGroup: 'error-retry',
  },
  {
    id: 'er-04',
    text: "Something got a bit tangled. Let's fix it!",
    category: 'error-message',
    ageGroup: '4-5',
    mood: 'playful',
    variationGroup: 'error-general',
  },
  {
    id: 'er-05',
    text: "We hit a little bump. No worries, we'll sort it out.",
    category: 'error-message',
    ageGroup: 'all',
    mood: 'reassuring',
    variationGroup: 'error-general',
  },
  {
    id: 'er-06',
    text: 'Oops! That page took a wrong turn.',
    category: 'error-message',
    ageGroup: '4-5',
    mood: 'playful',
    variationGroup: 'error-navigation',
  },
  {
    id: 'er-07',
    text: 'This is not loading right now. Try coming back in a moment.',
    category: 'error-message',
    ageGroup: 'all',
    mood: 'calm',
    variationGroup: 'error-loading',
  },
  {
    id: 'er-08',
    text: "Uh oh! Let's go back and try a different way.",
    category: 'error-message',
    ageGroup: '2-3',
    mood: 'gentle',
    variationGroup: 'error-navigation',
  },
  {
    id: 'er-09',
    text: "Something is not working quite right. Let's start over.",
    category: 'error-message',
    ageGroup: '6-8',
    mood: 'practical',
    variationGroup: 'error-general',
  },
  {
    id: 'er-10',
    text: 'We could not save that. Would you like to try again?',
    category: 'error-message',
    ageGroup: '6-8',
    mood: 'clear',
    variationGroup: 'error-save',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SEARCH - NO RESULTS (8)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'sn-01',
    text: "We couldn't find that. Try different words!",
    category: 'search-no-results',
    ageGroup: 'all',
    mood: 'helpful',
    variationGroup: 'search-retry',
  },
  {
    id: 'sn-02',
    text: 'No matches yet. Want to try again?',
    category: 'search-no-results',
    ageGroup: 'all',
    mood: 'gentle',
    variationGroup: 'search-retry',
  },
  {
    id: 'sn-03',
    text: 'Hmm, nothing popped up. Try a shorter word.',
    category: 'search-no-results',
    ageGroup: '4-5',
    mood: 'helpful',
    variationGroup: 'search-hint',
  },
  {
    id: 'sn-04',
    text: "That's a tricky one! Let's try searching for something else.",
    category: 'search-no-results',
    ageGroup: '4-5',
    mood: 'playful',
    variationGroup: 'search-redirect',
  },
  {
    id: 'sn-05',
    text: 'Nothing here yet. Maybe try another word.',
    category: 'search-no-results',
    ageGroup: '6-8',
    mood: 'calm',
    variationGroup: 'search-retry',
  },
  {
    id: 'sn-06',
    text: 'I looked everywhere but could not find it!',
    category: 'search-no-results',
    ageGroup: '2-3',
    mood: 'gentle',
    characterId: 'finn',
    variationGroup: 'search-retry',
  },
  {
    id: 'sn-07',
    text: 'No results. Check the spelling and try once more.',
    category: 'search-no-results',
    ageGroup: '6-8',
    mood: 'practical',
    variationGroup: 'search-hint',
  },
  {
    id: 'sn-08',
    text: 'Sometimes the best discoveries come from trying a new search.',
    category: 'search-no-results',
    ageGroup: '6-8',
    mood: 'wise',
    characterId: 'ollie',
    variationGroup: 'search-redirect',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BEDTIME TRANSITION (10)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'bt-01',
    text: 'Time to wind down...',
    category: 'bedtime-transition',
    ageGroup: 'all',
    mood: 'gentle',
    variationGroup: 'bedtime-begin',
  },
  {
    id: 'bt-02',
    text: 'The stars are coming out, one by one.',
    category: 'bedtime-transition',
    ageGroup: 'all',
    mood: 'lyrical',
    variationGroup: 'bedtime-nature',
  },
  {
    id: 'bt-03',
    text: "Let's get cozy.",
    category: 'bedtime-transition',
    ageGroup: '2-3',
    mood: 'warm',
    variationGroup: 'bedtime-begin',
  },
  {
    id: 'bt-04',
    text: 'The moon is rising, soft and silver.',
    category: 'bedtime-transition',
    ageGroup: 'all',
    mood: 'lyrical',
    variationGroup: 'bedtime-nature',
  },
  {
    id: 'bt-05',
    text: 'Everything is quiet now. Even the birds are asleep.',
    category: 'bedtime-transition',
    ageGroup: '4-5',
    mood: 'soothing',
    characterId: 'ollie',
    variationGroup: 'bedtime-nature',
  },
  {
    id: 'bt-06',
    text: 'Close your eyes. Take a slow, deep breath.',
    category: 'bedtime-transition',
    ageGroup: 'all',
    mood: 'calming',
    variationGroup: 'bedtime-breathing',
  },
  {
    id: 'bt-07',
    text: 'You had such a wonderful day. Time to rest now.',
    category: 'bedtime-transition',
    ageGroup: 'all',
    mood: 'warm',
    variationGroup: 'bedtime-reflection',
  },
  {
    id: 'bt-08',
    text: 'Shhh... the night is whispering goodnight.',
    category: 'bedtime-transition',
    ageGroup: '4-5',
    mood: 'lyrical',
    variationGroup: 'bedtime-nature',
  },
  {
    id: 'bt-09',
    text: 'The clouds are soft like pillows in the sky.',
    category: 'bedtime-transition',
    ageGroup: '2-3',
    mood: 'gentle',
    variationGroup: 'bedtime-imagery',
  },
  {
    id: 'bt-10',
    text: 'Tomorrow is a brand new day full of wonder. For now, rest.',
    category: 'bedtime-transition',
    ageGroup: '6-8',
    mood: 'wise',
    characterId: 'ollie',
    variationGroup: 'bedtime-reflection',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PAUSE SCREEN (8)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'ps-01',
    text: 'Take a break! You earned it.',
    category: 'pause-screen',
    ageGroup: 'all',
    mood: 'warm',
    variationGroup: 'pause-earned',
  },
  {
    id: 'ps-02',
    text: 'Stretch time! Reach for the sky.',
    category: 'pause-screen',
    ageGroup: 'all',
    mood: 'energetic',
    characterId: 'ruby',
    variationGroup: 'pause-movement',
  },
  {
    id: 'ps-03',
    text: "We'll be right here when you come back.",
    category: 'pause-screen',
    ageGroup: 'all',
    mood: 'reassuring',
    variationGroup: 'pause-return',
  },
  {
    id: 'ps-04',
    text: 'Time for a brain break! Go get some water.',
    category: 'pause-screen',
    ageGroup: '4-5',
    mood: 'caring',
    variationGroup: 'pause-health',
  },
  {
    id: 'ps-05',
    text: 'Rest those clever eyes for a little while.',
    category: 'pause-screen',
    ageGroup: '6-8',
    mood: 'gentle',
    characterId: 'ollie',
    variationGroup: 'pause-health',
  },
  {
    id: 'ps-06',
    text: 'Wiggle your fingers. Wiggle your toes. Feel better?',
    category: 'pause-screen',
    ageGroup: '2-3',
    mood: 'playful',
    variationGroup: 'pause-movement',
  },
  {
    id: 'ps-07',
    text: 'Good learners take good breaks. See you soon!',
    category: 'pause-screen',
    ageGroup: '6-8',
    mood: 'wise',
    variationGroup: 'pause-wisdom',
  },
  {
    id: 'ps-08',
    text: 'Paused! Come back whenever you are ready.',
    category: 'pause-screen',
    ageGroup: 'all',
    mood: 'calm',
    variationGroup: 'pause-return',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GREETING - MORNING (8)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'gm-01',
    text: 'Good morning, sunshine!',
    category: 'greeting-morning',
    ageGroup: 'all',
    mood: 'warm',
    variationGroup: 'morning-general',
  },
  {
    id: 'gm-02',
    text: 'A brand new day to learn!',
    category: 'greeting-morning',
    ageGroup: 'all',
    mood: 'bright',
    variationGroup: 'morning-learning',
  },
  {
    id: 'gm-03',
    text: 'Rise and shine! What shall we do today?',
    category: 'greeting-morning',
    ageGroup: 'all',
    mood: 'energetic',
    variationGroup: 'morning-general',
  },
  {
    id: 'gm-04',
    text: 'The sun is up and so are you!',
    category: 'greeting-morning',
    ageGroup: '2-3',
    mood: 'bright',
    variationGroup: 'morning-general',
  },
  {
    id: 'gm-05',
    text: 'Good morning! I have been waiting to see you.',
    category: 'greeting-morning',
    ageGroup: '4-5',
    mood: 'warm',
    characterId: 'leo',
    variationGroup: 'morning-personal',
  },
  {
    id: 'gm-06',
    text: 'Hop hop! Morning time is the best time!',
    category: 'greeting-morning',
    ageGroup: 'all',
    mood: 'bouncy',
    characterId: 'ruby',
    variationGroup: 'morning-general',
  },
  {
    id: 'gm-07',
    text: 'Hoot hoot! A wise start to a wonderful day.',
    category: 'greeting-morning',
    ageGroup: '4-5',
    mood: 'calm',
    characterId: 'ollie',
    variationGroup: 'morning-general',
  },
  {
    id: 'gm-08',
    text: 'Good morning, explorer! Ready for today?',
    category: 'greeting-morning',
    ageGroup: '6-8',
    mood: 'adventurous',
    characterId: 'finn',
    variationGroup: 'morning-personal',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GREETING - RETURNING (8)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'gr-01',
    text: 'Welcome back!',
    category: 'greeting-returning',
    ageGroup: 'all',
    mood: 'warm',
    variationGroup: 'return-simple',
  },
  {
    id: 'gr-02',
    text: 'We missed you!',
    category: 'greeting-returning',
    ageGroup: 'all',
    mood: 'warm',
    variationGroup: 'return-missed',
  },
  {
    id: 'gr-03',
    text: 'Ready for more fun?',
    category: 'greeting-returning',
    ageGroup: 'all',
    mood: 'playful',
    variationGroup: 'return-action',
  },
  {
    id: 'gr-04',
    text: 'Hey, you came back! I am so happy to see you.',
    category: 'greeting-returning',
    ageGroup: '2-3',
    mood: 'warm',
    characterId: 'leo',
    variationGroup: 'return-missed',
  },
  {
    id: 'gr-05',
    text: 'Welcome back, friend! Where did we leave off?',
    category: 'greeting-returning',
    ageGroup: '4-5',
    mood: 'friendly',
    variationGroup: 'return-continue',
  },
  {
    id: 'gr-06',
    text: 'You are back! I saved your spot.',
    category: 'greeting-returning',
    ageGroup: '6-8',
    mood: 'helpful',
    variationGroup: 'return-continue',
  },
  {
    id: 'gr-07',
    text: 'Yay, you are here! Let us pick up right where we stopped.',
    category: 'greeting-returning',
    ageGroup: '4-5',
    mood: 'excited',
    characterId: 'ruby',
    variationGroup: 'return-continue',
  },
  {
    id: 'gr-08',
    text: 'I have been thinking about you! Come, I have something to show you.',
    category: 'greeting-returning',
    ageGroup: '6-8',
    mood: 'adventurous',
    characterId: 'finn',
    variationGroup: 'return-discovery',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GOODBYE (8)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'gb-01',
    text: 'See you next time!',
    category: 'goodbye',
    ageGroup: 'all',
    mood: 'warm',
    variationGroup: 'bye-simple',
  },
  {
    id: 'gb-02',
    text: 'Sweet dreams!',
    category: 'goodbye',
    ageGroup: 'all',
    mood: 'gentle',
    variationGroup: 'bye-night',
  },
  {
    id: 'gb-03',
    text: 'What a great day of learning!',
    category: 'goodbye',
    ageGroup: 'all',
    mood: 'proud',
    variationGroup: 'bye-proud',
  },
  {
    id: 'gb-04',
    text: 'Bye for now! I will be right here waiting.',
    category: 'goodbye',
    ageGroup: '2-3',
    mood: 'reassuring',
    characterId: 'leo',
    variationGroup: 'bye-reassuring',
  },
  {
    id: 'gb-05',
    text: 'You did amazing things today. See you soon!',
    category: 'goodbye',
    ageGroup: '4-5',
    mood: 'proud',
    variationGroup: 'bye-proud',
  },
  {
    id: 'gb-06',
    text: 'Until next time, little explorer!',
    category: 'goodbye',
    ageGroup: 'all',
    mood: 'adventurous',
    characterId: 'finn',
    variationGroup: 'bye-simple',
  },
  {
    id: 'gb-07',
    text: 'La la la, what a lovely day we had! Bye bye!',
    category: 'goodbye',
    ageGroup: '2-3',
    mood: 'musical',
    characterId: 'daisy',
    variationGroup: 'bye-simple',
  },
  {
    id: 'gb-08',
    text: 'Rest up. Tomorrow we go even further!',
    category: 'goodbye',
    ageGroup: '6-8',
    mood: 'motivating',
    characterId: 'ruby',
    variationGroup: 'bye-motivating',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CURIOSITY PROMPT (10)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'cp-01',
    text: 'I wonder what happens if...',
    category: 'curiosity-prompt',
    ageGroup: 'all',
    mood: 'curious',
    variationGroup: 'curiosity-wonder',
  },
  {
    id: 'cp-02',
    text: 'What do you think?',
    category: 'curiosity-prompt',
    ageGroup: 'all',
    mood: 'inviting',
    variationGroup: 'curiosity-opinion',
  },
  {
    id: 'cp-03',
    text: 'Can you guess?',
    category: 'curiosity-prompt',
    ageGroup: '2-3',
    mood: 'playful',
    variationGroup: 'curiosity-guess',
  },
  {
    id: 'cp-04',
    text: 'Here is something really interesting...',
    category: 'curiosity-prompt',
    ageGroup: '6-8',
    mood: 'intriguing',
    characterId: 'ollie',
    variationGroup: 'curiosity-fact',
  },
  {
    id: 'cp-05',
    text: 'Pssst... want to know a secret?',
    category: 'curiosity-prompt',
    ageGroup: '4-5',
    mood: 'conspiratorial',
    characterId: 'finn',
    variationGroup: 'curiosity-secret',
  },
  {
    id: 'cp-06',
    text: 'Hmm, I wonder why that happens. Do you know?',
    category: 'curiosity-prompt',
    ageGroup: '6-8',
    mood: 'thoughtful',
    characterId: 'ollie',
    variationGroup: 'curiosity-wonder',
  },
  {
    id: 'cp-07',
    text: 'Which one do you think it will be?',
    category: 'curiosity-prompt',
    ageGroup: 'all',
    mood: 'anticipation',
    variationGroup: 'curiosity-guess',
  },
  {
    id: 'cp-08',
    text: 'Have you ever noticed that...?',
    category: 'curiosity-prompt',
    ageGroup: '6-8',
    mood: 'observant',
    characterId: 'finn',
    variationGroup: 'curiosity-observe',
  },
  {
    id: 'cp-09',
    text: 'What would YOU choose?',
    category: 'curiosity-prompt',
    ageGroup: '4-5',
    mood: 'empowering',
    variationGroup: 'curiosity-opinion',
  },
  {
    id: 'cp-10',
    text: 'Look closely. Do you see something special?',
    category: 'curiosity-prompt',
    ageGroup: '4-5',
    mood: 'observant',
    variationGroup: 'curiosity-observe',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRANSITION (10)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'tr-01',
    text: 'Up next...',
    category: 'transition',
    ageGroup: 'all',
    mood: 'anticipation',
    variationGroup: 'transition-next',
  },
  {
    id: 'tr-02',
    text: "Let's move on to something new!",
    category: 'transition',
    ageGroup: 'all',
    mood: 'energetic',
    variationGroup: 'transition-new',
  },
  {
    id: 'tr-03',
    text: 'Here comes something fun!',
    category: 'transition',
    ageGroup: '2-3',
    mood: 'excited',
    variationGroup: 'transition-fun',
  },
  {
    id: 'tr-04',
    text: 'Great! Now let us try the next one.',
    category: 'transition',
    ageGroup: '4-5',
    mood: 'encouraging',
    variationGroup: 'transition-next',
  },
  {
    id: 'tr-05',
    text: 'You are on a roll. Keep going!',
    category: 'transition',
    ageGroup: 'all',
    mood: 'motivating',
    variationGroup: 'transition-momentum',
  },
  {
    id: 'tr-06',
    text: 'Ready for the next challenge?',
    category: 'transition',
    ageGroup: '6-8',
    mood: 'challenging',
    variationGroup: 'transition-challenge',
  },
  {
    id: 'tr-07',
    text: 'One done! Lots more to see.',
    category: 'transition',
    ageGroup: '2-3',
    mood: 'bright',
    variationGroup: 'transition-progress',
  },
  {
    id: 'tr-08',
    text: 'Whoosh! On to the next adventure.',
    category: 'transition',
    ageGroup: '4-5',
    mood: 'playful',
    characterId: 'ruby',
    variationGroup: 'transition-fun',
  },
  {
    id: 'tr-09',
    text: 'Hmm, what is waiting for us around the corner?',
    category: 'transition',
    ageGroup: '6-8',
    mood: 'curious',
    characterId: 'finn',
    variationGroup: 'transition-discovery',
  },
  {
    id: 'tr-10',
    text: 'That was wonderful. And there is more to come!',
    category: 'transition',
    ageGroup: 'all',
    mood: 'warm',
    variationGroup: 'transition-next',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PARENT INSIGHT (10)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'pi-01',
    text: 'Your child completed {count} lessons this week.',
    category: 'parent-insight',
    ageGroup: 'all',
    mood: 'informative',
    variationGroup: 'insight-weekly',
  },
  {
    id: 'pi-02',
    text: 'Great progress in {skill}! Consistency is key.',
    category: 'parent-insight',
    ageGroup: 'all',
    mood: 'encouraging',
    variationGroup: 'insight-skill',
  },
  {
    id: 'pi-03',
    text: 'Consistent daily practice builds strong skills.',
    category: 'parent-insight',
    ageGroup: 'all',
    mood: 'reassuring',
    variationGroup: 'insight-habit',
  },
  {
    id: 'pi-04',
    text: '{name} spent {minutes} minutes learning today.',
    category: 'parent-insight',
    ageGroup: 'all',
    mood: 'informative',
    variationGroup: 'insight-time',
  },
  {
    id: 'pi-05',
    text: 'Favorite topic this week: {topic}.',
    category: 'parent-insight',
    ageGroup: 'all',
    mood: 'informative',
    variationGroup: 'insight-preference',
  },
  {
    id: 'pi-06',
    text: '{name} earned {count} badges this month. A new personal best!',
    category: 'parent-insight',
    ageGroup: 'all',
    mood: 'proud',
    variationGroup: 'insight-achievement',
  },
  {
    id: 'pi-07',
    text: 'Active on {days} out of 7 days. Building a great habit.',
    category: 'parent-insight',
    ageGroup: 'all',
    mood: 'encouraging',
    variationGroup: 'insight-habit',
  },
  {
    id: 'pi-08',
    text: 'Strongest area: {skill}. Consider introducing new topics for variety.',
    category: 'parent-insight',
    ageGroup: 'all',
    mood: 'advisory',
    variationGroup: 'insight-recommendation',
  },
  {
    id: 'pi-09',
    text: 'Most active time: {timeRange}. Great time for learning.',
    category: 'parent-insight',
    ageGroup: 'all',
    mood: 'informative',
    variationGroup: 'insight-time',
  },
  {
    id: 'pi-10',
    text: 'This week showed improvement in {skill}. Keep it up!',
    category: 'parent-insight',
    ageGroup: 'all',
    mood: 'encouraging',
    variationGroup: 'insight-improvement',
  },
  {
    id: 'pi-11',
    text: '{name} tried {count} new activities. Curiosity is thriving!',
    category: 'parent-insight',
    ageGroup: 'all',
    mood: 'proud',
    variationGroup: 'insight-exploration',
  },
  {
    id: 'pi-12',
    text: 'Learning streak: {count} days in a row. That is dedication.',
    category: 'parent-insight',
    ageGroup: 'all',
    mood: 'impressed',
    variationGroup: 'insight-habit',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL PHRASES (variety expansion)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'pe-16',
    text: 'You are getting stronger at this every single day.',
    category: 'praise-effort',
    ageGroup: '6-8',
    mood: 'encouraging',
    variationGroup: 'effort-growth',
  },
  {
    id: 'gc-16',
    text: 'That one is tricky! Want to hear the question one more time?',
    category: 'gentle-correction',
    ageGroup: '4-5',
    mood: 'supportive',
    variationGroup: 'correction-retry',
  },
  {
    id: 'en-16',
    text: 'The best explorers never stop trying. That is you!',
    category: 'encouragement',
    ageGroup: '6-8',
    mood: 'adventurous',
    characterId: 'finn',
    variationGroup: 'encourage-persistence',
  },
  {
    id: 'cp-11',
    text: 'If you could make anything right now, what would it be?',
    category: 'curiosity-prompt',
    ageGroup: '4-5',
    mood: 'creative',
    characterId: 'daisy',
    variationGroup: 'curiosity-creative',
  },
  {
    id: 'tr-11',
    text: 'And just like that, we are off to the next one!',
    category: 'transition',
    ageGroup: 'all',
    mood: 'bright',
    variationGroup: 'transition-next',
  },
  {
    id: 'rm-13',
    text: 'You collected all the stars in this lesson. What a shining moment!',
    category: 'reward-moment',
    ageGroup: '4-5',
    mood: 'celebratory',
    variationGroup: 'reward-star',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Get all phrases for a given category. */
export function getPhrasesByCategory(category: PhraseCat): PhraseEntry[] {
  return phrases.filter((p) => p.category === category);
}

/** Get all phrases appropriate for a given age group (includes 'all'). */
export function getPhrasesForAge(ageGroup: AgeGroup): PhraseEntry[] {
  return phrases.filter((p) => p.ageGroup === 'all' || p.ageGroup === ageGroup);
}

/** Get phrases matching both category and age group. */
export function getPhrases(category: PhraseCat, ageGroup: AgeGroup): PhraseEntry[] {
  return phrases.filter(
    (p) => p.category === category && (p.ageGroup === 'all' || p.ageGroup === ageGroup),
  );
}

/** Get phrases for a specific mascot character. */
export function getMascotPhrases(characterId: string): PhraseEntry[] {
  return phrases.filter((p) => p.characterId === characterId);
}

/**
 * Pick a random phrase from a category + age group.
 * Returns the phrase text with placeholders intact.
 * Returns a fallback string if no phrases match.
 */
export function pickRandomPhrase(category: PhraseCat, ageGroup: AgeGroup): string {
  const pool = getPhrases(category, ageGroup);
  if (pool.length === 0) return '';
  return pool[Math.floor(Math.random() * pool.length)].text;
}

/**
 * Pick a random phrase and fill in placeholders.
 * Usage: fillPhrase('lesson-intro', '4-5', { topic: 'Colors' })
 * Returns: "Today we are going to learn about Colors."
 */
export function fillPhrase(
  category: PhraseCat,
  ageGroup: AgeGroup,
  vars: Record<string, string | number> = {},
): string {
  let text = pickRandomPhrase(category, ageGroup);
  for (const [key, value] of Object.entries(vars)) {
    text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return text;
}

/**
 * Get all phrases within a variation group (interchangeable alternatives).
 * Useful for cycling through variations to avoid repetition.
 */
export function getVariationGroup(groupId: string): PhraseEntry[] {
  return phrases.filter((p) => p.variationGroup === groupId);
}

/**
 * Pick a random phrase from a variation group, excluding recently used IDs.
 * This prevents repetition when cycling through phrases on the same screen.
 */
export function pickFreshPhrase(
  category: PhraseCat,
  ageGroup: AgeGroup,
  recentIds: string[] = [],
): PhraseEntry | undefined {
  const pool = getPhrases(category, ageGroup).filter((p) => !recentIds.includes(p.id));
  if (pool.length === 0) {
    // All exhausted — reset and pick any
    const fallback = getPhrases(category, ageGroup);
    return fallback[Math.floor(Math.random() * fallback.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Total phrase count for documentation / QA. */
export const TOTAL_PHRASE_COUNT = phrases.length;
