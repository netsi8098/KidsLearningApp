export interface ExplorerFact {
  text: string;
  emoji: string;
}

export interface ExplorerQuizQuestion {
  question: string;
  options: string[];
  correct: string;
}

export interface ExplorerTopic {
  id: string;
  title: string;
  emoji: string;
  category: string;
  ageGroup: '4-5' | '6-8';
  facts: ExplorerFact[];
  quizQuestions: ExplorerQuizQuestion[];
  relatedTopicIds: string[];
}

export interface ExplorerCategory {
  key: string;
  label: string;
  emoji: string;
}

export const explorerCategories: ExplorerCategory[] = [
  { key: 'animals-world', label: 'World Animals', emoji: '🦁' },
  { key: 'weather', label: 'Weather', emoji: '🌤️' },
  { key: 'jobs', label: 'Jobs', emoji: '👷' },
  { key: 'transport', label: 'Transport', emoji: '🚀' },
  { key: 'space', label: 'Space', emoji: '🪐' },
  { key: 'ocean', label: 'Ocean', emoji: '🌊' },
  { key: 'body-health', label: 'Body & Health', emoji: '❤️' },
];

export const explorerTopics: ExplorerTopic[] = [
  // ── Animals of the World ──
  {
    id: 'aw-1',
    title: 'Animals of Africa',
    emoji: '🦁',
    category: 'animals-world',
    ageGroup: '4-5',
    facts: [
      { text: 'Lions live in groups called prides', emoji: '🦁' },
      { text: 'Elephants are the largest land animals', emoji: '🐘' },
      { text: 'Giraffes have the longest necks', emoji: '🦒' },
      { text: 'Zebras have unique stripe patterns', emoji: '🦓' },
    ],
    quizQuestions: [
      {
        question: 'What is a group of lions called?',
        options: ['Pride', 'Pack', 'Flock', 'Herd'],
        correct: 'Pride',
      },
    ],
    relatedTopicIds: ['aw-2'],
  },
  {
    id: 'aw-2',
    title: 'Animals of the Ocean',
    emoji: '🐙',
    category: 'animals-world',
    ageGroup: '4-5',
    facts: [
      { text: 'Dolphins are very smart and playful', emoji: '🐬' },
      { text: 'Octopuses have eight arms and three hearts', emoji: '🐙' },
      { text: 'Sea turtles can live over 100 years', emoji: '🐢' },
      { text: 'Whales are the biggest animals on Earth', emoji: '🐋' },
    ],
    quizQuestions: [
      {
        question: 'How many arms does an octopus have?',
        options: ['Six', 'Eight', 'Ten', 'Four'],
        correct: 'Eight',
      },
    ],
    relatedTopicIds: ['aw-1', 'oc-1'],
  },

  // ── Weather ──
  {
    id: 'we-1',
    title: 'How Rain Forms',
    emoji: '🌧️',
    category: 'weather',
    ageGroup: '4-5',
    facts: [
      { text: 'The sun heats water in rivers, lakes, and oceans', emoji: '☀️' },
      { text: 'Water turns into tiny invisible drops called vapor', emoji: '💧' },
      { text: 'Vapor rises into the sky and forms clouds', emoji: '☁️' },
      { text: 'When clouds get heavy, rain falls back down', emoji: '🌧️' },
    ],
    quizQuestions: [
      {
        question: 'What heats the water to start the rain cycle?',
        options: ['The moon', 'The sun', 'The wind', 'The stars'],
        correct: 'The sun',
      },
    ],
    relatedTopicIds: ['we-2'],
  },
  {
    id: 'we-2',
    title: 'Why Rainbows Appear',
    emoji: '🌈',
    category: 'weather',
    ageGroup: '4-5',
    facts: [
      { text: 'Rainbows happen when sunlight shines through rain', emoji: '🌈' },
      { text: 'Sunlight is made of many colors mixed together', emoji: '☀️' },
      { text: 'Raindrops split sunlight into seven beautiful colors', emoji: '💧' },
      { text: 'The colors are red, orange, yellow, green, blue, indigo, and violet', emoji: '🎨' },
    ],
    quizQuestions: [
      {
        question: 'How many colors are in a rainbow?',
        options: ['Five', 'Six', 'Seven', 'Eight'],
        correct: 'Seven',
      },
    ],
    relatedTopicIds: ['we-1'],
  },

  // ── Jobs ──
  {
    id: 'jo-1',
    title: 'Community Helpers',
    emoji: '👨‍🚒',
    category: 'jobs',
    ageGroup: '4-5',
    facts: [
      { text: 'Firefighters are brave heroes who put out fires', emoji: '🚒' },
      { text: 'Doctors help sick people feel better', emoji: '👩‍⚕️' },
      { text: 'Teachers help children learn new things every day', emoji: '👩‍🏫' },
      { text: 'Police officers keep our neighborhoods safe', emoji: '👮' },
    ],
    quizQuestions: [
      {
        question: 'Who helps put out fires?',
        options: ['Teachers', 'Firefighters', 'Doctors', 'Chefs'],
        correct: 'Firefighters',
      },
    ],
    relatedTopicIds: ['jo-2'],
  },
  {
    id: 'jo-2',
    title: 'People Who Build',
    emoji: '👷',
    category: 'jobs',
    ageGroup: '6-8',
    facts: [
      { text: 'Construction workers build houses, schools, and bridges', emoji: '🏗️' },
      { text: 'Architects draw the plans before anything is built', emoji: '📐' },
      { text: 'Electricians install lights and power in buildings', emoji: '💡' },
      { text: 'Plumbers make sure water flows to every room', emoji: '🔧' },
    ],
    quizQuestions: [
      {
        question: 'Who draws the plans for buildings?',
        options: ['Plumbers', 'Architects', 'Electricians', 'Painters'],
        correct: 'Architects',
      },
    ],
    relatedTopicIds: ['jo-1'],
  },

  // ── Transport ──
  {
    id: 'tr-1',
    title: 'How Planes Fly',
    emoji: '✈️',
    category: 'transport',
    ageGroup: '6-8',
    facts: [
      { text: 'Airplane wings are specially shaped to lift into the air', emoji: '✈️' },
      { text: 'Jet engines push planes forward at incredible speed', emoji: '🔥' },
      { text: 'Pilots use a cockpit full of buttons and screens to fly', emoji: '👨‍✈️' },
      { text: 'The biggest planes can carry over 800 passengers', emoji: '🛫' },
    ],
    quizQuestions: [
      {
        question: 'What helps a plane lift into the air?',
        options: ['The tail', 'The wings', 'The wheels', 'The door'],
        correct: 'The wings',
      },
    ],
    relatedTopicIds: ['tr-2'],
  },
  {
    id: 'tr-2',
    title: 'Trains Around the World',
    emoji: '🚂',
    category: 'transport',
    ageGroup: '4-5',
    facts: [
      { text: 'Trains run on metal tracks called railways', emoji: '🛤️' },
      { text: 'The fastest trains can go over 300 miles per hour', emoji: '🚄' },
      { text: 'Freight trains carry food and goods across countries', emoji: '📦' },
      { text: 'The first steam train was built over 200 years ago', emoji: '🚂' },
    ],
    quizQuestions: [
      {
        question: 'What do trains run on?',
        options: ['Roads', 'Water', 'Railways', 'Sand'],
        correct: 'Railways',
      },
    ],
    relatedTopicIds: ['tr-1'],
  },

  // ── Space ──
  {
    id: 'sp-1',
    title: 'Our Solar System',
    emoji: '🪐',
    category: 'space',
    ageGroup: '6-8',
    facts: [
      { text: 'Our solar system has eight planets orbiting the Sun', emoji: '☀️' },
      { text: 'Jupiter is the biggest planet in our solar system', emoji: '🪐' },
      { text: 'Earth is the only planet we know with life', emoji: '🌍' },
      { text: 'Saturn has beautiful rings made of ice and rock', emoji: '💫' },
    ],
    quizQuestions: [
      {
        question: 'Which is the biggest planet in our solar system?',
        options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
        correct: 'Jupiter',
      },
      {
        question: 'How many planets are in our solar system?',
        options: ['Six', 'Seven', 'Eight', 'Nine'],
        correct: 'Eight',
      },
    ],
    relatedTopicIds: ['sp-2'],
  },
  {
    id: 'sp-2',
    title: 'The Moon',
    emoji: '🌙',
    category: 'space',
    ageGroup: '4-5',
    facts: [
      { text: 'The Moon goes around the Earth every 27 days', emoji: '🌙' },
      { text: 'The Moon has no air, wind, or weather', emoji: '🌑' },
      { text: 'Astronauts first walked on the Moon in 1969', emoji: '👨‍🚀' },
      { text: 'The Moon looks different each night because of sunlight', emoji: '🌓' },
    ],
    quizQuestions: [
      {
        question: 'When did astronauts first walk on the Moon?',
        options: ['1959', '1969', '1979', '1989'],
        correct: '1969',
      },
    ],
    relatedTopicIds: ['sp-1'],
  },

  // ── Ocean ──
  {
    id: 'oc-1',
    title: 'Deep Sea Creatures',
    emoji: '🦑',
    category: 'ocean',
    ageGroup: '6-8',
    facts: [
      { text: 'The deep sea is so dark that some fish make their own light', emoji: '💡' },
      { text: 'Giant squid can grow longer than a school bus', emoji: '🦑' },
      { text: 'Anglerfish use a glowing lure to attract prey', emoji: '🐟' },
      { text: 'The deepest part of the ocean is the Mariana Trench', emoji: '🌊' },
    ],
    quizQuestions: [
      {
        question: 'What is the deepest part of the ocean called?',
        options: ['Grand Canyon', 'Mariana Trench', 'Pacific Hole', 'Atlantic Deep'],
        correct: 'Mariana Trench',
      },
    ],
    relatedTopicIds: ['oc-2', 'aw-2'],
  },
  {
    id: 'oc-2',
    title: 'Coral Reefs',
    emoji: '🪸',
    category: 'ocean',
    ageGroup: '4-5',
    facts: [
      { text: 'Coral reefs are made by tiny animals called coral polyps', emoji: '🪸' },
      { text: 'Reefs are home to thousands of colorful fish', emoji: '🐠' },
      { text: 'The Great Barrier Reef is so big you can see it from space', emoji: '🌏' },
      { text: 'Coral reefs need warm, clear water to grow', emoji: '☀️' },
    ],
    quizQuestions: [
      {
        question: 'What are coral reefs made by?',
        options: ['Rocks', 'Coral polyps', 'Fish', 'Seaweed'],
        correct: 'Coral polyps',
      },
    ],
    relatedTopicIds: ['oc-1'],
  },

  // ── Body & Health ──
  {
    id: 'bh-1',
    title: 'How Your Heart Works',
    emoji: '❤️',
    category: 'body-health',
    ageGroup: '6-8',
    facts: [
      { text: 'Your heart beats about 100,000 times every day', emoji: '❤️' },
      { text: 'The heart pumps blood to every part of your body', emoji: '🩸' },
      { text: 'Exercise makes your heart stronger and healthier', emoji: '🏃' },
      { text: 'Your heart is about the size of your fist', emoji: '✊' },
    ],
    quizQuestions: [
      {
        question: 'About how many times does your heart beat each day?',
        options: ['1,000', '10,000', '100,000', '1,000,000'],
        correct: '100,000',
      },
    ],
    relatedTopicIds: ['bh-2'],
  },
  {
    id: 'bh-2',
    title: 'Why We Sleep',
    emoji: '😴',
    category: 'body-health',
    ageGroup: '4-5',
    facts: [
      { text: 'Sleep helps your brain remember what you learned', emoji: '🧠' },
      { text: 'Your body grows and repairs itself while you sleep', emoji: '🌙' },
      { text: 'Kids need about 10 to 12 hours of sleep each night', emoji: '😴' },
      { text: 'Dreams happen during a special part of sleep called REM', emoji: '💭' },
    ],
    quizQuestions: [
      {
        question: 'How many hours of sleep do kids need each night?',
        options: ['5 to 6', '7 to 8', '10 to 12', '14 to 16'],
        correct: '10 to 12',
      },
    ],
    relatedTopicIds: ['bh-1'],
  },
];
