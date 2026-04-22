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
  /** Path to generated clean line-art template image */
  templateSrc?: string;
  /** Path to generated preview thumbnail for the card */
  previewSrc?: string;
}

export const coloringCategories: ColoringCategory[] = [
  { key: 'animals', label: 'Animals', emoji: '🐱' },
  { key: 'vehicles', label: 'Vehicles', emoji: '🚗' },
  { key: 'nature', label: 'Nature', emoji: '🌸' },
  { key: 'fantasy', label: 'Fantasy', emoji: '🏰' },
  { key: 'food', label: 'Food', emoji: '🧁' },
  { key: 'patterns', label: 'Patterns', emoji: '✨' },
  { key: 'holidays', label: 'Holidays', emoji: '🎄' },
  { key: 'alphabet', label: 'Alphabet', emoji: '🔤' },
  { key: 'numbers', label: 'Numbers', emoji: '🔢' },
  { key: 'emotions', label: 'Emotions', emoji: '😊' },
];

import { premiumTemplates } from './premiumTemplates';
import { openSourceTemplates } from './openSourceTemplates';

// Best templates first: open-source detailed → premium originals → simple originals
export const coloringTemplates: ColoringTemplate[] = [
  ...openSourceTemplates,
  ...premiumTemplates,
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

  // ── Cute Animals (scenes) ───────────────────────────────
  {
    id: 'bunny-garden',
    title: 'Bunny in Garden',
    emoji: '🐰',
    category: 'animals',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="200" rx="100" ry="30" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="100" cy="130" rx="30" ry="25" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="100" cy="100" r="22" fill="none" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="88" cy="70" rx="7" ry="22" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="112" cy="70" rx="7" ry="22" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="92" cy="96" r="3" fill="#333"/><circle cx="108" cy="96" r="3" fill="#333"/>
      <ellipse cx="100" cy="105" rx="3" ry="2" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="40" cy="160" rx="12" ry="8" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="40" y1="152" x2="40" y2="140" stroke="#333" stroke-width="2"/>
      <circle cx="160" cy="155" rx="10" ry="7" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="160" y1="148" x2="160" y2="136" stroke="#333" stroke-width="2"/>
      <circle cx="30" cy="175" r="6" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="170" cy="172" r="5" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'elephant',
    title: 'Baby Elephant',
    emoji: '🐘',
    category: 'animals',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="105" cy="120" rx="55" ry="45" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="70" cy="85" r="30" fill="none" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="50" cy="80" rx="15" ry="20" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M55 105 Q45 130 50 150 Q55 155 60 150 Q62 135 60 115" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="62" cy="80" r="4" fill="#333"/>
      <circle cx="80" cy="78" r="3" fill="#333"/>
      <rect x="70" y="155" width="12" height="25" rx="4" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="90" y="155" width="12" height="25" rx="4" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="115" y="155" width="12" height="25" rx="4" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="135" y="155" width="12" height="25" rx="4" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M155 115 Q165 110 160 120" fill="none" stroke="#333" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'butterfly-scene',
    title: 'Butterfly Garden',
    emoji: '🦋',
    category: 'animals',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="80" rx="3" ry="15" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="78" cy="70" rx="20" ry="15" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="122" cy="70" rx="20" ry="15" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="82" cy="90" rx="15" ry="12" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="118" cy="90" rx="15" ry="12" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="95" y1="65" x2="85" y2="50" stroke="#333" stroke-width="1.5"/>
      <line x1="105" y1="65" x2="115" y2="50" stroke="#333" stroke-width="1.5"/>
      <circle cx="85" cy="48" r="3" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="115" cy="48" r="3" fill="none" stroke="#333" stroke-width="1.5"/>
      <line x1="50" y1="170" x2="50" y2="130" stroke="#333" stroke-width="2"/>
      <circle cx="50" cy="125" r="10" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="100" y1="170" x2="100" y2="125" stroke="#333" stroke-width="2"/>
      <circle cx="100" cy="120" r="8" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="150" y1="170" x2="150" y2="135" stroke="#333" stroke-width="2"/>
      <circle cx="150" cy="130" r="10" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="0" y1="175" x2="200" y2="175" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'turtle',
    title: 'Happy Turtle',
    emoji: '🐢',
    category: 'animals',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="110" rx="55" ry="35" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M100 80 Q80 70 60 80 Q50 90 55 100" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M100 80 Q120 70 140 80 Q150 90 145 100" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M80 80 L100 65 L120 80" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="50" cy="100" r="12" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="44" cy="97" r="3" fill="#333"/>
      <path d="M38 103 Q34 105 38 107" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="60" cy="140" rx="10" ry="6" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="140" cy="140" rx="10" ry="6" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M150 115 Q170 118 160 125" fill="none" stroke="#333" stroke-width="2"/>
    </svg>`,
  },

  // ── Vehicles & Adventure ────────────────────────────────
  {
    id: 'rocket-ship',
    title: 'Rocket Ship',
    emoji: '🚀',
    category: 'vehicles',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 15 Q85 40 80 80 L80 140 Q80 155 90 160 L110 160 Q120 155 120 140 L120 80 Q115 40 100 15Z" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="100" cy="90" r="12" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M80 120 L60 150 L80 140" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M120 120 L140 150 L120 140" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M90 160 Q95 175 100 180 Q105 175 110 160" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="60" cy="30" r="4" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="150" cy="50" r="3" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="40" cy="80" r="2" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="165" cy="100" r="3" fill="none" stroke="#333" stroke-width="1"/>
    </svg>`,
  },
  {
    id: 'sailboat',
    title: 'Sailboat',
    emoji: '⛵',
    category: 'vehicles',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 140 L100 140 L160 140 L140 170 L60 170Z" fill="none" stroke="#333" stroke-width="2.5"/>
      <line x1="100" y1="140" x2="100" y2="40" stroke="#333" stroke-width="2.5"/>
      <path d="M100 40 L155 130 L100 130Z" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M100 55 L60 130 L100 130Z" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M10 175 Q50 165 100 175 Q150 185 190 175" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M5 190 Q50 180 100 190 Q150 200 195 190" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="170" cy="40" r="15" fill="none" stroke="#333" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'train',
    title: 'Choo-Choo Train',
    emoji: '🚂',
    category: 'vehicles',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="80" width="70" height="60" rx="5" fill="none" stroke="#333" stroke-width="2.5"/>
      <rect x="100" y="100" width="50" height="40" rx="3" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="160" y="100" width="30" height="40" rx="3" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="40" cy="150" r="12" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="70" cy="150" r="12" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="125" cy="150" r="10" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="175" cy="150" r="10" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="35" y="90" width="20" height="15" rx="2" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="65" y="90" width="15" height="15" rx="2" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M30 80 L30 55 Q30 45 40 45 L50 45 Q55 45 55 55 L55 80" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="0" y1="162" x2="200" y2="162" stroke="#333" stroke-width="2"/>
    </svg>`,
  },

  // ── Nature Scenes ───────────────────────────────────────
  {
    id: 'treehouse',
    title: 'Treehouse',
    emoji: '🌳',
    category: 'nature',
    difficulty: 'hard',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="85" y="90" width="30" height="90" rx="3" fill="none" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="100" cy="55" rx="55" ry="45" fill="none" stroke="#333" stroke-width="2.5"/>
      <rect x="60" y="60" width="40" height="30" rx="3" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="70" y="68" width="10" height="12" rx="1" fill="none" stroke="#333" stroke-width="1.5"/>
      <rect x="84" y="68" width="10" height="12" rx="1" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M55 60 L80 42 L105 60" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="100" y1="90" x2="130" y2="140" stroke="#333" stroke-width="2"/>
      <line x1="125" y1="130" x2="135" y2="130" stroke="#333" stroke-width="2"/>
      <line x1="120" y1="120" x2="130" y2="120" stroke="#333" stroke-width="2"/>
      <line x1="115" y1="110" x2="125" y2="110" stroke="#333" stroke-width="2"/>
      <ellipse cx="100" cy="190" rx="80" ry="12" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'rainbow-scene',
    title: 'Rainbow Landscape',
    emoji: '🌈',
    category: 'nature',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 150 A80 80 0 0 1 180 150" fill="none" stroke="#333" stroke-width="3"/>
      <path d="M30 150 A70 70 0 0 1 170 150" fill="none" stroke="#333" stroke-width="3"/>
      <path d="M40 150 A60 60 0 0 1 160 150" fill="none" stroke="#333" stroke-width="3"/>
      <path d="M50 150 A50 50 0 0 1 150 150" fill="none" stroke="#333" stroke-width="3"/>
      <path d="M60 150 A40 40 0 0 1 140 150" fill="none" stroke="#333" stroke-width="3"/>
      <ellipse cx="35" cy="90" rx="25" ry="12" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="20" cy="94" rx="16" ry="9" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="170" cy="50" r="18" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="100" cy="190" rx="100" ry="18" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="50" cy="175" r="5" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="150" cy="178" r="4" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'ocean-scene',
    title: 'Under the Sea',
    emoji: '🐠',
    category: 'nature',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 40 Q50 30 100 40 Q150 50 200 40" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="70" cy="90" rx="25" ry="14" fill="none" stroke="#333" stroke-width="2.5"/>
      <polygon points="95,90 115,75 115,105" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="58" cy="86" r="4" fill="#333"/>
      <ellipse cx="150" cy="130" rx="18" ry="10" fill="none" stroke="#333" stroke-width="2"/>
      <polygon points="168,130 182,120 182,140" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="142" cy="127" r="3" fill="#333"/>
      <path d="M30 160 Q35 140 40 160 Q45 180 50 160" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M80 165 Q85 145 90 165 Q95 185 100 165" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M140 170 Q145 155 150 170 Q155 185 160 170" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="120" cy="60" r="3" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="30" cy="110" r="2" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="170" cy="80" r="4" fill="none" stroke="#333" stroke-width="1"/>
    </svg>`,
  },

  // ── Fantasy & Magic ─────────────────────────────────────
  {
    id: 'castle',
    title: 'Magic Castle',
    emoji: '🏰',
    category: 'fantasy',
    difficulty: 'hard',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="80" width="100" height="100" fill="none" stroke="#333" stroke-width="2.5"/>
      <rect x="30" y="60" width="25" height="120" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="145" y="60" width="25" height="120" fill="none" stroke="#333" stroke-width="2"/>
      <polygon points="30,60 42,35 55,60" fill="none" stroke="#333" stroke-width="2"/>
      <polygon points="145,60 157,35 170,60" fill="none" stroke="#333" stroke-width="2"/>
      <polygon points="50,80 100,50 150,80" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="85" y="140" width="30" height="40" rx="15" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="60" y="95" width="15" height="18" rx="2" fill="none" stroke="#333" stroke-width="1.5"/>
      <rect x="125" y="95" width="15" height="18" rx="2" fill="none" stroke="#333" stroke-width="1.5"/>
      <rect x="90" y="90" width="20" height="20" rx="10" fill="none" stroke="#333" stroke-width="1.5"/>
      <line x1="0" y1="180" x2="200" y2="180" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'unicorn',
    title: 'Unicorn',
    emoji: '🦄',
    category: 'fantasy',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="110" cy="110" rx="50" ry="35" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="60" cy="85" r="25" fill="none" stroke="#333" stroke-width="2.5"/>
      <line x1="55" y1="60" x2="50" y2="30" stroke="#333" stroke-width="2.5"/>
      <polygon points="47,32 50,15 56,30" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="42" cy="68" rx="8" ry="12" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="52" cy="80" r="3" fill="#333"/>
      <path d="M45 92 Q40 95 45 98" fill="none" stroke="#333" stroke-width="1.5"/>
      <rect x="75" y="140" width="10" height="30" rx="3" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="95" y="140" width="10" height="30" rx="3" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="120" y="140" width="10" height="30" rx="3" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="140" y="140" width="10" height="30" rx="3" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M155 105 Q175 100 170 115 Q165 125 155 115" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M80 100 Q75 85 85 88" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'dragon',
    title: 'Friendly Dragon',
    emoji: '🐉',
    category: 'fantasy',
    difficulty: 'hard',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="110" cy="120" rx="45" ry="35" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="65" cy="90" r="25" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="55" cy="84" r="4" fill="#333"/><circle cx="72" cy="84" r="4" fill="#333"/>
      <path d="M60 100 Q65 105 70 100" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M48 70 L40 55 L52 65" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M78 70 L85 55 L75 65" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M80 105 Q60 115 55 130 Q52 140 65 135 Q75 130 80 115" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M150 110 Q170 105 180 115 Q175 120 165 115 Q170 125 160 120" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="85" y="150" width="12" height="25" rx="4" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="110" y="150" width="12" height="25" rx="4" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="130" y="150" width="12" height="25" rx="4" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M95 95 L100 80 L105 95 L110 78 L115 95" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },

  // ── Patterns ────────────────────────────────────────────
  {
    id: 'mandala-simple',
    title: 'Simple Mandala',
    emoji: '✨',
    category: 'patterns',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="85" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="100" cy="100" r="65" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="100" cy="100" r="45" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="100" cy="100" r="25" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="100" cy="100" r="10" fill="none" stroke="#333" stroke-width="2"/>
      ${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<line x1="100" y1="100" x2="${100 + 85 * Math.cos(a * Math.PI / 180)}" y2="${100 + 85 * Math.sin(a * Math.PI / 180)}" stroke="#333" stroke-width="1.5"/>`).join('')}
      ${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<circle cx="${100 + 55 * Math.cos(a * Math.PI / 180)}" cy="${100 + 55 * Math.sin(a * Math.PI / 180)}" r="6" fill="none" stroke="#333" stroke-width="1.5"/>`).join('')}
      ${[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map(a => `<circle cx="${100 + 75 * Math.cos(a * Math.PI / 180)}" cy="${100 + 75 * Math.sin(a * Math.PI / 180)}" r="4" fill="none" stroke="#333" stroke-width="1.5"/>`).join('')}
    </svg>`,
  },
  {
    id: 'hearts-pattern',
    title: 'Hearts Pattern',
    emoji: '💕',
    category: 'patterns',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 60C100 50 110 40 120 40C130 40 140 50 140 60C140 80 100 100 100 100C100 100 60 80 60 60C60 50 70 40 80 40C90 40 100 50 100 60Z" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M50 130C50 124 55 120 60 120C65 120 70 124 70 130C70 140 50 148 50 148C50 148 30 140 30 130C30 124 35 120 40 120C45 120 50 124 50 130Z" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M150 130C150 124 155 120 160 120C165 120 170 124 170 130C170 140 150 148 150 148C150 148 130 140 130 130C130 124 135 120 140 120C145 120 150 124 150 130Z" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M100 170C100 166 103 163 106 163C109 163 112 166 112 170C112 176 100 180 100 180C100 180 88 176 88 170C88 166 91 163 94 163C97 163 100 166 100 170Z" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="30" cy="50" r="3" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="170" cy="60" r="3" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="100" cy="140" r="2" fill="none" stroke="#333" stroke-width="1"/>
    </svg>`,
  },

  // ── Holidays / Seasonal ─────────────────────────────────
  {
    id: 'birthday-cake',
    title: 'Birthday Cake',
    emoji: '🎂',
    category: 'holidays',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="100" width="120" height="50" rx="5" fill="none" stroke="#333" stroke-width="2.5"/>
      <rect x="30" y="145" width="140" height="35" rx="5" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M40 100 Q100 85 160 100" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M30 145 Q100 132 170 145" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="70" y1="100" x2="70" y2="80" stroke="#333" stroke-width="2"/>
      <line x1="100" y1="100" x2="100" y2="75" stroke="#333" stroke-width="2"/>
      <line x1="130" y1="100" x2="130" y2="80" stroke="#333" stroke-width="2"/>
      <path d="M67 80 Q70 70 73 80" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M97 75 Q100 65 103 75" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M127 80 Q130 70 133 80" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M50 120 Q60 115 70 120 Q80 125 90 120 Q100 115 110 120 Q120 125 130 120 Q140 115 150 120" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'snowman',
    title: 'Snowman',
    emoji: '⛄',
    category: 'holidays',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="140" r="40" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="100" cy="85" r="30" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="100" cy="45" r="20" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="93" cy="40" r="3" fill="#333"/><circle cx="107" cy="40" r="3" fill="#333"/>
      <path d="M95 50 L100 55 L105 50" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="70" y1="85" x2="40" y2="70" stroke="#333" stroke-width="2.5"/>
      <line x1="130" y1="85" x2="160" y2="70" stroke="#333" stroke-width="2.5"/>
      <circle cx="100" cy="90" r="3" fill="#333"/>
      <circle cx="100" cy="105" r="3" fill="#333"/>
      <path d="M78 28 L100 25 L122 28 Q130 20 120 18 L100 15 L80 18 Q70 20 78 28Z" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="0" y1="180" x2="200" y2="180" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },

  // ══════════════════════════════════════════════════════════
  // BATCH 2H — Full-canvas premium templates (viewBox 400x520)
  // All original work by dev team
  // ══════════════════════════════════════════════════════════

  {
    id: 'beach-car',
    title: 'Beach Car',
    emoji: '🏖️',
    category: 'vehicles',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="400" x2="370" y2="400" stroke="#333" stroke-width="2"/>
      <path d="M60 340 L60 290 Q60 270 80 260 L180 240 Q200 235 220 240 L320 260 Q340 265 340 285 L340 340Z" fill="none" stroke="#333" stroke-width="3"/>
      <path d="M100 260 L120 200 Q130 185 150 185 L250 185 Q270 185 280 200 L300 260" fill="none" stroke="#333" stroke-width="2.5"/>
      <line x1="200" y1="185" x2="200" y2="260" stroke="#333" stroke-width="2"/>
      <circle cx="120" cy="360" r="32" fill="none" stroke="#333" stroke-width="3"/>
      <circle cx="120" cy="360" r="16" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="280" cy="360" r="32" fill="none" stroke="#333" stroke-width="3"/>
      <circle cx="280" cy="360" r="16" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="80" y="290" width="40" height="20" rx="4" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="280" y="290" width="40" height="20" rx="4" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="150" y="150" width="60" height="8" rx="4" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="320" cy="150" rx="35" ry="60" fill="none" stroke="#333" stroke-width="2.5"/>
      <line x1="320" y1="90" x2="320" y2="210" stroke="#333" stroke-width="2"/>
      <line x1="285" y1="150" x2="355" y2="150" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="60" r="40" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M30 470 Q100 450 200 460 Q300 470 370 455" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M30 490 Q120 475 200 485 Q280 495 370 480" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'coffee-cup',
    title: 'Cozy Coffee',
    emoji: '☕',
    category: 'food',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 180 L90 420 Q90 450 120 450 L280 450 Q310 450 310 420 L300 180Z" fill="none" stroke="#333" stroke-width="3"/>
      <path d="M300 220 Q340 220 350 250 Q360 280 340 310 Q320 330 300 320" fill="none" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="200" cy="180" rx="105" ry="20" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M150 120 Q155 90 145 70" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
      <path d="M200 110 Q205 80 195 55" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
      <path d="M250 120 Q255 90 245 70" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
      <path d="M120 300 Q160 280 200 290 Q240 300 280 285" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M120 340 Q160 320 200 330 Q240 340 280 325" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="200" cy="480" rx="130" ry="10" fill="none" stroke="#333" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'cupcake-scene',
    title: 'Birthday Cupcake',
    emoji: '🧁',
    category: 'food',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <path d="M120 280 L100 440 Q100 460 130 460 L270 460 Q300 460 300 440 L280 280Z" fill="none" stroke="#333" stroke-width="3"/>
      <path d="M110 280 Q130 260 160 270 Q190 280 200 260 Q210 280 240 270 Q270 260 290 280" fill="none" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="200" cy="250" rx="100" ry="40" fill="none" stroke="#333" stroke-width="3"/>
      <path d="M140 250 Q160 220 180 240 Q200 220 220 240 Q240 220 260 250" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="200" y1="210" x2="200" y2="140" stroke="#333" stroke-width="2.5"/>
      <path d="M192 145 Q200 120 208 145" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="115" r="6" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M130 350 Q165 340 200 345 Q235 350 270 340" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M130 390 Q165 380 200 385 Q235 390 270 380" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="150" cy="80" r="8" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="260" cy="70" r="6" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="320" cy="120" r="5" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="80" cy="130" r="7" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'space-rocket',
    title: 'Rocket in Space',
    emoji: '🚀',
    category: 'vehicles',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <path d="M200 40 Q170 100 160 180 L160 350 Q160 380 180 390 L220 390 Q240 380 240 350 L240 180 Q230 100 200 40Z" fill="none" stroke="#333" stroke-width="3"/>
      <circle cx="200" cy="220" r="30" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="200" cy="220" r="18" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M160 280 L110 360 L160 340" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M240 280 L290 360 L240 340" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M180 390 Q190 430 200 440 Q210 430 220 390" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M170 390 Q185 440 200 460 Q215 440 230 390" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="180" y="300" width="40" height="15" rx="3" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="80" cy="80" r="6" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="320" cy="120" r="8" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="60" cy="250" r="4" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="340" cy="300" r="5" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="100" cy="400" r="7" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="310" cy="450" r="6" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="330" cy="200" rx="25" ry="20" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="325" cy="195" r="4" fill="none" stroke="#333" stroke-width="1"/>
    </svg>`,
  },
  {
    id: 'flower-bouquet',
    title: 'Flower Bouquet',
    emoji: '💐',
    category: 'nature',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <path d="M160 300 L140 480 Q140 490 160 490 L240 490 Q260 490 260 480 L240 300" fill="none" stroke="#333" stroke-width="3"/>
      <path d="M140 340 Q200 320 260 340" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M160 300 Q180 280 200 300 Q220 280 240 300" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="180" r="30" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="200" cy="180" r="15" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="145" cy="200" r="25" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="145" cy="200" r="12" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="255" cy="200" r="25" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="255" cy="200" r="12" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="130" cy="140" r="22" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="270" cy="140" r="22" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="170" cy="110" r="20" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="230" cy="110" r="20" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="95" r="18" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M180 300 L185 240" stroke="#333" stroke-width="2"/>
      <path d="M220 300 L215 240" stroke="#333" stroke-width="2"/>
      <path d="M160 300 L150 230" stroke="#333" stroke-width="2"/>
      <path d="M240 300 L250 230" stroke="#333" stroke-width="2"/>
      <path d="M200 300 L200 210" stroke="#333" stroke-width="2"/>
      <ellipse cx="120" cy="250" rx="15" ry="8" fill="none" stroke="#333" stroke-width="2" transform="rotate(-30 120 250)"/>
      <ellipse cx="280" cy="250" rx="15" ry="8" fill="none" stroke="#333" stroke-width="2" transform="rotate(30 280 250)"/>
    </svg>`,
  },
  {
    id: 'big-cat',
    title: 'Sleepy Cat',
    emoji: '🐱',
    category: 'animals',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="200" cy="330" rx="140" ry="90" fill="none" stroke="#333" stroke-width="3"/>
      <circle cx="200" cy="200" r="80" fill="none" stroke="#333" stroke-width="3"/>
      <polygon points="135,140 120,60 170,120" fill="none" stroke="#333" stroke-width="2.5"/>
      <polygon points="265,140 280,60 230,120" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="170" cy="190" r="12" fill="#333"/>
      <circle cx="230" cy="190" r="12" fill="#333"/>
      <circle cx="174" cy="186" r="4" fill="white"/>
      <circle cx="234" cy="186" r="4" fill="white"/>
      <ellipse cx="200" cy="220" rx="8" ry="6" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M185 232 Q200 248 215 232" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="140" y1="210" x2="80" y2="200" stroke="#333" stroke-width="2"/>
      <line x1="140" y1="220" x2="80" y2="225" stroke="#333" stroke-width="2"/>
      <line x1="260" y1="210" x2="320" y2="200" stroke="#333" stroke-width="2"/>
      <line x1="260" y1="220" x2="320" y2="225" stroke="#333" stroke-width="2"/>
      <path d="M330 310 Q370 300 360 340 Q350 370 330 350" fill="none" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="140" cy="400" rx="30" ry="18" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="260" cy="400" rx="30" ry="18" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="200" cy="450" rx="100" ry="10" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'fairy-castle',
    title: 'Fairy Castle',
    emoji: '🏰',
    category: 'fantasy',
    difficulty: 'hard',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <rect x="120" y="200" width="160" height="250" fill="none" stroke="#333" stroke-width="3"/>
      <rect x="60" y="160" width="50" height="290" fill="none" stroke="#333" stroke-width="2.5"/>
      <rect x="290" y="160" width="50" height="290" fill="none" stroke="#333" stroke-width="2.5"/>
      <polygon points="60,160 85,100 110,160" fill="none" stroke="#333" stroke-width="2.5"/>
      <polygon points="290,160 315,100 340,160" fill="none" stroke="#333" stroke-width="2.5"/>
      <polygon points="120,200 200,120 280,200" fill="none" stroke="#333" stroke-width="2.5"/>
      <rect x="175" y="360" width="50" height="90" rx="25" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="210" cy="400" r="4" fill="#333"/>
      <rect x="140" y="230" width="35" height="45" rx="4" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="225" y="230" width="35" height="45" rx="4" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="170" r="20" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="200" y1="150" x2="200" y2="190" stroke="#333" stroke-width="1.5"/>
      <line x1="180" y1="170" x2="220" y2="170" stroke="#333" stroke-width="1.5"/>
      <rect x="70" y="200" width="30" height="20" rx="3" fill="none" stroke="#333" stroke-width="1.5"/>
      <rect x="70" y="260" width="30" height="20" rx="3" fill="none" stroke="#333" stroke-width="1.5"/>
      <rect x="300" y="200" width="30" height="20" rx="3" fill="none" stroke="#333" stroke-width="1.5"/>
      <rect x="300" y="260" width="30" height="20" rx="3" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M80 100 L80 80 L90 80" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M90 100 L90 85" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M310 100 L310 80 L320 80" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M320 100 L320 85" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="30" y1="450" x2="370" y2="450" stroke="#333" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'big-unicorn',
    title: 'Magical Unicorn',
    emoji: '🦄',
    category: 'fantasy',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="220" cy="280" rx="100" ry="70" fill="none" stroke="#333" stroke-width="3"/>
      <circle cx="120" cy="200" r="55" fill="none" stroke="#333" stroke-width="3"/>
      <line x1="110" y1="145" x2="95" y2="60" stroke="#333" stroke-width="3"/>
      <polygon points="88,65 95,30 105,60" fill="none" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="85" cy="175" rx="18" ry="28" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="100" cy="195" r="8" fill="#333"/>
      <circle cx="103" cy="192" r="3" fill="white"/>
      <path d="M85 220 Q75 225 85 230" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M140 235 Q120 250 135 260" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="150" y="340" width="22" height="70" rx="6" fill="none" stroke="#333" stroke-width="2.5"/>
      <rect x="190" y="340" width="22" height="70" rx="6" fill="none" stroke="#333" stroke-width="2.5"/>
      <rect x="240" y="340" width="22" height="70" rx="6" fill="none" stroke="#333" stroke-width="2.5"/>
      <rect x="280" y="340" width="22" height="70" rx="6" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M315 270 Q350 260 345 290 Q340 310 315 295" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M155 255 Q140 235 160 230" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="60" cy="120" r="5" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="300" cy="150" r="6" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="350" cy="230" r="4" fill="none" stroke="#333" stroke-width="1"/>
      <line x1="30" y1="420" x2="370" y2="420" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'ocean-deep',
    title: 'Ocean Adventure',
    emoji: '🐠',
    category: 'nature',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 60 Q100 40 200 60 Q300 80 400 55" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="150" cy="180" rx="60" ry="35" fill="none" stroke="#333" stroke-width="3"/>
      <polygon points="210,180 250,150 250,210" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="125" cy="170" r="8" fill="#333"/>
      <path d="M120 195 Q135 205 150 195" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M130 160 Q150 150 170 160" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M130 195 Q150 205 170 195" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="300" cy="300" rx="45" ry="25" fill="none" stroke="#333" stroke-width="2.5"/>
      <polygon points="345,300 380,280 380,320" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="280" cy="293" r="6" fill="#333"/>
      <path d="M50 350 Q60 320 70 350 Q80 380 90 350" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M120 370 Q130 340 140 370 Q150 400 160 370" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M250 380 Q260 360 270 380 Q280 400 290 380" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M320 400 Q330 380 340 400 Q350 420 360 400" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="180" cy="460" rx="30" ry="8" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="70" cy="140" r="5" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="320" cy="160" r="8" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="50" cy="260" r="4" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="350" cy="450" r="6" fill="none" stroke="#333" stroke-width="1"/>
    </svg>`,
  },
  {
    id: 'big-mandala',
    title: 'Star Mandala',
    emoji: '✨',
    category: 'patterns',
    difficulty: 'hard',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="260" r="200" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="200" cy="260" r="160" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="260" r="120" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="260" r="80" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="260" r="40" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="260" r="15" fill="none" stroke="#333" stroke-width="2"/>
      ${[0,30,60,90,120,150,180,210,240,270,300,330].map(a => `<line x1="200" y1="260" x2="${200 + 200 * Math.cos(a * Math.PI / 180)}" y2="${260 + 200 * Math.sin(a * Math.PI / 180)}" stroke="#333" stroke-width="1.5"/>`).join('')}
      ${[0,30,60,90,120,150,180,210,240,270,300,330].map(a => `<circle cx="${200 + 100 * Math.cos(a * Math.PI / 180)}" cy="${260 + 100 * Math.sin(a * Math.PI / 180)}" r="12" fill="none" stroke="#333" stroke-width="1.5"/>`).join('')}
      ${[15,45,75,105,135,165,195,225,255,285,315,345].map(a => `<circle cx="${200 + 140 * Math.cos(a * Math.PI / 180)}" cy="${260 + 140 * Math.sin(a * Math.PI / 180)}" r="8" fill="none" stroke="#333" stroke-width="1.5"/>`).join('')}
      ${[0,60,120,180,240,300].map(a => `<ellipse cx="${200 + 60 * Math.cos(a * Math.PI / 180)}" cy="${260 + 60 * Math.sin(a * Math.PI / 180)}" rx="12" ry="6" fill="none" stroke="#333" stroke-width="1.5" transform="rotate(${a} ${200 + 60 * Math.cos(a * Math.PI / 180)} ${260 + 60 * Math.sin(a * Math.PI / 180)})"/>`).join('')}
    </svg>`,
  },
  {
    id: 'snow-window',
    title: 'Snow Window',
    emoji: '❄️',
    category: 'holidays',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="60" width="300" height="350" rx="8" fill="none" stroke="#333" stroke-width="3"/>
      <rect x="65" y="75" width="270" height="320" rx="4" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="200" y1="75" x2="200" y2="395" stroke="#333" stroke-width="2.5"/>
      <line x1="65" y1="235" x2="335" y2="235" stroke="#333" stroke-width="2.5"/>
      <rect x="60" y="410" width="280" height="30" rx="4" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="130" cy="155" r="5" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="280" cy="130" r="4" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="100" cy="300" r="6" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="260" cy="350" r="5" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="300" cy="200" r="3" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="150" cy="370" r="4" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="160" cy="480" r="25" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="160" cy="460" r="18" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="160" cy="445" r="12" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="155" cy="456" r="2" fill="#333"/><circle cx="165" cy="456" r="2" fill="#333"/>
      <path d="M156 462 Q160 465 164 462" fill="none" stroke="#333" stroke-width="1"/>
      <line x1="140" y1="460" x2="120" y2="455" stroke="#333" stroke-width="2"/>
      <line x1="180" y1="460" x2="200" y2="455" stroke="#333" stroke-width="2"/>
      <rect x="250" y="450" width="80" height="50" rx="4" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="260" y1="470" x2="320" y2="470" stroke="#333" stroke-width="1"/>
      <line x1="260" y1="480" x2="310" y2="480" stroke="#333" stroke-width="1"/>
    </svg>`,
  },
  {
    id: 'fruit-bowl',
    title: 'Fruit Bowl',
    emoji: '🍎',
    category: 'food',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <path d="M80 300 Q80 420 200 420 Q320 420 320 300" fill="none" stroke="#333" stroke-width="3"/>
      <ellipse cx="200" cy="300" rx="125" ry="20" fill="none" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="200" cy="440" rx="80" ry="10" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="160" cy="240" r="40" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M160 200 Q165 185 175 195" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="250" cy="250" rx="35" ry="30" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M245 220 Q260 205 265 215" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="200" cy="200" rx="30" ry="25" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M200 175 Q205 160 215 170" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M120 260 Q130 280 150 270" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="130" cy="280" rx="20" ry="15" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="270" cy="275" rx="18" ry="13" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="60" y1="470" x2="340" y2="470" stroke="#333" stroke-width="2"/>
    </svg>`,
  },
];
