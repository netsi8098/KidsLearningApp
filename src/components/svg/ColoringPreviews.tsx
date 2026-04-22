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
  // New Batch 2F templates — use colored outline style previews
  'bunny-garden': () => <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className="w-full h-full"><ellipse cx="40" cy="45" rx="14" ry="12" fill="#F5F5F5"/><circle cx="40" cy="33" r="10" fill="#F5F5F5"/><ellipse cx="36" cy="22" rx="3" ry="10" fill="#FFB6C1" opacity="0.4"/><ellipse cx="44" cy="22" rx="3" ry="10" fill="#FFB6C1" opacity="0.4"/><circle cx="37" cy="32" r="1.5" fill="#2D2D3A"/><circle cx="43" cy="32" r="1.5" fill="#2D2D3A"/><circle cx="22" cy="60" r="5" fill="#FF8FAB" opacity="0.5"/><circle cx="58" cy="58" r="4" fill="#FFE66D" opacity="0.5"/><ellipse cx="40" cy="72" rx="35" ry="8" fill="#A8E6CF" opacity="0.4"/></svg>,
  'elephant': () => <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className="w-full h-full"><ellipse cx="44" cy="42" rx="22" ry="16" fill="#B0BEC5"/><circle cx="28" cy="32" r="12" fill="#B0BEC5"/><path d="M22 40Q18 52 22 58Q25 60 27 56Q28 50 26 42" fill="#90A4AE" opacity="0.6"/><circle cx="24" cy="30" r="2" fill="#2D2D3A"/><rect x="30" y="55" width="5" height="12" rx="2" fill="#90A4AE"/><rect x="40" y="55" width="5" height="12" rx="2" fill="#90A4AE"/><rect x="50" y="55" width="5" height="12" rx="2" fill="#90A4AE"/></svg>,
  'butterfly-scene': () => <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className="w-full h-full"><ellipse cx="40" cy="30" rx="1.5" ry="8" fill="#2D2D3A"/><ellipse cx="30" cy="26" rx="10" ry="7" fill="#A78BFA" opacity="0.7"/><ellipse cx="50" cy="26" rx="10" ry="7" fill="#FF8FAB" opacity="0.7"/><ellipse cx="32" cy="36" rx="7" ry="5" fill="#8B5CF6" opacity="0.5"/><ellipse cx="48" cy="36" rx="7" ry="5" fill="#FF6B6B" opacity="0.5"/><rect x="20" y="55" width="1.5" height="12" fill="#4CAF50"/><circle cx="21" cy="52" r="4" fill="#FFE66D" opacity="0.6"/><rect x="55" y="52" width="1.5" height="15" fill="#4CAF50"/><circle cx="56" cy="49" r="5" fill="#FF8FAB" opacity="0.5"/></svg>,
  'turtle': () => <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className="w-full h-full"><ellipse cx="40" cy="42" rx="22" ry="14" fill="#6BCB77"/><circle cx="22" cy="38" r="8" fill="#7DD88A"/><circle cx="20" cy="36" r="2" fill="#2D2D3A"/><path d="M40 32Q32 26 24 32" fill="none" stroke="#4CAF50" strokeWidth="2"/><path d="M40 32Q48 26 56 32" fill="none" stroke="#4CAF50" strokeWidth="2"/><ellipse cx="28" cy="54" rx="5" ry="3" fill="#7DD88A" opacity="0.7"/><ellipse cx="52" cy="54" rx="5" ry="3" fill="#7DD88A" opacity="0.7"/></svg>,
  'rocket-ship': () => <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className="w-full h-full"><path d="M40 8Q34 18 32 32L32 55Q32 60 36 62L44 62Q48 60 48 55L48 32Q46 18 40 8Z" fill="#FF6B6B" opacity="0.8"/><circle cx="40" cy="35" r="5" fill="#45B7D1" opacity="0.6"/><path d="M32 48L24 58L32 54" fill="#FF8C42" opacity="0.6"/><path d="M48 48L56 58L48 54" fill="#FF8C42" opacity="0.6"/><path d="M37 62Q39 68 40 70Q41 68 43 62" fill="#FFD93D" opacity="0.7"/></svg>,
  'sailboat': () => <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className="w-full h-full"><path d="M20 52L40 52L60 52L54 65L26 65Z" fill="#8B6914" opacity="0.5"/><line x1="40" y1="52" x2="40" y2="18" stroke="#5D4037" strokeWidth="2"/><path d="M40 18L60 48L40 48Z" fill="#FF6B6B" opacity="0.4"/><path d="M40 24L24 48L40 48Z" fill="#FFE66D" opacity="0.4"/><path d="M5 70Q25 64 40 70Q55 76 75 70" stroke="#45B7D1" strokeWidth="2" opacity="0.4" fill="none"/></svg>,
  'train': () => <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className="w-full h-full"><rect x="8" y="30" width="30" height="24" rx="3" fill="#FF6B6B" opacity="0.6"/><rect x="42" y="38" width="18" height="16" rx="2" fill="#4ECDC4" opacity="0.5"/><rect x="64" y="38" width="12" height="16" rx="2" fill="#FFD93D" opacity="0.5"/><circle cx="18" cy="58" r="5" fill="#2D2D3A" opacity="0.4"/><circle cx="32" cy="58" r="5" fill="#2D2D3A" opacity="0.4"/><circle cx="51" cy="58" r="4" fill="#2D2D3A" opacity="0.3"/><circle cx="70" cy="58" r="4" fill="#2D2D3A" opacity="0.3"/><path d="M13 30L13 20Q13 16 17 16L22 16Q25 16 25 20L25 30" fill="#90A4AE" opacity="0.4"/></svg>,
  'treehouse': () => <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className="w-full h-full"><rect x="35" y="35" width="10" height="35" fill="#8B6914" opacity="0.5"/><ellipse cx="40" cy="25" rx="22" ry="18" fill="#4CAF50" opacity="0.5"/><rect x="26" y="24" width="16" height="12" rx="2" fill="#8B6914" opacity="0.6"/><rect x="29" y="27" width="4" height="6" fill="#45B7D1" opacity="0.4"/><rect x="35" y="27" width="4" height="6" fill="#45B7D1" opacity="0.4"/><path d="M24 24L34 16L44 24" fill="#FF6B6B" opacity="0.4"/></svg>,
  'rainbow-scene': () => <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className="w-full h-full"><path d="M10 58A30 30 0 0 1 70 58" stroke="#FF6B6B" strokeWidth="4" opacity="0.6" fill="none"/><path d="M15 58A25 25 0 0 1 65 58" stroke="#FFD93D" strokeWidth="4" opacity="0.5" fill="none"/><path d="M20 58A20 20 0 0 1 60 58" stroke="#6BCB77" strokeWidth="4" opacity="0.5" fill="none"/><path d="M25 58A15 15 0 0 1 55 58" stroke="#45B7D1" strokeWidth="4" opacity="0.5" fill="none"/><circle cx="65" cy="18" r="8" fill="#FFE66D" opacity="0.4"/><ellipse cx="40" cy="70" rx="38" ry="6" fill="#A8E6CF" opacity="0.4"/></svg>,
  'ocean-scene': () => <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className="w-full h-full"><rect width="80" height="80" fill="#87CEEB" opacity="0.15"/><ellipse cx="28" cy="35" rx="12" ry="6" fill="#FF8C42" opacity="0.5"/><polygon points="40,35 50,28 50,42" fill="#FF8C42" opacity="0.4"/><circle cx="22" cy="33" r="2" fill="#2D2D3A" opacity="0.5"/><ellipse cx="58" cy="52" rx="8" ry="4" fill="#45B7D1" opacity="0.5"/><path d="M14 62Q18 55 22 62Q26 69 30 62" stroke="#4CAF50" strokeWidth="2" opacity="0.4" fill="none"/><path d="M50 65Q54 58 58 65Q62 72 66 65" stroke="#4CAF50" strokeWidth="2" opacity="0.3" fill="none"/></svg>,
  'castle': () => <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className="w-full h-full"><rect x="20" y="32" width="40" height="38" fill="#E0E0E0" opacity="0.4"/><rect x="12" y="24" width="10" height="46" fill="#BDBDBD" opacity="0.4"/><rect x="58" y="24" width="10" height="46" fill="#BDBDBD" opacity="0.4"/><polygon points="12,24 17,12 22,24" fill="#FF6B6B" opacity="0.4"/><polygon points="58,24 63,12 68,24" fill="#FF6B6B" opacity="0.4"/><polygon points="20,32 40,20 60,32" fill="#A78BFA" opacity="0.3"/><rect x="34" y="52" width="12" height="18" rx="6" fill="#8B6914" opacity="0.4"/></svg>,
  'unicorn': () => <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className="w-full h-full"><ellipse cx="44" cy="42" rx="20" ry="14" fill="#F5F5F5"/><circle cx="24" cy="32" r="10" fill="#F5F5F5"/><line x1="22" y1="22" x2="20" y2="10" stroke="#FFD93D" strokeWidth="2"/><polygon points="18,12 20,5 23,11" fill="#FFD93D" opacity="0.6"/><circle cx="20" cy="30" r="2" fill="#2D2D3A"/><path d="M62 40Q68 38 66 44Q64 48 60 42" fill="#FF8FAB" opacity="0.5"/><rect x="30" y="54" width="4" height="12" rx="2" fill="#BDBDBD" opacity="0.5"/><rect x="40" y="54" width="4" height="12" rx="2" fill="#BDBDBD" opacity="0.5"/><rect x="50" y="54" width="4" height="12" rx="2" fill="#BDBDBD" opacity="0.5"/></svg>,
  'dragon': () => <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className="w-full h-full"><ellipse cx="44" cy="44" rx="18" ry="14" fill="#6BCB77" opacity="0.5"/><circle cx="26" cy="34" r="10" fill="#6BCB77" opacity="0.6"/><circle cx="22" cy="32" r="2" fill="#2D2D3A"/><circle cx="29" cy="32" r="2" fill="#2D2D3A"/><path d="M20 28L16 20L21 26" fill="#6BCB77" opacity="0.5"/><path d="M32 28L35 20L30 26" fill="#6BCB77" opacity="0.5"/><path d="M60 40Q66 38 68 42Q66 44 62 42" fill="#FF6B6B" opacity="0.4"/><rect x="34" y="56" width="5" height="10" rx="2" fill="#4CAF50" opacity="0.4"/><rect x="44" y="56" width="5" height="10" rx="2" fill="#4CAF50" opacity="0.4"/></svg>,
  'mandala-simple': () => <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className="w-full h-full"><circle cx="40" cy="40" r="32" stroke="#A78BFA" strokeWidth="1.5" opacity="0.5"/><circle cx="40" cy="40" r="22" stroke="#FF8FAB" strokeWidth="1.5" opacity="0.4"/><circle cx="40" cy="40" r="12" stroke="#4ECDC4" strokeWidth="1.5" opacity="0.5"/><circle cx="40" cy="40" r="4" fill="#FFE66D" opacity="0.4"/>{[0,45,90,135,180,225,270,315].map(a=><circle key={a} cx={40+22*Math.cos(a*Math.PI/180)} cy={40+22*Math.sin(a*Math.PI/180)} r="3" fill="#A78BFA" opacity="0.3"/>)}</svg>,
  'hearts-pattern': () => <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className="w-full h-full"><path d="M40 28C40 23 45 20 48 20C52 20 56 23 56 28C56 38 40 44 40 44C40 44 24 38 24 28C24 23 28 20 32 20C36 20 40 23 40 28Z" fill="#FF6B6B" opacity="0.5"/><path d="M22 55C22 52 24 50 26 50C28 50 30 52 30 55C30 60 22 63 22 63C22 63 14 60 14 55C14 52 16 50 18 50C20 50 22 52 22 55Z" fill="#FF8FAB" opacity="0.4"/><path d="M58 55C58 52 60 50 62 50C64 50 66 52 66 55C66 60 58 63 58 63C58 63 50 60 50 55C50 52 52 50 54 50C56 50 58 52 58 55Z" fill="#A78BFA" opacity="0.4"/></svg>,
  'birthday-cake': () => <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className="w-full h-full"><rect x="18" y="38" width="44" height="20" rx="3" fill="#FF8FAB" opacity="0.5"/><rect x="14" y="55" width="52" height="14" rx="3" fill="#A78BFA" opacity="0.4"/><path d="M18 38Q40 32 62 38" stroke="#FFE66D" strokeWidth="2" opacity="0.5" fill="none"/><line x1="30" y1="38" x2="30" y2="28" stroke="#FFD93D" strokeWidth="1.5"/><line x1="40" y1="38" x2="40" y2="26" stroke="#FFD93D" strokeWidth="1.5"/><line x1="50" y1="38" x2="50" y2="28" stroke="#FFD93D" strokeWidth="1.5"/><path d="M28 28Q30 23 32 28" fill="#FF8C42" opacity="0.5"/><path d="M38 26Q40 21 42 26" fill="#FF8C42" opacity="0.5"/><path d="M48 28Q50 23 52 28" fill="#FF8C42" opacity="0.5"/></svg>,
  'snowman': () => <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className="w-full h-full"><circle cx="40" cy="54" r="16" fill="#E0E0E0" opacity="0.5"/><circle cx="40" cy="34" r="12" fill="#E0E0E0" opacity="0.5"/><circle cx="40" cy="18" r="8" fill="#E0E0E0" opacity="0.5"/><circle cx="37" cy="16" r="1.5" fill="#2D2D3A"/><circle cx="43" cy="16" r="1.5" fill="#2D2D3A"/><path d="M38 20L40 22L42 20" fill="#FF8C42" opacity="0.6"/><line x1="28" y1="34" x2="16" y2="28" stroke="#5D4037" strokeWidth="1.5"/><line x1="52" y1="34" x2="64" y2="28" stroke="#5D4037" strokeWidth="1.5"/><circle cx="40" cy="36" r="1.5" fill="#2D2D3A" opacity="0.5"/><circle cx="40" cy="42" r="1.5" fill="#2D2D3A" opacity="0.5"/></svg>,
};

/**
 * Get the colorful SVG preview for a coloring template.
 * Returns the preview element or null if none exists.
 */
export function getColoringPreview(templateId: string): ReactNode | null {
  const Preview = previewMap[templateId];
  return Preview ? <Preview /> : null;
}
