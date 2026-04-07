export interface CharacterData {
  id: string;
  name: string;
  emoji: string;
  color: string;
  personality: string;
  description: string;
  topics: string[];
  encouragements: string[];
  celebrations: string[];
  greetings: string[];
}

export const charactersData: CharacterData[] = [
  {
    id: 'leo',
    name: 'Leo Lion',
    emoji: '\u{1F981}',
    color: '#FFD93D',
    personality: 'learning',
    description: 'Leo loves learning new things! He gets excited about letters, numbers, and fun lessons.',
    topics: ['abc', 'numbers', 'lessons'],
    encouragements: [
      'You can do it! I believe in you!',
      'Keep going, you\'re getting smarter every day!',
      'Wow, look how much you know already!',
      'Don\'t give up - every lion starts small!',
    ],
    celebrations: [
      'ROAR! That was amazing!',
      'You did it! I\'m so proud of you!',
      'High five! You\'re a superstar!',
    ],
    greetings: [
      'Hey there, friend! Ready to learn something cool?',
      'ROAR! Welcome back! Let\'s have fun today!',
      'Hi! I missed you! What shall we learn?',
    ],
  },
  {
    id: 'daisy',
    name: 'Daisy Duck',
    emoji: '\u{1F986}',
    color: '#FD79A8',
    personality: 'creative',
    description: 'Daisy is super creative! She loves coloring, cooking, and making beautiful things.',
    topics: ['coloring', 'cooking', 'printables'],
    encouragements: [
      'Ooh, that looks beautiful! Keep creating!',
      'You have such amazing ideas!',
      'Every masterpiece starts with one brushstroke!',
    ],
    celebrations: [
      'Quack quack! What a beautiful creation!',
      'You\'re an amazing artist! I love it!',
      'Wow wow wow! That\'s so creative!',
      'You made something wonderful today!',
    ],
    greetings: [
      'Quack! Hi there! Ready to make something fun?',
      'Hello, little artist! Let\'s create together!',
      'Welcome back! I\'ve got my paintbrush ready!',
    ],
  },
  {
    id: 'ollie',
    name: 'Ollie Owl',
    emoji: '\u{1F989}',
    color: '#6366F1',
    personality: 'calm',
    description: 'Ollie is wise and calm. He loves bedtime stories, reading, and listening to audio tales.',
    topics: ['bedtime', 'stories', 'audio'],
    encouragements: [
      'Take your time, there\'s no rush at all.',
      'You\'re doing wonderfully, little one.',
      'Every page you read makes you wiser!',
      'Slow and steady wins the race!',
    ],
    celebrations: [
      'Hoot hoot! Well done, wise one!',
      'That was wonderful! You should be very proud.',
      'What a thoughtful job! Amazing!',
    ],
    greetings: [
      'Hoot hoot! Hello, my friend. Shall we read together?',
      'Welcome, little one. I have a story for you!',
      'Good to see you! Let\'s explore a story tonight.',
    ],
  },
  {
    id: 'ruby',
    name: 'Ruby Rabbit',
    emoji: '\u{1F430}',
    color: '#FF6B6B',
    personality: 'active',
    description: 'Ruby can\'t sit still! She loves games, dancing, matching, and anything active and fun.',
    topics: ['movement', 'games', 'matching'],
    encouragements: [
      'Jump jump jump! You\'re doing great!',
      'Faster, faster! You\'re on fire!',
      'So close! One more try, let\'s go!',
    ],
    celebrations: [
      'Woohoo! You hopped right to the finish!',
      'YES! That was incredible! Do a happy dance!',
      'You won you won you won! Amazing!',
      'Hop hop hooray! What a champion!',
    ],
    greetings: [
      'HOP HOP! Hi there! Ready to play?',
      'Yay, you\'re here! Let\'s have some fun!',
      'Welcome back! I\'ve been bouncing with excitement!',
    ],
  },
  {
    id: 'finn',
    name: 'Finn Fox',
    emoji: '\u{1F98A}',
    color: '#4ECDC4',
    personality: 'explorer',
    description: 'Finn is a curious explorer! He loves discovering animals, exploring the world, and home adventures.',
    topics: ['animals', 'explorer', 'homeactivities'],
    encouragements: [
      'Ooh, what a great discovery! Keep exploring!',
      'You\'re like a real explorer! Onwards!',
      'There\'s so much to find - let\'s keep going!',
      'Curious minds find the coolest things!',
    ],
    celebrations: [
      'What a discovery! You\'re a true explorer!',
      'Fantastic find! I knew you could do it!',
      'You explored like a champion today!',
    ],
    greetings: [
      'Hey explorer! Ready for an adventure?',
      'Pssst... I found something cool! Come see!',
      'Welcome back, adventurer! Where shall we go today?',
    ],
  },
];

export function getCharacterById(id: string): CharacterData {
  return charactersData.find((c) => c.id === id) ?? charactersData[0];
}
