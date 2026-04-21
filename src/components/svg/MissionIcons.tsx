/**
 * MissionIcons — Illustrated SVG icons for daily mission cards.
 * Each icon replaces the OS emoji with a consistent, warm, kid-friendly illustration.
 * Sized for 40×40 display inside MissionCard's emoji circle.
 */
import { type ReactNode } from 'react';

// ── watch-video (🎬) ──────────────────────────────────────

function IconWatchVideo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect x="4" y="8" width="24" height="18" rx="3" fill="#A78BFA" />
      <rect x="5" y="9" width="22" height="16" rx="2" fill="#1A1040" opacity="0.8" />
      {/* Play triangle */}
      <polygon points="13,14 13,26 23,20" fill="white" opacity="0.9" />
      {/* Film reel */}
      <path d="M30 10 L36 7 L36 27 L30 24Z" fill="#8B5CF6" />
      {/* Sparkle */}
      <circle cx="34" cy="32" r="2" fill="#FFE66D" opacity="0.6" />
    </svg>
  );
}

// ── do-alphabet (🔤) ──────────────────────────────────────

function IconAlphabet() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      {/* Letter block A */}
      <rect x="3" y="6" width="18" height="18" rx="3" fill="#FF6B6B" />
      <text x="12" y="20" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">A</text>
      {/* Letter block B */}
      <rect x="19" y="16" width="18" height="18" rx="3" fill="#4ECDC4" />
      <text x="28" y="30" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">B</text>
      {/* Tiny star */}
      <circle cx="34" cy="8" r="2.5" fill="#FFE66D" />
    </svg>
  );
}

// ── dance-2min (💃) ───────────────────────────────────────

function IconDance() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      {/* Body */}
      <circle cx="20" cy="8" r="5" fill="#FFE0B2" />
      <line x1="20" y1="13" x2="20" y2="26" stroke="#FF8FAB" strokeWidth="3" strokeLinecap="round" />
      {/* Arms up dancing */}
      <line x1="20" y1="17" x2="12" y2="10" stroke="#FFE0B2" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="20" y1="17" x2="28" y2="10" stroke="#FFE0B2" strokeWidth="2.5" strokeLinecap="round" />
      {/* Legs */}
      <line x1="20" y1="26" x2="14" y2="36" stroke="#4ECDC4" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="20" y1="26" x2="26" y2="36" stroke="#4ECDC4" strokeWidth="2.5" strokeLinecap="round" />
      {/* Music notes */}
      <g transform="translate(30, 6)">
        <circle cx="0" cy="4" r="2" fill="#A78BFA" />
        <line x1="2" y1="4" x2="2" y2="-4" stroke="#A78BFA" strokeWidth="1.5" />
        <path d="M2 -4 Q6 -6 6 -2" stroke="#A78BFA" strokeWidth="1.5" fill="none" />
      </g>
      <g transform="translate(6, 18)" opacity="0.6">
        <circle cx="0" cy="4" r="1.5" fill="#FF8C42" />
        <line x1="1.5" y1="4" x2="1.5" y2="-2" stroke="#FF8C42" strokeWidth="1" />
      </g>
    </svg>
  );
}

// ── listen-story (📖) ─────────────────────────────────────

function IconStory() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      {/* Open book */}
      <path d="M5 10 C5 10 11 7 20 7 C29 7 35 10 35 10 V32 C35 32 29 29 20 29 C11 29 5 32 5 32 V10Z" fill="#A78BFA" opacity="0.2" />
      <path d="M5 10 C5 10 11 7 20 7 V29 C11 29 5 32 5 32 V10Z" fill="#C4AAFF" opacity="0.3" />
      <path d="M35 10 C35 10 29 7 20 7 V29 C29 29 35 32 35 32 V10Z" fill="#A78BFA" opacity="0.4" />
      {/* Spine */}
      <line x1="20" y1="7" x2="20" y2="29" stroke="#8B5CF6" strokeWidth="1" opacity="0.4" />
      {/* Text lines */}
      <line x1="9" y1="14" x2="17" y2="14" stroke="#8B5CF6" strokeWidth="1" opacity="0.3" />
      <line x1="9" y1="18" x2="16" y2="18" stroke="#8B5CF6" strokeWidth="1" opacity="0.25" />
      <line x1="9" y1="22" x2="15" y2="22" stroke="#8B5CF6" strokeWidth="1" opacity="0.2" />
      <line x1="23" y1="14" x2="31" y2="14" stroke="#8B5CF6" strokeWidth="1" opacity="0.3" />
      <line x1="23" y1="18" x2="30" y2="18" stroke="#8B5CF6" strokeWidth="1" opacity="0.25" />
      {/* Sparkle */}
      <circle cx="33" cy="5" r="2" fill="#FFE66D" opacity="0.7" />
      <circle cx="7" cy="35" r="1.5" fill="#FFE66D" opacity="0.5" />
    </svg>
  );
}

