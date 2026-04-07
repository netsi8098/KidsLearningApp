export type EnergyLevel = 'calm' | 'medium' | 'high';

export interface MovementCategory {
  key: string;
  label: string;
  emoji: string;
}

export interface MovementActivity {
  id: string;
  title: string;
  emoji: string;
  category: string;
  energyLevel: EnergyLevel;
  durationMinutes: number;
  instructions: string[];
  ageGroup: '2-3' | '4-5' | '6-8' | 'all';
}

export const movementCategories: MovementCategory[] = [
  { key: 'dance-songs', label: 'Dance Songs', emoji: '💃' },
  { key: 'movement-games', label: 'Movement Games', emoji: '🎮' },
  { key: 'stretch-breaks', label: 'Stretch Breaks', emoji: '🧘' },
  { key: 'freeze-dance', label: 'Freeze Dance', emoji: '❄️' },
  { key: 'action-songs', label: 'Action Songs', emoji: '🎵' },
  { key: 'brain-breaks', label: 'Brain Breaks', emoji: '🧠' },
];

export const movementActivities: MovementActivity[] = [
  // ── Dance Songs ──
  {
    id: 'ds-1',
    title: 'Shake Your Body!',
    emoji: '💃',
    category: 'dance-songs',
    energyLevel: 'high',
    durationMinutes: 3,
    ageGroup: '2-3',
    instructions: [
      'Stand up tall!',
      'Shake your arms up high!',
      'Shake your legs!',
      'Spin around once!',
      'Do a silly dance!',
      'Freeze! Great job!',
    ],
  },
  {
    id: 'ds-2',
    title: 'Animal Dance Party',
    emoji: '🦁',
    category: 'dance-songs',
    energyLevel: 'high',
    durationMinutes: 4,
    ageGroup: '4-5',
    instructions: [
      'Stomp like an elephant!',
      'Slither like a snake!',
      'Hop like a bunny!',
      'Waddle like a penguin!',
      'Roar and dance like a lion!',
      'Fly around like a butterfly!',
      'Take a bow! Amazing dancing!',
    ],
  },
  {
    id: 'ds-3',
    title: 'Rainbow Dance',
    emoji: '🌈',
    category: 'dance-songs',
    energyLevel: 'medium',
    durationMinutes: 3,
    ageGroup: '2-3',
    instructions: [
      'Stretch your arms like a big red arch!',
      'Wiggle your fingers like orange rain!',
      'Spin in a yellow circle!',
      'Sway side to side like green grass!',
      'Jump up and down like blue raindrops!',
      'Float down gently like a purple feather!',
    ],
  },

  // ── Movement Games ──
  {
    id: 'mg-1',
    title: 'Simon Says',
    emoji: '🎯',
    category: 'movement-games',
    energyLevel: 'medium',
    durationMinutes: 5,
    ageGroup: '4-5',
    instructions: [
      'Simon says touch your toes!',
      'Simon says jump three times!',
      'Simon says clap your hands!',
      'Sit down! Oops, Simon didn\'t say!',
      'Simon says spin around!',
      'Simon says do a silly face!',
      'Simon says give yourself a hug!',
    ],
  },
  {
    id: 'mg-2',
    title: 'Follow the Leader',
    emoji: '👣',
    category: 'movement-games',
    energyLevel: 'medium',
    durationMinutes: 4,
    ageGroup: '2-3',
    instructions: [
      'March in place!',
      'Wave your arms!',
      'Tiptoe around the room!',
      'Clap above your head!',
      'Stomp your feet!',
      'Do a twirl!',
    ],
  },
  {
    id: 'mg-3',
    title: 'Obstacle Course',
    emoji: '🏃',
    category: 'movement-games',
    energyLevel: 'high',
    durationMinutes: 5,
    ageGroup: '6-8',
    instructions: [
      'Run in place for 10 seconds!',
      'Do 5 jumping jacks!',
      'Crawl like a bear across the room!',
      'Balance on one foot for 5 seconds!',
      'Do 3 big jumps forward!',
      'Spin around twice and freeze!',
      'Sprint in place as fast as you can!',
    ],
  },

  // ── Stretch Breaks ──
  {
    id: 'sb-1',
    title: 'Morning Stretches',
    emoji: '🌅',
    category: 'stretch-breaks',
    energyLevel: 'calm',
    durationMinutes: 3,
    ageGroup: 'all',
    instructions: [
      'Stand tall and reach for the sky!',
      'Slowly bend down and touch your toes.',
      'Stretch your arms out wide like an airplane.',
      'Gently twist your body left, then right.',
      'Roll your shoulders forward, then backward.',
      'Take three deep breaths. Good morning!',
    ],
  },
  {
    id: 'sb-2',
    title: 'Animal Stretches',
    emoji: '🐱',
    category: 'stretch-breaks',
    energyLevel: 'calm',
    durationMinutes: 4,
    ageGroup: '2-3',
    instructions: [
      'Stretch like a cat! Arch your back up high.',
      'Reach up tall like a giraffe!',
      'Spread your arms like an eagle.',
      'Curl up small like a hedgehog.',
      'Stretch your neck side to side like an owl.',
      'Stand on tippy toes like a flamingo!',
      'Shake it all out! Great stretching!',
    ],
  },
  {
    id: 'sb-3',
    title: 'Yoga for Kids',
    emoji: '🧘',
    category: 'stretch-breaks',
    energyLevel: 'calm',
    durationMinutes: 5,
    ageGroup: '4-5',
    instructions: [
      'Mountain pose: Stand tall with hands at your sides.',
      'Tree pose: Balance on one foot, hands together above.',
      'Warrior pose: Step one foot back, arms out wide!',
      'Downward dog: Hands and feet on floor, bottom up high!',
      'Cobra pose: Lie on your tummy, push your chest up.',
      'Child\'s pose: Kneel and rest your forehead on the floor.',
      'Sit still and breathe. Namaste!',
    ],
  },

  // ── Freeze Dance ──
  {
    id: 'fd-1',
    title: 'Freeze Dance!',
    emoji: '❄️',
    category: 'freeze-dance',
    energyLevel: 'high',
    durationMinutes: 4,
    ageGroup: 'all',
    instructions: [
      'Dance, dance, dance!',
      'FREEZE! Hold your pose!',
      'Dance again! Move those arms!',
      'FREEZE! Don\'t move a muscle!',
      'Dance! Shake everything!',
      'FREEZE! Stay perfectly still!',
      'One last dance! Go wild!',
      'FREEZE! You\'re a champion!',
    ],
  },
  {
    id: 'fd-2',
    title: 'Musical Statues',
    emoji: '🗽',
    category: 'freeze-dance',
    energyLevel: 'high',
    durationMinutes: 5,
    ageGroup: '4-5',
    instructions: [
      'Dance around the room!',
      'FREEZE! Be a statue of a superhero!',
      'Keep dancing! Faster!',
      'FREEZE! Be a statue of an animal!',
      'Dance! Use your whole body!',
      'FREEZE! Be a statue of a robot!',
      'Dance one more time!',
      'FREEZE! Be the silliest statue ever!',
    ],
  },
  {
    id: 'fd-3',
    title: 'Slow-Mo Freeze',
    emoji: '🐌',
    category: 'freeze-dance',
    energyLevel: 'medium',
    durationMinutes: 3,
    ageGroup: '2-3',
    instructions: [
      'Move in slow motion like a snail!',
      'FREEZE! Nice and still.',
      'Slowly wave your arms like seaweed.',
      'FREEZE! Hold it right there!',
      'Slowly spin around... so slow!',
      'FREEZE! You\'re great at this!',
    ],
  },

  // ── Action Songs ──
  {
    id: 'as-1',
    title: 'Head Shoulders Knees Toes',
    emoji: '🦵',
    category: 'action-songs',
    energyLevel: 'medium',
    durationMinutes: 2,
    ageGroup: '2-3',
    instructions: [
      'Touch your head!',
      'Touch your shoulders!',
      'Touch your knees!',
      'Touch your toes!',
      'Now do it faster! Head, shoulders...',
      'Knees and toes! Great job!',
    ],
  },
  {
    id: 'as-2',
    title: 'If You\'re Happy Clap',
    emoji: '👏',
    category: 'action-songs',
    energyLevel: 'medium',
    durationMinutes: 3,
    ageGroup: '2-3',
    instructions: [
      'If you\'re happy and you know it, clap your hands!',
      'If you\'re happy and you know it, stomp your feet!',
      'If you\'re happy and you know it, shout hooray!',
      'If you\'re happy and you know it, do all three!',
      'Clap! Stomp! Hooray! Amazing!',
    ],
  },
  {
    id: 'as-3',
    title: 'Hokey Pokey',
    emoji: '🕺',
    category: 'action-songs',
    energyLevel: 'medium',
    durationMinutes: 3,
    ageGroup: '4-5',
    instructions: [
      'Put your right hand in!',
      'Put your right hand out!',
      'Shake it all about!',
      'Put your left foot in!',
      'Put your left foot out!',
      'Shake it all about!',
      'Put your whole self in and shake it all about!',
      'That\'s what it\'s all about!',
    ],
  },

  // ── Brain Breaks ──
  {
    id: 'bb-1',
    title: 'Jumping Jacks',
    emoji: '⭐',
    category: 'brain-breaks',
    energyLevel: 'high',
    durationMinutes: 2,
    ageGroup: 'all',
    instructions: [
      'Ready? Let\'s do 5 jumping jacks!',
      'Great! Now 5 more, faster!',
      'Awesome! 5 more, super fast!',
      'Last round! 5 big ones!',
      'Shake it out! You did it!',
    ],
  },
  {
    id: 'bb-2',
    title: 'Deep Breaths & Stretch',
    emoji: '🫧',
    category: 'brain-breaks',
    energyLevel: 'calm',
    durationMinutes: 2,
    ageGroup: 'all',
    instructions: [
      'Breathe in slowly through your nose...',
      'Breathe out slowly through your mouth...',
      'Reach your arms up high and stretch!',
      'Breathe in again... nice and slow.',
      'Breathe out... let everything relax.',
      'You feel calm and ready!',
    ],
  },
  {
    id: 'bb-3',
    title: 'Silly Walks',
    emoji: '🤪',
    category: 'brain-breaks',
    energyLevel: 'medium',
    durationMinutes: 3,
    ageGroup: '2-3',
    instructions: [
      'Walk like a robot! Beep boop!',
      'Walk like you\'re on the moon! So bouncy!',
      'Walk super tiny like a mouse!',
      'Walk super big like a giant!',
      'Walk backwards very carefully!',
      'Now walk normally! That was silly!',
    ],
  },
];
