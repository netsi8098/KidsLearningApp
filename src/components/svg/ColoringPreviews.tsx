/**
 * ColoringPreviews — Colorful SVG preview thumbnails for coloring template cards.
 * Shows a small, filled-in version of each template to replace the OS emoji.
 * Mapped by template ID.
 */
import { type ReactNode } from 'react';

// ── cat ──────────────────────────────────────────────────

function PreviewCat() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <ellipse cx="40" cy="50" rx="22" ry="18" fill="#FF8C42" />
      <circle cx="40" cy="33" r="16" fill="#FF8C42" />
      {/* Ears */}
      <polygon points="27,22 24,6 35,18" fill="#FF8C42" />
      <polygon points="53,22 56,6 45,18" fill="#FF8C42" />
      <polygon points="27,22 24,6 35,18" fill="#FFE0B2" opacity="0.5" />
      <polygon points="53,22 56,6 45,18" fill="#FFE0B2" opacity="0.5" />
      {/* Face */}
      <circle cx="34" cy="30" r="2.5" fill="#2D2D3A" />
      <circle cx="46" cy="30" r="2.5" fill="#2D2D3A" />
      <circle cx="35" cy="29" r="0.8" fill="white" />
      <circle cx="47" cy="29" r="0.8" fill="white" />
      <ellipse cx="40" cy="36" rx="2" ry="1.5" fill="#FFB6C1" />
      <path d="M37 38 Q40 42 43 38" stroke="#2D2D3A" strokeWidth="1" fill="none" />
      {/* Whiskers */}
      <line x1="28" y1="34" x2="18" y2="32" stroke="#2D2D3A" strokeWidth="0.8" opacity="0.5" />
      <line x1="28" y1="37" x2="18" y2="38" stroke="#2D2D3A" strokeWidth="0.8" opacity="0.5" />
      <line x1="52" y1="34" x2="62" y2="32" stroke="#2D2D3A" strokeWidth="0.8" opacity="0.5" />
      <line x1="52" y1="37" x2="62" y2="38" stroke="#2D2D3A" strokeWidth="0.8" opacity="0.5" />
      {/* Tail */}
      <path d="M60 55 Q72 50 68 38" stroke="#FF8C42" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── fish ─────────────────────────────────────────────────

function PreviewFish() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <ellipse cx="35" cy="40" rx="24" ry="16" fill="#45B7D1" />
      <polygon points="58,40 74,26 74,54" fill="#4ECDC4" />
      <circle cx="24" cy="36" r="3" fill="white" />
      <circle cx="25" cy="35" r="1.5" fill="#2D2D3A" />
      <path d="M18 42 Q24 46 30 42" stroke="#2D2D3A" strokeWidth="1" fill="none" />
      {/* Scales pattern */}
      <path d="M30 32 Q35 28 40 32" stroke="#87CEEB" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M35 38 Q40 34 45 38" stroke="#87CEEB" strokeWidth="1" fill="none" opacity="0.5" />
      {/* Fins */}
      <path d="M30 26 Q35 18 40 26" fill="#4ECDC4" opacity="0.7" />
      <path d="M30 54 Q35 62 40 54" fill="#4ECDC4" opacity="0.7" />
      {/* Bubbles */}
      <circle cx="14" cy="28" r="2" fill="#87CEEB" opacity="0.4" />
      <circle cx="10" cy="22" r="1.5" fill="#87CEEB" opacity="0.3" />
    </svg>
  );
}

// ── letter-a ─────────────────────────────────────────────

function PreviewLetterA() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect x="10" y="10" width="60" height="60" rx="12" fill="#FF6B6B" opacity="0.15" />
      <path d="M22 65 L40 15 L58 65" fill="none" stroke="#FF6B6B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="28" y1="48" x2="52" y2="48" stroke="#FF6B6B" strokeWidth="4" strokeLinecap="round" />
      <circle cx="40" cy="15" r="3" fill="#FFE66D" />
    </svg>
  );
}

// ── letter-b ─────────────────────────────────────────────

function PreviewLetterB() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect x="10" y="10" width="60" height="60" rx="12" fill="#4ECDC4" opacity="0.15" />
      <line x1="25" y1="15" x2="25" y2="65" stroke="#4ECDC4" strokeWidth="5" strokeLinecap="round" />
      <path d="M25 15 Q55 15 55 30 Q55 40 25 40" stroke="#4ECDC4" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M25 40 Q58 40 58 52 Q58 65 25 65" stroke="#4ECDC4" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── number-1 ─────────────────────────────────────────────

function PreviewNumber1() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect x="10" y="10" width="60" height="60" rx="12" fill="#FFE66D" opacity="0.2" />
      <path d="M34 25 L42 15 L42 62" stroke="#E6A817" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="30" y1="62" x2="54" y2="62" stroke="#E6A817" strokeWidth="4" strokeLinecap="round" />
      <circle cx="55" cy="18" r="4" fill="#FFE66D" />
    </svg>
  );
}

// ── number-2 ─────────────────────────────────────────────

function PreviewNumber2() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect x="10" y="10" width="60" height="60" rx="12" fill="#A78BFA" opacity="0.15" />
      <path d="M26 28 Q26 15 40 15 Q54 15 54 28 Q54 40 26 58 L26 64 L54 64" stroke="#A78BFA" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── star ─────────────────────────────────────────────────

function PreviewStar() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <polygon
        points="40,8 48,28 70,30 54,46 58,68 40,56 22,68 26,46 10,30 32,28"
        fill="#FFE66D"
        stroke="#E6A817"
        strokeWidth="2"
      />
      <polygon
        points="40,18 45,30 56,32 48,42 50,54 40,47 30,54 32,42 24,32 35,30"
        fill="#FFF8DC"
        opacity="0.5"
      />
    </svg>
  );
}

