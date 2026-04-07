export interface ColoringCategory {
  key: string;
  label: string;
  emoji: string;
}

export interface ColoringTemplate {
  id: string;
  title: string;
  emoji: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  svgOutline: string;
}

export const coloringCategories: ColoringCategory[] = [
  { key: 'animals', label: 'Animals', emoji: '🐱' },
  { key: 'alphabet', label: 'Alphabet', emoji: '🔤' },
  { key: 'numbers', label: 'Numbers', emoji: '🔢' },
  { key: 'holidays', label: 'Holidays', emoji: '🎄' },
  { key: 'nature', label: 'Nature', emoji: '🌸' },
  { key: 'emotions', label: 'Emotions', emoji: '😊' },
];

export const coloringTemplates: ColoringTemplate[] = [
  // ── Animals ──────────────────────────────────────────────
  {
    id: 'cat',
    title: 'Cat',
    emoji: '🐱',
    category: 'animals',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="120" rx="50" ry="45" fill="none" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="100" cy="75" rx="35" ry="30" fill="none" stroke="#333" stroke-width="2.5"/>
      <polygon points="72,55 65,30 85,48" fill="none" stroke="#333" stroke-width="2.5"/>
      <polygon points="128,55 135,30 115,48" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="88" cy="70" r="3" fill="#333"/>
      <circle cx="112" cy="70" r="3" fill="#333"/>
      <ellipse cx="100" cy="80" rx="4" ry="3" fill="#333"/>
      <path d="M92,85 Q100,92 108,85" fill="none" stroke="#333" stroke-width="1.5"/>
      <line x1="70" y1="75" x2="55" y2="70" stroke="#333" stroke-width="1.5"/>
      <line x1="70" y1="80" x2="55" y2="82" stroke="#333" stroke-width="1.5"/>
      <line x1="130" y1="75" x2="145" y2="70" stroke="#333" stroke-width="1.5"/>
      <line x1="130" y1="80" x2="145" y2="82" stroke="#333" stroke-width="1.5"/>
      <path d="M145,140 Q160,150 155,170" fill="none" stroke="#333" stroke-width="2.5"/>
    </svg>`,
  },
  {
    id: 'fish',
    title: 'Fish',
    emoji: '🐟',
    category: 'animals',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="90" cy="100" rx="60" ry="35" fill="none" stroke="#333" stroke-width="2.5"/>
      <polygon points="150,100 185,75 185,125" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="65" cy="92" r="5" fill="#333"/>
      <path d="M40,100 Q50,110 60,100" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M80,70 Q90,85 100,70" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M80,130 Q90,115 100,130" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },

  // ── Alphabet ─────────────────────────────────────────────
  {
    id: 'letter-a',
    title: 'Letter A',
    emoji: '🅰️',
    category: 'alphabet',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M40,170 L100,30 L160,170" fill="none" stroke="#333" stroke-width="3"/>
      <line x1="62" y1="120" x2="138" y2="120" stroke="#333" stroke-width="3"/>
    </svg>`,
  },
  {
    id: 'letter-b',
    title: 'Letter B',
    emoji: '🅱️',
    category: 'alphabet',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <line x1="60" y1="30" x2="60" y2="170" stroke="#333" stroke-width="3"/>
      <path d="M60,30 Q140,30 140,65 Q140,100 60,100" fill="none" stroke="#333" stroke-width="3"/>
      <path d="M60,100 Q150,100 150,135 Q150,170 60,170" fill="none" stroke="#333" stroke-width="3"/>
    </svg>`,
  },

  // ── Numbers ──────────────────────────────────────────────
  {
    id: 'number-1',
    title: 'Number 1',
    emoji: '1️⃣',
    category: 'numbers',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M80,60 L110,30 L110,170" fill="none" stroke="#333" stroke-width="3"/>
      <line x1="75" y1="170" x2="145" y2="170" stroke="#333" stroke-width="3"/>
    </svg>`,
  },
  {
    id: 'number-2',
    title: 'Number 2',
    emoji: '2️⃣',
    category: 'numbers',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M55,70 Q55,30 100,30 Q145,30 145,70 Q145,100 55,160 L55,170 L145,170" fill="none" stroke="#333" stroke-width="3"/>
    </svg>`,
  },

  // ── Holidays ─────────────────────────────────────────────
  {
    id: 'star',
    title: 'Star',
    emoji: '⭐',
    category: 'holidays',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <polygon points="100,20 120,75 180,80 135,118 148,175 100,145 52,175 65,118 20,80 80,75" fill="none" stroke="#333" stroke-width="2.5"/>
    </svg>`,
  },
  {
    id: 'heart',
    title: 'Heart',
    emoji: '❤️',
    category: 'holidays',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M100,170 Q20,120 20,70 Q20,30 60,30 Q80,30 100,55 Q120,30 140,30 Q180,30 180,70 Q180,120 100,170Z" fill="none" stroke="#333" stroke-width="2.5"/>
    </svg>`,
  },

  // ── Nature ───────────────────────────────────────────────
  {
    id: 'flower',
    title: 'Flower',
    emoji: '🌸',
    category: 'nature',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="85" r="15" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="100" cy="55" r="18" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="130" cy="72" r="18" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="125" cy="105" r="18" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="75" cy="105" r="18" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="70" cy="72" r="18" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="100" y1="105" x2="100" y2="180" stroke="#333" stroke-width="2.5"/>
      <path d="M100,140 Q80,130 70,145" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M100,155 Q120,145 130,158" fill="none" stroke="#333" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'tree',
    title: 'Tree',
    emoji: '🌲',
    category: 'nature',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="88" y="135" width="24" height="45" fill="none" stroke="#333" stroke-width="2.5"/>
      <polygon points="100,20 45,90 70,90 35,135 165,135 130,90 155,90" fill="none" stroke="#333" stroke-width="2.5"/>
    </svg>`,
  },

  // ── Emotions ─────────────────────────────────────────────
  {
    id: 'smiley',
    title: 'Smiley Face',
    emoji: '😊',
    category: 'emotions',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="75" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="75" cy="82" r="6" fill="#333"/>
      <circle cx="125" cy="82" r="6" fill="#333"/>
      <path d="M68,120 Q100,155 132,120" fill="none" stroke="#333" stroke-width="2.5"/>
    </svg>`,
  },
  {
    id: 'surprised',
    title: 'Surprised Face',
    emoji: '😮',
    category: 'emotions',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="75" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="75" cy="80" r="8" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="125" cy="80" r="8" fill="none" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="100" cy="135" rx="15" ry="20" fill="none" stroke="#333" stroke-width="2.5"/>
    </svg>`,
  },
];
