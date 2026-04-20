/**
 * CommonIcons — Small inline SVG icons replacing OS emojis throughout the app.
 * Each icon is 1em height by default so it sits inline with text.
 */

interface IconProps {
  size?: number;
  className?: string;
}

export function CheckIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <circle cx="10" cy="10" r="9" fill="#4CAF50" />
      <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HeartIcon({ size = 18, className, filled = true }: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={filled ? '#FF6B6B' : 'none'} stroke="#FF6B6B" strokeWidth="1.5" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M10 17S2 12 2 7C2 4 4.5 2 7 2C8.5 2 9.5 3 10 4.5C10.5 3 11.5 2 13 2C15.5 2 18 4 18 7C18 12 10 17 10 17Z" />
    </svg>
  );
}

export function StarIconSm({ size = 18, className, filled = true }: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M10 2L12.5 7.5L18 8L14 12L15 17.5L10 14.5L5 17.5L6 12L2 8L7.5 7.5Z" fill={filled ? '#FFD93D' : 'none'} stroke={filled ? '#F59E0B' : '#D1D5DB'} strokeWidth="1.2" />
    </svg>
  );
}

export function FlameIconSm({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M9 1C9 1 14 5.5 14 10C14 13 12 16 9 16C6 16 4 13 4 10C4 7.5 5.5 5.5 7 4.5C7 6.5 8 7.5 9 6.5C9 4.5 9 1 9 1Z" fill="#FF6B6B" stroke="#EF4444" strokeWidth="0.8" />
      <path d="M9 9C9 9 11 11 11 12.5C11 13.8 10.1 15 9 15C7.9 15 7 13.8 7 12.5C7 11 9 9 9 9Z" fill="#FFE66D" />
    </svg>
  );
}

export function MoonIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M14 3C8 3 4 7 4 12C4 17 8 19 13 18C9 16 7 13 8 9C9 5 12 3.5 16 3.5C16 3 15 3 14 3Z" fill="#FFE66D" stroke="#F59E0B" strokeWidth="1" />
      <circle cx="16" cy="6" r="1" fill="#FFE66D" /><circle cx="17" cy="10" r="0.8" fill="#FFE66D" />
    </svg>
  );
}

export function SunIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <circle cx="10" cy="10" r="4" fill="#FFE66D" stroke="#F59E0B" strokeWidth="1.2" />
      <path d="M10 2V4M10 16V18M2 10H4M16 10H18M4.5 4.5L6 6M14 14L15.5 15.5M4.5 15.5L6 14M14 6L15.5 4.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function BookIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M3 4C3 4 6 3 10 3C14 3 17 4 17 4V16C17 16 14 15 10 15C6 15 3 16 3 16V4Z" fill="#A78BFA" fillOpacity="0.2" stroke="#A78BFA" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="10" y1="3" x2="10" y2="15" stroke="#A78BFA" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

export function HeadphonesIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M4 11V10C4 6 6.5 3 10 3C13.5 3 16 6 16 10V11" stroke="#4ECDC4" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="2" y="11" width="4" height="6" rx="2" fill="#4ECDC4" fillOpacity="0.3" stroke="#4ECDC4" strokeWidth="1.2" />
      <rect x="14" y="11" width="4" height="6" rx="2" fill="#4ECDC4" fillOpacity="0.3" stroke="#4ECDC4" strokeWidth="1.2" />
    </svg>
  );
}

export function TrophyIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M6 3H14V9C14 12 12 14 10 14C8 14 6 12 6 9V3Z" fill="#FFD93D" stroke="#F59E0B" strokeWidth="1.2" />
      <path d="M6 5H3C3 5 3 9 6 9" stroke="#F59E0B" strokeWidth="1.2" fill="none" />
      <path d="M14 5H17C17 5 17 9 14 9" stroke="#F59E0B" strokeWidth="1.2" fill="none" />
      <rect x="8" y="14" width="4" height="2" fill="#F59E0B" /><rect x="6" y="16" width="8" height="2" rx="1" fill="#F59E0B" />
    </svg>
  );
}

export function SearchIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <circle cx="8.5" cy="8.5" r="5.5" stroke="#9B9BAB" strokeWidth="1.8" />
      <line x1="13" y1="13" x2="17" y2="17" stroke="#9B9BAB" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function WarningIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M10 2L18 17H2L10 2Z" fill="#FF8C42" stroke="#E67E22" strokeWidth="1.2" strokeLinejoin="round" />
      <line x1="10" y1="7" x2="10" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="14.5" r="1" fill="white" />
    </svg>
  );
}

export function PartyIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M3 17L8 4" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 4C8 4 12 6 14 10C16 14 15 17 15 17" stroke="#FF6B6B" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="3" r="1.5" fill="#FFE66D" /><circle cx="16" cy="6" r="1" fill="#4ECDC4" /><circle cx="17" cy="11" r="1.2" fill="#FF8FAB" />
    </svg>
  );
}

export function TimerIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <circle cx="10" cy="11" r="7" stroke="#6B6B7B" strokeWidth="1.5" />
      <path d="M10 7V11L13 13" stroke="#6B6B7B" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 2H12" stroke="#6B6B7B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function GlobeIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <circle cx="10" cy="10" r="8" fill="#45B7D1" fillOpacity="0.2" stroke="#45B7D1" strokeWidth="1.5" />
      <ellipse cx="10" cy="10" rx="4" ry="8" stroke="#45B7D1" strokeWidth="1" opacity="0.5" />
      <line x1="2" y1="10" x2="18" y2="10" stroke="#45B7D1" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

export function BrainIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <ellipse cx="10" cy="10" rx="8" ry="7" fill="#FF8FAB" fillOpacity="0.3" stroke="#FF8FAB" strokeWidth="1.5" />
      <path d="M7 8C7 6 9 5 10 6.5C11 5 13 6 13 8" stroke="#FF8FAB" strokeWidth="1" fill="none" />
      <line x1="10" y1="5" x2="10" y2="15" stroke="#FF8FAB" strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

export function PlayBtnIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <circle cx="10" cy="10" r="8" fill="#4ECDC4" fillOpacity="0.2" stroke="#4ECDC4" strokeWidth="1.5" />
      <path d="M8 6L15 10L8 14Z" fill="#4ECDC4" />
    </svg>
  );
}