// ── emotion-checkin (💚) ──────────────────────────────────

function IconEmotionCheckin() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      {/* Big green heart */}
      <path d="M20 35 C20 35 4 25 4 14 C4 8 9 4 14 4 C17 4 19 6 20 8 C21 6 23 4 26 4 C31 4 36 8 36 14 C36 25 20 35 20 35Z" fill="#6BCB77" />
      <path d="M20 32 C20 32 7 23 7 14 C7 9 11 6 15 6 C17 6 19 7.5 20 9.5 C21 7.5 23 6 25 6 C29 6 33 9 33 14 C33 23 20 32 20 32Z" fill="#7DD88A" opacity="0.5" />
      {/* Smiley in heart */}
      <circle cx="16" cy="16" r="1.5" fill="white" />
      <circle cx="24" cy="16" r="1.5" fill="white" />
      <path d="M16 21 Q20 25 24 21" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── draw-picture (🎨) ─────────────────────────────────────

function IconDraw() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      {/* Palette */}
      <ellipse cx="20" cy="22" rx="16" ry="13" fill="#FFE0B2" />
      <ellipse cx="20" cy="22" rx="14" ry="11" fill="#FFF3E0" />
      {/* Paint dots */}
      <circle cx="12" cy="18" r="3" fill="#FF6B6B" />
      <circle cx="20" cy="14" r="3" fill="#FFE66D" />
      <circle cx="28" cy="18" r="3" fill="#4ECDC4" />
      <circle cx="14" cy="26" r="3" fill="#A78BFA" />
      <circle cx="24" cy="28" r="2.5" fill="#6BCB77" />
      {/* Thumb hole */}
      <ellipse cx="22" cy="22" rx="3" ry="2.5" fill="#FFE0B2" stroke="#D4A050" strokeWidth="0.5" />
      {/* Paintbrush */}
      <line x1="30" y1="8" x2="36" y2="2" stroke="#8B6914" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="29" cy="9" rx="2.5" ry="4" fill="#FF6B6B" transform="rotate(-45, 29, 9)" />
    </svg>
  );
}

// ── do-quiz (❓) ──────────────────────────────────────────

function IconQuiz() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      {/* Question card */}
      <rect x="6" y="4" width="28" height="32" rx="5" fill="#FF8C42" />
      <rect x="8" y="6" width="24" height="28" rx="4" fill="#FFF3E0" />
      {/* Big question mark */}
      <text x="20" y="28" textAnchor="middle" fill="#FF8C42" fontSize="22" fontWeight="bold" fontFamily="sans-serif">?</text>
      {/* Small stars */}
      <circle cx="32" cy="6" r="2" fill="#FFE66D" />
      <circle cx="6" cy="34" r="1.5" fill="#FFE66D" opacity="0.6" />
    </svg>
  );
}

// ── learn-numbers (🔢) ────────────────────────────────────

function IconNumbers() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      {/* Number blocks */}
      <rect x="2" y="4" width="16" height="16" rx="3" fill="#4ECDC4" />
      <text x="10" y="16" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="sans-serif">1</text>
      <rect x="22" y="4" width="16" height="16" rx="3" fill="#FFE66D" />
      <text x="30" y="16" textAnchor="middle" fill="#8B6914" fontSize="12" fontWeight="bold" fontFamily="sans-serif">2</text>
      <rect x="12" y="22" width="16" height="16" rx="3" fill="#FF6B6B" />
      <text x="20" y="34" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="sans-serif">3</text>
    </svg>
  );
}

// ── explore-animals (🐾) ──────────────────────────────────

function IconAnimals() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      {/* Paw print */}
      <ellipse cx="20" cy="24" rx="8" ry="7" fill="#8B6914" opacity="0.8" />
      {/* Toe beans */}
      <ellipse cx="12" cy="14" rx="4" ry="4.5" fill="#8B6914" opacity="0.8" />
      <ellipse cx="20" cy="11" rx="4" ry="4.5" fill="#8B6914" opacity="0.8" />
      <ellipse cx="28" cy="14" rx="4" ry="4.5" fill="#8B6914" opacity="0.8" />
      {/* Inner paw highlight */}
      <ellipse cx="20" cy="24" rx="5" ry="4.5" fill="#C0956A" opacity="0.5" />
      <ellipse cx="12" cy="14" rx="2.5" ry="3" fill="#C0956A" opacity="0.4" />
      <ellipse cx="20" cy="11" rx="2.5" ry="3" fill="#C0956A" opacity="0.4" />
      <ellipse cx="28" cy="14" rx="2.5" ry="3" fill="#C0956A" opacity="0.4" />
      {/* Sparkle */}
      <circle cx="34" cy="6" r="2" fill="#FFE66D" opacity="0.6" />
    </svg>
  );
}