// ── heart ────────────────────────────────────────────────

function PreviewHeart() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <path d="M40 70 C40 70 8 50 8 28 C8 16 18 8 28 8 C34 8 38 12 40 16 C42 12 46 8 52 8 C62 8 72 16 72 28 C72 50 40 70 40 70Z" fill="#FF6B6B" />
      <path d="M40 62 C40 62 14 46 14 28 C14 19 22 12 30 12 C34 12 38 15 40 18 C42 15 46 12 50 12 C58 12 66 19 66 28 C66 46 40 62 40 62Z" fill="#FF8FAB" opacity="0.4" />
    </svg>
  );
}

// ── flower ───────────────────────────────────────────────

function PreviewFlower() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect x="38" y="45" width="4" height="25" rx="2" fill="#4CAF50" />
      {/* Leaves */}
      <ellipse cx="32" cy="55" rx="8" ry="4" fill="#66BB6A" transform="rotate(-20, 32, 55)" />
      <ellipse cx="48" cy="58" rx="8" ry="4" fill="#66BB6A" transform="rotate(20, 48, 58)" />
      {/* Petals */}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx={40 + Math.cos((angle * Math.PI) / 180) * 14}
          cy={32 + Math.sin((angle * Math.PI) / 180) * 14}
          rx="8" ry="5"
          fill="#FF8FAB"
          transform={`rotate(${angle}, ${40 + Math.cos((angle * Math.PI) / 180) * 14}, ${32 + Math.sin((angle * Math.PI) / 180) * 14})`}
        />
      ))}
      <circle cx="40" cy="32" r="8" fill="#FFE66D" />
      <circle cx="40" cy="32" r="4" fill="#E6A817" opacity="0.4" />
    </svg>
  );
}

// ── tree ─────────────────────────────────────────────────

function PreviewTree() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect x="35" y="48" width="10" height="22" rx="3" fill="#8B6914" />
      <ellipse cx="40" cy="35" rx="25" ry="22" fill="#4CAF50" />
      <ellipse cx="32" cy="40" rx="16" ry="16" fill="#66BB6A" opacity="0.7" />
      <ellipse cx="48" cy="38" rx="16" ry="16" fill="#43A047" opacity="0.7" />
      {/* Apple */}
      <circle cx="28" cy="30" r="4" fill="#FF6B6B" />
      <rect x="27.5" y="25" width="1" height="3" fill="#8B6914" />
    </svg>
  );
}

// ── smiley ───────────────────────────────────────────────

function PreviewSmiley() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <circle cx="40" cy="40" r="28" fill="#FFE66D" />
      <circle cx="40" cy="40" r="24" fill="#FFF3BD" opacity="0.4" />
      <circle cx="30" cy="34" r="3.5" fill="#2D2D3A" />
      <circle cx="50" cy="34" r="3.5" fill="#2D2D3A" />
      <circle cx="31" cy="33" r="1" fill="white" />
      <circle cx="51" cy="33" r="1" fill="white" />
      <path d="M28 46 Q40 58 52 46" stroke="#2D2D3A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Rosy cheeks */}
      <circle cx="22" cy="42" r="4" fill="#FF8FAB" opacity="0.3" />
      <circle cx="58" cy="42" r="4" fill="#FF8FAB" opacity="0.3" />
    </svg>
  );
}

// ── surprised ────────────────────────────────────────────

function PreviewSurprised() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <circle cx="40" cy="40" r="28" fill="#FFE66D" />
      <circle cx="40" cy="40" r="24" fill="#FFF3BD" opacity="0.4" />
      {/* Big eyes */}
      <ellipse cx="30" cy="33" rx="5" ry="6" fill="white" />
      <ellipse cx="50" cy="33" rx="5" ry="6" fill="white" />
      <circle cx="30" cy="34" r="3" fill="#2D2D3A" />
      <circle cx="50" cy="34" r="3" fill="#2D2D3A" />
      <circle cx="31" cy="33" r="1" fill="white" />
      <circle cx="51" cy="33" r="1" fill="white" />
      {/* Eyebrows raised */}
      <path d="M24 24 Q30 20 36 24" stroke="#2D2D3A" strokeWidth="1.5" fill="none" />
      <path d="M44 24 Q50 20 56 24" stroke="#2D2D3A" strokeWidth="1.5" fill="none" />
      {/* O mouth */}
      <ellipse cx="40" cy="50" rx="5" ry="6" fill="#2D2D3A" />
      <ellipse cx="40" cy="49" rx="3" ry="4" fill="#FF6B6B" opacity="0.4" />
    </svg>
  );
}

// ── Preview map ──────────────────────────────────────────

const previewMap: Record<string, () => ReactNode> = {
  'cat': PreviewCat,
  'fish': PreviewFish,
  'letter-a': PreviewLetterA,
  'letter-b': PreviewLetterB,
  'number-1': PreviewNumber1,
  'number-2': PreviewNumber2,
  'star': PreviewStar,
  'heart': PreviewHeart,
  'flower': PreviewFlower,
  'tree': PreviewTree,
  'smiley': PreviewSmiley,
  'surprised': PreviewSurprised,
};

/**
 * Get the colorful SVG preview for a coloring template.
 * Returns the preview element or null if none exists.
 */
export function getColoringPreview(templateId: string): ReactNode | null {
  const Preview = previewMap[templateId];
  return Preview ? <Preview /> : null;
}
