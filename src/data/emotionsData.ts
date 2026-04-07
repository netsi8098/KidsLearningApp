export interface Emotion {
  key: string;
  label: string;
  emoji: string;
  color: string;
  description: string;
  helpTip: string;
}

export const emotionsData: Emotion[] = [
  {
    key: 'happy',
    label: 'Happy',
    emoji: '😊',
    color: '#FFD93D',
    description: 'Feeling joyful and bright!',
    helpTip: "It's wonderful to feel happy! Share your joy with others.",
  },
  {
    key: 'sad',
    label: 'Sad',
    emoji: '😢',
    color: '#74B9FF',
    description: 'Feeling down or blue',
    helpTip: "It's okay to feel sad. A hug or talking to someone can help.",
  },
  {
    key: 'angry',
    label: 'Angry',
    emoji: '😠',
    color: '#FF6B6B',
    description: 'Feeling mad or frustrated',
    helpTip: "Take deep breaths. Count to 5. It's okay to feel angry, but let's calm down.",
  },
  {
    key: 'scared',
    label: 'Scared',
    emoji: '😨',
    color: '#A78BFA',
    description: 'Feeling afraid or worried',
    helpTip: "You're safe! Try hugging a stuffed animal or talking to a grown-up.",
  },
  {
    key: 'excited',
    label: 'Excited',
    emoji: '🤩',
    color: '#FF8C42',
    description: 'Feeling thrilled and energized!',
    helpTip: 'Yay! What fun thing is making you excited?',
  },
  {
    key: 'calm',
    label: 'Calm',
    emoji: '😌',
    color: '#4ECDC4',
    description: 'Feeling peaceful and relaxed',
    helpTip: 'Being calm is wonderful. Try some deep breaths to stay this way.',
  },
  {
    key: 'confused',
    label: 'Confused',
    emoji: '😕',
    color: '#FFB347',
    description: "Not sure what's happening",
    helpTip: "It's okay to not understand. Ask questions — that's how we learn!",
  },
  {
    key: 'proud',
    label: 'Proud',
    emoji: '🥹',
    color: '#6BCB77',
    description: 'Feeling accomplished!',
    helpTip: 'You did something amazing! Be proud of yourself!',
  },
  {
    key: 'shy',
    label: 'Shy',
    emoji: '🫣',
    color: '#FD79A8',
    description: 'Feeling a little timid',
    helpTip: "It's okay to be shy. Take your time, you're doing great.",
  },
  {
    key: 'grateful',
    label: 'Grateful',
    emoji: '🥰',
    color: '#E879F9',
    description: 'Feeling thankful',
    helpTip: 'Being grateful makes the world brighter! What are you thankful for?',
  },
];