// ── try-recipe (🍪) ───────────────────────────────────────

function IconRecipe() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      {/* Cookie */}
      <circle cx="20" cy="20" r="14" fill="#D4A050" />
      <circle cx="20" cy="20" r="12" fill="#E8B960" />
      {/* Chocolate chips */}
      <circle cx="14" cy="15" r="2" fill="#5D4037" />
      <circle cx="24" cy="13" r="2" fill="#5D4037" />
      <circle cx="18" cy="23" r="2" fill="#5D4037" />
      <circle cx="26" cy="22" r="1.5" fill="#5D4037" />
      <circle cx="14" cy="26" r="1.5" fill="#5D4037" />
      {/* Crumble texture */}
      <circle cx="20" cy="18" r="1" fill="#D4A050" opacity="0.5" />
      <circle cx="28" cy="17" r="0.8" fill="#D4A050" opacity="0.4" />
      {/* Steam */}
      <path d="M15 4 Q16 2 17 4" stroke="#9B9BAB" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M22 3 Q23 1 24 3" stroke="#9B9BAB" strokeWidth="1" fill="none" opacity="0.3" />
    </svg>
  );
}

// ── bedtime-breathing (🌙) ────────────────────────────────

function IconBedtime() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      {/* Night circle */}
      <circle cx="20" cy="20" r="16" fill="#1A1040" />
      {/* Crescent moon */}
      <circle cx="18" cy="16" r="10" fill="#FFE66D" />
      <circle cx="22" cy="14" r="10" fill="#1A1040" />
      {/* Stars */}
      <circle cx="30" cy="12" r="1.5" fill="#FFE66D" opacity="0.8" />
      <circle cx="28" cy="22" r="1" fill="#FFE66D" opacity="0.6" />
      <circle cx="32" cy="18" r="0.8" fill="#FFE66D" opacity="0.5" />
      <circle cx="26" cy="28" r="1.2" fill="#C4AAFF" opacity="0.5" />
      {/* Zzz */}
      <circle cx="28" cy="28" r="1.5" fill="#C4AAFF" opacity="0.5" />
      <circle cx="31" cy="24" r="1" fill="#C4AAFF" opacity="0.35" />
    </svg>
  );
}

// ── world-explorer (🌍) ───────────────────────────────────

function IconExplorer() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      {/* Globe */}
      <circle cx="20" cy="20" r="15" fill="#45B7D1" />
      <circle cx="20" cy="20" r="13" fill="#87CEEB" opacity="0.4" />
      {/* Land masses (simplified) */}
      <ellipse cx="16" cy="14" rx="6" ry="5" fill="#6BCB77" />
      <ellipse cx="24" cy="22" rx="7" ry="5" fill="#6BCB77" />
      <ellipse cx="14" cy="25" rx="4" ry="3" fill="#6BCB77" opacity="0.7" />
      {/* Grid lines */}
      <ellipse cx="20" cy="20" rx="15" ry="15" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
      <ellipse cx="20" cy="20" rx="8" ry="15" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
      <line x1="5" y1="20" x2="35" y2="20" stroke="white" strokeWidth="0.5" opacity="0.2" />
      {/* Magnifying glass / compass hint */}
      <circle cx="32" cy="8" r="2" fill="#FFE66D" opacity="0.7" />
    </svg>
  );
}

// ── Icon map ──────────────────────────────────────────────

const missionIconMap: Record<string, () => ReactNode> = {
  'watch-video': IconWatchVideo,
  'do-alphabet': IconAlphabet,
  'dance-2min': IconDance,
  'listen-story': IconStory,
  'emotion-checkin': IconEmotionCheckin,
  'draw-picture': IconDraw,
  'do-quiz': IconQuiz,
  'learn-numbers': IconNumbers,
  'explore-animals': IconAnimals,
  'try-recipe': IconRecipe,
  'bedtime-breathing': IconBedtime,
  'world-explorer': IconExplorer,
};

/**
 * Get the illustrated SVG icon for a mission type.
 * Returns the icon element or null if no icon exists.
 */
export function getMissionIcon(missionType: string): ReactNode | null {
  const Icon = missionIconMap[missionType];
  return Icon ? <Icon /> : null;
}

/**
 * Get list of mission types that have icons.
 */
export function getIconizedMissionTypes(): string[] {
  return Object.keys(missionIconMap);
}
