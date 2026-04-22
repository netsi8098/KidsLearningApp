/**
 * CategoryIcons — Small inline SVG icons for filter chips.
 * Replaces OS emoji in story and coloring category filters.
 * Each icon is 1em height for inline text integration.
 */
import { type ReactNode } from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

// ── Story categories ──────────────────────────────────────

function AdventureIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M3 13 L8 2 L13 13Z" fill="#FF8C42" opacity="0.8" />
      <circle cx="8" cy="6" r="1.5" fill="#FFE66D" />
      <path d="M6 10 L8 7 L10 10" stroke="white" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

function AnimalsIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <ellipse cx="8" cy="10" rx="4" ry="3.5" fill="#8B6914" opacity="0.7" />
      <ellipse cx="5" cy="5.5" rx="2" ry="2.5" fill="#8B6914" opacity="0.7" />
      <ellipse cx="8" cy="4" rx="2" ry="2.5" fill="#8B6914" opacity="0.7" />
      <ellipse cx="11" cy="5.5" rx="2" ry="2.5" fill="#8B6914" opacity="0.7" />
    </svg>
  );
}

function BedtimeIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="7" cy="8" r="5" fill="#FFE66D" />
      <circle cx="9.5" cy="6.5" r="5" fill="#1A1040" />
      <circle cx="13" cy="4" r="1" fill="#FFE66D" opacity="0.6" />
      <circle cx="12" cy="8" r="0.7" fill="#FFE66D" opacity="0.4" />
    </svg>
  );
}

function FriendshipIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M8 14 C8 14 2 10 2 6 C2 3.5 4 2 6 2 C7 2 7.5 2.5 8 3.5 C8.5 2.5 9 2 10 2 C12 2 14 3.5 14 6 C14 10 8 14 8 14Z" fill="#FF8FAB" />
    </svg>
  );
}

function NatureIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <ellipse cx="8" cy="6" rx="5" ry="4" fill="#6BCB77" />
      <rect x="7.2" y="9" width="1.6" height="5" rx="0.8" fill="#4CAF50" />
      <ellipse cx="5" cy="7" rx="3" ry="3" fill="#A8E6CF" opacity="0.5" />
    </svg>
  );
}

// ── Coloring categories ───────────────────────────────────

function AlphabetIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="2.5" fill="#A78BFA" opacity="0.2" />
      <text x="8" y="12" textAnchor="middle" fill="#A78BFA" fontSize="10" fontWeight="bold" fontFamily="sans-serif">A</text>
    </svg>
  );
}

function NumbersIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="2.5" fill="#4ECDC4" opacity="0.2" />
      <text x="8" y="12" textAnchor="middle" fill="#4ECDC4" fontSize="10" fontWeight="bold" fontFamily="sans-serif">1</text>
    </svg>
  );
}

function HolidaysIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <polygon points="8,1 9.5,5.5 14,6 10.5,9 11.5,14 8,11.5 4.5,14 5.5,9 2,6 6.5,5.5" fill="#FFE66D" />
    </svg>
  );
}

function EmotionsIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="6" fill="#FFE66D" />
      <circle cx="6" cy="6.5" r="1" fill="#2D2D3A" />
      <circle cx="10" cy="6.5" r="1" fill="#2D2D3A" />
      <path d="M5.5 10 Q8 12.5 10.5 10" stroke="#2D2D3A" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── Lookup maps ───────────────────────────────────────────

const storyCategoryIcons: Record<string, (props: IconProps) => ReactNode> = {
  adventure: AdventureIcon,
  animals: AnimalsIcon,
  bedtime: BedtimeIcon,
  friendship: FriendshipIcon,
  nature: NatureIcon,
};

function VehiclesIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="6" width="12" height="6" rx="2" fill="#FF8C42" opacity="0.7" />
      <circle cx="5" cy="13" r="1.5" fill="#2D2D3A" opacity="0.6" />
      <circle cx="11" cy="13" r="1.5" fill="#2D2D3A" opacity="0.6" />
      <rect x="4" y="3" width="8" height="4" rx="1.5" fill="#45B7D1" opacity="0.5" />
    </svg>
  );
}

function FantasyIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <polygon points="8,1 10,6 16,6 11,9.5 13,15 8,11.5 3,15 5,9.5 0,6 6,6" fill="#A78BFA" opacity="0.6" />
    </svg>
  );
}

function PatternsIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="#4ECDC4" strokeWidth="1.2" opacity="0.6" fill="none" />
      <circle cx="8" cy="8" r="3" stroke="#FF8FAB" strokeWidth="1.2" opacity="0.5" fill="none" />
      <line x1="8" y1="2" x2="8" y2="14" stroke="#FFE66D" strokeWidth="0.8" opacity="0.4" />
      <line x1="2" y1="8" x2="14" y2="8" stroke="#FFE66D" strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

function FoodIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M4 10Q8 4 12 10Q12 14 8 14Q4 14 4 10Z" fill="#FF8FAB" opacity="0.6" />
      <circle cx="8" cy="8" r="2" fill="#FF6B6B" opacity="0.5" />
      <rect x="7" y="2" width="2" height="4" rx="1" fill="#FFE66D" opacity="0.6" />
    </svg>
  );
}

const coloringCategoryIcons: Record<string, (props: IconProps) => ReactNode> = {
  animals: AnimalsIcon,
  vehicles: VehiclesIcon,
  nature: NatureIcon,
  fantasy: FantasyIcon,
  food: FoodIcon,
  alphabet: AlphabetIcon,
  numbers: NumbersIcon,
  holidays: HolidaysIcon,
  emotions: EmotionsIcon,
  patterns: PatternsIcon,
};

/**
 * Get a story category icon. Returns the icon element or null.
 */
export function getStoryCategoryIcon(category: string, size = 16): ReactNode | null {
  const Icon = storyCategoryIcons[category];
  return Icon ? <Icon size={size} /> : null;
}

/**
 * Get a coloring category icon. Returns the icon element or null.
 */
export function getColoringCategoryIcon(category: string, size = 16): ReactNode | null {
  const Icon = coloringCategoryIcons[category];
  return Icon ? <Icon size={size} /> : null;
}
