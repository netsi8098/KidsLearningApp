export interface LifeSkillQuiz {
  question: string;
  options: string[];
  correct: number;
}

export interface LifeSkill {
  id: string;
  title: string;
  emoji: string;
  topic: string;
  contentType: 'lesson' | 'scenario' | 'role-play';
  ageGroup: '2-3' | '4-5' | 'all';
  content: string;
  quiz?: LifeSkillQuiz[];
}

export const lifeSkillTopics = [
  { key: 'emotions', label: 'Emotions', emoji: '💭' },
  { key: 'kindness', label: 'Kindness', emoji: '💝' },
  { key: 'sharing', label: 'Sharing', emoji: '🤝' },
  { key: 'patience', label: 'Patience', emoji: '⏳' },
  { key: 'routines', label: 'Routines', emoji: '🌅' },
  { key: 'confidence', label: 'Confidence', emoji: '💪' },
  { key: 'hygiene', label: 'Hygiene', emoji: '🧼' },
  { key: 'friendship', label: 'Friendship', emoji: '👋' },
] as const;

export const lifeSkillsData: LifeSkill[] = [
  // ── Emotions ──
  {
    id: 'emotions-identify',
    title: 'Identifying Feelings',
    emoji: '💭',
    topic: 'emotions',
    contentType: 'lesson',
    ageGroup: 'all',
    content:
      'Everyone has feelings, and every feeling is okay! Sometimes we feel happy, sometimes sad, and sometimes angry. Learning to name our feelings is the first step to understanding them.',
    quiz: [
      {
        question: 'Is it okay to feel sad sometimes?',
        options: ['Yes, all feelings are okay', 'No, we should always be happy'],
        correct: 0,
      },
    ],
  },
  {
    id: 'emotions-express',
    title: 'Expressing Feelings',
    emoji: '🗣️',
    topic: 'emotions',
    contentType: 'lesson',
    ageGroup: 'all',
    content:
      'Talking about how you feel helps others understand you. You can say "I feel happy because..." or "I feel sad when..." Using words to share feelings is a superpower!',
    quiz: [
      {
        question: 'What is a good way to express your feelings?',
        options: ['Keep them inside', 'Use words to tell someone how you feel'],
        correct: 1,
      },
    ],
  },

  // ── Kindness ──
  {
    id: 'kindness-acts',
    title: 'Acts of Kindness',
    emoji: '💝',
    topic: 'kindness',
    contentType: 'scenario',
    ageGroup: '4-5',
    content:
      'Kindness means doing nice things for others without being asked. You can hold the door, help pick up toys, or draw a picture for a friend. Small acts of kindness make the world a better place!',
    quiz: [
      {
        question: 'Which is an act of kindness?',
        options: ['Taking all the toys for yourself', 'Helping a friend pick up their crayons'],
        correct: 1,
      },
    ],
  },
  {
    id: 'kindness-words',
    title: 'Kind Words',
    emoji: '🌟',
    topic: 'kindness',
    contentType: 'lesson',
    ageGroup: '2-3',
    content:
      'Kind words make people feel good! Words like "please", "thank you", and "you are great" can make someone smile. Let us practice using kind words every day.',
    quiz: [
      {
        question: 'Which is a kind word?',
        options: ['Go away!', 'Thank you!'],
        correct: 1,
      },
    ],
  },

  // ── Sharing ──
  {
    id: 'sharing-toys',
    title: 'Sharing is Caring',
    emoji: '🤝',
    topic: 'sharing',
    contentType: 'role-play',
    ageGroup: '2-3',
    content:
      'Sharing means letting others use your things too. When you share a toy, both of you get to have fun! Sharing shows you care about your friends.',
    quiz: [
      {
        question: 'What happens when you share with a friend?',
        options: ['You lose your toy forever', 'Both of you can have fun together'],
        correct: 1,
      },
    ],
  },
  {
    id: 'sharing-turns',
    title: 'Taking Turns',
    emoji: '🔄',
    topic: 'sharing',
    contentType: 'scenario',
    ageGroup: '4-5',
    content:
      'Taking turns means everyone gets a chance to play. First it is your turn, then it is their turn. When we take turns, everyone feels included and happy!',
    quiz: [
      {
        question: 'Why is taking turns important?',
        options: ['So only one person has fun', 'So everyone gets a fair chance to play'],
        correct: 1,
      },
    ],
  },

  // ── Patience ──
  {
    id: 'patience-waiting',
    title: 'Learning to Wait',
    emoji: '⏳',
    topic: 'patience',
    contentType: 'lesson',
    ageGroup: '2-3',
    content:
      'Sometimes we have to wait, and that is okay! Waiting can be hard, but we can count to ten, sing a song, or take deep breaths while we wait. Good things come to those who wait!',
    quiz: [
      {
        question: 'What can you do while waiting?',
        options: ['Scream and shout', 'Take deep breaths or count to ten'],
        correct: 1,
      },
    ],
  },
  {
    id: 'patience-practice',
    title: 'Patience Practice',
    emoji: '🧘',
    topic: 'patience',
    contentType: 'scenario',
    ageGroup: '4-5',
    content:
      'Imagine you are waiting for your turn on the slide. Instead of pushing, you can watch the clouds, talk to a friend, or count the birds in the sky. Patience makes waiting easier and more fun!',
    quiz: [
      {
        question: 'You are waiting for your turn. What should you do?',
        options: ['Push to the front of the line', 'Wait patiently and find something fun to do'],
        correct: 1,
      },
    ],
  },

  // ── Routines ──
  {
    id: 'routines-morning',
    title: 'Morning Routine',
    emoji: '🌅',
    topic: 'routines',
    contentType: 'lesson',
    ageGroup: 'all',
    content:
      'A morning routine helps you start your day right! Wake up, stretch, brush your teeth, eat breakfast, and get dressed. Doing the same things each morning helps you feel ready for the day.',
    quiz: [
      {
        question: 'Why are morning routines helpful?',
        options: ['They make mornings confusing', 'They help you feel ready for the day'],
        correct: 1,
      },
    ],
  },
  {
    id: 'routines-bedtime',
    title: 'Bedtime Routine',
    emoji: '🌙',
    topic: 'routines',
    contentType: 'lesson',
    ageGroup: 'all',
    content:
      'A bedtime routine helps your body know it is time to sleep. Brush your teeth, put on pajamas, read a story, and say goodnight. Sweet dreams come easier with a good routine!',
    quiz: [
      {
        question: 'What is part of a good bedtime routine?',
        options: ['Playing exciting video games', 'Brushing your teeth and reading a story'],
        correct: 1,
      },
    ],
  },

  // ── Confidence ──
  {
    id: 'confidence-try',
    title: 'I Can Try!',
    emoji: '💪',
    topic: 'confidence',
    contentType: 'lesson',
    ageGroup: '2-3',
    content:
      'You can do amazing things when you try! Even if something seems hard, saying "I can try!" is the first step. Every big kid started as a little kid who tried.',
    quiz: [
      {
        question: 'What should you say when something seems hard?',
        options: ['I cannot do it', 'I can try!'],
        correct: 1,
      },
    ],
  },
  {
    id: 'confidence-mistakes',
    title: 'Mistakes Help Us Grow',
    emoji: '🌱',
    topic: 'confidence',
    contentType: 'lesson',
    ageGroup: '4-5',
    content:
      'Everyone makes mistakes, and that is perfectly okay! Mistakes are how we learn and grow. When you make a mistake, think about what you can do differently next time. That is how you get better!',
    quiz: [
      {
        question: 'What should you do when you make a mistake?',
        options: ['Give up and stop trying', 'Think about what to do differently next time'],
        correct: 1,
      },
    ],
  },

  // ── Hygiene ──
  {
    id: 'hygiene-handwash',
    title: 'Washing Hands',
    emoji: '🧼',
    topic: 'hygiene',
    contentType: 'lesson',
    ageGroup: '2-3',
    content:
      'Washing your hands keeps germs away! Use soap and water, scrub for 20 seconds (sing the ABC song!), and rinse well. Wash before eating and after using the bathroom.',
    quiz: [
      {
        question: 'How long should you wash your hands?',
        options: ['Just one second', 'About 20 seconds, like singing the ABC song'],
        correct: 1,
      },
    ],
  },
  {
    id: 'hygiene-teeth',
    title: 'Brushing Teeth',
    emoji: '🪥',
    topic: 'hygiene',
    contentType: 'lesson',
    ageGroup: '2-3',
    content:
      'Brushing your teeth keeps them strong and healthy! Brush in the morning and before bed. Move the brush in little circles on all your teeth. A bright smile starts with clean teeth!',
    quiz: [
      {
        question: 'When should you brush your teeth?',
        options: ['Only on weekends', 'In the morning and before bed'],
        correct: 1,
      },
    ],
  },

  // ── Friendship ──
  {
    id: 'friendship-making',
    title: 'Making Friends',
    emoji: '👋',
    topic: 'friendship',
    contentType: 'scenario',
    ageGroup: '4-5',
    content:
      'Making friends starts with a smile and a hello! Ask someone to play, share your toys, or give a compliment. Everyone wants a friend, so being friendly is the best way to start!',
    quiz: [
      {
        question: 'How can you start making a new friend?',
        options: ['Ignore them', 'Say hello and ask them to play'],
        correct: 1,
      },
    ],
  },
  {
    id: 'friendship-being',
    title: 'Being a Good Friend',
    emoji: '💛',
    topic: 'friendship',
    contentType: 'lesson',
    ageGroup: '4-5',
    content:
      'A good friend listens, shares, and is kind. When your friend is sad, give them a hug or cheer them up. Good friends help each other and always try to be fair.',
    quiz: [
      {
        question: 'What does a good friend do?',
        options: ['Only plays when they want to', 'Listens, shares, and is kind'],
        correct: 1,
      },
    ],
  },
];
