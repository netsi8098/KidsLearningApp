// ─── Hosted Episode Data Model & Sample Episodes ──────────────────────────
// Defines the schema for mascot-hosted educational segments ("mini-shows")
// that guide children through learning topics with interactions.

// ─── Segment Types ─────────────────────────────────────────────────────────

export interface IntroSegment {
  type: 'intro';
  hostLine: string;
  hostExpression: string;
  hostPose: string;
  durationMs: number;
}

export interface TopicRevealSegment {
  type: 'topic-reveal';
  title: string;
  emoji: string;
  hostLine: string;
  revealAnimation: string;
}

export interface InteractionSegment {
  type: 'interaction';
  prompt: string;
  interactionType: 'tap' | 'drag' | 'voice' | 'choose';
  options?: string[];
  correctAnswer?: string;
  hostHint?: string;
}

export interface CallResponseSegment {
  type: 'call-response';
  hostLine: string;
  expectedResponse: string;
  celebrateOnResponse: boolean;
}

export interface TeachSegment {
  type: 'teach';
  content: string;
  visual: string;
  hostLine: string;
}

export interface RecapSegment {
  type: 'recap';
  summary: string;
  hostLine: string;
  hostExpression: string;
}

export interface GoodbyeSegment {
  type: 'goodbye';
  hostLine: string;
  nextSuggestion?: string;
}

export type EpisodeSegment =
  | IntroSegment
  | TopicRevealSegment
  | InteractionSegment
  | CallResponseSegment
  | TeachSegment
  | RecapSegment
  | GoodbyeSegment;

// ─── Episode Schema ────────────────────────────────────────────────────────

export type EpisodeAgeGroup = '2-3' | '4-5' | '6-8' | 'all';

export interface HostedEpisode {
  id: string;
  title: string;
  emoji: string;
  hostCharacterId: string; // references character IDs: 'leo', 'daisy', 'ollie', 'ruby', 'finn'
  topic: string;
  ageGroup: EpisodeAgeGroup;
  durationMinutes: number;
  segments: EpisodeSegment[];
}

// ═══════════════════════════════════════════════════════════════════════════
// EPISODE 1: "Let's Learn About Colors!" hosted by Leo Lion
// 7 segments: intro, topic-reveal, 2 interactions, recap, goodbye
// ═══════════════════════════════════════════════════════════════════════════

const learnColors: HostedEpisode = {
  id: 'ep-colors-1',
  title: "Let's Learn About Colors!",
  emoji: '🎨',
  hostCharacterId: 'leo',
  topic: 'colors',
  ageGroup: '2-3',
  durationMinutes: 3,
  segments: [
    // 1. Intro
    {
      type: 'intro',
      hostLine: "ROAR! Hello there, little friend! I'm Leo Lion, and today we're going to have SO much fun with colors!",
      hostExpression: 'excited',
      hostPose: 'waving',
      durationMs: 4000,
    },
    // 2. Topic Reveal
    {
      type: 'topic-reveal',
      title: 'Colors Everywhere!',
      emoji: '🌈',
      hostLine: "Colors are all around us! Let's discover them together! Are you ready?",
      revealAnimation: 'rainbow-burst',
    },
    // 3. Teach - Red
    {
      type: 'teach',
      content: 'Red is the color of strawberries, fire trucks, and roses!',
      visual: '🍓',
      hostLine: "Look at this! This is RED. Can you say RED? Strawberries are red, and they're yummy!",
    },
    // 4. Interaction - pick the red item
    {
      type: 'interaction',
      prompt: 'Which one is RED?',
      interactionType: 'choose',
      options: ['🍓', '🍌', '🫐', '🥒'],
      correctAnswer: '🍓',
      hostHint: "Remember, red looks like a strawberry! Which fruit is red?",
    },
    // 5. Teach - Blue
    {
      type: 'teach',
      content: 'Blue is the color of the sky, the ocean, and blueberries!',
      visual: '🌊',
      hostLine: "Now let's look at BLUE! The sky is blue, and so is the ocean. Blue is such a pretty color!",
    },
    // 6. Interaction - pick the blue item
    {
      type: 'interaction',
      prompt: 'Which one is BLUE?',
      interactionType: 'choose',
      options: ['🍎', '🫐', '🍊', '🌽'],
      correctAnswer: '🫐',
      hostHint: "Blue like the sky! Which one is a blueberry?",
    },
    // 7. Recap
    {
      type: 'recap',
      summary: 'Today we learned about RED and BLUE! Red like strawberries, and blue like the ocean.',
      hostLine: "ROAR! You did AMAZING! We learned two awesome colors today! I'm so proud of you!",
      hostExpression: 'celebrating',
    },
    // 8. Goodbye
    {
      type: 'goodbye',
      hostLine: "Great job today, my friend! Come back soon and we'll learn even more colors! Bye bye!",
      nextSuggestion: "Try 'Counting to 5' next!",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// EPISODE 2: "Counting to 5!" hosted by Ollie Owl
// 8 segments: intro, topic-reveal, teach, interaction, call-response,
//             teach, recap, goodbye
// ═══════════════════════════════════════════════════════════════════════════

const countingToFive: HostedEpisode = {
  id: 'ep-counting-1',
  title: 'Counting to 5!',
  emoji: '🔢',
  hostCharacterId: 'ollie',
  topic: 'counting',
  ageGroup: '2-3',
  durationMinutes: 4,
  segments: [
    // 1. Intro
    {
      type: 'intro',
      hostLine: "Hoot hoot! Welcome, little one. I'm Ollie Owl, and today we're going to count together. Counting is wonderful!",
      hostExpression: 'warm',
      hostPose: 'sitting',
      durationMs: 5000,
    },
    // 2. Topic Reveal
    {
      type: 'topic-reveal',
      title: 'Let\'s Count to 5!',
      emoji: '✋',
      hostLine: "We're going to learn to count all the way to five. Hold up your hand! You have five fingers!",
      revealAnimation: 'number-cascade',
    },
    // 3. Teach - Numbers 1, 2, 3
    {
      type: 'teach',
      content: 'One apple. Two butterflies. Three stars!',
      visual: '🍎🦋🦋⭐⭐⭐',
      hostLine: "Let's start! One apple. Can you say one? Now, two butterflies. One, two! And three stars. One, two, three!",
    },
    // 4. Call-response
    {
      type: 'call-response',
      hostLine: "Let's count together! Ready? One... two... three!",
      expectedResponse: 'one two three',
      celebrateOnResponse: true,
    },
    // 5. Teach - Numbers 4, 5
    {
      type: 'teach',
      content: 'Four flowers. Five little ducks!',
      visual: '🌸🌸🌸🌸🦆🦆🦆🦆🦆',
      hostLine: "Now for the big numbers! Four flowers. One, two, three, four! And five little ducks. One, two, three, four, FIVE!",
    },
    // 6. Interaction - pick the group of 4
    {
      type: 'interaction',
      prompt: 'Which group has FOUR things?',
      interactionType: 'choose',
      options: ['🌸🌸', '🌸🌸🌸🌸', '🌸🌸🌸', '🌸🌸🌸🌸🌸'],
      correctAnswer: '🌸🌸🌸🌸',
      hostHint: "Count each flower carefully! Which group has one, two, three, four flowers?",
    },
    // 7. Call-response - count to 5
    {
      type: 'call-response',
      hostLine: "Now let's count all the way to five! One... two... three... four... five!",
      expectedResponse: 'one two three four five',
      celebrateOnResponse: true,
    },
    // 8. Recap
    {
      type: 'recap',
      summary: 'We counted all the way from 1 to 5! One, two, three, four, five. You can count!',
      hostLine: "Hoot hoot! You did a wonderful job counting today! You counted all the way to five. That's amazing, little one!",
      hostExpression: 'proud',
    },
    // 9. Goodbye
    {
      type: 'goodbye',
      hostLine: "Thank you for counting with me today! Practice counting things you see at home. Bye bye, clever friend!",
      nextSuggestion: "Try 'Let's Learn About Colors!' next!",
    },
  ],
};

// ─── Exported Collections ──────────────────────────────────────────────────

export const hostedEpisodes: HostedEpisode[] = [learnColors, countingToFive];

export function getEpisodeById(id: string): HostedEpisode | undefined {
  return hostedEpisodes.find((e) => e.id === id);
}

export function getEpisodesByHost(hostId: string): HostedEpisode[] {
  return hostedEpisodes.filter((e) => e.hostCharacterId === hostId);
}

export function getEpisodesByTopic(topic: string): HostedEpisode[] {
  return hostedEpisodes.filter((e) => e.topic === topic);
}

export function getEpisodesByAge(age: EpisodeAgeGroup): HostedEpisode[] {
  return hostedEpisodes.filter((e) => e.ageGroup === age || e.ageGroup === 'all');
}

/** Get a human-readable segment type label */
export function segmentTypeLabel(type: EpisodeSegment['type']): string {
  const labels: Record<EpisodeSegment['type'], string> = {
    intro: 'Welcome',
    'topic-reveal': 'Topic',
    interaction: 'Activity',
    'call-response': 'Sing Along',
    teach: 'Learn',
    recap: 'Great Job!',
    goodbye: 'See You!',
  };
  return labels[type] ?? type;
}
